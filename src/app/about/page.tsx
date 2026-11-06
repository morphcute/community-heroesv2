import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Users,
  Swords,
  Globe2,
  Shield,
  Scale,
  Eye,
  Gamepad2,
  Crown,
  ClipboardList,
  ChevronDown,
} from "lucide-react";
import MarketingShell, { MarketingHero, SectionHeading } from "@/components/landing/MarketingShell";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Community Heroes is a free competitive hub for Mobile Legends: Bang Bang players in Southeast Asia — tournaments, scrimmages and squad tools in one place.",
  alternates: { canonical: "/about" },
};

const pillars = [
  {
    icon: Users,
    title: "Community",
    desc: "Built around the players. Find teammates, follow rivals, and grow with a regional scene that plays together every week.",
  },
  {
    icon: Swords,
    title: "Competitiveness",
    desc: "Real brackets, real scores, real stakes. Every match feeds your record, your squad's history and the leaderboard.",
  },
  {
    icon: Globe2,
    title: "Accessibility",
    desc: "Free to sign up, free to compete. If you can queue in MLBB, you can play on Community Heroes.",
  },
];

const principles = [
  { icon: Scale, title: "Fair brackets", desc: "Seeding and formats are set before registration closes — single or double elimination, round robin, Swiss, leagues and more." },
  { icon: Eye, title: "Transparent results", desc: "Scores are posted to the bracket so every team can see how the event unfolded, match by match." },
  { icon: Shield, title: "Moderated spaces", desc: "Tournament admins and moderators keep chats and lobbies clean, and act on reports of abuse." },
];

const audiences = [
  {
    icon: Gamepad2,
    title: "Players",
    points: ["Build a profile with your MLBB ID, rank and roles", "Join tournaments solo, duo, trio or 5v5", "Earn XP, levels and awards as you compete"],
  },
  {
    icon: Crown,
    title: "Captains",
    points: ["Create a squad and manage your roster", "Recruit players for missing roles", "Post scrims and challenge other teams"],
  },
  {
    icon: ClipboardList,
    title: "Organizers",
    points: ["Launch tournaments with banners and prize splits", "Choose from eight bracket formats", "Start events and report scores in one dashboard"],
  },
];

const faqs = [
  {
    q: "Is Community Heroes really free?",
    a: "Yes. Creating an account, joining a squad, posting scrims and entering community tournaments costs nothing. Some organizers may list an entry fee on a specific event — it is always shown on the tournament page before you register.",
  },
  {
    q: "How do I sign up?",
    a: "Click “Join the Arena” and continue with your Google account. Then add your MLBB ID, server and preferred roles to your profile so teams can find you.",
  },
  {
    q: "Which servers and regions are supported?",
    a: "The platform is built for Southeast Asian players. Each tournament lists its region or location restriction, so you can see whether your server is eligible before registering.",
  },
  {
    q: "Do I need a full team to compete?",
    a: "No. There are solo 1v1, duo 2v2 and trio 3v3 events alongside 5v5. You can also use the feed and chat to find teammates for a full squad.",
  },
  {
    q: "How are prizes handled?",
    a: "Each tournament shows its prize pool and how it is split — in diamonds or cash — set by the organizer. Winnings are recorded as awards on your player profile.",
  },
  {
    q: "Is this an official Mobile Legends product?",
    a: "No. Community Heroes is an independent, community-run platform and is not affiliated with or endorsed by Moonton.",
  },
];

