/**
 * UI Manager for Control Panel
 *
 * Handles UI updates, form management, and user interactions
 * for the control panel interface.
 *
 * @module uiManager
 */

/**
 * Load configuration into UI form elements
 *
 * @param {Object} config - Configuration object from server
 */
function loadConfig(config) {
  console.log('⚙️  Loading config:', config);

  // Update YouTube channel ID display
  updateChannelIdDisplay(config);

  // Update platform connection status
  if (config.platforms) {
    window.PlatformManager.updatePlatformStatus('youtube', config.platforms.youtube.enabled);
    window.PlatformManager.updatePlatformStatus('twitch', config.platforms.twitch.enabled);

    // Show multistream indicator if both platforms connected
    updateMultistreamIndicator(
      config.platforms.youtube.enabled && config.platforms.twitch.enabled
    );
  }

  // Update form fields
  updateFormField('max-messages', config.maxMessages);
  updateCheckbox('sound-enabled', config.soundEnabled);
  updateVolumeSlider(config.volume);
}

/**
 * Update YouTube channel ID display
 *
 * @param {Object} config - Configuration object
 */
function updateChannelIdDisplay(config) {
  const channelIdInput = document.getElementById('youtube-channel-id');
  const channelIdLabel = document.getElementById('config-channel-id');
  const autoDetectInfo = document.getElementById('auto-detect-info');

  if (!channelIdInput || !channelIdLabel) return;

  if (config.youtubeChannelId && config.youtubeChannelId.trim() !== '') {
    channelIdInput.value = config.youtubeChannelId;
    channelIdLabel.textContent = config.youtubeChannelId;
    channelIdLabel.style.color = '#4caf50';

    // Hide error message
    if (autoDetectInfo) {
      autoDetectInfo.style.display = 'none';
    }

    console.log('✅ Channel ID configured:', config.youtubeChannelId);
  } else {
    channelIdInput.value = '';
    channelIdLabel.textContent = 'Not configured';
    channelIdLabel.style.color = '#d32f2f';
    console.log('❌ Channel ID not configured');
  }
}

/**
 * Update multistream indicator visibility
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
 *
 * @param {number} volume - Volume value (0-1)
 */
function updateVolumeSlider(volume) {
  if (volume === undefined) return;

  const volumePercent = Math.round(volume * 100);
  updateFormField('volume', volumePercent);
}

/**
 * Apply custom CSS with visual feedback
 */
function applyCustomCSS() {
  const customCSS = document.getElementById('custom-css').value;

  window.ControlWebSocket.sendConfig({ customCSS });
  console.log('💅 Custom CSS applied:', customCSS);

  // Show temporary success message
  showButtonSuccess('apply-css-btn', '✓ Applied!');
}

/**
 * Show temporary success state on a button
 *
 * @param {string} buttonId - Button element ID
 * @param {string} successText - Success message text
 * @param {number} duration - Duration in milliseconds
 */
function showButtonSuccess(buttonId, successText, duration = 2000) {
  const btn = document.getElementById(buttonId);
  if (!btn) return;

  const originalText = btn.textContent;
  const originalBackground = btn.style.background;

  btn.textContent = successText;
  btn.style.background = 'linear-gradient(135deg, #27ae60 0%, #2ecc71 100%)';

  setTimeout(() => {
    btn.textContent = originalText;
    btn.style.background = originalBackground;
  }, duration);
}

/**
 * Send test message to overlay
 *
 * @param {string} type - Message type ('normal', 'superchat', 'moderator')
 */
function sendTestMessage(type = 'normal') {
  const messageText = document.getElementById('test-message').value;

  const message = {
    username: 'TestUser',
    text: messageText || 'This is a test message! 👋',
    avatar: null,
    platform: 'youtube',
    usernameColor: type === 'moderator' ? '#00ff00' : '#3498db',
    isModerator: type === 'moderator',
    isSuperchat: type === 'superchat',
    amount: type === 'superchat' ? '$5.00' : null,
    badges: [],
    timestamp: Date.now()
  };

  window.ControlWebSocket.sendChatMessage(message);
}

/**
 * Test sound effect
 */
