import {Box, Text} from 'ink';
import {Frame} from '../crush/Frame.js';
import {floydTheme, crushTheme} from '../../theme/crush-theme.js';

export interface ProductivityData {
	tasksCompleted: number;
	sessionMinutes: number;
	activeMinutes: number;
	idleMinutes: number;
	tasksPerHour: number;
	activityScore: number;
	streak: number;
	bestStreak: number;
	sessionsToday: number;
	tasksToday: number;
	lastActivity: number;
	history: Array<{date: string; tasks: number; sessionMinutes: number}>;
}

export interface ProductivityDashboardProps {
	data: ProductivityData;
	compact?: boolean;
}

export function ProductivityDashboard({
	data,
	compact = false,
}: ProductivityDashboardProps) {
	if (!data) {
		return (
			<Frame title=" PRODUCTIVITY " padding={1} width={40}>
				<Text color={floydTheme.colors.fgMuted}>No data available</Text>
			</Frame>
		);
	}

	const {
		tasksCompleted,
		sessionMinutes,
		activeMinutes,
		idleMinutes,
		tasksPerHour,
		activityScore,
		streak,
		bestStreak,
		sessionsToday,
		tasksToday,
		lastActivity,
		history,
	} = data;

	// Calculate session length
	const sessionHours = Math.floor(sessionMinutes / 60);
	const sessionMins = Math.floor(sessionMinutes % 60);

	// Calculate active percentage
	const activePercent = sessionMinutes > 0 ? Math.round((activeMinutes / sessionMinutes) * 100) : 0;

	// Get recent history (last 3 days)
	const recentHistory = history.slice(-3);

	return (
		<Frame title=" PRODUCTIVITY " padding={1} width={compact ? 40 : 70}>
			<Box flexDirection="column" gap={1}>
				{/* Main stats row */}
				<Box flexDirection="row" gap={4}>
					<Box flexDirection="column">
						<Text color={floydTheme.colors.fgMuted}>Tasks Done</Text>
						<Text bold color={crushTheme.accent.primary}>
							{tasksCompleted}
						</Text>
					</Box>
					<Box flexDirection="column">
						<Text color={floydTheme.colors.fgMuted}>Session Time</Text>
						<Text bold>{sessionHours}h {sessionMins}m</Text>
					</Box>
					<Box flexDirection="column">
						<Text color={floydTheme.colors.fgMuted}>Tasks/Hr</Text>
						<Text bold>{tasksPerHour.toFixed(1)}</Text>
					</Box>
				</Box>

				{/* Activity metrics */}
				<Box flexDirection="row" gap={4}>
					<Box flexDirection="column">
						<Text color={floydTheme.colors.fgMuted}>Activity Score</Text>
						<Text bold color={activityScore >= 70 ? crushTheme.status.ready : crushTheme.status.warning}>
							{activityScore}/100
						</Text>
					</Box>
					<Box flexDirection="column">
						<Text color={floydTheme.colors.fgMuted}>Active Time</Text>
						<Text bold>{activePercent}%</Text>
					</Box>
					<Box flexDirection="column">
						<Text color={floydTheme.colors.fgMuted}>Idle Time</Text>
						<Text bold>{100 - activePercent}%</Text>
					</Box>
				</Box>

				{/* Streak info */}
				<Box flexDirection="row" gap={4}>
					<Box flexDirection="column">
						<Text color={floydTheme.colors.fgMuted}>Current Streak</Text>
						<Text bold color={crushTheme.accent.secondary}>
							🔥 {streak} day{streak !== 1 ? 's' : ''}
						</Text>
					</Box>
					<Box flexDirection="column">
						<Text color={floydTheme.colors.fgMuted}>Best Streak</Text>
						<Text bold color={crushTheme.accent.tertiary}>
							🏆 {bestStreak} day{bestStreak !== 1 ? 's' : ''}
						</Text>
					</Box>
					<Box flexDirection="column">
						<Text color={floydTheme.colors.fgMuted}>Today's Tasks</Text>
						<Text bold>{tasksToday} / {sessionsToday} sessions</Text>
					</Box>
				</Box>

				{/* Activity bar */}
				<Box flexDirection="column">
					<Box flexDirection="row" justifyContent="space-between">
						<Text color={floydTheme.colors.fgMuted}>Activity Distribution</Text>
						<Text>Active: {activePercent}% | Idle: {100 - activePercent}%</Text>
					</Box>
					<Box width="100%">
						<Box flexDirection="row">
							<Text color={crushTheme.status.ready}>
								{'█'.repeat(Math.round(activePercent / 2))}
							</Text>
							<Text color={crushTheme.accent.secondary}>
								{'░'.repeat(Math.round((100 - activePercent) / 2))}
							</Text>
						</Box>
					</Box>
				</Box>

				{/* Recent history */}
				{!compact && recentHistory.length > 0 && (
					<Box flexDirection="column">
						<Text color={floydTheme.colors.fgMuted}>Recent Days</Text>
						{recentHistory.map(h => (
							<Box key={h.date} flexDirection="row">
								<Box width={15}>
									<Text color={floydTheme.colors.fgMuted}>{h.date}</Text>
								</Box>
								<Box width={20}>
									<Text>{h.tasks} tasks</Text>
								</Box>
								<Box width={20}>
									<Text color={floydTheme.colors.fgMuted}>
										{Math.floor(h.sessionMinutes)}m
									</Text>
								</Box>
							</Box>
						))}
					</Box>
				)}
			</Box>
		</Frame>
	);
}
