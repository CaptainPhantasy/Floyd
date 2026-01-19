// MCP Configuration Loader
// Loads and validates MCP server configuration from files

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import type { MCPConfigFile, MCPServerConfig } from './types.js';

const CONFIG_VERSION = '1.0';

/**
 * Default configuration file locations searched in order
 */
const DEFAULT_CONFIG_PATHS = [
  '.floyd/mcp.json',
  '.floyd/mcp.config.json',
  'mcp.config.json',
];

/**
 * Load MCP configuration from default locations
 *
 * Searches for config files in standard locations and loads the first one found.
 * Returns default empty config if no file exists.
 */
export function loadMCPConfig(projectRoot: string = process.cwd()): MCPConfigFile {
  for (const relativePath of DEFAULT_CONFIG_PATHS) {
    const fullPath = join(projectRoot, relativePath);
    if (existsSync(fullPath)) {
      try {
        const content = readFileSync(fullPath, 'utf-8');
        const config = JSON.parse(content) as MCPConfigFile;
        validateConfig(config);
        return config;
      } catch (error) {
        throw new Error(
          `Failed to load MCP config from ${fullPath}: ${error instanceof Error ? error.message : String(error)}`
        );
      }
    }
  }

  // Return default empty config
  return {
    version: CONFIG_VERSION,
    servers: [],
  };
}

/**
 * Load MCP configuration from a specific file path
 */
export function loadMCPConfigFromFile(filePath: string): MCPConfigFile {
  if (!existsSync(filePath)) {
    throw new Error(`MCP config file not found: ${filePath}`);
  }

  const content = readFileSync(filePath, 'utf-8');
  const config = JSON.parse(content) as MCPConfigFile;
  validateConfig(config);
  return config;
}

/**
 * Validate MCP configuration structure
 */
function validateConfig(config: MCPConfigFile): void {
  if (!config.version) {
    throw new Error('MCP config missing "version" field');
  }

  if (!Array.isArray(config.servers)) {
    throw new Error('MCP config "servers" must be an array');
  }

  for (let i = 0; i < config.servers.length; i++) {
    const server = config.servers[i];
    if (!server.name) {
      throw new Error(`MCP server at index ${i} missing "name" field`);
    }
    if (!server.transport) {
      throw new Error(`MCP server "${server.name}" missing "transport" field`);
    }
    if (!server.transport.type) {
      throw new Error(`MCP server "${server.name}" transport missing "type" field`);
    }

    // Validate transport-specific fields
    switch (server.transport.type) {
      case 'stdio':
        if (!server.transport.command) {
          throw new Error(`MCP server "${server.name}" (stdio) missing "command" field`);
        }
        break;
      case 'websocket':
      case 'sse':
        if (!server.transport.url) {
          throw new Error(`MCP server "${server.name}" (${server.transport.type}) missing "url" field`);
        }
        break;
    }
  }
}

/**
 * Get enabled servers from configuration
 */
export function getEnabledServers(config: MCPConfigFile): MCPServerConfig[] {
  return config.servers.filter((server) => server.enabled !== false);
}

/**
 * Create a sample MCP configuration for documentation
 */
export function createSampleConfig(): MCPConfigFile {
  return {
    version: CONFIG_VERSION,
    servers: [
      {
        name: 'filesystem',
        enabled: false,
        transport: {
          type: 'stdio',
          command: 'npx',
          args: ['-y', '@modelcontextprotocol/server-filesystem', '/tmp/allowed'],
        },
      },
      {
        name: 'github',
        enabled: false,
        transport: {
          type: 'stdio',
          command: 'npx',
          args: ['-y', '@modelcontextprotocol/server-github'],
          env: {
            GITHUB_TOKEN: 'your-github-token-here',
          },
        },
      },
      {
        name: 'custom-websocket',
        enabled: false,
        transport: {
          type: 'websocket',
          url: 'ws://localhost:8080/mcp',
        },
      },
    ],
  };
}
