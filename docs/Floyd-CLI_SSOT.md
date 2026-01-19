# FLOYD CLI - Single Source of Truth (SSOT)

**Last Updated:** 2026-01-19
**Status:** P0 Bug Resolution In Progress | See `.floyd/P0_IMPLEMENTATION_PLAN.md`

---

## Executive Summary

**FLOYD is Douglas's personal daily driver replacement for the Anthropic Claude ecosystem.**

This is not a demo or proof of concept. This is production software that must work flawlessly.

> **CURRENT PRIORITY:** 77 bugs have been identified across all components. Development focus is on systematic bug resolution.
> 
> **For current tasks:** See `.floyd/P0_CRITICAL_BUGS.md` (bug details) and `.floyd/P0_IMPLEMENTATION_PLAN.md` (execution order).

| Floyd Component | Replaces | Status |
|-----------------|----------|--------|
| **FloydDesktop** | Claude Desktop | 65% parity |
| **Floyd CLI** | Claude Code | 40% parity |
| **FloydChrome** | Claude for Chrome | 50% parity |
| **Browork** | Claude Cowork | 35% parity |

The project uses a **shared TypeScript agent core** (`floyd-agent-core`) that powers all interfaces.

**Key Decision:** Go-based agent was retired 2026-01-16. TypeScript is now the primary language for all active development.

---

## Technology Stack

### Core Technologies
| Component | Technology | Version |
|-----------|------------|---------|
| Language | TypeScript | 5.0.3 (floyd-cli), 5.8.3 (agent-core, Desktop) |
| Runtime | Node.js | ES2022 |
| UI Framework (CLI) | React Ink | Latest |
| UI Framework (Desktop) | React + Vite | Latest |
| Desktop | Electron | Latest |
| API | GLM-4.7 (via api.z.ai proxy) | Anthropic-compatible |

### Dependencies
```json
{
  "@anthropic-ai/sdk": "^0.71.2",
  "@modelcontextprotocol/sdk": "^1.25.2",
  "ink": "^4.x",
  "react": "^18.x",
  "vite": "^6.3.5",
  "uuid": "^13.0.0",
  "ws": "^8.18.0"
}
```

---

## Project Structure

