import { createContext, useState, useContext, useCallback } from 'react';
import type { ReactNode } from 'react';
import { webDarkTheme, webLightTheme } from '@fluentui/react-components';
import type { Theme } from '@fluentui/react-components';

// 1. Define the Context value structure
interface ThemeContextValue {
    theme: Theme;
    isDarkMode: boolean;
    toggleTheme: () => void;
}

// 2. Create the Context
const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

// 3. Create the Provider component
interface ThemeProviderProps {
    children: ReactNode;
}

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
    const [isDarkMode, setIsDarkMode] = useState(false); // Start in Light Mode

    const toggleTheme = useCallback(() => {
        setIsDarkMode(prevMode => !prevMode);
    }, []);

    const currentTheme = isDarkMode ? webDarkTheme : webLightTheme;

    const value = {
        theme: currentTheme,
        isDarkMode,
        toggleTheme,
    };

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
};

// 4. Custom hook for consuming the Context
export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};