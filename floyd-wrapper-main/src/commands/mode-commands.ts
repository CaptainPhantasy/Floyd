/**
 * Mode Management Commands - Floyd Wrapper
 *
 * Commands for switching between execution modes (ASK, YOLO, PLAN, AUTO)
 */

import type { SlashCommand } from './slash-commands.js';
import type { ExecutionMode } from '../types.js';

// Valid modes
const VALID_MODES: ExecutionMode[] = ['ask', 'yolo', 'plan', 'auto', 'dialogue'];

// Command: /mode
export const modeCommand: SlashCommand = {
    name: 'mode',
    description: 'Switch execution mode (ask, yolo, plan, auto)',
    usage: '/mode <mode>',
    handler: async (ctx) => {
        let newMode = ctx.args[0]?.toLowerCase() as ExecutionMode;

        if (!newMode) {
            // Show current mode
            ctx.terminal.section('Execution Modes');
            ctx.terminal.info('Current Mode: ' + (process.env.FLOYD_MODE || 'ask'));
            ctx.terminal.blank();
            ctx.terminal.info('Available Modes:');
            ctx.terminal.info('  ask      - Default mode. Asks for permission before executing tools.');
            ctx.terminal.info('  yolo     - Autonomous mode. Executes "safe" tools without permission.');
            ctx.terminal.info('  plan     - Planning mode. analyses but does not execute changes.');
            ctx.terminal.info('  auto     - Agent decides appropriate mode based on request.');
            ctx.terminal.info('  dialogue - Quick chat mode. One line at a time, no code blocks.');
            return;
        }

        if (!VALID_MODES.includes(newMode)) {
            ctx.terminal.error(`Invalid mode: ${newMode}`);
            ctx.terminal.info(`Valid modes: ${VALID_MODES.join(', ')}`);
            return;
        }

        // Set the mode
        process.env.FLOYD_MODE = newMode;

        ctx.terminal.success(`Switched to ${newMode.toUpperCase()} mode.`);

        switch (newMode) {
            case 'ask':
                ctx.terminal.muted('Floyd will ask for permission before executing tools.');
                break;
            case 'yolo':
                ctx.terminal.warning('⚠️  Floyd will execute safe tools AUTOMATICALLY.');
                break;
            case 'plan':
                ctx.terminal.info('Floyd will create plans but NOT edit files.');
                break;
            case 'auto':
                ctx.terminal.info('Floyd will decide the best mode for each request.');
                break;
            case 'dialogue':
                ctx.terminal.info('💬 Quick chat mode. Floyd responds one line at a time.');
                ctx.terminal.muted('Type "/mode ask" to return to normal mode.');
                break;
        }
    },
};

export const modeCommands = [modeCommand];
