import asyncio

from app.services import tts_service


def test_generate_speech_returns_empty_string_when_tts_dependencies_are_unavailable(monkeypatch):
    monkeypatch.setattr(tts_service, "edge_tts", None)
    monkeypatch.setattr(tts_service, "texttospeech", None)

    service = tts_service.TTSService()
    result = asyncio.run(service.generate_speech("hello", "en"))

    assert result == ""
