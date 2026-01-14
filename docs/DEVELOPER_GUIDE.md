# Developer Quick Reference Guide

## 🚀 Getting Started

### Prerequisites
- Node.js 14+ installed
- YouTube Data API v3 key (optional, for real YouTube chat)
- Twitch account (optional, for authenticated Twitch chat)

### Installation
```bash
npm install
cp config.example.js config.js
# Edit config.js with your API keys
npm start
```

### URLs
- **Overlay:** http://localhost:3000
- **Control Panel:** http://localhost:3000/control
- **Health Check:** http://localhost:3000/health

## 📂 File Location Reference

### Need to modify YouTube functionality?
- **Client-side:** `public/js/lib/youtube.js`
- **Connection logic:** `public/js/modules/platforms/youtubeConnection.js`
- **Server API:** `src/routes/youtube.js`

### Need to modify Twitch functionality?
- **Client-side:** `public/js/lib/twitch.js`
- **Connection logic:** `public/js/modules/platforms/twitchConnection.js`
- **Server API:** `src/routes/twitch.js`

### Need to modify UI controls?
- **Event handlers:** `public/js/modules/ui/eventHandlers.js`
- **Config loading:** `public/js/modules/ui/configLoader.js`
- **HTML:** `public/control.html`

### Need to modify message display?
- **Avatar rendering:** `public/js/modules/renderer/avatarRenderer.js`
- **Content rendering:** `public/js/modules/renderer/contentRenderer.js`
- **Message queue:** `public/js/modules/messageQueue.js`

### Need to modify themes?
- **CSS files:** `public/themes/*.css`
- **Base styles:** `public/css/overlay.css`

### Need to modify configuration?
- **Config file:** `config.js`
- **Server config manager:** `src/websocket/configManager.js`
- **Client config manager:** `public/js/modules/configManager.js`

### Need to modify WebSocket communication?
- **Control panel WS:** `public/js/modules/controlWebSocket.js`
- **Overlay WS:** `public/js/modules/overlayWebSocket.js`
- **Server handlers:** `src/websocket/messageHandlers.js`

## 🔧 Common Tasks

### Adding a New Theme
1. Create `public/themes/mytheme.css`
2. Define CSS variables (see existing themes for examples)
3. Add option to control panel dropdown (if not auto-detected)

### Adding a New Config Option
1. Add default to `config.js`
2. Add UI control to `public/control.html`
3. Add event listener in `public/js/modules/ui/eventHandlers.js`
4. Handle in overlay (CSS or JavaScript as needed)

### Adding a Test Button
1. Add button HTML to `public/control.html`
2. Add onclick function to `public/js/control.js`
3. Implement handler in `public/js/modules/ui/eventHandlers.js`

### Debugging Chat Messages

**YouTube:**
```javascript
// In youtube.js, look for:
console.log('📦 Raw YouTube message:', message);
console.log('✅ Avatar URL:', authorDetails.profileImageUrl);
```

**Twitch:**
```javascript
// In twitch.js, look for:
console.log('💬 Twitch message:', chatMessage);
console.log('📥 Raw IRC:', ircMessage);
```

### Testing Without API Keys
The system automatically falls back to simulation mode:
- YouTube: Generates fake messages
- Twitch: Still works (anonymous read-only access)

## 🐛 Common Issues & Solutions

### Issue: Messages not displaying

**Check:**
1. Open browser console (F12)
2. Look for WebSocket connection: "✅ Connected to server"
3. Verify platform connected: "🎥 Connected to YouTube" or "🟣 Connected to Twitch"
4. Check for message logs: "💬 [platform] username: message"

**Common causes:**
- WebSocket not connected
- Platform not connected
- Message queue at max capacity
- CSS hiding messages

### Issue: Duplicate messages

**Cause:** Multiple overlay browser tabs open

**Solution:** Message deduplication in `overlay.js` - check `isDuplicateMessage()`

### Issue: YouTube quota exceeded

**Symptoms:** Error message about quota in control panel

**Solutions:**
1. Use cached detection (shows "from cache")
2. Enter Video ID manually
3. Wait for quota reset (midnight Pacific Time)
4. Use simulation mode for testing

### Issue: Avatar not displaying

**Check:**
1. Browser console for: "⚠️ Failed to load avatar"
2. Network tab for failed image requests
3. Verify URL in message data

**Fallback:** System generates SVG avatar with username initial

### Issue: Twitch emotes not showing

**Expected:** Twitch IRC doesn't provide emote images, only positions

**To fix:** Would need to integrate Twitch Helix API for emote URLs

## 📊 Module Dependency Graph

