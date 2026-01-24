# 🎸 FLOYD CURSE'M IDE - Build Instructions 🎸

## ⚠️ PREREQUISITES (Read before building!)

### Node.js Version Requirement ⚠️
**REQUIRED:** Node.js v22.21.1
**CURRENTLY INSTALLED:** Node.js v24.10.0 ⚠️ (Too new!)

**The Problem:** VSCode's build system is NOT compatible with Node.js v24.x yet. You'll get errors like:
```
npm error Cannot read properties of undefined (reading 'ruleset')
```

**The Solution:** Use `nvm` (Node Version Manager) to switch to the correct version.

---

## 📝 INSTALLATION INSTRUCTIONS

### Step 1: Install/Update nvm (if needed)
```bash
# Check if nvm is installed
nvm --version

# If not installed, install it:
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.0/install.sh | bash

# Reload your shell
source ~/.bashrc  # or ~/.zshrc
```

### Step 2: Install Node.js v22.21.1
```bash
# Install the required Node version
nvm install 22.21.1

# Switch to Node v22.21.1
nvm use 22.21.1

# Verify the version
node --version
# Should output: v22.21.1
```

### Step 3: Install Dependencies
```bash
cd "/Volumes/Storage/FLOYD_CLI/Floyd IDE/vscode-main"

# IMPORTANT: Use npm, NOT yarn!
npm i

# This will take a few minutes...
# "Time to build the wall... of dependencies!" 🧱
```

### Step 4: Build the Application
```bash
# Compile TypeScript
npm run compile

# Watch for changes (development mode)
npm run watch

# Or build the full application bundle
npm run gulp build
```

### Step 5: Run the IDE
```bash
# Run in development mode
./scripts/code.sh

# Or run the built application
open ./VSCode-darwin-universal/Visual\ Studio\ Code.app
# (but it will be called "FLOYD CURSE'M IDE" instead!)
```

---

## 🔧 TROUBLESHOOTING

### "Cannot read properties of undefined (reading 'ruleset')"
**Cause:** Wrong Node.js version
**Fix:** Use `nvm use 22.21.1`

### "Seems like you are using `yarn` which is not supported"
**Cause:** Using yarn instead of npm
**Fix:** Use `npm i` instead of `yarn install`

### Build fails with strange errors
**Try these steps:**
```bash
# Clean build artifacts
rm -rf node_modules
rm -rf out

# Ensure correct Node version
nvm use 22.21.1

# Reinstall dependencies
npm i

# Try building again
npm run compile
```

---

## 🎯 QUICK START (Once Node is correct)

```bash
# One-time setup
cd "/Volumes/Storage/FLOYD_CLI/Floyd IDE/vscode-main"
nvm use 22.21.1
npm i

# Build
npm run compile

# Run
./scripts/code.sh
```

---

## 📊 BUILD STATUS

Current Status: ⏳ **BLOCKED** - Wrong Node version installed
Required: Node.js v22.21.1
Installed: Node.js v24.10.0
Action Required: Install Node.js v22.21.1 with `nvm install 22.21.1`

---

## 🎸 PINK FLOYD BUILD QUOTES

- "Comfortably Numb... from staring at build logs!" 🎸
- "Time to build The Wall... one dependency at a time!" 🧱
- "Welcome to the machine... that builds your IDE!" 🤖
- "We don't need no thought control... just the right Node version!" 📚

---

**Next Step:** Run `nvm use 22.21.1` then `npm i` to start building!

*"The dark side of the build awaits... 🌙"*
