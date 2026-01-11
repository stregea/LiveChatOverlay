# Quick Reference: Auto-Detect Feature

## Usage

### Control Panel
```
http://localhost:3000/control
```

### Auto-Detect Button
Located in the YouTube section, next to the Video ID input field.

```
┌────────────────────────────────┐
│ YouTube Video ID               │
│ [__________] [🔍 Auto-detect] │
└────────────────────────────────┘
```

## Quick Start

1. **Go live on YouTube**
2. **Open control panel**
3. **Click "🔍 Auto-detect"**
4. **Wait 1 second** → Auto-connects!

## Status Messages

| Message | Meaning |
|---------|---------|
| 🔍 Searching for live stream... | Searching in progress |
| ✅ Found: Stream Title → Connecting... | Success! Auto-connecting |
| ⚠️ No active live stream found | Not currently streaming |
| ❌ No channel ID configured | Need to set channelId in config.js |
| ❌ Error: message | API error (check console) |

## API Endpoint

```bash
curl http://localhost:3000/api/youtube/channel/YOUR_CHANNEL_ID/live
```

## Troubleshooting

### No channel ID configured
```javascript
// config.js - Add this:
youtube: {
  channelId: 'UC5PzeoJUzl3iWw6CElbWWkg'
}
```

### No active live stream found
- Make sure you're actually live
- Check stream is not private
- Wait a few minutes after going live

### API errors
- Verify API key is correct
- Check daily quota not exceeded
- Ensure API is enabled in Google Console

## Key Features

✅ One-click detection  
✅ Shows stream title  
✅ Auto-fills video ID  
✅ Auto-connects  
✅ Visual feedback  
✅ Manual entry still available  

## Links

- **Full Documentation:** [docs/AUTO_DETECT.md](AUTO_DETECT.md)
- **Multistream Guide:** [docs/MULTISTREAM.md](MULTISTREAM.md)
- **Main README:** [README.md](../README.md)

