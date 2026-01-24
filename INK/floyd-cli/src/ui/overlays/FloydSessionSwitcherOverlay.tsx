/**
 * FloydSessionSwitcherOverlay Component
 *
 * Overlay for switching between Floyd CLI sessions.
 * Lists all available Floyd sessions and allows quick switching.
 *
 * Features:
 * - List all Floyd sessions from store
 * - Show session details (message count, last activity)
 * - Quick switch with Enter
 * - Create new session
 * - Delete session
 * - Session management
 *
 * Trigger: Ctrl+K (or configurable)
 */

import {useState, useEffect, useCallback} from 'react';
import {Box, Text, useInput} from 'ink';
import TextInput from 'ink-text-input';
import {Frame} from '../crush/Frame.js';
import {floydTheme, crushTheme, roleColors} from '../../theme/crush-theme.js';
import {useFloydStore} from '../../store/floyd-store.js';
import type {ConversationMessage} from '../../store/floyd-store.js';

// ============================================================================
// TYPES
// ============================================================================

export interface FloydSessionData {
	/** Session ID */
	id: string;

	/** Session name */
	name: string;

	/** Message count */
	messageCount: number;

	/** Total tokens used */
	totalTokens: number;

	/** Last activity timestamp */
	lastActivity: number;

	/** Created timestamp */
	createdAt: number;

	/** Active status */
	active: boolean;
}

export interface FloydSessionSwitcherOverlayProps {
	/** Callback when overlay is closed */
	onClose: () => void;

	/** Custom title */
	title?: string;

