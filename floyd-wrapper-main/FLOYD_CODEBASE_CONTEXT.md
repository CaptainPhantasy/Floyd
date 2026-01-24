# FLOYD CODEBASE CONTEXT

**Generated:** 2026-01-23  
**Version:** 0.1.0  
**Purpose:** Complete working knowledge of the Floyd Wrapper system

---

## TABLE OF CONTENTS

1. [File Tree Structure](#file-tree-structure)
2. [Dependency Context](#dependency-context)
3. [Source Code Dump](#source-code-dump)
4. [Architecture Summary](#architecture-summary)

---

## FILE TREE STRUCTURE

```
src/
├── agent/
│   └── execution-engine.ts       # Main agentic loop with turn limiting
├── branding/                     # (Empty directory)
├── cache/                        # (Empty directory)
├── cli.ts                        # CLI bootstrap with meow + readline
├── constants.ts                  # Default config, system prompts, branding
├── index.ts                      # Main API exports
├── llm/
│   └── glm-client.ts             # GLM-4.7 API client with SSE streaming
├── permissions/
│   └── permission-manager.ts     # Permission requests with CLI prompts
├── prompts/                      # (Empty - prompt template directories)
├── streaming/
│   └── stream-handler.ts         # Event emitter for stream processing
├── tools/
│   ├── browser/
│   │   └── index.ts              # Browser automation (WebSocket client)
│   ├── build/
│   │   ├── build-core.ts         # Project detection + build/test runners
│   │   └── index.ts              # Build tool wrappers
│   ├── cache/
│   │   ├── cache-core.ts         # CacheManager with 3-tier SUPERCACHE
│   │   └── index.ts              # Cache tool wrappers
│   ├── docs.ts                   # Tool documentation generator
│   ├── file/
│   │   ├── file-core.ts          # Core file operations
│   │   └── index.ts              # File tool wrappers
│   ├── git/
│   │   ├── branch.ts             # Git branch tool
│   │   ├── commit.ts             # Git commit tool
│   │   ├── diff.ts               # Git diff tool
│   │   ├── git-core.ts           # Core git functions
│   │   ├── is-protected.ts       # Protected branch check
│   │   ├── log.ts                # Git log tool
│   │   ├── stage.ts              # Git stage tool
│   │   ├── status.ts             # Git status tool
│   │   └── unstage.ts            # Git unstage tool
│   ├── index.ts                  # Tool registry + registration
│   ├── patch/
│   │   ├── index.ts              # Patch tool wrappers
│   │   └── patch-core.ts         # Diff parsing + patch application
│   ├── search/
│   │   ├── index.ts              # Search tool wrappers
│   │   └── search-core.ts        # Grep + codebase search
│   ├── system/
│   │   └── index.ts              # System tools (run, ask_user)
│   └── tool-registry.ts          # Central tool registry
├── types.ts                      # TypeScript interfaces
├── ui/
│   ├── history.ts                # Conversation history display
│   ├── rendering.ts              # StreamingDisplay with log-update
│   └── terminal.ts               # FloydTerminal with CRUSH branding
├── utils/
│   ├── config.ts                 # Configuration loader with Zod
│   ├── errors.ts                 # Custom error classes
│   ├── logger.ts                 # FloydLogger with level filtering
│   └── security.ts               # Path sanitization
└── whimsy/
    └── floyd-spinners.ts         # Pink Floyd themed spinners
```

---

## DEPENDENCY CONTEXT

### package.json

{
  "name": "@cursem/floyd-wrapper",
  "version": "0.1.0",
  "description": "File-Logged Orchestrator Yielding Deliverables - AI Development Companion",
  "main": "dist/index.js",
  "bin": {
    "floyd": "./dist/cli.js"
  },
  "type": "module",
  "scripts": {
    "dev": "tsx watch src/cli.ts",
    "build": "tsc || true && tsc-alias && find dist -name '*.js' -exec sed -i '' \"s/from '\\([^']*\\)\\.ts'/from '\\1.js'/g\" {} + && find dist -name '*.js' -exec sed -i '' 's/from \"\\([^\"]*\\)\\.ts\"/from \"\\1.js\"/g' {} + && find dist -name '*.js' -exec sed -i '' \"s/import('\\([^']*\\)\\.ts'/import('\\1.js'/g\" {} +",
    "start": "node dist/cli.js",
    "test": "npm run test:unit && npm run test:integration",
    "test:unit": "ava tests/unit/**/*.test.ts --exit",
    "test:integration": "ava tests/integration/**/*.test.ts --exit",
    "test:coverage": "c8 npm test",
    "lint": "eslint src --ext .ts",
    "format": "prettier --write \"src/**/*.ts\"",
    "typecheck": "tsc --noEmit",
    "clean": "rm -rf dist .floyd",
    "precommit": "npm run typecheck && npm run lint",
    "install:legacy": "npm install --legacy-peer-deps",
    "install:ci": "npm ci --legacy-peer-deps",
    "validate": "npm run typecheck && npm run test",
    "validate:env": "bash build-automation/scripts/validate-environment.sh",
    "validate:install": "bash build-automation/scripts/validate-installation.sh",
    "install:deps": "bash build-automation/scripts/install-dependencies.sh",
    "validate:api": "bash build-automation/scripts/validate-glm-api.sh",
    "build:continue": "bash build-automation/continue-build.sh",
    "build:watch": "bash build-automation/restart-build.sh",
    "docs:generate": "tsx scripts/generate-docs.ts",
    "docs:tools": "npm run docs:generate"
  },
  "dependencies": {
    "@anthropic-ai/sdk": "^0.71.2",
    "chalk": "^5.3.0",
    "cli-progress": "^3.12.0",
    "cli-spinners": "^2.9.2",
    "cli-table3": "^0.6.3",
    "dotenv": "^16.3.1",
    "execa": "^8.0.1",
    "fs-extra": "^11.2.0",
    "globby": "^14.0.0",
    "inquirer": "^9.2.11",
    "log-update": "^6.0.0",
    "meow": "^12.1.0",
    "ora": "^8.0.1",
    "p-queue": "^8.0.1",
    "p-timeout": "^6.1.2",
    "signal-exit": "^4.1.0",
    "terminal-link": "^3.0.0",
    "zod": "^3.22.4"
  },
  "devDependencies": {
    "@ava/typescript": "^6.0.0",
    "@types/cli-progress": "^3.11.6",
    "@types/diff": "^7.0.2",
    "@types/estree": "^1.0.8",
    "@types/fs-extra": "^11.0.4",
    "@types/inquirer": "^9.0.9",
    "@types/istanbul-lib-coverage": "^2.0.6",
    "@types/json-schema": "^7.0.15",
    "@types/jsonfile": "^6.1.4",
    "@types/node": "^20.11.0",
    "@types/normalize-package-data": "^2.4.4",
    "@types/semver": "^7.7.1",
    "@types/sinon": "^17.0.3",
    "@types/through": "^0.0.33",
    "@types/ws": "^8.18.1",
    "@typescript-eslint/eslint-plugin": "^6.19.0",
    "@typescript-eslint/parser": "^6.19.0",
    "ava": "^6.1.0",
    "c8": "^9.0.0",
    "diff": "^8.0.3",
    "eslint": "^8.56.0",
    "parse-diff": "^0.11.1",
    "prettier": "^3.2.4",
    "simple-git": "^3.30.0",
    "sinon": "^18.0.0",
    "tsc-alias": "^1.8.8",
    "tsx": "^4.7.0",
    "typescript": "^5.3.3"
  },
  "engines": {
    "node": ">=20.0.0 <21.0.0",
    "npm": ">=10.0.0"
  },
  "tsx": {
    "include": [
      "src/**/*.ts"
    ]
  },
  "overrides": {
    "semver": "^7.5.4",
    "word-wrap": "^1.2.5"
  },
  "keywords": [
    "ai",
    "cli",
    "developer-tools",
    "glm",
    "agent"
  ],
  "author": "CURSEM <dev@cursem.com>",
  "license": "PROPRIETARY"
}

### tsconfig.json

{
  "compilerOptions": {
    "target": "ES2022",
    "module": "Node16",
    "moduleResolution": "node16",
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "noEmitOnError": false,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "allowSyntheticDefaultImports": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "downlevelIteration": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@/types": ["src/types"],
      "@/constants": ["src/constants"],
      "@/utils": ["src/utils"]
    },
    "moduleSuffixes": [".ts", ".js"]
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "tests"]
}

---

## SOURCE CODE DUMP

### src/cli.ts - Main Entry Point

/**
 * Floyd Wrapper CLI - Main Entry Point
 *
 * Interactive console interface with meow CLI parsing,
 * readline input loop, and FloydAgentEngine integration.
 */

import meow from 'meow';
import readline from 'node:readline';
import { onExit } from 'signal-exit';
import { fileURLToPath } from 'node:url';
import { config as dotenvConfig } from 'dotenv';
import { FloydAgentEngine } from './agent/execution-engine.ts';
import { loadConfig } from './utils/config.ts';
import { logger } from './utils/logger.ts';
import { FloydTerminal } from './ui/terminal.ts';
import { StreamingDisplay } from './ui/rendering.ts';

// Load .env file
dotenvConfig();

// ============================================================================
// CLI Configuration
// ============================================================================

const cli = meow(
  `
  Usage
    $ floyd [options]

  Options
    --debug     Enable debug logging
    --version   Show version number

  Examples
    $ floyd
    $ floyd --debug
`,
  {
    importMeta: import.meta,
    flags: {
      debug: {
        type: 'boolean',
        default: false,
      },
    },
  }
);

// ============================================================================
// Floyd CLI Class
// ============================================================================

/**
 * Main Floyd CLI application
 */
export class FloydCLI {
  private engine?: FloydAgentEngine;
  private rl?: readline.Interface;
  private config?: Awaited<ReturnType<typeof loadConfig>>;
  private terminal: FloydTerminal;
  private streamingDisplay: StreamingDisplay;
  private isRunning: boolean = false;
  private sigintHandler?: () => void;
  private onExitCleanup?: () => void;
  private testMode: boolean = false;

  constructor(options?: { testMode?: boolean }) {
    this.terminal = FloydTerminal.getInstance();
    this.streamingDisplay = StreamingDisplay.getInstance();
    this.testMode = options?.testMode ?? false;
  }

  /**
   * Initialize the CLI application
   */
  async initialize(): Promise<void> {
    try {
      // Load configuration
      this.config = await loadConfig();

      // Set log level based on flags
      if (cli.flags.debug) {
        this.config.logLevel = 'debug';
        logger.setLevel('debug');
      }

      logger.info('Initializing Floyd CLI...', {
        version: cli.pkg.version,
        debug: cli.flags.debug,
      });

      // Setup readline interface first (skip in test mode)
      if (!this.testMode) {
        this.rl = readline.createInterface({
          input: process.stdin,
          output: process.stdout,
          prompt: '\n> ',
        });
      }

      // Create agent engine with callbacks
      this.engine = new FloydAgentEngine(this.config, {
        onToken: (token: string) => {
          // Use StreamingDisplay for in-place rendering (prevents scroll spam)
          this.streamingDisplay.appendToken(token);
        },
        onToolStart: (tool: string, input: Record<string, unknown>) => {
          // Finish streaming display before showing tool execution
          if (this.streamingDisplay.isActive()) {
            this.streamingDisplay.finish();
          }
          this.terminal.blank();
          this.terminal.info(`Running: ${tool}`);
          logger.debug('Tool started', { tool, input });
        },
        onToolComplete: (tool: string, result: unknown) => {
          logger.debug('Tool completed', { tool, result });
          this.terminal.toolSuccess(tool);
        },
      });

      // Import permission manager and set up prompt function
      const { permissionManager } = await import('./permissions/permission-manager.ts');
      permissionManager.setPromptFunction(async (prompt: string, _permissionLevel: 'moderate' | 'dangerous') => {
        // Pause the main readline interface temporarily
        if (this.rl) {
          this.rl.pause();
        }

        // Display the permission prompt
        console.error(prompt);

        // Create a one-time question interface
        const answer = await new Promise<string>((resolve) => {
          const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
          });

          const question = '\nApprove this operation? (y/n): ';
          rl.question(question, (ans) => {
            rl.close();
            resolve(ans);
          });
        });

        // Resume the main readline interface
        if (this.rl) {
          this.rl.resume();
        }

        const normalizedAnswer = answer.trim().toLowerCase();
        const approved = normalizedAnswer === 'y' || normalizedAnswer === 'yes';

        if (approved) {
          logger.info('Permission granted for tool');
        } else {
          logger.warn('Permission denied for tool');
        }

        return approved;
      });

      // Handle Ctrl+C gracefully (skip in test mode)
      if (!this.testMode) {
        this.setupSignalHandlers();
      }

      logger.info('Floyd CLI initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize Floyd CLI', error);
      throw error;
    }
  }

  /**
   * Setup signal handlers for graceful shutdown
   */
  private setupSignalHandlers(): void {
    // Handle SIGINT (Ctrl+C)
    this.sigintHandler = () => {
      console.log('\n\nReceived interrupt signal. Shutting down...');
      this.shutdown();
    };
    process.on('SIGINT', this.sigintHandler);

    // Use signal-exit for cleanup on all exit paths
    // Store the dispose function returned by onExit
    this.onExitCleanup = onExit(() => {
      this.cleanup();
    });
  }

  /**
   * Remove signal handlers (useful for testing)
   */
  removeSignalHandlers(): void {
    if (this.sigintHandler) {
      process.off('SIGINT', this.sigintHandler);
      this.sigintHandler = undefined;
    }
    // Call the dispose function returned by onExit to remove its handlers
    if (this.onExitCleanup) {
      this.onExitCleanup();
      this.onExitCleanup = undefined;
    }
  }

  /**
   * Display welcome message
   */
  private displayWelcome(): void {
    this.terminal.showLogo();
    this.terminal.muted('Type your message below. Press Ctrl+C to exit.');
    this.terminal.blank();
  }

  /**
   * Process user input and execute through the engine
   */
  private async processInput(input: string): Promise<void> {
    if (!this.engine) {
      logger.error('Engine not initialized');
      return;
    }

    // Skip empty input
    if (!input.trim()) {
      return;
    }

    // Handle exit commands
    if (input.trim().toLowerCase() === 'exit' || input.trim().toLowerCase() === 'quit') {
      this.shutdown();
      return;
    }

    try {
      // Execute user message through agent engine
      await this.engine.execute(input);

      // Finish streaming display after execution completes
      if (this.streamingDisplay.isActive()) {
        this.streamingDisplay.finish();
      }

      this.terminal.blank();
    } catch (error) {
      // Finish streaming display on error
      if (this.streamingDisplay.isActive()) {
        this.streamingDisplay.finish();
      }

      logger.error('Failed to process input', error);
      this.terminal.error(error instanceof Error ? error.message : String(error));
    }
  }

  /**
   * Start the interactive CLI
   */
  async start(): Promise<void> {
    try {
      await this.initialize();
      this.displayWelcome();

      this.isRunning = true;

      if (!this.rl) {
        throw new Error('Readline interface not initialized');
      }

      // Main input loop
      this.rl.prompt();

      this.rl.on('line', async (line: string) => {
        await this.processInput(line);

        if (this.isRunning) {
          this.rl?.prompt();
        }
      });

      this.rl.on('close', () => {
        this.shutdown();
      });

      logger.info('Floyd CLI started');
    } catch (error) {
      logger.error('Failed to start Floyd CLI', error);
      process.exit(1);
    }
  }

  /**
   * Shutdown the CLI application
   */
  shutdown(): void {
    this.isRunning = false;

    // Finish any active streaming
    if (this.streamingDisplay.isActive()) {
      this.streamingDisplay.finish();
    }

    // Clean up terminal elements
    this.terminal.cleanup();

    this.rl?.close();
    this.terminal.success('Goodbye!');

    // Only exit process if not in test mode
    if (!this.testMode) {
      process.exit(0);
    }
  }

  /**
   * Cleanup resources
   */
  private cleanup(): void {
    logger.info('Cleaning up resources...');

    // Finish streaming display
    if (this.streamingDisplay.isActive()) {
      this.streamingDisplay.finish();
    }

    // Clean up terminal elements
    this.terminal.cleanup();

    this.rl?.close();
  }
}

// ============================================================================
// Main Entry Point
// ============================================================================

/**
 * Main function to start the CLI
 */
export async function main(options?: { testMode?: boolean }): Promise<void> {
  try {
    const cliApp = new FloydCLI(options);
    await cliApp.start();
  } catch (error) {
    logger.error('Fatal error in Floyd CLI', error);
    console.error('Fatal error:', error instanceof Error ? error.message : String(error));
    // Only exit process if not in test mode
    if (!options?.testMode) {
      process.exit(1);
    }
  }
}

// Run main when this module is executed
main().catch((error) => {
  console.error('Fatal error:', error instanceof Error ? error.message : String(error));
  process.exit(1);
});

### src/index.ts - Main API Entry Point

/**
 * Floyd Wrapper - Main API Entry Point
 *
 * @module @cursem/floyd-wrapper
 *
 * File-Logged Orchestrator Yielding Deliverables - AI Development Companion
 *
 * This module provides the complete FloydWrapper API including:
 * - Agent execution engine (FloydAgentEngine)
 * - CLI interface (FloydCLI)
 * - Tool registry and core tools
 * - Type definitions
 * - Logging utilities
 * - Configuration management
 * - UI components (FloydTerminal)
 * - Error handling
 */

// ============================================================================
// Core Agent Engine
// ============================================================================

export { FloydAgentEngine } from './agent/execution-engine.ts';
export type { EngineCallbacks } from './agent/execution-engine.ts';

// ============================================================================
// CLI Interface
// ============================================================================

export { FloydCLI, main } from './cli.ts';

// ============================================================================
// Tool Registry & Tools
// ============================================================================

export {
  ToolRegistry,
  toolRegistry,
  registerCoreTools,
} from './tools/index.ts';

export * from './tools/tool-registry.ts';

// ============================================================================
// Type Definitions
// ============================================================================

export * from './types.ts';

// ============================================================================
// Logging
// ============================================================================

export {
  FloydLogger,
  FloydScopedLogger,
  logger,
  initLogger,
} from './utils/logger.ts';

// ============================================================================
// Configuration Management
// ============================================================================

export {
  loadConfig,
  loadProjectContext,
  getCachePath,
  ensureCacheDirectories,
  validateConfig,
  getDefaultConfig,
  mergeConfig,
  getEnvBool,
  getEnvNumber,
  getEnvString,
} from './utils/config.ts';

// ============================================================================
// Error Handling
// ============================================================================

export {
  FloydError,
  ToolExecutionError,
  GLMAPIError,
  PermissionDeniedError,
  StreamError,
  CacheError,
  ConfigError,
  ValidationError,
  TimeoutError,
  isFloydError,
  isToolExecutionError,
  isGLMAPIError,
  isPermissionDeniedError,
  isRecoverableError,
  shouldRetry,
  getRetryDelay,
  formatError,
} from './utils/errors.ts';

// ============================================================================
// UI Components
// ============================================================================

export {
  FloydTerminal,
  terminal,
} from './ui/terminal.ts';

### src/types.ts - Core Types

/**
 * Core Types - Floyd Wrapper
 *
 * Shared TypeScript interfaces for the entire Floyd Wrapper application.
 * All types use explicit typing (no `any`) for type safety.
 */

import type { z } from 'zod';

// ============================================================================
// Message Types
// ============================================================================

/**
 * Represents a single message in the conversation
 */
export interface FloydMessage {
  /** Message role in the conversation */
  role: 'user' | 'assistant' | 'system' | 'tool';
  /** Message content (text or JSON string) */
  content: string;
  /** Unix timestamp of when message was created */
  timestamp: number;
  /** Tool use identifier (for tool-related messages) */
  toolUseId?: string;
  /** Tool name (for tool-related messages) */
  toolName?: string;
  /** Tool input parameters (for tool-related messages) */
  toolInput?: Record<string, unknown>;
}

// ============================================================================
// Tool Types
// ============================================================================

/**
 * Tool category classification
 */
export type ToolCategory =
  | 'file'
  | 'search'
  | 'build'
  | 'git'
  | 'browser'
  | 'cache'
  | 'patch'
  | 'special';

/**
 * Definition of a single tool in the tool registry
 */
export interface ToolDefinition {
  /** Unique tool name (e.g., "read_file") */
  name: string;
  /** Human-readable tool description */
  description: string;
  /** Tool category for organization */
  category: ToolCategory;
  /** Zod schema for validating input parameters */
  inputSchema: z.ZodTypeAny;
  /** Permission level required for execution */
  permission: 'none' | 'moderate' | 'dangerous';
  /** Async function that executes the tool */
  execute: (input: unknown) => Promise<ToolResult>;
}

/**
 * Result returned by tool execution
 */
export interface ToolResult<T = unknown> {
  /** Whether tool execution succeeded */
  success: boolean;
  /** Result data (present if success is true) */
  data?: T;
  /** Error details (present if success is false) */
  error?: {
    /** Error code for programmatic handling */
    code: string;
    /** Human-readable error message */
    message: string;
    /** Additional error details */
    details?: unknown;
  };
}

// ============================================================================
// Streaming Types
// ============================================================================

/**
 * Event type for streaming responses
 */
export type StreamEventType = 'token' | 'tool_use' | 'tool_result' | 'error' | 'done';

/**
 * Single event in the streaming response
 */
export interface StreamEvent {
  /** Event type */
  type: StreamEventType;
  /** Event content (token text or data) */
  content: string;
  /** Tool use details (for tool_use events) */
  toolUse?: {
    /** Unique tool use ID */
    id: string;
    /** Tool name being used */
    name: string;
    /** Tool input parameters */
    input: Record<string, unknown>;
  };
  /** Error message (for error events) */
  error?: string;
}

// ============================================================================
// Conversation Types
// ============================================================================

/**
 * Conversation history with metadata
 */
export interface ConversationHistory {
  /** All messages in the conversation */
  messages: FloydMessage[];
  /** Number of turns (user+assistant pairs) */
  turnCount: number;
  /** Total token count across all messages */
  tokenCount: number;
}

// ============================================================================
// Configuration Types
// ============================================================================

/**
 * Log level for logging system
 */
export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

/**
 * Permission handling strategy
 */
export type PermissionLevel = 'auto' | 'ask' | 'deny';

/**
 * Floyd Wrapper configuration
 */
export interface FloydConfig {
  /** GLM API key */
  glmApiKey: string;
  /** GLM API endpoint URL */
  glmApiEndpoint: string;
  /** GLM model name */
  glmModel: string;
  /** Maximum tokens for model response */
  maxTokens: number;
  /** Temperature for response randomness (0-1) */
  temperature: number;
  /** Maximum turns for agent execution */
  maxTurns: number;
  /** Logging verbosity level */
  logLevel: LogLevel;
  /** Whether caching is enabled */
  cacheEnabled: boolean;
  /** Permission handling strategy */
  permissionLevel: PermissionLevel;
}

// ============================================================================
// Cache Types
// ============================================================================

/**
 * Cache tier levels for SUPERCACHE
 */
export type CacheTier = 'reasoning' | 'project' | 'vault';

/**
 * Cache entry metadata
 */
export interface CacheEntry<T = unknown> {
  /** Cached data */
  data: T;
  /** Timestamp when entry was created */
  createdAt: number;
  /** Timestamp when entry expires */
  expiresAt: number;
  /** Number of times entry has been accessed */
  accessCount: number;
  /** Cache tier */
  tier: CacheTier;
}

// ============================================================================
// Agent Types
// ============================================================================

/**
 * Agent execution state
 */
export type AgentState =
  | 'idle'
  | 'thinking'
  | 'executing'
  | 'waiting_permission'
  | 'done'
  | 'error';

/**
 * Agent execution context
 */
export interface AgentContext {
  /** Current conversation history */
  conversation: ConversationHistory;
  /** Current agent state */
  state: AgentState;
  /** Turn count in current session */
  turnCount: number;
  /** Maximum allowed turns */
  maxTurns: number;
  /** Tool registry reference */
  tools: Map<string, ToolDefinition>;
}

// ============================================================================
// UI Types
// ============================================================================

/**
 * UI theme colors
 */
export interface ThemeColors {
  /** Primary color */
  primary: string;
  /** Secondary color */
  secondary: string;
  /** Success color */
  success: string;
  /** Warning color */
  warning: string;
  /** Error color */
  error: string;
  /** Info color */
  info: string;
  /** Muted color */
  muted: string;
}

/**
 * Spinner state for UI
 */
export interface SpinnerState {
  /** Current spinner message */
  message: string;
  /** Whether spinner is active */
  active: boolean;
  /** Spinner type */
  type: string;
}

### src/constants.ts - Application Constants

/**
 * Constants - Floyd Wrapper
 *
 * Application-wide constants including version numbers, default configuration,
 * CRUSH branding, and ASCII logo.
 */

// ============================================================================
// Version and Identity
// ============================================================================

export const FLOYD_VERSION = '0.1.0' as const;
export const FLOYD_NAME = 'Floyd' as const;
export const FLOYD_FULL_NAME = 'File-Logged Orchestrator Yielding Deliverables' as const;

// ============================================================================
// Default Configuration
// ============================================================================

/**
 * Default Floyd Wrapper configuration
 */
export const DEFAULT_CONFIG = {
  glmApiEndpoint: 'https://api.z.ai/api/anthropic',
  glmModel: 'glm-4.7',
  maxTokens: 100000,
  temperature: 0.7,
  logLevel: 'info',
  cacheEnabled: true,
  permissionLevel: 'ask',
  maxTurns: 20,
  timeoutMs: 120000,
} as const;

// ============================================================================
// Tool Categories
// ============================================================================

/**
 * Available tool categories
 */
export const TOOL_CATEGORIES = [
  'file',
  'search',
  'build',
  'git',
  'browser',
  'cache',
  'patch',
  'special',
] as const;

// ============================================================================
// Permission Levels
// ============================================================================

/**
 * Tool permission levels
 */
export const PERMISSION_LEVELS = ['none', 'moderate', 'dangerous'] as const;

// ============================================================================
// CRUSH Branding
// ============================================================================

/**
 * CRUSH company branding colors and theme
 */
export const CRUSH_THEME = {
  colors: {
    primary: '#FF6B6B',
    secondary: '#4ECDC4',
    success: '#45B7D1',
    warning: '#F7DC6F',
    error: '#E74C3C',
    info: '#3498DB',
    muted: '#95A5A6',
  },
  logo: `
  ██████╗ ██╗   ██╗ ██████╗     ████████╗███████╗██████╗ ███╗   ███╗██╗███╗   ██╗ █████╗ ██╗     
  ██╔══██╗██║   ██║██╔════╝     ╚══██╔══╝██╔════╝██╔══██╗████╗ ████║██║████╗  ██║██╔══██╗██║     
  ██████╔╝██║   ██║██║  ███╗       ██║   █████╗  ██████╔╝██╔████╔██║██║██╔██╗ ██║███████║██║     
  ██╔══██╗██║   ██║██║   ██║       ██║   ██╔══╝  ██╔══██╗██║╚██╔╝██║██║██║╚██╗██║██╔══██║██║     
  ██║  ██║╚██████╔╝╚██████╔╝       ██║   ███████╗██║  ██║██║ ╚═╝ ██║██║██║ ╚████║██║  ██║███████╗
  ╚═╝  ╚═╝ ╚═════╝  ╚═════╝        ╚═╝   ╚══════╝╚═╝  ╚═╝╚═╝     ╚═╝╚═╝╚═╝  ╚═══╝╚═╝  ╚═╝╚══════╝
  `,
} as const;

/**
 * ASCII Logo for Floyd
 */
export const ASCII_LOGO = `
    __/\\\\\\\\\\\\\\\___/\\\____________________/\\\\\\________/\\\________/\\\___/\\\\\\\\\\\\_______________
   _\/\\\///////////___\/\\\__________________/\\\///\\\_____\///\\\____/\\\/___\/\\\////////\\\_____________
    _\/\\\______________\/\\\________________/\\\/__\///\\\_____\///\\\/\\\/_____\/\\\______\//\\\____________
     _\/\\\\\\\\\\\______\/\\\_______________/\\\______\//\\\______\///\\\/_______\/\\\_______\/\\\____________
      _\/\\\///////_______\/\\\______________\/\\\_______\/\\\________\/\\\________\/\\\_______\/\\\____________
       _\/\\\______________\/\\\______________\//\\\______/\\\_________\/\\\________\/\\\_______\/\\\____________
        _\/\\\______________\/\\\_______________\///\\\__/\\\___________\/\\\________\/\\\_______/\\\_____________
         _\/\\\______________\/\\\\\\\\\\\\\\\_____\///\\\\\/____________\/\\\________\/\\\\\\\\\\\\/______________
          _\///_______________\///////////////________\/////______________\///_________\////////////________________
` as const;

// ============================================================================
// System Prompts
// ============================================================================

/**
 * Main system prompt for Floyd
 */
export const MAIN_SYSTEM_PROMPT = `You are Floyd, an AI development companion built by CRUSH.

Your purpose is to help developers build, test, and ship software efficiently. You have access to powerful tools for file operations, code search, build automation, git workflows, browser automation, caching, and more.

Key principles:
- Be concise and direct in your responses
- Use tools to verify information before making claims
- Always read files before editing them
- Test your changes immediately after making them
- Maintain a conversation history to provide context
- Ask for permission before executing dangerous operations
- Use the SUPERCACHE system to reduce redundant computations

You have access to 55 tools across 8 categories. Use them wisely to accomplish tasks efficiently.

When you need to think through a complex problem, use the think tool to show your reasoning.

Always aim for completeness - if asked to implement a feature, wire it fully including tests, documentation, and all necessary wiring.` as const;

/**
 * Explore mode system prompt
 */
export const EXPLORE_SYSTEM_PROMPT = `You are Floyd in explore mode.

Your current task is to explore the codebase and understand its structure, patterns, and conventions.

Use your tools to:
- List directories and files
- Search for specific patterns
- Read configuration files
- Identify the tech stack
- Understand the architecture

Be thorough but efficient in your exploration. Provide clear summaries of what you discover.` as const;

/**
 * Plan mode system prompt
 */
export const PLAN_SYSTEM_PROMPT = `You are Floyd in plan mode.

Your current task is to create a detailed plan for implementing a feature or fixing a bug.

Use your tools to:
- Understand the current codebase structure
- Identify all files that need changes
- Consider edge cases and error handling
- Plan the implementation order
- Identify testing requirements

Create a step-by-step plan with clear priorities and dependencies.` as const;

// ============================================================================
// Tool Categories Metadata
// ============================================================================

/**
 * Tool category descriptions
 */
export const TOOL_CATEGORY_DESCRIPTIONS = {
  file: 'File operations (read, write, edit, search, replace)',
  search: 'Code search and navigation (grep, codebase search, find)',
  build: 'Build and test automation (run, compile, test, lint)',
  git: 'Git operations (status, diff, commit, branch, push, pull)',
  browser: 'Browser automation (screenshot, click, type, navigate)',
  cache: 'SUPERCACHE operations (store, retrieve, clear, stats)',
  patch: 'Patch operations (create, apply, list patches)',
  special: 'Special tools (think, ask, echo, sleep)',
} as const;

// ============================================================================
// Error Codes
// ============================================================================

/**
 * Standard error codes
 */
export const ERROR_CODES = {
  /** Configuration error */
  CONFIG_ERROR: 'CONFIG_ERROR',
  /** Validation error */
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  /** File not found */
  FILE_NOT_FOUND: 'FILE_NOT_FOUND',
  /** Permission denied */
  PERMISSION_DENIED: 'PERMISSION_DENIED',
  /** Tool execution error */
  TOOL_EXECUTION_ERROR: 'TOOL_EXECUTION_ERROR',
  /** API error */
  API_ERROR: 'API_ERROR',
  /** Cache error */
  CACHE_ERROR: 'CACHE_ERROR',
  /** Timeout error */
  TIMEOUT_ERROR: 'TIMEOUT_ERROR',
} as const;

### src/agent/execution-engine.ts - Orchestrator

/**
 * Execution Engine - Floyd Wrapper
 *
 * Agentic "run until completion" loop with conversation history,
 * tool execution, and turn limiting.
 */

import type { FloydConfig, ConversationHistory, StreamEvent } from '../types.ts';
import { GLMClient } from '../llm/glm-client.ts';
import { StreamHandler } from '../streaming/stream-handler.ts';
import { toolRegistry } from '../tools/index.ts';
import { permissionManager } from '../permissions/permission-manager.ts';
import { logger } from '../utils/logger.ts';

// ============================================================================
// Engine Callbacks
// ============================================================================

/**
 * Callbacks for engine events
 */
export interface EngineCallbacks {
  /** Called when each token is generated */
  onToken?: (token: string) => void;
  /** Called when a tool execution starts */
  onToolStart?: (tool: string, input: Record<string, unknown>) => void;
  /** Called when a tool execution completes */
  onToolComplete?: (tool: string, result: unknown) => void;
}

// ============================================================================
// Floyd Agent Engine
// ============================================================================

/**
 * Agentic execution engine that runs "until completion"
 *
 * Features:
 * - Multi-turn conversation loop with turn limiting
 * - Automatic tool execution and result feeding
 * - Completion detection (no tool use = done)
 * - Streaming response support
 * - Conversation history management
 */
export class FloydAgentEngine {
  private history: ConversationHistory;
  private glmClient: GLMClient;
  private streamHandler: StreamHandler;
  private maxTurns: number;
  private callbacks: EngineCallbacks;
  private executionLock: Promise<unknown> = Promise.resolve(); // Mutex for concurrent execution prevention

  constructor(
    config: FloydConfig,
    callbacks?: EngineCallbacks
  ) {
    // Initialize history with system message
    this.history = {
      messages: [
        {
          role: 'system',
          content: `You are Floyd, a helpful AI coding assistant with access to tools.

TOOL USAGE:
- You have 50+ tools available including: file operations, Git commands, code search, shell execution
- When users ask for repo information, file operations, or system commands: USE TOOLS
- Tool calls will be executed automatically and results fed back to you
- After using tools, provide a direct summary of the results

CRITICAL INSTRUCTIONS - FOLLOW STRICTLY:
1. When asked to check/read/search/do operations: USE THE APPROPRIATE TOOL
2. Respond DIRECTLY after tool execution - summarize results in 1-2 sentences
3. NEVER output numbered lists, steps, or reasoning processes
4. NEVER use bold headers like **Analysis**, **Plan**, **Steps**
5. NO preamble like "Let me help" or "Let me check"
6. NO CoT (Chain of Thought) exposure whatsoever

Examples of WRONG responses:
- "**Analysis**: To solve this... 1. First... 2. Then..."
- "I don't have access to files" (USE A TOOL INSTEAD)
- "Let me think about this..." (JUST USE THE TOOL)

Examples of RIGHT responses:
- [User: "count .md files"] → Uses run tool, then: "Found 42 .md files in this repository."
- [User: "read package.json"] → Uses read tool, then: "Package name is @cursem/floyd-wrapper version 0.1.0"
- [User: "what is 2+2"] → "4."

Remember: Use tools for operations, give direct answers, no reasoning or steps.`,
          timestamp: Date.now(),
        },
      ],
      turnCount: 0,
      tokenCount: 0,
    };

    this.glmClient = new GLMClient(config);
    this.streamHandler = new StreamHandler();
    this.maxTurns = config.maxTurns;
    this.callbacks = callbacks || {};

    logger.debug('FloydAgentEngine initialized', {
      maxTurns: this.maxTurns,
    });
  }

  /**
   * Execute a user message and run until completion
   *
   * @param userMessage - User's input message
   * @returns Final assistant response
   */
  async execute(userMessage: string): Promise<string> {
    // Use mutex to prevent concurrent executions
    this.executionLock = this.executionLock.then(async () => {
      logger.info('Starting execution', {
        turnCount: this.history.turnCount,
        messageLength: userMessage.length,
      });

      // Add user message to history
      this.history.messages.push({
        role: 'user',
        content: userMessage,
        timestamp: Date.now(),
      });

      // Main agentic loop
      let finalResponse = '';

      while (this.history.turnCount < this.maxTurns) {
        logger.debug('Starting turn', {
          turn: this.history.turnCount + 1,
          maxTurns: this.maxTurns,
        });

        this.history.turnCount++;

      // Call GLM-4.7 with streaming
      const stream = this.glmClient.streamChat({
        messages: this.history.messages,
        tools: this.buildToolDefinitions(),
        onToken: this.callbacks.onToken,
        onComplete: (usage) => {
          // Update token count in history
          this.history.tokenCount += usage.totalTokens;
          logger.debug('Updated token count', {
            tokenCount: this.history.tokenCount,
            inputTokens: usage.inputTokens,
            outputTokens: usage.outputTokens,
          });
        },
      });

      // Process stream
      const result = await this.processStream(stream);

      // Add assistant message to history
      this.history.messages.push({
        role: 'assistant',
        content: result.assistantMessage,
        timestamp: Date.now(),
      });

      // Check for completion (no tool use detected)
      if (result.toolResults.length === 0) {
        logger.info('No tool use detected - execution complete');
        finalResponse = result.assistantMessage;
        break;
      }

      // Add tool results to history
      for (const toolResult of result.toolResults) {
        this.history.messages.push({
          role: 'tool',
          content: JSON.stringify(toolResult.result),
          timestamp: Date.now(),
          toolUseId: toolResult.toolUseId,
        });
      }

      // Continue to next turn
      logger.debug('Continuing to next turn', {
        toolCount: result.toolResults.length,
      });
    }

    // Check if we hit turn limit
    if (this.history.turnCount >= this.maxTurns) {
      logger.warn('Maximum turn limit reached', {
        turnCount: this.history.turnCount,
        maxTurns: this.maxTurns,
      });
    }

    // Return final response
    const lastAssistantMessage = this.history.messages
      .filter(m => m.role === 'assistant')
      .pop();

    return lastAssistantMessage?.content || finalResponse;
    });

    // Wait for the execution to complete and return its result
    return await this.executionLock;
  }

  /**
   * Process a stream from GLM and collect results
   *
   * @param stream - Async generator of stream events
   * @returns Assistant message and tool results
   */
  private async processStream(
    stream: AsyncGenerator<StreamEvent>
  ): Promise<{
    assistantMessage: string;
    toolResults: Array<{ toolUseId: string; result: unknown }>;
  }> {
    let assistantMessage = '';
    const toolResults: Array<{ toolUseId: string; result: unknown }> = [];

    await this.streamHandler.processStream(
      stream,
      {
        onToken: (token: string) => {
          assistantMessage += token;
          this.callbacks.onToken?.(token);
        },
        onToolStart: async (toolName: string, input: Record<string, unknown>) => {
          logger.info('Executing tool', { toolName, input });

          // Notify callback
          this.callbacks.onToolStart?.(toolName, input);

          // Request permission for tool execution
          const permissionGranted = await permissionManager.requestPermission(toolName, input);

          // If permission denied, return error and skip execution
          if (!permissionGranted) {
            logger.warn(`Permission denied for tool: ${toolName}`);

            const errorResult = {
              success: false,
              error: {
                code: 'PERMISSION_DENIED' as const,
                message: `Permission denied for tool "${toolName}"`,
              },
            };

            // Store error result for later
            const pendingToolUse = this.streamHandler.getPendingToolUse();
            if (pendingToolUse) {
              toolResults.push({
                toolUseId: pendingToolUse.id as string,
                result: errorResult,
              });
            }

            // Notify callback
            this.callbacks.onToolComplete?.(toolName, errorResult);
            return;
          }

          // Execute tool through registry with granted permission
          const result = await toolRegistry.execute(toolName, input, {
            permissionGranted: true,
          });

          // Store result for later
          const pendingToolUse = this.streamHandler.getPendingToolUse();
          if (pendingToolUse) {
            toolResults.push({
              toolUseId: pendingToolUse.id as string,
              result,
            });
          }

          // Notify callback
          this.callbacks.onToolComplete?.(toolName, result);
        },
        onError: (error: string) => {
          logger.error('Stream error', new Error(error));
        },
      }
    );

    logger.debug('Stream processing complete', {
      assistantMessageLength: assistantMessage.length,
      toolResultsCount: toolResults.length,
    });

    return { assistantMessage, toolResults };
  }

  /**
   * Build tool definitions for GLM-4.7 API
   *
   * @returns Array of tool definitions
   */
  private buildToolDefinitions(): Array<{
    name: string;
    description: string;
    input_schema: Record<string, unknown>;
  }> {
    const tools = toolRegistry.getAll();

    logger.debug('Building tool definitions', {
      toolCount: tools.length,
    });

    return tools.map((tool) => ({
      name: tool.name,
      description: tool.description,
      input_schema: tool.inputSchema as unknown as Record<string, unknown>,
    }));
  }

  /**
   * Get current conversation history
   *
   * @returns Current conversation history
   */
  getHistory(): ConversationHistory {
    return this.history;
  }

  /**
   * Reset conversation history
   */
  reset(): void {
    this.history = {
      messages: [],
      turnCount: 0,
      tokenCount: 0,
    };

    logger.debug('Conversation history reset');
  }
}

### src/llm/glm-client.ts - GLM-4.7 API Client

/**
 * GLM Client - Floyd Wrapper
 *
 * GLM-4.7 API client with streaming support and SSE parsing.
 */

import type { FloydConfig, FloydMessage, StreamEvent } from '../types.ts';
import { logger } from '../utils/logger.ts';
import { GLMAPIError, StreamError } from '../utils/errors.ts';

// ============================================================================
// GLM Stream Options
// ============================================================================

/**
 * Token usage metadata
 */
export interface TokenUsage {
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
}

/**
 * Options for streaming chat completion
 */
export interface GLMStreamOptions {
  /** Conversation messages */
  messages: FloydMessage[];
  /** Tool definitions for function calling */
  tools?: Array<{
    name: string;
    description: string;
    input_schema: Record<string, unknown>;
  }>;
  /** Maximum tokens in response */
  maxTokens?: number;
  /** Temperature (0-2) */
  temperature?: number;
  /** Callback for each token received */
  onToken?: (token: string) => void;
  /** Callback when tool use is detected */
  onToolUse?: (toolUse: unknown) => void;
  /** Callback on error */
  onError?: (error: Error) => void;
  /** Callback on completion with token usage */
  onComplete?: (usage: TokenUsage) => void;
  /** Maximum retry attempts (default: 3) */
  maxRetries?: number;
  /** Initial retry delay in ms (default: 1000) */
  retryDelay?: number;
}

// ============================================================================
// GLM Client Class
// ============================================================================

/**
 * GLM-4.7 API client with streaming support
 */
export class GLMClient {
  private apiKey: string;
  private apiEndpoint: string;
  private model: string;
  private config: FloydConfig;
  private totalInputTokens: number = 0;
  private totalOutputTokens: number = 0;

  constructor(config: FloydConfig) {
    this.config = config;
    this.apiKey = config.glmApiKey;
    this.apiEndpoint = config.glmApiEndpoint;
    this.model = config.glmModel;

    if (!this.apiKey) {
      throw new GLMAPIError('GLM API key is not configured', 401);
    }

    logger.debug('GLMClient initialized', {
      endpoint: this.apiEndpoint,
      model: this.model,
    });
  }

  /**
   * Get current token usage statistics
   */
  getTokenUsage(): TokenUsage {
    return {
      inputTokens: this.totalInputTokens,
      outputTokens: this.totalOutputTokens,
      totalTokens: this.totalInputTokens + this.totalOutputTokens,
    };
  }

  /**
   * Reset token usage counters
   */
  resetTokenUsage(): void {
    this.totalInputTokens = 0;
    this.totalOutputTokens = 0;
    logger.debug('Token usage counters reset');
  }

  /**
   * Calculate exponential backoff delay
   */
  private calculateBackoff(attempt: number, baseDelay: number): number {
    const exponentialDelay = baseDelay * Math.pow(2, attempt);
    const jitter = Math.random() * 0.3 * exponentialDelay; // Add 0-30% jitter
    return Math.min(exponentialDelay + jitter, 30000); // Cap at 30 seconds
  }

  /**
   * Sleep for specified milliseconds
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Stream chat completion with SSE parsing and retry logic
   */
  async *streamChat(options: GLMStreamOptions): AsyncGenerator<StreamEvent> {
    const {
      messages,
      tools = [],
      maxTokens = this.config.maxTokens,
      temperature = this.config.temperature,
      onToken,
      onToolUse,
      onError,
      onComplete,
      maxRetries = 3,
      retryDelay = 1000,
    } = options;

    logger.debug('Starting GLM stream', {
      messageCount: messages.length,
      toolCount: tools.length,
      maxTokens,
      temperature,
    });

    let lastError: Error | undefined;
    let attempt = 0;

    // Retry loop with exponential backoff
    while (attempt <= maxRetries) {
      try {
        // Build request URL - GLM Coding API uses /chat/completions
        const url = `${this.apiEndpoint}/chat/completions`;

        // Build request body
        const body = {
          model: this.model,
          messages: messages.map(m => ({
            role: m.role,
            content: m.content,
          })),
          tools: tools.length > 0 ? tools : undefined,
          max_tokens: maxTokens,
          temperature,
          stream: true,
        };

        logger.debug('Sending request to GLM API', {
          url,
          model: this.model,
          attempt: attempt + 1,
        });

        // Make POST request
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`,
          },
          body: JSON.stringify(body),
        });

        // Handle HTTP errors with retry
        if (!response.ok) {
          const errorText = await response.text().catch(() => 'Unknown error');

          logger.error('GLM API request failed', {
            status: response.status,
            statusText: response.statusText,
            errorText,
            attempt: attempt + 1,
          });

          // Retry on rate limit (429) or server errors (5xx)
          if (response.status === 429 || response.status >= 500) {
            if (attempt < maxRetries) {
              const backoffDelay = this.calculateBackoff(attempt, retryDelay);
              logger.warn(`Retrying after ${backoffDelay}ms...`, {
                attempt: attempt + 1,
                maxRetries,
              });
              await this.sleep(backoffDelay);
              attempt++;
              continue;
            }
          }

          throw new GLMAPIError(
            `GLM API returned ${response.status}: ${response.statusText} - ${errorText}`,
            response.status
          );
        }

        // Parse streaming response
        const reader = response.body?.getReader();

        if (!reader) {
          throw new StreamError('Response body is not readable');
        }

        const decoder = new TextDecoder();
        let buffer = '';
        let currentOutputTokens = 0;
        let inputTokens = 0;
        let outputTokens = 0;

        logger.debug('Starting to parse SSE stream');

        // Read SSE stream
        while (true) {
          const { done, value } = await reader.read();

          if (done) {
            logger.debug('SSE stream ended');
            break;
          }

          // Decode chunk
          buffer += decoder.decode(value, { stream: true });

          // Split into lines
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          // Process each line
          for (const line of lines) {
            if (!line.trim()) continue;
            if (!line.startsWith('data: ')) continue;

            // Extract data part
            const data = line.slice(6).trim();

            // Check for end of stream (OpenAI-style)
            if (data === '[DONE]') {
              logger.debug('Received [DONE] signal');

              // Update token usage
              this.totalInputTokens += inputTokens;
              this.totalOutputTokens += outputTokens || currentOutputTokens;
              const usage = this.getTokenUsage();
              onComplete?.(usage);

              logger.debug('Token usage', usage);
              yield { type: 'done', content: '' };
              return;
            }

            // Parse JSON
            try {
              const parsed = JSON.parse(data);

              // Extract token usage from GLM response (OpenAI-style format)
              if (parsed.usage) {
                const usage = parsed.usage as Record<string, unknown>;
                inputTokens = (usage.prompt_tokens as number) || inputTokens;
                outputTokens = (usage.completion_tokens as number) || outputTokens;
                logger.debug('Token usage from API', { inputTokens, outputTokens });
              }

              // Process the event and check for completion
              for await (const event of this.processSSEEvent(parsed, {
                onToken,
                onToolUse,
              })) {
                yield event;

                // Check if this is a completion event
                if (event.type === 'done') {
                  this.totalInputTokens += inputTokens;
                  this.totalOutputTokens += outputTokens || currentOutputTokens;
                  const finalUsage = this.getTokenUsage();
                  onComplete?.(finalUsage);

                  logger.debug('Token usage', finalUsage);
                  return;
                }
              }

              currentOutputTokens++;
            } catch (parseError) {
              logger.warn('Failed to parse SSE event', { line, error: parseError });
            }
          }
        }

        // Final token usage update
        this.totalInputTokens += inputTokens;
        this.totalOutputTokens += outputTokens || currentOutputTokens;
        const usage = this.getTokenUsage();
        onComplete?.(usage);

        logger.debug('Token usage', usage);
        yield { type: 'done', content: '' };
        return; // Success - exit retry loop
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        logger.error('GLM stream attempt failed', {
          error: lastError.message,
          attempt: attempt + 1,
        });

        // Retry on network errors or rate limits
        if (attempt < maxRetries) {
          const shouldRetry =
            lastError.message.includes('fetch failed') ||
            lastError.message.includes('ECONNREFUSED') ||
            lastError.message.includes('ETIMEDOUT') ||
            (lastError instanceof GLMAPIError && lastError.statusCode === 429);

          if (shouldRetry) {
            const backoffDelay = this.calculateBackoff(attempt, retryDelay);
            logger.warn(`Retrying after ${backoffDelay}ms...`, {
              attempt: attempt + 1,
              maxRetries,
              reason: lastError.message,
            });
            await this.sleep(backoffDelay);
            attempt++;
            continue;
          }
        }

        // Notify error callback
        if (onError) {
          onError(lastError);
        }

        // Yield error event
        yield {
          type: 'error',
          content: '',
          error: lastError.message,
        };

        throw lastError;
      }
    }

    // If we've exhausted retries, throw the last error
    if (lastError) {
      throw lastError;
    }
  }

  /**
   * Process a single SSE event (GLM Coding API uses OpenAI-style format)
   */
  private async *processSSEEvent(
    event: unknown,
    _callbacks: { onToken?: (token: string) => void; onToolUse?: (toolUse: unknown) => void }
  ): AsyncGenerator<StreamEvent> {
    // Type guard for SSE events
    if (!event || typeof event !== 'object') {
      return;
    }

    const parsed = event as Record<string, unknown>;

    // GLM Coding API uses OpenAI-style format: choices[0].delta
    const choices = parsed.choices as Array<Record<string, unknown>> | undefined;

    if (choices && choices.length > 0) {
      const choice = choices[0];
      const delta = choice.delta as Record<string, unknown> | undefined;
      const finishReason = choice.finish_reason as string | undefined;

      // Extract content from delta
      if (delta) {
        // GLM returns content in 'content' or 'reasoning_content' field
        // We MUST filter out reasoning_content to prevent CoT exposure
        const content = (delta.content as string | undefined);

        // Explicitly ignore reasoning_content field
        if (content) {
          yield { type: 'token', content: content };
        }
      }

      // Check for stream completion
      if (finishReason && finishReason !== 'null' && finishReason !== null) {
        logger.debug('Stream completed with reason:', finishReason);
        // Emit done event when stream completes
        yield { type: 'done', content: '' };
      }
    }

    // Extract usage info if present
    if (parsed.usage) {
      const usage = parsed.usage as Record<string, unknown>;
      logger.debug('Usage info', {
        prompt_tokens: usage.prompt_tokens,
        completion_tokens: usage.completion_tokens,
      });
    }
  }

  /**
   * Test API connectivity
   */
  async testConnection(): Promise<boolean> {
    try {
      logger.debug('Testing GLM API connection...');

      // GLM Coding API uses /chat/completions endpoint
      const response = await fetch(`${this.apiEndpoint}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: this.model,
          max_tokens: 10,
          messages: [{ role: 'user', content: 'Hello' }],
          stream: false,
        }),
      });

      if (!response.ok) {
        logger.error('API connection test failed', {
          status: response.status,
        });
        return false;
      }

      logger.debug('API connection test successful');
      return true;
    } catch (error) {
      logger.error('API connection test failed', error as Error);
      return false;
    }
  }
}

