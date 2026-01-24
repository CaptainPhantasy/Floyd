/**
 * Configuration Management - Floyd Wrapper
 *
 * Configuration loader with Zod validation supporting .env files and environment variable overrides.
 */

import fs from 'fs-extra';
import * as path from 'path';
import { z } from 'zod';
import type { FloydConfig } from '../types.js';
import { logger } from './logger.js';
import { ConfigError } from './errors.js';

// ============================================================================
// Configuration Schema
// ============================================================================

/**
 * Zod schema for Floyd configuration
 */
const configSchema = z.object({
  glmApiKey: z.string().min(1, 'GLM API key is required'),
  glmApiEndpoint: z.string().url('GLM API endpoint must be a valid URL').default('https://api.z.ai/api/anthropic'),
  glmModel: z.string().min(1).default('glm-4.7'),
  maxTokens: z.number().int().positive().default(100000),
  temperature: z.number().min(0).max(2).default(0.7),
  maxTurns: z.number().int().positive().default(20),
  logLevel: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
  cacheEnabled: z.boolean().default(true),
  permissionLevel: z.enum(['auto', 'ask', 'deny']).default('ask'),
});

// ============================================================================
// Configuration Loader
// ============================================================================

/**
 * Load configuration from environment variables
 *
 * Priority: env vars > .env file > defaults
 */
