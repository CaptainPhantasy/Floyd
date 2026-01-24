/**
 * Easing Spinner - Floyd Wrapper
 *
 * Claude Code-style spinner with:
 * - Variable frame timing (easing pattern)
 * - Periodic phrase rotation during thinking
 * - Fixed bottom status bar location
 */

import readline from 'node:readline';
import { getRandomFloydMessage } from '../whimsy/floyd-spinners.js';

// ============================================================================
// Easing Spinner Frames
// ============================================================================

/**
 * Pink Floyd-themed spinner frames with easing timing
 * Pattern: slow-fast-fast-fast-fast-slow (organic feel)
 */
const FLOYD_EASING_SPINNER = {
	frames: ['🌑', '🌒', '🌓', '🌔', '🌕', '🌖', '🌗', '🌘'],
	intervals: [400, 200, 200, 200, 200, 400, 200, 200], // Easing pattern
};

// ============================================================================
// Easing Spinner Class
// ============================================================================

export class EasingSpinner {
	private active: boolean = false;
	private currentFrame: number = 0;
	private currentMessage: string = '';
	private messageInterval: NodeJS.Timeout | null = null;
	private frameTimeout: NodeJS.Timeout | null = null;
	private phraseRotateInterval: NodeJS.Timeout | null = null;

	/**
	 * Start the spinner with a Pink Floyd thinking phrase
	 */
	start(_rl?: readline.Interface): void {
		if (this.active) return;

		this.active = true;
		this.currentMessage = getRandomFloydMessage();
		this.currentFrame = 0;

		// Start phrase rotation (change every 5 seconds)
		this.phraseRotateInterval = setInterval(() => {
			if (this.active) {
				this.currentMessage = getRandomFloydMessage();
			}
		}, 5000);

		// Start animation loop
		this.animateFrame();
	}

	/**
	 * Stop the spinner
	 */
	stop(): void {
		this.active = false;

		// Clear all timers
		if (this.frameTimeout) {
			clearTimeout(this.frameTimeout);
			this.frameTimeout = null;
		}
		if (this.phraseRotateInterval) {
			clearInterval(this.phraseRotateInterval);
			this.phraseRotateInterval = null;
		}
		if (this.messageInterval) {
			clearInterval(this.messageInterval);
			this.messageInterval = null;
		}

		// Clear the status line
		this.clearStatus();
	}

	/**
	 * Animate a single frame with easing timing
	 */
	private animateFrame(): void {
		if (!this.active) return;

		// Render current frame
		this.render();

		// Get current frame's interval (easing pattern)
		const interval = FLOYD_EASING_SPINNER.intervals[this.currentFrame];

		// Schedule next frame
		this.frameTimeout = setTimeout(() => {
			this.currentFrame = (this.currentFrame + 1) % FLOYD_EASING_SPINNER.frames.length;
			this.animateFrame();
		}, interval);
	}

	/**
	 * Render the spinner to the bottom status line
	 */
	private render(): void {
		const frame = FLOYD_EASING_SPINNER.frames[this.currentFrame];
		const text = `${frame} ${this.currentMessage}`;

		// Save cursor position
		process.stdout.write('\u001b[s');

		// Move up 3 lines (above the frame: skip bottom border, input line, top border)
		process.stdout.write('\u001b[3A');

		// Clear the line and render spinner
		process.stdout.write('\u001b[K'); // Clear line
		process.stdout.write(text);

		// Move back down to input line
		process.stdout.write('\u001b[3B');

		// Restore cursor position
		process.stdout.write('\u001b[u');
	}

	/**
	 * Clear the status line
	 */
	private clearStatus(): void {
		// Save cursor position
		process.stdout.write('\u001b[s');

		// Move up 3 lines to spinner line
		process.stdout.write('\u001b[3A');

		// Clear the line
		process.stdout.write('\u001b[K');

		// Move back down
		process.stdout.write('\u001b[3B');

		// Restore cursor position
		process.stdout.write('\u001b[u');
	}

	/**
	 * Update the message manually (optional)
	 */
	setMessage(message: string): void {
		this.currentMessage = message;
		if (this.active) {
			this.render();
		}
	}
}

// ============================================================================
// Singleton Instance
// ============================================================================

let spinnerInstance: EasingSpinner | null = null;

export function getEasingSpinner(): EasingSpinner {
	if (!spinnerInstance) {
		spinnerInstance = new EasingSpinner();
	}
	return spinnerInstance;
}
