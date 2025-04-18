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
  options: z.array(z.string()).default([]),
  correctAnswer: z.string().optional(),
  testCases: z.any().optional(),
  expectedOutput: z.string().optional(),
  hidden: z.boolean().default(false),
  marks: z.number().min(1, 'Marks must be at least 1').default(1),
  singleAnswer: z.boolean().default(false),
  shuffleAnswers: z.boolean().default(false),
  status: z.enum(['DRAFT', 'READY']).default('DRAFT')
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
      marks: 1,
      singleAnswer: false,
      shuffleAnswers: false,
      status: 'DRAFT'
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
      console.log('Initial data received:', initialData);
      const formData = {
        ...initialData,
        hidden: toBool(initialData.hidden),
        marks: initialData.marks ?? 1,
        singleAnswer: initialData.singleAnswer ?? false,
        shuffleAnswers: initialData.shuffleAnswers ?? false,
        status: initialData.status || 'DRAFT',
        correctAnswer: initialData.correctAnswer || undefined
      };
      form.reset(formData);
      setSelectedFolder(initialData.folderId || '');
      
      // Set question content
      setQuestionContent(initialData.question || '');
      
      // Set options with correct grade
      if (initialData.type === 'MULTIPLE_CHOICE' && initialData.options) {
        const optionsWithGrade = initialData.options.map(content => ({
          id: Math.random().toString(),
          content,
          grade: content === initialData.correctAnswer ? 1 : 0
        }));
        setOptions(optionsWithGrade);
        // Set the correct answer in the form
        form.setValue('correctAnswer', initialData.correctAnswer || '');
      } else {
        setOptions([]);
        form.setValue('correctAnswer', '');
      }
      
      // Set test cases
      if (initialData.type === 'CODING' && initialData.testCases) {
        setTestCases(initialData.testCases.map((testCase: any) => ({
          input: testCase.input || '',
          output: testCase.output || '',
          isHidden: testCase.isHidden || false
        })));
      } else {
        setTestCases([]);
      }
    } else {
      form.reset({
        question: '',
        type: 'MULTIPLE_CHOICE',
        folderId: '',
        hidden: false,
        marks: 1,
        singleAnswer: false,
        shuffleAnswers: false,
        status: 'DRAFT',
        correctAnswer: ''
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
        question: questionContent,
        type: formData.type as 'MULTIPLE_CHOICE' | 'CODING',
        folderId: formData.folderId,
        options: formData.type === 'MULTIPLE_CHOICE' ? options.map(opt => opt.content) : [],
        correctAnswer: formData.type === 'MULTIPLE_CHOICE' ? options.find(opt => opt.grade > 0)?.content || undefined : undefined,
        testCases: formData.type === 'CODING' ? testCases : undefined,
        expectedOutput: formData.type === 'CODING' ? testCases[0]?.output || undefined : undefined,
        hidden: formData.hidden,
        marks: formData.marks,
        singleAnswer: formData.singleAnswer,
        shuffleAnswers: formData.shuffleAnswers,
        status: formData.status as 'DRAFT' | 'READY'
      };

      console.log('Submitting data:', submissionData);
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
          <Label>Marks</Label>
          <Input
            type="number"
            min="1"
            value={form.getValues('marks') || 1}
            onChange={(e) => {
              const value = parseInt(e.target.value);
              form.setValue('marks', isNaN(value) ? 1 : value);
            }}
          />
        </div>
        <div className="space-y-2">
          <Label>Status</Label>
          <Select
            value={form.watch('status')}
            onValueChange={(value: 'DRAFT' | 'READY') => form.setValue('status', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="DRAFT">Draft</SelectItem>
              <SelectItem value="READY">Ready</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <Switch
            checked={form.watch('singleAnswer')}
            onCheckedChange={(checked) => form.setValue('singleAnswer', checked)}
          />
          <Label>Single Answer Only</Label>
        </div>
        <div className="flex items-center space-x-2">
          <Switch
            checked={form.watch('shuffleAnswers')}
            onCheckedChange={(checked) => form.setValue('shuffleAnswers', checked)}
          />
          <Label>Shuffle Answers</Label>
        </div>
      </div>

      {/* Tags Section */}
      <div className="space-y-2 w-full">
        <Label>Tags</Label>
        <div className="flex flex-wrap gap-2">
          {selectedTags.map((tag) => (
            <Badge key={tag} variant="secondary" className="flex items-center gap-1">
              {tag}
              <button
                type="button"
                onClick={() => setSelectedTags(selectedTags.filter((t) => t !== tag))}
                className="ml-1 hover:text-destructive"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
        <Popover open={isTagPopoverOpen} onOpenChange={setIsTagPopoverOpen}>
          <PopoverTrigger asChild>
            <Button type="button" variant="outline" className="w-full">
              <Tag className="mr-2 h-4 w-4" />
              Add Tags
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[200px] p-0">
            <Command>
              <CommandInput placeholder="Search tags..." />
              <CommandEmpty>No tags found.</CommandEmpty>
              <CommandGroup>
                {availableTags.map((tag) => (
                  <CommandItem
                    key={tag}
                    onSelect={() => {
                      if (!selectedTags.includes(tag)) {
                        setSelectedTags([...selectedTags, tag]);
                      }
                      setIsTagPopoverOpen(false);
                    }}
                  >
                    <Checkbox
                      checked={selectedTags.includes(tag)}
                      className="mr-2"
                    />
                    {tag}
                  </CommandItem>
                ))}
              </CommandGroup>
            </Command>
          </PopoverContent>
        </Popover>
      </div>

      {/* Options Section */}
      <div className="space-y-2 w-full">
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
          onClick={() => {
            setOptions([...options, { id: Math.random().toString(), content: '', grade: 0 }]);
          }}
        >
          Add Option
        </Button>
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