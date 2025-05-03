"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CodeEditor } from "@/components/nexpractice/code-editor"
import { ProblemDescription } from "@/components/nexpractice/problem-description"
import { TestCases } from "@/components/nexpractice/test-cases"
import { ResultPanel } from "@/components/nexpractice/result-panel"
import { CompanyTags } from "@/components/nexpractice/company-tags"
import { PremiumSolutions } from "@/components/nexpractice/premium-solutions"
import { GuidedTour } from "@/components/nexpractice/guided-tour"
import { sampleProblem } from "@/data/problems"
import {
  Play,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  List,
  Star,
  Bell,
  Settings,
  FileCode,
  CheckSquare,
  Info,
  Crown,
  Lock,
  BarChart2,
  Video,
  BookOpenCheck,
  Lightbulb,
  MessageSquare,
  Clock,
  Maximize,
  Save,
  Folder,
  Copy,
  MoreHorizontal,
  Github,
  FileText,
  ChevronDown,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ModeToggle } from "@/components/nexpractice/mode-toggle"
import { motion, AnimatePresence } from "framer-motion"
import { ExpandableProblemSidebar } from "@/components/nexpractice/ui/sidebar"
import { runWithJudge0 } from "@/utils/judge0"
import { useSession } from "next-auth/react"

// Define language option interface
interface LanguageOption {
  id: number | string;
  languageId: number;
  name: string;
  preloadCode: string;
  solution?: string;
}

// Define problem interface to match API response
interface Problem {
  id: string;
  number?: number;
  title: string;
  difficulty: string;
  tags?: string[];
  level?: number;
  description: string;
  inputFormat?: string;
  outputFormat?: string;
  // API response no longer includes constraints
  sampleTestCases: any[];
  hiddenTestCases?: any[];
  starterCode?: string;
  solution?: string;
  explanation?: string;
  xpReward?: number;
  languageOptions?: LanguageOption[];
}

// Judge0 language map for showing tooltips and handling language versions
const JUDGE0_LANGUAGE_MAP: Record<number, string> = {
  // C language family
  50: "C (GCC 9.2.0)",
  54: "C++ (GCC 9.2.0)",
  51: "C# (Mono 6.6.0.161)",
  
  // JavaScript/TypeScript
  63: "JavaScript (Node.js 12.14.0)",
  74: "TypeScript (3.7.4)",
  
  // Java
  62: "Java (OpenJDK 13.0.1)",
  
  // Python
  71: "Python (3.8.1)",
  70: "Python (2.7.17)",
  
  // Ruby
  72: "Ruby (2.7.0)",
  
  // Go
  60: "Go (1.13.5)",
  
  // Other languages
  73: "Rust (1.40.0)",
  68: "PHP (7.4.1)",
  83: "Swift (5.2.3)",
  78: "Kotlin (1.3.70)",
  
  // Legacy IDs kept for reference
  // (Don't use these for new submissions)
  1: "C (GCC 7.4.0) [Deprecated]",
  2: "C++ (GCC 7.4.0) [Deprecated]",
  3: "C++ (GCC 8.3.0) [Deprecated]",
  4: "C++ (GCC 9.2.0) [Deprecated]",
  5: "C# (Mono 6.6.0.161) [Deprecated]",
  6: "C# (.NET Core 3.1.0) [Deprecated]",
  7: "C# (Mono 4.6.2.0) [Deprecated]",
  8: "JavaScript (Node.js 12.14.0) [Deprecated]",
  9: "JavaScript (Node.js 10.16.3) [Deprecated]",
  10: "Java (OpenJDK 13.0.1) [Deprecated]",
  11: "Java (OpenJDK 13.0.1) [Use ID 62]", // Map to current Java
  12: "Java (OpenJDK 8) [Deprecated]",
  13: "Python (3.8.1) [Deprecated]",
  14: "Python (2.7.17) [Deprecated]",
  15: "Ruby (2.7.0) [Deprecated]",
  16: "Go (1.13.5) [Deprecated]",
};

// Helper function to separate base language name and version
function getLanguageBaseAndVersion(langName: string): React.ReactNode {
  // Split by space to separate base name and version
  const parts = langName.split(' ');
  if (parts.length === 1) {
    // No version part
    return <>{langName}</>;
  }
  
  // Base name is the first part, version is the rest
  const baseName = parts[0];
  const version = parts.slice(1).join(' ');
  
  return (
    <>
      {baseName} <span className="version">{version}</span>
    </>
  );
}

// Helper function to get an icon for each language
function getLanguageIcon(langName: string): React.ReactNode {
  const baseLanguage = langName.split(' ')[0].toLowerCase();
  
  // Language-specific colors
  const colorMap: Record<string, string> = {
    javascript: '#F7DF1E',
    typescript: '#3178C6',
    python: '#3776AB',
    java: '#ED8B00',
    'c++': '#00599C',
    'c#': '#239120',
    c: '#A8B9CC',
    go: '#00ADD8',
    rust: '#DEA584',
    php: '#777BB4',
    ruby: '#CC342D',
    swift: '#F05138',
    kotlin: '#7F52FF',
    dart: '#0175C2'
  };
  
  // Get color based on language
  const color = colorMap[baseLanguage] || '#A0AEC0';
  
  return (
    <div
      style={{
        backgroundColor: color,
        width: '12px',
        height: '12px',
        borderRadius: '3px',
      }}
    />
  );
}

// Function to update deprecated language IDs to current ones
function updateLanguageId(languageId: number): number {
  // Map deprecated IDs to current ones
  switch (languageId) {
    // Java
    case 10:
    case 11:
    case 12:
      return 62; // Current Java ID
      
    // JavaScript
    case 8:
    case 9:
      return 63; // Current Node.js ID
      
    // Python 3
    case 13:
    case 44:
      return 71; // Current Python 3 ID
      
    // Python 2
    case 14:
      return 70; // Current Python 2 ID
      
    // C++
    case 2:
    case 3:
    case 4:
    case 23:
    case 24:
      return 54; // Current C++ ID
      
    // C
    case 1:
      return 50; // Current C ID
      
    // C#
    case 5:
    case 6:
    case 7:
      return 51; // Current C# ID
      
    // Ruby
    case 15:
    case 35:
      return 72; // Current Ruby ID
      
    // Go
    case 16:
      return 60; // Current Go ID
      
    // Rust
    case 20:
      return 73; // Current Rust ID
      
    // PHP
    case 21:
      return 68; // Current PHP ID
      
    // TypeScript
    case 22:
      return 74; // Current TypeScript ID
      
    // Swift
    case 19:
      return 83; // Current Swift ID
      
    // Kotlin
    case 25:
      return 78; // Current Kotlin ID
      
    // Keep IDs that are already current
    default:
      return languageId;
  }
}

