/**
 * Git Branch Tool - Floyd Wrapper
 *
 * Tool wrapper for git_branch from FLOYD_CLI
 */

import { z } from 'zod';
import type { ToolDefinition, ToolResult } from '../../types.js';
import { listBranches, getCurrentBranch, getGitInstance } from './git-core.js';

// ============================================================================
// Zod Schema
// ============================================================================

const inputSchema = z.object({
	repoPath: z.string().optional(),
	action: z.enum(['list', 'current', 'create', 'switch']).default('list'),
	name: z.string().optional(),
});

// ============================================================================
// Tool Execution
// ============================================================================

async function execute(input: z.infer<typeof inputSchema>): Promise<ToolResult> {
	const { repoPath, action, name } = input;
	const cwd = repoPath || process.cwd();

	if (action === 'list') {
		const result = await listBranches(cwd);
		return {
			success: result.branches.length > 0 || !result.error,
			data: result,
			error: result.error ? {
				code: 'GIT_BRANCH_ERROR',
				message: result.error,
				details: { repoPath: cwd },
			} : undefined,
		};
	}

	if (action === 'current') {
		const result = await getCurrentBranch(cwd);
		return {
			success: !!result.branch,
			data: result,
			error: result.error ? {
				code: 'GIT_BRANCH_ERROR',
				message: result.error,
				details: { repoPath: cwd },
			} : undefined,
		};
	}

	if (action === 'create' && name) {
		try {
			const git = getGitInstance(cwd);
			await git.branch([name]);
			return {
				success: true,
				data: { success: true, branch: name, created: true },
			};
		} catch (error) {
			return {
				success: false,
				error: {
					code: 'GIT_BRANCH_ERROR',
					message: (error as Error).message,
					details: { repoPath: cwd, name },
				},
			};
		}
	}

	if (action === 'switch' && name) {
		try {
			const git = getGitInstance(cwd);
			await git.checkout(name);
			return {
				success: true,
				data: { success: true, branch: name, switched: true },
			};
		} catch (error) {
			return {
				success: false,
				error: {
					code: 'GIT_BRANCH_ERROR',
					message: (error as Error).message,
					details: { repoPath: cwd, name },
				},
			};
		}
	}

	return {
		success: false,
		error: {
			code: 'GIT_BRANCH_ERROR',
			message: 'Invalid action or missing branch name',
			details: { action, name },
		},
	};
}

// ============================================================================
// Tool Definition
// ============================================================================

export const gitBranchTool: ToolDefinition = {
	name: 'git_branch',
	description: 'List, create, or switch branches',
	category: 'git',
	inputSchema,
	permission: 'moderate',
	execute,
} as ToolDefinition;
