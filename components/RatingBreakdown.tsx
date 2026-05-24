import { Progress } from "@/components/ui/progress";
import type { Rating } from "@/types";

export function RatingBreakdown({ ratings }: { ratings: Rating[] }) {
  if (!ratings?.length) return null;
  return (
    <div className="flex flex-col gap-4">
      {ratings.map((r) => (
        <div key={r.label} className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">{r.label}</span>
            <span className="text-muted-foreground">{r.score}/100</span>
          </div>
          <Progress value={r.score} />
          <p className="text-xs text-muted-foreground">{r.comment}</p>
        </div>
      ))}
    </div>
  );
}
