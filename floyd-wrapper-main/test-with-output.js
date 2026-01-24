import { loadConfig } from './dist/utils/config.js';
import { FloydAgentEngine } from './dist/agent/execution-engine.js';
import { permissionManager } from './dist/permissions/permission-manager.js';
import { config as dotenvConfig } from 'dotenv';

dotenvConfig();

async function test() {
  const config = await loadConfig();
  permissionManager.setPromptFunction(async () => true);

  const engine = new FloydAgentEngine(config, {
    onToken: (token) => {
      process.stdout.write(token);
    },
    onToolStart: (tool, input) => {
      console.log('\n[TOOL START] ' + tool);
    },
    onToolComplete: (tool, result) => {
      console.log('\n[TOOL DONE] ' + tool);
    },
  });

  console.log('Testing: read package.json and tell me the version');
  const startTime = Date.now();

  try {
    const result = await Promise.race([
      engine.execute('read package.json and tell me the version'),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout after 20s')), 20000)),
    ]);
    const endTime = Date.now();
    console.log('\n\nSUCCESS! Duration:', endTime - startTime, 'ms');
    console.log('Result:', result);
    console.log('Result length:', result.length);
  } catch (error) {
    console.log('\n\nFAILED:', error.message);
  }
}

test();
