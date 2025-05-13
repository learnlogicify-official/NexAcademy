#!/usr/bin/env node

// This script fixes the field name mismatch between Prisma schema and database
// Run with: node scripts/fix-field-names.js

const { PrismaClient } = require('@prisma/client');

async function main() {
  const prisma = new PrismaClient();
  
  try {
    console.log('Fixing field name mismatches...');
    
    // Check if columns exist
    const hasXpAmount = await checkColumnExists(prisma, 'UserXPEvent', 'xpAmount');
    const hasAwardedXP = await checkColumnExists(prisma, 'UserXPEvent', 'awardedXP');
    
    console.log(`Current column status: xpAmount exists: ${hasXpAmount}, awardedXP exists: ${hasAwardedXP}`);
    
    if (hasXpAmount && !hasAwardedXP) {
      console.log('Renaming xpAmount to awardedXP to match Prisma schema...');
      
      // Rename the column
      await prisma.$executeRawUnsafe(`
        ALTER TABLE "UserXPEvent" RENAME COLUMN "xpAmount" TO "awardedXP";
      `);
      
      console.log('Successfully renamed column');
    } else if (hasXpAmount && hasAwardedXP) {
      console.log('Both columns exist. Will handle data migration and then drop old column.');
      
      // Migrate data to new column
      await prisma.$executeRawUnsafe(`
        UPDATE "UserXPEvent" 
        SET "awardedXP" = "xpAmount" 
        WHERE "awardedXP" IS NULL;
      `);
      
      // Drop old column
      await prisma.$executeRawUnsafe(`
        ALTER TABLE "UserXPEvent" DROP COLUMN "xpAmount";
      `);
      
      console.log('Data migration and column drop completed');
    } else if (!hasXpAmount && !hasAwardedXP) {
      console.log('Neither column exists! This is a serious issue with your database schema.');
      console.log('Will attempt to add the awardedXP column...');
      
      await prisma.$executeRawUnsafe(`
        ALTER TABLE "UserXPEvent" ADD COLUMN "awardedXP" INTEGER NOT NULL DEFAULT 0;
      `);
      
      console.log('Added missing awardedXP column with default value of 0');
    } else {
      console.log('The awardedXP column already exists, no need to rename anything');
    }
    
    // Verify fix
    const finalHasAwardedXP = await checkColumnExists(prisma, 'UserXPEvent', 'awardedXP');
    console.log(`Final column check: awardedXP exists: ${finalHasAwardedXP}`);
    
    if (finalHasAwardedXP) {
      // Test query that should work with fixed schema
      console.log('Testing query with awardedXP field...');
      const testData = await prisma.$queryRaw`
        SELECT id, "userId", "questionId", "eventType", description, "awardedXP", "createdAt"
        FROM "UserXPEvent"
        LIMIT 1
      `;
      
      console.log(`Query succeeded. Found ${testData.length} records.`);
      if (testData.length > 0) {
        console.log('Sample record:', testData[0]);
      }
    }
    
    console.log('Field name fix completed.');
  } catch (error) {
    console.error('Error fixing field names:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

async function checkColumnExists(prisma, table, column) {
  const result = await prisma.$queryRaw`
    SELECT EXISTS (
      SELECT 1
      FROM information_schema.columns
      WHERE table_name = ${table}
      AND column_name = ${column}
    ) as exists
  `;
  
  return result[0].exists;
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  }); 