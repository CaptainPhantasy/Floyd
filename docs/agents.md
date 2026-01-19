# FLOYD AGENT

**Last Updated:** 2026-01-17

## Goal

Build a GLM-4.7 powered coding agent that competes with Claude Code - using a $270/year unlimited GLM Mac Code plan instead of monthly $20 Claude subscriptions.

## Architecture Overview

FLOYD is now a **TypeScript-first** multi-platform agent system. The shared agent core (`packages/floyd-agent-core/`) powers multiple UI frontends:

```
                    ┌─────────────────────────────────────┐
                    │   floyd-agent-core (TypeScript)     │
                    │   ┌───────────────────────────────┐ │
                    │   │  AgentEngine                  │ │
                    │   │  - Streaming response         │ │
                    │   │  - Tool calling orchestration │ │
                    │   │  - Session management         │ │
                    │   └───────────────────────────────┘ │
                    │   ┌───────────────────────────────┐ │
                    │   │  MCPClientManager             │ │
                    │   │  - WebSocket server           │ │
                    │   │  - stdio client               │ │
                    │   │  - Tool aggregation           │ │
                    │   └───────────────────────────────┘ │
                    │   ┌───────────────────────────────┐ │
                    │   │  SessionManager               │ │
                    │   │  - JSON session storage       │ │
                    │   │  - Conversation persistence   │ │
                    │   └───────────────────────────────┘ │
                    │   ┌───────────────────────────────┐ │
                    │   │  PermissionManager            │ │
                    │   │  - Tool authorization         │ │
                    │   │  - Wildcard patterns          │ │
                    │   └───────────────────────────────┘ │
                    └───────────────────┬─────────────────┘
                                        │
                    ┌───────────────────┼───────────────────┐
                    │                   │                   │
            ┌───────▼──────┐  ┌────────▼────────┐  ┌──────▼───────┐
            │ Ink CLI      │  │ FloydDesktop   │  │ FloydChrome  │
            │ (Terminal)   │  │ (Electron)     │  │ (Extension)  │
            └──────────────┘  └─────────────────┘  └──────────────┘
```

## Current Status

### ✅ Working (TypeScript Architecture)

#### Shared Agent Core (`packages/floyd-agent-core/`)
- **AgentEngine** - Core AI orchestrator with streaming support
- **MCPClientManager** - Multi-transport MCP client/server
- **SessionManager** - JSON-based session persistence
- **PermissionManager** - Tool authorization with wildcards
- **Config** - Project configuration loader

#### Ink CLI (`INK/floyd-cli/`)
- **React Ink Terminal UI** - Functional components with hooks
- **Streaming responses** - Real-time token display
- **Session management** - Load/save conversations
- **MCP server mode** - Hosts WebSocket server for Chrome extension
- **CRUSH theme** - CharmUI-inspired visual design

#### FloydDesktop (`FloydDesktop/`)
- **Electron app** - Desktop GUI with React renderer
- **WebSocket MCP server** - Exposes agent to Chrome extension
- **IPC bridge** - Communication between renderer and agent
- **Session sidebar** - Browse and manage conversations

#### FloydChrome (`FloydChromeBuild/floydchrome/`)
- **Chrome extension** - Browser automation tools
- **WebSocket MCP client** - Connects to Desktop/CLI
- **Tool implementation** - Navigation, reading, interaction, tabs
- **Permission sandboxing** - Safety rules for browser actions

#### Session Management
- JSON files stored in `.floyd/sessions/`
- Full message history persistence
- Session metadata (id, created, updated, title, workingDirectory)

#### MCP Integration
- **WebSocket transport** - For Chrome extension connectivity
- **stdio transport** - For local MCP servers
- **Tool aggregation** - Unified tool list from all connections
- **JSON-RPC 2.0** - Standard MCP protocol

### 🔧 Maintenance Mode (Legacy Go)

