-- Add missing indexes to improve query performance

-- Add indexes to MCQQuestion table
CREATE INDEX "MCQQuestion_questionId_idx" ON "MCQQuestion"("questionId");

-- Add indexes to CodingQuestion table
CREATE INDEX "CodingQuestion_questionId_idx" ON "CodingQuestion"("questionId");

-- Add indexes to LanguageOption table
CREATE INDEX "LanguageOption_codingQuestionId_idx" ON "LanguageOption"("codingQuestionId");
CREATE INDEX "LanguageOption_language_idx" ON "LanguageOption"("language");

-- Add indexes to Attempt table
CREATE INDEX "Attempt_userId_idx" ON "Attempt"("userId");
CREATE INDEX "Attempt_assessmentId_idx" ON "Attempt"("assessmentId");
CREATE INDEX "Attempt_status_idx" ON "Attempt"("status");

-- Add indexes to Assessment table
CREATE INDEX "Assessment_status_idx" ON "Assessment"("status");

-- Add indexes to Tag table
CREATE INDEX "Tag_name_idx" ON "Tag"("name");

-- Add indexes to AssessmentTag table
CREATE INDEX "AssessmentTag_assessmentId_idx" ON "AssessmentTag"("assessmentId");
CREATE INDEX "AssessmentTag_tagId_idx" ON "AssessmentTag"("tagId");

-- Add indexes to UserCodeDraft table
CREATE INDEX "UserCodeDraft_userId_idx" ON "UserCodeDraft"("userId");
CREATE INDEX "UserCodeDraft_problemId_idx" ON "UserCodeDraft"("problemId");
CREATE INDEX "UserCodeDraft_language_idx" ON "UserCodeDraft"("language");

-- Add indexes to UserProblemSettings table
CREATE INDEX "UserProblemSettings_userId_idx" ON "UserProblemSettings"("userId");
CREATE INDEX "UserProblemSettings_problemId_idx" ON "UserProblemSettings"("problemId");
CREATE INDEX "UserProblemSettings_lastAcceptedSubmissionId_idx" ON "UserProblemSettings"("lastAcceptedSubmissionId");

-- Add composite indexes for common query patterns
CREATE INDEX "Video_moduleId_order_idx" ON "Video"("moduleId", "order");
CREATE INDEX "Article_moduleId_order_idx" ON "Article"("moduleId", "order");
CREATE INDEX "Section_assessmentId_order_idx" ON "Section"("assessmentId", "order");
CREATE INDEX "SectionQuestion_sectionId_order_idx" ON "SectionQuestion"("sectionId", "order");
CREATE INDEX "Module_courseId_order_idx" ON "Module"("courseId", "order");
CREATE INDEX "Submodule_moduleId_order_idx" ON "Submodule"("moduleId", "order");

-- Add indexes for timestamp columns that are frequently used in queries
CREATE INDEX "ProblemSubmission_submittedAt_idx" ON "ProblemSubmission"("submittedAt");
CREATE INDEX "Enrollment_enrolledAt_idx" ON "Enrollment"("enrolledAt");
CREATE INDEX "Attempt_startedAt_idx" ON "Attempt"("startedAt");
CREATE INDEX "Attempt_endedAt_idx" ON "Attempt"("endedAt");