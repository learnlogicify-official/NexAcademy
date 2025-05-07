# Bulk Import for Coding Questions

## Overview

The NexAcademy platform supports bulk importing of multiple coding questions at once, which significantly improves performance when loading large sets of questions. Instead of making separate API calls for each question, the system can now process multiple questions in a single transaction.

## Features

- Import multiple coding questions in a single API call
- Transaction support ensures all-or-nothing import (either all questions are imported or none)
- Support for all question properties including:
  - Multiple programming languages
  - Test cases
  - Tags
  - Different difficulty levels

## How to Use

### 1. Using the GraphQL API Directly

The GraphQL mutation for bulk import is:

```graphql
mutation BulkImportCodingQuestions($questions: [QuestionInput!]!) {
  bulkImportCodingQuestions(questions: $questions) {
    id
    name
    type
    status
  }
}
```

### 2. Using the Question Service

In your code, you can use the `questionService.bulkImportCodingQuestions` method:

```typescript
import { questionService } from '@/lib/services/questionService';

// Example batch of questions
const questions = [
  {
    name: "Find Maximum Number",
    type: "CODING",
    status: "DRAFT",
    folderId: "your-folder-id",
    codingQuestion: {
      questionText: "<p>Find the largest number in an array.</p>",
      defaultMark: 1,
      difficulty: "EASY",
      isAllOrNothing: false,
      defaultLanguage: "71", // Python 3
      languageOptions: [
        {
          language: "71", // Python 3
          solution: "def find_max(arr):\n    return max(arr) if arr else None",
          preloadCode: "def find_max(arr):\n    # Your code here\n    pass"
        },
        {
          language: "63", // JavaScript
          solution: "function findMax(arr) {\n    return arr.length ? Math.max(...arr) : null;\n}",
          preloadCode: "function findMax(arr) {\n    // Your code here\n}"
        }
      ],
      testCases: [
        {
          input: "[1, 3, 5, 2, 4]",
          output: "5",
          isSample: true,
          isHidden: false,
          showOnFailure: true,
          gradePercentage: 25
        },
        // ... more test cases
      ],
      tagIds: ["tag-id-1", "tag-id-2"] // Optional
    }
  },
  // ... more questions
];

// Call the bulk import function
const result = await questionService.bulkImportCodingQuestions(questions);
console.log(`Imported ${result.length} questions successfully`);
```

### 3. Using the Utility Scripts

Two utility scripts are available in the `scripts` folder:

#### a. bulk-import-coding-questions.ts

This script demonstrates how to use the bulk import functionality with sample questions:

```bash
npx ts-node scripts/bulk-import-coding-questions.ts
```

#### b. convert-rest-to-bulk-import.ts

This script converts existing questions (e.g., from a REST API) to the bulk import format:

```bash
npx ts-node scripts/convert-rest-to-bulk-import.ts path/to/questions.json your-folder-id
```

## Question Format

Each question in the bulk import should follow this structure:

```typescript
{
  name: string;           // Question name/title
  type: "CODING";         // Must be CODING for this import
  status: "DRAFT" | "READY"; // Question status
  folderId: string;       // ID of the folder to place the question in
  codingQuestion: {
    questionText: string;  // HTML content of the question
    defaultMark: number;   // Default points for the question
    difficulty: "EASY" | "MEDIUM" | "HARD" | "VERY_HARD" | "EXTREME";
    isAllOrNothing: boolean; // Whether partial credit is allowed
    defaultLanguage: string; // Default language ID or key
    
    // Language options supported for this question
    languageOptions: [
      {
        language: string;   // Language ID (e.g., "71" for Python 3)
        solution: string;   // Model solution
        preloadCode: string; // Code shown to the student initially
      }
    ],
    
    // Test cases for automated grading
    testCases: [
      {
        input: string;      // Test input
        output: string;     // Expected output
        isSample: boolean;  // Whether this is a sample test case visible to students
        isHidden: boolean;  // Whether to hide this test case from students
        showOnFailure: boolean; // Whether to show on failure
        gradePercentage: number; // Percentage of points for this test case
      }
    ],
    
    // Optional tag IDs to associate with the question
    tagIds: string[];
  }
}
```

## Tips and Best Practices

1. **Batch Size**: Aim for reasonable batch sizes (25-50 questions per batch) to balance performance and reliability.

2. **Error Handling**: The operation is transactional - if any question fails to import, the entire batch is rolled back.

3. **Language IDs**: Make sure to use valid Judge0 language IDs. Common ones include:
   - 63: JavaScript (Node.js)
   - 71: Python 3
   - 70: Python 2
   - 54: C++ (GCC)
   - 62: Java
   
4. **Testing**: Always test your import with a small batch before importing large sets of questions.

5. **Folder Structure**: Create appropriate folder structures before importing to keep questions organized.

## Troubleshooting

If you encounter issues with the bulk import:

1. Check that your question format exactly matches the expected structure
2. Verify that all folder IDs and tag IDs exist in the system
3. Confirm that you have appropriate permissions (admin or instructor role)
4. Check the server logs for detailed error messages
5. Try importing a single question first to isolate any issues

For further assistance, contact the NexAcademy development team. 