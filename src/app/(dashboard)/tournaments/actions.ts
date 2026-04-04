"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { generateBracket } from "@/lib/bracket-generator";

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

  if (tournament.gameMode === "SOLO_1V1") {
    // Solo validation
    const alreadyJoined = tournament.participants.some(p => p.userId === user.id);
    if (alreadyJoined) return { ok: false, message: "You are already registered." };
    finalParticipantData.userId = user.id;
  } else {
    // Squad Validation
    const requiredMembers = tournament.gameMode === "TEAM_5V5" ? 5 : tournament.gameMode === "TRIO_3V3" ? 3 : 2;
    
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

  // Mathematically Bubble Winner Up The Tree
  if (status === "COMPLETED" && winnerId && match.nextMatchId) {
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
  }

  revalidatePath(`/tournaments/${tournamentId}`);
}
