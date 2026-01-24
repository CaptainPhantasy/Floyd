/**
 * Floyd Mobile Bridge - NGROK Tunnel Manager
 *
 * Purpose: Manage NGROK tunnels for mobile bridge access
 * Documentation: https://ngrok.com/docs/getting-started/javascript
 *
 * Key Features:
 * - Create HTTPS tunnels to localhost:4000
 * - Automatic cleanup on shutdown
 * - Support for reserved domains
 */

import ngrok from '@ngrok/ngrok';

/**
 * NGROK Manager Configuration
 */
export interface NgrokConfig {
  port: number;
  authtoken?: string;
  domain?: string;
}

/**
 * NGROK Tunnel Manager
 *
 * Responsibilities:
 * - Create NGROK tunnels to bridge server
 * - Manage tunnel lifecycle
 * - Provide tunnel URL for QR code generation
 */
export class NgrokManager {
  private listener?: any;
  private url: string = '';
  private config: NgrokConfig;

  constructor(config: NgrokConfig) {
    this.config = config;
  }

  /**
   * Create NGROK tunnel
   *
   * @returns Public HTTPS URL
   *
   * Implementation based on official NGROK JavaScript SDK documentation:
   * https://ngrok.com/docs/getting-started/javascript
   *
   * Example:
   * ```typescript
   * const manager = new NgrokManager({ port: 4000 });
   * const url = await manager.createTunnel();
   * console.log(`Tunnel: ${url}`); // https://abc123.ngrok-free.app
   * ```
   */
  async createTunnel(): Promise<string> {
    try {
      // Set authtoken if provided
      if (this.config.authtoken) {
        await ngrok.authtoken(this.config.authtoken);
      }

      // Create forward tunnel
      // Reference: https://ngrok.com/docs/getting-started/javascript
      this.listener = await ngrok.forward({
        addr: this.config.port,
        authtoken_from_env: true,
        ...(this.config.domain && { domain: this.config.domain })
      });

      // Get the public URL
      this.url = this.listener.url();
      console.log(`NGROK tunnel established: ${this.url}`);

      return this.url;
    } catch (error) {
      throw new Error(`NGROK tunnel failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Get current tunnel URL
   *
   * @returns Public HTTPS URL or empty string if tunnel not active
   */
  getUrl(): string {
    return this.url;
  }

  /**
   * Check if tunnel is active
   *
   * @returns true if tunnel is active
   */
  isConnected(): boolean {
    return this.url !== '' && this.listener !== undefined;
  }

  /**
   * Close NGROK tunnel
   *
   * Should be called on shutdown to clean up resources
   */
  async closeTunnel(): Promise<void> {
    try {
      if (this.listener) {
        await ngrok.disconnect();
        this.listener = undefined;
        this.url = '';
        console.log('NGROK tunnel closed');
      }
    } catch (error) {
      throw new Error(`Failed to close NGROK tunnel: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}
