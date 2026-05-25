"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { RoastResult } from "@/types";

/* ─── Geometry constants ─────────────────────────────── */
const SVG_W         = 130;
const SVG_H         = 215;
const INTRO_SCALE   = 1.65;
const CORNER_SCALE  = 1.0;
const INTRO_CENTER_Y_PCT = 0.34;
const TRANSITION_OVER_VH = 0.5;

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * Math.max(0, Math.min(1, t));
}

/* ─── SVG Character ──────────────────────────────────── */
function ChefSVG() {
  return (
    <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} width={SVG_W} height={SVG_H}
      xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <ellipse cx="65" cy="9" rx="31" ry="13" fill="white" stroke="#111" strokeWidth="2.5" />
      <rect x="28" y="8" width="74" height="56" rx="4" fill="white" stroke="#111" strokeWidth="2.5" />
      <rect x="20" y="62" width="90" height="14" rx="4" fill="#E0E0E0" stroke="#111" strokeWidth="2.5" />
      <path d="M32 36 Q40 24 48 36 Q56 24 64 36 Q72 24 80 36 Q88 24 96 36"
        stroke="#FF6B35" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <circle cx="65" cy="108" r="36" fill="#FFDBB5" stroke="#111" strokeWidth="3" />
      <circle cx="50" cy="101" r="9.5" fill="white" stroke="#111" strokeWidth="2.5" />
      <circle cx="51.5" cy="102.5" r="5" fill="#111" />
      <circle cx="53"   cy="100"   r="2" fill="white" />
      <circle cx="80" cy="101" r="9.5" fill="white" stroke="#111" strokeWidth="2.5" />
      <circle cx="81.5" cy="102.5" r="5" fill="#111" />
      <circle cx="83"   cy="100"   r="2" fill="white" />
      <path d="M40 88 Q50 80 60 88" stroke="#7a4e2d" strokeWidth="4.5" fill="none" strokeLinecap="round" />
      <path d="M70 88 Q80 80 90 88" stroke="#7a4e2d" strokeWidth="4.5" fill="none" strokeLinecap="round" />
      <path d="M48 120 Q65 136 82 120" stroke="#111" strokeWidth="3" fill="none" strokeLinecap="round" />
      <circle cx="35" cy="112" r="9" fill="#FF9B7A" opacity="0.38" />
      <circle cx="95" cy="112" r="9" fill="#FF9B7A" opacity="0.38" />
      <path d="M50 127 Q65 121 80 127" stroke="#7a4e2d" strokeWidth="4" fill="none" strokeLinecap="round" />
      <rect x="15" y="138" width="100" height="58" rx="14" fill="#FF6B35" stroke="#111" strokeWidth="3" />
      <path d="M44 138 L65 158 L86 138" fill="white" stroke="#111" strokeWidth="2.5" />
      <circle cx="65" cy="166" r="4.5" fill="white" stroke="#111" strokeWidth="2" />
      <circle cx="65" cy="180" r="4.5" fill="white" stroke="#111" strokeWidth="2" />
      <circle cx="65" cy="194" r="4.5" fill="white" stroke="#111" strokeWidth="2" />
      <g style={{ transformBox: "fill-box", transformOrigin: "50% 0%", transform: "rotate(0deg)" }}>
        <rect x="0" y="118" width="20" height="46" rx="10"
          fill="#FF6B35" stroke="#111" strokeWidth="2.5" transform="rotate(-52, 10, 142)" />
        <circle cx="2"  cy="120" r="12" fill="#FFDBB5" stroke="#111" strokeWidth="2.5" />
        <circle cx="10" cy="112" r="6"  fill="#FFDBB5" stroke="#111" strokeWidth="2" />
      </g>
      <rect x="110" y="140" width="20" height="44" rx="10"
        fill="#FF6B35" stroke="#111" strokeWidth="2.5" transform="rotate(18, 120, 145)" />
      <circle cx="120" cy="180" r="11" fill="#FFDBB5" stroke="#111" strokeWidth="2.5"
        transform="rotate(18, 120, 145)" />
      <rect   x="116" y="105" width="9"  height="55" rx="4.5" fill="#8B5E3C" stroke="#111" strokeWidth="2" />
      <rect   x="109" y="101" width="23" height="13" rx="4"   fill="#B8B8B8" stroke="#111" strokeWidth="2" />
      <circle cx="115" cy="107" r="2.5" fill="#111" opacity="0.3" />
      <circle cx="122" cy="107" r="2.5" fill="#111" opacity="0.3" />
      <path d="M10 210 Q18 192 25 203 Q32 186 39 202 Q46 188 53 210Z" fill="#FF6B35" opacity="0.9" />
      <path d="M68 210 Q76 190 83 202 Q90 185 97 202 Q104 190 115 210Z" fill="#FF1744" opacity="0.9" />
      <path d="M16 210 Q24 196 31 208 Q38 192 45 210Z" fill="#FFB347" opacity="0.95" />
      <path d="M74 210 Q82 196 89 208 Q96 192 103 210Z" fill="#FFB347" opacity="0.95" />
    </svg>
  );
}

