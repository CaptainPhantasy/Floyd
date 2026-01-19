/**
 * FloydDesktop - Electron Main Process
 *
 * This is the main entry point for the Floyd Desktop application.
 * It initializes the AgentEngine from floyd-agent-core and sets up
 * the WebSocket MCP server for Chrome extension connectivity.
 *
 * Includes Chrome extension fallback: when the desktop MCP server fails,
 * attempts to detect and use the FloydChrome extension as a fallback.
 */

import { app, BrowserWindow, dialog, globalShortcut, ipcMain, Notification } from 'electron';
import fs from 'fs';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import { AgentIPC } from './ipc/agent-ipc.js';
import { WebSocketMCPServer } from './mcp/ws-server.js';

// Default Anthropic API configuration
const DEFAULT_ANTHROPIC_CONFIG = {
  endpoint: 'https://api.anthropic.com',
  model: 'claude-sonnet-4-20250514',
};

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let mainWindow: BrowserWindow | null = null;
let settingsWindow: BrowserWindow | null = null;
let agentIPC: AgentIPC | null = null;
let mcpServer: WebSocketMCPServer | null = null;
let mcpServerPort: number | null = null;

interface PersistedSettings {
  apiKey?: string;
  apiEndpoint?: string;
  model?: string;
}

function resolvePreloadPath(): string {
  // FORCE correct path for dev mode
  if (process.env.NODE_ENV === 'development') {
    const devPath = path.resolve(__dirname, '../dist-electron/preload.js');
    console.log('[FloydDesktop] FORCING DEV PRELOAD PATH:', devPath);
    return devPath;
  }

  const bundledPath = path.join(__dirname, 'preload.js');
  console.log('[FloydDesktop] Checking bundled preload:', bundledPath);
  if (fs.existsSync(bundledPath)) {
    console.log('[FloydDesktop] Found bundled preload');
    return bundledPath;
  }
  const distPath = path.join(process.cwd(), 'dist-electron', 'preload.js');
  console.log('[FloydDesktop] Checking dist preload:', distPath);
  return distPath;
}

function parseEnvFile(contents: string): Record<string, string> {
  const entries: Record<string, string> = {};
  for (const line of contents.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) {
      continue;
    }
    const index = trimmed.indexOf('=');
    if (index === -1) {
      continue;
    }
    const key = trimmed.slice(0, index).trim();
    let value = trimmed.slice(index + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (key) {
      entries[key] = value;
    }
  }
  return entries;
}

function loadEnvFromVenv(): void {
  const venvPath = process.env.VIRTUAL_ENV || path.join(process.cwd(), 'venv');
  const envPath = path.join(venvPath, '.env');
  if (!fs.existsSync(envPath)) {
    return;
  }
  try {
    const contents = fs.readFileSync(envPath, 'utf-8');
    const entries = parseEnvFile(contents);
    for (const [key, value] of Object.entries(entries)) {
      if (process.env[key] === undefined) {
        process.env[key] = value;
      }
    }
    console.log('[FloydDesktop] Loaded env defaults from venv');
  } catch (error) {
    console.warn('[FloydDesktop] Failed to read venv .env file:', error);
  }
}

function readPersistedSettings(): PersistedSettings {
  try {
    const settingsPath = path.join(app.getPath('userData'), 'settings.json');
    if (!fs.existsSync(settingsPath)) {
      return {};
    }
    const data = fs.readFileSync(settingsPath, 'utf-8');
    return JSON.parse(data) as PersistedSettings;
  } catch (error) {
    console.warn('[FloydDesktop] Failed to read settings file:', error);
    return {};
  }
}

function resolveApiConfig(): { apiKey: string; apiEndpoint: string; model: string } {
  loadEnvFromVenv();
  const settings = readPersistedSettings();
  const apiKey =
    settings.apiKey ||
    process.env.FLOYD_API_KEY ||
    process.env.ANTHROPIC_API_KEY ||
    process.env.ANTHROPIC_AUTH_TOKEN ||
    '';
  const apiEndpoint =
    settings.apiEndpoint ||
    process.env.FLOYD_API_ENDPOINT ||
    process.env.ANTHROPIC_API_ENDPOINT ||
    DEFAULT_ANTHROPIC_CONFIG.endpoint;
  const model =
    settings.model ||
    process.env.FLOYD_MODEL ||
    process.env.ANTHROPIC_MODEL ||
    DEFAULT_ANTHROPIC_CONFIG.model;

  return { apiKey, apiEndpoint, model };
}

