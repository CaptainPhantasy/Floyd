# FLOYD Tool Architecture & Integration Guide

**Last Updated:** 2026-01-16

---

## Overview

FLOYD has **two separate implementations** with different tool architectures:

| Implementation | Language | Tool System | Status |
|----------------|----------|-------------|--------|
| **INK CLI** | TypeScript/Node.js | MCP (Model Context Protocol) | ✅ Active |
| **Go CLI** | Go | Native `floydtools` package | ⚠️ Broken (archived dependencies) |

---

## Part 1: INK CLI Tool Architecture (Active)

### Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         AgentEngine                             │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  MCPClientManager (source/mcp/client.ts)               │   │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────────┐   │   │
│  │  │  WebSocket │  │   Stdio    │  │  Future: SSE   │   │   │
│  │  │  (Chrome)  │  │ (servers)  │  │                │   │   │
│  │  └────────────┘  └────────────┘  └────────────────┘   │   │
│  └─────────────────────────────────────────────────────────┘   │
│                              │                                  │
│                              ▼                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  PermissionManager (source/agent/permissions.ts)        │   │
│  │  - allowedTools: Set<string>                            │   │
│  │  - deniedTools: Set<string>                             │   │
│  │  - checkPermission(toolName) → 'allow'|'deny'|'ask'     │   │
│  └─────────────────────────────────────────────────────────┘   │
│                              │                                  │
│                              ▼                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Anthropic API Integration                             │   │
│  │  - Transform MCP tools → Anthropic format              │   │
│  │  - Streaming responses with tool calls                 │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### MCP Tool Flow (Happy Path)

```
1. INITIALIZATION
   ┌─────────────────────────────────────────────────────────────┐
   │  const mcpManager = new MCPClientManager();                │
   │  await mcpManager.startServer(3000); // For Chrome bridge   │
   │  await mcpManager.connectStdio(name, command, args);       │
   └─────────────────────────────────────────────────────────────┘
                              │
                              ▼
2. CONFIG LOADING
   ┌─────────────────────────────────────────────────────────────┐
   │  const config = await ConfigLoader.loadProjectConfig();    │
   │  // From .floyd/settings.json:                            │
   │  {                                                        │
   │    "allowedTools": ["*"],                                 │
   │    "mcpServers": {                                        │
   │      "filesystem": {                                      │
   │        "command": "npx",                                  │
   │        "args": ["-y", "@modelcontextprotocol/...]         │
   │      }                                                    │
   │    }                                                      │
   │  }                                                        │
   └─────────────────────────────────────────────────────────────┘
                              │
                              ▼
3. SESSION START
   ┌─────────────────────────────────────────────────────────────┐
   │  const permissionManager = new PermissionManager(          │
   │    config.allowedTools                                     │
   │  );                                                        │
   │  engineRef.current = new AgentEngine(...);                 │
   └─────────────────────────────────────────────────────────────┘
                              │
                              ▼
4. MESSAGE LOOP
   ┌─────────────────────────────────────────────────────────────┐
   │  const tools = await mcpManager.listTools();               │
   │  // Dynamically fetch from all connected MCP servers       │
   │                                                             │
   │  const anthropicTools = tools.map(tool => ({              │
   │    name: tool.name,                                        │
   │    description: tool.description,                          │
   │    input_schema: tool.inputSchema,                         │
   │  }));                                                       │
   │                                                             │
   │  // Send to Anthropic API with streaming                   │
   │  const stream = await anthropic.messages.create({...});    │
   └─────────────────────────────────────────────────────────────┘
                              │
                              ▼
5. TOOL EXECUTION
   ┌─────────────────────────────────────────────────────────────┐
   │  // Agent requests tool use                                │
   │  if (permission === 'deny') { ... }                        │
   │                                                             │
   │  const result = await mcpManager.callTool(tc.name, input); │
   │  // Searches all clients for the tool                      │
   │  // Returns result to LLM                                  │
   └─────────────────────────────────────────────────────────────┘
```

---

## Part 2: Adding New MCP Servers

### Step 1: Install the MCP Server

```bash
# Official MCP servers from @modelcontextprotocol
npm install -g @modelcontextprotocol/server-filesystem
npm install -g @modelcontextprotocol/server-git
npm install -g @modelcontextprotocol/server-github
npm install -g @modelcontextprotocol/server-brave-search

# Or use npx without installation:
npx -y @modelcontextprotocol/server-filesystem /path/to/allowed
```

