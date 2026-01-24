import {Box, Text} from 'ink';
import {Frame} from '../crush/Frame.js';
import {floydTheme, crushTheme} from '../../theme/crush-theme.js';

export interface ErrorData {
	id: string;
	message: string;
	type: 'tool' | 'api' | 'permission' | 'system' | 'unknown';
	toolName?: string;
	timestamp: number;
	resolved: boolean;
	resolutionTime?: number;
	count: number;
}

export interface ErrorAnalysisDashboardProps {
	errors: ErrorData[];
	compact?: boolean;
}

export function ErrorAnalysisDashboard({
	errors,
	compact = false,
}: ErrorAnalysisDashboardProps) {
	const totalErrors = errors.length;
	const unresolvedErrors = errors.filter(e => !e.resolved).length;
	const resolvedErrors = errors.filter(e => e.resolved).length;
	const avgResolutionTime =
		resolvedErrors > 0
			? errors.filter(e => e.resolved).reduce((sum, e) => sum + (e.resolutionTime || 0), 0) / resolvedErrors
			: 0;

	// Group by type
	const errorsByType = errors.reduce((acc, e) => {
		acc[e.type] = (acc[e.type] || 0) + 1;
		return acc;
	}, {} as Record<string, number>);

	// Get recent errors (last 5)
	const recentErrors = errors.slice(-5);

	return (
		<Frame title=" ERROR ANALYSIS " padding={1} width={compact ? 40 : 70}>
			<Box flexDirection="column" gap={1}>
				{/* Summary stats */}
				<Box flexDirection="row" gap={4}>
					<Box flexDirection="column">
						<Text color={floydTheme.colors.fgMuted}>Total Errors</Text>
						<Text bold color={crushTheme.status.error}>
							{totalErrors}
						</Text>
					</Box>
					<Box flexDirection="column">
						<Text color={floydTheme.colors.fgMuted}>Unresolved</Text>
						<Text bold color={unresolvedErrors > 0 ? crushTheme.status.warning : crushTheme.status.ready}>
							{unresolvedErrors}
						</Text>
					</Box>
					<Box flexDirection="column">
						<Text color={floydTheme.colors.fgMuted}>Avg Resolution</Text>
						<Text bold>{(avgResolutionTime / 1000).toFixed(1)}s</Text>
					</Box>
				</Box>

				{/* Error types */}
				{!compact && Object.keys(errorsByType).length > 0 && (
					<Box flexDirection="column">
						<Text color={floydTheme.colors.fgMuted}>Error Types</Text>
						{Object.entries(errorsByType).map(([type, count]) => (
							<Box key={type} flexDirection="row">
								<Box width={20}>
									<Text color={floydTheme.colors.fgMuted}>{type}</Text>
								</Box>
								<Box width={10}>
									<Text bold>{count}</Text>
								</Box>
								<Box width="30%">
									<Text color={floydTheme.colors.fgMuted}>
										{((count / totalErrors) * 100).toFixed(0)}%
									</Text>
								</Box>
							</Box>
						))}
					</Box>
				)}

				{/* Recent errors */}
				{!compact && recentErrors.length > 0 && (
					<Box flexDirection="column">
						<Text color={floydTheme.colors.fgMuted}>Recent Errors</Text>
						{recentErrors.map(error => (
							<Box key={error.id} flexDirection="column">
								<Box flexDirection="row">
									<Text
										color={
											error.resolved
												? crushTheme.status.ready
												: crushTheme.status.error
										}
									>
										{error.resolved ? '✓' : '✗'}
									</Text>
									<Text> {error.type}</Text>
									{error.toolName && (
										<Text color={floydTheme.colors.fgMuted}> ({error.toolName})</Text>
									)}
									{error.count > 1 && (
										<Text color={crushTheme.status.warning}> x{error.count}</Text>
									)}
								</Box>
								<Text dimColor color={floydTheme.colors.fgMuted}>
									{error.message}
								</Text>
							</Box>
						))}
					</Box>
				)}

				{totalErrors === 0 && (
					<Box>
						<Text color={crushTheme.status.ready}>✓ No errors recorded</Text>
					</Box>
				)}
			</Box>
		</Frame>
	);
}
