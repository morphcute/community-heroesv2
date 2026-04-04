import { Trophy, Shield, Users, Sword, History, UserPlus, MessageSquare, Send, Check, X, Clock } from "lucide-react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { sendMessage, joinTeam, leaveTeam, approveMember, rejectMember, requestScrim } from "../actions";
import { auth } from "@/auth";

export default async function TeamDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();

  const team = await prisma.team.findUnique({
    where: { id },
    include: {
      members: {
        include: {
          user: true
        }
      },
      captain: true,
      messages: {
        include: {
          user: true
        },
        orderBy: {
          createdAt: 'asc'
        }
      },
      hostedScrims: {
        where: {
          status: { in: ["OPEN", "PENDING", "ACCEPTED"] },
        },
        orderBy: {
          updatedAt: "desc",
        },
        take: 1,
        include: {
          guestTeam: true,
        },
      },
    }
  });

  if (!team) {
    notFound();
  }

  // Check membership status
  const userEmail = session?.user?.email;
  const membership = team.members.find(m => m.user.email === userEmail);
  const isMember = membership?.status === 'APPROVED';
  const isPending = membership?.status === 'PENDING';
  const isCaptain = membership?.role === 'CAPTAIN' && isMember;

  const captainMembership = userEmail
    ? await prisma.teamMember.findFirst({
        where: {
          user: { email: userEmail },
          role: "CAPTAIN",
          status: "APPROVED",
        },
        include: { team: true },
      })
    : null;
  const openHostedScrim = team.hostedScrims[0] ?? null;
  const canRequestScrim = Boolean(
    captainMembership &&
      captainMembership.teamId !== team.id &&
      openHostedScrim &&
      openHostedScrim.status === "OPEN"
  );
  
  const activeMembers = team.members.filter(m => m.status === 'APPROVED');
  const pendingMembers = team.members.filter(m => m.status === 'PENDING');
  
  const isFull = activeMembers.length >= 5;

  const completedScrims = await prisma.scrim.findMany({
    where: {
      status: "COMPLETED",
      OR: [{ hostTeamId: team.id }, { guestTeamId: team.id }],
    },
    include: {
      hostTeam: true,
      guestTeam: true,
      winnerTeam: true,
    },
    orderBy: {
      completedAt: "desc",
    },
    take: 5,
  });

  const wins = completedScrims.filter((scrim) => scrim.winnerTeamId === team.id).length;
  const losses = completedScrims.length - wins;
  const winRate = completedScrims.length > 0 ? `${Math.round((wins / completedScrims.length) * 100)}%` : "No matches yet";
  const matches = completedScrims.map((scrim) => {
    const isHost = scrim.hostTeamId === team.id;
    const opponent = isHost ? scrim.guestTeam?.name ?? "Guest Squad" : scrim.hostTeam.name;
    const myScore = isHost ? scrim.hostScore : scrim.guestScore;
    const oppScore = isHost ? scrim.guestScore : scrim.hostScore;

    return {
      id: scrim.id,
      opponent,
      result: scrim.winnerTeamId === team.id ? "Win" : "Loss",
      score: `${myScore ?? 0} - ${oppScore ?? 0}`,
      date: (scrim.completedAt ?? scrim.updatedAt).toLocaleDateString("en-PH", {
        month: "short",
        day: "numeric",
      }),
    };
  }); 

  return (
    <div className="container mx-auto px-3 py-4 sm:px-4 sm:py-6 lg:py-8">
      {/* Pending Status Banner */}
      {isPending && (
        <div className="bg-yellow-500/10 border border-yellow-500/30 text-yellow-500 p-4 rounded-xl mb-8 flex items-center gap-3">
          <Clock className="w-5 h-5 animate-pulse" />
          <span className="font-bold">Your join request is pending approval from the team captain.</span>
        </div>
      )}

      {/* Team Header */}
      <div className="relative mb-6 overflow-hidden rounded-[1.4rem] border border-white/10 bg-[linear-gradient(180deg,rgba(10,14,31,0.96),rgba(8,11,25,0.86))] p-5 sm:mb-8 sm:rounded-[1.6rem] sm:p-6 lg:p-8">
        <div className="absolute top-0 right-0 h-40 w-40 rounded-full bg-primary/10 blur-[90px] pointer-events-none sm:h-64 sm:w-64 sm:blur-[100px]" />
        
        <div className="relative z-10 flex flex-col items-center gap-5 md:flex-row md:items-start md:gap-6">
          <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border-[3px] border-primary/50 bg-secondary shadow-[0_0_24px_-10px_var(--color-primary)] sm:h-28 sm:w-28 md:h-32 md:w-32">
            {team.logo ? (
               <img src={team.logo} alt={team.name} className="h-full w-full object-cover" />
            ) : (
               <Shield className="h-10 w-10 text-muted-foreground sm:h-12 sm:w-12" />
            )}
          </div>
          
          <div className="flex-1 text-center md:text-left">
            <div className="text-[0.58rem] font-black uppercase tracking-[0.22em] text-primary">Team Profile</div>
            <h1 className="mt-2 flex items-center justify-center gap-2 font-display text-[1.9rem] font-black uppercase leading-[1.05] tracking-[0.05em] text-white md:justify-start md:text-[2.3rem]">
              <span>{team.name}</span>
              <Shield className="h-4 w-4 text-primary sm:h-5 sm:w-5" />
            </h1>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-400 md:mx-0">
              {team.description || "No team description has been added yet."}
            </p>
            
            <div className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-3 md:max-w-xl">
              <div className="rounded-[1rem] border border-white/10 bg-white/6 px-3 py-2.5 text-center md:text-left">
                <div className="text-[0.5rem] font-black uppercase tracking-[0.14em] text-slate-500">Captain Rank</div>
                <div className="mt-1 flex items-center justify-center gap-1.5 text-sm font-bold text-white md:justify-start">
                  <Trophy className="h-3.5 w-3.5 text-yellow-500" />
                  <span>{team.captain.rank || "Unranked"}</span>
                </div>
              </div>
              <div className="rounded-[1rem] border border-white/10 bg-white/6 px-3 py-2.5 text-center md:text-left">
                <div className="text-[0.5rem] font-black uppercase tracking-[0.14em] text-slate-500">Members</div>
                <div className="mt-1 flex items-center justify-center gap-1.5 text-sm font-bold text-white md:justify-start">
                  <Users className="h-3.5 w-3.5 text-blue-400" />
                  <span>{activeMembers.length} Active</span>
                </div>
              </div>
              <div className="col-span-2 rounded-[1rem] border border-white/10 bg-white/6 px-3 py-2.5 text-center sm:col-span-1 md:text-left">
                <div className="text-[0.5rem] font-black uppercase tracking-[0.14em] text-slate-500">Team Record</div>
                <div className="mt-1 flex items-center justify-center gap-1.5 text-sm font-bold text-white md:justify-start">
                  <Sword className="h-3.5 w-3.5 text-rose-400" />
                  <span>{completedScrims.length > 0 ? `${wins}W ${losses}L · ${winRate}` : winRate}</span>
                </div>
              </div>
            </div>

            {openHostedScrim ? (
              <div className="mt-4 rounded-[1rem] border border-primary/15 bg-primary/8 px-3 py-3 text-sm text-slate-300">
                <div className="text-[0.5rem] font-black uppercase tracking-[0.14em] text-primary">Scrim Status</div>
                <div className="mt-1 font-semibold text-white">
                  {openHostedScrim.status === "OPEN"
                    ? `${team.name} is open for scrimmage requests.`
                    : openHostedScrim.status === "PENDING"
                      ? `${team.name} is reviewing a request from ${openHostedScrim.guestTeam?.name ?? "another squad"}.`
                      : `${team.name} accepted a scrim with ${openHostedScrim.guestTeam?.name ?? "another squad"}.`}
                </div>
              </div>
            ) : null}
          </div>

          <div className="grid w-full grid-cols-1 gap-2.5 md:w-[180px]">
            {isMember ? (
              <form action={leaveTeam}>
                 <input type="hidden" name="teamId" value={team.id} />
                 <button className="w-full rounded-xl bg-red-600 px-4 py-2.5 text-sm font-bold text-white transition-colors shadow-lg shadow-red-900/20 hover:bg-red-700 btn-animate">
                   {isCaptain ? "Disband Team" : "Leave Team"}
                 </button>
              </form>
            ) : isPending ? (
              <form action={leaveTeam}>
                 <input type="hidden" name="teamId" value={team.id} />
                 <button className="w-full rounded-xl border border-border bg-secondary px-4 py-2.5 text-sm font-bold text-muted-foreground transition-colors hover:bg-secondary/80 btn-animate">
                   Cancel Request
                 </button>
              </form>
            ) : (
              <form action={joinTeam}>
                 <input type="hidden" name="teamId" value={team.id} />
                 <button 
                   disabled={isFull}
                   className={`w-full rounded-xl px-4 py-2.5 text-sm font-bold transition-colors shadow-lg btn-animate ${
                      isFull 
                        ? "bg-secondary text-muted-foreground cursor-not-allowed" 
                        : "bg-primary text-primary-foreground hover:bg-primary/90 shadow-primary/20"
                   }`}
                 >
                   {isFull ? "Team Full" : "Request to Join"}
                 </button>
              </form>
            )}
            {canRequestScrim ? (
              <form action={requestScrim}>
                <input type="hidden" name="scrimId" value={openHostedScrim?.id} />
                <button className="w-full rounded-xl border border-border bg-secondary px-4 py-2.5 text-sm font-medium text-secondary-foreground transition-colors hover:bg-secondary/80 btn-animate">
                  Request Scrim
                </button>
              </form>
            ) : (
              <Link href="/scrims" className="flex w-full items-center justify-center rounded-xl border border-border bg-secondary px-4 py-2.5 text-sm font-medium text-secondary-foreground transition-colors hover:bg-secondary/80 btn-animate">
                {openHostedScrim ? "View Scrim Status" : "View Scrimmages"}
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Roster Section */}
        <div className="lg:col-span-2 space-y-8">
          {/* Active Roster */}
          <div>
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" /> Active Roster
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {activeMembers.map((member) => (
                <div key={member.id} className="bg-card border border-border p-4 rounded-xl flex items-center gap-4 hover:border-primary/30 transition-colors group">
                  <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center text-lg font-bold text-muted-foreground group-hover:bg-primary group-hover:text-primary-foreground transition-colors overflow-hidden">
                    {member.user.image ? (
                      <img src={member.user.image} alt={member.user.name || "User"} className="w-full h-full object-cover" />
                    ) : (
                      (member.user.name || "U").charAt(0)
                    )}
                  </div>
                  <div>
                    <div className="font-bold group-hover:text-primary transition-colors">{member.user.name || "Unknown User"}</div>
                    <div className="text-xs text-muted-foreground flex items-center gap-1">
                      {member.role === 'CAPTAIN' && <Trophy className="w-3 h-3 text-yellow-500" />}
                      {member.role} • {member.user.rank || "Unranked"}
                    </div>
                  </div>
                </div>
              ))}
              {!isFull && isCaptain && (
                <div className="bg-card border border-dashed border-border p-4 rounded-xl flex flex-col items-center justify-center gap-2 text-muted-foreground hover:text-primary hover:border-primary/50 transition-colors cursor-pointer min-h-[80px]">
                  <UserPlus className="w-6 h-6" />
                  <span className="text-sm font-medium">Recruit Member</span>
                </div>
              )}
            </div>
          </div>

          {/* Pending Requests (Captain Only) */}
          {isCaptain && pendingMembers.length > 0 && (
            <div className="bg-secondary/10 border border-border rounded-xl p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-yellow-500">
                <Clock className="w-5 h-5" /> Pending Requests
              </h2>
              <div className="space-y-3">
                {pendingMembers.map((member) => (
                  <div key={member.id} className="flex items-center justify-between bg-card p-4 rounded-lg border border-border">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center overflow-hidden">
                        {member.user.image ? (
                          <img src={member.user.image} alt={member.user.name || "User"} className="w-full h-full object-cover" />
                        ) : (
                          (member.user.name || "U").charAt(0)
                        )}
                      </div>
                      <div>
                        <div className="font-bold text-sm">{member.user.name}</div>
                        <div className="text-xs text-muted-foreground">{member.user.rank || "Unranked"}</div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <form action={approveMember}>
                        <input type="hidden" name="membershipId" value={member.id} />
                        <input type="hidden" name="teamId" value={team.id} />
                        <button className="p-2 bg-green-500/20 text-green-500 hover:bg-green-500/30 rounded-lg transition-colors" title="Approve">
                          <Check className="w-4 h-4" />
                        </button>
                      </form>
                      <form action={rejectMember}>
                        <input type="hidden" name="membershipId" value={member.id} />
                        <input type="hidden" name="teamId" value={team.id} />
                        <button className="p-2 bg-red-500/20 text-red-500 hover:bg-red-500/30 rounded-lg transition-colors" title="Reject">
                          <X className="w-4 h-4" />
                        </button>
                      </form>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Match History Section */}
        <div>
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <History className="w-5 h-5 text-primary" /> Recent Matches
          </h2>
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            {matches.length > 0 ? (
               matches.map((match: { id: string; opponent: string; result: string; score: string; date: string }) => (
                 <div key={match.id} className="p-4 border-b border-border last:border-0 hover:bg-secondary/30 transition-colors">
                   <div className="flex justify-between items-center mb-2">
                     <span className={`text-xs font-bold px-2 py-0.5 rounded ${match.result === 'Win' ? 'bg-emerald-500/20 text-emerald-500' : 'bg-red-500/20 text-red-500'}`}>
                       {match.result.toUpperCase()}
                     </span>
                     <span className="text-xs text-muted-foreground">{match.date}</span>
                   </div>
                   <div className="flex justify-between items-center">
                     <div className="font-medium">vs {match.opponent}</div>
                     <div className="font-mono font-bold text-lg">{match.score}</div>
                   </div>
                 </div>
               ))
            ) : (
               <div className="p-8 text-center text-muted-foreground text-sm">
                  No matches played yet.
               </div>
            )}
            
            <div className="p-3 text-center border-t border-border">
              <Link href="#" className="text-xs font-medium text-muted-foreground hover:text-primary transition-colors">
                View All Matches
              </Link>
            </div>
          </div>
        </div>
      </div>
      
      {/* Team Chat Section - Only for Active Members */}
      {isMember && (
        <div className="mt-8 bg-card border border-border rounded-xl p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-primary" /> Team Chat
          </h2>
          
          <div className="h-64 overflow-y-auto bg-secondary/20 rounded-lg p-4 mb-4 space-y-4">
            {team.messages.length > 0 ? (
              team.messages.map((msg) => (
                <div key={msg.id} className={`flex gap-3 ${msg.user.email === session?.user?.email ? 'flex-row-reverse' : ''}`}>
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center font-bold text-xs text-primary-foreground flex-shrink-0">
                    {msg.user.image ? <img src={msg.user.image} alt="User" className="w-full h-full rounded-full" /> : (msg.user.name || "U").charAt(0)}
                  </div>
                  <div>
                    <div className={`flex items-baseline gap-2 mb-1 ${msg.user.email === session?.user?.email ? 'flex-row-reverse' : ''}`}>
                      <span className="text-xs font-bold text-muted-foreground">{msg.user.name}</span>
                      <span className="text-[10px] text-muted-foreground/70">{msg.createdAt.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                    </div>
                    <div className={`p-3 rounded-lg text-sm ${
                      msg.user.email === session?.user?.email 
                        ? 'bg-primary/20 text-foreground rounded-tr-none' 
                        : 'bg-secondary text-foreground rounded-tl-none'
                    }`}>
                      {msg.content}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-muted-foreground py-10">No messages yet. Start the conversation!</div>
            )}
          </div>

          <form action={sendMessage} className="flex gap-2">
            <input type="hidden" name="teamId" value={team.id} />
            <input 
              type="text" 
              name="content"
              placeholder="Type a message..." 
              className="flex-1 bg-secondary/50 border border-border rounded-lg px-4 py-2 focus:outline-none focus:border-primary transition-colors"
              required
            />
            <button type="submit" className="p-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
              <Send className="w-5 h-5" />
            </button>
          </form>
        </div>
      )}

    </div>
  );
}
