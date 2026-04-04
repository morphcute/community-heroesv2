import Link from "next/link";
import {
  ArrowRight,
  Calendar,
  Crosshair,
  MessageSquare,
  Swords,
  Target,
  Trophy,
  Users,
} from "lucide-react";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { EmptyState, PageHero, PageShell, SurfaceCard } from "@/components/ui/PageShell";

function formatPrizePool(prizePool?: string | null) {
  if (!prizePool) return "TBA";

  try {
    const parsed = JSON.parse(prizePool) as {
      total?: string | number;
      currency?: string;
    };

    if (parsed && typeof parsed === "object" && parsed.total) {
      return `${parsed.total}${parsed.currency ? ` ${parsed.currency}` : ""}`;
    }
  } catch {}

  return prizePool;
}

export default async function Dashboard() {
  const session = await auth();
  const user = session?.user?.email
    ? await prisma.user.findUnique({ where: { email: session.user.email } })
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

  const heroStats = [
    { label: "Player Rank", value: user?.rank || "Rookie" },
    { label: "Mode", value: featuredTournament?.gameMode?.replaceAll("_", " ") || "Standby" },
    { label: "Entry", value: featuredTournament?.entryFee || "Free" },
  ];

  const featuredPrize = formatPrizePool(featuredTournament?.prizePool);
  const featuredStartDate = featuredTournament
    ? featuredTournament.startDate.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "Soon";
  const featuredStatus = featuredTournament?.status?.replaceAll("_", " ") || "Offline";

  return (
    <PageShell size="wide">
      <PageHero
        eyebrow="Home Overview"
        icon={<Crosshair className="h-4 w-4" />}
        title={
          <>
            Prepare your next
            <span className="text-gradient-primary"> ranked push</span>
          </>
        }
        description={
          featuredTournament
            ? `${featuredTournament.title} is now featured. Check your player profile, ready your team, and register before the slots are filled.`
            : "Your home screen is ready. Track events, find teammates, and jump into the next Community Heroes match day."
        }
        stats={heroStats}
        actions={
          <>
            {featuredTournament ? (
              <Link href={`/tournaments/${featuredTournament.id}`} className="action-button-primary text-[11px]">
                Enter Tournament
                <ArrowRight className="h-4 w-4" />
              </Link>
            ) : null}
            <Link href="/events" className="action-button-secondary text-[11px]">
              Browse Events
            </Link>
          </>
        }
        aside={
          <SurfaceCard tone="gold" className="gamer-id-card h-full min-h-[240px] p-4 sm:min-h-[280px] sm:p-6">
            <div className="relative z-10 flex h-full flex-col justify-between">
              <div>
                <div className="text-[0.62rem] font-black uppercase tracking-[0.24em] text-primary">Player Profile</div>
                <div className="mt-3 flex items-center gap-3 sm:mt-4 sm:gap-4">
                  <div className="rounded-full bg-[linear-gradient(135deg,#fef08a,#f59e0b)] p-[2px]">
                    <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-full bg-[#050816] text-lg font-black text-primary sm:h-16 sm:w-16 sm:text-xl">
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

              <div className="mt-4 block flex-1 space-y-2.5 overflow-y-auto pr-1 custom-scrollbar sm:mt-5 sm:space-y-3 sm:pr-2">
                <div className="rounded-lg border border-white/[0.04] bg-white/[0.02] p-3">
                  <div className="mb-2 text-[0.62rem] font-black uppercase tracking-[0.24em] text-white">Winnings</div>
                  <div className="text-xs font-bold text-slate-300">
                    Total: <span className="text-primary">{totalDiamonds.toLocaleString()} 💎</span>
                    {totalCash > 0 ? ` / $${totalCash.toLocaleString()}` : ""}
                  </div>
                </div>
                {[
                  { label: "Rank", value: user?.rank || "Rookie" },
                  { label: "Server", value: user?.server || "Unset" },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between rounded-lg border border-white/5 bg-white/4 px-3 py-2 sm:px-4">
                    <span className="text-[0.6rem] font-black uppercase tracking-[0.24em] text-slate-500">{item.label}</span>
                    <span className="text-xs font-bold text-white sm:text-sm">{item.value}</span>
                  </div>
                ))}
              </div>

              <div className="mt-3 sm:mt-4">
                <div className="mb-2 flex items-center justify-between text-[0.62rem] font-bold uppercase tracking-[0.18em] text-slate-400">
                  <span>Season XP</span>
                  <span className="text-primary">0 / 1400</span>
                </div>
                <div className="stat-bar h-1">
                  <div className="stat-bar-fill" style={{ width: "12%" }} />
                </div>
              </div>
            </div>
          </SurfaceCard>
        }
      />

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
                tone: "from-cyan-300/18 to-blue-400/10",
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
                tone: "from-emerald-300/18 to-cyan-400/10",
              },
            ].map((card) => (
              <Link
                key={card.title}
                href={card.href}
                className="group relative overflow-hidden rounded-[1.35rem] border border-white/10 bg-white/5 p-4 transition-all duration-300 hover:-translate-y-1 hover:border-primary/25 sm:rounded-[1.6rem] sm:p-5"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${card.tone} opacity-80`} />
                <div className="relative z-10 flex h-full flex-col">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/12 bg-[#081120]/80 text-white sm:h-12 sm:w-12 sm:rounded-2xl">
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
          <SurfaceCard tone="blue" className="p-4 sm:p-6">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.18),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(250,204,21,0.16),transparent_22%)]" />
            <div className="relative z-10 flex h-full flex-col justify-between">
              <div>
                <div className="text-[0.62rem] font-black uppercase tracking-[0.26em] text-cyan-300">Featured Tournament</div>
                <h2 className="mt-3 font-display text-[1.85rem] font-black uppercase tracking-[0.05em] text-white sm:mt-4 sm:text-4xl sm:tracking-[0.08em]">
                  {featuredTournament?.title || "Awaiting Next Tournament"}
                </h2>
                <p className="mt-3 text-sm leading-6 text-slate-300 sm:leading-7">
                  {featuredTournament
                    ? `${featuredTournament.format.replaceAll("_", " ")} bracket, ${featuredTournament.gameMode.replaceAll("_", " ")} mode.`
                    : "As soon as the next event goes live, it will appear here with instant access."}
                </p>
              </div>
              <div className="mt-5 flex flex-col gap-2.5 sm:mt-6 sm:gap-3">
                {[
                  { label: "Prize", value: featuredPrize },
                  { label: "Starts", value: featuredStartDate },
                  { label: "Status", value: featuredStatus },
                ].map((item) => (
                  <div key={item.label} className="flex min-w-0 items-center justify-between rounded-xl border border-white/10 bg-white/6 px-3 py-2.5 sm:rounded-2xl sm:px-4 sm:py-3">
                    <div className="text-[0.6rem] font-black uppercase tracking-[0.22em] text-slate-500">{item.label}</div>
                    <div className="break-words text-right text-xs font-bold leading-5 text-white sm:text-sm sm:leading-6">
                      {item.value}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </SurfaceCard>

          <SurfaceCard tone="blue">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-cyan-300/20 bg-cyan-300/10 text-cyan-200">
                <Target className="h-5 w-5" />
              </div>
              <div>
                <div className="text-[0.62rem] font-black uppercase tracking-[0.24em] text-cyan-300">Quick Access</div>
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
