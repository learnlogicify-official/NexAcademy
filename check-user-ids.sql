-- Check for a few sample user IDs
SELECT id, email, name FROM "User" LIMIT 5;

-- Count total users
SELECT COUNT(*) AS total_users FROM "User";

-- Check for any existing UserStreak records
SELECT * FROM "UserStreak" LIMIT 10;

-- Count total UserStreak records
SELECT COUNT(*) AS total_streaks FROM "UserStreak";

-- Check for any existing DailyActivity records
SELECT * FROM "DailyActivity" LIMIT 10;

-- Count DailyActivity records
SELECT COUNT(*) AS total_activities FROM "DailyActivity"; 