```
/Volumes/Storage/FLOYD_CLI/
├── packages/
│   └── floyd-agent-core/        # ✅ Shared TypeScript agent core
│       ├── src/
│       │   ├── agent/           # AgentEngine, orchestrator
│       │   ├── mcp/             # MCP client manager (WebSocket + stdio)
│       │   ├── store/           # Session persistence (JSON)
│       │   ├── permissions/     # Safety rules
│       │   └── utils/           # Configuration
│       ├── package.json
│       ├── tsconfig.json
│       └── README.md
│
├── INK/
│   └── floyd-cli/               # ✅ CLI (React Ink UI, imports agent-core)
│       ├── src/
│       │   ├── agent/           # Agent orchestration
│       │   ├── app.tsx          # Main Ink app entry point
│       │   ├── browser/         # Browser automation tools
│       │   ├── cli.tsx          # CLI root component
│       │   ├── commands/        # CLI command handlers
│       │   ├── ipc/             # IPC communication
│       │   ├── mcp/             # MCP integration
│       │   ├── permissions/     # Permission management
│       │   ├── prompts/         # Prompt templates
│       │   ├── store/           # State persistence
│       │   ├── streaming/       # Streaming response handling
│       │   ├── theme/           # UI theming (CRUSH)
│       │   ├── ui/              # Ink components
│       │   └── utils/           # Utility functions
│       ├── package.json
│       └── readme.md
│
├── FloydDesktop/                # ✅ Desktop (Electron + React, imports agent-core)
│       ├── src/
│       │   ├── components/      # React UI (SettingsModal with provider selection)
│       │   ├── config/           # Provider configurations (GLM, Anthropic)
│       │   └── hooks/            # AgentEngine hooks
│       ├── electron/
│       │   ├── main.ts          # Electron main process
│       │   ├── preload.ts       # Context bridge
│       │   └── ipc/             # IPC handlers
│       ├── src/
│       │   ├── components/      # React UI
│       │   └── hooks/           # AgentEngine hooks
│       ├── package.json
│       └── IMPLEMENTATION.md
│
├── FloydChromeBuild/            # ✅ Chrome Extension (hybrid JS/TS)
│   └── floydchrome/
│       ├── background.js        # Service worker entry (JavaScript)
│       ├── content.js           # Content script bridge (JavaScript)
│       ├── manifest.json        # Extension manifest (references .js files)
│       ├── src/                 # TypeScript source modules
│       │   ├── agent/           # FloydAgent (WebSocket MCP client)
│       │   ├── mcp/             # WebSocket + Native Messaging MCP
│       │   ├── tools/           # Browser automation tools
│       │   ├── safety/          # Sanitization, permissions
│       │   ├── sidepanel/       # Side panel UI
│       │   ├── background.ts    # TS module for background logic
│       │   ├── content.ts       # TS module for content script logic
│       │   ├── types.ts         # Shared type definitions
│       │   └── index.ts         # Entry point for builds
│       ├── package.json
│       ├── tsconfig.json
│       ├── vite.config.ts
│       └── ARCHITECTURE.md
│
├── .archive/                     # Archived code
│   ├── 2025-01-cleanup/         # Old cleanup archives
│   └── 2026-01-16-go-tui-retirement/  # Retired Go/TUI code
│
├── agent/                       # ⚠️ Legacy Go agent (do not use)
├── tui/                         # ⚠️ Legacy Go TUI (do not use)
│
├── .floyd/                       # Active development workspace
│   ├── sessions/                 # Session persistence (JSON files)
│   ├── ascii/                    # ASCII art resources
│   ├── allowlist.json            # Allowed operations
│   ├── permissions.json          # Permission rules
│   ├── branch.md                 # Current branch context
│   ├── master_plan.md            # Project roadmap
│   ├── stack.md                  # Technology stack
│   ├── scratchpad.md             # Temporary notes
│   └── .cache/                   # SUPERCACHE storage
│
├── docs/                        # Documentation
│   ├── Floyd-CLI_SSOT.md        # This file
│   ├── FLOYD_ARCHITECTURE.md     # Architecture overview
│   ├── path-forward.md           # Implementation phases
│   └── agents.md                 # Agent system docs
│
├── Claude.md                     # Agent operating system
├── package.json                  # Root package.json (workspace)
└── README.md                     # Project readme
```

---

## Implementation Phases

### Phase 1: TypeScript Migration ✅ COMPLETE
**Status:** Go agent retired 2026-01-16

| Component | Before | After |
|-----------|--------|-------|
| CLI | Go Bubbletea | TypeScript Ink |
| Agent Core | Go-only | Shared package `floyd-agent-core` |
| Chrome Extension | JavaScript | TypeScript + WebSocket MCP |
| Desktop | Planned | Electron + TypeScript (in progress) |

### Phase 2: Shared Agent Core ✅ COMPLETE
**Status:** `floyd-agent-core` package created and building

**Modules:**
- `AgentEngine` - Main orchestrator with streaming support
- `MCPClientManager` - Tool discovery and execution (WebSocket + stdio)
- `SessionManager` - JSON file session persistence
- `PermissionManager` - Tool access control
- `Config` - Settings from CLAUDE.md and `.floyd/settings.json`

### Phase 3: Chrome Extension Refactor ✅ COMPLETE
**Status:** TypeScript conversion complete, WebSocket MCP added

**Changes:**
- Full TypeScript build with Vite + `@crxjs/vite-plugin`
- WebSocket MCP client for connecting to FloydDesktop
- Browser automation tools (navigate, click, type, read)
- Safety layer for content sanitization

### Phase 4: FloydDesktop Implementation ✅ FUNCTIONAL
**Status:** Electron app with working Settings system (Provider selection: GLM, Anthropic)

