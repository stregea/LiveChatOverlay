# YouTube API Quota Error - Solutions

## What Happened

You're seeing this error when using Auto-detect:
```
❌ Error: The request cannot be completed because you have exceeded your quota.
```

This is a **YouTube Data API quota limit** error.

## Why This Happens

### YouTube API Quota Limits (Free Tier)
- **Daily quota:** 10,000 units
- **Auto-detect cost:** ~100 units per call
- **Maximum auto-detects per day:** ~100 calls
- **Quota resets:** Midnight Pacific Time (PST/PDT)

### Common Causes
1. **Multiple auto-detect attempts** - Each click uses quota
2. **Testing frequently** - Testing throughout the day adds up
3. **Shared API key** - If others use the same key
4. **Previous API calls** - Other YouTube API usage on the same project

## Solutions

### Option 1: Manual Video ID Entry (Recommended)

**Bypass the quota limit entirely by entering the Video ID manually:**

1. Go to your YouTube live stream
2. Copy the Video ID from the URL:
   ```
   youtube.com/watch?v=abc123xyz
                         ↑ This is the Video ID
   ```
3. Paste it into the **"YouTube Video ID"** field
4. Click **"Connect YouTube"**

**This uses NO quota!** ✅

### Option 2: Wait for Quota Reset

YouTube quotas reset at **midnight Pacific Time**.

**Current time:** Check what time it is in PST/PDT
- PST (Winter): UTC-8
- PDT (Summer): UTC-7

**Example:**
- If you hit the limit at 3pm PST, quota resets at midnight PST (9 hours)
- You can use auto-detect again after reset

### Option 3: Increase API Quota (Paid)

If you need more quota:

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Navigate to: **APIs & Services → Quotas**
3. Request quota increase (requires billing account)
4. Google reviews and approves requests

**Cost:** Typically free for reasonable usage, but requires payment method on file.

## Best Practices to Conserve Quota

### ✅ DO:
- **Use manual entry** when you know the Video ID
- **Save Video IDs** for recurring streams
- **Test sparingly** - Only use auto-detect when going live
- **Use one API key** per project

### ❌ DON'T:
- **Spam auto-detect** button repeatedly
- **Use auto-detect for testing** - use simulation mode instead
- **Share API keys** across multiple projects
- **Auto-detect every stream** - save Video IDs

## How to Check Your Quota Usage

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Select your project
3. Go to: **APIs & Services → Dashboard**
4. Click on **YouTube Data API v3**
5. View **Quotas & System Limits** tab
6. See your current usage

## Alternative: Use Simulation Mode

For testing WITHOUT using quota:

**Edit config.js:**
```javascript
youtube: {
  apiKey: 'YOUR_API_KEY',
  channelId: 'YOUR_CHANNEL_ID',
  simulationMode: true,  // ← Set to true
}
```

This generates fake test messages without hitting YouTube API.

## Quick Reference

| Action | Quota Cost | Recommendation |
|--------|------------|----------------|
| Manual Video ID entry | 0 units | ✅ Use this! |
| Auto-detect | ~100 units | ⚠️ Use sparingly |
| Live chat polling | ~5 units per poll | ⚠️ Increase interval |
| Simulation mode | 0 units | ✅ For testing |

## Current Workaround

**Until quota resets, use manual entry:**

1. Get your Video ID from YouTube Studio or stream URL
2. Enter it in the **"YouTube Video ID"** field
3. Click **"Connect YouTube"**
4. Everything works normally!

The only thing you lose is the convenience of auto-detect. All other features work perfectly.

## Long-Term Solution

**For production use:**

Consider creating a simple script to save Video IDs from your streams:

```javascript
// Save your stream Video IDs
const myStreams = {
  'Daily Stream': 'abc123',
  'Special Event': 'xyz789',
  // ...add more
};
```

Then you never need auto-detect again!

## Summary

**Problem:** YouTube API quota exceeded  
**Quick Fix:** Use manual Video ID entry  
**Long-term:** Save Video IDs, use auto-detect sparingly  
**Cost:** $0 - just use manual entry!  

The quota error doesn't affect your ability to use the overlay - it only affects the auto-detect convenience feature.

---

**Need help?** The manual entry method is actually faster once you know your Video ID! 🚀

