import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Activity, ShieldCheck, Trophy, Users, Zap } from "lucide-react";
import { PageHero, PageShell, SurfaceCard } from "@/components/ui/PageShell";

export default async function AdminDashboard() {
  const totalUsers = await prisma.user.count();
  const activeTournaments = await prisma.tournament.count({ where: { status: "ONGOING" } });
  const totalTournaments = await prisma.tournament.count();
  const prismaWithMatch = prisma as typeof prisma & {
    match: {
      count: (args: { where: { status: string } }) => Promise<number>;
    };
  };
  const activeMatches = await prismaWithMatch.match.count({ where: { status: "ONGOING" } });

  return (
    <PageShell size="wide" tone="danger">
      <PageHero
        eyebrow="Admin Control"
        icon={<ShieldCheck className="h-4 w-4" />}
        title={
          <>
            Command the
            <span className="text-gradient-primary"> platform grid</span>
          </>
        }
        description="Monitor platform health, manage tournament throughput, and keep the full Community Heroes ecosystem in sync."
        stats={[
          { label: "Users", value: totalUsers },
          { label: "Live Tournaments", value: activeTournaments },
          { label: "Matches", value: activeMatches },
        ]}
        actions={
          <Link href="/admin/tournaments/create" className="action-button-primary text-[11px]">
            <Zap className="h-4 w-4" />
            Launch Tournament
          </Link>
        }
      />

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        <AdminMetric label="Total Users" value={totalUsers} icon={<Users className="h-5 w-5 text-cyan-300" />} />
        <AdminMetric label="Live Tournaments" value={activeTournaments} icon={<Trophy className="h-5 w-5 text-primary" />} />
        <AdminMetric label="All Tournaments" value={totalTournaments} icon={<Activity className="h-5 w-5 text-fuchsia-300" />} />
        <AdminMetric label="Live Matches" value={activeMatches} icon={<Zap className="h-5 w-5 text-rose-300" />} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <SurfaceCard tone="blue">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <div className="text-[0.62rem] font-black uppercase tracking-[0.24em] text-cyan-300">Live Activity</div>
              <h2 className="mt-2 font-display text-2xl font-black uppercase tracking-[0.08em] text-white">Operations pulse</h2>
            </div>
          </div>
          <div className="space-y-3">
            {[
              "Moderator updates and bracket changes surface here in real time.",
              "Tournament capacity is monitored continuously for auto-start thresholds.",
              "Weekly participation and player growth reports are ready for review.",
            ].map((item) => (
              <div key={item} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-sm leading-7 text-slate-300">
                {item}
              </div>
            ))}
          </div>
        </SurfaceCard>

        <SurfaceCard tone="danger">
          <div className="mb-5">
            <div className="text-[0.62rem] font-black uppercase tracking-[0.24em] text-red-200">System Status</div>
            <h2 className="mt-2 font-display text-2xl font-black uppercase tracking-[0.08em] text-white">Infrastructure</h2>
          </div>
          <div className="space-y-3">
            {[
              { name: "Prisma schema", status: "Healthy", uptime: "100%" },
              { name: "PostgreSQL gateway", status: "Healthy", uptime: "99.8%" },
              { name: "Realtime messaging", status: "Healthy", uptime: "99.9%" },
            ].map((item) => (
              <div key={item.name} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-4">
                <div>
                  <div className="text-sm font-bold text-white">{item.name}</div>
                  <div className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-500">{item.status}</div>
                </div>
                <div className="rounded-full border border-emerald-300/18 bg-emerald-300/10 px-3 py-1 text-[0.62rem] font-black uppercase tracking-[0.2em] text-emerald-200">
                  {item.uptime}
                </div>
              </div>
            ))}
          </div>
        </SurfaceCard>
      </div>
    </PageShell>
  );
}

function AdminMetric({ label, value, icon }: { label: string; value: React.ReactNode; icon: React.ReactNode }) {
  return (
    <SurfaceCard>
      <div className="flex items-center justify-between">
        <div className="text-[0.62rem] font-black uppercase tracking-[0.24em] text-slate-500">{label}</div>
        {icon}
      </div>
      <div className="mt-4 font-display text-5xl font-black uppercase tracking-[0.08em] text-white">{value}</div>
    </SurfaceCard>
  );
}
