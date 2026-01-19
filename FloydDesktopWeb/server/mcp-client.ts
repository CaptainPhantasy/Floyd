/**
 * MCP Client - Connects to MCP servers like Desktop Commander
 */

import { spawn, ChildProcess } from 'child_process';
import { EventEmitter } from 'events';

interface MCPTool {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
}

interface MCPServerConfig {
  name: string;
  command: string;
  args?: string[];
  env?: Record<string, string>;
}

export class MCPClient extends EventEmitter {
  private process: ChildProcess | null = null;
  private tools: MCPTool[] = [];
  private requestId = 0;
  private pendingRequests: Map<number, { resolve: Function; reject: Function }> = new Map();
  private buffer = '';
  public connected = false;
  public serverName: string;

  constructor(private config: MCPServerConfig) {
    super();
    this.serverName = config.name;
  }

  async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.process = spawn(this.config.command, this.config.args || [], {
          stdio: ['pipe', 'pipe', 'pipe'],
          env: { ...process.env, ...this.config.env },
        });

        this.process.stdout?.on('data', (data) => {
          this.handleData(data.toString());
        });

        this.process.stderr?.on('data', (data) => {
          console.error(`[MCP ${this.serverName}] stderr:`, data.toString());
        });

        this.process.on('error', (err) => {
          console.error(`[MCP ${this.serverName}] error:`, err);
          this.connected = false;
          reject(err);
        });

        this.process.on('close', (code) => {
          console.log(`[MCP ${this.serverName}] closed with code ${code}`);
          this.connected = false;
        });

        // Initialize connection
        setTimeout(async () => {
          try {
            await this.initialize();
            this.connected = true;
            resolve();
          } catch (err) {
            reject(err);
          }
        }, 500);
      } catch (err) {
        reject(err);
      }
    });
  }

  private handleData(data: string) {
    this.buffer += data;
    const lines = this.buffer.split('\n');
    this.buffer = lines.pop() || '';

    for (const line of lines) {
      if (!line.trim()) continue;
      try {
        const message = JSON.parse(line);
        this.handleMessage(message);
      } catch {
        // Not JSON, ignore
      }
    }
  }

  private handleMessage(message: any) {
    if (message.id !== undefined && this.pendingRequests.has(message.id)) {
      const { resolve, reject } = this.pendingRequests.get(message.id)!;
      this.pendingRequests.delete(message.id);
      
      if (message.error) {
        reject(new Error(message.error.message || 'MCP error'));
      } else {
        resolve(message.result);
      }
    }
  }

  private sendRequest(method: string, params?: any): Promise<any> {
    return new Promise((resolve, reject) => {
      const id = ++this.requestId;
      const request = {
        jsonrpc: '2.0',
        id,
        method,
        params,
      };

      this.pendingRequests.set(id, { resolve, reject });
      this.process?.stdin?.write(JSON.stringify(request) + '\n');

      // Timeout after 30s
      setTimeout(() => {
        if (this.pendingRequests.has(id)) {
          this.pendingRequests.delete(id);
          reject(new Error('MCP request timeout'));
        }
      }, 30000);
    });
  }

  private async initialize(): Promise<void> {
    await this.sendRequest('initialize', {
      protocolVersion: '2024-11-05',
      capabilities: {},
      clientInfo: {
        name: 'floyd-desktop',
        version: '0.1.0',
      },
    });

    // Get available tools
    const result = await this.sendRequest('tools/list');
    this.tools = result.tools || [];
    console.log(`[MCP ${this.serverName}] Connected with ${this.tools.length} tools`);
  }

  async listTools(): Promise<MCPTool[]> {
    return this.tools;
  }

  async callTool(name: string, args: Record<string, unknown>): Promise<any> {
    const result = await this.sendRequest('tools/call', {
      name,
      arguments: args,
    });
    return result;
  }

  disconnect() {
    if (this.process) {
      this.process.kill();
      this.process = null;
    }
    this.connected = false;
  }
}

