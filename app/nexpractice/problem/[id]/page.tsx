"use client"

import { useState, useEffect, useRef, useCallback, useMemo } from "react"
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
  Loader2,
  Send,
  CheckCircle2,
  Database,
  XCircle,
  Minimize,
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
import { PanelsFullscreen } from "@/components/nexpractice/ui/panels-fullscreen"
import { runWithJudge0 } from "@/utils/judge0"
import { useSession, signOut } from "next-auth/react"
import { useProfilePic } from "@/components/ProfilePicContext"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { User, LogOut } from "lucide-react"
import { formatDistanceToNow } from 'date-fns';
import { useJudge0Languages } from '@/components/hooks/useJudge0Languages';
import { fetchJudge0Languages } from "@/app/api/judge0/route";

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

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  return isMobile;
}

// Define props interface for initialData
interface InitialDataProps {
  initialData?: {
    problem: any;
    judge0Languages: any[];
    lastLanguage?: string | null; // Add lastLanguage property
    // User-specific data will be fetched client-side
  }
}

// Add this near the top of the file, outside the component
const COMMON_LANGUAGE_NAMES: Record<string, string> = {
  '45': 'Assembly (NASM 2.14.02)',
  '46': 'Bash (5.0.0)',
  '47': 'Basic (FBC 1.07.1)',
  '48': 'C (GCC 7.4.0)',
  '49': 'C (GCC 8.3.0)',
  '50': 'C (GCC 9.2.0)',
  '51': 'C# (Mono 6.6.0.161)',
  '52': 'C++ (GCC 7.4.0)',
  '53': 'C++ (GCC 8.3.0)',
  '54': 'C++ (GCC 9.2.0)',
  '55': 'Common Lisp (SBCL 2.0.0)',
  '56': 'D (DMD 2.089.1)',
  '57': 'Elixir (1.9.4)',
  '58': 'Erlang (OTP 22.2)',
  '59': 'Fortran (GFortran 9.2.0)',
  '60': 'Go (1.13.5)',
  '61': 'Haskell (GHC 8.8.1)',
  '62': 'Java (OpenJDK 13.0.1)',
  '63': 'JavaScript (Node.js 12.14.0)',
  '64': 'Lua (5.3.5)',
  '65': 'OCaml (4.09.0)',
  '66': 'Octave (5.1.0)',
  '67': 'Pascal (FPC 3.0.4)',
  '68': 'PHP (7.4.1)',
  '69': 'Prolog (GNU Prolog 1.4.5)',
  '70': 'Python (2.7.17)',
  '71': 'Python (3.8.1)',
  '72': 'Ruby (2.7.0)',
  '73': 'Rust (1.40.0)',
  '74': 'TypeScript (3.7.4)',
};

