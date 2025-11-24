# SafeHaven Companion

A voice-first mental wellness companion that uses AI to provide supportive conversations through natural voice interactions. Built with React frontend and Django backend, integrated with OpenAI Whisper (STT), GPT-4 (LLM), and YarnGPT (TTS with Nigerian accents).

## 🎯 Overview

SafeHaven is an anonymous, voice-based mental wellness tool that allows users to:
- Record voice messages using natural speech
- Receive empathetic AI-powered responses
- Choose from 16 Nigerian-accented voices
- Track conversation history
- Use without authentication (Phase 1 MVP)

## 🏗️ Architecture

```
safehaven/
├── frontend/          # React application
│   ├── src/
│   │   ├── components/    # VoiceChat, MessageBubble, VoiceSelector
│   │   └── services/      # API integration
│   └── package.json
│
└── server/            # Django REST API
    └── src/
        ├── companion/          # User & Session models
        ├── audio_processing/   # STT, TTS, LLM services
        └── mindvoice_project/  # Django settings
```

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 18
- **UI/UX**: Framer Motion for animations
- **HTTP Client**: Axios
- **Audio Recording**: Native Web Audio API
- **Styling**: CSS3 with gradient designs

### Backend
- **Framework**: Django + Django REST Framework
- **Database**: SQLite (development), PostgreSQL (production-ready)
- **AI Services**:
  - OpenAI Whisper API (Speech-to-Text)
  - OpenAI GPT-4 (Language Model)
  - YarnGPT API (Text-to-Speech with Nigerian accents)
- **Environment**: Python 3.12, Pipenv

### DevOps
- **Package Management**: npm (frontend), Pipenv (backend)
- **Code Formatting**: Black, isort, autoflake (Python)
- **Process Management**: Make commands

## 🚀 Setup Instructions

### Prerequisites
- Node.js 16+ and npm
- Python 3.12
- Pipenv
- OpenAI API key
- YarnGPT API key

### Backend Setup

1. Navigate to server directory:
```bash
cd server
```

2. Install dependencies:
```bash
pipenv install
```

3. Create `.env` file with your API keys:
```env
SECRET_KEY=your-django-secret-key
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
OPENAI_API_KEY=your-openai-api-key
YARNGPT_API_KEY=your-yarngpt-api-key
YARNGPT_BASE_URL=https://api.yarngpt.com/v1
```

4. Generate Django secret key:
```bash
make generate-secret-key
```

5. Run database migrations:
```bash
make migrate
```

6. Create admin superuser:
```bash
make superuser
```
Default credentials: username=`admin`, password=`admin`

7. Start development server:
```bash
make run
```
Backend runs at: http://localhost:8001

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start development server:
```bash
npm start
```
Frontend runs at: http://localhost:3000

## 📱 Usage

1. Open http://localhost:3000 in your browser
2. Click the microphone button to start recording
3. Speak your message naturally
4. Click stop to send your audio
5. Wait for AI response (text + audio)
6. Click play to listen to the AI response
7. Click settings (⚙️) to change voice preference

## 🎤 Available Voices

16 Nigerian-accented voices from YarnGPT:
- **Tayo** - Upbeat, energetic (default)
- **Idera** - Melodic, gentle
- **Emma** - Authoritative, deep
- **Zainab** - Soothing, gentle
- And 12 more options...

## 🔌 API Endpoints

### `POST /api/voice_input/`
Main voice interaction endpoint
- **Input**: FormData with `audio` (WebM) and `voice_preference` fields
- **Output**: MP3 audio file with custom headers
  - `X-Transcript`: User's transcribed text
  - `X-Response-Text`: AI response text
- **Flow**: Audio → Whisper STT → GPT-4 → YarnGPT TTS → MP3

### `GET /api/profile/`
Get user profile settings (future authentication)

### `PATCH /api/profile/`
Update user preferences (future authentication)

### `GET /api/sessions/`
Retrieve conversation history (future authentication)

## 🧪 Development Commands

### Backend (from `server/` directory)
```bash
make setup              # Complete setup (install, migrate, superuser)
make run                # Start Django dev server
make migrate            # Run database migrations
make makemigrations     # Create new migrations
make shell              # Open Django shell
make clean              # Remove cache files
make tidy               # Format code with black/isort/autoflake
make generate-secret-key # Generate new Django SECRET_KEY
```

### Frontend (from `frontend/` directory)
```bash
npm start               # Start dev server
npm run build           # Build for production
npm test                # Run tests
```

## 📊 Database Models

### User
- Authentication fields (username, email, password)
- `voice_preference`: Selected TTS voice
- `locale`: Language/region preference
- `consent`: Privacy consent flag

### Session
- `user`: Foreign key to User
- `timestamp`: When conversation occurred
- `transcript`: STT output (user's words)
- `response_text`: LLM output (AI response)
- `voice_used`: TTS voice used for response

## ✅ Phase 1 Status (Complete)

- [x] Frontend voice recording interface
- [x] Backend API with STT, LLM, TTS pipeline
- [x] Voice preference selection (16 voices)
- [x] Message history display
- [x] Audio playback controls
- [x] Anonymous usage (no auth required)
- [x] Admin dashboard for monitoring
- [x] CORS configuration
- [x] Mobile-responsive design

## 🔜 Roadmap (Phase 2+)

- [ ] User authentication
- [ ] Micro-habit library and suggestions
- [ ] Habit tracking system
- [ ] Weekly reflection prompts
- [ ] Safety keyword detection
- [ ] Multi-language support
- [ ] Progressive Web App (PWA)
- [ ] Voice activity detection
- [ ] Conversation analytics

## 🔐 Environment Variables

### Backend `.env`
```env
SECRET_KEY=              # Django secret key
DEBUG=                   # True/False
ALLOWED_HOSTS=           # Comma-separated hosts
OPENAI_API_KEY=          # OpenAI API key
YARNGPT_API_KEY=         # YarnGPT API key
YARNGPT_BASE_URL=        # YarnGPT endpoint
```

### Frontend `.env` (optional)
```env
REACT_APP_API_URL=       # Backend API URL (default: http://localhost:8001/api)
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run formatters: `make tidy` (backend)
5. Test thoroughly
6. Submit a pull request

## 📄 License

This project is private and proprietary.

## 👥 Team

Built with care for mental wellness support.

---

**Quick Start**: Run `make setup` in `server/`, then `npm install && npm start` in `frontend/`  
**Frontend**: http://localhost:3000  
**Backend**: http://localhost:8001  
**Admin**: http://localhost:8001/admin (admin/admin)
