/**
 * Twitch API Routes
 *
 * Handles all Twitch-related API endpoints including:
 * - User information fetching
 * - Channel data retrieval
 *
 * @module routes/twitch
 */

const express = require('express');
const fetch = require('node-fetch');
const config = require('../../config');

const router = express.Router();

/**
 * Get global emotes (Twitch only)
 *
 * @route GET /api/twitch/emotes/global
 * @returns {Object} Object containing twitch emote array
 */
router.get('/emotes/global', async (req, res) => {
  try {
    const result = {
      twitch: []
    };

    // Fetch Twitch global emotes (requires auth, optional)
    if (config.twitch.clientId) {
      try {
        const twitchResponse = await fetch('https://api.twitch.tv/helix/chat/emotes/global', {
          headers: {
            'Client-ID': config.twitch.clientId,
            'Authorization': `Bearer ${config.twitch.accessToken || ''}`
          }
        });

        if (twitchResponse.ok) {
          const twitchData = await twitchResponse.json();
          result.twitch = twitchData.data || [];
          console.log(`✅ Fetched ${result.twitch.length} Twitch global emotes`);
        } else {
          console.warn('⚠️ Twitch API responded with error:', twitchResponse.status);
        }
      } catch (error) {
        console.warn('⚠️ Failed to fetch Twitch global emotes:', error.message);
      }
    } else {
      console.warn('⚠️ Twitch Client ID not configured, cannot fetch emotes');
    }

    return res.json(result);
  } catch (error) {
    console.error('❌ Emotes API error:', error.message);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to fetch emotes',
      twitch: []
    });
  }
});


/**
 * Get Twitch channel/user information
 *
 * @route GET /api/twitch/:channel
 * @param {string} channel - Twitch channel/username
 * @returns {Object} User data or error
 */
router.get('/:channel', async (req, res) => {
  const { channel } = req.params;

  // Check if Twitch API is configured
  if (!config.twitch.clientId) {
    return res.json({
      status: 'error',
      message: 'Twitch Client ID not configured',
      ircMode: true
    });
  }

  try {
    // Fetch user data from Twitch Helix API
    const userUrl = `https://api.twitch.tv/helix/users?login=${channel}`;
    const response = await fetch(userUrl, {
      headers: {
        'Client-ID': config.twitch.clientId,
        'Authorization': `Bearer ${config.twitch.accessToken || ''}`
      }
    });

    const data = await response.json();

    return res.json({
      status: 'success',
      data: data
    });
  } catch (error) {
    console.error('❌ Twitch API error:', error.message);
    return res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

module.exports = router;

