/**
 * Theme Context Provider
 * Manages theme state and applies CSS variables to the document
 * A+ Alignment: Exports all 81 colors + utility functions
 */

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import type { ThemeId, Theme, ThemeColors, ExtendedColors, RoleColors, SyntaxColors, DiffColors } from './types';
import { THEMES, DEFAULT_THEME, themeToCssVariables, getColor, hasColor, getTheme } from './themes';

interface ThemeContextValue {
  themeId: ThemeId;
  themeName: string;
  setTheme: (id: ThemeId) => void;
  toggleTheme: () => void;
  getColor: (path: string, themeId?: ThemeId) => string | undefined;
  hasColor: (color: string, themeId?: ThemeId) => boolean;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
  defaultTheme?: ThemeId;
}

const THEME_STORAGE_KEY = 'floyd-theme';

export function ThemeProvider({ children, defaultTheme = DEFAULT_THEME }: ThemeProviderProps) {
  // Load saved theme from localStorage or use default
  const [themeId, setThemeId] = useState<ThemeId>(() => {
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    if (saved && saved in THEMES) {
      return saved as ThemeId;
    }
    return defaultTheme;
  });

  // Apply theme CSS variables to document
  useEffect(() => {
    const theme = THEMES[themeId];
    const cssVars = themeToCssVariables(theme);

    const root = document.documentElement;
    Object.entries(cssVars).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });

    // Store theme preference
    localStorage.setItem(THEME_STORAGE_KEY, themeId);
  }, [themeId]);

  const setTheme = (id: ThemeId) => {
    if (id in THEMES) {
      setThemeId(id);
    }
  };

  const toggleTheme = () => {
    setThemeId(themeId === 'crush' ? 'light' : 'crush');
  };

  // Wrapper functions that use current theme by default
  const getColorWithContext = (path: string, themeIdOverride?: ThemeId) => {
    return getColor(path, themeIdOverride || themeId);
  };

  const hasColorWithContext = (color: string, themeIdOverride?: ThemeId) => {
    return hasColor(color, themeIdOverride || themeId);
  };

  return (
    <ThemeContext.Provider
      value={{
        themeId,
        themeName: THEMES[themeId].name,
        setTheme,
        toggleTheme,
        getColor: getColorWithContext,
        hasColor: hasColorWithContext,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}

// Re-export utility functions for direct import
export { getColor, hasColor, themeToCssVariables };
export { THEMES, DEFAULT_THEME, getTheme };
export type { Theme, ThemeColors, ExtendedColors, RoleColors, SyntaxColors, DiffColors };
