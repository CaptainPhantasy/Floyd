/**
 * Permission Policies
 *
 * Defines permission rules and policies for tool access.
 * These policies determine what tools require permission requests
 * and how decisions are stored and applied.
 */
import { RiskLevel } from './risk-classifier.js';
export type PermissionScope = 'once' | 'session' | 'always';
export type PermissionDecision = 'allow' | 'deny';
export interface PermissionRule {
    toolName: string;
    toolPattern?: string;
    decision: PermissionDecision;
    scope: PermissionScope;
    grantedAt: number;
    expiresAt?: number;
}
export interface PermissionPolicy {
    rules: PermissionRule[];
    defaultBehavior: 'allow' | 'deny' | 'ask';
    rememberUntil: 'session' | 'forever';
}
/**
 * Default permission policies
 */
export declare const DEFAULT_POLICIES: PermissionPolicy;
/**
 * Tools that are always allowed (safe, read-only)
 */
export declare const ALWAYS_ALLOW_TOOLS: string[];
/**
 * Tools that should always prompt (destructive or sensitive)
 */
export declare const ALWAYS_PROMPT_TOOLS: string[];
/**
 * Check if a tool matches a rule pattern
 */
export declare function matchesPattern(toolName: string, pattern: string): boolean;
/**
 * Get applicable rule for a tool
 */
export declare function getApplicableRule(toolName: string, policies: PermissionPolicy): PermissionRule | null;
/**
 * Check if a permission rule is still valid
 */
export declare function isRuleValid(rule: PermissionRule): boolean;
/**
 * Create a new permission rule
 */
export declare function createPermissionRule(toolName: string, decision: PermissionDecision, scope: PermissionScope, rememberUntil?: 'session' | 'forever'): PermissionRule;
/**
 * Get risk-based recommendation for scope
 */
export declare function getRecommendedScope(riskLevel: RiskLevel): PermissionScope;
/**
 * Clean expired rules from policies
 */
export declare function cleanExpiredRules(policies: PermissionPolicy): PermissionPolicy;
/**
 * Merge a new rule into policies
 */
export declare function mergeRule(policies: PermissionPolicy, rule: PermissionRule): PermissionPolicy;
/**
 * Get display text for a permission scope
 */
export declare function getScopeText(scope: PermissionScope): string;
/**
 * Get display text for a permission decision
 */
export declare function getDecisionText(decision: PermissionDecision): string;
//# sourceMappingURL=policies.d.ts.map