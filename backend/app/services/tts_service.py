import asyncio
import base64
import io
import os
from typing import Optional

try:
    import edge_tts
except ImportError:  # pragma: no cover - optional dependency
    edge_tts = None

try:
    from google.cloud import texttospeech
except ImportError:  # pragma: no cover - optional dependency
    texttospeech = None

# ─── Edge TTS (English) ─────────────────────────
EDGE_VOICE = "en-GB-RyanNeural"  # British male
EDGE_RATE = "+10%"
EDGE_PITCH = "+12Hz"

# ─── Google TTS (Hindi) ─────────────────────────
GOOGLE_API_KEY = "YOUR_API_KEY"
GOOGLE_VOICE = "hi-IN-Standard-B"  # Hindi female
GOOGLE_RATE = 1
GOOGLE_PITCH = -1.7


class TTSService:
    def __init__(self):
        self.google_client: Optional[object] = None
        if texttospeech is not None and GOOGLE_API_KEY:
            try:
                self.google_client = texttospeech.TextToSpeechClient(
                    client_options={"api_key": GOOGLE_API_KEY}
                )
            except Exception as exc:  # pragma: no cover - runtime dependency issue
                print(f"Google TTS client initialization failed: {exc}")

    async def generate_speech(self, text: str, language: str) -> str:
        if not text or not text.strip():
            return ""
        if language == "hi":
            return await self._google_tts(text)
        return await self._edge_tts(text)

    async def _edge_tts(self, text: str) -> str:
        if edge_tts is None:
            print("Edge TTS dependency is unavailable")
            return ""

        max_retries = 2
        for attempt in range(max_retries):
            try:
                communicate = edge_tts.Communicate(
                    text,
                    EDGE_VOICE,
                    rate=EDGE_RATE,
                    pitch=EDGE_PITCH,
                )
                output = io.BytesIO()
                async for chunk in communicate.stream():
                    if chunk.get("type") == "audio":
                        output.write(chunk.get("data", b""))
                output.seek(0)
                return base64.b64encode(output.read()).decode("utf-8")
            except Exception as exc:
                if attempt == max_retries - 1:
                    print(f"Edge TTS failed after {max_retries} attempts: {exc}")
                    return ""
                await asyncio.sleep(1)

        return ""

    async def _google_tts(self, text: str) -> str:
        if texttospeech is None or self.google_client is None:
            print("Google TTS dependency is unavailable")
            return ""

        try:
            synthesis_input = texttospeech.SynthesisInput(text=text)
            voice_params = texttospeech.VoiceSelectionParams(
                language_code="hi-IN",
                name=GOOGLE_VOICE,
            )
            audio_config = texttospeech.AudioConfig(
                audio_encoding=texttospeech.AudioEncoding.MP3,
                speaking_rate=GOOGLE_RATE,
                pitch=GOOGLE_PITCH,
            )
            response = self.google_client.synthesize_speech(
                input=synthesis_input,
                voice=voice_params,
                audio_config=audio_config,
            )
            return base64.b64encode(response.audio_content).decode("utf-8")
        except Exception as exc:
            print(f"Google TTS failed: {exc}")
            return ""
