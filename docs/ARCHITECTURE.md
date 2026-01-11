# Live Chat Overlay - Architecture Documentation

## 📐 Project Structure

```
LiveChatOverlay/
├── server.js                 # Main server entry point
├── config.js                 # Configuration file
├── package.json              # Dependencies
│
├── src/                      # Server-side modules
│   ├── cache/
│   │   └── LiveStreamCache.js       # YouTube API quota preservation
│   ├── websocket/
│   │   ├── clientManager.js         # WebSocket client lifecycle
│   │   ├── configManager.js         # Runtime configuration state
│   │   └── messageHandlers.js       # Message routing and handling
│   └── routes/
│       ├── youtube.js               # YouTube API endpoints
│       ├── twitch.js                # Twitch API endpoints
│       └── system.js                # System/health endpoints
│
└── public/                   # Client-side files
    ├── index.html           # Overlay page
    ├── control.html         # Control panel page
    ├── css/
    │   ├── overlay.css      # Overlay base styles
    │   └── control.css      # Control panel styles
    ├── js/
    │   ├── overlay.js       # Overlay main script
    │   ├── control.js       # Control panel script
    │   ├── youtube.js       # YouTube client
    │   ├── twitch.js        # Twitch client
    │   └── modules/         # Modular overlay components
    │       ├── overlayWebSocket.js  # WebSocket management
    │       ├── configManager.js     # Config state & application
    │       ├── messageRenderer.js   # Message DOM creation
    │       └── messageQueue.js      # Display queue management
    └── themes/
        ├── neon.css         # Neon theme
        ├── cozy.css         # Cozy theme
        └── custom.css       # Custom theme template
```

## 🏗️ System Architecture

### Overview

The Live Chat Overlay system uses a client-server architecture with real-time WebSocket communication:

