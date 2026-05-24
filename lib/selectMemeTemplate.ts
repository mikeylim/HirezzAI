import type { CookedLevel } from "@/types";

export type MemeTemplate = {
  id: string;
  name: string;
  fallbackImageUrl: string;
  levels: CookedLevel[];
  tags: string[];
};

const TEMPLATE_CATALOG: MemeTemplate[] = [
  {
    id: "181913649",
    name: "Drake Hotline Bling",
    fallbackImageUrl: "https://imgflip.com/s/meme/Drake-Hotline-Bling.jpg",
    levels: ["locked-in", "mid"],
    tags: ["before after", "reject accept", "upgrade", "glow up", "rewrite"],
  },
  {
    id: "87743020",
    name: "Two Buttons",
    fallbackImageUrl: "https://imgflip.com/s/meme/Two-Buttons.jpg",
    levels: ["mid", "cooked"],
    tags: ["choice", "dilemma", "missing keywords", "generic", "metrics"],
  },
  {
    id: "112126428",
    name: "Distracted Boyfriend",
    fallbackImageUrl: "https://imgflip.com/s/meme/Distracted-Boyfriend.jpg",
    levels: ["mid"],
    tags: ["distraction", "wrong focus", "generic", "keywords", "ats"],
  },
  {
    id: "124822590",
    name: "Left Exit 12 Off Ramp",
    fallbackImageUrl: "https://imgflip.com/s/meme/Left-Exit-12-Off-Ramp.jpg",
    levels: ["mid", "cooked"],
    tags: ["sudden turn", "career pivot", "missing", "wrong direction", "apply"],
  },
  {
    id: "129242436",
    name: "Change My Mind",
    fallbackImageUrl: "https://imgflip.com/s/meme/Change-My-Mind.jpg",
    levels: ["locked-in", "mid"],
    tags: ["hot take", "argument", "claim", "strong opinion", "ready"],
  },
  {
    id: "217743513",
    name: "UNO Draw 25 Cards",
    fallbackImageUrl: "https://imgflip.com/s/meme/UNO-Draw-25-Cards.jpg",
    levels: ["mid", "cooked"],
    tags: ["avoid", "refuse", "metrics", "quantified", "action verbs"],
  },
  {
    id: "131087935",
    name: "Running Away Balloon",
    fallbackImageUrl: "https://imgflip.com/s/meme/Running-Away-Balloon.jpg",
    levels: ["locked-in", "mid"],
    tags: ["chasing", "opportunity", "job offer", "skills", "fit"],
  },
  {
    id: "4087833",
    name: "Waiting Skeleton",
    fallbackImageUrl: "https://imgflip.com/s/meme/Waiting-Skeleton.jpg",
    levels: ["mid", "cooked"],
    tags: ["waiting", "no response", "ghosted", "application", "recruiter"],
  },
  {
    id: "61579",
    name: "One Does Not Simply",
    fallbackImageUrl: "https://imgflip.com/s/meme/One-Does-Not-Simply.jpg",
    levels: ["mid", "cooked"],
    tags: ["ats", "keywords", "generic", "resume", "apply"],
  },
  {
    id: "93895088",
    name: "Expanding Brain",
    fallbackImageUrl: "https://imgflip.com/s/meme/Expanding-Brain.jpg",
    levels: ["locked-in", "mid"],
    tags: ["levels", "improvement", "glow up", "strategy", "upgrade"],
  },
  {
    id: "1035805",
    name: "Boardroom Meeting Suggestion",
    fallbackImageUrl: "https://imgflip.com/s/meme/Boardroom-Meeting-Suggestion.jpg",
    levels: ["mid", "cooked"],
    tags: ["bad idea", "team", "ignored", "metrics", "specificity"],
  },
  {
    id: "247375501",
    name: "Buff Doge vs. Cheems",
    fallbackImageUrl: "https://imgflip.com/s/meme/Buff-Doge-vs-Cheems.png",
    levels: ["locked-in", "mid"],
    tags: ["before after", "strong weak", "improved", "skills", "proof"],
  },
  {
    id: "101470",
    name: "Ancient Aliens",
    fallbackImageUrl: "https://imgflip.com/s/meme/Ancient-Aliens.jpg",
    levels: ["mid", "cooked"],
    tags: ["mystery", "unclear", "vague", "no proof", "confusing"],
  },
  {
    id: "89370399",
    name: "Roll Safe Think About It",
    fallbackImageUrl: "https://imgflip.com/s/meme/Roll-Safe-Think-About-It.jpg",
    levels: ["mid", "cooked"],
    tags: ["logic", "bad strategy", "avoid", "missing", "clever"],
  },
  {
    id: "61520",
    name: "Futurama Fry",
    fallbackImageUrl: "https://imgflip.com/s/meme/Futurama-Fry.jpg",
    levels: ["mid", "cooked"],
    tags: ["not sure", "unclear", "confusing", "vague", "fit"],
  },
  {
    id: "180190441",
    name: "They're The Same Picture",
    fallbackImageUrl: "https://imgflip.com/s/meme/Theyre-The-Same-Picture.jpg",
    levels: ["mid", "cooked"],
    tags: ["generic", "same", "template", "copy paste", "not tailored"],
  },
  {
    id: "55311130",
    name: "This Is Fine",
    fallbackImageUrl: "https://imgflip.com/s/meme/This-Is-Fine.jpg",
    levels: ["cooked"],
    tags: ["cooked", "bad", "red flags", "panic", "missing"],
  },
  {
    id: "61585",
    name: "Bad Luck Brian",
    fallbackImageUrl: "https://imgflip.com/s/meme/Bad-Luck-Brian.jpg",
    levels: ["cooked"],
    tags: ["bad luck", "failed", "rejected", "red flags", "mistake"],
  },
  {
    id: "195515965",
    name: "Clown Applying Makeup",
    fallbackImageUrl: "https://imgflip.com/s/meme/Clown-Applying-Makeup.jpg",
    levels: ["cooked"],
    tags: ["overconfident", "bad strategy", "generic", "no metrics", "cooked"],
  },
  {
    id: "155067746",
    name: "Surprised Pikachu",
    fallbackImageUrl: "https://imgflip.com/s/meme/Surprised-Pikachu.jpg",
    levels: ["mid", "cooked"],
    tags: ["surprised", "no response", "missing", "rejection", "obvious"],
  },
  {
    id: "61544",
    name: "Success Kid",
    fallbackImageUrl: "https://imgflip.com/s/meme/Success-Kid.jpg",
    levels: ["locked-in"],
    tags: ["success", "offer", "ready", "locked in", "strong"],
  },
  {
    id: "135256802",
    name: "Epic Handshake",
    fallbackImageUrl: "https://imgflip.com/s/meme/Epic-Handshake.jpg",
    levels: ["locked-in"],
    tags: ["match", "fit", "skills", "job description", "alignment"],
  },
  {
    id: "161865971",
    name: "Marked Safe From",
    fallbackImageUrl: "https://imgflip.com/s/meme/Marked-Safe-From.jpg",
    levels: ["locked-in", "mid"],
    tags: ["safe", "red flags", "icks", "clean", "ready"],
  },
  {
    id: "178591752",
    name: "Tuxedo Winnie The Pooh",
    fallbackImageUrl: "https://imgflip.com/s/meme/Tuxedo-Winnie-The-Pooh.png",
    levels: ["locked-in", "mid"],
    tags: ["professional", "polished", "upgrade", "rewrite", "glow up"],
  },
];

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9+#. ]/g, " ")
    .split(/\s+/)
    .filter(Boolean);
}

function stableHash(text: string): number {
  let hash = 0;
  for (const char of text) {
    hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  }
  return hash;
}

function scoreTemplate(template: MemeTemplate, level: CookedLevel, tokens: Set<string>) {
  let score = template.levels.includes(level) ? 30 : -20;
  const searchable = tokenize([template.name, ...template.tags].join(" "));
  for (const token of searchable) {
    if (tokens.has(token)) score += 8;
  }
  return score;
}

export function selectMemeTemplates({
  level,
  signalText,
  count = 5,
}: {
  level: CookedLevel;
  signalText: string;
  count?: number;
}): MemeTemplate[] {
  const tokens = new Set(tokenize(signalText));
  const seed = stableHash(`${level}:${signalText}`);

  const ranked = TEMPLATE_CATALOG.map((template, index) => ({
    template,
    score: scoreTemplate(template, level, tokens) + ((seed + index * 17) % 7),
  }))
    .sort((a, b) => b.score - a.score)
    .map((entry) => entry.template);

  const firstPass = ranked.filter((template) => template.levels.includes(level));
  const selected = [...firstPass, ...ranked].filter(
    (template, index, all) =>
      all.findIndex((candidate) => candidate.id === template.id) === index,
  );

  return selected.slice(0, count);
}
