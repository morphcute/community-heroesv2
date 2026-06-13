"use client";

import { Calendar, ChevronRight, Search, Trophy, Users } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { PageHero, PageShell, SurfaceCard } from "@/components/ui/PageShell";

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

  return (
    <PageShell size="wide">
      <PageHero
        eyebrow="Tournament Feed"
        icon={<Trophy className="h-4 w-4" />}
        title={
          <>
            Explore the
            <span className="text-gradient-primary"> tournament board</span>
          </>
        }
        description="Check live brackets, open registrations, and upcoming tournament schedules from the Community Heroes circuit."
        stats={[
          { label: "Listed", value: initialTournaments.length },
          { label: "Live", value: initialTournaments.filter((t) => t.status === "Live").length },
          { label: "Open", value: initialTournaments.filter((t) => t.status === "Open").length },
        ]}
        aside={
          <SurfaceCard tone="blue" className="h-full p-3 sm:p-5 lg:p-6">
            <div className="relative z-10 space-y-3 sm:space-y-4">
              <div className="text-[0.56rem] font-black uppercase tracking-[0.2em] text-cyan-300 sm:text-[0.62rem] sm:tracking-[0.24em]">Tournament Filters</div>
              <div className="rounded-[1rem] border border-white/10 bg-white/5 p-2.5 sm:rounded-[1.4rem] sm:p-4">
                <div className="flex items-center gap-2.5 sm:gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-[0.9rem] border border-white/10 bg-white/6 text-primary sm:h-10 sm:w-10 sm:rounded-2xl">
                    <Search className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-[0.44rem] font-black uppercase tracking-[0.16em] text-slate-500 sm:text-[0.58rem] sm:tracking-[0.22em]">Quick Search</div>
                    <input
                      type="text"
                      value={query}
                      onChange={(event) => setQuery(event.target.value)}
                      placeholder="Find title, host, or mode..."
                      className="mt-0.5 w-full bg-transparent text-[0.88rem] text-white outline-none placeholder:text-slate-500 sm:mt-1 sm:text-sm"
                    />
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
                {[
                  { label: "Next Up", value: initialTournaments[0]?.date || "TBA" },
                  { label: "Top Prize", value: initialTournaments[0]?.prize || "TBA" },
                ].map((item) => (
                  <div key={item.label} className="rounded-[0.95rem] border border-white/10 bg-white/5 px-2.5 py-2 sm:rounded-2xl sm:px-4 sm:py-3">
                    <div className="text-[0.44rem] font-black uppercase tracking-[0.16em] text-slate-500 sm:text-[0.58rem] sm:tracking-[0.22em]">{item.label}</div>
                    <div className="mt-1 text-[0.88rem] font-bold text-white sm:mt-2 sm:text-sm">{item.value}</div>
                  </div>
                ))}
              </div>
            </div>
          </SurfaceCard>
        }
      />

      <SurfaceCard className="p-2.5 sm:p-5">
        <div className="mobile-pill-rail">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`mobile-pill ${activeTab === tab
                  ? "bg-primary text-black shadow-[0_14px_28px_-18px_rgba(250,204,21,0.9)]"
                  : "border border-white/10 bg-white/6 text-slate-400 hover:border-primary/20 hover:text-white"
                }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </SurfaceCard>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        {filteredTournaments.length === 0 ? (
          <SurfaceCard className="md:col-span-2 xl:col-span-3 2xl:col-span-4">
            <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-3xl border border-white/10 bg-white/6 text-primary">
                <Trophy className="h-8 w-8" />
              </div>
              <div>
                <h2 className="font-display text-2xl font-black uppercase tracking-[0.08em] text-white">No tournaments found</h2>
                <p className="mt-2 text-sm text-slate-400">Try a different tab or search query to discover more events.</p>
              </div>
            </div>
          </SurfaceCard>
        ) : (
          filteredTournaments.map((tournament) => (
            <Link
              key={tournament.id}
              href={`/tournaments/${tournament.id}`}
              className="group relative overflow-hidden rounded-[1.8rem] border border-white/10 bg-[linear-gradient(180deg,rgba(10,14,31,0.94),rgba(8,11,25,0.82))] transition-all duration-300 hover:-translate-y-1 hover:border-primary/22 hover:shadow-[0_28px_60px_-34px_rgba(250,204,21,0.42)]"
            >
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(250,204,21,0.14),transparent_24%),radial-gradient(circle_at_bottom_left,rgba(34,211,238,0.12),transparent_20%)] opacity-80" />
              <div className="relative h-56 overflow-hidden">
                <div className={`absolute inset-0 bg-gradient-to-br ${tournament.color}`} />
                {tournament.banner ? (
                  <img
                    src={tournament.banner}
                    alt={tournament.name}
                    className="absolute inset-0 h-full w-full object-cover opacity-70 transition-transform duration-700 group-hover:scale-105"
                  />
                ) : null}
                <div className="absolute inset-0 bg-gradient-to-t from-[#060a18] via-[#060a18]/35 to-transparent" />
                <div className="absolute left-4 right-4 top-4 flex items-start justify-between gap-3">
                  <div className="rounded-full border border-white/12 bg-black/35 px-3 py-1.5 text-[0.62rem] font-black uppercase tracking-[0.22em] text-white backdrop-blur-md">
                    {tournament.game}
                  </div>
                  <div
                    className={`rounded-full px-3 py-1.5 text-[0.62rem] font-black uppercase tracking-[0.22em] ${tournament.status === "Live"
                        ? "bg-rose-400/18 text-rose-200"
                        : tournament.status === "Open"
                          ? "bg-emerald-400/18 text-emerald-200"
                          : "bg-primary/16 text-primary"
                      }`}
                  >
                    {tournament.status}
                  </div>
                </div>
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="text-[0.58rem] font-black uppercase tracking-[0.22em] text-primary/80">Prize pool</div>
                  <div className="mt-2 font-display text-3xl font-black uppercase tracking-[0.08em] text-white">{tournament.prize}</div>
                </div>
              </div>

              <div className="relative z-10 p-5">
                <div className="mb-4 flex items-center justify-between gap-3 text-[0.62rem] font-black uppercase tracking-[0.22em] text-slate-500">
                  <span>{tournament.host}</span>
                  <span>{tournament.platform}</span>
                </div>
                <h2 className="font-display text-2xl font-black uppercase tracking-[0.08em] text-white transition-colors group-hover:text-primary">
                  {tournament.name}
                </h2>
                <div className="mt-4 flex flex-wrap gap-2">
                  {[tournament.format, tournament.type, tournament.fee].map((chip) => (
                    <span key={chip} className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[0.58rem] font-black uppercase tracking-[0.2em] text-slate-300">
                      {chip}
                    </span>
                  ))}
                </div>
                <div className="mt-5 flex items-center justify-between border-t border-white/10 pt-4">
                  <div className="space-y-2 text-sm text-slate-300">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-primary" />
                      <span>{tournament.date}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-cyan-300" />
                      <span>
                        {tournament.participants}/{tournament.maxParticipants} players
                      </span>
                    </div>
                  </div>
                  <div className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/6 text-slate-400 transition-all group-hover:border-primary/25 group-hover:bg-primary group-hover:text-black">
                    <ChevronRight className="h-5 w-5" />
                  </div>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </PageShell>
  );
}
