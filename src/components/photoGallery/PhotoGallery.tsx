// src/PhotoGallery.tsx
import { useState, useMemo } from "react";
import { useParams } from 'react-router-dom';

import { MasonryPhotoAlbum } from "react-photo-album";
import "react-photo-album/masonry.css";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import Thumbnails from "yet-another-react-lightbox/plugins/thumbnails";
import "yet-another-react-lightbox/plugins/thumbnails.css";

// Types must match react-photo-album requirements
type Photo = { src: string; width: number; height: number; category?: string; event?: string; }; // Renamed type property
type PhotoGroup = Record<string, Record<string, Photo[]>>;

interface PhotoGalleryProps {
    photosByGroup: PhotoGroup;
}

const PhotoGallery = ({ photosByGroup }: PhotoGalleryProps) => {
    const [index, setIndex] = useState(-1);

    // Read both dynamic segments from the URL, using eventName
    const { categoryName, eventName } = useParams<{ categoryName: string, eventName: string }>(); // Renamed variable

    // Filter photos based on both parameters
    const displayedPhotos: Photo[] = useMemo(() => {
        if (!categoryName || !eventName) return [];

        return photosByGroup[categoryName]?.[eventName] || [];
    }, [categoryName, eventName, photosByGroup]);

    if (!categoryName || !eventName || displayedPhotos.length === 0) {
        return <div>Content not found.</div>;
    }

    return (
        <div>
            <MasonryPhotoAlbum
                photos={displayedPhotos}
                onClick={({ index }) => setIndex(index)}
                spacing={12}
                columns={(containerWidth) => {
                    if (containerWidth < 600) return 2;
                    return 3;
                }}
            />

            <Lightbox
                slides={displayedPhotos}
                open={index >= 0}
                index={index}
                close={() => setIndex(-1)}
                plugins={[Thumbnails]}
            />
        </div>
    );
};

export default PhotoGallery;