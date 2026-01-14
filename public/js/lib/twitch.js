/**
 * Twitch Chat Client
 *
 * Handles connection to Twitch IRC chat and message processing.
 * Uses WebSocket IRC connection for real-time chat messages.
 *
 * Features:
 * - Real-time IRC WebSocket connection to Twitch chat
 * - Anonymous read-only access (no authentication needed)
 * - Automatic reconnection with exponential backoff
 * - IRC tag parsing for user badges, colors, emotes
 * - PING/PONG keepalive mechanism
 *
 * IRC Protocol Flow:
 * 1. connect() → WebSocket to wss://irc-ws.chat.twitch.tv:443
 * 2. CAP REQ → Request capabilities (tags, commands)
 * 3. NICK/PASS → Authenticate (anonymous: justinfan12345)
 * 4. JOIN #channel → Join the channel
 * 5. Receive PRIVMSG → Parse and process chat messages
 * 6. Send PONG → Respond to PING keepalive
 *
 * Message Format:
 * @badge-info=;badges=moderator/1;color=#FF0000;display-name=Username;... :username!username@username.tmi.twitch.tv PRIVMSG #channel :message text
 *
 * Twitch IRC Documentation:
 * https://dev.twitch.tv/docs/irc
 */

class TwitchChatClient {
  /**
   * Create a Twitch chat client
   *
   * @param {string} channelName - Twitch channel name (lowercase, without #)
   */
  constructor(channelName) {
    // Connection configuration
    this.channelName = channelName.toLowerCase();  // Twitch channels are lowercase
    this.ws = null;                                // WebSocket connection

    // State management
    this.connected = false;                        // Connection status
    this.reconnectAttempts = 0;                    // Current reconnection attempt
    this.maxReconnectAttempts = 10;                // Max reconnect attempts
    this.reconnectDelay = 5000;                    // Delay between reconnects (ms)
    this.pingInterval = null;                      // Keepalive interval handle

    // Emote support
    this.globalEmotes = new Map();                 // Global Twitch emotes (code -> URL)

    // IRC connection settings
    this.config = {
      ircUrl: 'wss://irc-ws.chat.twitch.tv:443',   // Twitch IRC WebSocket URL
      botUsername: 'justinfan12345',               // Anonymous read-only username
      oauthToken: 'oauth:fake'                     // Anonymous doesn't need real token
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

    // Fetch Twitch global emotes
    this.fetchGlobalEmotes();
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
   * Parse PRIVMSG (chat messages) from Twitch IRC
   *
   * IRC Message Format:
   * @badge-info=;badges=moderator/1;color=#FF0000;display-name=Username;emotes=;id=abc-123;mod=1;... :username!username@username.tmi.twitch.tv PRIVMSG #channel :message text
   *
   * Parsed Components:
   * - Tags: Key-value pairs with user metadata (@tags)
   * - Username: Extracted from :username! prefix
   * - Message: Text after PRIVMSG #channel :
   *
   * Important Tags:
   * - display-name: User's display name (with capitalization)
   * - color: User's chosen username color
   * - badges: Comma-separated badges (moderator/1,subscriber/12)
   * - mod: 1 if moderator, 0 otherwise
   * - id: Unique message ID
   * - emotes: Emote positions (e.g., "25:0-4,6-10")
   *
   * @param {string} ircMessage - Raw IRC message
   */
  parsePrivateMessage(ircMessage) {
    try {
      // Parse IRC tags (everything before first ' :')
      const tagsPart = ircMessage.split(' :')[0];
      const tags = this.parseTags(tagsPart);

      // Parse username from :username!username@username.tmi.twitch.tv
      const userMatch = ircMessage.match(/:(\w+)!/);
      const username = userMatch ? userMatch[1] : 'Unknown';

      // Parse message text from PRIVMSG #channel :text
      const messageMatch = ircMessage.match(/PRIVMSG #\w+ :(.+)/);
      const text = messageMatch ? messageMatch[1].trim() : '';

      // Ignore empty messages
      if (!text) return;

      // Process emotes in message text (replace emote codes with img tags)
      const processedText = this.parseEmotesInMessage(text);

      // Convert to overlay message format
      const chatMessage = {
        id: tags['id'] || Date.now(),                                      // Unique message ID
        username: tags['display-name'] || username,                        // Display name with caps
        text: processedText,                                               // Message content with emotes
        avatar: null,                                                      // IRC doesn't provide avatars (would need Helix API)
        platform: 'twitch',
        usernameColor: tags['color'] || this.getRandomColor(),            // User's chosen color or random
        isModerator: tags['mod'] === '1' || tags['badges']?.includes('moderator'), // Check mod tag or badge
        isSuperchat: false,                                                // Twitch uses bits/subscriptions, not superchats
        amount: null,
        badges: this.parseBadges(tags['badges']),                          // Parse badge list
        timestamp: Date.now()
      };

      // Emit to parent overlay via callback
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

  /**
   * Fetch Twitch global emotes
   * Uses backend API to avoid CORS issues
   * Stores emotes in Map for quick lookup during message parsing
   */
  async fetchGlobalEmotes() {
    try {
      console.log('🎭 Fetching Twitch global emotes...');

      // Fetch from our backend API (no CORS issues)
      const response = await fetch('/api/twitch/emotes/global');

      if (!response.ok) {
        console.warn('⚠️ Failed to fetch emotes from backend, using fallback list');
        this.loadFallbackEmotes();
        return;
      }

      const data = await response.json();

      // Store only Twitch emotes (ID format)
      if (data.twitch && data.twitch.length > 0) {
        data.twitch.forEach(emote => {
          if (emote.name && emote.id) {
            this.globalEmotes.set(emote.name, emote.id);
          }
        });
        console.log(`✅ Loaded ${data.twitch.length} Twitch global emotes`);
      } else {
        // Load fallback Twitch emotes if backend didn't return any
        console.warn('⚠️ No Twitch emotes from backend, using fallback list');
        this.loadFallbackEmotes();
      }


      console.log(`✅ Total emotes loaded: ${this.globalEmotes.size}`);
    } catch (error) {
      console.warn('⚠️ Could not fetch emotes:', error.message);
      this.loadFallbackEmotes();
    }
  }

  /**
   * Load common Twitch emotes as fallback
   * Used when API fetch fails
   */
  loadFallbackEmotes() {
    // Popular global Twitch emotes with their IDs
    const fallbackEmotes = {
      'Kappa': '25',
      'PogChamp': '88',
      'LUL': '425618',
      'CoolStoryBob': '123171',
      'BibleThump': '86',
      '4Head': '354',
      'SMOrc': '52',
      'PJSalt': '36',
      'FailFish': '360',
      'Kreygasm': '41',
      'DansGame': '33',
      'NotLikeThis': '58765',
      'BabyRage': '22639',
      'WutFace': '28087',
      'ResidentSleeper': '245',
      'TriHard': '120232'
    };

    Object.entries(fallbackEmotes).forEach(([code, id]) => {
      this.globalEmotes.set(code, id);
    });

    console.log(`✅ Loaded ${this.globalEmotes.size} fallback Twitch emotes`);
  }


  /**
   * Parse and replace emotes in message text
   * Detects Twitch global emote codes and returns text with HTML img tags
   *
   * @param {string} text - Original message text
   * @returns {string} HTML string with emote images
   */
  parseEmotesInMessage(text) {
    if (!text || this.globalEmotes.size === 0) {
      return text;
    }

    // Split message into words
    const words = text.split(' ');

    // Replace emote codes with img tags
    const processedWords = words.map(word => {
      // Remove punctuation for emote matching
      const cleanWord = word.replace(/[.,!?;:]$/, '');
      const punctuation = word.slice(cleanWord.length);

      if (this.globalEmotes.has(cleanWord)) {
        const emoteId = this.globalEmotes.get(cleanWord);
        // Use Twitch's CDN URL for emote images (1.0 scale)
        const emoteUrl = `https://static-cdn.jtvnw.net/emoticons/v2/${emoteId}/default/dark/1.0`;
        return `<img src="${emoteUrl}" alt="${cleanWord}" class="twitch-emote" title="${cleanWord}" data-emote="${cleanWord}">${punctuation}`;
      }

      return word;
    });

    return processedWords.join(' ');
  }
}


