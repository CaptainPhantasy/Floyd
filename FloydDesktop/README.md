# FloydDesktop

**The Desktop Hub for the Floyd Ecosystem**

> **Architecture Update:** Using shared TypeScript AgentEngine from the Ink CLI. No Go, no WebSocket bridges - pure TypeScript all the way.

---

## Simplified Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         FloydDesktop (Electron)                     │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                    Main Process (Node.js)                    │   │
│  │  ┌───────────────────────────────────────────────────────┐  │   │
│  │  │              Shared Agent Engine                       │  │   │
│  │  │  (imported from INK/floyd-cli/src/agent)              │  │   │
│  │  │                                                       │  │   │
│  │  │  - Anthropic SDK (via api.z.ai proxy)                │  │   │
│  │  │  - MCP Client Manager                                │  │   │
│  │  │  - Session Manager (JSON storage)                    │  │   │
│  │  │  - Permission Manager                                │  │   │
│  │  │  - Tool calling loop (max 10 turns)                  │  │   │
│  │  └───────────────────────────────────────────────────────┘  │   │
│  │                                                              │   │
│  │  ┌───────────────────────────────────────────────────────┐  │   │
│  │  │              MCP Client Manager                        │  │   │
│  │  │  - WebSocket server (port 3000) for Chrome bridge      │  │   │
│  │  │  - stdio transport for local MCP servers              │  │   │
│  │  │  - Multi-client management                            │  │   │
│  │  └───────────────────────────────────────────────────────┘  │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                              ↕ IPC                                   │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                  Renderer Process (React)                    │   │
│  │  - Chat panel with streaming                                │   │
│  │  - File browser / workspace view                            │   │
│  │  - Tool call cards                                          │   │
│  │  - Session history sidebar                                  │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                    ┌───────────────┴────────────────┐
                    ↓                                ↓
        ┌─────────────────────┐        ┌─────────────────────────┐
        │ Floyd CLI (Ink)     │        │ Floyd Chrome Extension  │
        │                     │        │                         │
        │ Uses same           │        │ Connects via WebSocket  │
        │ AgentEngine!        │        │ to Desktop's MCP server │
        └─────────────────────┘        └─────────────────────────┘
```

## Key Design Decisions

### 1. Shared AgentEngine

The `AgentEngine` class from `INK/floyd-cli/src/agent/orchestrator.ts` is **extracted into a shared package** that both CLI and Desktop import:

```
floyd-agent-core/
├── src/
│   ├── agent/
│   │   ├── AgentEngine.ts       # Main orchestrator
│   │   └── types.ts             # Shared types
│   ├── mcp/
│   │   ├── client-manager.ts    # MCP client management
│   │   └── types.ts             # MCP protocol types
│   ├── store/
│   │   └── conversation-store.ts # Session persistence
│   ├── permissions/
│   │   └── ask-ui.ts            # Permission system
│   └── utils/
│       └── config.ts            # Configuration
├── package.json
└── tsconfig.json
```

### 2. No WebSocket Bridge Between Languages

Since everything is TypeScript:
- **Desktop main process** directly imports AgentEngine
- **CLI** directly imports AgentEngine
- **Chrome extension** connects via WebSocket to Desktop's MCP server

### 3. Desktop-Specific UI Layer

The Desktop app provides:
- **React-based UI** instead of Ink terminal UI
- **IPC bridge** between renderer and AgentEngine
- **Native file dialogs** for workspace selection
- **Rich tool call visualization** with expandable cards

## Implementation Phases

### Phase 1: Extract Shared Agent Core ✅

```bash
# Create shared package
mkdir -p /Volumes/Storage/FLOYD_CLI/packages/floyd-agent-core
cd /Volumes/Storage/FLOYD_CLI/packages/floyd-agent-core

# Copy existing agent code
cp -r ../../INK/floyd-cli/src/agent src/
cp -r ../../INK/floyd-cli/src/mcp src/
cp -r ../../INK/floyd-cli/src/store src/
cp -r ../../INK/floyd-cli/src/permissions src/
cp -r ../../INK/floyd-cli/src/utils src/
```

**Package structure:**

```
packages/floyd-agent-core/
├── src/
│   ├── index.ts                    # Main export
│   ├── agent/
│   │   ├── AgentEngine.ts          # From orchestrator.ts
│   │   └── types.ts
│   ├── mcp/
│   │   ├── client-manager.ts
│   │   └── types.ts
│   ├── store/
│   │   └── conversation-store.ts
│   ├── permissions/
│   │   └── ask-ui.ts
│   └── utils/
│       └── config.ts
├── package.json
└── tsconfig.json
```

### Phase 2: Desktop Main Process

**File:** `FloydDesktop/electron/main.ts`

```typescript
import { app, BrowserWindow } from 'electron';
import { AgentEngine } from 'floyd-agent-core';
import { MCPClientManager } from 'floyd-agent-core/mcp';
import { SessionManager } from 'floyd-agent-core/store';
import { PermissionManager } from 'floyd-agent-core/permissions';
import { Config } from 'floyd-agent-core/utils';