⚠️ **RETIRED** - The original Go Bubbletea TUI has been **archived** to `.archive/2026-01-16-go-tui-retirement/`. It is not actively developed but may be referenced for architectural patterns.

Key archived components:
- `agent/` - API client, protocol manager, tool loop
- `cache/` - 3-tier SUPERCACHE backend (reasoning, project, vault)
- `tui/` - Bubbletea UI components
- `cmd/floyd/` - Main CLI entry point

## Project Structure

```
├── packages/
│   └── floyd-agent-core/        # Shared agent core (TypeScript)
│       ├── src/
│       │   ├── agent/
│       │   │   ├── AgentEngine.ts    # Main AI orchestrator
│       │   │   └── types.ts          # Message, ToolCall types
│       │   ├── mcp/
│       │   │   ├── client-manager.ts # Multi-transport MCP client
│       │   │   ├── websocket-transport.ts
│       │   │   └── types.ts
│       │   ├── store/
│       │   │   └── conversation-store.ts  # Session persistence
│       │   ├── permissions/
│       │   │   └── permission-manager.ts  # Tool authorization
│       │   └── utils/
│       │       └── config.ts         # Configuration loader
│       └── package.json
│
├── INK/
│   └── floyd-cli/                 # Ink CLI (React for terminals)
│       ├── src/
│       │   ├── app.tsx            # Main CLI component
│       │   ├── cli.tsx            # CLI entry point
│       │   ├── agent/             # Agent integration
│       │   ├── ui/                # UI components
│       │   │   ├── crush/         # CRUSH layout components
│       │   │   ├── components/    # Reusable UI elements
│       │   │   ├── layouts/       # Main layouts
│       │   │   └── overlays/      # Modal overlays
│       │   ├── permissions/       # Permission UI
│       │   └── theme/             # Theme definitions
│       └── package.json
│
├── FloydDesktop/                  # Electron desktop app
│   ├── electron/
│   │   ├── main.ts               # Electron main process
│   │   ├── preload.ts            # Context bridge
│   │   ├── ipc/                  # IPC handlers
│   │   └── mcp/
│   │       └── ws-server.ts      # WebSocket MCP server
│   ├── src/
│   │   ├── components/           # React components
│   │   ├── hooks/                # Custom React hooks
│   │   └── App.tsx               # Main app
│   └── package.json
│
├── FloydChromeBuild/
│   └── floydchrome/               # Chrome extension
│       ├── src/
│       │   ├── mcp/
│       │   │   └── websocket-client.ts  # MCP WebSocket client
│       │   ├── tools/             # Browser automation tools
│       │   ├── safety/            # Permission systems
│       │   ├── background.ts      # Extension background
│       │   └── content.ts         # Content script
│       ├── manifest.json
│       └── package.json
│
├── .floyd/                        # Project workspace
│   ├── sessions/                  # JSON session files
│   ├── settings.json              # Project configuration
│   ├── permissions.json           # Tool permissions
│   └── AGENT_INSTRUCTIONS.md     # Full FLOYD protocol
│
└── .archive/                      # Archived code
    └── 2026-01-16-go-tui-retirement/  # Go Bubbletea TUI (retired)
```

## Tool System

Tools are provided via MCP (Model Context Protocol) from connected servers:

| Transport | Purpose | Example |
|-----------|---------|---------|
| stdio | Local MCP servers | Filesystem operations, git |
| WebSocket | Chrome extension | Browser navigation, page reading |

### Chrome Extension Tools

| Tool | Description | Status |
|------|-------------|--------|
| `chrome_navigate` | Navigate to URL | ✅ |
| `chrome_read` | Read page content | ✅ |
| `chrome_click` | Click element | ✅ |
| `chrome_type` | Type text | ✅ |
| `chrome_tabs` | Tab management | ✅ |
| `chrome_screenshot` | Capture screenshot | ✅ |

### Permission System

Tools require authorization before execution:

- **allow** - Tool can execute without confirmation
- **deny** - Tool is blocked
- **ask** - User must confirm (default)

