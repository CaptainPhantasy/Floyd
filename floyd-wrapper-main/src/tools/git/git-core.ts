/**
 * Git Core Functions - Copied from FLOYD_CLI
 *
 * These are the exact core functions from /Volumes/Storage/FLOYD_CLI/INK/floyd-cli/src/mcp/git-server.ts
 */

import { simpleGit, type SimpleGit } from 'simple-git';

export interface GitStatus {
	current: string;
	tracking: string | null;
	files: Array<{
		path: string;
		status: string;
		staged: boolean;
	}>;
	ahead: number;
	behind: number;
}

export interface GitCommit {
	hash: string;
	message: string;
	author: string;
	date: string;
	files?: string[];
}

export interface GitDiff {
	file: string;
	status: 'modified' | 'added' | 'deleted' | 'renamed';
	chunks: Array<{
		oldStart: number;
		oldLines: number;
		newStart: number;
		newLines: number;
		content: string;
	}>;
}

/**
 * Protected branch patterns that should trigger warnings
 */
const PROTECTED_BRANCH_PATTERNS = [
	'main',
	'master',
	'development',
	'develop',
	'production',
	'release',
];

/**
 * Get a git instance for a specific path
 */
export function getGitInstance(repoPath: string = process.cwd()): SimpleGit {
	return simpleGit({
		baseDir: repoPath,
		binary: 'git',
		maxConcurrentProcesses: 6,
	});
}

/**
 * Check if we're in a git repository
 */
export async function isGitRepository(
	repoPath: string = process.cwd(),
): Promise<boolean> {
	try {
		const git = getGitInstance(repoPath);
		await git.checkIsRepo();
		return true;
	} catch {
		return false;
	}
}

/**
 * Get the current git status
 */
export async function getGitStatus(
	repoPath: string = process.cwd(),
): Promise<GitStatus & {isRepo: boolean; error?: string}> {
	try {
		if (!(await isGitRepository(repoPath))) {
			return {
				isRepo: false,
				current: '',
				tracking: null,
				files: [],
				ahead: 0,
				behind: 0,
				error: 'Not a git repository',
			};
		}

		const git = getGitInstance(repoPath);
		const status = await git.status();

		return {
			isRepo: true,
			current: status.current || 'HEAD',
			tracking: status.tracking || null,
			ahead: status.ahead || 0,
			behind: status.behind || 0,
			files: status.files.map(f => {
				const working = (f as {working_dir?: string}).working_dir;
				return {
					path: f.path,
					status:
						!working || f.index === working ? f.index : `${f.index}/${working}`,
					staged: f.index !== '?',
				};
			}),
		};
	} catch (error) {
		return {
			isRepo: false,
			current: '',
			tracking: null,
			files: [],
			ahead: 0,
			behind: 0,
			error: (error as Error).message,
		};
	}
}

/**
 * Get git diff for files or working directory
 */
export async function getGitDiff(
	options: {
		repoPath?: string;
		files?: string[];
		staged?: boolean;
		cached?: boolean;
	} = {},
): Promise<GitDiff[] | {error: string}> {
	const {
		repoPath = process.cwd(),
		files,
		staged = false,
		cached = false,
	} = options;

	try {
		if (!(await isGitRepository(repoPath))) {
			return {error: 'Not a git repository'};
		}

		const git = getGitInstance(repoPath);
		const diffArgs: string[] = [];

		if (cached || staged) {
			diffArgs.push('--cached');
		}

		if (files && files.length > 0) {
			diffArgs.push('--', ...files);
		}

		const diffResult = await git.diff(diffArgs);
		const summaryResult = await git.diff([
			'--name-status',
			...(cached || staged ? ['--cached'] : []),
			...(files ? ['--', ...files] : []),
		]);

		// Parse the diff into structured format
		const diffs: GitDiff[] = [];

		// Parse summary for file status
		const summaryLines = summaryResult.split('\n').filter(Boolean);
		const fileStatuses = new Map<
			string,
			'modified' | 'added' | 'deleted' | 'renamed'
		>();

		for (const line of summaryLines) {
			const [status, ...filePathParts] = line.split('\t');
			const filePath = filePathParts.join('\t') || line.slice(2);

			if (!status || status.length === 0) continue;

			switch (status[0]) {
				case 'M':
					fileStatuses.set(filePath, 'modified');
					break;
				case 'A':
					fileStatuses.set(filePath, 'added');
					break;
				case 'D':
					fileStatuses.set(filePath, 'deleted');
					break;
				case 'R':
					fileStatuses.set(filePath, 'renamed');
					break;
			}
		}

		// Return diff text for each file
		for (const [filePath, status] of fileStatuses) {
			diffs.push({
				file: filePath,
				status,
				chunks: [], // Parsed chunks would require more complex parsing
			});
		}

		// Also include raw diff for full context
		if (diffResult) {
			diffs.push({
				file: '__raw__',
				status: 'modified',
				chunks: [
					{
						oldStart: 0,
						oldLines: 0,
						newStart: 0,
						newLines: 0,
						content: diffResult,
					},
				],
			});
		}

		return diffs;
	} catch (error) {
		return {error: (error as Error).message};
	}
}

/**
 * Get git log
 */
