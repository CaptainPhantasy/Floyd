/**
 * Status Bar - Floyd Wrapper
 *
 * Locked status bar between conversation and input frame
 * Shows thinking phrase and tool calls
 */

import { getRandomFloydMessage } from '../whimsy/floyd-spinners.js';

// ANSI escape codes
const ANSI = {
	savePos: '\u001b[s',
	restorePos: '\u001b[u',
	moveUp: (n) => `\u001b[${n}A`,
	moveDown: (n) => `\u001b[${n}B`,
	clearLine: '\u001b[K',
};

export class StatusBar {
	constructor() {
		this.active = false;
		this.thinkingMessage = '';
		this.currentTool = null;
		this.todos = []; // Stack of TODO items
	}

	/**
	 * Start thinking mode (show Pink Floyd phrase)
	 */
	startThinking() {
		this.active = true;
		this.thinkingMessage = getRandomFloydMessage();
		this.render();
	}

	/**
	 * Stop thinking mode
	 */
	stopThinking() {
		this.active = false;
		this.thinkingMessage = '';
		this.currentTool = null;
		this.clear();
	}

	/**
	 * Set current tool being executed
	 */
	setTool(toolName, toolInput) {
		this.currentTool = { name: toolName, input: toolInput };
		this.render();
	}

	/**
	 * Clear tool (when tool completes)
	 */
	clearTool() {
		this.currentTool = null;
		if (this.active) {
			this.render();
		} else {
			this.clear();
		}
	}

	/**
	 * Add a TODO item to the stack
	 */
	addTodo(todo) {
		this.todos.push(todo);
		this.render();
	}

	/**
	 * Remove a TODO from the stack
	 */
	removeTodo(todo) {
		this.todos = this.todos.filter(t => t !== todo);
		this.render();
	}

	/**
	 * Clear all TODOs
	 */
	clearTodos() {
		this.todos = [];
		this.render();
	}

	/**
	 * Render the status bar (multi-line: thinking + tools + TODOs)
	 */
	render() {
		// Build all lines to display
		const lines = [];

		// Line 1: Thinking + Tools
		let statusText = '';
		if (this.thinkingMessage) {
			statusText = `🌖 ${this.thinkingMessage}`;
		}

		if (this.currentTool) {
			const toolText = ` | 🛠 ${this.currentTool.name}`;
			statusText += toolText;
		}

		if (statusText) {
			lines.push(statusText);
		}

		// Add TODO items
		for (const todo of this.todos) {
			lines.push(`• ${todo}`);
		}

		// If nothing to display, clear and return
		if (lines.length === 0) {
			this.clear();
			return;
		}

		// Save cursor position
		process.stdout.write(ANSI.savePos);

		// Calculate how many lines to move up
		// We need to move up enough to accommodate all status bar lines
		const linesToMoveUp = lines.length + 2; // +2 for spacer and input line
		process.stdout.write(ANSI.moveUp(linesToMoveUp));

		// Render each line
		for (let i = 0; i < lines.length; i++) {
			// Clear the line
			process.stdout.write(ANSI.clearLine);

			// Print the line (truncated to terminal width)
			const maxWidth = process.stdout.columns || 80;
			let lineText = lines[i];
			if (lineText.length > maxWidth) {
				lineText = lineText.substring(0, maxWidth - 3) + '...';
			}
			process.stdout.write(lineText);

			// Move down if not the last line
			if (i < lines.length - 1) {
				process.stdout.write('\n');
			}
		}

		// Move back down to input line
		const linesToMoveDown = linesToMoveUp - lines.length;
		if (linesToMoveDown > 0) {
			process.stdout.write(ANSI.moveDown(linesToMoveDown));
		}

		// Restore cursor position
		process.stdout.write(ANSI.restorePos);
	}

	/**
	 * Clear the status bar (multi-line)
	 */
	clear() {
		// Save cursor position
		process.stdout.write(ANSI.savePos);

		// Move up and clear all status lines + TODOs
		const linesToClear = this.todos.length + 1; // +1 for status line
		for (let i = 0; i < linesToClear; i++) {
			process.stdout.write(ANSI.moveUp(2)); // Move up to status line
			process.stdout.write(ANSI.clearLine); // Clear it
		}

		// Move back down to input line
		process.stdout.write(ANSI.moveDown(2));

		// Restore cursor position
		process.stdout.write(ANSI.restorePos);
	}
}

// Singleton instance
let statusInstance = null;

export function getStatusBar() {
	if (!statusInstance) {
		statusInstance = new StatusBar();
	}
	return statusInstance;
}
