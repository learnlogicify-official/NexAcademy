// This script creates the XP tables in the database
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function createXPTables() {
  try {
    // Read the SQL script
    const sqlScript = fs.readFileSync(
      path.join(__dirname, 'create-xp-tables.sql'),
      'utf8'
    );
    
    // Split the script into separate statements
    const statements = sqlScript
      .split(';')
      .map(statement => statement.trim())
      .filter(statement => statement.length > 0);
    
    console.log(`Found ${statements.length} SQL statements to execute`);
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      try {
        await prisma.$executeRawUnsafe(`${statement};`);
        console.log(`Executed statement ${i + 1}/${statements.length}`);
      } catch (err) {
        console.error(`Error executing statement ${i + 1}:`, err);
        // Continue with other statements
      }
    }
    
    console.log('XP tables creation completed!');
    
    // Verify tables exist
    const tableCheck = await prisma.$queryRaw`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'UserXP'
      ) as "userXPExists",
      EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'UserXPEvent'
      ) as "userXPEventExists"
    `;
    
    console.log('Table verification:', tableCheck);
    
  } catch (error) {
    console.error('Error creating XP tables:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createXPTables(); 