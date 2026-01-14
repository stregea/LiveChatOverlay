/**
 * UI Configuration Loader
 *
 * Handles loading and displaying configuration values in the control panel UI.
 * Updates form fields, connection statuses, and multistream indicators.
 *
 * @module ui/configLoader
 */

/**
 * Load configuration into UI form elements
 * Main entry point for updating all UI elements with server config
 *
 * @param {Object} config - Configuration object from server
 */
function loadConfig(config) {
  console.log('⚙️  Loading config:', config);

  // Update YouTube channel ID display
  updateChannelIdDisplay(config);

  // Update Twitch channel display
  updateTwitchChannelDisplay(config);

  // Update platform connection status
  if (config.platforms) {
    updatePlatformStatuses(config.platforms);
  }

  // Update all form fields
  updateAllFormFields(config);
}

/**
 * Update platform connection statuses
 * Shows connection state for YouTube and Twitch
 *
 * @param {Object} platforms - Platform configuration
 */
function updatePlatformStatuses(platforms) {
  window.PlatformManager.updatePlatformStatus('youtube', platforms.youtube.enabled);
  window.PlatformManager.updatePlatformStatus('twitch', platforms.twitch.enabled);

  // Show multistream indicator if both platforms connected
  const isMultistream = platforms.youtube.enabled && platforms.twitch.enabled;
  updateMultistreamIndicator(isMultistream);
}

/**
 * Update all form fields with configuration values
 *
 * @param {Object} config - Configuration object
 */
function updateAllFormFields(config) {
  // Message display settings
  updateFormField('max-messages', config.maxMessages);
  updateFormField('animation-speed', config.animationSpeed);

  // Sound settings
  updateCheckbox('sound-enabled', config.soundEnabled);
  updateVolumeSlider(config.volume);

  // Visual settings
  updateFormField('bg-color', config.bgColor);
  updateFormField('bg-opacity', config.bgOpacity);
  updateFormField('border-radius', config.borderRadius);
  updateCheckbox('blur-effect', config.blurEffect);

  // User info settings
  updateCheckbox('show-username', config.showUsername);
  updateCheckbox('show-avatar', config.showAvatar);
  updateFormField('avatar-shape', config.avatarShape);
  updateCheckbox('show-platform-icon', config.showPlatformIcon);

  // Theme
  updateFormField('theme', config.theme);

  // Custom CSS
  updateFormField('custom-css', config.customCSS);
}

/**
 * Update YouTube channel ID display
 * Shows configured channel ID or error state
 *
 * @param {Object} config - Configuration object
 */
function updateChannelIdDisplay(config) {
  const channelIdInput = document.getElementById('youtube-channel-id');
  const channelIdLabel = document.getElementById('config-channel-id');
  const autoDetectInfo = document.getElementById('auto-detect-info');

  if (!channelIdInput || !channelIdLabel) return;

  if (config.youtubeChannelId && config.youtubeChannelId.trim() !== '') {
    // Channel ID is configured
    channelIdInput.value = config.youtubeChannelId;
    channelIdLabel.textContent = config.youtubeChannelId;
    channelIdLabel.style.color = '#4caf50';

    // Hide error message
    if (autoDetectInfo) {
      autoDetectInfo.style.display = 'none';
    }

    console.log('✅ Channel ID configured:', config.youtubeChannelId);
  } else {
    // Channel ID not configured
    channelIdInput.value = '';
    channelIdLabel.textContent = 'Not configured';
    channelIdLabel.style.color = '#d32f2f';
    console.log('❌ Channel ID not configured');
  }
}

/**
 * Update Twitch channel display
 * Shows configured Twitch channel from config.js
 *
 * @param {Object} config - Configuration object
 */
function updateTwitchChannelDisplay(config) {
  const twitchChannelInput = document.getElementById('twitch-channel');
  const twitchChannelLabel = document.getElementById('config-twitch-channel');

  if (!twitchChannelInput) return;

  if (config.twitchDefaultChannel && config.twitchDefaultChannel.trim() !== '') {
    // Twitch channel is configured
    twitchChannelInput.value = config.twitchDefaultChannel;

    if (twitchChannelLabel) {
      twitchChannelLabel.textContent = config.twitchDefaultChannel;
      twitchChannelLabel.style.color = '#4caf50';
    }

    console.log('✅ Twitch channel configured:', config.twitchDefaultChannel);
  } else {
    // Twitch channel not configured
    twitchChannelInput.value = '';
    twitchChannelInput.placeholder = 'Not configured in config.js';

    if (twitchChannelLabel) {
      twitchChannelLabel.textContent = 'Not configured';
      twitchChannelLabel.style.color = '#d32f2f';
    }

    console.log('❌ Twitch channel not configured');
  }
}

/**
 * Update multistream indicator visibility
 * Shows special indicator when both YouTube and Twitch are connected
 *
 * @param {boolean} isMultistream - Whether both platforms are connected
 */
function updateMultistreamIndicator(isMultistream) {
  const multistreamInfo = document.getElementById('multistream-info');
  if (multistreamInfo) {
    multistreamInfo.style.display = isMultistream ? 'block' : 'none';
  }
}

/**
 * Update a form field value and its display
 * Handles both input elements and their associated display labels
 *
 * @param {string} fieldId - Field element ID
 * @param {*} value - Value to set
 */
function updateFormField(fieldId, value) {
  if (value === undefined) return;

  const field = document.getElementById(fieldId);
  const display = document.getElementById(`${fieldId}-value`);

  if (field) {
    field.value = value;
  }
  if (display) {
    display.textContent = value;
  }
}

/**
 * Update a checkbox state
 *
 * @param {string} checkboxId - Checkbox element ID
 * @param {boolean} checked - Checked state
 */
function updateCheckbox(checkboxId, checked) {
  if (checked === undefined) return;

  const checkbox = document.getElementById(checkboxId);
  if (checkbox) {
    checkbox.checked = checked;
  }
}

/**
 * Update volume slider and display
 * Converts 0-1 volume to 0-100 percentage
 *
 * @param {number} volume - Volume value (0-1)
 */
function updateVolumeSlider(volume) {
  if (volume === undefined) return;

  const volumePercent = Math.round(volume * 100);
  updateFormField('volume', volumePercent);
}

// Export public API
window.UIConfigLoader = {
  loadConfig,
  updateChannelIdDisplay,
  updateTwitchChannelDisplay,
  updatePlatformStatuses,
  updateMultistreamIndicator
};

