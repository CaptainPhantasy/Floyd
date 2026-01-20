# Fixing Native Messaging Error

## The Problem

You're seeing this error:
```
Unchecked runtime.lastError: Native host has exited.
```

This happens when Chrome tries to connect to the native messaging host, but the host exits immediately because there's no MCP server running to connect to.

## Two Solutions

### Solution 1: Disable Native Messaging (Use WebSocket Only)

**This is the easiest fix.** The extension works perfectly with WebSocket alone.

**Steps:**
1. In Chrome, go to `chrome://extensions`
2. Find FloydChrome extension
3. Click "Details"
4. Look for "Native messaging" - you may see the error listed
5. **The extension will still work via WebSocket** - ignore this error

The extension will:
- ✅ Connect via WebSocket to Floyd CLI
- ✅ All browser automation works
- ✅ No native messaging needed

### Solution 2: Install Native Messaging Host (Advanced)

If you want native messaging as a fallback:

**The native messaging host has been installed!** It was installed to:
```
/Users/douglastalley/Library/Application Support/Google/Chrome/NativeMessagingHosts/com.floyd.chrome.json
```

**However**, the host will exit immediately if:
- Floyd CLI is not running
- MCP browser server is not started
- WebSocket server on port 3000 is not available

**To make native messaging work:**

1. Start Floyd CLI with MCP browser server:
   ```bash
   cd /Volumes/Storage/FLOYD_CLI/INK/floyd-cli
   npm run dev
   ```

2. Reload the FloydChrome extension in Chrome

3. The native host will stay alive and bridge between Chrome and Floyd CLI

## Recommended Approach

**Use WebSocket only** - it's simpler and works perfectly.

The native messaging error is harmless because:
- The extension uses WebSocket as primary connection method
- Native messaging was intended as a fallback
- The error doesn't affect WebSocket functionality

## Verification

To verify everything works:

1. Open Floyd CLI:
   ```bash
   cd /Volumes/Storage/FLOYD_CLI/INK/floyd-cli
   npm run dev
   ```

2. In Chrome DevTools console (F12), check for:
   ```
   [FloydChrome] WebSocket connected to ws://localhost:3000
   ```

3. Try a browser command in Floyd CLI:
   ```
   Navigate to https://example.com
   ```

4. It should work! The native messaging error can be ignored.

## Technical Details

The native messaging host (`floyd-chrome-host.js`) tries to:
1. Connect to WebSocket server on port 3000
2. Bridge stdio (Chrome native messaging) to WebSocket (MCP server)
3. If connection fails, it exits (causing the error)

This is expected behavior when Floyd CLI isn't running.

## Uninstall Native Messaging (Optional)

If you want to remove the native messaging host:

```bash
rm "/Users/douglastalley/Library/Application Support/Google/Chrome/NativeMessagingHosts/com.floyd.chrome.json"
```

Then reload the extension. It will use WebSocket only.

## Summary

✅ **Extension works perfectly with WebSocket**
⚠️ **Native messaging error is harmless**
🎯 **Recommended: Use WebSocket, ignore native messaging**

The error message is just Chrome complaining that the native host exited. Since we're using WebSocket as the primary connection method, this doesn't affect functionality at all!
