import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const t = await prisma.tournament.findFirst({
    where: { title: "Championship MLBB Bracket" },
    orderBy: { createdAt: 'desc' },
    select: { id: true, title: true }
  });
  console.log(JSON.stringify(t));
}
main().catch(console.error).finally(() => prisma.$disconnect());
