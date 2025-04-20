/*
  Warnings:

  - Changed the type of `difficulty` on the `MCQQuestion` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropForeignKey
ALTER TABLE "MCQQuestion" DROP CONSTRAINT "MCQQuestion_questionId_fkey";

-- DropIndex
DROP INDEX "MCQQuestion_questionId_idx";

-- AlterTable
ALTER TABLE "MCQQuestion" ADD COLUMN     "generalFeedback" TEXT,
DROP COLUMN "difficulty",
ADD COLUMN     "difficulty" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "MCQQuestion" ADD CONSTRAINT "MCQQuestion_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
