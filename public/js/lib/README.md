# Platform Client Libraries

This directory contains client libraries for connecting to streaming platforms.

## Files

### youtube.js (433 lines)
**Purpose:** YouTube Live Chat API client

**Features:**
- Connects to YouTube Live Chat API
- Polls for new chat messages
- Parses YouTube chat data (messages, superchats, badges)
- Handles author avatars and metadata
- Simulation mode for testing without API key
- API quota management

**Usage:**
```javascript
const client = new YouTubeChatClient(videoId);
client.setApiKey(apiKey);
client.connect();
```

**Note:** This file should be refactored into smaller modules:
- YouTubeClient (connection logic)
- YouTubeParser (message parsing)
- YouTubeAuth (API key management)

---

### twitch.js (246 lines)
**Purpose:** Twitch IRC chat client

**Features:**
- Connects to Twitch IRC (tmi.twitch.tv)
- Listens for chat messages via WebSocket
- Parses Twitch IRC tags (badges, emotes, color)
- Handles anonymous read-only access
- Supports authenticated access

**Usage:**
```javascript
const client = new TwitchChatClient(channelName);
client.connect();
```

**Note:** This file should be refactored into smaller modules:
- TwitchClient (IRC connection)
- TwitchParser (IRC message parsing)

---

## Architecture

These libraries are loaded by the overlay (`index.html`) and instantiated
by the main overlay script (`overlay.js`) when users connect to platforms.

**Flow:**
```
Control Panel → Server → Overlay
                  ↓
          overlay.js receives config
                  ↓
     Instantiates YouTubeChatClient or TwitchChatClient
                  ↓
         Platform libraries connect
                  ↓
      Messages forwarded to overlay via messageQueue
```

## Future Refactoring

Both files are candidates for modularization:

### youtube.js → Multiple modules
- `lib/youtube/YouTubeClient.js` - Connection and polling
- `lib/youtube/YouTubeParser.js` - Message parsing
- `lib/youtube/YouTubeAuth.js` - API key management

### twitch.js → Multiple modules
- `lib/twitch/TwitchClient.js` - IRC connection
- `lib/twitch/TwitchParser.js` - IRC message parsing

This would make them easier to test, maintain, and extend.

