/**
 * Avatar Renderer
 *
 * Handles rendering of user avatars with platform icons and fallback generation.
 * Creates avatar containers with optional platform icon overlays.
 *
 * @module renderer/avatarRenderer
 */

/**
 * Create the avatar section of a message
 * Includes avatar image and optional platform icon overlay
 *
 * @param {Object} message - Message data
 * @param {string} message.username - User's display name
 * @param {string} message.avatar - Avatar URL
 * @param {string} message.platform - Platform (youtube/twitch)
 * @param {Object} config - Configuration
 * @param {string} config.avatarShape - Avatar shape (circle/square)
 * @param {boolean} config.showPlatformIcon - Whether to show platform icon
 * @returns {HTMLElement} Avatar container element
 */
function createAvatarSection(message, config) {
  const avatarContainer = document.createElement('div');
  avatarContainer.className = 'avatar-container';

  // Create avatar image
  const avatar = createAvatarImage(message, config);
  avatarContainer.appendChild(avatar);

  // Add platform icon overlay if enabled
  if (config.showPlatformIcon) {
    const platformIcon = createPlatformIcon(message.platform);
    avatarContainer.appendChild(platformIcon);
  }

  return avatarContainer;
}

/**
 * Create avatar image element with fallback handling
 *
 * @param {Object} message - Message data
 * @param {Object} config - Configuration
 * @returns {HTMLImageElement} Avatar image element
 */
function createAvatarImage(message, config) {
  const avatar = document.createElement('img');
  avatar.className = `user-avatar ${config.avatarShape}`;
  avatar.alt = message.username;

  // Set avatar URL with fallback to generated avatar
  avatar.src = message.avatar && message.avatar.trim() !== ''
    ? message.avatar
    : generateDefaultAvatar(message.platform, message.username);

  // Fallback if avatar fails to load
  avatar.onerror = function() {
    console.warn(`⚠️  Failed to load avatar for ${message.username}`);
    this.src = generateDefaultAvatar(message.platform, message.username);
    this.onerror = null; // Prevent infinite loop
  };

  return avatar;
}

/**
 * Create platform icon overlay
 * Shows small YouTube or Twitch Font Awesome icon on avatar
 *
 * @param {string} platform - Platform name (youtube/twitch)
 * @returns {HTMLElement} Platform icon element
 */
function createPlatformIcon(platform) {
  const platformIcon = document.createElement('div');
  platformIcon.className = `platform-icon ${platform}`;

  // Use Font Awesome icons
  const icon = document.createElement('i');
  if (platform === 'youtube') {
    icon.className = 'fab fa-youtube';
  } else if (platform === 'twitch') {
    icon.className = 'fab fa-twitch';
  }

  platformIcon.appendChild(icon);

  return platformIcon;
}

/**
 * Generate a default avatar SVG for users without avatars
 * Shows first letter of username on platform-colored background
 *
 * @param {string} platform - Platform name (youtube/twitch)
 * @param {string} username - User's name
 * @returns {string} Data URL for SVG avatar
 */
function generateDefaultAvatar(platform, username = '') {
  // Clean username and extract first character
  const cleanedName = username.replace(/^[@#!]+/, '').trim();
  const match = cleanedName.match(/[a-zA-Z0-9]/);
  const initial = match ? match[0].toUpperCase() : '?';

  // Platform-specific colors
  const colors = {
    youtube: '#FF0000',
    twitch: '#9146FF',
    default: '#666'
  };
  const color = colors[platform] || colors.default;

  // Generate SVG avatar
  return 'data:image/svg+xml,' + encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
      <circle cx="20" cy="20" r="20" fill="${color}"/>
      <text x="20" y="28" text-anchor="middle" fill="white" font-size="20" font-weight="bold" font-family="Arial">${initial}</text>
    </svg>
  `);
}

// Export public API
window.AvatarRenderer = {
  createAvatarSection,
  generateDefaultAvatar
};

