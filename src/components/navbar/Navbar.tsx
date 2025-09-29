import { useNavigate, useLocation } from 'react-router-dom';
import { makeStyles, Switch, Tab, TabList, tokens } from '@fluentui/react-components'
import { CameraFilled, ContactCardFilled, DarkTheme24Regular, PersonFilled } from '@fluentui/react-icons'
import { useTheme } from '../../ThemeContext.tsx';
import { useCallback } from 'react';

// You can safely remove the "import './Navbar.css'" line if the external CSS only contained layout rules.

interface NavbarProps { };

const useStyles = makeStyles({
    // New responsive root container for the Navbar
    navbarRoot: {
        // --- MOBILE STYLES (Default: Vertical Stack) ---
        display: 'grid',
        // Define the three rows for the mobile layout
        gridTemplateAreas: `
            "name"
            "links"
            "theme"
        `,
        gap: tokens.spacingVerticalM,
        padding: tokens.spacingHorizontalL,
        alignItems: 'center',

        // --- DESKTOP STYLES (Override: Horizontal Row) ---
        '@media screen and (min-width: 768px)': {
            display: 'flex',
            // justifyContent: 'space-between',
            // Reset grid area on desktop
            gridTemplateAreas: 'none',
            padding: tokens.spacingHorizontalXL,
        }
    },

    // Assign grid areas for mobile layout
    nameArea: {
        gridArea: 'name',
        // Center the name horizontally on mobile
        '@media screen and (max-width: 767px)': {
            textAlign: 'center',
        }
    },
    linksArea: {
        gridArea: 'links',
        // Ensure TabList takes full width and justifies content on mobile
        '@media screen and (max-width: 767px)': {
            display: 'flex',
            justifyContent: 'center', // Center tabs horizontally
        }
    },
    themeArea: {
        gridArea: 'theme',
        // Center the switch horizontally on mobile
        '@media screen and (max-width: 767px)': {
            display: 'flex',
            justifyContent: 'center', // Center switch horizontally
        }
    },

    // Existing styles
    text: {
        fontFamily: tokens.fontFamilyBase,
        fontSize: tokens.fontSizeHero700,
        fontWeight: tokens.fontWeightRegular,
        margin: 0,
        // Ensure this text is always visible on desktop
        '@media screen and (min-width: 768px)': {
            marginRight: tokens.spacingHorizontalXXL,
        }
    },
    switch: {
        display: 'flex',
        alignItems: 'center',
    }
});

const Navbar = ({ }: NavbarProps) => {
    const styles = useStyles();
    const navigate = useNavigate();
    const location = useLocation();
    const { isDarkMode, toggleTheme } = useTheme();

    const getSelectedTabValue = useCallback(() => {
        // Use pathname to check the primary segment
        const path = location.pathname.split('/')[1];

        switch (path.toLowerCase()) {
            case 'about':
            case '': // Treat the root path as 'about' (or whichever your default is)
                return 'tab1';
            case 'projects':
                // Note: This covers both /projects and /projects/category
                return 'tab2';
            case 'contact':
                return 'tab3';
            default:
                // Handle any unrecognized paths by selecting the default tab or none
                return 'tab1';
        }
    }, [location.pathname]);

    const selectedTab = getSelectedTabValue();

    return (
        // Apply the new responsive root style
        <nav className={styles.navbarRoot}>
            {/* 1. Name on the first line (Mobile Grid Area: name) */}
            <div className={styles.nameArea}>
                <h3 className={styles.text}>Swapnil Kamat</h3>
            </div>

            {/* 2. TabList on the second line (Mobile Grid Area: links) */}
            <div className={styles.linksArea}>
                <TabList defaultSelectedValue={selectedTab} appearance="transparent">
                    <Tab value="tab1" icon={<PersonFilled />} onClick={() => navigate('/about')}>About</Tab>
                    <Tab value="tab2" icon={<CameraFilled />} onClick={() => navigate('/projects')}>Projects</Tab>
                    <Tab value="tab3" icon={<ContactCardFilled />} onClick={() => navigate('/contact')}>Contact</Tab>
                </TabList>
            </div>

            {/* 3. Switch on the third line (Mobile Grid Area: theme) */}
            <div className={styles.themeArea}>
                <div className={styles.switch}>
                    <Switch
                        checked={isDarkMode}
                        onChange={toggleTheme}
                    />
                    <DarkTheme24Regular />
                </div>
            </div>
        </nav>
    );
};

export default Navbar;



// import './Navbar.css'
// import { useNavigate, useLocation } from 'react-router-dom';
// import { makeStyles, Switch, Tab, TabList, tokens } from '@fluentui/react-components'
// import { CameraFilled, ContactCardFilled, DarkTheme24Regular, PersonFilled } from '@fluentui/react-icons'
// import { useTheme } from '../../ThemeContext.tsx';
// import { useCallback } from 'react';

// interface NavbarProps { };

// const useStyles = makeStyles({
//     text: {
//         fontFamily: tokens.fontFamilyBase,
//         fontSize: tokens.fontSizeHero700,
//         fontWeight: tokens.fontWeightRegular,
//         lineHeight: tokens.lineHeightBase600,
//     },
//     switch: {
//         display: 'flex',
//         alignItems: 'center',
//     }
// });

// const Navbar = ({ }: NavbarProps) => {
//     const styles = useStyles();
//     const navigate = useNavigate();
//     const location = useLocation();
//     const { isDarkMode, toggleTheme } = useTheme();

//     const getSelectedTabValue = useCallback(() => {
//         // Use pathname to check the primary segment
//         const path = location.pathname.split('/')[1];

//         switch (path.toLowerCase()) {
//             case 'about':
//             case '': // Treat the root path as 'about' (or whichever your default is)
//                 return 'tab1';
//             case 'projects':
//                 // Note: This covers both /projects and /projects/category
//                 return 'tab2';
//             case 'contact':
//                 return 'tab3';
//             default:
//                 // Handle any unrecognized paths by selecting the default tab or none
//                 return 'tab1';
//         }
//     }, [location.pathname]);

//     const selectedTab = getSelectedTabValue();

//     return (
//         <nav className='navbar'>
//             <h3 className={styles.text}>Swapnil Kamat</h3>
//             <div className="navbar-links">
//                 <TabList defaultSelectedValue={selectedTab} appearance="transparent">
//                     <Tab value="tab1" icon={<PersonFilled />} onClick={() => navigate('/about')}>About</Tab>
//                     <Tab value="tab2" icon={<CameraFilled />} onClick={() => navigate('/projects')}>Projects</Tab>
//                     <Tab value="tab3" icon={<ContactCardFilled />} onClick={() => navigate('/contact')}>Contact</Tab>
//                 </TabList>
//             </div>
//             <div className={styles.switch}>
//                 <Switch
//                     checked={isDarkMode}
//                     onChange={toggleTheme}
//                 />
//                 <DarkTheme24Regular />
//             </div>
//         </nav>
//     );
// };

// export default Navbar;
