import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Calendar, Mail, MapPin, Phone, Shield, Star, Trophy, User, Zap } from "lucide-react";
import { EmptyState, PageHero, PageShell, SurfaceCard } from "@/components/ui/PageShell";
import { calculateUserXP } from "@/lib/xp";

export default async function ProfilePage() {
  const session = await auth();
  const user = session?.user?.email
    ? await prisma.user.findUnique({
        where: { email: session.user.email },
        include: {
          awards: {
            orderBy: { createdAt: "desc" },
            include: { tournament: { select: { title: true } } },
          },
          _count: {
            select: {
              participations: true,
              awards: true,
            },
          },
        },
      })
    : null;

  if (!user) {
    return (
      <PageShell>
        <EmptyState
          icon={<User className="h-8 w-8" />}
          title="Profile not found"
          description="Sign in to view and customize your player profile."
          action={<Link href="/login" className="action-button-primary text-[11px]">Go to login</Link>}
        />
      </PageShell>
    );
  }

  const xpData = calculateUserXP({
    participationsCount: user._count.participations,
    awardsCount: user._count.awards,
  });

  return (
    <PageShell size="wide">
      <PageHero
        eyebrow="Player Profile"
        icon={<Shield className="h-4 w-4" />}
        title={
          <>
            {user.name || "Unnamed Player"}
            <span className="text-gradient-primary"> profile</span>
          </>
        }
        description="Your player details, tournament history, and account info all live here in one cleaner MLBB profile page."
        stats={[
          { label: "Level", value: `Lvl ${xpData.level}` },
          { label: "Rank", value: user.rank || "Unranked" },
          { label: "Tournaments", value: user._count.participations },
        ]}
        actions={<Link href="/profile/edit" className="action-button-primary text-[11px]">Edit Profile</Link>}
        aside={
          <SurfaceCard tone="gold" className="h-full min-w-[240px] p-6">
            <div className="relative z-10 flex h-full flex-col items-center justify-between text-center">
              <div className="flex flex-col items-center">
                <div className="rounded-full bg-[linear-gradient(135deg,#fef08a,#f59e0b)] p-[3px]">
                  <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-[#07101f] text-4xl font-black text-primary sm:h-32 sm:w-32 sm:text-5xl">
                    {user.image ? (
                      <img src={user.image} alt={user.name || "User"} className="h-full w-full object-cover" />
                    ) : (
                      user.name?.charAt(0) || "U"
                    )}
                  </div>
                </div>
                <div className="mt-4 font-display text-2xl font-black uppercase tracking-[0.06em] text-white sm:mt-6 sm:text-3xl sm:tracking-[0.08em]">{user.rank || "Rookie"}</div>
                <div className="mt-2 text-xs text-slate-400 sm:text-sm">{user.mlbbId ? `MLBB ID ${user.mlbbId}` : "Set your MLBB ID in profile edit"}</div>
              </div>

              <div className="mt-6 w-full border-t border-white/5 pt-4 text-left">
                <div className="flex items-center justify-between text-[0.62rem] font-bold uppercase tracking-[0.18em] text-slate-400 font-display">
                  <span>Season Progress</span>
                  <span className="text-primary">{xpData.xpInCurrentLevel} / {xpData.xpNeededForNextLevel} XP</span>
                </div>
                <div className="stat-bar mt-2 h-1.5 w-full">
                  <div className="stat-bar-fill" style={{ width: `${xpData.xpPercentage}%` }} />
                </div>
              </div>
            </div>
          </SurfaceCard>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.5fr)_360px]">
        <div className="space-y-6">
          <SurfaceCard>
            <div className="mb-5 flex items-center gap-3">
              <Star className="h-5 w-5 text-primary" />
              <h2 className="font-display text-xl font-black uppercase tracking-[0.06em] text-white sm:text-2xl sm:tracking-[0.08em]">Player Summary</h2>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <ProfileStat label="Tournaments" value={user._count.participations} icon={<Trophy className="h-5 w-5 text-primary" />} />
              <ProfileStat label="Win Rate" value="0%" icon={<Zap className="h-5 w-5 text-cyan-300" />} />
              <ProfileStat label="Level" value={`Lvl ${xpData.level}`} icon={<Shield className="h-5 w-5 text-fuchsia-300" />} />
              <ProfileStat label="Server" value={user.server || "-"} icon={<MapPin className="h-5 w-5 text-emerald-300" />} />
            </div>
          </SurfaceCard>

          <SurfaceCard>
            <div className="mb-5 flex items-center gap-3">
              <Trophy className="h-5 w-5 text-primary" />
              <h2 className="font-display text-xl font-black uppercase tracking-[0.06em] text-white sm:text-2xl sm:tracking-[0.08em]">Recent Achievements</h2>
            </div>
            {!user.awards || user.awards.length === 0 ? (
              <div className="rounded-[1.4rem] border border-dashed border-white/10 bg-white/4 px-6 py-12 text-center text-sm text-slate-400">
                No achievements yet. Join tournaments to start stacking badges and placements.
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {user.awards.map((award: any) => {
                  const isDiamonds = award.currency === "DIAMONDS";
                  const isGold = isDiamonds ? award.amount >= 1500 : award.amount >= 20;
                  return (
                    <div key={award.id} className="flex items-center gap-3.5 rounded-2xl border border-white/5 bg-white/4 p-4 hover:border-primary/20 transition-all hover:scale-[1.01] duration-300">
                      <div className={`flex h-11 w-11 items-center justify-center rounded-xl flex-shrink-0 ${
                        isGold ? "bg-amber-500/10 text-amber-300 border border-amber-500/20" : "bg-slate-400/10 text-slate-400 border border-slate-400/20"
                      }`}>
                        <Trophy className="h-5 w-5" />
                      </div>
                      <div className="min-w-0">
                        <div className="font-display text-sm font-black uppercase tracking-wider text-white flex items-center gap-1.5">
                          {isDiamonds ? (
                            <>
                              <span className="text-primary">{award.amount.toLocaleString()}</span>
                              <span className="text-primary/70 text-xs">💎</span>
                            </>
                          ) : (
                            <>
                              <span className="text-emerald-400">${award.amount.toLocaleString()}</span>
                              <span className="text-emerald-500/70 text-xs">CASH</span>
                            </>
                          )}
                        </div>
                        <div className="text-xs text-slate-400 truncate mt-0.5" title={award.tournament?.title || "Community Heroes Award"}>
                          {award.tournament?.title || "Community Heroes Award"}
                        </div>
                        <div className="text-[9px] text-slate-500 font-bold uppercase tracking-wider mt-1">
                          {new Date(award.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </SurfaceCard>

          <SurfaceCard>
            <div className="mb-5 flex items-center gap-3">
              <Shield className="h-5 w-5 text-cyan-300" />
              <h2 className="font-display text-xl font-black uppercase tracking-[0.06em] text-white sm:text-2xl sm:tracking-[0.08em]">Match History</h2>
            </div>
            <div className="rounded-[1.4rem] border border-dashed border-white/10 bg-white/4 px-6 py-12 text-center text-sm text-slate-400">
              Match logs will appear here as soon as you complete your first recorded tournament series.
            </div>
          </SurfaceCard>
        </div>

        <div className="space-y-6">
          <SurfaceCard tone="blue">
            <div className="mb-5 flex items-center gap-3">
              <Mail className="h-5 w-5 text-cyan-300" />
              <h2 className="font-display text-xl font-black uppercase tracking-[0.06em] text-white sm:text-2xl sm:tracking-[0.08em]">Contact</h2>
            </div>
            <div className="space-y-3">
              <InfoRow icon={<Mail className="h-4 w-4" />} label="Email" value={user.email} />
              <InfoRow icon={<Phone className="h-4 w-4" />} label="Phone" value={user.phoneNumber || "Not set"} />
              <InfoRow icon={<MapPin className="h-4 w-4" />} label="Location" value={user.address || "Not set"} />
              <InfoRow icon={<Calendar className="h-4 w-4" />} label="Joined" value={new Date(user.createdAt).toLocaleDateString()} />
            </div>
          </SurfaceCard>

          <SurfaceCard>
            <div className="mb-5 flex items-center gap-3">
              <Shield className="h-5 w-5 text-primary" />
              <h2 className="font-display text-xl font-black uppercase tracking-[0.06em] text-white sm:text-2xl sm:tracking-[0.08em]">Game Identity</h2>
            </div>
            <div className="space-y-3">
              <InfoRow icon={<User className="h-4 w-4" />} label="Display Name" value={user.name || "Unknown"} />
              <InfoRow icon={<Trophy className="h-4 w-4" />} label="Rank" value={user.rank || "Unranked"} />
              <InfoRow icon={<Shield className="h-4 w-4" />} label="Server" value={user.server || "-"} />
              <InfoRow icon={<Zap className="h-4 w-4" />} label="MLBB ID" value={user.mlbbId || "Not set"} />
            </div>
          </SurfaceCard>
        </div>
      </div>
    </PageShell>
  );
}

function ProfileStat({ label, value, icon }: { label: string; value: React.ReactNode; icon: React.ReactNode }) {
  return (
    <div className="rounded-[1.2rem] border border-white/10 bg-white/5 px-4 py-3.5 sm:rounded-[1.4rem] sm:py-4">
      <div className="flex items-center justify-between">
        <span className="text-[0.58rem] font-black uppercase tracking-[0.22em] text-slate-500">{label}</span>
        {icon}
      </div>
      <div className="mt-3 font-display text-2xl font-black uppercase tracking-[0.06em] text-white sm:mt-4 sm:text-3xl sm:tracking-[0.08em]">{value}</div>
    </div>
  );
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
      <div className="mt-1 text-primary">{icon}</div>
      <div className="min-w-0">
        <div className="text-[0.58rem] font-black uppercase tracking-[0.22em] text-slate-500">{label}</div>
        <div className="mt-1 text-sm text-slate-200">{value}</div>
      </div>
    </div>
  );
}
