"use client";

import { useEffect, useRef, useState, type ReactNode, type CSSProperties } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

/* ──────────────────────────────────────────────────────────────────────────
   RevealObserver — mount once per page. Any element with `data-reveal`
   fades/slides in when it enters the viewport. Stagger with style="--d:120ms".
   Content is only hidden once JS has mounted (html.reveal-ready), so it is
   never invisible for no-JS visitors or crawlers.
   ────────────────────────────────────────────────────────────────────────── */
export function RevealObserver() {
  useEffect(() => {
    const root = document.documentElement;
    root.classList.add("reveal-ready");
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add("is-revealed");
            io.unobserve(e.target);
          }
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -60px 0px" }
    );
    const els = document.querySelectorAll("[data-reveal]");
    els.forEach((el) => io.observe(el));
    return () => {
      io.disconnect();
      root.classList.remove("reveal-ready");
    };
  }, []);
  return null;
}

/* ──────────────────────────────────────────────────────────────────────────
   TiltCard — pointer-follow 3D tilt with a gold spotlight under the cursor.
   ────────────────────────────────────────────────────────────────────────── */
export function TiltCard({
  children,
  className = "",
  max = 8,
  style,
}: {
  children: ReactNode;
  className?: string;
  max?: number;
  style?: CSSProperties;
}) {
  const ref = useRef<HTMLDivElement>(null);

  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el || e.pointerType === "touch") return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    el.style.setProperty("--rx", `${(0.5 - py) * max}deg`);
    el.style.setProperty("--ry", `${(px - 0.5) * max}deg`);
    el.style.setProperty("--mx", `${px * 100}%`);
    el.style.setProperty("--my", `${py * 100}%`);
  };
  const onLeave = () => {
    const el = ref.current;
    if (!el) return;
    el.style.setProperty("--rx", "0deg");
    el.style.setProperty("--ry", "0deg");
  };

  return (
    <div ref={ref} onPointerMove={onMove} onPointerLeave={onLeave} className={`tilt-card ${className}`} style={style}>
      {children}
      <span className="tilt-card__spot" aria-hidden />
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────────────
   CountUp — counts from 0 to `value` once visible.
   ────────────────────────────────────────────────────────────────────────── */
export function CountUp({ value, duration = 1600, suffix = "" }: { value: number; duration?: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [n, setN] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    const io = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      io.disconnect();
      if (reduce) {
        setN(value);
        return;
      }
      const start = performance.now();
      const tick = (t: number) => {
        const p = Math.min(1, (t - start) / duration);
        const eased = 1 - Math.pow(1 - p, 3);
        setN(Math.round(value * eased));
        if (p < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    });
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [value, duration]);

  return (
    <span ref={ref} className="tabular-nums">
      {n.toLocaleString()}
      {suffix}
    </span>
  );
}

/* ──────────────────────────────────────────────────────────────────────────
   Rail — horizontal snap-scroll row with arrow buttons and a progress bar.
   ────────────────────────────────────────────────────────────────────────── */
export function Rail({ children, title, eyebrow, action }: { children: ReactNode; title: ReactNode; eyebrow: string; action?: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const [thumb, setThumb] = useState(100);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => {
      const max = el.scrollWidth - el.clientWidth;
      setThumb(Math.max(12, (el.clientWidth / el.scrollWidth) * 100));
      setProgress(max > 0 ? el.scrollLeft / max : 0);
    };
    update();
    el.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      el.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  const scrollBy = (dir: number) => {
    const el = ref.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: "smooth" });
  };

  return (
    <div>
      <div className="mb-8 flex items-end justify-between gap-4">
        <div>
          <div className="page-hero__eyebrow">{eyebrow}</div>
          <h2 className="mt-3 font-display text-4xl font-bold uppercase leading-[0.95] text-white md:text-5xl">{title}</h2>
        </div>
        <div className="flex items-center gap-2">
          {action}
          <button onClick={() => scrollBy(-1)} aria-label="Scroll left" className="rail-btn">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button onClick={() => scrollBy(1)} aria-label="Scroll right" className="rail-btn">
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
      <div ref={ref} className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-px-4 px-4 pb-6 pt-2 sm:-mx-6 sm:scroll-px-6 sm:px-6 lg:-mx-8 lg:scroll-px-8 lg:px-8">
        {children}
      </div>
      <div className="relative mt-2 h-[3px] w-full overflow-hidden rounded-full bg-white/[0.06]">
        <div
          className="absolute inset-y-0 rounded-full bg-[image:var(--gradient-primary)] shadow-[0_0_10px_rgba(242,193,78,0.7)] transition-[left] duration-150"
          style={{ width: `${thumb}%`, left: `${progress * (100 - thumb)}%` }}
        />
      </div>
    </div>
  );
}

/* Highlighted word: black text on a slanted gold block. */
export function GoldBlock({ children }: { children: ReactNode }) {
  return <span className="gold-block">{children}</span>;
}
