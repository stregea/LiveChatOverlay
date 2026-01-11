# Code Structure & Refactoring Guide

## 📋 Overview

This document describes the refactored code structure and how the various components work together.

## 🎯 Refactoring Goals Achieved

### ✅ Modularity
- **Before**: Monolithic 700+ line server.js file
- **After**: Modular structure with separated concerns

### ✅ Documentation
- **Before**: Minimal comments
- **After**: Comprehensive JSDoc comments on all modules and functions

### ✅ Maintainability
- **Before**: Large files difficult to navigate
- **After**: Small, focused modules with clear responsibilities

### ✅ Testability
- **Before**: Tightly coupled code
- **After**: Loosely coupled modules with clear interfaces

## 📦 Module Breakdown

### Server-Side Modules (src/)

#### 1. Cache System (`src/cache/`)

**LiveStreamCache.js** (120 lines)
```javascript
Purpose: Reduce YouTube API quota usage
Methods:
  - get(key): Retrieve cached value
  - set(key, data): Store value with timestamp
  - clear(): Remove all entries
  - getStats(): Cache metrics
  - delete(key): Remove specific entry
```

**Use Case**: When user clicks "Auto-detect", the system checks cache first before calling YouTube API.

---

#### 2. WebSocket System (`src/websocket/`)

**clientManager.js** (115 lines)
```javascript
Purpose: Manage WebSocket client connections
Functions:
  - addClient(client): Register new connection
  - removeClient(client): Unregister connection
  - broadcast(data): Send to all clients
  - sendToClient(client, data): Send to specific client
  - closeAllConnections(): Graceful shutdown
```

**Use Case**: When a chat message arrives, broadcast() sends it to all connected overlays.

---

**configManager.js** (160 lines)
```javascript
Purpose: Manage runtime configuration state
Functions:
  - getConfig(): Get current state
  - updateConfig(updates): Merge updates
  - connectPlatform(platform, data): Enable platform
  - disconnectPlatform(platform): Disable platform
  - getActiveConnections(): List active platforms
  - isPlatformConnected(platform): Check status
  - isMultistreamActive(): Check if 2+ platforms
```

**Use Case**: Control panel changes theme → updateConfig() → broadcast to all clients.

---

**messageHandlers.js** (145 lines)
```javascript
Purpose: Route incoming WebSocket messages
Functions:
  - handleMessage(ws, message): Main router
  - handleConfigUpdate(data): Process config changes
  - handleChatMessage(data): Process chat messages
  - handlePlatformConnect(data): Process connections
  - handlePlatformDisconnect(data): Process disconnections
  - handleTestSound(): Trigger sound test
```

**Use Case**: Client sends connection request → handleMessage() routes to handlePlatformConnect() → updates config → broadcasts to all clients.

---

#### 3. API Routes (`src/routes/`)

**youtube.js** (125 lines)
```javascript
Purpose: YouTube API endpoints
Routes:
  GET /api/youtube/channel/:channelId/live
    - Auto-detect current live stream
    - Uses cache to preserve quota
    
  GET /api/youtube/:videoId
    - Get video details
    - Fetch live streaming info
```

**Use Case**: Control panel clicks "Auto-detect" → HTTP request → checks cache → calls YouTube API if needed → returns video ID.

---

**twitch.js** (65 lines)
```javascript
Purpose: Twitch API endpoints
Routes:
  GET /api/twitch/:channel
    - Get channel/user information
    - Fetch user data from Helix API
```

---

**system.js** (110 lines)
```javascript
Purpose: System-level endpoints
Routes:
  GET /health
    - Server status and uptime
    - Client count
    - Active platform connections
    
  GET /api/config
    - Public configuration (no secrets)
    
  GET /api/debug/config
    - Full runtime configuration
    
  GET /api/cache/stats
    - Cache metrics and entries
    
  POST /api/cache/clear
    - Clear all cache entries
```