function testSound() {
  window.ControlWebSocket.send('test-sound', {});
  console.log('🔊 Testing sound...');
}

/**
 * Setup all event listeners for UI controls
 */
function setupEventListeners() {
  // Theme selector
  setupChangeListener('theme', (value) => {
    window.ControlWebSocket.sendConfig({ theme: value });
    console.log('🎨 Theme changed to:', value);
  });

  // Max messages slider
  setupSliderListener('max-messages', (value) => {
    window.ControlWebSocket.sendConfig({ maxMessages: parseInt(value) });
  });

  // Animation speed slider
  setupSliderListener('animation-speed', (value) => {
    window.ControlWebSocket.sendConfig({ animationSpeed: parseFloat(value) });
  });

  // Sound settings
  setupCheckboxListener('sound-enabled', (checked) => {
    window.ControlWebSocket.sendConfig({ soundEnabled: checked });
  });

  setupSliderListener('volume', (value) => {
    window.ControlWebSocket.sendConfig({ volume: parseFloat(value) / 100 });
  });

  // Background color and opacity
  setupChangeListener('bg-color', (value) => {
    window.ControlWebSocket.sendConfig({ bgColor: value });
  });

  setupSliderListener('bg-opacity', (value) => {
    window.ControlWebSocket.sendConfig({ bgOpacity: parseInt(value) });
  });

  // Border radius
  setupSliderListener('border-radius', (value) => {
    window.ControlWebSocket.sendConfig({ borderRadius: parseInt(value) });
  });

  // Blur effect
  setupCheckboxListener('blur-effect', (checked) => {
    window.ControlWebSocket.sendConfig({ blurEffect: checked });
  });

  // User info toggles
  setupCheckboxListener('show-username', (checked) => {
    window.ControlWebSocket.sendConfig({ showUsername: checked });
  });

  setupCheckboxListener('show-avatar', (checked) => {
    window.ControlWebSocket.sendConfig({ showAvatar: checked });
  });

  setupChangeListener('avatar-shape', (value) => {
    window.ControlWebSocket.sendConfig({ avatarShape: value });
  });

  setupCheckboxListener('show-platform-icon', (checked) => {
    window.ControlWebSocket.sendConfig({ showPlatformIcon: checked });
  });

  // Custom CSS button
  setupClickListener('apply-css-btn', applyCustomCSS);

  // Test message buttons
  setupClickListener('send-test-btn', () => sendTestMessage('normal'));
  setupClickListener('send-superchat-btn', () => sendTestMessage('superchat'));
  setupClickListener('send-moderator-btn', () => sendTestMessage('moderator'));
  setupClickListener('test-sound-btn', testSound);
}

/**
 * Setup change event listener
 *
 * @param {string} elementId - Element ID
 * @param {Function} callback - Callback function receiving value
 */
function setupChangeListener(elementId, callback) {
  const element = document.getElementById(elementId);
  if (element) {
    element.addEventListener('change', (e) => callback(e.target.value));
  }
}

/**
 * Setup slider event listener (updates value display and sends config)
 *
 * @param {string} elementId - Element ID
 * @param {Function} callback - Callback function receiving value
 */
function setupSliderListener(elementId, callback) {
  const element = document.getElementById(elementId);
  const display = document.getElementById(`${elementId}-value`);

  if (element) {
    element.addEventListener('input', (e) => {
      const value = e.target.value;
      if (display) {
        display.textContent = value;
      }
      callback(value);
    });
  }
}

/**
 * Setup checkbox event listener
 *
 * @param {string} elementId - Element ID
 * @param {Function} callback - Callback function receiving checked state
 */
function setupCheckboxListener(elementId, callback) {
  const element = document.getElementById(elementId);
  if (element) {
    element.addEventListener('change', (e) => callback(e.target.checked));
  }
}

/**
 * Setup click event listener
 *
 * @param {string} elementId - Element ID
 * @param {Function} callback - Callback function
 */
function setupClickListener(elementId, callback) {
  const element = document.getElementById(elementId);
  if (element) {
    element.addEventListener('click', callback);
  }
}

// Export public API
window.UIManager = {
  loadConfig,
  setupEventListeners,
  sendTestMessage,
  testSound,
  applyCustomCSS
};

