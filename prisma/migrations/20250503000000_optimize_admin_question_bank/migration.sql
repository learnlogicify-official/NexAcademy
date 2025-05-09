-- Optimize admin question bank performance with additional indexes

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

-- Add specific indexes for admin question bank optimization

-- Add index on Question.updatedAt to improve sorting by last updated
SELECT create_index_if_table_exists('Question', 'Question_updatedAt_idx', '"updatedAt"');

-- Add index on Question.createdAt to improve sorting by creation date
SELECT create_index_if_table_exists('Question', 'Question_createdAt_idx', '"createdAt"');

-- Add composite index for Question type and updatedAt (common admin filter + sort)
SELECT create_composite_index_if_table_exists('Question', 'Question_type_updatedAt_idx', '"type", "updatedAt"');

-- Add composite index for CodingQuestion questionId and updatedAt
SELECT create_composite_index_if_table_exists('CodingQuestion', 'CodingQuestion_questionId_updatedAt_idx', '"questionId", "updatedAt"');

-- Add composite index for Question status and updatedAt (common admin filter + sort)
SELECT create_composite_index_if_table_exists('Question', 'Question_status_updatedAt_idx', '"status", "updatedAt"');

-- Add composite index for Question folderId and updatedAt (common admin filter + sort)
SELECT create_composite_index_if_table_exists('Question', 'Question_folderId_updatedAt_idx', '"folderId", "updatedAt"');

-- Add composite index for Question type, status and updatedAt (common admin filter combination)
SELECT create_composite_index_if_table_exists('Question', 'Question_type_status_updatedAt_idx', '"type", "status", "updatedAt"');

-- Add index on TestCase.codingQuestionId to improve joins
SELECT create_index_if_table_exists('TestCase', 'TestCase_codingQuestionId_idx', '"codingQuestionId"');

-- Add index on _CodingQuestionTags.A for faster tag lookups
SELECT create_index_if_table_exists('_CodingQuestionTags', '_CodingQuestionTags_A_idx', '"A"');

-- Add index on _CodingQuestionTags.B for faster tag lookups
SELECT create_index_if_table_exists('_CodingQuestionTags', '_CodingQuestionTags_B_idx', '"B"');

-- Add index on Tag.name for faster tag searches
SELECT create_index_if_table_exists('Tag', 'Tag_name_idx', '"name"');