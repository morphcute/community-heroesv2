import { PrismaClient } from '@prisma/client'
import { generateBracket } from './src/lib/bracket-generator'
const prisma = new PrismaClient()

async function main() {
  console.log("Creating Test Tournament...");
  const t = await prisma.tournament.create({
    data: {
      title: "Championship MLBB Bracket",
      description: "Testing the algorithmic binary tree generator.",
      gameMode: "SOLO_1V1",
      format: "SINGLE_ELIMINATION",
      maxTeams: 8,
      status: "REGISTRATION_OPEN",
      startDate: new Date()
    }
  });

  console.log(`Tournament ID: ${t.id}`);

  // Create an Admin relation for the primary user (jimboy) so we can see the Edit controls
  const adminUser = await prisma.user.findFirst({ where: { email: "jimboy@example.com" } });
  if (adminUser) {
     await prisma.tournamentAdmin.create({
       data: { tournamentId: t.id, userId: adminUser.id, role: "ADMIN" }
     });
  }

  console.log("Creating 8 Players...");
  for(let i=1; i<=8; i++) {
     const u = await prisma.user.create({
        data: { name: `Pro Player ${i}`, email: `pro${i}_${Date.now()}@test.com`, image: `https://api.dicebear.com/7.x/avataaars/svg?seed=${i}` }
     });
     await prisma.tournamentParticipant.create({
        data: { tournamentId: t.id, userId: u.id, status: "APPROVED" }
     });
  }

  console.log("Changing status to ONGOING and Generating Bracket...");
  await prisma.tournament.update({ where: { id: t.id }, data: { status: "ONGOING" } });
  
  await generateBracket(t.id);

  console.log(`Bracket generated! Navigate to: http://localhost:3000/tournaments/${t.id}?tab=bracket`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
