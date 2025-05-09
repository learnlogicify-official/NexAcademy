-- Add composite indexes for common query patterns based on schema analysis

-- Function to safely create a composite index if the table exists
CREATE OR REPLACE FUNCTION create_composite_index_if_table_exists(
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

-- Create all composite indexes conditionally
SELECT create_composite_index_if_table_exists('User', 'User_role_createdAt_idx', '"role", "createdAt"');
SELECT create_composite_index_if_table_exists('Enrollment', 'Enrollment_userId_status_idx', '"userId", "status"');
SELECT create_composite_index_if_table_exists('Enrollment', 'Enrollment_courseId_status_idx', '"courseId", "status"');
SELECT create_composite_index_if_table_exists('Assessment', 'Assessment_status_startDate_idx', '"status", "startDate"');
SELECT create_composite_index_if_table_exists('Assessment', 'Assessment_status_endDate_idx', '"status", "endDate"');
SELECT create_composite_index_if_table_exists('Assessment', 'Assessment_folderId_status_idx', '"folderId", "status"');
SELECT create_composite_index_if_table_exists('Attempt', 'Attempt_userId_status_idx', '"userId", "status"');
SELECT create_composite_index_if_table_exists('Attempt', 'Attempt_assessmentId_status_idx', '"assessmentId", "status"');
SELECT create_composite_index_if_table_exists('Attempt', 'Attempt_userId_assessmentId_idx', '"userId", "assessmentId"');
SELECT create_composite_index_if_table_exists('Attempt', 'Attempt_userId_startedAt_idx', '"userId", "startedAt"');
SELECT create_composite_index_if_table_exists('Question', 'Question_type_status_idx', '"type", "status"');
SELECT create_composite_index_if_table_exists('Question', 'Question_folderId_type_idx', '"folderId", "type"');
SELECT create_composite_index_if_table_exists('Question', 'Question_folderId_status_idx', '"folderId", "status"');
SELECT create_composite_index_if_table_exists('CodingQuestion', 'CodingQuestion_difficulty_idx', '"difficulty"');
SELECT create_composite_index_if_table_exists('ProblemSubmission', 'ProblemSubmission_userId_problemId_idx', '"userId", "problemId"');
SELECT create_composite_index_if_table_exists('ProblemSubmission', 'ProblemSubmission_userId_allPassed_idx', '"userId", "allPassed"');
SELECT create_composite_index_if_table_exists('ProblemSubmission', 'ProblemSubmission_problemId_allPassed_idx', '"problemId", "allPassed"');
SELECT create_composite_index_if_table_exists('ProblemSubmission', 'ProblemSubmission_userId_submittedAt_idx', '"userId", "submittedAt"');
SELECT create_composite_index_if_table_exists('Course', 'Course_categoryId_level_idx', '"categoryId", "level"');
SELECT create_composite_index_if_table_exists('Course', 'Course_categoryId_startDate_idx', '"categoryId", "startDate"');
SELECT create_composite_index_if_table_exists('UserCodeDraft', 'UserCodeDraft_userId_updatedAt_idx', '"userId", "updatedAt"');
SELECT create_composite_index_if_table_exists('AssessmentTag', 'AssessmentTag_assessmentId_tagId_idx', '"assessmentId", "tagId"');