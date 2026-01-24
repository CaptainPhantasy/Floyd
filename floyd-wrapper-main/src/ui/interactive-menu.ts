/**
 * Interactive Menu - Floyd Wrapper
 *
 * Terminal UI menu with arrow key navigation and highlighted selection
 */

import readline from 'node:readline';
import chalk from 'chalk';
import { CRUSH_THEME } from '../constants.js';

export interface MenuItem {
  /** Display name */
  name: string;
  /** Description of what the menu item does */
  description: string;
  /** Command or action to execute */
  action?: string;
  /** Optional handler function */
  handler?: () => void | Promise<void>;
}

/**
 * Interactive menu class with proper arrow key navigation
 */
export class InteractiveMenu {
  private items: MenuItem[];
  private selectedIndex: number = 0;
  private rl: readline.Interface | null = null;

  constructor(items: MenuItem[]) {
    this.items = items;
  }

  /**
   * Show the interactive menu and wait for selection
   */
  async show(): Promise<MenuItem | null> {
    this.selectedIndex = 0;

    // Hide cursor
    process.stdout.write('\x1B[?25l');

    // Create readline for raw input
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      terminal: true,
    });

    // Set raw mode to capture individual keys
    (process.stdin as any).setRawMode(true);

    // Render initial menu
    this.render();

    // Wait for selection
    const selected = await this.waitForSelection();

    // Show cursor again
    process.stdout.write('\x1B[?25h');

    // Clean up
    if (this.rl) {
      this.rl.close();
      this.rl = null;
    }
    (process.stdin as any).setRawMode(false);

    return selected;
  }

  /**
   * Render the menu to screen with highlighting
   */
  private render(): void {
    // Move cursor to top-left
    process.stdout.write('\x1B[H');
    // Clear screen
    process.stdout.write('\x1B[2J');

    // Header
    console.log('');
    console.log(chalk.hex(CRUSH_THEME.colors.primary).bold('╔════════════════════════════════════════════════════════════╗'));
    console.log(chalk.hex(CRUSH_THEME.colors.primary).bold('║') + chalk.hex(CRUSH_THEME.colors.secondary).bold('  Floyd CLI - Interactive Menu') + ' '.repeat(40) + chalk.hex(CRUSH_THEME.colors.primary).bold('║'));
    console.log(chalk.hex(CRUSH_THEME.colors.primary).bold('╠════════════════════════════════════════════════════════════╣'));
    console.log(chalk.hex(CRUSH_THEME.colors.primary).bold('║') + ' ↑↓ Navigate | Enter: Select | ESC/q: Cancel                  ' + chalk.hex(CRUSH_THEME.colors.primary).bold('║'));
    console.log(chalk.hex(CRUSH_THEME.colors.primary).bold('╚════════════════════════════════════════════════════════════╝'));
    console.log('');

    // Menu items with selection highlighting
    for (let i = 0; i < this.items.length; i++) {
      const item = this.items[i];
      const isSelected = i === this.selectedIndex;

      if (isSelected) {
        // Highlight with inverted colors
        const inverted = '\x1B[7m';
        const reset = '\x1B[0m';
        const arrow = chalk.hex(CRUSH_THEME.colors.secondary).bold('▶ ');
        console.log(`${inverted} ${arrow}${item.name.padEnd(35)} - ${item.description} ${reset}`);
      } else {
        // Normal item
        console.log(`   ${chalk.hex(CRUSH_THEME.colors.textPrimary)(item.name)} - ${chalk.hex(CRUSH_THEME.colors.muted)(item.description)}`);
      }
    }

    console.log('');
  }

  /**
   * Wait for user selection via keyboard input
   */
  private waitForSelection(): Promise<MenuItem | null> {
    return new Promise((resolve) => {
      if (!process.stdin.isTTY) {
        console.error('Interactive menu requires a TTY terminal');
        resolve(null);
        return;
      }

      const keyBuffer: Buffer[] = [];

      const onData = (chunk: Buffer) => {
        keyBuffer.push(chunk);

        // Try to parse the buffer
        const str = Buffer.concat(keyBuffer).toString();

        // Handle escape sequences (arrows, etc.)
        if (str[0] === '\x1b') {
          // Full escape sequence received
          if (str === '\x1b[A' || str === '\x1bOA') {
            // Up arrow
            keyBuffer.length = 0;
            this.moveUp();
            return;
          }

          if (str === '\x1b[B' || str === '\x1bOB') {
            // Down arrow
            keyBuffer.length = 0;
            this.moveDown();
            return;
          }

          // ESC alone (no other chars within 50ms)
          if (str === '\x1b') {
            // Wait a bit to see if more chars come
            setTimeout(() => {
              if (keyBuffer.length === 1 && keyBuffer[0][0] === 0x1b) {
                // Just ESC, cancel
                keyBuffer.length = 0;
                cleanup();
                console.clear();
                resolve(null);
              }
            }, 50);
            return;
          }

          // Clear invalid escape sequences after delay
          setTimeout(() => {
            if (keyBuffer.length > 0 && keyBuffer[0][0] === 0x1b) {
              keyBuffer.length = 0;
            }
          }, 100);
          return;
        }

        // Single character keys
        if (keyBuffer.length === 1) {
          const key = str[0];
          keyBuffer.length = 0;

          if (key === '\r' || key === '\n') {
            // Enter key - select current
            cleanup();
            console.clear();
            resolve(this.items[this.selectedIndex]);
            return;
          }

          if (key === 'q' || key === 'Q') {
            // q key - cancel
            cleanup();
            console.clear();
            resolve(null);
            return;
          }

          if (key === 'k' || key === 'K') {
            // vim up
            this.moveUp();
            return;
          }

          if (key === 'j' || key === 'J') {
            // vim down
            this.moveDown();
            return;
          }

          if (key === '\u0003') {
            // Ctrl+C
            cleanup();
            console.clear();
            resolve(null);
            return;
          }
        }
      };

      const moveUp = () => {
        this.selectedIndex = (this.selectedIndex - 1 + this.items.length) % this.items.length;
        this.render();
      };

      const moveDown = () => {
        this.selectedIndex = (this.selectedIndex + 1) % this.items.length;
        this.render();
      };

      const cleanup = () => {
        process.stdin.removeListener('data', onData);
      };

      this.moveUp = moveUp;
      this.moveDown = moveDown;

      process.stdin.on('data', onData);
    });
  }

  // Methods for moving selection
  private moveUp!: () => void;
  private moveDown!: () => void;
}

/**
 * Create and show an interactive menu
 */
export async function showInteractiveMenu(items: MenuItem[]): Promise<MenuItem | null> {
  const menu = new InteractiveMenu(items);
  return menu.show();
}
