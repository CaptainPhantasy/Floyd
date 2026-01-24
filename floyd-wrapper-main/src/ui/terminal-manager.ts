/**
 * Terminal Manager - Floyd Wrapper
 *
 * Manages terminal state for static layout with ANSI escape codes.
 * Provides:
 * - Scroll mode vs static mode detection
 * - Cursor save/restore positioning
 * - Reserved footer area for spinner and input
 */

// ============================================================================
// ANSI Escape Codes
// ============================================================================

export const ANSI = {
	// Cursor positioning
	saveCursor: '\x1b[s',
	restoreCursor: '\x1b[u',
	moveUp: (n: number) => `\x1b[${n}A`,
	moveDown: (n: number) => `\x1b[${n}B`,
	moveToColumn: (n: number) => `\x1b[${n}G`,
	moveTo: (row: number, col: number) => `\x1b[${row};${col}H`,

	// Screen clearing
	clearLine: '\x1b[K',
	clearScreen: '\x1b[2J',
	clearToScreenStart: '\x1b[1J',
	clearToScreenEnd: '\x1b[0J',

	// Cursor visibility
	hideCursor: '\x1b[?25l',
	showCursor: '\x1b[?25h',

	// Scrolling
	scrollUp: (n: number) => `\x1b[${n}S`,
	scrollDown: (n: number) => `\x1b[${n}T`,
};

// ============================================================================
// Terminal Mode
// ============================================================================

export type TerminalMode = 'scrolling' | 'static';

// ============================================================================
// Terminal Manager Class
// ============================================================================

export class TerminalManager {
	private mode: TerminalMode = 'scrolling';
	private terminalHeight: number;
	private terminalWidth: number;
	private footerLines: number = 2; // Reserve 2 lines for spinner + input
	private lineCount: number = 0;

	constructor() {
		// Get initial terminal size
		this.terminalHeight = process.stdout.rows || 24;
		this.terminalWidth = process.stdout.columns || 80;

		// Listen for terminal resize
		this.setupResizeListener();
	}

	/**
	 * Setup resize listener to handle terminal size changes
	 */
	private setupResizeListener(): void {
		process.stdout.on('resize', () => {
			this.terminalHeight = process.stdout.rows || 24;
			this.terminalWidth = process.stdout.columns || 80;

			// Recalculate mode based on new height
			this.recalculateMode();
		});
	}

	/**
	 * Recalculate mode based on current terminal height and line count
	 */
	private recalculateMode(): void {
		const threshold = this.terminalHeight - this.footerLines;

		if (this.lineCount >= threshold) {
			this.mode = 'static';
		} else {
			this.mode = 'scrolling';
		}
	}

	/**
	 * Increment line count (call after each line of output)
	 */
	incrementLineCount(lines: number = 1): void {
		this.lineCount += lines;
		this.recalculateMode();
	}

	/**
	 * Reset line count (call when clearing screen)
	 */
	resetLineCount(): void {
		this.lineCount = 0;
		this.mode = 'scrolling';
	}

	/**
	 * Get current mode
	 */
	getMode(): TerminalMode {
		return this.mode;
	}

	/**
	 * Check if we're in static mode
	 */
	isStaticMode(): boolean {
		return this.mode === 'static';
	}

	/**
	 * Get terminal dimensions
	 */
	getSize(): { height: number; width: number } {
		return {
			height: this.terminalHeight,
			width: this.terminalWidth,
		};
	}

	/**
	 * Render to the footer area (spinner line)
	 * In static mode, this renders above the input prompt
	 */
	renderToFooter(text: string): void {
		if (this.mode === 'static') {
			// Save cursor position (user's input line)
			process.stdout.write(ANSI.saveCursor);

			// Move up to the footer line (1 line above input)
			process.stdout.write(ANSI.moveUp(1));

			// Clear line and render text
			process.stdout.write(ANSI.clearLine);
			process.stdout.write(text);

			// Restore cursor back to input line
			process.stdout.write(ANSI.restoreCursor);
		} else {
			// In scrolling mode, just render inline (will scroll up)
			process.stdout.write(`\n${text}`);
			this.incrementLineCount();
		}
	}

	/**
	 * Clear the footer area
	 */
	clearFooter(): void {
		if (this.mode === 'static') {
			process.stdout.write(ANSI.saveCursor);
			process.stdout.write(ANSI.moveUp(1));
			process.stdout.write(ANSI.clearLine);
			process.stdout.write(ANSI.restoreCursor);
		}
	}

	/**
	 * Cleanup and remove resize listener
	 */
	destroy(): void {
		// Node.js doesn't have a simple way to remove 'resize' listeners
		// Terminal cleanup handled by OS on process exit
	}
}

// ============================================================================
// Singleton Instance
// ============================================================================

let terminalManagerInstance: TerminalManager | null = null;

export function getTerminalManager(): TerminalManager {
	if (!terminalManagerInstance) {
		terminalManagerInstance = new TerminalManager();
	}
	return terminalManagerInstance;
}
