/**
 * Manual Test Script for Floyd Wrapper
 * Tests the execution engine directly without CLI
 */

import { loadConfig } from './dist/utils/config.js';
import { FloydAgentEngine } from './dist/agent/execution-engine.js';
import { config as dotenvConfig } from 'dotenv';

// Load .env
dotenvConfig();

// Test configuration
const tests = [
  {
    name: 'Simple Math',
    input: 'what is 2+2',
    maxTime: 5000,
    checkToolUsage: false,
  },
  {
    name: 'File Counting',
    input: 'count all .md files in this repository',
    maxTime: 10000,
    checkToolUsage: true,
  },
  {
    name: 'File Reading',
    input: 'read package.json and tell me the version',
    maxTime: 10000,
    checkToolUsage: true,
  },
  {
    name: 'Git Status',
    input: 'show git status',
    maxTime: 10000,
    checkToolUsage: true,
  },
];

async function runTest(test) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`Test: ${test.name}`);
  console.log(`Input: "${test.input}"`);
  console.log(`Max Time: ${test.maxTime}ms`);
  console.log(`${'='.repeat(60)}\n`);

  try {
    // Load config
    const config = await loadConfig();

    // Create engine
    const engine = new FloydAgentEngine(config, {
      onToken: (token) => {
        process.stdout.write(token);
      },
      onToolStart: (tool, input) => {
        console.log(`\n[TOOL] ${tool}`);
      },
      onToolComplete: (tool, result) => {
        console.log(`[DONE] ${tool}`);
      },
    });

    // Run test with timeout
    const startTime = Date.now();
    const output = await Promise.race([
      engine.execute(test.input),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Timeout')), test.maxTime)
      ),
    ]);
    const endTime = Date.now();
    const duration = endTime - startTime;

    console.log(`\n\n[INFO] Response Time: ${duration}ms`);

    // Check success criteria
    const checks = [];

    // Response time check
    if (duration < test.maxTime) {
      checks.push({ name: 'Response Time', pass: true });
    } else {
      checks.push({ name: 'Response Time', pass: false, reason: `Exceeded ${test.maxTime}ms` });
    }

    // Tool usage check
    if (test.checkToolUsage) {
      const hasToolUsage = output.includes('[TOOL]') || output.includes('Running');
      checks.push({
        name: 'Tool Usage',
        pass: hasToolUsage,
        reason: hasToolUsage ? 'Tools used' : 'No tools detected',
      });
    }

    // CoT exposure check
    const hasCoT = output.match(/\*\*Analysis\*\*|\*\*Plan\*\*|^\d+\.\s/m);
    checks.push({
      name: 'No CoT Exposure',
      pass: !hasCoT,
      reason: hasCoT ? 'CoT patterns detected' : 'Clean response',
    });

    // Print results
    console.log('\n--- Test Results ---');
    let allPass = true;
    for (const check of checks) {
      const status = check.pass ? '✓ PASS' : '✗ FAIL';
      const color = check.pass ? '\x1b[32m' : '\x1b[31m';
      console.log(`${color}${status}\x1b[0m: ${check.name}${check.reason ? ` (${check.reason})` : ''}`);
      if (!check.pass) allPass = false;
    }

    return allPass;
  } catch (error) {
    console.error(`\n\x1b[31m[ERROR] Test failed: ${error.message}\x1b[0m`);
    return false;
  }
}

async function main() {
  console.log('\x1b[33m' + `
╔═══════════════════════════════════════════════════════════╗
║     Floyd Wrapper - Manual Test Suite                   ║
║     Direct Engine Testing (No CLI)                      ║
╚═══════════════════════════════════════════════════════════╝
` + '\x1b[0m');

  const results = [];

  for (const test of tests) {
    const pass = await runTest(test);
    results.push({ name: test.name, pass });
    // Small delay between tests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('FINAL SUMMARY');
  console.log('='.repeat(60));

  const passCount = results.filter(r => r.pass).length;
  const failCount = results.filter(r => !r.pass).length;

  results.forEach(result => {
    const status = result.pass ? '✓ PASS' : '✗ FAIL';
    const color = result.pass ? '\x1b[32m' : '\x1b[31m';
    console.log(`${color}${status}\x1b[0m: ${result.name}`);
  });

  console.log(`\nTotal: ${results.length} | Passed: ${passCount} | Failed: ${failCount}`);

  if (failCount === 0) {
    console.log('\n\x1b[32m✓ All tests passed!\x1b[0m\n');
    process.exit(0);
  } else {
    console.log('\n\x1b[31m✗ Some tests failed!\x1b[0m\n');
    process.exit(1);
  }
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
