/**
 * Floyd Chrome Extension Theme System
 * Supports CRUSH (default) and Light themes with dynamic switching
 * A+ Alignment: 81 colors (22 core + 36 extended + 9 role + 8 syntax + 6 diff)
 */

// ============================================================================
// CRUSH THEME (Default - Dark, CharmUI aesthetic)
// ============================================================================

// Extended palette - 31 colors from CharmTone
const CRUSH_EXTENDED = {
  // Reds/Pinks -> Mapped to Monochrome/Blue
  coral: '#FFFFFF',
  salmon: '#E0E0E0',
  cherry: '#00C2FF',
  sriracha: '#FF4444',
  chili: '#FFFFFF',
  bengal: '#FFCC00',
  blush: '#FFFFFF',

  // Purples -> Mapped to Blues
  violet: '#2E95D3',
  mauve: '#00C2FF',
  grape: '#00E5FF',
  plum: '#2E95D3',
  orchid: '#00C2FF',
  jelly: '#0A0A0A',
  hazy: '#2E95D3',
  prince: '#FFFFFF',
  urchin: '#00C2FF',

  // Blues
  malibu: '#2E95D3',
  sardine: '#00C2FF',
  damson: '#007AB8',
  thunder: '#4776FF',
  anchovy: '#719AFC',
  sapphire: '#4949FF',
  guppy: '#7272FF',
  oceania: '#2B55B3',
  ox: '#3331B2',

  // Greens
  guac: '#12C78F',
  julep: '#00FFB2',
  pickle: '#00A475',
  gator: '#18463D',
  spinach: '#1C3634',

  // Yellows
  citron: '#E8FF27',

  // Oranges/Tans
  cumin: '#BF976F',
  tang: '#FF985A',
  yam: '#FFB587',
  paprika: '#D36C64',
  uni: '#FF937D',
};

// Role-based semantic colors - 9 roles
const CRUSH_ROLES = {
  headerTitle: '#00C2FF',    // accent.secondary (Cyan)
  headerStatus: '#FFFFFF',   // text.primary (White)
  userLabel: '#FFFFFF',      // White
  assistantLabel: '#2E95D3', // accent.info (Electric Blue)
  systemLabel: '#444444',    // Dark Gray
  toolLabel: '#00E5FF',      // Bright Cyan
  thinking: '#2E95D3',       // Blue
  inputPrompt: '#00C2FF',    // Cyan
  hint: '#666666',           // Medium Gray
};

// Syntax highlighting colors - 8 tokens
const CRUSH_SYNTAX = {
  keywords: '#00C2FF',     // Cyan
  functions: '#FFFFFF',    // White
  strings: '#2E95D3',      // Blue
  numbers: '#00E5FF',      // Bright Cyan
  comments: '#444444',     // Dark Gray
  classes: '#FFFFFF',      // White
  operators: '#FFFFFF',    // White
  punctuation: '#666666',  // Gray
};

// Diff view colors - 6 tokens
const CRUSH_DIFF = {
  addition: {
    lineNumber: '#2E95D3',
    symbol: '#2E95D3',
    background: '#001122',
  },
  deletion: {
    lineNumber: '#444444',
    symbol: '#444444',
    background: '#111111',
  },
};

const CRUSH_THEME = {
  id: 'crush',
  name: 'CRUSH',
  colors: {
    // Background colors (Floyd Black & Blue)
    bg: {
      base: '#000000',      // Pure Black
      elevated: '#050505',  // Obsidian
      overlay: '#0A0A0A',   // Near Black
      modal: '#111111',     // Darkest Gray
    },

    // Text colors (High Contrast)
    text: {
      primary: '#FFFFFF',   // White
      secondary: '#CCCCCC', // Light Gray
      tertiary: '#888888',  // Medium Gray
      subtle: '#444444',    // Dark Gray
      selected: '#FFFFFF',  // White
      inverse: '#000000',   // Black
    },

    // Accent colors (Electric Blue Theme)
    accent: {
      primary: '#2E95D3',   // Electric Blue
      secondary: '#00C2FF', // Cyan Blue
      tertiary: '#00E5FF',  // Bright Cyan
      highlight: '#FFFFFF', // White
      info: '#2E95D3',      // Blue
    },

    // Status colors
    status: {
      ready: '#00C2FF',     // Cyan
      working: '#2E95D3',   // Blue
      warning: '#FFCC00',   // Yellow
      error: '#FF4444',     // Red
      blocked: '#444444',   // Dark Gray
      offline: '#222222',   // Charcoal
      busy: '#00E5FF',      // Bright Cyan
    },

    // Extended palette - Mapped to Blues/Blacks
    extended: CRUSH_EXTENDED,

    // Role-based semantic colors - 9 roles
    roles: CRUSH_ROLES,

    // Syntax highlighting colors - 8 tokens
    syntax: CRUSH_SYNTAX,

    // Diff view colors - 6 tokens
    diff: CRUSH_DIFF,
  },
};