### src/streaming/stream-handler.ts - Stream Handler

/**
 * Stream Handler - Floyd Wrapper
 *
 * Process streaming responses from GLM-4.7 with event emission.
 */

import { EventEmitter } from 'events';
import type { StreamEvent } from '../types.ts';
import { logger } from '../utils/logger.ts';

// ============================================================================
// Stream Callbacks
// ============================================================================

/**
 * Callbacks for stream events
 */
export interface StreamCallbacks {
  /** Called when each token is received */
  onToken?: (token: string) => void;
  /** Called when a tool use starts */
  onToolStart?: (tool: string, input: Record<string, unknown>) => void;
  /** Called when a tool use completes */
  onToolComplete?: (tool: string, result: unknown) => void;
  /** Called when an error occurs */
  onError?: (error: string) => void;
  /** Called when stream is done */
  onDone?: () => void;
}

// ============================================================================
// Stream Handler Class
// ============================================================================

/**
 * Handles streaming responses with event emission
 */
export class StreamHandler extends EventEmitter {
  private buffer = '';
  private pendingToolUse: Record<string, unknown> | null = null;

  /**
   * Process a stream of events
   */
  async processStream(
    stream: AsyncIterable<StreamEvent>,
    callbacks: StreamCallbacks
  ): Promise<string> {
    let fullResponse = '';
    this.buffer = '';
    this.pendingToolUse = null;

    logger.debug('Starting stream processing');

    for await (const event of stream) {
      switch (event.type) {
        case 'token':
          // Append token to buffer
          this.buffer += event.content;
          fullResponse += event.content;

          // Emit token event
          callbacks.onToken?.(event.content);
          this.emit('token', event.content);
          break;

        case 'tool_use':
          // Store pending tool use
          if (event.toolUse) {
            this.pendingToolUse = event.toolUse;

            logger.debug('Tool use detected', {
              toolName: event.toolUse.name,
            });

            // Emit tool start event
            callbacks.onToolStart?.(
              event.toolUse.name,
              event.toolUse.input
            );
            this.emit('toolStart', event.toolUse);
          }
          break;

        case 'tool_result':
          // Emit tool complete event
          if (this.pendingToolUse) {
            logger.debug('Tool result received', {
              toolName: this.pendingToolUse.name,
            });

            callbacks.onToolComplete?.(
              this.pendingToolUse.name as string,
              event.content
            );
            this.emit('toolComplete', {
              tool: this.pendingToolUse.name as string,
              result: event.content,
            });

            this.pendingToolUse = null;
          }
          break;

        case 'error':
          // Emit error event
          logger.error('Stream error', new Error(event.error));

          callbacks.onError?.(event.error || 'Unknown error');
          this.emit('error', event.error);
          break;

        case 'done':
          // Emit done event
          logger.debug('Stream processing complete');

          callbacks.onDone?.();
          this.emit('done');
          break;
      }
    }

    logger.debug('Stream processing finished', {
      responseLength: fullResponse.length,
    });

    return fullResponse;
  }

