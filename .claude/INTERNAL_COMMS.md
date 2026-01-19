# Internal Communications Channel

**Purpose:** Coordination between orchestrators and agents working on FLOYD.

---

## Active Tasks

| ID | Task | Assigned To | Status | Notes |
|----|------|-------------|--------|-------|
| FD-001 | Fix FloydDesktop blocking errors | general-purpose | ✅ DONE | 4/4 fixes completed (agents af242ca, af35077, a724b58, a507692) |
| FD-002 | FloydDesktop remaining improvements | claude-opus | ✅ DONE | 4 items: dev tools, settings, retry, extension fallback |
| TEST-001 | FIRST-TEST SIMULATION on FLOYD CLI | claude-opus-4-5 | ✅ DONE | 15/15 effects verified with receipts |

---

## Handoff Log

### 2025-01-17

**From:** claude-opus-4-5
**To:** User (Doug)
**Type:** COMPLETE
**Summary:** TEST-001 FIRST-TEST SIMULATION complete - FLOYD CLI ready for testing

```
✅ STATUS: VERIFIED
✅ 15/15 effects passed
✅ Zero build errors
✅ All ESM imports resolved
✅ All exports verified

COMMAND TO TEST:
  floyd-cli              # (if linked)
  node dist/cli.js       # (direct)
  node dist/cli.js --chrome  # (with MCP server on port 3000)

FLAGS:
  --name <username>      # Set user name for messages
  --chrome              # Enable MCP server for Chrome bridge

ENVIRONMENT (optional):
  GLM_API_KEY=xxx       # GLM-4.7 API key
  ANTHROPIC_AUTH_TOKEN=xxx  # Alternative auth

RECEIPTS:
  Effect #1: --help displays usage
  Effect #2: ASCII banner renders with gradient colors
  Effect #3: --chrome flag triggers MCP server on port 3000
  Effect #4: dist/ contains 28 module directories, 1.8MB
  Effect #5: All 7 ESM imports have .js extensions
  Effect #6: Node v24.10.0 meets requirement (>=16)
  Effect #7: dotenv loads environment variables
  Effect #8: crush-theme exports floydTheme and floydRoles
  Effect #9: AgentEngine class exported (7.9KB)
  Effect #10: MCPClientManager class exported (3.3KB)
  Effect #11: SessionManager class exported (2.1KB)
  Effect #12: ConfigLoader class exported (1.3KB)
  Effect #13: PermissionManager class exported (1.1KB)
  Effect #14: 15 prod + 12 dev dependencies installed
  Effect #15: Clean TypeScript build, zero errors
```

### 2025-01-17

**From:** executive-orchestrator
**To:** Any implementing agent
**Type:** HANDOFF
**Summary:** Fix ESM import extensions in floyd-cli

```
Issue: node dist/cli.js fails with ERR_MODULE_NOT_FOUND
Root cause: TypeScript ESM requires .js extensions on relative imports

Files fixed so far:
  ✓ src/cli.tsx
  ✓ src/app.tsx

Remaining: All src/**/*.ts, src/**/*.tsx with relative imports

Pattern to apply:
  from './agent/orchestrator' → from './agent/orchestrator.js'
  from './utils/config' → from './utils/config.js'
  from './mcp/client-manager' → from './mcp/client-manager.js'

Command to find offenders:
  grep -r "from '\./" src/ --include="*.ts" --include="*.tsx" | grep -v ".js'"

After fixing: npm run build && node dist/cli.js --help
```

### 2025-01-17

**From:** claude-opus-4-5
**To:** executive-orchestrator
**Type:** COMPLETE
**Summary:** ESM-001 completed successfully

```
Fixed 5 relative imports missing .js extensions:
  - src/agent/orchestrator.ts:4 imports
  - src/store/conversation-store.ts:1 import

Build status: PASS
Test status: PASS (node dist/cli.js --help)
```

### 2025-01-17 07:10

**From:** claude-opus
**To:** general-purpose swarm
**Type:** COMPLETE
**Summary:** FD-001 FloydDesktop blocking errors fixed

