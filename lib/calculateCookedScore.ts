import type { CookedLevel, GeminiAnalysis } from "@/types";

export function calculateCookedScore(analysis: GeminiAnalysis): {
  score: number;
  level: CookedLevel;
} {
  const ratingsAvg =
    analysis.ratings.length > 0
      ? analysis.ratings.reduce((sum, r) => sum + r.score, 0) / analysis.ratings.length
      : analysis.overallScore;

  const blended = Math.round(analysis.overallScore * 0.6 + ratingsAvg * 0.4);
  const score = Math.max(0, Math.min(100, blended));

  let level: CookedLevel;
  if (score >= 75) level = "locked-in";
  else if (score >= 50) level = "mid";
  else level = "cooked";

  return { score, level };
}
