"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { Plus, Search, Loader2, Folder, FolderOpen, FileText, Code, Pencil, Trash2, Upload, Download, MoreVertical, Copy, ChevronLeft, ChevronRight, Eye, Filter, SortAsc, SortDesc, CheckCircle, ListChecks, X, Grid, List, Table as TableIcon, Folder as FolderIcon, ChevronDown } from "lucide-react";
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
import {
  Settings,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import axios from "axios";
import { useRouter } from 'next/navigation';
import { Switch } from '@/components/ui/switch';
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import type { Question as QuestionType } from '@/types';
import { Folder as FolderType } from '@/types';
import { QuestionRow } from "./QuestionRow";
import { columns } from "./columns";
import { useUserVerified } from "@/hooks/use-user-verified";
import { useCallback } from "react";

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
}

interface Question {
  id: string;
  name: string;
  questionText: string;
  type: 'MCQ' | 'CODING';
  status: 'DRAFT' | 'PUBLISHED';
  folderId?: string;
  folder?: {
    id: string;
    name: string;
  };
  updatedAt?: Date;
  version: number;
  mCQQuestion?: MCQQuestion;
  codingQuestion?: CodingQuestion;
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
  showHidden: boolean;
  includeSubcategories: boolean;
}

const QUESTIONS_PER_PAGE = 10;

// Add the formatDate function
const formatDate = (date: Date | string) => {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  });
};