  /**
   * Get current buffer contents
   */
  getCurrentBuffer(): string {
    return this.buffer;
  }

  /**
   * Clear buffer
   */
  clearBuffer(): void {
    this.buffer = '';
  }

  /**
   * Get pending tool use
   */
  getPendingToolUse(): Record<string, unknown> | null {
    return this.pendingToolUse;
  }

  /**
   * Reset handler state
   */
  reset(): void {
    this.buffer = '';
    this.pendingToolUse = null;
    this.removeAllListeners();
  }
}

### src/permissions/permission-manager.ts - Permission Manager

/**
 * Permission Manager - Floyd Wrapper
 *
 * Handles permission requests for tool execution with CLI prompts and auto-confirm mode.
 */

import { toolRegistry } from '../tools/tool-registry.ts';
import { logger } from '../utils/logger.ts';
import type { ToolDefinition } from '../types.ts';

// ============================================================================
// Permission Prompt Function Type
// ============================================================================

/**
 * Function type for prompting user for permission
 */
export type PermissionPromptFunction = (
  prompt: string,
  permissionLevel: 'moderate' | 'dangerous'
) => Promise<boolean>;

// ============================================================================
// Permission Manager Class
// ============================================================================

/**
 * Manages permission requests for tool execution
 */
export class PermissionManager {
  /**
   * Auto-confirm mode (for testing)
   */
  private autoConfirm: boolean = false;

  /**
   * External prompt function (injected by CLI)
   */
  private externalPromptFn: PermissionPromptFunction | null = null;

  /**
   * Set auto-confirm mode for testing
   */
  setAutoConfirm(enabled: boolean): void {
    this.autoConfirm = enabled;
    logger.debug(`Auto-confirm mode: ${enabled}`);
  }

  /**
   * Check if auto-confirm is enabled
   */
  isAutoConfirm(): boolean {
    return this.autoConfirm;
  }

  /**
   * Set external prompt function (used by CLI to provide its readline interface)
   */
  setPromptFunction(fn: PermissionPromptFunction): void {
    this.externalPromptFn = fn;
    logger.debug('External prompt function registered');
  }

  /**
   * Request permission for tool execution
   *
   * @param toolName - Name of the tool requesting permission
   * @param input - Input parameters for the tool
   * @returns true if approved, false if denied
   */
  async requestPermission(toolName: string, input: Record<string, unknown>): Promise<boolean> {
    // Get tool definition from registry
    const tool = toolRegistry.get(toolName);

    if (!tool) {
      logger.error(`Tool "${toolName}" not found in registry`);
      return false;
    }

    // Check permission level
    if (tool.permission === 'none') {
      // Auto-approve tools with 'none' permission level
      logger.debug(`Auto-approving tool: ${toolName} (permission: none)`);
      return true;
    }

    // Auto-confirm mode: approve all non-dangerous tools
    if (this.autoConfirm && tool.permission !== 'dangerous') {
      logger.debug(`Auto-confirm approved: ${toolName}`);
      return true;
    }

    // Format prompt for user
    const prompt = this.formatPrompt(tool, input);

    // Display prompt and get user response
    logger.permissionRequest(tool.name, tool.description);

    return this.promptUser(prompt, tool.permission);
  }

  /**
   * Format permission prompt for user
   *
   * @param tool - Tool definition
   * @param input - Input parameters for the tool
   * @returns Formatted prompt string
   */
  private formatPrompt(tool: ToolDefinition, input: Record<string, unknown>): string {
    let prompt = `\n${'='.repeat(60)}\n`;
    prompt += `Permission Required: ${tool.name}\n`;
    prompt += `${'='.repeat(60)}\n`;
    prompt += `Description: ${tool.description}\n`;
    prompt += `Permission Level: ${tool.permission.toUpperCase()}\n`;

    // Format input as JSON
    try {
      const inputJson = JSON.stringify(input, null, 2);
      prompt += `\nInput:\n${inputJson}\n`;
    } catch (error) {
      prompt += `\nInput: [Could not serialize]\n`;
    }

    // Add warning for dangerous tools
    if (tool.permission === 'dangerous') {
      prompt += `\n${'!'.repeat(60)}\n`;
      prompt += `WARNING: This tool is marked as DANGEROUS.\n`;
      prompt += `It may perform destructive or irreversible operations.\n`;
      prompt += `${'!'.repeat(60)}\n`;
    }

    prompt += `${'='.repeat(60)}\n`;

    return prompt;
  }

  /**
   * Prompt user for permission via readline
   *
   * @param prompt - Formatted prompt string
   * @param permissionLevel - Permission level of the tool
   * @returns true if approved, false if denied
   */
  private promptUser(prompt: string, permissionLevel: 'moderate' | 'dangerous'): Promise<boolean> {
    // Use external prompt function if provided (injected by CLI)
    if (this.externalPromptFn) {
      return this.externalPromptFn(prompt, permissionLevel);
    }

    // Fallback: Default deny if no prompt function is set
    // This prevents readline conflicts in production
    logger.warn('No prompt function set, denying permission by default');
    return Promise.resolve(false);
  }
}

// ============================================================================
// Global Permission Manager Instance
// ============================================================================

/**
 * Global permission manager instance
 */
export const permissionManager = new PermissionManager();

### src/tools/tool-registry.ts - Tool Registry

/**
 * Tool Registry - Floyd Wrapper
 *
 * Central registry for all tools with registration, execution, and permission handling.
 */

import { z } from 'zod';
import type { ToolDefinition, ToolResult, ToolCategory } from '../types.ts';
import { logger } from '../utils/logger.ts';
import { ToolExecutionError } from '../utils/errors.ts';

// ============================================================================
// Tool Registry Class
// ============================================================================

/**
 * Registry for managing and executing tools
 */
export class ToolRegistry {
  /**
   * Map of all registered tools by name
   */
  private tools: Map<string, ToolDefinition>;

  /**
   * Map of tool names by category
   */
  private toolsByCategory: Map<ToolCategory, Set<string>>;

  /**
   * Current permission level for tool execution
   */
  private permissionLevel: 'auto' | 'ask' | 'deny';

  constructor() {
    this.tools = new Map();
    this.toolsByCategory = new Map();
    this.permissionLevel = 'ask';

    // Initialize category sets
    const categories: ToolCategory[] = ['file', 'search', 'build', 'git', 'browser', 'cache', 'patch', 'special'];
    for (const category of categories) {
      this.toolsByCategory.set(category, new Set());
    }

    logger.debug('ToolRegistry initialized');
  }

  /**
   * Set permission level for tool execution
   */
  setPermissionLevel(level: 'auto' | 'ask' | 'deny'): void {
    this.permissionLevel = level;
    logger.debug(`Permission level set to: ${level}`);
  }

  /**
   * Get current permission level
   */
  getPermissionLevel(): 'auto' | 'ask' | 'deny' {
    return this.permissionLevel;
  }

  /**
   * Register a new tool
   *
   * @throws Error if tool with same name already exists
   */
  register(tool: ToolDefinition): void {
    if (this.tools.has(tool.name)) {
      throw new ToolExecutionError(tool.name, `Tool "${tool.name}" already registered`);
    }

    this.tools.set(tool.name, tool);
    this.toolsByCategory.get(tool.category)!.add(tool.name);

    logger.debug(`Registered tool: ${tool.name} (${tool.category})`);
  }

  /**
   * Register multiple tools at once
   */
  registerAll(tools: ToolDefinition[]): void {
    for (const tool of tools) {
      this.register(tool);
    }
  }

  /**
   * Get a tool by name
   */
  get(name: string): ToolDefinition | undefined {
    return this.tools.get(name);
  }

  /**
   * Check if a tool is registered
   */
  has(name: string): boolean {
    return this.tools.has(name);
  }

  /**
   * Get all tool names
   */
  getAllNames(): string[] {
    return Array.from(this.tools.keys());
  }

  /**
   * Get all tool definitions
   */
  getAll(): ToolDefinition[] {
    return Array.from(this.tools.values());
  }

  /**
   * Get tools by category
   */
  getByCategory(category: ToolCategory): ToolDefinition[] {
    const toolNames = this.toolsByCategory.get(category);

    if (!toolNames) {
      return [];
    }

    const tools: ToolDefinition[] = [];
    const names = Array.from(toolNames);

    for (const name of names) {
      const tool = this.tools.get(name);
      if (tool) {
        tools.push(tool);
      }
    }

    return tools;
  }

  /**
   * Get tool names by category
   */
  getNamesByCategory(category: ToolCategory): string[] {
    const toolNames = this.toolsByCategory.get(category);
    return toolNames ? Array.from(toolNames) : [];
  }

  /**
   * Get all categories that have registered tools
   */
  getCategories(): ToolCategory[] {
    const categories: ToolCategory[] = [];
    const entries = Array.from(this.toolsByCategory.entries());

    for (const [category, tools] of entries) {
      if (tools.size > 0) {
        categories.push(category);
      }
    }

    return categories;
  }

  /**
   * Clear all registered tools
   */
  clear(): void {
    this.tools.clear();
    const toolSets = Array.from(this.toolsByCategory.values());

    for (const tools of toolSets) {
      tools.clear();
    }

    logger.debug('ToolRegistry cleared');
  }

  /**
   * Unregister a tool by name
   */
  unregister(name: string): boolean {
    const tool = this.tools.get(name);

    if (!tool) {
      return false;
    }

    // Remove from tools map
    this.tools.delete(name);

    // Remove from category set
    const categoryTools = this.toolsByCategory.get(tool.category);
    if (categoryTools) {
      categoryTools.delete(name);
    }

    logger.debug(`Unregistered tool: ${name}`);

    return true;
  }

  /**
   * Get tool documentation
   */
  getDocumentation(name: string): string | undefined {
    const tool = this.tools.get(name);

    if (!tool) {
      return undefined;
    }

    const lines: string[] = [];

    lines.push(`# ${tool.name}`);
    lines.push('');
    lines.push(`**Description:** ${tool.description}`);
    lines.push('');
    lines.push(`**Category:** ${tool.category}`);
    lines.push(`**Permission:** ${tool.permission}`);
    lines.push('');
    lines.push('**Input Schema:**');
    lines.push('```json');
    lines.push(JSON.stringify(tool.inputSchema, null, 2));
    lines.push('```');

    if (tool.example) {
      lines.push('');
      lines.push('**Example:**');
      lines.push('```json');
      lines.push(JSON.stringify(tool.example, null, 2));
      lines.push('```');
    }

    return lines.join('\n');
  }

  /**
   * Check if a tool requires permission
   */
  requiresPermission(toolName: string): boolean {
    const tool = this.tools.get(toolName);

    if (!tool) {
      return false;
    }

    return tool.permission !== 'none';
  }

  /**
   * Check if permission should be granted based on current level
   */
  shouldGrantPermission(tool: ToolDefinition): boolean {
    switch (this.permissionLevel) {
      case 'auto':
        // Auto-approve non-dangerous tools
        return tool.permission !== 'dangerous';

      case 'ask':
        // Always ask for tools that require permission
        return false;

      case 'deny':
        // Deny all tools that require permission
        return false;

      default:
        return false;
    }
  }

  /**
   * Execute a tool by name with given input
   */
  async execute(
    name: string,
    input: unknown,
    options: { permissionGranted?: boolean } = {}
  ): Promise<ToolResult> {
    const tool = this.tools.get(name);

    if (!tool) {
      return {
        success: false,
        error: {
          code: 'TOOL_NOT_FOUND',
          message: `Tool "${name}" not found in registry`,
        },
      };
    }

    // Validate input with Zod schema
    let validatedInput: unknown;

    try {
      validatedInput = tool.inputSchema.parse(input);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errorDetails = error.errors.map((e) => ({
          path: e.path.join('.'),
          message: e.message,
        }));

        return {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: `Invalid input for tool "${name}"`,
            details: errorDetails,
          },
        };
      }

      return {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: `Failed to validate input for tool "${name}"`,
          details: error instanceof Error ? error.message : String(error),
        },
      };
    }

    // Check permissions
    if (tool.permission !== 'none' && !options.permissionGranted) {
      if (!this.shouldGrantPermission(tool)) {
        logger.warn(`Permission required for tool: ${name}`);

        return {
          success: false,
          error: {
            code: 'PERMISSION_REQUIRED',
            message: `Permission required for tool "${name}" (level: ${tool.permission})`,
            details: {
              tool: name,
              permission: tool.permission,
            },
          },
        };
      }
    }

    // Execute tool
    logger.debug(`Executing tool: ${name}`);

    try {
      const result = await tool.execute(validatedInput);

      logger.debug(`Tool ${name} completed successfully`);
      logger.tool(name, validatedInput, result);

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);

      logger.error(`Tool ${name} failed: ${errorMessage}`);

      return {
        success: false,
        error: {
          code: 'TOOL_EXECUTION_FAILED',
          message: `Tool "${name}" execution failed`,
          details: error,
        },
      };
    }
  }

  /**
   * Get tool count
   */
  count(): number {
    return this.tools.size;
  }

  /**
   * Get tool count by category
   */
  countByCategory(): Record<string, number> {
    const counts: Record<string, number> = {};
    const entries = Array.from(this.toolsByCategory.entries());

    for (const [category, tools] of entries) {
      counts[category] = tools.size;
    }

    return counts;
  }

  /**
   * Generate tool definitions for API (Anthropic-compatible format)
   */
  toAPIDefinitions(): Array<{ name: string; description: string; input_schema: Record<string, unknown> }> {
    const definitions: Array<{ name: string; description: string; input_schema: Record<string, unknown> }> = [];

    for (const tool of this.getAll()) {
      // Convert Zod schema to JSON Schema
      const jsonSchema = this.zodToJsonSchema(tool.inputSchema);

      definitions.push({
        name: tool.name,
        description: tool.description,
        input_schema: jsonSchema,
      });
    }

    return definitions;
  }

  /**
   * Convert Zod schema to JSON Schema (simplified version)
   */
  private zodToJsonSchema(zodSchema: z.ZodTypeAny): Record<string, unknown> {
    // This is a simplified implementation
    // For production, use zod-to-json-schema library
    const schema: Record<string, unknown> = { type: 'object', properties: {} as Record<string, unknown> };

    if (zodSchema instanceof z.ZodObject) {
      const shape = zodSchema.shape as Record<string, z.ZodTypeAny>;
      const properties = schema.properties as Record<string, unknown>;

      for (const [key, value] of Object.entries(shape)) {
        const jsonSchema = this.zodTypeToJson(value);
        if (jsonSchema) {
          properties[key] = jsonSchema;
        }
      }
    }

    return schema;
  }

  /**
   * Convert individual Zod type to JSON Schema
   */
  private zodTypeToJson(zodType: z.ZodTypeAny): unknown {
    if (zodType instanceof z.ZodString) {
      return { type: 'string' };
    }

    if (zodType instanceof z.ZodNumber) {
      return { type: 'number' };
    }

    if (zodType instanceof z.ZodBoolean) {
      return { type: 'boolean' };
    }

    if (zodType instanceof z.ZodArray) {
      return {
        type: 'array',
        items: this.zodTypeToJson(zodType.element),
      };
    }

    if (zodType instanceof z.ZodOptional) {
      return this.zodTypeToJson(zodType.unwrap());
    }

    if (zodType instanceof z.ZodDefault) {
      return this.zodTypeToJson(zodType.removeDefault());
    }

    if (zodType instanceof z.ZodEnum) {
      return {
        type: 'string',
        enum: zodType.options,
      };
    }

    // Fallback for complex types
    return { type: 'object' };
  }

  /**
   * Generate tool summary
   */
  getSummary(): {
    total: number;
    byCategory: Record<string, number>;
    tools: Array<{ name: string; category: string; permission: string }>;
  } {
    const tools = this.getAll();

    return {
      total: this.count(),
      byCategory: this.countByCategory(),
      tools: tools.map((tool) => ({
        name: tool.name,
        category: tool.category,
        permission: tool.permission,
      })),
    };
  }
}

// ============================================================================
// Global Registry Instance
// ============================================================================

/**
 * Global tool registry instance
 */
export const toolRegistry = new ToolRegistry();

### src/tools/index.ts - Tool Registry and Registration

/**
 * Tool Registry - Floyd Wrapper
 *
 * Central registration point for all Floyd tools.
 * All tool implementations are copied from FLOYD_CLI and wrapped without logic changes.
 */

import { toolRegistry } from './tool-registry.ts';

// ============================================================================
// Import all tools
// ============================================================================

// Git tools
import { gitStatusTool } from './git/status.ts';
import { gitDiffTool } from './git/diff.ts';
import { gitLogTool } from './git/log.ts';
import { gitCommitTool } from './git/commit.ts';
import { gitStageTool } from './git/stage.ts';
import { gitUnstageTool } from './git/unstage.ts';
import { gitBranchTool } from './git/branch.ts';
import { isProtectedBranchTool } from './git/is-protected.ts';

// Cache tools
import { cacheStoreTool, cacheRetrieveTool, cacheDeleteTool, cacheClearTool, cacheListTool, cacheSearchTool, cacheStatsTool, cachePruneTool, cacheStorePatternTool, cacheStoreReasoningTool, cacheLoadReasoningTool, cacheArchiveReasoningTool } from './cache/index.ts';

// File tools
import { readFileTool, writeTool, editFileTool, searchReplaceTool } from './file/index.ts';

// Search tools
import { grepTool, codebaseSearchTool } from './search/index.ts';

// System tools
import { runTool, askUserTool } from './system/index.ts';

// Browser tools
import { browserStatusTool, browserNavigateTool, browserReadPageTool, browserScreenshotTool, browserClickTool, browserTypeTool, browserFindTool, browserGetTabsTool, browserCreateTabTool } from './browser/index.ts';

// Patch tools
import { applyUnifiedDiffTool, editRangeTool, insertAtTool, deleteRangeTool, assessPatchRiskTool } from './patch/index.ts';

// Build/Explorer tools
import { detectProjectTool, runTestsTool, formatTool, lintTool, buildTool, checkPermissionTool, projectMapTool, listSymbolsTool } from './build/index.ts';

// ============================================================================
// Re-export all tools
// ============================================================================

export * from './git/git-core.ts';
export { gitStatusTool } from './git/status.ts';
export { gitDiffTool } from './git/diff.ts';
export { gitLogTool } from './git/log.ts';
export { gitCommitTool } from './git/commit.ts';
export { gitStageTool } from './git/stage.ts';
export { gitUnstageTool } from './git/unstage.ts';
export { gitBranchTool } from './git/branch.ts';
export { isProtectedBranchTool } from './git/is-protected.ts';
export * from './cache/cache-core.ts';
export { cacheStoreTool, cacheRetrieveTool, cacheDeleteTool, cacheClearTool, cacheListTool, cacheSearchTool, cacheStatsTool, cachePruneTool, cacheStorePatternTool, cacheStoreReasoningTool, cacheLoadReasoningTool, cacheArchiveReasoningTool } from './cache/index.ts';
export * from './file/file-core.ts';
export { readFileTool } from './file/index.ts';
export * from './search/search-core.ts';
export { grepTool, codebaseSearchTool } from './search/index.ts';
export { runTool, askUserTool } from './system/index.ts';
export { browserStatusTool, browserNavigateTool, browserReadPageTool, browserScreenshotTool, browserClickTool, browserTypeTool, browserFindTool, browserGetTabsTool, browserCreateTabTool } from './browser/index.ts';
export * from './patch/patch-core.ts';
export { applyUnifiedDiffTool, editRangeTool, insertAtTool, deleteRangeTool, assessPatchRiskTool } from './patch/index.ts';
export * from './build/build-core.ts';
export { detectProjectTool, runTestsTool, formatTool, lintTool, buildTool, checkPermissionTool, projectMapTool, listSymbolsTool } from './build/index.ts';

// ============================================================================
// Tool Registration
// ============================================================================

/**
 * Register all core tools with the tool registry
 */
export function registerCoreTools(): void {
	// Git tools (8 tools)
	toolRegistry.register(gitStatusTool);
	toolRegistry.register(gitDiffTool);
	toolRegistry.register(gitLogTool);
	toolRegistry.register(gitCommitTool);
	toolRegistry.register(gitStageTool);
	toolRegistry.register(gitUnstageTool);
	toolRegistry.register(gitBranchTool);
	toolRegistry.register(isProtectedBranchTool);

	// Cache tools (11 tools)
	toolRegistry.register(cacheStoreTool);
	toolRegistry.register(cacheRetrieveTool);
	toolRegistry.register(cacheDeleteTool);
	toolRegistry.register(cacheClearTool);
	toolRegistry.register(cacheListTool);
	toolRegistry.register(cacheSearchTool);
	toolRegistry.register(cacheStatsTool);
	toolRegistry.register(cachePruneTool);
	toolRegistry.register(cacheStorePatternTool);
	toolRegistry.register(cacheStoreReasoningTool);
	toolRegistry.register(cacheLoadReasoningTool);
	toolRegistry.register(cacheArchiveReasoningTool);

	// File tools (4 tools)
	toolRegistry.register(readFileTool);
	toolRegistry.register(writeTool);
	toolRegistry.register(editFileTool);
	toolRegistry.register(searchReplaceTool);

	// Search tools (2 tools)
	toolRegistry.register(grepTool);
	toolRegistry.register(codebaseSearchTool);

	// System tools (2 tools)
	toolRegistry.register(runTool);
	toolRegistry.register(askUserTool);

	// Browser tools (9 tools)
	toolRegistry.register(browserStatusTool);
	toolRegistry.register(browserNavigateTool);
	toolRegistry.register(browserReadPageTool);
	toolRegistry.register(browserScreenshotTool);
	toolRegistry.register(browserClickTool);
	toolRegistry.register(browserTypeTool);
	toolRegistry.register(browserFindTool);
	toolRegistry.register(browserGetTabsTool);
	toolRegistry.register(browserCreateTabTool);

	// Patch tools (5 tools)
	toolRegistry.register(applyUnifiedDiffTool);
	toolRegistry.register(editRangeTool);
	toolRegistry.register(insertAtTool);
	toolRegistry.register(deleteRangeTool);
	toolRegistry.register(assessPatchRiskTool);

	// Build/Explorer tools (8 tools)
	toolRegistry.register(detectProjectTool);
	toolRegistry.register(runTestsTool);
	toolRegistry.register(formatTool);
	toolRegistry.register(lintTool);
	toolRegistry.register(buildTool);
	toolRegistry.register(checkPermissionTool);
	toolRegistry.register(projectMapTool);
	toolRegistry.register(listSymbolsTool);
}

// ============================================================================
// Exports
// ============================================================================

export { toolRegistry };
export * from './tool-registry.ts';

### src/tools/file/file-core.ts - Core File Operations

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

### src/tools/file/index.ts - File Tool Wrappers

/**
 * File Tools - Floyd Wrapper
 *
 * File operation tools copied from FLOYD_CLI and wrapped
 */

import { z } from 'zod';
import type { ToolDefinition } from '../../types.ts';
import * as fileCore from './file-core.ts';
import { sanitizeFilePath } from '../../utils/security.ts';

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

### src/tools/cache/cache-core.ts - Cache Manager

/**
 * Cache Core - Copied from FLOYD_CLI
 *
 * This is the exact CacheManager class from /Volumes/Storage/FLOYD_CLI/INK/floyd-cli/src/cache/cache-manager.ts
 * Only imports have been adjusted for the Floyd Wrapper project structure.
 */

import { promises as fs } from 'fs';
import { join } from 'path';

export type CacheTier = 'reasoning' | 'project' | 'vault';

export interface CacheEntry {
	key: string;
	value: string;
	timestamp: number;
	ttl: number; // milliseconds
	tier: CacheTier;
	metadata?: Record<string, unknown>;
	version?: number; // Cache version
	lastAccess?: number; // For LRU eviction
	compressed?: boolean; // Whether value is compressed
}

export interface CacheStats {
	tier: CacheTier;
	count: number;
	totalSize: number;
	oldestEntry?: number;
	newestEntry?: number;
}

// Reasoning Frame Schema (matching blueprint)
export interface ReasoningFrame {
	frame_id: string;
	task_id: string;
	start_time: string;
	last_updated?: string;
	cog_steps: CogStep[];
	current_focus?: string;
	validation_hash?: string;
	glm_context?: {
		thinking_mode: 'preserved';
		last_cog_step_hash: number;
		session_continuity_token: string;
	};
}

export interface CogStep {
	timestamp: string;
	step_type: 'FRAME_START' | 'COG_STEP' | 'FRAME_APPEND' | 'TOOL_CALL' | 'DECISION';
	content: string;
	tool_used?: string;
	tool_result_hash?: string;
}

// Solution Pattern Schema (matching blueprint)
export interface SolutionPattern {
	signature: string;
	human_name?: string;
	trigger_terms: string[];
	category: 'ui_component' | 'api_endpoint' | 'auth_flow' | 'database' | 'devops' | 'utility';
	implementation: string;
	validation_tests?: string;
	dependencies?: string[];
	created: string;
	last_used?: string;
	success_count?: number;
	failure_count?: number;
	complexity_score?: number;
	embedding_vector?: number[];
}

// Project State Snapshot (matching blueprint)
export interface ProjectStateSnapshot {
	snapshot_time: string;
	project_root: string;
	active_branch: string;
	last_commit: string;
	master_plan_phase?: string;
	recent_commands: string[];
	active_ports?: Array<{
		port: number;
		service: string;
		pid: number;
	}>;
	recent_errors?: Array<{
		timestamp: string;
		tool: string;
		error: string;
		resolved: boolean;
	}>;
}

const TTL_CONFIG: Record<CacheTier, number> = {
	reasoning: 5 * 60 * 1000, // 5 minutes
	project: 24 * 60 * 60 * 1000, // 24 hours
	vault: 7 * 24 * 60 * 60 * 1000, // 7 days
};

