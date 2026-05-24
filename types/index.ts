export type CookedLevel = "locked-in" | "mid" | "cooked";

export type Rating = {
  label: string;
  score: number;
  comment: string;
};

export type GeminiAnalysis = {
  overallScore: number;
  ratings: Rating[];
  missingKeywords: string[];
  seriousDiagnosis: string;
  actualAdvice: string[];
  improvedSummary: string;
  improvedBullets: string[];
  readyToApply: boolean;
};

export type RoastRequest = {
  jobTitle: string;
  jobDescription: string;
  resume: string;
};

export type RoastResult = {
  cookedScore: number;
  level: CookedLevel;
  ratings: Rating[];
  missingKeywords: string[];
  seriousDiagnosis: string;
  brainrotDiagnosis: string;
  actualAdvice: string[];
  improvedSummary: string;
  improvedBullets: string[];
  readyToApply: boolean;
  memeUrl: string;
  memeCaption: { top: string; bottom: string };
  usedFallbacks: {
    gemini: boolean;
    brainrot: boolean;
    imgflip: boolean;
  };
};
