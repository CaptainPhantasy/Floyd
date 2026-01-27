# FLOYD AGENT

**Last Updated:** 2026-01-21
**Purpose:** Operating System for AI agents working in this repository.

---

## Executive Summary

**FLOYD is Douglas's personal daily driver replacement for Anthropic Claude ecosystem.**

This is **not** a demo or proof of concept. This is production software that must work flawlessly.

The project uses a **shared TypeScript agent core** (`packages/floyd-agent-core/`) that powers multiple frontend interfaces:

- **Ink CLI** (Terminal-based TUI with React Ink)
- **FloydDesktopWeb** (Electron desktop application)
- **FloydChrome** (Chrome extension for browser automation)

> **CURRENT PRIORITY:** 77 bugs have been identified across all components. Development focus is on systematic bug resolution via `.floyd/P0_CRITICAL_BUGS.md`.

---

## Architecture Overview

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

---

## Project Structure

### Monorepo Layout

```
/Volumes/Storage/FLOYD_CLI/
├── packages/
│   └── floyd-agent-core/          # ✅ SHARED TYPESCRIPT AGENT CORE
│       ├── src/
│       │   ├── agent/               # AgentEngine, orchestrator
│       │   ├── mcp/                 # MCP client manager (WebSocket + stdio)
│       │   ├── store/               # Session persistence (JSON)
│       │   ├── permissions/         # Tool authorization
│       │   ├── llm/                 # LLM abstraction (not yet implemented)
│       │   ├── stt/                 # Speech-to-text integration
│       │   └── utils/               # Shared utilities
│       ├── package.json
│       └── tsconfig.json
│
├── INK/
│   └── floyd-cli/                  # ✅ CLI (React Ink UI)
│       ├── src/
│       │   ├── agent/               # Agent orchestration
│       │   ├── app.tsx              # Main Ink app component
│       │   ├── cli.tsx              # Entry point (meow CLI)
│       │   ├── browser/             # Browser automation tools
│       │   ├── commands/            # CLI command handlers
│       │   ├── ipc/                 # IPC communication
│       │   ├── mcp/                 # MCP servers (browser, cache, git, patch, runner)
│       │   ├── permissions/         # Permission management
│       │   ├── prompts/             # Prompt templates
│       │   ├── store/               # State persistence
│       │   ├── streaming/           # Streaming response handling
│       │   ├── theme/               # CRUSH theme (CharmUI-inspired)
│       │   ├── ui/                  # Ink components
│       │   └── utils/               # Utility functions
│       ├── package.json
│       └── tsconfig.json
│
├── FloydDesktopWeb/               # ✅ Desktop (Electron + Vite)
│       ├── src/
│       │   ├── App.tsx              # Main React app
│       │   ├── components/          # React UI components (Radix UI)
│       │   ├── hooks/               # React hooks
│       │   ├── theme/               # Visual theming
│       │   ├── server/              # Express server
│       │   └── index.tsx            # Entry point
│       ├── server/
│       │   ├── index.ts            # Express server with WebSocket MCP
│       │   └── ws-mcp-server.ts   # WebSocket MCP for Chrome extension
│       ├── package.json
│       ├── tsconfig.json
│       ├── tsconfig.server.json
│       └── vite.config.ts
│
├── FloydChromeBuild/
│   └── floydchrome/                 # ✅ Chrome Extension
│       ├── src/
│       │   ├── manifest.json         # Extension manifest v3
│       │   ├── background/           # Service worker
│       │   ├── popup/               # Extension popup UI
│       │   └── content/             # Content scripts
│       ├── package.json
│       └── tsconfig.json
│
├── .floyd/                          # Floyd runtime data
│   ├── sessions/                     # JSON session files
│   ├── cache/                        # SUPERCACHE storage
│   ├── status/                       # Agent status files
│   ├── obsidian-vaults.json          # Vault configuration
│   └── *.json                        # Floyd configuration files
│
├── docs/                            # Documentation
│   ├── agents.md                    # This file
│   ├── Floyd-CLI_SSOT.md            # Project SSOT
│   └── *.md                         # Supporting docs
│
└── .floyd/                          # Floyd configuration
    ├── P0_CRITICAL_BUGS.md          # 77 validated bugs
    ├── P0_IMPLEMENTATION_PLAN.md    # Phased execution plan
    └── AGENT_ORCHESTRATION.md       # Multi-agent coordination (legacy)

```

---

## Essential Commands

### Workspace-Level Commands

