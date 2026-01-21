/**
 * CRUSH Theme - Spacing Tokens
 *
 * Consistent spacing scale based on a 4px base unit.
 * All spacing values are multiples of 4 for rhythm and consistency.
 */

/**
 * Base spacing unit in pixels
 */
export const BASE_UNIT = 4;

/**
 * Spacing scale
 *
 * Based on a 4px grid system for consistent rhythm.
 *
 * @example
 * ```ts
 * import { spacing } from '@floyd/ui-theme';
 *
 * const padding = spacing.md; // 16px
 * const gap = spacing.lg;    // 24px
 * ```
 */
export const spacing = {
  /**
   * Extra small - 4px (0.25rem)
   * Use for: Tight spacing between related elements
   */
  xs: 4,

  /**
   * Small - 8px (0.5rem)
   * Use for: Small gaps, compact layouts
   */
  sm: 8,

  /**
   * Medium - 16px (1rem)
   * Use for: Default spacing, standard gaps
   */
  md: 16,

  /**
   * Large - 24px (1.5rem)
   * Use for: Section spacing, larger gaps
   */
  lg: 24,

  /**
   * Extra large - 32px (2rem)
   * Use for: Component separation, major sections
   */
  xl: 32,

  /**
   * 2X large - 48px (3rem)
   * Use for: Page section spacing
   */
  '2xl': 48,

  /**
   * 3X large - 64px (4rem)
   * Use for: Major page divisions, hero sections
   */
  '3xl': 64,
} as const;

/**
 * Rem values for spacing (for web/CSS usage)
 */
export const spacingRem = {
  xs: '0.25rem',   // 4px
  sm: '0.5rem',    // 8px
  md: '1rem',      // 16px
  lg: '1.5rem',    // 24px
  xl: '2rem',      // 32px
  '2xl': '3rem',   // 48px
  '3xl': '4rem',   // 64px
} as const;

export default spacing;
