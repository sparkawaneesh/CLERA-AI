![Status](https://img.shields.io/badge/status-ongoing-yellow)
![Status](https://img.shields.io/badge/development-active-brightgreen)
![PRs](https://img.shields.io/badge/PRs-welcome-brightgreen)# CLERA – Your AI Doctor 

CLERA is a **24/7 AI health companion** that understands **English & Hindi**, cross‑questions like a real doctor, reads lab reports, and remembers your health history.  
It runs **fully offline** on your own machine using a fine‑tuned medical LLM.

---

##  Features

###  Core AI Capabilities
- **Fine‑tuned medical model**  trained on 600+ bilingual doctor‑patient conversations
- **Bilingual support** – English and Hindi
- **Cross‑questioning** – asks follow‑ups before giving advice
- **Streaming responses** – real‑time text generation
- **System prompt** with medical persona, disclaimers, and language rules

###  Chat Interface
- **3‑panel layout** – Sidebar, Middle Panel, Chat Window
- **Dark/Light mode** with persistent preference
- **Voice mode** – hands‑free conversation with Aura visualization
- **Text‑to‑Speech** Both English and Hindi with Fluency
- **Speech‑to‑Text** with silence detection
- **Interrupt handling** – tap to stop AI speaking and start listening

###  Documents & OCR
- **Document upload** – images and PDFs
- **OCR extraction**
- **Document viewer** 

###  Dashboard & Health Tracking
- **Key vitals widget** (heart rate, BP, weight, sleep, steps, blood sugar)
- **Active medications tracker**
- **Smart Prompts** – context‑aware health alerts (e.g., “You started Amoxicillin 2 days ago. Any side effects?”)
- **Interaction Checker** – quickly test for drug‑drug interactions
- **Resizable panels** and persistent layout

###  Profile & Memory
- **Patient memory** – name, age, medical history, lifestyle, metrics
- **Chat history** saved locally


###  Settings
- Model selection, language toggle, theme toggle
-Clear all data option




🔜 Upcoming Features

**Google Fit / Apple Health real API sync**
**Mobile responsive design**
**RAG medical knowledge base**
**Prescription‑specific OCR parsing**
**Telemedicine / appointment scheduling**
**End‑to‑end encryption for medical data**


📋 Prerequisites

- **Python 3.10+**  
- **Node.js 18+**  
- **Ollama** – [download here](https://ollama.com/) and install it.  
- **Git** – to clone the repository.  
- **Google Colab account** (free) – only needed if you want to train your own model.  




## 🚀 Quick Start
```
### 1. Clone the repo
bash
git clone https://github.com/yourusername/AIDOC.git
cd AIDOC


2.Install Frontend
cd backend
python -m venv .venv
.venv\Scripts\activate      # Windows
pip install -r requirements.txt


3. Install frontend
bash
cd frontend
npm install


4. Download the model
NOTE:  The fine‑tuned model is not stored in this repo due to its size.
Download the merged GGUF file from your‑link‑or‑instructions and place it in data/finetuned-models/.


5. Set up Ollama
bash
ollama create model_name -f Modelfile   # Modelfile points to the downloaded GGUF
6. Run
TERMINAL 1:
Backend: cd backend && uvicorn app.main:app --reload
TERMINAL 2:
Frontend: cd frontend && npm run dev

Open http://localhost:3000
```


🧪 Train Your Own Medical Model (Full Pipeline)
If you want to train a model on your own data or reproduce the AIDOC model, follow these steps.
```
1. Prepare your dataset
Your dataset must be a JSONL file (one JSON object per line) with this format:


json
{
  "instruction": "You are AIDOC, a holistic AI doctor specializing in lifestyle medicine. Provide evidence-based guidance on nutrition, exercise, sleep, and stress management. Emphasize sustainable changes over quick fixes. Always recommend consulting healthcare providers before starting new exercise or supplement regimens.",
  "input": "Patient: <patient's message>",
  "output": "<AIDOC's response>"
}
The repository already contains data/datasets/medical_chat.jsonl which you can use directly.

2. Fine‑tune on Google Colab (free GPU)
Open a new Colab notebook (Runtime → Change runtime type → T4 GPU).

Paste the complete training cell (provided in data/training/train_llm.py) and run it.
When prompted, upload your medical_chat.jsonl.
Training takes ~25‑40 minutes for 600 examples on a T4 GPU.
After training, a ZIP file (lora_adapter.zip) will be downloaded automatically.
Save it to your PC – this contains the trained LoRA adapter.

3. Extract the LoRA adapter
bash
cd C:\Users\Ayush\Documents\AIDOC\data\finetuned-models
# Extract the zip
Expand-Archive -Path "lora_adapter.zip" -DestinationPath "lora_adapter"
Now you have a folder lora_adapter/ containing adapter_config.json and adapter_model.safetensors.

4. Convert the LoRA adapter to a GGUF file
Use the conversion tools provided in tools/llama-cpp-convert/:

bash
# Install converter dependencies
pip install -r tools/llama-cpp-convert/requirements/requirements-convert_lora_to_gguf.txt

# Convert the adapter (replace base‑model‑id with the model you fine‑tuned)
python tools/llama-cpp-convert/convert_lora_to_gguf.py data/finetuned-models/lora_adapter \
  --outfile data/finetuned-models/your-model.gguf \
  --outtype f16 \
  --base-model-id unsloth/qwen2.5-3b-instruct   # or unsloth/llama-3.1-8b-instruct
This produces an adapter GGUF (~80‑100 MB).

5. (Optional) Merge adapter with base model for a single file
If you want a single GGUF that doesn’t require an external base model, merge them on Colab:

python
from unsloth import FastLanguageModel
model, tokenizer = FastLanguageModel.from_pretrained(
    model_name="unsloth/llama-3.1-8b-instruct",
    max_seq_length=2048,
    dtype=None,
    load_in_4bit=False,  # full precision for merging
)
model.load_adapter("lora_adapter")
model.save_pretrained_merged("merged_model", tokenizer, save_method="merged_16bit")
# Then use convert_hf_to_gguf.py on the merged_model folder.
6. Create Ollama model from the GGUF
Place the GGUF file in data/finetuned-models/ and create a Modelfile:

text
FROM ./your-model.gguf
Then:

bash
ollama create your-model-name -f Modelfile
ollama run your-model-name
7. Configure AIDOC to use the new model
Edit backend/app/services/ai_service.py and change the "model" field to "your-model-name".
Restart the backend, and the frontend will use your custom model.

🛠 Model Conversion Tools (included)
For advanced users, the repository bundles the necessary conversion scripts from llama.cpp inside tools/llama-cpp-convert/:

convert_hf_to_gguf.py – full HuggingFace model → GGUF

convert_lora_to_gguf.py – LoRA adapter → GGUF
```
```
Dependencies:
bash
pip install -r tools/llama-cpp-convert/requirements/requirements-convert_lora_to_gguf.txt
```

⚖️ Disclaimer
AIDOC is an educational and informational tool. It does not replace a licensed physician.
Always consult a real doctor before making medical decisions.

