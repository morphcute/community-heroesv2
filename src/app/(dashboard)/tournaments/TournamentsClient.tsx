"use client";

import { Calendar, ChevronRight, Search, Trophy, Users } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { EmptyState, PageHero, PageShell, SurfaceCard } from "@/components/ui/PageShell";

const tabs = ["Featured", "Live", "Open", "Upcoming", "Completed"];

type TournamentCard = {
  id: string;
  name: string;
  host: string;
  date: string;
  prize: string;
  participants: number;
  maxParticipants: number;
  game: string;
  status: string;
  format: string;
  type: string;
  platform: string;
  color: string;
  banner: string;
  fee: string;
};

export default function TournamentsClient({ initialTournaments }: { initialTournaments: TournamentCard[] }) {
  const [activeTab, setActiveTab] = useState("Featured");
  const [query, setQuery] = useState("");

  const filteredTournaments = (() => {
    const byTab =
      activeTab === "Featured"
        ? initialTournaments
        : initialTournaments.filter((t) => t.status === activeTab);

    if (!query.trim()) return byTab;

    const term = query.toLowerCase();
    return byTab.filter((t) =>
      [t.name, t.host, t.game, t.format, t.platform].some((value) =>
        String(value).toLowerCase().includes(term)
      )
    );
  })();

  const counts: Record<string, number> = {
    Featured: initialTournaments.length,
    Live: initialTournaments.filter((t) => t.status === "Live").length,
    Open: initialTournaments.filter((t) => t.status === "Open").length,
    Upcoming: initialTournaments.filter((t) => t.status === "Upcoming").length,
    Completed: initialTournaments.filter((t) => t.status === "Completed").length,
  };

  const statusStyle: Record<string, { dot: string; text: string; pulse: boolean }> = {
    Live: { dot: "bg-red-500", text: "text-red-300", pulse: true },
    Open: { dot: "bg-emerald-400", text: "text-emerald-300", pulse: true },
    Upcoming: { dot: "bg-slate-300", text: "text-slate-200", pulse: false },
    Completed: { dot: "bg-slate-500", text: "text-slate-400", pulse: false },
  };

  const modeFromGame = (game: string) => (game.match(/\d+V\d+/i)?.[0] || "").toUpperCase();

  return (
    <PageShell size="wide">
      <PageHero
        eyebrow="Tournament Board"
        title={
          <>
            Explore the
            <span className="text-gradient-primary"> tournament board</span>
          </>
        }
        description="Live brackets, open registrations, and upcoming schedules from the Community Heroes circuit."
        stats={[
          { label: "Listed", value: initialTournaments.length },
          { label: "Live", value: counts.Live },
          { label: "Open", value: counts.Open },
        ]}
        aside={
          <SurfaceCard className="flex h-full flex-col justify-between gap-5 p-5 lg:p-6">
            <div>
              <label htmlFor="t-search" className="text-[10px] font-semibold uppercase tracking-[0.26em] text-muted-foreground">
                Quick search
              </label>
              <div className="relative mt-2">
                <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  id="t-search"
                  type="text"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Title, host, or mode…"
                  className="input-hud pl-10"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-px overflow-hidden rounded-[var(--radius-control)] border border-[var(--edge)] bg-[var(--edge)]">
              {[
                { label: "Next up", value: initialTournaments[0]?.date || "TBA" },
                { label: "Top prize", value: initialTournaments[0]?.prize || "TBA" },
              ].map((item) => (
                <div key={item.label} className="stat-chip px-4 py-3">
                  <span className="stat-chip__label">{item.label}</span>
                  <span className="stat-chip__value text-lg">{item.value}</span>
                </div>
              ))}
            </div>
          </SurfaceCard>
        }
      />

      {/* Segmented filter bar */}
      <div className="flex items-center justify-between gap-4">
        <div role="tablist" className="mobile-pill-rail w-auto rounded-[var(--radius-control)] border border-border bg-white/[0.02] p-1">
          {tabs.map((tab) => {
            const active = activeTab === tab;
            return (
              <button
                key={tab}
                role="tab"
                aria-selected={active}
                onClick={() => setActiveTab(tab)}
                className={`inline-flex min-h-[38px] flex-shrink-0 items-center gap-2 rounded-md px-4 font-display text-[13px] font-bold uppercase tracking-[0.12em] transition-all ${
                  active ? "bg-primary text-primary-foreground shadow-[0_6px_20px_-8px_rgba(242,193,78,0.8)]" : "text-muted-foreground hover:bg-white/[0.04] hover:text-foreground"
                }`}
              >
                {tab === "Featured" ? "All" : tab}
                <span className={`rounded px-1.5 text-[10px] tabular-nums ${active ? "bg-black/15" : "bg-white/[0.06]"}`}>{counts[tab]}</span>
              </button>
            );
          })}
        </div>
        <div className="hidden text-xs text-muted-foreground md:block">
          Showing <span className="font-semibold text-foreground">{filteredTournaments.length}</span> events
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        {filteredTournaments.length === 0 ? (
          <EmptyState
            className="md:col-span-2 xl:col-span-3 2xl:col-span-4"
            icon={<Trophy className="h-7 w-7" />}
            title="No tournaments found"
            description="Try a different tab or search to discover more events."
          />
        ) : (
          filteredTournaments.map((tournament) => {
            const st = statusStyle[tournament.status] || statusStyle.Upcoming;
            const mode = modeFromGame(tournament.game);
            const fill = tournament.maxParticipants ? Math.min(100, Math.round((tournament.participants / tournament.maxParticipants) * 100)) : 0;
            return (
              <Link key={tournament.id} href={`/tournaments/${tournament.id}`} className="esports-card group flex flex-col">
                {/* Key art */}
                <div className="relative h-48 overflow-hidden bg-[#0a0a0d]">
                  {tournament.banner ? (
                    <img
                      src={tournament.banner}
                      alt=""
                      className="absolute inset-0 h-full w-full object-cover opacity-80 transition-transform duration-700 group-hover:scale-105"
                    />
                  ) : (
                    <>
                      <div className="absolute inset-0 bg-[radial-gradient(100%_120%_at_100%_0%,rgba(242,193,78,0.2),transparent_55%)]" />
                      <div className="absolute -right-6 top-0 h-full w-1/2 skew-x-[-18deg] bg-gradient-to-b from-primary/[0.09] to-transparent" />
                      <div className="absolute right-[30%] top-0 h-full w-[2px] skew-x-[-18deg] bg-gradient-to-b from-primary/60 to-transparent transition-all duration-500 group-hover:right-[34%]" />
                      {mode ? (
                        <div
                          className="pointer-events-none absolute -bottom-5 right-2 select-none font-display text-[7.5rem] font-bold leading-none text-transparent transition-transform duration-500 group-hover:-translate-x-2"
                          style={{ WebkitTextStroke: "1.5px rgba(242,193,78,0.25)" }}
                          aria-hidden
                        >
                          {mode}
                        </div>
                      ) : null}
                    </>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0b0b0f] via-[#0b0b0f]/40 to-transparent" />

                  <div className="absolute left-4 right-4 top-4 flex items-center justify-between gap-3">
                    <span className="hud-tag bg-black/55 text-slate-200 backdrop-blur">{tournament.game}</span>
                    <span className={`inline-flex items-center gap-1.5 rounded-full bg-black/55 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] backdrop-blur ${st.text}`}>
                      <span className="relative flex h-1.5 w-1.5">
                        {st.pulse ? <span className={`absolute inline-flex h-full w-full animate-ping rounded-full ${st.dot} opacity-70`} /> : null}
                        <span className={`relative inline-flex h-1.5 w-1.5 rounded-full ${st.dot}`} />
                      </span>
                      {tournament.status}
                    </span>
                  </div>

                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="text-[10px] font-semibold uppercase tracking-[0.24em] text-primary/80">Prize pool</div>
                    <div className="mt-0.5 font-display text-[2rem] font-bold leading-none text-white">{tournament.prize}</div>
                  </div>
                </div>

                <div className="relative z-10 flex flex-1 flex-col p-5">
                  <h2 className="font-display text-[1.4rem] font-bold uppercase leading-tight text-foreground transition-colors group-hover:text-primary">
                    {tournament.name}
                  </h2>
                  <div className="mt-1 text-xs text-muted-foreground">
                    Hosted by <span className="text-slate-300">{tournament.host}</span> · {tournament.platform}
                  </div>

                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {[tournament.format, tournament.type, tournament.fee].map((chip) => (
                      <span key={chip} className="rounded-md border border-border bg-white/[0.03] px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                        {chip}
                      </span>
                    ))}
                  </div>

                  <div className="mt-auto pt-5">
                    <div className="mb-1.5 flex items-center justify-between text-[11px] text-muted-foreground">
                      <span className="flex items-center gap-1.5">
                        <Users className="h-3.5 w-3.5" />
                        <span className="tabular-nums text-foreground">{tournament.participants}</span>/{tournament.maxParticipants} slots
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5" />
                        {tournament.date}
                      </span>
                    </div>
                    <div className="h-1 overflow-hidden rounded-full bg-white/[0.06]">
                      <div className="h-full rounded-full bg-[image:var(--gradient-primary)]" style={{ width: `${fill}%` }} />
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-border px-5 py-3 text-[12px] font-semibold text-muted-foreground transition-colors group-hover:text-primary">
                  View bracket
                  <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </div>
              </Link>
            );
          })
        )}
      </div>
    </PageShell>
  );
}
