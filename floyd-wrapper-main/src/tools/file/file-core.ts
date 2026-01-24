/**
 * File Operations Core - Copied from FLOYD_CLI
 *
 * Core file operation functions from the MCP servers
 */

import fs from 'fs-extra';
import path from 'path';

export async function readFile(filePath: string): Promise<{ success: boolean; content?: string; error?: string }> {
	try {
		const resolved = path.resolve(filePath);
		const content = await fs.readFile(resolved, 'utf-8');
		return { success: true, content };
	} catch (error) {
		return { success: false, error: (error as Error).message };
	}
}

export async function writeFile(filePath: string, content: string): Promise<{ success: boolean; bytesWritten?: number; error?: string }> {
	try {
		const resolved = path.resolve(filePath);
		await fs.ensureDir(path.dirname(resolved));
		await fs.writeFile(resolved, content, 'utf-8');
		return { success: true, bytesWritten: content.length };
	} catch (error) {
		return { success: false, error: (error as Error).message };
	}
}

export async function editFile(filePath: string, oldString: string, newString: string): Promise<{ success: boolean; replacements: number; error?: string }> {
	try {
		const resolved = path.resolve(filePath);
		if (!(await fs.pathExists(resolved))) {
			return { success: false, replacements: 0, error: 'File not found' };
		}

		const content = await fs.readFile(resolved, 'utf-8');
		if (!content.includes(oldString)) {
			return { success: false, replacements: 0, error: 'String not found' };
		}

		const occurrences = (content.match(new RegExp(oldString.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length;
		if (occurrences > 1) {
			return { success: false, replacements: occurrences, error: 'Multiple matches found' };
		}

		const newContent = content.replace(oldString, newString);
		await fs.writeFile(resolved, newContent, 'utf-8');

		return { success: true, replacements: 1 };
	} catch (error) {
		return { success: false, replacements: 0, error: (error as Error).message };
	}
}

export async function searchReplace(filePath: string, searchString: string, replaceString: string, replaceAll = false): Promise<{ success: boolean; replacements: number; error?: string }> {
	try {
		const resolved = path.resolve(filePath);
		if (!(await fs.pathExists(resolved))) {
			return { success: false, replacements: 0, error: 'File not found' };
		}

		const content = await fs.readFile(resolved, 'utf-8');
		if (!content.includes(searchString)) {
			return { success: false, replacements: 0, error: 'String not found' };
		}

		let newContent: string;
		if (replaceAll) {
			newContent = content.split(searchString).join(replaceString);
		} else {
			newContent = content.replace(searchString, replaceString);
		}

		await fs.writeFile(resolved, newContent, 'utf-8');
		const replacements = replaceAll ? (content.match(new RegExp(searchString.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length : 1;

		return { success: true, replacements };
	} catch (error) {
		return { success: false, replacements: 0, error: (error as Error).message };
	}
}
