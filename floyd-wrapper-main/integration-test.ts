/**
 * Integration Test - Real CLI Performance
 * Tests actual CLI behavior with timing
 */

import { config } from 'dotenv';
config();

import { FloydAgentEngine } from './dist/agent/execution-engine.js';
import { FloydConfig } from './dist/types.js';

const testConfig: FloydConfig = {
  glmApiKey: process.env.FLOYD_GLM_API_KEY || '',
  glmApiEndpoint: process.env.FLOYD_GLM_ENDPOINT || 'https://api.z.ai/api/coding/paas/v4',
  glmModel: process.env.FLOYD_GLM_MODEL || 'glm-4.7',
  maxTokens: parseInt(process.env.FLOYD_MAX_TOKENS || '8192'),
  temperature: parseFloat(process.env.FLOYD_TEMPERATURE || '0.3'),
  logLevel: 'error',
  permissionLevel: 'auto',
  cacheEnabled: true,
  maxTurns: 20,
};

async function runSingleTest(query: string): Promise<{ time: number; success: boolean; response: string }> {
  console.log(`\nTesting: "${query}"`);
  const engine = new FloydAgentEngine(testConfig);

  const startTime = Date.now();
  try {
    const response = await engine.execute(query);
    const elapsed = Date.now() - startTime;
    console.log(`✓ Time: ${elapsed}ms`);
    console.log(`✓ Response: "${response.substring(0, 100)}${response.length > 100 ? '...' : ''}"`);
    return { time: elapsed, success: true, response };
  } catch (error) {
    const elapsed = Date.now() - startTime;
    console.log(`✗ Error after ${elapsed}ms: ${error}`);
    return { time: elapsed, success: false, response: String(error) };
  }
}

async function main() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║     Floyd Wrapper Integration Test                        ║');
  console.log('╚════════════════════════════════════════════════════════════╝');

  const tests = [
    'what is 2+2',
    'read package.json',
    'show git status',
  ];

  const results = [];

  for (const query of tests) {
    const result = await runSingleTest(query);
    results.push({ query, ...result });
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║     Results Summary                                       ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  for (const result of results) {
    const status = result.success ? '✓' : '✗';
    const timeStatus = result.time < 5000 ? '✓' : '✗';
    console.log(`${status} ${result.query}: ${result.time}ms ${timeStatus}`);
  }

  const avgTime = results.reduce((sum, r) => sum + r.time, 0) / results.length;
  console.log(`\nAverage: ${avgTime.toFixed(0)}ms`);

  const allFast = results.every(r => r.time < 5000);
  if (allFast) {
    console.log('\n✓ All tests under 5s target!');
  } else {
    console.log('\n✗ Some tests exceeded 5s target');
  }
}

main().catch(console.error);
