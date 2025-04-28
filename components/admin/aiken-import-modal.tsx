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
import { Badge } from '@/components/ui/badge';

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
    // Split the text by lines and filter out empty lines
    const lines = normalizedText.split('\n').filter(line => line.trim());

    const questions: AikenQuestion[] = [];
    const errorBlocks: string[] = [];
    let failedCount = 0;

    let i = 0;
    while (i < lines.length) {
      try {
        // The first line is the question text
        const q_text = lines[i].trim();
        i += 1;

        // Parse options (A), B), etc. or A., B., etc.)
        const optionsArray: { key: string; text: string }[] = [];
        const optionsKeys: Set<string> = new Set();

        while (i < lines.length && /^[A-Z][\)\.:]/.test(lines[i])) {
          const optMatch = lines[i].match(/^([A-Z])[\)\.:](.*)$/);
          if (optMatch) {
            const key = optMatch[1]; // The option letter (A, B, C, etc.)
            const text = optMatch[2].trim(); // The option text
            optionsArray.push({ key, text });
            optionsKeys.add(key);
          }
          i += 1;
        }

        // Check for ANSWER: line
        if (i < lines.length && /^ANSWER:\s*[A-Z]/.test(lines[i])) {
          const answerMatch = lines[i].match(/^ANSWER:\s*([A-Z])/);
          if (answerMatch) {
            const answer = answerMatch[1];

            // Validate the answer exists in options
            if (!optionsKeys.has(answer)) {
              console.log(`Error: Answer ${answer} doesn't match any option`);
              errorBlocks.push(q_text);
              failedCount++;
            } else {
              // Add valid question
              questions.push({
                question: q_text,
                options: optionsArray,
                answer: answer
              });
            }
            i += 1;
          } else {
            throw new Error(`Invalid ANSWER format at line ${i}`);
          }
        } else {
          console.log(`Malformed question at line ${i}: Missing ANSWER`);
          errorBlocks.push(q_text);
          failedCount++;

          // Skip to next potential question
          while (i < lines.length &&
            (/^[A-Z][\)\.:]/.test(lines[i]) || /^ANSWER:/.test(lines[i]))) {
            i += 1;
          }
        }
      } catch (error) {
        console.error("Error parsing question:", error);
        errorBlocks.push(lines[i] || "Unknown line");
        failedCount++;
        i += 1; // Move to next line and try to recover
      }
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
      status: 'READY',
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

  // Organize folders in a hierarchical structure
  const organizedFolders = React.useMemo(() => {
    // Filter top-level folders (those without parentId)
    return folders.filter(folder => !folder.parentId);
  }, [folders]);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // ... existing code ...
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Import Moodle Aiken Format MCQ Questions
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          {/* Left Panel - Instructions and Settings */}
          <div className="md:col-span-2 space-y-6">
            {/* Instructions */}
            <Card className="bg-gradient-to-br from-primary/5 to-background shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Aiken Format Guide
                </CardTitle>
                <CardDescription>
                  A simple format for MCQ questions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <pre className="bg-card/50 p-2 text-xs rounded-md my-2 whitespace-pre-wrap border text-foreground/80">
                  What is the capital of France?{'\n'}
                  A. London{'\n'}
                  B. Berlin{'\n'}
                  C. Paris{'\n'}
                  D. Madrid{'\n'}
                  ANSWER: C
                </pre>
                <div className="mt-4 flex justify-between">
                  <a
                    href="/sample-aiken.txt"
                    download="sample-aiken.txt"
                    className="text-xs text-primary hover:underline flex items-center"
                  >
                    <Download className="h-3 w-3 mr-1" />
                    Download sample file
                  </a>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={processSampleData}
                    className="text-xs h-auto py-1"
                  >
                    Try sample data
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* File Upload */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Upload Aiken File</CardTitle>
                <CardDescription>
                  Select a .txt file in Aiken format
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col space-y-2">
                  <Input
                    type="file"
                    accept=".txt"
                    onChange={handleFileChange}
                    className="file:mr-4 file:py-2 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90 text-xs"
                    disabled={isLoading || importStarted}
                  />
                  {fileName && (
                    <div className="flex items-center mt-2 text-xs bg-muted p-1.5 px-2 rounded-md">
                      <div className="flex-1 truncate text-muted-foreground">
                        {fileName}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Question Settings */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Import Settings</CardTitle>
                <CardDescription>
                  Configure imported questions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="target-folder" className="text-sm">Target Folder</Label>
                    <Select
                      onValueChange={setFolderId}
                      value={folderId}
                      disabled={isLoading || importStarted}
                    >
                      <SelectTrigger id="target-folder" className="text-sm">
                        <SelectValue placeholder="Select a folder" />
                      </SelectTrigger>
                      <SelectContent className="max-h-[300px]">
                        {folders
                          .filter(folder => !folder.parentId)
                          .map(folder => (
                            <React.Fragment key={folder.id}>
                              <SelectItem value={folder.id} className="font-medium">
                                {folder.name}
                              </SelectItem>
                              {folders
                                .filter(sub => sub.parentId === folder.id)
                                .map(subfolder => (
                                  <SelectItem key={subfolder.id} value={subfolder.id} className="pl-6 text-sm">
                                    └─ {subfolder.name}
                                  </SelectItem>
                                ))}
                            </React.Fragment>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor="difficulty" className="text-sm">Difficulty</Label>
                      <Select
                        onValueChange={setDifficulty}
                        value={difficulty}
                        disabled={isLoading || importStarted}
                      >
                        <SelectTrigger id="difficulty" className="text-sm">
                          <SelectValue placeholder="Select difficulty" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="EASY" className="text-sm">Easy</SelectItem>
                          <SelectItem value="MEDIUM" className="text-sm">Medium</SelectItem>
                          <SelectItem value="HARD" className="text-sm">Hard</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="default-mark" className="text-sm">Default Mark</Label>
                      <Input
                        id="default-mark"
                        type="number"
                        min="0"
                        step="0.5"
                        value={defaultMark}
                        onChange={(e) => setDefaultMark(Number(e.target.value))}
                        disabled={isLoading || importStarted}
                        className="text-sm"
                      />
                    </div>
                  </div>

                  <div className="pt-2">
                    <Button
                      onClick={importQuestions}
                      disabled={isLoading || !fileContent || !parseResults?.questions.length || !folderId || importStarted}
                      className="w-full"
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
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Panel - Parsing Results */}
          <div className="md:col-span-3">
            {isLoading && !importStarted ? (
              <div className="flex flex-col items-center justify-center h-full py-12">
                <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                <p className="text-muted-foreground">Parsing file...</p>
              </div>
            ) : !parseResults ? (
              <div className="flex flex-col items-center justify-center bg-muted/30 rounded-lg py-20 px-6 h-full">
                <FileText className="h-16 w-16 text-muted-foreground/40 mb-4" />
                <h3 className="text-lg font-medium mb-2 text-center">No file parsed yet</h3>
                <p className="text-sm text-muted-foreground text-center mb-6">
                  Upload a text file in Aiken format or try the sample data
                </p>
                <Button variant="outline" size="sm" onClick={processSampleData}>
                  Try Sample Data
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Stats Summary */}
                <div className="grid grid-cols-2 gap-3">
                  <Card className="bg-gradient-to-br from-green-50 to-background dark:from-green-900/10 dark:to-background border-green-100 dark:border-green-900/30">
                    <CardContent className="p-4 flex items-center justify-between">
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Valid Questions</p>
                        <p className="text-2xl font-bold text-green-600 dark:text-green-400">{parseResults.questions.length}</p>
                      </div>
                      <CheckCircle className="h-8 w-8 text-green-500 dark:text-green-400" />
                    </CardContent>
                  </Card>

                  {parseResults.errorBlocks.length > 0 ? (
                    <Card className="bg-gradient-to-br from-red-50 to-background dark:from-red-900/10 dark:to-background border-red-100 dark:border-red-900/30">
                      <CardContent className="p-4 flex items-center justify-between">
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Invalid Questions</p>
                          <p className="text-2xl font-bold text-red-600 dark:text-red-400">{parseResults.errorBlocks.length}</p>
                        </div>
                        <AlertCircle className="h-8 w-8 text-red-500 dark:text-red-400" />
                      </CardContent>
                    </Card>
                  ) : (
                    <Card className="bg-gradient-to-br from-blue-50 to-background dark:from-blue-900/10 dark:to-background border-blue-100 dark:border-blue-900/30">
                      <CardContent className="p-4 flex items-center justify-between">
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Status</p>
                          <p className="text-xl font-bold text-blue-600 dark:text-blue-400">Ready to Import</p>
                        </div>
                        <Upload className="h-8 w-8 text-blue-500 dark:text-blue-400" />
                      </CardContent>
                    </Card>
                  )}
                </div>

                {/* Preview of Parsed Questions */}
                {parseResults.questions.length > 0 && (
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span>Valid Questions Preview</span>
                        </div>
                        <Badge variant="outline" className="font-normal">
                          {parseResults.questions.length} questions
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="max-h-[320px] overflow-y-auto pr-2 pt-1">
                      <div className="space-y-3">
                        {parseResults.questions.map((question, index) => (
                          <div key={index} className="border rounded-lg p-3 bg-card shadow-sm hover:bg-accent/5 transition-colors">
                            <p className="text-sm font-medium mb-2 line-clamp-2">{index + 1}. {question.question}</p>
                            <div className="grid grid-cols-2 gap-x-3 gap-y-1 pl-1">
                              {question.options.map((option) => (
                                <div
                                  key={option.key}
                                  className={`flex items-center text-xs gap-1 ${option.key === question.answer
                                      ? 'text-green-600 dark:text-green-400 font-medium'
                                      : 'text-muted-foreground'
                                    }`}
                                >
                                  <span className="w-5 flex-shrink-0">{option.key}.</span>
                                  <span className="truncate">{option.text}</span>
                                  {option.key === question.answer && (
                                    <CheckCircle className="h-3 w-3 ml-auto flex-shrink-0" />
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Error Information */}
                {parseResults.errorBlocks.length > 0 && (
                  <Card className="border-red-200 dark:border-red-900/50">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base flex items-center text-red-600">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        Parsing Issues
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm mb-2">
                        Unable to parse {parseResults.errorBlocks.length} questions. Common issues:
                      </p>
                      <ul className="list-disc pl-5 space-y-1 text-xs text-muted-foreground mb-3">
                        <li>Missing or malformed ANSWER line (must be "ANSWER: X" where X is an option letter)</li>
                        <li>Option format issues (must be "A. Text" or "A) Text")</li>
                        <li>Missing blank line between questions</li>
                        <li>Special characters or invisible formatting</li>
                      </ul>

                      <details className="text-xs">
                        <summary className="cursor-pointer font-medium text-red-600 mb-1">Show invalid questions</summary>
                        <ul className="pl-5 mt-1 space-y-1 list-disc">
                          {parseResults.errorBlocks.map((question: string, index: number) => (
                            <li key={index} className="text-muted-foreground">
                              {question.substring(0, 40)}{question.length > 40 ? '...' : ''}
                            </li>
                          ))}
                        </ul>
                      </details>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {/* Import Progress */}
            {importStarted && (
              <Card className="mt-4">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center justify-between">
                    <span>Import Progress</span>
                    <span className="text-sm font-normal">{importProgress} of {importTotal}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all duration-300"
                        style={{ width: `${(importProgress / importTotal) * 100}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Importing questions... Please wait.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-between sm:space-x-2 mt-6 border-t pt-4">
          <div className="flex justify-start mt-3 sm:mt-0">
            <Button
              variant="outline"
              onClick={resetForm}
              disabled={isLoading || (!fileContent && !fileName)}
              size="sm"
            >
              Reset
            </Button>
          </div>
          <div className="flex justify-end">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
              className="mr-2"
              size="sm"
            >
              Cancel
            </Button>
            <Button
              onClick={importQuestions}
              disabled={isLoading || !fileContent || !parseResults?.questions.length || !folderId || importStarted}
              size="sm"
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
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AikenImportModal; 