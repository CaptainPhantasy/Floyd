# Build Error Resolution - Complete Fix Guide

**Date:** 2026-01-21
**Issue:** Floyd CLI build fails with "missing required parameter" and dependency issues

---

## Problem Summary

### Issues Identified

1. **Missing floyd-agent-core Build**
   - Floyd CLI depends on `floyd-agent-core` as a local file dependency
   - The agent-core package has no compiled `dist/` directory
   - TypeScript can't resolve the dependency

2. **Bash Tool Failure** (Environment Issue)
   - All bash commands return: `missing required parameter: description`
   - This appears to be a tool wrapper or environment issue

3. **Missing Root Build Scripts**
   - Root `package.json` lacked `build:cli` and combined `build` scripts
   - No easy way to build entire workspace in correct order

---

## Solutions Implemented

### ✅ Solution 1: Updated Root package.json

**File:** `/Volumes/Storage/FLOYD_CLI/package.json`

**Changes:**
- Added `build` script that builds agent-core then CLI
- Added `build:cli` script for CLI-only builds
- Added `rebuild` script to clean then build all
- Added `clean` script to remove all dist directories

**New Scripts:**
```json
{
  "scripts": {
    "build": "npm run build:core && npm run build:cli",
    "build:cli": "cd INK/floyd-cli && npm run build",
    "rebuild": "npm run clean && npm run build",
    "clean": "rm -rf packages/floyd-agent-core/dist INK/floyd-cli/dist FloydDesktopWeb/dist"
  }
}
```

### ✅ Solution 2: Created Build Shell Script

**File:** `/Volumes/Storage/FLOYD_CLI/scripts/build-all.sh`

**Features:**
- Builds agent-core first (dependency)
- Builds CLI second
- Cleans existing dist directories before building
- Verifies dist directories exist
- Provides clear progress output
- Exit on error (`set -e`)

**Usage:**
```bash
chmod +x scripts/build-all.sh
./scripts/build-all.sh
```

### ✅ Solution 3: Documentation

**Files Created:**
- `docs/BUILD_FIX.md` - Detailed problem analysis and solution
- `docs/GIT_DIFF_IMPLEMENTATION.md` - Git diff tool documentation

---

## How to Fix the Build

### Method 1: Using Root npm Scripts (Recommended)

```bash
cd /Volumes/Storage/FLOYD_CLI

# Clean existing builds (optional)
npm run clean

# Build everything in correct order
npm run build

# Or rebuild from scratch
npm run rebuild
```

### Method 2: Using Build Shell Script

```bash
cd /Volumes/Storage/FLOYD_CLI

# Make script executable (first time only)
chmod +x scripts/build-all.sh

# Run build
./scripts/build-all.sh
```

### Method 3: Manual Step-by-Step

```bash
# Step 1: Build agent-core
cd /Volumes/Storage/FLOYD_CLI/packages/floyd-agent-core
npm run build

# Verify dist directory exists
ls -la dist/

# Step 2: Build CLI
cd /Volumes/Storage/FLOYD_CLI/INK/floyd-cli
npm run build

# Verify CLI dist directory exists
ls -la dist/
```

---

## Verification Steps

### Check Agent Core Build
```bash
ls /Volumes/Storage/FLOYD_CLI/packages/floyd-agent-core/dist
```

**Expected Output:**
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

### Check CLI Build
```bash
ls /Volumes/Storage/FLOYD_CLI/INK/floyd-cli/dist
```

**Expected Output:**
```
agent/
app.js
cache/
cli.js
commands/
... (all compiled files)
```

### Test CLI Startup
```bash
cd /Volumes/Storage/FLOYD_CLI/INK/floyd-cli
npm start
```

**Expected:** Floyd CLI starts with greeting message

---

## Dependency Graph

```
floyd-agent-core (package)
    ↓ (local file dependency)
floyd-cli (INK/floyd-cli/)
    ↓ (imports)
floyd-agent-core/dist/
```

**Important:** `floyd-agent-core` MUST be built before `floyd-cli` because:
1. CLI package.json: `"floyd-agent-core": "file:../../packages/floyd-agent-core"`
2. Agent core package.json: `"main": "./dist/index.js"`
3. TypeScript resolves `./dist/index.js` at compile time

---

## Common Issues and Solutions

### Issue: Cannot find module 'floyd-agent-core'

**Symptoms:**
```
error TS2307: Cannot find module 'floyd-agent-core' or its corresponding type declarations.
```

**Cause:** Agent core dist directory doesn't exist

**Solution:**
```bash
cd packages/floyd-agent-core
npm run build
```

### Issue: Build succeeds but runtime fails

**Symptoms:**
- Build completes without errors
- Running `npm start` fails with module not found

**Cause:** Agent core not installed/built correctly

**Solution:**
```bash
# Clean and rebuild
npm run clean
npm run build

# Verify dist structure
ls packages/floyd-agent-core/dist/
```

### Issue: File watcher doesn't pick up agent-core changes

**Symptoms:**
- Modifying agent-core source doesn't rebuild CLI
- Have to manually rebuild

**Solution:** Run separate watch processes

```bash
# Terminal 1
cd packages/floyd-agent-core
npm run watch

# Terminal 2
cd INK/floyd-cli
npm run dev
```

---

## Development Workflow Recommendations

### After Agent Core Changes
```bash
cd packages/floyd-agent-core
npm run build

# CLI will use new build automatically
```

### After CLI Changes
```bash
cd INK/floyd-cli
npm run build
```

### After Both Changed
```bash
# From project root
npm run rebuild
```

---

## Pre-commit Hook (Optional)

Create `.git/hooks/pre-commit`:

```bash
#!/bin/bash
echo "🔨 Pre-commit: Building packages..."

# Build agent-core
cd packages/floyd-agent-core
npm run build

# Build CLI
cd ../../INK/floyd-cli
npm run build

echo "✅ Build complete. Proceeding with commit..."
```

Make executable:
```bash
chmod +x .git/hooks/pre-commit
```

---

## CI/CD Integration

For automated builds, use this sequence:

```yaml
build:
  steps:
    - name: Install dependencies
      run: npm ci

    - name: Build agent core
      run: npm run build:core

    - name: Build CLI
      run: npm run build:cli

    - name: Verify builds
      run: |
        test -d packages/floyd-agent-core/dist
        test -d INK/floyd-cli/dist

    - name: Run tests
      run: npm test
```

---

## Additional Resources

### Documentation
- `docs/BUILD_FIX.md` - Detailed problem analysis
- `docs/GIT_DIFF_IMPLEMENTATION.md` - Git diff tool docs
- `docs/Floyd-CLI_SSOT.md` - Project documentation

### Scripts
- `scripts/build-all.sh` - Complete build automation
- `scripts/verify-git-diff-tool.ts` - Git diff tool verification

### Package Scripts
- Root `package.json` - `build`, `rebuild`, `clean` commands
- `packages/floyd-agent-core/package.json` - `build`, `watch` commands
- `INK/floyd-cli/package.json` - `build`, `dev`, `start` commands

---

## Status

✅ **FIX APPLIED**

- Root package.json updated with build scripts
- Build shell script created
- Documentation completed
- Ready for use

**To apply the fix:**
```bash
cd /Volumes/Storage/FLOYD_CLI
npm run build
```
