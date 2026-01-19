/**
 * Interaction Tools
 * Click, type, and interact with page elements
 */

import type { ToolInput, ToolResult } from './types.js';

export class InteractionTools {
  /**
   * Click element at coordinates or by selector
   */
  static async click(params: ToolInput): Promise<ToolResult> {
    const { x, y, selector, tabId } = params;

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

    // Attach debugger
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
      let clickX = x;
      let clickY = y;

      // If selector provided, get element coordinates
      if (selector && (clickX === undefined || clickY === undefined)) {
        const results = await chrome.scripting.executeScript({
          target: { tabId: targetTabId },
          func: (sel: string) => {
            const element = document.querySelector(sel);
            if (!element) return null;

            const rect = element.getBoundingClientRect();
            return {
              x: rect.left + rect.width / 2,
              y: rect.top + rect.height / 2
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

        const coords = results[0].result as { x: number; y: number };
        clickX = coords.x;
        clickY = coords.y;
      }

      if (clickX === undefined || clickY === undefined) {
        return {
          success: false,
          error: 'Either coordinates (x, y) or selector must be provided'
        };
      }

      // Dispatch mouse events
      await chrome.debugger.sendCommand(
        { tabId: targetTabId },
        'Input.dispatchMouseEvent',
        {
          type: 'mousePressed',
          x: clickX,
          y: clickY,
          button: 'left',
          clickCount: 1
        }
      );

      await chrome.debugger.sendCommand(
        { tabId: targetTabId },
        'Input.dispatchMouseEvent',
        {
          type: 'mouseReleased',
          x: clickX,
          y: clickY,
          button: 'left',
          clickCount: 1
        }
      );

      return {
        success: true,
        data: {
          tabId: targetTabId,
          coordinates: { x: clickX, y: clickY },
          selector: selector || null
        }
      };
    } catch (error: any) {
      return {
        success: false,
        error: `Failed to click: ${error.message}`
      };
    }
  }

  /**
   * Type text into focused element
   */
  static async type(params: ToolInput): Promise<ToolResult> {
    const { text, tabId } = params;

    if (!text) {
      return {
        success: false,
        error: 'Text is required'
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

    // Attach debugger
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
      // Insert text using Input.insertText (more reliable than key events)
      await chrome.debugger.sendCommand(
        { tabId: targetTabId },
        'Input.insertText',
        { text: String(text) }
      );

      return {
        success: true,
        data: {
          tabId: targetTabId,
          text,
          length: String(text).length
        }
      };
    } catch (error: any) {
      return {
        success: false,
        error: `Failed to type: ${error.message}`
      };
    }
  }
}
