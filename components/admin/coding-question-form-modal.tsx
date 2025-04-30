"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Trash2, Code, ChevronRight, ChevronDown, Folder, FolderOpen, Copy, CheckCheck } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Editor } from '@tinymce/tinymce-react';
import { CodeEditor } from "@/components/ui/code-editor";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import React from "react";
import { Switch } from "@/components/ui/switch";
import { AlertCircle, CheckCircle, XCircle, Terminal } from "lucide-react";
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

const SUPPORTED_LANGUAGES = [
  { id: "PYTHON", name: "Python" },
  { id: "JAVASCRIPT", name: "JavaScript" },
  { id: "JAVA", name: "Java" },
  { id: "CPP", name: "C++" },
  { id: "CSHARP", name: "C#" },
  { id: "PHP", name: "PHP" },
  { id: "RUBY", name: "Ruby" },
  { id: "SWIFT", name: "Swift" },
  { id: "GO", name: "Go" },
  { id: "RUST", name: "Rust" },
];

interface Folder {
  id: string;
  name: string;
  parentId: string | null;
  subfolders?: { id: string; name: string }[];
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

  // Add a debug function to check specific language options
  const inspectLanguageOption = (langId: string) => {
    const option = formData.languageOptions.find(opt => opt.language === langId);
    
    return option;
  };

  // Get correct programming language for code editor
  const getEditorLanguage = (langId: string): string => {
    // Convert to lowercase for case-insensitive matching
    const lowercaseLangId = langId.toLowerCase();
    
    // Map our language IDs to editor-supported language modes
    // This is critical to ensure syntax highlighting works correctly
    switch(lowercaseLangId) {
      case 'python': return 'python';
      case 'javascript': return 'javascript';
      case 'java': return 'java';
      case 'cpp': return 'cpp';
      case 'csharp': return 'csharp';
      case 'php': return 'php';
      case 'ruby': return 'ruby';
      case 'swift': return 'swift';
      case 'go': return 'go';
      case 'rust': return 'rust';
      default: 
        console.warn(`Unsupported language ID: ${langId}, falling back to plaintext`);
        return 'plaintext';
    }
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    
    // Clear previous errors
    setFormErrors({});
    
    // Initialize validation errors object
    const errors: Record<string, string> = {};
    let isValid = true;
    
    // Validate required fields
    if (!formData.name.trim()) {
      errors.name = 'Question name is required';
      isValid = false;
    }
    
    if (!formData.folderId) {
      errors.folderId = 'Folder is required';
      isValid = false;
    }
    
    if (!formData.questionText.trim()) {
      errors.questionText = 'Question text is required';
      isValid = false;
    }
    
    if (formData.languageOptions.length === 0) {
      errors.languageOptions = 'At least one programming language is required';
      isValid = false;
    }
    
    // Validate default language
    if (!defaultLanguage) {
      errors.defaultLanguage = 'Default language must be selected';
      isValid = false;
    }
    
    if (formData.testCases.length === 0) {
      errors.testCases = 'At least one test case is required';
      isValid = false;
    } else {
      // Validate each test case
      const invalidTestCases = formData.testCases.filter((tc, index) => {
        if (tc.input.trim() === '') {
          errors[`testCase${index}Input`] = `Test case ${index + 1} missing input`;
          return true;
        }
        if (tc.output.trim() === '') {
          errors[`testCase${index}Output`] = `Test case ${index + 1} missing expected output`;
          return true;
        }
        if (tc.gradePercentage < 0 || tc.gradePercentage > 100) {
          errors[`testCase${index}Grade`] = `Test case ${index + 1} has invalid grade (0-100)`;
          return true;
        }
        return false;
      });
      
      if (invalidTestCases.length > 0) {
        isValid = false;
      }
    }

    // Validate total grade percentage
    if (!allOrNothingGrading) {
      const totalGradePercentage = formData.testCases.reduce(
        (total, tc) => total + tc.gradePercentage, 
        0
      );
      
      if (Math.abs(totalGradePercentage - 100) > 0.01) {
        errors.gradeDistribution = `Total grade percentage is ${totalGradePercentage.toFixed(2)}%. It must equal 100%`;
        isValid = false;
      }
    }
    
    // Store form errors for UI display
    if (!isValid) {
     
      setFormErrors(errors);
      
      // Create a formatted error message
      const errorMessages = Object.values(errors);
      
      toast({
        title: "Validation Errors",
        description: (
          <div className="space-y-1">
            {errorMessages.map((msg, index) => (
              <div key={index} className="flex items-start">
                <span className="mr-2">•</span>
                <span>{msg}</span>
              </div>
            ))}
          </div>
        ),
        variant: "destructive",
      });
      return;
    }
    
    // If validation passes, create properly formatted submission data
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
        return;
      }
      