export async function loadConfig(): Promise<FloydConfig> {
  logger.debug('Loading configuration...');

  // Load from environment variables
  const envVars: Record<string, string | undefined> = {
    glmApiKey: process.env.FLOYD_GLM_API_KEY || process.env.GLM_API_KEY,
    glmApiEndpoint: process.env.FLOYD_GLM_ENDPOINT || process.env.GLM_API_ENDPOINT,
    glmModel: process.env.FLOYD_GLM_MODEL || process.env.GLM_MODEL,
    maxTokens: process.env.FLOYD_MAX_TOKENS,
    temperature: process.env.FLOYD_TEMPERATURE,
    maxTurns: process.env.FLOYD_MAX_TURNS,
    logLevel: process.env.FLOYD_LOG_LEVEL,
    cacheEnabled: process.env.FLOYD_CACHE_ENABLED,
    permissionLevel: process.env.FLOYD_PERMISSION_LEVEL,
  };

  // Clean undefined values and parse to correct types
  const parsed: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(envVars)) {
    if (value === undefined || value === '') {
      continue;
    }

    switch (key) {
      case 'maxTokens':
      case 'maxTurns':
        parsed[key] = parseInt(value, 10);
        break;
      case 'temperature':
        parsed[key] = parseFloat(value);
        break;
      case 'cacheEnabled':
        parsed[key] = value.toLowerCase() === 'true' || value === '1';
        break;
      default:
        parsed[key] = value;
    }
  }

  // Validate with Zod
  try {
    const config = configSchema.parse(parsed) as FloydConfig;
    logger.debug('Configuration loaded successfully');
    logger.debug(`GLM API Endpoint: ${config.glmApiEndpoint}`);
    logger.debug(`GLM Model: ${config.glmModel}`);
    logger.debug(`Max Tokens: ${config.maxTokens}`);
    logger.debug(`Temperature: ${config.temperature}`);
    logger.debug(`Log Level: ${config.logLevel}`);
    logger.debug(`Cache Enabled: ${config.cacheEnabled}`);
    logger.debug(`Permission Level: ${config.permissionLevel}`);

    // Add cwd to config
    config.cwd = process.cwd();

    return config;
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessages = error.errors.map((e) => `- ${e.path.join('.')}: ${e.message}`).join('\n');
      throw new ConfigError(`Invalid configuration:\n${errorMessages}`, { errors: error.errors });
    }

    throw new ConfigError(`Failed to load configuration: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Load project context from configuration files
 *
 * Searches for project configuration in:
 * 1. FLOYD.md
 * 2. AGENTS.md
 * 3. .floyd/config.md
 */
export async function loadProjectContext(projectRoot: string): Promise<string | null> {
  logger.debug(`Loading project context from ${projectRoot}...`);

  const configPaths = [
    path.join(projectRoot, 'FLOYD.md'),
    path.join(projectRoot, 'AGENTS.md'),
    path.join(projectRoot, '.floyd', 'config.md'),
  ];

  for (const configPath of configPaths) {
    if (await fs.pathExists(configPath)) {
      logger.debug(`Found project context at ${configPath}`);
      const content = await fs.readFile(configPath, 'utf-8');
      return content;
    }
  }

  logger.debug('No project context found');
  return null;
}

/**
 * Load ignore patterns from .floydignore
 */
export async function loadFloydIgnore(projectRoot: string): Promise<string[]> {
  const ignorePath = path.join(projectRoot, '.floydignore');
  
  if (await fs.pathExists(ignorePath)) {
    try {
      const content = await fs.readFile(ignorePath, 'utf-8');
      return content
        .split('\n')
        .map(line => line.trim())
        .filter(line => line && !line.startsWith('#')); // Remove empty lines and comments
    } catch (error) {
      logger.warn(`Failed to read .floydignore: ${error}`);
    }
  }
  
  return [];
}

/**
 * Get cache directory path
 */
export function getCachePath(tier: 'reasoning' | 'project' | 'vault'): string {
  return path.join(process.cwd(), '.floyd', 'cache', tier);
}

/**
 * Ensure cache directories exist
 */
export async function ensureCacheDirectories(): Promise<void> {
  const cacheDir = path.join(process.cwd(), '.floyd', 'cache');

  if (!(await fs.pathExists(cacheDir))) {
    logger.debug('Creating cache directories...');
    await fs.ensureDir(cacheDir);
  }

  const tiers: Array<'reasoning' | 'project' | 'vault'> = ['reasoning', 'project', 'vault'];

  for (const tier of tiers) {
    const tierPath = getCachePath(tier);
    await fs.ensureDir(tierPath);
    logger.debug(`Ensured cache directory exists: ${tierPath}`);
  }
}

// ============================================================================
// Configuration Helpers
// ============================================================================

/**
 * Validate configuration object
 */
export function validateConfig(config: unknown): FloydConfig {
  try {
    return configSchema.parse(config) as FloydConfig;
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessages = error.errors.map((e) => `- ${e.path.join('.')}: ${e.message}`).join('\n');
      throw new ConfigError(`Invalid configuration:\n${errorMessages}`, { errors: error.errors });
    }

    throw new ConfigError(`Failed to validate configuration: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Get default configuration values
 * Note: This excludes required fields like glmApiKey
 */
export function getDefaultConfig(): Partial<z.infer<typeof configSchema>> {
  return {
    glmApiEndpoint: 'https://api.z.ai/api/anthropic',
    glmModel: 'glm-4.7',
    maxTokens: 100000,
    temperature: 0.7,
    maxTurns: 20,
    logLevel: 'info',
    cacheEnabled: true,
    permissionLevel: 'ask',
  };
}

/**
 * Merge configuration values (doesn't validate)
 */
export function mergeConfig(...configs: Partial<z.infer<typeof configSchema>>[]): Partial<z.infer<typeof configSchema>> {
  const merged: Partial<z.infer<typeof configSchema>> = {};

  for (const config of configs) {
    Object.assign(merged, config);
  }

  return merged;
}

// ============================================================================
// Environment Variable Helpers
// ============================================================================

/**
 * Get environment variable as boolean
 */
export function getEnvBool(key: string, defaultValue: boolean = false): boolean {
  const value = process.env[key];
  if (value === undefined || value === '') {
    return defaultValue;
  }
  return value.toLowerCase() === 'true' || value === '1';
}

/**
 * Get environment variable as number
 */
export function getEnvNumber(key: string, defaultValue: number): number {
  const value = process.env[key];
  if (value === undefined || value === '') {
    return defaultValue;
  }
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? defaultValue : parsed;
}

/**
 * Get environment variable as string
 */
export function getEnvString(key: string, defaultValue: string = ''): string {
  return process.env[key] || defaultValue;
}