```bash
# Install all workspace dependencies
npm run install:all

# Type-check all packages (CI command)
npm run type-check

# Build specific packages
npm run build:core           # packages/floyd-agent-core
npm run build:web            # FloydDesktopWeb
npm run type-check           # Full type-check across all packages

# Development servers
npm run dev:web             # Start FloydDesktopWeb (http://localhost:3001)
```

### floyd-agent-core (`packages/floyd-agent-core/`)

```bash
cd packages/floyd-agent-core

# Build TypeScript
npm run build

# Watch mode
npm run watch

# Clean dist
npm run clean
```

### Floyd CLI (`INK/floyd-cli/`)

```bash
cd INK/floyd-cli

# Development mode (watch + auto-restart)
npm run dev

# Production build
npm run build

# Start compiled CLI
npm run start

# Run tests (AVA test framework)
npm run test
npm run test:watch
npm run test:components
npm run test:modules
npm run test:build
npm run test:runtime

# Lint check (Prettier)
npm run lint
```

### FloydDesktopWeb (`FloydDesktopWeb/`)

```bash
cd FloydDesktopWeb

# Development mode (server + client)
npm run dev

# Development: Server only
npm run dev:server

# Development: Client only
npm run dev:client

# Production build
npm run build

# Start production server
npm run start

# Run tests (Vitest)
npm run test
npm run test:ui
npm run test:run
```

### FloydChrome (`FloydChromeBuild/floydchrome/`)

```bash
cd FloydChromeBuild/floydchrome

# Development mode (watch build)
npm run dev

# Production build
npm run build

# Type-check only
npm run typecheck
```

---

## Code Organization

### TypeScript Configuration

All packages use TypeScript with consistent configuration:

```json
{
  "compilerOptions": {
    "outDir": "dist",
    "target": "ES2020",
    "lib": ["ES2020", "DOM"],
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "module": "esnext",
    "jsx": "react-jsx",
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "types": ["node"]
  }
}
```

### Module Resolution

- **floyd-agent-core:** Uses `bundler` resolution
- **floyd-cli:** Uses `bundler` resolution
- **FloydDesktopWeb:** Path aliases via Vite (`@': ./src`)
- **FloydChrome:** Uses standard ES modules

### Entry Points

| Package | Entry Point | Location |
|----------|-------------|------------|
| floyd-agent-core | `src/index.ts` | Exports AgentEngine, MCPClientManager, SessionManager, PermissionManager |
| floyd-cli | `src/cli.tsx` | CLI root with meow, renders `App.tsx` |
| FloydDesktopWeb | `src/main.tsx` (client), `server/index.ts` (server) | React app + Express server |
| FloydChrome | `src/background.ts` | Chrome service worker |

---

## Naming Conventions

### File Names

- **Components:** PascalCase (`AgentSettings.tsx`, `SessionSidebar.tsx`)
- **Utilities:** camelCase (`file-helpers.ts`, `path-utils.ts`)
- **Modules:** kebab-case (`agent-manager.ts`, `browser-server.ts`)
- **Constants:** UPPER_SNAKE_CASE with suffix (`DEFAULT_CONFIG`, `PROVIDER_DEFAULTS`)
- **Types:** PascalCase (`interface AgentPlan`, `type SwarmRole`)

### Variable Names

- **Constants:** UPPER_SNAKE_CASE (`MAX_RECONNECT_ATTEMPTS`, `RECONNECT_INTERVAL`)
- **Functions:** camelCase (`sendMessage`, `handleMessage`)
- **Classes:** PascalCase (`MCPBrowserServer`, `AgentEngine`)
- **Interfaces:** PascalCase with `I` prefix (`ISubtask`, `IWorkerResult`)
- **Types:** PascalCase without `I` prefix (`AgentPlan`, `WorkerResult`)

### Import Patterns

- **Relative imports:** Use `./` for same directory, `../` for parent
- **Package imports:** Use `@modelcontextprotocol/sdk`, `@anthropic-ai/sdk` from node_modules
- **Workspace imports:** Use absolute paths from package root (e.g., `from '../agent/manager'`)

---

## Style Patterns

### React Components (CLI - Ink)

```typescript
import React from 'react';
import { Box, Text } from 'ink';
import { useFocus } from 'ink';

export default function MyComponent() {
  return (
    <Box>
      <Text>Hello, World</Text>
    </Box>
  );
}
```

**Key patterns:**

- Use functional components with hooks
- Import components from `ink`
- No class components
- Use `useFocus`, `useInput`, `useApp` hooks

