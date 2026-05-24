import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import type { CookedLevel } from "@/types";
import { cn } from "@/lib/utils";

const LEVEL_META: Record<
  CookedLevel,
  { label: string; tone: string; bar: string }
> = {
  "locked-in": {
    label: "LOCKED IN",
    tone: "bg-emerald-500 text-white",
    bar: "bg-emerald-500",
  },
  mid: {
    label: "MID",
    tone: "bg-amber-500 text-white",
    bar: "bg-amber-500",
  },
  cooked: {
    label: "COOKED",
    tone: "bg-rose-600 text-white",
    bar: "bg-rose-600",
  },
};

export function CookedScore({
  score,
  level,
}: {
  score: number;
  level: CookedLevel;
}) {
  const meta = LEVEL_META[level];
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-baseline gap-2">
          <span className="text-4xl font-bold">{score}</span>
          <span className="text-sm text-muted-foreground">/ 100</span>
        </div>
        <Badge className={cn("text-xs tracking-wide", meta.tone)}>{meta.label}</Badge>
      </div>
      <Progress value={score} indicatorClassName={meta.bar} />
    </div>
  );
}
