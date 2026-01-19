// Main export for floyd-agent-core
export { AgentEngine } from './agent/AgentEngine.js';
export { MCPClientManager } from './mcp/client-manager.js';
export { SessionManager } from './store/conversation-store.js';
export { PermissionManager } from './permissions/permission-manager.js';
export { Config } from './utils/config.js';

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