### React Components (Desktop - Radix UI)

```typescript
import * as Dialog from '@radix-ui/react-dialog';
import { useState } from 'react';

export function MyDialog() {
  const [open, setOpen] = useState(false);

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger>Open</Dialog.Trigger>
      <Dialog.Content>
        <Dialog.Title>Title</Dialog.Title>
      </Dialog.Content>
    </Dialog.Root>
  );
}
```

**Key patterns:**

- Use Radix UI primitives
- Named imports (`import * as Dialog`)
- State management with `useState`
- Props interfaces if needed

### MCP Server Pattern

```typescript
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { CallToolRequestSchema } from '@modelcontextprotocol/sdk/types.js';

export class MyMcpServer {
  private server: Server;

  constructor() {
    this.server = new Server(
      {
        name: 'my-server-name',
        version: '0.1.0',
      },
      {
        capabilities: {
          tools: {},
        },
      },
    );

    this.setupHandlers();
  }

  private setupHandlers(): void {
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      // Handle tool calls
    });
  }
}
```

**Key patterns:**

- Extend `Server` from MCP SDK
- Set up handlers in constructor or separate method
- Use JSON-RPC 2.0 message types
- Handle `params` and return `result` or `error`

---

## Testing Approach

### floyd-cli (AVA Test Framework)

```bash
# Run all tests
npm run test

# Watch mode
npm run test:watch

# Component tests only
npm run test:components

# Module resolution tests
npm run test:modules

# Build verification tests
npm run test:build

# Runtime verification tests
npm run test:runtime
```

**Test locations:**

- `src/ui/components/__tests__/` - Component tests
- `src/__tests__/` - Unit and integration tests
- `src/__tests__/build-verification.test.ts` - Build verification
- `src/__tests__/runtime-verification.test.ts` - Runtime verification

### FloydDesktopWeb (Vitest Test Framework)

```bash
# Run all tests
npm run test

# UI mode
npm run test:ui

# Run once
npm run test:run
```

**Test configuration:**

- Framework: Vitest
- Environment: jsdom
- Include: `src/**/*.{test,spec}.{js,ts,tsx}`
- Exclude: `node_modules`, `dist`, `dist-server`
- Setup: `src/test-setup.ts`

**Path aliases in tests:**

- `@'` maps to `./src`

---

## Important Gotchas

### 1. TypeScript Build Order

**Issue:** Packages depend on each other, must build in correct order.

**Solution:**

```bash
# Build shared core first
cd packages/floyd-agent-core && npm run build

# Then build dependent packages
cd INK/floyd-cli && npm run build
cd FloydDesktopWeb && npm run build
```

**CI workflow:** Uses matrix to build all packages in parallel.

### 2. Terminal Size Requirements (CLI)

**Issue:** CLI requires minimum terminal size.

**Check:** `INK/floyd-cli/src/cli.tsx`

```typescript
const MIN_ROWS = 20;
const MIN_COLS = 80;
```

**Behavior:** If terminal is too small, CLI exits with error message.

### 3. Exit Signal Handling

**Issue:** CLI needs proper signal handling for quit commands.

**Keys:**

- `Ctrl+Q` (SIGQUIT): Definitive quit
- `Ctrl+C` (SIGINT): Failsafe quit

**Implementation:** Both signals call `process.exit(0)` immediately.

### 4. WebSocket Reconnection (Chrome Extension)

**Issue:** Chrome extension connects to Floyd via WebSocket, needs reconnection logic.

**Pattern:**

```typescript
private reconnectAttempts = 0;
private maxReconnectAttempts = 10;
private reconnectInterval = 3000;

// Exponential backoff recommended for production
```

### 5. MCP Tool Aggregation

**Issue:** Tools from multiple MCP servers must be aggregated into single list.

**Solution:** `MCPClientManager` collects tools from all connections and provides unified interface.

### 6. Session Persistence

**Issue:** Sessions must persist across CLI restarts.

**Pattern:**

```typescript
// Sessions stored in .floyd/sessions/
// JSON format with metadata (id, created, updated, title, workingDirectory)
```

### 7. Permission Management

**Issue:** Tool calls require authorization for safety.

**Pattern:** `PermissionManager` uses wildcard patterns (e.g., `write_file:*` for all files).

### 8. P0 Bug Dependencies

**Issue:** 77 bugs have cross-dependencies, must fix in sequence.

**Reference:** `.floyd/P0_CRITICAL_BUGS.md` contains:

- Phase-based fix order
- Cross-bug dependency maps
- 98%+ confidence validated fixes

