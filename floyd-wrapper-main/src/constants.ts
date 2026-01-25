/**
 * ⚠️ DO NOT MODIFY WITHOUT PERMISSION - VERIFIED WORKING CONFIGURATION
 * Constants - Floyd Wrapper
 *
 * Application-wide constants including version numbers, default configuration,
 * CRUSH branding, and ASCII logo.
 *
 * PRIMARY: GLM-4.7 Coding Plan API (https://api.z.ai/api/coding/paas/v4)
 */

import chalk from 'chalk';

// ============================================================================
// Version and Identity
// ============================================================================

export const FLOYD_VERSION = '0.1.0' as const;
export const FLOYD_NAME = 'Floyd' as const;
export const FLOYD_FULL_NAME = 'File-Logged Orchestrator Yielding Deliverables' as const;

// ============================================================================
// Default Configuration
// ============================================================================

/**
 * ⚠️ DO NOT MODIFY - Default Floyd Wrapper configuration
 *
 * CRITICAL: GLM-4.7 Coding Plan endpoint uses OpenAI-compatible format
 * Endpoint: https://api.z.ai/api/coding/paas/v4
 *
 * BREAKING CHANGE: Modifying endpoint will break tool calling
 */
export const DEFAULT_CONFIG = {
  glmApiEndpoint: 'https://api.z.ai/api/coding/paas/v4',
  glmModel: 'glm-4.7',
  maxTokens: 100000,
  temperature: 0.7,
  logLevel: 'info',
  cacheEnabled: true,
  permissionLevel: 'ask',
  maxTurns: 20,
  timeoutMs: 120000,
} as const;

// ============================================================================
// Tool Categories
// ============================================================================

/**
 * Available tool categories
 */
export const TOOL_CATEGORIES = [
  'file',
  'search',
  'build',
  'git',
  'browser',
  'cache',
  'patch',
  'special',
] as const;

// ============================================================================
// Permission Levels
// ============================================================================

/**
 * Tool permission levels
 */
export const PERMISSION_LEVELS = ['none', 'moderate', 'dangerous'] as const;

// ============================================================================
// CRUSH Branding
// ============================================================================

/**
 * CRUSH company branding colors and theme
 */
export const CRUSH_THEME = {
  colors: {
    // CRUSH Theme Palette (CharmTone-based)
    primary: '#6B50FF',    // Violet (Charple)
    secondary: '#FF60FF',  // Pink (Dolly)
    accent: '#68FFD6',     // Teal (Bok)
    highlight: '#E8FE96',  // Yellow (Zest)
    info: '#00A4FF',       // Blue (Malibu)

    // Status colors
    success: '#12C78F',    // Green (Guac)
    error: '#EB4268',      // Red (Sriracha)
    warning: '#E8FE96',    // Yellow (Zest)
    muted: '#959AA2',      // Gray (Squid)

    // Background colors
    bgBase: '#201F26',     // Dark background (Pepper)
    bgElevated: '#2d2c35', // Elevated elements (BBQ)
    bgOverlay: '#3A3943',  // Overlay backgrounds (Charcoal)
    bgModal: '#4D4C57',    // Modal backgrounds (Iron)

    // Text colors
    textPrimary: '#DFDBDD',   // Primary text (Ash)
    textSecondary: '#959AA2', // Secondary text (Squid)
    textSubtle: '#706F7B',    // Subtle text (Oyster)
    textInverse: '#FFFAF1',   // Inverse text (Butter)
  },
  // Role-based semantic colors
  semantic: {
    headerTitle: '#FF60FF',      // Pink for headers
    headerStatus: '#DFDBDD',     // Primary text for status
    userLabel: '#12C78F',        // Green for user messages
    assistantLabel: '#00A4FF',   // Blue for assistant messages
    systemLabel: '#E8FE96',      // Yellow for system messages
    toolLabel: '#68FFD6',        // Teal for tool calls
    thinking: '#E8FE96',         // Yellow for thinking state
    inputPrompt: '#12C78F',      // Green for input prompts
    hint: '#959AA2',             // Gray for hints
  },
} as const;

/**
 * FLOYD ASCII Banner - Branded visual header
 * Source: FLOYD_CLI ASCII art
 */
const FLOYD_ASCII_LINES = [
  "'########:'##::::::::'#######::'##:::'##:'########::::::'######::'##:::::::'####:",
  " ##.....:: ##:::::::'##.... ##:. ##:'##:: ##.... ##::::'##... ##: ##:::::::. ##::",
  ' ##::::::: ##::::::: ##:::: ##::. ####::: ##:::: ##:::: ##:::..:: ##:::::::: ##::',
  ' ######::: ##::::::: ##:::: ##:::. ##:::: ##:::: ##:::: ##::::::: ##:::::::: ##::',
  ' ##...:::: ##::::::: ##:::: ##:::: ##:::: ##:::: ##:::: ##::::::: ##:::::::: ##::',
  ' ##::::::: ##::::::: ##:::: ##:::: ##:::: ##:::: ##:::: ##::: ##: ##:::::::: ##::',
  " ##::::::: ########:. #######::::: ##:::: ########:::::. ######:: ########:'####:",
  '..::::::::........:::.......::::::..:::::........:::::::......:::........::....::',
];

