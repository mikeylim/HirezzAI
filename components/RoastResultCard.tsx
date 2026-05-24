import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CookedScore } from "./CookedScore";
import { RatingBreakdown } from "./RatingBreakdown";
import { KeywordChips } from "./KeywordChips";
import { ImprovedResume } from "./ImprovedResume";
import type { RoastResult } from "@/types";

export function RoastResultCard({ result }: { result: RoastResult }) {
  const usingAnyFallback =
    result.usedFallbacks.gemini ||
    result.usedFallbacks.brainrot ||
    result.usedFallbacks.imgflip;

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
            How your application stacks up against the job.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          <CookedScore score={result.cookedScore} level={result.level} />

          <div className="grid gap-6 md:grid-cols-2">
            <div className="overflow-hidden rounded-lg border border-border bg-muted/30">
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
              <div className="border-t border-border bg-background/60 p-3 text-xs text-muted-foreground">
                <p className="font-mono">
                  <span className="font-bold">TOP:</span> {result.memeCaption.top}
                </p>
                <p className="font-mono">
                  <span className="font-bold">BOTTOM:</span> {result.memeCaption.bottom}
                </p>
              </div>
            </div>

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
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Rating breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <RatingBreakdown ratings={result.ratings} />
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Missing keywords</CardTitle>
            <CardDescription>From the JD, not in your resume.</CardDescription>
          </CardHeader>
          <CardContent>
            <KeywordChips keywords={result.missingKeywords} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Actual advice</CardTitle>
            <CardDescription>What to fix, in plain English.</CardDescription>
          </CardHeader>
          <CardContent>
            {result.actualAdvice?.length ? (
              <ul className="ml-5 list-disc space-y-2 text-sm">
                {result.actualAdvice.map((a, i) => (
                  <li key={i}>{a}</li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">No advice — you&apos;re solid.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Improved resume</CardTitle>
          <CardDescription>
            A rewritten summary and bullets tailored to this job.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ImprovedResume
            summary={result.improvedSummary}
            bullets={result.improvedBullets}
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
