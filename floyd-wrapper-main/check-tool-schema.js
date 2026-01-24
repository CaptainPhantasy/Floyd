import { toolRegistry, registerCoreTools } from './dist/tools/index.js';

registerCoreTools();
const tools = toolRegistry.getAll();

console.log('=== Tool Schema Format ===');
console.log(`Total tools: ${tools.length}\n`);

const firstTool = tools[0];
console.log('First tool:', firstTool.name);
console.log('Schema:', JSON.stringify(firstTool.inputSchema, null, 2));
