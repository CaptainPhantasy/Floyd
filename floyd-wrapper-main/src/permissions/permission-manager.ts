/**
 * Permission Manager - Floyd Wrapper
 *
 * Handles permission requests for tool execution with CLI prompts and auto-confirm mode.
 */

import { toolRegistry } from '../tools/tool-registry.js';
import { logger } from '../utils/logger.js';
import type { ToolDefinition } from '../types.js';

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

    // Check permission level
    if (tool.permission === 'none') {
      // Auto-approve tools with 'none' permission level
      logger.debug(`Auto-approving tool: ${toolName} (permission: none)`);
      return true;
    }

    // Auto-confirm mode: approve all non-dangerous tools
    if (this.autoConfirm && tool.permission !== 'dangerous') {
      logger.debug(`Auto-confirm approved: ${toolName}`);
      return true;
    }

    // Format prompt for user
    const prompt = this.formatPrompt(tool, input);

    // Display prompt and get user response
    logger.permissionRequest(tool.name, tool.description);

    return this.promptUser(prompt, tool.permission);
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
   */
  private promptUser(prompt: string, permissionLevel: 'moderate' | 'dangerous'): Promise<boolean> {
    // Use external prompt function if provided (injected by CLI)
    if (this.externalPromptFn) {
      return this.externalPromptFn(prompt, permissionLevel);
    }

    // Fallback: Default deny if no prompt function is set
    // This prevents readline conflicts in production
    logger.warn('No prompt function set, denying permission by default');
    return Promise.resolve(false);
  }
}

// ============================================================================
// Global Permission Manager Instance
// ============================================================================

/**
 * Global permission manager instance
 */
export const permissionManager = new PermissionManager();
