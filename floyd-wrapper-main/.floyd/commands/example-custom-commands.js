/**
 * Example Custom Slash Command
 * 
 * Place custom command files in .floyd/commands/
 * Commands must export a default SlashCommand or array of SlashCommands
 * 
 * This example demonstrates creating custom commands for your Floyd workflow.
 */

/** @type {import('../../src/commands/slash-commands.js').SlashCommand} */
const greetCommand = {
    name: 'greet',
    description: 'Greet the user with a custom message',
    usage: '/greet [name]',
    aliases: ['hello', 'hi'],
    async handler(ctx) {
        const name = ctx.args[0] || 'friend';
        ctx.terminal.success(`Hello, ${name}! 👋`);
        ctx.terminal.muted('This is a custom command!');
    },
};

/** @type {import('../../src/commands/slash-commands.js').SlashCommand} */
const statusCommand = {
    name: 'projectstatus',
    description: 'Show current project status',
    usage: '/projectstatus',
    async handler(ctx) {
        ctx.terminal.section('Project Status');
        ctx.terminal.info(`Working Directory: ${ctx.cwd}`);

        if (ctx.sessionManager) {
            const summary = ctx.sessionManager.getHistorySummary();
            ctx.terminal.info(`Active Session Messages: ${summary.total}`);
        }

        ctx.terminal.muted('Add your own status checks here!');
    },
};

// Export single command or array of commands
export default [greetCommand, statusCommand];
