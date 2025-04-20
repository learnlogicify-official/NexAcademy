-- This is an empty migration.

-- AlterTable
ALTER TABLE "Question" ADD COLUMN "creatorId" TEXT NOT NULL DEFAULT 'system',
ADD COLUMN "creatorName" TEXT NOT NULL DEFAULT 'System',
ADD COLUMN "lastModifiedBy" TEXT NOT NULL DEFAULT 'system',
ADD COLUMN "lastModifiedByName" TEXT NOT NULL DEFAULT 'System';

-- CreateIndex
CREATE INDEX "Question_creatorId_idx" ON "Question"("creatorId");