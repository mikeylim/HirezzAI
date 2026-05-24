import { Progress } from "@/components/ui/progress";
import type { RizzBreakdown } from "@/types";

const LABELS: Array<{ key: keyof RizzBreakdown; label: string }> = [
  { key: "keywordMatch", label: "Keyword Match" },
  { key: "quantifiedBullets", label: "Quantified Bullets" },
  { key: "sectionStructure", label: "Section Structure" },
  { key: "actionVerbs", label: "Action Verbs" },
  { key: "titleAlignment", label: "Title Alignment" },
];

export function RatingBreakdown({ breakdown }: { breakdown: RizzBreakdown }) {
  return (
    <div className="flex flex-col gap-4">
      {LABELS.map(({ key, label }) => {
        const score = breakdown[key];
        return (
          <div key={key} className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">{label}</span>
              <span className="text-muted-foreground">{score}/100</span>
            </div>
            <Progress value={score} />
          </div>
        );
      })}
    </div>
  );
}
