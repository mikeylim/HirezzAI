# HirezzAI

> Built in ~6 hours at [Sandcastle 2026](https://sandcastle.devpost.com/) · Won People's Choice 🏆

Paste your resume + a job description. HirezzAI scores the fit, roasts the gaps in brainrot language, generates personalized memes, and gives you a rewritten resume you can actually submit.

**Live:** [hirezz-ai.vercel.app](https://hirezz-ai.vercel.app)

---

## Stack

- Next.js 15 (App Router) · TypeScript · Tailwind CSS · shadcn/ui
- Gemini `gemini-2.5-flash` — structured JSON output with resume/schema validation
- Imgflip `/caption_image` — meme rendering
- ElevenLabs — brainrot TTS voice (falls back to browser `SpeechSynthesis`)
- BrainRot API — gen-z translation (falls back to local dictionary)
- Vercel — deployment

---

## Running locally

```bash
git clone https://github.com/mikeylim/HirezzAI.git
cd HirezzAI
npm install
cp .env.example .env.local   # fill in your keys
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Required env vars

| Key | Where to get it |
|-----|----------------|
| `GEMINI_API_KEY` | [aistudio.google.com](https://aistudio.google.com) |
| `IMGFLIP_USERNAME` | [imgflip.com](https://imgflip.com) |
| `IMGFLIP_PASSWORD` | imgflip.com account password |
| `ELEVENLABS_API_KEY` | [elevenlabs.io](https://elevenlabs.io) |

All APIs have fallbacks — the app runs without any keys using mock data.

---