/**
 * Git Status Tool - Floyd Wrapper
 *
 * Tool wrapper for git_status from FLOYD_CLI
 */

import { z } from 'zod';
import type { ToolDefinition, ToolResult } from '../../types.js';
import { getGitStatus } from './git-core.js';

// ============================================================================
// Zod Schema
// ============================================================================

const inputSchema = z.object({
	repoPath: z.string().optional(),
});

// ============================================================================
// Tool Execution
// ============================================================================

async function execute(input: z.infer<typeof inputSchema>): Promise<ToolResult> {
	const { repoPath } = input;
	const cwd = repoPath || process.cwd();

	const status = await getGitStatus(cwd);

	return {
		success: status.isRepo,
		data: status,
		error: status.error ? {
			code: 'GIT_STATUS_ERROR',
			message: status.error,
			details: { repoPath: cwd },
		} : undefined,
	};
}

// ============================================================================
// Tool Definition
// ============================================================================

export const gitStatusTool: ToolDefinition = {
	name: 'git_status',
	description: 'Show the working tree status. Returns staged/unstaged files and branch information.',
	category: 'git',
	inputSchema,
	permission: 'none',
	execute,
} as ToolDefinition;
