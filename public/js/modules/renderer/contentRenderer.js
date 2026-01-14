/**
 * Message Content Renderer
 *
 * Handles rendering of message content including:
 * - Message headers (username, badges, moderator badge, superchat amount)
 * - Message text with URL processing
 * - Emoji parsing with Twemoji
 *
 * @module renderer/contentRenderer
 */

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
 * @param {string} message.username - User's display name
 * @param {string} [message.usernameColor] - Username color
 * @param {Array} [message.badges] - Badge URLs
 * @param {boolean} [message.isModerator] - Is user a moderator
 * @param {boolean} [message.isSuperchat] - Is superchat/donation
 * @param {string} [message.amount] - Donation amount
 * @param {Object} config - Configuration
 * @returns {HTMLElement} Header element
 */
function createMessageHeader(message, config) {
  const headerEl = document.createElement('div');
  headerEl.className = 'message-header';

  // Add username
  if (config.showUsername) {
    headerEl.appendChild(createUsernameElement(message));
  }

  // Add platform badges
  if (message.badges && message.badges.length > 0) {
    headerEl.appendChild(createBadgesElement(message.badges));
  }

  // Add moderator badge
  if (message.isModerator) {
    headerEl.appendChild(createModeratorBadge());
  }

  // Add superchat amount
  if (message.isSuperchat && message.amount) {
    headerEl.appendChild(createSuperchatAmount(message.amount));
  }

  return headerEl;
}

/**
 * Create username element
 *
 * @param {Object} message - Message data
 * @returns {HTMLElement} Username span element
 */
function createUsernameElement(message) {
  const usernameEl = document.createElement('span');
  usernameEl.className = 'username';
  usernameEl.textContent = message.username;
  usernameEl.style.color = message.usernameColor || '#ffffff';
  return usernameEl;
}

/**
 * Create badges container with badge images
 *
 * Note: Twitch IRC provides badge names (e.g., "broadcaster", "moderator")
 * but not image URLs. YouTube provides full badge URLs.
 * This function only renders badges that are valid URLs.
 *
 * @param {Array} badges - Array of badge URLs or names
 * @returns {HTMLElement} Badges container element
 */
function createBadgesElement(badges) {
  const badgesEl = document.createElement('div');
  badgesEl.className = 'badges';

  badges.forEach(badgeUrl => {
    // Only create badge image if it's a valid URL (starts with http/https)
    // Skip Twitch IRC badge names like "broadcaster", "moderator", etc.
    if (badgeUrl && (badgeUrl.startsWith('http://') || badgeUrl.startsWith('https://'))) {
      const badgeEl = document.createElement('img');
      badgeEl.className = 'badge';
      badgeEl.src = badgeUrl;
      badgeEl.alt = 'Badge';
      badgesEl.appendChild(badgeEl);
    }
  });

  return badgesEl;
}

/**
 * Create moderator badge
 *
 * @returns {HTMLElement} Moderator badge element
 */
function createModeratorBadge() {
  const modBadge = document.createElement('span');
  modBadge.className = 'moderator-badge';
  modBadge.textContent = 'MOD';
  return modBadge;
}

/**
 * Create superchat amount display
 *
 * @param {string} amount - Donation amount (e.g., "$5.00")
 * @returns {HTMLElement} Amount element
 */
function createSuperchatAmount(amount) {
  const amountEl = document.createElement('span');
  amountEl.className = 'superchat-amount';
  amountEl.textContent = amount;
  return amountEl;
}

/**
 * Create the message text element
 * Processes URLs and emojis in message text
 *
 * @param {Object} message - Message data
 * @param {string} message.text - Message text content
 * @returns {HTMLElement} Text element
 */
function createMessageText(message) {
  const textEl = document.createElement('div');
  textEl.className = 'message-text';

  // Process URLs in text
  textEl.innerHTML = processMessageText(message.text);

  // Parse emojis with Twemoji if available
  if (typeof twemoji !== 'undefined') {
    twemoji.parse(textEl);
  }

  return textEl;
}

/**
 * Process message text
 * Converts URLs to clickable links and preserves Twitch emote img tags
 *
 * @param {string} text - Raw message text (may contain emote img tags from Twitch)
 * @returns {string} Processed HTML
 */
function processMessageText(text) {
  // Check if text contains Twitch emote img tags
  const hasTwitchEmotes = text.includes('<img') && text.includes('twitch-emote');

  if (hasTwitchEmotes) {
    // Split by img tags to preserve them
    const parts = text.split(/(<img[^>]+class="twitch-emote"[^>]*>)/g);

    // Process each part
    const processedParts = parts.map(part => {
      // If it's an img tag, keep it as-is
      if (part.startsWith('<img') && part.includes('twitch-emote')) {
        return part;
      }

      // Otherwise, escape HTML and convert URLs
      const escaped = part
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');

      // Convert URLs to links
      return escaped.replace(
        /(https?:\/\/[^\s]+)/g,
        '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>'
      );
    });

    return processedParts.join('');
  }

  // Original behavior for messages without Twitch emotes
  const escaped = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

  // Convert URLs to links
  return escaped.replace(
    /(https?:\/\/[^\s]+)/g,
    '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>'
  );
}

// Export public API
window.ContentRenderer = {
  createContentSection,
  createMessageHeader,
  createMessageText,
  processMessageText
};

