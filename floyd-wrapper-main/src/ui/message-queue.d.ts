/**
 * Type definitions for message-queue.js
 */

export class MessageQueue {
  private queue: Array<{message: string, callback: (message: string) => Promise<void>}>;
  private isProcessing: boolean;

  enqueue(message: string, callback: (message: string) => Promise<void>): void;
  process(): Promise<void>;
  isEmpty(): boolean;
  getLength(): number;
  clear(): void;
  waitForQueue(): Promise<void>;
}

export function getMessageQueue(): MessageQueue;
