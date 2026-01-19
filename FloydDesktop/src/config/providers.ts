/**
 * Provider configurations for Floyd Desktop
 * 
 * Each provider defines its endpoint, available models, and any special headers
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

export const PROVIDERS: Record<'glm' | 'anthropic' | 'openai' | 'deepseek', ProviderConfig> = {
  glm: {
    name: 'GLM (api.z.ai)',
    endpoint: 'https://api.z.ai/api/paas/v4/chat/completions',
    models: [
      { id: 'glm-4.7', name: 'GLM-4.7 (Claude Opus 4)' },
      { id: 'glm-4.5', name: 'GLM-4.5 (Claude Sonnet 4)' },
    ],
  },
  anthropic: {
    name: 'Anthropic (Direct)',
    endpoint: 'https://api.anthropic.com',
    models: [
      { id: 'claude-sonnet-4-20250514', name: 'Claude Sonnet 4' },
      { id: 'claude-opus-4-20250514', name: 'Claude Opus 4' },
      { id: 'claude-3-5-sonnet-latest', name: 'Claude 3.5 Sonnet' },
    ],
  },
  // OpenAI and DeepSeek can be added here later
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

/**
 * Get provider configuration by ID
 */
export function getProvider(id: 'glm' | 'anthropic' | 'openai' | 'deepseek'): ProviderConfig {
  return PROVIDERS[id];
}

/**
 * Get all provider IDs
 */
export function getProviderIds(): Array<'glm' | 'anthropic' | 'openai' | 'deepseek'> {
  return Object.keys(PROVIDERS) as Array<'glm' | 'anthropic' | 'openai' | 'deepseek'>;
}
