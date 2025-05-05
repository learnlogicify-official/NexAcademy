const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkTables() {
  try {
    // Check if the SectionQuestion table exists by querying PostgreSQL system tables
    const tableInfo = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema='public' 
      ORDER BY table_name;
    `;
    
    // Check SectionQuestion table specifically
    const sectionQuestionTable = tableInfo.find(t => t.table_name === 'SectionQuestion');
    if (sectionQuestionTable) {
      // Count records in the table
      const recordCount = await prisma.sectionQuestion.count();
      
      // Sample some records if available
      if (recordCount > 0) {
        const sampleRecords = await prisma.sectionQuestion.findMany({
          take: 5,
          select: {
            id: true,
            sectionId: true,
            questionId: true,
            order: true,
            sectionMark: true
          }
        });
      }
    } else {
      // ... existing code ...
    }
    
  } catch (e) {
    // ... existing code ...
  } finally {
    await prisma.$disconnect();
  }
}

checkTables(); 