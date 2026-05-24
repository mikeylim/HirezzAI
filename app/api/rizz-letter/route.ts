import { NextResponse } from "next/server";
import type { RoastRequest, Tone } from "@/types";
import { generateRizzLetter } from "@/lib/geminiApi";

export const runtime = "nodejs";

const VALID_TONES: Tone[] = ["savage", "balanced", "gentle"];

function validate(body: unknown): RoastRequest | null {
  if (!body || typeof body !== "object") return null;
  const b = body as Record<string, unknown>;
  if (typeof b.jobTitle !== "string" || !b.jobTitle.trim()) return null;
  if (typeof b.jobDescription !== "string" || !b.jobDescription.trim()) return null;
  if (typeof b.resume !== "string" || !b.resume.trim()) return null;
  const tone: Tone =
    typeof b.tone === "string" && VALID_TONES.includes(b.tone as Tone)
      ? (b.tone as Tone)
      : "balanced";
  return {
    jobTitle: b.jobTitle.trim(),
    jobDescription: b.jobDescription.trim(),
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
      { error: "jobTitle, jobDescription, and resume are required" },
      { status: 400 },
    );
  }

  const { letter, usedFallback } = await generateRizzLetter(input);
  return NextResponse.json({ letter, usedFallback });
}
