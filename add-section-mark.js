const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function addColumn() {
  try {
    const result = await prisma.$executeRawUnsafe('ALTER TABLE "SectionQuestion" ADD COLUMN IF NOT EXISTS "sectionMark" DECIMAL(65,30)');
  } catch (e) {
    console.error('Error adding column:', e);
  } finally {
    await prisma.$disconnect();
  }
}

addColumn(); 