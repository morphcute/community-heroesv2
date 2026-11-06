"use client";

import Link from "next/link";
import type { CSSProperties } from "react";
import {
  ArrowRight,
  Swords,
  Trophy,
  Users,
  Shield,
  ChevronRight,
  Crown,
  BarChart3,
  Flame,
  LayoutDashboard,
  Calendar,
  Sparkles,
  Gamepad2,
  Award,
  Star,
  Zap,
} from "lucide-react";
import MarketingShell from "./MarketingShell";
import CoverflowHero, { type HeroSlide } from "./CoverflowHero";
import { CountUp, Rail, RevealObserver, TiltCard } from "./fx";
import LoginArena from "@/components/LoginArena";
import TileArt from "./TileArt";
import dynamic from "next/dynamic";
import { useSyncExternalStore } from "react";

const Landing3D = dynamic(() => import("@/components/three/Landing3D"), { ssr: false });

/** WebGL available? false during server render, real value in the browser. */
let webglCache: boolean | null = null;
function detectWebGL() {
  if (webglCache === null) {
    try {
      const c = document.createElement("canvas");
      webglCache = !!(c.getContext("webgl2") || c.getContext("webgl"));
    } catch {
      webglCache = false;
    }
  }
  return webglCache;
}
const noopSubscribe = () => () => {};
function useWebGL() {
  return useSyncExternalStore(noopSubscribe, detectWebGL, () => false);
}

type TournamentItem = {
  id: string;
  title: string;
  format?: string | null;
  gameMode?: string | null;
  prize?: string;
  starts?: string;
  status?: string;
  banner?: string | null;
  filled?: number;
  maxTeams?: number;
};

type Stats = { tournaments: number; teams: number; players: number; scrims: number };

const d = (ms: number) => ({ "--d": `${ms}ms` }) as CSSProperties;

const modeShort: Record<string, string> = { SOLO_1V1: "1V1", DUO_2V2: "2V2", TRIO_3V3: "3V3", TEAM_5V5: "5V5" };
const statusLabel: Record<string, { t: string; c: string; live?: boolean }> = {
  ONGOING: { t: "Live now", c: "text-red-300", live: true },
  REGISTRATION_OPEN: { t: "Registration open", c: "text-emerald-300", live: true },
  UPCOMING: { t: "Upcoming", c: "text-slate-200" },
  REGISTRATION_CLOSED: { t: "Closed", c: "text-slate-400" },
  COMPLETED: { t: "Completed", c: "text-slate-400" },
};

const marqueeA = ["Solo 1v1", "Duo 2v2", "Trio 3v3", "Full 5v5", "Draft Pick", "Best of 3", "Grand Finals", "Free Entry"];
const marqueeB = ["Single Elimination", "Double Elimination", "Round Robin", "Swiss System", "League", "Gauntlet", "Group Stage", "Custom Bracket"];

const categories: Array<{ title: string; sub: string; href: string; icon: typeof Trophy; art: string; tint: string }> = [
  { title: "Tournaments", sub: "Join & win free brackets", href: "/features#tournaments", icon: Trophy, art: "tournaments", tint: "from-[#5c410c]/70" },
  { title: "Scrimmages", sub: "Daily practice matches", href: "/features#scrims", icon: Swords, art: "scrims", tint: "from-[#4a2a10]/70" },
  { title: "Squads", sub: "Build your five-stack", href: "/features#squads", icon: Users, art: "squads", tint: "from-[#3d3313]/70" },
  { title: "Leaderboard", sub: "Climb the circuit", href: "/features#ranks", icon: BarChart3, art: "leaderboard", tint: "from-[#5a4210]/70" },
  { title: "Arena Feed", sub: "Highlights & community", href: "/features#comms", icon: Flame, art: "feed", tint: "from-[#4b1f12]/70" },
  { title: "Team Dashboard", sub: "Roster & results", href: "/features#organizers", icon: LayoutDashboard, art: "dashboard", tint: "from-[#2e2a22]/80" },
];

