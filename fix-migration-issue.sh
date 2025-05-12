#!/bin/bash

echo "Fixing migration issues without resetting the database..."

# Stop any running containers
docker-compose down

# Start just the database
docker-compose up -d db

# Wait for the database to be ready
echo "Waiting for the database to be ready..."
sleep 10

# Connect to the database and manually create the missing tables
echo "Creating missing tables in the database..."
docker-compose exec -T db psql -U doadmin -d defaultdb -h nexacademy-do-user-16631038-0.k.db.ondigitalocean.com -p 25060 --set=sslmode=require << EOF

-- Create UserCodeDraft table
CREATE TABLE IF NOT EXISTS "UserCodeDraft" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "problemId" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "UserCodeDraft_pkey" PRIMARY KEY ("id")
);

-- Create UserProblemSettings table
CREATE TABLE IF NOT EXISTS "UserProblemSettings" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "problemId" TEXT NOT NULL,
    "lastLanguage" TEXT,
    "lastAcceptedSubmissionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "UserProblemSettings_pkey" PRIMARY KEY ("id")
);

-- Create ProblemSubmission table
CREATE TABLE IF NOT EXISTS "ProblemSubmission" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "problemId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "runtime" DOUBLE PRECISION,
    "memory" DOUBLE PRECISION,
    "status" TEXT NOT NULL,
    "allPassed" BOOLEAN NOT NULL DEFAULT false,
    "testcasesPassed" INTEGER,
    "totalTestcases" INTEGER,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ProblemSubmission_pkey" PRIMARY KEY ("id")
);

-- Add foreign keys
ALTER TABLE IF NOT EXISTS "UserCodeDraft" 
ADD CONSTRAINT "UserCodeDraft_userId_fkey" 
FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE IF NOT EXISTS "UserProblemSettings" 
ADD CONSTRAINT "UserProblemSettings_userId_fkey" 
FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE IF NOT EXISTS "UserProblemSettings" 
ADD CONSTRAINT "UserProblemSettings_problemId_fkey" 
FOREIGN KEY ("problemId") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE IF NOT EXISTS "ProblemSubmission" 
ADD CONSTRAINT "ProblemSubmission_userId_fkey" 
FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE IF NOT EXISTS "ProblemSubmission" 
ADD CONSTRAINT "ProblemSubmission_problemId_fkey" 
FOREIGN KEY ("problemId") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;

EOF

# Mark the migrations as applied in _prisma_migrations table
echo "Marking migrations as applied..."
docker-compose exec -T db psql -U doadmin -d defaultdb -h nexacademy-do-user-16631038-0.k.db.ondigitalocean.com -p 25060 --set=sslmode=require << EOF

INSERT INTO "_prisma_migrations" (
  "id", "checksum", "finished_at", "migration_name", 
  "logs", "rolled_back_at", "started_at", "applied_steps_count"
)
VALUES 
  ('manual-fix-1', 'manual', NOW(), '20250430999998_create_user_problem_settings', 
   'Manually applied', NULL, NOW(), 1),
  ('manual-fix-2', 'manual', NOW(), '20250430999999_create_user_code_draft', 
   'Manually applied', NULL, NOW(), 1),
  ('manual-fix-3', 'manual', NOW(), '20250430999997_create_problem_submission', 
   'Manually applied', NULL, NOW(), 1)
ON CONFLICT DO NOTHING;

EOF

# Restart all services
echo "Starting all services..."
docker-compose up -d

# Follow the logs
echo "Following logs..."
docker-compose logs -f app 