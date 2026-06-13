"use client";

import { Calendar, Clock, Shield, Trophy, Users } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { EmptyState, PageHero, PageShell, SurfaceCard } from "@/components/ui/PageShell";

const tabs = ["All", "Ongoing", "Upcoming", "Completed"];

export type EventCard = {
  id: string;
  status: "Ongoing" | "Upcoming" | "Completed";
  color: string;
  name: string;
  dates: string;
  tournamentsCount: number;
  playersCount: number;
};

export default function EventsClient({ initialEvents }: { initialEvents: EventCard[] }) {
  const [activeTab, setActiveTab] = useState("All");

  const filteredEvents =
    activeTab === "All"
      ? initialEvents
      : initialEvents.filter((event) => event.status === activeTab);

  return (
    <PageShell size="wide" tone="blue">
      <PageHero
        eyebrow="Event Calendar"
        icon={<Calendar className="h-4 w-4" />}
        title={
          <>
            Track the next
            <span className="text-gradient-electric"> community event</span>
          </>
        }
        description="Follow featured events, community activities, and official tournament updates from one cleaner event page."
        stats={[
          { label: "Scheduled", value: initialEvents.length },
          { label: "Live", value: initialEvents.filter((event) => event.status === "Ongoing").length },
          { label: "Upcoming", value: initialEvents.filter((event) => event.status === "Upcoming").length },
        ]}
      />

      <SurfaceCard className="p-2.5 sm:p-5">
        <div className="mobile-pill-rail">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`mobile-pill ${
                activeTab === tab
                  ? "bg-emerald-300 text-black shadow-[0_14px_28px_-18px_rgba(110,231,183,0.9)]"
                  : "border border-white/10 bg-white/6 text-slate-400 hover:border-cyan-300/22 hover:text-white"
              }`}
            >
              {tab === "Ongoing" ? <Clock className="mr-1.5 inline h-3 w-3 sm:mr-2 sm:h-3.5 sm:w-3.5" /> : null}
              {tab}
            </button>
          ))}
        </div>
      </SurfaceCard>

      {filteredEvents.length === 0 ? (
        <EmptyState
          icon={<Calendar className="h-8 w-8" />}
          title="No events in this category"
          description="There are currently no matching esports events listed for this category status."
          action={<Link href="/tournaments" className="action-button-primary text-[11px]">View tournaments</Link>}
        />
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filteredEvents.map((event) => (
            <Link
              key={event.id}
              href={`/tournaments/${event.id}`}
              className="group relative overflow-hidden rounded-[1.8rem] border border-white/10 bg-[linear-gradient(180deg,rgba(10,14,31,0.94),rgba(8,11,25,0.82))] transition-all duration-300 hover:-translate-y-1 hover:border-cyan-300/24"
            >
              <div className={`absolute inset-x-0 top-0 h-44 bg-gradient-to-br ${event.color} opacity-20 group-hover:opacity-35 transition-opacity duration-300`} />
              <div className="absolute inset-0 bg-gradient-to-t from-[#050816] via-[#050816]/30 to-transparent" />
              <div className="relative p-5 pt-36">
                <div className="inline-block rounded-full border border-white/10 bg-black/30 px-3 py-1 text-[0.62rem] font-black uppercase tracking-[0.22em] text-emerald-200 backdrop-blur-md">
                  {event.status} Match
                </div>
                <h2 className="mt-4 font-display text-2xl font-black uppercase tracking-[0.08em] text-white group-hover:text-primary transition-colors">{event.name}</h2>
                <p className="mt-3 text-sm leading-7 text-slate-300">{event.dates}</p>
                <div className="mt-5 grid grid-cols-2 gap-3">
                  <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-300 flex flex-col justify-between">
                    <Trophy className="mb-2 h-4 w-4 text-primary" />
                    <span>{event.tournamentsCount} tournaments</span>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-300 flex flex-col justify-between">
                    <Users className="mb-2 h-4 w-4 text-cyan-300" />
                    <span>{event.playersCount} registrations</span>
                  </div>
                </div>
                <div className="mt-5 flex items-center gap-2 text-sm font-bold text-primary">
                  <Shield className="h-4 w-4" />
                  Hosted by Community Heroes
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </PageShell>
  );
}
