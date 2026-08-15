import json
import torch
from datasets import Dataset
from unsloth import FastLanguageModel
from unsloth import is_bfloat16_supported
from trl import SFTTrainer
from transformers import TrainingArguments

# 1. Load base model (choose one bilingual base)
model, tokenizer = FastLanguageModel.from_pretrained(
    model_name = "unsloth/Llama-3.2-3B-Instruct",  # or "CohereForAI/aya-expanse-8b"
    max_seq_length = 2048,
    dtype = None,
    load_in_4bit = True,
)

# 2. Add LoRA adapters
model = FastLanguageModel.get_peft_model(
    model,
    r = 16,
    target_modules = ["q_proj", "k_proj", "v_proj", "o_proj",
                      "gate_proj", "up_proj", "down_proj"],
    lora_alpha = 16,
    lora_dropout = 0,
    bias = "none",
    use_gradient_checkpointing = "unsloth",
    random_state = 3407,
)

# 3. Load your dataset
def load_data(path):
    with open(path, "r", encoding="utf-8") as f:
        data = [json.loads(line) for line in f]
    texts = []
    for item in data:
        text = f"<|im_start|>system\n{item['instruction']}<|im_end|>\n<|im_start|>user\n{item['input']}<|im_end|>\n<|im_start|>assistant\n{item['output']}<|im_end|>"
        texts.append(text)
    return Dataset.from_dict({"text": texts})

dataset = load_data("../../data/datasets/medical_chat.jsonl")
dataset = dataset.train_test_split(test_size=0.05)

# 4. Trainer
trainer = SFTTrainer(
    model = model,
    tokenizer = tokenizer,
    train_dataset = dataset["train"],
    eval_dataset = dataset["test"],
    dataset_text_field = "text",
    max_seq_length = 2048,
    args = TrainingArguments(
        per_device_train_batch_size = 2,
        gradient_accumulation_steps = 4,
        warmup_steps = 5,
        num_train_epochs = 3,
        learning_rate = 2e-4,
        fp16 = not is_bfloat16_supported(),
        bf16 = is_bfloat16_supported(),
        logging_steps = 1,
        output_dir = "outputs",
        optim = "adamw_8bit",
        seed = 3407,
    ),
)

trainer.train()
model.save_pretrained_merged("../../data/finetuned-models/aidoc-medical-merged", tokenizer, save_method = "merged_16bit")