// Size limits per tier (max number of entries)
const SIZE_LIMITS: Record<CacheTier, number> = {
	reasoning: 100, // 100 entries
	project: 500, // 500 entries
	vault: 1000, // 1000 entries
};

// Cache version
const CACHE_VERSION = 1;

export interface CacheConfig {
	cacheDir?: string;
	maxSize?: Partial<Record<CacheTier, number>>;
	compressThreshold?: number;
}

export class CacheManager {
	private cacheRoot: string;
	private tiers: CacheTier[] = ['reasoning', 'project', 'vault'];
	private maxSize: Record<CacheTier, number>;

	constructor(projectRoot: string, config?: CacheConfig) {
		this.cacheRoot = join(projectRoot, '.floyd', '.cache');
		this.maxSize = {
			reasoning: config?.maxSize?.reasoning || SIZE_LIMITS.reasoning,
			project: config?.maxSize?.project || SIZE_LIMITS.project,
			vault: config?.maxSize?.vault || SIZE_LIMITS.vault,
		};
	}

	private getTierPath(tier: CacheTier): string {
		return join(this.cacheRoot, tier);
	}

	private getEntryPath(tier: CacheTier, key: string): string {
		const safeKey = key.replace(/[^a-zA-Z0-9_-]/g, '_');
		return join(this.getTierPath(tier), `${safeKey}.json`);
	}

	private hash(input: string): number {
		let hash = 0;
		for (let i = 0; i < input.length; i++) {
			const char = input.charCodeAt(i);
			hash = (hash << 5) - hash + char;
			hash = hash & hash;
		}
		return Math.abs(hash);
	}

	private generateContinuityToken(): string {
		return `${Date.now()}-${Math.random().toString(36).substring(7)}`;
	}

	async store(
		tier: CacheTier,
		key: string,
		value: string,
		metadata?: Record<string, unknown>,
	): Promise<void> {
		// Validate inputs
		if (!key || key.trim().length === 0) {
			throw new Error('Cache key cannot be empty');
		}
		if (value === undefined || value === null) {
			throw new Error('Cache value cannot be null or undefined');
		}

		const entry: CacheEntry = {
			key,
			value,
			timestamp: Date.now(),
			lastAccess: Date.now(),
			ttl: TTL_CONFIG[tier],
			tier,
			metadata,
			version: CACHE_VERSION,
		};

		const entryPath = this.getEntryPath(tier, key);

		// Ensure directory exists
		const tierPath = this.getTierPath(tier);
		await fs.mkdir(tierPath, {recursive: true});

		await fs.writeFile(entryPath, JSON.stringify(entry, null, 2));

		// Enforce size limit - remove oldest entry if at capacity
		await this.enforceSizeLimit(tier);
	}

	async retrieve(tier: CacheTier, key: string): Promise<string | null> {
		const entryPath = this.getEntryPath(tier, key);

		try {
			const content = await fs.readFile(entryPath, 'utf-8');
			const entry: CacheEntry = JSON.parse(content);

			// Check if expired
			const now = Date.now();
			if (now - entry.timestamp > entry.ttl) {
				// Expired - delete and return null
				await this.delete(tier, key);
				return null;
			}

			// Update last access time for LRU
			entry.lastAccess = now;
			await fs.writeFile(entryPath, JSON.stringify(entry, null, 2));

			return entry.value;
		} catch {
			return null;
		}
	}

	private async enforceSizeLimit(tier: CacheTier): Promise<void> {
		const entries = await this.list(tier);
		const maxSize = this.maxSize[tier];

		if (entries.length <= maxSize) {
			return; // Under limit, nothing to do
		}

		// Sort by lastAccess time (oldest first) and remove excess
		const toRemove = entries
			.sort((a, b) => (a.lastAccess || a.timestamp) - (b.lastAccess || b.timestamp))
			.slice(0, entries.length - maxSize);

		for (const entry of toRemove) {
			await this.delete(tier, entry.key);
		}
	}

	async delete(tier: CacheTier, key: string): Promise<boolean> {
		const entryPath = this.getEntryPath(tier, key);

		try {
			await fs.unlink(entryPath);
			return true;
		} catch {
			return false;
		}
	}

	async clear(tier?: CacheTier): Promise<number> {
		let deleted = 0;

		if (tier) {
			const tierPath = this.getTierPath(tier);
			try {
				const files = await fs.readdir(tierPath);
				for (const file of files) {
					if (file.endsWith('.json')) {
						await fs.unlink(join(tierPath, file));
						deleted++;
					}
				}
			} catch {
				// Directory doesn't exist
			}
		} else {
			// Clear all tiers
			for (const t of this.tiers) {
				deleted += await this.clear(t);
			}
		}

		return deleted;
	}

	async list(tier?: CacheTier): Promise<CacheEntry[]> {
		const entries: CacheEntry[] = [];
		const tiersToCheck = tier ? [tier] : this.tiers;

		for (const t of tiersToCheck) {
			const tierPath = this.getTierPath(t);
			try {
				const files = await fs.readdir(tierPath);
				for (const file of files) {
					if (file.endsWith('.json')) {
						const content = await fs.readFile(join(tierPath, file), 'utf-8');
						const entry: CacheEntry = JSON.parse(content);

						// Skip expired entries
						const now = Date.now();
						if (now - entry.timestamp <= entry.ttl) {
							entries.push(entry);
						}
					}
				}
			} catch {
				// Directory might not exist or be empty
			}
		}

		// Sort by timestamp descending
		return entries.sort((a, b) => b.timestamp - a.timestamp);
	}

	async search(tier: CacheTier, query: string): Promise<CacheEntry[]> {
		const allEntries = await this.list(tier);
		const lowerQuery = query.toLowerCase();

		return allEntries.filter(
			(entry) =>
				entry.key.toLowerCase().includes(lowerQuery) ||
				entry.value.toLowerCase().includes(lowerQuery),
		);
	}

	async getStats(tier?: CacheTier): Promise<CacheStats[]> {
		const stats: CacheStats[] = [];
		const tiersToCheck = tier ? [tier] : this.tiers;

		for (const t of tiersToCheck) {
			const tierPath = this.getTierPath(t);
			const stat: CacheStats = {
				tier: t,
				count: 0,
				totalSize: 0,
			};

			try {
				const files = await fs.readdir(tierPath);
				for (const file of files) {
					if (file.endsWith('.json')) {
						const filePath = join(tierPath, file);
						const content = await fs.readFile(filePath, 'utf-8');
						const entry: CacheEntry = JSON.parse(content);

						// Count only non-expired entries
						const now = Date.now();
						if (now - entry.timestamp <= entry.ttl) {
							stat.count++;
							stat.totalSize += content.length;

							if (!stat.oldestEntry || entry.timestamp < stat.oldestEntry) {
								stat.oldestEntry = entry.timestamp;
							}
							if (!stat.newestEntry || entry.timestamp > stat.newestEntry) {
								stat.newestEntry = entry.timestamp;
							}
						}
					}
				}
			} catch {
				// Directory might not exist
			}

			stats.push(stat);
		}

		return stats;
	}

	async prune(tier?: CacheTier): Promise<number> {
		let pruned = 0;
		const tiersToCheck = tier ? [tier] : this.tiers;

		for (const t of tiersToCheck) {
			const tierPath = this.getTierPath(t);
			try {
				const files = await fs.readdir(tierPath);
				for (const file of files) {
					if (file.endsWith('.json')) {
						const filePath = join(tierPath, file);
						const content = await fs.readFile(filePath, 'utf-8');
						const entry: CacheEntry = JSON.parse(content);

						// Check if expired
						const now = Date.now();
						if (now - entry.timestamp > entry.ttl) {
							await fs.unlink(filePath);
							pruned++;
						}
					}
				}
			} catch {
				// Directory might not exist
			}
		}

		return pruned;
	}

	async storeReasoningFrame(frame: ReasoningFrame): Promise<void> {
		try {
			const lastStep = frame.cog_steps[frame.cog_steps.length - 1];

			frame.glm_context = {
				thinking_mode: 'preserved',
				last_cog_step_hash: lastStep ? this.hash(JSON.stringify(lastStep)) : 0,
				session_continuity_token: this.generateContinuityToken(),
			};

			// Ensure directory exists
			const activeDir = join(this.cacheRoot, 'reasoning', 'active');
			await fs.mkdir(activeDir, {recursive: true});

			const filepath = join(activeDir, 'frame.json');
			await fs.writeFile(filepath, JSON.stringify(frame, null, 2));
		} catch (error) {
			throw new Error(
				`Failed to store reasoning frame: ${(error as Error).message}`,
			);
		}
	}

	async loadReasoningFrame(): Promise<ReasoningFrame | null> {
		const filepath = join(this.cacheRoot, 'reasoning', 'active', 'frame.json');
		try {
			const content = await fs.readFile(filepath, 'utf-8');
			const frame = JSON.parse(content) as ReasoningFrame;

			// Validate frame structure
			if (!frame.frame_id || !Array.isArray(frame.cog_steps)) {
				throw new Error('Invalid frame structure');
			}

			return frame;
		} catch (error) {
			// File doesn't exist or is corrupted
			return null;
		}
	}

	async archiveFrame(): Promise<void> {
		const activePath = join(this.cacheRoot, 'reasoning', 'active', 'frame.json');
		const archiveDir = join(this.cacheRoot, 'reasoning', 'archive');
		const archivePath = join(archiveDir, `frame-${Date.now()}.json`);

		try {
			// Ensure archive directory exists
			await fs.mkdir(archiveDir, {recursive: true});
			await fs.rename(activePath, archivePath);
		} catch (error) {
			// File may not exist or other error - log but don't throw
			if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
				console.error(`Warning: Failed to archive frame: ${(error as Error).message}`);
			}
		}
	}

	async storePattern(name: string, pattern: string, tags?: string[]): Promise<void> {
		try {
			// Validate inputs
			if (!name || name.trim().length === 0) {
				throw new Error('Pattern name cannot be empty');
			}
			if (!pattern || pattern.trim().length === 0) {
				throw new Error('Pattern content cannot be empty');
			}

			const entry: CacheEntry = {
				key: name,
				value: pattern,
				timestamp: Date.now(),
				ttl: TTL_CONFIG.vault,
				tier: 'vault',
				metadata: { tags },
			};

			// Store in both patterns directory and main vault directory for listing
			const patternDir = join(this.cacheRoot, 'vault', 'patterns');
			await fs.mkdir(patternDir, {recursive: true});

			const patternPath = join(patternDir, `${name}.json`);
			await fs.writeFile(patternPath, JSON.stringify(entry, null, 2));

			// Also store in main vault tier directory so it appears in list()
			const vaultPath = this.getEntryPath('vault', `pattern:${name}`);
			await fs.writeFile(vaultPath, JSON.stringify(entry, null, 2));
		} catch (error) {
			throw new Error(`Failed to store pattern: ${(error as Error).message}`);
		}
	}
}

### src/tools/cache/index.ts - Cache Tool Wrappers

/**
 * Cache Tools Index - Floyd Wrapper
 *
 * All cache tool wrappers copied from FLOYD_CLI
 */

import { z } from 'zod';
import type { ToolDefinition } from '../../types.ts';
import { CacheManager, type ReasoningFrame } from './cache-core.ts';

// Get cache manager instance
let cacheManager: CacheManager | null = null;
let projectRoot: string = process.cwd();

/**
 * Set project root for cache (used for testing)
 */
export function setProjectRoot(root: string): void {
	projectRoot = root;
	cacheManager = null; // Reset to force recreation with new root
}

/**
 * Get cache manager instance
 */
function getCacheManager(): CacheManager {
	if (!cacheManager) {
		cacheManager = new CacheManager(projectRoot);
	}
	return cacheManager;
}

// ============================================================================
// Cache Store Tool
// ============================================================================

export const cacheStoreTool: ToolDefinition = {
	name: 'cache_store',
	description: 'Store data to a cache tier with optional metadata',
	category: 'cache',
	inputSchema: z.object({
		tier: z.enum(['reasoning', 'project', 'vault']),
		key: z.string(),
		value: z.string(),
		metadata: z.record(z.unknown()).optional(),
	}),
	permission: 'none',
	execute: async (input) => {
		// Validate input using Zod schema
		const validationResult = cacheStoreTool.inputSchema.safeParse(input);
		if (!validationResult.success) {
			const errors = validationResult.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
			return {
				success: false,
				error: {
					code: 'VALIDATION_ERROR',
					message: `Input validation failed: ${errors}`
				}
			};
		}

		const { tier, key, value, metadata } = validationResult.data;
		const cache = getCacheManager();
		await cache.store(tier, key, value, metadata);
		return {
			success: true,
			data: { success: true, tier, key, message: `Stored to ${tier} tier` }
		};
	}
} as ToolDefinition;

// ============================================================================
// Cache Retrieve Tool
// ============================================================================

export const cacheRetrieveTool: ToolDefinition = {
	name: 'cache_retrieve',
	description: 'Retrieve data from a cache tier by key',
	category: 'cache',
	inputSchema: z.object({
		tier: z.enum(['reasoning', 'project', 'vault']),
		key: z.string(),
	}),
	permission: 'none',
	execute: async (input) => {
		const validationResult = cacheRetrieveTool.inputSchema.safeParse(input);
		if (!validationResult.success) {
			const errors = validationResult.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
			return {
				success: false,
				error: {
					code: 'VALIDATION_ERROR',
					message: `Input validation failed: ${errors}`
				}
			};
		}

		const { tier, key } = validationResult.data;
		const cache = getCacheManager();
		const value = await cache.retrieve(tier, key);
		return {
			success: value !== null,
			data: { tier, key, found: value !== null, value }
		};
	}
} as ToolDefinition;

// ============================================================================
// Cache Delete Tool
// ============================================================================

export const cacheDeleteTool: ToolDefinition = {
	name: 'cache_delete',
	description: 'Delete a cache entry by key',
	category: 'cache',
	inputSchema: z.object({
		tier: z.enum(['reasoning', 'project', 'vault']),
		key: z.string(),
	}),
	permission: 'moderate',
	execute: async (input) => {
		const { tier, key } = input as z.infer<typeof cacheDeleteTool.inputSchema>;
		const cache = getCacheManager();
		const deleted = await cache.delete(tier, key);
		return {
			success: deleted,
			data: { success: deleted, tier, key, message: deleted ? 'Deleted' : 'Not found' }
		};
	}
} as ToolDefinition;

// ============================================================================
// Cache Clear Tool
// ============================================================================

export const cacheClearTool: ToolDefinition = {
	name: 'cache_clear',
	description: 'Clear all entries from a cache tier, or all tiers if not specified',
	category: 'cache',
	inputSchema: z.object({
		tier: z.enum(['reasoning', 'project', 'vault']).optional(),
	}),
	permission: 'dangerous',
	execute: async (input) => {
		const { tier } = input as z.infer<typeof cacheClearTool.inputSchema>;
		const cache = getCacheManager();
		const count = await cache.clear(tier);
		return {
			success: true,
			data: { success: true, deleted: count, tier: tier || 'all', message: `Cleared ${count} entries` }
		};
	}
} as ToolDefinition;

// ============================================================================
// Cache List Tool
// ============================================================================

export const cacheListTool: ToolDefinition = {
	name: 'cache_list',
	description: 'List all non-expired entries in a cache tier',
	category: 'cache',
	inputSchema: z.object({
		tier: z.enum(['reasoning', 'project', 'vault']).optional(),
	}),
	permission: 'none',
	execute: async (input) => {
		const { tier } = input as z.infer<typeof cacheListTool.inputSchema>;
		const cache = getCacheManager();
		const entries = await cache.list(tier);
		return {
			success: true,
			data: {
				count: entries.length,
				entries: entries.map(e => ({
					key: e.key,
					tier: e.tier,
					timestamp: e.timestamp,
					metadata: e.metadata
				}))
			}
		};
	}
} as ToolDefinition;

// ============================================================================
// Cache Search Tool
// ============================================================================

export const cacheSearchTool: ToolDefinition = {
	name: 'cache_search',
	description: 'Search for entries in a cache tier by key or value',
	category: 'cache',
	inputSchema: z.object({
		tier: z.enum(['reasoning', 'project', 'vault']),
		query: z.string(),
	}),
	permission: 'none',
	execute: async (input) => {
		const { tier, query } = input as z.infer<typeof cacheSearchTool.inputSchema>;
		const cache = getCacheManager();
		const results = await cache.search(tier, query);
		return {
			success: true,
			data: {
				query,
				tier,
				count: results.length,
				results: results.map(e => ({
					key: e.key,
					timestamp: e.timestamp,
					metadata: e.metadata
				}))
			}
		};
	}
} as ToolDefinition;

// ============================================================================
// Cache Stats Tool
// ============================================================================

export const cacheStatsTool: ToolDefinition = {
	name: 'cache_stats',
	description: 'Get statistics for cache tiers (entry count, size, oldest/newest)',
	category: 'cache',
	inputSchema: z.object({
		tier: z.enum(['reasoning', 'project', 'vault']).optional(),
	}),
	permission: 'none',
	execute: async (input) => {
		const { tier } = input as z.infer<typeof cacheStatsTool.inputSchema>;
		const cache = getCacheManager();
		const stats = await cache.getStats(tier);
		const result: Record<string, {
			entries: number;
			active: number;
			sizeBytes: number;
			oldest?: { key: string; timestamp: number };
			newest?: { key: string; timestamp: number };
		}> = {};
		for (const stat of stats) {
			result[stat.tier] = {
				entries: stat.count,
				active: stat.count,
				sizeBytes: stat.totalSize,
				oldest: stat.oldestEntry ? { key: '', timestamp: stat.oldestEntry } : undefined,
				newest: stat.newestEntry ? { key: '', timestamp: stat.newestEntry } : undefined
			};
		}
		return {
			success: true,
			data: result
		};
	}
} as ToolDefinition;

// ============================================================================
// Cache Prune Tool
// ============================================================================

export const cachePruneTool: ToolDefinition = {
	name: 'cache_prune',
	description: 'Remove all expired entries from cache tiers',
	category: 'cache',
	inputSchema: z.object({
		tier: z.enum(['reasoning', 'project', 'vault']).optional(),
	}),
	permission: 'moderate',
	execute: async (input) => {
		const { tier } = input as z.infer<typeof cachePruneTool.inputSchema>;
		const cache = getCacheManager();
		const pruned = await cache.prune(tier);
		return {
			success: true,
			data: { success: true, pruned, tier: tier || 'all', message: `Pruned ${pruned} expired entries` }
		};
	}
} as ToolDefinition;

// ============================================================================
// Cache Store Pattern Tool
// ============================================================================

export const cacheStorePatternTool: ToolDefinition = {
	name: 'cache_store_pattern',
	description: 'Store a reusable pattern to the vault tier',
	category: 'cache',
	inputSchema: z.object({
		name: z.string(),
		pattern: z.string(),
		tags: z.array(z.string()).optional(),
	}),
	permission: 'none',
	execute: async (input) => {
		const { name, pattern, tags } = input as z.infer<typeof cacheStorePatternTool.inputSchema>;
		const cache = getCacheManager();
		await cache.storePattern(name, pattern, tags);
		return {
			success: true,
			data: { success: true, name, tags, message: 'Pattern stored to vault' }
		};
	}
} as ToolDefinition;

// ============================================================================
// Cache Store Reasoning Tool
// ============================================================================

export const cacheStoreReasoningTool: ToolDefinition = {
	name: 'cache_store_reasoning',
	description: 'Store a reasoning frame to the active reasoning frame',
	category: 'cache',
	inputSchema: z.object({
		frame: z.string(),
	}),
	permission: 'none',
	execute: async (input) => {
		const { frame } = input as z.infer<typeof cacheStoreReasoningTool.inputSchema>;
		const cache = getCacheManager();
		const reasoningFrame = JSON.parse(frame) as ReasoningFrame;
		await cache.storeReasoningFrame(reasoningFrame);
		return {
			success: true,
			data: { success: true, steps: reasoningFrame.cog_steps.length, message: `Reasoning frame stored with ${reasoningFrame.cog_steps.length} steps` }
		};
	}
} as ToolDefinition;

// ============================================================================
// Cache Load Reasoning Tool
// ============================================================================

export const cacheLoadReasoningTool: ToolDefinition = {
	name: 'cache_load_reasoning',
	description: 'Load the active reasoning frame',
	category: 'cache',
	inputSchema: z.object({}),
	permission: 'none',
	execute: async () => {
		const cache = getCacheManager();
		const frame = await cache.loadReasoningFrame();
		return {
			success: frame !== null,
			data: { found: frame !== null, frame }
		};
	}
} as ToolDefinition;

// ============================================================================
// Cache Archive Reasoning Tool
// ============================================================================

export const cacheArchiveReasoningTool: ToolDefinition = {
	name: 'cache_archive_reasoning',
	description: 'Archive the active reasoning frame to the archive',
	category: 'cache',
	inputSchema: z.object({}),
	permission: 'moderate',
	execute: async () => {
		const cache = getCacheManager();
		await cache.archiveFrame();
		return {
			success: true,
			data: { success: true, message: 'Active reasoning frame archived' }
		};
	}
} as ToolDefinition;

### src/tools/search/search-core.ts - Search Core

/**
 * Search Core - Copied from FLOYD_CLI
 *
 * Core search functions from the MCP servers
 */

import { globby } from 'globby';

