/**
 * Cache Core - Copied from FLOYD_CLI
 *
 * This is the exact CacheManager class from /Volumes/Storage/FLOYD_CLI/INK/floyd-cli/src/cache/cache-manager.ts
 * Only imports have been adjusted for the Floyd Wrapper project structure.
 */

import { promises as fs } from 'fs';
import { join } from 'path';

export type CacheTier = 'reasoning' | 'project' | 'vault';

export interface CacheEntry {
	key: string;
	value: string;
	timestamp: number;
	ttl: number; // milliseconds
	tier: CacheTier;
	metadata?: Record<string, unknown>;
	version?: number; // Cache version
	lastAccess?: number; // For LRU eviction
	compressed?: boolean; // Whether value is compressed
}

export interface CacheStats {
	tier: CacheTier;
	count: number;
	totalSize: number;
	oldestEntry?: number;
	newestEntry?: number;
}

// Reasoning Frame Schema (matching blueprint)
export interface ReasoningFrame {
	frame_id: string;
	task_id: string;
	start_time: string;
	last_updated?: string;
	cog_steps: CogStep[];
	current_focus?: string;
	validation_hash?: string;
	glm_context?: {
		thinking_mode: 'preserved';
		last_cog_step_hash: number;
		session_continuity_token: string;
	};
}

export interface CogStep {
	timestamp: string;
	step_type: 'FRAME_START' | 'COG_STEP' | 'FRAME_APPEND' | 'TOOL_CALL' | 'DECISION';
	content: string;
	tool_used?: string;
	tool_result_hash?: string;
}

// Solution Pattern Schema (matching blueprint)
export interface SolutionPattern {
	signature: string;
	human_name?: string;
	trigger_terms: string[];
	category: 'ui_component' | 'api_endpoint' | 'auth_flow' | 'database' | 'devops' | 'utility';
	implementation: string;
	validation_tests?: string;
	dependencies?: string[];
	created: string;
	last_used?: string;
	success_count?: number;
	failure_count?: number;
	complexity_score?: number;
	embedding_vector?: number[];
}

// Project State Snapshot (matching blueprint)
export interface ProjectStateSnapshot {
	snapshot_time: string;
	project_root: string;
	active_branch: string;
	last_commit: string;
	master_plan_phase?: string;
	recent_commands: string[];
	active_ports?: Array<{
		port: number;
		service: string;
		pid: number;
	}>;
	recent_errors?: Array<{
		timestamp: string;
		tool: string;
		error: string;
		resolved: boolean;
	}>;
}

const TTL_CONFIG: Record<CacheTier, number> = {
	reasoning: 5 * 60 * 1000, // 5 minutes
	project: 24 * 60 * 60 * 1000, // 24 hours
	vault: 7 * 24 * 60 * 60 * 1000, // 7 days
};

// Size limits per tier (max number of entries)
const SIZE_LIMITS: Record<CacheTier, number> = {
	reasoning: 100, // 100 entries
	project: 500, // 500 entries
	vault: 1000, // 1000 entries
};

// Cache version
const CACHE_VERSION = 1;

export interface CacheConfig {
	cacheDir?: string;
	maxSize?: Partial<Record<CacheTier, number>>;
	compressThreshold?: number;
}

export class CacheManager {
	private cacheRoot: string;
	private tiers: CacheTier[] = ['reasoning', 'project', 'vault'];
	private maxSize: Record<CacheTier, number>;

	constructor(projectRoot: string, config?: CacheConfig) {
		this.cacheRoot = join(projectRoot, '.floyd', '.cache');
		this.maxSize = {
			reasoning: config?.maxSize?.reasoning || SIZE_LIMITS.reasoning,
			project: config?.maxSize?.project || SIZE_LIMITS.project,
			vault: config?.maxSize?.vault || SIZE_LIMITS.vault,
		};
	}

	private getTierPath(tier: CacheTier): string {
		return join(this.cacheRoot, tier);
	}

	private getEntryPath(tier: CacheTier, key: string): string {
		const safeKey = key.replace(/[^a-zA-Z0-9_-]/g, '_');
		return join(this.getTierPath(tier), `${safeKey}.json`);
	}

	private hash(input: string): number {
		let hash = 0;
		for (let i = 0; i < input.length; i++) {
			const char = input.charCodeAt(i);
			hash = (hash << 5) - hash + char;
			hash = hash & hash;
		}
		return Math.abs(hash);
	}

	private generateContinuityToken(): string {
		return `${Date.now()}-${Math.random().toString(36).substring(7)}`;
	}

