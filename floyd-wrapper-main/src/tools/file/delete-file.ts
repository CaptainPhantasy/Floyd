/**
 * Delete File Tool - Floyd Wrapper
 *
 * Safely deletes files with optional backup
 * Tool #44 of 50
 */

import { z } from 'zod';
import type { ToolDefinition, ToolResult } from '../../types.js';

// ============================================================================
// Zod Schema
// ============================================================================

const inputSchema = z.object({
	file_path: z.string().min(1, 'File path is required'),
	create_backup: z.boolean().optional().default(true),
});

// ============================================================================
// Tool Execution
// ============================================================================

async function execute(input: z.infer<typeof inputSchema>): Promise<ToolResult> {
	const { file_path, create_backup } = input;

	try {
		const fsModule = await import('fs-extra');
		const fs = fsModule.default || fsModule;
		const pathModule = await import('node:path');

		// Check if file exists
		const exists = await fs.pathExists(file_path);
		if (!exists) {
			return {
				success: false,
				error: {
					code: 'FILE_NOT_FOUND',
					message: `File not found: ${file_path}`,
					details: { file_path },
				},
			};
		}

		// Check if it's a file (not directory)
		const stat = await fs.stat(file_path);
		if (stat.isDirectory()) {
			return {
				success: false,
				error: {
					code: 'IS_DIRECTORY',
					message: `Cannot delete directory with delete_file. Use delete_directory instead: ${file_path}`,
					details: { file_path },
				},
			};
		}

		// Create backup if requested
		let backupPath: string | undefined;
		if (create_backup) {
			const timestamp = Date.now();
			const ext = pathModule.extname(file_path);
			const base = pathModule.basename(file_path, ext);
			const dir = pathModule.dirname(file_path);
			backupPath = pathModule.join(dir, `${base}.${timestamp}.backup${ext}`);
			await fs.copy(file_path, backupPath);
		}

		// Delete the file
		await fs.remove(file_path);

		return {
			success: true,
			data: {
				deleted: file_path,
				backup_created: create_backup,
				backup_path: backupPath,
			},
		};
	} catch (error) {
		return {
			success: false,
			error: {
				code: 'DELETE_FILE_ERROR',
				message: (error as Error).message || 'Unknown error deleting file',
				details: { file_path },
			},
		};
	}
}

// ============================================================================
// Tool Definition
// ============================================================================

export const deleteFileTool: ToolDefinition = {
	name: 'delete_file',
	description: 'Safely delete a file with optional backup creation.',
	category: 'file',
	inputSchema,
	permission: 'dangerous',
	execute,
} as ToolDefinition;
