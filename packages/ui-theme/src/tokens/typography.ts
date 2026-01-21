/**
 * CRUSH Theme - Typography Tokens
 *
 * Font families, sizes, weights, and line heights for consistent typography.
 */

/**
 * Font family definitions
 */
export const fontFamily = {
  /**
   * System sans-serif font stack
   * Use for: UI text, body text, labels
   */
  sans: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, sans-serif',

  /**
   * Monospace font stack
   * Use for: Code, data, terminal output, CLI
   */
  mono: '"Courier New", "Courier", monospace',
} as const;

/**
 * Font size scale (in pixels and rem)
 *
 * Based on a 16px (1rem) base for body text.
 */
export const fontSize = {
  /**
   * Extra small - 12px (0.75rem)
   * Use for: Captions, tiny labels
   */
  xs: { px: 12, rem: '0.75rem' },

  /**
   * Small - 14px (0.875rem)
   * Use for: Small text, secondary content
   */
  sm: { px: 14, rem: '0.875rem' },

  /**
   * Base - 16px (1rem)
   * Use for: Default body text, standard content
   */
  base: { px: 16, rem: '1rem' },

  /**
   * Large - 18px (1.125rem)
   * Use for: Large text, emphasis
   */
  lg: { px: 18, rem: '1.125rem' },

  /**
   * Extra large - 20px (1.25rem)
   * Use for: Subheadings, large labels
   */
  xl: { px: 20, rem: '1.25rem' },

  /**
   * 2X large - 24px (1.5rem)
   * Use for: Headings, page titles
   */
  '2xl': { px: 24, rem: '1.5rem' },

  /**
   * 3X large - 32px (2rem)
   * Use for: Hero titles, major headings
   */
  '3xl': { px: 32, rem: '2rem' },
} as const;

/**
 * Font weight definitions
 */
export const fontWeight = {
  /**
   * Normal - 400
   * Use for: Body text, standard content
   */
  normal: 400,

  /**
   * Medium - 500
   * Use for: Emphasized text, labels
   */
  medium: 500,

  /**
   * Semibold - 600
   * Use for: Subheadings, UI labels
   */
  semibold: 600,

  /**
   * Bold - 700
   * Use for: Headings, important text
   */
  bold: 700,
} as const;

/**
 * Line height scale (unitless multiples of font size)
 */
export const lineHeight = {
  /**
   * Tight - 1.25
   * Use for: Headings, compact text
   */
  tight: 1.25,

  /**
   * Normal - 1.5
   * Use for: Body text, standard content
   */
  normal: 1.5,

  /**
   * Relaxed - 1.75
   * Use for: Relaxed reading, long-form content
   */
  relaxed: 1.75,
} as const;

/**
 * Complete typography scale
 */
export const typography = {
  fontFamily,
  fontSize,
  fontWeight,
  lineHeight,
} as const;

export default typography;
