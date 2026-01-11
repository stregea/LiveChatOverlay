/**
 * Control Panel WebSocket Manager
 *
 * Handles WebSocket connection lifecycle and communication
 * with the server for the control panel interface.
 *
 * @module controlWebSocket
 */

/**
 * WebSocket connection instance
 * @type {WebSocket}
 */
let ws = null;

/**
 * Connection state
 * @type {boolean}
 */
let isConnected = false;

/**
 * Config update callback
 * @type {Function}
 */
let onConfigReceived = null;

/**
 * Connect to WebSocket server
 * Automatically reconnects on disconnect
 *
 * @param {Function} configCallback - Called when config is received from server
 */
function connect(configCallback) {
  onConfigReceived = configCallback;

  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const wsUrl = `${protocol}//${window.location.host}`;

  ws = new WebSocket(wsUrl);

  ws.onopen = () => {
    console.log('✅ Control panel connected to server');
    updateConnectionStatus(true);
  };

  ws.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      console.log('📨 WebSocket message received:', data);

      if (data.type === 'config' && onConfigReceived) {
        console.log('⚙️  Config received, youtubeChannelId:', data.data.youtubeChannelId);
        onConfigReceived(data.data);
      }
    } catch (error) {
      console.error('❌ Error parsing message:', error);
    }
  };

  ws.onclose = () => {
    console.log('❌ Disconnected from server. Reconnecting...');
    updateConnectionStatus(false);
    setTimeout(() => connect(configCallback), 3000);
  };

  ws.onerror = (error) => {
    console.error('❌ WebSocket error:', error);
    updateConnectionStatus(false);
  };
}

/**
 * Update connection status UI
 *
 * @param {boolean} connected - Connection state
 */
function updateConnectionStatus(connected) {
  isConnected = connected;
  const indicator = document.getElementById('status-indicator');
  const statusText = document.getElementById('status-text');

  if (!indicator || !statusText) return;

  if (connected) {
    indicator.classList.add('connected');
    indicator.classList.remove('disconnected');
    statusText.textContent = 'Server: Connected';
  } else {
    indicator.classList.remove('connected');
    indicator.classList.add('disconnected');
    statusText.textContent = 'Server: Disconnected';
  }
}

/**
 * Send configuration update to server
 *
 * @param {Object} config - Configuration changes
 * @returns {boolean} True if sent successfully
 */
function sendConfig(config) {
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({
      type: 'config',
      data: config
    }));
    return true;
  }
  console.warn('⚠️  Cannot send config: WebSocket not connected');
  return false;
}

/**
 * Send chat message to overlay
 *
 * @param {Object} message - Chat message data
 * @returns {boolean} True if sent successfully
 */
function sendChatMessage(message) {
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({
      type: 'chat-message',
      data: message
    }));
    return true;
  }
  console.warn('⚠️  Cannot send message: WebSocket not connected');
  return false;
}

/**
 * Send message to server
 *
 * @param {string} type - Message type
 * @param {Object} data - Message data
 * @returns {boolean} True if sent successfully
 */
function send(type, data) {
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({ type, data }));
    return true;
  }
  console.warn('⚠️  Cannot send message: WebSocket not connected');
  return false;
}

/**
 * Check if WebSocket is connected
 *
 * @returns {boolean} Connection state
 */
function isWebSocketConnected() {
  return isConnected && ws && ws.readyState === WebSocket.OPEN;
}

// Export public API
window.ControlWebSocket = {
  connect,
  sendConfig,
  sendChatMessage,
  send,
  isConnected: isWebSocketConnected
};

