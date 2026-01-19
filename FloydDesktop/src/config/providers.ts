/**
 * Provider configurations for Floyd Desktop
 * 
 * Anthropic is the PRIMARY provider - use https://api.anthropic.com/v1/messages
 * Other providers are optional alternatives.
 */

export interface ProviderModel {
  id: string;
  name: string;
}

export interface ProviderConfig {
  name: string;
  endpoint: string;
  models: ProviderModel[];
  headers?: Record<string, string>;
}

export type ProviderId = 'anthropic' | 'openai' | 'deepseek';

export const PROVIDERS: Record<ProviderId, ProviderConfig> = {
  anthropic: {
    name: 'Anthropic',
    endpoint: 'https://api.anthropic.com',
    models: [
      { id: 'claude-sonnet-4-20250514', name: 'Claude Sonnet 4' },
      { id: 'claude-opus-4-20250514', name: 'Claude Opus 4' },
      { id: 'claude-3-5-haiku-20241022', name: 'Claude 3.5 Haiku' },
      { id: 'claude-3-5-sonnet-20241022', name: 'Claude 3.5 Sonnet' },
    ],
  },
  openai: {
    name: 'OpenAI',
    endpoint: 'https://api.openai.com/v1',
    models: [
      { id: 'gpt-4o', name: 'GPT-4o' },
      { id: 'gpt-4-turbo', name: 'GPT-4 Turbo' },
      { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo' },
    ],
  },
  deepseek: {
    name: 'DeepSeek',
    endpoint: 'https://api.deepseek.com',
    models: [
      { id: 'deepseek-chat', name: 'DeepSeek Chat' },
      { id: 'deepseek-coder', name: 'DeepSeek Coder' },
    ],
  },
};

/** Default provider */
export const DEFAULT_PROVIDER: ProviderId = 'anthropic';

/** Default model */
export const DEFAULT_MODEL = 'claude-sonnet-4-20250514';

/**
 * Get provider configuration by ID
 */
export function getProvider(id: ProviderId): ProviderConfig {
  return PROVIDERS[id] || PROVIDERS[DEFAULT_PROVIDER];
}

/**
 * Get all provider IDs
 */
export function getProviderIds(): ProviderId[] {
  return Object.keys(PROVIDERS) as ProviderId[];
}
