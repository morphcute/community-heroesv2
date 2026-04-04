import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log("Purging all development tournaments from the database...");
  const result = await prisma.tournament.deleteMany({});
  console.log(`Successfully deleted ${result.count} tournaments.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
