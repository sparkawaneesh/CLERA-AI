from unsloth import FastLanguageModel
import os

model, tokenizer = FastLanguageModel.from_pretrained(
    model_name = "unsloth/llama-3.1-8b-instruct-bnb-4bit",
    max_seq_length = 2048,
    dtype = None,
    load_in_4bit = True,
)

model.load_adapter("data/finetuned-models/lora_adapter")

output_dir = "data/finetuned-models/aidoc-medical-v2-merged"
os.makedirs(output_dir, exist_ok=True)

model.save_pretrained_gguf(output_dir, tokenizer, quantization_method = "q4_k_m")
print(f"Merged GGUF saved to {output_dir}")