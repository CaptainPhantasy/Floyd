/**
 * Interrupts Module - Floyd Wrapper
 *
 * Exports for graceful interrupt handling
 *
 * @module interrupts
 */

export {
  InterruptManager,
  getInterruptManager,
  resetInterruptManager,
} from './interrupt-manager.js';

export type {
  InterruptableState,
  InterruptAction,
  InterruptEvent,
  InterruptManagerOptions,
} from './interrupt-manager.js';
