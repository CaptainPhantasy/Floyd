/**
 * Content Script
 * Injected into web pages for direct interaction
 */

console.log('[FloydChrome] Content script loaded');

// Listen for messages from background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'ping') {
    sendResponse({ status: 'ok' });
    return true;
  }

  if (message.type === 'get_selection') {
    const selection = window.getSelection()?.toString() || '';
    sendResponse({ selection });
    return true;
  }

  if (message.type === 'get_page_info') {
    sendResponse({
      title: document.title,
      url: window.location.href,
      canRead: document.body !== null
    });
    return true;
  }

  return false;
});

// Notify background script when content script is ready
chrome.runtime.sendMessage({
  type: 'content_script_ready',
  url: window.location.href
});

// Store reference for debugging
if (typeof globalThis !== 'undefined') {
  (globalThis as any).floydChromeContent = {
    version: '2.0.0',
    ready: true
  };
}
