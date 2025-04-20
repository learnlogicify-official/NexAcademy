"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { Plus, Search, Loader2, Folder, FolderOpen, FileText, Code, Pencil, Trash2, Upload, Download, MoreVertical, Copy, ChevronLeft, ChevronRight, Eye, Filter, SortAsc, SortDesc, CheckCircle, ListChecks, X, Grid, List, Table as TableIcon, Folder as FolderIcon, ChevronDown } from "lucide-react";
import { QuestionFormModal } from "@/components/admin/question-form-modal";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
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
import { Folder as FolderType } from '@/types';

const questionFormSchema = z.object({
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

interface Question {
  id: string;
  name: string;
  type: 'MCQ' | 'CODING';
  folderId: string;
  hidden: boolean;
  marks: number;
  status: 'DRAFT' | 'READY';
  createdAt: string;
  updatedAt: string;
  folder?: {
    id: string;
    name: string;
    parentId: string | null;
    createdAt: string;
    updatedAt: string;
  };
  content?: string;
  mcqQuestion?: {
    content: string;
    questionText: string;
    options: Array<{
      text: string;
      grade: number;
      feedback: string;
    }>;
    correctAnswer: string;
    singleAnswer: boolean;
    shuffleAnswers: boolean;
    difficulty: string;
    isMultiple: boolean;
    shuffleChoice: boolean;
    defaultMark: number;
    generalFeedback: string;
    choiceNumbering: string;
  };
  codingQuestion?: {
    content: string;
    questionText: string;
    languageOptions: Array<{
      language: string;
      solution: string;
    }>;
    testCases: Array<{
      input: string;
      output: string;
      isHidden: boolean;
    }>;
  };
}

interface Folder {
  id: string;
  name: string;
  subfolders: {
    id: string;
    name: string;
  }[];
}

interface QuestionSubmitData extends Partial<Question> {
  name?: string;
  content: string;
  type: 'MCQ' | 'CODING';
  folderId: string;
  options?: string[];
  correctAnswer?: string;
  singleAnswer?: boolean;
  shuffleAnswers?: boolean;
  status?: 'DRAFT' | 'READY';
  marks?: number;
  hidden?: boolean;
  difficulty?: string;
  languageOptions?: any[];
  testCases?: any[];
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

export default function AdminQuestionsPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [questions, setQuestions] = useState<Question[]>([]);
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
  const [editingQuestion, setEditingQuestion] = useState<Question | undefined>();
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
  const [sortField, setSortField] = useState<keyof Question>('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [previewQuestion, setPreviewQuestion] = useState<Question | null>(null);
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
      const questions = response.data as Question[];
      
      // Update questions state with all required data
      setQuestions(questions.map(q => ({
        ...q,
        content: q.type === 'MCQ' 
          ? q.mcqQuestion?.questionText || q.mcqQuestion?.content || ''
          : q.codingQuestion?.questionText || q.codingQuestion?.content || '',
        status: q.status || 'DRAFT',
        folder: q.folder || undefined,
        mcqQuestion: q.type === 'MCQ' ? {
          ...q.mcqQuestion,
          questionText: q.mcqQuestion?.questionText || q.mcqQuestion?.content || '',
          options: q.mcqQuestion?.options?.map(opt => ({
            text: opt.text || '',
            grade: opt.grade || 0,
            feedback: opt.feedback || ''
          })) || [],
          difficulty: q.mcqQuestion?.difficulty || 'MEDIUM',
          defaultMark: q.mcqQuestion?.defaultMark || 1,
          isMultiple: q.mcqQuestion?.isMultiple || false,
          shuffleChoice: q.mcqQuestion?.shuffleChoice || false,
          generalFeedback: q.mcqQuestion?.generalFeedback || ''
        } : undefined,
        codingQuestion: q.type === 'CODING' ? {
          ...q.codingQuestion,
          questionText: q.codingQuestion?.questionText || q.codingQuestion?.content || '',
          languageOptions: q.codingQuestion?.languageOptions || [],
          testCases: q.codingQuestion?.testCases || []
        } : undefined
      })));
      
      // Update stats
      const newStats = {
        total: questions.length,
        ready: questions.filter((q: Question) => q.status === 'READY').length,
        draft: questions.filter((q: Question) => q.status === 'DRAFT').length,
        multipleChoice: questions.filter((q: Question) => q.type === 'MCQ').length,
        coding: questions.filter((q: Question) => q.type === 'CODING').length,
        byFolder: questions.reduce((acc: Record<string, number>, q: Question) => {
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
      console.log('Form data received in handleFormSubmit:', data);
      
      // We don't need to do anything special here anymore as the form modal 
      // component is now handling both create and update operations directly

      // Just pass the result back to refresh the UI
      toast({
        title: "Success",
        description: data.id ? "Question updated successfully" : "Question created successfully",
      });
      setIsFormModalOpen(false);
      fetchQuestions(filters);
    } catch (error) {
      console.error('Error with question:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to process question",
        variant: "destructive",
      });
    }
  };

  const handleEditQuestion = (question: Question) => {
    console.log('Editing question:', question);
    
    // Log the full question object to help with debugging
    console.log('Full question object:', JSON.stringify(question, null, 2));
    
    // Make sure folderId is explicitly set and logged
    const questionFolderId = question.folderId;
    console.log('Question folderId:', questionFolderId);
    
    // Deep clone the question to avoid modification issues
    let formattedQuestion: any = { ...question };
    
    // Set up basic question data with explicit folderId set
    formattedQuestion = {
      ...formattedQuestion,
      id: question.id,
      name: question.name || '',
      type: question.type,
      folderId: questionFolderId,  // Explicitly set folderId
      status: question.status || 'DRAFT',
      difficulty: question.difficulty || 'MEDIUM',
      // The questionText field is expected by the form
      questionText: question.type === 'MCQ' 
        ? question.mcqQuestion?.questionText || question.mcqQuestion?.content || ''
        : question.codingQuestion?.questionText || question.codingQuestion?.content || '',
    };
    
    // Handle MCQ question specific data
    if (question.type === 'MCQ' && question.mcqQuestion) {
      const mcqData = question.mcqQuestion;
      
      // Get options in the correct format
      let optionsArray = [];
      if (Array.isArray(mcqData.options)) {
        // If options is an array of objects with text and grade
        if (typeof mcqData.options[0] === 'object' && mcqData.options[0].text) {
          optionsArray = mcqData.options;
        } 
        // If options is an array of strings
        else if (typeof mcqData.options[0] === 'string') {
          optionsArray = mcqData.options.map((text: string) => ({ 
            text, 
            grade: 0, 
            feedback: '' 
          }));
        }
      }
      
      formattedQuestion = {
        ...formattedQuestion,
        // Add MCQ specific fields
        isMultiple: mcqData.isMultiple !== undefined ? mcqData.isMultiple : false,
        shuffleChoice: mcqData.shuffleChoice !== undefined ? mcqData.shuffleChoice : false,
        defaultMark: mcqData.defaultMark || 1,
        generalFeedback: mcqData.generalFeedback || '',
        choiceNumbering: mcqData.choiceNumbering || 'abc',
        // Make sure the mcqQuestion property exists with all required fields
        mcqQuestion: {
          ...mcqData,
          questionText: mcqData.questionText || mcqData.content || '',
          options: optionsArray,
        },
      };
    }
    
    // Handle CODING question specific data
    if (question.type === 'CODING' && question.codingQuestion) {
      const codingData = question.codingQuestion;
      
      formattedQuestion = {
        ...formattedQuestion,
        // Make sure the codingQuestion property exists with all required fields
        codingQuestion: {
          ...codingData,
          questionText: codingData.questionText || codingData.content || '',
        },
        // Extract languageOptions and testCases for direct access
        languageOptions: codingData.languageOptions || [],
        testCases: codingData.testCases || [],
      };
    }
    
    console.log('Formatted question for form:', formattedQuestion);
    
    // Set the editingQuestion state and open the modal
    setEditingQuestion(formattedQuestion);
    setIsFormModalOpen(true);
  };

  const filteredQuestions = questions.filter((question) => {
    // Search filter
    const matchesSearch = filters.search === "" || 
      question?.content?.toLowerCase()?.includes(filters.search.toLowerCase()) || 
      question?.folder?.name?.toLowerCase()?.includes(filters.search.toLowerCase());
      
    // Category and Subcategory filter
    let matchesCategory = true;
    if (filters.subcategory !== "all") {
      // If subcategory is selected, check folderId since that's where the subcategory ID is stored
      matchesCategory = question?.folderId === filters.subcategory;
    } else if (filters.category !== "all") {
      // If only category is selected, check folderId
      if (filters.includeSubcategories) {
        // Get all subfolder IDs for the selected category
        const subfolderIds = folders
          .find(f => f.id === filters.category)
          ?.subfolders?.map(s => s.id) || [];
        
        // Check if the question belongs to either the category or any of its subcategories
        matchesCategory = question?.folderId === filters.category || 
                         subfolderIds.includes(question?.folderId);
      } else {
        // If includeSubcategories is false, only show questions directly in the category
        matchesCategory = question?.folderId === filters.category;
      }
    }

    // Type filter
    const matchesType = filters.type === "all" || question?.type === filters.type;
    
    // Status filter
    const matchesStatus = filters.status === "all" || question?.status === filters.status;
    
    // Visibility filter
    const matchesVisibility = filters.showHidden || !question?.hidden;

    console.log('Filtering question:', {
      id: question.id,
      folderId: question.folderId,
      matchesSearch,
      matchesCategory,
      matchesType,
      matchesStatus,
      matchesVisibility,
      filters: {
        category: filters.category,
        subcategory: filters.subcategory,
        type: filters.type,
        status: filters.status,
        showHidden: filters.showHidden,
        includeSubcategories: filters.includeSubcategories
      }
    });

    return matchesSearch && matchesCategory && matchesType && matchesStatus && matchesVisibility;
  });

  // Calculate total pages whenever filtered questions change
  useEffect(() => {
    const newTotalPages = Math.ceil(filteredQuestions.length / QUESTIONS_PER_PAGE);
    setTotalPages(newTotalPages);
    
    // Only reset to page 1 if the current page is greater than the new total pages
    if (currentPage > newTotalPages && newTotalPages > 0) {
      setCurrentPage(1);
    }
  }, [filteredQuestions]);

  const paginatedQuestions = filteredQuestions.slice(
    (currentPage - 1) * QUESTIONS_PER_PAGE,
    currentPage * QUESTIONS_PER_PAGE
  );

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  // Add sorting function
  const sortQuestions = (questions: Question[]) => {
    return [...questions].sort((a, b) => {
      const aValue = a.content || '';
      const bValue = b.content || '';
      if (sortDirection === 'asc') {
        return aValue.localeCompare(bValue);
      } else {
        return bValue.localeCompare(aValue);
      }
    });
  };

  // Add preview handler
  const handlePreview = (question: Question) => {
    setPreviewQuestion({
      ...question,
      content: question.type === 'MCQ' ? question.mcqQuestion?.content : question.codingQuestion?.content,
      options: question.mcqQuestion?.options,
      correctAnswer: question.mcqQuestion?.correctAnswer
    });
    setIsPreviewModalOpen(true);
  };

  const handleBulkSelect = (questionId: string) => {
    setSelectedQuestions(prev => 
      prev.includes(questionId) 
        ? prev.filter(id => id !== questionId)
        : [...prev, questionId]
    );
  };

  const handleBulkAction = async () => {
    if (!bulkAction || selectedQuestions.length === 0) return;

    try {
      if (bulkAction === 'delete') {
        await Promise.all(selectedQuestions.map(id => handleDeleteQuestion(id)));
      } else if (bulkAction === 'changeStatus') {
        await Promise.all(selectedQuestions.map(id => 
          axios.patch(`/api/questions/${id}`, { status: bulkStatus })
        ));
      } else if (bulkAction === 'moveToFolder') {
        await Promise.all(selectedQuestions.map(id => 
          axios.patch(`/api/questions/${id}`, { folderId: bulkFolderId })
        ));
      }

      toast({
        title: "Success",
        description: "Bulk action completed successfully",
      });
      setSelectedQuestions([]);
      setIsBulkActionModalOpen(false);
      fetchQuestions(filters);
    } catch (error) {
      console.error('Error performing bulk action:', error);
      toast({
        title: "Error",
        description: "Failed to perform bulk action",
        variant: "destructive",
      });
    }
  };

  // Add handler for filter changes
  const handleFilterChange = (key: keyof FilterState, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    updateActiveFilters({ ...filters, [key]: value });
  };

  // Update active filters
  const updateActiveFilters = (currentFilters: FilterState) => {
    const active: string[] = [];
    if (currentFilters.search) active.push(`Search: ${currentFilters.search}`);
    if (currentFilters.category !== 'all') {
      const folder = folders.find(f => f.id === currentFilters.category);
      if (folder) active.push(`Category: ${folder.name}`);
    }
    if (currentFilters.subcategory !== 'all') {
      const subfolder = folders
        .find(f => f.id === currentFilters.category)
        ?.subfolders.find(s => s.id === currentFilters.subcategory);
      if (subfolder) active.push(`Subcategory: ${subfolder.name}`);
    }
    if (currentFilters.type !== 'all') active.push(`Type: ${currentFilters.type}`);
    if (currentFilters.status !== 'all') active.push(`Status: ${currentFilters.status}`);
    if (currentFilters.showHidden) active.push('Show Hidden');
    setActiveFilters(active);
  };

  // Add export function
  const handleExport = async () => {
    try {
      const data = filteredQuestions.map(q => ({
        question: q.content,
        type: q.type,
        status: q.status,
        category: q.folder?.name,
        subcategory: q.subfolder?.name,
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

  // Update the category/subcategory selection handler
  const handleCategoryChange = (value: string) => {
    // Parse the selected value to determine if it's a category or subcategory
    if (value.startsWith('sub_')) {
      // It's a subcategory selection
      const [_, categoryId, subcategoryId] = value.split('_');
      console.log('Selected subcategory:', {value, categoryId, subcategoryId});
      
      setPendingFilters(prev => ({
        ...prev,
        category: categoryId,
        subcategory: subcategoryId
      }));
    } else {
      // It's a category selection or "all"
      console.log('Selected category:', value);
      setPendingFilters(prev => ({
        ...prev,
        category: value,
        subcategory: 'all'
      }));
    }
  };

  // Update the filter application
  const applyFilters = () => {
    console.log('Applying filters:', {
      pendingFilters,
      currentFilters: filters,
      folders: folders.map(f => ({
        id: f.id,
        name: f.name,
        subfolders: f.subfolders?.map(s => ({id: s.id, name: s.name}))
      }))
    });
    
    // Check if subcategory exists in the selected category
    if (pendingFilters.subcategory !== 'all' && pendingFilters.category !== 'all') {
      const selectedCategory = folders.find(f => f.id === pendingFilters.category);
      const subcategoryExists = selectedCategory?.subfolders?.some(s => s.id === pendingFilters.subcategory);
      
      console.log('Validating subcategory selection:', {
        categoryId: pendingFilters.category,
        subcategoryId: pendingFilters.subcategory,
        categoryFound: !!selectedCategory,
        subcategoryExists,
        subfolders: selectedCategory?.subfolders
      });
      
      if (!subcategoryExists) {
        console.warn('Selected subcategory not found in the category, resetting to "all"');
        setPendingFilters(prev => ({...prev, subcategory: 'all'}));
        return;
      }
    }
    
    setFilters(pendingFilters);
    fetchQuestions(pendingFilters);
  };

  // Update the clear filters function
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
    // Fetch all questions when clearing filters
    fetchQuestions(defaultFilters);
  };

  useEffect(() => {
    console.log('Filters changed:', {
      filters,
      questions: questions.map((q: Question) => ({
        id: q.id,
        folderId: q.folderId,
        subfolderId: q.subfolderId
      }))
    });
  }, [filters, questions]);

  const toggleFolder = (folderId: string) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(folderId)) {
      newExpanded.delete(folderId);
    } else {
      newExpanded.add(folderId);
    }
    setExpandedFolders(newExpanded);
  };

  const renderFolder = (folder: FolderType, level: number = 0) => {
    const isExpanded = expandedFolders.has(folder.id);
    const isSelected = selectedFolder === folder.id;
    
    return (
      <div key={folder.id} className="w-full">
        <div 
          className={`flex items-center gap-2 p-2 hover:bg-accent cursor-pointer ${isSelected ? 'bg-accent' : ''}`}
          style={{ paddingLeft: `${level * 20 + 8}px` }}
          onClick={() => setSelectedFolder(folder.id)}
        >
          <button 
            onClick={(e) => {
              e.stopPropagation();
              toggleFolder(folder.id);
            }}
            className="p-1 hover:bg-accent rounded"
          >
            {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </button>
          <FolderIcon className="h-4 w-4" />
          <span className="text-sm">{folder.name}</span>
        </div>
        {isExpanded && folder.subfolders.map(subfolder => renderFolder(subfolder, level + 1))}
      </div>
    );
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
          <Dialog open={isFormModalOpen} onOpenChange={(open) => {
            setIsFormModalOpen(open);
            // Clear editing question when dialog is closed or opened
            if (!open) {
              setEditingQuestion(undefined);
            }
          }}>
            <DialogTrigger asChild>
              <Button onClick={() => setEditingQuestion(undefined)}>
                <Plus className="mr-2 h-4 w-4" />
                Create Question
              </Button>
            </DialogTrigger>
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
                onAddFolder={handleCreateFolder}
                onAddSubfolder={handleCreateSubfolder}
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
                    <SelectItem value="MULTIPLE_CHOICE">Multiple Choice</SelectItem>
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
                        ` > ${folders.find(f => f.id === filters.category)?.subfolders.find(s => s.id === filters.subcategory)?.name || 'subcategory'}`}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Questions Display */}
          {viewMode === 'table' && (
            <div className="bg-card rounded-lg shadow text-card-foreground">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-muted/50">
                    <TableHead className="w-[50px]">
                      <Checkbox
                        checked={selectedQuestions.length === paginatedQuestions.length}
                        onCheckedChange={(checked) => {
                          setSelectedQuestions(checked ? paginatedQuestions.map(q => q.id) : []);
                        }}
                      />
                    </TableHead>
                    <TableHead>Question</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Version</TableHead>
                    <TableHead>Last Modified</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortQuestions(paginatedQuestions).map((question) => (
                    <TableRow key={question.id} className="hover:bg-muted/50">
                      <TableCell>
                        <Checkbox
                          checked={selectedQuestions.includes(question.id)}
                          onCheckedChange={() => handleBulkSelect(question.id)}
                        />
                      </TableCell>
                      <TableCell>
                        <div dangerouslySetInnerHTML={{ __html: question.content || '' }} />
                      </TableCell>
                      <TableCell>
                        <Badge variant={question.type === 'MULTIPLE_CHOICE' ? 'default' : 'secondary'}>
                          {question.type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={question.status === 'READY' ? 'default' : 'secondary'}>
                          {question.status || 'DRAFT'}
                        </Badge>
                      </TableCell>
                      <TableCell>v1</TableCell>
                      <TableCell>{new Date(question.updatedAt).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handlePreview(question)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEditQuestion(question)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteQuestion(question.id)}
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
          )}

          {viewMode === 'list' && (
            <div className="bg-card rounded-lg shadow text-card-foreground">
              <div className="p-4 space-y-4">
                {sortQuestions(paginatedQuestions).map((question) => (
                  <div key={question.id} className="border rounded-lg p-4 hover:bg-muted/50">
                    <div className="flex justify-between items-start">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Checkbox
                            checked={selectedQuestions.includes(question.id)}
                            onCheckedChange={() => handleBulkSelect(question.id)}
                          />
                          <div dangerouslySetInnerHTML={{ __html: question.content || '' }} />
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={question.type === 'MULTIPLE_CHOICE' ? 'default' : 'secondary'}>
                            {question.type}
                          </Badge>
                          <Badge variant={question.status === 'READY' ? 'default' : 'secondary'}>
                            {question.status || 'DRAFT'}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handlePreview(question)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditQuestion(question)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteQuestion(question.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {viewMode === 'grid' && (
            <div className="bg-card rounded-lg shadow text-card-foreground">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
                {sortQuestions(paginatedQuestions).map((question) => (
                  <div key={question.id} className="border rounded-lg p-4 hover:bg-muted/50">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Checkbox
                          checked={selectedQuestions.includes(question.id)}
                          onCheckedChange={() => handleBulkSelect(question.id)}
                        />
                        <div className="line-clamp-2" dangerouslySetInnerHTML={{ __html: question.content || '' }} />
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={question.type === 'MULTIPLE_CHOICE' ? 'default' : 'secondary'}>
                          {question.type}
                        </Badge>
                        <Badge variant={question.status === 'READY' ? 'default' : 'secondary'}>
                          {question.status || 'DRAFT'}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handlePreview(question)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditQuestion(question)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteQuestion(question.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Pagination */}
          <div className="p-4 border-t border-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm text-gray-700">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <div className="text-sm text-muted-foreground">
              Showing {paginatedQuestions.length} of {filteredQuestions.length} questions
            </div>
          </div>
        </TabsContent>

        <TabsContent value="folders">
          <div className="bg-card rounded-lg shadow p-6 mb-6 text-card-foreground">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Folder Management</h2>
              <div className="flex gap-2">
                <Button onClick={() => setIsCreateFolderModalOpen(true)}>
                  <FolderIcon className="mr-2 h-4 w-4" />
                  Create Folder
                </Button>
                <Button onClick={() => setIsCreateSubfolderModalOpen(true)}>
                  <FolderOpen className="mr-2 h-4 w-4" />
                  Create Subfolder
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              {folders.map((folder) => renderFolder(folder))}
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Modals */}
      {/* Remove the duplicate QuestionFormModal here */}

      {/* Create Folder Modal */}
      <Dialog open={isCreateFolderModalOpen} onOpenChange={setIsCreateFolderModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Folder</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="folderName">Folder Name</Label>
              <Input
                id="folderName"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                placeholder="Enter folder name"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateFolderModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateFolder}>
              Create Folder
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Subfolder Modal */}
      <Dialog open={isCreateSubfolderModalOpen} onOpenChange={setIsCreateSubfolderModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Subfolder</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Parent Folder</Label>
              <Select
                value={selectedFolderForSubfolder || ''}
                onValueChange={setSelectedFolderForSubfolder}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select parent folder" />
                </SelectTrigger>
                <SelectContent>
                  {folders.map((folder) => (
                    <SelectItem key={folder.id} value={folder.id}>
                      {folder.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="subfolderName">Subfolder Name</Label>
              <Input
                id="subfolderName"
                value={newSubfolderName}
                onChange={(e) => setNewSubfolderName(e.target.value)}
                placeholder="Enter subfolder name"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateSubfolderModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateSubfolder} disabled={!selectedFolderForSubfolder || !newSubfolderName.trim()}>
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
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="editFolderName">Folder Name</Label>
              <Input
                id="editFolderName"
                value={updatedFolderName}
                onChange={(e) => setUpdatedFolderName(e.target.value)}
                placeholder="Enter folder name"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditFolderModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateFolder}>
              Update Folder
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Question Preview Modal */}
      <Dialog open={isPreviewModalOpen} onOpenChange={setIsPreviewModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Question Preview</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="prose max-w-none">
              <div dangerouslySetInnerHTML={{ __html: previewQuestion?.content || '' }} />
            </div>
            {previewQuestion?.type === 'MCQ' && previewQuestion.options && (
              <div className="space-y-2">
                <h4 className="font-medium">Options:</h4>
                <div className="grid gap-2">
                  {previewQuestion.options.map((option, index) => (
                    <div
                      key={index}
                      className={`p-2 rounded ${
                        option === previewQuestion.correctAnswer
                          ? 'bg-green-100 dark:bg-green-900'
                          : 'bg-gray-100 dark:bg-gray-800'
                      }`}
                    >
                      {option}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Bulk Action Modal */}
      <Dialog open={isBulkActionModalOpen} onOpenChange={setIsBulkActionModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {bulkAction === 'delete' && 'Delete Selected Questions'}
              {bulkAction === 'changeStatus' && 'Change Status'}
              {bulkAction === 'moveToFolder' && 'Move to Folder'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {bulkAction === 'delete' && (
              <p>Are you sure you want to delete {selectedQuestions.length} selected questions?</p>
            )}
            {bulkAction === 'changeStatus' && (
              <div className="space-y-2">
                <Label>New Status</Label>
                <Select
                  value={bulkStatus}
                  onValueChange={(value: 'DRAFT' | 'READY') => setBulkStatus(value)}
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
            )}
            {bulkAction === 'moveToFolder' && (
              <div className="space-y-2">
                <Label>Target Folder</Label>
                <Select
                  value={bulkFolderId}
                  onValueChange={setBulkFolderId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select folder" />
                  </SelectTrigger>
                  <SelectContent>
                    {folders.map((folder) => (
                      <SelectItem key={folder.id} value={folder.id}>
                        {folder.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsBulkActionModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleBulkAction}>
              {bulkAction === 'delete' && 'Delete'}
              {bulkAction === 'changeStatus' && 'Update Status'}
              {bulkAction === 'moveToFolder' && 'Move'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 