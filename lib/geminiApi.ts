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
  memeCaptions: Array<{ top: string; bottom: string }>; // exactly 3, gen-z voice, ALL CAPS
};

Rules:
- Never fabricate jobs, metrics, or skills the candidate didn't mention. Rewrite what they have.
- bulletGlowUp.variants must contain exactly 3 alternatives per original bullet.
- memeCaptions must contain exactly 3 entries (one per meme slot).
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
