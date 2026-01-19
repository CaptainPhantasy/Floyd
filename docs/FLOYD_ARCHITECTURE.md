# FLOYD CLI - AI Coding Agent Architecture

**File-Logged Orchestrator Yielding Deliverables**

**Last Updated:** 2026-01-17

---

## Overview

FLOYD is an autonomous AI coding agent designed to compete with Claude Code while leveraging the GLM-4.7 API through an Anthropic-compatible proxy. It provides multiple interfaces for AI-assisted software development with full filesystem access, intelligent caching, and structured protocol management.

### Components

| Component | Status | Description |
|-----------|--------|-------------|
| **FLOYD CLI (Ink)** | ✅ Complete | Terminal-based TUI agent (TypeScript/React Ink) |
| **FloydDesktop** | 🚧 In Progress | Electron desktop app with React UI |
| **FloydChrome** | ✅ Built | Chrome extension for browser automation |
| **FLOYD Go Agent** | ⚠️ Retired | Legacy Go-based agent - DO NOT USE, archived to `.archive/2026-01-16-go-tui-retirement/` |
| **Shared Agent Core** | ✅ Complete | `floyd-agent-core` package for all clients |

---

## Modern Architecture (TypeScript-Based)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           GLM-4.7 API (api.z.ai)                           │
│                      (Anthropic-Compatible Proxy)                          │
└─────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                     Shared Agent Core (floyd-agent-core)                    │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────────┐   │
│  │   AgentEngine    │  │  MCP Client Mgr   │  │   Session Store      │   │
│  │  (Orchestrator)  │  │  (Tool Discovery) │  │   (JSON Persistence)  │   │
│  └──────────────────┘  └──────────────────┘  └──────────────────────┘   │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────────┐   │
│  │  Permission Mgr  │  │   Tool Loop      │  │   Config Manager     │   │
│  │  (Safety Rules)  │  │  (Max 10 turns)  │  │   (API Keys/Settings)│   │
│  └──────────────────┘  └──────────────────┘  └──────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
                          │                    │                    │
         ┌────────────────┴─────────┐ ┌──────┴──────┐    ┌───────┴────────┐
         ▼                          ▼             ▼             ▼
┌────────────────┐      ┌──────────────────┐  ┌──────────┐  ┌──────────────────┐
│  Ink CLI       │      │  FloydDesktop    │  │   Chrome │  │   Go CLI        │
│  (Terminal TUI)│      │  (Electron App)  │  │ Extension│  │   (Legacy)      │
│                │      │                  │  │          │  │                 │
│ React Ink UI   │      │ React Web UI     │  │ Browser  │  │ Bubbletea TUI   │
│ floyd-cli/     │      │ FloydDesktop/    │  │ floydchrome/│  agent/         │
└────────────────┘      └──────────────────┘  └──────────┘  └──────────────────┘
```

---

## FloydDesktop (Electron App)

### Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         FloydDesktop (Electron)                            │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                    Main Process (Node.js)                              │  │
│  │  ┌─────────────────────────────────────────────────────────────────┐  │  │
│  │  │              Shared Agent Engine                                 │  │  │
│  │  │  (imported from floyd-agent-core)                               │  │  │
│  │  │                                                                 │  │  │
│  │  │  - Anthropic SDK (via api.z.ai proxy)                          │  │  │
│  │  │  - MCP Client Manager (WebSocket server on port 3000)           │  │  │
│  │  │  - Session Manager (JSON storage)                               │  │  │
│  │  │  - Permission Manager                                           │  │  │
│  │  │  - Tool calling loop (max 10 turns)                             │  │  │
│  │  └─────────────────────────────────────────────────────────────────┘  │  │
│  │                                                                        │  │
│  │  ┌─────────────────────────────────────────────────────────────────┐  │  │
│  │  │                   IPC Bridge (AgentBridge)                       │  │  │
│  │  │  - agent:sendMessage (streaming)                                │  │  │
│  │  │  - agent:listTools                                              │  │  │
│  │  │  - agent:getHistory                                             │  │  │
│  │  │  - agent:loadSession                                            │  │  │
│  │  │  - agent:newSession                                             │  │  │
│  │  └─────────────────────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                     ↕ IPC                                  │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                  Renderer Process (React)                            │  │
│  │  - Chat panel with streaming response                               │  │
│  │  - File browser / workspace view                                    │  │
│  │  - Tool call visualization (expandable cards)                       │  │
│  │  - Session history sidebar                                          │  │
│  │  - Settings panel                                                   │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
                                          │
                    ┌─────────────────────┴────────────────┐
                    ↓                                       ↓
        ┌─────────────────────┐               ┌─────────────────────────┐
        │ Floyd Chrome        │               │ MCP Servers              │
        │ Extension           │               │ (via stdio/WebSocket)   │
        │                     │               │                          │
        │ Connects via        │               │ - Filesystem            │
        │ WebSocket to        │               │ - Git                   │
        │ Desktop's MCP       │               │ - Search                │
        │ server (port 3000)  │               │ - Browser automation    │
        └─────────────────────┘               └─────────────────────────┘
```

