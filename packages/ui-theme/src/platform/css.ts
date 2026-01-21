/**
 * CRUSH Theme - CSS Variables Generator
 *
 * Generates CSS custom properties (variables) for web platforms.
 *
 * @example
 * ```js
 * import { generateCSSVariables } from '@floyd/ui-theme/platform/css';
 *
 * // Output to a .css file
 * console.log(generateCSSVariables());
 * ```
 */

import { colors } from '../tokens/colors.js';
import { spacing, spacingRem } from '../tokens/spacing.js';
import { typography } from '../tokens/typography.js';
import { effects } from '../tokens/effects.js';

/**
 * Generate CSS custom properties for the CRUSH theme
 */
export function generateCSSVariables(): string {
  return `/**
 * CRUSH Theme - CSS Custom Properties
 *
 * Generated from @floyd/ui-theme
 * Do not edit manually - regenerate from source
 */

:root {
  /* ============================================================================
     BACKGROUND COLORS (Rustic)
     =========================================================================== */
  --crush-bg-base: ${colors.background.base};
  --crush-bg-elevated: ${colors.background.elevated};
  --crush-bg-overlay: ${colors.background.overlay};
  --crush-bg-modal: ${colors.background.modal};

  /* ============================================================================
     TEXT COLORS (Ash)
     =========================================================================== */
  --crush-text-primary: ${colors.text.primary};
  --crush-text-secondary: ${colors.text.secondary};
  --crush-text-tertiary: ${colors.text.tertiary};
  --crush-text-subtle: ${colors.text.subtle};
  --crush-text-selected: ${colors.text.selected};
  --crush-text-inverse: ${colors.text.inverse};

  /* ============================================================================
     ACCENT COLORS (Charm)
     =========================================================================== */
  --crush-accent-primary: ${colors.accent.primary};
  --crush-accent-secondary: ${colors.accent.secondary};
  --crush-accent-tertiary: ${colors.accent.tertiary};
  --crush-accent-highlight: ${colors.accent.highlight};
  --crush-accent-info: ${colors.accent.info};

  /* ============================================================================
     STATUS COLORS (Speedy)
     =========================================================================== */
  --crush-status-ready: ${colors.status.ready};
  --crush-status-working: ${colors.status.working};
  --crush-status-warning: ${colors.status.warning};
  --crush-status-error: ${colors.status.error};
  --crush-status-blocked: ${colors.status.blocked};
  --crush-status-offline: ${colors.status.offline};
  --crush-status-busy: ${colors.status.busy};

  /* ============================================================================
     ROLE-BASED COLORS (Semantic UI)
     =========================================================================== */
  --crush-role-header-title: ${colors.role.headerTitle};
  --crush-role-header-status: ${colors.role.headerStatus};
  --crush-role-user-label: ${colors.role.userLabel};
  --crush-role-assistant-label: ${colors.role.assistantLabel};
  --crush-role-system-label: ${colors.role.systemLabel};
  --crush-role-tool-label: ${colors.role.toolLabel};
  --crush-role-thinking: ${colors.role.thinking};
  --crush-role-input-prompt: ${colors.role.inputPrompt};
  --crush-role-hint: ${colors.role.hint};

  /* ============================================================================
     HOVER STATES
     =========================================================================== */
  --crush-hover-primary: ${colors.hover.primary};
  --crush-hover-tertiary: ${colors.hover.tertiary};

  /* ============================================================================
     SPACING (4px base unit)
     =========================================================================== */
  --crush-spacing-xs: ${spacingRem.xs};   /* 4px */
  --crush-spacing-sm: ${spacingRem.sm};   /* 8px */
  --crush-spacing-md: ${spacingRem.md};   /* 16px */
  --crush-spacing-lg: ${spacingRem.lg};   /* 24px */
  --crush-spacing-xl: ${spacingRem.xl};   /* 32px */
  --crush-spacing-2xl: ${spacingRem['2xl']}; /* 48px */
  --crush-spacing-3xl: ${spacingRem['3xl']}; /* 64px */

  /* ============================================================================
     TYPOGRAPHY
     =========================================================================== */
  --crush-font-sans: ${typography.fontFamily.sans};
  --crush-font-mono: ${typography.fontFamily.mono};

  --crush-font-size-xs: ${typography.fontSize.xs.rem};
  --crush-font-size-sm: ${typography.fontSize.sm.rem};
  --crush-font-size-base: ${typography.fontSize.base.rem};
  --crush-font-size-lg: ${typography.fontSize.lg.rem};
  --crush-font-size-xl: ${typography.fontSize.xl.rem};
  --crush-font-size-2xl: ${typography.fontSize['2xl'].rem};
  --crush-font-size-3xl: ${typography.fontSize['3xl'].rem};

  --crush-font-weight-normal: ${typography.fontWeight.normal};
  --crush-font-weight-medium: ${typography.fontWeight.medium};
  --crush-font-weight-semibold: ${typography.fontWeight.semibold};
  --crush-font-weight-bold: ${typography.fontWeight.bold};

  --crush-line-height-tight: ${typography.lineHeight.tight};
  --crush-line-height-normal: ${typography.lineHeight.normal};
  --crush-line-height-relaxed: ${typography.lineHeight.relaxed};

  /* ============================================================================
     EFFECTS
     =========================================================================== */
  --crush-radius-sm: ${effects.radius.sm};
  --crush-radius-md: ${effects.radius.md};
  --crush-radius-lg: ${effects.radius.lg};
  --crush-radius-xl: ${effects.radius.xl};
  --crush-radius-full: ${effects.radius.full};

  --crush-shadow-sm: ${effects.shadow.sm};
  --crush-shadow-md: ${effects.shadow.md};
  --crush-shadow-lg: ${effects.shadow.lg};
  --crush-shadow-xl: ${effects.shadow.xl};

  --crush-transition-fast: ${effects.transition.fast.duration} ${effects.transition.fast.cubicBezier.replace('cubic-bezier', '')};
  --crush-transition-base: ${effects.transition.base.duration} ${effects.transition.base.cubicBezier.replace('cubic-bezier', '')};
  --crush-transition-slow: ${effects.transition.slow.duration} ${effects.transition.slow.cubicBezier.replace('cubic-bezier', '')};

  /* ============================================================================
     OPACITY
     =========================================================================== */
  --crush-opacity-transparent: ${effects.opacity.transparent};
  --crush-opacity-faint: ${effects.opacity.faint};
  --crush-opacity-subtle: ${effects.opacity.subtle};
  --crush-opacity-medium: ${effects.opacity.medium};
  --crush-opacity-strong: ${effects.opacity.strong};
  --crush-opacity-opaque: ${effects.opacity.opaque};
}

/**
 * Dark mode is the default and only mode for CRUSH theme
 * All components should use the variables above
 */
`;
}

