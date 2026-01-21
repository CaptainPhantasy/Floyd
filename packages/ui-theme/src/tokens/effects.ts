/**
 * CRUSH Theme - Effect Tokens
 *
 * Shadows, border radius, transitions, and other visual effects.
 */

/**
 * Shadow scale for depth and elevation
 */
export const shadow = {
  /**
   * No shadow
   */
  none: 'none',

  /**
   * Small shadow - subtle elevation
   * Use for: Cards, slight elevation
   */
  sm: '0 1px 2px rgba(0, 0, 0, 0.3)',

  /**
   * Medium shadow - moderate elevation
   * Use for: Dropdowns, popovers, raised elements
   */
  md: '0 4px 6px rgba(0, 0, 0, 0.4)',

  /**
   * Large shadow - high elevation
   * Use for: Modals, major overlays
   */
  lg: '0 10px 15px rgba(0, 0, 0, 0.5)',

  /**
   * Extra large shadow - maximum elevation
   * Use for: Dialogs, highest elements
   */
  xl: '0 20px 25px rgba(0, 0, 0, 0.6)',
} as const;

/**
 * Border radius scale
 */
export const radius = {
  /**
   * No border radius
   */
  none: '0',

  /**
   * Small radius - 2px
   * Use for: Subtle rounding, badges
   */
  sm: '0.125rem', // 2px

  /**
   * Medium radius - 4px
   * Use for: Buttons, inputs, cards
   */
  md: '0.25rem', // 4px

  /**
   * Large radius - 8px
   * Use for: Cards, larger buttons
   */
  lg: '0.5rem', // 8px

  /**
   * Extra large radius - 12px
   * Use for: Large cards, modals
   */
  xl: '0.75rem', // 12px

  /**
   * Full radius - pill/circle
   * Use for: Pills, badges, circular elements
   */
  full: '9999px',
} as const;

/**
 * Transition duration and timing
 */
export const transition = {
  /**
   * Fast - 150ms
   * Use for: Micro-interactions, hover states
   */
  fast: {
    duration: '150ms',
    cubicBezier: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },

  /**
   * Base - 300ms
   * Use for: Standard transitions
   */
  base: {
    duration: '300ms',
    cubicBezier: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },

  /**
   * Slow - 600ms
   * Use for: Major state changes, animations
   */
  slow: {
    duration: '600ms',
    cubicBezier: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },
} as const;

/**
 * Opacity scale for overlays and disabled states
 */
export const opacity = {
  /**
   * Fully transparent
   */
  transparent: 0,

  /**
   * Very faint - 10%
   * Use for: Very subtle overlays
   */
  faint: 0.1,

  /**
   * Subtle - 20%
   * Use for: Subtle overlays, tints
   */
  subtle: 0.2,

  /**
   * Medium - 50%
   * Use for: Disabled states, medium overlays
   */
  medium: 0.5,

  /**
   * Strong - 80%
   * Use for: Hover previews, strong overlays
   */
  strong: 0.8,

  /**
   * Fully opaque
   */
  opaque: 1,
} as const;

/**
 * Complete effects scale
 */
export const effects = {
  shadow,
  radius,
  transition,
  opacity,
} as const;

export default effects;
