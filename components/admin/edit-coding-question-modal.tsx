import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Trash2, Code, ChevronRight, ChevronDown, Terminal, X, FileEdit, Type, Folder, FileText, BarChart, Hash, CheckCircle, CheckCheck } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { CodeEditor } from "@/components/ui/code-editor";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { useJudge0Languages } from '../hooks/useJudge0Languages';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription, DialogClose } from "@/components/ui/dialog";

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
  const { languages, loading, error } = useJudge0Languages();
  const editorRef = React.useRef<any>(null);

  // Label modern style
  const labelClass = "block text-[1.08rem] font-semibold tracking-wide text-foreground/90 mb-1 transition-colors duration-200 group-focus-within:text-primary";
  // Input/Textarea modern style
  const inputClass = "rounded-xl shadow-sm border border-primary/20 focus:ring-2 focus:ring-primary/40 bg-gradient-to-br from-background/80 to-muted/40 px-4 py-2 text-base font-medium transition-all duration-200 placeholder:text-muted-foreground/60 focus:border-primary/50 focus:bg-background/90";
  // SelectTrigger modern style
  const selectTriggerClass = "rounded-xl shadow-sm border border-primary/20 focus:ring-2 focus:ring-primary/40 bg-gradient-to-br from-background/80 to-muted/40 px-4 py-2 text-base font-medium transition-all duration-200 hover:border-primary/40 focus:border-primary/60";

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
         
          setSelectedLanguages(selectedLangsFromDB);
          
          // Set the first language as the active tab
          const firstLang = selectedLangsFromDB[0];
          setActiveLanguageTab(firstLang);
          
          
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

  useEffect(() => {
    if (isOpen && editorRef.current) {
      setTimeout(() => {
        editorRef.current.focus();
      }, 100);
    }
  }, [isOpen]);

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

  const handleAddAllLanguages = () => {
    if (!languages || languages.length === 0) return;
    const allLangIds = languages.map(lang => String(lang.id));
    setSelectedLanguages(allLangIds);
    // Optionally, add languageOptions for each
    setFormData(prev => ({
      ...prev,
      languageOptions: allLangIds.map(langId => ({
        id: `lang-${langId}-${Date.now()}`,
        language: langId,
        solution: '',
        preloadCode: ''
      }))
    }));
    // Set the first language as default and active
    setDefaultLanguage(allLangIds[0] || '');
    setActiveLanguageTab(allLangIds[0] || '');
  };

  const getLanguageName = (langId: string) => {
    return languages.find(l => String(l.id) === langId)?.name || langId;
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
      selectedLanguages.includes(String(opt.language))
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
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="max-w-[90vw] max-h-[95vh] overflow-hidden rounded-2xl shadow-2xl border-0 p-0"
      >
        <DialogClose className="absolute right-4 top-4 rounded-full opacity-80 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 z-50">
          <X className="h-5 w-5" />
          <span className="sr-only">Close</span>
        </DialogClose>
        
        {/* Enhanced Modern Header */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary via-blue-600 to-indigo-700 opacity-90"></div>
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRoLTJ2LTJoMnYyem0wLTRoLTJ2LTJoMnYyem0wLTRoLTJWMWgydjI1eiIvPjwvZz48L2c+PC9zdmc+')] opacity-10"></div>
          <div className="relative z-10 flex items-center gap-5 px-8 pt-8 pb-6">
            <div className="flex-shrink-0 flex h-14 w-14 items-center justify-center rounded-full bg-white/10  shadow-lg text-white">
              <Code className="h-7 w-7 text-white drop-shadow-md" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-white drop-shadow-md flex items-center gap-2 transform transition-all">
                {initialData ? "Update Coding Question" : "Create New Coding Question"}
                <span className="inline-block animate-pulse bg-green-400 w-2 h-2 rounded-full ml-2"></span>
              </h2>
              <span className="text-white/90 mt-1 text-base font-normal max-w-3xl block">
                {initialData 
                  ? "Update your coding question with the necessary information, language options, and test cases."
                  : "Create a new coding question by providing details, setting up programming languages, and adding test cases."}
              </span>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-background/80 to-transparent z-10"></div>
        </div>
        
        {/* Form with correct fullscreen handling */}
        <form 
          onSubmit={handleSubmit} 
          className="space-y-6 pr-2 pb-4 relative px-8 pt-6"
        >
          <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2 bg-white/60 dark:bg-background/60 rounded-2xl border border-primary/10 shadow-sm p-5 ">
                <Label className={labelClass + " flex items-center gap-2"} htmlFor="question-name">
                  <Type className="h-4 w-4 text-primary/80" /> Question Name
                </Label>
              <Input
                id="question-name"
                placeholder="Enter question name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                required
                  className={inputClass + " focus:shadow-lg focus:ring-2 focus:ring-primary/40"}
              />
            </div>
              <div className="space-y-2 bg-white/60 dark:bg-background/60 rounded-2xl border border-primary/10 shadow-sm p-5 ">
                <Label className={labelClass + " flex items-center gap-2"} htmlFor="question-folder">
                  <Folder className="h-4 w-4 text-primary/80" /> Folder
                </Label>
              <div className="flex gap-2">
                <Select 
                  value={formData.folderId} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, folderId: value }))}
                >
                    <SelectTrigger className={selectTriggerClass + " focus:shadow-lg focus:ring-2 focus:ring-primary/40"}>
                    <SelectValue placeholder="Select a folder" />
                  </SelectTrigger>
                    <SelectContent className="rounded-xl border border-primary/10 shadow-lg">
                    {folders.map((folder) => (
                        <SelectItem key={folder.id} value={folder.id} className="hover:bg-primary/5 cursor-pointer focus:bg-primary/5">
                        {folder.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                  <Button type="button" variant="outline" onClick={onAddFolder} className="rounded-full bg-white/70 dark:bg-background/70 hover:bg-primary/10 hover:text-primary transition-colors">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
            <div className="space-y-2 bg-white/60 dark:bg-background/60 rounded-2xl border border-primary/10 shadow-sm p-5 ">
              <Label className={labelClass + " flex items-center gap-2"} htmlFor="question-text">
                <FileText className="h-4 w-4 text-primary/80" /> Question Text
              </Label>
              <div 
                className="min-h-[250px] border rounded-xl overflow-hidden shadow-inner transition-all focus-within:border-primary/30 focus-within:shadow-md"
                style={{ position: "relative", zIndex: 0 }}
              >
            <RichTextEditor
              value={formData.questionText}
              onChange={(value) => setFormData(prev => ({ ...prev, questionText: value }))}
              placeholder="Enter question text/description..."
                  className="min-h-[200px]"
                  editorProps={{
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
                    z_index: 99999,
                  }}
                  onInit={(editor) => { editorRef.current = editor; }}
            />
          </div>
            </div>
          <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2 bg-white/60 dark:bg-background/60 rounded-2xl border border-primary/10 shadow-sm p-5 ">
                <Label className={labelClass + " flex items-center gap-2"} htmlFor="difficulty">
                  <BarChart className="h-4 w-4 text-primary/80" /> Difficulty
                </Label>
              <Select 
                value={formData.difficulty} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, difficulty: value }))}
              >
                  <SelectTrigger className={selectTriggerClass + " focus:shadow-lg focus:ring-2 focus:ring-primary/40"}>
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
              <div className="space-y-2 bg-white/60 dark:bg-background/60 rounded-2xl border border-primary/10 shadow-sm p-5 ">
                <Label className={labelClass + " flex items-center gap-2"} htmlFor="default-mark">
                  <Hash className="h-4 w-4 text-primary/80" /> Default Mark
                </Label>
              <Input
                id="default-mark"
                type="number"
                min="0"
                step="0.5"
                value={formData.defaultMark}
                onChange={(e) => setFormData(prev => ({ ...prev, defaultMark: parseFloat(e.target.value) || 0 }))}
                  className={inputClass + " focus:shadow-lg focus:ring-2 focus:ring-primary/40"}
              />
            </div>
              <div className="space-y-2 bg-white/60 dark:bg-background/60 rounded-2xl border border-primary/10 shadow-sm p-5 ">
                <Label className={labelClass + " flex items-center gap-2"} htmlFor="status">
                  <CheckCircle className="h-4 w-4 text-primary/80" /> Status
                </Label>
              <Select 
                value={formData.status} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}
              >
                  <SelectTrigger className={selectTriggerClass + " focus:shadow-lg focus:ring-2 focus:ring-primary/40"}>
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

            {/* Languages section - already styled */}

            {/* Test cases section styling */}
            <div className="mt-8 bg-white/60 dark:bg-background/60 rounded-2xl border border-primary/10 shadow-md p-5 ">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary shadow-inner">
                  <Terminal className="h-5 w-5 text-primary" />
              </div>
                <div>
                  <div className="text-lg font-semibold tracking-wide text-foreground/90">Test Cases</div>
                  <p className="text-sm text-muted-foreground">Define test cases to verify student solutions</p>
                </div>
                <div className="ml-auto">
                  <div className="flex items-center gap-3">
                  <Switch
                    id="all-or-nothing"
                    checked={allOrNothingGrading}
                    onCheckedChange={(checked) => {
                      setAllOrNothingGrading(checked);
                      if (checked) {
                        distributeGradesEvenly();
                      }
                    }}
                      className="data-[state=checked]:bg-primary"
                  />
                    <Label className="text-sm font-medium" htmlFor="all-or-nothing">All or Nothing Grading</Label>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1 ml-6">
                    {allOrNothingGrading 
                      ? "All tests must pass to get any points" 
                      : "Each test contributes its percentage to grade"}
                  </div>
              </div>
            </div>

              {/* Test case stats */}
                {formData.testCases.length > 0 && (
                <div className="flex items-center justify-end gap-4 mb-4 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-blue-500"></span>
                    <span>Sample: {formData.testCases.filter(tc => tc.type === "sample").length}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-purple-500"></span>
                    <span>Hidden: {formData.testCases.filter(tc => tc.type === "hidden").length}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Total:</span>
                    <span className={cn(
                      "font-medium",
                      !allOrNothingGrading && 
                      Math.abs(formData.testCases.reduce((sum, tc) => sum + (tc.gradePercentage || 0), 0) - 100) > 0.01 
                        ? "text-destructive" 
                        : "text-foreground"
                    )}>
                      {formData.testCases.reduce((sum, tc) => sum + (tc.gradePercentage || 0), 0)}%
                    </span>
                  </div>
                  </div>
                )}

              {/* Test case list */}
              <div className="space-y-4">
                {formData.testCases.map((testCase, index) => (
                  <div 
                    key={testCase.id || index} 
                    className={cn(
                      "p-4 border rounded-xl transition-all duration-200",
                      testCase.type === "sample" 
                        ? "bg-blue-50/50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-900/30" 
                        : "bg-purple-50/50 dark:bg-purple-900/10 border-purple-200 dark:border-purple-900/30"
                    )}
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-4">
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
                            className={cn(
                              "border-2 text-white",
                              testCase.type === "sample" 
                                ? "data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500" 
                                : "data-[state=checked]:bg-purple-500 data-[state=checked]:border-purple-500"
                            )}
                          />
                          <Label className="text-sm font-medium" htmlFor={`sample-${testCase.id}`}>
                            Sample
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
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
                            className={cn(
                              "border-2 text-white",
                              testCase.type === "hidden" 
                                ? "data-[state=checked]:bg-purple-500 data-[state=checked]:border-purple-500" 
                                : "data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
                            )}
                          />
                          <Label className="text-sm font-medium" htmlFor={`hidden-${testCase.id}`}>
                            Hidden
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id={`show-on-failure-${testCase.id}`}
                            checked={testCase.showOnFailure}
                            onCheckedChange={(checked) => 
                              updateTestCase(testCase.id, "showOnFailure", !!checked)
                            }
                            className="border-2 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                          />
                          <Label className="text-sm font-medium" htmlFor={`show-on-failure-${testCase.id}`}>
                            Show on failure
                          </Label>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteTestCase(index)}
                        className="h-8 w-8 rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mt-4">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Input</Label>
                        <Textarea
                          value={testCase.input}
                          onChange={(e) => updateTestCase(testCase.id, "input", e.target.value)}
                          placeholder="Enter test case input"
                          className="font-mono text-sm min-h-[100px] rounded-lg border-muted bg-card/50 focus:border-primary/30 focus:ring-1 focus:ring-primary/40 transition-all"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Expected Output</Label>
                        <Textarea
                          value={testCase.output}
                          onChange={(e) => updateTestCase(testCase.id, "output", e.target.value)}
                          placeholder="Enter expected output"
                          className="font-mono text-sm min-h-[100px] rounded-lg border-muted bg-card/50 focus:border-primary/30 focus:ring-1 focus:ring-primary/40 transition-all"
                        />
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <Label className="text-sm font-medium">Grade Percentage</Label>
                      <div className="flex items-center mt-2">
                        <Input
                          type="number"
                          value={testCase.gradePercentage}
                          onChange={(e) => {
                            if (allOrNothingGrading) return;
                            const value = Math.min(100, Math.max(0, parseInt(e.target.value) || 0));
                            updateTestCase(testCase.id, "gradePercentage", value);
                          }}
                          className={cn(
                            "w-16 h-8 px-2 text-sm font-mono rounded-md border-muted",
                            testCase.type === "sample" && "opacity-50"
                          )}
                          min={0}
                          max={100}
                          disabled={allOrNothingGrading || testCase.type === "sample"}
                        />
                        <span className="ml-2 text-sm">%</span>
                        <div className="ml-4 h-1 bg-muted flex-1 rounded overflow-hidden">
                          <div 
                            className={cn(
                              "h-full", 
                              testCase.type === "sample" 
                                ? "bg-blue-500/20" 
                                : "bg-primary"
                            )} 
                            style={{ width: `${Math.min(100, testCase.gradePercentage)}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Add test case button */}
                  <Button
                    type="button"
                    variant="outline"
                  onClick={addTestCase}
                  className="w-full border-dashed border-2 border-muted-foreground/20 rounded-xl py-6 text-muted-foreground hover:border-primary/30 hover:text-primary hover:bg-primary/5 transition-colors"
                >
                  <Plus className="mr-2 h-5 w-5" />
                  Add Test Case
                      </Button>
                    </div>
                      </div>
                    </div>
                    
          {/* Enhanced Modern Footer */}
          <div className="relative pt-6 mt-8">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-muted-foreground/20 to-transparent"></div>
            <div className="flex flex-col sm:flex-row justify-end gap-3 py-4 bg-gradient-to-br from-background via-background/95 to-background/90  rounded-b-xl px-8 border border-muted/20 border-t-0 shadow-lg">
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
                  className="rounded-full px-6 py-2 font-medium border-2 border-muted-foreground/20 hover:border-primary/60 transition-all shadow-sm hover:shadow-md hover:bg-muted/50 "
                  onClick={onClose}
                >
              Cancel
            </Button>
                <Button
                  type="submit"
                  className="rounded-full px-8 py-2 font-bold bg-gradient-to-r from-primary to-blue-500 text-white shadow-lg hover:shadow-xl hover:from-blue-600 hover:to-primary/90 transition-all duration-300 relative overflow-hidden group"
                >
                  <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-blue-400/20 via-transparent to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></span>
                  <span className="relative flex items-center">
                    <CheckCheck className="mr-2 h-4 w-4" /> Save Changes
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