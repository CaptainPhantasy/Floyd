import {Box, Text} from 'ink';
import {Frame} from '../crush/Frame.js';
import {floydTheme, crushTheme} from '../../theme/crush-theme.js';

export interface ToolStats {
	calls: number;
	successes: number;
	failures: number;
	totalDuration: number;
	avgDuration: number;
	successRate: number;
	lastUsed: number | null;
}

export interface ToolPerformanceDashboardProps {
	tools: Record<string, ToolStats>;
	compact?: boolean;
}

export function ToolPerformanceDashboard({
	tools,
	compact = false,
}: ToolPerformanceDashboardProps) {
	const toolEntries = Object.entries(tools);
	const totalCalls = toolEntries.reduce((sum, [, stats]) => sum + stats.calls, 0);
	const totalSuccesses = toolEntries.reduce((sum, [, stats]) => sum + stats.successes, 0);
	const overallSuccessRate = totalCalls > 0 ? (totalSuccesses / totalCalls) * 100 : 100;
	const totalDuration = toolEntries.reduce((sum, [, stats]) => sum + stats.totalDuration, 0);
	const avgDuration = totalCalls > 0 ? totalDuration / totalCalls : 0;

	// Sort by most used
	const sortedTools = toolEntries.sort(([, a], [, b]) => b.calls - a.calls);
	const topTools = compact ? sortedTools.slice(0, 3) : sortedTools.slice(0, 8);

	return (
		<Frame title=" TOOL PERFORMANCE " padding={1} width={compact ? 40 : 70}>
			<Box flexDirection="column" gap={1}>
				{/* Summary stats */}
				<Box flexDirection="row" gap={4}>
					<Box flexDirection="column">
						<Text color={floydTheme.colors.fgMuted}>Total Calls</Text>
						<Text bold color={crushTheme.accent.primary}>
							{totalCalls}
						</Text>
					</Box>
					<Box flexDirection="column">
						<Text color={floydTheme.colors.fgMuted}>Success Rate</Text>
						<Text bold color={overallSuccessRate >= 90 ? crushTheme.status.ready : crushTheme.status.warning}>
							{overallSuccessRate.toFixed(1)}%
						</Text>
					</Box>
					<Box flexDirection="column">
						<Text color={floydTheme.colors.fgMuted}>Avg Duration</Text>
						<Text bold>{(avgDuration / 1000).toFixed(2)}s</Text>
					</Box>
				</Box>

				{/* Tool list */}
				<Box flexDirection="column">
					{/* Header */}
					<Box flexDirection="row" marginBottom={0}>
						<Box width={20}>
							<Text color={floydTheme.colors.fgMuted}>Tool</Text>
						</Box>
						<Box width={12}>
							<Text color={floydTheme.colors.fgMuted}>Calls</Text>
						</Box>
						<Box width={12}>
							<Text color={floydTheme.colors.fgMuted}>Success</Text>
						</Box>
						<Box width={12}>
							<Text color={floydTheme.colors.fgMuted}>Avg Time</Text>
						</Box>
					</Box>

					{/* Tools */}
					{topTools.map(([name, stats]) => (
						<Box key={name} flexDirection="row">
							<Box width={20}>
								<Text>{name}</Text>
							</Box>
							<Box width={12}>
								<Text bold>{stats.calls}</Text>
							</Box>
							<Box width={12}>
								<Text
									color={
										stats.successRate >= 90
											? crushTheme.status.ready
											: stats.successRate >= 70
												? crushTheme.status.warning
												: crushTheme.status.error
									}
								>
									{stats.successRate.toFixed(0)}%
								</Text>
							</Box>
							<Box width={12}>
								<Text color={floydTheme.colors.fgMuted}>
									{(stats.avgDuration / 1000).toFixed(2)}s
								</Text>
							</Box>
						</Box>
					))}

					{toolEntries.length > topTools.length && (
						<Box marginTop={0}>
							<Text dimColor color={floydTheme.colors.fgMuted}>
								... and {toolEntries.length - topTools.length} more tools
							</Text>
						</Box>
					)}
				</Box>
			</Box>
		</Frame>
	);
}
