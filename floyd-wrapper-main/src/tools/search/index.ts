/**
 * Search Tools - Floyd Wrapper
 *
 * Search tools copied from FLOYD_CLI and wrapped
 */

import { z } from 'zod';
import type { ToolDefinition } from '../../types.js';
import * as searchCore from './search-core.js';

// ============================================================================
// Grep Tool
// ============================================================================

export const grepTool: ToolDefinition = {
	name: 'grep',
	description: 'Search file contents with regex patterns',
	category: 'search',
	inputSchema: z.object({
		pattern: z.string(),
		path: z.string().optional().default('.'),
		filePattern: z.string().optional().default('**/*'),
		caseInsensitive: z.boolean().optional().default(false),
		outputMode: z.enum(['content', 'files_with_matches', 'count']).optional().default('content'),
	}),
	permission: 'none',
	execute: async (input) => {
		const params = input as z.infer<typeof grepTool.inputSchema>;
		const result = await searchCore.grep(params.pattern, params);
		if (result.success) {
			return { success: true, data: result };
		}
		return { success: false, error: { code: 'GREP_ERROR', message: result.error || 'Unknown error', details: params } };
	}
} as ToolDefinition;

// ============================================================================
// Codebase Search Tool
// ============================================================================

export const codebaseSearchTool: ToolDefinition = {
	name: 'codebase_search',
	description: 'Search entire codebase with semantic understanding',
	category: 'search',
	inputSchema: z.object({
		query: z.string(),
		path: z.string().optional().default('.'),
		maxResults: z.number().optional().default(20),
	}),
	permission: 'none',
	execute: async (input) => {
		const params = input as z.infer<typeof codebaseSearchTool.inputSchema>;
		const result = await searchCore.codebaseSearch(params.query, params);
		if (result.success) {
			return { success: true, data: result };
		}
		return { success: false, error: { code: 'CODEBASE_SEARCH_ERROR', message: result.error || 'Unknown error', details: params } };
	}
} as ToolDefinition;
