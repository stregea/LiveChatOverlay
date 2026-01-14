/**
 * Twitch Platform Connection Manager
 *
 * Manages Twitch-specific connection logic including:
 * - Channel name validation and connection
 * - Connection status updates
 *
 * @module platforms/twitchConnection
 */

/**
 * Connect to Twitch chat
 * Reads channel name from config.js and sends connection request to server
 *
 * @returns {boolean} Success status
 */
function connectTwitch() {
  const channel = document.getElementById('twitch-channel').value.trim().toLowerCase();

  if (!channel) {
    alert('Please configure your Twitch channel in config.js');
    return false;
  }

  const success = window.ControlWebSocket.send('connect', {
    platform: 'twitch',
    channelId: channel
  });

  if (success) {
    console.log('🟣 Connecting to Twitch:', channel);
  }

  return success;
}

/**
 * Disconnect from Twitch chat
 */
function disconnectTwitch() {
  window.ControlWebSocket.send('disconnect', {
    platform: 'twitch'
  });
  console.log('🟣 Disconnecting Twitch');
}

/**
 * Update Twitch connection status in UI
 *
 * @param {boolean} connected - Connection state
 */
function updateTwitchStatus(connected) {
  const statusEl = document.getElementById('twitch-status');
  if (statusEl) {
    statusEl.textContent = connected ? '✅ Connected' : 'Not connected';
    statusEl.className = connected ? 'status-badge connected' : 'status-badge';
  }
}

// Export public API
window.TwitchConnection = {
  connect: connectTwitch,
  disconnect: disconnectTwitch,
  updateStatus: updateTwitchStatus
};

