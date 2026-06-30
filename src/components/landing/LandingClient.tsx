"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import {
  ArrowRight,
  Calendar,
  Menu,
  Swords,
  Trophy,
  Users,
  MessageSquare,
  BarChart3,
  Shield,
  Sparkles,
  ChevronRight,
  Zap,
} from "lucide-react";

type FeaturedTournament = {
  id: string;
  title: string;
  format?: string | null;
  gameMode?: string | null;
  prize?: string;
  starts?: string;
  status?: string;
};

export default function LandingClient({
  featured,
}: {
  featured: FeaturedTournament | null;
}) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileNav, setMobileNav] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const features = [
    {
      icon: Trophy,
      title: "Tournaments",
      desc: "Join free community brackets, track live slots, and lock in your entry before registration closes.",
      tone: "from-amber-300/16 to-amber-500/6",
    },
    {
      icon: Swords,
      title: "Scrimmages",
      desc: "Challenge active squads, negotiate terms, and keep your team sharp between official matches.",
      tone: "from-orange-300/16 to-red-400/6",
    },
    {
      icon: Users,
      title: "Squads",
      desc: "Build a roster, assign roles, and recruit the right players to complete your five-stack.",
      tone: "from-yellow-300/16 to-amber-400/6",
    },
    {
      icon: BarChart3,
      title: "Leaderboard",
      desc: "Earn points from completed matches and climb the global ranked circuit across every game mode.",
      tone: "from-amber-200/16 to-yellow-400/6",
    },
  ];

  const steps = [
    {
      n: "01",
      title: "Create your player profile",
      desc: "Sign in, set your MLBB ID, rank, and preferred roles so teams can find you.",
    },
    {
      n: "02",
      title: "Join or build a squad",
      desc: "Recruit teammates, organize your roster, and stay tournament-ready as a unit.",
    },
    {
      n: "03",
      title: "Compete & win",
      desc: "Register for tournaments, play scrims, and stack achievements on your profile.",
    },
  ];

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#03050c] text-foreground">
      {/* ── Ambient background ─────────────────────────────────────────── */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_-10%,rgba(255,201,0,0.12),transparent_55%),radial-gradient(ellipse_at_15%_80%,rgba(7,11,26,0.95),transparent_70%),radial-gradient(ellipse_at_85%_60%,rgba(255,215,0,0.04),transparent_50%)]" />
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,201,0,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255,201,0,0.4) 1px, transparent 1px)",
            backgroundSize: "64px 64px",
            maskImage:
              "radial-gradient(ellipse at center top, black 30%, transparent 80%)",
          }}
        />
      </div>

      {/* ── Navbar ─────────────────────────────────────────────────────── */}
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
          scrolled
            ? "border-b border-white/5 bg-[#03050c]/90 backdrop-blur-xl"
            : "border-b border-transparent"
        }`}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2 transition-transform duration-300 hover:scale-[1.02]">
            <span className="text-[#FFD700] font-black text-xl font-display">/</span>
            <span className="font-display text-sm font-black uppercase tracking-[0.2em] text-white">
              Community Heroes
            </span>
          </Link>

          <nav className="hidden items-center gap-8 md:flex">
            {[
              { label: "About", href: "#about" },
              { label: "Features", href: "#features" },
              { label: "Tournaments", href: "#featured" },
            ].map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-400 transition-colors hover:text-primary"
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="hidden text-xs font-bold uppercase tracking-wider text-slate-300 transition-colors hover:text-primary sm:block"
            >
              Sign In
            </Link>
            <Link
              href="/login"
              className="action-button-primary text-[10px]"
            >
              Join the Arena
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
            <button
              onClick={() => setMobileNav((v) => !v)}
              className="rounded-xl border border-white/10 bg-[#070a14] p-2 text-muted-foreground md:hidden"
              aria-label="Toggle menu"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>

        {mobileNav && (
          <div className="border-t border-white/10 bg-[#03050c]/95 px-4 py-4 backdrop-blur-xl md:hidden">
            {[
              { label: "About", href: "#about" },
              { label: "Features", href: "#features" },
              { label: "Tournaments", href: "#featured" },
            ].map((item) => (
              <a
                key={item.label}
                href={item.href}
                onClick={() => setMobileNav(false)}
                className="block rounded-xl px-4 py-3 text-xs font-black uppercase tracking-wider text-slate-400 transition-colors hover:bg-white/5 hover:text-primary"
              >
                {item.label}
              </a>
            ))}
          </div>
        )}
      </header>

      {/* ── Hero ───────────────────────────────────────────────────────── */}
      <section className="relative flex min-h-screen items-center justify-center pt-24 pb-20 overflow-hidden">
        {/* Glowing background details specifically for hero */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,201,0,0.06),transparent_60%)]" />
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: "linear-gradient(rgba(255,201,0,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,201,0,0.3) 1px, transparent 1px)",
          backgroundSize: "32px 32px"
        }} />

        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="mx-auto max-w-4xl text-center">
            <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/8 px-4 py-1.5 backdrop-blur-sm mb-8">
              <Sparkles className="h-3.5 w-3.5 text-primary animate-pulse-slow" />
              <span className="text-[0.62rem] font-bold uppercase tracking-[0.22em] text-primary">
                Free MLBB Tournament Platform
              </span>
            </div>

            <h1 className="font-display text-[3.2rem] font-black uppercase leading-[0.92] tracking-tight text-white animate-in fade-in slide-in-from-bottom-8 duration-700 sm:text-6xl lg:text-[5.5rem]">
              Dominate the
              <span className="block text-[#FFD700] drop-shadow-[0_0_20px_rgba(255,215,0,0.2)]">
                Arena
              </span>
            </h1>

            <p className="mx-auto mt-8 max-w-xl text-sm leading-relaxed text-slate-400 animate-in fade-in slide-in-from-bottom-8 duration-700 sm:text-base">
              Discover free tournaments, post scrimmages, and build a stronger Mobile Legends squad.
            </p>

            <div className="mt-10 flex flex-col items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-8 duration-700 sm:flex-row">
              <Link
                href="/login"
                className="action-button-primary w-full justify-center sm:w-auto"
              >
                Join the Arena
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            {/* trust row */}
            <div className="mt-16 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 animate-in fade-in duration-1000">
              <span className="flex items-center gap-2">
                <Shield className="h-3.5 w-3.5 text-primary/70" /> No entry fees
              </span>
              <span className="flex items-center gap-2">
                <Users className="h-3.5 w-3.5 text-primary/70" /> Built for SEA
              </span>
              <span className="flex items-center gap-2">
                <Zap className="h-3.5 w-3.5 text-primary/70" /> Real brackets
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Slanted Yellow Divider Banner ──────────────────────────────── */}
      <div className="relative z-20 w-full bg-[#FFD700] py-6 slanted-banner shadow-[0_4px_30px_rgba(255,215,0,0.3)]">
        <div className="slanted-banner-inner flex flex-wrap justify-center gap-x-12 gap-y-2 text-center text-black font-display text-xs md:text-sm font-black tracking-[0.25em]">
          <span>◆ COMMUNITY</span>
          <span>◆ COMPETITIVENESS</span>
          <span>◆ ACCESSIBILITY</span>
        </div>
      </div>

      {/* ── Central Hub (About) ────────────────────────────────────────── */}
      <section id="about" className="relative py-24 md:py-32 overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
            {/* Left Side: Copy */}
            <div className="space-y-6 text-left">
              <h2 className="font-display text-3xl font-black uppercase tracking-wider text-white md:text-4xl">
                The Central Hub
              </h2>
              <p className="text-sm text-slate-400 leading-relaxed max-w-lg">
                Community Heroes serves as a practical, free-to-use competitive hub for the MLBB community, focusing on providing essential tools for team growth and tournament participation.
              </p>
              <p className="text-sm text-slate-400 leading-relaxed max-w-lg">
                We are a competitive platform dedicated to Mobile Legends: Bang Bang players in Southeast Asia. The platform provides a centralized hub for discovering free tournaments, organizing scrimmages, and building squads to improve competitive play.
              </p>
              <div className="text-[#FFD700] font-display text-sm font-black uppercase tracking-[0.2em] pt-4">
                Direct. Competitive. Accessible.
              </div>
            </div>

            {/* Right Side: Image/Logo container styled with cyber borders */}
            <div className="flex justify-center">
              <div className="relative p-2 rounded-xl border border-white/10 bg-black/40 backdrop-blur-md max-w-md w-full overflow-hidden shadow-[0_0_50px_rgba(255,215,0,0.06)]">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,215,0,0.08),transparent_70%)]" />
                <div className="absolute inset-0 opacity-[0.05]" style={{
                  backgroundImage: "linear-gradient(rgba(255,215,0,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,215,0,0.3) 1px, transparent 1px)",
                  backgroundSize: "24px 24px"
                }} />
                <img
                  src="/ch-logo.png"
                  alt="Community Heroes Championship Logo"
                  className="relative z-10 mx-auto max-h-[300px] w-auto object-contain p-8 drop-shadow-[0_0_35px_rgba(250,204,21,0.25)]"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Competitive Arsenal (Features Grid) ────────────────────────── */}
      <section id="features" className="relative py-24 md:py-32 bg-[#040714]/40 border-t border-b border-white/[0.03]">
        <div className="absolute inset-0 opacity-[0.02]" style={{
          backgroundImage: "linear-gradient(rgba(255,201,0,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,201,0,0.5) 1px, transparent 1px)",
          backgroundSize: "48px 48px"
        }} />

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <h2 className="font-display text-3xl font-black uppercase tracking-wider text-white md:text-4xl esports-underline">
              Competitive Arsenal
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                title: "MLBB Tournaments",
                desc: "Access to free community brackets and competitive tournaments for Mobile Legends: Bang Bang.",
                img: "/mlbb-tournaments.png"
              },
              {
                title: "Scrimmages",
                desc: "A platform to post and challenge active squads for practice matches and competitive play.",
                img: "/scrimmages.png"
              },
              {
                title: "Squad Building",
                desc: "Services to help players find teammates quickly and build a stronger competitive squad.",
                img: "/squad-building.png"
              },
              {
                title: "Team Dashboard",
                desc: "A personalized dashboard for tracking scrimmage results and managing team rosters.",
                img: "/team-dashboard.png"
              }
            ].map((item) => (
              <div
                key={item.title}
                className="esports-card overflow-hidden group flex flex-col h-full"
              >
                <div className="relative aspect-[16/10] w-full overflow-hidden border-b border-white/5">
                  <img
                    src={item.img}
                    alt={item.title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                </div>
                <div className="p-6 flex flex-col flex-1 text-left">
                  <h3 className="font-display text-base font-black uppercase tracking-wide text-white group-hover:text-primary transition-colors">
                    {item.title}
                  </h3>
                  <p className="mt-2.5 text-[11px] leading-relaxed text-slate-400 flex-1">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured tournament ────────────────────────────────────────── */}
      <section id="featured" className="relative py-24 sm:py-32">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center mb-12">
            <div className="text-[0.62rem] font-bold uppercase tracking-[0.24em] text-primary">
              Live now
            </div>
            <h2 className="font-display mt-3 text-3xl font-black uppercase tracking-tight text-white sm:text-4xl">
              Step into the arena
            </h2>
          </div>

          <div className="mx-auto max-w-4xl">
            {featured ? (
              <Link
                href={`/t/${featured.id}`}
                className="esports-card group block overflow-hidden p-0"
              >
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(250,204,21,0.12),transparent_35%)]" />
                <div className="relative z-10 grid gap-6 p-8 sm:grid-cols-[1.4fr_1fr] sm:p-10 text-left">
                  <div>
                    <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-[0.58rem] font-bold uppercase tracking-[0.18em] text-primary">
                      <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                      {featured.status?.replaceAll("_", " ") || "Featured"}
                    </div>
                    <h3 className="font-display mt-4 text-2xl font-black uppercase tracking-wide text-white sm:text-3xl">
                      {featured.title}
                    </h3>
                    <p className="mt-3 text-xs text-slate-400">
                      {featured.format?.replaceAll("_", " ") || "Single Elim"}
                      {featured.gameMode
                        ? ` · ${featured.gameMode.replaceAll("_", " ")}`
                        : ""}
                    </p>
                    <div className="mt-6 flex items-center gap-2 text-xs font-bold text-primary">
                      View tournament
                      <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </div>
                  </div>
                  <div className="flex flex-col justify-center gap-3">
                    <div className="rounded-xl border border-white/5 bg-black/40 px-4 py-3">
                      <div className="text-[0.58rem] font-bold uppercase tracking-[0.2em] text-slate-500">
                        Prize Pool
                      </div>
                      <div className="font-display mt-1 text-xl font-black text-primary">
                        {featured.prize || "TBA"}
                      </div>
                    </div>
                    <div className="rounded-xl border border-white/5 bg-black/40 px-4 py-3">
                      <div className="flex items-center gap-2 text-[0.58rem] font-bold uppercase tracking-[0.2em] text-slate-500">
                        <Calendar className="h-3 w-3" />
                        Starts
                      </div>
                      <div className="mt-1 text-xs font-bold text-white">
                        {featured.starts || "Soon"}
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ) : (
              <div className="esports-card p-10 text-center">
                <Trophy className="mx-auto h-10 w-10 text-primary/60" />
                <h3 className="font-display mt-4 text-2xl font-black uppercase tracking-wide text-white">
                  The arena is warming up
                </h3>
                <p className="mx-auto mt-3 max-w-md text-xs text-slate-400">
                  No tournament is live right now. Sign in to be the first to
                  know when the next bracket opens.
                </p>
                <Link
                  href="/login"
                  className="action-button-primary mx-auto mt-6"
                >
                  Join the Arena
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── How it works ───────────────────────────────────────────────── */}
      <section id="how" className="relative py-24 sm:py-32 border-t border-white/[0.03]">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center mb-12">
            <div className="text-[0.62rem] font-bold uppercase tracking-[0.24em] text-primary">
              Get started in minutes
            </div>
            <h2 className="font-display mt-3 text-3xl font-black uppercase tracking-tight text-white sm:text-4xl">
              Your path to the podium
            </h2>
          </div>

          <div className="mt-14 grid grid-cols-1 gap-8 md:grid-cols-3 text-left">
            {steps.map((s) => (
              <div key={s.n} className="relative p-6 rounded-xl border border-white/5 bg-[#060914]/40 backdrop-blur-sm">
                <div className="font-display text-4xl font-black text-primary/20">
                  {s.n}
                </div>
                <h3 className="font-display mt-4 text-lg font-black uppercase tracking-wide text-white">
                  {s.title}
                </h3>
                <p className="mt-2.5 text-xs leading-relaxed text-slate-400">
                  {s.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA band ───────────────────────────────────────────────────── */}
      <section className="relative py-24 sm:py-32">
        <div className="mx-auto w-full max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="gamer-id-card relative overflow-hidden p-10 text-center sm:p-16">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(250,204,21,0.12),transparent_60%)]" />
            <div className="relative z-10">
              <h2 className="font-display text-3xl font-black uppercase tracking-tight text-white sm:text-5xl">
                Ready to make your mark?
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-xs text-slate-400 leading-relaxed sm:text-sm">
                Join hundreds of Mobile Legends players competing on Community
                Heroes. It's free to sign up and free to compete.
              </p>
              <Link
                href="/login"
                className="action-button-primary mx-auto mt-8"
              >
                Create your free account
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────────────────── */}
      <footer className="border-t border-white/5 py-12 bg-black/20">
        <div className="mx-auto flex w-full max-w-7xl flex-col items-center justify-between gap-6 px-4 sm:flex-row sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <span className="text-[#FFD700] font-black text-lg font-display">/</span>
            <span className="font-display text-xs font-black uppercase tracking-[0.2em] text-slate-400">
              Community Heroes
            </span>
          </div>
          <p className="text-[10px] uppercase tracking-wider text-slate-500">
            © 2026 Community Heroes. Built for Mobile Legends competitors.
          </p>
        </div>
      </footer>
    </div>
  );
}
