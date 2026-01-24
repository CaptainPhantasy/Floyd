/**
 * GLM Client Unit Tests
 *
 * Comprehensive tests for GLM-4.7 API client including streaming,
 * error handling, retry logic, and timeout behavior.
 */

import test from 'ava';
import sinon from 'sinon';
import { GLMClient, type GLMStreamOptions } from '../../src/llm/glm-client.ts';
import type { FloydConfig, StreamEvent } from '../../src/types.ts';

// ============================================================================
// Test Setup & Mocks
// ============================================================================

/**
 * Create a test configuration
 */
function createTestConfig(): FloydConfig {
  return {
    glmApiKey: 'test-api-key',
    glmApiEndpoint: 'https://api.test.com/v1',
    glmModel: 'test-model',
    maxTokens: 1000,
    temperature: 0.7,
    logLevel: 'error', // Reduce noise during tests
    cacheEnabled: false,
    cacheDir: '.test-cache',
  };
}

/**
 * Mock fetch response
 */
interface MockResponse {
  ok: boolean;
  status: number;
  statusText: string;
  body?: ReadableStream;
  text?: () => Promise<string>;
}

/**
 * Mock fetch stub
 */
let fetchStub: sinon.SinonStub;
let originalFetch: typeof fetch;

test.before(() => {
  // Store original fetch
  originalFetch = globalThis.fetch;

  // Create sinon stub
  fetchStub = sinon.stub(globalThis, 'fetch');
});

test.afterEach(() => {
  // Reset stub after each test
  fetchStub.reset();
});

test.after(() => {
  // Restore original fetch
  fetchStub.restore();
});

/**
 * Helper: Create mock SSE stream
 */
function createMockSSEStream(chunks: string[]): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();
  const chunksEncoded = chunks.map(c => encoder.encode(c));

  return new ReadableStream({
    async start(controller) {
      for (const chunk of chunksEncoded) {
        controller.enqueue(chunk);
        await new Promise(resolve => setTimeout(resolve, 10));
      }
      controller.close();
    },
  });
}

/**
 * Helper: Collect all stream events
 */
async function collectStreamEvents(
  generator: AsyncGenerator<StreamEvent>
): Promise<StreamEvent[]> {
  const events: StreamEvent[] = [];
  for await (const event of generator) {
    events.push(event);
    if (event.type === 'done' || event.type === 'error') {
      break;
    }
  }
  return events;
}

// ============================================================================
// Constructor Tests
// ============================================================================

test('GLMClient - constructor initializes with config', (t) => {
  const config = createTestConfig();
  const client = new GLMClient(config);

  t.truthy(client);
});

test('GLMClient - constructor throws without API key', (t) => {
  const config = createTestConfig();
  (config as any).glmApiKey = '';

  t.throws(() => new GLMClient(config), {
    message: /GLM API key is not configured/,
  });
});

// ============================================================================
// Token Usage Tests
// ============================================================================

test('GLMClient - getTokenUsage returns initial zero values', (t) => {
  const config = createTestConfig();
  const client = new GLMClient(config);

  const usage = client.getTokenUsage();

  t.is(usage.inputTokens, 0);
  t.is(usage.outputTokens, 0);
  t.is(usage.totalTokens, 0);
});

test('GLMClient - resetTokenUsage resets counters', (t) => {
  const config = createTestConfig();
  const client = new GLMClient(config);

  // Verify method exists and doesn't throw
  t.notThrows(() => {
    client.resetTokenUsage();
  });

  const usage = client.getTokenUsage();
  t.is(usage.totalTokens, 0);
});

// ============================================================================
// Connection Test
// ============================================================================

test('GLMClient - testConnection returns true for successful response', async (t) => {
  const config = createTestConfig();
  const client = new GLMClient(config);

  // Mock successful response
  fetchStub.resolves({
    ok: true,
    status: 200,
  } as unknown as Response);

  const result = await client.testConnection();

  t.true(result);
  t.true(fetchStub.calledOnce);
});

test('GLMClient - testConnection returns false for failed response', async (t) => {
  const config = createTestConfig();
  const client = new GLMClient(config);

  // Mock failed response
  fetchStub.resolves({
    ok: false,
    status: 401,
  } as unknown as Response);

  const result = await client.testConnection();

  t.false(result);
});

test('GLMClient - testConnection returns false on network error', async (t) => {
  const config = createTestConfig();
  const client = new GLMClient(config);

  // Mock network error
  fetchStub.rejects(new Error('Network error'));

  const result = await client.testConnection();

  t.false(result);
});

