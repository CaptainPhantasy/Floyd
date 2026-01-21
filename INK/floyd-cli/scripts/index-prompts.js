#!/usr/bin/env node

/**
 * Prompt Library Indexer
 * 
 * Scans /Volumes/Storage/Prompt Library and indexes all prompts
 * into Floyd's SUPERCACHE vault tier for fast retrieval
 */

import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { CacheManager } from '../src/cache/cache-manager.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

// Configuration
const PROMPT_LIBRARY_PATH = '/Volumes/Storage/Prompt Library';
const CATEGORIES = {
  AGENT: 'agent',
  TOOL: 'tool',
  PROMPT: 'prompt',
  SKILL: 'skill'
};

// ANSI colors
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

/**
 * Parse YAML frontmatter from markdown
 */
function parseFrontmatter(content) {
  const frontmatterRegex = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/;
  const match = content.match(frontmatterRegex);
  
  if (!match) {
    return { frontmatter: {}, content };
  }
  
  // Simple YAML parser (for basic frontmatter)
  const frontmatter = {};
  const lines = match[1].split('\n');
  
  for (const line of lines) {
    const colonIndex = line.indexOf(':');
    if (colonIndex > -1) {
      const key = line.slice(0, colonIndex).trim();
      let value = line.slice(colonIndex + 1).trim();
      
      // Handle arrays and quoted values
      if (value.startsWith('[') && value.endsWith(']')) {
        value = value.slice(1, -1).split(',').map(v => v.trim().replace(/"/g, ''));
      } else if (value.startsWith('"') && value.endsWith('"')) {
        value = value.slice(1, -1);
      }
      
      frontmatter[key] = value;
    }
  }
  
  return { frontmatter, content: match[2].trim() };
}

/**
 * Categorize prompt based on content and path
 */
function categorizePrompt(filePath, frontmatter, content) {
  // Check explicit category in frontmatter
  if (frontmatter.category) {
    return frontmatter.category.toLowerCase();
  }
  
  // Infer from filename
  const filename = path.basename(filePath, '.md').toLowerCase();
  if (filename.includes('agent')) return CATEGORIES.AGENT;
  if (filename.includes('tool')) return CATEGORIES.TOOL;
  if (filename.includes('skill')) return CATEGORIES.SKILL;
  
  // Infer from content
  const contentLower = content.toLowerCase();
  if (contentLower.includes('system role:') || contentLower.includes('you are a')) {
    return CATEGORIES.AGENT;
  }
  if (contentLower.includes('tool:') || contentLower.includes('command:')) {
    return CATEGORIES.TOOL;
  }
  if (contentLower.includes('skill:') || contentLower.includes('workflow:')) {
    return CATEGORIES.SKILL;
  }
  
  return CATEGORIES.PROMPT;
}

/**
 * Extract semantic keywords
 */
function extractKeywords(content, frontmatter) {
  const keywords = new Set();
  
  // From tags in frontmatter
  if (Array.isArray(frontmatter.tags)) {
    frontmatter.tags.forEach(tag => keywords.add(tag.toLowerCase()));
  }
  
  // From content (common technical terms)
  const techTerms = /(?:react|vue|angular|node|python|typescript|javascript|rust|go|docker|kubernetes|aws|gcp|azure|git|testing|tdd|cicd|api|rest|graphql|sql|nosql|mongodb|postgres|redis|mqtt|websocket|grpc|auth|jwt|oauth|encryption|security|performance|monitoring|observability|logging|debugging)/gi;
  const matches = content.match(techTerms);
  if (matches) {
    matches.forEach(term => keywords.add(term.toLowerCase()));
  }
  
  return Array.from(keywords);
}

/**
 * Calculate quality score (0-100)
 */
function calculateQualityScore(content, frontmatter) {
  let score = 50; // Base score
  
  // Frontmatter present
  if (Object.keys(frontmatter).length > 0) score += 10;
  
  // Has description
  if (frontmatter.description) score += 5;
  
  // Has tags
  if (Array.isArray(frontmatter.tags) && frontmatter.tags.length > 0) score += 5;
  
  // Content length (prefer prompts that are neither too short nor too long)
  const contentLength = content.length;
  if (contentLength > 100 && contentLength < 10000) score += 10;
  
  // Has examples
  if (content.includes('Example') || content.includes('example')) score += 10;
  
  // No hardcoded paths
  if (!content.includes('/Volumes/') && !content.includes('/Users/')) score += 10;
  
  return Math.min(100, score);
}

/**
 * Main indexing function
 */
async function indexPrompts() {
  log('\n🔍 PROMPT LIBRARY INDEXER', 'cyan');
  log('=' .repeat(40), 'cyan');
  log(`Source: ${PROMPT_LIBRARY_PATH}`, 'blue');
  log(`Target: ~/.floyd/.cache/vault/patterns/`, 'blue');
  log('');
  
  // Initialize cache manager
  const cacheManager = new CacheManager(projectRoot, {
    maxSize: {
      reasoning: 100,
      project: 500,
      vault: 2000
    }
  });
  
  // Find all markdown files
  const allFiles = await fs.readdir(PROMPT_LIBRARY_PATH, { withFileTypes: true });
  const mdFiles = [];
  
  for (const file of allFiles) {
    if (file.isFile() && (file.name.endsWith('.md') || file.name.endsWith('.markdown'))) {
      mdFiles.push(path.join(PROMPT_LIBRARY_PATH, file.name));
    } else if (file.isDirectory() && file.name !== '.obsidian') {
      // Recursively scan subdirectories
      const subFiles = await getAllMarkdownFiles(path.join(PROMPT_LIBRARY_PATH, file.name));
      mdFiles.push(...subFiles);
    }
  }
  
  log(`Found ${mdFiles.length} markdown files`, 'yellow');
  log('');
  
  // Process each file
  let indexed = 0;
  let skipped = 0;
  const categories = { agent: 0, tool: 0, prompt: 0, skill: 0 };
  
  for (const filePath of mdFiles) {
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      const { frontmatter, content: promptContent } = parseFrontmatter(content);
      
      const filename = path.basename(filePath, '.md');
      const category = categorizePrompt(filePath, frontmatter, promptContent);
      const keywords = extractKeywords(promptContent, frontmatter);
      const qualityScore = calculateQualityScore(promptContent, frontmatter);
      
      // Store in cache vault
      await cacheManager.storePattern(
        filename,
        promptContent,
        {
          category,
          tags: Array.isArray(frontmatter.tags) ? frontmatter.tags : [],
          keywords,
          qualityScore,
          filePath,
          title: frontmatter.title || filename,
          description: frontmatter.description || '',
          indexedAt: new Date().toISOString()
        }
      );
      
      indexed++;
      categories[category]++;
      
      // Log progress
      process.stdout.write(`\r✓ Indexed ${indexed}/${mdFiles.length} (${Math.round((indexed / mdFiles.length) * 100)}%)`);
    } catch (error) {
      log(`\n✗ Error indexing ${path.basename(filePath)}: ${error.message}`, 'yellow');
      skipped++;
    }
  }
  
  // Summary
  log(`\n\n✓ Indexed ${indexed} prompts`, 'green');
  if (skipped > 0) {
    log(`✗ Skipped ${skipped} files (errors)`, 'yellow');
  }
  
  log('\n📊 Category Breakdown:', 'cyan');
  log(`  Agents:   ${categories.agent}`, 'blue');
  log(`  Tools:    ${categories.tool}`, 'blue');
  log(`  Prompts:  ${categories.prompt}`, 'blue');
  log(`  Skills:   ${categories.skill}`, 'blue');
  
  // Get cache stats
  const stats = await cacheManager.getStats('vault');
  log('\n💾 Vault Statistics:', 'cyan');
  log(`  Total entries: ${stats[0].count}`, 'blue');
  log(`  Total size:    ${(stats[0].totalSize / 1024).toFixed(2)} KB`, 'blue');
  
  log('\n✨ Indexing complete!', 'green');
}

async function getAllMarkdownFiles(dir, files = []) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    
    if (entry.isDirectory() && entry.name !== '.obsidian') {
      await getAllMarkdownFiles(fullPath, files);
    } else if (entry.isFile() && (entry.name.endsWith('.md') || entry.name.endsWith('.markdown'))) {
      files.push(fullPath);
    }
  }
  
  return files;
}

// Run indexer
indexPrompts().catch(error => {
  log(`\n✗ Fatal error: ${error.message}`, 'yellow');
  console.error(error);
  process.exit(1);
});
