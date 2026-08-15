import io
import torch
from PIL import Image
from transformers import VisionEncoderDecoderModel, DonutProcessor

# Absolute path to the downloaded model folder
MODEL_PATH = r"C:\Users\Ayush\Documents\AIDOC\medical-prescription-ocr\model"

class PrescriptionOCRService:
    def __init__(self):
        print("Loading Donut prescription OCR model...")
        self.processor = DonutProcessor.from_pretrained(MODEL_PATH)
        self.model = VisionEncoderDecoderModel.from_pretrained(MODEL_PATH)
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        self.model.to(self.device)
        self.model.eval()
        print(f"Model loaded on {self.device}")

    async def extract_prescription(self, file_bytes: bytes) -> dict:
        """
        Takes raw image bytes, runs the Donut OCR model.
        Returns a dict with at least 'text' field.
        """
        image = Image.open(io.BytesIO(file_bytes)).convert("RGB")
        
        # Preprocess
        encoding = self.processor(images=image, return_tensors="pt").to(self.device)
        
        # Generate
        with torch.no_grad():
            generated_ids = self.model.generate(
                encoding.pixel_values,
                max_length=512,
                num_beams=1,
                early_stopping=True,
                decoder_start_token_id=self.processor.tokenizer.convert_tokens_to_ids("<s_ocr>")
            )
        
        # Decode
        generated_text = self.processor.tokenizer.batch_decode(
            generated_ids, skip_special_tokens=True
        )[0].strip()
        
        return {"text": generated_text}