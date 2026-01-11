# Multistream Support Guide

## Overview

The Live Chat Overlay now supports **simultaneous connections to multiple platforms**! You can display YouTube and Twitch chat messages together in a single unified overlay.

## Features

✅ **Simultaneous Connections** - Connect to YouTube and Twitch at the same time  
✅ **Platform Icons** - Each message shows which platform it came from  
✅ **Independent Control** - Connect/disconnect each platform separately  
✅ **Unified Display** - All messages appear in a single chronological feed  
✅ **Easy Management** - Simple control panel with separate buttons for each platform

## How to Use

### 1. Start the Server

```bash
npm start
```

### 2. Open Control Panel

Navigate to: `http://localhost:3000/control`

### 3. Connect to Multiple Platforms

The control panel now has **two separate connection sections**:

#### YouTube Section 🎥
1. Enter your YouTube Video ID
2. Click **"Connect YouTube"**
3. Status will show "✅ Connected"

#### Twitch Section 🟣
1. Enter your Twitch channel name
2. Click **"Connect Twitch"**
3. Status will show "✅ Connected"

### 4. Multistream Active!

When both platforms are connected, you'll see:
- **📡 Multistream Active** indicator in the control panel
- Messages from both YouTube and Twitch in your overlay
- Platform icons on each message showing the source

## Control Panel Features

### Independent Connection Management

Each platform has its own:
- Input field (Video ID / Channel name)
- Connect button
- Disconnect button
- Status indicator

### Connect One or Both

You can choose to:
- ✅ Connect only YouTube
- ✅ Connect only Twitch
- ✅ **Connect both simultaneously** (multistream)

### Disconnect Options

- Disconnect YouTube without affecting Twitch
- Disconnect Twitch without affecting YouTube
- Disconnect both at once

## Configuration

Your existing `config.js` works with multistream:

```javascript
const config = {
  youtube: {
    apiKey: 'YOUR_API_KEY',
    channelId: 'YOUR_CHANNEL_ID',
    pollingInterval: 7000
  },
  
  twitch: {
    defaultChannel: 'your_channel',
    botUsername: 'justinfan12345'
  },
  
  overlay: {
    showPlatformIcon: true,  // Shows YouTube/Twitch icons
    maxMessages: 6,
    // ... other settings
  }
};
```

## Server Configuration Structure

The server now tracks platform connections separately:

```javascript
{
  platforms: {
    youtube: {
      enabled: true,
      videoId: 'abc123'
    },
    twitch: {
      enabled: true,
      channelId: 'channelname'
    }
  }
}
```

## Message Display

### Platform Icons

Each message includes a platform identifier:
- 🎥 YouTube messages show YouTube icon
- 🟣 Twitch messages show Twitch icon

### Message Order

Messages appear in **chronological order** regardless of platform:
```
[🎥 YouTubeUser]: Hello from YouTube!
[🟣 TwitchUser]: Hi from Twitch!
[🎥 AnotherYTUser]: Nice stream!
```

## OBS Setup (Same as Before)

No changes needed for OBS setup:

1. **Add Browser Source**
2. **URL:** `http://localhost:3000`
3. **Width:** 400, **Height:** 800
4. Messages from both platforms will appear automatically

## API Endpoints

### Health Check

```bash
curl http://localhost:3000/health
```

Returns multistream status:
```json
{
  "status": "ok",
  "config": {
    "platforms": {
      "youtube": { "enabled": true, "videoId": "abc123" },
      "twitch": { "enabled": true, "channelId": "channel" }
    },
    "activeConnections": ["YouTube", "Twitch"],
    "multistream": true
  }
}
```

## Technical Details

### Server-Side

- `currentConfig.platforms` object tracks each platform separately
- `handlePlatformConnect()` enables platforms without affecting others
- `handlePlatformDisconnect()` can disconnect specific platform or all
- `getActiveConnections()` returns list of active platforms

### Client-Side

- `overlay.js` maintains separate `youtubeClient` and `twitchClient`
- Both clients can be active simultaneously
- Messages are merged and displayed in chronological order
- Platform icons are automatically added to each message

## Troubleshooting

### Only One Platform Showing

**Problem:** Messages only appear from one platform

**Solutions:**
1. Check both platforms show "✅ Connected" in control panel
2. Verify both Video ID and Channel name are correct
3. Check browser console (F12) for connection errors
4. Refresh the overlay page

### Rate Limiting with Multistream

**Problem:** YouTube 429 errors when using multistream

**Solutions:**
1. Increase `pollingInterval` in config: `10000` (10 seconds)
2. YouTube has stricter rate limits - consider using simulation mode for testing
3. Twitch IRC doesn't have rate limits

### Messages Not Merged

**Problem:** Only seeing messages from one platform at a time

**Solutions:**
1. Ensure both clients are connected (check console)
2. Refresh browser with Ctrl+Shift+R
3. Restart server and reconnect both platforms

## Use Cases

### 1. Multi-Platform Streaming

Stream to YouTube and Twitch simultaneously and see all chat in one place.

### 2. Testing

Connect to YouTube live chat and Twitch IRC to test overlay appearance with different platforms.

### 3. Restreaming

Use with restream.io or other services to aggregate chat from multiple platforms.

### 4. Single Platform

Still works perfectly with just one platform - the old functionality is preserved.

## Benefits

✅ **Unified Experience** - One overlay for all platforms  
✅ **Better Engagement** - Respond to all viewers regardless of platform  
✅ **Easy Setup** - Simple control panel interface  
✅ **Flexible** - Use one platform or many  
✅ **Professional** - Clean, organized multi-platform chat display

## Example Workflow

```
1. Start server: npm start
2. Open control panel: http://localhost:3000/control
3. Enter YouTube Video ID → Click "Connect YouTube"
4. Enter Twitch channel → Click "Connect Twitch"
5. See "📡 Multistream Active" indicator
6. View overlay in OBS: http://localhost:3000
7. Chat messages from both platforms appear together!
```

## Migration from Old Version

If you were using the old single-platform version:

**Before:**
- Select platform from dropdown
- Enter ID
- Click connect

**Now:**
- No dropdown needed
- Enter both IDs in their respective fields
- Click connect for each platform you want
- Both can be active at once!

Your existing config and OBS setup don't need any changes.

## Future Enhancements

Possible future additions:
- Discord integration
- Facebook Live support
- Kick.com support
- Platform-specific message styling
- Per-platform message filtering

---

**Happy multistreaming! 🎉**

