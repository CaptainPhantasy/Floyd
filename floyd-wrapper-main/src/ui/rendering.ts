/**
 * Hybrid Scrollable History Implementation
 * 
 * Architecture: Hybrid rendering mode that provides BOTH:
 * 1. Smooth in-place streaming (current message)
 * 2. Native terminal scrollback (completed messages)
 * 
 * How it works:
 * - Active messages use log-update (in-place updates)
 * - Completed messages "freeze" into terminal history via console.log
 * - User can scroll up naturally to see full conversation
 * - Copy/paste works natively
 */

// This will be integrated into the existing StreamingDisplay class

/**
 * Floyd Wrapper - Streaming token renderer
 *
 * Streams tokens directly to stderr to avoid readline conflicts.
 */

// ============================================================================
// StreamingDisplay Class
// ============================================================================

/**
 * Streaming display for tokens that works with readline
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

    // Synchronous write to stderr for immediate visibility (no buffering)
    try {
      const { writeSync } = require('fs');
      writeSync(2, token);  // 2 = stderr file descriptor
    } catch {
      // Fallback to async write if sync fails
      process.stderr.write(token);
    }
  }

  /**
   * Complete the streaming display
   */
  finish(): void {
    if (!this.active) {
      return;
    }

    // Write newline using sync write for consistency
    try {
      const { writeSync } = require('fs');
      writeSync(2, '\n');  // 2 = stderr file descriptor
    } catch {
      process.stderr.write('\n');
    }

    // Reset state
    this.buffer = '';
    this.active = false;
  }

  /**
   * Clear the current display without finishing
   */
  clear(): void {
    this.buffer = '';
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
