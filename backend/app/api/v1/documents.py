from fastapi import APIRouter, UploadFile, File, HTTPException
from app.services.ocr_service import OCRService
import traceback

router = APIRouter()
ocr_service = OCRService()

@router.post("/ocr")
async def extract_text(file: UploadFile = File(...)):
    try:
        contents = await file.read()
        text = await ocr_service.extract_text(contents, file.filename)
        return {"filename": file.filename, "text": text}
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))