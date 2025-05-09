# Admin Question Bank Optimization Guide

## Problem

The admin question bank page is currently taking approximately 25 seconds to load, which creates a poor user experience and reduces productivity for administrators.

## Root Causes

After analyzing the codebase and database schema, we've identified several potential causes for the slow performance:

1. **Missing Database Indexes**: While some indexes exist, there are missing indexes on critical query paths specific to the admin question bank.

2. **Inefficient Query Patterns**: The current implementation may be fetching more data than necessary or using inefficient join patterns.

3. **Lack of Pagination**: Loading all questions at once instead of implementing pagination.

4. **Eager Loading of Related Data**: Fetching all related data (test cases, language options, tags) upfront instead of lazy loading.

## Implemented Solutions

### 1. Additional Database Indexes

We've created a new migration (`20250503000000_optimize_admin_question_bank`) that adds the following indexes:

- Indexes on `Question.updatedAt` and `Question.createdAt` for faster sorting
- Composite indexes for common filter combinations:
  - `Question_type_updatedAt_idx`
  - `Question_status_updatedAt_idx`
  - `Question_folderId_updatedAt_idx`
  - `Question_type_status_updatedAt_idx`
- Indexes for faster joins and lookups:
  - `CodingQuestion_questionId_updatedAt_idx`
  - `TestCase_codingQuestionId_idx`
  - `_CodingQuestionTags_A_idx` and `_CodingQuestionTags_B_idx`
  - `Tag_name_idx`

### 2. Additional Recommended Optimizations

#### API Endpoint Optimizations

- Implement pagination in the `/api/questions/route.ts` endpoint:
  ```typescript
  // Example pagination implementation
  const page = parseInt(searchParams.get('page') || '1');
  const pageSize = parseInt(searchParams.get('pageSize') || '20');
  const skip = (page - 1) * pageSize;
  
  // Add to prisma query
  const questions = await prisma.question.findMany({
    // existing filters
    skip,
    take: pageSize,
    // ...
  });
  ```

- Optimize the query to select only necessary fields initially:
  ```typescript
  // First query: Get basic question data
  const questions = await prisma.question.findMany({
    select: {
      id: true,
      name: true,
      type: true,
      status: true,
      updatedAt: true,
      // Only include minimal related data
      codingQuestion: {
        select: {
          id: true,
          difficulty: true,
          // Don't include test cases and language options yet
        }
      }
    },
    // filters, pagination, etc.
  });
  ```

#### Frontend Optimizations

- Implement virtual scrolling for large lists using libraries like `react-virtualized` or `react-window`
- Lazy load question details only when a question is selected or expanded
- Add client-side caching for previously loaded questions
- Implement optimistic UI updates to improve perceived performance

#### Database Query Optimization

- Consider denormalizing some frequently accessed data to reduce joins
- Use database query analysis tools to identify slow queries
- Consider adding database-level query timeouts to prevent long-running queries

## Implementation Steps

1. ✅ Apply the new migration with additional indexes
2. Modify the API endpoints to implement pagination and optimize queries
3. Update the frontend to support pagination and lazy loading
4. Monitor performance improvements and iterate as needed

## Expected Results

After implementing these optimizations, the admin question bank should load in under 3 seconds for the initial page load, with subsequent interactions being near-instantaneous.

## Monitoring

To ensure the optimizations are effective, implement monitoring for:

- API response times for question bank endpoints
- Database query execution times
- Client-side rendering performance

## Future Considerations

- Consider implementing a caching layer (Redis) for frequently accessed data
- Evaluate database scaling options if question volume continues to grow
- Consider implementing a search index (Elasticsearch) for more efficient text searches