/**
 * Chat Renderer - Floyd Wrapper
 *
 * Handles rendering chat messages in two-phase system:
 * - Scrolling mode: Text flows naturally down
 * - Static mode: Frame locked, text flows up
 */

import { getTerminalState } from './terminal-state.js';
import { createFramedPrompt, createFrameBottom } from './input-frame.js';

// ANSI escape codes
const ANSI = {
	savePos: '\u001b[s',
	restorePos: '\u001b[u',
	moveUp: (n) => `\u001b[${n}A`,
	moveDown: (n) => `\u001b[${n}B`,
	clearLine: '\u001b[K',
	hideCursor: '\u001b[?25l',
	showCursor: '\u001b[?25h',
};

export class ChatRenderer {
	constructor() {
		this.state = getTerminalState();
	}

	/**
	 * Print user message
	 */
	printUserMessage(message) {
		// Simply print above the frame (readline handles the frame at bottom)
		console.log(`You: ${message}`);
		this.state.incrementLineCount(1);
	}

	/**
	 * Print Floyd response
	 */
	printFloydResponse(response) {
		// Simply print above the frame (readline handles the frame at bottom)
		console.log(`Floyd: ${response}`);
		this.state.incrementLineCount(1);
	}

	/**
	 * Redraw the frame at the bottom (for static mode)
	 */
	redrawFrame() {
		const mode = this.state.getMode();

		if (mode === 'static') {
			// Save cursor
			process.stdout.write(ANSI.savePos);

			// Move to bottom of terminal
			const height = this.state.getTerminalHeight();
			process.stdout.write(ANSI.moveDown(height));

			// Clear and redraw frame
			const frame = createFramedPrompt();
			process.stdout.write(frame);

			// Restore cursor
			process.stdout.write(ANSI.restorePos);
		}
	}

	/**
	 * Clear the current input line (for submission)
	 */
	clearInput() {
		process.stdout.write(ANSI.savePos);
		process.stdout.write(ANSI.clearLine);
		process.stdout.write(ANSI.restorePos);
	}

	/**
	 * Position cursor inside the frame
	 */
	positionCursor() {
		const mode = this.state.getMode();

		if (mode === 'static') {
			// Move cursor to input position (after "> ")
			process.stdout.write('\r> ');
		}
	}
}

// Singleton instance
let rendererInstance = null;

export function getChatRenderer() {
	if (!rendererInstance) {
		rendererInstance = new ChatRenderer();
	}
	return rendererInstance;
}
