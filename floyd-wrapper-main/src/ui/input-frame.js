/**
 * Input Frame - Floyd Wrapper
 *
 * Creates a framed input area that stays with user's text
 * Top and bottom borders only (no vertical sides)
 */

// Get terminal width
function getTerminalWidth() {
	return process.stdout.columns || 80;
}

/**
 * Generate framed input prompt (top and bottom borders only)
 * @returns {string} The framed prompt string
 */
export function createFramedPrompt() {
	const width = getTerminalWidth();

	// Top border (horizontal line)
	const topBorder = '─'.repeat(width);

	// Input line (no borders on sides)
	const inputLine = '> ';

	// Three lines of padding (keeps input frame off screen bottom)
	// Line 1: Monitoring module appears here
	// Line 2-3: Additional padding
	const padding = '\n\n\n';

	// Return formatted prompt with padding underneath
	return `\n${topBorder}\n${inputLine}${padding}`;
}

/**
 * Generate bottom frame border (for cleanup/redraw)
 * @returns {string} The bottom border string
 */
export function createFrameBottom() {
	const width = getTerminalWidth();
	return '─'.repeat(width);
}
