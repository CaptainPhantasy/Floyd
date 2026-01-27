/**
 * Permission Manager - Floyd Wrapper
 *
 * Handles permission requests for tool execution with CLI prompts and auto-confirm mode.
 *
 * SAFETY FIX (Gap #1): When no prompt function is registered, throws a clear error
 * instead of silently denying permissions. This makes the failure mode visible.
 *
 * FIX #5: Added audit history tracking for all permission decisions
 */

import { toolRegistry } from '../tools/tool-registry.js';
import { logger } from '../utils/logger.js';
import type { ToolDefinition } from '../types.js';
import * as readline from 'node:readline';

// ============================================================================
// Permission Audit Types
// ============================================================================

/**
 * Permission audit entry - tracks individual permission decisions
 */
export interface PermissionAuditEntry {
  /** Tool name that was requested */
  toolName: string;
  /** Permission level of the tool */
  permissionLevel: 'none' | 'moderate' | 'dangerous';
  /** Target (file path, URL, etc.) being acted on */
  target: string;
  /** Decision made */
  decision: 'GRANTED' | 'DENIED';
  /** Timestamp of request */
  timestamp: string;
}

/**
 * Permission audit statistics
 */
export interface PermissionAuditStats {
  /** Total permission requests */
  total: number;
  /** Number of grants */
  granted: number;
  /** Number of denies */
  denied: number;
  /** Breakdown by permission level */
  byLevel: Record<string, { granted: number; denied: number }>;
}

// ============================================================================
// Permission Prompt Function Type
// ============================================================================

/**
 * Function type for prompting user for permission
 */
export type PermissionPromptFunction = (
  prompt: string,
  permissionLevel: 'moderate' | 'dangerous'
) => Promise<boolean>;

// ============================================================================
// Custom Error Types
// ============================================================================

/**
 * Error thrown when permission system is not properly initialized
 */
export class PermissionSystemNotInitializedError extends Error {
  constructor() {
    super(
      'Permission system not initialized. ' +
      'The execution engine requires a prompt function to be registered via setPromptFunction(). ' +
      'If using the CLI directly, this should happen automatically. ' +
      'If embedding the engine, call permissionManager.setPromptFunction(fn) ' +
      'or use setAutoConfirm(true) for non-interactive mode.'
    );
    this.name = 'PermissionSystemNotInitializedError';
  }
}

// ============================================================================
// Permission Manager Class
// ============================================================================

/**
 * Manages permission requests for tool execution
 */
export class PermissionManager {
  /**
   * Auto-confirm mode (for testing)
   */
  private autoConfirm: boolean = false;

  /**
   * External prompt function (injected by CLI)
   */
  private externalPromptFn: PermissionPromptFunction | null = null;

  /**
   * Whether to throw errors instead of silent denial
   * @default true - errors are visible by default
   */
  private throwOnUninitialized: boolean = true;

  /**
   * FIX #5: In-memory audit history for the session
   */
  private auditHistory: PermissionAuditEntry[] = [];

  /**
   * Set auto-confirm mode for testing
   */
  setAutoConfirm(enabled: boolean): void {
    this.autoConfirm = enabled;
    logger.debug(`Auto-confirm mode: ${enabled}`);
  }

  /**
   * Check if auto-confirm is enabled
   */
  isAutoConfirm(): boolean {
    return this.autoConfirm;
  }

  /**
   * Set whether to throw errors when permission system is not initialized
   * @param enabled - If true, throws PermissionSystemNotInitializedError. If false, denies silently.
   * @default true
   */
  setThrowOnUninitialized(enabled: boolean): void {
    this.throwOnUninitialized = enabled;
    logger.debug(`Throw on uninitialized: ${enabled}`);
  }

  /**
   * Check if prompt function has been registered
   */
  isPromptFunctionSet(): boolean {
    return this.externalPromptFn !== null;
  }

  /**
   * Set external prompt function (used by CLI to provide its readline interface)
   */
  setPromptFunction(fn: PermissionPromptFunction): void {
    this.externalPromptFn = fn;
    logger.debug('External prompt function registered');
  }

