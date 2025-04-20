"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
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
  isMatch: boolean;
  actualOutput: string;
  executionTime: number;
  memoryUsage: number;
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
          <Button variant="outline" onClick={onClose}>
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

  // Use useEffect to initialize the form data when initialData changes
  useEffect(() => {
    if (initialData) {
      console.log('Initializing form with data:', JSON.stringify(initialData, null, 2));
      
      // Set basic form data
      setFormData(prevData => ({
        ...prevData,
        id: initialData.id || '',
        name: initialData.name || '',
        folderId: initialData.folderId || '',
        questionText: initialData.questionText || '',
        difficulty: initialData.difficulty || 'MEDIUM',
        defaultMark: initialData.defaultMark || 1,
      }));
      
      // Set language options
      if (initialData.languageOptions && Array.isArray(initialData.languageOptions)) {
        console.log('Setting language options:', initialData.languageOptions);
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
        setSelectedLanguages(langs);
        
        // Set default language
        if (initialData.defaultLanguage && langs.includes(initialData.defaultLanguage)) {
          setDefaultLanguage(initialData.defaultLanguage);
        } else if (langs.length > 0) {
          setDefaultLanguage(langs[0]);
        }
        
        // Set active language tab
        if (langs.length > 0) {
          setActiveLanguageTab(langs[0]);
        }
      } else {
        console.log('No language options found in initialData');
      }
      
      // Set test cases
      if (initialData.testCases && Array.isArray(initialData.testCases)) {
        console.log('Setting test cases from initialData:', initialData.testCases);
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
            
            console.log(`Initializing test case:`, {
              id: tc.id,
              type,
              isSample,
              isHidden,
              showOnFailure,
              originalShowOnFailure: tc.showOnFailure
            });
            
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
        console.log('No test cases found in initialData');
      }
      
      // Set all-or-nothing grading
      if (initialData.allOrNothingGrading !== undefined) {
        setAllOrNothingGrading(initialData.allOrNothingGrading);
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
    const submissionData = prepareSubmissionData();
    
    // Log to help debug issues
    console.log("Submitting data with default language:", defaultLanguage);
    console.log("Full submission data:", JSON.stringify(submissionData, null, 2));
    console.log("Is this an update operation?", !!initialData?.id);
    
    // Validate test cases have the correct properties
    let validTestCases = true;
    submissionData.testCases.forEach((tc, index) => {
      console.log(`Validating test case ${index}:`, tc);
      if (tc.showOnFailure === undefined) {
        console.error(`Test case ${index} is missing showOnFailure property`);
        validTestCases = false;
      }
      if (tc.isSample === undefined) {
        console.error(`Test case ${index} is missing isSample property`);
        validTestCases = false;
      }
      if (tc.isHidden === undefined) {
        console.error(`Test case ${index} is missing isHidden property`);
        validTestCases = false;
      }
    });
    
    if (!validTestCases) {
      toast({
        title: "Test Case Validation Error",
        description: "Some test cases are missing required properties",
        variant: "destructive",
      });
      return;
    }
    
    try {
      // Call the onSubmit callback with the data
      onSubmit(submissionData);
      
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
    console.log("Adding new test case with default values");
    
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
    
    console.log("New test case with explicit boolean values:", newTestCase);
    
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
    console.log(`Updating test case ${id} field ${field} with value:`, value, `(type: ${typeof value})`);
    
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
    console.log(`Explicitly updating showOnFailure for test case ${id} to:`, value, `(type: ${typeof value})`);
    // Force it to be a strict boolean true or false
    const boolValue = value === true;
    console.log(`Converted value: ${boolValue} (${typeof boolValue})`);
    
    setFormData(prev => {
      // Create a new test cases array with the updated value
      const updatedTestCases = prev.testCases.map(testCase => {
        if (testCase.id === id) {
          console.log(`Before update: ${testCase.id}`, {
            showOnFailure: testCase.showOnFailure,
            type: typeof testCase.showOnFailure
          });
          
          // Create a new test case object with the updated showOnFailure value
          const updated = {
            ...testCase,
            showOnFailure: boolValue
          };
          
          console.log(`After update: ${updated.id}`, {
            showOnFailure: updated.showOnFailure,
            type: typeof updated.showOnFailure
          });
          
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
    console.log(`Changing test case ${id} type to:`, type);
    
    // Get the current test case to preserve its showOnFailure value
    const currentTestCase = formData.testCases.find(tc => tc.id === id);
    const currentShowOnFailure = currentTestCase?.showOnFailure === true;
    
    console.log(`Current showOnFailure value: ${currentShowOnFailure}`);
    
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
    console.log("Validate button clicked");
    console.log("Current state:", {
      isValidating,
      testCases: formData.testCases.length,
      defaultLanguage,
      selectedLanguages,
      languageOptions: formData.languageOptions
    });
    
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

  // Update the validateTestCases function to include the copy functionality
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
            isMatch,
            actualOutput,
            executionTime: data.time || 0,
            memoryUsage: data.memory || 0,
            error: data.stderr || data.compile_output || undefined
          });
        } catch (error) {
          console.error("Error validating test case:", error);
          results.push({
            testCaseId: testCase.id,
            isMatch: false,
            actualOutput: "",
            executionTime: 0,
            memoryUsage: 0,
            error: error instanceof Error ? error.message : String(error)
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
    console.log("Initial data:", initialData);
    
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
      // Determine the test case type and flags for submission
      const type = testCase.type || 'hidden';
      const isSample = type === 'sample' || testCase.isSample === true;
      const isHidden = type === 'hidden' || testCase.isHidden === true;
      
      // Fix: Explicitly convert showOnFailure to a boolean to ensure it's always a proper boolean
      // Using double-bang (!!) to force conversion to boolean
      const showOnFailure = !!testCase.showOnFailure;
      
      console.log(`Preparing test case for submission:`, {
        id: testCase.id,
        type,
        isSample,
        isHidden,
        showOnFailure,
        originalShowOnFailure: testCase.showOnFailure,
        typeOfOriginal: typeof testCase.showOnFailure,
        gradePercentage: testCase.gradePercentage
      });
      
      return {
        id: testCase.id || `tc-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        input: testCase.input,
        output: testCase.output,
        type, // Send the type string
        isSample, // Send the boolean flag
        isHidden, // Send the boolean flag
        showOnFailure, // Send the boolean flag
        gradePercentage: testCase.gradePercentage,
      };
    });
    
    // Check if we're editing an existing question
    const isEditing = !!initialData?.id;
    console.log("Is this an update operation?", isEditing, "Question ID:", initialData?.id);
    
    const result = {
      // Include the ID if we're updating an existing question
      id: initialData?.id, 
      name: formData.name,
      folderId: formData.folderId,
      type: "CODING",
      difficulty: formData.difficulty,
      defaultMark: formData.defaultMark,
      questionText: formData.questionText,
      defaultLanguage: defaultLanguage, 
      // Include these directly at the top level since the update API expects them there
      languageOptions: dedupedOptions,
      testCases: testCases,
      allOrNothingGrading: allOrNothingGrading,
      status: initialData?.status || "DRAFT",
      version: initialData?.version || 1
    };
    
    console.log("Final submission data:", JSON.stringify(result, null, 2));
    return result;
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
                  disabled={isValidating}
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
                          checked={!!testCase.showOnFailure}
                          onCheckedChange={(checked) => {
                            console.log(`Changing showOnFailure for test case ${testCase.id} to:`, checked);
                            // Convert to boolean explicitly (true or false)
                            const boolValue = checked === true;
                            console.log(`Converted value: ${boolValue} (${typeof boolValue})`);
                            updateTestCaseShowOnFailure(testCase.id, boolValue);
                          }}
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