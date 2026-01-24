/**
 * Git Log Tool - Floyd Wrapper
 *
 * Tool wrapper for git_log from FLOYD_CLI
 */

import { z } from 'zod';
import type { ToolDefinition, ToolResult } from '../../types.js';
import { getGitLog } from './git-core.js';

// ============================================================================
// Zod Schema
// ============================================================================

const inputSchema = z.object({
	repoPath: z.string().optional(),
	maxCount: z.number().optional().default(20),
	since: z.string().optional(),
	until: z.string().optional(),
	author: z.string().optional(),
	file: z.string().optional(),
});

// ============================================================================
// Tool Execution
// ============================================================================

async function execute(input: z.infer<typeof inputSchema>): Promise<ToolResult> {
	const { repoPath, maxCount, since, until, author, file } = input;
	const cwd = repoPath || process.cwd();

	const log = await getGitLog({
		repoPath: cwd,
		maxCount,
		since,
		until,
		author,
		file,
	});

	if ('error' in log) {
		return {
			success: false,
			error: {
				code: 'GIT_LOG_ERROR',
				message: log.error,
				details: { repoPath: cwd },
			},
		};
	}

	return {
		success: true,
		data: log,
	};
}

// ============================================================================
// Tool Definition
// ============================================================================

export const gitLogTool: ToolDefinition = {
	name: 'git_log',
	description: 'Show commit logs',
	category: 'git',
	inputSchema,
	permission: 'none',
	execute,
} as ToolDefinition;
