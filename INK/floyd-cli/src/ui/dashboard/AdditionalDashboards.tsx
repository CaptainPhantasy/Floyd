import {Box, Text} from 'ink';
import {Frame} from '../crush/Frame.js';
import {floydTheme, crushTheme} from '../../theme/crush-theme.js';

// ============================================================================
// MEMORY DASHBOARD
// ============================================================================

export interface CacheData {
	name: string;
	entries: number;
	sizeBytes: number;
	hits: number;
	misses: number;
	lastAccess: number;
}

export interface MemoryDashboardProps {
	projectCache: CacheData;
	reasoningCache: CacheData;
	vaultCache: CacheData;
	totalMemoryMB: number;
	compact?: boolean;
}

export function MemoryDashboard({
	projectCache,
	reasoningCache,
	vaultCache,
	totalMemoryMB,
	compact = false,
}: MemoryDashboardProps) {
	const caches = [projectCache, reasoningCache, vaultCache];
	const totalEntries = caches.reduce((sum, c) => sum + c.entries, 0);
	const totalHits = caches.reduce((sum, c) => sum + c.hits, 0);
	const totalMisses = caches.reduce((sum, c) => sum + c.misses, 0);
	const hitRate = totalHits + totalMisses > 0 ? (totalHits / (totalHits + totalMisses)) * 100 : 0;

	const formatBytes = (bytes: number) => {
		const mb = bytes / (1024 * 1024);
		return mb < 1 ? `${(bytes / 1024).toFixed(1)} KB` : `${mb.toFixed(1)} MB`;
	};

	return (
		<Frame title=" MEMORY " padding={1} width={compact ? 40 : 70}>
			<Box flexDirection="column" gap={1}>
				{/* Summary */}
				<Box flexDirection="row" gap={4}>
					<Box flexDirection="column">
						<Text color={floydTheme.colors.fgMuted}>Total Memory</Text>
						<Text bold>{totalMemoryMB.toFixed(1)} MB</Text>
					</Box>
					<Box flexDirection="column">
						<Text color={floydTheme.colors.fgMuted}>Total Entries</Text>
						<Text bold>{totalEntries}</Text>
					</Box>
					<Box flexDirection="column">
						<Text color={floydTheme.colors.fgMuted}>Hit Rate</Text>
						<Text bold color={hitRate >= 80 ? crushTheme.status.ready : crushTheme.status.warning}>
							{hitRate.toFixed(1)}%
						</Text>
					</Box>
				</Box>

				{/* Cache details */}
				{!compact && (
					<Box flexDirection="column">
						{caches.map(cache => {
							const cacheHitRate = cache.hits + cache.misses > 0
								? (cache.hits / (cache.hits + cache.misses)) * 100
								: 0;
							return (
								<Box key={cache.name} flexDirection="column">
									<Text bold>{cache.name}</Text>
									<Box flexDirection="row">
										<Box width={15}>
											<Text color={floydTheme.colors.fgMuted}>Entries</Text>
											<Text> {cache.entries}</Text>
										</Box>
										<Box width={15}>
											<Text color={floydTheme.colors.fgMuted}>Size</Text>
											<Text> {formatBytes(cache.sizeBytes)}</Text>
										</Box>
										<Box width={15}>
											<Text color={floydTheme.colors.fgMuted}>Hit Rate</Text>
											<Text> {cacheHitRate.toFixed(0)}%</Text>
										</Box>
										<Box width={15}>
											<Text color={floydTheme.colors.fgMuted}>Hits/Misses</Text>
											<Text color={floydTheme.colors.fgMuted}>
												{cache.hits}/{cache.misses}
											</Text>
										</Box>
									</Box>
								</Box>
							);
						})}
					</Box>
				)}
			</Box>
		</Frame>
	);
}

// ============================================================================
// RESPONSE TIME DASHBOARD
// ============================================================================

