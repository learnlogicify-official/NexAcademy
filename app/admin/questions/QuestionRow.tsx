import React, { useState } from 'react';
import { TableRow, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Eye, Pencil, Trash2, Loader2 } from 'lucide-react';
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
    if (!isExpanded) {
      setIsLoading(true);
      try {
        const response = await axios.get(`/api/questions/${question.id}`);
        setExpandedQuestion(response.data);
      } catch (error) {
        console.error('Error fetching question details:', error);
      } finally {
        setIsLoading(false);
      }
    }
    setIsExpanded(!isExpanded);
  };

  const displayQuestion = expandedQuestion || question;

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
            <Switch
              checked={isExpanded}
              onCheckedChange={handleToggle}
              className="question-row-toggle"
            />
            <span>{question.name}</span>
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
        <TableCell>
          <Badge variant="outline">v{question.version}</Badge>
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
          <TableCell colSpan={8} className="bg-muted/30 p-4">
            {isLoading ? (
              <div className="flex items-center justify-center p-4">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : (
              <div className="space-y-4">
                <div className="font-medium">Question Content:</div>
                <div className="prose max-w-none">
                  {displayQuestion.type === 'MCQ' && displayQuestion.mCQQuestion && (
                    <>
                      <div className="mb-4" dangerouslySetInnerHTML={{ __html: displayQuestion.mCQQuestion.questionText || 'No question text available' }} />
                      <div className="space-y-2">
                        <div className="font-medium">Options:</div>
                        <div className="grid grid-cols-1 gap-2">
                          {displayQuestion.mCQQuestion.options?.map((option: MCQOption, index: number) => (
                            <div
                              key={option.id}
                              className={`p-3 rounded border ${
                                option.grade > 0 ? 'border-green-500 bg-green-50 dark:bg-green-900/20' : 'border-border'
                              }`}
                            >
                              <div className="flex items-start gap-2">
                                <span className="font-medium">{index + 1}.</span>
                                <div className="flex-1">
                                  <div dangerouslySetInnerHTML={{ __html: option.text || 'No option text available' }} />
                                  {option.feedback && (
                                    <div className="text-sm text-muted-foreground mt-1">
                                      Feedback: {option.feedback}
                                    </div>
                                  )}
                                </div>
                                {option.grade > 0 && (
                                  <Badge variant="default">Correct</Badge>
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
                      <div className="mb-4" dangerouslySetInnerHTML={{ __html: displayQuestion.codingQuestion.questionText || 'No question text available' }} />
                      {displayQuestion.codingQuestion.languageOptions && displayQuestion.codingQuestion.languageOptions.length > 0 && (
                        <div className="space-y-2">
                          <div className="font-medium">Language Options:</div>
                          <div className="grid grid-cols-1 gap-2">
                            {displayQuestion.codingQuestion.languageOptions.map((option) => (
                              <div key={option.id} className="p-3 rounded border border-border">
                                <div className="font-medium mb-2">{option.language}</div>
                                {option.solution && (
                                  <pre className="mt-2 p-3 bg-muted rounded text-sm overflow-x-auto">
                                    {option.solution}
                                  </pre>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      {displayQuestion.codingQuestion.testCases && displayQuestion.codingQuestion.testCases.length > 0 && (
                        <div className="space-y-2 mt-4">
                          <div className="font-medium">Test Cases:</div>
                          <div className="grid grid-cols-1 gap-2">
                            {displayQuestion.codingQuestion.testCases.map((testCase) => (
                              <div key={testCase.id} className="p-3 rounded border border-border">
                                <div className="flex items-start gap-2">
                                  <div className="font-medium">Input:</div>
                                  <pre className="flex-1 p-2 bg-muted rounded text-sm overflow-x-auto">
                                    {testCase.input}
                                  </pre>
                                </div>
                                <div className="flex items-start gap-2 mt-2">
                                  <div className="font-medium">Output:</div>
                                  <pre className="flex-1 p-2 bg-muted rounded text-sm overflow-x-auto">
                                    {testCase.output}
                                  </pre>
                                </div>
                                {testCase.isHidden && (
                                  <Badge className="mt-2" variant="secondary">
                                    Hidden Test Case
                                  </Badge>
                                )}
                              </div>
                            ))}
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