export async function grep(pattern: string, options: {
	path?: string;
	filePattern?: string;
	caseInsensitive?: boolean;
	outputMode?: 'content' | 'files_with_matches' | 'count';
}): Promise<{ success: boolean; matches?: Array<{ file: string; line: number; content: string; matchStart: number; matchEnd: number }>; totalMatches?: number; filesWithMatches?: number; error?: string }> {
	try {
		const { path: searchPath = '.', filePattern = '**/*', caseInsensitive = false } = options;

		const files = await globby(filePattern, { cwd: searchPath });
		const matches: Array<{ file: string; line: number; content: string; matchStart: number; matchEnd: number }> = [];
		const regex = new RegExp(pattern, caseInsensitive ? 'gi' : 'g');

		for (const file of files) {
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
						matchStart: match.index,
						matchEnd: match.index + match[0].length
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
		const files = await globby('**/*.{ts,tsx,rs,js,md}', { cwd: searchPath, ignore: ['node_modules', 'dist', 'target'] });
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

### src/tools/search/index.ts - Search Tool Wrappers

/**
 * Search Tools - Floyd Wrapper
 *
 * Search tools copied from FLOYD_CLI and wrapped
 */

import { z } from 'zod';
import type { ToolDefinition } from '../../types.ts';
import * as searchCore from './search-core.ts';

// ============================================================================
// Grep Tool
// ============================================================================

export const grepTool: ToolDefinition = {
	name: 'grep',
	description: 'Search file contents with regex patterns',
	category: 'search',
	inputSchema: z.object({
		pattern: z.string(),
		path: z.string().optional().default('.'),
		filePattern: z.string().optional().default('**/*'),
		caseInsensitive: z.boolean().optional().default(false),
		outputMode: z.enum(['content', 'files_with_matches', 'count']).optional().default('content'),
	}),
	permission: 'none',
	execute: async (input) => {
		const params = input as z.infer<typeof grepTool.inputSchema>;
		const result = await searchCore.grep(params.pattern, params);
		if (result.success) {
			return { success: true, data: result };
		}
		return { success: false, error: { code: 'GREP_ERROR', message: result.error || 'Unknown error', details: params } };
	}
} as ToolDefinition;

// ============================================================================
// Codebase Search Tool
// ============================================================================

export const codebaseSearchTool: ToolDefinition = {
	name: 'codebase_search',
	description: 'Search entire codebase with semantic understanding',
	category: 'search',
	inputSchema: z.object({
		query: z.string(),
		path: z.string().optional().default('.'),
		maxResults: z.number().optional().default(20),
	}),
	permission: 'none',
	execute: async (input) => {
		const params = input as z.infer<typeof codebaseSearchTool.inputSchema>;
		const result = await searchCore.codebaseSearch(params.query, params);
		if (result.success) {
			return { success: true, data: result };
		}
		return { success: false, error: { code: 'CODEBASE_SEARCH_ERROR', message: result.error || 'Unknown error', details: params } };
	}
} as ToolDefinition;

### src/tools/build/build-core.ts - Build Core

/**
 * Build Core - Copied from FLOYD_CLI
 *
 * Core build/explorer functions from runner-server.ts and explorer-server.ts
 */

import fs from 'fs-extra';
import path from 'path';
import { execa } from 'execa';
import { globby } from 'globby';

export type ProjectType = 'node' | 'go' | 'rust' | 'python' | 'unknown';

export interface ProjectDetection {
	type: ProjectType;
	confidence: number;
	packageManager?: 'npm' | 'yarn' | 'pnpm' | 'go' | 'cargo' | 'pip' | 'poetry';
	commands: {
		test?: string;
		format?: string;
		lint?: string;
		build?: string;
	};
	hasConfigFiles: string[];
}

export async function detectProject(projectPath: string = process.cwd()): Promise<ProjectDetection> {
	const result: ProjectDetection = {
		type: 'unknown',
		confidence: 0,
		commands: {},
		hasConfigFiles: [],
	};

	try {
		const files = await fs.readdir(projectPath);

		// Node.js detection
		const hasPackageJson = files.includes('package.json');
		const hasTsConfig = files.includes('tsconfig.json');
		const hasPnpmLock = files.includes('pnpm-lock.yaml');
		const hasYarnLock = files.includes('yarn.lock');
		const hasNpmLock = files.includes('package-lock.json');

		if (hasPackageJson) {
			result.type = 'node';
			result.confidence = 0.8;
			result.hasConfigFiles.push('package.json');

			if (hasTsConfig) {
				result.hasConfigFiles.push('tsconfig.json');
				result.confidence += 0.1;
			}

			if (hasPnpmLock) result.packageManager = 'pnpm';
			else if (hasYarnLock) result.packageManager = 'yarn';
			else if (hasNpmLock) result.packageManager = 'npm';
			else result.packageManager = 'npm';

			const pm = result.packageManager;
			result.commands.test = `${pm} test`;
			result.commands.lint = `${pm} run lint`;
			result.commands.build = `${pm} run build`;

			try {
				const pkgPath = path.join(projectPath, 'package.json');
				const pkg = await fs.readJson(pkgPath);
				if (pkg.scripts) {
					if (pkg.scripts.test) result.commands.test = `${pm} test`;
					if (pkg.scripts.lint) result.commands.lint = `${pm} run lint`;
					if (pkg.scripts.build) result.commands.build = `${pm} run build`;
					if (pkg.scripts.format) result.commands.format = `${pm} run format`;
				}
			} catch {
			// Ignore errors
		}
		}

		// Go detection
		const hasGoMod = files.includes('go.mod');
		const hasGoSum = files.includes('go.sum');
		const hasMainGo = await fileExists(path.join(projectPath, 'cmd', 'main.go')) || await fileExists(path.join(projectPath, 'main.go'));

		if (hasGoMod || hasGoSum || hasMainGo) {
			result.type = 'go';
			result.confidence = 0.95;
			result.packageManager = 'go';
			result.hasConfigFiles.push('go.mod');
			result.commands.test = 'go test ./...';
			result.commands.build = 'go build ./...';
			result.commands.lint = 'golangci-lint run';
			result.commands.format = 'gofmt -w .';
		}

		// Rust detection
		const hasCargoToml = files.includes('Cargo.toml');
		const hasCargoLock = files.includes('Cargo.lock');
		const hasSrcRs = await fileExists(path.join(projectPath, 'src', 'main.rs')) || await fileExists(path.join(projectPath, 'src', 'lib.rs'));

		if (hasCargoToml || hasCargoLock || hasSrcRs) {
			result.type = 'rust';
			result.confidence = 0.95;
			result.packageManager = 'cargo';
			result.hasConfigFiles.push('Cargo.toml');
			result.commands.test = 'cargo test';
			result.commands.build = 'cargo build';
			result.commands.lint = 'cargo clippy';
			result.commands.format = 'cargo fmt';
		}

		// Python detection
		const hasPyProject = files.includes('pyproject.toml');
		const hasRequirementsTxt = files.includes('requirements.txt');
		const hasSetupPy = files.includes('setup.py');
		const hasMainPy = await fileExists(path.join(projectPath, 'main.py')) || await fileExists(path.join(projectPath, 'app.py'));

		if (hasPyProject || hasRequirementsTxt || hasSetupPy || hasMainPy) {
			result.type = 'python';
			result.confidence = hasPyProject ? 0.9 : 0.7;
			result.hasConfigFiles.push(hasPyProject ? 'pyproject.toml' : 'requirements.txt');

			if (hasPyProject) {
				try {
					const pyprojectPath = path.join(projectPath, 'pyproject.toml');
					const content = await fs.readFile(pyprojectPath, 'utf-8');
					if (content.includes('poetry')) {
						result.packageManager = 'poetry';
						result.commands.test = 'poetry run pytest';
						result.commands.lint = 'poetry run pylint';
						result.commands.format = 'poetry run black .';
					}
				} catch {
			// Ignore errors
		}
			}

			if (!result.packageManager || result.packageManager === 'pip') {
				result.packageManager = 'pip';
				result.commands.test = 'pytest';
				result.commands.lint = 'pylint';
				result.commands.format = 'black .';
			}
		}
	} catch {
		// Ignore errors
	}

	return result;
}

async function fileExists(filePath: string): Promise<boolean> {
	try {
		await fs.access(filePath);
		return true;
	} catch {
		// Ignore errors
		return false;
	}
}

function parseCommandString(cmdString: string): { command: string; args: string[] } {
	const parts = cmdString.trim().split(/\s+/);
	return { command: parts[0] || '', args: parts.slice(1) || [] };
}

export async function runTests(projectPath?: string, customCommand?: string): Promise<{
	success: boolean;
	output: string;
	errorOutput: string;
	exitCode: number | null;
	duration: number;
	projectType: ProjectType;
	command: string;
}> {
	const detection = await detectProject(projectPath);
	const command = customCommand || detection.commands.test;

	if (!command) {
		return {
			success: false,
			output: '',
			errorOutput: `No test command configured for ${detection.type} project`,
			exitCode: null,
			duration: 0,
			projectType: detection.type,
			command: '',
		};
	}

	const { command: cmd, args } = parseCommandString(command);
	const startTime = Date.now();

	try {
		const result = await execa(cmd, args, { cwd: projectPath });
		return {
			success: result.exitCode === 0,
			output: result.stdout || '',
			errorOutput: result.stderr || '',
			exitCode: result.exitCode ?? null,
			duration: Date.now() - startTime,
			projectType: detection.type,
			command,
		};
	} catch (error) {
		return {
			success: false,
			output: '',
			errorOutput: (error as Error).message,
			exitCode: null,
			duration: Date.now() - startTime,
			projectType: detection.type,
			command,
		};
	}
}

export async function formatCode(projectPath?: string, customCommand?: string): Promise<{
	success: boolean;
	output: string;
	errorOutput: string;
	exitCode: number | null;
	duration: number;
	projectType: ProjectType;
	command: string;
}> {
	const detection = await detectProject(projectPath);
	const command = customCommand || detection.commands.format;

	if (!command) {
		return {
			success: false,
			output: '',
			errorOutput: `No format command configured for ${detection.type} project`,
			exitCode: null,
			duration: 0,
			projectType: detection.type,
			command: '',
		};
	}

	const { command: cmd, args } = parseCommandString(command);
	const startTime = Date.now();

	try {
		const result = await execa(cmd, args, { cwd: projectPath });
		return {
			success: result.exitCode === 0,
			output: result.stdout || '',
			errorOutput: result.stderr || '',
			exitCode: result.exitCode ?? null,
			duration: Date.now() - startTime,
			projectType: detection.type,
			command,
		};
	} catch (error) {
		return {
			success: false,
			output: '',
			errorOutput: (error as Error).message,
			exitCode: null,
			duration: Date.now() - startTime,
			projectType: detection.type,
			command,
		};
	}
}

export async function lintCode(projectPath?: string, customCommand?: string): Promise<{
	success: boolean;
	output: string;
	errorOutput: string;
	exitCode: number | null;
	duration: number;
	projectType: ProjectType;
	command: string;
}> {
	const detection = await detectProject(projectPath);
	const command = customCommand || detection.commands.lint;

	if (!command) {
		return {
			success: false,
			output: '',
			errorOutput: `No lint command configured for ${detection.type} project`,
			exitCode: null,
			duration: 0,
			projectType: detection.type,
			command: '',
		};
	}

	const { command: cmd, args } = parseCommandString(command);
	const startTime = Date.now();

	try {
		const result = await execa(cmd, args, { cwd: projectPath });
		return {
			success: result.exitCode === 0,
			output: result.stdout || '',
			errorOutput: result.stderr || '',
			exitCode: result.exitCode ?? null,
			duration: Date.now() - startTime,
			projectType: detection.type,
			command,
		};
	} catch (error) {
		return {
			success: false,
			output: '',
			errorOutput: (error as Error).message,
			exitCode: null,
			duration: Date.now() - startTime,
			projectType: detection.type,
			command,
		};
	}
}

export async function buildProject(projectPath?: string, customCommand?: string): Promise<{
	success: boolean;
	output: string;
	errorOutput: string;
	exitCode: number | null;
	duration: number;
	projectType: ProjectType;
	command: string;
}> {
	const detection = await detectProject(projectPath);
	const command = customCommand || detection.commands.build;

	if (!command) {
		return {
			success: false,
			output: '',
			errorOutput: `No build command configured for ${detection.type} project`,
			exitCode: null,
			duration: 0,
			projectType: detection.type,
			command: '',
		};
	}

	const { command: cmd, args } = parseCommandString(command);
	const startTime = Date.now();

	try {
		const result = await execa(cmd, args, { cwd: projectPath });
		return {
			success: result.exitCode === 0,
			output: result.stdout || '',
			errorOutput: result.stderr || '',
			exitCode: result.exitCode ?? null,
			duration: Date.now() - startTime,
			projectType: detection.type,
			command,
		};
	} catch (error) {
		return {
			success: false,
			output: '',
			errorOutput: (error as Error).message,
			exitCode: null,
			duration: Date.now() - startTime,
			projectType: detection.type,
			command,
		};
	}
}

// Permission store for runner tools
interface PermissionStore {
	permissions: Map<string, { granted: boolean; expiresAt: number }>;
}

const permissionStore: PermissionStore = { permissions: new Map() };

export function checkPermission(toolName: string, projectPath: string): boolean {
	const key = `${toolName}:${projectPath}`;
	const perm = permissionStore.permissions.get(key);
	if (!perm) return false;
	if (Date.now() > perm.expiresAt) {
		permissionStore.permissions.delete(key);
		return false;
	}
	return perm.granted;
}

export function grantPermission(toolName: string, projectPath: string, duration = 3600000): void {
	const key = `${toolName}:${projectPath}`;
	permissionStore.permissions.set(key, { granted: true, expiresAt: Date.now() + duration });
}

// Explorer tools
export async function getProjectMap(rootPath: string, options: { maxDepth?: number; ignorePatterns?: string[] } = {}): Promise<string> {
	const { maxDepth = 3, ignorePatterns = ['node_modules', '.git', 'dist', 'target', '.floyd'] } = options;
	const files = await globby('**/*', { cwd: rootPath, ignore: ignorePatterns, deep: maxDepth, onlyFiles: false, markDirectories: true });
	const tree: any = {};
	files.forEach(file => file.split('/').reduce((node, part) => node[part] = node[part] || {}, tree));

	function format(node: any, indent = ''): string {
		return Object.keys(node).sort().map(key => {
			const isDir = Object.keys(node[key]).length > 0;
			return `${indent}${isDir ? '📁' : '📄'} ${key}\n${format(node[key], indent + '  ')}`;
		}).join('');
	}
	return format(tree);
}

export async function listSymbols(filePath: string): Promise<Array<{ name: string; type: string; line: number; preview: string }>> {
	if (!(await fs.pathExists(filePath))) throw new Error(`File not found.`);
	const content = await fs.readFile(filePath, 'utf-8');
	const patterns = [
		{ type: 'class', regex: /class\s+([a-zA-Z0-9_]+)/ },
		{ type: 'function', regex: /(?:async\s+)?function\s+([a-zA-Z0-9_]+)/ },
		{ type: 'interface', regex: /interface\s+([a-zA-Z0-9_]+)/ },
		{ type: 'rust_fn', regex: /fn\s+([a-zA-Z0-9_]+)/ },
		{ type: 'rust_struct', regex: /struct\s+([a-zA-Z0-9_]+)/ },
	];
	const symbols = content.split('\n').map((line, i) => {
		for (const p of patterns) {
			const m = line.match(p.regex);
			if (m) return { name: m[1], type: p.type, line: i + 1, preview: line.trim() };
		}
		return null;
	});

	// Filter out nulls with proper type guard
	return symbols.filter((s): s is { name: string; type: string; line: number; preview: string } => s !== null);
}

### src/tools/build/index.ts - Build Tool Wrappers

/**
 * Build/Explorer Tools - Floyd Wrapper
 *
 * Build and explorer tools copied from FLOYD_CLI and wrapped
 */

import { z } from 'zod';
import type { ToolDefinition } from '../../types.ts';
import * as buildCore from './build-core.ts';

// ============================================================================
// Detect Project Tool
// ============================================================================

export const detectProjectTool: ToolDefinition = {
	name: 'detect_project',
	description: 'Auto-detect project type (Node/Go/Rust/Python) and available commands',
	category: 'build',
	inputSchema: z.object({
		projectPath: z.string().optional(),
	}),
	permission: 'none',
	execute: async (input) => {
		const { projectPath } = input as z.infer<typeof detectProjectTool.inputSchema>;
		const detection = await buildCore.detectProject(projectPath);
		return { success: true, data: detection };
	}
} as ToolDefinition;

// ============================================================================
// Run Tests Tool
// ============================================================================

export const runTestsTool: ToolDefinition = {
	name: 'run_tests',
	description: 'Run tests for the detected project. Requires permission if not previously granted.',
	category: 'build',
	inputSchema: z.object({
		projectPath: z.string().optional(),
		command: z.string().optional(),
		grantPermission: z.boolean().optional().default(false),
	}),
	permission: 'dangerous',
	execute: async (input) => {
		const { projectPath, command, grantPermission: shouldGrant } = input as z.infer<typeof runTestsTool.inputSchema>;
		const cwd = projectPath || process.cwd();

		if (!buildCore.checkPermission('run_tests', cwd)) {
			if (shouldGrant) {
				buildCore.grantPermission('run_tests', cwd);
			} else {
				return {
					success: false,
					error: {
						code: 'PERMISSION_DENIED',
						message: 'Permission required to run run_tests. Use grantPermission=true to authorize for this session.',
						details: { projectPath: cwd }
					}
				};
			}
		}

		const result = await buildCore.runTests(cwd, command);
		return { success: result.success, data: { ...result, permissionGranted: true } };
	}
} as ToolDefinition;

// ============================================================================
// Format Tool
// ============================================================================

export const formatTool: ToolDefinition = {
	name: 'format',
	description: "Format code using the project's configured formatter. Requires permission.",
	category: 'build',
	inputSchema: z.object({
		projectPath: z.string().optional(),
		command: z.string().optional(),
		grantPermission: z.boolean().optional().default(false),
	}),
	permission: 'dangerous',
	execute: async (input) => {
		const { projectPath, command, grantPermission: shouldGrant } = input as z.infer<typeof formatTool.inputSchema>;
		const cwd = projectPath || process.cwd();

		if (!buildCore.checkPermission('format', cwd)) {
			if (shouldGrant) {
				buildCore.grantPermission('format', cwd);
			} else {
				return {
					success: false,
					error: {
						code: 'PERMISSION_DENIED',
						message: 'Permission required to run format. Use grantPermission=true to authorize.',
						details: { projectPath: cwd }
					}
				};
			}
		}

		const result = await buildCore.formatCode(cwd, command);
		return { success: result.success, data: { ...result, permissionGranted: true } };
	}
} as ToolDefinition;

// ============================================================================
// Lint Tool
// ============================================================================

export const lintTool: ToolDefinition = {
	name: 'lint',
	description: "Run the project's linter. Requires permission.",
	category: 'build',
	inputSchema: z.object({
		projectPath: z.string().optional(),
		command: z.string().optional(),
		grantPermission: z.boolean().optional().default(false),
	}),
	permission: 'moderate',
	execute: async (input) => {
		const { projectPath, command, grantPermission: shouldGrant } = input as z.infer<typeof lintTool.inputSchema>;
		const cwd = projectPath || process.cwd();

		if (!buildCore.checkPermission('lint', cwd)) {
			if (shouldGrant) {
				buildCore.grantPermission('lint', cwd);
			} else {
				return {
					success: false,
					error: {
						code: 'PERMISSION_DENIED',
						message: 'Permission required to run lint. Use grantPermission=true to authorize.',
						details: { projectPath: cwd }
					}
				};
			}
		}

		const result = await buildCore.lintCode(cwd, command);
		return { success: result.success, data: { ...result, permissionGranted: true } };
	}
} as ToolDefinition;

// ============================================================================
// Build Tool
// ============================================================================

export const buildTool: ToolDefinition = {
	name: 'build',
	description: 'Build the project. Requires permission.',
	category: 'build',
	inputSchema: z.object({
		projectPath: z.string().optional(),
		command: z.string().optional(),
		grantPermission: z.boolean().optional().default(false),
	}),
	permission: 'dangerous',
	execute: async (input) => {
		const { projectPath, command, grantPermission: shouldGrant } = input as z.infer<typeof buildTool.inputSchema>;
		const cwd = projectPath || process.cwd();

		if (!buildCore.checkPermission('build', cwd)) {
			if (shouldGrant) {
				buildCore.grantPermission('build', cwd);
			} else {
				return {
					success: false,
					error: {
						code: 'PERMISSION_DENIED',
						message: 'Permission required to run build. Use grantPermission=true to authorize.',
						details: { projectPath: cwd }
					}
				};
			}
		}

		const result = await buildCore.buildProject(cwd, command);
		return { success: result.success, data: { ...result, permissionGranted: true } };
	}
} as ToolDefinition;

// ============================================================================
// Check Permission Tool
// ============================================================================

export const checkPermissionTool: ToolDefinition = {
	name: 'check_permission',
	description: 'Check if permission is granted for a runner operation',
	category: 'build',
	inputSchema: z.object({
		toolName: z.enum(['run_tests', 'format', 'lint', 'build']),
		projectPath: z.string().optional(),
	}),
	permission: 'none',
	execute: async (input) => {
		const { toolName, projectPath } = input as z.infer<typeof checkPermissionTool.inputSchema>;
		const cwd = projectPath || process.cwd();
		const hasPermission = buildCore.checkPermission(toolName, cwd);
		return {
			success: true,
			data: { tool: toolName, projectPath: cwd, hasPermission }
		};
	}
} as ToolDefinition;

// ============================================================================
// Project Map Tool
// ============================================================================

export const projectMapTool: ToolDefinition = {
	name: 'project_map',
	description: 'Get directory tree structure',
	category: 'build',
	inputSchema: z.object({
		maxDepth: z.number().optional().default(3),
	}),
	permission: 'none',
	execute: async (input) => {
		const { maxDepth } = input as z.infer<typeof projectMapTool.inputSchema>;
		const tree = await buildCore.getProjectMap(process.cwd(), { maxDepth });
		return {
			success: true,
			data: { tree, format: 'ascii' }
		};
	}
} as ToolDefinition;

// ============================================================================
// List Symbols Tool
// ============================================================================

export const listSymbolsTool: ToolDefinition = {
	name: 'list_symbols',
	description: 'List symbols (classes, functions, interfaces) in a file',
	category: 'build',
	inputSchema: z.object({
		filePath: z.string(),
	}),
	permission: 'none',
	execute: async (input) => {
		const { filePath } = input as z.infer<typeof listSymbolsTool.inputSchema>;
		try {
			const symbols = await buildCore.listSymbols(filePath);
			return { success: true, data: { symbols } };
		} catch (error) {
			return {
				success: false,
				error: {
					code: 'FILE_NOT_FOUND',
					message: (error as Error).message,
					details: { filePath }
				}
			};
		}
	}
} as ToolDefinition;

### src/tools/browser/index.ts - Browser Automation

/**
 * Browser Tools - Floyd Wrapper
 *
 * Browser automation tools copied from FLOYD_CLI browser-server.ts
 * Note: Requires FloydChrome extension running at ws://localhost:3005
 */

import { z } from 'zod';
import type { ToolDefinition } from '../../types.ts';
import { WebSocket } from 'ws';

interface JSONRPCMessage {
  jsonrpc: '2.0';
  id?: number | string;
  method?: string;
  params?: any;
  result?: any;
  error?: {
    code: number;
    message: string;
    data?: any;
  };
}

class BrowserClient {
  private ws: WebSocket | null = null;
  private messageId = 0;
  private pendingRequests: Map<number | string, {
    resolve: (value: any) => void;
    reject: (error: Error) => void;
  }> = new Map();
  private connected = false;
  private extensionUrl: string;
  private healthCheckFailed = false;

  constructor() {
    this.extensionUrl = process.env.FLOYD_EXTENSION_URL || 'ws://localhost:3005';
  }

  /**
   * Check if the browser extension is available and healthy
   */
  async healthCheck(): Promise<{ healthy: boolean; message: string }> {
    // If we previously failed health check, don't retry immediately
    if (this.healthCheckFailed) {
      return {
        healthy: false,
        message: `Browser extension health check previously failed. Ensure FloydChrome extension is running at ${this.extensionUrl}`
      };
    }

    // Try to connect if not already connected
    if (!this.connected || !this.ws || this.ws.readyState !== WebSocket.OPEN) {
      const connected = await this.connect();
      if (!connected) {
        this.healthCheckFailed = true;
        return {
          healthy: false,
          message: `Cannot connect to FloydChrome extension at ${this.extensionUrl}. Make sure the extension is installed and running.`
        };
      }
    }

    return {
      healthy: true,
      message: `Connected to FloydChrome extension at ${this.extensionUrl}`
    };
  }

  /**
   * Reset health check failure flag (allows retry)
   */
  resetHealthCheck(): void {
    this.healthCheckFailed = false;
  }

  async connect(): Promise<boolean> {
    return new Promise((resolve) => {
      try {
        this.ws = new WebSocket(this.extensionUrl);

        this.ws.on('open', () => {
          this.connected = true;
          this.healthCheckFailed = false;
          resolve(true);
        });

        this.ws.on('message', (data: Buffer) => {
          this.handleMessage(data.toString());
        });

        this.ws.on('error', () => {
          this.connected = false;
          this.healthCheckFailed = true;
          resolve(false);
        });

        this.ws.on('close', () => {
          this.connected = false;
        });

        setTimeout(() => {
          if (!this.connected) {
            this.healthCheckFailed = true;
          }
          resolve(this.connected);
        }, 5000);
      } catch {
        this.healthCheckFailed = true;
        resolve(false);
      }
    });
  }

  private handleMessage(data: string): void {
    try {
      const message: JSONRPCMessage = JSON.parse(data);
      if (message.id !== undefined && this.pendingRequests.has(message.id)) {
        const { resolve, reject } = this.pendingRequests.get(message.id)!;
        this.pendingRequests.delete(message.id);
        if (message.error) {
          reject(new Error(message.error.message));
        } else {
          resolve(message.result);
        }
      }
    } catch {
      // Ignore JSON parsing errors
    }
  }

  private async sendRequest(method: string, params?: any): Promise<any> {
    if (!this.ws || !this.connected) {
      const connected = await this.connect();
      if (!connected) {
        throw new Error('Could not connect to FloydChrome extension');
      }
    }

    const id = ++this.messageId;
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        if (this.pendingRequests.has(id)) {
          this.pendingRequests.delete(id);
          reject(new Error(`Request timeout: ${method}`));
        }
      }, 30000);

      this.pendingRequests.set(id, {
        resolve: (value: any) => {
          clearTimeout(timeout);
          resolve(value);
        },
        reject: (error: Error) => {
          clearTimeout(timeout);
          reject(error);
        },
      });

      const message: JSONRPCMessage = {
        jsonrpc: '2.0',
        id,
        method,
        params,
      };

      this.ws!.send(JSON.stringify(message));
    });
  }

  async callTool(toolName: string, args: Record<string, any>): Promise<any> {
    return this.sendRequest('tools/call', { name: toolName, arguments: args });
  }
}

const browserClient = new BrowserClient();

/**
 * Wrapper for browser tool execute functions that includes health check
 */
async function withBrowserHealthCheck(
  toolName: string,
  input: Record<string, any>
): Promise<{ success: boolean; data?: any; error?: { code: string; message: string } }> {
  const health = await browserClient.healthCheck();
  if (!health.healthy) {
    return {
      success: false,
      error: {
        code: 'BROWSER_EXTENSION_UNAVAILABLE' as const,
        message: health.message
      }
    };
  }
  const result = await browserClient.callTool(toolName, input);
  return { success: true, data: result };
}

// ============================================================================
// Browser Status Tool
// ============================================================================

export const browserStatusTool: ToolDefinition = {
  name: 'browser_status',
  description: 'Check connection status to FloydChrome extension',
  category: 'browser',
  inputSchema: z.object({}),
  permission: 'none',
  execute: async () => {
    const health = await browserClient.healthCheck();
    return {
      success: true,
      data: {
        healthy: health.healthy,
        extension_url: process.env.FLOYD_EXTENSION_URL || 'ws://localhost:3005',
        message: health.message
      }
    };
  }
} as ToolDefinition;

// ============================================================================
// Browser Navigate Tool
// ============================================================================

export const browserNavigateTool: ToolDefinition = {
  name: 'browser_navigate',
  description: 'Navigate to a URL in the browser',
  category: 'browser',
  inputSchema: z.object({
    url: z.string(),
    tabId: z.number().optional(),
  }),
  permission: 'moderate',
  execute: async (input) => withBrowserHealthCheck('navigate', input as Record<string, any>)
} as ToolDefinition;

// ============================================================================
// Browser Read Page Tool
// ============================================================================

export const browserReadPageTool: ToolDefinition = {
  name: 'browser_read_page',
  description: 'Get semantic accessibility tree of the current page',
  category: 'browser',
  inputSchema: z.object({
    tabId: z.number().optional(),
  }),
  permission: 'moderate',
  execute: async (input) => withBrowserHealthCheck('read_page', input as Record<string, any>)
} as ToolDefinition;

// ============================================================================
// Browser Screenshot Tool
// ============================================================================

export const browserScreenshotTool: ToolDefinition = {
  name: 'browser_screenshot',
  description: 'Capture screenshot for Computer Use/vision models',
  category: 'browser',
  inputSchema: z.object({
    fullPage: z.boolean().optional().default(false),
    selector: z.string().optional(),
    tabId: z.number().optional(),
  }),
  permission: 'moderate',
  execute: async (input) => withBrowserHealthCheck('screenshot', input as Record<string, any>)
} as ToolDefinition;

// ============================================================================
// Browser Click Tool
// ============================================================================

export const browserClickTool: ToolDefinition = {
  name: 'browser_click',
  description: 'Click element at coordinates or by CSS selector',
  category: 'browser',
  inputSchema: z.object({
    x: z.number().optional(),
    y: z.number().optional(),
    selector: z.string().optional(),
    tabId: z.number().optional(),
  }),
  permission: 'dangerous',
  execute: async (input) => withBrowserHealthCheck('click', input as Record<string, any>)
} as ToolDefinition;

// ============================================================================
// Browser Type Tool
// ============================================================================

export const browserTypeTool: ToolDefinition = {
  name: 'browser_type',
  description: 'Type text into the focused element',
  category: 'browser',
  inputSchema: z.object({
    text: z.string(),
    tabId: z.number().optional(),
  }),
  permission: 'dangerous',
  execute: async (input) => withBrowserHealthCheck('type', input as Record<string, any>)
} as ToolDefinition;

// ============================================================================
// Browser Find Tool
// ============================================================================

export const browserFindTool: ToolDefinition = {
  name: 'browser_find',
  description: 'Find element by natural language query',
  category: 'browser',
  inputSchema: z.object({
    query: z.string(),
    tabId: z.number().optional(),
  }),
  permission: 'moderate',
  execute: async (input) => withBrowserHealthCheck('find', input as Record<string, any>)
} as ToolDefinition;

// ============================================================================
// Browser Get Tabs Tool
// ============================================================================

export const browserGetTabsTool: ToolDefinition = {
  name: 'browser_get_tabs',
  description: 'List all open browser tabs',
  category: 'browser',
  inputSchema: z.object({}),
  permission: 'moderate',
  execute: async () => withBrowserHealthCheck('get_tabs', {})
} as ToolDefinition;

// ============================================================================
// Browser Create Tab Tool
// ============================================================================

export const browserCreateTabTool: ToolDefinition = {
  name: 'browser_create_tab',
  description: 'Open a new browser tab',
  category: 'browser',
  inputSchema: z.object({
    url: z.string().optional(),
  }),
  permission: 'moderate',
  execute: async (input) => withBrowserHealthCheck('tabs_create', input as Record<string, any>)
} as ToolDefinition;

### src/tools/patch/patch-core.ts - Patch Core

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

### src/tools/patch/index.ts - Patch Tool Wrappers

/**
 * Patch Tools - Floyd Wrapper
 *
 * Patch tools copied from FLOYD_CLI patch-server.ts and wrapped
 */

import { z } from 'zod';
import type { ToolDefinition } from '../../types.ts';
import * as patchCore from './patch-core.ts';

// ============================================================================
// Apply Unified Diff Tool
// ============================================================================

