/**
 * Shared configuration constants
 * Single source of truth for all default values
 *
 * PRIMARY: Anthropic direct API (https://api.anthropic.com)
 */
export declare const DEFAULT_ANTHROPIC_CONFIG: {
    readonly endpoint: "https://api.anthropic.com";
    readonly model: "claude-sonnet-4-20250514";
};
export declare const DEFAULT_OPENAI_CONFIG: {
    readonly endpoint: "https://api.openai.com/v1/chat/completions";
    readonly model: "gpt-4o";
};
export declare const DEFAULT_DEEPSEEK_CONFIG: {
    readonly endpoint: "https://api.deepseek.com/v1/chat/completions";
    readonly model: "deepseek-chat";
};
export declare const DEFAULT_GLM_CONFIG: {
    readonly endpoint: "https://api.anthropic.com";
    readonly model: "claude-sonnet-4-20250514";
};
export declare const PROVIDER_DEFAULTS: {
    readonly anthropic: {
        readonly endpoint: "https://api.anthropic.com";
        readonly model: "claude-sonnet-4-20250514";
    };
    readonly openai: {
        readonly endpoint: "https://api.openai.com/v1/chat/completions";
        readonly model: "gpt-4o";
    };
    readonly deepseek: {
        readonly endpoint: "https://api.deepseek.com/v1/chat/completions";
        readonly model: "deepseek-chat";
    };
};
export type Provider = keyof typeof PROVIDER_DEFAULTS;
/**
 * Determine provider from endpoint URL
 */
export declare function inferProviderFromEndpoint(endpoint: string): Provider;
/**
 * Check if endpoint uses OpenAI-compatible format
 */
export declare function isOpenAICompatible(endpoint: string): boolean;
//# sourceMappingURL=constants.d.ts.map