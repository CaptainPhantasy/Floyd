/**
 * STT Service
 *
 * High-level service that combines AudioRecorder and WhisperTranscriber
 * to provide a simple API for speech-to-text functionality.
 */
import { EventEmitter } from 'events';
import { type AudioRecorderConfig } from './audio-recorder.js';
import { type TranscriptionOptions, type TranscriptionResult } from './whisper-transcriber.js';
import { STTError } from './errors.js';
/**
 * STT configuration
 */
export interface STTConfig {
    /** Audio recorder configuration */
    recorder?: AudioRecorderConfig;
    /** Transcription options */
    transcriber?: TranscriptionOptions;
    /** Preload model on initialization (default: false) */
    preloadModel?: boolean;
}
/**
 * Recording state
 */
export type RecordingState = 'idle' | 'recording' | 'processing' | 'error';
/**
 * STT event types
 */
export interface STTEventMap {
    'recording-started': void;
    'recording-stopped': void;
    'transcription-started': void;
    'transcription-complete': TranscriptionResult;
    'transcription-error': STTError;
    'state-changed': RecordingState;
}
export type STTEvent = keyof STTEventMap;
/**
 * STT Service class
 *
 * High-level API for recording and transcribing audio.
 * Emits events for state changes and transcription results.
 */
export declare class STTService extends EventEmitter {
    private config;
    private recorder;
    private transcriber;
    private state;
    private currentAudioFile;
    constructor(config?: STTConfig);
    /**
     * Initialize the STT service
     */
    initialize(): Promise<void>;
    /**
     * Start recording audio
     */
    startRecording(): Promise<void>;
    /**
     * Stop recording and transcribe
     */
    stopRecording(): Promise<TranscriptionResult>;
    /**
     * Cancel current recording
     */
    cancelRecording(): void;
    /**
     * Get current state
     */
    getState(): RecordingState;
    /**
     * Check if currently recording
     */
    isRecording(): boolean;
    /**
     * Check if currently processing
     */
    isProcessing(): boolean;
    /**
     * Check if ready to record
     */
    isReady(): boolean;
    /**
     * Preload the Whisper model
     */
    preloadModel(): Promise<void>;
    /**
     * Check if model is loaded
     */
    isModelLoaded(): boolean;
    /**
     * Update state and emit event
     */
    private setState;
    /**
     * Clean up resources
     */
    dispose(): Promise<void>;
    /**
     * Event listener helper
     */
    on<E extends STTEvent>(event: E, listener: (data: STTEventMap[E]) => void): this;
    /**
     * Event listener helper (once)
     */
    once<E extends STTEvent>(event: E, listener: (data: STTEventMap[E]) => void): this;
    /**
     * Event listener helper (off)
     */
    off<E extends STTEvent>(event: E, listener: (data: STTEventMap[E]) => void): this;
}
//# sourceMappingURL=stt-service.d.ts.map