  /**
   * Request permission for tool execution
   *
   * @param toolName - Name of the tool requesting permission
   * @param input - Input parameters for the tool
   * @returns true if approved, false if denied
   */
  async requestPermission(toolName: string, input: Record<string, unknown>): Promise<boolean> {
    // Get tool definition from registry
    const tool = toolRegistry.get(toolName);

    if (!tool) {
      logger.error(`Tool "${toolName}" not found in registry`);
      return false;
    }

    // GAP #5 FIX: Extract target for audit logging
    const target = this.extractTarget(input);

    // Check permission level - always auto-approve 'none' permission tools
    if (tool.permission === 'none') {
      logger.debug(`[PERMIT] ${toolName}:${target} - AUTO-APPROVED (permission: none)`);
      return true;
    }

    // Auto-confirm mode (for testing): approve all non-dangerous tools
    if (this.autoConfirm && tool.permission !== 'dangerous') {
      logger.debug(`[PERMIT] ${toolName}:${target} - AUTO-APPROVED (auto-confirm mode)`);
      // FIX #5: Audit log for auto-confirm
      this.addAuditEntry(toolName, tool.permission, target, 'GRANTED');
      return true;
    }

    // Format prompt for user
    const prompt = this.formatPrompt(tool, input);

    // Display prompt and get user response
    logger.permissionRequest(tool.name, tool.description);

    const decision = await this.promptUser(prompt, tool.permission);

    // GAP #5 FIX: Log the permission decision with audit trail
    if (decision) {
      logger.info(`[PERMIT] ${toolName}:${target} - APPROVED`);
    } else {
      logger.warn(`[PERMIT] ${toolName}:${target} - DENIED`);
    }

    // FIX #5: Add to audit history
    this.addAuditEntry(toolName, tool.permission, target, decision ? 'GRANTED' : 'DENIED');

    return decision;
  }

  /**
   * Extract target from input for audit logging
   * Shows what the tool is acting on (file path, URL, etc.)
   */
  private extractTarget(input: Record<string, unknown>): string {
    // Try common target field names
    const targetFields = ['file_path', 'path', 'filePath', 'url', 'command', 'query', 'pattern'];
    for (const field of targetFields) {
      if (input[field] && typeof input[field] === 'string') {
        const value = input[field] as string;
        // Truncate long values for readability
        return value.length > 50 ? value.substring(0, 47) + '...' : value;
      }
    }
    // Fallback to tool name if no target found
    return '(no target)';
  }

  /**
   * Format permission prompt for user
   *
   * @param tool - Tool definition
   * @param input - Input parameters for the tool
   * @returns Formatted prompt string
   */
  private formatPrompt(tool: ToolDefinition, input: Record<string, unknown>): string {
    let prompt = `\n${'='.repeat(60)}\n`;
    prompt += `Permission Required: ${tool.name}\n`;
    prompt += `${'='.repeat(60)}\n`;
    prompt += `Description: ${tool.description}\n`;
    prompt += `Permission Level: ${tool.permission.toUpperCase()}\n`;

    // Format input as JSON
    try {
      const inputJson = JSON.stringify(input, null, 2);
      prompt += `\nInput:\n${inputJson}\n`;
    } catch (error) {
      prompt += `\nInput: [Could not serialize]\n`;
    }

    // Add warning for dangerous tools
    if (tool.permission === 'dangerous') {
      prompt += `\n${'!'.repeat(60)}\n`;
      prompt += `WARNING: This tool is marked as DANGEROUS.\n`;
      prompt += `It may perform destructive or irreversible operations.\n`;
      prompt += `${'!'.repeat(60)}\n`;
    }

    prompt += `${'='.repeat(60)}\n`;

    return prompt;
  }

