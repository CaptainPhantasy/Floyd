/**
 * FloydDesktop - Global Type Declarations
 *
 * Extends the Window interface with the floydAPI exposed by the preload script.
 */

import type {
  AgentStatus,
  SessionData,
  StreamChunk,
  Tool,
  Project,
  ExtensionFallbackStatus,
  FileNode,
  SubAgent,
  BrowserTab,
} from '../types';

declare global {
  interface Window {
    floydAPI: {
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
      setSetting: (key: string, value: unknown) => Promise<{ success: boolean; error?: string }>;
      selectWorkingDirectory: () => Promise<string | null>;
      openSettings: () => void;
      closeSettings: () => void;
      onSettingsClose: (callback: () => void) => void;
      removeSettingsCloseListener: () => void;

      // Extension fallback
      enableExtensionFallback?: () => Promise<boolean>;
      disableExtensionFallback?: () => Promise<{ success: boolean }>;
      getExtensionFallbackStatus?: () => Promise<ExtensionFallbackStatus>;
      onExtensionFallbackStatusChange?: (callback: (status: ExtensionFallbackStatus) => void) => void;
      removeExtensionFallbackStatusListener?: () => void;

      // Projects
      createProject?: (options: { name: string; path: string }) => Promise<{ success: boolean; project?: Project; error?: string }>;
      listProjects?: () => Promise<{ success: boolean; projects?: Project[]; error?: string }>;
      loadProject?: (id: string) => Promise<{ success: boolean; project?: Project; error?: string }>;
      deleteProject?: (id: string) => Promise<{ success: boolean; error?: string }>;

      // Files
      listFiles?: (path: string) => Promise<{ success: boolean; files?: FileNode[]; error?: string }>;

      // Tools (enhanced)
      getToolsByServer?: () => Promise<{ success: boolean; toolGroups?: unknown[]; error?: string }>;

      // Extension
      getExtensionStatus?: () => Promise<ExtensionFallbackStatus>;
      listBrowserTabs?: () => Promise<{ success: boolean; tabs?: BrowserTab[] }>;

      // Sub-agents (Browork)
      spawnSubAgent?: (type: string, task: string) => Promise<{ success: boolean; subAgent?: SubAgent; error?: string }>;
      listSubAgents?: () => Promise<{ success: boolean; subAgents?: SubAgent[] }>;
      cancelSubAgent?: (id: string) => Promise<{ success: boolean; error?: string }>;
    };
  }
}

export {};
