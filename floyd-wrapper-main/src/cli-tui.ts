/**
 * Floyd TUI Launcher - Launches full Ink-based TUI
 *
 * This is a convenience wrapper that launches the full Floyd CLI
 * with the Ink-based terminal UI from INK/floyd-cli.
 *
 * Usage:
 *   floyd-tui              - Launch TUI mode
 *   floyd --tui            - Launch TUI mode from wrapper
 */

import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Main TUI launcher function
 */
async function launchTUI(args: string[] = []): Promise<void> {
  // Path to the INK/floyd-cli dist directory
  const inkCliPath = path.resolve(__dirname, '../../INK/floyd-cli/dist/cli.js');

  console.error(`
╔═══════════════════════════════════════════════════════╗
║         🔥 FLOYD - Terminal UI Mode 🔥               ║
║   File-Logged Orchestrator Yielding Deliverables      ║
╚═══════════════════════════════════════════════════════╝
  `);

  // Spawn the Ink CLI process
  const inkProcess = spawn('node', [inkCliPath, ...args], {
    stdio: 'inherit',
    env: {
      ...process.env,
      FLOYD_MODE: 'tui',
    },
  });

  // Forward exit code
  inkProcess.on('exit', (code) => {
    process.exit(code ?? 0);
  });

  // Handle errors
  inkProcess.on('error', (error) => {
    console.error('Failed to launch Floyd TUI:', error.message);
    console.error('\nMake sure INK/floyd-cli is built:');
    console.error('  cd INK/floyd-cli && npm run build');
    process.exit(1);
  });
}

// Export for testing
export { launchTUI };

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2);
  launchTUI(args).catch((error) => {
    console.error('Error launching TUI:', error);
    process.exit(1);
  });
}