/**
 * Generate CSS with utility class mappings
 */
export function generateCSSUtilities(): string {
  return `/**
 * CRUSH Theme - Utility Classes
 *
 * Generated from @floyd/ui-theme
 * Use alongside the CSS variables for rapid development
 */

/* ============================================================================
   BACKGROUND UTILITIES
   =========================================================================== */
.bg-crush-base { background-color: var(--crush-bg-base); }
.bg-crush-elevated { background-color: var(--crush-bg-elevated); }
.bg-crush-overlay { background-color: var(--crush-bg-overlay); }
.bg-crush-modal { background-color: var(--crush-bg-modal); }

/* ============================================================================
   TEXT COLOR UTILITIES
   =========================================================================== */
.text-crush-primary { color: var(--crush-text-primary); }
.text-crush-secondary { color: var(--crush-text-secondary); }
.text-crush-tertiary { color: var(--crush-text-tertiary); }
.text-crush-subtle { color: var(--crush-text-subtle); }

/* ============================================================================
   ACCENT COLOR UTILITIES
   =========================================================================== */
.text-crush-primary { color: var(--crush-accent-primary); }
.text-crush-secondary { color: var(--crush-accent-secondary); }
.text-crush-tertiary { color: var(--crush-accent-tertiary); }
.text-crush-info { color: var(--crush-accent-info); }

.bg-crush-primary { background-color: var(--crush-accent-primary); }
.bg-crush-secondary { background-color: var(--crush-accent-secondary); }
.bg-crush-tertiary { background-color: var(--crush-accent-tertiary); }

/* ============================================================================
   STATUS COLOR UTILITIES
   =========================================================================== */
.text-crush-ready { color: var(--crush-status-ready); }
.text-crush-working { color: var(--crush-status-working); }
.text-crush-warning { color: var(--crush-status-warning); }
.text-crush-error { color: var(--crush-status-error); }
.text-crush-blocked { color: var(--crush-status-blocked); }
.text-crush-offline { color: var(--crush-status-offline); }

.bg-crush-ready { background-color: var(--crush-status-ready); }
.bg-crush-working { background-color: var(--crush-status-working); }
.bg-crush-warning { background-color: var(--crush-status-warning); }
.bg-crush-error { background-color: var(--crush-status-error); }

/* Opacity variants for backgrounds */
.bg-crush-ready\\/10 { background-color: color-mix(in srgb, var(--crush-status-ready) 10%, transparent); }
.bg-crush-ready\\/20 { background-color: color-mix(in srgb, var(--crush-status-ready) 20%, transparent); }
.bg-crush-primary\\/10 { background-color: color-mix(in srgb, var(--crush-accent-primary) 10%, transparent); }
.bg-crush-secondary\\/10 { background-color: color-mix(in srgb, var(--crush-accent-secondary) 10%, transparent); }
.bg-crush-secondary\\/20 { background-color: color-mix(in srgb, var(--crush-accent-secondary) 20%, transparent); }

/* ============================================================================
   BORDER UTILITIES
   =========================================================================== */
.border-crush-overlay { border-color: var(--crush-bg-overlay); }
.border-crush-modal { border-color: var(--crush-bg-modal); }
.border-crush-primary { border-color: var(--crush-accent-primary); }
.border-crush-secondary { border-color: var(--crush-accent-secondary); }

/* ============================================================================
   RADIUS UTILITIES
   =========================================================================== */
.rounded-crush-sm { border-radius: var(--crush-radius-sm); }
.rounded-crush-md { border-radius: var(--crush-radius-md); }
.rounded-crush-lg { border-radius: var(--crush-radius-lg); }

/* ============================================================================
   FOCUS UTILITIES
   =========================================================================== */
.ring-crush-primary {
  --tw-ring-color: var(--crush-accent-primary);
}
.ring-offset-crush-base {
  --tw-ring-offset-color: var(--crush-bg-base);
}
`;
}

/**
 * CLI-side script entry point
 */
if (import.meta.url === `file://${process.argv[1]}`) {
  console.log(generateCSSVariables());
}

export default generateCSSVariables;
