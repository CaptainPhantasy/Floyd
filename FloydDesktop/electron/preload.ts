/**
 * FloydDesktop - Preload Script
 *
 * Bridges the main process and renderer process using contextBridge.
 * Exposes a safe API for the React UI to communicate with the agent.
 *
 * Includes Chrome extension fallback status and control API.
 */

import { contextBridge, ipcRenderer } from 'electron';

// Types for the exposed API
interface FloydAPI {
  // Agent communication
  sendMessage: (message: string) => Promise<string>;
  sendStreamedMessage: (message: string) => Promise<string>;
  onStreamChunk: (callback: (chunk: StreamChunk) => void) => void;
  removeStreamListener: () => void;

  // Tools
  listTools: () => Promise<Tool[]>;
  callTool: (name: string, args: Record<string, unknown>) => Promise<string>;

  // Sessions
  listSessions: () => Promise<SessionData[]>;
  loadSession: (id: string) => Promise<SessionData | null>;
  saveSession: (session: SessionData) => Promise<void>;
  deleteSession: (id: string) => Promise<void>;
  createSession: (cwd?: string) => Promise<SessionData>;

  // Agent status
  getAgentStatus: () => Promise<AgentStatus>;

  // Settings
  getSettings: () => Promise<Record<string, unknown>>;
  setSetting: (key: string, value: unknown) => Promise<void>;
  selectWorkingDirectory: () => Promise<string | null>;
  openSettings: () => void;
  closeSettings: () => void;
  onSettingsClose: (callback: () => void) => void;
  removeSettingsCloseListener: () => void;

  // Extension fallback
  enableExtensionFallback: () => Promise<boolean>;
  disableExtensionFallback: () => Promise<{ success: boolean }>;
  getExtensionFallbackStatus: () => Promise<ExtensionFallbackStatus>;
  onExtensionFallbackStatusChange: (callback: (status: ExtensionFallbackStatus) => void) => void;
  removeExtensionFallbackStatusListener: () => void;

  // Projects
  createProject?: (options: { name: string; path: string }) => Promise<{ success: boolean; project?: unknown; error?: string }>;
  listProjects?: () => Promise<{ success: boolean; projects?: unknown[]; error?: string }>;
  loadProject?: (id: string) => Promise<{ success: boolean; project?: unknown; error?: string }>;
  deleteProject?: (id: string) => Promise<{ success: boolean; error?: string }>;

  // Files
  listFiles?: (path: string) => Promise<{ success: boolean; files?: unknown[]; error?: string }>;

  // Tools (enhanced)
  getToolsByServer?: () => Promise<{ success: boolean; toolGroups?: unknown[]; error?: string }>;

  // Extension
  getExtensionStatus?: () => Promise<ExtensionFallbackStatus>;
  listBrowserTabs?: () => Promise<{ success: boolean; tabs?: unknown[] }>;

  // Sub-agents (Browork)
  spawnSubAgent?: (type: string, task: string) => Promise<{ success: boolean; subAgent?: unknown; error?: string }>;
  listSubAgents?: () => Promise<{ success: boolean; subAgents?: unknown[] }>;
  cancelSubAgent?: (id: string) => Promise<{ success: boolean; error?: string }>;
}

interface StreamChunk {
  token: string;
  done: boolean;
  tool_call?: ToolCall | null;
  tool_use_complete?: boolean;
  output?: string;
  stop_reason?: string;
  error?: Error;
  usage?: UsageInfo;
}

interface ToolCall {
  id: string;
  name: string;
  input: Record<string, unknown>;
  output?: string;
}

interface Tool {
  name: string;
  description: string;
  input_schema: Record<string, unknown>;
}

interface UsageInfo {
  input_tokens: number;
  output_tokens: number;
}

interface AgentStatus {
  connected: boolean;
  model: string;
  isProcessing: boolean;
  sessionId?: string;
  extensionFallback?: ExtensionFallbackStatus;
}

interface ExtensionFallbackStatus {
  enabled: boolean;
  available: boolean;
  connected: boolean;
  port?: number;
  toolCount?: number;
  error?: string;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  tool_calls?: ToolCall[];
  timestamp?: number;
}

interface SessionData {
  id: string;
  created: number;
  updated: number;
  title: string;
  working_dir: string;
  messages: Message[];
}

