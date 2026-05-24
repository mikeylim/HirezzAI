import type { CookedLevel } from "@/types";

export type MemeTemplate = {
  id: string;
  name: string;
  fallbackImageUrl: string;
};

const TEMPLATES: Record<CookedLevel, MemeTemplate[]> = {
  "locked-in": [
    {
      id: "181913649",
      name: "Drake Hotline Bling",
      fallbackImageUrl: "https://i.imgflip.com/30b1gx.jpg",
    },
    {
      id: "131087935",
      name: "Running Away Balloon",
      fallbackImageUrl: "https://i.imgflip.com/261o3j.jpg",
    },
    {
      id: "4087833",
      name: "Waiting Skeleton",
      fallbackImageUrl: "https://i.imgflip.com/2fm6x.jpg",
    },
  ],
  mid: [
    {
      id: "112126428",
      name: "Distracted Boyfriend",
      fallbackImageUrl: "https://i.imgflip.com/1ur9b0.jpg",
    },
    {
      id: "87743020",
      name: "Two Buttons",
      fallbackImageUrl: "https://i.imgflip.com/1g8my4.jpg",
    },
    {
      id: "129242436",
      name: "Change My Mind",
      fallbackImageUrl: "https://i.imgflip.com/24y43o.jpg",
    },
  ],
  cooked: [
    {
      id: "61544",
      name: "This Is Fine",
      fallbackImageUrl: "https://i.imgflip.com/wxica.jpg",
    },
    {
      id: "61539",
      name: "First World Problems",
      fallbackImageUrl: "https://i.imgflip.com/1bhf.jpg",
    },
    {
      id: "61585",
      name: "Bad Luck Brian",
      fallbackImageUrl: "https://i.imgflip.com/1bip.jpg",
    },
  ],
};

export function selectMemeTemplates(level: CookedLevel): MemeTemplate[] {
  return TEMPLATES[level];
}
