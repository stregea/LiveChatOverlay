# LiveChatOverlay - Code Architecture

## 📁 Project Structure

```
LiveChatOverlay/
├── config.js                           # Main configuration file
├── server.js                           # Express & WebSocket server entry point
│
├── public/                             # Frontend files (served statically)
│   ├── index.html                      # Overlay page (for OBS)
│   ├── control.html                    # Control panel page
│   │
│   ├── css/                            # Stylesheets
│   │   ├── overlay.css                 # Base overlay styles
│   │   └── control.css                 # Control panel styles
│   │
│   ├── themes/                         # Visual themes
│   │   ├── neon.css                    # Neon theme
│   │   ├── cozy.css                    # Cozy theme
│   │   └── custom.css                  # User custom theme
│   │
│   ├── sounds/                         # Sound effects
│   │   └── message.mp3                 # Message notification sound
│   │
│   └── js/                             # JavaScript modules
│       ├── control.js                  # Control panel entry point
│       ├── overlay.js                  # Overlay entry point
│       │
│       ├── lib/                        # Platform client libraries
│       │   ├── youtube.js              # YouTube chat client
│       │   └── twitch.js               # Twitch chat client
│       │
│       └── modules/                    # Feature modules
│           ├── controlWebSocket.js     # WebSocket for control panel
│           ├── overlayWebSocket.js     # WebSocket for overlay
│           ├── configManager.js        # Configuration state management
│           ├── messageQueue.js         # Message display queue
│           │
│           ├── platforms/              # Platform connection modules
│           │   ├── platformManager.js  # Main platform coordinator
│           │   ├── youtubeConnection.js # YouTube connection logic
│           │   └── twitchConnection.js  # Twitch connection logic
│           │
│           ├── ui/                     # Control panel UI modules
│           │   ├── uiManager.js        # Main UI facade
│           │   ├── configLoader.js     # Config → UI loader
│           │   └── eventHandlers.js    # UI event listeners
│           │
│           └── renderer/               # Message rendering modules
│               ├── messageRenderer.js  # Main renderer facade
│               ├── avatarRenderer.js   # Avatar & platform icon rendering
│               └── contentRenderer.js  # Message content rendering
│
├── src/                                # Backend server code
│   ├── cache/                          # Caching system
│   │   └── LiveStreamCache.js          # Live stream detection cache
│   │
│   ├── routes/                         # Express API routes
│   │   ├── youtube.js                  # YouTube API endpoints
│   │   ├── twitch.js                   # Twitch API endpoints
│   │   └── system.js                   # System/health endpoints
│   │
│   └── websocket/                      # WebSocket handlers
│       ├── clientManager.js            # WebSocket client management
│       ├── configManager.js            # Server-side config management
│       └── messageHandlers.js          # WebSocket message routing
│
└── docs/                               # Documentation
    ├── ARCHITECTURE.md                 # This file
    └── OBS_SETUP.md                    # OBS setup guide
```

## 🏗️ Architecture Overview

### Design Patterns

1. **Facade Pattern**
   - `platformManager.js` - Coordinates platform connections
   - `uiManager.js` - Coordinates UI modules
   - `messageRenderer.js` - Coordinates message rendering

2. **Modular Architecture**
   - Small, focused modules with single responsibilities
   - Clear separation between YouTube and Twitch functionality
   - Reusable components

3. **Event-Driven Communication**
   - WebSocket for real-time server ↔ client communication
   - Server broadcasts config changes to all clients
   - Platform clients push messages to overlay via WebSocket

## 📡 Data Flow

### Control Panel → Overlay

```
User Interaction (control.html)
    ↓
UI Event Handler (eventHandlers.js)
    ↓
Control WebSocket (controlWebSocket.js)
    ↓
Server WebSocket (messageHandlers.js)
    ↓
Broadcast to All Clients (clientManager.js)
    ↓
Overlay WebSocket (overlayWebSocket.js)
    ↓
Config Manager (configManager.js)
    ↓
Apply Visual Changes
```

### Platform → Overlay

