# FloydChrome Extension - Setup and Testing Guide

## Quick Setup (5 minutes)

### Step 1: Load Extension in Chrome

1. Open Google Chrome
2. Navigate to `chrome://extensions`
3. Toggle **"Developer mode"** (top right corner)
4. Click **"Load unpacked"** (top left)
5. Navigate to: `/Volumes/Storage/FLOYD_CLI/FloydChromeBuild/floydchrome/dist`
6. Click **"Select Folder"**

✅ Extension should now appear as "FloydChrome" in your extensions list

### Step 2: Verify Extension Installation

1. Click the FloydChrome extension icon in your toolbar
2. The side panel should open showing:
   - Connection status (will show "Not connected" - this is OK)
   - Available tools list
   - Task input field

### Step 3: Test Browser MCP Server

#### Option A: Test via Floyd CLI (Recommended)

```bash
cd /Volumes/Storage/FLOYD_CLI/INK/floyd-cli
npm run dev
```

Then in Floyd CLI, try:
```
Navigate to https://example.com
Take a screenshot
Click the "More information" link
```

#### Option B: Test Browser Server Directly

```bash
cd /Volumes/Storage/FLOYD_CLI/INK/floyd-cli
node --loader ts-node/esm src/mcp/browser-server.ts
```

This will start the MCP browser server and attempt to connect to the extension.

## Verification Tests

### Test 1: Connection Test

**Expected**: When you load a webpage, the extension should log:
```
[FloydChrome] WebSocket connected to ws://localhost:3000
```

**Check**: Open Chrome DevTools (F12) → Console tab and look for connection messages

### Test 2: Screenshot Test

1. Navigate to any webpage (e.g., https://example.com)
2. Open Floyd CLI side panel
3. Enter task: "Take a screenshot"
4. **Expected**: Extension captures page and returns base64 image

### Test 3: Navigation Test

1. In Floyd CLI, enter: "Navigate to https://github.com"
2. **Expected**: Browser navigates to GitHub

### Test 4: Computer Use Workflow

1. Navigate to https://example.com
2. In Floyd CLI: "Take a screenshot and analyze it"
3. **Expected**: Screenshot captured, vision model analyzes, suggests actions
4. Try: "Click the first link"
5. **Expected**: Extension clicks the element

## Troubleshooting

### Extension shows "Not connected"

**Solution**: The Floyd CLI MCP browser server needs to be running:
```bash
cd /Volumes/Storage/FLOYD_CLI/INK/floyd-cli
npm run dev
# The browser MCP server will auto-connect
```

### WebSocket connection fails

**Check**: Is port 3000 available?
```bash
lsof -i :3000
```

**Solution**: If another service is using port 3000, the extension will try ports 3000-3009 automatically.

### Screenshot returns error

**Check**: Chrome DevTools console for error messages

**Common issues**:
- Debugger not attached: Extension auto-attaches, but may fail if another debugger is active
- Permission denied: Check extension has "debugger" and "tabs" permissions

### Tools not appearing in Floyd CLI

**Check**: MCP server is configured:
```bash
cat .floyd/mcp.json
```

**Verify**: Browser server is enabled:
```json
{
  "name": "browser",
  "enabled": true,
  ...
}
```

## Advanced: Manual Tool Testing

You can test tools directly via Chrome DevTools console:

```javascript
// Test screenshot
chrome.runtime.sendMessage({
  type: 'agent_process_task',
  task: 'Take a screenshot',
  context: { fullPage: false }
});

// Check connection status
chrome.runtime.sendMessage({
  type: 'get_mcp_status'
}, (response) => {
  console.log('Connection:', response);
});
```

## Architecture Flow

```
User: "Navigate to example.com"
    ↓
Floyd CLI (AgentEngine)
    ↓
MCP Browser Server (browser-server.ts)
    ↓
WebSocket (ws://localhost:3000)
    ↓
FloydChrome Extension (background.js)
    ↓
Chrome Tabs API
    ↓
Browser navigates to example.com
```

## What's Working

✅ Extension builds successfully
✅ Screenshot tool implemented
✅ MCP browser server created
✅ WebSocket connection configured
✅ Tools integrated into executor

## Next Enhancements (Optional)

- [ ] Native messaging host (alternative to WebSocket)
- [ ] Vision model integration for canvas elements
- [ ] Auth zone detection
- [ ] Enhanced safety layer
- [ ] Browser history/context tracking

## Status

Current Parity: **60%** (as of 2026-01-19)

The extension now provides core browser automation capabilities to Floyd CLI, enabling Computer Use workflows as described in the Bifurcation document.
