/**
 * STT Service
 *
 * High-level service that combines AudioRecorder and WhisperTranscriber
 * to provide a simple API for speech-to-text functionality.
 */

import { EventEmitter } from 'events';
import { AudioRecorder, type AudioRecorderConfig } from './audio-recorder.js';
import { WhisperTranscriber, type TranscriptionOptions, type TranscriptionResult } from './whisper-transcriber.js';
import { STTError, STTErrorCode } from './errors.js';

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
export class STTService extends EventEmitter {
	private recorder: AudioRecorder;
	private transcriber: WhisperTranscriber;
	private state: RecordingState = 'idle';
	private currentAudioFile: string | null = null;
	
	constructor(private config: STTConfig = {}) {
		super();
		
		this.recorder = new AudioRecorder(config.recorder);
		this.transcriber = new WhisperTranscriber(config.transcriber);
	}
	
	/**
	 * Initialize the STT service
	 */
	async initialize(): Promise<void> {
		// Check microphone availability
		const hasMic = await this.recorder.checkMicrophone();
		if (!hasMic) {
			throw new STTError(
				STTErrorCode.MICROPHONE_NOT_FOUND,
				'No microphone available'
			);
		}
		
		// Preload model if requested
		if (this.config.preloadModel) {
			await this.transcriber.preloadModel();
		}
	}
	
	/**
	 * Start recording audio
	 */
	async startRecording(): Promise<void> {
		if (this.state === 'recording') {
			throw new STTError(
				STTErrorCode.MICROPHONE_IN_USE,
				'Already recording'
			);
		}
		
		try {
			this.setState('recording');
			const audioFile = await this.recorder.startRecording();
			this.currentAudioFile = audioFile;
			
			this.emit('recording-started');
		} catch (error) {
			this.setState('error');
			if (error instanceof STTError) {
				this.emit('transcription-error', error);
				throw error;
			}
			throw new STTError(
				STTErrorCode.RECORDING_FAILED,
				'Failed to start recording',
				error as Error
			);
		}
	}
	
	/**
	 * Stop recording and transcribe
	 */
	async stopRecording(): Promise<TranscriptionResult> {
		if (this.state !== 'recording') {
			throw new STTError(
				STTErrorCode.RECORDING_FAILED,
				'Not currently recording'
			);
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
		} catch (error) {
			this.setState('error');
			if (error instanceof STTError) {
				this.emit('transcription-error', error);
				throw error;
			}
			throw new STTError(
				STTErrorCode.TRANSCRIPTION_FAILED,
				'Failed to transcribe audio',
				error as Error
			);
		} finally {
			this.currentAudioFile = null;
		}
	}
	
	/**
	 * Cancel current recording
	 */
	cancelRecording(): void {
		if (this.state === 'recording') {
			this.recorder.cancelRecording();
			this.setState('idle');
			this.currentAudioFile = null;
		}
	}
	
	/**
	 * Get current state
	 */
	getState(): RecordingState {
		return this.state;
	}
	
	/**
	 * Check if currently recording
	 */
	isRecording(): boolean {
		return this.state === 'recording';
	}
	
	/**
	 * Check if currently processing
	 */
	isProcessing(): boolean {
		return this.state === 'processing';
	}
	
	/**
	 * Check if ready to record
	 */
	isReady(): boolean {
		return this.state === 'idle';
	}
	
	/**
	 * Preload the Whisper model
	 */
	async preloadModel(): Promise<void> {
		await this.transcriber.preloadModel();
	}
	
	/**
	 * Check if model is loaded
	 */
	isModelLoaded(): boolean {
		return this.transcriber.isModelLoaded();
	}
	
	/**
	 * Update state and emit event
	 */
	private setState(newState: RecordingState): void {
		if (this.state !== newState) {
			this.state = newState;
			this.emit('state-changed', newState);
		}
	}
	
	/**
	 * Clean up resources
	 */
	async dispose(): Promise<void> {
		this.cancelRecording();
		await this.recorder.dispose();
		await this.transcriber.dispose();
		this.removeAllListeners();
	}
	
	/**
	 * Event listener helper
	 */
	on<E extends STTEvent>(event: E, listener: (data: STTEventMap[E]) => void): this {
		return super.on(event, listener);
	}
	
	/**
	 * Event listener helper (once)
	 */
	once<E extends STTEvent>(event: E, listener: (data: STTEventMap[E]) => void): this {
		return super.once(event, listener);
	}
	
	/**
	 * Event listener helper (off)
	 */
	off<E extends STTEvent>(event: E, listener: (data: STTEventMap[E]) => void): this {
		return super.off(event, listener);
	}
}
