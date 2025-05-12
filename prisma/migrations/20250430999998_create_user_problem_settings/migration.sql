-- CreateTable
CREATE TABLE "UserProblemSettings" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "problemId" TEXT NOT NULL,
    "lastLanguage" TEXT,
    "lastAcceptedSubmissionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserProblemSettings_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "UserProblemSettings" ADD CONSTRAINT "UserProblemSettings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserProblemSettings" ADD CONSTRAINT "UserProblemSettings_problemId_fkey" FOREIGN KEY ("problemId") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE; 