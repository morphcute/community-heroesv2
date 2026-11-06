import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import {
  ArrowRight,
  Trophy,
  Swords,
  Users,
  MessageSquare,
  BarChart3,
  ClipboardList,
  Check,
  Minus,
  Crown,
  Gem,
} from "lucide-react";
import MarketingShell, { MarketingHero, SectionHeading } from "@/components/landing/MarketingShell";

export const metadata: Metadata = {
  title: "Features",
  description:
    "Every tool your Mobile Legends squad needs: free tournaments with eight bracket formats, scrimmages, roster management, team chat, leaderboards and organizer tools.",
  alternates: { canonical: "/features" },
};

const jump = [
  { id: "tournaments", label: "Tournaments", icon: Trophy },
  { id: "scrims", label: "Scrims", icon: Swords },
  { id: "squads", label: "Squads", icon: Users },
  { id: "comms", label: "Comms", icon: MessageSquare },
  { id: "ranks", label: "Leaderboard", icon: BarChart3 },
  { id: "organizers", label: "Organizers", icon: ClipboardList },
];

const modes = [
  { k: "1V1", v: "Solo duels" },
  { k: "2V2", v: "Duo" },
  { k: "3V3", v: "Trio" },
  { k: "5V5", v: "Full squad" },
];

const formats = [
  "Single Elimination",
  "Double Elimination",
  "Round Robin Groups",
  "Swiss System",
  "League",
  "Bracket + Groups",
  "Gauntlet",
  "Custom Bracket",
];

const roles = ["Tank / Support", "Fighter", "Jungler", "Mage", "Marksman"];

const matrix: Array<{ f: string; p: boolean; c: boolean; o: boolean }> = [
  { f: "Join free tournaments", p: true, c: true, o: true },
  { f: "Player profile, XP & awards", p: true, c: true, o: true },
  { f: "Arena feed & direct messages", p: true, c: true, o: true },
  { f: "Create & manage a squad", p: false, c: true, o: true },
  { f: "Post and accept scrims", p: false, c: true, o: true },
  { f: "Recruit players by role", p: false, c: true, o: true },
  { f: "Create tournaments & prize splits", p: false, c: false, o: true },
  { f: "Start events & report scores", p: false, c: false, o: true },
];

function Feature({
  id,
  icon: Icon,
  eyebrow,
  title,
  desc,
  points,
  visual,
  flip = false,
}: {
  id: string;
  icon: typeof Trophy;
  eyebrow: string;
  title: ReactNode;
  desc: string;
  points: string[];
  visual: ReactNode;
  flip?: boolean;
}) {
  return (
    <section id={id} className="scroll-mt-28 py-16 sm:py-20">
      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:px-8">
        <div className={flip ? "lg:order-2" : ""}>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-primary/30 bg-primary/[0.08] text-primary">
              <Icon className="h-5 w-5" />
            </div>
            <span className="text-[11px] font-bold uppercase tracking-[0.28em] text-primary">{eyebrow}</span>
          </div>
          <h2 className="mt-5 font-display text-4xl font-bold uppercase leading-[0.95] text-white md:text-5xl">{title}</h2>
          <p className="mt-5 max-w-lg text-[15px] leading-relaxed text-slate-400">{desc}</p>
          <ul className="mt-7 space-y-3">
            {points.map((pt) => (
              <li key={pt} className="flex items-start gap-3 text-[14px] text-slate-300">
                <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded bg-primary/15 text-primary">
                  <Check className="h-3 w-3" strokeWidth={3} />
                </span>
                {pt}
              </li>
            ))}
          </ul>
        </div>
        <div className={flip ? "lg:order-1" : ""}>{visual}</div>
      </div>
    </section>
  );
}

function ImageVisual({ src, tag }: { src: string; tag: string }) {
  return (
    <div className="relative">
      <div className="absolute -inset-6 rounded-[32px] bg-[radial-gradient(circle,rgba(242,193,78,0.14),transparent_70%)] blur-2xl" />
      <div className="esports-card hud-corners relative !transform-none">
        <img src={src} alt="" className="aspect-[16/11] w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0b0b0f]/80 via-transparent to-transparent" />
        <span className="hud-tag absolute bottom-4 left-4 bg-black/60 backdrop-blur">{tag}</span>
      </div>
    </div>
  );
}

