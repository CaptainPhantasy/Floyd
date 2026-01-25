/**
 * Floyd Wrapper - Main API Entry Point
 *
 * @module @cursem/floyd-wrapper
 *
 * File-Logged Orchestrator Yielding Deliverables - AI Development Companion
 *
 * This module provides the complete FloydWrapper API including:
 * - Agent execution engine (FloydAgentEngine)
 * - CLI interface (FloydCLI)
 * - Tool registry and core tools
 * - Type definitions
 * - Logging utilities
 * - Configuration management
 * - UI components (FloydTerminal)
 * - Error handling
 */

// ============================================================================
// Core Agent Engine
// ============================================================================

export { FloydAgentEngine } from './agent/execution-engine.js';
export type { EngineCallbacks } from './agent/execution-engine.js';

// ============================================================================
// CLI Interface
// ============================================================================

export { FloydCLI, main } from './cli.js';

// ============================================================================
// Tool Registry & Tools
// ============================================================================

export {
  ToolRegistry,
  toolRegistry,
  registerCoreTools,
} from './tools/index.js';

export * from './tools/tool-registry.js';

// ============================================================================
// Type Definitions
// ============================================================================

export * from './types.js';

// ============================================================================
// Logging
// ============================================================================

export {
  FloydLogger,
  FloydScopedLogger,
  logger,
  initLogger,
} from './utils/logger.js';

// ============================================================================
// Configuration Management
// ============================================================================

export {
  loadConfig,
  loadProjectContext,
  getCachePath,
  ensureCacheDirectories,
  validateConfig,
  getDefaultConfig,
  mergeConfig,
  getEnvBool,
  getEnvNumber,
  getEnvString,
} from './utils/config.js';

// ============================================================================
// Error Handling
// ============================================================================

export {
  FloydError,
  ToolExecutionError,
  GLMAPIError,
  PermissionDeniedError,
  StreamError,
  CacheError,
  ConfigError,
  ValidationError,
  TimeoutError,
  isFloydError,
  isToolExecutionError,
  isGLMAPIError,
  isPermissionDeniedError,
  isRecoverableError,
  shouldRetry,
  getRetryDelay,
  formatError,
} from './utils/errors.js';

// ============================================================================
// UI Components
// ============================================================================

export {
  FloydTerminal,
  terminal,
} from './ui/terminal.js';

// ============================================================================
// Interrupt Handling
// ============================================================================

export {
  InterruptManager,
  getInterruptManager,
} from './interrupts/index.js';

export type {
  InterruptableState,
  InterruptAction,
  InterruptEvent,
  InterruptManagerOptions,
} from './interrupts/index.js';

// ============================================================================
// Checkpoint & Rewind System
// ============================================================================

export {
  CheckpointManager,
  getCheckpointManager,
  resetCheckpointManager,
  DANGEROUS_TOOLS,
  FileSnapshotManager,
  getDefaultSnapshotManager,
  formatBytes,
  calculateTotalSnapshotsSize,
} from './rewind/index.js';

export type {
  Checkpoint,
  CheckpointOptions,
  CheckpointStorageOptions,
  FileSnapshot,
  SnapshotOptions,
} from './rewind/index.js';

// ============================================================================
// Sandbox System
// ============================================================================

export {
  SandboxManager,
  getSandboxManager,
  DryRunSandbox,
  getDryRunSandbox,
  resetSandbox,
} from './sandbox/index.js';

export type {
  SandboxType,
  SandboxState,
  SandboxFileChange,
  SandboxSession,
  SandboxOptions,
  CommitResult,
} from './sandbox/index.js';
