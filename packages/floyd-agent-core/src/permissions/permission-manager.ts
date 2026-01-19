// Permission management for Floyd agent tools
// Controls which tools can be executed without user confirmation

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
export class PermissionManager {
  private allowedTools: Set<string>;
  private deniedTools: Set<string>;
  private wildcardAllowed: string[];

  constructor(allowedTools: string[] = [], deniedTools: string[] = []) {
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
  async checkPermission(toolName: string): Promise<PermissionLevel> {
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
  grantPermission(toolName: string): void {
    this.deniedTools.delete(toolName);
    this.allowedTools.add(toolName);
  }

  /**
   * Deny permission to a tool
   */
  denyPermission(toolName: string): void {
    this.allowedTools.delete(toolName);
    this.deniedTools.add(toolName);
  }

  /**
   * Reset to ask for all tools
   */
  resetPermission(toolName: string): void {
    this.allowedTools.delete(toolName);
    this.deniedTools.delete(toolName);
  }

  /**
   * Add a wildcard allow pattern
   */
  allowPattern(pattern: string): void {
    if (pattern.includes('*')) {
      this.wildcardAllowed.push(pattern);
    } else {
      this.allowedTools.add(pattern);
    }
  }

  /**
   * Get all allowed tools
   */
  getAllowedTools(): string[] {
    return Array.from(this.allowedTools);
  }

  /**
   * Get all denied tools
   */
  getDeniedTools(): string[] {
    return Array.from(this.deniedTools);
  }

  /**
   * Export rules to JSON for persistence
   */
  exportRules(): PermissionRule[] {
    const rules: PermissionRule[] = [];

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
  importRules(rules: PermissionRule[]): void {
    this.allowedTools.clear();
    this.deniedTools.clear();
    this.wildcardAllowed = [];

    for (const rule of rules) {
      if (rule.level === 'allow') {
        if (rule.pattern.includes('*')) {
          this.wildcardAllowed.push(rule.pattern);
        } else {
          this.allowedTools.add(rule.pattern);
        }
      } else if (rule.level === 'deny') {
        this.deniedTools.add(rule.pattern);
      }
    }
  }
}
