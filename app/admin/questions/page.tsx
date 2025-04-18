"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { Plus, Search, Loader2, Folder, FolderOpen, FileText, Code, Pencil, Trash2, Upload, Download, MoreVertical, Copy, ChevronLeft, ChevronRight, Eye, Filter, SortAsc, SortDesc, CheckCircle, ListChecks, X, Grid, List, Table as TableIcon } from "lucide-react";
import QuestionFormModal from "@/components/admin/question-form-modal";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
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
  question: string;
  type: 'MULTIPLE_CHOICE' | 'CODING';
  folderId: string;
  subfolderId?: string;
  options: string[];
  correctAnswer?: string;
  testCases?: any;
  expectedOutput?: string;
  hidden: boolean;
  marks: number;
  singleAnswer: boolean;
  shuffleAnswers: boolean;
  status: 'DRAFT' | 'READY';
  createdAt: string;
  updatedAt: string;
  folder?: {
    name: string;
  };
  subfolder?: {
    name: string;
  };
  preview?: string;
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
  status?: 'DRAFT' | 'READY';
  version?: number;
  marks?: number;
  singleAnswer?: boolean;
  shuffleAnswers?: boolean;
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
  const [folders, setFolders] = useState<Folder[]>([]);
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
  const [editingFolder, setEditingFolder] = useState<Folder | null>(null);
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

  useEffect(() => {
    fetchQuestions(filters);
    fetchFolders();
  }, []);

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

      console.log('Fetching questions with params:', {
        category: currentFilters?.category,
        subcategory: currentFilters?.subcategory,
        includeSubcategories: currentFilters?.includeSubcategories,
        queryParams: Object.fromEntries(queryParams.entries())
      });

      const response = await axios.get(`/api/questions?${queryParams.toString()}`);
      const questions = response.data;
      console.log('Received questions:', {
        count: questions.length,
        sample: questions.slice(0, 2).map((q: Question) => ({
          id: q.id,
          folderId: q.folderId,
          folder: q.folder
        }))
      });
      setQuestions(questions);
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

  const handleEditFolder = async (folder: Folder) => {
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

  const handleFormSubmit = async (data: QuestionSubmitData) => {
    try {
      if (editingQuestion?.id) {
        const { 
          question, 
          type, 
          folderId, 
          subfolderId, 
          options, 
          correctAnswer, 
          testCases, 
          expectedOutput,
          marks,
          singleAnswer,
          shuffleAnswers,
          status,
          version,
          hidden
        } = data;

        // Validate required fields
        if (!folderId) {
          throw new Error('Folder is required');
        }

        const updateData = {
          question,
          type,
          folderId,
          subfolderId,
          options,
          correctAnswer,
          testCases,
          expectedOutput,
          marks,
          singleAnswer,
          shuffleAnswers,
          status: status || 'DRAFT',
          version: version || 1,
          hidden: hidden ?? false
        };

        await axios.patch(`/api/questions/${editingQuestion.id}`, updateData);
      } else {
        // Create new question
        const createData = {
          question: data.question,
          type: data.type,
          folderId: data.folderId,
          subfolderId: data.subfolderId || null,
          options: data.options || [],
          correctAnswer: data.correctAnswer || null,
          testCases: data.testCases || null,
          expectedOutput: data.expectedOutput || null,
          status: data.status || 'DRAFT',
          singleAnswer: data.singleAnswer || false,
          shuffleAnswers: data.shuffleAnswers || false,
          hidden: data.hidden || false,
          marks: data.marks || 1
        };

        console.log('Creating question with data:', createData);
        try {
          const response = await axios.post('/api/questions', createData);
          if (response.status === 200) {
            toast({
              title: "Success",
              description: "Question created successfully",
            });
          }
        } catch (error) {
          console.error('Error creating question:', error);
          toast({
            title: "Error",
            description: error instanceof Error ? error.message : "Failed to create question",
            variant: "destructive",
          });
          throw error; // Re-throw to prevent further execution
        }
      }
      await fetchQuestions();
      setIsFormModalOpen(false);
    } catch (error) {
      console.error('Error saving question:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save question. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleEditQuestion = (question: Question) => {
    setEditingQuestion(question);
    setIsFormModalOpen(true);
  };

  const filteredQuestions = questions.filter((question) => {
    // Search filter
    const matchesSearch = filters.search === "" || 
      question?.question?.toLowerCase()?.includes(filters.search.toLowerCase()) || 
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
      const aValue = a[sortField];
      const bValue = b[sortField];
      
      if (sortDirection === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
  };

  // Add preview handler
  const handlePreview = (question: Question) => {
    setPreviewQuestion(question);
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
    try {
      if (bulkAction === 'delete') {
        await Promise.all(selectedQuestions.map(id => handleDeleteQuestion(id)));
        toast({
          title: "Success",
          description: "Selected questions deleted successfully",
        });
      } else if (bulkAction === 'changeStatus') {
        await Promise.all(selectedQuestions.map(id => 
          axios.patch(`/api/questions/${id}`, { status: bulkStatus })
        ));
        toast({
          title: "Success",
          description: `Selected questions status changed to ${bulkStatus}`,
        });
      } else if (bulkAction === 'moveToFolder') {
        await Promise.all(selectedQuestions.map(id => 
          axios.patch(`/api/questions/${id}`, { folderId: bulkFolderId })
        ));
        toast({
          title: "Success",
          description: "Selected questions moved successfully",
        });
      }
      setSelectedQuestions([]);
      setIsBulkActionModalOpen(false);
      fetchQuestions();
    } catch (error) {
      console.error('Error performing bulk action:', error);
      toast({
        title: "Error",
        description: "Failed to perform bulk action",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (questions.length > 0) {
      const newStats = {
        total: questions.length,
        ready: questions.filter(q => q.status === 'READY').length,
        draft: questions.filter(q => q.status === 'DRAFT').length,
        multipleChoice: questions.filter(q => q.type === 'MULTIPLE_CHOICE').length,
        coding: questions.filter(q => q.type === 'CODING').length,
        byFolder: questions.reduce((acc, q) => {
          const folderName = q.folder?.name || 'Uncategorized';
          acc[folderName] = (acc[folderName] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
      };
      setStats(newStats);
    }
  }, [questions]);

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
        question: q.question,
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
    console.log('Category/Subcategory selection changed:', {
      value,
      currentIncludeSubcategories: pendingFilters.includeSubcategories
    });
    if (!value.startsWith('sub_')) {
      setPendingFilters(prev => ({
        ...prev,
        category: value,
        subcategory: 'all'
      }));
    } else {
      const [_, folderId, subfolderId] = value.split('_');
      setPendingFilters(prev => ({
        ...prev,
        category: folderId,
        subcategory: subfolderId
      }));
    }
  };

  // Update the filter application
  const applyFilters = () => {
    console.log('Applying filters:', {
      pendingFilters,
      currentFilters: filters
    });
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
        </div>
      </div>

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
                    ? folders
                        .find(f => f.id === pendingFilters.category)
                        ?.subfolders.find(s => s.id === pendingFilters.subcategory)
                        ?.name
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
              Showing {filteredQuestions.length} questions
              {filters.category !== 'all' && ` in ${folders.find(f => f.id === filters.category)?.name}`}
              {filters.subcategory !== 'all' && ` > ${folders.find(f => f.id === filters.category)?.subfolders.find(s => s.id === filters.subcategory)?.name}`}
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
                    <div dangerouslySetInnerHTML={{ __html: question.question }} />
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
                      <div dangerouslySetInnerHTML={{ __html: question.question }} />
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
                    <div className="line-clamp-2" dangerouslySetInnerHTML={{ __html: question.question }} />
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

      {/* Modals */}
      <QuestionFormModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setEditingQuestion(undefined);
        }}
        onSubmit={handleFormSubmit}
        initialData={editingQuestion}
        folders={folders}
        subfolders={folders.flatMap(folder => folder.subfolders)}
        onAddFolder={handleCreateFolder}
        onAddSubfolder={handleCreateSubfolder}
      />

      {/* Edit Folder Modal */}
      <Dialog open={isEditFolderModalOpen} onOpenChange={setIsEditFolderModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Folder</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Folder Name</Label>
              <Input
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
            <Button onClick={handleUpdateFolder}>Update</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Question Preview Modal */}
      <Dialog open={isPreviewModalOpen} onOpenChange={setIsPreviewModalOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Question Preview</DialogTitle>
          </DialogHeader>
          {previewQuestion && (
            <div className="space-y-4">
              <div className="prose max-w-none">
                <div dangerouslySetInnerHTML={{ __html: previewQuestion.question }} />
              </div>
              {previewQuestion.type === 'MULTIPLE_CHOICE' && (
                <div className="space-y-2">
                  <h4 className="font-medium">Options:</h4>
                  <div className="grid gap-2">
                    {previewQuestion.options.map((option, index) => (
                      <div
                        key={index}
                        className={`p-2 rounded border ${
                          option === previewQuestion.correctAnswer
                            ? 'bg-green-50 border-green-200'
                            : 'bg-gray-50'
                        }`}
                      >
                        <div dangerouslySetInnerHTML={{ __html: option }} />
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {previewQuestion.type === 'CODING' && (
                <div className="space-y-2">
                  <h4 className="font-medium">Test Cases:</h4>
                  <div className="space-y-2">
                    {previewQuestion.testCases?.map((testCase: any, index: number) => (
                      <div key={index} className="p-2 rounded border bg-gray-50">
                        <div className="font-medium">Input:</div>
                        <pre className="mt-1">{testCase.input}</pre>
                        <div className="font-medium mt-2">Expected Output:</div>
                        <pre className="mt-1">{testCase.output}</pre>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
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