/**
 * Custom Error Classes - Floyd Wrapper
 *
 * Error handling infrastructure with typed error classes and recovery utilities.
 */

// ============================================================================
// Base Error Class
// ============================================================================

/**
 * Base error class for all Floyd-specific errors
 */
export class FloydError extends Error {
  /**
   * Error code for programmatic handling
   */
  public readonly code: string;

  /**
   * Additional error details
   */
  public readonly details?: unknown;

  constructor(message: string, code: string, details?: unknown) {
    super(message);
    this.name = 'FloydError';
    this.code = code;
    this.details = details;

    // Maintains proper stack trace (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, FloydError);
    }
  }

  toJSON(): Record<string, unknown> {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      details: this.details,
      stack: this.stack,
    };
  }
}

// ============================================================================
// Tool Errors
// ============================================================================

/**
 * Error thrown when tool execution fails
 */
export class ToolExecutionError extends FloydError {
  public readonly toolName: string;

  constructor(toolName: string, message: string, details?: unknown) {
    const errorDetails: Record<string, unknown> = { toolName };
    if (details && typeof details === 'object' && !Array.isArray(details)) {
      Object.assign(errorDetails, details);
    }
    super(message, 'TOOL_EXECUTION_ERROR', errorDetails);
    this.name = 'ToolExecutionError';
    this.toolName = toolName;
  }
}

// ============================================================================
// API Errors
// ============================================================================

/**
 * Error thrown when GLM API call fails
 */
export class GLMAPIError extends FloydError {
  public readonly statusCode?: number;

  constructor(message: string, statusCode?: number, details?: unknown) {
    const errorDetails: Record<string, unknown> = { statusCode };
    if (details && typeof details === 'object' && !Array.isArray(details)) {
      Object.assign(errorDetails, details);
    }
    super(message, 'GLM_API_ERROR', errorDetails);
    this.name = 'GLMAPIError';
    this.statusCode = statusCode;
  }

  /**
   * Whether this error is an authentication error
   */
  isAuthError(): boolean {
    return this.statusCode === 401;
  }

  /**
   * Whether this error is a rate limit error
   */
  isRateLimitError(): boolean {
    return this.statusCode === 429;
  }

  /**
   * Whether this error is a server error
   */
  isServerError(): boolean {
    return this.statusCode !== undefined && this.statusCode >= 500;
  }
}

// ============================================================================
// Permission Errors
// ============================================================================

/**
 * Error thrown when permission is denied for a tool
 */
export class PermissionDeniedError extends FloydError {
  public readonly toolName: string;

  constructor(toolName: string, reason: string) {
    super(`Permission denied for ${toolName}: ${reason}`, 'PERMISSION_DENIED', { toolName, reason });
    this.name = 'PermissionDeniedError';
    this.toolName = toolName;
  }
}

// ============================================================================
// Stream Errors
// ============================================================================

/**
 * Error thrown when stream processing fails
 */
export class StreamError extends FloydError {
  constructor(message: string, details?: unknown) {
    super(message, 'STREAM_ERROR', details);
    this.name = 'StreamError';
  }
}

// ============================================================================
// Cache Errors
// ============================================================================

/**
 * Error thrown when cache operations fail
 */
export class CacheError extends FloydError {
  constructor(message: string, details?: unknown) {
    super(message, 'CACHE_ERROR', details);
    this.name = 'CacheError';
  }
}

// ============================================================================
// Configuration Errors
// ============================================================================

/**
 * Error thrown when configuration is invalid
 */
export class ConfigError extends FloydError {
  constructor(message: string, details?: unknown) {
    super(message, 'CONFIG_ERROR', details);
    this.name = 'ConfigError';
  }
}

// ============================================================================
// Validation Errors
// ============================================================================

/**
 * Error thrown when input validation fails
 */
export class ValidationError extends FloydError {
  constructor(message: string, details?: unknown) {
    super(message, 'VALIDATION_ERROR', details);
    this.name = 'ValidationError';
  }
}

// ============================================================================
// Timeout Errors
// ============================================================================

/**
 * Error thrown when operation times out
 */
export class TimeoutError extends FloydError {
  constructor(message: string, details?: unknown) {
    super(message, 'TIMEOUT_ERROR', details);
    this.name = 'TimeoutError';
  }
}

// ============================================================================
// Type Guards
// ============================================================================

/**
 * Type guard for FloydError
 */
export function isFloydError(error: unknown): error is FloydError {
  return error instanceof FloydError;
}

/**
 * Type guard for ToolExecutionError
 */
export function isToolExecutionError(error: unknown): error is ToolExecutionError {
  return error instanceof ToolExecutionError;
}

/**
 * Type guard for GLMAPIError
 */
export function isGLMAPIError(error: unknown): error is GLMAPIError {
  return error instanceof GLMAPIError;
}

/**
 * Type guard for PermissionDeniedError
 */
export function isPermissionDeniedError(error: unknown): error is PermissionDeniedError {
  return error instanceof PermissionDeniedError;
}

// ============================================================================
// Error Recovery Utilities
// ============================================================================

/**
 * Determine if an error is recoverable (can be retried)
 */
export function isRecoverableError(error: Error): boolean {
  if (error instanceof GLMAPIError) {
    // Auth errors are not recoverable
    if (error.isAuthError()) {
      return false;
    }
    // Rate limit and server errors are recoverable
    return error.isRateLimitError() || error.isServerError();
  }

  // Timeout errors are recoverable
  if (error instanceof TimeoutError) {
    return true;
  }

  return false;
}

/**
 * Determine if an error should trigger a retry
 */
export function shouldRetry(error: Error): boolean {
  if (error instanceof GLMAPIError) {
    // Retry on rate limit and server errors
    if (error.isRateLimitError()) {
      return true;
    }

    if (error.isServerError()) {
      return true;
    }
  }

  if (error instanceof TimeoutError) {
    return true;
  }

  return false;
}

/**
 * Get suggested retry delay in milliseconds
 */
export function getRetryDelay(error: Error, attempt: number): number {
  const baseDelay = 1000; // 1 second base delay
  const maxDelay = 30000; // 30 seconds max delay

  if (error instanceof GLMAPIError && error.isRateLimitError()) {
    // Use exponential backoff with jitter
    const delay = Math.min(baseDelay * 2 ** attempt + Math.random() * 1000, maxDelay);
    return delay;
  }

  // Standard exponential backoff
  const delay = Math.min(baseDelay * 2 ** attempt, maxDelay);
  return delay;
}

/**
 * Format error for user-friendly display
 */
export function formatError(error: Error): string {
  if (isFloydError(error)) {
    let message = `${error.name}: ${error.message}`;

    if (error.details) {
      try {
        message += `\nDetails: ${JSON.stringify(error.details, null, 2)}`;
      } catch {
        message += `\nDetails: [Could not serialize]`;
      }
    }

    return message;
  }

  return error.message || 'An unknown error occurred';
}
