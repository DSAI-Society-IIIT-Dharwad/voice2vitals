# 🔑 API Keys Setup Guide
> Complete this once. Everything else is already handled automatically.

---

## You Need Exactly 2 Keys

| Key | Used For | Free? |
|-----|----------|-------|
| `GROQ_API_KEY` | Whisper transcription + Llama 3 prescription | ✅ Free |
| `HF_TOKEN` | Downloading the pyannote diarization model | ✅ Free |

---

## Key 1 — GROQ_API_KEY

### Steps:
1. Open your browser → go to **https://console.groq.com**
2. Click **"Sign Up"** (or Log In if you have an account)
3. After login, click **"API Keys"** in the left sidebar
4. Click **"Create API Key"**
5. Give it a name like `clinical-ai`
6. **Copy the key immediately** — it starts with `gsk_...`
   > ⚠️ You can only see it ONCE. Copy it now.

### Paste it into your `.env` file:
```
GROQ_API_KEY=gsk_your_actual_key_here
```

---

## Key 2 — HF_TOKEN (Hugging Face)

### Part A — Get the token:
1. Go to **https://huggingface.co** → Sign Up / Log In
2. Click your profile picture (top right) → **"Settings"**
3. Click **"Access Tokens"** in the left sidebar
4. Click **"New token"**
5. Name it `clinical-ai`, set Role to **"Read"**
6. Click **"Generate a token"**
7. **Copy the token** — it starts with `hf_...`

### Part B — Accept the model terms (REQUIRED):
> Without this step, the download will be blocked even with a valid token.

1. Go to this exact URL while logged in to Hugging Face:
   **https://huggingface.co/pyannote/speaker-diarization-3.1**
2. You will see a license agreement page
3. Click **"Agree and access repository"**
4. ✅ Done — your token now has access

### Paste it into your `.env` file:
```
HF_TOKEN=hf_your_actual_token_here
```

---

## Final `.env` File Should Look Like This:

```env
GROQ_API_KEY=gsk_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
HF_TOKEN=hf_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

> 📁 The `.env` file is located at: `d:\AI\.env`
> Open it in VS Code and replace the placeholder values with your real keys.

---

## ✅ Checklist Before Running

- [X] Got `GROQ_API_KEY` from console.groq.com
- [X] Got `HF_TOKEN` from huggingface.co/settings/tokens
- [X] Accepted pyannote model terms at huggingface.co/pyannote/speaker-diarization-3.1
- [X] Pasted both keys into `d:\AI\.env`
- [ ] Tell me when done — I will run the final test for you
everything is done
---

*Everything else (packages, CUDA, dependencies) has been set up automatically.*
