/*
  Warnings:

  - Changed the type of `language` on the `LanguageOption` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropIndex
DROP INDEX "LanguageOption_codingQuestionId_idx";

-- Add a temporary column
ALTER TABLE "LanguageOption" ADD COLUMN "language_new" TEXT;

-- Copy data from the old enum column to the new text column
UPDATE "LanguageOption" SET "language_new" = "language"::TEXT;

-- Make the new column non-nullable after data is copied
ALTER TABLE "LanguageOption" ALTER COLUMN "language_new" SET NOT NULL;

-- Drop the old column
ALTER TABLE "LanguageOption" DROP COLUMN "language";

-- Rename the new column to the original name
ALTER TABLE "LanguageOption" RENAME COLUMN "language_new" TO "language";

-- Make codingQuestionId nullable
ALTER TABLE "LanguageOption" ALTER COLUMN "codingQuestionId" DROP NOT NULL;
