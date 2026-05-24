# CLAUDE.md

Guidance for AI coding agents working on **Cooked Resume / HirezzAI**.

## Project Summary

HirezzAI helps students improve job applications. The user uploads a resume
(or pastes it) and a job description, and the app pipes them through three
APIs to return a research-backed **Rizz Score**, a brutally honest analysis,
a gen-z roast, and a carousel of memes that show how cooked their application
is.

Built as a one-day hackathon MVP. Demo quality > feature count.

## Team & Roles

Three people:

1. **Lead / Glue / Deployment (Lane 1)** — repo scaffold, all `/api/*` routes,
   file extraction backend, request schemas, env vars, Vercel deploy,
   integration, merge queue.
2. **Gemini Brain (Lane 2)** — `lib/geminiApi.ts`, prompt design, ATS scoring
   methodology + research, all structured JSON output (rizz score, ick detector,
   recruiter POV, glow up plan, bullet glow up, rizz letter, meme captions).
3. **Vibe / UI / Memes (Lane 3)** — `lib/brainrotApi.ts`, `lib/imgflipApi.ts`,
   `lib/selectMemeTemplate.ts`, all visual components, rebranding pass, meme
   carousel, shareable aura card, animations, pitch deck.

Stay in your lane. If you must touch another lane's file, post in chat first.

## Tech Stack

- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS
- shadcn/ui (inlined primitives in `components/ui/*`)
- Imgflip API + Gemini API + BrainRot translation
- Deployed on Vercel

No state libraries. No ORMs. No auth libs. No DB.

## Architecture

Single page → file extraction route → orchestrator route → three chained APIs
→ one result object. Two follow-up endpoints for on-demand actions.

```
app/page.tsx
  │
  ├──POST /api/extract     (optional: file → text, pre-fills textarea)
  │
  └──POST /api/roast       (main pipeline)
        │
        ├─▶ lib/geminiApi.ts    (rizzScore, auraScore, ickDetector,
        │                       recruiterPOV, glowUpPlan, bulletGlowUp,
        │                       seriousDiagnosis, brainrot meme captions)
        ├─▶ lib/brainrotApi.ts  (gen-z translation of seriousDiagnosis)
        └─▶ lib/imgflipApi.ts   (3-meme carousel, captions from Gemini)
              │
              ▼
         RoastResult JSON

On-demand follow-ups (called after main result is shown):
  POST /api/regenerate-bullet  → one rewritten bullet
  POST /api/rizz-letter        → cover letter
```

The three core APIs form a **pipeline**, not unrelated widgets:

- **Gemini** is the brain. It does the analysis, writes the advice, AND writes
  the captions for each meme template before they're sent to Imgflip.
- **BrainRot** consumes Gemini's serious diagnosis and rewrites it in gen-z
  voice. It does not run independently.
- **Imgflip** receives Gemini's pre-written captions + level-keyed templates
  and renders the meme carousel. It does not pick captions on its own.

If you change this contract, update the `RoastResult` type and every consumer.

## File Layout (target)

```
app/
  page.tsx                    # form + result UI (client component)
  layout.tsx
  api/
    extract/route.ts          # file → text (.txt/.docx/.pdf)
    roast/route.ts            # main orchestrator
    regenerate-bullet/route.ts
    rizz-letter/route.ts
lib/
  geminiApi.ts                # analyzeResume + sub-prompts
  brainrotApi.ts              # toBrainrot(text)
  imgflipApi.ts               # makeMemeCarousel(level, captions[])
  selectMemeTemplate.ts       # level → 3 template IDs
  calculateCookedScore.ts     # blend rizz + aura → level
  prompts.ts                  # Gemini prompt templates (Lane 2 home base)
  fileExtraction.ts           # mammoth (.docx), pdf-parse (.pdf), raw (.txt)
  utils.ts                    # cn() helper
data/
  mockRoastResult.ts          # full v1 RoastResult fixture
  sampleInputs.ts             # "Try Example" content
  atsScoringRubric.ts         # documented scoring weights + sources
components/
  Header.tsx
  JobApplicationForm.tsx      # textarea + file upload + tone slider
  RoastResultCard.tsx         # top-level result composition
  RizzScoreDisplay.tsx        # headline number + animated bar
  AuraScoreDisplay.tsx        # secondary vibe score
  RizzBreakdown.tsx           # sub-ratings (replaces RatingBreakdown)
  IckDetector.tsx             # red flag chips
  MissingDrip.tsx             # missing keyword chips (was KeywordChips)
  RecruiterPOV.tsx            # 30-sec recruiter scan card
  MemeCarousel.tsx            # 3 memes, swipeable
  GlowUpPlan.tsx              # advice list with priority badges
  BulletGlowUp.tsx            # per-bullet card with 3 variants + regen + copy
  ImprovedResume.tsx          # summary + bullets, with copy-all
  RizzLetterPanel.tsx         # generate-on-click cover letter
  ShareableAuraCard.tsx       # 800px PNG-exportable card
  ToneSlider.tsx              # savage / balanced / gentle
  LoadingState.tsx
  ErrorState.tsx
types/
  index.ts                    # RoastResult, RoastRequest, all sub-types
.env.example
```

