import React, { useState } from 'react';
import { TableRow, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Eye, Pencil, Trash2, Loader2, ChevronDown, ChevronRight } from 'lucide-react';
import { Question, MCQOption } from '@/types';
import axios from 'axios';

interface QuestionRowProps {
  question: Question;
  onSelect: (id: string) => void;
  isSelected: boolean;
  onPreview: (question: Question) => void;
  onEdit: (question: Question) => void;
  onDelete: (id: string) => void;
}

export function QuestionRow({
  question,
  onSelect,
  isSelected,
  onPreview,
  onEdit,
  onDelete,
}: QuestionRowProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [expandedQuestion, setExpandedQuestion] = useState<Question | null>(null);

  const handleToggle = async () => {
    // Simply toggle expansion without making an API call
    setIsExpanded(!isExpanded);
    // Use the existing question data
    setExpandedQuestion(question);
  };

  const displayQuestion = expandedQuestion || question;

  // Helper function to determine test case type
  const getTestCaseType = (testCase: any) => {
    console.log('Checking test case:', testCase);
    
    // For debugging in browser console
    if (testCase) {
      const keys = Object.keys(testCase);
      console.log('Keys in test case:', keys);
      
      // Log the actual values
      console.log('isSample:', testCase.isSample);
      console.log('isHidden:', testCase.isHidden);
      console.log('type:', testCase.type);
    }
    
    // Direct property checks
    if (testCase.isHidden === false) {
      return 'sample';
    }
    
    if (testCase.isHidden === true) {
      return 'hidden';
    }
    
    // Default to normal for tests without specific flags
    return 'normal';
  };

  return (
    <>
      <TableRow className="hover:bg-muted/50">
        <TableCell>
          <Checkbox
            checked={isSelected}
            onCheckedChange={() => onSelect(question.id)}
          />
        </TableCell>
        <TableCell>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleToggle}
              className="h-8 w-8 hover:bg-muted"
            >
              {isExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </Button>
            <span className="font-medium">{question.name}</span>
          </div>
        </TableCell>
        <TableCell>
          <Badge variant={question.type === 'MCQ' ? 'default' : 'secondary'}>
            {question.type}
          </Badge>
        </TableCell>
        <TableCell>
          <Badge variant={question.status === 'READY' ? 'default' : 'secondary'}>
            {question.status}
          </Badge>
        </TableCell>
        <TableCell>{new Date(question.updatedAt).toLocaleString()}</TableCell>
        <TableCell>{question.lastModifiedByName}</TableCell>
        <TableCell>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => onPreview(question)}>
              <Eye className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => onEdit(question)}>
              <Pencil className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => onDelete(question.id)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </TableCell>
      </TableRow>
      {isExpanded && (
        <TableRow>
          <TableCell colSpan={7} className="bg-muted/30 p-4">
            {isLoading ? (
              <div className="flex items-center justify-center p-4">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : (
              <div className="space-y-4">
                <div className="font-medium text-lg text-foreground flex items-center gap-2 pb-2 border-b">
                  <div className={displayQuestion.type === 'MCQ' ? 'text-purple-500' : 'text-blue-500'}>
                    {displayQuestion.type === 'MCQ' ? 
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-list-checks"><path d="m3 17 2 2 4-4"/><path d="m3 7 2 2 4-4"/><path d="M13 6h8"/><path d="M13 12h8"/><path d="M13 18h8"/></svg> :
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-code"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
                    }
                  </div>
                  Question Content
                </div>
                <div className="prose prose-sm max-w-none dark:prose-invert">
                  {displayQuestion.type === 'MCQ' && displayQuestion.mCQQuestion && (
                    <>
                      <div className="bg-card p-4 rounded-md border shadow-sm mb-6" dangerouslySetInnerHTML={{ __html: displayQuestion.mCQQuestion.questionText || 'No question text available' }} />
                      <div className="space-y-3">
                        <div className="font-medium text-foreground flex items-center gap-2">
                          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-500"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>
                          Options
                        </div>
                        <div className="grid grid-cols-1 gap-3">
                          {displayQuestion.mCQQuestion.options?.map((option: MCQOption, index: number) => (
                            <div
                              key={option.id}
                              className={`p-3 rounded-lg transition-all ${
                                option.grade > 0 ? 'border-green-500 bg-green-50 dark:bg-green-900/20 shadow-sm' : 'border border-border hover:border-muted-foreground'
                              }`}
                            >
                              <div className="flex items-start gap-3">
                                <div className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium flex-shrink-0 mt-0.5 ${
                                  option.grade > 0 ? 'bg-green-500 text-white' : 'bg-muted text-muted-foreground'
                                }`}>
                                  {index + 1}
                                </div>
                                <div className="flex-1">
                                  <div className="text-foreground" dangerouslySetInnerHTML={{ __html: option.text || 'No option text available' }} />
                                  {option.feedback && (
                                    <div className="text-sm text-muted-foreground mt-2 border-t pt-2">
                                      <span className="font-medium">Feedback:</span> {option.feedback}
                                    </div>
                                  )}
                                </div>
                                {option.grade > 0 && (
                                  <Badge className="ml-2 bg-green-500 hover:bg-green-600" variant="default">Correct</Badge>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                  {displayQuestion.type === 'CODING' && displayQuestion.codingQuestion && (
                    <>
                      <div className="bg-card p-4 rounded-md border shadow-sm mb-6" dangerouslySetInnerHTML={{ __html: displayQuestion.codingQuestion.questionText || 'No question text available' }} />
                      {displayQuestion.codingQuestion.testCases && displayQuestion.codingQuestion.testCases.length > 0 && (
                        <div className="space-y-3 mt-4">
                          <div className="font-medium text-foreground flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500"><path d="M12 2H2v10h10V2Z"/><path d="M12 12H2v10h10V12Z"/><path d="M22 2h-5v5h5V2Z"/><path d="M22 12h-5v5h5v-5Z"/><path d="M17 7h5v5h-5V7Z"/><path d="M17 17h5v5h-5v-5Z"/></svg>
                            Test Cases
                          </div>
                          <div className="grid grid-cols-1 gap-4">
                            {displayQuestion.codingQuestion.testCases.map((testCase, index) => {
                              // Access the test case directly
                              const tc = testCase as any;
                              
                              return (
                              <div key={testCase.id} className="bg-card rounded-lg border overflow-hidden shadow-sm mb-3">
                                <div className="bg-muted/50 px-4 py-2 border-b flex justify-between items-center">
                                  <div className="font-medium text-sm">Test Case #{index + 1}</div>
                                  <div className="flex gap-2">
                                    {/* Sample badge for non-hidden test cases */}
                                    {!tc.isHidden && (
                                      <Badge className="bg-blue-500 text-white font-medium" variant="default">
                                        Sample
                                      </Badge>
                                    )}
                                    {/* Hidden badge for hidden test cases */}
                                    {tc.isHidden && (
                                      <Badge className="bg-amber-500 text-white font-medium" variant="default">
                                        Hidden
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x">
                                  <div className="p-3">
                                    <div className="text-xs font-medium uppercase text-muted-foreground mb-2 flex items-center gap-1">
                                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
                                      Input
                                    </div>
                                    <pre className="text-xs p-3 bg-muted rounded text-sm overflow-x-auto max-h-40 whitespace-pre-wrap">
                                      {testCase.input}
                                    </pre>
                                  </div>
                                  <div className="p-3">
                                    <div className="text-xs font-medium uppercase text-muted-foreground mb-2 flex items-center gap-1">
                                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
                                      Output
                                    </div>
                                    <pre className="text-xs p-3 bg-muted rounded text-sm overflow-x-auto max-h-40 whitespace-pre-wrap">
                                      {testCase.output}
                                    </pre>
                                  </div>
                                </div>
                                
                              </div>
                            )})}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            )}
          </TableCell>
        </TableRow>
      )}
    </>
  );
} 