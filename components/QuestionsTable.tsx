import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Question } from '@/types';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';

interface QuestionsTableProps {
  questions: Question[];
  onEdit: (question: Question) => void;
  onDelete: (question: Question) => void;
  page: number;
  limit: number;
  totalPages: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
}

export default function QuestionsTable({
  questions,
  onEdit,
  onDelete,
  page,
  limit,
  totalPages,
  totalItems,
  onPageChange,
  onLimitChange,
}: QuestionsTableProps) {
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);

  const handleEdit = (question: Question) => {
    setSelectedQuestion(question);
    onEdit(question);
  };

  const handleDelete = (question: Question) => {
    if (window.confirm('Are you sure you want to delete this question?')) {
      onDelete(question);
    }
  };

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Difficulty</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Folder</TableHead>
              <TableHead>Version</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {questions.map((question) => (
              <TableRow key={question.id}>
                <TableCell className="font-medium">{question.name}</TableCell>
                <TableCell>
                  <Badge variant="outline">{question.type}</Badge>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={
                      question.difficulty === 'EASY'
                        ? 'success'
                        : question.difficulty === 'MEDIUM'
                        ? 'warning'
                        : 'destructive'
                    }
                  >
                    {question.difficulty}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={
                      question.status === 'DRAFT'
                        ? 'secondary'
                        : question.status === 'PUBLISHED'
                        ? 'success'
                        : 'destructive'
                    }
                  >
                    {question.status}
                  </Badge>
                </TableCell>
                <TableCell>{question.folder?.name || 'Uncategorized'}</TableCell>
                <TableCell>{question.version}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(question)}
                    >
                      <PencilIcon className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(question)}
                    >
                      <TrashIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            Rows per page
          </span>
          <Select
            value={limit.toString()}
            onValueChange={(value) => onLimitChange(Number(value))}
          >
            <SelectTrigger className="w-[70px]">
              <SelectValue placeholder="10" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5">5</SelectItem>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="20">20</SelectItem>
              <SelectItem value="50">50</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            {`${(page - 1) * limit + 1}-${Math.min(
              page * limit,
              totalItems
            )} of ${totalItems}`}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(page - 1)}
            disabled={page === 1}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(page + 1)}
            disabled={page === totalPages}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
} 