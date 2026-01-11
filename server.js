/**
 * Live Chat Overlay Server
 *
 * Main server file that coordinates:
 * - Express web server for static files and API endpoints
 * - WebSocket server for real-time client communication
 * - Client connection management
 * - Configuration broadcasting
 *
 * Architecture:
 * - Modular design with separated concerns
 * - WebSocket handlers in src/websocket/
 * - API routes in src/routes/
 * - Cache system in src/cache/
 *
 * @module server
 */

const express = require('express');
const WebSocket = require('ws');
const path = require('path');
const config = require('./config');

// Import modular components
const LiveStreamCache = require('./src/cache/LiveStreamCache');
const clientManager = require('./src/websocket/clientManager');
const configManager = require('./src/websocket/configManager');
const messageHandlers = require('./src/websocket/messageHandlers');

// Import API routes
const youtubeRoutes = require('./src/routes/youtube');
const twitchRoutes = require('./src/routes/twitch');
const systemRoutes = require('./src/routes/system');

// ============================================================================
// SERVER INITIALIZATION
// ============================================================================

const app = express();
const PORT = config.server.port;

// Initialize cache system
const liveStreamCache = new LiveStreamCache(5); // 5 minute TTL
app.locals.liveStreamCache = liveStreamCache; // Make available to routes

// Middleware
app.use(express.static('public'));
app.use(express.json());

// ============================================================================
// ROUTES
// ============================================================================

// HTML pages
app.get('/control', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'control.html'));
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// API routes
app.use('/api/youtube', youtubeRoutes);
app.use('/api/twitch', twitchRoutes);
app.use('/api', systemRoutes);
app.use('/', systemRoutes); // For /health endpoint

// ============================================================================
// ERROR HANDLING
// ============================================================================

/**
 * 404 handler - catch all unmatched routes
 */
app.use((req, res) => {
  console.warn(`⚠️  404 Not Found: ${req.method} ${req.url}`);
  res.status(404).json({
    status: 'error',
    message: 'Resource not found',
    path: req.url
  });
});

/**
 * General error handler
 */
app.use((err, req, res, _next) => {
  console.error(`❌ Server error: ${err.message}`);
  res.status(500).json({
    status: 'error',
    message: 'Internal server error'
  });
});

// ============================================================================
// HTTP SERVER
// ============================================================================

const server = app.listen(PORT, () => {
  console.log('');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('🎥  Live Chat Overlay Server');
  console.log('═══════════════════════════════════════════════════════════');
  console.log(`📺  Overlay URL:       http://localhost:${PORT}`);
  console.log(`⚙️   Control Panel:    http://localhost:${PORT}/control`);
  console.log('');
  console.log('Configuration:');
  console.log(`  • Max Messages:      ${config.overlay.maxMessages}`);
  console.log(`  • YouTube API:       ${config.youtube.apiKey ? '✓ Configured' : '✗ Not configured (simulation mode)'}`);
  console.log(`  • Twitch Auth:       ${config.twitch.botUsername === 'justinfan12345' ? '✗ Anonymous mode' : '✓ Authenticated'}`);
  console.log(`  • Cache TTL:         5 minutes`);
  console.log('═══════════════════════════════════════════════════════════');
  console.log('');
});

// ============================================================================
// WEBSOCKET SERVER
// ============================================================================

const wss = new WebSocket.Server({ server });

/**
 * Handle new WebSocket connections
 */
wss.on('connection', (ws) => {
  // Add client to manager
  clientManager.addClient(ws);

  // Send initial configuration
  clientManager.sendToClient(ws, {
    type: 'config',
    data: configManager.getConfig()
  });

  // Set up event handlers
  ws.on('message', (message) => {
    messageHandlers.handleMessage(ws, message);
  });

  ws.on('close', () => {
    clientManager.removeClient(ws);
  });

  ws.on('error', (error) => {
    console.error('❌ WebSocket error:', error.message);
  });
});

// ============================================================================
// GRACEFUL SHUTDOWN
// ============================================================================

/**
 * Handle graceful shutdown on various signals
 * Closes all connections cleanly before exiting
 *
 * @param {string} signal - Signal that triggered shutdown
 */
function gracefulShutdown(signal) {
  console.log('');
  console.log(`${signal} received. Shutting down gracefully...`);

  // Close all WebSocket connections
  clientManager.closeAllConnections();

  // Close HTTP server
  server.close(() => {
    console.log('✅ Server closed successfully');
    process.exit(0);
  });

  // Force close after 10 seconds
  setTimeout(() => {
    console.error('⚠️  Forcing shutdown after timeout');
    process.exit(1);
  }, 10000);
}

// Register shutdown handlers
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught exception:', error);
  gracefulShutdown('UNCAUGHT_EXCEPTION');
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled rejection at:', promise, 'reason:', reason);
});

module.exports = { app, server, wss };

