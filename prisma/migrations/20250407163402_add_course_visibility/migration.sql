/*
  Warnings:

  - You are about to drop the column `isActive` on the `Course` table. All the data in the column will be lost.
  - Made the column `subtitle` on table `Course` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Course" DROP COLUMN "isActive",
ADD COLUMN     "isVisible" BOOLEAN NOT NULL DEFAULT true,
ALTER COLUMN "subtitle" SET NOT NULL;
