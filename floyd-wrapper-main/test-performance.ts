/**
 * Performance Test Script for Floyd Wrapper
 * Measures actual response times for different query types
 */

import { config } from 'dotenv';
config(); // Load .env file

import { FloydAgentEngine } from './dist/agent/execution-engine.js';
import { FloydConfig } from './dist/types.js';

// Test configuration
const testConfig: FloydConfig = {
  glmApiKey: process.env.FLOYD_GLM_API_KEY || '',
  glmApiEndpoint: process.env.FLOYD_GLM_ENDPOINT || 'https://api.z.ai/api/coding/paas/v4',
  glmModel: process.env.FLOYD_GLM_MODEL || 'glm-4.7',
  maxTokens: parseInt(process.env.FLOYD_MAX_TOKENS || '100000'),
  temperature: parseFloat(process.env.FLOYD_TEMPERATURE || '0.3'),
  logLevel: 'error', // Reduce log noise
  permissionLevel: 'auto', // Auto-approve for testing
  cacheEnabled: false, // Disable cache for accurate measurements
  maxTurns: 20,
};

// Test cases
const testCases = [
  {
    name: 'Simple Query (No Tool)',
    query: 'what is 2+2',
    maxTime: 2000, // 2s
  },
  {
    name: 'File Operation',
    query: 'read package.json',
    maxTime: 5000, // 5s
  },
  {
    name: 'Git Operation',
    query: 'show git status',
    maxTime: 5000, // 5s
  },
  {
    name: 'Code Search',
    query: 'count .md files',
    maxTime: 5000, // 5s
  },
];

/**
 * Run a single test case
 */
async function runTest(testCase: { name: string; query: string; maxTime: number }): Promise<{
  name: string;
  query: string;
  time: number;
  passed: boolean;
  error?: string;
}> {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`Test: ${testCase.name}`);
  console.log(`Query: "${testCase.query}"`);
  console.log(`Max Allowed Time: ${testCase.maxTime}ms`);
  console.log(`${'='.repeat(60)}`);

  const engine = new FloydAgentEngine(testConfig);

  try {
    const startTime = Date.now();

    const response = await engine.execute(testCase.query);

    const endTime = Date.now();
    const elapsed = endTime - startTime;

    console.log(`\nResponse: "${response.trim()}"`);
    console.log(`Time: ${elapsed}ms`);

    const passed = elapsed <= testCase.maxTime;
    const status = passed ? '✅ PASS' : '❌ FAIL';

    console.log(`Status: ${status} (target: ${testCase.maxTime}ms)`);

    return {
      name: testCase.name,
      query: testCase.query,
      time: elapsed,
      passed,
    };
  } catch (error) {
    const elapsed = Date.now() - Date.now();
    console.log(`\nError: ${error}`);

    return {
      name: testCase.name,
      query: testCase.query,
      time: 0,
      passed: false,
      error: String(error),
    };
  }
}

/**
 * Main test runner
 */
async function main() {
  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║     Floyd Wrapper Performance Test Suite                  ║');
  console.log('╚════════════════════════════════════════════════════════════╝');

  console.log('\nConfiguration:');
  console.log(`- Model: ${testConfig.glmModel}`);
  console.log(`- Temperature: ${testConfig.temperature}`);
  console.log(`- Max Tokens: ${testConfig.maxTokens}`);
  console.log(`- Cache: ${testConfig.cacheEnabled ? 'enabled' : 'disabled'}`);

  const results = [];

  for (const testCase of testCases) {
    const result = await runTest(testCase);
    results.push(result);

    // Small delay between tests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  // Print summary
  console.log('\n\n╔════════════════════════════════════════════════════════════╗');
  console.log('║     Test Results Summary                                  ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  let passCount = 0;
  let failCount = 0;

  for (const result of results) {
    if (result.passed) {
      passCount++;
      console.log(`✅ ${result.name}: ${result.time}ms`);
    } else {
      failCount++;
      console.log(`❌ ${result.name}: ${result.time}ms (exceeded target)`);
    }
  }

  console.log(`\nTotal: ${passCount} passed, ${failCount} failed out of ${results.length} tests`);

  // Overall assessment
  const allPassed = results.every(r => r.passed);
  if (allPassed) {
    console.log('\n✅ ALL TESTS PASSED - Performance meets requirements!');
  } else {
    console.log('\n❌ SOME TESTS FAILED - Optimization needed!');
  }

  process.exit(allPassed ? 0 : 1);
}

main().catch(error => {
  console.error('Test runner error:', error);
  process.exit(1);
});
