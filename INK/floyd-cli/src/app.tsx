/*
 * 🔒 LOCKED FILE - CORE STABILITY
 * This file has been audited and stabilized by Gemini 4.
 * Please do not modify without explicit instruction and regression testing.
 * Ref: geminireport.md
 */
import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Box, Text, useInput, useApp } from 'ink';
import { AgentEngine, MCPClientManager, PermissionManager } from 'floyd-agent-core';
import { SessionManager } from './store/session-store.js';
import { ConfigLoader } from './utils/config.js';
import { BUILTIN_SERVERS } from './config/builtin-servers.js';
import { StreamProcessor } from './streaming/stream-engine.js';
import { StreamTagParser } from './streaming/tag-parser.js';
import { getRandomWhimsicalPhrase } from './utils/whimsical-phrases.js';
import { floydTheme, floydRoles } from './theme/crush-theme.js';
import {
	MainLayout,
	MonitorLayout,
	ConversationalLayout,
	type ChatMessage,
	type MonitorData,
} from './ui/layouts/index.js';
import { useFloydStore, type ConversationMessage } from './store/floyd-store.js';
import { ErrorBoundary } from './ui/components/ErrorBoundary.js';
import {
	commonCommands,
	createCommandsWithHandlers,
	type CommandItem,
} from './ui/components/CommandPalette.js';
import { runDockCommand, parseDockArgs } from './commands/dock.js';
import type { ThinkingStatus } from './ui/agent/ThinkingStream.js';
import type { Task } from './ui/agent/TaskChecklist.js';
import type { ToolExecution } from './ui/monitor/ToolTimeline.js';
import type { StreamEvent } from './ui/monitor/EventStream.js';
import {
	TokenUsageDashboard,
	ToolPerformanceDashboard,
	ProductivityDashboard,
	ErrorAnalysisDashboard,
	MemoryDashboard,
	ResponseTimeDashboard,
	CostAnalysisDashboard,
	CodeQualityDashboard,
	AgentActivityDashboard,
	WorkflowDashboard,
	FileActivityDashboard,
	GitActivityDashboard,
	BrowserSessionDashboard,
	ResourceDashboard,
	SessionHistoryDashboard,
} from './ui/dashboard/index.js';
import {
	selectTokenUsage,
	selectToolPerformance,
	selectErrors,
	selectProductivity,
	selectResponseTimes,
	selectCosts,
} from './store/floyd-store.js';
import dotenv from 'dotenv';
import { resolve } from 'node:path';

// Load environment variables from multiple possible locations
const envPaths = [
	'.env.local', // Project-specific local env (git-ignored)
	'.env', // Project env
	`${process.env.HOME}/.floyd/.env.local`, // Global user env
];

for (const envPath of envPaths) {
	try {
		const result = dotenv.config({ path: envPath });
		if (result.error) {
			// Silently ignore ENOENT (file not found) errors
			// Log other errors
		} else if (Object.keys(result.parsed ?? {}).length > 0) {
			// Environment loaded successfully
		}
	} catch {
		// Ignore errors, try next path
	}
}

type Message = {
	role: 'user' | 'assistant' | 'system' | 'tool';
	content: string | any[];
};

type AppProps = {
	name?: string;
	chrome?: boolean;
};

// ============================================================================
// MESSAGE CONVERSION UTILITIES
// ============================================================================

/**
 * Convert internal Message to ChatMessage for MainLayout
 */
function toChatMessage(msg: Message | ConversationMessage): ChatMessage {
	return {
		id: 'timestamp' in msg ? msg.id : `${Date.now()}-${Math.random()}`,
		role: msg.role as ChatMessage['role'],
		content:
			typeof msg.content === 'string'
				? msg.content
				: JSON.stringify(msg.content),
		timestamp: 'timestamp' in msg ? new Date(msg.timestamp) : new Date(),
		streaming: 'streaming' in msg ? (msg as ConversationMessage).streaming : false,
	};
}

