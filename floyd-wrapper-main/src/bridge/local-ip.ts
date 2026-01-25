/**
 * Floyd Mobile Bridge - Local IP Detection
 *
 * Purpose: Automatically detect local network IP address for QR code generation
 */

import { networkInterfaces } from 'os';

/**
 * Get local network IP address
 *
 * Finds the first non-internal IPv4 address, which is typically
 * the WiFi/Ethernet IP used for local network communication.
 *
 * @returns Local IP address (e.g., "192.168.1.100") or "localhost" if not found
 */
export function getLocalIP(): string {
  const interfaces = networkInterfaces();

  // Iterate through network interfaces
  for (const name of Object.keys(interfaces)) {
    // Skip internal/loopback interfaces
    if (name === 'lo' || name.startsWith('lo')) {
      continue;
    }

    const iface = interfaces[name];
    if (!iface) continue;

    // Find IPv4 address
    for (const info of iface) {
      if (info.family === 'IPv4' && !info.internal) {
        return info.address;
      }
    }
  }

  // Fallback to localhost
  return 'localhost';
}

/**
 * Get bridge URL for QR code
 *
 * @param port - Port number (default: 4000)
 * @returns Complete URL (e.g., "http://192.168.1.100:4000")
 */
export function getBridgeURL(port: number = 4000): string {
  const ip = getLocalIP();
  return `http://${ip}:${port}`;
}
