/**
 * Tool Registry - Floyd Wrapper
 *
 * Central registry for all tools with registration, execution, and permission handling.
 */

import { z } from 'zod';
import type { ToolDefinition, ToolResult, ToolCategory, ToolReceipt, ReceiptType, Receipt } from '../types.js';
import { logger } from '../utils/logger.js';
import { ToolExecutionError } from '../utils/errors.js';
import { getCheckpointManager, DANGEROUS_TOOLS, type Checkpoint } from '../rewind/index.js';
import { getSandboxManager } from '../sandbox/index.js';

// ============================================================================
// Tool Registry Class
// ============================================================================

/**
 * Registry for managing and executing tools
 */
export class ToolRegistry {
  /**
   * Map of all registered tools by name
   */
  private tools: Map<string, ToolDefinition>;

  /**
   * Map of tool names by category
   */
  private toolsByCategory: Map<ToolCategory, Set<string>>;

  /**
   * Current permission level for tool execution
   */
  private permissionLevel: 'auto' | 'ask' | 'deny';

  /**
   * Global ignore patterns for file/search operations
   */
  private ignorePatterns: string[] = [];

  constructor() {
    this.tools = new Map();
    this.toolsByCategory = new Map();
    this.permissionLevel = 'ask';
    this.ignorePatterns = [];

    // Initialize category sets
    const categories: ToolCategory[] = ['file', 'search', 'build', 'git', 'browser', 'cache', 'patch', 'special'];
    for (const category of categories) {
      this.toolsByCategory.set(category, new Set());
    }

    logger.debug('ToolRegistry initialized');
  }

  /**
   * Set permission level for tool execution
   */
  setPermissionLevel(level: 'auto' | 'ask' | 'deny'): void {
    this.permissionLevel = level;
    logger.debug(`Permission level set to: ${level}`);
  }

  /**
   * Get current permission level
   */
  getPermissionLevel(): 'auto' | 'ask' | 'deny' {
    return this.permissionLevel;
  }

  /**
   * Set global ignore patterns
   */
  setIgnorePatterns(patterns: string[]): void {
    this.ignorePatterns = patterns;
    logger.debug(`Set ${patterns.length} ignore patterns`);
  }

  /**
   * Get global ignore patterns
   */
  getIgnorePatterns(): string[] {
    return this.ignorePatterns;
  }

  /**
   * Register a new tool
   *
   * @throws Error if tool with same name already exists
   */
  register(tool: ToolDefinition): void {
    if (this.tools.has(tool.name)) {
      throw new ToolExecutionError(tool.name, `Tool "${tool.name}" already registered`);
    }

    this.tools.set(tool.name, tool);
    this.toolsByCategory.get(tool.category)!.add(tool.name);

    logger.debug(`Registered tool: ${tool.name} (${tool.category})`);
  }

  /**
   * Register multiple tools at once
   */
  registerAll(tools: ToolDefinition[]): void {
    for (const tool of tools) {
      this.register(tool);
    }
  }

  /**
   * Get a tool by name
   */
  get(name: string): ToolDefinition | undefined {
    return this.tools.get(name);
  }

  /**
   * Check if a tool is registered
   */
  has(name: string): boolean {
    return this.tools.has(name);
  }

  /**
   * Get all tool names
   */
  getAllNames(): string[] {
    return Array.from(this.tools.keys());
  }

  /**
   * Get all tool definitions
   */
  getAll(): ToolDefinition[] {
    return Array.from(this.tools.values());
  }

  /**
   * Get tools by category
   */
  getByCategory(category: ToolCategory): ToolDefinition[] {
    const toolNames = this.toolsByCategory.get(category);

    if (!toolNames) {
      return [];
    }

    const tools: ToolDefinition[] = [];
    const names = Array.from(toolNames);

    for (const name of names) {
      const tool = this.tools.get(name);
      if (tool) {
        tools.push(tool);
      }
    }

    return tools;
  }

  /**
   * Get tool names by category
   */
  getNamesByCategory(category: ToolCategory): string[] {
    const toolNames = this.toolsByCategory.get(category);
    return toolNames ? Array.from(toolNames) : [];
  }

  /**
   * Get all categories that have registered tools
   */
  getCategories(): ToolCategory[] {
    const categories: ToolCategory[] = [];
    const entries = Array.from(this.toolsByCategory.entries());

    for (const [category, tools] of entries) {
      if (tools.size > 0) {
        categories.push(category);
      }
    }

    return categories;
  }

