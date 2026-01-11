/**
 * Live Chat Overlay - Control Panel
 *
 * This file serves as the MAIN COORDINATOR and BRIDGE between the HTML UI
 * and the modular JavaScript code.
 *
 * Purpose:
 * --------
 * 1. Initialize the control panel by coordinating all modules
 * 2. Provide global functions that HTML inline onclick handlers can call
 * 3. Bridge between simple HTML (onclick="connectYouTube()") and modular code
 *
 * Architecture Pattern: FACADE
 * ----------------------------
 * This file acts as a facade/adapter layer:
 * - HTML has inline onclick handlers: <button onclick="connectYouTube()">
 * - These onclick handlers require GLOBAL functions in window scope
 * - This file provides those global functions
 * - Each global function delegates to the appropriate module
 *
 * Example Flow:
 * -------------
 * HTML: <button onclick="connectYouTube()">
 *   → control.js: function connectYouTube()
 *   → window.PlatformManager.connectYouTube()
 *   → platformManager.js: actual implementation
 *
 * Why Not Call Modules Directly?
 * -------------------------------
 * Could change HTML to: onclick="window.PlatformManager.connectYouTube()"
 * But this approach:
 * - Keeps HTML clean and simple
 * - Hides internal module structure from HTML
 * - Makes refactoring easier (rename modules without touching HTML)
 * - Provides clear entry point showing what the control panel does
 *
 * Modular Architecture:
 * ---------------------
 * - controlWebSocket.js: WebSocket connection management
 * - platformManager.js: Platform connection handling
 * - uiManager.js: UI updates and event listeners
 *
 * @requires ControlWebSocket - Manages server WebSocket connection
 * @requires PlatformManager - Handles YouTube/Twitch connections
 * @requires UIManager - Updates UI and manages form controls
 */

// ============================================================================
// INITIALIZATION - Module Coordination
// ============================================================================

/**
 * Initialize the control panel
 *
 * This function coordinates all modules and sets up the control panel:
 * 1. Sets up UI event listeners (sliders, checkboxes, buttons)
 * 2. Connects to WebSocket server
 * 3. Loads initial configuration when received from server
 *
 * Module coordination:
 * - UIManager: Handles all form controls and UI updates
 * - ControlWebSocket: Manages server connection and messaging
 * - PlatformManager: Handles YouTube/Twitch connections (via global functions)
 *
 * Called automatically when DOM is ready
 */
function initialize() {
  console.log('');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('⚙️  Control Panel Initializing');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('');

  // Setup UI event listeners
  window.UIManager.setupEventListeners();

  // Connect to server with config callback
  window.ControlWebSocket.connect((config) => {
    window.UIManager.loadConfig(config);
  });

  console.log('✅ Control panel initialized');
}

// ============================================================================
// GLOBAL FUNCTIONS - Bridge Between HTML and Modules
// ============================================================================
//
// These functions are called by inline onclick handlers in control.html.
// They act as a FACADE that delegates to the appropriate module functions.
//
// Why this approach?
// ------------------
// - HTML onclick attributes require global functions
// - Keeps HTML clean: onclick="connectYouTube()" instead of
//   onclick="window.PlatformManager.connectYouTube()"
// - Provides clear interface showing what the control panel can do
// - Allows refactoring modules without breaking HTML
//
// Architecture: HTML → Global Function → Module Function → Implementation
// ============================================================================

/**
 * Connect to YouTube - called from HTML onclick
 * Delegates to: window.PlatformManager.connectYouTube()
 */
function connectYouTube() {
  window.PlatformManager.connectYouTube();
}

/**
 * Disconnect from YouTube - called from HTML onclick
 * Delegates to: window.PlatformManager.disconnectYouTube()
 */
function disconnectYouTube() {
  window.PlatformManager.disconnectYouTube();
}

/**
 * Connect to Twitch - called from HTML onclick
 * Delegates to: window.PlatformManager.connectTwitch()
 */
function connectTwitch() {
  window.PlatformManager.connectTwitch();
}

/**
 * Disconnect from Twitch - called from HTML onclick
 * Delegates to: window.PlatformManager.disconnectTwitch()
 */
function disconnectTwitch() {
  window.PlatformManager.disconnectTwitch();
}

/**
 * Disconnect from all platforms - called from HTML onclick
 * Delegates to: window.PlatformManager.disconnectAll()
 */
function disconnectAll() {
  window.PlatformManager.disconnectAll();
}

/**
 * Auto-detect live stream - called from HTML onclick
 * Delegates to: window.PlatformManager.autoDetectLiveStream()
 */
function autoDetectLiveStream() {
  window.PlatformManager.autoDetectLiveStream();
}

// Start the control panel when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initialize);
} else {
  initialize();
}

