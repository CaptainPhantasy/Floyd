/**
 * Whisper Transcriber
 *
 * Wraps @napi-rs/whisper to provide speech-to-text transcription.
 * Uses OpenAI's Whisper model for highly accurate offline transcription.
 */

import { readFile, unlink } from 'fs/promises';
import { STTError, STTErrorCode } from './errors.js';

// Lazy load whisper to avoid startup delays
type WhisperModule = {
	preload?: (modelPath?: string) => Promise<void>;
	transcribe?: (audioBuffer: Buffer, options?: any) => Promise<string>;
	[key: string]: any; // Allow any other properties
};

let whisperInstance: any = null;

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
	timestamps?: Array<{ offset: number; duration: number; text: string }>;
}

/**
 * WhisperTranscriber class
 *
 * Transcribes audio files using OpenAI's Whisper model.
 */
export class WhisperTranscriber {
	private modelLoaded = false;
	private currentModel: string = 'medium';
	
	constructor(private options: TranscriptionOptions = {}) {
		this.currentModel = options.model || 'medium';
	}
	
	/**
	 * Preload the Whisper model (optional, speeds up first transcription)
	 */
	async preloadModel(): Promise<void> {
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
		} catch (error: any) {
			throw new STTError(
				STTErrorCode.MODEL_LOAD_FAILED,
				'Failed to preload Whisper model',
				error
			);
		}
	}
	
	/**
	 * Transcribe an audio file
	 */
	async transcribe(audioFilePath: string): Promise<TranscriptionResult> {
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
		} catch (error: any) {
			if (error instanceof STTError) {
				throw error;
			}
			
			throw new STTError(
				STTErrorCode.TRANSCRIPTION_FAILED,
				'Transcription failed',
				error
			);
		}
	}
	
	/**
	 * Transcribe from audio buffer directly
	 */
	async transcribeBuffer(audioBuffer: Buffer): Promise<TranscriptionResult> {
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
		} catch (error: any) {
			if (error instanceof STTError) {
				throw error;
			}
			
			throw new STTError(
				STTErrorCode.TRANSCRIPTION_FAILED,
				'Transcription failed',
				error
			);
		}
	}
	
	/**
	 * Clean up resources
	 */
	async dispose(): Promise<void> {
		this.modelLoaded = false;
	}
	
	/**
	 * Lazy load @napi-rs/whisper module
	 */
	private async loadWhisper(): Promise<WhisperModule> {
		if (whisperInstance) {
			return whisperInstance;
		}
		
		try {
			// Dynamic import to avoid startup delay
			const whisper = await import('@napi-rs/whisper');
			whisperInstance = whisper;
			return whisper;
		} catch (error: any) {
			throw new STTError(
				STTErrorCode.MODEL_LOAD_FAILED,
				'Failed to load Whisper module. Make sure @napi-rs/whisper is installed.',
				error
			);
		}
	}
	
	/**
	 * Get model path for given model size
	 */
	private getModelPath(model: string): string {
		// @napi-rs/whisper will download models automatically if not specified
		// Return undefined to use default model location
		return undefined as any;
	}
	
	/**
	 * Check if model is loaded
	 */
	isModelLoaded(): boolean {
		return this.modelLoaded;
	}
}