### Step 2: Configure in `.floyd/settings.json`

```json
{
  "systemPrompt": "You are an expert software engineer...",
  "allowedTools": ["*"],
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "."]
    },
    "git": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-git", "--repository", "."]
    },
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_TOKEN": "your_token_here"
      }
    },
    "brave-search": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-brave-search"]
    }
  }
}
```

### Step 3: Server Connection Patterns

#### Stdio Connection (Local Servers)

```typescript
// In app.tsx or initialization code
await mcpManager.connectStdio(
  'filesystem',  // Unique name
  'npx',         // Command
  ['-y', '@modelcontextprotocol/server-filesystem', '.']  // Args
);
```

#### WebSocket Connection (Remote/Bridge)

```typescript
// Already implemented for FloydChrome
await mcpManager.startServer(3000);  // Listens for Chrome extension
```

---

## Part 3: Available MCP Servers (Official)

| Server | Tools Provided | Use Case |
|--------|----------------|----------|
| `@modelcontextprotocol/server-filesystem` | read_file, write_file, list_directory, search_files | File operations |
| `@modelcontextprotocol/server-git` | git_diff, git_log, git_show, git_status | Git operations |
| `@modelcontextprotocol/server-github` | create_issue, create_pull_request, get_issue | GitHub API |
| `@modelcontextprotocol/server-brave-search` | brave_search | Web search |
| `@modelcontextprotocol/server-postgres` | query_postgres, execute_sql | Database queries |
| `@modelcontextprotocol/server-sqlite` | read_sqlite, write_sqlite | SQLite operations |

---

## Part 4: Permission System

### Permission Levels

| Level | Behavior |
|-------|----------|
| `allow` | Tool executes immediately |
| `deny` | Tool blocked, error returned to LLM |
| `ask` | Interactive prompt (future - not yet implemented) |

### Configuration

```json
{
  "allowedTools": [
    "bash",
    "read_file",
    "write_file",
    "git-*",      // Wildcard: all git tools
    "*"           // Allow all tools
  ],
  "deniedTools": [
    "delete_file",
    "rm -rf"
  ]
}
```

### Permission Check Logic

```typescript
// source/agent/permissions.ts
checkPermission(toolName: string): PermissionLevel {
  if (this.deniedTools.has(toolName)) return 'deny';

  for (const allowed of this.allowedTools) {
    if (allowed === '*' || allowed === toolName) return 'allow';
    if (allowed.endsWith('*') && toolName.startsWith(allowed.slice(0, -1)))
      return 'allow';
  }

  return 'ask';
}
```

---

## Part 5: FloydChrome Extension Tools

The FloydChrome extension (`FloydChromeBuild/floydchrome/`) provides browser automation tools via MCP:

### Available Tools

| Tool | File | Description |
|------|------|-------------|
| `navigate` | tools/navigation.js | Navigate to URLs |
| `read_page` | tools/reading.js | Extract page text |
| `find_elements` | tools/reading.js | Query DOM elements |
| `click` | tools/interaction.js | Click elements |
| `type` | tools/interaction.js | Type into inputs |
| `get_tabs` | tools/tabs.js | List open tabs |
| `switch_tab` | tools/tabs.js | Switch active tab |
| `close_tab` | tools/tabs.js | Close a tab |

### Integration Pattern

The Chrome extension connects via WebSocket to the INK CLI MCP server:

```typescript
// Chrome connects to ws://localhost:3000
// Tools are automatically registered and available to the agent
```

---

## Part 6: Go Implementation Status (Broken)

The Go implementation (`agent/tools/executor.go`, `agent/tools/schema.go`) is **currently broken**:

```
┌─────────────────────────────────────────────────────────────┐
│  ISSUE: Archived Dependencies                              │
│  ─────────────────────────────────────────────────────────  │
│  agent/tools/executor.go imports:                          │
│    github.com/Nomadcxx/sysc-Go/tui/floydtools             │
│                                                             │
│  This package was in tui/ which was archived.             │
│  The Go tools implementation will not compile.              │
└─────────────────────────────────────────────────────────────┘
```

### Options to Fix Go Tools

1. **Restore `tui/floydtools/` from archive** - Extract from sysc_src backup
2. **Rewrite as pure Go implementation** - Without sysc-Go dependencies
3. **Port to MCP-based architecture** - Make Go CLI use MCP servers like INK CLI
4. **Deprecate Go CLI** - Focus on INK CLI as the primary interface