      // Call the onSubmit callback with the data
      onSubmit(codingQuestion);
      
      // Show success toast with appropriate message (don't close modal until we know it succeeded)
      toast({
        title: "Success",
        description: initialData ? "Coding question updated successfully" : "Coding question created successfully",
      });
      
      // Close the modal
      onClose();
    } catch (error) {
      console.error("Error in form submission:", error);
      toast({
        title: "Error",
        description: initialData ? "Failed to update question" : "Failed to create question",
        variant: "destructive",
      });
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
        input: testCase.input,
        output: testCase.output,
        type,
        isSample,
        isHidden,
        showOnFailure,
        gradePercentage: testCase.gradePercentage,
        grade: testCase.gradePercentage, // Include both for compatibility
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
    return SUPPORTED_LANGUAGES.find(l => l.id === baseLanguage)?.name || baseLanguage;
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
        description: `No configuration found for ${SUPPORTED_LANGUAGES.find(l => l.id === defaultLanguage)?.name}`,
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
    const allLangIds = SUPPORTED_LANGUAGES.map(lang => lang.id);
    
    
    // Keep existing language options to preserve solutions and preload code
    const currentOptions = new Map<string, LanguageOption>();
    formData.languageOptions.forEach(opt => {
      currentOptions.set(opt.language, opt);
    });
    
    // Create language options for all supported languages
    const newLangOptions: LanguageOption[] = [];
    
    // For each supported language
    for (const langId of allLangIds) {
      // Use the exact language ID from SUPPORTED_LANGUAGES
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
      setActiveLanguageTab(allLangIds[0]);
    }
    
    // Keep the current default language if it exists, otherwise use the first language
    if (!allLangIds.includes(defaultLanguage)) {
      setDefaultLanguage(allLangIds[0]);
    }
    
  
    setFormData(prev => ({
      ...prev,
      languageOptions: newLangOptions
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>{initialData ? "Update Coding Question" : "Create New Coding Question"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6 max-h-[calc(90vh-120px)] overflow-y-auto pr-2 pb-4 relative">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name" className={formErrors.name ? "text-destructive" : ""}>
                Question Name {formErrors.name && <span className="text-destructive text-sm">*</span>}
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter question name"
                className={cn(formErrors.name ? "border-destructive" : "")}
                required
              />
              {formErrors.name && (
                <p className="text-destructive text-sm">{formErrors.name}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="folder" className={formErrors.folderId ? "text-destructive" : ""}>
                Folder {formErrors.folderId && <span className="text-destructive text-sm">*</span>}
              </Label>
              <Select
                value={formData.folderId}
                onValueChange={(value) => setFormData(prev => ({ ...prev, folderId: value }))}
              >
                <SelectTrigger className={cn(formErrors.folderId ? "border-destructive" : "")}>
                  <SelectValue placeholder="Select folder">
                    {(() => {
                      // First try to find the subfolder
                      for (const folder of folders) {
                        if (folder.subfolders) {
                          const subfolder = folder.subfolders.find(sub => sub.id === formData.folderId);
                          if (subfolder) {
                            return `${folder.name} / ${subfolder.name}`;
                          }
                        }
                      }
                      // If not a subfolder, find the main folder
                      const folder = folders.find(f => f.id === formData.folderId);
                      return folder?.name || "Select a folder";
                    })()}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {folders.map((folder) => (
                    <div key={folder.id}>
                      <SelectItem value={folder.id} className="font-medium">
                        {folder.name}
                      </SelectItem>
                      {folder.subfolders?.map((subfolder) => (
                        <SelectItem 
                          key={subfolder.id} 
                          value={subfolder.id}
                          className="pl-6"
                        >
                          └─ {subfolder.name}
                        </SelectItem>
                      ))}
                    </div>
                  ))}
                </SelectContent>
              </Select>
              {formErrors.folderId && (
                <p className="text-destructive text-sm">{formErrors.folderId}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="questionText" className={formErrors.questionText ? "text-destructive" : ""}>
              Question Text {formErrors.questionText && <span className="text-destructive text-sm">*</span>}
            </Label>
            <div className={cn("min-h-[250px]", formErrors.questionText ? "border-destructive" : "")}>
              <Editor
                apiKey={process.env.NEXT_PUBLIC_TINYMCE_API_KEY}
                value={formData.questionText}
                onInit={(_, editor) => editorRef.current = editor}
                init={{
                  menubar: true,
                  plugins: [
                    'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview', 'anchor',
                    'searchreplace', 'visualblocks', 'code',
                    'insertdatetime', 'media', 'table', 'code', 'help', 'wordcount'
                  ],
                  toolbar:
                    'undo redo | formatselect | bold italic backcolor | \
                    alignleft aligncenter alignright alignjustify | \
                    bullist numlist outdent indent | removeformat | help',
                  skin: isDarkMode ? 'oxide-dark' : 'oxide',
                  content_css: isDarkMode ? 'dark' : 'default',
                  content_style: `
                    body { 
                      font-family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif; 
                      font-size: 16px;
                      line-height: 1.6;
                      ${isDarkMode ? 'color: #e2e8f0;' : 'color: #1e293b;'} 
                    }
                    p { margin: 0 0 1em 0; }
                    h1, h2, h3, h4, h5, h6 { 
                      margin-top: 1.5em; 
                      margin-bottom: 0.5em; 
                      line-height: 1.3;
                      font-weight: 600;
                    }
                    h1 { font-size: 1.8em; }
                    h2 { font-size: 1.5em; }
                    h3 { font-size: 1.3em; }
                    h4 { font-size: 1.2em; }
                    ul, ol { 
                      margin-bottom: 1em;
                      padding-left: 1.5em;
                    }
                    li { margin-bottom: 0.5em; }
                    img {
                      max-width: 100%;
                      height: auto;
                    }
                    blockquote {
                      margin-left: 0;
                      padding-left: 1em;
                      border-left: 3px solid ${isDarkMode ? '#64748b' : '#94a3b8'};
                      font-style: italic;
                    }
                    pre {
                      background-color: ${isDarkMode ? '#1e293b' : '#f1f5f9'};
                      border-radius: 0.25rem;
                      padding: 1em;
                      white-space: pre-wrap;
                    }
                    table {
                      border-collapse: collapse;
                      width: 100%;
                    }
                    table td, table th {
                      border: 1px solid ${isDarkMode ? '#3f3f46' : '#e2e8f0'};
                      padding: 0.5em;
                    }
                  `,
                  height: 300,
                  min_height: 250,
                  resize: false,
                  branding: false,
                  promote: false
                }}
                onEditorChange={(content) => setFormData(prev => ({ ...prev, questionText: content }))}
              />
            </div>
            {formErrors.questionText && (
              <p className="text-destructive text-sm">{formErrors.questionText}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="difficulty">Difficulty</Label>
              <Select
                value={formData.difficulty}
                onValueChange={(value) => setFormData(prev => ({ ...prev, difficulty: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select difficulty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="EASY">Easy</SelectItem>
                  <SelectItem value="MEDIUM">Medium</SelectItem>
                  <SelectItem value="HARD">Hard</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}
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

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="defaultMark">Default Mark</Label>
              <Input
                id="defaultMark"
                type="number"
                value={formData.defaultMark}
                onChange={(e) => setFormData(prev => ({ ...prev, defaultMark: Number(e.target.value) }))}
                min="0"
                step="0.5"
                required
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Label className={formErrors.languageOptions ? "text-destructive" : ""}>
                Programming Languages {formErrors.languageOptions && <span className="text-destructive text-sm">*</span>}
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
                <Label htmlFor="defaultLanguage" className={cn("text-sm", formErrors.defaultLanguage ? "text-destructive" : "")}>
                  Default Language: {formErrors.defaultLanguage && <span className="text-destructive text-sm">*</span>}
                </Label>
                <Select 
                  value={defaultLanguage} 
                  onValueChange={handleSetDefaultLanguage}
                  disabled={selectedLanguages.length === 0}
                >
                  <SelectTrigger className={cn("w-[180px]", formErrors.defaultLanguage ? "border-destructive" : "")}>
                    <SelectValue placeholder="Select default" />
                  </SelectTrigger>
                  <SelectContent>
                    {selectedLanguages.map((langId) => (
                      <SelectItem key={langId} value={langId}>
                        {SUPPORTED_LANGUAGES.find(l => l.id === langId)?.name || langId}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            {formErrors.languageOptions && (
              <p className="text-destructive text-sm">{formErrors.languageOptions}</p>
            )}
            {formErrors.defaultLanguage && (
              <p className="text-destructive text-sm">{formErrors.defaultLanguage}</p>
            )}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
              {SUPPORTED_LANGUAGES.map((lang) => (
                <Button
                  key={lang.id}
                  type="button"
                  variant={selectedLanguages.includes(lang.id) ? 
                    lang.id === defaultLanguage ? "default" : "secondary" : "outline"}
                  className={cn(
                    "flex items-center gap-2 w-full justify-start",
                    lang.id === defaultLanguage && "border-2 border-primary"
                  )}
                  onClick={() => handleLanguageSelect(lang.id)}
                >
                  <Code className="h-4 w-4 shrink-0" />
                  <span className="truncate">{lang.name}</span>
                  {lang.id === defaultLanguage && (
                    <span className="ml-auto text-xs bg-primary/20 px-1 rounded">Default</span>
                  )}
                </Button>
              ))}
            </div>

            {selectedLanguages.length > 0 && (
              <Tabs value={activeLanguageTab} onValueChange={setActiveLanguageTab}>
                <TabsList className="w-full overflow-x-auto">
                  <div className="flex gap-2 min-w-max">
                    {selectedLanguages.map((langId) => (
                      <TabsTrigger key={langId} value={langId} className="whitespace-nowrap">
                        {SUPPORTED_LANGUAGES.find(l => l.id === langId)?.name || langId}
                      </TabsTrigger>
                    ))}
                  </div>
                </TabsList>
                {selectedLanguages.map((langId) => {
                  const langOption = getLanguageOption(langId);
                  
                  return (
                    <TabsContent key={langId} value={langId} className="space-y-4">
                      <Tabs defaultValue="solution">
                        <TabsList className="grid w-full grid-cols-2">
                          <TabsTrigger value="solution">Solution</TabsTrigger>
                          <TabsTrigger value="preload">Preload Code</TabsTrigger>
                        </TabsList>
                        <TabsContent value="solution">
                          <CodeEditor
                            value={langOption?.solution || ""}
                            onChange={(value) => updateLanguageOption(langId, "solution", value)}
                            language={getEditorLanguage(langId)}
                            placeholder={`Enter ${SUPPORTED_LANGUAGES.find(l => l.id === langId)?.name || langId} solution code`}
                            className="border rounded-md"
                          />
                        </TabsContent>
                        <TabsContent value="preload">
                          <CodeEditor
                            value={langOption?.preloadCode || ""}
                            onChange={(value) => updateLanguageOption(langId, "preloadCode", value)}
                            language={getEditorLanguage(langId)}
                            placeholder={`Enter ${SUPPORTED_LANGUAGES.find(l => l.id === langId)?.name || langId} preload code`}
                            className="border rounded-md"
                          />
                        </TabsContent>
                      </Tabs>
                    </TabsContent>
                  );
                })}
              </Tabs>
            )}
          </div>

          {/* Test Cases */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Label className={formErrors.testCases ? "text-destructive" : ""}>
                Test Cases {formErrors.testCases && <span className="text-destructive text-sm">*</span>}
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
                  {isValidating ? (
                    <>Validating...</>
                  ) : (
                    <>Validate Test Cases</>
                  )}
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
              <div className={cn("text-sm text-right mb-2", formErrors.gradeDistribution ? "text-destructive" : "")}>
                <span className="mr-4">Sample test cases: {formData.testCases.filter(tc => tc.type === "sample").length}</span>
                <span className="mr-4">Hidden test cases: {formData.testCases.filter(tc => tc.type === "hidden").length}</span>
                <span>
                  Total grading: {formData.testCases.reduce((sum, testCase) => sum + testCase.gradePercentage, 0)}%
                  {formData.testCases.reduce((sum, testCase) => sum + testCase.gradePercentage, 0) !== 100 && !allOrNothingGrading && (
                    <span className="text-destructive ml-2">(Should equal 100%)</span>
                  )}
                </span>
              </div>
            )}
            {formErrors.gradeDistribution && (
              <p className="text-destructive text-sm">{formErrors.gradeDistribution}</p>
            )}

            {formData.testCases.map((testCase, index) => {
              const testCaseInputError = formErrors[`testCase${index}Input`];
              const testCaseOutputError = formErrors[`testCase${index}Output`];
              const testCaseGradeError = formErrors[`testCase${index}Grade`];
              const hasError = testCaseInputError || testCaseOutputError || testCaseGradeError;
              
              return (
                <div key={testCase.id} className={cn("space-y-4 p-4 border rounded-lg", hasError ? "border-destructive" : "")}>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id={`sample-${testCase.id}`}
                          checked={testCase.type === "sample"}
                          onCheckedChange={(checked) => 
                            handleTestCaseTypeChange(testCase.id, checked ? "sample" : "hidden")
                          }
                        />
                        <Label htmlFor={`sample-${testCase.id}`}>Sample</Label>
                      </div>
                      <div className="flex items-center space-x-2 ml-4">
                        <Checkbox
                          id={`hidden-${testCase.id}`}
                          checked={testCase.type === "hidden"}
                          onCheckedChange={(checked) => 
                            handleTestCaseTypeChange(testCase.id, checked ? "hidden" : "sample")
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
                        <Label htmlFor={`show-on-failure-${testCase.id}`}>Show on failure</Label>
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
                      <Label className={testCaseInputError ? "text-destructive" : ""}>
                        Input {testCaseInputError && <span className="text-destructive text-sm">*</span>}
                      </Label>
                      <Textarea
                        value={testCase.input}
                        onChange={(e) => updateTestCase(testCase.id, "input", e.target.value)}
                        placeholder="Enter test case input"
                        className={cn("min-h-[100px] font-mono", testCaseInputError ? "border-destructive" : "")}
                      />
                      {testCaseInputError && (
                        <p className="text-destructive text-sm">{testCaseInputError}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label className={testCaseOutputError ? "text-destructive" : ""}>
                        Expected Output {testCaseOutputError && <span className="text-destructive text-sm">*</span>}
                      </Label>
                      <Textarea
                        value={testCase.output}
                        onChange={(e) => updateTestCase(testCase.id, "output", e.target.value)}
                        placeholder="Enter expected output"
                        className={cn("min-h-[100px] font-mono", testCaseOutputError ? "border-destructive" : "")}
                      />
                      {testCaseOutputError && (
                        <p className="text-destructive text-sm">{testCaseOutputError}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className={testCaseGradeError ? "text-destructive" : ""}>
                      Grade Percentage (0-100): {testCaseGradeError && <span className="text-destructive text-sm">*</span>}
                    </Label>
                    <div className="flex items-center">
                      <Input
                        type="number"
                        value={testCase.gradePercentage}
                        onChange={(e) => {
                          if (allOrNothingGrading) return;
                          const value = Math.min(100, Math.max(0, parseInt(e.target.value) || 0));
                          updateTestCase(testCase.id, "gradePercentage", value);
                        }}
                        className={cn("w-24", testCaseGradeError ? "border-destructive" : "")}
                        min={0}
                        max={100}
                        disabled={allOrNothingGrading}
                      />
                      <span className="ml-2">%</span>
                    </div>
                    {testCaseGradeError && (
                      <p className="text-destructive text-sm">{testCaseGradeError}</p>
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
                      <span>{validationResults.filter(r => r.isMatch).length} passed</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <XCircle className="h-5 w-5 text-red-500" />
                      <span>{validationResults.filter(r => !r.isMatch).length} failed</span>
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

          <div className="flex justify-end gap-2 pt-6 sticky bottom-0 bg-background pb-2 border-t mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isValidating}
            >
              {initialData ? "Update Question" : "Create Question"}
            </Button>
          </div>
        </form>
      </DialogContent>

      {/* Update the ValidationResultsModal with the copy function */}
      <ValidationResultsModal
        isOpen={validationDialogOpen}
        onClose={() => setValidationDialogOpen(false)}
        results={validationResults}
        testCases={formData.testCases}
        onCopyOutput={copyOutputToExpected}
      />
    </Dialog>
  );
} 