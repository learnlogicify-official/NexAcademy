-- CreateEnum
CREATE TYPE "Visibility" AS ENUM ('SHOW', 'HIDE');

-- DropIndex
DROP INDEX "Category_isActive_idx";

-- AlterTable
ALTER TABLE "Category" ADD COLUMN     "visibility" "Visibility" NOT NULL DEFAULT 'SHOW';

-- CreateTable
CREATE TABLE "Course" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Course_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Course_categoryId_idx" ON "Course"("categoryId");

-- AddForeignKey
ALTER TABLE "Course" ADD CONSTRAINT "Course_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
