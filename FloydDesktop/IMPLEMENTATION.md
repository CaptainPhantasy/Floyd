# FloydDesktop Implementation Guide

**Step-by-step implementation of the Floyd Desktop application**

---

## Table of Contents

1. [Phase 1: Project Setup](#phase-1-project-setup)
2. [Phase 2: Go Agent Server](#phase-2-go-agent-server)
3. [Phase 3: Electron Main Process](#phase-3-electron-main-process)
4. [Phase 4: React UI Components](#phase-4-react-ui-components)
5. [Phase 5: WebSocket Client](#phase-5-websocket-client)
6. [Phase 6: Session Persistence](#phase-6-session-persistence)
7. [Phase 7: Chrome Extension Integration](#phase-7-chrome-extension-integration)

---

## Phase 1: Project Setup

### 1.1 Initialize the Project

```bash
cd /Volumes/Storage/FLOYD_CLI/FloydDesktop
npm init -y
```

### 1.2 Install Dependencies

```bash
# Core dependencies
npm install electron@latest vite@latest electron-builder@latest

# React and UI
npm install react@latest react-dom@latest

# TypeScript
npm install -D typescript@latest @types/react@latest @types/react-dom@latest

# Vite plugins
npm install -D vite-plugin-electron vite-plugin-electron-renderer

# UI libraries
npm install @radix-ui/react-dialog @radix-ui/react-dropdown-menu
npm install @radix-ui/react-scroll-area @radix-ui/react-separator
npm install @radix-ui/react-tabs @radix-ui/react-toast
npm install class-variance-authority clsx tailwind-merge

# Syntax highlighting
npm install react-syntax-highlighter

# SQLite
npm install better-sqlite3

# WebSocket
npm install ws @types/ws
```

### 1.3 Create Configuration Files

**package.json:**

```json
{
  "name": "floyd-desktop",
  "version": "0.1.0",
  "description": "Floyd Desktop - GUI for the Floyd Agent Ecosystem",
  "main": "dist-electron/main.js",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "package": "electron-builder"
  },
  "dependencies": {
    "@radix-ui/react-dialog": "^1.1.4",
    "@radix-ui/react-dropdown-menu": "^2.1.4",
    "@radix-ui/react-scroll-area": "^1.2.2",
    "@radix-ui/react-separator": "^1.1.1",
    "@radix-ui/react-tabs": "^1.1.2",
    "@radix-ui/react-toast": "^1.2.4",
    "better-sqlite3": "^11.7.0",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-syntax-highlighter": "^15.6.1",
    "tailwind-merge": "^2.6.0",
    "ws": "^8.18.0"
  },
  "devDependencies": {
    "@types/better-sqlite3": "^7.6.12",
    "@types/node": "^22.10.6",
    "@types/react": "^18.3.17",
    "@types/react-dom": "^18.3.5",
    "@types/react-syntax-highlighter": "^15.5.13",
    "@types/ws": "^8.5.13",
    "autoprefixer": "^10.4.20",
    "electron": "^34.0.0",
    "electron-builder": "^25.1.8",
    "postcss": "^8.4.49",
    "tailwindcss": "^3.4.17",
    "typescript": "^5.8.3",
    "vite": "^6.3.5",
    "vite-plugin-electron": "^0.29.0",
    "vite-plugin-electron-renderer": "^0.14.6"
  }
}
```

**tsconfig.json:**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "useDefineForClassFields": true,
    "lib": ["ES2023", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@electron/*": ["electron/*"]
    }
  },
  "include": ["src", "electron"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

**tsconfig.node.json:**

```json
{
  "compilerOptions": {
    "composite": true,
    "skipLibCheck": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true,
    "strict": true
  },
  "include": ["vite.config.ts", "electron.vite.config.ts"]
}
```

**vite.config.ts:**

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@electron': path.resolve(__dirname, './electron'),
    },
  },
  server: {
    port: 5173,
  },
  build: {
    outDir: 'dist-renderer',
    emptyOutDir: true,
  },
});
```

**electron.vite.config.ts:**

```typescript
import { defineConfig } from 'vite';
import electron from 'vite-plugin-electron';

export default defineConfig({
  plugins: [
    electron([
      {
        entry: 'electron/main.ts',
        onstart(options) {
          options.reload();
        },
        vite: {
          build: {
            outDir: 'dist-electron',
            emptyOutDir: true,
          },
        },
      },
      {
        entry: 'electron/preload.ts',
        onstart(options) {
          options.reload();
        },
        vite: {
          build: {
            outDir: 'dist-electron',
            emptyOutDir: true,
          },
        },
      },
    ]),
  ],
});
```

**tailwind.config.js:**

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        floyd: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
      },
    },
  },
  plugins: [],
}
```

**postcss.config.js:**

```javascript
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

### 1.4 Create Directory Structure

```bash
mkdir -p electron/ipc
mkdir -p src/components
mkdir -p src/hooks
mkdir -p src/api
mkdir -p src/store
mkdir -p src/lib
mkdir -p src/styles
mkdir -p shared
```

---

## Phase 2: Go Agent Server

### 2.1 Create Server Entry Point

**File:** `/Volumes/Storage/FLOYD_CLI/cmd/floyd-server/main.go`

```go
package main

import (
    "fmt"
    "log"
    "net/http"

    "github.com/Nomadcxx/sysc-Go/agent"
    "github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
    CheckOrigin: func(r *http.Request) bool {
        return true // Allow localhost connections
    },
}

type Server struct {
    agentClient agent.GLMClient
    orchestrator *agent.Orchestrator
}

func NewServer() *Server {
    client := agent.NewProxyClient("", "")
    return &Server{
        agentClient: client,
        orchestrator: agent.NewOrchestrator(client),
    }
}

func (s *Server) handleWebSocket(w http.ResponseWriter, r *http.Request) {
    conn, err := upgrader.Upgrade(w, r, nil)
    if err != nil {
        log.Printf("WebSocket upgrade error: %v", err)
        return
    }
    defer conn.Close()

    log.Printf("Client connected from %s", r.RemoteAddr)

    // Create session for this connection
    session := agent.NewSession(s.agentClient, s.orchestrator)

    // Handle messages
    for {
        var req JSONRPCRequest
        err := conn.ReadJSON(&req)
        if err != nil {
            log.Printf("Read error: %v", err)
            break
        }

        // Process request
        s.handleRequest(conn, session, req)
    }
}

func (s *Server) handleRequest(conn *websocket.Conn, session *agent.Session, req JSONRPCRequest) {
    switch req.Method {
    case "agent/chat":
        s.handleChat(conn, session, req)
    case "agent/listTools":
        s.handleListTools(conn, session, req)
    case "agent/callTool":
        s.handleCallTool(conn, session, req)
    case "agent/status":
        s.handleStatus(conn, session, req)
    case "orchestrator/spawn":
        s.handleSpawn(conn, session, req)
    case "orchestrator/list":
        s.handleListSubAgents(conn, session, req)
    default:
        conn.WriteJSON(JSONRPCError{
            JSONRPC: "2.0",
            ID:      req.ID,
            Error: map[string]any{
                "code":    -32601,
                "message": "Method not found",
            },
        })
    }
}

func (s *Server) handleChat(conn *websocket.Conn, session *agent.Session, req JSONRPCRequest) {
    var params struct {
        Message string                 `json:"message"`
        Stream  bool                   `json:"stream"`
        Context map[string]any         `json:"context,omitempty"`
    }

    if err := mapstructure.Decode(req.Params, &params); err != nil {
        conn.WriteJSON(JSONRPCError{
            JSONRPC: "2.0",
            ID:      req.ID,
            Error:   map[string]any{"code": -32602, "message": "Invalid params"},
        })
        return
    }

    // Send initial response
    conn.WriteJSON(JSONRPCResponse{
        JSONRPC: "2.0",
        ID:      req.ID,
        Result:  map[string]any{"status": "started"},
    })

    // Stream response
    if params.Stream {
        chunks := session.SendMessageStream(params.Message, params.Context)
        for chunk := range chunks {
            conn.WriteJSON(JSONRPCNotification{
                JSONRPC: "2.0",
                Method:  "stream/chunk",
                Params:  chunk,
            })
        }
    } else {
        response := session.SendMessage(params.Message, params.Context)
        conn.WriteJSON(JSONRPCNotification{
            JSONRPC: "2.0",
            Method:  "stream/chunk",
            Params:  map[string]any{
                "token": response,
                "done":  true,
            },
        })
    }
}

func (s *Server) handleListTools(conn *websocket.Conn, session *agent.Session, req JSONRPCRequest) {
    tools := session.ListTools()
    conn.WriteJSON(JSONRPCResponse{
        JSONRPC: "2.0",
        ID:      req.ID,
        Result:  tools,
    })
}

func (s *Server) handleCallTool(conn *websocket.Conn, session *agent.Session, req JSONRPCRequest) {
    var params struct {
        Name string                 `json:"name"`
        Args map[string]any         `json:"args"`
    }

    if err := mapstructure.Decode(req.Params, &params); err != nil {
        conn.WriteJSON(JSONRPCError{
            JSONRPC: "2.0",
            ID:      req.ID,
            Error:   map[string]any{"code": -32602, "message": "Invalid params"},
        })
        return
    }

    result, err := session.CallTool(params.Name, params.Args)

    if err != nil {
        conn.WriteJSON(JSONRPCError{
            JSONRPC: "2.0",
            ID:      req.ID,
            Error:   map[string]any{"code": -1, "message": err.Error()},
        })
        return
    }

    conn.WriteJSON(JSONRPCResponse{
        JSONRPC: "2.0",
        ID:      req.ID,
        Result:  map[string]any{"output": result},
    })
}

func main() {
    server := NewServer()

    http.HandleFunc("/ws", server.handleWebSocket)

    // Serve static files for Electron app
    fs := http.FileServer(http.Dir("./dist-renderer"))
    http.Handle("/", fs)

    port := ":8080"
    log.Printf("Floyd Agent Server starting on %s", port)
    log.Fatal(http.ListenAndServe(port, nil))
}

// JSON-RPC types

type JSONRPCRequest struct {
    JSONRPC string         `json:"jsonrpc"`
    ID      interface{}    `json:"id"`
    Method  string         `json:"method"`
    Params  map[string]any `json:"params,omitempty"`
}

type JSONRPCResponse struct {
    JSONRPC string      `json:"jsonrpc"`
    ID      interface{} `json:"id"`
    Result  any         `json:"result,omitempty"`
}

type JSONRPCNotification struct {
    JSONRPC string `json:"jsonrpc"`
    Method  string `json:"method"`
    Params  any    `json:"params"`
}

type JSONRPCError struct {
    JSONRPC string      `json:"jsonrpc"`
    ID      interface{} `json:"id"`
    Error   any         `json:"error"`
}
```

### 2.2 Create Session Handler

**File:** `/Volumes/Storage/FLOYD_CLI/agent/session.go`

```go
package agent

import (
    "context"
    "sync"

    "github.com/Nomadcxx/sysc-Go/agent/tools"
)

type Session struct {
    client       GLMClient
    orchestrator *Orchestrator
    mu           sync.RWMutex
    ctx          context.Context
    cancel       context.CancelFunc

    // Session state
    messages     []Message
    tools        tools.Registry
}

func NewSession(client GLMClient, orchestrator *Orchestrator) *Session {
    ctx, cancel := context.WithCancel(context.Background())
    return &Session{
        client:       client,
        orchestrator: orchestrator,
        ctx:          ctx,
        cancel:       cancel,
        messages:     make([]Message, 0),
        tools:        tools.GetDefaultRegistry(),
    }
}

func (s *Session) SendMessageStream(message string, context map[string]any) <-chan StreamChunk {
    s.mu.Lock()
    defer s.mu.Unlock()

    // Add user message
    s.messages = append(s.messages, Message{
        Role:    "user",
        Content: message,
    })

    // Get available tools
    availableTools := s.tools.List()

    // Build request
    req := ChatRequest{
        Messages:  s.messages,
        MaxTokens: 8192,
        Stream:    true,
        Tools:     availableTools,
    }

    // Start streaming
    chunks := make(chan StreamChunk, 10)

    go func() {
        defer close(chunks)

        stream, err := s.client.StreamChat(s.ctx, req)
        if err != nil {
            chunks <- StreamChunk{Error: err}
            return
        }

        var fullResponse strings.Builder
        var currentToolCall *ToolCall

        for chunk := range stream {
            chunks <- chunk

            if chunk.ToolCall != nil {
                currentToolCall = chunk.ToolCall
            }

            if chunk.ToolUseComplete && currentToolCall != nil {
                // Execute tool
                result := s.executeTool(currentToolCall)
                // Add tool result to messages
                s.messages = append(s.messages, Message{
                    Role:    "user",
                    Content: result,
                })
                currentToolCall = nil
            }

            if chunk.Token != "" {
                fullResponse.WriteString(chunk.Token)
            }

            if chunk.Done {
                // Add assistant response
                s.messages = append(s.messages, Message{
                    Role:    "assistant",
                    Content: fullResponse.String(),
                })
            }
        }
    }()

    return chunks
}

func (s *Session) SendMessage(message string, context map[string]any) string {
    // Non-streaming version - wait for complete response
    chunks := s.SendMessageStream(message, context)

    var builder strings.Builder
    for chunk := range chunks {
        if chunk.Error != nil {
            return chunk.Error.Error()
        }
        if chunk.Token != "" {
            builder.WriteString(chunk.Token)
        }
    }

    return builder.String()
}

func (s *Session) ListTools() []Tool {
    return s.tools.List()
}

func (s *Session) CallTool(name string, args map[string]any) (string, error) {
    return s.tools.Call(s.ctx, name, args)
}

func (s *Session) executeTool(call *ToolCall) string {
    result, err := s.tools.Call(s.ctx, call.Name, call.InputMap)
    if err != nil {
        return fmt.Sprintf("Error: %s", err.Error())
    }
    return result
}

func (s *Session) Close() {
    s.cancel()
}
```

---

## Phase 3: Electron Main Process

### 3.1 Main Entry Point

**File:** `electron/main.ts`

```typescript
import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import { AgentServer } from './ipc/agent-server';
import { DatabaseManager } from './ipc/database';
import { registerIPCHandlers } from './ipc/handlers';

let mainWindow: BrowserWindow | null = null;
let agentServer: AgentServer | null = null;
let dbManager: DatabaseManager | null = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1000,
    minHeight: 600,
    titleBarStyle: 'hiddenInset',
    backgroundColor: '#0f172a',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      webSecurity: false, // For local WebSocket development
    },
  });

  // Load renderer
  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist-renderer/index.html'));
  }
}

app.whenReady().then(() => {
  // Initialize managers
  dbManager = new DatabaseManager();
  agentServer = new AgentServer();

  // Register IPC handlers
  registerIPCHandlers(mainWindow, agentServer, dbManager);

  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', () => {
  // Cleanup
  agentServer?.disconnect();
  dbManager?.close();
});
```

### 3.2 Preload Script

**File:** `electron/preload.ts`

```typescript
import { contextBridge, ipcRenderer } from 'electron';

const API = {
  // Agent communication
  sendMessage: (message: string) => ipcRenderer.invoke('floyd:send-message', message),
  sendStreamedMessage: (message: string) => {
    const channel = `floyd:stream:${Date.now()}`;
    ipcRenderer.send('floyd:send-streamed', message, channel);
    return channel;
  },
  onStreamChunk: (callback: (chunk: StreamChunk) => void) => {
    ipcRenderer.on('floyd:stream-chunk', (_, chunk) => callback(chunk));
  },
  removeStreamListener: () => {
    ipcRenderer.removeAllListeners('floyd:stream-chunk');
  },

  // Tools
  listTools: () => ipcRenderer.invoke('floyd:list-tools'),
  callTool: (name: string, args: any) => ipcRenderer.invoke('floyd:call-tool', name, args),

  // Sessions
  listSessions: () => ipcRenderer.invoke('floyd:list-sessions'),
  loadSession: (id: string) => ipcRenderer.invoke('floyd:load-session', id),
  saveSession: (session: SessionData) => ipcRenderer.invoke('floyd:save-session', session),
  deleteSession: (id: string) => ipcRenderer.invoke('floyd:delete-session', id),

  // Agent status
  getAgentStatus: () => ipcRenderer.invoke('floyd:agent-status'),

  // Settings
  getSettings: () => ipcRenderer.invoke('floyd:get-settings'),
  setSetting: (key: string, value: any) => ipcRenderer.invoke('floyd:set-setting', key, value),
};

contextBridge.exposeInMainWorld('floydAPI', API);

export type {};
```

### 3.3 IPC Handlers

**File:** `electron/ipc/handlers.ts`

```typescript
import { ipcMain, BrowserWindow } from 'electron';
import { AgentServer } from './agent-server';
import { DatabaseManager } from './database';

export function registerIPCHandlers(
  mainWindow: BrowserWindow | null,
  agentServer: AgentServer | null,
  dbManager: DatabaseManager | null
) {
  // Message handlers
  ipcMain.handle('floyd:send-message', async (_, message: string) => {
    if (!agentServer) throw new Error('Agent server not initialized');
    return agentServer.sendMessage(message);
  });

  ipcMain.on('floyd:send-streamed', async (_, message: string, channel: string) => {
    if (!agentServer || !mainWindow) return;

    for await (const chunk of agentServer.streamMessage(message)) {
      mainWindow.webContents.send('floyd:stream-chunk', chunk);
    }
  });

  // Tool handlers
  ipcMain.handle('floyd:list-tools', async () => {
    if (!agentServer) throw new Error('Agent server not initialized');
    return agentServer.listTools();
  });

  ipcMain.handle('floyd:call-tool', async (_, name: string, args: any) => {
    if (!agentServer) throw new Error('Agent server not initialized');
    return agentServer.callTool(name, args);
  });

  // Session handlers
  ipcMain.handle('floyd:list-sessions', async () => {
    if (!dbManager) throw new Error('Database not initialized');
    return dbManager.listSessions();
  });

  ipcMain.handle('floyd:load-session', async (_, id: string) => {
    if (!dbManager) throw new Error('Database not initialized');
    return dbManager.loadSession(id);
  });

  ipcMain.handle('floyd:save-session', async (_, session: SessionData) => {
    if (!dbManager) throw new Error('Database not initialized');
    return dbManager.saveSession(session);
  });

  ipcMain.handle('floyd:delete-session', async (_, id: string) => {
    if (!dbManager) throw new Error('Database not initialized');
    return dbManager.deleteSession(id);
  });

  // Status handler
  ipcMain.handle('floyd:agent-status', async () => {
    if (!agentServer) throw new Error('Agent server not initialized');
    return agentServer.getStatus();
  });

  // Settings handlers
  ipcMain.handle('floyd:get-settings', async () => {
    if (!dbManager) throw new Error('Database not initialized');
    return dbManager.getSettings();
  });

  ipcMain.handle('floyd:set-setting', async (_, key: string, value: any) => {
    if (!dbManager) throw new Error('Database not initialized');
    return dbManager.setSetting(key, value);
  });
}
```

### 3.4 Agent Server Client

**File:** `electron/ipc/agent-server.ts`

```typescript
import WebSocket from 'ws';

interface StreamChunk {
  token: string;
  done: boolean;
  tool_call?: ToolCall | null;
  tool_use_complete?: boolean;
  stop_reason?: string;
  error?: Error;
  usage?: UsageInfo;
}

interface ToolCall {
  id?: string;
  name: string;
  input?: string;
  arguments?: string;
  input_map?: Record<string, any>;
}

interface UsageInfo {
  input_tokens: number;
  output_tokens: number;
}

interface Tool {
  name: string;
  description: string;
  input_schema: Record<string, any>;
}

interface JSONRPCRequest {
  jsonrpc: string;
  id: number;
  method: string;
  params?: Record<string, any>;
}

interface JSONRPCResponse {
  jsonrpc: string;
  id: number;
  result?: any;
}

interface JSONRPCNotification {
  jsonrpc: string;
  method: string;
  params: any;
}

export class AgentServer {
  private ws: WebSocket | null = null;
  private messageId = 0;
  private connected = false;
  private url = 'ws://localhost:8080/ws';

  async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(this.url);

      this.ws.on('open', () => {
        this.connected = true;
        resolve();
      });

      this.ws.on('error', (err) => {
        reject(err);
      });

      this.ws.on('close', () => {
        this.connected = false;
      });
    });
  }

  private sendRequest(method: string, params?: Record<string, any>): Promise<any> {
    if (!this.ws || !this.connected) {
      throw new Error('Not connected to agent server');
    }

    const id = ++this.messageId;
    const request: JSONRPCRequest = {
      jsonrpc: '2.0',
      id,
      method,
      params,
    };

    this.ws.send(JSON.stringify(request));

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Request timeout'));
      }, 30000);

      const messageHandler = (data: Buffer) => {
        const response: JSONRPCResponse = JSON.parse(data.toString());

        if (response.id === id) {
          clearTimeout(timeout);
          this.ws?.off('message', messageHandler);
          resolve(response.result);
        }
      };

      this.ws?.on('message', messageHandler);
    });
  }

  async sendMessage(message: string): Promise<string> {
    const result = await this.sendRequest('agent/chat', {
      message,
      stream: false,
    });
    return result.response || '';
  }

  async *streamMessage(message: string): AsyncGenerator<StreamChunk, void, unknown> {
    if (!this.ws || !this.connected) {
      throw new Error('Not connected to agent server');
    }

    const id = ++this.messageId;
    const request: JSONRPCRequest = {
      jsonrpc: '2.0',
      id,
      method: 'agent/chat',
      params: {
        message,
        stream: true,
      },
    };

    this.ws.send(JSON.stringify(request));

    // Listen for streaming chunks
    for await (const chunk of this.waitForChunks(id)) {
      yield chunk;
      if (chunk.done) break;
    }
  }

  private async *waitForChunks(requestId: number): AsyncGenerator<StreamChunk> {
    if (!this.ws) return;

    let completed = false;

    while (!completed) {
      const data = await this.waitForMessage();
      const notification: JSONRPCNotification = JSON.parse(data.toString());

      if (notification.method === 'stream/chunk') {
        const chunk: StreamChunk = notification.params;
        yield chunk;
        completed = chunk.done || chunk.error !== undefined;
      }
    }
  }

  private waitForMessage(): Promise<Buffer> {
    return new Promise((resolve) => {
      this.ws?.once('message', resolve);
    });
  }

  async listTools(): Promise<Tool[]> {
    return this.sendRequest('agent/listTools');
  }

  async callTool(name: string, args: Record<string, any>): Promise<string> {
    const result = await this.sendRequest('agent/callTool', { name, args });
    return result.output || '';
  }

  async getStatus(): Promise<AgentStatus> {
    return this.sendRequest('agent/status');
  }

  disconnect(): void {
    this.ws?.close();
    this.connected = false;
  }

  isConnected(): boolean {
    return this.connected;
  }
}

interface AgentStatus {
  connected: boolean;
  model: string;
  sub_agents?: SubAgentStatus[];
}

interface SubAgentStatus {
  id: string;
  type: string;
  task: string;
  status: string;
}
```

### 3.5 Database Manager

**File:** `electron/ipc/database.ts`

```typescript
import Database from 'better-sqlite3';
import path from 'path';
import { app } from 'electron';
import fs from 'fs';

export interface SessionData {
  id: string;
  created: number;
  updated: number;
  title: string;
  working_dir: string;
  messages: Message[];
}

export interface Message {
  role: 'user' | 'assistant';
  content: string;
  tool_calls?: ToolCall[];
  timestamp?: number;
}

export interface ToolCall {
  id: string;
  name: string;
  input: Record<string, any>;
  output?: string;
}

export class DatabaseManager {
  private db: Database.Database | null = null;

  constructor() {
    this.initialize();
  }

  private initialize() {
    const userDataPath = app.getPath('userData');
    const dbDir = path.join(userDataPath, 'Floyd');

    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }

    const dbPath = path.join(dbDir, 'floyd.db');
    this.db = new Database(dbPath);

    // Enable WAL mode
    this.db.pragma('journal_mode = WAL');

    // Create tables
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS sessions (
        id TEXT PRIMARY KEY,
        created INTEGER NOT NULL,
        updated INTEGER NOT NULL,
        title TEXT NOT NULL,
        working_dir TEXT
      );

      CREATE TABLE IF NOT EXISTS messages (
        id TEXT PRIMARY KEY,
        session_id TEXT NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
        role TEXT NOT NULL,
        content TEXT NOT NULL,
        tool_calls TEXT,
        timestamp INTEGER NOT NULL
      );

      CREATE INDEX IF NOT EXISTS idx_messages_session ON messages(session_id);

      CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
      );
    `);
  }

  listSessions(): SessionData[] {
    const stmt = this.db!.prepare(`
      SELECT s.id, s.created, s.updated, s.title, s.working_dir,
             GROUP_CONCAT(m.role, '|') as roles,
             GROUP_CONCAT(m.content, '||||') as contents,
             GROUP_CONCAT(m.tool_calls, '||||') as tool_calls_list
      FROM sessions s
      LEFT JOIN messages m ON s.id = m.session_id
      GROUP BY s.id
      ORDER BY s.updated DESC
    `);

    const rows = stmt.all() as any[];
    return rows.map(row => this.parseSessionRow(row));
  }

  loadSession(id: string): SessionData | null {
    const stmt = this.db!.prepare(`
      SELECT s.id, s.created, s.updated, s.title, s.working_dir,
             GROUP_CONCAT(m.role, '|') as roles,
             GROUP_CONCAT(m.content, '||||') as contents,
             GROUP_CONCAT(m.tool_calls, '||||') as tool_calls_list
      FROM sessions s
      LEFT JOIN messages m ON s.id = m.session_id
      WHERE s.id = ?
      GROUP BY s.id
    `);

    const row = stmt.get(id) as any;
    if (!row) return null;

    return this.parseSessionRow(row);
  }

  saveSession(session: SessionData): void {
    const transaction = this.db!.transaction(() => {
      // Upsert session
      this.db!.prepare(`
        INSERT OR REPLACE INTO sessions (id, created, updated, title, working_dir)
        VALUES (?, ?, ?, ?, ?)
      `).run(session.id, session.created, session.updated, session.title, session.working_dir);

      // Delete existing messages
      this.db!.prepare('DELETE FROM messages WHERE session_id = ?').run(session.id);

      // Insert messages
      const insertMsg = this.db!.prepare(`
        INSERT INTO messages (id, session_id, role, content, tool_calls, timestamp)
        VALUES (?, ?, ?, ?, ?, ?)
      `);

      for (const msg of session.messages) {
        const msgId = `${session.id}-${msg.timestamp || Date.now()}-${Math.random()}`;
        insertMsg.run(
          msgId,
          session.id,
          msg.role,
          msg.content,
          msg.tool_calls ? JSON.stringify(msg.tool_calls) : null,
          msg.timestamp || Date.now()
        );
      }
    });

    transaction();
  }

  deleteSession(id: string): void {
    this.db!.prepare('DELETE FROM sessions WHERE id = ?').run(id);
  }

  getSettings(): Record<string, any> {
    const rows = this.db!.prepare('SELECT key, value FROM settings').all() as any[];
    const settings: Record<string, any> = {};

    for (const row of rows) {
      try {
        settings[row.key] = JSON.parse(row.value);
      } catch {
        settings[row.key] = row.value;
      }
    }

    return settings;
  }

  setSetting(key: string, value: any): void {
    this.db!.prepare(`
      INSERT OR REPLACE INTO settings (key, value)
      VALUES (?, ?)
    `).run(key, JSON.stringify(value));
  }

  private parseSessionRow(row: any): SessionData {
    const messages: Message[] = [];

    if (row.roles) {
      const roles = row.roles.split('|');
      const contents = row.contents.split('||||');
      const toolCalls = row.tool_calls_list ? row.tool_calls_list.split('||||') : [];

      for (let i = 0; i < roles.length; i++) {
        messages.push({
          role: roles[i],
          content: contents[i] || '',
          tool_calls: toolCalls[i] ? JSON.parse(toolCalls[i]) : undefined,
        });
      }
    }

    return {
      id: row.id,
      created: row.created,
      updated: row.updated,
      title: row.title,
      working_dir: row.working_dir || '',
      messages,
    };
  }

  close(): void {
    this.db?.close();
  }
}
```

---

## Phase 4: React UI Components

### 4.1 Main Entry Point

**File:** `src/main.tsx`

```typescript
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/globals.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

**File:** `src/styles/globals.css`

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --color-bg: #0f172a;
  --color-bg-secondary: #1e293b;
  --color-text: #f1f5f9;
  --color-text-secondary: #94a3b8;
  --color-accent: #38bdf8;
  --color-accent-hover: #0ea5e9;
  --color-border: #334155;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  background: var(--color-bg);
  color: var(--color-text);
  overflow: hidden;
}

::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: var(--color-border);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #475569;
}
```

### 4.2 App Component

**File:** `src/App.tsx`

```typescript
import React, { useState, useEffect } from 'react';
import { ChatPanel } from './components/ChatPanel';
import { Sidebar } from './components/Sidebar';
import { StatusPanel } from './components/StatusPanel';
import { useAgentStream } from './hooks/useAgentStream';
import { useSessions } from './hooks/useSessions';
import type { SessionData, Message } from './types';

function App() {
  const [currentSession, setCurrentSession] = useState<SessionData | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const {
    messages,
    isLoading,
    sendMessage,
    activeToolCalls,
    agentStatus,
  } = useAgentStream(currentSession);

  const {
    sessions,
    createSession,
    loadSession,
    deleteSession,
  } = useSessions();

  useEffect(() => {
    // Load last session on startup
    loadSessions();
  }, []);

  const loadSessions = async () => {
    const sessionList = await window.floydAPI.listSessions();
    if (sessionList.length > 0) {
      setCurrentSession(sessionList[0]);
    }
  };

  const handleNewChat = async () => {
    const newSession = await createSession();
    setCurrentSession(newSession);
  };

  const handleSelectSession = async (id: string) => {
    const session = await loadSession(id);
    if (session) {
      setCurrentSession(session);
    }
  };

  return (
    <div className="flex h-screen bg-slate-900 text-slate-100">
      {/* Sidebar */}
      {sidebarOpen && (
        <Sidebar
          sessions={sessions}
          currentSessionId={currentSession?.id}
          onNewChat={handleNewChat}
          onSelectSession={handleSelectSession}
          onDeleteSession={deleteSession}
          onClose={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="flex items-center justify-between px-4 py-3 border-b border-slate-700">
          <div className="flex items-center gap-3">
            {!sidebarOpen && (
              <button
                onClick={() => setSidebarOpen(true)}
                className="p-2 hover:bg-slate-700 rounded-lg"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            )}
            <h1 className="text-xl font-semibold bg-gradient-to-r from-sky-400 to-blue-500 bg-clip-text text-transparent">
              Floyd
            </h1>
            {currentSession && (
              <span className="text-sm text-slate-400 ml-2">
                {currentSession.title}
              </span>
            )}
          </div>
          <StatusPanel status={agentStatus} />
        </header>

        {/* Chat Panel */}
        <ChatPanel
          messages={messages}
          isLoading={isLoading}
          activeToolCalls={activeToolCalls}
          onSendMessage={sendMessage}
        />
      </div>
    </div>
  );
}

export default App;
```

### 4.3 Chat Panel Component

**File:** `src/components/ChatPanel.tsx`

```typescript
import React, { useRef, useEffect } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import type { Message, ToolCall } from '../types';
import { ToolCallCard } from './ToolCallCard';
import { cn } from '../lib/utils';

interface ChatPanelProps {
  messages: Message[];
  isLoading: boolean;
  activeToolCalls: ToolCall[];
  onSendMessage: (message: string) => void;
}

export function ChatPanel({ messages, isLoading, activeToolCalls, onSendMessage }: ChatPanelProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [input, setInput] = React.useState('');

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, activeToolCalls]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      onSendMessage(input.trim());
      setInput('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="flex-1 flex flex-col">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {messages.length === 0 && !isLoading && (
            <div className="text-center py-20">
              <h2 className="text-2xl font-semibold mb-2">Welcome to Floyd</h2>
              <p className="text-slate-400">Your local AI coding assistant</p>
            </div>
          )}

          {messages.map((message, index) => (
            <MessageBubble key={index} message={message} />
          ))}

          {activeToolCalls.map((toolCall) => (
            <ToolCallCard key={toolCall.id} toolCall={toolCall} />
          ))}

          {isLoading && messages.length === 0 && (
            <div className="flex items-center gap-2 text-slate-400">
              <div className="w-2 h-2 bg-sky-500 rounded-full animate-bounce" />
              <div className="w-2 h-2 bg-sky-500 rounded-full animate-bounce delay-100" />
              <div className="w-2 h-2 bg-sky-500 rounded-full animate-bounce delay-200" />
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="border-t border-slate-700 p-4">
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
          <div className="relative">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Send a message to Floyd..."
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
              rows={1}
              disabled={isLoading}
              style={{ minHeight: '48px', maxHeight: '200px' }}
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className={cn(
                'absolute right-2 bottom-2 p-2 rounded-lg transition-colors',
                isLoading || !input.trim()
                  ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                  : 'bg-sky-500 text-white hover:bg-sky-600'
              )}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

interface MessageBubbleProps {
  message: Message;
}

function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === 'user';

  return (
    <div className={cn('flex', isUser ? 'justify-end' : 'justify-start')}>
      <div
        className={cn(
          'max-w-3xl rounded-2xl px-4 py-3',
          isUser
            ? 'bg-sky-600 text-white'
            : 'bg-slate-800 text-slate-100'
        )}
      >
        <MessageContent content={message.content} isUser={isUser} />
      </div>
    </div>
  );
}

interface MessageContentProps {
  content: string;
  isUser: boolean;
}

function MessageContent({ content, isUser }: MessageContentProps) {
  // Simple markdown-like parsing
  const parts = parseContent(content);

  return (
    <div className="space-y-2">
      {parts.map((part, index) => {
        if (part.type === 'code') {
          return (
            <div key={index} className="rounded-lg overflow-hidden">
              <SyntaxHighlighter
                language={part.lang || 'typescript'}
                style={vscDarkPlus}
                customStyle={{
                  margin: 0,
                  borderRadius: '8px',
                  fontSize: '14px',
                }}
              >
                {part.content}
              </SyntaxHighlighter>
            </div>
          );
        }

        if (part.type === 'heading') {
          const level = part.level || 1;
          const Tag = `h${level}` as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
          return (
            <Tag
              key={index}
              className={cn(
                'font-semibold',
                level === 1 && 'text-xl',
                level === 2 && 'text-lg',
                level === 3 && 'text-base'
              )}
            >
              {part.content}
            </Tag>
          );
        }

        return (
          <p key={index} className="whitespace-pre-wrap">
            {part.content}
          </p>
        );
      })}
    </div>
  );
}

interface ContentPart {
  type: 'text' | 'code' | 'heading';
  content: string;
  lang?: string;
  level?: number;
}

function parseContent(content: string): ContentPart[] {
  const parts: ContentPart[] = [];

  // Code blocks
  const codeRegex = /```(\w+)?\n([\s\S]*?)```/g;
  let lastIndex = 0;
  let match;

  while ((match = codeRegex.exec(content)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ type: 'text', content: content.slice(lastIndex, match.index) });
    }
    parts.push({ type: 'code', content: match[2].trim(), lang: match[1] });
    lastIndex = codeRegex.lastIndex;
  }

  if (lastIndex < content.length) {
    parts.push({ type: 'text', content: content.slice(lastIndex) });
  }

  // If no code blocks found, return whole content as text
  if (parts.length === 0) {
    return [{ type: 'text', content }];
  }

  return parts;
}
```

### 4.4 Sidebar Component

**File:** `src/components/Sidebar.tsx`

```typescript
import React from 'react';
import { cn } from '../lib/utils';
import type { SessionData } from '../types';

interface SidebarProps {
  sessions: SessionData[];
  currentSessionId?: string;
  onNewChat: () => void;
  onSelectSession: (id: string) => void;
  onDeleteSession: (id: string) => void;
  onClose: () => void;
}

export function Sidebar({
  sessions,
  currentSessionId,
  onNewChat,
  onSelectSession,
  onDeleteSession,
  onClose,
}: SidebarProps) {
  return (
    <div className="w-72 bg-slate-800 border-r border-slate-700 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700">
        <h2 className="font-semibold">Sessions</h2>
        <button
          onClick={onClose}
          className="p-1 hover:bg-slate-700 rounded"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
          </svg>
        </button>
      </div>

      {/* New Chat Button */}
      <div className="p-3">
        <button
          onClick={onNewChat}
          className="w-full px-4 py-2 bg-sky-600 hover:bg-sky-700 rounded-lg text-sm font-medium transition-colors"
        >
          New Chat
        </button>
      </div>

      {/* Session List */}
      <div className="flex-1 overflow-y-auto px-2 space-y-1">
        {sessions.map((session) => (
          <SessionItem
            key={session.id}
            session={session}
            isActive={session.id === currentSessionId}
            onClick={() => onSelectSession(session.id)}
            onDelete={() => onDeleteSession(session.id)}
          />
        ))}
      </div>
    </div>
  );
}

interface SessionItemProps {
  session: SessionData;
  isActive: boolean;
  onClick: () => void;
  onDelete: () => void;
}

function SessionItem({ session, isActive, onClick, onDelete }: SessionItemProps) {
  const [showDelete, setShowDelete] = React.useState(false);

  return (
    <div
      className={cn(
        'group relative rounded-lg px-3 py-2 cursor-pointer transition-colors',
        isActive
          ? 'bg-slate-700'
          : 'hover:bg-slate-700/50'
      )}
      onClick={onClick}
      onMouseEnter={() => setShowDelete(true)}
      onMouseLeave={() => setShowDelete(false)}
    >
      <div className="text-sm font-medium truncate">
        {session.title}
      </div>
      <div className="text-xs text-slate-400 mt-1">
        {new Date(session.updated).toLocaleDateString()}
      </div>

      {showDelete && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-red-600 rounded opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      )}
    </div>
  );
}
```

### 4.5 Status Panel Component

**File:** `src/components/StatusPanel.tsx`

```typescript
import React from 'react';
import { cn } from '../lib/utils';
import type { AgentStatus } from '../types';

interface StatusPanelProps {
  status: AgentStatus | null;
}

export function StatusPanel({ status }: StatusPanelProps) {
  return (
    <div className="flex items-center gap-4">
      {/* Connection Status */}
      <div className="flex items-center gap-2">
        <div
          className={cn(
            'w-2 h-2 rounded-full',
            status?.connected ? 'bg-green-500' : 'bg-red-500'
          )}
        />
        <span className="text-sm text-slate-400">
          {status?.connected ? 'Connected' : 'Disconnected'}
        </span>
      </div>

      {/* Model */}
      {status?.model && (
        <div className="text-sm text-slate-400">
          {status.model}
        </div>
      )}

      {/* Sub-agents */}
      {status?.sub_agents && status.sub_agents.length > 0 && (
        <div className="flex items-center gap-1">
          <span className="text-sm text-slate-400">
            {status.sub_agents.length} agent{status.sub_agents.length > 1 ? 's' : ''}
          </span>
        </div>
      )}
    </div>
  );
}
```

### 4.6 Tool Call Card Component

**File:** `src/components/ToolCallCard.tsx`

```typescript
import React, { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { ChevronDown, ChevronRight, Loader2 } from 'lucide-react';
import { cn } from '../lib/utils';
import type { ToolCall } from '../types';

interface ToolCallCardProps {
  toolCall: ToolCall;
}

export function ToolCallCard({ toolCall }: ToolCallCardProps) {
  const [expanded, setExpanded] = useState(false);
  const isRunning = !toolCall.output;

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-4 py-3 flex items-center gap-3 hover:bg-slate-700/50 transition-colors"
      >
        {expanded ? (
          <ChevronDown className="w-4 h-4 text-slate-400" />
        ) : (
          <ChevronRight className="w-4 h-4 text-slate-400" />
        )}

        {isRunning ? (
          <Loader2 className="w-4 h-4 text-sky-400 animate-spin" />
        ) : (
          <div className="w-4 h-4 rounded-full bg-green-500" />
        )}

        <span className="font-medium text-sky-400">{toolCall.name}</span>

        <span className="text-sm text-slate-400 ml-auto">
          {isRunning ? 'Running...' : 'Completed'}
        </span>
      </button>

      {expanded && (
        <div className="border-t border-slate-700 p-4 space-y-4">
          {/* Input */}
          <div>
            <div className="text-xs text-slate-400 uppercase mb-2">Input</div>
            <SyntaxHighlighter
              language="json"
              style={vscDarkPlus}
              customStyle={{ margin: 0, borderRadius: '8px', fontSize: '13px' }}
            >
              {JSON.stringify(toolCall.input, null, 2)}
            </SyntaxHighlighter>
          </div>

          {/* Output */}
          {toolCall.output && (
            <div>
              <div className="text-xs text-slate-400 uppercase mb-2">Output</div>
              <div className="bg-slate-900 rounded-lg p-3 text-sm font-mono whitespace-pre-wrap">
                {toolCall.output}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
```

---

## Phase 5: React Hooks

### 5.1 Agent Stream Hook

**File:** `src/hooks/useAgentStream.ts`

```typescript
import { useState, useCallback, useRef } from 'react';
import type { Message, ToolCall, AgentStatus } from '../types';

export function useAgentStream(session: SessionData | null) {
  const [messages, setMessages] = useState<Message[]>(session?.messages || []);
  const [isLoading, setIsLoading] = useState(false);
  const [activeToolCalls, setActiveToolCalls] = useState<ToolCall[]>([]);
  const [agentStatus, setAgentStatus] = useState<AgentStatus | null>(null);

  const streamingRef = useRef(false);

  const sendMessage = useCallback(async (content: string) => {
    if (streamingRef.current) return;

    // Add user message
    const userMessage: Message = {
      role: 'user',
      content,
      timestamp: Date.now(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);
    streamingRef.current = true;

    try {
      const channel = await window.floydAPI.sendStreamedMessage(content);

      // Listen for chunks
      const handleChunk = (chunk: StreamChunk) => {
        if (chunk.error) {
          setIsLoading(false);
          streamingRef.current = false;
          window.floydAPI.removeStreamListener();
          return;
        }

        // Handle tool calls
        if (chunk.tool_call) {
          setActiveToolCalls((prev) => {
            const existing = prev.findIndex((t) => t.id === chunk.tool_call?.id);
            if (existing >= 0) {
              const updated = [...prev];
              updated[existing] = {
                ...updated[existing],
                ...chunk.tool_call,
              };
              return updated;
            }
            return [...prev, chunk.tool_call as ToolCall];
          });
        }

        // Handle tool completion
        if (chunk.tool_use_complete) {
          setActiveToolCalls((prev) =>
            prev.map((t) => ({
              ...t,
              output: chunk.output || t.output,
            }))
          );
        }

        // Handle text tokens
        if (chunk.token) {
          setMessages((prev) => {
            const last = prev[prev.length - 1];
            if (last?.role === 'assistant' && !last.tool_calls?.length) {
              return [
                ...prev.slice(0, -1),
                { ...last, content: last.content + chunk.token },
              ];
            }
            return [
              ...prev,
              {
                role: 'assistant',
                content: chunk.token,
                timestamp: Date.now(),
              } as Message,
            ];
          });
        }

        // Handle completion
        if (chunk.done) {
          setIsLoading(false);
          streamingRef.current = false;

          // Move active tool calls to the last message
          if (activeToolCalls.length > 0) {
            setMessages((prev) => {
              const last = prev[prev.length - 1];
              if (last?.role === 'assistant') {
                return [
                  ...prev.slice(0, -1),
                  { ...last, tool_calls: [...activeToolCalls] },
                ];
              }
              return prev;
            });
            setActiveToolCalls([]);
          }

          window.floydAPI.removeStreamListener();
        }
      };

      window.floydAPI.onStreamChunk(handleChunk);
    } catch (error) {
      console.error('Error sending message:', error);
      setIsLoading(false);
      streamingRef.current = false;
    }
  }, [activeToolCalls]);

  return {
    messages,
    isLoading,
    activeToolCalls,
    agentStatus,
    sendMessage,
  };
}
```

### 5.2 Sessions Hook

**File:** `src/hooks/useSessions.ts`

```typescript
import { useState, useCallback } from 'react';
import type { SessionData } from '../types';

export function useSessions() {
  const [sessions, setSessions] = useState<SessionData[]>([]);

  const createSession = useCallback(async (): Promise<SessionData> => {
    const newSession: SessionData = {
      id: crypto.randomUUID(),
      created: Date.now(),
      updated: Date.now(),
      title: 'New Chat',
      working_dir: process.cwd?.() || '',
      messages: [],
    };

    await window.floydAPI.saveSession(newSession);
    setSessions((prev) => [newSession, ...prev]);

    return newSession;
  }, []);

  const loadSession = useCallback(async (id: string): Promise<SessionData | null> => {
    const session = await window.floydAPI.loadSession(id);
    return session;
  }, []);

  const deleteSession = useCallback(async (id: string) => {
    await window.floydAPI.deleteSession(id);
    setSessions((prev) => prev.filter((s) => s.id !== id));
  }, []);

  return {
    sessions,
    createSession,
    loadSession,
    deleteSession,
  };
}
```

---

## Phase 6: Types and Utilities

### 6.1 Shared Types

**File:** `src/types.ts`

```typescript
export interface Message {
  role: 'user' | 'assistant';
  content: string;
  tool_calls?: ToolCall[];
  timestamp?: number;
}

export interface ToolCall {
  id: string;
  name: string;
  input: Record<string, any>;
  output?: string;
}

export interface Tool {
  name: string;
  description: string;
  input_schema: Record<string, any>;
}

export interface StreamChunk {
  token: string;
  done: boolean;
  tool_call?: ToolCall | null;
  tool_use_complete?: boolean;
  output?: string;
  stop_reason?: string;
  error?: Error;
  usage?: UsageInfo;
}

export interface UsageInfo {
  input_tokens: number;
  output_tokens: number;
}

export interface AgentStatus {
  connected: boolean;
  model: string;
  sub_agents?: SubAgentStatus[];
}

export interface SubAgentStatus {
  id: string;
  type: string;
  task: string;
  status: 'running' | 'completed' | 'failed';
}

export interface SessionData {
  id: string;
  created: number;
  updated: number;
  title: string;
  working_dir: string;
  messages: Message[];
}
```

### 6.2 Utility Functions

**File:** `src/lib/utils.ts`

```typescript
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

---

## Phase 7: Chrome Extension Integration

### 7.1 Extension Detection

**File:** `src/api/chrome-bridge.ts`

```typescript
const CHROME_WS_URL = 'ws://localhost:3000';

export class ChromeBridge {
  private ws: WebSocket | null = null;
  private connected = false;

  async connect(): Promise<boolean> {
    return new Promise((resolve) => {
      try {
        this.ws = new WebSocket(CHROME_WS_URL);

        this.ws.onopen = () => {
          this.connected = true;
          resolve(true);
        };

        this.ws.onerror = () => {
          this.connected = false;
          resolve(false);
        };

        this.ws.onclose = () => {
          this.connected = false;
        };
      } catch {
        resolve(false);
      }
    });
  }

  async listTools(): Promise<Tool[]> {
    if (!this.connected) return [];

    this.ws?.send(JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      method: 'tools/list',
    }));

    return new Promise((resolve) => {
      const handler = (event: MessageEvent) => {
        const response = JSON.parse(event.data);
        if (response.result) {
          resolve(response.result.tools || []);
        }
        this.ws?.removeEventListener('message', handler);
      };
      this.ws?.addEventListener('message', handler);
    });
  }

  isConnected(): boolean {
    return this.connected;
  }

  disconnect() {
    this.ws?.close();
  }
}
```

---

## Development Workflow

### Starting Development

```bash
# Terminal 1: Start Go agent server
cd /Volumes/Storage/FLOYD_CLI
go run cmd/floyd-server/main.go

# Terminal 2: Start FloydDesktop
cd FloydDesktop
npm run dev
```

### Building for Production

```bash
npm run build
npm run package
```

---

**Status:** Implementation guide complete. Next step is to create the actual files and test the integration.
