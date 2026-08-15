from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1.router import api_router
from app.config import settings
from app.core.database import engine, Base

# Import all models so SQLAlchemy registers them with Base.metadata
from app.models.user import User  # noqa: F401
from app.models.chat_history import ChatSession, ChatMessage  # noqa: F401

app = FastAPI(title=settings.app_name, debug=settings.debug)

@app.on_event("startup")
async def startup():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

# CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # adjust for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api/v1")

@app.get("/")
def root():
    return {"message": "AIDOC Backend is running"}