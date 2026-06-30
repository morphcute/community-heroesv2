const { PrismaClient } = require("@prisma/client");
const p = new PrismaClient();
p.systemSetting.findMany()
  .then(console.log)
  .catch(console.error)
  .finally(() => p.$disconnect());
