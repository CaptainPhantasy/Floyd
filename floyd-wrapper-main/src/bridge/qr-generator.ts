/**
 * Floyd Mobile Bridge - QR Code Generator
 *
 * Purpose: Generate QR codes for mobile pairing handshake
 * Documentation: https://github.com/soldair/node-qrcode
 *
 * Key Features:
 * - Generate QR codes with high error correction (H ~30%)
 * - Embed handshake data (NGROK URL, session ID, JWT token)
 * - Return base64 PNG data URL for display
 */

import QRCode from 'qrcode';
import type { QRHandshakeData } from './types.js';

/**
 * QR Generator Configuration
 */
export interface QRGeneratorConfig {
  errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
  width?: number;
  margin?: number;
}

/**
 * QR Code Generator
 *
 * Responsibilities:
 * - Generate QR codes containing handshake data
 * - Encode NGROK URL, session ID, and JWT token
 * - Return PNG data URL for display in terminal/web
 */
export class QRGenerator {
  private config: QRGeneratorConfig;

  constructor(config: QRGeneratorConfig = {}) {
    // Default configuration optimized for mobile scanning
    this.config = {
      errorCorrectionLevel: 'H',  // High error correction (~30%) for mobile
      width: 400,                  // Good size for mobile scanning
      margin: 2,                   // Standard margin
      ...config
    };
  }

  /**
   * Generate QR code for mobile pairing handshake
   *
   * @param ngrokUrl - NGROK tunnel URL
   * @param sessionId - Floyd session UUID
   * @param token - JWT auth token
   * @param ttlMinutes - Time to live in minutes (default: 5)
   * @returns QR code data URL and handshake data
   *
   * Implementation based on qrcode package documentation:
   * https://github.com/soldair/node-qrcode#apitourldataurl
   *
   * Example:
   * ```typescript
   * const generator = new QRGenerator();
   * const { qrDataUrl, handshakeData } = await generator.generateHandshakeQR(
   *   'https://abc123.ngrok-free.app',
   *   'session-uuid',
   *   'jwt-token'
   * );
   * console.log(qrDataUrl); // data:image/png;base64,iVBORw0KGgo...
   * ```
   */
  async generateHandshakeQR(
    ngrokUrl: string,
    sessionId: string,
    token: string,
    ttlMinutes: number = 5
  ): Promise<{
    qrDataUrl: string;
    handshakeData: QRHandshakeData;
  }> {
    // Calculate expiry timestamp
    const expiresAt = Date.now() + (ttlMinutes * 60 * 1000);

    // Create handshake data object
    const handshakeData: QRHandshakeData = {
      ngrokUrl,
      sessionId,
      token,
      expiresAt
    };

    // Generate QR code as base64 PNG
    // Reference: https://github.com/soldair/node-qrcode
    const qrDataUrl = await QRCode.toDataURL(
      JSON.stringify(handshakeData),
      {
        errorCorrectionLevel: this.config.errorCorrectionLevel,
        margin: this.config.margin,
        scale: 8,
        width: this.config.width
      }
    );

    console.log(`QR code generated for session: ${sessionId}`);
    console.log(`QR expires at: ${new Date(expiresAt).toISOString()}`);

    return { qrDataUrl, handshakeData };
  }

  /**
   * Validate handshake data
   *
   * @param data - Handshake data to validate
   * @returns true if valid, false otherwise
   */
  validateHandshakeData(data: any): data is QRHandshakeData {
    // Check required fields
    if (!data ||
        typeof data !== 'object' ||
        typeof data.ngrokUrl !== 'string' ||
        typeof data.sessionId !== 'string' ||
        typeof data.token !== 'string' ||
        typeof data.expiresAt !== 'number') {
      return false;
    }

    // Check if QR code has expired
    const now = Date.now();
    if (data.expiresAt < now) {
      console.warn(`QR code expired: ${new Date(data.expiresAt).toISOString()}`);
      return false;
    }

    return true;
  }

  /**
   * Generate QR code to terminal (ASCII art)
   *
   * Useful for displaying QR code directly in terminal
   *
   * @param ngrokUrl - NGROK tunnel URL
   * @param sessionId - Floyd session UUID
   * @param token - JWT auth token
   * @param ttlMinutes - Time to live in minutes (default: 5)
   * @returns ASCII QR code string
   */
  async generateHandshakeQRTerminal(
    ngrokUrl: string,
    sessionId: string,
    token: string,
    ttlMinutes: number = 5
  ): Promise<string> {
    // Calculate expiry timestamp
    const expiresAt = Date.now() + (ttlMinutes * 60 * 1000);

    // Create handshake data object
    const handshakeData: QRHandshakeData = {
      ngrokUrl,
      sessionId,
      token,
      expiresAt
    };

    // Generate terminal QR code
    const terminalQR = await QRCode.toString(
      JSON.stringify(handshakeData),
      {
        type: 'terminal',
        errorCorrectionLevel: this.config.errorCorrectionLevel
      }
    );

    return terminalQR;
  }
}
