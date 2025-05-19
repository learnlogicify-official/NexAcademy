#!/usr/bin/env node

// This script fixes column name mismatches in the UserXP table
// Run with: node scripts/fix-userxp-columns.js

const { PrismaClient } = require('@prisma/client');

async function main() {
  const prisma = new PrismaClient();
  
  try {
    console.log('Checking UserXP table structure...');
    
    // Check if columns exist
    const hasTotalXP = await checkColumnExists(prisma, 'UserXP', 'totalXP');
    const hasXp = await checkColumnExists(prisma, 'UserXP', 'xp');
    
    console.log(`Current column status: totalXP exists: ${hasTotalXP}, xp exists: ${hasXp}`);
    
    if (hasTotalXP && !hasXp) {
      console.log('Renaming totalXP to xp to match Prisma schema...');
      
      // Rename the column
      await prisma.$executeRawUnsafe(`
        ALTER TABLE "UserXP" RENAME COLUMN "totalXP" TO "xp";
      `);
      
      console.log('Successfully renamed column totalXP to xp');
    } else if (hasTotalXP && hasXp) {
      console.log('Both columns exist. Will handle data migration and then drop old column.');
      
      // Migrate data to new column
      await prisma.$executeRawUnsafe(`
        UPDATE "UserXP" 
        SET "xp" = "totalXP" 
        WHERE "xp" IS NULL;
      `);
      
      // Drop old column
      await prisma.$executeRawUnsafe(`
        ALTER TABLE "UserXP" DROP COLUMN "totalXP";
      `);
      
      console.log('Data migration and column drop completed');
    } else if (!hasTotalXP && !hasXp) {
      console.log('Neither column exists! This is a serious issue with your database schema.');
      console.log('Will attempt to add the xp column...');
      
      await prisma.$executeRawUnsafe(`
        ALTER TABLE "UserXP" ADD COLUMN "xp" INTEGER NOT NULL DEFAULT 0;
      `);
      
      console.log('Added missing xp column with default value of 0');
    } else {
      console.log('The xp column already exists, no need to rename anything');
    }
    
    // Check UserXPEvent relation to UserXP
    const hasUserXPRelation = await checkForeignKeyExists(prisma, 'UserXPEvent', 'userId', 'UserXP', 'userId');
    console.log(`UserXPEvent to UserXP relation exists: ${hasUserXPRelation}`);
    
    if (!hasUserXPRelation) {
      console.log('Adding missing relation between UserXPEvent and UserXP...');
      
      try {
        await prisma.$executeRawUnsafe(`
          ALTER TABLE "UserXPEvent" 
          ADD CONSTRAINT "UserXPEvent_userXP_fkey" 
          FOREIGN KEY ("userId") 
          REFERENCES "UserXP"("userId") 
          ON DELETE CASCADE;
        `);
        console.log('Successfully added relation between UserXPEvent and UserXP');
      } catch (error) {
        console.log('Error adding relation:', error.message);
        console.log('This might mean that some UserXPEvent records have userId that does not exist in UserXP');
        console.log('Consider syncing the UserXP records first before adding this constraint');
      }
    }
    
    // Verify fix
    const finalHasXp = await checkColumnExists(prisma, 'UserXP', 'xp');
    console.log(`Final column check: xp exists: ${finalHasXp}`);
    
    if (finalHasXp) {
      // Test query that should work with fixed schema
      console.log('Testing query with xp field...');
      const testData = await prisma.$queryRaw`
        SELECT id, "userId", "xp", level, "updatedAt"
        FROM "UserXP"
        LIMIT 1
      `;
      
      console.log(`Query succeeded. Found ${testData.length} records.`);
      if (testData.length > 0) {
        console.log('Sample record:', testData[0]);
      }
    }
    
    console.log('UserXP table fix completed.');
  } catch (error) {
    console.error('Error fixing UserXP table:', error);
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

async function checkForeignKeyExists(prisma, fromTable, fromColumn, toTable, toColumn) {
  const result = await prisma.$queryRaw`
    SELECT EXISTS (
      SELECT 1
      FROM information_schema.table_constraints tc
      JOIN information_schema.constraint_column_usage ccu ON tc.constraint_name = ccu.constraint_name
      JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
      WHERE tc.constraint_type = 'FOREIGN KEY'
      AND tc.table_name = ${fromTable}
      AND kcu.column_name = ${fromColumn}
      AND ccu.table_name = ${toTable}
      AND ccu.column_name = ${toColumn}
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