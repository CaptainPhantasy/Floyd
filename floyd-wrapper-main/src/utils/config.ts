/**
 * Configuration Manager - Floyd Wrapper
 *
 * Manages application configuration with feature flags
 */

import path from 'path';
import fs from 'fs-extra';

export interface FloydConfig {
  // GLM API Configuration
  glmApiKey: string;
  glmApiEndpoint: string;
  glmModel: string;

  // Model Behavior
  maxTokens: number;
  temperature: number;
  maxTurns: number;

  // Feature Flags
  useSuggestedPrompt: boolean;
  useHardenedPrompt: boolean;
  useFloyd47Prompt: boolean;
  useClaudePrompt: boolean;
  useFlashMode: boolean;
  enablePreservedThinking: boolean;
  enableTurnLevelThinking: boolean;
  useJsonPlanning: boolean;
  disableReasoning: boolean;

  // Logging & Monitoring
  logLevel: LogLevel;
  cacheEnabled: boolean;

  // Permissions
  permissionLevel: PermissionLevel;

  // Execution Mode
  mode: ExecutionMode;

  // Project Context
  cwd: string;
  floydIgnorePatterns?: string[];
  projectContext?: string;
}

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';
export type PermissionLevel = 'auto' | 'ask' | 'deny';
export type ExecutionMode = 'ask' | 'yolo' | 'plan' | 'auto' | 'dialogue' | 'fuckit';

/**
 * Load configuration from environment variables and config files
 */
export function loadConfig(): FloydConfig {
  return {
    // GLM API Configuration
    glmApiKey: process.env.FLOYD_GLM_API_KEY || '',
    glmApiEndpoint: process.env.FLOYD_GLM_ENDPOINT || 'https://api.z.ai/api/coding/paas/v4',
    glmModel: process.env.FLOYD_GLM_MODEL || 'glm-4.7',

    // Model Behavior
    maxTokens: parseInt(process.env.FLOYD_MAX_TOKENS || '100000'),
    temperature: parseFloat(process.env.FLOYD_TEMPERATURE || '0.7'),
    maxTurns: parseInt(process.env.FLOYD_MAX_TURNS || '20'),

    // Feature Flags (NEW - Prompt System Selection)
    useSuggestedPrompt: process.env.FLOYD_USE_SUGGESTED_PROMPT === 'true',
    useHardenedPrompt: process.env.FLOYD_USE_HARDENED_PROMPT === 'true',
    useFloyd47Prompt: process.env.FLOYD_USE_FLOYD47_PROMPT === 'true',
    useClaudePrompt: process.env.FLOYD_USE_CLAUDE_PROMPT === 'true',
    useFlashMode: process.env.FLOYD_USE_FLASH_MODE === 'true',
    enablePreservedThinking: process.env.FLOYD_PRESERVED_THINKING !== 'false',
    enableTurnLevelThinking: process.env.FLOYD_TURN_LEVEL_THINKING !== 'false',
    useJsonPlanning: process.env.FLOYD_JSON_PLANNING !== 'false',
    disableReasoning: process.env.FLOYD_DISABLE_REASONING === 'true',

    // Logging & Monitoring
    logLevel: (process.env.FLOYD_LOG_LEVEL as LogLevel) || 'info',
    cacheEnabled: process.env.FLOYD_CACHE_ENABLED !== 'false',

    // Permissions
    permissionLevel: (process.env.FLOYD_PERMISSION_LEVEL as PermissionLevel) || 'ask',

    // Execution Mode
    mode: (process.env.FLOYD_MODE as ExecutionMode) || 'ask',

    // Project Context
    cwd: process.cwd(),
    floydIgnorePatterns: [],
    projectContext: loadProjectContext(),
  };
}

/**
 * Load project context from FLOYD.md if it exists
 */
export function loadProjectContext(projectRoot?: string): string | undefined {
  const root = projectRoot || process.cwd();
  const floydMdPath = path.join(root, 'FLOYD.md');

  if (fs.existsSync(floydMdPath)) {
    try {
      return fs.readFileSync(floydMdPath, 'utf-8');
    } catch (error) {
      console.warn(`Failed to read FLOYD.md: ${error}`);
    }
  }

  return undefined;
}

/**
 * Load .floydignore patterns from the project
 */
export function loadFloydIgnore(projectRoot?: string): string[] {
  const root = projectRoot || process.cwd();
  const ignoreFile = path.join(root, '.floydignore');

  if (fs.existsSync(ignoreFile)) {
    try {
      const content = fs.readFileSync(ignoreFile, 'utf-8');
      return content.split('\n').filter(line => line.trim() && !line.startsWith('#'));
    } catch (error) {
      console.warn(`Failed to read .floydignore: ${error}`);
    }
  }

  return [];
}

