-- Create UserXP table
CREATE TABLE IF NOT EXISTS "UserXP" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "xp" INTEGER NOT NULL DEFAULT 0,
  "level" INTEGER NOT NULL DEFAULT 1,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT "UserXP_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "UserXP_userId_key" UNIQUE ("userId"),
  CONSTRAINT "UserXP_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Create indexes for UserXP
CREATE INDEX IF NOT EXISTS "UserXP_userId_idx" ON "UserXP"("userId");
CREATE INDEX IF NOT EXISTS "UserXP_xp_idx" ON "UserXP"("xp");

-- Create UserXPEvent table
CREATE TABLE IF NOT EXISTS "UserXPEvent" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "questionId" TEXT,
  "eventType" TEXT NOT NULL,
  "description" TEXT,
  "awardedXP" INTEGER NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT "UserXPEvent_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "UserXPEvent_user_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Create indexes for UserXPEvent
CREATE INDEX IF NOT EXISTS "UserXPEvent_userId_idx" ON "UserXPEvent"("userId");
CREATE INDEX IF NOT EXISTS "UserXPEvent_questionId_idx" ON "UserXPEvent"("questionId");
CREATE INDEX IF NOT EXISTS "UserXPEvent_eventType_idx" ON "UserXPEvent"("eventType");
CREATE INDEX IF NOT EXISTS "UserXPEvent_createdAt_idx" ON "UserXPEvent"("createdAt");
CREATE INDEX IF NOT EXISTS "UserXPEvent_userId_questionId_eventType_idx" ON "UserXPEvent"("userId", "questionId", "eventType");

-- Add update trigger to update updatedAt
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW."updatedAt" = NOW();
   RETURN NEW;
END;
$$ language 'plpgsql';

CREATE OR REPLACE TRIGGER update_user_xp_updated_at
BEFORE UPDATE ON "UserXP"
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column(); 