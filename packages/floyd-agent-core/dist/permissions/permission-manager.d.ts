export type PermissionLevel = 'ask' | 'allow' | 'deny';
export interface PermissionRule {
    pattern: string;
    level: 'allow' | 'deny';
}
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
export declare class SimplePermissionManager {
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
/**
 * @deprecated Use SimplePermissionManager instead. This alias exists for backward compatibility.
 */
export declare const PermissionManager: typeof SimplePermissionManager;
//# sourceMappingURL=permission-manager.d.ts.map