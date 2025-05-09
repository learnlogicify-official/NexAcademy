# Admin Question Bank Implementation Guide

## Overview

This guide provides step-by-step instructions for implementing the optimized API endpoint and frontend changes to resolve the 25-second loading time issue in the admin question bank.

## Implementation Steps

### 1. Apply the Database Migration

First, apply the new migration that adds the necessary indexes for optimizing query performance:

```bash
npx prisma migrate dev --name optimize_admin_question_bank
```

This will apply the migration file `20250503000000_optimize_admin_question_bank/migration.sql` which adds specialized indexes for the admin question bank queries.

### 2. Update the Admin Questions Page

Modify the `fetchQuestions` function in `/app/admin/questions/page.tsx` to use the optimized endpoint:

```typescript
const fetchQuestions = async (currentFilters?: FilterState, page: number = 1) => {
  try {
    const filters = currentFilters || pendingFilters;
    setPendingFilters(filters);
    setIsLoading(true);

    // Prepare query parameters
    const queryParams: any = {
      page: page,
      limit: QUESTIONS_PER_PAGE
    };
    
    if (filters.search) queryParams.search = filters.search;
    
    // Handle folder selection
    if (filters.subcategory !== 'all') {
      queryParams.folderId = filters.subcategory;
    } else if (filters.category !== 'all') {
      queryParams.folderId = filters.category;
    } else if (selectedFolder) {
      queryParams.folderId = selectedFolder;
    }
    
    if (filters.type !== 'all') queryParams.type = filters.type;
    if (filters.status !== 'all') queryParams.status = filters.status;
    if (filters.includeSubcategories) queryParams.includeSubcategories = true;
    
    // Set loadFullDetails to false for list view (only load summary data)
    queryParams.loadFullDetails = false;
    
    // Update the current page state
    setCurrentPage(page);

    // Use the optimized endpoint
    const response = await fetch(`/api/questions/optimized?${new URLSearchParams(queryParams)}`);
    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.error || 'Failed to fetch questions');
    }
    
    // Process results
    setQuestions(result.questions);
    setFilteredQuestions(result.questions);
    setTotalPages(Math.ceil(result.pagination.total / QUESTIONS_PER_PAGE));
    setTotalQuestions(result.pagination.total);
    
    // Set pagination state
    setPagination({
      total: result.pagination.total,
      current: page
    });
    
    // If we're on the stats tab and stats aren't loaded yet, fetch them now
    if (activeTab === 'stats' && !statsLoaded) {
      fetchStats(queryParams);
    }
    
    setIsLoading(false);
    return result;
  } catch (error) {
    console.error('Error fetching questions:', error);
    toast({
      title: 'Error',
      description: 'Failed to fetch questions. Please try again.',
      variant: 'destructive'
    });
    setIsLoading(false);
    return { questions: [], totalCount: 0 };
  }
};
```

### 3. Implement Lazy Loading for Question Details

Modify the question detail view to load full details only when a question is selected:

```typescript
const loadQuestionDetails = async (questionId: string) => {
  try {
    setIsLoadingDetails(true);
    
    // Fetch full details for a single question
    const response = await fetch(`/api/questions/optimized?id=${questionId}&loadFullDetails=true`);
    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.error || 'Failed to fetch question details');
    }
    
    // Update the selected question with full details
    if (result.questions && result.questions.length > 0) {
      setSelectedQuestion(result.questions[0]);
    }
    
    setIsLoadingDetails(false);
  } catch (error) {
    console.error('Error loading question details:', error);
    toast({
      title: 'Error',
      description: 'Failed to load question details. Please try again.',
      variant: 'destructive'
    });
    setIsLoadingDetails(false);
  }
};
```

### 4. Implement Virtual Scrolling (Optional)

For even better performance with large question sets, implement virtual scrolling using a library like `react-virtualized` or `react-window`:

```bash
npm install react-window
```

Then update the question list component:

```tsx
import { FixedSizeList as List } from 'react-window';

// Inside your component
const QuestionList = () => {
  const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => {
    const question = filteredQuestions[index];
    return (
      <div style={style}>
        <QuestionCard question={question} onClick={() => loadQuestionDetails(question.id)} />
      </div>
    );
  };

  return (
    <List
      height={600}
      itemCount={filteredQuestions.length}
      itemSize={120}
      width="100%"
    >
      {Row}
    </List>
  );
};
```

## Performance Monitoring

After implementing these changes, monitor the performance improvements:

1. Measure the initial page load time (should be under 3 seconds)
2. Monitor API response times for the questions endpoint
3. Track client-side rendering performance

## Troubleshooting

If you still experience performance issues:

1. Check the database query execution plan using PostgreSQL's `EXPLAIN ANALYZE`
2. Verify that the indexes are being used properly
3. Consider further reducing the amount of data loaded initially
4. Implement server-side caching for frequently accessed data

## Next Steps

After implementing these optimizations, consider these additional improvements:

1. Implement a Redis caching layer for frequently accessed data
2. Add a dedicated search index using Elasticsearch for text searches
3. Implement a background job for pre-computing statistics
4. Consider database sharding if the question bank continues to grow significantly