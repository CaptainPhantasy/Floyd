import {Box, Text} from 'ink';
import {Frame} from '../crush/Frame.js';
import {floydTheme, crushTheme} from '../../theme/crush-theme.js';

export interface TokenUsageData {
	totalTokens: number;
	inputTokens: number;
	outputTokens: number;
	requestCount: number;
	avgTokensPerRequest: number;
	estimatedCost: number;
	tokenBudget?: number;
	history: Array<{timestamp: number; tokens: number; requestCount: number}>;
}

export interface TokenUsageDashboardProps {
	data: TokenUsageData;
	compact?: boolean;
}

export function TokenUsageDashboard({
	data,
	compact = false,
}: TokenUsageDashboardProps) {
	if (!data) {
		return (
			<Frame title=" TOKEN USAGE " padding={1} width={40}>
				<Text color={floydTheme.colors.fgMuted}>No data available</Text>
			</Frame>
		);
	}

	const {
		totalTokens,
		inputTokens,
		outputTokens,
		requestCount,
		avgTokensPerRequest,
		estimatedCost,
		tokenBudget,
		history,
	} = data;

	// Calculate budget percentage
	const budgetPercent = tokenBudget
		? Math.round((totalTokens / tokenBudget) * 100)
		: 0;

	// Get recent history (last 5 entries)
	const recentHistory = history.slice(-5);
	const historyFormatted = recentHistory
		.map(h => {
			const time = new Date(h.timestamp).toLocaleTimeString('en-US', {
				hour: '2-digit',
				minute: '2-digit',
			});
			return `${time}: ${h.tokens}t`;
		})
		.join(' | ');

	return (
		<Frame title=" TOKEN USAGE " padding={1} width={compact ? 40 : 60}>
			<Box flexDirection="column" gap={1}>
				{/* Main metrics row */}
				<Box flexDirection="row" gap={4}>
					<Box flexDirection="column">
						<Text color={floydTheme.colors.fgMuted}>Total Tokens</Text>
						<Text bold color={crushTheme.accent.primary}>
							{totalTokens.toLocaleString()}
						</Text>
					</Box>
					<Box flexDirection="column">
						<Text color={floydTheme.colors.fgMuted}>Cost</Text>
						<Text bold color={crushTheme.status.ready}>
							${estimatedCost.toFixed(4)}
						</Text>
					</Box>
					<Box flexDirection="column">
						<Text color={floydTheme.colors.fgMuted}>Requests</Text>
						<Text bold>{requestCount}</Text>
					</Box>
				</Box>

				{/* Input/Output breakdown */}
				<Box flexDirection="row" gap={4}>
					<Box flexDirection="column">
						<Text color={floydTheme.colors.fgMuted}>Input</Text>
						<Text>{inputTokens.toLocaleString()}</Text>
					</Box>
					<Box flexDirection="column">
						<Text color={floydTheme.colors.fgMuted}>Output</Text>
						<Text>{outputTokens.toLocaleString()}</Text>
					</Box>
					<Box flexDirection="column">
						<Text color={floydTheme.colors.fgMuted}>Avg/Req</Text>
						<Text>{Math.round(avgTokensPerRequest)}</Text>
					</Box>
				</Box>

				{/* Budget bar */}
				{tokenBudget && (
					<Box flexDirection="column">
						<Box flexDirection="row" justifyContent="space-between">
							<Text color={floydTheme.colors.fgMuted}>Token Budget</Text>
							<Text>
								{totalTokens.toLocaleString()} / {tokenBudget.toLocaleString()} ({budgetPercent}%)
							</Text>
						</Box>
						<Box width="100%">
							<Text
								color={
									budgetPercent > 90
										? crushTheme.status.error
										: budgetPercent > 70
											? crushTheme.status.warning
											: crushTheme.status.ready
								}
							>
								{'█'.repeat(Math.round(budgetPercent / 2))}
								{'░'.repeat(50 - Math.round(budgetPercent / 2))}
							</Text>
						</Box>
					</Box>
				)}

				{/* Recent history */}
				{!compact && recentHistory.length > 0 && (
					<Box flexDirection="column">
						<Text color={floydTheme.colors.fgMuted}>Recent Activity</Text>
						<Text dimColor color={floydTheme.colors.fgMuted}>
							{historyFormatted}
						</Text>
					</Box>
				)}
			</Box>
		</Frame>
	);
}
