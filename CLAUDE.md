# AGENTS.md

Guidance for AI coding agents working on **Cooked Resume**.

## Project Summary

Cooked Resume helps students improve job applications. The user pastes a resume
and a job description, and the app pipes them through three APIs to return a
serious analysis, a funny diagnosis, and a meme verdict.

Built as a one-day hackathon MVP. Demo quality > feature count.

## Team & Roles

Three people:

1. **Lead / Integration / Deployment** — repo scaffold, `/api/cook` orchestrator,
   wiring, Vercel deploy, env vars.
2. **Gemini Resume Analysis + Resume Builder** — `lib/gemini.ts`, prompt design,
   structured JSON output (scoring, missing keywords, improved summary/bullets,
   ready-to-apply flag).
3. **BrainRot + Imgflip + Frontend/Pitch support** — `lib/brainrot.ts`,
   `lib/imgflip.ts`, form and result components, pitch deck.

Stay in your lane. If you must touch another lane's file, say so first.

## Tech Stack

- Next.js (App Router)
- TypeScript
- Tailwind CSS
- shadcn/ui
- Deployed on Vercel

No other frameworks. No state libraries. No ORMs. No auth libs.

## Architecture

Single page → single server route → three chained APIs → one result object.

```
app/page.tsx  ──POST──▶  app/api/cook/route.ts
                              │
                              ├─▶ lib/gemini.ts    (serious analysis + rebuild)
                              ├─▶ lib/brainrot.ts  (funny diagnosis)
                              └─▶ lib/imgflip.ts   (meme image)
                              │
                              ▼
                         CookResult JSON
```

The three APIs form a **pipeline**, not unrelated widgets:

- **Gemini** produces the serious analysis: score, ratings, missing keywords,
  improved summary, improved bullets, ready-to-apply decision.
- **BrainRot** consumes Gemini's diagnosis text and rewrites it in brainrot
  language. It does not run independently of Gemini's output.
- **Imgflip** takes the application status (level + a short caption derived
  from Gemini + BrainRot) and renders a meme. It does not pick captions on
  its own.

If you change this contract, update the `CookResult` type and every consumer.

## File Layout (target)

```
app/
  page.tsx              # form + result UI (client component)
  layout.tsx
  api/cook/route.ts     # orchestrator: Gemini → BrainRot → Imgflip
lib/
  gemini.ts             # analyzeResume(resume, jd)
  brainrot.ts           # toBrainrot(text)
  imgflip.ts            # makeMeme(level, caption)
  prompts.ts            # Gemini prompt templates
  types.ts              # CookResult, GeminiAnalysis, CookedLevel
  mocks.ts              # fallback fixtures
components/
  ResumeForm.tsx
  CookedResult.tsx
  CookedLevel.tsx
```

Do not invent parallel folders (`src/`, `services/`, `utils/`) unless asked.

## MVP Rules (hard constraints)

- No login, no accounts.
- No database, no persistent storage.
- No full PDF parser — input is a plain `<textarea>`.
- No third-party resume builder API. Gemini handles all rewriting.
- No admin dashboard, analytics dashboard, or settings page.
- No unnecessary dependencies. If you reach for `npm install <thing>`, justify
  it first.
- Every external API call must have a fallback to `lib/mocks.ts` on failure.
- Keep the UI clean, funny, and demo-friendly. Brainrot copy is on-brand.

## Security Rules

- **Never expose API keys on the client.** No `NEXT_PUBLIC_*` for secrets.
- All external API calls happen in `app/api/*` server routes or server-only
  `lib/*` modules imported by them.
- Read secrets from `process.env` only. Provide `.env.local.example` listing
  required keys (without values).
- Do not log full resume content or API responses to the console in production
  paths.

## Coding Guidelines

- TypeScript everywhere. No `any` unless commented why.
- Components stay small and single-purpose. If a component crosses ~150 lines,
  split it.
- Tailwind for styling. Reuse shadcn/ui primitives instead of hand-rolling
  buttons, cards, badges, progress bars.
- Every async UI action needs a **loading state** and an **error state**. No
  silent failures.
- Don't edit files outside your role's scope without flagging it.
- For non-trivial changes (new route, new API, refactor across files), explain
  the plan before writing code.
- No comments that just restate the code. Comments are for non-obvious *why*.

## API Behavior

### Gemini
- Use schema-constrained JSON output (`responseMimeType: "application/json"`
  with a response schema) so the orchestrator can trust the shape.
- If Gemini returns malformed JSON, fall back to `mocks.ts` rather than
  retry-looping during a demo.

### BrainRot
- Input is Gemini's plain-English diagnosis. Output is the same meaning in
  brainrot voice.
- If the external API is down or unstable, ship a local fallback (regex/
  dictionary swap) inside `lib/brainrot.ts` so the demo never breaks.

### Imgflip
- Map `CookedLevel` (`"locked-in" | "mid" | "cooked"`) to a small set of
  pre-chosen template IDs.
- Caption text comes from BrainRot output, trimmed for meme length.
- Auth uses username/password (not API key). Store in env, never in code.

## Commands

```bash
npm install      # install deps
npm run dev      # local dev server
npm run lint     # lint check — run before pushing
npm run build    # production build — must pass before deploy
```

Before opening a PR or marking a task done, run `npm run lint` and
`npm run build`.

## Judging Rubric (what we optimize for)

1. **Tech Implementation** — the three APIs must visibly chain together.
2. **User Experience** — one clear flow, no dead ends, fast feedback.
3. **Pitch Delivery** — the app must be explainable in 60 seconds.
4. **Idea Potential** — feels useful beyond the joke.

When in doubt between "more features" and "demo polish," pick polish.