/* ─── Chat types ─────────────────────────────────────── */
type Message = { role: "user" | "chef"; text: string };

function getInitialMessages(hasResult: boolean): Message[] {
  return [{
    role: "chef",
    text: hasResult
      ? "Yo! I'm Chef Recruiter 🍳 I just finished cooking your resume — ask me anything about your results or how to level up!"
      : "Yo! I'm Chef Recruiter 🍳 Ask me anything about resumes or job hunting. Submit your resume above for a full roast first!",
  }];
}

/* ─── Main component ─────────────────────────────────── */
export function ChefCharacter({ roastContext }: { roastContext?: RoastResult | null }) {
  const [xform,      setXform]      = useState("translate(-9999px,-9999px)");
  const [opacity,    setOpacity]    = useState(0);
  const [inCorner,   setInCorner]   = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [messages,   setMessages]   = useState<Message[]>(() => getInitialMessages(!!roastContext));
  const [input,      setInput]      = useState("");
  const [chatLoading, setChatLoading] = useState(false);

  const startPos  = useRef({ x: 0, y: 0 });
  const endPos    = useRef({ x: 0, y: 0 });
  const rafId     = useRef(0);
  const bottomRef = useRef<HTMLDivElement>(null);

  function calcPositions() {
    const vw = window.innerWidth, vh = window.innerHeight;
    startPos.current = {
      x: vw / 2 - (SVG_W * INTRO_SCALE) / 2,
      y: vh * INTRO_CENTER_Y_PCT - (SVG_H * INTRO_SCALE) / 2,
    };
    endPos.current = {
      x: vw - SVG_W  * CORNER_SCALE - 16,
      y: vh - SVG_H  * CORNER_SCALE - 16,
    };
  }

  function syncTransform() {
    const raw  = window.scrollY / (window.innerHeight * TRANSITION_OVER_VH);
    const prog = Math.max(0, Math.min(1, raw));
    const x    = lerp(startPos.current.x, endPos.current.x, prog);
    const y    = lerp(startPos.current.y, endPos.current.y, prog);
    const s    = lerp(INTRO_SCALE, CORNER_SCALE, prog);
    setXform(`translate(${x}px,${y}px) scale(${s})`);
    setInCorner(prog >= 1);
  }

  useLayoutEffect(() => {
    calcPositions();
    syncTransform();
    setOpacity(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const onScroll = () => {
      cancelAnimationFrame(rafId.current);
      rafId.current = requestAnimationFrame(syncTransform);
    };
    const onResize = () => { calcPositions(); syncTransform(); };
    window.addEventListener("scroll",  onScroll, { passive: true });
    window.addEventListener("resize",  onResize, { passive: true });
    return () => {
      window.removeEventListener("scroll",  onScroll);
      window.removeEventListener("resize",  onResize);
      cancelAnimationFrame(rafId.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-scroll chat to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, chatLoading]);

  // Close chat if chef leaves corner
  useEffect(() => {
    if (!inCorner) setIsChatOpen(false);
  }, [inCorner]);

  // Reset greeting when a new roast result comes in
  useEffect(() => {
    setMessages(getInitialMessages(!!roastContext));
  }, [roastContext]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || chatLoading) return;
    setInput("");
    const next: Message[] = [...messages, { role: "user", text }];
    setMessages(next);
    setChatLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, history: next, roastContext: roastContext ?? null }),
      });
      const data = await res.json() as { reply: string };
      setMessages(prev => [...prev, { role: "chef", text: data.reply }]);
    } catch {
      setMessages(prev => [...prev, { role: "chef", text: "Kitchen's on fire rn 🔥 — try again!" }]);
    } finally {
      setChatLoading(false);
    }
  };

  return (
    <>
      {/* ── Chef character ── */}
      <div
        className="fixed left-0 top-0 z-[9990]"
        style={{
          transform: xform,
          transformOrigin: "top left",
          opacity,
          transition: "opacity 0.35s ease",
          pointerEvents: inCorner ? "auto" : "none",
          cursor: inCorner ? "pointer" : "default",
        }}
        onClick={() => inCorner && setIsChatOpen(o => !o)}
        title={inCorner ? "Chat with Chef Recruiter" : undefined}
      >
        <div style={{
          animation: inCorner ? "chef-idle 2.2s ease-in-out infinite" : undefined,
          filter: "drop-shadow(0 8px 28px rgba(255,107,53,0.45))",
        }}>
          <ChefSVG />
        </div>

        {/* Pulse ring when in corner and chat is closed */}
        {inCorner && !isChatOpen && (
          <span className="absolute -right-1 -top-1 flex h-4 w-4">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-orange-400 opacity-75" />
            <span className="relative inline-flex h-4 w-4 rounded-full bg-orange-500" />
          </span>
        )}
      </div>

      {/* ── Chat panel ── */}
      {inCorner && isChatOpen && (
        <div
          className="fixed z-[9991] flex flex-col overflow-hidden rounded-2xl border border-border/50 bg-card/95 shadow-2xl backdrop-blur-xl"
          style={{ bottom: "248px", right: "16px", width: "300px", height: "380px" }}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border/40 bg-primary/10 px-4 py-2.5">
            <div className="flex items-center gap-2">
              <span className="text-base">🍳</span>
              <span className="font-display text-sm tracking-widest text-foreground">CHEF RECRUITER</span>
            </div>
            <button
              onClick={() => setIsChatOpen(false)}
              className="text-muted-foreground transition-colors hover:text-foreground"
              aria-label="Close chat"
            >
              ✕
            </button>
          </div>

          {/* Messages */}
          <div className="flex flex-1 flex-col gap-2 overflow-y-auto p-3">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[88%] rounded-xl px-3 py-2 text-xs leading-relaxed ${
                  m.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "border border-border/40 bg-muted/60"
                }`}>
                  {m.text}
                </div>
              </div>
            ))}
            {chatLoading && (
              <div className="flex justify-start">
                <div className="rounded-xl border border-border/40 bg-muted/60 px-3 py-2 text-xs text-muted-foreground">
                  <span className="animate-pulse">cooking a response…</span>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="flex gap-2 border-t border-border/40 p-2">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && void sendMessage()}
              placeholder="Ask Chef…"
              disabled={chatLoading}
              className="flex-1 rounded-lg border border-border/50 bg-muted/30 px-3 py-1.5 text-xs placeholder:text-muted-foreground/60 focus:border-primary/50 focus:outline-none disabled:opacity-50"
            />
            <button
              onClick={() => void sendMessage()}
              disabled={chatLoading || !input.trim()}
              className="rounded-lg bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground transition-opacity disabled:opacity-40"
            >
              Send
            </button>
          </div>
        </div>
      )}
    </>
  );
}