```
YouTube/Twitch Chat Message
    ↓
Platform Client (youtube.js / twitch.js)
    ↓
Process & Format Message
    ↓
Send via WebSocket to Server
    ↓
Server Broadcast (messageHandlers.js)
    ↓
Overlay Receives Message
    ↓
Message Renderer (messageRenderer.js)
    ↓
Message Queue (messageQueue.js)
    ↓
Display with Animation
```

## 🔌 Module Responsibilities

### Frontend Modules

#### **Control Panel** (`public/js/control.js`)
- Initializes control panel application
- Provides global functions for HTML onclick handlers
- Coordinates all control panel modules

#### **Platform Managers** (`public/js/modules/platforms/`)

**platformManager.js**
- Central coordinator for all platform connections
- Provides unified API for connection management
- Supports multistream (YouTube + Twitch simultaneously)

**youtubeConnection.js**
- YouTube-specific connection logic
- Video ID validation
- Auto-detection of live streams
- Quota-aware error handling

**twitchConnection.js**
- Twitch-specific connection logic
- Channel name validation
- Connection status management

#### **UI Modules** (`public/js/modules/ui/`)

**uiManager.js**
- Main facade for all UI functionality
- Maintains backward compatibility

**configLoader.js**
- Loads server config into UI form elements
- Updates connection status displays
- Manages multistream indicators

**eventHandlers.js**
- Sets up all event listeners for UI controls
- Handles form submissions and button clicks
- Provides visual feedback (button success states)

#### **Renderer Modules** (`public/js/modules/renderer/`)

**messageRenderer.js**
- Creates complete message DOM elements
- Applies special styling (superchat, moderator, blur)
- Main entry point for message rendering

**avatarRenderer.js**
- Renders user avatars
- Generates fallback SVG avatars
- Adds platform icon overlays

**contentRenderer.js**
- Renders message headers (username, badges)
- Processes message text (URLs, XSS protection)
- Handles emoji parsing with Twemoji

#### **Overlay** (`public/js/overlay.js`)
- Main entry point for overlay application
- Manages platform client connections
- Routes messages to renderer and queue
- Handles message deduplication

#### **Platform Clients** (`public/js/lib/`)

**youtube.js**
- Connects to YouTube Live Chat API
- Polls for new messages
- Handles rate limiting and quota errors
- Simulation mode for testing without API key

**twitch.js**
- Connects to Twitch IRC via WebSocket
- Parses IRC messages and Twitch tags
- Extracts badges, emotes, and user data
- Handles reconnection logic

### Backend Modules

#### **Server** (`server.js`)
- Express web server
- WebSocket server
- Route registration
- Graceful shutdown handling

#### **API Routes** (`src/routes/`)

**youtube.js**
- `/api/youtube/channel/:channelId/live` - Auto-detect live stream
- Caches results to preserve API quota

**twitch.js**
- Twitch-related endpoints (if needed)

**system.js**
- `/health` - Health check endpoint
- System status information

#### **WebSocket Handlers** (`src/websocket/`)

**clientManager.js**
- Tracks connected WebSocket clients
- Broadcasts messages to all/specific clients
- Handles disconnections

**configManager.js**
- Manages server-side configuration state
- Merges config updates
- Provides config to clients

**messageHandlers.js**
- Routes incoming WebSocket messages
- Delegates to appropriate handlers
- Broadcasts chat messages

#### **Cache** (`src/cache/`)

**LiveStreamCache.js**
- Time-based cache for live stream detection
- Reduces YouTube API quota usage
- Configurable TTL (default: 5 minutes)

## 🔄 Configuration Flow

1. **config.js** - Source of truth for all configuration
2. **Server** - Loads config on startup
3. **Control Panel** - Receives config via WebSocket
4. **User Changes** - Updates sent to server
5. **Server Broadcast** - All clients receive updates
6. **Overlay** - Applies visual changes instantly

## 🎨 Styling System

### Base Styles
- `overlay.css` - Core message bubble styles

### Themes
- `neon.css` - Vibrant neon colors
- `cozy.css` - Warm, comfortable colors
- `custom.css` - User-defined styles

