import fs from 'fs';
import path from 'path';
import { questionService } from '../lib/services/questionService';

/**
 * This script converts questions from a file or REST API responses into the format required
 * for the bulkImportCodingQuestions GraphQL mutation and imports them all at once.
 * 
 * Usage: 
 * 1. Save your questions in a JSON file or fetch them from an API
 * 2. Run: npx ts-node scripts/convert-rest-to-bulk-import.ts [path-to-questions.json] [folder-id]
 * 
 * Example: npx ts-node scripts/convert-rest-to-bulk-import.ts ./my-questions.json folder123
 */

// Configure these values if not passing through command line
const DEFAULT_FOLDER_ID = 'YOUR_DEFAULT_FOLDER_ID'; 
const DEFAULT_QUESTIONS_FILE = './questions-to-import.json';

async function main() {
  try {
    // Get parameters from command line or defaults
    const questionsFile = process.argv[2] || DEFAULT_QUESTIONS_FILE;
    const targetFolderId = process.argv[3] || DEFAULT_FOLDER_ID;
    
    if (!targetFolderId || targetFolderId === 'YOUR_DEFAULT_FOLDER_ID') {
      console.error('Error: Please provide a valid folder ID as a command line argument or set DEFAULT_FOLDER_ID in the script.');
      process.exit(1);
    }
    
    console.log(`Converting and importing questions from ${questionsFile} to folder ${targetFolderId}...`);
    
    // Read questions from file
    let questionsData: any[] = [];
    if (fs.existsSync(questionsFile)) {
      const fileContent = fs.readFileSync(questionsFile, 'utf8');
      questionsData = JSON.parse(fileContent);
    } else {
      console.error(`Error: File ${questionsFile} not found!`);
      process.exit(1);
    }
    
    console.log(`Found ${questionsData.length} questions to import.`);
    
    // Convert questions to the format needed for bulk import
    const bulkImportQuestions = questionsData.map(question => {
      // This conversion depends on your original question format
      // Adjust the field mappings as needed
      return {
        name: question.name || 'Unnamed Question',
        type: 'CODING',
        status: question.status || 'DRAFT',
        folderId: targetFolderId,
        codingQuestion: {
          questionText: question.questionText || question.codingQuestion?.questionText || '',
          defaultMark: question.defaultMark || question.codingQuestion?.defaultMark || 1,
          difficulty: question.difficulty || question.codingQuestion?.difficulty || 'MEDIUM',
          isAllOrNothing: question.isAllOrNothing || question.codingQuestion?.isAllOrNothing || false,
          defaultLanguage: question.defaultLanguage || question.codingQuestion?.defaultLanguage || '',
          
          // Convert language options
          languageOptions: (question.languageOptions || question.codingQuestion?.languageOptions || []).map((lang: any) => ({
            language: lang.language,
            solution: lang.solution || '',
            preloadCode: lang.preloadCode || ''
          })),
          
          // Convert test cases
          testCases: (question.testCases || question.codingQuestion?.testCases || []).map((test: any) => ({
            input: test.input || '',
            output: test.output || test.expectedOutput || '',
            isSample: test.isSample || test.type === 'sample' || false,
            isHidden: test.isHidden || test.type === 'hidden' || false,
            showOnFailure: test.showOnFailure || false,
            gradePercentage: test.gradePercentage || 0
          })),
          
          // Convert tags
          tagIds: question.tags?.map((tag: any) => 
            typeof tag === 'string' ? tag : tag.id
          ) || question.codingQuestion?.tags?.map((tag: any) => 
            typeof tag === 'string' ? tag : tag.id
          ) || []
        }
      };
    });
    
    console.log(`Converted ${bulkImportQuestions.length} questions for bulk import.`);
    
    // Save the converted questions to a file for reference
    const outputFile = path.join(path.dirname(questionsFile), 'converted-questions.json');
    fs.writeFileSync(outputFile, JSON.stringify(bulkImportQuestions, null, 2));
    console.log(`Saved converted questions to ${outputFile}`);
    
    // Import all questions at once
    console.log('Starting bulk import...');
    const result = await questionService.bulkImportCodingQuestions(bulkImportQuestions);
    
    console.log(`Successfully imported ${result.length} questions:`);
    for (const question of result) {
      console.log(`- ${question.id}: ${question.name}`);
    }
    
    console.log('Bulk import completed successfully!');
    
  } catch (error) {
    console.error('Error during conversion and import:', error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  }); 