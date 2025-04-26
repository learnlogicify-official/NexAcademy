const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function addColumn() {
  try {
    console.log('Attempting to add sectionMark column...');
    const result = await prisma.$executeRawUnsafe('ALTER TABLE "SectionQuestion" ADD COLUMN IF NOT EXISTS "sectionMark" DECIMAL(65,30)');
    console.log('Column added successfully', result);
  } catch (e) {
    console.error('Error adding column:', e);
  } finally {
    await prisma.$disconnect();
    console.log('Disconnected from database');
  }
}

addColumn(); 