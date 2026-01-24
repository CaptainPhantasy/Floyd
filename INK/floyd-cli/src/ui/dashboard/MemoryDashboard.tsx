import {Box, Text} from 'ink';
import {Frame} from '../crush/Frame.js';
import {floydTheme, crushTheme} from '../../theme/crush-theme.js';

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
