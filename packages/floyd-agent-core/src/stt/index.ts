/**
 * Speech-to-Text (STT) Module
 *
 * Provides voice recording and transcription using OpenAI's Whisper model.
 * Supports offline transcription with the @napi-rs/whisper bindings.
 *
 * @module stt
 */

export { AudioRecorder } from './audio-recorder.js';
export { WhisperTranscriber, type TranscriptionOptions, type TranscriptionResult } from './whisper-transcriber.js';
export { STTService, type STTConfig, type RecordingState, type STTEvent } from './stt-service.js';
export { STTError, STTErrorCode } from './errors.js';
