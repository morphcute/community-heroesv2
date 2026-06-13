import { prisma } from "@/lib/prisma";
import Link from "next/link";
import type { ReactNode } from "react";
import {
  Activity,
  ArrowRight,
  CalendarClock,
  Clock3,
  Crown,
  Map,
  RadioTower,
  ShieldCheck,
  Swords,
  Trophy,
  UserCog,
  Users,
  Zap,
} from "lucide-react";
import { PageHero, PageShell, SurfaceCard } from "@/components/ui/PageShell";
import { getGameModeLabel, getTournamentFormatLabel } from "@/lib/tournament-config";

export default async function AdminDashboard() {
  const prismaWithMatch = prisma as typeof prisma & {
    match: {
      count: (args?: { where?: { status?: string } }) => Promise<number>;
    };
  };

  const [
    totalUsers,
    moderators,
    totalTeams,
    totalAreas,
    activeTournaments,
    openTournaments,
    totalTournaments,
    activeMatches,
    scheduledToday,
    recentTournaments,
    recentUsers,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { role: { in: ["MODERATOR", "SUPERADMIN"] } } }),
    prisma.team.count(),
    prisma.area.count(),
    prisma.tournament.count({ where: { status: "ONGOING" } }),
    prisma.tournament.count({ where: { status: "REGISTRATION_OPEN" } }),
    prisma.tournament.count(),
    prismaWithMatch.match.count({ where: { status: "ONGOING" } }),
    prisma.tournament.count({
      where: {
        startDate: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
          lt: new Date(new Date().setHours(24, 0, 0, 0)),
        },
      },
    }),
    prisma.tournament.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        _count: { select: { participants: true } },
        admins: { include: { user: true }, take: 1 },
      },
    }),
    prisma.user.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    }),
  ]);

  const controlStats = [
    { label: "Users", value: totalUsers },
    { label: "Open Registrations", value: openTournaments },
    { label: "Live Matches", value: activeMatches },
  ];

  const commandCards = [
    {
      label: "Tournament Ops",
      value: totalTournaments,
      sublabel: `${activeTournaments} live now`,
      icon: <Trophy className="h-5 w-5" />,
      tone: "text-primary",
    },
    {
      label: "Staff Coverage",
      value: moderators,
      sublabel: `${totalAreas} mapped territories`,
      icon: <UserCog className="h-5 w-5" />,
      tone: "text-cyan-300",
    },
    {
      label: "Team Network",
      value: totalTeams,
      sublabel: `${totalUsers} player accounts`,
      icon: <Users className="h-5 w-5" />,
      tone: "text-fuchsia-300",
    },
    {
      label: "Today’s Schedule",
      value: scheduledToday,
      sublabel: "events queued today",
      icon: <CalendarClock className="h-5 w-5" />,
      tone: "text-emerald-300",
    },
  ];

  return (
    <PageShell size="wide" tone="danger">
      <PageHero
        eyebrow="Admin Control"
        icon={<ShieldCheck className="h-4 w-4" />}
        title={
          <>
            Run the
            <span className="text-gradient-primary"> tournament command center</span>
          </>
        }
        description="Track registrations, moderator coverage, and live competition from a denser operations dashboard built for Community Heroes staff."
        stats={controlStats}
        actions={
          <>
            <Link href="/admin/tournaments/create" className="action-button-primary text-[11px]">
              <Zap className="h-4 w-4" />
              Launch Tournament
            </Link>
            <Link href="/admin/tournaments" className="action-button-secondary text-[11px]">
              Review Tournament Ops
            </Link>
          </>
        }
        aside={
          <SurfaceCard tone="danger" className="h-full p-5">
            <div className="space-y-5">
              <div>
                <div className="text-[0.62rem] font-black uppercase tracking-[0.24em] text-rose-200">Command Snapshot</div>
                <div className="mt-3 font-display text-3xl font-black uppercase tracking-[0.08em] text-white">
                  {activeTournaments} Active
                </div>
                <p className="mt-2 text-sm leading-6 text-slate-300">
                  {openTournaments} tournament registrations are open and {scheduledToday} tournaments are scheduled for today.
                </p>
              </div>
              <div className="space-y-3">
                <StatusRow icon={<RadioTower className="h-4 w-4" />} label="Realtime activity" value={`${activeMatches} live matches`} />
                <StatusRow icon={<Map className="h-4 w-4" />} label="Area ownership" value={`${totalAreas} configured areas`} />
                <StatusRow icon={<Crown className="h-4 w-4" />} label="Moderator bench" value={`${moderators} staff accounts`} />
              </div>
            </div>
          </SurfaceCard>
        }
      />

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {commandCards.map((card) => (
          <SurfaceCard key={card.label} className="group overflow-hidden">
            <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-br from-white/8 via-transparent to-transparent opacity-80" />
            <div className="relative flex items-start justify-between">
              <div>
                <div className="text-[0.62rem] font-black uppercase tracking-[0.24em] text-slate-500">{card.label}</div>
                <div className="mt-4 font-display text-5xl font-black uppercase tracking-[0.08em] text-white">{card.value}</div>
                <div className="mt-2 text-sm text-slate-400">{card.sublabel}</div>
              </div>
              <div className={`rounded-2xl border border-white/10 bg-white/6 p-3 ${card.tone}`}>{card.icon}</div>
            </div>
          </SurfaceCard>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.35fr_0.95fr]">
        <SurfaceCard className="p-0">
          <div className="flex items-center justify-between border-b border-white/10 px-5 py-5">
            <div>
              <div className="text-[0.62rem] font-black uppercase tracking-[0.24em] text-cyan-300">Tournament Queue</div>
              <h2 className="mt-2 font-display text-2xl font-black uppercase tracking-[0.08em] text-white">Newest tournament launches</h2>
            </div>
            <Link href="/admin/tournaments" className="text-sm font-bold text-slate-400 transition-colors hover:text-white">
              Open all
            </Link>
          </div>
          <div className="divide-y divide-white/8">
            {recentTournaments.map((tournament) => {
              const admin = tournament.admins[0]?.user;
              return (
                <div key={tournament.id} className="grid gap-4 px-5 py-5 md:grid-cols-[minmax(0,1.5fr)_repeat(3,minmax(0,0.7fr))]">
                  <div className="min-w-0">
                    <div className="truncate font-display text-2xl font-black uppercase tracking-[0.06em] text-white">{tournament.title}</div>
                    <div className="mt-2 flex flex-wrap gap-2 text-[0.62rem] font-black uppercase tracking-[0.18em]">
                      <span className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-cyan-200">
                        {getGameModeLabel(tournament.gameMode)}
                      </span>
                      <span className="rounded-full border border-white/10 bg-white/6 px-3 py-1 text-slate-300">
                        {getTournamentFormatLabel(tournament.format)}
                      </span>
                    </div>
                    <div className="mt-3 text-sm text-slate-400">
                      Hosted by {admin?.name || admin?.email?.split("@")[0] || "Community Heroes"}
                    </div>
                  </div>
                  <DashboardCell label="Status" value={tournament.status.replaceAll("_", " ")} />
                  <DashboardCell label="Participants" value={tournament._count.participants} />
                  <DashboardCell
                    label="Start Window"
                    value={tournament.startDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  />
                  <div className="flex items-center justify-start md:justify-end">
                    <Link href={`/admin/tournaments/${tournament.id}/edit`} className="action-button-secondary text-[11px]">
                      Edit
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </SurfaceCard>

        <div className="grid gap-6">
          <SurfaceCard tone="blue">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <div className="text-[0.62rem] font-black uppercase tracking-[0.24em] text-cyan-300">Operations Focus</div>
                <h2 className="mt-2 font-display text-2xl font-black uppercase tracking-[0.08em] text-white">What needs attention</h2>
              </div>
              <Clock3 className="h-5 w-5 text-cyan-300" />
            </div>
            <div className="space-y-3">
              <OpsAlert
                tone="gold"
                title="Registration pressure"
                description={`${openTournaments} tournaments are currently accepting entries. Review caps and start windows before they auto-fill.`}
              />
              <OpsAlert
                tone="blue"
                title="Live bracket load"
                description={`${activeMatches} matches are active right now across ${activeTournaments} live tournaments.`}
              />
              <OpsAlert
                tone="danger"
                title="Moderator coverage"
                description={`${moderators} moderators are handling ${totalAreas} configured areas. Expand assignments if new territories are added.`}
              />
            </div>
          </SurfaceCard>

          <SurfaceCard tone="danger">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <div className="text-[0.62rem] font-black uppercase tracking-[0.24em] text-rose-200">Recent Access</div>
                <h2 className="mt-2 font-display text-2xl font-black uppercase tracking-[0.08em] text-white">Newest accounts</h2>
              </div>
              <Users className="h-5 w-5 text-rose-200" />
            </div>
            <div className="space-y-3">
              {recentUsers.map((user) => (
                <div key={user.id} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-4">
                  <div className="min-w-0">
                    <div className="truncate text-sm font-bold text-white">{user.name || user.email?.split("@")[0] || "Unnamed User"}</div>
                    <div className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-500">{user.role}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-bold text-slate-300">
                      {user.createdAt.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </div>
                    <div className="mt-1 text-[0.62rem] uppercase tracking-[0.18em] text-slate-500">Joined</div>
                  </div>
                </div>
              ))}
            </div>
          </SurfaceCard>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <QuickLink
          href="/admin/users"
          icon={<UserCog className="h-5 w-5" />}
          title="User Management"
          description="Promote moderators, audit new registrations, and manage account access from one panel."
        />
        <QuickLink
          href="/admin/settings"
          icon={<Map className="h-5 w-5" />}
          title="Area Settings"
          description="Update coverage maps, assign handlers, and keep region locks aligned with tournament rules."
        />
        <QuickLink
          href="/admin/tournaments"
          icon={<Swords className="h-5 w-5" />}
          title="Bracket Operations"
          description="Jump into tournament editing, match oversight, and launch preparation without digging through tabs."
        />
      </div>
    </PageShell>
  );
}

function DashboardCell({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="min-w-0">
      <div className="text-[0.58rem] font-black uppercase tracking-[0.22em] text-slate-500">{label}</div>
      <div className="mt-2 truncate text-sm font-bold text-white">{value}</div>
    </div>
  );
}

function StatusRow({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
      <div className="flex items-center gap-3">
        <div className="rounded-xl border border-white/10 bg-white/6 p-2 text-primary">{icon}</div>
        <div>
          <div className="text-[0.6rem] font-black uppercase tracking-[0.2em] text-slate-500">{label}</div>
          <div className="mt-1 text-sm font-bold text-white">{value}</div>
        </div>
      </div>
      <Activity className="h-4 w-4 text-emerald-300" />
    </div>
  );
}

function OpsAlert({
  tone,
  title,
  description,
}: {
  tone: "gold" | "blue" | "danger";
  title: string;
  description: string;
}) {
  const toneStyles = {
    gold: "border-primary/20 bg-primary/8 text-primary",
    blue: "border-cyan-300/20 bg-cyan-300/8 text-cyan-200",
    danger: "border-rose-300/20 bg-rose-300/8 text-rose-200",
  } as const;

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className={`inline-flex rounded-full border px-3 py-1 text-[0.58rem] font-black uppercase tracking-[0.2em] ${toneStyles[tone]}`}>
        {title}
      </div>
      <p className="mt-3 text-sm leading-7 text-slate-300">{description}</p>
    </div>
  );
}

function QuickLink({
  href,
  icon,
  title,
  description,
}: {
  href: string;
  icon: ReactNode;
  title: string;
  description: string;
}) {
  return (
    <Link href={href}>
      <SurfaceCard className="group h-full transition-all duration-300 hover:-translate-y-1 hover:border-primary/20">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/6 text-primary">
              {icon}
            </div>
            <h2 className="mt-5 font-display text-2xl font-black uppercase tracking-[0.08em] text-white">{title}</h2>
            <p className="mt-3 text-sm leading-7 text-slate-300">{description}</p>
          </div>
          <ArrowRight className="h-5 w-5 text-slate-500 transition-transform duration-300 group-hover:translate-x-1 group-hover:text-primary" />
        </div>
      </SurfaceCard>
    </Link>
  );
}
