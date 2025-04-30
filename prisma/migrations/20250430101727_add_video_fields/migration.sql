-- CreateEnum
CREATE TYPE "VideoStatus" AS ENUM ('DRAFT', 'PUBLISHED');

-- AlterTable
ALTER TABLE "Video" ADD COLUMN     "description" TEXT,
ADD COLUMN     "duration" INTEGER,
ADD COLUMN     "status" "VideoStatus" NOT NULL DEFAULT 'DRAFT',
ADD COLUMN     "thumbnailUrl" TEXT;
