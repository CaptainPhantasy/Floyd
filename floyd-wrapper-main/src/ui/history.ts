/**
 * Conversation History - Floyd Wrapper
 *
 * Display conversation history with formatting options.
 */

import chalk from 'chalk';
import type { FloydMessage } from '../types.js';

// ============================================================================
// Conversation History Class
// ============================================================================

/**
 * Manages and displays conversation history
 */
export class ConversationHistory {
  private messages: FloydMessage[] = [];

  /**
   * Add a message to history
   */
  addMessage(message: FloydMessage): void {
    this.messages.push(message);
  }

  /**
   * Clear all messages
   */
  clear(): void {
    this.messages = [];
  }

  /**
   * Get all messages
   */
  getMessages(): FloydMessage[] {
    return this.messages;
  }

  /**
   * Get message count
   */
  getCount(): number {
    return this.messages.length;
  }

  /**
   * Display recent messages (last 10 by default)
   */
  display(limit: number = 10): void {
    if (this.messages.length === 0) {
      console.log(chalk.gray('No messages in history'));
      console.log();
      return;
    }

    const recentMessages = this.messages.slice(-limit);

    for (const msg of recentMessages) {
      const roleColor = msg.role === 'user' ? chalk.green : chalk.cyan;
      const roleName = msg.role === 'user' ? 'You' : msg.role === 'assistant' ? 'Floyd' : msg.role.toUpperCase();

      console.log(`${roleColor.bold(`${roleName}:`)}`);

      if (msg.role === 'tool') {
        // For tool messages, show tool name and result
        const toolName = msg.toolName || 'unknown';
        console.log(chalk.dim(`Tool: ${toolName}`));
        console.log();
      } else {
        // For user/assistant messages, show content
        console.log(msg.content);
        console.log();
      }
    }
  }

  /**
   * Display messages as a compact table
   */
  displayCompact(limit: number = 10): void {
    if (this.messages.length === 0) {
      console.log(chalk.gray('No messages in history'));
      console.log();
      return;
    }

    const recentMessages = this.messages.slice(-limit);

    console.log(chalk.dim('─'.repeat(60)));
    console.log(chalk.bold('Conversation History'));
    console.log(chalk.dim('─'.repeat(60)));

    for (const msg of recentMessages) {
      const roleColor = msg.role === 'user' ? chalk.green : chalk.cyan;
      const roleName = msg.role === 'user' ? 'You' : msg.role === 'assistant' ? 'Floyd' : msg.role.toUpperCase();
      const preview = msg.content.slice(0, 60) + (msg.content.length > 60 ? '...' : '');

      console.log(`${roleColor(roleName.padEnd(12))} ${chalk.dim(preview)}`);
    }

    console.log(chalk.dim('─'.repeat(60)));
    console.log();
  }

  /**
   * Get last user message
   */
  getLastUserMessage(): string | undefined {
    for (let i = this.messages.length - 1; i >= 0; i--) {
      if (this.messages[i].role === 'user') {
        return this.messages[i].content;
      }
    }
    return undefined;
  }

  /**
   * Get last assistant message
   */
  getLastAssistantMessage(): string | undefined {
    for (let i = this.messages.length - 1; i >= 0; i--) {
      if (this.messages[i].role === 'assistant') {
        return this.messages[i].content;
      }
    }
    return undefined;
  }

  /**
   * Get messages by role
   */
  getMessagesByRole(role: FloydMessage['role']): FloydMessage[] {
    return this.messages.filter(msg => msg.role === role);
  }

  /**
   * Get turn count (pairs of user + assistant)
   */
  getTurnCount(): number {
    const userMessages = this.getMessagesByRole('user');
    const assistantMessages = this.getMessagesByRole('assistant');
    return Math.min(userMessages.length, assistantMessages.length);
  }
}

// ============================================================================
// Global History Instance
// ============================================================================

/**
 * Global conversation history instance
 */
export const conversationHistory = new ConversationHistory();
