import { config as dotenvConfig } from 'dotenv';
dotenvConfig();

const apiKey = process.env.FLOYD_GLM_API_KEY;
const endpoint = process.env.FLOYD_GLM_ENDPOINT;
const model = process.env.FLOYD_GLM_MODEL;

console.log('Testing GLM API format...');
console.log('Endpoint:', endpoint);
console.log('Model:', model);

const response = await fetch(`${endpoint}/chat/completions`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${apiKey}`,
  },
  body: JSON.stringify({
    model: model,
    messages: [{ role: 'user', content: 'what is 2+2' }],
    tools: [{
      type: 'function',
      function: {
        name: 'calculator',
        description: 'Calculate math expressions',
        parameters: {
          type: 'object',
          properties: {
            expression: { type: 'string' }
          }
        }
      }
    }],
    stream: false,
  }),
});

const data = await response.json();
console.log('\n=== API Response ===');
console.log(JSON.stringify(data, null, 2));
