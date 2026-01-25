/**
 * Git Merge Tool - Floyd Wrapper
 *
 * Merges branches with conflict detection
 * Tool #46 of 50
 */

import { z } from 'zod';
import type { ToolDefinition, ToolResult } from '../../types.js';
import { execa } from 'execa';

// ============================================================================
// Zod Schema
// ============================================================================

const inputSchema = z.object({
	branch: z.string().min(1, 'Branch name is required'),
	repoPath: z.string().optional(),
	no_ff: z.boolean().optional().default(false),
	message: z.string().optional(),
});

// ============================================================================
// Tool Execution
// ============================================================================

async function execute(input: z.infer<typeof inputSchema>): Promise<ToolResult> {
	const { branch, repoPath, no_ff, message } = input;
	const cwd = repoPath || process.cwd();

	try {
		// Build merge command args
		const args = ['merge'];

		if (no_ff) {
			args.push('--no-ff');
		}

		if (message) {
			args.push('-m', message);
		}

		args.push(branch);

		// Execute merge
		const result = await execa('git', args, { cwd });

		return {
			success: true,
			data: {
				merged: branch,
				output: result.stdout,
				no_ff,
			},
		};
	} catch (error) {
		const errorMessage = (error as Error).message || String(error);

		// Check for merge conflict
		if (errorMessage.includes('CONFLICT') || errorMessage.includes('Automatic merge failed')) {
			return {
				success: false,
				error: {
					code: 'CONFLICT',
					message: `Merge conflict detected when merging ${branch}. Please resolve conflicts manually.`,
					details: {
						branch,
						output: errorMessage,
						resolution_hint: 'Use git status to see conflicted files, resolve them, then git add and git commit.',
					},
				},
			};
		}

		// Check for branch not found
		if (errorMessage.includes('not something we can merge') || errorMessage.includes('unknown revision')) {
			return {
				success: false,
				error: {
					code: 'NOT_FOUND',
					message: `Branch not found: ${branch}`,
					details: { branch },
				},
			};
		}

		return {
			success: false,
			error: {
				code: 'GIT_MERGE_ERROR',
				message: errorMessage,
				details: { branch, cwd },
			},
		};
	}
}

// ============================================================================
// Tool Definition
// ============================================================================

export const gitMergeTool: ToolDefinition = {
	name: 'git_merge',
	description: 'Merge a branch into the current branch. Detects and reports conflicts.',
	category: 'git',
	inputSchema,
	permission: 'dangerous',
	execute,
} as ToolDefinition;
