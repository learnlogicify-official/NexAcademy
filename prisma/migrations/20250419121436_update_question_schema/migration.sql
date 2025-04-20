/*
  Warnings:

  - You are about to drop the column `correctAnswer` on the `mcq_questions` table. All the data in the column will be lost.
  - Added the required column `name` to the `mcq_questions` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `options` on the `mcq_questions` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- Create folders table if it doesn't exist
CREATE TABLE IF NOT EXISTS "folders" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "parentId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "folders_pkey" PRIMARY KEY ("id")
);

-- Create a default folder if none exists
INSERT INTO "folders" ("id", "name", "updatedAt")
SELECT 
  'default',
  'Default Folder',
  CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "folders");

-- First, create a temporary table to store the existing data
CREATE TEMPORARY TABLE temp_mcq_questions AS
SELECT 
  "id",
  "content",
  "singleAnswer",
  "shuffleAnswers",
  "correctAnswer",
  "options"::text as old_options
FROM "mcq_questions";

-- Drop the existing table
DROP TABLE "mcq_questions";

-- Create the new table with updated schema
CREATE TABLE "mcq_questions" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "content" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'DRAFT',
  "defaultMark" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
  "generalFeedback" TEXT,
  "singleAnswer" BOOLEAN NOT NULL DEFAULT false,
  "shuffleAnswers" BOOLEAN NOT NULL DEFAULT false,
  "choiceNumbering" TEXT NOT NULL DEFAULT 'none',
  "options" JSONB NOT NULL,
  "tags" TEXT[],
  "difficulty" TEXT NOT NULL DEFAULT 'MEDIUM',
  "questionId" TEXT NOT NULL,
  CONSTRAINT "mcq_questions_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "mcq_questions_questionId_key" UNIQUE ("questionId")
);

-- Create parent questions for existing MCQ questions
INSERT INTO "questions" ("id", "type", "folderId", "hidden", "marks", "status")
SELECT 
  temp."id",
  'MCQ',
  'default', -- Use the default folder
  false,
  1,
  'DRAFT'
FROM temp_mcq_questions temp
WHERE NOT EXISTS (
  SELECT 1 FROM "questions" q WHERE q."id" = temp."id"
);

-- Copy data from temporary table to new table
INSERT INTO "mcq_questions" (
  "id",
  "name",
  "content",
  "status",
  "defaultMark",
  "generalFeedback",
  "singleAnswer",
  "shuffleAnswers",
  "choiceNumbering",
  "options",
  "tags",
  "difficulty",
  "questionId"
)
SELECT 
  "id",
  "content" as "name", -- Use content as name for existing records
  "content",
  'DRAFT' as "status",
  1.0 as "defaultMark",
  NULL as "generalFeedback",
  "singleAnswer",
  "shuffleAnswers",
  'none' as "choiceNumbering",
  jsonb_build_array(
    jsonb_build_object(
      'content', old_options,
      'grade', CASE WHEN "correctAnswer" = old_options THEN 100 ELSE 0 END
    )
  ) as "options",
  ARRAY[]::text[] as "tags",
  'MEDIUM' as "difficulty",
  "id" as "questionId"
FROM temp_mcq_questions;

-- Drop the temporary table
DROP TABLE temp_mcq_questions;

-- Add foreign key constraints
ALTER TABLE "mcq_questions" ADD CONSTRAINT "mcq_questions_questionId_fkey" 
FOREIGN KEY ("questionId") REFERENCES "questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "folders" ADD CONSTRAINT "folders_parentId_fkey"
FOREIGN KEY ("parentId") REFERENCES "folders"("id") ON DELETE SET NULL ON UPDATE CASCADE;
