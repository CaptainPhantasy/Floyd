/**
 * File Tools - Floyd Wrapper
 *
 * File operation tools copied from FLOYD_CLI and wrapped
 */

import { z } from 'zod';
import type { ToolDefinition } from '../../types.js';
import * as fileCore from './file-core.js';
import { sanitizeFilePath } from '../../utils/security.js';

// ============================================================================
// Read File Tool
// ============================================================================

export const readFileTool: ToolDefinition = {
	name: 'read_file',
	description: 'Read file contents from disk',
	category: 'file',
	inputSchema: z.object({
		file_path: z.string().min(1, 'File path is required'),
		offset: z.number().int().min(0, 'Offset must be non-negative').optional(),
		limit: z.number().int().positive('Limit must be positive').optional(),
	}),
	permission: 'none',
	execute: async (input) => {
		// Validate input using Zod schema
		const validationResult = readFileTool.inputSchema.safeParse(input);
		if (!validationResult.success) {
			const errors = validationResult.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
			return {
				success: false,
				error: {
					code: 'VALIDATION_ERROR',
					message: `Validation failed: ${errors}`,
					details: { errors }
				}
			};
		}

		const { file_path, offset, limit } = validationResult.data;

		// Sanitize file path to prevent path traversal attacks
		let resolvedPath: string;
		try {
			resolvedPath = sanitizeFilePath(file_path);
		} catch (error) {
			return {
				success: false,
				error: {
					code: 'PATH_TRAVERSAL_DETECTED',
					message: (error as Error).message,
					details: { file_path }
				}
			};
		}

		// Validate file exists and is a file
		const fsModule = await import('fs-extra');
		const fs = fsModule.default || fsModule;

		try {
			// Check if path exists
			const exists = await fs.pathExists(resolvedPath);
			if (!exists) {
				return {
					success: false,
					error: {
						code: 'FILE_NOT_FOUND',
						message: `File not found: ${file_path}`,
						details: { file_path }
					}
				};
			}

			// Check if it's a file (not a directory)
			const stat = await fs.stat(resolvedPath);
			if (!stat.isFile()) {
				return {
					success: false,
					error: {
						code: 'NOT_A_FILE',
						message: `Path is not a file: ${file_path}`,
						details: { file_path }
					}
				};
			}

			// Read file content
			const content = await fs.readFile(resolvedPath, 'utf-8');
			const lines = content.split('\n');
			const lineCount = lines.length;

			// Apply offset and limit
			let resultLines = lines;
			if (offset !== undefined) {
				resultLines = resultLines.slice(offset);
			}
			if (limit !== undefined) {
				resultLines = resultLines.slice(0, limit);
			}

			const resultContent = resultLines.join('\n');

			return {
				success: true,
				data: {
					content: resultContent,
					lineCount,
					file_path
				}
			};
		} catch (error) {
			return {
				success: false,
				error: {
					code: 'FILE_READ_ERROR',
					message: (error as Error).message || 'Unknown error reading file',
					details: { file_path }
				}
			};
		}
	}
} as ToolDefinition;

// ============================================================================
// Write Tool
// ============================================================================

export const writeTool: ToolDefinition = {
	name: 'write',
	description: 'Create or overwrite files',
	category: 'file',
	inputSchema: z.object({
		file_path: z.string().min(1, 'File path is required'),
		content: z.string(),
	}),
	permission: 'dangerous',
	execute: async (input) => {
		// Validate input using Zod schema
		const validationResult = writeTool.inputSchema.safeParse(input);
		if (!validationResult.success) {
			const errors = validationResult.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
			return {
				success: false,
				error: {
					code: 'VALIDATION_ERROR',
					message: `Validation failed: ${errors}`,
					details: { errors }
				}
			};
		}

		const { file_path, content } = validationResult.data;

		// Sanitize file path to prevent path traversal attacks
		let sanitizedPath: string;
		try {
			sanitizedPath = sanitizeFilePath(file_path);
		} catch (error) {
			return {
				success: false,
				error: {
					code: 'PATH_TRAVERSAL_DETECTED',
					message: (error as Error).message,
					details: { file_path }
				}
			};
		}

		const result = await fileCore.writeFile(sanitizedPath, content);

		if (result.success) {
			return {
				success: true,
				data: {
					file_path,
					bytes_written: result.bytesWritten
				}
			};
		}

		return {
			success: false,
			error: {
				code: 'FILE_WRITE_ERROR',
				message: result.error || 'Unknown error writing file',
				details: { file_path }
			}
		};
	}
} as ToolDefinition;

// ============================================================================
// Edit File Tool
// ============================================================================

export const editFileTool: ToolDefinition = {
	name: 'edit_file',
	description: 'Edit specific file sections using search/replace',
	category: 'file',
	inputSchema: z.object({
		file_path: z.string().min(1, 'File path is required'),
		old_string: z.string().min(1, 'Old string is required'),
		new_string: z.string(),
	}),
	permission: 'dangerous',
	execute: async (input) => {
		// Validate input using Zod schema
		const validationResult = editFileTool.inputSchema.safeParse(input);
		if (!validationResult.success) {
			const errors = validationResult.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
			return {
				success: false,
				error: {
					code: 'VALIDATION_ERROR',
					message: `Validation failed: ${errors}`,
					details: { errors }
				}
			};
		}

		const { file_path, old_string, new_string } = validationResult.data;
		const result = await fileCore.editFile(file_path, old_string, new_string);

		if (result.success) {
			return {
				success: true,
				data: {
					file_path,
					replacements: result.replacements
				}
			};
		}

		return {
			success: false,
			error: {
				code: 'FILE_EDIT_ERROR',
				message: result.error || 'Unknown error editing file',
				details: { file_path }
			}
		};
	}
} as ToolDefinition;

// ============================================================================
// Search Replace Tool
// ============================================================================

export const searchReplaceTool: ToolDefinition = {
	name: 'search_replace',
	description: 'Search and replace text in files (globally)',
	category: 'file',
	inputSchema: z.object({
		file_path: z.string().min(1, 'File path is required'),
		search_string: z.string().min(1, 'Search string is required'),
		replace_string: z.string(),
		replace_all: z.boolean().optional().default(false),
	}),
	permission: 'dangerous',
	execute: async (input) => {
		// Validate input using Zod schema
		const validationResult = searchReplaceTool.inputSchema.safeParse(input);
		if (!validationResult.success) {
			const errors = validationResult.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
			return {
				success: false,
				error: {
					code: 'VALIDATION_ERROR',
					message: `Validation failed: ${errors}`,
					details: { errors }
				}
			};
		}

		const { file_path, search_string, replace_string, replace_all } = validationResult.data;
		const result = await fileCore.searchReplace(file_path, search_string, replace_string, replace_all);

		if (result.success) {
			return {
				success: true,
				data: {
					file_path,
					replacements: result.replacements
				}
			};
		}

		return {
			success: false,
			error: {
				code: 'FILE_REPLACE_ERROR',
				message: result.error || 'Unknown error replacing text',
				details: { file_path }
			}
		};
	}
} as ToolDefinition;
