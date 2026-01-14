/**
 * Message Renderer - Main Facade
 *
 * Creates complete chat message DOM elements by coordinating
 * avatar and content rendering modules.
 *
 * This is the main entry point for message rendering, providing a
 * simple interface while delegating to specialized renderers.
 *
 * @module renderer/messageRenderer
 * @requires AvatarRenderer
 * @requires ContentRenderer
 */

/**
 * Create a complete chat message DOM element
 * Combines avatar and content sections with appropriate styling
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
 * @returns {HTMLElement} Complete message element
 */
function createMessageElement(message, config) {
  const messageEl = document.createElement('div');
  messageEl.className = 'chat-message';

  // Apply special styling classes
  applyMessageStyling(messageEl, message, config);

  // Add avatar section (if enabled)
  if (config.showAvatar) {
    const avatarSection = window.AvatarRenderer.createAvatarSection(message, config);
    messageEl.appendChild(avatarSection);
  }

  // Add content section (username, badges, text)
  const contentSection = window.ContentRenderer.createContentSection(message, config);
  messageEl.appendChild(contentSection);

  return messageEl;
}

/**
 * Apply special styling classes to message element
 * Handles blur effect, superchat, and moderator highlighting
 *
 * @param {HTMLElement} messageEl - Message element
 * @param {Object} message - Message data
 * @param {Object} config - Configuration
 */
function applyMessageStyling(messageEl, message, config) {
  // Blur effect
  if (config.blurEffect) {
    messageEl.classList.add('blur-effect');
  }

  // Superchat styling
  if (message.isSuperchat) {
    messageEl.classList.add('superchat');
  }

  // Moderator styling
  if (message.isModerator) {
    messageEl.classList.add('moderator');
  }
}

/**
 * Generate default avatar (exposed for backward compatibility)
 * Delegates to AvatarRenderer
 *
 * @param {string} platform - Platform name
 * @param {string} username - User's name
 * @returns {string} Data URL for SVG avatar
 */
function getDefaultAvatar(platform, username) {
  return window.AvatarRenderer.generateDefaultAvatar(platform, username);
}

// Export public API (maintains backward compatibility)
window.MessageRenderer = {
  createMessageElement,
  getDefaultAvatar
};

