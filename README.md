# Cooked Resume

Paste a job description + your resume. Gemini analyzes the fit, BrainRot
roasts it in internet language, and Imgflip slaps a meme on the diagnosis.

## Run locally

```bash
npm install
cp .env.example .env.local   # fill in keys you have; the rest fall back to mocks
npm run dev
```

Open http://localhost:3000.

## Scripts

- `npm run dev` — local dev server
- `npm run lint` — lint
- `npm run build` — production build

See [CLAUDE.md](./CLAUDE.md) for the full agent / contributor guide.
