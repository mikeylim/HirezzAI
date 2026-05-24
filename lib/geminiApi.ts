import "server-only";
import type { GeminiAnalysis, RoastRequest } from "@/types";
import { mockRoastResult } from "@/data/mockRoastResult";

function toneInstruction(tone: RoastRequest["tone"]): string {
  switch (tone) {
    case "savage":
      return "Tone: brutally honest, sharp, no sugar-coating. Roast where it hurts but stay constructive.";
    case "gentle":
      return "Tone: supportive and encouraging. Frame weaknesses as growth areas.";
    default:
      return "Tone: honest and professional. Direct but not harsh.";
  }
}

function buildSystemPrompt(tone: RoastRequest["tone"]): string {
  return `You are a strict but fair career coach scoring resumes against job descriptions.

${toneInstruction(tone)}

Return ONLY JSON matching this TypeScript type. No markdown, no commentary.

Meme template order by likely result level:
- locked-in: Drake Hotline Bling, Running Away Balloon, Waiting Skeleton
- mid: Distracted Boyfriend, Two Buttons, Change My Mind
- cooked: This Is Fine, First World Problems, Bad Luck Brian

type GeminiAnalysis = {
  rizzScore: number;              // 0-100, ATS-style keyword + structure match
  auraScore: number;              // 0-100, overall vibe / quality of writing
  rizzBreakdown: {
    keywordMatch: number;         // 0-100
    quantifiedBullets: number;    // 0-100 (how many bullets have numbers)
    sectionStructure: number;     // 0-100 (Experience/Education/Skills present)
    actionVerbs: number;          // 0-100 (bullets start with strong verbs)
    titleAlignment: number;       // 0-100 (resume titles match JD title)
  };
  missingDrip: string[];          // JD keywords NOT in resume
  ickDetector: string[];          // 3-5 specific red flags
  recruiterPOV: string;           // 2-3 sentences: what a recruiter thinks in 7 seconds
  seriousDiagnosis: string;       // 2-4 sentence honest assessment
  glowUpPlan: Array<{ advice: string; priority: "high" | "medium" | "quick-win" }>;
  bulletGlowUp: Array<{ original: string; variants: string[] /* exactly 3 */ }>;
  improvedSummary: string;
  quantifiedBulletCount: { before: number; after: number };
  readyToApply: boolean;          // true only if rizzScore >= 75
  memeCaptions: Array<{ top: string; bottom: string }>; // exactly 3, gen-z voice, ALL CAPS, matched to the chosen level's template order
};

Rules:
- Never fabricate jobs, metrics, or skills the candidate didn't mention. Rewrite what they have.
- bulletGlowUp.variants must contain exactly 3 alternatives per original bullet.
- memeCaptions must contain exactly 3 entries for the likely result level based on your scores.
- Caption slot 1 must fit the first template listed for that level, slot 2 the second template, slot 3 the third template.
- Captions should be specific to the JD/resume gap but must not expose private resume details.
- Keep meme caption lines short: max 70 characters per top/bottom line.
- Return JSON only.`;
}

function buildUserPrompt({
  jobTitle,
  jobDescription,
  resume,
}: RoastRequest): string {
  return `JOB TITLE:\n${jobTitle}\n\nJOB DESCRIPTION:\n${jobDescription}\n\nRESUME:\n${resume}`;
}

function mockAnalysis(): GeminiAnalysis {
  return {
    rizzScore: mockRoastResult.rizzScore,
    auraScore: mockRoastResult.auraScore,
    rizzBreakdown: mockRoastResult.rizzBreakdown,
    missingDrip: mockRoastResult.missingDrip,
    ickDetector: mockRoastResult.ickDetector,
    recruiterPOV: mockRoastResult.recruiterPOV,
    seriousDiagnosis: mockRoastResult.seriousDiagnosis,
    glowUpPlan: mockRoastResult.glowUpPlan,
    bulletGlowUp: mockRoastResult.bulletGlowUp,
    improvedSummary: mockRoastResult.improvedSummary,
    quantifiedBulletCount: mockRoastResult.quantifiedBulletCount,
    readyToApply: mockRoastResult.readyToApply,
    memeCaptions: mockRoastResult.memes.map((m) => ({
      top: m.topText,
      bottom: m.bottomText,
    })),
  };
}

