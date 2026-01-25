/**
 * Core Types - Floyd Wrapper
 *
 * Shared TypeScript interfaces for the entire Floyd Wrapper application.
 * All types use explicit typing (no `any`) for type safety.
 */

import type { z } from 'zod';

// ============================================================================
// Message Types
// ============================================================================

/**
 * Represents a single message in the conversation
 */
export interface FloydMessage {
  /** Message role in the conversation */
  role: 'user' | 'assistant' | 'system' | 'tool';
  /** Message content (text or JSON string) */
  content: string;
  /** Unix timestamp of when message was created */
  timestamp: number;
  /** Tool use identifier (for tool-related messages) */
  toolUseId?: string;
  /** Tool name (for tool-related messages) */
  toolName?: string;
  /** Tool input parameters (for tool-related messages) */
  toolInput?: Record<string, unknown>;
}

// ============================================================================
// Tool Types
// ============================================================================

/**
 * Tool category classification
 */
export type ToolCategory =
  | 'file'
  | 'search'
  | 'build'
  | 'git'
  | 'browser'
  | 'cache'
  | 'patch'
  | 'special';

/**
 * Definition of a single tool in the tool registry
 */
export interface ToolDefinition {
  /** Unique tool name (e.g., "read_file") */
  name: string;
  /** Human-readable tool description */
  description: string;
  /** Tool category for organization */
  category: ToolCategory;
  /** Zod schema for validating input parameters */
  inputSchema: z.ZodTypeAny;
  /** Permission level required for execution */
  permission: 'none' | 'moderate' | 'dangerous';
  /** Optional example input for documentation */
  example?: Record<string, unknown>;
  /** Async function that executes the tool */
  execute: (input: unknown) => Promise<ToolResult>;
}

/**
 * Result returned by tool execution
 */
export interface ToolResult<T = unknown> {
  /** Whether tool execution succeeded */
  success: boolean;
  /** Result data (present if success is true) */
  data?: T;
  /** Error details (present if success is false) */
  error?: {
    /** Error code for programmatic handling */
    code: string;
    /** Human-readable error message */
    message: string;
    /** Additional error details */
    details?: unknown;
  };
}

/**
 * Error codes for standardized error handling (v1.2.0+)
 */
export type ErrorCode =
  | 'INVALID_INPUT'       // Schema validation failed
  | 'AUTH'                // Authentication/authorization failed
  | 'RATE_LIMIT'          // API rate limit exceeded
  | 'NOT_FOUND'           // Resource doesn't exist
  | 'FILE_NOT_FOUND'      // File doesn't exist
  | 'TIMEOUT'             // Operation exceeded timeout
  | 'DEPENDENCY_FAIL'     // Required service unavailable
  | 'INVARIANT_BROKEN'    // Critical assumption violated (triggers stop)
  | 'PERMISSION_DENIED'   // Tool access denied by policy
  | 'PERMISSION_REQUIRED' // Permission needs approval
  | 'VALIDATION_ERROR'    // Input failed Zod validation
  | 'TOOL_NOT_FOUND'      // Tool not registered
  | 'TOOL_EXECUTION_FAILED' // Tool threw uncaught error
  | 'VERIFICATION_FAILED' // Post-execution check failed
  | 'CONFLICT'            // Resource conflict (git merge, file locked)
  | 'NETWORK_ERROR'       // Network operation failed
  | 'PARSE_ERROR';        // Failed to parse response

/**
 * Receipt type for audit trail (v1.2.0+)
 */
export type ReceiptType = 'file_read' | 'file_write' | 'command' | 'network' | 'git' | 'cache' | 'browser' | 'search';

/**
 * Individual receipt for audit trail (v1.2.0+)
 */
export interface Receipt {
  /** Type of operation */
  type: ReceiptType;
  /** Source/target of operation */
  source: string;
  /** Unix timestamp when operation occurred */
  timestamp: number;
  /** Content hash for file operations (optional) */
  hash?: string;
  /** Duration of operation in milliseconds */
  duration_ms?: number;
}

/**
 * Extended result with receipts for audit trail (v1.2.0+)
 * Backwards compatible - extends ToolResult
 */
export interface ToolReceipt<T = unknown> extends ToolResult<T> {
  /** Structured status for receipt */
  status: 'success' | 'error' | 'partial';
  /** Warning messages (non-fatal issues) */
  warnings: string[];
  /** Audit trail receipts */
  receipts: Receipt[];
  /** Suggested next actions */
  next_actions?: string[];
  /** Execution duration in milliseconds */
  duration_ms: number;
  /** Unix timestamp when execution started */
  started_at: number;
  /** Unix timestamp when execution completed */
  completed_at: number;
}

// ============================================================================
// Streaming Types
// ============================================================================

/**
 * Event type for streaming responses
 */
export type StreamEventType = 'token' | 'tool_use' | 'tool_result' | 'error' | 'done';

/**
 * Single event in the streaming response
 */
