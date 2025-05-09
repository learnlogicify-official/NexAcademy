# Database Indexing Strategy

## Overview

This document outlines the indexing strategy implemented for the NexAcademy database to optimize query performance. The indexes have been created based on analysis of the database schema, entity relationships, and common query patterns.

## Indexing Approach

Our indexing strategy follows these principles:

1. **Primary Key Indexes**: PostgreSQL automatically creates indexes on primary keys.
2. **Foreign Key Indexes**: We've added indexes on foreign key columns to improve join performance.
3. **Common Filter Columns**: Indexes on columns frequently used in WHERE clauses.
4. **Composite Indexes**: Strategic multi-column indexes for common query patterns.
5. **Timestamp Indexes**: Indexes on date/time columns used for filtering and sorting.

## Index Categories

### Basic Indexes (20250501000000_add_missing_indexes)

These indexes focus on foreign keys and commonly filtered columns:

- Foreign key indexes (e.g., `MCQQuestion_questionId_idx`, `CodingQuestion_questionId_idx`)
- Status column indexes (e.g., `Attempt_status_idx`, `Assessment_status_idx`)
- Name/identifier indexes (e.g., `Tag_name_idx`)
- Timestamp indexes (e.g., `ProblemSubmission_submittedAt_idx`, `Enrollment_enrolledAt_idx`)

### Composite Indexes (20250502000000_add_composite_indexes)

These indexes optimize specific query patterns:

- User-related queries (e.g., `User_role_createdAt_idx`)
- Enrollment filtering (e.g., `Enrollment_userId_status_idx`, `Enrollment_courseId_status_idx`)
- Assessment filtering (e.g., `Assessment_status_startDate_idx`, `Assessment_folderId_status_idx`)
- Attempt queries (e.g., `Attempt_userId_assessmentId_idx`, `Attempt_userId_startedAt_idx`)
- Question filtering (e.g., `Question_type_status_idx`, `Question_folderId_type_idx`)
- Submission analysis (e.g., `ProblemSubmission_userId_problemId_idx`, `ProblemSubmission_problemId_allPassed_idx`)

### Ordering Indexes

These indexes optimize queries that involve ordering:

- `Video_moduleId_order_idx`
- `Article_moduleId_order_idx`
- `Section_assessmentId_order_idx`
- `SectionQuestion_sectionId_order_idx`
- `Module_courseId_order_idx`
- `Submodule_moduleId_order_idx`

## Maintenance Considerations

1. **Index Size**: Indexes improve query performance but increase storage requirements and write overhead.
2. **Monitoring**: Regularly monitor index usage to identify unused indexes that can be removed.
3. **Query Analysis**: Periodically analyze slow queries to identify opportunities for new indexes.
4. **Database Statistics**: Keep database statistics up to date for optimal query planning.

## Future Optimizations

1. **Partial Indexes**: Consider adding partial indexes for specific query patterns on subsets of data.
2. **Expression Indexes**: If queries frequently use expressions or functions, consider adding expression indexes.
3. **Index-Only Scans**: Design indexes to support index-only scans for frequently accessed data.

## Conclusion

The implemented indexing strategy balances query performance with maintenance overhead. As the application evolves, the indexing strategy should be reviewed and adjusted based on changing query patterns and performance requirements.