/**
 * Configuration Manager - Manages runtime configuration state
 *
 * Handles configuration updates, platform connection state,
 * and provides utilities for querying active connections.
 *
 * @module configManager
 */

const config = require('../../config');

/**
 * Current runtime configuration state
 * Merges default config with dynamic runtime changes
 * Supports multistream: simultaneous connections to multiple platforms
 */
let currentConfig = {
  // Platform connections (can have multiple active simultaneously)
  platforms: {
    youtube: {
      enabled: false,
      videoId: config.youtube.defaultVideoId || ''
    },
    twitch: {
      enabled: false,
      channelId: config.twitch.defaultChannel || ''
    }
  },

  // Display and UI settings
  theme: 'neon',
  maxMessages: config.overlay.maxMessages,
  soundEnabled: config.overlay.soundEnabled,
  volume: config.overlay.soundVolume,
  showUsername: config.overlay.showUsername,
  showAvatar: config.overlay.showAvatar,
  showPlatformIcon: config.overlay.showPlatformIcon,
  avatarShape: config.overlay.avatarShape,
  bgColor: config.overlay.backgroundColor,
  bgOpacity: config.overlay.backgroundOpacity,
  borderRadius: config.overlay.borderRadius,
  blurEffect: config.overlay.blurEffect,
  customCSS: '',

  // API configuration for clients
  youtubeApiKey: config.youtube.apiKey || '',
  youtubeChannelId: config.youtube.channelId || '',
  youtubeSimulationMode: config.youtube.simulationMode,
  twitchDefaultChannel: config.twitch.defaultChannel || '',
  twitchConfig: {
    botUsername: config.twitch.botUsername
  }
};

/**
 * Get the current configuration state
 * @returns {Object} Current configuration object
 */
function getConfig() {
  return { ...currentConfig };
}

/**
 * Update configuration with new values
 * Merges updates with existing config
 *
 * @param {Object} updates - Configuration updates to apply
 * @returns {Object} Updated configuration
 */
function updateConfig(updates) {
  currentConfig = { ...currentConfig, ...updates };
  console.log('⚙️  Configuration updated:', Object.keys(updates).join(', '));
  return getConfig();
}

/**
 * Connect to a platform (YouTube or Twitch)
 * Supports multistream by not disconnecting other platforms
 *
 * @param {string} platform - Platform name ('youtube' or 'twitch')
 * @param {Object} connectionData - Connection details
 * @param {string} connectionData.videoId - YouTube video ID (if YouTube)
 * @param {string} connectionData.channelId - Channel name (if Twitch)
 * @returns {string[]} List of currently active platform connections
 */
function connectPlatform(platform, connectionData) {
  if (platform === 'youtube' && connectionData.videoId) {
    currentConfig.platforms.youtube.enabled = true;
    currentConfig.platforms.youtube.videoId = connectionData.videoId;
    console.log(`🔌 YouTube connected: ${connectionData.videoId}`);

  } else if (platform === 'twitch' && connectionData.channelId) {
    currentConfig.platforms.twitch.enabled = true;
    currentConfig.platforms.twitch.channelId = connectionData.channelId;
    console.log(`🔌 Twitch connected: ${connectionData.channelId}`);
  }

  const activeConnections = getActiveConnections();
  if (activeConnections.length > 1) {
    console.log(`📡 Multistream active: ${activeConnections.join(' + ')}`);
  }

  return activeConnections;
}

/**
 * Disconnect from a specific platform or all platforms
 *
 * @param {string|null} platform - Platform to disconnect ('youtube', 'twitch', or null for all)
 */
function disconnectPlatform(platform = null) {
  if (!platform) {
    // Disconnect all platforms
    currentConfig.platforms.youtube.enabled = false;
    currentConfig.platforms.youtube.videoId = '';
    currentConfig.platforms.twitch.enabled = false;
    currentConfig.platforms.twitch.channelId = '';
    console.log('🔌 Disconnected from all platforms');

  } else if (platform === 'youtube') {
    currentConfig.platforms.youtube.enabled = false;
    currentConfig.platforms.youtube.videoId = '';
    console.log('🔌 YouTube disconnected');

  } else if (platform === 'twitch') {
    currentConfig.platforms.twitch.enabled = false;
    currentConfig.platforms.twitch.channelId = '';
    console.log('🔌 Twitch disconnected');
  }
}

/**
 * Get list of currently active platform connections
 * @returns {string[]} Array of active platform names
 */
function getActiveConnections() {
  const active = [];
  if (currentConfig.platforms.youtube.enabled) active.push('YouTube');
  if (currentConfig.platforms.twitch.enabled) active.push('Twitch');
  return active;
}

/**
 * Check if a specific platform is connected
 * @param {string} platform - Platform name ('youtube' or 'twitch')
 * @returns {boolean} True if platform is connected
 */
function isPlatformConnected(platform) {
  return currentConfig.platforms[platform]?.enabled || false;
}

/**
 * Check if multistream mode is active (multiple platforms connected)
 * @returns {boolean} True if 2 or more platforms are connected
 */
function isMultistreamActive() {
  return getActiveConnections().length > 1;
}

module.exports = {
  getConfig,
  updateConfig,
  connectPlatform,
  disconnectPlatform,
  getActiveConnections,
  isPlatformConnected,
  isMultistreamActive
};

