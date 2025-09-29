import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { FluentProvider } from '@fluentui/react-components'
import { ThemeProvider, useTheme } from './ThemeContext.tsx' // Import the new components

// A wrapper component to consume the context and apply the theme
const Root = () => {
  const { theme } = useTheme();

  return (
    <FluentProvider theme={theme} style={{ minHeight: '100vh' }}>
      <App />
    </FluentProvider>
  );
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/* Wrap the entire app with your custom ThemeProvider */}
    <ThemeProvider>
      <Root />
    </ThemeProvider>
  </StrictMode>,
);