export const applyUnifiedDiffTool: ToolDefinition = {
	name: 'apply_unified_diff',
	description: 'Apply a unified diff patch to files with dry-run support',
	category: 'patch',
	inputSchema: z.object({
		diff: z.string(),
		dryRun: z.boolean().optional().default(false),
		rootPath: z.string().optional(),
		assessRisk: z.boolean().optional().default(true),
	}),
	permission: 'dangerous',
	execute: async (input) => {
		const { diff, dryRun, rootPath, assessRisk: shouldAssess } = input as z.infer<typeof applyUnifiedDiffTool.inputSchema>;

		const parsed = patchCore.parseUnifiedDiff(diff);
		if (parsed.length === 0) {
			return { success: false, error: { code: 'NO_VALID_DIFF', message: 'No valid diff found in input', details: {} } };
		}

		let risk: patchCore.RiskAssessment | undefined;
		if (shouldAssess) {
			risk = patchCore.assessRisk(parsed);
		}

		const result = await patchCore.applyUnifiedDiff(diff, { dryRun, rootPath });

		return {
			success: result.success,
			data: {
				...result,
				risk,
				parsedFiles: parsed.map(f => ({ path: f.path, status: f.status, hunks: f.hunks.length }))
			}
		};
	}
} as ToolDefinition;

// ============================================================================
// Edit Range Tool
// ============================================================================

export const editRangeTool: ToolDefinition = {
	name: 'edit_range',
	description: 'Edit a specific range of lines in a file with automatic backups',
	category: 'patch',
	inputSchema: z.object({
		filePath: z.string(),
		startLine: z.number(),
		endLine: z.number(),
		content: z.string(),
		dryRun: z.boolean().optional().default(false),
	}),
	permission: 'dangerous',
	execute: async (input) => {
		const { filePath, startLine, endLine, content, dryRun } = input as z.infer<typeof editRangeTool.inputSchema>;
		const result = await patchCore.editRange(filePath, startLine, endLine, content, { dryRun });
		return { success: result.success, data: result, error: result.error ? { code: 'EDIT_RANGE_ERROR', message: result.error, details: { filePath } } : undefined };
	}
} as ToolDefinition;

// ============================================================================
// Insert At Tool
// ============================================================================

export const insertAtTool: ToolDefinition = {
	name: 'insert_at',
	description: 'Insert content at a specific line with automatic backups',
	category: 'patch',
	inputSchema: z.object({
		filePath: z.string(),
		lineNumber: z.number(),
		content: z.string(),
		dryRun: z.boolean().optional().default(false),
	}),
	permission: 'dangerous',
	execute: async (input) => {
		const { filePath, lineNumber, content, dryRun } = input as z.infer<typeof insertAtTool.inputSchema>;
		const result = await patchCore.insertAt(filePath, lineNumber, content, { dryRun });
		return { success: result.success, data: result, error: result.error ? { code: 'INSERT_AT_ERROR', message: result.error, details: { filePath } } : undefined };
	}
} as ToolDefinition;

// ============================================================================
// Delete Range Tool
// ============================================================================

export const deleteRangeTool: ToolDefinition = {
	name: 'delete_range',
	description: 'Delete a range of lines from a file with automatic backups',
	category: 'patch',
	inputSchema: z.object({
		filePath: z.string(),
		startLine: z.number(),
		endLine: z.number(),
		dryRun: z.boolean().optional().default(false),
	}),
	permission: 'dangerous',
	execute: async (input) => {
		const { filePath, startLine, endLine, dryRun } = input as z.infer<typeof deleteRangeTool.inputSchema>;
		const result = await patchCore.deleteRange(filePath, startLine, endLine, { dryRun });
		return { success: result.success, data: result, error: result.error ? { code: 'DELETE_RANGE_ERROR', message: result.error, details: { filePath } } : undefined };
	}
} as ToolDefinition;

// ============================================================================
// Assess Patch Risk Tool
// ============================================================================

export const assessPatchRiskTool: ToolDefinition = {
	name: 'assess_patch_risk',
	description: 'Assess the risk level of a patch before applying',
	category: 'patch',
	inputSchema: z.object({
		diff: z.string(),
	}),
	permission: 'none',
	execute: async (input) => {
		const { diff } = input as z.infer<typeof assessPatchRiskTool.inputSchema>;
		const parsed = patchCore.parseUnifiedDiff(diff);
		const risk = patchCore.assessRisk(parsed);
		return {
			success: true,
			data: {
				...risk,
				files: parsed.map(f => ({ path: f.path, status: f.status, hunkCount: f.hunks.length }))
			}
		};
	}
} as ToolDefinition;

### src/tools/system/index.ts - System Tools

/**
 * System Tools - Floyd Wrapper
 *
 * System tools copied from FLOYD_CLI and wrapped
 */

import { z } from 'zod';
import type { ToolDefinition } from '../../types.ts';
import { execa } from 'execa';

// ============================================================================
// Run Tool
// ============================================================================

export const runTool: ToolDefinition = {
	name: 'run',
	description: 'Execute terminal commands',
	category: 'build',
	inputSchema: z.object({
		command: z.string(),
		args: z.array(z.string()).optional(),
		cwd: z.string().optional().default('.'),
		timeout: z.number().optional().default(120000),
		env: z.record(z.string()).optional(),
	}),
	permission: 'dangerous',
	execute: async (input) => {
		const { command, args = [], cwd, timeout, env } = input as z.infer<typeof runTool.inputSchema>;
		try {
			const result = await execa(command, args, {
				cwd: cwd || '.',
				timeout,
				env: { ...process.env, ...env },
			});

			return {
				success: result.exitCode === 0,
				data: {
					exitCode: result.exitCode ?? null,
					stdout: result.stdout || '',
					stderr: result.stderr || '',
					duration: 0
				}
			};
		} catch (error) {
			return {
				success: false,
				data: {
					exitCode: null,
					stdout: '',
					stderr: (error as Error).message,
					duration: 0
				}
			};
		}
	}
} as ToolDefinition;

// ============================================================================
// Ask User Tool
// ============================================================================

export const askUserTool: ToolDefinition = {
	name: 'ask_user',
	description: 'Ask the user for input',
	category: 'build',
	inputSchema: z.object({
		question: z.string(),
	}),
	permission: 'none',
	execute: async (input) => {
		const { question } = input as z.infer<typeof askUserTool.inputSchema>;
		// In CLI mode, this would prompt the user
		// For now, return a placeholder
		return {
			success: true,
			data: { question, response: 'User input not available in non-interactive mode' }
		};
	}
} as ToolDefinition;

### src/tools/git/git-core.ts - Git Core Functions

/**
 * Git Core Functions - Copied from FLOYD_CLI
 *
 * These are the exact core functions from /Volumes/Storage/FLOYD_CLI/INK/floyd-cli/src/mcp/git-server.ts
 */

import simpleGit from 'simple-git';
import type { SimpleGit } from 'simple-git';

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

### src/tools/git/status.ts - Git Status Tool

/**
 * Git Status Tool - Floyd Wrapper
 *
 * Tool wrapper for git_status from FLOYD_CLI
 */

import { z } from 'zod';
import type { ToolDefinition, ToolResult } from '../../types.ts';
import { getGitStatus } from './git-core.ts';

// ============================================================================
// Zod Schema
// ============================================================================

const inputSchema = z.object({
	repoPath: z.string().optional(),
});

// ============================================================================
// Tool Execution
// ============================================================================

async function execute(input: z.infer<typeof inputSchema>): Promise<ToolResult> {
	const { repoPath } = input;
	const cwd = repoPath || process.cwd();

	const status = await getGitStatus(cwd);

	return {
		success: status.isRepo,
		data: status,
		error: status.error ? {
			code: 'GIT_STATUS_ERROR',
			message: status.error,
			details: { repoPath: cwd },
		} : undefined,
	};
}

// ============================================================================
// Tool Definition
// ============================================================================

export const gitStatusTool: ToolDefinition = {
	name: 'git_status',
	description: 'Show the working tree status. Returns staged/unstaged files and branch information.',
	category: 'git',
	inputSchema,
	permission: 'none',
	execute,
} as ToolDefinition;

### src/tools/git/commit.ts - Git Commit Tool

/**
 * Git Commit Tool - Floyd Wrapper
 *
 * Tool wrapper for git_commit from FLOYD_CLI
 */

import { z } from 'zod';
import type { ToolDefinition, ToolResult } from '../../types.ts';
import { createCommit, stageFiles } from './git-core.ts';

// ============================================================================
// Zod Schema
// ============================================================================

const inputSchema = z.object({
	message: z.string(),
	repoPath: z.string().optional(),
	stageAll: z.boolean().optional().default(true),
	stageFiles: z.array(z.string()).optional(),
	allowEmpty: z.boolean().optional().default(false),
	amend: z.boolean().optional().default(false),
});

// ============================================================================
// Tool Execution
// ============================================================================

async function execute(input: z.infer<typeof inputSchema>): Promise<ToolResult> {
	const { message, repoPath, stageAll, stageFiles: filesToStage, allowEmpty, amend } = input;
	const cwd = repoPath || process.cwd();

	// Stage files if requested
	if (filesToStage && filesToStage.length > 0) {
		await stageFiles(filesToStage, cwd);
	} else if (stageAll) {
		await stageFiles([], cwd);
	}

	const result = await createCommit(message, {
		repoPath: cwd,
		allowEmpty,
		amend,
	});

	return {
		success: result.success,
		data: result,
		error: result.error ? {
			code: 'GIT_COMMIT_ERROR',
			message: result.error,
			details: { repoPath: cwd },
		} : undefined,
	};
}

// ============================================================================
// Tool Definition
// ============================================================================

export const gitCommitTool: ToolDefinition = {
	name: 'git_commit',
	description: 'Record changes to the repository. Warns for protected branches.',
	category: 'git',
	inputSchema,
	permission: 'dangerous',
	execute,
} as ToolDefinition;

### src/tools/git/diff.ts - Git Diff Tool

/**
 * Git Diff Tool - Floyd Wrapper
 *
 * Tool wrapper for git_diff from FLOYD_CLI
 */

import { z } from 'zod';
import type { ToolDefinition, ToolResult } from '../../types.ts';
import { getGitDiff } from './git-core.ts';

// ============================================================================
// Zod Schema
// ============================================================================

const inputSchema = z.object({
	repoPath: z.string().optional(),
	files: z.array(z.string()).optional(),
	staged: z.boolean().optional().default(false),
	cached: z.boolean().optional().default(false),
});

// ============================================================================
// Tool Execution
// ============================================================================

async function execute(input: z.infer<typeof inputSchema>): Promise<ToolResult> {
	const { repoPath, files, staged, cached } = input;
	const cwd = repoPath || process.cwd();

	const diff = await getGitDiff({ repoPath: cwd, files, staged, cached });

	if ('error' in diff) {
		return {
			success: false,
			error: {
				code: 'GIT_DIFF_ERROR',
				message: diff.error,
				details: { repoPath: cwd, files, staged, cached },
			},
		};
	}

	return {
		success: true,
		data: diff,
	};
}

// ============================================================================
// Tool Definition
// ============================================================================

export const gitDiffTool: ToolDefinition = {
	name: 'git_diff',
	description: 'Show changes between commits, commit and working tree, etc.',
	category: 'git',
	inputSchema,
	permission: 'none',
	execute,
} as ToolDefinition;

### src/tools/git/log.ts - Git Log Tool

/**
 * Git Log Tool - Floyd Wrapper
 *
 * Tool wrapper for git_log from FLOYD_CLI
 */

import { z } from 'zod';
import type { ToolDefinition, ToolResult } from '../../types.ts';
import { getGitLog } from './git-core.ts';

// ============================================================================
// Zod Schema
// ============================================================================

const inputSchema = z.object({
	repoPath: z.string().optional(),
	maxCount: z.number().optional().default(20),
	since: z.string().optional(),
	until: z.string().optional(),
	author: z.string().optional(),
	file: z.string().optional(),
});

// ============================================================================
// Tool Execution
// ============================================================================

async function execute(input: z.infer<typeof inputSchema>): Promise<ToolResult> {
	const { repoPath, maxCount, since, until, author, file } = input;
	const cwd = repoPath || process.cwd();

	const log = await getGitLog({
		repoPath: cwd,
		maxCount,
		since,
		until,
		author,
		file,
	});

	if ('error' in log) {
		return {
			success: false,
			error: {
				code: 'GIT_LOG_ERROR',
				message: log.error,
				details: { repoPath: cwd },
			},
		};
	}

	return {
		success: true,
		data: log,
	};
}

// ============================================================================
// Tool Definition
// ============================================================================

export const gitLogTool: ToolDefinition = {
	name: 'git_log',
	description: 'Show commit logs',
	category: 'git',
	inputSchema,
	permission: 'none',
	execute,
} as ToolDefinition;

### src/tools/git/stage.ts - Git Stage Tool

/**
 * Git Stage Tool - Floyd Wrapper
 *
 * Tool wrapper for git_stage from FLOYD_CLI
 */

import { z } from 'zod';
import type { ToolDefinition, ToolResult } from '../../types.ts';
import { stageFiles } from './git-core.ts';

// ============================================================================
// Zod Schema
// ============================================================================

const inputSchema = z.object({
	files: z.array(z.string()).optional(),
	repoPath: z.string().optional(),
});

// ============================================================================
// Tool Execution
// ============================================================================

async function execute(input: z.infer<typeof inputSchema>): Promise<ToolResult> {
	const { files = [], repoPath } = input;
	const cwd = repoPath || process.cwd();

	const result = await stageFiles(files, cwd);

	return {
		success: result.success,
		data: result,
		error: result.error ? {
			code: 'GIT_STAGE_ERROR',
			message: result.error,
			details: { repoPath: cwd, files },
		} : undefined,
	};
}

// ============================================================================
// Tool Definition
// ============================================================================

export const gitStageTool: ToolDefinition = {
	name: 'git_stage',
	description: 'Stage files for commit',
	category: 'git',
	inputSchema,
	permission: 'moderate',
	execute,
} as ToolDefinition;

### src/tools/git/unstage.ts - Git Unstage Tool

/**
 * Git Unstage Tool - Floyd Wrapper
 *
 * Tool wrapper for git_unstage from FLOYD_CLI
 */

import { z } from 'zod';
import type { ToolDefinition, ToolResult } from '../../types.ts';
import { unstageFiles } from './git-core.ts';

// ============================================================================
// Zod Schema
// ============================================================================

const inputSchema = z.object({
	files: z.array(z.string()).optional(),
	repoPath: z.string().optional(),
});

// ============================================================================
// Tool Execution
// ============================================================================

async function execute(input: z.infer<typeof inputSchema>): Promise<ToolResult> {
	const { files = [], repoPath } = input;
	const cwd = repoPath || process.cwd();

	const result = await unstageFiles(files, cwd);

	return {
		success: result.success,
		data: result,
		error: result.error ? {
			code: 'GIT_UNSTAGE_ERROR',
			message: result.error,
			details: { repoPath: cwd, files },
		} : undefined,
	};
}

// ============================================================================
// Tool Definition
// ============================================================================

export const gitUnstageTool: ToolDefinition = {
	name: 'git_unstage',
	description: 'Unstage files from the staging area',
	category: 'git',
	inputSchema,
	permission: 'moderate',
	execute,
} as ToolDefinition;

### src/tools/git/branch.ts - Git Branch Tool

/**
 * Git Branch Tool - Floyd Wrapper
 *
 * Tool wrapper for git_branch from FLOYD_CLI
 */

import { z } from 'zod';
import type { ToolDefinition, ToolResult } from '../../types.ts';
import { listBranches, getCurrentBranch, getGitInstance } from './git-core.ts';

// ============================================================================
// Zod Schema
// ============================================================================

const inputSchema = z.object({
	repoPath: z.string().optional(),
	action: z.enum(['list', 'current', 'create', 'switch']).default('list'),
	name: z.string().optional(),
});

// ============================================================================
// Tool Execution
// ============================================================================

async function execute(input: z.infer<typeof inputSchema>): Promise<ToolResult> {
	const { repoPath, action, name } = input;
	const cwd = repoPath || process.cwd();

	if (action === 'list') {
		const result = await listBranches(cwd);
		return {
			success: result.branches.length > 0 || !result.error,
			data: result,
			error: result.error ? {
				code: 'GIT_BRANCH_ERROR',
				message: result.error,
				details: { repoPath: cwd },
			} : undefined,
		};
	}

	if (action === 'current') {
		const result = await getCurrentBranch(cwd);
		return {
			success: !!result.branch,
			data: result,
			error: result.error ? {
				code: 'GIT_BRANCH_ERROR',
				message: result.error,
				details: { repoPath: cwd },
			} : undefined,
		};
	}

	if (action === 'create' && name) {
		try {
			const git = getGitInstance(cwd);
			await git.branch([name]);
			return {
				success: true,
				data: { success: true, branch: name, created: true },
			};
		} catch (error) {
			return {
				success: false,
				error: {
					code: 'GIT_BRANCH_ERROR',
					message: (error as Error).message,
					details: { repoPath: cwd, name },
				},
			};
		}
	}

	if (action === 'switch' && name) {
		try {
			const git = getGitInstance(cwd);
			await git.checkout(name);
			return {
				success: true,
				data: { success: true, branch: name, switched: true },
			};
		} catch (error) {
			return {
				success: false,
				error: {
					code: 'GIT_BRANCH_ERROR',
					message: (error as Error).message,
					details: { repoPath: cwd, name },
				},
			};
		}
	}

	return {
		success: false,
		error: {
			code: 'GIT_BRANCH_ERROR',
			message: 'Invalid action or missing branch name',
			details: { action, name },
		},
	};
}

// ============================================================================
// Tool Definition
// ============================================================================

export const gitBranchTool: ToolDefinition = {
	name: 'git_branch',
	description: 'List, create, or switch branches',
	category: 'git',
	inputSchema,
	permission: 'moderate',
	execute,
} as ToolDefinition;

### src/tools/git/is-protected.ts - Protected Branch Check

/**
 * Is Protected Branch Tool - Floyd Wrapper
 *
 * Tool wrapper for is_protected_branch from FLOYD_CLI
 */

import { z } from 'zod';
import type { ToolDefinition, ToolResult } from '../../types.ts';
import { isProtectedBranch, getCurrentBranch } from './git-core.ts';

// ============================================================================
// Zod Schema
// ============================================================================

const inputSchema = z.object({
	branch: z.string().optional(),
	repoPath: z.string().optional(),
});

// ============================================================================
// Tool Execution
// ============================================================================

async function execute(input: z.infer<typeof inputSchema>): Promise<ToolResult> {
	const { branch, repoPath } = input;
	const cwd = repoPath || process.cwd();

	let branchToCheck = branch;
	if (!branchToCheck) {
		const current = await getCurrentBranch(cwd);
		branchToCheck = current.branch;
	}

	if (!branchToCheck) {
		return {
			success: false,
			error: {
				code: 'GIT_PROTECTED_CHECK_ERROR',
				message: 'Could not determine branch',
				details: { repoPath: cwd },
			},
		};
	}

	const isProtected = isProtectedBranch(branchToCheck);

	return {
		success: true,
		data: {
			branch: branchToCheck,
			isProtected,
			protectedPatterns: ['main', 'master', 'development', 'develop', 'production', 'release'],
		},
	};
}

// ============================================================================
// Tool Definition
// ============================================================================

export const isProtectedBranchTool: ToolDefinition = {
	name: 'is_protected_branch',
	description: 'Check if a branch is protected (main, master, develop, etc.)',
	category: 'git',
	inputSchema,
	permission: 'none',
	execute,
} as ToolDefinition;

### src/tools/docs.ts - Tool Documentation Generator

/**
 * Tool Documentation System
 *
 * Generates markdown documentation from tool schemas and definitions.
 */

import type { ToolDefinition } from './types.ts';
import { toolRegistry } from './index.ts';

// ============================================================================
// Documentation Types
// ============================================================================

/**
 * Tool documentation format
 */
export interface ToolDocumentation {
  name: string;
  description: string;
  category: string;
  permission: string;
  inputSchema: unknown;
  example?: string;
  relatedTools: string[];
}

// ============================================================================
// Documentation Generator
// ============================================================================

/**
 * Generate documentation for a single tool
 */
export function generateToolDocumentation(tool: ToolDefinition): string {
  const lines: string[] = [];

  // Header
  lines.push(`### \`${tool.name}\``);
  lines.push('');

  // Description
  lines.push(`**Description:** ${tool.description}`);
  lines.push('');

  // Metadata
  lines.push('**Metadata:**');
  lines.push(`- **Category:** ${tool.category}`);
  lines.push(`- **Permission:** ${tool.permission}`);
  lines.push('');

  // Input Schema
  lines.push('**Input Schema:**');
  lines.push('```json');
  lines.push(JSON.stringify(tool.inputSchema, null, 2));
  lines.push('```');
  lines.push('');

  // Example usage (if available)
  if (tool.example) {
    lines.push('**Example Usage:**');
    lines.push('```typescript');
    lines.push(`await toolRegistry.execute('${tool.name}', ${JSON.stringify(tool.example, null, 2)});`);
    lines.push('```');
    lines.push('');
  }

  // Related tools
  const relatedTools = toolRegistry.getByCategory(tool.category)
    .filter(t => t.name !== tool.name)
    .slice(0, 5)
    .map(t => t.name);

  if (relatedTools.length > 0) {
    lines.push('**Related Tools:**');
    relatedTools.forEach(name => {
      lines.push(`- \`${name}\``);
    });
    lines.push('');
  }

  return lines.join('\n');
}

/**
 * Generate documentation for all tools in a category
 */
export function generateCategoryDocumentation(category: string): string {
  const tools = toolRegistry.getByCategory(category);

  if (tools.length === 0) {
    return `## ${category}\n\nNo tools found in this category.\n`;
  }

  const lines: string[] = [];

  // Category header
  lines.push(`## ${category}`);
  lines.push('');
  lines.push(`**Tools in this category:** ${tools.length}`);
  lines.push('');

  // Tool list
  tools.forEach(tool => {
    lines.push(generateToolDocumentation(tool));
  });

  return lines.join('\n');
}

/**
 * Generate documentation for all tools
 */
export function generateAllToolsDocumentation(): string {
  const tools = toolRegistry.getAll();
  const categories = [...new Set(tools.map(t => t.category))];

  const lines: string[] = [];

  // Title
  lines.push('# Floyd Wrapper - Tool Documentation');
  lines.push('');
  lines.push(`**Generated:** ${new Date().toISOString()}`);
  lines.push('');
  lines.push(`**Total Tools:** ${tools.length}`);
  lines.push('');
  lines.push(`**Categories:** ${categories.length}`);
  lines.push('');

  // Table of Contents
  lines.push('## Table of Contents');
  lines.push('');
  categories.forEach(category => {
    const toolsInCategory = tools.filter(t => t.category === category);
    lines.push(`- [${category}](#${category.toLowerCase().replace(/\s+/g, '-')}) (${toolsInCategory.length} tools)`);
  });
  lines.push('');

  // Category sections
  categories.forEach(category => {
    lines.push(generateCategoryDocumentation(category));
  });

  // Appendix
  lines.push('---');
  lines.push('');
  lines.push('## Appendix');
  lines.push('');

  // Permission Levels
  lines.push('### Permission Levels');
  lines.push('');
  lines.push('- **`none`** - Always allowed, no user confirmation required');
  lines.push('- **`moderate`** - Ask user once per session');
  lines.push('- **`dangerous`** - Ask user for every execution');
  lines.push('');

  // Tool Categories
  lines.push('### Tool Categories');
  lines.push('');
  categories.forEach(category => {
    const toolsInCategory = tools.filter(t => t.category === category);
    lines.push(`- **${category}** (${toolsInCategory.length} tools)`);
  });
  lines.push('');

  return lines.join('\n');
}

/**
 * Generate tool summary as a table
 */
export function generateToolTable(): string {
  const tools = toolRegistry.getAll();

  const lines: string[] = [];

  lines.push('# Available Tools');
  lines.push('');
  lines.push('| Tool | Description | Category | Permission |');
  lines.push('|------|-------------|----------|------------|');

  tools.sort((a, b) => a.category.localeCompare(b.category) || a.name.localeCompare(b.name));

  tools.forEach(tool => {
    const description = tool.description.split('\n')[0].slice(0, 60);
    lines.push(
      `| \`${tool.name}\` | ${description} | ${tool.category} | ${tool.permission} |`
    );
  });

  lines.push('');

  return lines.join('\n');
}

/**
 * Generate tool documentation in JSON format
 */
export function generateToolsJSON(): string {
  const tools = toolRegistry.getAll();

  const toolsJSON = tools.map(tool => ({
    name: tool.name,
    description: tool.description,
    category: tool.category,
    permission: tool.permission,
    inputSchema: tool.inputSchema,
    example: tool.example,
  }));

  return JSON.stringify(toolsJSON, null, 2);
}

// ============================================================================
// CLI Helpers
// ============================================================================

/**
 * Format tool list for CLI output
 */
export function formatToolList(category?: string): string {
  const tools = category
    ? toolRegistry.getByCategory(category)
    : toolRegistry.getAll();

  if (tools.length === 0) {
    return category
      ? `No tools found in category: ${category}`
      : 'No tools registered';
  }

  const lines: string[] = [];

  // Group by category
  if (!category) {
    const categories = [...new Set(tools.map(t => t.category))];
    categories.forEach(cat => {
      const catTools = tools.filter(t => t.category === cat);
      lines.push(`\n${cat}:`);
      catTools.forEach(tool => {
        lines.push(`  ${tool.name.padEnd(30)} ${tool.description.slice(0, 50)}`);
      });
    });
  } else {
    tools.forEach(tool => {
      lines.push(`  ${tool.name.padEnd(30)} ${tool.description.slice(0, 50)}`);
    });
  }

  return lines.join('\n');
}

/**
 * Format single tool details for CLI output
 */
export function formatToolDetails(toolName: string): string {
  const tool = toolRegistry.get(toolName);

  if (!tool) {
    return `Tool not found: ${toolName}`;
  }

  const lines: string[] = [];

  lines.push(`Tool: ${tool.name}`);
  lines.push('');
  lines.push(`Description: ${tool.description}`);
  lines.push(`Category: ${tool.category}`);
  lines.push(`Permission: ${tool.permission}`);
  lines.push('');
  lines.push('Input Schema:');
  lines.push(JSON.stringify(tool.inputSchema, null, 2));

  if (tool.example) {
    lines.push('');
    lines.push('Example:');
    lines.push(JSON.stringify(tool.example, null, 2));
  }

  return lines.join('\n');
}

/**
 * Get list of all categories
 */
export function getCategories(): string[] {
  const tools = toolRegistry.getAll();
  return [...new Set(tools.map(t => t.category))];
}

/**
 * Get statistics about tools
 */
export function getToolStats(): {
  totalTools: number;
  totalCategories: number;
  byCategory: Record<string, number>;
  byPermission: Record<string, number>;
} {
  const tools = toolRegistry.getAll();
  const categories = getCategories();

  const byCategory: Record<string, number> = {};
  const byPermission: Record<string, number> = {};

  tools.forEach(tool => {
    byCategory[tool.category] = (byCategory[tool.category] || 0) + 1;
    byPermission[tool.permission] = (byPermission[tool.permission] || 0) + 1;
  });

  return {
    totalTools: tools.length,
    totalCategories: categories.length,
    byCategory,
    byPermission,
  };
}

