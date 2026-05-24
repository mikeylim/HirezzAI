export type CookedLevel = "locked-in" | "mid" | "cooked";

export type Tone = "savage" | "balanced" | "gentle";

export type Priority = "high" | "medium" | "quick-win";

export type RizzBreakdown = {
  keywordMatch: number;
  quantifiedBullets: number;
  sectionStructure: number;
  actionVerbs: number;
  titleAlignment: number;
};

export type GlowUpItem = {
  advice: string;
  priority: Priority;
};

export type BulletGlowUpItem = {
  original: string;
  variants: string[];
};

export type Meme = {
  templateId: string;
  templateName?: string;
  imageUrl: string;
  topText: string;
  bottomText: string;
};

export type GeminiAnalysis = {
  rizzScore: number;
  auraScore: number;
  rizzBreakdown: RizzBreakdown;
  missingDrip: string[];
  ickDetector: string[];
  recruiterPOV: string;
  seriousDiagnosis: string;
  glowUpPlan: GlowUpItem[];
  bulletGlowUp: BulletGlowUpItem[];
  improvedSummary: string;
  quantifiedBulletCount: { before: number; after: number };
  readyToApply: boolean;
  memeCaptions: Array<{ top: string; bottom: string }>;
  emojiBurst: string[];
};

export type RoastRequest = {
  jobTitle: string;
  jobDescription: string;
  resume: string;
  tone: Tone;
};

export type RoastResult = {
  rizzScore: number;
  auraScore: number;
  level: CookedLevel;
  rizzBreakdown: RizzBreakdown;
  missingDrip: string[];
  ickDetector: string[];
  recruiterPOV: string;
  brainrotDiagnosis: string;
  seriousDiagnosis: string;
  glowUpPlan: GlowUpItem[];
  bulletGlowUp: BulletGlowUpItem[];
  improvedSummary: string;
  quantifiedBulletCount: { before: number; after: number };
  readyToApply: boolean;
  memes: Meme[];
  emojiBurst: string[];
  rizzLetter?: string;
  usedFallbacks: {
    gemini: boolean;
    brainrot: boolean;
    imgflip: boolean;
  };
};

export type RegenerateBulletRequest = {
  originalBullet: string;
  resume: string;
  jobDescription: string;
  tone: Tone;
};

export type RegenerateBulletResponse = {
  bullet: string;
};

export type RizzLetterRequest = {
  resume: string;
  jobDescription: string;
  tone: Tone;
};

export type RizzLetterResponse = {
  letter: string;
};

export type ExtractResponse = {
  text: string;
  format: "txt" | "docx" | "pdf";
};
