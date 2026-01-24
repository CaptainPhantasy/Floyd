#!/usr/bin/env -S node --loader tsx

/**
 * Generate Tool Documentation
 *
 * This script generates markdown documentation for all registered tools.
 */

import { writeFileSync } from 'fs';
import { generateAllToolsDocumentation, generateToolTable } from '../src/tools/docs.ts';

async function main() {
  console.log('Generating tool documentation...');

  // Generate full documentation
  const fullDocs = generateAllToolsDocumentation();

  // Write to docs/tools.md
  writeFileSync('docs/tools.md', fullDocs);

  console.log('✓ Generated docs/tools.md');

  // Generate tool table
  const table = generateToolTable();

  // Write to docs/TOOLS.md
  writeFileSync('docs/TOOLS.md', table);

  console.log('✓ Generated docs/TOOLS.md');
  console.log('\nDocumentation generated successfully!');
}

main().catch(error => {
  console.error('Error generating documentation:', error);
  process.exit(1);
});