export default function FeaturesPage() {
  return (
    <MarketingShell>
      <MarketingHero
        eyebrow="Features"
        title={
          <>
            Everything your
            <br />
            <span className="text-gradient-primary">squad needs</span>
          </>
        }
        description="From your first scrim to the grand final — tournaments, practice, roster tools and a live leaderboard, all free and built for MLBB."
      >
        <div className="mx-auto mt-10 flex max-w-2xl flex-wrap justify-center gap-2">
          {jump.map((j) => (
            <a
              key={j.id}
              href={`#${j.id}`}
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-[13px] font-medium text-slate-300 transition-colors hover:border-primary/40 hover:text-primary"
            >
              <j.icon className="h-3.5 w-3.5" />
              {j.label}
            </a>
          ))}
        </div>
      </MarketingHero>

      {/* Game modes strip */}
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-px overflow-hidden rounded-[var(--radius-card)] border border-white/[0.08] bg-white/[0.08] sm:grid-cols-4">
          {modes.map((m) => (
            <div key={m.k} className="bg-[#0b0b0f] px-6 py-6 text-center">
              <div className="font-display text-4xl font-bold text-white">{m.k}</div>
              <div className="mt-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">{m.v}</div>
            </div>
          ))}
        </div>
      </div>

      <Feature
        id="tournaments"
        icon={Trophy}
        eyebrow="Tournaments"
        title={<>Free brackets, <span className="text-gradient-primary">real stakes</span></>}
        desc="Browse open, live and upcoming events, lock in a slot before registration closes, and follow every round on a live bracket."
        points={["Solo, duo, trio and 5v5 events", "Eight bracket formats with single or multi-stage play", "Prize pools in diamonds or cash, shown up front", "Live bracket, schedule and tournament chat"]}
        visual={<ImageVisual src="/mlbb-tournaments.png" tag="Compete" />}
      />

      {/* Formats grid */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="hud-panel">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <div className="text-[11px] font-bold uppercase tracking-[0.28em] text-primary">Bracket formats</div>
              <div className="mt-2 font-display text-2xl font-bold uppercase text-white">Eight ways to crown a champion</div>
            </div>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-2.5 md:grid-cols-4">
            {formats.map((f, i) => (
              <div key={f} className="flex items-center gap-3 rounded-lg border border-white/[0.06] bg-white/[0.02] px-4 py-3">
                <span className="font-display text-sm font-bold tabular-nums text-primary/70">{String(i + 1).padStart(2, "0")}</span>
                <span className="text-[13px] font-medium text-slate-200">{f}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Feature
        id="scrims"
        flip
        icon={Swords}
        eyebrow="Scrimmages"
        title={<>Practice like <span className="text-gradient-primary">pros</span></>}
        desc="Post an open scrim slot, accept challengers, and submit official results afterward — so practice actually counts."
        points={["Post open slots with time and notes", "Review and accept incoming requests", "Report scores and track your scrim record"]}
        visual={<ImageVisual src="/scrimmages.png" tag="Practice" />}
      />

      <Feature
        id="squads"
        icon={Users}
        eyebrow="Squads"
        title={<>Build your <span className="text-gradient-primary">five-stack</span></>}
        desc="Create a team, set your main roles, and recruit the players you're missing. Your roster follows you into every event."
        points={["Team page with captain controls", "Invite, approve or remove members", "Recruit by role to fill gaps fast"]}
        visual={
          <div className="relative">
            <ImageVisual src="/squad-building.png" tag="Recruit" />
            <div className="absolute -bottom-6 left-4 right-4 flex flex-wrap justify-center gap-1.5 sm:left-8 sm:right-8">
              {roles.map((r) => (
                <span key={r} className="rounded-md border border-primary/25 bg-[#0b0b0f]/95 px-2.5 py-1 text-[11px] font-semibold text-primary backdrop-blur">
                  {r}
                </span>
              ))}
            </div>
          </div>
        }
      />

      <Feature
        id="comms"
        flip
        icon={MessageSquare}
        eyebrow="Comms & Feed"
        title={<>Stay <span className="text-gradient-primary">locked in</span></>}
        desc="Chat with your squad, message friends, and share highlights in the Arena Feed — the community lives here between matches."
        points={["Team, group and direct messages", "Friends list with online status", "Arena Feed for highlights, posts and reactions"]}
        visual={
          <div className="hud-panel hud-corners space-y-3">
            {[
              { n: "Rook", m: "Scrim at 9PM? Bo3 draft pick.", me: false },
              { n: "You", m: "Locked in. Bringing our new jungler 🔥", me: true },
              { n: "Vexa", m: "GG last night — that lord steal 👀", me: false },
            ].map((c, i) => (
              <div key={i} className={`flex items-end gap-2.5 ${c.me ? "flex-row-reverse" : ""}`}>
                <div className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold ${c.me ? "bg-primary text-primary-foreground" : "border border-border bg-white/[0.04] text-slate-300"}`}>
                  {c.n[0]}
                </div>
                <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-[13px] ${c.me ? "rounded-br-sm bg-primary/15 text-amber-50" : "rounded-bl-sm border border-white/[0.06] bg-white/[0.03] text-slate-300"}`}>
                  {!c.me ? <div className="mb-0.5 text-[11px] font-semibold text-primary">{c.n}</div> : null}
                  {c.m}
                </div>
              </div>
            ))}
          </div>
        }
      />

      <Feature
        id="ranks"
        icon={BarChart3}
        eyebrow="Leaderboard & progression"
        title={<>Climb the <span className="text-gradient-primary">circuit</span></>}
        desc="Completed matches feed a global leaderboard for every game mode, while your profile tracks XP, levels and awards."
        points={["Leaderboards for 1v1, 2v2, 3v3 and 5v5", "Season XP and levels from every event", "Awards and winnings on your profile"]}
        visual={
          <div className="hud-panel hud-corners">
            <div className="flex items-end justify-center gap-3 pt-4">
              {[
                { place: 2, name: "Nightfall", h: "h-24", tone: "from-slate-300/25" },
                { place: 1, name: "Crimson", h: "h-32", tone: "from-primary/35" },
                { place: 3, name: "Aurora", h: "h-20", tone: "from-amber-700/30" },
              ].map((p) => (
                <div key={p.place} className="flex w-1/3 flex-col items-center">
                  {p.place === 1 ? <Crown className="mb-2 h-6 w-6 text-primary drop-shadow-[0_0_10px_rgba(242,193,78,0.8)]" /> : null}
                  <div className="mb-2 font-display text-sm font-bold uppercase text-white">{p.name}</div>
                  <div className={`flex w-full ${p.h} items-start justify-center rounded-t-lg border border-white/[0.08] bg-gradient-to-b ${p.tone} to-transparent pt-3 font-display text-3xl font-bold text-white`}>
                    {p.place}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-5 flex items-center justify-between rounded-lg border border-white/[0.06] bg-white/[0.02] px-4 py-3 text-[13px]">
              <span className="text-slate-400">Your season</span>
              <span className="flex items-center gap-3">
                <span className="font-display font-bold text-white">LV 7</span>
                <span className="flex items-center gap-1 font-display font-bold text-primary">
                  3,000 <Gem className="h-3.5 w-3.5 text-sky-300" />
                </span>
              </span>
            </div>
          </div>
        }
      />

      <Feature
        id="organizers"
        flip
        icon={ClipboardList}
        eyebrow="Organizer tools"
        title={<>Run events <span className="text-gradient-primary">without spreadsheets</span></>}
        desc="Spin up a tournament in minutes — upload a banner, choose a format, set the prize split, and manage the whole event from one dashboard."
        points={["Banner upload and event details", "Prize distribution by placement", "Approve teams, start the event, report scores", "Co-admins and moderators per tournament"]}
        visual={<ImageVisual src="/team-dashboard.png" tag="Manage" />}
      />

      {/* Who gets what */}
      <section className="py-20">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <SectionHeading eyebrow="At a glance" title="Who gets what" align="center" />
          <div className="mt-12 overflow-x-auto rounded-[var(--radius-card)] border border-white/[0.08]">
            <table className="w-full min-w-[520px] text-left text-[14px]">
              <thead>
                <tr className="border-b border-white/[0.08] bg-white/[0.02]">
                  <th className="px-5 py-4 font-medium text-slate-400">Feature</th>
                  {["Players", "Captains", "Organizers"].map((h) => (
                    <th key={h} className="px-5 py-4 text-center font-display text-base font-bold uppercase tracking-wider text-white">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {matrix.map((row) => (
                  <tr key={row.f} className="border-b border-white/[0.05] last:border-0 hover:bg-white/[0.02]">
                    <td className="px-5 py-3.5 text-slate-300">{row.f}</td>
                    {[row.p, row.c, row.o].map((v, i) => (
                      <td key={i} className="px-5 py-3.5 text-center">
                        {v ? <Check className="mx-auto h-4 w-4 text-primary" strokeWidth={3} /> : <Minus className="mx-auto h-4 w-4 text-slate-600" />}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-4 text-center text-xs text-slate-500">Everything above is free.</p>
        </div>
      </section>

      {/* CTA */}
      <section className="relative pb-24">
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="page-hero hud-corners !block overflow-hidden p-10 text-center sm:p-16">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(242,193,78,0.16),transparent_65%)]" />
            <div className="relative z-10">
              <h2 className="font-display text-4xl font-bold uppercase leading-none text-white sm:text-6xl">
                Ready to <span className="text-gradient-primary">compete?</span>
              </h2>
              <p className="mx-auto mt-5 max-w-xl text-sm leading-relaxed text-slate-400 sm:text-base">
                All features, zero cost. Sign in with Google and enter your first bracket today.
              </p>
              <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Link href="/login" className="action-button-primary w-full px-10 sm:w-auto">
                  Join the Arena <ArrowRight className="h-4 w-4" />
                </Link>
                <Link href="/about" className="action-button-secondary w-full px-8 sm:w-auto">
                  About us
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </MarketingShell>
  );
}
