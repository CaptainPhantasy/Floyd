export interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: number;
}

export interface Session {
  id: string;
  title: string;
  customTitle?: string;  // User-defined custom title
  created: number;
  updated: number;
  messages: Message[];
  messageCount?: number;
  pinned?: boolean;       // Phase 1, Task 1.4
  folder?: string;        // Phase 3, Task 3.2 - Folder assignment
  archived?: boolean;     // Phase 3, Task 3.3
}

export interface Settings {
  model: string;
  hasApiKey: boolean;
  apiKeyPreview: string | null;
  systemPrompt?: string;
  maxTokens?: number;
}