// ============================================================================
// LIGHT THEME
// ============================================================================

// Light theme uses same extended colors for brand consistency
const LIGHT_EXTENDED = { ...CRUSH_EXTENDED };

// Light theme role colors - uses light theme text colors
const LIGHT_ROLES = {
  headerTitle: '#FF60FF',    // accent.secondary (Dolly)
  headerStatus: '#1D1D1F',   // text.primary (dark)
  userLabel: '#12C78F',      // status.ready (Guac)
  assistantLabel: '#00A4FF', // accent.info (Malibu)
  systemLabel: '#E8FE96',    // accent.highlight (Zest)
  toolLabel: '#68FFD6',      // accent.tertiary (Bok)
  thinking: '#E8FE96',       // accent.highlight (Zest)
  inputPrompt: '#12C78F',    // status.ready (Guac)
  hint: '#6E6E73',           // text.secondary (gray)
};

// Light theme syntax colors - same as CRUSH
const LIGHT_SYNTAX = { ...CRUSH_SYNTAX };

// Light theme diff colors - same as CRUSH
const LIGHT_DIFF = { ...CRUSH_DIFF };

const LIGHT_THEME = {
  id: 'light',
  name: 'Light',
  colors: {
    // Background colors
    bg: {
      base: '#FFFFFF',
      elevated: '#F5F5F7',
      overlay: '#E5E5EA',
      modal: '#D1D1D6',
    },

    // Text colors
    text: {
      primary: '#1D1D1F',
      secondary: '#6E6E73',
      tertiary: '#86868B',
      subtle: '#A1A1A6',
      selected: '#000000',
      inverse: '#FFFFFF',
    },

    // Accent colors (same as CRUSH for brand consistency)
    accent: {
      primary: '#6B50FF',
      secondary: '#FF60FF',
      tertiary: '#68FFD6',
      highlight: '#E8FE96',
      info: '#00A4FF',
    },

    // Status colors (same as CRUSH)
    status: {
      ready: '#12C78F',
      working: '#6B50FF',
      warning: '#E8FE96',
      error: '#EB4268',
      blocked: '#FF60FF',
      offline: '#858392',
      busy: '#E8FF27',
    },

    // Extended palette - same as CRUSH
    extended: LIGHT_EXTENDED,

    // Role-based colors
    roles: LIGHT_ROLES,

    // Syntax colors
    syntax: LIGHT_SYNTAX,

    // Diff colors
    diff: LIGHT_DIFF,
  },
};

// ============================================================================
// THEME SYSTEM
// ============================================================================

const THEMES = {
  crush: CRUSH_THEME,
  light: LIGHT_THEME,
};

const THEME_STORAGE_KEY = 'floyd-chrome-theme';
let currentTheme = 'crush';

/**
 * Initialize theme system
 */
export function initTheme() {
  // Load saved theme from localStorage
  const saved = localStorage.getItem(THEME_STORAGE_KEY);
  if (saved && saved in THEMES) {
    currentTheme = saved;
  }
  applyTheme(currentTheme);
}

/**
 * Apply theme to document
 */
