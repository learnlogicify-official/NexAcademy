# Frontend Virtualization Implementation Guide

## Overview

This guide provides detailed instructions for implementing virtualized lists in the admin question bank to significantly improve frontend rendering performance when dealing with large datasets.

## Prerequisites

- React 17+ and Next.js 13+
- Basic understanding of React components and hooks
- Familiarity with the admin question bank interface

## Implementation Steps

### 1. Install Required Dependencies

First, install the necessary packages for virtualization:

```bash
npm install react-window react-virtualized-auto-sizer
```

### 2. Create a Virtualized Question List Component

Create a new component file for the virtualized question list:

```bash
mkdir -p components/admin
touch components/admin/VirtualizedQuestionList.tsx
```

Implement the component with the following code:

```tsx
import React, { useCallback } from 'react';
import { FixedSizeList as List } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';
import { Question } from '@/types/question';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';

interface VirtualizedQuestionListProps {
  questions: Question[];
  onQuestionSelect: (question: Question) => void;
  selectedQuestionId?: string;
  isLoading: boolean;
}

const VirtualizedQuestionList: React.FC<VirtualizedQuestionListProps> = ({
  questions,
  onQuestionSelect,
  selectedQuestionId,
  isLoading
}) => {
  // Memoize the row renderer for better performance
  const Row = useCallback(
    ({ index, style }: { index: number; style: React.CSSProperties }) => {
      const question = questions[index];
      const isSelected = selectedQuestionId === question.id;
      
      return (
        <div 
          style={style} 
          className={`p-4 border-b hover:bg-accent/50 cursor-pointer transition-colors ${isSelected ? 'bg-accent' : ''}`}
          onClick={() => onQuestionSelect(question)}
          data-testid={`question-item-${index}`}
        >
          <div className="flex justify-between items-start">
            <div className="flex-1 min-w-0"> {/* Use min-width to enable text truncation */}
              <h3 className="font-medium truncate">{question.name}</h3>
              <p className="text-sm text-muted-foreground truncate max-w-full">
                {question.type === 'MCQ' 
                  ? question.mCQQuestion?.questionText 
                  : question.codingQuestion?.questionText}
              </p>
            </div>
            <div className="flex space-x-2 ml-4 flex-shrink-0">
              <Badge variant="outline" className="bg-primary/10 text-primary">
                {question.type === 'MCQ' ? 'Multiple Choice' : 'Coding'}
              </Badge>
              <Badge 
                variant="outline" 
                className={question.status === 'DRAFT' 
                  ? 'bg-yellow-100 text-yellow-800' 
                  : 'bg-green-100 text-green-800'}
              >
                {question.status}
              </Badge>
            </div>
          </div>
          <div className="mt-2 flex items-center text-xs text-muted-foreground">
            <span>Folder: {question.folder?.name || 'None'}</span>
            <span className="mx-2">•</span>
            <span>Updated: {new Date(question.updatedAt).toLocaleDateString()}</span>
          </div>
        </div>
      );
    },
    [questions, selectedQuestionId, onQuestionSelect]
  );

  if (isLoading) {
    return (
      <Card className="w-full h-[600px] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </Card>
    );
  }

  if (questions.length === 0) {
    return (
      <Card className="w-full h-[600px] flex items-center justify-center">
        <p className="text-muted-foreground">No questions found</p>
      </Card>
    );
  }

  return (
    <Card className="w-full h-[600px] overflow-hidden">
      <AutoSizer>
        {({ height, width }) => (
          <List
            height={height}
            itemCount={questions.length}
            itemSize={100} // Adjust based on your row height
            width={width}
            itemKey={(index) => questions[index].id}
            overscanCount={5} // Render extra items for smoother scrolling
            className="scrollbar-thin scrollbar-thumb-rounded scrollbar-thumb-gray-300 hover:scrollbar-thumb-gray-400"
          >
            {Row}
          </List>
        )}
      </AutoSizer>
    </Card>
  );
};

export default VirtualizedQuestionList;
```

### 3. Implement Variable Height List (Optional)

If your question items have variable heights, create a variable height version:

```tsx
import { VariableSizeList as List } from 'react-window';

// Inside your component
const getItemSize = (index: number) => {
  const question = questions[index];
  // Base height + additional height for longer content
  const baseHeight = 80;
  const textLength = (
    question.type === 'MCQ' 
      ? question.mCQQuestion?.questionText 
      : question.codingQuestion?.questionText
  )?.length || 0;
  
  // Add extra height for longer text
  return baseHeight + Math.min(Math.floor(textLength / 100) * 20, 60);
};

// Then use VariableSizeList instead of FixedSizeList
<List
  height={height}
  itemCount={questions.length}
  itemSize={getItemSize}
  width={width}
  itemKey={(index) => questions[index].id}
  overscanCount={5}
>
  {Row}
</List>
```

### 4. Update the Admin Questions Page

Modify the admin questions page to use the virtualized list component:

