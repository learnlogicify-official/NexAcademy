-- Add missing indexes to improve query performance

-- Function to safely create an index if the table exists
CREATE OR REPLACE FUNCTION create_index_if_table_exists(
    p_table_name text,
    p_index_name text,
    p_column_expression text
) RETURNS void AS $$
DECLARE
    table_exists boolean;
    index_exists boolean;
BEGIN
    -- Check if table exists
    SELECT EXISTS(
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = p_table_name
    ) INTO table_exists;
    
    -- If table exists, check if index exists and create it if not
    IF table_exists THEN
        SELECT EXISTS(
            SELECT 1 FROM pg_indexes 
            WHERE schemaname = 'public' AND indexname = p_index_name
        ) INTO index_exists;
        
        IF NOT index_exists THEN
            EXECUTE format('CREATE INDEX %I ON %I(%s)', 
                          p_index_name, 
                          p_table_name, 
                          p_column_expression);
        END IF;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Add indexes to tables if they exist
SELECT create_index_if_table_exists('MCQQuestion', 'MCQQuestion_questionId_idx', '"questionId"');
SELECT create_index_if_table_exists('CodingQuestion', 'CodingQuestion_questionId_idx', '"questionId"');
SELECT create_index_if_table_exists('LanguageOption', 'LanguageOption_codingQuestionId_idx', '"codingQuestionId"');
SELECT create_index_if_table_exists('LanguageOption', 'LanguageOption_language_idx', '"language"');
SELECT create_index_if_table_exists('Attempt', 'Attempt_userId_idx', '"userId"');
SELECT create_index_if_table_exists('Attempt', 'Attempt_assessmentId_idx', '"assessmentId"');
SELECT create_index_if_table_exists('Attempt', 'Attempt_status_idx', '"status"');
SELECT create_index_if_table_exists('Assessment', 'Assessment_status_idx', '"status"');
SELECT create_index_if_table_exists('Tag', 'Tag_name_idx', '"name"');
SELECT create_index_if_table_exists('AssessmentTag', 'AssessmentTag_assessmentId_idx', '"assessmentId"');
SELECT create_index_if_table_exists('AssessmentTag', 'AssessmentTag_tagId_idx', '"tagId"');
SELECT create_index_if_table_exists('UserCodeDraft', 'UserCodeDraft_userId_idx', '"userId"');
SELECT create_index_if_table_exists('UserCodeDraft', 'UserCodeDraft_problemId_idx', '"problemId"');
SELECT create_index_if_table_exists('UserCodeDraft', 'UserCodeDraft_language_idx', '"language"');
SELECT create_index_if_table_exists('UserProblemSettings', 'UserProblemSettings_userId_idx', '"userId"');
SELECT create_index_if_table_exists('UserProblemSettings', 'UserProblemSettings_problemId_idx', '"problemId"');
SELECT create_index_if_table_exists('UserProblemSettings', 'UserProblemSettings_lastAcceptedSubmissionId_idx', '"lastAcceptedSubmissionId"');

-- Create composite indexes for common query patterns
DO $$
DECLARE
    table_exists boolean;
    index_exists boolean;
BEGIN
    -- Video module+order composite index
    SELECT EXISTS(SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'Video') INTO table_exists;
    IF table_exists THEN
        SELECT EXISTS(SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'Video_moduleId_order_idx') INTO index_exists;
        IF NOT index_exists THEN
            CREATE INDEX "Video_moduleId_order_idx" ON "Video"("moduleId", "order");
        END IF;
    END IF;
    
    -- Article module+order composite index
    SELECT EXISTS(SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'Article') INTO table_exists;
    IF table_exists THEN
        SELECT EXISTS(SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'Article_moduleId_order_idx') INTO index_exists;
        IF NOT index_exists THEN
            CREATE INDEX "Article_moduleId_order_idx" ON "Article"("moduleId", "order");
        END IF;
    END IF;
    
    -- Section assessment+order composite index
    SELECT EXISTS(SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'Section') INTO table_exists;
    IF table_exists THEN
        SELECT EXISTS(SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'Section_assessmentId_order_idx') INTO index_exists;
        IF NOT index_exists THEN
            CREATE INDEX "Section_assessmentId_order_idx" ON "Section"("assessmentId", "order");
        END IF;
    END IF;
    
    -- SectionQuestion section+order composite index
    SELECT EXISTS(SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'SectionQuestion') INTO table_exists;
    IF table_exists THEN
        SELECT EXISTS(SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'SectionQuestion_sectionId_order_idx') INTO index_exists;
        IF NOT index_exists THEN
            CREATE INDEX "SectionQuestion_sectionId_order_idx" ON "SectionQuestion"("sectionId", "order");
        END IF;
    END IF;
    
    -- Module course+order composite index
    SELECT EXISTS(SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'Module') INTO table_exists;
    IF table_exists THEN
        SELECT EXISTS(SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'Module_courseId_order_idx') INTO index_exists;
        IF NOT index_exists THEN
            CREATE INDEX "Module_courseId_order_idx" ON "Module"("courseId", "order");
        END IF;
    END IF;
    
    -- Submodule module+order composite index
    SELECT EXISTS(SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'Submodule') INTO table_exists;
    IF table_exists THEN
        SELECT EXISTS(SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'Submodule_moduleId_order_idx') INTO index_exists;
        IF NOT index_exists THEN
            CREATE INDEX "Submodule_moduleId_order_idx" ON "Submodule"("moduleId", "order");
        END IF;
    END IF;
    
    -- Timestamp indexes
    SELECT EXISTS(SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'ProblemSubmission') INTO table_exists;
    IF table_exists THEN
        SELECT EXISTS(SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'ProblemSubmission_submittedAt_idx') INTO index_exists;
        IF NOT index_exists THEN
            CREATE INDEX "ProblemSubmission_submittedAt_idx" ON "ProblemSubmission"("submittedAt");
        END IF;
    END IF;
    
    SELECT EXISTS(SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'Enrollment') INTO table_exists;
    IF table_exists THEN
        SELECT EXISTS(SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'Enrollment_enrolledAt_idx') INTO index_exists;
        IF NOT index_exists THEN
            CREATE INDEX "Enrollment_enrolledAt_idx" ON "Enrollment"("enrolledAt");
        END IF;
    END IF;
    
    SELECT EXISTS(SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'Attempt') INTO table_exists;
    IF table_exists THEN
        SELECT EXISTS(SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'Attempt_startedAt_idx') INTO index_exists;
        IF NOT index_exists THEN
            CREATE INDEX "Attempt_startedAt_idx" ON "Attempt"("startedAt");
        END IF;
        
        SELECT EXISTS(SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'Attempt_endedAt_idx') INTO index_exists;
        IF NOT index_exists THEN
            CREATE INDEX "Attempt_endedAt_idx" ON "Attempt"("endedAt");
        END IF;
    END IF;
END
$$;