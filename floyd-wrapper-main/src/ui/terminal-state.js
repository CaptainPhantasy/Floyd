/**
 * Terminal State Manager - Floyd Wrapper
 *
 * Tracks terminal state for two-phase chat system:
 * - Phase 1 (Scrolling): Terminal not full, text flows naturally
 * - Phase 2 (Static): Terminal full, frame locked at bottom
 */

export class TerminalState {
	constructor() {
		this.mode = 'scrolling';
		this.lineCount = 0;
		this.terminalHeight = process.stdout.rows || 24;
		this.staticThreshold = this.terminalHeight - 3;

		// Listen for terminal resize
		process.stdout.on('resize', () => {
			this.terminalHeight = process.stdout.rows || 24;
			this.staticThreshold = this.terminalHeight - 3;
		});
	}

	getMode() {
		return this.mode;
	}

	checkTransition() {
		if (this.mode === 'scrolling' && this.lineCount >= this.staticThreshold) {
			this.mode = 'static';
			return true;
		}
		return false;
	}

	incrementLineCount(lines = 1) {
		this.lineCount += lines;
		return this.checkTransition();
	}

	getLineCount() {
		return this.lineCount;
	}

	reset() {
		this.mode = 'scrolling';
		this.lineCount = 0;
	}

	getTerminalHeight() {
		return this.terminalHeight;
	}

	getStaticThreshold() {
		return this.staticThreshold;
	}
}

// Singleton instance
let stateInstance = null;

export function getTerminalState() {
	if (!stateInstance) {
		stateInstance = new TerminalState();
	}
	return stateInstance;
}
