import type { ComponentType } from "react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import {
  BarChart3,
  CheckCircle2,
  FileEdit,
  Lightbulb,
  Tags,
  XCircle,
} from "lucide-react";
import { CookedScore } from "./CookedScore";
import { RatingBreakdown } from "./RatingBreakdown";
import { KeywordChips } from "./KeywordChips";
import { ImprovedResume } from "./ImprovedResume";
import type { RoastResult } from "@/types";

/** Shared glass-card section wrapper */
function Section({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: ComponentType<{ className?: string }>;
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-border/50 bg-card/60 p-6 shadow-xl backdrop-blur-sm">
      <div className="mb-5 flex items-start gap-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="h-4 w-4" />
        </div>
        <div>
          <h3 className="font-semibold leading-tight">{title}</h3>
          {description && (
            <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
          )}
        </div>
      </div>
      {children}
    </div>
  );
}

export function RoastResultCard({ result }: { result: RoastResult }) {
  const usingAnyFallback =
    result.usedFallbacks.gemini ||
    result.usedFallbacks.brainrot ||
    result.usedFallbacks.imgflip;

  return (
    <div className="flex animate-fade-up flex-col gap-5">
      {/* ── Verdict + Score ── */}
      <Section
        icon={BarChart3}
        title="The verdict"
        description="How your application stacks up against the job."
      >
        <div className="mb-5">
          {result.readyToApply ? (
            <Badge className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/40 bg-emerald-500/15 px-3 py-1 text-xs font-semibold text-emerald-400">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Ready to apply
            </Badge>
          ) : (
            <Badge className="inline-flex items-center gap-1.5 rounded-full border border-border/50 bg-muted/50 px-3 py-1 text-xs font-semibold text-muted-foreground">
              <XCircle className="h-3.5 w-3.5" />
              Not ready yet
            </Badge>
          )}
        </div>

        <CookedScore score={result.cookedScore} level={result.level} />

        {/* Meme + diagnoses */}
        <div className="mt-6 grid gap-5 md:grid-cols-2">
          {/* Meme */}
          <div className="overflow-hidden rounded-xl border border-border/40 bg-muted/20">
            <div className="relative aspect-square w-full">
              <Image
                src={result.memeUrl}
                alt="Application status meme"
                fill
                unoptimized
                className="object-contain"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
            <div className="border-t border-border/30 bg-background/60 p-3 text-xs text-muted-foreground">
              <p className="font-mono">
                <span className="font-bold text-foreground/60">TOP:</span>{" "}
                {result.memeCaption.top}
              </p>
              <p className="mt-1 font-mono">
                <span className="font-bold text-foreground/60">BOTTOM:</span>{" "}
                {result.memeCaption.bottom}
              </p>
            </div>
          </div>

          {/* Diagnoses */}
          <div className="flex flex-col gap-4">
            <div>
              <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-orange-400">
                🔥 Brainrot diagnosis
              </p>
              <p className="rounded-xl border border-orange-500/25 bg-orange-500/8 p-3.5 text-sm italic leading-relaxed">
                {result.brainrotDiagnosis}
              </p>
            </div>
            <div>
              <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                🧠 Serious diagnosis
              </p>
              <p className="rounded-xl border border-border/40 bg-muted/30 p-3.5 text-sm leading-relaxed">
                {result.seriousDiagnosis}
              </p>
            </div>
          </div>
        </div>
      </Section>

      {/* ── Rating breakdown ── */}
      <Section icon={BarChart3} title="Rating breakdown">
        <RatingBreakdown ratings={result.ratings} />
      </Section>

      {/* ── Keywords + Advice ── */}
      <div className="grid gap-5 md:grid-cols-2">
        <Section
          icon={Tags}
          title="Missing keywords"
          description="From the JD, not in your resume."
        >
          <KeywordChips keywords={result.missingKeywords} />
        </Section>

        <Section
          icon={Lightbulb}
          title="Actual advice"
          description="What to fix, in plain English."
        >
          {result.actualAdvice?.length ? (
            <ul className="flex flex-col gap-2.5">
              {result.actualAdvice.map((a, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <span className="mt-0.5 shrink-0 text-primary">→</span>
                  {a}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">
              No advice — you&apos;re solid. ✅
            </p>
          )}
        </Section>
      </div>

      {/* ── Improved resume ── */}
      <Section
        icon={FileEdit}
        title="Improved resume"
        description="A rewritten summary and bullets tailored to this job."
      >
        <ImprovedResume
          summary={result.improvedSummary}
          bullets={result.improvedBullets}
        />
      </Section>

      {usingAnyFallback && (
        <p className="text-xs text-muted-foreground/60">
          ℹ️ Some results used fallback data
          {result.usedFallbacks.gemini && " · Gemini"}
          {result.usedFallbacks.brainrot && " · BrainRot"}
          {result.usedFallbacks.imgflip && " · Imgflip"}.
        </p>
      )}
    </div>
  );
}