const API: FloydAPI = {
  // Agent communication
  sendMessage: (message: string) => ipcRenderer.invoke('floyd:send-message', message),

  sendStreamedMessage: (message: string) => {
    const channel = `floyd:stream:${Date.now()}`;
    ipcRenderer.send('floyd:send-streamed', message, channel);
    return Promise.resolve(channel);
  },

  onStreamChunk: (callback: (chunk: StreamChunk) => void) => {
    ipcRenderer.on('floyd:stream-chunk', (_: unknown, chunk: StreamChunk) => callback(chunk));
  },

  removeStreamListener: () => {
    ipcRenderer.removeAllListeners('floyd:stream-chunk');
  },

  // Tools
  listTools: () => ipcRenderer.invoke('floyd:list-tools'),
  callTool: (name: string, args: Record<string, unknown>) =>
    ipcRenderer.invoke('floyd:call-tool', name, args),

  // Sessions
  listSessions: () => ipcRenderer.invoke('floyd:list-sessions'),
  loadSession: (id: string) => ipcRenderer.invoke('floyd:load-session', id),
  saveSession: (session: SessionData) => ipcRenderer.invoke('floyd:save-session', session),
  deleteSession: (id: string) => ipcRenderer.invoke('floyd:delete-session', id),
  createSession: async (cwd?: string) => {
    const result = await ipcRenderer.invoke('floyd:create-session', cwd);
    if (result && 'success' in result && result.success && 'session' in result) {
      return result.session as SessionData;
    }
    throw new Error(result?.error || 'Failed to create session');
  },

  // Agent status
  getAgentStatus: () => ipcRenderer.invoke('floyd:agent-status'),

  // Settings
  getSettings: () => ipcRenderer.invoke('floyd:get-settings'),
  setSetting: (key: string, value: unknown) =>
    ipcRenderer.invoke('floyd:set-setting', key, value),
  selectWorkingDirectory: () => ipcRenderer.invoke('floyd:select-working-directory'),

  openSettings: () => ipcRenderer.send('floyd:open-settings'),
  closeSettings: () => ipcRenderer.send('floyd:close-settings'),

  onSettingsClose: (callback: () => void) => {
    ipcRenderer.on('floyd:settings-closed', () => callback());
  },

  removeSettingsCloseListener: () => {
    ipcRenderer.removeAllListeners('floyd:settings-closed');
  },

  // Extension fallback
  enableExtensionFallback: () => ipcRenderer.invoke('floyd:enable-extension-fallback'),
  disableExtensionFallback: () => ipcRenderer.invoke('floyd:disable-extension-fallback'),
  getExtensionFallbackStatus: () => ipcRenderer.invoke('floyd:get-extension-fallback-status'),

  onExtensionFallbackStatusChange: (callback: (status: ExtensionFallbackStatus) => void) => {
    ipcRenderer.on('floyd:extension-fallback-status', (_: unknown, status: ExtensionFallbackStatus) => callback(status));
  },

  removeExtensionFallbackStatusListener: () => {
    ipcRenderer.removeAllListeners('floyd:extension-fallback-status');
  },

  // Projects
  createProject: (options: { name: string; path: string }) =>
    ipcRenderer.invoke('floyd:create-project', options.name, options.path),
  listProjects: () => ipcRenderer.invoke('floyd:list-projects'),
  loadProject: (id: string) => ipcRenderer.invoke('floyd:load-project', id),
  deleteProject: (id: string) => ipcRenderer.invoke('floyd:delete-project', id),

  // Files
  listFiles: (path: string) => ipcRenderer.invoke('floyd:list-files', path),

  // Tools (enhanced)
  getToolsByServer: () => ipcRenderer.invoke('floyd:get-tools-by-server'),

  // Extension
  getExtensionStatus: () => ipcRenderer.invoke('floyd:get-extension-status'),
  listBrowserTabs: () => ipcRenderer.invoke('floyd:list-browser-tabs'),

  // Sub-agents (Browork)
  spawnSubAgent: (type: string, task: string) =>
    ipcRenderer.invoke('floyd:spawn-subagent', type, task),
  listSubAgents: () => ipcRenderer.invoke('floyd:list-subagents'),
  cancelSubAgent: (id: string) => ipcRenderer.invoke('floyd:cancel-subagent', id),
};

// Expose the API to the renderer process
contextBridge.exposeInMainWorld('floydAPI', API);

// Type declarations for the renderer process
declare global {
  interface Window {
    floydAPI: FloydAPI;
  }
}

export type {};
