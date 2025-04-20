/*
  Warnings:

  - You are about to drop the column `expectedOutput` on the `Question` table. All the data in the column will be lost.
  - You are about to drop the column `testCases` on the `Question` table. All the data in the column will be lost.
  - You are about to drop the column `testId` on the `Question` table. All the data in the column will be lost.
  - You are about to drop the `Test` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Question" DROP CONSTRAINT "Question_testId_fkey";

-- DropForeignKey
ALTER TABLE "Test" DROP CONSTRAINT "Test_folderId_fkey";

-- DropIndex
DROP INDEX "Question_folderId_idx";

-- DropIndex
DROP INDEX "Question_testId_idx";

-- AlterTable
ALTER TABLE "Question" DROP COLUMN "expectedOutput",
DROP COLUMN "testCases",
DROP COLUMN "testId";

-- DropTable
DROP TABLE "Test";
