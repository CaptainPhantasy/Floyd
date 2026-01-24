#  ***~Floyd Wrapper - Production Implementation Plan~***

 **From Zero to Human Testing Phase**

 **Status:** Planning Phase
 **Created:** 2026-01-22
 **Objective:** Build production-ready Floyd Wrapper CLI with GLM-4.7 backend

 ---
 **Executive Summary**

 Build a Claude Code-parity CLI tool called **Floyd** that:
- Uses GLM-4.7 LLM backend (~10x cost savings vs Claude)
- Implements 55 tools across 8 categories
- Features agentic "run until completion" execution loop
- Provides real-time streaming UI via console output
- Includes SUPERCACHE (3-tier caching system)
- Follows CRUSH design philosophy (company branding)
- Reaches human-ready testing phase with zero blockers

 ---
 **Critical Success Factors**

1. **Follow Claude Code's proven architecture** - Direct console output, not Ink/React
2. **Every module/function must be tested** before moving to next phase
3. **Quality gates at each phase** - No shortcuts to testing
4. **GLM-4.7 streaming must be robust** - Handle edge cases properly
5. **Permission system prevents disasters** - Dangerous tools locked
6. **SUPERCACHE reduces costs** - 3-tier caching actually used
7. **Simplicity over sophistication** - Proven patterns > novel experimentation

 ---
 **Why Option A (Console Output) is Better**

 **What's Proven**

 Claude Code uses direct console output with these libraries:
- **chalk** - Colors
- **ora** - Spinners
- **log-update** - In-place rendering
- **inquirer** - Prompts
- **cli-table3** - Tables

 This approach is:
- ✅ **Proven at scale** (used by Anthropic's Claude Code)
- ✅ **Stable** (no re-rendering, no component tree)
- ✅ **Simple** (direct console.log calls)
- ✅ **Fast** (no virtual DOM overhead)
- ✅ **Debuggable** (simple console.log debugging)

 **What Changed in the Plan**

 **Removed:**
- ❌ Ink, React, react-reconciler (~200KB of dependencies)
- ❌ Component hierarchy (App → Component → Component)
- ❌ React hooks, state management complexity
- ❌ Re-render optimization (memo, useCallback, useMemo)
- ❌ Virtual DOM reconciliation

 **Added:**
- ✅ log-update for in-place rendering
- ✅ ora for spinners (simple, proven)
- ✅ meow for CLI framework
- ✅ inquirer for prompts
- ✅ cli-table3 for tables
- ✅ Direct console output (simple, direct)

 **50% Less Code, Same Features**

 **Old (Ink approach):**
 src/ui/
 ├── components/
 │   ├── App.tsx (150 lines)
 │   ├── StreamingResponse.tsx (80 lines)
 │   ├── ConversationView.tsx (60 lines)
 │   ├── InputArea.tsx (50 lines)
 │   └── ToolIndicator.tsx (40 lines)
 ├── theme/
 │   └── crush-theme.ts (100 lines)
 Total: ~500 lines of React/Ink code

 **New (Console approach):**
 src/ui/
 ├── cli.ts (100 lines)
 ├── terminal.ts (150 lines)
 ├── rendering.ts (80 lines)
 └── history.ts (60 lines)
 Total: ~390 lines, simpler architecture

 **Streaming: How It Works (No Scroll Spam)**

 **Problem:** How to stream tokens without printing each token on a new line?

 **Solution:** log-update library

 import update from 'log-update';

 // Create in-place updater
 const update = update('Floyd: ');

 // On each token (updates SAME line):
 update(`Floyd: ${responseSoFar}`);

 // On complete:
 update('Floyd: '); // Clear line
 console.log(); // Print final newline

 **Result:** Smooth streaming, no scroll spam, proven approach.

 ---
 **Phase 0: Pre-Implementation (Planning & Setup)**

 **Objective**

 Ensure all prerequisites, documentation, and project foundations are in place before writing code.

 **Checklist**

 **0.1 Documentation Review**

- All stakeholders have reviewed PROJECT_OUTLINE.md
- All stakeholders have reviewed floyddstools.md (55 tool specs)
- All stakeholders have reviewed FLOYD_ADAPTATION_GUIDE.md
- GLM-4.7 API access confirmed (api.z.ai endpoint)
- Company branding (CRUSH theme) approved
- Success criteria validated

 **0.2 Environment Preparation**

- Node.js 20+ installed and verified
- npm 10+ or pnpm 8+ installed
- Git repository initialized at /Volumes/Storage/WRAPPERS/FLOYD WRAPPER
- GLM-4.7 API key acquired and stored securely
- TypeScript 5.0+ toolchain ready
- Test environment (macOS/Linux) confirmed

 **0.3 Dependency Verification**

- All npm packages available and version-locked
- No deprecated dependencies in planned stack
- License compatibility verified
- Security scan of planned dependencies

 **Exit Criteria**

- ✅ All documentation reviewed and approved
- ✅ Development environment functional
- ✅ API access confirmed
- ✅ No blockers identified

 **Estimated Duration**

 1-2 days

 ---
 **Phase 1: Foundation (Week 1)**

 **Objective**

 Build rock-solid project infrastructure with clean architecture. NO short-term hacks.

 **1.1 Project Scaffolding**

 **1.1.1 Initialize Project Structure**

 floyd-wrapper/
 ├── package.json
 ├── tsconfig.json
 ├── .npmrc
 ├── .gitignore
 ├── .env.example
 ├── README.md
 ├── LICENSE
 ├── src/
 │   ├── cli.ts                  # Entry point (NOT .tsx - using console output)
 │   ├── types.ts                # Shared TypeScript interfaces
 │   ├── constants.ts            # CRUSH theme, branding
 │   ├── index.ts                # Main export
 │   │
 │   ├── agent/
 │   │   ├── execution-engine.ts # Agentic loop
 │   │   └── types.ts
 │   │
 │   ├── tools/
 │   │   ├── tool-registry.ts    # Tool registration and execution
 │   │   ├── index.ts            # Tool exports and registration
 │   │   │
 │   │   ├── file/               # File operations (4 tools)
 │   │   ├── search/             # Code search (8 tools)
 │   │   ├── build/              # Build & test (6 tools)
 │   │   ├── git/                # Git operations (8 tools)
 │   │   ├── browser/            # Browser automation (9 tools)
 │   │   ├── cache/              # SUPERCACHE (11 tools)
 │   │   ├── patch/              # Patch operations (5 tools)
 │   │   └── special/            # Special tools (7 tools)
 │   │
 │   ├── streaming/
 │   │   ├── stream-handler.ts   # Stream processing
 │   │   └── types.ts
 │   │
 │   ├── permissions/
 │   │   ├── permission-manager.ts
 │   │   └── tool-policy.ts
 │   │
 │   ├── cache/
 │   │   ├── supercache.ts       # 3-tier cache implementation
 │   │   └── integration.ts      # Cache wrapper for tools
 │   │
 │   ├── llm/
 │   │   ├── glm-client.ts       # GLM-4.7 API client
 │   │   └── types.ts
 │   │
 │   ├── ui/                     # Console-based UI (NO React/Ink)
 │   │   ├── terminal.ts         # Terminal interface (like Claude Code)
 │   │   ├── formatters.ts       # Output formatting
 │   │   └── rendering.ts        # Smart rendering with log-update
 │   │
 │   ├── branding/
 │   │   └── company-branding.ts # CRUSH colors, logo
 │   │
 │   ├── prompts/
 │   │   ├── system/
 │   │   ├── tools/
 │   │   ├── agents/
 │   │   └── reminders/
 │   │
 │   └── utils/
 │       ├── config.ts           # Config loader with Zod
 │       ├── logger.ts           # Color-coded logging
 │       └── errors.ts           # Custom error classes
 │
 ├── tests/
 │   ├── unit/                   # Unit tests (>80% coverage)
 │   ├── integration/            # Integration tests
 │   └── fixtures/               # Test data
 │
 ├── docs/
 │   ├── API.md                  # API documentation
 │   ├── TOOLS.md                # Tool reference (55 tools)
 │   └── CONFIGURATION.md        # Configuration guide
 │
 └── prompts/                    # System prompts
     ├── system/
     ├── tools/
     ├── agents/
     └── reminders/

 **Tasks:**
- Run npm init -y with proper metadata
- Create package.json with all dependencies (see below)
- Create tsconfig.json with strict mode enabled
- Create .gitignore (node_modules, .env, dist, .floyd)
- Create .env.example with all required variables
- Create README.md with quick start guide
- Initialize git repository
- Create MIT/Apache LICENSE file

 **1.1.2 Package.json Configuration**

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
     "build": "tsc && tsc-alias",
     "start": "node dist/cli.js",
     "test": "npm run test:unit && npm run test:integration",
     "test:unit": "ava tests/unit/**/*.test.ts",
     "test:integration": "ava tests/integration/**/*.test.ts",
     "test:coverage": "c8 npm test",
     "lint": "eslint src --ext .ts",
     "format": "prettier --write \"src/**/*.ts\"",
     "typecheck": "tsc --noEmit",
     "clean": "rm -rf dist .floyd",
     "precommit": "npm run typecheck && npm run lint"
   },
   "dependencies": {
     "@anthropic-ai/sdk": "^0.71.2",
     "chalk": "^5.3.0",
     "ora": "^8.0.1",
     "cli-spinners": "^2.9.2",
     "ink-terminal": "^1.0.0",
     "log-update": "^6.0.0",
     "terminal-link": "^3.0.0",
     "cli-table3": "^0.6.3",
     "inquirer": "^9.2.11",
     "meow": "^12.1.0",
     "zod": "^3.22.4",
     "execa": "^8.0.1",
     "fs-extra": "^11.2.0",
     "globby": "^14.0.0",
     "p-queue": "^8.0.1",
     "p-timeout": "^6.1.2",
     "signal-exit": "^4.1.0"
   },
   "devDependencies": {
     "@types/node": "^20.11.0",
     "@types/inquirer": "^9.0.6",
     "@types/ora": "^4.0.0",
     "@types/cli-table3": "^0.6.3",
     "typescript": "^5.3.3",
     "tsx": "^4.7.0",
     "ava": "^6.1.0",
     "c8": "^9.0.0",
     "tsc-alias": "^1.8.8",
     "prettier": "^3.2.4",
     "eslint": "^8.56.0",
     "@typescript-eslint/eslint-plugin": "^6.19.0",
     "@typescript-eslint/parser": "^6.19.0"
   },
   "engines": {
     "node": ">=20.0.0",
     "npm": ">=10.0.0"
   },
   "keywords": ["ai", "cli", "developer-tools", "glm", "agent"],
   "author": "CURSEM <dev@cursem.com>",
   "license": "MIT"
 }

 **Key Changes from Original Plan:**
