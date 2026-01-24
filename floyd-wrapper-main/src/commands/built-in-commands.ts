/**
 * Built-in Slash Commands - Floyd Wrapper
 *
 * Core slash commands bundled with Floyd
 */

import readline from 'node:readline';
import path from 'node:path';
import fs from 'fs-extra';
import type { SlashCommand } from './slash-commands.js';

/**
 * Helper function to prompt user for input when commands need arguments
 */
async function promptForInput(question: string): Promise<string> {
    return new Promise<string>((resolve) => {
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
        });

        rl.question(question, (answer) => {
            rl.close();
            resolve(answer.trim());
        });
    });
}

// Command: /compact
export const compactCommand: SlashCommand = {
    name: 'compact',
    description: 'Remove old messages, keep [count] most recent (default: 20)',
    usage: '/compact [count]',
    handler: async (ctx) => {
        if (!ctx.sessionManager) {
            ctx.terminal.error('Session manager not initialized');
            return;
        }

        let keepCount: number;
        if (ctx.args[0]) {
            keepCount = parseInt(ctx.args[0], 10);
        } else {
            const answer = await promptForInput('Enter number of messages to keep (default: 20): ');
            keepCount = parseInt(answer || '20', 10);
        }

        const removed = ctx.sessionManager.compactHistory(keepCount);

        if (removed > 0) {
            ctx.terminal.success(
                `Compacted history: removed ${removed} messages, keeping ${keepCount} most recent.`
            );
        } else {
            ctx.terminal.info('History is already compact.');
        }
    },
};

// Command: /history
export const historyCommand: SlashCommand = {
    name: 'history',
    description: 'Show conversation history summary',
    usage: '/history',
    handler: async (ctx) => {
        if (!ctx.sessionManager) {
            ctx.terminal.error('Session manager not initialized');
            return;
        }

        const summary = ctx.sessionManager.getHistorySummary();
        ctx.terminal.section('Conversation History');
        ctx.terminal.info(`Total messages: ${summary.total}`);

        for (const [role, count] of Object.entries(summary.byRole)) {
            ctx.terminal.muted(`  ${role}: ${count}`);
        }

        if (summary.firstMessage) {
            ctx.terminal.muted(`  First: ${new Date(summary.firstMessage).toLocaleString()}`);
        }
        if (summary.lastMessage) {
            ctx.terminal.muted(`  Last: ${new Date(summary.lastMessage).toLocaleString()}`);
        }
    },
};

// Command: /sessions
export const sessionsCommand: SlashCommand = {
    name: 'sessions',
    description: 'List all available sessions',
    usage: '/sessions',
    aliases: ['ls'],
    handler: async (ctx) => {
        if (!ctx.sessionManager) {
            ctx.terminal.error('Session manager not initialized');
            return;
        }

        const sessions = ctx.sessionManager.listSessions();
        ctx.terminal.section('Available Sessions');

        if (sessions.length === 0) {
            ctx.terminal.muted('No sessions found.');
        } else {
            for (const session of sessions) {
                const current = session.id === ctx.sessionManager.getCurrentSessionId() ? ' (current)' : '';
                ctx.terminal.info(`${session.name}${current}`);
                ctx.terminal.muted(`  ID: ${session.id}`);
                ctx.terminal.muted(`  Updated: ${new Date(session.updatedAt).toLocaleString()}`);
            }
        }
    },
};

// Command: /checkpoints
export const checkpointsCommand: SlashCommand = {
    name: 'checkpoints',
    description: 'List file checkpoints for current session',
    usage: '/checkpoints',
    handler: async (ctx) => {
        if (!ctx.sessionManager) {
            ctx.terminal.error('Session manager not initialized');
            return;
        }

        const checkpoints = ctx.sessionManager.listCheckpoints();
        ctx.terminal.section('File Checkpoints');

        if (checkpoints.length === 0) {
            ctx.terminal.muted('No checkpoints found.');
        } else {
            for (const cp of checkpoints) {
                ctx.terminal.info(`${cp.description}`);
                ctx.terminal.muted(`  ID: ${cp.id}`);
                ctx.terminal.muted(`  File: ${cp.filePath}`);
                ctx.terminal.muted(`  Time: ${new Date(cp.timestamp).toLocaleString()}`);
                ctx.terminal.muted(`  Trigger: ${cp.triggerEvent}`);
            }
        }
    },
};

// Command: /restore
export const restoreCommand: SlashCommand = {
    name: 'restore',
    description: 'Restore a file from checkpoint',
    usage: '/restore <checkpoint-id>',
    handler: async (ctx) => {
        if (!ctx.sessionManager) {
            ctx.terminal.error('Session manager not initialized');
            return;
        }

        let checkpointId = ctx.args[0];
        if (!checkpointId) {
            checkpointId = await promptForInput('Enter checkpoint ID: ');
        }

        if (!checkpointId) {
            ctx.terminal.error('No checkpoint ID provided');
            return;
        }

        const checkpoint = ctx.sessionManager.getCheckpointContent(checkpointId);
        if (!checkpoint) {
            ctx.terminal.error(`Checkpoint not found: ${checkpointId}`);
            return;
        }

        try {
            await fs.writeFile(checkpoint.filePath, checkpoint.content);
            ctx.terminal.success(`Restored: ${checkpoint.filePath}`);
        } catch (error) {
            ctx.terminal.error(
                `Failed to restore: ${error instanceof Error ? error.message : String(error)}`
            );
        }
    },
};

