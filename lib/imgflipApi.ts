import "server-only";
import type { CookedLevel, Meme } from "@/types";
import { selectMemeTemplates } from "./selectMemeTemplate";

export async function makeMemeCarousel({
  level,
  captions,
}: {
  level: CookedLevel;
  captions: Array<{ top: string; bottom: string }>;
}): Promise<{ memes: Meme[]; usedFallback: boolean }> {
  const templates = selectMemeTemplates(level);
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
        imageUrl: template.fallbackImageUrl,
        topText: caption.top,
        bottomText: caption.bottom,
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
        return {
          templateId: template.id,
          imageUrl: data.data.url,
          topText: caption.top,
          bottomText: caption.bottom,
        };
      } catch (err) {
        console.error("[imgflipApi] template fallback:", err);
        anyFailed = true;
        return {
          templateId: template.id,
          imageUrl: template.fallbackImageUrl,
          topText: caption.top,
          bottomText: caption.bottom,
        };
      }
    }),
  );

  return { memes, usedFallback: anyFailed };
}
