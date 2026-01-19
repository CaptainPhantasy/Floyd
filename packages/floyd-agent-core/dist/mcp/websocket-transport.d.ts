import type { Transport } from '@modelcontextprotocol/sdk/shared/transport.js';
import type { JSONRPCMessage } from '@modelcontextprotocol/sdk/types.js';
import { WebSocket as WS } from 'ws';
/**
 * WebSocketConnectionTransport implements the MCP Transport interface over WebSocket
 *
 * This allows MCP clients (like the Chrome extension) to connect via WebSocket
 * instead of stdio. The WebSocket must send/receive JSON-RPC messages.
 */
export declare class WebSocketConnectionTransport implements Transport {
    private _ws;
    onclose?: () => void;
    onerror?: (error: Error) => void;
    onmessage?: (message: JSONRPCMessage) => void;
    constructor(ws: WS);
    start(): Promise<void>;
    send(message: JSONRPCMessage): Promise<void>;
    close(): Promise<void>;
}
//# sourceMappingURL=websocket-transport.d.ts.map