import { prisma } from "@/lib/prisma";
import crypto from "crypto";

export async function generateBracket(tournamentId: string) {
  // Fetch participants
  const participants = await prisma.tournamentParticipant.findMany({
    where: { tournamentId }
  });

  if (participants.length < 2) return;

  // Shuffle for random seeding
  for (let i = participants.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [participants[i], participants[j]] = [participants[j], participants[i]];
  }

  // Calculate binary tree exact depth (assume power of 2 for standard MLBB tourneys)
  const numParticipants = participants.length;
  const numRounds = Math.ceil(Math.log2(numParticipants));
  const exactPowerOf2 = Math.pow(2, numRounds);
  
  // Pad with nulls for "Byes" if not a perfect power of 2
  const paddedParticipants = [...participants];
  while (paddedParticipants.length < exactPowerOf2) {
    paddedParticipants.push(null as any);
  }

  const allMatches: any[] = [];
  
  // We'll build the tree top-down (from Final down to Round 1)
  // or bottom-up. Bottom-up is easier for wiring "nextMatchId".
  // Let's store matches by round to wire them.
  const roundMatches = new Map<number, any[]>();

  let matchIndexCounter = 0;
  
  // Create all matches first with pre-generated IDs
  for (let round = 1; round <= numRounds; round++) {
    const matchesInRound = Math.pow(2, numRounds - round);
    const currentRoundArray = [];
    
    for (let i = 0; i < matchesInRound; i++) {
      currentRoundArray.push({
        id: crypto.randomUUID(),
        tournamentId,
        round,
        matchIndex: i, // vertical position
        status: "PENDING",
        participant1Id: null,
        participant2Id: null,
        nextMatchId: null // will link later
      });
    }
    roundMatches.set(round, currentRoundArray);
    allMatches.push(...currentRoundArray);
  }

  // Wire nextMatchId
  for (let round = 1; round < numRounds; round++) {
    const currentRound = roundMatches.get(round)!;
    const nextRound = roundMatches.get(round + 1)!;
    
    for (let i = 0; i < currentRound.length; i++) {
      const nextMatchIndex = Math.floor(i / 2);
      currentRound[i].nextMatchId = nextRound[nextMatchIndex].id;
    }
  }

  // Assign Round 1 Participants
  const round1Matches = roundMatches.get(1)!;
  let pIndex = 0;
  for (let i = 0; i < round1Matches.length; i++) {
    const p1 = paddedParticipants[pIndex++];
    const p2 = paddedParticipants[pIndex++];
    
    round1Matches[i].participant1Id = p1 ? p1.id : null;
    round1Matches[i].participant2Id = p2 ? p2.id : null;
    
    // Auto-advance logic for BYES
    if (p1 && !p2) {
      round1Matches[i].winnerId = p1.id;
      round1Matches[i].status = "COMPLETED";
      // We don't bubble strictly here to the next node immediately to keep things simple,
      // but ideally we should advance them to Round 2.
    } else if (!p1 && p2) {
      round1Matches[i].winnerId = p2.id;
      round1Matches[i].status = "COMPLETED";
    }
    
    if (p1 && p2) {
      round1Matches[i].status = "ONGOING"; // Round 1 starts!
    }
  }

  // Fix BYE bubbling
  for (let i = 0; i < round1Matches.length; i++) {
     const m = round1Matches[i];
     if (m.status === "COMPLETED" && m.winnerId && m.nextMatchId) {
        // Find next match to bubble into
        const nextMatch = allMatches.find(x => x.id === m.nextMatchId);
        if (nextMatch) {
            // Is it top or bottom feeder?
            if (m.matchIndex % 2 === 0) {
               nextMatch.participant1Id = m.winnerId;
            } else {
               nextMatch.participant2Id = m.winnerId;
            }
            // Check if nextMatch is now full to make it ONGOING
            if (nextMatch.participant1Id && nextMatch.participant2Id) {
                nextMatch.status = "ONGOING";
            }
        }
     }
  }

  // Insert all into Prisma
  // @ts-ignore - Prisma client needs to rebuild to natively catch the Match table schema injection
  await prisma.match.createMany({
    data: allMatches
  });

}
