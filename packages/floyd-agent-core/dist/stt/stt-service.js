/**
 * STT Service
 *
 * High-level service that combines AudioRecorder and WhisperTranscriber
 * to provide a simple API for speech-to-text functionality.
 */
import { EventEmitter } from 'events';
import { AudioRecorder } from './audio-recorder.js';
import { WhisperTranscriber } from './whisper-transcriber.js';
import { STTError, STTErrorCode } from './errors.js';
/**
 * STT Service class
 *
 * High-level API for recording and transcribing audio.
 * Emits events for state changes and transcription results.
 */
export class STTService extends EventEmitter {
    config;
    recorder;
    transcriber;
    state = 'idle';
    currentAudioFile = null;
    constructor(config = {}) {
        super();
        this.config = config;
        this.recorder = new AudioRecorder(config.recorder);
        this.transcriber = new WhisperTranscriber(config.transcriber);
    }
    /**
     * Initialize the STT service
     */
    async initialize() {
        // Check microphone availability
        const hasMic = await this.recorder.checkMicrophone();
        if (!hasMic) {
            throw new STTError(STTErrorCode.MICROPHONE_NOT_FOUND, 'No microphone available');
        }
        // Preload model if requested
        if (this.config.preloadModel) {
            await this.transcriber.preloadModel();
        }
    }
    /**
     * Start recording audio
     */
    async startRecording() {
        if (this.state === 'recording') {
            throw new STTError(STTErrorCode.MICROPHONE_IN_USE, 'Already recording');
        }
        try {
            this.setState('recording');
            const audioFile = await this.recorder.startRecording();
            this.currentAudioFile = audioFile;
            this.emit('recording-started');
        }
        catch (error) {
            this.setState('error');
            if (error instanceof STTError) {
                this.emit('transcription-error', error);
                throw error;
            }
            throw new STTError(STTErrorCode.RECORDING_FAILED, 'Failed to start recording', error);
        }
    }
    /**
     * Stop recording and transcribe
     */
    async stopRecording() {
        if (this.state !== 'recording') {
            throw new STTError(STTErrorCode.RECORDING_FAILED, 'Not currently recording');
        }
        try {
            this.emit('recording-stopped');
            this.setState('processing');
            // Stop recording and get audio file
            const audioFile = await this.recorder.stopRecording();
            this.emit('transcription-started');
            // Transcribe audio
            const result = await this.transcriber.transcribe(audioFile);
            this.setState('idle');
            this.emit('transcription-complete', result);
            return result;
        }
        catch (error) {
            this.setState('error');
            if (error instanceof STTError) {
                this.emit('transcription-error', error);
                throw error;
            }
            throw new STTError(STTErrorCode.TRANSCRIPTION_FAILED, 'Failed to transcribe audio', error);
        }
        finally {
            this.currentAudioFile = null;
        }
    }
    /**
     * Cancel current recording
     */
    cancelRecording() {
        if (this.state === 'recording') {
            this.recorder.cancelRecording();
            this.setState('idle');
            this.currentAudioFile = null;
        }
    }
    /**
     * Get current state
     */
    getState() {
        return this.state;
    }
    /**
     * Check if currently recording
     */
    isRecording() {
        return this.state === 'recording';
    }
    /**
     * Check if currently processing
     */
    isProcessing() {
        return this.state === 'processing';
    }
    /**
     * Check if ready to record
     */
    isReady() {
        return this.state === 'idle';
    }
    /**
     * Preload the Whisper model
     */
    async preloadModel() {
        await this.transcriber.preloadModel();
    }
    /**
     * Check if model is loaded
     */
    isModelLoaded() {
        return this.transcriber.isModelLoaded();
    }
    /**
     * Update state and emit event
     */
    setState(newState) {
        if (this.state !== newState) {
            this.state = newState;
            this.emit('state-changed', newState);
        }
    }
    /**
     * Clean up resources
     */
    async dispose() {
        this.cancelRecording();
        await this.recorder.dispose();
        await this.transcriber.dispose();
        this.removeAllListeners();
    }
    /**
     * Event listener helper
     */
    on(event, listener) {
        return super.on(event, listener);
    }
    /**
     * Event listener helper (once)
     */
    once(event, listener) {
        return super.once(event, listener);
    }
    /**
     * Event listener helper (off)
     */
    off(event, listener) {
        return super.off(event, listener);
    }
}
//# sourceMappingURL=stt-service.js.map