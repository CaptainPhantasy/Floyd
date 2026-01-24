/**
 * Search Core - Optimized for performance
 *
 * Uses native grep for large-scale searches to avoid JavaScript overhead
 */

import { globby } from 'globby';
import { execSync } from 'child_process';
import { toolRegistry } from '../tool-registry.js';

export async function grep(pattern: string, options: {
	path?: string;
	filePattern?: string;
	caseInsensitive?: boolean;
	outputMode?: 'content' | 'files_with_matches' | 'count';
}): Promise<{ success: boolean; matches?: Array<{ file: string; line: number; content: string; matchStart: number; matchEnd: number }>; totalMatches?: number; filesWithMatches?: number; error?: string }> {
	try {
		const { path: searchPath = '.', filePattern = '**/*', caseInsensitive = false, outputMode = 'content' } = options;
		
		// Get ignore patterns
		const ignorePatterns = toolRegistry.getIgnorePatterns();

		// Check if we should use native grep (faster for large searches)
		// Use native grep for filePattern operations and when outputMode allows it
		const shouldUseNativeGrep = filePattern.includes('*') || filePattern.includes('.');

		if (shouldUseNativeGrep) {
			try {
				// Build grep command
				const grepArgs = [];
				if (caseInsensitive) grepArgs.push('-i');
				if (outputMode === 'files_with_matches') grepArgs.push('-l');
				else if (outputMode === 'count') grepArgs.push('-c');
				else grepArgs.push('-n'); // Line numbers for content mode
				
				// Add recursive flag if searching a directory
				grepArgs.push('-r');
				
				// Add exclude patterns
				for (const ignore of ignorePatterns) {
					grepArgs.push(`--exclude="${ignore}"`);
					grepArgs.push(`--exclude-dir="${ignore}"`);
				}
				
				// Add default excludes
				grepArgs.push('--exclude-dir="node_modules"');
				grepArgs.push('--exclude-dir=".git"');
				grepArgs.push('--exclude-dir="dist"');

				// Build file pattern for grep
				let grepPattern = filePattern;
				if (filePattern === '**/*') {
					grepPattern = '.'; // Grep recursive on current dir
				} 
				
				// Execute grep
				// Note: using searchPath as cwd for the command to make relative paths work
				const cmd = `grep ${grepArgs.join(' ')} -- "${pattern.replace(/"/g, '\\"')}" ${grepPattern} 2>/dev/null || true`;
				const output = execSync(cmd, { 
					encoding: 'utf-8', 
					maxBuffer: 10 * 1024 * 1024,
					cwd: searchPath
				});

				if (outputMode === 'files_with_matches') {
					const files = output.trim().split('\n').filter(Boolean);
					return {
						success: true,
						matches: files.map(f => ({ file: f, line: 0, content: '', matchStart: 0, matchEnd: 0 })),
						totalMatches: files.length,
						filesWithMatches: files.length
					};
				} else if (outputMode === 'count') {
					const lines = output.trim().split('\n').filter(Boolean);
					let totalMatches = 0;
					const matches = lines.map(line => {
						const [file, count] = line.split(':');
						totalMatches += parseInt(count) || 0;
						return { file, line: 0, content: '', matchStart: 0, matchEnd: 0 };
					});
					return {
						success: true,
						matches,
						totalMatches,
						filesWithMatches: matches.length
					};
				} else {
					// Content mode - parse grep output
					const matches: Array<{ file: string; line: number; content: string; matchStart: number; matchEnd: number }> = [];
					const lines = output.trim().split('\n').filter(Boolean);

					for (const line of lines) {
						// Grep output format: file:line:content (or just file:content if no line numbers)
						// But we used -n so it should be file:line:content
						// Handle potential colons in filename (though unusual) or content
						const firstColon = line.indexOf(':');
						const secondColon = line.indexOf(':', firstColon + 1);
						
						if (firstColon > 0 && secondColon > 0) {
							const file = line.substring(0, firstColon);
							const lineNum = parseInt(line.substring(firstColon + 1, secondColon));
							const content = line.substring(secondColon + 1);
							
							const matchStart = content.toLowerCase().indexOf(pattern.toLowerCase());
							matches.push({
								file,
								line: isNaN(lineNum) ? 0 : lineNum,
								content: content.trim(),
								matchStart: matchStart >= 0 ? matchStart : 0,
								matchEnd: matchStart >= 0 ? matchStart + pattern.length : pattern.length
							});
						}
					}

					return {
						success: true,
						matches,
						totalMatches: matches.length,
						filesWithMatches: new Set(matches.map(m => m.file)).size
					};
				}
			} catch (grepError) {
				// If grep fails, fall back to JavaScript implementation
				console.warn('Native grep failed, falling back to JS implementation:', (grepError as Error).message);
			}
		}

		// Fallback: JavaScript-based grep (for specific file patterns or when grep fails)
		const files = await globby(filePattern, { 
			cwd: searchPath,
			ignore: [...ignorePatterns, 'node_modules', '.git', 'dist'] 
		});

		// Limit to 100 files to prevent performance issues
		const limitedFiles = files.slice(0, 100);

		if (files.length > 100) {
			console.warn(`Search limited to first 100 files (found ${files.length} total)`);
		}

		const matches: Array<{ file: string; line: number; content: string; matchStart: number; matchEnd: number }> = [];
		const regex = new RegExp(pattern, caseInsensitive ? 'gi' : 'g');

		for (const file of limitedFiles) {
			const fsModule = await import('fs-extra');
			const content = await fsModule.default.readFile(file, 'utf-8');
			const lines = content.split('\n');

			lines.forEach((line, i) => {
				const match = regex.exec(line);
				if (match) {
					matches.push({
						file,
						line: i + 1,
						content: line.trim(),
						matchStart: match.index || 0,
						matchEnd: (match.index || 0) + match[0].length
					});
				}
			});
		}

		return {
			success: true,
			matches,
			totalMatches: matches.length,
			filesWithMatches: new Set(matches.map(m => m.file)).size
		};
	} catch (error) {
		return { success: false, error: (error as Error).message };
	}
}

