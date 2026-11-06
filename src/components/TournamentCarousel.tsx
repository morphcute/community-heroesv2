"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Trophy, ArrowRight, Calendar, Users, Swords } from "lucide-react";

interface TournamentCarouselProps {
  tournaments: Array<{
    id: string;
    title: string;
    description: string | null;
    status: string;
    banner: string | null;
    prizePool: string | null;
    gameMode?: string | null;
    startDate?: Date | string | null;
    maxTeams?: number | null;
    _count?: { participants: number };
    admins: Array<{
      user: {
        name: string | null;
        image: string | null;
      };
    }>;
  }>;
}

const statusMeta: Record<string, { label: string; dot: string; text: string }> = {
  REGISTRATION_OPEN: { label: "Registration Open", dot: "bg-primary", text: "text-primary" },
  UPCOMING: { label: "Upcoming", dot: "bg-slate-300", text: "text-slate-200" },
  ONGOING: { label: "Live Now", dot: "bg-red-500", text: "text-red-400" },
};

const modeShort: Record<string, string> = {
  SOLO_1V1: "1V1",
  DUO_2V2: "2V2",
  TRIO_3V3: "3V3",
  TEAM_5V5: "5V5",
};

function formatPrize(raw: string | null) {
  let label = raw || "TBA";
  try {
    if (label.trim().startsWith("{") || label.trim().startsWith("[")) {
      const pData = JSON.parse(label);
      label = `${pData.total} ${pData.currency}`;
    }
  } catch {}
  return label;
}

const SLIDE_MS = 6000;

