/**
 * FloydTerminal - Floyd Wrapper
 *
 * Terminal interface with CRUSH branding, ora spinners, progress bars, and status output.
 */

import chalk from 'chalk';
import ora from 'ora';
import type { Ora } from 'ora';
import { SingleBar } from 'cli-progress';
import { CRUSH_THEME, ASCII_LOGO } from '../constants.js';
import { getRandomFloydMessage, getSpinnerForMessage } from '../whimsy/floyd-spinners.js';
import { getEasingSpinner } from './easing-spinner.js';

// ============================================================================
// FloydTerminal Class
// ============================================================================

/**
 * Terminal interface with CRUSH branding and Floyd theming
 */
export class FloydTerminal {
  /**
   * Global singleton instance
   */
  private static instance: FloydTerminal | null = null;

  /**
   * Active spinner instance (legacy ora spinner)
   */
  private activeSpinner: Ora | null = null;

  /**
   * Easing spinner instance for Claude Code-style thinking animation
   */
  private easingSpinner = getEasingSpinner();

  /**
   * Active progress bar instance
   */
  private activeProgressBar: SingleBar | null = null;

  /**
   * Private constructor for singleton pattern
   */
  private constructor() { }

  /**
   * Get global singleton instance
   */
  static getInstance(): FloydTerminal {
    if (!FloydTerminal.instance) {
      FloydTerminal.instance = new FloydTerminal();
    }
    return FloydTerminal.instance;
  }

  /**
   * Display ASCII logo
   */
  showLogo(): void {
    const logoColor = CRUSH_THEME.colors.primary;
    console.log(chalk.hex(logoColor)(ASCII_LOGO));
    console.log(chalk.hex('#39FF14')(`  v${process.env.npm_package_version || '0.1.0'}  `));
    console.log();
  }

  /**
   * Display success message
   */
  success(message: string): void {
    console.log(chalk.hex(CRUSH_THEME.colors.success)(`✓ ${message}`));
  }

  /**
   * Display error message
   */
  error(message: string): void {
    console.log(chalk.hex(CRUSH_THEME.colors.error)(`✗ ${message}`));
  }

  /**
   * Display warning message
   */
  warning(message: string): void {
    console.log(chalk.hex(CRUSH_THEME.colors.warning)(`⚠ ${message}`));
  }

  /**
   * Display info message
   */
  info(message: string): void {
    console.log(chalk.hex(CRUSH_THEME.colors.info)(`ℹ ${message}`));
  }

  /**
   * Display muted/dim message
   */
  muted(message: string): void {
    console.log(chalk.hex(CRUSH_THEME.colors.muted)(message));
  }

  /**
   * Display primary branded message
   */
  primary(message: string): void {
    console.log(chalk.hex(CRUSH_THEME.colors.primary)(message));
  }

  /**
   * Display secondary branded message
   */
  secondary(message: string): void {
    console.log(chalk.hex(CRUSH_THEME.colors.secondary)(message));
  }

  /**
   * Create and start a spinner with Floyd theming
   */
  spinner(message?: string): Ora {
    // Stop any existing spinner
    this.stopSpinner();

    const spinnerMessage = message || getRandomFloydMessage();
    const spinnerConfig = getSpinnerForMessage(spinnerMessage);

    this.activeSpinner = ora({
      text: spinnerMessage,
      spinner: spinnerConfig,
      color: 'yellow', // matches CRUSH_THEME.semantic.thinking (Zest/Yellow)
    });

    this.activeSpinner.start();
    return this.activeSpinner;
  }

  /**
   * Start Claude Code-style easing spinner for thinking animation
   * Features:
   * - Easing animation pattern (slow-fast-fast-fast-fast-slow)
   * - Phrase rotation every 5 seconds
   * - Fixed bottom location
   */
  startThinking(): void {
    this.easingSpinner.start();
  }

  /**
   * Stop the thinking spinner
   */
  stopThinking(): void {
    this.easingSpinner.stop();
  }

