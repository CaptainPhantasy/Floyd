/**
 * Navigation Tools
 */

import type { ToolInput, ToolResult } from './types.js';

export class NavigationTools {
  /**
   * Navigate to a URL
   */
  static async navigate(params: ToolInput): Promise<ToolResult> {
    const { url, tabId } = params;

    if (!url) {
      return {
        success: false,
        error: 'URL is required'
      };
    }

    // Validate URL
    try {
      new URL(url);
    } catch {
      return {
        success: false,
        error: `Invalid URL: ${url}`
      };
    }

    // Get target tab
    let targetTabId = tabId;
    if (targetTabId === undefined) {
      const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!activeTab) {
        return {
          success: false,
          error: 'No active tab found'
        };
      }
      targetTabId = activeTab.id!;
    }

    // Navigate
    await chrome.tabs.update(targetTabId, { url });

    // Wait for navigation to complete
    return new Promise((resolve) => {
      const listener = (updatedTabId: number, changeInfo: chrome.tabs.TabChangeInfo) => {
        if (updatedTabId === targetTabId && changeInfo.status === 'complete') {
          chrome.tabs.onUpdated.removeListener(listener);
          resolve({
            success: true,
            data: {
              tabId: targetTabId,
              url
            }
          });
        }
      };
      chrome.tabs.onUpdated.addListener(listener);

      // Timeout after 30 seconds
      setTimeout(() => {
        chrome.tabs.onUpdated.removeListener(listener);
        resolve({
          success: true,
          data: {
            tabId: targetTabId,
            url,
            warning: 'Navigation timeout - page may still be loading'
          }
        });
      }, 30000);
    });
  }
}
