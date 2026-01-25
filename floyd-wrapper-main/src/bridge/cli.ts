/**
 * Floyd Mobile Bridge - CLI Integration
 *
 * Purpose: CLI commands for starting the bridge server
 *
 * Usage:
 *   floyd --bridge              # Start bridge server
 *   floyd --pair-mobile <id>    # Generate QR code for pairing
 */

import { BridgeServer } from './server.js';
import { logger } from '../utils/logger.js';
import chalk from 'chalk';
import fs from 'fs-extra';
import path from 'path';
import os from 'os';
import yaml from 'js-yaml';
import dotenv from 'dotenv';

/**
 * Read NGROK authtoken from ngrok.yml configuration file
 *
 * @returns NGROK authtoken or undefined if not found
 */
async function readNgrokAuthToken(): Promise<string | undefined> {
  try {
    const configPath = path.join(os.homedir(), 'Library', 'Application Support', 'ngrok', 'ngrok.yml');

    if (!(await fs.pathExists(configPath))) {
      return undefined;
    }

    const configContent = await fs.readFile(configPath, 'utf-8');
    const config = yaml.load(configContent) as any;

    if (config?.agent?.authtoken) {
      logger.debug('Read NGROK authtoken from ngrok.yml');
      return config.agent.authtoken;
    }

    return undefined;
  } catch (error) {
    logger.debug('Failed to read ngrok.yml:', error);
    return undefined;
  }
}

/**
 * Start the Floyd Mobile Bridge Server
 *
 * @param port - Port number for HTTP/WebSocket server (default: 4000)
 * @param ngrokAuthToken - Optional NGROK authtoken
 * @param jwtSecret - JWT signing secret (from env or default)
 */
export async function startBridgeServer(options?: {
  port?: number;
  ngrokAuthToken?: string;
  ngrokDomain?: string;
  jwtSecret?: string;
}): Promise<void> {
  try {
    // Load environment variables from .env.local
    const envPath = path.join(process.cwd(), '.env.local');
    if (await fs.pathExists(envPath)) {
      logger.debug('Loading .env.local from', envPath);
      dotenv.config({ path: envPath });
    } else {
      logger.debug('No .env.local file found at', envPath);
    }

    // Get configuration from environment variables or ngrok.yml
    const jwtSecret = options?.jwtSecret || process.env.FLOYD_JWT_SECRET || 'floyd-mobile-secret';

    // Try to get NGROK authtoken from multiple sources (priority order):
    // 1. Explicit parameter
    // 2. Environment variable
    // 3. ngrok.yml configuration file
    let ngrokAuthToken = options?.ngrokAuthToken || process.env.NGROK_AUTHTOKEN;

    if (!ngrokAuthToken) {
      ngrokAuthToken = await readNgrokAuthToken();
    }

    const ngrokDomain = options?.ngrokDomain || process.env.NGROK_DOMAIN;
    const port = options?.port || 4000;

    console.log(chalk.cyan.bold('\n════════════════════════════════════════════════════'));
    console.log(chalk.cyan.bold('🚀 Floyd Mobile Bridge Server'));
    console.log(chalk.cyan.bold('════════════════════════════════════════════════════'));

    // Create and start bridge server
    const server = new BridgeServer({
      port,
      ngrokAuthToken,
      ngrokDomain,
      jwtSecret,
      qrTTLMinutes: 5
    });

    await server.start();

    // Handle graceful shutdown
    process.on('SIGINT', async () => {
      console.log('\n\n🛑 Shutting down bridge server...');
      await server.stop();
      console.log('✓ Bridge server stopped');
      process.exit(0);
    });

    process.on('SIGTERM', async () => {
      console.log('\n\n🛑 Shutting down bridge server...');
      await server.stop();
      console.log('✓ Bridge server stopped');
      process.exit(0);
    });

  } catch (error) {
    logger.error('Failed to start bridge server', error);
    console.error(chalk.red('✗ Failed to start bridge server:'));
    console.error(chalk.red(error instanceof Error ? error.message : String(error)));

    if (!process.env.NGROK_AUTHTOKEN && !options?.ngrokAuthToken) {
      console.log(chalk.yellow('\n💡 Tip: Set NGROK_AUTHTOKEN environment variable to enable NGROK tunneling'));
      console.log(chalk.yellow('   Without it, mobile devices must be on the same network'));
    }

    throw error;
  }
}

/**
 * Show bridge server status
 */
export function showBridgeHelp(): void {
  console.log(chalk.cyan.bold('\n════════════════════════════════════════════════════'));
  console.log(chalk.cyan.bold('📱 Floyd Mobile Bridge'));
  console.log(chalk.cyan.bold('════════════════════════════════════════════════════\n'));

  console.log(chalk.white('Start the bridge server:\n'));
  console.log(chalk.gray('  $ floyd --bridge\n'));

  console.log(chalk.white('Environment variables:\n'));
  console.log(chalk.gray('  NGROK_AUTHTOKEN    - NGROK authtoken (required for remote access)'));
  console.log(chalk.gray('  NGROK_DOMAIN       - Reserved NGROK domain (optional)'));
  console.log(chalk.gray('  FLOYD_JWT_SECRET   - JWT signing secret (default: floyd-mobile-secret)\n'));

  console.log(chalk.white('Once the server is running:\n'));
  console.log(chalk.gray('  1. Server will start on http://localhost:4000'));
  console.log(chalk.gray('  2. NGROK tunnel will be established (if authtoken provided)'));
  console.log(chalk.gray('  3. Use POST /api/bridge/pairing to generate QR code'));
  console.log(chalk.gray('  4. Scan QR code with Floyd Mobile PWA\n'));

  console.log(chalk.white('API Endpoints:\n'));
  console.log(chalk.gray('  POST /api/bridge/pairing  - Generate QR code for mobile pairing'));
  console.log(chalk.gray('  GET  /api/bridge/status   - Check bridge server status'));
  console.log(chalk.gray('  GET  /health              - Health check\n'));

  console.log(chalk.white('WebSocket:\n'));
  console.log(chalk.gray('  ws://localhost:4000/ws?token=<jwt-token>\n'));

  console.log(chalk.cyan.bold('════════════════════════════════════════════════════\n'));
}
