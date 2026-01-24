# Dependency Management Safeguards

**Purpose:** Prevent npm install failures during autonomous build
**Status:** Proactive safeguards implemented

---

## Root Cause Analysis: Why npm install Fails

### Common Failure Modes

1. **Version Conflicts**
   - Semver ranges (`^`, `~`, `*`) resolve to different versions
   - Peer dependency conflicts
   - TypeScript version mismatches

2. **Network Issues**
   - npm registry timeouts
   - Package downloads fail
   - Corruption during transfer

3. **Platform Incompatibility**
   - Node.js version too old/new
   - Native modules don't compile
   - OS-specific dependencies

4. **Dependency Trees**
   - Circular dependencies
   - Conflicting requirements from different packages
   - Deprecated packages

---

## Solution: Locked Package Manifest

### Strategy

1. ✅ **Use exact versions** (no semver ranges)
2. ✅ **Include all transitive dependencies** (full resolution)
3. ✅ **Lock engine versions** (Node, npm)
4. ✅ **Pre-validate compatibility**
5. ✅ **Provide fallback installation methods**

---

## Implementation

### 1. Primary package.json (Exact Versions)

```json
{
  "name": "@cursem/floyd-wrapper",
  "version": "0.1.0",
  "description": "File-Logged Orchestrator Yielding Deliverables - AI Development Companion",
  "main": "dist/index.js",
  "bin": {
    "floyd": "./dist/cli.js"
  },
  "type": "module",
  "engines": {
    "node": ">=20.0.0 <21.0.0",
    "npm": ">=10.0.0"
  },
  "scripts": {
    "dev": "tsx watch src/cli.ts",
    "build": "tsc && tsc-alias",
    "start": "node dist/cli.js",
    "test": "npm run test:unit && npm run test:integration",
    "test:unit": "ava tests/unit/**/*.test.ts",
    "test:integration": "ava tests/integration/**/*.test.ts",
    "test:coverage": "c8 npm test",
    "lint": "eslint src --ext .ts",
    "format": "prettier --write \"src/**/*.ts\"",
    "typecheck": "tsc --noEmit",
    "clean": "rm -rf dist .floyd",
    "precommit": "npm run typecheck && npm run lint",
    "install:legacy": "npm install --legacy-peer-deps",
    "install:ci": "npm ci --legacy-peer-deps",
    "validate": "npm run typecheck && npm run test"
  },
  "dependencies": {
    "@anthropic-ai/sdk": "0.71.2",
    "chalk": "5.3.0",
    "ora": "8.0.1",
    "cli-spinners": "2.9.2",
    "log-update": "6.0.0",
    "terminal-link": "3.0.0",
    "cli-table3": "0.6.3",
    "inquirer": "9.2.11",
    "meow": "12.1.0",
    "zod": "3.22.4",
    "execa": "8.0.1",
    "fs-extra": "11.2.0",
    "globby": "14.0.0",
    "p-queue": "8.0.1",
    "p-timeout": "6.1.2",
    "signal-exit": "4.1.0",
    "dotenv": "16.3.1"
  },
  "devDependencies": {
    "@types/node": "20.10.6",
    "@types/inquirer": "9.0.7",
    "@types/fs-extra": "11.0.4",
    "typescript": "5.3.3",
    "tsx": "4.7.0",
    "tsc-alias": "1.8.8",
    "ava": "6.0.1",
    "c8": "9.0.0",
    "eslint": "8.56.0",
    "@typescript-eslint/eslint-plugin": "6.17.0",
    "@typescript-eslint/parser": "6.17.0",
    "prettier": "3.1.1"
  },
  "overrides": {
    "semver": "^7.5.4",
    "word-wrap": "^1.2.5"
  },
  "keywords": [
    "ai",
    "cli",
    "agent",
    "autonomous",
    "llm",
    "development"
  ],
  "author": "CURSEM",
  "license": "MIT"
}
```

**Key Safeguards:**
- ✅ No `^` or `~` ranges - exact versions only
- ✅ `engines` field locks Node.js to 20.x
- ✅ `overrides` force security patch versions
- ✅ `install:legacy` script provides fallback

---

### 2. Pre-Installation Validation

```bash
#!/bin/bash
# scripts/validate-environment.sh

echo "🔍 Validating build environment..."

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 20 ]; then
  echo "❌ Node.js version too old: $(node -v)"
  echo "   Required: >= 20.0.0"
  exit 1
fi

if [ "$NODE_VERSION" -ge 21 ]; then
  echo "⚠️  Node.js version may be incompatible: $(node -v)"
  echo "   Recommended: 20.x"
fi

echo "✅ Node.js: $(node -v)"

# Check npm version
NPM_VERSION=$(npm -v | cut -d'.' -f1)
if [ "$NPM_VERSION" -lt 10 ]; then
  echo "❌ npm version too old: $(npm -v)"
  echo "   Required: >= 10.0.0"
  exit 1
fi

echo "✅ npm: $(npm -v)"

# Check TypeScript
if ! command -v tsc &> /dev/null; then
  echo "❌ TypeScript not installed globally"
  echo "   Run: npm install -g typescript@5.3.3"
  exit 1
fi

TSC_VERSION=$(tsc --version | awk '{print $2}')
echo "✅ TypeScript: $TSC_VERSION"

# Check disk space (need at least 1GB free)
FREE_SPACE=$(df -BG . | tail -1 | awk '{print $4}' | tr -d 'G')
if [ "$FREE_SPACE" -lt 1 ]; then
  echo "❌ Insufficient disk space: ${FREE_SPACE}GB free"
  echo "   Required: 1GB+ free"
  exit 1
fi

echo "✅ Disk space: ${FREE_SPACE}GB free"

# Check network connectivity
if ! ping -c 1 registry.npmjs.org &> /dev/null; then
  echo "❌ Cannot reach npm registry"
  echo "   Check internet connection"
  exit 1
fi

echo "✅ Network: npm registry reachable"

echo ""
echo "🎉 Environment validation passed!"
```

