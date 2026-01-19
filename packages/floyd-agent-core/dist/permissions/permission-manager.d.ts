export type PermissionLevel = 'ask' | 'allow' | 'deny';
export interface PermissionRule {
    pattern: string;
    level: 'allow' | 'deny';
}
/**
 * PermissionManager controls tool execution permissions
 *
 * Supports:
 * - Explicit allow/deny by tool name
 * - Wildcard patterns (e.g., "git-*" allows all tools starting with "git-")
 * - "*" to allow all tools
 */
export declare class PermissionManager {
    private allowedTools;
    private deniedTools;
    private wildcardAllowed;
    constructor(allowedTools?: string[], deniedTools?: string[]);
    /**
     * Check if a tool is allowed to execute
     *
     * Returns:
     * - 'allow': Tool can execute without confirmation
     * - 'deny': Tool is blocked
     * - 'ask': User should be prompted for confirmation
     */
    checkPermission(toolName: string): Promise<PermissionLevel>;
    /**
     * Grant permission to a tool
     */
    grantPermission(toolName: string): void;
    /**
     * Deny permission to a tool
     */
    denyPermission(toolName: string): void;
    /**
     * Reset to ask for all tools
     */
    resetPermission(toolName: string): void;
    /**
     * Add a wildcard allow pattern
     */
    allowPattern(pattern: string): void;
    /**
     * Get all allowed tools
     */
    getAllowedTools(): string[];
    /**
     * Get all denied tools
     */
    getDeniedTools(): string[];
    /**
     * Export rules to JSON for persistence
     */
    exportRules(): PermissionRule[];
    /**
     * Import rules from JSON
     */
    importRules(rules: PermissionRule[]): void;
}
//# sourceMappingURL=permission-manager.d.ts.map