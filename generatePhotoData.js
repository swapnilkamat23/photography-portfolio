import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import fsExtra from 'fs-extra';
import { imageSize } from 'image-size';

/**
 * Sanitizes a string for use in a file name by replacing spaces and parentheses with underscores.
 * It also converts the name to lowercase and ensures no multiple underscores exist.
 * @param {string} name - The category or event name.
 * @returns {string} The sanitized name.
 */
const sanitizeName = (name) => {
    if (!name) return '';
    return name
        .toLowerCase()
        .replace(/[\s()]+/g, '_') // Replace spaces and parentheses with underscore
        .replace(/_+/g, '_') // Replace multiple underscores with a single one
        .trim();
};

/**
 * Generates a unique, reproducible ID for a photo based on its path components.
 * @param {string} category
 * @param {string} event
 * @param {string} originalFileNameWithoutExt
 * @returns {string}
 */
const getPhotoId = (category, event, originalFileNameWithoutExt) => {
    return `${sanitizeName(category)}_${sanitizeName(event)}_${sanitizeName(originalFileNameWithoutExt)}`;
};

// 💡 CHANGE 1: Expanded list of allowed extensions (all lowercase)
const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png'];

/**
 * Main function to generate photo data, processing only new or modified files (delta).
 */
async function generatePhotoData() {
    // --- Configuration ---
    const rootDir = process.cwd();
    const sourceImageDir = path.join(rootDir, 'src', 'assets', 'images');
    const outputResizedDir = path.join(rootDir, 'src', 'assets', 'resized');
    const outputDataFilePath = path.join(rootDir, 'src', 'photoData.json');
    const cacheFilePath = path.join(rootDir, 'processing_cache.json'); // New cache file location

    // Public path prefix used in the React components
    const publicPathPrefix = '/src/assets/resized/';

    const targetWidths = [1080, 640, 384, 256, 128, 96, 64, 48];

    console.log('Starting photo data generation (Delta mode)...');

    // --- Cache Management ---
    let oldCache = {};
    try {
        if (fs.existsSync(cacheFilePath)) {
            oldCache = JSON.parse(fs.readFileSync(cacheFilePath, 'utf8'));
            console.log(`Loaded cache with ${Object.keys(oldCache).length} entries.`);
        }
    } catch (e) {
        console.warn('Could not load old cache, starting fresh processing.');
        oldCache = {};
    }

    const newCache = {};
    const photosArray = [];
    const filesToKeep = new Set();
    let processedCount = 0;
    let skippedCount = 0;

    await fsExtra.ensureDir(outputResizedDir);
    // NOTE: We no longer emptyDir here, cleanup is handled by deletion logic.

    const traverseDirectories = async (currentDir, category = '', event = '') => {
        const items = fs.readdirSync(currentDir);

        for (const item of items) {
            const fullPath = path.join(currentDir, item);
            const stats = fs.statSync(fullPath);

            if (stats.isDirectory()) {
                if (currentDir === sourceImageDir) {
                    await traverseDirectories(fullPath, item);
                } else if (category && !event) {
                    await traverseDirectories(fullPath, category, item);
                }
            } else if (stats.isFile() && category && event) {

                // 💡 CHANGE 2: Case-insensitive extension check
                const ext = path.extname(item).toLowerCase();

                if (!ALLOWED_EXTENSIONS.includes(ext)) {
                    // Skip files that are not valid images (e.g., .DS_Store, .ini, etc.)
                    continue;
                }

                const originalFileNameWithoutExt = path.parse(item).name;
                const photoId = getPhotoId(category, event, originalFileNameWithoutExt);
                const isCached = !!oldCache[photoId];

                const originalStats = fs.statSync(fullPath);
                const isModified = isCached
                    ? (originalStats.mtimeMs !== oldCache[photoId].mtimeMs || originalStats.size !== oldCache[photoId].size)
                    : true;

                let photoEntry = {};

                if (isCached && !isModified) {
                    // --- 💡 DELTA SKIP ---
                    photoEntry = oldCache[photoId].photoEntry;
                    newCache[photoId] = oldCache[photoId];
                    skippedCount++;

                } else {
                    // --- 💡 DELTA PROCESS (New or Modified) ---
                    console.log(`Processing: ${path.join(category, event, item)}`);
                    processedCount++;

                    // If modified, clean up old resized files first
                    if (isModified && oldCache[photoId] && oldCache[photoId].processedFiles) {
                        for (const fileName of oldCache[photoId].processedFiles) {
                            try {
                                await fsExtra.remove(path.join(outputResizedDir, fileName));
                            } catch (e) {
                                // Ignore if file doesn't exist anymore
                            }
                        }
                    }

                    const sanitizedBaseName = getPhotoId(category, event, originalFileNameWithoutExt);
                    const resizedFileNameBase = sanitizedBaseName;

                    try {
                        const originalDimensions = imageSize(fs.readFileSync(fullPath));
                        const originalWidth = originalDimensions.width;

                        // Use the original extension for the full-width file path
                        const finalFullWidthName = `${resizedFileNameBase}-${originalWidth}w${ext}`;

                        photoEntry = {
                            src: path.join(publicPathPrefix, finalFullWidthName).replace(/\\/g, '/'),
                            width: originalWidth,
                            height: originalDimensions.height,
                            category: category,
                            event: event,
                            srcSet: [],
                        };

                        const imagePromises = [];
                        const cacheFileNames = [];

                        const widthsToProcess = Array.from(new Set([...targetWidths, originalWidth])).sort((a, b) => a - b);

                        // Determine the sharp output format and compression based on the input extension
                        const isPng = ext === '.png';

                        for (const width of widthsToProcess) {
                            if (width <= originalWidth) {
                                // Keep output extension the same as input for simplicity and transparency support
                                const resizedFileName = `${resizedFileNameBase}-${width}w${ext}`;
                                const resizedFilePath = path.join(outputResizedDir, resizedFileName);
                                cacheFileNames.push(resizedFileName);

                                let sharpPipeline = sharp(fullPath).resize({ width: width });

                                if (isPng) {
                                    // PNG output: use lossless compression
                                    sharpPipeline = sharpPipeline.png({ compressionLevel: 9 });
                                } else {
                                    // JPEG/JPG/JPEG output: use lossy compression
                                    sharpPipeline = sharpPipeline.jpeg({
                                        quality: width > 256 ? 85 :
                                            width > 96 ? 75 :
                                                60
                                    });
                                }


                                const promise = sharpPipeline
                                    .toFile(resizedFilePath)
                                    .then(() => {
                                        const height = Math.round(originalDimensions.height * (width / originalWidth));

                                        if (width !== originalWidth) {
                                            photoEntry.srcSet.push({
                                                src: path.join(publicPathPrefix, resizedFileName).replace(/\\/g, '/'),
                                                width: width,
                                                height: height,
                                            });
                                        }
                                    });
                                imagePromises.push(promise);
                            }
                        }

                        await Promise.all(imagePromises);
                        photoEntry.srcSet.sort((a, b) => a.width - b.width);

                        // Update the cache entry
                        newCache[photoId] = {
                            mtimeMs: originalStats.mtimeMs,
                            size: originalStats.size,
                            processedFiles: cacheFileNames,
                            photoEntry: photoEntry,
                        };

                    } catch (e) {
                        console.error(`Could not process file: ${fullPath}. Error: ${e.message}`);
                        continue; // Skip to next item
                    }
                }

                // Add to the final array and mark resized files for keeping
                photosArray.push(photoEntry);
                newCache[photoId].processedFiles.forEach(fileName => filesToKeep.add(fileName));
            }
        }
    };

    await traverseDirectories(sourceImageDir);

    // --- 3. DELTA CLEANUP (Deleting files for deleted source images) ---
    const allResizedFiles = await fsExtra.readdir(outputResizedDir);
    let deletedResizedCount = 0;

    for (const fileName of allResizedFiles) {
        if (!filesToKeep.has(fileName)) {
            await fsExtra.remove(path.join(outputResizedDir, fileName));
            deletedResizedCount++;
        }
    }

    // --- 4. Final Writes ---
    fs.writeFileSync(outputDataFilePath, JSON.stringify(photosArray, null, 2));
    fs.writeFileSync(cacheFilePath, JSON.stringify(newCache, null, 2));


    console.log(`\n✅ Delta Processing Complete!`);
    console.log(`   Processed (New/Modified): ${processedCount}`);
    console.log(`   Skipped (Unchanged): ${skippedCount}`);
    console.log(`   Deleted Resized Files (Cleanup): ${deletedResizedCount}`);
    console.log(`   Total Photos in Data File: ${photosArray.length}`);
}

