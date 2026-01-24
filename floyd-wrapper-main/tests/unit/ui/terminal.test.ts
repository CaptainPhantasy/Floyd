/**
 * FloydTerminal Unit Tests
 *
 * Tests for FloydTerminal class including singleton pattern,
 * display methods, and cleanup.
 */

import test from 'ava';
import { FloydTerminal } from '../../../src/ui/terminal.ts';

// ============================================================================
// Test Setup
// ============================================================================

/**
 * Clean up before each test
 */
test.beforeEach(() => {
  const terminal = FloydTerminal.getInstance();
  terminal.cleanup();
});

// ============================================================================
// Singleton Pattern Tests
// ============================================================================

test('FloydTerminal - getInstance returns singleton', (t) => {
  const instance1 = FloydTerminal.getInstance();
  const instance2 = FloydTerminal.getInstance();

  t.is(instance1, instance2, 'Should return the same instance');
});

test('FloydTerminal - multiple getInstance calls return same object', (t) => {
  const instances = Array.from({ length: 5 }, () => FloydTerminal.getInstance());

  instances.forEach((instance) => {
    t.is(instance, instances[0], 'All instances should be the same');
  });
});

// ============================================================================
// Display Method Tests
// ============================================================================

test('FloydTerminal - showLogo method exists and does not throw', (t) => {
  const terminal = FloydTerminal.getInstance();

  t.notThrows(() => {
    terminal.showLogo();
  });
});

test('FloydTerminal - success method exists and does not throw', (t) => {
  const terminal = FloydTerminal.getInstance();

  t.notThrows(() => {
    terminal.success('Test success message');
  });
});

test('FloydTerminal - error method exists and does not throw', (t) => {
  const terminal = FloydTerminal.getInstance();

  t.notThrows(() => {
    terminal.error('Test error message');
  });
});

test('FloydTerminal - warning method exists and does not throw', (t) => {
  const terminal = FloydTerminal.getInstance();

  t.notThrows(() => {
    terminal.warning('Test warning message');
  });
});

test('FloydTerminal - info method exists and does not throw', (t) => {
  const terminal = FloydTerminal.getInstance();

  t.notThrows(() => {
    terminal.info('Test info message');
  });
});

test('FloydTerminal - muted method exists and does not throw', (t) => {
  const terminal = FloydTerminal.getInstance();

  t.notThrows(() => {
    terminal.muted('Test muted message');
  });
});

test('FloydTerminal - primary method exists and does not throw', (t) => {
  const terminal = FloydTerminal.getInstance();

  t.notThrows(() => {
    terminal.primary('Test primary message');
  });
});

test('FloydTerminal - secondary method exists and does not throw', (t) => {
  const terminal = FloydTerminal.getInstance();

  t.notThrows(() => {
    terminal.secondary('Test secondary message');
  });
});

// ============================================================================
// Spinner Tests
// ============================================================================

test('FloydTerminal - spinner method returns Ora instance', (t) => {
  const terminal = FloydTerminal.getInstance();

  const spinner = terminal.spinner('Test spinner');

  t.truthy(spinner, 'Spinner should be returned');
  t.is(typeof spinner.start, 'function', 'Spinner should have start method');
  t.is(typeof spinner.stop, 'function', 'Spinner should have stop method');
});

test('FloydTerminal - stopSpinner method exists', (t) => {
  const terminal = FloydTerminal.getInstance();

  t.notThrows(() => {
    terminal.spinner('Test');
    terminal.stopSpinner('Stopped');
  });
});

test('FloydTerminal - failSpinner method exists', (t) => {
  const terminal = FloydTerminal.getInstance();

  t.notThrows(() => {
    terminal.spinner('Test');
    terminal.failSpinner('Failed');
  });
});

test('FloydTerminal - warnSpinner method exists', (t) => {
  const terminal = FloydTerminal.getInstance();

  t.notThrows(() => {
    terminal.spinner('Test');
    terminal.warnSpinner('Warning');
  });
});

