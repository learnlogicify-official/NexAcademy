-- Migration: Add bannerImage field to User table

ALTER TABLE "User"
ADD COLUMN "bannerImage" TEXT; 