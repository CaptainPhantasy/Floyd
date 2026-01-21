/**
 * useTheme Hook
 * Re-exports the theme context hook for convenience
 */

export { useTheme, ThemeProvider, type ThemeId } from './ThemeContext';
export { THEMES, DEFAULT_THEME, getTheme } from './themes';
export type { Theme, ThemeColors } from './types';