	async store(
		tier: CacheTier,
		key: string,
		value: string,
		metadata?: Record<string, unknown>,
	): Promise<void> {
		// Validate inputs
		if (!key || key.trim().length === 0) {
			throw new Error('Cache key cannot be empty');
		}
		if (value === undefined || value === null) {
			throw new Error('Cache value cannot be null or undefined');
		}

		const entry: CacheEntry = {
			key,
			value,
			timestamp: Date.now(),
			lastAccess: Date.now(),
			ttl: TTL_CONFIG[tier],
			tier,
			metadata,
			version: CACHE_VERSION,
		};

		const entryPath = this.getEntryPath(tier, key);

		// Ensure directory exists
		const tierPath = this.getTierPath(tier);
		await fs.mkdir(tierPath, {recursive: true});

		await fs.writeFile(entryPath, JSON.stringify(entry, null, 2));

		// Enforce size limit - remove oldest entry if at capacity
		await this.enforceSizeLimit(tier);
	}

	async retrieve(tier: CacheTier, key: string): Promise<string | null> {
		const entryPath = this.getEntryPath(tier, key);

		try {
			const content = await fs.readFile(entryPath, 'utf-8');
			const entry: CacheEntry = JSON.parse(content);

			// Check if expired
			const now = Date.now();
			if (now - entry.timestamp > entry.ttl) {
				// Expired - delete and return null
				await this.delete(tier, key);
				return null;
			}

			// Update last access time for LRU
			entry.lastAccess = now;
			await fs.writeFile(entryPath, JSON.stringify(entry, null, 2));

			return entry.value;
		} catch {
			return null;
		}
	}

	private async enforceSizeLimit(tier: CacheTier): Promise<void> {
		const entries = await this.list(tier);
		const maxSize = this.maxSize[tier];

		if (entries.length <= maxSize) {
			return; // Under limit, nothing to do
		}

		// Sort by lastAccess time (oldest first) and remove excess
		const toRemove = entries
			.sort((a, b) => (a.lastAccess || a.timestamp) - (b.lastAccess || b.timestamp))
			.slice(0, entries.length - maxSize);

		for (const entry of toRemove) {
			await this.delete(tier, entry.key);
		}
	}

	async delete(tier: CacheTier, key: string): Promise<boolean> {
		const entryPath = this.getEntryPath(tier, key);

		try {
			await fs.unlink(entryPath);
			return true;
		} catch {
			return false;
		}
	}

	async clear(tier?: CacheTier): Promise<number> {
		let deleted = 0;

		if (tier) {
			const tierPath = this.getTierPath(tier);
			try {
				const files = await fs.readdir(tierPath);
				for (const file of files) {
					if (file.endsWith('.json')) {
						await fs.unlink(join(tierPath, file));
						deleted++;
					}
				}
			} catch {
				// Directory doesn't exist
			}
		} else {
			// Clear all tiers
			for (const t of this.tiers) {
				deleted += await this.clear(t);
			}
		}

		return deleted;
	}

	async list(tier?: CacheTier): Promise<CacheEntry[]> {
		const entries: CacheEntry[] = [];
		const tiersToCheck = tier ? [tier] : this.tiers;

		for (const t of tiersToCheck) {
			const tierPath = this.getTierPath(t);
			try {
				const files = await fs.readdir(tierPath);
				for (const file of files) {
					if (file.endsWith('.json')) {
						const content = await fs.readFile(join(tierPath, file), 'utf-8');
						const entry: CacheEntry = JSON.parse(content);

						// Skip expired entries
						const now = Date.now();
						if (now - entry.timestamp <= entry.ttl) {
							entries.push(entry);
						}
					}
				}
			} catch {
				// Directory might not exist or be empty
			}
		}

		// Sort by timestamp descending
		return entries.sort((a, b) => b.timestamp - a.timestamp);
	}

	async search(tier: CacheTier, query: string): Promise<CacheEntry[]> {
		const allEntries = await this.list(tier);
		const lowerQuery = query.toLowerCase();

		return allEntries.filter(
			(entry) =>
				entry.key.toLowerCase().includes(lowerQuery) ||
				entry.value.toLowerCase().includes(lowerQuery),
		);
	}