/**
 * Get cache path for FLOYD data
 */
export function getCachePath(): string {
  return path.join(process.cwd(), '.floyd', 'cache');
}

/**
 * Ensure cache directories exist
 */
export function ensureCacheDirectories(): void {
  const cachePath = getCachePath();
  fs.ensureDirSync(cachePath);
}

/**
 * Get default configuration
 */
export function getDefaultConfig(): Partial<FloydConfig> {
  return {
    glmApiEndpoint: 'https://api.z.ai/api/coding/paas/v4',
    glmModel: 'glm-4.7',
    maxTokens: 100000,
    temperature: 1.0, // GLM-4.7 optimized
    maxTurns: 20,
    useHardenedPrompt: false,
    useFloyd47Prompt: false,
    useClaudePrompt: false,
    enablePreservedThinking: true,
    enableTurnLevelThinking: true,
    useJsonPlanning: true,
    disableReasoning: false,
    logLevel: 'info',
    cacheEnabled: true,
    permissionLevel: 'ask',
    mode: 'ask',
  };
}

/**
 * Merge configs with defaults
 */
export function mergeConfig(base: Partial<FloydConfig>, override: Partial<FloydConfig>): Partial<FloydConfig> {
  return { ...base, ...override };
}

/**
 * Get boolean from environment variable
 */
export function getEnvBool(key: string, defaultValue: boolean): boolean {
  const value = process.env[key];
  if (value === undefined) return defaultValue;
  return value.toLowerCase() === 'true' || value === '1';
}

/**
 * Get number from environment variable
 */
export function getEnvNumber(key: string, defaultValue: number): number {
  const value = process.env[key];
  if (value === undefined) return defaultValue;
  const parsed = parseFloat(value);
  return isNaN(parsed) ? defaultValue : parsed;
}

/**
 * Get string from environment variable
 */
export function getEnvString(key: string, defaultValue: string): string {
  return process.env[key] || defaultValue;
}

/**
 * Get configuration summary for logging
 */
export function getConfigSummary(config: FloydConfig): string {
  // Determine active prompt system
  const promptSystem = config.useFloyd47Prompt ? 'Floyd 4.7 (GLM-4.7 Optimized)' :
                       config.useClaudePrompt ? 'Claude Style' :
                       config.useHardenedPrompt ? 'Hardened v1.3.0' : 'Standard System';

  return `
Floyd Wrapper Configuration:
  GLM Model: ${config.glmModel}
  Endpoint: ${config.glmApiEndpoint}
  Max Tokens: ${config.maxTokens}
  Max Turns: ${config.maxTurns}
  Temperature: ${config.temperature} (GLM-4.7 optimal: 1.0)

Prompt System: ${promptSystem}

Feature Flags:
  Floyd 4.7 Prompt: ${config.useFloyd47Prompt ? 'ENABLED' : 'DISABLED'}
  Claude Style Prompt: ${config.useClaudePrompt ? 'ENABLED' : 'DISABLED'}
  Hardened Prompt: ${config.useHardenedPrompt ? 'ENABLED' : 'DISABLED'}
  Preserved Thinking: ${config.enablePreservedThinking ? 'ENABLED' : 'DISABLED'}
  Turn-Level Thinking: ${config.enableTurnLevelThinking ? 'ENABLED' : 'DISABLED'}
  JSON Planning: ${config.useJsonPlanning ? 'ENABLED' : 'DISABLED'}
  Disable Reasoning: ${config.disableReasoning ? 'ENABLED (simple tasks)' : 'DISABLED'}

Execution:
  Mode: ${config.mode.toUpperCase()}
  Permission Level: ${config.permissionLevel}
  Log Level: ${config.logLevel}
  Cache: ${config.cacheEnabled ? 'ENABLED' : 'DISABLED'}
  `;
}

/**
 * Validate configuration
 */
export function validateConfig(config: FloydConfig): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!config.glmApiKey) {
    errors.push('FLOYD_GLM_API_KEY is required');
  }

  if (config.maxTokens < 1) {
    errors.push('FLOYD_MAX_TOKENS must be positive');
  }

  if (config.temperature < 0 || config.temperature > 2) {
    errors.push('FLOYD_TEMPERATURE must be between 0 and 2');
  }

  if (config.maxTurns < 1 || config.maxTurns > 100) {
    errors.push('FLOYD_MAX_TURNS must be between 1 and 100');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
