/**
 * MCP-related Slash Commands - Floyd Wrapper
 *
 * Commands for managing MCP server connections
 */

import type { SlashCommand } from './slash-commands.js';

// Command: /mcp-status
export const mcpStatusCommand: SlashCommand = {
  name: 'mcp-status',
  description: 'Show MCP connection status',
  usage: '/mcp-status',
  aliases: ['mcp', 'mcplist'],
  handler: async (ctx) => {
    try {
      const { mcpManager } = await import('../mcp/mcp-manager.js');

      const clientCount = mcpManager.getClientCount();
      const isRunning = mcpManager.isServerRunning();

      ctx.terminal.section('MCP Status');
      ctx.terminal.info(`Connected Clients: ${clientCount}`);
      ctx.terminal.info(`WebSocket Server: ${isRunning ? '🟢 Running' : '⚪ Not Running'}`);

      if (clientCount === 0) {
        ctx.terminal.blank();
        ctx.terminal.muted('No MCP servers connected.');
        ctx.terminal.muted('Create .floyd/mcp.json to configure MCP servers.');
      }
    } catch (error) {
      ctx.terminal.error(`Failed to get MCP status: ${error instanceof Error ? error.message : String(error)}`);
    }
  },
};

// Command: /mcp-reconnect
export const mcpReconnectCommand: SlashCommand = {
  name: 'mcp-reconnect',
  description: 'Reconnect to all MCP servers',
  usage: '/mcp-reconnect',
  handler: async (ctx) => {
    try {
      const { mcpManager } = await import('../mcp/mcp-manager.js');

      ctx.terminal.info('Disconnecting from MCP servers...');
      await mcpManager.disconnectAll();

      ctx.terminal.info('Reconnecting to MCP servers...');
      await mcpManager.connectAll();

      const clientCount = mcpManager.getClientCount();
      ctx.terminal.success(`Reconnected to ${clientCount} MCP server(s)`);
    } catch (error) {
      ctx.terminal.error(`Reconnection failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  },
};

// Command: /mcp-call
export const mcpCallCommand: SlashCommand = {
  name: 'mcp-call',
  description: 'Call an MCP tool directly',
  usage: '/mcp-call <tool-name> <json-args>',
  handler: async (ctx) => {
    const toolName = ctx.args[0];
    const argsJson = ctx.args.slice(1).join(' ');

    if (!toolName) {
      ctx.terminal.error('Usage: /mcp-call <tool-name> <json-args>');
      ctx.terminal.muted('Example: /mcp-call cache_store \'{"tier":"reasoning","key":"test","value":"hello"}\'');
      return;
    }

    try {
      const { mcpManager } = await import('../mcp/mcp-manager.js');

      let args: Record<string, unknown> = {};
      if (argsJson) {
        args = JSON.parse(argsJson);
      }

      ctx.terminal.info(`Calling MCP tool: ${toolName}...`);
      const result = await mcpManager.callTool(toolName, args);

      ctx.terminal.success('Tool call result:');
      ctx.terminal.muted(JSON.stringify(result, null, 2));
    } catch (error) {
      ctx.terminal.error(`Tool call failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  },
};

// Export all MCP commands
export const mcpCommands: SlashCommand[] = [
  mcpStatusCommand,
  mcpReconnectCommand,
  mcpCallCommand,
];
