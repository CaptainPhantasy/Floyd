/**
 * List Directory Tool - Floyd Wrapper
 *
 * Lists files and directories at a given path
 * Tool #43 of 50
 */

import { z } from 'zod';
import type { ToolDefinition, ToolResult } from '../../types.js';

// ============================================================================
// Zod Schema
// ============================================================================

const inputSchema = z.object({
	path: z.string().default('.'),
	recursive: z.boolean().optional().default(false),
	include_hidden: z.boolean().optional().default(false),
	file_pattern: z.string().optional(),
});

// ============================================================================
// Tool Execution
// ============================================================================

async function execute(input: z.infer<typeof inputSchema>): Promise<ToolResult> {
	const { path, recursive, include_hidden, file_pattern } = input;

	try {
		const fsModule = await import('fs-extra');
		const fs = fsModule.default || fsModule;
		const pathModule = await import('node:path');

		// Check if path exists
		const exists = await fs.pathExists(path);
		if (!exists) {
			return {
				success: false,
				error: {
					code: 'NOT_FOUND',
					message: `Directory not found: ${path}`,
					details: { path },
				},
			};
		}

		// Check if it's a directory
		const stat = await fs.stat(path);
		if (!stat.isDirectory()) {
			return {
				success: false,
				error: {
					code: 'NOT_A_DIRECTORY',
					message: `Path is not a directory: ${path}`,
					details: { path },
				},
			};
		}

		// List directory contents
		const entries: Array<{ name: string; type: 'file' | 'directory'; path: string; size?: number }> = [];

		async function listDir(dirPath: string, depth: number = 0): Promise<void> {
			const items = await fs.readdir(dirPath);

			for (const item of items) {
				// Skip hidden files unless requested
				if (!include_hidden && item.startsWith('.')) {
					continue;
				}

				// Apply file pattern filter if specified
				if (file_pattern) {
					const regex = new RegExp(file_pattern.replace(/\*/g, '.*'));
					if (!regex.test(item)) {
						continue;
					}
				}

				const itemPath = pathModule.join(dirPath, item);
				const itemStat = await fs.stat(itemPath);
				const relativePath = pathModule.relative(path, itemPath);

				if (itemStat.isDirectory()) {
					entries.push({
						name: item,
						type: 'directory',
						path: relativePath,
					});

					// Recurse if requested
					if (recursive) {
						await listDir(itemPath, depth + 1);
					}
				} else {
					entries.push({
						name: item,
						type: 'file',
						path: relativePath,
						size: itemStat.size,
					});
				}
			}
		}

		await listDir(path);

		return {
			success: true,
			data: {
				path,
				entry_count: entries.length,
				entries,
			},
		};
	} catch (error) {
		return {
			success: false,
			error: {
				code: 'LIST_DIRECTORY_ERROR',
				message: (error as Error).message || 'Unknown error listing directory',
				details: { path },
			},
		};
	}
}

// ============================================================================
// Tool Definition
// ============================================================================

export const listDirectoryTool: ToolDefinition = {
	name: 'list_directory',
	description: 'List files and directories at a given path. Supports recursive listing and pattern filtering.',
	category: 'file',
	inputSchema,
	permission: 'none',
	execute,
} as ToolDefinition;