- ❌ **Removed:** ink, react, react-reconciler (not using Ink/React)
- ✅ **Added:** ora, cli-spinners (spinners for progress)
- ✅ **Added:** ink-terminal, log-update (smart terminal rendering)
- ✅ **Added:** cli-table3 (formatted tables)
- ✅ **Added:** inquirer (prompts)
- ✅ **Added:** meow (CLI framework)

 **Tasks:**
- Create package.json with exact versions above
- Verify all dependencies are installable
- Run npm install successfully
- Verify no peer dependency warnings
- Verify no security vulnerabilities (npm audit)

 **1.1.3 TypeScript Configuration**

 // tsconfig.json
 {
   "compilerOptions": {
     "target": "ES2022",
     "module": "ESNext",
     "moduleResolution": "node",
     "lib": ["ES2022"],
     "outDir": "./dist",
     "rootDir": "./src",
     "strict": true,
     "esModuleInterop": true,
     "skipLibCheck": true,
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
     "baseUrl": ".",
     "paths": {
       "@/*": ["src/*"],
       "@/types": ["src/types"],
       "@/constants": ["src/constants"],
       "@/utils": ["src/utils"]
     }
   },
   "include": ["src/**/*"],
   "exclude": ["node_modules", "dist", "tests"]
 }

 **Tasks:**
- Create tsconfig.json with strict mode
- Verify npx tsc --noEmit runs without errors
- Test path aliases work correctly

 **1.2 Core Type System**

 **1.2.1 Define Shared Types**

 **File:** src/types.ts

 // Core types for the entire application
 export interface FloydMessage {
   role: 'user' | 'assistant' | 'system' | 'tool';
   content: string;
   timestamp: number;
   toolUseId?: string;
   toolName?: string;
   toolInput?: Record<string, unknown>;
 }

 export interface ToolDefinition {
   name: string;
   description: string;
   category: ToolCategory;
   inputSchema: z.ZodTypeAny;
   permission: 'none' | 'moderate' | 'dangerous';
   execute: (input: unknown) => Promise<ToolResult>;
 }

 export type ToolCategory =
   | 'file'
   | 'search'
   | 'build'
   | 'git'
   | 'browser'
   | 'cache'
   | 'patch'
   | 'special';

 export interface ToolResult<T = unknown> {
   success: boolean;
   data?: T;
   error?: {
     code: string;
     message: string;
     details?: unknown;
   };
 }

 export interface StreamEvent {
   type: 'token' | 'tool_use' | 'tool_result' | 'error' | 'done';
   content: string;
   toolUse?: {
     id: string;
     name: string;
     input: Record<string, unknown>;
   };
   error?: string;
 }

 export interface ConversationHistory {
   messages: FloydMessage[];
   turnCount: number;
   tokenCount: number;
 }

 export interface FloydConfig {
   glmApiKey: string;
   glmApiEndpoint: string;
   glmModel: string;
   maxTokens: number;
   temperature: number;
   logLevel: 'debug' | 'info' | 'warn' | 'error';
   cacheEnabled: boolean;
   permissionLevel: 'auto' | 'ask' | 'deny';
 }

 **Tasks:**
- Create src/types.ts with all core types
- Export all types as barrel export (src/types/index.ts)
- Add JSDoc comments for all types
- Verify no any types (use unknown where needed)

 **1.2.2 Create Constants and Branding**

 **File:** src/constants.ts

 import { COMPANY_BRANDING } from './branding/company-branding';

 export const FLOYD_VERSION = '0.1.0';
 export const FLOYD_NAME = 'Floyd';
 export const FLOYD_FULL_NAME = 'File-Logged Orchestrator Yielding Deliverables';

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

 export const CACHE_TIERS = {
   reasoning: 5 * 60 * 1000,      // 5 minutes
   project: 24 * 60 * 60 * 1000,  // 24 hours
   vault: 7 * 24 * 60 * 60 * 1000, // 7 days
 } as const;

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

 export const PERMISSION_LEVELS = ['none', 'moderate', 'dangerous'] as const;

 export const CRUSH_THEME = COMPANY_BRANDING;

 export const ASCII_LOGO = `
 #    __/\\\\\\\\\\\\\\\___/\\\____________________/\\\\\________/\\\________/\\\___/\\\\\\\\\\\\_______________
 #     _\/\\\///////////___\/\\\__________________/\\\///\\\_____\///\\\____/\\\/___\/\\\////////\\\_____________
 #      _\/\\\______________\/\\\________________/\\\/__\///\\\_____\///\\\/\\\/_____\/\\\______\//\\\____________
 #       _\/\\\\\\\\\\\______\/\\\_______________/\\\______\//\\\______\///\\\/_______\/\\\_______\/\\\____________
 #        _\/\\\///////_______\/\\\______________\/\\\_______\/\\\________\/\\\________\/\\\_______\/\\\____________
 #         _\/\\\______________\/\\\______________\//\\\______/\\\_________\/\\\________\/\\\_______\/\\\____________
 #          _\/\\\______________\/\\\_______________\///\\\__/\\\___________\/\\\________\/\\\_______/\\\_____________
 #           _\/\\\______________\/\\\\\\\\\\\\\\\_____\///\\\\\/____________\/\\\________\/\\\\\\\\\\\\/______________
 #            _\///_______________\///////////////________\/////______________\///_________\////////////________________
 `;

 export const SYSTEM_PROMPTS = {
   MAIN: buildMainSystemPrompt(),
   EXPLORE: buildExploreSystemPrompt(),
   PLAN: buildPlanSystemPrompt(),
 } as const;

 **Tasks:**
- Create src/branding/company-branding.ts with CRUSH colors
- Create src/constants.ts with all constants
- Create ASCII logo constant from FLOYDASCII.txt
- Create system prompt builder functions

 **1.3 Error Handling Foundation**

 **1.3.1 Custom Error Classes**

 **File:** src/utils/errors.ts

 export class FloydError extends Error {
   constructor(
     message: string,
     public code: string,
     public details?: unknown
   ) {
     super(message);
     this.name = 'FloydError';
   }
 }

 export class ToolExecutionError extends FloydError {
   constructor(toolName: string, message: string, details?: unknown) {
     super(message, `TOOL_EXECUTION_FAILED`, { toolName, ...details });
     this.name = 'ToolExecutionError';
   }
 }

 export class GLMAPIError extends FloydError {
   constructor(message: string, public statusCode?: number, details?: unknown) {
     super(message, 'GLM_API_ERROR', details);
     this.name = 'GLMAPIError';
   }
 }

 export class PermissionDeniedError extends FloydError {
   constructor(toolName: string, reason: string) {
     super(`Permission denied for ${toolName}: ${reason}`, 'PERMISSION_DENIED', { toolName });
     this.name = 'PermissionDeniedError';
   }
 }

 export class StreamError extends FloydError {
   constructor(message: string, details?: unknown) {
     super(message, 'STREAM_ERROR', details);
     this.name = 'StreamError';
   }
 }

 // Error recovery strategies
 export function isRecoverableError(error: Error): boolean {
   return (
     error instanceof GLMAPIError && error.statusCode !== 401
   );
 }

 export function shouldRetry(error: Error): boolean {
   if (error instanceof GLMAPIError) {
     return [429, 500, 502, 503, 504].includes(error.statusCode || 0);
   }
   return false;
 }

 **Tasks:**
- Create src/utils/errors.ts with custom error classes
- Add error type guards
- Add error recovery utilities
- Write unit tests for all error types

 **1.3.2 Logger Implementation**

 **File:** src/utils/logger.ts

 import chalk from 'chalk';

 type LogLevel = 'debug' | 'info' | 'warn' | 'error';

 export class FloydLogger {
   constructor(private level: LogLevel = 'info') {}

   private shouldLog(level: LogLevel): boolean {
     const levels = ['debug', 'info', 'warn', 'error'];
     return levels.indexOf(level) >= levels.indexOf(this.level);
   }

   debug(message: string, ...args: unknown[]) {
     if (this.shouldLog('debug')) {
       console.error(chalk.gray('[DEBUG]'), message, ...args);
     }
   }

   info(message: string, ...args: unknown[]) {
     if (this.shouldLog('info')) {
       console.error(chalk.blue('[INFO]'), message, ...args);
     }
   }

   warn(message: string, ...args: unknown[]) {
     if (this.shouldLog('warn')) {
       console.error(chalk.yellow('[WARN]'), message, ...args);
     }
   }

   error(message: string, error?: Error) {
     if (this.shouldLog('error')) {
       console.error(chalk.red('[ERROR]'), message);
       if (error?.stack) {
         console.error(chalk.gray(error.stack));
       }
     }
   }

   tool(toolName: string, input: unknown, output: unknown) {
     if (this.shouldLog('debug')) {
       console.error(chalk.cyan('[TOOL]'), toolName);
       console.error(chalk.gray('  Input:'), JSON.stringify(input, null, 2));
       console.error(chalk.gray('  Output:'), JSON.stringify(output, null, 2));
     }
   }
 }

 export const logger = new FloydLogger();

 **Tasks:**
- Create src/utils/logger.ts with color-coded logging
- Add log level filtering
- Add tool execution logging
- Test all log levels work correctly

 **1.4 Configuration Management**

 **1.4.1 Config Loader**

 **File:** src/utils/config.ts

 import fs from 'fs-extra';
 import path from 'path';
 import { z } from 'zod';
 import type { FloydConfig } from '@/types';

 const configSchema = z.object({
   glmApiKey: z.string().min(1),
   glmApiEndpoint: z.string().url().default('https://api.z.ai/api/anthropic'),
   glmModel: z.string().default('glm-4.7'),
   maxTokens: z.number().int().positive().default(100000),
   temperature: z.number().min(0).max(2).default(0.7),
   logLevel: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
   cacheEnabled: z.boolean().default(true),
   permissionLevel: z.enum(['auto', 'ask', 'deny']).default('ask'),
 });

 export async function loadConfig(): Promise<FloydConfig> {
   // Priority: env vars > .env file > defaults
   const envVars = {
     glmApiKey: process.env.FLOYD_GLM_API_KEY || process.env.GLM_API_KEY,
     glmApiEndpoint: process.env.FLOYD_GLM_ENDPOINT || process.env.GLM_API_ENDPOINT,
     glmModel: process.env.FLOYD_GLM_MODEL || process.env.GLM_MODEL,
     maxTokens: process.env.FLOYD_MAX_TOKENS,
     temperature: process.env.FLOYD_TEMPERATURE,
     logLevel: process.env.FLOYD_LOG_LEVEL,
     cacheEnabled: process.env.FLOYD_CACHE_ENABLED,
     permissionLevel: process.env.FLOYD_PERMISSION_LEVEL,
   };

   // Clean undefined values
   const cleanVars = Object.fromEntries(
     Object.entries(envVars).filter(([_, v]) => v !== undefined)
   );

   // Parse env vars
   const parsed: Record<string, unknown> = {};
   for (const [key, value] of Object.entries(cleanVars)) {
     if (key === 'maxTokens') parsed[key] = parseInt(value as string, 10);
     else if (key === 'temperature') parsed[key] = parseFloat(value as string);
     else if (key === 'cacheEnabled') parsed[key] = value === 'true';
     else parsed[key] = value;
   }

   // Validate
   try {
     return configSchema.parse(parsed);
   } catch (error) {
     throw new Error(`Invalid configuration: ${error}`);
   }
 }

 export async function loadProjectContext(projectRoot: string): Promise<string | null> {
   const configPaths = [
     path.join(projectRoot, 'FLOYD.md'),
     path.join(projectRoot, 'AGENTS.md'),
     path.join(projectRoot, '.floyd', 'config.md'),
   ];

   for (const configPath of configPaths) {
     if (await fs.pathExists(configPath)) {
       return await fs.readFile(configPath, 'utf-8');
     }
   }

   return null;
 }

 **Tasks:**
