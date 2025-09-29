// src/Projects.tsx
import { useMemo } from "react";
import { Routes, Route } from 'react-router-dom';

import CategoryGrid from '../categoryGrid/CategoryGrid';
import EventGrid from '../eventGrid/EventGrid';
import PhotoGallery from '../photoGallery/PhotoGallery';

import photos from '../../photoData.json';
import Breadcrumbs from "../breadcrumbs/Breadcrumbs";
import { makeStyles } from "@fluentui/react-components";

type Photo = typeof photos[0] & { category: string, event: string };
type PhotoGroup = Record<string, Record<string, Photo[]>>; // Category -> Event -> Photos

const useStyles = makeStyles({
    root: {
        padding: '0 20px',
        flexDirection: 'row',
        gap: '20px',
        '@media (max-width: 768px)': {
            padding: '0 10px'
        },
    },
});

const Projects = () => {
    const styles = useStyles();

    // Grouping Logic: Group photos by Category, then by Event
    const { categories, photosByGroup } = useMemo(() => {
        const groups: PhotoGroup = {};
        (photos as Photo[]).forEach(photo => {
            const cat = photo.category || 'Uncategorized';
            const evt = photo.event || 'Default'; // Renamed variable

            if (!groups[cat]) {
                groups[cat] = {};
            }
            if (!groups[cat][evt]) {
                groups[cat][evt] = [];
            }
            groups[cat][evt].push(photo);
        });

        return {
            categories: Object.keys(groups).sort(),
            photosByGroup: groups,
        };
    }, []);

    return (
        <div className={styles.root}>
            <Breadcrumbs />

            {/* Nested Routes */}
            <Routes>
                {/* Route 1: Matches /projects (index route) -> Category Grid */}
                <Route
                    path="/"
                    element={<CategoryGrid categories={categories} photosByGroup={photosByGroup} />}
                />

                {/* Route 2: Matches /projects/:categoryName -> Event Grid */}
                <Route
                    path=":categoryName"
                    element={<EventGrid photosByGroup={photosByGroup} />}
                />

                {/* Route 3: Matches /projects/:categoryName/:eventName -> Photo Gallery */}
                <Route
                    path=":categoryName/:eventName"
                    element={<PhotoGallery photosByGroup={photosByGroup} />}
                />
            </Routes>
        </div>
    );
};

export default Projects;