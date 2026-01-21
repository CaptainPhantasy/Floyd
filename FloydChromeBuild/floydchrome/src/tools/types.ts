/**
 * Tool types and interfaces
 */

export type ToolName =
  | 'navigate'
  | 'read_page'
  | 'get_page_text'
  | 'find'
  | 'click'
  | 'type'
  | 'tabs_create'
  | 'get_tabs'
  | 'screenshot';

export interface ToolInput {
  url?: string;
  tabId?: number;
  query?: string;
  x?: number;
  y?: number;
  selector?: string;
  text?: string;
  fullPage?: boolean;
}

export interface ToolResult {
  success: boolean;
  data?: any;
  error?: string;
}

export interface ToolMetadata {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, {
      type: string;
      description?: string;
    }>;
    required?: string[];
  };
}

export type ToolFunction = (params: ToolInput) => Promise<ToolResult>;

export interface ToolDefinition {
  name: ToolName;
  fn: ToolFunction;
  metadata: ToolMetadata;
}

/**
 * Helper to get the active tab
 */
export async function getActiveTab(): Promise<chrome.tabs.Tab | null> {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  return tab || null;
}

/**
 * Helper to ensure debugger is attached to a tab
 */
export async function ensureDebuggerAttached(tabId: number): Promise<boolean> {
  try {
    // Check if already attached
    const attached = await chrome.debugger.getTargets().then(targets =>
      targets.some(t => t.tabId === tabId && t.attached)
    );

    if (attached) return true;

    // Attach debugger
    await chrome.debugger.attach({ tabId }, '1.3');
    return true;
  } catch (error) {
    console.error('Failed to attach debugger:', error);
    return false;
  }
}
