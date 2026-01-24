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

  console.log('Testing: what is 2+2');
  const startTime = Date.now();
  
  try {
    const result = await Promise.race([
      engine.execute('what is 2+2'),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout after 8s')), 8000)),
    ]);
    const endTime = Date.now();
    console.log('\n\nSUCCESS! Duration:', endTime - startTime, 'ms');
    console.log('Result:', result);
  } catch (error) {
    console.log('\n\nFAILED:', error.message);
  }
}

test();
