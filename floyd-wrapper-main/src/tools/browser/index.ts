/**
 * Browser Tools - Floyd Wrapper
 *
 * Browser automation tools copied from FLOYD_CLI browser-server.ts
 * Note: Requires FloydChrome extension running at ws://localhost:3005
 */

import { z } from 'zod';
import type { ToolDefinition } from '../../types.js';
import { WebSocket } from 'ws';

interface JSONRPCMessage {
  jsonrpc: '2.0';
  id?: number | string;
  method?: string;
  params?: any;
  result?: any;
  error?: {
    code: number;
    message: string;
    data?: any;
  };
}

class BrowserClient {
  private ws: WebSocket | null = null;
  private messageId = 0;
  private pendingRequests: Map<number | string, {
    resolve: (value: any) => void;
    reject: (error: Error) => void;
  }> = new Map();
  private connected = false;
  private extensionUrl: string;
  private healthCheckFailed = false;

  constructor() {
    this.extensionUrl = process.env.FLOYD_EXTENSION_URL || 'ws://localhost:3005';
  }

  /**
   * Check if the browser extension is available and healthy
   */
  async healthCheck(): Promise<{ healthy: boolean; message: string }> {
    // If we previously failed health check, don't retry immediately
    if (this.healthCheckFailed) {
      return {
        healthy: false,
        message: `Browser extension health check previously failed. Ensure FloydChrome extension is running at ${this.extensionUrl}`
      };
    }

    // Try to connect if not already connected
    if (!this.connected || !this.ws || this.ws.readyState !== WebSocket.OPEN) {
      const connected = await this.connect();
      if (!connected) {
        this.healthCheckFailed = true;
        return {
          healthy: false,
          message: `Cannot connect to FloydChrome extension at ${this.extensionUrl}. Make sure the extension is installed and running.`
        };
      }
    }

    return {
      healthy: true,
      message: `Connected to FloydChrome extension at ${this.extensionUrl}`
    };
  }

  /**
   * Reset health check failure flag (allows retry)
   */
  resetHealthCheck(): void {
    this.healthCheckFailed = false;
  }

  async connect(): Promise<boolean> {
    return new Promise((resolve) => {
      try {
        this.ws = new WebSocket(this.extensionUrl);

        this.ws.on('open', () => {
          this.connected = true;
          this.healthCheckFailed = false;
          resolve(true);
        });

        this.ws.on('message', (data: Buffer) => {
          this.handleMessage(data.toString());
        });

        this.ws.on('error', () => {
          this.connected = false;
          this.healthCheckFailed = true;
          resolve(false);
        });

        this.ws.on('close', () => {
          this.connected = false;
        });

        setTimeout(() => {
          if (!this.connected) {
            this.healthCheckFailed = true;
          }
          resolve(this.connected);
        }, 5000);
      } catch {
        this.healthCheckFailed = true;
        resolve(false);
      }
    });
  }

  private handleMessage(data: string): void {
    try {
      const message: JSONRPCMessage = JSON.parse(data);
      if (message.id !== undefined && this.pendingRequests.has(message.id)) {
        const { resolve, reject } = this.pendingRequests.get(message.id)!;
        this.pendingRequests.delete(message.id);
        if (message.error) {
          reject(new Error(message.error.message));
        } else {
          resolve(message.result);
        }
      }
    } catch {
      // Ignore JSON parsing errors
    }
  }

  private async sendRequest(method: string, params?: any): Promise<any> {
    if (!this.ws || !this.connected) {
      const connected = await this.connect();
      if (!connected) {
        throw new Error('Could not connect to FloydChrome extension');
      }
    }

    const id = ++this.messageId;
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        if (this.pendingRequests.has(id)) {
          this.pendingRequests.delete(id);
          reject(new Error(`Request timeout: ${method}`));
        }
      }, 30000);

      this.pendingRequests.set(id, {
        resolve: (value: any) => {
          clearTimeout(timeout);
          resolve(value);
        },
        reject: (error: Error) => {
          clearTimeout(timeout);
          reject(error);
        },
      });

      const message: JSONRPCMessage = {
        jsonrpc: '2.0',
        id,
        method,
        params,
      };

      this.ws!.send(JSON.stringify(message));
    });
  }

  async callTool(toolName: string, args: Record<string, any>): Promise<any> {
    return this.sendRequest('tools/call', { name: toolName, arguments: args });
  }
}

const browserClient = new BrowserClient();

/**
 * Wrapper for browser tool execute functions that includes health check
 */