**Use Case**: Monitor server health or debug issues.

---

### Client-Side Modules (public/js/modules/)

#### 1. overlayWebSocket.js (105 lines)
```javascript
Purpose: WebSocket connection management for overlay
API:
  - connect(onMessage): Establish connection
  - send(data): Send message to server
  - isConnected(): Check connection state
  - disconnect(): Close connection

Features:
  - Automatic reconnection on disconnect
  - Protocol detection (ws/wss)
  - Error handling and logging
```

**Use Case**: Overlay loads → connect() → receives config → applies settings.

---

#### 2. configManager.js (140 lines)
```javascript
Purpose: Client-side configuration management
API:
  - getConfig(): Get current config
  - updateConfig(updates): Merge updates
  - applyConfig(): Apply all changes to DOM

Features:
  - Theme switching (CSS file changes)
  - Color updates (CSS custom properties)
  - Custom CSS injection
  - Hex to RGB conversion
```

**Use Case**: Server sends theme update → updateConfig() → applyConfig() → theme CSS file loads.

---

#### 3. messageRenderer.js (215 lines)
```javascript
Purpose: Create message DOM elements
API:
  - createMessageElement(message, config): Build complete message
  - getDefaultAvatar(platform, username): Generate fallback avatar

Features:
  - Avatar rendering with fallback
  - Badge display
  - Moderator highlighting
  - Superchat styling
  - Platform icons
  - Twemoji integration
  - URL linkification
```

**Use Case**: Chat message arrives → createMessageElement() → returns fully styled DOM node → added to container.

---

#### 4. messageQueue.js (120 lines)
```javascript
Purpose: Manage message display queue
API:
  - initialize(): Setup container reference
  - addMessage(element, config, sound): Add to queue
  - removeMessage(element): Remove with animation
  - playSound(volume): Play sound effect
  - clearAll(): Remove all messages
  - getCount(): Get queue size

Features:
  - Automatic old message removal
  - Fade-out animations
  - Sound effect playback
  - Queue size limits
```

**Use Case**: New message arrives → addMessage() → checks queue size → removes oldest if needed → plays sound.

---

## 🔄 Data Flow Examples

### Example 1: User Sends Chat Message on YouTube

```
1. YouTube Live Chat
   ↓
2. YouTubeChatClient.js (polls API)
   ↓
3. Sends WebSocket message to server
   ↓
4. server.js receives message
   ↓
5. messageHandlers.handleChatMessage()
   ↓
6. clientManager.broadcast() sends to all clients
   ↓
7. Overlay receives via overlayWebSocket
   ↓
8. messageRenderer.createMessageElement()
   ↓
9. messageQueue.addMessage()
   ↓
10. Message appears on screen with animation
```

### Example 2: User Changes Theme in Control Panel

```
1. Control panel: User selects "Cozy"
   ↓
2. control.js: sendConfig({ theme: 'cozy' })
   ↓
3. WebSocket → server.js
   ↓
4. messageHandlers.handleConfigUpdate()
   ↓
5. configManager.updateConfig()
   ↓
6. clientManager.broadcast() to all clients
   ↓
7. Overlay receives config update
   ↓
8. configManager.updateConfig()
   ↓
9. configManager.applyConfig()
   ↓
10. applyTheme() changes <link> href to cozy.css
```

### Example 3: Auto-Detect Live Stream

```
1. Control panel: User clicks "Auto-detect"
   ↓
2. control.js: autoDetectLiveStream()
   ↓
3. HTTP GET /api/youtube/channel/:channelId/live
   ↓
4. routes/youtube.js receives request
   ↓
5. Check LiveStreamCache.get(channelId)
   ↓
6. If cached: return immediately (saves quota!)
   ↓
7. If not cached: Call YouTube API
   ↓
8. LiveStreamCache.set(channelId, result)
   ↓
9. Return video ID to control panel
   ↓
10. Control panel auto-fills video ID field
```

