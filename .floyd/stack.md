# Technology Stack (FLOYD)

**Last Updated:** 2026-01-27 (Build Verification Complete)
**Primary Language:** TypeScript 5.8+

---

## Core Frameworks

### Language & Runtime
- [x] TypeScript 5.8+ (primary language)
- [x] Node.js >=16 (CLI), >=20 (wrapper)
- [x] ESM modules ( `"type": "module"` )

### UI Frameworks
- [x] React 18.3.1 (components)
- [x] Ink 4.1.0 (CLI TUI)
- [x] Electron 40.0.0 (desktop wrapper)
- [x] Vite 6.4.1 (bundler)

### State Management
- [x] Zustand 5.0.2 (client state)
- [x] JSON file persistence (.floyd/)
- [x] SQLite (better-sqlite3) for history

---

## Component Stack

| Component | Framework | Build Tool | Status |
|-----------|-----------|------------|--------|
| floyd-agent-core | TypeScript | tsc | ✅ Building |
| INK/floyd-cli | Ink + React | tsc | ✅ Building |
| floyd-wrapper-main | TypeScript | tsc + tsc-alias | ✅ Building |
| FloydDesktopWeb | React + Vite | Vite 6.4.1 | ✅ Building |
| FloydChrome | TypeScript + Vite | Vite 6.4.1 | ✅ Building |

---

## AI Integration

### LLM Providers
- [x] GLM-4.7 via https://api.z.ai (OpenAI-compatible)
- [x] Anthropic Claude via @anthropic-ai/sdk
- [x] OpenAI via openai SDK
- [x] DeepSeek API support

### MCP (Model Context Protocol)
- [x] @modelcontextprotocol/sdk v1.25.2
- [x] MCPClientManager (floyd-agent-core)
- [x] WebSocket server support
- [x] Stdio transport support

---

## Build System

### Monorepo Configuration
```json
{
  "workspaces": [
    "packages/*",
    "INK/floyd-cli",
    "FloydChromeBuild/floydchrome",
    "FloydDesktopWeb"
  ]
}
```

### Build Commands
```bash
npm run build:core    # packages/floyd-agent-core
npm run build:cli     # INK/floyd-cli
npm run build:web     # FloydDesktopWeb
npm run build:chrome  # FloydChromeBuild/floydchrome
```

### Build Verification (2026-01-27)
All 5 components build successfully - see `.floyd/.swarm-coordination/MASTER_BUILD_REPORT.md`

---

## File Operations (via Tools)

| Tool | Purpose | Status |
|------|---------|--------|
| Read | File reading | ✅ |
| Write | File writing | ✅ |
| Edit | String replacement | ✅ |
| Bash | Shell execution | ✅ |
| Glob | Pattern matching | ✅ |
| Grep | Regex search | ✅ |
| MCP | Dynamic tool loading | ✅ |

---

## Feature Implementation Status

### Core Agent System
- [x] AgentEngine (orchestration)
- [x] PermissionManager (risk-based)
- [x] SessionManager (persistence)
- [x] LLMClient abstraction (multi-provider)

### Execution Modes (floyd-wrapper)
- [x] ASK (default - prompt before actions)
- [x] YOLO (auto-approve safe tools)
- [x] PLAN (analyze, don't execute)
- [x] AUTO (agent decides mode)
- [x] DIALOGUE (quick chat)
- [x] FUCKIT (no restrictions)

### Safety Systems
- [x] Checkpoint/rewind system
- [x] Sandbox mode
- [x] Risk classifier (LOW/MEDIUM/HIGH)
- [x] Permission scopes (once/session/always)

### SUPERCACHE Engine
- [x] .floyd/.cache/ directory structure
- [x] Reasoning cache (5 min)
- [x] Project cache (24h)
- [x] Vault cache (7 days)

---

## Retired Technologies (Archived 2026-01-16)

The following have been archived to `.archive/2026-01-16-go-tui-retirement/`:
- ~~Go 1.21+~~
- ~~Bubbletea TUI framework~~
- ~~Lipgloss styling~~
- ~~go_command_registry_v2 pattern~~
- ~~Effect registry in Go~~

---

## Verification Receipt

```
Build Verification Date: 2026-01-27
Result: 5/5 components PASS (100%)

packages/floyd-agent-core:    EXIT 0
INK/floyd-cli:                EXIT 0
floyd-wrapper-main:           EXIT 0
FloydDesktopWeb:              EXIT 0
FloydChromeBuild/floydchrome: EXIT 0
```

See `.floyd/.swarm-coordination/MASTER_BUILD_REPORT.md` for full receipts.