export default function ProblemPage({ initialData }: InitialDataProps = {}) {
  // Remove duplicate params and problemId declarations - keep only one set
  const params = useParams()
  const problemId = params.id as string

  // Set initial code to empty string or starter code if available
  const [code, setCode] = useState(initialData?.problem?.starterCode || "");
  const [results, setResults] = useState<any>(null)
  const [isRunning, setIsRunning] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitResults, setSubmitResults] = useState<any>(null)
  const [leftPanelWidth, setLeftPanelWidth] = useState(50) // Default 50%
  const [bottomPanelHeight, setBottomPanelHeight] = useState(55) // Default 55% of right panel
  const [isResizingHorizontal, setIsResizingHorizontal] = useState(false)
  const [isResizingVertical, setIsResizingVertical] = useState(false)
  const [showVisualization, setShowVisualization] = useState(false)
  
  // Initialize language state with initialData.lastLanguage if available, then from problem's first language option
  const [language, setLanguage] = useState(
    initialData?.lastLanguage || initialData?.problem?.languageOptions?.[0]?.languageId?.toString() || ""
  );
  
  // Initialize availableLanguages from initialData if possible
  const [availableLanguages, setAvailableLanguages] = useState<LanguageOption[]>(
    initialData?.problem?.languageOptions || []
  );
  
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)
  const [showPremiumModal, setShowPremiumModal] = useState(false)
  const [isPremiumUser, setIsPremiumUser] = useState(false)
  const [savedSnippets, setSavedSnippets] = useState<{name: string, code: string, language: string}[]>([])
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const [snippetName, setSnippetName] = useState("")
  const [codeCopied, setCodeCopied] = useState(false)
  const [focusMode, setFocusMode] = useState(false)
  const [problem, setProblem] = useState<Problem | null>(initialData?.problem || null)
  const [timeElapsed, setTimeElapsed] = useState(0)
  
  // Initialize loading states based on whether we have initialData
  const [isLoading, setIsLoading] = useState(!initialData?.problem)
  const [isLanguageLoading, setIsLanguageLoading] = useState(!initialData?.judge0Languages?.length)
  const [isCodeLoading, setIsCodeLoading] = useState(!initialData?.problem)
  
  // Only declare languageFilter once
  const [languageFilter, setLanguageFilter] = useState("")
  const [languageDropdownOpen, setLanguageDropdownOpen] = useState(false)
  const [editorSettingsOpen, setEditorSettingsOpen] = useState(false)
  const editorSettingsRef = useRef<{ showSettings: () => void } | null>(null)
  const [testTabValue, setTestTabValue] = useState("testcase") // Track active test tab
  const { profilePic } = useProfilePic()
  const [errorLine, setErrorLine] = useState<number | null>(null) // Add state for error line
  const [errorMessage, setErrorMessage] = useState<string | null>(null) // Add state for error message
  const [showAcceptedTab, setShowAcceptedTab] = useState(false)
  const [acceptedSubmission, setAcceptedSubmission] = useState<any>(null)
  const [activeTab, setActiveTab] = useState("description")
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [submissionsLoading, setSubmissionsLoading] = useState(false);
  const [showSubmissionTab, setShowSubmissionTab] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState<any>(null);
  const [submissionLoading, setSubmissionLoading] = useState(false);
  const [isTestPanelExpanded, setIsTestPanelExpanded] = useState(false);

  // Add a new state for directly loaded languages
  const [directlyLoadedLanguages, setDirectlyLoadedLanguages] = useState<any[]>([]);

  const confettiRef = useRef<HTMLDivElement>(null)
  const rightPanelRef = useRef<HTMLDivElement>(null)
  const previousHeightRef = useRef(bottomPanelHeight)
  const previousLeftWidthRef = useRef(leftPanelWidth)

  const { data: session } = useSession();
  
  // Initialize Judge0Languages with data from SSR if available
  const { languages: judge0LanguagesFromHook, loading: judge0Loading } = useJudge0Languages(
    initialData?.judge0Languages || []
  );
  
  // Make sure initialData doesn't change identity on each render
  const memoizedInitialData = useMemo(() => initialData, [JSON.stringify(initialData)]);
  
  // Use the judge0Languages from either SSR or client-side hook
  const judge0Languages = useMemo(() => {
    if (initialData?.judge0Languages?.length) {
      return initialData.judge0Languages;
    }
    if (directlyLoadedLanguages.length > 0) {
      return directlyLoadedLanguages;
    }
    return judge0LanguagesFromHook;
  }, [initialData?.judge0Languages, judge0LanguagesFromHook, directlyLoadedLanguages]);

  const isMobile = useIsMobile();
  
  // Add state flag to track whether we've hydrated with initialData
  const hasHydratedRef = useRef(false);
  
  // Memoize the displayed language name
  const displayedLanguageName = useMemo(() => {
    // If no language is set yet, show loading
    if (!language) return "Loading...";
    
    // Debug what's happening with language resolution
    console.log(`[DEBUG] Resolving display name for language=${language}, judge0Languages length=${judge0Languages?.length || 0}`);
    
    // If judge0Languages are available, try to find a match by ID
    if (judge0Languages?.length > 0) {
      // First try to find a match by ID
      if (!isNaN(Number(language))) {
        const judge0Lang = judge0Languages.find(l => String(l.id) === language);
        if (judge0Lang?.name) {
          console.log(`[DEBUG] Found judge0 language by ID=${language}, name=${judge0Lang.name}`);
          return judge0Lang.name;
        }
      }
    }
    
    // Also check directlyLoadedLanguages just in case
    if (directlyLoadedLanguages?.length > 0) {
      if (!isNaN(Number(language))) {
        const directLang = directlyLoadedLanguages.find(l => String(l.id) === language);
        if (directLang?.name) {
          console.log(`[DEBUG] Found direct language by ID=${language}, name=${directLang.name}`);
          return directLang.name;
        }
      }
    }
    
    // If availableLanguages are available, try to find a match by ID or name
    if (availableLanguages?.length > 0) {
      // Try by ID first
      if (!isNaN(Number(language))) {
        const availableLang = availableLanguages.find(l => String(l.languageId) === language);
        if (availableLang?.name) {
          console.log(`[DEBUG] Found available language by ID=${language}, name=${availableLang.name}`);
          return availableLang.name;
        }
      }
      
      // Try by name
      const availableLang = availableLanguages.find(l => l.name === language);
      if (availableLang) {
        console.log(`[DEBUG] Found available language by name=${language}`);
        return availableLang.name;
      }
    }
    
    // FALLBACK - Check if this is a problem with judge0Languages not being loaded yet
    // This happens during SSR or first render
    if (!judge0Languages?.length && initialData?.judge0Languages?.length) {
      const initialJudge0Lang = initialData.judge0Languages.find(l => String(l.id) === language);
      if (initialJudge0Lang?.name) {
        console.log(`[DEBUG] Found language in initialData by ID=${language}, name=${initialJudge0Lang.name}`);
        return initialJudge0Lang.name;
      }
    }
    
    // If language is a number, check our common mappings
    if (!isNaN(Number(language)) && COMMON_LANGUAGE_NAMES[language]) {
      console.log(`[DEBUG] Using common language mapping for ID=${language}: ${COMMON_LANGUAGE_NAMES[language]}`);
      return COMMON_LANGUAGE_NAMES[language];
    } 
    
    // If language is a number and we didn't find a match, format it as "Language X"
    if (!isNaN(Number(language))) {
      console.log(`[WARNING] Could not resolve language name for ID=${language}`);
      return `Language ${language}`;
    }
    
    // Default case: just return the language itself
    return language;
  }, [language, judge0Languages, availableLanguages, initialData?.judge0Languages, directlyLoadedLanguages]);

  // Add this effect BEFORE the useEffect that fetches the problem
  // This effect focuses on fixing the language display when judge0Languages are loaded
  useEffect(() => {
    // Skip if judge0Languages aren't loaded yet
    if (!judge0Languages || judge0Languages.length === 0) return;
    
    // Skip if language isn't set yet
    if (!language) return;
    
    // No need to update state here - just let the display name update naturally through the useMemo
    // We were previously doing a state update that caused an infinite loop
    
    // Previous problematic code:
    // if (!isNaN(Number(language))) {
    //   const judge0Lang = judge0Languages.find(l => String(l.id) === language);
    // }
    
    // This effect is only needed to log that languages are loaded
    console.log(`[DEBUG] judge0Languages loaded (${judge0Languages.length}) for language: ${language}`);
  }, [judge0Languages?.length, language]);

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

  // Helper to get the full language name with version for a given languageId or name
  function getFullLanguageName(languageIdOrName: string): string {
    // Direct mapping for common Judge0 language IDs to ensure consistent naming
    const directMappings: Record<string, string> = {
      '53': 'C++ GCC 8.3.0',
      '54': 'C++ Clang',
      '4': 'JavaScript (Node.js)',
      '11': 'Python 3',
    };
    
    // Check for direct mapping first
    if (directMappings[languageIdOrName]) {
      return directMappings[languageIdOrName]; 
    }
    
    // Then try to find in available languages
    const languageOption = availableLanguages.find(
      l => String(l.languageId) === String(languageIdOrName) || l.name === languageIdOrName
    );
    return languageOption?.name || languageIdOrName;
  }

  // Centralized function to update last language - this should be the ONLY function calling the API
  const updateLastLanguageOnServer = useCallback((langId: string) => {
    // Skip if no session, no problemId, or already in progress
    if (!session?.user?.id || !problemId || inFlightRequestsRef.current.lastLanguage) {
      return;
    }
    
    inFlightRequestsRef.current.lastLanguage = true;
    console.log(`[DEBUG] Calling last-language API for language ID=${langId}`);
    
    fetch(`/api/problem/${problemId}/last-language`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ language: langId }), // Send the language ID
    })
    .then(response => {
      console.log(`[DEBUG] Last-language API response status:`, response.status);
      inFlightRequestsRef.current.lastLanguage = false;
      return response.json();
    })
    .then(data => {
      console.log(`[DEBUG] Last-language API response:`, data);
    })
    .catch(e => {
      console.error("[DEBUG] Error updating last language:", e);
      inFlightRequestsRef.current.lastLanguage = false;
    });
  }, [session?.user?.id, problemId]);

  // Update handleLanguageChange to use this centralized function and handle SSR
  const handleLanguageChange = (langId: string) => {
    if (langId === language) {
      console.log(`[DEBUG] Skipping language change - already using ${langId}`);
      return;
    }
    
    console.log(`[DEBUG] Changing language from ${language} to ${langId}`);
    
    // Find the selected language in availableLanguages
    const selectedLang = availableLanguages.find((l: LanguageOption) => String(l.languageId) === String(langId));
    if (!selectedLang) {
      console.error(`[DEBUG] Language ${langId} not found in available languages`);
      return;
    }
    
    setLanguageDropdownOpen(false);
    
    // Save current code before switching
    if (code && language) {
      console.log(`[DEBUG] Saving code for current language ${language} before switching`);
      saveCode();
    }
    
    // Save to localStorage (always do this)
    try {
      localStorage.setItem(`nexacademy_last_language_${problemId}`, langId);
      console.log(`[DEBUG] Saved language ${langId} to localStorage`);
      } catch (err) {
      console.error(`[DEBUG] Error saving language to localStorage:`, err);
      }
    
    // Set language state
    setLanguage(langId);
    console.log(`[DEBUG] Language state updated to ${langId}`);
    
    // Call the centralized function to update on server (if logged in)
    if (session?.user?.id) {
      console.log(`[DEBUG] User is logged in, updating language on server`);
      updateLastLanguageOnServer(langId);
    }
  };

  // Remove the separate effect that calls last-language API
  // But keep this debug effect to show when language changes
  useEffect(() => {
    if (language) {
      console.log(`[DEBUG] Language changed to ${language}`);
      // Add check for load-code problems
    if (session?.user?.id) {
        setTimeout(() => {
          console.log(`[DEBUG] Load-Code check: inFlight=${inFlightRequestsRef.current.loadCode}, code length=${code?.length || 0}`);
        }, 500);
      }
    }
  }, [language, session?.user?.id, code]);

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
    saveCode();
    // First save the current code
   
    
    // Then continue with the existing run code logic
    setIsRunning(true)
    setResults(null)
    setErrorLine(null) // Reset error line when running code
    setErrorMessage(null) // Reset error message when running code
    
    // Store the current bottomPanelHeight before switching tabs
    const currentHeight = bottomPanelHeight
    
    // If user is on the result tab, switch to testcase tab
    if (testTabValue === "result") {
      setTestTabValue("testcase");
    }
    
    // Declare submission data structure
    let submissionData: any = {
      language,
      code,
      testcasesPassed: 0,
      totalTestcases: 0,
      allPassed: false,
      runtime: null,
      memory: null,
      runtimePercentile: null,
      memoryPercentile: null
    };
    
    // Track if we should save to backend
    let shouldSave = false;
    
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
      let selectedLang;
      let languageId;
      
      // First try finding by language ID
      if (!isNaN(Number(language))) {
        // If language is already a numeric ID, try to find it directly
        selectedLang = availableLanguages.find(l => String(l.languageId) === language);
        if (selectedLang) {
          languageId = selectedLang.languageId;
        } else {
          // If not found in availableLanguages but language is a number, use it directly
          languageId = Number(language);
        }
      } else {
        // If language is a name, find by name
        selectedLang = availableLanguages.find(l => l.name === language);
        if (selectedLang) {
          languageId = selectedLang.languageId;
        }
      }
      

      if (!languageId) throw new Error("Language ID not found");
      
      // Prepare sample test cases
      const testCases = (problem?.sampleTestCases || []).map(tc => ({
        input: typeof tc.input === "string" ? tc.input : JSON.stringify(tc.input),
        expectedOutput: typeof tc.expectedOutput === "string" ? tc.expectedOutput : JSON.stringify(tc.expectedOutput),
      }));
      
      
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
      });
      
      // If bottom panel is not visible enough, adjust it
      if (currentHeight < 20) {
        setBottomPanelHeight(30); // Show a reasonable size for results
      } else {
        // Make sure to restore the height (ensures we didn't lose the size)
        setBottomPanelHeight(currentHeight);
      }
      
      // Run with Judge0 using the extracted languageId
      const judgeResults = await runWithJudge0({
        sourceCode: code,
        languageId,
        testCases,
      });
     
      
      // Check for errors and extract line numbers
      if (judgeResults.length > 0) {
        // Look for compile or runtime errors
        const firstError = judgeResults.find(result => 
          result.verdict === "Compile Error" || 
          result.verdict === "Runtime Error"
        );
        
        if (firstError) {
          const errorMessage = firstError.compile_output || firstError.stderr || '';
          const lineNumber = extractErrorLineNumber(errorMessage);
          if (lineNumber) {
            setErrorLine(lineNumber);
            setErrorMessage(errorMessage); // Set the error message
          }
        }
      }
      
      setResults({
        success: true,
        loading: false,
        judgeResults,
        mode: "run",
        showOnlyFailures: false
      });
    } catch (error: any) {
      console.error('Error running code:', error);
      
      // Try to extract line number from error message
      const lineNumber = extractErrorLineNumber(error.message);
      if (lineNumber) {
        setErrorLine(lineNumber);
        setErrorMessage(error.message); // Set the error message
      }
      
      setResults({
        success: false,
        loading: false,
        error: error.message || "Unknown error running code.",
        mode: "run"
      });
    }
    
    setIsRunning(false);
  }

  const handlePremiumClick = () => {
    setShowPremiumModal(true)
  }

  const togglePremiumStatus = () => {
    setIsPremiumUser(!isPremiumUser)
  }

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      // Enter fullscreen
      document.documentElement.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      // Exit fullscreen
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
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

  // Modify the effect that loads problem data to use initialData if available
  useEffect(() => {
    // Skip this effect if we're changing due to memoizedInitialData change
    if (memoizedInitialData?.problem && hasHydratedRef.current) {
      return;
    }

    // If we already have problem data from initialData, skip fetching
    if (memoizedInitialData?.problem) {
      console.log('[SSR] Using server-provided problem data');
      hasHydratedRef.current = true;
      
      // Make sure to set availableLanguages and language from initialData
      if (memoizedInitialData.problem.languageOptions?.length > 0) {
        setAvailableLanguages(memoizedInitialData.problem.languageOptions);
        
        // Set default language if not already set
        if (!language && memoizedInitialData.problem.languageOptions[0]?.languageId) {
          setLanguage(String(memoizedInitialData.problem.languageOptions[0].languageId));
        }
        
        // Mark language loading as complete since we have data
        setIsLanguageLoading(false);
      }
      
      // Start timer and return early
      const timer = setInterval(() => {
        setTimeElapsed((prev) => prev + 1);
      }, 1000);
      
      return () => clearInterval(timer);
    }
    
    // Only fetch if we don't have initialData
    console.log('[CLIENT] Fetching problem data client-side');
    
    // Fetch problem data from API
    const fetchProblem = async () => {
      setIsLoading(true);
      setIsLanguageLoading(true);
      setIsCodeLoading(true);
      
      // Reset tabs state when loading a new problem
      setActiveTab("description");
      setShowAcceptedTab(false);
      setAcceptedSubmission(null);
      
      try {
        const response = await fetch(`/api/problem/${problemId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch problem data');
        }
        const data = await response.json();
        setProblem(data);
        
        // Set available languages from the problem data
        if (data?.languageOptions && Array.isArray(data.languageOptions)) {
          setAvailableLanguages(data.languageOptions);
          
          // Set default language if problem has language options
          if (data.languageOptions.length > 0 && data.languageOptions[0].languageId) {
            setLanguage(String(data.languageOptions[0].languageId));
          }
          
          setIsLanguageLoading(false);
        }
        
        // Additional fetch logic...
      } catch (error) {
        console.error('Error fetching problem:', error);
        // Fallback logic...
      } finally {
        setIsLoading(false);
      }
    };

    fetchProblem();

    // Start timer
    const timer = setInterval(() => {
      setTimeElapsed((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [memoizedInitialData, problemId]);

  // Track whether we've completed initial load
  const initialLoadCompleteRef = useRef(false);
  const loadedRef = useRef(false);
  const lastSavedCodeRef = useRef<string>("");
  const lastSaveTimeRef = useRef<number>(0);
  const prevProblemIdRef = useRef<string | null>(null);
  const prevLanguageRef = useRef<string | null>(null);

  // Add this near the top of your component
  const codeRef = useRef(code);
  useEffect(() => {
    codeRef.current = code;
  }, [code]);

  // Add refs to track in-flight requests
  const inFlightRequestsRef = useRef<{
    loadCode: boolean;
    saveCode: boolean;
    lastLanguage: boolean;
  }>({
    loadCode: false,
    saveCode: false,
    lastLanguage: false
  });

  // Update saveCode to use in-flight tracking
  const saveCode = useCallback(() => {
    if (!problemId || !language || !code || inFlightRequestsRef.current.saveCode) return;
    
    try {
      // ALWAYS use language ID (not name) for localStorage to ensure consistency
      localStorage.setItem(`nexacademy_code_${problemId}_${language}`, code);
      
      // Only save to backend if user is logged in and no request is in flight
    if (session?.user?.id) {
        inFlightRequestsRef.current.saveCode = true;
        
        // Get clean language name or ID for backend
        const fullLanguageName = getFullLanguageName(language);
        
        console.log(`[DEBUG] Saving code for language=${language}, fullName=${fullLanguageName}`);
        
      fetch(`/api/problem/${problemId}/save-code`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            code, 
            language: language // Send language ID instead of name to ensure consistency
          }),
        })
        .then(response => {
          console.log(`[DEBUG] Save-code API response status:`, response.status);
          inFlightRequestsRef.current.saveCode = false;
          return response.json();
        })
        .then(data => {
          console.log(`[DEBUG] Save-code API response:`, data);
        })
        .catch(err => {
          console.error(`[DEBUG] Error saving code:`, err);
          inFlightRequestsRef.current.saveCode = false;
        });
      }
    } catch (err) {
      console.error(`[DEBUG] Error in saveCode:`, err);
      inFlightRequestsRef.current.saveCode = false;
    }
  }, [code, problemId, language, session?.user?.id]);

  // Update loadSavedCode to also be consistent with language IDs
  const loadSavedCode = useCallback(async () => {
    if (!problemId || !language) {
      console.log(`[DEBUG] loadSavedCode skipped: problemId=${!!problemId}, language=${!!language}`);
      return false;
    }
    
    // Reset in-flight flag to ensure we make a fresh call
    if (inFlightRequestsRef.current) {
      inFlightRequestsRef.current.loadCode = false;
    }
    
    console.log(`[DEBUG] loadSavedCode starting for language=${language}`);
    
    if (inFlightRequestsRef.current) {
      inFlightRequestsRef.current.loadCode = true;
    }
    
    setIsCodeLoading(true);
    
    try {
      // First try localStorage with language ID (consistent with saveCode)
      const savedCode = localStorage.getItem(`nexacademy_code_${problemId}_${language}`);
      const useLocalStorage = true; // Set to true to use localStorage when available
      
      if (savedCode && useLocalStorage) {
        console.log(`[DEBUG] Code loaded from localStorage for language=${language}`);
        setCode(savedCode);
        setIsCodeLoading(false);
        
        if (inFlightRequestsRef.current) {
          inFlightRequestsRef.current.loadCode = false;
        }
        
        return true;
      }
      
      // ALWAYS try backend if user is logged in
    if (session?.user?.id) {
        try {
          console.log(`[DEBUG] Calling load-code API for language ID=${language}`);
          // Use plain language ID for API call
          const timestamp = Date.now();
          const res = await fetch(`/api/problem/${problemId}/load-code?language=${encodeURIComponent(language)}&_=${timestamp}`, {
            headers: {
              'Cache-Control': 'no-cache',
              'Pragma': 'no-cache'
            }
          });
          
          console.log(`[DEBUG] Load-code API response status:`, res.status);
          const data = await res.json();
          
          console.log(`[DEBUG] Load-code API response data:`, data);
          if (data && data.code) {
            setCode(data.code);
            localStorage.setItem(`nexacademy_code_${problemId}_${language}`, data.code);
            setIsCodeLoading(false);
            
            if (inFlightRequestsRef.current) {
              inFlightRequestsRef.current.loadCode = false;
            }
            
            return true;
          } else {
            console.log(`[DEBUG] No code found from API call`);
          }
        } catch (error) {
          console.error(`[DEBUG] Error fetching from backend:`, error);
        }
      } else {
        console.log(`[DEBUG] Skipping backend call because user is not logged in`);
      }
      
      // If we get here, no saved code found - use preload code
      const langObj = availableLanguages.find(l => String(l.languageId) === String(language));
      if (langObj?.preloadCode) {
        console.log(`[DEBUG] Using preload code for language ${language}`);
        setCode(langObj.preloadCode);
          } else {
        console.log(`[DEBUG] No preload code found for language ${language}, setting empty code`);
        setCode('');
      }
      
      setIsCodeLoading(false);
      
      if (inFlightRequestsRef.current) {
        inFlightRequestsRef.current.loadCode = false;
      }
      
      return false;
    } catch (error) {
      console.error(`[DEBUG] Unexpected error in loadSavedCode:`, error);
      setIsCodeLoading(false);
      
      if (inFlightRequestsRef.current) {
        inFlightRequestsRef.current.loadCode = false;
      }
      
      return false;
    }
  }, [problemId, language, session?.user?.id, availableLanguages, setCode, setIsCodeLoading]);

  // Force a call to loadSavedCode when language changes
  useEffect(() => {
    if (language && problemId) {
      console.log(`[DEBUG] Language changed to ${language} - forcing code load`);
      // Small delay to ensure language state is fully updated
      setTimeout(() => {
        loadSavedCode().catch(e => {
          console.error(`[DEBUG] Error loading code after language change:`, e);
        });
      }, 100);
    }
  }, [language, problemId, loadSavedCode]);

  // Load code when problem/language changes, and on mount
  useEffect(() => {
    if (problemId && language && availableLanguages.length > 0) {
      // Don't reload if we've just changed view and the language/problem haven't changed
      if (loadedRef.current && 
          prevProblemIdRef.current === problemId && 
          prevLanguageRef.current === language) {
        return;
      }
      
      // Load code only once
      if (!inFlightRequestsRef.current.loadCode) {
        loadSavedCode()
          .then(() => {
            // Update tracking refs
          loadedRef.current = true;
          prevProblemIdRef.current = problemId;
          prevLanguageRef.current = language;
          initialLoadCompleteRef.current = true;
          })
          .catch(error => {
            console.error(`Error in loadCode effect:`, error);
          });
      }
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
      
      // Load code for the new language
      loadSavedCode().catch(error => {
        console.error('[DEBUG-LANG] Error loading code for new language:', error);
      });
    }
  }, [language, problemId, loadSavedCode]);
  
  // Reset loadedRef when problem changes, and save current code
  useEffect(() => {
    // Skip initial render
    if (!initialLoadCompleteRef.current) {
     
      prevProblemIdRef.current = problemId;
      return;
    }
    
    // Check if problem changed
    const problemChanged = prevProblemIdRef.current !== null && prevProblemIdRef.current !== problemId;
    
    
    // Save the current code before loading new code for changed problem
    if (problemChanged && code) {
      // Save to current problem/language
      if (language) {
        // Save to localStorage
        localStorage.setItem(`nexacademy_code_${problemId}_${language}`, code);
        
        // Save to backend if logged in
        if (session?.user?.id) {
          // Get the full language name from the availableLanguages array
          const selectedLang = availableLanguages.find((l: LanguageOption) => String(l.languageId) === String(language));
          const fullLanguageName = selectedLang?.name || language;
          
          fetch(`/api/problem/${problemId}/save-code`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code, language: fullLanguageName }),
          }).catch(err => console.error('[DEBUG] Error saving to backend:', err));
        }
      }
    }
    
    // Update problem reference
    prevProblemIdRef.current = problemId;
    
    // Reset load flag to ensure we reload code for the new problem
    if (problemChanged) {
      loadedRef.current = false;
    }
  }, [problemId, code, language, session?.user?.id, availableLanguages]);

  // --- Persist selected language on change (backend + localStorage) ---
  const didMountRef = useRef(false);
  useEffect(() => {
    if (!didMountRef.current) {
      didMountRef.current = true;
      return; // Skip the first render
    }
    
  }, [language, problemId, session]);

  // Add this inside your component, after code, selectedLanguage, problemId, and user/session are defined
  useEffect(() => {
    function handleVisibilityChange() {
      if (document.visibilityState === 'hidden') {
        saveCodeDraft();
      }
    }
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [code, language, problemId, session]);

  // ... existing code ...
  // Ensure saveCodeDraft saves to localStorage and backend if logged in
  async function saveCodeDraft() {
    if (!problemId || !language) return;
    const latestCode = codeRef.current;
    const fullLang = getFullLanguageName(language);
    console.log(latestCode, fullLang);
    localStorage.setItem(
      `nexacademy_code_draft_${problemId}_${fullLang}`,
      latestCode
    );
    if (session?.user?.id) {
      try {
        await fetch(`/api/problem/${problemId}/save-code`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            code: latestCode,
            language: fullLang,
          }),
        });
      } catch (e) {}
    }
  }
  // ... existing code ...

  // 1. Save to localStorage on every keystroke
  useEffect(() => {
    if (problemId && language) {
      localStorage.setItem(`nexacademy_code_${problemId}_${language}`, code);
    }
  }, [code, problemId, language]);

  // 2. Save to backend on tab switch away, language change, run/submit, tab close
  const saveCodeToBackend = useCallback(() => {
    // Just call our main saveCode function
    saveCode();
  }, [saveCode]);

  // 3. On tab switch (visibilitychange)
  useEffect(() => {
    function handleVisibilityChange() {
      if (document.visibilityState === 'hidden') {
        saveCodeToBackend();
      } else if (document.visibilityState === 'visible') {
        // On tab switch back, load code from localStorage if different
        const localCode = localStorage.getItem(`nexacademy_code_${problemId}_${language}`) || "";
        if (localCode && localCode !== code) {
          setCode(localCode);
        }
      }
    }
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [problemId, language, code, saveCodeToBackend]);

  // 4. On tab close
  useEffect(() => {
    const handleBeforeUnload = () => {
      saveCodeToBackend();
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [saveCodeToBackend]);

  // 5. On language change, save code to backend
  useEffect(() => {
    if (language && problemId) {
      saveCodeToBackend();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language]);

  // Helper function to extract line number from error messages
  const extractErrorLineNumber = (errorMessage: string): number | null => {
    if (!errorMessage) return null;
    
    // Different patterns based on language
    const patterns = {
      python: [
        /File ".*", line (\d+)/i,
        /line (\d+)/i,
        /at line (\d+)/i
      ],
      javascript: [
        /at line (\d+)/i, 
        /line (\d+)/i,
        /(\d+):\d+/
      ],
      java: [
        /\.java:(\d+):/i,
        /at line (\d+)/i,
        /line (\d+)/i
      ],
      cpp: [
        /error: .*:(\d+):/i,
        /line (\d+)/i,
        /at line (\d+)/i
      ]
    };
    
    // Generic patterns as fallback
    const genericPatterns = [
      /line (\d+)/i,
      /at line (\d+)/i,
      /:(\d+):/,
      /\((\d+),\d+\)/
    ];
    
    let languagePatterns: RegExp[] = genericPatterns;
    
    // Select patterns based on current language
    if (language.toLowerCase().includes('python')) {
      languagePatterns = [...patterns.python, ...genericPatterns];
    } else if (language.toLowerCase().includes('javascript') || language.toLowerCase().includes('js')) {
      languagePatterns = [...patterns.javascript, ...genericPatterns];
    } else if (language.toLowerCase().includes('java')) {
      languagePatterns = [...patterns.java, ...genericPatterns];
    } else if (language.toLowerCase().includes('c++') || language.toLowerCase().includes('cpp')) {
      languagePatterns = [...patterns.cpp, ...genericPatterns];
    }
    
    // Try each pattern until we find a match
    for (const pattern of languagePatterns) {
      const match = errorMessage.match(pattern);
      if (match && match[1]) {
        const lineNumber = parseInt(match[1], 10);
        if (!isNaN(lineNumber) && lineNumber > 0) {
          return lineNumber;
        }
      }
    }
    
    // If we get here, we couldn't find a line number
    return null;
  };

  // Fetch submissions when Submissions tab is activated
  useEffect(() => {
    if (activeTab === 'submissions' && session?.user?.id && problemId) {
      setSubmissionsLoading(true);
      fetch(`/api/problem/${problemId}/submissions`)
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data.submissions)) {
            setSubmissions(data.submissions);
          }
        })
        .finally(() => setSubmissionsLoading(false));
    }
  }, [activeTab, session?.user?.id, problemId]);

  // Restore getLanguageBaseAndVersion and getLanguageIcon helpers:
  function getLanguageBaseAndVersion(langName: string): React.ReactNode {
    const parts = langName.split(' ');
    if (parts.length === 1) {
      return <>{langName}</>;
    }
    const baseName = parts[0];
    const version = parts.slice(1).join(' ');
    return (
      <>
        {baseName} <span className="version">{version}</span>
      </>
    );
  }

  function getLanguageIcon(langName: string): React.ReactNode {
    const baseLanguage = langName.split(' ')[0].toLowerCase();
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

  // Update the submitCode function to handle testcases sequentially and stop on first failure
  const submitCode = async () => {
    saveCode();
    setTestTabValue("result");
    setIsSubmitting(true)
    setSubmitResults(null)
    setErrorLine(null)
    setErrorMessage(null)
    const currentHeight = bottomPanelHeight

    // Variables to track submission info for saving
    let submissionData: any = {
      language,
      code,
      testcasesPassed: 0,
      totalTestcases: 0,
      allPassed: false,
      runtime: null,
      memory: null,
      runtimePercentile: null,
      memoryPercentile: null
    };
    let shouldSave = false;
    
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
        // Save what we can
        submissionData = {
          ...submissionData,
          testcasesPassed: 0,
          totalTestcases: 0,
          allPassed: false
        };
        shouldSave = true;
        return;
      }
      
      // Find the selected languageId - using the same logic as runCode
      let selectedLang;
      let languageId;
      
      // First try finding by language ID
      if (!isNaN(Number(language))) {
        // If language is already a numeric ID, try to find it directly
        selectedLang = availableLanguages.find(l => String(l.languageId) === language);
        if (selectedLang) {
          languageId = selectedLang.languageId;
        } else {
          // If not found in availableLanguages but language is a number, use it directly
          languageId = Number(language);
        }
      } else {
        // If language is a name, find by name
        selectedLang = availableLanguages.find(l => l.name === language);
        if (selectedLang) {
          languageId = selectedLang.languageId;
        }
      }
      
  

      if (!languageId) throw new Error("Language ID not found");
      
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
      
      // Create initial loading results - show "Evaluating..." message
      setResults({
        success: true,
        loading: true,
        judgeResults: [],
        mode: "submit",
        totalTestCases: allTestCases.length,
        showOnlyFailures: true,
        progress: {
          current: 0,
          total: allTestCases.length,
          message: "Evaluating all test cases...",
        }
      })
      
      // If bottom panel is not visible enough, adjust it
      if (currentHeight < 20) {
        setBottomPanelHeight(30);
      } else {
        setBottomPanelHeight(currentHeight);
      }
      
      // Process test cases one by one and stop on first failure
      let failedTestCase = null;
      let passedCount = 0;
      let totalRuntimeMs = 0;
      let totalMemoryKb = 0;
      let allPassed = true;
      for (let i = 0; i < allTestCases.length; i++) {
        const testCase = allTestCases[i];
        setResults((prev: any) => ({
          ...prev,
          progress: {
            current: i + 1,
            total: allTestCases.length,
            message: `Evaluating test case ${i + 1}/${allTestCases.length}...`,
          }
        }));
        const result = await runWithJudge0({
          sourceCode: code,
          languageId,
          testCases: [testCase],
        });
        if (result.length > 0) {
          const runtimeStr = result[0].time;
          const memoryStr = result[0].memory;
          if (runtimeStr) totalRuntimeMs += parseFloat(runtimeStr) * 1000;
          if (memoryStr) totalMemoryKb += parseInt(memoryStr, 10);
        }
        if (result.length > 0 && result[0].verdict !== "Accepted") {
          failedTestCase = {
            ...result[0],
            input: testCase.input,
          };
          allPassed = false;
          break;
        }
        passedCount++;
      }
      // After the loop, set total runtime, memory, and allPassed
      submissionData.runtime = `${Math.round(totalRuntimeMs)} ms`;
      submissionData.memory = `${(totalMemoryKb / 1024).toFixed(2)} MB`;
      submissionData.allPassed = allPassed;
      submissionData.testcasesPassed = passedCount;
      submissionData.totalTestcases = allTestCases.length;
      
      // After processing all test cases or finding a failure
      if (failedTestCase) {
        // Check for compile or runtime errors
        if (failedTestCase.verdict === "Compile Error" || failedTestCase.verdict === "Runtime Error") {
          const errorMessage = failedTestCase.compile_output || failedTestCase.stderr || '';
          const lineNumber = extractErrorLineNumber(errorMessage);
          if (lineNumber) {
            setErrorLine(lineNumber);
            setErrorMessage(errorMessage);
          }
        }
        setResults({
          success: true,
          loading: false,
          judgeResults: [failedTestCase],
          mode: "submit",
          summary: {
            passed: passedCount,
            total: allTestCases.length,
            allPassed: false,
            message: `Test case failed. (${passedCount}/${allTestCases.length} passed)`
          },
          showOnlyFailures: true
        });
      } else {
        // All test cases passed!
        const submissionStats = {
          runtime: `${Math.round(totalRuntimeMs)} ms`, // This would ideally come from Judge0 results
          runtimePercentile: "100.00%",
          memory: `${(totalMemoryKb / 1024).toFixed(2)} MB`, // This would ideally come from Judge0 results
          memoryPercentile: "63.06%", 
          code: code,
          language: language,
          timestamp: new Date().toISOString(),
          testsPassed: passedCount,
          totalTests: allTestCases.length
        };
        setAcceptedSubmission(submissionStats);
        setShowAcceptedTab(true);
        setActiveTab("accepted");
        setShowConfetti(true);
        setResults({
          success: true,
          loading: false,
          judgeResults: [],
          mode: "submit",
          summary: {
            passed: allTestCases.length,
            total: allTestCases.length,
            allPassed: true,
            message: `All ${allTestCases.length} test cases passed! 🎉`
          },
          showOnlyFailures: true
        });
      }
      shouldSave = true;
    } catch (error: any) {
      console.error('Error submitting code:', error)
      
      // Try to extract line number from error message
      const lineNumber = extractErrorLineNumber(error.message);
      if (lineNumber) {
        setErrorLine(lineNumber);
        setErrorMessage(error.message); // Set the error message
      }
      
      setResults({
        success: false,
        loading: false,
        error: error.message || "Unknown error submitting code.",
        mode: "submit"
      })
      // Save what we can
      submissionData = {
        ...submissionData,
        testcasesPassed: 0,
        totalTestcases: 0,
        allPassed: false
      };
      shouldSave = true;
    } finally {
      setIsSubmitting(false);
      // Always save submission if user is logged in
      if (session?.user?.id && shouldSave) {
        // Save with retry logic
        const saveWithRetry = async (retryCount = 0, maxRetries = 3) => {
          try {
            const response = await fetch(`/api/problem/${problemId}/save-submission`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(submissionData)
            });
            const data = await response.json();
            if (!response.ok) {
              if (retryCount < maxRetries) {
                console.log(`[CLIENT] Retrying save (${retryCount + 1}/${maxRetries})...`);
                setTimeout(() => saveWithRetry(retryCount + 1, maxRetries), 1000); // Retry after 1 second
              }
              return;
            }
          } catch (error) {
            if (retryCount < maxRetries) {
              setTimeout(() => saveWithRetry(retryCount + 1, maxRetries), 1000); // Retry after 1 second
            }
          }
        };
        saveWithRetry();
      }
    }
  }

  // Helper function to get the proper language name for the code editor
  const getEditorLanguageName = (languageIdOrName: string): string => {
    // Default return value if we can't determine the language
    let editorLanguage = 'plaintext';
    
    try {
      const normalizedId = String(languageIdOrName || '').trim();
      
      // Comprehensive map from language names to CodeMirror modes
      const languageModeMap: Record<string, string> = {
        'javascript': 'javascript',
        'typescript': 'typescript', 
        'python': 'python',
        'java': 'java',
        'c++': 'cpp',
        'cpp': 'cpp',
        'c': 'c',
        'c#': 'csharp',
        'csharp': 'csharp',
        'go': 'go',
        'rust': 'rust',
        'ruby': 'ruby',
        'php': 'php',
        'swift': 'swift',
        'kotlin': 'kotlin',
        'scala': 'scala',
        'haskell': 'haskell',
        'perl': 'perl',
        'r': 'r',
        'bash': 'shell',
        'shell': 'shell',
        'objective-c': 'objectivec',
        'objectivec': 'objectivec',
        'dart': 'dart'
      };
      
      // First try exact match for language ID in judge0Languages
      if (!isNaN(Number(normalizedId))) {
        if (judge0Languages?.length) {
          const judge0Lang = judge0Languages.find(l => String(l.id) === normalizedId);
          if (judge0Lang?.name) {
            const baseName = judge0Lang.name.split(/[\s(]/)[0].toLowerCase();
            return getEditorMode(baseName);
          }
        }
      }
      
      // If not found by ID, try find matching language by name or ID
      const matchingLang = availableLanguages.find(
        (l: LanguageOption) => 
          l.name.toLowerCase() === normalizedId.toLowerCase() || 
          String(l.languageId) === normalizedId
      );
      
      if (matchingLang?.name) {
        const baseName = matchingLang.name.split(/[\s(]/)[0].toLowerCase();
        return getEditorMode(baseName);
      }
      
      // If not found through lookups, try direct mapping if it's a language name
      if (isNaN(Number(normalizedId))) {
        const baseName = normalizedId.split(/[\s(]/)[0].toLowerCase();
        const modeFromMap = languageModeMap[baseName];
        if (modeFromMap) {
          return modeFromMap;
        }
        
        return baseName;
      }
      
      return editorLanguage;
    } catch (error) {
      return editorLanguage;
    }
  };

  // Get just the base language name (e.g., "JavaScript" from "JavaScript (Node.js 12.14.0)")
  // Returns plain text for CodeEditor instead of React JSX
  function getBaseLanguageName(langName: string): string {
    return langName.split(' ')[0];
  }

  // Add this effect after availableLanguages and problemId are loaded
  useEffect(() => {
    if (!problemId || !availableLanguages.length) return;

    availableLanguages.forEach(lang => {
      const fullLang = lang.name;
      const idKey = `nexacademy_code_${problemId}_${lang.languageId}`;
      const nameKey = `nexacademy_code_${problemId}_${lang.name}`;
      const newKey = `nexacademy_code_${problemId}_${fullLang}`;

      // If code exists under the old ID key and not under the new key, migrate it
      if (localStorage.getItem(idKey) && !localStorage.getItem(newKey)) {
        localStorage.setItem(newKey, localStorage.getItem(idKey) as string);
        localStorage.removeItem(idKey);
      }
      // If code exists under the old name key and not under the new key, migrate it
      if (localStorage.getItem(nameKey) && !localStorage.getItem(newKey)) {
        localStorage.setItem(newKey, localStorage.getItem(nameKey) as string);
        localStorage.removeItem(nameKey);
      }
    });
  }, [problemId, availableLanguages]);

  // Replace the old getEditorLanguageName function with a robust getEditorMode function
  function getEditorMode(languageName: string): string {
    if (!languageName) return 'javascript';
    
    // First check if this is a numeric Judge0 language ID
    if (!isNaN(Number(languageName))) {
      // Handle common Judge0 language IDs
      const langIdMap: Record<string, string> = {
        '4': 'javascript', // Node.js
        '11': 'python',    // Python 3 
        '10': 'python',    // Python 2
        '26': 'python',    // Python 3.6
        '70': 'python',    // Python 2.7.17
        '71': 'python',    // Python 3.8.1
        '29': 'java',      // Java 
        '54': 'cpp',       // C++
        '53': 'cpp',       // C++ GCC 8.3.0
        '55': 'java',      // Java
        '56': 'php',       // PHP
        '51': 'csharp',    // C#
        '60': 'go',        // Go
        '73': 'rust',      // Rust
        '72': 'ruby',      // Ruby
      };
      
      if (langIdMap[languageName]) {
        return langIdMap[languageName];
      }
    }
    
    // Lowercase and normalize the language name
    const langStr = String(languageName).toLowerCase();
    
    // Direct mappings for full language names
    if (langStr.startsWith('c++ gcc') || langStr.startsWith('c++ clang')) {
      return 'cpp';
    }
    
    // Check if language name contains c++ or cpp
    if (langStr.includes('c++') || langStr.includes('cpp') || langStr.includes('gcc')) {
      return 'cpp';
    }
    
    // Regular processing - extract base name
    const baseName = langStr
      .split(' (')[0]         // Remove version info, e.g., "Python (3.11.2)" -> "python"
      .split(' ')[0]          // Take just the first word
      .replace('#', 'sharp')  // "c#" -> "csharp"
      .replace('++', 'pp')    // "c++" -> "cpp"
      .replace(/[\s\-]/g, ''); // Remove spaces and dashes
      
    // Map to supported editor modes
    const modeMap: Record<string, string> = {
    'javascript': 'javascript',
      'js': 'javascript',
    'typescript': 'typescript',
      'ts': 'typescript',
      'python': 'python',
      'py': 'python',
      'java': 'java',
      'cpp': 'cpp',
      'c': 'c',
      'csharp': 'csharp',
      'cs': 'csharp',
      'go': 'go',
      'rust': 'rust',
      'php': 'php',
      'ruby': 'ruby',
      'swift': 'swift',
      'kotlin': 'kotlin',
      'dart': 'dart'
    };

    const result = modeMap[baseName] || 'javascript';
    return result;
  }

 


  // Helper: get Judge0 language object by ID
  function getJudge0LangById(langId: string | number) {
    return judge0Languages.find(l => String(l.id) === String(langId));
  }

  // Helper: get CodeMirror mode from Judge0 language name
  function getCodeMirrorModeFromJudge0Name(judge0Name: string): string {
    if (!judge0Name) return 'javascript';
    const base = judge0Name.split(/\s|\(/)[0].toLowerCase();
    const map: Record<string, string> = {
      'javascript': 'javascript',
      'typescript': 'typescript',
    'python': 'python',
    'java': 'java',
    'c++': 'cpp',
    'cpp': 'cpp',
    'c': 'c',
    'c#': 'csharp',
    'csharp': 'csharp',
    'go': 'go',
    'rust': 'rust',
    'ruby': 'ruby',
    'php': 'php',
    'swift': 'swift',
    'kotlin': 'kotlin',
      'dart': 'dart',
      // add more as needed
    };
    return map[base] || 'javascript';
  }

  // Save code before page unload - optimized to avoid duplicates
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (initialLoadCompleteRef.current && problemId && language && code) {
        // Use synchronous localStorage save for beforeunload
        try {
          localStorage.setItem(`nexacademy_code_${problemId}_${language}`, code);
        } catch (e) {}
        
        // For backend, we'll use sendBeacon for more reliable background saves
        if (session?.user?.id && !inFlightRequestsRef.current.saveCode) {
          try {
            const fullLanguageName = getFullLanguageName(language);
            const blob = new Blob(
              [JSON.stringify({ code, language: fullLanguageName })], 
              { type: 'application/json' }
            );
            navigator.sendBeacon(`/api/problem/${problemId}/save-code`, blob);
          } catch (e) {}
        }
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [code, problemId, language, session?.user?.id]);

  // Listen for fullscreen change events
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  // Add a special effect specifically to handle code editor stuck in loading state
  useEffect(() => {
    // If after 5 seconds the code editor is still loading, force it to stop loading
    const timeoutId = setTimeout(() => {
      if (isCodeLoading) {
        console.log('[DEBUG] Forcing code editor out of loading state after timeout');
        setIsCodeLoading(false);
      }
    }, 5000);
    
    return () => clearTimeout(timeoutId);
  }, [isCodeLoading]);

  // Effect to initialize language from judge0Languages if available from initialData
  useEffect(() => {
    if (initialData?.judge0Languages && initialData.judge0Languages.length > 0 && 
        initialData.problem?.languageOptions && initialData.problem.languageOptions.length > 0) {
      console.log('[SSR] Initializing language from server-provided judge0Languages');
      
      // Get the first available language from the problem's languageOptions
      const firstLang = initialData.problem.languageOptions[0];
      if (firstLang?.languageId) {
        // Set the language state using the languageId
        setLanguage(String(firstLang.languageId));
        console.log(`[SSR] Set initial language to ${firstLang.languageId}`);
      }
    }
  }, [initialData]);

  // Effect to initialize language and available languages from server data
  useEffect(() => {
    if (initialData?.problem?.languageOptions && initialData.problem.languageOptions.length > 0) {
      console.log('[SSR] Setting available languages from server data');
      // Set available languages from initialData
      setAvailableLanguages(initialData.problem.languageOptions);
      
      // Initialize language if needed
      if (!language && initialData.problem.languageOptions[0]?.languageId) {
        console.log('[SSR] Setting initial language from first available option');
        const firstLang = initialData.problem.languageOptions[0];
        setLanguage(String(firstLang.languageId));
      }
      
      // Set language loading to false since we have the data
      setIsLanguageLoading(false);
    }
  }, [initialData, language]);

  // Update the direct loading effect
  useEffect(() => {
    // Only attempt to load languages if they're not already loaded
    if (!judge0Languages?.length && !isLanguageLoading) {
      console.log("[DEBUG] Directly loading judge0Languages via fetchJudge0Languages");
      setIsLanguageLoading(true);
      
      // Use the server-side function directly
      fetchJudge0Languages()
        .then(languages => {
          // Set the languages directly
          const judge0LanguagesData = languages || [];
          console.log(`[DEBUG] Loaded ${judge0LanguagesData.length} languages directly`);
          
          // Update the state with the fetched languages
          setDirectlyLoadedLanguages(judge0LanguagesData);
        })
        .catch(error => {
          console.error("[ERROR] Failed to load judge0Languages directly:", error);
        })
        .finally(() => {
          setIsLanguageLoading(false);
        });
    }
  }, [judge0Languages, isLanguageLoading]);

  // Add this at the top of the component
  const hasSetInitialLanguage = useRef(false);

  // Remove the two effects that set language from initialData repeatedly
  // Replace with a single effect that only sets the initial language once
  useEffect(() => {
    if (
      !hasSetInitialLanguage.current &&
      initialData?.problem?.languageOptions &&
      initialData.problem.languageOptions.length > 0
    ) {
      // Try to load last language from localStorage
      const lastLang = localStorage.getItem(`nexacademy_last_language_${problemId}`);
      console.log(`[LANG-DEBUG] Checking localStorage for language, found: ${lastLang || 'none'}`);
      
      const validLang = initialData.problem.languageOptions.find(
        (l: LanguageOption) => String(l.languageId) === lastLang || l.name === lastLang
      );
      
      if (lastLang && validLang) {
        console.log(`[LANG-DEBUG] Setting language from localStorage: ${validLang.languageId}`);
        setLanguage(String(validLang.languageId));
      } else {
        console.log(`[LANG-DEBUG] Using default language: ${initialData.problem.languageOptions[0].languageId}`);
        setLanguage(String(initialData.problem.languageOptions[0].languageId));
      }
      hasSetInitialLanguage.current = true;
    }
  }, [initialData, problemId]);

  // Add event listener for saved language loaded events
  const savedLanguageRef = useRef<string | null>(null);
  
  useEffect(() => {
    const handleSavedLanguage = (event: Event) => {
      const customEvent = event as CustomEvent;
      console.log('[LANG-EVENT-DEBUG] Received savedLanguageLoaded event:', customEvent.detail);
      
      if (customEvent.detail && customEvent.detail.problemId === problemId) {
        const savedLang = customEvent.detail.language;
        console.log('[LANG-EVENT-DEBUG] Event is for current problem, language=', savedLang);
        
        // If we have language options available
        if (availableLanguages && availableLanguages.length > 0) {
          const foundLang = availableLanguages.find(
            (l: LanguageOption) => String(l.languageId) === savedLang || l.name === savedLang
          );
          
          if (foundLang) {
            console.log('[LANG-EVENT-DEBUG] Setting language from event:', foundLang.languageId);
            setLanguage(String(foundLang.languageId));
            hasSetInitialLanguage.current = true;
          } else {
            console.log('[LANG-EVENT-DEBUG] Language not found in available options:', savedLang);
          }
        } else {
          // Save for when languages load
          console.log('[LANG-EVENT-DEBUG] Saving language for later:', savedLang);
          savedLanguageRef.current = savedLang;
        }
      } else {
        console.log('[LANG-EVENT-DEBUG] Event not for current problem or missing details');
      }
    };
    
    window.addEventListener('nexacademy:savedLanguageLoaded', handleSavedLanguage);
    
    return () => {
      window.removeEventListener('nexacademy:savedLanguageLoaded', handleSavedLanguage);
    };
  }, [problemId, availableLanguages]);

  // Check saved language when available languages load
  useEffect(() => {
    if (
      savedLanguageRef.current && 
      availableLanguages && 
      availableLanguages.length > 0 &&
      !hasSetInitialLanguage.current
    ) {
      const savedLang = savedLanguageRef.current;
      const foundLang = availableLanguages.find(
        (l: LanguageOption) => String(l.languageId) === savedLang || l.name === savedLang
      );
      
      if (foundLang) {
        console.log('[DEBUG] Setting saved language after languages loaded:', foundLang.languageId);
        setLanguage(String(foundLang.languageId));
        hasSetInitialLanguage.current = true;
        savedLanguageRef.current = null;
      }
    }
  }, [availableLanguages]);

  // After language state initialization
  useEffect(() => {
    if (!problemId || !session?.user?.id || !initialData?.problem?.languageOptions) return;

    console.log(`[LANG-DEBUG] Fetching last-language for problemId=${problemId}`);
    
    fetch(`/api/problem/${problemId}/last-language`)
      .then(res => res.json())
      .then(data => {
        console.log(`[LANG-DEBUG] API response:`, data);
        
        if (data.lastLanguage) {
          console.log(`[LANG-DEBUG] Found last language from API: ${data.lastLanguage}`);
          
          // Try to find the languageId for this language name or id
          const found = initialData.problem.languageOptions.find(
            (l: LanguageOption) => l.name === data.lastLanguage || String(l.languageId) === String(data.lastLanguage)
          );
          
          if (found) {
            console.log(`[LANG-DEBUG] Setting language to ${found.languageId} (found in available options)`);
            setLanguage(String(found.languageId));
            hasSetInitialLanguage.current = true; // Mark as initialized
          } else {
            console.log(`[LANG-DEBUG] Language ${data.lastLanguage} not found in available options`);
          }
        } else {
          console.log(`[LANG-DEBUG] No lastLanguage in API response`);
        }
      })
      .catch((error) => {
        console.error(`[LANG-DEBUG] Error fetching last language:`, error);
        // Ignore errors, fallback to default
      });
  }, [problemId, session?.user?.id, initialData?.problem?.languageOptions]);

  // Add this after the last-language fetch effect to ensure code is loaded after language changes
  useEffect(() => {
    // Only run if language has been set and language/problem values are valid
    if (!language || !problemId) return;
    
    console.log(`[CODE-DEBUG] Language changed to ${language}, triggering code load`);
    
    // Make sure we don't conflict with other code loading flows
    // Small timeout to ensure UI updates first
    const timeoutId = setTimeout(() => {
      console.log(`[CODE-DEBUG] Loading saved code for language=${language}`);
      
      // Try localStorage first for immediate feedback
      const localCode = localStorage.getItem(`nexacademy_code_${problemId}_${language}`);
      if (localCode) {
        console.log(`[CODE-DEBUG] Found code in localStorage, length=${localCode.length}`);
      } else {
        console.log(`[CODE-DEBUG] No code found in localStorage for language=${language}`);
      }
      
      // Call the main code loading function
      loadSavedCode()
        .then(result => {
          console.log(`[CODE-DEBUG] loadSavedCode result: ${result ? 'Successful' : 'Failed/Not found'}`);
        })
        .catch(error => {
          console.error(`[CODE-DEBUG] Error in loadSavedCode:`, error);
        });
    }, 200);  // Small delay to ensure language state is fully updated
    
    return () => clearTimeout(timeoutId);
  }, [language, problemId, loadSavedCode]);

  // Remove the individual language loading effects and replace with a comprehensive solution
  // that loads both language and code in one go, prioritizing user settings
  useEffect(() => {
    // Only run if user is logged in, we have a problem ID, and language options are available
    if (!session?.user?.id || !problemId || !initialData?.problem?.languageOptions?.length) return;
    
    // Prevent duplicate runs
    if (hasSetInitialLanguage.current) return;
    
    console.log(`[INIT] Loading user settings for problem ${problemId}`);
    
    // Set loading state
    setIsCodeLoading(true);
    
    // Fetch the user settings from the backend - combined endpoint to get both language and code in one call
    fetch(`/api/problem/${problemId}/user-settings`)
      .then(res => res.json())
      .then(data => {
        console.log(`[INIT] User settings loaded:`, data);
        
        if (data.success && data.settings) {
          // If the user has settings for this problem
          const userSettings = data.settings;
          const savedLanguage = userSettings.lastLanguage;
          
          if (savedLanguage) {
            console.log(`[INIT] Found saved language: ${savedLanguage}`);
            
            // Find the matching language option
            const foundLang = initialData?.problem?.languageOptions?.find(
              (l: LanguageOption) => l.name === savedLanguage || String(l.languageId) === savedLanguage
            );
            
            if (foundLang) {
              console.log(`[INIT] Setting language to ${foundLang.languageId}`);
              
              // Set the language
              setLanguage(String(foundLang.languageId));
              hasSetInitialLanguage.current = true;
              
              // If there's saved code for this language, use it
              if (userSettings.savedCode && userSettings.savedCode[savedLanguage]) {
                console.log(`[INIT] Setting saved code for language ${savedLanguage}`);
                setCode(userSettings.savedCode[savedLanguage]);
                setIsCodeLoading(false);
                return;
              }
              
              // If no saved code, check localStorage as a backup
              const localCode = localStorage.getItem(`nexacademy_code_${problemId}_${foundLang.languageId}`);
              if (localCode) {
                console.log(`[INIT] Using code from localStorage`);
                setCode(localCode);
                setIsCodeLoading(false);
                return;
              }
              
              // If still no code, use starter code for this language
              if (foundLang.preloadCode) {
                console.log(`[INIT] Using starter code for language ${foundLang.languageId}`);
                setCode(foundLang.preloadCode);
              } else {
                console.log(`[INIT] No starter code, setting empty code`);
                setCode('');
              }
            } else {
              // Language not found, use default
              fallbackToDefaultLanguage();
            }
          } else {
            // No saved language, use default
            fallbackToDefaultLanguage();
          }
        } else {
          // No settings found, use default
          fallbackToDefaultLanguage();
        }
        
        setIsCodeLoading(false);
      })
      .catch(error => {
        console.error(`[INIT] Error loading user settings:`, error);
        fallbackToDefaultLanguage();
        setIsCodeLoading(false);
      });
    
    // Helper function for default language fallback
    function fallbackToDefaultLanguage() {
      console.log(`[INIT] Using default language`);
      
      if (initialData?.problem?.languageOptions?.length) {
        const defaultLang = initialData.problem.languageOptions[0];
        console.log(`[INIT] Setting default language: ${defaultLang.languageId}`);
        
        setLanguage(String(defaultLang.languageId));
        
        // Try to get starter code for default language
        if (defaultLang.preloadCode) {
          console.log(`[INIT] Using starter code for default language`);
          setCode(defaultLang.preloadCode);
        } else {
          console.log(`[INIT] No starter code for default language`);
          setCode('');
        }
      } else {
        console.log(`[INIT] No language options available, setting empty state`);
        setLanguage("");
        setCode("");
      }
      
      hasSetInitialLanguage.current = true;
    }
    
  }, [problemId, session?.user?.id, initialData?.problem?.languageOptions, setLanguage, setCode, setIsCodeLoading]);

  // Update the code loading logic in the initialization area
  useEffect(() => {
    // Skip if problem is not loaded or initialData changing
    if (!initialData?.problem) return;
    
    // If initialData has a lastLanguage and we have a problem ID
    if (initialData.lastLanguage && problemId) {
      console.log(`[INIT] Loading code for lastLanguage: ${initialData.lastLanguage}`);
      
      // First check if we have language options matching this language
      const foundLang = initialData.problem.languageOptions?.find(
        (l: LanguageOption) => l.name === initialData.lastLanguage || 
        String(l.languageId) === initialData.lastLanguage
      );
      
      if (foundLang) {
        // If found, try to load code from localStorage
        const savedCode = localStorage.getItem(`nexacademy_code_${problemId}_${foundLang.languageId}`);
        
        if (savedCode) {
          console.log(`[INIT] Found saved code in localStorage for language ${foundLang.languageId}`);
          setCode(savedCode);
        } else if (foundLang.preloadCode) {
          // If no saved code, use preload code if available
          console.log(`[INIT] Using preload code for language ${foundLang.languageId}`);
          setCode(foundLang.preloadCode);
        }
      }
    }
    
    setIsCodeLoading(false);
  }, [initialData, problemId]);

  // Comprehensive initial load effect that gets user settings, language and code
  useEffect(() => {
    // Skip if we've already loaded or if we're missing essential data
    if (initialLoadCompleteRef.current || !problemId || !initialData?.problem?.languageOptions?.length) {
      return;
    }
    
    // Set loading state
    setIsCodeLoading(true);
    
    // Create a function to handle user settings loading
    const loadUserSettings = async () => {
      try {
        console.log(`[INIT] Loading initial settings for problem ${problemId}`);
        
        // If we have server-provided lastLanguage, prioritize it
        if (initialData.lastLanguage) {
          console.log(`[INIT] Using server-provided lastLanguage: ${initialData.lastLanguage}`);
          
          // Find matching language option
          const matchingOption = initialData.problem.languageOptions.find(
            (l: LanguageOption) => 
              l.name === initialData.lastLanguage || 
              String(l.languageId) === initialData.lastLanguage
          );
          
          if (matchingOption) {
            console.log(`[INIT] Setting language to ${matchingOption.languageId} (from server data)`);
            setLanguage(String(matchingOption.languageId));
            
            // Try to load code from localStorage for this language
            const localCode = localStorage.getItem(`nexacademy_code_${problemId}_${matchingOption.languageId}`);
            if (localCode) {
              console.log(`[INIT] Using code from localStorage for ${matchingOption.languageId}`);
              setCode(localCode);
            } else if (matchingOption.preloadCode) {
              console.log(`[INIT] Using preload code for ${matchingOption.languageId}`);
              setCode(matchingOption.preloadCode);
            }
            
            initialLoadCompleteRef.current = true;
            setIsCodeLoading(false);
            return;
          }
        }
        
        // If user is logged in, try to get their settings
        if (session?.user?.id) {
          const response = await fetch(`/api/problem/${problemId}/user-settings`);
          const data = await response.json();
          
          if (data.success && data.settings) {
            console.log(`[INIT] User settings loaded:`, data.settings);
            
            // If we have a last language
            if (data.settings.lastLanguage) {
              console.log(`[INIT] Found lastLanguage in settings: ${data.settings.lastLanguage}`);
              
              // Find the matching language option
              const matchingOption = initialData.problem.languageOptions.find(
                (l: LanguageOption) => 
                  l.name === data.settings.lastLanguage || 
                  String(l.languageId) === data.settings.lastLanguage
              );
              
              if (matchingOption) {
                console.log(`[INIT] Setting language to ${matchingOption.languageId} (from API data)`);
                setLanguage(String(matchingOption.languageId));
                
                // If we have saved code for this language, use it
                if (data.settings.savedCode && data.settings.savedCode[data.settings.lastLanguage]) {
                  console.log(`[INIT] Using saved code from API for ${data.settings.lastLanguage}`);
                  setCode(data.settings.savedCode[data.settings.lastLanguage]);
                } else {
                  // Try localStorage as a fallback
                  const localCode = localStorage.getItem(`nexacademy_code_${problemId}_${matchingOption.languageId}`);
                  if (localCode) {
                    console.log(`[INIT] Using code from localStorage for ${matchingOption.languageId}`);
                    setCode(localCode);
                  } else if (matchingOption.preloadCode) {
                    console.log(`[INIT] Using preload code for ${matchingOption.languageId}`);
                    setCode(matchingOption.preloadCode);
                  }
                }
                
                initialLoadCompleteRef.current = true;
                setIsCodeLoading(false);
                return;
              }
            }
          }
        }
        
        // Fallback: If we couldn't load user settings or no matching language was found
        console.log(`[INIT] Using first available language as fallback`);
        const firstLang = initialData.problem.languageOptions[0];
        if (firstLang) {
          setLanguage(String(firstLang.languageId));
          
          // Try localStorage as a fallback
          const localCode = localStorage.getItem(`nexacademy_code_${problemId}_${firstLang.languageId}`);
          if (localCode) {
            console.log(`[INIT] Using code from localStorage for ${firstLang.languageId}`);
            setCode(localCode);
          } else if (firstLang.preloadCode) {
            console.log(`[INIT] Using preload code for ${firstLang.languageId}`);
            setCode(firstLang.preloadCode);
          }
        }
        
      } catch (error) {
        console.error('[INIT] Error loading user settings:', error);
        // Fallback to first language option in case of error
        const firstLang = initialData.problem.languageOptions[0];
        if (firstLang) {
          setLanguage(String(firstLang.languageId));
          if (firstLang.preloadCode) {
            setCode(firstLang.preloadCode);
          }
        }
      } finally {
        initialLoadCompleteRef.current = true;
        setIsCodeLoading(false);
      }
    };
    
    loadUserSettings();
  }, [problemId, initialData, session?.user?.id, setLanguage, setCode, setIsCodeLoading]);

  // Effect to fetch last language - only if not already provided in initialData
  useEffect(() => {
    // Skip if any of these are true:
    // 1. No problem ID
    // 2. No user session
    // 3. No language options in initialData
    // 4. We've already initialized the language
    // 5. We already have lastLanguage in initialData
    if (!problemId || 
        !session?.user?.id || 
        !initialData?.problem?.languageOptions || 
        hasSetInitialLanguage.current ||
        initialData.lastLanguage) {
      return;
    }
    
    fetch(`/api/problem/${problemId}/last-language`)
      .then(res => res.json())
      .then(data => {
        console.log(`[LANG-DEBUG] API response:`, data);
        
        if (data.lastLanguage) {
          console.log(`[LANG-DEBUG] Found last language from API: ${data.lastLanguage}`);
          
          // Try to find the languageId for this language name or id
          const found = initialData.problem.languageOptions.find(
            (l: LanguageOption) => l.name === data.lastLanguage || String(l.languageId) === String(data.lastLanguage)
          );
          
          if (found) {
            console.log(`[LANG-DEBUG] Setting language to ${found.languageId} (found in available options)`);
            setLanguage(String(found.languageId));
            hasSetInitialLanguage.current = true; // Mark as initialized
            
            // If we also got saved code, set it
            if (data.savedCode) {
              console.log(`[LANG-DEBUG] Setting saved code from API`);
              setCode(data.savedCode);
            }
          } else {
            console.log(`[LANG-DEBUG] Language ${data.lastLanguage} not found in available options`);
          }
        } else {
          console.log(`[LANG-DEBUG] No lastLanguage in API response`);
        }
      })
      .catch((error) => {
        console.error(`[LANG-DEBUG] Error fetching last language:`, error);
        // Ignore errors, fallback to default
      });
  }, [problemId, session?.user?.id, initialData?.problem?.languageOptions, initialData?.lastLanguage]);

  return (
    <div className="main-container">
      {/* Add Expandable Problem Sidebar with higher z-index */}
      <div className="fixed top-0 left-0 z-[100]">
      <ExpandableProblemSidebar />
      </div>
      
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
      <header className="problem-header relative flex items-center justify-between">
        {/* Left Section */}
        <div className="problem-header-section z-10 flex-1">
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
          
          <div className="problem-header-actions hidden sm:flex">
            <button className="problem-nav-btn" title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"} onClick={toggleFullscreen}>
              {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Center Section with Run and Submit buttons */}
        <div className="hidden md:flex justify-center items-center gap-2 z-20 flex-1 max-w-[300px] mx-auto fullscreen-center">
          <Button 
            onClick={runCode} 
            disabled={isRunning || isSubmitting}
            className={`problem-btn-primary flex items-center justify-center h-10 px-4 ${isRunning ? 'opacity-70' : ''}`}
          >
            {isRunning ? (
              <>
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                <span>Running</span>
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-1" />
                <span>Run</span>
              </>
            )}
          </Button>
          
          <Button 
            onClick={submitCode}
            disabled={isSubmitting || isRunning} 
            className={`problem-btn-success flex items-center justify-center h-10 px-4 ${isSubmitting ? 'opacity-70' : ''}`}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                <span>Submitting</span>
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-1" />
                <span>Submit</span>
              </>
            )}
          </Button>
        </div>

        {/* Right Section */}
        <div className="problem-header-section z-10 flex-1 justify-end">
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
          
          <div className="problem-header-divider hidden lg:block"></div>
          
          <div className="problem-user-section flex-shrink-0">
            <div className="hidden md:block">
            <ModeToggle />
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full p-0">
                  <Avatar className="h-8 w-8">
                    {profilePic ? (
                      <AvatarImage src={profilePic} alt={session?.user?.name ?? "User"} />
                    ) : (
                      <AvatarImage src="/images/avatar.jpeg" alt={session?.user?.name ?? "User"} />
                    )}
                    <AvatarFallback>{session?.user?.name ? session.user.name[0] : "U"}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" onClick={e => e.stopPropagation()}>
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => {
                  if (session?.user?.username) {
                    window.location.href = `/profile/${session.user.username}`
                  } else {
                    window.location.href = "/profile"
                  }
                }}>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => window.location.href = "/settings"}>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => signOut()}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <button
              className="problem-premium-badge ml-2 hidden sm:flex"
              onClick={togglePremiumStatus}
            >
              <Crown className="h-4 w-4" />
              <span className="font-medium">Premium</span>
            </button>
            
            <Button
              variant="ghost"
              size="sm"
              className="hidden lg:flex items-center gap-1 ml-2 text-primary hover:text-primary/80"
              onClick={() => window.location.href = "/nexpractice"}
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="font-medium">Back to NexPractice</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Mobile Run/Submit Buttons - show only on small screens */}
      <div className="flex md:hidden items-center justify-between gap-2 z-10 w-full py-2 px-2 border-t border-b border-border bg-background">
        <div className="flex items-center gap-2">
          <Button 
            variant="outline"
            size="icon"
            className="h-9 w-9 flex-none"
            onClick={toggleFullscreen}
            title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
          >
            {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
          </Button>
          
          <ModeToggle />
        </div>
        
        <div className="flex gap-2 flex-1 justify-end">
          <Button 
            onClick={runCode} 
            disabled={isRunning || isSubmitting}
            className={`problem-btn-primary flex items-center justify-center h-9 px-3 ${isRunning ? 'opacity-70' : ''}`}
            size="sm"
          >
            {isRunning ? (
              <>
                <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />
                <span className="text-sm">Running</span>
              </>
            ) : (
              <>
                <Play className="h-3.5 w-3.5 mr-1" />
                <span className="text-sm">Run</span>
              </>
            )}
          </Button>
          
          <Button 
            onClick={submitCode}
            disabled={isSubmitting || isRunning} 
            className={`problem-btn-success flex items-center justify-center h-9 px-3 ${isSubmitting ? 'opacity-70' : ''}`}
            size="sm"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />
                <span className="text-sm">Submitting</span>
              </>
            ) : (
              <>
                <Send className="h-3.5 w-3.5 mr-1" />
                <span className="text-sm">Submit</span>
              </>
            )}
          </Button>
        </div>
      </div>

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
          {/* Add PanelsFullscreen component */}
          <PanelsFullscreen className="absolute top-3 right-3 z-50" />
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full h-full flex flex-col modern-tabs">
            <div className="border-border border-b flex-shrink-0 bg-background h-10 flex items-center" style={{minHeight: 40, height: 40, maxHeight: 40}}>
              <div className="px-4 pt-3 pb-0 flex items-center h-full" style={{height: '100%'}}>
                <TabsList className="flex w-full justify-start space-x-1 bg-transparent h-full p-0 items-center" style={{height: '100%'}}>
                  <TabsTrigger 
                    value="description" 
                    className="tab-trigger flex items-center gap-1.5 px-3 py-1.5 h-full data-[state=active]:bg-transparent data-[state=active]:shadow-none rounded-none transition-all"
                  >
                    <BookOpen className="h-4 w-4" />
                    <span className="text-sm font-medium">Description</span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="solution" 
                    className="tab-trigger flex items-center gap-1.5 px-3 py-1.5 h-full data-[state=active]:bg-transparent data-[state=active]:shadow-none rounded-none transition-all"
                  >
                    <Lightbulb className="h-4 w-4" />
                    <span className="text-sm font-medium">Solution</span>
                    {!isPremiumUser && <Lock className="h-3 w-3 ml-1 text-orange-500" />}
                  </TabsTrigger>
                  <TabsTrigger 
                    value="discussion" 
                    className="tab-trigger flex items-center gap-1.5 px-3 py-1.5 h-full data-[state=active]:bg-transparent data-[state=active]:shadow-none rounded-none transition-all"
                  >
                    <MessageSquare className="h-4 w-4" />
                    <span className="text-sm font-medium">Discussion</span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="submissions" 
                    className="tab-trigger flex items-center gap-1.5 px-3 py-1.5 h-full data-[state=active]:bg-transparent data-[state=active]:shadow-none rounded-none transition-all"
                  >
                    <BarChart2 className="h-4 w-4" />
                    <span className="text-sm font-medium">Submissions</span>
                  </TabsTrigger>
                  
                  {/* Dynamic Accepted Tab or Submission Details Tab */}
                  {showSubmissionTab && selectedSubmission && (
                    <TabsTrigger 
                      value="submissionDetails" 
                      className="tab-trigger flex items-center gap-1.5 px-3 py-1.5 h-full data-[state=active]:bg-transparent data-[state=active]:shadow-none rounded-none transition-all text-blue-600 border-l pl-3 ml-1"
                    >
                      <BarChart2 className="h-4 w-4" />
                      <span className="text-sm font-medium">Submission Details</span>
                      <div 
                        className="ml-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 h-4 w-4 flex items-center justify-center cursor-pointer"
                        onClick={async (e) => {
                          e.stopPropagation();
                          setShowSubmissionTab(false);
                          setSelectedSubmission(null);
                          if (activeTab === "submissionDetails") setActiveTab("description");
                        }}
                      >
                        <span className="text-xs">✕</span>
                      </div>
                    </TabsTrigger>
                  )}
                  {!showSubmissionTab && showAcceptedTab && (
                    <TabsTrigger 
                      value="accepted" 
                      className="tab-trigger flex items-center gap-1.5 px-3 py-1.5 h-full data-[state=active]:bg-transparent data-[state=active]:shadow-none rounded-none transition-all text-green-600 border-l pl-3 ml-1"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      <span className="text-sm font-medium">Accepted</span>
                      <div 
                        className="ml-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 h-4 w-4 flex items-center justify-center cursor-pointer"
                        onClick={async (e) => {
                          e.stopPropagation();
                          try { await fetch(`/api/problem/${problemId}/accepted-submission`, { method: 'POST' }); } catch {}
                          setShowAcceptedTab(false);
                          if (activeTab === "accepted") setActiveTab("description");
                        }}
                      >
                        <span className="text-xs">✕</span>
                      </div>
                    </TabsTrigger>
                  )}
                </TabsList>
              </div>
            </div>
            {/* Regular Tabs Content */}
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
            
            {/* New Accepted Solution Tab Content */}
           
            
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
                          Total Runtime
                        </th>
                        <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Total Memory
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
                      {submissionsLoading ? (
                        <tr><td colSpan={5} className="text-center py-8 text-muted-foreground">
                          <div className="flex flex-col items-center gap-2">
                            <div className="h-8 w-8 rounded-full border-2 border-t-primary border-r-transparent border-b-transparent border-l-transparent animate-spin"></div>
                            <span>Loading submissions...</span>
                          </div>
                        </td></tr>
                      ) : submissions.length === 0 ? (
                        <tr><td colSpan={5} className="text-center py-4 text-muted-foreground">No submissions yet.</td></tr>
                      ) : (
                        submissions.map((sub, idx) => (
                          <tr key={sub.id || idx} className="hover:bg-muted/30 transition-colors cursor-pointer" onClick={() => {
                            // If the submission doesn't have code, fetch the full details
                            setSubmissionLoading(true);
                            setSelectedSubmission(sub); // Set initial data immediately for better UX
                            setShowSubmissionTab(true);
                            setActiveTab('submissionDetails');
                            
                            // Always fetch the full submission details to ensure we have everything
                            fetch(`/api/problem/${problemId}/submission/${sub.id}`)
                              .then(res => res.json())
                              .then(data => {
                                if (data.submission) {
                                  setSelectedSubmission(data.submission);
                                }
                              })
                              .catch(err => console.error("Error fetching submission details:", err))
                              .finally(() => setSubmissionLoading(false));
                          }}>
                        <td className="px-3 py-2 whitespace-nowrap">
                          <div className="flex items-center">
                                <span className={`status-badge ${sub.allPassed ? 'status-accepted' : 'status-wrong'}`}>
                                  {sub.allPassed ? 'Accepted' : 'Wrong Answer'}
                            </span>
                          </div>
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-sm">
                              <span title="Sum of all testcase runtimes">{sub.runtime || 'N/A'}</span>
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-sm">
                              <span title="Sum of all testcase memory usage">{sub.memory || 'N/A'}</span>
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-sm">
                              {sub.language}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-sm text-muted-foreground">
                              {sub.submittedAt ? formatDistanceToNow(new Date(sub.submittedAt), { addSuffix: true }) : 'N/A'}
                        </td>
                      </tr>
                        ))
                      )}
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
            
            {/* Always render the TabsContent components, conditionally render their content */}
            <TabsContent value="submissionDetails" className="p-4 left-panel-content panel-scrollable pb-8">
              {submissionLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="flex flex-col items-center gap-2">
                    <div className="h-8 w-8 rounded-full border-2 border-t-primary border-r-transparent border-b-transparent border-l-transparent animate-spin"></div>
                    <p className="text-sm text-muted-foreground">Loading submission details...</p>
                  </div>
                </div>
              ) : selectedSubmission ? (
                <div className="space-y-4">
                  {/* Status banner */}
                  <div className={`flex items-center gap-2 ${selectedSubmission.allPassed ? 'text-green-600 bg-green-50 border-green-100' : 'text-red-600 bg-red-50 border-red-100'} p-3 rounded-md border w-full`}>
                    {selectedSubmission.allPassed ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                    <div className="flex-1">
                      <span className="font-medium">{selectedSubmission.allPassed ? 'Accepted' : 'Wrong Answer'}</span>
                      <span className="text-xs ml-2">
                        {typeof selectedSubmission.testcasesPassed === 'number' 
                          ? selectedSubmission.testcasesPassed 
                          : (parseInt(selectedSubmission.testcasesPassed) || 0)} / 
                        {typeof selectedSubmission.totalTestcases === 'number'
                          ? selectedSubmission.totalTestcases
                          : (parseInt(selectedSubmission.totalTestcases) || 0)} testcases passed
                      </span>
                    </div>
                    <span className="text-xs text-gray-500">{selectedSubmission.submittedAt ? formatDistanceToNow(new Date(selectedSubmission.submittedAt), { addSuffix: true }) : ''}</span>
                  </div>
                  {/* Stats panels */}
                  <div className="grid grid-cols-2 gap-4">
                    {/* Runtime panel */}
                    <div className="border rounded-md overflow-hidden shadow-sm bg-white">
                      <div className="px-3 py-2 flex items-center gap-2 border-b">
                        <Clock className="w-4 h-4 text-gray-500" />
                        <span className="text-sm font-medium">Total Runtime</span>
                        <div className="flex-1"></div>
                        <div className="w-4 h-4 text-gray-500 rounded-full border border-gray-300 flex items-center justify-center text-xs">?</div>
                      </div>
                      <div className="p-4">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-baseline">
                            <span className="text-2xl font-bold">{selectedSubmission.runtime?.replace(' ms','') || '0'}</span>
                            <span className="text-sm text-gray-500 ml-1">ms</span>
                          </div>
                          <div className="flex items-center">
                            <span className="text-sm text-gray-500 mr-2">Beats</span>
                            <span className="text-lg font-semibold text-green-600">{selectedSubmission.runtimePercentile || '100.00%'}</span>
                            <span className="ml-1">🚀</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    {/* Memory panel */}
                    <div className="border rounded-md overflow-hidden shadow-sm bg-white">
                      <div className="px-3 py-2 flex items-center gap-2 border-b">
                        <Database className="w-4 h-4 text-gray-500" />
                        <span className="text-sm font-medium">Total Memory</span>
                        <div className="flex-1"></div>
                        <div className="w-4 h-4 text-gray-500 rounded-full border border-gray-300 flex items-center justify-center text-xs">?</div>
                      </div>
                      <div className="p-4">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-baseline">
                            <span className="text-2xl font-bold">{selectedSubmission.memory?.replace(' MB','') || '0'}</span>
                            <span className="text-sm text-gray-500 ml-1">MB</span>
                          </div>
                          <div className="flex items-center">
                            <span className="text-sm text-gray-500 mr-2">Beats</span>
                            <span className="text-lg font-semibold text-green-600">{selectedSubmission.memoryPercentile || '63.06%'}</span>
                            <span className="ml-1">🚀</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Testcases summary */}
                  <div className="border rounded-md overflow-hidden shadow-sm bg-white">
                    <div className="px-3 py-2 flex items-center gap-2 border-b">
                      <CheckSquare className="w-4 h-4 text-gray-500" />
                      <span className="text-sm font-medium">Testcases</span>
                    </div>
                    <div className="p-4">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Passed:</span>
                          <span className="font-medium text-green-600">
                            {typeof selectedSubmission.testcasesPassed === 'number' 
                              ? selectedSubmission.testcasesPassed 
                              : (parseInt(selectedSubmission.testcasesPassed) || 0)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Failed:</span>
                          <span className="font-medium text-red-600">
                            {Math.max(0, 
                              (typeof selectedSubmission.totalTestcases === 'number' 
                                ? selectedSubmission.totalTestcases 
                                : (parseInt(selectedSubmission.totalTestcases) || 0)) - 
                              (typeof selectedSubmission.testcasesPassed === 'number'
                                ? selectedSubmission.testcasesPassed
                                : (parseInt(selectedSubmission.testcasesPassed) || 0))
                            )}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Total:</span>
                          <span className="font-medium">
                            {typeof selectedSubmission.totalTestcases === 'number'
                              ? selectedSubmission.totalTestcases
                              : (parseInt(selectedSubmission.totalTestcases) || 0)}
                          </span>
                        </div>
                        
                        {/* Progress bar */}
                        <div className="h-2 w-full bg-gray-100 rounded-full mt-2 overflow-hidden">
                          {(() => {
                            const passed = typeof selectedSubmission.testcasesPassed === 'number'
                              ? selectedSubmission.testcasesPassed
                              : (parseInt(selectedSubmission.testcasesPassed) || 0);
                            
                            const total = typeof selectedSubmission.totalTestcases === 'number'
                              ? selectedSubmission.totalTestcases
                              : (parseInt(selectedSubmission.totalTestcases) || 0);
                            
                            const percentage = total > 0 ? (passed / total) * 100 : 0;
                            
                            return (
                              <div 
                                className="h-full bg-green-500 rounded-full" 
                                style={{ width: `${percentage}%` }}
                              ></div>
                            );
                          })()}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Code section */}
                  <div className="border rounded-md overflow-hidden shadow-sm bg-white">
                    <div className="px-3 py-2 flex items-center gap-2 border-b">
                      <FileCode className="w-4 h-4 text-gray-500" />
                      <span className="text-sm font-medium">Submitted Code</span>
                      <div className="flex-1"></div>
                      <div className="text-xs px-2 py-0.5 rounded bg-gray-100 text-gray-600">{selectedSubmission.language || "Code"}</div>
                    </div>
                    <div className="p-0" style={{ minHeight: 120 }}>
                      <CodeEditor 
                        code={selectedSubmission.code || "// Code not available"}
                        setCode={() => {}} // no-op
                        language={selectedSubmission.language || "JavaScript"}
                        readOnly={true}
                      />
                    </div>
                  </div>
                  
                  {/* Submission meta */}
                  <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>Submitted: {selectedSubmission.submittedAt ? 
                        new Date(selectedSubmission.submittedAt).toLocaleString() : 'N/A'}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <FileText className="w-3 h-3" />
                      <span>ID: {selectedSubmission.id}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      <span>Your submission</span>
                    </div>
                  </div>
                </div>
              ) : null}
            </TabsContent>

            <TabsContent value="accepted" className="p-4 left-panel-content panel-scrollable pb-8">
              {activeTab === 'accepted' && !showSubmissionTab && showAcceptedTab ? (
                <div className="space-y-4">
                  {/* Success banner */}
                  <div className="flex items-center gap-2 text-green-600 bg-green-50 p-3 rounded-md border border-green-100 w-full">
                    <CheckCircle2 className="w-5 h-5" />
                    <div className="flex-1">
                      <span className="font-medium">Accepted</span>
                      <span className="text-xs text-green-700 ml-2">
                        {acceptedSubmission?.testsPassed} / {acceptedSubmission?.totalTests} testcases passed
                      </span>
                    </div>
                  </div>
                  {/* Stats panels */}
                  <div className="grid grid-cols-2 gap-4">
                    {/* Runtime panel */}
                    <div className="border rounded-md overflow-hidden shadow-sm bg-white">
                      <div className="px-3 py-2 flex items-center gap-2 border-b">
                        <Clock className="w-4 h-4 text-gray-500" />
                        <span className="text-sm font-medium">Runtime</span>
                        <div className="flex-1"></div>
                        <div className="w-4 h-4 text-gray-500 rounded-full border border-gray-300 flex items-center justify-center text-xs">?</div>
                      </div>
                      <div className="p-4">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-baseline">
                            <span className="text-2xl font-bold">0</span>
                            <span className="text-sm text-gray-500 ml-1">ms</span>
                          </div>
                          <div className="flex items-center">
                            <span className="text-sm text-gray-500 mr-2">Beats</span>
                            <span className="text-lg font-semibold text-green-600">100.00%</span>
                            <span className="ml-1">🚀</span>
                          </div>
                        </div>
                        {/* Performance chart */}
                        <div className="mt-4">
                          <div className="w-full h-40 relative">
                            {/* Y-axis labels */}
                            <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between text-xs text-gray-500">
                              <div>75%</div>
                              <div>50%</div>
                              <div>25%</div>
                              <div>0%</div>
                            </div>
                            {/* Graph area */}
                            <div className="ml-8 border-l border-t border-b border-gray-200 h-full relative">
                              {/* Performance marker */}
                              <div className="absolute left-0 h-1 w-1 rounded-full bg-blue-500 top-1/2 transform -translate-x-1/2" style={{ boxShadow: '0 0 0 4px rgba(59, 130, 246, 0.3)' }}></div>
                              {/* Blue bar */}
                              <div className="absolute left-0 bottom-0 w-1 bg-blue-500 h-1/2"></div>
                              {/* X-axis with time markers */}
                              <div className="absolute -bottom-6 left-0 right-0 flex justify-between text-xs text-gray-500">
                                <div>21ms</div>
                                <div>457ms</div>
                                <div>892ms</div>
                                <div>1327ms</div>
                                <div>1762ms</div>
                                <div>2198ms</div>
                                <div>2633ms</div>
                                <div>3068ms</div>
                              </div>
                            </div>
                          </div>
                          {/* Time markers */}
                          <div className="mt-8 flex justify-between text-xs text-gray-400">
                            <div>21ms</div>
                            <div>457ms</div>
                            <div>892ms</div>
                            <div>1327ms</div>
                            <div>1762ms</div>
                            <div>2198ms</div>
                            <div>2633ms</div>
                            <div>3068ms</div>
                          </div>
                        </div>
                      </div>
                    </div>
                    {/* Memory panel */}
                    <div className="border rounded-md overflow-hidden shadow-sm bg-white">
                      <div className="px-3 py-2 flex items-center gap-2 border-b">
                        <Database className="w-4 h-4 text-gray-500" />
                        <span className="text-sm font-medium">Memory</span>
                        <div className="flex-1"></div>
                        <div className="w-4 h-4 text-gray-500 rounded-full border border-gray-300 flex items-center justify-center text-xs">?</div>
                      </div>
                      <div className="p-4">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-baseline">
                            <span className="text-2xl font-bold">18.79</span>
                            <span className="text-sm text-gray-500 ml-1">MB</span>
                          </div>
                          <div className="flex items-center">
                            <span className="text-sm text-gray-500 mr-2">Beats</span>
                            <span className="text-lg font-semibold text-green-600">63.06%</span>
                            <span className="ml-1">🚀</span>
                          </div>
                        </div>
                        {/* Memory usage visualization would go here */}
                      </div>
                    </div>
                  </div>
                  {/* Solution section */}
                  <div className="border rounded-md overflow-hidden shadow-sm bg-white">
                    <div className="px-3 py-2 flex items-center gap-2 border-b">
                      <span className="text-sm font-medium">Code</span>
                      <div className="flex-1"></div>
                      <div className="text-xs px-2 py-0.5 rounded bg-gray-100 text-gray-600">{acceptedSubmission?.language || "Code"}</div>
                    </div>
                    <div className="p-0" style={{ minHeight: 120 }}>
                      <CodeEditor 
                        code={acceptedSubmission?.code || "// Code not available"}
                        setCode={() => {}} // no-op
                        language={acceptedSubmission?.language || "JavaScript"}
                        readOnly={true}
                      />
                    </div>
                  </div>
                  {/* Related challenges */}
                  <div className="mt-2">
                    <h3 className="text-sm font-medium mb-2">More challenges</h3>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="border rounded-md p-2 text-xs hover:bg-gray-50 cursor-pointer">
                        <span className="inline-block w-2 h-2 rounded-full bg-yellow-500 mr-1"></span>
                        167. Two Sum II - Input Array Is Sorted
                      </div>
                      <div className="border rounded-md p-2 text-xs hover:bg-gray-50 cursor-pointer">
                        <span className="inline-block w-2 h-2 rounded-full bg-yellow-500 mr-1"></span>
                        170. Two Sum III - Data structure design
                      </div>
                      <div className="border rounded-md p-2 text-xs hover:bg-gray-50 cursor-pointer">
                        <span className="inline-block w-2 h-2 rounded-full bg-yellow-500 mr-1"></span>
                        653. Two Sum IV - Input is a BST
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}
            </TabsContent>
          </Tabs>
        </div>

        {/* Horizontal Resizer */}
        <div
          className="horizontal-resizer group hidden md:block"
          style={{ 
            left: `${leftPanelWidth}%`,
            position: 'absolute',
            top: 0,
            bottom: 0,
            zIndex: 40,
            width: '6px',
            cursor: 'col-resize'
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
          <div className="border-border border-b flex items-center justify-between px-4 py-2 flex-shrink-0 h-10" style={{minHeight: 40, height: 40, maxHeight: 40}}>
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
                      {displayedLanguageName}
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
                    {(!languageFilter || availableLanguages.some(lang => {
                      const matchesFilter = !languageFilter || 
                        lang.name.toLowerCase().includes(languageFilter.toLowerCase()) ||
                        judge0Languages.find(j => String(j.id) === String(lang.languageId))?.name?.toLowerCase().includes(languageFilter.toLowerCase());
                      
                      const langName = judge0Languages.find(j => String(j.id) === String(lang.languageId))?.name || lang.name;
                      
                      return ['JavaScript', 'Python', 'Java', 'C++', 'C#', 'TypeScript'].some(popularLang => 
                        langName.startsWith(popularLang)
                      ) && matchesFilter;
                    })) && (
                      <div className="language-section">
                        <div className="language-section-title">Popular</div>
                        <div className="language-grid">
                          {availableLanguages
                            .filter(lang => {
                              const matchesFilter = !languageFilter || 
                                lang.name.toLowerCase().includes(languageFilter.toLowerCase()) ||
                                judge0Languages.find(j => String(j.id) === String(lang.languageId))?.name?.toLowerCase().includes(languageFilter.toLowerCase());
                              
                              const langName = judge0Languages.find(j => String(j.id) === String(lang.languageId))?.name || lang.name;
                              
                              return ['JavaScript', 'Python', 'Java', 'C++', 'C#', 'TypeScript'].some(popularLang => 
                                langName.startsWith(popularLang)
                              ) && matchesFilter;
                            })
                            .sort((a, b) => {
                              const aName = judge0Languages.find(j => String(j.id) === String(a.languageId))?.name || a.name;
                              const bName = judge0Languages.find(j => String(j.id) === String(b.languageId))?.name || b.name;
                              return aName.localeCompare(bName);
                            })
                            .map(lang => {
                              const langId = String(lang.languageId);
                              
                              // Get language name - try judge0Languages first, then fallback to common names
                              let resolvedName = ""; // Initialize with empty string
                              if (judge0Languages?.length) {
                                const judge0Lang = judge0Languages.find((l) => String(l.id) === langId);
                                resolvedName = judge0Lang?.name || lang.name || langId;
                              } else {
                                // Try common language names as fallback
                                resolvedName = COMMON_LANGUAGE_NAMES[langId] || lang.name || `Language ${langId}`;
                              }
                              
                              // Check if this language is active
                              const isActive = language === langId;
                              
                              return (
                                <div
                                  key={lang.id}
                                  className={`language-item ${isActive ? 'active' : ''}`}
                                  onClick={() => handleLanguageChange(langId)}
                                >
                                  <span className="language-icon">
                                    {getLanguageIcon(resolvedName)}
                                  </span>
                                  <span title={resolvedName}>
                                    {getLanguageBaseAndVersion(resolvedName)}
                                  </span>
                                </div>
                              );
                            })
                          }
                        </div>
                      </div>
                    )}
                    
                    {/* Systems Section */}
                    {(!languageFilter || availableLanguages.some(lang => {
                      const matchesFilter = !languageFilter || 
                        lang.name.toLowerCase().includes(languageFilter.toLowerCase()) ||
                        judge0Languages.find(j => String(j.id) === String(lang.languageId))?.name?.toLowerCase().includes(languageFilter.toLowerCase());
                      
                      const langName = judge0Languages.find(j => String(j.id) === String(lang.languageId))?.name || lang.name;
                      
                      return ['C ', 'Rust', 'Go', 'Assembly'].some(sysLang => 
                        langName.startsWith(sysLang) || 
                        (sysLang === 'C ' && langName === 'C')
                      ) && 
                      !langName.includes('C++') && 
                      !langName.includes('C#') &&
                      matchesFilter;
                    })) && (
                      <div className="language-section">
                        <div className="language-section-title">Systems & Low-level</div>
                        <div className="language-grid">
                          {availableLanguages
                            .filter(lang => {
                              const matchesFilter = !languageFilter || 
                                lang.name.toLowerCase().includes(languageFilter.toLowerCase()) ||
                                judge0Languages.find(j => String(j.id) === String(lang.languageId))?.name?.toLowerCase().includes(languageFilter.toLowerCase());
                              
                              const langName = judge0Languages.find(j => String(j.id) === String(lang.languageId))?.name || lang.name;
                              
                              return ['C ', 'Rust', 'Go', 'Assembly'].some(sysLang => 
                                langName.startsWith(sysLang) || 
                                (sysLang === 'C ' && langName === 'C')
                              ) && 
                              !langName.includes('C++') && 
                              !langName.includes('C#') &&
                              matchesFilter;
                            })
                            .sort((a, b) => {
                              const aName = judge0Languages.find(j => String(j.id) === String(a.languageId))?.name || a.name;
                              const bName = judge0Languages.find(j => String(j.id) === String(b.languageId))?.name || b.name;
                              return aName.localeCompare(bName);
                            })
                            .map(lang => {
                              const langId = String(lang.languageId);
                              
                              // Get language name - try judge0Languages first, then fallback to common names
                              let resolvedName = ""; // Initialize with empty string
                              if (judge0Languages?.length) {
                                const judge0Lang = judge0Languages.find((l) => String(l.id) === langId);
                                resolvedName = judge0Lang?.name || lang.name || langId;
                              } else {
                                // Try common language names as fallback
                                resolvedName = COMMON_LANGUAGE_NAMES[langId] || lang.name || `Language ${langId}`;
                              }
                              
                              // Check if this language is active
                              const isActive = language === langId;
                              
                              return (
                                <div
                                  key={lang.id}
                                  className={`language-item ${isActive ? 'active' : ''}`}
                                  onClick={() => handleLanguageChange(langId)}
                                >
                                  <span className="language-icon">
                                    {getLanguageIcon(resolvedName)}
                                  </span>
                                  <span title={resolvedName}>
                                    {getLanguageBaseAndVersion(resolvedName)}
                                  </span>
                                </div>
                              );
                            })
                          }
                        </div>
                      </div>
                    )}
                    
                    {/* Other Languages Section */}
                    {(!languageFilter || availableLanguages.some(lang => {
                      const matchesFilter = !languageFilter || 
                        lang.name.toLowerCase().includes(languageFilter.toLowerCase()) ||
                        judge0Languages.find(j => String(j.id) === String(lang.languageId))?.name?.toLowerCase().includes(languageFilter.toLowerCase());
                      
                      const langName = judge0Languages.find(j => String(j.id) === String(lang.languageId))?.name || lang.name;
                      
                      const isPopular = ['JavaScript', 'Python', 'Java', 'C++', 'C#', 'TypeScript'].some(popularLang => 
                        langName.startsWith(popularLang)
                      );
                      
                      const isSystem = ['C ', 'Rust', 'Go', 'Assembly'].some(sysLang => 
                        langName.startsWith(sysLang) || 
                        (sysLang === 'C ' && langName === 'C')
                      ) && 
                      !langName.includes('C++') && 
                      !langName.includes('C#');
                      
                      return !isPopular && !isSystem && matchesFilter;
                    })) && (
                      <div className="language-section">
                        <div className="language-section-title">Other Languages</div>
                        <div className="language-grid">
                          {availableLanguages
                            .filter(lang => {
                              const matchesFilter = !languageFilter || 
                                lang.name.toLowerCase().includes(languageFilter.toLowerCase()) ||
                                judge0Languages.find(j => String(j.id) === String(lang.languageId))?.name?.toLowerCase().includes(languageFilter.toLowerCase());
                              
                              const langName = judge0Languages.find(j => String(j.id) === String(lang.languageId))?.name || lang.name;
                              
                              const isPopular = ['JavaScript', 'Python', 'Java', 'C++', 'C#', 'TypeScript'].some(popularLang => 
                                langName.startsWith(popularLang)
                              );
                              
                              const isSystem = ['C ', 'Rust', 'Go', 'Assembly'].some(sysLang => 
                                langName.startsWith(sysLang) || 
                                (sysLang === 'C ' && langName === 'C')
                              ) && 
                              !langName.includes('C++') && 
                              !langName.includes('C#');
                              
                              return !isPopular && !isSystem && matchesFilter;
                            })
                            .sort((a, b) => {
                              const aName = judge0Languages.find(j => String(j.id) === String(a.languageId))?.name || a.name;
                              const bName = judge0Languages.find(j => String(j.id) === String(b.languageId))?.name || b.name;
                              return aName.localeCompare(bName);
                            })
                            .map(lang => {
                              const langId = String(lang.languageId);
                              
                              // Get language name - try judge0Languages first, then fallback to common names
                              let resolvedName = ""; // Initialize with empty string
                              if (judge0Languages?.length) {
                                const judge0Lang = judge0Languages.find((l) => String(l.id) === langId);
                                resolvedName = judge0Lang?.name || lang.name || langId;
                              } else {
                                // Try common language names as fallback
                                resolvedName = COMMON_LANGUAGE_NAMES[langId] || lang.name || `Language ${langId}`;
                              }
                              
                              // Check if this language is active
                              const isActive = language === langId;
                              
                              return (
                                <div
                                  key={lang.id}
                                  className={`language-item ${isActive ? 'active' : ''}`}
                                  onClick={() => handleLanguageChange(langId)}
                                >
                                  <span className="language-icon">
                                    {getLanguageIcon(resolvedName)}
                                  </span>
                                  <span title={resolvedName}>
                                    {getLanguageBaseAndVersion(resolvedName)}
                                  </span>
                                </div>
                              );
                            })
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
            {!isTestPanelExpanded && (
            <div 
              className="code-panel"
              style={{ 
                height: `calc(${100 - bottomPanelHeight}% )`, 
                boxSizing: 'border-box',
                position: 'relative'
              }}
            >
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
                    language={getCodeMirrorModeFromJudge0Name(getJudge0LangById(language)?.name || '')}
                  preloadCode={getLanguageTemplate(language)}
                  initialShowSettings={editorSettingsOpen}
                  editorSettingsRef={editorSettingsRef}
                  errorLine={errorLine}
                  errorMessage={errorMessage}
                />
              )}
            </div>
            )}

            {/* Vertical Resizer */}
            {!isTestPanelExpanded && (
            <div
              className="vertical-resizer group"
              style={{ 
                position: 'absolute',
                left: 0,
                right: 0, 
                top: `calc(${100 - bottomPanelHeight}% + 15px)`,
                height: '6px',
                  zIndex: 50,
                width: '100%',
                  display: focusMode ? 'none' : 'block',
                  cursor: 'row-resize'
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
            )}

            {/* Test Cases Panel */}
            <div 
              className={`test-panel border-t flex flex-col${isTestPanelExpanded ? ' test-panel-expanded' : ''}`}
              style={{ 
                height: isTestPanelExpanded ? '100%' : `${bottomPanelHeight}%`,
                position: isTestPanelExpanded ? 'absolute' : 'relative',
                top: isTestPanelExpanded ? 0 : undefined,
                left: isTestPanelExpanded ? 0 : undefined,
                width: isTestPanelExpanded ? '100%' : undefined,
                zIndex: isTestPanelExpanded ? 100 : undefined,
                background: isTestPanelExpanded ? 'var(--background)' : undefined,
                boxShadow: isTestPanelExpanded ? '0 8px 30px rgba(0,0,0,0.1)' : undefined,
                borderRadius: isTestPanelExpanded ? 12 : undefined,
                minHeight: '20%',
                maxHeight: '80%',
                overflow: 'hidden'
              }}
            >
              {/* Expand/Collapse Button */}
              <div className="flex justify-end p-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="test-panel-expand-btn"
                  onClick={() => setIsTestPanelExpanded(!isTestPanelExpanded)}
                  title={isTestPanelExpanded ? "Collapse Test Panel" : "Expand Test Panel"}
                >
                  {isTestPanelExpanded ? <Minimize className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}
                </Button>
              </div>
              {/* ...rest of test panel... */}
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
 