export function applyTheme(themeId) {
  const theme = THEMES[themeId];
  if (!theme) return;

  const root = document.documentElement;
  const colors = theme.colors;

  // Background colors
  root.style.setProperty('--color-bg-base', colors.bg.base);
  root.style.setProperty('--color-bg-elevated', colors.bg.elevated);
  root.style.setProperty('--color-bg-overlay', colors.bg.overlay);
  root.style.setProperty('--color-bg-modal', colors.bg.modal);

  // Text colors
  root.style.setProperty('--color-text-primary', colors.text.primary);
  root.style.setProperty('--color-text-secondary', colors.text.secondary);
  root.style.setProperty('--color-text-tertiary', colors.text.tertiary);
  root.style.setProperty('--color-text-subtle', colors.text.subtle);
  root.style.setProperty('--color-text-selected', colors.text.selected);
  root.style.setProperty('--color-text-inverse', colors.text.inverse);

  // Accent colors
  root.style.setProperty('--color-accent-primary', colors.accent.primary);
  root.style.setProperty('--color-accent-secondary', colors.accent.secondary);
  root.style.setProperty('--color-accent-tertiary', colors.accent.tertiary);
  root.style.setProperty('--color-accent-highlight', colors.accent.highlight);
  root.style.setProperty('--color-accent-info', colors.accent.info);

  // Status colors
  root.style.setProperty('--color-status-ready', colors.status.ready);
  root.style.setProperty('--color-status-working', colors.status.working);
  root.style.setProperty('--color-status-warning', colors.status.warning);
  root.style.setProperty('--color-status-error', colors.status.error);
  root.style.setProperty('--color-status-blocked', colors.status.blocked);
  root.style.setProperty('--color-status-offline', colors.status.offline);
  root.style.setProperty('--color-status-busy', colors.status.busy);

  // Extended colors - 31 colors
  Object.entries(colors.extended).forEach(([key, value]) => {
    root.style.setProperty(`--color-extended-${key}`, value);
  });

  // Role colors - 9 roles
  Object.entries(colors.roles).forEach(([key, value]) => {
    root.style.setProperty(`--color-role-${key}`, value);
  });

  // Syntax colors - 8 tokens
  Object.entries(colors.syntax).forEach(([key, value]) => {
    root.style.setProperty(`--color-syntax-${key}`, value);
  });

  // Diff colors - 6 tokens
  root.style.setProperty('--color-diff-addition-line-number', colors.diff.addition.lineNumber);
  root.style.setProperty('--color-diff-addition-symbol', colors.diff.addition.symbol);
  root.style.setProperty('--color-diff-addition-background', colors.diff.addition.background);
  root.style.setProperty('--color-diff-deletion-line-number', colors.diff.deletion.lineNumber);
  root.style.setProperty('--color-diff-deletion-symbol', colors.diff.deletion.symbol);
  root.style.setProperty('--color-diff-deletion-background', colors.diff.deletion.background);

  // Store theme preference
  localStorage.setItem(THEME_STORAGE_KEY, themeId);
  currentTheme = themeId;

  // Update theme toggle button
  updateThemeToggle();
}

/**
 * Toggle between themes
 */
export function toggleTheme() {
  const newTheme = currentTheme === 'crush' ? 'light' : 'crush';
  applyTheme(newTheme);
}

/**
 * Get current theme ID
 */
export function getCurrentTheme() {
  return currentTheme;
}

/**
 * Get a color from the theme by key path
 * @param {string} path - Dot-notation path to color (e.g., 'bg.base', 'status.error')
 * @param {string} themeId - The theme to get the color from (defaults to current theme)
 * @returns {string|undefined} Color hex string or undefined if not found
 */
export function getColor(path, themeId = currentTheme) {
  const theme = THEMES[themeId];
  if (!theme) return undefined;

  const keys = path.split('.');
  let current = theme.colors;

  for (const key of keys) {
    if (current?.[key] !== undefined) {
      current = current[key];
    } else {
      return undefined;
    }
  }

  return typeof current === 'string' ? current : undefined;
}

/**
 * Check if a color exists in the theme
 * @param {string} color - Hex color string to check
 * @param {string} themeId - The theme to check (defaults to crush)
 * @returns {boolean} True if color is in the theme palette
 */
export function hasColor(color, themeId = 'crush') {
  const theme = THEMES[themeId];
  if (!theme) return false;

  const allColors = Object.values({
    ...theme.colors.bg,
    ...theme.colors.text,
    ...theme.colors.accent,
    ...theme.colors.status,
    ...theme.colors.extended,
  });

  return allColors.includes(color);
}

/**
 * Update theme toggle button appearance
 */
function updateThemeToggle() {
  const toggle = document.getElementById('theme-toggle');
  if (!toggle) return;

  const isCrush = currentTheme === 'crush';
  // Update icon based on theme
  toggle.innerHTML = isCrush
    ? '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>' // Moon
    : '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>'; // Sun
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initTheme);
} else {
  initTheme();
}
