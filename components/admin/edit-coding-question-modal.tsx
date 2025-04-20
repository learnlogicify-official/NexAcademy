"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Trash2, Code, ChevronRight, ChevronDown, Terminal, X } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { CodeEditor } from "@/components/ui/code-editor";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
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

interface EditCodingQuestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  initialData: any;
  folders: any[];
  onAddFolder: () => void;
}

export function EditCodingQuestionModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  folders,
  onAddFolder,
}: EditCodingQuestionModalProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    id: "",
    name: "",
    folderId: "",
    questionText: "",
    difficulty: "MEDIUM",
    defaultMark: 1,
    status: "DRAFT",
    languageOptions: [] as any[],
    testCases: [] as any[],
    version: 1,
  });
  
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [activeLanguageTab, setActiveLanguageTab] = useState<string>("");
  const [defaultLanguage, setDefaultLanguage] = useState<string>("");
  const [allOrNothingGrading, setAllOrNothingGrading] = useState(false);
  const [editingTestCaseIndex, setEditingTestCaseIndex] = useState<number | null>(null);
  const [newTestCase, setNewTestCase] = useState({
    input: "",
    output: "",
    isHidden: false,
    showOnFailure: true,
    gradePercentage: 0,
  });
  const [showTestCaseForm, setShowTestCaseForm] = useState(false);
  const [testCasesCollapsed, setTestCasesCollapsed] = useState(false);

  // Get correct programming language for code editor
  const getEditorLanguage = (langId: string): string => {
    // Convert to lowercase for case-insensitive matching
    const lowercaseLangId = langId.toLowerCase();
    
    // Map our language IDs to editor-supported language modes
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
      default: return 'plaintext';
    }
  };

  // Initialize form data from provided initial data
  useEffect(() => {
    if (initialData && isOpen) {
      try {
        console.log("Initializing edit form with data:", initialData);
        
        // Basic question data
        setFormData({
          id: initialData.id || "",
          name: initialData.name || "",
          folderId: initialData.folderId || "",
          questionText: initialData.questionText || "",
          difficulty: initialData.difficulty || "MEDIUM",
          defaultMark: initialData.defaultMark || 1,
          status: initialData.status || "DRAFT",
          languageOptions: initialData.languageOptions || [],
          testCases: initialData.testCases || [],
          version: initialData.version || 1,
        });

        // Set all-or-nothing grading
        setAllOrNothingGrading(initialData.allOrNothingGrading || false);
        
        // Handle language options
        const uniqueLanguages = new Set<string>();
        const existingLanguages = new Map<string, any>();
        
        if (initialData.languageOptions && initialData.languageOptions.length > 0) {
          initialData.languageOptions.forEach((lang: any) => {
            uniqueLanguages.add(lang.language);
            existingLanguages.set(lang.language, lang);
          });
        }
        
        // Set selected languages based on what was in the DB (deduplicated)
        if (uniqueLanguages.size > 0) {
          const selectedLangsFromDB = Array.from(uniqueLanguages) as string[];
          console.log("Setting selected languages:", selectedLangsFromDB);
          setSelectedLanguages(selectedLangsFromDB);
          
          // Set the first language as the active tab
          const firstLang = selectedLangsFromDB[0];
          setActiveLanguageTab(firstLang);
          console.log("Setting active tab to:", firstLang);
          
          // Handle default language
          if (initialData.defaultLanguage && selectedLangsFromDB.includes(initialData.defaultLanguage)) {
            setDefaultLanguage(initialData.defaultLanguage);
          } else if (selectedLangsFromDB.length > 0) {
            setDefaultLanguage(selectedLangsFromDB[0]);
          }
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
  }, [initialData, isOpen, toast]);

  const handleLanguageSelect = (languageId: string) => {
    if (selectedLanguages.includes(languageId)) {
      // If removing the language
      if (defaultLanguage === languageId) {
        // If this was the default language, reset it
        if (selectedLanguages.length > 1) {
          // Set a new default language from remaining languages
          const newDefault = selectedLanguages.find(l => l !== languageId) || "";
          setDefaultLanguage(newDefault);
        } else {
          // No languages left, clear default
          setDefaultLanguage("");
        }
      }
      
      // Remove from selected languages
      setSelectedLanguages(prev => prev.filter(l => l !== languageId));
      
      // Remove from form data
      setFormData(prev => ({
        ...prev,
        languageOptions: prev.languageOptions.filter(opt => opt.language !== languageId)
      }));
      
      // If this was the active tab, change it
      if (activeLanguageTab === languageId) {
        const newActive = selectedLanguages.find(l => l !== languageId);
        setActiveLanguageTab(newActive || "");
      }
    } else {
      // If adding a language, add it to selected and create new language option
      setSelectedLanguages(prev => [...prev, languageId]);
      
      // Create a new language option with unique ID
      const newLanguageOption = {
        id: `lang-${languageId}-${Date.now()}`,
        language: languageId,
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

  const getLanguageName = (langId: string) => {
    return SUPPORTED_LANGUAGES.find(l => l.id === langId)?.name || langId;
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

  const handleSetDefaultLanguage = (langId: string) => {
    setDefaultLanguage(langId);
  };

  const addTestCase = () => {
    const newTestCaseWithId = {
      ...newTestCase,
      id: `tc-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      type: newTestCase.isHidden ? "hidden" : "sample"
    };
    
    setFormData(prev => ({
      ...prev,
      testCases: [...prev.testCases, newTestCaseWithId]
    }));
    
    // Reset the form
    setNewTestCase({
      input: "",
      output: "",
      isHidden: false,
      showOnFailure: true,
      gradePercentage: 0
    });
    
    setEditingTestCaseIndex(null);
  };

  const updateTestCase = (id: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      testCases: prev.testCases.map(tc => 
        tc.id === id ? { ...tc, [field]: value } : tc
      )
    }));
  };

  const editTestCase = (index: number) => {
    const tc = formData.testCases[index];
    setNewTestCase({
      input: tc.input || "",
      output: tc.output || "",
      isHidden: tc.isHidden || tc.type === "hidden",
      showOnFailure: tc.showOnFailure || false,
      gradePercentage: tc.gradePercentage || 0
    });
    setEditingTestCaseIndex(index);
  };

  const deleteTestCase = (index: number) => {
    setFormData(prev => ({
      ...prev,
      testCases: prev.testCases.filter((_, idx) => idx !== index)
    }));
  };

  const distributeGradesEvenly = () => {
    const testCasesCount = formData.testCases.length;
    if (testCasesCount === 0) return;
    
    const gradePerTestCase = 100 / testCasesCount;
    
    setFormData(prev => ({
      ...prev,
      testCases: prev.testCases.map(tc => ({
        ...tc,
        gradePercentage: gradePerTestCase
      }))
    }));
  };

  const prepareSubmissionData = () => {
    // Ensure we have all required fields
    if (!formData.name.trim()) {
      toast({
        title: "Missing Information",
        description: "Please provide a question name",
        variant: "destructive",
      });
      return null;
    }
    
    if (!formData.folderId) {
      toast({
        title: "Missing Information",
        description: "Please select a folder for this question",
        variant: "destructive",
      });
      return null;
    }
    
    if (selectedLanguages.length === 0) {
      toast({
        title: "Missing Information",
        description: "Please select at least one programming language",
        variant: "destructive",
      });
      return null;
    }
    
    if (formData.testCases.length === 0) {
      toast({
        title: "Missing Information",
        description: "Please add at least one test case",
        variant: "destructive",
      });
      return null;
    }
    
    // Calculate if the total percentage adds up to 100%
    const totalPercentage = formData.testCases.reduce((sum, tc) => sum + (tc.gradePercentage || 0), 0);
    if (!allOrNothingGrading && Math.abs(totalPercentage - 100) > 0.01) {
      toast({
        title: "Invalid Grade Distribution",
        description: `Total grade percentage should be 100%, currently it's ${totalPercentage.toFixed(2)}%`,
        variant: "destructive",
      });
      return null;
    }
    
    // Prepare and deduplicate language options
    const dedupedOptions = formData.languageOptions.filter(opt => 
      selectedLanguages.includes(opt.language)
    );
    
    return {
      id: formData.id,
      name: formData.name,
      folderId: formData.folderId,
      type: "CODING",
      difficulty: formData.difficulty,
      defaultMark: formData.defaultMark,
      questionText: formData.questionText,
      defaultLanguage: defaultLanguage, 
      languageOptions: dedupedOptions,
      testCases: formData.testCases,
      allOrNothingGrading: allOrNothingGrading,
      status: formData.status,
      version: formData.version
    };
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const submissionData = prepareSubmissionData();
    if (submissionData) {
      onSubmit(submissionData);
    }
  };

  return (
    <div className="edit-coding-question-modal">
      <form onSubmit={handleSubmit} className="space-y-6 max-h-[calc(90vh-120px)] overflow-y-auto pr-2 pb-4 relative">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="question-name">Question Name</Label>
              <Input
                id="question-name"
                placeholder="Enter question name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="question-folder">Folder</Label>
              <div className="flex gap-2">
                <Select 
                  value={formData.folderId} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, folderId: value }))}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a folder" />
                  </SelectTrigger>
                  <SelectContent>
                    {folders.map((folder) => (
                      <SelectItem key={folder.id} value={folder.id}>
                        {folder.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button type="button" variant="outline" onClick={onAddFolder}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="question-text">Question Text</Label>
            <RichTextEditor
              value={formData.questionText}
              onChange={(value) => setFormData(prev => ({ ...prev, questionText: value }))}
              placeholder="Enter question text/description..."
              className="min-h-[250px]"
              editorClassName="min-h-[200px]"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
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
              <Label htmlFor="default-mark">Default Mark</Label>
              <Input
                id="default-mark"
                type="number"
                min="0"
                step="0.5"
                value={formData.defaultMark}
                onChange={(e) => setFormData(prev => ({ ...prev, defaultMark: parseFloat(e.target.value) || 0 }))}
              />
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

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Label>Programming Languages</Label>
              <div className="flex items-center gap-2">
                <Button 
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    // Add all languages at once
                    const allLangIds = SUPPORTED_LANGUAGES.map(lang => lang.id);
                    
                    // Keep existing language options
                    const currentOptions = new Map();
                    formData.languageOptions.forEach(opt => {
                      currentOptions.set(opt.language, opt);
                    });
                    
                    // Create language options for all supported languages
                    const newLangOptions = [];
                    
                    // For each supported language
                    for (const langId of allLangIds) {
                      // If we already have this language, keep its existing data
                      if (currentOptions.has(langId)) {
                        newLangOptions.push(currentOptions.get(langId));
                      } else {
                        // Otherwise create a new empty option
                        newLangOptions.push({
                          id: `lang-${langId}-${Date.now()}`,
                          language: langId,
                          solution: "",
                          preloadCode: ""
                        });
                      }
                    }
                    
                    // Update state
                    setSelectedLanguages(allLangIds);
                    
                    // Keep the current active tab or use the first language
                    if (!allLangIds.includes(activeLanguageTab)) {
                      setActiveLanguageTab(allLangIds[0]);
                    }
                    
                    // Keep the current default language or use the first language
                    if (!allLangIds.includes(defaultLanguage)) {
                      setDefaultLanguage(allLangIds[0]);
                    }
                    
                    setFormData(prev => ({
                      ...prev,
                      languageOptions: newLangOptions
                    }));
                  }}
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
                      <SelectItem key={`lang-select-${langId}`} value={langId}>
                        {getLanguageName(langId)}
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
                    {selectedLanguages.map((langId, index) => (
                      <TabsTrigger key={`${langId}-${index}`} value={langId} className="whitespace-nowrap">
                        {getLanguageName(langId)}
                      </TabsTrigger>
                    ))}
                  </div>
                </TabsList>
                {selectedLanguages.map((langId, index) => {
                  const langOption = getLanguageOption(langId);
                  return (
                    <TabsContent key={`${langId}-${index}`} value={langId}>
                      <div className="space-y-4">
                        <Tabs defaultValue="solution">
                          <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="solution">Solution</TabsTrigger>
                            <TabsTrigger value="preload">Preload Code</TabsTrigger>
                          </TabsList>
                          <TabsContent value="solution">
                            <CodeEditor
                              value={langOption?.solution || ""}
                              onChange={(value) => updateLanguageOption(langId, 'solution', value)}
                              language={getEditorLanguage(langId)}
                              className="h-[200px]"
                            />
                          </TabsContent>
                          <TabsContent value="preload">
                            <CodeEditor
                              value={langOption?.preloadCode || ""}
                              onChange={(value) => updateLanguageOption(langId, 'preloadCode', value)}
                              language={getEditorLanguage(langId)}
                              className="h-[150px]"
                            />
                            <p className="text-sm text-muted-foreground mt-2">
                              This code will be preloaded in the editor for students
                            </p>
                          </TabsContent>
                        </Tabs>
                      </div>
                    </TabsContent>
                  );
                })}
              </Tabs>
            )}
          </div>

          <div className="space-y-4 mt-6">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="sm" 
                  className="p-0 h-7"
                  onClick={() => setTestCasesCollapsed(!testCasesCollapsed)}
                >
                  {testCasesCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </Button>
                <Label>Test Cases</Label>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
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
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm"
                    onClick={distributeGradesEvenly}
                  >
                    Distribute Grades Evenly
                  </Button>
                )}
              </div>
            </div>

            {!testCasesCollapsed && (
              <>
                {/* Test Case Stats */}
                {formData.testCases.length > 0 && (
                  <div className="text-sm text-right mb-2">
                    <span className="mr-4">Sample test cases: {formData.testCases.filter(tc => tc.type === "sample").length}</span>
                    <span className="mr-4">Hidden test cases: {formData.testCases.filter(tc => tc.type === "hidden").length}</span>
                    <span>
                      Total grading: {formData.testCases.reduce((sum, testCase) => sum + (testCase.gradePercentage || 0), 0)}%
                      {formData.testCases.reduce((sum, testCase) => sum + (testCase.gradePercentage || 0), 0) !== 100 && !allOrNothingGrading && (
                        <span className="text-destructive ml-2">(Should equal 100%)</span>
                      )}
                    </span>
                  </div>
                )}

                {/* Test Cases Table */}
                {formData.testCases.length > 0 && formData.testCases.map((testCase, index) => (
                  <div key={testCase.id || index} className="space-y-4 p-4 border rounded-lg">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-2">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id={`sample-${testCase.id}`}
                            checked={testCase.type === "sample"}
                            onCheckedChange={(checked) => {
                              const newType = checked ? "sample" : "hidden";
                              updateTestCase(testCase.id, "type", newType);
                              
                              if (newType === "sample") {
                                updateTestCase(testCase.id, "gradePercentage", 0);
                                if (allOrNothingGrading) {
                                  setTimeout(() => distributeGradesEvenly(), 0);
                                }
                              } else if (newType === "hidden" && allOrNothingGrading) {
                                setTimeout(() => distributeGradesEvenly(), 0);
                              }
                            }}
                          />
                          <Label htmlFor={`sample-${testCase.id}`}>Sample</Label>
                        </div>
                        <div className="flex items-center space-x-2 ml-4">
                          <Checkbox
                            id={`hidden-${testCase.id}`}
                            checked={testCase.type === "hidden"}
                            onCheckedChange={(checked) => {
                              const newType = checked ? "hidden" : "sample";
                              updateTestCase(testCase.id, "type", newType);
                              
                              if (newType === "sample") {
                                updateTestCase(testCase.id, "gradePercentage", 0);
                                if (allOrNothingGrading) {
                                  setTimeout(() => distributeGradesEvenly(), 0);
                                }
                              } else if (newType === "hidden" && allOrNothingGrading) {
                                setTimeout(() => distributeGradesEvenly(), 0);
                              }
                            }}
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
                        onClick={() => deleteTestCase(index)}
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
                          disabled={allOrNothingGrading || testCase.type === "sample"}
                        />
                        <span className="ml-2">%</span>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Test Case Form Button */}
                {!editingTestCaseIndex && !showTestCaseForm && (
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full border-dashed"
                    onClick={() => setShowTestCaseForm(true)}
                  >
                    <Plus className="h-4 w-4 mr-2" /> Add Test Case
                  </Button>
                )}

                {/* New/Edit Test Case Form */}
                {(showTestCaseForm || editingTestCaseIndex !== null) && (
                  <div className="space-y-4 border p-4 rounded-lg">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-medium">
                        {editingTestCaseIndex !== null ? "Edit Test Case" : "Add Test Case"}
                      </h3>
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="icon"
                        onClick={() => {
                          setEditingTestCaseIndex(null);
                          setNewTestCase({
                            input: "",
                            output: "",
                            isHidden: false,
                            showOnFailure: true,
                            gradePercentage: 0
                          });
                          setShowTestCaseForm(false);
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="test-input">Input</Label>
                        <Textarea
                          id="test-input"
                          placeholder="Enter test input"
                          value={newTestCase.input}
                          onChange={(e) => setNewTestCase(prev => ({ ...prev, input: e.target.value }))}
                          rows={4}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="test-output">Expected Output</Label>
                        <Textarea
                          id="test-output"
                          placeholder="Enter expected output"
                          value={newTestCase.output}
                          onChange={(e) => setNewTestCase(prev => ({ ...prev, output: e.target.value }))}
                          rows={4}
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="test-hidden">Test Case Type</Label>
                        <Select 
                          value={newTestCase.isHidden ? "hidden" : "sample"} 
                          onValueChange={(value) => setNewTestCase(prev => ({ ...prev, isHidden: value === "hidden" }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="sample">Sample (visible to students)</SelectItem>
                            <SelectItem value="hidden">Hidden (only for evaluation)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="test-grade">Grade Percentage</Label>
                        <Input
                          id="test-grade"
                          type="number"
                          min="0"
                          max="100"
                          placeholder="Grade percentage"
                          value={newTestCase.gradePercentage}
                          onChange={(e) => setNewTestCase(prev => ({ ...prev, gradePercentage: parseFloat(e.target.value) || 0 }))}
                        />
                      </div>
                      
                      <div className="flex items-center h-full pt-8">
                        <div className="flex items-center gap-2">
                          <Checkbox
                            id="show-on-failure"
                            checked={newTestCase.showOnFailure}
                            onCheckedChange={(checked) => 
                              setNewTestCase(prev => ({ ...prev, showOnFailure: checked === true }))
                            }
                          />
                          <Label htmlFor="show-on-failure">Show on failure</Label>
                        </div>
                      </div>
                    </div>
                    
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => {
                        if (editingTestCaseIndex !== null) {
                          updateTestCase(formData.testCases[editingTestCaseIndex].id, "type", newTestCase.isHidden ? "hidden" : "sample");
                          updateTestCase(formData.testCases[editingTestCaseIndex].id, "showOnFailure", newTestCase.showOnFailure);
                          updateTestCase(formData.testCases[editingTestCaseIndex].id, "gradePercentage", newTestCase.gradePercentage);
                        } else {
                          addTestCase();
                        }
                        setShowTestCaseForm(false);
                      }}
                      disabled={!newTestCase.input.trim() || !newTestCase.output.trim()}
                    >
                      {editingTestCaseIndex !== null ? "Update Test Case" : "Add Test Case"}
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-6 sticky bottom-0 bg-background pb-2 border-t mt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              Save Changes
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
} 