// This script deletes all entries from the UserXPEvent table
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  try {
    const deleted = await prisma.$executeRaw`DELETE FROM "UserXPEvent"`;
    console.log(`Deleted ${deleted} entries from UserXPEvent.`);
  } catch (error) {
    console.error('Error deleting UserXPEvent entries:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 