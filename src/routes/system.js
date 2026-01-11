/**
 * System API Routes
 *
 * Handles system-level endpoints including:
 * - Health checks
 * - Configuration retrieval
 * - Cache management
 * - Debug information
 *
 * @module routes/system
 */

const express = require('express');
const config = require('../../config');
const configManager = require('../websocket/configManager');
const clientManager = require('../websocket/clientManager');

const router = express.Router();

/**
 * Health check endpoint
 * Returns server status and current configuration
 *
 * @route GET /health
 * @returns {Object} Server health and status information
 */
router.get('/health', (req, res) => {
  const activeConnections = configManager.getActiveConnections();

  res.json({
    status: 'ok',
    uptime: process.uptime(),
    clients: clientManager.getClientCount(),
    config: {
      platforms: configManager.getConfig().platforms,
      activeConnections: activeConnections,
      multistream: configManager.isMultistreamActive(),
      maxMessages: configManager.getConfig().maxMessages
    },
    features: {
      youtubeApiConfigured: !!config.youtube.apiKey,
      twitchApiConfigured: !!config.twitch.clientId,
      youtubeSimulationMode: config.youtube.simulationMode
    }
  });
});

/**
 * Get safe configuration subset for client consumption
 * Excludes sensitive data like API keys
 *
 * @route GET /api/config
 * @returns {Object} Public configuration data
 */
router.get('/config', (req, res) => {
  res.json({
    overlay: config.overlay,
    platforms: {
      youtube: {
        simulationMode: config.youtube.simulationMode,
        apiConfigured: !!config.youtube.apiKey
      },
      twitch: {
        ircMode: config.twitch.botUsername.startsWith('justinfan'),
        apiConfigured: !!config.twitch.clientId
      }
    }
  });
});

/**
 * Debug endpoint - returns full current runtime config
 * Useful for troubleshooting and development
 *
 * @route GET /api/debug/config
 * @returns {Object} Complete runtime configuration
 */
router.get('/debug/config', (req, res) => {
  res.json(configManager.getConfig());
});

/**
 * Cache statistics endpoint
 * Returns cache metrics and entries
 *
 * @route GET /api/cache/stats
 * @returns {Object} Cache statistics
 */
router.get('/cache/stats', (req, res) => {
  const cache = req.app.locals.liveStreamCache;
  const stats = cache.getStats();

  res.json({
    status: 'ok',
    cache: stats
  });
});

/**
 * Clear cache endpoint
 * Removes all cached entries
 *
 * @route POST /api/cache/clear
 * @returns {Object} Operation result
 */
router.post('/cache/clear', (req, res) => {
  const cache = req.app.locals.liveStreamCache;
  cache.clear();

  res.json({
    status: 'ok',
    message: 'Cache cleared successfully'
  });
});

module.exports = router;

