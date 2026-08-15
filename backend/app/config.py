from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    app_name: str = "AIDOC API"
    debug: bool = True

    # OpenRouter
    openrouter_api_key: str = ""
    openrouter_model: str = "google/gemini-2.0-flash-001"  # or anthropic/claude-3-haiku, meta-llama/llama-3-70b
    openrouter_api_url: str = "https://openrouter.ai/api/v1/chat/completions"
    llm_max_tokens: int = 1024
    llm_temperature: float = 0.7

    # RAG (future)
    qdrant_url: str = "http://localhost:6333"
    qdrant_collection: str = "medical_knowledge"

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"

settings = Settings()