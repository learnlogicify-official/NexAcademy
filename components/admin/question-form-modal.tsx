"use client";

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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Code, ListChecks, Tag, X, Folder, FolderOpen, Loader2 } from 'lucide-react';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import { Badge } from '@/components/ui/badge';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from "@/components/ui/checkbox";
import { FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Form } from "@/components/ui/form";
import { Question, Folder as FolderType, Subfolder as SubfolderType } from '@/types';

interface QuestionFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<Question>) => void;
  initialData?: Partial<Question>;
  folders: FolderType[];
  subfolders: SubfolderType[];
  onAddFolder: (name: string) => void;
  onAddSubfolder: (folderId: string, name: string) => void;
}

interface Option {
  id: string;
  content: string;
  grade: number;
}

const formSchema = z.object({
  question: z.string().min(1, 'Question is required'),
  type: z.enum(['MULTIPLE_CHOICE', 'CODING']),
  folderId: z.string().min(1, 'Folder is required'),
  subfolderId: z.string().optional(),
  options: z.array(z.string()).optional(),
  correctAnswer: z.string().optional(),
  testCases: z.array(z.any()).optional(),
  expectedOutput: z.string().optional(),
  hidden: z.boolean().optional(),
});

type QuestionFormData = z.infer<typeof formSchema>;

