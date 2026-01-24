/**
 * Cache Tools Index - Floyd Wrapper
 *
 * All cache tool wrappers copied from FLOYD_CLI
 */

import { z } from 'zod';
import type { ToolDefinition } from '../../types.js';
import { CacheManager, type ReasoningFrame } from './cache-core.js';

// Get cache manager instance
let cacheManager: CacheManager | null = null;
let projectRoot: string = process.cwd();

/**
 * Set project root for cache (used for testing)
 */
export function setProjectRoot(root: string): void {
	projectRoot = root;
	cacheManager = null; // Reset to force recreation with new root
}

/**
 * Get cache manager instance
 */
function getCacheManager(): CacheManager {
	if (!cacheManager) {
		cacheManager = new CacheManager(projectRoot);
	}
	return cacheManager;
}

// ============================================================================
// Cache Store Tool
// ============================================================================

export const cacheStoreTool: ToolDefinition = {
	name: 'cache_store',
	description: 'Store data to a cache tier with optional metadata',
	category: 'cache',
	inputSchema: z.object({
		tier: z.enum(['reasoning', 'project', 'vault']),
		key: z.string(),
		value: z.string(),
		metadata: z.record(z.unknown()).optional(),
	}),
	permission: 'none',
	execute: async (input) => {
		// Validate input using Zod schema
		const validationResult = cacheStoreTool.inputSchema.safeParse(input);
		if (!validationResult.success) {
			const errors = validationResult.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
			return {
				success: false,
				error: {
					code: 'VALIDATION_ERROR',
					message: `Input validation failed: ${errors}`
				}
			};
		}

		const { tier, key, value, metadata } = validationResult.data;
		const cache = getCacheManager();
		await cache.store(tier, key, value, metadata);
		return {
			success: true,
			data: { success: true, tier, key, message: `Stored to ${tier} tier` }
		};
	}
} as ToolDefinition;

// ============================================================================
// Cache Retrieve Tool
// ============================================================================

export const cacheRetrieveTool: ToolDefinition = {
	name: 'cache_retrieve',
	description: 'Retrieve data from a cache tier by key',
	category: 'cache',
	inputSchema: z.object({
		tier: z.enum(['reasoning', 'project', 'vault']),
		key: z.string(),
	}),
	permission: 'none',
	execute: async (input) => {
		const validationResult = cacheRetrieveTool.inputSchema.safeParse(input);
		if (!validationResult.success) {
			const errors = validationResult.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
			return {
				success: false,
				error: {
					code: 'VALIDATION_ERROR',
					message: `Input validation failed: ${errors}`
				}
			};
		}

		const { tier, key } = validationResult.data;
		const cache = getCacheManager();
		const value = await cache.retrieve(tier, key);
		return {
			success: value !== null,
			data: { tier, key, found: value !== null, value }
		};
	}
} as ToolDefinition;

// ============================================================================
// Cache Delete Tool
// ============================================================================

export const cacheDeleteTool: ToolDefinition = {
	name: 'cache_delete',
	description: 'Delete a cache entry by key',
	category: 'cache',
	inputSchema: z.object({
		tier: z.enum(['reasoning', 'project', 'vault']),
		key: z.string(),
	}),
	permission: 'moderate',
	execute: async (input) => {
		const { tier, key } = input as z.infer<typeof cacheDeleteTool.inputSchema>;
		const cache = getCacheManager();
		const deleted = await cache.delete(tier, key);
		return {
			success: deleted,
			data: { success: deleted, tier, key, message: deleted ? 'Deleted' : 'Not found' }
		};
	}
} as ToolDefinition;

// ============================================================================
// Cache Clear Tool
// ============================================================================

export const cacheClearTool: ToolDefinition = {
	name: 'cache_clear',
	description: 'Clear all entries from a cache tier, or all tiers if not specified',
	category: 'cache',
	inputSchema: z.object({
		tier: z.enum(['reasoning', 'project', 'vault']).optional(),
	}),
	permission: 'dangerous',
	execute: async (input) => {
		const { tier } = input as z.infer<typeof cacheClearTool.inputSchema>;
		const cache = getCacheManager();
		const count = await cache.clear(tier);
		return {
			success: true,
			data: { success: true, deleted: count, tier: tier || 'all', message: `Cleared ${count} entries` }
		};
	}
} as ToolDefinition;

// ============================================================================
// Cache List Tool
// ============================================================================

export const cacheListTool: ToolDefinition = {
	name: 'cache_list',
	description: 'List all non-expired entries in a cache tier',
	category: 'cache',
	inputSchema: z.object({
		tier: z.enum(['reasoning', 'project', 'vault']).optional(),
	}),
	permission: 'none',
	execute: async (input) => {
		const { tier } = input as z.infer<typeof cacheListTool.inputSchema>;
		const cache = getCacheManager();
		const entries = await cache.list(tier);
		return {
			success: true,
			data: {
				count: entries.length,
				entries: entries.map(e => ({
					key: e.key,
					tier: e.tier,
					timestamp: e.timestamp,
					metadata: e.metadata
				}))
			}
		};
	}
} as ToolDefinition;

// ============================================================================
// Cache Search Tool
// ============================================================================

