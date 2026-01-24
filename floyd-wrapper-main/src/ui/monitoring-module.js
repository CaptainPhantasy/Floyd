/**
 * Visual Monitoring Module - Floyd Wrapper
 *
 * Sequential status display for thinking, tool calls, and TODOs
 * Follows pageflow.md rules: Sequential output, no cursor positioning
 */

import { getRandomFloydMessage } from '../whimsy/floyd-spinners.js';

/**
 * Simple spinner for progress indication (ora-style behavior)
 * Uses sequential output instead of cursor manipulation
 */
class SimpleSpinner {
	constructor(text) {
		this.text = text;
		this.active = false;
		this.interval = null;
		this.frames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
		this.currentFrame = 0;
	}

	start() {
		this.active = true;
		this.tick();
		this.interval = setInterval(() => this.tick(), 100);
	}

	tick() {
		if (!this.active) return;
		const frame = this.frames[this.currentFrame % this.frames.length];
		this.currentFrame++;
		// Simple sequential output - no cursor positioning
		process.stdout.write(`\r${frame} ${this.text}`);
	}

	update(text) {
		this.text = text;
		if (this.active) {
			this.tick();
		}
	}

	stop() {
		this.active = false;
		if (this.interval) {
			clearInterval(this.interval);
			this.interval = null;
		}
		// Clear line and move to next line
		process.stdout.write('\r' + ' '.repeat(80) + '\r');
	}
}

export class MonitoringModule {
	constructor() {
		this.isActive = false;
		this.thinkingMessage = '';
		this.currentTool = null;
		this.todos = [];
		this.spinner = null;
	}

	/**
	 * Start thinking mode (show Pink Floyd phrase with spinner)
	 * Sequential output - no cursor positioning
	 */
	startThinking() {
		this.isActive = true;
		this.thinkingMessage = getRandomFloydMessage();
		
		// Create spinner for thinking state
		this.spinner = new SimpleSpinner(this.thinkingMessage);
		this.spinner.start();
	}

	/**
	 * Stop thinking mode - stop spinner and clear
	 */
	stopThinking() {
		this.isActive = false;
		this.thinkingMessage = '';
		this.currentTool = null;

		if (this.spinner) {
			this.spinner.stop();
			this.spinner = null;
		}

		// Ensure line is cleared even if spinner was already null
		process.stdout.write('\r' + ' '.repeat(80) + '\r');
	}

	/**
	 * Set current tool being executed
	 * Updates spinner text with tool info
	 */
	setTool(toolName) {
		this.currentTool = toolName;
		
		if (this.spinner) {
			const text = this.thinkingMessage 
				? `${this.thinkingMessage} | 🛠 ${toolName}`
				: `🛠 Executing: ${toolName}`;
			this.spinner.update(text);
		} else {
			// Sequential output for tool call without spinner
			console.log(`🛠 ${toolName}`);
		}
	}

	/**
	 * Clear tool (when tool completes)
	 */
	clearTool() {
		this.currentTool = null;
		if (this.spinner && this.isActive) {
			this.spinner.update(this.thinkingMessage);
		}
	}

	/**
	 * Add a TODO item to the stack
	 * Sequential output
	 */
	addTodo(todo) {
		this.todos.push(todo);
		console.log(`• ${todo}`);
	}

	/**
	 * Remove a TODO from the stack
	 */
	removeTodo(todo) {
		this.todos = this.todos.filter(t => t !== todo);
		// Note: Cannot remove line from sequential output
		// This is consistent with terminal nature
	}

	/**
	 * Clear all TODOs
	 */
	clearTodos() {
		this.todos = [];
		// Note: Cannot remove lines from sequential output
	}

	/**
	 * Display success message (green with ✓)
	 */
	success(message) {
		console.log(`✓ ${message}`);
	}

	/**
	 * Display error message (red with ✗)
	 */
	error(message) {
		console.log(`✗ ${message}`);
	}

	/**
	 * Display info message (blue with ℹ)
	 */
	info(message) {
		console.log(`ℹ ${message}`);
	}

	/**
	 * Display warning message (yellow with ⚠)
	 */
	warn(message) {
		console.log(`⚠ ${message}`);
	}

	/**
	 * Cleanup when done
	 */
	destroy() {
		this.stopThinking();
		this.todos = [];
	}
}

// Singleton instance
let monitoringInstance = null;

export function getMonitoringModule() {
	if (!monitoringInstance) {
		monitoringInstance = new MonitoringModule();
	}
	return monitoringInstance;
}
