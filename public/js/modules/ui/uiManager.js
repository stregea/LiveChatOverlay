/**
 * UI Manager - Main Facade
 *
 * Central interface for all UI-related functionality in the control panel.
 * Delegates to specialized modules for configuration loading and event handling.
 *
 * This is a facade pattern that provides a simple API while the actual
 * implementation is distributed across multiple focused modules.
 *
 * @module ui/uiManager
 * @requires UIConfigLoader
 * @requires UIEventHandlers
 */

/**
 * Load configuration into UI
 * Delegates to UIConfigLoader module
 *
 * @param {Object} config - Configuration object from server
 */
function loadConfig(config) {
  window.UIConfigLoader.loadConfig(config);
}

/**
 * Setup all event listeners
 * Delegates to UIEventHandlers module
 */
function setupEventListeners() {
  window.UIEventHandlers.setupEventListeners();
}

/**
 * Send test message
 * Delegates to UIEventHandlers module
 *
 * @param {string} type - Message type ('normal', 'superchat', 'moderator')
 */
function sendTestMessage(type) {
  window.UIEventHandlers.sendTestMessage(type);
}

/**
 * Test sound effect
 * Delegates to UIEventHandlers module
 */
function testSound() {
  window.UIEventHandlers.testSound();
}

// Export public API (maintains backward compatibility)
window.UIManager = {
  loadConfig,
  setupEventListeners,
  sendTestMessage,
  testSound
};

