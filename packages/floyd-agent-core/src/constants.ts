/**
 * Shared configuration constants
 * Single source of truth for all default values
 * 
 * PRIMARY: Anthropic direct API (https://api.anthropic.com)
 */

export const DEFAULT_ANTHROPIC_CONFIG = {
  endpoint: 'https://api.anthropic.com',
  model: 'claude-sonnet-4-20250514',
} as const;

export const DEFAULT_OPENAI_CONFIG = {
  endpoint: 'https://api.openai.com/v1/chat/completions',
  model: 'gpt-4o',
} as const;

export const DEFAULT_DEEPSEEK_CONFIG = {
  endpoint: 'https://api.deepseek.com/v1/chat/completions',
  model: 'deepseek-chat',
} as const;

// Backwards compatibility - GLM config now points to Anthropic defaults
export const DEFAULT_GLM_CONFIG = DEFAULT_ANTHROPIC_CONFIG;

export const PROVIDER_DEFAULTS = {
  anthropic: DEFAULT_ANTHROPIC_CONFIG,
  openai: DEFAULT_OPENAI_CONFIG,
  deepseek: DEFAULT_DEEPSEEK_CONFIG,
} as const;

export type Provider = keyof typeof PROVIDER_DEFAULTS;

/**
 * Determine provider from endpoint URL
 */
export function inferProviderFromEndpoint(endpoint: string): Provider {
  if (endpoint.includes('api.anthropic.com')) return 'anthropic';
  if (endpoint.includes('api.openai.com')) return 'openai';
  if (endpoint.includes('api.deepseek.com')) return 'deepseek';
  // Default to Anthropic for unknown endpoints
  return 'anthropic';
}

/**
 * Check if endpoint uses OpenAI-compatible format
 */
export function isOpenAICompatible(endpoint: string): boolean {
  // OpenAI and DeepSeek use OpenAI-compatible format
  // Anthropic endpoint uses Anthropic format
  return !endpoint.includes('api.anthropic.com');
}
