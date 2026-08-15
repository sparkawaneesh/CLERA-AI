import httpx
import base64
from pdf2image import convert_from_bytes
from PIL import Image
import io

OCR_API_KEY = "K87536925888957"   # ← paste your key

class OCRService:
    async def extract_text(self, file_bytes: bytes, filename: str) -> str:
        if filename.lower().endswith('.pdf'):
            return await self._extract_from_pdf(file_bytes)
        else:
            return await self._extract_from_image(file_bytes)

    async def _extract_from_image(self, file_bytes: bytes) -> str:
        base64_image = base64.b64encode(file_bytes).decode('utf-8')
        return await self._call_ocr_space(base64_image)

    async def _extract_from_pdf(self, file_bytes: bytes) -> str:
        images = convert_from_bytes(file_bytes, dpi=200)
        full_text = ""
        for i, img in enumerate(images):
            buf = io.BytesIO()
            img.save(buf, format='PNG')
            base64_img = base64.b64encode(buf.getvalue()).decode('utf-8')
            text = await self._call_ocr_space(base64_img)
            if text.strip():
                full_text += f"--- Page {i+1} ---\n{text}\n\n"
        return full_text.strip()

    async def _call_ocr_space(self, base64_image: str) -> str:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                "https://api.ocr.space/parse/image",
                data={
                    "apikey": OCR_API_KEY,
                    "base64Image": f"data:image/png;base64,{base64_image}",
                    "language": "eng",
                    "isOverlayRequired": False,
                    "ocrengine": 2,
                    "scale": True,
                },
            )
            if response.status_code == 200:
                data = response.json()
                if data.get("IsErroredOnProcessing"):
                    return f"OCR error: {data.get('ErrorMessage', 'unknown')}"
                results = data.get("ParsedResults", [])
                if results:
                    return results[0].get("ParsedText", "")
            return f"OCR failed: HTTP {response.status_code}"