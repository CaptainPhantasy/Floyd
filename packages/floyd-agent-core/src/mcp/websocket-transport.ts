// WebSocket transport for MCP protocol
// Used for connecting Chrome extension and other WebSocket-based MCP clients

import type { Transport } from '@modelcontextprotocol/sdk/shared/transport.js';
import type { JSONRPCMessage } from '@modelcontextprotocol/sdk/types.js';
import { WebSocket as WS } from 'ws';

/**
 * WebSocketConnectionTransport implements the MCP Transport interface over WebSocket
 *
 * This allows MCP clients (like the Chrome extension) to connect via WebSocket
 * instead of stdio. The WebSocket must send/receive JSON-RPC messages.
 */
export class WebSocketConnectionTransport implements Transport {
  private _ws: WS;

  onclose?: () => void;
  onerror?: (error: Error) => void;
  onmessage?: (message: JSONRPCMessage) => void;

  constructor(ws: WS) {
    this._ws = ws;

    this._ws.on('message', (data) => {
      try {
        const json = JSON.parse(data.toString());
        this.onmessage?.(json);
      } catch (e) {
        this.onerror?.(e as Error);
      }
    });

    this._ws.on('close', () => {
      this.onclose?.();
    });

    this._ws.on('error', (err) => {
      this.onerror?.(err as Error);
    });
  }

  async start(): Promise<void> {
    if (this._ws.readyState === WS.OPEN) {
      return;
    }
    return new Promise((resolve, reject) => {
      this._ws.once('open', () => resolve());
      this._ws.once('error', reject);
    });
  }

  async send(message: JSONRPCMessage): Promise<void> {
    this._ws.send(JSON.stringify(message));
  }

  async close(): Promise<void> {
    this._ws.close();
  }
}
