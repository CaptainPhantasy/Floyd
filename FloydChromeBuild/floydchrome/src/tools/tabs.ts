/**
 * Tab Management Tools
 */

import type { ToolInput, ToolResult } from './types.js';

export class TabTools {
  /**
   * Create a new tab
   */
  static async createTab(params: ToolInput): Promise<ToolResult> {
    const { url } = params;

    const tab = await chrome.tabs.create({
      url: url || 'chrome://newtab/',
      active: true
    });

    return {
      success: true,
      data: {
        tabId: tab.id,
        url: tab.url || url
      }
    };
  }

  /**
   * Get all open tabs
   */
  static async getTabs(_params: ToolInput): Promise<ToolResult> {
    const tabs = await chrome.tabs.query({});

    return {
      success: true,
      data: {
        tabs: tabs.map(tab => ({
          id: tab.id,
          url: tab.url,
          title: tab.title,
          active: tab.active,
          windowId: tab.windowId
        }))
      }
    };
  }
}
