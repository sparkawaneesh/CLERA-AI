from unsloth import FastLanguageModel
import os

# Paths — updated to match your setup
LORA_PATH = "data/finetuned-models/lora_adapter"
OUTPUT_DIR = "data/finetuned-models/aidoc-medical-v2"

# Load base model + your trained adapter
model, tokenizer = FastLanguageModel.from_pretrained(
    model_name = "unsloth/llama-3.1-8b-instruct-bnb-4bit",
    max_seq_length = 2048,
    dtype = None,
    load_in_4bit = True,
)
model.load_adapter(LORA_PATH)

# Convert to GGUF
os.makedirs(OUTPUT_DIR, exist_ok=True)
model.save_pretrained_gguf(OUTPUT_DIR, tokenizer, quantization_method = "q4_k_m")

print(f"✅ GGUF saved to {OUTPUT_DIR}")