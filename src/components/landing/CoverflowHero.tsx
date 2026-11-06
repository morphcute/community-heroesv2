"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowRight, ChevronLeft, ChevronRight, Trophy, Calendar, Users } from "lucide-react";

export type HeroSlide = {
  key: string;
  eyebrow: string;
  lead: string; // words before the highlight
  highlight: string; // word on the gold block
  desc: string;
  href: string;
  cta: string;
  image?: string | null;
  mode?: string | null; // e.g. "5V5" for generated art
  meta?: { prize?: string; date?: string; slots?: string };
  live?: boolean;
};

const AUTO_MS = 5500;

export default function CoverflowHero({ slides }: { slides: HeroSlide[] }) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchX = useRef<number | null>(null);
  const n = slides.length;

  const go = useCallback((i: number) => setActive(((i % n) + n) % n), [n]);

  useEffect(() => {
    if (paused || n < 2) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;
    const t = setTimeout(() => go(active + 1), AUTO_MS);
    return () => clearTimeout(t);
  }, [active, paused, n, go]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if (e.key === "ArrowRight") go(active + 1);
      if (e.key === "ArrowLeft") go(active - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active, go]);

  return (
    <div
      className="relative"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
      onTouchEnd={(e) => {
        if (touchX.current == null) return;
        const dx = e.changedTouches[0].clientX - touchX.current;
        if (Math.abs(dx) > 40) go(active + (dx < 0 ? 1 : -1));
        touchX.current = null;
      }}
      aria-roledescription="carousel"
    >
      <div className="coverflow relative mx-auto h-[440px] sm:h-[480px] lg:h-[520px]">
        {slides.map((s, i) => {
          let off = i - active;
          if (off > n / 2) off -= n;
          if (off < -n / 2) off += n;
          const abs = Math.abs(off);
          const isActive = off === 0;
          const hidden = abs > 2;
          return (
            <div
              key={s.key}
              className="coverflow__slide"
              style={{
                transform: `translateX(calc(-50% + ${off * 56}%)) translateZ(${-abs * 160}px) rotateY(${off * -24}deg) scale(${1 - abs * 0.06})`,
                zIndex: 10 - abs,
                opacity: hidden ? 0 : 1,
                pointerEvents: hidden ? "none" : "auto",
              }}
              aria-hidden={!isActive}
              onClick={() => !isActive && go(i)}
            >
              <div className={`relative h-full overflow-hidden rounded-[22px] border ${isActive ? "border-primary/40 shadow-[0_40px_120px_-30px_rgba(242,193,78,0.45)]" : "border-white/10"} bg-[#0a0a0d]`}>
                {/* art */}
                {s.image ? (
                  <img src={s.image} alt="" className={`absolute inset-0 h-full w-full object-cover object-[50%_22%] transition-transform duration-[6000ms] ease-linear ${isActive ? "scale-110" : "scale-100"}`} />
                ) : (
                  <>
                    <div className="absolute inset-0 bg-[radial-gradient(90%_120%_at_85%_10%,rgba(242,193,78,0.25),transparent_55%),radial-gradient(60%_80%_at_100%_100%,rgba(176,122,23,0.3),transparent_60%)]" />
                    <div className="absolute right-[8%] top-0 h-full w-[45%] skew-x-[-18deg] bg-gradient-to-b from-primary/[0.12] to-transparent" />
                    <div className="absolute right-[30%] top-0 h-full w-[3px] skew-x-[-18deg] bg-gradient-to-b from-primary/80 via-primary/20 to-transparent" />
                    {s.mode ? (
                      <div className="pointer-events-none absolute -bottom-6 right-0 select-none font-display text-[10rem] font-bold leading-none text-transparent sm:text-[15rem]" style={{ WebkitTextStroke: "2px rgba(242,193,78,0.28)" }} aria-hidden>
                        {s.mode}
                      </div>
                    ) : null}
                    <Trophy className="absolute right-[12%] top-[14%] h-28 w-28 text-primary/15" strokeWidth={1} />
                  </>
                )}
                <div className="absolute inset-0 bg-gradient-to-r from-[#060608] via-[#060608]/75 to-[#060608]/5" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#060608]/90 via-transparent to-transparent" />

                {/* dim non-active */}
                <div className={`absolute inset-0 bg-[#060608] transition-opacity duration-700 ${isActive ? "opacity-0" : "opacity-55"}`} />

                {/* content */}
                <div className={`relative z-10 flex h-full flex-col justify-end p-6 transition-all duration-700 sm:p-10 ${isActive ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"}`}>
                  <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.28em] text-primary">
                    {s.live ? (
                      <span className="relative flex h-2 w-2">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-70" />
                        <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
                      </span>
                    ) : (
                      <span className="h-px w-6 bg-primary" />
                    )}
                    {s.eyebrow}
                  </div>
                  <h2 className="mt-4 max-w-[14ch] font-display text-[2.6rem] font-bold uppercase leading-[0.92] text-white sm:text-6xl lg:text-7xl">
                    {s.lead} <span className="gold-block">{s.highlight}</span>
                  </h2>
                  <p className="mt-4 max-w-md text-sm leading-relaxed text-slate-300/85 sm:text-base">{s.desc}</p>
                  {s.meta ? (
                    <div className="mt-4 flex flex-wrap gap-x-5 gap-y-1.5 text-[13px] text-slate-300">
                      {s.meta.prize ? (
                        <span className="flex items-center gap-1.5">
                          <Trophy className="h-3.5 w-3.5 text-primary" />
                          <span className="font-display text-base font-bold text-primary">{s.meta.prize}</span>
                        </span>
                      ) : null}
                      {s.meta.date ? (
                        <span className="flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5 text-slate-500" />
                          {s.meta.date}
                        </span>
                      ) : null}
                      {s.meta.slots ? (
                        <span className="flex items-center gap-1.5">
                          <Users className="h-3.5 w-3.5 text-slate-500" />
                          {s.meta.slots}
                        </span>
                      ) : null}
                    </div>
                  ) : null}
                  <div className="mt-7">
                    <Link href={s.href} tabIndex={isActive ? 0 : -1} className="action-button-primary group/cta">
                      {s.cta}
                      <ArrowRight className="h-4 w-4 transition-transform group-hover/cta:translate-x-1" />
                    </Link>
                  </div>
                </div>

                {/* progress bar on active */}
                {isActive && n > 1 ? (
                  <div className="absolute inset-x-0 bottom-0 z-20 h-[3px] bg-white/10">
                    <div
                      key={`${active}-${paused}`}
                      className="h-full bg-primary shadow-[0_0_10px_rgba(242,193,78,0.9)]"
                      style={{ width: paused ? "100%" : undefined, animation: paused ? undefined : `ch-progress ${AUTO_MS}ms linear forwards` }}
                    />
                  </div>
                ) : null}
              </div>
            </div>
          );
        })}

        {n > 1 ? (
          <>
            <button onClick={() => go(active - 1)} aria-label="Previous slide" className="rail-btn absolute left-1 top-1/2 z-30 hidden -translate-y-1/2 sm:left-4 sm:inline-flex">
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button onClick={() => go(active + 1)} aria-label="Next slide" className="rail-btn absolute right-1 top-1/2 z-30 hidden -translate-y-1/2 sm:right-4 sm:inline-flex">
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        ) : null}
      </div>

      {/* thumbnails / dots */}
      <div className="mt-6 flex items-center justify-center gap-2">
        {slides.map((s, i) => (
          <button
            key={s.key}
            onClick={() => go(i)}
            aria-label={`Go to slide ${i + 1}`}
            className={`h-1.5 rounded-full transition-all duration-500 ${i === active ? "w-10 bg-primary shadow-[0_0_10px_rgba(242,193,78,0.8)]" : "w-3 bg-white/20 hover:bg-white/40"}`}
          />
        ))}
      </div>
    </div>
  );
}
