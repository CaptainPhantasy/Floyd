/**
 * CRUSH Theme - Color Tokens
 *
 * The canonical source of truth for all Floyd platform colors.
 * Based on CharmTone color system.
 *
 * Categories:
 * - Background: "Rustic" foundation (Pepper, BBQ, Charcoal, Iron)
 * - Text: "Ash" scale (Ash, Squid, Smoke, Oyster, Salt, Butter)
 * - Accent: "Charm" signature (Charple, Dolly, Bok, Zest, Malibu)
 * - Status: "Speedy" feedback (Guac, Sriracha, Zest, Dolly, Squid, Citron)
 */

// ============================================================================
// BACKGROUND COLORS (Rustic Foundation)
// ============================================================================

export const background = {
  /**
   * Pepper - Main background color
   * Use for: App background, main content areas
   */
  base: '#201F26',

  /**
   * BBQ - Elevated elements
   * Use for: Cards, panels, elevated surfaces
   */
  elevated: '#2d2c35',

  /**
   * Charcoal - Overlay backgrounds
   * Use for: Overlays, backdrop backgrounds
   */
  overlay: '#3A3943',

  /**
   * Iron - Modal/Dialog backgrounds
   * Use for: Modals, dialogs, popovers
   */
  modal: '#4D4C57',
} as const;

// ============================================================================
// TEXT COLORS (Ash Scale)
// ============================================================================

export const text = {
  /**
   * Ash - Primary text color
   * Use for: Main content, body text
   */
  primary: '#DFDBDD',

  /**
   * Squid - Secondary text color
   * Use for: Secondary content, labels, descriptions
   */
  secondary: '#959AA2',

  /**
   * Smoke - Tertiary text color
   * Use for: Tertiary content, less prominent text
   */
  tertiary: '#BFBCC8',

  /**
   * Oyster - Subtle text color
   * Use for: Hints, placeholders, disabled text
   */
  subtle: '#706F7B',

  /**
   * Salt - Selected text color
   * Use for: Selected text, highlighted text on dark backgrounds
   */
  selected: '#F1EFEF',

  /**
   * Butter - Inverse text color
   * Use for: Text on dark/accent backgrounds
   */
  inverse: '#FFFAF1',
} as const;

// ============================================================================
// ACCENT COLORS (Charm Signature)
// ============================================================================

export const accent = {
  /**
   * Charple - Primary accent color (purple)
   * Use for: Primary buttons, CTAs, focus states, links
   */
  primary: '#6B50FF',

  /**
   * Dolly - Secondary accent color (pink)
   * Use for: Branding, header gradients, highlights
   */
  secondary: '#FF60FF',

  /**
   * Bok - Tertiary accent color (teal)
   * Use for: Tool calls, success alternatives, accents
   */
  tertiary: '#68FFD6',

  /**
   * Zest - Highlight accent color (yellow)
   * Use for: Warnings, emphasis, highlights, thinking states
   */
  highlight: '#E8FE96',

  /**
   * Malibu - Info accent color (blue)
   * Use for: Info messages, assistant labels, informational content
   */
  info: '#00A4FF',
} as const;

// ============================================================================
// STATUS COLORS (Speedy Feedback)
// ============================================================================

export const status = {
  /**
   * Guac - Ready/Success state (green)
   * Use for: Success messages, online status, ready states
   */
  ready: '#12C78F',

  /**
   * Charple - Working/Processing state (purple)
   * Use for: Loading states, processing indicators
   */
  working: '#6B50FF',

  /**
   * Zest - Warning state (yellow)
   * Use for: Warning messages, caution indicators
   */
  warning: '#E8FE96',

  /**
   * Sriracha - Error state (red)
   * Use for: Error messages, critical states, failures
   */
  error: '#EB4268',

  /**
   * Dolly - Blocked/Waiting state (pink)
   * Use for: Blocked states, waiting indicators
   */
  blocked: '#FF60FF',

  /**
   * Squid - Offline state (gray)
   * Use for: Offline status, disconnected states
   */
  offline: '#858392',

  /**
   * Citron - Busy state (lime)
   * Use for: Busy states, active processing
   */
  busy: '#E8FF27',
} as const;

// ============================================================================
// ROLE-BASED COLORS (Semantic UI Roles)
// ============================================================================

/**
 * Semantic color assignments for specific UI elements.
 * These map to the color categories above but provide semantic meaning.
 */
export const role = {
  /**
   * Header title gradient color
   * Used in: Gradient headers, branding elements
   */
  headerTitle: accent.secondary, // Dolly - #FF60FF

  /**
   * Header status text color
   * Used in: Status text next to headers
   */
  headerStatus: text.primary, // Ash - #DFDBDD

  /**
   * User message label color
   * Used in: Chat user labels, user message indicators
   */
  userLabel: status.ready, // Guac - #12C78F

  /**
   * Assistant message label color
   * Used in: Chat assistant labels, AI response indicators
   */
  assistantLabel: accent.info, // Malibu - #00A4FF

  /**
   * System message label color
   * Used in: System notifications, system messages
   */
  systemLabel: accent.highlight, // Zest - #E8FE96

  /**
   * Tool call label color
   * Used in: Tool execution indicators, tool badges
   */
  toolLabel: accent.tertiary, // Bok - #68FFD6

  /**
   * Thinking/processing indicator color
   * Used in: Loading states, "thinking..." text
   */
  thinking: accent.highlight, // Zest - #E8FE96

  /**
   * Input prompt color
   * Used in: Command prompts, input indicators
   */
  inputPrompt: status.ready, // Guac - #12C78F

  /**
   * Hint/help text color
   * Used in: Help text, hints, instructions
   */
  hint: text.secondary, // Squid - #959AA2
} as const;

// ============================================================================
// DERIVED COLORS (Hover States, Variants)
// ============================================================================

/**
 * Hover state colors for interactive elements
 */
export const hover = {
  /**
   * Grape - Hover state for primary accent
   * Darker purple for button hover states
   */
  primary: '#5848cc',

  /**
   * Julep - Hover state for tertiary accent
   * Darker teal for interactive hover states
   */
  tertiary: '#4dc4a0',
} as const;

// ============================================================================
// COMPLETE COLOR EXPORT
// ============================================================================

/**
 * Complete CRUSH theme color palette
 *
 * @example
 * ```ts
 * import { colors } from '@floyd/ui-theme';
 *
 * const primaryBg = colors.background.base;
 * const primaryText = colors.text.primary;
 * const accentColor = colors.accent.primary;
 * ```
 */
export const colors = {
  background,
  text,
  accent,
  status,
  role,
  hover,
} as const;

/**
 * Default export for convenience
 */
export default colors;
