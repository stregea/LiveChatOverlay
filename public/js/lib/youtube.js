/**
 * YouTube Chat Client
 *
 * Handles connection to YouTube live chat and message processing.
 * Supports both real YouTube API and simulation mode for testing.
 */

class YouTubeChatClient {
  /**
   * Create a YouTube chat client
   * @param {string} videoId - YouTube video ID
   */
  constructor(videoId) {
    this.videoId = videoId;
    this.pollingInterval = null;
    this.nextPageToken = null;
    this.apiKey = null; // User needs to provide their own API key
    this.liveChatId = null;
    this.isConnected = false;
    this.simulationMode = true; // Enable by default
    this.pollingDelay = 5000; // Start with 5 seconds
    this.rateLimitRetryCount = 0;
    this.maxRetries = 5;
  }

  /**
   * Connect to YouTube live chat
   * Initializes either real API connection or simulation mode
   */
  connect() {
    console.log(`📺 YouTube chat client connecting to video: ${this.videoId}`);

    // Check if API key is configured
    if (this.apiKey && this.apiKey.length > 0) {
      this.connectToRealChat();
    } else {
      this.startSimulation();
    }
  }

  /**
   * Disconnect from YouTube live chat
   * Stops polling and cleans up resources
   */
  disconnect() {
    if (this.pollingInterval) {
      clearTimeout(this.pollingInterval);
      this.pollingInterval = null;
    }

    this.isConnected = false;
    this.liveChatId = null;
    this.nextPageToken = null;
    this.rateLimitRetryCount = 0;

    console.log('👋 YouTube chat disconnected');
  }

  /**
   * Connect to real YouTube live chat using API
   * Requires valid API key and live stream
   */
  async connectToRealChat() {
    try {
      console.log('🔑 Connecting to YouTube API...');

      // Fetch live chat ID
      await this.fetchLiveChatId();

      if (this.liveChatId) {
        this.isConnected = true;
        console.log('✅ Connected to YouTube live chat');

        // Start polling for messages
        this.startPolling();
      } else {
        console.error('❌ No active live chat found for this video');
        this.startSimulation(); // Fallback to simulation
      }
    } catch (error) {
      console.error('❌ Failed to connect to YouTube API:', error);
      this.startSimulation(); // Fallback to simulation
    }
  }

  /**
   * Fetch the live chat ID for the video
   * @returns {Promise<string|null>} Live chat ID or null
   */
  async fetchLiveChatId() {
    const url = `https://www.googleapis.com/youtube/v3/videos?part=liveStreamingDetails&id=${this.videoId}&key=${this.apiKey}`;

    try {
      const response = await fetch(url);
      const data = await response.json();

      if (data.error) {
        console.error('❌ YouTube API error:', data.error.message);
        return null;
      }

      if (data.items && data.items[0]?.liveStreamingDetails?.activeLiveChatId) {
        this.liveChatId = data.items[0].liveStreamingDetails.activeLiveChatId;
        return this.liveChatId;
      }

      return null;
    } catch (error) {
      console.error('❌ Error fetching live chat ID:', error);
      return null;
    }
  }

  /**
   * Start polling for live chat messages
   */
  startPolling() {
    // Initial fetch
    this.fetchMessages();

    // Note: Polling interval will be updated based on API response
    // YouTube typically suggests 5-10 seconds between polls
  }

  /**
   * Schedule next poll with dynamic delay
   * @param {number} delay - Delay in milliseconds
   */
  scheduleNextPoll(delay) {
    // Clear any existing interval
    if (this.pollingInterval) {
      clearTimeout(this.pollingInterval);
    }

    // Schedule next fetch
    this.pollingInterval = setTimeout(() => {
      this.fetchMessages();
    }, delay);
  }