generatePhotoData();



// import fs from 'fs';
// import path from 'path';
// import sharp from 'sharp';
// import fsExtra from 'fs-extra';
// import { imageSize } from 'image-size';

// /**
//  * Sanitizes a string for use in a file name by replacing spaces and parentheses with underscores.
//  * It also converts the name to lowercase and ensures no multiple underscores exist.
//  * @param {string} name - The category or event name.
//  * @returns {string} The sanitized name.
//  */
// const sanitizeName = (name) => {
//     if (!name) return '';
//     return name
//         .toLowerCase()
//         .replace(/[\s()]+/g, '_') // Replace spaces and parentheses with underscore
//         .replace(/_+/g, '_') // Replace multiple underscores with a single one
//         .trim();
// };

// /**
//  * Generates a unique, reproducible ID for a photo based on its path components.
//  * @param {string} category
//  * @param {string} event
//  * @param {string} originalFileNameWithoutExt
//  * @returns {string}
//  */
// const getPhotoId = (category, event, originalFileNameWithoutExt) => {
//     return `${sanitizeName(category)}_${sanitizeName(event)}_${sanitizeName(originalFileNameWithoutExt)}`;
// };

// /**
//  * Main function to generate photo data, processing only new or modified files (delta).
//  */
// async function generatePhotoData() {
//     // --- Configuration ---
//     const rootDir = process.cwd();
//     const sourceImageDir = path.join(rootDir, 'src', 'assets', 'images');
//     const outputResizedDir = path.join(rootDir, 'src', 'assets', 'resized');
//     const outputDataFilePath = path.join(rootDir, 'src', 'photoData.json');
//     const cacheFilePath = path.join(rootDir, 'processing_cache.json'); // New cache file location

