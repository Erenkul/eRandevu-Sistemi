import React, { createContext, useContext, useState, useEffect } from 'react';

export type ThemeType = 'light' | 'dark' | 'auto';

interface ThemeContextType {
    theme: ThemeType;
    setTheme: (theme: ThemeType) => void;
    colorPalette: string;
    setColorPalette: (color: string) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
    children: React.ReactNode;
}

const colorMap: Record<string, string> = {
    '#3b82f6': '#3b82f6',
    '#10b981': '#10b981',
    '#8b5cf6': '#8b5cf6',
    '#f59e0b': '#f59e0b',
    '#ef4444': '#ef4444',
    '#ec4899': '#ec4899',
};

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
    const [theme, setThemeState] = useState<ThemeType>(() => {
        const stored = localStorage.getItem('theme');
        return (stored as ThemeType) || 'dark';
    });

    const [colorPalette, setColorPaletteState] = useState<string>(() => {
        return localStorage.getItem('colorPalette') || '#3b82f6';
    });

    useEffect(() => {
        const applyTheme = () => {
            const root = document.documentElement;
            if (theme === 'auto') {
                const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                root.setAttribute('data-theme', systemPrefersDark ? 'dark' : 'light');
            } else {
                root.setAttribute('data-theme', theme);
            }
        };

        applyTheme();
        localStorage.setItem('theme', theme);

        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleChange = () => {
            if (theme === 'auto') applyTheme();
        };
        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, [theme]);

    useEffect(() => {
        const root = document.documentElement;
        root.style.setProperty('--color-primary', colorMap[colorPalette] || colorPalette);
        localStorage.setItem('colorPalette', colorPalette);
    }, [colorPalette]);

    const setTheme = (newTheme: ThemeType) => {
        setThemeState(newTheme);
    };

    const setColorPalette = (color: string) => {
        setColorPaletteState(color);
    };

    return (
        <ThemeContext.Provider value={{ theme, setTheme, colorPalette, setColorPalette }}>
            {children}
        </ThemeContext.Provider>
    );
};

// eslint-disable-next-line react-refresh/only-export-components
export function useTheme() {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
}