"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { generateBracket } from "@/lib/bracket-generator";
import { getRequiredRosterSize } from "@/lib/tournament-config";

export async function joinTournament(prevState: any, formData: FormData) {
  const session = await auth();
  if (!session?.user?.email) return { ok: false, message: "Unauthorized login required." };

  const tournamentId = formData.get('tournamentId') as string;
  if (!tournamentId) return { ok: false, message: "Tournament ID required." };

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { teamMembers: true }
  });
  if (!user) return { ok: false, message: "User not found." };

  const tournament = await prisma.tournament.findUnique({
    where: { id: tournamentId },
    include: { participants: true }
  });
  if (!tournament) return { ok: false, message: "Tournament not found." };
  
  // 🛡️ Region-Lock Gatekeeper
  if ((tournament as any).locationRestriction) {
     if (!user.address || !user.address.toLowerCase().includes((tournament as any).locationRestriction.toLowerCase())) {
        return { 
           ok: false, 
           message: `Area Locked: This tournament is strictly exclusive to players situated in "${(tournament as any).locationRestriction}". Update your address via Profile if you reside here.` 
        };
     }
  }
  
  if (tournament.status !== "REGISTRATION_OPEN" && tournament.status !== "UPCOMING") {
    return { ok: false, message: "Registration is strictly closed." };
  }

  let finalParticipantData: any = {
    tournamentId,
    status: "APPROVED"
  };

  if (getRequiredRosterSize(tournament.gameMode) === 1) {
    // Solo validation
    const alreadyJoined = tournament.participants.some(p => p.userId === user.id);
    if (alreadyJoined) return { ok: false, message: "You are already registered." };
    finalParticipantData.userId = user.id;
  } else {
    // Squad Validation
    const requiredMembers = getRequiredRosterSize(tournament.gameMode);
    
    const captainedTeam = await prisma.team.findFirst({
      where: { captainId: user.id },
      include: { members: { where: { status: "APPROVED" } } }
    });

    if (!captainedTeam) {
      return { ok: false, message: `Only Team Captains can register for Team Tournaments.` };
    }

    if (captainedTeam.members.length < requiredMembers) {
      return { ok: false, message: `Your squad requires at least ${requiredMembers} approved members to compete in this format.` };
    }

    const alreadyJoined = tournament.participants.some(p => p.teamId === captainedTeam.id);
    if (alreadyJoined) return { ok: false, message: "Your team is already registered for this tournament." };

    finalParticipantData.teamId = captainedTeam.id;
  }

  if (tournament.participants.length >= tournament.maxTeams) {
    return { ok: false, message: "Tournament is fully capped." };
  }

  // Execute Dynamic Join
  await prisma.tournamentParticipant.create({
    data: finalParticipantData
  });

  await prisma.notification.create({
    data: {
      userId: user.id,
      title: "Tournament Joined",
      content: `You successfully registered for ${tournament.title}.`,
      link: `/tournaments/${tournament.id}`
    }
  });

  const newParticipantCount = tournament.participants.length + 1;
  
  // Close and Auto-Generate Bracket if Full
  if (newParticipantCount >= tournament.maxTeams) {
    await prisma.tournament.update({
      where: { id: tournamentId },
      data: { status: "ONGOING" }
    });
    
    // MATHEMATICAL BRACKET GENERATION
    await generateBracket(tournamentId);

    // Blast notification to all registered participants
    const allParticipants = await prisma.tournamentParticipant.findMany({ where: { tournamentId } });
    const participantsWithUsers = allParticipants.filter(
      (participant): participant is typeof participant & { userId: string } => Boolean(participant.userId)
    );
    if (participantsWithUsers.length > 0) {
      await prisma.notification.createMany({
        data: participantsWithUsers.map(p => ({
          userId: p.userId,
          title: "Tournament Started!",
          content: `${tournament.title} has reached capacity and begun. Check the bracket!`,
          link: `/tournaments/${tournament.id}?tab=bracket`
        }))
      });
    }
  }

  revalidatePath(`/tournaments/${tournamentId}`);
  revalidatePath(`/admin`);
  
  return { ok: true, message: "Successfully registered! Welcome to the arena." };
}