//     // Public path prefix used in the React components
//     const publicPathPrefix = '/src/assets/resized/';

//     const targetWidths = [1080, 640, 384, 256, 128, 96, 64, 48];

//     console.log('Starting photo data generation (Delta mode)...');

//     // --- Cache Management ---
//     let oldCache = {};
//     try {
//         if (fs.existsSync(cacheFilePath)) {
//             oldCache = JSON.parse(fs.readFileSync(cacheFilePath, 'utf8'));
//             console.log(`Loaded cache with ${Object.keys(oldCache).length} entries.`);
//         }
//     } catch (e) {
//         console.warn('Could not load old cache, starting fresh processing.');
//         oldCache = {};
//     }

//     const newCache = {};
//     const photosArray = [];
//     const filesToKeep = new Set();
//     let processedCount = 0;
//     let skippedCount = 0;

//     await fsExtra.ensureDir(outputResizedDir);
//     // NOTE: We no longer emptyDir here, cleanup is handled by deletion logic.

//     const traverseDirectories = async (currentDir, category = '', event = '') => {
//         const items = fs.readdirSync(currentDir);

//         for (const item of items) {
//             const fullPath = path.join(currentDir, item);
//             const stats = fs.statSync(fullPath);

//             if (stats.isDirectory()) {
//                 if (currentDir === sourceImageDir) {
//                     await traverseDirectories(fullPath, item);
//                 } else if (category && !event) {
//                     await traverseDirectories(fullPath, category, item);
//                 }
//             } else if (stats.isFile() && path.extname(item).toLowerCase() === '.jpg' && category && event) {

//                 const originalFileNameWithoutExt = path.parse(item).name;
//                 const photoId = getPhotoId(category, event, originalFileNameWithoutExt);
//                 const isCached = !!oldCache[photoId];

//                 const originalStats = fs.statSync(fullPath);
//                 const isModified = isCached
//                     ? (originalStats.mtimeMs !== oldCache[photoId].mtimeMs || originalStats.size !== oldCache[photoId].size)
//                     : true;

//                 let photoEntry = {};

//                 if (isCached && !isModified) {
//                     // --- 💡 DELTA SKIP ---
//                     photoEntry = oldCache[photoId].photoEntry;
//                     newCache[photoId] = oldCache[photoId];
//                     skippedCount++;

//                 } else {
//                     // --- 💡 DELTA PROCESS (New or Modified) ---
//                     console.log(`Processing: ${path.join(category, event, item)}`);
//                     processedCount++;