const FLOYD_GRADIENT_COLORS = [
  '#FF60FF', // pink for #
  '#6060FF', // blue for :
  '#B85CFF', // lavender (other chars fallback)
  '#666666', // gray for dots
  '#888888', // light gray for quotes
];

/**
 * Render FLOYD ASCII banner with gradient colors using chalk
 */
function renderFloydBanner(): string {
  const lines: string[] = [];

  for (const line of FLOYD_ASCII_LINES) {
    let coloredLine = '';
    for (const ch of line) {
      let color = FLOYD_GRADIENT_COLORS[2]; // default lavender
      if (ch === '#') color = FLOYD_GRADIENT_COLORS[0]; // pink
      if (ch === ':') color = FLOYD_GRADIENT_COLORS[1]; // blue
      if (ch === '.') color = FLOYD_GRADIENT_COLORS[3]; // gray
      if (ch === "'") color = FLOYD_GRADIENT_COLORS[4]; // light gray

      coloredLine += chalk.hex(color)(ch);
    }
    lines.push(coloredLine);
  }

  return lines.join('\n');
}

/**
 * ASCII Logo for Floyd (exported as function for dynamic coloring)
 */
export const ASCII_LOGO = renderFloydBanner();

// ============================================================================
// System Prompts
// ============================================================================

/**
 * Main system prompt for Floyd
 */
export const MAIN_SYSTEM_PROMPT = `You are Floyd, an AI development companion built by Douglas Talley at Legacy AI.

Your purpose is to help developers build, test, and ship software efficiently. You have access to powerful tools for file operations, code search, build automation, git workflows, browser automation, caching, and more.

Key principles:
- Be concise and direct in your responses
- Use tools to verify information before making claims
- Always read files before editing them
- Test your changes immediately after making them
- Maintain a conversation history to provide context
- Ask for permission before executing dangerous operations
- Use the SUPERCACHE system to reduce redundant computations

You have access to 55 tools across 8 categories. Use them wisely to accomplish tasks efficiently.

When you need to think through a complex problem, use the think tool to show your reasoning.

Always aim for completeness - if asked to implement a feature, wire it fully including tests, documentation, and all necessary wiring.` as const;

/**
 * Explore mode system prompt
 */
export const EXPLORE_SYSTEM_PROMPT = `You are Floyd in explore mode.

Your current task is to explore the codebase and understand its structure, patterns, and conventions.

Use your tools to:
- List directories and files
- Search for specific patterns
- Read configuration files
- Identify the tech stack
- Understand the architecture

Be thorough but efficient in your exploration. Provide clear summaries of what you discover.` as const;

/**
 * Plan mode system prompt
 */
export const PLAN_SYSTEM_PROMPT = `You are Floyd in plan mode.

Your current task is to create a detailed plan for implementing a feature or fixing a bug.

Use your tools to:
- Understand the current codebase structure
- Identify all files that need changes
- Consider edge cases and error handling
- Plan the implementation order
- Identify testing requirements

Create a step-by-step plan with clear priorities and dependencies.` as const;

// ============================================================================
// Tool Categories Metadata
// ============================================================================

/**
 * Tool category descriptions
 */
export const TOOL_CATEGORY_DESCRIPTIONS = {
  file: 'File operations (read, write, edit, search, replace)',
  search: 'Code search and navigation (grep, codebase search, find)',
  build: 'Build and test automation (run, compile, test, lint)',
  git: 'Git operations (status, diff, commit, branch, push, pull)',
  browser: 'Browser automation (screenshot, click, type, navigate)',
  cache: 'SUPERCACHE operations (store, retrieve, clear, stats)',
  patch: 'Patch operations (create, apply, list patches)',
  special: 'Special tools (think, ask, echo, sleep)',
} as const;

// ============================================================================
// Error Codes
// ============================================================================

/**
 * Standard error codes
 */
export const ERROR_CODES = {
  /** Configuration error */
  CONFIG_ERROR: 'CONFIG_ERROR',
  /** Validation error */
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  /** File not found */
  FILE_NOT_FOUND: 'FILE_NOT_FOUND',
  /** Permission denied */
  PERMISSION_DENIED: 'PERMISSION_DENIED',
  /** Tool execution error */
  TOOL_EXECUTION_ERROR: 'TOOL_EXECUTION_ERROR',
  /** API error */
  API_ERROR: 'API_ERROR',
  /** Cache error */
  CACHE_ERROR: 'CACHE_ERROR',
  /** Timeout error */
  TIMEOUT_ERROR: 'TIMEOUT_ERROR',
} as const;
