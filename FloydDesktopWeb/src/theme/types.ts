/**
 * Theme Types for Floyd Desktop Web
 * Supports multiple themes with dynamic switching via CSS variables
 * A+ Alignment: 81 colors (22 core + 36 extended + 9 role + 8 syntax + 6 diff)
 */

export type ThemeId = 'crush' | 'light';

/**
 * Extended color palette - 31 colors from CharmTone system
 */
export interface ExtendedColors {
  // Reds/Pinks
  coral: string;
  salmon: string;
  cherry: string;
  sriracha: string;
  chili: string;
  bengal: string;
  blush: string;

  // Purples
  violet: string;
  mauve: string;
  grape: string;
  plum: string;
  orchid: string;
  jelly: string;
  hazy: string;
  prince: string;
  urchin: string;

  // Blues
  malibu: string;
  sardine: string;
  damson: string;
  thunder: string;
  anchovy: string;
  sapphire: string;
  guppy: string;
  oceania: string;
  ox: string;

  // Greens
  guac: string;
  julep: string;
  pickle: string;
  gator: string;
  spinach: string;

  // Yellows
  citron: string;

  // Oranges/Tans
  cumin: string;
  tang: string;
  yam: string;
  paprika: string;
  uni: string;
}

/**
 * Syntax highlighting colors - 8 tokens
 */
export interface SyntaxColors {
  keywords: string;
  functions: string;
  strings: string;
  numbers: string;
  comments: string;
  classes: string;
  operators: string;
  punctuation: string;
}

/**
 * Diff view colors - 6 tokens
 */
export interface DiffColors {
  addition: {
    lineNumber: string;
    symbol: string;
    background: string;
  };
  deletion: {
    lineNumber: string;
    symbol: string;
    background: string;
  };
}

/**
 * Role-based semantic colors - 9 roles
 */
export interface RoleColors {
  headerTitle: string;
  headerStatus: string;
  userLabel: string;
  assistantLabel: string;
  systemLabel: string;
  toolLabel: string;
  thinking: string;
  inputPrompt: string;
  hint: string;
}

export interface ThemeColors {
  // Background colors (Rustic)
  bg: {
    base: string;
    elevated: string;
    overlay: string;
    modal: string;
  };

  // Text colors (Ash)
  text: {
    primary: string;
    secondary: string;
    tertiary: string;
    subtle: string;
    selected: string;
    inverse: string;
  };

  // Accent colors (Charm)
  accent: {
    primary: string;    // Charple - purple
    secondary: string;  // Dolly - pink
    tertiary: string;   // Bok - teal
    highlight: string;  // Zest - yellow
    info: string;       // Malibu - blue
  };

  // Status colors (Speedy)
  status: {
    ready: string;      // Guac - green
    working: string;    // Charple - purple
    warning: string;    // Zest - yellow
    error: string;      // Sriracha - red
    blocked: string;    // Dolly - pink
    offline: string;    // Squid - gray
    busy: string;       // Citron - lime
  };

  // Extended palette - 31 colors
  extended: ExtendedColors;

  // Role-based semantic colors - 9 roles
  roles: RoleColors;

  // Syntax highlighting colors - 8 tokens
  syntax: SyntaxColors;

  // Diff view colors - 6 tokens
  diff: DiffColors;
}

export interface Theme {
  id: ThemeId;
  name: string;
  colors: ThemeColors;
}
