import React, { useState, useMemo } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Loader2, Upload, FileText, AlertCircle, CheckCircle, Download } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { QuestionFormData } from '@/app/types';

interface AikenImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  folders: any[];
}

interface AikenQuestion {
  question: string;
  options: { key: string; text: string }[];
  answer: string;
}

interface ParsedResults {
  successful: AikenQuestion[];
  failed: string[];
}

const AikenImportModal: React.FC<AikenImportModalProps> = ({ 
  isOpen, 
  onClose,
  onSuccess,
  folders
}) => {
  const { toast } = useToast();
  const [fileContent, setFileContent] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [parseResults, setParseResults] = useState<{
    questions: AikenQuestion[];
    failedCount: number;
    errorBlocks: string[];
  } | null>(null);
  const [failedQuestions, setFailedQuestions] = useState<string[]>([]);
  const [folderId, setFolderId] = useState<string>('');
  const [difficulty, setDifficulty] = useState<string>('MEDIUM');
  const [defaultMark, setDefaultMark] = useState<number>(1);
  const [importStarted, setImportStarted] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [importTotal, setImportTotal] = useState(0);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setParseResults(null);
    setImportStarted(false);
    setImportProgress(0);
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setFileContent(content);
      
      // Add basic diagnostic info to help troubleshoot
      console.log("==================== FILE DIAGNOSTICS ====================");
      console.log(`File name: ${file.name}`);
      console.log(`File size: ${content.length} characters`);
      
      // Check for various line ending types
      const crlfCount = (content.match(/\r\n/g) || []).length;
      const crCount = (content.match(/\r(?!\n)/g) || []).length;
      const lfCount = (content.match(/(?<!\r)\n/g) || []).length;
      console.log(`Line endings: CRLF=${crlfCount}, CR=${crCount}, LF=${lfCount}`);
      
      // Count answer lines and options
      const answerLines = (content.match(/ANSWER:\s*[A-Z]/gi) || []).length;
      const optionALines = (content.match(/^A[\)\.\:]\s+/gmi) || []).length;
      console.log(`Found ${answerLines} ANSWER: lines`);
      console.log(`Found ${optionALines} option A lines`);
      
      // Parse the file
      handleParse(content);
    };
    reader.readAsText(file);
  };

  const handleParse = (text: string) => {
    parseAikenFormat(text);
  };

  const processSampleData = () => {
    const sampleData = `What is the correct HTML tag for the largest heading?
A. <head>
B. <h1>
C. <h6>
D. <heading>
ANSWER: B

Which CSS property is used to control the spacing between elements?
A. margin
B. padding
C. spacing
D. border
ANSWER: A

What is the output of the following code?
\`\`\`
console.log(typeof null);
\`\`\`
A. "null"
B. "object"
C. "undefined"
D. "number"
ANSWER: B

Which of these is NOT a JavaScript data type?
A. Boolean
B. Integer
C. Symbol
D. BigInt
ANSWER: B`;

    setFileContent(sampleData);
    handleParse(sampleData);
  };

  const examineContent = () => {
    try {
      console.log("============= DETAILED FILE EXAMINATION =============");
      if (!fileContent) {
        console.log("No file content to examine");
        toast({
          title: "No File Content",
          description: "Please upload a file first",
          variant: "destructive"
        });
        return;
      }
      
      console.log("Raw file content length:", fileContent.length);
      console.log("First 500 characters:", fileContent.substring(0, 500));
      
      // Check for various line ending types
      const crlfCount = (fileContent.match(/\r\n/g) || []).length;
      const crCount = (fileContent.match(/\r(?!\n)/g) || []).length;
      const lfCount = (fileContent.match(/(?<!\r)\n/g) || []).length;
      
      console.log("Line ending counts:");
      console.log("- CRLF (\\r\\n):", crlfCount);
      console.log("- CR only (\\r):", crCount);
      console.log("- LF only (\\n):", lfCount);
      
      // Look for separator patterns
      const emptyLineCount = (fileContent.match(/\n\s*\n/g) || []).length;
      const possibleQuestionCount = emptyLineCount + 1;
      
      console.log("Empty line separators:", emptyLineCount);
      console.log("Possible questions based on separators:", possibleQuestionCount);
      
      // Count answer lines
      const answerLineCount = (fileContent.match(/ANSWER:\s*[A-Z]/gi) || []).length;
      console.log("ANSWER: lines found:", answerLineCount);
      
      // Count option patterns
      const optionACount = (fileContent.match(/\nA[\)\.\:]\s+/gi) || []).length;
      const optionBCount = (fileContent.match(/\nB[\)\.\:]\s+/gi) || []).length;
      
      console.log("Option pattern counts:");
      console.log("- A option lines:", optionACount);
      console.log("- B option lines:", optionBCount);
      
      // Show a small random sample of the content for inspection
      const lines = fileContent.split('\n');
      const sampleSize = Math.min(20, lines.length);
      const sampleStart = Math.floor(Math.random() * (lines.length - sampleSize));
      
      console.log(`Random sample (lines ${sampleStart}-${sampleStart + sampleSize}):`);
      console.log(lines.slice(sampleStart, sampleStart + sampleSize).join('\n'));
      
      // Display a simple alert dialog as fallback
      alert(`File Examination Complete:
- File length: ${fileContent.length} characters
- Line endings: ${crlfCount} CRLF, ${crCount} CR, ${lfCount} LF
- Empty line separators: ${emptyLineCount}
- ANSWER lines found: ${answerLineCount}
- A option lines: ${optionACount}
- B option lines: ${optionBCount}
- Possible question count: ${possibleQuestionCount}

Check browser console for complete details (press F12)`);
      
      toast({
        title: "File Examination Complete",
        description: "Check the browser console for detailed information",
      });
    } catch (error) {
      console.error("Error examining file:", error);
      alert("Error examining file. Check console for details.");
    }
  };

  const normalizeLineEndings = (text: string): string => {
    return text.replace(/\r\n|\r/g, '\n');
  };

  const parseAikenFormat = (text: string): { 
    questions: AikenQuestion[];
    failedCount: number;
    errorBlocks: string[];
  } => {
    const normalizedText = normalizeLineEndings(text);
    const lines = normalizedText.split('\n');
    
    const questions: AikenQuestion[] = [];
    const errorBlocks: string[] = [];
    let failedCount = 0;
    
    let currentQuestion: {
      question: string;
      options: { key: string; text: string }[];
      answer?: string;
    } | null = null;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue; // Skip empty lines

      // Check if line is an option (A), B), etc.)
      const optionMatch = line.match(/^([A-Z])[\)\.]\s+(.*)/);
      if (optionMatch) {
        if (!currentQuestion) {
          console.log(`Error: Option found without a question at line ${i + 1}`);
          errorBlocks.push(line);
          failedCount++;
          continue;
        }
        
        const [_, key, text] = optionMatch;
        currentQuestion.options.push({
          key: key.toUpperCase(),
          text: text.trim()
        });
        continue;
      }

      // Check if line is an answer
      const answerMatch = line.match(/^ANSWER:\s*([A-Z])/i);
      if (answerMatch) {
        if (!currentQuestion) {
          console.log(`Error: ANSWER found without a question at line ${i + 1}`);
          errorBlocks.push(line);
          failedCount++;
          continue;
        }

        const answer = answerMatch[1].toUpperCase();
        
        // Validate that the answer matches one of the options
        if (!currentQuestion.options.some(opt => opt.key === answer)) {
          console.log(`Error: Answer ${answer} doesn't match any option`);
          errorBlocks.push(line);
          failedCount++;
          currentQuestion = null;
          continue;
        }

        // Add the completed question to our list
        questions.push({
          question: currentQuestion.question,
          options: currentQuestion.options,
          answer: answer
        });
        
        currentQuestion = null;
        continue;
      }

      // If we get here, it's a new question
      if (currentQuestion) {
        console.log(`Error: New question found before previous question was completed at line ${i + 1}`);
        errorBlocks.push(line);
        failedCount++;
      }
      
      currentQuestion = {
        question: line,
        options: []
      };
    }

    // Check if we have an incomplete question at the end
    if (currentQuestion) {
      console.log('Error: Incomplete question at the end of file');
      errorBlocks.push(currentQuestion.question);
      failedCount++;
    }

    setParseResults({
      questions,
      failedCount,
      errorBlocks
    });

    console.log(`Successfully parsed ${questions.length} questions`);
    console.log(`Failed to parse ${failedCount} questions`);
    
    if (errorBlocks.length > 0) {
      console.log("Sample of first failed block:");
      console.log(errorBlocks[0]);
    }

    return { questions, failedCount, errorBlocks };
  };

  const convertAikenQuestionToFormQuestion = (
    aikenQuestion: AikenQuestion,
    folderId?: string
  ): any => {
    // Create options with proper grading
    const options = aikenQuestion.options.map(option => ({
      text: option.text,
      grade: option.key === aikenQuestion.answer ? 100 : 0,
      feedback: ''
    }));

    // Return the question in the format expected by the API
    return {
      name: aikenQuestion.question.substring(0, 50) + (aikenQuestion.question.length > 50 ? '...' : ''),
      questionText: aikenQuestion.question,
      type: 'MCQ',
      status: 'DRAFT',
      folderId: folderId || '',
      difficulty: difficulty,
      defaultMark: defaultMark,
      mCQQuestion: {
        options: options
      },
      // These fields are needed at the top level
      isMultiple: false,
      shuffleChoice: false,
      generalFeedback: ''
    };
  };

  const importQuestions = async () => {
    if (!parseResults?.questions.length || !folderId) {
      toast({
        title: 'Missing information',
        description: 'Please select a folder and ensure there are valid questions to import.',
        variant: 'destructive'
      });
      return;
    }
    
    setImportStarted(true);
    setIsLoading(true);
    setImportTotal(parseResults.questions.length);
    setImportProgress(0);
    
    try {
      let successCount = 0;
      let failCount = 0;
      
      for (let i = 0; i < parseResults.questions.length; i++) {
        const question = parseResults.questions[i];
        // Get the formatted question
        const questionData = convertAikenQuestionToFormQuestion(question, folderId);
        
        try {
          // Log the question data before sending
          console.log('Attempting to import question:', {
            index: i + 1,
            total: parseResults.questions.length,
            questionName: questionData.name,
            optionsCount: questionData.mCQQuestion.options.length,
            folderId: questionData.folderId
          });

          // Convert to API format
          const requestBody = JSON.stringify(questionData);
          console.log('Request body:', requestBody);

          const response = await fetch('/api/questions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: requestBody,
          });
          
          // Log the raw response for debugging
          console.log('Server response:', {
            status: response.status,
            statusText: response.statusText,
            ok: response.ok,
            headers: Object.fromEntries(response.headers.entries())
          });

          if (!response.ok) {
            let errorMessage = 'Unknown error';
            let errorData = null;
            
            try {
              const text = await response.text();
              console.log('Raw error response:', text);
              
              try {
                errorData = JSON.parse(text);
                errorMessage = errorData.error || errorData.message || JSON.stringify(errorData);
              } catch (e: any) {
                errorMessage = text || `HTTP ${response.status}: ${response.statusText}`;
              }
            } catch (e: any) {
              errorMessage = `Failed to read response: ${e.message}`;
            }
            
            console.error('Failed to import question:', {
              question: questionData.name,
              status: response.status,
              error: errorMessage
            });
            
            failCount++;
            continue;
          }

          let responseData;
          try {
            responseData = await response.json();
          } catch (e) {
            console.error('Error parsing response JSON:', e);
            failCount++;
            continue;
          }

          if (responseData.error) {
            console.error('Error in response:', responseData.error);
            failCount++;
          } else {
            console.log('Successfully imported question:', {
              question: questionData.name,
              responseId: responseData.id
            });
            successCount++;
          }
        } catch (error: any) {
          console.error('Error importing question:', {
            question: question.question.substring(0, 30),
            error: error.message,
            stack: error.stack
          });
          failCount++;
        }
        
        setImportProgress(i + 1);
      }
      
      toast({
        title: 'Import Complete',
        description: `Successfully imported ${successCount} questions. Failed to import ${failCount} questions.`,
        variant: successCount > 0 ? 'default' : 'destructive'
      });
      
      if (successCount > 0) {
        onSuccess();
      }
    } catch (error: any) {
      console.error('Error during import:', error);
      toast({
        title: 'Import Failed',
        description: `An error occurred while importing questions: ${error.message}`,
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFileContent(null);
    setFileName('');
    setParseResults(null);
    setImportStarted(false);
    setImportProgress(0);
  };

  // Prepare a flat list of all folders and their subfolders
  const allFolderOptions = React.useMemo(() => {
    const result: { id: string; name: string; isSubfolder?: boolean; parentName?: string }[] = [];
    
    folders.forEach(folder => {
      // Add the main folder
      result.push({ id: folder.id, name: folder.name });
      
      // Add all subfolders with a reference to their parent
      if (folder.subfolders && folder.subfolders.length > 0) {
        folder.subfolders.forEach((subfolder: { id: string; name: string }) => {
          result.push({
            id: subfolder.id,
            name: subfolder.name,
            isSubfolder: true,
            parentName: folder.name
          });
        });
      }
    });
    
    return result;
  }, [folders]);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // ... existing code ...
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Import Moodle Aiken Format MCQ Questions</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Instructions */}
          <Card>
            <CardHeader>
              <CardTitle>Aiken Format</CardTitle>
              <CardDescription>
                Upload a text file in Aiken format with multiple-choice questions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Format example:
              </p>
              <pre className="bg-muted p-2 text-xs rounded-md my-2 whitespace-pre-wrap">
                What is the capital of France?{'\n'}
                A. London{'\n'}
                B. Berlin{'\n'}
                C. Paris{'\n'}
                D. Madrid{'\n'}
                ANSWER: C
              </pre>
              <div className="mt-2">
                <a 
                  href="/sample-aiken.txt" 
                  download="sample-aiken.txt"
                  className="text-sm text-primary hover:underline flex items-center"
                >
                  <Download className="h-3 w-3 mr-1" />
                  Download sample Aiken format file
                </a>
              </div>
            </CardContent>
          </Card>

          {/* File Upload */}
          <div className="space-y-2">
            <Label>Upload Aiken File (.txt)</Label>
            <div className="flex items-center gap-2">
              <Input
                type="file"
                accept=".txt"
                onChange={handleFileChange}
                className="file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary/90"
                disabled={isLoading || importStarted}
              />
              {fileName && (
                <div className="flex items-center gap-2">
                  <p className="text-sm text-muted-foreground overflow-hidden text-ellipsis">{fileName}</p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (!fileContent) {
                        alert("No file content loaded yet");
                        return;
                      }
                      
                      // Simple direct alert with diagnostic info
                      const totalQuestions = (fileContent.match(/ANSWER:/gi) || []).length;
                      alert(`Quick Diagnostic for ${fileName}:
- File size: ${fileContent.length} characters
- Total possible questions: ${totalQuestions} (based on ANSWER: lines)
- Parsed questions: ${parseResults?.questions.length || 0}
- Failed questions: ${parseResults?.errorBlocks.length || 0}

Check browser console (F12) for more details`);
                      
                      // Log more detailed information to console
                      console.log("============ QUICK FILE DIAGNOSTIC ============");
                      console.log(`File: ${fileName}`);
                      console.log(`Content length: ${fileContent.length} characters`);
                      console.log(`ANSWER lines: ${(fileContent.match(/ANSWER:/gi) || []).length}`);
                      console.log(`Option A lines: ${(fileContent.match(/^A[\.\)]/gmi) || []).length}`);
                      console.log(`Empty lines: ${(fileContent.match(/\n\s*\n/g) || []).length}`);
                    }}
                    className="h-8 px-2 text-xs"
                  >
                    Debug
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Folder Selection */}
          <div className="space-y-2">
            <Label>Target Folder</Label>
            <Select 
              onValueChange={setFolderId} 
              value={folderId}
              disabled={isLoading || importStarted}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a folder" />
              </SelectTrigger>
              <SelectContent>
                {allFolderOptions.map((folder) => (
                  <SelectItem key={folder.id} value={folder.id}>
                    {folder.isSubfolder 
                      ? `└─ ${folder.name} (in ${folder.parentName})` 
                      : folder.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Question Settings */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Difficulty</Label>
              <Select 
                onValueChange={setDifficulty} 
                value={difficulty}
                disabled={isLoading || importStarted}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select difficulty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="EASY">Easy</SelectItem>
                  <SelectItem value="MEDIUM">Medium</SelectItem>
                  <SelectItem value="HARD">Hard</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Default Mark</Label>
              <Input
                type="number"
                min="0"
                step="0.5"
                value={defaultMark}
                onChange={(e) => setDefaultMark(Number(e.target.value))}
                disabled={isLoading || importStarted}
              />
            </div>
          </div>

          {/* Parsing Results */}
          {isLoading && !importStarted && (
            <div className="flex items-center justify-center p-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2">Parsing file...</span>
            </div>
          )}

          {parseResults && (
            <Card>
              <CardHeader>
                <CardTitle>Parsing Results</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle className="h-5 w-5" />
                    <span>{parseResults.questions.length} valid questions found</span>
                  </div>
                  
                  {/* Preview of Parsed Questions */}
                  <div className="mt-4">
                    <h3 className="text-sm font-medium mb-2">Preview of Parsed Questions:</h3>
                    <div className="space-y-6 max-h-[400px] overflow-y-auto pr-2">
                      {parseResults.questions.map((question, index) => (
                        <div key={index} className="border rounded-lg p-4 bg-muted/50">
                          <p className="font-medium mb-2">{index + 1}. {question.question}</p>
                          <div className="space-y-1 ml-4">
                            {question.options.map((option) => (
                              <div 
                                key={option.key} 
                                className={`flex items-center gap-2 ${
                                  option.key === question.answer ? 'text-green-600 font-medium' : ''
                                }`}
                              >
                                <span className="w-6">{option.key}.</span>
                                <span>{option.text}</span>
                                {option.key === question.answer && (
                                  <CheckCircle className="h-4 w-4" />
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {parseResults.errorBlocks.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 text-red-600">
                        <AlertCircle className="h-5 w-5" />
                        <span>{parseResults.errorBlocks.length} invalid questions</span>
                      </div>
                      
                      <Alert variant="destructive" className="mt-4">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Parsing Issues</AlertTitle>
                        <AlertDescription>
                          <p className="mb-2">
                            Unable to parse {parseResults.errorBlocks.length} questions. Common issues:
                          </p>
                          <ul className="list-disc pl-5 space-y-1 text-sm">
                            <li>Invisible characters or special formatting from copy/paste</li>
                            <li>Missing or malformed ANSWER line (must be "ANSWER: X" where X is an option letter)</li>
                            <li>Option format issues (must be "A. Option text" or "A) Option text")</li>
                            <li>Missing blank line between questions</li>
                            <li>Complex code blocks or special characters</li>
                            <li>Images references in questions (remove [image.png] references)</li>
                          </ul>
                          <div className="mt-3 flex justify-between">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={processSampleData}
                              className="px-2 py-1 h-auto text-xs"
                            >
                              Try Sample
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={examineContent}
                              className="px-2 py-1 h-auto text-xs"
                            >
                              Examine File Format
                            </Button>
                          </div>
                        </AlertDescription>
                      </Alert>
                      
                      <details className="mt-2">
                        <summary className="cursor-pointer text-sm">Show invalid questions</summary>
                        <ul className="pl-5 mt-2 text-sm list-disc">
                          {parseResults.errorBlocks.map((question: string, index: number) => (
                            <li key={index} className="text-red-600">{question.substring(0, 50)}{question.length > 50 ? '...' : ''}</li>
                          ))}
                        </ul>
                      </details>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Import Progress */}
          {importStarted && (
            <div className="space-y-2">
              <Label>Import Progress</Label>
              <div className="w-full bg-muted rounded-full h-2.5">
                <div 
                  className="bg-primary h-2.5 rounded-full" 
                  style={{ width: `${(importProgress / importTotal) * 100}%` }}
                ></div>
              </div>
              <p className="text-sm text-right">{importProgress} of {importTotal}</p>
            </div>
          )}
        </div>

        <DialogFooter className="mt-4 flex justify-between">
          <div className="space-x-2">
            <Button 
              variant="outline" 
              onClick={resetForm}
              disabled={isLoading || (!fileContent && !fileName)}
            >
              Reset
            </Button>
            <Button 
              variant="secondary"
              onClick={processSampleData}
              disabled={isLoading}
            >
              Try Sample
            </Button>
          </div>
          <div className="space-x-2">
            <Button 
              variant="outline" 
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button 
              onClick={importQuestions}
              disabled={isLoading || !fileContent || !parseResults?.questions.length || !folderId || importStarted}
            >
              {isLoading && importStarted ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Importing...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Import {parseResults?.questions.length || 0} Questions
                </>
              )}
            </Button>
            {parseResults?.questions.length && parseResults.questions.length > 0 && (
              <Button 
                onClick={() => {
                  try {
                    // Test by formatting the first question
                    const question = parseResults.questions[0];
                    const formattedQuestion = convertAikenQuestionToFormQuestion(question, folderId);
                    console.log("Test formatted question:", formattedQuestion);
                    console.log("JSON string:", JSON.stringify(formattedQuestion));
                    
                    // Show in UI
                    alert(
                      `Debug: First formatted question\n\n` +
                      `Name: ${formattedQuestion.name}\n` +
                      `Type: ${formattedQuestion.type}\n` +
                      `Options: ${formattedQuestion.mCQQuestion.options.length}\n\n` +
                      `Check browser console for complete details`
                    );
                  } catch (error: any) {
                    console.error("Error in test formatting:", error);
                    alert(`Error formatting test question: ${error.message}`);
                  }
                }}
                variant="outline"
                size="sm"
                className="mt-2"
              >
                Debug Format
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AikenImportModal; 