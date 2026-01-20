/**
 * STT Error Classes
 *
 * Custom error types for Speech-to-Text operations.
 */
/**
 * STT error codes
 */
export var STTErrorCode;
(function (STTErrorCode) {
    // Recording errors
    STTErrorCode["MICROPHONE_NOT_FOUND"] = "MICROPHONE_NOT_FOUND";
    STTErrorCode["MICROPHONE_PERMISSION_DENIED"] = "MICROPHONE_PERMISSION_DENIED";
    STTErrorCode["MICROPHONE_IN_USE"] = "MICROPHONE_IN_USE";
    STTErrorCode["RECORDING_FAILED"] = "RECORDING_FAILED";
    // Transcription errors
    STTErrorCode["MODEL_NOT_FOUND"] = "MODEL_NOT_FOUND";
    STTErrorCode["MODEL_LOAD_FAILED"] = "MODEL_LOAD_FAILED";
    STTErrorCode["TRANSCRIPTION_FAILED"] = "TRANSCRIPTION_FAILED";
    STTErrorCode["INVALID_AUDIO_FORMAT"] = "INVALID_AUDIO_FORMAT";
    // General errors
    STTErrorCode["DEPENDENCY_MISSING"] = "DEPENDENCY_MISSING";
    STTErrorCode["UNKNOWN_ERROR"] = "UNKNOWN_ERROR";
})(STTErrorCode || (STTErrorCode = {}));
/**
 * Custom error class for STT operations
 */
export class STTError extends Error {
    code;
    originalError;
    constructor(code, message, originalError) {
        super(message);
        this.code = code;
        this.originalError = originalError;
        this.name = 'STTError';
    }
    /**
     * Check if error is recoverable (can retry)
     */
    isRecoverable() {
        return [
            STTErrorCode.MICROPHONE_IN_USE,
            STTErrorCode.TRANSCRIPTION_FAILED,
            STTErrorCode.UNKNOWN_ERROR,
        ].includes(this.code);
    }
    /**
     * Get user-friendly error message
     */
    getUserMessage() {
        switch (this.code) {
            case STTErrorCode.MICROPHONE_NOT_FOUND:
                return 'No microphone found. Please connect a microphone and try again.';
            case STTErrorCode.MICROPHONE_PERMISSION_DENIED:
                return 'Microphone access denied. Please grant microphone permissions in your system settings.';
            case STTErrorCode.MICROPHONE_IN_USE:
                return 'Microphone is already in use by another application. Please close it and try again.';
            case STTErrorCode.RECORDING_FAILED:
                return 'Failed to record audio. Please check your microphone and try again.';
            case STTErrorCode.MODEL_NOT_FOUND:
                return 'Whisper model not found. It will be downloaded on first use.';
            case STTErrorCode.MODEL_LOAD_FAILED:
                return 'Failed to load Whisper model. Please try again.';
            case STTErrorCode.TRANSCRIPTION_FAILED:
                return 'Failed to transcribe audio. Please try again.';
            case STTErrorCode.INVALID_AUDIO_FORMAT:
                return 'Invalid audio format. Please try recording again.';
            case STTErrorCode.DEPENDENCY_MISSING:
                return 'Required dependency missing. Please install: sox (Mac/Windows) or arecord (Linux)';
            default:
                return this.message;
        }
    }
}
//# sourceMappingURL=errors.js.map