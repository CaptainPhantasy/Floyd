/**
 * Hardened Prompt Stack
 *
 * Implements the structured prompt architecture defined in FLOYDENGINEERING.md
 * Separates concerns into layers: identity, policy, process, format, domain
 */
export interface PromptStack {
    identity: IdentityLayer;
    policy: PolicyLayer;
    process: ProcessLayer;
    format: FormatLayer;
    domain?: DomainLayer;
}
export interface IdentityLayer {
    name: string;
    version: string;
    capabilities: string[];
    limitations: string[];
    role: string;
}
export interface PolicyLayer {
    tool_use: string[];
    prohibited_actions: string[];
    verification_requirements: string[];
    safety_constraints: string[];
}
export interface ProcessLayer {
    planning_steps: string[];
    execution_pattern: string;
    verification_gates: string[];
    stop_conditions: string[];
    error_handling: string[];
}
export interface FormatLayer {
    response_structure: string;
    code_block_style: string;
    receipt_format: string;
    thinking_style: string;
}
export interface DomainLayer {
    [language: string]: {
        conventions: string[];
        best_practices: string[];
        common_patterns: string[];
    };
}
/**
 * Default Hardened Prompt Stack
 *
 * This is the production-ready prompt stack that all FLOYD agents should use.
 * Customizations should be additive via the domain layer only.
 */
export declare const DEFAULT_PROMPT_STACK: PromptStack;
/**
 * Build the complete system prompt from a prompt stack
 */
export declare function buildSystemPrompt(stack: PromptStack): string;
/**
 * Default system prompt for quick use
 */
export declare const DEFAULT_SYSTEM_PROMPT: string;
/**
 * Domain-specific prompts for common languages
 */
export declare const DOMAIN_PROMPTS: DomainLayer;
/**
 * Create a custom prompt stack with domain knowledge
 */
export declare function createPromptStack(domainLanguages?: string[]): PromptStack;
//# sourceMappingURL=HardenedPromptStack.d.ts.map