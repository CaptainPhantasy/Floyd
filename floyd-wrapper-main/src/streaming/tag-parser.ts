/**
 * Stream Tag Parser - Copied from INK/floyd-cli
 *
 * Robustly parses XML-style tags in streaming text.
 * Handles split tokens (e.g., "<think" + "ing>") and nested tags.
 */

export interface TagEvent {
	type: 'tag_open' | 'tag_close' | 'text';
	tagName?: string;
	content?: string;
}

export class StreamTagParser {
	private buffer = '';
	private currentTag: string | null = null;
	private tags: string[];

	constructor(tags: string[] = ['thinking']) {
		this.tags = tags;
	}

	/**
	 * Process a chunk of text and yield events
	 */
	*process(chunk: string): Generator<TagEvent> {
		this.buffer += chunk;

		while (this.buffer.length > 0) {
			// If we are inside a tag, look for the closing tag
			if (this.currentTag) {
				const closeTag = `</${this.currentTag}>`;
				const closeIndex = this.buffer.indexOf(closeTag);

				if (closeIndex !== -1) {
					// Found closing tag
					// Yield content before the closing tag
					const content = this.buffer.substring(0, closeIndex);
					if (content) {
						yield { type: 'text', content };
					}

					// Yield closing event
					yield { type: 'tag_close', tagName: this.currentTag };

					// Advance buffer past the closing tag
					this.buffer = this.buffer.substring(closeIndex + closeTag.length);
					this.currentTag = null;
				} else {
					// Closing tag not found yet
					// Check if the buffer *ends* with a partial closing tag
					// e.g. "some content </thin"
					const partialMatch = this.findPartialTagMatch(this.buffer, `</${this.currentTag}>`);

					if (partialMatch) {
						// Yield safe content up to the partial match
						const safeContent = this.buffer.substring(0, this.buffer.length - partialMatch.length);
						if (safeContent) {
							yield { type: 'text', content: safeContent };
						}
						// Keep the partial match in the buffer
						this.buffer = partialMatch;
						return;
					} else {
						// No partial match, safe to yield everything
						yield { type: 'text', content: this.buffer };
						this.buffer = '';
						return;
					}
				}
			} else {
				// We are NOT in a tag, look for an opening tag
				let firstOpenIndex = -1;
				let foundTag = '';

				for (const tag of this.tags) {
					const openTag = `<${tag}>`;
					const index = this.buffer.indexOf(openTag);
					if (index !== -1 && (firstOpenIndex === -1 || index < firstOpenIndex)) {
						firstOpenIndex = index;
						foundTag = tag;
					}
				}

				if (firstOpenIndex !== -1) {
					// Found opening tag
					// Yield content before the tag
					const content = this.buffer.substring(0, firstOpenIndex);
					if (content) {
						yield { type: 'text', content };
					}

					// Yield opening event
					yield { type: 'tag_open', tagName: foundTag };

					// Advance buffer past the opening tag
					const openTag = `<${foundTag}>`;
					this.buffer = this.buffer.substring(firstOpenIndex + openTag.length);
					this.currentTag = foundTag;
				} else {
					// No opening tag found
					// Check if buffer ends with a partial opening tag
					let partialMatch: string | null = null;

					for (const tag of this.tags) {
						const openTag = `<${tag}>`;
						const match = this.findPartialTagMatch(this.buffer, openTag);
						if (match && (!partialMatch || match.length > partialMatch.length)) {
							partialMatch = match;
						}
					}

					if (partialMatch) {
						// Yield safe content up to the partial match
						const safeContent = this.buffer.substring(0, this.buffer.length - partialMatch.length);
						if (safeContent) {
							yield { type: 'text', content: safeContent };
						}
						// Keep the partial match in the buffer
						this.buffer = partialMatch;
						return;
					} else {
						// No partial match, safe to yield everything
						yield { type: 'text', content: this.buffer };
						this.buffer = '';
						return;
					}
				}
			}
		}
	}

	/**
	 * Find if the end of the buffer matches the beginning of a tag
	 * Returns the partial match or null
	 */
	private findPartialTagMatch(buffer: string, tag: string): string | null {
		// Check if the buffer ends with a prefix of the tag
		for (let i = Math.min(tag.length, buffer.length); i > 0; i--) {
			const tagPrefix = tag.substring(0, i);
			if (buffer.endsWith(tagPrefix)) {
				return tagPrefix;
			}
		}
		return null;
	}

	/**
	 * Reset the parser state
	 */
	reset(): void {
		this.buffer = '';
		this.currentTag = null;
	}

	/**
	 * Check if we're currently inside a tag
	 */
	isInTag(): boolean {
		return this.currentTag !== null;
	}

	/**
	 * Get the current tag name (if inside a tag)
	 */
	getCurrentTag(): string | null {
		return this.currentTag;
	}
}
