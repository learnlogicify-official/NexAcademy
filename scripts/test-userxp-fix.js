#!/usr/bin/env node

// This script tests if the Prisma client can now properly query the UserXP table
// Run with: node scripts/test-userxp-fix.js

const { PrismaClient } = require('@prisma/client');

async function main() {
  const prisma = new PrismaClient();
  
  try {
    console.log('Testing Prisma client with fixed UserXP schema...');
    
    // Try to query UserXP with the xp field
    console.log('Querying UserXP table with Prisma client...');
    
    const userXPs = await prisma.userXP.findMany({
      take: 5,
      select: {
        id: true,
        userId: true,
        xp: true,
        level: true,
        updatedAt: true,
        user: {
          select: {
            name: true
          }
        },
        events: {
          select: {
            id: true
          },
          take: 1
        }
      },
      orderBy: {
        xp: 'desc'
      }
    });
    
    console.log(`Query succeeded! Found ${userXPs.length} UserXP records.`);
    
    if (userXPs.length > 0) {
      console.log('Sample UserXP record:', userXPs[0]);
    }
    
    // Try querying UserXPEvents
    console.log('\nTesting UserXPEvent querying...');
    const xpEvents = await prisma.userXPEvent.findMany({
      take: 5,
      select: {
        id: true,
        userId: true,
        questionId: true,
        eventType: true,
        awardedXP: true,
        createdAt: true
      }
    });
    
    console.log(`Found ${xpEvents.length} UserXPEvent records.`);
    if (xpEvents.length > 0) {
      console.log('Sample UserXPEvent:', xpEvents[0]);
    }
    
    console.log('\nPrisma client is now correctly configured with the fixed schema!');
    
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