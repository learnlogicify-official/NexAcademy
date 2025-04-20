/*
  Warnings:

  - Made the column `solution` on table `LanguageOption` required. This step will fail if there are existing NULL values in that column.
*/

-- DropForeignKey
ALTER TABLE "CodingQuestion" DROP CONSTRAINT "CodingQuestion_questionId_fkey";

-- DropIndex
DROP INDEX "CodingQuestion_questionId_idx";

-- AlterTable
ALTER TABLE "LanguageOption" ALTER COLUMN "solution" SET NOT NULL;

-- AlterTable
ALTER TABLE "MCQQuestion" ALTER COLUMN "tags" SET DEFAULT ARRAY[]::TEXT[],
ADD COLUMN "difficulty_new" "QuestionDifficulty" NOT NULL DEFAULT 'MEDIUM';

-- Update the new difficulty column based on existing values
UPDATE "MCQQuestion" SET "difficulty_new" = 
  CASE 
    WHEN "difficulty" = 'EASY' THEN 'EASY'::"QuestionDifficulty"
    WHEN "difficulty" = 'MEDIUM' THEN 'MEDIUM'::"QuestionDifficulty"
    WHEN "difficulty" = 'HARD' THEN 'HARD'::"QuestionDifficulty"
    ELSE 'MEDIUM'::"QuestionDifficulty"
  END;

-- Drop the old difficulty column
ALTER TABLE "MCQQuestion" DROP COLUMN "difficulty";

-- Rename the new column to difficulty
ALTER TABLE "MCQQuestion" RENAME COLUMN "difficulty_new" TO "difficulty";

-- AlterTable
ALTER TABLE "Question" ADD COLUMN "version" INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE "TestCase" ALTER COLUMN "showOnFailure" SET DEFAULT false;

-- CreateTable
CREATE TABLE "QuestionVersion" (
    "id" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "type" "QuestionType" NOT NULL,
    "status" "QuestionStatus" NOT NULL,
    "content" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "QuestionVersion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "QuestionVersion_questionId_idx" ON "QuestionVersion"("questionId");

-- CreateIndex
CREATE UNIQUE INDEX "QuestionVersion_questionId_version_key" ON "QuestionVersion"("questionId", "version");

-- AddForeignKey
ALTER TABLE "QuestionVersion" ADD CONSTRAINT "QuestionVersion_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CodingQuestion" ADD CONSTRAINT "CodingQuestion_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
