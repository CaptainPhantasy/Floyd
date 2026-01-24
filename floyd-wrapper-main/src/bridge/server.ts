/**
 * Floyd Mobile Bridge - Main Server
 *
 * Purpose: Express + WebSocket server for mobile remote control
 *
 * Key Features:
 * - HTTP API for QR code generation
 * - WebSocket server for real-time communication
 * - NGROK tunnel integration
 * - JWT token verification
 * - Session routing to FloydAgentEngine
 */

import express from 'express';
import { createServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import { v4 as uuidv4 } from 'uuid';
import { QRGenerator } from './qr-generator.js';
import { TokenManager } from './token-manager.js';
import { NgrokManager } from './ngrok-manager.js';
import { SessionRouter } from './session-router.js';
import type { BridgeConfig, QRHandshakeData, TokenPayload } from './types.js';

/**
 * Floyd Mobile Bridge Server
 *
 * Architecture:
 * 1. Express HTTP API (port 4000)
 *    - POST /api/bridge/pairing - Generate QR code for mobile pairing
 *    - GET /api/bridge/status - Check bridge status
 *
 * 2. WebSocket Server (port 4000/ws)
 *    - Real-time communication with mobile
 *    - JWT token verification on connection
 *    - Message routing to FloydAgentEngine
 *
 * 3. NGROK Tunnel
 *    - HTTPS tunnel to public internet
 *    - Used in QR code for mobile scanning
 */
export class BridgeServer {
  private app: express.Application;
  private server: any;
  private wss: WebSocketServer;
  private qrGenerator: QRGenerator;
  private tokenManager: TokenManager;
  private ngrokManager: NgrokManager;
  private sessionRouter: SessionRouter;
  private config: BridgeConfig;
  private port: number;

  constructor(config: BridgeConfig) {
    this.config = config;
    this.port = config.port || 4000;

    // Initialize Express app
    this.app = express();
    this.server = createServer(this.app);

    // Initialize WebSocket server on /ws path
    this.wss = new WebSocketServer({ server: this.server, path: '/ws' });

    // Initialize managers
    this.qrGenerator = new QRGenerator();
    this.tokenManager = new TokenManager({ secret: config.jwtSecret });
    this.ngrokManager = new NgrokManager({
      port: this.port,
      authtoken: config.ngrokAuthToken,
      domain: config.ngrokDomain
    });
    this.sessionRouter = new SessionRouter();

    // Setup middleware, routes, and WebSocket
    this.setupMiddleware();
    this.setupRoutes();
    this.setupWebSocket();
  }

  /**
   * Setup Express middleware
   */
  private setupMiddleware(): void {
    // Parse JSON bodies
    this.app.use(express.json());

    // Request logging middleware
    this.app.use((req, res, next) => {
      console.log(`[HTTP] ${req.method} ${req.path}`);
      next();
    });
  }

  /**
   * Setup HTTP routes
   */
  private setupRoutes(): void {
    // POST /api/bridge/pairing - Initiate pairing, return QR code
    this.app.post('/api/bridge/pairing', async (req, res) => {
      try {
        const { sessionId, deviceName } = req.body;

        // Validate request
        if (!sessionId) {
          return res.status(400).json({
            success: false,
            error: 'sessionId is required'
          });
        }

        console.log(`[Bridge] Pairing request for session: ${sessionId}`);

        // Generate JWT token
        const deviceId = uuidv4();
        const token = this.tokenManager.generateSessionToken(
          deviceId,
          sessionId,
          deviceName || 'Unknown Device'
        );

        // Generate QR code
        const ngrokUrl = this.ngrokManager.getUrl();
        if (!ngrokUrl) {
          return res.status(500).json({
            success: false,
            error: 'NGROK tunnel not established'
          });
        }

        const { qrDataUrl, handshakeData } = await this.qrGenerator.generateHandshakeQR(
          ngrokUrl,
          sessionId,
          token,
          this.config.qrTTLMinutes || 5
        );

        res.json({
          success: true,
          qrDataUrl,
          handshakeData
        });

        console.log(`[Bridge] QR code generated for session: ${sessionId}`);
      } catch (error) {
        console.error('[Bridge] Pairing error:', error);
        res.status(500).json({
          success: false,
          error: error instanceof Error ? error.message : String(error)
        });
      }
    });

    // GET /api/bridge/status - Check bridge status
    this.app.get('/api/bridge/status', (req, res) => {
      res.json({
        running: true,
        port: this.port,
        ngrokUrl: this.ngrokManager.getUrl(),
        ngrokConnected: this.ngrokManager.isConnected(),
        wsConnected: this.wss.clients.size
      });
    });

    // Health check endpoint
    this.app.get('/health', (req, res) => {
      res.json({ status: 'ok' });
    });
  }

  /**
   * Setup WebSocket server
   */
  private setupWebSocket(): void {
    this.wss.on('connection', (ws: WebSocket, req) => {
      // Extract token from query params
      const url = new URL(req.url || '', `http://${req.headers.host}`);
      const token = url.searchParams.get('token');

      if (!token) {
        console.warn('[WebSocket] Connection rejected: No token provided');
        ws.close(1008, 'No token provided');
        return;
      }

      // Verify token
      const payload = this.tokenManager.verifyToken(token);
      if (!payload) {
        console.warn('[WebSocket] Connection rejected: Invalid token');
        ws.close(1008, 'Invalid token');
        return;
      }

      console.log(`[WebSocket] Mobile device connected: ${payload.deviceName} (${payload.deviceId})`);

      // Handle messages from mobile
      ws.on('message', async (data: Buffer) => {
        try {
          const message = JSON.parse(data.toString());
          await this.sessionRouter.handleMessage(payload.sessionId, message, ws);
        } catch (error) {
          ws.send(JSON.stringify({
            type: 'error',
            data: { error: error instanceof Error ? error.message : String(error) }
          }));
        }
      });

      // Handle WebSocket close
      ws.on('close', () => {
        console.log(`[WebSocket] Mobile device disconnected: ${payload.deviceName}`);
      });

      // Handle WebSocket errors
      ws.on('error', (error) => {
        console.error(`[WebSocket] Error for ${payload.deviceName}:`, error);
      });

      // Send welcome message
      ws.send(JSON.stringify({
        type: 'connected',
        data: {
          sessionId: payload.sessionId,
          deviceName: payload.deviceName
        }
      }));
    });

    // Handle WebSocket server errors
    this.wss.on('error', (error) => {
      console.error('[WebSocket] Server error:', error);
    });
  }

  /**
   * Start the bridge server
   *
   * @returns Promise that resolves when server is ready
   */
  async start(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.server.listen(this.port, () => {
        console.log('════════════════════════════════════════════════════');
        console.log('🚀 Floyd Mobile Bridge Server');
        console.log('════════════════════════════════════════════════════');
        console.log(`✓ Bridge server listening on port ${this.port}`);
        console.log(`✓ HTTP API: http://localhost:${this.port}`);
        console.log(`✓ WebSocket: ws://localhost:${this.port}/ws`);

        // Start NGROK tunnel
        this.ngrokManager.createTunnel()
          .then((url) => {
            console.log(`✓ NGROK tunnel established: ${url}`);
            console.log('');
            console.log('Ready for mobile pairing!');
            console.log('Use POST /api/bridge/pairing to generate QR code');
            console.log('════════════════════════════════════════════════════');
            resolve();
          })
          .catch((error) => {
            console.error(`✗ NGROK tunnel failed: ${error.message}`);
            console.log('');
            console.log('Bridge server running without NGROK tunnel');
            console.log('Mobile devices must be on the same network');
            console.log('════════════════════════════════════════════════════');
            reject(error); // Reject if NGROK fails
          });
      });

      this.server.on('error', (error: any) => {
        if (error.code === 'EADDRINUSE') {
          reject(new Error(`Port ${this.port} is already in use`));
        } else {
          reject(error);
        }
      });
    });
  }

  /**
   * Stop the bridge server
   */
  async stop(): Promise<void> {
    console.log('[Bridge] Shutting down...');

    // Close WebSocket server
    this.wss.close();

    // Close NGROK tunnel
    await this.ngrokManager.closeTunnel();

    // Close HTTP server
    return new Promise((resolve) => {
      this.server.close(() => {
        console.log('[Bridge] Server stopped');
        resolve();
      });
    });
  }
}
