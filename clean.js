import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function clean() {
  await prisma.tournament.deleteMany({});
  console.log("All seeded tournaments removed successfully.");
  process.exit(0);
}
clean();
