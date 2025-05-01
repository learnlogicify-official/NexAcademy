"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription, DialogClose } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Trash2, Code, ChevronRight, ChevronDown, Folder, FolderOpen, Copy, CheckCheck, 
  Search, X, Globe, Cpu, Binary, Smartphone, ListFilter, FileCode, FileEdit, Type, BarChart, Hash, CheckCircle, Terminal, FileText } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { CodeEditor } from "@/components/ui/code-editor";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import React from "react";
import { Switch } from "@/components/ui/switch";
import { AlertCircle, XCircle } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useJudge0Languages } from '../hooks/useJudge0Languages';
import { Badge } from "@/components/ui/badge";
import { Maximize2, Minimize2 } from "lucide-react";
import { Editor } from '@tinymce/tinymce-react';
import type { Editor as TinyMCEEditor } from 'tinymce';

interface Folder {
  id: string;
  name: string;
  parentId: string | null;
  subfolders?: Folder[];
}

interface CodingQuestionFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  initialData?: any;
  folders: Folder[];
  onAddFolder: () => void;
}

interface TestCase {
  id: string;
  input: string;
  output: string;
  type: "sample" | "hidden";
  gradePercentage: number;
  showOnFailure: boolean;
  isSample?: boolean;
  isHidden?: boolean;
  grade?: number;
}

interface LanguageOption {
  id: string;
  language: string;
  solution: string;
  preloadCode: string;
}

interface FormData {
  name: string;
  folderId: string;
  questionText: string;
  difficulty: string;
  defaultMark: number;
  languageOptions: LanguageOption[];
  testCases: TestCase[];
  status: string;
}

// Judge0 language IDs mapping
const JUDGE0_LANGUAGE_IDS = {
  python: 71, // Python 3.8.1
  javascript: 63, // JavaScript (Node.js 12.14.0)
  java: 62, // Java JDK 11.0.4
  cpp: 54, // C++ GCC 9.2.0
  csharp: 51, // C# Mono 6.6.0.161
  php: 68, // PHP 7.4.1
  ruby: 72, // Ruby 2.7.0
  swift: 83, // Swift 5.2.3
  go: 60, // Go 1.13.5
  rust: 73, // Rust 1.40.0
};

interface TestCaseValidationResult {
  testCaseId: string;
  isMatch: boolean;
  actualOutput: string;
  executionTime: number;
  memoryUsage: number;
  error?: string;
}

// Create a debug-safe fetch function
const safeFetch = async (url: string, options: RequestInit) => {
  
  
  try {
    const response = await fetch(url, options);
    
    
    if (!response.ok) {
      const text = await response.text();
    
      throw new Error(`Request failed with status ${response.status}: ${text}`);
    }
    
    const data = await response.json();
  
    return data;
  } catch (error) {
    
    throw error;
  }
};

// Direct test function to test our server API
const testApi = async () => {
  try {
    
    const testResponse = await fetch("/api/judge0");
    
    if (!testResponse.ok) {
      
      alert(`API connection failed with status ${testResponse.status}`);
      return;
    }
    
    const testData = await testResponse.json();
    
    const simpleCode = `
print("Hello from Judge0!")
print("This is a test")
for i in range(3):
    print(f"Count: {i}")
`;
    
    try {
    
      
      const executeResponse = await fetch("/api/judge0", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          language_id: 71, // Python 3.8.1
          source_code: simpleCode,
          stdin: ""
        })
      });
      
      if (!executeResponse.ok) {
        console.error("❌ Execution request failed:", executeResponse.status);
        const errorData = await executeResponse.json();
        console.error("Error details:", errorData);
        alert(`Execution failed: ${errorData.error || "Unknown error"}`);
        return;
      }
      
      const executeData = await executeResponse.json();
      
      
      const output = executeData.data?.stdout || "No output";
     
      
      // Step 3: Test with input
     
      const inputCode = `
name = input()
age = int(input())
print(f"Hello {name}, you are {age} years old!")
`;
      const stdin = "Alice\n25";
      
      const inputResponse = await fetch("/api/judge0", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          language_id: 71, // Python 3.8.1
          source_code: inputCode,
          stdin: stdin
        })
      });
      
      if (!inputResponse.ok) {
        console.error("❌ Input test failed:", inputResponse.status);
        const errorData = await inputResponse.json();
        console.error("Error details:", errorData);
        alert(`Input test failed: ${errorData.error || "Unknown error"}`);
        return;
      }
      
      const inputData = await inputResponse.json();
    
      
      alert(`Tests completed successfully!\n\nSimple test output: ${output}\n\nInput test output: ${inputData.data?.stdout || "No output"}`);
      
    } catch (error) {
      console.error("❌ Execution error:", error);
      alert(`Execution failed with error: ${error instanceof Error ? error.message : String(error)}`);
    }
    
  } catch (error) {
    console.error("❌ Test sequence failed:", error);
    alert(`Test sequence failed with error: ${error instanceof Error ? error.message : String(error)}`);
  } finally {
    
  }
};

