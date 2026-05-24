import { Badge } from "@/components/ui/badge";
import type { CookedLevel } from "@/types";
import { cn } from "@/lib/utils";

const LEVEL_META: Record<
  CookedLevel,
  {
    label: string;
    badgeClass: string;
    barGradient: string;
    shadow: string;
    scoreGradient: string;
  }
> = {
  "locked-in": {
    label: "⚡ LOCKED IN",
    badgeClass:
      "border-emerald-500/40 bg-emerald-500/15 text-emerald-400",
    barGradient: "linear-gradient(90deg, #10b981, #06b6d4)",
    shadow: "shadow-emerald-500/40",
    scoreGradient: "linear-gradient(135deg, #10b981, #06b6d4)",
  },
  mid: {
    label: "😐 MID",
    badgeClass:
      "border-amber-500/40 bg-amber-500/15 text-amber-400",
    barGradient: "linear-gradient(90deg, #f59e0b, #f97316)",
    shadow: "shadow-amber-500/40",
    scoreGradient: "linear-gradient(135deg, #f59e0b, #f97316)",
  },
  cooked: {
    label: "💀 COOKED",
    badgeClass:
      "border-red-500/40 bg-red-500/15 text-red-400",
    barGradient: "linear-gradient(90deg, #FF6B35, #FF1744, #a855f7)",
    shadow: "shadow-red-500/40",
    scoreGradient: "linear-gradient(135deg, #FF6B35, #FF1744, #a855f7)",
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
  const safe = Math.max(0, Math.min(100, score));

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-end justify-between gap-4">
        {/* Score number with gradient */}
        <div className="flex items-baseline gap-2">
          <span
            className="text-6xl font-black tabular-nums"
            style={{
              background: meta.scoreGradient,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            {score}
          </span>
          <span className="text-sm text-muted-foreground">/ 100</span>
        </div>

        {/* Level badge */}
        <Badge
          className={cn(
            "rounded-full border px-3 py-1 text-xs font-bold tracking-wider",
            meta.badgeClass,
          )}
        >
          {meta.label}
        </Badge>
      </div>

      {/* Gradient progress bar */}
      <div
        className="relative h-3 w-full overflow-hidden rounded-full bg-muted"
        role="progressbar"
        aria-valuenow={safe}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className={cn("h-full rounded-full shadow-lg transition-all duration-700", meta.shadow)}
          style={{ width: `${safe}%`, background: meta.barGradient }}
        />
      </div>
    </div>
  );
}