```
control.js
  ├── controlWebSocket.js
  ├── platforms/
  │   ├── platformManager.js
  │   ├── youtubeConnection.js
  │   └── twitchConnection.js
  └── ui/
      ├── uiManager.js
      ├── configLoader.js
      └── eventHandlers.js

overlay.js
  ├── overlayWebSocket.js
  ├── configManager.js
  ├── messageQueue.js
  ├── renderer/
  │   ├── messageRenderer.js
  │   ├── avatarRenderer.js
  │   └── contentRenderer.js
  └── lib/
      ├── youtube.js
      └── twitch.js
```

## 🎯 Performance Tips

### Reduce YouTube API Quota Usage
- Use auto-detect sparingly (uses ~100 quota per call)
- Manually enter Video ID when possible
- Cache persists for 5 minutes
- Daily quota: 10,000 units (free tier)

### Optimize Message Display
- Reduce max messages (default: 6)
- Adjust animation speed
- Disable sound if not needed
- Close unused overlay tabs

### Debug Performance
```javascript
// In browser console:
console.time('render');
MessageRenderer.createMessageElement(message, config);
console.timeEnd('render');
```

## 🧪 Testing Checklist

### Before Committing Changes

- [ ] Server starts without errors: `npm start`
- [ ] Control panel loads: http://localhost:3000/control
- [ ] Overlay loads: http://localhost:3000
- [ ] WebSocket connects (check console)
- [ ] Test message displays correctly
- [ ] Theme switching works
- [ ] Custom CSS applies
- [ ] Sound plays (if enabled)
- [ ] YouTube connection works (with valid Video ID)
- [ ] Twitch connection works (with valid channel)
- [ ] No console errors in browser
- [ ] No 404 errors in network tab

### Manual Test Script

1. Open control panel
2. Send test message → Verify appears in overlay
3. Send superchat → Verify gold styling
4. Send moderator message → Verify green styling
5. Click "Test Sound" → Verify sound plays
6. Change theme → Verify overlay updates
7. Adjust max messages slider → Verify old messages removed
8. Toggle show avatar → Verify avatars hide/show
9. Connect to YouTube/Twitch → Verify real messages appear
10. Disconnect → Verify messages stop

## 📝 Code Style

### File Organization
```javascript
/**
 * Module Description
 * 
 * Detailed explanation of what this module does.
 * 
 * @module path/to/module
 */

// Imports (if any)

// Constants
const CONSTANT_NAME = 'value';

// Main functionality
function publicFunction() {
  // Implementation
}

// Helper functions
function privateHelper() {
  // Implementation
}

// Export public API
window.ModuleName = {
  publicFunction
};
```

### Naming Conventions
- **Functions:** `camelCase` - descriptive verbs (e.g., `connectYouTube()`)
- **Variables:** `camelCase` - descriptive nouns (e.g., `messageElement`)
- **Constants:** `UPPER_SNAKE_CASE` - (e.g., `MAX_MESSAGES`)
- **Classes:** `PascalCase` - (e.g., `YouTubeChatClient`)
- **Files:** `camelCase.js` - match module name

### Comment Style
```javascript
/**
 * Function description - what it does
 * 
 * Additional context or important notes.
 * 
 * @param {Type} paramName - Parameter description
 * @returns {Type} Return value description
 */
function exampleFunction(paramName) {
  // Implementation comment explaining why
  const result = doSomething();
  
  return result;
}
```

### Console Logging
Use emoji prefixes for visibility:
- `✅` - Success
- `❌` - Error
- `⚠️` - Warning
- `🔌` - Connection
- `💬` - Message
- `🎨` - Styling/theme
- `🔊` - Sound
- `📦` - Data
- `🔄` - Update/refresh

## 🔗 Useful Links

### Documentation
- [Full Architecture Guide](./ARCHITECTURE.md)
- [Refactoring Summary](./REFACTORING.md)
- [OBS Setup Guide](./OBS_SETUP.md)

### External APIs
- [YouTube Data API v3](https://developers.google.com/youtube/v3)
- [Twitch IRC Documentation](https://dev.twitch.tv/docs/irc)
- [Twitch API (Helix)](https://dev.twitch.tv/docs/api/)
- [Twemoji](https://github.com/twitter/twemoji)

### Tools
- [Google Cloud Console](https://console.cloud.google.com/)
- [Twitch Developer Console](https://dev.twitch.tv/console)
- [OBS Studio](https://obsproject.com/)

## 💡 Pro Tips

1. **Use browser dev tools:** Essential for debugging WebSocket messages
2. **Test in OBS:** Behavior can differ in browser vs OBS browser source
3. **Keep config.js private:** Never commit API keys to git
4. **Monitor quota usage:** YouTube API has daily limits
5. **Cache wisely:** Balance freshness vs quota usage
6. **Log liberally:** Console logs are your friend during development
7. **Test multistream:** Ensure YouTube + Twitch work simultaneously
8. **Check mobile:** Control panel should work on phone/tablet
9. **Validate input:** Always sanitize user input for XSS
10. **Document changes:** Update ARCHITECTURE.md when adding features