export interface ResponseTimeData {
	averageTime: number;
	p50: number;
	p95: number;
	p99: number;
}

export interface ResponseTimeDashboardProps {
	data: ResponseTimeData;
	compact?: boolean;
}

export function ResponseTimeDashboard({
	data,
	compact = false,
}: ResponseTimeDashboardProps) {
	const {averageTime, p50, p95, p99} = data;

	const formatTime = (ms: number) => ms < 1000 ? `${ms.toFixed(0)}ms` : `${(ms / 1000).toFixed(2)}s`;

	return (
		<Frame title=" RESPONSE TIME " padding={1} width={compact ? 40 : 70}>
			<Box flexDirection="column" gap={1}>
				<Box flexDirection="row" gap={4}>
					<Box flexDirection="column">
						<Text color={floydTheme.colors.fgMuted}>Average</Text>
						<Text bold color={crushTheme.accent.primary}>
							{formatTime(averageTime)}
						</Text>
					</Box>
					<Box flexDirection="column">
						<Text color={floydTheme.colors.fgMuted}>P50 (Median)</Text>
						<Text bold>{formatTime(p50)}</Text>
					</Box>
					<Box flexDirection="column">
						<Text color={floydTheme.colors.fgMuted}>P95</Text>
						<Text bold>{formatTime(p95)}</Text>
					</Box>
					<Box flexDirection="column">
						<Text color={floydTheme.colors.fgMuted}>P99</Text>
						<Text bold>{formatTime(p99)}</Text>
					</Box>
				</Box>

				{!compact && (
					<Box flexDirection="column">
						<Text color={floydTheme.colors.fgMuted}>Percentile Explanation</Text>
						<Box flexDirection="column" marginLeft={1}>
							<Text>P50: 50% of requests complete in this time</Text>
							<Text>P95: 95% of requests complete in this time</Text>
							<Text>P99: 99% of requests complete in this time</Text>
						</Box>
					</Box>
				)}
			</Box>
		</Frame>
	);
}

// ============================================================================
// COST ANALYSIS DASHBOARD
// ============================================================================

export interface CostData {
	totalCost: number;
	inputCost: number;
	outputCost: number;
	costPerRequest: number;
}

export interface CostAnalysisDashboardProps {
	data: CostData;
	compact?: boolean;
}

export function CostAnalysisDashboard({
	data,
	compact = false,
}: CostAnalysisDashboardProps) {
	const {totalCost, inputCost, outputCost, costPerRequest} = data;

	const outputPercent = totalCost > 0 ? (outputCost / totalCost) * 100 : 0;
	const inputPercent = totalCost > 0 ? (inputCost / totalCost) * 100 : 0;

	return (
		<Frame title=" COST ANALYSIS " padding={1} width={compact ? 40 : 70}>
			<Box flexDirection="column" gap={1}>
				<Box flexDirection="row" gap={4}>
					<Box flexDirection="column">
						<Text color={floydTheme.colors.fgMuted}>Total Cost</Text>
						<Text bold color={crushTheme.accent.primary}>
							${totalCost.toFixed(4)}
						</Text>
					</Box>
					<Box flexDirection="column">
						<Text color={floydTheme.colors.fgMuted}>Cost/Request</Text>
						<Text bold>${costPerRequest.toFixed(4)}</Text>
					</Box>
				</Box>

				{/* Cost breakdown */}
				{!compact && (
					<Box flexDirection="column">
						<Text color={floydTheme.colors.fgMuted}>Cost Breakdown</Text>
						<Box flexDirection="column">
							<Box width="100%">
								<Text color={floydTheme.colors.fgMuted}>
									Input Tokens
								</Text>
								<Box width="100%">
									<Text color={crushTheme.accent.secondary}>
										{'█'.repeat(Math.round(inputPercent / 2))}
									</Text>
									<Text color={floydTheme.colors.fgMuted}>
										{'░'.repeat(50 - Math.round(inputPercent / 2))}
									</Text>
								</Box>
							</Box>
							<Box width="100%">
								<Text color={floydTheme.colors.fgMuted}>
									Output Tokens
								</Text>
								<Box width="100%">
									<Text color={crushTheme.accent.tertiary}>
										{'█'.repeat(Math.round(outputPercent / 2))}
									</Text>
									<Text color={floydTheme.colors.fgMuted}>
										{'░'.repeat(50 - Math.round(outputPercent / 2))}
									</Text>
								</Box>
							</Box>
						</Box>
						<Box flexDirection="row" gap={4} marginTop={0}>
							<Text color={floydTheme.colors.fgMuted}>
								Input: ${inputCost.toFixed(4)} ({inputPercent.toFixed(0)}%)
							</Text>
							<Text color={floydTheme.colors.fgMuted}>
								Output: ${outputCost.toFixed(4)} ({outputPercent.toFixed(0)}%)
							</Text>
						</Box>
					</Box>
				)}
			</Box>
		</Frame>
	);
}

