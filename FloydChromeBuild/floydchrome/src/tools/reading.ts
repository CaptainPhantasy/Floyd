/**
 * Reading Tools
 * Extract information from pages
 */

import { sanitizeContent } from '../safety/sanitizer.js';
import type { ToolInput, ToolResult } from './types.js';

interface A11yNode {
  name?: string;
  role?: string;
  value?: string;
  description?: string;
  children?: A11yNode[];
}

interface MatchResult {
  node: A11yNode;
  score: number;
  path: string;
}

export class ReadingTools {
  /**
   * Get semantic accessibility tree of the page
   */
  static async readPage(params: ToolInput): Promise<ToolResult> {
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
      // Already attached or error
      if (!error.message?.includes('Another debugger') && !error.message?.includes('Already attached')) {
        return {
          success: false,
          error: `Failed to attach debugger: ${error.message}`
        };
      }
    }

    try {
      // Get DOM structure
      const domResult = await chrome.debugger.sendCommand(
        { tabId: targetTabId },
        'DOM.getFlattenedDocument',
        { depth: -1, pierce: true }
      );

      // Get accessibility tree
      const a11yResult = await chrome.debugger.sendCommand(
        { tabId: targetTabId },
        'Accessibility.getFullAXTree'
      );

      // Sanitize content before sending to AI
      const sanitized = sanitizeContent({
        dom: domResult,
        accessibility: a11yResult
      });

      return {
        success: true,
        data: {
          tabId: targetTabId,
          accessibilityTree: sanitized.accessibility,
          domStructure: sanitized.dom
        }
      };
    } catch (error: any) {
      return {
        success: false,
        error: `Failed to read page: ${error.message}`
      };
    }
  }

  /**
   * Extract visible text content from the page
   */
  static async getPageText(params: ToolInput): Promise<ToolResult> {
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

    // Inject script to extract text
    const results = await chrome.scripting.executeScript({
      target: { tabId: targetTabId },
      func: () => {
        // Extract visible text
        const walker = document.createTreeWalker(
          document.body!,
          NodeFilter.SHOW_TEXT,
          {
            acceptNode: (node: Node) => {
              // Skip hidden elements
              const parent = node.parentElement;
              if (!parent) return NodeFilter.FILTER_REJECT;

              const style = window.getComputedStyle(parent);
              if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') {
                return NodeFilter.FILTER_REJECT;
              }

              // Only include non-empty text
              return node.textContent?.trim() ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
            }
          }
        );

        const textNodes: string[] = [];
        let node: Node | null;
        while (node = walker.nextNode()) {
          textNodes.push(node.textContent!.trim());
        }

        return textNodes.join('\n');
      }
    });

    if (!results || !results[0] || !results[0].result) {
      return {
        success: false,
        error: 'Failed to extract page text'
      };
    }

    const text = results[0].result as string;

    // Sanitize content
    const sanitized = sanitizeContent({ text });

    return {
      success: true,
      data: {
        tabId: targetTabId,
        text: sanitized.text
      }
    };
  }

  /**
   * Find element by natural language query
   */
  static async find(params: ToolInput): Promise<ToolResult> {
    const { query, tabId } = params;

    if (!query) {
      return {
        success: false,
        error: 'Query is required'
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

    // Get accessibility tree
    const pageData = await this.readPage({ tabId: targetTabId });

    if (!pageData.success || !pageData.data) {
      return pageData;
    }

    // Simple fuzzy matching (can be enhanced with AI)
    const queryLower = query.toString().toLowerCase();
    const matches: MatchResult[] = [];

    // Search in accessibility tree
    const searchInTree = (node: any, path = '') => {
      if (!node) return;

      const name = (node.name || '').toLowerCase();
      const role = (node.role || '').toLowerCase();
      const value = (node.value || '').toLowerCase();

      const score =
        (name.includes(queryLower) ? 3 : 0) +
        (role.includes(queryLower) ? 2 : 0) +
        (value.includes(queryLower) ? 1 : 0);

      if (score > 0) {
        matches.push({
          node,
          score,
          path: path + '/' + (node.name || node.role || 'element')
        });
      }

      if (node.children) {
        node.children.forEach((child: any, idx: number) => {
          searchInTree(child, `${path}/${idx}`);
        });
      }
    };

    const a11yTree = pageData.data.accessibilityTree as any;
    if (a11yTree && a11yTree.nodes) {
      a11yTree.nodes.forEach((node: any, idx: number) => {
        searchInTree(node, `/${idx}`);
      });
    }

    // Sort by score and return top matches
    matches.sort((a, b) => b.score - a.score);

    return {
      success: true,
      data: {
        tabId: targetTabId,
        query,
        matches: matches.slice(0, 10).map(m => ({
          name: m.node.name,
          role: m.node.role,
          value: m.node.value,
          score: m.score,
          path: m.path
        }))
      }
    };
  }
}
