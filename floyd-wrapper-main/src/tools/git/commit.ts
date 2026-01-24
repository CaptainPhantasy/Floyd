/**
 * Git Commit Tool - Floyd Wrapper
 *
 * Tool wrapper for git_commit from FLOYD_CLI
 */

import { z } from 'zod';
import type { ToolDefinition, ToolResult } from '../../types.js';
import { createCommit, stageFiles } from './git-core.js';

// ============================================================================
// Zod Schema
// ============================================================================

const inputSchema = z.object({
	message: z.string(),
	repoPath: z.string().optional(),
	stageAll: z.boolean().optional().default(true),
	stageFiles: z.array(z.string()).optional(),
	allowEmpty: z.boolean().optional().default(false),
	amend: z.boolean().optional().default(false),
});

// ============================================================================
// Tool Execution
// ============================================================================

async function execute(input: z.infer<typeof inputSchema>): Promise<ToolResult> {
	const { message, repoPath, stageAll, stageFiles: filesToStage, allowEmpty, amend } = input;
	const cwd = repoPath || process.cwd();

	// Stage files if requested
	if (filesToStage && filesToStage.length > 0) {
		await stageFiles(filesToStage, cwd);
	} else if (stageAll) {
		await stageFiles([], cwd);
	}

	const result = await createCommit(message, {
		repoPath: cwd,
		allowEmpty,
		amend,
	});

	return {
		success: result.success,
		data: result,
		error: result.error ? {
			code: 'GIT_COMMIT_ERROR',
			message: result.error,
			details: { repoPath: cwd },
		} : undefined,
	};
}

// ============================================================================
// Tool Definition
// ============================================================================

export const gitCommitTool: ToolDefinition = {
	name: 'git_commit',
	description: 'Record changes to the repository. Warns for protected branches.',
	category: 'git',
	inputSchema,
	permission: 'dangerous',
	execute,
} as ToolDefinition;
