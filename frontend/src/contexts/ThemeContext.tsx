import React, { createContext, useContext, useState, useEffect } from 'react';

export type ThemeType = 'light' | 'dark' | 'auto';
export type ColorPalette = 'blue' | 'emerald' | 'violet' | 'amber' | 'red' | 'pink';

interface ThemeContextType {
    theme: ThemeType;
    setTheme: (theme: ThemeType) => void;
    colorPalette: string;
    setColorPalette: (color: string) => void;
}

const colorMap: Record<string, string> = {
    '#3b82f6': '#3b82f6', // blue
    '#10b981': '#10b981', // emerald
    '#8b5cf6': '#8b5cf6', // violet
    '#f59e0b': '#f59e0b', // amber
    '#ef4444': '#ef4444', // red
    '#ec4899': '#ec4899', // pink
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
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

        // Optionally listen to OS theme changes if auto is selected
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleChange = () => {
            if (theme === 'auto') applyTheme();
        };
        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, [theme]);

    useEffect(() => {
        const root = document.documentElement;
        // set primary color explicitly based on palette
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

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};
