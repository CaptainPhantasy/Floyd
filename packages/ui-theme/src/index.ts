/**
 * @floyd/ui-theme
 *
 * CRUSH Design System - Shared theme tokens for Floyd platforms.
 *
 * @example
 * ```ts
 * import { colors, spacing, role } from '@floyd/ui-theme';
 *
 * // Use colors
 * const bgColor = colors.background.base;
 * const textColor = colors.text.primary;
 *
 * // Use semantic roles
 * const userColor = role.userLabel;
 * const errorColor = colors.status.error;
 *
 * // Use spacing
 * const padding = spacing.md;
 * ```
 */

// Token exports
export { colors, background, text, accent, status, role, hover } from './tokens/colors.js';
export { spacing, spacingRem, BASE_UNIT } from './tokens/spacing.js';
export { typography, fontFamily, fontSize, fontWeight, lineHeight } from './tokens/typography.js';
export { effects, shadow, radius, transition, opacity } from './tokens/effects.js';

// Type exports
export type { Colors } from './tokens/colors.js';
export type { Spacing } from './tokens/spacing.js';
export type { Typography } from './tokens/typography.js';
export type { Effects } from './tokens/effects.js';

// ============================================================================
// CRUSH THEME - Complete (Legacy Export)
// ============================================================================

/**
 * Complete CRUSH theme object for compatibility with existing CLI theme.
 *
 * This matches the structure used in INK/floyd-cli/src/theme/crush-theme.ts
 */
export const crushTheme = {
  // Background colors (Rustic)
  bg: {
    base: '#201F26',      // Pepper
    elevated: '#2d2c35',  // BBQ
    overlay: '#3A3943',   // Charcoal
    modal: '#4D4C57',     // Iron
  },

  // Foreground/text colors (Ash)
  fg: {
    base: '#DFDBDD',      // Ash - primary text
    muted: '#959AA2',     // Squid - secondary text
    subtle: '#706F7B',     // Oyster - subtle text
  },

  // Accent colors (Charm)
  accent: {
    primary: '#6B50FF',   // Charple - purple
    secondary: '#FF60FF', // Dolly - pink
    tertiary: '#68FFD6',  // Bok - teal
    highlight: '#E8FE96', // Zest - yellow
    info: '#00A4FF',      // Malibu - blue
  },

  // Status colors (Speedy)
  status: {
    ready: '#12C78F',     // Guac - green
    working: '#6B50FF',   // Charple - purple
    warning: '#E8FE96',   // Zest - yellow
    error: '#EB4268',     // Sriracha - red
    blocked: '#FF60FF',   // Dolly - pink
    offline: '#858392',   // Squid - gray
    online: '#12C78F',    // Alias for ready
  },

  // Border colors
  border: '#3A3943',
  borderFocus: '#6B50FF',
} as const;

/**
 * Role-based colors for semantic UI elements.
 * Matches the structure used in INK/floyd-cli/src/theme/crush-theme.ts
 */
export const roleColors = {
  headerTitle: '#FF60FF',    // Dolly - headers
  headerStatus: '#DFDBDD',   // Ash - status text
  userLabel: '#12C78F',      // Guac - user messages
  assistantLabel: '#00A4FF', // Malibu - assistant
  systemLabel: '#E8FE96',    // Zest - system
  toolLabel: '#68FFD6',      // Bok - tools
  thinking: '#E8FE96',       // Zest - thinking
  inputPrompt: '#12C78F',    // Guac - input
  hint: '#959AA2',           // Squid - hints
} as const;

/**
 * FLOYD gradient colors for ASCII art and special effects.
 */
export const floydGradientColors = [
  '#FF60FF', // pink for #
  '#6060FF', // blue for :
  '#B85CFF', // lavender (other chars)
  '#9054FF', // indigo
  '#6B50FF', // violet
] as const;

// ============================================================================
// DEFAULT EXPORT
// ============================================================================

export default {
  colors: {
    background: {
      base: '#201F26',
      elevated: '#2d2c35',
      overlay: '#3A3943',
      modal: '#4D4C57',
    },
    text: {
      primary: '#DFDBDD',
      secondary: '#959AA2',
      tertiary: '#BFBCC8',
      subtle: '#706F7B',
      selected: '#F1EFEF',
      inverse: '#FFFAF1',
    },
    accent: {
      primary: '#6B50FF',
      secondary: '#FF60FF',
      tertiary: '#68FFD6',
      highlight: '#E8FE96',
      info: '#00A4FF',
    },
    status: {
      ready: '#12C78F',
      working: '#6B50FF',
      warning: '#E8FE96',
      error: '#EB4268',
      blocked: '#FF60FF',
      offline: '#858392',
      busy: '#E8FF27',
    },
    role: {
      headerTitle: '#FF60FF',
      headerStatus: '#DFDBDD',
      userLabel: '#12C78F',
      assistantLabel: '#00A4FF',
      systemLabel: '#E8FE96',
      toolLabel: '#68FFD6',
      thinking: '#E8FE96',
      inputPrompt: '#12C78F',
      hint: '#959AA2',
    },
    hover: {
      primary: '#5848cc',
      tertiary: '#4dc4a0',
    },
  },
  spacing,
  typography,
  effects,
};
