const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Delete all user code drafts
  await prisma.userCodeDraft.deleteMany({});
  console.log('All userCodeDraft rows deleted.');

  // Delete all user problem settings
  await prisma.userProblemSettings.deleteMany({});
  console.log('All userProblemSettings rows deleted.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 