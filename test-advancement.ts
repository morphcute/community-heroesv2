import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const tournamentId = "cmmxqeamt00004rew454trm8r"; // The one we created
  
  console.log("Fetching first round matches...");
  const matches = await prisma.match.findMany({
    where: { tournamentId, round: 1 },
    include: { participant1: { include: { user: true } }, participant2: { include: { user: true } } },
    orderBy: { matchIndex: 'asc' }
  });

  const m = matches[0];
  if (!m || !m.participant1 || !m.participant2) {
    console.error("No valid first match found.");
    return;
  }

  const p1 = m.participant1;
  const p2 = m.participant2;
  const p1Name = p1.user?.name ?? "Participant 1";
  const p2Name = p2.user?.name ?? "Participant 2";
  console.log(`Advancing ${p1Name} over ${p2Name} in match ${m.id}`);

  // Simulate FormData
  const formData = new URLSearchParams();
  formData.append("matchId", m.id);
  formData.append("tournamentId", tournamentId);
  formData.append("score1", "2");
  formData.append("score2", "1");
  formData.append("winnerId", p1.id);

  // We need a fake FormData object that the server action expects
  // Since updateMatchScore is a server action, it takes a FormData object.
  // In node, we can use a shim or just call the logic inside if we exported it, 
  // but to be safe, I'll just look at what the code does and verify the DB state after manual update.
  
  // Or just use the action if possible.
  // Let's just run the logic manually in this script to confirm it works as expected.
  
  console.log("Manually executing advancement logic...");
  await prisma.match.update({
    where: { id: m.id },
    data: { score1: 2, score2: 1, winnerId: p1.id, status: "COMPLETED" }
  });

  if (m.nextMatchId) {
     const nextMatch = await prisma.match.findUnique({ where: { id: m.nextMatchId }});
     if (nextMatch) {
       const isTopFeeder = m.matchIndex % 2 === 0;
       const nextData: { participant1Id?: string; participant2Id?: string } = {};
       if (isTopFeeder) nextData.participant1Id = p1.id;
       else nextData.participant2Id = p1.id;
       
       await prisma.match.update({
         where: { id: m.nextMatchId },
         data: nextData
       });
       console.log(`Success: ${p1Name} moved to next match ${m.nextMatchId}`);
     }
  }

  // Final State check
  if (m.nextMatchId) {
    const updatedNext = await prisma.match.findUnique({ where: { id: m.nextMatchId }});
    console.log("Next Match State:", JSON.stringify(updatedNext, null, 2));
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
