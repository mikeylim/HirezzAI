"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import {
  Check,
  Copy,
  Download,
  ExternalLink,
  FileText,
  RefreshCw,
  Share2,
  Sparkles,
  Square,
  Volume2,
  Wand2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CookedScore } from "./CookedScore";
import { RatingBreakdown } from "./RatingBreakdown";
import { KeywordChips } from "./KeywordChips";
import { ImprovedResume } from "./ImprovedResume";
import type { RoastRequest, RoastResult } from "@/types";
import { downloadDocx, openPdfPreviewTab } from "@/lib/generateResumeDocs";

const PRIORITY_TONE: Record<string, string> = {
  high: "bg-rose-600 text-white",
  medium: "bg-amber-500 text-white",
  "quick-win": "bg-emerald-500 text-white",
};

const PRIORITY_LABEL: Record<string, string> = {
  high: "main quest",
  medium: "side quest",
  "quick-win": "quick buff",
};

function shareText(result: RoastResult): string {
  const verdict =
    result.level === "cooked" ? "💀 COOKED" :
    result.level === "locked-in" ? "🔒 LOCKED IN" : "🤔 MID";
  return `Just got my resume roasted by HirezzAI 🔥\nRizz Score: ${result.rizzScore}/100 | Aura: ${result.auraScore}/100\nVerdict: ${verdict}\n${result.readyToApply ? "✅ Ready to apply fr" : "💀 Back to the drawing board"}\nhirezz-ai.vercel.app`;
}

function verdictTitle(level: RoastResult["level"]): string {
  if (level === "cooked") return "Resume got cooked";
  if (level === "locked-in") return "Application locked in";
  return "Application is mid";
}

function polishedResumeText(result: RoastResult): string {
  const bullets = result.bulletGlowUp.map((item) => item.variants[0] ?? item.original);
  return [
    "IMPROVED SUMMARY",
    result.improvedSummary,
    "",
    "BULLET GLOW UP",
    ...bullets.map((bullet) => `- ${bullet}`),
    "",
    "GLOW UP PLAN",
    ...result.glowUpPlan.map((item) => `- [${item.priority.toUpperCase()}] ${item.advice}`),
  ].join("\n");
}

function playMemeDropSound() {
  const audioWindow = window as Window & {
    webkitAudioContext?: typeof AudioContext;
  };
  const AudioContextClass = window.AudioContext || audioWindow.webkitAudioContext;
  if (!AudioContextClass) return;

  const ctx = new AudioContextClass();
  const gain = ctx.createGain();
  gain.connect(ctx.destination);
  gain.gain.setValueAtTime(0.0001, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.22, ctx.currentTime + 0.025);
  gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.48);

  const boom = ctx.createOscillator();
  boom.type = "sawtooth";
  boom.frequency.setValueAtTime(120, ctx.currentTime);
  boom.frequency.exponentialRampToValueAtTime(42, ctx.currentTime + 0.42);
  boom.connect(gain);
  boom.start();
  boom.stop(ctx.currentTime + 0.5);

  const ping = ctx.createOscillator();
  ping.type = "triangle";
  ping.frequency.setValueAtTime(660, ctx.currentTime + 0.08);
  ping.frequency.exponentialRampToValueAtTime(980, ctx.currentTime + 0.18);
  ping.connect(gain);
  ping.start(ctx.currentTime + 0.08);
  ping.stop(ctx.currentTime + 0.24);
  window.setTimeout(() => void ctx.close(), 650);
}