  /**
   * Clear all registered tools
   */
  clear(): void {
    this.tools.clear();
    const toolSets = Array.from(this.toolsByCategory.values());

    for (const tools of toolSets) {
      tools.clear();
    }

    logger.debug('ToolRegistry cleared');
  }

  /**
   * Unregister a tool by name
   */
  unregister(name: string): boolean {
    const tool = this.tools.get(name);

    if (!tool) {
      return false;
    }

    // Remove from tools map
    this.tools.delete(name);

    // Remove from category set
    const categoryTools = this.toolsByCategory.get(tool.category);
    if (categoryTools) {
      categoryTools.delete(name);
    }

    logger.debug(`Unregistered tool: ${name}`);

    return true;
  }

  /**
   * Get tool documentation
   */
  getDocumentation(name: string): string | undefined {
    const tool = this.tools.get(name);

    if (!tool) {
      return undefined;
    }

    const lines: string[] = [];

    lines.push(`# ${tool.name}`);
    lines.push('');
    lines.push(`**Description:** ${tool.description}`);
    lines.push('');
    lines.push(`**Category:** ${tool.category}`);
    lines.push(`**Permission:** ${tool.permission}`);
    lines.push('');
    lines.push('**Input Schema:**');
    lines.push('```json');
    lines.push(JSON.stringify(tool.inputSchema, null, 2));
    lines.push('```');

    if (tool.example) {
      lines.push('');
      lines.push('**Example:**');
      lines.push('```json');
      lines.push(JSON.stringify(tool.example, null, 2));
      lines.push('```');
    }

    return lines.join('\n');
  }

  /**
   * Check if a tool requires permission
   */
  requiresPermission(toolName: string): boolean {
    const tool = this.tools.get(toolName);

    if (!tool) {
      return false;
    }

    return tool.permission !== 'none';
  }

  /**
   * Check if permission should be granted based on current level
   */
  shouldGrantPermission(tool: ToolDefinition): boolean {
    switch (this.permissionLevel) {
      case 'auto':
        // Auto-approve non-dangerous tools
        return tool.permission !== 'dangerous';

      case 'ask':
        // Always ask for tools that require permission
        return false;

      case 'deny':
        // Deny all tools that require permission
        return false;

      default:
        return false;
    }
  }

  /**
   * Execute a tool by name with given input
   */
  async execute(
    name: string,
    input: unknown,
    options: { permissionGranted?: boolean } = {}
  ): Promise<ToolResult> {
    const tool = this.tools.get(name);

    if (!tool) {
      return {
        success: false,
        error: {
          code: 'TOOL_NOT_FOUND',
          message: `Tool "${name}" not found in registry`,
        },
      };
    }

    // Validate input with Zod schema
    let validatedInput: unknown;

    try {
      validatedInput = tool.inputSchema.parse(input);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errorDetails = error.errors.map((e) => ({
          path: e.path.join('.'),
          message: e.message,
        }));

        return {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: `Invalid input for tool "${name}"`,
            details: errorDetails,
          },
        };
      }