let mainWindow: BrowserWindow;
let agentEngine: AgentEngine;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
    },
  });

  // Initialize agent engine
  const mcpManager = new MCPClientManager();
  const sessionManager = new SessionManager();
  const permissionManager = new PermissionManager();
  const config = new Config();

  agentEngine = new AgentEngine(
    process.env.ANTHROPIC_AUTH_TOKEN || '',
    mcpManager,
    sessionManager,
    permissionManager,
    config
  );

  // Start MCP server for Chrome extension
  mcpManager.startServer(3000);
}
```

### Phase 3: IPC Bridge

**File:** `FloydDesktop/electron/ipc/agent-bridge.ts`

```typescript
import { ipcMain } from 'electron';
import { AgentEngine } from 'floyd-agent-core';

export class AgentBridge {
  constructor(
    private agent: AgentEngine,
    private window: BrowserWindow
  ) {
    this.registerHandlers();
  }

  registerHandlers() {
    // Send message with streaming
    ipcMain.handle('agent:sendMessage', async (_, message: string) => {
      const generator = this.agent.sendMessage(message);
      const chunks: string[] = [];

      for await (const chunk of generator) {
        chunks.push(chunk);
        this.window.webContents.send('agent:chunk', chunk);
      }

      return chunks.join('');
    });

    // List tools
    ipcMain.handle('agent:listTools', async () => {
      return this.agent.listTools();
    });

    // Get session history
    ipcMain.handle('agent:getHistory', async () => {
      return this.agent.history;
    });

    // Load session
    ipcMain.handle('agent:loadSession', async (_, id: string) => {
      return this.agent.loadSession(id);
    });

    // Create new session
    ipcMain.handle('agent:newSession', async (_, cwd: string) => {
      return this.agent.initSession(cwd);
    });
  }
}
```

### Phase 4: React Components

**File:** `FloydDesktop/src/App.tsx`

```typescript
import { useState, useEffect } from 'react';
import { ChatPanel } from './components/ChatPanel';
import { Sidebar } from './components/Sidebar';

function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeToolCalls, setActiveToolCalls] = useState<ToolCall[]>([]);

  useEffect(() => {
    // Listen for streaming chunks
    window.floydAPI.onChunk((chunk: string) => {
      setMessages(prev => {
        const last = prev[prev.length - 1];
        if (last?.role === 'assistant') {
          return [...prev.slice(0, -1), { ...last, content: last.content + chunk }];
        }
        return [...prev, { role: 'assistant', content: chunk }];
      });
    });
  }, []);

  const sendMessage = async (content: string) => {
    setMessages(prev => [...prev, { role: 'user', content }]);
    setIsLoading(true);
    await window.floydAPI.sendMessage(content);
    setIsLoading(false);
  };

  return (
    <div className="flex h-screen bg-slate-900 text-slate-100">
      <Sidebar />
      <ChatPanel
        messages={messages}
        isLoading={isLoading}
        onSendMessage={sendMessage}
      />
    </div>
  );
}
```

## Getting Started

### Monorepo Structure

```bash
/Volumes/Storage/FLOYD_CLI/
├── packages/
│   └── floyd-agent-core/     # Shared agent code
├── INK/
│   └── floyd-cli/            # CLI (imports agent-core)
├── FloydDesktop/             # Desktop (imports agent-core)
└── FloydChromeBuild/         # Chrome extension
```

### Development

```bash
# 1. Build shared agent core
cd /Volumes/Storage/FLOYD_CLI/packages/floyd-agent-core
npm run build

# 2. Start Desktop
cd /Volumes/Storage/FLOYD_CLI/FloydDesktop
npm install
npm run dev

# 3. CLI still works independently
cd /Volumes/Storage/FLOYD_CLI/INK/floyd-cli
npm start
```

### API Key Resolution

FloydDesktop accepts provider keys and endpoints via:

1. Saved settings (`settings.json` in Electron userData)
2. `FLOYD_API_KEY` and `FLOYD_API_ENDPOINT`
3. `ZAI_API_KEY`, `ZAI_AUTH_TOKEN`
4. `ANTHROPIC_AUTH_TOKEN`, `GLM_API_KEY`, `ZHIPU_API_KEY`
4. Venv defaults: `venv/.env` (loaded if present)

## Status

- [x] Architecture planning
- [ ] Extract shared agent-core package
- [ ] FloydDesktop Electron app
- [ ] IPC bridge implementation
- [ ] React UI components
- [ ] Chrome extension integration

---

**Next:** Extract `floyd-agent-core` package and begin Desktop implementation.