export interface StreamEvent {
  /** Event type */
  type: StreamEventType;
  /** Event content (token text or data) */
  content: string;
  /** Tool use details (for tool_use events) */
  toolUse?: {
    /** Unique tool use ID */
    id: string;
    /** Tool name being used */
    name: string;
    /** Tool input parameters */
    input: Record<string, unknown>;
  };
  /** Error message (for error events) */
  error?: string;
}

// ============================================================================
// Conversation Types
// ============================================================================

/**
 * Conversation history with metadata
 */
export interface ConversationHistory {
  /** All messages in the conversation */
  messages: FloydMessage[];
  /** Number of turns (user+assistant pairs) */
  turnCount: number;
  /** Total token count across all messages */
  tokenCount: number;
}

// ============================================================================
// Configuration Types
// ============================================================================

/**
 * Log level for logging system
 */
export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

/**
 * Permission handling strategy
 */
export type PermissionLevel = 'auto' | 'ask' | 'deny';

/**
 * Floyd Wrapper configuration
 */
export interface FloydConfig {
  /** GLM API key */
  glmApiKey: string;
  /** GLM API endpoint URL */
  glmApiEndpoint: string;
  /** GLM model name */
  glmModel: string;
  /** Maximum tokens for model response */
  maxTokens: number;
  /** Temperature for response randomness (0-1) */
  temperature: number;
  /** Maximum turns for agent execution */
  maxTurns: number;
  /** Logging verbosity level */
  logLevel: LogLevel;
  /** Whether caching is enabled */
  cacheEnabled: boolean;
  /** Permission handling strategy */
  permissionLevel: PermissionLevel;
  /** Default execution mode */
  mode: ExecutionMode;
  /** Global ignore patterns from .floydignore */
  floydIgnorePatterns?: string[];
  /** Project context from FLOYD.md */
  projectContext?: string;
  /** Current working directory */
  cwd: string;
  /** Use hardened prompt system (v1.1.0+) */
  useHardenedPrompt?: boolean;
  /** Enable preserved thinking across turns */
  enablePreservedThinking?: boolean;
  /** Enable turn-level thinking control */
  enableTurnLevelThinking?: boolean;
  /** Use JSON planning mode */
  useJsonPlanning?: boolean;
}

// ============================================================================
// Cache Types
// ============================================================================

/**
 * Cache tier levels for SUPERCACHE
 */
export type CacheTier = 'reasoning' | 'project' | 'vault';

/**
 * Cache entry metadata
 */
export interface CacheEntry<T = unknown> {
  /** Cached data */
  data: T;
  /** Timestamp when entry was created */
  createdAt: number;
  /** Timestamp when entry expires */
  expiresAt: number;
  /** Number of times entry has been accessed */
  accessCount: number;
  /** Cache tier */
  tier: CacheTier;
}

// ============================================================================
// Agent Types
// ============================================================================

/**
 * Agent execution state
 */
export type AgentState =
  | 'idle'
  | 'thinking'
  | 'executing'
  | 'waiting_permission'
  | 'done'
  | 'error';

/**
 * Execution Mode
 */
export type ExecutionMode = 'ask' | 'yolo' | 'plan' | 'auto' | 'dialogue';

/**
 * Agent execution execution context
 */
export interface AgentContext {
  /** Current conversation history */
  conversation: ConversationHistory;
  /** Current agent state */
  state: AgentState;
  /** Turn count in current session */
  turnCount: number;
  /** Maximum allowed turns */
  maxTurns: number;
  /** Tool registry reference */
  tools: Map<string, ToolDefinition>;
  /** Current execution mode */
  executionMode: ExecutionMode;
}

// ============================================================================
// UI Types
// ============================================================================

/**
 * UI theme colors
 */
export interface ThemeColors {
  /** Primary color */
  primary: string;
  /** Secondary color */
  secondary: string;
  /** Success color */
  success: string;
  /** Warning color */
  warning: string;
  /** Error color */
  error: string;
  /** Info color */
  info: string;
  /** Muted color */
  muted: string;
}

/**
 * Spinner state for UI
 */
export interface SpinnerState {
  /** Current spinner message */
  message: string;
  /** Whether spinner is active */
  active: boolean;
  /** Spinner type */
  type: string;
}

// ============================================================================
// Session & Persistence Types
// ============================================================================

/**
 * Metadata stored with a session
 */
export interface SessionMetadata {
  description?: string;
  tags?: string[];
  lastActiveMode?: string;
  [key: string]: unknown;
}

/**
 * A persistent work session
 */
export interface Session {
  id: string;
  name: string;
  createdAt: number;
  updatedAt: number;
  metadata: SessionMetadata;
}

/**
 * A state checkpoint for rewind/restore
 */
export interface Checkpoint {
  id: string;
  sessionId: string;
  description: string;
  filePath: string;
  contentBlob: Buffer; // or string if encoded
  timestamp: number;
  triggerEvent: string;
}