export async function codebaseSearch(query: string, options: {
	path?: string;
	maxResults?: number;
}): Promise<{ success: boolean; results?: Array<{ file: string; score: number; line: number; content: string; context: string }>; totalResults?: number; error?: string }> {
	try {
		const { path: searchPath = '.', maxResults = 20 } = options;
		const keywords = query.split(' ').filter(k => k.length > 2);
		
		const ignorePatterns = toolRegistry.getIgnorePatterns();
		const defaultIgnores = ['node_modules', 'dist', 'target', '.git'];
		
		const files = await globby('**/*.{ts,tsx,rs,js,md}', { 
			cwd: searchPath, 
			ignore: [...defaultIgnores, ...ignorePatterns] 
		});
		
		const results: Array<{ file: string; score: number; line: number; content: string; context: string }> = [];

		for (const file of files) {
			const fsModule = await import('fs-extra');
			const content = await fsModule.default.readFile(file, 'utf-8');
			const lines = content.split('\n');
			let score = 0;
			const matches: Array<{ line: number; content: string }> = [];

			if (file.toLowerCase().includes(query.toLowerCase())) score += 10;

			lines.forEach((line, i) => {
				if (keywords.some(k => line.toLowerCase().includes(k.toLowerCase()))) {
					score++;
					matches.push({ line: i + 1, content: line.trim() });
				}
			});

			if (score > 0) {
				results.push({
					file,
					score,
					...matches[0],
					context: matches.slice(0, 3).map(m => `[${m.line}] ${m.content}`).join('\n')
				});
			}
		}

		const sorted = results.sort((a, b) => b.score - a.score).slice(0, maxResults);

		return {
			success: true,
			results: sorted,
			totalResults: sorted.length
		};
	} catch (error) {
		return { success: false, error: (error as Error).message };
	}
}