	async getStats(tier?: CacheTier): Promise<CacheStats[]> {
		const stats: CacheStats[] = [];
		const tiersToCheck = tier ? [tier] : this.tiers;

		for (const t of tiersToCheck) {
			const tierPath = this.getTierPath(t);
			const stat: CacheStats = {
				tier: t,
				count: 0,
				totalSize: 0,
			};

			try {
				const files = await fs.readdir(tierPath);
				for (const file of files) {
					if (file.endsWith('.json')) {
						const filePath = join(tierPath, file);
						const content = await fs.readFile(filePath, 'utf-8');
						const entry: CacheEntry = JSON.parse(content);

						// Count only non-expired entries
						const now = Date.now();
						if (now - entry.timestamp <= entry.ttl) {
							stat.count++;
							stat.totalSize += content.length;

							if (!stat.oldestEntry || entry.timestamp < stat.oldestEntry) {
								stat.oldestEntry = entry.timestamp;
							}
							if (!stat.newestEntry || entry.timestamp > stat.newestEntry) {
								stat.newestEntry = entry.timestamp;
							}
						}
					}
				}
			} catch {
				// Directory might not exist
			}

			stats.push(stat);
		}

		return stats;
	}

	async prune(tier?: CacheTier): Promise<number> {
		let pruned = 0;
		const tiersToCheck = tier ? [tier] : this.tiers;

		for (const t of tiersToCheck) {
			const tierPath = this.getTierPath(t);
			try {
				const files = await fs.readdir(tierPath);
				for (const file of files) {
					if (file.endsWith('.json')) {
						const filePath = join(tierPath, file);
						const content = await fs.readFile(filePath, 'utf-8');
						const entry: CacheEntry = JSON.parse(content);

						// Check if expired
						const now = Date.now();
						if (now - entry.timestamp > entry.ttl) {
							await fs.unlink(filePath);
							pruned++;
						}
					}
				}
			} catch {
				// Directory might not exist
			}
		}

		return pruned;
	}

	async storeReasoningFrame(frame: ReasoningFrame): Promise<void> {
		try {
			const lastStep = frame.cog_steps[frame.cog_steps.length - 1];

			frame.glm_context = {
				thinking_mode: 'preserved',
				last_cog_step_hash: lastStep ? this.hash(JSON.stringify(lastStep)) : 0,
				session_continuity_token: this.generateContinuityToken(),
			};

			// Ensure directory exists
			const activeDir = join(this.cacheRoot, 'reasoning', 'active');
			await fs.mkdir(activeDir, {recursive: true});

			const filepath = join(activeDir, 'frame.json');
			await fs.writeFile(filepath, JSON.stringify(frame, null, 2));
		} catch (error) {
			throw new Error(
				`Failed to store reasoning frame: ${(error as Error).message}`,
			);
		}
	}

	async loadReasoningFrame(): Promise<ReasoningFrame | null> {
		const filepath = join(this.cacheRoot, 'reasoning', 'active', 'frame.json');
		try {
			const content = await fs.readFile(filepath, 'utf-8');
			const frame = JSON.parse(content) as ReasoningFrame;

			// Validate frame structure
			if (!frame.frame_id || !Array.isArray(frame.cog_steps)) {
				throw new Error('Invalid frame structure');
			}

			return frame;
		} catch (error) {
			// File doesn't exist or is corrupted
			return null;
		}
	}

	async archiveFrame(): Promise<void> {
		const activePath = join(this.cacheRoot, 'reasoning', 'active', 'frame.json');
		const archiveDir = join(this.cacheRoot, 'reasoning', 'archive');
		const archivePath = join(archiveDir, `frame-${Date.now()}.json`);

		try {
			// Ensure archive directory exists
			await fs.mkdir(archiveDir, {recursive: true});
			await fs.rename(activePath, archivePath);
		} catch (error) {
			// File may not exist or other error - log but don't throw
			if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
				console.error(`Warning: Failed to archive frame: ${(error as Error).message}`);
			}
		}
	}

	async storePattern(name: string, pattern: string, tags?: string[]): Promise<void> {
		try {
			// Validate inputs
			if (!name || name.trim().length === 0) {
				throw new Error('Pattern name cannot be empty');
			}
			if (!pattern || pattern.trim().length === 0) {
				throw new Error('Pattern content cannot be empty');
			}

			const entry: CacheEntry = {
				key: name,
				value: pattern,
				timestamp: Date.now(),
				ttl: TTL_CONFIG.vault,
				tier: 'vault',
				metadata: { tags },
			};

			// Store in both patterns directory and main vault directory for listing
			const patternDir = join(this.cacheRoot, 'vault', 'patterns');
			await fs.mkdir(patternDir, {recursive: true});

			const patternPath = join(patternDir, `${name}.json`);
			await fs.writeFile(patternPath, JSON.stringify(entry, null, 2));

			// Also store in main vault tier directory so it appears in list()
			const vaultPath = this.getEntryPath('vault', `pattern:${name}`);
			await fs.writeFile(vaultPath, JSON.stringify(entry, null, 2));
		} catch (error) {
			throw new Error(`Failed to store pattern: ${(error as Error).message}`);
		}
	}
}
