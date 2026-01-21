import type { LanguageModel } from 'ai';

export enum LLMProvider {
    OPENROUTER = 'openrouter',
    ANTHROPIC = 'anthropic',
}

export enum OPENROUTER_MODELS {
    // Generate object does not work for Anthropic models https://github.com/OpenRouterTeam/ai-sdk-provider/issues/165
    CLAUDE_4_5_SONNET = 'anthropic/claude-sonnet-4.5',
    CLAUDE_3_5_HAIKU = 'anthropic/claude-3.5-haiku',
    OPEN_AI_GPT_5 = 'openai/gpt-5',
    OPEN_AI_GPT_5_MINI = 'openai/gpt-5-mini',
    OPEN_AI_GPT_5_NANO = 'openai/gpt-5-nano',
}

export enum ANTHROPIC_MODELS {
    // GLM Models (Zhipu AI) - via api.z.ai Anthropic-compatible endpoint
    // Exact model names from Floyd Desktop Web configuration
    GLM_4_7 = 'glm-4.7',
    GLM_4_5_AIR = 'glm-4.5-air',
    GLM_4_PLUS = 'glm-4-plus',
    GLM_4_0520 = 'glm-4-0520',
    GLM_4 = 'glm-4',
    GLM_4_AIR = 'glm-4-air',
    GLM_4_AIRX = 'glm-4-airx',
    GLM_4_LONG = 'glm-4-long',
    GLM_4_FLASH = 'glm-4-flash',
    // Standard Anthropic models
    CLAUDE_4_5_SONNET = 'claude-sonnet-4-5-20250514',
    CLAUDE_3_5_HAIKU = 'claude-3-5-haiku-20241022',
}

interface ModelMapping {
    [LLMProvider.OPENROUTER]: OPENROUTER_MODELS;
    [LLMProvider.ANTHROPIC]: ANTHROPIC_MODELS;
}

export type InitialModelPayload = {
    [K in keyof ModelMapping]: {
        provider: K;
        model: ModelMapping[K];
    };
}[keyof ModelMapping];

export type ModelConfig = {
    model: LanguageModel;
    providerOptions?: Record<string, any>;
    headers?: Record<string, string>;
    maxOutputTokens: number;
};

export const MODEL_MAX_TOKENS = {
    // OpenRouter models
    [OPENROUTER_MODELS.CLAUDE_4_5_SONNET]: 200000,
    [OPENROUTER_MODELS.CLAUDE_3_5_HAIKU]: 200000,
    [OPENROUTER_MODELS.OPEN_AI_GPT_5_NANO]: 400000,
    [OPENROUTER_MODELS.OPEN_AI_GPT_5_MINI]: 400000,
    [OPENROUTER_MODELS.OPEN_AI_GPT_5]: 400000,
    // Anthropic/GLM models - via api.z.ai
    [ANTHROPIC_MODELS.GLM_4_7]: 128000,
    [ANTHROPIC_MODELS.GLM_4_5_AIR]: 128000,
    [ANTHROPIC_MODELS.GLM_4_PLUS]: 128000,
    [ANTHROPIC_MODELS.GLM_4_0520]: 128000,
    [ANTHROPIC_MODELS.GLM_4]: 128000,
    [ANTHROPIC_MODELS.GLM_4_AIR]: 128000,
    [ANTHROPIC_MODELS.GLM_4_AIRX]: 128000,
    [ANTHROPIC_MODELS.GLM_4_LONG]: 128000,
    [ANTHROPIC_MODELS.GLM_4_FLASH]: 128000,
    [ANTHROPIC_MODELS.CLAUDE_4_5_SONNET]: 200000,
    [ANTHROPIC_MODELS.CLAUDE_3_5_HAIKU]: 200000,
} as const;
