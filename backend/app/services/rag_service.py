from app.config import settings

class RAGService:
    def __init__(self):
        self.qdrant_url = getattr(settings, 'qdrant_url', 'http://localhost:6333')
        self.collection = getattr(settings, 'qdrant_collection', 'medical_knowledge')

    async def retrieve(self, query: str, top_k: int = 5) -> str:
        return ""