function isValidAnalysis(x: unknown): x is GeminiAnalysis {
  if (!x || typeof x !== "object") return false;
  const a = x as Record<string, unknown>;
  return (
    typeof a.rizzScore === "number" &&
    typeof a.auraScore === "number" &&
    Array.isArray(a.missingDrip) &&
    Array.isArray(a.ickDetector) &&
    typeof a.recruiterPOV === "string" &&
    Array.isArray(a.glowUpPlan) &&
    Array.isArray(a.bulletGlowUp) &&
    Array.isArray(a.memeCaptions)
  );
}

export async function analyzeResume(
  req: RoastRequest,
): Promise<{ analysis: GeminiAnalysis; usedFallback: boolean }> {
  const apiKey = process.env.GEMINI_API_KEY;
  const model = process.env.GEMINI_MODEL || "gemini-2.0-flash";

  if (process.env.USE_MOCKS === "1" || !apiKey) {
    return { analysis: mockAnalysis(), usedFallback: true };
  }

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    const body = {
      systemInstruction: {
        role: "system",
        parts: [{ text: buildSystemPrompt(req.tone) }],
      },
      contents: [{ role: "user", parts: [{ text: buildUserPrompt(req) }] }],
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.7,
      },
    };

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(`Gemini HTTP ${res.status}`);

    const data = await res.json();
    const text: string | undefined =
      data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) throw new Error("Gemini returned no text");

    const parsed = JSON.parse(text);
    if (!isValidAnalysis(parsed)) throw new Error("Gemini JSON shape invalid");

    return { analysis: parsed, usedFallback: false };
  } catch (err) {
    console.error("[geminiApi] falling back to mock:", err);
    return { analysis: mockAnalysis(), usedFallback: true };
  }
}

export async function generateRizzLetter(
  req: RoastRequest,
): Promise<{ letter: string; usedFallback: boolean }> {
  const apiKey = process.env.GEMINI_API_KEY;
  const model = process.env.GEMINI_MODEL || "gemini-2.0-flash";

  if (process.env.USE_MOCKS === "1" || !apiKey) {
    return {
      letter:
        "Dear Hiring Team,\n\nI am excited to apply for this role because my background aligns with the hands-on web development work described in the posting. My projects show practical experience building user-facing features, collaborating across requirements, and improving my work through feedback.\n\nI would bring a fast-learning, product-minded approach to the team and would welcome the chance to discuss how my experience maps to your current needs.\n\nSincerely,\nYour Candidate",
      usedFallback: true,
    };
  }

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    const body = {
      systemInstruction: {
        role: "system",
        parts: [
          {
            text: `You write concise, professional cover letters for junior candidates.
${toneInstruction(req.tone)}

Return ONLY the letter text. Do not invent company names, metrics, or experience.`,
          },
        ],
      },
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `JOB TITLE:\n${req.jobTitle}\n\nJOB DESCRIPTION:\n${req.jobDescription}\n\nRESUME:\n${req.resume}`,
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.65,
      },
    };

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(`Gemini HTTP ${res.status}`);

    const data = await res.json();
    const text: string | undefined =
      data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) throw new Error("Gemini returned no letter");

    return { letter: text.trim(), usedFallback: false };
  } catch (err) {
    console.error("[geminiApi] rizz letter fallback:", err);
    return {
      letter:
        "Dear Hiring Team,\n\nI am excited to apply for this role. My background includes relevant project work, technical learning, and a strong interest in building useful products with a collaborative team.\n\nI would appreciate the opportunity to discuss how my experience and growth mindset can support your team.\n\nSincerely,\nYour Candidate",
      usedFallback: true,
    };
  }
}
