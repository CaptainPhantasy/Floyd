/**
 * Mock GLM Client for Testing
 *
 * Provides mock implementation of GLMClient for unit and integration tests.
 */

import type { FloydConfig, StreamEvent } from '../../src/types.ts';
import type { GLMStreamOptions, TokenUsage } from '../../src/llm/glm-client.ts';

/**
 * Mock GLM Client
 */
export class MockGLMClient {
  private shouldFail: boolean = false;
  private failCount: number = 0;
  private delay: number = 0;
  private mockResponses: string[] = [];

  constructor(config: FloydConfig) {
    // Mock implementation
  }

  /**
   * Set mock responses
   */
  setMockResponses(responses: string[]): void {
    this.mockResponses = responses;
  }

  /**
   * Configure mock to fail
   */
  setShouldFail(shouldFail: boolean, failCount = 1): void {
    this.shouldFail = shouldFail;
    this.failCount = failCount;
  }

  /**
   * Set artificial delay for testing async behavior
   */
  setDelay(delay: number): void {
    this.delay = delay;
  }

  /**
   * Mock stream chat
   */
  async *streamChat(options: GLMStreamOptions): AsyncGenerator<StreamEvent> {
    // Simulate delay
    if (this.delay > 0) {
      await new Promise(resolve => setTimeout(resolve, this.delay));
    }

    // Simulate failure
    if (this.shouldFail && this.failCount > 0) {
      this.failCount--;
      yield {
        type: 'error',
        content: '',
        error: 'Mock API error',
      };
      throw new Error('Mock API error');
    }

    // Return mock responses
    const response = this.mockResponses.shift() || 'Mock response';
    for (const char of response) {
      yield { type: 'token', content: char };
    }

    yield { type: 'done', content: '' };
  }

  /**
   * Mock test connection
   */
  async testConnection(): Promise<boolean> {
    if (this.shouldFail) {
      return false;
    }
    return true;
  }

  /**
   * Mock token usage
   */
  getTokenUsage(): TokenUsage {
    return {
      inputTokens: 100,
      outputTokens: 50,
      totalTokens: 150,
    };
  }

  /**
   * Reset token usage
   */
  resetTokenUsage(): void {
    // Mock implementation
  }
}

/**
 * Create mock GLM client factory
 */
export function createMockGLMClient(config?: Partial<FloydConfig>): MockGLMClient {
  const defaultConfig: FloydConfig = {
    glmApiKey: 'test-key',
    glmApiEndpoint: 'https://test.api/v1',
    glmModel: 'test-model',
    maxTokens: 1000,
    temperature: 0.7,
    logLevel: 'info',
    cacheEnabled: false,
    cacheDir: '.test-cache',
  };

  return new MockGLMClient({ ...defaultConfig, ...config } as FloydConfig);
}

/**
 * Mock stream event factory
 */
export function createMockTokenEvent(text: string): StreamEvent {
  return { type: 'token', content: text };
}

export function createMockDoneEvent(): StreamEvent {
  return { type: 'done', content: '' };
}

export function createMockErrorEvent(error: string): StreamEvent {
  return { type: 'error', content: '', error };
}