```tsx
// In /app/admin/questions/page.tsx
import VirtualizedQuestionList from '@/components/admin/VirtualizedQuestionList';

// Replace the existing question list rendering with:
<div className="flex flex-col space-y-4">
  <div className="flex items-center justify-between">
    <h2 className="text-xl font-semibold">Questions ({totalQuestions})</h2>
    <div className="flex items-center space-x-2">
      {/* Pagination controls */}
      <div className="flex items-center space-x-1">
        <Button
          variant="outline"
          size="sm"
          onClick={() => fetchQuestions(pendingFilters, 1)}
          disabled={currentPage === 1 || isLoading}
        >
          <ChevronFirstIcon className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => fetchQuestions(pendingFilters, currentPage - 1)}
          disabled={currentPage === 1 || isLoading}
        >
          <ChevronLeftIcon className="h-4 w-4" />
        </Button>
        <span className="text-sm">
          Page {currentPage} of {totalPages || 1}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => fetchQuestions(pendingFilters, currentPage + 1)}
          disabled={currentPage === totalPages || isLoading}
        >
          <ChevronRightIcon className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => fetchQuestions(pendingFilters, totalPages)}
          disabled={currentPage === totalPages || isLoading}
        >
          <ChevronLastIcon className="h-4 w-4" />
        </Button>
      </div>
    </div>
  </div>
  
  <VirtualizedQuestionList 
    questions={filteredQuestions}
    onQuestionSelect={(question) => loadQuestionDetails(question.id)}
    selectedQuestionId={selectedQuestion?.id}
    isLoading={isLoading}
  />
</div>
```

### 5. Implement Infinite Loading (Optional)

For an even better user experience, implement infinite scrolling instead of pagination:

```bash
npm install react-window-infinite-loader
```

Create an enhanced virtualized list with infinite loading:

```tsx
import React, { useCallback } from 'react';
import { FixedSizeList as List } from 'react-window';
import InfiniteLoader from 'react-window-infinite-loader';
import AutoSizer from 'react-virtualized-auto-sizer';
import { Question } from '@/types/question';

interface InfiniteQuestionListProps {
  questions: Question[];
  onQuestionSelect: (question: Question) => void;
  selectedQuestionId?: string;
  isLoading: boolean;
  hasNextPage: boolean;
  loadNextPage: () => void;
  totalCount: number;
}

const InfiniteQuestionList: React.FC<InfiniteQuestionListProps> = ({
  questions,
  onQuestionSelect,
  selectedQuestionId,
  isLoading,
  hasNextPage,
  loadNextPage,
  totalCount
}) => {
  // Calculate item count for infinite loader
  const itemCount = hasNextPage ? questions.length + 1 : questions.length;
  
  // Check if an item is loaded
  const isItemLoaded = (index: number) => !hasNextPage || index < questions.length;
  
  // Load more items
  const loadMoreItems = isLoading ? () => {} : loadNextPage;
  
  // Row renderer
  const Row = useCallback(
    ({ index, style }: { index: number; style: React.CSSProperties }) => {
      // If we're loading the last item, show a loading indicator
      if (!isItemLoaded(index)) {
        return (
          <div style={style} className="flex items-center justify-center p-4 border-b">
            <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-primary"></div>
          </div>
        );
      }
      
      const question = questions[index];
      const isSelected = selectedQuestionId === question.id;
      
      return (
        <div 
          style={style} 
          className={`p-4 border-b hover:bg-accent/50 cursor-pointer transition-colors ${isSelected ? 'bg-accent' : ''}`}
          onClick={() => onQuestionSelect(question)}
        >
          {/* Question item content (same as before) */}
        </div>
      );
    },
    [questions, selectedQuestionId, onQuestionSelect, isItemLoaded]
  );

  if (isLoading && questions.length === 0) {
    return (
      <div className="w-full h-[600px] flex items-center justify-center border rounded-md">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="w-full h-[600px] border rounded-md">
      <AutoSizer>
        {({ height, width }) => (
          <InfiniteLoader
            isItemLoaded={isItemLoaded}
            itemCount={itemCount}
            loadMoreItems={loadMoreItems}
            threshold={5} // Start loading when user is 5 items away from the end
          >
            {({ onItemsRendered, ref }) => (
              <List
                ref={ref}
                height={height}
                itemCount={itemCount}
                itemSize={100}
                width={width}
                onItemsRendered={onItemsRendered}
                overscanCount={5}
              >
                {Row}
              </List>
            )}
          </InfiniteLoader>
        )}
      </AutoSizer>
    </div>
  );
};

export default InfiniteQuestionList;
```

### 6. Implement Windowing for Question Details

For questions with long content, implement windowing for the details view as well:

