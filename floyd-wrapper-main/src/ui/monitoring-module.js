/**
 * Visual Monitoring Module - Floyd Wrapper
 *
 * Sequential status display for thinking, tool calls, and TODOs
 * Follows pageflow.md rules: Sequential output, no cursor positioning
 */

import { getRandomFloydMessage } from '../whimsy/floyd-spinners.js';
import { getSandboxManager } from '../sandbox/index.js';

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
		// Slower interval - less intrusive (200ms instead of 100ms)
		this.interval = setInterval(() => this.tick(), 200);
	}

	tick() {
		if (!this.active) return;
		const frame = this.frames[this.currentFrame % this.frames.length];
		this.currentFrame++;
		// Update on SAME line using carriage return
		process.stdout.write('\r' + ' '.repeat(100) + '\r'); // Clear line
		process.stdout.write(`${frame} ${this.text}`); // Write on same line
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
		// Clear spinner line completely
		process.stdout.write('\r' + ' '.repeat(100) + '\r');
	}
}

export class MonitoringModule {
	constructor() {
		this.isActive = false;
		this.thinkingMessage = '';
		this.currentTool = null;
		this.todos = [];
		this.spinner = null;
		// FIX #3: Track last checkpoint for visual indicator
		this.lastCheckpoint = null; // { id, fileCount, timestamp }
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

		// Clear spinner line
		process.stdout.write('\r' + ' '.repeat(100) + '\r');
	}

	/**
	 * Set current tool being executed
	 * Updates spinner text with tool info
	 */
	setTool(toolName) {
		this.currentTool = toolName;

		// Get sandbox status for display
		const sandboxManager = getSandboxManager();
		let sandboxSuffix = '';
		if (sandboxManager.isActive()) {
			const summary = sandboxManager.getChangesSummary();
			sandboxSuffix = ` | 🔒sandbox:${summary.total}`;
		}

		if (this.spinner) {
			const text = this.thinkingMessage
				? `${this.thinkingMessage} | 🛠 ${toolName}${sandboxSuffix}`
				: `🛠 Executing: ${toolName}${sandboxSuffix}`;
			this.spinner.update(text);
		} else {
			// Sequential output for tool call without spinner
			console.log(`🛠 ${toolName}${sandboxSuffix}`);
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

	// FIX #3: Checkpoint tracking methods

	/**
	 * Set the last checkpoint info (called when checkpoint is created)
	 */
	setCheckpoint(checkpointId, fileCount) {
		this.lastCheckpoint = {
			id: checkpointId,
			fileCount: fileCount,
			timestamp: Date.now()
		};
	}

	/**
	 * Clear checkpoint info (after restore or discard)
	 */
	clearCheckpoint() {
		this.lastCheckpoint = null;
	}

	/**
	 * Get checkpoint indicator for prompt
	 * Returns '✓' if checkpoint available, empty string otherwise
	 */
	getCheckpointIndicator() {
		return this.lastCheckpoint ? '✓' : '';
	}

	/**
	 * Get checkpoint info for display
	 */
	getCheckpointInfo() {
		return this.lastCheckpoint;
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
