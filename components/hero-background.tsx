"use client";

import { useEffect, useRef } from "react";

export function HeroBackground() {
  const spotRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const spot = spotRef.current;
    if (!spot) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      spot.style.opacity = "0";
      return;
    }

    let targetX = window.innerWidth / 2;
    let targetY = window.innerHeight / 3;
    let x = targetX;
    let y = targetY;
    let raf = 0;

    const onMove = (e: MouseEvent) => {
      targetX = e.clientX;
      targetY = e.clientY;
    };

    const tick = () => {
      x += (targetX - x) * 0.08;
      y += (targetY - y) * 0.08;
      spot.style.setProperty("--spot-x", `${x}px`);
      spot.style.setProperty("--spot-y", `${y}px`);
      raf = requestAnimationFrame(tick);
    };

    window.addEventListener("mousemove", onMove);
    raf = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <div
        ref={spotRef}
        className="absolute inset-0 opacity-80"
        style={{
          background:
            "radial-gradient(700px circle at var(--spot-x, 50%) var(--spot-y, 30%), rgba(16, 185, 129, 0.15), rgba(20, 184, 166, 0.07) 40%, transparent 65%)",
        }}
      />
      <div
        className="absolute -top-48 -left-40 h-[640px] w-[640px] rounded-full bg-emerald-500/20 blur-[130px]"
        style={{ animation: "aurora-drift-1 26s ease-in-out infinite" }}
      />
      <div
        className="absolute top-16 right-[-160px] h-[560px] w-[560px] rounded-full bg-teal-500/18 blur-[130px]"
        style={{ animation: "aurora-drift-2 32s ease-in-out infinite" }}
      />
      <div
        className="absolute top-[45%] left-[-140px] h-[500px] w-[500px] rounded-full bg-emerald-600/12 blur-[120px]"
        style={{ animation: "aurora-drift-3 24s ease-in-out infinite" }}
      />
      <div
        className="absolute bottom-[-180px] right-1/4 h-[520px] w-[520px] rounded-full bg-sky-500/12 blur-[120px]"
        style={{ animation: "aurora-drift-2 38s ease-in-out infinite reverse" }}
      />
      <div
        className="dot-grid absolute inset-0"
        style={{
          maskImage: "linear-gradient(to bottom, black 0%, rgba(0, 0, 0, 0.6) 40%, rgba(0, 0, 0, 0.35) 70%, transparent 100%)",
          WebkitMaskImage: "linear-gradient(to bottom, black 0%, rgba(0, 0, 0, 0.6) 40%, rgba(0, 0, 0, 0.35) 70%, transparent 100%)",
        }}
      />
    </div>
  );
}