function probeUrl(url: string, timeoutMs: number): Promise<boolean> {
  return new Promise((resolve) => {
    const req = http.get(url, (res) => {
      res.resume();
      resolve(true);
    });
    req.on('error', () => resolve(false));
    req.setTimeout(timeoutMs, () => {
      req.destroy();
      resolve(false);
    });
  });
}

async function resolveDevServerUrl(hash?: string): Promise<string> {
  const baseUrl = process.env.VITE_DEV_SERVER_URL;
  if (baseUrl) {
    return hash ? `${baseUrl}#${hash}` : baseUrl;
  }
  const portsToTry = [5173, 5174, 5175, 5176, 5177, 5178];
  for (const port of portsToTry) {
    const url = `http://localhost:${port}`;
    if (await probeUrl(url, 250)) {
      return hash ? `${url}#${hash}` : url;
    }
  }
  const fallbackUrl = 'http://localhost:5173';
  if (!hash) {
    return fallbackUrl;
  }
  return `${fallbackUrl}#${hash}`;
}

/**
 * Create the main browser window
 */
async function createWindow(): Promise<void> {
  const preloadPath = resolvePreloadPath();
  
  // Resolve icon path (works in both dev and production)
  const iconPath = process.env.NODE_ENV === 'development'
    ? path.join(__dirname, '../../build/icon.png')
    : path.join(__dirname, '../build/icon.png');
  
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1000,
    minHeight: 600,
    titleBarStyle: 'hiddenInset',
    backgroundColor: '#0f172a',
    icon: fs.existsSync(iconPath) ? iconPath : undefined, // Only set if icon exists
    webPreferences: {
      preload: preloadPath,
      contextIsolation: true,
      nodeIntegration: false,
      webSecurity: process.env.NODE_ENV !== 'development', // Disable only for dev WebSocket
    },
  });

  // Load renderer
  // Check for dev server URL first (set by vite-plugin-electron)
  // Fall back to NODE_ENV check, then to production build
  const devServerUrl = process.env.VITE_DEV_SERVER_URL;
  
  if (devServerUrl) {
    // Dev mode - vite-plugin-electron sets this
    console.log('[FloydDesktop] Loading dev server:', devServerUrl);
    mainWindow.loadURL(devServerUrl);
    mainWindow.webContents.openDevTools();
  } else if (process.env.NODE_ENV === 'development') {
    // Dev mode fallback - probe for dev server
    const probeUrl = await resolveDevServerUrl();
    console.log('[FloydDesktop] Loading probed dev server:', probeUrl);
    mainWindow.loadURL(probeUrl);
    mainWindow.webContents.openDevTools();
  } else {
    // Production mode - load from dist
    const prodPath = path.join(__dirname, '../dist-renderer/index.html');
    console.log('[FloydDesktop] Loading production build:', prodPath);
    mainWindow.loadFile(prodPath);
  }

  // Register DevTools toggle shortcut (Ctrl/Cmd+Shift+I)
  globalShortcut.register('CommandOrControl+Shift+I', () => {
    if (mainWindow) {
      const { webContents } = mainWindow;
      if (webContents.isDevToolsOpened()) {
        webContents.closeDevTools();
      } else {
        webContents.openDevTools();
      }
    }
  });
}

/**
 * Create the settings window
 */
