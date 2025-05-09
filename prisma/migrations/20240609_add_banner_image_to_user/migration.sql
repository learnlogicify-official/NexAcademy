-- Migration: Add bannerImage field to User table

-- Check if the User table exists before updating
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'User') THEN
        -- Check if the column doesn't already exist
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'User' AND column_name = 'bannerImage'
        ) THEN
            ALTER TABLE "User"
            ADD COLUMN "bannerImage" TEXT;
        END IF;
    END IF;
END
$$; 