import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useToast } from '@/components/ui/use-toast';
import { useForm, useFormContext } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PlusCircle, Trash2, X, Edit, Plus } from 'lucide-react';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ExclamationTriangleIcon } from '@radix-ui/react-icons';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { FormProvider } from 'react-hook-form';

const questionFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  questionText: z.string().min(1, 'Question text is required'),
  type: z.enum(['MCQ', 'CODING']),
  status: z.enum(['DRAFT', 'READY']),
  folderId: z.string().min(1, 'Folder is required'),
  difficulty: z.enum(['EASY', 'MEDIUM', 'HARD']),
  defaultMark: z.number().min(0),
  isMultiple: z.boolean(),
  shuffleChoice: z.boolean(),
  generalFeedback: z.string(),
  choiceNumbering: z.string(),
  options: z.array(z.object({
    id: z.string().optional(),
    text: z.string(),
    grade: z.number(),
    feedback: z.string()
  })).optional(),
  languageOptions: z.array(z.object({
    id: z.string().optional(),
    language: z.string(),
    solution: z.string()
  })).optional(),
  testCases: z.array(z.object({
    id: z.string().optional(),
    input: z.string(),
    output: z.string(),
    isHidden: z.boolean()
  })).optional()
});

type QuestionFormData = z.infer<typeof questionFormSchema>;

interface QuestionFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  initialData?: any;
  folders: any[];
  subfolders: any[];
  onAddFolder: (folderName: string) => void;
  onAddSubfolder: (folderName: string, parentId: string) => void;
}

// Define interfaces for language options and test cases
interface MCQOption {
  id?: string;
  text: string;
  grade: number;
  feedback?: string;
}

interface LanguageOption {
  id?: string;
  language: string;
  solution?: string;
}

interface TestCase {
  id?: string;
  input: string;
  output: string;
  isHidden: boolean;
}

