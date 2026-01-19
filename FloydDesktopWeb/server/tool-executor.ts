/**
 * Tool Executor - Desktop Commander compatible tool execution
 * Full file system, terminal, and code execution capabilities
 */

import fs from 'fs/promises';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import { glob } from 'glob';
import { ProcessManager } from './process-manager.js';

const execAsync = promisify(exec);

// Singleton process manager
const processManager = new ProcessManager();

export interface ToolResult {
  success: boolean;
  result?: any;
  error?: string;
}

export class ToolExecutor {
  private allowedPaths: string[] = [];
  private blockedCommands: string[] = ['rm -rf /', 'mkfs', 'dd if=', ':(){'];

  constructor(allowedPaths?: string[]) {
    this.allowedPaths = allowedPaths || [process.cwd(), process.env.HOME || '/'];
  }

  setAllowedPaths(paths: string[]) {
    this.allowedPaths = paths;
  }

  private isPathAllowed(targetPath: string): boolean {
    const resolved = path.resolve(targetPath);
    // Allow if within any allowed path
    return this.allowedPaths.some(allowed => 
      resolved.startsWith(path.resolve(allowed))
    );
  }

  private isCommandBlocked(command: string): boolean {
    return this.blockedCommands.some(blocked => 
      command.toLowerCase().includes(blocked.toLowerCase())
    );
  }