// ═══════════════════════════════════════════════════════════════════════════════
// FLOYD ASCII ART BANNER
// ═══════════════════════════════════════════════════════════════════════════════
// Note: The ASCII banner is now rendered by MainLayout component.
// The original banner constants are preserved here for reference.
// Source: /Volumes/Storage/FLOYD_CLI/ASCII/FLOYD_CLI_ascii (1).txt
// Color scheme: #=pink, :=blue, .=gray, '=light gray
// ═══════════════════════════════════════════════════════════════════════════════

// ============================================================================
// MONITOR OVERLAY COMPONENT
// ============================================================================

function MonitorOverlay() {
	const tokenData = useFloydStore(selectTokenUsage);
	const toolData = useFloydStore(selectToolPerformance);
	const errorData = useFloydStore(selectErrors);
	const productivityData = useFloydStore(selectProductivity);
	const responseTimeData = useFloydStore(selectResponseTimes);
	const costData = useFloydStore(selectCosts);

	// Handle keyboard input for closing the overlay
	useInput((input, key) => {
		// Ctrl+Q - Quit the entire CLI immediately
		if (key.ctrl && (input === 'q' || input === 'Q')) {
			process.exit(0);
		}
		// Esc or Ctrl+M to close monitor and return to main view
		if (key.escape || (key.ctrl && input === 'm')) {
			useFloydStore.getState().setOverlay('showMonitor', false);
			return;
		}
	});

	return (
		<Box flexDirection="column" padding={1}>
			<Box
				flexDirection="row"
				justifyContent="space-between"
				paddingX={1}
				paddingY={0}
				borderStyle="double"
				borderColor={floydTheme.colors.borderFocus}
			>
				<Text bold color={floydRoles.headerTitle}>
					FLOYD MONITOR
				</Text>
				<Text dimColor>Press Esc to return</Text>
			</Box>

			<Box flexDirection="row" gap={1}>
				<Box flexDirection="column" gap={1}>
					<TokenUsageDashboard data={tokenData} />
					<ToolPerformanceDashboard tools={toolData} />
					<ProductivityDashboard data={productivityData} />
					<ErrorAnalysisDashboard errors={errorData} />
				</Box>

				<Box flexDirection="column" gap={1}>
					<MemoryDashboard
						projectCache={{ name: 'Project', entries: 0, sizeBytes: 0, hits: 0, misses: 0, lastAccess: Date.now() }}
						reasoningCache={{ name: 'Reasoning', entries: 0, sizeBytes: 0, hits: 0, misses: 0, lastAccess: Date.now() }}
						vaultCache={{ name: 'Vault', entries: 0, sizeBytes: 0, hits: 0, misses: 0, lastAccess: Date.now() }}
						totalMemoryMB={0}
					/>
					<ResponseTimeDashboard data={responseTimeData} />
					<CostAnalysisDashboard data={costData} />
					<CodeQualityDashboard
						data={{
							testCoverage: 0,
							lintErrors: 0,
							typeErrors: 0,
							score: 100,
						}}
					/>
				</Box>
			</Box>

			<Box flexDirection="row" gap={1}>
				<AgentActivityDashboard
					data={{
						activeAgents: 0,
						totalTasks: 0,
						completedTasks: 0,
						averageTime: 0,
					}}
				/>
				<WorkflowDashboard
					data={{
						commonWorkflows: [],
					}}
				/>
				<FileActivityDashboard
					data={{
						filesRead: 0,
						filesWritten: 0,
						filesModified: 0,
						totalFiles: 0,
					}}
				/>
			</Box>

			<Box flexDirection="row" gap={1}>
				<GitActivityDashboard
					data={{
						commits: 0,
						branches: 1,
						merges: 0,
						lastCommit: 'No commits yet',
					}}
				/>
				<BrowserSessionDashboard
					data={{
						pagesVisited: 0,
						screenshots: 0,
						interactions: 0,
						activeTime: 0,
					}}
				/>
				<ResourceDashboard
					data={{
						diskUsage: 0,
						networkIO: 0,
						tempFiles: 0,
						openFiles: 0,
					}}
				/>
				<SessionHistoryDashboard
					data={[]}
				/>
			</Box>
		</Box>
	);
}