// Update the ValidationResultsModal component
const ValidationResultsModal = ({
  isOpen,
  onClose,
  results,
  testCases,
  onCopyOutput,
}: {
  isOpen: boolean;
  onClose: () => void;
  results: TestCaseValidationResult[];
  testCases: TestCase[];
  onCopyOutput: (testCaseId: string, actualOutput: string) => void;
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Test Case Validation Results</DialogTitle>
          <DialogDescription>
            Results of validating your test cases against the solution code
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">Status</TableHead>
                <TableHead>Input</TableHead>
                <TableHead>Expected Output</TableHead>
                <TableHead>Actual Output</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {results.map((result, index) => {
                const testCase = testCases.find(tc => tc.id === result.testCaseId);
                return (
                  <TableRow key={result.testCaseId}>
                    <TableCell>
                      <div className={`w-3 h-3 rounded-full ${result.isMatch ? 'bg-green-500' : 'bg-red-500'}`} />
                    </TableCell>
                    <TableCell>
                      <div className="p-2 bg-muted rounded-md font-mono text-sm whitespace-pre-wrap">
                        {testCase?.input}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="p-2 bg-muted rounded-md font-mono text-sm whitespace-pre-wrap">
                        {testCase?.output}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="p-2 bg-muted rounded-md font-mono text-sm whitespace-pre-wrap">
                        {result.actualOutput}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        type="button"
                        onClick={() => onCopyOutput(result.testCaseId, result.actualOutput)}
                        className="w-full"
                      >
                        Copy Output
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>

          {/* Show any errors in a separate section */}
          {results.some(r => r.error) && (
            <div className="mt-4">
              <h3 className="text-lg font-medium mb-2">Errors</h3>
              {results.map((result, index) => {
                if (!result.error) return null;
                return (
                  <div key={result.testCaseId} className="p-3 bg-destructive/10 text-destructive rounded-md mb-2">
                    <div className="font-medium">Test Case {index + 1}</div>
                    <div className="font-mono text-sm whitespace-pre-wrap mt-1">
                      {result.error}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        <DialogFooter>
          <Button 
            variant="outline" 
            type="button"
            onClick={onClose}
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export function CodingQuestionFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  folders,
  onAddFolder,
}: CodingQuestionFormModalProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState<FormData>({
    name: "",
    folderId: "",
    questionText: "",
    difficulty: "MEDIUM",
    defaultMark: 1,
    languageOptions: [],
    testCases: [],
    status: "DRAFT",
  });

  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [activeLanguageTab, setActiveLanguageTab] = useState<string>("");
  const [allOrNothingGrading, setAllOrNothingGrading] = useState(false);
  const [defaultLanguage, setDefaultLanguage] = useState<string>("");
  const [isValidating, setIsValidating] = useState(false);
  const [validationResults, setValidationResults] = useState<TestCaseValidationResult[]>([]);
  const [validationDialogOpen, setValidationDialogOpen] = useState(false);
  const [showValidationResults, setShowValidationResults] = useState(false);
  const [copiedTestCases, setCopiedTestCases] = useState<Set<string>>(new Set());
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Add a ref for the editor
  const editorRef = useRef<any>(null);
  
  // Add state for dark/light mode
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  
  // Detect dark mode
  useEffect(() => {
    // Check if the user prefers dark mode
    const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    // Check if we have a .dark class on the html element
    const htmlIsDark = document.documentElement.classList.contains('dark');
    
    // Set the dark mode state
    setIsDarkMode(prefersDarkMode || htmlIsDark);
    
    // Listen for changes in the color scheme preference
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      setIsDarkMode(e.matches || document.documentElement.classList.contains('dark'));
    };
    
    mediaQuery.addEventListener('change', handleChange);
    
    // Listen for changes in the HTML class
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          setIsDarkMode(
            window.matchMedia('(prefers-color-scheme: dark)').matches || 
            document.documentElement.classList.contains('dark')
          );
        }
      });
    });
    
    observer.observe(document.documentElement, { attributes: true });
    
    return () => {
      mediaQuery.removeEventListener('change', handleChange);
      observer.disconnect();
    };
  }, []);
  
  // Update TinyMCE theme when dark mode changes
  useEffect(() => {
    // If the editor is initialized and the mode changes, update the theme
    if (editorRef.current) {
      // Get the container element
      const container = editorRef.current.getContainer();
      
      // Remove old theme classes
      container.classList.remove('tox-tinymce-dark', 'tox-tinymce-light');
      
      // Add the appropriate theme class
      container.classList.add(isDarkMode ? 'tox-tinymce-dark' : 'tox-tinymce-light');
      
      // Update content area style
      const contentArea = editorRef.current.getDoc().body;
      contentArea.style.backgroundColor = isDarkMode ? '#1e293b' : '#ffffff';
      contentArea.style.color = isDarkMode ? '#e2e8f0' : '#1e293b';
    }
  }, [isDarkMode]);

  // Focus TinyMCE editor when modal opens
  useEffect(() => {
    if (isOpen && editorRef.current) {
      // Short delay to ensure the editor is fully initialized
      setTimeout(() => {
        editorRef.current.focus();
      }, 100);
    }
  }, [isOpen]);

  // Add a debug function to check specific language options
  const inspectLanguageOption = (langId: string) => {
    const option = formData.languageOptions.find(opt => opt.language === langId);
    
    return option;
  };

  // Get correct programming language for code editor
  const getEditorLanguage = (langId: string): string => {
    // Make sure we have a string value
    const langIdStr = String(langId).toLowerCase();
    console.log(`Getting editor language for: ${langIdStr}`);
    
    // First check if this is a numeric Judge0 language ID
    if (!isNaN(Number(langIdStr))) {
      // Map common Judge0 language IDs to editor modes
      switch(langIdStr) {
        case "4": return "javascript"; // Node.js
        case "11": return "python";    // Python 3
        case "10": return "python";    // Python 2
        case "26": return "python";    // Python 3.6
        case "71": return "python";    // Python 3.8
        case "29": return "java";      // Java
        case "54": return "cpp";       // C++
        case "55": return "java";      // Java
        case "56": return "php";       // PHP
      default: 
          console.warn(`Unknown Judge0 language ID: ${langIdStr}, falling back to plaintext`);
          return "plaintext";
      }
    }
    
    // Otherwise try to map by language name
    if (langIdStr.includes('python')) return 'python';
    if (langIdStr.includes('javascript') || langIdStr === 'js') return 'javascript';
    if (langIdStr.includes('java')) return 'java';
    if (langIdStr.includes('c++') || langIdStr.includes('cpp')) return 'cpp';
    if (langIdStr.includes('php')) return 'php';
    
    // For any other languages, log a warning and fall back to plaintext
    console.warn(`Unsupported language: ${langIdStr}, falling back to plaintext mode`);
        return 'plaintext';
  };
  
  // Debug function to check if language is correctly detected
  const checkLanguageSupport = (langId: string) => {
    const editorLang = getEditorLanguage(langId);
    
    return editorLang;
  };

  // Use useEffect to initialize the form data when initialData changes
  useEffect(() => {
    console.log("CODING FORM MODAL - Initial data received:", JSON.stringify(initialData, null, 2));
    
    if (initialData) {
      console.log("CODING FORM MODAL - Setting form values from initialData");
      
      // Set basic form data
      console.log("CODING FORM MODAL - Setting base properties");
      console.log("CODING FORM MODAL - Name:", initialData.name);
      console.log("CODING FORM MODAL - FolderId:", initialData.folderId);
      console.log("CODING FORM MODAL - Question Text:", initialData.questionText ? (initialData.questionText.length > 100 ? initialData.questionText.substring(0, 100) + '...' : initialData.questionText) : '');
      console.log("CODING FORM MODAL - Difficulty:", initialData.difficulty);
      console.log("CODING FORM MODAL - Default Mark:", initialData.defaultMark);
      console.log("CODING FORM MODAL - Status:", initialData.status);
      
      setFormData(prevData => ({
        ...prevData,
        id: initialData.id || '',
        name: initialData.name || '',
        folderId: initialData.folderId || '',
        questionText: initialData.questionText || '',
        difficulty: initialData.difficulty || 'MEDIUM',
        defaultMark: initialData.defaultMark || 1,
        status: initialData.status || 'DRAFT',
      }));
      
      // Set language options
      if (initialData.languageOptions && Array.isArray(initialData.languageOptions)) {
        console.log("CODING FORM MODAL - Setting language options (direct):", 
          JSON.stringify(initialData.languageOptions, null, 2));
        
        setFormData(prevData => ({
          ...prevData,
          languageOptions: initialData.languageOptions.map((lang: any) => ({
            id: lang.id || `lang-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
            language: lang.language,
            solution: lang.solution || '',
            preloadCode: lang.preloadCode || ''
          }))
        }));
        
        // Set selected languages
        const langs = initialData.languageOptions.map((lang: any) => lang.language);
        console.log("CODING FORM MODAL - Selected languages:", langs);
        setSelectedLanguages(langs);
        
        // Set default language
        const defaultLang = initialData.defaultLanguage && langs.includes(initialData.defaultLanguage)
          ? initialData.defaultLanguage
          : (langs.length > 0 ? langs[0] : "");
        console.log("CODING FORM MODAL - Default language:", defaultLang);
        setDefaultLanguage(defaultLang);
        
        // Set active language tab
        if (langs.length > 0) {
          console.log("CODING FORM MODAL - Setting active language tab:", langs[0]);
          setActiveLanguageTab(langs[0]);
        }
      } else if (initialData.codingQuestion?.languageOptions && Array.isArray(initialData.codingQuestion.languageOptions)) {
        console.log("CODING FORM MODAL - Setting language options (from codingQuestion):", 
          JSON.stringify(initialData.codingQuestion.languageOptions, null, 2));
        
        setFormData(prevData => ({
          ...prevData,
          languageOptions: initialData.codingQuestion.languageOptions.map((lang: any) => ({
            id: lang.id || `lang-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
            language: lang.language,
            solution: lang.solution || '',
            preloadCode: lang.preloadCode || ''
          }))
        }));
        
        // Set selected languages
        const langs = initialData.codingQuestion.languageOptions.map((lang: any) => lang.language);
        console.log("CODING FORM MODAL - Selected languages (from codingQuestion):", langs);
        setSelectedLanguages(langs);
        
        // Set default language
        const defaultLang = initialData.codingQuestion.defaultLanguage && langs.includes(initialData.codingQuestion.defaultLanguage)
          ? initialData.codingQuestion.defaultLanguage
          : (langs.length > 0 ? langs[0] : "");
        console.log("CODING FORM MODAL - Default language (from codingQuestion):", defaultLang);
        setDefaultLanguage(defaultLang);
        
        // Set active language tab
        if (langs.length > 0) {
          console.log("CODING FORM MODAL - Setting active language tab:", langs[0]);
          setActiveLanguageTab(langs[0]);
        }
      } else {
        console.log("CODING FORM MODAL - No language options found");
      }
      
      // Set test cases
      if (initialData.testCases && Array.isArray(initialData.testCases)) {
        console.log("CODING FORM MODAL - Setting test cases (direct):", 
          JSON.stringify(initialData.testCases.map((tc: any) => ({
            id: tc.id,
            input: tc.input,
            output: tc.output,
            isHidden: tc.isHidden,
            isSample: tc.isSample,
            type: tc.type
          })), null, 2));
       
        setFormData(prevData => ({
          ...prevData,
          testCases: initialData.testCases.map((tc: any) => {
            // Determine type and flags based on available data
            let type = tc.type || '';
            let isSample = tc.isSample === true;
            let isHidden = tc.isHidden === true;
            // Ensure showOnFailure is properly initialized as a boolean
            let showOnFailure = tc.showOnFailure === true;
            
            // If type is specified, use it to set flags
            if (type === 'sample') {
              isSample = true;
              isHidden = false;
            } else if (type === 'hidden') {
              isSample = false;
              isHidden = true;
            } 
            // Otherwise, use flags to determine type
            else if (isSample) {
              type = 'sample';
            } else if (isHidden) {
              type = 'hidden';
            } else {
              // Default to hidden if neither is specified
              type = 'hidden';
              isHidden = true;
            }
            
            return {
              id: tc.id || `tc-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
              input: tc.input || '',
              output: tc.output || '',
              isHidden,
              isSample,
              type,
              gradePercentage: tc.gradePercentage || 0,
              showOnFailure
            };
          })
        }));
      } else if (initialData.codingQuestion?.testCases && Array.isArray(initialData.codingQuestion.testCases)) {
        console.log("CODING FORM MODAL - Setting test cases (from codingQuestion):", 
          JSON.stringify(initialData.codingQuestion.testCases.map((tc: any) => ({
            id: tc.id,
            input: tc.input,
            output: tc.output,
            isHidden: tc.isHidden,
            isSample: tc.isSample,
            type: tc.type
          })), null, 2));
        
        setFormData(prevData => ({
          ...prevData,
          testCases: initialData.codingQuestion.testCases.map((tc: any) => {
            // Determine type and flags based on available data
            let type = tc.type || '';
            let isSample = tc.isSample === true;
            let isHidden = tc.isHidden === true;
            // Ensure showOnFailure is properly initialized as a boolean
            let showOnFailure = tc.showOnFailure === true;
            
            // If type is specified, use it to set flags
            if (type === 'sample') {
              isSample = true;
              isHidden = false;
            } else if (type === 'hidden') {
              isSample = false;
              isHidden = true;
            } 
            // Otherwise, use flags to determine type
            else if (isSample) {
              type = 'sample';
            } else if (isHidden) {
              type = 'hidden';
            } else {
              // Default to hidden if neither is specified
              type = 'hidden';
              isHidden = true;
            }
            
            return {
              id: tc.id || `tc-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
              input: tc.input || '',
              output: tc.output || '',
              isHidden,
              isSample,
              type,
              gradePercentage: tc.gradePercentage || 0,
              showOnFailure
            };
          })
        }));
      } else {
        console.log("CODING FORM MODAL - No test cases found");
      }
      
      // Set all-or-nothing grading
      const useAllOrNothing = initialData.allOrNothingGrading === true || initialData.codingQuestion?.isAllOrNothing === true;
      console.log("CODING FORM MODAL - All or nothing grading:", useAllOrNothing);
      setAllOrNothingGrading(useAllOrNothing);
      
      // Set default language again from possible alternatives
      const finalDefaultLang = 
        initialData.defaultLanguage || 
        initialData.codingQuestion?.defaultLanguage || 
        (selectedLanguages.length > 0 ? selectedLanguages[0] : "");
      console.log("CODING FORM MODAL - Final default language:", finalDefaultLang);
      if (finalDefaultLang) {
        setDefaultLanguage(finalDefaultLang);
      }
      
      // Log the final form state
      setTimeout(() => {
        console.log("CODING FORM MODAL - Final form state:", {
          formData: JSON.stringify(formData, null, 2),
          selectedLanguages,
          activeLanguageTab,
          defaultLanguage,
          allOrNothingGrading
        });
      }, 500);
    }
  }, [initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      // Use a more robust data preparation
      const codingQuestion = prepareCodingQuestionData();
      // Perform final validation check on structure
      const structureErrors = validateDataStructure(codingQuestion);
      if (structureErrors.length > 0) {
        toast({
          title: "Data Structure Error",
          description: (
            <div className="space-y-1">
              {structureErrors.map((msg, index) => (
                <div key={index} className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>{msg}</span>
                </div>
              ))}
            </div>
          ),
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }
      // Await the onSubmit call and only close on success
      await onSubmit(codingQuestion);
      toast({
        title: "Success",
        description: initialData ? "Coding question updated successfully" : "Coding question created successfully",
      });
      setIsSubmitting(false);
      onClose();
    } catch (error) {
      console.error("Error in form submission:", error);
      toast({
        title: "Error",
        description: initialData ? "Failed to update question" : "Failed to create question",
        variant: "destructive",
      });
      setIsSubmitting(false);
      // Do not close the modal
    }
  };

  // Helper function to validate the data structure before sending to API
  const validateDataStructure = (data: any): string[] => {
    const errors: string[] = [];
    
    // Check for proper nesting and required fields
    if (!data.name) errors.push("Missing question name");
    if (!data.folderId) errors.push("Missing folder ID");
    if (!data.questionText) errors.push("Missing question text");
    
    // Validate language options structure
    if (!Array.isArray(data.languageOptions) || data.languageOptions.length === 0) {
      errors.push("Language options must be a non-empty array");
    } else {
      data.languageOptions.forEach((lang: any, index: number) => {
        if (!lang.language) errors.push(`Language option ${index + 1} missing language identifier`);
      });
    }
    
    // Validate test cases structure
    if (!Array.isArray(data.testCases) || data.testCases.length === 0) {
      errors.push("Test cases must be a non-empty array");
    } else {
      data.testCases.forEach((tc: any, index: number) => {
        if (tc.showOnFailure === undefined) errors.push(`Test case ${index + 1} missing showOnFailure property`);
        if (tc.isSample === undefined) errors.push(`Test case ${index + 1} missing isSample property`);
        if (tc.isHidden === undefined) errors.push(`Test case ${index + 1} missing isHidden property`);
        if (tc.input === undefined) errors.push(`Test case ${index + 1} missing input property`);
        if (tc.output === undefined) errors.push(`Test case ${index + 1} missing output property`);
      });
    }
    
    return errors;
  };

  // Helper function to prepare the coding question data in the right format
  const prepareCodingQuestionData = () => {
    // Deduplicate language options
    const uniqueLanguages = new Map<string, LanguageOption>();
    formData.languageOptions.forEach(option => {
      if (selectedLanguages.includes(option.language)) {
        uniqueLanguages.set(option.language, {
          ...option,
          language: option.language,
          id: option.id || `lang-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
        });
      }
    });
    
    const languageOptions = Array.from(uniqueLanguages.values());
    
    // Prepare test cases with proper types
    const testCases = formData.testCases.map(testCase => {
      const type = testCase.type || 'hidden';
      const isSample = type === 'sample' || testCase.isSample === true;
      const isHidden = type === 'hidden' || testCase.isHidden === true;
      const showOnFailure = !!testCase.showOnFailure;
      
      return {
        id: testCase.id || `tc-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        input: String(testCase.input),
        output: String(testCase.output),
        expectedOutput: String(testCase.output), // Always send both fields
        type,
        isSample,
        isHidden,
        showOnFailure,
        gradePercentage: testCase.gradePercentage
      };
    });
    
    // Create the properly structured data
    return {
      id: initialData?.id,
      name: formData.name,
      folderId: formData.folderId,
      type: "CODING",
      difficulty: formData.difficulty,
      defaultMark: formData.defaultMark,
      questionText: formData.questionText,
      defaultLanguage,
      languageOptions,
      testCases,
      allOrNothingGrading,
      status: formData.status,
      version: initialData?.version || 1,
      // Include separately packaged codingQuestion for compatibility
      codingQuestion: {
        languageOptions,
        testCases,
        isAllOrNothing: allOrNothingGrading,
        defaultLanguage
      }
    };
  };

  // Replace the old prepareSubmissionData with this better version
  const prepareSubmissionData = prepareCodingQuestionData;

  const handleLanguageSelect = (languageId: string) => {
    
    
    if (selectedLanguages.includes(languageId)) {
      // If removing a language, remove it from selected and remove its options
   
      setSelectedLanguages(prev => prev.filter(lang => lang !== languageId));
      setFormData(prev => ({
        ...prev,
        languageOptions: prev.languageOptions.filter(opt => opt.language !== languageId)
      }));
      
      // If removing the default language, reset it or set to first available
      if (defaultLanguage === languageId) {
        const remaining = selectedLanguages.filter(lang => lang !== languageId);
        const newDefault = remaining.length > 0 ? remaining[0] : "";
        
        setDefaultLanguage(newDefault);
        
        // If we removed the active tab, switch to another one
        if (activeLanguageTab === languageId) {
          setActiveLanguageTab(remaining.length > 0 ? remaining[0] : "");
        }
      }
    } else {
      // If adding a language, add it to selected and create new language option
     
      setSelectedLanguages(prev => [...prev, languageId]);
      
      // Create a new language option with unique ID - use the exact languageId as language
      const newLanguageOption = {
        id: `lang-${languageId}-${Date.now()}`,
        language: languageId, // This is the key - using exact languageId, not a modified version
        solution: "",
        preloadCode: ""
      };
      
      
      setFormData(prev => ({
        ...prev,
        languageOptions: [...prev.languageOptions, newLanguageOption]
      }));
      
      // Set this as active tab
      setActiveLanguageTab(languageId);
      
      // If default language isn't set, set this as default
      if (!defaultLanguage) {
        
        setDefaultLanguage(languageId);
      }
    }
  };

  const getLanguageName = (uniqueId: string) => {
    const baseLanguage = uniqueId.split('-')[0];
    return languages.find(l => String(l.id) === baseLanguage)?.name || baseLanguage;
  };

  const getLanguageOption = (langId: string) => {
    // Find the exact language option
    return formData.languageOptions.find(opt => opt.language === langId);
  };

  const updateLanguageOption = (langId: string, field: 'solution' | 'preloadCode', value: string) => {
    
    
    setFormData(prev => ({
      ...prev,
      languageOptions: prev.languageOptions.map(opt => 
        opt.language === langId ? { ...opt, [field]: value } : opt
      )
    }));
  };

  const addTestCase = () => {
    
    
    // Create a test case with explicit boolean values
    const newTestCase: TestCase = {
      id: `tc-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      input: "",
      output: "",
      type: "sample", // Default to sample for new test cases
      isSample: true, // Set the flags explicitly as true boolean
      isHidden: false, // Set the flags explicitly as false boolean
      gradePercentage: 0,
      showOnFailure: false // Set to explicit boolean false
    };
    
   
    setFormData(prev => ({
      ...prev,
      testCases: [...prev.testCases, newTestCase]
    }));
  };

  const removeTestCase = (id: string) => {
    setFormData(prev => ({
      ...prev,
      testCases: prev.testCases.filter(testCase => testCase.id !== id)
    }));
  };

  const updateTestCase = (id: string, field: keyof TestCase, value: any) => {
  
    // Ensure boolean fields are set correctly
    if (field === 'showOnFailure' || field === 'isSample' || field === 'isHidden') {
      // Convert to explicit boolean
      value = value === true;
    }
    
    setFormData(prev => ({
      ...prev,
      testCases: prev.testCases.map(testCase =>
        testCase.id === id ? { ...testCase, [field]: value } : testCase
      )
    }));
  };

  const updateTestCaseShowOnFailure = (id: string, value: boolean) => {
    
    // Force it to be a strict boolean true or false
    const boolValue = value === true;
   
    setFormData(prev => {
      // Create a new test cases array with the updated value
      const updatedTestCases = prev.testCases.map(testCase => {
        if (testCase.id === id) {
          
          
          // Create a new test case object with the updated showOnFailure value
          const updated = {
            ...testCase,
            showOnFailure: boolValue
          };
          
          
          
          return updated;
        }
        return testCase;
      });
      
      // Return a new form data object with the updated test cases
      return {
        ...prev,
        testCases: updatedTestCases
      };
    });
  };

  // Add effect to update grade distribution when a test case type changes
  useEffect(() => {
    if (allOrNothingGrading) {
      distributeGradesEvenly();
    }
  }, [allOrNothingGrading, formData.testCases.length]);
  
  // Ensure the 'handleTestCaseTypeChange' function correctly updates the test case type
  const handleTestCaseTypeChange = (id: string, type: "sample" | "hidden") => {

    
    // Get the current test case to preserve its showOnFailure value
    const currentTestCase = formData.testCases.find(tc => tc.id === id);
    const currentShowOnFailure = currentTestCase?.showOnFailure === true;
    
   
    // Update the test case type
    updateTestCase(id, "type", type);
    
    // Also update the isSample and isHidden flags to match the type
    if (type === "sample") {
      updateTestCase(id, "isSample", true);
      updateTestCase(id, "isHidden", false);
      updateTestCase(id, "gradePercentage", 0);
      
      // If in all-or-nothing mode, redistribute grades among remaining hidden tests
      if (allOrNothingGrading) {
        setTimeout(() => distributeGradesEvenly(), 0);
      }
    } 
    else if (type === "hidden") {
      updateTestCase(id, "isSample", false);
      updateTestCase(id, "isHidden", true);
      
      // If in all-or-nothing mode, redistribute all grades
      if (allOrNothingGrading) {
        setTimeout(() => distributeGradesEvenly(), 0);
      }
    }
    
    // Make sure the showOnFailure value is preserved
    updateTestCase(id, "showOnFailure", currentShowOnFailure);
  };

  // Add handler to set the default language
  const handleSetDefaultLanguage = (languageId: string) => {
    setDefaultLanguage(languageId);
  };

  // Add a dedicated click handler for the validate button
  const handleValidateClick = () => {
    
    
    // Check if we have the minimum requirements
    if (!defaultLanguage) {
      toast({
        title: "Default language not set",
        description: "Please select a default language",
        variant: "destructive",
      });
      return;
    }

    if (formData.testCases.length === 0) {
      toast({
        title: "No test cases",
        description: "Please add at least one test case",
        variant: "destructive",
      });
      return;
    }

    // Start validation immediately
    validateTestCases();
  };

  // Update the validateTestCases function to include 500 error handling
  const validateTestCases = async () => {
    
    // Check if default language is set
    if (!defaultLanguage) {
      toast({
        title: "Default language not set",
        description: "Please select a default language",
        variant: "destructive",
      });
      return;
    }

    // Get the Judge0 language ID first
    const languageId = JUDGE0_LANGUAGE_IDS[defaultLanguage.toLowerCase() as keyof typeof JUDGE0_LANGUAGE_IDS];
    if (!languageId) {
      toast({
        title: "Unsupported Language",
        description: `Language ${defaultLanguage} is not supported by Judge0`,
        variant: "destructive",
      });
      return;
    }

    // Check if there's a solution for the default language
    const languageOption = formData.languageOptions.find(opt => opt.language === defaultLanguage);
    if (!languageOption) {
      toast({
        title: "Language option not found",
        description: `No configuration found for ${languages.find(l => String(l.id) === defaultLanguage)?.name}`,
        variant: "destructive",
      });
      return;
    }

    // Check if there are test cases
    if (formData.testCases.length === 0) {
      toast({
        title: "No test cases",
        description: "Please add at least one test case",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsValidating(true);
      setValidationResults([]);
      
     
      // Process each test case
      const results: TestCaseValidationResult[] = [];
      
      // Create a submission for each test case with delays
      for (const testCase of formData.testCases) {
        try {
         
          // Add a delay between test cases to prevent rate limiting
          if (results.length > 0) {
            await new Promise(resolve => setTimeout(resolve, 2000));
          }
          
          // Prepare the request body
          const requestBody = {
            language_id: languageId,
            source_code: languageOption.solution || "",
            stdin: testCase.input || ""
          };

          
          
          // Use our server-side API instead of direct Judge0 calls
          const response = await fetch("/api/judge0", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(requestBody)
          });
          
          if (!response.ok) {
            const errorData = await response.json();
            console.error("Validation error:", errorData);
            
            // Handle specific error status codes
            if (response.status === 429) {
              toast({
                title: "Rate Limit Exceeded",
                description: "Please wait a few seconds before trying again",
                variant: "destructive",
              });
              break;
            } else if (response.status === 500) {
              toast({
                title: "Server Error",
                description: "The Judge0 API is experiencing server errors. Please try again later.",
                variant: "destructive",
              });
              console.error("Judge0 server error:", errorData);
              break;
            } else if (response.status === 401) {
              toast({
                title: "Authentication Error",
                description: "API key is missing or invalid. Check your environment variables.",
                variant: "destructive",
              });
              break;
            }
            
            throw new Error(errorData.error || `Execution failed with status ${response.status}`);
          }
          
          const responseData = await response.json();
          const data = responseData.data;
          
       
          
          // Process the result
          const actualOutput = data.stdout?.trim() || "";
          const expectedOutput = testCase.output.trim();
          const isMatch = actualOutput === expectedOutput;
          
          results.push({
            testCaseId: testCase.id,
            isMatch,
            actualOutput,
            executionTime: data.time || 0,
            memoryUsage: data.memory || 0,
            error: data.stderr || data.compile_output || undefined
          });
        } catch (error) {
          console.error("Error validating test case:", error);
          
          // Add a more detailed error message to the results
          results.push({
            testCaseId: testCase.id,
            isMatch: false,
            actualOutput: "",
            executionTime: 0,
            memoryUsage: 0,
            error: error instanceof Error 
              ? `Error: ${error.message}` 
              : "Unknown error occurred during validation"
          });
          
          // Show a toast for individual test case errors, but don't break the whole process
          toast({
            title: "Test Case Error",
            description: `Error in test case ${results.length + 1}: ${error instanceof Error ? error.message : "Unknown error"}`,
            variant: "destructive",
          });
        }
      }
      
      // Update validation results and show the modal
      setValidationResults(results);
      setValidationDialogOpen(true);
      
      // Show summary toast
      const passedCount = results.filter(r => r.isMatch).length;
      const totalCount = results.length;
      toast({
        title: "Validation Complete",
        description: `${passedCount} of ${totalCount} test cases passed`,
        variant: passedCount === totalCount ? "default" : "destructive",
      });
    } catch (error) {
      console.error("Error in validation:", error);
      toast({
        title: "Validation Error",
        description: error instanceof Error ? error.message : "Failed to validate test cases",
        variant: "destructive",
      });
    } finally {
      setIsValidating(false);
    }
  };

  // Add the copy output function
  const copyOutputToExpected = (testCaseId: string, actualOutput: string) => {
    // Update the form data with the new expected output
    setFormData(prev => ({
      ...prev,
      testCases: prev.testCases.map(tc => 
        tc.id === testCaseId ? { ...tc, output: actualOutput } : tc
      )
    }));

    // Show success indicator
    setCopiedTestCases(prev => {
      const newSet = new Set(prev);
      newSet.add(testCaseId);
      return newSet;
    });

    // Remove success indicator after 2 seconds
    setTimeout(() => {
      setCopiedTestCases(prev => {
        const newSet = new Set(prev);
        newSet.delete(testCaseId);
        return newSet;
      });
    }, 2000);

    toast({
      title: "Output Copied",
      description: "Actual output copied to expected output",
    });
  };

  // Function to distribute grades evenly among the hidden test cases
  const distributeGradesEvenly = () => {
    if (!allOrNothingGrading) return;
    
    setFormData(prev => {
      // Get all hidden test cases
      const hiddenTestCases = prev.testCases.filter(tc => 
        tc.type === "hidden" || tc.isHidden === true
      );
      
      // Calculate even grade distribution
      const totalHiddenTests = hiddenTestCases.length;
      const evenGrade = totalHiddenTests > 0 ? Math.round(100 / totalHiddenTests * 10) / 10 : 0;
      
      // Update all test cases with appropriate grades
      const updatedTestCases = prev.testCases.map(tc => {
        // Sample test cases get 0, hidden test cases get even distribution
        if (tc.type === "sample" || tc.isSample === true) {
          return { ...tc, gradePercentage: 0 };
        } else {
          return { ...tc, gradePercentage: evenGrade };
        }
      });
      
      return {
        ...prev,
        testCases: updatedTestCases
      };
    });
  };

  // Enhanced version of logFormData to better diagnose issues
  const logFormData = () => {
    
    
    // Check each language option in detail
    if (selectedLanguages.length > 0) {
     
      selectedLanguages.forEach(langId => {
        const option = getLanguageOption(langId);
        const editorLang = getEditorLanguage(langId);
        
      });
    }
  };

  // Improved function to add all 10 languages at once
  const addAllLanguages = () => {
    const allLangIds = languages.map(lang => String(lang.id));
    
    
    // Keep existing language options to preserve solutions and preload code
    const currentOptions = new Map<string, LanguageOption>();
    formData.languageOptions.forEach(opt => {
      currentOptions.set(opt.language, opt);
    });
    
    // Create language options for all supported languages
    const newLangOptions: LanguageOption[] = [];
    
    // For each supported language
    for (const langId of allLangIds) {
      // Use the exact language ID from languages
      const exactLangId = langId;
      
      // If we already have this language, keep its existing data
      if (currentOptions.has(exactLangId)) {
        newLangOptions.push(currentOptions.get(exactLangId)!);
      } else {
        // Otherwise create a new empty option - with exact language ID
        newLangOptions.push({
          id: `lang-${exactLangId}-${Date.now()}`,
          language: exactLangId, // Using exact language ID is crucial
          solution: "",
          preloadCode: ""
        });
      }
    }
    
   
    // Update state
    setSelectedLanguages(allLangIds);
    
    // Keep the current active tab if it exists, otherwise use the first language
    if (!allLangIds.includes(activeLanguageTab)) {
      setActiveLanguageTab(allLangIds[0] || '');
    }
    
    // Keep the current default language if it exists, otherwise use the first language
    if (!allLangIds.includes(defaultLanguage)) {
      setDefaultLanguage(allLangIds[0] || '');
    }
    
  
    setFormData(prev => ({
      ...prev,
      languageOptions: newLangOptions
    }));
  };

  const { languages, loading, error } = useJudge0Languages();

  // Add these state hooks below other useState declarations around line 375
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['popular']));

  // Add this helper function after the updateTestCase function
  // Around line 1400

  // Add a helper function to categorize languages
  const getLanguageCategories = () => {
    if (!languages || languages.length === 0) return {};
    
    // Define category mappings
    const categories: Record<string, { name: string, languages: any[] }> = {
      popular: { name: 'Popular Languages', languages: [] },
      web: { name: 'Web Development', languages: [] },
      systems: { name: 'Systems Programming', languages: [] },
      scripting: { name: 'Scripting Languages', languages: [] },
      functional: { name: 'Functional Languages', languages: [] },
      mobile: { name: 'Mobile Development', languages: [] },
      other: { name: 'Other Languages', languages: [] },
    };
    
    // Define popular language IDs
    const popularIDs = ["71", "63", "62", "54", "51", "68", "60", "73"];
    
    // Define primary category mapping for each language ID
    // Each language ID should only appear once as a key
    const languageCategories: Record<string, string> = {
      // Popular languages will be added separately using popularIDs
      
      // Web development (JS, PHP, Ruby, etc.)
      "4": "web", // Node.js
      "56": "web", // PHP
      "72": "web", // Ruby
      "76": "web", // HTML
      
      // Systems programming (C, C++, Rust, etc.)
      "50": "systems", // C
      "53": "systems", // C
      "73": "systems", // Rust
      "81": "systems", // Assembly
      
      // Scripting languages (Python, Perl, etc.)
      "43": "scripting", // Bash
      "41": "scripting", // Perl
      "74": "scripting", // TypeScript
      
      // Functional languages (Haskell, etc.)
      "45": "functional", // Haskell
      "47": "functional", // Scala
      "66": "functional", // Lisp
      "44": "functional", // Clojure
      
      // Mobile development (Swift, etc.)
      "83": "mobile", // Swift
      "78": "mobile", // Kotlin
      "79": "mobile" // Objective-C
    };
    
    // Assign primary languages to categories
    // Python (71), JavaScript (63), Java (62), C++ (54), C# (51), PHP (68), Go (60), Rust (73)
    languageCategories["71"] = "scripting";   // Python
    languageCategories["63"] = "web";         // JavaScript
    languageCategories["62"] = "mobile";      // Java (also used for Android)
    languageCategories["54"] = "systems";     // C++
    languageCategories["51"] = "systems";     // C#
    languageCategories["68"] = "web";         // PHP
    languageCategories["60"] = "systems";     // Go
    languageCategories["73"] = "systems";     // Rust
    
    // Filter languages based on search term
    const filteredLanguages = searchTerm.trim() === '' 
      ? languages
      : languages.filter(lang => 
          lang.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
    
    // Populate categories
    filteredLanguages.forEach(lang => {
      const langId = String(lang.id);
      const category = languageCategories[langId] || "other";
      
      // Add to mapped category
      if (categories[category]) {
        categories[category].languages.push(lang);
      } else {
        categories.other.languages.push(lang);
      }
      
      // Also add to popular if it's in the popularIDs array
      if (popularIDs.includes(langId)) {
        // Only add to popular category if not already there
        if (!categories.popular.languages.some(l => String(l.id) === langId)) {
          categories.popular.languages.push(lang);
        }
      }
    });
    
    // Filter out empty categories
    const nonEmptyCategories: Record<string, { name: string, languages: any[] }> = {};
    Object.entries(categories).forEach(([key, category]) => {
      if (category.languages.length > 0) {
        nonEmptyCategories[key] = category;
      }
    });
    
    return nonEmptyCategories;
  };

  // Add toggle function for expanding/collapsing categories
  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  };

  // Label modern style
  const labelClass = "block text-[1.08rem] font-semibold tracking-wide text-foreground/90 mb-1 transition-colors duration-200 group-focus-within:text-primary";
  // Input/Textarea modern style
  const inputClass = "rounded-xl shadow-sm border border-primary/20 focus:ring-2 focus:ring-primary/40 bg-gradient-to-br from-background/80 to-muted/40 px-4 py-2 text-base font-medium transition-all duration-200 placeholder:text-muted-foreground/60 focus:border-primary/50 focus:bg-background/90";
  // SelectTrigger modern style
  const selectTriggerClass = "rounded-xl shadow-sm border border-primary/20 focus:ring-2 focus:ring-primary/40 bg-gradient-to-br from-background/80 to-muted/40 px-4 py-2 text-base font-medium transition-all duration-200 hover:border-primary/40 focus:border-primary/60";

  // Add this effect inside CodingQuestionFormModal
  useEffect(() => {
    function handleWheel(e: Event) {
      const event = e as WheelEvent;
      const menu = (event.target as HTMLElement)?.closest('.tox-menu.tox-collection--list') as HTMLElement | null;
      if (menu) {
        // Calculate if the menu can scroll
        const atTop = menu.scrollTop === 0;
        const atBottom = menu.scrollHeight - menu.scrollTop === menu.clientHeight;
        if (
          (event.deltaY < 0 && atTop) ||
          (event.deltaY > 0 && atBottom)
        ) {
          // If at the edge, let the event bubble (to allow parent scroll)
          return;
        }
        // Otherwise, scroll the menu and prevent default
        menu.scrollTop += event.deltaY;
        event.preventDefault();
      }
    }
    document.addEventListener('wheel', handleWheel, { passive: false } as AddEventListenerOptions);
    return () => {
      document.removeEventListener('wheel', handleWheel, { passive: false } as AddEventListenerOptions);
    };
  }, []);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="max-w-[90vw] max-h-[95vh] overflow-hidden rounded-2xl shadow-2xl border-0 p-0"
        onInteractOutside={event => {
          // Prevent modal close if clicking on TinyMCE menu or popup
          if (
            event.target instanceof HTMLElement &&
            (event.target.closest('.tox-tinymce-aux') || event.target.closest('.tox-menu'))
          ) {
            event.preventDefault();
          }
        }}
      >
        <DialogClose className="absolute right-4 top-4 rounded-full opacity-80 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 z-50">
          <X className="h-5 w-5" />
          <span className="sr-only">Close</span>
        </DialogClose>
        <DialogHeader>
          <DialogTitle>
            <span className="sr-only">{initialData ? "Update Coding Question" : "Create New Coding Question"}</span>
          </DialogTitle>
        </DialogHeader>
        {/* Enhanced Modern Header */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary via-blue-600 to-indigo-700 opacity-90"></div>
          {/* Removed the decorative SVG X background */}
          <div className="relative z-10 flex items-center gap-5 px-8 pt-8 pb-6">
            <div className="flex-shrink-0 flex h-14 w-14 items-center justify-center rounded-full bg-white/10 shadow-lg text-white">
              <Code className="h-7 w-7 text-white drop-shadow-md" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-white drop-shadow-md flex items-center gap-2 transform transition-all">
                {initialData ? "Update Coding Question" : "Create New Coding Question"}
                <span className="inline-block animate-pulse bg-green-400 w-2 h-2 rounded-full ml-2"></span>
              </h2>
              <DialogDescription className="text-white/90 mt-1 text-base font-normal max-w-3xl">
                {initialData 
                  ? "Update your coding question with the necessary information, language options, and test cases."
                  : "Create a new coding question by providing details, setting up programming languages, and adding test cases."}
              </DialogDescription>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-background/80 to-transparent z-10"></div>
        </div>
        {/* End Enhanced Modern Header */}
        <form onSubmit={handleSubmit} className="space-y-6 max-h-[calc(95vh-170px)] overflow-y-auto pr-2 pb-4 relative px-8 pt-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2 bg-white/60 dark:bg-background/60 rounded-2xl border border-primary/10 shadow-sm p-5">
              <Label htmlFor="name" className={cn(labelClass, formErrors.name && "text-destructive")}>
                <div className="flex items-center gap-2">
                  <Type className="h-4 w-4 text-primary/80" /> 
                Question Name {formErrors.name && <span className="text-destructive text-sm">*</span>}
                </div>
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter question name"
                className={cn(inputClass, formErrors.name && "border-destructive")}
                required
              />
              {formErrors.name && (
                <p className="text-destructive text-sm">{formErrors.name}</p>
              )}
            </div>
            <div className="space-y-2 bg-white/60 dark:bg-background/60 rounded-2xl border border-primary/10 shadow-sm p-5">
              <Label htmlFor="folder" className={cn(labelClass, formErrors.folderId && "text-destructive")}>
                <div className="flex items-center gap-2">
                  <Folder className="h-4 w-4 text-primary/80" />
                Folder {formErrors.folderId && <span className="text-destructive text-sm">*</span>}
                </div>
              </Label>
              <Select
                value={formData.folderId}
                onValueChange={(value) => setFormData(prev => ({ ...prev, folderId: value }))}
              >
                <SelectTrigger className={cn(selectTriggerClass, formErrors.folderId && "border-destructive")}> 
                  <SelectValue placeholder="Select folder">
                    {(() => {
                      // Recursively find the folder/subfolder path for display
                      function findFolderPath(folders: Folder[], id: string): string | null {
                        for (const folder of folders) {
                          if (folder.id === id) return folder.name;
                          if (folder.subfolders) {
                            const sub = folder.subfolders.find(sub => sub.id === id);
                            if (sub) return `${folder.name} / ${sub.name}`;
                          }
                        }
                        return null;
                      }
                      return findFolderPath(folders, formData.folderId) || "Select a folder";
                    })()}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="rounded-xl border border-primary/10 shadow-lg max-h-72 overflow-y-auto">
                  {(() => {
                    // Recursive rendering function with proper typing
                    const renderFolderTree = (folders: Folder[], level = 0): React.ReactNode[] => {
                      return folders.flatMap(folder => {
                        const items: React.ReactNode[] = [
                          <SelectItem 
                            key={folder.id} 
                            value={folder.id} 
                            className={cn(
                              "flex items-center gap-2 py-2.5 px-2 hover:bg-primary/5 rounded-md transition-colors",
                              level > 0 && `pl-${2 + level * 4}`
                            )}
                          >
                            <div className="flex items-center gap-2 truncate w-full">
                              {level > 0 && (
                                <span className="inline-block w-[8px] h-[1px] bg-muted-foreground/50"></span>
                              )}
                              <Folder className={cn(
                                "h-4 w-4 flex-shrink-0",
                                level === 0 ? "text-primary" : "text-muted-foreground"
                              )} />
                              <span className={cn(
                                "truncate",
                                level === 0 ? "font-medium" : "text-sm"
                              )}>
                                {folder.name}
                              </span>
                            </div>
                          </SelectItem>
                        ];
                        if (folder.subfolders && folder.subfolders.length > 0) {
                          items.push(...renderFolderTree(folder.subfolders as Folder[], level + 1));
                        }
                        return items;
                      });
                    };
                    return renderFolderTree(folders);
                  })()}
                </SelectContent>
              </Select>
              {formErrors.folderId && (
                <p className="text-destructive text-sm">{formErrors.folderId}</p>
              )}
            </div>
          </div>

          {/* TinyMCE Editor Section - with z-index fix */}
          <div className="space-y-2 bg-white/60 dark:bg-background/60 rounded-2xl border border-primary/10 shadow-sm p-5">
            <Label htmlFor="questionText" className={cn(labelClass, formErrors.questionText && "text-destructive")}>
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary/80" />
              Question Text {formErrors.questionText && <span className="text-destructive text-sm">*</span>}
              </div>
            </Label>
            <div 
              className={cn(
                "min-h-[250px] border rounded-xl overflow-hidden shadow-inner transition-all",
                formErrors.questionText ? "border-destructive" : "border-primary/10"
              )}
            >
              <Editor
                apiKey={process.env.NEXT_PUBLIC_TINYMCE_API_KEY}
              value={formData.questionText}
                onInit={(_evt: unknown, editor: TinyMCEEditor) => { editorRef.current = editor; }}
                onEditorChange={(content: string) => setFormData(prev => ({ ...prev, questionText: content }))}
                init={{
                  menubar: true,
                  plugins: [
                    'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview', 'anchor',
                    'searchreplace', 'visualblocks', 'code',
                    'insertdatetime', 'media', 'table', 'code', 'help', 'wordcount'
                  ],
                  toolbar:
                    'undo redo | formatselect | bold italic backcolor | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | removeformat | help',
                  skin: isDarkMode ? 'oxide-dark' : 'oxide',
                  content_css: isDarkMode ? 'dark' : 'default',
                  z_index: 999999,
                  popup_container: 'body',
                  fixed_toolbar_container: 'body',
                  inline: false,
                  promotion: false,
                  branding: false,
                  relative_urls: false,
                  remove_script_host: false,
                  document_base_url: typeof window !== 'undefined' ? window.location.origin : '',
                  browser_spellcheck: true,
                  object_resizing: false,
                  contextmenu: false,
                  statusbar: false,
                  elementpath: false,
                  resize: false,
                  content_style: `
                    body { background: ${isDarkMode ? '#1e293b' : '#fff'}; color: ${isDarkMode ? '#e2e8f0' : '#1e293b'}; }
                    table td, table th { border: 1px solid #3f3f46; padding: 0.5em; }
                  `,
                }}
              />
            </div>
            {formErrors.questionText && (
              <p className="text-destructive text-sm">{formErrors.questionText}</p>
            )}
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2 bg-white/60 dark:bg-background/60 rounded-2xl border border-primary/10 shadow-sm p-5">
              <Label htmlFor="difficulty" className={labelClass}>
                <div className="flex items-center gap-2">
                  <BarChart className="h-4 w-4 text-primary/80" />
                  Difficulty
                </div>
              </Label>
              <Select
                value={formData.difficulty}
                onValueChange={(value) => setFormData(prev => ({ ...prev, difficulty: value }))}
              >
                <SelectTrigger className={selectTriggerClass}>
                  <SelectValue placeholder="Select difficulty" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border border-primary/10 shadow-lg">
                  <SelectItem value="EASY" className="hover:bg-green-50 dark:hover:bg-green-900/20 cursor-pointer">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-green-500"></span> Easy
                    </div>
                  </SelectItem>
                  <SelectItem value="MEDIUM" className="hover:bg-yellow-50 dark:hover:bg-yellow-900/20 cursor-pointer">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-yellow-500"></span> Medium
                    </div>
                  </SelectItem>
                  <SelectItem value="HARD" className="hover:bg-red-50 dark:hover:bg-red-900/20 cursor-pointer">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-red-500"></span> Hard
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 bg-white/60 dark:bg-background/60 rounded-2xl border border-primary/10 shadow-sm p-5">
              <Label htmlFor="status" className={labelClass}>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary/80" />
                  Status
                </div>
              </Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}
              >
                <SelectTrigger className={selectTriggerClass}>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border border-primary/10 shadow-lg">
                  <SelectItem value="DRAFT" className="hover:bg-blue-50 dark:hover:bg-blue-900/20 cursor-pointer">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-blue-500"></span> Draft
                    </div>
                  </SelectItem>
                  <SelectItem value="READY" className="hover:bg-green-50 dark:hover:bg-green-900/20 cursor-pointer">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-green-500"></span> Ready
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 bg-white/60 dark:bg-background/60 rounded-2xl border border-primary/10 shadow-sm p-5">
              <Label htmlFor="defaultMark" className={labelClass}>
                <div className="flex items-center gap-2">
                  <Hash className="h-4 w-4 text-primary/80" />
                  Default Mark
          </div>
              </Label>
              <Input
                id="defaultMark"
                type="number"
                value={formData.defaultMark}
                onChange={(e) => setFormData(prev => ({ ...prev, defaultMark: Number(e.target.value) }))}
                min="0"
                step="0.5"
                className={inputClass}
                required
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Label
                className={formErrors.languageOptions ? "text-destructive" : ""}
              >
                Programming Languages{" "}
                {formErrors.languageOptions && (
                  <span className="text-destructive text-sm">*</span>
                )}
              </Label>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addAllLanguages}
                  className="mr-2"
                >
                  Add All Languages
                </Button>
                <Label
                  htmlFor="defaultLanguage"
                  className={cn(
                    "text-sm",
                    formErrors.defaultLanguage ? "text-destructive" : ""
                  )}
                >
                  Default Language:{" "}
                  {formErrors.defaultLanguage && (
                    <span className="text-destructive text-sm">*</span>
                  )}
                </Label>
                <Select
                  value={defaultLanguage}
                  onValueChange={handleSetDefaultLanguage}
                  disabled={selectedLanguages.length === 0}
                >
                  <SelectTrigger
                    className={cn(
                      "w-[180px]",
                      formErrors.defaultLanguage ? "border-destructive" : ""
                    )}
                  >
                    <SelectValue placeholder="Select default" />
                  </SelectTrigger>
                  <SelectContent>
                    {selectedLanguages.map((langId) => (
                      <SelectItem key={langId} value={langId}>
                        {languages.find((l) => String(l.id) === langId)?.name ||
                          langId}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            {formErrors.languageOptions && (
              <p className="text-destructive text-sm">
                {formErrors.languageOptions}
              </p>
            )}
            {formErrors.defaultLanguage && (
              <p className="text-destructive text-sm">
                {formErrors.defaultLanguage}
              </p>
            )}
            <div className="border rounded-lg overflow-hidden">
              {/* Language Selection Panel - Redesigned with flat list */}
              <div className="flex flex-col md:flex-row border-b">
                {/* Search Panel */}
                <div className="w-full md:w-1/3 border-r p-3">
                  <div className="mb-4">
                    <div className="relative">
                      <Input
                        type="search"
                        placeholder="Search languages..."
                        className="w-full pl-9"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                      <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      {searchTerm && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="absolute right-1 top-1 h-7 w-7 p-0"
                          onClick={() => setSearchTerm("")}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>

                  <div className="max-h-[350px] overflow-y-auto pr-2">
                    {/* Filter languages based on search term */}
                    <div className="space-y-1">
                      {languages
                        .filter(
                          (lang) =>
                            searchTerm.trim() === "" ||
                            lang.name
                              .toLowerCase()
                              .includes(searchTerm.toLowerCase())
                        )
                        .map((lang) => (
                          <div
                            key={lang.id}
                            className={cn(
                              "flex items-center justify-between px-3 py-2 cursor-pointer rounded-md transition-colors",
                              selectedLanguages.includes(String(lang.id))
                                ? "bg-primary/10 text-primary shadow-sm"
                                : "hover:bg-accent"
                            )}
                            onClick={() =>
                              handleLanguageSelect(String(lang.id))
                            }
                          >
                            <div className="flex items-center gap-2 truncate">
                              <Code className="h-4 w-4 opacity-80" />
                              <span className="truncate font-medium text-sm">
                                {lang.name}
                              </span>
                            </div>
                            <div className="flex items-center">
                              {selectedLanguages.includes(String(lang.id)) ? (
                                <CheckCheck className="h-4 w-4 text-primary" />
                              ) : (
                                <Plus className="h-4 w-4 opacity-60" />
                              )}
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>

                {/* Selected Languages - Improved UI */}
                <div className="w-full md:w-2/3 p-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-medium flex items-center gap-2">
                      <Terminal className="h-4 w-4 text-primary" />
                      Selected Languages
                      <Badge variant="outline" className="ml-1">
                        {selectedLanguages.length}
                      </Badge>
                    </h3>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={addAllLanguages}
                        className="text-xs"
                        disabled={languages.length === 0}
                      >
                        <Plus className="h-3.5 w-3.5 mr-1.5" />
                        Add All
                      </Button>

                      <Select
                        value={defaultLanguage}
                        onValueChange={handleSetDefaultLanguage}
                        disabled={selectedLanguages.length === 0}
                      >
                        <SelectTrigger
                          className={cn(
                            "w-[160px] h-8 text-xs",
                            formErrors.defaultLanguage
                              ? "border-destructive"
                              : ""
                          )}
                        >
                          <SelectValue placeholder="Default Language" />
                        </SelectTrigger>
                        <SelectContent>
                          {selectedLanguages.length > 0 &&
                            selectedLanguages.map((langId) => {
                              const lang = languages.find(
                                (l) => String(l.id) === langId
                              );
                              return (
                                <SelectItem key={langId} value={langId}>
                                  {lang?.name || langId}
                                </SelectItem>
                              );
                            })}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {selectedLanguages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-[300px] text-muted-foreground bg-muted/10 rounded-lg border border-dashed">
                      <Code className="h-12 w-12 mb-2 opacity-20" />
                      <p className="text-sm font-medium">
                        No languages selected
                      </p>
                      <p className="text-xs mt-1 max-w-[300px] text-center">
                        Select programming languages from the list on the left
                        or click "Add All" to include all available languages.
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSearchTerm("")}
                        className="mt-4"
                      >
                        Browse Languages
                      </Button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 max-h-[350px] overflow-y-auto pr-2">
                      {selectedLanguages.map((langId) => {
                        const language = languages.find(
                          (l) => String(l.id) === langId
                        );
                        const isDefaultLang = langId === defaultLanguage;

                        return (
                          <div
                            key={langId}
                            className={cn(
                              "group relative min-h-[110px] transition-all duration-200 overflow-hidden rounded-md flex flex-col box-border",
                              isDefaultLang
                                ? "bg-gradient-to-br from-primary/5 to-primary/10 shadow-md"
                                : "bg-card hover:shadow-md"
                            )}
                          >
                            {/* Card border with gradient effect */}
                            <div
                              className={cn(
                                "absolute inset-0 pointer-events-none border",
                                isDefaultLang
                                  ? "border-primary/40 shadow-sm"
                                  : "border-border group-hover:border-primary/20"
                              )}
                            />

                            {/* Subtle background pattern for depth */}
                            <div className="absolute inset-0 opacity-5 pointer-events-none bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px]" />

                            {/* Default badge */}
                            {isDefaultLang && (
                              <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-[10px] px-2 py-0.5 font-medium shadow-sm">
                                DEFAULT
                              </div>
                            )}

                            {/* Content container */}
                            <div className="relative h-full p-4 flex flex-col box-border">
                              <div className="flex flex-nowrap items-start gap-3 w-full box-border">
                                <div className="flex items-center flex-shrink-0 gap-3 box-border">
                                  {/* Icon with better styling */}
                                  <div
                                    className={cn(
                                      "flex items-center justify-center w-8 h-8 rounded-md shadow-sm",
                                      isDefaultLang
                                        ? "bg-primary/15 text-primary ring-1 ring-primary/20"
                                        : "bg-muted text-muted-foreground"
                                    )}
                                  >
                                    <FileCode className="h-4 w-4" />
                                  </div>

                                  {/* Language name and ID with better typography */}
                                  <div className="min-w-0 flex-1 w-full overflow-hidden box-border">
                                    <h4
                                      className={cn(
                                        "font-medium text-sm truncate block w-full min-w-0 box-border",
                                        isDefaultLang && "text-primary"
                                      )}
                                      title={language?.name || langId}
                                    >
                                      {language?.name || langId}
                                    </h4>
                                    <p className="text-[11px] text-muted-foreground mt-0.5 flex items-center gap-1 min-w-0 box-border">
                                      <code
                                        className="bg-muted/50 px-1 rounded text-[10px] font-mono truncate max-w-[60px] block min-w-0 box-border"
                                        title={langId}
                                      >
                                        {langId}
                                      </code>
                                    </p>
                                  </div>
                                </div>

                                {/* Remove button with improved positioning and styling */}
                                <div className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 box-border">
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6 rounded-full hover:bg-destructive/10 hover:text-destructive p-0"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleLanguageSelect(langId);
                                    }}
                                  >
                                    <X className="h-3.5 w-3.5" />
                                  </Button>
                                </div>
                              </div>

                              {/* Buttons with modernized styling */}
                              <div className="mt-auto pt-3 flex flex-wrap justify-end gap-2 box-border">
                                {!isDefaultLang && (
                                  <Button
                                    type="button"
                                    variant={
                                      isDefaultLang ? "default" : "secondary"
                                    }
                                    size="sm"
                                    className={cn(
                                      "h-7 px-3 text-xs justify-center rounded-md transition-colors",
                                      !isDefaultLang &&
                                        "bg-muted/70 hover:bg-primary/10 hover:text-primary"
                                    )}
                                    onClick={() =>
                                      handleSetDefaultLanguage(langId)
                                    }
                                  >
                                    <CheckCheck className="h-3 w-3 mr-1" />
                                    Set Default
                                  </Button>
                                )}
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  className="h-7 px-3 text-xs justify-center rounded-md border-muted-foreground/20 hover:bg-accent hover:border-accent"
                                  onClick={() => {
                                    setActiveLanguageTab(langId);
                                  }}
                                >
                                  <Code className="h-3 w-3 mr-1" />
                                  Edit Code
                                </Button>
                              </div>

                              {/* Subtle indicator dot for selected status */}
                              <div
                                className={cn(
                                  "absolute w-1.5 h-1.5 rounded-full top-4 left-4 z-10 box-border",
                                  isDefaultLang
                                    ? "bg-primary"
                                    : "bg-muted-foreground/40"
                                )}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {selectedLanguages.length > 0 && (
            <div className="mt-6 border rounded-lg overflow-hidden bg-card">
              {/* Enhanced header with modern design */}
              <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-primary/5 via-muted/40 to-background/80 rounded-t-lg shadow-sm border-b border-muted/40 relative">
                <div className="flex items-center gap-3">
                  <span className="inline-flex items-center justify-center rounded-full bg-primary/10 p-2">
                    <Terminal className="h-6 w-6 text-primary" />
                  </span>
                  <span className="text-lg font-semibold text-foreground tracking-tight flex items-center gap-2">
                    Code Editor
                    <span className="group relative">
                      <svg
                        className="h-4 w-4 text-muted-foreground cursor-pointer"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                      >
                        <circle cx="12" cy="12" r="10" />
                        <line x1="12" y1="16" x2="12" y2="12" />
                        <line x1="12" y1="8" x2="12.01" y2="8" />
                      </svg>
                      <span className="absolute left-1/2 -translate-x-1/2 mt-2 w-max min-w-[180px] bg-background border border-muted-foreground/10 text-xs text-muted-foreground rounded-md shadow-lg px-3 py-2 opacity-0 group-hover:opacity-100 pointer-events-none z-20 transition-opacity">
                        This editor lets you define the solution and starter
                        code for each selected language. Use the dropdown to
                        switch languages.
                      </span>
                    </span>
                  </span>
                  {activeLanguageTab &&
                    languages.find(
                      (l) => String(l.id) === activeLanguageTab
                    ) && (
                      <div className="flex items-center gap-1.5 ml-3 text-muted-foreground text-xs bg-muted/40 px-2 py-0.5 rounded">
                        <span className="font-medium text-foreground">
                          {languages.find(
                            (l) => String(l.id) === activeLanguageTab
                          )?.name || ""}
                        </span>
                        {activeLanguageTab === defaultLanguage && (
                          <Badge
                            variant="outline"
                            className="text-[10px] bg-primary/10 border-primary/20 text-primary font-normal h-4 py-0 ml-1"
                          >
                            default
                          </Badge>
                        )}
                      </div>
                    )}
                </div>
                {/* Language selector dropdown, visually integrated */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground font-medium mr-1 hidden sm:inline">
                    Language:
                  </span>
                  <Select
                    value={activeLanguageTab}
                    onValueChange={setActiveLanguageTab}
                  >
                    <SelectTrigger className="min-w-[160px] h-9 bg-background/95 border shadow rounded-lg hover:shadow-md transition-all flex items-center gap-2 px-3">
                      <Code className="h-4 w-4 text-primary" />
                      <SelectValue placeholder="Select language">
                        {languages.find(
                          (l) => String(l.id) === activeLanguageTab
                        )?.name || "Select language"}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent className="shadow-md border-primary/10 rounded-md overflow-hidden">
                      <div className="px-1 py-1 border-b bg-muted/30">
                        <p className="text-xs text-muted-foreground px-2 py-1">
                          {selectedLanguages.length} languages selected
                        </p>
                      </div>
                      <div className="max-h-[250px] overflow-y-auto p-1">
                        {selectedLanguages.map((langId) => {
                          const lang = languages.find(
                            (l) => String(l.id) === langId
                          );
                          const isDefault = langId === defaultLanguage;
                          return (
                            <SelectItem
                              key={langId}
                              value={langId}
                              className={cn(
                                "flex items-center cursor-pointer rounded-md pl-2 pr-8 py-1.5 relative transition-colors",
                                activeLanguageTab === langId
                                  ? "bg-primary/10"
                                  : "hover:bg-accent",
                                isDefault &&
                                  "border-l-2 border-primary pl-[7px]"
                              )}
                            >
                              <div className="flex items-center gap-2 w-full">
                                <Code
                                  className={cn(
                                    "h-3.5 w-3.5",
                                    isDefault
                                      ? "text-primary"
                                      : "text-muted-foreground"
                                  )}
                                />
                                <span>{lang?.name || langId}</span>
                                {isDefault && (
                                  <Badge
                                    variant="outline"
                                    className="ml-auto text-[10px] bg-primary/10 text-primary"
                                  >
                                    default
                                  </Badge>
                                )}
                              </div>
                            </SelectItem>
                          );
                        })}
                      </div>
                      <div className="p-1 border-t bg-muted/30 flex">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full h-7 text-xs justify-center mt-0.5"
                          onClick={() => {
                            if (activeLanguageTab !== defaultLanguage) {
                              handleSetDefaultLanguage(activeLanguageTab);
                            }
                          }}
                          disabled={activeLanguageTab === defaultLanguage}
                        >
                          <CheckCheck className="h-3.5 w-3.5 mr-1.5" />
                          Set as Default
                        </Button>
                      </div>
                    </SelectContent>
                  </Select>
                </div>
                {/* Subtle shadow divider at bottom of header */}
                <div className="absolute left-0 right-0 bottom-0 h-[2px] bg-gradient-to-r from-transparent via-muted/40 to-transparent pointer-events-none" />
              </div>
              {/* End enhanced header, rest of code editor UI remains unchanged */}
              <div className="relative">
                <Tabs value={activeLanguageTab} className="w-full">
                  {selectedLanguages.map((langId) => {
                    const langOption = getLanguageOption(langId);
                    const langName =
                      languages.find((l) => String(l.id) === langId)?.name ||
                      langId;

                    return (
                      <TabsContent
                        key={langId}
                        value={langId}
                        className="p-0 border-0 mt-0"
                      >
                        <Tabs defaultValue="solution" className="w-full">
                          <div className="flex items-center px-4 py-2 bg-card border-b">
                            <TabsList className="bg-muted/30 p-0.5 h-auto rounded-md">
                              <TabsTrigger
                                value="solution"
                                className="data-[state=active]:bg-background text-xs py-1 h-7 px-3 rounded-sm transition-all"
                              >
                                <FileCode className="h-3.5 w-3.5 mr-1.5" />
                                Solution Code
                              </TabsTrigger>
                              <TabsTrigger
                                value="preload"
                                className="data-[state=active]:bg-background text-xs py-1 h-7 px-3 rounded-sm transition-all"
                              >
                                <FileEdit className="h-3.5 w-3.5 mr-1.5" />
                                Preload Code
                              </TabsTrigger>
                            </TabsList>
                          </div>

                          <TabsContent
                            value="solution"
                            className="mt-0 p-0 border-0"
                          >
                            <div className="p-4">
                              <div className="mb-3">
                                <h4 className="text-sm font-medium mb-1 text-foreground">
                                  Solution Code
                                </h4>
                                <p className="text-xs text-muted-foreground">
                                  Write the correct solution that will be used
                                  to validate test cases.
                                </p>
                              </div>
                              <div className="relative overflow-hidden border shadow-sm bg-background transition-all hover:shadow-md focus-within:border-primary/30 focus-within:ring-1 focus-within:ring-primary/20">
                                <div className="absolute top-0 right-0 bg-muted/20 px-3 py-1 text-[10px] text-muted-foreground border-l border-b rounded-bl-md z-10">
                                  {langName}
                                </div>
                                <CodeEditor
                                  value={langOption?.solution || ""}
                                  onChange={(value) =>
                                    updateLanguageOption(
                                      langId,
                                      "solution",
                                      value
                                    )
                                  }
                                  language={
                                    getEditorLanguage(langId) || "javascript"
                                  }
                                  placeholder={`Enter ${langName} solution code`}
                                  className="overflow-hidden"
                                  height="320px"
                                />
                              </div>
                            </div>
                          </TabsContent>

                          <TabsContent
                            value="preload"
                            className="mt-0 p-0 border-0"
                          >
                            <div className="p-4">
                              <div className="mb-3">
                                <h4 className="text-sm font-medium mb-1 text-foreground">
                                  Preload Code
                                </h4>
                                <p className="text-xs text-muted-foreground">
                                  Write starter code that will be shown to
                                  students when they begin solving the problem.
                                </p>
                              </div>
                              <div className="relative overflow-hidden border shadow-sm bg-background transition-all hover:shadow-md focus-within:border-primary/30 focus-within:ring-1 focus-within:ring-primary/20">
                                <div className="absolute top-0 right-0 bg-muted/20 px-3 py-1 text-[10px] text-muted-foreground border-l border-b rounded-bl-md z-10">
                                  {langName}
                                </div>
                                <CodeEditor
                                  value={langOption?.preloadCode || ""}
                                  onChange={(value) =>
                                    updateLanguageOption(
                                      langId,
                                      "preloadCode",
                                      value
                                    )
                                  }
                                  language={
                                    getEditorLanguage(langId) || "javascript"
                                  }
                                  placeholder={`Enter ${langName} preload code`}
                                  className="overflow-hidden"
                                  height="320px"
                                />
                              </div>
                            </div>
                          </TabsContent>
                        </Tabs>
                      </TabsContent>
                    );
                  })}
                </Tabs>
              </div>
            </div>
          )}

          {/* Test Cases */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Label className={formErrors.testCases ? "text-destructive" : ""}>
                Test Cases{" "}
                {formErrors.testCases && (
                  <span className="text-destructive text-sm">*</span>
                )}
              </Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={testApi}
                >
                  Test API
                </Button>
                <Button
                  variant="outline"
                  type="button"
                  onClick={handleValidateClick}
                  disabled={isValidating}
                  className="w-full"
                >
                  {isValidating ? <>Validating...</> : <>Validate Test Cases</>}
                </Button>
              </div>
            </div>
            {formErrors.testCases && (
              <p className="text-destructive text-sm">{formErrors.testCases}</p>
            )}

            <div className="flex items-center space-x-2 p-2 border rounded-md bg-muted/20">
              <Switch
                id="all-or-nothing"
                checked={allOrNothingGrading}
                onCheckedChange={(checked) => {
                  setAllOrNothingGrading(checked);
                  if (checked) {
                    distributeGradesEvenly();
                  }
                }}
              />
              <Label htmlFor="all-or-nothing">All or Nothing Grading</Label>
              <div className="ml-2 text-sm text-muted-foreground">
                {allOrNothingGrading
                  ? "Grades are distributed evenly. All tests must pass to get any points."
                  : "Each test case contributes its percentage to the total grade."}
              </div>
            </div>

            {formData.testCases.length > 0 && (
              <div
                className={cn(
                  "text-sm text-right mb-2",
                  formErrors.gradeDistribution ? "text-destructive" : ""
                )}
              >
                <span className="mr-4">
                  Sample test cases:{" "}
                  {
                    formData.testCases.filter((tc) => tc.type === "sample")
                      .length
                  }
                </span>
                <span className="mr-4">
                  Hidden test cases:{" "}
                  {
                    formData.testCases.filter((tc) => tc.type === "hidden")
                      .length
                  }
                </span>
                <span>
                  Total grading:{" "}
                  {formData.testCases.reduce(
                    (sum, testCase) => sum + testCase.gradePercentage,
                    0
                  )}
                  %
                  {formData.testCases.reduce(
                    (sum, testCase) => sum + testCase.gradePercentage,
                    0
                  ) !== 100 &&
                    !allOrNothingGrading && (
                      <span className="text-destructive ml-2">
                        (Should equal 100%)
                      </span>
                    )}
                </span>
              </div>
            )}
            {formErrors.gradeDistribution && (
              <p className="text-destructive text-sm">
                {formErrors.gradeDistribution}
              </p>
            )}

            {formData.testCases.map((testCase, index) => {
              const testCaseInputError = formErrors[`testCase${index}Input`];
              const testCaseOutputError = formErrors[`testCase${index}Output`];
              const testCaseGradeError = formErrors[`testCase${index}Grade`];
              const hasError =
                testCaseInputError || testCaseOutputError || testCaseGradeError;

              return (
                <div
                  key={testCase.id}
                  className={cn(
                    "space-y-4 p-4 border rounded-lg",
                    hasError ? "border-destructive" : ""
                  )}
                >
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id={`sample-${testCase.id}`}
                          checked={testCase.type === "sample"}
                          onCheckedChange={(checked) =>
                            handleTestCaseTypeChange(
                              testCase.id,
                              checked ? "sample" : "hidden"
                            )
                          }
                        />
                        <Label htmlFor={`sample-${testCase.id}`}>Sample</Label>
                      </div>
                      <div className="flex items-center space-x-2 ml-4">
                        <Checkbox
                          id={`hidden-${testCase.id}`}
                          checked={testCase.type === "hidden"}
                          onCheckedChange={(checked) =>
                            handleTestCaseTypeChange(
                              testCase.id,
                              checked ? "hidden" : "sample"
                            )
                          }
                        />
                        <Label htmlFor={`hidden-${testCase.id}`}>Hidden</Label>
                      </div>
                      <div className="flex items-center space-x-2 ml-4">
                        <Checkbox
                          id={`show-on-failure-${testCase.id}`}
                          checked={!!testCase.showOnFailure}
                          onCheckedChange={(checked) => {
                            // Convert to boolean explicitly (true or false)
                            const boolValue = checked === true;

                            updateTestCaseShowOnFailure(testCase.id, boolValue);
                          }}
                        />
                        <Label htmlFor={`show-on-failure-${testCase.id}`}>
                          Show on failure
                        </Label>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      type="button"
                      onClick={() => removeTestCase(testCase.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Remove test case</span>
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label
                        className={testCaseInputError ? "text-destructive" : ""}
                      >
                        Input{" "}
                        {testCaseInputError && (
                          <span className="text-destructive text-sm">*</span>
                        )}
                      </Label>
                      <Textarea
                        value={testCase.input}
                        onChange={(e) =>
                          updateTestCase(testCase.id, "input", e.target.value)
                        }
                        placeholder="Enter test case input"
                        className={cn(
                          "min-h-[100px] font-mono",
                          testCaseInputError ? "border-destructive" : ""
                        )}
                      />
                      {testCaseInputError && (
                        <p className="text-destructive text-sm">
                          {testCaseInputError}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label
                        className={
                          testCaseOutputError ? "text-destructive" : ""
                        }
                      >
                        Expected Output{" "}
                        {testCaseOutputError && (
                          <span className="text-destructive text-sm">*</span>
                        )}
                      </Label>
                      <Textarea
                        value={testCase.output}
                        onChange={(e) =>
                          updateTestCase(testCase.id, "output", e.target.value)
                        }
                        placeholder="Enter expected output"
                        className={cn(
                          "min-h-[100px] font-mono",
                          testCaseOutputError ? "border-destructive" : ""
                        )}
                      />
                      {testCaseOutputError && (
                        <p className="text-destructive text-sm">
                          {testCaseOutputError}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label
                      className={testCaseGradeError ? "text-destructive" : ""}
                    >
                      Grade Percentage (0-100):{" "}
                      {testCaseGradeError && (
                        <span className="text-destructive text-sm">*</span>
                      )}
                    </Label>
                    <div className="flex items-center">
                      <Input
                        type="number"
                        value={testCase.gradePercentage}
                        onChange={(e) => {
                          if (allOrNothingGrading) return;
                          const value = Math.min(
                            100,
                            Math.max(0, parseInt(e.target.value) || 0)
                          );
                          updateTestCase(testCase.id, "gradePercentage", value);
                        }}
                        className={cn(
                          "w-24",
                          testCaseGradeError ? "border-destructive" : ""
                        )}
                        min={0}
                        max={100}
                        disabled={allOrNothingGrading}
                      />
                      <span className="ml-2">%</span>
                    </div>
                    {testCaseGradeError && (
                      <p className="text-destructive text-sm">
                        {testCaseGradeError}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Show validation summary */}
            {showValidationResults && validationResults.length > 0 && (
              <Card className="mt-4">
                <CardHeader className="py-3">
                  <CardTitle className="text-lg">Validation Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-4">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span>
                        {validationResults.filter((r) => r.isMatch).length}{" "}
                        passed
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <XCircle className="h-5 w-5 text-red-500" />
                      <span>
                        {validationResults.filter((r) => !r.isMatch).length}{" "}
                        failed
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Add Test Case Button */}
            <div className="flex justify-center mt-4">
              <Button
                type="button"
                onClick={addTestCase}
                className="w-full max-w-md"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Test Case
              </Button>
            </div>
          </div>

          {/* Enhanced Modern Footer - with no backdrop-blur */}
          <div className="relative pt-6 mt-8">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-muted-foreground/20 to-transparent"></div>
            <div className="flex flex-col sm:flex-row justify-end gap-3 py-4 bg-gradient-to-br from-background via-background/95 to-background/90 rounded-b-xl px-8 border border-muted/20 border-t-0 shadow-lg">
              <div className="flex-1 flex items-center">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <div className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-30"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </div>
                  <span className="hidden md:inline-block">
                    {initialData ? "Updating existing question" : "Creating new question"}
                  </span>
                  </div>
                </div>
              <div className="flex gap-3">
                <Button 
                  type="button" 
                  variant="outline" 
                  className="rounded-full px-6 py-2 font-medium border-2 border-muted-foreground/20 hover:border-primary/60 transition-all shadow-sm hover:shadow-md hover:bg-muted/50"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isValidating || isSubmitting}
                  className="rounded-full px-8 py-2 font-bold bg-gradient-to-r from-primary to-blue-500 text-white shadow-lg hover:shadow-xl hover:from-blue-600 hover:to-primary/90 transition-all duration-300 relative overflow-hidden group"
                >
                  <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-blue-400/20 via-transparent to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></span>
                  <span className="relative flex items-center">
                {isSubmitting ? (
                  <svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                  </svg>
                ) : initialData 
                      ? <><CheckCheck className="mr-2 h-4 w-4" /> Update Question</> 
                      : <><Plus className="mr-2 h-4 w-4" /> Create Question</>}
                  </span>
            </Button>
              </div>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 