**CRITICAL:** Always read P0 bugs before starting work. Do not skip phases.

### 9. Archive Policy

**Issue:** Old components are retired, not deleted.

**Pattern:** Retired code moved to `.archive/YYYY-MM-DD-description/` for reference.

**Examples:**

- `.archive/2026-01-16-go-tui-retirement/` - Original Go Bubbletea TUI
- `.archive/2026-01-19-pre-p0-plan/` - Old roadmap docs

### 10. GLM vs Anthropic API Format

**Issue:** Floyd CLI uses GLM-4.7 (via api.z.ai) but Anthropic SDK expects Anthropic format.

**Current state:** Direct Anthropic SDK usage causes format mismatch.

**Future fix:** Planned `LLMClient` abstraction in P0 bugs Phase 1.

---

## Project-Specific Context

### Floyd CLI vs FloydDesktop

- **Floyd CLI:** Terminal-first, uses React Ink, handles streaming responses, displays with CRUSH theme
- **FloydDesktop:** Electron app, uses Radix UI, WebSocket MCP server, provider selection UI

### Chrome Extension Connection

- **Floyd CLI:** Can start WebSocket MCP server on `ws://localhost:3000`
- **FloydDesktop:** Starts WebSocket MCP server on `ws://localhost:3005`
- **Chrome Extension:** Auto-connects to available port (tries 3005, 3000, 3001, 3002, 3003, 3004)

### MCP Servers

**Built-in MCP servers in Floyd CLI:**

- `browser-server.ts` - Browser automation tools
- `cache-server.ts` - SUPERCACHE management
- `git-server.ts` - Git operations
- `patch-server.ts` - File patching
- `runner-server.ts` - Command execution
- `explorer-server.ts` - File system browsing

### Browork Sub-Agent System

**Location:** `INK/floyd-cli/src/agent/workers/`

**Purpose:** Disposable specialist agents with fresh context for single tasks.

**Examples:**

- `desktop.ts` - Desktop-specific tasks
- `chrome.ts` - Chrome extension tasks
- `browser.ts` - Browser automation
- `git.ts` - Git operations

### Prompt Library

**Location:** `INK/floyd-cli/src/prompts/`

**Purpose:** Reusable prompt templates for agent interactions.

**Pattern:** Template strings with interpolation for dynamic content.

### Theme System (CRUSH)

**Location:** `INK/floyd-cli/src/theme/`

**Purpose:** CharmUI-inspired visual design for CLI.

**Pattern:** Color definitions, component styles, visual hierarchy.

---

## Multi-Agent System

### Agent Roles

| Agent | Purpose | Context | Disposable? |
|--------|---------|-----------|
| Orchestrator | Spawns, monitors, verifies, disposes specialists | ❌ No (persistent) |
| DesktopSpec | FloydDesktop development | ✅ Yes (one task) |
| CLISpec | Floyd CLI + floyd-agent-core | ✅ Yes (one task) |
| ChromeSpec | FloydChrome extension | ✅ Yes (one task) |
| BroworkSpec | Sub-agent system | ✅ Yes (one task) |

### Agent Orchestration

**Reference:** `.floyd/AGENT_ORCHESTRATION.md` (legacy but contains philosophy)

**Process:**

1. Orchestrator spawns specialist with single task
2. Specialist executes with full context window
3. Specialist returns result and disposes
4. Orchestrator verifies result
5. Orchestrator spawns next specialist if needed

### Quality Gate

**Process:**

- 15-turn simulation of all work
- 3-round smoke tests
- Only pass if all simulations succeed
- Handoff documentation required

---

## Documentation Hierarchy

### Single Source of Truth (SSOT)

| Document | Purpose | Stability |
|-----------|---------|-----------|
| `.floyd/P0_CRITICAL_BUGS.md` | **PRIMARY**: 77 validated bugs with fixes | Authoritative |
| `.floyd/P0_IMPLEMENTATION_PLAN.md` | **PRIMARY**: Phased execution plan | Authoritative |
| `Claude.md` | Agent rules and patterns | Stable |
| `docs/agents.md` | This file - agent reference | Authoritative |
| `docs/Floyd-CLI_SSOT.md` | Project structure and tech stack | Reference |
| `.floyd/AGENT_ORCHESTRATION.md` | Multi-agent coordination | Reference |

### Critical Rules (from Claude.md)

1. **Your brief existence has meaning** - One small, completable piece of work
2. **The Boy Scout Rule** - Leave docs and context cleaner than you found them
3. **No reward for speed** - Quality is only metric
4. **Legacy is your handoff** - Only your code and docs remain when you're gone