async function withBrowserHealthCheck(
  toolName: string,
  input: Record<string, any>
): Promise<{ success: boolean; data?: any; error?: { code: string; message: string } }> {
  const health = await browserClient.healthCheck();
  if (!health.healthy) {
    return {
      success: false,
      error: {
        code: 'BROWSER_EXTENSION_UNAVAILABLE' as const,
        message: health.message
      }
    };
  }
  const result = await browserClient.callTool(toolName, input);
  return { success: true, data: result };
}

// ============================================================================
// Browser Status Tool
// ============================================================================

export const browserStatusTool: ToolDefinition = {
  name: 'browser_status',
  description: 'Check connection status to FloydChrome extension',
  category: 'browser',
  inputSchema: z.object({}),
  permission: 'none',
  execute: async () => {
    const health = await browserClient.healthCheck();
    return {
      success: true,
      data: {
        healthy: health.healthy,
        extension_url: process.env.FLOYD_EXTENSION_URL || 'ws://localhost:3005',
        message: health.message
      }
    };
  }
} as ToolDefinition;

// ============================================================================
// Browser Navigate Tool
// ============================================================================

export const browserNavigateTool: ToolDefinition = {
  name: 'browser_navigate',
  description: 'Navigate to a URL in the browser',
  category: 'browser',
  inputSchema: z.object({
    url: z.string(),
    tabId: z.number().optional(),
  }),
  permission: 'moderate',
  execute: async (input) => withBrowserHealthCheck('navigate', input as Record<string, any>)
} as ToolDefinition;

// ============================================================================
// Browser Read Page Tool
// ============================================================================

export const browserReadPageTool: ToolDefinition = {
  name: 'browser_read_page',
  description: 'Get semantic accessibility tree of the current page',
  category: 'browser',
  inputSchema: z.object({
    tabId: z.number().optional(),
  }),
  permission: 'moderate',
  execute: async (input) => withBrowserHealthCheck('read_page', input as Record<string, any>)
} as ToolDefinition;

// ============================================================================
// Browser Screenshot Tool
// ============================================================================

export const browserScreenshotTool: ToolDefinition = {
  name: 'browser_screenshot',
  description: 'Capture screenshot for Computer Use/vision models',
  category: 'browser',
  inputSchema: z.object({
    fullPage: z.boolean().optional().default(false),
    selector: z.string().optional(),
    tabId: z.number().optional(),
  }),
  permission: 'moderate',
  execute: async (input) => withBrowserHealthCheck('screenshot', input as Record<string, any>)
} as ToolDefinition;

// ============================================================================
// Browser Click Tool
// ============================================================================

export const browserClickTool: ToolDefinition = {
  name: 'browser_click',
  description: 'Click element at coordinates or by CSS selector',
  category: 'browser',
  inputSchema: z.object({
    x: z.number().optional(),
    y: z.number().optional(),
    selector: z.string().optional(),
    tabId: z.number().optional(),
  }),
  permission: 'dangerous',
  execute: async (input) => withBrowserHealthCheck('click', input as Record<string, any>)
} as ToolDefinition;

// ============================================================================
// Browser Type Tool
// ============================================================================

export const browserTypeTool: ToolDefinition = {
  name: 'browser_type',
  description: 'Type text into the focused element',
  category: 'browser',
  inputSchema: z.object({
    text: z.string(),
    tabId: z.number().optional(),
  }),
  permission: 'dangerous',
  execute: async (input) => withBrowserHealthCheck('type', input as Record<string, any>)
} as ToolDefinition;

// ============================================================================
// Browser Find Tool
// ============================================================================

export const browserFindTool: ToolDefinition = {
  name: 'browser_find',
  description: 'Find element by natural language query',
  category: 'browser',
  inputSchema: z.object({
    query: z.string(),
    tabId: z.number().optional(),
  }),
  permission: 'moderate',
  execute: async (input) => withBrowserHealthCheck('find', input as Record<string, any>)
} as ToolDefinition;

// ============================================================================
// Browser Get Tabs Tool
// ============================================================================

export const browserGetTabsTool: ToolDefinition = {
  name: 'browser_get_tabs',
  description: 'List all open browser tabs',
  category: 'browser',
  inputSchema: z.object({}),
  permission: 'moderate',
  execute: async () => withBrowserHealthCheck('get_tabs', {})
} as ToolDefinition;

// ============================================================================
// Browser Create Tab Tool
// ============================================================================

export const browserCreateTabTool: ToolDefinition = {
  name: 'browser_create_tab',
  description: 'Open a new browser tab',
  category: 'browser',
  inputSchema: z.object({
    url: z.string().optional(),
  }),
  permission: 'moderate',
  execute: async (input) => withBrowserHealthCheck('tabs_create', input as Record<string, any>)
} as ToolDefinition;
