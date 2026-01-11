/**
 * Platform Connection Manager
 *
 * Handles connecting and disconnecting from streaming platforms
 * (YouTube and Twitch) including multistream support.
 *
 * @module platformManager
 */

/**
 * Connect to YouTube
 * Validates input and sends connection request to server
 */
function connectYouTube() {
  const videoId = document.getElementById('youtube-video-id').value.trim();

  if (!videoId) {
    alert('Please enter a YouTube Video ID');
    return;
  }

  const success = window.ControlWebSocket.send('connect', {
    platform: 'youtube',
    videoId: videoId
  });

  if (success) {
    console.log('🎥 Connecting to YouTube:', videoId);
  }
}

/**
 * Disconnect from YouTube
 */
function disconnectYouTube() {
  window.ControlWebSocket.send('disconnect', {
    platform: 'youtube'
  });
  console.log('🎥 Disconnecting YouTube');
}

/**
 * Connect to Twitch
 * Validates input and sends connection request to server
 */
function connectTwitch() {
  const channel = document.getElementById('twitch-channel').value.trim().toLowerCase();

  if (!channel) {
    alert('Please enter a Twitch channel name');
    return;
  }

  const success = window.ControlWebSocket.send('connect', {
    platform: 'twitch',
    channelId: channel
  });

  if (success) {
    console.log('🟣 Connecting to Twitch:', channel);
  }
}

/**
 * Disconnect from Twitch
 */
function disconnectTwitch() {
  window.ControlWebSocket.send('disconnect', {
    platform: 'twitch'
  });
  console.log('🟣 Disconnecting Twitch');
}

/**
 * Disconnect from all platforms
 */
function disconnectAll() {
  window.ControlWebSocket.send('disconnect', {});
  console.log('🔌 Disconnecting all platforms');
}

/**
 * Update platform connection status UI
 *
 * @param {string} platform - Platform name ('youtube' or 'twitch')
 * @param {boolean} connected - Connection state
 */
function updatePlatformStatus(platform, connected) {
  const statusEl = document.getElementById(`${platform}-status`);
  if (statusEl) {
    statusEl.textContent = connected ? '✅ Connected' : 'Not connected';
    statusEl.className = connected ? 'status-badge connected' : 'status-badge';
  }
}

/**
 * Auto-detect current live stream on YouTube
 * Uses server API to find active live stream for configured channel
 */
async function autoDetectLiveStream() {
  const channelIdInput = document.getElementById('youtube-channel-id').value.trim();
  const infoDiv = document.getElementById('auto-detect-info');

  if (!channelIdInput) {
    showAutoDetectMessage(infoDiv, '❌ No channel ID configured. Please set in config.js', '#d32f2f');
    return;
  }

  // Show loading state
  showAutoDetectMessage(infoDiv, '🔍 Searching for live stream...', '#666');

  try {
    const response = await fetch(`/api/youtube/channel/${channelIdInput}/live`);
    const data = await response.json();

    if (data.status === 'success') {
      // Found live stream!
      document.getElementById('youtube-video-id').value = data.videoId;

      const cacheIndicator = data.fromCache
        ? ' <span style="color: #666;">(cached, no quota used)</span>'
        : '';

      showAutoDetectMessage(
        infoDiv,
        `✅ Found: <strong>${data.title}</strong>${cacheIndicator}`,
        '#4caf50'
      );

      console.log('✅ Auto-detected live stream:', data, data.fromCache ? '(from cache)' : '(from API)');

      // Auto-connect after 1 second
      setTimeout(() => {
        infoDiv.innerHTML += ' → Connecting...';
        connectYouTube();
      }, 1000);

    } else if (data.status === 'no_live_stream') {
      showAutoDetectMessage(infoDiv, '⚠️ No active live stream found on this channel', '#ff9800');

    } else if (data.status === 'error') {
      handleAutoDetectError(infoDiv, data);
    } else {
      showAutoDetectMessage(infoDiv, `❌ Error: ${data.message || 'Unknown error'}`, '#d32f2f');
    }

  } catch (error) {
    console.error('❌ Auto-detect error:', error);
    showAutoDetectMessage(infoDiv, `❌ Failed to auto-detect: ${error.message}`, '#d32f2f');
  }
}

/**
 * Show auto-detect message in UI
 *
 * @param {HTMLElement} element - Info div element
 * @param {string} message - Message HTML
 * @param {string} color - Text color
 */
function showAutoDetectMessage(element, message, color) {
  if (!element) return;
  element.style.display = 'block';
  element.innerHTML = message;
  element.style.color = color;
}

/**
 * Handle auto-detect API errors
 *
 * @param {HTMLElement} infoDiv - Info div element
 * @param {Object} data - Error data from API
 */
function handleAutoDetectError(infoDiv, data) {
  // Check if it's a quota error
  if (data.message && (data.message.includes('quota') || data.code === 403)) {
    showAutoDetectMessage(
      infoDiv,
      `❌ <strong>YouTube API Quota Exceeded</strong><br>
      <small style="display: block; margin-top: 4px;">
        • Enter Video ID manually (from your stream URL)<br>
        • Quota resets at midnight Pacific Time<br>
        • Each auto-detect uses ~100 quota units<br>
        • Daily limit: 10,000 units (free tier)
      </small>`,
      '#d32f2f'
    );
    console.error('❌ YouTube API Quota Error:', data);
  } else {
    showAutoDetectMessage(infoDiv, `❌ Error: ${data.message}`, '#d32f2f');
  }
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

