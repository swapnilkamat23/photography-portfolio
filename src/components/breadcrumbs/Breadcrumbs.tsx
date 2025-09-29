import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Breadcrumb, BreadcrumbItem, BreadcrumbButton, BreadcrumbDivider, tokens } from '@fluentui/react-components';
import { HomeFilled } from '@fluentui/react-icons'; // Import the home icon

const Breadcrumbs: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();

    // 1. Split the pathname and filter out empty strings and the initial '/projects' prefix.
    const pathnames = location.pathname.split('/').filter(x => x && x !== 'projects');

    // 2. Prepare the data structure for the dynamic path segments
    // We start with an empty array here because the static 'Projects' link is handled separately below.
    const dynamicBreadcrumbs = pathnames.reduce((acc, segment, index) => {
        // The path must accumulate all previous segments (e.g., /projects/CategoryName/EventName)
        const pathSegments = pathnames.slice(0, index + 1);
        const routeTo = `/projects/${pathSegments.join('/')}`;

        // Decode the URL segment (%20 -> space, %28 -> (, etc.) for clean display
        const decodedSegment = decodeURIComponent(segment);

        acc.push({
            name: decodedSegment,
            path: routeTo
        });
        return acc;
    }, [] as { name: string, path: string }[]);


    return (
        <div style={{ marginBottom: '10px' }}>
            <Breadcrumb>
                {/* --- 1. STATIC HOME/PROJECTS LINK (First Item) --- */}
                <BreadcrumbItem>
                    <BreadcrumbButton
                        onClick={() => navigate('/projects')}
                        // Removed href="/projects" to prevent page refresh
                        icon={<HomeFilled />}
                    >
                        Projects
                    </BreadcrumbButton>
                </BreadcrumbItem>

                {/* --- 2. DYNAMIC PATHS (Category, Event, etc.) --- */}
                {dynamicBreadcrumbs.map((crumb, index) => {
                    const isLast = index === dynamicBreadcrumbs.length - 1;
                    return (
                        <React.Fragment key={crumb.path}>
                            {/* Always show the divider after the first item (Home/Projects) */}
                            <BreadcrumbDivider />

                            <BreadcrumbItem>
                                {isLast ? (
                                    // Current item (not clickable)
                                    <BreadcrumbButton
                                        current
                                        disabled
                                        aria-current="page"
                                        style={{ textDecoration: 'none', cursor: 'default' }}
                                    >
                                        {crumb.name}
                                    </BreadcrumbButton>
                                ) : (
                                    // Clickable item
                                    <BreadcrumbButton
                                        onClick={() => navigate(crumb.path)}
                                    // Removed href={crumb.path} to prevent page refresh
                                    >
                                        {crumb.name}
                                    </BreadcrumbButton>
                                )}
                            </BreadcrumbItem>
                        </React.Fragment>
                    );
                })}
            </Breadcrumb>
        </div>
    );
};

export default Breadcrumbs;
