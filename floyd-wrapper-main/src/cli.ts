#!/usr/bin/env node
/**
 * Floyd Wrapper CLI - Main Entry Point
 *
 * Interactive console interface with meow CLI parsing,
 * readline input loop, and FloydAgentEngine integration.
 */

import meow from 'meow';
import readline from 'node:readline';
import { onExit } from 'signal-exit';
import { config as dotenvConfig } from 'dotenv';
import { FloydAgentEngine } from './agent/execution-engine.js';
import { loadConfig, loadProjectContext, loadFloydIgnore } from './utils/config.js';
import { logger } from './utils/logger.js';
import { FloydTerminal } from './ui/terminal.js';
import { SessionManager } from './persistence/session-manager.js';
import chalk from 'chalk';
import Table from 'cli-table3';
import { CRUSH_THEME } from './constants.js';
import { StreamingDisplay } from './ui/rendering.js';
import { renderMarkdown } from './ui/formatters.js';
import { getMessageQueue } from './ui/message-queue.js';
import { getMonitoringModule } from './ui/monitoring-module.js';
import { getInterruptManager, type InterruptEvent } from './interrupts/index.js';

// Load environment variables from multiple possible locations
const envPaths = [
  '.env.local', // Project-specific local env (git-ignored)
  '.env', // Project env
  `${process.env.HOME}/.floyd/.env.local`, // Global user env
];

for (const envPath of envPaths) {
  try {
    const result = dotenvConfig({ path: envPath });
    if (result.error) {
      // Silently ignore ENOENT (file not found) errors
    } else if (Object.keys(result.parsed ?? {}).length > 0) {
      // Environment loaded successfully
    }
  } catch {
    // Ignore errors, try next path
  }
}

// ============================================================================
// CLI Configuration
// ============================================================================

