import { questionService } from '../lib/services/questionService';

/**
 * This script demonstrates how to use the bulkImportCodingQuestions functionality
 * to import multiple coding questions at once via a single GraphQL call.
 * 
 * Usage: npx ts-node scripts/bulk-import-coding-questions.ts
 */

async function main() {
  try {
    console.log('Starting bulk import of coding questions...');
    
    // Replace this ID with the actual folder ID where you want to import questions
    const targetFolderId = 'YOUR_FOLDER_ID_HERE';
    
    // Example batch of questions to import
    const questions = [
      // Question 1
      {
        name: "Find the Maximum Number",
        type: "CODING",
        status: "DRAFT",
        folderId: targetFolderId,
        codingQuestion: {
          questionText: "<p>Write a function that finds the maximum number in an array of integers.</p>",
          defaultMark: 1,
          difficulty: "EASY",
          isAllOrNothing: false,
          defaultLanguage: "71", // Python
          languageOptions: [
            {
              language: "71", // Python
              solution: "def find_max(arr):\n    if not arr:\n        return None\n    return max(arr)",
              preloadCode: "def find_max(arr):\n    # Your code here\n    pass"
            },
            {
              language: "63", // JavaScript
              solution: "function findMax(arr) {\n    if (!arr || arr.length === 0) {\n        return null;\n    }\n    return Math.max(...arr);\n}",
              preloadCode: "function findMax(arr) {\n    // Your code here\n}"
            }
          ],
          testCases: [
            {
              input: "[1, 2, 3, 4, 5]",
              output: "5",
              isSample: true,
              isHidden: false,
              showOnFailure: true,
              gradePercentage: 25
            },
            {
              input: "[-1, -5, -3]",
              output: "-1",
              isSample: true,
              isHidden: false,
              showOnFailure: true,
              gradePercentage: 25
            },
            {
              input: "[10, 20, 30, 5, 15]",
              output: "30",
              isSample: false,
              isHidden: true,
              showOnFailure: false,
              gradePercentage: 25
            },
            {
              input: "[]",
              output: "None",
              isSample: false,
              isHidden: true,
              showOnFailure: false,
              gradePercentage: 25
            }
          ],
          tagIds: [] // Add tag IDs if needed
        }
      },
      
      // Question 2
      {
        name: "Reverse a String",
        type: "CODING",
        status: "DRAFT",
        folderId: targetFolderId,
        codingQuestion: {
          questionText: "<p>Write a function that reverses a string.</p>",
          defaultMark: 1,
          difficulty: "EASY",
          isAllOrNothing: false,
          defaultLanguage: "71", // Python
          languageOptions: [
            {
              language: "71", // Python
              solution: "def reverse_string(s):\n    return s[::-1]",
              preloadCode: "def reverse_string(s):\n    # Your code here\n    pass"
            },
            {
              language: "63", // JavaScript
              solution: "function reverseString(s) {\n    return s.split('').reverse().join('');\n}",
              preloadCode: "function reverseString(s) {\n    // Your code here\n}"
            }
          ],
          testCases: [
            {
              input: "\"hello\"",
              output: "\"olleh\"",
              isSample: true,
              isHidden: false,
              showOnFailure: true,
              gradePercentage: 33
            },
            {
              input: "\"world\"",
              output: "\"dlrow\"",
              isSample: true,
              isHidden: false,
              showOnFailure: true,
              gradePercentage: 33
            },
            {
              input: "\"algorithm\"",
              output: "\"mhtirogla\"",
              isSample: false,
              isHidden: true,
              showOnFailure: false,
              gradePercentage: 34
            }
          ],
          tagIds: [] // Add tag IDs if needed
        }
      },
      
      // Add more questions as needed...
    ];
    
    // Call the bulk import function with all questions at once
    const result = await questionService.bulkImportCodingQuestions(questions);
    
    console.log(`Successfully imported ${result.length} questions:`);
    for (const question of result) {
      console.log(`- ${question.id}: ${question.name}`);
    }
    
  } catch (error) {
    console.error('Error during bulk import:', error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  }); 