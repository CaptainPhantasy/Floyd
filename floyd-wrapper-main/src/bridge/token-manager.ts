/**
 * Floyd Mobile Bridge - JWT Token Manager
 *
 * Purpose: Generate and verify JWT tokens for mobile authentication
 * Documentation: https://github.com/auth0/node-jsonwebtoken
 *
 * Key Features:
 * - Generate JWT tokens for mobile sessions
 * - Verify tokens on WebSocket connection
 * - Support for token expiry (30 days default)
 */

import jwt from 'jsonwebtoken';
import type { TokenPayload } from './types.js';

/**
 * Token Manager Configuration
 */
export interface TokenManagerConfig {
  secret: string;
  tokenTTL?: number; // Time to live in seconds (default: 30 days)
}

/**
 * JWT Token Manager
 *
 * Responsibilities:
 * - Generate JWT tokens for mobile devices
 * - Verify tokens on WebSocket connection
 * - Handle token expiry and validation
 */
export class TokenManager {
  private secret: string;
  private tokenTTL: number;

  constructor(config: TokenManagerConfig) {
    this.secret = config.secret;
    this.tokenTTL = config.tokenTTL || (30 * 24 * 60 * 60); // 30 days in seconds
  }

  /**
   * Generate session token for mobile device
   *
   * @param deviceId - Mobile device UUID
   * @param sessionId - Floyd session ID
   * @param deviceName - Human-readable device name
   * @returns JWT token string
   *
   * Implementation based on jsonwebtoken documentation:
   * https://github.com/auth0/node-jsonwebtoken#jwtsignpayload-secretorpublickey-options-callback
   *
   * Example:
   * ```typescript
   * const tm = new TokenManager({ secret: 'my-secret' });
   * const token = tm.generateSessionToken('device-123', 'session-456', 'Douglas\'s iPhone');
   * console.log(token); // eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   * ```
   */
  generateSessionToken(
    deviceId: string,
    sessionId: string,
    deviceName: string
  ): string {
    const payload = {
      deviceId,
      sessionId,
      deviceName
    };

    // Generate JWT token
    // Reference: https://github.com/auth0/node-jsonwebtoken#usage
    const token = jwt.sign(payload, this.secret, {
      expiresIn: this.tokenTTL,
      subject: deviceId,
      issuer: 'floyd-wrapper'
    });

    console.log(`Token generated for device: ${deviceName} (${deviceId})`);

    return token;
  }

  /**
   * Verify JWT token
   *
   * @param token - JWT token string
   * @returns Decoded token payload or null if invalid
   *
   * Implementation based on jsonwebtoken documentation:
   * https://github.com/auth0/node-jsonwebtoken#jwtverifytoken-secretorpublickey-options-callback
   *
   * Example:
   * ```typescript
   * const tm = new TokenManager({ secret: 'my-secret' });
   * const decoded = tm.verifyToken('eyJhbGciOi...');
   * if (decoded) {
   *   console.log(decoded.deviceName); // "Douglas's iPhone"
   * }
   * ```
   */
  verifyToken(token: string): TokenPayload | null {
    try {
      // Verify token
      // Reference: https://github.com/auth0/node-jsonwebtoken#jwtverifytoken-secretorpublickey-options-callback
      const decoded = jwt.verify(token, this.secret) as TokenPayload;

      console.log(`Token verified for device: ${decoded.deviceName}`);

      return decoded;
    } catch (error) {
      // Token is invalid or expired
      if (error instanceof jwt.TokenExpiredError) {
        console.warn('Token expired');
      } else if (error instanceof jwt.JsonWebTokenError) {
        console.warn('Invalid token');
      } else {
        console.warn('Token verification failed:', error);
      }

      return null;
    }
  }

  /**
   * Decode token without verification (for debugging)
   *
   * @param token - JWT token string
   * @returns Decoded token payload or null
   *
   * WARNING: This does not verify the token signature!
   * Use only for debugging purposes.
   */
  decodeToken(token: string): TokenPayload | null {
    try {
      const decoded = jwt.decode(token) as TokenPayload;
      return decoded;
    } catch (error) {
      console.warn('Failed to decode token:', error);
      return null;
    }
  }

  /**
   * Get token expiry time
   *
   * @param token - JWT token string
   * @returns Expiry timestamp or null
   */
  getTokenExpiry(token: string): number | null {
    const decoded = this.decodeToken(token);
    return decoded?.exp || null;
  }

  /**
   * Check if token is expired
   *
   * @param token - JWT token string
   * @returns true if expired or invalid
   */
  isTokenExpired(token: string): boolean {
    const decoded = this.decodeToken(token);
    if (!decoded || !decoded.exp) {
      return true;
    }

    const now = Math.floor(Date.now() / 1000); // Unix timestamp in seconds
    return decoded.exp < now;
  }
}