const cli = meow(
  `
  Usage
    $ floyd [options]

  Options
    --debug       Enable debug logging
    --tui         Launch full TUI mode (Ink-based UI)
    --bridge      Start mobile bridge server
    --resume      Resume specific session (id or name)
    --mode        Set initial execution mode (ask, yolo, plan, auto, dialogue)
    --version     Show version number

  Examples
    $ floyd              # Launch wrapper mode (default)
    $ floyd --tui        # Launch full TUI mode
    $ floyd --bridge     # Start mobile bridge server
    $ floyd --debug
    $ floyd --mode yolo  # Start in YOLO mode
    $ floyd-tui          # Alternative way to launch TUI
`,
  {
    importMeta: import.meta,
    flags: {
      debug: {
        type: 'boolean',
        default: false,
      },
      tui: {
        type: 'boolean',
        default: false,
      },
      bridge: {
        type: 'boolean',
        default: false,
      },
      resume: {
        type: 'string',
      },
      mode: {
        type: 'string',
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
  private sessionManager?: SessionManager;
  private rl?: readline.Interface;
  private config?: Awaited<ReturnType<typeof loadConfig>>;
  private terminal: FloydTerminal;
  private streamingDisplay: StreamingDisplay;
  private messageQueue = getMessageQueue();
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

      // Load project context and ignore patterns
      const projectRoot = process.cwd();
      const projectContext = await loadProjectContext(projectRoot);
      const ignorePatterns = await loadFloydIgnore(projectRoot);

      if (projectContext) {
        this.config.projectContext = projectContext;
        logger.debug('Loaded project context');
      }

      if (ignorePatterns.length > 0) {
        this.config.floydIgnorePatterns = ignorePatterns;
        logger.debug(`Loaded ${ignorePatterns.length} ignore patterns`);
      }


      // Set log level based on flags (default to 'warn' for clean startup)
      if (cli.flags.debug) {
        this.config.logLevel = 'debug';
        logger.setLevel('debug');
      } else {
        logger.setLevel('warn'); // Only show warnings and errors by default
      }

      // Set execution mode from CLI flag if provided
      if (cli.flags.mode) {
        const validModes = ['ask', 'yolo', 'plan', 'auto', 'dialogue'];
        const mode = cli.flags.mode.toLowerCase();
        if (validModes.includes(mode)) {
          process.env.FLOYD_MODE = mode;
          logger.info('Execution mode set from flag', { mode });
        } else {
          this.terminal.warning(`Invalid mode: ${mode}. Using default: ask`);
        }
      }

      logger.info('Initializing Floyd CLI...', {
        version: cli.pkg.version,
        debug: cli.flags.debug,
        mode: process.env.FLOYD_MODE || 'ask',
      });

      // Initialize Session Manager
      this.sessionManager = new SessionManager(process.cwd());
      let currentSession;

      // Handle Resume vs New Session
      if (cli.flags.resume) {
        currentSession = this.sessionManager.loadSession(cli.flags.resume);
        if (currentSession) {
          logger.info('Resuming session', { sessionId: currentSession.id, name: currentSession.name });
          this.terminal.success(`Resumed session: ${currentSession.name}`);
        } else {
          this.terminal.warning(`Session "${cli.flags.resume}" not found. Starting new session.`);
          currentSession = this.sessionManager.createSession('New Session');
        }
      } else {
        // Start new session
        // FUTURE: Generate funny/relevant names instead of "Session #1"
        currentSession = this.sessionManager.createSession('New Session');
        logger.info('Started new session', { sessionId: currentSession.id });
      }

      // Initialize slash command system
      const { slashCommands } = await import('./commands/slash-commands.js');
      const { builtInCommands } = await import('./commands/built-in-commands.js');

      // Register built-in commands
      for (const cmd of builtInCommands) {
        slashCommands.register(cmd);
      }

      // Register MCP commands
      const { mcpCommands } = await import('./commands/mcp-commands.js');
      for (const cmd of mcpCommands) {
        slashCommands.register(cmd);
      }

      // Register mode commands
      const { modeCommands } = await import('./commands/mode-commands.js');
      for (const cmd of modeCommands) {
        slashCommands.register(cmd);
      }

      // Register rewind & sandbox commands
      const { rewindCommands } = await import('./commands/rewind-commands.js');
      for (const cmd of rewindCommands) {
        slashCommands.register(cmd);
      }

      // Load custom commands from .floyd/commands/
      const customCount = await slashCommands.loadCustomCommands(process.cwd());
      if (customCount > 0) {
        logger.info('Loaded custom slash commands', { count: customCount });
      }

      // Initialize MCP (Model Context Protocol) system
      const { mcpManager } = await import('./mcp/mcp-manager.js');
      logger.info('Connecting to MCP servers...');
      await mcpManager.connectAll();
      const clientCount = mcpManager.getClientCount();
      if (clientCount > 0) {
        this.terminal.success(`Connected to ${clientCount} MCP server(s)`);
      }

      // Setup readline interface first (skip in test mode)
      if (!this.testMode) {
        // CRITICAL: Detect piped mode for proper readline configuration
        // In piped mode, stdin starts paused and won't emit 'line' events without this
        const isPiped = !process.stdin.isTTY;
        if (isPiped) {
          process.stdin.resume();
        }

        // Create completer for slash commands (skip in piped mode to avoid interference)
        let completer: ((line: string) => Promise<[string[], string]>) | undefined;
        if (!isPiped) {
          completer = async (line: string) => {
            const { slashCommands } = await import('./commands/slash-commands.js');
            const commands = slashCommands.list();
            const commandNames = commands.map(cmd => `/${cmd.name}`);

            // Add aliases
            const allNames = [...commandNames];
            for (const cmd of commands) {
              if (cmd.aliases) {
                allNames.push(...cmd.aliases.map(a => `/${a}`));
              }
            }

            // Only complete if line starts with /
            if (!line.startsWith('/')) {
              return [[], line];
            }

            const hits = allNames.filter(cmd => cmd.startsWith(line));

            // Show all commands if just "/" is typed
            if (line === '/') {
              return [allNames, line];
            }

            return [hits, line];
          };
        }

        this.rl = readline.createInterface({
          input: process.stdin,
          output: process.stdout,
          prompt: '> ', // Simple prompt only - NO frame in prompt
          ...(completer ? { completer } : {}),
          // CRITICAL: Set terminal based on TTY detection
          // In piped mode, terminal should be false for proper line handling
          terminal: !isPiped,
        });

        // Show a visible block cursor using ANSI escape codes
        // This makes the cursor more visible in the terminal
        const cursorVisible = '\x1B[?25h'; // Show cursor
        process.stdout.write(cursorVisible);

        // CRITICAL: Attach event handlers IMMEDIATELY after creating readline
        // In piped mode, data starts flowing immediately and we must be ready to receive it
        // Do NOT wait for start() to attach handlers
        this.rl.on('line', async (line: string) => {
          // Save to history file
          if (line.trim()) {
            await this.appendToHistory(line.trim());
          }

          // Use message queue to prevent race conditions
          this.messageQueue.enqueue(line, async (msg) => {
            await this.processInput(msg);
          });

          // Only prompt again if stdin is a TTY (interactive mode)
          // When stdin is piped, readline will close automatically after input ends
          if (this.isRunning && process.stdin.isTTY) {
            this.rl?.prompt();
            this.showCursor(); // Ensure cursor is visible after each prompt
          }
        });

        this.rl.on('close', async () => {
          // CRITICAL: For piped input, close fires AFTER line event
          // But we need to wait for async processing to complete
          if (process.stdin.isTTY) {
            // TTY mode: shutdown immediately
            this.shutdown();
          } else {
            // Piped mode: wait for message queue to flush before shutdown
            await this.messageQueue.waitForQueue();
            this.shutdown();
          }
        });

        // Handle Shift+Tab for mode switching (only in TTY mode)
        if (process.stdin.isTTY) {
          this.setupModeSwitching();
        }
      }

      // Get interrupt manager for state tracking
      const interruptMgr = getInterruptManager();

      // Create agent engine with callbacks
      this.engine = new FloydAgentEngine(this.config, {
        onToken: (token: string) => {
          // Update state to streaming when receiving tokens
          interruptMgr.setState('streaming');
          // Pass token to streaming display - it handles styling logic internally
          // Note: Ideally StreamingDisplay should handle <think> parsing,
          // but for now we'll just stream it.
          // FUTURE: We should detect <think> here if we want to change color *before* printing.
          this.streamingDisplay.appendToken(token);
        },
        onToolStart: (tool: string, input: Record<string, unknown>) => {
          // Update state to tool executing
          interruptMgr.setState('tool_executing');
          // Finish streaming display before showing tool execution
          if (this.streamingDisplay.isActive()) {
            this.streamingDisplay.finish();
          }
          // Update monitoring module with tool info
          const monitoring = getMonitoringModule();
          monitoring.setTool(tool);
          logger.debug('Tool started', { tool, input });
        },
        onToolComplete: (tool: string, result: unknown) => {
          logger.debug('Tool completed', { tool, result });
          // Return to thinking state (waiting for next LLM response)
          interruptMgr.setState('thinking');
          // Clear tool from monitoring module
          const monitoring = getMonitoringModule();
          monitoring.clearTool();
        },
        onThinkingStart: () => {
          // Update state to thinking
          interruptMgr.setState('thinking');
          // Start Pink Floyd thinking phrase in monitoring module
          const monitoring = getMonitoringModule();
          monitoring.startThinking();
        },
        onThinkingComplete: () => {
          // Return to idle state
          interruptMgr.setState('idle');
          // Stop thinking in monitoring module
          const monitoring = getMonitoringModule();
          monitoring.stopThinking();
        },
      }, this.sessionManager);

      // Import permission manager and set up proper permission prompting
      const { permissionManager } = await import('./permissions/permission-manager.js');

      // Set up permission prompt function that respects execution modes
      permissionManager.setPromptFunction(async (prompt: string, permissionLevel: 'moderate' | 'dangerous') => {
        // CRITICAL: In piped/non-TTY mode, we cannot prompt interactively
        // Check TTY status first before attempting any readline operations
        if (!process.stdin.isTTY) {
          logger.warn('Permission denied: Cannot prompt in non-interactive mode (piped input).');
          logger.info('For automation, use: --mode yolo (auto-approves safe tools) or --mode plan (read-only)');
          return false;
        }

        // Pause readline to show prompt
        if (this.rl) {
          this.rl.pause();
        }

        // Show permission prompt
        console.log(prompt);

        // Create temporary readline for permission input
        const response = await this.promptForPermission(permissionLevel);

        // Resume main readline
        if (this.rl) {
          this.rl.resume();
          this.rl.prompt();
        }

        return response;
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
    // Initialize the interrupt manager for state-aware interrupt handling
    const interruptManager = getInterruptManager({
      consecutiveWindow: 2000,    // 2 seconds for consecutive detection
      forceExitThreshold: 3,      // 3 rapid Ctrl+C = force exit
      checkpointOnInterrupt: true, // Enable checkpoint on tool abort
    });

    interruptManager.initialize();

    // Handle interrupt events based on current state
    interruptManager.on('interrupt', (event: InterruptEvent) => {
      switch (event.action) {
        case 'force_exit':
          console.log('\n\n⚠️  Force exit requested. Shutting down immediately...');
          this.cleanup();
          process.exit(0);
          break;

        case 'confirm_exit':
          console.log('\n\n👋 Press Ctrl+C again to exit, or type a message to continue.');
          this.rl?.prompt();
          break;

        case 'cancel_turn':
          console.log('\n\n⏹️  Operation cancelled.');
          // Finish any streaming display
          if (this.streamingDisplay.isActive()) {
            this.streamingDisplay.finish();
            console.log(chalk.hex(CRUSH_THEME.colors.warning)('\n[Interrupted by user]'));
          }
          // Reset state to idle
          interruptManager.setState('idle');
          this.rl?.prompt();
          break;

        case 'abort_tool':
          console.log('\n\n🛑 Tool execution aborted.');
          // The AbortController signal will propagate to the running tool
          // Finish streaming display
          if (this.streamingDisplay.isActive()) {
            this.streamingDisplay.finish();
          }
          console.log(chalk.hex(CRUSH_THEME.colors.warning)('[Tool aborted - session preserved]'));
          interruptManager.setState('idle');
          this.rl?.prompt();
          break;

        case 'clear_prompt':
          // Just clear and show new prompt
          console.log('');
          this.rl?.prompt();
          break;

        case 'ignore':
        default:
          // Do nothing
          break;
      }

      // Reset consecutive counter after handling
      interruptManager.resetConsecutive();
    });

    // Store cleanup reference
    this.sigintHandler = () => {
      interruptManager.cleanup();
    };

    // Use signal-exit for cleanup on all exit paths
    // Store the dispose function returned by onExit
    this.onExitCleanup = onExit(() => {
      interruptManager.cleanup();
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
   * Ensure the terminal cursor is visible
   */
  private showCursor(): void {
    // ANSI escape code to show cursor
    process.stdout.write('\x1B[?25h');
  }

  /**
   * Prompt user for permission (yes/no)
   *
   * CRITICAL: In piped/non-TTY mode, stdin is already consumed and cannot be used
   * for interactive prompts. This function detects that condition and denies
   * permission rather than crashing with ERR_USE_AFTER_CLOSE.
   */
  private async promptForPermission(permissionLevel: 'moderate' | 'dangerous'): Promise<boolean> {
    // In non-interactive mode (piped input), we cannot create a readline interface
    // because stdin is either already consumed or will close immediately.
    // Auto-deny to prevent ERR_USE_AFTER_CLOSE crash.
    if (!process.stdin.isTTY) {
      logger.warn('Permission denied: Cannot prompt in non-interactive mode (piped input).');
      logger.info('For automation, use: --mode yolo (auto-approves safe tools) or --mode plan (read-only)');
      return false;
    }

    return new Promise<boolean>((resolve) => {
      const tempRl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
      });

      const promptText = permissionLevel === 'dangerous'
        ? '⚠️  Approve DANGEROUS operation? (yes/no): '
        : 'Approve this operation? (yes/no): ';

      tempRl.question(promptText, (answer) => {
        tempRl.close();
        const normalized = answer.trim().toLowerCase();
        resolve(normalized === 'y' || normalized === 'yes');
      });
    });
  }

  /**
   * Setup Shift+Tab mode switching
   */
  private setupModeSwitching(): void {
    // Modes in order: ask -> yolo -> plan -> auto -> dialogue -> ask
    const modes: Array<'ask' | 'yolo' | 'plan' | 'auto' | 'dialogue'> = ['ask', 'yolo', 'plan', 'auto', 'dialogue'];

    // Get the input stream from readline
    const input = this.rl ? (this.rl as any).input : null;

    if (input && input.isTTY) {
      // Add our keypress listener WITHOUT removing readline's listener
      // This allows normal typing to continue working
      input.on('keypress', (_str: string, key: any) => {
        // Detect Shift+Tab: key.name === 'tab' && key.shift
        if (key && key.name === 'tab' && key.shift) {
          // Get current mode
          const currentMode = (process.env.FLOYD_MODE as 'ask' | 'yolo' | 'plan' | 'auto' | 'dialogue') || 'ask';
          const currentIndex = modes.indexOf(currentMode);

          // Cycle to next mode
          const nextMode = modes[(currentIndex + 1) % modes.length];
          process.env.FLOYD_MODE = nextMode;

          // Update system prompt in conversation history to reflect new mode
          if (this.engine && typeof (this.engine as any).updateSystemPrompt === 'function') {
            (this.engine as any).updateSystemPrompt();
          }

          // Clear current line and show mode change notification
          readline.clearLine(process.stdout, 0);
          readline.moveCursor(process.stdout, 0, -1);
          console.log('');

          this.terminal.info(`Mode switched to: ${nextMode.toUpperCase()}`);

          switch (nextMode) {
            case 'ask':
              this.terminal.muted('Floyd will ask for permission before executing tools.');
              break;
            case 'yolo':
              this.terminal.warning('⚠️  YOLO MODE: Auto-approves SAFE tools only.');
              this.terminal.muted('SAFE: read-only tools + moderate operations (fetch, branch, stage)');
              this.terminal.muted('DANGEROUS: write, run, delete, git_commit STILL require approval');
              this.terminal.muted('NOTE: In piped/non-TTY mode, dangerous tools are DENIED (cannot prompt)');
              break;
            case 'plan':
              this.terminal.info('Floyd will create plans but NOT edit files.');
              break;
            case 'auto':
              this.terminal.info('Floyd will decide the best mode for each request.');
              break;
            case 'dialogue':
              this.terminal.info('💬 Quick chat mode. Floyd responds one line at a time.');
              break;
          }

          console.log('');

          // Re-show prompt
          this.rl?.prompt();
        }
      });
    }
  }

  /**
   * Check if currently in dialogue mode
   */
  private isDialogueMode(): boolean {
    return process.env.FLOYD_MODE === 'dialogue';
  }

  /**
   * Process a single line in dialogue mode
   */
  private async processDialogueLine(line: string): Promise<boolean> {
    // Skip empty lines
    if (!line.trim()) {
      return false; // Don't continue
    }

    // Skip code block markers and code blocks
    if (line.trim().startsWith('```') || line.trim().match(/^[`~]{3,}/)) {
      return false;
    }

    // Skip lines that look like code (indented or with special chars)
    if (line.trim().startsWith('    ') || line.trim().startsWith('\t')) {
      return false;
    }

    // Print the line
    console.log(`💬 ${line}`);

    // Ask user if they want to continue
    const answer = await this.promptContinue('Press Enter to continue, "q" to quit dialogue mode, "s" to skip to end: ');

    if (answer === 'q') {
      // Exit dialogue mode
      process.env.FLOYD_MODE = 'ask';
      this.terminal.info('Exiting dialogue mode. Returning to ASK mode.');
      return false; // Stop processing
    } else if (answer === 's') {
      // Skip to end - show all remaining text
      return true; // Continue without prompting
    }

    return false; // Continue prompting
  }

  /**
   * Prompt user to continue in dialogue mode
   */
  private async promptContinue(prompt: string): Promise<string> {
    return new Promise<string>((resolve) => {
      const tempRl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
      });

      tempRl.question(prompt, (answer) => {
        tempRl.close();
        resolve(answer.trim().toLowerCase());
      });
    });
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

    // Handle slash commands
    if (input.trim().startsWith('/')) {
      await this.handleSlashCommand(input.trim());
      return;
    }

    // Check if in dialogue mode
    const inDialogueMode = this.isDialogueMode();

    try {
      const startTime = Date.now();

      // Execute user message through agent engine
      await this.engine.execute(input);

      // Finish streaming display after execution completes
      if (this.streamingDisplay.isActive()) {
        const fullText = this.streamingDisplay.getBuffer();
        this.streamingDisplay.clear();

        if (inDialogueMode) {
          // Dialogue mode: Display line by line with prompts
          await this.displayInDialogueMode(fullText);
        } else {
          // Normal mode: Display full response
          // Print blank line spacer (separates spent text from Floyd's text entry)
          console.log('');

          // Print Floyd's response on his text entry line
          console.log(renderMarkdown(fullText));

          this.terminal.blank();

          // UI Polish: Hero Success Box
          const duration = ((Date.now() - startTime) / 1000).toFixed(1);
          const table = new Table({
            chars: {
              'top': '═', 'top-mid': '╤', 'top-left': '╔', 'top-right': '╗',
              'bottom': '═', 'bottom-mid': '╧', 'bottom-left': '╚', 'bottom-right': '╝',
              'left': '║', 'left-mid': '╟', 'mid': '─', 'mid-mid': '┼',
              'right': '║', 'right-mid': '╢', 'middle': '│'
            },
            style: { head: [], border: [] } // Manual styling
          });

          // Simple single-cell success message
          const successColor = CRUSH_THEME.colors.success; // Green/Guac
          const title = chalk.hex(successColor).bold('  ✓ Execution Complete  ');
          const time = chalk.hex(CRUSH_THEME.colors.muted)(`(${duration}s)`);

          table.push([`${title} ${time}`]);
          console.log(table.toString());

          this.terminal.blank();
        }
      }
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
   * Display text in dialogue mode (line by line)
   */
  private async displayInDialogueMode(text: string): Promise<void> {
    const lines = text.split('\n');
    let skipToEnd = false;

    console.log('');
    console.log('💬 Floyd (Dialogue Mode):');

    for (const line of lines) {
      if (skipToEnd) {
        // Just print the line and continue
        if (line.trim()) {
          console.log(`  ${line}`);
        }
      } else {
        // Process line with user prompt
        const shouldContinue = await this.processDialogueLine(line);
        if (shouldContinue) {
          skipToEnd = true;
        }
      }
    }

    console.log('');
    this.terminal.muted('End of response. Type your next message or "/mode ask" to exit dialogue mode.');
    console.log('');
  }

  /**
   * Handle slash commands using the command registry
   */
  private async handleSlashCommand(input: string): Promise<void> {
    const parts = input.slice(1).split(/\s+/);
    const command = parts[0]?.toLowerCase();
    const args = parts.slice(1);

    if (!command) {
      return;
    }

    // Get command registry
    const { slashCommands } = await import('./commands/slash-commands.js');

    // Execute command through registry
    const executed = await slashCommands.execute(command, {
      terminal: this.terminal,
      sessionManager: this.sessionManager,
      cwd: process.cwd(),
      args,
      engine: this.engine,
    });

    if (!executed) {
      this.terminal.warning(`Unknown command: /${command}. Type /help for available commands.`);
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

      // Initialize persistent history
      await this.initializeHistory();

      if (!this.rl) {
        throw new Error('Readline interface not initialized');
      }

      // Main input loop
      // Only prompt if stdin is a TTY (interactive mode)
      // Note: Event handlers are already attached in initialize()
      if (process.stdin.isTTY) {
        this.rl.prompt();
        this.showCursor(); // Ensure cursor is visible
      }

      logger.info('Floyd CLI started');
    } catch (error) {
      logger.error('Failed to start Floyd CLI', error);
      process.exit(1);
    }
  }

  /**
   * Initialize readline history from file
   */
  private async initializeHistory(): Promise<void> {
    if (this.testMode || !this.rl) return;

    try {
      const { default: fs } = await import('fs-extra');
      const { default: path } = await import('node:path');

      const historyFile = path.join(process.cwd(), '.floyd', 'history');

      if (await fs.pathExists(historyFile)) {
        const content = await fs.readFile(historyFile, 'utf-8');
        const lines = content.split('\n').filter(line => line.trim());

        // Basic history loading (Note: Node's readline interface history API is limited
        // in older versions, but we can try to inject it if supported or just manually handle)
        // Actually, standard Node `readline` doesn't have a simple public API to load history
        // array directly without creating a new instance with history option, but `createInterface`
        // doesn't support passing an array in types easily.
        // However, we can push to the internal history array if we are careful.

        // Safe approach: just let new session accumulate history, or verify if we can set it.
        // Since we already created `rl` in initialize(), we might need to recreate it OR
        // just manual append to file for NOW and maybe in future use a better CLI lib.

        // Wait, we CAN pass history to createInterface if we reconstruct it.
        // But let's just use the file for persistent storage across sessions.
        // For current session up-arrow, readline handles it in-memory.
        // If we want up-arrow to work for previous sessions, we need to load it.

        if ((this.rl as any).history instanceof Array) {
          // Reverse because readline stores history latest-first (stack)
          (this.rl as any).history.push(...lines.reverse());
        }
      }
    } catch (error) {
      logger.warn('Failed to load command history', error);
    }
  }

  /**
   * Append command to history file
   */
  private async appendToHistory(command: string): Promise<void> {
    if (this.testMode) return;

    try {
      const { default: fs } = await import('fs-extra');
      const { default: path } = await import('node:path');

      const historyDir = path.join(process.cwd(), '.floyd');
      const historyFile = path.join(historyDir, 'history');

      await fs.ensureDir(historyDir);
      await fs.appendFile(historyFile, command + '\n');
    } catch (error) {
      // Fail silently for history save errors
      logger.debug('Failed to save history', { error });
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

    // Clean up terminal elements (includes cursor restoration)
    this.terminal.cleanup();

    // Ensure cursor is visible before closing
    this.showCursor();

    this.rl?.close();
    this.terminal.success('Goodbye!');

    // CRITICAL: Don't call process.exit() here - let async processing complete naturally
    // The process will exit when all async work completes and event loop is empty
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

    // Clean up terminal elements (includes cursor restoration)
    this.terminal.cleanup();

    // Ensure cursor is visible
    this.showCursor();

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
  // Check if bridge mode is requested
  if (cli.flags.bridge) {
    const { startBridgeServer } = await import('./bridge/cli.js');
    await startBridgeServer({
      port: 4000,
      ngrokAuthToken: process.env.NGROK_AUTHTOKEN,
      ngrokDomain: process.env.NGROK_DOMAIN,
      jwtSecret: process.env.FLOYD_JWT_SECRET
    });
    return;
  }

  // Check if TUI mode is requested
  if (cli.flags.tui) {
    const { launchTUI } = await import('./cli-tui.js');
    const args = process.argv.slice(2).filter(arg => arg !== '--tui');
    await launchTUI(args);
    return;
  }

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
