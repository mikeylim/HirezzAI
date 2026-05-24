import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CookedScore } from "./CookedScore";
import { RatingBreakdown } from "./RatingBreakdown";
import { KeywordChips } from "./KeywordChips";
import { ImprovedResume } from "./ImprovedResume";
import type { RoastResult } from "@/types";

const PRIORITY_TONE: Record<string, string> = {
  high: "bg-rose-600 text-white",
  medium: "bg-amber-500 text-white",
  "quick-win": "bg-emerald-500 text-white",
};

export function RoastResultCard({ result }: { result: RoastResult }) {
  const usingAnyFallback =
    result.usedFallbacks.gemini ||
    result.usedFallbacks.brainrot ||
    result.usedFallbacks.imgflip;
  const firstMeme = result.memes[0];
  const bulletPreviews = result.bulletGlowUp.map((b) => b.variants[0] ?? b.original);

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>The verdict</CardTitle>
            {result.readyToApply ? (
              <Badge className="bg-emerald-500 text-white">Ready to apply</Badge>
            ) : (
              <Badge variant="muted">Not ready yet</Badge>
            )}
          </div>
          <CardDescription>
            Rizz Score (ATS-style fit) and Aura Score (overall vibe).
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Rizz Score
              </p>
              <CookedScore score={result.rizzScore} level={result.level} />
            </div>
            <div>
              <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Aura Score
              </p>
              <CookedScore score={result.auraScore} level={result.level} />
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {firstMeme && (
              <div className="overflow-hidden rounded-lg border border-border bg-muted/30">
                <div className="relative aspect-square w-full">
                  <Image
                    src={firstMeme.imageUrl}
                    alt="Application status meme"
                    fill
                    unoptimized
                    className="object-contain"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                </div>
                <div className="border-t border-border bg-background/60 p-3 text-xs text-muted-foreground">
                  <p className="font-mono">
                    <span className="font-bold">TOP:</span> {firstMeme.topText}
                  </p>
                  <p className="font-mono">
                    <span className="font-bold">BOTTOM:</span> {firstMeme.bottomText}
                  </p>
                </div>
              </div>
            )}

            <div className="flex flex-col gap-4">
              <div>
                <h4 className="mb-1 text-sm font-semibold text-muted-foreground">
                  Brainrot diagnosis
                </h4>
                <p className="rounded-md border border-primary/40 bg-primary/5 p-3 text-sm italic leading-relaxed">
                  {result.brainrotDiagnosis}
                </p>
              </div>
              <div>
                <h4 className="mb-1 text-sm font-semibold text-muted-foreground">
                  Serious diagnosis
                </h4>
                <p className="rounded-md border border-border bg-muted/50 p-3 text-sm leading-relaxed">
                  {result.seriousDiagnosis}
                </p>
              </div>
              <div>
                <h4 className="mb-1 text-sm font-semibold text-muted-foreground">
                  Recruiter POV
                </h4>
                <p className="rounded-md border border-border bg-muted/50 p-3 text-sm leading-relaxed">
                  {result.recruiterPOV}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Rizz Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <RatingBreakdown breakdown={result.rizzBreakdown} />
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Missing Drip</CardTitle>
            <CardDescription>Keywords from the JD not in your resume.</CardDescription>
          </CardHeader>
          <CardContent>
            <KeywordChips keywords={result.missingDrip} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Ick Detector</CardTitle>
            <CardDescription>Red flags a recruiter will catch.</CardDescription>
          </CardHeader>
          <CardContent>
            {result.ickDetector.length === 0 ? (
              <p className="text-sm text-muted-foreground">No icks — you&apos;re clean.</p>
            ) : (
              <ul className="ml-5 list-disc space-y-2 text-sm">
                {result.ickDetector.map((ick, i) => (
                  <li key={i}>{ick}</li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>The Glow Up Plan</CardTitle>
          <CardDescription>What to fix, ordered by priority.</CardDescription>
        </CardHeader>
        <CardContent>
          {result.glowUpPlan.length === 0 ? (
            <p className="text-sm text-muted-foreground">No advice — you&apos;re solid.</p>
          ) : (
            <ul className="flex flex-col gap-3">
              {result.glowUpPlan.map((g, i) => (
                <li
                  key={i}
                  className="flex items-start gap-3 rounded-md border border-border bg-muted/30 p-3"
                >
                  <Badge className={PRIORITY_TONE[g.priority] ?? ""}>
                    {g.priority}
                  </Badge>
                  <span className="text-sm leading-relaxed">{g.advice}</span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Improved Resume</CardTitle>
          <CardDescription>
            Rewritten summary plus your strongest bullet variants.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ImprovedResume
            summary={result.improvedSummary}
            bullets={bulletPreviews}
          />
        </CardContent>
      </Card>

      {usingAnyFallback && (
        <p className="text-xs text-muted-foreground">
          Note: some results used fallback data
          {result.usedFallbacks.gemini && " · Gemini"}
          {result.usedFallbacks.brainrot && " · BrainRot"}
          {result.usedFallbacks.imgflip && " · Imgflip"}
          .
        </p>
      )}
    </div>
  );
}