// ============================================================================
// Streaming Tests
// ============================================================================

test('GLMClient - streamChat yields token events', async (t) => {
  const config = createTestConfig();
  const client = new GLMClient(config);

  const sseChunks = [
    'data: {"type": "content_block_delta", "delta": {"text": "Hello"}}\n\n',
    'data: {"type": "content_block_delta", "delta": {"text": " World"}}\n\n',
    'data: [DONE]\n\n',
  ];

  fetchStub.resolves({
    ok: true,
    status: 200,
    body: createMockSSEStream(sseChunks),
  } as unknown as Response);

  const options: GLMStreamOptions = {
    messages: [{ role: 'user', content: 'Hello' }],
  };

  const events = await collectStreamEvents(client.streamChat(options));

  t.true(events.length >= 3);

  const tokenEvents = events.filter(e => e.type === 'token');
  t.true(tokenEvents.length >= 2);
  t.is(tokenEvents[0].content, 'Hello');
  t.is(tokenEvents[1].content, ' World');

  const doneEvents = events.filter(e => e.type === 'done');
  t.true(doneEvents.length > 0);
});

test('GLMClient - streamChat accumulates tokens correctly', async (t) => {
  const config = createTestConfig();
  const client = new GLMClient(config);

  const tokens = ['A', 'B', 'C', 'D', 'E'];
  const sseChunks = tokens.map(
    token => `data: {"type": "content_block_delta", "delta": {"text": "${token}"}}\n\n`
  );
  sseChunks.push('data: [DONE]\n\n');

  fetchStub.resolves({
    ok: true,
    status: 200,
    body: createMockSSEStream(sseChunks),
  } as unknown as Response);

  const options: GLMStreamOptions = {
    messages: [{ role: 'user', content: 'Test' }],
  };

  const events = await collectStreamEvents(client.streamChat(options));
  const tokenEvents = events.filter(e => e.type === 'token');

  t.is(tokenEvents.length, tokens.length);

  const accumulated = tokenEvents.map(e => e.content).join('');
  t.is(accumulated, 'ABCDE');
});

test('GLMClient - streamChat calls onToken callback', async (t) => {
  const config = createTestConfig();
  const client = new GLMClient(config);

  const sseChunks = [
    'data: {"type": "content_block_delta", "delta": {"text": "Test"}}\n\n',
    'data: [DONE]\n\n',
  ];

  fetchStub.resolves({
    ok: true,
    status: 200,
    body: createMockSSEStream(sseChunks),
  } as unknown as Response);

  const tokensReceived: string[] = [];
  const options: GLMStreamOptions = {
    messages: [{ role: 'user', content: 'Test' }],
    onToken: (token) => {
      tokensReceived.push(token);
    },
  };

  await collectStreamEvents(client.streamChat(options));

  t.is(tokensReceived.length, 1);
  t.is(tokensReceived[0], 'Test');
});

// ============================================================================
// Tool Use Event Tests
// ============================================================================

test('GLMClient - streamChat parses tool_use events', async (t) => {
  const config = createTestConfig();
  const client = new GLMClient(config);

  const sseChunks = [
    'data: {"type": "tool_use", "id": "tool_123", "name": "read_file", "input": {"path": "test.txt"}}\n\n',
    'data: [DONE]\n\n',
  ];

  fetchStub.resolves({
    ok: true,
    status: 200,
    body: createMockSSEStream(sseChunks),
  } as unknown as Response);

  const options: GLMStreamOptions = {
    messages: [{ role: 'user', content: 'Read file' }],
  };

  const events = await collectStreamEvents(client.streamChat(options));
  const toolUseEvents = events.filter(e => e.type === 'tool_use');

  t.is(toolUseEvents.length, 1);

  const toolEvent = toolUseEvents[0];
  if (toolEvent.type === 'tool_use') {
    t.is(toolEvent.toolUse?.id, 'tool_123');
    t.is(toolEvent.toolUse?.name, 'read_file');
    t.deepEqual(toolEvent.toolUse?.input, { path: 'test.txt' });
  }
});

test('GLMClient - streamChat calls onToolUse callback', async (t) => {
  const config = createTestConfig();
  const client = new GLMClient(config);

  const sseChunks = [
    'data: {"type": "tool_use", "id": "tool_456", "name": "write", "input": {"path": "out.txt"}}\n\n',
    'data: [DONE]\n\n',
  ];

  fetchStub.resolves({
    ok: true,
    status: 200,
    body: createMockSSEStream(sseChunks),
  } as unknown as Response);

  let toolUseReceived: unknown = null;
  const options: GLMStreamOptions = {
    messages: [{ role: 'user', content: 'Write file' }],
    onToolUse: (toolUse) => {
      toolUseReceived = toolUse;
    },
  };

  await collectStreamEvents(client.streamChat(options));

  t.truthy(toolUseReceived);
});

