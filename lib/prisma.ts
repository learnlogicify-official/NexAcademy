import { PrismaClient } from '@prisma/client'

interface ExistsResult {
  exists: boolean;
}

// Add fields directly to the prisma instance
const prismaClientSingleton = () => {
  const prisma = new PrismaClient()
  
  // Check if tables exist and add to client if they don't already exist
  // This is a temporary workaround until the models are properly migrated
  prisma.$connect()
    .then(() => {
      // Check if ProblemSubmission table exists
      return prisma.$queryRaw<ExistsResult[]>`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public'
          AND table_name = 'ProblemSubmission'
        );
      `
    })
    .then((result) => {
      const exists = (result && result[0]?.exists) || false
      
      if (!exists) {
        // Create the table manually if it doesn't exist
        return prisma.$executeRaw`
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
            
            CONSTRAINT "ProblemSubmission_pkey" PRIMARY KEY ("id"),
            CONSTRAINT "ProblemSubmission_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE
          );
          
          CREATE INDEX "ProblemSubmission_userId_idx" ON "ProblemSubmission"("userId");
          CREATE INDEX "ProblemSubmission_problemId_idx" ON "ProblemSubmission"("problemId");
          CREATE INDEX "ProblemSubmission_allPassed_idx" ON "ProblemSubmission"("allPassed");
        `.then(() => Promise.resolve())
      }
      
      return Promise.resolve()
    })
    .then(() => {
      // Check if UserProblemSettings table has lastAcceptedSubmissionId column
      return prisma.$queryRaw<ExistsResult[]>`
        SELECT EXISTS (
          SELECT FROM information_schema.columns 
          WHERE table_schema = 'public'
          AND table_name = 'UserProblemSettings'
          AND column_name = 'lastAcceptedSubmissionId'
        );
      `
    })
    .then((result) => {
      const exists = (result && result[0]?.exists) || false
      
      if (!exists) {
        try {
          // First check if the UserProblemSettings table exists
          return prisma.$queryRaw<ExistsResult[]>`
            SELECT EXISTS (
              SELECT FROM information_schema.tables 
              WHERE table_schema = 'public'
              AND table_name = 'UserProblemSettings'
            );
          `.then((tableExists) => {
            const hasTable = (tableExists && tableExists[0]?.exists) || false
            
            if (!hasTable) {
              return Promise.resolve()
            }
            
            // Add the column if the table exists
            return prisma.$executeRaw`
              ALTER TABLE "UserProblemSettings"
              ADD COLUMN IF NOT EXISTS "lastAcceptedSubmissionId" TEXT;
              
              ALTER TABLE "UserProblemSettings"
              DROP CONSTRAINT IF EXISTS "UserProblemSettings_lastAcceptedSubmissionId_fkey";
              
              ALTER TABLE "UserProblemSettings"
              ADD CONSTRAINT "UserProblemSettings_lastAcceptedSubmissionId_fkey" 
              FOREIGN KEY ("lastAcceptedSubmissionId") 
              REFERENCES "ProblemSubmission"("id") ON DELETE SET NULL ON UPDATE CASCADE;
            `.then(() => Promise.resolve())
          })
        } catch (error) {
          return Promise.resolve()
        }
      }
      
      return Promise.resolve()
    })
    .then(() => {
      // Check if hideAcceptedTab column exists
      return prisma.$queryRaw<ExistsResult[]>`
        SELECT EXISTS (
          SELECT FROM information_schema.columns 
          WHERE table_schema = 'public'
          AND table_name = 'UserProblemSettings'
          AND column_name = 'hideAcceptedTab'
        );
      `
    })
    .then((result) => {
      const exists = (result && result[0]?.exists) || false
      if (!exists) {
        return prisma.$executeRaw`
          ALTER TABLE "UserProblemSettings"
          ADD COLUMN IF NOT EXISTS "hideAcceptedTab" BOOLEAN DEFAULT false;
        `.then(() => Promise.resolve())
      }
      return Promise.resolve()
    })
    .catch((error) => {
      console.error("[PRISMA] Error setting up database:", error)
    })
  
  return prisma
}

// Define a global type for the PrismaClient with our extended models
declare global {
  var prisma: undefined | ReturnType<typeof prismaClientSingleton>
}

// Use the global var to store the client singleton
const prisma = globalThis.prisma ?? prismaClientSingleton()

// In development, reset the client on every file change to avoid duplicate connections
if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = prisma
}

export { prisma } 