Permissions are stored in `.floyd/permissions.json` with wildcard support:
- `*` - Allow all tools
- `git-*` - Allow all git-prefixed tools
- `chrome_*` - Allow all chrome tools

## API Configuration

- **Endpoint:** `https://api.z.ai/api/anthropic`
- **Model:** `claude-opus-4` (maps to GLM-4.7)
- **Format:** Anthropic API compatible
- **Streaming:** Supported via async generators

### Environment Variables (priority order)

1. `ANTHROPIC_AUTH_TOKEN` - Primary API key
2. `GLM_API_KEY` - Fallback API key
3. `ZHIPU_API_KEY` - Fallback API key
4. `~/.claude/settings.json` - Claude Code config (for compatibility)

## Session Management

Sessions are stored as JSON files in `.floyd/sessions/`:

```json
{
  "id": "uuid-v4",
  "created": 1705480800000,
  "updated": 1705481200000,
  "title": "Chat title",
  "messages": [
    {"role": "system", "content": "..."},
    {"role": "user", "content": "..."},
    {"role": "assistant", "content": "..."}
  ],
  "workingDirectory": "/path/to/project"
}
```

## MCP WebSocket Protocol

The Chrome extension connects to FloydDesktop/CLI via WebSocket:

```
Chrome Extension          FloydDesktop/CLI
     (MCP Client)    ←→   (MCP Server)
          ws://localhost:3000
```

### JSON-RPC Methods

| Method | Direction | Description |
|--------|-----------|-------------|
| `initialize` | Client→Server | Connection handshake |
| `tools/list` | Client→Server | List available tools |
| `tools/call` | Client→Server | Execute a tool |
| `agent/status` | Client→Server | Get agent state |
| `agent/chat` | Client→Server | Send chat message |

## Building and Running

### Shared Agent Core

```bash
cd packages/floyd-agent-core
npm install
npm run build
```

### Ink CLI

```bash
cd INK/floyd-cli
npm install
npm run build
npm start          # Run the CLI
npm start -- --chrome  # Start with Chrome bridge (port 3000)
```

### FloydDesktop

```bash
cd FloydDesktop
npm install
npm run dev          # Development mode
npm run build        # Production build
npm run electron     # Run built app
```

### FloydChrome Extension

```bash
cd FloydChromeBuild/floydchrome
npm install
npm run build        # Build extension
# Load unpacked extension in Chrome from ./dist
```

## Configuration

### Project Configuration (`.floyd/settings.json`)

```json
{
  "systemPrompt": "Custom system prompt",
  "allowedTools": ["read", "write", "git-*"],
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "/path/to/allow"]
    }
  }
}
```

### Permissions (`.floyd/permissions.json`)

```json
{
  "rules": [
    {"pattern": "read", "level": "allow"},
    {"pattern": "write", "level": "ask"},
    {"pattern": "chrome_*", "level": "ask"},
    {"pattern": "bash", "level": "deny"}
  ]
}
```

## Troubleshooting

### Agent shows "Initializing..." but never ready
1. Check API key: `echo $GLM_API_KEY` or `echo $ANTHROPIC_AUTH_TOKEN`
2. Verify network connectivity to `api.z.ai`
3. Check `.floyd/settings.json` for configuration errors

### Chrome extension can't connect
1. Ensure FloydDesktop or CLI is running with `--chrome` flag
2. Verify WebSocket server on `ws://localhost:3000`
3. Check extension background console for errors

### Session not loading
1. Verify `.floyd/sessions/` directory exists
2. Check JSON file is valid
3. Ensure `workingDirectory` path is accessible

## Next Steps

- [ ] Add more MCP server integrations (git, filesystem, etc.)
- [ ] Implement multi-agent orchestration (spawn specialists)
- [ ] Add streaming cursor effects for Ink CLI
- [ ] Improve error handling and logging
- [ ] Add test coverage for agent core
- [ ] Document MCP server development guide