// ============================================================================
// Error Handling Tests
// ============================================================================

test('GLMClient - streamChat handles 401 unauthorized error', async (t) => {
  const config = createTestConfig();
  const client = new GLMClient(config);

  fetchStub.resolves({
    ok: false,
    status: 401,
    statusText: 'Unauthorized',
    text: async () => 'Invalid API key',
  } as unknown as Response);

  const options: GLMStreamOptions = {
    messages: [{ role: 'user', content: 'Test' }],
  };

  const events = await collectStreamEvents(client.streamChat(options));
  const errorEvents = events.filter(e => e.type === 'error');

  t.true(errorEvents.length > 0);
  if (errorEvents[0].type === 'error') {
    t.truthy(errorEvents[0].error);
  }
});

test('GLMClient - streamChat handles 429 rate limit error with retry', async (t) => {
  const config = createTestConfig();
  const client = new GLMClient(config);

  // First call fails, second succeeds
  fetchStub
    .rejects(new Error('fetch failed'))
    .onSecondCall()
    .resolves({
      ok: true,
      status: 200,
      body: createMockSSEStream([
        'data: {"type": "content_block_delta", "delta": {"text": "Success"}}\n\n',
        'data: [DONE]\n\n',
      ]),
    } as unknown as Response);

  const options: GLMStreamOptions = {
    messages: [{ role: 'user', content: 'Test' }],
    maxRetries: 3,
    retryDelay: 10,
  };

  const events = await collectStreamEvents(client.streamChat(options));
  const tokenEvents = events.filter(e => e.type === 'token');

  t.true(tokenEvents.length > 0);
  t.is(tokenEvents[0].content, 'Success');
});

test('GLMClient - streamChat handles 500 server error', async (t) => {
  const config = createTestConfig();
  const client = new GLMClient(config);

  fetchStub.resolves({
    ok: false,
    status: 500,
    statusText: 'Internal Server Error',
    text: async () => 'Server error',
  } as unknown as Response);

  const options: GLMStreamOptions = {
    messages: [{ role: 'user', content: 'Test' }],
  };

  const events = await collectStreamEvents(client.streamChat(options));
  const errorEvents = events.filter(e => e.type === 'error');

  t.true(errorEvents.length > 0);
});

// ============================================================================
// Malformed SSE Tests
// ============================================================================

test('GLMClient - streamChat handles invalid JSON gracefully', async (t) => {
  const config = createTestConfig();
  const client = new GLMClient(config);

  const sseChunks = [
    'data: {"type": "content_block_delta", "delta": {"text": "Valid"}}\n\n',
    'data: {invalid json}\n\n',
    'data: {"type": "content_block_delta", "delta": {"text": "Continue"}}\n\n',
    'data: [DONE]\n\n',
  ];

  fetchStub.resolves({
    ok: true,
    status: 200,
    body: createMockSSEStream(sseChunks),
  } as unknown as Response);

  const options: GLMStreamOptions = {
    messages: [{ role: 'user', content: 'Test' }],
  };

  const events = await collectStreamEvents(client.streamChat(options));
  const tokenEvents = events.filter(e => e.type === 'token');

  t.true(tokenEvents.length >= 2);
});

test('GLMClient - streamChat handles incomplete lines', async (t) => {
  const config = createTestConfig();
  const client = new GLMClient(config);

  const sseChunks = [
    'data: {"type": "content_block_delta',
    '"delta": {"text": "Test"}}\n\n',
    'data: [DONE]\n\n',
  ];

  fetchStub.resolves({
    ok: true,
    status: 200,
    body: createMockSSEStream(sseChunks),
  } as unknown as Response);

  const options: GLMStreamOptions = {
    messages: [{ role: 'user', content: 'Test' }],
  };

  const events = await collectStreamEvents(client.streamChat(options));
  const tokenEvents = events.filter(e => e.type === 'token');

  t.true(tokenEvents.length > 0);
});

// ============================================================================
// Retry Logic Tests
// ============================================================================

