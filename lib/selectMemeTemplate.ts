import type { CookedLevel } from "@/types";

export type MemeTemplate = {
  id: string;
  name: string;
  fallbackImageUrl: string;
};

const TEMPLATES: Record<CookedLevel, MemeTemplate> = {
  "locked-in": {
    id: "181913649",
    name: "Drake Hotline Bling",
    fallbackImageUrl: "https://i.imgflip.com/30b1gx.jpg",
  },
  mid: {
    id: "112126428",
    name: "Distracted Boyfriend",
    fallbackImageUrl: "https://i.imgflip.com/1ur9b0.jpg",
  },
  cooked: {
    id: "61544",
    name: "This Is Fine",
    fallbackImageUrl: "https://i.imgflip.com/wxica.jpg",
  },
};

export function selectMemeTemplate(level: CookedLevel): MemeTemplate {
  return TEMPLATES[level];
}
