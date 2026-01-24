import { loadConfig } from './dist/utils/config.js';
import { FloydAgentEngine } from './dist/agent/execution-engine.js';
import { config as dotenvConfig } from 'dotenv';

dotenvConfig();

async function test() {
  const config = await loadConfig();
  const engine = new FloydAgentEngine(config, {
    onToken: (token) => {
      process.stdout.write(token);
    },
    onToolStart: (tool, input) => {
      console.log(`\n[TOOL START] ${tool}`, input);
    },
    onToolComplete: (tool, result) => {
      console.log(`\n[TOOL DONE] ${tool}`);
    },
  });

  const result = await engine.execute('what is 2+2');
  console.log('\n\nFINAL RESULT:', result);
}

test().catch(console.error);