	/** Current session ID */
	currentSessionId: string;
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * FloydSessionSwitcherOverlay - Switch between Floyd CLI sessions
 */
export function FloydSessionSwitcherOverlay({
	onClose,
	title = ' SWITCH FLOYD SESSION ',
	currentSessionId,
}: FloydSessionSwitcherOverlayProps) {
	const [searchQuery, setSearchQuery] = useState('');
	const [selectedIndex, setSelectedIndex] = useState(0);
	const [showCreateForm, setShowCreateForm] = useState(false);
	const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
	const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
	const [newSessionName, setNewSessionName] = useState('');

	// Get session data from store
	const messages = useFloydStore(state => state.messages);
	const addMessage = useFloydStore(state => state.addMessage);

	// Mock Floyd session data - in production this would come from a session store
	// For now, we'll create a single current session and some mock saved sessions
	const allSessions: FloydSessionData[] = [
		{
			id: 'current',
			name: 'Current Session',
			messageCount: messages.length,
			totalTokens: messages.reduce((sum, m) => sum + (m.tokens || 0), 0),
			lastActivity: Date.now(),
			createdAt: Date.now() - 3600000,
			active: true,
		},
		{
			id: 'session-1',
			name: 'Project: Floyd CLI Dashboard',
			messageCount: 42,
			totalTokens: 28500,
			lastActivity: Date.now() - 86400000,
			createdAt: Date.now() - 604800000,
			active: false,
		},
		{
			id: 'session-2',
			name: 'Code Review - Agent Refactor',
			messageCount: 18,
			totalTokens: 12300,
			lastActivity: Date.now() - 172800000,
			createdAt: Date.now() - 1209600000,
			active: false,
		},
		{
			id: 'session-3',
			name: 'Bug Fix - Login Issue',
			messageCount: 25,
			totalTokens: 16800,
			lastActivity: Date.now() - 345600000,
			createdAt: Date.now() - 2592000000,
			active: false,
		},
		{
			id: 'session-4',
			name: 'Feature: Session Management',
			messageCount: 67,
			totalTokens: 45200,
			lastActivity: Date.now() - 864000000,
			createdAt: Date.now() - 5184000000,
			active: false,
		},
	];

	// Filter sessions based on search query
	const filteredSessions = allSessions.filter(session =>
		session.name.toLowerCase().includes(searchQuery.toLowerCase())
	);

	// Reset selected index when search changes
	useEffect(() => {
		setSelectedIndex(filteredSessions.length > 0 ? 0 : -1);
	}, [searchQuery]);

	// Handle keyboard input
	useInput((input, key) => {
		if (showCreateForm) {
			// Create form mode
			if (key.escape) {
				setShowCreateForm(false);
				setNewSessionName('');
				return;
			}

			if (key.return && newSessionName.trim()) {
				handleCreateSession(newSessionName.trim());
				return;
			}

			if (key.backspace || key.delete) {
				setNewSessionName(prev => prev.slice(0, -1));
				return;
			}

			if (input.length > 0 && !key.ctrl && !key.meta && !key.tab) {
				setNewSessionName(prev => prev + input);
			}
			return;
		}

		if (showDeleteConfirm) {
			// Delete confirm mode
			if (key.escape || (input === 'n' || input === 'N')) {
				setShowDeleteConfirm(false);
				setDeleteTargetId(null);
				return;
			}

			if ((input === 'y' || input === 'Y') && deleteTargetId) {
				handleDeleteSession(deleteTargetId);
				return;
			}
			return;
		}

		// Normal mode
		// Esc to close
		if (key.escape) {
			onClose();
			return;
		}

		// Ctrl+N to create new session
		if (key.ctrl && input === 'n') {
			setShowCreateForm(true);
			return;
		}

		// Ctrl+D to delete session
		if (key.ctrl && input === 'd' && filteredSessions.length > 0 && selectedIndex >= 0) {
			const selected = filteredSessions[selectedIndex];
			if (selected.id !== 'current') {
				setDeleteTargetId(selected.id);
				setShowDeleteConfirm(true);
			}
			return;
		}

		// Navigation
		if (key.upArrow) {
			setSelectedIndex(prev => Math.max(0, prev - 1));
			return;
		}

		if (key.downArrow) {
			setSelectedIndex(prev => Math.min(filteredSessions.length - 1, prev + 1));
			return;
		}

		// Switch to selected session
		if (key.return && filteredSessions.length > 0 && selectedIndex >= 0) {
			const selected = filteredSessions[selectedIndex];
			handleSwitchSession(selected);
			return;
		}

		// Clear search with Ctrl+U
		if (key.ctrl && input === 'u') {
			setSearchQuery('');
			return;
		}

		// Typing adds to search (only if not a special key)
		if (input.length > 0 && !key.ctrl && !key.meta && !key.return && !key.tab) {
			setSearchQuery(prev => prev + input);
		}
	});

	// Handle session switching
	const handleSwitchSession = useCallback((session: FloydSessionData) => {
		// Add system message indicating session switch
		addMessage({
			id: `system-${Date.now()}`,
			role: 'system',
			content: `--- Switched to session: ${session.name} ---`,
			timestamp: Date.now(),
		});
		onClose();
	}, [addMessage, onClose]);

	// Handle creating new session
	const handleCreateSession = useCallback((name: string) => {
		// In production, this would create a new session in the session store
		// For now, we'll just show a system message
		addMessage({
			id: `system-${Date.now()}`,
			role: 'system',
			content: `✅ Created new session: ${name}`,
			timestamp: Date.now(),
		});
		setNewSessionName('');
		setShowCreateForm(false);
		onClose();
	}, [addMessage, onClose]);

	// Handle deleting session
	const handleDeleteSession = useCallback((sessionId: string) => {
		// In production, this would delete the session from the session store
		// For now, we'll just show a system message
		const session = allSessions.find(s => s.id === sessionId);
		addMessage({
			id: `system-${Date.now()}`,
			role: 'system',
			content: `🗑️ Deleted session: ${session?.name || sessionId}`,
			timestamp: Date.now(),
		});
		setDeleteTargetId(null);
		setShowDeleteConfirm(false);
		onClose();
	}, [allSessions, addMessage, onClose]);

	// Format timestamp
	const formatTimestamp = (timestamp: number): string => {
		const now = Date.now();
		const diff = now - timestamp;

		if (diff < 60000) return 'Just now';
		if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
		if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
		if (diff < 604800000) return `${Math.floor(diff / 86400000)}d ago`;
		return new Date(timestamp).toLocaleDateString();
	};

	return (
		<Box
			flexDirection="column"
			width="100%"
			height="100%"
			justifyContent="center"
			alignItems="center"
		>
			<Frame
				title={title}
				borderStyle="round"
				borderVariant="focus"
				padding={1}
				width={80}
			>
				<Box flexDirection="column" gap={1}>
					{/* Instructions */}
					<Box marginBottom={1}>
						<Text color={floydTheme.colors.fgMuted} dimColor>
							↑↓ Navigate • Enter Switch • Esc Close • Ctrl+N New • Ctrl+D Delete
						</Text>
					</Box>

					{/* Search input */}
					{!showCreateForm && (
						<Box flexDirection="column" marginBottom={1}>
							<Text bold color={crushTheme.accent.primary}>
								Search sessions:
							</Text>
							<TextInput
								value={searchQuery}
								onChange={setSearchQuery}
								placeholder="Type to filter sessions..."
							/>
						</Box>
					)}

					{/* Create session form */}
					{showCreateForm && (
						<Box flexDirection="column" marginBottom={1}>
							<Text bold color={crushTheme.accent.secondary}>
								Create new session:
							</Text>
							<TextInput
								value={newSessionName}
								onChange={setNewSessionName}
								placeholder="Session name..."
							/>
							<Text color={floydTheme.colors.fgMuted} dimColor>
								Press Enter to create, Esc to cancel
							</Text>
						</Box>
					)}

					{/* Delete confirmation */}
					{showDeleteConfirm && (
						<Box flexDirection="column" marginBottom={1} paddingX={1} borderStyle="single" borderColor={floydTheme.colors.error}>
							<Text bold color={floydTheme.colors.error}>
								Delete this session?
							</Text>
							<Text>
								This action cannot be undone.
							</Text>
							<Box marginTop={1}>
								<Text color={floydTheme.colors.success} bold>[Y]es</Text>
								<Text color={floydTheme.colors.fgMuted}> / </Text>
								<Text color={floydTheme.colors.error} bold>[N]o</Text>
							</Box>
						</Box>
					)}

					{/* Session list */}
					{!showCreateForm && !showDeleteConfirm && (
						<>
							{filteredSessions.length === 0 ? (
								<Box justifyContent="center" paddingY={2}>
									<Text color={floydTheme.colors.fgSubtle}>
										{searchQuery ? 'No sessions match your search' : 'No sessions found'}
									</Text>
								</Box>
							) : (
								<>
									{/* Header */}
									<Box
										flexDirection="row"
										borderStyle="single"
										borderColor={floydTheme.colors.border}
										paddingX={1}
										marginBottom={0}
									>
										<Box width={8}>
											<Text bold color={crushTheme.accent.secondary}>
												Status
											</Text>
										</Box>
										<Box width={28}>
											<Text bold color={crushTheme.accent.secondary}>
												Session Name
											</Text>
										</Box>
										<Box width={8}>
											<Text bold color={crushTheme.accent.secondary}>
												Messages
											</Text>
										</Box>
										<Box width={10}>
											<Text bold color={crushTheme.accent.secondary}>
												Tokens
											</Text>
										</Box>
										<Box flexGrow={1}>
											<Text bold color={crushTheme.accent.secondary}>
												Last Activity
											</Text>
										</Box>
									</Box>

									{/* Sessions */}
									{filteredSessions.map((session, index) => {
										const isSelected = index === selectedIndex;
										const isCurrent = session.id === currentSessionId;
										const sessionKey = `session-${session.id}`;

										return (
											<Box
												key={sessionKey}
												flexDirection="row"
												paddingX={1}
												paddingY={0}
											>
												{/* Status indicator */}
												<Box width={8}>
													{isCurrent ? (
														<Text bold color={floydTheme.colors.success}>
															● Active
														</Text>
													) : (
														<Text color={floydTheme.colors.fgMuted}>
															○ Saved
														</Text>
													)}
												</Box>

												{/* Session name */}
												<Box width={28}>
													<Text
														bold={isSelected}
														color={
															isSelected
																? floydTheme.colors.fgBase
																: floydTheme.colors.fgSubtle
														}
													>
														{session.name}
													</Text>
												</Box>

												{/* Message count */}
												<Box width={8}>
													<Text color={floydTheme.colors.fgSubtle}>
														{session.messageCount}
													</Text>
												</Box>

												{/* Token count */}
												<Box width={10}>
													<Text color={floydTheme.colors.fgSubtle}>
														{(session.totalTokens / 1000).toFixed(1)}k
													</Text>
												</Box>

												{/* Last activity */}
												<Box flexGrow={1}>
													<Text color={floydTheme.colors.fgMuted} dimColor>
														{formatTimestamp(session.lastActivity)}
													</Text>
												</Box>
											</Box>
										);
									})}
								</>
							)}
						</>
					)}

					{/* Footer */}
					<Box
						marginTop={1}
						paddingTop={1}
						borderStyle="single"
						borderColor={floydTheme.colors.border}
						justifyContent="space-between"
					>
						<Text color={floydTheme.colors.fgMuted} dimColor>
							{filteredSessions.length} session{filteredSessions.length !== 1 ? 's' : ''}
						</Text>
						<Text color={floydTheme.colors.fgMuted} dimColor>
							Press Esc to close
						</Text>
					</Box>
				</Box>
			</Frame>
		</Box>
	);
}

export default FloydSessionSwitcherOverlay;
