# 🤖 Assistant — Professional Full-Stack AI Chat

A production-ready, full-stack AI chat application designed for flexibility. It prioritizes **Local AI (Ollama)** for privacy and cost, with seamless **Cloud AI Fallbacks** (Anthropic, OpenAI, Gemini, Grok, Meta) for maximum power.

---

## 🛠️ Tech Stack

| Component | Technology | Description |
| :--- | :--- | :--- |
| **Frontend** | Next.js 16, React 19, TS 7 | Modern, fast, type-safe web interface |
| **UI Library** | shadcn/ui, Tailwind CSS 4 | Clean, professional, responsive design |
| **Backend** | FastAPI, Python 3.13 | High-performance asynchronous API |
| **Package Mgr** | `uv` (Python), `npm` (JS) | Blazing fast dependency management |
| **Local AI** | Ollama | Run LLMs locally on your own hardware |
| **Cloud AI** | Various SDKs | Integration with top-tier LLM providers |

---

## 🚀 Installation & Setup Guide

Follow these steps exactly to get the project running from scratch.

### 1. Prerequisites
Before starting, ensure you have the following installed:
- **Python 3.13**: [Download Python](https://www.python.org/)
- **uv**: The fastest Python package manager. Install via:
  - *Windows:* `powershell -c "irm https://astral.sh/uv/install.ps1 | iex"`
  - *Mac/Linux:* `curl -LsSf https://astral.sh/uv/install.sh | sh`
- **Node.js 20.9+**: [Download Node.js](https://nodejs.org/)
- **Ollama** (Optional but Recommended): [Download Ollama](https://ollama.com)

---

### 2. Step-by-Step Deployment

#### Step A: Setup Local AI (The "Brain")
If you want to run models locally without paying for API keys:
1. Start the Ollama application.
2. Pull a model (e.g., Llama 3.2) to your machine:
   ```bash
   ollama pull llama3.2
   ```

#### Step B: Setup the Backend (API)
1. Open a terminal and navigate to the `api` folder:
   ```bash
   cd api
   ```
2. Install dependencies:
   ```bash
   uv sync
   ```
3. Configure Environment Variables:
   - Create a `.env` file from the example:
     ```bash
     cp .env.example .env
     ```
   - Open `.env` and add your Cloud API keys if you have them (e.g., `ANTHROPIC_API_KEY`, `OPENAI_API_KEY`).
4. Start the server:
   ```bash
   uv run fastapi dev app/main.py
   ```
   *The API is now running at `http://localhost:8000`.*

#### Step C: Setup the Frontend (Web)
1. Open a **new terminal window** and navigate to the `web` folder:
   ```bash
   cd web
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure Environment:
   - Create a `.env.local` file from the example:
     ```bash
     cp .env.example .env.local
     ```
4. Start the development server:
   ```bash
   npm run dev
   ```
   *The Web app is now running at `http://localhost:3000`.*

---

## 📖 How to Use the App

1. **Open the Browser:** Go to `http://localhost:3000`.
2. **Select a Model:** Click the model dropdown in the top bar.
   - **Auto:** The smartest choice. It tries your local Ollama models first. If none are found or if they fail, it automatically switches to your highest-priority cloud provider.
   - **Local · Ollama:** Directly select any model you have `pull`ed via Ollama.
   - **Cloud:** Select specific models from OpenAI, Anthropic, etc.
3. **Start Chatting:** Type your message in the composer. Replies stream in real-time using Server-Sent Events (SSE).

---

## ⚙️ Configuration Guide

### Changing the Default Model
To change which model the app starts with, edit `api/.env`:
```env
# Example: Set a specific cloud model as default
OPENAI_MODEL=gpt-4o
# Or a specific local model
DEFAULT_MODEL=gemma4:31b-cloud
```

### Cloud Priority Order
You can decide which cloud provider to use first by editing the `CLOUD_PRIORITY` list in `api/.env`. For example:
`CLOUD_PRIORITY=anthropic,openai,gemini`

---

## 🛠️ Troubleshooting

| Issue | Solution |
| :--- | :--- |
| **"No models loading"** | 1. Ensure Ollama is running. 2. Run `ollama pull llama3.2`. 3. Check that `.env` keys are correct. |
| **"Connection Refused"** | Ensure the backend is running on port 8000 and the frontend on 3000. |
| **"Dependency Error"** | Run `uv sync` in the `api` folder and `npm install` in the `web` folder. |
| **"Slow Replies"** | Local models depend on your GPU/RAM. Try a smaller model like `phi3` or `llama3.2:1b`. |

---

## ✅ Quality Verification
To ensure everything is working perfectly, you can run the built-in tests:
- **Backend:** `cd api && uv run pytest`
- **Frontend:** `cd web && npm run build`

## Voice mode (LiveKit)

Voice mode appears as a sound-wave button in the empty message box once the
API has LiveKit credentials. It needs a [LiveKit Cloud](https://cloud.livekit.io)
project, because speech-to-text, text-to-speech, turn detection and noise
cancellation run on LiveKit Inference.

```bash
# api/.env and agent/.env: the same three values from your LiveKit project
LIVEKIT_URL=wss://<your-project>.livekit.cloud
LIVEKIT_API_KEY=...
LIVEKIT_API_SECRET=...

# Voice agent (new terminal; API must be running)
cd agent
uv sync
uv run python voice_agent.py dev
```

With Docker: fill in agent/.env, then `docker compose --profile voice up --build`.

How a session flows:

```
Browser ──POST /api/voice/session──► API: new room + token that dispatches the agent
   │                                     (remembers the chosen model and earlier chat)
   └──WebRTC (mic + speaker)──► LiveKit ◄── agent: STT → turn detection → reply → TTS
                                                │
                                   POST /api/voice/chat  (same model dropdown,
                                   Ollama first, cloud fallback as text chat)
```

- Replies use the model picked in the dropdown, with the same fallback as
  text chat. The agent shows which model answered.
- Talking over the assistant interrupts it; **Stop** and **Esc** do too.
- Transcripts are saved into the chat (tagged *Spoken*), so a voice
  conversation can continue by typing and vice versa.
- If a model fails the assistant says so out loud and the UI shows the
  reason; if the agent is not running the UI says so after 20 seconds.
- Anyone who can reach `/api/voice/session` can start a (billed) voice
  session, so put it behind your login before going public, and set the same
  `VOICE_AGENT_TOKEN` in api/.env and agent/.env so only the agent can call
  `/api/voice/chat`.

Voice settings (agent/.env): `VOICE_STT_MODEL`, `VOICE_STT_LANGUAGE`,
`VOICE_TTS_MODEL`, `VOICE_TTS_VOICE`, `VOICE_GREETING`, `VOICE_INSTRUCTIONS`,
`VOICE_NOISE_CANCELLATION`, and `VOICE_LLM` (`app`, or a LiveKit Inference model
id to bypass the app). Offer a voice picker with `VOICE_VOICES` in api/.env.