### src/ui/terminal.ts - FloydTerminal with CRUSH Branding

/**
 * FloydTerminal - Floyd Wrapper
 *
 * Terminal interface with CRUSH branding, ora spinners, progress bars, and status output.
 */

import chalk from 'chalk';
import ora from 'ora';
import type { Ora } from 'ora';
import { SingleBar } from 'cli-progress';
import { CRUSH_THEME, ASCII_LOGO } from '../constants.ts';
import { getRandomFloydMessage, getSpinnerForMessage } from '../whimsy/floyd-spinners.ts';

// ============================================================================
// FloydTerminal Class
// ============================================================================

/**
 * Terminal interface with CRUSH branding and Floyd theming
 */
export class FloydTerminal {
  /**
   * Global singleton instance
   */
  private static instance: FloydTerminal | null = null;

  /**
   * Active spinner instance
   */
  private activeSpinner: Ora | null = null;

  /**
   * Active progress bar instance
   */
  private activeProgressBar: SingleBar | null = null;

  /**
   * Private constructor for singleton pattern
   */
  private constructor() {}

  /**
   * Get global singleton instance
   */
  static getInstance(): FloydTerminal {
    if (!FloydTerminal.instance) {
      FloydTerminal.instance = new FloydTerminal();
    }
    return FloydTerminal.instance;
  }

  /**
   * Display ASCII logo
   */
  showLogo(): void {
    const logoColor = CRUSH_THEME.colors.primary;
    console.log(chalk.hex(logoColor)(ASCII_LOGO));
    console.log(chalk.hex(CRUSH_THEME.colors.secondary)(`  v${process.env.npm_package_version || '0.1.0'}  `));
    console.log();
  }

  /**
   * Display success message
   */
  success(message: string): void {
    console.log(chalk.hex(CRUSH_THEME.colors.success)(`✓ ${message}`));
  }

  /**
   * Display error message
   */
  error(message: string): void {
    console.log(chalk.hex(CRUSH_THEME.colors.error)(`✗ ${message}`));
  }

  /**
   * Display warning message
   */
  warning(message: string): void {
    console.log(chalk.hex(CRUSH_THEME.colors.warning)(`⚠ ${message}`));
  }

  /**
   * Display info message
   */
  info(message: string): void {
    console.log(chalk.hex(CRUSH_THEME.colors.info)(`ℹ ${message}`));
  }

  /**
   * Display muted/dim message
   */
  muted(message: string): void {
    console.log(chalk.hex(CRUSH_THEME.colors.muted)(message));
  }

  /**
   * Display primary branded message
   */
  primary(message: string): void {
    console.log(chalk.hex(CRUSH_THEME.colors.primary)(message));
  }

  /**
   * Display secondary branded message
   */
  secondary(message: string): void {
    console.log(chalk.hex(CRUSH_THEME.colors.secondary)(message));
  }

  /**
   * Create and start a spinner with Floyd theming
   */
  spinner(message?: string): Ora {
    // Stop any existing spinner
    this.stopSpinner();

    const spinnerMessage = message || getRandomFloydMessage();
    const spinnerConfig = getSpinnerForMessage(spinnerMessage);

    this.activeSpinner = ora({
      text: spinnerMessage,
      spinner: spinnerConfig,
      color: 'cyan',
    });

    this.activeSpinner.start();
    return this.activeSpinner;
  }

  /**
   * Stop the active spinner with success
   */
  stopSpinner(text?: string): void {
    if (this.activeSpinner) {
      this.activeSpinner.succeed(text);
      this.activeSpinner = null;
    }
  }

  /**
   * Stop the active spinner with error
   */
  failSpinner(text?: string): void {
    if (this.activeSpinner) {
      this.activeSpinner.fail(text);
      this.activeSpinner = null;
    }
  }

  /**
   * Stop the active spinner with warning
   */
  warnSpinner(text?: string): void {
    if (this.activeSpinner) {
      this.activeSpinner.warn(text);
      this.activeSpinner = null;
    }
  }

  /**
   * Update the active spinner text
   */
  updateSpinner(text: string): void {
    if (this.activeSpinner) {
      this.activeSpinner.text = text;
    }
  }

  /**
   * Create a progress bar
   */
  progressBar(total: number, startValue: number = 0): SingleBar {
    // Stop any existing progress bar
    this.stopProgressBar();

    this.activeProgressBar = new SingleBar({
      format: chalk.hex(CRUSH_THEME.colors.primary)('{bar}') + ' | {percentage}% | {value}/{total} | {eta_formatted}',
      barCompleteChar: '█',
      barIncompleteChar: '░',
      hideCursor: true,
    });

    this.activeProgressBar.start(total, startValue);
    return this.activeProgressBar;
  }

  /**
   * Update the active progress bar
   */
  updateProgressBar(value: number): void {
    if (this.activeProgressBar) {
      this.activeProgressBar.update(value);
    }
  }

  /**
   * Increment the active progress bar
   */
  incrementProgressBar(amount: number = 1): void {
    if (this.activeProgressBar) {
      this.activeProgressBar.increment(amount);
    }
  }

  /**
   * Stop the active progress bar
   */
  stopProgressBar(): void {
    if (this.activeProgressBar) {
      this.activeProgressBar.stop();
      this.activeProgressBar = null;
    }
  }

  /**
   * Display a section header
   */
  section(title: string): void {
    console.log();
    console.log(chalk.hex(CRUSH_THEME.colors.primary)(`▸ ${title}`));
    console.log(chalk.hex(CRUSH_THEME.colors.secondary)(String('─').repeat(title.length + 2)));
  }

  /**
   * Display a tool execution message
   */
  tool(toolName: string, description?: string): void {
    const name = chalk.hex(CRUSH_THEME.colors.primary)(toolName);
    const desc = description ? chalk.hex(CRUSH_THEME.colors.muted)(description) : '';
    console.log(`  ${name} ${desc}`);
  }

  /**
   * Display tool execution success
   */
  toolSuccess(toolName: string): void {
    const icon = chalk.hex(CRUSH_THEME.colors.success)('✓');
    console.log(`  ${icon} ${toolName}`);
  }

  /**
   * Display tool execution error
   */
  toolError(toolName: string, error?: string): void {
    const icon = chalk.hex(CRUSH_THEME.colors.error)('✗');
    console.log(`  ${icon} ${toolName}`);
    if (error) {
      console.log(`    ${chalk.hex(CRUSH_THEME.colors.muted)(error)}`);
    }
  }

  /**
   * Display a divider line
   */
  divider(char: string = '─', length: number = 60): void {
    console.log(chalk.hex(CRUSH_THEME.colors.muted)(char.repeat(length)));
  }

  /**
   * Display a blank line
   */
  blank(): void {
    console.log();
  }

  /**
   * Clear the terminal screen
   */
  clear(): void {
    console.clear();
  }

  /**
   * Clean up all active terminal elements
   */
  cleanup(): void {
    this.stopSpinner();
    this.stopProgressBar();
  }
}

// ============================================================================
// Global Terminal Instance
// ============================================================================

/**
 * Global terminal instance
 */
export const terminal = FloydTerminal.getInstance();

### src/ui/rendering.ts - StreamingDisplay with log-update

/**
 * Floyd Wrapper - In-place token streaming renderer
 *
 * Uses log-update for smooth token streaming without scroll spam.
 */

import logUpdate from 'log-update';

// ============================================================================
// StreamingDisplay Class
// ============================================================================

/**
 * In-place streaming display for tokens
 */
export class StreamingDisplay {
  /**
   * Global singleton instance
   */
  private static instance: StreamingDisplay | null = null;

  /**
   * Current buffer of displayed text
   */
  private buffer: string = '';

  /**
   * Whether rendering is active
   */
  private active: boolean = false;

  /**
   * Private constructor for singleton pattern
   */
  private constructor() {}

  /**
   * Get global singleton instance
   */
  static getInstance(): StreamingDisplay {
    if (!StreamingDisplay.instance) {
      StreamingDisplay.instance = new StreamingDisplay();
    }
    return StreamingDisplay.instance;
  }

  /**
   * Append a token to the display
   * @param token The token text to append
   */
  appendToken(token: string): void {
    this.active = true;
    this.buffer += token;
    this.render();
  }

  /**
   * Render the current buffer in-place
   */
  private render(): void {
    logUpdate(this.buffer);
  }

  /**
   * Complete the streaming display and finalize output
   */
  finish(): void {
    if (!this.active) {
      return;
    }

    // Write final output with proper newline
    logUpdate.done();
    console.log(this.buffer);

    // Reset state
    this.buffer = '';
    this.active = false;
  }

  /**
   * Clear the current display without finishing
   */
  clear(): void {
    this.buffer = '';
    logUpdate.clear();
  }

  /**
   * Get the current buffer content
   */
  getBuffer(): string {
    return this.buffer;
  }

  /**
   * Check if streaming is active
   */
  isActive(): boolean {
    return this.active;
  }

  /**
   * Reset the singleton instance (for testing only)
   *
   * This method clears the global singleton instance, allowing
   * tests to start with a fresh state. Should only be used in test code.
   */
  static resetInstance(): void {
    StreamingDisplay.instance = null;
  }
}

// ============================================================================
// Global Renderer Instance
// ============================================================================

/**
 * Global streaming display instance for token rendering
 */
export const renderer = StreamingDisplay.getInstance();

### src/ui/history.ts - Conversation History Display

/**
 * Conversation History - Floyd Wrapper
 *
 * Display conversation history with formatting options.
 */

import chalk from 'chalk';
import type { FloydMessage } from '../types.ts';

// ============================================================================
// Conversation History Class
// ============================================================================

/**
 * Manages and displays conversation history
 */
export class ConversationHistory {
  private messages: FloydMessage[] = [];

  /**
   * Add a message to history
   */
  addMessage(message: FloydMessage): void {
    this.messages.push(message);
  }

  /**
   * Clear all messages
   */
  clear(): void {
    this.messages = [];
  }

  /**
   * Get all messages
   */
  getMessages(): FloydMessage[] {
    return this.messages;
  }

  /**
   * Get message count
   */
  getCount(): number {
    return this.messages.length;
  }

  /**
   * Display recent messages (last 10 by default)
   */
  display(limit: number = 10): void {
    if (this.messages.length === 0) {
      console.log(chalk.gray('No messages in history'));
      console.log();
      return;
    }

    const recentMessages = this.messages.slice(-limit);

    for (const msg of recentMessages) {
      const roleColor = msg.role === 'user' ? chalk.green : chalk.cyan;
      const roleName = msg.role === 'user' ? 'You' : msg.role === 'assistant' ? 'Floyd' : msg.role.toUpperCase();

      console.log(`${roleColor.bold(`${roleName}:`)}`);

      if (msg.role === 'tool') {
        // For tool messages, show tool name and result
        const toolName = msg.toolName || 'unknown';
        console.log(chalk.dim(`Tool: ${toolName}`));
        console.log();
      } else {
        // For user/assistant messages, show content
        console.log(msg.content);
        console.log();
      }
    }
  }

  /**
   * Display messages as a compact table
   */
  displayCompact(limit: number = 10): void {
    if (this.messages.length === 0) {
      console.log(chalk.gray('No messages in history'));
      console.log();
      return;
    }

    const recentMessages = this.messages.slice(-limit);

    console.log(chalk.dim('─'.repeat(60)));
    console.log(chalk.bold('Conversation History'));
    console.log(chalk.dim('─'.repeat(60)));

    for (const msg of recentMessages) {
      const roleColor = msg.role === 'user' ? chalk.green : chalk.cyan;
      const roleName = msg.role === 'user' ? 'You' : msg.role === 'assistant' ? 'Floyd' : msg.role.toUpperCase();
      const preview = msg.content.slice(0, 60) + (msg.content.length > 60 ? '...' : '');

      console.log(`${roleColor(roleName.padEnd(12))} ${chalk.dim(preview)}`);
    }

    console.log(chalk.dim('─'.repeat(60)));
    console.log();
  }

  /**
   * Get last user message
   */
  getLastUserMessage(): string | undefined {
    for (let i = this.messages.length - 1; i >= 0; i--) {
      if (this.messages[i].role === 'user') {
        return this.messages[i].content;
      }
    }
    return undefined;
  }

  /**
   * Get last assistant message
   */
  getLastAssistantMessage(): string | undefined {
    for (let i = this.messages.length - 1; i >= 0; i--) {
      if (this.messages[i].role === 'assistant') {
        return this.messages[i].content;
      }
    }
    return undefined;
  }

  /**
   * Get messages by role
   */
  getMessagesByRole(role: FloydMessage['role']): FloydMessage[] {
    return this.messages.filter(msg => msg.role === role);
  }

  /**
   * Get turn count (pairs of user + assistant)
   */
  getTurnCount(): number {
    const userMessages = this.getMessagesByRole('user');
    const assistantMessages = this.getMessagesByRole('assistant');
    return Math.min(userMessages.length, assistantMessages.length);
  }
}

// ============================================================================
// Global History Instance
// ============================================================================

/**
 * Global conversation history instance
 */
export const conversationHistory = new ConversationHistory();

### src/utils/config.ts - Configuration Management

/**
 * Configuration Management - Floyd Wrapper
 *
 * Configuration loader with Zod validation supporting .env files and environment variable overrides.
 */

import fs from 'fs-extra';
import * as path from 'path';
import { z } from 'zod';
import type { FloydConfig } from '../types.ts';
import { logger } from './logger.ts';
import { ConfigError } from './errors.ts';

// ============================================================================
// Configuration Schema
// ============================================================================

/**
 * Zod schema for Floyd configuration
 */
const configSchema = z.object({
  glmApiKey: z.string().min(1, 'GLM API key is required'),
  glmApiEndpoint: z.string().url('GLM API endpoint must be a valid URL').default('https://api.z.ai/api/anthropic'),
  glmModel: z.string().min(1).default('glm-4.7'),
  maxTokens: z.number().int().positive().default(100000),
  temperature: z.number().min(0).max(2).default(0.7),
  maxTurns: z.number().int().positive().default(20),
  logLevel: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
  cacheEnabled: z.boolean().default(true),
  permissionLevel: z.enum(['auto', 'ask', 'deny']).default('ask'),
});

// ============================================================================
// Configuration Loader
// ============================================================================

/**
 * Load configuration from environment variables
 *
 * Priority: env vars > .env file > defaults
 */
export async function loadConfig(): Promise<FloydConfig> {
  logger.debug('Loading configuration...');

  // Load from environment variables
  const envVars: Record<string, string | undefined> = {
    glmApiKey: process.env.FLOYD_GLM_API_KEY || process.env.GLM_API_KEY,
    glmApiEndpoint: process.env.FLOYD_GLM_ENDPOINT || process.env.GLM_API_ENDPOINT,
    glmModel: process.env.FLOYD_GLM_MODEL || process.env.GLM_MODEL,
    maxTokens: process.env.FLOYD_MAX_TOKENS,
    temperature: process.env.FLOYD_TEMPERATURE,
    maxTurns: process.env.FLOYD_MAX_TURNS,
    logLevel: process.env.FLOYD_LOG_LEVEL,
    cacheEnabled: process.env.FLOYD_CACHE_ENABLED,
    permissionLevel: process.env.FLOYD_PERMISSION_LEVEL,
  };

  // Clean undefined values and parse to correct types
  const parsed: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(envVars)) {
    if (value === undefined || value === '') {
      continue;
    }

    switch (key) {
      case 'maxTokens':
      case 'maxTurns':
        parsed[key] = parseInt(value, 10);
        break;
      case 'temperature':
        parsed[key] = parseFloat(value);
        break;
      case 'cacheEnabled':
        parsed[key] = value.toLowerCase() === 'true' || value === '1';
        break;
      default:
        parsed[key] = value;
    }
  }

  // Validate with Zod
  try {
    const config = configSchema.parse(parsed) as FloydConfig;
    logger.debug('Configuration loaded successfully');
    logger.debug(`GLM API Endpoint: ${config.glmApiEndpoint}`);
    logger.debug(`GLM Model: ${config.glmModel}`);
    logger.debug(`Max Tokens: ${config.maxTokens}`);
    logger.debug(`Temperature: ${config.temperature}`);
    logger.debug(`Log Level: ${config.logLevel}`);
    logger.debug(`Cache Enabled: ${config.cacheEnabled}`);
    logger.debug(`Permission Level: ${config.permissionLevel}`);

    return config;
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessages = error.errors.map((e) => `- ${e.path.join('.')}: ${e.message}`).join('\n');
      throw new ConfigError(`Invalid configuration:\n${errorMessages}`, { errors: error.errors });
    }

    throw new ConfigError(`Failed to load configuration: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Load project context from configuration files
 *
 * Searches for project configuration in:
 * 1. FLOYD.md
 * 2. AGENTS.md
 * 3. .floyd/config.md
 */
export async function loadProjectContext(projectRoot: string): Promise<string | null> {
  logger.debug(`Loading project context from ${projectRoot}...`);

  const configPaths = [
    path.join(projectRoot, 'FLOYD.md'),
    path.join(projectRoot, 'AGENTS.md'),
    path.join(projectRoot, '.floyd', 'config.md'),
  ];

  for (const configPath of configPaths) {
    if (await fs.pathExists(configPath)) {
      logger.debug(`Found project context at ${configPath}`);
      const content = await fs.readFile(configPath, 'utf-8');
      return content;
    }
  }

  logger.debug('No project context found');
  return null;
}

/**
 * Get cache directory path
 */
export function getCachePath(tier: 'reasoning' | 'project' | 'vault'): string {
  return path.join(process.cwd(), '.floyd', 'cache', tier);
}

/**
 * Ensure cache directories exist
 */
export async function ensureCacheDirectories(): Promise<void> {
  const cacheDir = path.join(process.cwd(), '.floyd', 'cache');

  if (!(await fs.pathExists(cacheDir))) {
    logger.debug('Creating cache directories...');
    await fs.ensureDir(cacheDir);
  }

  const tiers: Array<'reasoning' | 'project' | 'vault'> = ['reasoning', 'project', 'vault'];

  for (const tier of tiers) {
    const tierPath = getCachePath(tier);
    await fs.ensureDir(tierPath);
    logger.debug(`Ensured cache directory exists: ${tierPath}`);
  }
}

// ============================================================================
// Configuration Helpers
// ============================================================================

/**
 * Validate configuration object
 */
export function validateConfig(config: unknown): FloydConfig {
  try {
    return configSchema.parse(config) as FloydConfig;
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessages = error.errors.map((e) => `- ${e.path.join('.')}: ${e.message}`).join('\n');
      throw new ConfigError(`Invalid configuration:\n${errorMessages}`, { errors: error.errors });
    }

    throw new ConfigError(`Failed to validate configuration: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Get default configuration values
 * Note: This excludes required fields like glmApiKey
 */
export function getDefaultConfig(): Partial<z.infer<typeof configSchema>> {
  return {
    glmApiEndpoint: 'https://api.z.ai/api/anthropic',
    glmModel: 'glm-4.7',
    maxTokens: 100000,
    temperature: 0.7,
    maxTurns: 20,
    logLevel: 'info',
    cacheEnabled: true,
    permissionLevel: 'ask',
  };
}

/**
 * Merge configuration values (doesn't validate)
 */
export function mergeConfig(...configs: Partial<z.infer<typeof configSchema>>[]): Partial<z.infer<typeof configSchema>> {
  const merged: Partial<z.infer<typeof configSchema>> = {};

  for (const config of configs) {
    Object.assign(merged, config);
  }

  return merged;
}

// ============================================================================
// Environment Variable Helpers
// ============================================================================

/**
 * Get environment variable as boolean
 */
export function getEnvBool(key: string, defaultValue: boolean = false): boolean {
  const value = process.env[key];
  if (value === undefined || value === '') {
    return defaultValue;
  }
  return value.toLowerCase() === 'true' || value === '1';
}

/**
 * Get environment variable as number
 */
export function getEnvNumber(key: string, defaultValue: number): number {
  const value = process.env[key];
  if (value === undefined || value === '') {
    return defaultValue;
  }
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? defaultValue : parsed;
}

/**
 * Get environment variable as string
 */
export function getEnvString(key: string, defaultValue: string = ''): string {
  return process.env[key] || defaultValue;
}

### src/utils/errors.ts - Custom Error Classes

/**
 * Custom Error Classes - Floyd Wrapper
 *
 * Error handling infrastructure with typed error classes and recovery utilities.
 */

// ============================================================================
// Base Error Class
// ============================================================================

/**
 * Base error class for all Floyd-specific errors
 */
export class FloydError extends Error {
  /**
   * Error code for programmatic handling
   */
  public readonly code: string;

  /**
   * Additional error details
   */
  public readonly details?: unknown;

  constructor(message: string, code: string, details?: unknown) {
    super(message);
    this.name = 'FloydError';
    this.code = code;
    this.details = details;

    // Maintains proper stack trace (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, FloydError);
    }
  }

  toJSON(): Record<string, unknown> {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      details: this.details,
      stack: this.stack,
    };
  }
}

// ============================================================================
// Tool Errors
// ============================================================================

/**
 * Error thrown when tool execution fails
 */
export class ToolExecutionError extends FloydError {
  public readonly toolName: string;

  constructor(toolName: string, message: string, details?: unknown) {
    const errorDetails: Record<string, unknown> = { toolName };
    if (details && typeof details === 'object' && !Array.isArray(details)) {
      Object.assign(errorDetails, details);
    }
    super(message, 'TOOL_EXECUTION_ERROR', errorDetails);
    this.name = 'ToolExecutionError';
    this.toolName = toolName;
  }
}

// ============================================================================
// API Errors
// ============================================================================

/**
 * Error thrown when GLM API call fails
 */
export class GLMAPIError extends FloydError {
  public readonly statusCode?: number;

  constructor(message: string, statusCode?: number, details?: unknown) {
    const errorDetails: Record<string, unknown> = { statusCode };
    if (details && typeof details === 'object' && !Array.isArray(details)) {
      Object.assign(errorDetails, details);
    }
    super(message, 'GLM_API_ERROR', errorDetails);
    this.name = 'GLMAPIError';
    this.statusCode = statusCode;
  }

  /**
   * Whether this error is an authentication error
   */
  isAuthError(): boolean {
    return this.statusCode === 401;
  }

  /**
   * Whether this error is a rate limit error
   */
  isRateLimitError(): boolean {
    return this.statusCode === 429;
  }

  /**
   * Whether this error is a server error
   */
  isServerError(): boolean {
    return this.statusCode !== undefined && this.statusCode >= 500;
  }
}

// ============================================================================
// Permission Errors
// ============================================================================

/**
 * Error thrown when permission is denied for a tool
 */
export class PermissionDeniedError extends FloydError {
  public readonly toolName: string;

  constructor(toolName: string, reason: string) {
    super(`Permission denied for ${toolName}: ${reason}`, 'PERMISSION_DENIED', { toolName, reason });
    this.name = 'PermissionDeniedError';
    this.toolName = toolName;
  }
}

// ============================================================================
// Stream Errors
// ============================================================================

/**
 * Error thrown when stream processing fails
 */
export class StreamError extends FloydError {
  constructor(message: string, details?: unknown) {
    super(message, 'STREAM_ERROR', details);
    this.name = 'StreamError';
  }
}

// ============================================================================
// Cache Errors
// ============================================================================

/**
 * Error thrown when cache operations fail
 */
export class CacheError extends FloydError {
  constructor(message: string, details?: unknown) {
    super(message, 'CACHE_ERROR', details);
    this.name = 'CacheError';
  }
}

// ============================================================================
// Configuration Errors
// ============================================================================

/**
 * Error thrown when configuration is invalid
 */
export class ConfigError extends FloydError {
  constructor(message: string, details?: unknown) {
    super(message, 'CONFIG_ERROR', details);
    this.name = 'ConfigError';
  }
}

// ============================================================================
// Validation Errors
// ============================================================================

/**
 * Error thrown when input validation fails
 */
export class ValidationError extends FloydError {
  constructor(message: string, details?: unknown) {
    super(message, 'VALIDATION_ERROR', details);
    this.name = 'ValidationError';
  }
}

// ============================================================================
// Timeout Errors
// ============================================================================

/**
 * Error thrown when operation times out
 */
export class TimeoutError extends FloydError {
  constructor(message: string, details?: unknown) {
    super(message, 'TIMEOUT_ERROR', details);
    this.name = 'TimeoutError';
  }
}

// ============================================================================
// Type Guards
// ============================================================================

/**
 * Type guard for FloydError
 */
export function isFloydError(error: unknown): error is FloydError {
  return error instanceof FloydError;
}

/**
 * Type guard for ToolExecutionError
 */
export function isToolExecutionError(error: unknown): error is ToolExecutionError {
  return error instanceof ToolExecutionError;
}

/**
 * Type guard for GLMAPIError
 */
export function isGLMAPIError(error: unknown): error is GLMAPIError {
  return error instanceof GLMAPIError;
}

/**
 * Type guard for PermissionDeniedError
 */
export function isPermissionDeniedError(error: unknown): error is PermissionDeniedError {
  return error instanceof PermissionDeniedError;
}

// ============================================================================
// Error Recovery Utilities
// ============================================================================

/**
 * Determine if an error is recoverable (can be retried)
 */
export function isRecoverableError(error: Error): boolean {
  if (error instanceof GLMAPIError) {
    // Auth errors are not recoverable
    if (error.isAuthError()) {
      return false;
    }
    // Rate limit and server errors are recoverable
    return error.isRateLimitError() || error.isServerError();
  }

  // Timeout errors are recoverable
  if (error instanceof TimeoutError) {
    return true;
  }

  return false;
}

/**
 * Determine if an error should trigger a retry
 */
export function shouldRetry(error: Error): boolean {
  if (error instanceof GLMAPIError) {
    // Retry on rate limit and server errors
    if (error.isRateLimitError()) {
      return true;
    }

    if (error.isServerError()) {
      return true;
    }
  }

  if (error instanceof TimeoutError) {
    return true;
  }

  return false;
}

/**
 * Get suggested retry delay in milliseconds
 */
export function getRetryDelay(error: Error, attempt: number): number {
  const baseDelay = 1000; // 1 second base delay
  const maxDelay = 30000; // 30 seconds max delay

  if (error instanceof GLMAPIError && error.isRateLimitError()) {
    // Use exponential backoff with jitter
    const delay = Math.min(baseDelay * 2 ** attempt + Math.random() * 1000, maxDelay);
    return delay;
  }

  // Standard exponential backoff
  const delay = Math.min(baseDelay * 2 ** attempt, maxDelay);
  return delay;
}

/**
 * Format error for user-friendly display
 */
export function formatError(error: Error): string {
  if (isFloydError(error)) {
    let message = `${error.name}: ${error.message}`;

    if (error.details) {
      try {
        message += `\nDetails: ${JSON.stringify(error.details, null, 2)}`;
      } catch {
        message += `\nDetails: [Could not serialize]`;
      }
    }

    return message;
  }

  return error.message || 'An unknown error occurred';
}

