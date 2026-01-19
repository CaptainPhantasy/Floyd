/**
 * LLM Client Factory
 *
 * Creates the appropriate LLM client based on the endpoint URL.
 * This is the main entry point for getting an LLM client.
 */
import { OpenAICompatibleClient } from './openai-client.js';
import { AnthropicClient } from './anthropic-client.js';
import { isOpenAICompatible, inferProviderFromEndpoint, PROVIDER_DEFAULTS } from '../constants.js';
/**
 * Create an LLM client for the given options.
 *
 * Automatically selects the correct client implementation based on:
 * 1. Explicit provider option
 * 2. Endpoint URL inference
 *
 * @example
 * // GLM via api.z.ai (uses OpenAI-compatible client)
 * const client = createLLMClient({
 *   apiKey: 'your-key',
 *   baseURL: 'https://api.z.ai/api/paas/v4/chat/completions',
 *   model: 'glm-4.7',
 * });
 *
 * @example
 * // Direct Anthropic (uses Anthropic SDK)
 * const client = createLLMClient({
 *   apiKey: 'your-key',
 *   baseURL: 'https://api.anthropic.com',
 *   model: 'claude-opus-4',
 * });
 */
export function createLLMClient(options) {
    // Determine provider
    let provider = options.provider ?? 'anthropic';
    if (!options.provider && options.baseURL) {
        provider = inferProviderFromEndpoint(options.baseURL);
    }
    // Get defaults for provider
    const defaults = PROVIDER_DEFAULTS[provider];
    const finalOptions = {
        ...options,
        baseURL: options.baseURL ?? defaults.endpoint,
        model: options.model ?? defaults.model,
    };
    // Select client implementation
    // Only Anthropic direct API uses AnthropicClient
    if (!isOpenAICompatible(finalOptions.baseURL)) {
        return new AnthropicClient(finalOptions);
    }
    else {
        return new OpenAICompatibleClient(finalOptions);
    }
}
export { OpenAICompatibleClient } from './openai-client.js';
export { AnthropicClient } from './anthropic-client.js';
//# sourceMappingURL=factory.js.map