"use client";

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { Plus, Search, Loader2, Folder, FolderOpen, FileText, Code, Pencil, Trash2, Upload, Download, MoreVertical, Copy, ChevronLeft, ChevronRight, Eye, Filter, SortAsc, SortDesc, CheckCircle, ListChecks, X, Grid, List, Table as TableIcon, Folder as FolderIcon, ChevronDown, Settings, ChevronUp, FolderPlus } from "lucide-react";
import { QuestionFormModal } from "@/components/admin/question-form-modal";
import { CodingQuestionFormModal } from "@/components/admin/coding-question-form-modal";
import AikenImportButton from "@/components/admin/aiken-import-button";
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
import { XMLParser } from 'fast-xml-parser';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useJudge0Languages } from '../../../components/hooks/useJudge0Languages';
// Add questionService import
import { questionService } from "@/lib/services/questionService";

// Add a console log to verify questionService is loaded properly
console.log("Question service loaded:", {
  hasQuestionService: !!questionService,
  methods: Object.keys(questionService)
});

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
  parentId?: string;
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

// Utility to build a folder tree from a flat array
function buildFolderTree(flatFolders: { id: string; name: string; parentId?: string }[]): any[] {
  const idToFolder = new Map<string, any>();
  const roots: any[] = [];
  flatFolders.forEach((folder: any) => {
    idToFolder.set(folder.id, { ...folder, subfolders: [] });
  });
  idToFolder.forEach((folder: any) => {
    if (folder.parentId) {
      const parent = idToFolder.get(folder.parentId);
      if (parent) {
        parent.subfolders.push(folder);
      }
    } else {
      roots.push(folder);
    }
  });
  return roots;
}

// Update the safeDateString function to properly handle millisecond timestamps
const safeDateString = (dateValue: any): string => {
  if (!dateValue) return '';
  
  try {
    // Check if the dateValue is a millisecond timestamp (string of numbers)
    if (typeof dateValue === 'string' && /^\d+$/.test(dateValue)) {
      // Convert millisecond timestamp to number and create Date
      const timestamp = parseInt(dateValue, 10);
      const date = new Date(timestamp);
      
      // Check if date is valid
      if (isNaN(date.getTime())) {
        console.error("Invalid millisecond timestamp:", dateValue);
        return '';
      }
      
      return date.toISOString();
    }
    
    // Regular date handling for other formats
    const date = new Date(dateValue);
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      console.error("Invalid date value:", dateValue);
      return '';
    }
    
    return date.toISOString();
  } catch (error) {
    console.error("Error converting date:", error, dateValue);
    return '';
  }
};

