/**
 * UI Event Handlers
 *
 * Sets up and manages all event listeners for the control panel.
 * Handles user interactions with form elements and buttons.
 *
 * @module ui/eventHandlers
 */

/**
 * Setup all event listeners for UI controls
 * Called once during control panel initialization
 */
function setupEventListeners() {
  setupThemeListeners();
  setupMessageDisplayListeners();
  setupSoundListeners();
  setupVisualListeners();
  setupUserInfoListeners();
  setupActionButtonListeners();
}

/**
 * Setup theme selection listeners
 */
function setupThemeListeners() {
  setupChangeListener('theme', (value) => {
    window.ControlWebSocket.sendConfig({ theme: value });
    console.log('🎨 Theme changed to:', value);
  });

  // Custom CSS button
  setupClickListener('apply-css-btn', () => {
    const customCSS = document.getElementById('custom-css').value;
    window.ControlWebSocket.sendConfig({ customCSS });
    console.log('💅 Custom CSS applied:', customCSS);
    showButtonSuccess('apply-css-btn', '✓ Applied!');
  });
}

/**
 * Setup message display setting listeners
 */
function setupMessageDisplayListeners() {
  // Max messages slider
  setupSliderListener('max-messages', (value) => {
    window.ControlWebSocket.sendConfig({ maxMessages: parseInt(value) });
  });

  // Animation speed slider
  setupSliderListener('animation-speed', (value) => {
    window.ControlWebSocket.sendConfig({ animationSpeed: parseFloat(value) });
  });
}

/**
 * Setup sound setting listeners
 */
function setupSoundListeners() {
  // Sound enabled checkbox
  setupCheckboxListener('sound-enabled', (checked) => {
    window.ControlWebSocket.sendConfig({ soundEnabled: checked });
  });

  // Volume slider
  setupSliderListener('volume', (value) => {
    window.ControlWebSocket.sendConfig({ volume: parseFloat(value) / 100 });
  });
}

/**
 * Setup visual setting listeners
 */
function setupVisualListeners() {
  // Background color picker
  setupChangeListener('bg-color', (value) => {
    window.ControlWebSocket.sendConfig({ bgColor: value });
  });

  // Background opacity slider
  setupSliderListener('bg-opacity', (value) => {
    window.ControlWebSocket.sendConfig({ bgOpacity: parseInt(value) });
  });

  // Border radius slider
  setupSliderListener('border-radius', (value) => {
    window.ControlWebSocket.sendConfig({ borderRadius: parseInt(value) });
  });

  // Blur effect checkbox
  setupCheckboxListener('blur-effect', (checked) => {
    window.ControlWebSocket.sendConfig({ blurEffect: checked });
  });
}

/**
 * Setup user info display listeners
 */
function setupUserInfoListeners() {
  // Show username checkbox
  setupCheckboxListener('show-username', (checked) => {
    window.ControlWebSocket.sendConfig({ showUsername: checked });
  });

  // Show avatar checkbox
  setupCheckboxListener('show-avatar', (checked) => {
    window.ControlWebSocket.sendConfig({ showAvatar: checked });
  });

  // Avatar shape selector
  setupChangeListener('avatar-shape', (value) => {
    window.ControlWebSocket.sendConfig({ avatarShape: value });
  });

  // Show platform icon checkbox
  setupCheckboxListener('show-platform-icon', (checked) => {
    window.ControlWebSocket.sendConfig({ showPlatformIcon: checked });
  });
}

/**
 * Setup action button listeners
 */
function setupActionButtonListeners() {
  // Test message buttons
  setupClickListener('send-test-btn', () => sendTestMessage('normal'));
  setupClickListener('send-superchat-btn', () => sendTestMessage('superchat'));
  setupClickListener('send-moderator-btn', () => sendTestMessage('moderator'));

  // Test sound button
  setupClickListener('test-sound-btn', testSound);
}

/**
 * Setup change event listener
 * Generic helper for select and input change events
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
 * Setup slider event listener
 * Updates value display and sends config change
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

      // Update display label
      if (display) {
        display.textContent = value;
      }

      // Send config update
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

/**
 * Send test message to overlay
 * Creates and sends a test message of specified type
 *
 * @param {string} type - Message type ('normal', 'superchat', 'moderator')
 */
function sendTestMessage(type = 'normal') {
  const messageText = document.getElementById('test-message').value;

  const message = {
    id: `test-${Date.now()}`,
    username: 'TestUser',
    text: messageText || 'This is a test message! 👋',
    avatar: null,
    platform: 'youtube',
    usernameColor: getTestMessageColor(type),
    isModerator: type === 'moderator',
    isSuperchat: type === 'superchat',
    amount: type === 'superchat' ? '$5.00' : null,
    badges: [],
    timestamp: Date.now()
  };

  window.ControlWebSocket.sendChatMessage(message);
}

/**
 * Get username color for test message type
 *
 * @param {string} type - Message type
 * @returns {string} Color hex code
 */
function getTestMessageColor(type) {
  switch (type) {
    case 'moderator':
      return '#00ff00';
    case 'superchat':
      return '#ffd700';
    default:
      return '#3498db';
  }
}

/**
 * Test sound effect
 * Sends test sound request to overlay
 */
function testSound() {
  window.ControlWebSocket.send('test-sound', {});
  console.log('🔊 Testing sound...');
}

/**
 * Show temporary success state on a button
 * Provides visual feedback for user actions
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

  // Show success state
  btn.textContent = successText;
  btn.style.background = 'linear-gradient(135deg, #27ae60 0%, #2ecc71 100%)';

  // Restore original state after duration
  setTimeout(() => {
    btn.textContent = originalText;
    btn.style.background = originalBackground;
  }, duration);
}

// Export public API
window.UIEventHandlers = {
  setupEventListeners,
  sendTestMessage,
  testSound,
  showButtonSuccess
};

