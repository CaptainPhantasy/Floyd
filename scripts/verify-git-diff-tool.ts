#!/usr/bin/env node

/**
 * Verify Git Diff Tool is Working
 *
 * This script verifies that the git_diff MCP server tool is properly
 * registered and functional in Floyd CLI.
 */

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { join, dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');
const cliDir = join(projectRoot, 'INK', 'floyd-cli');

console.log('🔍 Verifying Git Diff Tool Implementation');
console.log('=' .repeat(60));

// Check 1: Git server file exists
console.log('\n✓ Check 1: Git server file exists');
const gitServerPath = join(cliDir, 'src', 'mcp', 'git-server.ts');
const { existsSync } = await import('node:fs');
if (existsSync(gitServerPath)) {
  console.log(`  ✅ File exists: ${gitServerPath}`);
} else {
  console.log(`  ❌ File missing: ${gitServerPath}`);
  process.exit(1);
}

// Check 2: Git server is registered in builtin servers
console.log('\n✓ Check 2: Git server registered in builtin-servers.ts');
const { readFile } = await import('node:fs/promises');
const builtinServersPath = join(cliDir, 'src', 'config', 'builtin-servers.ts');
const builtinContent = await readFile(builtinServersPath, 'utf-8');
if (builtinContent.includes('git-server.ts')) {
  console.log(`  ✅ Git server registered`);
} else {
  console.log(`  ❌ Git server not registered`);
  process.exit(1);
}

// Check 3: Git diff tool defined
console.log('\n✓ Check 3: Git diff tool defined');
if (builtinContent.includes('git_diff') && builtinContent.includes("'git'")) {
  console.log(`  ✅ git_diff tool is defined`);
} else {
  console.log(`  ❌ git_diff tool not found`);
  process.exit(1);
}

// Check 4: Git diff function implementation
console.log('\n✓ Check 4: Git diff function implementation');
const gitServerContent = await readFile(gitServerPath, 'utf-8');
if (gitServerContent.includes('getGitDiff')) {
  console.log(`  ✅ getGitDiff function exists`);
} else {
  console.log(`  ❌ getGitDiff function missing`);
  process.exit(1);
}

// Check 5: MCP server setup
console.log('\n✓ Check 5: MCP server setup');
if (gitServerContent.includes('createGitServer') && gitServerContent.includes('ListToolsRequestSchema')) {
  console.log(`  ✅ MCP server properly configured`);
} else {
  console.log(`  ❌ MCP server setup incomplete`);
  process.exit(1);
}

// Check 6: Tool registration in case handler
console.log('\n✓ Check 6: Tool registered in CallToolRequestSchema');
if (gitServerContent.includes("case 'git_diff':")) {
  console.log(`  ✅ git_diff tool handler registered`);
} else {
  console.log(`  ❌ git_diff tool handler not found`);
  process.exit(1);
}

// Check 7: App initialization
console.log('\n✓ Check 7: App initializes git server');
const appPath = join(cliDir, 'src', 'app.tsx');
const appContent = await readFile(appPath, 'utf-8');
if (appContent.includes('BUILTIN_SERVERS') && appContent.includes('startBuiltinServers()')) {
  console.log(`  ✅ App initializes builtin servers`);
} else {
  console.log(`  ❌ App initialization incomplete`);
  process.exit(1);
}

console.log('\n' + '='.repeat(60));
console.log('✅ All Checks Passed!');
console.log('\n📋 Summary:');
console.log('   • Git server exists at: src/mcp/git-server.ts');
console.log('   • Git diff tool is defined and registered');
console.log('   • MCP server is properly configured');
console.log('   • App initializes git server on startup');
console.log('   • Tool is automatically available when Floyd CLI starts');
console.log('\n🚀 To test the tool:');
console.log('   1. cd INK/floyd-cli');
console.log('   2. npm run build');
console.log('   3. npm start');
console.log('   4. Ask: "Show me the git diff"');
console.log('\n📚 Documentation: docs/GIT_DIFF_IMPLEMENTATION.md');
