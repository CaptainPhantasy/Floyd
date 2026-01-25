/**
 * Rewind & Sandbox Slash Commands - Floyd Wrapper
 *
 * Commands for checkpoint management and sandbox operations.
 */

import readline from 'node:readline';
import type { SlashCommand } from './slash-commands.js';
import { getCheckpointManager, formatBytes } from '../rewind/index.js';
import { getSandboxManager } from '../sandbox/index.js';

/**
 * Helper function to prompt user for input
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

// ============================================================================
// CHECKPOINT COMMANDS
// ============================================================================

// Command: /checkpoint
export const checkpointCommand: SlashCommand = {
  name: 'checkpoint',
  description: 'Manage file checkpoints (list, create, restore, clear)',
  usage: '/checkpoint [list|create|restore|clear] [args]',
  aliases: ['cp'],
  handler: async (ctx) => {
    const subcommand = ctx.args[0]?.toLowerCase() || 'list';
    const checkpointManager = getCheckpointManager();
    await checkpointManager.initialize();

    switch (subcommand) {
      case 'list':
      case 'ls': {
        const checkpoints = checkpointManager.getAllCheckpoints();
        ctx.terminal.section('📁 File Checkpoints');

        if (checkpoints.length === 0) {
          ctx.terminal.muted('No checkpoints found. Checkpoints are created automatically before dangerous operations.');
        } else {
          for (const cp of checkpoints.slice(0, 10)) {
            const autoTag = cp.automatic ? ' [auto]' : '';
            ctx.terminal.info(`${cp.name}${autoTag}`);
            ctx.terminal.muted(`  ID: ${cp.id.slice(0, 12)}...`);
            ctx.terminal.muted(`  Files: ${cp.fileCount} | Size: ${formatBytes(cp.size)}`);
            ctx.terminal.muted(`  Time: ${cp.createdAt.toLocaleString()}`);
            if (cp.triggerTool) {
              ctx.terminal.muted(`  Trigger: ${cp.triggerTool}`);
            }
          }

          if (checkpoints.length > 10) {
            ctx.terminal.muted(`\n  ... and ${checkpoints.length - 10} more checkpoints`);
          }

          const stats = checkpointManager.getStats();
          ctx.terminal.blank();
          ctx.terminal.muted(`Total: ${stats.totalCheckpoints} checkpoints (${stats.automaticCheckpoints} auto, ${stats.manualCheckpoints} manual)`);
          ctx.terminal.muted(`Storage: ${formatBytes(stats.totalSize)}`);
        }
        break;
      }

      case 'create': {
        const pathArg = ctx.args[1];
        if (!pathArg) {
          ctx.terminal.error('Usage: /checkpoint create <file_path> [description]');
          ctx.terminal.muted('Example: /checkpoint create src/app.ts "Before refactoring"');
          return;
        }

        const description = ctx.args.slice(2).join(' ') || `Manual checkpoint: ${pathArg}`;

        try {
          const checkpoint = await checkpointManager.createCheckpoint([pathArg], {
            name: `Manual: ${pathArg}`,
            description,
            tags: ['manual'],
            automatic: false,
          });

          ctx.terminal.success(`✓ Checkpoint created: ${checkpoint.id.slice(0, 12)}...`);
          ctx.terminal.muted(`  Files: ${checkpoint.fileCount} | Size: ${formatBytes(checkpoint.size)}`);
        } catch (error) {
          ctx.terminal.error(`Failed to create checkpoint: ${error instanceof Error ? error.message : String(error)}`);
        }
        break;
      }

      case 'restore':
      case 'rewind': {
        let checkpointId = ctx.args[1];

        if (!checkpointId) {
          // Show list and ask for selection
          const checkpoints = checkpointManager.getAllCheckpoints();
          if (checkpoints.length === 0) {
            ctx.terminal.error('No checkpoints available to restore.');
            return;
          }

          ctx.terminal.section('Available Checkpoints');
          checkpoints.slice(0, 5).forEach((cp, i) => {
            ctx.terminal.info(`${i + 1}. ${cp.name}`);
            ctx.terminal.muted(`   ID: ${cp.id.slice(0, 12)}... | ${cp.createdAt.toLocaleString()}`);
          });

          const selection = await promptForInput('\nEnter checkpoint number or ID: ');
          const num = parseInt(selection, 10);
          if (!isNaN(num) && num >= 1 && num <= checkpoints.length) {
            checkpointId = checkpoints[num - 1].id;
          } else {
            checkpointId = selection;
          }
        }

        try {
          const result = await checkpointManager.restoreCheckpoint(checkpointId);
          ctx.terminal.success(`✓ Checkpoint restored`);
          ctx.terminal.muted(`  Restored: ${result.restored.length} files`);
          if (result.failed.length > 0) {
            ctx.terminal.warning(`  Failed: ${result.failed.length} files`);
            result.failed.forEach(f => ctx.terminal.muted(`    - ${f}`));
          }
        } catch (error) {
          ctx.terminal.error(`Failed to restore: ${error instanceof Error ? error.message : String(error)}`);
        }
        break;
      }

      case 'clear': {
        const confirm = await promptForInput('Clear all checkpoints? (yes/no): ');
        if (confirm.toLowerCase() === 'yes') {
          await checkpointManager.clearAll();
          ctx.terminal.success('✓ All checkpoints cleared');
        } else {
          ctx.terminal.muted('Cancelled.');
        }
        break;
      }

      case 'stats': {
        const stats = checkpointManager.getStats();
        ctx.terminal.section('📊 Checkpoint Statistics');
        ctx.terminal.info(`Total Checkpoints: ${stats.totalCheckpoints}`);
        ctx.terminal.muted(`  Automatic: ${stats.automaticCheckpoints}`);
        ctx.terminal.muted(`  Manual: ${stats.manualCheckpoints}`);
        ctx.terminal.info(`Total Storage: ${formatBytes(stats.totalSize)}`);
        ctx.terminal.info(`Total Files: ${stats.totalFiles}`);
        if (stats.oldestCheckpoint) {
          ctx.terminal.muted(`Oldest: ${stats.oldestCheckpoint.toLocaleString()}`);
        }
        if (stats.newestCheckpoint) {
          ctx.terminal.muted(`Newest: ${stats.newestCheckpoint.toLocaleString()}`);
        }
        break;
      }

      default:
        ctx.terminal.error(`Unknown subcommand: ${subcommand}`);
        ctx.terminal.muted('Available: list, create, restore, clear, stats');
    }
  },
};

// Command: /rewind (alias for checkpoint restore)
export const rewindCommand: SlashCommand = {
  name: 'rewind',
  description: 'Restore to a previous checkpoint (shortcut for /checkpoint restore)',
  usage: '/rewind [checkpoint-id]',
  handler: async (ctx) => {
    // Delegate to checkpoint command with restore subcommand
    ctx.args = ['restore', ...ctx.args];
    await checkpointCommand.handler(ctx);
  },
};

// ============================================================================
// SANDBOX COMMANDS
// ============================================================================

// Command: /sandbox
export const sandboxCommand: SlashCommand = {
  name: 'sandbox',
  description: 'Manage sandbox mode for safe YOLO execution',
  usage: '/sandbox [start|status|commit|discard|diff]',
  aliases: ['sb'],
  handler: async (ctx) => {
    const subcommand = ctx.args[0]?.toLowerCase() || 'status';
    const sandboxManager = getSandboxManager();

    switch (subcommand) {
      case 'start':
      case 'on': {
        if (sandboxManager.isActive()) {
          ctx.terminal.warning('Sandbox is already active.');
          const session = sandboxManager.getSession();
          if (session) {
            ctx.terminal.muted(`  ID: ${session.id}`);
            ctx.terminal.muted(`  Changes: ${session.changes.length}`);
          }
          return;
        }

        try {
          const session = await sandboxManager.start(ctx.cwd);
          ctx.terminal.success('🔒 Sandbox mode activated');
          ctx.terminal.muted(`  ID: ${session.id}`);
          ctx.terminal.muted(`  Root: ${session.sandboxRoot}`);
          ctx.terminal.blank();
          ctx.terminal.info('All file operations will now be isolated.');
          ctx.terminal.info('Use /sandbox commit to apply changes, or /sandbox discard to cancel.');
        } catch (error) {
          ctx.terminal.error(`Failed to start sandbox: ${error instanceof Error ? error.message : String(error)}`);
        }
        break;
      }

      case 'status': {
        if (!sandboxManager.isActive()) {
          ctx.terminal.info('🔓 Sandbox is not active');
          ctx.terminal.muted('Use /sandbox start to begin sandboxed execution.');
          return;
        }

        const session = sandboxManager.getSession();
        const summary = sandboxManager.getChangesSummary();

        ctx.terminal.section('🔒 Sandbox Status');
        ctx.terminal.info(`State: ${session?.state}`);
        ctx.terminal.muted(`ID: ${session?.id}`);
        ctx.terminal.muted(`Started: ${new Date(session?.createdAt || 0).toLocaleString()}`);

        ctx.terminal.blank();
        ctx.terminal.info('Changes:');
        ctx.terminal.muted(`  Created: ${summary.created} files`);
        ctx.terminal.muted(`  Modified: ${summary.modified} files`);
        ctx.terminal.muted(`  Deleted: ${summary.deleted} files`);
        ctx.terminal.muted(`  Total: ${summary.total} changes`);
        break;
      }

      case 'diff':
      case 'changes': {
        if (!sandboxManager.isActive()) {
          ctx.terminal.error('Sandbox is not active.');
          return;
        }

        const changes = sandboxManager.getChanges();
        if (changes.length === 0) {
          ctx.terminal.info('No changes in sandbox.');
          return;
        }

        ctx.terminal.section('📝 Sandbox Changes');
        for (const change of changes) {
          const icon = change.changeType === 'created' ? '➕' :
            change.changeType === 'modified' ? '📝' : '❌';
          ctx.terminal.info(`${icon} ${change.changeType}: ${change.originalPath}`);
        }
        break;
      }

      case 'commit':
      case 'apply': {
        if (!sandboxManager.isActive()) {
          ctx.terminal.error('Sandbox is not active. Nothing to commit.');
          return;
        }

        const summary = sandboxManager.getChangesSummary();
        if (summary.total === 0) {
          ctx.terminal.info('No changes to commit.');
          await sandboxManager.discard();
          return;
        }

        ctx.terminal.info(`About to commit ${summary.total} changes:`);
        ctx.terminal.muted(`  Created: ${summary.created}`);
        ctx.terminal.muted(`  Modified: ${summary.modified}`);
        ctx.terminal.muted(`  Deleted: ${summary.deleted}`);

        const confirm = await promptForInput('Commit these changes? (yes/no): ');
        if (confirm.toLowerCase() !== 'yes') {
          ctx.terminal.muted('Cancelled.');
          return;
        }

        try {
          const result = await sandboxManager.commit();
          if (result.success) {
            ctx.terminal.success(`✓ Committed ${result.committed.length} changes to project`);
          } else {
            ctx.terminal.warning(`Committed with errors: ${result.failed.length} failed`);
            result.failed.forEach(f => ctx.terminal.muted(`  Failed: ${f}`));
          }
        } catch (error) {
          ctx.terminal.error(`Commit failed: ${error instanceof Error ? error.message : String(error)}`);
        }
        break;
      }

      case 'discard':
      case 'off':
      case 'cancel': {
        if (!sandboxManager.isActive()) {
          ctx.terminal.info('Sandbox is not active.');
          return;
        }

        const summary = sandboxManager.getChangesSummary();
        if (summary.total > 0) {
          const confirm = await promptForInput(`Discard ${summary.total} changes? (yes/no): `);
          if (confirm.toLowerCase() !== 'yes') {
            ctx.terminal.muted('Cancelled.');
            return;
          }
        }

        await sandboxManager.discard();
        ctx.terminal.success('🔓 Sandbox discarded. All changes were reverted.');
        break;
      }

      default:
        ctx.terminal.error(`Unknown subcommand: ${subcommand}`);
        ctx.terminal.muted('Available: start, status, diff, commit, discard');
    }
  },
};

// ============================================================================
// EXPORT ALL COMMANDS
// ============================================================================

export const rewindCommands: SlashCommand[] = [
  checkpointCommand,
  rewindCommand,
  sandboxCommand,
];