- Create src/utils/config.ts with Zod validation
- Support .env file loading
- Support environment variable overrides
- Add config validation tests
- Test missing API key error handling

 **Exit Criteria for Phase 1**

- ✅ Project installs without errors (npm install)
- ✅ TypeScript compiles without errors (npm run typecheck)
- ✅ All type definitions are complete
- ✅ Logger outputs correctly at all levels
- ✅ Config loader validates and loads configuration
- ✅ Error classes are tested
- ✅ README has quick start instructions
- ✅ No TypeScript any types in codebase

 ---
 **Phase 2: Tool Registry & Core Tools (Week 2)**

 **Objective**

 Implement the Tool Registry system and 10 core tools with full testing.

 **2.1 Tool Registry Architecture**

 **2.1.1 Tool Registry Interface**

 **File:** src/tools/tool-registry.ts

 import { z } from 'zod';
 import type { ToolDefinition, ToolResult, ToolCategory } from '@/types';
 import { logger } from '@/utils/logger';
 import { ToolExecutionError, PermissionDeniedError } from '@/utils/errors';

 export class ToolRegistry {
   private tools = new Map<string, ToolDefinition>();
   private toolsByCategory = new Map<string, Set<string>>();

   register(tool: ToolDefinition): void {
     if (this.tools.has(tool.name)) {
       throw new Error(`Tool ${tool.name} already registered`);
     }

     this.tools.set(tool.name, tool);

     if (!this.toolsByCategory.has(tool.category)) {
       this.toolsByCategory.set(tool.category, new Set());
     }
     this.toolsByCategory.get(tool.category)!.add(tool.name);

     logger.debug(`Registered tool: ${tool.name} (${tool.category})`);
   }

   async execute(
     name: string,
     input: unknown,
     options: { permissionLevel?: 'auto' | 'ask' | 'deny' } = {}
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

     // Permission check
     if (tool.permission === 'dangerous' && options.permissionLevel === 'deny') {
       throw new PermissionDeniedError(name, 'Dangerous tools require confirmation');
     }

     // Input validation
     try {
       input = tool.inputSchema.parse(input);
     } catch (error) {
       return {
         success: false,
         error: {
           code: 'INVALID_INPUT',
           message: `Invalid input for tool "${name}": ${error}`,
         },
       };
     }

     // Execution
     const startTime = Date.now();
     logger.tool(name, input);

     try {
       const result = await tool.execute(input);
       const duration = Date.now() - startTime;
       logger.debug(`Tool ${name} completed in ${duration}ms`);

       return result;
     } catch (error) {
       const duration = Date.now() - startTime;
       logger.error(`Tool ${name} failed after ${duration}ms`, error as Error);
       throw new ToolExecutionError(name, (error as Error).message, error);
     }
   }

   getTool(name: string): ToolDefinition | undefined {
     return this.tools.get(name);
   }

   listTools(category?: ToolCategory): ToolDefinition[] {
     if (category) {
       const toolNames = this.toolsByCategory.get(category) || new Set();
       return Array.from(toolNames)
         .map(name => this.tools.get(name)!)
         .filter(Boolean);
     }

     return Array.from(this.tools.values());
   }

   listCategories(): ToolCategory[] {
     return Array.from(this.toolsByCategory.keys());
   }

   getToolsByPermission(permission: 'none' | 'moderate' | 'dangerous'): ToolDefinition[] {
     return Array.from(this.tools.values()).filter(t => t.permission === permission);
   }
 }

 export const toolRegistry = new ToolRegistry();

 **Tasks:**
- Create ToolRegistry class with full API
- Add permission checking logic
- Add input validation via Zod
- Add tool execution logging
- Write unit tests for all registry methods
- Test error scenarios (missing tool, invalid input, etc.)

 **2.2 Core Tool Implementations**

 **2.2.1 File Operations Tools (4 tools)**

 **Directory:** src/tools/file/

 **Tools to implement:**
1. read_file - Read file contents
2. write - Create/overwrite files
3. edit_file - Search and replace
4. search_replace - Global search/replace

 **Template for each tool:**
 // src/tools/file/read.ts
 import { z } from 'zod';
 import fs from 'fs-extra';
 import path from 'path';
 import type { ToolDefinition } from '@/types';

 const inputSchema = z.object({
   filePath: z.string().min(1),
   offset: z.number().int().min(0).optional(),
   limit: z.number().int().positive().optional(),
 });

 export const readFileTool: ToolDefinition = {
   name: 'read_file',
   description: 'Read file contents from disk. Supports images, PDFs, Jupyter notebooks.',
   category: 'file',
   permission: 'none',
   inputSchema,

   async execute(input) {
     const { filePath, offset = 0, limit } = input as z.infer<typeof inputSchema>;

     const fullPath = path.resolve(filePath);
     if (!(await fs.pathExists(fullPath))) {
       return {
         success: false,
         error: {
           code: 'FILE_NOT_FOUND',
           message: `File not found: ${filePath}`,
         },
       };
     }

     const content = await fs.readFile(fullPath, 'utf-8');
     const lines = content.split('\n');

     let selectedLines = lines.slice(offset);
     if (limit) {
       selectedLines = selectedLines.slice(0, limit);
     }

     return {
       success: true,
       data: {
         filePath,
         content: selectedLines.join('\n'),
         totalLines: lines.length,
         linesRead: selectedLines.length,
       },
     };
   },
 };

 **Tasks:**
- Implement read_file with offset/limit support
- Implement write with backup creation
- Implement edit_file with uniqueness check
- Implement search_replace with replace_all flag
- Add comprehensive unit tests for each
- Add integration tests with actual file operations
- Test error cases (permissions, disk full, etc.)

 **2.2.2 Search Tools (2 tools)**

 **Directory:** src/tools/search/

 **Tools to implement:**
1. grep - Regex search with ripgrep
2. codebase_search - Semantic/concept search

 **Tasks:**
- Implement grep with output modes
- Implement codebase_search with keyword extraction
- Add tests for both tools
- Verify performance on large codebases

 **2.2.3 System Tools (2 tools)**

 **Directory:** src/tools/system/

 **Tools to implement:**
1. run - Execute shell commands
2. ask_user - Prompt user for input

 **Tasks:**
- Implement run with timeout and output capture
- Implement ask_user with validation
- Add tests for command execution
- Test dangerous command blocking

 **2.2.4 Git Tools (2 tools)**

 **Directory:** src/tools/git/

 **Tools to implement:**
1. git_status - Show repository status
2. git_diff - Show changes

 **Tasks:**
- Implement git_status with porcelain format
- Implement git_diff with staged/unstaged
- Add tests in a real git repository
- Test error handling (not a git repo)

 **2.3 Tool Registration**

 **2.3.1 Central Registration Point**

 **File:** src/tools/index.ts

 import { toolRegistry } from './tool-registry';

 // File operations
 import { readFileTool } from './file/read';
 import { writeTool } from './file/write';
 import { editFileTool } from './file/edit';
 import { searchReplaceTool } from './file/search-replace';

 // Search
 import { grepTool } from './search/grep';
 import { codebaseSearchTool } from './search/codebase-search';

 // System
 import { runTool } from './system/run';
 import { askUserTool } from './system/ask-user';

 // Git
 import { gitStatusTool } from './git/status';
 import { gitDiffTool } from './git/diff';

 export function registerCoreTools(): void {
   // File operations
   toolRegistry.register(readFileTool);
   toolRegistry.register(writeTool);
   toolRegistry.register(editFileTool);
   toolRegistry.register(searchReplaceTool);

   // Search
   toolRegistry.register(grepTool);
   toolRegistry.register(codebaseSearchTool);

   // System
   toolRegistry.register(runTool);
   toolRegistry.register(askUserTool);

   // Git
   toolRegistry.register(gitStatusTool);
   toolRegistry.register(gitDiffTool);
 }

 export { toolRegistry };

 **Tasks:**
- Create central registration file
- Verify all 10 tools register correctly
- Test tool listing by category
- Test tool execution through registry

 **Exit Criteria for Phase 2**

