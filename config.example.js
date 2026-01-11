/**
 * Live Chat Overlay Configuration (Example)
 *
 * Copy this file to config.js and customize your settings.
 * Required: YouTube API key OR Twitch channel name
 */

const config = {
  // Server settings
  server: {
    port: 3000
  },

  // YouTube configuration
  youtube: {
    // Get your API key from: https://console.cloud.google.com
    apiKey: 'YOUR_API_KEY_HERE',

    // Your YouTube Channel ID (for reference only)
    channelId: 'YOUR_CHANNEL_ID_HERE',

    // Video ID from live stream URL (youtube.com/watch?v=VIDEO_ID)
    // Set this in the control panel when you go live
    defaultVideoId: '',

    // Polling interval in milliseconds (7-10 seconds recommended to avoid rate limits)
    pollingInterval: 7000,

    // Set to true for testing without API key
    simulationMode: false
  },

  // Twitch configuration
  twitch: {
    // Default channel to connect to
    defaultChannel: 'YOUR_TWITCH_CHANNEL_HERE',

    // Anonymous mode (no credentials needed, but no avatars)
    botUsername: 'justinfan12345',

    // Optional: For avatar support, get credentials from https://dev.twitch.tv/console
    clientId: 'YOUR_TWITCH_CLIENT_ID_HERE',
    clientSecret: 'YOUR_TWITCH_CLIENT_SECRET_HERE'
  },

  // Overlay appearance
  overlay: {
    // Maximum messages shown at once (4-6 recommended)
    maxMessages: 6,

    // Display options
    showUsername: true,
    showAvatar: true,
    showPlatformIcon: true,
    avatarShape: 'circle', // 'circle' or 'square'

    // Message bubble styling
    backgroundColor: '#000000',
    backgroundOpacity: 55, // 0-100
    borderRadius: 18, // Roundness of message bubbles
    blurEffect: true, // Backdrop blur effect

    // Sound settings
    soundEnabled: true,
    soundVolume: 0.5, // 0.0-1.0
    soundFile: '/sounds/message.mp3'
  }
};

// Export for Node.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = config;
}

