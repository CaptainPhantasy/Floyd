# FloydChrome Extension Architecture

## Overview

FloydChrome is a Chrome extension that provides browser automation capabilities to the FLOYD AI agent. It connects to the FLOYD ecosystem via MCP (Model Context Protocol) over WebSocket or Native Messaging.

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     FloydChrome Extension                        │
├─────────────────────────────────────────────────────────────────┤
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  Background Service Worker (background.ts)                │  │
│  │  - Initializes connections                               │  │
│  │  - Routes messages between components                     │  │
│  │  - Manages service worker lifecycle                       │  │
│  └───────────────────────────────────────────────────────────┘  │
│                              │                                  │
│         ┌────────────────────┼────────────────────┐             │
│         ▼                    ▼                    ▼             │
│  ┌─────────────┐     ┌─────────────┐     ┌─────────────┐      │
│  │  WebSocket  │     │   Native    │     │   Floyd     │      │
│  │  MCP Client │     │  Messaging  │     │   Agent     │      │
│  │             │     │  MCP Server │     │             │      │
│  └─────────────┘     └─────────────┘     └─────────────┘      │
│         │                    │                    │             │
│         └────────────────────┼────────────────────┘             │
│                              ▼                                  │
│                    ┌─────────────┐                              │
│                    │   Tools     │                              │
│                    │  Executor   │                              │
│                    └─────────────┘                              │
│                              │                                  │
│         ┌────────────────────┼────────────────────┐             │
│         ▼                    ▼                    ▼             │
│  ┌─────────────┐     ┌─────────────┐     ┌─────────────┐      │
│  │ Navigation  │     │  Reading    │     │Interaction  │      │
│  │   Tools     │     │   Tools     │     │   Tools     │      │
│  └─────────────┘     └─────────────┘     └─────────────┘      │
│                              │                                  │
│                         ┌─────┴─────┐                            │
│                         │  Safety   │                            │
│                         │   Layer   │                            │
│                         └───────────┘                            │
└─────────────────────────────────────────────────────────────────┘
         │ WebSocket                    │ Native Messaging
         ▼                              ▼
┌─────────────────┐             ┌─────────────────┐
│  FloydDesktop   │             │   FLOYD CLI     │
│   (port 3000)   │             │  (native host)  │
└─────────────────┘             └─────────────────┘
```

## Connection Modes

### 1. WebSocket MCP (Preferred)

The extension connects to FloydDesktop's MCP server via WebSocket:

```typescript
const wsClient = new WebSocketMCPClient({
  url: 'ws://localhost:3000'
});
await wsClient.connect();
```

**Benefits:**
- Real-time bidirectional communication
- No native messaging host installation required
- Easier development and debugging
- Works with FloydDesktop's shared agent-core

### 2. Native Messaging (Fallback)

The extension uses Chrome's native messaging to connect to FLOYD CLI:

```typescript
const mcpServer = new MCPServer();
await mcpServer.connect(); // Uses com.floyd.chrome native host
```

**Requirements:**
- Native messaging host manifest installed
- FLOYD CLI running with MCP server mode

## Tool System

### Available Tools

| Tool | Description | Input |
|------|-------------|-------|
| `navigate` | Navigate to URL | `url`, `tabId?` |
| `read_page` | Get accessibility tree | `tabId?` |
| `get_page_text` | Extract page text | `tabId?` |
| `find` | Find element by query | `query`, `tabId?` |
| `click` | Click element | `x, y` or `selector`, `tabId?` |
| `type` | Type text | `text`, `tabId?` |
| `tabs_create` | Create new tab | `url?` |
| `get_tabs` | List all tabs | - |

### Tool Metadata Format

Tools expose their schema in MCP format:

```typescript
{
  name: 'navigate',
  description: 'Navigate to a URL',
  inputSchema: {
    type: 'object',
    properties: {
      url: { type: 'string', description: 'URL to navigate to' },
      tabId: { type: 'number', description: 'Tab ID (optional)' }
    },
    required: ['url']
  }
}
```

## Safety Layer

The extension includes a safety layer that:

1. **Sanitizes Content**: Removes or flags suspicious patterns (prompt injection attempts)
2. **Validates Actions**: Checks for destructive operations
3. **Domain Trust**: Warns about untrusted domains

```typescript
const safetyCheck = await safetyLayer.checkAction(method, params);
if (!safetyCheck.allowed) {
  return error(safetyCheck.reason);
}
```

## Development Setup

### Build

```bash
cd /Volumes/Storage/FLOYD_CLI/FloydChromeBuild/floydchrome
npm install
npm run build
```

### Watch Mode

```bash
npm run dev
```

### Type Check

```bash
npm run typecheck
```

## Required Plugins

### 1. Vite Plugin (@crxjs/vite-plugin)

Handles Chrome extension build process:

```typescript
// vite.config.ts
import { crx } from '@crxjs/vite-plugin';
import manifest from './manifest.json' assert { type: 'json' };

