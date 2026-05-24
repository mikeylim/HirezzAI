import { NextResponse } from "next/server";
import type { RoastRequest, RoastResult } from "@/types";
import { analyzeResume } from "@/lib/geminiApi";
import { toBrainrot } from "@/lib/brainrotApi";
import { makeMeme } from "@/lib/imgflipApi";
import { calculateCookedScore } from "@/lib/calculateCookedScore";

export const runtime = "nodejs";

function validate(body: unknown): RoastRequest | null {
  if (!body || typeof body !== "object") return null;
  const b = body as Record<string, unknown>;
  if (typeof b.jobTitle !== "string" || !b.jobTitle.trim()) return null;
  if (typeof b.jobDescription !== "string" || !b.jobDescription.trim()) return null;
  if (typeof b.resume !== "string" || !b.resume.trim()) return null;
  return {
    jobTitle: b.jobTitle.trim(),
    jobDescription: b.jobDescription.trim(),
    resume: b.resume.trim(),
  };
}

export async function POST(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const input = validate(payload);
  if (!input) {
    return NextResponse.json(
      { error: "jobTitle, jobDescription, and resume are required" },
      { status: 400 },
    );
  }

  try {
    const { analysis, usedFallback: geminiFallback } = await analyzeResume(input);
    const { score, level } = calculateCookedScore(analysis);

    const { text: brainrotDiagnosis, usedFallback: brainrotFallback } =
      await toBrainrot(analysis.seriousDiagnosis);

    const {
      memeUrl,
      caption,
      usedFallback: imgflipFallback,
    } = await makeMeme({ level, brainrotDiagnosis });

    const result: RoastResult = {
      cookedScore: score,
      level,
      ratings: analysis.ratings,
      missingKeywords: analysis.missingKeywords,
      seriousDiagnosis: analysis.seriousDiagnosis,
      brainrotDiagnosis,
      actualAdvice: analysis.actualAdvice,
      improvedSummary: analysis.improvedSummary,
      improvedBullets: analysis.improvedBullets,
      readyToApply: analysis.readyToApply,
      memeUrl,
      memeCaption: caption,
      usedFallbacks: {
        gemini: geminiFallback,
        brainrot: brainrotFallback,
        imgflip: imgflipFallback,
      },
    };

    return NextResponse.json(result);
  } catch (err) {
    console.error("[/api/roast] unexpected error:", err);
    return NextResponse.json(
      { error: "Something went wrong cooking your resume." },
      { status: 500 },
    );
  }
}