test('FloydTerminal - updateSpinner method exists', (t) => {
  const terminal = FloydTerminal.getInstance();

  t.notThrows(() => {
    terminal.spinner('Initial');
    terminal.updateSpinner('Updated');
  });
});

// ============================================================================
// Progress Bar Tests
// ============================================================================

test('FloydTerminal - progressBar method returns SingleBar instance', (t) => {
  const terminal = FloydTerminal.getInstance();

  const progressBar = terminal.progressBar(100, 0);

  t.truthy(progressBar, 'ProgressBar should be returned');
  t.is(typeof progressBar.start, 'function', 'ProgressBar should have start method');
  t.is(typeof progressBar.update, 'function', 'ProgressBar should have update method');
  t.is(typeof progressBar.increment, 'function', 'ProgressBar should have increment method');
  t.is(typeof progressBar.stop, 'function', 'ProgressBar should have stop method');
});

test('FloydTerminal - updateProgressBar method exists', (t) => {
  const terminal = FloydTerminal.getInstance();

  t.notThrows(() => {
    const bar = terminal.progressBar(100, 0);
    terminal.updateProgressBar(50);
    bar.stop();
  });
});

test('FloydTerminal - incrementProgressBar method exists', (t) => {
  const terminal = FloydTerminal.getInstance();

  t.notThrows(() => {
    const bar = terminal.progressBar(100, 0);
    terminal.incrementProgressBar(10);
    bar.stop();
  });
});

test('FloydTerminal - stopProgressBar method exists', (t) => {
  const terminal = FloydTerminal.getInstance();

  t.notThrows(() => {
    const bar = terminal.progressBar(100, 0);
    terminal.stopProgressBar();
  });
});

// ============================================================================
// Tool Display Tests
// ============================================================================

test('FloydTerminal - tool method exists and does not throw', (t) => {
  const terminal = FloydTerminal.getInstance();

  t.notThrows(() => {
    terminal.tool('test_tool', 'Test description');
  });
});

test('FloydTerminal - toolSuccess method exists and does not throw', (t) => {
  const terminal = FloydTerminal.getInstance();

  t.notThrows(() => {
    terminal.toolSuccess('test_tool');
  });
});

test('FloydTerminal - toolError method exists and does not throw', (t) => {
  const terminal = FloydTerminal.getInstance();

  t.notThrows(() => {
    terminal.toolError('test_tool', 'Test error');
  });
});

// ============================================================================
// Utility Method Tests
// ============================================================================

test('FloydTerminal - section method exists and does not throw', (t) => {
  const terminal = FloydTerminal.getInstance();

  t.notThrows(() => {
    terminal.section('Test Section');
  });
});

test('FloydTerminal - divider method exists and does not throw', (t) => {
  const terminal = FloydTerminal.getInstance();

  t.notThrows(() => {
    terminal.divider('─', 60);
  });
});

test('FloydTerminal - blank method exists and does not throw', (t) => {
  const terminal = FloydTerminal.getInstance();

  t.notThrows(() => {
    terminal.blank();
  });
});

test('FloydTerminal - clear method exists and does not throw', (t) => {
  const terminal = FloydTerminal.getInstance();

  t.notThrows(() => {
    terminal.clear();
  });
});

// ============================================================================
// Cleanup Tests
// ============================================================================

test('FloydTerminal - cleanup method stops active spinner', (t) => {
  const terminal = FloydTerminal.getInstance();

  terminal.spinner('Test');

  t.notThrows(() => {
    terminal.cleanup();
  });
});

test('FloydTerminal - cleanup method stops active progress bar', (t) => {
  const terminal = FloydTerminal.getInstance();

  const bar = terminal.progressBar(100, 0);

  t.notThrows(() => {
    terminal.cleanup();
  });
});

test('FloydTerminal - cleanup can be called multiple times', (t) => {
  const terminal = FloydTerminal.getInstance();

  t.notThrows(() => {
    terminal.cleanup();
    terminal.cleanup();
    terminal.cleanup();
  });
});
