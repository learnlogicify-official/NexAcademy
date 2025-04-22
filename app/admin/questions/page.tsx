"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { Plus, Search, Loader2, Folder, FolderOpen, FileText, Code, Pencil, Trash2, Upload, Download, MoreVertical, Copy, ChevronLeft, ChevronRight, Eye, Filter, SortAsc, SortDesc, CheckCircle, ListChecks, X, Grid, List, Table as TableIcon, Folder as FolderIcon, ChevronDown, Settings, ChevronUp } from "lucide-react";
import { QuestionFormModal } from "@/components/admin/question-form-modal";
import { CodingQuestionFormModal } from "@/components/admin/coding-question-form-modal";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { z } from "zod";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from '@/components/ui/switch';
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import type { Question as QuestionType } from '@/types';
import { Folder as FolderType } from '@/types';
import { QuestionRow } from "./QuestionRow";
import { useCallback } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import axios from "axios";
import { useRouter } from 'next/navigation';

interface QuestionFormData {
  id: string;
  name: string;
  type: 'MCQ' | 'CODING';
  status: 'DRAFT' | 'READY';
  folderId: string;
  version: number;
  questionText: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  defaultMark: number;
  isMultiple: boolean;
  shuffleChoice: boolean;
  generalFeedback: string;
  choiceNumbering: string;
  options: {
    id: string;
    text: string;
    grade: number;
    feedback: string;
  }[];
  languageOptions: {
    id: string;
    language: string;
    solution: string;
    preloadCode?: string;
  }[];
  testCases: {
    id: string;
    input: string;
    output: string;
    isHidden: boolean;
    type?: string;
    gradePercentage?: number;
    showOnFailure?: boolean;
  }[];
  allOrNothingGrading?: boolean;
  defaultLanguage?: string;
  codingQuestion?: {
    languageOptions: {
      id: string;
      language: string;
      solution: string;
      preloadCode?: string;
    }[];
    testCases: {
      id: string;
      input: string;
      output: string;
      isHidden: boolean;
      isSample: boolean;
      gradePercentage?: number;
      showOnFailure?: boolean;
    }[];
    isAllOrNothing: boolean;
    defaultLanguage: string;
  };
}

interface Question {
  id: string;
  name: string;
  questionText: string;
  type: 'MCQ' | 'CODING';
  status: 'DRAFT' | 'READY';
  folderId?: string;
  folder?: {
    id: string;
    name: string;
  };
  createdAt: Date;
  updatedAt: Date;
  version: number;
  mCQQuestion?: MCQQuestion;
  codingQuestion?: CodingQuestion;
  creatorName?: string;
  lastModifiedByName?: string;
}

interface MCQQuestion {
  options: MCQOption[];
  solution: string;
  hints: string[];
  difficulty?: string;
  defaultMark?: number;
  isMultiple?: boolean;
  shuffleChoice?: boolean;
  generalFeedback?: string;
  choiceNumbering?: string;
}

interface MCQOption {
  id: string;
      text: string;
      grade: number;
      feedback: string;
}

interface CodingQuestion {
  id: string;
  languageOptions: LanguageOption[];
  testCases: TestCase[];
  hints: string[];
  solutionExplanation: string;
}

interface LanguageOption {
  id: string;
      language: string;
      solution: string;
}

interface TestCase {
  id: string;
      input: string;
  expectedOutput: string;
      isHidden: boolean;
}

interface Folder {
  id: string;
  name: string;
  subfolders: {
    id: string;
    name: string;
  }[];
}

interface QuestionSubmitData {
  id?: string;
  name: string;
  type: 'MCQ' | 'CODING';
  status: 'DRAFT' | 'PUBLISHED';
  folderId: string;
  version?: number;
  questionText: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  defaultMark: number;
  isMultiple?: boolean;
  shuffleChoice?: boolean;
  generalFeedback?: string;
  choiceNumbering?: string;
  options?: {
    text: string;
    grade: number;
    feedback: string;
  }[];
  languageOptions?: {
    id: string;
    language: string;
    solution: string;
    preloadCode: string;
  }[];
  testCases?: {
    input: string;
    output: string;
    type: string;
    showOnFailure: boolean;
  }[];
  allOrNothingGrading?: boolean;
  defaultLanguage?: string;
}

interface FilterState {
  search: string;
  category: string;
  subcategory: string;
  type: string;
  status: string;
  includeSubcategories: boolean;
}

const QUESTIONS_PER_PAGE = 10;