export async function updateMatchScore(formData: FormData) {
  const session = await auth();
  const userRole = (session?.user as any)?.role;
  const matchId = formData.get("matchId") as string;
  const score1 = parseInt(formData.get("score1") as string) || 0;
  const score2 = parseInt(formData.get("score2") as string) || 0;
  const winnerId = formData.get("winnerId") as string | null;
  const tournamentId  = formData.get("tournamentId") as string;
  
  if (!matchId || !tournamentId) return;

  // @ts-ignore
  const match = await prisma.match.findUnique({ where: { id: matchId }});
  if (!match) return;

  const status = winnerId ? "COMPLETED" : "ONGOING";

  // @ts-ignore
  await prisma.match.update({
    where: { id: matchId },
    data: { score1, score2, winnerId, status }
  });

  // Mathematically Bubble Winner Up The Tree or Complete Tournament
  if (status === "COMPLETED" && winnerId) {
    if (match.nextMatchId) {
      // @ts-ignore
      const nextMatch = await prisma.match.findUnique({ where: { id: match.nextMatchId }});
      if (nextMatch) {
        // Is standard top or bottom feeder?
        const isTopFeeder = match.matchIndex % 2 === 0;
        
        const nextData: any = {};
        if (isTopFeeder) {
          nextData.participant1Id = winnerId;
        } else {
          nextData.participant2Id = winnerId;
        }
        
        // If both participant slots in the next match are now filled, make it ONGOING instantly
        if (
          (isTopFeeder && nextMatch.participant2Id) || 
          (!isTopFeeder && nextMatch.participant1Id)
        ) {
          nextData.status = "ONGOING";
        }
        
        // @ts-ignore
        await prisma.match.update({
          where: { id: match.nextMatchId },
          data: nextData
        });
      }
    } else {
      // 🏆 Final match completed! Complete tournament & award prizes
      const tournament = await prisma.tournament.findUnique({
        where: { id: tournamentId },
        include: { participants: true }
      });
      if (tournament) {
        await prisma.tournament.update({
          where: { id: tournamentId },
          data: { status: "COMPLETED" }
        });

        // Determine Champion and Runner-up
        const championPart = tournament.participants.find(p => p.id === winnerId);
        const runnerUpId = match.participant1Id === winnerId ? match.participant2Id : match.participant1Id;
        const runnerUpPart = tournament.participants.find(p => p.id === runnerUpId);

        // Parse prize distribution
        let distribution: { rank: number; amount: number }[] = [];
        let currency: "DIAMONDS" | "CASH" = "DIAMONDS";
        if (tournament.prizePool) {
          try {
            const parsed = JSON.parse(tournament.prizePool);
            if (parsed.distribution) distribution = parsed.distribution;
            if (parsed.currency) {
              currency = parsed.currency.toLowerCase() === "diamonds" ? "DIAMONDS" : "CASH";
            }
          } catch {}
        }

        const championPrize = distribution.find(d => d.rank === 1)?.amount || 0;
        const runnerUpPrize = distribution.find(d => d.rank === 2)?.amount || 0;

        // Helper function to create awards and notifications
        const grantAward = async (participant: any, rankName: string, totalAmount: number) => {
          if (!participant || totalAmount <= 0) return;
          if (participant.userId) {
            // Solo Award
            await prisma.award.create({
              data: {
                userId: participant.userId,
                tournamentId: tournament.id,
                amount: totalAmount,
                currency
              }
            });
            await prisma.notification.create({
              data: {
                userId: participant.userId,
                title: `Tournament ${rankName}!`,
                content: `Congratulations! You won ${totalAmount.toLocaleString()} ${currency === "DIAMONDS" ? "Diamonds 💎" : "Cash"} in ${tournament.title}.`,
                link: `/profile`
              }
            });
          } else if (participant.teamId) {
            // Team Award - get approved members
            const team = await prisma.team.findUnique({
              where: { id: participant.teamId },
              include: { members: { where: { status: "APPROVED" } } }
            });
            if (team) {
              const membersCount = team.members.length || 1;
              const splitAmount = Math.floor(totalAmount / membersCount);
              
              if (team.members.length > 0) {
                await Promise.all(
                  team.members.map(member => 
                    prisma.award.create({
                      data: {
                        userId: member.userId,
                        tournamentId: tournament.id,
                        amount: splitAmount,
                        currency
                      }
                    }).then(() => 
                      prisma.notification.create({
                        data: {
                          userId: member.userId,
                          title: `Tournament ${rankName}!`,
                          content: `Congratulations! Your team won, and you received ${splitAmount.toLocaleString()} ${currency === "DIAMONDS" ? "Diamonds 💎" : "Cash"} in ${tournament.title}.`,
                          link: `/profile`
                        }
                      })
                    )
                  )
                );
              } else {
                await prisma.award.create({
                  data: {
                    userId: team.captainId,
                    tournamentId: tournament.id,
                    amount: totalAmount,
                    currency
                  }
                });
                await prisma.notification.create({
                  data: {
                    userId: team.captainId,
                    title: `Tournament ${rankName}!`,
                    content: `Congratulations! Your team won, and you received ${totalAmount.toLocaleString()} ${currency === "DIAMONDS" ? "Diamonds 💎" : "Cash"} in ${tournament.title}.`,
                    link: `/profile`
                  }
                });
              }
            }
          }
        };

        // Award Champion and Runner-up
        await grantAward(championPart, "Champion", championPrize);
        await grantAward(runnerUpPart, "Runner-Up", runnerUpPrize);
      }
    }
  }

  revalidatePath(`/tournaments/${tournamentId}`);
}
