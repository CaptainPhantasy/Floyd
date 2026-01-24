import { config as dotenvConfig } from 'dotenv';
dotenvConfig();

const apiKey = process.env.FLOYD_GLM_API_KEY;
const endpoint = process.env.FLOYD_GLM_ENDPOINT;
const model = process.env.FLOYD_GLM_MODEL;

console.log('Testing GLM API STREAMING format...');
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
    stream: true,
  }),
});

const reader = response.body.getReader();
const decoder = new TextDecoder();
let buffer = '';

console.log('\n=== Streaming Events ===');
let eventCount = 0;

while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  
  buffer += decoder.decode(value, { stream: true });
  const lines = buffer.split('\n');
  buffer = lines.pop() || '';
  
  for (const line of lines) {
    if (!line.trim() || !line.startsWith('data: ')) continue;
    
    const data = line.slice(6).trim();
    if (data === '[DONE]') {
      console.log('\n=== STREAM COMPLETE ===');
      break;
    }
    
    try {
      const parsed = JSON.parse(data);
      eventCount++;
      
      // Only print first 20 events to avoid spam
      if (eventCount <= 20) {
        console.log(`\nEvent ${eventCount}:`);
        console.log(JSON.stringify(parsed, null, 2));
      }
    } catch (e) {
      console.log('Parse error:', e.message);
    }
  }
  
  if (eventCount > 25) break;
}

console.log(`\nTotal events captured: ${eventCount}`);
