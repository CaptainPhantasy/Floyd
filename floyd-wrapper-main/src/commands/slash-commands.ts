/**
 * Custom Slash Command System - Floyd Wrapper
 * 
 * Extensible slash command plugin architecture allowing users to define
 * custom commands in .floyd/commands/ directory
 */

import fs from 'fs-extra';
import path from 'node:path';
import { logger } from '../utils/logger.js';
import type { FloydTerminal } from '../ui/terminal.js';
import type { SessionManager } from '../persistence/session-manager.js';

export interface SlashCommandContext {
    /** Terminal instance for output */
    terminal: FloydTerminal;
    /** Session manager instance */
    sessionManager?: SessionManager;
    /** Current working directory */
    cwd: string;
    /** Command arguments */
    args: string[];
    /** Execution engine instance (optional) */
    engine?: any; // Avoiding circular dependency for now
}

export interface SlashCommand {
    /** Command name (without slash) */
    name: string;
    /** Command description */
    description: string;
    /** Usage example */
    usage?: string;
    /** Command handler function */
    handler: (ctx: SlashCommandContext) => Promise<void> | void;
    /** Aliases for this command */
    aliases?: string[];
}

/**
 * Slash Command Registry
 */
export class SlashCommandRegistry {
    private readonly commands: Map<string, SlashCommand> = new Map();

    /**
     * Register a slash command
     */
    register(command: SlashCommand): void {
        this.commands.set(command.name, command);

        // Register aliases
        if (command.aliases) {
            for (const alias of command.aliases) {
                this.commands.set(alias, command);
            }
        }

        logger.debug('Registered slash command', {
            name: command.name,
            aliases: command.aliases
        });
    }

    /**
     * Get a command by name
     */
    get(name: string): SlashCommand | undefined {
        return this.commands.get(name);
    }

    /**
     * List all registered commands
     */
    list(): SlashCommand[] {
        // Return unique commands (excluding aliases)
        const seen = new Set<string>();
        const uniqueCommands: SlashCommand[] = [];

        for (const command of this.commands.values()) {
            if (!seen.has(command.name)) {
                seen.add(command.name);
                uniqueCommands.push(command);
            }
        }

        return uniqueCommands.sort((a, b) => a.name.localeCompare(b.name));
    }

    /**
     * Execute a command
     */
    async execute(name: string, ctx: SlashCommandContext): Promise<boolean> {
        const command = this.get(name);

        if (!command) {
            return false;
        }

        try {
            await command.handler(ctx);
            return true;
        } catch (error) {
            logger.error('Command execution failed', { command: name, error });
            ctx.terminal.error(
                `Command failed: ${error instanceof Error ? error.message : String(error)}`
            );
            return false;
        }
    }

    /**
     * Load custom commands from .floyd/commands/ directory
     */
    async loadCustomCommands(workspaceRoot: string): Promise<number> {
        const commandsDir = path.join(workspaceRoot, '.floyd', 'commands');

        if (!(await fs.pathExists(commandsDir))) {
            logger.debug('No custom commands directory found');
            return 0;
        }

        const files = await fs.readdir(commandsDir);
        const jsFiles = files.filter(f => f.endsWith('.js') || f.endsWith('.mjs'));

        let loadedCount = 0;

        for (const file of jsFiles) {
            try {
                const commandPath = path.join(commandsDir, file);
                const module = await import(commandPath);

                // Module should export a default command or array of commands
                const exported = module.default;

                if (Array.isArray(exported)) {
                    for (const cmd of exported) {
                        this.register(cmd);
                        loadedCount++;
                    }
                } else if (exported && typeof exported === 'object') {
                    this.register(exported as SlashCommand);
                    loadedCount++;
                } else {
                    logger.warn('Invalid command module', { file });
                }
            } catch (error) {
                logger.error('Failed to load custom command', { file, error });
            }
        }

        logger.info('Loaded custom commands', { count: loadedCount });
        return loadedCount;
    }
}

// Export singleton instance
export const slashCommands = new SlashCommandRegistry();
