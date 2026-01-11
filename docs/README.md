# Live Chat Overlay for Streaming

A custom live chat overlay supporting both YouTube and Twitch, designed for use with OBS Studio.

## Features

- ✅ YouTube & Twitch chat support
- ✅ Platform icons
- ✅ User avatars (circular)
- ✅ Custom CSS support
- ✅ Smooth slide-up animations
- ✅ Flexible layout control
- ✅ Emoji rendering (Twemoji)
- ✅ Badge icons
- ✅ Moderator highlighting
- ✅ Super chat support
- ✅ Sound effects
- ✅ Message stacking (4-6 messages)
- ✅ Blur behind bubbles
- ✅ Neon & Cozy themes

## Quick Start

### 1. Installation

```bash
npm install
```

### 2. Start the Server

```bash
npm start
```

The overlay will be available at `http://localhost:3000`

### 3. Add to OBS

1. Open OBS Studio
2. Add a new **Browser Source**
3. Set URL to: `http://localhost:3000`
4. Set Width: `1920`, Height: `1080`
5. Check "Shutdown source when not visible"
6. Click OK

### 4. Configure Chat Connection

#### For YouTube:
1. Open `http://localhost:3000/control` in your browser
2. Select "YouTube" as platform
3. Enter your YouTube Video ID (from the stream URL)
4. Click "Connect"

#### For Twitch:
1. Open `http://localhost:3000/control` in your browser
2. Select "Twitch" as platform
3. Enter your Twitch channel name
4. Click "Connect"

## Configuration

### Themes

The overlay includes two built-in themes:
- **Neon** - Vibrant, colorful theme with glowing effects
- **Cozy** - Warm, comfortable theme with soft colors

Switch themes in the control panel at `http://localhost:3000/control`

### Custom CSS

Add custom styles in the control panel's "Custom CSS" section or edit `public/themes/custom.css`

### Sound Effects

Place your sound effect files in `public/sounds/` and configure them in the control panel.

## Project Structure

```
LiveChatOverlay/
├── public/
│   ├── index.html          # Main overlay display
│   ├── control.html        # Control panel
│   ├── css/
│   │   ├── overlay.css     # Main overlay styles
│   │   └── control.css     # Control panel styles
│   ├── js/
│   │   ├── overlay.js      # Overlay logic
│   │   ├── control.js      # Control panel logic
│   │   ├── youtube.js      # YouTube chat integration
│   │   └── twitch.js       # Twitch chat integration
│   ├── themes/
│   │   ├── neon.css        # Neon theme
│   │   ├── cozy.css        # Cozy theme
│   │   └── custom.css      # Your custom styles
│   └── sounds/
│       └── message.mp3     # Default message sound
├── server.js               # Express server
├── package.json
└── README.md
```

## Requirements

- Node.js 16+ 
- npm or yarn
- OBS Studio

## Browser Compatibility

Works best with:
- Chrome/Chromium-based browsers
- OBS Browser Source (Chromium-based)

## Troubleshooting

### Messages not appearing
- Check that the correct platform and channel/video ID is set
- Verify the stream is live
- Check browser console for errors

### Animations choppy
- Reduce max messages in control panel
- Disable blur effects for better performance

### No sound
- Check browser/OBS audio settings
- Verify sound files exist in `public/sounds/`
- Check volume in control panel

## License

MIT License - Feel free to use and modify for your streaming needs!

