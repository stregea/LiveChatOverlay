/**
 * Configuration Manager for Overlay
 *
 * Manages overlay configuration state and applies visual changes
 * including theme switching, styling, and custom CSS.
 *
 * @module configManager
 */

/**
 * Default configuration
 * @type {Object}
 */
const defaultConfig = {
  platforms: {
    youtube: { enabled: false, videoId: '' },
    twitch: { enabled: false, channelId: '' }
  },
  theme: 'neon',
  maxMessages: 6,
  soundEnabled: true,
  volume: 0.5,
  showUsername: true,
  showAvatar: true,
  avatarShape: 'circle',
  showPlatformIcon: true,
  bgColor: '#000000',
  bgOpacity: 55,
  borderRadius: 18,
  blurEffect: true,
  customCSS: ''
};

/**
 * Current configuration state
 * @type {Object}
 */
let currentConfig = { ...defaultConfig };

/**
 * Get current configuration
 *
 * @returns {Object} Configuration object
 */
function getConfig() {
  return currentConfig;
}

/**
 * Update configuration with new values
 * Merges changes with existing config
 *
 * @param {Object} updates - Configuration updates
 * @returns {Object} Updated configuration
 */
function updateConfig(updates) {
  currentConfig = { ...currentConfig, ...updates };
  return currentConfig;
}

/**
 * Apply all configuration changes to the DOM
 * Updates theme, colors, and custom CSS
 */
function applyConfig() {
  applyTheme();
  applyColors();
  applyCustomCSS();
}

/**
 * Apply theme by switching CSS file
 */
function applyTheme() {
  if (!currentConfig.theme) return;

  const themeLink = document.getElementById('theme-link');
  if (!themeLink) return;

  const newThemeUrl = `/themes/${currentConfig.theme}.css`;
  const currentUrl = new URL(themeLink.href).pathname;

  if (currentUrl !== newThemeUrl) {
    themeLink.href = newThemeUrl;
    console.log(`🎨 Theme changed to: ${currentConfig.theme}`);
  }
}

/**
 * Apply color and styling configuration
 * Uses CSS custom properties for dynamic styling
 */
function applyColors() {
  const root = document.documentElement;
  const rgb = hexToRgb(currentConfig.bgColor);

  root.style.setProperty(
    '--message-bg',
    `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${currentConfig.bgOpacity / 100})`
  );

  root.style.setProperty(
    '--border-radius',
    `${currentConfig.borderRadius}px`
  );
}

/**
 * Apply custom CSS to the page
 * Injects user-defined styles dynamically
 */
function applyCustomCSS() {
  const customCSS = currentConfig.customCSS;

  // Remove existing custom CSS if present
  let customStyleTag = document.getElementById('custom-css-style');
  if (customStyleTag) {
    customStyleTag.remove();
  }

  // Add new custom CSS if provided
  if (customCSS && customCSS.trim() !== '') {
    customStyleTag = document.createElement('style');
    customStyleTag.id = 'custom-css-style';
    customStyleTag.textContent = customCSS;
    document.head.appendChild(customStyleTag);
    console.log('💅 Custom CSS applied');
  }
}

/**
 * Convert hex color to RGB components
 *
 * @param {string} hex - Hex color string (e.g., '#FF0000')
 * @returns {Object} RGB components {r, g, b}
 */
function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : { r: 0, g: 0, b: 0 };
}

// Export public API
window.OverlayConfigManager = {
  getConfig,
  updateConfig,
  applyConfig
};

