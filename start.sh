#!/bin/bash

# Quick Start Script for Live Chat Overlay

echo "🎥 Live Chat Overlay - Quick Start"
echo "=================================="
echo ""

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    echo ""
fi

# Check if sound file exists
if [ ! -f "public/sounds/message.mp3" ]; then
    echo "⚠️  Warning: No sound file found at public/sounds/message.mp3"
    echo "   The overlay will work without sound, but for best experience:"
    echo "   - Visit https://freesound.org and download a notification sound"
    echo "   - Or run: afconvert /System/Library/Sounds/Glass.aiff public/sounds/message.mp3 -d LEI16@44100 -f mp4f"
    echo ""
fi

# Start the server
echo "🚀 Starting server..."
echo ""
echo "📺 Overlay URL: http://localhost:3000"
echo "⚙️  Control Panel: http://localhost:3000/control"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

npm start