**Implemented Features:**
- Settings persistence (saves to `~/Library/Application Support/Floyd Desktop/settings.json`)
- Provider selection (GLM via api.z.ai, Anthropic direct)
- Dynamic model lists per provider
- Auto-populated endpoints
- AgentEngine rebuilds on settings change with provider-specific headers
- Electron main process with AgentEngine
- React UI with Vite
- WebSocket MCP server (port 3000) for Chrome extension
- IPC bridge between renderer and main process

---

## API Configuration

### GLM-4.7 via Anthropic-Compatible Proxy

| Setting | Value |
|---------|-------|
| Endpoint | `https://api.z.ai/api/anthropic` |
| Model Mapping | `claude-opus-4` → GLM-4.7 |
| Streaming | Supported |
| Max Tokens | 8192 (default) |
| Max Turns | 10 (tool loop limit) |

### Environment Variables (priority order)

1. `ANTHROPIC_AUTH_TOKEN`
2. `GLM_API_KEY`
3. `ZHIPU_API_KEY`
4. `~/.claude/settings.json`

---

## Tool System

### Built-in Tools (from floyd-agent-core)

| Tool | Category | Description |
|------|----------|-------------|
| Read | Filesystem | Read file contents with optional search |
| Write | Filesystem | Create or overwrite files |
| Edit | Filesystem | Surgical string replacement |
| MultiEdit | Filesystem | Batch non-contiguous edits |
| Ls | Filesystem | List directory entries |
| Glob | Filesystem | Pattern-based file matching |
| Grep | Search | Regex search across files |
| Bash | System | Execute shell commands |
| CacheStore | Cache | Store to SUPERCACHE tier |
| CacheRetrieve | Cache | Retrieve from SUPERCACHE |
| CacheList | Cache | List cache entries |
| CacheClear | Cache | Clear cache tier |
| CacheStats | Cache | Get cache statistics |

### Chrome Extension Tools

| Tool | Description |
|------|-------------|
| navigate | Navigate to URL |
| read_page | Get accessibility tree |
| get_page_text | Extract page text |
| find | Find element by query |
| click | Click element |
| type | Type text |
| tabs_create | Create new tab |
| get_tabs | List all tabs |

---

## MCP (Model Context Protocol) Integration

### MCP Servers

FLOYD can connect to external MCP servers via:
1. **stdio**: Launch subprocess with stdio communication (most common for npm MCP servers)
2. **WebSocket**: Connect to remote WebSocket MCP servers
3. **SSE**: Server-Sent Events transport (planned)

### MCP Configuration

MCP servers are configured via `.floyd/mcp.json` (or `.floyd/mcp.config.json`). An example is provided at `.floyd/mcp.config.example.json`.

```json
{
  "version": "1.0",
  "servers": [
    {
      "name": "filesystem",
      "enabled": true,
      "transport": {
        "type": "stdio",
        "command": "npx",
        "args": ["-y", "@modelcontextprotocol/server-filesystem", "/tmp/allowed"]
      }
    },
    {
      "name": "github",
      "enabled": false,
      "transport": {
        "type": "stdio",
        "command": "npx",
        "args": ["-y", "@modelcontextprotocol/server-github"],
        "env": {
          "GITHUB_TOKEN": "your-token-here"
        }
      }
    }
  ]
}
```

### Configuration Loading

The `MCPClientManager` in `floyd-agent-core` provides:
- `loadMCPConfig(projectRoot)` - Auto-discovers config from default locations
- `loadMCPConfigFromFile(filePath)` - Loads from specific path
- `connectFromConfig(servers)` - Connects to all enabled servers

```typescript
import { MCPClientManager, loadMCPConfig, getEnabledServers } from 'floyd-agent-core';

const manager = new MCPClientManager();
const config = loadMCPConfig();
const servers = getEnabledServers(config);

const result = await manager.connectFromConfig(servers);
console.log(`Connected: ${result.connected}, Failed: ${result.failed}`);
```