  /**
   * Fetch live chat messages from YouTube API
   */
  async fetchMessages() {
    if (!this.liveChatId || !this.apiKey) return;

    let url = `https://www.googleapis.com/youtube/v3/liveChat/messages?liveChatId=${this.liveChatId}&part=snippet,authorDetails&key=${this.apiKey}`;

    if (this.nextPageToken) {
      url += `&pageToken=${this.nextPageToken}`;
    }

    try {
      const response = await fetch(url);

      // Handle rate limiting (429 Too Many Requests)
      if (response.status === 429) {
        this.rateLimitRetryCount++;

        if (this.rateLimitRetryCount <= this.maxRetries) {
          // Exponential backoff: 10s, 20s, 40s, 80s, 160s
          const backoffDelay = Math.min(10000 * Math.pow(2, this.rateLimitRetryCount - 1), 300000);
          console.warn(`⚠️  Rate limited (429). Retry ${this.rateLimitRetryCount}/${this.maxRetries} in ${backoffDelay/1000}s`);

          // Schedule retry with exponential backoff
          this.scheduleNextPoll(backoffDelay);
          return;
        } else {
          console.error('❌ Rate limit exceeded. Max retries reached. Switching to simulation mode.');
          this.disconnect();
          this.startSimulation();
          return;
        }
      }

      // Handle other HTTP errors
      if (!response.ok) {
        console.error(`❌ HTTP Error ${response.status}: ${response.statusText}`);
        // Retry with backoff for server errors (5xx)
        if (response.status >= 500) {
          const retryDelay = 30000; // 30 seconds for server errors
          console.warn(`⚠️  Server error. Retrying in ${retryDelay/1000}s`);
          this.scheduleNextPoll(retryDelay);
          return;
        }
        return;
      }

      const data = await response.json();

      // Handle API errors in response body
      if (data.error) {
        console.error('❌ YouTube API error:', data.error.message);

        // Handle quota exceeded
        if (data.error.code === 403 && data.error.message.includes('quota')) {
          console.error('❌ YouTube API quota exceeded. Switching to simulation mode.');
          this.disconnect();
          this.startSimulation();
          return;
        }

        // Retry other errors with backoff
        this.scheduleNextPoll(30000);
        return;
      }

      // Success! Reset rate limit counter
      this.rateLimitRetryCount = 0;

      // Process new messages
      if (data.items && data.items.length > 0) {
        console.log(`✅ Fetched ${data.items.length} messages`);
        data.items.forEach(item => this.processMessage(item));
      }

      // Update next page token
      this.nextPageToken = data.nextPageToken;

      // Use YouTube's suggested polling interval (usually 5-10 seconds)
      const pollingDelay = data.pollingIntervalMillis || 7000; // Default to 7 seconds

      if (pollingDelay !== this.pollingDelay) {
        console.log(`🔄 Polling interval updated: ${pollingDelay/1000}s`);
        this.pollingDelay = pollingDelay;
      }

      // Schedule next poll
      this.scheduleNextPoll(pollingDelay);

    } catch (error) {
      console.error('❌ Error fetching messages:', error);
      // Retry with 10 second delay on network errors
      this.scheduleNextPoll(10000);
    }
  }

  /**
   * Start simulation mode for testing without API
   * Generates fake messages at random intervals
   */
  startSimulation() {
    console.log('🎮 YouTube chat simulation mode (for testing)');
    console.log('');
    console.log('To connect to real YouTube chat:');
    console.log('1. Get a YouTube Data API v3 key from Google Cloud Console');
    console.log('   https://console.cloud.google.com/apis/credentials');
    console.log('2. Add the API key to config.js');
    console.log('3. Reload the overlay');
    console.log('');

    this.simulationMode = true;
    this.isConnected = true;

    // Simulate messages every 5-10 seconds
    this.pollingInterval = setInterval(() => {
      // Random chance to generate a message
      if (Math.random() > 0.7) {
        this.generateSimulatedMessage();
      }
    }, 5000);
  }

  /**
   * Generate a simulated message for testing
   */
  generateSimulatedMessage() {
    const username = this.getRandomUsername();
    const userId = Math.random().toString(36).substr(2, 9);

    const simulatedMessage = {
      id: `sim_${Date.now()}`,
      authorDetails: {
        displayName: username,
        // Generate a realistic YouTube avatar URL
        profileImageUrl: `https://yt3.ggpht.com/a/default-user=s88-c-k-c0x00ffffff-no-rj`,
        isChatModerator: Math.random() > 0.8,
        isChatSponsor: Math.random() > 0.9,
        channelId: `UC${userId}`
      },
      snippet: {
        displayMessage: this.getRandomMessage(),
        publishedAt: new Date().toISOString(),
        superChatDetails: Math.random() > 0.95 ? {
          amountDisplayString: '$' + (Math.random() * 100 + 1).toFixed(2),
          amountMicros: Math.floor(Math.random() * 100000000),
          currency: 'USD',
          tier: Math.floor(Math.random() * 5) + 1
        } : null
      }
    };

    this.processMessage(simulatedMessage);
  }

