"use client";

import Image from "next/image";
import { useState } from "react";
import { Check, Copy, FileText, RefreshCw, Share2, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CookedScore } from "./CookedScore";
import { RatingBreakdown } from "./RatingBreakdown";
import { KeywordChips } from "./KeywordChips";
import { ImprovedResume } from "./ImprovedResume";
import type { RoastRequest, RoastResult } from "@/types";

const PRIORITY_TONE: Record<string, string> = {
  high: "bg-rose-600 text-white",
  medium: "bg-amber-500 text-white",
  "quick-win": "bg-emerald-500 text-white",
};

function shareText(result: RoastResult): string {
  return `Cooked Resume report: ${result.rizzScore}/100 Rizz Score, ${result.auraScore}/100 Aura Score. Verdict: ${result.level.toUpperCase()}. Missing drip: ${result.missingDrip.slice(0, 5).join(", ") || "none"}.`;
}

export function RoastResultCard({
  result,
  inputContext,
}: {
  result: RoastResult;
  inputContext?: RoastRequest;
}) {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [letter, setLetter] = useState(result.rizzLetter ?? "");
  const [letterLoading, setLetterLoading] = useState(false);
  const [letterError, setLetterError] = useState<string | null>(null);
  const [activeMemeIndex, setActiveMemeIndex] = useState(0);
  const usingAnyFallback =
    result.usedFallbacks.gemini ||
    result.usedFallbacks.brainrot ||
    result.usedFallbacks.imgflip;
  const bulletPreviews = result.bulletGlowUp.map((b) => b.variants[0] ?? b.original);
  const activeMeme = result.memes[activeMemeIndex] ?? result.memes[0];
  const topFix =
    result.glowUpPlan.find((item) => item.priority === "high") ??
    result.glowUpPlan[0];

  const copy = async (key: string, text: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedKey(key);
    window.setTimeout(() => setCopiedKey(null), 1400);
  };

  const generateLetter = async () => {
    if (!inputContext) return;
    setLetterLoading(true);
    setLetterError(null);
    try {
      const res = await fetch("/api/rizz-letter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(inputContext),
      });
      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        throw new Error(errBody?.error || `Request failed (${res.status})`);
      }
      const data: { letter: string } = await res.json();
      setLetter(data.letter);
    } catch (err) {
      setLetterError(err instanceof Error ? err.message : "Could not generate letter");
    } finally {
      setLetterLoading(false);
    }
  };

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

          {activeMeme && (
            <section className="rounded-xl border border-primary/40 bg-primary/5 p-3 shadow-[0_0_40px_rgba(249,115,22,0.16)] animate-[meme-pop_520ms_ease-out] md:p-4">
              <div className="mb-3 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-2">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <Sparkles className="h-4 w-4" />
                  </span>
                  <div>
                    <h4 className="text-base font-bold">Personalized Meme Drop</h4>
                    <p className="text-xs text-muted-foreground">
                      Gemini wrote the caption. Imgflip rendered the template.
                    </p>
                  </div>
                </div>
                <Badge className="w-fit bg-background text-foreground">
                  {activeMeme.templateName ?? `Template ${activeMeme.templateId}`}
                </Badge>
              </div>

              <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px]">
                <div className="overflow-hidden rounded-lg border border-border bg-background">
                  <div className="relative aspect-[16/10] w-full bg-muted/40 md:aspect-[16/9]">
                    <Image
                      src={activeMeme.imageUrl}
                      alt={`Personalized meme using ${activeMeme.templateName ?? "Imgflip template"}`}
                      fill
                      unoptimized
                      priority
                      className="object-contain"
                      sizes="(max-width: 1024px) 100vw, 700px"
                    />
                  </div>
                </div>
                <div className="flex flex-col justify-between gap-3 rounded-lg border border-border bg-background p-3">
                  <div>
                    <p className="text-xs font-semibold uppercase text-muted-foreground">
                      Generated Caption
                    </p>
                    <div className="mt-3 space-y-2 text-sm">
                      <p className="rounded-md bg-muted/60 p-3 font-mono">
                        TOP: {activeMeme.topText}
                      </p>
                      <p className="rounded-md bg-muted/60 p-3 font-mono">
                        BOTTOM: {activeMeme.bottomText}
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {result.memes.map((meme, i) => (
                      <button
                        key={`${meme.templateId}-tab-${i}`}
                        type="button"
                        onClick={() => setActiveMemeIndex(i)}
                        className={`rounded-md border px-2 py-2 text-xs font-semibold transition-colors ${
                          i === activeMemeIndex
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border bg-muted/40 hover:bg-muted"
                        }`}
                      >
                        #{i + 1}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          )}

          {topFix && (
            <div className="flex flex-col gap-3 rounded-lg border border-emerald-500/40 bg-emerald-500/5 p-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase text-emerald-700">
                  Fix this first
                </p>
                <p className="mt-1 text-sm leading-relaxed">{topFix.advice}</p>
              </div>
              <Badge className={PRIORITY_TONE[topFix.priority] ?? ""}>
                {topFix.priority}
              </Badge>
            </div>
          )}

          <div className="grid gap-6 md:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
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

            <div className="rounded-lg border border-border bg-muted/30 p-4">
              <div className="mb-3 flex items-center justify-between gap-3">
                <div>
                  <h4 className="text-sm font-semibold">Shareable Aura Card</h4>
                  <p className="text-xs text-muted-foreground">
                    Screenshot bait for the demo.
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => copy("share", shareText(result))}
                >
                  {copiedKey === "share" ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Share2 className="h-4 w-4" />
                  )}
                  Share
                </Button>
              </div>
              <div className="rounded-lg border border-primary/30 bg-background p-4">
                <p className="text-xs font-semibold uppercase text-muted-foreground">
                  Application Aura
                </p>
                <div className="mt-2 flex items-end justify-between gap-4">
                  <div>
                    <p className="text-5xl font-black">{result.auraScore}</p>
                    <p className="text-xs text-muted-foreground">Aura Score</p>
                  </div>
                  <Badge className="bg-primary text-primary-foreground">
                    {result.level}
                  </Badge>
                </div>
                <p className="mt-4 text-sm leading-relaxed">{result.recruiterPOV}</p>
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
          <CardTitle>Quantified Bullet Counter</CardTitle>
          <CardDescription>How many bullets have measurable receipts.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-md border border-border bg-muted/40 p-4">
              <p className="text-xs font-semibold uppercase text-muted-foreground">Before</p>
              <p className="mt-2 text-4xl font-bold">
                {result.quantifiedBulletCount.before}
              </p>
            </div>
            <div className="rounded-md border border-border bg-muted/40 p-4">
              <p className="text-xs font-semibold uppercase text-muted-foreground">After</p>
              <p className="mt-2 text-4xl font-bold">
                {result.quantifiedBulletCount.after}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

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
          <div className="flex items-center justify-between gap-3">
            <div>
              <CardTitle>Improved Resume</CardTitle>
              <CardDescription>
                Rewritten summary plus your strongest bullet variants.
              </CardDescription>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                copy(
                  "resume",
                  [result.improvedSummary, ...bulletPreviews].join("\n\n"),
                )
              }
            >
              {copiedKey === "resume" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              Copy
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <ImprovedResume
            summary={result.improvedSummary}
            bullets={bulletPreviews}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Bullet Glow Up</CardTitle>
          <CardDescription>
            Three rewrites for each weak bullet.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {result.bulletGlowUp.map((item, itemIndex) => (
            <div key={`${item.original}-${itemIndex}`} className="rounded-md border border-border p-4">
              <p className="mb-3 text-sm text-muted-foreground">
                <span className="font-semibold text-foreground">Original:</span>{" "}
                {item.original}
              </p>
              <div className="grid gap-2">
                {item.variants.map((variant, variantIndex) => {
                  const copyKey = `bullet-${itemIndex}-${variantIndex}`;
                  return (
                    <div
                      key={copyKey}
                      className="flex flex-col gap-3 rounded-md bg-muted/40 p-3 md:flex-row md:items-start md:justify-between"
                    >
                      <p className="text-sm leading-relaxed">{variant}</p>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => copy(copyKey, variant)}
                      >
                        {copiedKey === copyKey ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                        Copy
                      </Button>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-3">
            <div>
              <CardTitle>Rizz Letter</CardTitle>
              <CardDescription>Generate a cover letter from this resume and JD.</CardDescription>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={!inputContext || letterLoading}
              onClick={generateLetter}
            >
              {letterLoading ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <FileText className="h-4 w-4" />
              )}
              {letter ? "Regenerate" : "Generate"}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {letterError && <p className="mb-3 text-sm text-destructive">{letterError}</p>}
          {letter ? (
            <div className="flex flex-col gap-3">
              <pre className="whitespace-pre-wrap rounded-md border border-border bg-muted/40 p-4 text-sm leading-relaxed">
                {letter}
              </pre>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="self-start"
                onClick={() => copy("letter", letter)}
              >
                {copiedKey === "letter" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                Copy letter
              </Button>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Generate after the roast to keep the first request fast.
            </p>
          )}
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
