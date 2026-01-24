/**
 * Test Tool Execution Helpers
 *
 * Utility functions for testing tool execution in Floyd Wrapper.
 */

import type { ToolExecution } from '../../src/types.ts';

/**
 * Mock tool execution
 */
export function createMockToolExecution(
  name: string,
  input: Record<string, unknown>,
  output?: string
): ToolExecution {
  return {
    toolName: name,
    input,
    output: output || `Mock output for ${name}`,
    status: 'success',
    timestamp: Date.now(),
  };
}

/**
 * Mock tool execution result
 */
export function createMockToolResult(
  toolName: string,
  result: string
): string {
  return JSON.stringify({
    tool: toolName,
    result,
    timestamp: Date.now(),
  });
}

/**
 * Validate tool execution structure
 */
export function validateToolExecution(execution: unknown): boolean {
  if (!execution || typeof execution !== 'object') {
    return false;
  }

  const exec = execution as Record<string, unknown>;

  return (
    typeof exec.toolName === 'string' &&
    typeof exec.input === 'object' &&
    typeof exec.status === 'string' &&
    typeof exec.timestamp === 'number'
  );
}

/**
 * Wait for async tool execution
 */
export async function waitForToolExecution(
  fn: () => Promise<unknown>,
  timeout = 5000
): Promise<unknown> {
  return Promise.race([
    fn(),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Tool execution timeout')), timeout)
    ),
  ]);
}

/**
 * Mock tool registry for testing
 */
export class MockToolRegistry {
  private tools = new Map<string, (input: Record<string, unknown>) => Promise<string>>();

  registerTool(
    name: string,
    handler: (input: Record<string, unknown>) => Promise<string>
  ): void {
    this.tools.set(name, handler);
  }

  async executeTool(name: string, input: Record<string, unknown>): Promise<string> {
    const handler = this.tools.get(name);
    if (!handler) {
      throw new Error(`Tool not found: ${name}`);
    }
    return handler(input);
  }

  hasTool(name: string): boolean {
    return this.tools.has(name);
  }

  clear(): void {
    this.tools.clear();
  }
}

/**
 * Create mock file system for testing file tools
 */
export class MockFileSystem {
  private files = new Map<string, string>();

  writeFile(path: string, content: string): void {
    this.files.set(path, content);
  }

  readFile(path: string): string | undefined {
    return this.files.get(path);
  }

  exists(path: string): boolean {
    return this.files.has(path);
  }

  deleteFile(path: string): void {
    this.files.delete(path);
  }

  listFiles(): string[] {
    return Array.from(this.files.keys());
  }

  clear(): void {
    this.files.clear();
  }
}