  async execute(toolName: string, args: Record<string, unknown>): Promise<ToolResult> {
    try {
      switch (toolName) {
        // File operations
        case 'read_file':
          return await this.readFile(args);
        case 'write_file':
          return await this.writeFile(args);
        case 'list_directory':
          return await this.listDirectory(args);
        case 'search_files':
          return await this.searchFiles(args);
        case 'create_directory':
          return await this.createDirectory(args);
        case 'delete_file':
          return await this.deleteFile(args);
        case 'move_file':
          return await this.moveFile(args);
        case 'get_file_info':
          return await this.getFileInfo(args);
        case 'edit_block':
          return await this.editBlock(args);
        
        // Command execution (simple)
        case 'execute_command':
          return await this.executeCommand(args);
        
        // Process/Session management (Desktop Commander style)
        case 'start_process':
          return await this.startProcess(args);
        case 'interact_with_process':
          return await this.interactWithProcess(args);
        case 'read_process_output':
          return await this.readProcessOutput(args);
        case 'force_terminate':
          return await this.forceTerminate(args);
        case 'list_sessions':
          return await this.listSessions();
        case 'list_processes':
          return await this.listProcesses();
        case 'kill_process':
          return await this.killProcess(args);
        
        // Code execution
        case 'execute_code':
          return await this.executeCode(args);
        
        default:
          return { success: false, error: `Unknown tool: ${toolName}` };
      }
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }

  private async readFile(args: Record<string, unknown>): Promise<ToolResult> {
    const filePath = args.path as string;
    const offset = (args.offset as number) || 0;
    const limit = (args.limit as number) || 1000;

    if (!this.isPathAllowed(filePath)) {
      return { success: false, error: `Access denied: ${filePath}` };
    }

    const content = await fs.readFile(filePath, 'utf-8');
    const lines = content.split('\n');
    
    let startLine = offset;
    if (offset < 0) {
      // Negative offset means from end
      startLine = Math.max(0, lines.length + offset);
    }
    
    const selectedLines = lines.slice(startLine, startLine + limit);
    const result = selectedLines.map((line, i) => `${startLine + i + 1}|${line}`).join('\n');
    
    return {
      success: true,
      result: {
        content: result,
        totalLines: lines.length,
        startLine: startLine + 1,
        endLine: Math.min(startLine + limit, lines.length),
      },
    };
  }

  private async writeFile(args: Record<string, unknown>): Promise<ToolResult> {
    const filePath = args.path as string;
    const content = args.content as string;
    const append = args.append as boolean;

    if (!this.isPathAllowed(filePath)) {
      return { success: false, error: `Access denied: ${filePath}` };
    }

    // Ensure directory exists
    await fs.mkdir(path.dirname(filePath), { recursive: true });

    if (append) {
      await fs.appendFile(filePath, content);
    } else {
      await fs.writeFile(filePath, content);
    }

    return { success: true, result: { path: filePath, bytesWritten: content.length } };
  }

  private async listDirectory(args: Record<string, unknown>): Promise<ToolResult> {
    const dirPath = args.path as string;

    if (!this.isPathAllowed(dirPath)) {
      return { success: false, error: `Access denied: ${dirPath}` };
    }

    const entries = await fs.readdir(dirPath, { withFileTypes: true });
    const result = await Promise.all(
      entries.map(async (entry) => {
        const fullPath = path.join(dirPath, entry.name);
        try {
          const stats = await fs.stat(fullPath);
          return {
            name: entry.name,
            type: entry.isDirectory() ? 'directory' : 'file',
            size: stats.size,
            modified: stats.mtime.toISOString(),
          };
        } catch {
          return {
            name: entry.name,
            type: entry.isDirectory() ? 'directory' : 'file',
          };
        }
      })
    );

    return { success: true, result };
  }

  private async searchFiles(args: Record<string, unknown>): Promise<ToolResult> {
    const searchPath = args.path as string;
    const pattern = args.pattern as string;
    const contentSearch = args.content as string;

    if (!this.isPathAllowed(searchPath)) {
      return { success: false, error: `Access denied: ${searchPath}` };
    }

    let files: string[] = [];
    
    if (pattern) {
      const globPattern = path.join(searchPath, '**', pattern);
      files = await glob(globPattern, { nodir: true });
    } else {
      files = await glob(path.join(searchPath, '**/*'), { nodir: true });
    }

    // Limit results
    files = files.slice(0, 100);

    // If content search specified, filter by content
    if (contentSearch) {
      const matches: Array<{ file: string; line: number; content: string }> = [];
      
      for (const file of files.slice(0, 50)) {
        try {
          const content = await fs.readFile(file, 'utf-8');
          const lines = content.split('\n');
          
          lines.forEach((line, i) => {
            if (line.includes(contentSearch)) {
              matches.push({
                file,
                line: i + 1,
                content: line.trim().slice(0, 200),
              });
            }
          });
        } catch {
          // Skip files that can't be read
        }
      }
      
      return { success: true, result: { matches: matches.slice(0, 50) } };
    }

    return { success: true, result: { files } };
  }

  private async executeCommand(args: Record<string, unknown>): Promise<ToolResult> {
    const command = args.command as string;
    const cwd = (args.cwd as string) || process.cwd();
    const timeout = (args.timeout as number) || 30000;

    if (this.isCommandBlocked(command)) {
      return { success: false, error: 'Command blocked for safety' };
    }

    if (!this.isPathAllowed(cwd)) {
      return { success: false, error: `Access denied: ${cwd}` };
    }

    try {
      const { stdout, stderr } = await execAsync(command, {
        cwd,
        timeout,
        maxBuffer: 10 * 1024 * 1024, // 10MB
      });

      return {
        success: true,
        result: {
          stdout: stdout.slice(0, 50000),
          stderr: stderr.slice(0, 10000),
          truncated: stdout.length > 50000,
        },
      };
    } catch (err: any) {
      return {
        success: false,
        error: err.message,
        result: {
          stdout: err.stdout?.slice(0, 10000),
          stderr: err.stderr?.slice(0, 10000),
          code: err.code,
        },
      };
    }
  }

  private async createDirectory(args: Record<string, unknown>): Promise<ToolResult> {
    const dirPath = args.path as string;

    if (!this.isPathAllowed(dirPath)) {
      return { success: false, error: `Access denied: ${dirPath}` };
    }

    await fs.mkdir(dirPath, { recursive: true });
    return { success: true, result: { path: dirPath } };
  }

  private async deleteFile(args: Record<string, unknown>): Promise<ToolResult> {
    const targetPath = args.path as string;

    if (!this.isPathAllowed(targetPath)) {
      return { success: false, error: `Access denied: ${targetPath}` };
    }

    const stats = await fs.stat(targetPath);
    if (stats.isDirectory()) {
      await fs.rm(targetPath, { recursive: true });
    } else {
      await fs.unlink(targetPath);
    }

    return { success: true, result: { deleted: targetPath } };
  }

  private async moveFile(args: Record<string, unknown>): Promise<ToolResult> {
    const source = args.source as string;
    const destination = args.destination as string;

    if (!this.isPathAllowed(source) || !this.isPathAllowed(destination)) {
      return { success: false, error: 'Access denied' };
    }

    await fs.rename(source, destination);
    return { success: true, result: { from: source, to: destination } };
  }

  private async getFileInfo(args: Record<string, unknown>): Promise<ToolResult> {
    const filePath = args.path as string;

    if (!this.isPathAllowed(filePath)) {
      return { success: false, error: `Access denied: ${filePath}` };
    }

    const stats = await fs.stat(filePath);
    return {
      success: true,
      result: {
        path: filePath,
        type: stats.isDirectory() ? 'directory' : 'file',
        size: stats.size,
        created: stats.birthtime.toISOString(),
        modified: stats.mtime.toISOString(),
        accessed: stats.atime.toISOString(),
        permissions: stats.mode.toString(8),
        isSymlink: stats.isSymbolicLink(),
      },
    };
  }

  /**
   * Edit block - Desktop Commander style search/replace
   * Supports format:
   * <<<<<<< SEARCH
   * old content
   * =======
   * new content
   * >>>>>>> REPLACE
   */
  private async editBlock(args: Record<string, unknown>): Promise<ToolResult> {
    const filePath = args.path as string;
    const searchContent = args.search as string;
    const replaceContent = args.replace as string;
    const expectedReplacements = (args.expected_replacements as number) || 1;

    if (!this.isPathAllowed(filePath)) {
      return { success: false, error: `Access denied: ${filePath}` };
    }

    let content: string;
    try {
      content = await fs.readFile(filePath, 'utf-8');
    } catch {
      return { success: false, error: `File not found: ${filePath}` };
    }

    // Count occurrences
    const regex = new RegExp(this.escapeRegex(searchContent), 'g');
    const matches = content.match(regex);
    const occurrences = matches ? matches.length : 0;

    if (occurrences === 0) {
      // Fuzzy search fallback
      const lines = content.split('\n');
      const searchLines = searchContent.split('\n');
      let bestMatch = { similarity: 0, lineNumber: -1, text: '' };

      for (let i = 0; i <= lines.length - searchLines.length; i++) {
        const block = lines.slice(i, i + searchLines.length).join('\n');
        const similarity = this.calculateSimilarity(searchContent, block);
        if (similarity > bestMatch.similarity) {
          bestMatch = { similarity, lineNumber: i + 1, text: block };
        }
      }

      if (bestMatch.similarity > 0.7) {
        return {
          success: false,
          error: `Exact match not found. Best match (${Math.round(bestMatch.similarity * 100)}% similar) at line ${bestMatch.lineNumber}:\n${bestMatch.text.slice(0, 200)}...`,
        };
      }
      return { success: false, error: 'Search content not found in file' };
    }

    if (occurrences !== expectedReplacements && expectedReplacements !== -1) {
      return {
        success: false,
        error: `Found ${occurrences} occurrences, expected ${expectedReplacements}. Use expected_replacements: -1 to replace all.`,
      };
    }

    // Perform replacement
    const newContent = expectedReplacements === -1
      ? content.replace(regex, replaceContent)
      : content.replace(searchContent, replaceContent);

    await fs.writeFile(filePath, newContent);

    return {
      success: true,
      result: {
        path: filePath,
        replacements: expectedReplacements === -1 ? occurrences : 1,
      },
    };
  }

  private escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  private calculateSimilarity(a: string, b: string): number {
    if (a === b) return 1;
    if (!a || !b) return 0;
    
    const longer = a.length > b.length ? a : b;
    const shorter = a.length > b.length ? b : a;
    
    if (longer.length === 0) return 1;
    
    const costs: number[] = [];
    for (let i = 0; i <= shorter.length; i++) {
      let lastValue = i;
      for (let j = 0; j <= longer.length; j++) {
        if (i === 0) {
          costs[j] = j;
        } else if (j > 0) {
          let newValue = costs[j - 1];
          if (shorter.charAt(i - 1) !== longer.charAt(j - 1)) {
            newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
          }
          costs[j - 1] = lastValue;
          lastValue = newValue;
        }
      }
      if (i > 0) costs[longer.length] = lastValue;
    }
    
    return (longer.length - costs[longer.length]) / longer.length;
  }

  // Process management methods
  private async startProcess(args: Record<string, unknown>): Promise<ToolResult> {
    const command = args.command as string;
    const cwd = args.cwd as string | undefined;
    const shell = args.shell as string | undefined;
    const timeout = args.timeout as number | undefined;

    if (this.isCommandBlocked(command)) {
      return { success: false, error: 'Command blocked for safety' };
    }

    if (cwd && !this.isPathAllowed(cwd)) {
      return { success: false, error: `Access denied: ${cwd}` };
    }

    const result = await processManager.startProcess({ command, cwd, shell, timeout });
    return { success: true, result };
  }

  private async interactWithProcess(args: Record<string, unknown>): Promise<ToolResult> {
    const sessionId = args.session_id as string;
    const input = args.input as string;

    const result = await processManager.interactWithProcess(sessionId, input);
    return { success: result.success, result };
  }

  private async readProcessOutput(args: Record<string, unknown>): Promise<ToolResult> {
    const sessionId = args.session_id as string;
    const lines = args.lines as number | undefined;

    const result = processManager.readProcessOutput(sessionId, lines);
    return { success: true, result };
  }

  private async forceTerminate(args: Record<string, unknown>): Promise<ToolResult> {
    const sessionId = args.session_id as string;
    const result = processManager.forceTerminate(sessionId);
    return { success: result.success, result };
  }

  private async listSessions(): Promise<ToolResult> {
    const sessions = processManager.listSessions();
    return { success: true, result: { sessions } };
  }

  private async listProcesses(): Promise<ToolResult> {
    const processes = await processManager.listProcesses();
    return { success: true, result: { processes } };
  }

  private async killProcess(args: Record<string, unknown>): Promise<ToolResult> {
    const pid = args.pid as number;
    const result = await processManager.killProcess(pid);
    return { success: result.success, result };
  }

  private async executeCode(args: Record<string, unknown>): Promise<ToolResult> {
    const language = args.language as 'python' | 'node' | 'bash';
    const code = args.code as string;
    const timeout = args.timeout as number | undefined;

    const result = await processManager.executeCode({ language, code, timeout });
    return { success: result.success, result };
  }
}