Do not invent parallel folders (`src/`, `services/`, `utils/`) unless asked.

## v1 Feature List (LOCKED — H+0)

After H+0 these are the only features we ship. Stretch goals live in a
separate list at the bottom of this file.

**Baseline pivot (must land first):**
1. Hybrid file upload (`.txt` / `.docx` / `.pdf`) → text → textarea
2. New `RoastResult` schema + gen-z rebrand of all UI labels
3. ATS-backed Rizz Score with cited methodology

**Core analysis:**
4. **Rizz Score** — ATS keyword match % (headline)
5. **Aura Score** — overall vibe (secondary)
6. **Rizz Breakdown** — sub-ratings: keyword match, quantified bullets,
   section structure, action verbs, title alignment
7. **Ick Detector** — red flags
8. **Missing Drip** — JD keywords not in resume
9. **Quantified Bullet Counter** — before / after

**The roast:**
10. **Recruiter POV** — 30-second hiring manager scan
11. **Tone Slider** — savage / balanced / gentle (Brainrot Mode)
12. **Brainrot diagnosis + serious diagnosis** (both shown)

**Fixes:**
13. **Glow Up Plan** — advice with priority levels (high / medium / quick-win)
14. **Bullet Glow Up** — 3 rewritten variants per bullet, regen + copy buttons
15. **Improved Summary** — copy-to-clipboard

**Generators:**
16. **Rizz Letter** — cover letter, generated on demand via separate endpoint

**Viral:**
17. **Meme Carousel** — 3 Imgflip memes with Gemini-written captions
18. **Shareable Aura Card** — downloadable PNG via `html-to-image`
19. **Animated Rizz Bar** — counter animation + confetti at score ≥ 75

## Stretch (only if v1 ships by H+6)

- Interview Prep Arc (5 likely questions + answers)
- Steal-a-Brainrot API experiment
- Before/after bullet diff view
- PDF download of polished resume
- History panel (localStorage)
- JD-vs-resume venn visualizer

## Cut from scope (do not build)

- Login / accounts / database
- Bag Securing Script (salary negotiation)
- Referral email generator
- LinkedIn About optimizer
- Portfolio Autopsy (web scraping a link)
- Multi-resume comparison
- Browse-other-roasts feed
- Settings / profile pages

## Naming Conventions (rebrand map)

The serious term goes in code (types, fields). The gen-z term goes in UI labels.

| Code field | UI label |
|---|---|
| `rizzScore` | Rizz Score |
| `auraScore` | Aura Score |
| `ickDetector` | Ick Detector |
| `missingDrip` | Missing Drip |
| `glowUpPlan` | The Glow Up Plan |
| `bulletGlowUp` | Bullet Glow Up |
| `recruiterPOV` | Recruiter POV |
| `rizzLetter` | Rizz Letter |
| `tone: "gentle"` | Be Gentle Mode |
| `tone: "savage"` | Brainrot Mode |
| `level: "locked-in" \| "mid" \| "cooked"` | Locked In / Mid / Cooked |

## ATS Scoring Methodology

Lane 2 owns the source research. Cite real sources (Jobscan ATS guides,
Harvard Career Services, Indeed/LinkedIn studies) before pitch day.

Suggested initial weights for the Rizz Score breakdown:

