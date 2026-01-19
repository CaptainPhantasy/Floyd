/**
 * LLM Client Factory
 *
 * Creates the appropriate LLM client based on the endpoint URL.
 * This is the main entry point for getting an LLM client.
 */
import type { LLMClient, LLMClientOptions } from './types.js';
import { type Provider } from '../constants.js';
export interface CreateLLMClientOptions extends LLMClientOptions {
    provider?: Provider;
}
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
export declare function createLLMClient(options: CreateLLMClientOptions): LLMClient;
/**
 * Re-export types for convenience
 */
export type { LLMClient, LLMClientOptions, LLMMessage, LLMTool, StreamChunk, LLMChatCallbacks } from './types.js';
export { OpenAICompatibleClient } from './openai-client.js';
export { AnthropicClient } from './anthropic-client.js';
//# sourceMappingURL=factory.d.ts.map