/**
 * FloydChrome Side Panel
 *
 * User interface for the FloydChrome extension.
 * Provides connection status and basic controls.
 */

// Initialize side panel when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  initSidePanel();
});

function initSidePanel() {
  const statusElement = document.getElementById('connection-status');
  const connectButton = document.getElementById('connect-btn') as HTMLButtonElement;
  const messageLog = document.getElementById('message-log');

  // Check connection status on load
  checkConnectionStatus();

  // Handle connect button click
  connectButton?.addEventListener('click', () => {
    sendMessageToBackground({ type: 'connect' });
  });

  // Listen for connection status updates
  chrome.runtime.onMessage.addListener((message) => {
    if (message.type === 'connection_status') {
      updateStatus(message.status);
    }
    if (message.type === 'log') {
      addLog(message.text);
    }
  });

  function checkConnectionStatus() {
    chrome.runtime.sendMessage({ type: 'get_status' }, (response) => {
      if (response) {
        updateStatus(response.status);
      }
    });
  }

  function updateStatus(status: string) {
    if (statusElement) {
      statusElement.textContent = status;
      statusElement.className = status === 'connected' ? 'status-connected' : 'status-disconnected';
    }
    if (connectButton) {
      connectButton.textContent = status === 'connected' ? 'Disconnect' : 'Connect';
    }
  }

  function addLog(text: string) {
    if (messageLog) {
      const entry = document.createElement('div');
      entry.className = 'log-entry';
      entry.textContent = `[${new Date().toLocaleTimeString()}] ${text}`;
      messageLog.appendChild(entry);
    }
  }

  function sendMessageToBackground(message: unknown) {
    chrome.runtime.sendMessage(message);
  }
}
