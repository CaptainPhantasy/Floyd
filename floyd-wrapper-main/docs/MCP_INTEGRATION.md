# MCP (Model Context Protocol) Integration

Floyd supports MCP (Model Context Protocol) for connecting to external tools and services through standardized servers.

## Configuration

### Option 1: .floyd/mcp-config.json

Create a `.floyd/mcp-config.json` file in your project root:

```json
{
  "servers": [
    {
      "name": "supabase",
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-supabase"],
      "enabled": true,
      "description": "Supabase MCP server for database operations"
    }
  ],
  "autoConnect": true
}
```

### Option 2: FLOYD.md

Add an MCP configuration block to your `FLOYD.md`:

````markdown
# Floyd Configuration

## MCP Servers

```mcp
{
  "servers": [
    {
      "name": "filesystem",
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "."],
      "enabled": true
    }
  ],
  "autoConnect": true
}
```
````

## Available Commands

- `/mcp-servers` or `/mcp` - List all registered MCP servers
- `/mcp-connect <server-name>` - Connect to an MCP server
- `/mcp-disconnect <server-name>` - Disconnect from an MCP server
- `/mcp-tools` - List available tools from connected servers

## Server Configuration

Each server configuration supports:

- `name` (required): Unique identifier for the server
- `command` (required): Command to execute (e.g., "npx", "node")
- `args` (optional): Array of command arguments
- `env` (optional): Environment variables for the server
- `enabled` (optional): Whether the server is enabled (default: true)
- `description` (optional): Human-readable description

## Example Servers

### Supabase
```json
{
  "name": "supabase",
  "command": "npx",
  "args": ["-y", "@modelcontextprotocol/server-supabase"],
  "enabled": true
}
```

### Filesystem
```json
{
  "name": "filesystem",
  "command": "npx",
  "args": ["-y", "@modelcontextprotocol/server-filesystem", "."],
  "enabled": true
}
```

### GitHub
```json
{
  "name": "github",
  "command": "npx",
  "args": ["-y", "@modelcontextprotocol/server-github"],
  "enabled": true,
  "env": {
    "GITHUB_TOKEN": "${GITHUB_TOKEN}"
  }
}
```

## Auto-Connect

Set `autoConnect: true` in your configuration to automatically connect to all enabled servers when Floyd starts.

## Implementation Status

- ✅ Configuration loading from `.floyd/mcp-config.json`
- ✅ Configuration extraction from `FLOYD.md`
- ✅ Server registration and management
- ✅ Connection/disconnection commands
- ⚠️ Actual MCP protocol implementation (placeholder - needs JSON-RPC over stdio)
- ⚠️ Tool discovery and invocation (placeholder - needs MCP protocol methods)

## Future Enhancements

- Full MCP protocol implementation (JSON-RPC over stdio)
- Tool discovery and automatic registration with agent
- MCP resource support
- MCP prompt support
- Server health monitoring and auto-reconnect