// Add the formatDate function
const formatDate = (date: Date | string | undefined) => {
  if (!date) return 'N/A';
  const d = new Date(date);
  return d.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

interface Stats {
  total: number;
  published: number;
  draft: number;
  multipleChoice: number;
  coding: number;
  byFolder: Record<string, number>;
  ready: number;
}

export default function AdminQuestionsPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [filteredQuestions, setFilteredQuestions] = useState<Question[]>([]);
  const [folders, setFolders] = useState<FolderType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    category: "all",
    subcategory: "all",
    type: "all",
    status: "all",
    includeSubcategories: false
  });
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'table' | 'list' | 'grid'>('table');
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isQuestionTypeModalOpen, setIsQuestionTypeModalOpen] = useState(false);
  const [selectedQuestionType, setSelectedQuestionType] = useState<'MCQ' | 'CODING' | null>(null);
  const [editingQuestion, setEditingQuestion] = useState<QuestionFormData | undefined>();
  const [isCreateFolderModalOpen, setIsCreateFolderModalOpen] = useState(false);
  const [isCreateSubfolderModalOpen, setIsCreateSubfolderModalOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [newSubfolderName, setNewSubfolderName] = useState("");
  const [selectedFolderForSubfolder, setSelectedFolderForSubfolder] = useState<string | null>(null);
  const [editingFolder, setEditingFolder] = useState<FolderType | null>(null);
  const [isEditFolderModalOpen, setIsEditFolderModalOpen] = useState(false);
  const [updatedFolderName, setUpdatedFolderName] = useState("");
  const [showSubcategories, setShowSubcategories] = useState(true);
  const [activeTab, setActiveTab] = useState("questions");
  const [bulkSelected, setBulkSelected] = useState<string[]>([]);
  const [editingFolderId, setEditingFolderId] = useState<string | null>(null);
  const [editingSubfolderId, setEditingSubfolderId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [sortField, setSortField] = useState<keyof QuestionType>('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [previewQuestion, setPreviewQuestion] = useState<QuestionType | null>(null);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([]);
  const [isBulkActionModalOpen, setIsBulkActionModalOpen] = useState(false);
  const [bulkAction, setBulkAction] = useState<'delete' | 'changeStatus' | 'moveToFolder' | null>(null);
  const [bulkStatus, setBulkStatus] = useState<'DRAFT' | 'READY'>('DRAFT');
  const [bulkFolderId, setBulkFolderId] = useState<string>('');
  const [stats, setStats] = useState<Stats>({
    total: 0,
    published: 0,
    draft: 0,
    multipleChoice: 0,
    coding: 0,
    byFolder: {},
    ready: 0
  });
  const [pendingFilters, setPendingFilters] = useState<FilterState>({
    search: "",
    category: "all",
    subcategory: "all",
    type: "all",
    status: "all",
    includeSubcategories: false
  });
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [isCodingFormModalOpen, setIsCodingFormModalOpen] = useState(false);
  const [showAllFolders, setShowAllFolders] = useState(false);
  const [pagination, setPagination] = useState({ total: 0, current: 1 });
  // Add new state variables for delete confirmation dialog
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [questionToDelete, setQuestionToDelete] = useState<string | null>(null);

  useEffect(() => {
    fetchQuestions(filters, currentPage);
    fetchFolders();
  }, [filters, currentPage]);

  const fetchQuestions = async (currentFilters?: FilterState, page: number = 1) => {
    try {
      const filters = currentFilters || pendingFilters;
      setPendingFilters(filters);
      setIsLoading(true);

      const queryParams = new URLSearchParams();
      if (filters.search) queryParams.append('search', filters.search);
      if (filters.category !== 'all') queryParams.append('category', filters.category);
      if (filters.subcategory !== 'all') queryParams.append('subcategory', filters.subcategory);
      if (filters.type !== 'all') queryParams.append('type', filters.type);
      if (filters.status !== 'all') queryParams.append('status', filters.status);
      if (filters.includeSubcategories) queryParams.append('includeSubcategories', 'true');
      if (selectedFolder) queryParams.append('folderId', selectedFolder);

      // Add pagination parameters
      queryParams.append('page', page.toString());
      queryParams.append('limit', QUESTIONS_PER_PAGE.toString());

      // First fetch to get paginated results
      const response = await axios.get(`/api/questions?${queryParams.toString()}`);
      const { questions, pagination } = response.data;
      
      setQuestions(questions);
      setFilteredQuestions(questions);
      setTotalPages(pagination.totalPages);
      setTotalQuestions(pagination.total);
      
      // Second fetch to get all questions for accurate stats
      const allQuestionsResponse = await axios.get(`/api/questions?${new URLSearchParams({
        ...Object.fromEntries(queryParams),
        page: '1',
        limit: '1000' // Use a large number to get all questions
      }).toString()}`);
      
      const allQuestions = allQuestionsResponse.data.questions;
      
      // Calculate accurate stats
      const newStats: Stats = {
        total: pagination.total,
        published: allQuestions.filter((q: Question) => q.status === 'READY').length,
        draft: allQuestions.filter((q: Question) => q.status === 'DRAFT').length,
        multipleChoice: allQuestions.filter((q: Question) => q.type === 'MCQ').length,
        coding: allQuestions.filter((q: Question) => q.type === 'CODING').length,
        byFolder: allQuestions.reduce((acc: Record<string, number>, q: Question) => {
          const folderName = q.folder?.name || 'Uncategorized';
          acc[folderName] = (acc[folderName] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
        ready: allQuestions.filter((q: Question) => q.status === 'READY').length
      };
      setStats(newStats);
      setPagination({
        total: pagination.total,
        current: page
      });
    } catch (error) {
      console.error('Error fetching questions:', error);
      toast({
        title: "Error",
        description: "Failed to fetch questions",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchFolders = async () => {
    try {
      const response = await fetch("/api/folders");
      if (!response.ok) {
        throw new Error("Failed to fetch folders");
      }
      const data = await response.json();
      setFolders(data);
    } catch (error) {
      console.error("Error fetching folders:", error);
      toast({
        title: "Error",
        description: "Failed to fetch folders",
        variant: "destructive",
      });
    }
  };

  const handleCreateFolder = async () => {
    try {
      const response = await fetch("/api/folders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: newFolderName }),
      });

      if (!response.ok) {
        throw new Error("Failed to create folder");
      }

      toast({
        title: "Success",
        description: "Folder created successfully",
      });

      fetchFolders();
      setIsCreateFolderModalOpen(false);
      setNewFolderName("");
    } catch (error) {
      console.error("Error creating folder:", error);
      toast({
        title: "Error",
        description: "Failed to create folder",
        variant: "destructive",
      });
    }
  };

  const handleCreateSubfolder = async () => {
    if (!selectedFolderForSubfolder || !newSubfolderName.trim()) return;

    try {
      const response = await fetch(`/api/folders/${selectedFolderForSubfolder}/subfolders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newSubfolderName.trim(),
        }),
      });

      if (!response.ok) throw new Error('Failed to create subfolder');

      const newSubfolder = await response.json();
      
      // Update the folders state to include the new subfolder
      setFolders(folders.map(folder => {
        if (folder.id === selectedFolderForSubfolder) {
          return {
            ...folder,
            subfolders: [...(folder.subfolders || []), newSubfolder]
          };
        }
        return folder;
      }));

      toast({
        title: "Success",
        description: "Subfolder created successfully",
      });

      setIsCreateSubfolderModalOpen(false);
      setNewSubfolderName("");
      setSelectedFolderForSubfolder(null);
    } catch (error) {
      console.error('Error creating subfolder:', error);
      toast({
        title: "Error",
        description: "Failed to create subfolder",
        variant: "destructive",
      });
    }
  };

  const handleEditFolder = async (folder: FolderType) => {
    setEditingFolder(folder);
    setIsEditFolderModalOpen(true);
  };

  const handleUpdateFolder = async () => {
    if (!editingFolder) return;

    try {
      const response = await fetch(`/api/folders/${editingFolder.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: updatedFolderName }),
      });

      if (!response.ok) {
        throw new Error("Failed to update folder");
      }

      toast({
        title: "Success",
        description: "Folder updated successfully",
      });

      fetchFolders();
      setIsEditFolderModalOpen(false);
      setUpdatedFolderName("");
      setEditingFolder(null);
    } catch (error) {
      console.error("Error updating folder:", error);
      toast({
        title: "Error",
        description: "Failed to update folder",
        variant: "destructive",
      });
    }
  };

  const handleDeleteFolder = async (folderId: string) => {
    try {
      const response = await fetch(`/api/folders/${folderId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete folder");
      }

      toast({
        title: "Success",
        description: "Folder deleted successfully",
      });

      fetchFolders();
    } catch (error) {
      console.error("Error deleting folder:", error);
      toast({
        title: "Error",
        description: "Failed to delete folder",
        variant: "destructive",
      });
    }
  };

  const handleDeleteQuestion = async (questionId: string) => {
    try {
      const response = await fetch(`/api/questions/${questionId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete question");
      }

      toast({
        title: "Success",
        description: "Question deleted successfully",
      });

      fetchQuestions();
      setIsDeleteDialogOpen(false);
      setQuestionToDelete(null);
    } catch (error) {
      console.error("Error deleting question:", error);
      toast({
        title: "Error",
        description: "Failed to delete question",
        variant: "destructive",
      });
    }
  };

  const handleEditSubfolder = (folderId: string, subfolderId: string) => {
    setEditingFolderId(folderId);
    setEditingSubfolderId(subfolderId);
    setNewFolderName(folders.find(f => f.id === folderId)?.subfolders?.find(s => s.id === subfolderId)?.name || '');
    setIsEditing(true);
  };

  const handleDeleteSubfolder = async (folderId: string, subfolderId: string) => {
    try {
      await axios.delete(`/api/folders/${folderId}/subfolders/${subfolderId}`);
      await fetchFolders();
    } catch (error) {
      console.error('Error deleting subfolder:', error);
    }
  };

  const handleFormSubmit = async (data: any) => {
    try {
      console.log("Form submission data:", data);
      
      // Check if we're editing an existing question
      const isEditing = !!data.id;
      
      // Transform the data based on question type
      const transformedData: any = {
        id: data.id, // Include the ID for existing questions
        name: data.name,
        type: data.type,
        status: data.status,
        version: data.version || 1,
        folderId: data.folderId,
        questionText: data.questionText || data.mCQQuestion?.questionText || data.codingQuestion?.questionText || "",
      };

      // Add MCQ specific fields if it's an MCQ question
      if (data.type === 'MCQ') {
        if (!data.options && !data.mCQQuestion?.options) {
          throw new Error("At least one option is required for MCQ questions");
        }
        console.log("MCQ question data:", data.mCQQuestion);
        // Add these fields at the top level for API compatibility
        transformedData.difficulty = data.mCQQuestion?.difficulty || 'MEDIUM';
        transformedData.defaultMark = Number(data.mCQQuestion?.defaultMark || 1);
        transformedData.isMultiple = Boolean(data.mCQQuestion?.isMultiple);
        transformedData.shuffleChoice = Boolean(data.mCQQuestion?.shuffleChoice);
        transformedData.generalFeedback = data.generalFeedback || data.mCQQuestion?.generalFeedback || "";
        
        // Log the values to help with debugging
        console.log("MCQ Fields being sent to API:", {
          difficulty: transformedData.difficulty,
          defaultMark: transformedData.defaultMark,
          isMultiple: transformedData.isMultiple,
          shuffleChoice: transformedData.shuffleChoice
        });
        
        // Get options from either top-level or nested structure
        const options = data.options || data.mCQQuestion?.options || [];
        
        transformedData.mCQQuestion = {
          options: options.map((opt: any) => ({
            id: opt.id,
            text: opt.text || "",
            grade: Number(opt.grade) || 0,
            feedback: opt.feedback || ""
          })),
          isMultiple: Boolean(data.mCQQuestion?.isMultiple),
          shuffleChoice: Boolean(data.mCQQuestion?.shuffleChoice),
          generalFeedback: data.generalFeedback || data.mCQQuestion?.generalFeedback || "",
          solution: data.solution || data.mCQQuestion?.solution || "",
          hints: data.hints || data.mCQQuestion?.hints || [],
          difficulty: data.mCQQuestion?.difficulty || 'MEDIUM',
          defaultMark: Number(data.mCQQuestion?.defaultMark || 1)
        };
      }

      // Add Coding specific fields if it's a Coding question
      if (data.type === 'CODING') {
        if (!data.languageOptions || data.languageOptions.length === 0) {
          throw new Error("At least one language option is required for coding questions");
        }
        if (!data.testCases || data.testCases.length === 0) {
          throw new Error("At least one test case is required for coding questions");
        }
        
        // Make sure to include the allOrNothingGrading field at the top level
        transformedData.allOrNothingGrading = Boolean(data.allOrNothingGrading || data.isAllOrNothing || false);
        transformedData.difficulty = data.difficulty || 'MEDIUM';
        transformedData.defaultMark = Number(data.defaultMark || 1);
        
        transformedData.codingQuestion = {
          languageOptions: data.languageOptions.map((option: any) => {
            // Check if language is an object with a language property or a direct string
            const languageValue = typeof option.language === 'object' && option.language.language 
              ? option.language.language // Extract the enum string from the object
              : option.language;         // Use the string directly
            
            return {
              language: languageValue,
              solution: option.solution || "",
              preloadCode: typeof option.language === 'object' && option.language.preloadCode
                ? option.language.preloadCode
                : (option.preloadCode || "")
            };
          }),
          testCases: data.testCases.map((testCase: any) => ({
            input: testCase.input || "",
            output: testCase.output || "",
            isHidden: testCase.isHidden || false,
            isSample: testCase.isSample || false,
            showOnFailure: testCase.showOnFailure || false
          })),
          defaultLanguage: data.defaultLanguage || (data.languageOptions?.[0]?.language || ""),
          solution: data.solution || "",
          hints: data.hints || [],
          isAllOrNothing: Boolean(data.allOrNothingGrading || data.isAllOrNothing || false),
          difficulty: data.difficulty || "MEDIUM",
          defaultMark: Number(data.defaultMark || 1)
        };
      }

      console.log("Transformed data being sent to API:", transformedData);

      const url = isEditing 
        ? `/api/questions/${data.id}`  // Use the correct endpoint for updating
        : '/api/questions';  // Use the correct endpoint for creating

      const method = isEditing ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(transformedData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("API Error Response:", errorData);
        throw new Error(errorData.error || `Failed to ${isEditing ? 'update' : 'create'} question`);
      }

      const responseData = await response.json();
      console.log(`${isEditing ? 'Update' : 'Create'} successful:`, responseData);

      // Refresh the questions list
      await fetchQuestions();

      // Close the modal
      setIsFormModalOpen(false);
      setIsCodingFormModalOpen(false);
      setEditingQuestion(undefined);

      toast({
        title: "Success",
        description: `Question ${isEditing ? 'updated' : 'created'} successfully`,
      });
    } catch (error) {
      console.error("Error in handleFormSubmit:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to submit form",
        variant: "destructive",
      });
    }
  };

  // Add a validation function to check the data structure
  const validateSubmissionData = (data: any): string[] => {
    const errors: string[] = [];
    
    // Common validations for all question types
    if (!data.name?.trim()) {
      errors.push("Question name is required");
    }
    
    if (!data.folderId) {
      errors.push("Folder selection is required");
    }
    
    if (!data.questionText?.trim()) {
      errors.push("Question text is required");
    }
    
    // Type-specific validations
    if (data.type === "MCQ") {
      if (!data.mCQQuestion?.options || !Array.isArray(data.mCQQuestion.options) || data.mCQQuestion.options.length === 0) {
        errors.push("At least one option is required for MCQ questions");
      }
    } 
    else if (data.type === "CODING") {
      if (!data.languageOptions || !Array.isArray(data.languageOptions) || data.languageOptions.length === 0) {
        errors.push("At least one programming language is required for coding questions");
      } else {
        // Make sure each language option has a valid language property
        data.languageOptions.forEach((lang: any, index: number) => {
          if (!lang.language) {
            errors.push(`Language option ${index + 1} is missing a language identifier`);
          }
        });
      }
      
      if (!data.testCases || !Array.isArray(data.testCases) || data.testCases.length === 0) {
        errors.push("At least one test case is required for coding questions");
      } else {
        // Make sure test cases have input and output fields
        data.testCases.forEach((tc: any, index: number) => {
          if (!tc.input && tc.input !== "") {
            errors.push(`Test case ${index + 1} is missing input`);
          }
          if (!tc.output && tc.output !== "") {
            errors.push(`Test case ${index + 1} is missing output`);
          }
        });
      }
      
      // Check for defaultLanguage
      if (!data.defaultLanguage && data.languageOptions?.length > 0) {
        // If missing, auto-set to first language instead of error
        data.defaultLanguage = data.languageOptions[0].language;
      }
    }
    
    return errors;
  };

  const handleEditQuestion = (question: QuestionType) => {
    console.log('Editing question:', question);
    
    // Make sure we're accessing the mcqQuestion fields correctly
    const mcqQuestion = question.mCQQuestion || {} as any;
    console.log('MCQ question data:', mcqQuestion);
    
    // Safely extract MCQ options
    const mcqOptions = (mcqQuestion.options || []).map((opt: any) => ({
      id: opt.id,
      text: opt.text || "",
      grade: opt.grade || 0,
      feedback: opt.feedback || ""
    }));
    
    // Coding-related code unchanged...
    const codingQuestion = question.codingQuestion || {} as any;
    console.log('Coding question data:', codingQuestion);
    
    // Safely extract language options
    const languageOptions = (codingQuestion.languageOptions || []).map((lang: any) => ({
      id: lang.id,
      language: lang.language,
      solution: lang.solution || "",
      preloadCode: lang.preloadCode || ""
    }));
    
    // Safely extract test cases
    const testCases = (codingQuestion.testCases || []).map((tc: any) => ({
      id: tc.id,
      input: tc.input || "",
      output: tc.output || tc.expectedOutput || "", // Handle both output and expectedOutput fields
      isHidden: tc.isHidden || false,
      isSample: tc.isSample || false,
      type: tc.isSample ? "sample" : "hidden",
      gradePercentage: tc.grade || 0,
      showOnFailure: tc.showOnFailure || false
    }));
    
    console.log('Language options for edit:', languageOptions);
    console.log('Test cases for edit:', testCases);
    
    // Create the editingQuestion object with all necessary fields
    setEditingQuestion({
      id: question.id,
      name: question.name,
      type: question.type,
      status: question.status || 'DRAFT',
      folderId: question.folderId || '',
      version: question.version || 1,
      questionText: (question as any).questionText || codingQuestion.questionText || (question.mCQQuestion?.questionText || ''),
      difficulty: question.type === 'MCQ' 
        ? (mcqQuestion.difficulty || 'MEDIUM') 
        : (codingQuestion.difficulty || 'MEDIUM'),
      defaultMark: question.type === 'MCQ'
        ? (mcqQuestion.defaultMark || 1)
        : (codingQuestion.defaultMark || 1),
      isMultiple: mcqQuestion.isMultiple || false,
      shuffleChoice: mcqQuestion.shuffleChoice || false,
      generalFeedback: mcqQuestion.generalFeedback || '',
      choiceNumbering: mcqQuestion.choiceNumbering || 'abc',
      options: mcqOptions,
      languageOptions: languageOptions,
      testCases: testCases,
      allOrNothingGrading: codingQuestion.isAllOrNothing || false,
      defaultLanguage: codingQuestion.defaultLanguage || "",
      // Include nested objects for backward compatibility
      mCQQuestion: question.type === 'MCQ' ? {
        options: mcqOptions,
        isMultiple: mcqQuestion.isMultiple || false,
        shuffleChoice: mcqQuestion.shuffleChoice || false,
        generalFeedback: mcqQuestion.generalFeedback || "",
        solution: mcqQuestion.solution || "",
        hints: mcqQuestion.hints || [],
        difficulty: mcqQuestion.difficulty || 'MEDIUM',
        defaultMark: mcqQuestion.defaultMark || 1
      } : undefined,
      codingQuestion: question.type === 'CODING' ? {
        languageOptions: languageOptions,
        testCases: testCases,
        isAllOrNothing: codingQuestion.isAllOrNothing || false,
        defaultLanguage: codingQuestion.defaultLanguage || ""
      } : undefined
    });
    
    // Open the appropriate modal based on question type
    if (question.type === 'CODING') {
      setIsCodingFormModalOpen(true);
    } else {
      setIsFormModalOpen(true);
    }
  };

  const handleCreateQuestion = () => {
    // Reset the editing state
    setEditingQuestion(undefined);
    setSelectedQuestionType(null);
    
    // Open the question type selection modal
    setIsQuestionTypeModalOpen(true);
  };

  // Add back the missing functions
  const handleExport = async () => {
    try {
      const data = filteredQuestions.map(q => ({
        question: q.questionText,
        type: q.type,
        status: q.status,
        category: q.folderId ? folders.find(f => f.id === q.folderId)?.name : 'Uncategorized',
        createdAt: format(new Date(q.createdAt), 'PP'),
        updatedAt: format(new Date(q.updatedAt), 'PP')
      }));

      const csvContent = "data:text/csv;charset=utf-8," + 
        Object.keys(data[0]).join(",") + "\n" +
        data.map(row => Object.values(row).join(",")).join("\n");

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", "questions.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error exporting data:', error);
      toast({
        title: "Error",
        description: "Failed to export questions",
        variant: "destructive",
      });
    }
  };

  const handleFilterChange = (key: keyof FilterState, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    updateActiveFilters({ ...filters, [key]: value });
  };

  const updateActiveFilters = (currentFilters: FilterState) => {
    const active: string[] = [];
    
    if (currentFilters.search) {
      active.push(`Search: ${currentFilters.search}`);
    }
    
    if (currentFilters.category !== 'all') {
      const categoryName = folders.find(f => f.id === currentFilters.category)?.name || currentFilters.category;
      active.push(`Category: ${categoryName}`);
    }
    
    if (currentFilters.subcategory !== 'all') {
      for (const folder of folders) {
        const subfolder = folder.subfolders?.find(s => s.id === currentFilters.subcategory);
        if (subfolder) {
          active.push(`Subcategory: ${subfolder.name}`);
          break;
        }
      }
    }
    
    if (currentFilters.type !== 'all') {
      active.push(`Type: ${currentFilters.type}`);
    }
    
    if (currentFilters.status !== 'all') {
      active.push(`Status: ${currentFilters.status}`);
    }
    
    setActiveFilters(active);
  };

  const handleCategoryChange = (value: string) => {
    if (value.startsWith('sub_')) {
      const [_, categoryId, subcategoryId] = value.split('_');
      setPendingFilters(prev => ({
        ...prev,
        category: categoryId,
        subcategory: subcategoryId
      }));
    } else {
      setPendingFilters(prev => ({
        ...prev,
        category: value,
        subcategory: 'all'
      }));
    }
  };

  const applyFilters = () => {
    if (pendingFilters.subcategory !== 'all' && pendingFilters.category !== 'all') {
      const selectedCategory = folders.find(f => f.id === pendingFilters.category);
      const subcategoryExists = selectedCategory?.subfolders?.some(s => s.id === pendingFilters.subcategory);
      
      if (!subcategoryExists) {
        setPendingFilters(prev => ({...prev, subcategory: 'all'}));
        return;
      }
    }
    
    console.log("Applying filters:", pendingFilters);
    setFilters(pendingFilters);
    // Always reset to page 1 when applying new filters
    setCurrentPage(1);
    // Explicitly fetch questions with the new filters and page 1
    fetchQuestions(pendingFilters, 1);
  };

  const clearFilters = () => {
    console.log("Clearing all filters");
    const defaultFilters = {
      search: "",
      category: "all",
      subcategory: "all",
      type: "all",
      status: "all",
      includeSubcategories: false
    };
    setFilters(defaultFilters);
    setPendingFilters(defaultFilters);
    setActiveFilters([]);
    // Reset to page 1
    setCurrentPage(1);
    // Explicitly fetch with default filters and page 1
    fetchQuestions(defaultFilters, 1);
  };

  const handleBulkSelect = (questionId: string) => {
    setSelectedQuestions(prev => 
      prev.includes(questionId) 
        ? prev.filter(id => id !== questionId)
        : [...prev, questionId]
    );
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      // Scroll to top of the table when page changes
      const tableElement = document.querySelector('.questions-table');
      if (tableElement) {
        tableElement.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const handleQuestionTypeSelect = (type: 'MCQ' | 'CODING') => {
    setSelectedQuestionType(type);
    setIsQuestionTypeModalOpen(false);
    
    if (type === 'MCQ') {
      setIsFormModalOpen(true);
    } else if (type === 'CODING') {
      setIsCodingFormModalOpen(true);
    }
  };

  const transformQuestionForViewMode = (question: Question) => {
    const viewData: Record<string, any> = {
      id: question.id,
      name: question.name,
      text: question.questionText,
      type: question.type,
      status: question.status,
      folder: question.folderId ? (question.folder?.name || 'No folder') : 'No folder',
      updatedAt: question.updatedAt ? formatDate(question.updatedAt) : 'Unknown',
    };

    // ... existing code ...
  };

  const prepareQuestionForEditing = (question: Question): Question => {
    return {
      ...question,
      codingQuestion: question.codingQuestion ? {
        ...question.codingQuestion,
        languageOptions: question.codingQuestion.languageOptions.map(option => ({
          id: option.id,
          language: option.language,
          solution: option.solution
        })),
        testCases: question.codingQuestion.testCases.map(testCase => ({
          id: testCase.id,
          input: testCase.input,
          expectedOutput: testCase.expectedOutput,
          hidden: testCase.hidden
        })),
        hints: question.codingQuestion.hints || [],
        solutionExplanation: question.codingQuestion.solutionExplanation || ''
      } : undefined,
      mCQQuestion: question.mCQQuestion ? {
        options: question.mCQQuestion.options.map(option => ({
          id: option.id,
          text: option.text,
          isCorrect: option.isCorrect
        })),
        solution: question.mCQQuestion.solution || '',
        hints: question.mCQQuestion.hints || []
      } : undefined
    };
  };

  const handleEdit = (question: Question) => {
    const preparedQuestion = prepareQuestionForEditing(question);
    
    // Create a partial QuestionFormData with the fields we have
    const formData: Partial<QuestionFormData> = {
      id: preparedQuestion.id,
      name: preparedQuestion.name,
      type: preparedQuestion.type,
      status: preparedQuestion.status,
      folderId: preparedQuestion.folderId || '',
      version: preparedQuestion.version,
      questionText: preparedQuestion.questionText || '',
    };
    
    setEditingQuestion(formData as QuestionFormData);
    
    if (question.type === 'MCQ') {
      setIsFormModalOpen(true);
    } else if (question.type === 'CODING') {
      setIsCodingFormModalOpen(true);
    }
  };

  const prepareDataForMCQModal = () => {
    if (!editingQuestion) return undefined;
    
    return {
      id: editingQuestion.id,
      name: editingQuestion.name,
      questionText: editingQuestion.questionText,
      type: editingQuestion.type,
      status: editingQuestion.status,
      folderId: editingQuestion.folderId,
      mCQQuestion: editingQuestion.mCQQuestion || {
        options: [],
        solution: '',
        hints: []
      }
    };
  };

  const prepareDataForCodingModal = () => {
    if (!editingQuestion) return undefined;

    return {
      id: editingQuestion.id,
      name: editingQuestion.name,
      questionText: editingQuestion.questionText,
      type: editingQuestion.type,
      status: editingQuestion.status,
      folderId: editingQuestion.folderId,
      codingQuestion: editingQuestion.codingQuestion || {
        id: '',
        languageOptions: [],
        testCases: [],
        hints: [],
        solutionExplanation: ''
      }
    };
  };

  // Update the table display to show only current page questions
  const paginatedQuestions = filteredQuestions.slice(
    (currentPage - 1) * QUESTIONS_PER_PAGE,
    currentPage * QUESTIONS_PER_PAGE
  );

  // Define a reusable pagination component
  const PaginationControls = () => (
    <div className="flex justify-between items-center">
      <div className="text-sm text-muted-foreground">
        Showing {filteredQuestions.length > 0 ? `${(currentPage - 1) * QUESTIONS_PER_PAGE + 1}-${Math.min(currentPage * QUESTIONS_PER_PAGE, totalQuestions)}` : '0'} of {totalQuestions} questions
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1 || isLoading}
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Previous
        </Button>
        <div className="flex items-center gap-1">
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            // Show pages around current page
            let pageToShow;
            if (totalPages <= 5) {
              pageToShow = i + 1;
            } else if (currentPage <= 3) {
              pageToShow = i + 1;
            } else if (currentPage >= totalPages - 2) {
              pageToShow = totalPages - 4 + i;
            } else {
              pageToShow = currentPage - 2 + i;
            }
    
    return (
              <Button
                key={pageToShow}
                variant={currentPage === pageToShow ? "default" : "outline"}
                size="sm"
                className="w-8 h-8 p-0"
                onClick={() => handlePageChange(pageToShow)}
                disabled={isLoading}
              >
                {pageToShow}
              </Button>
            );
          })}
          
          {totalPages > 5 && currentPage < totalPages - 2 && (
            <>
              <span className="mx-1">...</span>
              <Button
                variant="outline"
                size="sm"
                className="w-8 h-8 p-0"
                onClick={() => handlePageChange(totalPages)}
                disabled={isLoading}
              >
                {totalPages}
              </Button>
            </>
          )}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages || isLoading}
        >
          Next
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
      </div>
    );

  // Create a function to handle opening the delete dialog
  const handleDeleteClick = (questionId: string) => {
    setQuestionToDelete(questionId);
    setIsDeleteDialogOpen(true);
  };

  return (
    <div className="container mx-auto py-6 bg-background">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-foreground">Question bank</h1>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-muted rounded-lg p-1">
            <Button
              variant={viewMode === 'table' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('table')}
              title="Table View"
            >
              <TableIcon className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              title="List View"
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              title="Grid View"
            >
              <Grid className="h-4 w-4" />
            </Button>
          </div>
          <Button variant="outline" onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Dialog open={isQuestionTypeModalOpen} onOpenChange={setIsQuestionTypeModalOpen}>
            <DialogTrigger asChild>
              <Button onClick={handleCreateQuestion}>
                <Plus className="mr-2 h-4 w-4" />
                Create Question
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Select Question Type</DialogTitle>
                <DialogDescription>
                  Choose the type of question you want to create
                </DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4 py-4">
                <Button
                  variant="outline"
                  className="flex flex-col items-center justify-center h-32 p-4 space-y-2 border-2 hover:border-primary"
                  onClick={() => handleQuestionTypeSelect('MCQ')}
                >
                  <ListChecks className="w-10 h-10" />
                  <span>Multiple Choice</span>
                </Button>
                <Button
                  variant="outline"
                  className="flex flex-col items-center justify-center h-32 p-4 space-y-2 border-2 hover:border-primary"
                  onClick={() => handleQuestionTypeSelect('CODING')}
                >
                  <Code className="w-10 h-10" />
                  <span>Coding Question</span>
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* MCQ Question Modal */}
          <Dialog open={isFormModalOpen} onOpenChange={(open) => {
            setIsFormModalOpen(open);
            if (!open) {
              setEditingQuestion(undefined);
              setSelectedQuestionType(null);
            }
          }}>
            <DialogContent className="max-w-4xl">
              <DialogHeader>
                <DialogTitle>{editingQuestion ? "Edit Question" : "Create New Question"}</DialogTitle>
              </DialogHeader>
              <QuestionFormModal
                isOpen={isFormModalOpen}
                onClose={() => setIsFormModalOpen(false)}
                onSubmit={handleFormSubmit}
                initialData={editingQuestion}
                folders={folders}
                subfolders={[]}
                onAddFolder={() => setIsCreateFolderModalOpen(true)}
                onAddSubfolder={handleCreateSubfolder}
              />
            </DialogContent>
          </Dialog>

          {/* Coding Question Modal */}
          <Dialog open={isCodingFormModalOpen} onOpenChange={(open) => {
            setIsCodingFormModalOpen(open);
            if (!open) {
              setEditingQuestion(undefined);
              setSelectedQuestionType(null);
            }
          }}>
            <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden">
              <DialogHeader>
                <DialogTitle>{editingQuestion ? "Edit Coding Question" : "Create New Coding Question"}</DialogTitle>
              </DialogHeader>
              <CodingQuestionFormModal
                isOpen={isCodingFormModalOpen}
                onClose={() => setIsCodingFormModalOpen(false)}
                onSubmit={handleFormSubmit}
                initialData={editingQuestion}
                folders={folders}
                onAddFolder={() => setIsCreateFolderModalOpen(true)}
              />
            </DialogContent>
          </Dialog>

        </div>
      </div>

      <Tabs defaultValue="questions" className="space-y-4">
        <TabsList>
          <TabsTrigger value="questions">Questions</TabsTrigger>
          <TabsTrigger value="folders">Folders</TabsTrigger>
          <TabsTrigger value="stats">Statistics</TabsTrigger>
        </TabsList>

        <TabsContent value="questions">
          {/* Filters Section */}
          <div className="bg-card rounded-lg shadow p-6 mb-6 text-card-foreground">
            <div className="space-y-4">
              {/* Search Input */}
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search questions..."
                      value={filters.search}
                      onChange={(e) => handleFilterChange('search', e.target.value)}
                      className="pl-8"
                    />
                  </div>
                </div>
              </div>

              {/* Filter Controls */}
              <div className="grid grid-cols-3 gap-4">
                <Select 
                  value={pendingFilters.subcategory !== 'all' 
                    ? `sub_${pendingFilters.category}_${pendingFilters.subcategory}`
                    : pendingFilters.category}
                  onValueChange={handleCategoryChange}
                >
                  <SelectTrigger className="w-[300px]">
                    <SelectValue placeholder="Select Category/Subcategory">
                      {pendingFilters.subcategory !== 'all' 
                        ? `${folders.find(f => f.id === pendingFilters.category)?.name || ''} > ${
                            folders.find(f => f.id === pendingFilters.category)
                              ?.subfolders.find(s => s.id === pendingFilters.subcategory)?.name || ''
                          }`
                        : pendingFilters.category === 'all'
                          ? 'All Categories'
                          : folders.find(f => f.id === pendingFilters.category)?.name || 'All Categories'}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {folders.map((folder) => (
                      <div key={folder.id}>
                        <SelectItem value={folder.id}>
                          📁 {folder.name}
                        </SelectItem>
                        {folder.subfolders?.map((subfolder) => (
                          <SelectItem 
                            key={subfolder.id} 
                            value={`sub_${folder.id}_${subfolder.id}`}
                            className="pl-6"
                          >
                            └─ 📄 {subfolder.name}
                          </SelectItem>
                        ))}
                      </div>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={pendingFilters.type}
                  onValueChange={(value) => setPendingFilters(prev => ({ ...prev, type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="MCQ">MCQ</SelectItem>
                    <SelectItem value="CODING">Coding</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={pendingFilters.status}
                  onValueChange={(value) => {
                    console.log(`Setting status filter to: ${value}`);
                    setPendingFilters(prev => ({ ...prev, status: value }));
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="DRAFT">Draft</SelectItem>
                    <SelectItem value="READY">Ready</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Additional Options */}
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <Switch
                    id="includeSubcategories"
                    checked={pendingFilters.includeSubcategories}
                    disabled={pendingFilters.subcategory !== 'all'}
                    onCheckedChange={(checked) => setPendingFilters(prev => ({ ...prev, includeSubcategories: checked }))}
                  />
                  <Label 
                    htmlFor="includeSubcategories" 
                    className={pendingFilters.subcategory !== 'all' ? "text-muted-foreground" : ""}
                  >
                    Include subcategories {pendingFilters.subcategory !== 'all' ? "(unavailable when subcategory selected)" : ""}
                  </Label>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      // Get all the toggle switches for question rows
                      const tableRows = document.querySelectorAll('.question-row-toggle');
                      
                      // Check if most of the questions are already expanded
                      const expandedCount = Array.from(tableRows).filter((toggle: any) => toggle.checked).length;
                      const shouldCollapse = expandedCount > tableRows.length / 2;
                      
                      // Toggle all questions based on current state
                      tableRows.forEach((toggle: any) => {
                        if (shouldCollapse && toggle.checked) {
                          // Collapse if most are expanded
                          toggle.click();
                        } else if (!shouldCollapse && !toggle.checked) {
                          // Expand if most are collapsed
                          toggle.click();
                        }
                      });
                    }}
                    className="flex items-center gap-1"
                    title="Toggle expansion of all questions"
                  >
                    <div className="h-4 w-4">
                      <ListChecks className="h-4 w-4" />
                    </div>
                    <span>Toggle Views</span>
                  </Button>
                </div>

                <Button 
                  onClick={applyFilters}
                  className="ml-auto"
                >
                  Apply Filters
                </Button>
              </div>

              {/* Active Filters */}
              {activeFilters.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {activeFilters.map((filter, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="flex items-center gap-1"
                    >
                      {filter}
                      <X
                        className="h-3 w-3 cursor-pointer"
                        onClick={() => {
                          const [key] = filter.toLowerCase().split(':');
                          handleFilterChange(key as keyof FilterState, 'all');
                        }}
                      />
                    </Badge>
                  ))}
                </div>
              )}

              {/* Filter Actions */}
              <div className="flex justify-between items-center pt-4">
                <Button
                  variant="outline"
                  onClick={clearFilters}
                >
                  <X className="mr-2 h-4 w-4" />
                  Clear filters
                </Button>
                <div className="text-sm text-muted-foreground">
                  {isLoading ? (
                    <span>Loading questions...</span>
                  ) : (
                    <span>
                      Showing {filteredQuestions.length} questions
                      {filters.category !== 'all' && filters.category && 
                        ` in ${folders.find(f => f.id === filters.category)?.name || 'category'}`}
                      {filters.subcategory !== 'all' && filters.subcategory && 
                        ` in ${folders.find(f => f.id === filters.subcategory)?.name || 'subcategory'}`}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Questions Table */}
          <div className="bg-card rounded-lg shadow p-6">
            {/* Add top pagination controls */}
            <div className="mb-4">
              <PaginationControls />
            </div>
            
            <Table className="questions-table">
                <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">Select</TableHead>
                    <TableHead>Question</TableHead>
                  <TableHead className="w-[100px]">Type</TableHead>
                  <TableHead className="w-[100px]">Status</TableHead>
                  <TableHead className="w-[180px]">Updated</TableHead>
                  <TableHead className="w-[150px]">Last Modified By</TableHead>
                  <TableHead className="w-[120px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      <Loader2 className="h-8 w-8 animate-spin mx-auto" />
                      <p className="mt-2 text-sm text-muted-foreground">Loading questions...</p>
                    </TableCell>
                  </TableRow>
                ) : filteredQuestions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      <p className="text-muted-foreground">No questions match your current filters</p>
                      <div className="flex justify-center gap-2 mt-2">
                        <Button
                          variant="outline" 
                          size="sm"
                          onClick={clearFilters}
                        >
                          <X className="mr-2 h-4 w-4" />
                          Clear Filters
                        </Button>
                        <Button
                          variant="default" 
                          size="sm"
                          onClick={handleCreateQuestion}
                        >
                          <Plus className="mr-2 h-4 w-4" />
                          Create Question
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredQuestions.map((question) => (
                    <QuestionRow
                      key={question.id}
                      question={question}
                      onSelect={handleBulkSelect}
                      isSelected={selectedQuestions.includes(question.id)}
                    onPreview={(question) => {
                      setPreviewQuestion(question);
                      setIsPreviewModalOpen(true);
                    }}
                      onEdit={handleEditQuestion}
                    onDelete={handleDeleteClick}
                    />
                  ))}
                </TableBody>
              </Table>

            {/* Bottom pagination controls */}
            <div className="mt-4">
              <PaginationControls />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="folders">
          {/* Folders Section - Improved UI */}
          <div className="bg-card rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Folder Management</h2>
              <Dialog open={isCreateFolderModalOpen} onOpenChange={setIsCreateFolderModalOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                  Create Folder
                </Button>
                </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Folder</DialogTitle>
                    <DialogDescription>
                      Enter a name for your new folder
                    </DialogDescription>
          </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="folderName" className="text-right">
                        Folder Name
                      </Label>
              <Input
                id="folderName"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                        className="col-span-3"
                        placeholder="e.g. JavaScript Basics"
              />
            </div>
          </div>
          <DialogFooter>
                    <Button
                      type="submit"
                      onClick={handleCreateFolder}
                      disabled={!newFolderName.trim()}
                    >
              Create Folder
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
            </div>

      {/* Create Subfolder Modal */}
      <Dialog open={isCreateSubfolderModalOpen} onOpenChange={setIsCreateSubfolderModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Subfolder</DialogTitle>
                  <DialogDescription>
                    Enter a name for your new subfolder in {folders.find(f => f.id === selectedFolderForSubfolder)?.name || 'the selected folder'}
                  </DialogDescription>
          </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="subfolderName" className="text-right">
                      Subfolder Name
                    </Label>
              <Input
                id="subfolderName"
                value={newSubfolderName}
                onChange={(e) => setNewSubfolderName(e.target.value)}
                      className="col-span-3"
                      placeholder="e.g. Loops and Arrays"
              />
            </div>
          </div>
          <DialogFooter>
                  <Button
                    type="submit"
                    onClick={handleCreateSubfolder}
                    disabled={!newSubfolderName.trim() || !selectedFolderForSubfolder}
                  >
              Create Subfolder
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Folder Modal */}
      <Dialog open={isEditFolderModalOpen} onOpenChange={setIsEditFolderModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Folder</DialogTitle>
                  <DialogDescription>
                    Update the name of this folder
                  </DialogDescription>
          </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="updatedFolderName" className="text-right">
                      Folder Name
                    </Label>
              <Input
                      id="updatedFolderName"
                value={updatedFolderName}
                onChange={(e) => setUpdatedFolderName(e.target.value)}
                      className="col-span-3"
                      placeholder={editingFolder?.name}
              />
            </div>
          </div>
          <DialogFooter>
                  <Button
                    type="submit"
                    onClick={handleUpdateFolder}
                    disabled={!updatedFolderName.trim()}
                  >
              Update Folder
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

            {/* Folder List */}
            <div className="grid gap-4">
              {isLoading ? (
                <div className="flex items-center justify-center py-10">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
              ) : folders.length === 0 ? (
                <div className="text-center py-10 bg-accent/20 rounded-lg">
                  <FolderIcon className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                  <h3 className="text-lg font-medium mb-2">No folders yet</h3>
                  <p className="text-muted-foreground mb-4">Create your first folder to organize your questions</p>
                  <Button onClick={() => setIsCreateFolderModalOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Create First Folder
                  </Button>
                </div>
              ) : (
                folders.map((folder) => (
                  <div key={folder.id} className="border rounded-lg overflow-hidden transition-all">
                    <div 
                      className={`flex items-center justify-between p-4 cursor-pointer bg-card hover:bg-accent/10 ${expandedFolders.has(folder.id) ? 'border-b' : ''}`}
                      onClick={() => {
                        setExpandedFolders(prev => {
                          const newSet = new Set(prev);
                          if (newSet.has(folder.id)) {
                            newSet.delete(folder.id);
                          } else {
                            newSet.add(folder.id);
                          }
                          return newSet;
                        });
                      }}
                    >
                      <div className="flex items-center gap-2">
                        {expandedFolders.has(folder.id) ? 
                          <FolderOpen className="h-5 w-5 text-amber-500" /> : 
                          <Folder className="h-5 w-5 text-amber-500" />
                        }
                        <span className="font-medium">{folder.name}</span>
                        <Badge variant="outline" className="ml-2 text-xs">
                          {folder.subfolders?.length || 0} subfolders
                        </Badge>
                    </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedFolderForSubfolder(folder.id);
                            setIsCreateSubfolderModalOpen(true);
                          }}
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          <span className="text-xs">Add Subfolder</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingFolder(folder);
                            setUpdatedFolderName(folder.name);
                            setIsEditFolderModalOpen(true);
                          }}
                        >
                          <Pencil className="h-4 w-4 text-muted-foreground" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (confirm(`Are you sure you want to delete the folder "${folder.name}"?`)) {
                              handleDeleteFolder(folder.id);
                            }
                          }}
                        >
                          <Trash2 className="h-4 w-4 text-destructive/70" />
                        </Button>
                </div>
                    </div>
                    
                    {/* Subfolders */}
                    {expandedFolders.has(folder.id) && (
                      <div className="bg-muted/30 divide-y">
                        {folder.subfolders && folder.subfolders.length > 0 ? (
                          folder.subfolders.map((subfolder) => (
                            <div key={subfolder.id} className="flex items-center justify-between py-3 px-6 hover:bg-accent/5">
                              <div className="flex items-center gap-2">
                                <div className="w-5"></div> {/* Indent space */}
                                <FileText className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm">{subfolder.name}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() => handleEditSubfolder(folder.id, subfolder.id)}
                                >
                                  <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() => {
                                    if (confirm(`Are you sure you want to delete the subfolder "${subfolder.name}"?`)) {
                                      handleDeleteSubfolder(folder.id, subfolder.id);
                                    }
                                  }}
                                >
                                  <Trash2 className="h-3.5 w-3.5 text-destructive/70" />
                                </Button>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="py-3 px-6 text-center text-muted-foreground text-sm italic">
                            No subfolders yet. Click "Add Subfolder" to create one.
              </div>
            )}
          </div>
                    )}
              </div>
                ))
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="stats">
          {/* Statistics Section - Improved with dark/light theme support */}
          <div className="bg-card rounded-lg shadow-md overflow-hidden">
            {/* Hero Stats Section - Theme-aware gradient */}
            <div className="relative bg-gradient-to-r from-primary/80 to-primary/30 dark:from-primary/30 dark:to-primary/10 p-8 mb-6">
              <div className="absolute inset-0 opacity-10 dark:opacity-20">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,transparent,transparent_30%,hsl(var(--background)))]"></div>
                <div className="absolute top-0 left-0 w-24 h-24 bg-foreground/20 rounded-full -ml-12 -mt-12"></div>
                <div className="absolute bottom-0 right-0 w-32 h-32 bg-foreground/20 rounded-full -mr-10 -mb-10"></div>
              </div>
              <h2 className="text-2xl font-bold text-primary-foreground dark:text-primary mb-2">Question Bank Analytics</h2>
              <p className="text-primary-foreground/80 dark:text-primary/90 mb-6">Overview of your question repository and content health</p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Total Questions Card */}
                <div className="bg-background/80 backdrop-blur-sm rounded-xl p-4 text-foreground border border-border/20 shadow-sm hover:bg-background/90 transition-all">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-muted-foreground text-sm font-medium mb-1">Total Questions</p>
                      <h3 className="text-3xl font-bold">{stats.total}</h3>
                    </div>
                    <div className="p-2 bg-primary/10 dark:bg-primary/20 text-primary rounded-lg">
                      <FileText className="h-6 w-6" />
                    </div>
                  </div>
                  <div className="mt-2 text-sm text-muted-foreground">
                    {stats.total > 0 ? 
                      `Last added ${formatDate(new Date())}` : 
                      "No questions yet"}
                  </div>
                </div>
                
                {/* MCQ Questions */}
                <div className="bg-background/80 backdrop-blur-sm rounded-xl p-4 text-foreground border border-border/20 shadow-sm hover:bg-background/90 transition-all">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-muted-foreground text-sm font-medium mb-1">MCQ Questions</p>
                      <h3 className="text-3xl font-bold">{stats.multipleChoice}</h3>
                    </div>
                    <div className="p-2 bg-purple-500/10 dark:bg-purple-500/20 text-purple-500 dark:text-purple-400 rounded-lg">
                      <ListChecks className="h-6 w-6" />
                    </div>
                  </div>
                  <div className="mt-2 flex items-center">
                    <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="bg-purple-500 dark:bg-purple-400 h-full rounded-full" 
                        style={{ width: `${stats.total > 0 ? (stats.multipleChoice / stats.total) * 100 : 0}%` }}>
                      </div>
                    </div>
                    <span className="ml-2 text-xs text-muted-foreground">
                      {stats.total > 0 ? `${Math.round((stats.multipleChoice / stats.total) * 100)}%` : '0%'}
                    </span>
                  </div>
                </div>
                
                {/* Coding Questions */}
                <div className="bg-background/80 backdrop-blur-sm rounded-xl p-4 text-foreground border border-border/20 shadow-sm hover:bg-background/90 transition-all">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-muted-foreground text-sm font-medium mb-1">Coding Questions</p>
                      <h3 className="text-3xl font-bold">{stats.coding}</h3>
                    </div>
                    <div className="p-2 bg-blue-500/10 dark:bg-blue-500/20 text-blue-500 dark:text-blue-400 rounded-lg">
                      <Code className="h-6 w-6" />
                    </div>
                  </div>
                  <div className="mt-2 flex items-center">
                    <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="bg-blue-500 dark:bg-blue-400 h-full rounded-full" 
                        style={{ width: `${stats.total > 0 ? (stats.coding / stats.total) * 100 : 0}%` }}>
                      </div>
                    </div>
                    <span className="ml-2 text-xs text-muted-foreground">
                      {stats.total > 0 ? `${Math.round((stats.coding / stats.total) * 100)}%` : '0%'}
                    </span>
                  </div>
                </div>
                
                {/* Ready Status */}
                <div className="bg-background/80 backdrop-blur-sm rounded-xl p-4 text-foreground border border-border/20 shadow-sm hover:bg-background/90 transition-all">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-muted-foreground text-sm font-medium mb-1">Ready Questions</p>
                      <h3 className="text-3xl font-bold">{stats.ready}</h3>
                    </div>
                    <div className="p-2 bg-green-500/10 dark:bg-green-500/20 text-green-500 dark:text-green-400 rounded-lg">
                      <CheckCircle className="h-6 w-6" />
                    </div>
                  </div>
                  <div className="mt-2 flex items-center">
                    <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="bg-green-500 dark:bg-green-400 h-full rounded-full" 
                        style={{ width: `${stats.total > 0 ? (stats.ready / stats.total) * 100 : 0}%` }}>
                      </div>
                    </div>
                    <span className="ml-2 text-xs text-muted-foreground">
                      {stats.total > 0 ? `${Math.round((stats.ready / stats.total) * 100)}%` : '0%'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content Area */}
            <div className="p-6">
              {/* Distribution Charts */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {/* Question Type Distribution */}
                <Card className="border shadow-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg font-medium">Question Type Distribution</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="relative pt-1">
                      <div className="flex mb-2 items-center justify-between">
                        <div className="flex items-center">
                          <div className="w-3 h-3 rounded-full bg-purple-500 dark:bg-purple-400 mr-2"></div>
                          <span className="text-xs font-semibold">MCQ</span>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-semibold">{stats.multipleChoice} questions</span>
                        </div>
                      </div>
                      <div className="flex mb-2">
                        <div className="shadow-none flex flex-col text-center whitespace-nowrap justify-center w-full rounded">
                          <div className="bg-gradient-to-r from-purple-400 to-purple-600 dark:from-purple-500 dark:to-purple-700 h-4 rounded text-xs leading-none py-1 text-center text-white"
                            style={{ width: `${stats.total > 0 ? (stats.multipleChoice / stats.total) * 100 : 0}%` }}>
                            {stats.total > 0 && stats.multipleChoice > 0 ? `${Math.round((stats.multipleChoice / stats.total) * 100)}%` : ''}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex mb-2 items-center justify-between">
                        <div className="flex items-center">
                          <div className="w-3 h-3 rounded-full bg-blue-500 dark:bg-blue-400 mr-2"></div>
                          <span className="text-xs font-semibold">Coding</span>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-semibold">{stats.coding} questions</span>
                        </div>
                      </div>
                      <div className="flex mb-2">
                        <div className="shadow-none flex flex-col text-center whitespace-nowrap justify-center w-full rounded">
                          <div className="bg-gradient-to-r from-blue-400 to-blue-600 dark:from-blue-500 dark:to-blue-700 h-4 rounded text-xs leading-none py-1 text-center text-white"
                            style={{ width: `${stats.total > 0 ? (stats.coding / stats.total) * 100 : 0}%` }}>
                            {stats.total > 0 && stats.coding > 0 ? `${Math.round((stats.coding / stats.total) * 100)}%` : ''}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Circle representation */}
                    <div className="flex justify-center mt-6">
                      <div className="relative h-36 w-36">
                        {stats.total > 0 ? (
                          <>
                            <svg className="w-full h-full" viewBox="0 0 100 100">
                              <circle 
                                className="text-muted stroke-current" 
                                strokeWidth="10" 
                                stroke="currentColor" 
                                fill="transparent" 
                                r="40" 
                                cx="50" 
                                cy="50" 
                              />
                              <circle 
                                className="text-purple-500 dark:text-purple-400 stroke-current" 
                                strokeWidth="10" 
                                strokeDasharray={`${(stats.multipleChoice / stats.total) * 251.2} 251.2`}
                                strokeLinecap="round" 
                                stroke="currentColor" 
                                fill="transparent" 
                                r="40" 
                                cx="50" 
                                cy="50" 
                              />
                              <circle 
                                className="text-blue-500 dark:text-blue-400 stroke-current" 
                                strokeWidth="10" 
                                strokeDasharray={`${(stats.coding / stats.total) * 251.2} 251.2`}
                                strokeDashoffset={`-${(stats.multipleChoice / stats.total) * 251.2}`}
                                strokeLinecap="round" 
                                stroke="currentColor" 
                                fill="transparent" 
                                r="40" 
                                cx="50" 
                                cy="50" 
                              />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center">
                              <span className="text-2xl font-bold">{stats.total}</span>
                            </div>
                          </>
                        ) : (
                          <div className="flex items-center justify-center h-full">
                            <p className="text-muted-foreground">No data</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                {/* Question Status */}
                <Card className="border shadow-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg font-medium">Ready vs. Draft</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="relative pt-1">
                      <div className="flex mb-2 items-center justify-between">
                        <div className="flex items-center">
                          <div className="w-3 h-3 rounded-full bg-green-500 dark:bg-green-400 mr-2"></div>
                          <span className="text-xs font-semibold">Ready</span>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-semibold">{stats.ready} questions</span>
                        </div>
                      </div>
                      <div className="flex mb-2">
                        <div className="shadow-none flex flex-col text-center whitespace-nowrap justify-center w-full rounded">
                          <div className="bg-gradient-to-r from-green-400 to-green-600 dark:from-green-500 dark:to-green-700 h-4 rounded text-xs leading-none py-1 text-center text-white"
                            style={{ width: `${stats.total > 0 ? (stats.ready / stats.total) * 100 : 0}%` }}>
                            {stats.total > 0 && stats.ready > 0 ? `${Math.round((stats.ready / stats.total) * 100)}%` : ''}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex mb-2 items-center justify-between">
                        <div className="flex items-center">
                          <div className="w-3 h-3 rounded-full bg-amber-500 dark:bg-amber-400 mr-2"></div>
                          <span className="text-xs font-semibold">Draft</span>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-semibold">{stats.draft} questions</span>
                        </div>
                      </div>
                      <div className="flex mb-2">
                        <div className="shadow-none flex flex-col text-center whitespace-nowrap justify-center w-full rounded">
                          <div className="bg-gradient-to-r from-amber-400 to-amber-600 dark:from-amber-500 dark:to-amber-700 h-4 rounded text-xs leading-none py-1 text-center text-white"
                            style={{ width: `${stats.total > 0 ? (stats.draft / stats.total) * 100 : 0}%` }}>
                            {stats.total > 0 && stats.draft > 0 ? `${Math.round((stats.draft / stats.total) * 100)}%` : ''}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Status Split View */}
                    <div className="mt-6">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-3 rounded-lg border hover:bg-accent/50 transition-colors">
                          <p className="text-sm font-medium flex items-center">
                            <ListChecks className="h-4 w-4 mr-2 text-purple-500 dark:text-purple-400" />
                            MCQ Status
                          </p>
                          <div className="mt-2 flex gap-2">
                            <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                              <div 
                                className="bg-green-500 dark:bg-green-400 h-full" 
                                style={{ width: `${stats.multipleChoice > 0 ? 70 : 0}%` }}
                              ></div>
                            </div>
                            <div className="text-xs text-muted-foreground">70%</div>
                          </div>
                        </div>
                        
                        <div className="p-3 rounded-lg border hover:bg-accent/50 transition-colors">
                          <p className="text-sm font-medium flex items-center">
                            <Code className="h-4 w-4 mr-2 text-blue-500 dark:text-blue-400" />
                            Coding Status
                          </p>
                          <div className="mt-2 flex gap-2">
                            <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                              <div 
                                className="bg-green-500 dark:bg-green-400 h-full" 
                                style={{ width: `${stats.coding > 0 ? 60 : 0}%` }}
                              ></div>
                            </div>
                            <div className="text-xs text-muted-foreground">60%</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              {/* Folder Distribution */}
              <div className="mb-8">
                <Card className="border shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-lg font-medium">Question Distribution by Folder</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {Object.entries(stats.byFolder).length > 0 ? (
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {Object.entries(stats.byFolder)
                          .sort(([, countA], [, countB]) => countB - countA)
                          .slice(0, showAllFolders ? undefined : 8) // Show all folders if showAllFolders is true
                          .map(([folder, count], index) => (
                            <div key={folder} 
                              className="p-3 border rounded-lg hover:shadow-md transition-all hover:bg-accent/50"
                            >
                              <div className="flex justify-between items-center mb-1.5">
                                <div className="flex items-center">
                                  <div className={`w-8 h-8 flex items-center justify-center rounded-full text-white
                                    ${index === 0 ? 'bg-primary' : 
                                      index === 1 ? 'bg-blue-500 dark:bg-blue-600' : 
                                      index === 2 ? 'bg-purple-500 dark:bg-purple-600' : 
                                      index === 3 ? 'bg-green-500 dark:bg-green-600' : 
                                      'bg-slate-500 dark:bg-slate-600'}`}>
                                    <FolderIcon className="h-4 w-4" />
                                  </div>
                                  <span className="ml-2 font-medium text-sm truncate max-w-[12rem]">{folder}</span>
                                </div>
                                <span className="font-semibold text-sm">{count}</span>
                              </div>
                              <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                                <div 
                                  className={`${index === 0 ? 'bg-primary' : 
                                    index === 1 ? 'bg-blue-500 dark:bg-blue-600' : 
                                    index === 2 ? 'bg-purple-500 dark:bg-purple-600' : 
                                    index === 3 ? 'bg-green-500 dark:bg-green-600' : 
                                    'bg-slate-500 dark:bg-slate-600'} h-1.5 rounded-full`}
                                  style={{ width: `${stats.total > 0 ? (count / stats.total) * 100 : 0}%` }}
                                ></div>
                              </div>
                    </div>
                  ))}
                        
                        {/* Show more/less button when there are more than 8 folders */}
                        {Object.entries(stats.byFolder).length > 8 && (
                          <div className="col-span-full flex justify-center mt-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => setShowAllFolders(!showAllFolders)}
                              className="transition-all"
                            >
                              {showAllFolders ? (
                                <>
                                  <ChevronUp className="mr-1 h-4 w-4" />
                                  Show Less Folders
                                </>
                              ) : (
                                <>
                                  <ChevronDown className="mr-1 h-4 w-4" />
                                  Show More Folders
                                </>
                              )}
                            </Button>
                </div>
            )}
          </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <FolderIcon className="mx-auto h-12 w-12 opacity-30 mb-2" />
                        <p>No folder data available</p>
              </div>
            )}
                  </CardContent>
                </Card>
          </div>
              
              {/* Insights & Recommendations */}
              <Card className="border shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg font-medium flex items-center">
                    <Settings className="mr-2 h-5 w-5 text-primary" />
                    Insights & Recommendations
                  </CardTitle>
                </CardHeader>
                <CardContent>
          <div className="space-y-4">
                    {stats.total > 0 ? (
                      <>
                        <div className="p-4 border rounded-xl bg-accent/25 shadow-sm">
                          <h3 className="font-semibold flex items-center mb-2">
                            <FileText className="mr-2 h-5 w-5 text-primary" />
                            Content Balance
                          </h3>
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm text-muted-foreground">MCQ vs Coding Balance</span>
                            <div className="flex items-center">
                              <div className="w-24 h-1.5 bg-muted rounded-full mr-2 overflow-hidden">
                                <div 
                                  className="bg-primary h-full rounded-full" 
                                  style={{ width: `${stats.total > 0 ? (stats.multipleChoice / stats.total) * 100 : 0}%` }}
                                ></div>
                              </div>
                              <span className="text-xs font-medium">
                                {stats.multipleChoice > stats.coding * 2 
                                  ? "MCQ Heavy" 
                                  : stats.coding > stats.multipleChoice * 2
                                    ? "Coding Heavy"
                                    : "Balanced"}
                              </span>
                            </div>
                          </div>
                          <p className="text-sm">
                            {stats.multipleChoice > stats.coding * 2 
                              ? "Your question bank is heavily weighted toward multiple-choice questions. Consider adding more coding questions for a balanced assessment."
                              : stats.coding > stats.multipleChoice * 2
                                ? "Your question bank is heavily weighted toward coding questions. Consider adding more multiple-choice questions for a balanced assessment."
                                : "Your question bank has a good balance between multiple-choice and coding questions."}
                          </p>
                        </div>
                        
                        <div className="p-4 border rounded-xl bg-accent/25 shadow-sm">
                          <h3 className="font-semibold flex items-center mb-2">
                            <CheckCircle className="mr-2 h-5 w-5 text-green-500 dark:text-green-400" />
                            Readiness Status
                          </h3>
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm text-muted-foreground">Ready Status</span>
                            <div className="flex items-center">
                              <div className="w-24 h-1.5 bg-muted rounded-full mr-2 overflow-hidden">
                                <div 
                                  className="bg-green-500 dark:bg-green-400 h-full rounded-full" 
                                  style={{ width: `${stats.total > 0 ? (stats.ready / stats.total) * 100 : 0}%` }}
                                ></div>
                              </div>
                              <span className="text-xs font-medium">
                                {stats.ready === stats.total 
                                  ? "All Ready" 
                                  : stats.ready > stats.draft
                                    ? "Mostly Ready"
                                    : "Needs Work"}
                              </span>
                            </div>
                          </div>
                          <p className="text-sm">
                            {stats.draft > stats.ready
                              ? `You have ${stats.draft} questions in draft status. Focus on reviewing and finalizing these questions to make them available for assessments.`
                              : stats.ready === stats.total
                                ? "All questions are marked as ready. Great job maintaining your question bank!"
                                : `Most of your questions (${stats.ready} of ${stats.total}) are ready for use. Consider reviewing the remaining ${stats.draft} draft questions.`}
                          </p>
                        </div>
                        
                        {Object.keys(stats.byFolder).length > 5 && (
                          <div className="p-4 border rounded-xl bg-accent/25 shadow-sm">
                            <h3 className="font-semibold flex items-center mb-2">
                              <FolderIcon className="mr-2 h-5 w-5 text-amber-500 dark:text-amber-400" />
                              Folder Organization
                            </h3>
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-sm text-muted-foreground">Folder Count</span>
                              <Badge variant="outline">{Object.keys(stats.byFolder).length} folders</Badge>
                            </div>
                            <p className="text-sm">
                              Your questions are organized across {Object.keys(stats.byFolder).length} folders. Consider consolidating related topics to improve navigation.
                            </p>
                          </div>
                        )}
                        
                        {stats.total < 20 && (
                          <div className="p-4 border rounded-xl bg-accent/25 shadow-sm">
                            <h3 className="font-semibold flex items-center mb-2">
                              <Plus className="mr-2 h-5 w-5 text-purple-500 dark:text-purple-400" />
                              Content Growth
                            </h3>
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-sm text-muted-foreground">Bank Size</span>
                              <Badge variant="outline" className={stats.total < 10 ? 'bg-red-100/50 text-red-800 dark:bg-red-900/30 dark:text-red-300' : 'bg-yellow-100/50 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'}>
                                {stats.total < 10 ? 'Very Small' : 'Growing'}
                              </Badge>
                            </div>
                            <p className="text-sm">
                              Your question bank is still growing. Adding more questions will provide better assessment coverage and variety.
                            </p>
              </div>
            )}
                      </>
                    ) : (
                      <div className="text-center py-8 bg-accent/30 rounded-xl">
                        <div className="inline-flex p-3 rounded-full shadow-sm mb-3 bg-background">
                          <FileText className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <h3 className="text-lg font-medium mb-1">No Questions Yet</h3>
                        <p className="text-muted-foreground mb-4">Add some questions to see insights and recommendations</p>
                        <Button size="sm" onClick={handleCreateQuestion}>
                          <Plus className="h-4 w-4 mr-1" />
                          Create Question
            </Button>
              </div>
            )}
          </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>Are you sure you want to delete this question? This action cannot be undone.</p>
          </div>
          <div className="flex justify-end gap-3">
            <Button 
              variant="outline" 
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive"
              onClick={() => questionToDelete && handleDeleteQuestion(questionToDelete)}
            >
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
} 