/**
 * Error Humanizer - Converts technical errors into user-friendly messages
 * 
 * This module provides consistent, actionable error messages for common
 * error scenarios across the Floyd ecosystem.
 */

export interface HumanizedError {
  /** User-facing message */
  message: string;
  /** Technical details (for logging) */
  technical: string;
  /** Recovery suggestions */
  recovery: string[];
  /** Severity level */
  severity: 'info' | 'warning' | 'error' | 'critical';
  /** Error code for lookup */
  code: string;
}

/**
 * Common error patterns and their humanizations
 */
const ERROR_PATTERNS: Array<{
  pattern: RegExp;
  code: string;
  humanize: (match: RegExpMatchArray, original: string) => HumanizedError;
}> = [
  // API Key errors
  {
    pattern: /401|unauthorized|invalid.*(api|key|token)|authentication/i,
    code: 'AUTH_FAILED',
    humanize: (_, original) => ({
      message: 'Authentication failed - please check your API key',
      technical: original,
      recovery: [
        'Open Settings and verify your API key is correct',
        'If using GLM, ensure you\'re using a valid api.z.ai key',
        'If using Anthropic directly, check your Anthropic API key',
      ],
      severity: 'error',
      code: 'AUTH_FAILED',
    }),
  },
  // Rate limiting
  {
    pattern: /429|rate.?limit|too.?many.?requests|quota/i,
    code: 'RATE_LIMITED',
    humanize: (_, original) => ({
      message: 'API rate limit reached - please wait a moment',
      technical: original,
      recovery: [
        'Wait 30-60 seconds before trying again',
        'Consider upgrading your API plan for higher limits',
        'Reduce the frequency of requests',
      ],
      severity: 'warning',
      code: 'RATE_LIMITED',
    }),
  },
  // Network errors
  {
    pattern: /ECONNREFUSED|ENOTFOUND|ETIMEDOUT|network|fetch.?failed|connection/i,
    code: 'NETWORK_ERROR',
    humanize: (_, original) => ({
      message: 'Network connection failed',
      technical: original,
      recovery: [
        'Check your internet connection',
        'Verify the API endpoint is correct in Settings',
        'If using a proxy or VPN, ensure it\'s working',
      ],
      severity: 'error',
      code: 'NETWORK_ERROR',
    }),
  },
  // Model not found
  {
    pattern: /model.*(not.?found|invalid|unavailable)|unknown.?model/i,
    code: 'MODEL_NOT_FOUND',
    humanize: (_, original) => ({
      message: 'The selected model is not available',
      technical: original,
      recovery: [
        'Open Settings and select a different model',
        'Check if your API plan includes access to this model',
        'Try using the default model (glm-4.7)',
      ],
      severity: 'error',
      code: 'MODEL_NOT_FOUND',
    }),
  },
  // Token/context length exceeded
  {
    pattern: /token|context.?length|maximum.?length|too.?long/i,
    code: 'CONTEXT_TOO_LONG',
    humanize: (_, original) => ({
      message: 'Message too long for the model to process',
      technical: original,
      recovery: [
        'Try breaking your message into smaller parts',
        'Start a new conversation to clear history',
        'Remove some context files if attached',
      ],
      severity: 'warning',
      code: 'CONTEXT_TOO_LONG',
    }),
  },
  // Server errors (5xx)
  {
    pattern: /5\d{2}|internal.?server|service.?unavailable/i,
    code: 'SERVER_ERROR',
    humanize: (_, original) => ({
      message: 'The API service is temporarily unavailable',
      technical: original,
      recovery: [
        'Wait a few minutes and try again',
        'Check the API provider\'s status page',
        'If the issue persists, try a different provider',
      ],
      severity: 'error',
      code: 'SERVER_ERROR',
    }),
  },
  // MCP connection errors
  {
    pattern: /mcp|tool.?server|client.?manager/i,
    code: 'MCP_ERROR',
    humanize: (_, original) => ({
      message: 'Could not connect to tool server',
      technical: original,
      recovery: [
        'Check that MCP servers are properly configured',
        'Verify the server command and path are correct',
        'Try restarting the application',
      ],
      severity: 'warning',
      code: 'MCP_ERROR',
    }),
  },
  // Tool execution errors
  {
    pattern: /tool.*(fail|error|exception)|permission.?denied/i,
    code: 'TOOL_ERROR',
    humanize: (_, original) => ({
      message: 'Tool execution failed',
      technical: original,
      recovery: [
        'Check that you have permission to perform this action',
        'Verify the file or directory exists',
        'Review the tool input for correctness',
      ],
      severity: 'warning',
      code: 'TOOL_ERROR',
    }),
  },
  // JSON parsing errors
  {
    pattern: /json|parse|syntax.?error|unexpected.?token/i,
    code: 'PARSE_ERROR',
    humanize: (_, original) => ({
      message: 'Failed to process server response',
      technical: original,
      recovery: [
        'This is usually a temporary issue - try again',
        'If the error persists, try starting a new conversation',
        'Check that the API endpoint is correct',
      ],
      severity: 'warning',
      code: 'PARSE_ERROR',
    }),
  },
  // File system errors
  {
    pattern: /ENOENT|EACCES|EPERM|file.*(not.?found|access)|directory/i,
    code: 'FILE_ERROR',
    humanize: (_, original) => ({
      message: 'File or directory access error',
      technical: original,
      recovery: [
        'Verify the file path is correct',
        'Check that you have permission to access the file',
        'Ensure the directory exists',
      ],
      severity: 'error',
      code: 'FILE_ERROR',
    }),
  },
];

/**
 * Humanize an error message
 * 
 * @param error - Error string or Error object
 * @returns Humanized error information
 */
export function humanizeError(error: string | Error): HumanizedError {
  const errorMessage = error instanceof Error ? error.message : String(error);
  
  // Try to match against known patterns
  for (const { pattern, humanize } of ERROR_PATTERNS) {
    const match = errorMessage.match(pattern);
    if (match) {
      return humanize(match, errorMessage);
    }
  }
  
  // Default fallback for unknown errors
  return {
    message: 'An unexpected error occurred',
    technical: errorMessage,
    recovery: [
      'Try the action again',
      'If the error persists, restart the application',
      'Check the logs for more details',
    ],
    severity: 'error',
    code: 'UNKNOWN_ERROR',
  };
}

/**
 * Format a humanized error for display
 * 
 * @param error - Humanized error object
 * @param verbose - Include technical details
 * @returns Formatted error string
 */
export function formatHumanizedError(error: HumanizedError, verbose: boolean = false): string {
  let result = error.message;
  
  if (error.recovery.length > 0) {
    result += '\n\nWhat to try:\n';
    result += error.recovery.map(r => `  • ${r}`).join('\n');
  }
  
  if (verbose && error.technical !== error.message) {
    result += `\n\nTechnical details: ${error.technical}`;
  }
  
  return result;
}

/**
 * Get severity emoji for UI display
 */
export function getSeverityEmoji(severity: HumanizedError['severity']): string {
  switch (severity) {
    case 'info': return 'ℹ️';
    case 'warning': return '⚠️';
    case 'error': return '❌';
    case 'critical': return '🚨';
    default: return '❓';
  }
}