### Dynamic Styling
- Background color/opacity
- Border radius
- Blur effects
- Avatar shapes (circle/square)

## 🔊 Sound System

- Preloaded audio element
- Volume control from config
- Optional per-message sound
- Fallback to silent mode if audio fails

## 🌐 WebSocket Protocol

### Message Types

**Server → Client**
- `config` - Configuration updates
- `chat-message` - New chat message
- `test-sound` - Play sound effect

**Client → Server**
- `config` - Configuration changes
- `connect` - Platform connection request
- `disconnect` - Platform disconnection request
- `chat-message` - Test message from control panel

## 🔐 Security Considerations

1. **XSS Protection**
   - Message text is HTML-escaped in `contentRenderer.js`
   - URLs converted to safe links with `rel="noopener noreferrer"`

2. **Input Validation**
   - Video IDs and channel names validated before connection
   - Configuration values sanitized

3. **API Keys**
   - Stored server-side in `config.js` (not exposed to frontend)
   - Never sent to clients

## 🚀 Performance Optimizations

1. **Message Deduplication**
   - Prevents duplicate messages when multiple overlay tabs open
   - Limited memory cache (last 100 message IDs)

2. **Lazy Loading**
   - Avatar images load on demand
   - Fallback SVG generated only when needed

3. **Polling Optimization**
   - YouTube: Uses API-suggested polling intervals
   - Twitch: Real-time IRC (no polling needed)

4. **Rate Limit Handling**
   - Exponential backoff for rate limits
   - Automatic fallback to simulation mode

## 📊 Message Queue System

- FIFO queue with configurable max messages
- Automatic removal of old messages
- Smooth slide-up animations
- Fade-out when leaving view

## 🎯 Key Features

✅ **Multistream Support** - YouTube + Twitch simultaneously
✅ **Real-time Updates** - Instant config changes via WebSocket
✅ **Quota Management** - Caching for YouTube API
✅ **Simulation Mode** - Test without API keys
✅ **Theme System** - Multiple built-in themes + custom CSS
✅ **Emoji Support** - Twemoji for consistent rendering
✅ **Sound Effects** - Configurable notification sounds
✅ **Badge System** - Platform badges, moderator, verified
✅ **Superchat Highlighting** - Special styling for donations
✅ **Avatar Fallbacks** - Generated SVG avatars when needed

## 🧩 Adding New Features

### Adding a New Platform

1. Create client in `public/js/lib/newplatform.js`
2. Create connection module in `public/js/modules/platforms/newplatformConnection.js`
3. Update `platformManager.js` to include new platform
4. Add server routes in `src/routes/newplatform.js`
5. Update control panel HTML with new platform UI

### Adding a New Theme

1. Create `public/themes/mytheme.css`
2. Define CSS custom properties and overrides
3. Theme automatically available in control panel dropdown

### Adding a New Config Option

1. Add default value to `config.js`
2. Add form control to `control.html`
3. Add event listener in `eventHandlers.js`
4. Update `configLoader.js` to load value
5. Apply in overlay (CSS or JavaScript)

## 📝 Code Style Guidelines

- **Modules**: One responsibility per file
- **Functions**: Descriptive names, JSDoc comments
- **Comments**: Explain "why", not "what"
- **Console**: Emoji prefixes for log visibility
- **Errors**: Graceful handling with user feedback

## 🛠️ Development Workflow

1. Make changes to source files
2. Restart server if backend changes: `npm start`
3. Reload browser if frontend changes (Ctrl+R)
4. Test in both control panel and overlay
5. Check browser console for errors

## 📦 Dependencies

**Runtime**
- `express` - Web server
- `ws` - WebSocket server
- `node-fetch` - HTTP requests

**Frontend**
- Twemoji - Emoji rendering
- Native WebSocket API

## 🎓 Learning Resources

- [WebSocket API](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket)
- [YouTube Data API v3](https://developers.google.com/youtube/v3)
- [Twitch IRC](https://dev.twitch.tv/docs/irc)
- [OBS Browser Source](https://obsproject.com/wiki/Sources-Guide#browsersource)