  /**
   * Process a YouTube chat message
   * Converts YouTube message format to overlay format
   * @param {Object} message - YouTube API message object
   */
  processMessage(message) {
    // Log avatar URL for debugging
    if (message.authorDetails && message.authorDetails.profileImageUrl) {
      console.log(`✅ Avatar URL for ${message.authorDetails.displayName}:`, message.authorDetails.profileImageUrl);
    } else {
      console.warn(`⚠️  No avatar URL for ${message.authorDetails?.displayName || 'unknown user'}`);
      console.log('Author details:', message.authorDetails);
    }

    const chatMessage = {
      id: message.id,
      username: message.authorDetails.displayName,
      text: message.snippet.displayMessage,
      avatar: message.authorDetails.profileImageUrl || null,
      platform: 'youtube',
      usernameColor: this.getRandomColor(),
      isModerator: message.authorDetails.isChatModerator || false,
      isSuperchat: !!message.snippet.superChatDetails,
      amount: message.snippet.superChatDetails ?
              message.snippet.superChatDetails.amountDisplayString : null,
      badges: this.getBadges(message.authorDetails),
      timestamp: Date.now(),
      raw: message // Keep raw message for debugging
    };

    // Send to overlay via WebSocket
    this.sendToOverlay(chatMessage);
  }

  /**
   * Extract user badges from author details
   * @param {Object} authorDetails - YouTube author details
   * @returns {Array<string>} Badge identifiers
   */
  getBadges(authorDetails) {
    const badges = [];

    if (authorDetails.isChatSponsor) {
      badges.push('sponsor');
    }

    if (authorDetails.isChatModerator) {
      badges.push('moderator');
    }

    if (authorDetails.isVerified) {
      badges.push('verified');
    }

    return badges;
  }

  /**
   * Send message to overlay via WebSocket
   * @param {Object} chatMessage - Formatted chat message
   */
  sendToOverlay(chatMessage) {
    if (typeof ws !== 'undefined' && ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({
        type: 'chat-message',
        data: chatMessage
      }));
    }
  }

  /**
   * Generate a random color for username
   * @returns {string} Hex color code
   */
  getRandomColor() {
    const colors = [
      '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF',
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F',
      '#E74C3C', '#3498DB', '#2ECC71', '#F39C12', '#9B59B6', '#1ABC9C'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  /**
   * Get a random username for simulation
   * @returns {string} Random username
   */
  getRandomUsername() {
    const adjectives = ['Cool', 'Epic', 'Super', 'Mega', 'Ultra', 'Pro', 'Elite'];
    const nouns = ['Gamer', 'Streamer', 'Viewer', 'Fan', 'User', 'Watcher'];
    const number = Math.floor(Math.random() * 1000);

    return `${adjectives[Math.floor(Math.random() * adjectives.length)]}${nouns[Math.floor(Math.random() * nouns.length)]}${number}`;
  }

  /**
   * Get a random message for simulation
   * @returns {string} Random message text
   */
  getRandomMessage() {
    const messages = [
      'Hello from YouTube! 👋',
      'Great stream!',
      'Love the content! ❤️',
      'Keep it up! 🔥',
      'Amazing! 🎉',
      'This is awesome! 😎',
      'First! 🎯',
      'Watching from [country]! 🌍',
      'Been watching for hours! ⏰',
      'Your best stream yet! ⭐',
      'Can you say hi? 🙋',
      'Thanks for streaming! 🙏',
      'This game looks fun! 🎮',
      'What keyboard do you use? ⌨️',
      'Subscribed! 📺'
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  }

  /**
   * Set API key for real YouTube connection
   * @param {string} apiKey - YouTube Data API v3 key
   */
  setApiKey(apiKey) {
    this.apiKey = apiKey;
    this.simulationMode = false;
  }

  /**
   * Check if client is connected
   * @returns {boolean} Connection status
   */
  isActive() {
    return this.isConnected;
  }
}

