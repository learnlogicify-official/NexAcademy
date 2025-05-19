#!/usr/bin/env node

// This script tests if the Prisma client can now properly query the UserXPEvent table
// Run with: node scripts/test-prisma-xp.js

const { PrismaClient } = require('@prisma/client');

async function main() {
  const prisma = new PrismaClient();
  
  try {
    console.log('Testing Prisma client with updated schema...');
    
    // Try to query UserXPEvent with the questionId field
    console.log('Querying UserXPEvent table with Prisma client...');
    
    const events = await prisma.userXPEvent.findMany({
      take: 5,
      select: {
        id: true,
        userId: true,
        questionId: true,
        eventType: true,
        description: true,
        awardedXP: true,
        createdAt: true
      }
    });
    
    console.log(`Query succeeded! Found ${events.length} XP events.`);
    
    if (events.length > 0) {
      console.log('Sample XP event:', events[0]);
    }
    
    // Try to create a test event with questionId
    console.log('\nTesting creation of a UserXPEvent with questionId...');
    
    const testUser = await prisma.user.findFirst({
      select: { id: true }
    });
    
    if (!testUser) {
      console.log('No users found in the database to use for testing');
      return;
    }
    
    // Create a test XP event
    const newEvent = await prisma.userXPEvent.create({
      data: {
        userId: testUser.id,
        questionId: 'test-question-id',
        eventType: 'test_event',
        description: 'Test event for schema verification',
        awardedXP: 10
      }
    });
    
    console.log('Successfully created test event with questionId:', newEvent);
    
    // Clean up the test event
    await prisma.userXPEvent.delete({
      where: { id: newEvent.id }
    });
    
    console.log('Test event cleaned up successfully');
    console.log('\nPrisma client is now correctly configured with the updated schema!');
    
  } catch (error) {
    console.error('Error testing Prisma client:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  }); 