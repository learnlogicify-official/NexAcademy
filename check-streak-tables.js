// Script to check streak tables and debug
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    console.log('---- Checking Database Tables ----');
    
    // Check if tables exist
    const tablesResult = await prisma.$queryRaw`
      SELECT 
        table_name
      FROM 
        information_schema.tables 
      WHERE 
        table_name IN ('UserStreak', 'DailyActivity', 'User') 
        AND table_schema = 'public'
    `;
    
    console.log('Tables found:', tablesResult);
    
    // Count users
    const userCount = await prisma.user.count();
    console.log('Total users:', userCount);
    
    // Get a sample user
    const users = await prisma.user.findMany({
      take: 3,
      select: {
        id: true,
        email: true,
        name: true,
        role: true
      }
    });
    
    console.log('Sample users:', users);
    
    // Check UserStreak records
    try {
      const streakCount = await prisma.$queryRaw`SELECT COUNT(*) as count FROM "UserStreak"`;
      console.log('Streak count:', streakCount[0].count);
      
      // Show sample streaks if any exist
      if (streakCount[0].count > 0) {
        const streaks = await prisma.$queryRaw`SELECT * FROM "UserStreak" LIMIT 3`;
        console.log('Sample streaks:', streaks);
      } else {
        console.log('No streaks found in the database');
      }
    } catch (e) {
      console.error('Error checking UserStreak:', e);
    }
    
    // Check DailyActivity records
    try {
      const activityCount = await prisma.$queryRaw`SELECT COUNT(*) as count FROM "DailyActivity"`;
      console.log('Daily activity count:', activityCount[0].count);
      
      // Show sample activities if any exist
      if (activityCount[0].count > 0) {
        const activities = await prisma.$queryRaw`SELECT * FROM "DailyActivity" LIMIT 3`;
        console.log('Sample activities:', activities);
      } else {
        console.log('No daily activities found in the database');
      }
    } catch (e) {
      console.error('Error checking DailyActivity:', e);
    }
    
    // Try creating a test streak
    console.log('\n---- Testing streak creation ----');
    
    if (users.length > 0) {
      const testUserId = users[0].id;
      console.log(`Attempting to create test streak for user ${testUserId}`);
      
      try {
        // Delete any existing streak for this user first
        await prisma.$executeRaw`DELETE FROM "UserStreak" WHERE "userId" = ${testUserId}`;
        
        // Create a new streak
        const newStreakId = 'test_' + Math.random().toString(36).substring(2, 9);
        const today = new Date();
        
        await prisma.$executeRaw`
          INSERT INTO "UserStreak" (
            id, "userId", "currentStreak", "longestStreak", 
            "lastActivityDate", "freezeCount", "updatedAt"
          )
          VALUES (
            ${newStreakId}, ${testUserId}, 1, 1, 
            ${today}, 0, NOW()
          )
        `;
        
        console.log('Test streak created successfully!');
        
        // Verify streak was created
        const verifyStreak = await prisma.$queryRaw`SELECT * FROM "UserStreak" WHERE "userId" = ${testUserId}`;
        console.log('Verified streak data:', verifyStreak);
      } catch (err) {
        console.error('Error creating test streak:', err);
      }
    }
    
  } catch (error) {
    console.error('General error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 