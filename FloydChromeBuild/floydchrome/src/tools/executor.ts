/**
 * Tool Executor
 * Routes tool calls to appropriate implementations
 */

import { NavigationTools } from './navigation.js';
import { ReadingTools } from './reading.js';
import { InteractionTools } from './interaction.js';
import { TabTools } from './tabs.js';
import { ScreenshotTools } from './screenshot.js';
import type { ToolName, ToolMetadata, ToolInput, ToolResult } from './types.js';

export class ToolExecutor {
  private tools: Map<ToolName, (params: ToolInput) => Promise<ToolResult>>;
  private toolMetadata: Map<string, ToolMetadata>;

  constructor() {
    this.tools = new Map([
      // Navigation
      ['navigate', NavigationTools.navigate],

      // Reading
      ['read_page', ReadingTools.readPage],
      ['get_page_text', ReadingTools.getPageText],
      ['find', ReadingTools.find],

      // Screenshot (Computer Use)
      ['screenshot', ScreenshotTools.screenshot],

      // Interaction
      ['click', InteractionTools.click],
      ['type', InteractionTools.type],

      // Tabs
      ['tabs_create', TabTools.createTab],
      ['get_tabs', TabTools.getTabs]
    ]);

    this.toolMetadata = new Map<string, ToolMetadata>([
      ['navigate', {
        name: 'navigate',
        description: 'Navigate to a URL',
        inputSchema: {
          type: 'object',
          properties: {
            url: { type: 'string', description: 'URL to navigate to' },
            tabId: { type: 'number', description: 'Tab ID (optional, uses active tab if not provided)' }
          },
          required: ['url']
        }
      }],
      ['read_page', {
        name: 'read_page',
        description: 'Get semantic accessibility tree of the page',
        inputSchema: {
          type: 'object',
          properties: {
            tabId: { type: 'number', description: 'Tab ID (optional, uses active tab if not provided)' }
          }
        }
      }],
      ['get_page_text', {
        name: 'get_page_text',
        description: 'Extract visible text content from the page',
        inputSchema: {
          type: 'object',
          properties: {
            tabId: { type: 'number', description: 'Tab ID (optional, uses active tab if not provided)' }
          }
        }
      }],
      ['find', {
        name: 'find',
        description: 'Locate element by natural language query',
        inputSchema: {
          type: 'object',
          properties: {
            query: { type: 'string', description: 'Natural language description of element to find' },
            tabId: { type: 'number', description: 'Tab ID (optional, uses active tab if not provided)' }
          },
          required: ['query']
        }
      }],
      ['screenshot', {
        name: 'screenshot',
        description: 'Capture screenshot of page, element, or viewport. Returns base64-encoded image data for Computer Use/vision models.',
        inputSchema: {
          type: 'object',
          properties: {
            fullPage: { type: 'boolean', description: 'Capture full scrollable page (default: false)' },
            selector: { type: 'string', description: 'CSS selector to capture specific element' },
            tabId: { type: 'number', description: 'Tab ID (optional, uses active tab if not provided)' }
          }
        }
      }],
      ['click', {
        name: 'click',
        description: 'Click element at coordinates or by selector',
        inputSchema: {
          type: 'object',
          properties: {
            x: { type: 'number', description: 'X coordinate' },
            y: { type: 'number', description: 'Y coordinate' },
            selector: { type: 'string', description: 'CSS selector (alternative to coordinates)' },
            tabId: { type: 'number', description: 'Tab ID (optional, uses active tab if not provided)' }
          }
        }
      }],
      ['type', {
        name: 'type',
        description: 'Type text into focused element',
        inputSchema: {
          type: 'object',
          properties: {
            text: { type: 'string', description: 'Text to type' },
            tabId: { type: 'number', description: 'Tab ID (optional, uses active tab if not provided)' }
          },
          required: ['text']
        }
      }],
      ['tabs_create', {
        name: 'tabs_create',
        description: 'Open a new tab',
        inputSchema: {
          type: 'object',
          properties: {
            url: { type: 'string', description: 'URL to open (optional)' }
          }
        }
      }],
      ['get_tabs', {
        name: 'get_tabs',
        description: 'List all open tabs',
        inputSchema: {
          type: 'object',
          properties: {}
        }
      }]
    ]);
  }

  /**
   * Execute a tool
   */
  async execute(toolName: string, params: ToolInput = {}): Promise<ToolResult> {
    const tool = this.tools.get(toolName as ToolName);

    if (!tool) {
      return {
        success: false,
        error: `Unknown tool: ${toolName}`
      };
    }

    try {
      return await tool(params);
    } catch (error: any) {
      console.error(`[ToolExecutor] Error executing ${toolName}:`, error);
      return {
        success: false,
        error: error.message || String(error)
      };
    }
  }

  /**
   * List all available tools
   */
  listTools(): string[] {
    return Array.from(this.tools.keys());
  }

  /**
   * Get tool metadata
   */
  getToolMetadata(toolName: string): ToolMetadata | null {
    return this.toolMetadata.get(toolName) || null;
  }

  /**
   * Get all tool metadata
   */
  getAllToolMetadata(): Record<string, ToolMetadata> {
    const result: Record<string, ToolMetadata> = {};
    for (const [name, metadata] of this.toolMetadata) {
      result[name] = metadata;
    }
    return result;
  }
}
