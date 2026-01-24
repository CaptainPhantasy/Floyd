import { toolRegistry } from './dist/tools/index.js';

const tools = toolRegistry.getAll();

console.log('=== Registered Tools ===');
console.log(`Total tools: ${tools.length}`);
console.log('\nFirst 5 tools:');
tools.slice(0, 5).forEach(tool => {
  console.log(`\nTool: ${tool.name}`);
  console.log('Description:', tool.description);
  console.log('Input schema:', JSON.stringify(tool.inputSchema, null, 2));
});
