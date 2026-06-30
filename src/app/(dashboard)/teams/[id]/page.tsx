import { Trophy, Shield, Users, Swords, History, UserPlus, UserX, MessageSquare, Send, Check, X, Clock } from "lucide-react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { sendMessage, joinTeam, leaveTeam, approveMember, rejectMember, requestScrim, kickMember } from "../actions";
import { auth } from "@/auth";
import { PageHero, PageShell, SurfaceCard, EmptyState } from "@/components/ui/PageShell";

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
        include: { user: true },
      },
      captain: true,
      messages: {
        include: { user: true },
        orderBy: { createdAt: "asc" },
      },
      hostedScrims: {
        where: { status: { in: ["OPEN", "PENDING", "ACCEPTED"] } },
        orderBy: { updatedAt: "desc" },
        take: 1,
        include: { guestTeam: true },
      },
    },
  });

  if (!team) notFound();

  const userEmail = session?.user?.email;
  const membership = team.members.find((m) => m.user.email === userEmail);
  const isMember = membership?.status === "APPROVED";
  const isPending = membership?.status === "PENDING";
  const isCaptain = membership?.role === "CAPTAIN" && isMember;

  const captainMembership = userEmail
    ? await prisma.teamMember.findFirst({
        where: { user: { email: userEmail }, role: "CAPTAIN", status: "APPROVED" },
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

  const activeMembers = team.members.filter((m) => m.status === "APPROVED");
  const pendingMembers = team.members.filter((m) => m.status === "PENDING");
  const isFull = activeMembers.length >= 5;

  const completedScrims = await prisma.scrim.findMany({
    where: { status: "COMPLETED", OR: [{ hostTeamId: team.id }, { guestTeamId: team.id }] },
    include: { hostTeam: true, guestTeam: true, winnerTeam: true },
    orderBy: { completedAt: "desc" },
    take: 5,
  });

  const wins = completedScrims.filter((s) => s.winnerTeamId === team.id).length;
  const losses = completedScrims.length - wins;
  const winRate =
    completedScrims.length > 0
      ? `${Math.round((wins / completedScrims.length) * 100)}%`
      : "0%";

  const matches = completedScrims.map((scrim) => {
    const isHost = scrim.hostTeamId === team.id;
    return {
      id: scrim.id,
      opponent: isHost ? scrim.guestTeam?.name ?? "Guest Squad" : scrim.hostTeam.name,
      result: scrim.winnerTeamId === team.id ? "Win" : "Loss",
      score: `${isHost ? scrim.hostScore : scrim.guestScore ?? 0} – ${isHost ? scrim.guestScore : scrim.hostScore ?? 0}`,
      date: (scrim.completedAt ?? scrim.updatedAt).toLocaleDateString("en-PH", {
        month: "short",
        day: "numeric",
      }),
    };
  });

  const heroStats = [
    { label: "Members", value: `${activeMembers.length} / 5` },
    { label: "Record", value: completedScrims.length > 0 ? `${wins}W ${losses}L` : "No matches" },
    { label: "Win Rate", value: winRate },
  ];

  return (
    <PageShell size="wide" tone="gold">
      {/* Pending banner */}
      {isPending && (
        <div className="flex items-center gap-3 rounded-2xl border border-primary/30 bg-primary/8 px-5 py-3 text-sm font-bold text-primary">
          <Clock className="h-4 w-4 animate-pulse flex-shrink-0" />
          Your join request is pending approval from the team captain.
        </div>
      )}

      <PageHero
        eyebrow="Team Profile"
        icon={<Shield className="h-4 w-4" />}
        title={
          <>
            {team.name}
            <span className="text-gradient-primary"> squad</span>
          </>
        }
        description={team.description || "No team description has been added yet. Captains can update this in team settings."}
        stats={heroStats}
        actions={
          <div className="flex flex-wrap gap-2">
            {isMember ? (
              <form action={leaveTeam}>
                <input type="hidden" name="teamId" value={team.id} />
                <button className="action-button-danger text-[11px]">
                  {isCaptain ? "Disband Team" : "Leave Team"}
                </button>
              </form>
            ) : isPending ? (
              <form action={leaveTeam}>
                <input type="hidden" name="teamId" value={team.id} />
                <button className="action-button-secondary text-[11px]">Cancel Request</button>
              </form>
            ) : (
              <form action={joinTeam}>
                <input type="hidden" name="teamId" value={team.id} />
                <button disabled={isFull} className={`text-[11px] ${isFull ? "action-button-secondary opacity-50 cursor-not-allowed" : "action-button-primary"}`}>
                  {isFull ? "Team Full" : "Request to Join"}
                </button>
              </form>
            )}
            {canRequestScrim ? (
              <form action={requestScrim}>
                <input type="hidden" name="scrimId" value={openHostedScrim?.id} />
                <button className="action-button-secondary text-[11px]">Request Scrim</button>
              </form>
            ) : (
              <Link href="/scrims" className="action-button-secondary text-[11px]">
                {openHostedScrim ? "View Scrim Status" : "Scrimmages"}
              </Link>
            )}
          </div>
        }
        aside={
          <SurfaceCard tone="gold" className="h-full min-w-[240px] p-6">
            <div className="relative z-10 flex h-full flex-col items-center justify-between text-center">
              <div className="flex flex-col items-center gap-4">
                {/* Team Logo */}
                <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-2xl border-2 border-primary/30 bg-card shadow-[0_0_24px_-10px_rgba(250,204,21,0.4)]">
                  {team.logo ? (
                    <img src={team.logo} alt={team.name} className="h-full w-full object-cover" />
                  ) : (
                    <Shield className="h-10 w-10 text-primary/60" />
                  )}
                </div>
                <div>
                  <div className="font-display text-xl sm:text-2xl font-black uppercase tracking-[0.08em] text-foreground break-words max-w-[280px]">{team.name}</div>
                  <div className="mt-1 text-xs text-muted-foreground">Est. {new Date(team.createdAt).toLocaleDateString("en-US", { month: "short", year: "numeric" })}</div>
                </div>
              </div>

              {/* Scrim Status */}
              {openHostedScrim && (
                <div className="mt-5 w-full rounded-xl border border-primary/15 bg-primary/8 px-4 py-3 text-left">
                  <div className="text-[0.55rem] font-black uppercase tracking-[0.2em] text-primary">Scrim Status</div>
                  <div className="mt-1 text-xs font-semibold text-foreground leading-snug">
                    {openHostedScrim.status === "OPEN"
                      ? `${team.name} is open for scrimmage requests.`
                      : openHostedScrim.status === "PENDING"
                        ? `Reviewing request from ${openHostedScrim.guestTeam?.name ?? "another squad"}.`
                        : `Scrim accepted with ${openHostedScrim.guestTeam?.name ?? "another squad"}.`}
                  </div>
                </div>
              )}

              {/* Captain info */}
              <div className="mt-4 w-full border-t border-border pt-4">
                <div className="flex items-center justify-between">
                  <div className="text-[0.55rem] font-black uppercase tracking-[0.2em] text-muted-foreground">Captain</div>
                  <div className="flex items-center gap-1.5">
                    <Trophy className="h-3 w-3 text-primary" />
                    <span className="text-xs font-bold text-foreground">{team.captain.rank || "Unranked"}</span>
                  </div>
                </div>
                <div className="mt-1 text-sm font-semibold text-foreground/90">{team.captain.name || "Unknown"}</div>
              </div>
            </div>
          </SurfaceCard>
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1.6fr)_1fr]">
        {/* Left column: Roster + Pending */}
        <div className="space-y-6">
          {/* Active Roster */}
          <SurfaceCard>
            <div className="mb-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Users className="h-5 w-5 text-primary" />
                <h2 className="font-display text-xl font-black uppercase tracking-[0.06em] text-foreground">Active Roster</h2>
              </div>
              <span className="rounded-full border border-border bg-muted/40 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-muted-foreground">
                {activeMembers.length} / 5
              </span>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {activeMembers.map((member) => (
                <div
                  key={member.id}
                  className="group flex items-center justify-between rounded-2xl border border-border bg-muted/40 px-4 py-3 transition-all hover:border-primary/20 hover:bg-muted"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl border border-border bg-background text-sm font-black text-primary transition-all group-hover:border-primary/30">
                      {member.user.image ? (
                        <img src={member.user.image} alt={member.user.name || "User"} className="h-full w-full object-cover" />
                      ) : (
                        (member.user.name || "U").charAt(0)
                      )}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-foreground">{member.user.name || "Unknown User"}</div>
                      <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                        {member.role === "CAPTAIN" && <Trophy className="h-2.5 w-2.5 text-yellow-400" />}
                        <span className="uppercase tracking-wider">{member.role}</span>
                        <span>·</span>
                        <span>{member.user.rank || "Unranked"}</span>
                      </div>
                    </div>
                  </div>
                  {isCaptain && member.role !== "CAPTAIN" && (
                    <form action={kickMember}>
                      <input type="hidden" name="teamId" value={team.id} />
                      <input type="hidden" name="membershipId" value={member.id} />
                      <button
                        type="submit"
                        className="rounded-lg p-2 text-slate-600 opacity-0 transition-all hover:bg-red-500/10 hover:text-red-400 group-hover:opacity-100 focus:opacity-100"
                        title="Remove Member"
                      >
                        <UserX className="h-4 w-4" />
                      </button>
                    </form>
                  )}
                </div>
              ))}
              {!isFull && isCaptain && (
                <Link
                  href={`/teams/${team.id}/recruit`}
                  className="flex min-h-[60px] flex-col items-center justify-center gap-1.5 rounded-2xl border border-dashed border-border bg-muted/40 text-muted-foreground transition-all hover:border-primary/30 hover:text-primary"
                >
                  <UserPlus className="h-5 w-5" />
                  <span className="text-xs font-bold uppercase tracking-wider">Recruit Member</span>
                </Link>
              )}
            </div>
          </SurfaceCard>

          {/* Pending Requests - Captain Only */}
          {isCaptain && pendingMembers.length > 0 && (
            <SurfaceCard tone="gold">
              <div className="mb-5 flex items-center gap-3">
                <Clock className="h-5 w-5 text-primary" />
                <h2 className="font-display text-xl font-black uppercase tracking-[0.06em] text-foreground">
                  Pending Requests
                </h2>
                <span className="ml-auto rounded-full bg-primary/10 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-primary border border-primary/20">
                  {pendingMembers.length}
                </span>
              </div>
              <div className="space-y-3">
                {pendingMembers.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between rounded-2xl border border-border bg-muted/40 px-4 py-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-xl border border-border bg-background text-sm font-bold text-foreground">
                        {member.user.image ? (
                          <img src={member.user.image} alt={member.user.name || "User"} className="h-full w-full object-cover" />
                        ) : (
                          (member.user.name || "U").charAt(0)
                        )}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-foreground">{member.user.name}</div>
                        <div className="text-[10px] text-muted-foreground">{member.user.rank || "Unranked"}</div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <form action={approveMember}>
                        <input type="hidden" name="membershipId" value={member.id} />
                        <input type="hidden" name="teamId" value={team.id} />
                        <button className="rounded-lg p-2 bg-primary/10 text-primary hover:bg-primary/20 transition-colors" title="Approve">
                          <Check className="h-4 w-4" />
                        </button>
                      </form>
                      <form action={rejectMember}>
                        <input type="hidden" name="membershipId" value={member.id} />
                        <input type="hidden" name="teamId" value={team.id} />
                        <button className="rounded-lg p-2 bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors" title="Reject">
                          <X className="h-4 w-4" />
                        </button>
                      </form>
                    </div>
                  </div>
                ))}
              </div>
            </SurfaceCard>
          )}
        </div>

        {/* Right column: Match History + Team Chat */}
        <div className="space-y-6">
          {/* Match History */}
          <SurfaceCard>
            <div className="mb-5 flex items-center gap-3">
              <History className="h-5 w-5 text-primary" />
              <h2 className="font-display text-xl font-black uppercase tracking-[0.06em] text-foreground">Recent Matches</h2>
            </div>
            {matches.length > 0 ? (
              <div className="divide-y divide-border">
                {matches.map((match) => (
                  <div key={match.id} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                    <div>
                      <div className="text-sm font-bold text-foreground">vs {match.opponent}</div>
                      <div className="mt-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">{match.date}</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-sm font-bold text-muted-foreground">{match.score}</span>
                      <span
                        className={`rounded-lg px-2.5 py-1 text-[10px] font-black uppercase tracking-wider ${
                          match.result === "Win"
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            : "bg-red-500/10 text-red-400 border border-red-500/20"
                        }`}
                      >
                        {match.result}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-[1.4rem] border border-dashed border-border bg-muted/40 px-6 py-10 text-center">
                <Swords className="mx-auto mb-3 h-8 w-8 text-muted-foreground/60" />
                <div className="text-sm text-muted-foreground">No matches played yet. Challenge a team to a scrim!</div>
              </div>
            )}
          </SurfaceCard>

          {/* Team Chat - Members Only */}
          {isMember ? (
            <SurfaceCard tone="gold">
              <div className="mb-4 flex items-center gap-3">
                <MessageSquare className="h-5 w-5 text-primary" />
                <h2 className="font-display text-xl font-black uppercase tracking-[0.06em] text-foreground">Team Chat</h2>
              </div>
              <div className="h-56 overflow-y-auto space-y-3 pr-1 custom-scrollbar mb-4">
                {team.messages.length > 0 ? (
                  team.messages.map((msg) => {
                    const isMe = msg.user.email === session?.user?.email;
                    return (
                      <div key={msg.id} className={`flex gap-2.5 ${isMe ? "flex-row-reverse" : ""}`}>
                        <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border bg-background text-xs font-black text-primary">
                          {msg.user.image ? (
                            <img src={msg.user.image} alt="User" className="h-full w-full object-cover rounded-lg" />
                          ) : (
                            (msg.user.name || "U").charAt(0)
                          )}
                        </div>
                        <div className={`flex flex-col max-w-[80%] ${isMe ? "items-end" : "items-start"}`}>
                          <span className="mb-1 text-[9px] font-black uppercase tracking-wider text-muted-foreground">
                            {msg.user.name} · {msg.createdAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </span>
                          <div
                            className={`rounded-xl px-3 py-2 text-sm leading-relaxed ${
                              isMe
                                ? "bg-primary text-black rounded-tr-none"
                                : "bg-background text-foreground/90 border border-border rounded-tl-none"
                            }`}
                          >
                            {msg.content}
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
                    No messages yet — say hello to your squad!
                  </div>
                )}
              </div>
              <form action={sendMessage} className="flex gap-2">
                <input type="hidden" name="teamId" value={team.id} />
                <input
                  type="text"
                  name="content"
                  placeholder="Message your team..."
                  className="flex-1 rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder-muted-foreground/60 outline-none focus:border-primary/50 transition-colors"
                  required
                />
                <button
                  type="submit"
                  className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-black hover:bg-yellow-400 transition-colors"
                >
                  <Send className="h-4 w-4" />
                </button>
              </form>
            </SurfaceCard>
          ) : (
            <EmptyState
              icon={<MessageSquare className="h-7 w-7" />}
              title="Members Only"
              description="Join this team to access the private team chat channel."
            />
          )}
        </div>
      </div>
    </PageShell>
  );
}