function pickFunnyVoice(voices: SpeechSynthesisVoice[]) {
  const funnyNames = [
    "Zarvox",
    "Trinoids",
    "Bubbles",
    "Boing",
    "Good News",
    "Bad News",
    "Junior",
    "Princess",
    "Fred",
    "Albert",
    "Whisper",
  ];
  return (
    voices.find((voice) =>
      funnyNames.some((name) =>
        voice.name.toLowerCase().includes(name.toLowerCase()),
      ),
    ) ??
    voices.find((voice) => voice.lang.toLowerCase().startsWith("en")) ??
    voices[0]
  );
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
  const [isMagicWorking, setIsMagicWorking] = useState(false);
  const [activeMemeIndex, setActiveMemeIndex] = useState(0);
  const [auraMemeIndex, setAuraMemeIndex] = useState(0);
  const [showMemeDrop, setShowMemeDrop] = useState(Boolean(result.memes.length));
  const [isBrainrotSpeaking, setIsBrainrotSpeaking] = useState(false);
  const [speechError, setSpeechError] = useState<string | null>(null);
  const [shareOpen, setShareOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const brainrotAudioRef = useRef<HTMLAudioElement | null>(null);
  const shareDropdownRef = useRef<HTMLDivElement>(null);
  const usingAnyFallback =
    result.usedFallbacks.gemini ||
    result.usedFallbacks.brainrot ||
    result.usedFallbacks.imgflip;
  const bulletPreviews = result.bulletGlowUp.map((b) => b.variants[0] ?? b.original);
  const activeMeme = result.memes[activeMemeIndex] ?? result.memes[0];
  const auraMeme = result.memes[auraMemeIndex] ?? activeMeme;
  const reportText = polishedResumeText(result);
  const topFix =
    result.glowUpPlan.find((item) => item.priority === "high") ??
    result.glowUpPlan[0];

  useEffect(() => {
    setActiveMemeIndex(0);
    setAuraMemeIndex(0);
    setShowMemeDrop(Boolean(result.memes.length));
  }, [result]);

  useEffect(() => {
    if (lightboxIndex === null) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setLightboxIndex(null);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [lightboxIndex]);

  useEffect(() => {
    if (!shareOpen) return;
    function onOutsideClick(e: MouseEvent) {
      if (shareDropdownRef.current && !shareDropdownRef.current.contains(e.target as Node)) {
        setShareOpen(false);
      }
    }
    document.addEventListener("mousedown", onOutsideClick);
    return () => document.removeEventListener("mousedown", onOutsideClick);
  }, [shareOpen]);

  useEffect(() => {
    if (showMemeDrop && activeMeme) {
      playMemeDropSound();
    }
  }, [activeMeme, showMemeDrop]);

  useEffect(() => {
    return () => {
      window.speechSynthesis?.cancel();
      if (brainrotAudioRef.current) {
        brainrotAudioRef.current.pause();
        brainrotAudioRef.current = null;
      }
    };
  }, []);

  const copy = async (key: string, text: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedKey(key);
    window.setTimeout(() => setCopiedKey(null), 1400);
  };

  const handleSocialShare = async (platform: "instagram" | "tiktok") => {
    setShareOpen(false);
    const text = shareText(result);
    const url = "https://hirezz-ai.vercel.app";
    if (navigator.share) {
      try {
        await navigator.share({ title: "HirezzAI Aura Card", text, url });
        return;
      } catch { /* user cancelled */ }
    }
    // Desktop fallback: copy the share text
    await copy(`share-${platform}`, `${text}\n${url}`);
  };

  const downloadTxt = () => {
    const blob = new Blob([reportText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "hirezzai-glow-up.txt";
    link.click();
    URL.revokeObjectURL(url);
  };

  const playBrowserBrainrotVoice = () => {
    if (!("speechSynthesis" in window) || !("SpeechSynthesisUtterance" in window)) {
      setSpeechError("Text-to-speech is not supported in this browser.");
      return;
    }

    window.speechSynthesis.cancel();
    const voices = window.speechSynthesis.getVoices();
    const utterance = new SpeechSynthesisUtterance(
      `Brainrot diagnosis incoming. Chat, lock in. ${result.brainrotDiagnosis}`,
    );
    const voice = pickFunnyVoice(voices);
    if (voice) utterance.voice = voice;
    utterance.pitch = 1.65;
    utterance.rate = 1.18;
    utterance.volume = 1;
    utterance.onend = () => setIsBrainrotSpeaking(false);
    utterance.onerror = () => {
      setIsBrainrotSpeaking(false);
      setSpeechError("Could not play the Brainrot diagnosis voice.");
    };
    setIsBrainrotSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const stopBrainrotVoice = () => {
    window.speechSynthesis?.cancel();
    if (brainrotAudioRef.current) {
      brainrotAudioRef.current.pause();
      brainrotAudioRef.current = null;
    }
    setIsBrainrotSpeaking(false);
  };

  const toggleBrainrotVoice = async () => {
    if (isBrainrotSpeaking || window.speechSynthesis?.speaking) {
      stopBrainrotVoice();
      return;
    }

    setSpeechError(null);
    setIsBrainrotSpeaking(true);

    try {
      const res = await fetch("/api/tts/brainrot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: result.brainrotDiagnosis }),
      });

      if (!res.ok) throw new Error(`ElevenLabs TTS failed (${res.status})`);

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      brainrotAudioRef.current = audio;
      audio.onended = () => {
        URL.revokeObjectURL(url);
        brainrotAudioRef.current = null;
        setIsBrainrotSpeaking(false);
      };
      audio.onerror = () => {
        URL.revokeObjectURL(url);
        brainrotAudioRef.current = null;
        setIsBrainrotSpeaking(false);
        setSpeechError("Could not play ElevenLabs audio.");
      };
      await audio.play();
    } catch {
      setSpeechError("ElevenLabs was unavailable, using browser voice fallback.");
      playBrowserBrainrotVoice();
    }
  };

  const handleMagicDocx = async () => {
    setIsMagicWorking(true);
    try {
      await downloadDocx(
        inputContext?.resume ?? "",
        result,
        inputContext?.jobTitle,
      );
    } finally {
      setIsMagicWorking(false);
    }
  };

  const handleMagicPdf = () => {
    openPdfPreviewTab(
      inputContext?.resume ?? "",
      result,
      inputContext?.jobTitle,
    );
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
      {activeMeme && showMemeDrop && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-black/80 px-3 py-6 backdrop-blur-sm animate-[meme-backdrop_180ms_ease-out]"
          role="dialog"
          aria-modal="true"
          aria-label="Personalized meme drop"
        >
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_38%,rgba(249,115,22,0.5),transparent_30%),radial-gradient(circle_at_20%_70%,rgba(16,185,129,0.2),transparent_24%),radial-gradient(circle_at_82%_72%,rgba(244,63,94,0.26),transparent_25%)] animate-[pulse-glow_1.4s_ease-in-out_infinite]" />
          <div className="pointer-events-none absolute left-1/2 top-1/2 h-[42rem] w-[42rem] -translate-x-1/2 -translate-y-1/2 rounded-full border border-primary/45 animate-[shockwave_820ms_ease-out_forwards]" />
          <div className="pointer-events-none absolute left-1/2 top-1/2 h-[30rem] w-[30rem] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/35 animate-[shockwave_900ms_120ms_ease-out_forwards]" />

          {Array.from({ length: 22 }).map((_, i) => {
            const meme = result.memes[i % result.memes.length];
            const left = (i * 23 + 7) % 100;
            const top = (i * 37 + 11) % 100;
            const delay = (i % 11) * 70;
            const duration = 1400 + (i % 5) * 140;
            const size = 72 + (i % 4) * 22;
            return (
              <div
                key={`${meme.templateId}-burst-${i}`}
                className="pointer-events-none absolute overflow-hidden rounded-lg border border-white/25 bg-black shadow-[0_12px_40px_rgba(0,0,0,0.5)] animate-[meme-sticker-burst_var(--emoji-duration)_var(--emoji-delay)_cubic-bezier(.2,1.2,.32,1)_both]"
                style={{
                  left: `${left}%`,
                  top: `${top}%`,
                  width: `${size}px`,
                  height: `${size}px`,
                  ["--emoji-delay" as string]: `${delay}ms`,
                  ["--emoji-duration" as string]: `${duration}ms`,
                }}
              >
                <Image
                  src={meme.imageUrl}
                  alt=""
                  fill
                  unoptimized
                  className="object-cover"
                  sizes="120px"
                />
              </div>
            );
          })}

          <section className="relative w-full max-w-3xl overflow-hidden rounded-xl border border-white/20 bg-background shadow-[0_32px_120px_rgba(0,0,0,0.62),0_0_90px_rgba(249,115,22,0.48)] animate-[meme-boom_560ms_cubic-bezier(.16,1.32,.28,1)_both]">
            <div className="absolute inset-0 pointer-events-none opacity-20 [background-image:linear-gradient(110deg,transparent_0%,rgba(255,255,255,.95)_48%,transparent_56%)] animate-[shine-sweep_1.15s_ease-out_160ms_both]" />

            <div className="relative bg-foreground px-4 py-4 text-center text-background md:px-4">
              <h3 className="text-3xl font-black leading-none md:text-5xl">
                {verdictTitle(result.level)}
              </h3>
            </div>

            <div className="relative bg-black">
              <div className="relative aspect-square w-full max-h-[64vh]">
                <Image
                  src={activeMeme.imageUrl}
                  alt="Personalized resume meme"
                  fill
                  unoptimized
                  priority
                  className="object-contain animate-[image-slam_500ms_120ms_cubic-bezier(.18,1.28,.32,1)_both]"
                  sizes="(max-width: 768px) 100vw, 760px"
                />
              </div>
            </div>

            <div className="relative bg-background p-4">
              <Button
                type="button"
                size="lg"
                className="w-full text-base font-bold"
                onClick={() => setShowMemeDrop(false)}
              >
                View full report
              </Button>
            </div>
          </section>
        </div>
      )}

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
                      5 generated memes. Scroll sideways and pick the winner.
                    </p>
                  </div>
                </div>
                <Badge className="w-fit bg-background text-foreground">Imgflip x Gemini</Badge>
              </div>

              <div className="-mx-3 overflow-x-auto px-3 pb-2 md:-mx-4 md:px-4">
                <div className="flex min-w-max gap-4">
                  {result.memes.map((meme, i) => (
                    <button
                      key={`${meme.templateId}-scroll-${i}`}
                      type="button"
                      onClick={() => {
                        setActiveMemeIndex(i);
                        setAuraMemeIndex(i);
                        setLightboxIndex(i);
                      }}
                      className={`group w-[260px] flex-none overflow-hidden rounded-lg border bg-background text-left shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg md:w-[320px] ${
                        i === activeMemeIndex
                          ? "border-primary ring-2 ring-primary/25"
                          : "border-border"
                      }`}
                    >
                      <div className="relative aspect-square bg-black">
                        <Image
                          src={meme.imageUrl}
                          alt={`Generated meme ${i + 1}`}
                          fill
                          unoptimized
                          priority={i === 0}
                          className="object-contain transition-transform duration-300 group-hover:scale-[1.03]"
                          sizes="(max-width: 768px) 260px, 320px"
                        />
                      </div>
                      <div className="flex items-center justify-between px-3 py-2 text-xs font-semibold">
                        <span>Meme {i + 1}</span>
                        <a
                          href={meme.imageUrl}
                          download={`hirezzai-meme-${i + 1}.jpg`}
                          target="_blank"
                          rel="noreferrer"
                          onClick={e => e.stopPropagation()}
                          className="flex items-center gap-1 text-muted-foreground transition-colors hover:text-foreground"
                        >
                          <Download className="h-3.5 w-3.5" />
                          Download
                        </a>
                      </div>
                    </button>
                  ))}
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
                {PRIORITY_LABEL[topFix.priority] ?? topFix.priority}
              </Badge>
            </div>
          )}

          <div className="grid gap-6 md:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
            <div className="flex flex-col gap-4">
              <div>
                <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
                  <h4 className="text-sm font-semibold text-muted-foreground">
                    Brainrot diagnosis
                  </h4>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={toggleBrainrotVoice}
                  >
                    {isBrainrotSpeaking ? (
                      <Square className="h-4 w-4" />
                    ) : (
                      <Volume2 className="h-4 w-4" />
                    )}
                    {isBrainrotSpeaking ? "Stop yap" : "Read funny"}
                  </Button>
                </div>
                <p className="rounded-md border border-primary/40 bg-primary/5 p-3 text-sm italic leading-relaxed">
                  {result.brainrotDiagnosis}
                </p>
                {speechError && (
                  <p className="mt-2 text-xs font-medium text-destructive">
                    {speechError}
                  </p>
                )}
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
                    Pick the meme that matches your application aura.
                  </p>
                </div>
                <div className="relative" ref={shareDropdownRef}>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShareOpen(o => !o)}
                  >
                    <Share2 className="h-4 w-4" />
                    Share
                  </Button>
                  {shareOpen && (
                    <div className="absolute right-0 top-full z-50 mt-1 w-44 overflow-hidden rounded-xl border border-border bg-card shadow-xl">
                      <a
                        href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent("https://hirezz-ai.vercel.app")}`}
                        target="_blank"
                        rel="noreferrer"
                        onClick={() => setShareOpen(false)}
                        className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm hover:bg-muted"
                      >
                        <span>🔗</span> LinkedIn
                      </a>
                      <a
                        href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText(result))}`}
                        target="_blank"
                        rel="noreferrer"
                        onClick={() => setShareOpen(false)}
                        className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm hover:bg-muted"
                      >
                        <span>𝕏</span> X / Twitter
                      </a>
                      <button
                        type="button"
                        onClick={() => void handleSocialShare("instagram")}
                        className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm hover:bg-muted"
                      >
                        {(copiedKey === "share-instagram") ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <span>📷</span>}
                        {copiedKey === "share-instagram" ? "Copied!" : "Instagram"}
                      </button>
                      <button
                        type="button"
                        onClick={() => void handleSocialShare("tiktok")}
                        className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm hover:bg-muted"
                      >
                        {(copiedKey === "share-tiktok") ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <span>🎵</span>}
                        {copiedKey === "share-tiktok" ? "Copied!" : "TikTok"}
                      </button>
                    </div>
                  )}
                </div>
              </div>
              <div className="overflow-hidden rounded-lg border border-primary/30 bg-background">
                {auraMeme && (
                  <div className="relative aspect-[16/10] bg-black">
                    <Image
                      src={auraMeme.imageUrl}
                      alt="Selected aura meme"
                      fill
                      unoptimized
                      className="object-contain"
                      sizes="(max-width: 768px) 100vw, 420px"
                    />
                  </div>
                )}
                <div className="p-4">
                <p className="text-xs font-semibold uppercase text-muted-foreground">
                  Application Aura
                </p>
                <div className="mt-2 flex items-start justify-between gap-4">
                  <div>
                    <p className="text-5xl font-black">{result.auraScore}</p>
                    <p className="text-xs text-muted-foreground">Aura Score</p>
                  </div>
                  <Badge className="bg-primary text-primary-foreground align-top">
                    {verdictTitle(result.level)}
                  </Badge>
                </div>
                <div className="mt-4 grid gap-2 text-sm">
                  <p className="font-semibold">
                    {result.level === "cooked"
                      ? "ATS saw the resume and started buffering."
                      : result.level === "locked-in"
                        ? "Recruiter POV: this one understood the assignment."
                        : "The resume has rizz, but the receipts are still loading."}
                  </p>
                  <p className="text-muted-foreground">{result.recruiterPOV}</p>
                </div>
                <div className="mt-4 grid grid-cols-5 gap-2">
                  {result.memes.map((meme, i) => (
                    <button
                      key={`${meme.templateId}-aura-${i}`}
                      type="button"
                      onClick={() => setAuraMemeIndex(i)}
                      className={`relative aspect-square overflow-hidden rounded-md border ${
                        i === auraMemeIndex ? "border-primary ring-2 ring-primary/30" : "border-border"
                      }`}
                    >
                      <Image
                        src={meme.imageUrl}
                        alt={`Aura meme option ${i + 1}`}
                        fill
                        unoptimized
                        className="object-cover"
                        sizes="80px"
                      />
                    </button>
                  ))}
                </div>
                </div>
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
          <CardDescription>Short quests. Highest impact first.</CardDescription>
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
                    {PRIORITY_LABEL[g.priority] ?? g.priority}
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
          <div className="flex flex-col gap-4">
            {/* Title row */}
            <div className="flex items-center justify-between gap-3">
              <div>
                <CardTitle>Improved Resume</CardTitle>
                <CardDescription>
                  AI-improved summary + bullet rewrites. Export as PDF or DOCX.
                </CardDescription>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={downloadTxt}
              >
                <Download className="h-4 w-4" />
                TXT
              </Button>
            </div>

            {/* Magic Fix banner */}
            <div className="rounded-xl border border-primary/30 bg-primary/5 p-4">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="flex items-center gap-1.5 font-semibold">
                    <Wand2 className="h-4 w-4 text-primary" />
                    Magic Fix
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Applies {result.bulletGlowUp.length} bullet rewrite
                    {result.bulletGlowUp.length !== 1 ? "s" : ""} + improved
                    summary into one polished document. Downloads immediately.
                  </p>
                </div>
                <div className="flex shrink-0 flex-wrap gap-2">
                  {/* PDF — opens in new tab with print button */}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleMagicPdf}
                    className="gap-1.5"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Open PDF
                  </Button>
                  {/* DOCX — downloads directly */}
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleMagicDocx}
                    disabled={isMagicWorking}
                    className="btn-cook gap-1.5"
                  >
                    {isMagicWorking ? (
                      <RefreshCw className="h-4 w-4 animate-spin" />
                    ) : (
                      <Download className="h-4 w-4" />
                    )}
                    {isMagicWorking ? "Building…" : "Download DOCX"}
                  </Button>
                </div>
              </div>
            </div>
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

      {lightboxIndex !== null && result.memes[lightboxIndex] && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 backdrop-blur-sm"
          onClick={() => setLightboxIndex(null)}
        >
          <div
            className="relative max-h-[90vh] max-w-[90vw]"
            onClick={e => e.stopPropagation()}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={result.memes[lightboxIndex].imageUrl}
              alt={`Meme ${lightboxIndex + 1}`}
              className="max-h-[85vh] max-w-[90vw] rounded-xl object-contain shadow-2xl"
            />
            <button
              type="button"
              onClick={() => setLightboxIndex(null)}
              aria-label="Close"
              className="absolute -right-3 -top-3 flex h-8 w-8 items-center justify-center rounded-full bg-card text-foreground shadow-lg hover:bg-muted"
            >
              ✕
            </button>
          </div>
        </div>
      )}

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