### Key Design Decisions

1. **Shared AgentEngine**: The `AgentEngine` from `floyd-agent-core` is imported by both CLI and Desktop
2. **No WebSocket Bridge**: Everything is TypeScript - direct imports, no Go bridge needed
3. **MCP Server**: Desktop runs WebSocket server on port 3000 for Chrome extension
4. **React UI**: Desktop uses React (via Vite) instead of Ink terminal UI
5. **JSON File Storage**: Session persistence via SessionManager (JSON files, not SQLite)

### Project Structure

```
FloydDesktop/
├── electron/
│   ├── main.ts              # Electron main process
│   ├── preload.ts           # Context bridge & IPC
│   └── ipc/
│       └── agent-bridge.ts  # IPC handlers for AgentEngine
├── src/
│   ├── App.tsx              # Root React component
│   ├── components/
│   │   ├── ChatPanel.tsx    # Chat interface
│   │   ├── Sidebar.tsx      # Session history
│   │   ├── ToolCallCard.tsx # Tool visualization
│   │   └── Settings.tsx     # Configuration
│   └── hooks/
│       └── useAgent.ts      # AgentEngine hooks
├── package.json
└── vite.config.ts
```

---

## Tool Capabilities

### Filesystem Tools

| Tool | Description | Input Schema |
|------|-------------|--------------|
| **Read** | Read file contents with optional search | `{file_path, query?, limit?}` |
| **Write** | Create or overwrite files | `{file_path, content}` |
| **Edit** | Surgical string replacement | `{file_path, old_string, new_string}` |
| **MultiEdit** | Batch non-contiguous edits | `{file_path, edits[{old_string, new_string}]}` |
| **Ls** | List directory entries | `{path?, ignore?[]}` |
| **Glob** | Pattern-based file matching | `{pattern}` |

### Search Tools

| Tool | Description | Input Schema |
|------|-------------|--------------|
| **Grep** | Regex search across files | `{pattern, path?, glob?, output_mode?}` |

### System Tools

| Tool | Description | Input Schema |
|------|-------------|--------------|
| **Bash** | Execute shell commands | `{command, timeout?}` |

### Cache Tools

| Tool | Description | Input Schema |
|------|-------------|--------------|
| **CacheStore** | Store to SUPERCACHE tier | `{tier, key, value}` |
| **CacheRetrieve** | Retrieve from SUPERCACHE | `{tier, key}` |
| **CacheList** | List cache entries | `{tier}` |
| **CacheClear** | Clear cache tier | `{tier}` |
| **CacheStats** | Get cache statistics | `{}` |

---

## 3-Tier SUPERCACHE System

| Tier | Name | TTL | Purpose |
|------|------|-----|---------|
| 1 | **Reasoning** | 5 minutes | Current conversation context, working memory |
| 2 | **Project** | 24 hours | Project-specific context, decisions, progress |
| 3 | **Vault** | 7 days | Reusable solutions, patterns, learned approaches |

