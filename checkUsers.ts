import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
async function main() {
  const users = await prisma.user.findMany();
  console.log("Users:", users.length, users.map(u => ({ id: u.id, email: u.email, name: u.name })));
}
main().finally(() => prisma.$disconnect());
