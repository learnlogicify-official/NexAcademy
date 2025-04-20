import React from 'react';
import { TableRow, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Eye, Pencil, Trash2 } from 'lucide-react';
import { Question } from '@/types';
import { ChevronDownIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

interface QuestionRowProps {
  question: Question;
  onSelect: (id: string) => void;
  isSelected: boolean;
  onPreview: (question: Question) => void;
  onEdit: (question: Question) => void;
  onDelete: (id: string) => void;
  isExpanded?: boolean;
  onToggle?: () => void;
}

export function QuestionRow({
  question,
  onSelect,
  isSelected,
  onPreview,
  onEdit,
  onDelete,
  isExpanded,
  onToggle,
}: QuestionRowProps) {
  const [localExpanded, setLocalExpanded] = React.useState(false);
  const expanded = isExpanded !== undefined ? isExpanded : localExpanded;

  const handleToggle = () => {
    if (onToggle) {
      onToggle();
    } else {
      setLocalExpanded(!expanded);
    }
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
              className="h-8 w-8"
            >
              {expanded ? (
                <ChevronDownIcon className="h-4 w-4" />
              ) : (
                <ChevronRightIcon className="h-4 w-4" />
              )}
            </Button>
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
      {expanded && (
        <TableRow>
          <TableCell colSpan={8} className="bg-muted/30 p-4">
            <div className="space-y-4">
              <div className="font-medium">Question Content:</div>
              <div dangerouslySetInnerHTML={{ __html: question.mCQQuestion?.questionText || question.codingQuestion?.questionText || '' }} />
              
              {question.type === 'MCQ' && question.mCQQuestion?.options && (
                <div className="space-y-2">
                  <div className="font-medium">Options:</div>
                  <div className="grid grid-cols-1 gap-2">
                    {question.mCQQuestion.options.map((option: { id: string; text: string; grade: number }, index: number) => (
                      <div
                        key={option.id}
                        className={`p-2 rounded ${
                          option.grade > 0 ? 'bg-green-100 dark:bg-green-900/20' : 'bg-background'
                        }`}
                      >
                        {index + 1}. {option.text}
                        {option.grade > 0 && (
                          <Badge className="ml-2" variant="default">
                            Correct
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </TableCell>
        </TableRow>
      )}
    </>
  );
} 