## 🏗️ Design Patterns Used

### 1. Module Pattern
Each file exports a focused API, hiding internal implementation.

```javascript
// Private variables
let cache = new Map();

// Public API
module.exports = {
  get,
  set,
  clear
};
```

### 2. Observer Pattern
WebSocket system broadcasts changes to all observers (clients).

```javascript
// Notify all observers of config change
clientManager.broadcast({
  type: 'config',
  data: updatedConfig
});
```

### 3. Factory Pattern
MessageRenderer creates DOM elements based on message type.

```javascript
function createMessageElement(message, config) {
  const el = document.createElement('div');
  // Build element based on message properties
  return el;
}
```

### 4. Singleton Pattern
ClientManager maintains single source of truth for connections.

```javascript
const clients = new Set(); // Single set of all clients
```

## 📊 Code Metrics

### Before Refactoring
```
server.js:           707 lines
overlay.js:          390 lines
control.js:          416 lines
youtube.js:          433 lines
twitch.js:           246 lines

Total:              2,192 lines in 5 files
Avg file size:       438 lines
Documentation:       Minimal
```

### After Refactoring
```
server.js:           190 lines
src/ modules:        715 lines (8 files, avg 89 lines)
overlay.js:          195 lines
modules/:            580 lines (4 files, avg 145 lines)
control.js:          416 lines (not yet refactored)
youtube.js:          433 lines (not yet refactored)
twitch.js:           246 lines (not yet refactored)

Total:              2,775 lines (includes extensive documentation)
Server modules:      8 files, avg 89 lines
Client modules:      4 files, avg 145 lines
Documentation:       Comprehensive JSDoc throughout
```

## 🎓 Key Learnings

### 1. Separation of Concerns
Each module has ONE responsibility:
- Cache module only handles caching
- Client manager only handles connections
- Message handlers only route messages

### 2. Clear Interfaces
Each module exports a clear, documented API:
```javascript
module.exports = {
  addClient,      // What it does
  removeClient,   // What it does
  broadcast       // What it does
};
```

### 3. Error Handling
All modules include:
- Try-catch blocks for critical operations
- Logging for debugging
- Graceful fallbacks

### 4. Documentation
Every function includes:
- Purpose description
- Parameter types and descriptions
- Return value description
- Usage examples where helpful

## 🔮 Future Refactoring Opportunities

### High Priority
1. **control.js** (416 lines) → Split into modules:
   - controlWebSocket.js
   - uiManager.js
   - platformControls.js
   - testControls.js

2. **youtube.js** (433 lines) → Split into:
   - youtubeClient.js (connection logic)
   - youtubeParser.js (message parsing)
   - youtubeAuth.js (API key management)

3. **twitch.js** (246 lines) → Split into:
   - twitchClient.js (IRC connection)
   - twitchParser.js (message parsing)

### Medium Priority
4. Add unit tests for all modules
5. Add integration tests for WebSocket flow
6. Add E2E tests for full user journeys

### Low Priority
7. TypeScript migration for type safety
8. Build system for client-side modules (webpack/rollup)
9. Automated documentation generation

## 📚 Recommended Reading

For working with this codebase:

1. **WebSocket API**: Understanding real-time communication
2. **Express.js Routing**: HTTP endpoint design
3. **DOM Manipulation**: Client-side rendering
4. **Node.js Modules**: Module system and exports

## 🤝 Contributing Guidelines

When adding new features:

1. **Create focused modules** - One responsibility per file
2. **Add JSDoc comments** - Document all public functions
3. **Follow naming conventions** - camelCase functions, PascalCase classes
4. **Include error handling** - Try-catch and meaningful logs
5. **Update documentation** - Keep docs in sync with code
6. **Test thoroughly** - Manual testing at minimum

---

**Questions?** See [ARCHITECTURE.md](./ARCHITECTURE.md) for more details.

