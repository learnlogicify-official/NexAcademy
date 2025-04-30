import React, { useState, useEffect } from 'react';
import { TableRow, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Eye, Pencil, Trash2, Loader2, ChevronDown, ChevronRight, Code, ListChecks, Clock, CalendarDays, Info, UserCircle2 } from 'lucide-react';
import { Question, MCQOption } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface QuestionRowProps {
  question: Question;
  onSelect: (id: string) => void;
  isSelected: boolean;
  onPreview: (question: Question) => void;
  onEdit: (question: Question) => void;
  onDelete: (id: string) => void;
  allQuestionsExpanded?: boolean;
}

export function QuestionRow({
  question,
  onSelect,
  isSelected,
  onPreview,
  onEdit,
  onDelete,
  allQuestionsExpanded,
}: QuestionRowProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [expandedQuestion, setExpandedQuestion] = useState<Question | null>(null);

  useEffect(() => {
    if (allQuestionsExpanded !== undefined) {
      setIsExpanded(allQuestionsExpanded);
    }
  }, [allQuestionsExpanded]);

  const handleToggle = async () => {
    // Simply toggle expansion without making an API call
    setIsExpanded(!isExpanded);
    // Use the existing question data
    setExpandedQuestion(question);
  };

  const displayQuestion = expandedQuestion || question;

  // Format date to be more readable
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  return (
    <>
      <TableRow className={cn(
        "transition-colors hover:bg-muted/30",
        isSelected ? "bg-primary/5" : "",
        isExpanded ? "border-l-4 border-l-primary" : ""
      )}>
        <TableCell className="w-10">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div>
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={() => onSelect(question.id)}
                    className="data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                  />
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Select for bulk actions</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </TableCell>
        <TableCell className="font-medium">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleToggle}
              className={cn(
                "h-7 w-7 p-0 rounded-full transition-all",
                isExpanded ? "bg-primary text-primary-foreground hover:bg-primary/90" : "hover:bg-muted"
              )}
            >
              {isExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </Button>
            <div className="flex flex-col">
              <span className="font-medium text-foreground">{question.name}</span>
              <span className="text-xs text-muted-foreground truncate max-w-md">
                {question.folder?.name || 'Uncategorized'}
              </span>
            </div>
          </div>
        </TableCell>
        <TableCell className="w-24">
          <Badge 
            className={cn(
              "px-2 py-1 rounded-md font-medium",
              question.type === 'MCQ' 
                ? "bg-purple-100 text-purple-800 hover:bg-purple-100 dark:bg-purple-900/30 dark:text-purple-300" 
                : "bg-blue-100 text-blue-800 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-300"
            )}
            variant="outline"
          >
            <div className="flex items-center gap-1.5">
              {question.type === 'MCQ' ? 
                <ListChecks className="h-3 w-3" /> : 
                <Code className="h-3 w-3" />
              }
              {question.type}
            </div>
          </Badge>
        </TableCell>
        <TableCell className="w-24">
          <Badge 
            className={cn(
              "px-2 py-1 rounded-md font-medium",
              question.status === 'READY' 
                ? "bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-300" 
                : "bg-amber-100 text-amber-800 hover:bg-amber-100 dark:bg-amber-900/30 dark:text-amber-300"
            )}
            variant="outline"
          >
            {question.status}
          </Badge>
        </TableCell>
        <TableCell className="text-muted-foreground">
          <div className="flex items-center gap-1.5 text-sm">
            <CalendarDays className="h-3.5 w-3.5 text-muted-foreground/70" />
            {formatDate(question.updatedAt)}
          </div>
        </TableCell>
        <TableCell className="text-muted-foreground text-sm">
          <div className="flex items-center gap-1.5">
            <UserCircle2 className="h-3.5 w-3.5 text-muted-foreground/70" />
            {question.lastModifiedByName || 'Unknown'}
          </div>
        </TableCell>
        <TableCell>
          <div className="flex items-center gap-1">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => onPreview(question)}
                    className="h-8 w-8 text-muted-foreground hover:text-foreground"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Preview</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => {
                      console.log("Edit button clicked for question:", JSON.stringify(question, null, 2));
                      onEdit(question);
                    }}
                    className="h-8 w-8 text-muted-foreground hover:text-foreground"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Edit</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => onDelete(question.id)}
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Delete</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </TableCell>
      </TableRow>
      
      {isExpanded && (
        <TableRow>
          <TableCell colSpan={7} className="p-0 border-t-0">
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <Card className="m-2 border-0 shadow-sm overflow-hidden">
                {isLoading ? (
                  <div className="flex items-center justify-center p-6">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </div>
                ) : (
                  <CardContent className="p-6">
                    <div className="space-y-6">
                      <div className="flex items-center gap-2 pb-3 border-b">
                        <div className={cn(
                          "p-1.5 rounded-md",
                          displayQuestion.type === 'MCQ' ? 'text-purple-500 bg-purple-50 dark:bg-purple-900/20' : 'text-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        )}>
                          {displayQuestion.type === 'MCQ' ? 
                            <ListChecks className="h-4 w-4" /> :
                            <Code className="h-4 w-4" />
                          }
                        </div>
                        <h3 className="font-semibold text-lg">Question Content</h3>
                      </div>
                      
                      <div className="prose prose-sm max-w-none dark:prose-invert">
                        {displayQuestion.type === 'MCQ' && displayQuestion.mCQQuestion && (
                          <>
                            <div className="bg-muted/30 p-4 rounded-lg border shadow-sm mb-6" dangerouslySetInnerHTML={{ __html: displayQuestion.mCQQuestion.questionText || 'No question text available' }} />
                            
                            <div className="space-y-4">
                              <div className="flex items-center gap-2 font-medium text-base">
                                <div className="p-1 rounded-md bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400">
                                  <ListChecks className="h-4 w-4" />
                                </div>
                                Options
                              </div>
                              
                              <div className="grid grid-cols-1 gap-3">
                                {displayQuestion.mCQQuestion.options?.map((option: MCQOption, index: number) => (
                                  <div
                                    key={option.id}
                                    className={cn(
                                      "p-3 rounded-lg transition-all",
                                      option.grade > 0 
                                        ? 'border-2 border-green-500 bg-green-50/50 dark:bg-green-900/20 shadow-sm' 
                                        : 'border border-border hover:border-muted-foreground'
                                    )}
                                  >
                                    <div className="flex items-start gap-3">
                                      <div className={cn(
                                        "flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium flex-shrink-0 mt-0.5",
                                        option.grade > 0 
                                          ? 'bg-green-500 text-white' 
                                          : 'bg-muted text-muted-foreground'
                                      )}>
                                        {['A', 'B', 'C', 'D', 'E', 'F'][index] || (index + 1).toString()}
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
                            <div className="bg-muted/30 p-4 rounded-lg border shadow-sm mb-6" dangerouslySetInnerHTML={{ __html: displayQuestion.codingQuestion.questionText || 'No question text available' }} />
                            
                            {displayQuestion.codingQuestion.testCases && displayQuestion.codingQuestion.testCases.length > 0 && (
                              <div className="space-y-4 mt-4">
                                <div className="flex items-center gap-2 font-medium text-base">
                                  <div className="p-1 rounded-md bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2H2v10h10V2Z"/><path d="M12 12H2v10h10V12Z"/><path d="M22 2h-5v5h5V2Z"/><path d="M22 12h-5v5h5v-5Z"/><path d="M17 7h5v5h-5V7Z"/><path d="M17 17h5v5h-5v-5Z"/></svg>
                                  </div>
                                  Test Cases
                                </div>
                                
                                <div className="grid grid-cols-1 gap-5">
                                  {displayQuestion.codingQuestion.testCases.map((testCase, index) => {
                                    const tc = testCase as any;
                                    return (
                                      <div key={testCase.id} className="bg-card rounded-lg border overflow-hidden shadow-sm">
                                        <div className="bg-muted/30 px-4 py-2.5 border-b flex justify-between items-center">
                                          <div className="font-medium text-sm flex items-center gap-2">
                                            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-blue-100 text-blue-800 text-xs font-semibold dark:bg-blue-900/40 dark:text-blue-300">
                                              {index + 1}
                                            </span>
                                            Test Case #{index + 1}
                                          </div>
                                          <div className="flex gap-2">
                                            {!tc.isHidden && (
                                              <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 border-blue-200 hover:bg-blue-200 dark:hover:bg-blue-900/60" variant="outline">
                                                Sample
                                              </Badge>
                                            )}
                                            {tc.isHidden && (
                                              <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 border-amber-200 hover:bg-amber-200 dark:hover:bg-amber-900/60" variant="outline">
                                                Hidden
                                              </Badge>
                                            )}
                                          </div>
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x">
                                          <div className="p-3">
                                            <div className="text-xs font-medium uppercase text-muted-foreground mb-2 flex items-center gap-1">
                                              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 7 3 3 3-3"/><path d="M6 10V5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-12a2 2 0 0 1-2-2v-2"/></svg>
                                              Input
                                            </div>
                                            <pre className="text-xs p-3 bg-muted rounded-md text-sm overflow-x-auto max-h-40 whitespace-pre-wrap">
                                              {testCase.input}
                                            </pre>
                                          </div>
                                          <div className="p-3">
                                            <div className="text-xs font-medium uppercase text-muted-foreground mb-2 flex items-center gap-1">
                                              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 17 3-3 3 3"/><path d="M6 14v5a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-12a2 2 0 0 0-2 2v2"/></svg>
                                              Output
                                            </div>
                                            <pre className="text-xs p-3 bg-muted rounded-md text-sm overflow-x-auto max-h-40 whitespace-pre-wrap">
                                              {testCase.output}
                                            </pre>
                                          </div>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </CardContent>
                )}
              </Card>
            </motion.div>
          </TableCell>
        </TableRow>
      )}
    </>
  );
} 