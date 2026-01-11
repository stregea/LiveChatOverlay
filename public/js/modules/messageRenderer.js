/**
 * Message Renderer for Overlay
 *
 * Handles creation and rendering of chat message DOM elements
 * with support for avatars, badges, superchat, and moderator highlighting.
 *
 * @module messageRenderer
 */

/**
 * Create a complete chat message DOM element
 *
 * @param {Object} message - Message data
 * @param {string} message.username - User's display name
 * @param {string} message.text - Message content
 * @param {string} message.avatar - Avatar URL
 * @param {string} message.platform - Platform (youtube/twitch)
 * @param {string} [message.usernameColor] - Username color
 * @param {boolean} [message.isModerator] - Is user a moderator
 * @param {boolean} [message.isSuperchat] - Is superchat/donation
 * @param {string} [message.amount] - Donation amount
 * @param {string[]} [message.badges] - Badge URLs
 * @param {Object} config - Current overlay configuration
 * @returns {HTMLElement} Message element
 */
function createMessageElement(message, config) {
  const messageEl = document.createElement('div');
  messageEl.className = 'chat-message';

  // Apply special styling
  if (config.blurEffect) {
    messageEl.classList.add('blur-effect');
  }

  if (message.isSuperchat) {
    messageEl.classList.add('superchat');
  }

  if (message.isModerator) {
    messageEl.classList.add('moderator');
  }

  // Add avatar section
  if (config.showAvatar) {
    messageEl.appendChild(createAvatarSection(message, config));
  }

  // Add message content section
  messageEl.appendChild(createContentSection(message, config));

  return messageEl;
}

/**
 * Create the avatar section of a message
 * Includes avatar image and optional platform icon
 *
 * @param {Object} message - Message data
 * @param {Object} config - Configuration
 * @returns {HTMLElement} Avatar container element
 */
function createAvatarSection(message, config) {
  const avatarContainer = document.createElement('div');
  avatarContainer.className = 'avatar-container';

  // Create avatar image
  const avatar = document.createElement('img');
  avatar.className = `user-avatar ${config.avatarShape}`;
  avatar.alt = message.username;

  // Set avatar URL with fallback
  avatar.src = message.avatar && message.avatar.trim() !== ''
      ? message.avatar
      : getDefaultAvatar(message.platform, message.username);

  // Fallback if avatar fails to load
  avatar.onerror = function() {
    console.warn(`⚠️  Failed to load avatar for ${message.username}`);
    this.src = getDefaultAvatar(message.platform, message.username);
    this.onerror = null; // Prevent infinite loop
  };

  avatarContainer.appendChild(avatar);

  // Add platform icon overlay
  if (config.showPlatformIcon) {
    const platformIcon = document.createElement('div');
    platformIcon.className = `platform-icon ${message.platform}`;
    platformIcon.innerHTML = message.platform === 'youtube' ? '▶' : '▼';
    avatarContainer.appendChild(platformIcon);
  }

  return avatarContainer;
}

/**
 * Create the content section of a message
 * Includes header (username, badges) and message text
 *
 * @param {Object} message - Message data
 * @param {Object} config - Configuration
 * @returns {HTMLElement} Content element
 */
function createContentSection(message, config) {
  const contentEl = document.createElement('div');
  contentEl.className = 'message-content';

  // Add header (username, badges, etc.)
  contentEl.appendChild(createMessageHeader(message, config));

  // Add message text
  contentEl.appendChild(createMessageText(message));

  return contentEl;
}

/**
 * Create the message header
 * Contains username, badges, moderator badge, and superchat amount
 *
 * @param {Object} message - Message data
 * @param {Object} config - Configuration
 * @returns {HTMLElement} Header element
 */
function createMessageHeader(message, config) {
  const headerEl = document.createElement('div');
  headerEl.className = 'message-header';

  // Add username
  if (config.showUsername) {
    const usernameEl = document.createElement('span');
    usernameEl.className = 'username';
    usernameEl.textContent = message.username;
    usernameEl.style.color = message.usernameColor || '#ffffff';
    headerEl.appendChild(usernameEl);
  }

  // Add platform badges
  if (message.badges && message.badges.length > 0) {
    const badgesEl = document.createElement('div');
    badgesEl.className = 'badges';

    message.badges.forEach(badge => {
      const badgeEl = document.createElement('img');
      badgeEl.className = 'badge';
      badgeEl.src = badge;
      badgeEl.alt = 'Badge';
      badgesEl.appendChild(badgeEl);
    });

    headerEl.appendChild(badgesEl);
  }

  // Add moderator badge
  if (message.isModerator) {
    const modBadge = document.createElement('span');
    modBadge.className = 'moderator-badge';
    modBadge.textContent = 'MOD';
    headerEl.appendChild(modBadge);
  }

  // Add superchat amount
  if (message.isSuperchat && message.amount) {
    const amountEl = document.createElement('span');
    amountEl.className = 'superchat-amount';
    amountEl.textContent = message.amount;
    headerEl.appendChild(amountEl);
  }

  return headerEl;
}

/**
 * Create the message text element
 * Processes URLs and emojis
 *
 * @param {Object} message - Message data
 * @returns {HTMLElement} Text element
 */
function createMessageText(message) {
  const textEl = document.createElement('div');
  textEl.className = 'message-text';
  textEl.innerHTML = processMessageText(message.text);

  // Parse emojis with Twemoji if available
  if (typeof twemoji !== 'undefined') {
    twemoji.parse(textEl);
  }

  return textEl;
}

/**
 * Process message text
 * Converts URLs to clickable links
 *
 * @param {string} text - Raw message text
 * @returns {string} Processed HTML
 */
function processMessageText(text) {
  // Convert URLs to links
  return text.replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank">$1</a>');
}

/**
 * Generate a default avatar SVG for users without avatars
 * Shows first letter of username on platform-colored background
 *
 * @param {string} platform - Platform name (youtube/twitch)
 * @param {string} username - User's name
 * @returns {string} Data URL for SVG avatar
 */
function getDefaultAvatar(platform, username = '') {
  // Clean username and extract first character
  const cleanedName = username.replace(/^[@#!]+/, '').trim();
  const match = cleanedName.match(/[a-zA-Z0-9]/);
  const initial = match ? match[0].toUpperCase() : '?';

  // Platform colors
  const colors = {
    youtube: '#FF0000',
    twitch: '#9146FF',
    default: '#666'
  };
  const color = colors[platform] || colors.default;

  // Generate SVG
  return 'data:image/svg+xml,' + encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
      <circle cx="20" cy="20" r="20" fill="${color}"/>
      <text x="20" y="28" text-anchor="middle" fill="white" font-size="20" font-weight="bold" font-family="Arial">${initial}</text>
    </svg>
  `);
}

// Export public API
window.MessageRenderer = {
  createMessageElement,
  getDefaultAvatar
};

