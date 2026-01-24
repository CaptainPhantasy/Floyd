/**
 * Git Diff Tool - Floyd Wrapper
 *
 * Tool wrapper for git_diff from FLOYD_CLI
 */

import { z } from 'zod';
import type { ToolDefinition, ToolResult } from '../../types.js';
import { getGitDiff } from './git-core.js';

// ============================================================================
// Zod Schema
// ============================================================================

const inputSchema = z.object({
	repoPath: z.string().optional(),
	files: z.array(z.string()).optional(),
	staged: z.boolean().optional().default(false),
	cached: z.boolean().optional().default(false),
});

// ============================================================================
// Tool Execution
// ============================================================================

async function execute(input: z.infer<typeof inputSchema>): Promise<ToolResult> {
	const { repoPath, files, staged, cached } = input;
	const cwd = repoPath || process.cwd();

	const diff = await getGitDiff({ repoPath: cwd, files, staged, cached });

	if ('error' in diff) {
		return {
			success: false,
			error: {
				code: 'GIT_DIFF_ERROR',
				message: diff.error,
				details: { repoPath: cwd, files, staged, cached },
			},
		};
	}

	return {
		success: true,
		data: diff,
	};
}

// ============================================================================
// Tool Definition
// ============================================================================

export const gitDiffTool: ToolDefinition = {
	name: 'git_diff',
	description: 'Show changes between commits, commit and working tree, etc.',
	category: 'git',
	inputSchema,
	permission: 'none',
	execute,
} as ToolDefinition;