export default defineConfig({
  plugins: [crx({ manifest })]
});
```

### 2. TypeScript Plugin

Provides type checking and compilation:

```typescript
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "types": ["chrome", "vite/client"]
  }
}
```

## Integration with floyd-agent-core

The Chrome extension does **not** directly import `floyd-agent-core` due to:

1. **Chrome Extension Restrictions**: Extensions can't easily import npm packages
2. **Different Runtime**: Chrome extension APIs vs Node.js APIs

Instead, the extension:

1. **Implements MCP Client Protocol**: Can connect to any MCP server
2. **Provides Browser Tools**: Exposes browser automation via MCP
3. **Consumes via WebSocket**: FloydDesktop's MCP server serves agent-core tools

### Future: Direct Integration

For direct `floyd-agent-core` usage, a bundler setup would be needed:

```typescript
// Not currently implemented - requires bundler configuration
import { AgentEngine } from 'floyd-agent-core';
```

This would require:
- Vite configuration to handle Node.js polyfills
- Proper environment variable handling
- API key management in extension context

## Message Flow

### Tool Execution via WebSocket

```
1. User sends task via Side Panel
   └─> background.ts receives message
       └─> FloydAgent.processTask()
           └─> WebSocketMCPClient.sendRequest('tools/call', { name, args })
               └─> FloydDesktop MCP Server
                   └─> AgentEngine (floyd-agent-core)
                       └─> Returns result
                           └─> WebSocket response
                               └─> Side Panel displays result
```

### Tool Execution via Native Messaging

```
1. Floyd CLI calls tool
   └─> Native Messaging Host
       └─> MCPServer.handleIncomingMessage()
           └─> ToolExecutor.execute(toolName, params)
               └─> Browser API (chrome.tabs, chrome.debugger, etc.)
                   └─> Result sent via Native Messaging
                       └─> Floyd CLI receives result
```

## File Structure

```
src/
├── agent/
│   ├── floyd.ts         # FloydAgent class
│   └── index.ts
├── mcp/
│   ├── server.ts        # Native Messaging MCP server
│   ├── websocket-client.ts  # WebSocket MCP client
│   └── index.ts
├── tools/
│   ├── navigation.ts    # URL navigation
│   ├── reading.ts       # Page reading/extraction
│   ├── interaction.ts   # Click, type
│   ├── tabs.ts          # Tab management
│   ├── executor.ts      # Tool routing
│   ├── types.ts         # Tool types
│   └── index.ts
├── safety/
│   ├── sanitizer.ts     # Content sanitization
│   ├── permissions.ts   # Safety checks
│   └── index.ts
├── sidepanel/
│   └── index.ts
├── background.ts        # Service worker
├── content.ts           # Content script
├── types.ts             # Shared types
└── index.ts
```

## Testing

### Manual Testing

1. Load extension in Chrome: `chrome://extensions` → Developer mode → Load unpacked
2. Open Side Panel
3. Check connection status
4. Test tools from the side panel

### Debugging

```javascript
// In browser console
chrome.runtime.sendMessage({ type: 'get_mcp_status' });

// Access internals
globalThis.floydChrome.mcpServer()
globalThis.floydChrome.floydAgent()
globalThis.floydChrome.wsClient()
```

## Security Considerations

1. **Content Script Isolation**: Content scripts run in isolated world
2. **Host Permissions**: Extension requests host permissions for all URLs
3. **Debugger API**: Requires debugger permission for advanced interactions
4. **Sanitization**: All content is sanitized before being sent to AI
5. **Permission Layer**: Safety checks before executing destructive actions
