# Quick Start Guide - FloydChrome Extension

## ✅ Extension Loaded Successfully!

Your extension is installed and ready. Now let's test the integration.

## Step 1: Verify Extension is Working

1. Click the **FloydChrome** extension icon in your Chrome toolbar
2. The side panel should open
3. You should see the connection status and available tools

## Step 2: Start Floyd CLI with Browser Support

Open a terminal and run:

```bash
cd /Volumes/Storage/FLOYD_CLI/INK/floyd-cli
npm run dev
```

The CLI will start and automatically connect to the extension.

## Step 3: Test Basic Browser Automation

Once Floyd CLI is running, try these commands:

### Test 1: Navigate to a Website
```
Navigate to https://example.com
```

### Test 2: Take a Screenshot
```
Take a screenshot
```

### Test 3: Read the Page
```
Read the page and tell me what it says
```

### Test 4: Find and Click
```
Click the "More information" link
```

### Test 5: Form Interaction
```
Navigate to https://google.com
Type "Floyd AI" into the search box
```

## Expected Behavior

When you run these commands in Floyd CLI, you should see:

1. **CLI sends request** to MCP browser server
2. **MCP server forwards** to Chrome extension via WebSocket
3. **Extension executes** the action in Chrome
4. **Result returned** back to CLI

## Troubleshooting

### "Extension not connected" in CLI

**Solution**: The extension connects automatically when:
- Floyd CLI is running
- MCP browser server is enabled in `.floyd/mcp.json`
- WebSocket port 3000 is available

Check Chrome DevTools console (F12) for connection logs:
```
[FloydChrome] WebSocket connected to ws://localhost:3000
```

### Tools not available

**Check** MCP configuration:
```bash
cat /Volumes/Storage/FLOYD_CLI/INK/floyd-cli/.floyd/mcp.json
```

Verify browser server is enabled:
```json
{
  "name": "browser",
  "enabled": true
}
```

### Actions don't execute

1. Open Chrome DevTools (F12)
2. Go to Console tab
3. Look for error messages
4. Check that the extension has necessary permissions

## Architecture Verification

The flow should be:

```
Your Command in Floyd CLI
    ↓
AgentEngine processes request
    ↓
MCP Browser Server (browser-server.ts)
    ↓
WebSocket (ws://localhost:3000)
    ↓
FloydChrome Extension receives message
    ↓
Chrome Debugger/Tabs API executes action
    ↓
Browser performs the action
    ↓
Result returned through chain
    ↓
You see the result in CLI
```

## Testing Checklist

- [ ] Extension loads in Chrome without errors
- [ ] Extension side panel opens when clicked
- [ ] Floyd CLI starts successfully
- [ ] CLI shows browser tools available
- [ ] Can navigate to websites
- [ ] Can take screenshots
- [ ] Can click elements
- [ ] Can type text
- [ ] Can read page content

## Success Indicators

✅ Extension loads in Chrome
✅ No errors in Chrome console
✅ Floyd CLI starts and connects
✅ Browser commands work from CLI
✅ Screenshots capture successfully
✅ Elements can be clicked
✅ Text can be typed

## What to Try Next

Once basic testing is complete, try advanced workflows:

1. **Multi-step tasks**:
   ```
   Go to GitHub, search for "floyd-ai", and click the first result
   ```

2. **Form filling**:
   ```
   Navigate to example.com/form
   Fill out the form with name "John Doe" and email "john@example.com"
   ```

3. **Computer Use loop**:
   ```
   Take a screenshot, analyze it, and click the most important button
   ```

## Getting Help

If something doesn't work:

1. Check Chrome DevTools console (F12)
2. Check Floyd CLI output
3. Review logs for error messages
4. See SETUP_AND_TEST.md for detailed troubleshooting

## Congratulations! 🎉

You now have a fully functional AI-powered browser automation system. Floyd CLI can control Chrome browser, take screenshots, and interact with web pages - giving you Computer Use capabilities as described in the Bifurcation document!
