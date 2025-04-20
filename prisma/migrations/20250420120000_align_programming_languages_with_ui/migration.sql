-- Step 1: Create a temporary text column
ALTER TABLE "LanguageOption" ADD COLUMN "temp_language" TEXT;

-- Step 2: Copy language values to text column (converting enum to text)
UPDATE "LanguageOption" SET "temp_language" = "language"::TEXT;

-- Step 3: Drop the current enum column
ALTER TABLE "LanguageOption" DROP COLUMN "language";

-- Step 4: Drop and recreate enum with UI-supported values
DROP TYPE "ProgrammingLanguage";

CREATE TYPE "ProgrammingLanguage" AS ENUM (
  'PYTHON',
  'JAVASCRIPT',
  'JAVA',
  'CPP',
  'CSHARP',
  'PHP',
  'RUBY',
  'SWIFT',
  'GO',
  'RUST'
);

-- Step 5: Add new language column with correct enum type
ALTER TABLE "LanguageOption" ADD COLUMN "language" "ProgrammingLanguage" NOT NULL DEFAULT 'PYTHON';

-- Step 6: Map old values to new values
UPDATE "LanguageOption" SET "language" = 
  CASE 
    WHEN "temp_language" = 'PYTHON2' THEN 'PYTHON'::"ProgrammingLanguage"
    WHEN "temp_language" = 'PYTHON3' THEN 'PYTHON'::"ProgrammingLanguage"
    WHEN "temp_language" = 'C' THEN 'CPP'::"ProgrammingLanguage"
    WHEN "temp_language" = 'JAVASCRIPT' THEN 'JAVASCRIPT'::"ProgrammingLanguage"
    WHEN "temp_language" = 'JAVA' THEN 'JAVA'::"ProgrammingLanguage"
    WHEN "temp_language" = 'CPP' THEN 'CPP'::"ProgrammingLanguage"
    WHEN "temp_language" = 'GO' THEN 'GO'::"ProgrammingLanguage"
    WHEN "temp_language" = 'RUBY' THEN 'RUBY'::"ProgrammingLanguage"
    ELSE 'PYTHON'::"ProgrammingLanguage"
  END;

-- Step 7: Drop temporary column
ALTER TABLE "LanguageOption" DROP COLUMN "temp_language"; 