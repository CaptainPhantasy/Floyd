// Main export for floyd-agent-core
export { AgentEngine } from './agent/AgentEngine.js';
export { MCPClientManager } from './mcp/client-manager.js';
export { SessionManager } from './store/conversation-store.js';

// GAP #2 FIX: Export SimplePermissionManager as the preferred name
// Both SimplePermissionManager and PermissionManager (alias) are exported
// PermissionManager is deprecated but kept for backward compatibility
export { SimplePermissionManager, PermissionManager } from './permissions/permission-manager.js';

// Type alias for backward compatibility
export type { PermissionRule } from './permissions/permission-manager.js';

export { Config } from './utils/config.js';

// Error handling utilities
export { humanizeError, formatHumanizedError, getSeverityEmoji, type HumanizedError } from './utils/error-humanizer.js';

// LLM Client exports
export { createLLMClient, OpenAICompatibleClient, AnthropicClient } from './llm/index.js';
export type { LLMClient, LLMClientOptions, LLMMessage, LLMTool, StreamChunk, LLMChatCallbacks } from './llm/index.js';

// Constants exports
export { 
  PROVIDER_DEFAULTS, 
  DEFAULT_GLM_CONFIG, 
  DEFAULT_ANTHROPIC_CONFIG, 
  DEFAULT_OPENAI_CONFIG, 
  DEFAULT_DEEPSEEK_CONFIG,
  inferProviderFromEndpoint,
  isOpenAICompatible,
  type Provider 
} from './constants.js';

// Re-export types
export type { Message, ToolCall } from './agent/types.js';
export type { MCPTool, MCPResource } from './mcp/types.js';

// Re-export interfaces for Dependency Inversion (consumers implement these)
export type { 
  ISessionManager, 
  IPermissionManager, 
  IConfig, 
  SessionData,
  PermissionLevel 
} from './agent/interfaces.js';

// Re-export permission system
export { RiskLevel, classifyRisk, getRiskDescription, getRecommendedAction } from './permissions/risk-classifier.js';
export type { RiskAssessment } from './permissions/risk-classifier.js';
export * from './permissions/policies.js';
export { PermissionStore } from './permissions/store.js';

// STT (Speech-to-Text) module
export {
	STTService,
	AudioRecorder,
	WhisperTranscriber,
	STTError,
	STTErrorCode,
} from './stt/index.js';
export type {
	STTConfig,
	STTEvent,
	RecordingState,
	TranscriptionOptions,
	TranscriptionResult,
} from './stt/index.js';
export type { AudioRecorderConfig } from './stt/audio-recorder.js';
