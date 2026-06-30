import Link from "next/link";
import {
  ArrowRight,
  Calendar,
  Clock,
  MessageSquare,
  Swords,
  Target,
  Trophy,
  Users,
  UserPlus,
  FileText,
} from "lucide-react";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { EmptyState, PageShell, SurfaceCard } from "@/components/ui/PageShell";
import { calculateUserXP } from "@/lib/xp";

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

  const featuredTournament = await prisma.tournament.findFirst({
    where: { status: { in: ["REGISTRATION_OPEN", "ONGOING", "UPCOMING"] } },
    orderBy: { createdAt: "desc" },
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

  return (
    <PageShell size="wide">
      {/* Top Banner Row — Tournament Banner (left) + Player Profile (right) */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.6fr_1fr]">
        {/* Tournament Banner Card */}
        {featuredTournament?.banner ? (
          <Link href={`/tournaments/${featuredTournament.id}`} className="group block">
            <div className="relative w-full h-full min-h-[200px] sm:min-h-[260px] overflow-hidden rounded-2xl border border-border">
              <img
                src={featuredTournament.banner}
                alt={featuredTournament.title}
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6">
                <div className="text-[0.6rem] font-bold uppercase tracking-[0.2em] text-primary/80 sm:text-[0.65rem]">
                  {featuredTournament.status?.replaceAll("_", " ") || "Tournament"}
                </div>
                <h3 className="mt-1 font-display text-lg font-black uppercase tracking-tight text-white sm:text-2xl lg:text-3xl">
                  {featuredTournament.title}
                </h3>
                <p className="mt-1 text-[0.7rem] text-slate-400 sm:text-xs">
                  Competitive Tournaments
                </p>
              </div>
            </div>
          </Link>
        ) : (
          <div className="relative w-full min-h-[200px] sm:min-h-[260px] overflow-hidden rounded-2xl border border-border bg-card flex items-center justify-center">
            <div className="text-center p-6">
              <Trophy className="h-10 w-10 mx-auto text-primary/40 mb-3" />
              <div className="text-sm font-bold text-slate-400">No featured tournament yet</div>
              <div className="mt-1 text-xs text-slate-500">Check back soon for the next event</div>
            </div>
          </div>
        )}

        {/* Player Profile Card */}
        <SurfaceCard tone="gold" className="gamer-id-card h-full min-h-[200px] p-4 sm:min-h-[260px] sm:p-5">
          <div className="relative z-10 flex h-full flex-col justify-between">
            <div>
              <div className="text-[0.62rem] font-black uppercase tracking-[0.24em] text-primary">Player Profile</div>
              <div className="mt-3 flex items-center gap-3 sm:mt-4 sm:gap-4">
                <div className="rounded-xl bg-[linear-gradient(135deg,#fef08a,#f59e0b)] p-[2px]">
                  <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-xl bg-[#050816] text-lg font-black text-primary sm:h-16 sm:w-16 sm:text-xl">
                    {session?.user?.image ? (
                      <img src={session.user.image} alt="" className="h-full w-full object-cover" />
                    ) : (
                      session?.user?.name?.charAt(0) || "?"
                    )}
                  </div>
                </div>
                <div className="min-w-0">
                  <div className="truncate font-display text-lg font-black uppercase tracking-[0.06em] text-white sm:text-xl sm:tracking-[0.08em]">
                    {session?.user?.name || "Guest Player"}
                  </div>
                  <div className="mt-1 text-xs text-slate-400 sm:text-sm">
                    {user?.mlbbId ? `MLBB ID ${user.mlbbId}` : "Community Heroes member"}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-3 flex-1 space-y-2 overflow-y-auto pr-1 custom-scrollbar sm:mt-4 sm:space-y-2.5 sm:pr-2">
              <div className="rounded-xl border border-white/[0.04] bg-white/[0.02] p-2.5">
                <div className="mb-1.5 text-[0.58rem] font-black uppercase tracking-[0.24em] text-white">Winnings</div>
                <div className="text-xs font-bold text-slate-300">
                  Total: <span className="text-primary">{totalDiamonds.toLocaleString()} 💎</span>
                  {totalCash > 0 ? ` / $${totalCash.toLocaleString()}` : ""}
                </div>
              </div>
              {[
                { label: "Level", value: `Lvl ${xpData.level}` },
                { label: "Rank", value: user?.rank || "Rookie" },
                { label: "Server", value: user?.server || "Unset" },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between rounded-xl border border-white/5 bg-white/4 px-3 py-1.5 sm:px-4">
                  <span className="text-[0.58rem] font-black uppercase tracking-[0.24em] text-slate-500">{item.label}</span>
                  <span className="text-xs font-bold text-white sm:text-sm">{item.value}</span>
                </div>
              ))}
            </div>

            <div className="mt-2.5 sm:mt-3">
              <div className="mb-1.5 flex items-center justify-between text-[0.58rem] font-bold uppercase tracking-[0.18em] text-slate-400">
                <span>Season XP</span>
                <span className="text-primary">{xpData.xpInCurrentLevel} / {xpData.xpNeededForNextLevel}</span>
              </div>
              <div className="stat-bar h-1">
                <div className="stat-bar-fill" style={{ width: `${xpData.xpPercentage}%` }} />
              </div>
            </div>
          </div>
        </SurfaceCard>
      </div>

      {/* Activity Feed */}
      <SurfaceCard>
        <div className="mb-4 flex items-center justify-between gap-4 sm:mb-5">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-primary/20 bg-primary/10 text-primary">
              <Clock className="h-4 w-4" />
            </div>
            <div>
              <h2 className="font-display text-lg font-black uppercase tracking-[0.06em] text-foreground sm:text-xl">Recent Activity</h2>
            </div>
          </div>
          <Link href="/feed" className="text-xs font-bold text-muted-foreground transition-colors hover:text-primary">
            View feed
          </Link>
        </div>

        <div className="space-y-3">
          {/* Recent Posts */}
          {recentPosts.map((post: any) => (
            <Link key={post.id} href="/feed" className="flex items-start gap-3 rounded-xl border border-border bg-card/50 p-3 transition-colors hover:bg-card">
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted">
                {post.user?.image ? (
                  <img src={post.user.image} alt="" className="h-full w-full object-cover" />
                ) : (
                  <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-foreground">{post.user?.name || "Unknown"}</span>
                  <span className="text-[0.6rem] text-muted-foreground">shared a post</span>
                </div>
                <p className="mt-0.5 truncate text-xs text-muted-foreground">{post.content}</p>
                <div className="mt-1.5 flex items-center gap-3 text-[0.6rem] text-muted-foreground">
                  <span>{post._count?.reactions || 0} reactions</span>
                  <span>{post._count?.comments || 0} comments</span>
                  <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </Link>
          ))}

          {/* Recent Friend Connections */}
          {recentFriendships.map((f: any) => {
            const friendName = f.userId === user?.id ? f.friend?.name : f.user?.name;
            const friendImage = f.userId === user?.id ? f.friend?.image : f.user?.image;
            return (
              <div key={f.id} className="flex items-center gap-3 rounded-xl border border-border bg-card/50 p-3">
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-green-500/15">
                  {friendImage ? (
                    <img src={friendImage} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <UserPlus className="h-3.5 w-3.5 text-green-400" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-foreground">{friendName || "A player"}</span>
                    <span className="text-[0.6rem] text-muted-foreground">is now your friend</span>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Recent Tournaments */}
          {recentTournaments.map((t: any) => (
            <Link key={t.id} href={`/tournaments/${t.id}`} className="flex items-center gap-3 rounded-xl border border-border bg-card/50 p-3 transition-colors hover:bg-card">
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary/15">
                <Trophy className="h-3.5 w-3.5 text-primary" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-foreground truncate">{t.title}</span>
                  <span className="flex-shrink-0 rounded-full bg-primary/15 px-2 py-0.5 text-[0.55rem] font-bold uppercase text-primary">
                    {t.status?.replaceAll("_", " ")}
                  </span>
                </div>
                <div className="mt-0.5 text-[0.6rem] text-muted-foreground">
                  {t._count?.participants || 0} participants · {new Date(t.startDate).toLocaleDateString()}
                </div>
              </div>
            </Link>
          ))}

          {recentPosts.length === 0 && recentFriendships.length === 0 && recentTournaments.length === 0 && (
            <div className="py-6 text-center text-sm text-muted-foreground">
              No recent activity yet. Start by joining a tournament or posting in the feed!
            </div>
          )}
        </div>
      </SurfaceCard>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.5fr)_1fr]">
        <SurfaceCard>
          <div className="mb-5 flex items-center justify-between gap-4 sm:mb-6">
            <div>
              <div className="text-[0.62rem] font-black uppercase tracking-[0.24em] text-primary">Explore Matches</div>
              <h2 className="mt-2 font-display text-xl font-black uppercase tracking-[0.06em] text-white sm:text-2xl sm:tracking-[0.08em]">Choose your next game</h2>
            </div>
            <Link href="/events" className="text-sm font-bold text-slate-400 transition-colors hover:text-primary">
              View all
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {[
              {
                title: "Tournaments",
                description: "Join live brackets, track slots, and lock in your entry before registration closes.",
                href: "/tournaments",
                icon: <Trophy className="h-5 w-5" />,
                tone: "from-amber-300/18 to-orange-400/10",
              },
              {
                title: "Events",
                description: "See the community calendar, launches, and official match-day broadcasts.",
                href: "/events",
                icon: <Calendar className="h-5 w-5" />,
                tone: "from-amber-300/18 to-yellow-400/10",
              },
              {
                title: "Squads",
                description: "Recruit players, organize roles, and keep your roster tournament-ready.",
                href: "/teams/my-team",
                icon: <Users className="h-5 w-5" />,
                tone: "from-fuchsia-300/18 to-violet-400/10",
              },
              {
                title: "Chat",
                description: "Use community chat to find teammates, scrims, and last-minute replacements.",
                href: "/chat",
                icon: <MessageSquare className="h-5 w-5" />,
                tone: "from-yellow-300/18 to-amber-400/10",
              },
            ].map((card) => (
              <Link
                key={card.title}
                href={card.href}
                className="group esports-card p-4 transition-all duration-300 hover:-translate-y-1 sm:p-5"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${card.tone} opacity-80`} />
                <div className="relative z-10 flex h-full flex-col">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/12 bg-[#081120]/80 text-white sm:h-12 sm:w-12 sm:rounded-xl">
                    {card.icon}
                  </div>
                  <h3 className="mt-4 font-display text-xl font-black uppercase tracking-[0.06em] text-white sm:mt-5 sm:text-2xl sm:tracking-[0.08em]">{card.title}</h3>
                  <p className="mt-2.5 flex-1 text-sm leading-6 text-slate-300 sm:mt-3 sm:leading-7">{card.description}</p>
                  <div className="mt-4 flex items-center gap-2 text-sm font-bold text-primary sm:mt-5">
                    Open page
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </SurfaceCard>

        <div className="space-y-6">
          <SurfaceCard tone="gold">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl border bg-primary/15 border-primary/15 bg-primary/10 text-primary/80">
                <Target className="h-5 w-5" />
              </div>
              <div>
                <div className="text-[0.62rem] font-black uppercase tracking-[0.24em] text-primary">Quick Access</div>
                <div className="mt-1 font-display text-xl font-black uppercase tracking-[0.06em] text-white sm:text-2xl sm:tracking-[0.08em]">Ready your team</div>
              </div>
            </div>
            <div className="mt-5 space-y-3">
              <Link href="/tournaments" className="action-button-primary w-full justify-between text-[11px]">
                View Tournaments
                <Swords className="h-4 w-4" />
              </Link>
              <Link href="/chat" className="action-button-secondary w-full justify-between text-[11px]">
                Find a Team
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </SurfaceCard>
        </div>
      </div>

      {!featuredTournament ? (
        <EmptyState
          icon={<Trophy className="h-8 w-8" />}
          title="No featured tournament yet"
          description="The arena is still warming up. When admins publish the next event, it will appear here with the new visual treatment."
          action={<Link href="/events" className="action-button-secondary text-[11px]">Check events</Link>}
        />
      ) : null}
    </PageShell>
  );
}
