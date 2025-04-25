/*
  Warnings:

  - You are about to drop the column `attempts_allowed` on the `Assessment` table. All the data in the column will be lost.
  - You are about to drop the column `disable_copy_paste` on the `Assessment` table. All the data in the column will be lost.
  - You are about to drop the column `disable_right_click` on the `Assessment` table. All the data in the column will be lost.
  - You are about to drop the column `display_description` on the `Assessment` table. All the data in the column will be lost.
  - You are about to drop the column `grade_to_pass` on the `Assessment` table. All the data in the column will be lost.
  - You are about to drop the column `navigation_method` on the `Assessment` table. All the data in the column will be lost.
  - You are about to drop the column `question_behaviour_mode` on the `Assessment` table. All the data in the column will be lost.
  - You are about to drop the column `review_after_close` on the `Assessment` table. All the data in the column will be lost.
  - You are about to drop the column `review_during_attempt` on the `Assessment` table. All the data in the column will be lost.
  - You are about to drop the column `review_immediately_after_attempt` on the `Assessment` table. All the data in the column will be lost.
  - You are about to drop the column `review_later_while_open` on the `Assessment` table. All the data in the column will be lost.
  - You are about to drop the column `shuffle_within_questions` on the `Assessment` table. All the data in the column will be lost.
  - You are about to drop the column `time_bound_enabled` on the `Assessment` table. All the data in the column will be lost.
  - You are about to drop the column `time_limit_enabled` on the `Assessment` table. All the data in the column will be lost.
  - You are about to drop the column `unlimited_attempts` on the `Assessment` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Assessment" DROP COLUMN "attempts_allowed",
DROP COLUMN "disable_copy_paste",
DROP COLUMN "disable_right_click",
DROP COLUMN "display_description",
DROP COLUMN "grade_to_pass",
DROP COLUMN "navigation_method",
DROP COLUMN "question_behaviour_mode",
DROP COLUMN "review_after_close",
DROP COLUMN "review_during_attempt",
DROP COLUMN "review_immediately_after_attempt",
DROP COLUMN "review_later_while_open",
DROP COLUMN "shuffle_within_questions",
DROP COLUMN "time_bound_enabled",
DROP COLUMN "time_limit_enabled",
DROP COLUMN "unlimited_attempts",
ADD COLUMN     "attemptsAllowed" INTEGER,
ADD COLUMN     "disableCopyPaste" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "disableRightClick" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "displayDescription" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "gradeToPass" DOUBLE PRECISION,
ADD COLUMN     "navigationMethod" TEXT NOT NULL DEFAULT 'free',
ADD COLUMN     "questionBehaviourMode" TEXT NOT NULL DEFAULT 'deferredfeedback',
ADD COLUMN     "reviewAfterClose" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "reviewDuringAttempt" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "reviewImmediatelyAfterAttempt" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "reviewLaterWhileOpen" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "shuffleWithinQuestions" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "timeBoundEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "timeLimitEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "unlimitedAttempts" BOOLEAN NOT NULL DEFAULT false;
