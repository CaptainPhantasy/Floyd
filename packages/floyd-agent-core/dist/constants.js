/**
 * ⚠️ DO NOT MODIFY WITHOUT PERMISSION - VERIFIED WORKING CONFIGURATION
 * Shared configuration constants
 * Single source of truth for all default values
 *
 * PRIMARY: Anthropic direct API (https://api.anthropic.com)
 */
export const DEFAULT_ANTHROPIC_CONFIG = {
    endpoint: 'https://api.anthropic.com',
    model: 'claude-sonnet-4-20250514',
};
export const DEFAULT_OPENAI_CONFIG = {
    endpoint: 'https://api.openai.com/v1/chat/completions',
    model: 'gpt-4o',
};
export const DEFAULT_DEEPSEEK_CONFIG = {
    endpoint: 'https://api.deepseek.com/v1/chat/completions',
    model: 'deepseek-chat',
};
// Z.ai configuration (Anthropic-compatible endpoint)
export const DEFAULT_ZAI_CONFIG = {
    endpoint: 'https://api.z.ai/api/anthropic',
    model: 'claude-sonnet-4-20250514',
};
// Backwards compatibility - GLM config now points to Z.ai
export const DEFAULT_GLM_CONFIG = DEFAULT_ZAI_CONFIG;
export const PROVIDER_DEFAULTS = {
    anthropic: DEFAULT_ANTHROPIC_CONFIG,
    openai: DEFAULT_OPENAI_CONFIG,
    deepseek: DEFAULT_DEEPSEEK_CONFIG,
    zai: DEFAULT_ZAI_CONFIG,
};
/**
 * ⚠️ DO NOT MODIFY - Critical endpoint detection
 * Determine provider from endpoint URL
 */
export function inferProviderFromEndpoint(endpoint) {
    if (endpoint.includes('api.z.ai'))
        return 'zai';
    if (endpoint.includes('api.anthropic.com'))
        return 'anthropic';
    if (endpoint.includes('api.openai.com'))
        return 'openai';
    if (endpoint.includes('api.deepseek.com'))
        return 'deepseek';
    // Default to Anthropic for unknown endpoints
    return 'anthropic';
}
/**
 * ⚠️ DO NOT MODIFY - Format detection (CRITICAL for floyd-cli tool calling)
 * Check if endpoint uses OpenAI-compatible format
 *
 * BREAKING CHANGE: Modifying this function will break tool calling in floyd-cli
 * VERIFIED WORKING: 2026-01-25 - Tool calling tested and confirmed working
 */
export function isOpenAICompatible(endpoint) {
    // OpenAI and DeepSeek use OpenAI-compatible format
    // Anthropic direct API uses Anthropic format
    // Z.ai has TWO endpoints:
    //   - /api/anthropic uses Anthropic format
    //   - /api/coding/paas/v4 (GLM) uses OpenAI format
    if (endpoint.includes('api.z.ai/api/coding')) {
        // GLM coding endpoint uses OpenAI format
        return true;
    }
    if (endpoint.includes('api.anthropic.com')) {
        return false;
    }
    if (endpoint.includes('api.z.ai')) {
        // Z.ai Anthropic-compatible endpoint
        return false;
    }
    // Default to OpenAI for other endpoints
    return true;
}
//# sourceMappingURL=constants.js.map