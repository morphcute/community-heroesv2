import { Trophy, Crown, Medal, TrendingUp, Star, Users } from "lucide-react";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { GameMode } from "@prisma/client";
import { PageHero, PageShell, SurfaceCard } from "@/components/ui/PageShell";

type EntityStat = {
  id: string;
  name: string | null | undefined;
  image: string | null | undefined;
  matches: number;
  wins: number;
  points: number;
};

export default async function LeaderboardPage({ searchParams }: { searchParams: Promise<{ [key: string]: string | undefined }> }) {
  const resolvedParams = await searchParams;
  const mode = (resolvedParams.mode as GameMode) || GameMode.SOLO_1V1;
  const isTeamMode = mode === GameMode.TEAM_5V5 || mode === GameMode.TRIO_3V3 || mode === GameMode.DUO_2V2;

  // Aggregate live tournament matches
  const matches = await prisma.match.findMany({
    where: {
      status: 'COMPLETED',
      tournament: { gameMode: mode }
    },
    include: {
      winner: { include: { user: true, team: true } },
      participant1: { include: { user: true, team: true } },
      participant2: { include: { user: true, team: true } }
    }
  });

  const entityStats = new Map<string, EntityStat>();

  for (const m of matches) {
    const p1Id = isTeamMode ? m.participant1?.teamId : m.participant1?.userId;
    const p2Id = isTeamMode ? m.participant2?.teamId : m.participant2?.userId;
    const winnerId = isTeamMode ? m.winner?.teamId : m.winner?.userId;

    if (p1Id) {
      if (!entityStats.has(p1Id)) entityStats.set(p1Id, { id: p1Id, name: isTeamMode ? m.participant1?.team?.name : m.participant1?.user?.name, image: isTeamMode ? m.participant1?.team?.logo : m.participant1?.user?.image, matches: 0, wins: 0, points: 0 });
      const stat = entityStats.get(p1Id);
      if (stat) stat.matches += 1;
    }
    if (p2Id) {
      if (!entityStats.has(p2Id)) entityStats.set(p2Id, { id: p2Id, name: isTeamMode ? m.participant2?.team?.name : m.participant2?.user?.name, image: isTeamMode ? m.participant2?.team?.logo : m.participant2?.user?.image, matches: 0, wins: 0, points: 0 });
      const stat = entityStats.get(p2Id);
      if (stat) stat.matches += 1;
    }
    if (winnerId) {
      const stat = entityStats.get(winnerId);
      if (stat) {
        stat.wins += 1;
        stat.points += 100;
      }
    }
  }

  const leaderboardData = Array.from(entityStats.values())
    .filter(e => e.name)
    .sort((a, b) => b.points - a.points || b.wins - a.wins)
    .map((e, idx) => ({
      rank: idx + 1,
      name: e.name ?? "Unknown",
      image: e.image ?? undefined,
      points: e.points,
      wins: e.wins,
      winRate: e.matches > 0 ? Math.round((e.wins / e.matches) * 100) + "%" : "0%"
    }));

  const top3 = leaderboardData.slice(0, 3);
  const podiumOrder = top3.length === 3 ? [top3[1], top3[0], top3[2]] : top3.length === 2 ? [top3[1], top3[0]] : top3;

  const modeFilters = [
    { value: GameMode.SOLO_1V1, label: "Solo 1v1", icon: <Star className="w-4 h-4" /> },
    { value: GameMode.DUO_2V2, label: "Duo 2v2", icon: <Users className="w-4 h-4" /> },
    { value: GameMode.TRIO_3V3, label: "Trio 3v3", icon: <Users className="w-4 h-4" /> },
    { value: GameMode.TEAM_5V5, label: "Team 5v5", icon: <Crown className="w-4 h-4" /> }
  ];

  return (
    <PageShell size="wide">
      <PageHero
        eyebrow="Ranked Circuit"
        icon={<Trophy className="h-4 w-4" />}
        title={
          <>
            Global
            <span className="text-gradient-primary"> leaderboard</span>
          </>
        }
        description="Live rankings based on completed tournament matches across the Community Heroes platform."
        stats={[
          { label: "Mode", value: mode.replaceAll("_", " ") },
          { label: "Ranked", value: leaderboardData.length },
          { label: "Podium", value: top3.length },
        ]}
        aside={
          <SurfaceCard tone="blue">
            <div className="text-[0.56rem] font-black uppercase tracking-[0.2em] text-cyan-300 sm:text-[0.62rem] sm:tracking-[0.24em]">Mode Filter</div>
            <div className="mobile-pill-rail mt-3 sm:mt-4">
              {modeFilters.map((f) => (
                <Link
                  key={f.value}
                  href={`/leaderboard?mode=${f.value}`}
                  className={`mobile-pill flex items-center gap-1.5 sm:gap-2 ${
                    mode === f.value
                      ? "bg-primary text-black shadow-[0_14px_28px_-18px_rgba(250,204,21,0.9)]"
                      : "border border-white/10 bg-white/6 text-slate-400 hover:border-primary/20 hover:text-white"
                  }`}
                >
                  <span className="scale-90 sm:scale-100">{f.icon}</span>
                  {f.label}
                </Link>
              ))}
            </div>
          </SurfaceCard>
        }
      />

      {leaderboardData.length === 0 ? (
         <SurfaceCard className="flex flex-col items-center justify-center py-20 text-center">
            <Trophy className="w-16 h-16 text-gray-700 mb-4" />
            <h3 className="text-2xl font-black text-white">No Ranking Data</h3>
            <p className="text-gray-500 mt-2 max-w-sm">Completed matches in {mode.replace('_', ' ')} will automatically calculate points and update the leaderboard globally.</p>
         </SurfaceCard>
      ) : (
         <>
            {/* Top 3 Podium Section */}
            {top3.length >= 1 && (
               <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto mb-16 items-end mt-12 sm:mt-0">
                  {podiumOrder.map((player) => {
                  const isGold = player.rank === 1;
                  const isSilver = player.rank === 2;
                  const podiumClass = isGold ? "podium-gold z-10 sm:scale-110" : isSilver ? "podium-silver" : "podium-bronze";
                  const crownColor = isGold ? "text-yellow-400" : isSilver ? "text-gray-300" : "text-amber-600";
                  const avatarGlow = isGold
                     ? "shadow-[0_0_30px_-5px_rgba(234,179,8,0.5)]"
                     : isSilver
                     ? "shadow-[0_0_30px_-5px_rgba(148,163,184,0.5)]"
                     : "shadow-[0_0_30px_-5px_rgba(180,83,9,0.5)]";
                  const bgGradient = isGold
                     ? "from-yellow-500/10 to-transparent"
                     : isSilver
                     ? "from-gray-300/10 to-transparent"
                     : "from-amber-700/10 to-transparent";

                  return (
                     <div
                        key={player.rank}
                        className={`flex flex-col items-center p-6 rounded-2xl border bg-gradient-to-b ${bgGradient} bg-card/50 backdrop-blur-xl ${podiumClass} transition-all duration-500 group relative overflow-hidden`}
                     >
                        {isGold && <div className="absolute inset-0 shimmer-effect pointer-events-none" />}

                        <Crown className={`w-6 h-6 ${crownColor} mb-2`} />
                        
                        <div className={`w-20 h-20 rounded-full bg-secondary border-2 overflow-hidden ${
                        isGold ? "border-primary" : isSilver ? "border-gray-300" : "border-amber-700"
                        } flex items-center justify-center font-black text-2xl text-gray-400 mb-4 ${avatarGlow}`}>
                          {player.image ? (
                             <img src={player.image} alt={player.name} className="w-full h-full object-cover" />
                          ) : (
                             player.name.charAt(0)
                          )}
                        </div>
                        
                        <div className="font-black text-white text-lg mb-1 truncate w-full text-center">{player.name}</div>
                        <div className="text-xs text-gray-400 font-bold mb-2">#{player.rank}</div>
                        <div className="text-primary font-black text-2xl mb-1">{player.points}</div>
                        <div className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">Points</div>
                     </div>
                  );
                  })}
               </div>
            )}

            {/* Leaderboard Table */}
            <SurfaceCard className="overflow-hidden p-0">
               <div className="overflow-x-auto">
               <table className="w-full">
                  <thead>
                     <tr className="bg-white/[0.02] text-left border-b border-white/5">
                     <th className="px-6 py-5 text-xs font-bold text-gray-400 uppercase tracking-wider">Rank</th>
                     <th className="px-6 py-5 text-xs font-bold text-gray-400 uppercase tracking-wider">Competitor</th>
                     <th className="px-6 py-5 text-xs font-bold text-gray-400 uppercase tracking-wider hidden sm:table-cell">Points</th>
                     <th className="px-6 py-5 text-xs font-bold text-gray-400 uppercase tracking-wider hidden md:table-cell">Wins</th>
                     <th className="px-6 py-5 text-xs font-bold text-gray-400 uppercase tracking-wider">Win Rate</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.03]">
                     {leaderboardData.map((player) => (
                     <tr
                        key={player.rank}
                        className="hover:bg-white/[0.03] transition-colors"
                     >
                        <td className="px-6 py-4">
                           <div className="flex items-center gap-3">
                              {player.rank === 1 && <Crown className="w-5 h-5 text-primary fill-primary drop-shadow-[0_0_10px_rgba(250,204,21,0.5)]" />}
                              {player.rank === 2 && <Medal className="w-5 h-5 text-gray-300 fill-gray-300" />}
                              {player.rank === 3 && <Medal className="w-5 h-5 text-amber-600 fill-amber-600" />}
                              {player.rank > 3 && <span className="w-5 h-5 flex items-center justify-center text-sm font-bold text-gray-500">{player.rank}</span>}
                              <span className={`font-black tracking-wide ${player.rank <= 3 ? 'text-white text-lg' : 'text-gray-400 text-base'}`}>#{player.rank}</span>
                           </div>
                        </td>
                        <td className="px-6 py-4">
                           <div className="flex items-center gap-4">
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-sm transition-all overflow-hidden ${
                                 player.rank === 1 ? 'bg-primary/20 text-primary border border-primary/50' :
                                 player.rank === 2 ? 'bg-gray-300/20 text-gray-300 border border-gray-400/50' :
                                 player.rank === 3 ? 'bg-amber-600/20 text-amber-600 border border-amber-600/50' :
                                 'bg-white/5 border border-white/10 text-gray-400'
                              }`}>
                                 {player.image ? (
                                    <img src={player.image} alt={player.name} className="w-full h-full object-cover" />
                                 ) : (
                                    player.name.charAt(0)
                                 )}
                              </div>
                              <div>
                                 <span className="font-bold text-white text-base block">{player.name}</span>
                                 {player.rank <= 3 && (
                                 <div className="flex items-center gap-1 mt-1">
                                    <Star className="w-3 h-3 text-primary fill-primary" />
                                    <span className="text-[10px] text-primary font-bold uppercase tracking-wider">Top Tier</span>
                                 </div>
                                 )}
                              </div>
                           </div>
                        </td>
                        <td className="px-6 py-4 font-black text-primary text-lg hidden sm:table-cell">
                           <div className="flex items-center gap-2">
                           {player.points}
                           <TrendingUp className="w-4 h-4 text-green-500" />
                           </div>
                        </td>
                        <td className="px-6 py-4 text-gray-300 hidden md:table-cell font-medium">{player.wins}</td>
                        <td className="px-6 py-4">
                           <div className="flex items-center gap-3">
                           <span className="text-white font-bold">{player.winRate}</span>
                           <div className="w-20 h-2 bg-white/5 rounded-full overflow-hidden hidden lg:block border border-white/5">
                              <div className="h-full bg-gradient-to-r from-primary to-green-500" style={{ width: player.winRate }} />
                           </div>
                           </div>
                        </td>
                     </tr>
                     ))}
                  </tbody>
               </table>
               </div>
            </SurfaceCard>
         </>
      )}
    </PageShell>
  );
}
