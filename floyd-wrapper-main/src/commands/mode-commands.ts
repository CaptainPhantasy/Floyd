/**
 * Mode Management Commands - Floyd Wrapper
 *
 * Commands for switching between execution modes (ASK, YOLO, PLAN, AUTO)
 *
 * Gap #7 FIX: FUCKIT mode now requires explicit confirmation via /confirm-fuckit
 * to prevent accidental activation of the dangerous unrestricted mode.
 */

import type { SlashCommand } from './slash-commands.js';
import type { ExecutionMode } from '../types.js';
import { fuckitState } from '../utils/fuckit-state.js';

// Valid modes
const VALID_MODES: ExecutionMode[] = ['ask', 'yolo', 'plan', 'auto', 'dialogue', 'fuckit'];

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
            ctx.terminal.info('  yolo     - Auto-approves SAFE/MODERATE tools. DANGEROUS tools need approval.');
            ctx.terminal.info('            SAFE: read operations. MODERATE: fetch, git branch, stage.');
            ctx.terminal.info('            DANGEROUS: write, run, delete, git commit (DENIED in piped mode)');
            ctx.terminal.info('  plan     - Planning mode. Analyzes but does not execute changes.');
            ctx.terminal.info('  auto     - Adapts behavior: simple tasks auto-approved, complex tasks use PLAN mode.');
            ctx.terminal.info('            Simple: read files, single operations. Complex: multiple files → blocks writes.');
            ctx.terminal.info('  dialogue - Quick chat mode. One line at a time, no code blocks.');
            ctx.terminal.info('  fuckit   - NO PERMISSIONS. ALL RESTRICTIONS REMOVED. USE AT YOUR OWN RISK.');
            return;
        }

        if (!VALID_MODES.includes(newMode)) {
            ctx.terminal.error(`Invalid mode: ${newMode}`);
            ctx.terminal.info(`Valid modes: ${VALID_MODES.join(', ')}`);
            return;
        }

        // Gap #7 FIX: FUCKIT mode requires explicit confirmation
        if (newMode === 'fuckit') {
            const requested = fuckitState.requestFuckitMode();
            if (requested) {
                ctx.terminal.blank();
                ctx.terminal.error('⚠️  ⚠️  ⚠️  DANGER: FUCKIT MODE REQUESTED  ⚠️  ⚠️  ⚠️');
                ctx.terminal.blank();
                ctx.terminal.warning('FUCKIT mode removes ALL permissions and restrictions.');
                ctx.terminal.warning('Floyd will execute ANY tool WITHOUT asking, including:');
                ctx.terminal.muted('  • delete - Delete files and directories');
                ctx.terminal.muted('  • run    - Execute arbitrary shell commands');
                ctx.terminal.muted('  • write  - Overwrite any file');
                ctx.terminal.muted('  • git    - Commit, push, reset --hard');
                ctx.terminal.blank();
                ctx.terminal.error('YOU ARE RESPONSIBLE FOR ALL CONSEQUENCES.');
                ctx.terminal.blank();
                ctx.terminal.info('To activate FUCKIT mode, type: /confirm-fuckit');
                ctx.terminal.muted('To cancel, type any other command or wait 60 seconds.');
                ctx.terminal.blank();
            } else {
                ctx.terminal.warning('FUCKIT mode activation already pending.');
                ctx.terminal.info('Type /confirm-fuckit to activate or /mode ask to cancel.');
            }
            return;
        }

        // Clear any pending FUCKIT mode request when switching to a different mode
        if (fuckitState.isPending()) {
            fuckitState.clear();
        }

        // Set the mode
        process.env.FLOYD_MODE = newMode;

        // Update system prompt in conversation history to reflect new mode
        if (ctx.engine && typeof ctx.engine.updateSystemPrompt === 'function') {
            ctx.engine.updateSystemPrompt();
        }

        ctx.terminal.success(`Switched to ${newMode.toUpperCase()} mode.`);

        switch (newMode) {
            case 'ask':
                ctx.terminal.muted('Floyd will ask for permission before executing tools.');
                break;
            case 'yolo':
                ctx.terminal.warning('⚠️  YOLO MODE: Auto-approves SAFE tools only.');
                ctx.terminal.muted('SAFE: read-only tools + moderate operations (fetch, branch, stage)');
                ctx.terminal.muted('DANGEROUS: write, run, delete, git_commit STILL require approval');
                ctx.terminal.muted('NOTE: In piped/non-TTY mode, dangerous tools are DENIED (cannot prompt)');
                break;
            case 'plan':
                ctx.terminal.info('Floyd will create plans but NOT edit files.');
                break;
            case 'auto':
                ctx.terminal.info('AUTO mode: Adapts based on task complexity.');
                ctx.terminal.muted('Simple tasks (read files, single operations): Auto-approved');
                ctx.terminal.muted('Complex tasks (multiple files, dangerous tools): → PLAN mode (blocks writes)');
                break;
            case 'dialogue':
                ctx.terminal.info('💬 Quick chat mode. Floyd responds one line at a time.');
                ctx.terminal.muted('Type "/mode ask" to return to normal mode.');
                break;
        }
    },
};

// Command: /confirm-fuckit
// Gap #7 FIX: Confirmation command required to activate FUCKIT mode
export const confirmFuckitCommand: SlashCommand = {
    name: 'confirm-fuckit',
    description: 'Confirm activation of FUCKIT mode (dangerous)',
    usage: '/confirm-fuckit',
    handler: async (ctx) => {
        if (!fuckitState.isPending()) {
            ctx.terminal.error('No pending FUCKIT mode activation.');
            ctx.terminal.info('Use /mode fuckit first to request FUCKIT mode.');
            return;
        }

        // Confirm and activate FUCKIT mode
        fuckitState.confirmFuckitMode();

        // Set the mode
        process.env.FLOYD_MODE = 'fuckit';

        // Update system prompt in conversation history to reflect new mode
        if (ctx.engine && typeof ctx.engine.updateSystemPrompt === 'function') {
            ctx.engine.updateSystemPrompt();
        }

        ctx.terminal.blank();
        ctx.terminal.error('🔥🔥🔥 FUCKIT MODE ACTIVATED 🔥🔥🔥');
        ctx.terminal.blank();
        ctx.terminal.error('ALL PERMISSIONS GRANTED. NO RESTRICTIONS.');
        ctx.terminal.muted('⚠️  Floyd will execute ANY tool WITHOUT asking permission.');
        ctx.terminal.muted('⚠️  This includes dangerous operations like: delete, git commit, run commands, write files');
        ctx.terminal.muted('⚠️  YOU ARE RESPONSIBLE FOR ALL CONSEQUENCES.');
        ctx.terminal.blank();
    },
};

export const modeCommands = [modeCommand, confirmFuckitCommand];