export default function TournamentCarousel({ tournaments }: TournamentCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (tournaments.length <= 1 || isHovered) return;
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % tournaments.length);
    }, SLIDE_MS);
    return () => clearInterval(interval);
  }, [tournaments.length, isHovered, currentIndex]);

  if (tournaments.length === 0) {
    return (
      <div className="hud-panel hud-corners flex min-h-[300px] items-center justify-center">
        <div className="p-6 text-center">
          <Trophy className="mx-auto mb-3 h-10 w-10 text-primary/40" />
          <div className="font-display text-xl font-bold uppercase tracking-wider text-foreground">No featured tournament yet</div>
          <div className="mt-1 text-sm text-muted-foreground">Check back soon for the next event</div>
        </div>
      </div>
    );
  }

  const handlePrev = () => setCurrentIndex((i) => (i - 1 + tournaments.length) % tournaments.length);
  const handleNext = () => setCurrentIndex((i) => (i + 1) % tournaments.length);

  const t = tournaments[currentIndex];
  const status = statusMeta[t.status] || { label: t.status.replaceAll("_", " "), dot: "bg-slate-400", text: "text-slate-300" };
  const creator = t.admins[0]?.user;
  const mode = t.gameMode ? modeShort[t.gameMode] ?? "" : "";
  const filled = t._count?.participants ?? 0;
  const start = t.startDate ? new Date(t.startDate) : null;

  return (
    <div
      className="group/carousel relative isolate flex min-h-[320px] flex-col overflow-hidden rounded-[var(--radius-hero)] border border-white/10 bg-[#09090c] shadow-[var(--shadow-hero)] sm:min-h-[360px]"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      aria-roledescription="carousel"
    >
      {/* ── Key art ───────────────────────────────────────── */}
      <div key={t.id} className="absolute inset-0 -z-10 animate-in fade-in duration-700">
        {t.banner ? (
          <>
            <img src={t.banner} alt="" className="absolute inset-0 h-full w-full object-cover opacity-60 transition-transform duration-[6000ms] ease-linear group-hover/carousel:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#09090c] via-[#09090c]/85 to-[#09090c]/20" />
          </>
        ) : (
          <>
            <div className="absolute inset-0 bg-[radial-gradient(90%_120%_at_85%_10%,rgba(242,193,78,0.22),transparent_55%),radial-gradient(60%_80%_at_100%_100%,rgba(176,122,23,0.25),transparent_60%)]" />
            {/* diagonal gold slashes */}
            <div className="absolute -right-10 top-0 h-full w-[55%] skew-x-[-18deg] bg-gradient-to-b from-primary/[0.10] to-transparent" />
            <div className="absolute right-[18%] top-0 h-full w-[3px] skew-x-[-18deg] bg-gradient-to-b from-primary/70 via-primary/20 to-transparent" />
            <div className="absolute right-[22%] top-0 h-full w-px skew-x-[-18deg] bg-gradient-to-b from-primary/40 to-transparent" />
            {/* giant outlined mode */}
            {mode ? (
              <div
                className="pointer-events-none absolute -right-4 bottom-[-0.15em] select-none font-display text-[9rem] font-bold leading-none tracking-tighter text-transparent sm:text-[13rem]"
                style={{ WebkitTextStroke: "1.5px rgba(242,193,78,0.22)" }}
                aria-hidden
              >
                {mode}
              </div>
            ) : null}
            <Trophy className="absolute right-[12%] top-[18%] hidden h-24 w-24 text-primary/15 sm:block" strokeWidth={1} />
          </>
        )}
        {/* fine grid */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:linear-gradient(90deg,transparent,black)]" />
      </div>

      {/* top gold rule */}
      <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent opacity-80" />

      {/* ── Content ───────────────────────────────────────── */}
      <div key={`c-${t.id}`} className="relative z-10 flex flex-1 flex-col p-5 sm:p-7 animate-in fade-in slide-in-from-left-4 duration-500">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-muted-foreground">Featured</span>
            <span className="h-3 w-px bg-white/15" />
            <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.2em] ${status.text}`}>
              <span className="relative flex h-1.5 w-1.5">
                {t.status === "ONGOING" || t.status === "REGISTRATION_OPEN" ? (
                  <span className={`absolute inline-flex h-full w-full animate-ping rounded-full ${status.dot} opacity-60`} />
                ) : null}
                <span className={`relative inline-flex h-1.5 w-1.5 rounded-full ${status.dot}`} />
              </span>
              {status.label}
            </span>
          </div>
          {creator ? (
            <div className="hidden items-center gap-2 text-[11px] text-muted-foreground sm:flex">
              <span>Hosted by</span>
              <span className="font-semibold text-foreground">{creator.name}</span>
            </div>
          ) : null}
        </div>

        <div className="mt-auto max-w-xl pt-10">
          <h2 className="font-display text-[2.1rem] font-bold uppercase leading-[0.95] text-white sm:text-5xl">
            {t.title}
          </h2>
          {t.description ? (
            <p className="mt-3 line-clamp-2 max-w-md text-sm leading-relaxed text-slate-300/80">{t.description}</p>
          ) : null}

          {/* meta strip */}
          <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-[12px] text-slate-300">
            <span className="flex items-center gap-1.5">
              <Trophy className="h-3.5 w-3.5 text-primary" />
              <span className="font-display text-base font-bold text-primary">{formatPrize(t.prizePool)}</span>
            </span>
            {mode ? (
              <span className="flex items-center gap-1.5">
                <Swords className="h-3.5 w-3.5 text-muted-foreground" />
                {mode}
              </span>
            ) : null}
            {start ? (
              <span className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                {start.toLocaleDateString(undefined, { month: "short", day: "numeric" })}
              </span>
            ) : null}
            {t.maxTeams ? (
              <span className="flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5 text-muted-foreground" />
                {filled}/{t.maxTeams} slots
              </span>
            ) : null}
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between gap-3">
          <Link href={`/tournaments/${t.id}`} className="action-button-primary group/btn">
            Enter Arena
            <ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
          </Link>

          {tournaments.length > 1 && (
            <div className="flex items-center gap-1">
              <button
                onClick={handlePrev}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-black/40 text-slate-300 backdrop-blur transition-colors hover:border-primary/40 hover:text-primary"
                aria-label="Previous slide"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <div className="mx-1.5 font-display text-sm font-bold tabular-nums text-muted-foreground">
                <span className="text-foreground">{String(currentIndex + 1).padStart(2, "0")}</span>
                <span className="mx-1 opacity-50">/</span>
                {String(tournaments.length).padStart(2, "0")}
              </div>
              <button
                onClick={handleNext}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-black/40 text-slate-300 backdrop-blur transition-colors hover:border-primary/40 hover:text-primary"
                aria-label="Next slide"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* slide progress segments */}
      {tournaments.length > 1 && (
        <div className="absolute inset-x-0 bottom-0 z-10 flex gap-1 px-5 pb-0 sm:px-7">
          {tournaments.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentIndex(i)}
              aria-label={`Go to slide ${i + 1}`}
              className="relative h-[3px] flex-1 overflow-hidden bg-white/10"
            >
              {i < currentIndex ? <span className="absolute inset-0 bg-primary/60" /> : null}
              {i === currentIndex ? (
                <span
                  key={`p-${currentIndex}-${isHovered}`}
                  className="absolute inset-y-0 left-0 bg-primary"
                  style={{
                    width: isHovered ? "100%" : undefined,
                    animation: isHovered ? undefined : `ch-progress ${SLIDE_MS}ms linear forwards`,
                  }}
                />
              ) : null}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
