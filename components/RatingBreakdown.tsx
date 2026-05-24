import type { RizzBreakdown } from "@/types";

const LABELS: Array<{ key: keyof RizzBreakdown; label: string }> = [
  { key: "keywordMatch", label: "Keyword Match" },
  { key: "quantifiedBullets", label: "Quantified Bullets" },
  { key: "sectionStructure", label: "Section Structure" },
  { key: "actionVerbs", label: "Action Verbs" },
  { key: "titleAlignment", label: "Title Alignment" },
];

function barGradient(score: number) {
  if (score >= 70) return "linear-gradient(90deg, #10b981, #06b6d4)";
  if (score >= 40) return "linear-gradient(90deg, #f59e0b, #f97316)";
  return "linear-gradient(90deg, #FF6B35, #FF1744)";
}

export function RatingBreakdown({ breakdown }: { breakdown: RizzBreakdown }) {
  return (
    <div className="flex flex-col gap-5">
      {LABELS.map(({ key, label }) => {
        const score = breakdown[key];
        const safe = Math.max(0, Math.min(100, score));
        return (
          <div key={key} className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">{label}</span>
              <span className="tabular-nums text-xs text-muted-foreground">
                {score}/100
              </span>
            </div>
            <div
              className="relative h-2.5 w-full overflow-hidden rounded-full bg-muted"
              role="progressbar"
              aria-valuenow={safe}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{ width: `${safe}%`, background: barGradient(score) }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
