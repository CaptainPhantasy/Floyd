/**
 * Tool Registry - Floyd Wrapper
 *
 * Central registry for all tools with registration, execution, and permission handling.
 */

import { z } from 'zod';
import type { ToolDefinition, ToolResult, ToolCategory } from '../types.js';
import { logger } from '../utils/logger.js';
import { ToolExecutionError } from '../utils/errors.js';

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

    try {
      const result = await tool.execute(validatedInput);

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
}

// ============================================================================
// Global Registry Instance
// ============================================================================

/**
 * Global tool registry instance
 */
export const toolRegistry = new ToolRegistry();
