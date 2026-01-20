/**
 * Whisper Transcriber
 *
 * Wraps @napi-rs/whisper to provide speech-to-text transcription.
 * Uses OpenAI's Whisper model for highly accurate offline transcription.
 */
/**
 * Transcription options
 */
export interface TranscriptionOptions {
    /** Model size: tiny, base, small, medium, large (default: medium) */
    model?: 'tiny' | 'base' | 'small' | 'medium' | 'large';
    /** Language code (e.g., 'en', 'auto' for auto-detect) */
    language?: string;
    /** Task type: transcribe or translate (default: transcribe) */
    task?: 'transcribe' | 'translate';
    /** Enable timestamp generation (default: false) */
    timestamps?: boolean;
    /** Custom model path (optional) */
    modelPath?: string;
}
/**
 * Transcription result
 */
export interface TranscriptionResult {
    /** Transcribed text */
    text: string;
    /** Duration of audio in seconds */
    duration?: number;
    /** Detected language code */
    language?: string;
    /** Timestamps (if enabled) */
    timestamps?: Array<{
        offset: number;
        duration: number;
        text: string;
    }>;
}
/**
 * WhisperTranscriber class
 *
 * Transcribes audio files using OpenAI's Whisper model.
 */
export declare class WhisperTranscriber {
    private options;
    private modelLoaded;
    private currentModel;
    constructor(options?: TranscriptionOptions);
    /**
     * Preload the Whisper model (optional, speeds up first transcription)
     */
    preloadModel(): Promise<void>;
    /**
     * Transcribe an audio file
     */
    transcribe(audioFilePath: string): Promise<TranscriptionResult>;
    /**
     * Transcribe from audio buffer directly
     */
    transcribeBuffer(audioBuffer: Buffer): Promise<TranscriptionResult>;
    /**
     * Clean up resources
     */
    dispose(): Promise<void>;
    /**
     * Lazy load @napi-rs/whisper module
     */
    private loadWhisper;
    /**
     * Get model path for given model size
     */
    private getModelPath;
    /**
     * Check if model is loaded
     */
    isModelLoaded(): boolean;
}
//# sourceMappingURL=whisper-transcriber.d.ts.map