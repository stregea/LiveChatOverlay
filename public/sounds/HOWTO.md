# ✅ Sound File Ready

A placeholder `message.mp3` file has been created to prevent 404 errors. 

## 🔇 Current State: Silent Placeholder

The included `message.mp3` is a minimal silent audio file. The overlay will work without errors, but you won't hear any sound effects.

## 🔊 Add Your Own Sound (Optional)

### Option 1: Use macOS System Sounds
```bash
# Copy a macOS system sound
cp /System/Library/Sounds/Glass.aiff message.aiff
afconvert message.aiff message.mp3 -d LEI16@44100 -f mp4f
rm message.aiff
```

### Option 2: Download Free Sounds

Visit these sites and download a notification sound:
- [Freesound.org](https://freesound.org/search/?q=notification) - Free sound library
- [Mixkit](https://mixkit.co/free-sound-effects/notification/) - High-quality sounds
- [Zapsplat](https://www.zapsplat.com/sound-effect-category/notifications/) - Professional sounds

Then save as `message.mp3` in this folder (replace the existing file).

### Option 3: Disable Sound

In the control panel (`http://localhost:3000/control`):
1. Uncheck "Enable sounds"
2. You won't need any sound files

## 📦 Optional: Multiple Sounds

Add these files for different event sounds:
- `superchat.mp3` - Super chat donations
- `moderator.mp3` - Moderator messages

## 💡 Recommended Sound Properties

- **Duration**: 0.5 - 1.0 seconds
- **Format**: MP3 (best compatibility)
- **Sample Rate**: 44.1kHz
- **Bitrate**: 128kbps or higher

