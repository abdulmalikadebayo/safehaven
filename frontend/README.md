# SafeHaven Companion - Frontend

Simple, beautiful voice-first mental wellness companion.

## ✅ Features

- **Voice Recording**: Click-to-record interface with visual feedback
- **Audio Playback**: Listen to AI responses with built-in audio player
- **Voice Selection**: Choose from 16 Nigerian accent voices
- **Mobile-Friendly**: Responsive design works on phone and desktop
- **Anonymous Usage**: No login required
- **Clean UI**: Beautiful gradient design with smooth animations

## 🎤 Voice Options

16 YarnGPT voices available:
- Tayo (default) - Upbeat, energetic
- Idera - Melodic, gentle
- Emma - Authoritative, deep
- Zainab - Soothing, gentle
- And 12 more...

## 🚀 Running the Frontend

```bash
cd frontend
npm install
npm start
```

Frontend runs on http://localhost:3000

## 🔧 Configuration

The app expects backend API at `http://localhost:8001/api`

To change API URL:
```bash
# Create .env file
REACT_APP_API_URL=http://your-backend-url/api
```

## 📱 How It Works

1. **Open app** → See welcome message
2. **Click record button** → Speak your message
3. **Click stop** → Audio sent to backend
4. **Backend processes** → STT → LLM → TTS
5. **Frontend displays** → Text + audio response
6. **Click play** → Listen to response
7. **Click settings (⚙️)** → Change voice

## 🎨 Components

```
src/
├── App.js                    # Main app wrapper
├── App.css                   # Global styles
├── components/
│   ├── VoiceChat.js          # Main chat interface
│   ├── VoiceChat.css         # Chat styling
│   ├── MessageBubble.js      # Individual message display
│   ├── MessageBubble.css     # Message styling
│   ├── VoiceSelector.js      # Voice selection modal
│   └── VoiceSelector.css     # Modal styling
└── services/
    └── api.js                # Backend API calls
```

## 📦 Dependencies

- React 18
- Axios (API calls)
- Native Web Audio API (recording)

## 🎯 API Integration

**Endpoint**: `POST /api/voice_input/`

**Request**:
```
FormData:
  - audio: Blob (webm audio)
  - voice_preference: string (voice ID)
```

**Response**:
```
Binary audio (MP3)
Headers:
  - X-Transcript: User's transcribed text
  - X-Response-Text: LLM response text
```

## 🎨 Design Features

- **Gradient background**: Purple-blue gradient
- **Smooth animations**: Fade-in, slide-up, pulse effects
- **Typing indicator**: Shows when AI is thinking
- **Audio player**: Custom play/pause controls
- **Mobile-first**: Bottom sheet modal on mobile
- **Accessibility**: Proper ARIA labels

## Troubleshooting

**Microphone not working:**
- Check browser permissions
- Use HTTPS in production
- Ensure microphone hardware is connected

**Backend connection failed:**
- Verify backend is running on port 8001
- Check CORS settings in Django
- Confirm API URL in .env

**Audio not playing:**
- Check browser audio permissions
- Verify backend returns valid MP3
- Look for console errors

## 📝 Notes

- Voice preference saved in localStorage
- No authentication required for MVP
- Recording format: WebM (browser native)
- Response format: MP3 from YarnGPT

---

**Status**: Phase 1 MVP Complete ✅  
**Frontend**: http://localhost:3000  
**Backend**: http://localhost:8001
