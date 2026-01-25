/**
 * Verify Tool - Floyd Wrapper
 *
 * Explicit verification tool for checking expected outcomes
 * Tool #48 of 50
 */

import { z } from 'zod';
import type { ToolDefinition, ToolResult } from '../../types.js';

// ============================================================================
// Zod Schema
// ============================================================================

const inputSchema = z.object({
	type: z.enum(['file_exists', 'file_contains', 'file_not_exists', 'command_succeeds', 'command_fails']),
	target: z.string().min(1, 'Target is required'),
	expected: z.string().optional(),
	regex: z.boolean().optional().default(false),
	timeout_ms: z.number().optional().default(30000),
});

// ============================================================================
// Tool Execution
// ============================================================================

async function execute(input: z.infer<typeof inputSchema>): Promise<ToolResult> {
	const { type, target, expected, regex, timeout_ms } = input;

	try {
		switch (type) {
			case 'file_exists': {
				const fsModule = await import('fs-extra');
				const fs = fsModule.default || fsModule;
				const exists = await fs.pathExists(target);

				return {
					success: exists,
					data: {
						verified: exists,
						type: 'file_exists',
						target,
						actual: exists ? 'exists' : 'not found',
						expected: 'exists',
					},
					error: exists ? undefined : {
						code: 'VERIFICATION_FAILED',
						message: `File does not exist: ${target}`,
						details: { target },
					},
				};
			}

			case 'file_not_exists': {
				const fsModule = await import('fs-extra');
				const fs = fsModule.default || fsModule;
				const exists = await fs.pathExists(target);

				return {
					success: !exists,
					data: {
						verified: !exists,
						type: 'file_not_exists',
						target,
						actual: exists ? 'exists' : 'not found',
						expected: 'not found',
					},
					error: !exists ? undefined : {
						code: 'VERIFICATION_FAILED',
						message: `File should not exist but does: ${target}`,
						details: { target },
					},
				};
			}

			case 'file_contains': {
				if (!expected) {
					return {
						success: false,
						error: {
							code: 'INVALID_INPUT',
							message: 'Expected value is required for file_contains verification',
							details: { type },
						},
					};
				}

				const fsModule = await import('fs-extra');
				const fs = fsModule.default || fsModule;

				const exists = await fs.pathExists(target);
				if (!exists) {
					return {
						success: false,
						error: {
							code: 'FILE_NOT_FOUND',
							message: `File not found: ${target}`,
							details: { target },
						},
					};
				}

				const content = await fs.readFile(target, 'utf-8');
				let contains: boolean;

				if (regex) {
					const pattern = new RegExp(expected);
					contains = pattern.test(content);
				} else {
					contains = content.includes(expected);
				}

				return {
					success: contains,
					data: {
						verified: contains,
						type: 'file_contains',
						target,
						expected: expected.substring(0, 100) + (expected.length > 100 ? '...' : ''),
						actual: contains ? 'found' : 'not found in file',
					},
					error: contains ? undefined : {
						code: 'VERIFICATION_FAILED',
						message: `File does not contain expected content: ${target}`,
						details: { target, expected: expected.substring(0, 100) },
					},
				};
			}

			case 'command_succeeds': {
				const { execa } = await import('execa');

				try {
					const result = await execa('sh', ['-c', target], { timeout: timeout_ms });
					const succeeded = result.exitCode === 0;

					return {
						success: succeeded,
						data: {
							verified: succeeded,
							type: 'command_succeeds',
							target,
							actual: `exit code ${result.exitCode}`,
							expected: 'exit code 0',
							stdout: result.stdout?.substring(0, 500),
						},
					};
				} catch (error) {
					return {
						success: false,
						data: {
							verified: false,
							type: 'command_succeeds',
							target,
							actual: 'command failed',
							expected: 'exit code 0',
						},
						error: {
							code: 'VERIFICATION_FAILED',
							message: `Command failed: ${target}`,
							details: { error: (error as Error).message },
						},
					};
				}
			}

			case 'command_fails': {
				const { execa } = await import('execa');

				try {
					const result = await execa('sh', ['-c', target], { timeout: timeout_ms, reject: false });
					const failed = result.exitCode !== 0;

					return {
						success: failed,
						data: {
							verified: failed,
							type: 'command_fails',
							target,
							actual: `exit code ${result.exitCode}`,
							expected: 'non-zero exit code',
						},
					};
				} catch {
					// Command threw = it failed, which is what we wanted
					return {
						success: true,
						data: {
							verified: true,
							type: 'command_fails',
							target,
							actual: 'command failed',
							expected: 'command should fail',
						},
					};
				}
			}

			default:
				return {
					success: false,
					error: {
						code: 'INVALID_INPUT',
						message: `Unknown verification type: ${type}`,
						details: { type },
					},
				};
		}
	} catch (error) {
		return {
			success: false,
			error: {
				code: 'VERIFICATION_FAILED',
				message: (error as Error).message || 'Unknown verification error',
				details: { type, target },
			},
		};
	}
}

// ============================================================================
// Tool Definition
// ============================================================================

export const verifyTool: ToolDefinition = {
	name: 'verify',
	description: 'Explicit verification tool for checking file existence, content, and command outcomes.',
	category: 'special',
	inputSchema,
	permission: 'none',
	execute,
} as ToolDefinition;
