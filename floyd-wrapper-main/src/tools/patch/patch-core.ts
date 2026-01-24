/**
 * Patch Core - Copied from FLOYD_CLI
 *
 * Core patch functions from patch-server.ts
 */

import fs from 'fs-extra';
import path from 'path';
import { parsePatch, applyPatches } from 'diff';
import parseDiff from 'parse-diff';

export interface DiffHunk {
	oldStart: number;
	oldLines: number;
	newStart: number;
	newLines: number;
	content: string;
}

export interface DiffFile {
	path: string;
	oldPath?: string;
	status: 'added' | 'deleted' | 'modified' | 'renamed';
	hunks: DiffHunk[];
}

export interface RiskAssessment {
	riskLevel: 'low' | 'medium' | 'high';
	warnings: string[];
	isBinary: boolean;
	affectsMultipleFiles: boolean;
	totalChanges: number;
}

export function assessRisk(parsedDiff: DiffFile[]): RiskAssessment {
	const warnings: string[] = [];
	let riskLevel: 'low' | 'medium' | 'high' = 'low';
	let totalChanges = 0;

	for (const file of parsedDiff) {
		totalChanges += file.hunks.length;

		if (file.path.includes('.bin') || file.path.includes('.exe') || file.path.includes('.dll')) {
			riskLevel = 'high';
			warnings.push(`Binary file detected: ${file.path}`);
		}

		const sensitivePatterns = ['package-lock.json', 'yarn.lock', 'pnpm-lock.yaml', '.env', 'credentials', 'secret', 'private'];
		for (const pattern of sensitivePatterns) {
			if (file.path.toLowerCase().includes(pattern)) {
				riskLevel = 'high';
				warnings.push(`Sensitive file modification: ${file.path}`);
			}
		}

		for (const hunk of file.hunks) {
			if (hunk.oldLines > 50 || hunk.newLines > 50) {
				riskLevel = riskLevel === 'low' ? 'medium' : riskLevel;
				warnings.push(`Large hunk in ${file.path}: ${hunk.oldLines} -> ${hunk.newLines} lines`);
			}
		}

		if (file.status === 'deleted') {
			riskLevel = 'high';
			warnings.push(`File deletion: ${file.path}`);
		}
	}

	if (parsedDiff.length > 3 && riskLevel === 'low') {
		riskLevel = 'medium';
	}

	return {
		riskLevel,
		warnings,
		isBinary: warnings.some(w => w.includes('Binary')),
		affectsMultipleFiles: parsedDiff.length > 1,
		totalChanges,
	};
}

export function parseUnifiedDiff(diffText: string): DiffFile[] {
	const parsed = parseDiff(diffText);
	return parsed.map(file => ({
		path: file.to || file.from || '',
		oldPath: file.from !== file.to ? file.from : undefined,
		status: getDiffStatus(file),
		hunks: file.chunks.map(chunk => ({
			oldStart: chunk.oldStart,
			oldLines: chunk.oldLines,
			newStart: chunk.newStart,
			newLines: chunk.newLines,
			content: chunk.changes.map(c => c.content || c.type).join('\n'),
		})),
	}));
}

function getDiffStatus(file: any): DiffFile['status'] {
	if (file.to === '/dev/null') return 'deleted';
	if (file.from === '/dev/null') return 'added';
	if (file.from !== file.to) return 'renamed';
	return 'modified';
}

export async function applyUnifiedDiff(diffText: string, options: {
	dryRun?: boolean;
	rootPath?: string;
} = {}): Promise<{
	success: boolean;
	appliedFiles: string[];
	errors: string[];
	preview?: string[];
}> {
	const { dryRun = false, rootPath = process.cwd() } = options;
	const parsed = parseDiff(diffText);
	const appliedFiles: string[] = [];
	const errors: string[] = [];
	const preview: string[] = [];

	for (const file of parsed) {
		const filePath = path.resolve(rootPath, file.to || '');

		if (dryRun) {
			preview.push(`[DRY RUN] Would modify: ${filePath}`);
			continue;
		}

		try {
			await fs.ensureDir(path.dirname(filePath));
			let content = '';
			if (await fs.pathExists(filePath)) {
				content = await fs.readFile(filePath, 'utf-8');
			}

			const patches = parsePatch(diffText);
			applyPatches(patches, {
				loadFile: (_index, callback) => callback(null, content),
				patched: (_index, patchedContent) => { if (patchedContent) content = patchedContent; },
				complete: _err => {}
			});

			await fs.writeFile(filePath, content, 'utf-8');
			appliedFiles.push(filePath);
		} catch (error) {
			errors.push(`Error processing ${filePath}: ${(error as Error).message}`);
		}
	}

	return {
		success: errors.length === 0,
		appliedFiles,
		errors,
		...(dryRun && { preview })
	};
}

