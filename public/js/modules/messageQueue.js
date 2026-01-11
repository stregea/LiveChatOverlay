/**
 * Message Queue Manager for Overlay
 *
 * Manages the display queue of messages on screen
 * including adding, removing, and limiting visible messages.
 *
 * @module messageQueue
 */

/**
 * Array of currently displayed message elements
 * @type {HTMLElement[]}
 */
let queue = [];

/**
 * Container element for messages
 * @type {HTMLElement}
 */
let container = null;

/**
 * Sound effect audio element
 * @type {HTMLAudioElement}
 */
let soundElement = null;

/**
 * Initialize the message queue
 * Sets up container and sound references
 */
function initialize() {
  container = document.getElementById('chat-container');
  soundElement = document.getElementById('message-sound');

  if (!container) {
    console.error('❌ Chat container not found');
  }
}

/**
 * Add a message to the queue and display it
 * Automatically removes old messages if max limit is exceeded
 *
 * @param {HTMLElement} messageElement - Message DOM element to add
 * @param {Object} config - Current configuration
 * @param {boolean} shouldPlaySound - Whether to play sound effect
 */
function addMessage(messageElement, config, shouldPlaySound = true) {
  if (!container) {
    console.error('❌ Container not initialized');
    return;
  }

  // Add message to DOM
  container.appendChild(messageElement);
  queue.push(messageElement);

  // Play sound if enabled
  if (shouldPlaySound && config.soundEnabled) {
    playSound(config.volume);
  }

  // Remove old messages if exceeding max
  while (queue.length > config.maxMessages) {
    const oldMessage = queue.shift();
    removeMessage(oldMessage);
  }
}

/**
 * Remove a message from the display with fade-out animation
 *
 * @param {HTMLElement} messageElement - Message element to remove
 */
function removeMessage(messageElement) {
  messageElement.classList.add('fade-out');

  // Remove from DOM after animation completes
  setTimeout(() => {
    if (messageElement.parentNode) {
      messageElement.parentNode.removeChild(messageElement);
    }
  }, 500);
}

/**
 * Play the message sound effect
 *
 * @param {number} volume - Volume level (0-1)
 */
function playSound(volume = 0.5) {
  if (!soundElement) return;

  try {
    soundElement.volume = volume;
    soundElement.currentTime = 0;
    soundElement.play().catch(err => {
      console.log('⚠️  Audio play failed:', err.message);
    });
  } catch (error) {
    console.error('❌ Error playing sound:', error);
  }
}

/**
 * Clear all messages from the queue
 */
function clearAll() {
  queue.forEach(messageElement => {
    if (messageElement.parentNode) {
      messageElement.parentNode.removeChild(messageElement);
    }
  });
  queue = [];
  console.log('🗑️  Message queue cleared');
}

/**
 * Get the current number of messages in queue
 *
 * @returns {number} Number of messages
 */
function getCount() {
  return queue.length;
}

// Export public API
window.MessageQueue = {
  initialize,
  addMessage,
  removeMessage,
  playSound,
  clearAll,
  getCount
};

