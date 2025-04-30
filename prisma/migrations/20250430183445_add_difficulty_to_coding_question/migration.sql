-- AlterTable
ALTER TABLE "CodingQuestion" ADD COLUMN     "difficulty" "QuestionDifficulty" NOT NULL DEFAULT 'MEDIUM',
ADD COLUMN     "isAllOrNothing" BOOLEAN NOT NULL DEFAULT false;
