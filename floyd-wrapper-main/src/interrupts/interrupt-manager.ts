/**
 * Interrupt Manager - Floyd Wrapper
 *
 * State-aware interrupt handling for graceful session control.
 * Allows interrupting operations without killing the entire session.
 *
 * @module interrupts/interrupt-manager
 */

import { EventEmitter } from 'node:events';
import { logger } from '../utils/logger.js';

// ============================================================================
// Types
// ============================================================================

/**
 * Agent execution states for interrupt handling
 */
export type InterruptableState =
  | 'idle'           // Waiting for user input
  | 'thinking'       // LLM is generating response
  | 'tool_executing' // Tool is running
  | 'tool_pending'   // Tool awaiting permission
  | 'streaming';     // Streaming response to terminal

/**
 * Interrupt action to take based on current state
 */
export type InterruptAction =
  | 'ignore'         // Ignore the interrupt
  | 'cancel_turn'    // Cancel current LLM turn
  | 'abort_tool'     // Abort running tool
  | 'clear_prompt'   // Clear current prompt
  | 'confirm_exit'   // Confirm before exiting
  | 'force_exit';    // Exit immediately

/**
 * Interrupt event payload
 */
export interface InterruptEvent {
  /** Current state when interrupt occurred */
  state: InterruptableState;
  /** Action to take */
  action: InterruptAction;
  /** Number of consecutive interrupts */
  consecutiveCount: number;
  /** Timestamp of interrupt */
  timestamp: number;
}

/**
 * Interrupt manager options
 */
export interface InterruptManagerOptions {
  /** Time window for consecutive interrupts (ms) */
  consecutiveWindow?: number;
  /** Number of consecutive interrupts for force exit */
  forceExitThreshold?: number;
  /** Enable checkpoint on interrupt */
  checkpointOnInterrupt?: boolean;
}

// ============================================================================
// Interrupt Manager Class
// ============================================================================

/**
 * InterruptManager - Graceful interrupt handling
 *
 * Manages SIGINT (Ctrl+C) signals in a state-aware manner:
 * - IDLE: Confirm exit or clear prompt
 * - THINKING: Cancel current turn, stay in session
 * - TOOL_EXECUTING: Abort tool, create checkpoint
 * - STREAMING: Stop stream, show partial output
 */
export class InterruptManager extends EventEmitter {
  private currentState: InterruptableState = 'idle';
  private abortController: AbortController | null = null;
  private lastInterruptTime: number = 0;
  private consecutiveInterrupts: number = 0;
  private options: Required<InterruptManagerOptions>;
  private isInitialized: boolean = false;
  private originalSigintHandler?: NodeJS.SignalsListener;

  constructor(options: InterruptManagerOptions = {}) {
    super();

    this.options = {
      consecutiveWindow: options.consecutiveWindow ?? 2000, // 2 seconds
      forceExitThreshold: options.forceExitThreshold ?? 3,  // 3 rapid Ctrl+C = force exit
      checkpointOnInterrupt: options.checkpointOnInterrupt ?? true,
    };
  }

  /**
   * Initialize interrupt handling
   */
  initialize(): void {
    if (this.isInitialized) {
      return;
    }

    // Store original SIGINT handler if exists
    const listeners = process.listeners('SIGINT');
    if (listeners.length > 0) {
      this.originalSigintHandler = listeners[0] as NodeJS.SignalsListener;
    }

    // Remove existing SIGINT handlers
    process.removeAllListeners('SIGINT');

    // Install our state-aware handler
    process.on('SIGINT', () => this.handleInterrupt());

    this.isInitialized = true;
    logger.debug('InterruptManager initialized');
  }

  /**
   * Cleanup and restore original handlers
   */
  cleanup(): void {
    if (!this.isInitialized) {
      return;
    }

    process.removeAllListeners('SIGINT');

    if (this.originalSigintHandler) {
      process.on('SIGINT', this.originalSigintHandler);
    }

    this.isInitialized = false;
    logger.debug('InterruptManager cleaned up');
  }

