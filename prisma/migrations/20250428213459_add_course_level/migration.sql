/*
  Warnings:

  - You are about to drop the column `level` on the `Module` table. All the data in the column will be lost.
  - You are about to drop the `Video` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "CourseLevel" AS ENUM ('Beginner', 'Intermediate', 'Advanced');

-- DropForeignKey
ALTER TABLE "Video" DROP CONSTRAINT "Video_moduleId_fkey";

-- AlterTable
ALTER TABLE "Course" ADD COLUMN     "level" "CourseLevel" NOT NULL DEFAULT 'Beginner';

-- AlterTable
ALTER TABLE "Module" DROP COLUMN "level",
ADD COLUMN     "vimeoUrl" TEXT;

-- DropTable
DROP TABLE "Video";
