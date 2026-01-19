export interface ConfigOptions {
    systemPrompt?: string;
    allowedTools?: string[];
    mcpServers?: Record<string, any>;
    workingDirectory?: string;
}
export interface MCPServerConfig {
    command: string;
    args?: string[];
    env?: Record<string, string>;
}
/**
 * Config manages agent configuration from multiple sources
 *
 * Priority (highest to lowest):
 * 1. Programmatically set options
 * 2. .floyd/settings.json in working directory
 * 3. CLAUDE.md in working directory
 * 4. Default values
 */
export declare class Config {
    systemPrompt: string;
    allowedTools: string[];
    mcpServers: Record<string, MCPServerConfig>;
    private workingDirectory;
    constructor(options?: ConfigOptions);
    /**
     * Load configuration from the working directory
     */
    load(cwd?: string): Promise<void>;
    /**
     * Get allowed tools
     */
    getAllowedTools(): string[];
    /**
     * Add an allowed tool
     */
    addAllowedTool(tool: string): void;
    /**
     * Get MCP servers configuration
     */
    getMCPServers(): Record<string, MCPServerConfig>;
    /**
     * Get working directory
     */
    getWorkingDirectory(): string;
    /**
     * Set working directory
     */
    setWorkingDirectory(dir: string): void;
    /**
     * Get default system prompt
     */
    private getDefaultPrompt;
}
/**
 * ConfigLoader provides static methods for configuration loading
 */
export declare class ConfigLoader {
    /**
     * Load configuration from a directory
     */
    static load(cwd?: string): Promise<Config>;
    /**
     * Load configuration with custom options
     */
    static loadWithOptions(options: ConfigOptions): Promise<Config>;
}
//# sourceMappingURL=config.d.ts.map