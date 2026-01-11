/**
 * Live Chat Overlay - Main Entry Point
 *
 * Coordinates all overlay modules and handles:
 * - WebSocket communication with server
 * - Message rendering and display
 * - Platform client connections (YouTube/Twitch)
 * - Configuration management
 *
 * Modular Architecture:
 * - overlayWebSocket.js: WebSocket connection management
 * - configManager.js: Configuration state and application
 * - messageRenderer.js: DOM creation for messages
 * - messageQueue.js: Message display queue management
 *
 * @requires OverlayWebSocket
 * @requires OverlayConfigManager
 * @requires MessageRenderer
 * @requires MessageQueue
 * @requires YouTubeChatClient (youtube.js)
 * @requires TwitchChatClient (twitch.js)
 */

// Platform client instances
let youtubeClient = null;
let twitchClient = null;

/**
 * Handle incoming WebSocket messages
 * Routes messages to appropriate handlers
 *
 * @param {Object} data - Parsed message data
 * @param {string} data.type - Message type identifier
 * @param {*} data.data - Message payload
 */
function handleMessage(data) {
  switch (data.type) {
    case 'config':
      handleConfigUpdate(data.data);
      break;

    case 'chat-message':
      handleChatMessage(data.data);
      break;

    case 'test-sound':
      handleTestSound();
      break;

    default:
      console.warn(`⚠️  Unknown message type: ${data.type}`);
  }
}

/**
 * Handle configuration updates from server
 * Updates config, applies changes, and manages platform connections
 *
 * @param {Object} configUpdate - Configuration updates
 */
function handleConfigUpdate(configUpdate) {
  // Update configuration
  OverlayConfigManager.updateConfig(configUpdate);
  OverlayConfigManager.applyConfig();

  // Handle platform connections if config includes platform data
  if (configUpdate.platforms) {
    handlePlatformConnections(configUpdate.platforms);
  }
}

/**
 * Handle platform connection state changes
 * Supports multistream: can connect to both YouTube and Twitch simultaneously
 *
 * @param {Object} platforms - Platform configuration
 * @param {Object} platforms.youtube - YouTube config
 * @param {Object} platforms.twitch - Twitch config
 */
function handlePlatformConnections(platforms) {
  // Handle YouTube connection
  if (platforms.youtube.enabled && platforms.youtube.videoId) {
    connectYouTube(platforms.youtube.videoId);
  } else if (youtubeClient && !platforms.youtube.enabled) {
    disconnectYouTube();
  }

  // Handle Twitch connection
  if (platforms.twitch.enabled && platforms.twitch.channelId) {
    connectTwitch(platforms.twitch.channelId);
  } else if (twitchClient && !platforms.twitch.enabled) {
    disconnectTwitch();
  }

  // Log multistream status
  const youtubeActive = platforms.youtube.enabled;
  const twitchActive = platforms.twitch.enabled;

  if (youtubeActive && twitchActive) {
    console.log('📡 Multistream mode: YouTube + Twitch');
  } else if (youtubeActive) {
    console.log('🎥 Connected to YouTube only');
  } else if (twitchActive) {
    console.log('🟣 Connected to Twitch only');
  }
}

/**
 * Handle incoming chat messages
 * Creates message element and adds to display queue
 *
 * @param {Object} messageData - Chat message data
 */
function handleChatMessage(messageData) {
  const config = OverlayConfigManager.getConfig();

  // Log message
  console.log(`💬 [${messageData.platform}] ${messageData.username}: ${messageData.text}`);

  // Create message element
  const messageElement = MessageRenderer.createMessageElement(messageData, config);

  // Add to queue (will auto-play sound if enabled)
  const shouldPlaySound = messageData.type !== 'test';
  MessageQueue.addMessage(messageElement, config, shouldPlaySound);
}

/**
 * Handle test sound requests
 * Plays sound without adding a message
 */
function handleTestSound() {
  const config = OverlayConfigManager.getConfig();
  MessageQueue.playSound(config.volume);
  console.log('🔊 Test sound played');
}

/**
 * Connect to YouTube chat
 * Creates new client or reconnects if video ID changed
 *
 * @param {string} videoId - YouTube video ID
 */
function connectYouTube(videoId) {
  // Only connect if not already connected to same video
  if (youtubeClient && youtubeClient.videoId === videoId) {
    return;
  }

  // Disconnect existing client
  if (youtubeClient) {
    youtubeClient.disconnect();
  }

  console.log(`🎥 Connecting to YouTube: ${videoId}`);

  // Create new client
  youtubeClient = new YouTubeChatClient(videoId);

  // Configure with API key if available
  const config = OverlayConfigManager.getConfig();
  if (config.youtubeApiKey) {
    youtubeClient.setApiKey(config.youtubeApiKey);
    console.log('✅ YouTube API key configured');
  } else {
    console.log('⚠️  No YouTube API key - using simulation mode');
  }

  // Connect
  youtubeClient.connect();
}

/**
 * Disconnect from YouTube chat
 */
function disconnectYouTube() {
  if (youtubeClient) {
    console.log('🎥 Disconnecting YouTube');
    youtubeClient.disconnect();
    youtubeClient = null;
  }
}

/**
 * Connect to Twitch chat
 * Creates new client or reconnects if channel changed
 *
 * @param {string} channelName - Twitch channel name
 */
function connectTwitch(channelName) {
  // Only connect if not already connected to same channel
  if (twitchClient && twitchClient.channelName === channelName) {
    return;
  }

  // Disconnect existing client
  if (twitchClient) {
    twitchClient.disconnect();
  }

  console.log(`🟣 Connecting to Twitch: ${channelName}`);

  // Create and connect new client
  twitchClient = new TwitchChatClient(channelName);

  // Set up message callback to route messages to overlay
  twitchClient.onMessage = (messageData) => {
    handleChatMessage(messageData);
  };

  twitchClient.connect();
}

/**
 * Disconnect from Twitch chat
 */
function disconnectTwitch() {
  if (twitchClient) {
    console.log('🟣 Disconnecting Twitch');
    twitchClient.disconnect();
    twitchClient = null;
  }
}

/**
 * Initialize the overlay
 * Sets up message queue and establishes WebSocket connection
 */
function initialize() {
  console.log('');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('🎥  Live Chat Overlay');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('');

  // Initialize message queue
  MessageQueue.initialize();

  // Connect to server
  OverlayWebSocket.connect(handleMessage);

  console.log('✅ Overlay initialized');
}

// Start the overlay when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initialize);
} else {
  initialize();
}