### MCP Tools Discovery

Tools are auto-discovered from connected MCP servers and exposed to the agent with proper schema transformation. Use `manager.listTools()` to get all available tools and `manager.callTool(name, args)` to execute them.

### Chrome Extension Integration

The Chrome extension connects to FloydDesktop via WebSocket on `ws://localhost:3000` (with automatic port fallback). The desktop hosts an MCP WebSocket server that the extension can call for tool execution.

---

## SUPERCACHE System

### 3-Tier Architecture

| Tier | Name | TTL | Purpose |
|------|------|-----|---------|
| 1 | Reasoning | 5 minutes | Current conversation context |
| 2 | Project | 24 hours | Project-specific context |
| 3 | Vault | 7 days | Reusable solutions |

### Storage Location

```
.floyd/.cache/
├── reasoning/
│   ├── active/              # Current session
│   └── archive/             # Past sessions
├── project/
│   ├── phase_summaries/     # Phase completion summaries
│   └── context/             # Project working memory
└── vault/
    ├── patterns/            # Reusable code patterns
    └── index/               # Pattern search index
```

---

## Development Workflow

### Quick Start Commands

```bash
# From project root - install all workspaces
npm install

# CLI (Ink TUI)
cd INK/floyd-cli
npm run build            # Production build
npm run start            # Run CLI

# Desktop (Electron)
cd FloydDesktop
npm run dev              # Development mode (launches Electron + Vite)
npm run build            # Production build
npm run package          # Package for distribution

# Chrome Extension
cd FloydChromeBuild/floydchrome
npm run build            # Build extension
# Then load dist/ folder in chrome://extensions

# Shared Agent Core
cd packages/floyd-agent-core
npm run build            # Build package
npm run watch            # Watch mode
```

### First-Time Setup

1. **Install dependencies** (from repo root):
   ```bash
   npm install
   ```

2. **Set API Key** (choose one method):
   - Create `.env` in `INK/floyd-cli/` with `GLM_API_KEY=your-key`
   - Or set environment variable: `export GLM_API_KEY=your-key`
   - Or configure in FloydDesktop Settings (Cmd+,) > API tab:
     - Select Provider (GLM or Anthropic)
     - Enter API Key
     - Select Model from dropdown
     - Click "Save Settings"

3. **Run the app**:
   - CLI: `cd INK/floyd-cli && npm run start`
   - Desktop: `cd FloydDesktop && npm run dev`

### Verification Checklist

Before claiming completion:
- [ ] Code compiles without errors (`npx tsc --noEmit`)
- [ ] Build succeeds (`npm run build`)
- [ ] No new warnings introduced
- [ ] Documentation updated if behavior changed
- [ ] Related files checked for consistency

---

## Branch Strategy

### Rules
1. **NEVER push to main/master directly**
2. All changes go through feature branches
3. Douglas (repo owner) approves merges
4. Use descriptive branch names: `feature/`, `fix/`, `refactor/`

### Branch Status

| Branch | Purpose | Status |
|--------|---------|--------|
| `master` | Main development | Active |
| `feature/*` | Feature development | Template |
| `fix/*` | Bug fixes | Template |

---

## Code Patterns

### TypeScript (Primary Language)

```typescript
// Functional React components with hooks
import { useState, useEffect } from 'react';
import { Box, Text } from 'ink';

// Zustand for state management
import create from 'zustand';

// Absolute imports via path aliases
import { AgentEngine } from 'floyd-agent-core';
```

### Error Handling

```typescript
// Always handle errors explicitly
try {
  const result = await tool.execute(params);
  return { success: true, data: result };
} catch (error) {
  return {
    success: false,
    error: error instanceof Error ? error.message : String(error)
  };
}
```

---

## Key Contacts

| Role | Name |
|------|------|
| Repo Owner | Douglas |
| Agent | Claude (Opus 4.5) |

---

*This document is the Single Source of Truth for FLOYD CLI project structure and roadmap. When code and docs disagree, treat as drift and investigate.*
