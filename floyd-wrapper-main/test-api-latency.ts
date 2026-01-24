/**
 * Test API Latency
 * Measures raw API response time without tool overhead
 */

import { config } from 'dotenv';
config();

async function testAPILatency() {
  const endpoint = process.env.FLOYD_GLM_ENDPOINT || 'https://api.z.ai/api/coding/paas/v4';
  const apiKey = process.env.FLOYD_GLM_API_KEY || '';
  const model = process.env.FLOYD_GLM_MODEL || 'glm-4.7';

  console.log('Testing API Latency...');
  console.log(`Endpoint: ${endpoint}`);
  console.log(`Model: ${model}`);

  const tests = [
    { name: 'Simple query', messages: [{ role: 'user', content: 'what is 2+2' }] },
    { name: 'Tool decision', messages: [{ role: 'user', content: 'read package.json' }] },
  ];

  for (const test of tests) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`Test: ${test.name}`);
    console.log(`${'='.repeat(60)}`);

    const startTime = Date.now();

    try {
      const response = await fetch(`${endpoint}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages: test.messages,
          max_tokens: 100,
          temperature: 0.1,
          stream: false,
        }),
      });

      const endTime = Date.now();
      const elapsed = endTime - startTime;

      if (response.ok) {
        const data = await response.json();
        const content = data.choices[0]?.message?.content || 'No content';

        console.log(`Response: "${content.substring(0, 100)}"`);
        console.log(`Time: ${elapsed}ms`);
      } else {
        console.log(`Error: ${response.status} ${response.statusText}`);
        console.log(`Time: ${elapsed}ms`);
      }
    } catch (error) {
      const elapsed = Date.now() - startTime;
      console.log(`Exception: ${error}`);
      console.log(`Time: ${elapsed}ms`);
    }

    // Delay between tests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log('\n' + '='.repeat(60));
  console.log('API latency test complete');
  console.log('If times are consistently >2s, the issue is API latency, not code');
}

testAPILatency().catch(console.error);