export function QuestionFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  folders,
  subfolders,
  onAddFolder,
  onAddSubfolder,
}: QuestionFormModalProps) {
  const { toast } = useToast();
  const [options, setOptions] = useState<Option[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<string>('');
  const [testCases, setTestCases] = useState<Array<{ input: string; output: string; isHidden: boolean }>>([]);
  const [questionContent, setQuestionContent] = useState<string>('');
  const [isTagPopoverOpen, setIsTagPopoverOpen] = useState(false);
  const [availableTags] = useState<string[]>([
    'JavaScript', 'Python', 'Java', 'C++', 'Algorithms',
    'Data Structures', 'Web Development', 'Database',
    'System Design', 'Frontend', 'Backend', 'DevOps'
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<QuestionFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      question: '',
      type: 'MULTIPLE_CHOICE',
      folderId: '',
      hidden: false,
    },
  });

  const questionType = form.watch('type');

  const toBool = (value: string | boolean | undefined): boolean => {
    if (typeof value === 'boolean') return value;
    if (!value) return false;
    return value.toLowerCase() === 'true';
  };

  useEffect(() => {
    if (initialData) {
      const formData = {
        ...initialData,
        hidden: toBool(initialData.hidden),
      };
      form.reset(formData);
      setSelectedFolder(initialData.folderId || '');
      setOptions(initialData.options?.map(content => ({ id: Math.random().toString(), content, grade: 0 })) || []);
      setTestCases(initialData.testCases || []);
      setQuestionContent(initialData.question || '');
    } else {
      form.reset({
        question: '',
        type: 'MULTIPLE_CHOICE',
        folderId: '',
        hidden: false,
      });
      setSelectedFolder('');
      setOptions([]);
      setTestCases([]);
      setQuestionContent('');
    }
  }, [initialData, form]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = form.getValues();
    
    try {
      const submissionData = {
        ...formData,
        question: formData.question,
        type: formData.type,
        folderId: formData.folderId,
        subfolderId: formData.subfolderId,
        options: formData.type === 'MULTIPLE_CHOICE' ? options.map(opt => opt.content) : undefined,
        correctAnswer: formData.type === 'MULTIPLE_CHOICE' ? options.find(opt => opt.grade > 0)?.content : undefined,
        testCases: formData.type === 'CODING' ? testCases : undefined,
        expectedOutput: formData.type === 'CODING' ? testCases[0]?.output : undefined,
        hidden: formData.hidden || false,
        id: initialData?.id || '',
        createdAt: initialData?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      onSubmit(submissionData);
      onClose();
    } catch (error) {
      console.error('Error submitting form:', error);
      toast({
        title: 'Error',
        description: 'Failed to submit question',
        variant: 'destructive',
      });
    }
  };

  const renderMCQForm = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Question Content</Label>
        <RichTextEditor
          content={questionContent}
          onChange={setQuestionContent}
          placeholder="Enter your question here..."
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Options</Label>
          {options.map((option, index) => (
            <div key={option.id} className="space-y-2 p-4 border rounded-lg">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <RichTextEditor
                    content={option.content}
                    onChange={(content) => {
                      const newOptions = [...options];
                      newOptions[index].content = content;
                      setOptions(newOptions);
                    }}
                    placeholder="Enter option content..."
                  />
                </div>
                <div className="ml-4 w-32">
                  <Select
                    value={option.grade.toString()}
                    onValueChange={(value) => {
                      const newOptions = [...options];
                      newOptions[index].grade = parseFloat(value);
                      setOptions(newOptions);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Grade" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">None</SelectItem>
                      <SelectItem value="100">100%</SelectItem>
                      <SelectItem value="90">90%</SelectItem>
                      <SelectItem value="83.33333">83.33333%</SelectItem>
                      <SelectItem value="75">75%</SelectItem>
                      <SelectItem value="66.66667">66.66667%</SelectItem>
                      <SelectItem value="50">50%</SelectItem>
                      <SelectItem value="40">40%</SelectItem>
                      <SelectItem value="33.33333">33.33333%</SelectItem>
                      <SelectItem value="25">25%</SelectItem>
                      <SelectItem value="20">20%</SelectItem>
                      <SelectItem value="16.66667">16.66667%</SelectItem>
                      <SelectItem value="14.28571">14.28571%</SelectItem>
                      <SelectItem value="12.5">12.5%</SelectItem>
                      <SelectItem value="11.11111">11.11111%</SelectItem>
                      <SelectItem value="10">10%</SelectItem>
                      <SelectItem value="5">5%</SelectItem>
                      <SelectItem value="-5">-5%</SelectItem>
                      <SelectItem value="-10">-10%</SelectItem>
                      <SelectItem value="-16.66667">-16.66667%</SelectItem>
                      <SelectItem value="-20">-20%</SelectItem>
                      <SelectItem value="-25">-25%</SelectItem>
                      <SelectItem value="-33.33333">-33.33333%</SelectItem>
                      <SelectItem value="-50">-50%</SelectItem>
                      <SelectItem value="-100">-100%</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    const newOptions = options.filter((_, i) => i !== index);
                    setOptions(newOptions);
                  }}
                  className="ml-2"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            onClick={() => setOptions([...options, { id: Math.random().toString(), content: '', grade: 0 }])}
          >
            Add Option
          </Button>
        </div>

        <div className="space-y-2">
          <Label>Tags</Label>
          <div className="flex flex-wrap gap-2">
            {selectedTags.map((tag) => (
              <Badge key={tag} variant="secondary">
                {tag}
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-4 w-4 ml-1"
                  onClick={() => setSelectedTags(selectedTags.filter((t) => t !== tag))}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            ))}
            <Popover open={isTagPopoverOpen} onOpenChange={setIsTagPopoverOpen}>
              <PopoverTrigger asChild>
                <Button type="button" variant="outline" size="sm">
                  <Tag className="h-4 w-4 mr-2" />
                  Add Tag
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[200px] p-0">
                <Command>
                  <CommandInput placeholder="Search tags..." />
                  <CommandEmpty>No tags found.</CommandEmpty>
                  <CommandGroup>
                    {availableTags
                      .filter((tag) => !selectedTags.includes(tag))
                      .map((tag) => (
                        <CommandItem
                          key={tag}
                          onSelect={() => {
                            setSelectedTags([...selectedTags, tag]);
                            setIsTagPopoverOpen(false);
                          }}
                        >
                          {tag}
                        </CommandItem>
                      ))}
                  </CommandGroup>
                </Command>
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </div>
    </div>
  );

  const renderCodingForm = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Test Cases</Label>
        {testCases.map((testCase, index) => (
          <div key={index} className="space-y-2 p-4 border rounded-lg">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Input</Label>
                <Textarea
                  value={testCase.input}
                  onChange={(e) => {
                    const newTestCases = [...testCases];
                    newTestCases[index].input = e.target.value;
                    setTestCases(newTestCases);
                  }}
                  className="font-mono"
                />
              </div>
              <div className="space-y-2">
                <Label>Output</Label>
                <Textarea
                  value={testCase.output}
                  onChange={(e) => {
                    const newTestCases = [...testCases];
                    newTestCases[index].output = e.target.value;
                    setTestCases(newTestCases);
                  }}
                  className="font-mono"
                />
              </div>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <Switch
                  checked={testCase.isHidden}
                  onCheckedChange={(checked) => {
                    const newTestCases = [...testCases];
                    newTestCases[index].isHidden = checked;
                    setTestCases(newTestCases);
                  }}
                />
                <Label>Hidden Test Case</Label>
              </div>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => {
                  const newTestCases = testCases.filter((_, i) => i !== index);
                  setTestCases(newTestCases);
                }}
              >
                ×
              </Button>
            </div>
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          onClick={() => setTestCases([...testCases, { input: '', output: '', isHidden: false }])}
        >
          Add Test Case
        </Button>
      </div>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{initialData ? 'Edit Question' : 'Create Question'}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Question Type</Label>
              <Tabs
                value={questionType}
                onValueChange={(value) => form.setValue('type', value as 'MULTIPLE_CHOICE' | 'CODING')}
                className="w-full"
              >
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="MULTIPLE_CHOICE">
                    <ListChecks className="w-4 h-4 mr-2" />
                    Multiple Choice
                  </TabsTrigger>
                  <TabsTrigger value="CODING">
                    <Code className="w-4 h-4 mr-2" />
                    Coding
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            <FormField
              control={form.control}
              name="question"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Question</FormLabel>
                  <Input {...field} />
                </FormItem>
              )}
            />

            <div className="space-y-2">
              <Label>Folder</Label>
              <FormField
                control={form.control}
                name="folderId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Folder</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a folder" />
                      </SelectTrigger>
                      <SelectContent>
                        {folders.map((folder: FolderType) => (
                          <div key={folder.id}>
                            <SelectItem value={folder.id} className="font-medium">
                              <Folder className="w-4 h-4 mr-2 inline" />
                              {folder.name}
                            </SelectItem>
                            {folder.subfolders && folder.subfolders.length > 0 && (
                              <div className="ml-4">
                                {folder.subfolders.map((subfolder: SubfolderType) => (
                                  <SelectItem 
                                    key={subfolder.id} 
                                    value={subfolder.id}
                                    className="text-sm"
                                  >
                                    <FolderOpen className="w-4 h-4 mr-2 inline" />
                                    {subfolder.name}
                                  </SelectItem>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
            </div>

            {questionType === 'MULTIPLE_CHOICE' && renderMCQForm()}
            {questionType === 'CODING' && renderCodingForm()}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {initialData ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export default QuestionFormModal;