export const cacheSearchTool: ToolDefinition = {
	name: 'cache_search',
	description: 'Search for entries in a cache tier by key or value',
	category: 'cache',
	inputSchema: z.object({
		tier: z.enum(['reasoning', 'project', 'vault']),
		query: z.string(),
	}),
	permission: 'none',
	execute: async (input) => {
		const { tier, query } = input as z.infer<typeof cacheSearchTool.inputSchema>;
		const cache = getCacheManager();
		const results = await cache.search(tier, query);
		return {
			success: true,
			data: {
				query,
				tier,
				count: results.length,
				results: results.map(e => ({
					key: e.key,
					timestamp: e.timestamp,
					metadata: e.metadata
				}))
			}
		};
	}
} as ToolDefinition;

// ============================================================================
// Cache Stats Tool
// ============================================================================

export const cacheStatsTool: ToolDefinition = {
	name: 'cache_stats',
	description: 'Get statistics for cache tiers (entry count, size, oldest/newest)',
	category: 'cache',
	inputSchema: z.object({
		tier: z.enum(['reasoning', 'project', 'vault']).optional(),
	}),
	permission: 'none',
	execute: async (input) => {
		const { tier } = input as z.infer<typeof cacheStatsTool.inputSchema>;
		const cache = getCacheManager();
		const stats = await cache.getStats(tier);
		const result: Record<string, {
			entries: number;
			active: number;
			sizeBytes: number;
			oldest?: { key: string; timestamp: number };
			newest?: { key: string; timestamp: number };
		}> = {};
		for (const stat of stats) {
			result[stat.tier] = {
				entries: stat.count,
				active: stat.count,
				sizeBytes: stat.totalSize,
				oldest: stat.oldestEntry ? { key: '', timestamp: stat.oldestEntry } : undefined,
				newest: stat.newestEntry ? { key: '', timestamp: stat.newestEntry } : undefined
			};
		}
		return {
			success: true,
			data: result
		};
	}
} as ToolDefinition;

// ============================================================================
// Cache Prune Tool
// ============================================================================

export const cachePruneTool: ToolDefinition = {
	name: 'cache_prune',
	description: 'Remove all expired entries from cache tiers',
	category: 'cache',
	inputSchema: z.object({
		tier: z.enum(['reasoning', 'project', 'vault']).optional(),
	}),
	permission: 'moderate',
	execute: async (input) => {
		const { tier } = input as z.infer<typeof cachePruneTool.inputSchema>;
		const cache = getCacheManager();
		const pruned = await cache.prune(tier);
		return {
			success: true,
			data: { success: true, pruned, tier: tier || 'all', message: `Pruned ${pruned} expired entries` }
		};
	}
} as ToolDefinition;

// ============================================================================
// Cache Store Pattern Tool
// ============================================================================

export const cacheStorePatternTool: ToolDefinition = {
	name: 'cache_store_pattern',
	description: 'Store a reusable pattern to the vault tier',
	category: 'cache',
	inputSchema: z.object({
		name: z.string(),
		pattern: z.string(),
		tags: z.array(z.string()).optional(),
	}),
	permission: 'none',
	execute: async (input) => {
		const { name, pattern, tags } = input as z.infer<typeof cacheStorePatternTool.inputSchema>;
		const cache = getCacheManager();
		await cache.storePattern(name, pattern, tags);
		return {
			success: true,
			data: { success: true, name, tags, message: 'Pattern stored to vault' }
		};
	}
} as ToolDefinition;

// ============================================================================
// Cache Store Reasoning Tool
// ============================================================================

export const cacheStoreReasoningTool: ToolDefinition = {
	name: 'cache_store_reasoning',
	description: 'Store a reasoning frame to the active reasoning frame',
	category: 'cache',
	inputSchema: z.object({
		frame: z.string(),
	}),
	permission: 'none',
	execute: async (input) => {
		const { frame } = input as z.infer<typeof cacheStoreReasoningTool.inputSchema>;
		const cache = getCacheManager();
		const reasoningFrame = JSON.parse(frame) as ReasoningFrame;
		await cache.storeReasoningFrame(reasoningFrame);
		return {
			success: true,
			data: { success: true, steps: reasoningFrame.cog_steps.length, message: `Reasoning frame stored with ${reasoningFrame.cog_steps.length} steps` }
		};
	}
} as ToolDefinition;

// ============================================================================
// Cache Load Reasoning Tool
// ============================================================================

export const cacheLoadReasoningTool: ToolDefinition = {
	name: 'cache_load_reasoning',
	description: 'Load the active reasoning frame',
	category: 'cache',
	inputSchema: z.object({}),
	permission: 'none',
	execute: async () => {
		const cache = getCacheManager();
		const frame = await cache.loadReasoningFrame();
		return {
			success: frame !== null,
			data: { found: frame !== null, frame }
		};
	}
} as ToolDefinition;

// ============================================================================
// Cache Archive Reasoning Tool
// ============================================================================

export const cacheArchiveReasoningTool: ToolDefinition = {
	name: 'cache_archive_reasoning',
	description: 'Archive the active reasoning frame to the archive',
	category: 'cache',
	inputSchema: z.object({}),
	permission: 'moderate',
	execute: async () => {
		const cache = getCacheManager();
		await cache.archiveFrame();
		return {
			success: true,
			data: { success: true, message: 'Active reasoning frame archived' }
		};
	}
} as ToolDefinition;
