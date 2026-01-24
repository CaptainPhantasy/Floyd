/**
 * Git Stage Tool - Floyd Wrapper
 *
 * Tool wrapper for git_stage from FLOYD_CLI
 */

import { z } from 'zod';
import type { ToolDefinition, ToolResult } from '../../types.js';
import { stageFiles } from './git-core.js';

// ============================================================================
// Zod Schema
// ============================================================================

const inputSchema = z.object({
	files: z.array(z.string()).optional(),
	repoPath: z.string().optional(),
});

// ============================================================================
// Tool Execution
// ============================================================================

async function execute(input: z.infer<typeof inputSchema>): Promise<ToolResult> {
	const { files = [], repoPath } = input;
	const cwd = repoPath || process.cwd();

	const result = await stageFiles(files, cwd);

	return {
		success: result.success,
		data: result,
		error: result.error ? {
			code: 'GIT_STAGE_ERROR',
			message: result.error,
			details: { repoPath: cwd, files },
		} : undefined,
	};
}

// ============================================================================
// Tool Definition
// ============================================================================

export const gitStageTool: ToolDefinition = {
	name: 'git_stage',
	description: 'Stage files for commit',
	category: 'git',
	inputSchema,
	permission: 'moderate',
	execute,
} as ToolDefinition;
