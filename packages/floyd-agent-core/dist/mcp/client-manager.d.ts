import type { MCPTool, MCPResource, MCPCallResult, MCPServerConfig, MCPConfigFile } from './types.js';
export interface MCPClientConfig {
    name: string;
    version: string;
}
export interface StdioServerConfig {
    name: string;
    command: string;
    args?: string[];
    env?: Record<string, string>;
}
/**
 * MCPClientManager manages multiple MCP client connections
 *
 * Responsibilities:
 * - Hosting a WebSocket server for external MCP clients (e.g., Chrome extension)
 * - Connecting to local MCP servers via stdio
 * - Aggregating tools from all connected clients
 * - Routing tool calls to the appropriate client
 */
export declare class MCPClientManager {
    private clients;
    private wss;
    private toolToClientMap;
    /**
     * Start a WebSocket server for external MCP clients
     *
     * This is used by the Chrome extension to connect to Floyd.
     * The extension acts as an MCP server, and Floyd acts as the client.
     *
     * @param port - Port to listen on (default: 3000)
     */
    startServer(port?: number): Promise<void>;
    /**
     * Stop the WebSocket server
     */
    stopServer(): Promise<void>;
    /**
     * Connect to an MCP server via stdio
     *
     * @param name - Unique identifier for this client
     * @param command - Command to start the server
     * @param args - Arguments to pass to the command
     * @param env - Optional environment variables
     * @param cwd - Optional working directory
     */
    connectStdio(name: string, command: string, args?: string[], env?: Record<string, string>, cwd?: string): Promise<void>;
    /**
     * Connect to MCP servers from configuration
     *
     * Takes an array of server configurations and connects to all enabled ones.
     * Skips servers with `enabled: false` and logs errors without throwing.
     *
     * @param servers - Array of MCP server configurations
     * @returns Object with connected and failed server counts
     */
    connectFromConfig(servers: MCPServerConfig[]): Promise<{
        connected: number;
        failed: number;
        errors: Array<{
            server: string;
            error: string;
        }>;
    }>;
    /**
     * Connect to a single MCP server from its configuration
     */
    private connectServer;
    /**
     * Connect to an MCP server via WebSocket (as a client)
     *
     * @param name - Unique identifier for this client
     * @param url - WebSocket URL to connect to
     * @param headers - Optional headers to include
     */
    connectWebSocket(name: string, url: string, headers?: Record<string, string>): Promise<void>;
    /**
     * Disconnect a client
     */
    disconnect(clientId: string): Promise<void>;
    /**
     * List all tools from all connected clients
     */
    listTools(): Promise<MCPTool[]>;
    /**
     * Call a tool on the appropriate client
     */
    callTool(name: string, args: Record<string, any>): Promise<MCPCallResult>;
    /**
     * List resources from all clients
     */
    listResources(): Promise<MCPResource[]>;
    /**
     * Read a resource
     */
    readResource(uri: string): Promise<any>;
    /**
     * Get number of connected clients
     */
    getClientCount(): number;
    /**
     * Check if server is running
     */
    isServerRunning(): boolean;
    /**
     * Update the tool-to-client cache
     */
    private updateToolCache;
    /**
     * Clear cached tool mappings for a client
     */
    private clearToolCache;
    /**
     * Load MCP configuration from .floyd/mcp.json or similar locations
     */
    loadMCPConfig(projectRoot?: string): MCPConfigFile;
    /**
     * Connect to external MCP servers from configuration file
     */
    connectExternalServers(projectRoot?: string): Promise<{
        connected: number;
        failed: number;
        errors: Array<{
            server: string;
            error: string;
        }>;
    }>;
}
//# sourceMappingURL=client-manager.d.ts.map