  /**
   * Prompt user for permission via readline
   *
   * @param prompt - Formatted prompt string
   * @param permissionLevel - Permission level of the tool
   * @returns true if approved, false if denied
   * @throws PermissionSystemNotInitializedError if no prompt function is set and throwOnUninitialized is true
   */
  private async promptUser(prompt: string, permissionLevel: 'moderate' | 'dangerous'): Promise<boolean> {
    // Use external prompt function if provided (injected by CLI)
    if (this.externalPromptFn) {
      return this.externalPromptFn(prompt, permissionLevel);
    }

    // SAFETY FIX (Gap #1): Instead of silent denial, make the failure visible
    // Check if we should throw an error (default behavior)
    if (this.throwOnUninitialized) {
      logger.error('Permission system not initialized - no prompt function registered');
      throw new PermissionSystemNotInitializedError();
    }

    // Legacy fallback: Default deny if no prompt function is set
    // This path is only used if throwOnUninitialized is explicitly set to false
    logger.warn('No prompt function set, denying permission by default (legacy mode)');
    return false;
  }

  /**
   * Provide a built-in readline-based prompt fallback
   * This can be used by embedders who don't want to provide their own prompt function
   *
   * @param prompt - Formatted prompt string
   * @param permissionLevel - Permission level of the tool
   * @returns true if approved, false if denied
   */
  async builtinPrompt(prompt: string, permissionLevel: 'moderate' | 'dangerous'): Promise<boolean> {
    // Check if we're in a TTY environment
    if (!process.stdin.isTTY) {
      logger.warn('Cannot prompt in non-interactive environment');
      return false;
    }

    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    try {
      // Show the prompt
      console.log(prompt);

      // Prompt text based on permission level
      const promptText = permissionLevel === 'dangerous'
        ? 'Approve dangerous operation? (y/N): '
        : 'Approve? (y/N): ';

      const response = await new Promise<string>((resolve) => {
        rl.question(promptText, (answer) => {
          resolve(answer.trim().toLowerCase());
        });
      });

      return response === 'y' || response === 'yes';
    } finally {
      rl.close();
    }
  }

  /**
   * FIX #5: Get audit history for the session
   */
  getAuditHistory(): PermissionAuditEntry[] {
    return [...this.auditHistory];
  }

  /**
   * FIX #5: Get audit statistics
   */
  getAuditStats(): PermissionAuditStats {
    const stats: PermissionAuditStats = {
      total: this.auditHistory.length,
      granted: 0,
      denied: 0,
      byLevel: {},
    };

    for (const entry of this.auditHistory) {
      if (entry.decision === 'GRANTED') {
        stats.granted++;
      } else {
        stats.denied++;
      }

      if (!stats.byLevel[entry.permissionLevel]) {
        stats.byLevel[entry.permissionLevel] = { granted: 0, denied: 0 };
      }

      if (entry.decision === 'GRANTED') {
        stats.byLevel[entry.permissionLevel].granted++;
      } else {
        stats.byLevel[entry.permissionLevel].denied++;
      }
    }

    return stats;
  }

  /**
   * FIX #5: Clear audit history
   */
  clearAuditHistory(): void {
    this.auditHistory = [];
    logger.debug('Audit history cleared');
  }

  /**
   * FIX #5: Public method for external logging of permission decisions
   * Used by CLI to log decisions made before requestPermission is called
   */
  logPermissionDecision(
    toolName: string,
    permissionLevel: 'none' | 'moderate' | 'dangerous',
    target: string,
    decision: 'GRANTED' | 'DENIED'
  ): void {
    this.addAuditEntry(toolName, permissionLevel, target, decision);
  }

  /**
   * FIX #5: Add entry to audit history
   */
  private addAuditEntry(
    toolName: string,
    permissionLevel: 'none' | 'moderate' | 'dangerous',
    target: string,
    decision: 'GRANTED' | 'DENIED'
  ): void {
    const now = new Date();
    const timestamp = now.toLocaleTimeString();

    this.auditHistory.push({
      toolName,
      permissionLevel,
      target,
      decision,
      timestamp,
    });
  }
}

// ============================================================================
// Global Permission Manager Instance
// ============================================================================

/**
 * Global permission manager instance
 */
export const permissionManager = new PermissionManager();
