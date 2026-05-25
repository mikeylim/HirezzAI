"use client";

import { useState } from "react";
import { Sparkles, Zap, Trophy, ChevronDown } from "lucide-react";
import { Header } from "@/components/Header";
import { JobApplicationForm, type JobApplicationFormValues } from "@/components/JobApplicationForm";
import { RoastResultCard } from "@/components/RoastResultCard";
import { LoadingState } from "@/components/LoadingState";
import { ErrorState } from "@/components/ErrorState";
import { ChefCharacter } from "@/components/ChefCharacter";
import type { RoastResult } from "@/types";

/* ─── Marquee ticker ─────────────────────────────────── */
const TICKER = [
  "HIREZZAI", "🔥", "NO CAP", "💀", "AI RESUME ROASTER",
  "⚡", "SKILL ISSUE DETECTOR", "🧑‍🍳", "COOKED RESUME",
  "🏆", "W RIZZ CERTIFIED", "👨‍🍳", "BRAINROT DIAGNOSIS",
  "✦", "BUILT DIFFERENT",
];

function Marquee() {
  const items = [...TICKER, ...TICKER, ...TICKER, ...TICKER]; // 4× for seamless loop
  return (
    <div className="overflow-hidden border-y border-border/40 bg-card/30 py-2.5 backdrop-blur-sm">
      <div
        className="flex w-max gap-8 whitespace-nowrap"
        style={{ animation: "marquee-scroll 28s linear infinite" }}
      >
        {items.map((item, i) => (
          <span key={i} className="font-display text-xs tracking-[0.2em] text-muted-foreground">
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ─── Stamp sticker ──────────────────────────────────── */
function Stamp({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`sticker meme-stamp select-none rounded-full border-[3px] px-4 py-3 text-center font-display leading-none tracking-widest ${className}`}>
      {children}
    </div>
  );
}

/* ─── Feature data ───────────────────────────────────── */
const FEATURES = [
  { icon: Sparkles, label: "AI scores your fit",  desc: "Gemini reads your resume like a recruiter would fr fr", tag: "💀 no cap" },
  { icon: Zap,      label: "Brainrot diagnosis",  desc: "Real feedback but make it unhinged",                   tag: "⚡ slay"    },
  { icon: Trophy,   label: "Rebuilt summary",     desc: "Walk away with something you can actually submit",     tag: "🏆 W move" },
];

/* ─── Page ───────────────────────────────────────────── */
export default function HomePage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error,     setError]     = useState<string | null>(null);
  const [result,    setResult]    = useState<RoastResult | null>(null);
  const [lastInput, setLastInput] = useState<JobApplicationFormValues | null>(null);

  const runRoast = async (values: JobApplicationFormValues) => {
    setIsLoading(true);
    setError(null);
    setResult(null);
    setLastInput(values);
    try {
      const res = await fetch("/api/roast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        throw new Error(errBody?.error || `Request failed (${res.status})`);
      }
      const data: RoastResult = await res.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col overflow-x-hidden">
      <ChefCharacter roastContext={result} />

      {/* ── Ambient glow orbs ── */}
      <div aria-hidden className="pointer-events-none fixed left-[-18%] top-[-8%] h-[520px] w-[520px] animate-pulse-glow rounded-full blur-[130px]"
        style={{ background: "radial-gradient(circle, rgba(255,107,53,0.55), transparent 70%)" }} />
      <div aria-hidden className="pointer-events-none fixed right-[-14%] top-[28%] h-[420px] w-[420px] animate-float rounded-full blur-[110px]"
        style={{ background: "radial-gradient(circle, rgba(168,85,247,0.4), transparent 70%)" }} />
      <div aria-hidden className="pointer-events-none fixed bottom-[-12%] left-[28%] h-[360px] w-[360px] animate-float-slow rounded-full blur-[120px]"
        style={{ background: "radial-gradient(circle, rgba(255,23,68,0.3), transparent 70%)" }} />

      <Header />

      {/* ══════════════════════════════════════════════════
          INTRO SECTION
          ─────────────────────────────────────────────────
          The chef (ChefCharacter.tsx) is position:fixed and
          sits at 34vh × 50vw (visual centre) at intro scale.
          Its bottom edge lands at: 34vh + 177px from viewport top.
          Section starts below header (~56px).

          Spacer height = (34vh + 177px) - 56px + 40px gap
                        = calc(34vh + 161px)

          This guarantees a 40px clear gap between chef feet
          and the welcome text on every screen size.
      ══════════════════════════════════════════════════ */}
      <section className="relative flex min-h-screen flex-col items-center overflow-hidden">

        {/*
          ★ CRITICAL SPACER ★
          Derived from chef geometry — do not change without
          updating INTRO_CENTER_Y_PCT and INTRO_SCALE in ChefCharacter.tsx
        */}
        <div className="w-full shrink-0" style={{ height: "calc(34vh + 161px)" }} />

        {/* ── Welcome text ── */}
        <div className="flex flex-col items-center gap-5 px-6 pb-10 text-center">

          {/* Headline */}
          <div className="relative">
            <h1 className="font-display text-[clamp(2.8rem,8.5vw,7rem)] leading-none tracking-wide">
              WELCOME TO{" "}
              <span className="relative inline-block bg-gradient-to-r from-orange-400 via-red-500 to-purple-500 bg-clip-text text-transparent">
                HIREZZAI
                {/* Squiggly underline */}
                <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 300 12"
                  preserveAspectRatio="none" aria-hidden>
                  <path d="M0 6 Q37 0 75 6 Q112 12 150 6 Q187 0 225 6 Q262 12 300 6"
                    stroke="#FF6B35" strokeWidth="3.5" fill="none" strokeLinecap="round" />
                </svg>
              </span>
            </h1>
          </div>

          {/* Tagline */}
          <p className="max-w-md text-base text-muted-foreground md:text-lg">
            The most honest recruiter you&apos;ll ever meet.{" "}
            <span className="font-semibold text-foreground">No fluff. Just fire.</span>
          </p>

          {/* Meme sticker badges */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            <span className="sticker inline-block -rotate-2 rounded-lg border-2 border-purple-500/50 bg-purple-500/10 px-3 py-1.5 font-display text-sm tracking-widest text-purple-400">
              💀 BRUTALLY HONEST
            </span>
            <span className="sticker inline-block rotate-1 rounded-lg border-2 border-orange-500/50 bg-orange-500/10 px-3 py-1.5 font-display text-sm tracking-widest text-orange-400">
              🔥 AI POWERED
            </span>
            <span className="sticker inline-block -rotate-1 rounded-lg border-2 border-emerald-500/50 bg-emerald-500/10 px-3 py-1.5 font-display text-sm tracking-widest text-emerald-400">
              ⚡ INSTANT RESULTS
            </span>
          </div>

          {/* Scroll hint */}
          <button
            onClick={() => window.scrollTo({ top: window.innerHeight, behavior: "smooth" })}
            className="flex flex-col items-center gap-1 text-muted-foreground transition-colors hover:text-primary"
            aria-label="Scroll to main content"
          >
            <span className="font-display text-xs tracking-[0.25em]">SCROLL TO GET COOKED</span>
            <ChevronDown className="h-5 w-5 animate-bounce" />
          </button>
        </div>

        {/* Decorative stamps (desktop only) */}
        <div className="absolute right-6 top-6 hidden lg:block">
          <Stamp className="border-orange-500 text-orange-500">
            <div className="text-2xl">🔥</div>
            <div className="text-xs">REAL</div>
            <div className="text-xs">TALK</div>
          </Stamp>
        </div>
        <div className="absolute left-6 top-16 hidden lg:block" style={{ animationDelay: "0.3s" }}>
          <Stamp className="border-purple-500 text-purple-500">
            <div className="text-2xl">💀</div>
            <div className="text-[10px]">NO</div>
            <div className="text-[10px]">CAP</div>
          </Stamp>
        </div>

        {/* Marquee — pinned to bottom of intro */}
        <div className="mt-auto w-full">
          <Marquee />
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          MAIN CONTENT
      ══════════════════════════════════════════════════ */}
      <main className="relative z-10 mx-auto w-full max-w-5xl flex-1 px-4 py-14">
        <div className="flex flex-col gap-10">

          {/* Sub-hero */}
          <section className="animate-fade-up flex flex-col gap-4">
            <div className="inline-flex w-fit items-center gap-1.5 rounded-full border border-orange-500/30 bg-orange-500/10 px-3 py-1 text-xs font-medium text-orange-400">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-orange-400" />
              Paste. Analyze. Get Cooked.
            </div>

            <h2 className="font-display text-5xl leading-none tracking-wide md:text-6xl lg:text-7xl">
              HOW{" "}
              <span className="bg-gradient-to-r from-orange-400 via-red-500 to-purple-500 bg-clip-text text-transparent">
                COOKED
              </span>{" "}
              IS YOUR APPLICATION?
            </h2>

            <p className="max-w-xl text-base text-muted-foreground md:text-lg">
              Paste a JD + your resume. We score the fit, roast the gaps in brainrot
              language, and rebuild your summary. Lowkey the most honest recruiter
              you&apos;ll ever meet.
            </p>
          </section>

          {/* Feature cards */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {FEATURES.map(({ icon: Icon, label, desc, tag }, i) => (
              <div key={label}
                className="group relative overflow-hidden rounded-2xl border border-border/50 bg-card/60 px-5 py-4 backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/10">
                <span className="font-display absolute right-4 top-2 select-none text-5xl text-muted/40">{i + 1}</span>
                <div className="relative flex flex-col gap-2">
                  <Icon className="h-5 w-5 text-primary" />
                  <p className="font-semibold">{label}</p>
                  <p className="text-xs text-muted-foreground">{desc}</p>
                  <span className="w-fit rounded-full border border-border/50 bg-muted/50 px-2.5 py-0.5 font-display text-xs tracking-wider text-muted-foreground">{tag}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Meme divider */}
          <div className="flex items-center gap-4">
            <div className="h-px flex-1 bg-border/40" />
            <span className="font-display text-sm tracking-widest text-muted-foreground">DROP YOUR RESUME BELOW FR FR</span>
            <div className="h-px flex-1 bg-border/40" />
          </div>

          <JobApplicationForm onSubmit={runRoast} isLoading={isLoading} />

          {isLoading && <LoadingState />}
          {error && !isLoading && (
            <ErrorState message={error} onRetry={lastInput ? () => runRoast(lastInput!) : undefined} />
          )}
          {result && !isLoading && !error && (
            <RoastResultCard result={result} inputContext={lastInput ?? undefined} />
          )}
        </div>
      </main>

      <footer className="relative z-10 border-t border-border/40 py-6 text-center text-xs text-muted-foreground">
        Built for the hackathon.{" "}
        <span className="bg-gradient-to-r from-orange-400 to-purple-400 bg-clip-text font-medium text-transparent">
          No login · No database · No cap.
        </span>
        {" "}· <span className="opacity-60">🍳 Cooked with love (and fire)</span>
      </footer>
    </div>
  );
}