export default function AdminQuestionsPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [questions, setQuestions] = useState<QuestionType[]>([]);
  const [filteredQuestions, setFilteredQuestions] = useState<QuestionType[]>([]);
  const [folders, setFolders] = useState<FolderType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    category: "all",
    subcategory: "all",
    type: "all",
    status: "all",
    showHidden: false,
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
  const [showHidden, setShowHidden] = useState(false);
  const [activeTab, setActiveTab] = useState("questions");
  const [bulkSelected, setBulkSelected] = useState<string[]>([]);
  const [editingFolderId, setEditingFolderId] = useState<string | null>(null);
  const [editingSubfolderId, setEditingSubfolderId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortField, setSortField] = useState<keyof QuestionType>('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [previewQuestion, setPreviewQuestion] = useState<QuestionType | null>(null);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([]);
  const [isBulkActionModalOpen, setIsBulkActionModalOpen] = useState(false);
  const [bulkAction, setBulkAction] = useState<'delete' | 'changeStatus' | 'moveToFolder' | null>(null);
  const [bulkStatus, setBulkStatus] = useState<'DRAFT' | 'READY'>('DRAFT');
  const [bulkFolderId, setBulkFolderId] = useState<string>('');
  const [stats, setStats] = useState({
    total: 0,
    ready: 0,
    draft: 0,
    multipleChoice: 0,
    coding: 0,
    byFolder: {} as Record<string, number>,
  });
  const [pendingFilters, setPendingFilters] = useState<FilterState>({
    search: "",
    category: "all",
    subcategory: "all",
    type: "all",
    status: "all",
    showHidden: false,
    includeSubcategories: false
  });
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [isCodingFormModalOpen, setIsCodingFormModalOpen] = useState(false);

  useEffect(() => {
    fetchQuestions(filters);
    fetchFolders();
  }, [filters]);

  const fetchQuestions = async (currentFilters?: FilterState) => {
    try {
      setIsLoading(true);
      // Build query parameters based on filters
      const queryParams = new URLSearchParams();
      if (currentFilters?.search) queryParams.append('search', currentFilters.search);
      if (currentFilters?.category !== 'all') {
        queryParams.append('category', currentFilters?.category || '');
      }
      if (currentFilters?.subcategory !== 'all') {
        queryParams.append('subcategory', currentFilters?.subcategory || '');
      }
      if (currentFilters?.type !== 'all') queryParams.append('type', currentFilters?.type || '');
      if (currentFilters?.status !== 'all') queryParams.append('status', currentFilters?.status || '');
      if (currentFilters?.showHidden) queryParams.append('showHidden', 'true');
      queryParams.append('includeSubcategories', currentFilters?.includeSubcategories ? 'true' : 'false');

      const response = await axios.get(`/api/questions?${queryParams.toString()}`);
      const questions = response.data as QuestionType[];
      setQuestions(questions);
      
      // Update stats
      const newStats = {
        total: questions.length,
        ready: questions.filter((q) => q.status === 'READY').length,
        draft: questions.filter((q) => q.status === 'DRAFT').length,
        multipleChoice: questions.filter((q) => q.type === 'MCQ').length,
        coding: questions.filter((q) => q.type === 'CODING').length,
        byFolder: questions.reduce((acc: Record<string, number>, q) => {
          const folderName = q.folder?.name || 'Uncategorized';
          acc[folderName] = (acc[folderName] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
      };
      setStats(newStats);
      
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
      console.log("handleFormSubmit called with data:", data);
      
      // Check if we're editing an existing question
      const isEditing = !!data.id;
      
      // Transform the data based on question type
      const transformedData = {
        id: data.id, // Include the ID for existing questions
        name: data.name,
        type: data.type,
        status: data.status,
        version: data.version,
        folderId: data.folderId,
        difficulty: data.difficulty,
        defaultMark: data.defaultMark,
        questionText: data.questionText,
        mCQQuestion: data.type === 'MCQ' ? {
          questionText: data.questionText,
          options: data.options?.map((opt: any) => ({
            id: opt.id, // Include ID for existing options
            text: opt.text,
            grade: opt.grade,
            feedback: opt.feedback || ""
          })),
          isMultiple: data.isMultiple || false,
          shuffleChoice: data.shuffleChoice || false,
          generalFeedback: data.generalFeedback || "",
          choiceNumbering: data.choiceNumbering || "abc",
          solution: data.solution || "",
          hints: data.hints || []
        } : undefined,
        codingQuestion: data.type === 'CODING' ? {
          questionText: data.questionText,
          languageOptions: data.languageOptions?.map((lang: any) => ({
            id: lang.id, // Include ID for existing language options
            language: lang.language,
            solution: lang.solution || "",
            preloadCode: lang.preloadCode || ""
          })),
          testCases: data.testCases?.map((tc: any) => ({
            id: tc.id, // Include ID for existing test cases
            input: tc.input || "",
            output: tc.output || "",
            type: tc.isHidden ? "hidden" : "sample",
            gradePercentage: tc.gradePercentage || 0,
            showOnFailure: tc.showOnFailure || false
          })),
          allOrNothingGrading: data.allOrNothingGrading || false,
          defaultLanguage: data.defaultLanguage || ""
        } : undefined
      };

      // Only make the API call if we have all the required data
      if (data.type === 'MCQ' && (!data.options || data.options.length === 0)) {
        console.log("Skipping API call - MCQ question has no options");
        return;
      }

      if (data.type === 'CODING' && (!data.languageOptions || data.languageOptions.length === 0)) {
        console.log("Skipping API call - Coding question has no language options");
        return;
      }

      console.log("Making API call with transformed data:", JSON.stringify(transformedData, null, 2));

      let response;
      
      if (isEditing) {
        // Update existing question
        console.log(`Updating existing question with ID: ${data.id}`);
        const endpoint = data.type === "MCQ" 
          ? `/api/questions/mcq/${data.id}`
          : data.type === "CODING"
          ? `/api/questions/coding/${data.id}`
          : `/api/questions/${data.id}`;
          
        response = await axios.put(endpoint, transformedData);
      } else {
        // Create new question
        const endpoint = data.type === "MCQ" 
          ? "/api/questions/mcq"
          : data.type === "CODING"
          ? "/api/questions/coding"
          : "/api/questions";
          
        response = await axios.post(endpoint, transformedData);
      }
      
      console.log("API response:", response.data);

      toast({
        title: "Success",
        description: isEditing ? "Question updated successfully" : "Question created successfully",
      });

      // Fetch the latest questions with current filters
      await fetchQuestions(filters);
      
      // Close the modal
      setIsFormModalOpen(false);
      setIsCodingFormModalOpen(false);
      
      // Reset editing state
      setEditingQuestion(undefined);
    } catch (error: any) {
      console.error("Error in handleFormSubmit:", error);
      const errorMessage = error.response?.data?.error || error.message || "Failed to create question";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      // Don't close the modal or reset state on error
    }
  };

  const handleEditQuestion = (question: QuestionType) => {
    console.log('Editing question:', question);
    
    setEditingQuestion({
      id: question.id,
      name: question.name,
      type: question.type,
      status: question.status || 'DRAFT',
      folderId: question.folderId || '',
      version: question.version || 1,
      questionText: question.codingQuestion?.questionText || question.mCQQuestion?.questionText || '',
      difficulty: (question.codingQuestion?.difficulty || question.mCQQuestion?.difficulty || 'MEDIUM') as 'EASY' | 'MEDIUM' | 'HARD',
      defaultMark: question.codingQuestion?.defaultMark || question.mCQQuestion?.defaultMark || 1,
      isMultiple: question.mCQQuestion?.isMultiple || false,
      shuffleChoice: question.mCQQuestion?.shuffleChoice || false,
      generalFeedback: question.mCQQuestion?.generalFeedback || '',
      choiceNumbering: question.mCQQuestion?.choiceNumbering || 'abc',
      options: question.mCQQuestion?.options?.map(opt => ({
        id: opt.id,
        text: opt.text,
        grade: opt.grade || 0,
        feedback: opt.feedback || ''
      })) || [],
      languageOptions: question.codingQuestion?.languageOptions?.map(lang => ({
        id: lang.id || `lang-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        language: lang.language,
        solution: lang.solution || "",
        preloadCode: lang.preloadCode || ""
      })) || [],
      testCases: question.codingQuestion?.testCases?.map(tc => ({
        id: tc.id || `tc-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        input: tc.input || "",
        output: tc.output || "",
        isHidden: tc.isHidden || false,
        type: tc.isHidden ? "hidden" : "sample",
        gradePercentage: 0,
        showOnFailure: tc.showOnFailure || false
      })) || [],
      allOrNothingGrading: question.codingQuestion?.isAllOrNothing || false,
      defaultLanguage: question.codingQuestion?.defaultLanguage || ""
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
    
    setFilters(pendingFilters);
    fetchQuestions(pendingFilters);
  };

  const clearFilters = () => {
    const defaultFilters = {
      search: "",
      category: "all",
      subcategory: "all",
      type: "all",
      status: "all",
      showHidden: false,
      includeSubcategories: false
    };
    setFilters(defaultFilters);
    setPendingFilters(defaultFilters);
    setActiveFilters([]);
    fetchQuestions(defaultFilters);
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

  // Remove the duplicate filteredQuestions declaration and use the state variable
  useEffect(() => {
    const filtered = questions.filter((question) => {
      // Search filter
      const matchesSearch = filters.search === "" || 
        question.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        question.mCQQuestion?.questionText?.toLowerCase().includes(filters.search.toLowerCase()) || 
        question.codingQuestion?.questionText?.toLowerCase().includes(filters.search.toLowerCase());
        
      // Category and Subcategory filter
      let matchesCategory = true;
      if (filters.subcategory !== "all") {
        matchesCategory = question.folderId === filters.subcategory;
      } else if (filters.category !== "all") {
        if (filters.includeSubcategories) {
          const subfolderIds = folders
            .find(f => f.id === filters.category)
            ?.subfolders?.map(s => s.id) || [];
          matchesCategory = question.folderId === filters.category || 
                           subfolderIds.includes(question.folderId);
        } else {
          matchesCategory = question.folderId === filters.category;
        }
      }

      // Type filter
      const matchesType = filters.type === "all" || question.type === filters.type;
      
      // Status filter
      const matchesStatus = filters.status === "all" || question.status === filters.status;

      return matchesSearch && matchesCategory && matchesType && matchesStatus;
    });

    setFilteredQuestions(filtered);
  }, [questions, filters, folders]);

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
    setEditingQuestion(prepareQuestionForEditing(question));
    if (question.type === 'MCQ') {
      setIsMCQModalOpen(true);
    } else if (question.type === 'CODING') {
      setIsCodingModalOpen(true);
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
                  onValueChange={(value) => setPendingFilters(prev => ({ ...prev, status: value }))}
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
                    id="showHidden"
                    checked={pendingFilters.showHidden}
                    onCheckedChange={(checked) => setPendingFilters(prev => ({ ...prev, showHidden: checked }))}
                  />
                  <Label htmlFor="showHidden">Show hidden questions</Label>
                </div>

                <div className="flex items-center gap-2">
                  <Switch
                    id="includeSubcategories"
                    checked={pendingFilters.includeSubcategories}
                    onCheckedChange={(checked) => setPendingFilters(prev => ({ ...prev, includeSubcategories: checked }))}
                  />
                  <Label htmlFor="includeSubcategories">Include subcategories</Label>
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
              <Table>
                <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">Select</TableHead>
                    <TableHead>Question</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Subcategory</TableHead>
                  <TableHead>Created At</TableHead>
                  <TableHead>Updated At</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                {filteredQuestions.map((question) => (
                  <TableRow key={question.id}>
                    <TableCell className="flex items-center gap-2">
                          <Checkbox
                        id={`question-${question.id}`}
                            checked={selectedQuestions.includes(question.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            handleBulkSelect(question.id);
                          } else {
                            handleBulkSelect(question.id);
                          }
                        }}
                      />
                    </TableCell>
                    <TableCell>{question.name}</TableCell>
                    <TableCell>{question.type}</TableCell>
                    <TableCell>{question.status}</TableCell>
                    <TableCell>{question.folder?.name}</TableCell>
                    <TableCell>{question.subfolder?.name}</TableCell>
                    <TableCell>{formatDate(question.createdAt)}</TableCell>
                    <TableCell>{formatDate(question.updatedAt)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditQuestion(question);
                          }}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteQuestion(question.id);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* Pagination Controls */}
            <div className="flex justify-between items-center pt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <span>Page {currentPage} of {totalPages}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="folders">
          {/* Folders Section */}
          <div className="bg-card rounded-lg shadow p-6">
            <div className="space-y-4">
              <Button
                variant="outline"
                onClick={() => setIsCreateFolderModalOpen(true)}
              >
                <Plus className="mr-2 h-4 w-4" />
                  Create Folder
                </Button>
              </div>
            <Table>
              <TableBody>
                {folders.map((folder) => (
                  <TableRow key={folder.id}>
                    <TableCell>{folder.name}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditFolder(folder);
                          }}
                        >
                          <Pencil className="h-4 w-4" />
            </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteFolder(folder.id);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
            </Button>
            </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
                </div>
        </TabsContent>
      </Tabs>
    </div>
  );
} 