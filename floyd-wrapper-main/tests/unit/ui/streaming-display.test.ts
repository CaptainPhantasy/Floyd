/**
 * StreamingDisplay Unit Tests
 *
 * Tests for StreamingDisplay class including singleton pattern,
 * token streaming, and in-place rendering.
 *
 * Note: These tests must run serially due to singleton pattern
 */

import test from 'ava';
import { StreamingDisplay } from '../../../src/ui/rendering.ts';

// ============================================================================
// Test Setup
// ============================================================================

/**
 * Clean up before each test
 */
test.beforeEach((t) => {
  // Reset singleton to ensure clean state for each test
  StreamingDisplay.resetInstance();
});

// ============================================================================
// Singleton Pattern Tests
// ============================================================================

test.serial('StreamingDisplay - getInstance returns singleton', (t) => {
  const instance1 = StreamingDisplay.getInstance();
  const instance2 = StreamingDisplay.getInstance();

  t.is(instance1, instance2, 'Should return the same instance');
});

test.serial('StreamingDisplay - multiple getInstance calls return same object', (t) => {
  const instances = Array.from({ length: 5 }, () => StreamingDisplay.getInstance());

  instances.forEach((instance) => {
    t.is(instance, instances[0], 'All instances should be the same');
  });
});

// ============================================================================
// Token Streaming Tests
// ============================================================================

test.serial('StreamingDisplay - appendToken adds text to buffer', (t) => {
  const renderer = StreamingDisplay.getInstance();

  renderer.appendToken('Hello');

  t.is(renderer.getBuffer(), 'Hello', 'Buffer should contain appended text');
});

test.serial('StreamingDisplay - appendToken can be called multiple times', (t) => {
  const renderer = StreamingDisplay.getInstance();

  renderer.appendToken('Hello');
  renderer.appendToken(' ');
  renderer.appendToken('World');

  t.is(renderer.getBuffer(), 'Hello World', 'Buffer should contain all appended text');
});

test.serial('StreamingDisplay - appendToken sets active state to true', (t) => {
  const renderer = StreamingDisplay.getInstance();

  renderer.appendToken('Test');

  t.true(renderer.isActive(), 'Renderer should be active after appendToken');
});

test.serial('StreamingDisplay - appendToken handles empty string', (t) => {
  const renderer = StreamingDisplay.getInstance();

  t.notThrows(() => {
    renderer.appendToken('');
  });

  t.is(renderer.getBuffer(), '', 'Empty string should not add to buffer');
});

test.serial('StreamingDisplay - appendToken handles special characters', (t) => {
  const renderer = StreamingDisplay.getInstance();

  t.notThrows(() => {
    renderer.appendToken('Hello\nWorld');
    renderer.appendToken('Test\tTab');
    renderer.appendToken('Emoji: 😀');
  });
});

// ============================================================================
// State Management Tests
// ============================================================================

test.serial('StreamingDisplay - isActive returns false initially', (t) => {
  const renderer = StreamingDisplay.getInstance();

  t.false(renderer.isActive(), 'Renderer should not be active initially');
});

test.serial('StreamingDisplay - isActive returns true after appendToken', (t) => {
  const renderer = StreamingDisplay.getInstance();

  renderer.appendToken('Test');

  t.true(renderer.isActive(), 'Renderer should be active after appendToken');
});

test.serial('StreamingDisplay - isActive returns false after finish', (t) => {
  const renderer = StreamingDisplay.getInstance();

  renderer.appendToken('Test');
  renderer.finish();

  t.false(renderer.isActive(), 'Renderer should not be active after finish');
});

test.serial('StreamingDisplay - isActive returns true after clear', (t) => {
  const renderer = StreamingDisplay.getInstance();

  renderer.appendToken('Test');
  renderer.clear();

  t.true(renderer.isActive(), 'Renderer should still be active after clear (only buffer is cleared)');
});

// ============================================================================
// Buffer Management Tests
// ============================================================================

test.serial('StreamingDisplay - getBuffer returns current content', (t) => {
  const renderer = StreamingDisplay.getInstance();

  t.is(renderer.getBuffer(), '', 'Buffer should be empty initially');

  renderer.appendToken('Test');
  t.is(renderer.getBuffer(), 'Test', 'Buffer should return current content');
});

