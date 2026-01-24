/**
 * Security Utilities - Floyd Wrapper
 *
 * Input sanitization and security validation helpers
 */

import path from 'node:path';

/**
 * Sanitize a file path to prevent path traversal attacks
 *
 * @param filePath - The user-provided file path
 * @param allowedRoot - Optional root directory that the path must be within (defaults to current working directory)
 * @returns The sanitized, resolved path
 * @throws Error if the path attempts to traverse outside allowed directories
 */
export function sanitizeFilePath(filePath: string, allowedRoot: string = process.cwd()): string {
	// Resolve the absolute path
	const resolvedPath = path.resolve(filePath);

	// Normalize the allowed root path
	const normalizedAllowedRoot = path.resolve(allowedRoot);

	// Get the relative path from allowed root to the resolved path
	const relativePath = path.relative(normalizedAllowedRoot, resolvedPath);

	// Check if the relative path starts with '..' which would indicate path traversal
	if (relativePath.startsWith('..')) {
		throw new Error(
			`Path traversal detected: "${filePath}" attempts to access files outside the allowed directory`
		);
	}

	return resolvedPath;
}

/**
 * Validate that a path is safe and within allowed boundaries
 *
 * @param filePath - The file path to validate
 * @param allowedRoot - Optional root directory (defaults to current working directory)
 * @returns true if the path is safe
 * @throws Error if the path is unsafe
 */
export function validatePathSafety(filePath: string, allowedRoot: string = process.cwd()): boolean {
	const resolvedPath = path.resolve(filePath);
	const normalizedAllowedRoot = path.resolve(allowedRoot);

	// Check if resolved path starts with allowed root
	const resolvedNormalized = path.normalize(resolvedPath);
	const allowedNormalized = path.normalize(normalizedAllowedRoot);

	if (!resolvedNormalized.startsWith(allowedNormalized)) {
		throw new Error(
			`Path "${filePath}" is outside the allowed directory "${allowedRoot}"`
		);
	}

	return true;
}

/**
 * Sanitize a directory path to prevent directory traversal
 *
 * @param dirPath - The user-provided directory path
 * @param allowedRoot - Optional root directory (defaults to current working directory)
 * @returns The sanitized directory path
 */
export function sanitizeDirectoryPath(dirPath: string, allowedRoot: string = process.cwd()): string {
	return sanitizeFilePath(dirPath, allowedRoot);
}
