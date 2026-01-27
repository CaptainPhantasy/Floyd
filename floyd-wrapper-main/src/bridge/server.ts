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
import { logger } from '../utils/logger.js';
import { registerCoreTools } from '../tools/index.js';
import { QRGenerator } from './qr-generator.js';
import { TokenManager } from './token-manager.js';
import { NgrokManager } from './ngrok-manager.js';
import { SessionRouter } from './session-router.js';
import { getBridgeURL } from './local-ip.js';
import { handleFloydAgentRequest } from './floyd-agent-handler.js';
import type { FloydAgentRequest, FloydAgentResponse } from './floyd-agent-types.js';
import type { BridgeConfig } from './types.js';

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
  private bridgeUrl: string;

  constructor(config: BridgeConfig) {
    this.config = config;
    this.port = config.port || 4000;
    this.bridgeUrl = getBridgeURL(this.port);

    // Register all core tools for Floyd Agent API
    registerCoreTools();

    // Initialize Express app
    this.app = express();
    this.server = createServer(this.app);

    // Initialize single WebSocket server that handles both /ws and /agent paths
    this.wss = new WebSocketServer({ noServer: true });

    // Initialize managers
    this.qrGenerator = new QRGenerator();
    this.tokenManager = new TokenManager({ secret: config.jwtSecret });
    this.ngrokManager = new NgrokManager({
      port: this.port,
      authtoken: config.ngrokAuthToken,
      domain: config.ngrokDomain
    });
    this.sessionRouter = new SessionRouter({ workspaceRoot: process.cwd() });

    // Setup middleware, routes, and WebSocket
    this.setupMiddleware();
    this.setupRoutes();
    this.setupWebSocket();
    this.setupServerUpgrade();
  }

  /**
   * Setup Express middleware
   */
  private setupMiddleware(): void {
    // Parse JSON bodies
    this.app.use(express.json());

    // Request logging middleware
    this.app.use((req, _res, next) => {
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

        // Generate QR code with local network IP
        const { handshakeData } = await this.qrGenerator.generateHandshakeQR(
          this.bridgeUrl,  // Use local IP instead of NGROK
          sessionId,
          token,
          this.config.qrTTLMinutes || 5
        );

        return res.json({
          success: true,
          qrDataUrl: 'https://local.example', // Placeholder - not used for local IP
          handshakeData
        });

        console.log(`[Bridge] QR code generated for session: ${sessionId}`);
      } catch (error) {
        console.error('[Bridge] Pairing error:', error);
        return res.status(500).json({
          success: false,
          error: error instanceof Error ? error.message : String(error)
        });
      }
    });

    // GET /api/bridge/status - Check bridge status
    this.app.get('/api/bridge/status', (_req, res) => {
      res.json({
        running: true,
        port: this.port,
        ngrokUrl: this.ngrokManager.getUrl(),
        ngrokConnected: this.ngrokManager.isConnected(),
        wsConnected: this.wss.clients.size
      });
    });

    // GET /connect - Display connection page for mobile
    this.app.get('/connect', (req, res): void => {
      const { ngrokUrl, sessionId, token, expiresAt } = req.query;

      // Validate required parameters
      if (!ngrokUrl || !sessionId || !token || !expiresAt) {
        res.status(400).send(`
          <html>
          <body style="font-family: sans-serif; text-align: center; padding: 50px;">
            <h1>❌ Invalid Connection Request</h1>
            <p>Missing required parameters. Please scan the QR code again.</p>
          </body>
          </html>
        `);
        return;
      }

      // Check expiry
      const now = Date.now();
      const expiry = parseInt(expiresAt as string, 10);
      if (now > expiry) {
        res.status(410).send(`
          <html>
          <body style="font-family: sans-serif; text-align: center; padding: 50px;">
            <h1>⏰ QR Code Expired</h1>
            <p>The QR code has expired. Please generate a new one.</p>
          </body>
          </html>
        `);
        return;
      }

      // Redirect to FloydMobile PWA with handshake data
      // Use local IP (not localhost) so mobile devices can connect
      const pwaURL = process.env.FLOYD_MOBILE_URL || this.bridgeUrl.replace(':4000', ':5173');

      // Convert query parameters to string for URL
      const params = new URLSearchParams({
        ngrokUrl: ngrokUrl as string,
        sessionId: sessionId as string,
        token: token as string,
        expiresAt: expiresAt as string
      });

      res.send(`
        <html>
        <head>
          <meta http-equiv="refresh" content="0; url=${pwaURL}?${params.toString()}">
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
              display: flex;
              align-items: center;
              justify-content: center;
              height: 100vh;
              margin: 0;
              background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%);
              color: #f1f5f9;
            }
            .container {
              text-align: center;
              padding: 2rem;
            }
            h1 { font-size: 2rem; margin-bottom: 1rem; }
            p { font-size: 1.2rem; opacity: 0.8; }
            .spinner {
              border: 4px solid #6366f1;
              border-top: 4px solid transparent;
              border-radius: 50%;
              width: 50px;
              height: 50px;
              animation: spin 1s linear infinite;
              margin: 2rem auto;
            }
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>🔗 Connecting to Floyd Mobile...</h1>
            <div class="spinner"></div>
            <p>You'll be redirected automatically.</p>
          </div>
        </body>
        </html>
      `);
      return;
    });

    // Health check endpoint
    this.app.get('/health', (_req, res) => {
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
   * Setup server upgrade handler to route WebSocket connections
   *
   * Handles both /ws (mobile) and /agent (Floyd Agent API) paths
   */
  private setupServerUpgrade(): void {
    this.server.on('upgrade', (req: any, socket: any, head: any) => {
      const { pathname } = new URL(req.url || '', `http://${req.headers.host}`);

      if (pathname === '/ws') {
        // Handle mobile WebSocket connection
        this.wss.handleUpgrade(req, socket, head, (ws) => {
          this.wss.emit('connection', ws, req);
        });
      } else if (pathname === '/agent') {
        // Handle Floyd Agent API connection
        this.wss.handleUpgrade(req, socket, head, (ws) => {
          this.handleAgentConnection(ws, req);
        });
      } else {
        // Reject unknown paths
        socket.destroy();
      }
    });

    console.log('[Server] WebSocket upgrade handler ready for /ws and /agent');
  }

  /**
   * Handle Floyd Agent API WebSocket connection
   *
   * Handles Floyd Agent API requests using the contract format:
   * - Request: { id, method, params, stream?, timeout? }
   * - Response: { id, success, data?, error?, timing? }
   */
  private handleAgentConnection(ws: WebSocket, req: any): void {
    // Extract token from query params (optional for Agent API)
    const url = new URL(req.url || '', `http://${req.headers.host}`);
    const token = url.searchParams.get('token');

    if (token) {
      // Verify token if provided
      const payload = this.tokenManager.verifyToken(token);
      if (!payload) {
        console.warn('[Agent WebSocket] Connection rejected: Invalid token');
        ws.close(1008, 'Invalid token');
        return;
      }
      console.log(`[Agent WebSocket] Client connected: ${payload.deviceName}`);
    } else {
      console.log('[Agent WebSocket] Anonymous client connected (local development mode)');
    }

    // Handle messages from client
    ws.on('message', async (data: Buffer) => {
      try {
        const request: FloydAgentRequest = JSON.parse(data.toString());

        logger.debug('[FloydAgent] Received request', {
          id: request.id,
          method: request.method,
        });

        // Handle the request
        const response = await handleFloydAgentRequest(request);

        // Send response
        ws.send(JSON.stringify(response));

      } catch (error) {
        // Send error response
        const errorResponse: FloydAgentResponse = {
          id: 'unknown',
          success: false,
          error: {
            code: 'UNKNOWN_ERROR',
            message: error instanceof Error ? error.message : String(error),
            details: error,
            recoverable: false,
          },
        };

        ws.send(JSON.stringify(errorResponse));
      }
    });

    // Handle WebSocket close
    ws.on('close', () => {
      console.log('[Agent WebSocket] Client disconnected');
    });

    // Handle WebSocket errors
    ws.on('error', (error) => {
      console.error('[Agent WebSocket] Error:', error);
    });
  }

  /**
   * Display QR code for easy mobile pairing
   *
   * Generates a QR code containing handshake data and displays it in the terminal
   */
  private async displayQRCode(): Promise<void> {
    try {
      // Generate default session ID
      const sessionId = uuidv4();
      const deviceId = uuidv4();
      const token = this.tokenManager.generateSessionToken(
        deviceId,
        sessionId,
        'Default Device'
      );

      // Create handshake data
      const handshakeData = {
        ngrokUrl: this.bridgeUrl,
        sessionId,
        token,
        expiresAt: Date.now() + (5 * 60 * 1000) // 5 minutes
      };

      // Generate QR code (we only need the handshake data, not the QR image)
      await this.qrGenerator.generateHandshakeQR(
        this.bridgeUrl,
        sessionId,
        token,
        5
      );

      // Display QR code in terminal
      console.log('📱 Scan to connect your mobile device:');
      console.log('');

      // Create a simple text-based QR code display
      // For now, just show the URL with handshake data as query params
      const params = new URLSearchParams({
        ngrokUrl: handshakeData.ngrokUrl,
        sessionId: handshakeData.sessionId,
        token: handshakeData.token,
        expiresAt: handshakeData.expiresAt.toString()
      });

      const connectURL = `${this.bridgeUrl}/connect?${params.toString()}`;

      console.log('┌──────────────────────────────────────────────┐');
      console.log('│  🔗 QR CODE: Scan with your phone            │');
      console.log('├──────────────────────────────────────────────┤');
      console.log(`│  ${connectURL.substring(0, 52)}...│`);
      console.log('├──────────────────────────────────────────────┤');
      console.log('│  Or open this URL on your phone:               │');
      console.log(`│  ${connectURL}│`);
      console.log('└──────────────────────────────────────────────┘');
      console.log('');

      // Also save QR code as a file that can be opened
      const fs = await import('fs/promises');
      const qrPath = '/tmp/floyd-mobile-qr.txt';
      await fs.writeFile(qrPath, connectURL);
      console.log(`💾 QR code URL saved to: ${qrPath}`);
      console.log('');
    } catch (error) {
      console.error('[Bridge] Failed to generate QR code:', error);
    }
  }

  /**
   * Start the bridge server
   *
   * @returns Promise that resolves when server is ready
   */
  async start(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.server.listen(this.port, async () => {
        console.log('════════════════════════════════════════════════════');
        console.log('🚀 Floyd Mobile Bridge Server');
        console.log('════════════════════════════════════════════════════');
        console.log(`✓ Bridge server listening on port ${this.port}`);
        console.log(`✓ Bridge URL: ${this.bridgeUrl}`);
        console.log(`✓ Mobile WebSocket: ${this.bridgeUrl}/ws`);
        console.log(`✓ Floyd Agent API: ${this.bridgeUrl}/agent`);
        console.log('');

        // Generate and display QR code for easy pairing
        await this.displayQRCode();

        // Optionally try NGROK (don't fail if it doesn't work)
        this.ngrokManager.createTunnel()
          .then((url) => {
            console.log(`✓ NGROK tunnel available: ${url}`);
            console.log('');
          })
          .catch(() => {
            // Silent fail - NGROK is optional for local network
          });

        console.log('════════════════════════════════════════════════════');
        resolve();
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