      return {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: `Failed to validate input for tool "${name}"`,
          details: error instanceof Error ? error.message : String(error),
        },
      };
    }

    // Check permissions
    if (tool.permission !== 'none' && !options.permissionGranted) {
      if (!this.shouldGrantPermission(tool)) {
        logger.warn(`Permission required for tool: ${name}`);

        return {
          success: false,
          error: {
            code: 'PERMISSION_REQUIRED',
            message: `Permission required for tool "${name}" (level: ${tool.permission})`,
            details: {
              tool: name,
              permission: tool.permission,
            },
          },
        };
      }
    }

    // Execute tool
    logger.debug(`Executing tool: ${name}`);

    // FIX #1: Translate paths to sandbox if active (YOLO mode)
    const inputForExecution = this.translateInputToSandbox(name, validatedInput as Record<string, unknown>);

    try {
      const result = await tool.execute(inputForExecution);

      // FIX #1: Track sandbox changes after execution
      if (result && typeof result === 'object') {
        this.trackSandboxChanges(name, inputForExecution as Record<string, unknown>, result as unknown);
      }

      logger.debug(`Tool ${name} completed successfully`);
      logger.tool(name, validatedInput, result);

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);

      logger.error(`Tool ${name} failed: ${errorMessage}`);

      return {
        success: false,
        error: {
          code: 'TOOL_EXECUTION_FAILED',
          message: `Tool "${name}" execution failed`,
          details: error,
        },
      };
    }
  }

  /**
   * Get tool count
   */
  count(): number {
    return this.tools.size;
  }

  /**
   * Get tool count by category
   */
  countByCategory(): Record<string, number> {
    const counts: Record<string, number> = {};
    const entries = Array.from(this.toolsByCategory.entries());

    for (const [category, tools] of entries) {
      counts[category] = tools.size;
    }

    return counts;
  }

  /**
   * Generate tool definitions for API (Anthropic-compatible format)
   */
  toAPIDefinitions(): Array<{ name: string; description: string; input_schema: Record<string, unknown> }> {
    const definitions: Array<{ name: string; description: string; input_schema: Record<string, unknown> }> = [];

    for (const tool of this.getAll()) {
      // Convert Zod schema to JSON Schema
      const jsonSchema = this.zodToJsonSchema(tool.inputSchema);

      definitions.push({
        name: tool.name,
        description: tool.description,
        input_schema: jsonSchema,
      });
    }

    return definitions;
  }

  /**
   * Convert Zod schema to JSON Schema (simplified version)
   */
  private zodToJsonSchema(zodSchema: z.ZodTypeAny): Record<string, unknown> {
    // This is a simplified implementation
    // For production, use zod-to-json-schema library
    const schema: Record<string, unknown> = { type: 'object', properties: {} as Record<string, unknown> };

    if (zodSchema instanceof z.ZodObject) {
      const shape = zodSchema.shape as Record<string, z.ZodTypeAny>;
      const properties = schema.properties as Record<string, unknown>;

      for (const [key, value] of Object.entries(shape)) {
        const jsonSchema = this.zodTypeToJson(value);
        if (jsonSchema) {
          properties[key] = jsonSchema;
        }
      }
    }

    return schema;
  }

  /**
   * Convert individual Zod type to JSON Schema
   */
  private zodTypeToJson(zodType: z.ZodTypeAny): unknown {
    if (zodType instanceof z.ZodString) {
      return { type: 'string' };
    }

    if (zodType instanceof z.ZodNumber) {
      return { type: 'number' };
    }

    if (zodType instanceof z.ZodBoolean) {
      return { type: 'boolean' };
    }

    if (zodType instanceof z.ZodArray) {
      return {
        type: 'array',
        items: this.zodTypeToJson(zodType.element),
      };
    }

    if (zodType instanceof z.ZodOptional) {
      return this.zodTypeToJson(zodType.unwrap());
    }

    if (zodType instanceof z.ZodDefault) {
      return this.zodTypeToJson(zodType.removeDefault());
    }

    if (zodType instanceof z.ZodEnum) {
      return {
        type: 'string',
        enum: zodType.options,
      };
    }

    // Fallback for complex types
    return { type: 'object' };
  }

  /**
   * Generate tool summary
   */
  getSummary(): {
    total: number;
    byCategory: Record<string, number>;
    tools: Array<{ name: string; category: string; permission: string }>;
  } {
    const tools = this.getAll();

    return {
      total: this.count(),
      byCategory: this.countByCategory(),
      tools: tools.map((tool) => ({
        name: tool.name,
        category: tool.category,
        permission: tool.permission,
      })),
    };
  }

  // ==========================================================================
  // Receipt-based Execution (v1.2.0+)
  // ==========================================================================

  /**
   * Map tool category to receipt type
   */
  private categoryToReceiptType(category: ToolCategory, toolName: string): ReceiptType {
    // Check for specific tool patterns
    if (toolName.includes('read')) return 'file_read';
    if (toolName.includes('write') || toolName.includes('edit')) return 'file_write';

    // Map by category
    const categoryMap: Record<ToolCategory, ReceiptType> = {
      'file': 'file_read',
      'search': 'search',
      'build': 'command',
      'git': 'git',
      'browser': 'browser',
      'cache': 'cache',
      'patch': 'file_write',
      'special': 'command',
    };

    return categoryMap[category] || 'command';
  }

  /**
   * Extract source from tool input for receipts
   */
  private extractSourceFromInput(input: unknown, toolName: string): string {
    const inputObj = input as Record<string, unknown>;

    // Try common path fields
    if (inputObj.file_path) return String(inputObj.file_path);
    if (inputObj.path) return String(inputObj.path);
    if (inputObj.filePath) return String(inputObj.filePath);
    if (inputObj.command) return String(inputObj.command);
    if (inputObj.query) return String(inputObj.query).substring(0, 50);
    if (inputObj.pattern) return String(inputObj.pattern).substring(0, 50);
    if (inputObj.url) return String(inputObj.url);

    return toolName;
  }

  /**
   * Execute a tool with full receipt/audit trail (v1.2.0+)
   * Non-breaking: Wraps execute() and adds receipt metadata
   */
  async executeWithReceipt(
    name: string,
    input: unknown,
    options: { permissionGranted?: boolean } = {}
  ): Promise<ToolReceipt> {
    const startedAt = Date.now();

    // Execute using existing method
    const result = await this.execute(name, input, options);

    const completedAt = Date.now();
    const duration_ms = completedAt - startedAt;

    // Get tool for category info
    const tool = this.tools.get(name);
    const category: ToolCategory = tool?.category || 'special';

    // Build receipt
    const receiptType = this.categoryToReceiptType(category, name);
    const source = this.extractSourceFromInput(input, name);

    const receipt: Receipt = {
      type: receiptType,
      source: source,
      timestamp: startedAt,
      duration_ms: duration_ms,
    };

    // Build warnings array
    const warnings: string[] = [];
    if (duration_ms > 5000) {
      warnings.push(`Slow execution: ${duration_ms}ms`);
    }

    // Determine status
    let status: 'success' | 'error' | 'partial' = 'success';
    if (!result.success) {
      status = 'error';
    } else if (warnings.length > 0) {
      status = 'partial';
    }

    // Build next_actions suggestions
    const next_actions: string[] = [];
    if (result.success) {
      if (receiptType === 'file_write') {
        next_actions.push('verify_file_exists');
      }
      if (receiptType === 'command') {
        next_actions.push('check_exit_code');
      }
    } else {
      next_actions.push('check_error_details');
      next_actions.push('retry_with_corrections');
    }

    // Return enhanced receipt
    const toolReceipt: ToolReceipt = {
      ...result,
      status,
      warnings,
      receipts: [receipt],
      next_actions,
      duration_ms,
      started_at: startedAt,
      completed_at: completedAt,
    };

    logger.debug(`Tool ${name} receipt generated: ${status} (${duration_ms}ms)`);

    return toolReceipt;
  }

  // ==========================================================================
  // Auto-Checkpoint Execution (v1.3.0+)
  // ==========================================================================

  /**
   * Extract affected file paths from tool input
   * Used to determine which files to snapshot before dangerous operations
   */
  private extractAffectedPaths(input: unknown, _toolName: string): string[] {
    const inputObj = input as Record<string, unknown>;
    const paths: string[] = [];

    // Common path field names
    const pathFields = [
      'file_path', 'path', 'filePath', 'target', 'destination',
      'source', 'from', 'to', 'file', 'filename'
    ];

    for (const field of pathFields) {
      if (inputObj[field] && typeof inputObj[field] === 'string') {
        paths.push(inputObj[field] as string);
      }
    }

    // Handle array of paths
    if (Array.isArray(inputObj.paths)) {
      paths.push(...inputObj.paths.filter((p): p is string => typeof p === 'string'));
    }

    if (Array.isArray(inputObj.files)) {
      paths.push(...inputObj.files.filter((p): p is string => typeof p === 'string'));
    }

    return paths;
  }

  /**
   * Check if a tool is considered dangerous (should trigger auto-checkpoint)
   */
  isDangerousTool(toolName: string): boolean {
    return DANGEROUS_TOOLS.includes(toolName);
  }

  /**
   * Execute a tool with automatic checkpoint creation for dangerous operations
   * Creates a checkpoint before executing dangerous tools (delete, move, write, etc.)
   *
   * @param name - Tool name
   * @param input - Tool input
   * @param options - Execution options including session ID for checkpoint tracking
   * @returns Tool result with optional checkpoint info
   */
  async executeWithAutoCheckpoint(
    name: string,
    input: unknown,
    options: {
      permissionGranted?: boolean;
      sessionId?: string;
      autoCheckpointEnabled?: boolean;
    } = {}
  ): Promise<ToolReceipt & { checkpoint?: Checkpoint }> {
    const { autoCheckpointEnabled = true, sessionId } = options;

    let checkpoint: Checkpoint | undefined;

    // Create auto-checkpoint for dangerous tools
    if (autoCheckpointEnabled && this.isDangerousTool(name)) {
      const affectedPaths = this.extractAffectedPaths(input, name);

      if (affectedPaths.length > 0) {
        try {
          const checkpointManager = getCheckpointManager();
          const created = await checkpointManager.createAutoCheckpoint(
            name,
            affectedPaths,
            sessionId
          );

          if (created) {
            checkpoint = created;
            logger.info(`Auto-checkpoint created before ${name}`, {
              checkpointId: checkpoint.id,
              fileCount: checkpoint.fileCount,
            });
          }
        } catch (error) {
          // Don't fail the tool execution if checkpoint creation fails
          logger.warn(`Failed to create auto-checkpoint for ${name}`, { error });
        }
      }
    }

    // Execute with receipt
    const receipt = await this.executeWithReceipt(name, input, {
      permissionGranted: options.permissionGranted,
    });

    // Add checkpoint to result if created
    return {
      ...receipt,
      checkpoint,
    };
  }

  // ==========================================================================
  // FIX #1: Sandbox Integration for YOLO Mode
  // ==========================================================================

  /**
   * Translate input paths to sandbox paths when sandbox is active
   * This ensures file operations in YOLO mode go to the sandbox, not real project
   */
  private translateInputToSandbox(name: string, input: Record<string, unknown>): Record<string, unknown> {
    const sandboxManager = getSandboxManager();

    // Only translate if sandbox is active and mode is YOLO
    if (!sandboxManager.isActive() || process.env.FLOYD_MODE !== 'yolo') {
      return input;
    }

    // Tools that modify files - need sandbox translation
    const fileModifyingTools = [
      'write', 'write_file', 'edit_file', 'create_file',
      'delete', 'delete_file', 'remove', 'rm',
      'move', 'move_file', 'rename', 'mv',
      'replace_in_file', 'search_replace',
      'apply_unified_diff', 'patch',
    ];

    // Only translate for file-modifying tools
    if (!fileModifyingTools.includes(name)) {
      return input;
    }

    const translated = { ...input };
    const pathFields = ['file_path', 'filePath', 'path', 'source', 'destination'];

    for (const field of pathFields) {
      if (translated[field] && typeof translated[field] === 'string') {
        try {
          const realPath = String(translated[field]);
          const sandboxPath = sandboxManager.translatePath(realPath);
          translated[field] = sandboxPath;
          logger.debug(`[SANDBOX] Translated ${realPath} → ${sandboxPath}`);
        } catch (error) {
          // Path is outside project root, leave as-is
          logger.debug(`[SANDBOX] Path outside project root, not translated: ${translated[field]}`);
        }
      }
    }

    // Handle array of paths
    const arrayFields = ['paths', 'files', 'file_paths', 'targets'];
    for (const field of arrayFields) {
      if (Array.isArray(translated[field])) {
        translated[field] = (translated[field] as string[]).map(p => {
          try {
            return sandboxManager.translatePath(String(p));
          } catch {
            return p; // Path outside project root
          }
        });
      }
    }

    return translated;
  }

  /**
   * Track sandbox changes after tool execution
   * Called after a file-modifying tool completes in YOLO mode with sandbox active
   */
  private trackSandboxChanges(name: string, input: Record<string, unknown>, _result: unknown): void {
    const sandboxManager = getSandboxManager();

    if (!sandboxManager.isActive() || process.env.FLOYD_MODE !== 'yolo') {
      return;
    }

    // Track the change based on tool type
    const pathFields = ['file_path', 'filePath', 'path', 'source'];
    for (const field of pathFields) {
      if (input[field] && typeof input[field] === 'string') {
        const sandboxPath = String(input[field]);
        try {
          const realPath = sandboxManager.translateToReal(sandboxPath);

          // Determine change type based on tool name
          let changeType: 'created' | 'modified' | 'deleted' = 'modified';
          if (name.includes('delete') || name.includes('remove') || name.includes('rm')) {
            changeType = 'deleted';
          } else if (name.includes('create') || name.includes('write')) {
            changeType = 'created';
          }

          sandboxManager.trackChange(sandboxPath, changeType);
          logger.debug(`[SANDBOX] Tracked ${changeType}: ${realPath}`);
        } catch {
          // Path outside sandbox
        }
      }
    }
  }
}

// ============================================================================
// Global Registry Instance
// ============================================================================

/**
 * Global tool registry instance
 */
export const toolRegistry = new ToolRegistry();
