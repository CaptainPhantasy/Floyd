/**
 * Tool Executor
 * Routes tool calls to appropriate implementations
 */

import { NavigationTools } from './navigation.js';
import { ReadingTools } from './reading.js';
import { InteractionTools } from './interaction.js';
import { TabTools } from './tabs.js';

export class ToolExecutor {
  constructor() {
    this.tools = {
      // Navigation
      browser_navigate: NavigationTools.navigate,
      
      // Reading
      browser_read_page: ReadingTools.readPage,
      get_page_text: ReadingTools.getPageText,
      find: ReadingTools.find,
      
      // Interaction
      browser_click: InteractionTools.click,
      browser_type: InteractionTools.type,
      
      // Tabs
      tabs_create: TabTools.createTab,
      browser_get_tabs: TabTools.getTabs
    };

    // Set global reference for agent/floyd.js to access
    globalThis.toolExecutor = this;

    this.toolMetadata = {
      browser_navigate: {
        name: 'browser_navigate',
        description: 'Navigate to a URL',
        inputSchema: {
          type: 'object',
          properties: {
            url: { type: 'string', description: 'URL to navigate to' },
            tabId: { type: 'number', description: 'Tab ID (optional, uses active tab if not provided)' }
          },
          required: ['url']
        }
      },
      browser_read_page: {
        name: 'browser_read_page',
        description: 'Get semantic accessibility tree of the page',
        inputSchema: {
          type: 'object',
          properties: {
            tabId: { type: 'number', description: 'Tab ID (optional, uses active tab if not provided)' }
          }
        }
      },
      browser_click: {
        name: 'browser_click',
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
      },
      browser_type: {
        name: 'browser_type',
        description: 'Type text into focused element',
        inputSchema: {
          type: 'object',
          properties: {
            text: { type: 'string', description: 'Text to type' },
            tabId: { type: 'number', description: 'Tab ID (optional, uses active tab if not provided)' }
          },
          required: ['text']
        }
      },
      browser_get_tabs: {
        name: 'browser_get_tabs',
        description: 'List all open tabs',
        inputSchema: {
          type: 'object',
          properties: {}
        }
      }
    };
  }

  /**
   * Execute a tool
   */
  async execute(toolName, params = {}) {
    const tool = this.tools[toolName];
    
    if (!tool) {
      throw new Error(`Unknown tool: ${toolName}`);
    }

    try {
      const result = await tool(params);
      return result;
    } catch (error) {
      console.error(`[ToolExecutor] Error executing ${toolName}:`, error);
      throw error;
    }
  }

  /**
   * List all available tools
   */
  listTools() {
    return Object.keys(this.tools);
  }

  /**
   * Get tool metadata
   */
  getToolMetadata(toolName) {
    return this.toolMetadata[toolName] || null;
  }

  /**
   * Get all tool metadata
   */
  getAllToolMetadata() {
    return this.toolMetadata;
  }
}
