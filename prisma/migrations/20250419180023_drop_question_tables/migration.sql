/*
  Warnings:

  - You are about to drop the `CodingQuestion` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `MCQQuestion` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Question` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "CodingQuestion" DROP CONSTRAINT "CodingQuestion_questionId_fkey";

-- DropForeignKey
ALTER TABLE "MCQQuestion" DROP CONSTRAINT "MCQQuestion_questionId_fkey";

-- DropForeignKey
ALTER TABLE "Question" DROP CONSTRAINT "Question_folderId_fkey";

-- DropTable
DROP TABLE "CodingQuestion";

-- DropTable
DROP TABLE "MCQQuestion";

-- DropTable
DROP TABLE "Question";
