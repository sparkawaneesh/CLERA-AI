from pydantic import BaseModel, Field
from typing import List, Literal, Optional

class Message(BaseModel):
    role: Literal["user", "assistant"]
    content: str

class ChatRequest(BaseModel):
    messages: List[Message]
    language: str = "auto"  # "en", "hi", or "auto"
    user_id: str | None = None  # future
    session_id: str | None = None  # links to a chat session for persistence

class ChatResponse(BaseModel):
    reply: str