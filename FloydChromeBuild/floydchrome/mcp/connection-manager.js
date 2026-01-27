/**
 * Multi-Port Connection Manager
 * Manages multiple WebSocket connections for FloydChrome extension
 *
 * Architecture:
 * - CLI Connection: ws://localhost:3005 (MCP tools)
 * - Desktop Connection: ws://localhost:3000 (Floyd Desktop Web)
 * - Desktop Agent: ws://localhost:3000 (Floyd Agent tasks)
 *
 * The extension maintains separate connections and routes messages appropriately.
 */

export class ConnectionManager {
  constructor() {
    this.connections = new Map(); // name -> { ws, port, connected, type }
    this.messageHandlers = new Map(); // connectionType -> handler
    this.reconnectIntervals = new Map();
  }

  /**
   * Register a message handler for a connection type
   */
  registerHandler(connectionType, handler) {
    this.messageHandlers.set(connectionType, handler);
  }

  /**
   * Connect to a specific port with a given connection type
   * @param {string} name - Connection name (e.g., 'cli', 'desktop')
   * @param {number} port - Port to connect to
   * @param {string} type - Connection type ('mcp' or 'agent')
   * @param {Object} options - Connection options
   */
  async connect(name, port, type = 'mcp', options = {}) {
    const {
      autoReconnect = true,
      reconnectInterval = 5000,
      maxReconnectAttempts = 50
    } = options;

    return new Promise((resolve, reject) => {
      try {
        console.log(`[ConnectionManager] Connecting ${name} to port ${port}...`);

        const ws = new WebSocket(`ws://localhost:${port}`);

        // Store connection metadata
        this.connections.set(name, {
          ws,
          port,
          type,
          connected: false,
          name,
          options: { autoReconnect, reconnectInterval, maxReconnectAttempts }
        });

        ws.onopen = () => {
          const conn = this.connections.get(name);
          conn.connected = true;
          conn.reconnectAttempts = 0; // Reset reconnect counter

          console.log(`[ConnectionManager] ${name} connected to port ${port}`);

          // Send initialization for MCP connections
          if (type === 'mcp') {
            this.sendInitialization(name);
          }

          // Clear any existing reconnect timer
          if (this.reconnectIntervals.has(name)) {
            clearTimeout(this.reconnectIntervals.get(name));
            this.reconnectIntervals.delete(name);
          }

          resolve(true);
        };

        ws.onmessage = (event) => {
          this.handleMessage(name, event.data);
        };

        ws.onerror = (err) => {
          console.error(`[ConnectionManager] ${name} WebSocket error:`, err);
          const conn = this.connections.get(name);
          conn.connected = false;
          resolve(false);
        };

        ws.onclose = () => {
          const conn = this.connections.get(name);
          conn.connected = false;
          console.log(`[ConnectionManager] ${name} disconnected`);

          // Auto-reconnect if enabled
          if (autoReconnect) {
            this.scheduleReconnect(name);
          }
        };

        // Connection timeout
        setTimeout(() => {
          const conn = this.connections.get(name);
          if (conn && !conn.connected) {
            console.warn(`[ConnectionManager] ${name} connection timeout`);
            resolve(false);
          }
        }, 5000);

      } catch (error) {
        console.error(`[ConnectionManager] ${name} connection failed:`, error);
        resolve(false);
      }
    });
  }

  /**
   * Schedule reconnection attempt
   */
  scheduleReconnect(name) {
    const conn = this.connections.get(name);
    if (!conn || !conn.options.autoReconnect) return;

    // Clear existing timer
    if (this.reconnectIntervals.has(name)) {
      clearTimeout(this.reconnectIntervals.get(name));
    }

    // Check max reconnect attempts
    if (conn.reconnectAttempts >= conn.options.maxReconnectAttempts) {
      console.error(`[ConnectionManager] ${name} max reconnection attempts reached`);
      return;
    }

    conn.reconnectAttempts = (conn.reconnectAttempts || 0) + 1;

    console.log(
      `[ConnectionManager] Scheduling reconnect ${conn.reconnectAttempts}/${conn.options.maxReconnectAttempts} for ${name}`
    );

    const timer = setTimeout(() => {
      console.log(`[ConnectionManager] Reconnecting ${name}...`);
      this.connect(name, conn.port, conn.type, conn.options)
        .then(() => {
          console.log(`[ConnectionManager] ${name} reconnected successfully`);
        })
        .catch((err) => {
          console.error(`[ConnectionManager] ${name} reconnect failed:`, err);
        });
    }, conn.options.reconnectInterval);

    this.reconnectIntervals.set(name, timer);
  }

  /**
   * Send initialization notification for MCP connections
   */
  sendInitialization(name) {
    const conn = this.connections.get(name);
    if (!conn || !conn.connected) return;

    // This will be called by the actual MCP server implementation
    // We just notify that connection is ready
    console.log(`[ConnectionManager] ${name} ready for initialization`);
  }

  /**
   * Handle incoming message from a connection
   */
  handleMessage(name, data) {
    const conn = this.connections.get(name);
    if (!conn) return;

    try {
      const message = JSON.parse(data);

      // Get the handler for this connection type
      const handler = this.messageHandlers.get(conn.type);
      if (handler) {
        handler(message, name);
      } else {
        console.warn(`[ConnectionManager] No handler for connection type: ${conn.type}`);
      }
    } catch (err) {
      console.error(`[ConnectionManager] Parse error for ${name}:`, err);
    }
  }

  /**
   * Send a message through a specific connection
   */
  send(name, message) {
    const conn = this.connections.get(name);
    if (!conn || !conn.connected) {
      console.warn(`[ConnectionManager] Cannot send - ${name} not connected`);
      return false;
    }

    try {
      conn.ws.send(JSON.stringify(message));
      return true;
    } catch (err) {
      console.error(`[ConnectionManager] Send error for ${name}:`, err);
      return false;
    }
  }

  /**
   * Check if a connection is active
   */
  isConnected(name) {
    const conn = this.connections.get(name);
    return conn ? conn.connected : false;
  }

  /**
   * Get connection status for all connections
   */
  getStatus() {
    const status = {};
    for (const [name, conn] of this.connections.entries()) {
      status[name] = {
        connected: conn.connected,
        port: conn.port,
        type: conn.type,
        reconnectAttempts: conn.reconnectAttempts || 0
      };
    }
    return status;
  }

  /**
   * Disconnect a specific connection
   */
  disconnect(name) {
    const conn = this.connections.get(name);
    if (conn) {
      conn.options.autoReconnect = false; // Disable auto-reconnect
      if (conn.ws) {
        conn.ws.close();
      }
      this.connections.delete(name);
    }

    // Clear reconnect timer
    if (this.reconnectIntervals.has(name)) {
      clearTimeout(this.reconnectIntervals.get(name));
      this.reconnectIntervals.delete(name);
    }
  }

  /**
   * Disconnect all connections
   */
  disconnectAll() {
    for (const name of this.connections.keys()) {
      this.disconnect(name);
    }
  }
}
