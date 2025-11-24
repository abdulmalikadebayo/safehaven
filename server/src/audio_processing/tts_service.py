import os

import requests


class TTSService:
    """Text-to-Speech using YarnGPT API"""

    def __init__(self):
        self.api_key = os.getenv("YARNGPT_API_KEY")
        self.api_url = os.getenv("YARNGPT_API_URL", "https://yarngpt.ai/api/v1/tts")
        print(f"TTS Service initialized with URL: {self.api_url}")

    def synthesize(self, text, voice="tayo"):
        """
        Convert text to speech using YarnGPT

        Args:
            text: Text to convert
            voice: Voice variant to use (case-insensitive, will be capitalized)

        Returns:
            bytes: Audio data
        """
        try:
            headers = {"Authorization": f"Bearer {self.api_key}"}

            # YarnGPT expects capitalized voice names (Idera, not idera)
            voice_capitalized = voice.capitalize()

            payload = {"text": text, "voice": voice_capitalized}

            print(
                f"Sending TTS request: voice={voice_capitalized}, text_length={len(text)}"
            )

            response = requests.post(
                self.api_url, headers=headers, json=payload, stream=True
            )

            if response.status_code == 200:
                # Collect audio chunks
                audio_data = b""
                for chunk in response.iter_content(chunk_size=8192):
                    audio_data += chunk
                print(f"✓ TTS Success: {len(audio_data)} bytes received")
                return audio_data
            else:
                error_msg = f"YarnGPT API returned {response.status_code}"
                try:
                    error_detail = response.json()
                    error_msg += f": {error_detail}"
                except:
                    error_msg += f": {response.text}"
                raise Exception(error_msg)

        except Exception as e:
            raise Exception(f"TTS error: {str(e)}")