---

## Part 7: Creating Custom MCP Tools

### Option A: Python MCP Server

```python
# my_mcp_server.py
from mcp.server import Server
from mcp.types import Tool, TextContent

server = Server("my-custom-tools")

@server.call_tool()
async def my_tool(arguments: dict) -> list[TextContent]:
    # Tool implementation
    return [TextContent(
        type="text",
        text="Tool result"
    )]

@server.list_tools()
async def list_tools() -> list[Tool]:
    return [
        Tool(
            name="my_tool",
            description="Does something useful",
            inputSchema={
                "type": "object",
                "properties": {
                    "param": {"type": "string"}
                },
                "required": ["param"]
            }
        )
    ]
```

### Option B: TypeScript MCP Server

```typescript
// my-mcp-server.ts
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';

const server = new Server(
  { name: 'my-custom-tools', version: '1.0.0' },
  { capabilities: { tools: {} } }
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [{
    name: 'my_tool',
    description: 'Does something useful',
    inputSchema: {
      type: 'object',
      properties: {
        param: { type: 'string' }
      },
      required: ['param']
    }
  }]
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  // Implement tool logic
  return { content: [{ type: 'text', text: 'Tool result' }] };
});
```

### Option C: Inline Tool in INK CLI

For tools that don't need a separate server process, you can add them directly to the MCP client manager:

```typescript
// source/mcp/client.ts - Add inline tool handler
async callTool(name: string, args: any): Promise<any> {
  // Check for inline tools first
  if (name === 'my_inline_tool') {
    return executeInlineTool(args);
  }

  // Otherwise search MCP clients
  for (const client of this.clients.values()) {
    // ... existing logic
  }
}
```

---

## Part 8: Configuration Best Practices

### Environment Variables

```bash
# API Configuration
export ANTHROPIC_AUTH_TOKEN="your-key"
export GLM_API_KEY="your-key"  # Fallback

# MCP Server Environment Variables
export GITHUB_TOKEN="your_github_token"
export BRAVE_API_KEY="your_brave_key"
```

### Per-Project Configuration

```json
{
  "systemPrompt": "Custom system prompt for this project...",
  "allowedTools": ["read_file", "write_file", "bash"],
  "mcpServers": {
    "project-fs": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "./src"]
    }
  }
}
```

---

## Part 9: Quick Start Examples

### Example 1: Enable Filesystem Tools

```bash
# Create .floyd/settings.json
cat > .floyd/settings.json << 'EOF'
{
  "allowedTools": ["*"],
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "."]
    }
  }
}
EOF

# Run INK CLI
cd INK/floyd-cli
npm start
```

### Example 2: Enable Git + Filesystem

```json
{
  "allowedTools": ["git-*", "read_file", "write_file", "list_directory"],
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "."]
    },
    "git": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-git", "--repository", "."]
    }
  }
}
```

### Example 3: Enable Chrome Integration

```bash
# Start INK CLI with Chrome bridge
cd INK/floyd-cli
npm start -- --chrome
# Listens on port 3000 for FloydChrome extension
```

---

## Part 10: Troubleshooting

### Issue: Tools Not Appearing

```bash
# Check MCP server is running
ps aux | grep mcp

# Test MCP server manually
npx -y @modelcontextprotocol/server-filesystem .

# Check .floyd/settings.json syntax
cat .floyd/settings.json | jq .
```

### Issue: Permission Denied

```json
// Check allowedTools in settings.json
{
  "allowedTools": ["*"]  // Temporarily allow all for debugging
}
```

### Issue: Chrome Extension Not Connecting

```bash
# Verify WebSocket server is listening
lsof -i :3000

# Check FloydChrome background console for errors
# chrome://extensions → FloydChrome → Service worker
```

---

## Summary

| Topic | Key Points |
|-------|------------|
| **Active Implementation** | INK CLI (TypeScript) uses MCP for all tools |
| **MCP Servers** | Add via `.floyd/settings.json` mcpServers config |
| **Permissions** | Set allowedTools array with wildcard support |
| **Chrome Tools** | Automatically available when FloydChrome connects via WebSocket |
| **Go CLI** | Currently broken (archived `tui/floydtools` dependency) |
| **Custom Tools** | Create as MCP server (Python/TS) or inline in client |

---

*FLOYD Tool Architecture: Tools come from MCP servers, not hard-coded.*
