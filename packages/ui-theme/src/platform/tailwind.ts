/**
 * CRUSH Theme - Tailwind CSS Configuration Generator
 *
 * Generates a Tailwind config object with all CRUSH theme tokens.
 *
 * @example
 * ```js
 * // In tailwind.config.js
 * import { generateTailwindConfig } from '@floyd/ui-theme/platform/tailwind';
 *
 * export default generateTailwindConfig();
 * ```
 */

import { colors } from '../tokens/colors.js';
import { spacing, spacingRem } from '../tokens/spacing.js';
import { typography } from '../tokens/typography.js';
import { effects } from '../tokens/effects.js';

/**
 * Generate a Tailwind CSS configuration object
 */
export function generateTailwindConfig() {
  return {
    content: ['./src/**/*.{js,jsx,ts,tsx}'],
    theme: {
      extend: {
        // Background colors (Rustic)
        colors: {
          // CRUSH theme
          crush: {
            // Background colors
            base: colors.background.base,
            elevated: colors.background.elevated,
            overlay: colors.background.overlay,
            modal: colors.background.modal,

            // Text colors
            'text-primary': colors.text.primary,
            'text-secondary': colors.text.secondary,
            'text-tertiary': colors.text.tertiary,
            'text-subtle': colors.text.subtle,
            'text-selected': colors.text.selected,

            // Accent colors (Charm)
            primary: colors.accent.primary,
            secondary: colors.accent.secondary,
            tertiary: colors.accent.tertiary,
            highlight: colors.accent.highlight,
            info: colors.accent.info,

            // Status colors (Speedy)
            ready: colors.status.ready,
            working: colors.status.working,
            warning: colors.status.warning,
            error: colors.status.error,
            blocked: colors.status.blocked,
            offline: colors.status.offline,

            // Hover states
            grape: colors.hover.primary,
            julep: colors.hover.tertiary,
          },

          // Role-based semantic colors
          role: {
            'user-label': colors.role.userLabel,
            'assistant-label': colors.role.assistantLabel,
            'system-label': colors.role.systemLabel,
            'tool-label': colors.role.toolLabel,
            'thinking': colors.role.thinking,
            'input-prompt': colors.role.inputPrompt,
            'hint': colors.role.hint,
          },
        },

        // Spacing scale
        spacing: {
          xs: spacing.xs,
          sm: spacing.sm,
          md: spacing.md,
          lg: spacing.lg,
          xl: spacing.xl,
          '2xl': spacing['2xl'],
          '3xl': spacing['3xl'],
        },

        // Typography
        fontFamily: {
          sans: [typography.fontFamily.sans],
          mono: [typography.fontFamily.mono],
        },
        fontSize: {
          xs: typography.fontSize.xs,
          sm: typography.fontSize.sm,
          base: typography.fontSize.base,
          lg: typography.fontSize.lg,
          xl: typography.fontSize.xl,
          '2xl': typography.fontSize['2xl'],
          '3xl': typography.fontSize['3xl'],
        },
        fontWeight: {
          normal: typography.fontWeight.normal,
          medium: typography.fontWeight.medium,
          semibold: typography.fontWeight.semibold,
          bold: typography.fontWeight.bold,
        },
        lineHeight: {
          tight: typography.lineHeight.tight,
          normal: typography.lineHeight.normal,
          relaxed: typography.lineHeight.relaxed,
        },

        // Effects
        borderRadius: {
          none: effects.radius.none,
          sm: effects.radius.sm,
          md: effects.radius.md,
          lg: effects.radius.lg,
          xl: effects.radius.xl,
          full: effects.radius.full,
        },
        boxShadow: {
          none: effects.shadow.none,
          sm: effects.shadow.sm,
          md: effects.shadow.md,
          lg: effects.shadow.lg,
          xl: effects.shadow.xl,
        },
        transitionDuration: {
          fast: effects.transition.fast.duration,
          base: effects.transition.base.duration,
          slow: effects.transition.slow.duration,
        },
      },
    },
    plugins: [],
  };
}

/**
 * Generate Tailwind config as a module (for CLI usage)
 */
export function generateTailwindModule() {
  const config = generateTailwindConfig();
  return `/** @type {import('tailwindcss').Config} */
export default ${JSON.stringify(config, null, 2)};
`;
}

/**
 * Default export for convenience
 */
export default generateTailwindConfig;