export const QuestionFormModal: React.FC<QuestionFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  folders,
  subfolders,
  onAddFolder,
  onAddSubfolder
}) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [options, setOptions] = useState<any[]>([]);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [testCases, setTestCases] = useState<any[]>([]);
  const [newOption, setNewOption] = useState({ text: '', grade: 0 });
  const [editorKey, setEditorKey] = useState(0);
  const [isInitialized, setIsInitialized] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  
  // Add this new function to handle grade normalization
  const normalizeGradeValue = (value: any): number => {
   
    
    if (value === undefined || value === null) {
      return 0;
    }
    
    // If it's a string, try to parse it
    if (typeof value === 'string') {
      // Remove any percentage signs
      const cleanValue = value.replace('%', '');
      const parsed = parseFloat(cleanValue);
      return isNaN(parsed) ? 0 : parsed;
    }
    
    // If it's a number
    if (typeof value === 'number') {
      // If it's between 0 and 1, convert to percentage
      if (value > 0 && value <= 1) {
        return value * 100;
      }
      return value;
    }
    
    return 0;
  };
  
  // Grade percentage options using actual percentage values
  const gradeOptions = [
    { value: 0, label: "None" },
    { value: 100, label: "100%" },
    { value: 90, label: "90%" },
    { value: 83.33333, label: "83.33333%" },
    { value: 80, label: "80%" },
    { value: 75, label: "75%" },
    { value: 70, label: "70%" },
    { value: 66.66667, label: "66.66667%" },
    { value: 60, label: "60%" },
    { value: 50, label: "50%" },
    { value: 40, label: "40%" },
    { value: 33.33333, label: "33.33333%" },
    { value: 30, label: "30%" },
    { value: 25, label: "25%" },
    { value: 20, label: "20%" },
    { value: 16.66667, label: "16.66667%" },
    { value: 14.28571, label: "14.28571%" },
    { value: 12.5, label: "12.5%" },
    { value: 11.11111, label: "11.11111%" },
    { value: 10, label: "10%" },
    { value: 5, label: "5%" },
    { value: -5, label: "-5%" },
    { value: -10, label: "-10%" },
    { value: -11.11111, label: "-11.11111%" },
    { value: -12.5, label: "-12.5%" },
    { value: -14.28571, label: "-14.28571%" },
    { value: -16.66667, label: "-16.66667%" },
    { value: -20, label: "-20%" },
    { value: -25, label: "-25%" },
    { value: -30, label: "-30%" },
    { value: -33.33333, label: "-33.33333%" },
    { value: -40, label: "-40%" },
    { value: -50, label: "-50%" },
    { value: -60, label: "-60%" },
    { value: -66.66667, label: "-66.66667%" },
    { value: -70, label: "-70%" },
    { value: -75, label: "-75%" },
    { value: -80, label: "-80%" },
    { value: -83.33333, label: "-83.33333%" },
    { value: -90, label: "-90%" },
    { value: -100, label: "-100%" }
  ];
  
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
  
  const form = useForm<QuestionFormData>({
    resolver: zodResolver(questionFormSchema),
    defaultValues: {
      name: initialData?.name || "",
      questionText: initialData?.mCQQuestion?.questionText || initialData?.codingQuestion?.questionText || initialData?.questionText || "",
      type: initialData?.type || "MCQ",
      status: initialData?.status || "DRAFT",
      folderId: initialData?.folderId || "",
      difficulty: initialData?.mCQQuestion?.difficulty || "MEDIUM",
      defaultMark: initialData?.mCQQuestion?.defaultMark || initialData?.codingQuestion?.defaultMark || 1,
      isMultiple: initialData?.mCQQuestion?.isMultiple || false,
      shuffleChoice: initialData?.mCQQuestion?.shuffleChoice || false,
      generalFeedback: initialData?.mCQQuestion?.generalFeedback || "",
      choiceNumbering: initialData?.mCQQuestion?.choiceNumbering || "abc",
      options: initialData?.mCQQuestion?.options?.map((option: MCQOption) => ({
        id: option.id,
        text: option.text,
        grade: option.grade,
        feedback: option.feedback || "",
      })) || [],
      languageOptions: initialData?.codingQuestion?.languageOptions?.map((lang: LanguageOption) => ({
        id: lang.id,
        language: lang.language,
        solution: lang.solution,
        preloadCode: lang.preloadCode || ""
      })) || [],
      testCases: initialData?.codingQuestion?.testCases?.map((testCase: TestCase) => ({
        id: testCase.id,
        input: testCase.input,
        output: testCase.output,
        isHidden: testCase.isHidden,
      })) || [],
    },
    mode: "onChange",
  });

  // Add a useEffect to handle initial data changes
  useEffect(() => {
    console.log("FORM MODAL - Initial data received:", JSON.stringify(initialData, null, 2));
    
    if (initialData) {
      console.log("FORM MODAL - Setting form values from initialData");
      
      // Set question name
      console.log("FORM MODAL - Name:", initialData.name);
      form.setValue('name', initialData.name || "", { shouldValidate: true, shouldDirty: true });
      
      // Set question status
      console.log("FORM MODAL - Status:", initialData.status);
      form.setValue('status', initialData.status || "DRAFT", { shouldValidate: true, shouldDirty: true });
      
      // Set question type
      console.log("FORM MODAL - Type:", initialData.type);
      form.setValue('type', initialData.type || "MCQ", { shouldValidate: true, shouldDirty: true });
      
      // Set folder ID
      console.log("FORM MODAL - FolderId:", initialData.folderId);
      form.setValue('folderId', initialData.folderId || "", { shouldValidate: true, shouldDirty: true });
      
      // Set difficulty
      console.log("FORM MODAL - Difficulty:", initialData.difficulty);
      form.setValue('difficulty', initialData.difficulty || "MEDIUM", { shouldValidate: true, shouldDirty: true });
      
      // Set default mark
      console.log("FORM MODAL - Default Mark:", initialData.defaultMark);
      form.setValue('defaultMark', initialData.defaultMark || 1, { shouldValidate: true, shouldDirty: true });
      
      // Set multiple choice flag
      console.log("FORM MODAL - Is Multiple:", initialData.isMultiple);
      form.setValue('isMultiple', !!initialData.isMultiple, { shouldValidate: true, shouldDirty: true });
      
      // Set shuffle flag
      console.log("FORM MODAL - Shuffle Choice:", initialData.shuffleChoice);
      form.setValue('shuffleChoice', !!initialData.shuffleChoice, { shouldValidate: true, shouldDirty: true });
      
      // Set general feedback
      console.log("FORM MODAL - General Feedback:", initialData.generalFeedback ? (initialData.generalFeedback.length > 100 ? initialData.generalFeedback.substring(0, 100) + '...' : initialData.generalFeedback) : '');
      form.setValue('generalFeedback', initialData.generalFeedback || "", { shouldValidate: true, shouldDirty: true });
      
      // Set choice numbering
      console.log("FORM MODAL - Choice Numbering:", initialData.choiceNumbering);
      form.setValue('choiceNumbering', initialData.choiceNumbering || "abc", { shouldValidate: true, shouldDirty: true });
      
      // Set options for MCQ
      if (initialData.options && Array.isArray(initialData.options)) {
        console.log("FORM MODAL - Setting options (direct):", JSON.stringify(initialData.options, null, 2));
        form.setValue('options', initialData.options, { shouldValidate: true, shouldDirty: true });
      } else if (initialData.mCQQuestion?.options && Array.isArray(initialData.mCQQuestion.options)) {
        console.log("FORM MODAL - Setting options (from mCQQuestion):", JSON.stringify(initialData.mCQQuestion.options, null, 2));
        form.setValue('options', initialData.mCQQuestion.options, { shouldValidate: true, shouldDirty: true });
      }
      
      // Set language options for coding
      if (initialData.languageOptions && Array.isArray(initialData.languageOptions)) {
        console.log("FORM MODAL - Setting language options (direct):", JSON.stringify(initialData.languageOptions, null, 2));
        form.setValue('languageOptions', initialData.languageOptions, { shouldValidate: true, shouldDirty: true });
      } else if (initialData.codingQuestion?.languageOptions && Array.isArray(initialData.codingQuestion.languageOptions)) {
        console.log("FORM MODAL - Setting language options (from codingQuestion):", JSON.stringify(initialData.codingQuestion.languageOptions, null, 2));
        form.setValue('languageOptions', initialData.codingQuestion.languageOptions, { shouldValidate: true, shouldDirty: true });
      }
      
      // Set test cases for coding
      if (initialData.testCases && Array.isArray(initialData.testCases)) {
        console.log("FORM MODAL - Setting test cases (direct):", JSON.stringify(initialData.testCases, null, 2));
        form.setValue('testCases', initialData.testCases, { shouldValidate: true, shouldDirty: true });
      } else if (initialData.codingQuestion?.testCases && Array.isArray(initialData.codingQuestion.testCases)) {
        console.log("FORM MODAL - Setting test cases (from codingQuestion):", JSON.stringify(initialData.codingQuestion.testCases, null, 2));
        form.setValue('testCases', initialData.codingQuestion.testCases, { shouldValidate: true, shouldDirty: true });
      }
      
      // Set question text (most important - save for last)
      const questionText = initialData.questionText || initialData.mCQQuestion?.questionText || initialData.codingQuestion?.questionText || '';
      console.log("FORM MODAL - Question Text:", questionText.length > 100 ? questionText.substring(0, 100) + '...' : questionText);
      form.setValue('questionText', questionText, { shouldValidate: true, shouldDirty: true, shouldTouch: true });
      
      // Log final form state for debugging
      setTimeout(() => {
        console.log("FORM MODAL - Final form values after initialization:", JSON.stringify(form.getValues(), null, 2));
      }, 100);
    }
  }, [initialData, form]);

  // Add a watch for question text changes
  const questionText = form.watch('questionText');
  
  // Memoize the validation trigger function
  const triggerValidation = useCallback(() => {
    
    form.trigger('questionText');
  }, [questionText]); // Only depend on questionText

  useEffect(() => {
    triggerValidation();
  }, [triggerValidation]); // Only depend on the memoized function

  const { watch } = form;
  const questionType = watch('type');
  const formOptions = watch('options') || [];
  const formLanguageOptions = watch('languageOptions') || [];
  const formTestCases = watch('testCases') || [];

  // Update the processOptionGrade function to handle more cases
  const processOptionGrade = (rawGrade: any): number => {
    
    
    // Handle null or undefined
    if (rawGrade === null || rawGrade === undefined) {
      
      return 0;
    }
    
    // Handle boolean values
    if (typeof rawGrade === 'boolean') {
     
      return rawGrade ? 100 : 0;
    }
    
    // Handle string values
    if (typeof rawGrade === 'string') {
      // Remove any whitespace and % signs
      const cleanValue = rawGrade.trim().replace('%', '');
      
      // Handle empty strings
      if (!cleanValue) {
        
        return 0;
      }
      
      // Parse the numeric value
      const parsedValue = parseFloat(cleanValue);
      if (isNaN(parsedValue)) {
        
        return 0;
      }
      
      // If value is between 0 and 1, treat as decimal percentage
      if (parsedValue > 0 && parsedValue <= 1) {
        
        return parsedValue * 100;
      }
      
     
      return parsedValue;
    }
    
    // Handle numeric values
    if (typeof rawGrade === 'number') {
      // Handle NaN
      if (isNaN(rawGrade)) {
       
        return 0;
      }
      
      // If value is between 0 and 1, treat as decimal percentage
      if (rawGrade > 0 && rawGrade <= 1) {
        
        return rawGrade * 100;
      }
      
     
      return rawGrade;
    }
    
    // For any other type, default to 0
   
    return 0;
  };

  // Update the addOption function
  const addOption = () => {
    if (!newOption.text.trim()) {
      toast({
        title: "Error",
        description: "Option text cannot be empty",
        variant: "destructive",
      });
      return;
    }

    const currentOptions = form.getValues('options') || [];
    const newOptionData = {
      id: undefined, // Will be set by the server
      text: newOption.text,
      grade: newOption.grade,
      feedback: ''
    };

    form.setValue('options', [...currentOptions, newOptionData]);
    setNewOption({ text: '', grade: 0 }); // Reset the new option form
    setEditorKey(prev => prev + 1); // Force re-render of the editor
  };

  // Remove an option from the MCQ question
  const removeOption = (index: number) => {
    form.setValue('options', formOptions.filter((_, i) => i !== index));
  };

  // Update an option
  const updateOption = (index: number, field: keyof MCQOption, value: any) => {
    const updatedOptions = [...formOptions];
    if (field === 'grade') {
      value = Number(value);
    }
    updatedOptions[index] = { ...updatedOptions[index], [field]: value };
    form.setValue('options', updatedOptions);
  };

  // Enhanced display for option grade value in SelectValue
  // This key function will accurately display the grade in the dropdown
  const getGradeDisplayValue = (grade: number) => {
    // Ensure the grade is a number
    const numericGrade = typeof grade === 'string' ? parseFloat(grade) : grade;
    
    if (isNaN(numericGrade)) {
   
      return "None";
    }
    
    // Find exact match first in our grade options
    const exactMatch = gradeOptions.find(g => Math.abs(g.value - numericGrade) < 0.001);
    if (exactMatch) {
      
      return exactMatch.label;
    }
    
    // Special handling for 100%
    if (Math.abs(numericGrade - 100) < 0.001 || Math.abs(numericGrade - 1) < 0.001) {
     
      return "100%";
    }
    
    // Otherwise show raw value
    
    return `${numericGrade}%`;
  };

  // Add a new test case for coding questions
  const addTestCase = () => {
    const newTestCase: TestCase = {
      input: '',
      output: '',
      isHidden: false
    };
    form.setValue('testCases', [...formTestCases, newTestCase]);
  };

  // Remove a test case
  const removeTestCase = (index: number) => {
    form.setValue('testCases', formTestCases.filter((_, i) => i !== index));
  };

  // Update a test case
  const updateTestCase = (index: number, field: keyof TestCase, value: any) => {
    const updatedTestCases = [...formTestCases];
    updatedTestCases[index] = { ...updatedTestCases[index], [field]: value };
    form.setValue('testCases', updatedTestCases);
  };

  // Update the onFormSubmit function
  const onFormSubmit = async (data: QuestionFormData) => {
    try {
      // Clear any previous errors
      setFormErrors({});
      
      // Validate required fields
      const errors: Record<string, string> = {};
      
      if (!data.name?.trim()) {
        errors.name = 'Question name is required';
      }
      
      if (!data.questionText?.trim()) {
        errors.questionText = 'Question text is required';
      }
      
      if (!data.folderId) {
        errors.folderId = 'Please select a folder';
      }
      
      if (data.type === 'MCQ' && (!data.options || data.options.length === 0)) {
        errors.options = 'At least one option is required for MCQ questions';
      }
      
      if (data.type === 'CODING') {
        if (!data.languageOptions || data.languageOptions.length === 0) {
          errors.languages = 'At least one programming language must be selected';
        }
        if (!data.testCases || data.testCases.length === 0) {
          errors.testCases = 'At least one test case is required for coding questions';
        }
      }
      
      if (Object.keys(errors).length > 0) {
        setFormErrors(errors);
        return;
      }
      
      // Validate that at least one option is marked as correct (has a positive grade)
      if (data.type === 'MCQ' && data.options && data.options.length > 0) {
        const hasCorrectOption = data.options.some(opt => ((opt && opt.grade) ?? 0) > 0);
        if (!hasCorrectOption) {
    
          errors.options = 'At least one option must be marked as correct (with a positive grade)';
          setFormErrors(errors);
          return;
        }
      }
      
      // Call handleSubmit with the validated data
      await handleSubmit(data);
    } catch (error) {
      console.error('Form submission error:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to submit form. Please check all required fields.",
        variant: "destructive",
      });
    }
  };

  // Handle form submission
  const handleSubmit = async (data: QuestionFormData) => {
    try {
      setIsLoading(true);
      
      // Validate required arrays based on question type
      if (data.type === 'MCQ') {
        const options = data.options || [];
        if (options.length === 0) {
          throw new Error('At least one option is required for MCQ questions');
        }
      }
      
      if (data.type === 'CODING') {
        const languageOptions = data.languageOptions || [];
        const testCases = data.testCases || [];
        
        if (languageOptions.length === 0) {
          throw new Error('At least one programming language must be selected');
        }
        if (testCases.length === 0) {
          throw new Error('At least one test case is required for coding questions');
        }
      }

      // Prepare the data for submission
      const submissionData = {
        name: data.name,
        questionText: data.questionText,
        type: data.type,
        folderId: data.folderId,
        status: data.status,
        difficulty: data.difficulty,
        defaultMark: data.defaultMark,
        isMultiple: data.isMultiple,
        shuffleChoice: data.shuffleChoice,
        generalFeedback: data.generalFeedback,
        choiceNumbering: data.choiceNumbering,
        mCQQuestion: data.type === 'MCQ' ? {
          options: data.options?.map((opt: MCQOption) => ({
            id: opt.id,
            text: opt.text,
            grade: opt.grade,
            feedback: opt.feedback
          })),
          isMultiple: data.isMultiple,
          shuffleChoice: data.shuffleChoice,
          generalFeedback: data.generalFeedback,
          choiceNumbering: data.choiceNumbering
        } : undefined,
        codingQuestion: data.type === 'CODING' ? {
          languageOptions: data.languageOptions?.map((lang: LanguageOption) => ({
            id: lang.id,
            language: lang.language,
            solution: lang.solution
          })),
          testCases: data.testCases?.map((tc: TestCase) => ({
            id: tc.id,
            input: tc.input,
            output: tc.output,
            isHidden: tc.isHidden
          }))
        } : undefined
      };

      

      // Determine if we're creating or updating
      const isUpdate = !!initialData?.id;
      const url = isUpdate 
        ? `/api/questions/${initialData.id}`
        : '/api/questions';
      const method = isUpdate ? 'PUT' : 'POST';

      // Make the API call
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submissionData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to ${isUpdate ? 'update' : 'create'} question`);
      }

      const responseData = await response.json();
     

      toast({
        title: "Success",
        description: `Question ${isUpdate ? 'updated' : 'created'} successfully`,
      });

      onSubmit(responseData);
      onClose();
    } catch (error) {
      console.error('Error submitting form:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to submit form",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{initialData ? 'Edit Question' : 'Create Question'}</DialogTitle>
        </DialogHeader>
        <FormProvider {...form}>
        <form onSubmit={form.handleSubmit(onFormSubmit)} className="space-y-6">
          {/* Basic Question Info */}
          <div className="grid gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Question Name</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Enter question name" 
                      {...field} 
                      className={formErrors.name ? "border-destructive" : ""}
                    />
                  </FormControl>
                  <FormMessage>{formErrors.name}</FormMessage>
                </FormItem>
              )}
            />
          </div>

          {/* Folder Selection */}
          <div className="grid gap-4">
            <FormField
              control={form.control}
              name="folderId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Folder</FormLabel>
                  <Select
                    onValueChange={(value) => {
                     
                      field.onChange(value);
                    }}
                    value={field.value || ''}
                    defaultValue={field.value || ''}
                  >
                    <FormControl>
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="Select a folder">
                          {allFolderOptions.find(f => f.id === field.value)?.name || "Select a folder"}
                        </SelectValue>
                      </SelectTrigger>
                    </FormControl>
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
                  <FormMessage />
                </FormItem>
              )}
          />
        </div>

          {/* Question Text */}
          <FormField
            control={form.control}
            name="questionText"
              render={({ field }) => {
                const questionText = form.watch('questionText');
                const error = form.formState.errors.questionText;
                
                return (
              <FormItem>
                <FormLabel>Question Text</FormLabel>
                <FormControl>
                  <RichTextEditor
                        key={`question-text-editor-${initialData?.id || 'new'}`}
                        value={questionText || ''}
                    onChange={(value) => {
                          
                      field.onChange(value);
                      form.trigger('questionText');
                    }}
                    placeholder="Enter the question text/description"
                    className="min-h-[150px]"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
                );
              }}
          />

          {/* Question Settings */}
          <div className="grid gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
          <Select
                    onValueChange={field.onChange}
                    value={field.value}
          >
                    <FormControl>
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
                    </FormControl>
            <SelectContent>
              <SelectItem value="DRAFT">Draft</SelectItem>
              <SelectItem value="READY">Ready</SelectItem>
            </SelectContent>
          </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="difficulty"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Difficulty</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select difficulty" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="EASY">Easy</SelectItem>
                      <SelectItem value="MEDIUM">Medium</SelectItem>
                      <SelectItem value="HARD">Hard</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="defaultMark"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Default Marks</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      min="0" 
                      step="0.5"
                      {...field}
                      value={field.value.toString()}
                      onChange={(e) => {
                        const value = parseFloat(e.target.value) || 0;
                        
                        field.onChange(value);
                      }} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
      </div>

          {/* MCQ Specific Options */}
          {questionType === 'MCQ' && (
            <div className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="isMultiple"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                      <div className="space-y-0.5">
                        <FormLabel>Allow Multiple Answers</FormLabel>
                      </div>
                      <FormControl>
          <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="shuffleChoice"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                      <div className="space-y-0.5">
                        <FormLabel>Shuffle Options</FormLabel>
        </div>
                      <FormControl>
          <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
      </div>

              <div className="space-y-2">
                <h3 className="text-lg font-medium">Options</h3>
                <div className="space-y-4">
                    {form.getValues('options').map((option, index) => (
                    <Card key={`option-card-${index}`}>
                      <CardContent className="p-4">
                        <div className="grid gap-4">
                          <div className="flex items-center gap-2">
                            <span className="font-medium w-8 h-8 flex items-center justify-center bg-muted rounded-full">
                              {String.fromCharCode(65 + index)}
                            </span>
                            <div className="flex-1">
                              <RichTextEditor
                                key={`option-${index}-${option.text.substring(0, 10)}`}
                                value={option.text}
                                onChange={(value) => updateOption(index, 'text', value)}
                                placeholder="Option text"
                                className="min-h-[100px]"
                              />
                            </div>
                            <Button
                type="button"
                              variant="destructive"
                              size="sm"
                              onClick={() => removeOption(index)}
                            >
                              <Trash2 className="h-4 w-4" />
            </Button>
                          </div>
                          <div className="bg-muted/20 p-3 rounded-md">
                            <div className="space-y-1">
                              <label className="text-sm font-medium">Grade</label>
                              <Select
                                value={`${option.grade}`}
                                onValueChange={(value) => {
                                  // Convert the selected value to a number
                                  const numericValue = parseFloat(value);
                                  
                                  updateOption(index, 'grade', numericValue);
                                }}
                              >
                                <SelectTrigger className="w-full">
                                  <SelectValue>
                                    {getGradeDisplayValue(option.grade)}
                                  </SelectValue>
                                </SelectTrigger>
                                <SelectContent>
                                  {gradeOptions.map((gradeOption) => (
                                    <SelectItem 
                                      key={gradeOption.value} 
                                      value={`${gradeOption.value}`}
                                      // Add custom styling to highlight the currently selected option
                                      className={Math.abs(option.grade - gradeOption.value) < 0.01 ? "bg-secondary/40" : ""}
                                    >
                                      {gradeOption.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <div className="text-xs text-muted-foreground">
                                {option.grade > 0 ? 'Correct answer' : option.grade < 0 ? 'Penalty' : 'Incorrect answer'}
                                <span className="ml-2 text-xs text-muted-foreground">
                                  Current grade: {option.grade}%
                                </span>
      </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                    {/* New Option Form */}
                  <Card className="border-dashed">
                    <CardContent className="p-4">
                      <div className="grid gap-4">
              <div className="flex-1">
                <RichTextEditor
                            key={`new-option-${editorKey}`}
                            value={newOption.text}
                              onChange={(value) => {
                                setNewOption(prev => ({ ...prev, text: value }));
                              }}
                            placeholder="New option text"
                            className="min-h-[100px]"
                />
              </div>
                        <div className="bg-muted/20 p-3 rounded-md">
                          <div className="space-y-1">
                            <label className="text-sm font-medium">Grade</label>
                <Select
                              value={`${newOption.grade}`}
                  onValueChange={(value) => {
                                const numericValue = parseFloat(value);
                                  setNewOption(prev => ({ ...prev, grade: numericValue }));
                              }}
                            >
                              <SelectTrigger className="w-full">
                                <SelectValue>
                                  {getGradeDisplayValue(newOption.grade)}
                                </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                                {gradeOptions.map((gradeOption) => (
                                  <SelectItem 
                                    key={gradeOption.value} 
                                    value={`${gradeOption.value}`}
                                    className={Math.abs(newOption.grade - gradeOption.value) < 0.01 ? "bg-secondary/40" : ""}
                                  >
                                    {gradeOption.label}
                                  </SelectItem>
                                ))}
                  </SelectContent>
                </Select>
                          </div>
              </div>
              <Button
                type="button"
                          onClick={addOption}
                          className="w-full mt-2"
                          disabled={!newOption.text.trim()}
                        >
                          <PlusCircle className="h-4 w-4 mr-1" /> Add Option
              </Button>
            </div>
                    </CardContent>
                  </Card>
          </div>
              </div>

              <FormField
                control={form.control}
                name="generalFeedback"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>General Feedback</FormLabel>
                    <FormControl>
                      <RichTextEditor
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="Feedback for all students after answering"
                        className="min-h-[100px]"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}

          {/* Coding Question Specific Options */}
          {questionType === 'CODING' && (
            <div className="space-y-6">
              <div className="space-y-2">
                <h3 className="text-lg font-medium">Supported Languages</h3>
                <div className="flex flex-wrap gap-2">
                  {[
                    { id: 'PYTHON3', name: 'Python 3' },
                    { id: 'JAVA', name: 'Java' },
                    { id: 'JAVASCRIPT', name: 'JavaScript' },
                    { id: 'CPP', name: 'C++' },
                    { id: 'C', name: 'C' },
                    { id: 'GO', name: 'Go' },
                    { id: 'RUBY', name: 'Ruby' }
                  ].map((lang) => (
                    <Badge
                      key={lang.id}
                      variant={selectedLanguages.includes(lang.id) ? 'default' : 'outline'}
                      className={`cursor-pointer ${selectedLanguages.includes(lang.id) ? 'bg-primary' : ''}`}
                      onClick={() => {
                        const newSelectedLanguages = selectedLanguages.includes(lang.id)
                          ? selectedLanguages.filter((l) => l !== lang.id)
                          : [...selectedLanguages, lang.id];
                        
                        
                          form.setValue('languageOptions', form.getValues('languageOptions').map((opt: any) =>
                            opt.id === lang.id ? { ...opt, language: lang.name } : opt
                          ));
                      }}
                    >
                      {lang.name}
                    </Badge>
                  ))}
                </div>
                {selectedLanguages.length === 0 && (
                  <p className="text-sm text-destructive">Please select at least one language</p>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">Test Cases</h3>
        <Button
          type="button"
          variant="outline"
                    size="sm"
                    onClick={addTestCase}
        >
                    <PlusCircle className="h-4 w-4 mr-1" /> Add Test Case
        </Button>
      </div>

    <div className="space-y-4">
                    {form.getValues('testCases').length === 0 && (
                    <p className="text-sm text-destructive">Please add at least one test case</p>
                  )}
                  
                    {form.getValues('testCases').map((testCase, index) => (
                    <Card key={`test-case-${index}-${testCase.input?.substring(0, 5) || ''}`}>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-center mb-2">
                          <h4 className="font-medium">Test Case {index + 1}</h4>
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            onClick={() => removeTestCase(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="grid gap-4">
                          <div>
                            <label className="text-sm font-medium">Input</label>
                <Textarea
                              value={testCase.input || ''}
                              onChange={(e) => updateTestCase(index, 'input', e.target.value)}
                              placeholder="Test input"
                />
              </div>
                          <div>
                            <label className="text-sm font-medium">Expected Output</label>
                <pre className="text-xs whitespace-pre-wrap overflow-auto max-h-[100px] p-2 bg-slate-100 rounded">
                  {testCase.output || ''}
                </pre>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                              checked={testCase.isHidden || false}
                              onCheckedChange={(checked) => updateTestCase(index, 'isHidden', checked)}
                              id={`hidden-${index}`}
                            />
                            <label htmlFor={`hidden-${index}`}>Hidden</label>
              </div>
            </div>
                      </CardContent>
                    </Card>
                  ))}
      </div>
    </div>
            </div>
          )}
          
          {/* Form Buttons */}
          <div className="flex justify-end space-x-3 mt-6 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading}
            >
              {isLoading && (
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              )}
              {initialData?.id ? 'Update MCQ Question' : 'Create MCQ Question'}
            </Button>
          </div>
        </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
};

export default QuestionFormModal;