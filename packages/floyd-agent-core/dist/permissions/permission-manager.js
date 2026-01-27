// Permission management for Floyd agent tools
// Controls which tools can be executed without user confirmation
//
// NOTE: This is a REFERENCE IMPLEMENTATION of the IPermissionManager interface.
// The actual production permission system is in floyd-wrapper-main/src/permissions/permission-manager.ts
// which provides readline-based prompting and risk classification.
//
// Use this SimplePermissionManager for:
// - Testing (in-memory, deterministic)
// - Simple automation (batch mode)
// - Reference implementation for IPermissionManager
//
// For interactive CLI use, the floyd-wrapper permission manager is used instead.
/**
 * SimplePermissionManager controls tool execution permissions
 *
 * GAP #2 FIX: Renamed from PermissionManager to SimplePermissionManager to avoid
 * confusion with the production permission system in floyd-wrapper-main.
 *
 * This is a reference implementation of IPermissionManager that:
 * - Uses in-memory state (no persistence)
 * - Supports wildcard patterns (e.g., "git-*" allows all tools starting with "git-")
 * - Returns allow/deny/ask without prompting
 * - Useful for testing and automation
 *
 * @deprecated For production CLI use, see floyd-wrapper-main/src/permissions/permission-manager.ts
 */
export class SimplePermissionManager {
    allowedTools;
    deniedTools;
    wildcardAllowed;
    constructor(allowedTools = [], deniedTools = []) {
        this.allowedTools = new Set(allowedTools);
        this.deniedTools = new Set(deniedTools);
        this.wildcardAllowed = allowedTools.filter(t => t.includes('*'));
    }
    /**
     * Check if a tool is allowed to execute
     *
     * Returns:
     * - 'allow': Tool can execute without confirmation
     * - 'deny': Tool is blocked
     * - 'ask': User should be prompted for confirmation
     */
    async checkPermission(toolName) {
        // Check explicit deny first
        if (this.deniedTools.has(toolName)) {
            return 'deny';
        }
        // Check explicit allow
        if (this.allowedTools.has(toolName)) {
            return 'allow';
        }
        // Check wildcards
        for (const pattern of this.wildcardAllowed) {
            if (pattern === '*') {
                return 'allow';
            }
            if (pattern.endsWith('*')) {
                const prefix = pattern.slice(0, -1);
                if (toolName.startsWith(prefix)) {
                    return 'allow';
                }
            }
        }
        // Default: ask for permission
        return 'ask';
    }
    /**
     * Grant permission to a tool
     */
    grantPermission(toolName) {
        this.deniedTools.delete(toolName);
        this.allowedTools.add(toolName);
    }
    /**
     * Deny permission to a tool
     */
    denyPermission(toolName) {
        this.allowedTools.delete(toolName);
        this.deniedTools.add(toolName);
    }
    /**
     * Reset to ask for all tools
     */
    resetPermission(toolName) {
        this.allowedTools.delete(toolName);
        this.deniedTools.delete(toolName);
    }
    /**
     * Add a wildcard allow pattern
     */
    allowPattern(pattern) {
        if (pattern.includes('*')) {
            this.wildcardAllowed.push(pattern);
        }
        else {
            this.allowedTools.add(pattern);
        }
    }
    /**
     * Get all allowed tools
     */
    getAllowedTools() {
        return Array.from(this.allowedTools);
    }
    /**
     * Get all denied tools
     */
    getDeniedTools() {
        return Array.from(this.deniedTools);
    }
    /**
     * Export rules to JSON for persistence
     */
    exportRules() {
        const rules = [];
        for (const tool of this.allowedTools) {
            rules.push({ pattern: tool, level: 'allow' });
        }
        for (const tool of this.deniedTools) {
            rules.push({ pattern: tool, level: 'deny' });
        }
        for (const pattern of this.wildcardAllowed) {
            if (!this.allowedTools.has(pattern)) {
                rules.push({ pattern, level: 'allow' });
            }
        }
        return rules;
    }
    /**
     * Import rules from JSON
     */
    importRules(rules) {
        this.allowedTools.clear();
        this.deniedTools.clear();
        this.wildcardAllowed = [];
        for (const rule of rules) {
            if (rule.level === 'allow') {
                if (rule.pattern.includes('*')) {
                    this.wildcardAllowed.push(rule.pattern);
                }
                else {
                    this.allowedTools.add(rule.pattern);
                }
            }
            else if (rule.level === 'deny') {
                this.deniedTools.add(rule.pattern);
            }
        }
    }
}
// GAP #2 FIX: Backward compatibility alias
// PermissionManager is deprecated - use SimplePermissionManager instead
/**
 * @deprecated Use SimplePermissionManager instead. This alias exists for backward compatibility.
 */
export const PermissionManager = SimplePermissionManager;
//# sourceMappingURL=permission-manager.js.map