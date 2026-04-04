import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { EmptyState, PageHero, PageShell, SurfaceCard } from "@/components/ui/PageShell";
import { CalendarDays, ShieldCheck, ShieldX, Swords, Trophy, Users } from "lucide-react";
import {
  acceptScrim,
  cancelScrim,
  postScrim,
  rejectScrim,
  reportScrimResult,
  requestScrim,
  withdrawScrimRequest,
} from "../teams/actions";

type TeamStanding = {
  id: string;
  name: string;
  wins: number;
  losses: number;
  matches: number;
  points: number;
  winRate: number;
};

export default async function ScrimsPage() {
  const session = await auth();
  const user = session?.user?.email
    ? await prisma.user.findUnique({
        where: { email: session.user.email },
        include: {
          teamMembers: {
            where: { status: "APPROVED" },
            include: { team: true },
          },
        },
      })
    : null;

  const currentTeamMembership = user?.teamMembers[0] ?? null;
  const currentTeam = currentTeamMembership?.team ?? null;
  const isCaptain = currentTeamMembership?.role === "CAPTAIN";

  const [openScrims, incomingRequests, outgoingRequests, acceptedScrims, completedScrims, allCompletedScrims] =
    currentTeam
      ? await Promise.all([
          prisma.scrim.findMany({
            where: {
              status: "OPEN",
              hostTeamId: { not: currentTeam.id },
            },
            include: { hostTeam: true },
            orderBy: [{ scheduledAt: "asc" }, { createdAt: "desc" }],
          }),
          prisma.scrim.findMany({
            where: { hostTeamId: currentTeam.id, status: "PENDING" },
            include: { hostTeam: true, guestTeam: true },
            orderBy: { updatedAt: "desc" },
          }),
          prisma.scrim.findMany({
            where: { guestTeamId: currentTeam.id, status: "PENDING" },
            include: { hostTeam: true, guestTeam: true },
            orderBy: { updatedAt: "desc" },
          }),
          prisma.scrim.findMany({
            where: {
              status: "ACCEPTED",
              OR: [{ hostTeamId: currentTeam.id }, { guestTeamId: currentTeam.id }],
            },
            include: { hostTeam: true, guestTeam: true },
            orderBy: [{ acceptedAt: "desc" }, { updatedAt: "desc" }],
          }),
          prisma.scrim.findMany({
            where: {
              status: "COMPLETED",
              OR: [{ hostTeamId: currentTeam.id }, { guestTeamId: currentTeam.id }],
            },
            include: { hostTeam: true, guestTeam: true, winnerTeam: true },
            orderBy: [{ completedAt: "desc" }, { updatedAt: "desc" }],
            take: 8,
          }),
          prisma.scrim.findMany({
            where: { status: "COMPLETED", winnerTeamId: { not: null }, guestTeamId: { not: null } },
            include: { hostTeam: true, guestTeam: true, winnerTeam: true },
          }),
        ])
      : [[], [], [], [], [], []];

  const myOpenScrim = currentTeam
    ? await prisma.scrim.findFirst({
        where: {
          hostTeamId: currentTeam.id,
          status: { in: ["OPEN", "PENDING", "ACCEPTED"] },
        },
        include: { hostTeam: true, guestTeam: true },
      })
    : null;

  const standingsMap = new Map<string, Omit<TeamStanding, "winRate">>();

  for (const scrim of allCompletedScrims) {
    const host = standingsMap.get(scrim.hostTeamId) ?? {
      id: scrim.hostTeamId,
      name: scrim.hostTeam.name,
      wins: 0,
      losses: 0,
      matches: 0,
      points: 0,
    };
    const guest =
      scrim.guestTeamId && scrim.guestTeam
        ? standingsMap.get(scrim.guestTeamId) ?? {
            id: scrim.guestTeamId,
            name: scrim.guestTeam.name,
            wins: 0,
            losses: 0,
            matches: 0,
            points: 0,
          }
        : null;

    host.matches += 1;
    if (guest) {
      guest.matches += 1;
    }

    if (scrim.winnerTeamId === scrim.hostTeamId) {
      host.wins += 1;
      host.points += 3;
      if (guest) guest.losses += 1;
    } else if (guest) {
      guest.wins += 1;
      guest.points += 3;
      host.losses += 1;
    }

    standingsMap.set(host.id, host);
    if (guest) standingsMap.set(guest.id, guest);
  }

  const standings: TeamStanding[] = Array.from(standingsMap.values())
    .map((team) => ({
      ...team,
      winRate: team.matches > 0 ? Math.round((team.wins / team.matches) * 100) : 0,
    }))
    .sort((a, b) => b.points - a.points || b.wins - a.wins || a.losses - b.losses);

  return (
    <PageShell size="wide" tone="blue">
      <PageHero
        eyebrow="Scrimmage Hub"
        icon={<Swords className="h-4 w-4" />}
        title={
          <>
            Post, accept, and
            <span className="text-gradient-electric"> track scrims</span>
          </>
        }
        description="Captains can post open scrimmages, accept challengers, and submit official results after the match."
        stats={[
          { label: "Open Posts", value: openScrims.length },
          { label: "Pending", value: incomingRequests.length + outgoingRequests.length },
          { label: "Ranked Teams", value: standings.length },
        ]}
      />

      {!currentTeam ? (
        <EmptyState
          icon={<Users className="h-8 w-8" />}
          title="Join a team first"
          description="You need an approved team before you can post or request scrimmages."
          action={<Link href="/teams" className="action-button-primary text-[11px]">Browse teams</Link>}
        />
      ) : (
        <div className="space-y-5">
          <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1.35fr)_0.95fr]">
            <div className="space-y-5">
              <SurfaceCard>
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <div className="text-[0.62rem] font-black uppercase tracking-[0.24em] text-primary">Host a Scrimmage</div>
                    <h2 className="mt-2 font-display text-xl font-black uppercase tracking-[0.06em] text-white sm:text-2xl">
                      Post one official scrim slot
                    </h2>
                    <p className="mt-2 text-sm leading-6 text-slate-400">
                      Other squads can request your open scrim, and only your captain can confirm the result.
                    </p>
                  </div>
                </div>

                {myOpenScrim ? (
                  <div className="mt-4 rounded-[1.15rem] border border-white/10 bg-white/5 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <div className="text-[0.58rem] font-black uppercase tracking-[0.18em] text-slate-500">Current Post</div>
                        <div className="mt-1 font-display text-lg font-black uppercase tracking-[0.05em] text-white">
                          {myOpenScrim.status === "OPEN"
                            ? "Awaiting challenger"
                            : myOpenScrim.status === "PENDING"
                              ? `Request from ${myOpenScrim.guestTeam?.name ?? "Squad"}`
                              : `Accepted with ${myOpenScrim.guestTeam?.name ?? "Squad"}`}
                        </div>
                      </div>
                      <div className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-[0.58rem] font-black uppercase tracking-[0.16em] text-primary">
                        {myOpenScrim.status}
                      </div>
                    </div>
                    {myOpenScrim.notes ? (
                      <p className="mt-3 text-sm text-slate-400">{myOpenScrim.notes}</p>
                    ) : null}
                    {myOpenScrim.scheduledAt ? (
                      <div className="mt-3 flex items-center gap-2 text-sm text-slate-300">
                        <CalendarDays className="h-4 w-4 text-cyan-300" />
                        {myOpenScrim.scheduledAt.toLocaleString("en-PH", {
                          month: "short",
                          day: "numeric",
                          hour: "numeric",
                          minute: "2-digit",
                        })}
                      </div>
                    ) : null}
                    {isCaptain ? (
                      <form action={cancelScrim} className="mt-4">
                        <input type="hidden" name="scrimId" value={myOpenScrim.id} />
                        <button className="action-button-secondary text-[10px]">Close Post</button>
                      </form>
                    ) : null}
                  </div>
                ) : isCaptain ? (
                  <form action={postScrim} className="mt-4 grid gap-3 md:grid-cols-[minmax(0,1fr)_220px_auto] md:items-end">
                    <label className="text-[0.58rem] font-black uppercase tracking-[0.16em] text-slate-500">
                      Match details
                      <input
                        name="notes"
                        placeholder="Example: 5v5 custom room, BO3, tonight after 8PM"
                        className="input-hud mt-1 px-4 py-3"
                      />
                    </label>
                    <label className="text-[0.58rem] font-black uppercase tracking-[0.16em] text-slate-500">
                      Preferred time
                      <input name="scheduledAt" type="datetime-local" className="input-hud mt-1 px-4 py-3" />
                    </label>
                    <button className="action-button-primary text-[10px]">Post Scrim</button>
                  </form>
                ) : (
                  <div className="mt-4 rounded-2xl border border-dashed border-white/10 px-4 py-8 text-sm text-slate-400">
                    Only your captain can post a scrimmage listing.
                  </div>
                )}
              </SurfaceCard>

              <SurfaceCard>
                <div>
                  <div className="text-[0.62rem] font-black uppercase tracking-[0.24em] text-cyan-300">Open Scrim Posts</div>
                  <h2 className="mt-2 font-display text-xl font-black uppercase tracking-[0.06em] text-white sm:text-2xl">
                    Find squads looking for a match
                  </h2>
                </div>

                <div className="mt-4 space-y-3">
                  {openScrims.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-white/10 px-4 py-8 text-sm text-slate-400">
                      No open scrim posts are available right now.
                    </div>
                  ) : (
                    openScrims.map((scrim) => (
                      <div key={scrim.id} className="rounded-[1.15rem] border border-white/10 bg-white/5 p-4">
                        <div className="flex items-center justify-between gap-3">
                          <div className="min-w-0">
                            <div className="text-[0.58rem] font-black uppercase tracking-[0.18em] text-slate-500">Hosting Team</div>
                            <div className="mt-1 truncate font-display text-lg font-black uppercase tracking-[0.05em] text-white">
                              {scrim.hostTeam.name}
                            </div>
                          </div>
                          <div className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-[0.58rem] font-black uppercase tracking-[0.16em] text-cyan-200">
                            Open
                          </div>
                        </div>
                        {scrim.notes ? (
                          <p className="mt-3 text-sm leading-6 text-slate-400">{scrim.notes}</p>
                        ) : null}
                        {scrim.scheduledAt ? (
                          <div className="mt-3 flex items-center gap-2 text-sm text-slate-300">
                            <CalendarDays className="h-4 w-4 text-cyan-300" />
                            {scrim.scheduledAt.toLocaleString("en-PH", {
                              month: "short",
                              day: "numeric",
                              hour: "numeric",
                              minute: "2-digit",
                            })}
                          </div>
                        ) : null}
                        <div className="mt-4 flex flex-wrap gap-2">
                          <Link href={`/teams/${scrim.hostTeamId}`} className="action-button-secondary text-[10px]">
                            View Squad
                          </Link>
                          {isCaptain ? (
                            <form action={requestScrim}>
                              <input type="hidden" name="scrimId" value={scrim.id} />
                              <button className="action-button-primary text-[10px]">Request Scrim</button>
                            </form>
                          ) : (
                            <div className="text-sm text-slate-400">Only your captain can request this scrim.</div>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </SurfaceCard>

              <SurfaceCard>
                <div className="text-[0.62rem] font-black uppercase tracking-[0.24em] text-primary">Accepted Scrims</div>
                <div className="mt-4 space-y-3">
                  {acceptedScrims.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-white/10 px-4 py-8 text-sm text-slate-400">
                      No accepted scrims yet.
                    </div>
                  ) : (
                    acceptedScrims.map((scrim) => {
                      const isHost = scrim.hostTeamId === currentTeam.id;
                      const opponentName = isHost ? scrim.guestTeam?.name : scrim.hostTeam.name;

                      return (
                        <div key={scrim.id} className="rounded-[1.15rem] border border-white/10 bg-white/5 p-4">
                          <div className="flex flex-wrap items-center justify-between gap-3">
                            <div>
                              <div className="text-[0.58rem] font-black uppercase tracking-[0.18em] text-slate-500">
                                {isHost ? "You accepted" : "Accepted by host"}
                              </div>
                              <div className="mt-1 font-display text-lg font-black uppercase tracking-[0.05em] text-white">
                                {currentTeam.name} vs {opponentName}
                              </div>
                            </div>
                            <div className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-[0.58rem] font-black uppercase tracking-[0.16em] text-primary">
                              Accepted
                            </div>
                          </div>
                          {isCaptain && isHost ? (
                            <form action={reportScrimResult} className="mt-4 grid gap-2 md:grid-cols-[1fr_auto_1fr_auto] md:items-end">
                              <input type="hidden" name="scrimId" value={scrim.id} />
                              <label className="text-[0.56rem] font-black uppercase tracking-[0.14em] text-slate-500">
                                {scrim.hostTeam.name}
                                <input name="hostScore" type="number" min="0" required className="input-hud mt-1 px-3 py-2.5" />
                              </label>
                              <div className="pb-3 text-xs font-black uppercase tracking-[0.16em] text-slate-500">vs</div>
                              <label className="text-[0.56rem] font-black uppercase tracking-[0.14em] text-slate-500">
                                {scrim.guestTeam?.name ?? "Guest"}
                                <input name="guestScore" type="number" min="0" required className="input-hud mt-1 px-3 py-2.5" />
                              </label>
                              <button className="action-button-primary text-[10px]">Submit Result</button>
                            </form>
                          ) : (
                            <div className="mt-4 text-sm text-slate-400">
                              {isHost
                                ? "Only your captain can submit the official result."
                                : `${scrim.hostTeam.name} will submit the official result after the match.`}
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </SurfaceCard>
            </div>

            <div className="space-y-5">
              <SurfaceCard>
                <div className="text-[0.62rem] font-black uppercase tracking-[0.24em] text-primary">Incoming Requests</div>
                <div className="mt-4 space-y-3">
                  {incomingRequests.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-white/10 px-4 py-8 text-sm text-slate-400">
                      No squads have requested your post yet.
                    </div>
                  ) : (
                    incomingRequests.map((scrim) => (
                      <div key={scrim.id} className="rounded-[1.15rem] border border-white/10 bg-white/5 p-4">
                        <div className="text-[0.58rem] font-black uppercase tracking-[0.18em] text-slate-500">Requested By</div>
                        <div className="mt-1 font-display text-lg font-black uppercase tracking-[0.05em] text-white">
                          {scrim.guestTeam?.name ?? "Unknown Squad"}
                        </div>
                        {isCaptain ? (
                          <div className="mt-4 flex flex-wrap gap-2">
                            <form action={acceptScrim}>
                              <input type="hidden" name="scrimId" value={scrim.id} />
                              <button className="action-button-primary text-[10px]">
                                <ShieldCheck className="h-4 w-4" />
                                Accept
                              </button>
                            </form>
                            <form action={rejectScrim}>
                              <input type="hidden" name="scrimId" value={scrim.id} />
                              <button className="action-button-secondary text-[10px]">
                                <ShieldX className="h-4 w-4" />
                                Keep Open
                              </button>
                            </form>
                          </div>
                        ) : (
                          <div className="mt-4 text-sm text-slate-400">Only your captain can accept this request.</div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </SurfaceCard>

              <SurfaceCard>
                <div className="text-[0.62rem] font-black uppercase tracking-[0.24em] text-cyan-300">Your Pending Requests</div>
                <div className="mt-4 space-y-3">
                  {outgoingRequests.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-white/10 px-4 py-8 text-sm text-slate-400">
                      Your team has no pending scrim requests.
                    </div>
                  ) : (
                    outgoingRequests.map((scrim) => (
                      <div key={scrim.id} className="rounded-[1.15rem] border border-white/10 bg-white/5 p-4">
                        <div className="text-[0.58rem] font-black uppercase tracking-[0.18em] text-slate-500">Waiting On</div>
                        <div className="mt-1 font-display text-lg font-black uppercase tracking-[0.05em] text-white">
                          {scrim.hostTeam.name}
                        </div>
                        {isCaptain ? (
                          <form action={withdrawScrimRequest} className="mt-4">
                            <input type="hidden" name="scrimId" value={scrim.id} />
                            <button className="action-button-secondary text-[10px]">Withdraw Request</button>
                          </form>
                        ) : null}
                      </div>
                    ))
                  )}
                </div>
              </SurfaceCard>

              <SurfaceCard tone="blue">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 text-primary">
                    <Trophy className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-[0.62rem] font-black uppercase tracking-[0.24em] text-cyan-300">Scrim Leaderboard</div>
                    <div className="mt-1 font-display text-xl font-black uppercase tracking-[0.06em] text-white sm:text-2xl">
                      Team rankings
                    </div>
                  </div>
                </div>

                <div className="mt-4 space-y-3">
                  {standings.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-white/10 px-4 py-8 text-sm text-slate-400">
                      Rankings will appear after teams complete scrimmages.
                    </div>
                  ) : (
                    standings.slice(0, 8).map((team, index) => (
                      <div key={team.id} className="flex items-center justify-between rounded-[1rem] border border-white/10 bg-white/5 px-4 py-3">
                        <div className="min-w-0">
                          <div className="text-[0.56rem] font-black uppercase tracking-[0.14em] text-slate-500">#{index + 1}</div>
                          <div className="truncate font-display text-lg font-black uppercase tracking-[0.05em] text-white">{team.name}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-black text-primary">{team.points} pts</div>
                          <div className="text-[11px] text-slate-400">
                            {team.wins}W {team.losses}L · {team.winRate}%
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </SurfaceCard>
            </div>
          </div>

          <SurfaceCard>
            <div className="text-[0.62rem] font-black uppercase tracking-[0.24em] text-primary">Completed Scrims</div>
            <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {completedScrims.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-white/10 px-4 py-8 text-sm text-slate-400 md:col-span-2 xl:col-span-3">
                  Completed scrimmages will appear here.
                </div>
              ) : (
                completedScrims.map((scrim) => (
                  <div key={scrim.id} className="rounded-[1.15rem] border border-white/10 bg-white/5 p-4">
                    <div className="text-[0.56rem] font-black uppercase tracking-[0.14em] text-slate-500">Final Score</div>
                    <div className="mt-2 font-display text-lg font-black uppercase tracking-[0.05em] text-white">
                      {scrim.hostTeam.name} vs {scrim.guestTeam?.name ?? "Guest Squad"}
                    </div>
                    <div className="mt-3 text-sm text-slate-300">
                      {scrim.hostScore} - {scrim.guestScore}
                    </div>
                    <div className="mt-2 text-[11px] uppercase tracking-[0.14em] text-primary">
                      Winner: {scrim.winnerTeam?.name}
                    </div>
                  </div>
                ))
              )}
            </div>
          </SurfaceCard>
        </div>
      )}
    </PageShell>
  );
}
