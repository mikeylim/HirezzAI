import type { CookedLevel, GeminiAnalysis } from "@/types";

export function calculateLevel(analysis: GeminiAnalysis): CookedLevel {
  const blended = Math.round(analysis.rizzScore * 0.7 + analysis.auraScore * 0.3);
  if (blended >= 75) return "locked-in";
  if (blended >= 50) return "mid";
  return "cooked";
}
