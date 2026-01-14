/**
 * YouTube Platform Connection Manager
 *
 * Manages YouTube-specific connection logic including:
 * - Video ID validation and connection
 * - Auto-detection of live streams
 * - Connection status updates
 *
 * @module platforms/youtubeConnection
 */

/**
 * Connect to YouTube live chat
 * Validates video ID input and sends connection request to server
 *
 * @returns {boolean} Success status
 */
function connectYouTube() {
  const videoId = document.getElementById('youtube-video-id').value.trim();

  if (!videoId) {
    alert('Please enter a YouTube Video ID');
    return false;
  }

  const success = window.ControlWebSocket.send('connect', {
    platform: 'youtube',
    videoId: videoId
  });

  if (success) {
    console.log('🎥 Connecting to YouTube:', videoId);
  }

  return success;
}

/**
 * Disconnect from YouTube live chat
 */
function disconnectYouTube() {
  window.ControlWebSocket.send('disconnect', {
    platform: 'youtube'
  });
  console.log('🎥 Disconnecting YouTube');
}

/**
 * Update YouTube connection status in UI
 *
 * @param {boolean} connected - Connection state
 */
function updateYouTubeStatus(connected) {
  const statusEl = document.getElementById('youtube-status');
  if (statusEl) {
    statusEl.textContent = connected ? '✅ Connected' : 'Not connected';
    statusEl.className = connected ? 'status-badge connected' : 'status-badge';
  }
}

/**
 * Auto-detect current live stream on YouTube
 * Uses server API to find active live stream for configured channel
 *
 * Features:
 * - Automatically finds live video ID from channel
 * - Shows caching status to indicate quota usage
 * - Auto-connects after successful detection
 * - Provides detailed error messages for quota issues
 */
async function autoDetectLiveStream() {
  const channelIdInput = document.getElementById('youtube-channel-id').value.trim();
  const infoDiv = document.getElementById('auto-detect-info');

  // Validate channel ID is configured
  if (!channelIdInput) {
    showAutoDetectMessage(
      infoDiv,
      '❌ No channel ID configured. Please set in config.js',
      '#d32f2f'
    );
    return;
  }

  // Show loading state
  showAutoDetectMessage(infoDiv, '🔍 Searching for live stream...', '#666');

  try {
    // Call server API to detect live stream
    const response = await fetch(`/api/youtube/channel/${channelIdInput}/live`);
    const data = await response.json();

    if (data.status === 'success') {
      handleAutoDetectSuccess(infoDiv, data);
    } else if (data.status === 'no_live_stream') {
      showAutoDetectMessage(
        infoDiv,
        '⚠️ No active live stream found on this channel',
        '#ff9800'
      );
    } else if (data.status === 'error') {
      handleAutoDetectError(infoDiv, data);
    } else {
      showAutoDetectMessage(
        infoDiv,
        `❌ Error: ${data.message || 'Unknown error'}`,
        '#d32f2f'
      );
    }
  } catch (error) {
    console.error('❌ Auto-detect error:', error);
    showAutoDetectMessage(
      infoDiv,
      `❌ Failed to auto-detect: ${error.message}`,
      '#d32f2f'
    );
  }
}

/**
 * Handle successful auto-detection
 * Populates video ID field and auto-connects
 *
 * @param {HTMLElement} infoDiv - Info display element
 * @param {Object} data - Success response data
 * @param {string} data.videoId - Detected video ID
 * @param {string} data.title - Video title
 * @param {boolean} data.fromCache - Whether result was cached
 */
function handleAutoDetectSuccess(infoDiv, data) {
  // Populate video ID field
  document.getElementById('youtube-video-id').value = data.videoId;

  // Show cache indicator to help user understand quota usage
  const cacheIndicator = data.fromCache
    ? ' <span style="color: #666;">(cached, no quota used)</span>'
    : '';

  showAutoDetectMessage(
    infoDiv,
    `✅ Found: <strong>${data.title}</strong>${cacheIndicator}`,
    '#4caf50'
  );

  console.log(
    '✅ Auto-detected live stream:',
    data,
    data.fromCache ? '(from cache)' : '(from API)'
  );

  // Auto-connect after 1 second
  setTimeout(() => {
    infoDiv.innerHTML += ' → Connecting...';
    connectYouTube();
  }, 1000);
}

/**
 * Handle auto-detect API errors
 * Provides detailed error messages, especially for quota issues
 *
 * @param {HTMLElement} infoDiv - Info display element
 * @param {Object} data - Error response data
 */
function handleAutoDetectError(infoDiv, data) {
  // Check if it's a quota error (common issue)
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

/**
 * Show auto-detect message in UI
 * Helper function for consistent message display
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

// Export public API
window.YouTubeConnection = {
  connect: connectYouTube,
  disconnect: disconnectYouTube,
  updateStatus: updateYouTubeStatus,
  autoDetectLiveStream
};

