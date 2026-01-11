# 🎥 Live Chat Overlay

A professional live chat overlay for OBS Studio supporting **YouTube** and **Twitch** with real-time multistream capability.

![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)
![Node.js](https://img.shields.io/badge/Node.js-14%2B-green.svg)

---

## ✨ Features

- 🎯 **Multistream** - Display YouTube and Twitch chats simultaneously
- 🔍 **Auto-Detect** - Find your YouTube live stream automatically
- 🎨 **Customizable** - Neon, Cozy, and Custom CSS themes
- 🖼️ **Rich Display** - Avatars, badges, moderator highlights, super chats
- 🔊 **Sound Effects** - Notification sounds for new messages
- ⚡ **Real-time** - WebSocket-based instant message delivery
- 💾 **Smart Caching** - Preserves YouTube API quota
- 😊 **Emoji Support** - Twemoji rendering

---

## 📋 Prerequisites

Before you begin, ensure you have:

- **Node.js 14+** - [Download here](https://nodejs.org/)
- **YouTube API Key** - For YouTube chat (see setup below)
- **OBS Studio** - [Download here](https://obsproject.com/)

---

## 🚀 Installation & Setup

### Step 1: Clone & Install

```bash
# Clone or download this repository
cd LiveChatOverlay

# Install dependencies
npm install
```

### Step 2: Get YouTube API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (or select existing)
3. Enable **"YouTube Data API v3"**:
   - Click "Enable APIs and Services"
   - Search for "YouTube Data API v3"
   - Click "Enable"
4. Create credentials:
   - Click "Create Credentials" → "API Key"
   - Copy the API key
5. (Optional) Restrict the key to "YouTube Data API v3" for security

### Step 3: Get YouTube Channel ID

1. Go to your [YouTube Studio](https://studio.youtube.com/)
2. Click your profile icon → "Your Channel"
3. Copy the channel ID from the URL:
   - URL format: `youtube.com/channel/YOUR_CHANNEL_ID`
   - Example: `UC5PzeoJUzl3iWw6CElbWWkg`

### Step 4: (Optional) Get Twitch Credentials

Only needed if you want user avatars (optional):

1. Go to [Twitch Developer Console](https://dev.twitch.tv/console)
2. Enable Two-Factor Authentication on your Twitch account
3. Click "Register Your Application"
4. Fill in:
   - **Name**: Your app name (e.g., "Live Chat Overlay")
   - **OAuth Redirect URLs**: `http://localhost:3000`
   - **Category**: "Chat Bot" or "Application Integration"
5. Click "Create"
6. Click "Manage" on your application
7. Copy **Client ID**
8. Click "New Secret" and copy **Client Secret**

### Step 5: Configure

```bash
# Copy example config
cp config.example.js config.js

# Edit config.js with your credentials
nano config.js  # or use any text editor
```

**Required Configuration:**

```javascript
module.exports = {
  server: {
    port: 3000
  },
  
  // REQUIRED for YouTube
  youtube: {
    apiKey: 'YOUR_YOUTUBE_API_KEY',           // From Step 2
    channelId: 'YOUR_YOUTUBE_CHANNEL_ID',     // From Step 3
    simulationMode: false
  },

  // OPTIONAL for Twitch (works without credentials)
  twitch: {
    defaultChannel: '',                        // Your Twitch channel name
    botUsername: 'justinfan12345',            // Anonymous (leave as-is)
    clientId: '',                              // From Step 4 (optional)
    clientSecret: ''                           // From Step 4 (optional)
  },

  // Overlay settings
  overlay: {
    maxMessages: 6,
    soundEnabled: true,
    soundVolume: 0.5,
    // ...see config.example.js for all options
  }
};
```

### Step 6: Start the Server

```bash
npm start
```

You should see:
```
🚀 Server running on http://localhost:3000
✅ YouTube API configured
✅ Overlay available at: http://localhost:3000
✅ Control panel at: http://localhost:3000/control
```

### Step 7: Add to OBS Studio

1. Open OBS Studio
2. Add a new **Browser Source**:
   - Click **+** in Sources → **Browser**
3. Configure:
   - **URL**: `http://localhost:3000`
   - **Width**: `400` (recommended for side panel)
   - **Height**: `1080` (or your canvas height)
   - **FPS**: `30`
   - ✅ Check "Shutdown source when not visible"
4. Position the overlay on your scene
5. Click **OK**

**Recommended Sizes:**
- **Side Panel**: 400x1080 (most common)
- **Bottom Ticker**: 1920x200
- **Floating Box**: 600x400

---

## 🎮 Usage

### Control Panel

Open `http://localhost:3000/control` to manage your overlay.

#### Connect to YouTube

1. Click **"🔍 Auto-detect"** button (finds your current live stream)
   - OR manually enter your Video ID
2. Click **"Connect YouTube"**
3. Messages will appear in the overlay

#### Connect to Twitch

1. Enter your Twitch channel name (lowercase)
2. Click **"Connect Twitch"**
3. Messages will appear in the overlay

#### Multistream Mode

Connect to **both** YouTube and Twitch simultaneously:
- Both chat platforms display in the same overlay
- Platform icons (▶ YouTube, ▼ Twitch) distinguish messages
- Independent connect/disconnect for each platform

### Customization

**Themes:**
- **Neon** - Dark with glowing effects
- **Cozy** - Warm, comfortable colors
- **Custom** - Write your own CSS

**Custom CSS Example:**
```css
.chat-message {
  background: rgba(0, 0, 0, 0.8) !important;
  border-radius: 20px !important;
}

.username {
  color: #00ffff !important;
}
```

---

## 📁 Project Structure

```
LiveChatOverlay/
├── server.js                 # Main server
├── config.js                 # Your configuration
├── config.example.js         # Configuration template
├── package.json
│
├── src/                      # Server-side code
│   ├── cache/               # YouTube API quota caching
│   ├── routes/              # API endpoints
│   └── websocket/           # WebSocket handling
│
├── public/                   # Client-side code
│   ├── index.html           # Overlay page
│   ├── control.html         # Control panel
│   ├── css/                 # Stylesheets
│   ├── js/
│   │   ├── overlay.js       # Main overlay logic
│   │   ├── control.js       # Control panel logic
│   │   ├── lib/
│   │   │   ├── youtube.js   # YouTube API client
│   │   │   └── twitch.js    # Twitch IRC client
│   │   └── modules/         # Reusable components
│   ├── themes/              # Theme CSS files
│   └── sounds/              # Notification sounds
│
└── docs/                     # Documentation

└── docs/                     # Documentation
```

---

## 🔧 Troubleshooting

### "YouTube API quota exceeded"

**Problem:** You've hit the daily YouTube API quota limit.

**Solutions:**
1. Wait 5 minutes - the system caches results
2. Clear cache: `POST http://localhost:3000/api/cache/clear`
3. Manually enter Video ID instead of using auto-detect

**Prevention:** The overlay automatically caches live stream lookups for 5 minutes to preserve quota.

### Messages not appearing in overlay

1. **Check browser console** (F12) for errors
2. **Verify connection** - Control panel should show "Connected" status
3. **Test with demo** - Click "Send Test Message" in control panel
4. **Clear browser cache** - Hard refresh: `Cmd+Shift+R` (Mac) or `Ctrl+Shift+R` (Windows)
5. **Check WebSocket** - Console should show "✅ Connected to server"

### Auto-Detect not finding live stream

1. **Verify you're live** - Check YouTube Studio
2. **Check API key** - Must be valid and have YouTube Data API v3 enabled
3. **Check channel ID** - Must match your YouTube channel exactly
4. **Check logs** - Server console shows API errors
5. **Try manual entry** - Get Video ID from your live stream URL

### Twitch messages not appearing

1. **Check channel name** - Must be lowercase, no special characters
2. **Hard refresh browser** - `Cmd+Shift+R` (Mac) or `Ctrl+Shift+R` (Windows)
3. **Check console** - Should see "✅ Connected to Twitch IRC"
4. **Test in Twitch chat** - Send a message while overlay is open

### OBS Browser Source is blank

1. **Check URL** - Must be `http://localhost:3000` (not control.html)
2. **Restart server** - Stop and run `npm start` again
3. **Refresh source** - Right-click source → Refresh
4. **Check port** - Ensure port 3000 isn't used by another app

---

## 🎨 Advanced Customization

### Custom Animations

Edit `/public/css/overlay.css`:

```css
.chat-message {
  animation: slideUpFade 0.5s ease-out;
}

@keyframes slideUpFade {
  from {
    opacity: 0;
    transform: translateY(30px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}
```

### Custom Sound Effects

Replace `/public/sounds/message.mp3` with your own sound file (must be named `message.mp3`).

### Message Duration

Edit `config.js`:

```javascript
overlay: {
  messageDuration: 10000,  // 10 seconds (0 = unlimited)
  maxMessages: 6,           // Max messages on screen
}
```

---

## 📊 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Server health check |
| `/api/youtube/channel/:channelId/live` | GET | Detect live stream |
| `/api/cache/stats` | GET | Cache statistics |
| `/api/cache/clear` | POST | Clear cache |

---

## 🔐 Security Notes

- **Never commit `config.js`** to version control (already in `.gitignore`)
- **Restrict API keys** in Google Cloud Console to specific APIs
- **Use environment variables** for production deployments
- **Keep dependencies updated** with `npm audit fix`

---

## 🚀 Deployment (Optional)

To run on a VPS or cloud server:

```bash
# Install PM2 for process management
npm install -g pm2

# Start with PM2
pm2 start server.js --name "chat-overlay"

# Save PM2 process list
pm2 save

# Setup PM2 to start on boot
pm2 startup
```

**Update OBS Browser Source URL** to your server's IP:
```
http://YOUR_SERVER_IP:3000
```

---

## 🤝 Contributing

Contributions welcome! The codebase uses modular architecture with comprehensive JSDoc comments.

1. Fork the repository
2. Create feature branch: `git checkout -b feature-name`
3. Follow existing code style
4. Test thoroughly
5. Submit pull request

---

## 📄 License

MIT License - Free for personal and commercial use!

---

## 🙏 Credits

- **Twemoji** by Twitter - Emoji rendering
- **Node.js** - Runtime environment
- **OBS Studio** - Streaming software

---

## 📚 Additional Documentation

- [Architecture Overview](docs/ARCHITECTURE.md) - System design and code structure
- [OBS Setup Guide](docs/OBS_SETUP.md) - How to add overlay to OBS Studio

---

**Need Help?** Open an issue or check the [documentation](docs/)!

**Made with ❤️ for streamers**