export default function ProblemPage() {
  const [code, setCode] = useState(`function twoSum(nums, target) {
  // Your solution here
}`)
  const [results, setResults] = useState<any>(null)
  const [isRunning, setIsRunning] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitResults, setSubmitResults] = useState<any>(null)
  const [leftPanelWidth, setLeftPanelWidth] = useState(50) // Default 50%
  const [bottomPanelHeight, setBottomPanelHeight] = useState(55) // Default 55% of right panel
  const [isResizingHorizontal, setIsResizingHorizontal] = useState(false)
  const [isResizingVertical, setIsResizingVertical] = useState(false)
  const [showVisualization, setShowVisualization] = useState(false)
  const [language, setLanguage] = useState("")
  const [availableLanguages, setAvailableLanguages] = useState<LanguageOption[]>([])
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)
  const [showPremiumModal, setShowPremiumModal] = useState(false)
  const [isPremiumUser, setIsPremiumUser] = useState(false)
  const [savedSnippets, setSavedSnippets] = useState<{name: string, code: string, language: string}[]>([])
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const [snippetName, setSnippetName] = useState("")
  const [codeCopied, setCodeCopied] = useState(false)
  const [focusMode, setFocusMode] = useState(false)
  const [problem, setProblem] = useState<Problem | null>(null)
  const [timeElapsed, setTimeElapsed] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [isLanguageLoading, setIsLanguageLoading] = useState(true)
  const [isCodeLoading, setIsCodeLoading] = useState(true)
  const [languageFilter, setLanguageFilter] = useState("")
  const [languageDropdownOpen, setLanguageDropdownOpen] = useState(false)
  const [editorSettingsOpen, setEditorSettingsOpen] = useState(false)
  const editorSettingsRef = useRef<{ showSettings: () => void } | null>(null)
  const [testTabValue, setTestTabValue] = useState("testcase") // Track active test tab

  const confettiRef = useRef<HTMLDivElement>(null)
  const rightPanelRef = useRef<HTMLDivElement>(null)
  const previousHeightRef = useRef(bottomPanelHeight)
  const previousLeftWidthRef = useRef(leftPanelWidth)

  const params = useParams()
  const problemId = params.id as string

  const { data: session } = useSession();

  // Reset layout function
  const resetLayout = () => {
    setLeftPanelWidth(50)
    setBottomPanelHeight(30)
  }

  // Confetti effect
  useEffect(() => {
    if (showConfetti && confettiRef.current) {
      const colors = ["#7c3aed", "#3b82f6", "#10b981", "#f59e0b", "#ef4444"]
      
      for (let i = 0; i < 100; i++) {
        const confetti = document.createElement("div")
        confetti.className = "confetti"
        confetti.style.left = `${Math.random() * 100}%`
        confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)]
        confetti.style.width = `${Math.random() * 10 + 5}px`
        confetti.style.height = confetti.style.width
        confetti.style.animationDuration = `${Math.random() * 3 + 2}s`
        confetti.style.animationDelay = `${Math.random() * 0.5}s`

        confettiRef.current.appendChild(confetti)

        setTimeout(() => {
          confetti.remove()
        }, 5000)
      }

      // Show success message
      // You can add a toast notification here if you have a toast component
      
      setTimeout(() => {
        setShowConfetti(false)
      }, 5000)
    }
  }, [showConfetti])

  // Load saved snippets from localStorage
  useEffect(() => {
    const savedItems = localStorage.getItem('codingSnippets');
    if (savedItems) {
      try {
        setSavedSnippets(JSON.parse(savedItems));
      } catch (e) {
        console.error('Error loading saved snippets', e);
      }
    }
  }, []);

  // Save snippets to localStorage when updated
  useEffect(() => {
    if (savedSnippets.length > 0) {
      localStorage.setItem('codingSnippets', JSON.stringify(savedSnippets));
    }
  }, [savedSnippets]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + Enter to run code
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault()
        runCode()
      }

      // Escape to exit fullscreen or focus mode
      if (e.key === "Escape" && (isFullscreen || focusMode)) {
        e.preventDefault()
        
        if (isFullscreen) {
          setIsFullscreen(false)
        }
        
        if (focusMode) {
          toggleFocusMode()
        }
      }
      
      // Escape to exit focus mode
      if (e.key === "Escape" && focusMode) {
        toggleFocusMode()
      }
      
      // F11 to toggle fullscreen
      if (e.key === "F11") {
        e.preventDefault()
        toggleFullscreen()
      }

      // Ctrl/Cmd + S to save snippet
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault()
        setShowSaveDialog(true)
      }
      
      // Ctrl/Cmd + Shift + F to toggle focus mode
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === "f" || e.key === "F")) {
        e.preventDefault()
        toggleFocusMode()
      }
      
      // Alt+0 to toggle focus mode
      if (e.altKey && e.key === "0") {
        e.preventDefault()
        toggleFocusMode()
      }
      
      // Layout adjustments with Alt + number keys
      if (e.altKey) {
        // Horizontal layout adjustments
        if (e.key === "1") {
          e.preventDefault()
          setLeftPanelWidth(30) // 30:70 layout
        } else if (e.key === "2") {
          e.preventDefault()
          setLeftPanelWidth(50) // 50:50 layout
        } else if (e.key === "3") {
          e.preventDefault()
          setLeftPanelWidth(70) // 70:30 layout
        }
        
        // Vertical layout adjustments
        if (e.key === "8") {
          e.preventDefault()
          setBottomPanelHeight(30) // 70:30 layout (new default)
        } else if (e.key === "7") {
          e.preventDefault()
          setBottomPanelHeight(40) // 60:40 layout
        } else if (e.key === "9") {
          e.preventDefault()
          setBottomPanelHeight(20) // 80:20 layout - more editor space
        } else if (e.key === "5") {
          e.preventDefault()
          setBottomPanelHeight(50) // 50:50 layout
        }
        
        // Reset layout with Alt+R
        if (e.key === "r" || e.key === "R") {
          e.preventDefault()
          resetLayout()
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isFullscreen, code, language, resetLayout, focusMode])

  // Horizontal resizing
  const startHorizontalResize = (e: React.MouseEvent) => {
    e.preventDefault()
    setIsResizingHorizontal(true)
    document.addEventListener("mousemove", handleHorizontalResize)
    document.addEventListener("mouseup", stopHorizontalResize)
  }

  const handleHorizontalResize = (e: MouseEvent) => {
    if (!isResizingHorizontal) return

    const containerWidth = window.innerWidth

    // Calculate percentage width based on mouse position
    const newWidth = (e.clientX / containerWidth) * 100

    // Limit the minimum and maximum widths
    if (newWidth > 20 && newWidth < 80) {
      setLeftPanelWidth(newWidth)
    }
  }

  const stopHorizontalResize = () => {
    setIsResizingHorizontal(false)
    document.removeEventListener("mousemove", handleHorizontalResize)
    document.removeEventListener("mouseup", stopHorizontalResize)
  }

  // Vertical resizing
  const startVerticalResize = (e: React.MouseEvent) => {
    e.preventDefault()
    
    // Set resize state
    setIsResizingVertical(true)
    
    // Add global event listeners for better tracking outside the element
    document.addEventListener("mousemove", handleVerticalResize)
    document.addEventListener("mouseup", stopVerticalResize)
    
    // Add visual cues for resizing
    document.body.classList.add("resize-active")
    document.body.style.cursor = 'row-resize'
    
    // Disable text selection during resize
    document.body.style.userSelect = 'none'
  }

  const handleVerticalResize = (e: MouseEvent) => {
    if (!isResizingVertical || !rightPanelRef.current) return

    // Get container dimensions
    const rightPanelRect = rightPanelRef.current.getBoundingClientRect()
    const rightPanelHeight = rightPanelRect.height
    
    // Calculate cursor position relative to the panel
    const relativeY = e.clientY - rightPanelRect.top
    
    // Calculate percentage of panel height
    const newHeight = (relativeY / rightPanelHeight) * 100

    // Limit the minimum and maximum heights (20% to 80%)
    if (newHeight >= 20 && newHeight <= 80) {
      const bottomHeight = 100 - newHeight
      
      // Force a style update on the containing elements to ensure 
      // the browser recognizes the size change
      if (rightPanelRef.current) {
        const codePanel = rightPanelRef.current.querySelector('.code-panel') as HTMLElement;
        const testPanel = rightPanelRef.current.querySelector('.test-panel') as HTMLElement;
        
        if (codePanel) codePanel.style.height = `${newHeight}%`;
        if (testPanel) testPanel.style.height = `${bottomHeight}%`;
      }
      
      // Apply the new height with the state setter
      setBottomPanelHeight(bottomHeight)
      
      // Update body cursor during resize
      document.body.style.cursor = 'row-resize'
    }
  }

  const stopVerticalResize = () => {
    setIsResizingVertical(false)
    document.removeEventListener("mousemove", handleVerticalResize)
    document.removeEventListener("mouseup", stopVerticalResize)
    
    // Reset cursor and other styles
    document.body.style.cursor = ''
    document.body.style.userSelect = ''
    
    // Remove resize-active class
    document.body.classList.remove("resize-active")
  }

  // Add effect to handle resize events
  useEffect(() => {
    if (isResizingHorizontal) {
      document.addEventListener("mousemove", handleHorizontalResize)
      document.addEventListener("mouseup", stopHorizontalResize)
      document.body.classList.add("resize-active")
    }

    if (isResizingVertical) {
      document.addEventListener("mousemove", handleVerticalResize)
      document.addEventListener("mouseup", stopVerticalResize)
      document.body.classList.add("resize-active")
    }

    return () => {
      document.removeEventListener("mousemove", handleHorizontalResize)
      document.removeEventListener("mouseup", stopHorizontalResize)
      document.removeEventListener("mousemove", handleVerticalResize)
      document.removeEventListener("mouseup", stopVerticalResize)
      document.body.classList.remove("resize-active")
    }
  }, [isResizingHorizontal, isResizingVertical])

  const getLanguageTemplate = (lang: string) => {
    // Try to get language template from problem data first
    if (problem?.languageOptions) {
      const option = problem.languageOptions.find((opt: LanguageOption) => opt.name === lang);
      if (option && option.preloadCode) {
        return option.preloadCode;
      }
    }
    
    // Fallback to default templates
    switch (lang) {
      case "JavaScript":
        return `function twoSum(nums, target) {
  // Your solution here
}`;
      case "Python":
        return `class Solution:
    def twoSum(self, nums: List[int], target: int) -> List[int]:
        # Your solution here
        pass`;
      case "Java":
        return `class Solution {
    public int[] twoSum(int[] nums, int target) {
        // Your solution here
        return new int[]{};
    }
}`;
      case "C++":
        return `class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        // Your solution here
    }
};`;
      default:
        return `// Write your solution in ${lang}`;
    }
  };

  // Function to directly handle language changes
  const handleLanguageChange = (langName: string) => {
    console.log(`[LANG-SWITCH] Language selection changed from ${language} to ${langName}`);
    
    // Close the dropdown immediately
    setLanguageDropdownOpen(false);
    
    // Save current code before switching
    if (initialLoadCompleteRef.current && code && language) {
      console.log(`[LANG-SWITCH] Saving code for current language (${language}) before switching`);
      try {
        localStorage.setItem(`nexacademy_code_${problemId}_${language}`, code);
        console.log(`[LANG-SWITCH] Saved to localStorage successfully`);
        
        // Also save to backend if logged in
        if (session?.user?.id) {
          console.log(`[LANG-SWITCH] Also saving to backend`);
          fetch(`/api/problem/${problemId}/save-code`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ code, language }),
          }).catch(err => console.error("[LANG-SWITCH] Backend save error:", err));
        }
      } catch (err) {
        console.error(`[LANG-SWITCH] Error saving to localStorage:`, err);
      }
    }
    
    // Then load code for the new language
    console.log(`[LANG-SWITCH] Looking for saved code for new language: ${langName}`);
    
    // First check localStorage
    try {
      const savedCode = localStorage.getItem(`nexacademy_code_${problemId}_${langName}`);
      if (savedCode) {
        console.log(`[LANG-SWITCH] Found code in localStorage for ${langName}, setting it`);
        // Update state with the new language
        setLanguage(langName);
        // Update code after a short delay to ensure language is set first
        setTimeout(() => setCode(savedCode), 10);
        return;
      } else {
        console.log(`[LANG-SWITCH] No code found in localStorage for ${langName}`);
      }
    } catch (err) {
      console.error(`[LANG-SWITCH] Error checking localStorage:`, err);
    }
    
    // Check backend if logged in
    if (session?.user?.id) {
      console.log(`[LANG-SWITCH] Checking backend for ${langName}`);
      
      // Update language immediately to prevent UI issues
      setLanguage(langName);
      
      fetch(`/api/problem/${problemId}/load-code?language=${encodeURIComponent(langName)}`)
        .then(res => res.json())
        .then(data => {
          if (data.code) {
            console.log(`[LANG-SWITCH] Found code in backend for ${langName}, setting it`);
            setCode(data.code);
            // Cache in localStorage for future
            localStorage.setItem(`nexacademy_code_${problemId}_${langName}`, data.code);
          } else {
            console.log(`[LANG-SWITCH] No code found in backend, using preload code`);
            // Find preload code for this language
            const selected = availableLanguages.find(l => l.name === langName);
            if (selected && selected.preloadCode) {
              console.log(`[LANG-SWITCH] Using preload code for ${langName}`);
              setCode(selected.preloadCode);
            }
          }
        })
        .catch(error => {
          console.error(`[LANG-SWITCH] Error checking backend:`, error);
          // Still set preload code on error
          const selected = availableLanguages.find(l => l.name === langName);
          if (selected && selected.preloadCode) {
            console.log(`[LANG-SWITCH] Using preload code after backend error`);
            setCode(selected.preloadCode);
          }
        });
      return;
    }
    
    // If not logged in or no saved code, use preload code
    console.log(`[LANG-SWITCH] Not logged in or no saved code found, using preload code`);
    const selected = availableLanguages.find(l => l.name === langName);
    if (selected && selected.preloadCode) {
      // Set language first
      setLanguage(langName);
      // Then set code
      setTimeout(() => {
        console.log(`[LANG-SWITCH] Setting preload code for ${langName}`);
        setCode(selected.preloadCode);
      }, 10);
    } else {
      // Just set language if no preload code
      setLanguage(langName);
    }
  };

  // Helper function to validate code before execution
  const validateCode = (code: string) => {
    const trimmedCode = code.trim();
    
    // Check if code is empty
    if (!trimmedCode) {
      return {
        valid: false,
        error: "Code cannot be empty. Please write some code before running."
      };
    }
    
    // Check if code only contains comments
    const commentOnlyRegex = /^(\s*(\/\/.*|\/\*[\s\S]*?\*\/|#.*)\s*)*$/;
    if (commentOnlyRegex.test(trimmedCode)) {
      return {
        valid: false,
        error: "Your code only contains comments. Please add actual code to run."
      };
    }
    
    return { valid: true };
  };
  
  // Run code - tests only sample test cases
  const runCode = async () => {
    // First save the current code
    console.log('[DEBUG] Running code - saving first');
    saveCode();
    
    // Then continue with the existing run code logic
    setIsRunning(true)
    setResults(null)
    
    // Store the current bottomPanelHeight before switching tabs
    const currentHeight = bottomPanelHeight
    
    try {
      // Validate code
      const validation = validateCode(code);
      if (!validation.valid) {
        setResults({
          success: false,
          loading: false,
          error: validation.error,
          judgeResults: [],
          mode: "run"
        })
        setIsRunning(false);
        return;
      }
      
      // Find the selected languageId
      const selectedLang = availableLanguages.find(l => l.name === language)
      const languageId = selectedLang?.languageId
      console.log('Selected Language:', language)
      console.log('Language Object:', selectedLang)
      console.log('Language ID for Judge0:', languageId)

      if (!languageId) throw new Error("Language ID not found")
      
      // Prepare sample test cases
      const testCases = (problem?.sampleTestCases || []).map(tc => ({
        input: typeof tc.input === "string" ? tc.input : JSON.stringify(tc.input),
        expectedOutput: typeof tc.expectedOutput === "string" ? tc.expectedOutput : JSON.stringify(tc.expectedOutput),
      }))
      console.log('Test Cases for Judge0:', testCases)
      
      // Validate test cases
      if (!testCases.length) {
        throw new Error("No test cases available for this problem");
      }
      
      // Create initial loading results
      setResults({
        success: true,
        loading: true,
        judgeResults: testCases.map((tc, index) => ({
          input: tc.input,
          expected: tc.expectedOutput,
          output: null,
          stderr: null,
          compile_output: null,
          status: { id: 0, description: "Processing" },
          verdict: "Running",
        })),
        mode: "run",
        showOnlyFailures: false
      })
      
      // If bottom panel is not visible enough, adjust it
      if (currentHeight < 20) {
        setBottomPanelHeight(30); // Show a reasonable size for results
      } else {
        // Make sure to restore the height (ensures we didn't lose the size)
        setBottomPanelHeight(currentHeight);
      }
      
      // Run with Judge0
      const judgeResults = await runWithJudge0({
        sourceCode: code,
        languageId,
        testCases,
      })
      console.log('Judge0 Results:', judgeResults)
      
      // Check if all test cases passed to show confetti
      // const allAccepted = judgeResults.every(result => result.verdict === "Accepted")
      // if (allAccepted) {
      //   setShowConfetti(true)
      // }
      
      setResults({
        success: true,
        loading: false,
        judgeResults,
        mode: "run",
        showOnlyFailures: false
      })
    } catch (error: any) {
      console.error('Error running code:', error)
      setResults({
        success: false,
        loading: false,
        error: error.message || "Unknown error running code.",
        mode: "run"
      })
    }
    
    setIsRunning(false)
  }
  
  // Submit code - tests all sample and hidden test cases
  const submitCode = async () => {
    // First save the current code
    console.log('[DEBUG] Submitting code - saving first');
    saveCode();
    
    // Then continue with existing submit code logic
    setIsSubmitting(true)
    setSubmitResults(null)
    
    // Store the current bottomPanelHeight before switching tabs
    const currentHeight = bottomPanelHeight
    
    try {
      // Validate code
      const validation = validateCode(code);
      if (!validation.valid) {
        setResults({
          success: false,
          loading: false,
          error: validation.error,
          judgeResults: [],
          mode: "submit"
        })
        setIsSubmitting(false);
        return;
      }
      
      // Find the selected languageId
      const selectedLang = availableLanguages.find(l => l.name === language)
      const languageId = selectedLang?.languageId
      
      if (!languageId) throw new Error("Language ID not found")
      
      // Prepare all test cases (sample and hidden)
      const sampleTestCases = (problem?.sampleTestCases || []).map(tc => ({
        input: typeof tc.input === "string" ? tc.input : JSON.stringify(tc.input),
        expectedOutput: typeof tc.expectedOutput === "string" ? tc.expectedOutput : JSON.stringify(tc.expectedOutput),
        type: "sample"
      }))
      
      const hiddenTestCases = (problem?.hiddenTestCases || []).map(tc => ({
        input: typeof tc.input === "string" ? tc.input : JSON.stringify(tc.input),
        expectedOutput: typeof tc.expectedOutput === "string" ? tc.expectedOutput : JSON.stringify(tc.expectedOutput),
        type: "hidden"
      }))
      
      const allTestCases = [...sampleTestCases, ...hiddenTestCases]
      
      // Validate test cases
      if (!allTestCases.length) {
        throw new Error("No test cases available for this problem");
      }
      
      // Create initial loading results - we'll only show summary during loading
      setResults({
        success: true,
        loading: true,
        judgeResults: [],
        mode: "submit",
        totalTestCases: allTestCases.length,
        showOnlyFailures: true
      })
      
      // If bottom panel is not visible enough, adjust it
      if (currentHeight < 20) {
        setBottomPanelHeight(30);
      } else {
        setBottomPanelHeight(currentHeight);
      }
      
      // Run with Judge0
      const judgeResults = await runWithJudge0({
        sourceCode: code,
        languageId,
        testCases: allTestCases,
      })
      
      const passedCount = judgeResults.filter(result => result.verdict === "Accepted").length
      const failedTestCases = judgeResults.filter(result => result.verdict !== "Accepted")
      const allAccepted = judgeResults.every(result => result.verdict === "Accepted")
      
      // Show confetti for all test cases passing
      if (allAccepted) {
        setShowConfetti(true)
      }
      
      // For the submit mode, only show failed test cases (and at most the first one)
      const firstFailure = failedTestCases.length > 0 ? [failedTestCases[0]] : []
      
      setResults({
        success: true,
        loading: false,
        judgeResults: firstFailure,
        mode: "submit",
        summary: {
          passed: passedCount,
          total: allTestCases.length,
          allPassed: allAccepted
        },
        showOnlyFailures: true
      })
    } catch (error: any) {
      console.error('Error submitting code:', error)
      setResults({
        success: false,
        loading: false,
        error: error.message || "Unknown error submitting code.",
        mode: "submit"
      })
    }
    
    setIsSubmitting(false)
  }

  const handlePremiumClick = () => {
    setShowPremiumModal(true)
  }

  const togglePremiumStatus = () => {
    setIsPremiumUser(!isPremiumUser)
  }

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
  }

  const toggleFocusMode = () => {
    if (focusMode) {
      // Exit focus mode, restore previous height and left panel width
      setBottomPanelHeight(previousHeightRef.current)
      setLeftPanelWidth(previousLeftWidthRef.current)
      setFocusMode(false)
    } else {
      // Enter focus mode, save current height and left panel width, then hide both
      previousHeightRef.current = bottomPanelHeight
      previousLeftWidthRef.current = leftPanelWidth
      setBottomPanelHeight(0)
      setLeftPanelWidth(0) // Hide left panel entirely
      setFocusMode(true)
    }
  }

  const saveSnippet = () => {
    if (!snippetName.trim()) return;
    
    const newSnippet = {
      name: snippetName,
      code,
      language
    };
    
    setSavedSnippets([...savedSnippets, newSnippet]);
    setShowSaveDialog(false);
    setSnippetName("");
  };

  const loadSnippet = (selectedSnippet: {name: string, code: string, language: string}) => {
    setCode(selectedSnippet.code);
    setLanguage(selectedSnippet.language);
  };

  const copyCode = () => {
    navigator.clipboard.writeText(code);
    setCodeCopied(true);
    setTimeout(() => {
      setCodeCopied(false);
    }, 2000);
  };

  // Function to open editor settings
  const openEditorSettings = () => {
    if (editorSettingsRef.current) {
      editorSettingsRef.current.showSettings()
    } else {
      setEditorSettingsOpen(true)
    }
  }

  useEffect(() => {
    // Fetch problem data from API
    const fetchProblem = async () => {
      setIsLoading(true); // Set loading to true when starting fetch
      setIsLanguageLoading(true); // Set language loading to true
      setIsCodeLoading(true); // Set code loading to true
      
      try {
        const response = await fetch(`/api/problem/${problemId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch problem data');
        }
        const data = await response.json();
        setProblem(data);
        
        // Set available languages from problem data
        if (data.languageOptions && Array.isArray(data.languageOptions) && data.languageOptions.length > 0) {
          // Update language IDs to match current Judge0 API
          const updatedLanguageOptions = data.languageOptions.map((lang: LanguageOption) => ({
            ...lang,
            languageId: updateLanguageId(lang.languageId)
          }));
          
          setAvailableLanguages(updatedLanguageOptions);
          setLanguage(updatedLanguageOptions[0].name);
          setCode(updatedLanguageOptions[0].preloadCode);
          setIsLanguageLoading(false);
          setIsCodeLoading(false);
        }
      } catch (error) {
        console.error('Error fetching problem:', error);
        // Fallback to sample problem if API fails
        setProblem(sampleProblem);
        // Use type assertion to avoid TypeScript errors
        if ((sampleProblem as any).languageOptions && Array.isArray((sampleProblem as any).languageOptions)) {
          // Update language IDs for sample problem too
          const updatedSampleLanguages = (sampleProblem as any).languageOptions.map((lang: LanguageOption) => ({
            ...lang,
            languageId: updateLanguageId(lang.languageId)
          }));
          
          setAvailableLanguages(updatedSampleLanguages);
          setLanguage(updatedSampleLanguages[0].name);
          setCode(updatedSampleLanguages[0].preloadCode);
        }
        setIsLanguageLoading(false);
        setIsCodeLoading(false);
      } finally {
        setIsLoading(false); // Set loading to false when fetch completes
      }
    };

    fetchProblem();

    // Start timer
    const timer = setInterval(() => {
      setTimeElapsed((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [problemId]);

  // Track whether we've completed initial load
  const initialLoadCompleteRef = useRef(false);
  const loadedRef = useRef(false);
  const lastSavedCodeRef = useRef<string>("");
  const lastSaveTimeRef = useRef<number>(0);
  const prevProblemIdRef = useRef<string | null>(null);
  const prevLanguageRef = useRef<string | null>(null);

  // Explicitly save code to both localStorage and backend
  const saveCode = useCallback(() => {
    if (!problemId || !language || !code || !initialLoadCompleteRef.current) return;
    
    const now = Date.now();
    const timeSinceLastSave = now - lastSaveTimeRef.current;
    
    // Skip if code hasn't changed since last save
    if (lastSavedCodeRef.current === code) {
      console.log(`[DEBUG] Skipping save - code hasn't changed`);
      return;
    }
    
    // Enforce minimum time between saves (1 second)
    if (timeSinceLastSave < 1000) {
      console.log(`[DEBUG] Skipping save - too soon since last save (${timeSinceLastSave}ms)`);
      return;
    }

    console.log(`[DEBUG] Saving code on important event for ${problemId}/${language}`);
    
    // Update last saved code reference and time
    lastSavedCodeRef.current = code;
    lastSaveTimeRef.current = now;
    
    // Save to localStorage immediately
    try {
      localStorage.setItem(`nexacademy_code_${problemId}_${language}`, code);
      console.log(`[DEBUG] Successfully saved to localStorage`);
    } catch (err) {
      console.error(`[DEBUG] Error saving to localStorage:`, err);
    }
    
    // Save to backend if logged in
    if (session?.user?.id) {
      console.log(`[DEBUG] Saving to backend`);
      fetch(`/api/problem/${problemId}/save-code`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, language }),
      })
      .then(response => {
        console.log(`[DEBUG] Backend save response status: ${response.status}`);
        return response.json();
      })
      .then(data => {
        console.log(`[DEBUG] Backend save successful:`, data);
      })
      .catch(error => {
        console.error(`[DEBUG] Backend save error:`, error);
      });
    }
  }, [code, problemId, language, session?.user?.id]);

  // Save code before page unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (initialLoadCompleteRef.current) {
        console.log('[DEBUG] Page unloading - saving code');
        // Use synchronous localStorage save for beforeunload
        if (problemId && language && code) {
          try {
            localStorage.setItem(`nexacademy_code_${problemId}_${language}`, code);
          } catch (e) {
            console.error('[DEBUG] Error saving to localStorage on unload', e);
          }
          
          // For backend, we'll use a synchronous request, though it may not complete
          if (session?.user?.id) {
            try {
              // Using sendBeacon for more reliable background saves
              const blob = new Blob(
                [JSON.stringify({ code, language })], 
                { type: 'application/json' }
              );
              navigator.sendBeacon(`/api/problem/${problemId}/save-code`, blob);
            } catch (e) {
              console.error('[DEBUG] Error using sendBeacon', e);
            }
          }
        }
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [code, problemId, language, session]);

  // Improved: Explicitly triggered load logic
  const loadSavedCode = useCallback(() => {
    if (!problemId || !language) {
      console.log(`[DEBUG] Cannot load code: missing problemId or language`);
      return false;
    }
    
    console.log(`[DEBUG] Attempting to load saved code for ${problemId}/${language}`);
    
    // Try localStorage first
    try {
      const savedCode = localStorage.getItem(`nexacademy_code_${problemId}_${language}`);
      console.log(`[DEBUG] localStorage for this problem/language:`, savedCode ? `Found (${savedCode.length} chars)` : "Not found");
      
      if (savedCode) {
        console.log(`[DEBUG] Setting code from localStorage`);
        setCode(savedCode);
        initialLoadCompleteRef.current = true;
        return true;
      }
    } catch (err) {
      console.error(`[DEBUG] Error loading from localStorage:`, err);
    }
    
    // Try backend if logged in and localStorage didn't have it
    if (session?.user?.id) {
      console.log(`[DEBUG] User logged in, checking backend for saved code`);
      fetch(`/api/problem/${problemId}/load-code?language=${encodeURIComponent(language)}`)
        .then(res => {
          console.log(`[DEBUG] Backend load response status: ${res.status}`);
          return res.json();
        })
        .then(data => {
          console.log(`[DEBUG] Backend load response:`, data);
          if (data.code && typeof data.code === "string") {
            console.log(`[DEBUG] Setting code from backend (${data.code.length} chars)`);
            setCode(data.code);
            // Also cache in localStorage
            localStorage.setItem(`nexacademy_code_${problemId}_${language}`, data.code);
            initialLoadCompleteRef.current = true;
            return true;
          } else {
            // If no saved code found, mark initial load as complete with default code
            initialLoadCompleteRef.current = true;
          }
        })
        .catch(error => {
          console.error(`[DEBUG] Backend load error:`, error);
          // Still mark as complete on error
          initialLoadCompleteRef.current = true;
        });
      return "loading"; // Special return to indicate loading in progress
    }
    
    // No saved code found, mark initial load as complete
    initialLoadCompleteRef.current = true;
    return false;
  }, [problemId, language, session, setCode]);

  // Load code when problem/language changes, and on mount
  useEffect(() => {
    if (!loadedRef.current && problemId && language && availableLanguages.length > 0) {
      console.log(`[DEBUG] Initial code load for ${problemId}/${language}`);
      
      const loadResult = loadSavedCode();
      
      // If not found in storage/backend and availableLanguages is loaded, use starter code
      if (loadResult === false) {
        console.log(`[DEBUG] No saved code found, using starter code`);
        const langObj = availableLanguages.find(l => l.name === language);
        if (langObj && langObj.preloadCode) {
          console.log(`[DEBUG] Setting starter code from language option`);
          setCode(langObj.preloadCode);
          // Mark initial load complete here too
          initialLoadCompleteRef.current = true;
        }
      }
      
      loadedRef.current = true;
    }
  }, [problemId, language, availableLanguages, loadSavedCode]);

  // Handle language change explicitly with its own effect
  useEffect(() => {
    // Skip initial render or if problem ID is missing
    if (!problemId || !language || !initialLoadCompleteRef.current) {
      return;
    }
    
    const oldLanguage = prevLanguageRef.current;
    
    // Only proceed if language actually changed
    if (oldLanguage !== null && oldLanguage !== language) {
      console.log(`[DEBUG-LANG] Language changed from ${oldLanguage} to ${language}`);
      
      // First try localStorage
      try {
        const savedCode = localStorage.getItem(`nexacademy_code_${problemId}_${language}`);
        console.log(`[DEBUG-LANG] localStorage check for ${language}:`, savedCode ? "FOUND" : "NOT FOUND");
        
        if (savedCode) {
          console.log(`[DEBUG-LANG] Loading saved code from localStorage for ${language}`);
          setCode(savedCode);
          return; // Exit early if we found code
        }
      } catch (err) {
        console.error(`[DEBUG-LANG] Error checking localStorage:`, err);
      }
      
      // If not in localStorage and user is logged in, try backend
      if (session?.user?.id) {
        console.log(`[DEBUG-LANG] Checking backend for saved code for ${language}`);
        
        // Use an immediate fetch for backend checking
        fetch(`/api/problem/${problemId}/load-code?language=${encodeURIComponent(language)}`)
          .then(res => {
            console.log(`[DEBUG-LANG] Backend response status:`, res.status);
            return res.json();
          })
          .then(data => {
            console.log(`[DEBUG-LANG] Backend data:`, data);
            if (data.code) {
              console.log(`[DEBUG-LANG] Setting code from backend (${data.code.length} chars)`);
              setCode(data.code);
              // Also cache in localStorage
              localStorage.setItem(`nexacademy_code_${problemId}_${language}`, data.code);
            } else {
              // Load preload code as fallback
              loadPreloadCode();
            }
          })
          .catch(error => {
            console.error(`[DEBUG-LANG] Backend error:`, error);
            // Use preload code on error
            loadPreloadCode();
          });
      } else {
        // Not logged in, use preload code directly
        loadPreloadCode();
      }
    }
    
    // Update the previous language reference
    prevLanguageRef.current = language;
    
    // Helper function to load preload code for current language
    function loadPreloadCode() {
      if (!availableLanguages || availableLanguages.length === 0) {
        console.log(`[DEBUG-LANG] No available languages found`);
        return;
      }
      
      const langObj = availableLanguages.find(l => l.name === language);
      console.log(`[DEBUG-LANG] Language object found:`, langObj ? "YES" : "NO");
      
      if (langObj && langObj.preloadCode) {
        console.log(`[DEBUG-LANG] Setting preload code for ${language} (${langObj.preloadCode.length} chars)`);
        setCode(langObj.preloadCode);
      } else {
        console.log(`[DEBUG-LANG] No preload code found for ${language}`);
      }
    }
  }, [language, problemId, availableLanguages, session, setCode]);
  
  // Reset loadedRef when problem changes, and save current code
  useEffect(() => {
    // Skip initial render
    if (!initialLoadCompleteRef.current) {
      console.log('[DEBUG] Skipping save on initial render');
      prevProblemIdRef.current = problemId;
      return;
    }
    
    // Check if problem changed
    const problemChanged = prevProblemIdRef.current !== null && prevProblemIdRef.current !== problemId;
    
    // Save the current code before loading new code for changed problem
    if (problemChanged && code) {
      console.log(`[DEBUG] Problem changed - saving current code`);
      // Save to current problem/language
      saveCode();
    }
    
    // Update problem reference
    prevProblemIdRef.current = problemId;
    
    // Reset load flag to ensure we reload code for the new problem
    if (problemChanged) {
      console.log(`[DEBUG] Problem changed - resetting loaded flag`);
      loadedRef.current = false;
    }
  }, [problemId, saveCode, code]);

  return (
    <div className="main-container">
      {/* Add Expandable Problem Sidebar */}
      <ExpandableProblemSidebar />
      {/* Confetti container */}
      <div ref={confettiRef} className="fixed inset-0 pointer-events-none z-50"></div>

      {/* Focus mode overlay - brief animation when entering focus mode */}
      <AnimatePresence>
        {focusMode && (
          <motion.div 
            className="fixed inset-0 bg-black/5 pointer-events-none z-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          />
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="problem-header relative">
        {/* Left Section */}
        <div className="problem-header-section z-10">
          <Button variant="ghost" size="icon" className="text-primary/90">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L1 12H4V21H10V15H14V21H20V12H23L12 2Z" fill="currentColor" />
            </svg>
          </Button>
          
          {!isLoading && problem ? (
            <div className="flex items-center gap-3">
              <span className="problem-header-title">
                {problem.number ? `${problem.number}. ` : ""}{problem.title || "Two Sum"}
              </span>
              <span className={`badge-difficulty badge-${problem.difficulty?.toLowerCase() || "medium"}`}>
                {problem.difficulty || "Medium"}
              </span>
            </div>
          ) : (
            <div className="h-5 w-40 bg-muted/40 animate-pulse rounded-md"></div>
          )}
          
          <div className="problem-header-divider"></div>
          
          <div className="problem-header-actions">
            <button className="problem-nav-btn" title="Previous Problem">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button className="problem-nav-btn" title="Next Problem">
              <ChevronRight className="h-4 w-4" />
            </button>
            <button className="problem-nav-btn" title="Toggle Fullscreen" onClick={toggleFullscreen}>
              <Maximize className="h-4 w-4" />
            </button>
            
            <div className="problem-header-divider"></div>
            
            <button className="problem-nav-btn">
              <Settings className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Centered Run and Submit buttons - absolutely centered */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex gap-2 z-0">
          <button 
            className={`problem-btn ${
              isRunning ? 'problem-btn-primary' : 'problem-btn-outline'
            }`}
            onClick={runCode} 
            disabled={isRunning}
          >
            {isRunning ? 
              <div className="flex items-center">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent mr-1.5"></div>
                Running
              </div> : 
              <>
                <Play className="h-4 w-4" />
                Run
              </>
            }
          </button>
          <button 
            className="problem-btn problem-btn-success"
            onClick={submitCode}
            disabled={isRunning || isSubmitting}
          >
            {isSubmitting ? 
              <div className="flex items-center">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent mr-1.5"></div>
                Submitting
              </div> : 
              <>
                <CheckSquare className="h-4 w-4" />
                Submit
              </>
            }
          </button>
        </div>

        {/* Right Section */}
        <div className="problem-header-section z-10">
          {savedSnippets.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="problem-btn problem-btn-outline">
                  <Folder className="h-4 w-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Saved Snippets</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {savedSnippets.map((snippet, index) => (
                  <DropdownMenuItem key={index} onClick={() => loadSnippet(snippet)}>
                    <div className="flex items-center">
                      <span>{snippet.name}</span>
                      <Badge variant="outline" className="ml-2 text-xs">{snippet.language}</Badge>
                    </div>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          
          <div className="problem-header-divider"></div>
          
          <div className="problem-user-section">
            <ModeToggle />
            
            <button className="problem-nav-btn">
              <Settings className="h-4 w-4" />
            </button>
            
            <div className="problem-user-avatar bg-orange-100 text-orange-600">
              U
            </div>
            
            <button
              className="problem-premium-badge"
              onClick={togglePremiumStatus}
            >
              <Crown className="h-4 w-4" />
              <span className="font-medium">Premium</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="panels-container">
        {/* Left Panel - Problem Description */}
        <div 
          className="left-panel border-border border-r" 
          style={{ 
            width: `${leftPanelWidth}%`,
            display: focusMode ? 'none' : 'flex' // Hide the panel completely in focus mode
          }}
        >
          <Tabs defaultValue="description" className="w-full h-full flex flex-col modern-tabs">
            <div className="border-border border-b flex-shrink-0 bg-background">
              <div className="px-4 pt-3 pb-0">
                <TabsList className="flex w-full justify-start space-x-1 bg-transparent h-auto p-0">
                  <TabsTrigger 
                    value="description" 
                    className="tab-trigger flex items-center gap-1.5 px-3 py-1.5 h-auto data-[state=active]:bg-transparent data-[state=active]:shadow-none rounded-none transition-all"
                  >
                    <BookOpen className="h-4 w-4" />
                    <span className="text-sm font-medium">Description</span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="solution" 
                    className="tab-trigger flex items-center gap-1.5 px-3 py-1.5 h-auto data-[state=active]:bg-transparent data-[state=active]:shadow-none rounded-none transition-all"
                  >
                    <Lightbulb className="h-4 w-4" />
                    <span className="text-sm font-medium">Solution</span>
                    {!isPremiumUser && <Lock className="h-3 w-3 ml-1 text-orange-500" />}
                  </TabsTrigger>
                  <TabsTrigger 
                    value="discussion" 
                    className="tab-trigger flex items-center gap-1.5 px-3 py-1.5 h-auto data-[state=active]:bg-transparent data-[state=active]:shadow-none rounded-none transition-all"
                  >
                    <MessageSquare className="h-4 w-4" />
                    <span className="text-sm font-medium">Discussion</span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="submissions" 
                    className="tab-trigger flex items-center gap-1.5 px-3 py-1.5 h-auto data-[state=active]:bg-transparent data-[state=active]:shadow-none rounded-none transition-all"
                  >
                    <BarChart2 className="h-4 w-4" />
                    <span className="text-sm font-medium">Submissions</span>
                  </TabsTrigger>
                </TabsList>
              </div>
            </div>
            <TabsContent value="description" className="p-4 left-panel-content panel-scrollable pb-8">
              {isLoading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="flex flex-col items-center gap-4">
                    <div className="h-12 w-12 rounded-full border-4 border-t-primary border-r-transparent border-b-transparent border-l-transparent animate-spin"></div>
                    <p className="text-muted-foreground">Loading problem...</p>
                  </div>
                </div>
              ) : (
                <>
                  {/* @ts-ignore - Type differences handled in the component */}
                  <ProblemDescription isPremium={isPremiumUser} problem={problem} />
                  {isPremiumUser && <CompanyTags />}
                </>
              )}
            </TabsContent>
            <TabsContent value="solution" className="p-4 left-panel-content panel-scrollable pb-8">
              {isPremiumUser ? (
                <PremiumSolutions />
              ) : (
                <div className="flex flex-col items-center justify-center p-8 space-y-4 border-2 border-dashed border-orange-200 dark:border-orange-900/40 rounded-lg bg-orange-50 dark:bg-gray-800/30">
                  <Crown className="h-12 w-12 text-orange-500" />
                  <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">Premium Feature</h3>
                  <p className="text-center text-gray-600 dark:text-gray-300 max-w-md">
                    Unlock official solutions with step-by-step explanations, time and space complexity analysis, and
                    more.
                  </p>
                  <Button className="bg-orange-500 hover:bg-orange-600 text-white" onClick={handlePremiumClick}>
                    <Crown className="h-4 w-4 mr-2" />
                    Subscribe to Premium
                  </Button>
                </div>
              )}
            </TabsContent>
            <TabsContent value="discussion" className="p-4 left-panel-content panel-scrollable pb-8">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-lg">Discussion (124)</h3>
                  <Button variant="outline" size="sm">
                    <MessageSquare className="h-3.5 w-3.5 mr-1.5" />
                    New Post
                  </Button>
                </div>
                <div className="border rounded-lg p-4 space-y-2 hover:shadow-md transition-shadow dark:border-gray-700 dark:hover:bg-gray-800/60">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 font-medium">
                      J
                    </div>
                    <div>
                      <div className="font-medium dark:text-gray-100">John Doe</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">2 days ago</div>
                    </div>
                    {isPremiumUser && (
                      <Badge
                        variant="outline"
                        className="ml-auto border-orange-200 text-orange-500 flex items-center gap-1"
                      >
                        <Crown className="h-3 w-3" />
                        Top Solution
                      </Badge>
                    )}
                  </div>
                  <h4 className="font-medium dark:text-gray-200">O(n) HashMap Solution with Explanation</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                    The key insight is to use a HashMap to store the elements we've seen so far. For each element, we
                    check if its complement exists in the map...
                  </p>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4" />
                      42
                    </div>
                    <div className="flex items-center gap-1">
                      <MessageSquare className="h-4 w-4" />
                      15
                    </div>
                  </div>
                </div>
                
                <div className="border rounded-lg p-4 space-y-2 hover:shadow-md transition-shadow dark:border-gray-700 dark:hover:bg-gray-800/60">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400 font-medium">
                      A
                    </div>
                    <div>
                      <div className="font-medium dark:text-gray-100">Alice Williams</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">4 days ago</div>
                    </div>
                  </div>
                  <h4 className="font-medium dark:text-gray-200">Brute Force vs Optimized Approach</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                    Let's compare the brute force approach (O(n²)) with the optimized HashMap solution (O(n)) for this problem...
                  </p>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4" />
                      28
                    </div>
                    <div className="flex items-center gap-1">
                      <MessageSquare className="h-4 w-4" />
                      7
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="submissions" className="p-4 left-panel-content panel-scrollable pb-8">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-lg">Your Submissions</h3>
                  <div>
                    <Button variant="outline" size="sm" className="gap-1">
                      <FileText className="h-3.5 w-3.5" />
                      All Submissions
                    </Button>
                  </div>
                </div>
                
                <div className="overflow-hidden rounded-md border border-border submissions-table">
                  <table className="min-w-full divide-y divide-border">
                    <thead>
                      <tr>
                        <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Status
                        </th>
                        <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Runtime
                        </th>
                        <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Memory
                        </th>
                        <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Language
                        </th>
                        <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Submitted
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-background divide-y divide-border">
                      <tr className="hover:bg-muted/30 transition-colors">
                        <td className="px-3 py-2 whitespace-nowrap">
                          <div className="flex items-center">
                            <span className="status-badge status-accepted">
                              Accepted
                            </span>
                          </div>
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-sm">
                          56 ms <span className="text-xs text-green-600 dark:text-green-400">(faster than 95%)</span>
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-sm">
                          42.1 MB <span className="text-xs text-green-600 dark:text-green-400">(less than 87%)</span>
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-sm">
                          JavaScript
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-sm text-muted-foreground">
                          2 hours ago
                        </td>
                      </tr>
                      <tr className="hover:bg-muted/30 transition-colors">
                        <td className="px-3 py-2 whitespace-nowrap">
                          <div className="flex items-center">
                            <span className="status-badge status-wrong">
                              Wrong Answer
                            </span>
                          </div>
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-sm">
                          N/A
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-sm">
                          N/A
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-sm">
                          JavaScript
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-sm text-muted-foreground">
                          3 hours ago
                        </td>
                      </tr>
                      <tr className="hover:bg-muted/30 transition-colors">
                        <td className="px-3 py-2 whitespace-nowrap">
                          <div className="flex items-center">
                            <span className="status-badge status-timeout">
                              Time Limit
                            </span>
                          </div>
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-sm">
                          Exceeded
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-sm">
                          43.2 MB
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-sm">
                          JavaScript
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-sm text-muted-foreground">
                          5 hours ago
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                
                <div className="mt-4 bg-muted/20 rounded-lg p-4 border border-border">
                  <h4 className="text-sm font-medium mb-2">Submission Stats</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-background p-3 rounded-md border border-border">
                      <div className="text-xs text-muted-foreground">Total Submissions</div>
                      <div className="text-lg font-semibold">8</div>
                    </div>
                    <div className="bg-background p-3 rounded-md border border-border">
                      <div className="text-xs text-muted-foreground">Acceptance Rate</div>
                      <div className="text-lg font-semibold">37.5%</div>
                    </div>
                    <div className="bg-background p-3 rounded-md border border-border">
                      <div className="text-xs text-muted-foreground">Fastest Runtime</div>
                      <div className="text-lg font-semibold">56 ms</div>
                    </div>
                    <div className="bg-background p-3 rounded-md border border-border">
                      <div className="text-xs text-muted-foreground">Lowest Memory</div>
                      <div className="text-lg font-semibold">41.8 MB</div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Horizontal Resizer */}
        <div
          className="horizontal-resizer group"
          style={{ 
            left: `${leftPanelWidth}%`,
            position: 'absolute',
            top: 0,
            bottom: 0,
            zIndex: 10,
            display: focusMode ? 'none' : 'block' // Hide the resizer in focus mode
          }}
          onMouseDown={startHorizontalResize}
          onDoubleClick={() => setLeftPanelWidth(50)}
          title="Drag to resize (double-click to reset)"
        >
          <div className="absolute right-full top-2 flex flex-col items-end gap-1 p-1 opacity-0 transition-opacity group-hover:opacity-100 hover:opacity-100">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="h-6 w-6 rounded-full bg-white/90 shadow-sm resizer-button"
                    onClick={() => setLeftPanelWidth(30)}
                  >
                    <div className="flex h-4 w-4">
                      <div className="w-1/3 h-full bg-primary/30"></div>
                      <div className="w-2/3 h-full bg-primary/10"></div>
                    </div>
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="left" className="tooltip-content">
                  <p>30% - 70% (Alt+1)</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="h-6 w-6 rounded-full bg-white/90 shadow-sm resizer-button"
                    onClick={() => setLeftPanelWidth(50)}
                  >
                    <div className="flex h-4 w-4">
                      <div className="w-1/2 h-full bg-primary/30"></div>
                      <div className="w-1/2 h-full bg-primary/10"></div>
                    </div>
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="left" className="tooltip-content">
                  <p>50% - 50% (Alt+2)</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="h-6 w-6 rounded-full bg-white/90 shadow-sm resizer-button"
                    onClick={() => setLeftPanelWidth(70)}
                  >
                    <div className="flex h-4 w-4">
                      <div className="w-2/3 h-full bg-primary/30"></div>
                      <div className="w-1/3 h-full bg-primary/10"></div>
                    </div>
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="left" className="tooltip-content">
                  <p>70% - 30% (Alt+3)</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>

        {/* Right Panel - Code Editor and Test Cases */}
        <div
          className="right-panel"
          style={{ width: focusMode ? '100%' : `${100 - leftPanelWidth}%` }} // Take full width in focus mode
          ref={rightPanelRef}
        >
          {/* Code Editor Header */}
          <div className="border-border border-b flex items-center justify-between px-4 py-2 flex-shrink-0 h-10">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-primary flex items-center gap-1.5">
                <FileCode className="h-4 w-4" />
                Nex Editor
              </span>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant={focusMode ? "default" : "outline"} 
                      size="sm" 
                      className={`text-xs h-7 ${focusMode ? "bg-primary text-white" : "text-primary"}`}
                      onClick={toggleFocusMode}
                    >
                      {focusMode ? "Exit Focus" : "Focus Mode"} 
                      <span className="ml-1 opacity-70">{focusMode ? "(Esc)" : "(Ctrl+Shift+F)"}</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="tooltip-content">
                    <p>{focusMode ? "Exit focus mode to show problem description and test panel" : "Hide problem description and test panel for distraction-free coding"}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <div className="flex items-center gap-2 relative">
              {isLanguageLoading ? (
                <div className="h-7 w-24 bg-muted/40 animate-pulse rounded-md"></div>
              ) : (
                <DropdownMenu open={languageDropdownOpen} onOpenChange={setLanguageDropdownOpen}>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="flex items-center gap-2 text-sm h-8 px-3">
                      {language}
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-muted-foreground">
                        <path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="language-dropdown">
                    <div className="language-dropdown-header">
                      <h3>Select Language</h3>
                    </div>
                    
                    <div className="language-search">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-muted-foreground">
                        <path d="M21 21L15 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      <input 
                        placeholder="Search languages..." 
                        value={languageFilter}
                        onChange={(e) => setLanguageFilter(e.target.value)}
                      />
                    </div>
                    
                    {/* No results message */}
                    {languageFilter && !availableLanguages.some(lang => 
                      lang.name.toLowerCase().includes(languageFilter.toLowerCase())
                    ) && (
                      <div className="p-4 text-center text-muted-foreground text-sm">
                        No languages match "{languageFilter}"
                      </div>
                    )}
                    
                    {/* Popular Languages Section */}
                    {(!languageFilter || availableLanguages.some(lang => 
                      ['JavaScript', 'Python', 'Java', 'C++', 'C#', 'TypeScript'].some(name => 
                        lang.name.startsWith(name)
                      ) && 
                      lang.name.toLowerCase().includes(languageFilter.toLowerCase())
                    )) && (
                      <div className="language-section">
                        <div className="language-section-title">Popular</div>
                        <div className="language-grid">
                          {availableLanguages
                            .filter(lang => 
                              ['JavaScript', 'Python', 'Java', 'C++', 'C#', 'TypeScript'].some(name => 
                                lang.name.startsWith(name)
                              ) && 
                              (languageFilter === "" || 
                               lang.name.toLowerCase().includes(languageFilter.toLowerCase()))
                            )
                            .sort((a, b) => a.name.localeCompare(b.name))
                            .map(lang => (
                              <div
                                key={lang.id}
                                className={`language-item ${language === lang.name ? 'active' : ''}`}
                                onClick={() => handleLanguageChange(lang.name)}
                              >
                                <span className="language-icon">
                                  {getLanguageIcon(lang.name)}
                                </span>
                                <span title={JUDGE0_LANGUAGE_MAP[lang.languageId]}>
                                  {getLanguageBaseAndVersion(lang.name)}
                                </span>
                              </div>
                            ))
                          }
                        </div>
                      </div>
                    )}
                    
                    {/* Systems Section */}
                    {(!languageFilter || availableLanguages.some(lang => 
                      ['C', 'Rust', 'Go'].some(name => 
                        lang.name.startsWith(name) && !lang.name.includes('C++') && !lang.name.includes('C#')
                      ) && 
                      lang.name.toLowerCase().includes(languageFilter.toLowerCase())
                    )) && (
                      <div className="language-section">
                        <div className="language-section-title">Systems & Low-level</div>
                        <div className="language-grid">
                          {availableLanguages
                            .filter(lang => 
                              ['C', 'Rust', 'Go'].some(name => 
                                lang.name.startsWith(name) && !lang.name.includes('C++') && !lang.name.includes('C#')
                              ) && 
                              (languageFilter === "" || 
                               lang.name.toLowerCase().includes(languageFilter.toLowerCase()))
                            )
                            .sort((a, b) => a.name.localeCompare(b.name))
                            .map(lang => (
                              <div
                                key={lang.id}
                                className={`language-item ${language === lang.name ? 'active' : ''}`}
                                onClick={() => handleLanguageChange(lang.name)}
                              >
                                <span className="language-icon">
                                  {getLanguageIcon(lang.name)}
                                </span>
                                <span title={JUDGE0_LANGUAGE_MAP[lang.languageId]}>
                                  {getLanguageBaseAndVersion(lang.name)}
                                </span>
                              </div>
                            ))
                          }
                        </div>
                      </div>
                    )}
                    
                    {/* Other Languages Section */}
                    {(!languageFilter || availableLanguages.some(lang => 
                      !['JavaScript', 'Python', 'Java', 'C++', 'C#', 'TypeScript', 'C', 'Rust', 'Go'].some(name => 
                        lang.name.startsWith(name) || (name === 'C' && lang.name === 'C')
                      ) && 
                      lang.name.toLowerCase().includes(languageFilter.toLowerCase())
                    )) && (
                      <div className="language-section">
                        <div className="language-section-title">Other Languages</div>
                        <div className="language-grid">
                          {availableLanguages
                            .filter(lang => 
                              !['JavaScript', 'Python', 'Java', 'C++', 'C#', 'TypeScript', 'C', 'Rust', 'Go'].some(name => 
                                lang.name.startsWith(name) || (name === 'C' && lang.name === 'C')
                              ) && 
                              (languageFilter === "" || 
                               lang.name.toLowerCase().includes(languageFilter.toLowerCase()))
                            )
                            .sort((a, b) => a.name.localeCompare(b.name))
                            .map(lang => (
                              <div
                                key={lang.id}
                                className={`language-item ${language === lang.name ? 'active' : ''}`}
                                onClick={() => handleLanguageChange(lang.name)}
                              >
                                <span className="language-icon">
                                  {getLanguageIcon(lang.name)}
                                </span>
                                <span title={JUDGE0_LANGUAGE_MAP[lang.languageId]}>
                                  {getLanguageBaseAndVersion(lang.name)}
                                </span>
                              </div>
                            ))
                          }
                        </div>
                      </div>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex items-center gap-1.5 text-sm h-8 px-3"
                      onClick={() => {
                        if (editorSettingsRef.current?.showSettings) {
                          editorSettingsRef.current.showSettings();
                        } else {
                          setEditorSettingsOpen(true);
                        }
                      }}
                    >
                      <Settings className="h-4 w-4" />
                      <span>Settings</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    <p>Editor Settings (Font, Tab Size, Theme)</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>

          {/* Panels Container */}
          <div className="flex flex-col flex-1" style={{ position: 'relative', height: '100%', overflow: 'hidden' }}>
            {/* Code Editor */}
            <div 
              className="code-panel"
              style={{ 
                height: `calc(${100 - bottomPanelHeight}% - 3px)`, 
                boxSizing: 'border-box',
                position: 'relative'
              }}
            >
              <div className="code-editor-container h-full">
                {isCodeLoading ? (
                  <div className="flex items-center justify-center h-full bg-muted/20 dark:bg-gray-800/20">
                    <div className="flex flex-col items-center gap-4">
                      <div className="h-8 w-8 rounded-full border-2 border-t-primary border-r-transparent border-b-transparent border-l-transparent animate-spin"></div>
                      <p className="text-muted-foreground text-sm">Loading code editor...</p>
                    </div>
                  </div>
                ) : (
                  <CodeEditor 
                    code={code} 
                    setCode={setCode} 
                    language={language} 
                    preloadCode={
                      getLanguageTemplate(language)
                    }
                    initialShowSettings={editorSettingsOpen}
                    editorSettingsRef={editorSettingsRef}
                  />
                )}
              </div>
            </div>

            {/* Vertical Resizer */}
            <div
              className="vertical-resizer group"
              style={{ 
                position: 'absolute',
                left: 0,
                right: 0, 
                top: `calc(${100 - bottomPanelHeight}% - 3px)`,
                height: '6px',
                zIndex: 50, // Higher z-index to ensure it's clickable
                width: '100%',
                display: focusMode ? 'none' : 'block', // Hide the resizer in focus mode
                cursor: 'row-resize' // Ensure cursor is always visible on hover
              }}
              onMouseDown={startVerticalResize}
              onDoubleClick={() => setBottomPanelHeight(30)}
              title="Drag to resize (double-click to reset)"
            >
              <div className="absolute bottom-full right-2 flex items-center gap-1 p-1 opacity-0 transition-opacity group-hover:opacity-100 hover:opacity-100">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="icon" 
                        className="h-6 w-6 rounded-full bg-white/90 shadow-sm resizer-button"
                        onClick={() => setBottomPanelHeight(20)}
                      >
                        <div className="flex flex-col h-4 w-4">
                          <div className="h-4/5 w-full bg-primary/30"></div>
                          <div className="h-1/5 w-full bg-primary/10"></div>
                        </div>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="tooltip-content">
                      <p>80% - 20% (Alt+9)</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="icon" 
                        className="h-6 w-6 rounded-full bg-white/90 shadow-sm resizer-button"
                        onClick={() => setBottomPanelHeight(30)}
                      >
                        <div className="flex flex-col h-4 w-4">
                          <div className="h-[70%] w-full bg-primary/30"></div>
                          <div className="h-[30%] w-full bg-primary/10"></div>
                        </div>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="tooltip-content">
                      <p>70% - 30% (Alt+8)</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="icon" 
                        className="h-6 w-6 rounded-full bg-white/90 shadow-sm resizer-button"
                        onClick={() => setBottomPanelHeight(40)}
                      >
                        <div className="flex flex-col h-4 w-4">
                          <div className="h-[60%] w-full bg-primary/30"></div>
                          <div className="h-[40%] w-full bg-primary/10"></div>
                        </div>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="tooltip-content">
                      <p>60% - 40% (Alt+7)</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="icon" 
                        className="h-6 w-6 rounded-full bg-white/90 shadow-sm resizer-button"
                        onClick={() => setBottomPanelHeight(50)}
                      >
                        <div className="flex flex-col h-4 w-4">
                          <div className="h-1/2 w-full bg-primary/30"></div>
                          <div className="h-1/2 w-full bg-primary/10"></div>
                        </div>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="tooltip-content">
                      <p>50% - 50% (Alt+5)</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>

            {/* Test Cases Panel */}
            <div 
              className="test-panel border-t flex flex-col"
              style={{ 
                height: `${bottomPanelHeight}%`,
                boxSizing: 'border-box',
                display: focusMode ? 'none' : 'flex', // Hide the test panel in focus mode
                minHeight: '20%', // Ensure panel has a minimum height
                maxHeight: '80%', // Maximum height to maintain editor visibility
                overflow: 'hidden' // Prevent content from spilling out
              }}
            >
              <div className="test-panel-header">
                <div className="text-xs text-gray-500 dark:text-gray-400">Saved</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Ln 1, Col 1</div>
              </div>
              <div className="flex flex-1 overflow-hidden">
                <div className="w-10 border-border border-r flex flex-col items-center py-2 flex-shrink-0">
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500">
                    <FileCode className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500">
                    <CheckSquare className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500">
                    <Info className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex-1 overflow-hidden">
                  <Tabs 
                    value={testTabValue} 
                    onValueChange={(value) => {
                      setTestTabValue(value);
                      // Ensure panel height doesn't change when switching tabs
                      setBottomPanelHeight(bottomPanelHeight);
                    }} 
                    defaultValue="testcase" 
                    className="w-full h-full flex flex-col">
                    <div className="border-border border-b flex-shrink-0">
                      <TabsList className="px-4">
                        <TabsTrigger value="testcase" className="text-sm">
                          <CheckSquare className="h-4 w-4 mr-1" />
                          Testcase
                        </TabsTrigger>
                        <TabsTrigger value="result" className="text-sm">
                          Test Result
                        </TabsTrigger>
                      </TabsList>
                    </div>
                    <TabsContent value="testcase" className="flex-1 p-4 test-panel-content panel-scrollable">
                      {isLoading ? (
                        <div className="flex items-center justify-center h-40">
                          <div className="flex flex-col items-center gap-4">
                            <div className="h-8 w-8 rounded-full border-2 border-t-primary border-r-transparent border-b-transparent border-l-transparent animate-spin"></div>
                            <p className="text-muted-foreground">Loading test cases...</p>
                          </div>
                        </div>
                      ) : (
                        <TestCases sampleTestCases={problem?.sampleTestCases} judgeResults={results?.judgeResults} loading={isRunning} />
                      )}
                    </TabsContent>
                    <TabsContent value="result" className="flex-1 p-4 test-panel-content panel-scrollable">
                      <ResultPanel results={results} />
                    </TabsContent>
                  </Tabs>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Save Snippet Dialog */}
      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Save Code Snippet</DialogTitle>
            <DialogDescription>
              Save your current code as a reusable snippet for future reference.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="snippetName">Snippet Name</Label>
              <Input 
                id="snippetName" 
                placeholder="e.g., Two Sum Solution" 
                value={snippetName}
                onChange={(e) => setSnippetName(e.target.value)}
              />
            </div>
            <div className="flex items-center text-sm text-muted-foreground">
              <Info className="h-4 w-4 mr-2" />
              Snippets are stored locally in your browser.
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSaveDialog(false)}>Cancel</Button>
            <Button onClick={saveSnippet} disabled={!snippetName.trim()}>Save Snippet</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Premium Features Drawer */}
      {showPremiumModal && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={() => setShowPremiumModal(false)}
        >
          <div className="bg-white dark:bg-gray-800 dark:text-gray-100 rounded-xl p-6 max-w-2xl w-full" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Crown className="h-6 w-6 text-orange-500" />
                <span>Premium Features</span>
              </h2>
              <Button variant="ghost" size="sm" onClick={() => setShowPremiumModal(false)}>
                ✕
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="border rounded-lg p-4 hover:shadow-md transition-shadow dark:border-gray-700 dark:bg-gray-700/50">
                <div className="flex items-center gap-2 mb-2">
                  <BookOpenCheck className="h-5 w-5 text-orange-500" />
                  <h3 className="font-medium">Official Solutions</h3>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Access detailed official solutions with step-by-step explanations and complexity analysis.
                </p>
              </div>

              <div className="border rounded-lg p-4 hover:shadow-md transition-shadow dark:border-gray-700 dark:bg-gray-700/50">
                <div className="flex items-center gap-2 mb-2">
                  <BarChart2 className="h-5 w-5 text-orange-500" />
                  <h3 className="font-medium">Company Tags</h3>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300">See which companies frequently ask this problem in interviews.</p>
              </div>

              <div className="border rounded-lg p-4 hover:shadow-md transition-shadow dark:border-gray-700 dark:bg-gray-700/50">
                <div className="flex items-center gap-2 mb-2">
                  <Video className="h-5 w-5 text-orange-500" />
                  <h3 className="font-medium">Video Solutions</h3>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Watch video explanations from top instructors for complex problems.
                </p>
              </div>

              <div className="border rounded-lg p-4 hover:shadow-md transition-shadow dark:border-gray-700 dark:bg-gray-700/50">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="h-5 w-5 text-orange-500" />
                  <h3 className="font-medium">Mock Interviews</h3>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Practice with timed mock interviews tailored to specific companies.
                </p>
              </div>
            </div>

            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6 dark:bg-gray-800/40 dark:border-orange-900/30 dark:text-gray-200">
              <h3 className="font-medium text-orange-800 dark:text-orange-400 mb-2">Premium Subscription Benefits</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <svg className="h-4 w-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Access to 2,000+ premium problems
                </li>
                <li className="flex items-center gap-2">
                  <svg className="h-4 w-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Company-specific problem sets
                </li>
                <li className="flex items-center gap-2">
                  <svg className="h-4 w-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Advanced analytics and progress tracking
                </li>
                <li className="flex items-center gap-2">
                  <svg className="h-4 w-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Priority support from staff
                </li>
              </ul>
            </div>

            <div className="flex justify-center">
              <Button
                className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-2"
                onClick={() => {
                  setIsPremiumUser(true)
                  setShowPremiumModal(false)
                }}
              >
                <Crown className="h-4 w-4 mr-2" />
                Subscribe Now
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Premium Feature Indicator */}
      {isPremiumUser && (
        <div className="fixed bottom-4 left-4 bg-orange-500 text-white px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 shadow-lg">
          <Crown className="h-3 w-3" />
          Premium Active
        </div>
      )}
    </div>
  )
}
 