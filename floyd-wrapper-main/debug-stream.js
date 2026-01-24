import { loadConfig } from './dist/utils/config.js';
import { GLMClient } from './dist/llm/glm-client.js';
import { config as dotenvConfig } from 'dotenv';

dotenvConfig();

async function test() {
  const config = await loadConfig();
  const client = new GLMClient(config);

  console.log('Testing tool use stream...');

  const stream = client.streamChat({
    messages: [{ role: 'user', content: 'read package.json' }],
    tools: [{
      type: 'function',
      function: {
        name: 'read_file',
        description: 'Read a file',
        parameters: {
          type: 'object',
          properties: {
            file_path: { type: 'string' }
          }
        }
      }
    }],
    maxTokens: 1000,
    temperature: 0.3,
  });

  let eventCount = 0;
  for await (const event of stream) {
    eventCount++;
    console.log(`Event ${eventCount}:`, event.type);
    if (event.toolUse) {
      console.log('  Tool use:', event.toolUse);
    }
    if (event.type === 'done') break;
    if (eventCount > 100) break;
  }

  console.log('\nTotal events:', eventCount);
}

test();
