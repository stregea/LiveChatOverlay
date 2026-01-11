# OBS Configuration Guide

Complete guide to integrating the Live Chat Overlay with OBS Studio.

## Basic Setup

### 1. Add Browser Source

1. In OBS Studio, click the **+** button under **Sources**
2. Select **Browser** from the list
3. Name it "Chat Overlay" or similar
4. Click **OK**

### 2. Configure Browser Source

In the properties window:

```
URL: http://localhost:3000
Width: 400
Height: 800
FPS: 30
```

**Important Checkboxes:**
- ☑ **Shutdown source when not visible** - Saves resources
- ☑ **Refresh browser when scene becomes active** - Ensures fresh connection

### 3. Position the Overlay

- **Drag** the overlay to your preferred position (typically right side)
- **Right-click** → **Transform** → **Edit Transform** for precise sizing
- Common positions:
  - Right side: X=1520, Y=100
  - Left side: X=0, Y=100
  - Bottom: X=760, Y=880

## Advanced Configuration

### Full Screen Overlay

For a full-screen overlay (less common):
```
Width: 1920
Height: 1080
```

### Custom Size for Vertical Stream

For 9:16 vertical streaming:
```
Width: 300
Height: 1080
```

### Performance Settings

If experiencing lag:
1. Lower FPS to `15` or `20`
2. Enable "Shutdown source when not visible"
3. Consider reducing `maxMessages` in config.js

## Testing the Overlay

### Method 1: Preview in OBS

1. Make sure your server is running (`npm start`)
2. The overlay should appear in your OBS scene
3. Open control panel (`http://localhost:3000/control`)
4. Connect to your chat platform

### Method 2: Interact Mode

1. Right-click the browser source in OBS
2. Select **Interact**
3. This opens a window showing exactly what OBS sees
4. You can test messages and interactions here
5. Click outside to close

## Common Issues

### Overlay Not Showing

**Problem:** Black screen or no overlay visible in OBS

**Solutions:**
1. Verify server is running: check `http://localhost:3000` in a browser
2. Right-click source → **Properties** → click **OK** to refresh
3. Check URL is exactly `http://localhost:3000` (no trailing slash needed)
4. Try deleting and re-adding the browser source

### Messages Not Updating

**Problem:** Overlay shows but messages don't appear

**Solutions:**
1. Open control panel and verify connection
2. Right-click source → **Refresh** 
3. Check "Refresh browser when scene becomes active" is enabled
4. Verify your Video ID / Channel name is correct

### Overlay Disappears When Switching Scenes

**Problem:** Overlay resets when changing scenes

**Solutions:**
1. Enable "Shutdown source when not visible"
2. Enable "Refresh browser when scene becomes active"
3. This is normal behavior - the overlay will reconnect automatically

### Black Background Instead of Transparent

**Problem:** Overlay has black background

**Solutions:**
1. Check that your CSS doesn't set `body { background: black }`
2. The overlay should have transparent background by default
3. Verify in browser that background is transparent

## Multi-Scene Setup

### Option 1: Single Source (Recommended)

Add the browser source once, then duplicate it:
1. Right-click the source → **Copy**
2. In other scenes, right-click → **Paste (Reference)**
3. This shares the same source across scenes
4. Connection persists when switching scenes

### Option 2: Multiple Independent Sources

Add separate browser sources per scene:
- Each scene can have different overlay positions
- Each reconnects independently
- Uses more resources

## Custom CSS in OBS

You can add additional CSS directly in OBS:

1. Open browser source properties
2. Scroll to **Custom CSS** section
3. Add your styles:

```css
#chat-container {
  font-size: 18px !important;
}

.message-bubble {
  box-shadow: 0 8px 32px rgba(0,0,0,0.5) !important;
}
```

## Performance Tips

### Reduce CPU Usage

1. **Lower FPS:** Set to 15-20 instead of 30
2. **Limit messages:** Set `maxMessages: 4` in config
3. **Disable blur:** Set `blurEffect: false` in config
4. **Shutdown when hidden:** Always enable this option

### Optimize for Recording

1. Use 30 FPS for smooth animations
2. Ensure server runs on local machine (not network)
3. Close browser tabs viewing the overlay
4. Only have overlay active in scenes where needed

## Streaming Tips

### Placement Best Practices

- **Right side:** Doesn't cover gameplay (most common)
- **Left side:** Good for games with right-side UI
- **Bottom:** Works for full-screen games
- **Avoid center:** Blocks main content

### Size Recommendations

- **Width:** 300-400px (too wide covers too much)
- **Height:** 600-900px (enough for 4-6 messages)
- **Max messages:** 4-6 (readable but not overwhelming)

### Before Going Live

1. ✅ Test overlay with test messages
2. ✅ Verify animations are smooth
3. ✅ Check text is readable at stream resolution
4. ✅ Confirm chat connection is stable
5. ✅ Test scene transitions
6. ✅ Do a test recording to check performance

## Hotkeys (Optional)

You can add OBS hotkeys to control the overlay:

1. **Settings** → **Hotkeys**
2. Find your browser source
3. Set keys for:
   - Show/Hide source
   - Refresh browser source

Useful for quickly hiding chat or refreshing connection.

## Mobile Streaming

If streaming from a mobile device:
1. Run server on a local network computer
2. Find your local IP: `ipconfig` (Windows) or `ifconfig` (Mac/Linux)
3. Use URL: `http://192.168.1.XXX:3000`
4. Ensure firewall allows port 3000

