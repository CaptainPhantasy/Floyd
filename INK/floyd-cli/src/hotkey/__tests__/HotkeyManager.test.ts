/**
 * HotkeyManager Tests
 *
 * Tests for the centralized hotkey management system that coordinates
 * all hotkey handlers with priority-based dispatch.
 */

import test from 'ava';
import { HotkeyManager } from '../HotkeyManager.ts';

test('registers handlers with priority', t => {
    const manager = new HotkeyManager();
    let results: string[] = [];

    const handler1 = {
        key: 'escape',
        priority: 1,
        action: () => {
            results.push('first');
            return false; // Stop propagation
        }
    };
    const handler2 = {
        key: 'escape',
        priority: 2,
        action: () => {
            results.push('second');
            return false;
        }
    };

    manager.register(handler1);
    manager.register(handler2);

    manager.handle('escape', { escape: true });

    // Only priority 1 should have executed (lower number = higher priority)
    t.deepEqual(results, ['first']);
});

test('prevents propagation when handled', t => {
    const manager = new HotkeyManager();
    let handled = false;

    manager.register({
        key: 'escape',
        priority: 1,
        action: () => {
            handled = true;
            return false; // Stop propagation
        }
    });

    const shouldPropagate = manager.handle('escape', { escape: true });

    t.true(handled);
    t.false(shouldPropagate); // Should NOT propagate
});

test('allows propagation when handler returns true', t => {
    const manager = new HotkeyManager();
    let firstCalled = false;
    let secondCalled = false;

    manager.register({
        key: 'escape',
        priority: 1,
        action: () => {
            firstCalled = true;
            return true; // Continue propagation
        }
    });

    manager.register({
        key: 'escape',
        priority: 2,
        action: () => {
            secondCalled = true;
            return false;
        }
    });

    const shouldPropagate = manager.handle('escape', { escape: true });

    t.true(firstCalled);
    t.true(secondCalled); // Second handler also called
    t.false(shouldPropagate); // Final handler stops propagation
});

test('respects context conditions', t => {
    const manager = new HotkeyManager();
    let callCount = 0;

    manager.register({
        key: '?',
        condition: (ctx) => ctx.inputEmpty === true,
        priority: 1,
        action: () => {
            callCount++;
            return false;
        }
    });

    // Should trigger when condition is met
    manager.handle('?', {}, { inputEmpty: true });
    t.is(callCount, 1);

    // Should not trigger when condition is not met
    manager.handle('?', {}, { inputEmpty: false });
    t.is(callCount, 1); // Still 1, second call didn't trigger
});

test('unregister removes handler by priority', t => {
    const manager = new HotkeyManager();
    let callCount = 0;

    manager.register({
        key: 'escape',
        priority: 1,
        action: () => {
            callCount += 1;
            return false;
        }
    });

    manager.register({
        key: 'escape',
        priority: 2,
        action: () => {
            callCount += 10;
            return false;
        }
    });

    // Both registered, priority 1 wins
    manager.handle('escape', { escape: true });
    t.is(callCount, 1);

    // Unregister priority 1
    manager.unregister('escape', 1);

    // Now priority 2 should win
    manager.handle('escape', { escape: true });
    t.is(callCount, 11);
});

test('handles multiple keys independently', t => {
    const manager = new HotkeyManager();
    const results: string[] = [];

    manager.register({
        key: 'a',
        priority: 1,
        action: () => {
            results.push('a');
            return false;
        }
    });

    manager.register({
        key: 'b',
        priority: 1,
        action: () => {
            results.push('b');
            return false;
        }
    });

    manager.handle('a', { a: true });
    manager.handle('b', { b: true });

    t.deepEqual(results, ['a', 'b']);
});

test('returns true for propagation when no handler registered', t => {
    const manager = new HotkeyManager();
    const shouldPropagate = manager.handle('unknown', { unknown: true });
    t.true(shouldPropagate); // Should propagate when no handler
});