// ============================================================================
// CODE QUALITY DASHBOARD
// ============================================================================

export interface CodeQualityData {
	testCoverage: number;
	lintErrors: number;
	typeErrors: number;
	score: number;
}

export interface CodeQualityDashboardProps {
	data: CodeQualityData;
	compact?: boolean;
}

export function CodeQualityDashboard({
	data,
	compact = false,
}: CodeQualityDashboardProps) {
	const {testCoverage, lintErrors, typeErrors, score} = data;

	const scoreColor =
		score >= 80
			? crushTheme.status.ready
			: score >= 60
				? crushTheme.status.warning
				: crushTheme.status.error;

	return (
		<Frame title=" CODE QUALITY " padding={1} width={compact ? 40 : 70}>
			<Box flexDirection="column" gap={1}>
				<Box flexDirection="row" gap={4}>
					<Box flexDirection="column">
						<Text color={floydTheme.colors.fgMuted}>Overall Score</Text>
						<Text bold color={scoreColor}>
							{score}/100
						</Text>
					</Box>
					<Box flexDirection="column">
						<Text color={floydTheme.colors.fgMuted}>Test Coverage</Text>
						<Text bold color={testCoverage >= 80 ? crushTheme.status.ready : crushTheme.status.warning}>
							{testCoverage}%
						</Text>
					</Box>
				</Box>

				{!compact && (
					<Box flexDirection="row" gap={4}>
						<Box flexDirection="column">
							<Text color={floydTheme.colors.fgMuted}>Lint Errors</Text>
							<Text bold color={lintErrors > 0 ? crushTheme.status.error : crushTheme.status.ready}>
								{lintErrors}
							</Text>
						</Box>
						<Box flexDirection="column">
							<Text color={floydTheme.colors.fgMuted}>Type Errors</Text>
							<Text bold color={typeErrors > 0 ? crushTheme.status.error : crushTheme.status.ready}>
								{typeErrors}
							</Text>
						</Box>
					</Box>
				)}
			</Box>
		</Frame>
	);
}

// ============================================================================
// AGENT ACTIVITY DASHBOARD
// ============================================================================

export interface AgentActivityData {
	activeAgents: number;
	totalTasks: number;
	completedTasks: number;
	averageTime: number;
}

export interface AgentActivityDashboardProps {
	data: AgentActivityData;
	compact?: boolean;
}

