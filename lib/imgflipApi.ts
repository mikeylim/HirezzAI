import "server-only";
import type { CookedLevel, Meme } from "@/types";
import { selectMemeTemplates } from "./selectMemeTemplate";

function cleanCaption(text: string): string {
  return text
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 90)
    .toUpperCase();
}

export async function makeMemeCarousel({
  level,
  captions,
  signalText,
}: {
  level: CookedLevel;
  captions: Array<{ top: string; bottom: string }>;
  signalText: string;
}): Promise<{ memes: Meme[]; usedFallback: boolean }> {
  const templates = selectMemeTemplates({ level, signalText });
  const username = process.env.IMGFLIP_USERNAME;
  const password = process.env.IMGFLIP_PASSWORD;

  const paired = templates.map((tpl, i) => ({
    template: tpl,
    caption: captions[i] ?? captions[0] ?? { top: "", bottom: "" },
  }));

  if (process.env.USE_MOCKS === "1" || !username || !password) {
    return {
      memes: paired.map(({ template, caption }) => ({
        templateId: template.id,
        templateName: template.name,
        imageUrl: template.fallbackImageUrl,
        topText: cleanCaption(caption.top),
        bottomText: cleanCaption(caption.bottom),
      })),
      usedFallback: true,
    };
  }

  let anyFailed = false;
  const memes = await Promise.all(
    paired.map(async ({ template, caption }): Promise<Meme> => {
      try {
        const params = new URLSearchParams({
          template_id: template.id,
          username,
          password,
          text0: cleanCaption(caption.top),
          text1: cleanCaption(caption.bottom),
          font: "impact",
          max_font_size: "42",
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
        return {
          templateId: template.id,
          templateName: template.name,
          imageUrl: data.data.url,
          topText: cleanCaption(caption.top),
          bottomText: cleanCaption(caption.bottom),
        };
      } catch (err) {
        console.error("[imgflipApi] template fallback:", err);
        anyFailed = true;
        return {
          templateId: template.id,
          templateName: template.name,
          imageUrl: template.fallbackImageUrl,
          topText: cleanCaption(caption.top),
          bottomText: cleanCaption(caption.bottom),
        };
      }
    }),
  );

  return { memes, usedFallback: anyFailed };
}
