/**
 * IPC Message Types (Simplified Format)
 *
 * Shared type definitions for IPC communication between
 * Main process, Monitor dashboard, and other IPC clients.
 *
 * Message Format: { id, method, params } - Simple, flat structure
 *
 * @module ipc/message-types
 */

// ============================================================================
// BASE MESSAGE TYPE (SIMPLIFIED)
// ============================================================================

/**
 * Base IPC message type - Simplified flat format
 * Format: { id, method, params }
 */
export interface IPCMessage {
	/** Unique message ID for request/response correlation */
	id: string;

	/** Message method (what to do) */
	method: IPCMessageMethod;

	/** Method parameters */
	params?: unknown;

	/** Timestamp when message was created (optional) */
	timestamp?: number;
}

/**
 * All possible IPC message methods
 */
export type IPCMessageMethod =
	| 'config' // Configuration handshake (client info, server info)
	| 'events' // Event stream updates
	| 'metrics' // System metrics updates
	| 'tools' // Tool execution updates
	| 'git' // Git status updates
	| 'browser' // Browser state updates
	| 'workers' // Worker state updates
	| 'alerts' // Alert notifications
	| 'error' // Error notifications
	| 'heartbeat'; // Connection heartbeat

// ============================================================================
// CONFIG MESSAGES
// ============================================================================

/**
 * Config message - sent during connection handshake
 */
export interface ConfigMessage extends Omit<IPCMessage, 'params'> {
	method: 'config';
	params: ConfigData;
}

export interface ConfigData {
	/** Client type (monitor, main, etc.) */
	clientType?: string;

	/** Client ID */
	clientId?: string;

	/** Server ID */
	serverId?: string;

	/** Timestamp */
	timestamp: number;

	/** Additional config options */
	options?: Record<string, unknown>;
}

// ============================================================================
// EVENT MESSAGES
// ============================================================================

/**
 * Events message - stream event updates
 */
export interface EventsMessage extends Omit<IPCMessage, 'params'> {
	method: 'events';
	params: StreamEvent[];
}

export interface StreamEvent {
	/** Unique event ID */
	id: string;

	/** Event type */
	type: 'tool_call' | 'tool_response' | 'agent_message' | 'system' | 'error';

	/** Event severity */
	severity: 'info' | 'success' | 'warning' | 'error';

	/** Timestamp */
	timestamp: Date | string;

	/** Event message */
	message: string;

	/** Tool name (if applicable) */
	toolName?: string;

	/** Duration in ms (if applicable) */
	duration?: number;

	/** Additional metadata */
	metadata?: Record<string, unknown>;
}

// ============================================================================
// METRICS MESSAGES
// ============================================================================

/**
 * Metrics message - system metrics updates
 */
export interface MetricsMessage extends Omit<IPCMessage, 'params'> {
	method: 'metrics';
	params: SystemMetricsData;
}

export interface SystemMetricsData {
	/** CPU usage percentage (0-100) */
	cpu: number;

	/** Memory usage in MB */
	memory: {
		used: number;
		total: number;
		percentage: number;
	};

	/** Event loop lag in ms */
	eventLoopLag?: number;

	/** Active workers count */
	activeWorkers?: number;

	/** Timestamp */
	timestamp: Date;
}

// ============================================================================
// TOOL MESSAGES
// ============================================================================

/**
 * Tools message - tool execution updates
 */
export interface ToolsMessage extends Omit<IPCMessage, 'params'> {
	method: 'tools';
	params: ToolExecution[];
}

export interface ToolExecution {
	/** Unique execution ID */
	id: string;

	/** Tool name */
	toolName: string;

	/** Execution status */
	status: 'pending' | 'running' | 'completed' | 'failed';

	/** Start time */
	startTime: Date;

	/** End time (if completed) */
	endTime?: Date;

	/** Duration in ms */
	duration?: number;

	/** Tool arguments */
	args?: Record<string, unknown>;

	/** Result (if completed) */
	result?: unknown;

	/** Error (if failed) */
	error?: string;
}

// ============================================================================
// GIT MESSAGES
// ============================================================================

/**
 * Git message - git status updates
 */
export interface GitMessage extends Omit<IPCMessage, 'params'> {
	method: 'git';
	params: GitStatus;
}

export interface GitStatus {
	/** Current branch */
	branch: string;

	/** Current commit SHA */
	commit?: string;

	/** Modified files */
	modified: string[];

	/** Staged files */
	staged: string[];

	/** Untracked files */
	untracked: string[];

	/** Number of commits ahead/behind */
	ahead?: number;
	behind?: number;

	/** Timestamp */
	timestamp: Date;
}

// ============================================================================
// BROWSER MESSAGES
// ============================================================================

/**
 * Browser message - browser state updates
 */
export interface BrowserMessage extends Omit<IPCMessage, 'params'> {
	method: 'browser';
	params: BrowserState;
}

export interface BrowserState {
	/** Number of owned tabs */
	ownedTabs: number;

	/** Number of active safety rules */
	rules: number;

	/** Current browser status */
	status: 'idle' | 'active' | 'blocked' | 'error';

	/** Last action performed */
	lastAction?: string;

	/** Timestamp */
	timestamp: Date;
}

// ============================================================================
// WORKER MESSAGES
// ============================================================================

/**
 * Workers message - worker state updates
 */