function Marquee({ items, reverse = false }: { items: string[]; reverse?: boolean }) {
  const row = [...items, ...items, ...items];
  return (
    <div className="relative overflow-hidden py-3 [mask-image:linear-gradient(90deg,transparent,black_10%,black_90%,transparent)]">
      <div className={`flex w-max gap-4 motion-reduce:animate-none ${reverse ? "animate-[ch-marquee_45s_linear_infinite_reverse]" : "animate-[ch-marquee_40s_linear_infinite]"}`}>
        {row.map((w, i) => (
          <span key={i} className="flex items-center gap-3 rounded-full border border-white/[0.08] bg-white/[0.02] px-5 py-2.5 font-display text-lg font-bold uppercase tracking-[0.12em] text-slate-300">
            <Star className="h-3.5 w-3.5 text-primary" fill="currentColor" />
            {w}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function LandingClient({
  featured,
  tournaments = [],
  stats = { tournaments: 0, teams: 0, players: 0, scrims: 0 },
}: {
  featured: TournamentItem | null;
  tournaments?: TournamentItem[];
  stats?: Stats;
}) {
  const webgl = useWebGL();
  const live = tournaments.filter((t) => ["ONGOING", "REGISTRATION_OPEN", "UPCOMING"].includes(t.status || "")).slice(0, 3);

  const slides: HeroSlide[] = [
    {
      key: "brand",
      eyebrow: "Free MLBB tournament platform",
      lead: "Dominate the",
      highlight: "Arena",
      desc: "Free Mobile Legends tournaments, scrimmages and squad tools — one competitive home for Southeast Asia.",
      href: "/login",
      cta: "Join the Arena",
      image: "/gaming-hero.png",
    },
    ...live.map<HeroSlide>((t) => ({
      key: t.id,
      eyebrow: statusLabel[t.status || ""]?.t || "Featured",
      lead: t.title.split(" ").slice(0, -1).join(" ") || "Join",
      highlight: t.title.split(" ").slice(-1)[0],
      desc: `${t.format?.replaceAll("_", " ").toLowerCase() || "Tournament"}${t.gameMode ? ` · ${modeShort[t.gameMode] ?? ""}` : ""} — lock in your slot before registration closes.`,
      href: `/t/${t.id}`,
      cta: "View tournament",
      image: t.banner,
      mode: t.gameMode ? modeShort[t.gameMode] : null,
      live: statusLabel[t.status || ""]?.live,
      meta: { prize: t.prize, date: t.starts, slots: t.maxTeams ? `${t.filled ?? 0}/${t.maxTeams} slots` : undefined },
    })),
    {
      key: "scrims",
      eyebrow: "Scrimmages",
      lead: "Practice that",
      highlight: "Counts",
      desc: "Post open scrim slots, accept challengers and report official results — every match builds your record.",
      href: "/features#scrims",
      cta: "Explore scrims",
      image: "/scrimmages.png",
    },
    {
      key: "squads",
      eyebrow: "Squad builder",
      lead: "Build your",
      highlight: "Squad",
      desc: "Recruit by role, manage your roster and enter every bracket as one team.",
      href: "/features#squads",
      cta: "See squad tools",
      image: "/squad-building.png",
    },
  ];

  return (
    <MarketingShell>
      <RevealObserver />

      {/* ── Coverflow hero ─────────────────────────────────────────────── */}
      <section className="relative overflow-hidden pt-24 pb-10 sm:pt-28 lg:pt-32">
        <div className="pointer-events-none absolute left-1/2 top-0 h-[620px] w-[1100px] -translate-x-1/2 bg-[radial-gradient(ellipse_at_top,rgba(242,193,78,0.16),transparent_65%)]" />
        <div className="relative mx-auto max-w-[1400px] px-2 sm:px-4">
          <CoverflowHero slides={slides} />
        </div>
      </section>

      {/* ── Enter the arena ────────────────────────────────────────────── */}
      <section className="relative pt-10 pb-6 text-center">
        <div className="mx-auto max-w-3xl px-4">
          {webgl ? (
            <div data-reveal="zoom" className="relative mx-auto mb-4 h-[240px] w-[240px] sm:h-[300px] sm:w-[300px]">
              <div className="absolute inset-[18%] rounded-full bg-primary/20 blur-3xl" />
              <Landing3D kind="medallion" />
            </div>
          ) : null}
          <div data-reveal className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/[0.07] px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.26em] text-primary">
            <Sparkles className="h-3.5 w-3.5" /> The ultimate MLBB platform
          </div>
          <h1 data-reveal style={d(100)} className="mt-6 font-display text-5xl font-bold uppercase leading-[0.9] text-white sm:text-7xl">
            Enter the <span className="text-gradient-primary">Arena</span>
          </h1>
          <p data-reveal style={d(200)} className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-slate-400 sm:text-lg">
            Compete, connect and conquer. Community Heroes is your all-in-one home for MLBB tournaments, scrims, squads and rankings.
          </p>
        </div>
      </section>

      {/* ── Category tiles (pop-out art) ───────────────────────────────── */}
      <section className="relative py-14">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-x-6 gap-y-10 px-4 sm:grid-cols-2 sm:px-6 lg:grid-cols-3 lg:px-8">
          {categories.map((c, i) => (
            <div key={c.title} data-reveal style={d((i % 3) * 110)}>
              <TiltCard className="rounded-[18px]">
                <Link href={c.href} className="pop-tile group">
                  <div className="pop-tile__art">
                    {webgl ? (
                      <div className="relative h-full w-full bg-[radial-gradient(80%_80%_at_50%_40%,#2a1f08,#09090c_70%)]">
                        <div className="absolute inset-0 bg-[linear-gradient(rgba(242,193,78,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(242,193,78,0.05)_1px,transparent_1px)] bg-[size:20px_20px]" />
                        <Landing3D kind={c.art} />
                      </div>
                    ) : (
                      <div className="relative h-full w-full">
                        <TileArt variant={c.art as "tournaments"} />
                      </div>
                    )}
                  </div>
                  <div className={`pop-tile__body bg-gradient-to-t ${c.tint} to-[#0d0d12]`}>
                    <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/15 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                          <c.icon className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="font-display text-2xl font-bold uppercase leading-none text-white">{c.title}</div>
                          <div className="mt-1 text-[12.5px] text-slate-400">{c.sub}</div>
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-slate-500 transition-all group-hover:translate-x-1 group-hover:text-primary" />
                    </div>
                  </div>
                </Link>
              </TiltCard>
            </div>
          ))}
        </div>
      </section>

      {/* ── Dual marquee ───────────────────────────────────────────────── */}
      <section className="relative border-y border-white/[0.05] bg-black/25 py-6">
        <Marquee items={marqueeA} />
        <Marquee items={marqueeB} reverse />
      </section>

      {/* ── Tournament rail ────────────────────────────────────────────── */}
      <section id="featured" className="relative scroll-mt-24 py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8" data-reveal>
          <Rail
            eyebrow="Featured tournaments"
            title={<>Step into the <span className="text-gradient-primary">arena</span></>}
            action={
              <Link href="/login" className="mr-2 hidden text-[13px] font-semibold text-primary hover:underline sm:block">
                View all →
              </Link>
            }
          >
            {tournaments.length === 0 ? (
              <div className="hud-panel w-full text-center text-slate-400">No tournaments yet — check back soon.</div>
            ) : (
              tournaments.map((t) => {
                const st = statusLabel[t.status || ""] || { t: t.status, c: "text-slate-300" };
                const mode = t.gameMode ? modeShort[t.gameMode] : "";
                const fill = t.maxTeams ? Math.min(100, Math.round(((t.filled ?? 0) / t.maxTeams) * 100)) : 0;
                return (
                  <TiltCard key={t.id} max={6} className="w-[290px] flex-shrink-0 snap-start rounded-[var(--radius-card)] sm:w-[320px]">
                    <Link href={`/t/${t.id}`} className="esports-card group flex h-full flex-col">
                      <div className="relative h-44 overflow-hidden bg-[#0a0a0d]">
                        {t.banner ? (
                          <img src={t.banner} alt="" className="absolute inset-0 h-full w-full object-cover opacity-80 transition-transform duration-700 group-hover:scale-110" />
                        ) : (
                          <>
                            <div className="absolute inset-0 bg-[radial-gradient(100%_120%_at_100%_0%,rgba(242,193,78,0.22),transparent_55%)]" />
                            <div className="absolute right-[28%] top-0 h-full w-[2px] skew-x-[-18deg] bg-gradient-to-b from-primary/70 to-transparent transition-all duration-500 group-hover:right-[36%]" />
                            {mode ? (
                              <div className="pointer-events-none absolute -bottom-4 right-2 select-none font-display text-[7rem] font-bold leading-none text-transparent transition-transform duration-500 group-hover:-translate-x-3" style={{ WebkitTextStroke: "1.5px rgba(242,193,78,0.28)" }} aria-hidden>
                                {mode}
                              </div>
                            ) : null}
                          </>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0b0b0f] via-transparent to-transparent" />
                        <span className={`absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-black/60 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] backdrop-blur ${st.c}`}>
                          {st.live ? <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-current" /> : null}
                          {st.t}
                        </span>
                        <div className="absolute bottom-3 left-4">
                          <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-primary/80">Prize pool</div>
                          <div className="font-display text-2xl font-bold leading-none text-white">{t.prize || "TBA"}</div>
                        </div>
                      </div>
                      <div className="flex flex-1 flex-col p-5">
                        <div className="font-display text-xl font-bold uppercase leading-tight text-white transition-colors group-hover:text-primary">{t.title}</div>
                        <div className="mt-1 text-xs capitalize text-slate-500">
                          {t.format?.replaceAll("_", " ").toLowerCase()} {mode ? `· ${mode}` : ""}
                        </div>
                        <div className="mt-auto pt-5">
                          <div className="mb-1.5 flex justify-between text-[11px] text-slate-400">
                            <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{t.starts}</span>
                            <span className="tabular-nums">{t.filled ?? 0}/{t.maxTeams} slots</span>
                          </div>
                          <div className="h-1 overflow-hidden rounded-full bg-white/[0.06]">
                            <div className="h-full rounded-full bg-[image:var(--gradient-primary)]" style={{ width: `${fill}%` }} />
                          </div>
                        </div>
                      </div>
                    </Link>
                  </TiltCard>
                );
              })
            )}
          </Rail>
        </div>
      </section>

      {/* ── Live stats + XP ────────────────────────────────────────────── */}
      <section className="relative border-y border-white/[0.05] bg-black/25 py-24">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,rgba(242,193,78,0.10),transparent_70%)]" />
        <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="text-center" data-reveal>
            <div className="page-hero__eyebrow mx-auto">Season 4 in numbers</div>
            <h2 className="mt-4 font-display text-4xl font-bold uppercase leading-[0.95] text-white md:text-5xl">
              The arena is <span className="gold-block">live</span>
            </h2>
          </div>

          <div className="mt-12 grid grid-cols-2 gap-4 lg:grid-cols-4">
            {[
              { v: stats.tournaments, l: "Tournaments hosted", icon: Trophy },
              { v: stats.teams, l: "Registered squads", icon: Users },
              { v: stats.players, l: "Players", icon: Gamepad2 },
              { v: stats.scrims, l: "Scrims posted", icon: Swords },
            ].map((s, i) => (
              <div key={s.l} data-reveal="zoom" style={d(i * 100)} className="esports-card hud-corners p-6 text-center">
                <s.icon className="mx-auto h-6 w-6 text-primary" />
                <div className="mt-4 font-display text-5xl font-bold leading-none text-white">
                  <CountUp value={s.v} />
                </div>
                <div className="mt-2 text-[12px] font-semibold uppercase tracking-[0.18em] text-slate-500">{s.l}</div>
              </div>
            ))}
          </div>

          <div className="mt-14 grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div data-reveal="left">
              <h3 className="flex items-center gap-2 font-display text-xl font-bold uppercase tracking-wider text-primary">
                <Zap className="h-5 w-5" /> How to earn XP
              </h3>
              <div className="mt-4 space-y-2.5">
                {[
                  { icon: Shield, t: "Create your player profile", v: "+350 XP" },
                  { icon: Trophy, t: "Register for a tournament", v: "+200 XP" },
                  { icon: Award, t: "Earn an award or prize", v: "+150 XP" },
                ].map((r) => (
                  <div key={r.t} className="flex items-center justify-between gap-3 rounded-xl border border-white/[0.07] bg-white/[0.02] px-4 py-3.5 transition-colors hover:border-primary/30">
                    <span className="flex items-center gap-3 text-[14px] text-slate-200">
                      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/12 text-primary"><r.icon className="h-4 w-4" /></span>
                      {r.t}
                    </span>
                    <span className="font-display text-lg font-bold text-primary">{r.v}</span>
                  </div>
                ))}
              </div>
            </div>
            <div data-reveal="right">
              <h3 className="flex items-center gap-2 font-display text-xl font-bold uppercase tracking-wider text-slate-200">
                <Crown className="h-5 w-5 text-primary" /> What it unlocks
              </h3>
              <div className="mt-4 space-y-2.5">
                {[
                  { t: "A new level every 1,000 XP", v: "Level badge" },
                  { t: "Season XP bar on your Player ID", v: "Progress" },
                  { t: "Awards & winnings on your profile", v: "Trophy case" },
                ].map((r) => (
                  <div key={r.t} className="flex items-center justify-between gap-3 rounded-xl border border-white/[0.07] bg-white/[0.02] px-4 py-3.5 transition-colors hover:border-primary/30">
                    <span className="text-[14px] text-slate-200">{r.t}</span>
                    <span className="text-[12px] font-semibold uppercase tracking-wider text-slate-400">{r.v}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-10 text-center" data-reveal>
            <Link href="/login" className="action-button-primary px-10">
              Start earning XP <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── How it works ───────────────────────────────────────────────── */}
      <section id="how" className="relative scroll-mt-24 py-24">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-14 text-center" data-reveal>
            <div className="page-hero__eyebrow mx-auto">Get started in minutes</div>
            <h2 className="mt-4 font-display text-4xl font-bold uppercase text-white sm:text-5xl">
              Your path to the <span className="gold-block">podium</span>
            </h2>
          </div>
          <div className="relative grid grid-cols-1 gap-5 md:grid-cols-3">
            <div className="pointer-events-none absolute left-[16%] right-[16%] top-[52px] hidden h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent md:block" />
            {[
              { n: "01", icon: Shield, title: "Create your player profile", desc: "Sign in, set your MLBB ID, rank, and preferred roles so teams can find you." },
              { n: "02", icon: Users, title: "Join or build a squad", desc: "Recruit teammates, organize your roster, and stay tournament-ready as a unit." },
              { n: "03", icon: Crown, title: "Compete & win", desc: "Register for tournaments, play scrims, and stack achievements on your profile." },
            ].map((s, i) => (
              <div key={s.n} data-reveal style={d(i * 140)}>
                <TiltCard className="h-full rounded-[var(--radius-card)]">
                  <div className="esports-card relative h-full p-7">
                    <div className="flex items-center justify-between">
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-primary/30 bg-[#0b0b0f] text-primary">
                        <s.icon className="h-5 w-5" />
                      </div>
                      <div className="font-display text-5xl font-bold leading-none text-transparent" style={{ WebkitTextStroke: "1px rgba(242,193,78,0.35)" }}>
                        {s.n}
                      </div>
                    </div>
                    <h3 className="mt-6 font-display text-xl font-bold uppercase text-white">{s.title}</h3>
                    <p className="mt-2 text-[13px] leading-relaxed text-slate-400">{s.desc}</p>
                  </div>
                </TiltCard>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ────────────────────────────────────────────────────────── */}
      <section className="relative pb-24">
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8" data-reveal="zoom">
          <div className="relative overflow-hidden rounded-[var(--radius-hero)] border border-primary/30">
            <LoginArena className="absolute inset-0 opacity-60" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#060608] via-[#060608]/70 to-[#060608]/30" />
            <div className="relative z-10 px-6 py-20 text-center sm:py-28">
              <h2 className="font-display text-5xl font-bold uppercase leading-[0.9] text-white sm:text-7xl">
                Ready to <span className="gold-block">compete?</span>
              </h2>
              <p className="mx-auto mt-6 max-w-xl text-sm leading-relaxed text-slate-300 sm:text-base">
                {featured ? <>Next up: <span className="font-semibold text-primary">{featured.title}</span> — {featured.starts}. </> : null}
                Free to sign up, free to compete.
              </p>
              <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Link href="/login" className="action-button-primary w-full px-10 sm:w-auto">
                  Create your free account <ArrowRight className="h-4 w-4" />
                </Link>
                <Link href="/features" className="action-button-secondary w-full px-8 sm:w-auto">
                  See all features
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
      {webgl ? <Landing3D kind="canvas" /> : null}
    </MarketingShell>
  );
}