```tsx
import { FixedSizeList as List } from 'react-window';

// Inside your QuestionDetails component
const renderTestCases = () => {
  if (!selectedQuestion?.codingQuestion?.testCases?.length) {
    return <p>No test cases available</p>;
  }
  
  const testCases = selectedQuestion.codingQuestion.testCases;
  
  return (
    <div className="h-[300px] border rounded-md">
      <List
        height={300}
        itemCount={testCases.length}
        itemSize={80}
        width="100%"
        overscanCount={2}
      >
        {({ index, style }) => {
          const testCase = testCases[index];
          return (
            <div style={style} className="p-3 border-b">
              <div className="flex justify-between">
                <span className="font-medium">Test {index + 1}</span>
                <Badge variant={testCase.isHidden ? 'outline' : 'default'}>
                  {testCase.isHidden ? 'Hidden' : 'Visible'}
                </Badge>
              </div>
              <div className="mt-2 grid grid-cols-2 gap-2">
                <div>
                  <span className="text-xs text-muted-foreground">Input:</span>
                  <pre className="text-xs bg-muted p-1 rounded mt-1 overflow-x-auto">
                    {testCase.input}
                  </pre>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground">Expected Output:</span>
                  <pre className="text-xs bg-muted p-1 rounded mt-1 overflow-x-auto">
                    {testCase.expectedOutput}
                  </pre>
                </div>
              </div>
            </div>
          );
        }}
      </List>
    </div>
  );
};
```

## Performance Optimization Tips

### 1. Memoize Components and Callbacks

Use React's memoization features to prevent unnecessary re-renders:

```tsx
// Memoize the entire component
const VirtualizedQuestionList = React.memo(({ questions, onQuestionSelect, selectedQuestionId, isLoading }) => {
  // Component implementation
});

// Memoize expensive calculations
const sortedQuestions = useMemo(() => {
  return [...questions].sort((a, b) => {
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  });
}, [questions]);
```

### 2. Optimize Rendering with React.lazy and Suspense

Use code splitting to reduce the initial bundle size:

```tsx
import React, { Suspense, lazy } from 'react';

// Lazy load components
const VirtualizedQuestionList = lazy(() => import('@/components/admin/VirtualizedQuestionList'));
const QuestionDetails = lazy(() => import('@/components/admin/QuestionDetails'));

// In your component
return (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    <Suspense fallback={<div className="h-[600px] flex items-center justify-center"><div className="animate-spin"></div></div>}>
      <VirtualizedQuestionList 
        questions={filteredQuestions}
        onQuestionSelect={handleQuestionSelect}
        selectedQuestionId={selectedQuestion?.id}
        isLoading={isLoading}
      />
    </Suspense>
    
    <Suspense fallback={<div className="h-[600px] flex items-center justify-center"><div className="animate-spin"></div></div>}>
      {selectedQuestion ? (
        <QuestionDetails 
          question={selectedQuestion} 
          isLoading={isLoadingDetails} 
        />
      ) : (
        <div className="h-[600px] flex items-center justify-center border rounded-md">
          <p className="text-muted-foreground">Select a question to view details</p>
        </div>
      )}
    </Suspense>
  </div>
);
```

### 3. Implement Debounced Search

Debounce search input to prevent excessive API calls:

```tsx
import { useDebounce } from '@/hooks/use-debounce';

// In your component
const [searchInput, setSearchInput] = useState('');
const debouncedSearch = useDebounce(searchInput, 300);

// Effect to trigger search when debounced value changes
useEffect(() => {
  if (debouncedSearch !== undefined) {
    const newFilters = {
      ...pendingFilters,
      search: debouncedSearch
    };
    fetchQuestions(newFilters);
  }
}, [debouncedSearch]);

// Search input
<Input
  placeholder="Search questions..."
  value={searchInput}
  onChange={(e) => setSearchInput(e.target.value)}
  className="max-w-sm"
/>
```

## Performance Monitoring

After implementing virtualization, monitor the performance improvements:

1. **Memory Usage**: Use Chrome DevTools Memory tab to compare memory usage before and after implementation
   - Expected improvement: 50-80% reduction in memory usage for large lists

2. **Rendering Performance**: Use Chrome DevTools Performance tab to measure:
   - Frame rate during scrolling (should maintain 60fps)
   - Time to render initial view
   - JavaScript execution time during scrolling

3. **User Experience Metrics**:
   - First Input Delay (FID)
   - Interaction to Next Paint (INP)
   - Cumulative Layout Shift (CLS)

## Troubleshooting

### Common Issues

1. **Blank or Flickering Items**
   - Ensure item sizes are calculated correctly
   - Check that the container has a fixed height
   - Verify that AutoSizer is working properly

2. **Scrolling Performance Issues**
   - Reduce the complexity of rendered items
   - Increase `overscanCount` for smoother scrolling
   - Use Chrome DevTools Performance tab to identify bottlenecks

3. **Items Not Rendering Correctly**
   - Verify that the `itemKey` prop is set correctly
   - Ensure that the data array is not being modified during rendering
   - Check for missing dependencies in memoized components

## Next Steps

After implementing virtualization, consider these additional frontend optimizations:

1. Implement skeleton loading states for a better loading experience
2. Add keyboard navigation for accessibility
3. Implement drag-and-drop reordering with virtualized lists
4. Add column virtualization for tables with many columns