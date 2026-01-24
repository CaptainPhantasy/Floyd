import { loadConfig } from './dist/utils/config.js';
import { FloydAgentEngine } from './dist/agent/execution-engine.js';
import { permissionManager } from './dist/permissions/permission-manager.js';
import { config as dotenvConfig } from 'dotenv';

dotenvConfig();

async function main() {
  const config = await loadConfig();
  permissionManager.setPromptFunction(async () => true);

  // Create a SINGLE engine for all tests
  const engine = new FloydAgentEngine(config, {
    onToken: (token) => {
      process.stdout.write(token);
    },
    onToolStart: (tool, input) => {
      console.log('\n[TOOL] ' + tool);
    },
    onToolComplete: (tool, result) => {
      console.log('[DONE] ' + tool);
    },
  });

  const tests = [
    { name: 'Simple Math', input: 'what is 2+2', maxTime: 5000, expectTools: false },
    { name: 'File Counting', input: 'count all .md files in this repository', maxTime: 15000, expectTools: true },
    { name: 'File Reading', input: 'read package.json and tell me the version', maxTime: 10000, expectTools: true },
    { name: 'Git Status', input: 'show git status', maxTime: 10000, expectTools: true },
  ];

  const results = [];

  for (const test of tests) {
    console.log('\n' + '='.repeat(60));
    console.log('Test: ' + test.name);
    console.log('Input: "' + test.input + '"');
    console.log('Max Time: ' + test.maxTime + 'ms');
    console.log('='.repeat(60) + '\n');

    const startTime = Date.now();

    try {
      const output = await Promise.race([
        engine.execute(test.input),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Timeout')), test.maxTime)
        ),
      ]);

      const endTime = Date.now();
      const duration = endTime - startTime;

      console.log('\n[INFO] Response Time: ' + duration + 'ms');
      console.log('[INFO] Output length: ' + output.length + ' chars');

      const results2 = {
        responseTime: duration < test.maxTime,
        noCoT: !output.match(/\*\*Analysis\*\*|\*\*Plan\*\*|^\d+\.\s/m),
        concise: output.split('\n').length < 20,
      };

      console.log('\n--- Results ---');
      for (const [key, pass] of Object.entries(results2)) {
        console.log((pass ? 'PASS' : 'FAIL') + ': ' + key);
      }

      const allPass = Object.values(results2).every(v => v);
      results.push({ name: test.name, pass: allPass, duration: duration });
    } catch (error) {
      console.error('\n[ERROR] ' + error.message);
      results.push({ name: test.name, pass: false, duration: 0 });
    }

    await new Promise(resolve => setTimeout(resolve, 500));
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('FINAL SUMMARY');
  console.log('='.repeat(60));

  const passCount = results.filter(r => r.pass).length;
  const failCount = results.filter(r => !r.pass).length;

  results.forEach(result => {
    console.log((result.pass ? 'PASS' : 'FAIL') + ': ' + result.name + ' (' + result.duration + 'ms)');
  });

  console.log('\nTotal: ' + results.length + ' | Passed: ' + passCount + ' | Failed: ' + failCount);

  process.exit(failCount === 0 ? 0 : 1);
}

main().catch(console.error);
