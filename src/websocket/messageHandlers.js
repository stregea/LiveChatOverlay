/**
 * WebSocket Message Handlers
 *
 * Handles all incoming WebSocket messages from clients including:
 * - Configuration updates
 * - Chat messages
 * - Platform connection/disconnection
 * - Test messages and sounds
 *
 * @module messageHandlers
 */

const clientManager = require('./clientManager');
const configManager = require('./configManager');

/**
 * Main message router - dispatches messages to appropriate handlers
 *
 * @param {WebSocket} ws - WebSocket connection that sent the message
 * @param {string} message - Raw message string
 */
function handleMessage(ws, message) {
  try {
    const data = JSON.parse(message);

    // Route message based on type
    switch (data.type) {
      case 'config':
        handleConfigUpdate(data.data);
        break;

      case 'chat-message':
        handleChatMessage(data.data);
        break;

      case 'connect':
        handlePlatformConnect(data.data);
        break;

      case 'disconnect':
        handlePlatformDisconnect(data.data);
        break;

      case 'test-sound':
        handleTestSound();
        break;

      default:
        console.warn(`⚠️  Unknown message type: ${data.type}`);
    }
  } catch (error) {
    console.error('❌ Error parsing client message:', error.message);
  }
}

/**
 * Handle configuration updates from control panel
 * Updates config and broadcasts to all clients
 *
 * @param {Object} configUpdate - Configuration changes
 */
function handleConfigUpdate(configUpdate) {
  const updatedConfig = configManager.updateConfig(configUpdate);

  // Broadcast updated configuration to all clients
  clientManager.broadcast({
    type: 'config',
    data: updatedConfig
  });
}

/**
 * Handle chat messages from platforms
 * Broadcasts messages to all overlay clients
 *
 * @param {Object} messageData - Chat message data
 * @param {string} messageData.username - User who sent the message
 * @param {string} messageData.text - Message text content
 * @param {string} messageData.platform - Platform origin (youtube/twitch)
 */
function handleChatMessage(messageData) {
  console.log(`💬 [${messageData.platform}] ${messageData.username}: ${messageData.text}`);

  // Broadcast message to all overlay clients
  clientManager.broadcast({
    type: 'chat-message',
    data: messageData
  });
}

/**
 * Handle platform connection requests
 * Supports multistream: can connect to multiple platforms simultaneously
 *
 * @param {Object} connectionData - Platform connection details
 * @param {string} connectionData.platform - Platform name ('youtube' or 'twitch')
 * @param {string} connectionData.videoId - YouTube video ID (if YouTube)
 * @param {string} connectionData.channelId - Channel name (if Twitch)
 */
function handlePlatformConnect(connectionData) {
  const { platform } = connectionData;

  configManager.connectPlatform(platform, connectionData);

  // Broadcast updated configuration to all clients
  clientManager.broadcast({
    type: 'config',
    data: configManager.getConfig()
  });
}

/**
 * Handle platform disconnection requests
 * If no platform specified, disconnects all platforms
 *
 * @param {Object} disconnectData - Disconnect request data
 * @param {string} [disconnectData.platform] - Platform to disconnect (optional)
 */
function handlePlatformDisconnect(disconnectData) {
  const platform = disconnectData?.platform || null;

  configManager.disconnectPlatform(platform);

  // Broadcast updated configuration to all clients
  clientManager.broadcast({
    type: 'config',
    data: configManager.getConfig()
  });
}

/**
 * Handle test sound requests
 * Broadcasts test-sound event to all overlay clients
 */
function handleTestSound() {
  clientManager.broadcast({
    type: 'test-sound',
    data: {}
  });
  console.log('🔊 Test sound triggered');
}

module.exports = {
  handleMessage,
  handleConfigUpdate,
  handleChatMessage,
  handlePlatformConnect,
  handlePlatformDisconnect,
  handleTestSound
};

