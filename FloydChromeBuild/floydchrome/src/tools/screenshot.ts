/**
 * Screenshot Tools
 * Capture screenshots of pages, elements, and viewports for Computer Use
 */

import type { ToolInput, ToolResult } from './types.js';

export class ScreenshotTools {
  /**
   * Capture a screenshot of the visible viewport
   * Returns base64-encoded PNG data
   */
  static async captureViewport(params: ToolInput): Promise<ToolResult> {
    const { tabId } = params;

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

    // Attach debugger if needed
    try {
      await chrome.debugger.attach({ tabId: targetTabId }, '1.3');
    } catch (error: any) {
      if (!error.message?.includes('Another debugger') && !error.message?.includes('Already attached')) {
        return {
          success: false,
          error: `Failed to attach debugger: ${error.message}`
        };
      }
    }

    try {
      // Capture screenshot
      const result = await chrome.debugger.sendCommand(
        { tabId: targetTabId },
        'Page.captureScreenshot'
      );

      const dataUrl = `data:image/png;base64,${result.data}`;

      return {
        success: true,
        data: {
          tabId: targetTabId,
          dataUrl,
          format: 'png',
          encoding: 'base64'
        }
      };
    } catch (error: any) {
      return {
        success: false,
        error: `Failed to capture screenshot: ${error.message}`
      };
    }
  }

  /**
   * Capture a screenshot of the full page (including scrollable areas)
   */
  static async captureFullPage(params: ToolInput): Promise<ToolResult> {
    const { tabId } = params;

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

    // Attach debugger if needed
    try {
      await chrome.debugger.attach({ tabId: targetTabId }, '1.3');
    } catch (error: any) {
      if (!error.message?.includes('Another debugger') && !error.message?.includes('Already attached')) {
        return {
          success: false,
          error: `Failed to attach debugger: ${error.message}`
        };
      }
    }

    try {
      // Get page metrics to determine full size
      const metricsResult = await chrome.debugger.sendCommand(
        { tabId: targetTabId },
        'Page.getLayoutMetrics'
      );

      const contentSize = metricsResult.contentSize;
      const viewport = metricsResult.layoutViewport;

      // Capture full page screenshot
      const result = await chrome.debugger.sendCommand(
        { tabId: targetTabId },
        'Page.captureScreenshot',
        {
          format: 'png',
          quality: 100,
          clip: {
            x: 0,
            y: 0,
            width: contentSize.width,
            height: contentSize.height,
            scale: 1
          }
        }
      );

      const dataUrl = `data:image/png;base64,${result.data}`;

      return {
        success: true,
        data: {
          tabId: targetTabId,
          dataUrl,
          format: 'png',
          encoding: 'base64',
          width: contentSize.width,
          height: contentSize.height,
          viewportWidth: viewport.clientWidth,
          viewportHeight: viewport.clientHeight
        }
      };
    } catch (error: any) {
      return {
        success: false,
        error: `Failed to capture full page screenshot: ${error.message}`
      };
    }
  }

  /**
   * Capture a screenshot of a specific element
   */
  static async captureElement(params: ToolInput): Promise<ToolResult> {
    const { selector, tabId } = params;

    if (!selector) {
      return {
        success: false,
        error: 'Selector is required'
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

    // Attach debugger if needed
    try {
      await chrome.debugger.attach({ tabId: targetTabId }, '1.3');
    } catch (error: any) {
      if (!error.message?.includes('Another debugger') && !error.message?.includes('Already attached')) {
        return {
          success: false,
          error: `Failed to attach debugger: ${error.message}`
        };
      }
    }

    try {
      // Get element bounds using scripting
      const results = await chrome.scripting.executeScript({
        target: { tabId: targetTabId },
        func: (sel: string) => {
          const element = document.querySelector(sel);
          if (!element) return null;

          const rect = element.getBoundingClientRect();
          return {
            x: Math.max(0, rect.left),
            y: Math.max(0, rect.top),
            width: rect.width,
            height: rect.height
          };
        },
        args: [selector]
      });

      if (!results || !results[0] || !results[0].result) {
        return {
          success: false,
          error: `Element not found: ${selector}`
        };
      }

      const bounds = results[0].result as { x: number; y: number; width: number; height: number };

      // Capture screenshot of element
      const result = await chrome.debugger.sendCommand(
        { tabId: targetTabId },
        'Page.captureScreenshot',
        {
          format: 'png',
          quality: 100,
          clip: {
            x: bounds.x,
            y: bounds.y,
            width: bounds.width,
            height: bounds.height,
            scale: 1
          }
        }
      );

      const dataUrl = `data:image/png;base64,${result.data}`;

      return {
        success: true,
        data: {
          tabId: targetTabId,
          selector,
          dataUrl,
          format: 'png',
          encoding: 'base64',
          bounds
        }
      };
    } catch (error: any) {
      return {
        success: false,
        error: `Failed to capture element screenshot: ${error.message}`
      };
    }
  }

  /**
   * Capture screenshot and return as base64 data URL
   * This is the main entry point for Computer Use
   */
  static async screenshot(params: ToolInput): Promise<ToolResult> {
    const { fullPage, selector, tabId } = params;

    if (selector) {
      return this.captureElement({ selector, tabId });
    }

    if (fullPage) {
      return this.captureFullPage({ tabId });
    }

    return this.captureViewport({ tabId });
  }
}
