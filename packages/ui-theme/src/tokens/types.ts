/**
 * Type definitions for CRUSH theme tokens
 */

// ============================================================================
// COLOR TYPES
// ============================================================================

export interface BackgroundColors {
  readonly base: string;      // #201F26 - Pepper
  readonly elevated: string;  // #2d2c35 - BBQ
  readonly overlay: string;   // #3A3943 - Charcoal
  readonly modal: string;     // #4D4C57 - Iron
}

export interface TextColors {
  readonly primary: string;    // #DFDBDD - Ash
  readonly secondary: string;  // #959AA2 - Squid
  readonly tertiary: string;   // #BFBCC8 - Smoke
  readonly subtle: string;     // #706F7B - Oyster
  readonly selected: string;   // #F1EFEF - Salt
  readonly inverse: string;    // #FFFAF1 - Butter
}

export interface AccentColors {
  readonly primary: string;    // #6B50FF - Charple
  readonly secondary: string;  // #FF60FF - Dolly
  readonly tertiary: string;   // #68FFD6 - Bok
  readonly highlight: string;  // #E8FE96 - Zest
  readonly info: string;       // #00A4FF - Malibu
}

export interface StatusColors {
  readonly ready: string;     // #12C78F - Guac
  readonly working: string;   // #6B50FF - Charple
  readonly warning: string;   // #E8FE96 - Zest
  readonly error: string;     // #EB4268 - Sriracha
  readonly blocked: string;   // #FF60FF - Dolly
  readonly offline: string;   // #858392 - Squid
  readonly busy: string;      // #E8FF27 - Citron
}

export interface RoleColors {
  readonly headerTitle: string;
  readonly headerStatus: string;
  readonly userLabel: string;
  readonly assistantLabel: string;
  readonly systemLabel: string;
  readonly toolLabel: string;
  readonly thinking: string;
  readonly inputPrompt: string;
  readonly hint: string;
}

export interface HoverColors {
  readonly primary: string;
  readonly tertiary: string;
}

export interface Colors {
  readonly background: BackgroundColors;
  readonly text: TextColors;
  readonly accent: AccentColors;
  readonly status: StatusColors;
  readonly role: RoleColors;
  readonly hover: HoverColors;
}

// ============================================================================
// SPACING TYPES
// ============================================================================

export type SpacingValue = 4 | 8 | 16 | 24 | 32 | 48 | 64;

export interface Spacing {
  readonly xs: SpacingValue;    // 4
  readonly sm: SpacingValue;    // 8
  readonly md: SpacingValue;    // 16
  readonly lg: SpacingValue;    // 24
  readonly xl: SpacingValue;    // 32
  readonly '2xl': SpacingValue; // 48
  readonly '3xl': SpacingValue; // 64
}

// ============================================================================
// TYPOGRAPHY TYPES
// ============================================================================

export interface FontSize {
  readonly px: number;
  readonly rem: string;
}

export interface FontSizes {
  readonly xs: FontSize;     // 12px
  readonly sm: FontSize;     // 14px
  readonly base: FontSize;   // 16px
  readonly lg: FontSize;     // 18px
  readonly xl: FontSize;     // 20px
  readonly '2xl': FontSize;  // 24px
  readonly '3xl': FontSize;  // 32px
}

export interface FontWeights {
  readonly normal: number;    // 400
  readonly medium: number;    // 500
  readonly semibold: number;  // 600
  readonly bold: number;      // 700
}

export interface LineHeights {
  readonly tight: number;     // 1.25
  readonly normal: number;    // 1.5
  readonly relaxed: number;   // 1.75
}

export interface Typography {
  readonly fontFamily: {
    readonly sans: string;
    readonly mono: string;
  };
  readonly fontSize: FontSizes;
  readonly fontWeight: FontWeights;
  readonly lineHeight: LineHeights;
}

// ============================================================================
// EFFECTS TYPES
// ============================================================================

export interface Shadows {
  readonly none: string;
  readonly sm: string;
  readonly md: string;
  readonly lg: string;
  readonly xl: string;
}

export interface Radii {
  readonly none: string;
  readonly sm: string;
  readonly md: string;
  readonly lg: string;
  readonly xl: string;
  readonly full: string;
}

export interface Transitions {
  readonly fast: {
    readonly duration: string;
    readonly cubicBezier: string;
  };
  readonly base: {
    readonly duration: string;
    readonly cubicBezier: string;
  };
  readonly slow: {
    readonly duration: string;
    readonly cubicBezier: string;
  };
}

export interface OpacityValues {
  readonly transparent: number;
  readonly faint: number;
  readonly subtle: number;
  readonly medium: number;
  readonly strong: number;
  readonly opaque: number;
}

export interface Effects {
  readonly shadow: Shadows;
  readonly radius: Radii;
  readonly transition: Transitions;
  readonly opacity: OpacityValues;
}
