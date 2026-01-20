/**
 * STT Error Classes
 *
 * Custom error types for Speech-to-Text operations.
 */
/**
 * STT error codes
 */
export declare enum STTErrorCode {
    MICROPHONE_NOT_FOUND = "MICROPHONE_NOT_FOUND",
    MICROPHONE_PERMISSION_DENIED = "MICROPHONE_PERMISSION_DENIED",
    MICROPHONE_IN_USE = "MICROPHONE_IN_USE",
    RECORDING_FAILED = "RECORDING_FAILED",
    MODEL_NOT_FOUND = "MODEL_NOT_FOUND",
    MODEL_LOAD_FAILED = "MODEL_LOAD_FAILED",
    TRANSCRIPTION_FAILED = "TRANSCRIPTION_FAILED",
    INVALID_AUDIO_FORMAT = "INVALID_AUDIO_FORMAT",
    DEPENDENCY_MISSING = "DEPENDENCY_MISSING",
    UNKNOWN_ERROR = "UNKNOWN_ERROR"
}
/**
 * Custom error class for STT operations
 */
export declare class STTError extends Error {
    code: STTErrorCode;
    originalError?: Error | undefined;
    constructor(code: STTErrorCode, message: string, originalError?: Error | undefined);
    /**
     * Check if error is recoverable (can retry)
     */
    isRecoverable(): boolean;
    /**
     * Get user-friendly error message
     */
    getUserMessage(): string;
}
//# sourceMappingURL=errors.d.ts.map