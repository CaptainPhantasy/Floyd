// WebSocket transport for MCP protocol
// Used for connecting Chrome extension and other WebSocket-based MCP clients
import { WebSocket as WS } from 'ws';
/**
 * WebSocketConnectionTransport implements the MCP Transport interface over WebSocket
 *
 * This allows MCP clients (like the Chrome extension) to connect via WebSocket
 * instead of stdio. The WebSocket must send/receive JSON-RPC messages.
 */
export class WebSocketConnectionTransport {
    _ws;
    onclose;
    onerror;
    onmessage;
    constructor(ws) {
        this._ws = ws;
        this._ws.on('message', (data) => {
            try {
                const json = JSON.parse(data.toString());
                this.onmessage?.(json);
            }
            catch (e) {
                this.onerror?.(e);
            }
        });
        this._ws.on('close', () => {
            this.onclose?.();
        });
        this._ws.on('error', (err) => {
            this.onerror?.(err);
        });
    }
    async start() {
        if (this._ws.readyState === WS.OPEN) {
            return;
        }
        return new Promise((resolve, reject) => {
            this._ws.once('open', () => resolve());
            this._ws.once('error', reject);
        });
    }
    async send(message) {
        this._ws.send(JSON.stringify(message));
    }
    async close() {
        this._ws.close();
    }
}
//# sourceMappingURL=websocket-transport.js.map