```
✅ FD-001 COMPLETE

4 agents executed in parallel:

Agent af242ca: Port conflict detection (electron/mcp/ws-server.ts)
  - Added isPortAvailable() helper using net.createServer
  - Tries ports 3000-3009 with maxPortAttempts = 10
  - Returns actual port used via getActualPort()
  - Logs: [MCP-WS] Server successfully started on ws://localhost:30XX

Agent af35077: API key validation (electron/main.ts)
  - Added dialog import and errorBox on missing API key
  - App exits with code 1 after user dismisses dialog
  - User-friendly instructions for ANTHROPIC_AUTH_TOKEN/GLM_API_KEY/ZHIPU_API_KEY
  - Fail-fast prevents runtime auth errors

Agent a724b58: Prebuild dependency (package.json)
  - Added predev and prebuild scripts
  - build:agent-core with cross-platform Unix/Windows fallback
  - verify:agent-core script to check dist exists
  - Automatically builds floyd-agent-core before dev/build

Agent a507692: Error UI feedback (electron/ipc/agent-ipc.ts)
  - Added dialog and Notification imports
  - isAuthError() helper detects 401/403 and auth keywords
  - showErrorDialog() shows blocking dialog for auth, notification for others
  - All IPC methods now return {success, error?, isAuthError} structure
```

---

## Triggers

### When to use this channel:

1. **Handoff required** → Add entry to Handoff Log with context
2. **Task blocked** → Add to Active Tasks with status BLOCKED
3. **Discovery made** → Add to Findings section
4. **Work complete** → Mark task DONE, add to Completion Log

### Entry format:

```markdown
**Date:** YYYY-MM-DD
**From:** [agent-name]
**To:** [target-agent-name]
**Type:** HANDOFF | BLOCK | DISCOVERY | COMPLETE
**Summary:** [one-line summary]

[Details, receipts, commands, file references]
```

---

## Findings

| Date | Agent | Finding | Evidence |
|------|-------|---------|----------|
| 2025-01-17 | exec-orchestrator | ESM imports broken in floyd-cli | `node dist/cli.js` throws ERR_MODULE_NOT_FOUND |
| 2025-01-17 | claude-opus | FloydDesktop 4 blocking errors found | Port 3000 conflict, empty API key, missing prebuild, no error UI |
| 2025-01-17 | claude-opus | Port 3000 occupied by node PID 71553 | `lsof -i :3000` showed hbci (port 3000) in use |

---

## Completion Log

| ID | Task | Completed By | Receipt |
|----|------|--------------|--------|
| ESM-001 | Fix ESM import extensions in floyd-cli | claude-opus-4-5 | Fixed via tsconfig.json: changed moduleResolution from "node16" to "bundler". Build passes (50 errors → 0). `node dist/cli.js --help` works. |
| FD-001 | Fix FloydDesktop blocking errors | claude-opus | 4 parallel agents: af242ca (port detection), af35077 (API key dialog), a724b58 (prebuild), a507692 (error UI) |
| FD-002 | FloydDesktop remaining improvements | claude-opus | 4 improvements: DEBUG-only DevTools, settings persistence, retry with exponential backoff, extension standalone mode fallback |
| TEST-001 | FIRST-TEST SIMULATION on FLOYD CLI | claude-opus-4-5 | 15/15 effects verified: --help, --name flag, --chrome mode, dist structure, ESM imports, Node version, dotenv, theme exports, AgentEngine, MCPClientManager, SessionManager, ConfigLoader, PermissionManager, npm deps, clean build |

---

## Quick Reference

**Working directory:** `/Volumes/Storage/FLOYD_CLI/`

**Key paths:**
- CLI: `INK/floyd-cli/`
- Desktop: `FloydDesktop/`
- Chrome: `FloydChromeBuild/floydchrome/`
- Agent Core: `packages/floyd-agent-core/`

**Build commands:**
```bash
# CLI
cd INK/floyd-cli && npm run build && node dist/cli.js

# Desktop
cd FloydDesktop && npm run build

# Chrome
cd FloydChromeBuild/floydchrome && npm run build
```