async function createSettingsWindow(): Promise<void> {
  if (settingsWindow && !settingsWindow.isDestroyed()) {
    settingsWindow.focus();
    return;
  }

  const preloadPath = resolvePreloadPath();
  settingsWindow = new BrowserWindow({
    width: 600,
    height: 500,
    minWidth: 500,
    minHeight: 400,
    resizable: false,
    titleBarStyle: 'hiddenInset',
    backgroundColor: '#0f172a',
    modal: true,
    parent: mainWindow || undefined,
    webPreferences: {
      preload: preloadPath,
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  // Load renderer - same as main window
  if (process.env.NODE_ENV === 'development') {
    const devServerUrl = await resolveDevServerUrl('settings');
    settingsWindow.loadURL(devServerUrl);
  } else {
    settingsWindow.loadFile(path.join(__dirname, '../dist-renderer/index.html'), {
      hash: 'settings',
    });
  }

  settingsWindow.on('closed', () => {
    settingsWindow = null;
    // Notify main window that settings was closed
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('floyd:settings-closed');
    }
  });

  console.log('[FloydDesktop] Settings window opened');
}

/**
 * Close the settings window
 */
function closeSettingsWindow(): void {
  if (settingsWindow && !settingsWindow.isDestroyed()) {
    settingsWindow.close();
  }
}

/**
 * Attempt to enable Chrome extension fallback
 * Called when MCP server fails to start
 */
async function attemptExtensionFallback(): Promise<void> {
  console.log('[FloydDesktop] MCP server failed, attempting Chrome extension fallback...');

  if (!agentIPC) {
    console.error('[FloydDesktop] AgentIPC not initialized, cannot enable fallback');
    return;
  }

  const fallbackEnabled = await agentIPC.enableExtensionFallback();

  if (fallbackEnabled) {
    console.log('[FloydDesktop] Chrome extension fallback enabled successfully');

    // Show notification to user
    if (Notification.isSupported()) {
      new Notification({
        title: 'FloydDesktop - Extension Fallback Active',
        body: 'Desktop MCP server unavailable. Using Chrome extension for tool execution.',
        urgency: 'normal',
      }).show();
    }
  } else {
    console.warn('[FloydDesktop] Could not enable Chrome extension fallback');

    // Show notification to user about failure
    if (Notification.isSupported()) {
      new Notification({
        title: 'FloydDesktop - MCP Unavailable',
        body: 'Neither desktop MCP server nor Chrome extension could be reached. Tool execution may be limited.',
        urgency: 'critical',
      }).show();
    }
  }
}

/**
 * Initialize application services
 */
async function initializeServices(): Promise<void> {
  const { apiKey, apiEndpoint, model } = resolveApiConfig();

  if (!apiKey) {
    console.warn('[FloydDesktop] No API key found in environment. App will launch in restricted mode.');
  }

  // Initialize Agent IPC bridge
  // Pass empty string if no key; AgentEngine handles auth errors gracefully during requests
  agentIPC = new AgentIPC({
    apiKey: apiKey || 'sk-placeholder',
    apiEndpoint,
    model,
  });
  await agentIPC.initialize();

  // Initialize WebSocket MCP server for Chrome extension
  mcpServer = new WebSocketMCPServer({
    port: 3000,
    agentIPC: agentIPC
  });

  try {
    mcpServerPort = await mcpServer.start();
    console.log(`[FloydDesktop] MCP server started on port ${mcpServerPort}`);
  } catch (error) {
    console.error('[FloydDesktop] Failed to start MCP server:', error);

    // Attempt to use Chrome extension as fallback
    await attemptExtensionFallback();
  }

  console.log('[FloydDesktop] Services initialized');
}

/**
 * Clean up application services
 */
function cleanupServices(): void {
  console.log('[FloydDesktop] Cleaning up services...');

  if (mcpServer) {
    mcpServer.stop();
    mcpServer = null;
  }

  if (agentIPC) {
    agentIPC.dispose();
    agentIPC = null;
  }
}

// App lifecycle handlers

app.whenReady().then(() => {
  initializeServices().catch((error) => {
    console.error('[FloydDesktop] Failed to initialize services:', error);
    app.exit(1);
  });

  void createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      void createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  // On macOS, keep app running when all windows are closed
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', () => {
  // Unregister all shortcuts
  globalShortcut.unregisterAll();
  cleanupServices();
});

// IPC handlers for settings window
ipcMain.on('floyd:open-settings', () => {
  void createSettingsWindow();
});

ipcMain.on('floyd:close-settings', () => {
  closeSettingsWindow();
});

ipcMain.handle('floyd:select-working-directory', async () => {
  if (!mainWindow) {
    return null;
  }
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory', 'createDirectory'],
  });
  if (result.canceled) {
    return null;
  }
  return result.filePaths[0] ?? null;
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('[FloydDesktop] Uncaught exception:', error);
});

process.on('unhandledRejection', (reason) => {
  console.error('[FloydDesktop] Unhandled rejection:', reason);
});
