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
    
    console.log('Tables in database:');
    tableInfo.forEach(table => {
      console.log(`- ${table.table_name}`);
    });
    
    // Check SectionQuestion table specifically
    const sectionQuestionTable = tableInfo.find(t => t.table_name === 'SectionQuestion');
    if (sectionQuestionTable) {
      console.log('\nSectionQuestion table exists! Getting column info:');
      
      const columnInfo = await prisma.$queryRaw`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns
        WHERE table_name = 'SectionQuestion'
        ORDER BY ordinal_position;
      `;
      
      console.log('\nColumns in SectionQuestion table:');
      columnInfo.forEach(col => {
        console.log(`- ${col.column_name} (${col.data_type}, nullable: ${col.is_nullable}, default: ${col.column_default || 'none'})`);
      });
      
      // Count records in the table
      const recordCount = await prisma.sectionQuestion.count();
      console.log(`\nTotal records in SectionQuestion table: ${recordCount}`);
      
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
        
        console.log('\nSample records:');
        console.log(sampleRecords);
      }
    } else {
      console.error('\nSectionQuestion table does not exist in the database!');
    }
    
  } catch (e) {
    console.error('Error checking tables:', e);
  } finally {
    await prisma.$disconnect();
    console.log('\nDisconnected from database');
  }
}

checkTables(); 