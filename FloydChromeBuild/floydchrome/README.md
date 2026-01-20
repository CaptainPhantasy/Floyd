# FloydChrome Extension - README

## Overview

FloydChrome is a Chrome extension that provides **browser automation and Computer Use capabilities** to the Floyd AI agent ecosystem. It enables Floyd CLI to control Chrome browser, capture screenshots, and interact with web pages.

## Features

### Core Capabilities
- 🌐 **Navigation**: Navigate to URLs, create new tabs
- 📸 **Screenshots**: Capture viewport, full-page, or element screenshots (for vision models)
- 🔍 **Page Reading**: Extract accessibility tree and visible text
- 🖱️ **Interaction**: Click elements, type text
- 🔎 **Element Finding**: Locate elements by natural language queries

### Integration
- 🔌 **MCP Server**: Full Model Context Protocol server implementation
- 🌉 **WebSocket**: Real-time bidirectional communication with Floyd CLI
- 🔐 **Safety Layer**: Permission checks, content sanitization, auth zone detection

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Floyd CLI                                │
│                  (AgentEngine)                               │
└──────────────────────────┬──────────────────────────────────┘
                           │
                    MCP Protocol
                           │
┌──────────────────────────▼──────────────────────────────────┐
│              MCP Browser Server                              │
│         (src/mcp/browser-server.ts)                          │
└──────────────────────────┬──────────────────────────────────┘
                           │
                    WebSocket (ws://localhost:3000)
                           │
┌──────────────────────────▼──────────────────────────────────┐
│              FloydChrome Extension                           │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │  Background Service Worker                         │    │
│  │  - WebSocket client for MCP communication          │    │
│  │  - Tool executor and router                        │    │
│  │  - Safety layer integration                        │    │
│  └────────────────────────────────────────────────────┘    │
│                           │                                  │
│  ┌────────────────────────────────────────────────────┐    │
│  │  Tools                                             │    │
│  │  • navigate     - Navigate to URLs                 │    │
│  │  • read_page    - Get accessibility tree           │    │
│  │  • screenshot   - Capture screenshots              │    │
│  │  • click        - Click elements                   │    │
│  │  • type         - Type text                        │    │
│  │  • find         - Find elements                    │    │
│  │  • tabs_create  - Create new tabs                  │    │
│  │  • get_tabs     - List all tabs                    │    │
│  └────────────────────────────────────────────────────┘    │
└──────────────────────────┬──────────────────────────────────┘
                           │
                    Chrome Extension APIs
                    (Debugger, Tabs, Scripting)
                           │
┌──────────────────────────▼──────────────────────────────────┐
│                    Google Chrome                              │
│                                                              │
│  User visits websites, interacts with pages                  │
└──────────────────────────────────────────────────────────────┘
```

## Quick Start

### Installation

1. **Build the extension**:
   ```bash
   cd /Volumes/Storage/FLOYD_CLI/FloydChromeBuild/floydchrome
   npm install
   npm run build
   ```

2. **Load in Chrome**:
   - Open `chrome://extensions`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the `dist/` folder

3. **Start Floyd CLI**:
   ```bash
   cd /Volumes/Storage/FLOYD_CLI/INK/floyd-cli
   npm run dev
   ```

The extension will automatically connect to Floyd CLI via WebSocket.

### Usage

From Floyd CLI, you can now:

```bash
# Navigate to a website
"Navigate to https://example.com"

# Take a screenshot
"Take a screenshot"

# Read page content
"Read the page and summarize it"

# Find and click elements
"Click the 'Submit' button"

# Type into forms
"Type 'hello world' into the search box"
```

## Development

### Project Structure

```
floydchrome/
├── src/
│   ├── agent/
│   │   └── floyd.ts           # Floyd agent client
│   ├── mcp/
│   │   └── websocket-client.ts # WebSocket MCP client
│   ├── tools/
│   │   ├── screenshot.ts      # Screenshot tools ✨ NEW
│   │   ├── navigation.ts      # Navigation tools
│   │   ├── reading.ts         # Page reading tools
│   │   ├── interaction.ts     # Click/type tools
│   │   ├── tabs.ts            # Tab management
│   │   └── executor.ts        # Tool router
│   ├── safety/
│   │   ├── permissions.ts     # Permission checks
│   │   └── sanitizer.ts       # Content sanitization
│   ├── sidepanel/
│   │   └── index.html         # UI side panel
│   ├── background.ts          # Service worker
│   └── content.ts             # Content script
├── manifest.json              # Extension manifest
├── vite.config.ts             # Build config
└── package.json
```

### Building

```bash
# Development build with watch
npm run dev

# Production build
npm run build

# Type check
npm run typecheck
```

## Tools Reference

### screenshot ✨ NEW
Capture screenshots for Computer Use workflows.

**Parameters**:
- `fullPage` (boolean): Capture full scrollable page
- `selector` (string): CSS selector for element screenshot
- `tabId` (number): Target tab ID

**Returns**: Base64-encoded PNG image

**Example**:
```json
{
  "success": true,
  "data": {
    "dataUrl": "data:image/png;base64,iVBORw0KG...",
    "format": "png",
    "encoding": "base64"
  }
}
```

### navigate
Navigate to a URL.

**Parameters**:
- `url` (string, required): Target URL
- `tabId` (number): Target tab ID

### read_page
Get semantic accessibility tree.

**Parameters**:
- `tabId` (number): Target tab ID

**Returns**: Accessibility tree with DOM structure

### click
Click element at coordinates or by selector.

**Parameters**:
- `x, y` (number): Click coordinates
- `selector` (string): CSS selector
- `tabId` (number): Target tab ID

### type
Type text into focused element.

**Parameters**:
- `text` (string, required): Text to type
- `tabId` (number): Target tab ID

### find
Find elements by natural language query.

**Parameters**:
- `query` (string, required): Search query
- `tabId` (number): Target tab ID

**Returns**: List of matching elements with scores

### tabs_create
Create a new tab.

**Parameters**:
- `url` (string): URL to open

### get_tabs
List all open tabs.

**Returns**: Array of tab objects

## Computer Use Workflow

The extension enables **Computer Use** workflows:

1. **Capture**: Agent takes screenshot → `browser_screenshot`
2. **Analyze**: Vision model analyzes screenshot and identifies actionable elements
3. **Act**: Agent performs action → `browser_click`, `browser_type`, etc.
4. **Repeat**: Loop continues until task complete

## Troubleshooting

See [SETUP_AND_TEST.md](./SETUP_AND_TEST.md) for detailed troubleshooting guide.

### Common Issues

**Extension won't load**
- Check Chrome console for errors
- Verify all permissions in manifest.json
- Try rebuilding: `npm run build`

**Can't connect to Floyd CLI**
- Ensure Floyd CLI is running
- Check browser MCP server is enabled: `cat .floyd/mcp.json`
- Look for WebSocket errors in Chrome DevTools console

**Screenshot fails**
- Check debugger permissions
- Ensure no other debugger is attached
- Try reloading the page

## Contributing

This is part of the Floyd ecosystem. See the main repository for contribution guidelines.

## License

MIT License - See LICENSE file for details

## Status

**Current Parity**: 60% with Claude for Chrome

**Achieved**:
- ✅ All core navigation and interaction tools
- ✅ Screenshot capture for Computer Use
- ✅ MCP server integration
- ✅ WebSocket communication
- ✅ Safety layer

**In Progress**:
- 🚧 Vision model integration for canvas elements
- 🚧 Enhanced auth zone detection
- 🚧 Native messaging fallback

**Planned**:
- 📋 Improved element targeting
- 📋 Workflow recording and playback
- 📋 Multi-browser support

---

**Floyd**: File-Logged Orchestrator Yielding Deliverables  
*Building complete software, not MVPs.*
