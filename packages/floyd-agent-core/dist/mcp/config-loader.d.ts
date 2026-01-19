import type { MCPConfigFile, MCPServerConfig } from './types.js';
/**
 * Load MCP configuration from default locations
 *
 * Searches for config files in standard locations and loads the first one found.
 * Returns default empty config if no file exists.
 */
export declare function loadMCPConfig(projectRoot?: string): MCPConfigFile;
/**
 * Load MCP configuration from a specific file path
 */
export declare function loadMCPConfigFromFile(filePath: string): MCPConfigFile;
/**
 * Get enabled servers from configuration
 */
export declare function getEnabledServers(config: MCPConfigFile): MCPServerConfig[];
/**
 * Create a sample MCP configuration for documentation
 */
export declare function createSampleConfig(): MCPConfigFile;
//# sourceMappingURL=config-loader.d.ts.map