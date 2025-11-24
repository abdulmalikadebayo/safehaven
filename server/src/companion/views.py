from django.core.files.base import ContentFile
from django.http import HttpResponse
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from audio_processing.llm_service import LLMService
from audio_processing.stt_service import STTService
from audio_processing.tts_service import TTSService

from .models import Message, Session
from .serializers import SessionSerializer, UserSerializer


class VoiceInputView(APIView):
    """
    Main endpoint: /api/voice_input
    Receives audio -> STT -> LLM -> TTS -> returns audio
    """

    def post(self, request):
        print("\n=== Voice Input Request Started ===")
        try:
            # Get audio file or text input
            audio_file = request.FILES.get("audio")
            text_input = request.data.get("text")

            if not audio_file and not text_input:
                print("❌ Error: No audio or text provided")
                return Response(
                    {"error": "Please provide either audio file or text input"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            print(f"✓ Input type: {'Audio' if audio_file else 'Text'}")
            if audio_file:
                print(f"✓ Audio file: {audio_file.name}, size: {audio_file.size} bytes")
            else:
                print(f"✓ Text input: {text_input[:50]}...")

            user = request.user if request.user.is_authenticated else None
            # Allow voice_preference override from request for anonymous users
            voice_preference = request.data.get("voice_preference") or (
                user.voice_preference if user else "tayo"
            )
            print(f"✓ Voice preference: {voice_preference}")

            # Step 1: Get transcript (either from STT or direct text)
            if audio_file:
                print("\n--- Step 1: Speech-to-Text (Whisper) ---")
                stt_service = STTService()
                transcript = stt_service.transcribe(audio_file)
                print(f"✓ Transcript: {transcript}")
            else:
                print("\n--- Step 1: Using direct text input ---")
                transcript = text_input
                print(f"✓ Text: {transcript}")

            # Step 2: LLM - Get response
            print("\n--- Step 2: LLM Processing (GPT-4) ---")
            llm_service = LLMService()
            response_text = llm_service.get_response(transcript)
            print(f"✓ LLM Response: {response_text}")

            # Step 3: TTS - Convert response to audio
            print("\n--- Step 3: Text-to-Speech (YarnGPT) ---")
            audio_data = None
            tts_error = None
            try:
                tts_service = TTSService()
                audio_data = tts_service.synthesize(response_text, voice_preference)
                print(f"✓ TTS Audio generated: {len(audio_data)} bytes")
            except Exception as tts_e:
                tts_error = str(tts_e)
                print(f"⚠️ TTS failed: {tts_error}")
                print("⚠️ Continuing without audio...")

            # Step 4: Save messages to database for authenticated users
            if user:
                # Get or create an active session for this user
                session = (
                    Session.objects.filter(user=user).order_by("-updated_at").first()
                )
                if not session:
                    session = Session.objects.create(user=user)
                    print(f"✓ New session created for user: {user.username}")
                else:
                    print(f"✓ Using existing session: {session.id}")

                # Save user message
                user_message = Message.objects.create(
                    session=session, user=user, role="user", text=transcript
                )
                if audio_file:
                    # Save the uploaded audio
                    user_message.audio_file.save(
                        f"user_{user.id}_{user_message.id}.webm",
                        ContentFile(audio_file.read()),
                    )
                    audio_file.seek(0)  # Reset file pointer
                print(f"✓ User message saved: {user_message.id}")

                # Save assistant message with audio
                assistant_message = Message.objects.create(
                    session=session,
                    user=user,
                    role="assistant",
                    text=response_text,
                    voice_used=voice_preference,
                )
                if audio_data:
                    assistant_message.audio_file.save(
                        f"assistant_{user.id}_{assistant_message.id}.mp3",
                        ContentFile(audio_data),
                    )
                print(f"✓ Assistant message saved: {assistant_message.id}")

            # Return response
            print("\n=== Request Complete ===\n")
            if audio_data:
                # Return audio response with headers
                # Note: HTTP headers can't contain newlines, so we encode them
                import base64
                
                response = HttpResponse(audio_data, content_type="audio/mpeg")
                response["Content-Disposition"] = 'attachment; filename="response.mp3"'
                # Encode text with newlines as base64 to safely pass in headers
                response["X-Transcript"] = base64.b64encode(transcript.encode()).decode()
                response["X-Response-Text"] = base64.b64encode(response_text.encode()).decode()
                response["X-User-Query"] = base64.b64encode(transcript.encode()).decode()
                response["X-Encoding"] = "base64"  # Signal to frontend that values are base64 encoded
                return response
            else:
                # Return JSON if TTS failed
                response_data = {
                    "user_query": transcript,  # User's original query
                    "transcript": transcript,
                    "response_text": response_text,
                    "audio_url": None,
                    "tts_error": tts_error,
                    "message": "TTS service unavailable. Text response provided.",
                }
                print(f"Response data: {response_data}")
                return Response(response_data)

        except Exception as e:
            print(f"\n Error occurred: {str(e)}")
            import traceback

            traceback.print_exc()
            return Response(
                {"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class UserProfileView(APIView):
    """Get or update user profile"""

    def get(self, request):
        if not request.user.is_authenticated:
            return Response(
                {"error": "Not authenticated"}, status=status.HTTP_401_UNAUTHORIZED
            )

        serializer = UserSerializer(request.user)
        return Response(serializer.data)

    def patch(self, request):
        if not request.user.is_authenticated:
            return Response(
                {"error": "Not authenticated"}, status=status.HTTP_401_UNAUTHORIZED
            )

        serializer = UserSerializer(request.user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class SessionHistoryView(APIView):
    """Get user's session history"""

    def get(self, request):
        if not request.user.is_authenticated:
            return Response(
                {"error": "Not authenticated"}, status=status.HTTP_401_UNAUTHORIZED
            )

        sessions = Session.objects.filter(user=request.user)[:10]
        serializer = SessionSerializer(sessions, many=True)
        return Response(serializer.data)
