-- First, update questions that are in subfolders to point to their correct folder
UPDATE "Question" q
SET "folderId" = f."id"
FROM "Folder" f
WHERE q."subfolderId" = f."id";

-- Remove the subfolderId column and its foreign key
ALTER TABLE "Question" DROP CONSTRAINT IF EXISTS "Question_subfolderId_fkey";
ALTER TABLE "Question" DROP COLUMN IF EXISTS "subfolderId";

-- Remove the subfolderQuestions relation from Folder
ALTER TABLE "Folder" DROP CONSTRAINT IF EXISTS "Folder_subfolderQuestions_fkey"; 