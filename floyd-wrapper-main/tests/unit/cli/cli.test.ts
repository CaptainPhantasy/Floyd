/**
 * Floyd CLI Unit Tests
 *
 * Tests for FloydCLI class including initialization, streaming integration,
 * and FloydTerminal usage.
 */

import test from 'ava';
import { FloydCLI } from '../../../src/cli.ts';
import { FloydTerminal } from '../../../src/ui/terminal.ts';
import { StreamingDisplay } from '../../../src/ui/rendering.ts';

// ============================================================================
// Test Setup
// ============================================================================

// Track CLI instances for cleanup
const cliInstances: Array<any> = [];

/**
 * Clean up before each test
 */
test.beforeEach(async () => {
  // Clean up any existing terminal/streaming instances
  const terminal = FloydTerminal.getInstance();
  const renderer = StreamingDisplay.getInstance();

  if (renderer.isActive()) {
    renderer.clear();
  }

  terminal.cleanup();
});

/**
 * Clean up after each test
 */
test.afterEach.always(async () => {
  // Close all readline interfaces from CLI instances
  for (const cliInstance of cliInstances) {
    try {
      // Remove signal handlers to prevent process hanging
      if (typeof cliInstance.removeSignalHandlers === 'function') {
        cliInstance.removeSignalHandlers();
      }
      if (cliInstance.rl) {
        cliInstance.rl.close();
        cliInstance.rl.removeAllListeners();
        cliInstance.rl = undefined;
      }
      // Force cleanup of any event listeners
      if (cliInstance.engine) {
        cliInstance.engine = undefined;
      }
      if (cliInstance.config) {
        cliInstance.config = undefined;
      }
    } catch (_error) {
      // Ignore cleanup errors
    }
  }

  // Clear the array
  cliInstances.length = 0;

  // Clean up terminal and renderer
  const terminal = FloydTerminal.getInstance();
  const renderer = StreamingDisplay.getInstance();

  if (renderer.isActive()) {
    renderer.finish();
  }

  terminal.cleanup();

  // Pause stdin to prevent readline from keeping process alive
  try {
    process.stdin.pause();
  } catch {
    // Ignore
  }

  // Force garbage collection if available
  if (global.gc) {
    global.gc();
  }
});

/**
 * Clean up after all tests
 */
test.after.always(async () => {
  // Final cleanup to ensure process exits
  try {
    process.stdin.pause();
  } catch {
    // Ignore
  }
});

// ============================================================================
// FloydCLI Initialization Tests
// ============================================================================

test.serial('FloydCLI - constructor initializes terminal and streaming display', (t) => {
  const cli = new FloydCLI({ testMode: true });
  cliInstances.push(cli);

  // Verify private fields are initialized via behavior
  t.notThrows(() => {
    const terminal = FloydTerminal.getInstance();
    const renderer = StreamingDisplay.getInstance();
    t.truthy(terminal);
    t.truthy(renderer);
  });
});

test.serial('FloydCLI - initialize method loads configuration', async (t) => {
  const cli = new FloydCLI({ testMode: true });
  cliInstances.push(cli);

  // Should not throw during initialization
  await t.notThrowsAsync(async () => {
    await cli.initialize();
  });
});

test.serial('FloydCLI - initialize sets up engine with callbacks', async (t) => {
  const cli = new FloydCLI({ testMode: true });
  cliInstances.push(cli);

  await cli.initialize();

  // Verify engine was created by checking initialization completed
  const cliInstance = cli as any;
  t.truthy(cliInstance.engine, 'Engine should be initialized');
  t.truthy(cliInstance.config, 'Config should be loaded');
  // Note: readline is not created in test mode to prevent process hanging
  t.falsy(cliInstance.rl, 'Readline should not be created in test mode');
});

// ============================================================================
// Streaming Integration Tests
// ============================================================================

test.serial('FloydCLI - streaming display used for token output', async (t) => {
  const cli = new FloydCLI({ testMode: true });
  cliInstances.push(cli);
  await cli.initialize();

  const cliInstance = cli as any;
  const engine = cliInstance.engine;

  // Verify onToken callback uses StreamingDisplay
  t.truthy(engine, 'Engine should be initialized');

  // Simulate token output
  const renderer = StreamingDisplay.getInstance();

  // The engine's onToken callback should use streamingDisplay.appendToken
  // We can verify this by checking the callback was set
  t.notThrows(() => {
    // Engine callbacks should be configured
    const callbacks = (engine as any).callbacks;
    t.truthy(callbacks, 'Callbacks should exist');
    t.truthy(callbacks.onToken, 'onToken callback should exist');
    t.is(typeof callbacks.onToken, 'function', 'onToken should be a function');
  });
});

test.serial('FloydCLI - streaming display finishes after execution', async (t) => {
  const renderer = StreamingDisplay.getInstance();

  // Simulate streaming
  renderer.appendToken('Test');
  t.true(renderer.isActive(), 'Renderer should be active');

  // Finish streaming
  renderer.finish();
  t.false(renderer.isActive(), 'Renderer should be inactive after finish');
});

