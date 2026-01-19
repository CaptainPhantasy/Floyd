// MCP (Model Context Protocol) types

export type MCPTool = {
  name: string;
  description?: string;
  inputSchema: Record<string, any>;
};

export type MCPResource = {
  uri: string;
  name: string;
  description?: string;
  mimeType?: string;
};

export type MCPResourceContent = {
  uri: string;
  mimeType?: string;
  text?: string;
  blob?: string;
};

export type MCPCallResult = {
  content: Array<{
    type: string;
    text?: string;
    data?: any;
  }>;
  isError?: boolean;
};

export type MCPClientInfo = {
  name: string;
  version: string;
};

export type MCPClientCapabilities = {
  sampling?: Record<string, unknown>;
  resources?: {
    subscribe?: boolean;
    listChanged?: boolean;
  };
};

/**
 * MCP Server configuration types
 * Used for configuring which MCP servers to connect to
 */

export type MCPTransportType = 'stdio' | 'websocket' | 'sse';

export type MCPStdioConfig = {
  type: 'stdio';
  command: string;
  args?: string[];
  env?: Record<string, string>;
  cwd?: string;
};

export type MCPWebSocketConfig = {
  type: 'websocket';
  url: string;
  headers?: Record<string, string>;
};

export type MCPSSEConfig = {
  type: 'sse';
  url: string;
  headers?: Record<string, string>;
};

export type MCPServerConfig = {
  name: string;
  /** Module path for built-in servers (CLI-specific) */
  modulePath?: string;
  /** Command for stdio external servers */
  command?: string;
  /** Arguments for stdio command */
  args?: string[];
  /** Server description */
  description?: string;
  /** Whether server is enabled */
  enabled?: boolean;
  /** Transport configuration for external MCP servers */
  transport?: MCPStdioConfig | MCPWebSocketConfig | MCPSSEConfig;
};

export type MCPConfigFile = {
  version: string;
  servers: MCPServerConfig[];
};
