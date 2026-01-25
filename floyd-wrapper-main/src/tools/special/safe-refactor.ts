/**
 * Safe Refactor Tool - Floyd Wrapper
 *
 * Multi-step refactoring with rollback capability
 * Tool #49 of 50
 */

import { z } from 'zod';
import type { ToolDefinition, ToolResult } from '../../types.js';
import { toolRegistry } from '../tool-registry.js';

// ============================================================================
// Zod Schema
// ============================================================================

const stepSchema = z.object({
	tool: z.string(),
	input: z.record(z.unknown()),
	verification: z.object({
		type: z.string(),
		target: z.string(),
		expected: z.string().optional(),
	}).optional(),
});

const inputSchema = z.object({
	description: z.string().min(1, 'Description is required'),
	steps: z.array(stepSchema).min(1, 'At least one step is required'),
	rollback_on_failure: z.boolean().optional().default(true),
	dry_run: z.boolean().optional().default(false),
});

// ============================================================================
// Types
// ============================================================================

interface StepResult {
	step_index: number;
	tool: string;
	success: boolean;
	result?: unknown;
	error?: string;
	verification_passed?: boolean;
}

interface RollbackState {
	tool: string;
	original_content?: string;
	file_path?: string;
}

// ============================================================================
// Tool Execution
// ============================================================================

async function execute(input: z.infer<typeof inputSchema>): Promise<ToolResult> {
	const { description, steps, rollback_on_failure, dry_run } = input;

	const results: StepResult[] = [];
	const rollback_states: RollbackState[] = [];
	let all_succeeded = true;

	// Dry run mode - just return what would happen
	if (dry_run) {
		return {
			success: true,
			data: {
				mode: 'dry_run',
				description,
				step_count: steps.length,
				would_execute: steps.map((step, i) => ({
					step: i + 1,
					tool: step.tool,
					input_preview: JSON.stringify(step.input).substring(0, 100),
					has_verification: !!step.verification,
				})),
			},
		};
	}

	// Execute each step
	for (let i = 0; i < steps.length; i++) {
		const step = steps[i];
		const stepResult: StepResult = {
			step_index: i,
			tool: step.tool,
			success: false,
		};

		try {
			// Check if tool exists
			if (!toolRegistry.has(step.tool)) {
				stepResult.error = `Tool not found: ${step.tool}`;
				results.push(stepResult);
				all_succeeded = false;
				break;
			}

			// Save state for potential rollback (for file operations)
			if (step.tool === 'write' || step.tool === 'edit_file' || step.tool === 'search_replace') {
				const filePath = (step.input as Record<string, unknown>).file_path as string;
				if (filePath) {
					const fsModule = await import('fs-extra');
					const fs = fsModule.default || fsModule;
					const exists = await fs.pathExists(filePath);
					if (exists) {
						const content = await fs.readFile(filePath, 'utf-8');
						rollback_states.push({
							tool: step.tool,
							file_path: filePath,
							original_content: content,
						});
					}
				}
			}

			// Execute the tool
			const result = await toolRegistry.execute(step.tool, step.input, { permissionGranted: true });

			stepResult.success = result.success;
			stepResult.result = result.data;

			if (!result.success) {
				stepResult.error = result.error?.message;
				results.push(stepResult);
				all_succeeded = false;
				break;
			}

			// Run verification if specified
			if (step.verification) {
				const verifyResult = await toolRegistry.execute('verify', step.verification, { permissionGranted: true });
				stepResult.verification_passed = verifyResult.success;

				if (!verifyResult.success) {
					stepResult.error = `Verification failed: ${verifyResult.error?.message}`;
					results.push(stepResult);
					all_succeeded = false;
					break;
				}
			}

			results.push(stepResult);
		} catch (error) {
			stepResult.error = (error as Error).message;
			results.push(stepResult);
			all_succeeded = false;
			break;
		}
	}

	// Perform rollback if needed
	let rollback_performed = false;
	if (!all_succeeded && rollback_on_failure && rollback_states.length > 0) {
		rollback_performed = true;

		for (const state of rollback_states.reverse()) {
			if (state.file_path && state.original_content !== undefined) {
				try {
					const fsModule = await import('fs-extra');
					const fs = fsModule.default || fsModule;
					await fs.writeFile(state.file_path, state.original_content);
				} catch {
					// Rollback failed - log but continue
				}
			}
		}
	}

	return {
		success: all_succeeded,
		data: {
			description,
			steps_executed: results.length,
			steps_total: steps.length,
			all_succeeded,
			rollback_performed,
			results,
		},
		error: all_succeeded ? undefined : {
			code: 'REFACTOR_FAILED',
			message: `Refactor failed at step ${results.length}: ${results[results.length - 1]?.error}`,
			details: {
				failed_step: results.length,
				rollback_performed,
			},
		},
	};
}

// ============================================================================
// Tool Definition
// ============================================================================

export const safeRefactorTool: ToolDefinition = {
	name: 'safe_refactor',
	description: 'Execute multi-step refactoring with optional verification at each step and rollback on failure.',
	category: 'special',
	inputSchema,
	permission: 'dangerous',
	execute,
} as ToolDefinition;
