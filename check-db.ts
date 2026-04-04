import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
async function main() {
  const admin = await prisma.user.findFirst({ where: { role: 'SUPERADMIN' } });
  const tz = await prisma.tournament.findMany({ include: { admins: true } });
  for (const t of tz) {
    if (t.admins.length === 0 && admin) {
      await prisma.tournamentAdmin.create({
        data: { tournamentId: t.id, userId: admin.id, role: 'ADMIN' }
      });
      console.log(`Linked tournament ${t.title} to ${admin.name}`);
    }
  }
}
main().catch(console.error).finally(() => prisma.$disconnect())