export default function AdminQuestionsPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [filteredQuestions, setFilteredQuestions] = useState<Question[]>([]);
  const [folders, setFolders] = useState<FolderType[]>([]);
  const [topLevelFolders, setTopLevelFolders] = useState<FolderType[]>([]); 
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
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [questionToDelete, setQuestionToDelete] = useState<string | null>(null);
  // Add a new state variable to track if all questions should be expanded
  const [allQuestionsExpanded, setAllQuestionsExpanded] = useState(false);
  const [isBulkDeleteDialogOpen, setIsBulkDeleteDialogOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importedQuestions, setImportedQuestions] = useState<any[]>([]);
  const [importLoading, setImportLoading] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [fileContent, setFileContent] = useState<string | null>(null);
  const [selectedDefaultLanguage, setSelectedDefaultLanguage] = useState<string>("");
  // Use the useJudge0Languages hook instead
  const { languages: hookLanguages, loading: languagesLoading, error: languagesError } = useJudge0Languages();
  
  // Add a state for directly fetched Judge0 languages as a fallback
  const [directLanguages, setDirectLanguages] = useState<any[]>([]);
  const [isDirectFetching, setIsDirectFetching] = useState(false);
  
  // Create a derived state that combines languages from hook and direct fetch
  const languages = useMemo(() => {
    // Use hook languages if available
    if (hookLanguages && hookLanguages.length > 0) {
      return hookLanguages;
    }
    // Fall back to directly fetched languages
    if (directLanguages.length > 0) {
      return directLanguages;
    }
    // Return an empty array if neither is available
    return [];
  }, [hookLanguages, directLanguages]);
  
  // Add an effect to fetch languages directly if the hook fails
  useEffect(() => {
    // Only fetch directly if:
    // 1. Hook languages are empty
    // 2. We're not already fetching
    // 3. We haven't attempted direct fetch before
    if ((!hookLanguages || hookLanguages.length === 0) && !isDirectFetching && directLanguages.length === 0) {
      const fetchLanguagesDirectly = async () => {
        setIsDirectFetching(true);
        try {
          console.log('Fetching Judge0 languages directly');
          const response = await fetch('/api/judge0');
          const data = await response.json();
          
          if (data.success && Array.isArray(data.data)) {
            console.log(`Fetched ${data.data.length} languages directly from Judge0 API`);
            setDirectLanguages(data.data);
          } else {
            console.error('Failed to fetch languages directly', data);
            // Add fallback languages if the API fails
            setDirectLanguages([
              { id: 71, name: "Python 3.8.1" },
              { id: 63, name: "JavaScript (Node.js 12.14.0)" },
              { id: 62, name: "Java (OpenJDK 13.0.1)" },
              { id: 54, name: "C++ (GCC 9.2.0)" },
              { id: 51, name: "C# (Mono 6.6.0.161)" },
              { id: 68, name: "PHP (7.4.1)" },
              { id: 60, name: "Go (1.13.5)" },
              { id: 73, name: "Rust (1.40.0)" }
            ]);
          }
        } catch (err) {
          console.error('Error directly fetching Judge0 languages:', err);
          // Set fallback languages
          setDirectLanguages([
            { id: 71, name: "Python 3.8.1" },
            { id: 63, name: "JavaScript (Node.js 12.14.0)" },
            { id: 62, name: "Java (OpenJDK 13.0.1)" },
            { id: 54, name: "C++ (GCC 9.2.0)" },
            { id: 51, name: "C# (Mono 6.6.0.161)" },
            { id: 68, name: "PHP (7.4.1)" },
            { id: 60, name: "Go (1.13.5)" },
            { id: 73, name: "Rust (1.40.0)" }
          ]);
        } finally {
          setIsDirectFetching(false);
        }
      };
      
      fetchLanguagesDirectly();
    }
  }, [hookLanguages, isDirectFetching, directLanguages.length]);

  // In the state declarations, add a new state to track if folders have been loaded
  const [foldersLoaded, setFoldersLoaded] = useState(false);

  // Add a new state to track if stats have been loaded
  const [statsLoaded, setStatsLoaded] = useState(false);


  // Add a function to fetch stats separately
  const fetchStats = async (queryParams: any) => {
    try {
      // Make a lightweight GraphQL query for just the stats data
      const statsResult = await questionService.getQuestionStats(queryParams);
      
      if (statsResult?.stats) {
        const typeCount = statsResult.stats;
        
        // Calculate folder stats from the current page only
        const byFolder = filteredQuestions.reduce((acc: Record<string, number>, q: Question) => {
          const folderName = q.folder?.name || 'Uncategorized';
          acc[folderName] = (acc[folderName] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);
        
        const newStats: Stats = {
          total: statsResult.total || filteredQuestions.length,
          published: typeCount.READY,
          draft: typeCount.DRAFT,
          multipleChoice: typeCount.MCQ,
          coding: typeCount.CODING,
          byFolder: byFolder,
          ready: typeCount.READY
        };
        
        setStats(newStats);
      }
      
      // Mark stats as loaded
      setStatsLoaded(true);
      return true;
    } catch (error) {
      console.error('Error fetching question stats:', error);
      // Return false to indicate failure
      return false;
    }
  };

  // Add a new useEffect specifically for initial folder loading
  useEffect(() => {
    // Fetch folders only once when the component mounts
    fetchFolders();
  }, []); // Empty dependency array means this runs only once on mount

  // Modify the existing useEffect to only fetch questions, not folders
  useEffect(() => {
    fetchQuestions(filters, currentPage);
  }, [filters, currentPage]);

  // Add a new function to handle tab changes
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    
    // Only fetch folders when the folders tab is clicked and folders haven't been loaded yet
    if (value === 'folders' && !foldersLoaded) {
      fetchFolders().then(() => {
        setFoldersLoaded(true);
      });
    }
    
    // Only fetch stats when the stats tab is clicked and stats haven't been loaded yet
    if (value === 'stats' && !statsLoaded) {
      // Use same query params as in fetchQuestions
      const queryParams: any = {
        page: currentPage,
        limit: QUESTIONS_PER_PAGE
      };
      
      if (filters.search) queryParams.search = filters.search;
      
      if (filters.subcategory !== 'all') {
        queryParams.folderId = filters.subcategory;
      } else if (filters.category !== 'all') {
        queryParams.folderId = filters.category;
      } else if (selectedFolder) {
        queryParams.folderId = selectedFolder;
      }
      
      if (filters.type !== 'all') queryParams.type = filters.type;
      if (filters.status !== 'all') queryParams.status = filters.status;
      if (filters.includeSubcategories) queryParams.includeSubcategories = true;
      
      fetchStats(queryParams).then((success) => {
        if (success) {
          setStatsLoaded(true);
        }
      });
    }
  };

  const fetchQuestions = async (currentFilters?: FilterState, page: number = 1) => {
    try {
      const filters = currentFilters || pendingFilters;
      setPendingFilters(filters);
      setIsLoading(true);

      // Prepare GraphQL query parameters
      const queryParams: any = {
        page: page,
        limit: QUESTIONS_PER_PAGE
      };
      
      if (filters.search) queryParams.search = filters.search;
      
      // Handle folder selection
      if (filters.subcategory !== 'all') {
        // Subcategory takes precedence
        queryParams.folderId = filters.subcategory;
      } else if (filters.category !== 'all') {
        // Then category
        queryParams.folderId = filters.category;
      } else if (selectedFolder) {
        // Then selectedFolder as fallback
        queryParams.folderId = selectedFolder;
      }
      
      if (filters.type !== 'all') queryParams.type = filters.type;
      if (filters.status !== 'all') queryParams.status = filters.status;
      if (filters.includeSubcategories) queryParams.includeSubcategories = true;
      
      // Update the current page state
      setCurrentPage(page);

      // Use GraphQL to fetch questions with pagination
      const result = await questionService.getQuestions(queryParams);
      
      // Process results
      setQuestions(result.questions);
      setFilteredQuestions(result.questions);
      setTotalPages(Math.ceil(result.totalCount / QUESTIONS_PER_PAGE));
      setTotalQuestions(result.totalCount);
      
      // Set pagination state
      setPagination({
        total: result.totalCount,
        current: page
      });
      
      // If we're on the stats tab and stats aren't loaded yet, fetch them now
      if (activeTab === 'stats' && !statsLoaded) {
        fetchStats(queryParams);
      }
      
      return result;
    } catch (error) {
      console.error('Error fetching questions:', error);
      toast({
        title: "Error",
        description: "Failed to fetch questions",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const fetchFolders = async () => {
    try {
      // Use GraphQL to fetch folders
      const folders = await questionService.getFolders();
      
      // Organize folders into a parent-child hierarchy
      const folderMap = new Map();
      const topLevel: FolderType[] = [];
      
      // First pass: Create a map of all folders by ID
      folders.forEach((folder: any) => {
        folderMap.set(folder.id, {
          ...folder,
          subfolders: []
        });
      });
      
      // Second pass: Organize folders into hierarchy
      folders.forEach((folder: any) => {
        if (folder.parentId) {
          // This is a subfolder - add it to its parent's subfolders array
          const parentFolder = folderMap.get(folder.parentId);
          if (parentFolder) {
            parentFolder.subfolders.push(folderMap.get(folder.id));
          }
        } else {
          // This is a top-level folder
          topLevel.push(folderMap.get(folder.id));
        }
      });
      
      // Update both state variables
      setFolders(folders);
      setTopLevelFolders(topLevel);
      
      // Return the folders for potential chaining
      return folders;
    } catch (error) {
      console.error("Error fetching folders:", error);
      toast({
        title: "Error",
        description: "Failed to fetch folders",
        variant: "destructive",
      });
      // Return empty array to allow chaining
      return [];
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
      setFolders(prevFolders => 
        prevFolders.map(folder => {
        if (folder.id === selectedFolderForSubfolder) {
          return {
            ...folder,
            subfolders: [...(folder.subfolders || []), newSubfolder]
          };
        }
        return folder;
        })
      );

      // Also update topLevelFolders to maintain consistency
      setTopLevelFolders(prevFolders => 
        prevFolders.map(folder => {
          if (folder.id === selectedFolderForSubfolder) {
            return {
              ...folder,
              subfolders: [...(folder.subfolders || []), newSubfolder]
            };
          }
          return folder;
        })
      );

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
      
      let url = '/api/questions';
      let method = 'POST';
      let body = data;

      if (data.id) {
        url = `/api/questions/${data.id}`;
        method = 'PUT';
      } 

      // Transform the data to match the API's expected format
      if (data.type === 'MCQ') {
        // Make sure questionText is included
        
        body = {
          id: data.id,
          name: data.name,
          type: data.type,
          status: data.status || 'DRAFT',
          folderId: data.folderId,
          questionText: data.mCQQuestion?.questionText || data.questionText,
          difficulty: data.mCQQuestion?.difficulty || data.difficulty || 'MEDIUM',
          defaultMark: data.mCQQuestion?.defaultMark || data.defaultMark || 1,
          mCQQuestion: {
            options: (data.mCQQuestion?.options || data.options || []).map((opt: any) => ({
              ...opt,
              isCorrect: opt.grade > 0
            })),
            isMultiple: data.mCQQuestion?.isMultiple || data.isMultiple,
            shuffleChoice: data.mCQQuestion?.shuffleChoice || data.shuffleChoice,
            generalFeedback: data.mCQQuestion?.generalFeedback || data.generalFeedback,
            choiceNumbering: data.mCQQuestion?.choiceNumbering || data.choiceNumbering
          }
        };
      } else if (data.type === 'CODING') {
        body = {
          id: data.id,
          name: data.name,
          type: data.type,
          status: data.status || 'DRAFT',
          folderId: data.folderId,
          questionText: data.questionText,
          difficulty: data.difficulty || 'MEDIUM',
          defaultMark: data.defaultMark || 1,
          codingQuestion: {
            defaultLanguage: data.defaultLanguage,
            languageOptions: data.languageOptions,
            testCases: data.testCases,
            isAllOrNothing: data.allOrNothingGrading,
            tags: data.tags
          }
        };
      }


      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("FORM SUBMIT - API Error:", errorData);
        throw new Error(errorData.error || 'Failed to save question');
      }

      const result = await response.json();
      
      toast({
        title: "Success",
        description: "Question saved successfully"
      });
      setIsFormModalOpen(false);
      setIsCodingFormModalOpen(false);
      setEditingQuestion(undefined);
      fetchQuestions(); // Refresh the questions list
    } catch (error) {
      console.error('FORM SUBMIT - Error saving question:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'Failed to save question',
        variant: "destructive"
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
    
    // Get MCQ-specific data with proper typing
    const mcqQuestion = (question.mCQQuestion || {}) as any;
    
    // Format MCQ options with standard property names
    const mcqOptions = (mcqQuestion.options || []).map((opt: any) => ({
      id: opt.id || "",
      text: opt.text || "",
      grade: opt.grade || 0,
      feedback: opt.feedback || ""
    }));
    
    // Get Coding-specific data with proper typing
    const codingQuestion = (question.codingQuestion || {}) as any;
    
    // Format language options with standard property names
    const languageOptions = (codingQuestion.languageOptions || []).map((lang: any) => ({
      id: lang.id || "",
      language: lang.language || "",
      solution: lang.solution || "",
      preloadCode: lang.preloadCode || ""
    }));
    
    // Format test cases with standard property names
    const testCases = (codingQuestion.testCases || []).map((tc: any, tcIdx: number) => ({
      id: tc.id || "",
      input: tc.input || "",
      output: tc.output || tc.expectedOutput || "", // Handle both output and expectedOutput fields
      isHidden: tc.isHidden === true,
      type: tc.isHidden === true ? "hidden" : "sample",
      showOnFailure: tc.showOnFailure === true, // Always include showOnFailure, default to false if undefined
      gradePercentage: tc.gradePercentage || 0
    }));
    
    // Extract the question text from the appropriate location
    const questionText = 
      (question as any).questionText || 
      mcqQuestion.questionText || 
      codingQuestion.questionText || 
      "";
    
    // Create the question data object matching the expected structure
    const formData = {
      id: question.id,
      name: question.name,
      type: question.type,
      status: question.status || 'DRAFT',
      folderId: question.folderId || '',
      version: question.version || 1,
      questionText: questionText,
      difficulty: (question.type === 'MCQ' ? mcqQuestion.difficulty : codingQuestion.difficulty) || 'MEDIUM',
      defaultMark: (question.type === 'MCQ' ? mcqQuestion.defaultMark : codingQuestion.defaultMark) || 1,
      isMultiple: mcqQuestion.isMultiple || false,
      shuffleChoice: mcqQuestion.shuffleChoice || false,
      generalFeedback: mcqQuestion.generalFeedback || '',
      choiceNumbering: mcqQuestion.choiceNumbering || 'abc',
      options: mcqOptions,
      languageOptions: languageOptions,
      testCases: testCases,
      defaultLanguage: codingQuestion.defaultLanguage || "",
      allOrNothingGrading: codingQuestion.isAllOrNothing || false,
      tags: codingQuestion.tags || []
    };
    
    
    // Set the editingQuestion state with the formatted data
    setEditingQuestion(formData as QuestionFormData);
    
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
        subcategory: subcategoryId,
        includeSubcategories: true
      }));
    } else {
      setPendingFilters(prev => ({
        ...prev,
        category: value,
        subcategory: 'all',
        includeSubcategories: value !== 'all'
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
    // Always reset to page 1 when applying new filters
    setCurrentPage(1);
    // Mark stats as not loaded so they get refreshed if user goes to stats tab
    setStatsLoaded(false);
    // Explicitly fetch questions with the new filters and page 1
    fetchQuestions(pendingFilters, 1);
  };

  const clearFilters = () => {
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
    // Mark stats as not loaded so they get refreshed if user goes to stats tab
    setStatsLoaded(false);
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
      // Explicitly fetch questions for the new page
      fetchQuestions(filters, newPage);
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

  const prepareQuestionForEditing = (question: Question): any => {
    // Simply return the question with minimal transformation to avoid type conflicts
    return question;
  };

  const handleEdit = (question: Question) => {
    handleEditQuestion({
      ...question,
      folderId: question.folderId || '',
      createdAt: question.createdAt?.toString() || '',
      updatedAt: question.updatedAt?.toString() || '',
    } as any);
  };

  const prepareDataForMCQModal = () => {
    if (!editingQuestion) {
      return undefined;
    }
    
    // Return only the data structure the MCQ modal expects
    return editingQuestion;
  };

  const prepareDataForCodingModal = () => {
    if (!editingQuestion) {
      return undefined;
    }

    // Return only the data structure the coding modal expects
    return editingQuestion;
  };

  // Update the table display to show only current page questions

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

  // Add a new handler for toggle all views
  const handleToggleAllViews = () => {
    setAllQuestionsExpanded(!allQuestionsExpanded);
  };

  // Add this function to handle bulk delete after the handleDeleteQuestion function
  const handleBulkDelete = async () => {
    try {
      if (selectedQuestions.length === 0) {
        toast({
          title: "No questions selected",
          description: "Please select at least one question to delete",
          variant: "destructive",
        });
        return;
      }

      const response = await fetch("/api/questions/bulk", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ids: selectedQuestions }),
      });

      if (!response.ok) {
        throw new Error("Failed to delete questions");
      }

      const result = await response.json();
      
      toast({
        title: "Success",
        description: result.message,
      });

      // Reset selected questions and refresh the list
      setSelectedQuestions([]);
      fetchQuestions();
      setIsBulkDeleteDialogOpen(false);
    } catch (error) {
      console.error("Error deleting questions:", error);
      toast({
        title: "Error",
        description: "Failed to delete selected questions",
        variant: "destructive",
      });
    }
  };

  const handleSelectQuestion = (questionId: string, isSelected: boolean) => {
    if (isSelected) {
      setSelectedQuestions(prev => [...prev, questionId]);
    } else {
      setSelectedQuestions(prev => prev.filter(id => id !== questionId));
    }
  };

  const handleSelectAllQuestions = (isSelected: boolean) => {
    if (isSelected) {
      setSelectedQuestions(filteredQuestions.map(q => q.id));
    } else {
      setSelectedQuestions([]);
    }
  };

  const handleImportFile = async (file: File) => {
    setImportError(null);
    setImportLoading(true);
    try {
      const text = await file.text();
      setFileContent(text); // Store raw XML content for debugging
      const parsed = parseMoodleCodingQuestions(text);
      setImportedQuestions(parsed);
    } catch (err) {
      setImportError('Failed to parse XML. Please check the file format.');
      setImportedQuestions([]);
    } finally {
      setImportLoading(false);
    }
  };

  // Updated handleBulkUpload function with enhanced network debugging
  const handleBulkUpload = async () => {
    if (!bulkFolderId) {
      toast({
        title: "Error",
        description: "Please select a folder for the imported questions",
        variant: "destructive",
      });
      return;
    }

    setImportLoading(true);
    setImportError(null);
    
    console.log("%c=== BULK IMPORT DEBUG START ===", "background: #742a9d; color: white; padding: 5px; font-size: 16px");
    console.log(`Starting bulk import process with ${importedQuestions.length} questions`);
    console.log(`Selected folder ID: ${bulkFolderId}`);
    console.log(`Selected status: ${bulkStatus}`);
    console.log(`Selected default language: ${selectedDefaultLanguage}`);
    console.log(`Available languages: ${languages ? languages.length : 0} languages`);
    
    // Set up a performance marker for timing the import process
    console.time("BulkImport");
    
    // Create a function to monitor network requests
    const originalFetch = window.fetch;
    const requests = [];
    
    // Override fetch to monitor all network requests during the import process
    window.fetch = function(input, init) {
      const url = typeof input === 'string' ? input : input.url;
      console.log(`%cNetwork Request: ${url}`, "color: blue");
      
      // Track the request
      requests.push({
        url,
        method: init?.method || 'GET',
        time: new Date().toISOString()
      });
      
      return originalFetch.apply(this, arguments);
    };

    // Helper function to convert any language value to our supported format
    const mapLanguageToSupported = (lang: string): string => {
      console.log(`Mapping language "${lang}" to supported format`);
      
      if (!lang) {
        const fallback = selectedDefaultLanguage || 
          (languages && languages.length > 0 ? String(languages[0].id) : "");
        console.log(`No language provided, using fallback: ${fallback}`);
        return fallback;
      }

      // If it's already a valid language ID from Judge0
      if (
        languages &&
        languages.some((l: any) => String(l.id) === lang)
      ) {
        console.log(`Language "${lang}" is already a valid Judge0 ID`);
        return lang;
      }

      // If the lang is a language name (like "Python"), try to find matching Judge0 language
      const matchingLang = languages?.find(
        (l: any) => l.name.toLowerCase().includes(lang.toLowerCase())
      );
      if (matchingLang) {
        console.log(`Mapped "${lang}" to Judge0 language ID: ${matchingLang.id}`);
        return String(matchingLang.id);
      }

      // If no match, return the first language as default
      const defaultLang = languages && languages.length > 0
        ? String(languages[0].id)
        : selectedDefaultLanguage || "";
      console.log(`No match found for "${lang}", using default: ${defaultLang}`);
      return defaultLang;
    };

    try {
      // Prepare all questions in the format needed for bulk import
      console.log("Preparing questions for bulk import...");
      const questionsForBulkImport = importedQuestions.map((q, index) => {
        console.log(`\nProcessing question ${index + 1}/${importedQuestions.length}: "${q.name}"`);
        
        // Map the default language to a supported one
        const questionDefaultLanguage = mapLanguageToSupported(
          q.defaultLanguage || selectedDefaultLanguage
        );
        console.log(`Default language for question: ${questionDefaultLanguage}`);
          
        // Ensure all the language IDs in languageOptions are valid
        console.log(`Original language options: ${q.languageOptions.length}`);
        const validLanguageOptions = q.languageOptions
          .filter((lang: any) => lang && lang.language && String(lang.language).trim() !== "")
          .map((lang: any) => ({
            language: String(lang.language).trim(),
            solution: lang.solution || "",
            preloadCode: lang.preloadCode || "",
          }));
        
        console.log(`Valid language options: ${validLanguageOptions.length}`);
        if (validLanguageOptions.length > 0) {
          console.log("First language option:", validLanguageOptions[0]);
        }
        
        console.log(`Test cases: ${q.testCases ? q.testCases.length : 0}`);
          
        // Create consistent form data that matches the GraphQL schema
        const questionData = {
          name: q.name,
          type: "CODING",
          status: bulkStatus, // Use the selected status from form
          folderId: bulkFolderId, // Use the selected folder from form
          codingQuestion: {
            questionText: q.questionText,
            difficulty: q.difficulty,
            defaultMark: q.defaultMark,
            isAllOrNothing: q.allOrNothingGrading || false,
            defaultLanguage: questionDefaultLanguage,
            languageOptions: validLanguageOptions,
            testCases: q.testCases.map((tc: any) => ({
              input: String(tc.input),
              output: String(tc.output),
              isSample: !!tc.isSample,
              isHidden: !!tc.isHidden,
              showOnFailure: !!tc.showOnFailure,
              gradePercentage: tc.gradePercentage || 0
            }))
          }
        };
        
        console.log(`Question ${index + 1} prepared successfully`);
        
        return questionData;
      });

      console.log(`\nPrepared ${questionsForBulkImport.length} questions for bulk import`);
      console.log("First question sample:", JSON.stringify(questionsForBulkImport[0]).substring(0, 200) + "...");
      
      // Double check that questionService.bulkImportCodingQuestions exists
      if (typeof questionService.bulkImportCodingQuestions !== 'function') {
        console.error("ERROR: questionService.bulkImportCodingQuestions is not a function!");
        console.log("Available questionService methods:", Object.keys(questionService));
        throw new Error("bulkImportCodingQuestions method not found in questionService");
      }

      // Use the questionService.bulkImportCodingQuestions to import all questions in one call
      console.log(`\nCalling bulkImportCodingQuestions with ${questionsForBulkImport.length} questions...`);
      const result = await questionService.bulkImportCodingQuestions(questionsForBulkImport);
      
      console.log("Bulk import result:", result);
      console.log(`Successfully imported ${result ? result.length : 0} questions`);
      
      // Log network activity summary
      console.log("%cNetwork Activity Summary:", "color: blue; font-weight: bold");
      console.table(requests);
      
      console.timeEnd("BulkImport");
      console.log("%c=== BULK IMPORT DEBUG END ===", "background: #742a9d; color: white; padding: 5px; font-size: 16px");

      toast({
        title: "Import Complete",
        description: `${result ? result.length : 0} questions imported successfully.`,
        variant: "default"
      });
      
    } catch (err) {
      console.error("Bulk import error:", err);
      
      // Log network activity on error
      console.log("%cNetwork Activity on Error:", "color: red; font-weight: bold");
      console.table(requests);
      
      console.timeEnd("BulkImport");
      console.log("%c=== BULK IMPORT DEBUG END (WITH ERROR) ===", "background: #742a9d; color: white; padding: 5px; font-size: 16px");
      
      setImportError("Failed to import questions. See console for details.");
      
      toast({
        title: "Import Failed",
        description: "Failed to import questions. See console for details.",
        variant: "destructive",
      });
    } finally {
      // Restore the original fetch function
      window.fetch = originalFetch;
      
      setImportLoading(false);
      setIsImportModalOpen(false);
      setImportedQuestions([]);
      fetchQuestions();
    }
  };

  // Add the parseMoodleCodingQuestions function as a nested function inside the component
  const parseMoodleCodingQuestions = (xmlString: string) => {
    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: "",
      processEntities: true,
      isArray: (name: string) => name === "question" || name === "testcase",
    });
    const xml = parser.parse(xmlString);
    if (!xml.quiz || !xml.quiz.question) return [];
    const questions = xml.quiz.question.filter(
      (q: any) => q.type === "coderunner"
    );

    // Get the default language ID to use from state variables
    const defaultLangId =
      selectedDefaultLanguage ||
      (languages && languages.length > 0 ? String(languages[0].id) : "");

   

    return questions.map((q: any, idx: number) => {
      // Extract language from the question
      let detectedLanguage = "";

      // First try to extract from prototypetype which sometimes contains language info
      if (q.prototypetype?.text) {
        const prototypeType = q.prototypetype.text.toLowerCase();
   

        // Common Moodle CodeRunner prototypes
        if (prototypeType.includes("python")) detectedLanguage = "python";
        else if (prototypeType.includes("java")) detectedLanguage = "java";
        else if (
          prototypeType.includes("c#") ||
          prototypeType.includes("csharp")
        )
          detectedLanguage = "csharp";
        else if (prototypeType.includes("c++") || prototypeType.includes("cpp"))
          detectedLanguage = "cpp";
        else if (
          prototypeType.includes("javascript") ||
          prototypeType.includes("js")
        )
          detectedLanguage = "javascript";
        else if (prototypeType.includes("php")) detectedLanguage = "php";
        else if (prototypeType.includes("ruby")) detectedLanguage = "ruby";
        else if (prototypeType.includes("go")) detectedLanguage = "go";
      }

      // Also try to extract from question name or text as fallback
      if (!detectedLanguage) {
        const questionName = q.name?.text?.toLowerCase() || "";
        const questionText = q.questiontext?.text?.toLowerCase() || "";
        const combinedText = questionName + " " + questionText;

        if (combinedText.includes("python")) detectedLanguage = "python";
        else if (
          combinedText.includes("java ") ||
          combinedText.includes("java.")
        )
          detectedLanguage = "java";
        else if (combinedText.includes("c#") || combinedText.includes("csharp"))
          detectedLanguage = "csharp";
        else if (combinedText.includes("c++") || combinedText.includes("cpp"))
          detectedLanguage = "cpp";
        else if (
          combinedText.includes("javascript") ||
          combinedText.includes("js")
        )
          detectedLanguage = "javascript";
        else if (combinedText.includes("php")) detectedLanguage = "php";
        else if (combinedText.includes("ruby")) detectedLanguage = "ruby";
        else if (
          combinedText.includes("go ") ||
          combinedText.includes("golang")
        )
          detectedLanguage = "go";
      }

      const solution = q.answer?.["#cdata-section"] || q.answer || "";
      

      // Map the detected language to Judge0 language ID using robust matching
      let mappedDefaultLang = defaultLangId;
      if (detectedLanguage && languages && languages.length > 0) {
        const foundLang = languages.find(
          (l: any) => l.name && l.name.toLowerCase().includes(detectedLanguage.toLowerCase())
        );
        if (foundLang) {
          mappedDefaultLang = String(foundLang.id);
        }
      }

      // Create language options for all available Judge0 languages
      const languageOptions: {
        id: string;
        language: string;
        solution: string;
        preloadCode: string;
      }[] = [];
      
      // Always add ALL available languages to each imported question
      if (languages && languages.length > 0) {
        languages.forEach((lang: any) => {
          const langId = String(lang.id);
          // Skip any empty language IDs - this prevents the SelectItem empty value error
          if (langId && langId.trim() !== "") {
            languageOptions.push({
              id: `lang-${langId}-${Date.now() + languageOptions.length}`,
              language: langId,
              // Only add solution to the detected/mapped language
              solution: langId === mappedDefaultLang ? solution : "",
              preloadCode: "",
            });
          }
        });
      } else {
        // Fallback if no languages available
        // Only add if mappedDefaultLang is not empty
        if (mappedDefaultLang && mappedDefaultLang.trim() !== "") {
          languageOptions.push({
            id: `lang-${mappedDefaultLang}-${Date.now()}`,
            language: mappedDefaultLang,
            solution: solution,
            preloadCode: "",
          });
        }
      }

      // If no default language was detected, use the first available language
      if ((!mappedDefaultLang || mappedDefaultLang.trim() === "") && languages && languages.length > 0) {
        mappedDefaultLang = String(languages[0].id);
      }

      return {
        name: q.name?.text || `Question ${idx + 1}`,
        questionText: q.questiontext?.text || "",
        defaultMark: Number(q.defaultgrade) || 1,
        difficulty: "MEDIUM",
        languageOptions: languageOptions,
        testCases: (q.testcases?.testcase || []).map((tc: any, tcIdx: number) => {
          // Debug: log the raw testcase object
          // Robust extraction for input
          let input = '';
          if (tc.stdin) {
            if (typeof tc.stdin === 'string') input = tc.stdin;
            else if (tc.stdin['#cdata-section']) input = tc.stdin['#cdata-section'];
            else if (tc.stdin.text) input = tc.stdin.text;
          }
          // Output: always use tc.expected.text if it exists
          let output = '';
          if (tc.expected && typeof tc.expected === 'object' && 'text' in tc.expected) {
            output = tc.expected.text;
          } else if (tc.expected) {
            if (typeof tc.expected === 'string') output = tc.expected;
            else if (tc.expected['#cdata-section']) output = tc.expected['#cdata-section'];
          }
       
          return {
            input,
            output: String(output),
            isHidden: tc.useasexample !== '1',
            isSample: tc.useasexample === '1',
            showOnFailure: tc.hiderestiffail === '1'
          };
        }),
        allOrNothingGrading: q.allornothing === "1",
        defaultLanguage: mappedDefaultLang,
      };
    });
  };

  // In the component body, just before rendering the folder picker:
  const folderTreeForPicker = buildFolderTree(folders);

  // Add reloadQuestions function for Aiken import success
  const reloadQuestions = async () => {
    await fetchQuestions();
    await fetchFolders();
  };

  // Add a helper function to get folder name by ID
  // Place this before the AdminQuestionsPage return statement
  const getFolderNameById = (folderId?: string): string | undefined => {
    if (!folderId) return undefined;
    
    // First check in top-level folders
    const folder = topLevelFolders.find(f => f.id === folderId);
    if (folder) return folder.name;
    
    // If not found, check in subfolders of top-level folders
    for (const parentFolder of topLevelFolders) {
      if (parentFolder.subfolders) {
        const subfolder = parentFolder.subfolders.find(s => s.id === folderId);
        if (subfolder) {
          // Return the subfolder name prefixed with its parent name for clarity
          return `${parentFolder.name} > ${subfolder.name}`;
        }
      }
    }
    
    return undefined;
  };

  // Add an effect to set a default language when languages are loaded
  useEffect(() => {
    // If we have languages but no default language is set yet, set the first language as default
    if (languages.length > 0 && !selectedDefaultLanguage) {
      console.log('Setting default language to first available language:', languages[0].id);
      setSelectedDefaultLanguage(String(languages[0].id));
    }
  }, [languages, selectedDefaultLanguage]);

  return (
    <div className="container mx-auto py-6 bg-background">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-foreground">Question bank</h1>
        <div className="flex items-center gap-4">
          {/* Remove the three view mode icons and export button, only keep import buttons */}
          <AikenImportButton folders={folders} onSuccess={reloadQuestions} />
          <Dialog open={isImportModalOpen} onOpenChange={(open) => {
            setIsImportModalOpen(open);
            // Reset all state when closing the modal
            if (!open) {
              setImportedQuestions([]);
              setImportLoading(false);
              setImportError(null);
              setFileContent(null);
              setBulkFolderId('');
              setBulkStatus('DRAFT');
              setSelectedDefaultLanguage(''); // Always reset to empty string
            } 
          }}>
            <DialogTrigger asChild>
              <Button variant="outline" className="ml-2">
                <Upload className="mr-2 h-4 w-4" />
                Import Coding Questions (XML)
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-xl flex items-center">
                  <Code className="h-5 w-5 mr-2 text-primary" />
                  Import Coding Questions from XML
                </DialogTitle>
                <DialogDescription className="text-base opacity-90">
                  Upload a XML file containing coderunner questions to import them into your question bank.
                </DialogDescription>
              </DialogHeader>
              
              <div className="mt-6 space-y-6">
                {/* Step 1: File Upload */}
                <div className="border rounded-lg p-4 bg-card">
                  <div className="flex items-center mb-3">
                    <div className="h-6 w-6 rounded-full bg-primary/90 text-primary-foreground flex items-center justify-center text-sm font-semibold mr-2">1</div>
                    <h3 className="text-base font-medium">Upload XML File</h3>
                  </div>
                  
                  {fileContent ? (
                    <div className="mb-4">
                      <div className="flex items-center justify-between p-3 border rounded-lg bg-muted/30">
                        <div className="flex items-center">
                          <div className="p-2 bg-primary/10 rounded-md mr-3">
                            <FileText className="h-6 w-6 text-primary" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">
                              {importedQuestions.length > 0 ? (
                                <span className="flex items-center">
                                  <CheckCircle className="h-4 w-4 text-green-500 mr-1.5" />
                                  File processed successfully
                                </span>
                              ) : (
                                "XML File Uploaded"
                              )}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {importedQuestions.length} questions found
                            </p>
                          </div>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="text-xs"
                          onClick={() => {
                            setFileContent(null);
                            setImportedQuestions([]);
                            setImportError(null);
                          }}
                        >
                          <X className="h-3.5 w-3.5 mr-1" />
                          Change File
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center hover:border-primary/50 hover:bg-primary/[0.03] transition-colors">
                      <input
                        type="file"
                        accept=".xml"
                        onChange={e => {
                          if (e.target.files && e.target.files[0]) {
                            handleImportFile(e.target.files[0]);
                          }
                        }}
                        className="hidden"
                        id="xml-upload"
                      />
                      <label htmlFor="xml-upload" className="cursor-pointer flex flex-col items-center justify-center">
                        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                          <Upload className="h-7 w-7 text-primary" />
                        </div>
                        <span className="text-sm font-medium mb-1">Click to upload XML file</span>
                        <span className="text-xs text-muted-foreground">or drag and drop</span>
                        <span className="mt-2 text-xs px-2 py-1 bg-muted rounded-md inline-block">
                          Only XML files with coderunner questions
                        </span>
                      </label>
                    </div>
                  )}
                </div>
                
                {/* Loading State */}
                {importLoading && (
                  <div className="flex items-center justify-center p-6 my-4 border rounded-lg bg-primary/5 animate-pulse">
                    <Loader2 className="animate-spin mr-3 h-6 w-6 text-primary" />
                    <p className="text-base">Processing XML file...</p>
                  </div>
                )}
                
                {/* Error Display */}
                {importError && (
                  <div className="bg-destructive/10 text-destructive border border-destructive/20 rounded-lg p-5">
                    <h3 className="font-medium flex items-center text-base mb-2">
                      <X className="h-5 w-5 mr-2" /> Error Parsing XML
                    </h3>
                    <p className="ml-7 text-sm">{importError}</p>
                    <p className="ml-7 text-xs mt-3 text-destructive/80">Check the browser console for more details.</p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mt-3 border-destructive/30 hover:bg-destructive/10 ml-7" 
                      onClick={() => {
                        if (fileContent) {
                          try {
                            const parser = new XMLParser({
                              ignoreAttributes: false,
                              attributeNamePrefix: '',
                              processEntities: true
                            });
                            const parsed = parser.parse(fileContent);
                            
                            // Attempt to find testcases
                            const findTestcases = (obj: any) => {
                              if (!obj) return [];
                              if (obj.testcases) {
                              }
                              if (obj.testcase) {
                              }
                              if (typeof obj === 'object') {
                                Object.keys(obj).forEach(key => {
                                  findTestcases(obj[key]);
                                });
                              }
                            };
                            findTestcases(parsed);
                          } catch (e) {
                            console.error("Manual parse error:", e);
                          }
                        }
                      }}
                    >
                      Debug XML in Console
                    </Button>
                  </div>
                )}
                
                {/* Step 2: Configure Import */}
                {importedQuestions.length > 0 && (
                  <div className="space-y-6">
                    <div className="border rounded-lg p-4 bg-card">
                      <div className="flex items-center mb-3">
                        <div className="h-6 w-6 rounded-full bg-primary/90 text-primary-foreground flex items-center justify-center text-sm font-semibold mr-2">2</div>
                        <h3 className="text-base font-medium">Configure Import Settings</h3>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                        {/* Target Folder - Improved selection */}
                        <div className="space-y-3">
                          <Label htmlFor="targetFolder" className="font-medium flex items-center gap-1.5">
                            <FolderIcon className="h-4 w-4 text-primary opacity-80" />
                            Target Folder
                          </Label>
                          
                          <div className="border rounded-lg overflow-hidden bg-card flex flex-col h-64">
                            {/* Search bar for folders */}
                            <div className="p-2 border-b relative">
                              <Search className="absolute left-3 top-[11px] h-4 w-4 text-muted-foreground" />
                              <Input 
                                placeholder="Search folders..." 
                                className="pl-8 h-8 text-sm"
                                onChange={(e) => {
                                  const searchTerm = e.target.value.toLowerCase();
                                  // Find matching folders and automatically expand them
                                  if (searchTerm) {
                                    const newExpanded = new Set<string>();
                                    folderTreeForPicker.forEach(folder => {
                                      if (folder.name.toLowerCase().includes(searchTerm)) {
                                        newExpanded.add(folder.id);
                                      }
                                      folder.subfolders?.forEach((subfolder: any) => {
                                        if (subfolder.name.toLowerCase().includes(searchTerm)) {
                                          newExpanded.add(folder.id);
                                        }
                                      });
                                    });
                                    setExpandedFolders(newExpanded);
                                  }
                                }}
                              />
                            </div>
                            
                            {/* Folder tree with virtualized scrolling */}
                            <div className="overflow-y-auto p-2 h-full">
                              {folderTreeForPicker.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full py-4 text-muted-foreground">
                                  <FolderIcon className="h-8 w-8 mb-2 opacity-50" />
                                  <p className="text-sm">No folders available</p>
                                  <Button 
                                    variant="link" 
                                    className="text-xs text-primary mt-1"
                                    onClick={() => setIsCreateFolderModalOpen(true)}
                                  >
                                    Create a folder
                                  </Button>
                                </div>
                              ) : (
                                <div className="space-y-1">
                                  {folderTreeForPicker.map(folder => (
                                    <div key={folder.id} className="text-sm">
                                      <div className="flex items-center gap-1 py-1">
                                        <Button 
                                          variant="ghost" 
                                          size="icon"
                                          className="h-5 w-5 p-0 mr-1"
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
                                          {expandedFolders.has(folder.id) ? 
                                            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" /> : 
                                            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                                          }
                                        </Button>
                                        
                                        <div className="flex-1 flex items-center">
                                          <label className="flex items-center gap-2 hover:bg-muted/50 p-1.5 rounded-md transition-colors cursor-pointer flex-1">
                                            <input 
                                              type="radio" 
                                              name="folderSelect" 
                                              value={folder.id}
                                              checked={bulkFolderId === folder.id} 
                                              onChange={() => setBulkFolderId(folder.id)}
                                              className="h-4 w-4 text-primary"
                                            />
                                            <Folder className="h-4 w-4 text-primary" /> 
                                            <span className="text-sm font-medium">{folder.name}</span>
                                          </label>
                                        </div>
                                      </div>
                                      
                                      {expandedFolders.has(folder.id) && folder.subfolders?.length > 0 && (
                                        <div className="ml-5 pl-3 border-l-2 space-y-1 mt-1">
                                          {folder.subfolders.map((subfolder: any) => (
                                            <label key={subfolder.id} className="flex items-center gap-2 hover:bg-muted/50 p-1.5 rounded-md transition-colors cursor-pointer">
                                              <input 
                                                type="radio" 
                                                name="folderSelect" 
                                                value={subfolder.id}
                                                checked={bulkFolderId === subfolder.id} 
                                                onChange={() => setBulkFolderId(subfolder.id)}
                                                className="h-4 w-4 text-primary"
                                              />
                                              <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                                              <span className="text-sm">{subfolder.name}</span>
                                            </label>
                                          ))}
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                            
                            {/* Footer actions */}
                            <div className="p-2 border-t bg-muted/10 flex justify-between items-center">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-xs h-7"
                                onClick={() => {
                                  // Toggle expand all folders
                                  if (expandedFolders.size === folderTreeForPicker.length) {
                                    setExpandedFolders(new Set());
                                  } else {
                                    setExpandedFolders(new Set(folderTreeForPicker.map(f => f.id)));
                                  }
                                }}
                              >
                                {expandedFolders.size === folderTreeForPicker.length ? (
                                  <><ChevronUp className="h-3 w-3 mr-1" /> Collapse All</>
                                ) : (
                                  <><ChevronDown className="h-3 w-3 mr-1" /> Expand All</>
                                )}
                              </Button>
                              
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-xs h-7"
                                onClick={() => setIsCreateFolderModalOpen(true)}
                              >
                                <FolderPlus className="h-3 w-3 mr-1" /> New Folder
                              </Button>
                            </div>
                          </div>
                          
                          {/* Selected folder display */}
                          {bulkFolderId && (
                            <div className="flex items-center mt-1.5 text-sm">
                              <span className="text-muted-foreground mr-2">Selected:</span>
                              <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 flex items-center">
                                <FolderIcon className="h-3 w-3 mr-1" />
                                {(() => {
                                  // Find folder name
                                  for (const folder of folderTreeForPicker) {
                                    if (folder.id === bulkFolderId) {
                                      return folder.name;
                                    }
                                    for (const subfolder of folder.subfolders || []) {
                                      if (subfolder.id === bulkFolderId) {
                                        return `${folder.name} > ${subfolder.name}`;
                                      }
                                    }
                                  }
                                  return 'Unknown Folder';
                                })()}
                              </Badge>
                            </div>
                          )}
                        </div>
                        
                        <div className="space-y-6">
                          {/* Question Status */}
                          <div className="space-y-3">
                            <Label htmlFor="questionStatus" className="font-medium flex items-center gap-1.5">
                              <CheckCircle className="h-4 w-4 text-primary opacity-80" />
                              Question Status
                            </Label>
                            <Select 
                              value={bulkStatus} 
                              onValueChange={(val) => setBulkStatus(val as 'DRAFT' | 'READY')}
                            >
                              <SelectTrigger id="questionStatus" className="w-full">
                                <SelectValue placeholder="Question status" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="DRAFT">
                                  <div className="flex items-center">
                                    <span className="w-2 h-2 rounded-full bg-amber-500 mr-2"></span>
                                    Draft
                                  </div>
                                </SelectItem>
                                <SelectItem value="READY">
                                  <div className="flex items-center">
                                    <span className="w-2 h-2 rounded-full bg-green-500 mr-2"></span>
                                    Ready
                                  </div>
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          
                          {/* Difficulty setting */}
                          <div className="space-y-3">
                            <Label htmlFor="difficulty" className="font-medium flex items-center gap-1.5">
                              <Settings className="h-4 w-4 text-primary opacity-80" />
                              Default Difficulty
                            </Label>
                            <Select 
                              defaultValue="MEDIUM"
                              onValueChange={(val) => {
                                setImportedQuestions(prev => prev.map(q => ({ ...q, difficulty: val })));
                              }}
                            >
                              <SelectTrigger id="difficulty" className="w-full">
                                <SelectValue placeholder="Select difficulty" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="EASY">
                                  <div className="flex items-center">
                                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 mr-2">Easy</Badge>
                                    Straightforward problems
                                  </div>
                                </SelectItem>
                                <SelectItem value="MEDIUM">
                                  <div className="flex items-center">
                                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 mr-2">Medium</Badge>
                                    Moderate complexity
                                  </div>
                                </SelectItem>
                                <SelectItem value="HARD">
                                  <div className="flex items-center">
                                    <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 mr-2">Hard</Badge>
                                    Challenging problems
                                  </div>
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          
                          {/* Default Language */}
                          <div className="space-y-3">
                            <Label htmlFor="defaultLanguage" className="font-medium flex items-center gap-1.5">
                              <Code className="h-4 w-4 text-primary opacity-80" />
                              Default Language
                            </Label>
                            <Select 
                              value={selectedDefaultLanguage}
                              onValueChange={setSelectedDefaultLanguage}
                            >
                              <SelectTrigger id="defaultLanguage" className="w-full">
                                <SelectValue placeholder="Default programming language" />
                              </SelectTrigger>
                              <SelectContent>
                                
                                {languages && languages.length > 0 ? (
                                  languages
                                    .filter((lang: any) => lang && lang.id && String(lang.id).trim() !== "")
                                    .map((lang: any) => (
                                      <SelectItem key={lang.id} value={String(lang.id)}>
                                        {lang.name}
                                      </SelectItem>
                                    ))
                                ) : (
                                  <SelectItem value="placeholder" disabled>
                                    {languagesLoading ? "Loading languages..." : languagesError ? "Error loading languages" : "No languages available"}
                                  </SelectItem>
                                )}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Step 3: Preview Questions */}
                    <div className="border rounded-lg p-4 bg-card">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center">
                          <div className="h-6 w-6 rounded-full bg-primary/90 text-primary-foreground flex items-center justify-center text-sm font-semibold mr-2">3</div>
                          <h3 className="text-base font-medium">Preview Questions</h3>
                        </div>
                        <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                          {importedQuestions.length} Questions Found
                        </Badge>
                      </div>
                      
                      <div className="max-h-72 overflow-y-auto border rounded-lg p-4 space-y-4 bg-background/50">
                        {importedQuestions.map((q, idx) => (
                          <div key={idx} className="rounded-lg border bg-card overflow-hidden">
                            <div className="p-3 border-b bg-muted/30 flex justify-between items-center">
                              <div className="flex items-center gap-2">
                                <span className="h-5 w-5 rounded-full bg-primary/15 text-primary text-xs flex items-center justify-center font-semibold">
                                  {idx + 1}
                                </span>
                                <h4 className="font-medium text-sm">{q.name}</h4>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className={
                                  q.difficulty === 'EASY' ? 'bg-green-50 text-green-700 border-green-200' :
                                  q.difficulty === 'MEDIUM' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                  'bg-red-50 text-red-700 border-red-200'
                                }>
                                  {q.difficulty}
                                </Badge>
                                <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                                  {q.testCases.length} Tests
                                </Badge>
                              </div>
                            </div>
                            <div className="p-3">
                              <div 
                                className="text-xs text-muted-foreground mb-3 bg-background/60 p-3 rounded-md whitespace-pre-wrap" 
                                dangerouslySetInnerHTML={{ 
                                  __html: q.questionText.substring(0, 250) + (q.questionText.length > 250 ? '...' : '') 
                                }}
                                style={{ 
                                  lineHeight: '1.5',
                                  maxHeight: '200px',
                                  overflowY: 'auto'
                                }}
                              />
                              
                              {/* Language info section */}
                              <div className="mb-3">
                                <div className="flex items-center mb-2">
                                  <Code className="h-4 w-4 mr-1.5 text-primary/70" />
                                  <span className="text-xs font-medium">Languages:</span>
                                </div>
                                <div className="flex flex-wrap gap-1.5">
                                  {q.languageOptions && q.languageOptions.length > 0 ? (
                                    // Only show up to 5 languages in the preview with a +X more if there are more
                                    <>
                                      {q.languageOptions.slice(0, 5).map((lang: any, i: number) => {
                                        // Find the language name from the language ID
                                        const langName = languages.find((l: any) => String(l.id) === lang.language)?.name || lang.language;
                                        return (
                                          <Badge key={i} variant="outline" className="text-[10px] bg-primary/5 text-primary">
                                            {langName}
                                          </Badge>
                                        );
                                      })}
                                      {q.languageOptions.length > 5 && (
                                        <Badge variant="outline" className="text-[10px]">
                                          +{q.languageOptions.length - 5} more
                                        </Badge>
                                      )}
                                    </>
                                  ) : (
                                    <span className="text-xs text-muted-foreground italic">No languages specified</span>
                                  )}
                                </div>
                                <div className="mt-2 text-xs">
                                  <span className="font-medium">Default: </span>
                                  <span className="text-primary">
                                    {languages.find((l: any) => String(l.id) === q.defaultLanguage)?.name || q.defaultLanguage || "None"}
                                  </span>
                                </div>
                              </div>
                              
                              {/* Expandable section to view test cases */}
                              {q.testCases.length > 0 && (
                                <Collapsible className="mt-2">
                                  <CollapsibleTrigger asChild>
                                    <Button variant="outline" size="sm" className="p-1 h-7 text-xs flex items-center w-full justify-start border-dashed">
                                      <ChevronRight className="h-3.5 w-3.5 mr-1 text-primary" />
                                      <span className="text-xs">View Test Cases</span>
                                    </Button>
                                  </CollapsibleTrigger>
                                  <CollapsibleContent>
                                    <div className="bg-muted/20 p-2 rounded-md mt-2 space-y-2">
                                      {q.testCases.map((tc: any, tcIdx: number) => (
                                        <div key={tcIdx} className="text-xs border rounded-md overflow-hidden">
                                          <div className="flex items-center gap-2 p-2 bg-muted/40 border-b">
                                            <Badge variant={tc.isSample ? "default" : "outline"} className="text-[10px] h-4">
                                              {tc.isSample ? 'Sample' : 'Hidden'}
                                            </Badge>
                                            <span className="text-muted-foreground">Test #{tcIdx + 1}</span>
                                          </div>
                                          <div className="grid grid-cols-2 gap-0 divide-x">
                                            <div className="p-2">
                                              <span className="font-medium text-[10px] uppercase text-muted-foreground flex items-center gap-1">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 7 3 3 3-3"/><path d="M6 10V5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-12a2 2 0 0 1-2-2v-2"/></svg>
                                                Input
                                              </span>
                                              <pre className="bg-background p-1.5 rounded text-[10px] mt-1 overflow-x-auto">{tc.input || '<empty>'}</pre>
                                            </div>
                                            <div className="p-2">
                                              <span className="font-medium text-[10px] uppercase text-muted-foreground flex items-center gap-1">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 17 3-3 3 3"/><path d="M6 14v5a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-12a2 2 0 0 0-2 2v2"/></svg>
                                                Expected
                                              </span>
                                              <pre className="bg-background p-1.5 rounded text-[10px] mt-1 overflow-x-auto">
                                                {typeof tc.output === 'object' && tc.output !== null && 'text' in tc.output
                                                  ? tc.output.text
                                                  : tc.output || '<empty>'}
                                              </pre>
                                            </div>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </CollapsibleContent>
                                </Collapsible>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              <DialogFooter className="flex items-center justify-between mt-6 pt-4 border-t">
                <div>
                  {importedQuestions.length > 0 && !importLoading && (
                    <div className="flex flex-col items-start">
                      <span className="text-sm font-medium flex items-center gap-1.5 text-primary">
                        <CheckCircle className="h-4 w-4" />
                        {importedQuestions.length} questions ready to import
                      </span>
                      <span className="text-xs text-muted-foreground mt-1">
                        All questions will be imported as {bulkStatus === 'DRAFT' ? 'drafts' : 'ready for use'}
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setIsImportModalOpen(false)}>Cancel</Button>
                  <Button 
                    onClick={handleBulkUpload} 
                    disabled={importedQuestions.length === 0 || importLoading || !bulkFolderId}
                    className="min-w-[120px]"
                  >
                    {importLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Upload className="h-4 w-4 mr-2" />}
                    Import {importedQuestions.length > 0 ? `(${importedQuestions.length})` : ''}
                  </Button>
                </div>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          {/* Restore Create Question button and its dialog/modal */}
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
                folders={buildFolderTree(folders)}
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
                folders={buildFolderTree(folders)}
                onAddFolder={() => setIsCreateFolderModalOpen(true)}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs defaultValue="questions" className="space-y-4" onValueChange={handleTabChange}>
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
                        ? (() => {
                            // Find parent folder first
                            const parentFolder = topLevelFolders.find(f => f.id === pendingFilters.category);
                            // Then find subfolder
                            const subfolder = parentFolder?.subfolders?.find(s => s.id === pendingFilters.subcategory);
                            return parentFolder && subfolder 
                              ? `${parentFolder.name} > ${subfolder.name}` 
                              : 'Unknown Category';
                          })()
                        : pendingFilters.category === 'all'
                          ? 'All Categories'
                          : topLevelFolders.find(f => f.id === pendingFilters.category)?.name || 'All Categories'
                      }
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {topLevelFolders.map((folder) => (
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
                    onClick={handleToggleAllViews}
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

              {/* Bulk Actions Bar - Show when questions are selected */}
              {selectedQuestions.length > 0 && (
                <div className="flex items-center justify-between p-2 mt-4 bg-primary/10 rounded-md">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    <span>{selectedQuestions.length} questions selected</span>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => setIsBulkDeleteDialogOpen(true)}
                      className="flex items-center gap-1"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete Selected
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedQuestions([])}
                    >
                      Cancel
                    </Button>
                  </div>
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

          {/* Table View */}
          {viewMode === 'table' && (
            <div className="bg-card rounded-lg shadow questions-table">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="w-[40px]">
                      <Checkbox 
                        checked={selectedQuestions.length > 0 && selectedQuestions.length === filteredQuestions.length}
                        onCheckedChange={handleSelectAllQuestions}
                        aria-label="Select all questions"
                      />
                    </TableHead>
                    <TableHead 
                      className="w-[300px] cursor-pointer"
                      onClick={() => {
                        if (sortField === 'name') {
                          setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
                        } else {
                          setSortField('name');
                          setSortDirection('asc');
                        }
                      }}
                    >
                      <div className="flex items-center">
                        Name
                        {sortField === 'name' && (
                          sortDirection === 'asc' ? <ChevronUp className="ml-1 h-4 w-4" /> : <ChevronDown className="ml-1 h-4 w-4" />
                        )}
                      </div>
                    </TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="hidden md:table-cell">UpdatedAt</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        <div className="flex justify-center items-center">
                          <Loader2 className="h-6 w-6 animate-spin mr-2" />
                          <span>Loading questions...</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : filteredQuestions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        <div className="flex flex-col items-center justify-center">
                          <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                          <p className="text-muted-foreground mb-2">No questions found</p>
                          <p className="text-sm text-muted-foreground mb-4">
                            Try adjusting your filters or create a new question
                          </p>
                          <Button onClick={handleCreateQuestion}>
                            <Plus className="mr-2 h-4 w-4" />
                            Create Question
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredQuestions.map((question) => (
                      <QuestionRow
                        key={question.id}
                        question={{
                          ...question,
                          folderId: question.folderId || '',
                          folder: question.folder || { id: question.folderId || '', name: getFolderNameById(question.folderId) || 'Uncategorized' },
                          createdAt: question.createdAt || '',
                          updatedAt: question.updatedAt || '',
                        } as any}
                        onSelect={(id) => handleSelectQuestion(id, !selectedQuestions.includes(id))}
                        isSelected={selectedQuestions.includes(question.id)}
                        onPreview={() => handleEdit(question)}
                        onEdit={() => handleEdit(question)}
                        onDelete={(id) => handleDeleteClick(id)}
                        allQuestionsExpanded={allQuestionsExpanded}
                      />
                    ))
                  )}
                </TableBody>
              </Table>
              
              {filteredQuestions.length > 0 && (
                <div className="p-4 border-t">
                  <PaginationControls />
                </div>
              )}
            </div>
          )}
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
              ) : folderTreeForPicker.length === 0 ? (
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
                // Only show top-level folders in the main list
                topLevelFolders.map((folder) => (
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
                        {folder.subfolders?.length > 0 && (
                          <Badge variant="outline" className="ml-2 text-xs">
                            {folder.subfolders.length} {folder.subfolders.length === 1 ? 'subfolder' : 'subfolders'}
                          </Badge>
                        )}
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
                          <FolderPlus className="h-4 w-4 mr-1" />
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
                      <div className="bg-muted/30 border-l-2 border-l-amber-200 ml-6">
                        {folder.subfolders && folder.subfolders.length > 0 ? (
                          folder.subfolders.map((subfolder: any) => (
                            <div key={subfolder.id} className="flex items-center justify-between py-3 px-6 hover:bg-accent/5 border-l-2 border-l-accent ml-2">
                              <div className="flex items-center gap-2">
                                <div className="w-3"></div> {/* Indent space */}
                                <div className="flex items-center">
                                  <div className="border-t border-accent w-4 h-0 mr-2"></div>
                                  <FolderIcon className="h-4 w-4 text-amber-400" />
                                </div>
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
                          <div className="py-3 px-6 text-center text-muted-foreground text-sm italic ml-4 border-l-2 border-l-accent">
                            <div className="flex items-center justify-center gap-2 my-2">
                              <FolderPlus className="h-4 w-4 text-muted-foreground/70" />
                              <span>No subfolders yet. Click "Add Subfolder" to create one.</span>
                            </div>
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

      {/* Bulk Delete Confirmation Dialog */}
      <Dialog open={isBulkDeleteDialogOpen} onOpenChange={setIsBulkDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirm Bulk Deletion</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>Are you sure you want to delete these questions? This action cannot be undone.</p>
          </div>
          <div className="flex justify-end gap-3">
            <Button 
              variant="outline" 
              onClick={() => setIsBulkDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive"
              onClick={handleBulkDelete}
            >
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
} 