/**
 * Floyd Wrapper - In-place token streaming renderer
 *
 * Uses log-update for smooth token streaming without scroll spam.
 */

import logUpdate from 'log-update';
import chalk from 'chalk';
import { CRUSH_THEME } from '../constants.js';

// ============================================================================
// StreamingDisplay Class
// ============================================================================

/**
 * In-place streaming display for tokens
 */
export class StreamingDisplay {
  /**
   * Global singleton instance
   */
  private static instance: StreamingDisplay | null = null;

  /**
   * Current buffer of displayed text
   */
  private buffer: string = '';

  /**
   * Whether rendering is active
   */
  private active: boolean = false;

  /**
   * Private constructor for singleton pattern
   */
  private constructor() { }

  /**
   * Get global singleton instance
   */
  static getInstance(): StreamingDisplay {
    if (!StreamingDisplay.instance) {
      StreamingDisplay.instance = new StreamingDisplay();
    }
    return StreamingDisplay.instance;
  }

  /**
   * Append a token to the display
   * @param token The token text to append
   */
  appendToken(token: string): void {
    this.active = true;
    this.buffer += token;
    this.render();
  }



  /**
   * Render the current buffer in-place with styling
   */
  private render(): void {
    const styledBuffer = this.styleThoughts(this.buffer);
    logUpdate(styledBuffer);
  }

  /**
   * Style <think> blocks in the output
   */
  private styleThoughts(text: string): string {
    // Simple regex to find <think> content </think>
    // Note: This relies on the tags being present in the buffer.
    // Streaming tokens might split tags, but eventually it renders correctly.
    // For a smoother experience, we'd need a token-aware parser, but this works for "eventual consistency".

    return text.replace(/<think>([\s\S]*?)(<\/think>|$)/g, (_match, content) => {
      // If the tag is closed, style distinctively
      // If open (no closing tag yet), style the content we have so far
      return chalk.hex(CRUSH_THEME.semantic.thinking).italic(content);
    });
  }

  /**
   * Complete the streaming display and finalize output
   */
  finish(): void {
    if (!this.active) {
      return;
    }

    // Write final output with proper newline
    // logUpdate.done() handles the final display, no need for console.log
    logUpdate.done();

    // Reset state
    this.buffer = '';
    this.active = false;
  }

  /**
   * Clear the current display without finishing
   */
  clear(): void {
    this.buffer = '';
    logUpdate.clear();
  }

  /**
   * Get the current buffer content
   */
  getBuffer(): string {
    return this.buffer;
  }

  /**
   * Check if streaming is active
   */
  isActive(): boolean {
    return this.active;
  }

  /**
   * Reset the singleton instance (for testing only)
   *
   * This method clears the global singleton instance, allowing
   * tests to start with a fresh state. Should only be used in test code.
   */
  static resetInstance(): void {
    StreamingDisplay.instance = null;
  }
}

// ============================================================================
// Global Renderer Instance
// ============================================================================

/**
 * Global streaming display instance for token rendering
 */
export const renderer = StreamingDisplay.getInstance();
