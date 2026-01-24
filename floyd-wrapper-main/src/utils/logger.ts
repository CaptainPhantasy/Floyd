/**
 * Logger - Floyd Wrapper
 *
 * Color-coded logging system with level filtering and tool execution logging.
 */

import chalk from 'chalk';
import type { LogLevel } from '../types.js';

// ============================================================================
// Logger Class
// ============================================================================

/**
 * Color-coded logger with level filtering
 */
export class FloydLogger {
  /**
   * Current log level
   */
  private level: LogLevel;

  /**
   * Log level priority (higher number = higher priority)
   */
  private readonly levelPriority: Record<LogLevel, number> = {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3,
  };

  constructor(level: LogLevel = 'info') {
    this.level = level;
  }

  /**
   * Set the log level
   */
  setLevel(level: LogLevel): void {
    this.level = level;
  }

  /**
   * Get the current log level
   */
  getLevel(): LogLevel {
    return this.level;
  }

  /**
   * Determine if a message should be logged based on level
   */
  private shouldLog(level: LogLevel): boolean {
    return this.levelPriority[level] >= this.levelPriority[this.level];
  }

  /**
   * Format timestamp
   */
  private getTimestamp(): string {
    const now = new Date();
    return now.toISOString();
  }

  /**
   * Log debug message
   */
  debug(message: string, ...args: unknown[]): void {
    if (this.shouldLog('debug')) {
      console.error(chalk.gray(`${this.getTimestamp()} [DEBUG]`), message, ...args);
    }
  }

  /**
   * Log info message
   */
  info(message: string, ...args: unknown[]): void {
    if (this.shouldLog('info')) {
      console.error(chalk.blue(`${this.getTimestamp()} [INFO]`), message, ...args);
    }
  }

  /**
   * Log warning message
   */
  warn(message: string, ...args: unknown[]): void {
    if (this.shouldLog('warn')) {
      console.error(chalk.yellow(`${this.getTimestamp()} [WARN]`), message, ...args);
    }
  }

  /**
   * Log error message
   */
  error(message: string, error?: Error | unknown): void {
    if (this.shouldLog('error')) {
      console.error(chalk.red(`${this.getTimestamp()} [ERROR]`), message);

      if (error instanceof Error) {
        console.error(chalk.gray(error.stack || error.message));
      } else if (error) {
        console.error(chalk.gray(String(error)));
      }
    }
  }

  /**
   * Log tool execution
   */
  tool(toolName: string, input: unknown, output: unknown): void {
    if (this.shouldLog('debug')) {
      console.error(chalk.cyan(`${this.getTimestamp()} [TOOL]`), toolName);

      try {
        console.error(chalk.gray('  Input:'), JSON.stringify(input, null, 2));
      } catch {
        console.error(chalk.gray('  Input:'), '[Could not serialize]');
      }

      try {
        console.error(chalk.gray('  Output:'), JSON.stringify(output, null, 2));
      } catch {
        console.error(chalk.gray('  Output:'), '[Could not serialize]');
      }
    }
  }

  /**
   * Log API request
   */
  apiRequest(endpoint: string, method: string = 'POST'): void {
    if (this.shouldLog('debug')) {
      console.error(chalk.magenta(`${this.getTimestamp()} [API]`), `${method} ${endpoint}`);
    }
  }

  /**
   * Log API response
   */
  apiResponse(statusCode: number, duration: number): void {
    if (this.shouldLog('debug')) {
      const statusColor =
        statusCode >= 200 && statusCode < 300
          ? chalk.green
          : statusCode >= 400 && statusCode < 500
            ? chalk.yellow
            : chalk.red;

      console.error(
        statusColor(`${this.getTimestamp()} [API]`),
        `Status: ${statusCode} (${duration}ms)`
      );
    }
  }

  /**
   * Log cache operation
   */
  cache(operation: 'hit' | 'miss' | 'set' | 'delete', key: string): void {
    if (this.shouldLog('debug')) {
      const colors = {
        hit: chalk.green,
        miss: chalk.yellow,
        set: chalk.blue,
        delete: chalk.gray,
      };

      console.error(colors[operation](`${this.getTimestamp()} [CACHE]`), operation.toUpperCase(), key);
    }
  }

  /**
   * Log permission request
   */
  permissionRequest(toolName: string, description: string): void {
    if (this.shouldLog('warn')) {
      console.error(
        chalk.magenta(`${this.getTimestamp()} [PERMISSION]`),
        `Requesting permission for ${toolName}`
      );
      console.error(chalk.gray('  Description:'), description);
    }
  }

  /**
   * Log stream event
   */
  streamEvent(eventType: string, data: string): void {
    if (this.shouldLog('debug')) {
      console.error(chalk.cyan(`${this.getTimestamp()} [STREAM]`), eventType, data);
    }
  }

  /**
   * Log agent state change
   */
  agentState(fromState: string, toState: string): void {
    if (this.shouldLog('debug')) {
      console.error(chalk.cyan(`${this.getTimestamp()} [AGENT]`), `${fromState} -> ${toState}`);
    }
  }

  /**
   * Create a scoped logger with prefix
   */
  scoped(prefix: string): FloydScopedLogger {
    return new FloydScopedLogger(this, prefix);
  }
}

// ============================================================================
// Scoped Logger
// ============================================================================

/**
 * Scoped logger with automatic prefix
 */
export class FloydScopedLogger {
  private logger: FloydLogger;
  private prefix: string;

  constructor(logger: FloydLogger, prefix: string) {
    this.logger = logger;
    this.prefix = prefix;
  }

  debug(message: string, ...args: unknown[]): void {
    this.logger.debug(`[${this.prefix}] ${message}`, ...args);
  }

  info(message: string, ...args: unknown[]): void {
    this.logger.info(`[${this.prefix}] ${message}`, ...args);
  }

  warn(message: string, ...args: unknown[]): void {
    this.logger.warn(`[${this.prefix}] ${message}`, ...args);
  }

  error(message: string, error?: Error | unknown): void {
    this.logger.error(`[${this.prefix}] ${message}`, error);
  }

  tool(toolName: string, input: unknown, output: unknown): void {
    this.logger.tool(toolName, input, output);
  }
}

// ============================================================================
// Global Logger Instance
// ============================================================================

/**
 * Global logger instance
 */
export const logger = new FloydLogger();

/**
 * Set global log level from environment variable
 */
export function initLogger(): void {
  const logLevel = process.env.FLOYD_LOG_LEVEL as LogLevel | undefined;

  if (logLevel && ['debug', 'info', 'warn', 'error'].includes(logLevel)) {
    logger.setLevel(logLevel);
  }
}