// Command: /export
export const exportCommand: SlashCommand = {
    name: 'export',
    description: 'Export current session to Obsidian markdown',
    usage: '/export [directory]',
    handler: async (ctx) => {
        if (!ctx.sessionManager) {
            ctx.terminal.error('Session manager not initialized');
            return;
        }

        try {
            const { ObsidianExporter } = await import('../persistence/obsidian-exporter.js');

            const sessionId = ctx.sessionManager.getCurrentSessionId();
            if (!sessionId) {
                ctx.terminal.error('No active session to export');
                return;
            }

            const currentSession = ctx.sessionManager.listSessions().find((s: any) => s.id === sessionId);
            if (!currentSession) {
                ctx.terminal.error('Could not find current session');
                return;
            }

            const messages = ctx.sessionManager.getHistory();
            let outputDir = ctx.args[0];

            if (!outputDir) {
                outputDir = await promptForInput(`Enter output directory [default: .floyd/exports]: `);
                if (!outputDir) {
                    outputDir = path.join(ctx.cwd, '.floyd', 'exports');
                }
            }

            const filepath = await ObsidianExporter.exportSession(currentSession, messages, {
                outputDir,
                includeFrontmatter: true,
                includeTimestamps: true,
                tags: ['floyd', 'conversation'],
            });

            ctx.terminal.success(`Exported to: ${filepath}`);
            ctx.terminal.muted(`  Messages: ${messages.length}`);
        } catch (error) {
            ctx.terminal.error(`Export failed: ${error instanceof Error ? error.message : String(error)}`);
        }
    },
};

// Command: /help
export const helpCommand: SlashCommand = {
    name: 'help',
    description: 'Show available commands',
    usage: '/help',
    aliases: ['?'],
    handler: async (ctx) => {
        const { slashCommands } = await import('./slash-commands.js');
        const commands = slashCommands.list();

        // Define which commands need argument prompts
        // Keys are command names, values are prompt questions
        const argPrompts: Record<string, string> = {
            'restore': 'Enter checkpoint ID: ',
            'mcp-connect': 'Enter MCP server name: ',
            'mcp-disconnect': 'Enter MCP server name: ',
            'mode': 'Enter mode (ask/yolo/plan/auto/dialogue) [optional, press Enter to skip]: ',
            'compact': 'Enter number of messages to keep [optional, press Enter for default 20]: ',
            'export': 'Enter output directory [optional, press Enter for default]: ',
        };

        // Helper to prompt for a single argument
        async function promptForArgument(promptText: string): Promise<string> {
            return new Promise<string>((resolve) => {
                const rl = readline.createInterface({
                    input: process.stdin,
                    output: process.stdout,
                });
                rl.question(promptText, (answer: string) => {
                    rl.close();
                    resolve(answer.trim());
                });
            });
        }

        // Convert commands to menu items
        const menuItems = commands
            .map((cmd) => ({
                name: cmd.usage || `/${cmd.name}`,
                description: cmd.description || 'No description',
                handler: async () => {
                    // Check if command needs arguments and prompt for them
                    const prompt = argPrompts[cmd.name];
                    let args: string[] = [...ctx.args]; // Copy original args (usually empty from menu)

                    if (prompt) {
                        const userInput = await promptForArgument(prompt);
                        if (userInput) {
                            args = userInput.split(/\s+/);
                        }
                    }

                    // Execute command with gathered arguments
                    await slashCommands.execute(cmd.name, { ...ctx, args });
                },
            }));

        try {
            // Show interactive menu
            const { showInteractiveMenu } = await import('../ui/interactive-menu.js');
            const selected = await showInteractiveMenu(menuItems);

            if (selected && selected.handler) {
                // Clear screen before executing
                console.clear();
                await selected.handler();
            } else {
                // User cancelled - just return to prompt
                console.clear();
                ctx.terminal.muted('Help cancelled.');
            }
        } catch (error) {
            // Make sure to restore terminal state on error
            try {
                process.stdin.setRawMode(false);
                process.stdin.pause();
                process.stdout.write('\x1B[?25h');
            } catch (e) {
                // Ignore cleanup errors
            }
            console.clear();
            ctx.terminal.error(`Menu error: ${error instanceof Error ? error.message : String(error)}`);
        }
    },
};


// Command: /stats
export const statsCommand: SlashCommand = {
    name: 'stats',
    description: 'Show session token usage statistics',
    usage: '/stats',
    handler: async (ctx) => {
        if (!ctx.engine) {
            ctx.terminal.error('Engine not initialized');
            return;
        }

        if (typeof ctx.engine.getTokenStatistics !== 'function') {
            ctx.terminal.error('Engine does not support statistics');
            return;
        }

        const usage = ctx.engine.getTokenStatistics();
        ctx.terminal.section('Session Statistics');
        ctx.terminal.info(`Input Tokens:  ${usage.inputTokens.toLocaleString()}`);
        // Highlight output tokens as they are more expensive/relevant usually
        ctx.terminal.info(`Output Tokens: ${usage.outputTokens.toLocaleString()}`);
        ctx.terminal.muted('─'.repeat(30));
        ctx.terminal.success(`Total Tokens:  ${usage.totalTokens.toLocaleString()}`);
    },
};

// Export all built-in commands
export const builtInCommands: SlashCommand[] = [
    compactCommand,
    historyCommand,
    sessionsCommand,
    checkpointsCommand,
    restoreCommand,
    exportCommand,
    helpCommand,
    statsCommand,
];
