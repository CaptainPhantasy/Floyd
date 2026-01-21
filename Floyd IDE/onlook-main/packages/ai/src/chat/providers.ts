import {
    LLMProvider,
    MODEL_MAX_TOKENS,
    OPENROUTER_MODELS,
    type InitialModelPayload,
    type ModelConfig
} from '@onlook/models';
import { assertNever } from '@onlook/utility';
import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { createAnthropic } from '@ai-sdk/anthropic';
import type { LanguageModel } from 'ai';

export function initModel({
    provider: requestedProvider,
    model: requestedModel,
}: InitialModelPayload): ModelConfig {
    let model: LanguageModel;
    let providerOptions: Record<string, any> | undefined;
    let headers: Record<string, string> | undefined;
    let maxOutputTokens: number = MODEL_MAX_TOKENS[requestedModel];

    switch (requestedProvider) {
        case LLMProvider.OPENROUTER:
            model = getOpenRouterProvider(requestedModel);
            headers = {
                'HTTP-Referer': 'https://onlook.com',
                'X-Title': 'Onlook',
            };
            providerOptions = {
                openrouter: { transforms: ['middle-out'] },
            };
            const isAnthropic = requestedModel === OPENROUTER_MODELS.CLAUDE_4_5_SONNET || requestedModel === OPENROUTER_MODELS.CLAUDE_3_5_HAIKU;
            providerOptions = isAnthropic
                ? { ...providerOptions, anthropic: { cacheControl: { type: 'ephemeral' } } }
                : providerOptions;
            break;
        case LLMProvider.ANTHROPIC:
            model = getAnthropicProvider(requestedModel);
            providerOptions = {
                anthropic: { cacheControl: { type: 'ephemeral' } } };
            break;
        default:
            assertNever(requestedProvider);
    }

    return {
        model,
        providerOptions,
        headers,
        maxOutputTokens,
    };
}

function getOpenRouterProvider(model: OPENROUTER_MODELS): LanguageModel {
    if (!process.env.OPENROUTER_API_KEY) {
        throw new Error('OPENROUTER_API_KEY must be set');
    }
    const openrouter = createOpenRouter({ apiKey: process.env.OPENROUTER_API_KEY });
    return openrouter(model);
}

function getAnthropicProvider(model: string): LanguageModel {
    if (!process.env.ANTHROPIC_API_KEY) {
        throw new Error('ANTHROPIC_API_KEY must be set');
    }
    
    // Check if using GLM-compatible endpoint
    const baseUrl = process.env.ANTHROPIC_BASE_URL;
    
    const anthropic = createAnthropic({
        apiKey: process.env.ANTHROPIC_API_KEY,
        ...(baseUrl && { baseURL: baseUrl }),
    });
    
    return anthropic(model);
}
