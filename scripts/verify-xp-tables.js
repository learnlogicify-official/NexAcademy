#!/usr/bin/env node

// This script verifies that the UserXPEvent table has the correct structure
// Run with: node scripts/verify-xp-tables.js

const { PrismaClient } = require('@prisma/client');

async function main() {
  const prisma = new PrismaClient();
  
  try {
    console.log('Verifying UserXPEvent table structure...');
    
    // Check if questionId column exists
    const hasQuestionId = await checkColumnExists(prisma, 'UserXPEvent', 'questionId');
    console.log(`questionId column exists: ${hasQuestionId}`);
    
    // Check if indexes exist
    const hasQuestionIdIndex = await checkIndexExists(prisma, 'UserXPEvent_questionId_idx');
    console.log(`Index on questionId exists: ${hasQuestionIdIndex}`);
    
    const hasCompositeIndex = await checkIndexExists(prisma, 'UserXPEvent_userId_questionId_eventType_idx');
    console.log(`Composite index exists: ${hasCompositeIndex}`);
    
    // Check table schema
    const tableSchema = await getTableSchema(prisma, 'UserXPEvent');
    console.log('Table schema for UserXPEvent:');
    console.log(tableSchema);
    
    console.log('\nVerification completed.');
    
    // Optional: Test query that would have failed before
    console.log('\nTesting query that includes questionId...');
    try {
      const rawTestQuery = await prisma.$queryRaw`
        SELECT id, "userId", "questionId", "eventType", description, 
               "xpAmount", "createdAt"
        FROM "UserXPEvent" 
        LIMIT 1
      `;
      console.log('Raw query executed successfully!');
      console.log(`Found ${rawTestQuery.length} records.`);
      if (rawTestQuery.length > 0) {
        console.log('Sample record:', rawTestQuery[0]);
      }
    } catch (queryError) {
      console.error('Error executing raw query:', queryError.message);
    }
    
  } catch (error) {
    console.error('Error during verification:', error);
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

async function getTableSchema(prisma, table) {
  const columns = await prisma.$queryRaw`
    SELECT column_name, data_type, is_nullable
    FROM information_schema.columns
    WHERE table_name = ${table}
    ORDER BY ordinal_position
  `;
  
  const indexes = await prisma.$queryRaw`
    SELECT indexname, indexdef
    FROM pg_indexes
    WHERE tablename = ${table}
  `;
  
  return {
    columns,
    indexes
  };
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  }); 