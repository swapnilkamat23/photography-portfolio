import { Card, Text, Title1, tokens, makeStyles } from '@fluentui/react-components';
import profileImage from '../../assets/aboutme.jpg';

// Define styles using makeStyles for the responsive layout
const useStyles = makeStyles({
    root: {
        padding: '20px 20px',
        maxWidth: '1440px',
        margin: '0 auto',

        '@media (max-width: 768px)': {
            flexDirection: 'column',
            gap: '30px',
            padding: '0 10px'
        },
    },

    header: {
        marginBottom: '20px',
    },

    // 1. Flex container for the side-by-side layout
    contentContainer: {
        display: 'flex',
        flexDirection: 'row', // Default to side-by-side
        gap: '40px',

        // Media query to stack vertically on small screens (e.g., phones)
        '@media (max-width: 768px)': {
            flexDirection: 'column',
            gap: '30px',
        },
    },

    // 2. Styles for the text (left) area
    textSection: {
        display: 'flex',
        flexDirection: 'column',
        flexGrow: 2, // Allows the text to take up more space
        minWidth: '300px',
    },

    // 3. Styles for the image (right) card
    imageCardSection: {
        flexGrow: 1,
        flexShrink: 0,
        maxWidth: '500px',
        '@media (max-width: 768px)': {
            maxWidth: '100%', // Full width on mobile
            order: -1,         // Puts the image *above* the text on mobile
        },
    },

    // 4. Image styling within the Card
    profileImage: {
        width: '100%',
        height: 'auto',
        borderRadius: tokens.borderRadiusMedium,
        objectFit: 'cover',
        // Example styling for a simple black and white placeholder
        filter: 'grayscale(10%)',
        boxShadow: tokens.shadow16,
    },

    // Text styling
    paragraph: {
        marginBlockStart: tokens.spacingVerticalM,
        marginBlockEnd: tokens.spacingVerticalM,
        lineHeight: tokens.lineHeightBase300,
        fontSize: tokens.fontSizeBase400,
        color: tokens.colorNeutralForeground2,
    },
});

const About = () => {
    const styles = useStyles();

    return (
        <div className={styles.root}>
            <div className={styles.header}>
                <Title1>Hello!</Title1>
            </div>

            <div className={styles.contentContainer}>

                {/* -------------------- LEFT SIDE: Text Content -------------------- */}
                <div className={styles.textSection}>
                    <Text as="p" className={styles.paragraph}>
                        I’m Swapnil, a software engineer with a profound passion for photography. This portfolio is a space where my technical skills meet my creative eye. While my professional life is dedicated to building robust and scalable applications using modern web technologies, my free time is spent behind a lens, capturing the world's fleeting moments.
                    </Text>
                    <Text as="p" className={styles.paragraph}>
                        My journey in photography began as a way to de-stress and observe life more closely. I specialize in event and candid portraiture, focusing on authenticity and emotion. Each click is an exercise in composition, light, and storytelling—disciplines that, surprisingly, inform my approach to coding: structure, efficiency, and aesthetics are paramount.
                    </Text>

                    <Text as="p" className={styles.paragraph}>
                        Feel free to explore my photography projects. If you’d like to connect, head over to the Contact page.
                    </Text>

                    <Text as="p" className={styles.paragraph}>
                        Thank you for visiting!
                    </Text>
                </div>

                {/* -------------------- RIGHT SIDE: Profile Card -------------------- */}
                <div className={styles.imageCardSection}>
                    <Card style={{ padding: tokens.spacingHorizontalL }}>
                        {/* NOTE: Replace the placeholder below with the actual path to your photo. 
                            If you are using a public folder, you might use an absolute path like '/images/profile.jpg'.
                        */}
                        <img
                            src={profileImage}
                            // src="https://placehold.co/350x450/333333/FFFFFF?text=Swapnil+Kamat"
                            alt="Swapnil Kamat Profile"
                            className={styles.profileImage}
                        />
                        {/* <Text
                            align="center"
                            weight="semibold"
                            style={{
                                marginTop: tokens.spacingVerticalM,
                                display: 'block'
                            }}
                        >
                            Swapnil Kamat 
                        </Text> */}
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default About;