  /**
   * Set current execution state
   */
  setState(state: InterruptableState): void {
    const prevState = this.currentState;
    this.currentState = state;

    if (prevState !== state) {
      logger.debug('InterruptManager state changed', { from: prevState, to: state });
      this.emit('stateChange', { from: prevState, to: state });
    }
  }

  /**
   * Get current execution state
   */
  getState(): InterruptableState {
    return this.currentState;
  }

  /**
   * Create a new AbortController for the current operation
   */
  createAbortController(): AbortController {
    // Abort any existing controller
    if (this.abortController) {
      this.abortController.abort('New operation started');
    }

    this.abortController = new AbortController();
    return this.abortController;
  }

  /**
   * Get the current abort signal
   */
  getAbortSignal(): AbortSignal | undefined {
    return this.abortController?.signal;
  }

  /**
   * Check if current operation is aborted
   */
  isAborted(): boolean {
    return this.abortController?.signal.aborted ?? false;
  }

  /**
   * Clear the abort controller
   */
  clearAbortController(): void {
    this.abortController = null;
  }

  /**
   * Handle SIGINT signal
   */
  private handleInterrupt(): void {
    const now = Date.now();

    // Track consecutive interrupts
    if (now - this.lastInterruptTime < this.options.consecutiveWindow) {
      this.consecutiveInterrupts++;
    } else {
      this.consecutiveInterrupts = 1;
    }
    this.lastInterruptTime = now;

    // Force exit on rapid consecutive interrupts
    if (this.consecutiveInterrupts >= this.options.forceExitThreshold) {
      this.emitInterrupt('force_exit');
      return;
    }

    // Determine action based on current state
    const action = this.determineAction();
    this.emitInterrupt(action);
  }

  /**
   * Determine interrupt action based on current state
   */
  private determineAction(): InterruptAction {
    switch (this.currentState) {
      case 'idle':
        // Second interrupt in idle = confirm exit
        if (this.consecutiveInterrupts >= 2) {
          return 'confirm_exit';
        }
        return 'clear_prompt';

      case 'thinking':
        return 'cancel_turn';

      case 'tool_executing':
        return 'abort_tool';

      case 'tool_pending':
        return 'cancel_turn';

      case 'streaming':
        return 'cancel_turn';

      default:
        return 'ignore';
    }
  }

  /**
   * Emit interrupt event
   */
  private emitInterrupt(action: InterruptAction): void {
    // Abort current operation if applicable
    if (action === 'cancel_turn' || action === 'abort_tool') {
      if (this.abortController) {
        this.abortController.abort('User interrupt');
        logger.info('Operation aborted by user interrupt');
      }
    }

    const event: InterruptEvent = {
      state: this.currentState,
      action,
      consecutiveCount: this.consecutiveInterrupts,
      timestamp: Date.now(),
    };

    logger.debug('Interrupt event', event);
    this.emit('interrupt', event);
  }

  /**
   * Reset consecutive interrupt counter
   */
  resetConsecutive(): void {
    this.consecutiveInterrupts = 0;
  }

  /**
   * Get interrupt statistics
   */
  getStats(): {
    currentState: InterruptableState;
    consecutiveInterrupts: number;
    lastInterruptTime: number;
    isAborted: boolean;
  } {
    return {
      currentState: this.currentState,
      consecutiveInterrupts: this.consecutiveInterrupts,
      lastInterruptTime: this.lastInterruptTime,
      isAborted: this.isAborted(),
    };
  }
}

// ============================================================================
// Singleton Instance
// ============================================================================

let interruptManager: InterruptManager | null = null;

/**
 * Get or create the global interrupt manager
 */
export function getInterruptManager(
  options?: InterruptManagerOptions
): InterruptManager {
  if (!interruptManager) {
    interruptManager = new InterruptManager(options);
  }
  return interruptManager;
}

/**
 * Reset the global interrupt manager (for testing)
 */
export function resetInterruptManager(): void {
  if (interruptManager) {
    interruptManager.cleanup();
    interruptManager = null;
  }
}

export default InterruptManager;