---

## Monorepo Structure

```bash
/Volumes/Storage/FLOYD_CLI/
├── packages/
│   └── floyd-agent-core/        # Shared TypeScript agent core
│       ├── src/
│       │   ├── agent/           # AgentEngine, orchestrator
│       │   ├── mcp/             # MCP client manager
│       │   ├── store/           # Session persistence
│       │   ├── permissions/     # Safety rules
│       │   └── utils/           # Configuration
│       └── package.json
├── INK/
│   └── floyd-cli/               # CLI (React Ink UI, imports agent-core)
├── FloydDesktop/                # Desktop (Electron + React, imports agent-core)
│   ├── electron/
│   ├── src/
│   └── IMPLEMENTATION.md
├── FloydChromeBuild/            # Chrome Extension
│   └── floydchrome/
│       ├── mcp/
│       ├── tools/
│       └── native-messaging/
├── agent/                       # Go-based agent (legacy, being phased out)
├── tui/                         # Go TUI components (legacy)
└── docs/                        # Documentation
```

---

## API Configuration

| Setting | Value |
|---------|-------|
| Endpoint | `https://api.z.ai/api/anthropic` |
| Model | `claude-opus-4` → GLM-4.7 |
| Format | Anthropic API compatible |
| Streaming | Supported |

### Environment Variables (priority order)

1. `ANTHROPIC_AUTH_TOKEN`
2. `GLM_API_KEY`
3. `ZHIPU_API_KEY`
4. `~/.claude/settings.json`

---

## Quick Start

### FloydDesktop (Electron)

```bash
cd FloydDesktop
npm install
npm run dev      # Development mode
npm run build    # Production build
npm run package  # Create distributable
```

### Ink CLI (Modern - Recommended)

The primary CLI interface built with TypeScript and React Ink. This is the actively maintained
version that imports `floyd-agent-core`.

```bash
cd INK/floyd-cli
npm install
npm run build    # Production build
npm start        # Run CLI (development mode)
```

### FloydChrome Extension

```bash
cd FloydChromeBuild/floydchrome
npm install
# Load as unpacked extension in Chrome
./native-messaging/install-host.sh <EXTENSION_ID>
```

### Go CLI (RETIRED - DO NOT USE)

**The original Go-based CLI is ARCHIVED as of 2026-01-16.**

This version has been retired in favor of the TypeScript-based Ink CLI. The source code
has been moved to `.archive/2026-01-16-go-tui-retirement/`.

Use `INK/floyd-cli` (TypeScript + React Ink) for all new development.

**Migration:** If you have existing Go CLI sessions, migrate to the Ink CLI by exporting
your session data and importing into the new format.

---

## Design Philosophy

1. **Execute, Don't Advise** - FLOYD acts on tasks rather than just describing solutions
2. **Verify Everything** - Builds and tests run after every change
3. **Context is King** - External memory in `.floyd/` provides persistent project knowledge
4. **Safety First** - Hard rules prevent destructive operations
5. **Professional Output** - Clean formatting with tables, boxes, and checkmarks
6. **Shared Core** - All clients use the same `floyd-agent-core` package

---

## Status Matrix

| Component | Implementation | Status | Notes |
|-----------|----------------|--------|-------|
| Shared Agent Core | TypeScript | ✅ Complete | AgentEngine, MCPClientManager, SessionManager, PermissionManager, Config |
| Ink CLI | React Ink | ✅ Complete | Terminal UI |
| FloydDesktop | Electron + React | 🚧 In Progress | See `FloydDesktop/IMPLEMENTATION.md` |
| FloydChrome | Chrome Extension | ✅ Built | MCP server + tools |
| Go CLI | Go | ⚠️ Retired | ARCHIVED - DO NOT USE - See `.archive/2026-01-16-go-tui-retirement/` |
| Go TUI | Bubbletea | ⚠️ Retired | ARCHIVED - DO NOT USE - See `.archive/2026-01-16-go-tui-retirement/` |

---

*FLOYD: Building complete software, not MVPs.*
