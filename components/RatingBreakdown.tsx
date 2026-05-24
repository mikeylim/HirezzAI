import type { Rating } from "@/types";

function barGradient(score: number) {
  if (score >= 70) return "linear-gradient(90deg, #10b981, #06b6d4)";
  if (score >= 40) return "linear-gradient(90deg, #f59e0b, #f97316)";
  return "linear-gradient(90deg, #FF6B35, #FF1744)";
}

export function RatingBreakdown({ ratings }: { ratings: Rating[] }) {
  if (!ratings?.length) return null;
  return (
    <div className="flex flex-col gap-5">
      {ratings.map((r) => {
        const safe = Math.max(0, Math.min(100, r.score));
        return (
          <div key={r.label} className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">{r.label}</span>
              <span className="tabular-nums text-xs text-muted-foreground">
                {r.score}/100
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
                style={{ width: `${safe}%`, background: barGradient(r.score) }}
              />
            </div>
            <p className="text-xs text-muted-foreground">{r.comment}</p>
          </div>
        );
      })}
    </div>
  );
}
