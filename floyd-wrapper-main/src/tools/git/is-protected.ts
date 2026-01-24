/**
 * Is Protected Branch Tool - Floyd Wrapper
 *
 * Tool wrapper for is_protected_branch from FLOYD_CLI
 */

import { z } from 'zod';
import type { ToolDefinition, ToolResult } from '../../types.js';
import { isProtectedBranch, getCurrentBranch } from './git-core.js';

// ============================================================================
// Zod Schema
// ============================================================================

const inputSchema = z.object({
	branch: z.string().optional(),
	repoPath: z.string().optional(),
});

// ============================================================================
// Tool Execution
// ============================================================================

async function execute(input: z.infer<typeof inputSchema>): Promise<ToolResult> {
	const { branch, repoPath } = input;
	const cwd = repoPath || process.cwd();

	let branchToCheck = branch;
	if (!branchToCheck) {
		const current = await getCurrentBranch(cwd);
		branchToCheck = current.branch;
	}

	if (!branchToCheck) {
		return {
			success: false,
			error: {
				code: 'GIT_PROTECTED_CHECK_ERROR',
				message: 'Could not determine branch',
				details: { repoPath: cwd },
			},
		};
	}

	const isProtected = isProtectedBranch(branchToCheck);

	return {
		success: true,
		data: {
			branch: branchToCheck,
			isProtected,
			protectedPatterns: ['main', 'master', 'development', 'develop', 'production', 'release'],
		},
	};
}

// ============================================================================
// Tool Definition
// ============================================================================

export const isProtectedBranchTool: ToolDefinition = {
	name: 'is_protected_branch',
	description: 'Check if a branch is protected (main, master, develop, etc.)',
	category: 'git',
	inputSchema,
	permission: 'none',
	execute,
} as ToolDefinition;
