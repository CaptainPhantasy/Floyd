/**
 * SessionSwitcherOverlay Component
 *
 * Overlay for switching between TMUX sessions.
 * Lists all available sessions and allows quick switching.
 *
 * Features:
 * - List all TMUX sessions
 * - Show session details (attached status, windows)
 * - Quick switch with Enter
 * - Fuzzy search/filter
 *
 * Trigger: Ctrl+K (or configurable)
 */

import {useState, useEffect, useCallback} from 'react';
import {Box, Text, useInput, useApp} from 'ink';
import TextInput from 'ink-text-input';
import {Frame} from '../crush/Frame.js';
import {floydTheme, crushTheme, roleColors} from '../../theme/crush-theme.js';
import {listSessions, getSessionInfo, type SessionInfo} from '../../tmux/session-manager.js';

// ============================================================================
// TYPES
// ============================================================================

export interface SessionSwitcherOverlayProps {
	/** Callback when overlay is closed */
	onClose: () => void;

	/** Custom title */
	title?: string;

	/** TMUX socket path (optional) */
	socketPath?: string;
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * SessionSwitcherOverlay - Switch between TMUX sessions
 */
export function SessionSwitcherOverlay({
	onClose,
	title = ' SWITCH SESSION ',
	socketPath,
}: SessionSwitcherOverlayProps) {
	const [searchQuery, setSearchQuery] = useState('');
	const [sessions, setSessions] = useState<SessionInfo[]>([]);
	const [selectedIndex, setSelectedIndex] = useState(0);
	const [loading, setLoading] = useState(true);
	const {exit: inkExit} = useApp();

	// Load sessions on mount
	useEffect(() => {
		async function loadSessions() {
			setLoading(true);
			try {
				const sessionNames = await listSessions(socketPath);
				const sessionInfos: SessionInfo[] = [];

				for (const name of sessionNames) {
					const info = await getSessionInfo(name, socketPath);
					if (info) {
						sessionInfos.push(info);
					}
				}

				setSessions(sessionInfos);
				setSelectedIndex(sessionInfos.length > 0 ? 0 : -1);
			} catch (error) {
				console.error('Failed to load sessions:', error);
				setSessions([]);
				setSelectedIndex(-1);
			} finally {
				setLoading(false);
			}
		}

		loadSessions();
	}, [socketPath]);

	// Filter sessions based on search query
	const filteredSessions = sessions.filter(session =>
		session.name.toLowerCase().includes(searchQuery.toLowerCase())
	);

	// Reset selected index when search changes
	useEffect(() => {
		setSelectedIndex(filteredSessions.length > 0 ? 0 : -1);
	}, [searchQuery]);

	// Handle keyboard input
	useInput((input, key) => {
		// Esc to close
		if (key.escape) {
			onClose();
			return;
		}

		// Ctrl+C to exit
		if (key.ctrl && input === 'c') {
			inkExit();
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
			handleSwitchSession(selected.name);
			return;
		}

		// Clear search with Ctrl+U
		if (key.ctrl && input === 'u') {
			setSearchQuery('');
			return;
		}
	});

	// Handle session switching
	const handleSwitchSession = useCallback(async (sessionName: string) => {
		try {
			// TODO: Implement attachSession in session-manager
			// await attachSession(sessionName, socketPath);
			// Exit current CLI and switch to session
			process.exit(0);
		} catch (error) {
			console.error(`Failed to switch to session ${sessionName}:`, error);
		}
	}, [socketPath]);

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
							Use ↑↓ to navigate, Enter to switch, Esc to close, Ctrl+U to clear search
						</Text>
					</Box>

					{/* Search input */}
					<Box flexDirection="column" marginBottom={1}>
						<Text bold color={crushTheme.accent.primary}>
							Search sessions:
						</Text>
						<TextInput
							value={searchQuery}
							onChange={setSearchQuery}
							placeholder="Type to filter sessions..."
							focus
						/>
					</Box>

					{/* Session list */}
					{loading ? (
						<Box justifyContent="center" paddingY={2}>
							<Text color={floydTheme.colors.fgSubtle}>Loading sessions...</Text>
						</Box>
					) : filteredSessions.length === 0 ? (
						<Box justifyContent="center" paddingY={2}>
							<Text color={floydTheme.colors.fgSubtle}>
								{searchQuery ? 'No sessions match your search' : 'No sessions found'}
							</Text>
						</Box>
					) : (
						<Box flexDirection="column">
							{/* Header */}
							<Box
								flexDirection="row"
								borderStyle="single"
								borderColor={floydTheme.colors.border}
								paddingX={1}
								marginBottom={0}
							>
								<Box width={10}>
									<Text bold color={crushTheme.accent.secondary}>
										Session
									</Text>
								</Box>
								<Box width={15}>
									<Text bold color={crushTheme.accent.secondary}>
										Windows
									</Text>
								</Box>
								<Box width={10}>
									<Text bold color={crushTheme.accent.secondary}>
										Status
									</Text>
								</Box>
								<Box flexGrow={1}>
									<Text bold color={crushTheme.accent.secondary}>
										Path
									</Text>
								</Box>
							</Box>

							{/* Sessions */}
							{filteredSessions.map((session, index) => {
								const isSelected = index === selectedIndex;
								const sessionKey = `session-${session.id}`;

								return (
									<Box
										key={sessionKey}
										flexDirection="row"
										paddingX={1}
										paddingY={0}
									>
										{/* Selection indicator */}
										<Text color={isSelected ? crushTheme.accent.primary : floydTheme.colors.fgMuted}>
											{isSelected ? '▶ ' : '  '}
										</Text>

										{/* Session name */}
										<Box width={28}>
											<Text bold={isSelected} color={isSelected ? floydTheme.colors.fgBase : floydTheme.colors.fgSubtle}>
												{session.name}
											</Text>
										</Box>

										{/* Windows count */}
										<Box width={15}>
											<Text color={floydTheme.colors.fgSubtle}>
												{session.windows.length} windows
											</Text>
										</Box>

										{/* Attached status */}
										<Box width={10}>
											<Text
												color={
													session.attached
														? floydTheme.colors.success
														: floydTheme.colors.fgMuted
												}
												bold={session.attached}
											>
												{session.attached ? 'Attached' : 'Detached'}
											</Text>
										</Box>
										{/* Active window */}
										<Box flexGrow={1}>
											<Text color={floydTheme.colors.fgSubtle} dimColor>
												{session.windows.find(w => w.active)?.name || ''}
											</Text>
										</Box>
									</Box>
								);
							})}
						</Box>
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
							Found {filteredSessions.length} session{filteredSessions.length !== 1 ? 's' : ''}
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

export default SessionSwitcherOverlay;
