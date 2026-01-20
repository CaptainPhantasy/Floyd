/**
 * Audio Recorder
 *
 * Wraps node-record-lpcm16 to provide audio recording functionality.
 * Records from the default microphone and outputs audio in a format
 * compatible with Whisper (16-bit PCM, 16kHz sample rate).
 */
/**
 * Audio recording configuration
 */
export interface AudioRecorderConfig {
    /** Sample rate in Hz (default: 16000 for Whisper) */
    sampleRate?: number;
    /** Number of audio channels (default: 1 for mono) */
    channels?: number;
    /** Bit depth (default: 16) */
    bitDepth?: number;
    /** Encoding (default: 'linear16' for WAV) */
    encoding?: string;
    /** Silence detection threshold in dB (optional, for auto-stop) */
    silenceThreshold?: number;
    /** Minimum recording duration in seconds (optional) */
    minDuration?: number;
    /** Maximum recording duration in seconds (default: 60) */
    maxDuration?: number;
}
/**
 * Recording state
 */
export type RecordingState = 'idle' | 'recording' | 'stopped' | 'error';
/**
 * AudioRecorder class
 *
 * Records audio from the microphone to a temporary WAV file.
 */
export declare class AudioRecorder {
    private config;
    private recording;
    private state;
    private audioChunks;
    private tempFilePath;
    private silenceTimeout;
    constructor(config?: AudioRecorderConfig);
    /**
     * Check if microphone is available
     */
    checkMicrophone(): Promise<boolean>;
    /**
     * Start recording audio
     */
    startRecording(): Promise<string>;
    /**
     * Stop recording and save to file
     */
    stopRecording(): Promise<string>;
    /**
     * Cancel recording and cleanup
     */
    cancelRecording(): void;
    /**
     * Get current recording state
     */
    getState(): RecordingState;
    /**
     * Get temp file path
     */
    getTempFilePath(): string | null;
    /**
     * Cleanup temp file
     */
    private cleanup;
    /**
     * Cleanup when done
     */
    dispose(): Promise<void>;
}
//# sourceMappingURL=audio-recorder.d.ts.map