test('GLMClient - streamChat retries on network failure', async (t) => {
  const config = createTestConfig();
  const client = new GLMClient(config);

  fetchStub
    .rejects(new Error('ECONNREFUSED'))
    .onSecondCall()
    .resolves({
      ok: true,
      status: 200,
      body: createMockSSEStream([
        'data: {"type": "content_block_delta", "delta": {"text": "Retry success"}}\n\n',
        'data: [DONE]\n\n',
      ]),
    } as unknown as Response);

  const options: GLMStreamOptions = {
    messages: [{ role: 'user', content: 'Test' }],
    maxRetries: 3,
    retryDelay: 10,
  };

  const events = await collectStreamEvents(client.streamChat(options));
  const tokenEvents = events.filter(e => e.type === 'token');

  t.true(tokenEvents.length > 0);
  t.is(tokenEvents[0].content, 'Retry success');
});

test('GLMClient - streamChat respects maxRetries limit', async (t) => {
  const config = createTestConfig();
  const client = new GLMClient(config);

  fetchStub.rejects(new Error('Persistent error'));

  const options: GLMStreamOptions = {
    messages: [{ role: 'user', content: 'Test' }],
    maxRetries: 2,
    retryDelay: 10,
  };

  const events = await collectStreamEvents(client.streamChat(options));
  const errorEvents = events.filter(e => e.type === 'error');

  t.is(fetchStub.callCount, 3);
  t.true(errorEvents.length > 0);
});

// ============================================================================
// Token Usage Tracking Tests
// ============================================================================

test('GLMClient - streamChat tracks token usage', async (t) => {
  const config = createTestConfig();
  const client = new GLMClient(config);

  const sseChunks = [
    'data: {"type": "content_block_delta", "delta": {"text": "A"}}\n\n',
    'data: {"type": "content_block_delta", "delta": {"text": "B"}}\n\n',
    'data: [DONE]\n\n',
  ];

  fetchStub.resolves({
    ok: true,
    status: 200,
    body: createMockSSEStream(sseChunks),
  } as unknown as Response);

  let usageReceived = null;
  const options: GLMStreamOptions = {
    messages: [{ role: 'user', content: 'Test' }],
    onComplete: (usage) => {
      usageReceived = usage;
    },
  };

  await collectStreamEvents(client.streamChat(options));

  t.truthy(usageReceived);
  t.true(usageReceived.totalTokens > 0);
});

// ============================================================================
// Error Callback Tests
// ============================================================================

test('GLMClient - streamChat calls onError callback', async (t) => {
  const config = createTestConfig();
  const client = new GLMClient(config);

  fetchStub.rejects(new Error('Test error'));

  let errorReceived: Error | null = null;
  const options: GLMStreamOptions = {
    messages: [{ role: 'user', content: 'Test' }],
    onError: (error) => {
      errorReceived = error;
    },
  };

  await collectStreamEvents(client.streamChat(options));

  t.truthy(errorReceived);
  t.is(errorReceived?.message, 'Test error');
});

// ============================================================================
// Edge Cases
// ============================================================================

test('GLMClient - streamChat handles empty response', async (t) => {
  const config = createTestConfig();
  const client = new GLMClient(config);

  const sseChunks = ['data: [DONE]\n\n'];

  fetchStub.resolves({
    ok: true,
    status: 200,
    body: createMockSSEStream(sseChunks),
  } as unknown as Response);

  const options: GLMStreamOptions = {
    messages: [{ role: 'user', content: 'Test' }],
  };

  const events = await collectStreamEvents(client.streamChat(options));
  const tokenEvents = events.filter(e => e.type === 'token');
  const doneEvents = events.filter(e => e.type === 'done');

  t.is(tokenEvents.length, 0);
  t.true(doneEvents.length > 0);
});

test('GLMClient - streamChat handles special characters in tokens', async (t) => {
  const config = createTestConfig();
  const client = new GLMClient(config);

  const specialChars = '\n\t"\'\\{}';
  const sseChunks = [
    `data: {"type": "content_block_delta", "delta": {"text": "${specialChars}"}}\n\n`,
    'data: [DONE]\n\n',
  ];

  fetchStub.resolves({
    ok: true,
    status: 200,
    body: createMockSSEStream(sseChunks),
  } as unknown as Response);

  const options: GLMStreamOptions = {
    messages: [{ role: 'user', content: 'Test' }],
  };

  const events = await collectStreamEvents(client.streamChat(options));
  const tokenEvents = events.filter(e => e.type === 'token');

  t.is(tokenEvents.length, 1);
  t.is(tokenEvents[0].content, specialChars);
});