  /**
   * Stop the active spinner with success
   */
  stopSpinner(text?: string, leaveText: boolean = false): void {
    // Stop ora spinner if active
    if (this.activeSpinner) {
      if (leaveText && text) {
        this.activeSpinner.succeed(text);
      } else {
        // Stop without leaving text behind
        this.activeSpinner.stop();
        this.activeSpinner.clear();
      }
      this.activeSpinner = null;
    }
    // Also stop easing spinner if active
    this.easingSpinner.stop();
  }

  /**
   * Stop the active spinner with error
   */
  failSpinner(text?: string): void {
    if (this.activeSpinner) {
      this.activeSpinner.fail(text);
      this.activeSpinner = null;
    }
  }

  /**
   * Stop the active spinner with warning
   */
  warnSpinner(text?: string): void {
    if (this.activeSpinner) {
      this.activeSpinner.warn(text);
      this.activeSpinner = null;
    }
  }

  /**
   * Update the active spinner text
   */
  updateSpinner(text: string): void {
    if (this.activeSpinner) {
      this.activeSpinner.text = text;
    }
  }

  /**
   * Create a progress bar
   */
  progressBar(total: number, startValue: number = 0): SingleBar {
    // Stop any existing progress bar
    this.stopProgressBar();

    this.activeProgressBar = new SingleBar({
      format: chalk.hex(CRUSH_THEME.colors.primary)('{bar}') + ' | {percentage}% | {value}/{total} | {eta_formatted}',
      barCompleteChar: '█',
      barIncompleteChar: '░',
      hideCursor: true,
    });

    this.activeProgressBar.start(total, startValue);
    return this.activeProgressBar;
  }

  /**
   * Update the active progress bar
   */
  updateProgressBar(value: number): void {
    if (this.activeProgressBar) {
      this.activeProgressBar.update(value);
    }
  }

  /**
   * Increment the active progress bar
   */
  incrementProgressBar(amount: number = 1): void {
    if (this.activeProgressBar) {
      this.activeProgressBar.increment(amount);
    }
  }

  /**
   * Stop the active progress bar
   */
  stopProgressBar(): void {
    if (this.activeProgressBar) {
      this.activeProgressBar.stop();
      this.activeProgressBar = null;
    }
  }

  /**
   * Display a section header
   */
  section(title: string): void {
    console.log();
    console.log(chalk.hex(CRUSH_THEME.colors.primary)(`▸ ${title}`));
    console.log(chalk.hex(CRUSH_THEME.colors.secondary)(String('─').repeat(title.length + 2)));
  }

  /**
   * Display a tool execution message
   */
  tool(toolName: string, description?: string): void {
    const name = chalk.hex(CRUSH_THEME.colors.primary)(toolName);
    const desc = description ? chalk.hex(CRUSH_THEME.colors.muted)(description) : '';
    console.log(`  ${name} ${desc}`);
  }

  /**
   * Display tool execution success
   */
  toolSuccess(toolName: string): void {
    const icon = chalk.hex(CRUSH_THEME.colors.success)('✓');
    console.log(`  ${icon} ${toolName}`);
  }

  /**
   * Display tool execution error
   */
  toolError(toolName: string, error?: string): void {
    const icon = chalk.hex(CRUSH_THEME.colors.error)('✗');
    console.log(`  ${icon} ${toolName}`);
    if (error) {
      console.log(`    ${chalk.hex(CRUSH_THEME.colors.muted)(error)}`);
    }
  }

  /**
   * Display a divider line
   */
  divider(char: string = '─', length: number = 60): void {
    console.log(chalk.hex(CRUSH_THEME.colors.muted)(char.repeat(length)));
  }

  /**
   * Display a blank line
   */
  blank(): void {
    console.log();
  }

  /**
   * Clear the terminal screen
   */
  clear(): void {
    console.clear();
  }

  /**
   * Clean up all active terminal elements
   */
  cleanup(): void {
    this.stopSpinner();
    this.stopProgressBar();
    // Ensure cursor is visible after cleanup
    process.stdout.write('\x1B[?25h'); // Show cursor
  }
}

// ============================================================================
// Global Terminal Instance
// ============================================================================

/**
 * Global terminal instance
 */
export const terminal = FloydTerminal.getInstance();
