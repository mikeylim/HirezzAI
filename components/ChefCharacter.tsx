"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";

/* ─── Geometry constants ─────────────────────────────── */
const SVG_W         = 130;
const SVG_H         = 215;
const INTRO_SCALE   = 1.65;   // visual size ≈ 214 × 354
const CORNER_SCALE  = 1.0;
const INTRO_CENTER_Y_PCT = 0.34;  // chef visual-center sits at 34% of viewport height

/** Fraction of viewport height over which the transition runs */
const TRANSITION_OVER_VH = 0.5;

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * Math.max(0, Math.min(1, t));
}

/* ─── SVG Character ──────────────────────────────────── */
function ChefSVG() {
  return (
    <svg
      viewBox={`0 0 ${SVG_W} ${SVG_H}`}
      width={SVG_W}
      height={SVG_H}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      {/* Toque — puff top */}
      <ellipse cx="65" cy="9" rx="31" ry="13" fill="white" stroke="#111" strokeWidth="2.5" />
      {/* Toque — body */}
      <rect x="28" y="8" width="74" height="56" rx="4" fill="white" stroke="#111" strokeWidth="2.5" />
      {/* Toque — band */}
      <rect x="20" y="62" width="90" height="14" rx="4" fill="#E0E0E0" stroke="#111" strokeWidth="2.5" />
      {/* Toque — fire stripe */}
      <path d="M32 36 Q40 24 48 36 Q56 24 64 36 Q72 24 80 36 Q88 24 96 36"
        stroke="#FF6B35" strokeWidth="2.5" fill="none" strokeLinecap="round" />

      {/* Head */}
      <circle cx="65" cy="108" r="36" fill="#FFDBB5" stroke="#111" strokeWidth="3" />

      {/* Left eye */}
      <circle cx="50" cy="101" r="9.5" fill="white" stroke="#111" strokeWidth="2.5" />
      <circle cx="51.5" cy="102.5" r="5" fill="#111" />
      <circle cx="53"   cy="100"   r="2" fill="white" />
      {/* Right eye */}
      <circle cx="80" cy="101" r="9.5" fill="white" stroke="#111" strokeWidth="2.5" />
      <circle cx="81.5" cy="102.5" r="5" fill="#111" />
      <circle cx="83"   cy="100"   r="2" fill="white" />

      {/* Eyebrows */}
      <path d="M40 88 Q50 80 60 88" stroke="#7a4e2d" strokeWidth="4.5" fill="none" strokeLinecap="round" />
      <path d="M70 88 Q80 80 90 88" stroke="#7a4e2d" strokeWidth="4.5" fill="none" strokeLinecap="round" />

      {/* Smile */}
      <path d="M48 120 Q65 136 82 120" stroke="#111" strokeWidth="3" fill="none" strokeLinecap="round" />

      {/* Blush */}
      <circle cx="35" cy="112" r="9" fill="#FF9B7A" opacity="0.38" />
      <circle cx="95" cy="112" r="9" fill="#FF9B7A" opacity="0.38" />

      {/* Mustache */}
      <path d="M50 127 Q65 121 80 127" stroke="#7a4e2d" strokeWidth="4" fill="none" strokeLinecap="round" />

      {/* Body */}
      <rect x="15" y="138" width="100" height="58" rx="14" fill="#FF6B35" stroke="#111" strokeWidth="3" />
      {/* Collar */}
      <path d="M44 138 L65 158 L86 138" fill="white" stroke="#111" strokeWidth="2.5" />
      {/* Buttons */}
      <circle cx="65" cy="166" r="4.5" fill="white" stroke="#111" strokeWidth="2" />
      <circle cx="65" cy="180" r="4.5" fill="white" stroke="#111" strokeWidth="2" />
      <circle cx="65" cy="194" r="4.5" fill="white" stroke="#111" strokeWidth="2" />

      {/* Left arm — raised in greeting */}
      <g style={{ transformBox: "fill-box", transformOrigin: "50% 0%", transform: "rotate(0deg)" }}>
        <rect x="0" y="118" width="20" height="46" rx="10"
          fill="#FF6B35" stroke="#111" strokeWidth="2.5"
          transform="rotate(-52, 10, 142)" />
        <circle cx="2"  cy="120" r="12" fill="#FFDBB5" stroke="#111" strokeWidth="2.5" />
        <circle cx="10" cy="112" r="6"  fill="#FFDBB5" stroke="#111" strokeWidth="2" />
      </g>

      {/* Right arm + spatula */}
      <rect x="110" y="140" width="20" height="44" rx="10"
        fill="#FF6B35" stroke="#111" strokeWidth="2.5"
        transform="rotate(18, 120, 145)" />
      <circle cx="120" cy="180" r="11" fill="#FFDBB5" stroke="#111" strokeWidth="2.5"
        transform="rotate(18, 120, 145)" />
      <rect   x="116" y="105" width="9"  height="55" rx="4.5" fill="#8B5E3C" stroke="#111" strokeWidth="2" />
      <rect   x="109" y="101" width="23" height="13" rx="4"   fill="#B8B8B8" stroke="#111" strokeWidth="2" />
      <circle cx="115" cy="107" r="2.5" fill="#111" opacity="0.3" />
      <circle cx="122" cy="107" r="2.5" fill="#111" opacity="0.3" />

      {/* Fire at feet */}
      <path d="M10 210 Q18 192 25 203 Q32 186 39 202 Q46 188 53 210Z" fill="#FF6B35" opacity="0.9" />
      <path d="M68 210 Q76 190 83 202 Q90 185 97 202 Q104 190 115 210Z" fill="#FF1744" opacity="0.9" />
      <path d="M16 210 Q24 196 31 208 Q38 192 45 210Z" fill="#FFB347" opacity="0.95" />
      <path d="M74 210 Q82 196 89 208 Q96 192 103 210Z" fill="#FFB347" opacity="0.95" />
    </svg>
  );
}

/* ─── Main component ─────────────────────────────────── */
export function ChefCharacter() {
  const [xform,    setXform]    = useState("translate(-9999px,-9999px)");
  const [opacity,  setOpacity]  = useState(0);
  const [inCorner, setInCorner] = useState(false);

  const startPos = useRef({ x: 0, y: 0 });
  const endPos   = useRef({ x: 0, y: 0 });
  const rafId    = useRef(0);

  function calcPositions() {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    // Visual centre of the intro chef = (50vw, 34vh)
    startPos.current = {
      x: vw / 2 - (SVG_W * INTRO_SCALE) / 2,
      y: vh * INTRO_CENTER_Y_PCT - (SVG_H * INTRO_SCALE) / 2,
    };
    // Corner: 16px from right + bottom edges
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

  // Measure on first paint (synchronous so no flash)
  useLayoutEffect(() => {
    calcPositions();
    syncTransform();
    setOpacity(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Scroll + resize
  useEffect(() => {
    const onScroll = () => {
      cancelAnimationFrame(rafId.current);
      rafId.current = requestAnimationFrame(syncTransform);
    };
    const onResize = () => { calcPositions(); syncTransform(); };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      cancelAnimationFrame(rafId.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      className="pointer-events-none fixed left-0 top-0 z-[9990]"
      style={{
        transform: xform,
        transformOrigin: "top left",
        opacity,
        transition: "opacity 0.35s ease",
      }}
    >
      <div
        style={{
          animation: inCorner ? "chef-idle 2.2s ease-in-out infinite" : undefined,
          filter: "drop-shadow(0 8px 28px rgba(255,107,53,0.45))",
        }}
      >
        <ChefSVG />
      </div>
    </div>
  );
}