//                     // If modified, clean up old resized files first
//                     if (isModified && oldCache[photoId] && oldCache[photoId].processedFiles) {
//                         for (const fileName of oldCache[photoId].processedFiles) {
//                             try {
//                                 await fsExtra.remove(path.join(outputResizedDir, fileName));
//                             } catch (e) {
//                                 // Ignore if file doesn't exist anymore
//                             }
//                         }
//                     }

//                     const sanitizedBaseName = getPhotoId(category, event, originalFileNameWithoutExt);
//                     const resizedFileNameBase = sanitizedBaseName;

//                     try {
//                         const originalDimensions = imageSize(fs.readFileSync(fullPath));
//                         const originalWidth = originalDimensions.width;

//                         const finalFullWidthName = `${resizedFileNameBase}-${originalWidth}w.jpg`;

//                         photoEntry = {
//                             src: path.join(publicPathPrefix, finalFullWidthName).replace(/\\/g, '/'),
//                             width: originalWidth,
//                             height: originalDimensions.height,
//                             category: category,
//                             event: event,
//                             srcSet: [],
//                         };

//                         const imagePromises = [];
//                         const cacheFileNames = [];

//                         const widthsToProcess = Array.from(new Set([...targetWidths, originalWidth])).sort((a, b) => a - b);

//                         for (const width of widthsToProcess) {
//                             if (width <= originalWidth) {
//                                 const resizedFileName = `${resizedFileNameBase}-${width}w.jpg`;
//                                 const resizedFilePath = path.join(outputResizedDir, resizedFileName);
//                                 cacheFileNames.push(resizedFileName);

//                                 const promise = sharp(fullPath)
//                                     .resize({ width: width })
//                                     .jpeg({
//                                         quality:
//                                             width > 256 ? 85 : // Higher quality for larger images
//                                                 width > 96 ? 75 :  // Medium quality for mid-range
//                                                     60                 // Lower quality for tiny thumbnails
//                                     })
//                                     .toFile(resizedFilePath)
//                                     .then(() => {
//                                         const height = Math.round(originalDimensions.height * (width / originalWidth));

//                                         if (width !== originalWidth) {
//                                             photoEntry.srcSet.push({
//                                                 src: path.join(publicPathPrefix, resizedFileName).replace(/\\/g, '/'),
//                                                 width: width,
//                                                 height: height,
//                                             });
//                                         }
//                                     });
//                                 imagePromises.push(promise);
//                             }
//                         }

//                         await Promise.all(imagePromises);
//                         photoEntry.srcSet.sort((a, b) => a.width - b.width);

//                         // Update the cache entry
//                         newCache[photoId] = {
//                             mtimeMs: originalStats.mtimeMs,
//                             size: originalStats.size,
//                             processedFiles: cacheFileNames,
//                             photoEntry: photoEntry,
//                         };

//                     } catch (e) {
//                         console.error(`Could not process file: ${fullPath}. Error: ${e.message}`);
//                         continue; // Skip to next item
//                     }
//                 }

//                 // Add to the final array and mark resized files for keeping
//                 photosArray.push(photoEntry);
//                 newCache[photoId].processedFiles.forEach(fileName => filesToKeep.add(fileName));
//             }
//         }
//     };

//     await traverseDirectories(sourceImageDir);

//     // --- 3. DELTA CLEANUP (Deleting files for deleted source images) ---
//     const allResizedFiles = await fsExtra.readdir(outputResizedDir);
//     let deletedResizedCount = 0;

//     for (const fileName of allResizedFiles) {
//         if (!filesToKeep.has(fileName)) {
//             await fsExtra.remove(path.join(outputResizedDir, fileName));
//             deletedResizedCount++;
//         }
//     }

//     // --- 4. Final Writes ---
//     fs.writeFileSync(outputDataFilePath, JSON.stringify(photosArray, null, 2));
//     fs.writeFileSync(cacheFilePath, JSON.stringify(newCache, null, 2));


//     console.log(`\n✅ Delta Processing Complete!`);
//     console.log(`   Processed (New/Modified): ${processedCount}`);
//     console.log(`   Skipped (Unchanged): ${skippedCount}`);
//     console.log(`   Deleted Resized Files (Cleanup): ${deletedResizedCount}`);
//     console.log(`   Total Photos in Data File: ${photosArray.length}`);
// }

// generatePhotoData();
