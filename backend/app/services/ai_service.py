import httpx
import json
from typing import List, AsyncGenerator
from app.config import settings
from app.schemas.chat import Message
from app.services.rag_service import RAGService


class AIService:
    def __init__(self):
        self.rag = RAGService()

    SYSTEM_PROMPT = (
        "You are AIDOC, a holistic AI doctor specializing in lifestyle medicine. "
        "Provide evidence-based guidance on nutrition, exercise, sleep, and stress management. "
        "Emphasize sustainable changes over quick fixes. "
        "Always recommend consulting healthcare providers before starting new exercise or supplement regimens. "
        "Ask clarifying questions before giving advice. "
        "If the user writes in Hindi, respond in Hindi. If the user writes in English, respond in English."
    )

    def _build_api_messages(self, messages: List[Message], rag_context: str) -> List[dict]:
        system_content = self.SYSTEM_PROMPT
        if rag_context:
            system_content = rag_context + "\n\n" + system_content

        api_messages = [{"role": "system", "content": system_content}]
        for m in messages:
            api_messages.append({"role": m.role, "content": m.content})
        return api_messages

    async def generate_reply(
        self, messages: List[Message], language: str, user_id: str | None
    ) -> str:
        try:
            user_query = next(
                (m.content for m in reversed(messages) if m.role == "user"), ""
            )
            rag_context = await self.rag.retrieve(user_query)
            api_messages = self._build_api_messages(messages, rag_context)

            async with httpx.AsyncClient(timeout=120.0) as client:
                response = await client.post(
                    "http://127.0.0.1:11434/v1/chat/completions",
                    json={
                        "model": "aidoc-medical-v2",
                        "messages": api_messages,
                        "max_tokens": settings.llm_max_tokens,
                        "temperature": settings.llm_temperature,
                    },
                )

            if response.status_code == 200:
                data = response.json()
                reply = data["choices"][0]["message"]["content"]
                return reply.strip()

            error_detail = response.text[:300] if response.text else "Unknown error"
            return f" Ollama error {response.status_code}: {error_detail}"

        except httpx.ConnectError:
            return " Cannot connect to Ollama. Is it running? (ollama serve)"
        except httpx.ReadTimeout:
            return " Ollama took too long to respond. Try again."
        except Exception as e:
            return f" Connection error. Details: {str(e)[:200]}"

    async def generate_reply_stream(
        self, messages: List[Message], language: str, user_id: str | None
    ) -> AsyncGenerator[str, None]:
        full_content = ""

        try:
            user_query = next(
                (m.content for m in reversed(messages) if m.role == "user"), ""
            )
            rag_context = await self.rag.retrieve(user_query)
            api_messages = self._build_api_messages(messages, rag_context)

            async with httpx.AsyncClient(timeout=120.0) as client:
                async with client.stream(
                    "POST",
                    "http://127.0.0.1:11434/v1/chat/completions",
                    json={
                        "model": "aidoc-medical-v2",
                        "messages": api_messages,
                        "max_tokens": settings.llm_max_tokens,
                        "temperature": settings.llm_temperature,
                        "stream": True,
                    },
                ) as response:

                    if response.status_code != 200:
                        error_text = ""
                        async for chunk in response.aiter_text():
                            error_text += chunk
                        yield f"data: {json.dumps({'error': f'Ollama error {response.status_code}: {error_text[:200]}'})}\n\n"
                        return

                    async for line in response.aiter_lines():
                        line = line.strip()
                        if not line:
                            continue
                        if line == "data: [DONE]":
                            break

                        if line.startswith("data: "):
                            data_str = line[6:]
                            try:
                                parsed = json.loads(data_str)
                                choices = parsed.get("choices", [])
                                if choices:
                                    delta = choices[0].get("delta", {})
                                    content = delta.get("content", "")
                                    if content:
                                        full_content += content
                                        yield f"data: {json.dumps({'content': content})}\n\n"
                            except json.JSONDecodeError:
                                continue

            yield f"data: {json.dumps({'done': True, 'full_content': full_content})}\n\n"

        except httpx.ConnectError:
            yield f"data: {json.dumps({'error': 'Cannot connect to Ollama. Is it running?'})}\n\n"
        except httpx.ReadTimeout:
            yield f"data: {json.dumps({'error': 'Ollama took too long to respond.'})}\n\n"
        except Exception as e:
            yield f"data: {json.dumps({'error': str(e)})}\n\n"

async def clean_ocr_text(self, raw_text: str) -> str:
    prompt = (
        "You are a medical text correction assistant. "
        "The following text was extracted by OCR from a medical document. "
        "Please rewrite it in clear, correct English, keeping all medical terms accurate. "
        "Output only the corrected text, no explanations.\n\n"
        f"OCR text:\n{raw_text}\n\nCorrected text:"
    )
    messages = [Message(role="user", content=prompt)]
    cleaned = await self.generate_reply(messages, "en", None)
    return cleaned