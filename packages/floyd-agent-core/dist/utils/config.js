// Configuration management for Floyd agent
// Loads configuration from CLAUDE.md and .floyd/settings.json
import fs from 'fs/promises';
import path from 'path';
/**
 * Config manages agent configuration from multiple sources
 *
 * Priority (highest to lowest):
 * 1. Programmatically set options
 * 2. .floyd/settings.json in working directory
 * 3. CLAUDE.md in working directory
 * 4. Default values
 */
export class Config {
    systemPrompt = '';
    allowedTools;
    mcpServers;
    workingDirectory;
    constructor(options = {}) {
        this.workingDirectory = options.workingDirectory || process.cwd();
        this.systemPrompt = options.systemPrompt || this.getDefaultPrompt();
        this.allowedTools = options.allowedTools || [];
        this.mcpServers = options.mcpServers || {};
    }
    /**
     * Load configuration from the working directory
     */
    async load(cwd) {
        const workingDir = cwd || this.workingDirectory;
        this.workingDirectory = workingDir;
        // Load CLAUDE.md if present
        const claudeMdPath = path.join(workingDir, 'CLAUDE.md');
        try {
            const content = await fs.readFile(claudeMdPath, 'utf-8');
            this.systemPrompt += `\n\nProject Context (from CLAUDE.md):\n${content}`;
        }
        catch {
            // CLAUDE.md doesn't exist, continue
        }
        // Load .floyd/settings.json if present
        const settingsPath = path.join(workingDir, '.floyd', 'settings.json');
        try {
            const data = await fs.readFile(settingsPath, 'utf-8');
            const settings = JSON.parse(data);
            if (settings.systemPrompt) {
                this.systemPrompt += `\n${settings.systemPrompt}`;
            }
            if (settings.allowedTools) {
                this.allowedTools = settings.allowedTools;
            }
            if (settings.mcpServers) {
                this.mcpServers = settings.mcpServers;
            }
        }
        catch {
            // settings.json doesn't exist or is invalid
        }
    }
    /**
     * Get allowed tools
     */
    getAllowedTools() {
        return this.allowedTools;
    }
    /**
     * Add an allowed tool
     */
    addAllowedTool(tool) {
        this.allowedTools.push(tool);
    }
    /**
     * Get MCP servers configuration
     */
    getMCPServers() {
        return this.mcpServers;
    }
    /**
     * Get working directory
     */
    getWorkingDirectory() {
        return this.workingDirectory;
    }
    /**
     * Set working directory
     */
    setWorkingDirectory(dir) {
        this.workingDirectory = dir;
    }
    /**
     * Get default system prompt
     */
    getDefaultPrompt() {
        return `You are Floyd, a helpful AI coding assistant.

You can help with:
- Writing and debugging code
- Explaining technical concepts
- Analyzing codebases
- Running commands and tools
- File operations

When writing code:
- Follow existing project conventions
- Include necessary imports
- Add error handling where appropriate
- Keep code clean and readable

Be concise and get straight to the point. Avoid "word salad" and unnecessary pleasantries.`;
    }
}
/**
 * ConfigLoader provides static methods for configuration loading
 */
export class ConfigLoader {
    /**
     * Load configuration from a directory
     */
    static async load(cwd = process.cwd()) {
        const config = new Config({ workingDirectory: cwd });
        await config.load(cwd);
        return config;
    }
    /**
     * Load configuration with custom options
     */
    static async loadWithOptions(options) {
        const config = new Config(options);
        await config.load(options.workingDirectory);
        return config;
    }
}
//# sourceMappingURL=config.js.map