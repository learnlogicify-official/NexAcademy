"use client"

import { useState, useEffect, useRef } from "react"
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

export default function ProblemPage() {
  const [code, setCode] = useState(`function twoSum(nums, target) {
  // Your solution here
}`)
  const [results, setResults] = useState<any>(null)
  const [isRunning, setIsRunning] = useState(false)
  const [leftPanelWidth, setLeftPanelWidth] = useState(50) // Default 50%
  const [bottomPanelHeight, setBottomPanelHeight] = useState(30) // Default 30% of right panel
  const [isResizingHorizontal, setIsResizingHorizontal] = useState(false)
  const [isResizingVertical, setIsResizingVertical] = useState(false)
  const [showVisualization, setShowVisualization] = useState(false)
  const [language, setLanguage] = useState("JavaScript")
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)
  const [showPremiumModal, setShowPremiumModal] = useState(false)
  const [isPremiumUser, setIsPremiumUser] = useState(false)
  const [savedSnippets, setSavedSnippets] = useState<{name: string, code: string, language: string}[]>([])
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const [snippetName, setSnippetName] = useState("")
  const [codeCopied, setCodeCopied] = useState(false)
  const [focusMode, setFocusMode] = useState(false)
  const [problem, setProblem] = useState<any>(null)
  const [timeElapsed, setTimeElapsed] = useState(0)

  const confettiRef = useRef<HTMLDivElement>(null)
  const rightPanelRef = useRef<HTMLDivElement>(null)
  const previousHeightRef = useRef(bottomPanelHeight)

  const params = useParams()
  const problemId = params.id as string

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

      // Escape to exit fullscreen
      if (e.key === "Escape" && isFullscreen) {
        setIsFullscreen(false)
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
  }, [isFullscreen, code, language, resetLayout])

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
    setIsResizingVertical(true)
    document.addEventListener("mousemove", handleVerticalResize)
    document.addEventListener("mouseup", stopVerticalResize)
  }

  const handleVerticalResize = (e: MouseEvent) => {
    if (!isResizingVertical || !rightPanelRef.current) return

    const rightPanelRect = rightPanelRef.current.getBoundingClientRect()
    const rightPanelHeight = rightPanelRect.height
    const relativeY = e.clientY - rightPanelRect.top

    // Calculate percentage height based on mouse position
    const newHeight = (relativeY / rightPanelHeight) * 100

    // Limit the minimum and maximum heights
    if (newHeight > 20 && newHeight < 80) {
      const bottomHeight = 100 - newHeight
      setBottomPanelHeight(bottomHeight)
    }
  }

  const stopVerticalResize = () => {
    setIsResizingVertical(false)
    document.removeEventListener("mousemove", handleVerticalResize)
    document.removeEventListener("mouseup", stopVerticalResize)
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
    switch (lang) {
      case "JavaScript":
        return `function twoSum(nums, target) {
  // Your solution here
}`
      case "Python":
        return `class Solution:
    def twoSum(self, nums: List[int], target: int) -> List[int]:
        # Your solution here
        pass`
      case "Java":
        return `class Solution {
    public int[] twoSum(int[] nums, int target) {
        // Your solution here
        return new int[]{};
    }
}`
      case "C++":
        return `class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        // Your solution here
    }
};`
      default:
        return `function twoSum(nums, target) {
  // Your solution here
}`
    }
  }

  const handleLanguageChange = (lang: string) => {
    setLanguage(lang)
    setCode(getLanguageTemplate(lang))
  }

  const runCode = () => {
    setIsRunning(true)

    // Simulate code execution
    setTimeout(() => {
      const testCases = [
        { input: [[2, 7, 11, 15], 9], expected: [0, 1] },
        { input: [[3, 2, 4], 6], expected: [1, 2] },
        { input: [[3, 3], 6], expected: [0, 1] },
      ]

      // Simple evaluation (in real app, would use a safer approach)
      try {
        // Create a function from the code string
        const userFunc = new Function("return " + code)()

        const testResults = testCases.map((testCase, index) => {
          try {
            const result = userFunc(...testCase.input)
            const passed = JSON.stringify(result) === JSON.stringify(testCase.expected)
            return {
              testCase: index + 1,
              input: JSON.stringify(testCase.input),
              expected: JSON.stringify(testCase.expected),
              output: JSON.stringify(result),
              passed,
            }
          } catch (error: any) {
            return {
              testCase: index + 1,
              input: JSON.stringify(testCase.input),
              expected: JSON.stringify(testCase.expected),
              output: "Error",
              passed: false,
              error: error.message,
            }
          }
        })

        const allPassed = testResults.every((result) => result.passed)

        setResults({
          success: true,
          allPassed,
          testResults,
        })

        // Show confetti if all tests passed
        if (allPassed) {
          setShowConfetti(true)
        }
      } catch (error: any) {
        setResults({
          success: false,
          error: error.message,
        })
      }

      setIsRunning(false)
    }, 1000)
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
      // Exit focus mode, restore previous height
      setBottomPanelHeight(previousHeightRef.current)
      setFocusMode(false)
    } else {
      // Enter focus mode, save current height and hide bottom panel
      previousHeightRef.current = bottomPanelHeight
      setBottomPanelHeight(0)
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

  useEffect(() => {
    // Fetch problem data from API
    const fetchProblem = async () => {
      try {
        const response = await fetch(`/api/problem/${problemId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch problem data');
        }
        const data = await response.json();
        setProblem(data);
        // Set initial code
        if (data.starterCode) {
          setCode(data.starterCode);
        }
      } catch (error) {
        console.error('Error fetching problem:', error);
        // Fallback to sample problem if API fails
        setProblem(sampleProblem);
        setCode(sampleProblem.starterCode);
      }
    };

    fetchProblem();

    // Start timer
    const timer = setInterval(() => {
      setTimeElapsed((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [problemId]);

  return (
    <div className="main-container">
      {/* Confetti container */}
      <div ref={confettiRef} className="fixed inset-0 pointer-events-none z-50"></div>

      {/* Header */}
      <header className="border-border border-b flex items-center justify-between px-4 py-2 flex-shrink-0">
        <div className="flex items-center h-12 px-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="text-yellow-500">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2L1 12H4V21H10V15H14V21H20V12H23L12 2Z" fill="currentColor" />
                </svg>
              </Button>
              <Button variant="ghost" size="sm" className="font-medium">
                <List className="h-4 w-4 mr-2" />
                Problem List
              </Button>
            </div>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <ChevronRight className="h-4 w-4" />
              </Button>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={toggleFullscreen}>
                      <Maximize className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent className="tooltip-content">
                    <p>Toggle fullscreen mode</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-yellow-500">
                    <Star className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="tooltip-content">
                  <p>Add to favorites</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <Button variant="outline" size="sm" className="gap-1" onClick={runCode} disabled={isRunning}>
              {isRunning ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div> : <Play className="h-4 w-4" />}
              Run
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="gap-1 bg-green-50 text-green-600 border-green-200 hover:bg-green-100 hover:text-green-700"
            >
              <CheckSquare className="h-4 w-4" />
              Submit
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreHorizontal className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Code Actions</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setShowSaveDialog(true)}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Snippet
                </DropdownMenuItem>
                <DropdownMenuItem onClick={copyCode}>
                  <Copy className="h-4 w-4 mr-2" />
                  {codeCopied ? "Copied!" : "Copy Code"}
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Github className="h-4 w-4 mr-2" />
                  Export to GitHub Gist
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuLabel>Layout Options</DropdownMenuLabel>
                <DropdownMenuItem onClick={resetLayout}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-4 w-4 mr-2"
                  >
                    <path d="M3 2v6h6"></path>
                    <path d="M21 12A9 9 0 0 0 6 5.3L3 8"></path>
                    <path d="M21 22v-6h-6"></path>
                    <path d="M3 12a9 9 0 0 0 15 6.7l3-2.7"></path>
                  </svg>
                  Reset Layout
                </DropdownMenuItem>
                <DropdownMenuItem onClick={toggleFullscreen}>
                  <Maximize className="h-4 w-4 mr-2" />
                  {isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <div className="px-2 py-1.5 text-xs text-muted-foreground">
                  <div className="font-semibold mb-1">Keyboard Shortcuts</div>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                    <span>Run Code:</span>
                    <span className="font-mono">Ctrl+Enter</span>
                    <span>Save Snippet:</span>
                    <span className="font-mono">Ctrl+S</span>
                    <span>Focus Mode:</span>
                    <span className="font-mono">Alt+0</span>
                    <span>Reset Layout:</span>
                    <span className="font-mono">Alt+R</span>
                    <span>30:70 Layout:</span>
                    <span className="font-mono">Alt+1</span>
                    <span>50:50 Layout:</span>
                    <span className="font-mono">Alt+2</span>
                    <span>70:30 Layout:</span>
                    <span className="font-mono">Alt+3</span>
                    <span>85:15 Editor:</span>
                    <span className="font-mono">Alt+8</span>
                    <span>80:20 Editor:</span>
                    <span className="font-mono">Alt+7</span>
                    <span>90:10 Editor:</span>
                    <span className="font-mono">Alt+9</span>
                    <span>Fullscreen:</span>
                    <span className="font-mono">F11</span>
                  </div>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
            
            {savedSnippets.length > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Folder className="h-5 w-5" />
                  </Button>
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
            
            <div className="flex items-center gap-2 ml-4">
              <ModeToggle />
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Settings className="h-4 w-4" />
              </Button>
              <div className="h-8 w-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-medium">
                U
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-orange-500 font-medium flex items-center gap-1"
                onClick={togglePremiumStatus}
              >
                <Crown className="h-4 w-4" />
                Premium
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="panels-container">
        {/* Left Panel - Problem Description */}
        <div className="left-panel border-border border-r" style={{ width: `${leftPanelWidth}%` }}>
          <Tabs defaultValue="description" className="w-full h-full flex flex-col">
            <div className="border-border border-b flex-shrink-0">
              <div className="px-4 py-2">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="description" className="flex items-center gap-1 justify-start px-0">
                    <BookOpen className="h-4 w-4" />
                    Description
                  </TabsTrigger>
                  <TabsTrigger value="solution" className="flex items-center gap-1 justify-start px-0">
                    <Lightbulb className="h-4 w-4" />
                    Solution
                    {!isPremiumUser && <Lock className="h-3 w-3 ml-1 text-orange-500" />}
                  </TabsTrigger>
                  <TabsTrigger value="discussion" className="flex items-center gap-1 justify-start px-0">
                    <MessageSquare className="h-4 w-4" />
                    Discussion
                  </TabsTrigger>
                </TabsList>
              </div>
            </div>
            <TabsContent value="description" className="p-4 left-panel-content panel-scrollable">
              <ProblemDescription isPremium={isPremiumUser} problem={problem} />
              {isPremiumUser && <CompanyTags />}
            </TabsContent>
            <TabsContent value="solution" className="p-4 left-panel-content panel-scrollable">
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
            <TabsContent value="discussion" className="p-4 left-panel-content panel-scrollable">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-lg">Discussion (124)</h3>
                  <Button variant="outline" size="sm">
                    New
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
            zIndex: 10
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
          style={{ width: `${100 - leftPanelWidth}%` }}
          ref={rightPanelRef}
        >
          {/* Code Editor Header */}
          <div className="border-border border-b flex items-center justify-between px-4 py-2 flex-shrink-0 h-10">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-500 dark:text-gray-300">Code</span>
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
                      <span className="ml-1 opacity-70">(Alt+0)</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="tooltip-content">
                    <p>Toggle focus mode to hide/show the bottom panel</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <div className="flex items-center gap-2">
              <select
                className="text-sm border rounded px-2 py-1 bg-white dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700"
                value={language}
                onChange={(e) => handleLanguageChange(e.target.value)}
              >
                <option>C++</option>
                <option>Java</option>
                <option>Python</option>
                <option>JavaScript</option>
              </select>
              <Button variant="ghost" size="sm" className="text-gray-500 dark:text-gray-400">
                Auto
              </Button>
            </div>
          </div>

          {/* Panels Container */}
          <div className="flex flex-col flex-1" style={{ position: 'relative' }}>
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
                <CodeEditor code={code} setCode={setCode} language={language} />
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
                zIndex: 20
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
                boxSizing: 'border-box'
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
                  <Tabs defaultValue="testcase" className="w-full h-full flex flex-col">
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
                    <TabsContent value="testcase" className="p-4 test-panel-content panel-scrollable">
                      <TestCases />
                    </TabsContent>
                    <TabsContent value="result" className="p-4 test-panel-content panel-scrollable">
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
