# API Query Optimization with Database Indexes

## Overview

This document explains how the database indexing strategy supports common API query patterns in the NexAcademy application. Understanding these relationships will help developers optimize their queries and take full advantage of the available indexes.

## Common API Query Patterns and Supporting Indexes

### User Management

**Common Queries:**
- Retrieving users by role
- User authentication by email
- Recent user registrations

**Supporting Indexes:**
- `User_role_idx` - Supports filtering users by role
- `User_email_key` - Unique index for fast user lookup during authentication
- `User_role_createdAt_idx` - Composite index for filtering users by role and sorting by creation date

### Course Management

**Common Queries:**
- Courses by category
- Courses by level within a category
- Upcoming courses (by start date)

**Supporting Indexes:**
- `Course_categoryId_idx` - Supports filtering courses by category
- `Course_categoryId_level_idx` - Composite index for filtering by category and level
- `Course_categoryId_startDate_idx` - Supports filtering by category and sorting by start date

### Enrollment Management

**Common Queries:**
- User's active enrollments
- Course enrollment statistics
- Recent enrollments

**Supporting Indexes:**
- `Enrollment_userId_status_idx` - Supports filtering enrollments by user and status
- `Enrollment_courseId_status_idx` - Supports filtering enrollments by course and status
- `Enrollment_enrolledAt_idx` - Supports sorting enrollments by enrollment date

### Assessment Management

**Common Queries:**
- Published assessments
- Upcoming assessments
- Assessments by folder

**Supporting Indexes:**
- `Assessment_status_idx` - Supports filtering assessments by status
- `Assessment_status_startDate_idx` - Supports filtering by status and sorting by start date
- `Assessment_status_endDate_idx` - Supports filtering by status and sorting by end date
- `Assessment_folderId_status_idx` - Supports filtering by folder and status

### Attempt Tracking

**Common Queries:**
- User's assessment attempts
- Assessment completion statistics
- Recent attempts

**Supporting Indexes:**
- `Attempt_userId_idx` - Supports filtering attempts by user
- `Attempt_assessmentId_idx` - Supports filtering attempts by assessment
- `Attempt_status_idx` - Supports filtering attempts by status
- `Attempt_userId_assessmentId_idx` - Supports filtering attempts by user and assessment
- `Attempt_userId_status_idx` - Supports filtering attempts by user and status
- `Attempt_assessmentId_status_idx` - Supports filtering attempts by assessment and status
- `Attempt_startedAt_idx` and `Attempt_endedAt_idx` - Support sorting attempts by time

### Question Management

**Common Queries:**
- Questions by type and status
- Questions by folder
- Questions by difficulty

**Supporting Indexes:**
- `Question_type_status_idx` - Supports filtering questions by type and status
- `Question_folderId_type_idx` - Supports filtering questions by folder and type
- `Question_folderId_status_idx` - Supports filtering questions by folder and status
- `CodingQuestion_difficulty_idx` - Supports filtering coding questions by difficulty

### Problem Submissions

**Common Queries:**
- User's submissions for a problem
- Successful submissions for a problem
- User's recent submissions

**Supporting Indexes:**
- `ProblemSubmission_userId_problemId_idx` - Supports filtering submissions by user and problem
- `ProblemSubmission_userId_allPassed_idx` - Supports filtering successful submissions by user
- `ProblemSubmission_problemId_allPassed_idx` - Supports filtering successful submissions by problem
- `ProblemSubmission_userId_submittedAt_idx` - Supports filtering by user and sorting by submission time
- `ProblemSubmission_submittedAt_idx` - Supports sorting all submissions by time

## Query Optimization Tips

1. **Use Indexed Columns in WHERE Clauses**: Structure queries to filter on indexed columns whenever possible.

2. **Leverage Composite Indexes**: When filtering on multiple columns, check if a composite index exists that covers those columns.

3. **Consider Index Order**: In composite indexes, the order of columns matters. Queries that filter on the first column of a composite index will benefit even if they don't filter on subsequent columns.

4. **Avoid Function Calls on Indexed Columns**: Using functions on indexed columns (e.g., `LOWER(name)`) prevents the use of indexes unless you have a specific expression index.

5. **Use EXPLAIN**: When optimizing complex queries, use PostgreSQL's EXPLAIN feature to understand the query execution plan and verify index usage.

## Conclusion

The database indexing strategy has been designed to support the most common API query patterns in the NexAcademy application. By understanding these patterns and the supporting indexes, developers can write more efficient queries and provide a better user experience.