```
┌─────────────────────────────────────────────────────────────┐
│                     OBS Studio                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │           Browser Source (Overlay)                   │   │
│  │  http://localhost:3000                               │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                          │
                    WebSocket
                          │
┌─────────────────────────────────────────────────────────────┐
│                    Node.js Server                           │
│                   (localhost:3000)                          │
│                                                             │
│  ┌──────────────────┐  ┌──────────────────┐               │
│  │  HTTP Server     │  │  WebSocket       │               │
│  │  (Express)       │  │  Server          │               │
│  └──────────────────┘  └──────────────────┘               │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐ │
│  │  Cache System (LiveStreamCache)                      │ │
│  │  • 5 minute TTL                                       │ │
│  │  • Preserves YouTube API quota                       │ │
│  └──────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                          │
                    WebSocket
                          │
┌─────────────────────────────────────────────────────────────┐
│              Control Panel (Browser)                        │
│           http://localhost:3000/control                     │
│                                                             │
│  • Configure connections                                    │
│  • Adjust display settings                                  │
│  • Send test messages                                       │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow

#### 1. Configuration Updates
```
Control Panel → WebSocket → Server → ConfigManager → Broadcast → All Clients
```

#### 2. Chat Messages
```
YouTube/Twitch → Client SDK → WebSocket → Server → Broadcast → Overlay → DOM
```

#### 3. Live Stream Detection
```
Control Panel → HTTP API → YouTube API → Cache → Response → Control Panel
```

## 🔧 Core Components

### Server-Side

#### LiveStreamCache
- **Purpose**: Reduce YouTube API quota usage
- **TTL**: 5 minutes (configurable)
- **Methods**:
  - `get(key)`: Retrieve cached value
  - `set(key, data)`: Store value
  - `clear()`: Clear all entries
  - `getStats()`: Get cache statistics

#### ClientManager
- **Purpose**: Manage WebSocket client connections
- **Responsibilities**:
  - Track connected clients
  - Broadcast messages to all clients
  - Handle client lifecycle
  - Graceful shutdown

#### ConfigManager
- **Purpose**: Manage runtime configuration state
- **Features**:
  - Platform connection state (multistream support)
  - Display settings
  - Theme configuration
  - Custom CSS

#### MessageHandlers
- **Purpose**: Route and process incoming WebSocket messages
- **Message Types**:
  - `config`: Configuration updates
  - `chat-message`: Chat messages to display
  - `connect`: Platform connection requests
  - `disconnect`: Platform disconnection
  - `test-sound`: Test audio playback

### Client-Side (Overlay)

#### OverlayWebSocket Module
- **Purpose**: WebSocket connection management
- **Features**:
  - Automatic reconnection
  - Message parsing
  - Connection state tracking

#### ConfigManager Module
- **Purpose**: Client-side configuration management
- **Features**:
  - Theme switching
  - Dynamic CSS updates
  - Custom CSS injection
  - Color management

#### MessageRenderer Module
- **Purpose**: Create message DOM elements
- **Features**:
  - Avatar rendering with fallbacks
  - Badge display
  - Moderator highlighting
  - Superchat styling
  - Platform icons
  - Twemoji integration

#### MessageQueue Module
- **Purpose**: Manage displayed messages
- **Features**:
  - Auto-removal of old messages
  - Fade-out animations
  - Sound effects
  - Queue size management

## 🌊 Message Protocol

### WebSocket Messages

#### Configuration Message
```javascript
{
  type: 'config',
  data: {
    platforms: {
      youtube: { enabled: boolean, videoId: string },
      twitch: { enabled: boolean, channelId: string }
    },
    theme: string,
    maxMessages: number,
    soundEnabled: boolean,
    volume: number,
    // ... other settings
  }
}
```

#### Chat Message
```javascript
{
  type: 'chat-message',
  data: {
    username: string,
    text: string,
    avatar: string,
    platform: 'youtube' | 'twitch',
    usernameColor: string,
    isModerator: boolean,
    isSuperchat: boolean,
    amount: string,
    badges: string[],
    timestamp: number
  }
}
```

#### Platform Connection
```javascript
{
  type: 'connect',
  data: {
    platform: 'youtube' | 'twitch',
    videoId: string,      // for YouTube
    channelId: string     // for Twitch
  }
}
```

## 🎨 Theming System

### Theme Structure
Themes are CSS files that override base styles:

1. **Base styles** (`overlay.css`): Core layout and structure
2. **Theme styles** (`neon.css`, `cozy.css`): Color schemes and effects
3. **Custom CSS**: User-defined overrides (runtime injection)

### CSS Custom Properties
```css
:root {
  --message-bg: rgba(0, 0, 0, 0.55);    /* Dynamic background */
  --border-radius: 18px;                 /* Dynamic border radius */
}
```

### Theme Application Order
1. overlay.css (base)
2. theme CSS file
3. Custom CSS (injected via `<style>` tag)

## 🔌 Multistream Support

The system supports simultaneous connections to multiple platforms:

### Implementation
- Each platform has independent connection state
- ConfigManager tracks all active connections
- Messages are tagged with platform identifier
- Platform icons distinguish message sources

### Connection Management
```javascript
// Both can be active simultaneously
platforms: {
  youtube: { enabled: true, videoId: 'abc123' },
  twitch: { enabled: true, channelId: 'streamer' }
}
```

## 💾 Caching System

### Purpose
YouTube API has daily quota limits. Caching reduces API calls for repeated lookups.

### Strategy
- Cache key: YouTube channel ID
- Cache value: Live stream info (videoId, title, etc.)
- TTL: 5 minutes
- Automatic expiration

### API Quota Savings
- Without cache: 1 quota unit per autodetect
- With cache: 1 quota unit per 5 minutes (max)

## 🔐 Security Considerations

### API Keys
- Never exposed to client (stored in server-side config.js)
- Never included in client responses
- Only used in server-to-API requests

### WebSocket
- No authentication (localhost only)
- For production: Add authentication layer
- For production: Use WSS (secure WebSocket)

### Input Sanitization
- Message text: Rendered as text (not HTML)
- URLs: Converted to safe links
- Emojis: Processed by Twemoji library

## 📊 Performance Optimizations

### Message Queue
- Limited number of visible messages (configurable)
- Old messages auto-removed
- Smooth fade-out animations

### DOM Updates
- Batch style updates using CSS custom properties
- Minimal reflows
- Event delegation where possible

### WebSocket
- JSON message parsing with error handling
- Automatic reconnection with backoff
- Connection state tracking

## 🚀 Extension Points

### Adding New Platforms
1. Create client class (e.g., `KickChatClient`)
2. Add platform config in `configManager.js`
3. Add connection handler in overlay.js
4. Add platform-specific styling

### Custom Message Types
1. Define message structure
2. Add handler in `messageHandlers.js`
3. Update `MessageRenderer` for display
4. Add corresponding control panel UI

### New Themes
1. Create CSS file in `/public/themes/`
2. Follow existing theme structure
3. Test with all message types

## 🐛 Debugging

### Server-Side Logs
```bash
npm start
```
Look for:
- `✅ Client connected`
- `📡 Broadcast to X clients`
- `🔌 Platform connected/disconnected`
- `❌ Error messages`

### Client-Side Console
Open browser DevTools on overlay or control panel:
- WebSocket connection status
- Configuration updates
- Message rendering
- Platform client events

### Health Check
```
GET http://localhost:3000/health
```
Returns server status and configuration.

### Cache Statistics
```
GET http://localhost:3000/api/cache/stats
```
Returns cache metrics and entries.

## 📝 Code Style

### Comments
- **Module headers**: JSDoc format with description
- **Functions**: JSDoc with @param and @returns
- **Complex logic**: Inline comments explaining why
- **TODOs**: Use `// TODO:` format

### Naming Conventions
- **Functions**: camelCase, verb-first (`handleMessage`)
- **Variables**: camelCase, descriptive (`messageQueue`)
- **Constants**: UPPER_SNAKE_CASE (`MAX_MESSAGES`)
- **Classes**: PascalCase (`LiveStreamCache`)

### File Organization
- **Imports**: Top of file
- **Constants**: After imports
- **Main logic**: Middle
- **Exports**: Bottom
- **Init code**: Very bottom

## 🔮 Future Enhancements

### Planned Features
- [ ] Message history/replay
- [ ] Advanced filtering (banned words, etc.)
- [ ] More built-in themes
- [ ] Subscriber/donation animations
- [ ] Chat statistics dashboard
- [ ] Multiple overlay layouts

### Scalability
- [ ] Redis for distributed caching
- [ ] Multiple server instances
- [ ] Database for persistent settings
- [ ] User accounts and authentication

## 📚 Related Documentation

- [QUICKSTART.md](./QUICKSTART.md) - Getting started guide
- [OBS_SETUP.md](./OBS_SETUP.md) - OBS integration guide
- [MULTISTREAM.md](./MULTISTREAM.md) - Multistream usage
- [CACHING_SYSTEM.md](./CACHING_SYSTEM.md) - Cache details
- [AUTO_DETECT.md](./AUTO_DETECT.md) - Auto-detection feature

