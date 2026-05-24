"use client";

import { useEffect, useRef, useState } from "react";

export function FlamesCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const [clicked, setClicked] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const cursor = cursorRef.current;
    const glow = glowRef.current;
    if (!cursor || !glow) return;

    let mx = -200, my = -200;
    let gx = -200, gy = -200;
    let rafId: number;

    const onMove = (e: MouseEvent) => {
      mx = e.clientX;
      my = e.clientY;
      if (!visible) setVisible(true);
    };

    const onClick = () => {
      setClicked(true);
      setTimeout(() => setClicked(false), 350);
    };

    const onLeave = () => setVisible(false);
    const onEnter = () => setVisible(true);

    const tick = () => {
      // Cursor snaps precisely to mouse
      cursor.style.transform = `translate(${mx - 14}px, ${my - 14}px)`;
      // Glow trails with easing
      gx += (mx - gx) * 0.09;
      gy += (my - gy) * 0.09;
      glow.style.transform = `translate(${gx - 28}px, ${gy - 28}px)`;
      rafId = requestAnimationFrame(tick);
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("click", onClick);
    document.documentElement.addEventListener("mouseleave", onLeave);
    document.documentElement.addEventListener("mouseenter", onEnter);
    rafId = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("click", onClick);
      document.documentElement.removeEventListener("mouseleave", onLeave);
      document.documentElement.removeEventListener("mouseenter", onEnter);
      cancelAnimationFrame(rafId);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      {/* Main cursor emoji */}
      <div
        ref={cursorRef}
        className="pointer-events-none fixed left-0 top-0 z-[9999] select-none text-2xl leading-none"
        aria-hidden
        style={{
          willChange: "transform",
          opacity: visible ? 1 : 0,
          transition: "opacity 0.15s ease",
          fontSize: clicked ? "1.75rem" : "1.5rem",
          transitionProperty: "opacity, font-size",
          transitionDuration: "0.15s",
        }}
      >
        {clicked ? "💥" : "🔥"}
      </div>

      {/* Trailing glow blob */}
      <div
        ref={glowRef}
        className="pointer-events-none fixed left-0 top-0 z-[9998] h-14 w-14 rounded-full blur-2xl"
        aria-hidden
        style={{
          background: "radial-gradient(circle, rgba(255,107,53,0.8) 0%, rgba(255,23,68,0.4) 50%, transparent 100%)",
          willChange: "transform",
          opacity: visible ? 0.35 : 0,
          transition: "opacity 0.15s ease",
        }}
      />
    </>
  );
}