| Factor | Weight | How we score it |
|---|---|---|
| Keyword match | 35% | Gemini extracts JD keywords, counts overlap in resume |
| Quantified achievements | 20% | Count `\d+%`, `\$`, numeric tokens in bullets |
| Section structure | 15% | Gemini detects Experience/Education/Skills sections |
| Action verbs at bullet starts | 15% | Gemini checks |
| Job title alignment | 15% | Gemini compares resume titles vs JD title |

Store the weights and sources in `data/atsScoringRubric.ts` so the pitch can
reference them with file:line accuracy.

## MVP Rules (hard constraints)

- No login, no accounts.
- No database, no persistent storage.
- **Hybrid file upload allowed** (`.txt` / `.docx` / `.pdf`). Extraction
  pre-fills the textarea — the textarea remains the source of truth for the
  Gemini call. If extraction fails, the textarea stays editable so the user
  can paste.
- No third-party resume builder API. Gemini handles all rewriting.
- No third-party ATS scoring API. We score it ourselves using the rubric in
  `data/atsScoringRubric.ts`.
- No admin dashboard, analytics dashboard, or settings page.
- No unnecessary dependencies. If you reach for `npm install <thing>`, justify
  it first. Allowed additions for this scope: `mammoth`, `pdf-parse` (or
  `unpdf`), `html-to-image`, `canvas-confetti`.
- Every external API call must have a fallback to `data/mockRoastResult.ts`
  on failure.
- Keep the UI clean, funny, and demo-friendly.

## Security Rules

- **Never expose API keys on the client.** No `NEXT_PUBLIC_*` for secrets.
- All external API calls happen in `app/api/*` server routes or server-only
  `lib/*` modules imported by them.
- Read secrets from `process.env` only. Provide `.env.example` listing
  required keys (without values).
- Do not log full resume content or API responses in production paths.
- File upload route must cap upload size (e.g. 2 MB) and validate MIME type
  before passing to the extractor.

## Coding Guidelines

- TypeScript everywhere. No `any` unless commented why.
- Components stay small and single-purpose. If a component crosses ~150 lines,
  split it.
- Tailwind for styling. Reuse shadcn/ui primitives in `components/ui/*`
  instead of hand-rolling.
- Every async UI action needs a **loading state** and an **error state**. No
  silent failures.
- Don't edit files outside your lane without flagging it.
- For non-trivial changes (new route, new API, refactor across files), explain
  the plan before writing code.
- No comments that just restate the code. Comments are for non-obvious *why*.

## API Behavior

### Gemini (lib/geminiApi.ts)
- Single call returns the full `RoastResult` analysis fields in one
  schema-constrained JSON response (`responseMimeType: "application/json"`).
- The prompt receives `tone` ∈ `"savage" | "balanced" | "gentle"` and adjusts
  voice accordingly.
- Gemini also writes the meme captions (`{ top, bottom }` for each of 3
  templates) inside the same response — they get passed to Imgflip downstream.
- If Gemini returns malformed JSON, fall back to `mockRoastResult.ts`.
  No retry loops during the demo.

### BrainRot (lib/brainrotApi.ts)
- Input is Gemini's serious diagnosis. Output is the gen-z version.
- Local fallback dictionary lives in the same file — the demo cannot depend
  on the external API working.

### Imgflip (lib/imgflipApi.ts)
- Map `CookedLevel` to a small set of pre-chosen template IDs (3 per level).
- Caption text comes from Gemini, NOT from BrainRot or static strings.
- Auth uses username/password (not API key). Store in env.
- Fallback to static template URLs if Imgflip is down.

### Follow-up endpoints
- `/api/regenerate-bullet` — takes `{ originalBullet, resume, jobDescription, tone }`,
  returns `{ bullet: string }`.
- `/api/rizz-letter` — takes `{ resume, jobDescription, tone }`, returns
  `{ letter: string }`. Called only when the user clicks "Generate Rizz Letter".

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

1. **Tech Implementation** — three APIs chained intentionally; ATS scoring
   backed by cited research.
2. **User Experience** — one clear flow, no dead ends, fast feedback,
   shareable output.
3. **Pitch Delivery** — app explainable in 60 seconds, scoring methodology
   defensible.
4. **Idea Potential** — feels useful beyond the joke (Rizz Letter,
   actionable Glow Up Plan).

When in doubt between "more features" and "demo polish," pick polish.
