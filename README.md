# 🎥 Live Chat Overlay

A powerful, modular live chat overlay for OBS Studio with multistream support for YouTube and Twitch.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-14%2B-green.svg)](https://nodejs.org/)

---

## ⭐ Key Features

- ✅ **Auto-Detect Live Streams** - Automatically find your YouTube live stream with 1 click
- ✅ **Multistream Support** - Connect to YouTube AND Twitch simultaneously
- ✅ **Smart Caching** - Preserves YouTube API quota with intelligent caching
- ✅ **Real-time Updates** - WebSocket-based instant message delivery
- ✅ **Customizable Themes** - Neon, Cozy, and Custom CSS support
- ✅ **Rich Features** - Avatars, badges, moderator highlights, super chats
- ✅ **Sound Effects** - Customizable audio notifications
- ✅ **Smooth Animations** - Slide-up with fade effects
- ✅ **Emoji Support** - Twemoji rendering for all emojis

## 🚀 Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Configure (copy example and edit)
cp config.example.js config.js
# Edit config.js with your API keys and channel ID

# 3. Start server
npm start

# 4. Add to OBS Studio
# Browser Source URL: http://localhost:3000
# Recommended size: Width 400-600, Height 800-1080
```

**URLs:**
- 📺 Overlay: `http://localhost:3000`
- ⚙️ Control Panel: `http://localhost:3000/control`

## 📡 Multistream Mode

Connect to **both YouTube and Twitch** simultaneously and see all messages in one overlay!

1. Open control panel: `http://localhost:3000/control`
2. **YouTube**: Click "Auto-detect" or enter Video ID → "Connect YouTube"
3. **Twitch**: Enter channel name → "Connect Twitch"
4. Both chats now appear in the same overlay with platform icons!

**Read more:** [Multistream Documentation](docs/MULTISTREAM.md)

## 📖 Documentation

### Getting Started
- **[Quick Start Guide](docs/QUICKSTART.md)** - Get up and running in 5 minutes
- **[Full Setup Guide](docs/SETUP.md)** - Detailed installation and configuration
- **[OBS Integration](docs/OBS_SETUP.md)** - How to add overlay to OBS Studio

### Features
- **[Auto-Detect](docs/AUTO_DETECT.md)** - Automatically find your live stream
- **[Multistream Guide](docs/MULTISTREAM.md)** - Use YouTube + Twitch together
- **[Caching System](docs/CACHING_SYSTEM.md)** - How quota preservation works

### Technical
- **[Architecture](docs/ARCHITECTURE.md)** - System design and code structure
- **[Refactoring Summary](docs/REFACTORING_SUMMARY.md)** - Code improvements

## ⚙️ Configuration

### Basic Setup

Edit `config.js`:

```javascript
module.exports = {
  server: {
    port: 3000
  },
  
  youtube: {
    apiKey: 'YOUR_YOUTUBE_API_KEY',        // Required for live detection
    channelId: 'YOUR_CHANNEL_ID',          // Your YouTube channel ID
    simulationMode: false                   // Set true for testing without API
  },

  twitch: {
    defaultChannel: 'your_channel_name',
    botUsername: 'justinfan12345'           // Anonymous read-only access
  },

  overlay: {
    maxMessages: 6,                         // Messages shown on screen
    soundEnabled: true,
    soundVolume: 0.5,
    // ... more settings
  }
};
```

### Getting API Keys

**YouTube API Key:**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable "YouTube Data API v3"
4. Create credentials → API Key
5. Copy key to `config.js`

**Twitch (Optional):**
- The default anonymous mode works for most use cases
- For advanced features, see [Twitch API Documentation](https://dev.twitch.tv/)

## 🎨 Customization

### Themes
- **Neon** - Dark background with glowing effects
- **Cozy** - Warm, comfortable colors
- **Custom** - Create your own with custom CSS

### Custom CSS
Use the control panel to add custom styles:

```css
.chat-message {
  background: rgba(255, 0, 0, 0.8) !important;
  border-radius: 30px !important;
}

.username {
  color: #ffff00 !important;
  font-weight: bold !important;
}
```

Changes apply instantly without reloading!

## 📁 Project Structure

```
LiveChatOverlay/
├── server.js              # Main server entry point
├── config.js              # Configuration file
├── package.json           # Dependencies
│
├── src/                   # Server-side modules (NEW!)
│   ├── cache/
│   │   └── LiveStreamCache.js       # YouTube API quota preservation
│   ├── websocket/
│   │   ├── clientManager.js         # Client connection management
│   │   ├── configManager.js         # Configuration state
│   │   └── messageHandlers.js       # Message routing
│   └── routes/
│       ├── youtube.js               # YouTube API endpoints
│       ├── twitch.js                # Twitch API endpoints
│       └── system.js                # Health & system endpoints
│
├── public/                # Client-side files
│   ├── index.html        # Overlay page
│   ├── control.html      # Control panel
│   ├── css/
│   │   ├── overlay.css   # Base overlay styles
│   │   └── control.css   # Control panel styles
│   ├── js/
│   │   ├── overlay.js    # Main overlay script
│   │   ├── control.js    # Control panel script
│   │   ├── youtube.js    # YouTube client
│   │   ├── twitch.js     # Twitch client
│   │   └── modules/      # Modular components (NEW!)
│   │       ├── overlayWebSocket.js   # WebSocket management
│   │       ├── configManager.js      # Config state
│   │       ├── messageRenderer.js    # Message DOM creation
│   │       └── messageQueue.js       # Display queue
│   └── themes/
│       ├── neon.css      # Neon theme
│       ├── cozy.css      # Cozy theme
│       └── custom.css    # Custom theme template
│
└── docs/                  # Documentation
    ├── ARCHITECTURE.md    # Technical architecture
    ├── QUICKSTART.md      # Quick start guide
    ├── SETUP.md          # Detailed setup
    ├── OBS_SETUP.md      # OBS integration
    ├── MULTISTREAM.md    # Multistream guide
    ├── AUTO_DETECT.md    # Auto-detect feature
    └── CACHING_SYSTEM.md # Caching details
```

## 🛠️ Development

### Code Architecture

The project uses a **modular architecture** for better maintainability:

- **Server-side**: Separated into cache, WebSocket, and route modules
- **Client-side**: Overlay split into functional modules (WebSocket, config, rendering, queue)
- **Documentation**: Comprehensive JSDoc comments throughout

See [ARCHITECTURE.md](docs/ARCHITECTURE.md) for detailed technical documentation.

### Running in Development

```bash
npm start
```

Access:
- Overlay: http://localhost:3000
- Control Panel: http://localhost:3000/control
- Health Check: http://localhost:3000/health

## 🐛 Troubleshooting

### YouTube API Quota Error
- **Problem**: "You have exceeded your quota"
- **Solution**: The system uses caching to preserve quota. Wait 5 minutes or clear cache.
- See: [YOUTUBE_QUOTA_ERROR.md](docs/YOUTUBE_QUOTA_ERROR.md)

### Messages Not Appearing
1. Check browser console for errors (F12)
2. Verify WebSocket connection (should see "Connected to server")
3. Check control panel shows correct platform status
4. Test with "Send Test Message" button

### Auto-Detect Not Working
1. Verify YouTube API key in `config.js`
2. Verify channel ID is correct
3. Make sure you have an active live stream
4. Check server logs for API errors

## 📊 API Endpoints

- `GET /health` - Server health check
- `GET /api/youtube/channel/:channelId/live` - Detect live stream
- `GET /api/cache/stats` - Cache statistics
- `POST /api/cache/clear` - Clear cache

## 🤝 Contributing

Contributions are welcome! The codebase is now modular and well-documented:

1. Fork the repository
2. Create a feature branch
3. Follow existing code style (JSDoc comments)
4. Test thoroughly
5. Submit a pull request

## 📄 License

MIT License - feel free to use this project for personal or commercial streaming!

## 🙏 Acknowledgments

- **Twemoji** by Twitter for emoji rendering
- **Node.js** community
- **OBS Studio** for the amazing streaming software

---

**Need Help?** Check the [documentation](docs/) or create an issue on GitHub!