export function AgentActivityDashboard({
	data,
	compact = false,
}: AgentActivityDashboardProps) {
	const {activeAgents, totalTasks, completedTasks, averageTime} = data;

	const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 100;

	return (
		<Frame title=" AGENT ACTIVITY " padding={1} width={compact ? 40 : 70}>
			<Box flexDirection="column" gap={1}>
				<Box flexDirection="row" gap={4}>
					<Box flexDirection="column">
						<Text color={floydTheme.colors.fgMuted}>Active Agents</Text>
						<Text bold color={crushTheme.accent.primary}>
							{activeAgents}
						</Text>
					</Box>
					<Box flexDirection="column">
						<Text color={floydTheme.colors.fgMuted}>Tasks Done</Text>
						<Text bold>{completedTasks}/{totalTasks}</Text>
					</Box>
					<Box flexDirection="column">
						<Text color={floydTheme.colors.fgMuted}>Avg Time</Text>
						<Text bold>{(averageTime / 1000).toFixed(1)}s</Text>
					</Box>
				</Box>

				{!compact && (
					<Box flexDirection="column">
						<Text color={floydTheme.colors.fgMuted}>Completion Rate</Text>
						<Box width="100%">
							<Text color={completionRate >= 90 ? crushTheme.status.ready : crushTheme.status.warning}>
								{'█'.repeat(Math.round(completionRate / 2))}
							</Text>
							<Text color={floydTheme.colors.fgMuted}>
								{'░'.repeat(50 - Math.round(completionRate / 2))}
							</Text>
						</Box>
					</Box>
				)}
			</Box>
		</Frame>
	);
}

// ============================================================================
// WORKFLOW DASHBOARD
// ============================================================================

export interface WorkflowData {
	commonWorkflows: Array<{name: string; count: number}>;
}

export interface WorkflowDashboardProps {
	data: WorkflowData;
	compact?: boolean;
}

