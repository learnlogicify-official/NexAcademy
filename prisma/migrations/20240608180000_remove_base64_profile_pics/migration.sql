-- Migration: Remove base64 profilePic values from User table

-- Check if the User table exists before updating
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'User') THEN
        UPDATE "User"
        SET "profilePic" = NULL
        WHERE "profilePic" IS NOT NULL
          AND "profilePic" LIKE 'data:image%';
    END IF;
END
$$; 