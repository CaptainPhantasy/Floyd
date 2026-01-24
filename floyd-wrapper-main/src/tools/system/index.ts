/**
 * System Tools - Floyd Wrapper
 *
 * System tools copied from FLOYD_CLI and wrapped
 */

import { z } from 'zod';
import type { ToolDefinition } from '../../types.js';
import { execa } from 'execa';

// ============================================================================
// Run Tool
// ============================================================================

// Persistent CWD session
let sessionCwd = process.cwd();

export const runTool: ToolDefinition = {
	name: 'run',
	description: 'Execute terminal commands (supports persistent "cd")',
	category: 'build',
	inputSchema: z.object({
		command: z.string(),
		args: z.array(z.string()).optional(),
		cwd: z.string().optional(),
		timeout: z.number().optional().default(120000),
		env: z.record(z.string()).optional(),
	}),
	permission: 'dangerous',
	execute: async (input) => {
		const { command, args = [], cwd, timeout, env } = input as z.infer<typeof runTool.inputSchema>;

		// Use provided CWD or session CWD
		const executionCwd = cwd || sessionCwd;

		// Handle "cd" manually as it's a shell builtin
		if (command.trim() === 'cd') {
			try {
				const { default: path } = await import('node:path');
				const { default: fs } = await import('fs-extra');

				const targetDir = args[0] || process.env.HOME || '/';
				const resolvedPath = path.resolve(executionCwd, targetDir);

				if (await fs.pathExists(resolvedPath)) {
					sessionCwd = resolvedPath;
					return {
						success: true,
						data: {
							exitCode: 0,
							stdout: `Changed directory to ${sessionCwd}`,
							stderr: '',
							duration: 0
						}
					};
				} else {
					throw new Error(`Directory not found: ${resolvedPath}`);
				}
			} catch (error) {
				return {
					success: false,
					data: {
						exitCode: 1,
						stdout: '',
						stderr: (error as Error).message,
						duration: 0
					}
				};
			}
		}

		try {
			const result = await execa(command, args, {
				cwd: executionCwd,
				timeout,
				env: { ...process.env, ...env },
			});

			return {
				success: result.exitCode === 0,
				data: {
					exitCode: result.exitCode ?? null,
					stdout: result.stdout || '',
					stderr: result.stderr || '',
					duration: 0
				}
			};
		} catch (error) {
			return {
				success: false,
				data: {
					exitCode: null,
					stdout: '',
					stderr: (error as Error).message,
					duration: 0
				}
			};
		}
	}
} as ToolDefinition;

// ============================================================================
// Ask User Tool
// ============================================================================

export const askUserTool: ToolDefinition = {
	name: 'ask_user',
	description: 'Ask the user for input',
	category: 'build',
	inputSchema: z.object({
		question: z.string(),
	}),
	permission: 'none',
	execute: async (input) => {
		const { question } = input as z.infer<typeof askUserTool.inputSchema>;
		// In CLI mode, this would prompt the user
		// For now, return a placeholder
		return {
			success: true,
			data: { question, response: 'User input not available in non-interactive mode' }
		};
	}
} as ToolDefinition;
