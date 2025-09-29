import * as React from 'react';
import { Card, Text, Title1, tokens, makeStyles } from '@fluentui/react-components';

// FIX: Change 'style' prop to 'className' to accept the string output from makeStyles.
// The component is now correctly typed to accept children and a className string.
const Icon = ({ children, className }: { children: React.ReactNode, className?: string }) => <span className={className} style={{ marginRight: tokens.spacingHorizontalS, display: 'inline-flex', alignItems: 'center' }}>{children}</span>;

const useStyles = makeStyles({
    root: {
        // Center the content container on the page
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '60px 20px',
        minHeight: '80vh', // Ensures it looks centered even on tall screens
        '@media (max-width: 768px)': {
            padding: '0 10px'
        },
    },

    // Styling for the main contact card
    contactCard: {
        maxWidth: '1000px',
        width: '100%',
        padding: '40px',
        borderRadius: tokens.borderRadiusXLarge, // Soft rounded edges
        backgroundColor: tokens.colorNeutralBackground1,

        // Responsive scaling for smaller screens
        '@media (max-width: 500px)': {
            padding: '30px 20px',
        },
    },

    title: {
        marginBottom: tokens.spacingVerticalM,
        textAlign: 'center',
        // FIX: Replaced non-existent tokens.fontSizeBase700 with valid tokens.fontSizeBase600
        fontSize: tokens.fontSizeBase600,
        fontWeight: tokens.fontWeightSemibold,
    },

    subtitle: {
        marginBottom: tokens.spacingVerticalXXL,
        textAlign: 'center',
        color: tokens.colorNeutralForeground2,
    },

    // Style for each contact detail row
    detailRow: {
        display: 'flex',
        alignItems: 'center',
        // Make the entire row clickable on hover
        transition: 'background-color 0.2s',
        padding: tokens.spacingVerticalS,
        borderRadius: tokens.borderRadiusMedium,

        '&:hover': {
            // FIX: Corrected token name from colorNeutralBackgroundHover to colorNeutralBackground1Hover
            backgroundColor: tokens.colorNeutralBackground1Hover,
        }
    },

    detailLink: {
        textDecoration: 'none',
        color: tokens.colorNeutralForeground1,
        fontSize: tokens.fontSizeBase400,
        display: 'flex',
        alignItems: 'center',
        margin: '0 auto'
    },

    // Styling the icon wrapper
    icon: {
        // FIX: Corrected token name from fontSize500 to fontSizeBase600 for a valid Fluent UI token.
        fontSize: tokens.fontSizeBase600,
        color: tokens.colorBrandForeground1,
    }
});

const Contact = () => {
    const styles = useStyles();

    const email = "swapnilkamat23@gmail.com";
    const phone = "+1 (585) 642 3886";

    return (
        <div className={styles.root}>
            <Card className={styles.contactCard}>
                <div className={styles.title}>
                    <Title1 as="h1">Get In Touch</Title1>
                </div>

                <Text as="p" className={styles.subtitle}>
                    I'm always open to new projects, collaborations, or just a friendly chat.
                </Text>

                {/* --- Email Contact --- */}
                <a href={`mailto:${email}`} className={styles.detailLink}>
                    <div className={styles.detailRow}>
                        {/* Placeholder for Email Icon */}
                        {/* FIX: Changed prop from style={styles.icon} to className={styles.icon} */}
                        <Icon className={styles.icon}>✉️</Icon>
                        <Text className={styles.detailLink}>{email}</Text>
                    </div>
                </a>

                {/* --- Phone Contact --- */}
                <a href={`tel:${phone.replace(/[()\s-]/g, '')}`} className={styles.detailLink}>
                    <div className={styles.detailRow}>
                        {/* Placeholder for Phone Icon */}
                        {/* FIX: Changed prop from style={styles.icon} to className={styles.icon} */}
                        <Icon className={styles.icon}>📞</Icon>
                        <Text className={styles.detailLink}>{phone}</Text>
                    </div>
                </a>
            </Card>
        </div>
    );
};

export default Contact;
