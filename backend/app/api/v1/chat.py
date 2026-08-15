from app.services.tts_service import TTSService
from fastapi import APIRouter, HTTPException
from app.schemas.chat import ChatRequest, ChatResponse
from app.services.ai_service import AIService
import traceback

router = APIRouter()
ai_service = AIService()

@router.post("", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest):
    try:
        reply = await ai_service.generate_reply(
            messages=request.messages,
            language=request.language,
            user_id=None
        )
        return ChatResponse(reply=reply)
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/clean")
async def clean_ocr_text(request: dict):
    """
    Endpoint to clean OCR text using the AI model.
    Expects: { "text": "raw ocr text" }
    Returns: { "cleaned_text": "..." }
    """
    raw_text = request.get("text", "")
    if not raw_text.strip():
        raise HTTPException(status_code=400, detail="No text provided")
    try:
        cleaned = await ai_service.clean_ocr_text(raw_text)
        return {"cleaned_text": cleaned}
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))
    
    from app.services.tts_service import TTSService
from fastapi.responses import JSONResponse

tts_service = TTSService()

@router.post("/tts")
async def text_to_speech(request: dict):
    """
    Converts text to speech.
    Expects: { "text": "...", "language": "en" or "hi" }
    Returns: { "audio": "base64..." }
    """
    text = request.get("text", "")
    language = request.get("language", "en")
    
    if not text.strip():
        raise HTTPException(status_code=400, detail="No text provided")
    
    try:
        audio_base64 = await tts_service.generate_speech(text, language)
        return {"audio": audio_base64}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))