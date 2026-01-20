/**
 * Audio Recorder
 *
 * Wraps node-record-lpcm16 to provide audio recording functionality.
 * Records from the default microphone and outputs audio in a format
 * compatible with Whisper (16-bit PCM, 16kHz sample rate).
 */

import record from 'node-record-lpcm16';
import { writeFile, unlink } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';
import { STTError, STTErrorCode } from './errors.js';

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
export class AudioRecorder {
	private recording: any = null;
	private state: RecordingState = 'idle';
	private audioChunks: Buffer[] = [];
	private tempFilePath: string | null = null;
	private silenceTimeout: NodeJS.Timeout | null = null;
	
	constructor(private config: AudioRecorderConfig = {}) {}
	
	/**
	 * Check if microphone is available
	 */
	async checkMicrophone(): Promise<boolean> {
		try {
			// Try to start and immediately stop a recording to check mic availability
			const testRecording = record({
				sampleRate: this.config.sampleRate || 16000,
				channels: 1,
				threshold: 0,
				silence: '1.0',
			});
			
			testRecording.stop();
			return true;
		} catch (error) {
			return false;
		}
	}
	
	/**
	 * Start recording audio
	 */
	async startRecording(): Promise<string> {
		if (this.state === 'recording') {
			throw new STTError(
				STTErrorCode.MICROPHONE_IN_USE,
				'Already recording'
			);
		}
		
		// Create temp file for recording
		const tempFile = join(
			tmpdir(),
			`floyd-stt-${Date.now()}.wav`
		);
		this.tempFilePath = tempFile;
		
		this.audioChunks = [];
		this.state = 'recording';
		
		try {
			// Start recording
			this.recording = record({
				sampleRate: this.config.sampleRate || 16000,
				channels: this.config.channels || 1,
				threshold: this.config.silenceThreshold || 0,
				silence: this.config.silenceThreshold ? '1.0' : '0',
				recorder: 'sox', // Will use arecord on Linux automatically
			});
			
			// Collect audio data
			const stream = this.recording.stream();
			
			stream.on('data', (chunk: Buffer) => {
				this.audioChunks.push(chunk);
			});
			
			stream.on('error', (error: Error) => {
				this.state = 'error';
				this.cleanup();
				throw new STTError(
					STTErrorCode.RECORDING_FAILED,
					'Recording stream error',
					error
				);
			});
			
			// Auto-stop after max duration
			const maxDuration = this.config.maxDuration || 60;
			setTimeout(() => {
				if (this.state === 'recording') {
					this.stopRecording();
				}
			}, maxDuration * 1000);
			
			return tempFile;
		} catch (error: any) {
			this.state = 'error';
			this.cleanup();
			
			if (error.message?.includes('not found')) {
				throw new STTError(
					STTErrorCode.MICROPHONE_NOT_FOUND,
					'Microphone not found',
					error
				);
			}
			
			if (error.message?.includes('permission')) {
				throw new STTError(
					STTErrorCode.MICROPHONE_PERMISSION_DENIED,
					'Microphone permission denied',
					error
				);
			}
			
			if (error.message?.includes('sox') || error.message?.includes('arecord')) {
				throw new STTError(
					STTErrorCode.DEPENDENCY_MISSING,
					'Recording dependency missing',
					error
				);
			}
			
			throw new STTError(
				STTErrorCode.RECORDING_FAILED,
				error.message || 'Failed to start recording',
				error
			);
		}
	}
	
	/**
	 * Stop recording and save to file
	 */
	async stopRecording(): Promise<string> {
		if (this.state !== 'recording' || !this.recording) {
			throw new STTError(
				STTErrorCode.RECORDING_FAILED,
				'Not currently recording'
			);
		}
		
		return new Promise((resolve, reject) => {
			this.recording.stream().on('close', async () => {
				try {
					// Write audio data to temp file
					const audioBuffer = Buffer.concat(this.audioChunks);
					await writeFile(this.tempFilePath!, audioBuffer);
					
					this.state = 'stopped';
					resolve(this.tempFilePath!);
				} catch (error: any) {
					this.state = 'error';
					reject(new STTError(
						STTErrorCode.RECORDING_FAILED,
						'Failed to save recording',
						error
					));
				}
			});
			
			this.recording.stream().on('error', (error: Error) => {
				this.state = 'error';
				reject(new STTError(
					STTErrorCode.RECORDING_FAILED,
					'Recording error',
					error
				));
			});
			
			this.recording.stop();
		});
	}
	
	/**
	 * Cancel recording and cleanup
	 */
	cancelRecording(): void {
		if (this.recording) {
			this.recording.stop();
			this.recording = null;
		}
		this.state = 'idle';
		this.audioChunks = [];
		this.cleanup();
	}
	
	/**
	 * Get current recording state
	 */
	getState(): RecordingState {
		return this.state;
	}
	
	/**
	 * Get temp file path
	 */
	getTempFilePath(): string | null {
		return this.tempFilePath;
	}
	
	/**
	 * Cleanup temp file
	 */
	private async cleanup(): Promise<void> {
		if (this.tempFilePath) {
			try {
				await unlink(this.tempFilePath);
			} catch {
				// Ignore cleanup errors
			}
			this.tempFilePath = null;
		}
		
		if (this.silenceTimeout) {
			clearTimeout(this.silenceTimeout);
			this.silenceTimeout = null;
		}
	}
	
	/**
	 * Cleanup when done
	 */
	async dispose(): Promise<void> {
		this.cancelRecording();
		await this.cleanup();
	}
}
