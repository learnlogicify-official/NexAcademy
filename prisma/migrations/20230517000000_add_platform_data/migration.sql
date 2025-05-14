-- AlterTable
-- Add PlatformData model to store profile data from various coding platforms
-- This table will store cached data from platforms like LeetCode, HackerRank, HackerEarth,
-- CodeChef, Codeforces, etc. to avoid repeated API calls and improve performance.
-- The data column is a JSON field that can store any platform-specific structure.

-- CreateTable
CREATE TABLE "PlatformData" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlatformData_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PlatformData_userId_platform_idx" ON "PlatformData"("userId", "platform");

-- CreateIndex
CREATE INDEX "PlatformData_userId_idx" ON "PlatformData"("userId");

-- CreateIndex
CREATE INDEX "PlatformData_platform_idx" ON "PlatformData"("platform");

-- AddForeignKey
ALTER TABLE "PlatformData" ADD CONSTRAINT "PlatformData_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE; 