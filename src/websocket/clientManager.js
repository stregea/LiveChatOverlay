/**
 * Client Manager - Manages WebSocket client connections
 *
 * Handles client lifecycle, message broadcasting, and connection tracking
 * for the Live Chat Overlay system.
 *
 * @module clientManager
 */

const WebSocket = require('ws');

/**
 * Set of all connected WebSocket clients
 * @type {Set<WebSocket>}
 */
const clients = new Set();

/**
 * Add a new client to the managed set
 * @param {WebSocket} client - WebSocket client to add
 */
function addClient(client) {
  clients.add(client);
  console.log(`✅ Client connected. Total clients: ${clients.size}`);
}

/**
 * Remove a client from the managed set
 * @param {WebSocket} client - WebSocket client to remove
 */
function removeClient(client) {
  clients.delete(client);
  console.log(`👋 Client disconnected. Total clients: ${clients.size}`);
}

/**
 * Get the current number of connected clients
 * @returns {number} Number of active connections
 */
function getClientCount() {
  return clients.size;
}

/**
 * Broadcast a message to all connected clients
 * Only sends to clients in OPEN state
 *
 * @param {Object} data - Data object to broadcast
 * @param {string} data.type - Message type identifier
 * @param {*} data.data - Message payload
 */
function broadcast(data) {
  const message = JSON.stringify(data);
  let sentCount = 0;

  clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
      sentCount++;
    }
  });

  // Log broadcast (only for non-routine messages)
  if (data.type !== 'config') {
    console.log(`📡 Broadcast to ${sentCount} client(s): ${data.type}`);
  }
}

/**
 * Send a message to a specific client
 * Only sends if client is in OPEN state
 *
 * @param {WebSocket} client - Target WebSocket client
 * @param {Object} data - Data object to send
 * @returns {boolean} True if message was sent
 */
function sendToClient(client, data) {
  if (client.readyState === WebSocket.OPEN) {
    client.send(JSON.stringify(data));
    return true;
  }
  return false;
}

/**
 * Close all client connections gracefully
 * Used during server shutdown
 *
 * @param {number} code - WebSocket close code (default: 1000)
 * @param {string} reason - Close reason message
 */
function closeAllConnections(code = 1000, reason = 'Server shutting down') {
  console.log(`🔌 Closing ${clients.size} client connection(s)...`);

  clients.forEach(client => {
    try {
      client.close(code, reason);
    } catch (error) {
      console.error('Error closing client connection:', error.message);
    }
  });

  clients.clear();
}

module.exports = {
  addClient,
  removeClient,
  getClientCount,
  broadcast,
  sendToClient,
  closeAllConnections
};

