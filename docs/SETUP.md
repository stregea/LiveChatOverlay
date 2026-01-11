# Setup Guide

## Prerequisites

Before you begin, make sure you have:
- Node.js 16 or higher installed
- npm (comes with Node.js)
- OBS Studio installed

## Installation Steps

### 1. Install Dependencies

Open a terminal in the project directory and run:

```bash
npm install
```

This will install:
- `express` - Web server
- `ws` - WebSocket library for real-time communication
- `node-fetch` - For API requests

### 2. Add a Sound File

The overlay needs a notification sound. You can:

**Option A: Use a simple beep**
1. Visit [https://onlinetonegenerator.com](https://onlinetonegenerator.com)
2. Generate a short beep (0.5-1 second)
3. Download as MP3
4. Save it as `public/sounds/message.mp3`

**Option B: Download a free sound**
1. Visit [Freesound.org](https://freesound.org)
2. Search for "notification" or "beep"
3. Download a sound you like
4. Save it as `public/sounds/message.mp3`

**Option C: Skip sounds**
- The overlay will work without sound files
- Just disable sound in the control panel

### 3. Start the Server

```bash
npm start
```

You should see:
```
🎥 Live Chat Overlay Server running on http://localhost:3000
📺 Overlay: http://localhost:3000
⚙️  Control Panel: http://localhost:3000/control
```

### 4. Test the Overlay

1. Open your browser to `http://localhost:3000/control`
2. Click "Send Test Message" to see if messages appear
3. The overlay itself is at `http://localhost:3000`

## OBS Studio Setup

### Adding the Browser Source

1. **Open OBS Studio**

2. **Add Browser Source**
   - In your scene, click the **+** button under Sources
   - Select **Browser**
   - Name it "Chat Overlay"

3. **Configure the Browser Source**
   - URL: `http://localhost:3000`
   - Width: `1920`
   - Height: `1080`
   - FPS: `30` (default)
   - ✅ Check "Shutdown source when not visible"
   - ✅ Check "Refresh browser when scene becomes active"

4. **Position the Overlay**
   - The chat appears in the bottom-left by default
   - You can resize and position the source as needed
   - The overlay has a transparent background

5. **Click OK**

## Connecting to Live Chat

### YouTube Live Chat

1. **Get Your Video ID**
   - Start a live stream on YouTube
   - Copy the video ID from the URL
   - Example: `https://youtube.com/watch?v=dQw4w9WgXcQ`
   - Video ID: `dQw4w9WgXcQ`

2. **Connect in Control Panel**
   - Open `http://localhost:3000/control`
   - Select "YouTube" as platform
   - Paste the video ID
   - Click "Connect"

**Note:** The YouTube integration currently runs in simulation mode for testing. To connect to real YouTube chat, you need to:
- Enable YouTube Data API v3 in Google Cloud Console
- Get an API key
- Add the API key to `public/js/youtube.js`

### Twitch Live Chat

1. **Get Your Channel Name**
   - Your Twitch channel name (e.g., "yourname")
   - Use lowercase

2. **Connect in Control Panel**
   - Open `http://localhost:3000/control`
   - Select "Twitch" as platform
   - Enter your channel name
   - Click "Connect"

**Note:** Twitch connection works immediately using IRC WebSocket. It connects as anonymous (read-only).

## Customization

### Themes

Switch between themes in the control panel:
- **Neon** - Vibrant, glowing effects
- **Cozy** - Warm, comfortable colors
- **Custom** - Edit `public/themes/custom.css`

### Custom Styling

1. Open the control panel
2. Scroll to "Custom CSS" section
3. Add your CSS rules
4. Click "Apply Custom CSS"
5. Reload the overlay

### Layout & Appearance

In the control panel, you can adjust:
- Max messages displayed (1-10)
- Animation speed
- Background color and opacity
- Border radius
- Blur effects
- Avatar shape (circle, square, rounded)
- Toggle username, avatars, platform icons

## Troubleshooting

### Messages Not Appearing

1. **Check the connection**
   - Control panel should show "Connected"
   - Green indicator means server is running

2. **Verify platform settings**
   - YouTube: Make sure video ID is correct and stream is live
   - Twitch: Channel name should be lowercase

3. **Test with test messages**
   - In control panel, click "Send Test Message"
   - If test messages work, the issue is with chat connection

### No Sound

1. **Check audio files exist**
   - `public/sounds/message.mp3` should exist

2. **Check browser audio**
   - OBS: Right-click browser source → Check "Monitor Audio"
   - Browser: Make sure site isn't muted

3. **Check volume settings**
   - In control panel, ensure "Enable sounds" is checked
   - Adjust volume slider

### Performance Issues

1. **Reduce max messages**
   - Lower the max messages to 4 or less

2. **Disable blur effect**
   - Uncheck "Blur behind bubble" in control panel

3. **Use simpler theme**
   - Switch to "Cozy" theme (lighter effects)

### Server Won't Start

1. **Check if port 3000 is in use**
   ```bash
   lsof -i :3000
   ```

2. **Change the port**
   - Edit `server.js`
   - Change `const PORT = 3000;` to another port

3. **Check Node.js version**
   ```bash
   node --version
   ```
   - Should be 16.0.0 or higher

## Development Mode

To enable auto-restart on file changes:

```bash
npm run dev
```

This uses `nodemon` to watch for file changes and restart the server automatically.

## Production Deployment

To run this on a server (optional):

1. **Set environment variable**
   ```bash
   export PORT=3000
   ```

2. **Use a process manager**
   ```bash
   npm install -g pm2
   pm2 start server.js --name chat-overlay
   ```

3. **Access remotely**
   - In OBS, use: `http://your-server-ip:3000`

## Need Help?

Common issues and solutions:

- **CORS errors**: Make sure you're accessing via `localhost`, not file://
- **WebSocket errors**: Check firewall settings
- **Twitch not connecting**: Verify channel name is lowercase and exists
- **YouTube not working**: See YouTube API setup notes above

## Next Steps

1. Customize the themes to match your brand
2. Add your own sound effects
3. Test with your actual stream
4. Adjust positioning in OBS
5. Save your OBS scene!

Enjoy your custom chat overlay! 🎉

