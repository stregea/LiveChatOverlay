/**
 * WebSocket Manager for Overlay
 *
 * Handles WebSocket connection lifecycle and message routing
 * for the live chat overlay client.
 *
 * @module overlayWebSocket
 */

/**
 * WebSocket connection instance
 * @type {WebSocket}
 */
let ws = null;

/**
 * Message handler callback
 * @type {Function}
 */
let messageHandler = null;

/**
 * Connect to the WebSocket server
 * Automatically determines protocol (ws/wss) based on page protocol
 * Includes automatic reconnection on disconnect
 *
 * @param {Function} onMessage - Callback function for handling incoming messages
 */
function connect(onMessage) {
  messageHandler = onMessage;

  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const wsUrl = `${protocol}//${window.location.host}`;

  ws = new WebSocket(wsUrl);

  ws.onopen = () => {
    console.log('✅ Connected to server');
    console.log('⏳ Waiting for configuration...');
  };

  ws.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      if (messageHandler) {
        messageHandler(data);
      }
    } catch (error) {
      console.error('❌ Error parsing message:', error);
    }
  };

  ws.onclose = () => {
    console.log('❌ Disconnected from server');
    console.log('🔄 Reconnecting in 3 seconds...');
    setTimeout(() => connect(onMessage), 3000);
  };

  ws.onerror = (error) => {
    console.error('❌ WebSocket error:', error);
  };
}

/**
 * Send a message to the server
 *
 * @param {Object} data - Data to send
 * @returns {boolean} True if message was sent
 */
function send(data) {
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(data));
    return true;
  }
  console.warn('⚠️  Cannot send message: WebSocket not connected');
  return false;
}

/**
 * Check if WebSocket is connected
 *
 * @returns {boolean} True if connected
 */
function isConnected() {
  return ws && ws.readyState === WebSocket.OPEN;
}

/**
 * Close the WebSocket connection
 */
function disconnect() {
  if (ws) {
    ws.close();
    ws = null;
  }
}

// Export public API
window.OverlayWebSocket = {
  connect,
  send,
  isConnected,
  disconnect
};