// ============================================================================
// APP COMPONENT WITH MAIN LAYOUT INTEGRATION
// ============================================================================

/**
 * Floyd CLI App Component
 *
 * Integrates the MainLayout with AgentEngine, SessionManager, and Zustand store.
 * Provides streaming responses, command palette support, and full UI functionality.
 */
export default function App({ name = 'User', chrome = false }: AppProps) {
	// Local state
	const [isThinking, setIsThinking] = useState(false);
	const [agentStatus, setAgentStatus] = useState<ThinkingStatus>('idle');
	const [currentWhimsicalPhrase, setCurrentWhimsicalPhrase] = useState<string | null>(null);
	// Removed showHelp local state - using Zustand store
	// Removed localMessages - using Zustand store as single source of truth

	// Agent visualization state
	const [tasks, setTasks] = useState<Task[]>([]);
	const [toolExecutions, setToolExecutions] = useState<ToolExecution[]>([]);
	const [events, setEvents] = useState<StreamEvent[]>([]);
	// Removed showMonitor local state - using Zustand store
	const [showAgentViz, setShowAgentViz] = useState(false);

	// Refs for engine instances
	const engineRef = useRef<AgentEngine | null>(null);

	// Zustand store selectors - stable references to prevent infinite re-render loops
	// NOTE: Use stable selectors for values, useCallback for actions to prevent infinite re-render loops
	const selectMessages = useCallback((state: any) => state.messages, []);
	const selectStreamingContent = useCallback((state: any) => state.streamingContent, []);
	const selectAddMessage = useCallback((state: any) => state.addMessage, []);
	const selectUpdateMessage = useCallback((state: any) => state.updateMessage, []);
	const selectAppendStreamingContent = useCallback((state: any) => state.appendStreamingContent, []);
	const selectClearStreamingContent = useCallback((state: any) => state.clearStreamingContent, []);
	const selectSetStatus = useCallback((state: any) => state.setStatus, []);
	const selectSafetyMode = useCallback((state: any) => state.safetyMode, []);
	const selectToggleSafetyMode = useCallback((state: any) => state.toggleSafetyMode, []);
	const selectShowHelp = useCallback((state: any) => state.showHelp, []);
	const selectShowMonitor = useCallback((state: any) => state.showMonitor, []);

	const storeMessages = useFloydStore(selectMessages);
	const streamingContent = useFloydStore(selectStreamingContent);
	const addMessage = useFloydStore(selectAddMessage);
	const updateMessage = useFloydStore(selectUpdateMessage);
	const appendStreamingContent = useFloydStore(selectAppendStreamingContent);
	const clearStreamingContent = useFloydStore(selectClearStreamingContent);
	const setAgentStoreStatus = useFloydStore(selectSetStatus);
	const safetyMode = useFloydStore(selectSafetyMode);
	const toggleSafetyMode = useFloydStore(selectToggleSafetyMode);
	const showHelp = useFloydStore(selectShowHelp);
	const showMonitor = useFloydStore(selectShowMonitor);

	// Overlay state setters
	const setShowHelp = useCallback((value: boolean) => {
		useFloydStore.getState().setOverlay('showHelp', value);
	}, []);
	const setShowMonitor = useCallback((value: boolean) => {
		useFloydStore.getState().setOverlay('showMonitor', value);
	}, []);
	const toggleHelp = useCallback(() => {
		useFloydStore.getState().toggleOverlay('showHelp');
	}, []);
	const toggleMonitor = useCallback(() => {
		useFloydStore.getState().toggleOverlay('showMonitor');
	}, []);

	const { exit } = useApp();

	// ============================================================================
	// INITIALIZATION
	// ============================================================================

	useEffect(() => {
		const init = async () => {
			try {
				// Initialize shared MCPClientManager with built-in servers
				const mcpManager = new MCPClientManager(BUILTIN_SERVERS);

				if (chrome) {
					await mcpManager.startServer(3000); // Default port for Chrome bridge
				}

				const sessionManager = new SessionManager();
				const config = await ConfigLoader.loadProjectConfig();
				const permissionManager = new PermissionManager(config.allowedTools);

				// Start built-in MCP servers (patch, runner, git, cache)
				await mcpManager.startBuiltinServers();

				// Connect to MCP servers defined in .floyd/mcp.json
				await mcpManager.connectExternalServers(process.cwd());

				// Support both FLOYD_GLM_* and GLM_* env var formats
				const apiKey = process.env['FLOYD_GLM_API_KEY'] || process.env['GLM_API_KEY'] || 'dummy-key';
				// Fixed endpoint: Use api.z.ai/api/anthropic (Anthropic-compatible format)
				const apiEndpoint = process.env['FLOYD_GLM_ENDPOINT'] || process.env['GLM_ENDPOINT'] || 'https://api.z.ai/api/anthropic';
				const apiModel = process.env['FLOYD_GLM_MODEL'] || process.env['GLM_MODEL'] || 'claude-sonnet-4-20250514';

				if (!process.env['FLOYD_GLM_API_KEY'] && !process.env['GLM_API_KEY']) {
					// We warn but continue with dummy for UI testing if requested
					// or we could block.
				}

				engineRef.current = new AgentEngine(
					{
						apiKey,
						baseURL: apiEndpoint,
						model: apiModel,
						enableThinkingMode: true,
						temperature: 0.2,
					},
					mcpManager,
					sessionManager,
					permissionManager,
					config,
				);
				await engineRef.current.initSession(process.cwd());

				setAgentStatus('idle');

				// Initialize Zustand store session
				useFloydStore
					.getState()
					.initSession('floyd-cli', 'Floyd CLI', process.cwd());

				// Initial greeting - add to both local state and store
				// Aligned with hardened prompt stack v1.3.0 identity
				const greeting: ConversationMessage = {
					id: `init-${Date.now()}`,
					role: 'assistant',
					content:
						'👋 Hello! I\'m FLOYD, your GOD TIER LEVEL 5 autonomous software engineering agent. I\'m ready to help you build, refactor, or ship code. What are we working on today?',
					timestamp: Date.now(),
				};
				// Use getState() directly to avoid including addMessage in dependencies
				useFloydStore.getState().addMessage(greeting);
				// Removed setLocalMessages - UI reads from Zustand store
			} catch {
				setAgentStatus('error');
			}
		};
		init();
		// Only depend on chrome - addMessage is accessed via getState()
	}, [chrome]);

	// ============================================================================
	// MESSAGE SUBMISSION
	// ============================================================================

	const handleSubmit = useCallback(
		async (value: string) => {
			if (!value.trim() || isThinking) return;

			// Check for dock commands (e.g., ":dock btop" or ":btop")
			const dockArgs = parseDockArgs(value.trim().split(/\s+/));
			if (dockArgs) {
				try {
					const result = await runDockCommand(dockArgs);
					if (result.success) {
						// Add feedback message
						const dockMsg: ConversationMessage = {
							id: `dock-${Date.now()}`,
							role: 'system',
							content: `[D] ${result.message}`,
							timestamp: Date.now(),
						};
						addMessage(dockMsg);
					} else {
						// Add error message
						const errorMsg: ConversationMessage = {
							id: `dock-error-${Date.now()}`,
							role: 'system',
							content: `[!] ${result.message}`,
							timestamp: Date.now(),
						};
						addMessage(errorMsg);
					}
				} catch (error) {
				const errorMsg: ConversationMessage = {
					id: `dock-error-${Date.now()}`,
					role: 'system',
					content: `[!] Dock error: ${error instanceof Error ? error.message : String(error)}`,
					timestamp: Date.now(),
				};
					addMessage(errorMsg);
				}
				return;
			}

			if (!engineRef.current) return;

			// Add user message
			const userMsg: Message = { role: 'user', content: value };
			const userMsgStore: ConversationMessage = {
				id: `user-${Date.now()}`,
				role: 'user',
				content: value,
				timestamp: Date.now(),
			};

			// Single source of truth - only update store, not localMessages
			addMessage(userMsgStore);

			setIsThinking(true);
			setAgentStatus('thinking');
			setAgentStoreStatus('thinking');

			// Show whimsical phrase while thinking (stored for status bar, NOT added to conversation)
			const whimsicalPhrase = getRandomWhimsicalPhrase();
			setCurrentWhimsicalPhrase(whimsicalPhrase.text);
			setAgentStoreStatus('thinking');

			try {
				const generator = engineRef.current.sendMessage(value);
				let currentAssistantMessage = '';

				// Add placeholder for assistant message
				const assistantMsgId = `assistant-${Date.now()}`;
				const assistantPlaceholder: ConversationMessage = {
					id: assistantMsgId,
					role: 'assistant',
					content: '',
					timestamp: Date.now(),
					streaming: true,
				};
				addMessage(assistantPlaceholder);
				// Removed setLocalMessages - UI reads from Zustand store via messages prop

				clearStreamingContent();

				// Create stream processor with throttling
				const streamProcessor = new StreamProcessor({
					rateLimitEnabled: true,
					maxTokensPerSecond: 1000, // Increased for performance
					flushInterval: 33, // 30fps for smooth updates
					maxBufferSize: 65536, // Increased buffer
				});

				// Create tag parser for thinking blocks
				const tagParser = new StreamTagParser(['thinking']);

				// DEFINE THESE VARIABLES HERE (Fixes Error 1 & 2)
				let inThinkingBlock = false;

				// Set up stream processor event handlers
				streamProcessor.on('data', (data: string) => {
					currentAssistantMessage += data;
					appendStreamingContent(data);

					// Update the existing assistant message in store (don't add new ones)
					// Single source of truth - UI reads from Zustand store
					updateMessage(assistantMsgId, {
						content: currentAssistantMessage,
						streaming: true,
					});
				});

				streamProcessor.on('end', () => {
					// Stream complete
				});

				streamProcessor.on('error', (error: Error) => {
					throw error;
				});

				// Process generator through stream processor
				for await (const chunk of generator) {
					// Process chunk through tag parser to handle split tokens
					for (const event of tagParser.process(chunk)) {
						if (event.type === 'tag_open' && event.tagName === 'thinking') {
							inThinkingBlock = true;
							setAgentStatus('thinking');
							setAgentStoreStatus('thinking');
							// Show new whimsical phrase for this thinking block
							const newPhrase = getRandomWhimsicalPhrase();
							setCurrentWhimsicalPhrase(newPhrase.text);
							continue;
						}

						if (event.type === 'tag_close' && event.tagName === 'thinking') {
							inThinkingBlock = false;
							// Add pause after thinking completes (800ms)
							await new Promise(resolve => setTimeout(resolve, 800));
							setAgentStatus('streaming');
							setAgentStoreStatus('streaming');
							setCurrentWhimsicalPhrase(null); // Clear phrase when streaming starts
							continue;
						}

						if (event.type === 'text' && event.content) {
							// Handle thinking content separately
							if (inThinkingBlock) {
								// Thinking content is already dimmed by orchestrator
								// Just update thinking state, don't add to main message
								continue;
							}

							// Regular content - process through stream processor for throttling
							streamProcessor.processChunk({
								text: event.content,
								type: 'text',
							});
						}
					}
				}

				// Complete the stream processor
				streamProcessor.complete();

				// Finalize the message
				clearStreamingContent();
				updateMessage(assistantMsgId, {
					content: currentAssistantMessage,
					streaming: false,
					timestamp: Date.now(),
				});
			} catch (error: unknown) {
				// Extract detailed error information
				let errorMessage = 'An unexpected error occurred';
				let errorDetails = '';

				if (error instanceof Error) {
					errorMessage = error.message;
					if (error.stack) {
						// Get first few lines of stack for debugging
						errorDetails = error.stack.split('\n').slice(0, 3).join('\n');
					}
					// Check for common API errors
					if (errorMessage.includes('fetch') || errorMessage.includes('network')) {
						errorDetails = 'Network error - check your internet connection and API endpoint';
					} else if (errorMessage.includes('401') || errorMessage.includes('Unauthorized')) {
						errorDetails = 'API authentication failed - check your API key';
					} else if (errorMessage.includes('429')) {
						errorDetails = 'Rate limit exceeded - please wait and try again';
					} else if (errorMessage.includes('500') || errorMessage.includes('502') || errorMessage.includes('503')) {
						errorDetails = 'API server error - the service may be temporarily unavailable';
					}
				} else {
					errorMessage = String(error);
				}

				const errorMsg: ConversationMessage = {
					id: `error-${Date.now()}`,
					role: 'assistant',
					content: `[!] Error: ${errorMessage}${errorDetails ? `\n\n${errorDetails}` : ''}`,
					timestamp: Date.now(),
				};
				addMessage(errorMsg);
				// Removed setLocalMessages - UI reads from Zustand store
				setAgentStatus('error');
			} finally {
				setIsThinking(false);
				setAgentStatus('idle');
				setAgentStoreStatus('idle');
				setCurrentWhimsicalPhrase(null);
			}
		},
		[
			isThinking,
			addMessage,
			updateMessage,
			appendStreamingContent,
			clearStreamingContent,
			setAgentStoreStatus,
		],
	);

	// ============================================================================
	// KEYBOARD INPUT HANDLING
	// ============================================================================

	useInput((inputKey, key) => {
		// Note: Most keyboard shortcuts are now handled by MainLayout
		// MainLayout has access to input state and overlay states for proper context

		// Ctrl+M to toggle monitor dashboard
		if (inputKey === 'm' && key.ctrl) {
			toggleMonitor();
			return;
		}

		// Ctrl+T to toggle agent visualization
		if (inputKey === 't' && key.ctrl) {
			setShowAgentViz(value => !value);
			return;
		}

		// Ctrl+Y to toggle YOLO mode
		if (inputKey === 'y' && key.ctrl) {
			toggleSafetyMode();
			return;
		}
	});

	// ============================================================================
	// COMBINE MESSAGES FOR DISPLAY
	// ============================================================================

	// Use store messages as single source of truth (convert to ChatMessage format)
	// Memoized to prevent infinite re-render loop in MainLayout
	const allMessages: ChatMessage[] = useMemo(
		() => storeMessages.map(toChatMessage),
		[storeMessages]
	);

	// ============================================================================
	// COMMAND PALETTE HANDLERS
	// ============================================================================

	const handleCommand = useCallback(
		(commandId: string) => {
			switch (commandId) {
				case 'exit':
					exit();
					break;
				case 'new-task':
				case 'reset-session':
					setTasks([]);
					setToolExecutions([]);
					setEvents([]);
					useFloydStore.getState().clearMessages();
					useFloydStore.getState().clearStreamingContent();
					break;
				case 'toggle-monitor':
					toggleMonitor();
					break;
				case 'toggle-agent-viz':
					setShowAgentViz(v => !v);
					break;
				case 'toggle-safety':
					useFloydStore.getState().toggleSafetyMode();
					break;
				case 'export-transcript':
					// Logic to save allMessages to a file
					const fs = require('node:fs');
					const transcriptPath = `transcript-${Date.now()}.md`;
					const transcriptContent = allMessages.map(m => `[${m.role.toUpperCase()}] ${m.content}`).join('\n\n');
					fs.writeFileSync(transcriptPath, transcriptContent);
					addMessage({
						id: `system-${Date.now()}`,
						role: 'system',
						content: `[OK] Transcript exported to ${transcriptPath}`,
						timestamp: Date.now(),
					});
					break;
				case 'help':
					// Toggle help overlay using store state
					toggleHelp();
					break;
				case 'agent':
					// Launch Agent Builder overlay
					useFloydStore.getState().setOverlay('showAgentBuilder', true);
					break;
				case 'safety-mode-changed':
					// Safety mode changed via Shift+Tab in MainLayout
					break;
				case 'dock':
					// Dock command - handled separately via input parsing
					break;
				// ============================================================
				// QUICK ACTIONS (1-4 keys after assistant response)
				// ============================================================
				case 'apply':
					// Apply the last suggested code change
					if (allMessages.length > 0) {
						const lastAssistant = [...allMessages].reverse().find(m => m.role === 'assistant');
						if (lastAssistant && typeof lastAssistant.content === 'string') {
							// Send apply request to agent
							handleSubmit(`Please apply the changes you just suggested. Execute the code modifications.`);
						} else {
							addMessage({
								id: `system-${Date.now()}`,
								role: 'system',
								content: '[!] No recent response to apply.',
								timestamp: Date.now(),
							});
						}
					}
					break;
				case 'explain':
					// Request explanation of last response
					if (allMessages.length > 0) {
						const lastAssistant = [...allMessages].reverse().find(m => m.role === 'assistant');
						if (lastAssistant && typeof lastAssistant.content === 'string') {
							handleSubmit(`Please explain in more detail what you just said. Break it down step by step.`);
						} else {
							addMessage({
								id: `system-${Date.now()}`,
								role: 'system',
								content: '[!] No recent response to explain.',
								timestamp: Date.now(),
							});
						}
					}
					break;
				case 'diff':
					// Show diff preview of proposed changes
					if (allMessages.length > 0) {
						const lastAssistant = [...allMessages].reverse().find(m => m.role === 'assistant');
						if (lastAssistant && typeof lastAssistant.content === 'string') {
							// Check if content contains code blocks that could be diffed
							const hasCodeBlocks = lastAssistant.content.includes('```');
							if (hasCodeBlocks) {
								useFloydStore.getState().setOverlay('showDiffPreview', true);
								addMessage({
									id: `system-${Date.now()}`,
									role: 'system',
									content: '[D] Opening diff preview... (Showing proposed changes)',
									timestamp: Date.now(),
								});
							} else {
								handleSubmit(`Please show me a diff of the changes you're proposing. Use unified diff format.`);
							}
						} else {
							addMessage({
								id: `system-${Date.now()}`,
								role: 'system',
								content: '[!] No recent response with changes to diff.',
								timestamp: Date.now(),
							});
						}
					}
					break;
				case 'undo':
					// Undo the last action or revert conversation
					if (allMessages.length > 1) {
						// Find the last user message and remove everything after it
						const messages = useFloydStore.getState().messages;
						const lastUserIdx = messages.map(m => m.role).lastIndexOf('user');
						if (lastUserIdx > 0) {
							// Remove last user message and any responses
							const messagesToKeep = messages.slice(0, lastUserIdx);
							useFloydStore.getState().clearMessages();
							messagesToKeep.forEach(msg => useFloydStore.getState().addMessage(msg));
							addMessage({
								id: `system-${Date.now()}`,
								role: 'system',
								content: '[<-] Reverted to previous state. Last exchange removed.',
								timestamp: Date.now(),
							});
						} else {
							addMessage({
								id: `system-${Date.now()}`,
								role: 'system',
								content: '[!] Cannot undo further - at conversation start.',
								timestamp: Date.now(),
							});
						}
					} else {
						addMessage({
							id: `system-${Date.now()}`,
							role: 'system',
							content: '[!] Nothing to undo.',
							timestamp: Date.now(),
						});
					}
					break;
			}
		},
		[exit, toggleHelp, allMessages, addMessage, handleSubmit],
	);

	// Handle safety mode changes from MainLayout
	const handleSafetyModeChange = useCallback((mode: 'yolo' | 'ask' | 'plan') => {
		useFloydStore.getState().setSafetyMode(mode);
	}, []);

	// Create command handlers map for all common commands
	const commandHandlers = useMemo(() => ({
		'new-task': () => handleCommand('new-task'),
		'open-file': () => {
			// Prompt user to specify file path
			addMessage({
				id: `system-${Date.now()}`,
				role: 'system',
				content: '[F] Type a file path to open (e.g., /open src/index.ts)...',
				timestamp: Date.now(),
			});
		},
		'search-files': () => {
			// Prompt for search query
			addMessage({
				id: `system-${Date.now()}`,
				role: 'system',
				content: '[S] Type your search query to search files...',
				timestamp: Date.now(),
			});
		},
		'run-command': () => {
			addMessage({
				id: `system-${Date.now()}`,
				role: 'system',
				content: '[!] Type a command to run (e.g., npm test)...',
				timestamp: Date.now(),
			});
		},
		'view-history': () => {
			// Show session history switcher
			useFloydStore.getState().setOverlay('showSessionSwitcher', true);
		},
		'settings': () => {
			// Show config overlay
			useFloydStore.getState().setOverlay('showConfig', true);
		},
		'help': () => handleCommand('help'),
		'exit': () => handleCommand('exit'),
	}), [handleCommand, addMessage]);

	// Create commands with proper handlers using the new pattern
	const baseCommands = useMemo(
		() => createCommandsWithHandlers(commandHandlers),
		[commandHandlers]
	);

	// Augment with additional Floyd-specific commands
	const augmentedCommands: CommandItem[] = useMemo(
		() => [
			...baseCommands,
			{
				id: 'reset-session',
				label: 'Reset Session',
				description: 'Clear current conversation and reset agent state',
				icon: '[R]',
				action: () => handleCommand('reset-session'),
			},
			{
				id: 'toggle-safety',
				label: 'Toggle Safety Mode',
				description: 'Cycle between YOLO, ASK, and PLAN modes',
				icon: '[S]',
				action: () => handleCommand('toggle-safety'),
			},
			{
				id: 'export-transcript',
				label: 'Export Transcript',
				description: 'Save conversation history to a markdown file',
				icon: '[E]',
				action: () => handleCommand('export-transcript'),
			},
			{
				id: 'toggle-monitor',
				label: 'Toggle Monitor',
				description: 'Show/hide system performance dashboard',
				icon: '[M]',
				action: () => toggleMonitor(),
			},
			{
				id: 'toggle-agent-viz',
				label: 'Toggle Agent Viz',
				description: 'Show/hide task checklist and tool timeline',
				icon: '[A]',
				action: () => setShowAgentViz(v => !v),
			},
			{
				id: 'dock',
				label: 'Dock Command',
				description: 'Execute command in TMUX monitor pane (e.g., :dock btop)',
				icon: '[D]',
				insertText: ':dock ',
				action: () => {
					addMessage({
						id: `system-${Date.now()}`,
						role: 'system',
						content: '[D] Type :dock <command> to run in TMUX pane (e.g., :dock btop)',
						timestamp: Date.now(),
					});
				},
			},
		],
		[baseCommands, handleCommand, toggleMonitor, addMessage]
	);

	// ============================================================================
	// MONITOR DASHBOARD
	// ============================================================================

	if (showMonitor) {
		return <MonitorOverlay />;
	}

	// ============================================================================
	// CONVERSATIONAL LAYOUT (Claude-style chat flow)
	// ============================================================================

	return (
		<ErrorBoundary
			onError={(error, errorInfo) => {
				// Log error to file in production
			}}
		>
			<ConversationalLayout
				userName={name}
				messages={allMessages}
				streamingContent={streamingContent}
				isThinking={isThinking}
				agentStatus={agentStatus}
				whimsicalPhrase={currentWhimsicalPhrase}
				toolExecutions={toolExecutions}
				onSubmit={handleSubmit}
				onCommand={handleCommand}
				onExit={exit}
				commands={augmentedCommands}
				safetyMode={safetyMode}
				onSafetyModeChange={handleSafetyModeChange}
			/>
		</ErrorBoundary>
	);
}
