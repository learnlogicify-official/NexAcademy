import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';

interface Question {
  id: string;
  title: string;
  description: string;
  type: string;
  options: string[];
  correctAnswers: string[];
  points: number;
  difficulty: string;
  tags: string[];
  hidden: boolean;
  singleAnswer: boolean;
  shuffleAnswers: boolean;
  folderId: string;
  subfolderId?: string;
  status: "READY" | "DRAFT" | "NEEDS_REVIEW";
  version: number;
  createdBy: {
    name: string;
    id: string;
  };
  comments: number;
  needsChecking: boolean;
  facilityIndex: number | null;
  discriminativeEfficiency: number | null;
  usage: number;
  lastUsed: string | null;
  modifiedBy: {
    name: string;
    id: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface QuestionFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Question) => void;
  initialData?: Question;
}

const formSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  type: z.string().min(1, 'Question type is required'),
  points: z.number().min(0, 'Points must be non-negative'),
  difficulty: z.string().min(1, 'Difficulty is required'),
  hidden: z.boolean(),
  singleAnswer: z.boolean(),
  shuffleAnswers: z.boolean(),
  folderId: z.string().min(1, 'Folder is required'),
  subfolderId: z.string().optional(),
});

type QuestionFormData = z.infer<typeof formSchema>;

const QuestionFormModal: React.FC<QuestionFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}) => {
  const { toast } = useToast();
  const [options, setOptions] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<string>('');
  const [selectedSubfolder, setSelectedSubfolder] = useState<string>('');

  const form = useForm<QuestionFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
      type: 'MULTIPLE_CHOICE',
      points: 1,
      difficulty: 'EASY',
      hidden: false,
      singleAnswer: true,
      shuffleAnswers: true,
      folderId: '',
    },
  });

  const toBool = (value: string | boolean): boolean => {
    if (typeof value === 'boolean') return value;
    return value.toLowerCase() === 'true';
  };

  useEffect(() => {
    if (initialData) {
      const formData = {
        ...initialData,
        hidden: toBool(initialData.hidden),
        singleAnswer: toBool(initialData.singleAnswer),
        shuffleAnswers: toBool(initialData.shuffleAnswers),
      };
      form.reset(formData);
      setSelectedFolder(initialData.folderId);
      setSelectedSubfolder(initialData.subfolderId || "");
      setOptions(initialData.options || []);
      setSelectedTags(initialData.tags || []);
    }
  }, [initialData, form]);

  const handleSubmit = (data: QuestionFormData) => {
    const submissionData: Question = {
      id: initialData?.id || '',
      title: data.title,
      description: data.description || '',
      type: data.type,
      points: data.points,
      difficulty: data.difficulty,
      hidden: toBool(data.hidden),
      singleAnswer: toBool(data.singleAnswer),
      shuffleAnswers: toBool(data.shuffleAnswers),
      folderId: data.folderId,
      subfolderId: data.subfolderId,
      correctAnswers: initialData?.correctAnswers || [],
      options,
      tags: selectedTags,
      status: initialData?.status || 'DRAFT',
      version: initialData?.version || 1,
      createdBy: initialData?.createdBy || { name: '', id: '' },
      comments: initialData?.comments || 0,
      needsChecking: initialData?.needsChecking || false,
      facilityIndex: initialData?.facilityIndex || null,
      discriminativeEfficiency: initialData?.discriminativeEfficiency || null,
      usage: initialData?.usage || 0,
      lastUsed: initialData?.lastUsed || null,
      modifiedBy: initialData?.modifiedBy || { name: '', id: '' },
      createdAt: initialData?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    onSubmit(submissionData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{initialData ? 'Edit Question' : 'Create Question'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          {/* Form fields will go here */}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              {initialData ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default QuestionFormModal;