/**
 * FloydDesktop - Chrome Extension Detector
 *
 * Detects and validates the FloydChrome extension availability.
 * Used as a fallback when the desktop MCP server is unavailable.
 */

import { WebSocket } from 'ws';

/**
 * Result of extension detection
 */
export interface ExtensionDetectionResult {
  available: boolean;
  version?: string;
  port?: number;
  error?: string;
}

/**
 * Configuration for extension detection
 */
export interface ExtensionDetectorConfig {
  /** Base port to start checking (default: 3000) */
  basePort?: number;
  /** Maximum number of ports to check (default: 10) */
  maxPortAttempts?: number;
  /** Connection timeout in milliseconds (default: 2000) */
  connectionTimeout?: number;
}

/**
 * Chrome Extension Detector
 *
 * Attempts to detect the FloydChrome extension by:
 * 1. Checking for extension's WebSocket server on common ports
 * 2. Sending a ping to verify it's the Floyd extension
 */
export class ExtensionDetector {
  private readonly basePort: number;
  private readonly maxPortAttempts: number;
  private readonly connectionTimeout: number;

  constructor(config?: ExtensionDetectorConfig) {
    this.basePort = config?.basePort ?? 3000;
    this.maxPortAttempts = config?.maxPortAttempts ?? 10;
    this.connectionTimeout = config?.connectionTimeout ?? 2000;
  }

  /**
   * Detect if the FloydChrome extension is available
   *
   * @returns Promise<ExtensionDetectionResult> Detection result with availability status
   */
  async detect(): Promise<ExtensionDetectionResult> {
    // Try to connect to extension WebSocket server on each port
    for (let attempt = 0; attempt < this.maxPortAttempts; attempt++) {
      const port = this.basePort + attempt;

      try {
        const result = await this.tryConnect(port);
        if (result.available) {
          console.log(`[ExtensionDetector] Found FloydChrome extension on port ${port}`);
          return result;
        }
      } catch (error) {
        // Continue to next port
        continue;
      }
    }

    return {
      available: false,
      error: 'No FloydChrome extension detected on any port',
    };
  }

  /**
   * Try to connect to a specific port and verify it's the Floyd extension
   */
  private async tryConnect(port: number): Promise<ExtensionDetectionResult> {
    return new Promise((resolve) => {
      const ws = new WebSocket(`ws://localhost:${port}`);
      let resolved = false;

      // Set up timeout
      const timeout = setTimeout(() => {
        if (!resolved) {
          resolved = true;
          ws.close();
          resolve({ available: false, error: 'Connection timeout' });
        }
      }, this.connectionTimeout);

      ws.on('open', () => {
        if (resolved) return;
        resolved = true;
        clearTimeout(timeout);

        // Send a ping to verify it's the Floyd extension
        try {
          ws.send(
            JSON.stringify({
              jsonrpc: '2.0',
              id: 1,
              method: 'ping',
            })
          );
        } catch {
          ws.close();
          resolve({ available: false, error: 'Failed to send ping' });
        }
      });

      ws.on('message', (data: Buffer) => {
        if (resolved) return;
        resolved = true;
        clearTimeout(timeout);

        try {
          const response = JSON.parse(data.toString());

          // Check for pong response or valid JSON-RPC response
          if (
            response.pong === true ||
            (response.jsonrpc === '2.0' && response.result?.pong === true)
          ) {
            ws.close();
            resolve({
              available: true,
              port,
              version: response.version || 'unknown',
            });
          } else {
            ws.close();
            resolve({
              available: false,
              error: 'Unexpected response from server',
            });
          }
        } catch {
          ws.close();
          resolve({ available: false, error: 'Invalid JSON response' });
        }
      });

      ws.on('error', () => {
        if (resolved) return;
        resolved = true;
        clearTimeout(timeout);
        resolve({ available: false, error: 'Connection error' });
      });

      ws.on('close', () => {
        if (resolved) return;
        resolved = true;
        clearTimeout(timeout);
        resolve({ available: false, error: 'Connection closed' });
      });
    });
  }

  /**
   * Quick check if extension is available (without version detection)
   *
   * @returns Promise<boolean> True if extension is detected
   */
  async isAvailable(): Promise<boolean> {
    const result = await this.detect();
    return result.available;
  }
}
