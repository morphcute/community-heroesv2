import { Shield, Users } from "lucide-react";
import Link from "next/link";

interface TeamOverviewCardProps {
  teamName: string;
  memberCount: number;
  winRate?: number;
  upcomingMatch?: string;
}

export default function TeamOverviewCard({
  teamName,
  memberCount,
  winRate,
  upcomingMatch,
}: TeamOverviewCardProps) {
  return (
    <div className="relative glass-card p-6 border border-white/10 rounded-2xl bg-white/5 backdrop-blur-xl">
      <div className="flex items-center gap-4 mb-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Users className="h-6 w-6" />
        </div>
        <h2 className="font-display text-2xl font-black uppercase text-white tracking-[0.08em]">
          {teamName}
        </h2>
      </div>
      <div className="grid gap-2 text-sm text-slate-300">
        <div className="flex justify-between">
          <span className="text-slate-500">Members</span>
          <span>{memberCount}</span>
        </div>
        {winRate !== undefined && (
          <div className="flex justify-between">
            <span className="text-slate-500">Win Rate</span>
            <span>{winRate}%</span>
          </div>
        )}
        {upcomingMatch && (
          <div className="flex justify-between">
            <span className="text-slate-500">Next Match</span>
            <span>{upcomingMatch}</span>
          </div>
        )}
      </div>
      <Link
        href="/teams"
        className="mt-4 inline-block text-primary underline hover:text-white transition-colors"
      >
        Manage Squad
      </Link>
    </div>
  );
}
