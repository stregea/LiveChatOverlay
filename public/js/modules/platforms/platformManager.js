/**
 * Platform Connection Manager
 *
 * Coordinates connections to multiple streaming platforms and manages
 * multistream functionality. Acts as a facade for platform-specific
 * connection modules.
 *
 * Features:
 * - Multistream support (YouTube + Twitch simultaneously)
 * - Connection status tracking
 * - Master disconnect functionality
 *
 * @module platforms/platformManager
 * @requires YouTubeConnection
 * @requires TwitchConnection
 */

/**
 * Connect to YouTube
 * Delegates to YouTube connection module
 */
function connectYouTube() {
  return window.YouTubeConnection.connect();
}

/**
 * Disconnect from YouTube
 * Delegates to YouTube connection module
 */
function disconnectYouTube() {
  window.YouTubeConnection.disconnect();
}

/**
 * Connect to Twitch
 * Delegates to Twitch connection module
 */
function connectTwitch() {
  return window.TwitchConnection.connect();
}

/**
 * Disconnect from Twitch
 * Delegates to Twitch connection module
 */
function disconnectTwitch() {
  window.TwitchConnection.disconnect();
}

/**
 * Disconnect from all platforms
 * Sends master disconnect command to server
 */
function disconnectAll() {
  window.ControlWebSocket.send('disconnect', {});
  console.log('🔌 Disconnecting all platforms');
}

/**
 * Update platform connection status UI
 * Routes to platform-specific status update
 *
 * @param {string} platform - Platform name ('youtube' or 'twitch')
 * @param {boolean} connected - Connection state
 */
function updatePlatformStatus(platform, connected) {
  if (platform === 'youtube') {
    window.YouTubeConnection.updateStatus(connected);
  } else if (platform === 'twitch') {
    window.TwitchConnection.updateStatus(connected);
  }
}

/**
 * Auto-detect YouTube live stream
 * Delegates to YouTube connection module
 */
function autoDetectLiveStream() {
  window.YouTubeConnection.autoDetectLiveStream();
}

// Export public API
window.PlatformManager = {
  connectYouTube,
  disconnectYouTube,
  connectTwitch,
  disconnectTwitch,
  disconnectAll,
  updatePlatformStatus,
  autoDetectLiveStream
};

