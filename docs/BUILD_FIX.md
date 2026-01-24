# Floyd CLI Build Fix

**Issue:** Build fails because `floyd-agent-core` dependency is not compiled

**Status:** ✅ Identified and Fix Documented

---

## Problem Analysis

### Root Cause
Floyd CLI has a local file dependency on `floyd-agent-core`:

```json
// INK/floyd-cli/package.json:38
"floyd-agent-core": "file:../../packages/floyd-agent-core",
```

The `floyd-agent-core` package expects its compiled files to be available:

```json
// packages/floyd-agent-core/package.json:6-7
"main": "./dist/index.js",
"types": "./dist/index.d.ts",
```

However, the `dist/` directory doesn't exist in `packages/floyd-agent-core/`, causing the build to fail.

### Evidence
```
packages/floyd-agent-core/
├── src/              ✅ Source files exist
├── dist/             ❌ Missing! (required by package.json)
├── package.json
└── tsconfig.json
```

---

## Solution

### Fix 1: Build floyd-agent-core First

**Step 1:** Build the agent core package
```bash
cd /Volumes/Storage/FLOYD_CLI/packages/floyd-agent-core
npm run build
```

This will create the `dist/` directory with compiled JavaScript.

**Step 2:** Build Floyd CLI
```bash
cd /Volumes/Storage/FLOYD_CLI/INK/floyd-cli
npm run build
```

### Fix 2: Add Build Script to Root

Create a root-level build script that builds packages in correct order:

```json
// package.json (root)
{
  "scripts": {
    "build": "npm run build:agent-core && npm run build:cli",
    "build:agent-core": "cd packages/floyd-agent-core && npm run build",
    "build:cli": "cd INK/floyd-cli && npm run build",
    "clean": "rm -rf packages/floyd-agent-core/dist INK/floyd-cli/dist"
  }
}
```

**Usage:**
```bash
cd /Volumes/Storage/FLOYD_CLI
npm run build
```

---

## Verification

### Check floyd-agent-core dist exists
```bash
ls packages/floyd-agent-core/dist/
```

Expected output:
```
agent/
index.d.ts
index.js
llm/
mcp/
permissions/
store/
utils/
```

### Test Floyd CLI build
```bash
cd INK/floyd-cli
npm run build
```

Expected output:
```
(no errors)
```

Check dist directory:
```bash
ls INK/floyd-cli/dist/
```

---

## Development Workflow

### Recommended Build Order

1. **Make changes to agent-core** → Build agent-core
2. **Make changes to CLI** → Build CLI (agent-core already built)
3. **Make changes to both** → Clean all → Build agent-core → Build CLI

### Quick Rebuild During Development

```bash
# From root
npm run clean && npm run build
```

Or with watch mode:

```bash
# Terminal 1: Watch agent-core
cd packages/floyd-agent-core
npm run watch

# Terminal 2: Watch CLI
cd INK/floyd-cli
npm run dev  # Runs tsc --watch & starts CLI
```

---

## Common Build Errors

### Error: Cannot find module 'floyd-agent-core'
**Cause:** Agent core not built
**Fix:** `cd packages/floyd-agent-core && npm run build`

### Error: Module not found: Can't resolve './agent/AgentEngine'
**Cause:** dist/index.js references non-existent compiled files
**Fix:** Rebuild agent-core

### Error: TS2307: Cannot find module
**Cause:** TypeScript can't resolve file dependency
**Fix:** Ensure agent-core dist exists and has correct structure

---

## Automation

### Pre-commit Hook
Add to `.git/hooks/pre-commit`:
```bash
#!/bin/bash
cd packages/floyd-agent-core && npm run build
cd ../../INK/floyd-cli && npm run build
```

### Watch Script
Create `scripts/watch.sh`:
```bash
#!/bin/bash
cd packages/floyd-agent-core && npm run watch &
cd ../../INK/floyd-cli && npm run watch
```

---

**Fixed:** 2026-01-21
**Status:** Ready for implementation