- ✅ Tool Registry is fully functional
- ✅ All 10 core tools implemented
- ✅ All tools pass unit tests (>80% coverage)
- ✅ All tools pass integration tests
- ✅ Error handling tested for all tools
- ✅ Permission system tested
- ✅ No tools use any types

 ---
 **Phase 3: GLM-4.7 Client & Streaming (Week 3)**

 **Objective**

 Build robust GLM-4.7 API client with streaming support and error handling.

 **3.1 GLM Client Implementation**

 **3.1.1 Basic GLM Client**

 **File:** src/llm/glm-client.ts

 import type { FloydConfig, FloydMessage, StreamEvent } from '@/types';
 import { logger } from '@/utils/logger';
 import { GLMAPIError, StreamError } from '@/utils/errors';

 interface GLMStreamOptions {
   messages: FloydMessage[];
   tools?: Array<{
     name: string;
     description: string;
     input_schema: Record<string, unknown>;
   }>;
   maxTokens?: number;
   temperature?: number;
   onToken?: (token: string) => void;
   onToolUse?: (toolUse: { id: string; name: string; input: Record<string, unknown> }) => void;
   onError?: (error: Error) => void;
 }

 export class GLMClient {
   constructor(private config: FloydConfig) {}

   async *streamChat(options: GLMStreamOptions): AsyncGenerator<StreamEvent> {
     const {
       messages,
       tools = [],
       maxTokens = this.config.maxTokens,
       temperature = this.config.temperature,
     } = options;

     logger.debug('Starting GLM stream', { messageCount: messages.length, toolCount: tools.length });

     try {
       const response = await fetch(`${this.config.glmApiEndpoint}/v1/messages`, {
         method: 'POST',
         headers: {
           'Content-Type': 'application/json',
           'x-api-key': this.config.glmApiKey,
           'anthropic-version': '2023-06-01',
         },
         body: JSON.stringify({
           model: this.config.glmModel,
           messages: messages.map(m => ({ role: m.role, content: m.content })),
           tools: tools.length > 0 ? tools : undefined,
           max_tokens: maxTokens,
           temperature,
           stream: true,
         }),
       });

       if (!response.ok) {
         throw new GLMAPIError(
           `GLM API returned ${response.status}`,
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

       while (true) {
         const { done, value } = await reader.read();

         if (done) break;

         buffer += decoder.decode(value, { stream: true });
         const lines = buffer.split('\n');
         buffer = lines.pop() || '';

         for (const line of lines) {
           if (!line.trim() || !line.startsWith('data: ')) continue;

           const data = line.slice(6).trim();

           if (data === '[DONE]') {
             yield { type: 'done', content: '' };
             return;
           }

           try {
             const parsed = JSON.parse(data);

             if (parsed.type === 'content_block_delta') {
               const token = parsed.delta?.text || '';
               if (token) {
                 yield { type: 'token', content: token };
                 options.onToken?.(token);
               }
             } else if (parsed.type === 'content_block_stop') {
               // End of content
             } else if (parsed.type === 'tool_use') {
               const toolUse = {
                 id: parsed.id,
                 name: parsed.name,
                 input: parsed.input,
               };
               yield { type: 'tool_use', content: '', toolUse };
               options.onToolUse?.(toolUse);
             } else if (parsed.type === 'error') {
               const error = new GLMAPIError(parsed.error?.message || 'Unknown GLM error');
               yield { type: 'error', content: '', error: error.message };
               options.onError?.(error);
             }
           } catch (parseError) {
             logger.warn('Failed to parse SSE line', { line, error: parseError });
           }
         }
       }

       yield { type: 'done', content: '' };
     } catch (error) {
       logger.error('GLM stream failed', error as Error);
       throw error;
     }
   }
 }

 **Tasks:**
- Implement GLMClient class with streaming
- Add SSE (Server-Sent Events) parsing
- Add token accumulation
- Add tool_use event parsing
- Add error handling and retry logic
- Test streaming with actual GLM-4.7 API
- Test error scenarios (timeout, 500 errors, etc.)

 **3.1.2 GLM Client Tests**

 **File:** tests/llm/glm-client.test.ts

 **Tasks:**
- Mock fetch API for testing
- Test streaming token accumulation
- Test tool_use event parsing
- Test error handling
- Test timeout behavior
- Test malformed SSE handling
- Achieve >80% code coverage

 **3.2 Stream Handler**

 **3.2.1 Stream Handler Implementation**

 **File:** src/streaming/stream-handler.ts

 import type { StreamEvent } from '@/types';
 import { EventEmitter } from 'events';

 export interface StreamCallbacks {
   onToken?: (token: string) => void;
   onToolStart?: (tool: string, input: Record<string, unknown>) => void;
   onToolComplete?: (tool: string, result: unknown) => void;
   onError?: (error: string) => void;
   onDone?: () => void;
 }

 export class StreamHandler extends EventEmitter {
   private buffer = '';
   private toolUseBuffer: Record<string, unknown> | null = null;

   async processStream(
     stream: AsyncIterable<StreamEvent>,
     callbacks: StreamCallbacks
   ): Promise<string> {
     let fullResponse = '';

     for await (const event of stream) {
       switch (event.type) {
         case 'token':
           fullResponse += event.content;
           this.buffer += event.content;
           callbacks.onToken?.(event.content);
           this.emit('token', event.content);
           break;

         case 'tool_use':
           if (event.toolUse) {
             this.toolUseBuffer = event.toolUse;
             callbacks.onToolStart?.(
               event.toolUse.name,
               event.toolUse.input
             );
             this.emit('toolStart', event.toolUse);
           }
           break;

         case 'error':
           callbacks.onError?.(event.error || 'Unknown error');
           this.emit('error', event.error);
           break;

         case 'done':
           callbacks.onDone?.();
           this.emit('done');
           break;
       }
     }

     return fullResponse;
   }

   getCurrentBuffer(): string {
     return this.buffer;
   }

   clearBuffer(): void {
     this.buffer = '';
   }

   getPendingToolUse(): Record<string, unknown> | null {
     return this.toolUseBuffer;
   }
 }

 **Tasks:**
- Implement StreamHandler class
- Add event emission for console UI callbacks
- Add buffer management
- Add tool use tracking
- Write unit tests
- Test with mock streams

 **Exit Criteria for Phase 3**

- ✅ GLM-4.7 API calls work successfully
- ✅ Streaming responses render correctly
- ✅ Tool use events are parsed correctly
- ✅ Error handling works for all failure modes
- ✅ Unit tests >80% coverage
- ✅ Integration test with real API passes

 ---
 **Phase 4: Agentic Execution Engine (Week 4)**

 **Objective**

 Implement the "run until completion" loop that makes Floyd autonomous.

 **4.1 Execution Engine**

 **4.1.1 Core Execution Loop**

 **File:** src/agent/execution-engine.ts

 import type { FloydMessage, FloydConfig, ConversationHistory } from '@/types';
 import { GLMClient } from '@/llm/glm-client';
 import { StreamHandler } from '@/streaming/stream-handler';
 import { toolRegistry } from '@/tools';
 import { logger } from '@/utils/logger';

 export class FloydAgentEngine {
   private history: ConversationHistory = {
     messages: [],
     turnCount: 0,
     tokenCount: 0,
   };

   private glmClient: GLMClient;
   private streamHandler: StreamHandler;
   private maxTurns: number;

   constructor(
     private config: FloydConfig,
     onToken?: (token: string) => void,
     onToolStart?: (tool: string, input: unknown) => void,
     onToolComplete?: (tool: string, result: unknown) => void
   ) {
     this.glmClient = new GLMClient(config);
     this.streamHandler = new StreamHandler();
     this.maxTurns = config.maxTokens || 20;

     // Bind UI callbacks
     if (onToken) {
       this.streamHandler.on('token', onToken);
     }
     if (onToolStart) {
       this.streamHandler.on('toolStart', onToolStart);
     }
     if (onToolComplete) {
       this.streamHandler.on('toolComplete', onToolComplete);
     }
   }

   async execute(userMessage: string): Promise<string> {
     logger.info('Starting execution', { turnCount: this.history.turnCount });

     // Add user message
     this.history.messages.push({
       role: 'user',
       content: userMessage,
       timestamp: Date.now(),
     });

     // Main agentic loop
     while (this.history.turnCount < this.maxTurns) {
       this.history.turnCount++;

       // Call GLM-4.7
       const stream = this.glmClient.streamChat({
         messages: this.history.messages,
         tools: this.buildToolDefinitions(),
       });

       // Process stream
       let assistantMessage = '';
       const toolResults: Array<{ toolUseId: string; result: unknown }> = [];

       await this.streamHandler.processStream(stream, {
         onToken: (token) => {
           assistantMessage += token;
         },
         onToolStart: async (toolName, input) => {
           logger.info('Executing tool', { toolName, input });

           // Execute tool
           const result = await toolRegistry.execute(toolName, input, {
             permissionLevel: this.config.permissionLevel,
           });

           toolResults.push({
             toolUseId: this.streamHandler.getPendingToolUse()?.id as string,
             result,
           });

           onToolComplete?.(toolName, result);
         },
         onError: (error) => {
           logger.error('Stream error', new Error(error));
         },
       });

       // Add assistant message
       this.history.messages.push({
         role: 'assistant',
         content: assistantMessage,
         timestamp: Date.now(),
       });

       // Check if done
       if (toolResults.length === 0) {
         logger.info('No tool use detected - completion');
         break;
       }

       // Add tool results
       for (const { toolUseId, result } of toolResults) {
         this.history.messages.push({
           role: 'tool',
           content: JSON.stringify(result),
           timestamp: Date.now(),
           toolUseId,
         });
       }
     }

     // Return final response
     const lastAssistant = this.history.messages
       .filter(m => m.role === 'assistant')
       .pop();

     return lastAssistant?.content || '';
   }

   private buildToolDefinitions() {
     return toolRegistry.listTools().map(tool => ({
       name: tool.name,
       description: tool.description,
       input_schema: tool.inputSchema as unknown as Record<string, unknown>,
     }));
   }

   getHistory(): ConversationHistory {
     return this.history;
   }

   reset(): void {
     this.history = {
       messages: [],
       turnCount: 0,
       tokenCount: 0,
     };
   }
 }

 **Tasks:**
- Implement FloydAgentEngine class
- Add turn limit checking
- Add completion detection
- Add conversation history management
- Add tool result feeding
- Write comprehensive unit tests
- Write integration test with multi-turn task
- Test infinite loop prevention
- Test tool failure recovery

 **4.2 Permission System Integration**

 **4.2.1 Permission Manager**

 **File:** src/permissions/permission-manager.ts

 import type { ToolDefinition } from '@/types';
 import { toolRegistry } from '@/tools';
 import readline from 'readline';

 export class PermissionManager {
   private autoConfirm = false;

   setAutoConfirm(value: boolean): void {
     this.autoConfirm = value;
   }

   async requestPermission(
     toolName: string,
     input: unknown
   ): Promise<boolean> {
     if (this.autoConfirm) {
       return true;
     }

     const tool = toolRegistry.getTool(toolName);
     if (!tool) {
       return false;
     }

     if (tool.permission === 'none') {
       return true;
     }

     // Display prompt
     const rl = readline.createInterface({
       input: process.stdin,
       output: process.stdout,
     });

     const response = await new Promise<boolean>((resolve) => {
       rl.question(
         `\n${this.formatPrompt(tool, input)}\nAllow? [y/N] `,
         (answer) => {
           rl.close();
           resolve(answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes');
         }
       );
     });

     return response;
   }

   private formatPrompt(tool: ToolDefinition, input: unknown): string {
     const danger = tool.permission === 'dangerous' ? '⚠️  DANGEROUS' : '⚠️  REQUIRES PERMISSION';
     return `${danger}: Execute tool "${tool.name}"?

 ${tool.description}

 Input: ${JSON.stringify(input, null, 2)}`;
   }
 }

 export const permissionManager = new PermissionManager();

 **Tasks:**
- Implement PermissionManager class
- Add CLI prompt for dangerous tools
- Add auto-confirm mode for testing
- Write unit tests
- Test user interaction

 **Exit Criteria for Phase 4**

- ✅ Agentic loop completes multi-step tasks
- ✅ Turn limit prevents infinite loops
- ✅ Tool failures are handled gracefully
- ✅ Permission prompts work correctly
- ✅ Conversation history is maintained
- ✅ Integration test passes (15-turn simulation)

 ---
 **Phase 5: UI Implementation with Console Output (Week 5)**

 **CRITICAL ARCHITECTURAL DECISION:** Following Claude Code's proven approach - direct console output, NOT Ink/React.

 **Why Console Output Instead of Ink?**
 ┌──────────────────┬──────────────────────────────┬────────────────────────────────────────┐
 │      Aspect      │  Console Output (Option A)   │          Ink/React (Option B)          │
 ├──────────────────┼──────────────────────────────┼────────────────────────────────────────┤
 │ **Proven Stability** │ ✅ Claude Code uses it       │ ❌ Current Floyd has jitters           │
 ├──────────────────┼──────────────────────────────┼────────────────────────────────────────┤
 │ **Code Complexity**  │ ~500 lines                   │ ~2,000 lines                           │
 ├──────────────────┼──────────────────────────────┼────────────────────────────────────────┤
 │ **Re-render Issues** │ None (no component tree)     │ Possible (requires careful management) │
 ├──────────────────┼──────────────────────────────┼────────────────────────────────────────┤
 │ **Dependencies**     │ chalk, ora, log-update       │ ink, react, react-reconciler           │
 ├──────────────────┼──────────────────────────────┼────────────────────────────────────────┤
 │ **Debugging**        │ Simple (console.log)         │ Complex (React DevTools)               │
 ├──────────────────┼──────────────────────────────┼────────────────────────────────────────┤
 │ **Streaming**        │ In-place updates (no scroll) │ Requires debouncing                    │
 ├──────────────────┼──────────────────────────────┼────────────────────────────────────────┤
 │ **Learning Curve**   │ Low                          │ Medium                                 │
 └──────────────────┴──────────────────────────────┴────────────────────────────────────────┘
 **Reference:** Claude Code source uses direct console.log() with chalk - proven stable at scale.

 **Objective**

 Build production-grade CLI UI with streaming, proper state management, and CRUSH branding.

 **5.1 Console-Based UI Implementation**

 **5.1.1 Main CLI Entry Point**

 **File:** src/cli.ts

  node
 /**
* Floyd Wrapper CLI - Main Entry Point
  *
* Following Claude Code's proven architecture:
* - Direct console output (no Ink/React)
* - chalk for colors
* - ora for spinners
* - log-update for in-place rendering
  */

 import { createInterface } from 'readline';
 import chalk from 'chalk';
 import ora, { Ora } from 'ora';
 import { meow } from 'meow';
 import inquirer from 'inquirer';
 import { ASCII_LOGO, CRUSH_THEME, FLOYD_NAME, FLOYD_VERSION } from './constants.js';
 import { FloydAgentEngine } from './agent/execution-engine.js';
 import { loadConfig } from './utils/config.js';
 import { logger } from './utils/logger.js';
 import { fileURLToPath } from 'url';
 import { dirname } from 'path';

 const __filename = fileURLToPath(import.meta.url);
 const __dirname = dirname(__filename);

 // CLI interface using meow
 const cli = meow(`
 ${ASCII_LOGO}

 ${chalk.cyanBright(FLOYD_NAME)} v${FLOYD_VERSION} - ${CRUSH_THEME.tagline}

 ${chalk.gray('Powered by GLM-4.7 • Cost-Effective AI Development')}

 ${chalk.white('Type your message and press Enter to start.')}
 ${chalk.dim('Ctrl+C to exit | /help for commands')}
 `, {
   importMeta: import.meta.url,
   description: `${FLOYD_NAME} - AI Development Companion`,
   version: FLOYD_VERSION,
   help: `
 ${chalk.yellow('Examples:')}
   $ floyd "Explain how this code works"
   $ floyd "Fix the bug in this function"
   $ floyd "Add error handling to this file"
   `,
   flags: {
     debug: {
       type: 'boolean',
       default: false,
       describe: 'Enable debug logging',
     },
     verbose: {
       type: 'boolean',
       default: false,
       describe: 'Enable verbose output',
     },
   },
 });

 // Main Floyd CLI class
 class FloydCLI {
   private engine: FloydAgentEngine | null = null;
   private rl: ReturnType<typeof createInterface>;
   private currentSpinner: Ora | null = null;
   conversationHistory: Array<{ role: string; content: string }> = [];

   constructor() {
     // Create readline interface for input
     this.rl = createInterface({
       input: process.stdin,
       output: process.stdout,
     });

     // Handle Ctrl+C
     this.rl.on('SIGINT', () => {
       console.log('\n' + chalk.yellow('Exiting...'));
       process.exit(0);
     });
   }

   async initialize(): Promise<void> {
     // Load configuration
     const config = await loadConfig();

     // Initialize engine
     this.engine = new FloydAgentEngine(
       config,
       // onToken - update display inline
       (token: string) => {
         this.displayToken(token);
       },
       // onToolStart
       (tool: string) => {
         this.showToolIndicator(tool);
       },
       // onToolComplete
       () => {
         this.hideToolIndicator();
       }
     );

     logger.info('Floyd CLI initialized');
   }

   async start(): Promise<void> {
     // Display welcome banner
     this.displayWelcome();

     // Main input loop
     this.promptForInput();
   }

   private displayWelcome(): void {
     console.log(`\n${ASCII_LOGO}`);
     console.log(chalk.cyanBright(`${FLOYD_NAME} v${FLOYD_VERSION}`) + chalk.gray(` - ${CRUSH_THEME.tagline}\n`));
     console.log(chalk.gray('Powered by GLM-4.7 • Cost-Effective AI Development\n'));
     console.log(chalk.dim('Type your message and press Enter to start. Ctrl+C to exit\n'));
   }

   // CRITICAL: Streaming without scroll spam (using log-update for in-place updates)
   private displayToken(token: string): void {
     // Just print to console - streaming will be handled by engine
     process.stdout.write(token);
   }

   private async promptForInput(): Promise<void> {
     this.rl.question(`${chalk.green('> ')}`, async (input: string) => {
       if (!input.trim()) {
         this.promptForInput();
         return;
       }

       try {
         await this.processInput(input);
       } catch (error) {
         this.error(chalk.red(`Error: ${(error as Error).message}`));
       }

       this.promptForInput();
     });
   }

   private async processInput(input: string): Promise<void> {
     if (!this.engine) {
       throw new Error('Engine not initialized');
     }

     console.log(); // Empty line before response

     // Create spinner for thinking
     this.currentSpinner = ora({
       text: 'Floyd is thinking',
       spinner: 'dots',
       color: 'cyan',
       hideCursor: false,
     }).start();

     try {
       // Execute the agentic loop
       const response = await this.engine.execute(input);

       // Stop spinner
       this.currentSpinner.succeed('Response complete');

       // Display response
       this.displayResponse(input, response);
     } catch (error) {
       this.currentSpinner?.fail('Request failed');
       throw error;
     } finally {
       this.currentSpinner = null;
     }
   }

   private displayResponse(input: string, response: string): void {
     // User message
     console.log(chalk.green('You:'), input);

     // Floyd response
     console.log(chalk.cyan('Floyd:'), response);
     console.log(); // Empty line after response
   }

   private showToolIndicator(tool: string): void {
     if (this.currentSpinner) {
       this.currentSpinner.text = `Using ${tool}...`;
     }
   }

   private hideToolIndicator(): void {
     if (this.currentSpinner) {
       this.currentSpinner.text = 'Floyd is thinking';
     }
   }

   private error(message: string): void {
     console.error(message);
   }

   async cleanup(): Promise<void> {
     this.rl.close();
     // Kill any background processes
     // etc.
   }
 }

 // Main entry point
 async function main() {
   const cli = new FloydCLI();
   await cli.initialize();
   await cli.start();
 }

 // Run if called directly
 if (import.meta.url === `file://${process.argv[1]}`) {
   main().catch((error) => {
     console.error(chalk.red('Fatal error:'), error);
     process.exit(1);
   });
 }

 export { FloydCLI, main };

 **Tasks:**
- Create main CLI entry point with console-based UI
- Implement readline interface for input
- Add ora spinner for "thinking" state
- Implement FloydCLI class with state management
- Add input/output loop
- Test basic interaction flow
- **CRITICAL:** Test streaming doesn't cause scroll spam

 **5.1.2 Terminal Interface (Following Claude Code Pattern)**

 **File:** src/ui/terminal.ts

 import chalk from 'chalk';
 import ora, { Ora } from 'ora';
 import { createInterface } from 'readline';
 import { CRUSH_THEME } from '../constants.js';

 export interface TerminalConfig {
   useColors: boolean;
   showProgressIndicators: boolean;
 }

 export class TerminalInterface {
   private rl: ReturnType<typeof createInterface>;
   private activeSpinners: Map<string, Ora> = new Map();
   private config: TerminalConfig;

   constructor(config: TerminalConfig) {
     this.config = config;
     this.rl = createInterface({
       input: process.stdin,
       output: process.stdout,
     });
   }

   /**
    * Display welcome banner with ASCII logo
    */
   displayWelcome(): void {
     const { ASCII_LOGO, FLOYD_NAME, FLOYD_VERSION, CRUSH_THEME } = await import('../constants.js');

     console.log(`\n${ASCII_LOGO}`);
     console.log(chalk.hex(CRUSH_THEME.colors.primary)(`${FLOYD_NAME} v${FLOYD_VERSION}`));
     console.log(chalk.hex(CRUSH_THEME.colors.secondary)(CRUSH_THEME.tagline));
     console.log(chalk.hex(CRUSH_THEME.colors.muted)('Powered by GLM-4.7 • Cost-Effective AI Development'));
     console.log();
   }

   /**
    * Display user message
    */
   displayUserMessage(message: string): void {
     console.log(chalk.green('You:'), message);
   }

   /**
    * Display Floyd response (with streaming support)
    */
   displayFloydResponse(response: string): void {
     console.log(chalk.cyan('Floyd:'), response);
     console.log();
   }

   /**
    * Display error message
    */
   displayError(message: string): void {
     console.error(chalk.red('Error:'), message);
   }

   /**
    * Display success message
    */
   displaySuccess(message: string): void {
     console.log(chalk.green('✓'), message);
   }

   /**
    * Display warning message
    */
   displayWarning(message: string): void {
     console.log(chalk.yellow('⚠'), message);
   }

   /**
    * Display info message
    */
   displayInfo(message: string): void {
     console.log(chalk.blue('ℹ'), message);
   }

   /**
    * Create a spinner for progress indication
    */
   spinner(text: string, id: string = 'default'): Ora {
     // Clean up existing spinner
     if (this.activeSpinners.has(id)) {
       this.activeSpinners.get(id)!.stop();
       this.activeSpinners.delete(id);
     }

     // Create new spinner
     const spinner = ora({
       text,
       spinner: 'dots',
       color: 'cyan',
       hideCursor: false,
     }).start();

     this.activeSpinners.set(id, spinner);
     return spinner;
   }

   /**
    * Close the terminal interface
    */
   close(): void {
     this.rl.close();

     // Stop all spinners
     for (const spinner of this.activeSpinners.values()) {
       spinner.stop();
     }
     this.activeSpinners.clear();
   }
 }

 **Tasks:**
- Create TerminalInterface class following Claude Code patterns
- Add spinner management
- Add color-coded message display
- Implement terminal cleanup
- Test all terminal interactions

 **5.1.3 Streaming Display (No Scroll Spam)**

 **File:** src/ui/rendering.ts

 import update from 'log-update';
 import chalk from 'chalk';

 /**
* Streaming display manager - handles in-place updates without scroll spam
  *
* Following Claude Code's approach: use log-update for in-place rendering
  */
 export class StreamingDisplay {
   private update: ReturnType<typeof update>;
   private currentLine = '';
   private currentCol = 0;

   constructor() {
     // log-update creates in-place output (no new lines)
     this.update = update('Floyd: ');
   }

   /**
    * Append token to current line (in-place update)
    */
   appendToken(token: string): void {
     this.currentLine += token;
     this.currentCol += token.length;

     // Update the line in-place (no scroll)
     this.update(`Floyd: ${this.currentLine}`);
   }

   /**
    * Complete the current response
    */
   finish(): void {
     // Final update to ensure all content is visible
     this.update(`Floyd: ${this.currentLine}`);

     // Print final newline
     console.log();

     // Reset for next response
     this.currentLine = '';
     this.currentCol = 0;
     this.update = update('Floyd: ');
   }

   /**
    * Clear current line
    */
   clear(): void {
     this.currentLine = '';
     this.currentCol = 0;
     this.update('Floyd: ');
   }

   /**
    * Show tool execution status
    */
   showTool(tool: string): void {
     this.clear();
     this.update(`[${tool}]`);
   }

   /**
    * Show thinking indicator
    */
   showThinking(): void {
     this.clear();
     this.update('Thinking...');
   }
 }

 **Tasks:**
- Implement StreamingDisplay class with log-update
- Add in-place token updates (no scroll spam)
- Add tool status display
- Add thinking indicator
- Test with long responses (1000+ tokens)
- **CRITICAL:** Verify no scroll spam during streaming

 **5.1.4 Message History Display**

 **File:** src/ui/history.ts

 import chalk from 'chalk';
 import { cliTable3 } from 'cli-table3';
 import type { FloydMessage } from '../types.js';

 /**
* Display conversation history
  */
 export class ConversationHistory {
   private messages: FloydMessage[] = [];

   addMessage(message: FloydMessage): void {
     this.messages.push(message);
   }

   clear(): void {
     this.messages = [];
   }

   display(): void {
     if (this.messages.length === 0) {
       return;
     }

     // Display last 10 messages (avoid overwhelming terminal)
     const recentMessages = this.messages.slice(-10);

     for (const msg of recentMessages) {
       const roleColor = msg.role === 'user' ? chalk.green : chalk.cyan;
       const roleName = msg.role === 'user' ? 'You' : 'Floyd';

       console.log(`${roleColor.bold(`${roleName}:`)}`);
       console.log(msg.content);
       console.log(); // Empty line between messages
     }
   }

   displayAsTable(): void {
     if (this.messages.length === 0) {
       return;
     }

     const table = cliTable3({
       style: {
         head: ['cyan', 'dim'],
         border: ['gray'],
       },
       colWidths: [15, 80],
     });

     table.push(
       ['Role', 'Message'],
       ...this.messages.slice(-10).map(msg => [
         msg.role === 'user' ? 'You' : 'Floyd',
         msg.content.slice(0, 100) + (msg.content.length > 100 ? '...' : ''),
       ])
     );

     console.log(table.toString());
   }
 }

 **Tasks:**
- Implement ConversationHistory class
- Add message formatting
- Add table display option
- Test with long conversations (100+ messages)
- Test with multi-line messages

 **Exit Criteria for Phase 5**

- ✅ Console-based UI renders correctly
- ✅ Streaming responses display without scroll spam
- ✅ ora spinners work for all states
- ✅ User input loop handles all scenarios
- ✅ Terminal cleanup works (no leftover artifacts)
- ✅ Color-coded output works correctly
- ✅ Integration test: full conversation flow passes

 ---
 **Phase 6: Advanced Tools Implementation (Weeks 6-7)**

 **Objective**

 Implement remaining 45 tools across all categories.

 **6.1 Tool Implementation Order**

 **Week 6: High-Priority Tools (20 tools)**

1. **Git Operations** (6 more tools):
- git_log, git_commit, git_stage, git_unstage, git_branch, is_protected_branch
2. **Browser Operations** (9 tools):
- browser_navigate, browser_read_page, browser_screenshot, browser_click, browser_type, browser_find, browser_get_tabs, browser_create_tab, browser_status
3. **Cache Operations** (5 tools):
- cache_store, cache_retrieve, cache_delete, cache_clear, cache_list

 **Week 7: Remaining Tools (25 tools)**

4. **Cache Operations Continued** (6 more tools):
- cache_search, cache_stats, cache_prune, cache_store_pattern, cache_store_reasoning, cache_load_reasoning, cache_archive_reasoning
5. **Patch Operations** (5 tools):
- apply_unified_diff, edit_range, insert_at, delete_range, assess_patch_risk
6. **Special Tools** (7 tools):
- manage_scratchpad, smart_replace, visual_verify, todo_sniper, check_diagnostics, project_map, list_symbols
7. **Build/Test Tools** (4 more tools):
- detect_project, run_tests, format, lint, build

 **6.2 Implementation Pattern**

 For each tool, follow this checklist:
- Create tool file in appropriate directory
- Define input schema with Zod
- Define output interface
- Implement execute function
- Add error handling
- Add JSDoc comments
- Write unit tests
- Write integration tests
- Register in tools/index.ts
- Update documentation

 **Exit Criteria for Phase 6**

- ✅ All 55 tools implemented
- ✅ All tools pass unit tests
- ✅ All tools pass integration tests
- ✅ All tools registered in ToolRegistry
- ✅ Tool documentation complete

 ---
 **Phase 7: SUPERCACHE Implementation (Week 8)**

 **Objective**

 Build 3-tier caching system to reduce GLM-4.7 API costs.

 **7.1 Cache Architecture**

 **7.1.1 Cache Implementation**

 **File:** src/cache/supercache.ts

 import fs from 'fs-extra';
 import path from 'path';
 import { z } from 'zod';
 import type { ToolResult } from '@/types';

 const cacheEntrySchema = z.object({
   key: z.string(),
   value: z.string(),
   timestamp: z.number(),
   expires: z.number(),
   metadata: z.record(z.unknown()).optional(),
 });

 type CacheEntry = z.infer<typeof cacheEntrySchema>;

 export class SUPERCACHE {
   private cacheDir: string;
   private tiers = {
     reasoning: path.join(process.cwd(), '.floyd', 'cache', 'reasoning'),
     project: path.join(process.cwd(), '.floyd', 'cache', 'project'),
     vault: path.join(process.cwd(), '.floyd', 'cache', 'vault'),
   };

   constructor() {
     this.cacheDir = path.join(process.cwd(), '.floyd', 'cache');
     this.ensureDirectories();
   }

   private async ensureDirectories(): Promise<void> {
     await fs.ensureDir(this.tiers.reasoning);
     await fs.ensureDir(this.tier.project);
     await fs.ensureDir(this.tiers.vault);
   }

   async store(
     tier: 'reasoning' | 'project' | 'vault',
     key: string,
     value: string,
     metadata?: Record<string, unknown>
   ): Promise<void> {
     const ttl = this.getTierTTL(tier);
     const entry: CacheEntry = {
       key,
       value,
       timestamp: Date.now(),
       expires: Date.now() + ttl,
       metadata,
     };

     const filePath = this.getFilePath(tier, key);
     await fs.writeFile(filePath, JSON.stringify(entry, null, 2));
   }

   async retrieve(
     tier: 'reasoning' | 'project' | 'vault',
     key: string
   ): Promise<{ found: boolean; value?: string; entry?: CacheEntry }> {
     const filePath = this.getFilePath(tier, key);

     if (!(await fs.pathExists(filePath))) {
       return { found: false };
     }

     const content = await fs.readFile(filePath, 'utf-8');
     const entry = cacheEntrySchema.parse(JSON.parse(content));

     // Check expiry
     if (Date.now() > entry.expires) {
       await fs.remove(filePath);
       return { found: false };
     }

     return { found: true, value: entry.value, entry };
   }

   async delete(
     tier: 'reasoning' | 'project' | 'vault',
     key: string
   ): Promise<boolean> {
     const filePath = this.getFilePath(tier, key);
     if (await fs.pathExists(filePath)) {
       await fs.remove(filePath);
       return true;
     }
     return false;
   }

   async clear(tier?: 'reasoning' | 'project' | 'vault'): Promise<number> {
     const tiersToClear = tier ? [tier] : (Object.keys(this.tiers) as Array<keyof typeof this.tiers>);

     let deleted = 0;
     for (const t of tiersToClear) {
       const files = await fs.readdir(this.tiers[t]);
       for (const file of files) {
         await fs.remove(path.join(this.tiers[t], file));
         deleted++;
       }
     }

     return deleted;
   }

   async list(tier?: 'reasoning' | 'project' | 'vault'): Promise<CacheEntry[]> {
     const tiersToList = tier ? [tier] : (Object.keys(this.tiers) as Array<keyof typeof this.tiers>);
     const entries: CacheEntry[] = [];

     for (const t of tiersToList) {
       const files = await fs.readdir(this.tiers[t]);
       for (const file of files) {
         const filePath = path.join(this.tiers[t], file);
         const content = await fs.readFile(filePath, 'utf-8');
         const entry = cacheEntrySchema.parse(JSON.parse(content));

         // Skip expired
         if (Date.now() <= entry.expires) {
           entries.push(entry);
         }
       }
     }

     return entries.sort((a, b) => b.timestamp - a.timestamp);
   }

   private getTierTTL(tier: 'reasoning' | 'project' | 'vault'): number {
     const ttlMap = {
       reasoning: 5 * 60 * 1000,       // 5 minutes
       project: 24 * 60 * 60 * 1000,   // 24 hours
       vault: 7 * 24 * 60 * 60 * 1000, // 7 days
     };
     return ttlMap[tier];
   }

   private getFilePath(tier: 'reasoning' | 'project' | 'vault', key: string): string {
     const hash = Buffer.from(key).toString('base64').replace(/[/+=]/g, '');
     return path.join(this.tiers[tier], `${hash}.json`);
   }
 }

 export const supercache = new SUPERCACHE();

 **Tasks:**
- Implement SUPERCACHE class
- Add tier-based TTL management
- Add expiry checking
- Add automatic cleanup
- Write comprehensive tests
- Test cache persistence across runs
- Test cache eviction on expiry

 **7.1.2 Cache Integration with Tools**

 **File:** src/cache/integration.ts

 import { supercache } from './supercache';
 import type { ToolResult } from '@/types';

 export function withCache<T>(
   toolName: string,
   input: unknown,
   tier: 'reasoning' | 'project' | 'vault',
   fn: () => Promise<ToolResult<T>>
 ): Promise<ToolResult<T>> {
   const cacheKey = `${toolName}:${JSON.stringify(input)}`;

   // Try cache first
   return supercache.retrieve(tier, cacheKey).then(async (cached) => {
     if (cached.found && cached.value) {
       return JSON.parse(cached.value) as ToolResult<T>;
     }

     // Execute tool
     const result = await fn();

     // Store in cache
     if (result.success) {
       await supercache.store(tier, cacheKey, JSON.stringify(result));
     }

     return result;
   });
 }

 **Tasks:**
- Create cache wrapper function
- Integrate with expensive tools
- Add cache hit/miss logging
- Test cache effectiveness

 **Exit Criteria for Phase 7**

- ✅ SUPERCACHE stores and retrieves data
- ✅ Tier-based TTL works correctly
- ✅ Expired entries are pruned
- ✅ Cache integration reduces API calls
- ✅ All 11 cache tools implemented

 ---
 **Phase 8: System Prompts & Agent System (Week 9)**

 **Objective**

 Adapt Claude Code prompts to Floyd and implement agent system.

 **8.1 System Prompts**

 **8.1.1 Create Prompt Directory Structure**

 prompts/
 ├── system/
 │   ├── main-system-prompt.md
 │   ├── security-policy.md
 │   └── branding-guidelines.md
 ├── tools/
 │   ├── file/
 │   │   ├── read_file.md
 │   │   ├── write.md
 │   │   ├── edit_file.md
 │   │   └── search_replace.md
 │   ├── search/
 │   ├── build/
 │   ├── git/
 │   ├── browser/
 │   ├── cache/
 │   ├── patch/
 │   └── special/
 ├── agents/
 │   ├── floyd-explore.md
 │   ├── floyd-plan.md
 │   ├── floyd-task.md
 │   ├── floydmd-generator.md
 │   └── conversation-summarization.md
 └── reminders/
     ├── plan-mode-active.md
     └── floyd-config-active.md

 **Tasks:**
- Create all prompt directories
- Adapt main system prompt from Claude Code
- Create all 55 tool description prompts
- Adapt all agent prompts
- Create system reminders
- Validate all prompts for Floyd branding
- Test prompt loading

 **8.1.2 Prompt Loader**

 **File:** src/prompts/loader.ts

 import fs from 'fs-extra';
 import path from 'path';

 export async function loadSystemPrompt(): Promise<string> {
   const promptPath = path.join(__dirname, '../../prompts/system/main-system-prompt.md');
   return await fs.readFile(promptPath, 'utf-8');
 }

 export async function loadToolPrompt(toolName: string): Promise<string> {
   const parts = toolName.split('_');
   const category = parts[0];
   const promptPath = path.join(__dirname, `../../prompts/tools/${category}/${toolName}.md`);
   return await fs.readFile(promptPath, 'utf-8');
 }

 export async function loadAgentPrompt(agentName: string): Promise<string> {
   const promptPath = path.join(__dirname, `../../prompts/agents/${agentName}.md`);
   return await fs.readFile(promptPath, 'utf-8');
 }

 **Tasks:**
- Implement prompt loader
- Add error handling for missing prompts
- Add prompt caching
- Write tests

 **8.2 Agent System**

 **8.2.1 Agent Registry**

 **File:** src/agents/agent-registry.ts

 import type { ToolDefinition } from '@/types';

 export interface AgentDefinition {
   name: string;
   description: string;
   systemPrompt: string;
   allowedTools: string[];
 }

 export class AgentRegistry {
   private agents = new Map<string, AgentDefinition>();

   register(agent: AgentDefinition): void {
     this.agents.set(agent.name, agent);
   }

   get(name: string): AgentDefinition | undefined {
     return this.agents.get(name);
   }

   list(): AgentDefinition[] {
     return Array.from(this.agents.values());
   }
 }

 export const agentRegistry = new AgentRegistry();

 **Tasks:**
- Implement AgentRegistry class
- Register all agents from prompts
- Add agent execution logic
- Write tests

 **Exit Criteria for Phase 8**

- ✅ All prompt files created
- ✅ Main system prompt loaded correctly
- ✅ All tool prompts loaded
- ✅ All agent prompts loaded
- ✅ Prompt loader works
- ✅ Agent registry functional

 ---
 **Phase 9: Testing & Quality Assurance (Week 10)**

 **Objective**

 Comprehensive testing to ensure production readiness.

 **9.1 Unit Testing**

 **9.1.1 Coverage Goals**

- Target: **>80% code coverage**
- Critical paths: **>90% code coverage**

 **Areas to test:**
- All 55 tool implementations
- Tool Registry
- GLM Client (with mocked fetch)
- Stream Handler
- Execution Engine
- SUPERCACHE
- Permission Manager
- Config Loader
- Error handling
- Logger

 **9.1.2 Test Framework Setup**

 **File:** tests/helpers/setup.ts

 import test from 'ava';
 import { Console } from 'console';
 import { Writable } from 'stream';

 // Mock console for testing
 export function mockConsole() {
   const stream = new Writable();
   stream.write = () => true;
   return new Console(stream);
 }

 // Mock file system for testing
 export async function withTempDir(fn: (dir: string) => Promise<void>) {
   const os = await import('os');
   const fs = await import('fs-extra');
   const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'floyd-test-'));

   try {
     await fn(dir);
   } finally {
     await fs.remove(dir);
   }
 }

 **Tasks:**
- Set up AVA test framework
- Create test helpers
- Create test fixtures
- Configure c8 for coverage
- Set up test database/cache directories

 **9.2 Integration Testing**

 **9.2.1 End-to-End Scenarios**

 **File:** tests/integration/scenarios/

 **Scenarios to test:**
1. **Simple Task**: Read a file, explain what it does
2. **Multi-Step Task**: Find a function, understand it, suggest improvements
3. **File Operations**: Create, edit, delete files
4. **Git Operations**: Check status, make commit, view log
5. **Search Task**: Search codebase for specific patterns
6. **Cache Operations**: Store, retrieve, delete cache entries
7. **Permission Flow**: Dangerous tool prompts for confirmation
8. **Error Recovery**: Tool fails, agent continues
9. **15-Turn Simulation**: Complete complex task across 15 turns
10. **Browser Automation** (if extension available): Navigate, click, screenshot

 **Tasks:**
- Create test scenarios for each use case
- Mock GLM-4.7 API responses
- Create test git repository
- Create test file structure
- Run all scenarios successfully
- Measure actual API calls vs cached calls

 **9.3 Performance Testing**

 **9.3.1 Benchmarks**

 **File:** tests/performance/benchmarks.ts

 **Metrics to track:**
- Startup time (target: <1s)
- First token latency (target: <500ms)
- Tool execution time (target: <2s for fast tools)
- Memory usage (target: <500MB)
- Cache hit rate (target: >30%)
- API call reduction (target: >20% via cache)

 **Tasks:**
- Create benchmark suite
- Measure all performance metrics
- Optimize slow paths
- Profile memory usage
- Test with large codebases (1000+ files)

 **9.4 Security Testing**

 **9.4.1 Security Scenarios**

 **File:** tests/security/scenarios.ts

 **Scenarios to test:**
1. **Path Traversal**: Try to read files outside project
2. **Command Injection**: Try to inject commands via bash tool
3. **Dangerous Commands**: Try to run rm -rf /, format c:, etc.
4. **Permission Bypass**: Try to bypass permission system
5. **API Key Exposure**: Ensure no API keys in logs
6. **Cache Poisoning**: Try to inject malicious data into cache
7. **Infinite Loops**: Try to cause infinite execution loops
8. **Resource Exhaustion**: Try to exhaust memory/disk

 **Tasks:**
- Create security test suite
- Test all attack vectors
- Verify all protections work
- Document security assumptions

 **9.5 Human Testing Preparation**

 **9.5.1 Test Plan Document**

 **File:** tests/HUMAN_TESTING.md

 # Floyd Wrapper - Human Testing Plan

 ## Test Scenarios

 ### Scenario 1: Code Explanation
 ****Task:**** Ask Floyd to explain what a function does
 ****Expected:**** Floyd reads the file and provides clear explanation
 ****Success Criteria:**** Correct explanation, no errors

 ### Scenario 2: Bug Fix
 ****Task:**** Provide a file with a bug, ask Floyd to fix it
 ****Expected:**** Floyd identifies bug, suggests fix, applies fix
 ****Success Criteria:**** Bug is fixed, code is tested

 ### Scenario 3: Feature Implementation
 ****Task:**** Ask Floyd to implement a new feature
 ****Expected:**** Floyd implements feature across multiple files
 ****Success Criteria:**** Feature works, tests pass

 ... (continue for 15 scenarios)

 **Tasks:**
- Create 15 realistic test scenarios
- Create success criteria for each
- Create test data sets
- Create testing instructions
- Create feedback form

 **Exit Criteria for Phase 9**

- ✅ Unit test coverage >80%
- ✅ All integration tests pass
- ✅ Performance benchmarks meet targets
- ✅ All security tests pass
- ✅ 15-turn simulation passes 3x consecutively
- ✅ Human testing plan complete

 ---
 **Phase 10: Documentation & Polish (Week 11)**

 **Objective**

 Complete documentation and prepare for human testing.

 **10.1 Documentation**

 **10.1.1 API Documentation**

 **File:** docs/API.md

 # Floyd Wrapper API Documentation

 ## Installation
 \`\`\`bash
 npm install -g @cursem/floyd-wrapper
 \`\`\`

 ## Configuration
 ...

 ## Tool Reference
 ...

 ## Agent System
 ...

 **Tasks:**
- Complete API.md with all tool references
- Add code examples
- Add troubleshooting section
- Add FAQ

 **10.1.2 Update FLOYD.md (SSOT)**

 **File:** FLOYD.md (at project root)

 This is the Single Source of Truth that will guide the builder agent. Will be created separately as comprehensive document.

 **Tasks:**
- Create comprehensive FLOYD.md
- Include builder agent persona
- Include all implementation guidance
- Include troubleshooting
- Include quality gates

 **10.1.3 README Updates**

 **File:** README.md

 # Floyd Wrapper

> File-Logged Orchestrator Yielding Deliverables

 [![Build Status](~badge~)]
 [![Coverage](~badge~)]
 [![Version](~badge~)]

 ## Quick Start

 \`\`\`bash
 npm install -g @cursem/floyd-wrapper
 floyd
 \`\`\`

 ## Features

- 🤖 ****55 Tools**** - Comprehensive toolset for development
- 💰 ****Cost-Effective**** - ~10x cheaper than Claude Code
- 🧠 ****Agentic**** - Autonomous task completion
- 💾 ****SUPERCACHE**** - 3-tier caching system
- 🎨 ****CRUSH Theme**** - Beautiful CLI interface

 ## Documentation

- [API Reference](~docs/API.md~)
- [Tool Reference](~docs/TOOLS.md~)
- [Configuration Guide](~docs/CONFIGURATION.md~)
 ...

 **Tasks:**
- Update README with quick start
- Add feature highlights
- Add links to documentation
- Add badges
- Add contribution guidelines

 **10.1.4 Changelog**

 **File:** CHANGELOG.md

 # Changelog

 ## [0.1.0] - 2026-01-22

 ### Added
- Initial release of Floyd Wrapper
- 55 tools across 8 categories
- GLM-4.7 integration with streaming
- SUPERCACHE 3-tier caching system
- CRUSH-themed CLI interface
- Agentic execution engine
 ...

 **Tasks:**
- Create CHANGELOG.md
- Document all features
- Document breaking changes
- Document known issues

 **10.2 Final Polish**

 **10.2.1 Code Quality**

- Run npm run lint and fix all issues
- Run npm run format on all files
- Remove all // @ts-ignore comments
- Remove all console.log statements (use logger)
- Remove unused dependencies
- Update all dependencies to latest versions
- Run security audit (npm audit)
- Fix all security vulnerabilities

 **10.2.2 Build & Release**

- Test npm run build works
- Test npm link for local development
- Test npm pack creates valid package
- Create release notes
- Tag version in git

 **Exit Criteria for Phase 10**

- ✅ All documentation complete
- ✅ README has quick start guide
- ✅ API documentation is comprehensive
- ✅ FLOYD.md SSOT is complete
- ✅ Code quality checks pass
- ✅ Package builds successfully
- ✅ Ready for human testing

 ---
 **Phase 11: Human Testing Phase (Week 12)**

 **Objective**

 Conduct thorough human testing and fix all issues.

 **11.1 Test Execution**

 **11.1.1 Internal Testing (Days 1-3)**

 **Participants:** Development team
 **Focus:** Functional correctness

 **Tasks:**
- Execute all 15 test scenarios
- Document all bugs found
- Categorize bugs by severity
- Create fix priorities
- Fix all critical bugs
- Fix all high-priority bugs

 **11.1.2 Beta Testing (Days 4-7)**

 **Participants:** Selected beta users
 **Focus:** Usability and edge cases

 **Tasks:**
- Recruit 5-10 beta testers
- Provide test scenarios and instructions
- Collect feedback via form
- Monitor usage metrics
- Document all issues
- Categorize by severity
- Fix all critical bugs

 **11.1.3 Final Testing (Days 8-10)**

 **Participants:** Fresh users
 **Focus:** End-to-end experience

 **Tasks:**
- Execute 15-turn simulation 3x
- Test all 55 tools
- Test error recovery
- Test permission system
- Test cache effectiveness
- Test with large codebases
- Document remaining issues
- Decide if ready for release

 **11.2 Bug Fixes**

 **11.2.1 Bug Triage**

 Categories:
- **Critical**: Blocks all usage, data loss, security issues
- **High**: Major feature broken, frequent crashes
- **Medium**: Minor feature broken, occasional crashes
- **Low**: Cosmetic issues, nice-to-have fixes

 **Tasks:**
- Triage all reported bugs
- Assign severity levels
- Create fix plans
- Implement fixes
- Test fixes
- Verify no regressions

 **11.2.2 Regression Testing**

 **Tasks:**
- Re-run all unit tests
- Re-run all integration tests
- Re-run performance benchmarks
- Re-run security tests
- Re-run 15-turn simulation
- Verify no regressions

 **11.3 Release Decision**

 **11.3.1 Release Criteria**

- ✅ All critical bugs fixed
- ✅ All high bugs fixed
- ✅ Medium bugs <5
- ✅ 15-turn simulation passes 3x
- ✅ No new critical issues found
- ✅ Performance targets met
- ✅ Security tests pass
- ✅ Documentation complete

 **Tasks:**
- Evaluate release criteria
- Create release notes
- Tag release in git
- Publish to npm
- Announce release

 **Exit Criteria for Phase 11**

- ✅ All test scenarios executed
- ✅ All critical bugs fixed
- ✅ All high bugs fixed
- ✅ Release criteria met
- ✅ Package published
- ✅ Documentation published
- ✅ Release announced

 ---
 **Risk Register & Mitigation**

 **Critical Risks**

 **Risk 1: GLM-4.7 API Unreliable**

 **Probability:** Medium
 **Impact:** High
 **Mitigation:**
- Implement robust retry logic
- Add fallback to alternative LLM provider
- Extensive error handling
- Clear error messages to users

 **Risk 2: Terminal Output Issues**

 **Probability:** Low (proven approach)
 **Impact:** Medium
 **Mitigation:**
- Follow Claude Code's proven console patterns
- Use log-update for in-place rendering
- Extensive testing of streaming output
- Test on multiple terminals (iTerm2, Terminal.app, Windows Terminal)
- Ensure proper cleanup of readline interfaces

 **Risk 3: Agentic Loop Infinite Execution**

 **Probability:** Medium
 **Impact:** High
 **Mitigation:**
- Hard turn limit (20 turns)
- Timeout per turn (5 minutes)
- Completion detection
- User abort (Ctrl+C)
- Monitor token usage

 **Risk 4: Tool Implementation Bugs**

 **Probability:** Medium
 **Impact:** Medium
 **Mitigation:**
- Comprehensive unit tests for each tool
- Integration tests for all tools
- Zod validation prevents invalid inputs
- Error handling for all failure modes
- Backup before destructive operations

 **Risk 5: Permission System Failure**

 **Probability:** Low
 **Impact:** Critical
 **Mitigation:**
- Dangerous tools require explicit confirmation
- Permission checks at multiple levels
- Audit logging of all dangerous operations
- Undo functionality where possible
- Clear warnings before execution

 **Risk 6: Cache Corruption**

 **Probability:** Low
 **Impact:** Medium
 **Mitigation:**
- Zod validation on cache read
- Automatic prune of expired entries
- Cache rebuild on corruption
- Separate cache per tier
- Backup before critical operations

 **Risk 7: Memory Leaks**

 **Probability:** Medium
 **Impact:** Medium
 **Mitigation:**
- Profile memory usage regularly
- Clean up event listeners
- Clear buffers after use
- Test with long-running sessions
- Monitor with heap snapshots

 **Risk 8: Test Coverage Gaps**

 **Probability:** Medium
 **Impact:** High
 **Mitigation:**
- Set minimum coverage threshold (80%)
- Enforce in CI/CD
- Regular coverage audits
- Add tests for all bug fixes
- Mutation testing for critical paths

 ---
 **Quality Gates**

 **Between Each Phase**

- All unit tests pass
- All integration tests pass
- No TypeScript errors
- No lint errors
- Code review completed
- Documentation updated

 **Before Human Testing**

- Unit test coverage >80%
- All 55 tools tested
- 15-turn simulation passes 3x
- Performance targets met
- Security tests pass
- Documentation complete
- No critical bugs

 **Before Release**

- All test scenarios pass
- All critical bugs fixed
- All high bugs fixed
- Release notes written
- Changelog updated
- Version tagged
- Package published

 ---
 **Success Metrics**

 **Functional Requirements**

- ✅ 55 tools implemented and tested
- ✅ Agentic execution loop works
- ✅ GLM-4.7 streaming works
- ✅ SUPERCACHE reduces API calls
- ✅ Permission system prevents disasters
- ✅ UI renders correctly

 **Quality Requirements**

- ✅ Unit test coverage >80%
- ✅ Integration tests pass
- ✅ Security tests pass
- ✅ Performance targets met
- ✅ No critical bugs
- ✅ No high bugs (or <5 medium)

 **User Experience Requirements**

- ✅ Startup time <1s
- ✅ First token <500ms
- ✅ Tool execution <2s
- ✅ Memory usage <500MB
- ✅ Clear error messages
- ✅ Helpful prompts

 **Cost Requirements**

- ✅ Cache hit rate >30%
- ✅ API call reduction >20%
- ✅ Competitive with Claude Code on cost

 ---
 **Implementation Order Summary**

1. **Phase 0** (1-2 days): Pre-implementation
2. **Phase 1** (Week 1): Foundation
3. **Phase 2** (Week 2): Tool Registry + Core Tools (10 tools)
4. **Phase 3** (Week 3): GLM-4.7 Client + Streaming
5. **Phase 4** (Week 4): Agentic Execution Engine
6. **Phase 5** (Week 5): UI Implementation with Console Output
7. **Phase 6** (Weeks 6-7): Advanced Tools (45 more tools)
8. **Phase 7** (Week 8): SUPERCACHE Implementation
9. **Phase 8** (Week 9): System Prompts + Agent System
10. **Phase 9** (Week 10): Testing + QA
11. **Phase 10** (Week 11): Documentation + Polish
12. **Phase 11** (Week 12): Human Testing + Release

 **Total Duration:** ~12 weeks (3 months)

 ---
 **Next Steps After Plan Approval**

1. ✅ **Create FLOYD.md SSOT** - Comprehensive builder guide (COMPLETED)
2. **Initialize git repository** - Set up version control
3. **Run Phase 0** - Pre-implementation checks
4. **Begin Phase 1** - Start foundation work
5. **Set up CI/CD** - Automated testing pipeline
6. **Weekly progress reviews** - Ensure staying on track
7. **Risk monitoring** - Watch for blockers
8. **Agile adaptation** - Adjust plan as needed

 ---
 **Plan Version:** 1.1.0 (Console-Based Architecture)
 **Created:** 2026-01-22
 **Last Updated:** 2026-01-22
 **Status:** Ready for Implementation

 **Architecture Decision:** Following Claude Code's proven console-based approach using chalk, ora, log-update, inquirer, and cli-table3. NOT using Ink/React (removed from dependencies).