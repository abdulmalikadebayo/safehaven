import os

from openai import OpenAI


class STTService:
    """Speech-to-Text using OpenAI Whisper"""

    def __init__(self):
        self.client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

    def transcribe(self, audio_file):
        """
        Transcribe audio to text using Whisper

        Args:
            audio_file: Django UploadedFile object

        Returns:
            str: Transcribed text
        """
        try:
            # Reset file pointer to beginning
            audio_file.seek(0)

            # Read file content as bytes and pass as tuple (filename, bytes, content_type)
            file_content = audio_file.read()
            audio_file.seek(0)  # Reset again in case needed

            transcript = self.client.audio.transcriptions.create(
                model="whisper-1",
                file=(audio_file.name, file_content, audio_file.content_type),
            )
            return transcript.text
        except Exception as e:
            raise Exception(f"STT error: {str(e)}")
