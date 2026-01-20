/**
 * Whisper Transcriber
 *
 * Wraps @napi-rs/whisper to provide speech-to-text transcription.
 * Uses OpenAI's Whisper model for highly accurate offline transcription.
 */
import { readFile } from 'fs/promises';
import { STTError, STTErrorCode } from './errors.js';
let whisperInstance = null;
/**
 * WhisperTranscriber class
 *
 * Transcribes audio files using OpenAI's Whisper model.
 */
export class WhisperTranscriber {
    options;
    modelLoaded = false;
    currentModel = 'medium';
    constructor(options = {}) {
        this.options = options;
        this.currentModel = options.model || 'medium';
    }
    /**
     * Preload the Whisper model (optional, speeds up first transcription)
     */
    async preloadModel() {
        if (this.modelLoaded) {
            return;
        }
        try {
            const whisper = await this.loadWhisper();
            // Preload model (will download on first run) - optional
            if (whisper.preload) {
                const modelPath = this.options.modelPath || this.getModelPath(this.currentModel);
                await whisper.preload(modelPath);
            }
            this.modelLoaded = true;
        }
        catch (error) {
            throw new STTError(STTErrorCode.MODEL_LOAD_FAILED, 'Failed to preload Whisper model', error);
        }
    }
    /**
     * Transcribe an audio file
     */
    async transcribe(audioFilePath) {
        try {
            // Load audio file
            const audioBuffer = await readFile(audioFilePath);
            // Load Whisper if not already loaded
            const whisper = await this.loadWhisper();
            // Ensure model is loaded
            if (!this.modelLoaded) {
                await this.preloadModel();
            }
            // Transcribe
            const startTime = Date.now();
            const text = (await whisper.transcribe?.(audioBuffer, {
                language: this.options.language === 'auto' ? undefined : this.options.language,
                task: this.options.task || 'transcribe',
                timestamps: this.options.timestamps || false,
            })) || '';
            const duration = (Date.now() - startTime) / 1000;
            return {
                text: text.trim(),
                duration,
            };
        }
        catch (error) {
            if (error instanceof STTError) {
                throw error;
            }
            throw new STTError(STTErrorCode.TRANSCRIPTION_FAILED, 'Transcription failed', error);
        }
    }
    /**
     * Transcribe from audio buffer directly
     */
    async transcribeBuffer(audioBuffer) {
        try {
            // Load Whisper if not already loaded
            const whisper = await this.loadWhisper();
            // Ensure model is loaded
            if (!this.modelLoaded) {
                await this.preloadModel();
            }
            // Transcribe
            const startTime = Date.now();
            const text = (await whisper.transcribe?.(audioBuffer, {
                language: this.options.language === 'auto' ? undefined : this.options.language,
                task: this.options.task || 'transcribe',
                timestamps: this.options.timestamps || false,
            })) || '';
            const duration = (Date.now() - startTime) / 1000;
            return {
                text: text.trim(),
                duration,
            };
        }
        catch (error) {
            if (error instanceof STTError) {
                throw error;
            }
            throw new STTError(STTErrorCode.TRANSCRIPTION_FAILED, 'Transcription failed', error);
        }
    }
    /**
     * Clean up resources
     */
    async dispose() {
        this.modelLoaded = false;
    }
    /**
     * Lazy load @napi-rs/whisper module
     */
    async loadWhisper() {
        if (whisperInstance) {
            return whisperInstance;
        }
        try {
            // Dynamic import to avoid startup delay
            const whisper = await import('@napi-rs/whisper');
            whisperInstance = whisper;
            return whisper;
        }
        catch (error) {
            throw new STTError(STTErrorCode.MODEL_LOAD_FAILED, 'Failed to load Whisper module. Make sure @napi-rs/whisper is installed.', error);
        }
    }
    /**
     * Get model path for given model size
     */
    getModelPath(model) {
        // @napi-rs/whisper will download models automatically if not specified
        // Return undefined to use default model location
        return undefined;
    }
    /**
     * Check if model is loaded
     */
    isModelLoaded() {
        return this.modelLoaded;
    }
}
//# sourceMappingURL=whisper-transcriber.js.map