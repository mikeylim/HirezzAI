import "server-only";
import type { GeminiAnalysis, RoastRequest } from "@/types";
import { mockRoastResult } from "@/data/mockRoastResult";

const SYSTEM_PROMPT = `You are a strict but constructive career coach.

You will receive a job title, a job description, and a candidate's resume.
Analyze how well the resume fits the job and return ONLY JSON matching this TypeScript type:

type GeminiAnalysis = {
  overallScore: number;            // 0-100, how strong the resume is for THIS job
  ratings: Array<{                  // 3-5 dimensions
    label: string;                  // e.g. "Keyword Match", "Impact", "Clarity", "Relevance"
    score: number;                  // 0-100
    comment: string;                // one short sentence
  }>;
  missingKeywords: string[];        // keywords/skills from JD missing in resume
  seriousDiagnosis: string;         // 2-4 sentence honest assessment, professional tone
  actualAdvice: string[];           // 3-5 concrete, actionable suggestions
  improvedSummary: string;          // a rewritten resume summary tailored to the job
  improvedBullets: string[];        // 3-5 rewritten experience bullets (action + metric + result)
  readyToApply: boolean;            // true only if overallScore >= 75
};

Rules:
- Be honest. If the resume is weak, score it low.
- improvedSummary and improvedBullets must be realistic — never fabricate jobs or metrics the candidate didn't mention. Rewrite what they have more effectively.
- Return JSON only. No markdown fences. No commentary.`;

function buildUserPrompt({ jobTitle, jobDescription, resume }: RoastRequest): string {
  return `JOB TITLE:\n${jobTitle}\n\nJOB DESCRIPTION:\n${jobDescription}\n\nRESUME:\n${resume}`;
}

function mockAnalysis(): GeminiAnalysis {
  return {
    overallScore: mockRoastResult.cookedScore,
    ratings: mockRoastResult.ratings,
    missingKeywords: mockRoastResult.missingKeywords,
    seriousDiagnosis: mockRoastResult.seriousDiagnosis,
    actualAdvice: mockRoastResult.actualAdvice,
    improvedSummary: mockRoastResult.improvedSummary,
    improvedBullets: mockRoastResult.improvedBullets,
    readyToApply: mockRoastResult.readyToApply,
  };
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
      systemInstruction: { role: "system", parts: [{ text: SYSTEM_PROMPT }] },
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

    const parsed = JSON.parse(text) as GeminiAnalysis;
    if (typeof parsed.overallScore !== "number" || !Array.isArray(parsed.ratings)) {
      throw new Error("Gemini JSON shape invalid");
    }

    return { analysis: parsed, usedFallback: false };
  } catch (err) {
    console.error("[geminiApi] falling back to mock:", err);
    return { analysis: mockAnalysis(), usedFallback: true };
  }
}
