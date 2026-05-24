import "server-only";
import type { CookedLevel } from "@/types";
import { selectMemeTemplate } from "./selectMemeTemplate";

function deriveCaption(
  level: CookedLevel,
  brainrotDiagnosis: string,
): { top: string; bottom: string } {
  const trimmed = brainrotDiagnosis.replace(/\s+/g, " ").trim();
  const firstSentence = trimmed.split(/[.!?]/)[0] || trimmed;
  const short = firstSentence.length > 60 ? `${firstSentence.slice(0, 57)}…` : firstSentence;

  if (level === "locked-in") {
    return { top: "RESUME: LOCKED IN", bottom: short.toUpperCase() };
  }
  if (level === "mid") {
    return { top: "RESUME: MID", bottom: short.toUpperCase() };
  }
  return { top: "RESUME: COOKED", bottom: short.toUpperCase() };
}

export async function makeMeme({
  level,
  brainrotDiagnosis,
}: {
  level: CookedLevel;
  brainrotDiagnosis: string;
}): Promise<{
  memeUrl: string;
  caption: { top: string; bottom: string };
  usedFallback: boolean;
}> {
  const template = selectMemeTemplate(level);
  const caption = deriveCaption(level, brainrotDiagnosis);
  const username = process.env.IMGFLIP_USERNAME;
  const password = process.env.IMGFLIP_PASSWORD;

  if (process.env.USE_MOCKS === "1" || !username || !password) {
    return { memeUrl: template.fallbackImageUrl, caption, usedFallback: true };
  }

  try {
    const params = new URLSearchParams({
      template_id: template.id,
      username,
      password,
      text0: caption.top,
      text1: caption.bottom,
    });

    const res = await fetch("https://api.imgflip.com/caption_image", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params.toString(),
    });

    if (!res.ok) throw new Error(`Imgflip HTTP ${res.status}`);

    const data = await res.json();
    if (!data?.success || !data?.data?.url) {
      throw new Error(`Imgflip error: ${data?.error_message || "unknown"}`);
    }

    return { memeUrl: data.data.url, caption, usedFallback: false };
  } catch (err) {
    console.error("[imgflipApi] falling back to static template:", err);
    return { memeUrl: template.fallbackImageUrl, caption, usedFallback: true };
  }
}
