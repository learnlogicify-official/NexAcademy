-- AlterTable
ALTER TABLE "Module" ADD COLUMN     "learningObjectives" TEXT[] DEFAULT ARRAY[]::TEXT[];
