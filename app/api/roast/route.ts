import { NextResponse } from "next/server";
import type { RoastRequest, RoastResult, Tone } from "@/types";
import { analyzeResume } from "@/lib/geminiApi";
import { toBrainrot } from "@/lib/brainrotApi";
import { makeMemeCarousel } from "@/lib/imgflipApi";
import { calculateLevel } from "@/lib/calculateCookedScore";

export const runtime = "nodejs";

const VALID_TONES: Tone[] = ["savage", "balanced", "gentle"];

function validate(body: unknown): RoastRequest | null {
  if (!body || typeof body !== "object") return null;
  const b = body as Record<string, unknown>;
  if (typeof b.resume !== "string" || !b.resume.trim()) return null;
  const tone: Tone =
    typeof b.tone === "string" && VALID_TONES.includes(b.tone as Tone)
      ? (b.tone as Tone)
      : "balanced";
  return {
    jobTitle: typeof b.jobTitle === "string" ? b.jobTitle.trim() : "",
    jobDescription:
      typeof b.jobDescription === "string" ? b.jobDescription.trim() : "",
    resume: b.resume.trim(),
    tone,
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
      { error: "resume is required" },
      { status: 400 },
    );
  }

  try {
    const { analysis, usedFallback: geminiFallback } = await analyzeResume(input);
    const level = calculateLevel(analysis);

    const { text: brainrotDiagnosis, usedFallback: brainrotFallback } =
      await toBrainrot(analysis.seriousDiagnosis);

    const { memes, usedFallback: imgflipFallback } = await makeMemeCarousel({
      level,
      captions: analysis.memeCaptions,
      signalText: [
        input.jobTitle,
        analysis.seriousDiagnosis,
        analysis.recruiterPOV,
        ...analysis.missingDrip,
        ...analysis.ickDetector,
        ...analysis.memeCaptions.flatMap((caption) => [caption.top, caption.bottom]),
      ].join(" "),
    });

    const result: RoastResult = {
      rizzScore: analysis.rizzScore,
      auraScore: analysis.auraScore,
      level,
      rizzBreakdown: analysis.rizzBreakdown,
      missingDrip: analysis.missingDrip,
      ickDetector: analysis.ickDetector,
      recruiterPOV: analysis.recruiterPOV,
      brainrotDiagnosis,
      seriousDiagnosis: analysis.seriousDiagnosis,
      glowUpPlan: analysis.glowUpPlan,
      bulletGlowUp: analysis.bulletGlowUp,
      improvedSummary: analysis.improvedSummary,
      quantifiedBulletCount: analysis.quantifiedBulletCount,
      readyToApply: analysis.readyToApply,
      memes,
      emojiBurst: analysis.emojiBurst,
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