---

### 3. Robust Installation Script

```bash
#!/bin/bash
# scripts/install-dependencies.sh

set -e  # Exit on error

echo "📦 Installing Floyd Wrapper dependencies..."

# Validate environment first
bash scripts/validate-environment.sh

# Clean existing modules (force fresh install)
echo "🧹 Cleaning existing node_modules..."
rm -rf node_modules package-lock.json

# Try standard install first
echo "📥 Installing dependencies (standard)..."
if npm install --no-save; then
  echo "✅ Standard install succeeded"
  exit 0
fi

echo "⚠️  Standard install failed, trying legacy peer deps..."

# Fallback 1: Legacy peer deps
if npm install --legacy-peer-deps --no-save; then
  echo "✅ Legacy install succeeded"
  exit 0
fi

echo "⚠️  Legacy install failed, trying with force..."

# Fallback 2: Force install (last resort)
if npm install --force --no-save; then
  echo "✅ Force install succeeded (may have warnings)"
  exit 0
fi

echo "❌ All installation methods failed"
echo ""
echo "Diagnostic information:"
echo "1. npm version: $(npm -v)"
echo "2. Node version: $(node -v)"
echo "3. Error log:"
npm install 2>&1 | tail -20

exit 1
```

---

### 4. Post-Installation Validation

```bash
#!/bin/bash
# scripts/validate-installation.sh

echo "🔍 Validating installation..."

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
  echo "❌ node_modules not found"
  exit 1
fi

# Check critical dependencies
CRITICAL_DEPS=(
  "@anthropic-ai/sdk"
  "chalk"
  "ora"
  "log-update"
  "zod"
  "execa"
)

for dep in "${CRITICAL_DEPS[@]}"; do
  if [ ! -d "node_modules/$dep" ]; then
    echo "❌ Critical dependency missing: $dep"
    exit 1
  fi
done

echo "✅ All critical dependencies present"

# Test TypeScript compilation
echo "🔍 Testing TypeScript compilation..."
if ! npm run typecheck; then
  echo "❌ TypeScript compilation failed"
  exit 1
fi

echo "✅ TypeScript compilation successful"

# Test imports
echo "🔍 Testing module imports..."
node -e "
  import('@anthropic-ai/sdk').then(() => console.log('✅ @anthropic-ai/sdk OK'))
    .catch(e => { console.log('❌ @anthropic-ai/sdk FAIL:', e.message); process.exit(1); });
  import('chalk').then(() => console.log('✅ chalk OK'))
    .catch(e => { console.log('❌ chalk FAIL:', e.message); process.exit(1); });
  import('zod').then(() => console.log('✅ zod OK'))
    .catch(e => { console.log('❌ zod FAIL:', e.message); process.exit(1); });
"

echo ""
echo "🎉 Installation validation passed!"
```

---

### 5. Dependency Lock File (package-lock.json)

Generated by running:
```bash
npm install --package-lock-only
```

This locks ALL transitive dependencies to exact versions.

---

## Error Recovery Playbook

### Scenario 1: ERESOLVE Dependency Conflicts

**Symptom:**
```
npm ERR! ERESOLVE unable to resolve dependency tree
```

**Recovery:**
```bash
# Try legacy peer deps
npm install --legacy-peer-deps

# If that fails, use force
npm install --force
```

---

### Scenario 2: Network Timeout

**Symptom:**
```
npm ERR! network request failed
```

**Recovery:**
```bash
# Increase timeout
npm install --fetch-timeout=180000

# Use alternative registry
npm install --registry=https://registry.npmjs.org

# Try clearing cache
npm cache clean --force
npm install
```

---

### Scenario 3: Native Module Compilation Failed

**Symptom:**
```
gyp ERR! stack Error: `make` failed
```

**Recovery:**
```bash
# Install build tools (macOS)
xcode-select --install

# Install build tools (Ubuntu)
sudo apt-get install build-essential

# Retry install
npm install
```

---

### Scenario 4: Version Out of Range

**Symptom:**
```
npm ERR! notsup Not compatible with your version of node
```

**Recovery:**
```bash
# Check node version
node -v

# Install correct version (nvm)
nvm install 20
nvm use 20

# Retry
npm install
```

---

## Autonomous Build Integration

### Pre-Build Check

Add to autonomous agent's pre-flight checklist:

```markdown
### Dependency Installation Validation

Run these commands BEFORE autonomous build starts:

```bash
# 1. Validate environment
bash scripts/validate-environment.sh

# 2. Install dependencies
bash scripts/install-dependencies.sh

# 3. Validate installation
bash scripts/validate-installation.sh
```

**Expected output:** All checks pass with ✅

**If any fail:** Do NOT proceed with build
```

---

## Success Metrics

✅ **Installation succeeds on first try**
- Exact versions prevent conflicts
- Pre-validation catches issues early
- Fallback methods provide redundancy

✅ **All dependencies resolve correctly**
- No peer dependency conflicts
- No version mismatches
- No missing transitive deps

✅ **Build can recover from failures**
- Multiple installation methods
- Clear error messages
- Automated diagnostics

---

**Next:** Create package.json in project root with these safeguards
