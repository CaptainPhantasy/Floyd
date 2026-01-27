# FloydChrome Multi-Connection Architecture

**Last Updated:** 2026-01-21
**Status:** Production Ready

---

## Overview

FloydChrome extension now supports **simultaneous connections** to both Floyd CLI and Floyd Desktop Web, enabling flexible workflows where either interface can control browser automation.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    FloydChrome Extension                        │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              Connection Manager                           │  │
│  │  - Manages multiple WebSocket connections                │  │
│  │  - Routes messages to appropriate handlers               │  │
│  │  - Auto-reconnect with configurable backoff              │  │
│  └──────────────────────────────────────────────────────────┘  │
│                           │                                     │
│          ┌────────────────┴────────────────┐                   │
│          ▼                                 ▼                   │
│  ┌───────────────┐                 ┌───────────────┐           │
│  │ CLI Connection│                 │Desktop Connect.│           │
│  │ Port: 3005    │                 │ Port: 3000     │           │
│  └───────────────┘                 └───────────────┘           │
└─────────────────────────────────────────────────────────────────┘
          │                                 │
          ▼                                 ▼
┌───────────────────┐           ┌───────────────────┐
│   Floyd CLI       │           │  Floyd Desktop    │
│   (Terminal)      │           │  (Web UI)         │
│                   │           │                   │
│ • MCP tools       │           │ • Visual interface│
│ • Agent control   │           │ • Task management │
│ • Scripting       │           │ • Monitoring      │
└───────────────────┘           └───────────────────┘
```

---

## Connection Details

### CLI Connection (Port 3005)

**Purpose:** Terminal-based workflows and scripting
**Protocol:** MCP (Model Context Protocol)
**Features:**
- Full browser automation toolset
- Agent-controlled browsing
- Scriptable workflows
- Low-latency responses

**Usage:**
```bash
cd /Volumes/Storage/FLOYD_CLI/INK/floyd-cli
npm run dev

# Extension will auto-connect to ws://localhost:3005
```

### Desktop Connection (Port 3000)

**Purpose:** Visual task management and monitoring
**Protocol:** MCP + custom extensions
**Features:**
- Visual task creation
- Real-time browsing monitoring
- Screenshot previews
- Activity logs

**Usage:**
```bash
cd /path/to/FloydDesktopWeb
npm run dev

# Extension will auto-connect to ws://localhost:3000
```

---

## Connection Behavior

### Initialization

On startup, the extension:

1. **Connects to CLI (port 3005)** - Primary connection
2. **Attempts Desktop (port 3000)** - Currently disabled by default
3. **Logs connection status** for each attempt
4. **Enters auto-reconnect mode** for enabled connections

### Auto-Reconnect

- **Interval:** 5 seconds between attempts
- **Max Attempts:** 50 (configurable)
- **Behavior:** Continues until connected or max attempts reached
- **Logs:** Reports every 3rd attempt to reduce spam

### Graceful Degradation

If one connection fails:
- ✅ Other connections remain active
- ✅ Extension continues functioning
- ✅ Reconnection attempts continue in background
- ✅ Status available via `get_mcp_status` message

---

## Configuration

### Default Ports

| Connection | Port | Configurable |
|------------|------|--------------|
| CLI        | 3005 | Yes (via `cliPort`) |
| Desktop    | 3000 | Yes (via `desktopPort`) |

### Enabling/Disabling Connections

Edit `background.js`:

```javascript
const connectionResults = await mcpServer.initialize({
  cliPort: 3005,
  desktopPort: 3000,
  enableCLI: true,        // Set false to disable CLI
  enableDesktop: false    // Set true to enable Desktop
});
```

### Manual Reconnection

Send message to extension:

```javascript
chrome.runtime.sendMessage({
  type: 'reconnect_desktop',
  port: 3000  // Optional custom port
}, (response) => {
  console.log('Reconnection result:', response);
});
```

---

## Message Routing

All browser tool calls are **routed based on source**:

```javascript
// Tool execution log includes source
{
  timestamp: 1737481234567,
  method: 'browser_navigate',
  params: { url: 'https://example.com' },
  success: true,
  source: 'cli'  // or 'desktop'
}
```

---

## Debugging

### Check Connection Status

```javascript
// In browser console or extension background
chrome.runtime.sendMessage({
  type: 'get_mcp_status'
}, (response) => {
  console.log('Connection status:', response);
  // Output:
  // {
  //   connected: true,
  //   connections: {
  //     cli: { connected: true, port: 3005, reconnectAttempts: 0 },
  //     desktop: { connected: false, port: 3000, reconnectAttempts: 5 }
  //   }
  // }
});
```

### Extension Console Logs

**Successful Connection:**
```
[FloydChrome] Initializing multi-connection system...
[MCP] Initializing multi-connection MCP server...
[ConnectionManager] Connecting cli to port 3005...
[ConnectionManager] cli connected to port 3005
[MCP] Connected to Floyd CLI
[FloydChrome] Connection results: { cli: true }
[FloydChrome] Floyd Agent connected to CLI
```

**Connection Failure (Expected):**
```
[ConnectionManager] Connecting desktop to port 3000...
[ConnectionManager] desktop connection timeout
[MCP] Floyd Desktop not available
```

### Accessing Internal State

```javascript
// In extension background page
const status = globalThis.floydChrome.connectionStatus();
console.log('Detailed status:', status);
```

---

## Port Conflicts

### CLI Takes Precedence (3005)

- **CLI:** Always tries port 3005 first
- **Desktop:** Uses port 3000 (avoids conflict)

### Custom Ports

If you need different ports:

1. **CLI:** Set environment variable
   ```bash
   FLOYD_EXTENSION_URL=ws://localhost:3009 npm run dev
   ```

2. **Extension:** Update `background.js`
   ```javascript
   await mcpServer.initialize({
     cliPort: 3009,  // Custom CLI port
     desktopPort: 3000
   });
   ```

---

## Troubleshooting

### "Extension not connected to CLI"

**Cause:** CLI not running or wrong port
**Solution:**
```bash
cd /Volumes/Storage/FLOYD_CLI/INK/floyd-cli
npm run dev
```

### "Extension not connected to Desktop"

**Cause:** Desktop Web not running or disabled
**Solution:**
1. Ensure Desktop Web is running on port 3000
2. Enable Desktop connection in `background.js`
3. Or send `reconnect_desktop` message

### Both connections failing

**Check:**
1. Are both CLI and Desktop stopped?
2. Firewall blocking localhost?
3. Wrong ports configured?
4. Extension needs reload?

---

## Migration Notes

### From Single-Connection

**Before:**
- Only Desktop (port 3005)
- Single WebSocket connection
- Basic error handling

**After:**
- CLI + Desktop (dual connection)
- Connection Manager
- Graceful degradation
- Better logging

### Breaking Changes

None - extension is backward compatible. If Desktop is not running, CLI works independently.

---

## Future Enhancements

- [ ] Dynamic port discovery
- [ ] Connection priority system
- [ ] Load balancing across connections
- [ ] WebRTC support for remote connections
- [ ] Connection pooling for multiple CLI instances

---

## Related Files

- `mcp/connection-manager.js` - Connection management logic
- `mcp/server.js` - MCP protocol implementation
- `background.js` - Extension initialization
- `agent/floyd.js` - Agent connection logic