### src/utils/logger.ts - FloydLogger

/**
 * Logger - Floyd Wrapper
 *
 * Color-coded logging system with level filtering and tool execution logging.
 */

import chalk from 'chalk';
import type { LogLevel } from '../types.ts';

// ============================================================================
// Logger Class
// ============================================================================

/**
 * Color-coded logger with level filtering
 */
export class FloydLogger {
  /**
   * Current log level
   */
  private level: LogLevel;

  /**
   * Log level priority (higher number = higher priority)
   */
  private readonly levelPriority: Record<LogLevel, number> = {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3,
  };

  constructor(level: LogLevel = 'info') {
    this.level = level;
  }

  /**
   * Set the log level
   */
  setLevel(level: LogLevel): void {
    this.level = level;
  }

  /**
   * Get the current log level
   */
  getLevel(): LogLevel {
    return this.level;
  }

  /**
   * Determine if a message should be logged based on level
   */
  private shouldLog(level: LogLevel): boolean {
    return this.levelPriority[level] >= this.levelPriority[this.level];
  }

  /**
   * Format timestamp
   */
  private getTimestamp(): string {
    const now = new Date();
    return now.toISOString();
  }

  /**
   * Log debug message
   */
  debug(message: string, ...args: unknown[]): void {
    if (this.shouldLog('debug')) {
      console.error(chalk.gray(`${this.getTimestamp()} [DEBUG]`), message, ...args);
    }
  }

  /**
   * Log info message
   */
  info(message: string, ...args: unknown[]): void {
    if (this.shouldLog('info')) {
      console.error(chalk.blue(`${this.getTimestamp()} [INFO]`), message, ...args);
    }
  }

  /**
   * Log warning message
   */
  warn(message: string, ...args: unknown[]): void {
    if (this.shouldLog('warn')) {
      console.error(chalk.yellow(`${this.getTimestamp()} [WARN]`), message, ...args);
    }
  }

  /**
   * Log error message
   */
  error(message: string, error?: Error | unknown): void {
    if (this.shouldLog('error')) {
      console.error(chalk.red(`${this.getTimestamp()} [ERROR]`), message);

      if (error instanceof Error) {
        console.error(chalk.gray(error.stack || error.message));
      } else if (error) {
        console.error(chalk.gray(String(error)));
      }
    }
  }

  /**
   * Log tool execution
   */
  tool(toolName: string, input: unknown, output: unknown): void {
    if (this.shouldLog('debug')) {
      console.error(chalk.cyan(`${this.getTimestamp()} [TOOL]`), toolName);

      try {
        console.error(chalk.gray('  Input:'), JSON.stringify(input, null, 2));
      } catch {
        console.error(chalk.gray('  Input:'), '[Could not serialize]');
      }

      try {
        console.error(chalk.gray('  Output:'), JSON.stringify(output, null, 2));
      } catch {
        console.error(chalk.gray('  Output:'), '[Could not serialize]');
      }
    }
  }

  /**
   * Log API request
   */
  apiRequest(endpoint: string, method: string = 'POST'): void {
    if (this.shouldLog('debug')) {
      console.error(chalk.magenta(`${this.getTimestamp()} [API]`), `${method} ${endpoint}`);
    }
  }

  /**
   * Log API response
   */
  apiResponse(statusCode: number, duration: number): void {
    if (this.shouldLog('debug')) {
      const statusColor =
        statusCode >= 200 && statusCode < 300
          ? chalk.green
          : statusCode >= 400 && statusCode < 500
            ? chalk.yellow
            : chalk.red;

      console.error(
        statusColor(`${this.getTimestamp()} [API]`),
        `Status: ${statusCode} (${duration}ms)`
      );
    }
  }

  /**
   * Log cache operation
   */
  cache(operation: 'hit' | 'miss' | 'set' | 'delete', key: string): void {
    if (this.shouldLog('debug')) {
      const colors = {
        hit: chalk.green,
        miss: chalk.yellow,
        set: chalk.blue,
        delete: chalk.gray,
      };

      console.error(colors[operation](`${this.getTimestamp()} [CACHE]`), operation.toUpperCase(), key);
    }
  }

  /**
   * Log permission request
   */
  permissionRequest(toolName: string, description: string): void {
    if (this.shouldLog('warn')) {
      console.error(
        chalk.magenta(`${this.getTimestamp()} [PERMISSION]`),
        `Requesting permission for ${toolName}`
      );
      console.error(chalk.gray('  Description:'), description);
    }
  }

  /**
   * Log stream event
   */
  streamEvent(eventType: string, data: string): void {
    if (this.shouldLog('debug')) {
      console.error(chalk.cyan(`${this.getTimestamp()} [STREAM]`), eventType, data);
    }
  }

  /**
   * Log agent state change
   */
  agentState(fromState: string, toState: string): void {
    if (this.shouldLog('debug')) {
      console.error(chalk.cyan(`${this.getTimestamp()} [AGENT]`), `${fromState} -> ${toState}`);
    }
  }

  /**
   * Create a scoped logger with prefix
   */
  scoped(prefix: string): FloydScopedLogger {
    return new FloydScopedLogger(this, prefix);
  }
}

// ============================================================================
// Scoped Logger
// ============================================================================

/**
 * Scoped logger with automatic prefix
 */
export class FloydScopedLogger {
  private logger: FloydLogger;
  private prefix: string;

  constructor(logger: FloydLogger, prefix: string) {
    this.logger = logger;
    this.prefix = prefix;
  }

  debug(message: string, ...args: unknown[]): void {
    this.logger.debug(`[${this.prefix}] ${message}`, ...args);
  }

  info(message: string, ...args: unknown[]): void {
    this.logger.info(`[${this.prefix}] ${message}`, ...args);
  }

  warn(message: string, ...args: unknown[]): void {
    this.logger.warn(`[${this.prefix}] ${message}`, ...args);
  }

  error(message: string, error?: Error | unknown): void {
    this.logger.error(`[${this.prefix}] ${message}`, error);
  }

  tool(toolName: string, input: unknown, output: unknown): void {
    this.logger.tool(toolName, input, output);
  }
}

// ============================================================================
// Global Logger Instance
// ============================================================================

/**
 * Global logger instance
 */
export const logger = new FloydLogger();

/**
 * Set global log level from environment variable
 */
export function initLogger(): void {
  const logLevel = process.env.FLOYD_LOG_LEVEL as LogLevel | undefined;

  if (logLevel && ['debug', 'info', 'warn', 'error'].includes(logLevel)) {
    logger.setLevel(logLevel);
  }
}

### src/utils/security.ts - Security Utilities

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

### src/whimsy/floyd-spinners.ts - Pink Floyd Themed Spinners

/**
 * Floyd CLI - Pink Floyd Themed Spinners
 *
 * Combines whimsical Pink Floyd thinking messages with appropriate CLI spinners
 * from cli-spinners package + custom Floyd-themed ASCII animations
 *
 * @module utils/floyd-spinners
 */

import cliSpinners from 'cli-spinners';

// ============================================================================
// CUSTOM PINK FLOYD SPINNERS
// ============================================================================

export const customFloydSpinners = {
	/** Moon phases (Dark Side of the Moon) */
	floydMoon: {
		interval: 120,
		frames: ['🌑  ', '🌒  ', '🌓  ', '🌔  ', '🌕  ', '🌖  ', '🌗  ', '🌘  '],
	},

	/** Dark Side prism light refraction */
	floydPrism: {
		interval: 100,
		frames: [
			'    △    ',
			'   ◹◺   ',
			'  ◸◿◹◺  ',
			' ◿🌈◿ ',
			'  ◺◹◸◹  ',
			'   ◺◹   ',
			'    ▽    ',
		],
	},

	/** The Wall being built brick by brick */
	floydWall: {
		interval: 150,
		frames: ['     ', ' ▓   ', ' ▓▓  ', ' ▓▓▓ ', '▓▓▓▓ ', '▓▓▓▓▓'],
	},

	/** Flying pig (Animals album) */
	floydPig: {
		interval: 200,
		frames: ['    🐷    ', '   🐷🐷   ', '  🐷🐷🐷  ', '   🐷🐷   ', '    🐷    '],
	},

	/** Atom heart symbol (Atom Heart Mother) */
	floydAtom: {
		interval: 80,
		frames: ['  ◉  ', ' ◈◈ ', '◇◇◇', ' ◈◈ ', '  ◉  '],
	},

	/** Bike wheel spinning (Bike song) */
	floydBike: {
		interval: 70,
		frames: ['─╼─', '╀─╼', '╼─╀', '─╼─'],
	},

	/** Flying saucer (Saucerful of Secrets) */
	floydSaucer: {
		interval: 100,
		frames: ['   🛸   ', '  🛸✨  ', ' 🛸✨✨ ', '  🛸✨  ', '   🛸   '],
	},

	/** Rainbow refraction (DSOTM cover) */
	floydRainbow: {
		interval: 120,
		frames: ['░░▓▓░░', '░▓██▓░', '▓████▓', '▓██▓▓', '▓▓░░▓▓'],
	},

	/** Hammer (The Wall - "Another Brick in the Wall") */
	floydHammer: {
		interval: 100,
		frames: ['🔨    ', '  🔨  ', '    🔨', '  🔨  '],
	},

	/** Diamond sparkle (Shine On You Crazy Diamond) */
	floydDiamond: {
		interval: 90,
		frames: ['  ◇  ', ' ◈◈ ', '💎✨', ' ◈◈ ', '  ◇  '],
	},

	/** Flower power (Summer '68) */
	floydFlower: {
		interval: 150,
		frames: ['✿    ', ' ✿   ', '  ✿  ', '   ✿ ', '    ✿', '   ✿ ', '  ✿  ', ' ✿   '],
	},

	/** Sun rising/setting (Set the Controls for the Heart of the Sun) */
	floydSun: {
		interval: 100,
		frames: ['🌅    ', ' 🌅   ', '  🌅  ', ' 🌞  ', '  🌅  ', ' 🌅   ', '🌅    '],
	},

	/** Ocean waves (Echoes, One of These Days) */
	floydWave: {
		interval: 120,
		frames: ['〜〜〜', ' 〜〜〜', '〜〜〜 ', ' 〜〜〜'],
	},

	/** Clouds parting (Obscured by Clouds, Goodbye Blue Sky) */
	floydClouds: {
		interval: 150,
		frames: ['☁️☁️☁️', '☁️☁️ 🌤️', '☁️  ⛅️', ' 🌤️    ', '⛅️  ☁️', '🌤️ ☁️☁️'],
	},

	/** Light turning on (Let There Be More Light) */
	floydLight: {
		interval: 80,
		frames: ['💡   ', '💡✨ ', ' 💡✨', '  💡 ', '   💡'],
	},

	/** Rocket launching (Interstellar Overdrive) */
	floydRocket: {
		interval: 100,
		frames: ['  🚀  ', ' 🚀💫', '🚀💫✨', ' 🚀💫', '  🚀  '],
	},

	/** Eye blinking (See Emily Play) */
	floydEye: {
		interval: 200,
		frames: ['👁️   ', ' 👁️  ', '  👁️ ', '   👁️', '  👁️ ', ' 👁️  '],
	},

	/** Fire flames (Set the Controls for the Heart of the Sun, Flaming) */
	floydFire: {
		interval: 90,
		frames: ['🔥   ', ' 🔥🔥', '🔥🔥🔥', ' 🔥🔥', '🔥   '],
	},
};

// ============================================================================
// PINK FLOYD THINKING MESSAGES
// ============================================================================

export const floydThinkingMessages = [
	// The Dark Side of the Moon
	'🌙 Painting brilliant colors on the dark side of the moon...',
	'⏰ Time is ticking away, waiting for the answer to emerge...',
	'💰 Money: it\'s a gas, processing your request...',
	'🎵 Listening to the great gig in the sky, gathering thoughts...',
	'⚡ Us and them: finding the middle ground in your code...',
	'🧠 Brain damage: the lunatic is on the grass, computing...',
	'🌈 Breathe, breathe in the air... processing deeply...',
	'🔊 On the run: chasing down the solution...',

	// Wish You Were Here
	'🎸 Wish you were here... but the model\'s still thinking...',
	'🔥 Welcome to the machine: computing your request...',
	'🌊 Have a cigar: rolling the solution into shape...',
	'💎 Shine on you crazy diamond: polishing the response...',
	'🌧️ Wading through the waters of ambiguity...',
	'🔥 Burning through the complexity, just like the sun...',

	// The Wall
	'🧱 Another brick in the wall: building your solution layer by layer...',
	'😮 Comfortably numb: waiting for the feeling to return...',
	'🎻 Hey you: out there in the cold, getting an answer...',
	'👶 Is there anybody out there? Checking the data stream...',
	'🎸 Run like hell: racing through the possibilities...',
	'🌙 Goodbye blue sky: clearing the fog of uncertainty...',
	'🏠 Empty spaces: filling in the blanks...',
	'🎵 Young lust: eager to respond, just processing...',

	// Animals
	'🐷 Pigs on the wing: flying through the data...',
	'🐑 Sheep: safely herding the bits and bytes...',
	'🐕 Dogs: guarding against errors in the response...',

	// Atom Heart Mother
	'🎺 Atom heart mother: synthesize-ing the solution...',
	'🌬️ If: contemplating the possibilities...',
	'🌻 Summer \'68: grooving through the computation...',
	'🎵 Fat old sun: warming up the algorithm...',

	// Meddle & Obscured by Clouds
	'🌊 One of these days: getting to the answer...',
	'🔁 Echoes: bouncing ideas off the digital canyon...',
	'🎹 Fearless: boldly computing where no code has computed before...',
	'☁️ Obscured by clouds: clearing up the confusion...',
	'🌧️ When you\'re in: deep in the thought process...',
	'🎸 Childhood\'s end: maturing the response...',

	// Piper at the Gates of Dawn
	'🌟 Astronomy domine: calculating celestial solutions...',
	'🔥 Lucifer sam: prowling through the codebase...',
	'🚀 Interstellar overdrive: engaging faster-than-light processing...',
	'👁️ See emily play: envisioning the perfect response...',
	'🐁 Matilda mother: nurturing the solution...',
	'🌙 Flaming: setting ideas ablaze...',
	'🚂 Bike: riding through the data landscape...',

	// Saucerful of Secrets & More
	'🛸 Set the controls for the heart of the sun: navigating deep space...',
	'🌀 Let there be more light: illuminating the answer...',
	'💀 Corporal clegg: marching towards the solution...',
	'🎵 Careful with that axe, Eugene: handling delicate operations...',
	'🌊 Several species: complex synthesis in progress...',
	'🌑 The narrow way: finding the path through...',
	'🎸 Sysyphus: rolling the boulder of knowledge uphill...',

	// General Vibes
	'🎸 In the studio: mixing the perfect response...',
	'🎧 Roger Waters is reviewing your request...',
	'🎹 David Gilmour is carefully crafting the solo...',
	'🎵 Rick Wright is adding the atmospheric layers...',
	'🥁 Nick Mason is keeping the perfect rhythm...',
	'🔺 Syd Barrett is seeing something you\'re not...',
	'🎨 Storm Thorgerson is designing the response cover...',
	'🎧 Alan Parsons is engineering the perfect mix...',
	'📼 The tape is spinning: recording your answer...',
	'💡 The lunatic is in the hall: having a breakthrough idea...',
	'🌙 Keep talking: the conversation continues...',
	'⚡ Coming back to life: resurrecting the perfect response...',

	// Short & Punchy
	'🌙 Thinking on the dark side...',
	'🧱 Building another brick...',
	'💎 Shining on...',
	'⏰ Ticking away...',
	'🐑 Herding the bits...',
	'🌈 Painting colors...',
	'🔥 Burning bright...',
	'🚀 Interstellar processing...',
	'🎸 Sustain note: holding the thought...',
	'🌊 Echoes: response in progress...',
	'⚡ Flashback: retrieving the answer...',
	'🌟 Astronomy: calculating celestial solutions...',
];

// ============================================================================
// MESSAGE → SPINNER MAPPING
// ============================================================================

export const floydSpinnerMapping: Record<string, keyof typeof cliSpinners | keyof typeof customFloydSpinners> = {
	// Dark Side of the Moon
	'🌙 Painting brilliant colors on the dark side of the moon...': 'moon',
	'⏰ Time is ticking away, waiting for the answer to emerge...': 'clock',
	'💰 Money: it\'s a gas, processing your request...': 'bounce',
	'🎵 Listening to the great gig in the sky, gathering thoughts...': 'star',
	'⚡ Us and them: finding the middle ground in your code...': 'toggle',
	'🧠 Brain damage: the lunatic is on the grass, computing...': 'dots',
	'🌈 Breathe, breathe in the air... processing deeply...': 'growVertical',
	'🔊 On the run: chasing down the solution...': 'runner',

	// Wish You Were Here
	'🎸 Wish you were here... but the model\'s still thinking...': 'earth',
	'🔥 Welcome to the machine: computing your request...': 'material',
	'🌊 Have a cigar: rolling the solution into shape...': 'balloon',
	'💎 Shine on you crazy diamond: polishing the response...': 'star2',
	'🌧️ Wading through the waters of ambiguity...': 'weather',
	'🔥 Burning through the complexity, just like the sun...': 'orangePulse',

	// The Wall
	'🧱 Another brick in the wall: building your solution layer by layer...': 'layer',
	'😮 Comfortably numb: waiting for the feeling to return...': 'mindblown',
	'🎻 Hey you: out there in the cold, getting an answer...': 'shark',
	'👶 Is there anybody out there? Checking the data stream...': 'pong',
	'🎸 Run like hell: racing through the possibilities...': 'arrow2',
	'🌙 Goodbye blue sky: clearing the fog of uncertainty...': 'weather',
	'🏠 Empty spaces: filling in the blanks...': 'boxBounce',
	'🎵 Young lust: eager to respond, just processing...': 'hearts',

	// Animals
	'🐷 Pigs on the wing: flying through the data...': 'aesthetic',
	'🐑 Sheep: safely herding the bits and bytes...': 'dots12',
	'🐕 Dogs: guarding against errors in the response...': 'toggle3',

	// Atom Heart Mother
	'🎺 Atom heart mother: synthesize-ing the solution...': 'betaWave',
	'🌬️ If: contemplating the possibilities...': 'arc',
	'🌻 Summer \'68: grooving through the computation...': 'floydFlower',
	'🎵 Fat old sun: warming up the algorithm...': 'floydSun',

	// Meddle & Obscured
	'🌊 One of these days: getting to the answer...': 'floydWave',
	'🔁 Echoes: bouncing ideas off the digital canyon...': 'bouncingBall',
	'🎹 Fearless: boldly computing where no code has computed before...': 'arrow',
	'☁️ Obscured by clouds: clearing up the confusion...': 'floydClouds',
	'🌧️ When you\'re in: deep in the thought process...': 'growVertical',
	'🎸 Childhood\'s end: maturing the response...': 'sand',

	// Piper at the Gates of Dawn
	'🌟 Astronomy domine: calculating celestial solutions...': 'star',
	'🔥 Lucifer sam: prowling through the codebase...': 'shark',
	'🚀 Interstellar overdrive: engaging faster-than-light processing...': 'floydRocket',
	'👁️ See emily play: envisioning the perfect response...': 'floydEye',
	'🐁 Matilda mother: nurturing the solution...': 'dots2',
	'🌙 Flaming: setting ideas ablaze...': 'floydFire',
	'🚂 Bike: riding through the data landscape...': 'floydBike',

	// Saucerful of Secrets
	'🛸 Set the controls for the heart of the sun: navigating deep space...': 'floydSaucer',
	'🌀 Let there be more light: illuminating the answer...': 'floydLight',
	'💀 Corporal clegg: marching towards the solution...': 'line',
	'🎵 Careful with that axe, Eugene: handling delicate operations...': 'hamburger',
	'🌊 Several species: complex synthesis in progress...': 'noise',
	'🌑 The narrow way: finding the path through...': 'pipe',
	'🎸 Sysyphus: rolling the boulder of knowledge uphill...': 'bouncingBar',

	// General Vibes
	'🎸 In the studio: mixing the perfect response...': 'speaker',
	'🎧 Roger Waters is reviewing your request...': 'fistBump',
	'🎹 David Gilmour is carefully crafting the solo...': 'fingerDance',
	'🎵 Rick Wright is adding the atmospheric layers...': 'aesthetic',
	'🥁 Nick Mason is keeping the perfect rhythm...': 'point',
	'🔺 Syd Barrett is seeing something you\'re not...': 'floydRainbow',
	'🎨 Storm Thorgerson is designing the response cover...': 'squareCorners',
	'🎧 Alan Parsons is engineering the perfect mix...': 'orangeBluePulse',
	'📼 The tape is spinning: recording your answer...': 'toggle13',
	'💡 The lunatic is in the hall: having a breakthrough idea...': 'toggle7',
	'🌙 Keep talking: the conversation continues...': 'dqpb',
	'⚡ Coming back to life: resurrecting the perfect response...': 'christmas',

	// Short & Punchy (fallbacks)
	'🌙 Thinking on the dark side...': 'dots',
	'🧱 Building another brick...': 'growHorizontal',
	'💎 Shining on...': 'star',
	'⏰ Ticking away...': 'timeTravel',
	'🐑 Herding the bits...': 'dots8Bit',
	'🌈 Painting colors...': 'floydPrism',
	'🔥 Burning bright...': 'grenade',
	'🚀 Interstellar processing...': 'arc',
	'🎸 Sustain note: holding the thought...': 'toggle2',
	'🌊 Echoes: response in progress...': 'circle',
	'⚡ Flashback: retrieving the answer...': 'flip',
	'🌟 Astronomy: calculating celestial solutions...': 'circleQuarters',
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get a random Pink Floyd thinking message
 */
export function getRandomFloydMessage(): string {
	const index = Math.floor(Math.random() * floydThinkingMessages.length);
	return floydThinkingMessages[index];
}

/**
 * Get appropriate spinner for a given message
 * @param message - The thinking message
 * @returns Spinner config (interval + frames)
 */
export function getSpinnerForMessage(message: string): {
	interval: number;
	frames: string[];
} {
	const spinnerKey = floydSpinnerMapping[message];

	if (spinnerKey && spinnerKey in cliSpinners) {
		const spinner = (cliSpinners as unknown as Record<string, {interval: number; frames: string[]}>)[spinnerKey];
		if (spinner) return spinner;
	}

	if (spinnerKey && spinnerKey in customFloydSpinners) {
		const spinner = customFloydSpinners[spinnerKey as keyof typeof customFloydSpinners];
		if (spinner) return spinner;
	}

	// Fallback to default dots spinner
	return cliSpinners.dots;
}

/**
 * Get random message + spinner combo
 */
export function getRandomFloydSpinner(): {
	message: string;
	spinner: {interval: number; frames: string[]};
} {
	const message = getRandomFloydMessage();
	const spinner = getSpinnerForMessage(message);
	return {message, spinner};
}

/**
 * Get all available spinners (built-in + custom)
 */
export function getAllSpinners() {
	return {
		...cliSpinners,
		...customFloydSpinners,
	};
}

// ============================================================================
// TYPES
// ============================================================================

export type FloydSpinnerKey = keyof typeof floydSpinnerMapping;
export type FloydMessage = typeof floydThinkingMessages[number];

---

## ARCHITECTURE SUMMARY

### Data Flow: How a User Keystroke Becomes Terminal Output

```
1. INPUT PHASE (cli.ts)
   User types "What files in src?" → readline captures input
   
2. AGENT EXECUTION (execution-engine.ts)
   FloydAgentEngine.execute(userMessage)
   ├─ Add to conversation history
   └─ Start agentic loop (up to maxTurns)

3. LLM API CALL (glm-client.ts)
   GLMClient.streamChat({
     messages: conversationHistory,
     tools: allToolDefinitions
   })
   ├─ POST to https://api.z.ai/api/anthropic/chat/completions
   └─ Parse SSE stream

4. STREAM PROCESSING (stream-handler.ts)
   for await (event of stream) {
     if (event.type === 'token') → StreamingDisplay.appendToken()
     if (event.type === 'tool_use') → PermissionManager → ToolRegistry.execute()
   }

5. TOOL EXECUTION (tools/)
   Example: search_files tool
   ├─ Input validated via Zod schema
   ├─ Permission check (if needed)
   ├─ globby(['src/**/*']) → file list
   └─ Result added to conversation as "tool" message

6. OUTPUT RENDERING (rendering.ts)
   ├─ During streaming: log-update(buffer) for in-place display
   └─ On completion: logUpdate.done() + console.log(final)
```

### Key Architectural Patterns

1. **Singleton UI Components**: `FloydTerminal.getInstance()`, `StreamingDisplay.getInstance()`
2. **Central Tool Registry**: All tools registered at startup in `toolRegistry` Map
3. **Permission Middleware**: Tools declare permission level, `PermissionManager` handles prompts
4. **Event-Driven Streaming**: `EventEmitter` for stream events, callbacks for UI updates
5. **Zod Validation**: All tool inputs validated before execution via `inputSchema.parse()`
6. **Turn-Limited Agent Loop**: Prevents infinite loops, defaults to 20 turns
7. **CRUSH Branding**: Pink Floyd themed spinners, ASCII logo, terminal styling

### Tool System Architecture

```
ToolRegistry (tool-registry.ts)
    │
    ├── register() → Map<string, ToolDefinition>
    ├── execute(name, input, options) → Zod validate → Permission check → Tool.execute()
    └── toAPIDefinitions() → JSON schema for LLM

Tool Categories:
    ├── file/ → fs-extra for file operations
    ├── search/ → globby for codebase search
    ├── build/ → Project detection + execa for build tools
    ├── git/ → simple-git wrapper
    ├── browser/ → WebSocket client for FloydChrome extension
    ├── cache/ → 3-tier SUPERCACHE (reasoning/project/vault)
    ├── patch/ → parse-diff + diff for patch operations
    └── system/ → execa for shell commands
```

### Configuration Flow

```
.env file → dotenvConfig() → process.env
    ↓
loadConfig() → Zod schema validation
    ↓
FloydConfig object → GLMClient + FloydAgentEngine
```

### Error Handling Strategy

- `FloydError` base class with code, message, details
- Specialized errors: `GLMAPIError`, `ToolExecutionError`, `PermissionDeniedError`, etc.
- Retry logic in `GLMClient` with exponential backoff
- Stream errors yield error events instead of throwing
- `formatError()` for user-friendly display

### Dependency Diagram

```
cli.ts
  ├─→ agent/execution-engine.ts
  │     ├─→ llm/glm-client.ts
  │     ├─→ streaming/stream-handler.ts
  │     ├─→ tools/index.ts (toolRegistry)
  │     └─→ permissions/permission-manager.ts
  ├─→ ui/terminal.ts
  ├─→ ui/rendering.ts
  └─→ utils/config.ts
```

