# SafeHaven Companion - Backend

Voice-first mental wellness companion API.

## Setup

1. Install dependencies:
```bash
pipenv install
```

2. Copy `.env.example` to `.env` and add your API keys:
```bash
cp .env.example .env
```

3. Generate Django SECRET_KEY:
```bash
make generate-secret-key
```

4. Run migrations:
```bash
make migrate
```

5. Create superuser:
```bash
make superuser
```

6. Run development server:
```bash
make run
```

Server runs at: http://localhost:8000

## API Endpoints

### POST /api/voice_input/
Main endpoint for voice interaction.
- **Input**: Audio file (form-data, key: `audio`)
- **Output**: Audio response (mp3)
- **Flow**: Audio → STT (Whisper) → LLM (GPT-4) → TTS (YarnGPT) → Audio

### GET /api/profile/
Get authenticated user's profile (voice_preference, locale, consent).

### PATCH /api/profile/
Update user profile settings.

### GET /api/sessions/
Get user's last 10 session logs.

## Project Structure

```
server/
├── src/
│   ├── manage.py
│   ├── mindvoice_project/      # Django settings
│   ├── companion/              # User & Session models, API views
│   └── audio_processing/       # STT, TTS, LLM services
├── Pipfile
├── Makefile
└── .env
```

## Models

### User
- username, email, password (Django auth)
- voice_preference: nigerian_tayo, nigerian_chinenye, neutral
- locale: en_NG, en_US, en_GB
- consent: boolean

### Session
- user: ForeignKey
- timestamp: DateTime
- transcript: TextField (STT output)
- response_text: TextField (LLM output)
- voice_used: CharField

## Services

### STTService (`audio_processing/stt_service.py`)
- `transcribe(audio_file)` → text
- Uses OpenAI Whisper API

### TTSService (`audio_processing/tts_service.py`)
- `synthesize(text, voice)` → audio bytes
- Uses YarnGPT API with Nigerian accent support

### LLMService (`audio_processing/llm_service.py`)
- `get_response(user_input, history)` → response text
- Uses GPT-4 with SafeHaven system prompt
- 12-18 words per sentence, exploration-first approach

## Development Commands

```bash
make setup          # Install deps, migrate, create superuser
make run            # Run dev server
make migrate        # Run migrations
make makemigrations # Create migrations
make shell          # Django shell
make clean          # Remove cache files
make tidy           # Format code (autoflake, isort, black)
```

## Phase 1 Status ✅

- [x] Django project structure
- [x] User model with voice preferences
- [x] Session logging
- [x] `/api/voice_input` endpoint
- [x] STT integration (Whisper)
- [x] TTS integration (YarnGPT)
- [x] LLM integration (GPT-4)
- [x] Admin interface
- [x] CORS configured

## Next Steps (Phase 2)

- [ ] Micro-habit library
- [ ] Habit suggestion logic
- [ ] Habit tracking model
- [ ] Weekly reflection prompts
- [ ] Safety keyword detection
