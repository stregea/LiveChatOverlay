/**
 * Twitch Chat Client
 *
 * Handles connection to Twitch IRC chat and message processing.
 * Uses WebSocket IRC connection for real-time chat messages.
 */

class TwitchChatClient {
  /**
   * Create a Twitch chat client
   * @param {string} channelName - Twitch channel name (lowercase)
   */
  constructor(channelName) {
    this.channelName = channelName.toLowerCase();
    this.ws = null;
    this.connected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 10;
    this.reconnectDelay = 5000;
    this.pingInterval = null;

    // Configuration (can be overridden)
    this.config = {
      ircUrl: 'wss://irc-ws.chat.twitch.tv:443',
      botUsername: 'justinfan12345', // Anonymous read-only
      oauthToken: 'oauth:fake'
    };
  }

  /**
   * Connect to Twitch IRC chat
   * Establishes WebSocket connection and authenticates
   */
  connect() {
    console.log(`🟣 Connecting to Twitch chat: ${this.channelName}`);

    // Connect to Twitch IRC WebSocket
    this.ws = new WebSocket(this.config.ircUrl);

    // Set up event handlers
    this.ws.onopen = () => this.handleOpen();
    this.ws.onmessage = (event) => this.handleMessage(event);
    this.ws.onerror = (error) => this.handleError(error);
    this.ws.onclose = () => this.handleClose();
  }

  /**
   * Send IRC command through WebSocket
   * @param {string} command - IRC command to send
   */
  send(command) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(command + '\r\n');
      console.log('📤 Sent:', command);
    }
  }

  /**
   * Handle WebSocket connection open
   * Authenticates and joins channel
   */
  handleOpen() {
    console.log('✅ Connected to Twitch IRC');

    // Request capabilities for enhanced message data
    this.send('CAP REQ :twitch.tv/tags twitch.tv/commands');

    // Authenticate (anonymous read-only mode)
    this.send(`NICK ${this.config.botUsername}`);
    this.send(`PASS ${this.config.oauthToken}`);

    // Join the channel
    this.send(`JOIN #${this.channelName}`);

    this.connected = true;
    this.reconnectAttempts = 0;

    // Start ping interval to keep connection alive
    this.startPingInterval();
  }

  /**
   * Handle incoming WebSocket messages
   * @param {MessageEvent} event - WebSocket message event
   */
  handleMessage(event) {
    const message = event.data;

    // Handle PING to keep connection alive
    if (message.startsWith('PING')) {
      this.handlePing(message);
      return;
    }

    // Parse PRIVMSG (chat messages)
    if (message.includes('PRIVMSG')) {
      this.parsePrivateMessage(message);
    }

    // Handle successful join
    if (message.includes('JOIN')) {
      console.log(`✅ Joined channel: #${this.channelName}`);
    }

    // Log other messages for debugging
    if (message.includes('NOTICE')) {
      console.log('📢 Twitch notice:', message);
    }
  }

  /**
   * Handle PING from Twitch IRC server
   * Responds with PONG to keep connection alive
   * @param {string} message - PING message
   */
  handlePing(message) {
    const server = message.split(':')[1]?.trim() || 'tmi.twitch.tv';
    this.send(`PONG :${server}`);
  }

  /**
   * Start ping interval to keep connection alive
   * Sends PING every 4 minutes
   */
  startPingInterval() {
    this.stopPingInterval(); // Clear any existing interval
    this.pingInterval = setInterval(() => {
      if (this.connected && this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.send('PING :tmi.twitch.tv');
      }
    }, 240000); // 4 minutes
  }

  /**
   * Stop ping interval
   */
  stopPingInterval() {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
  }

  /**
   * Parse PRIVMSG (chat messages)
   * @param {string} ircMessage - Raw IRC message
   */
  parsePrivateMessage(ircMessage) {
    try {
      // Parse IRC tags
      const tagsPart = ircMessage.split(' :')[0];
      const tags = this.parseTags(tagsPart);

      // Parse username
      const userMatch = ircMessage.match(/:(\w+)!/);
      const username = userMatch ? userMatch[1] : 'Unknown';

      // Parse message text
      const messageMatch = ircMessage.match(/PRIVMSG #\w+ :(.+)/);
      const text = messageMatch ? messageMatch[1].trim() : '';

      if (!text) return;

      // Create chat message object
      const chatMessage = {
        id: tags['id'] || Date.now(),
        username: tags['display-name'] || username,
        text: text,
        avatar: null, // Twitch doesn't provide avatars via IRC, would need API
        platform: 'twitch',
        usernameColor: tags['color'] || this.getRandomColor(),
        isModerator: tags['mod'] === '1' || tags['badges']?.includes('moderator'),
        isSuperchat: false, // Twitch doesn't have super chats (uses bits instead)
        amount: null,
        badges: this.parseBadges(tags['badges']),
        timestamp: Date.now()
      };

      // Emit event for parent to handle
      if (this.onMessage) {
        this.onMessage(chatMessage);
      }

      console.log('💬 Twitch message:', chatMessage);
    } catch (error) {
      console.error('❌ Error parsing Twitch message:', error);
    }
  }

  /**
   * Handle WebSocket errors
   * @param {Error} error - Error object
   */
  handleError(error) {
    console.error('❌ Twitch WebSocket error:', error);
  }

  /**
   * Handle WebSocket connection close
   * Attempts to reconnect if not manually disconnected
   */
  handleClose() {
    console.log('👋 Disconnected from Twitch');

    this.connected = false;
    this.stopPingInterval();

    // Attempt to reconnect if we haven't exceeded max attempts
    if (this.channelName && this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`🔄 Reconnecting... (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);

      setTimeout(() => {
        if (this.channelName) {
          this.connect();
        }
      }, this.reconnectDelay);
    } else if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('❌ Max reconnection attempts reached. Please reconnect manually.');
    }
  }

  /**
   * Disconnect from Twitch IRC
   * Closes WebSocket connection and cleans up
   */
  disconnect() {
    console.log('👋 Disconnecting from Twitch...');

    this.channelName = null; // Prevent reconnection
    this.stopPingInterval();

    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }

    this.connected = false;
    console.log('✅ Twitch chat disconnected');
  }

  /**
   * Parse IRC tags from message
   * @param {string} tagString - Tag string from IRC message
   * @returns {Object} Parsed tags object
   */
  parseTags(tagString) {
    const tags = {};
    const tagParts = tagString.split(';');

    tagParts.forEach(tag => {
      const [key, value] = tag.split('=');
      if (key && key.startsWith('@')) {
        tags[key.substring(1)] = value || '';
      } else if (key) {
        tags[key] = value || '';
      }
    });

    return tags;
  }

  parseBadges(badgeString) {
    if (!badgeString) return [];

    // Badge format: "badge1/1,badge2/1"
    const badges = [];
    const badgeParts = badgeString.split(',');

    badgeParts.forEach(badge => {
      const [name] = badge.split('/');
      if (name) {
        badges.push(name);
      }
    });

    return badges;
  }

  getRandomColor() {
    const colors = [
      '#FF0000', '#0000FF', '#00FF00', '#B22222', '#FF7F50', '#9ACD32',
      '#FF4500', '#2E8B57', '#DAA520', '#D2691E', '#5F9EA0', '#1E90FF',
      '#FF69B4', '#8A2BE2', '#00FF7F'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  }
}

// Note: For full Twitch integration with badges and avatars, you would need:
// 1. Twitch API client ID
// 2. User authentication (OAuth)
// 3. Fetch user data from Twitch API
// 4. Download badge images from Twitch CDN

