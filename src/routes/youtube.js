/**
 * YouTube API Routes
 *
 * Handles all YouTube-related API endpoints including:
 * - Live stream detection
 * - Video details fetching
 * - API quota management through caching
 *
 * @module routes/youtube
 */

const express = require('express');
const fetch = require('node-fetch');
const config = require('../../config');

const router = express.Router();

/**
 * Get the current live stream for a YouTube channel
 * Uses caching to preserve API quota
 *
 * @route GET /api/youtube/channel/:channelId/live
 * @param {string} channelId - YouTube channel ID
 * @returns {Object} Live stream information or error
 */
router.get('/channel/:channelId/live', async (req, res) => {
  const { channelId } = req.params;
  const cache = req.app.locals.liveStreamCache;

  // Validate API key
  if (!config.youtube.apiKey) {
    return res.json({
      status: 'error',
      message: 'YouTube API key not configured'
    });
  }

  try {
    // Check cache first to save API quota
    const cachedResult = cache.get(channelId);
    if (cachedResult) {
      return res.json({
        status: 'success',
        ...cachedResult,
        fromCache: true
      });
    }

    // Fetch live streams from YouTube API
    const searchUrl = `https://www.googleapis.com/youtube/v3/search?` +
      `part=snippet&channelId=${channelId}&eventType=live&type=video&` +
      `key=${config.youtube.apiKey}`;

    const response = await fetch(searchUrl);
    const data = await response.json();

    // Handle API errors
    if (data.error) {
      console.error('❌ YouTube API error:', data.error.message);
      return res.json({
        status: 'error',
        message: data.error.message,
        code: data.error.code
      });
    }

    // Check if live streams found
    if (data.items && data.items.length > 0) {
      const liveVideo = data.items[0];
      const result = {
        videoId: liveVideo.id.videoId,
        title: liveVideo.snippet.title,
        channelTitle: liveVideo.snippet.channelTitle,
        thumbnail: liveVideo.snippet.thumbnails.medium.url
      };

      // Cache the result
      cache.set(channelId, result);

      return res.json({
        status: 'success',
        ...result,
        fromCache: false
      });
    } else {
      // No live streams found
      return res.json({
        status: 'no_live_stream',
        message: 'No active live stream found for this channel'
      });
    }
  } catch (error) {
    console.error('❌ YouTube API error:', error.message);
    return res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

/**
 * Get YouTube video details
 * Fetches video and live streaming details for a specific video ID
 *
 * @route GET /api/youtube/:videoId
 * @param {string} videoId - YouTube video ID
 * @returns {Object} Video details or error
 */
router.get('/:videoId', async (req, res) => {
  const { videoId } = req.params;

  // Validate API key
  if (!config.youtube.apiKey) {
    return res.json({
      status: 'error',
      message: 'YouTube API key not configured',
      simulationMode: config.youtube.simulationMode
    });
  }

  try {
    // Fetch video details including live streaming info
    const videoUrl = `https://www.googleapis.com/youtube/v3/videos?` +
      `part=liveStreamingDetails&id=${videoId}&key=${config.youtube.apiKey}`;

    const response = await fetch(videoUrl);
    const data = await response.json();

    return res.json({
      status: 'success',
      data: data
    });
  } catch (error) {
    console.error('❌ YouTube API error:', error.message);
    return res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

module.exports = router;

