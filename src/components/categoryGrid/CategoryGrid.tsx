// // src/CategoryGrid.tsx
// import { useNavigate } from 'react-router-dom';
// import { Card, CardHeader, CardFooter, Text, makeStyles } from "@fluentui/react-components";

// // Types derived from Projects.tsx
// type Photo = { src: string };
// type PhotoGroup = Record<string, Record<string, Photo[]>>; // Category -> Event -> Photos

// interface CategoryGridProps {
//     categories: string[];
//     photosByGroup: PhotoGroup;
// }

// const useStyles = makeStyles({
//     grid: {
//         display: "grid",
//         gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
//         gap: "20px",
//     },
//     card: {
//         cursor: "pointer",
//         minHeight: "150px",
//         transition: "transform 0.2s",
//         "&:hover": {
//             transform: "scale(1.02)",
//         },
//     },
// });


// const CategoryGrid = ({ categories, photosByGroup }: CategoryGridProps) => {
//     const styles = useStyles();
//     const navigate = useNavigate();

//     const getTotalPhotos = (category: string) => {
//         return Object.values(photosByGroup[category] || {}).flat().length;
//     };

//     // Get the first photo of the first event for the thumbnail
//     const getFirstPhotoSrc = (category: string) => {
//         const events = Object.keys(photosByGroup[category] || {}); // Renamed variable
//         if (events.length > 0) {
//             return photosByGroup[category][events[0]][0]?.src; // Renamed variable
//         }
//         return undefined;
//     };


//     return (
//         <div className={styles.grid}>
//             {categories.map(category => (
//                 <Card
//                     key={category}
//                     className={styles.card}
//                     onClick={() => navigate(category)}
//                 >
//                     <img
//                         src={getFirstPhotoSrc(category)}
//                         alt={category}
//                         style={{ width: '50%', objectFit: 'cover' }}
//                     />
//                     <CardHeader
//                         header={<Text weight="semibold" size={500}>{category}</Text>}
//                     />
//                     <CardFooter>
//                         <Text size={300}>{getTotalPhotos(category)} photos</Text>
//                     </CardFooter>
//                 </Card>
//             ))}
//         </div>
//     );
// };

// export default CategoryGrid;

// src/components/categoryGrid/CategoryGrid.tsx
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardFooter, Text, makeStyles, tokens } from "@fluentui/react-components";

// Types derived from Projects.tsx
type Photo = { src: string };
type PhotoGroup = Record<string, Record<string, Photo[]>>; // Category -> Event -> Photos

interface CategoryGridProps {
    categories: string[];
    photosByGroup: PhotoGroup;
}

const useStyles = makeStyles({
    grid: {
        display: "grid",
        // Retain auto-fill and minmax settings for responsive cards
        gridTemplateColumns: "repeat(auto-fill, minmax(250px, 350px))",
        gap: "20px",

        // 💡 FIX 1: Limit the maximum width of the entire grid container
        maxWidth: '1440px',
    },
    card: {
        cursor: "pointer",
        transition: "transform 0.2s",
        "&:hover": {
            transform: "scale(1.02)",
        },
        maxWidth: '350px',
        minHeight: 'auto',
    },

    // Container for the image to enforce a 3:2 aspect ratio (66.66%)
    imageContainer: {
        width: '100%',
        paddingBottom: '66.66%',
        position: 'relative',
        overflow: 'hidden',
        borderTopLeftRadius: tokens.borderRadiusMedium,
        borderTopRightRadius: tokens.borderRadiusMedium,
    },

    // Style the actual image to cover the container
    cardImage: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        objectFit: 'cover',
    },
});


const CategoryGrid = ({ categories, photosByGroup }: CategoryGridProps) => {
    const styles = useStyles();
    const navigate = useNavigate();

    const getTotalPhotos = (category: string) => {
        return Object.values(photosByGroup[category] || {}).flat().length;
    };

    const getFirstPhotoSrc = (category: string) => {
        const events = Object.keys(photosByGroup[category] || {});
        if (events.length > 0) {
            return photosByGroup[category][events[0]][0]?.src;
        }
        return undefined;
    };


    return (
        <div className={styles.grid}>
            {categories.map(category => (
                <Card
                    key={category}
                    className={styles.card}
                    onClick={() => navigate(category)}
                >
                    <div className={styles.imageContainer}>
                        <img
                            src={getFirstPhotoSrc(category)}
                            alt={category}
                            className={styles.cardImage}
                        />
                    </div>

                    <CardHeader
                        header={<Text weight="semibold" size={500}>{category}</Text>}
                        style={{ padding: tokens.spacingHorizontalM, paddingTop: tokens.spacingVerticalM }}
                    />
                    <CardFooter
                        style={{ padding: tokens.spacingHorizontalM, paddingBottom: tokens.spacingVerticalM }}
                    >
                        <Text size={300}>{getTotalPhotos(category)} photos</Text>
                    </CardFooter>
                </Card>
            ))}
        </div>
    );
};

export default CategoryGrid;