export interface WorkersMessage extends Omit<IPCMessage, 'params'> {
	method: 'workers';
	params: WorkerState[];
}

export interface WorkerState {
	/** Worker ID */
	id: string;

	/** Worker name */
	name: string;

	/** Worker type */
	type: 'agent' | 'tool' | 'system';

	/** Worker status */
	status: 'idle' | 'working' | 'waiting' | 'blocked' | 'offline';

	/** Current task description */
	currentTask?: string;

	/** Progress percentage (0-100) */
	progress?: number;

	/** Last update timestamp */
	lastUpdate: Date;

	/** Completed tasks count */
	completedTasks: number;

	/** Failed tasks count */
	failedTasks: number;
}

// ============================================================================
// ALERT MESSAGES
// ============================================================================

/**
 * Alerts message - alert notifications
 */
export interface AlertsMessage extends Omit<IPCMessage, 'params'> {
	method: 'alerts';
	params: Alert[];
}

export interface Alert {
	/** Unique alert ID */
	id: string;

	/** Alert severity */
	severity: 'info' | 'warning' | 'error' | 'success';

	/** Alert type */
	type: 'system' | 'network' | 'performance' | 'security';

	/** Alert message */
	message: string;

	/** Timestamp */
	timestamp: Date;

	/** Whether alert is still active */
	active?: boolean;
}

// ============================================================================
// ERROR MESSAGES
// ============================================================================

/**
 * Error message - error notification
 */
export interface ErrorMessage extends Omit<IPCMessage, 'params'> {
	method: 'error';
	params: ErrorData;
}

export interface ErrorData {
	/** Error type */
	errorType: string;

	/** Error message */
	message: string;

	/** Stack trace (optional) */
	stack?: string;

	/** Source of error */
	source?: string;

	/** Timestamp */
	timestamp: Date;
}

// ============================================================================
// HEARTBEAT MESSAGES
// ============================================================================

/**
 * Heartbeat message - connection heartbeat
 */
export interface HeartbeatMessage extends IPCMessage {
	method: 'heartbeat';
	params?: {
		/** Timestamp */
		timestamp: number;

		/** Client ID */
		clientId?: string;
	};
}

// ============================================================================
// MESSAGE GUARDS
// ============================================================================

/**
 * Type guard for config messages
 */
export function isConfigMessage(message: IPCMessage): message is ConfigMessage {
	return message.method === 'config';
}

/**
 * Type guard for events messages
 */
export function isEventsMessage(message: IPCMessage): message is EventsMessage {
	return message.method === 'events';
}

/**
 * Type guard for metrics messages
 */
export function isMetricsMessage(
	message: IPCMessage,
): message is MetricsMessage {
	return message.method === 'metrics';
}

/**
 * Type guard for tools messages
 */
export function isToolsMessage(message: IPCMessage): message is ToolsMessage {
	return message.method === 'tools';
}

/**
 * Type guard for git messages
 */
export function isGitMessage(message: IPCMessage): message is GitMessage {
	return message.method === 'git';
}

/**
 * Type guard for browser messages
 */
export function isBrowserMessage(
	message: IPCMessage,
): message is BrowserMessage {
	return message.method === 'browser';
}

/**
 * Type guard for workers messages
 */
export function isWorkersMessage(
	message: IPCMessage,
): message is WorkersMessage {
	return message.method === 'workers';
}

/**
 * Type guard for alerts messages
 */
export function isAlertsMessage(message: IPCMessage): message is AlertsMessage {
	return message.method === 'alerts';
}

/**
 * Type guard for error messages
 */
export function isErrorMessage(message: IPCMessage): message is ErrorMessage {
	return message.method === 'error';
}

/**
 * Type guard for heartbeat messages
 */
export function isHeartbeatMessage(
	message: IPCMessage,
): message is HeartbeatMessage {
	return message.method === 'heartbeat';
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Create a new IPC message (simplified format)
 */
export function createMessage<T extends IPCMessage>(
	method: T['method'],
	params?: T['params'],
	id: string = generateMessageId(),
	timestamp: number = Date.now(),
): T {
	const message: IPCMessage = {
		id,
		method,
		timestamp,
	};

	if (params !== undefined) {
		message.params = params;
	}

	return message as T;
}

/**
 * Generate a unique message ID
 */
export function generateMessageId(): string {
	return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Create a config message
 */
export function createConfigMessage(
	params: ConfigData,
	id?: string,
): ConfigMessage {
	return createMessage('config', params, id);
}

/**
 * Create an events message
 */
export function createEventsMessage(
	events: StreamEvent[],
	id?: string,
): EventsMessage {
	return createMessage('events', events, id);
}

/**
 * Create a metrics message
 */
export function createMetricsMessage(
	metrics: SystemMetricsData,
	id?: string,
): MetricsMessage {
	return createMessage('metrics', metrics, id);
}

/**
 * Create an error message
 */
export function createErrorMessage(
	error: ErrorData,
	id?: string,
): ErrorMessage {
	return createMessage('error', error, id);
}

/**
 * Create a heartbeat message
 */
export function createHeartbeatMessage(
	params?: { timestamp: number; clientId?: string },
	id?: string,
): HeartbeatMessage {
	return createMessage('heartbeat', params, id);
}

// Re-export the base IPCMessage type for backward compatibility
export type { IPCMessage as default };
