/**
 * Final Test Suite for Floyd Wrapper
 */

import { loadConfig } from './dist/utils/config.js';
import { FloydAgentEngine } from './dist/agent/execution-engine.js';
import { permissionManager } from './dist/permissions/permission-manager.js';
import { config as dotenvConfig } from 'dotenv';

dotenvConfig();

// Track tool usage
let toolsUsed = [];

async function runTest(name, input, maxTime, expectTools) {
  console.log('\n' + '='.repeat(60));
  console.log('Test: ' + name);
  console.log('Input: "' + input + '"');
  console.log('Max Time: ' + maxTime + 'ms');
  console.log('='.repeat(60) + '\n');

  // Reset tool tracking
  toolsUsed = [];

  try {
    const config = await loadConfig();

    // Auto-approve all permissions for testing
    permissionManager.setPromptFunction(async () => true);

    const engine = new FloydAgentEngine(config, {
      onToken: (token) => {
        process.stdout.write(token);
      },
      onToolStart: (tool, input) => {
        toolsUsed.push(tool);
        console.log('\n[TOOL] ' + tool);
      },
      onToolComplete: (tool, result) => {
        console.log('[DONE] ' + tool);
      },
    });

    const startTime = Date.now();
    const output = await Promise.race([
      engine.execute(input),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Timeout')), maxTime)
      ),
    ]);
    const endTime = Date.now();
    const duration = endTime - startTime;

    console.log('\n\n[INFO] Response Time: ' + duration + 'ms');
    console.log('[INFO] Tools used: ' + (toolsUsed.join(', ') || 'none'));

    // Evaluate results
    const results = {
      responseTime: duration < maxTime,
      toolsUsed: expectTools ? toolsUsed.length > 0 : true,
      noCoT: !output.match(/\*\*Analysis\*\*|\*\*Plan\*\*|^\d+\.\s/m),
      concise: output.split('\n').length < 20,
    };

    console.log('\n--- Results ---');
    for (const [key, pass] of Object.entries(results)) {
      const status = pass ? 'PASS' : 'FAIL';
      console.log(status + ': ' + key);
    }

    const allPass = Object.values(results).every(v => v);
    return { pass: allPass, duration: duration, toolsUsed: toolsUsed.length };
  } catch (error) {
    console.error('\n[ERROR] ' + error.message);
    return { pass: false, duration: 0, toolsUsed: 0 };
  }
}

async function main() {
  console.log('\n' + '='.repeat(60));
  console.log('Floyd Wrapper - Final Test Suite');
  console.log('='.repeat(60) + '\n');

  const tests = [
    { name: 'Simple Math', input: 'what is 2+2', maxTime: 5000, expectTools: false },
    { name: 'File Counting', input: 'count all .md files in this repository', maxTime: 15000, expectTools: true },
    { name: 'File Reading', input: 'read package.json and tell me the version', maxTime: 10000, expectTools: true },
    { name: 'Git Status', input: 'show git status', maxTime: 10000, expectTools: true },
  ];

  const results = [];

  for (const test of tests) {
    const result = await runTest(test.name, test.input, test.maxTime, test.expectTools);
    results.push({ name: test.name, ...result });
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('FINAL SUMMARY');
  console.log('='.repeat(60));

  const passCount = results.filter(r => r.pass).length;
  const failCount = results.filter(r => !r.pass).length;

  results.forEach(result => {
    const status = result.pass ? 'PASS' : 'FAIL';
    console.log(status + ': ' + result.name + ' (' + result.duration + 'ms, ' + result.toolsUsed + ' tools)');
  });

  console.log('\nTotal: ' + results.length + ' | Passed: ' + passCount + ' | Failed: ' + failCount);

  if (failCount === 0) {
    console.log('\n✓ All tests passed!\n');
    process.exit(0);
  } else {
    console.log('\n✗ Some tests failed!\n');
    process.exit(1);
  }
}

main().catch(console.error);
