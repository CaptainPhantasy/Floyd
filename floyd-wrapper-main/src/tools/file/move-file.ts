/**
 * Move File Tool - Floyd Wrapper
 *
 * Moves or renames files atomically
 * Tool #45 of 50
 */

import { z } from 'zod';
import type { ToolDefinition, ToolResult } from '../../types.js';

// ============================================================================
// Zod Schema
// ============================================================================

const inputSchema = z.object({
	source: z.string().min(1, 'Source path is required'),
	destination: z.string().min(1, 'Destination path is required'),
	overwrite: z.boolean().optional().default(false),
});

// ============================================================================
// Tool Execution
// ============================================================================

async function execute(input: z.infer<typeof inputSchema>): Promise<ToolResult> {
	const { source, destination, overwrite } = input;

	try {
		const fsModule = await import('fs-extra');
		const fs = fsModule.default || fsModule;

		// Check if source exists
		const sourceExists = await fs.pathExists(source);
		if (!sourceExists) {
			return {
				success: false,
				error: {
					code: 'FILE_NOT_FOUND',
					message: `Source file not found: ${source}`,
					details: { source },
				},
			};
		}

		// Check if destination exists (and handle overwrite)
		const destExists = await fs.pathExists(destination);
		if (destExists && !overwrite) {
			return {
				success: false,
				error: {
					code: 'CONFLICT',
					message: `Destination already exists: ${destination}. Set overwrite=true to replace.`,
					details: { source, destination },
				},
			};
		}

		// Move the file
		await fs.move(source, destination, { overwrite });

		return {
			success: true,
			data: {
				source,
				destination,
				overwritten: destExists && overwrite,
			},
		};
	} catch (error) {
		return {
			success: false,
			error: {
				code: 'MOVE_FILE_ERROR',
				message: (error as Error).message || 'Unknown error moving file',
				details: { source, destination },
			},
		};
	}
}

// ============================================================================
// Tool Definition
// ============================================================================

export const moveFileTool: ToolDefinition = {
	name: 'move_file',
	description: 'Move or rename a file. Supports overwrite protection.',
	category: 'file',
	inputSchema,
	permission: 'dangerous',
	execute,
} as ToolDefinition;
