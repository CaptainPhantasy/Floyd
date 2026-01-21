/**
 * Test Configuration Verification
 *
 * Basic test to verify the test infrastructure is working correctly.
 */

import test from 'ava';

test('tests can run', t => {
	t.true(true);
});

test('basic assertions work', t => {
	t.is(1 + 1, 2);
	t.true(true);
	t.false(false);
});

test('async tests work', async t => {
	const result = await Promise.resolve(42);
	t.is(result, 42);
});
