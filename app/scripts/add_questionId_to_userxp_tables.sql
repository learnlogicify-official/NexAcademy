-- Add questionId column to UserXPEvent table if it doesn't exist
DO
$$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'UserXPEvent'
    AND column_name = 'questionId'
  ) THEN
    ALTER TABLE "UserXPEvent" ADD COLUMN "questionId" TEXT;
    CREATE INDEX "UserXPEvent_questionId_idx" ON "UserXPEvent" ("questionId");
    CREATE INDEX "UserXPEvent_userId_questionId_eventType_idx" ON "UserXPEvent" ("userId", "questionId", "eventType");
  END IF;
END
$$; 