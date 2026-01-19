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
 * Humanize an error message
 *
 * @param error - Error string or Error object
 * @returns Humanized error information
 */
export declare function humanizeError(error: string | Error): HumanizedError;
/**
 * Format a humanized error for display
 *
 * @param error - Humanized error object
 * @param verbose - Include technical details
 * @returns Formatted error string
 */
export declare function formatHumanizedError(error: HumanizedError, verbose?: boolean): string;
/**
 * Get severity emoji for UI display
 */
export declare function getSeverityEmoji(severity: HumanizedError['severity']): string;
//# sourceMappingURL=error-humanizer.d.ts.map