export async function editRange(filePath: string, startLine: number, endLine: number, newContent: string, options: {
	dryRun?: boolean;
	createBackup?: boolean;
} = {}): Promise<{
	success: boolean;
	originalLines?: string[];
	modifiedLines?: string[];
	error?: string;
}> {
	const { dryRun = false, createBackup = true } = options;

	try {
		const resolvedPath = path.resolve(filePath);
		if (!(await fs.pathExists(resolvedPath))) {
			return { success: false, error: `File not found: ${filePath}` };
		}

		const content = await fs.readFile(resolvedPath, 'utf-8');
		const lines = content.split('\n');

		if (startLine < 0 || endLine >= lines.length || startLine > endLine) {
			return { success: false, error: `Invalid line range: ${startLine}-${endLine} (file has ${lines.length} lines)` };
		}

		if (createBackup && !dryRun) {
			await fs.copy(resolvedPath, `${resolvedPath}.backup`, { overwrite: true });
		}

		const originalLines = lines.slice(startLine, endLine + 1);
		const newLines = newContent.split('\n');

		if (!dryRun) {
			lines.splice(startLine, endLine - startLine + 1, ...newLines);
			await fs.writeFile(resolvedPath, lines.join('\n'), 'utf-8');
		}

		return { success: true, originalLines, modifiedLines: newLines };
	} catch (error) {
		return { success: false, error: (error as Error).message };
	}
}

export async function insertAt(filePath: string, lineNumber: number, content: string, options: {
	dryRun?: boolean;
	createBackup?: boolean;
} = {}): Promise<{
	success: boolean;
	insertedLines?: string[];
	error?: string;
}> {
	const { dryRun = false, createBackup = true } = options;

	try {
		const resolvedPath = path.resolve(filePath);
		if (!(await fs.pathExists(resolvedPath))) {
			return { success: false, error: `File not found: ${filePath}` };
		}

		const fileContent = await fs.readFile(resolvedPath, 'utf-8');
		const lines = fileContent.split('\n');

		if (lineNumber < 0 || lineNumber > lines.length) {
			return { success: false, error: `Invalid line number: ${lineNumber} (file has ${lines.length} lines)` };
		}

		if (createBackup && !dryRun) {
			await fs.copy(resolvedPath, `${resolvedPath}.backup`, { overwrite: true });
		}

		const newLines = content.split('\n');

		if (!dryRun) {
			lines.splice(lineNumber, 0, ...newLines);
			await fs.writeFile(resolvedPath, lines.join('\n'), 'utf-8');
		}

		return { success: true, insertedLines: newLines };
	} catch (error) {
		return { success: false, error: (error as Error).message };
	}
}

export async function deleteRange(filePath: string, startLine: number, endLine: number, options: {
	dryRun?: boolean;
	createBackup?: boolean;
} = {}): Promise<{
	success: boolean;
	deletedLines?: string[];
	error?: string;
}> {
	const { dryRun = false, createBackup = true } = options;

	try {
		const resolvedPath = path.resolve(filePath);
		if (!(await fs.pathExists(resolvedPath))) {
			return { success: false, error: `File not found: ${filePath}` };
		}

		const content = await fs.readFile(resolvedPath, 'utf-8');
		const lines = content.split('\n');

		if (startLine < 0 || endLine >= lines.length || startLine > endLine) {
			return { success: false, error: `Invalid line range: ${startLine}-${endLine} (file has ${lines.length} lines)` };
		}

		if (createBackup && !dryRun) {
			await fs.copy(resolvedPath, `${resolvedPath}.backup`, { overwrite: true });
		}

		const deletedLines = lines.slice(startLine, endLine + 1);

		if (!dryRun) {
			lines.splice(startLine, endLine - startLine + 1);
			await fs.writeFile(resolvedPath, lines.join('\n'), 'utf-8');
		}

		return { success: true, deletedLines };
	} catch (error) {
		return { success: false, error: (error as Error).message };
	}
}