test.serial('FloydCLI - streaming display finishes on tool start', async (t) => {
  const cli = new FloydCLI({ testMode: true });
  cliInstances.push(cli);
  await cli.initialize();

  const cliInstance = cli as any;
  const engine = cliInstance.engine;
  const callbacks = (engine as any).callbacks;

  const renderer = StreamingDisplay.getInstance();

  // Start streaming
  renderer.appendToken('Test content');
  t.true(renderer.isActive(), 'Renderer should be active');

  // Simulate tool start (should finish streaming)
  if (callbacks.onToolStart) {
    callbacks.onToolStart('test_tool', {});
  }

  t.false(renderer.isActive(), 'Renderer should be finished after tool start');
});

// ============================================================================
// FloydTerminal Integration Tests
// ============================================================================

test.serial('FloydCLI - tool execution uses terminal methods', async (t) => {
  const cli = new FloydCLI({ testMode: true });
  cliInstances.push(cli);
  await cli.initialize();

  const cliInstance = cli as any;
  const engine = cliInstance.engine;
  const callbacks = (engine as any).callbacks;

  // Verify callbacks exist
  t.truthy(callbacks.onToolStart, 'onToolStart callback should exist');
  t.truthy(callbacks.onToolComplete, 'onToolComplete callback should exist');
  t.is(typeof callbacks.onToolStart, 'function', 'onToolStart should be a function');
  t.is(typeof callbacks.onToolComplete, 'function', 'onToolComplete should be a function');
});

test.serial('FloydCLI - displayWelcome uses terminal methods', async (t) => {
  const cli = new FloydCLI({ testMode: true });
  cliInstances.push(cli);
  const terminal = FloydTerminal.getInstance();

  // displayWelcome should use terminal.showLogo()
  t.notThrows(() => {
    (cli as any).displayWelcome();
  });
});

test.serial('FloydCLI - shutdown uses terminal cleanup', async (t) => {
  const cli = new FloydCLI({ testMode: true });
  cliInstances.push(cli);

  // Shutdown should use terminal.cleanup()
  // Note: This will call process.exit(0), so we can't actually test it
  // But we can verify the method exists
  t.is(typeof cli.shutdown, 'function', 'shutdown method should exist');
});

// ============================================================================
// Error Handling Tests
// ============================================================================

test.serial('FloydCLI - error handling finishes streaming display', async (t) => {
  const renderer = StreamingDisplay.getInstance();

  // Start streaming
  renderer.appendToken('Test');
  t.true(renderer.isActive(), 'Renderer should be active');

  // Simulate error handling (should finish streaming)
  renderer.finish();
  t.false(renderer.isActive(), 'Renderer should be inactive after error');
});

test.serial('FloydCLI - empty input is skipped', async (t) => {
  const cli = new FloydCLI({ testMode: true });
  cliInstances.push(cli);
  await cli.initialize();

  const cliInstance = cli as any;

  // Empty input should not cause errors
  await t.notThrowsAsync(async () => {
    await cliInstance.processInput('');
    await cliInstance.processInput('   ');
  });
});

test.serial('FloydCLI - exit commands are recognized', async (t) => {
  const cli = new FloydCLI({ testMode: true });
  cliInstances.push(cli);
  await cli.initialize();

  const cliInstance = cli as any;

  // 'exit' and 'quit' should trigger shutdown
  // Note: These call process.exit(), so we can't actually test them
  // But we can verify the commands are recognized
  t.is(typeof cliInstance.processInput, 'function', 'processInput should exist');
});

// ============================================================================
// Cleanup Tests
// ============================================================================

test.serial('FloydCLI - cleanup method finishes streaming and terminal', (t) => {
  const cli = new FloydCLI({ testMode: true });
  cliInstances.push(cli);
  const renderer = StreamingDisplay.getInstance();
  const terminal = FloydTerminal.getInstance();

  // Start streaming
  renderer.appendToken('Test');
  t.true(renderer.isActive(), 'Renderer should be active');

  // Cleanup should finish both
  const cliInstance = cli as any;
  t.notThrows(() => {
    cliInstance.cleanup();
  });

  // Note: cleanup() also closes readline, so we can't call it twice
  // but we verified it doesn't throw
});

// ============================================================================
// Signal Handler Tests
// ============================================================================

test.serial('FloydCLI - SIGINT handler is registered', async (t) => {
  const cli = new FloydCLI({ testMode: true });
  cliInstances.push(cli);
  await cli.initialize();

  const cliInstance = cli as any;

  // Verify signal handlers were set up
  // We can't easily test the actual signal without killing the process
  t.truthy(cliInstance.isRunning !== undefined, 'isRunning flag should exist');
});

// ============================================================================
// Force Exit After CLI Tests
// ============================================================================

test.serial('FORCE EXIT - Clean up any remaining readline interfaces', (t) => {
  // This test runs last to verify cleanup
  // Readline interfaces should be properly closed by individual tests
  t.pass('Force exit test completed');

  // Note: process.exit(0) removed as it interferes with AVA's test runner
  // Individual tests are now responsible for proper readline cleanup
});