test.serial('StreamingDisplay - clear resets buffer', (t) => {
  const renderer = StreamingDisplay.getInstance();

  renderer.appendToken('Test content');
  t.is(renderer.getBuffer(), 'Test content', 'Buffer should have content');

  renderer.clear();
  t.is(renderer.getBuffer(), '', 'Buffer should be empty after clear');
});

test.serial('StreamingDisplay - clear does not reset active state', (t) => {
  const renderer = StreamingDisplay.getInstance();

  renderer.appendToken('Test');
  t.true(renderer.isActive(), 'Should be active');

  renderer.clear();
  t.true(renderer.isActive(), 'Should still be active after clear (only buffer is cleared)');
});

// ============================================================================
// Finish Method Tests
// ============================================================================

test.serial('StreamingDisplay - finish method exists and does not throw', (t) => {
  const renderer = StreamingDisplay.getInstance();

  renderer.appendToken('Test');

  t.notThrows(() => {
    renderer.finish();
  });
});

test.serial('StreamingDisplay - finish can be called when not active', (t) => {
  const renderer = StreamingDisplay.getInstance();

  t.notThrows(() => {
    renderer.finish();
  });

  t.false(renderer.isActive(), 'Should remain inactive');
});

test.serial('StreamingDisplay - finish can be called multiple times', (t) => {
  const renderer = StreamingDisplay.getInstance();

  renderer.appendToken('Test');

  t.notThrows(() => {
    renderer.finish();
    renderer.finish();
    renderer.finish();
  });
});

test.serial('StreamingDisplay - finish resets buffer', (t) => {
  const renderer = StreamingDisplay.getInstance();

  renderer.appendToken('Test content');
  renderer.finish();

  t.is(renderer.getBuffer(), '', 'Buffer should be empty after finish');
});

test.serial('StreamingDisplay - finish resets active state', (t) => {
  const renderer = StreamingDisplay.getInstance();

  renderer.appendToken('Test');
  t.true(renderer.isActive(), 'Should be active before finish');

  renderer.finish();
  t.false(renderer.isActive(), 'Should not be active after finish');
});

// ============================================================================
// Integration Tests
// ============================================================================

test.serial('StreamingDisplay - multiple appendToken calls before finish', (t) => {
  const renderer = StreamingDisplay.getInstance();

  const tokens = ['Hello', ' ', 'World', '!'];

  tokens.forEach((token) => {
    renderer.appendToken(token);
  });

  t.is(renderer.getBuffer(), 'Hello World!', 'Buffer should contain all tokens');
  t.true(renderer.isActive(), 'Should be active');

  renderer.finish();

  t.false(renderer.isActive(), 'Should be inactive after finish');
  t.is(renderer.getBuffer(), '', 'Buffer should be empty after finish');
});

test.serial('StreamingDisplay - can restart after finish', (t) => {
  const renderer = StreamingDisplay.getInstance();

  // First round
  renderer.appendToken('First');
  t.true(renderer.isActive());
  renderer.finish();
  t.false(renderer.isActive());

  // Second round
  renderer.appendToken('Second');
  t.true(renderer.isActive(), 'Should be active again');
  t.is(renderer.getBuffer(), 'Second', 'Buffer should have new content');

  renderer.finish();
  t.false(renderer.isActive(), 'Should be inactive again');
});

test.serial('StreamingDisplay - handles rapid token appending', (t) => {
  const renderer = StreamingDisplay.getInstance();

  const rapidTokens = Array.from({ length: 100 }, (_, i) => `Token${i}`);

  t.notThrows(() => {
    rapidTokens.forEach((token) => {
      renderer.appendToken(token);
    });
  });

  t.true(renderer.isActive(), 'Should be active');
  // Buffer should contain all tokens (Token0-Token99)
  // Token0-Token9: 10 tokens × 6 chars = 60
  // Token10-Token99: 90 tokens × 7 chars = 630
  // Total: 690 characters
  t.is(renderer.getBuffer().length, 690, 'Buffer should contain all tokens');

  renderer.finish();
  t.false(renderer.isActive(), 'Should be inactive after finish');
});
