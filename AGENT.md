# AGENT.md

Codex guidance for **Cooked Resume / HirezzAI**.

## Mission

Build a hackathon MVP that is funny enough to demo and useful enough to
defend. The app helps students and junior developers paste a job description
and resume, then returns a practical application report:

- Rizz Score: ATS-style fit.
- Aura Score: resume quality and overall signal.
- Ick Detector: red flags.
- Missing Drip: keywords missing from the resume.
- Recruiter POV: fast hiring-manager scan.
- Brainrot diagnosis: funny translation of serious feedback.
- Meme Carousel: Imgflip memes captioned with Gemini-generated text.
- Glow Up Plan, Bullet Glow Up, Improved Summary, and Rizz Letter.

Demo quality beats feature count.

## Current Stack

- Next.js 15 App Router
- TypeScript
- Tailwind CSS
- shadcn-style local primitives in `components/ui/*`
- Gemini API for analysis, scoring, rewriting, and meme captions
- BrainRot API or local fallback for gen-z translation
- Imgflip API for rendered memes
- No auth, database, ORM, or state library

## Codex Workflow

- Read the local code before changing behavior.
- Keep edits scoped to the requested feature.
- Preserve `CLAUDE.md`; it is historical project guidance and future reference.
- Prefer existing patterns and components over new abstractions.
- Use `rg` / `rg --files` for search.
- Use `apply_patch` for manual edits.
- Do not revert user changes or unrelated work.
- For non-trivial changes, explain the plan before editing.
- Run `npm run build` before calling a code task done.
- `npm run lint` may require ESLint migration in this repo; do not accept
  interactive config prompts unless explicitly asked.

## Architecture

The app is one pipeline, not separate widgets:

```txt
app/page.tsx
  -> POST /api/roast
       -> lib/geminiApi.ts   serious analysis + structured JSON + meme captions
       -> lib/brainrotApi.ts brainrot translation of seriousDiagnosis
       -> lib/imgflipApi.ts  rendered meme URLs from template IDs + captions
  -> POST /api/rizz-letter   on-demand cover letter
```

External API calls must remain server-side. Never expose secrets through
`NEXT_PUBLIC_*`.

## Important Files

- `app/page.tsx`: form, loading/error state, result composition.
- `app/api/roast/route.ts`: main orchestrator route.
- `app/api/rizz-letter/route.ts`: on-demand cover letter route.
- `lib/geminiApi.ts`: Gemini prompt/schema and Rizz Letter generation.
- `lib/brainrotApi.ts`: BrainRot call and local fallback.
- `lib/imgflipApi.ts`: Imgflip `/caption_image` integration.
- `lib/selectMemeTemplate.ts`: level-specific meme templates.
- `types/index.ts`: shared request/result contracts.
- `data/mockRoastResult.ts`: demo fallback data.
- `components/RoastResultCard.tsx`: current result UI.

## Product Rules

- Keep the first result screen showy: score, meme, roast, and clear next action.
- The meme feature must feel personalized. Captions come from Gemini and are
  sent to Imgflip, not hardcoded in the frontend.
- Do not send full private resume text to BrainRot or meme captions when a
  summarized diagnosis is enough.
- If an API fails, fall back gracefully. The demo should still work.
- Keep the language funny but actionable. The joke should lead into a fix.

## Imgflip Contract

Use the free `https://api.imgflip.com/caption_image` endpoint:

- POST form-urlencoded body.
- Required fields: `template_id`, `username`, `password`.
- Use `text0` and `text1` for standard two-caption memes.
- Keep credentials in `IMGFLIP_USERNAME` and `IMGFLIP_PASSWORD`.
- Store fallback image URLs so the UI still renders without credentials.

Template choice lives in `lib/selectMemeTemplate.ts`. Gemini captions must match
the selected template order for the relevant cooked level.

## V1 Scope

Keep:

- Paste job description and resume.
- `.txt` upload as convenience.
- Tone selector: Brainrot Mode, Balanced, Be Gentle.
- Rizz Score, Aura Score, Rizz Breakdown.
- Missing Drip, Ick Detector, Quantified Bullet Counter.
- Recruiter POV, serious diagnosis, brainrot diagnosis.
- Glow Up Plan, Bullet Glow Up, Improved Summary.
- Rizz Letter.
- Meme Carousel and shareable aura copy.

Do not build unless explicitly asked:

- Accounts, login, database, history backend.
- Salary negotiation script.
- Referral email generator.
- LinkedIn optimizer.
- Portfolio scraping/autopsy.
- Multi-resume comparison.
- Browse-other-roasts feed.

## Quality Bar

- TypeScript everywhere.
- No unnecessary dependencies.
- Every async UI action has loading and error states.
- Keep UI text short, scannable, and demo-ready.
- For generated resume content, do not invent jobs, metrics, or skills the
  user did not provide.
- Build must pass before handoff.
