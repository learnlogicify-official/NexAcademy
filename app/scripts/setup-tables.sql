-- Create ProblemSubmission table if it doesn't exist
CREATE TABLE IF NOT EXISTS "ProblemSubmission" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "problemId" TEXT NOT NULL,
  "language" TEXT NOT NULL,
  "code" TEXT NOT NULL,
  "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "testcasesPassed" INTEGER NOT NULL,
  "totalTestcases" INTEGER NOT NULL,
  "allPassed" BOOLEAN NOT NULL DEFAULT false,
  "runtime" TEXT,
  "memory" TEXT,
  "runtimePercentile" TEXT,
  "memoryPercentile" TEXT,
  
  CONSTRAINT "ProblemSubmission_pkey" PRIMARY KEY ("id")
);

-- Create indexes for ProblemSubmission
CREATE INDEX IF NOT EXISTS "ProblemSubmission_userId_idx" ON "ProblemSubmission"("userId");
CREATE INDEX IF NOT EXISTS "ProblemSubmission_problemId_idx" ON "ProblemSubmission"("problemId");
CREATE INDEX IF NOT EXISTS "ProblemSubmission_allPassed_idx" ON "ProblemSubmission"("allPassed");

-- Try to add foreign key constraint - might fail if User table doesn't exist
DO $$
BEGIN
  BEGIN
    ALTER TABLE "ProblemSubmission"
    ADD CONSTRAINT "ProblemSubmission_userId_fkey" 
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
  EXCEPTION
    WHEN duplicate_object THEN
      RAISE NOTICE 'Foreign key constraint already exists';
    WHEN undefined_table THEN
      RAISE NOTICE 'User table does not exist, skipping foreign key constraint';
  END;
END$$;

-- Check if UserProblemSettings table exists
DO $$
BEGIN
  IF EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public'
    AND table_name = 'UserProblemSettings'
  ) THEN
    -- Add lastAcceptedSubmissionId column if it doesn't exist
    BEGIN
      ALTER TABLE "UserProblemSettings"
      ADD COLUMN IF NOT EXISTS "lastAcceptedSubmissionId" TEXT;
    EXCEPTION
      WHEN duplicate_column THEN
        RAISE NOTICE 'Column lastAcceptedSubmissionId already exists';
    END;
    
    -- Add hideAcceptedTab column if it doesn't exist
    BEGIN
      ALTER TABLE "UserProblemSettings"
      ADD COLUMN IF NOT EXISTS "hideAcceptedTab" BOOLEAN DEFAULT false;
    EXCEPTION
      WHEN duplicate_column THEN
        RAISE NOTICE 'Column hideAcceptedTab already exists';
    END;
    
    -- Try to add foreign key constraint - might fail if User table doesn't exist
    BEGIN
      ALTER TABLE "UserProblemSettings"
      DROP CONSTRAINT IF EXISTS "UserProblemSettings_lastAcceptedSubmissionId_fkey";
      
      ALTER TABLE "UserProblemSettings"
      ADD CONSTRAINT "UserProblemSettings_lastAcceptedSubmissionId_fkey" 
      FOREIGN KEY ("lastAcceptedSubmissionId") 
      REFERENCES "ProblemSubmission"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    EXCEPTION
      WHEN duplicate_object THEN
        RAISE NOTICE 'Foreign key constraint already exists';
    END;
  ELSE
    RAISE NOTICE 'UserProblemSettings table does not exist, skipping column and constraint addition';
  END IF;
END$$; 