// Built-in tools - Desktop Commander compatible
export const BUILTIN_TOOLS = [
  // === FILE SYSTEM TOOLS ===
  {
    name: 'read_file',
    description: 'Read contents of a file with optional line-based pagination. Supports negative offset to read from end of file (like tail).',
    inputSchema: {
      type: 'object',
      properties: {
        path: { type: 'string', description: 'File path to read' },
        offset: { type: 'number', description: 'Line offset (negative reads from end like tail -n)' },
        limit: { type: 'number', description: 'Maximum lines to read (default 1000)' },
      },
      required: ['path'],
    },
  },
  {
    name: 'write_file',
    description: 'Write contents to a file. Creates parent directories if needed.',
    inputSchema: {
      type: 'object',
      properties: {
        path: { type: 'string', description: 'File path to write' },
        content: { type: 'string', description: 'Content to write' },
        append: { type: 'boolean', description: 'Append instead of overwrite' },
      },
      required: ['path', 'content'],
    },
  },
  {
    name: 'list_directory',
    description: 'Get detailed listing of files and directories with size and modification time.',
    inputSchema: {
      type: 'object',
      properties: {
        path: { type: 'string', description: 'Directory path' },
      },
      required: ['path'],
    },
  },
  {
    name: 'search_files',
    description: 'Search for files by name pattern and/or content. Uses glob patterns.',
    inputSchema: {
      type: 'object',
      properties: {
        path: { type: 'string', description: 'Directory to search in' },
        pattern: { type: 'string', description: 'Glob pattern for file names (e.g., "*.ts", "**/*.json")' },
        content: { type: 'string', description: 'Search for this text within files' },
      },
      required: ['path'],
    },
  },
  {
    name: 'create_directory',
    description: 'Create a new directory or ensure it exists (mkdir -p).',
    inputSchema: {
      type: 'object',
      properties: {
        path: { type: 'string', description: 'Directory path to create' },
      },
      required: ['path'],
    },
  },
  {
    name: 'delete_file',
    description: 'Delete a file or directory (recursive for directories).',
    inputSchema: {
      type: 'object',
      properties: {
        path: { type: 'string', description: 'Path to delete' },
      },
      required: ['path'],
    },
  },
  {
    name: 'move_file',
    description: 'Move or rename a file/directory.',
    inputSchema: {
      type: 'object',
      properties: {
        source: { type: 'string', description: 'Source path' },
        destination: { type: 'string', description: 'Destination path' },
      },
      required: ['source', 'destination'],
    },
  },
  {
    name: 'get_file_info',
    description: 'Get detailed metadata about a file or directory.',
    inputSchema: {
      type: 'object',
      properties: {
        path: { type: 'string', description: 'File or directory path' },
      },
      required: ['path'],
    },
  },
  {
    name: 'edit_block',
    description: 'Apply surgical text replacement in a file. Use for small, focused edits. Supports fuzzy matching fallback.',
    inputSchema: {
      type: 'object',
      properties: {
        path: { type: 'string', description: 'File path to edit' },
        search: { type: 'string', description: 'Exact text to find and replace' },
        replace: { type: 'string', description: 'New text to insert' },
        expected_replacements: { type: 'number', description: 'Expected number of replacements (default 1, use -1 for all)' },
      },
      required: ['path', 'search', 'replace'],
    },
  },

  // === COMMAND EXECUTION ===
  {
    name: 'execute_command',
    description: 'Execute a shell command and wait for completion. For long-running commands, use start_process instead.',
    inputSchema: {
      type: 'object',
      properties: {
        command: { type: 'string', description: 'Command to execute' },
        cwd: { type: 'string', description: 'Working directory' },
        timeout: { type: 'number', description: 'Timeout in milliseconds (default 30000)' },
      },
      required: ['command'],
    },
  },

  // === PROCESS/SESSION MANAGEMENT ===
  {
    name: 'start_process',
    description: 'Start a long-running process (SSH, database, dev server, etc.) and return a session ID for interaction.',
    inputSchema: {
      type: 'object',
      properties: {
        command: { type: 'string', description: 'Command to start' },
        cwd: { type: 'string', description: 'Working directory' },
        shell: { type: 'string', description: 'Shell to use (default: bash)' },
        timeout: { type: 'number', description: 'Initial output wait timeout in ms' },
      },
      required: ['command'],
    },
  },
  {
    name: 'interact_with_process',
    description: 'Send input to a running process/session and get the response.',
    inputSchema: {
      type: 'object',
      properties: {
        session_id: { type: 'string', description: 'Session ID from start_process' },
        input: { type: 'string', description: 'Input to send to the process' },
      },
      required: ['session_id', 'input'],
    },
  },
  {
    name: 'read_process_output',
    description: 'Read output from a running process without sending input.',
    inputSchema: {
      type: 'object',
      properties: {
        session_id: { type: 'string', description: 'Session ID from start_process' },
        lines: { type: 'number', description: 'Number of lines to read (default: all)' },
      },
      required: ['session_id'],
    },
  },
  {
    name: 'force_terminate',
    description: 'Force terminate a running process/session.',
    inputSchema: {
      type: 'object',
      properties: {
        session_id: { type: 'string', description: 'Session ID to terminate' },
      },
      required: ['session_id'],
    },
  },
  {
    name: 'list_sessions',
    description: 'List all active terminal sessions.',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'list_processes',
    description: 'List all running system processes with CPU/memory info.',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'kill_process',
    description: 'Terminate a running process by PID.',
    inputSchema: {
      type: 'object',
      properties: {
        pid: { type: 'number', description: 'Process ID to terminate' },
      },
      required: ['pid'],
    },
  },

  // === CODE EXECUTION ===
  {
    name: 'execute_code',
    description: 'Execute code in memory without saving to a file. Supports Python, Node.js, and Bash.',
    inputSchema: {
      type: 'object',
      properties: {
        language: { type: 'string', enum: ['python', 'node', 'bash'], description: 'Programming language' },
        code: { type: 'string', description: 'Code to execute' },
        timeout: { type: 'number', description: 'Timeout in milliseconds (default 30000)' },
      },
      required: ['language', 'code'],
    },
  },
];