export default function AboutPage() {
  return (
    <MarketingShell>
      <MarketingHero
        eyebrow="About us"
        title={
          <>
            By the community.
            <br />
            <span className="text-gradient-primary">For the competitors.</span>
          </>
        }
        description="Community Heroes is a free, independent competitive hub for Mobile Legends: Bang Bang players across Southeast Asia — the tools squads need to grow, practice and compete, in one place."
      >
        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link href="/login" className="action-button-primary w-full px-8 sm:w-auto">
            Join the Arena <ArrowRight className="h-4 w-4" />
          </Link>
          <Link href="/features" className="action-button-secondary w-full px-8 sm:w-auto">
            Explore features
          </Link>
        </div>
      </MarketingHero>

      {/* Mission */}
      <section className="relative pb-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="page-hero hud-corners !grid-cols-1 lg:!grid-cols-[1fr_1.1fr]">
            <div className="relative z-10">
              <div className="page-hero__eyebrow">Our mission</div>
              <h2 className="mt-4 font-display text-4xl font-bold uppercase leading-[0.95] text-white sm:text-5xl">
                Give every squad a <span className="text-gradient-primary">real stage</span>
              </h2>
            </div>
            <div className="relative z-10 mt-6 space-y-4 text-[15px] leading-relaxed text-slate-400 lg:mt-0">
              <p>
                Talented MLBB players are everywhere — but organized, fair competition isn&apos;t. Brackets live in group chats, results get lost, and
                new teams struggle to find matches.
              </p>
              <p>
                We built Community Heroes to fix that: one home where anyone can discover free tournaments, schedule scrims, build a roster and
                track their progress — with the polish of a pro league and none of the barriers.
              </p>
              <div className="pt-2 font-display text-sm font-bold uppercase tracking-[0.3em] text-primary">Direct · Competitive · Accessible</div>
            </div>
          </div>
        </div>
      </section>

      {/* Pillars */}
      <section className="relative border-y border-white/[0.04] bg-black/20 py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading eyebrow="What we stand for" title="Three pillars" align="center" />
          <div className="mt-14 grid grid-cols-1 gap-5 md:grid-cols-3">
            {pillars.map((p, i) => (
              <div key={p.title} className="esports-card relative p-8">
                <div
                  className="pointer-events-none absolute right-5 top-3 font-display text-7xl font-bold leading-none text-transparent"
                  style={{ WebkitTextStroke: "1px rgba(242,193,78,0.18)" }}
                  aria-hidden
                >
                  0{i + 1}
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-primary/30 bg-primary/[0.08] text-primary">
                  <p.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-6 font-display text-2xl font-bold uppercase text-white">{p.title}</h3>
                <p className="mt-2 text-[14px] leading-relaxed text-slate-400">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Who it's for */}
      <section className="relative py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading eyebrow="Who it's for" title={<>One platform, <span className="text-gradient-primary">every role</span></>} />
          <div className="mt-12 grid grid-cols-1 gap-5 lg:grid-cols-3">
            {audiences.map((a) => (
              <div key={a.title} className="hud-panel">
                <div className="flex items-center gap-3">
                  <a.icon className="h-5 w-5 text-primary" />
                  <h3 className="font-display text-2xl font-bold uppercase text-white">{a.title}</h3>
                </div>
                <ul className="mt-6 space-y-3">
                  {a.points.map((pt) => (
                    <li key={pt} className="flex gap-3 text-[14px] leading-relaxed text-slate-300">
                      <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rotate-45 bg-primary" />
                      {pt}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How we run events */}
      <section className="relative border-y border-white/[0.04] bg-black/20 py-24">
        <div className="mx-auto grid max-w-7xl grid-cols-1 items-start gap-12 px-4 sm:px-6 lg:grid-cols-[1fr_1.4fr] lg:px-8">
          <div className="lg:sticky lg:top-32">
            <SectionHeading eyebrow="Fair play" title={<>How we run <span className="text-gradient-primary">events</span></>} />
            <p className="mt-6 max-w-md text-[15px] leading-relaxed text-slate-400">
              Competition only matters if people trust it. Every tournament on Community Heroes follows the same ground rules.
            </p>
          </div>
          <div className="space-y-4">
            {principles.map((p) => (
              <div key={p.title} className="esports-card flex gap-5 p-6">
                <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-lg border border-border bg-white/[0.03] text-primary">
                  <p.icon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-display text-xl font-bold uppercase text-white">{p.title}</h3>
                  <p className="mt-1.5 text-[14px] leading-relaxed text-slate-400">{p.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="relative scroll-mt-24 py-24">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <SectionHeading eyebrow="FAQ" title="Questions, answered" align="center" />
          <div className="mt-12 space-y-3">
            {faqs.map((f) => (
              <details key={f.q} className="group esports-card !transform-none p-0 [&_summary::-webkit-details-marker]:hidden">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-6 py-5 font-display text-lg font-bold uppercase text-white transition-colors hover:text-primary">
                  {f.q}
                  <ChevronDown className="h-5 w-5 flex-shrink-0 text-primary transition-transform duration-300 group-open:rotate-180" />
                </summary>
                <p className="px-6 pb-6 text-[14px] leading-relaxed text-slate-400">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative pb-24">
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="page-hero hud-corners !block overflow-hidden p-10 text-center sm:p-16">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(242,193,78,0.16),transparent_65%)]" />
            <div className="relative z-10">
              <h2 className="font-display text-4xl font-bold uppercase leading-none text-white sm:text-6xl">
                Become a <span className="text-gradient-primary">hero</span>
              </h2>
              <p className="mx-auto mt-5 max-w-xl text-sm leading-relaxed text-slate-400 sm:text-base">
                Your squad, your bracket, your story. It starts with one sign-in.
              </p>
              <Link href="/login" className="action-button-primary mx-auto mt-9 px-10">
                Create your free account <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </MarketingShell>
  );
}
