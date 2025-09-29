// src/components/eventGrid/EventGrid.tsx
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardHeader, CardFooter, Text, makeStyles, tokens } from "@fluentui/react-components";

// Types derived from Projects.tsx
type Photo = { src: string, event: string };
type PhotoGroup = Record<string, Record<string, Photo[]>>;

interface EventGridProps {
    photosByGroup: PhotoGroup;
}

const useStyles = makeStyles({
    grid: {
        display: "grid",
        // Retain auto-fill and minmax settings for responsive cards
        gridTemplateColumns: "repeat(auto-fill, minmax(250px, 350px))",
        gap: "20px",

        // FIX 1: Limit the maximum width of the entire grid container
        maxWidth: '1440px',
        // FIX 2: Center the entire grid container block on the page
        // margin: '0 auto',

        // Center grid items within the confined width
        // justifyContent: 'center',
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

    // FIX 3: Container for the image to enforce a 3:2 aspect ratio (66.66%)
    imageContainer: {
        width: '100%',
        paddingBottom: '66.66%', // Height is 2/3 of the width (3:2 ratio)
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

    // Fallback/Error message styling
    notFound: {
        textAlign: 'center',
        padding: '40px',
    }
});


const EventGrid = ({ photosByGroup }: EventGridProps) => {
    const styles = useStyles();
    const navigate = useNavigate();
    const { categoryName } = useParams<{ categoryName: string }>();

    if (!categoryName || !photosByGroup[categoryName]) {
        return <div className={styles.notFound}>Category "{categoryName}" not found or data is loading.</div>;
    }

    const eventMap = photosByGroup[categoryName];
    const events = Object.keys(eventMap).sort();

    if (events.length === 0) {
        return <div className={styles.notFound}>No events found in category "{categoryName}".</div>;
    }

    return (
        <div className={styles.grid}>
            {events.map(event => (
                <Card
                    key={event}
                    className={styles.card}
                    // Navigate to the photo gallery path (e.g., /projects/Category/Event)
                    onClick={() => navigate(event)}
                >
                    {/* Applying the aspect ratio container */}
                    <div className={styles.imageContainer}>
                        <img
                            src={eventMap[event][0]?.src}
                            alt={event}
                            className={styles.cardImage}
                        />
                    </div>

                    <CardHeader
                        header={<Text weight="semibold" size={500}>{event}</Text>}
                        style={{ padding: tokens.spacingHorizontalM, paddingTop: tokens.spacingVerticalM }}
                    />
                    <CardFooter
                        style={{ padding: tokens.spacingHorizontalM, paddingBottom: tokens.spacingVerticalM }}
                    >
                        <Text size={300}>{eventMap[event].length} photos</Text>
                    </CardFooter>
                </Card>
            ))}
        </div>
    );
};

export default EventGrid;