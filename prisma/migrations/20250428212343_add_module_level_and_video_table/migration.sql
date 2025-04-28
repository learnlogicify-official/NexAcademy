/*
  Warnings:

  - You are about to drop the column `level` on the `Course` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Course" DROP COLUMN "level";

-- AlterTable
ALTER TABLE "Module" ADD COLUMN     "level" TEXT NOT NULL DEFAULT 'Beginner';

-- DropEnum
DROP TYPE "CourseLevel";

-- CreateTable
CREATE TABLE "Video" (
    "id" TEXT NOT NULL,
    "moduleId" TEXT NOT NULL,
    "vimeoUrl" TEXT NOT NULL,
    "title" TEXT,
    "order" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Video_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Video" ADD CONSTRAINT "Video_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "Module"("id") ON DELETE CASCADE ON UPDATE CASCADE;
