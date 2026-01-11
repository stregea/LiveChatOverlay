# Auto-Detect Live Stream Feature

## Overview

The Live Chat Overlay now includes **automatic video ID detection** for YouTube! No more manually copying video IDs - just click "Auto-detect" and the system will find your current live stream automatically.

## How It Works

The system uses the YouTube Data API to search for active live broadcasts on your channel and automatically fills in the Video ID.

## Setup

### 1. Configure Your Channel ID

Make sure your `config.js` has your YouTube channel ID:

```javascript
youtube: {
  apiKey: 'YOUR_API_KEY',
  channelId: 'UC5PzeoJUzl3iWw6CElbWWkg', // Your channel ID
  // ...
}
```

**Where to find your Channel ID:**
- Go to YouTube Studio
- Click on your profile → Settings → Channel
- Under "Advanced settings" you'll see your Channel ID
- Or from your channel URL: `youtube.com/channel/YOUR_CHANNEL_ID`

### 2. Start Your Live Stream

Before using auto-detect, make sure your live stream is:
- ✅ Created and scheduled (or already live)
- ✅ Set to "Live" or "Upcoming"
- ✅ Visible (not private)

## Usage

### Option 1: Auto-Detect (Recommended)

1. Open control panel: `http://localhost:3000/control`
2. In the YouTube section, click **"🔍 Auto-detect"**
3. System will:
   - Search for your active live stream
   - Display the stream title
   - Auto-fill the Video ID
   - Automatically connect after 1 second

### Option 2: Manual Entry

You can still manually enter the Video ID if preferred:
1. Copy Video ID from your stream URL
2. Paste into the "YouTube Video ID" field
3. Click "Connect YouTube"

## Control Panel UI

The YouTube section now includes:

```
🎥 YouTube
┌──────────────────────────────────────┐
│ Channel ID                           │
│ [UC5PzeoJUzl3iWw6CElbWWkg] (readonly)│
│                                      │
│ YouTube Video ID                     │
│ [____________] [🔍 Auto-detect]      │
│                                      │
│ [Connect YouTube] [Disconnect]       │
│ ✅ Connected                         │
│                                      │
│ ✅ Found: My Amazing Stream Title    │
└──────────────────────────────────────┘
```

## Status Messages

### Success
```
✅ Found: Your Stream Title Here → Connecting...
```

### No Live Stream
```
⚠️ No active live stream found on this channel
```

### Error
```
❌ Error: Invalid channel ID
❌ No channel ID configured. Please set in config.js
```

## API Endpoint

### Manual API Usage

You can also use the auto-detect API directly:

```bash
curl http://localhost:3000/api/youtube/channel/YOUR_CHANNEL_ID/live
```

**Response (Live stream found):**
```json
{
  "status": "success",
  "videoId": "abc123xyz",
  "title": "My Live Stream Title",
  "channelTitle": "Your Channel Name",
  "thumbnail": "https://i.ytimg.com/vi/abc123xyz/mqdefault.jpg"
}
```

**Response (No live stream):**
```json
{
  "status": "no_live_stream",
  "message": "No active live stream found for this channel"
}
```

**Response (Error):**
```json
{
  "status": "error",
  "message": "API key not configured",
  "code": 403
}
```

## Workflow Example

### Before (Manual Process)
```
1. Go live on YouTube
2. Copy URL: youtube.com/watch?v=abc123xyz
3. Extract video ID: abc123xyz
4. Open control panel
5. Paste video ID
6. Click connect
```

### After (Auto-Detect)
```
1. Go live on YouTube
2. Open control panel
3. Click "🔍 Auto-detect"
4. Done! (auto-connects in 1 second)
```

**Saves time:** ~30-60 seconds per stream setup! ⚡

## Technical Details

### Server-Side

**New API Endpoint:** `/api/youtube/channel/:channelId/live`

Uses YouTube Data API v3 Search endpoint:
- `part=snippet`
- `channelId=YOUR_CHANNEL_ID`
- `eventType=live` (only active live streams)
- `type=video`

Returns the first (most recent) live stream found.

### Client-Side

**New Function:** `autoDetectLiveStream()`

1. Reads channel ID from config
2. Calls auto-detect API
3. Parses response
4. Updates UI with results
5. Auto-fills video ID field
6. Auto-connects after 1 second (if successful)

## Rate Limits

**YouTube Data API Quota:**
- Each auto-detect call costs **~100 quota units**
- Daily quota: **10,000 units** (free tier)
- You can auto-detect **~100 times per day**

**Tips to conserve quota:**
- Only use auto-detect when starting a new stream
- Don't spam the button
- Use manual entry if you already know the video ID

## Troubleshooting

### "No channel ID configured"

**Problem:** Channel ID not set in config.js

**Solution:**
```javascript
// config.js
youtube: {
  channelId: 'UC5PzeoJUzl3iWw6CElbWWkg', // Add this
  apiKey: 'YOUR_API_KEY',
  // ...
}
```

### "No active live stream found"

**Problem:** No live stream currently active

**Solutions:**
1. Make sure you've started your live stream
2. Check stream is set to "Live" or "Upcoming"
3. Verify stream is not set to "Private"
4. Wait a few minutes after creating stream (YouTube needs time to index)

### "API key not configured"

**Problem:** YouTube API key missing

**Solution:**
```javascript
// config.js
youtube: {
  apiKey: 'AIzaSyB...', // Add your API key
  // ...
}
```

### Auto-detect finds wrong stream

**Problem:** If you have multiple live streams, it returns the first one

**Solution:**
- YouTube API returns streams in order of creation
- Cancel/end old streams before starting new one
- Or use manual video ID entry

## Use Cases

### 1. Quick Stream Setup
Click auto-detect to instantly connect to your stream without any copy/paste.

### 2. Multiple Streams Per Day
Auto-detect each new stream without tracking video IDs.

### 3. Testing
Quickly switch between test streams and production streams.

### 4. Multi-User Setup
Other streamers can use your setup - auto-detect finds THEIR stream based on THEIR channel ID.

## Benefits

✅ **Faster setup** - 1 click instead of manual copy/paste  
✅ **No errors** - No typos in video IDs  
✅ **User-friendly** - Visual feedback with stream title  
✅ **Automatic connection** - Auto-connects after detection  
✅ **Fallback** - Manual entry still available  
✅ **Smart** - Only finds YOUR active live streams  

## Future Enhancements

Possible future additions:
- Auto-detect on server startup (if configured)
- Periodic auto-detection (reconnect if stream changes)
- Detect scheduled streams (upcoming)
- List all live/upcoming streams for selection
- Twitch auto-detect (using Helix API)

## Security Note

The auto-detect feature only searches for **public live streams** on your channel. It cannot access:
- ❌ Private streams
- ❌ Unlisted streams (unless you have the direct link)
- ❌ Other channels' streams (uses YOUR channel ID)

---

**Ready to use!** Just click "🔍 Auto-detect" when you go live! 🚀

