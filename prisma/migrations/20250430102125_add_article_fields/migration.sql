-- CreateEnum
CREATE TYPE "ArticleStatus" AS ENUM ('DRAFT', 'PUBLISHED');

-- AlterTable
ALTER TABLE "Article" ADD COLUMN     "readingTime" INTEGER,
ADD COLUMN     "status" "ArticleStatus" NOT NULL DEFAULT 'DRAFT',
ADD COLUMN     "summary" TEXT,
ADD COLUMN     "tags" TEXT[] DEFAULT ARRAY[]::TEXT[];
