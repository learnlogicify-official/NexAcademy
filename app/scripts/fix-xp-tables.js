#!/usr/bin/env node

// This script adds missing columns to the UserXPEvent table
// Run with: node scripts/fix-xp-tables.js

const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

async function main() {
  const prisma = new PrismaClient();
  
  try {
    console.log('Checking UserXPEvent table structure...');
    
    // Check if questionId column exists
    const hasQuestionId = await checkColumnExists(prisma, 'UserXPEvent', 'questionId');
    
    if (!hasQuestionId) {
      console.log('Adding missing questionId column to UserXPEvent table...');
      
      // Execute each SQL statement separately
      await prisma.$executeRawUnsafe(`ALTER TABLE "UserXPEvent" ADD COLUMN "questionId" TEXT;`);
      console.log('Added questionId column');
      
      try {
        await prisma.$executeRawUnsafe(`CREATE INDEX "UserXPEvent_questionId_idx" ON "UserXPEvent" ("questionId");`);
        console.log('Created index on questionId column');
      } catch (indexError) {
        console.log('Index on questionId may already exist or could not be created:', indexError.message);
      }
      
      try {
        await prisma.$executeRawUnsafe(`CREATE INDEX "UserXPEvent_userId_questionId_eventType_idx" ON "UserXPEvent" ("userId", "questionId", "eventType");`);
        console.log('Created composite index on userId, questionId, eventType');
      } catch (indexError) {
        console.log('Composite index may already exist or could not be created:', indexError.message);
      }
      
      console.log('Successfully added questionId column to UserXPEvent table');
    } else {
      console.log('questionId column already exists in UserXPEvent table');
    }
    
    // Check if indexes exist as well
    const hasQuestionIdIndex = await checkIndexExists(prisma, 'UserXPEvent_questionId_idx');
    const hasCompositeIndex = await checkIndexExists(prisma, 'UserXPEvent_userId_questionId_eventType_idx');
    
    if (!hasQuestionIdIndex) {
      console.log('Adding missing index on questionId column...');
      try {
        await prisma.$executeRawUnsafe(`CREATE INDEX "UserXPEvent_questionId_idx" ON "UserXPEvent" ("questionId");`);
        console.log('Created index on questionId column');
      } catch (indexError) {
        console.log('Index creation failed:', indexError.message);
      }
    }
    
    if (!hasCompositeIndex) {
      console.log('Adding missing composite index on userId, questionId, eventType...');
      try {
        await prisma.$executeRawUnsafe(`CREATE INDEX "UserXPEvent_userId_questionId_eventType_idx" ON "UserXPEvent" ("userId", "questionId", "eventType");`);
        console.log('Created composite index');
      } catch (indexError) {
        console.log('Composite index creation failed:', indexError.message);
      }
    }
    
    console.log('Database update completed successfully');
  } catch (error) {
    console.error('Error updating database:', error);
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

async function checkIndexExists(prisma, indexName) {
  const result = await prisma.$queryRaw`
    SELECT EXISTS (
      SELECT 1
      FROM pg_indexes
      WHERE indexname = ${indexName}
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