### Before Starting Work

1. Read `.floyd/P0_CRITICAL_BUGS.md` for current priorities
2. Read `.floyd/AGENT_ORCHESTRATION.md` for multi-agent context
3. Read relevant component's SSOT docs
4. Understand your specific role and exit criteria

---

## Environment & Configuration

### Node.js Version

- **Required:** Node.js 20+
- **Current:** `package.json` specifies `node-version: '20'` in CI

### Package Managers

- **Workspace:** npm (uses `npm ci` for CI)
- **Individual packages:** npm (each has own `package-lock.json`)

### Environment Variables

**Used by:**

- `ANTHROPIC_API_KEY` - Anthropic API access
- `GLM_API_KEY` - GLM-4.7 API access
- `OPENAI_API_KEY` - OpenAI API access (future)
- `FLOYD_HOME` - Floyd data directory (defaults to `.floyd/`)

### Floyd Data Directory

**Location:** `.floyd/`

**Contents:**

- `sessions/` - JSON session files
- `cache/` - SUPERCACHE storage (reasoning, project, vault)
- `status/` - Agent status files (JSON)
- `*.json` - Floyd configuration files
- `obsidian-vaults.json` - Vault configuration
- `*.json` - MCP server configurations

---

## Dependencies & APIs

### Core Dependencies

```json
{
  "@anthropic-ai/sdk": "^0.71.2",
  "@modelcontextprotocol/sdk": "^1.25.2",
  "ws": "^8.18.0",
  "uuid": "^13.0.0"
}
```

### CLI-Specific Dependencies

```json
{
  "ink": "^4.x",
  "meow": "^12.x",
  "react": "^18.x",
  "chokidar": "^3.6.0"
}
```

### Desktop-Specific Dependencies

```json
{
  "@radix-ui/react-*": "^1.x",
  "vite": "^6.x",
  "react": "^18.x",
  "class-variance-authority": "^0.7.1",
  "clsx": "^2.1.1"
}
```

### Chrome-Specific Dependencies

```json
{
  "@types/chrome": "^0.0.298",
  "vite": "^6.x"
}
```

---

## Common Issues & Solutions

### Issue: "Cannot find module '@anthropic-ai/sdk'"

**Solution:**

```bash
cd packages/floyd-agent-core
npm ci
```

### Issue: "Terminal too small" error

**Solution:** Resize terminal to at least 80x20

### Issue: "Type check failed" after changes

**Solution:**

```bash
# Run type-check to see errors
npm run type-check

# Or rebuild specific package
cd INK/floyd-cli && npm run build
```

### Issue: Chrome extension not connecting

**Solution:**

1. Start FloydDesktopWeb (`npm run dev:web`) or Floyd CLI (`npm run dev`)
2. Check if WebSocket server is running (`lsof -i :3005` or `:3000`)
3. Reload Chrome extension

### Issue: "Permission denied" for file operations

**Solution:** Check `.floyd/` permissions:

```bash
chmod -R 755 .floyd/
```

### Issue: "Module not found" errors

**Solution:** Build dependencies in order:

```bash
cd packages/floyd-agent-core && npm run build
cd INK/floyd-cli && npm run build
cd FloydDesktopWeb && npm run build
```

---

## Status & Health Checks

### Checking Build Status

```bash
# Full type-check across all packages
npm run type-check

# Check CI workflow
cat .github/workflows/type-check.yml
```

### Checking Agent Status

```bash
# Check status directory
ls -la .floyd/status/

# Read latest status (JSON)
cat .floyd/status/*.json
```

### Checking Session Health

```bash
# List all sessions
ls -la .floyd/sessions/

# Read a session
cat .floyd/sessions/session-id.json
```

---

## Quick Reference

### Starting Floyd CLI

```bash
cd INK/floyd-cli
npm run dev
```

### Starting FloydDesktopWeb

```bash
cd FloydDesktopWeb
npm run dev:web
```

### Building Chrome Extension

```bash
cd FloydChromeBuild/floydchrome
npm run build
```

### Running Tests

```bash
# CLI tests
cd INK/floyd-cli && npm run test

# Web tests
cd FloydDesktopWeb && npm run test
```

### Type-Checking

```bash
# All packages
npm run type-check

# Specific package
cd INK/floyd-cli && npm run build
```

---

**Last Updated:** 2026-01-21
**Next Review:** After P0 bug implementation completes