export function WorkflowDashboard({
	data,
	compact = false,
}: WorkflowDashboardProps) {
	const {commonWorkflows} = data;
	const totalWorkflows = commonWorkflows.reduce((sum, w) => sum + w.count, 0);

	return (
		<Frame title=" WORKFLOWS " padding={1} width={compact ? 40 : 70}>
			<Box flexDirection="column" gap={1}>
				{!compact && (
					<Box flexDirection="column">
						<Text color={floydTheme.colors.fgMuted}>Common Workflows</Text>
						{commonWorkflows.map((workflow, index) => (
							<Box key={index} flexDirection="row">
								<Box width={40}>
									<Text>{workflow.name}</Text>
								</Box>
								<Box width={20}>
									<Text bold>{workflow.count} times</Text>
								</Box>
								<Box width="30%">
									<Text color={floydTheme.colors.fgMuted}>
										{((workflow.count / totalWorkflows) * 100).toFixed(0)}%
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

// ============================================================================
// FILE ACTIVITY DASHBOARD
// ============================================================================

export interface FileActivityData {
	filesRead: number;
	filesWritten: number;
	filesModified: number;
	totalFiles: number;
}

export interface FileActivityDashboardProps {
	data: FileActivityData;
	compact?: boolean;
}

export function FileActivityDashboard({
	data,
	compact = false,
}: FileActivityDashboardProps) {
	const {filesRead, filesWritten, filesModified, totalFiles} = data;

	return (
		<Frame title=" FILE ACTIVITY " padding={1} width={compact ? 40 : 70}>
			<Box flexDirection="column" gap={1}>
				<Box flexDirection="row" gap={4}>
					<Box flexDirection="column">
						<Text color={floydTheme.colors.fgMuted}>Files Read</Text>
						<Text bold>{filesRead}</Text>
					</Box>
					<Box flexDirection="column">
						<Text color={floydTheme.colors.fgMuted}>Files Written</Text>
						<Text bold>{filesWritten}</Text>
					</Box>
					<Box flexDirection="column">
						<Text color={floydTheme.colors.fgMuted}>Files Modified</Text>
						<Text bold>{filesModified}</Text>
					</Box>
					<Box flexDirection="column">
						<Text color={floydTheme.colors.fgMuted}>Total Files</Text>
						<Text bold>{totalFiles}</Text>
					</Box>
				</Box>
			</Box>
		</Frame>
	);
}

// ============================================================================
// GIT ACTIVITY DASHBOARD
// ============================================================================

export interface GitActivityData {
	commits: number;
	branches: number;
	merges: number;
	lastCommit: string;
}

export interface GitActivityDashboardProps {
	data: GitActivityData;
	compact?: boolean;
}

export function GitActivityDashboard({
	data,
	compact = false,
}: GitActivityDashboardProps) {
	const {commits, branches, merges, lastCommit} = data;

	return (
		<Frame title=" GIT ACTIVITY " padding={1} width={compact ? 40 : 70}>
			<Box flexDirection="column" gap={1}>
				<Box flexDirection="row" gap={4}>
					<Box flexDirection="column">
						<Text color={floydTheme.colors.fgMuted}>Commits</Text>
						<Text bold>{commits}</Text>
					</Box>
					<Box flexDirection="column">
						<Text color={floydTheme.colors.fgMuted}>Branches</Text>
						<Text bold>{branches}</Text>
					</Box>
					<Box flexDirection="column">
						<Text color={floydTheme.colors.fgMuted}>Merges</Text>
						<Text bold>{merges}</Text>
					</Box>
				</Box>

				{!compact && lastCommit && (
					<Box flexDirection="column">
						<Text color={floydTheme.colors.fgMuted}>Last Commit</Text>
						<Text dimColor color={floydTheme.colors.fgMuted}>
							{lastCommit}
						</Text>
					</Box>
				)}
			</Box>
		</Frame>
	);
}

// ============================================================================
// BROWSER SESSION DASHBOARD
// ============================================================================

export interface BrowserSessionData {
	pagesVisited: number;
	screenshots: number;
	interactions: number;
	activeTime: number;
}

export interface BrowserSessionDashboardProps {
	data: BrowserSessionData;
	compact?: boolean;
}

export function BrowserSessionDashboard({
	data,
	compact = false,
}: BrowserSessionDashboardProps) {
	const {pagesVisited, screenshots, interactions, activeTime} = data;

	const formatTime = (seconds: number) => {
		const mins = Math.floor(seconds / 60);
		const secs = seconds % 60;
		return `${mins}m ${secs}s`;
	};

	return (
		<Frame title=" BROWSER SESSION " padding={1} width={compact ? 40 : 70}>
			<Box flexDirection="column" gap={1}>
				<Box flexDirection="row" gap={4}>
					<Box flexDirection="column">
						<Text color={floydTheme.colors.fgMuted}>Pages Visited</Text>
						<Text bold>{pagesVisited}</Text>
					</Box>
					<Box flexDirection="column">
						<Text color={floydTheme.colors.fgMuted}>Screenshots</Text>
						<Text bold>{screenshots}</Text>
					</Box>
					<Box flexDirection="column">
						<Text color={floydTheme.colors.fgMuted}>Interactions</Text>
						<Text bold>{interactions}</Text>
					</Box>
				</Box>

				{!compact && (
					<Box flexDirection="column">
						<Text color={floydTheme.colors.fgMuted}>Active Time</Text>
						<Text bold>{formatTime(activeTime)}</Text>
					</Box>
				)}
			</Box>
		</Frame>
	);
}

// ============================================================================
// RESOURCE DASHBOARD
// ============================================================================

export interface ResourceData {
	diskUsage: number;
	networkIO: number;
	tempFiles: number;
	openFiles: number;
}

export interface ResourceDashboardProps {
	data: ResourceData;
	compact?: boolean;
}

export function ResourceDashboard({
	data,
	compact = false,
}: ResourceDashboardProps) {
	const {diskUsage, networkIO, tempFiles, openFiles} = data;

	return (
		<Frame title=" RESOURCES " padding={1} width={compact ? 40 : 70}>
			<Box flexDirection="column" gap={1}>
				<Box flexDirection="row" gap={4}>
					<Box flexDirection="column">
						<Text color={floydTheme.colors.fgMuted}>Disk Usage</Text>
						<Text bold color={diskUsage > 80 ? crushTheme.status.warning : crushTheme.status.ready}>
							{diskUsage.toFixed(1)}%
						</Text>
					</Box>
					<Box flexDirection="column">
						<Text color={floydTheme.colors.fgMuted}>Network I/O</Text>
						<Text bold>{networkIO} KB/s</Text>
					</Box>
					<Box flexDirection="column">
						<Text color={floydTheme.colors.fgMuted}>Temp Files</Text>
						<Text bold>{tempFiles}</Text>
					</Box>
					<Box flexDirection="column">
						<Text color={floydTheme.colors.fgMuted}>Open Files</Text>
						<Text bold>{openFiles}</Text>
					</Box>
				</Box>

				{!compact && (
					<Box flexDirection="column">
						<Text color={floydTheme.colors.fgMuted}>Disk Usage Bar</Text>
						<Box width="100%">
							<Text color={diskUsage > 90 ? crushTheme.status.error : crushTheme.status.ready}>
								{'█'.repeat(Math.round(diskUsage / 2))}
							</Text>
							<Text color={floydTheme.colors.fgMuted}>
								{'░'.repeat(50 - Math.round(diskUsage / 2))}
							</Text>
						</Box>
					</Box>
				)}
			</Box>
		</Frame>
	);
}

// ============================================================================
// SESSION HISTORY DASHBOARD
// ============================================================================

export interface SessionData {
	name: string;
	duration: number;
	tasks: number;
}

export interface SessionHistoryDashboardProps {
	data: SessionData[];
	compact?: boolean;
}

export function SessionHistoryDashboard({
	data,
	compact = false,
}: SessionHistoryDashboardProps) {
	const totalDuration = data.reduce((sum, s) => sum + s.duration, 0);
	const totalTasks = data.reduce((sum, s) => sum + s.tasks, 0);
	const avgDuration = data.length > 0 ? totalDuration / data.length : 0;

	const formatDuration = (seconds: number) => {
		const mins = Math.floor(seconds / 60);
		if (mins < 60) {
			return `${mins}m`;
		}
		const hours = Math.floor(mins / 60);
		const remainingMins = mins % 60;
		return `${hours}h ${remainingMins}m`;
	};

	const sessions = compact ? data.slice(0, 3) : data;

	return (
		<Frame title=" SESSION HISTORY " padding={1} width={compact ? 40 : 70}>
			<Box flexDirection="column" gap={1}>
				{/* Summary */}
				<Box flexDirection="row" gap={4}>
					<Box flexDirection="column">
						<Text color={floydTheme.colors.fgMuted}>Total Sessions</Text>
						<Text bold>{data.length}</Text>
					</Box>
					<Box flexDirection="column">
						<Text color={floydTheme.colors.fgMuted}>Total Duration</Text>
						<Text bold>{formatDuration(totalDuration)}</Text>
					</Box>
					<Box flexDirection="column">
						<Text color={floydTheme.colors.fgMuted}>Total Tasks</Text>
						<Text bold>{totalTasks}</Text>
					</Box>
				</Box>

				{/* Session list */}
				{!compact && (
					<Box flexDirection="column">
						<Box flexDirection="row" marginBottom={0}>
							<Box width={20}>
								<Text color={floydTheme.colors.fgMuted}>Session</Text>
							</Box>
							<Box width={15}>
								<Text color={floydTheme.colors.fgMuted}>Duration</Text>
							</Box>
							<Box width={10}>
								<Text color={floydTheme.colors.fgMuted}>Tasks</Text>
							</Box>
						</Box>
						{sessions.map(session => (
							<Box key={session.name} flexDirection="row">
								<Box width={20}>
									<Text>{session.name}</Text>
								</Box>
								<Box width={15}>
									<Text bold>{formatDuration(session.duration)}</Text>
								</Box>
								<Box width={10}>
									<Text>{session.tasks}</Text>
								</Box>
							</Box>
						))}
					</Box>
				)}
			</Box>
		</Frame>
	);
}