export async function getGitLog(
	options: {
		repoPath?: string;
		maxCount?: number;
		since?: string;
		until?: string;
		author?: string;
		file?: string;
	} = {},
): Promise<GitCommit[] | {error: string}> {
	const {
		repoPath = process.cwd(),
		maxCount = 20,
		since,
		until,
		author,
		file,
	} = options;

	try {
		if (!(await isGitRepository(repoPath))) {
			return {error: 'Not a git repository'};
		}

		const git = getGitInstance(repoPath);
		const logOptions: string[] = [
			`-n ${maxCount}`,
			'--pretty=format:%H|%an|%ai|%s',
		];

		if (since) logOptions.push(`--since=${since}`);
		if (until) logOptions.push(`--until=${until}`);
		if (author) logOptions.push(`--author=${author}`);
		if (file) logOptions.push('--', file);

		const logResult = await git.log(logOptions);

		return logResult.all.map(commit => ({
			hash: commit.hash,
			message: commit.message,
			author: commit.author_name,
			date: commit.date,
		}));
	} catch (error) {
		return {error: (error as Error).message};
	}
}

/**
 * Check if current branch is protected
 */
export function isProtectedBranch(branchName: string): boolean {
	const normalized = branchName.toLowerCase();
	return PROTECTED_BRANCH_PATTERNS.some(
		pattern => normalized === pattern || normalized.startsWith(`${pattern}/`),
	);
}

/**
 * Stage files for commit
 */
export async function stageFiles(
	files: string[],
	repoPath: string = process.cwd(),
): Promise<{success: boolean; staged: string[]; error?: string}> {
	try {
		if (!(await isGitRepository(repoPath))) {
			return {success: false, staged: [], error: 'Not a git repository'};
		}

		const git = getGitInstance(repoPath);

		if (files.length === 0) {
			// Stage all modified files
			await git.add('.');
		} else {
			await git.add(files);
		}

		return {success: true, staged: files.length > 0 ? files : ['all']};
	} catch (error) {
		return {success: false, staged: [], error: (error as Error).message};
	}
}

/**
 * Unstage files
 */
export async function unstageFiles(
	files: string[],
	repoPath: string = process.cwd(),
): Promise<{success: boolean; unstaged: string[]; error?: string}> {
	try {
		if (!(await isGitRepository(repoPath))) {
			return {success: false, unstaged: [], error: 'Not a git repository'};
		}

		const git = getGitInstance(repoPath);

		if (files.length === 0) {
			// Reset all staged files
			await git.reset();
		} else {
			await git.reset(files);
		}

		return {success: true, unstaged: files.length > 0 ? files : ['all']};
	} catch (error) {
		return {success: false, unstaged: [], error: (error as Error).message};
	}
}

/**
 * Create a commit
 */
export async function createCommit(
	message: string,
	options: {
		repoPath?: string;
		allowEmpty?: boolean;
		amend?: boolean;
		signoff?: boolean;
	} = {},
): Promise<{
	success: boolean;
	hash?: string;
	error?: string;
	warnings?: string[];
}> {
	const {
		repoPath = process.cwd(),
		allowEmpty = false,
		amend = false,
		signoff = false,
	} = options;
	const warnings: string[] = [];

	try {
		if (!(await isGitRepository(repoPath))) {
			return {success: false, error: 'Not a git repository'};
		}

		const git = getGitInstance(repoPath);
		const status = await getGitStatus(repoPath);

		// Warn if on protected branch
		if (isProtectedBranch(status.current)) {
			warnings.push(`Committing to protected branch: ${status.current}`);
		}

		// Warn if nothing to commit
		if (status.files.length === 0 && !allowEmpty) {
			warnings.push('No changes to commit');
			return {success: false, error: 'Nothing to commit', warnings};
		}

		// Build commit args
		const commitArgs: string[] = [];
		if (allowEmpty) commitArgs.push('--allow-empty');
		if (amend) {
			commitArgs.push('--amend');
			warnings.push('Amending previous commit');
		}
		if (signoff) commitArgs.push('--signoff');
		commitArgs.push('-m', message);

		const result = await git.commit(message, commitArgs);

		return {
			success: true,
			hash: result.commit || '',
			warnings,
		};
	} catch (error) {
		return {
			success: false,
			error: (error as Error).message,
			warnings,
		};
	}
}

/**
 * Get current branch
 */
export async function getCurrentBranch(
	repoPath: string = process.cwd(),
): Promise<{branch?: string; error?: string}> {
	try {
		if (!(await isGitRepository(repoPath))) {
			return {error: 'Not a git repository'};
		}

		const git = getGitInstance(repoPath);
		const status = await git.status();
		return {branch: status.current || 'HEAD'};
	} catch (error) {
		return {error: (error as Error).message};
	}
}

/**
 * List branches
 */
export async function listBranches(repoPath: string = process.cwd()): Promise<{
	branches: Array<{name: string; current: boolean; tracked?: string}>;
	error?: string;
}> {
	try {
		if (!(await isGitRepository(repoPath))) {
			return {branches: [], error: 'Not a git repository'};
		}

		const git = getGitInstance(repoPath);
		const branches = await git.branch();

		return {
			branches: branches.all.map(name => ({
				name,
				current: name === branches.current,
			})),
		};
	} catch (error) {
		return {branches: [], error: (error as Error).message};
	}
}
