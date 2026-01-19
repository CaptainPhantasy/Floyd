/**
 * Permission Store - Persistent storage for permission decisions
 * Rewritten for core package using fs/promises (not fs-extra)
 */
import { PermissionPolicy, PermissionRule, PermissionDecision, PermissionScope } from './policies.js';
export interface PermissionsFile {
    version: string;
    decisions: Record<string, PermissionRule>;
    rememberUntil: 'session' | 'forever';
    updatedAt: number;
}
export declare class PermissionStore {
    private filePath;
    private policies;
    private loaded;
    constructor(cwd?: string);
    load(): Promise<PermissionPolicy>;
    save(): Promise<void>;
    getPolicies(): Promise<PermissionPolicy>;
    checkPermission(toolName: string): Promise<PermissionDecision | null>;
    recordDecision(toolName: string, decision: PermissionDecision, scope: PermissionScope): Promise<void>;
    clearAll(): Promise<void>;
    clearTool(toolName: string): Promise<void>;
}
//# sourceMappingURL=store.d.ts.map