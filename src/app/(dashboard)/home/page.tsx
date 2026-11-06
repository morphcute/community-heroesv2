import Link from "next/link";
import {
  ArrowRight,
  ChevronRight,
  Gem,
  MessageSquare,
  Swords,
  Trophy,
  Users,
  UserPlus,
  Activity,
} from "lucide-react";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { PageShell, SurfaceCard } from "@/components/ui/PageShell";
import { calculateUserXP } from "@/lib/xp";
import TournamentCarousel from "@/components/TournamentCarousel";

export default async function Dashboard() {
  const session = await auth();
  const user = session?.user?.email
    ? await prisma.user.findUnique({
        where: { email: session.user.email },
        include: {
          _count: {
            select: {
              participations: true,
              awards: true,
            },
          },
        },
      })
    : null;

  const activeTournaments = await prisma.tournament.findMany({
    where: { status: { in: ["REGISTRATION_OPEN", "ONGOING", "UPCOMING"] } },
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { participants: true } },
      admins: {
        where: { role: "ADMIN" },
        include: { user: { select: { name: true, image: true } } }
      }
    }
  });

  const userAwards = user?.id
    ? await (prisma as any).award.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
        take: 5,
        include: { tournament: { select: { title: true } } },
      })
    : [];

  const totalDiamonds = userAwards.filter((a: any) => a.currency === "DIAMONDS").reduce((acc: number, a: any) => acc + a.amount, 0);
  const totalCash = userAwards.filter((a: any) => a.currency === "CASH").reduce((acc: number, a: any) => acc + a.amount, 0);

  const xpData = calculateUserXP({
    participationsCount: user?._count?.participations ?? 0,
    awardsCount: user?._count?.awards ?? 0,
  });

  // Activity Feed Data
  const recentPosts = await (prisma as any).post.findMany({
    orderBy: { createdAt: "desc" },
    take: 3,
    include: { user: { select: { name: true, image: true } }, _count: { select: { comments: true, reactions: true } } },
  });

  const recentFriendships = user?.id
    ? await (prisma as any).friendship.findMany({
        where: { OR: [{ userId: user.id }, { friendId: user.id }], status: "ACCEPTED" },
        orderBy: { updatedAt: "desc" },
        take: 3,
        include: {
          user: { select: { name: true, image: true } },
          friend: { select: { name: true, image: true } },
        },
      })
    : [];

  const recentTournaments = await prisma.tournament.findMany({
    orderBy: { createdAt: "desc" },
    take: 3,
    include: { _count: { select: { participants: true } } },
  });

  const firstName = session?.user?.name?.split(" ")[0] || "Player";

  const quickLinks = [
    { title: "Tournaments", description: "Live brackets & open slots", href: "/tournaments", icon: Trophy },
    { title: "Scrimmage", description: "Book practice matches", href: "/scrims", icon: Swords },
    { title: "My Squad", description: "Roster, roles & recruits", href: "/teams/my-team", icon: Users },
    { title: "Comms", description: "Chat with your team", href: "/chat", icon: MessageSquare },
  ];

  const statusTone: Record<string, string> = {
    ONGOING: "text-red-400",
    REGISTRATION_OPEN: "text-primary",
    UPCOMING: "text-slate-300",
    COMPLETED: "text-muted-foreground",
    REGISTRATION_CLOSED: "text-muted-foreground",
  };

  return (
    <PageShell size="wide">
      {/* Greeting */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-[0.3em] text-muted-foreground">Command Center</div>
          <h1 className="mt-1 font-display text-3xl font-bold uppercase leading-none text-foreground sm:text-4xl">
            Welcome back, <span className="text-gradient-primary">{firstName}</span>
          </h1>
        </div>
        <Link href="/tournaments" className="action-button-secondary hidden sm:inline-flex">
          Browse events
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      {/* Featured + Player ID */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.65fr_1fr] lg:gap-5">
        <TournamentCarousel tournaments={activeTournaments} />

        <SurfaceCard className="gamer-id-card hud-corners flex flex-col p-5 sm:p-6">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-muted-foreground">Player ID</span>
            <span className="hud-tag">{user?.rank || "Unranked"}</span>
          </div>

          <div className="mt-5 flex items-center gap-4">
            <div className="relative">
              <div className="rounded-xl bg-[image:var(--gradient-primary)] p-[2px] shadow-[0_0_24px_-4px_rgba(242,193,78,0.5)]">
                <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-[10px] bg-[#0b0b0f] font-display text-2xl font-bold text-primary">
                  {session?.user?.image ? (
                    <img src={session.user.image} alt="" className="h-full w-full object-cover" />
                  ) : (
                    session?.user?.name?.charAt(0) || "?"
                  )}
                </div>
              </div>
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 rounded-sm bg-primary px-1.5 py-px font-display text-[10px] font-bold leading-tight text-primary-foreground">
                LV {xpData.level}
              </div>
            </div>
            <div className="min-w-0">
              <div className="truncate font-display text-2xl font-bold uppercase leading-tight text-foreground">
                {session?.user?.name || "Guest Player"}
              </div>
              <div className="mt-0.5 text-xs text-muted-foreground">
                {user?.mlbbId ? `MLBB ID · ${user.mlbbId}` : "Link your MLBB ID in profile"}
                {user?.server ? ` · ${user.server}` : ""}
              </div>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-3 gap-px overflow-hidden rounded-[var(--radius-control)] border border-[var(--edge)] bg-[var(--edge)]">
            {[
              { label: "Winnings", value: totalDiamonds.toLocaleString(), icon: <Gem className="h-3 w-3 text-sky-300" /> },
              { label: "Events", value: user?._count?.participations ?? 0 },
              { label: "Awards", value: user?._count?.awards ?? 0 },
            ].map((s) => (
              <div key={s.label} className="stat-chip px-3 py-3">
                <span className="stat-chip__label">{s.label}</span>
                <span className="stat-chip__value flex items-center gap-1 text-[1.25rem] sm:text-[1.35rem]">
                  {s.value}
                  {s.icon}
                </span>
              </div>
            ))}
          </div>
          {totalCash > 0 ? (
            <div className="mt-2 text-right text-[11px] text-muted-foreground">+ ${totalCash.toLocaleString()} cash prizes</div>
          ) : null}

          <div className="mt-auto pt-6">
            <div className="mb-1.5 flex items-center justify-between text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              <span>Season XP</span>
              <span className="font-display text-xs tabular-nums text-primary">
                {xpData.xpInCurrentLevel} / {xpData.xpNeededForNextLevel}
              </span>
            </div>
            <div className="stat-bar h-1.5">
              <div className="stat-bar-fill shadow-[0_0_10px_rgba(242,193,78,0.6)]" style={{ width: `${xpData.xpPercentage}%` }} />
            </div>
          </div>
        </SurfaceCard>
      </div>

      {/* Quick deploy */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
        {quickLinks.map((card) => (
          <Link key={card.title} href={card.href} className="group esports-card flex items-center gap-3 p-4 sm:gap-4 sm:p-5">
            <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-lg border border-primary/20 bg-primary/[0.08] text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
              <card.icon className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="font-display text-lg font-bold uppercase leading-tight text-foreground">{card.title}</div>
              <div className="hidden truncate text-xs text-muted-foreground sm:block">{card.description}</div>
            </div>
            <ChevronRight className="hidden h-4 w-4 flex-shrink-0 text-muted-foreground transition-all group-hover:translate-x-0.5 group-hover:text-primary sm:block" />
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1.5fr)_1fr] xl:gap-5">
        {/* Activity timeline */}
        <SurfaceCard className="p-5 sm:p-6">
          <div className="mb-5 flex items-center justify-between gap-4">
            <h2 className="flex items-center gap-2.5 font-display text-xl font-bold uppercase text-foreground">
              <Activity className="h-4 w-4 text-primary" />
              Recent Activity
            </h2>
            <Link href="/feed" className="text-xs font-semibold text-muted-foreground transition-colors hover:text-primary">
              Open feed →
            </Link>
          </div>

          <ol className="relative space-y-1 before:absolute before:bottom-3 before:left-[15px] before:top-3 before:w-px before:bg-gradient-to-b before:from-primary/40 before:via-white/10 before:to-transparent">
            {recentPosts.map((post: any) => (
              <li key={post.id}>
                <Link href="/feed" className="group relative flex items-start gap-3.5 rounded-lg p-2 transition-colors hover:bg-white/[0.03]">
                  <div className="relative z-10 flex h-[30px] w-[30px] flex-shrink-0 items-center justify-center overflow-hidden rounded-full border border-border bg-[#111117] text-[11px] font-bold text-muted-foreground">
                    {post.user?.image ? <img src={post.user.image} alt="" className="h-full w-full object-cover" /> : post.user?.name?.charAt(0) || "?"}
                  </div>
                  <div className="min-w-0 flex-1 pt-0.5">
                    <div className="text-[13px] text-muted-foreground">
                      <span className="font-semibold text-foreground">{post.user?.name || "Unknown"}</span> posted in the feed
                    </div>
                    <p className="mt-0.5 truncate text-[13px] text-slate-300">{post.content}</p>
                    <div className="mt-1 flex items-center gap-3 text-[11px] text-muted-foreground">
                      <span>{post._count?.reactions || 0} reactions</span>
                      <span>{post._count?.comments || 0} comments</span>
                      <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </Link>
              </li>
            ))}

            {recentFriendships.map((f: any) => {
              const friendName = f.userId === user?.id ? f.friend?.name : f.user?.name;
              const friendImage = f.userId === user?.id ? f.friend?.image : f.user?.image;
              return (
                <li key={f.id} className="relative flex items-center gap-3.5 rounded-lg p-2">
                  <div className="relative z-10 flex h-[30px] w-[30px] flex-shrink-0 items-center justify-center overflow-hidden rounded-full border border-emerald-500/30 bg-emerald-500/10">
                    {friendImage ? <img src={friendImage} alt="" className="h-full w-full object-cover" /> : <UserPlus className="h-3.5 w-3.5 text-emerald-400" />}
                  </div>
                  <div className="text-[13px] text-muted-foreground">
                    <span className="font-semibold text-foreground">{friendName || "A player"}</span> is now your friend
                  </div>
                </li>
              );
            })}

            {recentPosts.length === 0 && recentFriendships.length === 0 && (
              <li className="py-8 text-center text-sm text-muted-foreground">
                Quiet in the arena. Join a tournament or post in the feed to get things moving.
              </li>
            )}
          </ol>
        </SurfaceCard>

        {/* Latest tournaments */}
        <SurfaceCard className="flex flex-col p-5 sm:p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="flex items-center gap-2.5 font-display text-xl font-bold uppercase text-foreground">
              <Trophy className="h-4 w-4 text-primary" />
              Latest Events
            </h2>
            <Link href="/tournaments" className="text-xs font-semibold text-muted-foreground transition-colors hover:text-primary">
              All →
            </Link>
          </div>

          <div className="divide-y divide-[var(--edge)]">
            {recentTournaments.map((t: any) => (
              <Link key={t.id} href={`/tournaments/${t.id}`} className="group flex items-center gap-3 py-3 first:pt-0">
                <div className="flex h-11 w-11 flex-shrink-0 flex-col items-center justify-center rounded-lg border border-border bg-white/[0.03] leading-none">
                  <span className="text-[9px] font-semibold uppercase text-muted-foreground">
                    {new Date(t.startDate).toLocaleDateString(undefined, { month: "short" })}
                  </span>
                  <span className="font-display text-lg font-bold text-foreground">{new Date(t.startDate).getDate()}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[13.5px] font-semibold text-foreground transition-colors group-hover:text-primary">{t.title}</div>
                  <div className="mt-0.5 flex items-center gap-2 text-[11px] text-muted-foreground">
                    <span className={`font-semibold uppercase tracking-wider ${statusTone[t.status] || ""}`}>{t.status?.replaceAll("_", " ").toLowerCase()}</span>
                    <span>·</span>
                    <span>{t._count?.participants || 0} teams</span>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground transition-all group-hover:translate-x-0.5 group-hover:text-primary" />
              </Link>
            ))}
          </div>

          <div className="mt-auto pt-5">
            <div className="rounded-lg border border-primary/20 bg-gradient-to-br from-primary/[0.08] to-transparent p-4">
              <div className="font-display text-lg font-bold uppercase text-foreground">Ready your squad</div>
              <p className="mt-1 text-xs text-muted-foreground">Lock in a roster before registration closes.</p>
              <div className="mt-3 flex gap-2">
                <Link href="/teams/my-team" className="action-button-primary flex-1 text-[0.72rem]">
                  My Team
                </Link>
                <Link href="/chat" className="action-button-secondary flex-1 text-[0.72rem]">
                  Find Players
                </Link>
              </div>
            </div>
          </div>
        </SurfaceCard>
      </div>
    </PageShell>
  );
}
