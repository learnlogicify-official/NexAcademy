"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Trash2, Code, ChevronRight, ChevronDown, Folder, FolderOpen, Copy, CheckCheck } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
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
  input: string;
  expectedOutput: string;
  actualOutput: string;
  isMatch: boolean;
  executionTime?: string;
  memory?: string;
  error?: string;
}

// Create a debug-safe fetch function
const safeFetch = async (url: string, options: RequestInit) => {
  console.log(`Making ${options.method} request to ${url}`);
  console.log('Request headers:', options.headers);
  console.log('Request body:', options.body);
  
  try {
    const response = await fetch(url, options);
    console.log(`Response status: ${response.status}`);
    
    if (!response.ok) {
      const text = await response.text();
      console.error('Response error:', text);
      throw new Error(`Request failed with status ${response.status}: ${text}`);
    }
    
    const data = await response.json();
    console.log('Response data:', data);
    return data;
  } catch (error) {
    console.error('Fetch error:', error);
    throw error;
  }
};

// Direct test function to test our server API
const testApi = async () => {
  try {
    console.log("=== JUDGE0 API TEST SEQUENCE STARTING ===");
    
    // Step 1: Test server connection
    console.log("\nStep 1: Testing server connection to /api/judge0");
    const testResponse = await fetch("/api/judge0");
    
    if (!testResponse.ok) {
      console.error("❌ Server connection failed:", testResponse.status);
      alert(`API connection failed with status ${testResponse.status}`);
      return;
    }
    
    const testData = await testResponse.json();
    console.log("✅ Server connection successful");
    console.log("Languages available:", testData.data?.length || 0);
    
    // Step 2: Simple test with Python print
    console.log("\nStep 2: Testing simple Python code execution");
    const simpleCode = `
print("Hello from Judge0!")
print("This is a test")
for i in range(3):
    print(f"Count: {i}")
`;
    
    try {
      console.log("Sending execution request...");
      console.log("Code to execute:", simpleCode);
      
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
      console.log("✅ Execution request successful");
      console.log("Response data:", executeData);
      
      const output = executeData.data?.stdout || "No output";
      console.log("Output:", output);
      
      // Step 3: Test with input
      console.log("\nStep 3: Testing Python code with input");
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
      console.log("✅ Input test successful");
      console.log("Input used:", stdin);
      console.log("Response data:", inputData);
      console.log("Output:", inputData.data?.stdout || "No output");
      
      alert(`Tests completed successfully!\n\nSimple test output: ${output}\n\nInput test output: ${inputData.data?.stdout || "No output"}`);
      
    } catch (error) {
      console.error("❌ Execution error:", error);
      alert(`Execution failed with error: ${error instanceof Error ? error.message : String(error)}`);
    }
    
  } catch (error) {
    console.error("❌ Test sequence failed:", error);
    alert(`Test sequence failed with error: ${error instanceof Error ? error.message : String(error)}`);
  } finally {
    console.log("=== JUDGE0 API TEST SEQUENCE COMPLETED ===");
  }
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

  // Add a debug function to check specific language options
  const inspectLanguageOption = (langId: string) => {
    const option = formData.languageOptions.find(opt => opt.language === langId);
    console.log(`Inspecting language option for ${langId}:`, option);
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
    console.log(`Language ${langId} maps to editor mode: ${editorLang}`);
    return editorLang;
  };

  // Fix data loading to ensure we get all languages from initialData
  useEffect(() => {
    if (initialData) {
      console.log("Initializing form with data:", initialData);
      
      try {
        // Get languageOptions from initialData - ensure we parse it correctly
        let languageOptions = initialData.languageOptions || [];
        
        // Handle cases where languageOptions might be a string (from JSON stringification)
        if (typeof languageOptions === 'string') {
          try {
            languageOptions = JSON.parse(languageOptions);
          } catch (e) {
            console.error("Failed to parse languageOptions string:", e);
            languageOptions = [];
          }
        }
        
        // Handle allOrNothingGrading from initialData
        if (initialData.allOrNothingGrading !== undefined) {
          console.log("Setting all-or-nothing grading from initialData:", initialData.allOrNothingGrading);
          setAllOrNothingGrading(initialData.allOrNothingGrading);
        }
        
        console.log("Initial language options:", languageOptions);
        
        // Create a map to track used language IDs - this prevents duplicates
        const existingLanguages = new Set();
        
        // First, get a clean list of languages from the DB without duplicates
        const dbLanguageOptions = [];
        for (const opt of languageOptions) {
          if (opt && opt.language && !existingLanguages.has(opt.language)) {
            existingLanguages.add(opt.language);
            
            // Ensure each language option has a valid ID
            const optWithId = {
              ...opt,
              id: opt.id || `lang-${opt.language}-${Date.now()}`
            };
            
            dbLanguageOptions.push(optWithId);
          }
        }
        
        console.log("DB Language options (deduplicated):", dbLanguageOptions);
        console.log("Languages found in DB:", Array.from(existingLanguages));
        
        // Properly handle test cases, ensuring their types are preserved
        let testCases = initialData.testCases || [];
        
        // Debug log to check test case types
        if (testCases.length > 0) {
          console.log("Initial test cases:", testCases);
          testCases.forEach((tc: any, index: number) => {
            console.log(`Test case ${index} type:`, tc.type);
          });
        }
        
        // Set form data with the processed options
        setFormData({
          name: initialData.name || "",
          folderId: initialData.folderId || "",
          questionText: initialData.questionText || "",
          difficulty: initialData.difficulty || "MEDIUM",
          defaultMark: initialData.defaultMark || 1,
          languageOptions: dbLanguageOptions,  // Use the clean list without duplicates
          testCases: testCases.map((tc: Partial<TestCase>) => {
            // Determine the test case type based on the database flags
            let testCaseType: "sample" | "hidden";
            if (tc.isSample) {
              testCaseType = "sample";
            } else {
              testCaseType = "hidden";
            }
            console.log(`Setting test case ${tc.id} type based on DB flags:`, {
              isSample: tc.isSample,
              isHidden: tc.isHidden,
              resultType: testCaseType
            });
            
            return {
              id: tc.id || Date.now().toString(),
              input: tc.input || "",
              output: tc.output || "",
              type: testCaseType, // Explicitly set based on database flags
              gradePercentage: tc.grade || tc.gradePercentage || 0,
              showOnFailure: tc.showOnFailure || false
            };
          }),
        });
        
        // Set selected languages based on what was in the DB (deduplicated)
        if (existingLanguages.size > 0) {
          const selectedLangsFromDB = Array.from(existingLanguages) as string[];
          console.log("Setting selected languages:", selectedLangsFromDB);
          setSelectedLanguages(selectedLangsFromDB);
          
          // Set the first language as the active tab
          const firstLang = selectedLangsFromDB[0];
          setActiveLanguageTab(firstLang);
          console.log("Setting active tab to:", firstLang);
          
          // Handle default language priority
          if (initialData.defaultLanguage && selectedLangsFromDB.includes(initialData.defaultLanguage)) {
            console.log("Setting default language from initialData:", initialData.defaultLanguage);
            setDefaultLanguage(initialData.defaultLanguage);
          } else if (selectedLangsFromDB.length > 0) {
            console.log("Setting default language to first language:", selectedLangsFromDB[0]);
            setDefaultLanguage(selectedLangsFromDB[0]);
          }
        }
        
        // If all-or-nothing grading is enabled, distribute grades
        if (initialData.allOrNothingGrading) {
          setTimeout(() => distributeGradesEvenly(), 500);
        }
      } catch (error) {
        console.error("Error processing initialData:", error);
        toast({
          title: "Error Loading Question",
          description: "Failed to process question data. Please try again.",
          variant: "destructive",
        });
      }
    }
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submit triggered');
    
    // Validate required fields
    if (!formData.name.trim()) {
      console.log('Validation failed: Missing question name');
      toast({
        title: "Missing Question Name",
        description: "Please provide a name for the question",
        variant: "destructive",
      });
      return;
    }
    
    if (!formData.folderId) {
      console.log('Validation failed: Missing folder');
      toast({
        title: "Missing Folder",
        description: "Please select a folder for the question",
        variant: "destructive",
      });
      return;
    }
    
    if (!formData.questionText.trim()) {
      console.log('Validation failed: Missing question text');
      toast({
        title: "Missing Question Text",
        description: "Please provide the question text",
        variant: "destructive",
      });
      return;
    }
    
    if (formData.languageOptions.length === 0) {
      console.log('Validation failed: No languages selected');
      toast({
        title: "No Languages Selected",
        description: "Please select at least one programming language",
        variant: "destructive",
      });
      return;
    }
    
    if (formData.testCases.length === 0) {
      console.log('Validation failed: No test cases');
      toast({
        title: "No Test Cases",
        description: "Please add at least one test case",
        variant: "destructive",
      });
      return;
    }
    
    // Validate each test case
    const invalidTestCases = formData.testCases.filter(tc => {
      const hasInput = tc.input.trim() === '';
      const hasOutput = tc.output.trim() === '';
      const hasValidGrade = tc.gradePercentage < 0 || tc.gradePercentage > 100;
      return hasInput || hasOutput || hasValidGrade;
    });

    if (invalidTestCases.length > 0) {
      console.log('Validation failed: Invalid test cases');
      toast({
        title: "Invalid Test Cases",
        description: "All test cases must have input, expected output, and a valid grade percentage (0-100)",
        variant: "destructive",
      });
      return;
    }

    // Validate total grade percentage
    if (!allOrNothingGrading) {
      const totalGradePercentage = formData.testCases.reduce(
        (total, tc) => total + tc.gradePercentage, 
        0
      );
      if (Math.abs(totalGradePercentage - 100) > 0.01) {
        console.log('Validation failed: Invalid grade distribution');
        toast({
          title: "Invalid Grade Distribution",
          description: `Total grade percentage is ${totalGradePercentage.toFixed(2)}%. It must equal 100%.`,
          variant: "destructive",
        });
        return;
      }
    }

    // Make sure we have a default language
    if (!defaultLanguage && selectedLanguages.length > 0) {
      setDefaultLanguage(selectedLanguages[0]);
    }
    
    // Prepare data for submission with deduplication
    const submissionData = {
      ...prepareSubmissionData(),
      // Include the ID if we're updating an existing question
      id: initialData?.id
    };
    
    console.log("Submitting data with default language:", defaultLanguage);
    console.log("Full submission data:", submissionData);
    
    try {
      // Call the onSubmit callback with the data
      onSubmit(submissionData);
      
      // Close the modal
      onClose();
      
      // Show success toast with appropriate message
      toast({
        title: "Success",
        description: initialData ? "Coding question updated successfully" : "Coding question created successfully",
      });
    } catch (error) {
      console.error("Error in form submission:", error);
      toast({
        title: "Error",
        description: initialData ? "Failed to update question" : "Failed to create question",
        variant: "destructive",
      });
    }
  };

  const handleLanguageSelect = (languageId: string) => {
    console.log(`Language selection toggled: ${languageId}`);
    
    if (selectedLanguages.includes(languageId)) {
      // If removing a language, remove it from selected and remove its options
      console.log(`Removing language: ${languageId}`);
      setSelectedLanguages(prev => prev.filter(lang => lang !== languageId));
      setFormData(prev => ({
        ...prev,
        languageOptions: prev.languageOptions.filter(opt => opt.language !== languageId)
      }));
      
      // If removing the default language, reset it or set to first available
      if (defaultLanguage === languageId) {
        const remaining = selectedLanguages.filter(lang => lang !== languageId);
        const newDefault = remaining.length > 0 ? remaining[0] : "";
        console.log(`Default language was removed, setting new default: ${newDefault}`);
        setDefaultLanguage(newDefault);
        
        // If we removed the active tab, switch to another one
        if (activeLanguageTab === languageId) {
          setActiveLanguageTab(remaining.length > 0 ? remaining[0] : "");
        }
      }
    } else {
      // If adding a language, add it to selected and create new language option
      console.log(`Adding language: ${languageId}`);
      setSelectedLanguages(prev => [...prev, languageId]);
      
      // Create a new language option with unique ID - use the exact languageId as language
      const newLanguageOption = {
        id: `lang-${languageId}-${Date.now()}`,
        language: languageId, // This is the key - using exact languageId, not a modified version
        solution: "",
        preloadCode: ""
      };
      console.log('Created new language option:', newLanguageOption);
      
      setFormData(prev => ({
        ...prev,
        languageOptions: [...prev.languageOptions, newLanguageOption]
      }));
      
      // Set this as active tab
      setActiveLanguageTab(languageId);
      
      // If default language isn't set, set this as default
      if (!defaultLanguage) {
        console.log(`Setting default language to: ${languageId}`);
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
    console.log(`Updating ${field} for language ${langId}:`, value.substring(0, 50) + '...');
    
    setFormData(prev => ({
      ...prev,
      languageOptions: prev.languageOptions.map(opt => 
        opt.language === langId ? { ...opt, [field]: value } : opt
      )
    }));
  };

  const addTestCase = () => {
    setFormData(prev => ({
      ...prev,
      testCases: [
        ...prev.testCases,
        {
          id: Date.now().toString(),
          input: "",
          output: "",
          type: "sample",
          gradePercentage: 0,
          showOnFailure: false
        }
      ]
    }));
  };

  const removeTestCase = (id: string) => {
    setFormData(prev => ({
      ...prev,
      testCases: prev.testCases.filter(testCase => testCase.id !== id)
    }));
  };

  const updateTestCase = (id: string, field: keyof TestCase, value: any) => {
    setFormData(prev => ({
      ...prev,
      testCases: prev.testCases.map(testCase =>
        testCase.id === id ? { ...testCase, [field]: value } : testCase
      )
    }));
  };

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

  // Function to distribute grades evenly among hidden test cases only
  const distributeGradesEvenly = () => {
    if (formData.testCases.length === 0) return;
    
    // Filter for hidden test cases
    const hiddenTestCases = formData.testCases.filter(testCase => testCase.type === "hidden");
    
    if (hiddenTestCases.length === 0) {
      toast({
        title: "No hidden test cases",
        description: "Add hidden test cases to distribute grades",
        variant: "destructive",
      });
      return;
    }
    
    // Calculate grade per hidden test case
    const gradePerTestCase = Math.floor(100 / hiddenTestCases.length);
    let remainingGrade = 100 - (gradePerTestCase * hiddenTestCases.length);
    
    // Create a map of test case IDs to easily identify hidden test cases
    const hiddenTestCaseIds = new Set(hiddenTestCases.map(tc => tc.id));
    
    setFormData(prev => ({
      ...prev,
      testCases: prev.testCases.map((testCase, index) => {
        // If it's a sample test case, set grade to 0
        if (testCase.type === "sample") {
          return { ...testCase, gradePercentage: 0 };
        }
        
        // If it's a hidden test case, distribute the grade
        // Add any remaining percentage to the first hidden test case
        const isFirstHidden = hiddenTestCases[0]?.id === testCase.id;
        return {
          ...testCase,
          gradePercentage: gradePerTestCase + (isFirstHidden ? remainingGrade : 0)
        };
      })
    }));
  };

  // Add effect to update grade distribution when a test case type changes
  useEffect(() => {
    if (allOrNothingGrading) {
      distributeGradesEvenly();
    }
  }, [allOrNothingGrading, formData.testCases.length]);
  
  // Ensure the 'handleTestCaseTypeChange' function correctly updates the test case type
  const handleTestCaseTypeChange = (id: string, type: "sample" | "hidden") => {
    console.log(`Changing test case ${id} type to:`, type);
    
    // Update the test case type
    updateTestCase(id, "type", type);
    
    // If switching to sample, set grade to 0
    if (type === "sample") {
      updateTestCase(id, "gradePercentage", 0);
      
      // If in all-or-nothing mode, redistribute grades among remaining hidden tests
      if (allOrNothingGrading) {
        setTimeout(() => distributeGradesEvenly(), 0);
      }
    } 
    // If switching to hidden in all-or-nothing mode, redistribute all grades
    else if (type === "hidden" && allOrNothingGrading) {
      setTimeout(() => distributeGradesEvenly(), 0);
    }
  };

  // Add handler to set the default language
  const handleSetDefaultLanguage = (languageId: string) => {
    setDefaultLanguage(languageId);
  };

  // Add a dedicated click handler for the validate button
  const handleValidateClick = () => {
    console.log("Validate button clicked");
    
    // Use setTimeout to ensure the button click handler completes before validation starts
    setTimeout(() => {
      console.log("Starting validation...");
      validateTestCases();
    }, 100);
  };

  // Modify the validation function to use our server-side API
  const validateTestCases = async () => {
    console.log("Starting test case validation via server API...");
    
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
    const languageId = JUDGE0_LANGUAGE_IDS[defaultLanguage as keyof typeof JUDGE0_LANGUAGE_IDS];
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
      
      console.log(`Using language ID ${languageId} for ${defaultLanguage}`);
      console.log(`Processing ${formData.testCases.length} test cases...`);

      // Process each test case
      const results: TestCaseValidationResult[] = [];
      
      // Create a submission for each test case
      for (const testCase of formData.testCases) {
        try {
          console.log(`Testing case: "${testCase.input}" -> "${testCase.output}"`);
          
          // Prepare the request body
          const requestBody = {
            language_id: languageId,
            source_code: languageOption.solution || "",
            stdin: testCase.input || ""
          };

          console.log("Sending request to Judge0 API:", requestBody);
          
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
            throw new Error(errorData.error || "Execution failed");
          }
          
          const responseData = await response.json();
          const data = responseData.data;
          
          console.log("Execution result:", data);
          
          // Process the result
          const actualOutput = data.stdout?.trim() || "";
          const expectedOutput = testCase.output.trim();
          const isMatch = actualOutput === expectedOutput;
          
          results.push({
            testCaseId: testCase.id,
            input: testCase.input,
            expectedOutput,
            actualOutput,
            isMatch,
            executionTime: data.time ? `${data.time}s` : "N/A",
            memory: data.memory ? `${data.memory} KB` : "N/A",
            error: data.stderr || data.compile_output || ""
          });
        } catch (error) {
          console.error(`Error validating test case:`, error);
          
          results.push({
            testCaseId: testCase.id,
            input: testCase.input,
            expectedOutput: testCase.output,
            actualOutput: "Execution error",
            isMatch: false,
            error: error instanceof Error ? error.message : "Unknown error"
          });
        }
      }

      setValidationResults(results);
      setValidationDialogOpen(true);
      
      // Show a toast with the summary
      const passedTests = results.filter(r => r.isMatch).length;
      toast({
        title: `${passedTests} / ${results.length} tests passed`,
        variant: passedTests === results.length ? "default" : "destructive",
      });

    } catch (error) {
      console.error("Error validating test cases:", error);
      toast({
        title: "Validation failed",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    } finally {
      setIsValidating(false);
    }
  };

  // Add function to copy actual output to expected output
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

  // Enhanced version of logFormData to better diagnose issues
  const logFormData = () => {
    console.log("=== DETAILED FORM DATA ===");
    console.log("Selected Languages:", selectedLanguages);
    console.log("Default Language:", defaultLanguage);
    console.log("Active Tab:", activeLanguageTab);
    console.log("Language Options:", formData.languageOptions);
    
    // Check each language option in detail
    if (selectedLanguages.length > 0) {
      console.log("=== LANGUAGE OPTION DETAILS ===");
      selectedLanguages.forEach(langId => {
        const option = getLanguageOption(langId);
        const editorLang = getEditorLanguage(langId);
        console.log(`${langId}:`, {
          id: option?.id,
          hasContent: !!option,
          solutionLength: option?.solution?.length || 0,
          preloadLength: option?.preloadCode?.length || 0,
          editorLanguage: editorLang
        });
      });
    }
  };

  // Function to ensure we don't have duplicate languages in the DB request
  // and to ensure correct language IDs and test case types are used
  const prepareSubmissionData = () => {
    // Logging all data before submission for debugging
    console.log("Preparing submission with selected languages:", selectedLanguages);
    console.log("Language options before deduplication:", formData.languageOptions);
    console.log("Test cases:", formData.testCases);
    console.log("All or nothing grading:", allOrNothingGrading);
    
    // Deduplicate language options by language ID
    const uniqueLanguages = new Map<string, LanguageOption>();
    formData.languageOptions.forEach(option => {
      // Only include languages that are actually selected
      if (selectedLanguages.includes(option.language)) {
        // Make sure we're using the correct language ID
        const correctOption = { 
          ...option,
          // Double-check that language is exactly the ID we need (not modified)
          language: option.language,
          // Preserve the ID if it exists (for editing)
          id: option.id || `lang-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
        };
        uniqueLanguages.set(option.language, correctOption);
        console.log(`Adding language to submission: ${option.language}`, correctOption);
      }
    });
    
    // Convert to array
    const dedupedOptions = Array.from(uniqueLanguages.values());
    console.log("Final deduplicated language options:", dedupedOptions);
    
    // Verify test case types before submission
    const testCases = formData.testCases.map(testCase => {
      console.log(`Test case ${testCase.id} type for submission:`, testCase.type);
      return {
        id: testCase.id || `tc-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        input: testCase.input,
        output: testCase.output,
        type: testCase.type, // Send the type to the API
        isSample: testCase.type === 'sample', // Map type to isSample flag
        isHidden: testCase.type === 'hidden', // Map type to isHidden flag
        gradePercentage: testCase.gradePercentage,
        showOnFailure: testCase.showOnFailure
      };
    });
    
    return {
      name: formData.name,
      folderId: formData.folderId,
      type: "CODING",
      difficulty: formData.difficulty,
      defaultMark: formData.defaultMark,
      questionText: formData.questionText,
      defaultLanguage: defaultLanguage, 
      languageOptions: dedupedOptions,
      testCases: testCases,
      allOrNothingGrading: allOrNothingGrading, // Make sure this is explicitly included
      status: initialData?.status || "DRAFT",
      version: initialData?.version || 1
    };
  }
  
  // Improved function to add all 10 languages at once
  const addAllLanguages = () => {
    const allLangIds = SUPPORTED_LANGUAGES.map(lang => lang.id);
    console.log(`Adding all languages: ${allLangIds.join(", ")}`);
    
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
    
    console.log("New language options for all languages:", newLangOptions);
    
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
    
    console.log("Setting all language options:", newLangOptions);
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
              <Label htmlFor="name">Question Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter question name"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="folder">Folder</Label>
              <Select
                value={formData.folderId}
                onValueChange={(value) => setFormData(prev => ({ ...prev, folderId: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select folder">
                    {allFolderOptions.find(f => f.id === formData.folderId)?.name || "Select a folder"}
                  </SelectValue>
                </SelectTrigger>
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
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="questionText">Question Text</Label>
            <RichTextEditor
              value={formData.questionText}
              onChange={(value) => setFormData(prev => ({ ...prev, questionText: value }))}
              placeholder="Enter the question text with formatting, images, and code"
              className="min-h-[250px]"
              editorClassName="min-h-[200px]"
            />
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
              <Label>Programming Languages</Label>
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
                <Label htmlFor="defaultLanguage" className="text-sm">Default Language:</Label>
                <Select 
                  value={defaultLanguage} 
                  onValueChange={handleSetDefaultLanguage}
                  disabled={selectedLanguages.length === 0}
                >
                  <SelectTrigger className="w-[180px]">
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
                  console.log(`Language tab ${langId}:`, langOption);
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
              <Label>Test Cases</Label>
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
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  onClick={handleValidateClick}
                  disabled={isValidating || formData.testCases.length === 0 || !defaultLanguage}
                >
                  {isValidating ? (
                    <>
                      <span className="animate-spin mr-2">⟳</span>
                      Validating...
                    </>
                  ) : (
                    <>
                      <Terminal className="h-4 w-4 mr-2" />
                      Validate Test Cases
                    </>
                  )}
                </Button>
              </div>
            </div>

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
              <div className="text-sm text-right mb-2">
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

            {formData.testCases.map((testCase) => {
              const result = validationResults.find(r => r.testCaseId === testCase.id);
              return (
                <div key={testCase.id} className="space-y-4 p-4 border rounded-lg">
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
                          checked={testCase.showOnFailure}
                          onCheckedChange={(checked) => 
                            updateTestCase(testCase.id, "showOnFailure", !!checked)
                          }
                        />
                        <Label htmlFor={`show-on-failure-${testCase.id}`}>Show on failure</Label>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeTestCase(testCase.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Input</Label>
                      <Textarea
                        value={testCase.input}
                        onChange={(e) => updateTestCase(testCase.id, "input", e.target.value)}
                        placeholder="Enter test case input"
                        className="min-h-[100px] font-mono"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Expected Output</Label>
                      <Textarea
                        value={testCase.output}
                        onChange={(e) => updateTestCase(testCase.id, "output", e.target.value)}
                        placeholder="Enter expected output"
                        className="min-h-[100px] font-mono"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Grade Percentage (0-100):</Label>
                    <div className="flex items-center">
                      <Input
                        type="number"
                        value={testCase.gradePercentage}
                        onChange={(e) => {
                          if (allOrNothingGrading) return;
                          const value = Math.min(100, Math.max(0, parseInt(e.target.value) || 0));
                          updateTestCase(testCase.id, "gradePercentage", value);
                        }}
                        className="w-24"
                        min={0}
                        max={100}
                        disabled={allOrNothingGrading}
                      />
                      <span className="ml-2">%</span>
                    </div>
                  </div>

                  {/* Validation Results */}
                  {showValidationResults && result && (
                    <div className={`mt-4 p-3 rounded-md ${result.isMatch ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                      <div className="flex items-center mb-2">
                        <div className="flex items-center gap-2 font-medium">
                          {result.isMatch ? (
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          ) : (
                            <XCircle className="h-5 w-5 text-red-500" />
                          )}
                          <span>{result.isMatch ? 'Test Passed' : 'Test Failed'}</span>
                        </div>
                        {result.executionTime && (
                          <div className="ml-auto text-sm text-muted-foreground">
                            Execution Time: {result.executionTime}
                            {result.memory && ` | Memory: ${result.memory}`}
                          </div>
                        )}
                      </div>
                      {!result.isMatch && (
                        <div className="space-y-2">
                          <div>
                            <Label className="text-sm">Actual Output:</Label>
                            <div className="p-2 bg-white rounded border font-mono text-xs whitespace-pre-wrap">
                              {result.actualOutput || "No output"}
                            </div>
                          </div>
                          {result.error && (
                            <div>
                              <Label className="text-sm text-red-500">Error:</Label>
                              <div className="p-2 bg-white rounded border font-mono text-xs whitespace-pre-wrap text-red-600">
                                {result.error}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
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
                variant="outline" 
                onClick={addTestCase}
                className="w-full max-w-md"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Test Case
              </Button>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-6 sticky bottom-0 bg-background pb-2 border-t mt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant={initialData ? "default" : "default"}>
              {initialData ? "Update Question" : "Create Question"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 