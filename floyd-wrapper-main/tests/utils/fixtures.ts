/**
 * Test Data Fixtures
 *
 * Reusable test data fixtures for unit and integration tests.
 */

import type { FloydMessage, FloydConfig } from '../../src/types.ts';

// ============================================================================
// Message Fixtures
// ============================================================================

/**
 * Simple user message
 */
export const simpleUserMessage: FloydMessage = {
  role: 'user',
  content: 'Hello, how are you?',
};

/**
 * System message
 */
export const systemMessage: FloydMessage = {
  role: 'system',
  content: 'You are a helpful assistant.',
};

/**
 * Multi-turn conversation
 */
export const multiTurnConversation: FloydMessage[] = [
  {
    role: 'user',
    content: 'What is the capital of France?',
  },
  {
    role: 'assistant',
    content: 'The capital of France is Paris.',
  },
  {
    role: 'user',
    content: 'What is the population?',
  },
];

/**
 * Conversation with tool use
 */
export const conversationWithToolUse: FloydMessage[] = [
  {
    role: 'user',
    content: 'Read the file test.txt',
  },
  {
    role: 'assistant',
    content: 'I will read the file for you.',
    toolCalls: [
      {
        id: 'tool_1',
        name: 'read_file',
        input: { path: 'test.txt' },
      },
    ],
  },
  {
    role: 'user',
    content: 'Tool result: File content here',
  },
];

/**
 * Long conversation for stress testing
 */
export function createLongConversation(turns: number): FloydMessage[] {
  const messages: FloydMessage[] = [
    {
      role: 'system',
      content: 'You are a helpful assistant.',
    },
  ];

  for (let i = 0; i < turns; i++) {
    messages.push({
      role: 'user',
      content: `Turn ${i + 1}: User message`,
    });
    messages.push({
      role: 'assistant',
      content: `Turn ${i + 1}: Assistant response`,
    });
  }

  return messages;
}

// ============================================================================
// Configuration Fixtures
// ============================================================================

/**
 * Minimal valid configuration
 */
export const minimalConfig: FloydConfig = {
  glmApiKey: 'test-api-key',
  glmApiEndpoint: 'https://api.test.com/v1',
  glmModel: 'test-model',
  maxTokens: 1000,
  temperature: 0.7,
  logLevel: 'info',
  cacheEnabled: false,
  cacheDir: '.test-cache',
};

/**
 * Full configuration with all options
 */
export const fullConfig: FloydConfig = {
  glmApiKey: 'test-api-key',
  glmApiEndpoint: 'https://api.test.com/v1',
  glmModel: 'test-model',
  maxTokens: 4000,
  temperature: 0.8,
  logLevel: 'debug',
  cacheEnabled: true,
  cacheDir: '.test-cache',
  maxTurns: 20,
  tokenBudget: 100000,
};

/**
 * Development configuration
 */
export const devConfig: FloydConfig = {
  ...minimalConfig,
  logLevel: 'debug',
  cacheEnabled: false,
};

/**
 * Production configuration
 */
export const prodConfig: FloydConfig = {
  ...fullConfig,
  logLevel: 'info',
  cacheEnabled: true,
};

// ============================================================================
// Tool Fixtures
// ============================================================================

/**
 * Mock read_file tool
 */
export const mockReadFileTool = {
  name: 'read_file',
  description: 'Read the contents of a file',
  input_schema: {
    type: 'object',
    properties: {
      path: {
        type: 'string',
        description: 'Path to the file to read',
      },
    },
    required: ['path'],
  },
};

/**
 * Mock write_file tool
 */
export const mockWriteFileTool = {
  name: 'write_file',
  description: 'Write content to a file',
  input_schema: {
    type: 'object',
    properties: {
      path: {
        type: 'string',
        description: 'Path to the file to write',
      },
      content: {
        type: 'string',
        description: 'Content to write to the file',
      },
    },
    required: ['path', 'content'],
  },
};

/**
 * Mock search tool
 */
export const mockSearchTool = {
  name: 'search',
  description: 'Search the codebase',
  input_schema: {
    type: 'object',
    properties: {
      query: {
        type: 'string',
        description: 'Search query',
      },
    },
    required: ['query'],
  },
};

/**
 * All mock tools
 */
export const allMockTools = [
  mockReadFileTool,
  mockWriteFileTool,
  mockSearchTool,
];

// ============================================================================
// Error Fixtures
// ============================================================================

/**
 * API error response
 */
export const apiErrorResponse = {
  error: {
    type: 'invalid_request_error',
    message: 'Invalid API key provided',
  },
};

/**
 * Rate limit error response
 */
export const rateLimitErrorResponse = {
  error: {
    type: 'rate_limit_error',
    message: 'Rate limit exceeded',
  },
};

/**
 * Stream error fixture
 */
export const streamErrorFixture = {
  type: 'error',
  error: 'Connection lost',
};

// ============================================================================
// Stream Event Fixtures
// ============================================================================

/**
 * Token stream event
 */
export const tokenEventFixture = {
  type: 'token' as const,
  content: 'Hello',
};

/**
 * Done stream event
 */
export const doneEventFixture = {
  type: 'done' as const,
  content: '',
};

/**
 * Tool use stream event
 */
export const toolUseEventFixture = {
  type: 'tool_use' as const,
  content: '',
  toolUse: {
    id: 'tool_1',
    name: 'read_file',
    input: { path: 'test.txt' },
  },
};

// ============================================================================
// File System Fixtures
// ============================================================================

/**
 * Mock file content
 */
export const mockFileContent = 'This is a test file content.\nWith multiple lines.\n';

/**
 * Mock directory structure
 */
export const mockDirectoryStructure = {
  'src': {
    'index.ts': '// Main entry point\n',
    'cli.ts': '// CLI entry point\n',
  },
  'tests': {
    'test.ts': '// Test file\n',
  },
  'README.md': '# Test Project\n',
};

/**
 * Create mock files from structure
 */
export function createMockFilesFromStructure(
  structure: Record<string, unknown>,
  basePath = ''
): Map<string, string> {
  const files = new Map<string, string>();

  function traverse(obj: Record<string, unknown>, path: string) {
    for (const [name, value] of Object.entries(obj)) {
      const fullPath = path ? `${path}/${name}` : name;

      if (typeof value === 'string') {
        files.set(fullPath, value);
      } else if (typeof value === 'object' && value !== null) {
        traverse(value as Record<string, unknown>, fullPath);
      }
    }
  }

  traverse(structure, basePath);
  return files;
}
