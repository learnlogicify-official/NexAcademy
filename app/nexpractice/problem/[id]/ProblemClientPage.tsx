"use client"

import React, { Fragment, useState, useRef, useEffect, useCallback, useMemo } from "react"
import {
  ChevronLeft,
  ChevronRight,
  Star,
  Play,
  Send,
  Bell,
  FileText,
  Settings,
  List,
  BarChart2,
  MessageSquare,
  Clock,
  Check,
  Eye,
  Grip,
  Terminal,
  Menu,
  X,
  Home,
  MoreVertical,
  Code,
  Zap,
  BrainCircuit,
  RotateCw,
  BookOpenCheck,
  Sparkles,
  Crown,
  Users,
  Maximize2,
  Minimize2,
  ChevronDown,
  Search,
  User,
  LogOut,
  AlertTriangle,
  XCircle,
  Info,
  Cpu,
  Loader2,
  Percent,
  Lock,
  CheckCircle,
  AlignLeft,
  ZoomIn,
  ZoomOut,
  Maximize,
  Minimize,
  Copy,
  ClipboardCopy,
  Sparkle,
  ArrowLeft,
  Filter,
  RefreshCw,
  Database,
  AlertCircle,
  HelpCircle,
  Calendar,
  Hash,
  Code2,
  Server,
  FileCode,
  MonitorSmartphone,
  Moon,
  Sun,
  Type,
  Indent
} from "lucide-react"
import { Avatar } from "@/components/ui/avatar"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { NexEditor as CodeEditor } from "@/components/NexEditor"
import { useIsMobile } from "@/components/ui/use-mobile"
import { useTheme } from "next-themes"
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"
import { CodingQuestionsSidebar } from "@/components/CodingQuestionsSidebar"
import { Input } from "@/components/ui/input"
import type { editor } from "monaco-editor"
import type { Monaco } from "@monaco-editor/react"
import { useSession } from "next-auth/react"
import { useProfilePic } from "@/components/ProfilePicContext"
import { useMutation, useQuery, useApolloClient } from '@apollo/client';
import { RUN_CODE, SUBMIT_CODE } from './graphql/codeExecution';
import { getLanguageId } from './utils/getLanguageId';
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner"
import confetti from 'canvas-confetti'
import { HiddenTestcasesTab } from "./components/HiddenTestcasesTab";
import ProblemHeader from "./components/ProblemHeader"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"
import { usePathname } from "next/navigation"
import { useSearchParams } from "next/navigation"
import { submissionService } from '@/lib/services/submissionService';
import JSConfetti from 'js-confetti'
import { Editor } from "@monaco-editor/react"
import { ModeToggle } from "@/components/nexpractice/mode-toggle";
import DOMPurify from 'isomorphic-dompurify';
import { gql } from '@apollo/client';
import Link from "next/link"

// Judge0 API language mapping
const JUDGE0_LANGUAGES = {
  "45": "Assembly (NASM 2.14.02)",
  "46": "Bash (5.0.0)",
  "47": "Basic (FBC 1.07.1)",
  "75": "C (Clang 7.0.1)",
  "76": "C++ (Clang 7.0.1)",
  "48": "C (GCC 7.4.0)",
  "52": "C++ (GCC 7.4.0)",
  "49": "C (GCC 8.3.0)",
  "53": "C++ (GCC 8.3.0)",
  "50": "C (GCC 9.2.0)",
  "54": "C++ (GCC 9.2.0)",
  "86": "Clojure (1.10.1)",
  "51": "C# (Mono 6.6.0.161)",
  "77": "COBOL (GnuCOBOL 2.2)",
  "55": "Common Lisp (SBCL 2.0.0)",
  "56": "D (DMD 2.089.1)",
  "57": "Elixir (1.9.4)",
  "58": "Erlang (OTP 22.2)",
  "44": "Executable",
  "87": "F# (.NET Core SDK 3.1.202)",
  "59": "Fortran (GFortran 9.2.0)",
  "60": "Go (1.13.5)",
  "88": "Groovy (3.0.3)",
  "61": "Haskell (GHC 8.8.1)",
  "62": "Java (OpenJDK 13.0.1)",
  "63": "JavaScript (Node.js 12.14.0)",
  "78": "Kotlin (1.3.70)",
  "64": "Lua (5.3.5)",
  "89": "Multi-file program",
  "79": "Objective-C (Clang 7.0.1)",
  "65": "OCaml (4.09.0)",
  "66": "Octave (5.1.0)",
  "67": "Pascal (FPC 3.0.4)",
  "85": "Perl (5.28.1)",
  "68": "PHP (7.4.1)",
  "43": "Plain Text",
  "69": "Prolog (GNU Prolog 1.4.5)",
  "70": "Python (2.7.17)",
  "71": "Python (3.8.1)",
  "80": "R (4.0.0)",
  "72": "Ruby (2.7.0)",
  "73": "Rust (1.40.0)",
  "81": "Scala (2.13.2)",
  "82": "SQL (SQLite 3.27.2)",
  "83": "Swift (5.2.3)",
  "74": "TypeScript (3.7.4)",
  "84": "Visual Basic.Net (vbnc 0.0.0.5943)"
}

interface ProblemClientPageProps {
  codingQuestion: any // Use 'any' for now, or import the correct type and extend it to include .question
  defaultLanguage: string
  preloadCode: string
}

// Helper function to format test case content
const formatTestCase = (content: string): React.ReactNode => {
  if (!content) return null;
  
  // Try to parse the content as JSON to see if it's structured data
  try {
    const parsedData = JSON.parse(content);
    if (typeof parsedData === 'object') {
      return (
        <div className="syntax-highlighted">
          {renderJsonValue(parsedData, 0)}
        </div>
      );
    }
  } catch (e) {
    // Not valid JSON, continue with other formatting
  }
  
  // Handle arrays represented as strings like "[1,2,3]"
  if (content.trim().startsWith('[') && content.trim().endsWith(']')) {
    try {
      const arrayData = JSON.parse(content);
      if (Array.isArray(arrayData)) {
        return (
          <div className="syntax-highlighted">
            {renderArray(arrayData)}
          </div>
        );
      }
    } catch (e) {
      // Not a valid array, continue
    }
  }
  
  // Handle common variable assignment patterns like "nums = [2,7,11,15], target = 9"
  if (content.includes('=')) {
    return (
      <div className="space-y-1">
        {content.split(',').map((part, idx) => {
          const parts = part.split('=').map(s => s.trim());
          if (parts.length < 2) return <div key={idx}>{part}</div>;
          
          const [variable, value] = parts;
          
          return (
            <div key={idx} className="flex flex-wrap items-center">
              <span className="text-purple-600 dark:text-purple-400 mr-1">{variable}</span>
              <span className="text-slate-600 dark:text-slate-400 mr-1">=</span>
              <span>
                {renderFormattedValue(value)}
              </span>
            </div>
          );
        })}
      </div>
    );
  }
  
  // If content has multiple lines, preserve them
  if (content.includes('\n')) {
    return (
      <pre className="whitespace-pre-wrap">{content}</pre>
    );
  }
  
  // Default: return as-is with basic formatting
  return (
    <div className="whitespace-pre-wrap">{renderFormattedValue(content)}</div>
  );
};

// Helper function to render formatted value
const renderFormattedValue = (value: string): React.ReactNode => {
  // Check if value is a number
  if (/^-?\d+(\.\d+)?$/.test(value)) {
    return <span className="text-amber-600 dark:text-amber-400">{value}</span>;
  }
  
  // Check if value is a boolean
  if (value === 'true' || value === 'false') {
    return <span className="text-green-600 dark:text-green-400">{value}</span>;
  }
  
  // Check if value is null or undefined
  if (value === 'null' || value === 'undefined') {
    return <span className="text-gray-500 dark:text-gray-400">{value}</span>;
  }
  
  // Check if value is a string
  if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
    return <span className="text-green-600 dark:text-green-400">{value}</span>;
  }
  
  // Check if value is an array
  if (value.startsWith('[') && value.endsWith(']')) {
    try {
      const array = JSON.parse(value);
      if (Array.isArray(array)) {
        return renderArray(array);
      }
    } catch (e) {
      // Not a valid array
    }
  }
  
  // Default case
  return <span>{value}</span>;
};

// Helper function to render JSON-like arrays
const renderArray = (array: any[]): React.ReactNode => {
  return (
    <span>
      <span className="text-slate-600 dark:text-slate-400">[</span>
      {array.map((item, index) => (
        <Fragment key={index}>
          {index > 0 && <span className="text-slate-600 dark:text-slate-400">, </span>}
          {renderJsonValue(item, 0)}
        </Fragment>
      ))}
      <span className="text-slate-600 dark:text-slate-400">]</span>
    </span>
  );
};

// Helper to render JSON object/array with indentation
const renderJsonValue = (value: any, level: number): React.ReactNode => {
  if (value === null) {
    return <span className="text-gray-500 dark:text-gray-400">null</span>;
  }
  
  if (typeof value === 'undefined') {
    return <span className="text-gray-500 dark:text-gray-400">undefined</span>;
  }
  
  if (typeof value === 'boolean') {
    return <span className="text-green-600 dark:text-green-400">{String(value)}</span>;
  }
  
  if (typeof value === 'number') {
    return <span className="text-amber-600 dark:text-amber-400">{value}</span>;
  }
  
  if (typeof value === 'string') {
    return <span className="text-green-600 dark:text-green-400">"{value}"</span>;
  }
  
  if (Array.isArray(value)) {
    if (value.length === 0) {
      return <span className="text-slate-600 dark:text-slate-400">[]</span>;
    }
    
    if (level > 2 || isPrimitiveArray(value)) {
      // For deeply nested arrays or primitive arrays, show compact form
      return (
        <span>
          <span className="text-slate-600 dark:text-slate-400">[</span>
          {value.map((item, idx) => (
            <Fragment key={idx}>
              {idx > 0 && <span className="text-slate-600 dark:text-slate-400">, </span>}
              {renderJsonValue(item, level + 1)}
            </Fragment>
          ))}
          <span className="text-slate-600 dark:text-slate-400">]</span>
        </span>
      );
    }
    
    // For top-level and non-primitive arrays, show expanded form
    return (
      <div className="pl-4 border-l-2 border-indigo-100 dark:border-indigo-900/50 my-1">
        <span className="text-slate-600 dark:text-slate-400">[</span>
        {value.map((item, idx) => (
          <div key={idx} className="ml-2">
            {renderJsonValue(item, level + 1)}
            {idx < value.length - 1 && <span className="text-slate-600 dark:text-slate-400">,</span>}
          </div>
        ))}
        <span className="text-slate-600 dark:text-slate-400">]</span>
      </div>
    );
  }
  
  if (typeof value === 'object') {
    const entries = Object.entries(value);
    if (entries.length === 0) {
      return <span className="text-slate-600 dark:text-slate-400">{"{}"}</span>;
    }
    
    if (level > 2) {
      // For deeply nested objects, show compact form
      return (
        <span>
          <span className="text-slate-600 dark:text-slate-400">{"{"}</span>
          {entries.map(([key, val], idx) => (
            <Fragment key={key}>
              {idx > 0 && <span className="text-slate-600 dark:text-slate-400">, </span>}
              <span className="text-purple-600 dark:text-purple-400">"{key}"</span>
              <span className="text-slate-600 dark:text-slate-400">: </span>
              {renderJsonValue(val, level + 1)}
            </Fragment>
          ))}
          <span className="text-slate-600 dark:text-slate-400">{"}"}</span>
        </span>
      );
    }
    
    // For top-level objects, show expanded form
    return (
      <div className="pl-4 border-l-2 border-indigo-100 dark:border-indigo-900/50 my-1">
        <span className="text-slate-600 dark:text-slate-400">{"{"}</span>
        {entries.map(([key, val], idx) => (
          <div key={key} className="ml-2">
            <span className="text-purple-600 dark:text-purple-400">"{key}"</span>
            <span className="text-slate-600 dark:text-slate-400">: </span>
            {renderJsonValue(val, level + 1)}
            {idx < entries.length - 1 && <span className="text-slate-600 dark:text-slate-400">,</span>}
          </div>
        ))}
        <span className="text-slate-600 dark:text-slate-400">{"}"}</span>
      </div>
    );
  }
  
  // Default case
  return <span>{String(value)}</span>;
};

// Helper to check if array contains only primitive values
const isPrimitiveArray = (arr: any[]): boolean => {
  return arr.every(item => 
    item === null || 
    typeof item === 'undefined' || 
    typeof item === 'string' || 
    typeof item === 'number' || 
    typeof item === 'boolean'
  );
};

// Add language categories for organization
interface LanguageCategory {
  name: string;
  languages: string[]; // keys from JUDGE0_LANGUAGES
}

// Group languages by category for better organization
const LANGUAGE_CATEGORIES: LanguageCategory[] = [
  {
    name: "Popular",
    languages: ["71", "63", "62", "54", "73", "74", "60"]
  },
  {
    name: "JavaScript & TypeScript",
    languages: ["63", "74"]
  },
  {
    name: "Python",
    languages: ["70", "71"]
  },
  {
    name: "Java & JVM",
    languages: ["62", "78", "81", "86"]
  },
  {
    name: "C & C++",
    languages: ["48", "49", "50", "52", "53", "54", "75", "76"]
  },
  {
    name: "Systems Programming",
    languages: ["73", "45", "56"]
  },
  {
    name: "Web Development",
    languages: ["63", "74", "68", "72"]
  },
  {
    name: "Functional",
    languages: ["55", "57", "58", "65", "87"]
  },
  {
    name: "Others",
    languages: ["46", "47", "51", "59", "60", "61", "64", "66", "67", "69", "77", "79", "80", "82", "83", "84", "85", "88", "89", "43", "44"]
  }
];

// Language icons mapping (for common languages)
const LANGUAGE_ICONS: Record<string, React.ReactNode> = {
  // JavaScript
  "63": <div className="flex items-center justify-center w-full h-full"><span className="text-[11px] font-semibold text-yellow-500 dark:text-yellow-400 inline-flex">JS</span></div>,
  // TypeScript
  "74": <div className="flex items-center justify-center w-full h-full"><span className="text-[11px] font-semibold text-blue-500 dark:text-blue-400 inline-flex">TS</span></div>,
  // Python
  "70": <div className="flex items-center justify-center w-full h-full"><span className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 inline-flex">Py</span></div>,
  "71": <div className="flex items-center justify-center w-full h-full"><span className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 inline-flex">Py</span></div>,
  // Java
  "62": <div className="flex items-center justify-center w-full h-full"><span className="text-[11px] font-semibold text-orange-500 dark:text-orange-400 inline-flex">Ja</span></div>,
  // C
  "48": <div className="flex items-center justify-center w-full h-full"><span className="text-[11px] font-semibold text-blue-500 dark:text-blue-400 inline-flex">C</span></div>,
  "49": <div className="flex items-center justify-center w-full h-full"><span className="text-[11px] font-semibold text-blue-500 dark:text-blue-400 inline-flex">C</span></div>,
  "50": <div className="flex items-center justify-center w-full h-full"><span className="text-[11px] font-semibold text-blue-500 dark:text-blue-400 inline-flex">C</span></div>,
  // C++
  "52": <div className="flex items-center justify-center w-full h-full"><span className="text-[11px] font-semibold text-pink-500 dark:text-pink-400 inline-flex">C++</span></div>,
  "53": <div className="flex items-center justify-center w-full h-full"><span className="text-[11px] font-semibold text-pink-500 dark:text-pink-400 inline-flex">C++</span></div>,
  "54": <div className="flex items-center justify-center w-full h-full"><span className="text-[11px] font-semibold text-pink-500 dark:text-pink-400 inline-flex">C++</span></div>,
  // Go
  "60": <div className="flex items-center justify-center w-full h-full"><span className="text-[11px] font-semibold text-teal-500 dark:text-teal-400 inline-flex">Go</span></div>,
  // Rust
  "73": <div className="flex items-center justify-center w-full h-full"><span className="text-[11px] font-semibold text-orange-600 dark:text-orange-400 inline-flex">Rs</span></div>,
  // Ruby
  "72": <div className="flex items-center justify-center w-full h-full"><span className="text-[11px] font-semibold text-red-500 dark:text-red-400 inline-flex">Rb</span></div>,
  // PHP
  "68": <div className="flex items-center justify-center w-full h-full"><span className="text-[11px] font-semibold text-indigo-500 dark:text-indigo-400 inline-flex">PHP</span></div>,
};

// Helper to extract language name and version
const parseLanguageName = (fullName: string | undefined | null) => {
  if (!fullName || typeof fullName !== 'string') {
    return { name: '', version: '' };
  }
  const match = fullName.match(/^(.+?)\s+\((.+?)\)$/);
  if (match) {
    return { 
      name: match[1], 
      version: match[2] 
    };
  }
  return { name: fullName, version: "" };
};

// GraphQL mutation for saving user code draft
const SAVE_USER_CODE_DRAFT = gql`
  mutation SaveCodeDraft($input: SaveCodeDraftInput!) {
    saveCodeDraft(input: $input) {
      success
      message
    }
  }
`;

// GraphQL mutation for saving user problem setting (language)
const SAVE_USER_PROBLEM_SETTINGS = gql`
  mutation SaveUserProblemSettings($input: SaveUserProblemSettingsInput!) {
    saveUserProblemSettings(input: $input) {
      success
      message
    }
  }
`;

// GraphQL query for getting user problem settings
const GET_USER_PROBLEM_SETTINGS = gql`
  query GetUserProblemSettings($userId: String!, $problemId: String!) {
    getUserProblemSettings(userId: $userId, problemId: $problemId) {
      lastLanguage
    }
  }
`;

// GraphQL query for getting user code draft
const GET_USER_CODE_DRAFT = gql`
  query GetUserCodeDraft($userId: String!, $problemId: String!, $language: String!) {
    getUserCodeDraft(userId: $userId, problemId: $problemId, language: $language) {
      code
      updatedAt
    }
  }
`;

export default function ProblemClientPage({ codingQuestion, defaultLanguage, preloadCode }: ProblemClientPageProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const { data: authSession, status: authStatus } = useSession()
  const client = useApolloClient();
  
  // Add authentication debugging
  useEffect(() => {
    console.log('Auth session:', authSession);
    console.log('Auth status:', authStatus);
  }, [authSession, authStatus]);
  
  // Extract problem ID from the URL path
  const problemId = useMemo(() => {
    const pathSegments = pathname.split('/');
    return pathSegments[pathSegments.length - 1];
  }, [pathname]);

  // Initialize language correctly based on defaultLanguage
  const processDefaultLanguage = (lang: string): string => {
    if (lang === "Java") return "62"; // Java ID
    return lang || "71"; // Default to Python 3.8.1 if not specified
  };
  
  // 1. Add a loading state for initial code/language
  const [initialLoading, setInitialLoading] = useState(true);

  // 2. Set language and code to empty initially
  const [language, setLanguage] = useState<string>('');
  const [code, setCode] = useState<string>('');

  // Migrate data from anonymous storage to user storage when logging in
  useEffect(() => {
    if (authStatus === 'authenticated' && authSession?.user?.id && problemId && language) {
      const anonymousKey = `nexacademy_anonymous_${problemId}_${language}`;
      const userKey = `nexacademy_${authSession.user.id}_${problemId}_${language}`;
      
      // Check if there's anonymous data but no user data yet
      const anonymousData = localStorage.getItem(anonymousKey);
      const userData = localStorage.getItem(userKey);
      
      if (anonymousData && !userData) {
        // Migrate the anonymous data to the user's storage
        console.log(`Migrating anonymous data from ${anonymousKey} to user storage ${userKey}`);
        localStorage.setItem(userKey, anonymousData);
        
        // Clean up the anonymous data after migration
        console.log(`Removing migrated anonymous data from ${anonymousKey}`);
        localStorage.removeItem(anonymousKey);
        
        // Notify the user (optional)
        toast({
          title: "Your code was saved",
          description: "We've migrated your previously saved code to your account.",
          duration: 3000,
        });
      }
    }
  }, [authStatus, authSession, problemId, language, toast]);
  
  // Add debug log after initialization
  useEffect(() => {
    console.log("Initial language state:", language);
    console.log("Default language prop:", defaultLanguage);
  }, [language, defaultLanguage]);
  
  const isMobile = useIsMobile()
  const [sidebarOpen, setSidebarOpen] = useState(false) // Always closed by default for mobile
  const { resolvedTheme: appTheme, setTheme: setAppTheme } = useTheme()
  const [focusMode, setFocusMode] = useState(false)
  const [fontSize, setFontSize] = useState(14)
  const [tabSize, setTabSize] = useState(4)
  const [editorTheme, setEditorTheme] = useState<"vs-dark" | "light">("vs-dark")
  const [editorLoading, setEditorLoading] = useState(false);
  // Mobile view state - default to "problem" on mobile
  const [activePanel, setActivePanel] = useState<"problem" | "code" | "results">("problem")

  // Panel sizes (in percentages) - preemptively set based on device
  const isMobileInitial = typeof window !== 'undefined' ? window.innerWidth < 768 : false;
  const [leftPanelWidth, setLeftPanelWidth] = useState(isMobileInitial ? 100 : 50)
  const [editorHeight, setEditorHeight] = useState(70)
  const [previousLayout, setPreviousLayout] = useState({ leftWidth: 50, editorHeight: 70 })

  // Refs for resizing
  const containerRef = useRef<HTMLDivElement>(null)
  const isHorizontalResizing = useRef(false)
  const isVerticalResizing = useRef(false)
  const startX = useRef(0)
  const startY = useRef(0)
  const startLeftWidth = useRef(50)
  const startEditorHeight = useRef(70)

  // Remove client-side style injection to prevent hydration mismatch
  // Now relying on predefined CSS classes in globals.css

  // Toggle focus mode for the editor
  const toggleFocusMode = () => {
    if (focusMode) {
      // Exit focus mode - restore previous layout
      setLeftPanelWidth(previousLayout.leftWidth);
      setEditorHeight(previousLayout.editorHeight);
      setFocusMode(false);
    } else {
      // Enter focus mode - save current layout and expand editor
      setPreviousLayout({ leftWidth: leftPanelWidth, editorHeight: editorHeight });
      setLeftPanelWidth(0);
      setEditorHeight(100);
      setFocusMode(true);
    }
  };

  // Update layout when screen size changes and initialize correctly for mobile
  useEffect(() => {
    if (isMobile) {
      setLeftPanelWidth(100);
      // Always set activePanel to "problem" when the component is first mounted on mobile
      setActivePanel("problem");
    } else {
      setLeftPanelWidth(50);
    }
  }, [isMobile]);

  // Handle mouse events for resizing
  useEffect(() => {
    if (isMobile) return
    const handleMouseMove = (e: MouseEvent) => {
      if (isHorizontalResizing.current && containerRef.current) {
        const containerWidth = containerRef.current.clientWidth
        const deltaX = e.clientX - startX.current
        const deltaPercent = Math.round(((deltaX / containerWidth) * 100) / 5) * 5
        const newWidth = Math.min(Math.max(20, startLeftWidth.current + deltaPercent), 80)
        setLeftPanelWidth(newWidth)
      }
      if (isVerticalResizing.current && containerRef.current) {
        const rightPanelHeight = containerRef.current.clientHeight
        const deltaY = e.clientY - startY.current
        const deltaPercent = Math.round(((deltaY / rightPanelHeight) * 100) / 5) * 5
        const newHeight = Math.min(Math.max(20, startEditorHeight.current + deltaPercent), 80)
        setEditorHeight(newHeight)
      }
    }
    const handleMouseUp = () => {
      isHorizontalResizing.current = false
      isVerticalResizing.current = false
      document.body.style.cursor = "default"
      document.body.style.userSelect = "auto"
    }
    document.addEventListener("mousemove", handleMouseMove)
    document.addEventListener("mouseup", handleMouseUp)
    return () => {
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
    }
  }, [isMobile])

  const startHorizontalResize = (e: React.MouseEvent) => {
    if (isMobile) return
    isHorizontalResizing.current = true
    startX.current = e.clientX
    startLeftWidth.current = leftPanelWidth
    document.body.style.cursor = "ew-resize"
    document.body.style.userSelect = "none"
    e.preventDefault()
  }

  const startVerticalResize = (e: React.MouseEvent) => {
    if (isMobile) return
    isVerticalResizing.current = true
    startY.current = e.clientY
    startEditorHeight.current = editorHeight
    document.body.style.cursor = "ns-resize"
    document.body.style.userSelect = "none"
    e.preventDefault()
  }

  // Save code to localStorage on each keystroke
  useEffect(() => {
    if (!code || !problemId || !language || editorLoading) return;
    if (authStatus === 'authenticated' && authSession?.user?.id) {
      const userStorageKey = `nexacademy_${authSession.user.id}_${problemId}_${language}`;
      localStorage.setItem(userStorageKey, code);
      localStorage.setItem(`${userStorageKey}_timestamp`, Date.now().toString());
      // Optionally clean up any anonymous data for this problem/language
      const anonymousKey = `nexacademy_anonymous_${problemId}_${language}`;
      if (localStorage.getItem(anonymousKey)) {
        localStorage.removeItem(anonymousKey);
        localStorage.removeItem(`${anonymousKey}_timestamp`);
      }
    } else {
      const anonymousKey = `nexacademy_anonymous_${problemId}_${language}`;
      localStorage.setItem(anonymousKey, code);
      localStorage.setItem(`${anonymousKey}_timestamp`, Date.now().toString());
    }
  }, [code, problemId, language, authStatus, authSession, editorLoading]);
  
  // Load saved code from localStorage on component mount or language change
  useEffect(() => {
    if (!problemId || !language) return;
    
    let storageKey;
    
    // Determine the correct key to load from based on authentication status
    if (authStatus === 'authenticated' && authSession?.user?.id) {
      storageKey = `nexacademy_${authSession.user.id}_${problemId}_${language}`;
      console.log(`User authenticated: Loading from ${storageKey}`);
    } else {
      storageKey = `nexacademy_anonymous_${problemId}_${language}`;
      console.log(`User not authenticated: Loading from ${storageKey}`);
    }
    
    // Check if there's saved code in localStorage
    const savedCode = localStorage.getItem(storageKey);
    
    // Add debug log
    if (savedCode) {
      console.log(`Found saved code (length: ${savedCode.length})`);
    } else {
      console.log('No saved code found, using preloadCode');
    }
    
    // If there's saved code and it's different from the current code, update the editor
    if (savedCode && savedCode !== preloadCode) {
      setCode(savedCode);
    } else if (preloadCode) {
      // If no saved code but we have preloadCode, use that
      setCode(preloadCode);
    }
  }, [problemId, language, preloadCode, authStatus, authSession]);

  // Helper: get difficulty, version, name, etc. from codingQuestion.question
  const problemNumber = codingQuestion.question?.version || 1
  const problemTitle = codingQuestion.question?.name || "Untitled Problem"
  const difficulty = codingQuestion.question?.difficulty || "EASY"
  const description = codingQuestion.questionText
  const examples = codingQuestion.testCases?.filter((tc: any) => tc.isSample || tc.isSample === undefined) || []
  const languageOptions = codingQuestion.languageOptions || []

  // Format difficulty for display
  const formatDifficulty = (difficulty: string) => {
    if (difficulty === "EASY") return "Easy";
    if (difficulty === "MEDIUM") return "Medium";
    if (difficulty === "HARD") return "Hard";
    if (difficulty === "VERY_HARD") return "Very Hard";
    return difficulty.charAt(0) + difficulty.slice(1).toLowerCase();
  }

  // Get difficulty badge styling
  const getDifficultyBadge = (diff: string) => {
    const formattedDiff = formatDifficulty(diff);
    
    switch (formattedDiff) {
      case "Easy":
        return (
          <Badge className="bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300 font-medium">
            {formattedDiff}
          </Badge>
        );
      case "Medium":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300 font-medium">
            {formattedDiff}
          </Badge>
        );
      case "Hard":
        return (
          <Badge className="bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300 font-medium">
            {formattedDiff}
          </Badge>
        );
      default:
        return (
          <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300 font-medium">
            {formattedDiff}
          </Badge>
        );
    }
  };

  const [searchLanguage, setSearchLanguage] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>("Popular");

  const [isFormatting, setIsFormatting] = useState(false);
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const monacoRef = useRef<Monaco | null>(null);
  
  // Add a new state variable for formatting success
  const [formatSuccess, setFormatSuccess] = useState(false);
  const [noChangesNeeded, setNoChangesNeeded] = useState(false);
  
  // Unified code formatter
  const formatCodeByLanguage = (code: string, language: string): string => {
    if (!code.trim()) return code;
    
    // Use language-specific formatters
    switch (language) {
      case 'java':
        return formatJavaCode(code);
      case 'javascript':
      case 'typescript':
        return formatJsCode(code);
      case 'python':
        return formatPythonCode(code);
      default:
        return formatBasicIndentation(code, language);
    }
  };

  // JavaScript/TypeScript specific formatter
  const formatJsCode = (code: string): string => {
    let lines = code.split('\n');
    let formattedLines: string[] = [];
    let indentLevel = 0;
    
    // JavaScript/TypeScript generally uses 2 spaces
    const tabWidth = 2;
    
    for (const line of lines) {
      let trimmedLine = line.trim();
      
      // Skip empty lines
      if (!trimmedLine) {
        formattedLines.push('');
        continue;
      }
      
      // Check if line ends a block
      if (trimmedLine.startsWith('}') || 
          trimmedLine.startsWith(']') || 
          trimmedLine.startsWith(')')) {
        indentLevel = Math.max(0, indentLevel - 1);
      }
      
      // Apply indentation
      const indent = ' '.repeat(indentLevel * tabWidth);
      formattedLines.push(indent + trimmedLine);
      
      // Check if line opens a block
      const openBraceCount = (trimmedLine.match(/{/g) || []).length;
      const closeBraceCount = (trimmedLine.match(/}/g) || []).length;
      
      if (openBraceCount > closeBraceCount) {
        indentLevel += (openBraceCount - closeBraceCount);
      }
    }
    
    return formattedLines.join('\n');
  };

  // Format keyboard shortcut handler
  useEffect(() => {
    // Track key sequence for Ctrl+K, Ctrl+F
    let ctrlKPressed = false;
    const resetSequence = () => {
      setTimeout(() => {
        ctrlKPressed = false;
      }, 1000); // Reset after 1 second
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      // Check for Alt+Shift+F or Shift+Alt+F 
      if ((e.altKey && e.shiftKey && (e.key === 'F' || e.key === 'f'))) {
        e.preventDefault();
        formatCode();
        return;
      }
      
      // Check for Ctrl+K followed by Ctrl+F
      if (e.ctrlKey && e.key === 'k') {
        e.preventDefault();
        ctrlKPressed = true;
        resetSequence();
        return;
      }
      
      if (ctrlKPressed && e.ctrlKey && e.key === 'f') {
        e.preventDefault();
        ctrlKPressed = false;
        formatCode();
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);  // Empty dependency array as formatCode uses ref that doesn't change

  // Function to format code using Monaco editor's formatting capabilities
  const formatCode = async () => {
    if (!editorRef.current || !monacoRef.current) return;
    
    setIsFormatting(true);
    setFormatSuccess(false);
    setNoChangesNeeded(false);
    
    try {
      const editor = editorRef.current;
      const monaco = monacoRef.current;
      const model = editor.getModel();
      
      if (!model) {
        console.error("No model available for formatting");
        setIsFormatting(false);
        return;
      }
      
      // Get language ID from the model
      const languageId = model.getLanguageId();
      console.log("Formatting code for language:", languageId);
      
      // Get the current text
      const text = model.getValue();
      
      // First try to use the built-in formatter for non-Java languages
      let formattingSuccessful = false;
      let changesNeeded = false;
      
      if (languageId !== "java") {
        try {
          // Try built-in formatter first
          const formatAction = editor.getAction('editor.action.formatDocument');
          if (formatAction) {
            // Save text before formatting to check if changes were made
            const initialText = model.getValue();
            await formatAction.run();
            const afterText = model.getValue();
            
            if (initialText !== afterText) {
              formattingSuccessful = true;
              changesNeeded = true;
            } else {
              // Built-in formatter made no changes, try our custom formatter
              changesNeeded = false;
            }
          }
        } catch (error) {
          console.warn("Built-in formatter failed:", error);
        }
      }
      
      // If built-in formatter didn't work or didn't make changes, use our custom formatter
      if (!formattingSuccessful) {
        // Format using our language-specific formatter
        const formattedText = formatCodeByLanguage(text, languageId);
        
        // Apply changes if the text actually changed
        if (text !== formattedText) {
          const edits = [{
            range: model.getFullModelRange(),
            text: formattedText
          }];
          editor.executeEdits("format", edits);
          formattingSuccessful = true;
          changesNeeded = true;
        } else {
          changesNeeded = false;
        }
      }
      
      // Show appropriate message
      setIsFormatting(false);
      
      if (!changesNeeded) {
        // Show no changes needed message
        setNoChangesNeeded(true);
        setTimeout(() => {
          setNoChangesNeeded(false);
        }, 1500);
      } else if (formattingSuccessful) {
        // Show success message
        setFormatSuccess(true);
        setTimeout(() => {
          setFormatSuccess(false);
        }, 1500);
      }
    } catch (error) {
      console.error('Error formatting code:', error);
      setIsFormatting(false);
    }
  };

  // Helper function to format Java code
  const formatJavaCode = (code: string): string => {
    if (!code.trim()) return code;
    
    let lines = code.split('\n');
    let formattedLines: string[] = [];
    let indentLevel = 0;
    let inComment = false;
    let inMultiLineString = false;
    let pendingBraceClosure = false;
    let inAnnotation = false;
    let inLambda = false;
    let methodChainDepth = 0;
    
    // Check if the line contains a specific pattern
    const hasPattern = (str: string, pattern: string): boolean => {
      const regex = new RegExp(pattern);
      return regex.test(str);
    };
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      let trimmedLine = line.trim();
      
      // Skip empty lines but preserve them
      if (!trimmedLine) {
        formattedLines.push('');
        continue;
      }
      
      // Handle multi-line comments
      if (trimmedLine.includes("/*") && !trimmedLine.includes("*/")) {
        inComment = true;
      }
      
      if (inComment) {
        formattedLines.push(line); // Preserve original indentation in comments
        if (trimmedLine.includes("*/")) {
          inComment = false;
        }
        continue;
      }
      
      // Handle multi-line strings
      if ((trimmedLine.match(/"/g) || []).length % 2 !== 0 && 
          !trimmedLine.includes("\\\"") && !inMultiLineString) {
        inMultiLineString = true;
        formattedLines.push(' '.repeat(indentLevel * 4) + trimmedLine);
        continue;
      }
      
      if (inMultiLineString) {
        formattedLines.push(' '.repeat(indentLevel * 4) + trimmedLine);
        if ((trimmedLine.match(/"/g) || []).length % 2 !== 0 && !trimmedLine.includes("\\\"")) {
          inMultiLineString = false;
        }
        continue;
      }
      
      // Handle annotations
      if (trimmedLine.startsWith("@")) {
        inAnnotation = true;
        formattedLines.push(' '.repeat(indentLevel * 4) + trimmedLine);
        
        // Check if the annotation is complete
        if (trimmedLine.endsWith(")") || !trimmedLine.includes("(")) {
          inAnnotation = false;
        }
        continue;
      }
      
      if (inAnnotation) {
        formattedLines.push(' '.repeat(indentLevel * 4) + trimmedLine);
        if (trimmedLine.endsWith(")")) {
          inAnnotation = false;
        }
        continue;
      }
      
      // Remove any inline comments for processing, but add them back later
      let inlineComment = "";
      if (trimmedLine.includes("//")) {
        const commentPos = trimmedLine.indexOf("//");
        // Make sure we're not inside a string
        const beforeComment = trimmedLine.substring(0, commentPos);
        if ((beforeComment.match(/"/g) || []).length % 2 === 0) {
          inlineComment = trimmedLine.substring(commentPos);
          trimmedLine = trimmedLine.substring(0, commentPos).trim();
          if (!trimmedLine) {
            formattedLines.push(' '.repeat(indentLevel * 4) + inlineComment);
            continue;
          }
        }
      }
      
      // Check if line ends a block before processing
      if (trimmedLine.startsWith('}') || 
          trimmedLine === "});") {
        indentLevel = Math.max(0, indentLevel - 1);
        
        // If we're exiting a lambda
        if (inLambda && trimmedLine.includes("})")) {
          inLambda = false;
        }
      }
      
      // Check for method chain endings
      if (methodChainDepth > 0 && trimmedLine.startsWith(".") === false && 
          (trimmedLine.endsWith(";") || trimmedLine.endsWith(","))) {
        indentLevel -= methodChainDepth;
        methodChainDepth = 0;
      }
      
      // Apply indentation
      const indent = ' '.repeat(indentLevel * 4);
      
      // Add inline comment back if it exists
      let lineToAdd = trimmedLine;
      if (inlineComment) {
        lineToAdd = trimmedLine + " " + inlineComment;
      }
      
      formattedLines.push(indent + lineToAdd);
      
      // Handle indentation for class, interface, enum declarations
      if (hasPattern(trimmedLine, '(class|interface|enum)\\s+\\w+') && 
          trimmedLine.endsWith("{")) {
        indentLevel++;
      }
      // Handle method declarations
      else if (hasPattern(trimmedLine, '(public|private|protected|static|final|synchronized|\\s)*\\s*[\\w<>\\[\\]]+\\s+\\w+\\s*\\(.*\\)') && 
               (trimmedLine.endsWith("{") || pendingBraceClosure)) {
        if (trimmedLine.endsWith("{")) {
          indentLevel++;
        } else if (!trimmedLine.endsWith(";")) {
          // Method declaration could be split across lines
          pendingBraceClosure = true;
        }
      }
      // Handle opening braces on their own line
      else if (trimmedLine === "{") {
        indentLevel++;
        pendingBraceClosure = false;
      }
      // Handle lambda expressions
      else if (trimmedLine.includes("->") && 
               (trimmedLine.endsWith("{") || !trimmedLine.endsWith(";"))) {
        inLambda = true;
        if (trimmedLine.endsWith("{")) {
          indentLevel++;
        }
      }
      // Handle method chaining (lines ending with dots)
      else if (trimmedLine.endsWith(".")) {
        methodChainDepth++;
        indentLevel++;
      }
      // Handle method chain continuations
      else if (trimmedLine.startsWith(".") && methodChainDepth > 0) {
        // Already indented by method chain
      }
      // Handle common Java structures
      else if ((hasPattern(trimmedLine, '(if|for|while|switch|try|catch|finally)\\s*\\(.*\\)') || 
               trimmedLine.startsWith("else")) &&
               (trimmedLine.endsWith("{") || !trimmedLine.endsWith(";"))) {
        
        if (trimmedLine.endsWith("{")) {
          indentLevel++;
        }
        // Special handling for if, for, while without braces
        else if (!trimmedLine.endsWith(";") && !trimmedLine.endsWith("}") && 
                i < lines.length - 1 && 
                !lines[i+1].trim().startsWith("{")) {
          indentLevel++;
        }
      }
      // Handle array initializations
      else if (trimmedLine.includes("= {") || 
              (trimmedLine.includes("{") && trimmedLine.includes("new "))) {
        indentLevel++;
      }
      // Handle any other opening braces
      else if ((trimmedLine.match(/{/g) || []).length > (trimmedLine.match(/}/g) || []).length) {
        indentLevel += (trimmedLine.match(/{/g) || []).length - (trimmedLine.match(/}/g) || []).length;
      }
      
      // Handle line with closing brace that also opens a new block (e.g. "} else {")
      if (trimmedLine.includes("} else") || 
          hasPattern(trimmedLine, '}\\s+(catch|finally)\\s*\\(.*\\)') ||
          trimmedLine.endsWith("} {")) {
        indentLevel++;
      }
      
      // Detect end of pending method declaration
      if (pendingBraceClosure && trimmedLine.endsWith("{")) {
        pendingBraceClosure = false;
        indentLevel++;
      }
    }
    
    return formattedLines.join('\n');
  };

  // Create a completely new basic indentation formatter
  function formatBasicIndentation(code: string, language: string): string {
    if (!code || !code.trim()) return code;
    
    // Different languages use different indentation sizes
    const tabWidth = ['python', 'java', 'c', 'cpp', 'csharp'].includes(language) ? 4 : 2;
    
    const lines = code.split('\n');
    const result: string[] = [];
    let indentLevel = 0;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Skip empty lines but preserve them
      if (!line) {
        result.push('');
        continue;
      }
      
      // Reduce indent level if line starts with closing bracket
      if (line.startsWith('}') || line.startsWith(']') || line.startsWith(')')) {
        indentLevel = Math.max(0, indentLevel - 1);
      }
      
      // Add proper indentation
      const spaces = ' '.repeat(indentLevel * tabWidth);
      result.push(spaces + line);
      
      // Increase indent level based on line content
      if (language === 'python' && line.endsWith(':')) {
        // Python uses colons to indicate blocks
        indentLevel++;
      } else {
        // For other languages, count braces
        const openBraces = (line.match(/{/g) || []).length;
        const closeBraces = (line.match(/}/g) || []).length;
        if (openBraces > closeBraces) {
          indentLevel += (openBraces - closeBraces);
        }
      }
    }
    
    return result.join('\n');
  }

  // Python-specific formatter 
  const formatPythonCode = (code: string): string => {
    let lines = code.split('\n');
    let formattedLines: string[] = [];
    let indentLevel = 0;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      let trimmedLine = line.trim();
      
      // Skip empty lines
      if (!trimmedLine) {
        formattedLines.push('');
        continue;
      }
      
      // Check for dedent
      if (trimmedLine.startsWith('except') || 
          trimmedLine.startsWith('else:') || 
          trimmedLine.startsWith('elif ') || 
          trimmedLine.startsWith('finally:')) {
        indentLevel = Math.max(0, indentLevel - 1);
      }
      
      // Apply indentation
      const indent = ' '.repeat(indentLevel * 4);
      formattedLines.push(indent + trimmedLine);
      
      // Check for indent triggers (lines ending with colon)
      if (trimmedLine.endsWith(':')) {
        indentLevel++;
      }
    }
    
    return formattedLines.join('\n');
  };

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLeftPanelExpanded, setIsLeftPanelExpanded] = useState(false);
  const [isResultsPanelFullscreen, setIsResultsPanelFullscreen] = useState(false);
  const fullscreenRef = useRef<HTMLDivElement>(null);
  const previousLeftWidthRef = useRef(50);
  const previousEditorHeightRef = useRef(70);

  // Get user session and profile picture
  const { data: session } = useSession();
  const { profilePic } = useProfilePic();

  // Fullscreen toggle handler for browser fullscreen
  const handleFullscreenToggle = () => {
    const elem = document.documentElement;
    if (!isFullscreen) {
      if (elem.requestFullscreen) {
        elem.requestFullscreen();
      } else if ((elem as any).webkitRequestFullscreen) {
        (elem as any).webkitRequestFullscreen();
      } else if ((elem as any).msRequestFullscreen) {
        (elem as any).msRequestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if ((document as any).webkitExitFullscreen) {
        (document as any).webkitExitFullscreen();
      } else if ((document as any).msExitFullscreen) {
        (document as any).msExitFullscreen();
      }
    }
  };

  // Toggle left panel to cover full width
  const toggleLeftPanelExpansion = () => {
    if (!isLeftPanelExpanded) {
      // Save current width before expanding
      previousLeftWidthRef.current = leftPanelWidth;
      // Expand left panel to full width
      setLeftPanelWidth(100);
      setIsLeftPanelExpanded(true);
    } else {
      // Restore previous width
      setLeftPanelWidth(previousLeftWidthRef.current);
      setIsLeftPanelExpanded(false);
    }
  };

  // Toggle the results panel to fullscreen mode
  const toggleResultsPanelFullscreen = () => {
    if (!isResultsPanelFullscreen) {
      // Save the current editor height before going fullscreen
      previousEditorHeightRef.current = editorHeight;
      // Make results panel take up the full right panel
      setEditorHeight(0);
      setIsResultsPanelFullscreen(true);
    } else {
      // Restore previous editor height
      setEditorHeight(previousEditorHeightRef.current);
      setIsResultsPanelFullscreen(false);
    }
  };

  // Listen for fullscreen change events
  useEffect(() => {
    const handleChange = () => {
      setIsFullscreen(!!(
        document.fullscreenElement ||
        (document as any).webkitFullscreenElement ||
        (document as any).msFullscreenElement
      ));
    };
    document.addEventListener("fullscreenchange", handleChange);
    document.addEventListener("webkitfullscreenchange", handleChange);
    document.addEventListener("msfullscreenchange", handleChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleChange);
      document.removeEventListener("webkitfullscreenchange", handleChange);
      document.removeEventListener("msfullscreenchange", handleChange);
    };
  }, []);

  const [results, setResults] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<string>("sample");
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [executionMessage, setExecutionMessage] = useState<string>("");
  const [executionStatus, setExecutionStatus] = useState<"success" | "error" | "warning" | "info" | null>(null);
  const [loadingPhrase, setLoadingPhrase] = useState<string>("");
  const [showEvaluatingSkeletons, setShowEvaluatingSkeletons] = useState<boolean>(false);
  const [skeletonTab, setSkeletonTab] = useState<"sample" | "hidden" | null>(null);
  const [loadingProgress, setLoadingProgress] = useState<number>(0);
  const [sampleTestResults, setSampleTestResults] = useState<any[]>([]);
  const [hiddenTestResults, setHiddenTestResults] = useState<any[]>([]);
  const [sampleExecutionStatus, setSampleExecutionStatus] = useState<"success" | "error" | "warning" | "info" | null>(null);
  const [hiddenExecutionStatus, setHiddenExecutionStatus] = useState<"success" | "error" | "warning" | "info" | null>(null);
  
  // New state variables for testcase progress tracking
  const [totalHiddenTestcases, setTotalHiddenTestcases] = useState<number>(0);
  const [completedHiddenTestcases, setCompletedHiddenTestcases] = useState<number>(0);
  const [passedHiddenTestcases, setPassedHiddenTestcases] = useState<number>(0);
  const [executingHiddenTestcases, setExecutingHiddenTestcases] = useState<boolean>(false);
  const [hiddenTestcasesFailed, setHiddenTestcasesFailed] = useState<boolean>(false);
  const [skippedHiddenTestcases, setSkippedHiddenTestcases] = useState<number>(0);
  const [showCelebration, setShowCelebration] = useState<boolean>(false);
  
  // Replace Gen Z loading phrases with compilation stages
  const compilationStages = [
    "Analyzing your code...",
    "Compiling...",
    "Optimizing...",
    "Preparing test cases...",
    "Running tests...",
    "Processing results...",
    "Finalizing evaluation..."
  ];

  // Add the GraphQL mutations
  const [runCodeMutation] = useMutation(RUN_CODE);
  const [submitCodeMutation] = useMutation(SUBMIT_CODE);
  const [saveUserCodeDraft] = useMutation(SAVE_USER_CODE_DRAFT);
  const [saveUserProblemSettings] = useMutation(SAVE_USER_PROBLEM_SETTINGS);

  // Track previous language for code draft saving
  const prevLanguageRef = useRef(language);

  // Add the saveDraftIfChanged function
  const saveDraftIfChanged = useCallback((languageToSave: string, codeToSave: string) => {
    if (authStatus === 'authenticated' && authSession?.user?.id && problemId) {
      const baseKey = `nexacademy_${authSession.user.id}_${problemId}_${languageToSave}`;
      const draftKey = `${baseKey}_draft`;
      const localCode = localStorage.getItem(baseKey) || '';
      const draftCode = localStorage.getItem(draftKey) || '';
      if (localCode !== draftCode) {
        saveUserCodeDraft({
          variables: {
            input: {
              userId: String(authSession.user.id),
              problemId: String(problemId),
              language: String(languageToSave),
              code: String(codeToSave),
            }
          }
        })
        .then(() => {
          localStorage.setItem(draftKey, codeToSave);
        })
        .catch(err => {
          console.error('Failed to save code draft:', err);
        });
      }
    }
  }, [authStatus, authSession, problemId, saveUserCodeDraft]);

  // Add the runCode and submitCode functions
  const runCode = async () => {
    // Only save draft if local and draft differ
    if (authStatus === 'authenticated' && authSession?.user?.id && problemId) {
      const baseKey = `nexacademy_${authSession.user.id}_${problemId}_${language}`;
      const draftKey = `${baseKey}_draft`;
      const localCode = localStorage.getItem(baseKey) || '';
      const draftCode = localStorage.getItem(draftKey) || '';
      if (localCode !== draftCode) {
        saveDraftIfChanged(language, code);
      }
    }
    try {
      // Make results panel fullscreen when running code
      if (!isResultsPanelFullscreen) {
        toggleResultsPanelFullscreen();
      }
      
      // Switch to results tab on mobile
      if (isMobile) {
        setActivePanel("results");
      }
      
      setIsRunning(true);
      setExecutionMessage("Running code...");
      setExecutionStatus("info");
      setSampleExecutionStatus("info");
      setActiveTab("sample");
      setShowEvaluatingSkeletons(true);
      setSkeletonTab("sample"); // Only show skeletons in sample tab
      
      // Set a static loading phrase instead of cycling through stages
      setLoadingPhrase("Executing the code...");
      
      console.log("Selected language:", language);
      console.log("Language name from JUDGE0_LANGUAGES:", JUDGE0_LANGUAGES[language as keyof typeof JUDGE0_LANGUAGES]);
      const langId = getLanguageId(language);
      console.log("Language ID for execution:", langId);

      const response = await runCodeMutation({
        variables: {
          input: {
            sourceCode: code,
            languageId: langId,
            problemId: codingQuestion.questionId
          }
        }
      });

      // Delay hiding the skeleton to ensure smooth transition
      setTimeout(() => {
        // Clear the loading animation
        setLoadingPhrase("");
        setLoadingProgress(0);
        setShowEvaluatingSkeletons(false);
        setSkeletonTab(null);
        setIsRunning(false);

        if (response.data?.runCode) {
          const { success, message, results, allTestsPassed } = response.data.runCode;
          
          // Store results only in sample tab results
          setResults(results || []);
          setSampleTestResults(results || []);
          
          // Determine correct status based on test results
          let newStatus: "success" | "error" | "warning" | "info" = "error";
          if (success) {
            if (allTestsPassed) {
              newStatus = "success";
            } else {
              // Check if at least one test case passed
              const hasPassingTests = results && results.some((r: any) => r.isCorrect);
              newStatus = hasPassingTests ? "warning" : "error";
            }
          }
          
          setExecutionMessage(message || (success ? "Code executed successfully" : "Execution failed"));
          setExecutionStatus(newStatus);
          setSampleExecutionStatus(newStatus);
        } else {
          setExecutionMessage("Failed to run code. Please try again.");
          setExecutionStatus("error");
          setSampleExecutionStatus("error");
        }
      }, 800); // Add small delay for smoother transition
    } catch (error: any) {
      console.error("Error running code:", error);
      setExecutionMessage(`Error: ${error.message}`);
      setExecutionStatus("error");
      setSampleExecutionStatus("error");
      setLoadingPhrase("");
      setLoadingProgress(0);
      setShowEvaluatingSkeletons(false);
      setSkeletonTab(null);
      setIsRunning(false);
    }
  };

  // Update the submitCode function to also check for partially passing tests correctly
  const submitCode = async () => {
    // Only save draft if local and draft differ
    if (authStatus === 'authenticated' && authSession?.user?.id && problemId) {
      const baseKey = `nexacademy_${authSession.user.id}_${problemId}_${language}`;
      const draftKey = `${baseKey}_draft`;
      const localCode = localStorage.getItem(baseKey) || '';
      const draftCode = localStorage.getItem(draftKey) || '';
      if (localCode !== draftCode) {
        saveDraftIfChanged(language, code);
      }
    }
    try {
      // Make results panel fullscreen when submitting code
      if (!isResultsPanelFullscreen) {
        toggleResultsPanelFullscreen();
      }
      
      // Switch to results tab on mobile
      if (isMobile) {
        setActivePanel("results");
      }
      
      setIsSubmitting(true);
      setExecutionMessage("Submitting solution...");
      setExecutionStatus("info");
      setHiddenExecutionStatus("info");
      setActiveTab("hidden"); // Make sure we switch to the hidden testcases tab
      
      // Just show the executing state without any count information yet
      setExecutingHiddenTestcases(true);
      setShowCelebration(false);
      setHiddenTestResults([]);
      
      // Reset all counter variables to ensure the UI shows 0/total at the beginning
      setCompletedHiddenTestcases(0);
      setPassedHiddenTestcases(0);
      setHiddenTestcasesFailed(false);
      setSkippedHiddenTestcases(0);
      
      // Set a static loading phrase
      setLoadingPhrase("Executing the code...");
      
      console.log("Selected language for submission:", language);
      console.log("Language name from JUDGE0_LANGUAGES:", JUDGE0_LANGUAGES[language as keyof typeof JUDGE0_LANGUAGES]);
      const langId = getLanguageId(language);
      console.log("Language ID for submission:", langId);

      // Request to execute all testcases in parallel
      const response = await submitCodeMutation({
        variables: {
          input: {
            sourceCode: code,
            languageId: langId,
            problemId: codingQuestion.questionId,
            executeInParallel: true // Signal the server to use parallel execution
          }
        }
      });

      if (response.data?.submitCode) {
        const { success, message, results, allTestsPassed, totalTests } = response.data.submitCode;
        
        // Log the results for debugging
        console.log("API Response results:", results);
        console.log("Skipped test cases:", results.filter((r: any) => 
          r.isSkipped || r.verdict === "Skipped" || (r.status && r.status.description === "Skipped")
        ));
        console.log("Failed test cases:", results.filter((r: any) => 
          !r.isCorrect && 
          !r.isSkipped && 
          r.verdict !== "Skipped" && 
          (!r.status || r.status.description !== "Skipped")
        ));
        
        // Now that we have the response, set the total number of testcases
        setTotalHiddenTestcases(totalTests || results?.length || 0);
        
        if (success && results && results.length > 0) {
          // Simulation for UI purposes only - the server has already executed all testcases in parallel
          const processTestcases = async () => {
            let passedCount = 0;
            const processedResults = [];
            
            // Count and store passing testcases first
            const passingTestcases = results.filter((r: any) => r.isCorrect);
            const skippedTestcases = results.filter((r: any) => 
              r.isSkipped || r.verdict === "Skipped" || (r.status && r.status.description === "Skipped")
            );
            // Update each test case with explicit isSkipped flag if it's missing
            const processedSkippedTestcases = skippedTestcases.map((r: any) => ({
              ...r,
              isSkipped: true
            }));
            
            const failingTestcases = results.filter((r: any) => 
              !r.isCorrect && 
              !r.isSkipped && 
              r.verdict !== "Skipped" && 
              (!r.status || r.status.description !== "Skipped")
            );
            
            passedCount = passingTestcases.length;
            const hasFailures = failingTestcases.length > 0;
            
            // Determine which test cases were processed vs. skipped
            const processedIds = new Set([
              ...passingTestcases.map((r: any) => r.id),
              ...failingTestcases.map((r: any) => r.id)
            ]);
            
            // Create additional skipped test case placeholders if we're missing some
            const manuallySkippedTestcases = totalTests > (processedIds.size + processedSkippedTestcases.length) ? 
              Array.from({ length: totalTests - (processedIds.size + processedSkippedTestcases.length) }).map((_, idx) => ({
                id: `skipped-${idx}`,
                input: "",
                expectedOutput: "",
                actualOutput: null,
                stderr: null,
                compileOutput: null,
                status: { id: 0, description: "Skipped" },
                verdict: "Skipped",
                isCorrect: false,
                isSkipped: true,
                executionTime: null,
                memoryUsed: null
              })) : [];
            
            // If there are failures, show the first failing test case first
            if (hasFailures) {
              // Show just the first failing test case with a slight delay for visual feedback
              await new Promise(resolve => setTimeout(resolve, 150));
              
              const failedResult = failingTestcases[0];
              processedResults.push(failedResult);
              
              // Update progress counters
              setCompletedHiddenTestcases(1);
              setHiddenTestcasesFailed(true);
              
              // Update the UI with the failed result 
              setHiddenTestResults([...processedResults]);
              
              // Then show passing test cases
              for (let i = 0; i < passingTestcases.length; i++) {
                await new Promise(resolve => setTimeout(resolve, 100));
                
                const result = passingTestcases[i];
                processedResults.push(result);
                
                // Update progress counters
                setCompletedHiddenTestcases(i + 2); // +2 because we already showed 1 failing test
                setPassedHiddenTestcases(i + 1);
                
                // Update the UI with the current results
                setHiddenTestResults([...processedResults]);
              }
              
              // Finally add any remaining failing test cases (without detailed info)
              if (failingTestcases.length > 1) {
                for (let i = 1; i < failingTestcases.length; i++) {
                  await new Promise(resolve => setTimeout(resolve, 100));
                  
                  const failedResult = { 
                    ...failingTestcases[i],
                    // Hide detailed output for secondary failures
                    actualOutput: "Hidden (Multiple failures detected)",
                    stderr: null,
                    compileOutput: null
                  };
                  processedResults.push(failedResult);
                  
                  // Update progress counters
                  setCompletedHiddenTestcases(passingTestcases.length + i + 1);
                  
                  // Update the UI
                  setHiddenTestResults([...processedResults]);
                }
              }
              
              // Add any skipped test cases
              if (processedSkippedTestcases.length > 0 || manuallySkippedTestcases.length > 0) {
                await new Promise(resolve => setTimeout(resolve, 100));
                
                // Add API-marked skipped tests first
                if (processedSkippedTestcases.length > 0) {
                  processedResults.push(...processedSkippedTestcases);
                }
                
                // Then add any manually created placeholders
                if (manuallySkippedTestcases.length > 0) {
                  processedResults.push(...manuallySkippedTestcases);
                }
                
                setCompletedHiddenTestcases(processedResults.length);
                setSkippedHiddenTestcases(processedSkippedTestcases.length + manuallySkippedTestcases.length);
                setHiddenTestResults([...processedResults]);
              }
              
              // Show the failure message
              const newStatus: "success" | "error" | "warning" | "info" = passedCount > 0 ? "warning" : "error";
              const skippedCount = processedSkippedTestcases.length + manuallySkippedTestcases.length;
              const failedCount = failingTestcases.length;
              
              let statusMessage = `Execution stopped after first failure. ${passedCount}/${totalTests} passed.`;
              if (failedCount > 0) statusMessage += ` ${failedCount} failed.`;
              if (skippedCount > 0) statusMessage += ` ${skippedCount} skipped.`;
              
              setExecutionMessage(statusMessage);
              setExecutionStatus(newStatus);
              setHiddenExecutionStatus(newStatus);
            } else {
              // All tests passed
              // Show all passing test cases
              for (let i = 0; i < passingTestcases.length; i++) {
                // Simulate a slight delay for visual feedback
                await new Promise(resolve => setTimeout(resolve, 100));
                
                const result = passingTestcases[i];
                processedResults.push(result);
                
                // Update progress counters
                setCompletedHiddenTestcases(i + 1);
                setPassedHiddenTestcases(i + 1);
                
                // Update the UI with the current results
                setHiddenTestResults([...processedResults]);
              }
              
              setExecutionMessage(`All ${totalTests} test cases passed!`);
              setExecutionStatus("success");
              setHiddenExecutionStatus("success");
              setShowCelebration(true);
              // Trigger confetti celebration
              triggerConfettiCelebration();
            }
            
            // All testcases complete
            setExecutingHiddenTestcases(false);
            setIsSubmitting(false);
          };
          
          // Start processing testcases
          processTestcases();
        } else {
          setExecutingHiddenTestcases(false);
          setIsSubmitting(false);
          setExecutionMessage(message || "Failed to submit code.");
          setExecutionStatus("error");
          setHiddenExecutionStatus("error");
        }
      } else {
        setExecutingHiddenTestcases(false);
        setIsSubmitting(false);
        setExecutionMessage("Failed to submit code. Please try again.");
        setExecutionStatus("error");
        setHiddenExecutionStatus("error");
      }
    } catch (error: any) {
      console.error("Error submitting code:", error);
      setExecutingHiddenTestcases(false);
      setIsSubmitting(false);
      setExecutionMessage(`Error: ${error.message}`);
      setExecutionStatus("error");
      setHiddenExecutionStatus("error");
      setLoadingPhrase("");
      setLoadingProgress(0);
      setShowEvaluatingSkeletons(false);
      setSkeletonTab(null);
    }
  };
  
  // Confetti celebration trigger
  const triggerConfettiCelebration = () => {
    // Ultra-premium color scheme with metallic/luxury colors
    const luxuryColors = ['#FFD700', '#E0BF00', '#B8860B', '#DAA520', '#9370DB', '#FFFFFF'];
    const accentColors = ['#4B0082', '#9932CC', '#8A2BE2', '#FF1493', '#00BFFF'];
    // Custom shapes for confetti
    // @ts-ignore - Ignore the shape type mismatch
    const shapeOptions = ['square', 'circle'];

    // Helper to patch all confetti canvases
    const patchConfettiCanvas = () => {
      // canvas-confetti appends canvases to body
      document.querySelectorAll('canvas').forEach((c) => {
        // Only patch if it's a confetti canvas (zIndex or style)
        if (c.style && (c.style.zIndex === '200' || c.className.includes('confetti'))) {
          c.style.pointerEvents = 'none';
        }
      });
    };

    // Phase 1: Initial golden shower from top (sparse but elegant)
    const createGoldenShower = () => {
      confetti({
        particleCount: 35,
        angle: 90,
        spread: 100,
        origin: { x: 0.5, y: 0 },
        colors: luxuryColors,
        // @ts-ignore - Ignore the shape type mismatch 
        shapes: shapeOptions,
        gravity: 0.65,
        scalar: 1.5,
        drift: 0.5,
        ticks: 200,
        flat: true,
        zIndex: 200,
        disableForReducedMotion: true
      });
      setTimeout(patchConfettiCanvas, 50);
    };

    // Phase 2: Elegant side bursts for dimension
    const createSideBursts = () => {
      // Left side
      confetti({
        particleCount: 10,
        angle: 60,
        spread: 25,
        origin: { x: 0, y: 0.5 },
        colors: accentColors,
        // @ts-ignore - Ignore the shape type mismatch
        shapes: shapeOptions,
        gravity: 0.4,
        scalar: 1.3,
        ticks: 400
      });
      setTimeout(patchConfettiCanvas, 50);
      // Right side
      setTimeout(() => {
        confetti({
          particleCount: 10,
          angle: 120,
          spread: 25,
          origin: { x: 1, y: 0.5 },
          colors: accentColors,
          // @ts-ignore - Ignore the shape type mismatch
          shapes: shapeOptions,
          gravity: 0.4,
          scalar: 1.3,
          ticks: 400
        });
        setTimeout(patchConfettiCanvas, 50);
      }, 150);
    };

    // Gentle rain effect
    const createGentleRain = () => {
      const interval = setInterval(() => {
        confetti({
          particleCount: 15,
          angle: 90,
          spread: 180,
          origin: { x: Math.random(), y: 0 },
          colors: [...luxuryColors, ...accentColors],
          // @ts-ignore - Ignore the shape type mismatch
          shapes: shapeOptions,
          gravity: 0.6,
          scalar: 1.4,
          drift: 0.2,
          ticks: 400
        });
        setTimeout(patchConfettiCanvas, 50);
      }, 300);
      // Clear the interval after a few seconds
      setTimeout(() => clearInterval(interval), 2000);
    };

    // Execute celebration effects in sequence
    createGoldenShower();
    setTimeout(() => {
      createSideBursts();
    }, 200);
    setTimeout(() => {
      createGentleRain();
    }, 500);
    // Patch again after all effects
    setTimeout(patchConfettiCanvas, 2500);
  };

  // Add helper function to parse language ID
  const parseLanguageId = (languageName: string): number => {
    // Find the language ID from JUDGE0_LANGUAGES
    const entry = Object.entries(JUDGE0_LANGUAGES).find(([_, name]) => 
      name === languageName || name.includes(languageName)
    );
    
    return entry ? parseInt(entry[0], 10) : 71; // Default to Python 3 (ID 71) if not found
  };

  // Additional state for submissions tab
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [submissionsLoading, setSubmissionsLoading] = useState(false);
  const [submissionsError, setSubmissionsError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize] = useState(5);
  const [submissionsTabActive, setSubmissionsTabActive] = useState(false);
  
  // State to track if the submissions tab has been loaded at least once
  const [submissionsInitialized, setSubmissionsInitialized] = useState(false);
  
  // Fetch submissions when the submissions tab becomes active
  const fetchSubmissions = useCallback(async (page = 1, size = pageSize) => {
    if (!submissionsTabActive || !session?.user?.id) return;
    
    try {
      // Set loading state and clear error
      setSubmissionsLoading(true);
      setSubmissionsError(null);
      
      // Clear existing submissions while loading to provide better UX
      setSubmissions([]);
      
      // Log the entire coding question object to inspect its structure
      console.log('Coding question object:', codingQuestion);
      
      // Determine the correct problem ID to use - add fallbacks for backward compatibility
      const problemId = codingQuestion.questionId || codingQuestion.id;
      console.log('Using problemId:', problemId);
      
      console.log('Fetching submissions with params:', {
        problemId,
        userId: session.user.id,
        page,
        pageSize: size
      });
      
      try {
        const data = await submissionService.getProblemSubmissions({
          problemId,
          userId: session.user.id,
          page,
          pageSize: size
        });
        
        console.log('Submissions response:', data);
        
        if (data && data.submissions) {
          setSubmissions(data.submissions);
          setTotalPages(data.totalPages);
          setCurrentPage(data.page);
        } else {
          console.warn('Received empty or invalid response from submissions API');
          setSubmissionsError('Failed to load submissions. Empty or invalid response received.');
          setSubmissions([]);
        }
      } catch (apiError: any) {
        console.error('API error while fetching submissions:', apiError);
        
        // Attempt to extract GraphQL error message if available
        let errorMessage = 'Failed to load submissions. Please try again.';
        if (apiError.graphQLErrors && apiError.graphQLErrors.length > 0) {
          errorMessage = `GraphQL error: ${apiError.graphQLErrors[0].message}`;
        } else if (apiError.networkError) {
          errorMessage = `Network error: ${apiError.networkError.message}`;
        } else if (apiError.message) {
          errorMessage = apiError.message;
        }
        
        setSubmissionsError(errorMessage);
        setSubmissions([]);
      }
    } catch (error) {
      console.error('Error in fetchSubmissions:', error);
      setSubmissionsError('Failed to load submissions. Please try again.');
      setSubmissions([]);
    } finally {
      setSubmissionsLoading(false);
    }
  }, [submissionsTabActive, session?.user?.id, codingQuestion, pageSize]);
  
  // Handle tab change to load submissions when the tab becomes active
  const handleTabChange = (value: string) => {
    saveDraftIfChanged(language, code);
    if (value === 'submissions') {
      setSubmissionsTabActive(true);
    } else {
      setSubmissionsTabActive(false);
    }
  };

  // Monitor submissionsTabActive state to fetch submissions automatically
  useEffect(() => {
    if (submissionsTabActive && session?.user?.id && !submissionsInitialized) {
      console.log('Auto-fetching submissions for the first time');
      fetchSubmissions(1);
      setSubmissionsInitialized(true);
    }
  }, [submissionsTabActive, session?.user?.id, fetchSubmissions, submissionsInitialized]);

  // Helper functions for submissions
  const renderSubmissionStatus = (submission: any) => {
    const status = submission.status;
    const testcaseInfo = submission.testcasesPassed !== undefined && submission.totalTestcases !== undefined 
      ? `(${submission.testcasesPassed}/${submission.totalTestcases})` 
      : '';
    
    switch (status) {
      case 'ACCEPTED':
  return (
          <>
            <div className="flex-shrink-0 h-7 w-7 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <CheckCircle className="h-4 w-4 text-green-500 dark:text-green-400" />
            </div>
            <div className="ml-2">
              <div className="text-sm font-medium text-green-600 dark:text-green-400">Accepted</div>
              {testcaseInfo && <div className="text-xs text-slate-500 dark:text-slate-400">{testcaseInfo}</div>}
            </div>
          </>
        );
      case 'FAILED':
      case 'WRONG_ANSWER':
        return (
          <>
            <div className="flex-shrink-0 h-7 w-7 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
              <XCircle className="h-4 w-4 text-red-500 dark:text-red-400" />
            </div>
            <div className="ml-2">
              <div className="text-sm font-medium text-red-600 dark:text-red-400">Failed</div>
              {testcaseInfo && <div className="text-xs text-slate-500 dark:text-slate-400">{testcaseInfo}</div>}
            </div>
          </>
        );
      case 'TIME_LIMIT_EXCEEDED':
        return (
          <>
            <div className="flex-shrink-0 h-7 w-7 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
              <Clock className="h-4 w-4 text-yellow-500 dark:text-yellow-400" />
            </div>
            <div className="ml-2">
              <div className="text-sm font-medium text-yellow-600 dark:text-yellow-400">Time Limit Exceeded</div>
              {testcaseInfo && <div className="text-xs text-slate-500 dark:text-slate-400">{testcaseInfo}</div>}
            </div>
          </>
        );
      case 'RUNTIME_ERROR':
        return (
          <>
            <div className="flex-shrink-0 h-7 w-7 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
              <AlertTriangle className="h-4 w-4 text-orange-500 dark:text-orange-400" />
            </div>
            <div className="ml-2">
              <div className="text-sm font-medium text-orange-600 dark:text-orange-400">Runtime Error</div>
              {testcaseInfo && <div className="text-xs text-slate-500 dark:text-slate-400">{testcaseInfo}</div>}
            </div>
          </>
        );
      case 'COMPILATION_ERROR':
        return (
          <>
            <div className="flex-shrink-0 h-7 w-7 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
              <AlertCircle className="h-4 w-4 text-purple-500 dark:text-purple-400" />
            </div>
            <div className="ml-2 text-sm font-medium text-purple-600 dark:text-purple-400">Compilation Error</div>
          </>
        );
      default:
        return (
          <>
            <div className="flex-shrink-0 h-7 w-7 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
              <HelpCircle className="h-4 w-4 text-slate-500 dark:text-slate-400" />
            </div>
            <div className="ml-2 text-sm font-medium text-slate-500 dark:text-slate-400">{status || 'Unknown'}</div>
          </>
        );
    }
  };

  const getLanguageColor = (language: string) => {
    const colors: Record<string, string> = {
      'JavaScript': 'bg-yellow-500',
      'TypeScript': 'bg-blue-500',
      'Python': 'bg-green-500',
      'Java': 'bg-red-500',
      'C++': 'bg-purple-500',
      'C': 'bg-gray-500',
      'C#': 'bg-indigo-500',
      'Go': 'bg-teal-500',
      'Ruby': 'bg-pink-500',
      'Swift': 'bg-orange-500',
      'PHP': 'bg-violet-500',
      'Rust': 'bg-amber-500'
    };
    
    return colors[language] || 'bg-slate-500';
  };

  // Add helper function to convert language ID to language name
  const getLanguageNameFromId = (languageId: string) => {
    if (!languageId) return "Unknown";
    
    // If languageId is a language name rather than an ID
    if (isNaN(Number(languageId))) return languageId;
    
    // Check if the ID exists in JUDGE0_LANGUAGES
    const fullName = JUDGE0_LANGUAGES[languageId as keyof typeof JUDGE0_LANGUAGES];
    if (fullName) {
      return parseLanguageName(fullName).name;
    }
    
    return "Unknown";
  };

  const formatSubmissionDate = (dateString: string | Date | number | null | undefined) => {
    if (!dateString) return 'Unknown date';
    
    // Handle Unix timestamps (in milliseconds)
    let date: Date;
    if (typeof dateString === 'number' || !isNaN(Number(dateString))) {
      date = new Date(Number(dateString));
    } else {
      date = new Date(dateString);
    }
    
    // Check if date is valid
    if (isNaN(date.getTime())) return 'Unknown date';
    
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) {
      return 'just now';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} hour${hours === 1 ? '' : 's'} ago`;
    } else if (diffInSeconds < 2592000) {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days} day${days === 1 ? '' : 's'} ago`;
    } else {
      return date.toLocaleDateString();
    }
  };
  
  const viewSubmissionDetails = (submission: any, e?: React.MouseEvent) => {
    // If called from an event handler for a button inside a row, stop propagation
    if (e) e.stopPropagation();
    setSelectedSubmission(submission);
  };
  
  const closeSubmissionDetails = () => {
    setSelectedSubmission(null);
  };
  
  const loadSubmissionCode = (submission: any, e?: React.MouseEvent) => {
    // If called from an event handler for a button inside a row, stop propagation
    if (e) e.stopPropagation();
    
    // Load the submission code into editor
    setCode(submission.code || '');
    
    // Handle the language ID - if it's a number, use it directly
    // If not, fall back to defaultLanguage
    const langId = submission.language && !isNaN(Number(submission.language))
      ? submission.language 
      : defaultLanguage;
    
    setLanguage(langId);
    
    // Switch to code editor panel
    if (isMobile) {
      setActivePanel("code");
    }
    
    // Get full language name for toast
    const fullLangName = JUDGE0_LANGUAGES[submission.language as keyof typeof JUDGE0_LANGUAGES] || "Unknown";
    
    // Show a success toast
    toast({
      title: "Code loaded",
      description: `Loaded ${fullLangName} code from ${formatSubmissionDate(submission.submittedAt)} submission`,
    });
  };

  // State for selected submission details view
  const [selectedSubmission, setSelectedSubmission] = useState<any>(null)

  // Get Monaco Editor language from Judge0 language
  const getMonacoLanguage = (languageName: string): string => {
    if (!languageName) return 'plaintext';
    
    const languageMap: Record<string, string> = {
      'Java': 'java',
      'C': 'c',
      'C++': 'cpp',
      'Python': 'python',
      'JavaScript': 'javascript',
      'TypeScript': 'typescript',
      'Go': 'go',
      'Ruby': 'ruby',
      'PHP': 'php',
      'Rust': 'rust',
      'C#': 'csharp',
      'Swift': 'swift',
      'Kotlin': 'kotlin',
      'Scala': 'scala',
      'Objective-C': 'objective-c',
      'R': 'r',
      'Perl': 'perl',
      'Haskell': 'haskell',
      'Lua': 'lua',
      'Assembly': 'asm'
    };

    const normalizedName = languageName.split(' ')[0];
    return languageMap[normalizedName] || 'plaintext';
  };

  // Custom setLanguage handler to save code draft and update problem setting
  const handleLanguageChange = useCallback((newLanguage: string) => {
    // 1. Capture previous language and code before any state changes
    const prevLanguage = prevLanguageRef.current;
    const prevCode = code;

    // 2. Save code draft and lastLanguage as before (for prevLanguage)
    if (authStatus === 'authenticated' && authSession?.user?.id && problemId) {
      console.log(`[SAVE] Previous language: ${prevLanguage}, new language: ${newLanguage}`);
      console.log(`[SAVE] Saving previous code to previous language key`);
      const baseKey = `nexacademy_${authSession.user.id}_${problemId}_${prevLanguage}`;
      const draftKey = `${baseKey}_draft`;
      const localCode = localStorage.getItem(baseKey) || '';
      const draftCode = localStorage.getItem(draftKey) || '';
      // Save to localStorage for prevLanguage only
      localStorage.setItem(baseKey, prevCode);
      localStorage.setItem(`${baseKey}_timestamp`, Date.now().toString());
      // Only call mutation if code changed
      if (
        authSession.user.id &&
        problemId &&
        prevLanguage &&
        prevCode !== undefined &&
        localCode !== draftCode
      ) {
        saveUserCodeDraft({
          variables: {
            input: {
              userId: String(authSession.user.id),
              problemId: String(problemId),
              language: String(prevLanguage),
              code: String(prevCode),
            }
          }
        })
        .then(() => {
          localStorage.setItem(draftKey, prevCode);
        })
        .catch(err => {
          console.error('Failed to save code draft:', err);
        });
      }
      // Optionally clean up anonymous data for this problem/language
      const anonymousKey = `nexacademy_anonymous_${problemId}_${prevLanguage}`;
      if (localStorage.getItem(anonymousKey)) {
        localStorage.removeItem(anonymousKey);
        localStorage.removeItem(`${anonymousKey}_timestamp`);
      }
      saveUserProblemSettings({
        variables: {
          input: {
            userId: String(authSession.user.id),
            problemId: String(problemId),
            lastLanguage: newLanguage,
          }
        }
      }).catch(err => {
        console.error('Failed to save user problem settings:', err);
      });
    } else if (problemId && prevLanguage && prevCode !== undefined) {
      // Not authenticated, save to anonymous localStorage for prevLanguage only
      const anonymousKey = `nexacademy_anonymous_${problemId}_${prevLanguage}`;
      localStorage.setItem(anonymousKey, prevCode);
      localStorage.setItem(`${anonymousKey}_timestamp`, Date.now().toString());
    }

    // 3. Now update prevLanguageRef and setLanguage
    prevLanguageRef.current = newLanguage;
    setLanguage(newLanguage);

    // 4. Start loading for the new language
    setEditorLoading(true);
    latestLanguageRequestRef.current = newLanguage;

    // 5. Load code for the new language (DB > localStorage > preloadCode)
    (async () => {
      let loadedCode = '';
      let found = false;
      console.log(`Starting language switch to: ${newLanguage}`);
      if (authStatus === 'authenticated' && authSession?.user?.id && problemId) {
        try {
          console.log(`Checking database for language: ${newLanguage}`);
          const { data: draftData } = await client.query({
            query: GET_USER_CODE_DRAFT,
            variables: { userId: authSession.user.id, problemId, language: newLanguage },
            fetchPolicy: 'network-only',
          });
          if (draftData?.getUserCodeDraft?.code) {
            loadedCode = draftData.getUserCodeDraft.code;
            found = true;
            console.log('Found code in DB, using it');
          } else {
            console.log('No code found in DB');
          }
        } catch (err) {
          console.error('Error fetching from DB:', err);
        }
      }
      if (!found) {
        // Try localStorage
        const userKey = authStatus === 'authenticated' && authSession?.user?.id
          ? `nexacademy_${authSession.user.id}_${problemId}_${newLanguage}`
          : `nexacademy_anonymous_${problemId}_${newLanguage}`;
        const localCode = localStorage.getItem(userKey) || '';
        if (localCode) {
          loadedCode = localCode;
          found = true;
          console.log('Using localStorage code');
        } else {
          console.log('No code found in localStorage');
        }
      }
      if (!found) {
        console.log('dddd',)
        // Fallback to preloadCode for the new language from languageOptions
        const langOption = codingQuestion.languageOptions?.find(
          (opt: any) => String(opt.language) === String(newLanguage)
        );
        console.log(`langOption: ${langOption}`);
        loadedCode = langOption?.preloadCode || '';
        console.log(`Final loadedCode (fallback): ${loadedCode ? `length=${loadedCode.length}` : 'empty'}`);
      }
      // Only update if this is still the latest requested language
      if (latestLanguageRequestRef.current === newLanguage) {
        setCode(loadedCode);
        setEditorLoading(false);
      }
    })();
  }, [authStatus, authSession, problemId, code, saveUserCodeDraft, saveUserProblemSettings, client, codingQuestion.languageOptions]);

  // Save code to localStorage on each keystroke (for current language only)
  useEffect(() => {
    if (!code || !problemId || !language || editorLoading) return;
    if (authStatus === 'authenticated' && authSession?.user?.id) {
      const userStorageKey = `nexacademy_${authSession.user.id}_${problemId}_${language}`;
      localStorage.setItem(userStorageKey, code);
      localStorage.setItem(`${userStorageKey}_timestamp`, Date.now().toString());
      // Optionally clean up any anonymous data for this problem/language
      const anonymousKey = `nexacademy_anonymous_${problemId}_${language}`;
      if (localStorage.getItem(anonymousKey)) {
        localStorage.removeItem(anonymousKey);
        localStorage.removeItem(`${anonymousKey}_timestamp`);
      }
    } else {
      const anonymousKey = `nexacademy_anonymous_${problemId}_${language}`;
      localStorage.setItem(anonymousKey, code);
      localStorage.setItem(`${anonymousKey}_timestamp`, Date.now().toString());
    }
  }, [code, problemId, language, authStatus, authSession, editorLoading]);

  // Save draft on page unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      saveDraftIfChanged(language, code);
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [language, code, saveDraftIfChanged]);

  // Add a ref to track whether initial code has been loaded
  const initialLoadCompletedRef = useRef(false);

  useEffect(() => {
    // Only run on mount when user is authenticated AND we haven't loaded initial code yet
    if (authStatus !== 'authenticated' || !authSession || !authSession.user || !authSession.user.id || !problemId || initialLoadCompletedRef.current) return;

    let isMounted = true;

    async function loadInitialCode() {
      try {
        // Mark as loaded to prevent duplicate calls
        initialLoadCompletedRef.current = true;
        // Need to check again inside the function
        if (!authSession || !authSession.user || !authSession.user.id) return;
        const userId = authSession.user.id;
        let langToCheck = null;
        let codeFromDB = null;
        let dbUpdatedAt = null;
        // 1. Try to get lastLanguage from UserProblemSettings
        try {
          const { data: settingsData } = await client.query({
            query: GET_USER_PROBLEM_SETTINGS,
            variables: { userId, problemId },
            fetchPolicy: 'network-only',
          });
          langToCheck = settingsData?.getUserProblemSettings?.lastLanguage || processDefaultLanguage(defaultLanguage);
        } catch (err) {
          langToCheck = processDefaultLanguage(defaultLanguage);
        }
        // 2. Try to get code draft from DB for langToCheck
        try {
          const { data: draftData } = await client.query({
            query: GET_USER_CODE_DRAFT,
            variables: { userId, problemId, language: langToCheck },
            fetchPolicy: 'network-only',
          });
          codeFromDB = draftData?.getUserCodeDraft?.code || null;
          dbUpdatedAt = draftData?.getUserCodeDraft?.updatedAt || null;
        } catch (err) {
          codeFromDB = null;
          dbUpdatedAt = null;
        }
        // 3. Get code from localStorage for the same key
        const localKey = `nexacademy_${userId}_${problemId}_${langToCheck}`;
        const localDraftKey = `${localKey}_draft`;
        const localCode = localStorage.getItem(localKey) || '';
        const localDraftCode = localStorage.getItem(localDraftKey) || '';
        // Use the draft key if it exists and is newer
        let localTimestamp = null;
        try {
          localTimestamp = localStorage.getItem(`${localKey}_timestamp`);
        } catch {}
        // 4. Compare timestamps and pick the latest
        let useCode = preloadCode;
        if (codeFromDB && dbUpdatedAt) {
          // Compare with localStorage timestamp
          let dbTime = new Date(dbUpdatedAt).getTime();
          let localTime = localTimestamp ? parseInt(localTimestamp, 10) : 0;
          if (localTime > dbTime && localCode) {
            useCode = localCode;
          } else {
            useCode = codeFromDB;
          }
        } else if (localCode) {
          useCode = localCode;
        } else {
          useCode = preloadCode;
        }
        // Set language and code
        if (isMounted) {
          setLanguage(langToCheck);
          setCode(useCode);
        }
      } catch (err) {
        console.error('Error in loadInitialCode:', err);
      } finally {
        if (isMounted) setInitialLoading(false);
      }
    }

    loadInitialCode();
    return () => { isMounted = false; };
  // eslint-disable-next-line
  }, [authStatus, authSession, problemId]);


  const latestLanguageRequestRef = useRef<string | null>(null);

  const [languageDropdownOpen, setLanguageDropdownOpen] = useState(false);

  // Load saved code from localStorage ONLY on component mount
  // (Language changes are handled by handleLanguageChange, not this effect)
  useEffect(() => {
    if (!problemId || !language) return;
    
    // Skip this effect if we've already loaded initial code
    if (initialLoadCompletedRef.current) return;
    initialLoadCompletedRef.current = true;
    
    let storageKey;
    
    // Determine the correct key to load from based on authentication status
    if (authStatus === 'authenticated' && authSession?.user?.id) {
      storageKey = `nexacademy_${authSession.user.id}_${problemId}_${language}`;
      console.log(`[INITIAL LOAD] User authenticated: Loading from ${storageKey}`);
    } else {
      storageKey = `nexacademy_anonymous_${problemId}_${language}`;
      console.log(`[INITIAL LOAD] User not authenticated: Loading from ${storageKey}`);
    }
    
    // Check if there's saved code in localStorage
    const savedCode = localStorage.getItem(storageKey);
    
    // Add debug log
    if (savedCode) {
      console.log(`[INITIAL LOAD] Found saved code (length: ${savedCode.length})`);
    } else {
      console.log('[INITIAL LOAD] No saved code found, using preloadCode');
    }
    
    // If there's saved code and it's different from the current code, update the editor
    if (savedCode && savedCode !== preloadCode) {
      setCode(savedCode);
    } else if (preloadCode) {
      // If no saved code but we have preloadCode, use that
      setCode(preloadCode);
    }
  // Note: we're not including language in the dependency array, 
  // as language changes are handled by handleLanguageChange
  }, [problemId, preloadCode, authStatus, authSession]);

  // Always sync editor theme to match app theme, but only after resolvedTheme is available
  useEffect(() => {
    if (appTheme === 'dark') {
      setEditorTheme('vs-dark');
    } else if (appTheme === 'light') {
      setEditorTheme('light');
    }
    // Do nothing if appTheme is 'system' or undefined
  }, [appTheme]);

  // Add a flag to track if the component has mounted
  const [hasMounted, setHasMounted] = useState(false)
  
  // Set the mounted flag after first render
  useEffect(() => {
    setHasMounted(true)
  }, [])

  // Update layout when screen size changes and initialize correctly for mobile
  useEffect(() => {
    if (isMobile) {
      setLeftPanelWidth(100);
      // Always set activePanel to "problem" when the component is first mounted on mobile
      setActivePanel("problem");
    } else {
      setLeftPanelWidth(50);
    }
  }, [isMobile]);

  if (!hasMounted) return null;

  return (
    <div className="flex flex-col h-screen w-screen fixed inset-0 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 overflow-hidden">
      {/* Expandable Coding Questions Sidebar - ensure it's completely hidden by default on mobile */}
      <CodingQuestionsSidebar
        currentQuestionId={codingQuestion.questionId || codingQuestion.id}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        className={isMobile ? "fixed inset-y-0 left-0 z-50 m-0 rounded-none w-full max-w-sm transform transition-transform duration-300 ease-in-out" +
          (sidebarOpen ? " translate-x-0" : " -translate-x-full") : ""}
      />
      
      {/* Add overlay when sidebar is open on mobile */}
      {isMobile && sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity duration-300"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Header with NexPractice theming */}
      <header className="flex items-center justify-between px-6 py-3 border-b border-indigo-100 dark:border-indigo-900/50 bg-gradient-to-r from-white via-slate-50 to-white dark:from-black dark:via-neutral-900 dark:to-black shadow-sm relative overflow-hidden backdrop-blur-sm z-30">
        {/* Left section: Logo and sidebar toggle */}
        <div className="flex items-center gap-4 min-w-0 relative z-10">
          <button
            className="mr-2 flex items-center justify-center rounded-lg h-9 w-9 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-neutral-900 dark:to-black border border-indigo-100 dark:border-indigo-900/50 hover:bg-indigo-100 dark:hover:bg-neutral-800 text-indigo-700 dark:text-gray-200 shadow-sm transition-all duration-200 hover:scale-105"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open questions sidebar"
          >
            {/* Replace List icon with a hamburger menu icon (three lines) */}
            <div className="flex flex-col justify-center items-center w-5 h-5 gap-[3px]">
              <div className="w-full h-[2px] bg-current rounded-full"></div>
              <div className="w-full h-[2px] bg-current rounded-full"></div>
              <div className="w-full h-[2px] bg-current rounded-full"></div>
            </div>
          </button>
          <div className="flex items-center gap-2 min-w-0">
            <div className="relative flex items-center justify-center w-9 h-9 transition-transform hover:scale-105 group">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 to-purple-600 dark:from-neutral-800 dark:to-neutral-900 rounded-lg transform rotate-3 opacity-80 group-hover:opacity-90 transition-all duration-300"></div>
              <div className="absolute inset-0 bg-gradient-to-tl from-blue-500 to-indigo-600 dark:from-neutral-700 dark:to-neutral-800 rounded-lg transform -rotate-3 opacity-80 group-hover:opacity-90 transition-all duration-300"></div>
              <div className="relative z-10 flex items-center justify-center w-8 h-8 bg-white dark:bg-neutral-900 rounded-lg shadow-inner overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-slate-100 to-white dark:from-neutral-900 dark:to-black opacity-40"></div>
                <div className="relative">
                  <Code className="w-4 h-4 text-indigo-600 dark:text-gray-200" />
                  <div className="absolute inset-0 bg-indigo-500/10 dark:bg-gray-200/10 animate-pulse-slow rounded-sm opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </div>
            </div>
            </div>
            <div className="group min-w-0">
              <h1 className="text-lg font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-indigo-700 via-purple-700 to-pink-600 dark:from-blue-200 dark:via-gray-400 dark:to-blue-200 truncate">NexPractice</h1>
              <div className="h-1 w-10 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 dark:from-blue-900 dark:via-gray-700 dark:to-blue-900 rounded-full group-hover:animate-gradient-x"></div>
          </div>
          </div>
        </div>

        {/* Center section: Run/Submit and Mobile Navigation Tabs */}
        <div className="hidden md:flex flex-1 items-center justify-center gap-3 mx-4 px-4 border-x border-indigo-100 dark:border-indigo-900/40 min-w-0">
          <Button
            size="sm"
            className="bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white shadow-sm gap-1 min-w-28 relative overflow-hidden group transition-all duration-200 hover:shadow-md"
            onClick={runCode}
            disabled={isRunning}
          >
            {isRunning ? (
              <>
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-purple-500 to-indigo-600 animate-gradient-x"></div>
                <div className="relative z-10 flex items-center space-x-1">
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-pink-500"></span>
                  </span>
                  <span className="text-sm font-medium text-white animate-pulse">
                    {loadingPhrase || "Processing..."}
                  </span>
                </div>
              </>
            ) : (
              <>
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-indigo-700 transition-all duration-300 group-hover:scale-105"></div>
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/20"></div>
                <span className="relative z-10 flex items-center">
                  <Play className="h-4 w-4 mr-1.5" />
            Run Code
                </span>
              </>
            )}
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-700/50 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 hover:text-indigo-800 dark:hover:text-indigo-200 transition-all duration-200 gap-1 min-w-28 relative overflow-hidden group"
            onClick={submitCode}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-100 via-purple-100 to-indigo-100 dark:from-indigo-900/30 dark:via-purple-900/30 dark:to-indigo-900/30 animate-gradient-x"></div>
                <div className="relative z-10 flex items-center space-x-1">
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                  </span>
                  <span className="text-xs font-medium text-indigo-700 dark:text-indigo-300 animate-pulse truncate max-w-24">
                    Submitting...
                  </span>
                </div>
              </>
            ) : (
              <>
                <div className="absolute inset-0 bg-gradient-to-r from-white to-slate-100 dark:from-slate-900 dark:to-slate-800/80 opacity-50 group-hover:opacity-80 transition-all duration-300"></div>
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-200/80 dark:bg-indigo-700/40 group-hover:bg-indigo-300 dark:group-hover:bg-indigo-600/40 transition-colors"></div>
                <span className="relative z-10 flex items-center">
                  <Send className="h-4 w-4 mr-1.5" />
            Submit
                </span>
              </>
            )}
          </Button>
        </div>

        {/* Mobile Navigation Tabs */}
       
          


        {/* Empty space for layout balance in mobile */}
        <div className="md:hidden w-16"></div>

        {/* Right section: Actions/Profile */}
        <div className="flex items-center gap-2 min-w-0">
          <div className="hidden md:flex items-center gap-2 mr-2">
            <Button variant="ghost" size="sm" className="text-slate-700 dark:text-slate-300 hover:bg-indigo-50 hover:text-indigo-700 dark:hover:bg-indigo-950/30 dark:hover:text-indigo-300 transition-colors gap-1">
              <Zap className="h-4 w-4 mr-1.5 text-indigo-500/70 dark:text-indigo-400/70" />
              Random Challenge
            </Button>
            <Button variant="ghost" size="sm" className="text-slate-700 dark:text-slate-300 hover:bg-indigo-50 hover:text-indigo-700 dark:hover:bg-indigo-950/30 dark:hover:text-indigo-300 transition-colors gap-1">
              <Sparkles className="h-4 w-4 mr-1.5 text-indigo-500/70 dark:text-indigo-400/70" />
              Daily Challenge
            </Button>
            <Button variant="ghost" size="icon" className="ml-2 rounded-full hover:bg-indigo-100 dark:hover:bg-slate-800/60 focus:bg-indigo-200 dark:focus:bg-slate-700/80 border border-transparent focus:border-indigo-400 dark:focus:border-indigo-500 transition-colors" onClick={handleFullscreenToggle} aria-label={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}>
              {isFullscreen ? (
                <Minimize2 className="h-5 w-5 text-indigo-700 dark:text-indigo-200" />
              ) : (
                <Maximize2 className="h-5 w-5 text-indigo-700 dark:text-indigo-200" />
              )}
            </Button>
              {/* Theme Switcher */}
            <ModeToggle />
          </div>
          {/* ...existing theme/profile popover... */}
              <Popover>
                <PopoverTrigger asChild>
                  <button className="flex items-center justify-center rounded-full overflow-hidden border-2 border-indigo-100 dark:border-indigo-800/50 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:ring-offset-2 dark:focus:ring-offset-slate-900">
                    <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white font-medium relative overflow-hidden">
                      {profilePic ? (
                        <img src={profilePic} alt={session?.user?.name || "User"} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-sm font-semibold">{session?.user?.name ? session.user.name.charAt(0).toUpperCase() : "U"}</span>
                      )}
                      <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-green-500 border-2 border-white dark:border-slate-900"></div>
                    </div>
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-64 p-0 border-indigo-100 dark:border-indigo-900/50 shadow-lg rounded-xl overflow-hidden" align="end">
                  <div className="bg-gradient-to-r from-indigo-50 to-indigo-100/50 dark:from-indigo-900/30 dark:to-indigo-900/20 px-4 py-3 border-b border-indigo-100 dark:border-indigo-900/50">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white font-semibold relative overflow-hidden">
                        {profilePic ? (
                          <img src={profilePic} alt={session?.user?.name || "User"} className="w-full h-full object-cover" />
                        ) : (
                          <span>{session?.user?.name ? session.user.name.charAt(0).toUpperCase() : "U"}</span>
                        )}
                      </div>
                      <div>
                        <div className="font-medium text-slate-800 dark:text-slate-200">{session?.user?.name || "Guest User"}</div>
                        <div className="text-xs text-indigo-600 dark:text-indigo-400 font-medium flex items-center">
                          <Crown className="h-3 w-3 mr-1 text-amber-500" />
                          {session?.user?.role === "ADMIN" ? "Admin" : "Student"}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="py-2">
                    <div className="px-2">
                      <a
                        href={session?.user?.username ? `/profile/${session.user.username}` : "/profile"}
                        className="flex items-center gap-3 px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-md transition-colors"
                      >
                        <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center">
                          <User className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <div>
                          <div className="font-medium">Your Profile</div>
                          <div className="text-xs text-slate-500 dark:text-slate-400">View and edit your details</div>
                        </div>
                      </a>
                    </div>
                    <div className="h-px bg-slate-200 dark:bg-slate-700/50 my-2"></div>
                    <div className="px-2">
                      <button
                        className="flex items-center gap-3 px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-red-50 dark:hover:bg-red-900/10 hover:text-red-600 dark:hover:text-red-400 rounded-md transition-colors w-full text-left"
                      >
                        <div className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                          <LogOut className="h-4 w-4 text-red-600 dark:text-red-400" />
                        </div>
                        <div>
                          <div className="font-medium">Sign Out</div>
                          <div className="text-xs text-slate-500 dark:text-slate-400">Log out of your account</div>
                        </div>
                      </button>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
        </div>
      </header>
      
      {/* Main content with resizable panels */}
      <div ref={containerRef} className="flex flex-1 overflow-hidden">
        {/* Left panel - Problem description */}
        <div
          className={`h-full overflow-auto bg-white dark:bg-black ${
            hasMounted && isMobile ? (activePanel === "problem" ? "block w-full" : "hidden") : "border-r border-indigo-100 dark:border-indigo-900/50"
          } ${hasMounted && isMobile ? "pb-24" : ""}`}
          style={{ width: hasMounted && isMobile ? "100%" : `${leftPanelWidth}%` }}
        >
          <div className="p-3 md:px-5 md:py-3">
            {/* Use the new ProblemHeader component */}
            <ProblemHeader 
              problemNumber={problemNumber}
              problemTitle={problemTitle}
              difficulty={difficulty}
              isLeftPanelExpanded={isLeftPanelExpanded}
              toggleLeftPanelExpansion={toggleLeftPanelExpansion}
              isMobile={isMobile}
              getDifficultyBadge={getDifficultyBadge}
              solvedBy={codingQuestion.question?.solvedBy || 1248}
              tags={codingQuestion.question?.tags || [{ name: 'Array' }, { name: 'Hash Table' }, { name: 'Two Pointers' }]}
            />

            {/* Problem content tabs with new gradient background */}
            <Tabs defaultValue="description" className="mt-2 mb-5" onValueChange={handleTabChange}>
              <TabsList className="flex flex-nowrap justify-start overflow-x-auto overflow-y-hidden px-3 scroll-pl-2 snap-x snap-mandatory scrollbar-thin scrollbar-thumb-indigo-200 dark:scrollbar-thumb-indigo-900/40 bg-gradient-to-r from-indigo-50/90 via-purple-50/80 to-indigo-50/90 dark:from-black dark:via-neutral-900 dark:to-black rounded-xl backdrop-blur-sm border border-indigo-100/90 dark:border-indigo-900/40 shadow-sm p-2">
                <TabsTrigger
                  value="description"
                  className="flex-shrink-0 min-w-[110px] px-3 rounded-lg py-2 snap-start data-[state=active]:bg-white data-[state=active]:dark:bg-black/95 data-[state=active]:text-indigo-700 data-[state=active]:dark:text-indigo-30 data-[state=active]:shadow-sm relative overflow-hidden group transition-all duration-300"
                >
                  <div className="absolute inset-0 opacity-0 group-data-[state=active]:opacity-100 transition-opacity">
                    <div className="absolute inset-x-0 -bottom-0.5 h-0.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
                    <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-white/0 dark:from-white/5 dark:to-white/0"></div>
                  </div>
                  <div className="relative z-10 flex items-center">
                    <FileText className="h-3.5 w-3.5 mr-1.5 text-indigo-500/70 dark:text-indigo-400/70 group-data-[state=active]:text-indigo-600 dark:group-data-[state=active]:text-indigo-400 transition-colors" />
                    <span className="font-medium">Description</span>
                  </div>
                </TabsTrigger>
                <TabsTrigger
                  value="solution"
                  className="flex-shrink-0 min-w-[110px] px-3 rounded-lg py-2 data-[state=active]:bg-white data-[state=active]:dark:bg-black/95 data-[state=active]:text-indigo-700 data-[state=active]:dark:text-indigo-30 data-[state=active]:shadow-sm relative overflow-hidden group transition-all duration-300"
                >
                  <div className="absolute inset-0 opacity-0 group-data-[state=active]:opacity-100 transition-opacity">
                    <div className="absolute inset-x-0 -bottom-0.5 h-0.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
                    <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-white/0 dark:from-white/5 dark:to-white/0"></div>
                  </div>
                  <div className="relative z-10 flex items-center">
                    <BookOpenCheck className="h-3.5 w-3.5 mr-1.5 text-indigo-500/70 dark:text-indigo-400/70 group-data-[state=active]:text-indigo-600 dark:group-data-[state=active]:text-indigo-400 transition-colors" />
                    <span className="font-medium">Solution</span>
                  </div>
                </TabsTrigger>
                <TabsTrigger
                  value="submissions"
                  className="flex-shrink-0 min-w-[110px] px-3 rounded-lg py-2 data-[state=active]:bg-white data-[state=active]:dark:bg-black/95 data-[state=active]:text-indigo-700 data-[state=active]:dark:text-indigo-30 data-[state=active]:shadow-sm relative overflow-hidden group transition-all duration-300"
                >
                  <div className="absolute inset-0 opacity-0 group-data-[state=active]:opacity-100 transition-opacity">
                    <div className="absolute inset-x-0 -bottom-0.5 h-0.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
                    <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-white/0 dark:from-white/5 dark:to-white/0"></div>
                  </div>
                  <div className="relative z-10 flex items-center">
                    <BarChart2 className="h-3.5 w-3.5 mr-1.5 text-indigo-500/70 dark:text-indigo-400/70 group-data-[state=active]:text-indigo-600 dark:group-data-[state=active]:text-indigo-400 transition-colors" />
                    <span className="font-medium">Submissions</span>
                  </div>
                </TabsTrigger>
                <TabsTrigger
                  value="discussion"
                  className="flex-shrink-0 min-w-[110px] px-3 rounded-lg py-2 data-[state=active]:bg-white data-[state=active]:dark:bg-black/95 data-[state=active]:text-indigo-700 data-[state=active]:dark:text-indigo-30 data-[state=active]:shadow-sm relative overflow-hidden group transition-all duration-300"
                >
                  <div className="absolute inset-0 opacity-0 group-data-[state=active]:opacity-100 transition-opacity">
                    <div className="absolute inset-x-0 -bottom-0.5 h-0.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
                    <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-white/0 dark:from-white/5 dark:to-white/0"></div>
                  </div>
                  <div className="relative z-10 flex items-center">
                    <MessageSquare className="h-3.5 w-3.5 mr-1.5 text-indigo-500/70 dark:text-indigo-400/70 group-data-[state=active]:text-indigo-600 dark:group-data-[state=active]:text-indigo-400 transition-colors" />
                    <span className="font-medium">Discussion</span>
                  </div>
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="description" className="mt-3 space-y-5 focus-visible:outline-none focus-visible:ring-0">
                {/* Problem description with content-card styling */}
                <div style={{ 
                  borderRadius: '18px',
                  overflow: 'hidden',
                  padding: '0',
                  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(248, 250, 252, 0.85))',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(226, 232, 240, 0.8)',
                  boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01)',
                  position: 'relative',
                  transition: 'all 0.3s cubic-bezier(0.22, 1, 0.36, 1)'
                }} className="dark:!bg-gradient-to-br dark:!from-gray-900/95 dark:!to-slate-900/90 dark:!border-slate-700/40 dark:!shadow-[0_10px_25px_-5px_rgba(0,0,0,0.2),0_8px_10px_-6px_rgba(0,0,0,0.2)]">
                  {/* Premium top accent bar */}
                  <div style={{ 
                    height: '3px', 
                    width: '100%', 
                    background: 'linear-gradient(to right, #6366f1, #8b5cf6, #d946ef)',
                    opacity: 0.8
                  }}></div>
                  <article className="problem-description prose prose-indigo dark:prose-invert max-w-none px-7 py-5" style={{ borderRadius: '0' }}>
                    <div
                      dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(description) }}
                    />
                  </article>
                </div>
                
                {/* Example test cases with test-case-card styling */}
                {examples.map((tc: {id: string, input: string, output: string, explanation?: string}, idx: number) => (
                  <div key={tc.id} className="test-case-card relative group transition-all duration-300 hover:shadow-md">
                    {/* Top decorative gradient bar */}
                    <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
                    
                    {/* Example header */}
                    <div className="px-4 py-3 flex items-center gap-2 bg-gradient-to-r from-indigo-50/90 to-purple-50/70 dark:from-indigo-900/30 dark:to-purple-900/20 border-b border-indigo-100 dark:border-indigo-800/40">
                      <div className="flex items-center justify-center w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-xs font-bold shadow-sm">
                          {idx + 1}
                        </div>
                      <h3 className="text-base font-semibold text-slate-800 dark:text-slate-200 tracking-tight">Example {idx + 1}</h3>
                      </div>
                    
                    <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* INPUT section with enhanced styling */}
                      <div className="rounded-lg overflow-hidden border border-slate-200/80 dark:border-slate-700/60 transition-all duration-300 group-hover:shadow group-hover:border-indigo-200 dark:group-hover:border-indigo-800/40">
                        <div className="relative px-3 py-2 bg-gradient-to-r from-slate-100 to-indigo-50/70 dark:from-slate-800 dark:to-indigo-900/30 border-b border-slate-200 dark:border-slate-700/70">
                          <div className="absolute left-0 inset-y-0 w-1 bg-indigo-500"></div>
                          <div className="flex items-center">
                            <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 mr-2"></div>
                            <span className="text-sm font-medium text-indigo-700 dark:text-indigo-300">Input</span>
                            <span className="ml-auto text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider font-mono">Data</span>
                          </div>
                        </div>
                        <div className="p-3 font-mono text-sm text-indigo-700 dark:text-indigo-300 bg-white/50 dark:bg-slate-800/50 overflow-auto">
                          {formatTestCase(tc.input)}
                        </div>
                      </div>
                      
                      {/* OUTPUT section with enhanced styling */}
                      <div className="rounded-lg overflow-hidden shadow-sm border border-green-200/70 dark:border-green-900/30 transition-all duration-300 group-hover:shadow">
                        <div className="relative px-3 py-2 bg-gradient-to-r from-green-50 to-emerald-50/50 dark:from-green-900/20 dark:to-emerald-900/10 border-b border-green-200 dark:border-green-900/30">
                          <div className="absolute left-0 inset-y-0 w-1 bg-green-500"></div>
                          <div className="flex items-center">
                            <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
                            <span className="text-sm font-medium text-green-700 dark:text-green-300">Output</span>
                            <span className="ml-auto text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider">Result</span>
                          </div>
                        </div>
                        <div className="p-3 font-mono text-sm text-green-700 dark:text-green-300 bg-white/50 dark:bg-slate-800/50 overflow-auto">
                          {formatTestCase(tc.output)}
                        </div>
                      </div>
                      
                      {/* EXPLANATION section with enhanced styling */}
                      {tc.explanation && (
                        <div className="md:col-span-2 rounded-lg overflow-hidden shadow-sm border border-purple-200/50 dark:border-purple-900/20 transition-all duration-300 group-hover:shadow">
                          <div className="relative px-3 py-2 bg-gradient-to-r from-purple-50 to-pink-50/30 dark:from-purple-900/20 dark:to-pink-900/10 border-b border-purple-200/50 dark:border-purple-900/20">
                            <div className="absolute left-0 inset-y-0 w-1 bg-purple-500"></div>
                            <div className="flex items-center">
                              <div className="w-2 h-2 rounded-full bg-purple-500 mr-2"></div>
                              <span className="text-sm font-medium text-purple-700 dark:text-purple-300">Explanation</span>
                              <span className="ml-auto text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider">Details</span>
                            </div>
                          </div>
                          <div className="p-3 font-mono text-sm text-slate-700 dark:text-slate-300 bg-white/50 dark:bg-slate-800/50 overflow-auto">
                            {formatTestCase(tc.explanation || '')}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </TabsContent>
              
              <TabsContent value="solution" className="mt-4 focus-visible:outline-none focus-visible:ring-0">
                <div style={{ 
                  borderRadius: '18px',
                  overflow: 'hidden',
                  padding: '0',
                  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(248, 250, 252, 0.85))',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(226, 232, 240, 0.8)',
                  boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01)',
                  position: 'relative',
                  transition: 'all 0.3s cubic-bezier(0.22, 1, 0.36, 1)'
                }} className="group hover:translate-y-[-2px] dark:!bg-gradient-to-br dark:!from-gray-900/95 dark:!to-slate-900/90 dark:!border-slate-700/40 dark:!shadow-[0_10px_25px_-5px_rgba(0,0,0,0.2),0_8px_10px_-6px_rgba(0,0,0,0.2)]">
                  {/* Premium top accent bar */}
                  <div style={{ 
                    height: '3px', 
                    width: '100%', 
                    background: 'linear-gradient(to right, #6366f1, #8b5cf6, #d946ef)',
                    opacity: 0.8
                  }}></div>
                  <div className="flex flex-col items-center justify-center py-12">
                    <div className="relative w-16 h-16 mb-4">
                      <div className="absolute inset-0 rounded-full bg-indigo-100 dark:bg-indigo-900/30 animate-pulse"></div>
                      <div className="absolute inset-4 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 opacity-20 blur-lg animate-pulse delay-75"></div>
                      <div className="absolute inset-0 rounded-full flex items-center justify-center">
                        <BookOpenCheck className="h-10 w-10 relative z-10 text-indigo-500 dark:text-indigo-400 animate-float" />
                      </div>
                    </div>
                    <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-2">Solution Locked</h3>
                    <p className="text-slate-600 dark:text-slate-400 text-center max-w-sm">
                      Solutions will be available after you successfully solve the problem or unlock with premium access.
                    </p>
                    <div className="mt-6 flex items-center gap-4">
                      <Button 
                        variant="outline"
                        size="sm"
                        className="gap-1 bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 dark:hover:from-indigo-900/40 dark:hover:to-purple-900/40 text-indigo-700 dark:text-indigo-30 border-indigo-200 dark:border-indigo-800/50"
                      >
                        <Code className="h-3.5 w-3.5 mr-1" />
                        Solve First
                      </Button>
                      <Button 
                        variant="outline"
                        size="sm"
                        className="gap-1 bg-gradient-to-r from-amber-50 to-orange-50 hover:from-amber-100/80 hover:to-orange-100/80 dark:from-amber-900/20 dark:to-orange-900/20 dark:hover:from-amber-900/40 dark:hover:to-orange-900/40 text-amber-700 dark:text-amber-30 border-amber-200 dark:border-amber-800/50"
                      >
                        <Crown className="h-3.5 w-3.5 mr-1" />
                        Premium Access
                      </Button>
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="submissions" className="mt-4 focus-visible:outline-none focus-visible:ring-0">
                <div style={{ 
                  borderRadius: '18px',
                  overflow: 'hidden',
                  padding: '0',
                  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(248, 250, 252, 0.85))',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(226, 232, 240, 0.8)',
                  boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01)',
                  position: 'relative',
                  transition: 'all 0.3s cubic-bezier(0.22, 1, 0.36, 1)'
                }} className="dark:!bg-gradient-to-br dark:!from-gray-900/95 dark:!to-slate-900/90 dark:!border-slate-700/40 dark:!shadow-[0_10px_25px_-5px_rgba(0,0,0,0.2),0_8px_10px_-6px_rgba(0,0,0,0.2)]">
                  {/* Premium top accent bar */}
                  <div style={{ 
                    height: '3px', 
                    width: '100%', 
                    background: 'linear-gradient(to right, #6366f1, #8b5cf6, #d946ef)',
                    opacity: 0.8
                  }}></div>
                  <div className="p-5">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 flex items-center">
                        <BarChart2 className="h-5 w-5 mr-2 text-indigo-500 dark:text-indigo-400" />
                        Your Submissions
                      </h3>
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="h-8 text-xs"
                          disabled={submissionsLoading}
                        >
                          <Filter className="h-3 w-3 mr-1" />
                          Filter
                        </Button>
                        <Button 
                          size="sm" 
                          className="h-8 text-xs bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800"
                          onClick={() => fetchSubmissions(currentPage)}
                          disabled={submissionsLoading}
                          aria-label="Refresh submissions"
                        >
                          <RefreshCw className={`h-3 w-3 mr-1 ${submissionsLoading ? 'animate-spin' : ''}`} />
                          {submissionsLoading ? 'Loading...' : 'Refresh'}
                        </Button>
                      </div>
                    </div>
                    
                    {submissionsError && (
                      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/30 rounded-lg p-3 mb-4 text-red-600 dark:text-red-400 text-sm flex items-start">
                        <AlertTriangle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                        <p>{submissionsError}</p>
                      </div>
                    )}
                    
                    {submissions.length === 0 && !submissionsLoading && !submissionsError ? (
                      <div className="flex flex-col items-center justify-center py-12 text-center">
                        <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                          <BarChart2 className="h-8 w-8 text-slate-400 dark:text-slate-600" />
                        </div>
                        <h4 className="text-lg font-medium text-slate-700 dark:text-slate-300 mb-2">No submissions found</h4>
                        <p className="text-slate-500 dark:text-slate-400 max-w-sm mb-6">
                          You haven't submitted any solutions to this problem yet. Write some code and submit it to see your results here.
                        </p>
                        <Button
                          onClick={() => setActivePanel("code")}
                          className="gap-1 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800"
                        >
                          <Code className="h-4 w-4 mr-1" />
                          Start Coding
                        </Button>
                      </div>
                    ) : (
                      <>
                        {selectedSubmission ? (
                          // Detail view for a selected submission
                          <div className="bg-white dark:bg-black rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
                            {/* Header with back button */}
                            <div className="flex items-center justify-between px-5 py-3.5 bg-gradient-to-r from-indigo-50 via-slate-50 to-indigo-50 dark:from-slate-800 dark:via-slate-800/90 dark:to-slate-800 border-b border-slate-200 dark:border-slate-700 backdrop-blur-sm">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="flex items-center text-slate-700 dark:text-slate-300 hover:bg-white/50 dark:hover:bg-slate-700/50 transition-all duration-200 gap-1"
                                onClick={closeSubmissionDetails}
                              >
                                <ChevronLeft className="h-4 w-4" />
                                <span className="font-medium">Back to Submissions</span>
                              </Button>
                              <div className="flex items-center space-x-2">
                                <div className="px-2.5 py-1 bg-indigo-50 dark:bg-indigo-900/30 rounded-full text-xs font-medium text-indigo-700 dark:text-indigo-300 flex items-center gap-1.5 shadow-sm border border-indigo-100 dark:border-indigo-800/50">
                                  <Clock className="h-3.5 w-3.5 text-indigo-500 dark:text-indigo-400" />
                                  {formatSubmissionDate(selectedSubmission.submittedAt)}
                                </div>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="text-xs h-8 bg-white dark:bg-slate-800 border-indigo-200 dark:border-indigo-800/50 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-all duration-200"
                                  onClick={() => loadSubmissionCode(selectedSubmission)}
                                >
                                  <Copy className="h-3.5 w-3.5 mr-1.5" />
                                  Load Code
                                </Button>
                              </div>
                            </div>

                            {/* Top status banner based on submission status */}
                            <div className={`w-full px-5 py-2.5 
                              ${selectedSubmission.status === 'ACCEPTED' 
                                ? 'bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-900/30 border-b border-green-200 dark:border-green-900/30 text-green-800 dark:text-green-300' 
                                : selectedSubmission.status === 'FAILED' || selectedSubmission.status === 'WRONG_ANSWER'
                                ? 'bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-900/30 border-b border-red-200 dark:border-red-900/30 text-red-800 dark:text-red-300'
                                : 'bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-900/30 border-b border-orange-200 dark:border-orange-900/30 text-orange-800 dark:text-orange-300'
                              } text-sm font-medium flex items-center justify-between`}>
                              <div className="flex items-center">
                                {selectedSubmission.status === 'ACCEPTED' ? (
                                  <CheckCircle className="h-4 w-4 mr-2 text-green-600 dark:text-green-400" />
                                ) : selectedSubmission.status === 'FAILED' || selectedSubmission.status === 'WRONG_ANSWER' ? (
                                  <XCircle className="h-4 w-4 mr-2 text-red-600 dark:text-red-400" />
                                ) : (
                                  <AlertCircle className="h-4 w-4 mr-2 text-orange-600 dark:text-orange-400" />
                                )}
                                <span>
                                  {selectedSubmission.status === 'ACCEPTED' 
                                    ? 'Solution Accepted' 
                                    : selectedSubmission.status === 'FAILED' || selectedSubmission.status === 'WRONG_ANSWER'
                                    ? 'Solution Failed'
                                    : selectedSubmission.status || 'Submission Status'}
                                </span>
                              </div>
                              <div className="flex items-center text-xs">
                                {selectedSubmission.testcasesPassed !== undefined && selectedSubmission.totalTestcases !== undefined && (
                                  <div className="flex items-center">
                                    <span className="mr-2">Test Cases:</span>
                                    <div className="flex items-center gap-1 bg-white/60 dark:bg-slate-800/60 rounded-full px-2 py-0.5 backdrop-blur-sm shadow-sm">
                                      <span className={selectedSubmission.status === 'ACCEPTED' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                                        {selectedSubmission.testcasesPassed}
                                      </span>
                                      <span>/</span>
                                      <span>{selectedSubmission.totalTestcases}</span>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Submission content */}
                            <div className="p-5">
                              {/* Performance metrics */}
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
                                <div className="bg-gradient-to-br from-slate-50 to-white dark:from-slate-800 dark:to-slate-800/80 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden group">
                                  <div className="absolute inset-0 bg-grid-pattern opacity-[0.015] pointer-events-none"></div>
                                  <div className="absolute -top-12 -right-12 w-24 h-24 bg-indigo-500/5 dark:bg-indigo-500/10 rounded-full blur-xl"></div>

                                  <div className="flex items-center justify-between mb-2">
                                    <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center">
                                      <Clock className="h-4 w-4 mr-1.5 text-indigo-500 dark:text-indigo-400" />
                                      Runtime
                                    </h3>
                                    <div className="text-xs px-1.5 py-0.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-md flex items-center">
                                      <Zap className="h-3 w-3 mr-0.5 text-amber-500 dark:text-amber-400" />
                                      Performance
                                    </div>
                                  </div>
                                  
                                  <div className="text-3xl font-bold text-indigo-700 dark:text-indigo-300 mb-1 flex items-baseline">
                                    {selectedSubmission.runtime || 'N/A'}
                                    <span className="ml-1 text-xs text-slate-500 dark:text-slate-400">seconds</span>
                                  </div>

                                  {selectedSubmission.executionTimePercentile && (
                                    <div className="flex items-center mt-1.5 text-xs text-slate-500 dark:text-slate-400">
                                      <div className="flex-1 h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                                        <div 
                                          className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400 dark:from-emerald-400 dark:to-emerald-500"
                                          style={{ width: `${selectedSubmission.executionTimePercentile}%` }}
                                        ></div>
                                      </div>
                                      <span className="ml-2">
                                        Faster than {selectedSubmission.executionTimePercentile}%
                                      </span>
                                    </div>
                                  )}
                                </div>

                                <div className="bg-gradient-to-br from-slate-50 to-white dark:from-slate-800 dark:to-slate-800/80 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden group">
                                  <div className="absolute inset-0 bg-grid-pattern opacity-[0.015] pointer-events-none"></div>
                                  <div className="absolute -top-12 -right-12 w-24 h-24 bg-purple-500/5 dark:bg-purple-500/10 rounded-full blur-xl"></div>

                                  <div className="flex items-center justify-between mb-2">
                                    <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center">
                                      <Database className="h-4 w-4 mr-1.5 text-purple-500 dark:text-purple-400" />
                                      Memory
                                    </h3>
                                    <div className="text-xs px-1.5 py-0.5 bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-md flex items-center">
                                      <Server className="h-3 w-3 mr-0.5 text-purple-500 dark:text-purple-400" />
                                      Usage
                                    </div>
                                  </div>
                                  
                                  <div className="text-3xl font-bold text-purple-700 dark:text-purple-300 mb-1 flex items-baseline">
                                    {selectedSubmission.memory 
                                      ? (Number(selectedSubmission.memory) > 1024 
                                          ? `${(Number(selectedSubmission.memory) / 1024).toFixed(1)}` 
                                          : selectedSubmission.memory)
                                      : 'N/A'}
                                    <span className="ml-1 text-xs text-slate-500 dark:text-slate-400">
                                      {selectedSubmission.memory 
                                        ? (Number(selectedSubmission.memory) > 1024 ? 'MB' : 'KB')
                                        : ''}
                                    </span>
                                  </div>

                                  {selectedSubmission.memoryPercentile && (
                                    <div className="flex items-center mt-1.5 text-xs text-slate-500 dark:text-slate-400">
                                      <div className="flex-1 h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                                        <div 
                                          className="h-full rounded-full bg-gradient-to-r from-purple-500 to-purple-400 dark:from-purple-400 dark:to-purple-500"
                                          style={{ width: `${selectedSubmission.memoryPercentile}%` }}
                                        ></div>
                                      </div>
                                      <span className="ml-2">
                                        Less than {selectedSubmission.memoryPercentile}%
                                      </span>
                                    </div>
                                  )}
                                </div>

                                <div className="bg-gradient-to-br from-slate-50 to-white dark:from-slate-800 dark:to-slate-800/80 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden group">
                                  <div className="absolute inset-0 bg-grid-pattern opacity-[0.015] pointer-events-none"></div>
                                  <div className="absolute -top-12 -right-12 w-24 h-24 bg-blue-500/5 dark:bg-blue-500/10 rounded-full blur-xl"></div>

                                  <div className="flex items-center justify-between mb-2">
                                    <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center">
                                      <Code2 className="h-4 w-4 mr-1.5 text-blue-500 dark:text-blue-400" />
                                      Language
                                    </h3>
                                  </div>
                                  
                                  <div className="flex flex-col">
                                    <div className="text-xl font-bold text-blue-700 dark:text-blue-300 flex items-center">
                                      <div className={`w-2.5 h-2.5 rounded-full ${getLanguageColor(parseLanguageName(JUDGE0_LANGUAGES[selectedSubmission.language as keyof typeof JUDGE0_LANGUAGES] || "Unknown").name)} mr-2`}></div>
                                      {parseLanguageName(JUDGE0_LANGUAGES[selectedSubmission.language as keyof typeof JUDGE0_LANGUAGES] || "Unknown").name}
                                    </div>
                                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 ml-4.5">
                                      {parseLanguageName(JUDGE0_LANGUAGES[selectedSubmission.language as keyof typeof JUDGE0_LANGUAGES] || "Unknown").version}
                                    </div>
                                  </div>

                                  <div className="flex items-center justify-between mt-3 text-xs">
                                    <div className="text-slate-500 dark:text-slate-400 flex items-center">
                                      <Calendar className="h-3 w-3 mr-1 text-slate-400 dark:text-slate-500" />
                                      {formatSubmissionDate(selectedSubmission.submittedAt)}
                                    </div>
                                    <div className="text-slate-500 dark:text-slate-400 flex items-center">
                                      <Hash className="h-3 w-3 mr-1 text-slate-400 dark:text-slate-500" />
                                      {selectedSubmission.id.substring(0, 8)}
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* Code editor */}
                              <div className="bg-gradient-to-br from-slate-50 to-white dark:from-slate-800 dark:to-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg">
                                <div className="p-1.5 bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                                  <div className="flex items-center">
                                    <div className="flex items-center space-x-1.5 pl-2">
                                      <div className="w-3 h-3 rounded-full bg-red-500"></div>
                                      <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                                    </div>
                                    <div className="flex-1 flex justify-center">
                                      <div className="px-3 py-1 text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-200/50 dark:bg-slate-700/50 rounded-full flex items-center border border-slate-300/30 dark:border-slate-600/30">
                                        <FileCode className="h-3.5 w-3.5 mr-1.5 text-indigo-500 dark:text-indigo-400" />
                                        Submitted Code
                                      </div>
                                    </div>
                                    <div className="pr-2 flex items-center">
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-7 w-7 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700"
                                        onClick={() => {
                                          if (selectedSubmission?.code) {
                                            navigator.clipboard.writeText(selectedSubmission.code);
                                            toast({
                                              title: "Code copied",
                                              description: "The code has been copied to your clipboard",
                                            });
                                          }
                                        }}
                                      >
                                        <Copy className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500" />
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                                <div className="relative">
                                  <div className="h-[500px] w-full border-0 overflow-hidden">
                                    <Editor
                                      height="500px"
                                      defaultLanguage={getMonacoLanguage(parseLanguageName(JUDGE0_LANGUAGES[selectedSubmission.language as keyof typeof JUDGE0_LANGUAGES] || "Unknown").name)}
                                      defaultValue={selectedSubmission.code || '// No code available'}
                                      theme={appTheme === 'dark' ? 'vs-dark' : 'light'}
                                      options={{
                                        readOnly: true,
                                        minimap: { enabled: true },
                                        scrollBeyondLastLine: false,
                                        fontSize: fontSize,
                                        tabSize: tabSize,
                                        wordWrap: 'on',
                                        lineNumbers: 'on',
                                        fontFamily: 'JetBrains Mono, Consolas, monospace',
                                        automaticLayout: true,
                                      }}
                                    />
                                  </div>
                                  <div className="absolute top-2 right-2 z-10 flex gap-1.5">
                                    <div className="px-2.5 py-1 bg-slate-100/80 dark:bg-slate-700/80 backdrop-blur-sm rounded-md text-xs font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1.5 shadow-sm border border-slate-200/50 dark:border-slate-600/50">
                                      <div className={`w-2 h-2 rounded-full ${getLanguageColor(parseLanguageName(JUDGE0_LANGUAGES[selectedSubmission.language as keyof typeof JUDGE0_LANGUAGES] || "Unknown").name)}`}></div>
                                      {parseLanguageName(JUDGE0_LANGUAGES[selectedSubmission.language as keyof typeof JUDGE0_LANGUAGES] || "Unknown").name}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        ) : (
                          // List view of all submissions
                          <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700 mb-4">
                            <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                              <thead className="bg-slate-50 dark:bg-slate-800">
                                <tr>
                                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                    Status
                                  </th>
                                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                    Runtime
                                  </th>
                                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                    Memory
                                  </th>
                                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                    Language
                                  </th>
                                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                    Submitted
                                  </th>
                                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                    Actions
                                  </th>
                                </tr>
                              </thead>
                              <tbody className={`bg-white dark:bg-black divide-y divide-slate-200 dark:divide-slate-700 ${submissionsLoading ? 'opacity-60' : ''}`}>
                                {submissionsLoading && submissions.length === 0 ? (
                                  <tr>
                                    <td colSpan={6} className="px-4 py-8 text-center text-sm text-slate-500 dark:text-slate-400">
                                      <div className="flex flex-col items-center">
                                        <Loader2 className="h-8 w-8 animate-spin text-indigo-500 dark:text-indigo-400 mb-3" />
                                        <p>Loading submissions...</p>
                                      </div>
                                    </td>
                                  </tr>
                                ) : (
                                  submissions.map((submission) => (
                                    <tr 
                                      key={submission.id} 
                                      className="hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors"
                                      onClick={() => viewSubmissionDetails(submission)}
                                    >
                                      <td className="px-4 py-3 whitespace-nowrap">
                                        <div className="flex items-center">
                                          {renderSubmissionStatus(submission)}
                                        </div>
                                      </td>
                                      <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-700 dark:text-slate-300">
                                        <div className="flex items-center">
                                          <Clock className="h-3.5 w-3.5 mr-1 text-indigo-500 dark:text-indigo-400" />
                                          <span className="mr-1 font-medium">{submission.runtime ? `${submission.runtime}s` : 'N/A'}</span>
                                          {submission.executionTimePercentile && (
                                            <span className="text-xs text-slate-500 dark:text-slate-400">
                                              (faster than {submission.executionTimePercentile}%)
                                            </span>
                                          )}
                                        </div>
                                      </td>
                                      <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-700 dark:text-slate-300">
                                        <div className="flex items-center">
                                          <Database className="h-3.5 w-3.5 mr-1 text-indigo-500 dark:text-indigo-400" />
                                          <span className="mr-1 font-medium">
                                            {submission.memory 
                                              ? (Number(submission.memory) > 1024 
                                                  ? `${(Number(submission.memory) / 1024).toFixed(1)}MB` 
                                                  : `${Number(submission.memory)}KB`)
                                              : 'N/A'}
                                          </span>
                                          {submission.memoryPercentile && (
                                            <span className="text-xs text-slate-500 dark:text-slate-400">
                                              (less than {submission.memoryPercentile}%)
                                            </span>
                                          )}
                                        </div>
                                      </td>
                                      <td className="px-4 py-3 whitespace-nowrap">
                                        <div className="text-sm text-slate-700 dark:text-slate-300 flex items-center">
                                          <div className={`w-2 h-2 rounded-full ${getLanguageColor(parseLanguageName(JUDGE0_LANGUAGES[submission.language as keyof typeof JUDGE0_LANGUAGES] || "Unknown").name)} mr-1.5`}></div>
                                          {JUDGE0_LANGUAGES[submission.language as keyof typeof JUDGE0_LANGUAGES] ? (
                                            <div className="flex flex-col">
                                              <span className="font-medium">
                                                {parseLanguageName(JUDGE0_LANGUAGES[submission.language as keyof typeof JUDGE0_LANGUAGES]).name}
                                              </span>
                                              <span className="text-xs text-slate-500 dark:text-slate-400">
                                                {parseLanguageName(JUDGE0_LANGUAGES[submission.language as keyof typeof JUDGE0_LANGUAGES]).version}
                                              </span>
                                            </div>
                                          ) : "Unknown"}
                                        </div>
                                      </td>
                                      <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                                        {formatSubmissionDate(submission.submittedAt)}
                                      </td>
                                      <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                                        <div className="flex space-x-2">
                                          <Button 
                                            variant="ghost" 
                                            size="icon" 
                                            className="h-7 w-7 rounded-full"
                                            onClick={(e) => loadSubmissionCode(submission, e)}
                                          >
                                            <Copy className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400" />
                                          </Button>
                                        </div>
                                      </td>
                                    </tr>
                                  ))
                                )}
                              </tbody>
                            </table>
                          </div>
                        )}
                        
                        {/* Pagination - only show when in list view */}
                        {!selectedSubmission && totalPages > 1 && (
                          <div className="flex items-center justify-center gap-2 mt-4">
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={() => fetchSubmissions(1)}
                              disabled={currentPage === 1 || submissionsLoading}
                            >
                              <ChevronLeft className="h-4 w-4" />
                              <ChevronLeft className="h-4 w-4 -ml-2" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={() => fetchSubmissions(currentPage - 1)}
                              disabled={currentPage === 1 || submissionsLoading}
                            >
                              <ChevronLeft className="h-4 w-4" />
                            </Button>
                            
                            <div className="text-sm text-slate-700 dark:text-slate-300 font-medium">
                              Page {currentPage} of {totalPages}
                            </div>
                            
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={() => fetchSubmissions(currentPage + 1)}
                              disabled={currentPage === totalPages || submissionsLoading}
                            >
                              <ChevronRight className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={() => fetchSubmissions(totalPages)}
                              disabled={currentPage === totalPages || submissionsLoading}
                            >
                              <ChevronRight className="h-4 w-4" />
                              <ChevronRight className="h-4 w-4 -ml-2" />
                            </Button>
                          </div>
                        )}
                        
                        {/* Stats Summary - only show in list view */}
                        {!selectedSubmission && submissions.length > 0 && (
                          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4 text-sm text-slate-700 dark:text-slate-300 flex flex-col md:flex-row md:items-center justify-between gap-4 mt-4">
                            <div className="flex items-center gap-4">
                              <div className="flex items-center">
                                <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                                <span>Accepted: {submissions.filter(s => s.status === 'ACCEPTED').length}</span>
                              </div>
                              <div className="flex items-center">
                                <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
                                <span>Failed: {submissions.filter(s => s.status !== 'ACCEPTED').length}</span>
                              </div>
                              <div className="flex items-center">
                                <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
                                <span>Total: {submissions.length}</span>
                              </div>
                            </div>
                            
                            <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center">
                              <Info className="h-3.5 w-3.5 mr-1.5 text-indigo-500 dark:text-indigo-400" />
                              Submissions are scored based on runtime and memory usage
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="discussion" className="mt-4 focus-visible:outline-none focus-visible:ring-0">
                <div style={{ 
                  borderRadius: '18px',
                  overflow: 'hidden',
                  padding: '0',
                  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(248, 250, 252, 0.85))',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(226, 232, 240, 0.8)',
                  boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01)',
                  position: 'relative',
                  transition: 'all 0.3s cubic-bezier(0.22, 1, 0.36, 1)'
                }} className="dark:!bg-gradient-to-br dark:!from-gray-900/95 dark:!to-slate-900/90 dark:!border-slate-700/40 dark:!shadow-[0_10px_25px_-5px_rgba(0,0,0,0.2),0_8px_10px_-6px_rgba(0,0,0,0.2)]">
                  {/* Premium top accent bar */}
                  <div style={{ 
                    height: '3px', 
                    width: '100%', 
                    background: 'linear-gradient(to right, #6366f1, #8b5cf6, #d946ef)',
                    opacity: 0.8
                  }}></div>
                  <div className="p-5">
                    <div className="relative w-16 h-16 mb-4 mx-auto">
                      <div className="absolute inset-0 rounded-full bg-purple-100 dark:bg-purple-900/30 animate-pulse"></div>
                      <div className="absolute inset-4 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 opacity-20 blur-lg animate-pulse delay-100"></div>
                      <div className="absolute inset-0 rounded-full flex items-center justify-center">
                        <MessageSquare className="h-10 w-10 relative z-10 text-purple-500 dark:text-purple-400 animate-float" />
                      </div>
                    </div>
                    <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-2 text-center">Join the Discussion</h3>
                    <p className="text-slate-600 dark:text-slate-400 text-center max-w-sm mx-auto">
                      Connect with other developers, share your approach, and learn alternative solutions.
                    </p>
                    <div className="mt-6 flex justify-center">
                      <Button 
                        className="gap-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-md shadow-purple-500/20"
                      >
                        <MessageSquare className="h-3.5 w-3.5 mr-1" />
                        View Discussion
                      </Button>
                    </div>
                    <div className="mt-4 flex items-center justify-center text-xs text-slate-500 dark:text-slate-400 gap-1">
                      <Users className="h-3 w-3 mr-1" />
                      <span>328 developers participating</span>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
        
        {/* Horizontal resizer - only visible on desktop */}
        {!isMobile && (
          <div
            className="relative w-1 h-full flex-shrink-0 z-10 group cursor-ew-resize"
            onMouseDown={startHorizontalResize}
          >
            <div className="absolute inset-0 w-1 h-full bg-indigo-100 dark:bg-indigo-900/30 group-hover:bg-indigo-300 dark:group-hover:bg-indigo-700/50 transition-colors duration-300"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-6 h-12 bg-white dark:bg-slate-800 rounded-md border border-indigo-200 dark:border-indigo-800/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-sm">
              <Grip className="h-4 w-4 text-indigo-500 dark:text-indigo-400" />
            </div>
          </div>
        )}

        {/* Right panel container */}
        <div
          className={`flex flex-col h-full ${hasMounted && isMobile && activePanel === "problem" ? "hidden" : ""}`}
          style={{ width: hasMounted && isMobile ? "100%" : `${100 - leftPanelWidth}%` }}
        >
          {/* Code editor */}
          <div
            className={`flex flex-col overflow-hidden ${
              hasMounted && isMobile ? (activePanel === "code" ? "block" : "hidden") : ""
            } ${hasMounted && isMobile ? "pb-24" : ""}`}
            style={{
              flexBasis: hasMounted && isMobile ? "100%" : `${editorHeight}%`,
              flexGrow: 0,
              flexShrink: 1,
              minHeight: 0,
              maxHeight: hasMounted && isMobile ? "100%" : `${editorHeight}%`,
              height: hasMounted && isMobile ? "100%" : undefined,
              transition: "all 0.3s ease-in-out" // Add smooth transition
            }}
          >
            <div className="flex items-center justify-between p-2 md:p-3 bg-white dark:bg-black border-b border-indigo-100 dark:border-indigo-900/50 flex-shrink-0">
              <div className="flex items-center">
                <div className="flex items-center mr-3 md:mr-4">
                  {/* Logo - "N" on mobile, "NexEditor" on desktop */}
                  <div className="flex items-center justify-center w-7 h-7 md:w-auto md:h-auto">
                    <span className="hidden md:block text-base font-semibold text-indigo-700 dark:text-indigo-300 bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 dark:from-indigo-300 dark:via-purple-300 dark:to-indigo-300">
                      NexEditor
                    </span>
                    <div className="md:hidden flex items-center justify-center w-7 h-7 rounded-md bg-gradient-to-br from-indigo-600 to-purple-600 text-white font-bold text-lg shadow-sm">
                      N
                    </div>
                  </div>
                </div>
                {/* Custom Language Dropdown */}
                <Popover open={languageDropdownOpen} onOpenChange={setLanguageDropdownOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mr-2 flex items-center gap-1 md:gap-2 border-indigo-200 dark:border-indigo-800/50 bg-gradient-to-r from-white to-slate-50 dark:from-slate-800 dark:to-slate-800/90 text-slate-700 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 min-w-[120px] md:min-w-[180px] h-8 md:h-9 pl-1 md:pl-2 pr-2 md:pr-3 overflow-hidden group relative"
                    >
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-indigo-500 to-indigo-600 dark:from-indigo-400 dark:to-indigo-500"></div>
                      <div className="flex items-center gap-1 md:gap-2 overflow-hidden">
                        <div className="flex items-center justify-center w-5 h-5 md:w-6 md:h-6 bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900 dark:to-indigo-800/30 rounded-md border border-indigo-200 dark:border-indigo-700/30 shadow-sm flex-shrink-0">
                          {LANGUAGE_ICONS[language as keyof typeof LANGUAGE_ICONS] || (
                            <Code className="h-3 w-3 md:h-3.5 md:w-3.5 text-indigo-500 dark:text-indigo-400" />
                          )}
                        </div>
                        <div className="flex flex-col leading-none overflow-hidden">
                          <span className="font-medium text-xs md:text-sm truncate">
                            {parseLanguageName(JUDGE0_LANGUAGES[language as keyof typeof JUDGE0_LANGUAGES]).name}
                          </span>
                          <span className="text-[10px] md:text-xs text-slate-500 dark:text-slate-400 truncate">
                            {parseLanguageName(JUDGE0_LANGUAGES[language as keyof typeof JUDGE0_LANGUAGES]).version}
                          </span>
                        </div>
                      </div>
                      <ChevronDown className="h-3 w-3 ml-auto opacity-60 group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition-colors" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent align="start" className="w-[680px] p-0 max-h-[600px] overflow-hidden flex flex-col border-indigo-100 dark:border-indigo-900/50 shadow-lg rounded-xl">
                    <div className="language-dropdown-header sticky top-0 z-30 bg-white dark:bg-black border-b border-indigo-100 dark:border-indigo-900/50 p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className="h-5 w-1 bg-gradient-to-b from-indigo-500 to-purple-500 rounded-full"></div>
                          <h3 className="font-semibold text-slate-800 dark:text-slate-200 text-base">Select Programming Language</h3>
                        </div>
                        <div className="text-xs bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-30 px-2 py-0.5 rounded-full font-medium">
                          {Object.keys(JUDGE0_LANGUAGES).length} languages available
                        </div>
                      </div>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input 
                          placeholder="Search languages..." 
                          className="pl-10 py-2 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg"
                          value={searchLanguage}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchLanguage(e.target.value)}
                        />
                      </div>
                    </div>
                    
                    <div className="overflow-y-auto flex-1 p-4 custom-scrollbar bg-gradient-to-br from-slate-50/50 to-white dark:from-slate-900 dark:to-slate-800/90">
                      <div className="language-grid grid grid-cols-3 gap-x-3 gap-y-2.5">
                        {Object.entries(JUDGE0_LANGUAGES)
                          .filter(([id, name]) => 
                            !searchLanguage || name.toLowerCase().includes(searchLanguage.toLowerCase()))
                          .map(([langId, langName]: [string, string], index: number, array: [string, string][]) => {
                            const { name, version } = parseLanguageName(langName);
                            const isSelected: boolean = language === langId;
                            const showDivider: boolean = index > 0 && index % 6 === 0 && index !== array.length - 1;
                            return (
                              <Fragment key={`lang-${langId}`}>
                                {showDivider && (
                                  <div className="col-span-3 h-px bg-gradient-to-r from-transparent via-slate-200 dark:via-slate-700 to-transparent my-2.5"></div>
                                )}
                                <div
                                  className={`language-item group h-14 rounded-lg px-3 transition-all duration-200 hover:shadow-md border ${
                                    isSelected 
                                      ? 'border-indigo-200 dark:border-indigo-800/50 bg-indigo-50/70 dark:bg-indigo-900/20' 
                                      : 'border-transparent hover:border-slate-200 dark:hover:border-slate-700 hover:bg-white dark:hover:bg-slate-800/60'
                                  } ${isSelected ? 'active' : ''}`}
                                  onClick={() => {
                                    handleLanguageChange(langId);
                                    setLanguageDropdownOpen(false);
                                  }}
                                >
                                  <div className="flex items-center gap-3 w-full h-full overflow-hidden">
                                    <div className="language-icon-container flex-shrink-0 w-7 h-7 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-center shadow-sm group-hover:from-indigo-50 group-hover:to-indigo-100 dark:group-hover:from-indigo-900/20 dark:group-hover:to-indigo-900/30 transition-all duration-200">
                                      {LANGUAGE_ICONS[langId] || (
                                        <div className="flex items-center justify-center w-full h-full">
                                          <Code className="h-3.5 w-3.5 text-slate-400 group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition-colors" />
                                        </div>
                                      )}
                                    </div>
                                    <div className="flex flex-col leading-tight overflow-hidden flex-1">
                                      <span className="font-medium truncate text-slate-700 dark:text-slate-300 group-hover:text-indigo-700 dark:group-hover:text-indigo-300 transition-colors">
                                        {name}
                </span>
                                      {version && (
                                        <span className="version truncate text-xs text-slate-500 dark:text-slate-400 group-hover:text-indigo-500/70 dark:group-hover:text-indigo-400/70 transition-colors">
                                          {version}
                                        </span>
                                      )}
                                    </div>
                                    {isSelected && (
                                      <div className="flex-shrink-0 h-5 w-5 bg-indigo-500 dark:bg-indigo-400 rounded-full flex items-center justify-center">
                                        <Check className="h-3 w-3 text-white" />
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </Fragment>
                            );
                          })}
              </div>
              
                      {searchLanguage && Object.entries(JUDGE0_LANGUAGES).filter(([id, name]) => 
                        name.toLowerCase().includes(searchLanguage.toLowerCase())).length === 0 && (
                        <div className="text-center py-12 px-4">
                          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 mb-3">
                            <Search className="h-6 w-6 text-slate-400" />
                          </div>
                          <h4 className="text-base font-medium text-slate-700 dark:text-slate-300 mb-1">No Results Found</h4>
                          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                            We couldn't find any programming language matching "{searchLanguage}"
                          </p>
                        </div>
                      )}
                    </div>
                    
                    <div className="border-t border-slate-200 dark:border-slate-700 px-4 py-3 flex justify-between items-center bg-gradient-to-r from-slate-50 to-white dark:from-slate-900 dark:to-slate-800">
                      <div className="flex items-center">
                        <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
                        <div className="text-sm text-slate-600 dark:text-slate-300">
                          Currently using: <span className="font-semibold text-indigo-600 dark:text-indigo-400 ml-1">{parseLanguageName(JUDGE0_LANGUAGES[language as keyof typeof JUDGE0_LANGUAGES]).name}</span>
                        </div>
                      </div>
                      {searchLanguage && (
                        <Button 
                          variant="outline"
                          size="sm" 
                          onClick={() => setSearchLanguage("")}
                          className="h-8 text-xs border-indigo-200 dark:border-indigo-800/50 bg-white dark:bg-slate-800"
                        >
                          <X className="h-3.5 w-3.5 mr-1.5" />
                          Clear Search
                        </Button>
                      )}
                    </div>
                  </PopoverContent>
                </Popover>
                {/* Move Focus Mode button to the right, before Format */}
              </div>
              <div className="flex items-center gap-2">
                {/* Mobile Run and Submit buttons */}
                {hasMounted && isMobile && (
                  <div className="flex items-center gap-1.5">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 px-2 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800/50"
                      onClick={runCode}
                      disabled={isRunning}
                    >
                      {isRunning ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Play className="h-3.5 w-3.5" />}
                      {!isRunning && <span className="text-xs ml-1">Run</span>}
                    </Button>
                    <Button
                      size="sm"
                      className="h-8 px-2 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white"
                      onClick={submitCode}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                      {!isSubmitting && <span className="text-xs ml-1">Submit</span>}
                    </Button>
                  </div>
                )}
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={toggleFocusMode}
                  className="gap-1.5 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800/50 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 hidden md:flex"
                >
                  {focusMode ? (
                    <>
                      <Minimize2 className="h-3.5 w-3.5 text-indigo-500 dark:text-indigo-400" />
                      <span className="hidden sm:inline">Exit Focus</span>
                    </>
                  ) : (
                    <>
                      <Maximize2 className="h-3.5 w-3.5 text-indigo-500 dark:text-indigo-400" />
                      <span className="hidden sm:inline">Focus Mode</span>
                    </>
                  )}
                </Button>
                {/* Format button with spinner and tooltip */}
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="hidden md:flex text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800/50 hover:bg-indigo-50 dark:hover:bg-indigo-900/30"
                      onClick={formatCode}
                      disabled={isFormatting}
                    >
                      {isFormatting ? (
                        <>
                          <span className="relative h-3.5 w-3.5 mr-1.5">
                            <RotateCw className="h-3.5 w-3.5 text-indigo-500 dark:text-indigo-400 animate-spin" />
                            <span className="absolute inset-0 h-3.5 w-3.5 bg-indigo-100 dark:bg-indigo-900/30 rounded-full animate-ping opacity-75"></span>
                          </span>
                          <span>Formatting...</span>
                        </>
                      ) : formatSuccess ? (
                        <>
                          <span className="relative h-3.5 w-3.5 mr-1.5">
                            <Check className="h-3.5 w-3.5 text-green-500 dark:text-green-400" />
                            <span className="absolute inset-0 h-3.5 w-3.5 bg-green-100 dark:bg-green-900/30 rounded-full animate-ping opacity-75"></span>
                          </span>
                          <span className="text-green-600 dark:text-green-400">Formatted!</span>
                        </>
                      ) : noChangesNeeded ? (
                        <>
                          <span className="relative h-3.5 w-3.5 mr-1.5">
                            <Check className="h-3.5 w-3.5 text-blue-500 dark:text-blue-400" />
                          </span>
                          <span className="text-blue-600 dark:text-blue-400">Already formatted</span>
                        </>
                      ) : (
                        <>
                          <Code className="h-3.5 w-3.5 mr-1.5 text-indigo-500 dark:text-indigo-400" />
                          <span>Format</span>
                        </>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-72 p-3 text-xs" align="end">
                    <div className="text-slate-700 dark:text-slate-300 space-y-2.5">
                      <div>
                        <p className="font-medium text-sm">Format your code</p>
                        <p className="text-slate-500 dark:text-slate-400 mt-1">
                          Formats the code according to language-specific rules.
                        </p>
                      </div>
                      
                      <div className="border-t border-slate-200 dark:border-slate-700 pt-2.5">
                        <p className="font-medium">Supported Languages:</p>
                        <ul className="mt-1 space-y-1 text-slate-500 dark:text-slate-400">
                          <li className="flex items-center">
                            <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                            Java, JavaScript, TypeScript, Python, C, C++
                          </li>
                          <li className="flex items-center">
                            <span className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></span>
                            Other languages use basic indentation
                          </li>
                        </ul>
                      </div>
                      
                      <div className="border-t border-slate-200 dark:border-slate-700 pt-2.5">
                        <p className="font-medium">Keyboard shortcuts:</p>
                        <div className="flex items-center mt-1">
                          <kbd className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 font-mono text-[10px] mr-1.5">
                            {appTheme === 'dark' ? 'Shift+Alt+F' : 'Alt+Shift+F'}
                          </kbd>
                          <span className="text-slate-500 dark:text-slate-400">or</span>
                          <kbd className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 font-mono text-[10px] mx-1.5">
                            Ctrl+K
                          </kbd>
                          <kbd className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 font-mono text-[10px]">
                            Ctrl+F
                          </kbd>
                        </div>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
                
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-slate-700 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 hover:text-indigo-700 dark:hover:text-indigo-30"
                  asChild
                >
                  <Popover>
                    <PopoverTrigger asChild>
                      <span><Settings className="h-4 w-4 cursor-pointer" /></span>
                    </PopoverTrigger>
                    <PopoverContent align="end" className="w-72 p-0 border border-indigo-200/80 dark:border-indigo-800/50 shadow-xl rounded-xl overflow-hidden">
                      {/* Gradient purple header */}
                      <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-600 dark:from-indigo-600 dark:via-purple-600 dark:to-indigo-700 p-4 relative flex items-center justify-between">
                        <div className="absolute top-0 left-0 right-0 h-px bg-white/20"></div>
                        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[length:16px_16px]"></div>
                         <h3 className="text-sm font-medium text-purple-900 dark:text-purple-100 flex items-center justify-between">
                          <Settings className="h-4 w-4 mr-2 text-white/80" />
                          <span className="text-white font-semibold">Editor Settings</span>
                         </h3>
                        <div className="h-5 w-5 rounded-full bg-white/10 flex items-center justify-center">
                          <Code className="h-3 w-3 text-white/70" />
                        </div>
                      </div>
                       
                      <div className="p-4 bg-gradient-to-b from-white to-indigo-50/50 dark:from-slate-900 dark:to-purple-900/20 border-t border-indigo-100 dark:border-indigo-900/30">
                         <div className="mb-4">
                          <label className="block text-xs font-medium mb-2 text-indigo-900 dark:text-indigo-100 flex items-center justify-between">
                             <span className="flex items-center">
                              <MonitorSmartphone className="h-3.5 w-3.5 mr-1.5 text-indigo-500 dark:text-indigo-300" />
                              Theme
                             </span>
                            <span className="text-xs font-medium text-indigo-700 dark:text-indigo-300">{editorTheme === "vs-dark" ? "Dark" : "Light"}</span>
                           </label>
                        <div className="flex gap-2">
                             <button 
                               onClick={() => setEditorTheme("vs-dark")}
                               className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 flex-1 ${
                                 editorTheme === "vs-dark" 
                                 ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-sm" 
                                 : "bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-800/40"
                               }`}>
                               <span className="flex items-center justify-center">
                                 <Moon className="h-3 w-3 mr-1.5" />
                                 Dark
                               </span>
                             </button>
                             <button 
                               onClick={() => setEditorTheme("light")}
                               className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 flex-1 ${
                                 editorTheme === "light" 
                                 ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-sm" 
                                 : "bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-800/40"
                               }`}>
                               <span className="flex items-center justify-center">
                                 <Sun className="h-3 w-3 mr-1.5" />
                                 Light
                               </span>
                             </button>
                        </div>
                      </div>
                         <div className="mb-4">
                          <label className="block text-xs font-medium mb-2 text-indigo-900 dark:text-indigo-100 flex items-center justify-between">
                             <span className="flex items-center">
                              <Type className="h-3.5 w-3.5 mr-1.5 text-indigo-500 dark:text-indigo-300" />
                              Font Size
                             </span>
                            <span className="text-xs font-medium text-indigo-700 dark:text-indigo-300">{fontSize}px</span>
                           </label>
                           <div className="relative mt-2">
                            <div className="h-1.5 bg-indigo-100 dark:bg-indigo-900/30 rounded-full w-full overflow-hidden">
                               <div
                                className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 dark:from-indigo-400 dark:to-purple-400"
                                style={{ width: `${((fontSize - 12) / 12) * 100}%` }}
                              ></div>
                      </div>
                             <input 
                               type="range" 
                               min="12" 
                               max="24" 
                               value={fontSize} 
                               onChange={e => setFontSize(Number(e.target.value))} 
                               className="absolute inset-0 w-full h-1.5 opacity-0 cursor-pointer" 
                             />
                      </div>
                           <div className="flex justify-between mt-1.5">
                            <span className="text-[10px] text-indigo-500/70 dark:text-indigo-400/70">12px</span>
                            <span className="text-[10px] text-indigo-500/70 dark:text-indigo-400/70">24px</span>
                           </div>
                         </div>
                         <div className="mb-4">
                          <label className="block text-xs font-medium mb-2 text-indigo-900 dark:text-indigo-100 flex items-center justify-between">
                             <span className="flex items-center">
                              <Indent className="h-3.5 w-3.5 mr-1.5 text-indigo-500 dark:text-indigo-300" />
                              Tab Size
                             </span>
                            <span className="text-xs font-medium text-indigo-700 dark:text-indigo-300">{tabSize} spaces</span>
                           </label>
                           <div className="relative mt-2">
                            <div className="h-1.5 bg-indigo-100 dark:bg-indigo-900/30 rounded-full w-full overflow-hidden">
                               <div 
                                className="h-full bg-gradient-to-r from-purple-500 to-pink-500 dark:from-purple-400 dark:to-pink-400" 
                                style={{ width: `${((tabSize - 2) / 6) * 100}%` }}
                              ></div>
                             </div>
                             <input 
                               type="range" 
                               min="2" 
                               max="8" 
                               value={tabSize} 
                               onChange={e => setTabSize(Number(e.target.value))} 
                               className="absolute inset-0 w-full h-1.5 opacity-0 cursor-pointer" 
                             />
                           </div>
                           <div className="flex justify-between mt-1.5">
                            <span className="text-[10px] text-indigo-500/70 dark:text-indigo-400/70">2 spaces</span>
                            <span className="text-[10px] text-indigo-500/70 dark:text-indigo-400/70">8 spaces</span>
                           </div>
                         </div>
                         
                         {/* Footer with reset button */}
                         <div className="pt-3 mt-3 border-t border-indigo-200 dark:border-indigo-800/50">
                      <button
                        onClick={() => setCode(preloadCode)}
                             className="w-full py-2.5 rounded-lg bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-600 text-white font-medium text-xs hover:from-indigo-600 hover:via-purple-600 hover:to-indigo-700 transition-all duration-200 shadow-sm hover:shadow-md shadow-indigo-500/10 hover:shadow-indigo-500/20 relative overflow-hidden group"
                      >
                             <span className="absolute inset-0 w-full h-full bg-[linear-gradient(90deg,rgba(255,255,255,0.1)_0%,rgba(255,255,255,0.2)_20%,rgba(255,255,255,0)_60%)] translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></span>
                             <span className="relative flex items-center justify-center">
                               <RefreshCw className="h-3 w-3 mr-1.5" />
                        Reset Code
                             </span>
                      </button>
                         </div>
                       </div>
                    </PopoverContent>
                  </Popover>
                </Button>
              </div>
            </div>
            
            <div className="flex-1 overflow-auto" style={{ minHeight: 0 }}>
              {/* Editor wrapper with subtle background gradient */}
              <div className="h-full w-full relative bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900">
                {editorLoading || initialLoading ? (
                  <div className="flex items-center justify-center h-full w-full overflow-hidden">
                    <div className="w-full h-full flex flex-col">
                      {/* Premium skeleton loader */}
                      <div className="h-full w-full relative overflow-hidden rounded-md">
                        {/* Background with subtle gradient */}
                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/40 to-purple-50/40 dark:from-indigo-900/10 dark:to-purple-900/10"></div>
                        {/* Animated gradient overlay */}
                        <div className="absolute inset-0 bg-[linear-gradient(110deg,transparent_33%,rgba(79,70,229,0.05)_50%,transparent_66%)] dark:bg-[linear-gradient(110deg,transparent_33%,rgba(79,70,229,0.1)_50%,transparent_66%)] bg-size-200 animate-shimmer"></div>
                        {/* Content placeholder */}
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="space-y-8 w-1/2 max-w-md">
                            <div className="flex items-center space-x-3">
                              <div className="h-10 w-10 rounded-full bg-indigo-100/60 dark:bg-indigo-900/20 flex items-center justify-center">
                                <Code className="h-5 w-5 text-indigo-400/60 dark:text-indigo-400/40" />
                              </div>
                              <div className="h-3 bg-indigo-200/60 dark:bg-indigo-700/30 rounded-md w-36"></div>
                            </div>
                            <div className="space-y-3">
                              <div className="h-3 bg-slate-200/60 dark:bg-slate-700/30 rounded-md w-full"></div>
                              <div className="h-3 bg-slate-200/60 dark:bg-slate-700/30 rounded-md w-5/6"></div>
                              <div className="h-3 bg-slate-200/60 dark:bg-slate-700/30 rounded-md w-4/6"></div>
                            </div>
                            <div className="space-y-3">
                              <div className="h-3 bg-indigo-200/40 dark:bg-indigo-800/20 rounded-md w-full"></div>
                              <div className="h-3 bg-indigo-200/40 dark:bg-indigo-800/20 rounded-md w-3/4"></div>
                              <div className="h-3 bg-indigo-200/40 dark:bg-indigo-800/20 rounded-md w-5/6"></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <CodeEditor 
                    code={code} 
                    onChange={setCode} 
                    language={language} 
                    theme={editorTheme} 
                    fontSize={fontSize} 
                    tabSize={tabSize}
                    onEditorMount={(editor, monaco) => {
                      editorRef.current = editor;
                      monacoRef.current = monaco;
                    }}
                  />
                )}
              </div>
            </div>
          </div>

          {/* Vertical resizer - only visible on desktop */}
          {!isMobile && (
            <div
              className="relative h-1 w-full flex-shrink-0 z-10 group cursor-ns-resize"
              onMouseDown={startVerticalResize}
            >
              <div className="absolute inset-0 h-1 w-full bg-indigo-100 dark:bg-indigo-900/30 group-hover:bg-indigo-300 dark:group-hover:bg-indigo-700/50 transition-colors duration-300"></div>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-6 w-12 bg-white dark:bg-slate-800 rounded-md border border-indigo-200 dark:border-indigo-800/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-sm">
                <Grip className="h-4 w-4 text-indigo-500 dark:text-indigo-400 rotate-90" />
              </div>
            </div>
          )}

          {/* Results panel */}
          <div
            className={`flex flex-col overflow-hidden ${
              hasMounted && isMobile ? (activePanel === "results" ? "block" : "hidden") : ""
            } ${hasMounted && isMobile ? "pb-24" : ""}`}
            style={{
              flexBasis: hasMounted && isMobile ? "100%" : `${100 - editorHeight}%`,
              flexGrow: 0,
              flexShrink: 0,
              minHeight: 0,
              maxHeight: hasMounted && isMobile ? "100%" : `${100 - editorHeight}%`,
              height: hasMounted && isMobile ? "100%" : undefined,
              transition: "all 0.3s ease-in-out" // Add smooth transition
            }}
          >
            <div className="flex items-center justify-between p-2 md:p-3 bg-white dark:bg-black border-b border-indigo-100 dark:border-indigo-900/50">
              <div className="flex items-center gap-2">
                <Terminal className="h-4 w-4 text-indigo-500 dark:text-indigo-400" />
                <span className="font-medium text-slate-700 dark:text-slate-300">Results</span>
              </div>
              
              <div className="flex items-center gap-2">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-7 w-7 rounded-md hover:bg-indigo-50 dark:hover:bg-indigo-900/30 text-slate-500 dark:text-slate-400 hover:text-indigo-700 dark:hover:text-indigo-300"
                  onClick={toggleResultsPanelFullscreen}
                  aria-label={isResultsPanelFullscreen ? "Exit fullscreen" : "Fullscreen"}
                >
                  {isResultsPanelFullscreen ? (
                    <Minimize2 className="h-4 w-4" />
                  ) : (
                    <Maximize2 className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
            
            {/* Results Content */}
            <div className="flex-1 relative bg-gradient-to-br from-slate-50 to-white dark:from-slate-900 dark:to-slate-800/80 overflow-auto pb-20">
              {/* Background decorative elements */}
              <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-indigo-50/50 dark:bg-indigo-900/20 rounded-full blur-3xl -z-0"></div>
              <div className="absolute bottom-1/4 right-1/4 w-40 h-40 bg-purple-50/30 dark:bg-purple-900/10 rounded-full blur-3xl -z-0"></div>
              
              {/* Tabs for Results Panel */}
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full p-4 relative z-10">
                <TabsList className="flex flex-nowrap justify-start overflow-x-auto overflow-y-hidden px-3 scroll-pl-2 snap-x snap-mandatory scrollbar-thin scrollbar-thumb-indigo-200 dark:scrollbar-thumb-indigo-900/40 bg-slate-100 dark:bg-slate-800/70 rounded-lg backdrop-blur-sm border border-slate-200/80 dark:border-slate-700/30 shadow-sm mb-3 gap-1.5 p-2">
                  <TabsTrigger
                    value="sample"
                    className="flex-shrink-0 min-w-[140px] px-3 rounded-md py-1.5 data-[state=active]:bg-white data-[state=active]:dark:bg-black/95 data-[state=active]:text-indigo-700 data-[state=active]:dark:text-indigo-30 data-[state=active]:shadow-sm relative overflow-hidden group"
                  >
                    <div className="absolute inset-0 opacity-0 group-data-[state=active]:opacity-100 transition-opacity">
                      <div className="absolute inset-x-0 -bottom-1 h-0.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
                    </div>
                    <FileText className="h-3.5 w-3.5 mr-1.5 text-indigo-500/70 dark:text-indigo-400/70 group-data-[state=active]:text-indigo-600 dark:group-data-[state=active]:text-indigo-400" />
                    Sample Testcases
                  </TabsTrigger>
                  <TabsTrigger
                    value="hidden"
                    className="flex-shrink-0 min-w-[140px] px-3 rounded-md py-1.5 data-[state=active]:bg-white data-[state=active]:dark:bg-black/95 data-[state=active]:text-indigo-700 data-[state=active]:dark:text-indigo-30 data-[state=active]:shadow-sm relative overflow-hidden group"
                  >
                    <div className="absolute inset-0 opacity-0 group-data-[state=active]:opacity-100 transition-opacity">
                      <div className="absolute inset-x-0 -bottom-1 h-0.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
                    </div>
                    <BarChart2 className="h-3.5 w-3.5 mr-1.5 text-indigo-500/70 dark:text-indigo-400/70 group-data-[state=active]:text-indigo-600 dark:group-data-[state=active]:text-indigo-400" />
                    Hidden Testcases
                  </TabsTrigger>
                  <TabsTrigger
                    value="custom"
                    className="flex-shrink-0 min-w-[140px] px-3 rounded-md py-1.5 data-[state=active]:bg-white data-[state=active]:dark:bg-black/95 data-[state=active]:text-indigo-700 data-[state=active]:dark:text-indigo-30 data-[state=active]:shadow-sm relative overflow-hidden group"
                  >
                    <div className="absolute inset-0 opacity-0 group-data-[state=active]:opacity-100 transition-opacity">
                      <div className="absolute inset-x-0 -bottom-1 h-0.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
                    </div>
                    <Sparkles className="h-3.5 w-3.5 mr-1.5 text-indigo-500/70 dark:text-indigo-400/70 group-data-[state=active]:text-indigo-600 dark:group-data-[state=active]:text-indigo-400" />
                    Custom Testcase
                  </TabsTrigger>
                </TabsList>
                
                {/* Sample Testcases Tab */}
                <TabsContent value="sample" className="focus-visible:outline-none focus-visible:ring-0">
                  {showEvaluatingSkeletons && skeletonTab === "sample" ? (
                    <div className="space-y-4 animate-in fade-in-50 slide-in-from-bottom-3 duration-300">
                      {/* Summary skeleton */}
                      <div className="flex items-center justify-between mb-2">
                        <Skeleton className="h-5 w-40 bg-slate-200/70 dark:bg-slate-700/50" />
                        <Skeleton className="h-6 w-28 rounded-full bg-slate-200/70 dark:bg-slate-700/50" />
                      </div>
                      
                      {/* Test cases skeletons */}
                      <div className="bg-white dark:bg-black rounded-lg shadow-sm overflow-hidden border border-slate-200 dark:border-slate-700/50">
                        {/* Header skeleton */}
                        <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700/50 bg-gradient-to-r from-slate-50 to-slate-100/50 dark:from-slate-800/70 dark:to-slate-800/50 flex justify-between">
                          <div className="flex items-center gap-2">
                            <Skeleton className="h-6 w-6 rounded-full bg-slate-200/70 dark:bg-slate-700/50" />
                            <Skeleton className="h-5 w-24 bg-slate-200/70 dark:bg-slate-700/50" />
                          </div>
                          <Skeleton className="h-6 w-20 rounded-full bg-slate-200/70 dark:bg-slate-700/50" />
                        </div>
                        
                        {/* Content skeleton */}
                        <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Input skeleton */}
                          <div className="rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700/50">
                            <div className="bg-slate-50 dark:bg-slate-800/60 px-3 py-1.5 border-b border-slate-200 dark:border-slate-700/50">
                              <Skeleton className="h-4 w-16 bg-slate-200/70 dark:bg-slate-700/50" />
                            </div>
                            <div className="p-3 space-y-2">
                              <Skeleton className="h-4 w-full bg-slate-200/70 dark:bg-slate-700/50" />
                              <Skeleton className="h-4 w-3/4 bg-slate-200/70 dark:bg-slate-700/50" />
                              <Skeleton className="h-4 w-1/2 bg-slate-200/70 dark:bg-slate-700/50" />
                            </div>
                          </div>
                          
                          {/* Expected Output skeleton */}
                          <div className="rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700/50">
                            <div className="bg-slate-50 dark:bg-slate-800/60 px-3 py-1.5 border-b border-slate-200 dark:border-slate-700/50">
                              <Skeleton className="h-4 w-36 bg-slate-200/70 dark:bg-slate-700/50" />
                            </div>
                            <div className="p-3 space-y-2">
                              <Skeleton className="h-4 w-full bg-slate-200/70 dark:bg-slate-700/50" />
                              <Skeleton className="h-4 w-2/3 bg-slate-200/70 dark:bg-slate-700/50" />
                              <Skeleton className="h-4 w-1/4 bg-slate-200/70 dark:bg-slate-700/50" />
                            </div>
                          </div>
                          
                          {/* Your Output skeleton - professional loading style */}
                          <div className="rounded-lg overflow-hidden md:col-span-2 border border-indigo-200 dark:border-indigo-900/30 relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-r from-indigo-50/50 via-purple-50/50 to-indigo-50/50 dark:from-indigo-900/20 dark:via-purple-900/20 dark:to-indigo-900/20 animate-gradient-x"></div>
                            <div className="px-3 py-1.5 border-b border-indigo-200 dark:border-indigo-900/30 bg-slate-50 dark:bg-slate-800/60 relative z-10 flex justify-between items-center">
                              <div className="flex items-center space-x-2">
                                <div className="h-2.5 w-2.5 rounded-full bg-indigo-500 animate-pulse-opacity"></div>
                                <span className="text-xs font-medium text-indigo-700 dark:text-indigo-300">
                                  Executing the code...
                                </span>
                              </div>
                            </div>
                            <div className="relative z-10">
                              <div className="p-3 space-y-2">
                                <Skeleton className="h-5 w-full bg-indigo-100/70 dark:bg-indigo-900/30" />
                                <Skeleton className="h-5 w-4/5 bg-indigo-100/70 dark:bg-indigo-900/30" />
                                <Skeleton className="h-5 w-2/3 bg-indigo-100/70 dark:bg-indigo-900/30" />
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {/* Footer skeleton */}
                        <div className="bg-slate-50 dark:bg-slate-800/50 px-4 py-2 border-t border-slate-200 dark:border-slate-700/50 flex justify-between items-center">
                          <Skeleton className="h-4 w-32 bg-slate-200/70 dark:bg-slate-700/50" />
                          <Skeleton className="h-4 w-32 bg-slate-200/70 dark:bg-slate-700/50" />
                        </div>
                      </div>
                    </div>
                  ) : sampleTestResults.length > 0 && activeTab === "sample" ? (
                    <div className="space-y-4 animate-in fade-in-50 slide-in-from-bottom-3 duration-500">
                      {/* Summary badge */}
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-sm text-slate-700 dark:text-slate-300">
                          <span className="font-medium">{sampleTestResults.length}</span> sample test cases evaluated
                        </div>
                        {sampleExecutionStatus && (
                          <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium shadow-sm
                            ${sampleExecutionStatus === 'success' ? 'bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200/70 dark:border-green-900/30 text-green-700 dark:text-green-400' : 
                            sampleExecutionStatus === 'warning' ? 'bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200/70 dark:border-amber-900/30 text-amber-700 dark:text-amber-400' :
                            'bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 border border-red-200/70 dark:border-red-900/30 text-red-700 dark:text-red-400'}`}>
                            {sampleExecutionStatus === 'success' ? (
                              <><Check className="h-3 w-3 mr-1.5" />All Sample Testcases Passed</>
                            ) : sampleExecutionStatus === 'warning' ? (
                              <><AlertTriangle className="h-3 w-3 mr-1.5" />Partially Passed</>
                            ) : (
                              <><XCircle className="h-3 w-3 mr-1.5" />No Sample Testcases Passed</>
                            )}
                        </div>
                        )}
                    </div>
                    
                      {/* Nested tabs for multiple test cases */}
                      <Tabs defaultValue={`sample-testcase-0`} className="w-full">
                        <TabsList className="flex flex-nowrap overflow-x-auto px-3 scrollbar-thin scrollbar-thumb-indigo-200 dark:scrollbar-thumb-indigo-900/40 bg-gradient-to-r from-slate-100/90 to-indigo-50/80 dark:from-slate-800/70 dark:to-indigo-900/30 rounded-lg backdrop-blur-sm border border-slate-200/80 dark:border-slate-700/30 shadow-sm mb-3 gap-1.5 p-2">
                          {sampleTestResults.map((result, idx) => (
                            <TabsTrigger
                              key={`sample-trigger-${result.id || idx}`}
                              value={`sample-testcase-${idx}`}
                              className="flex-shrink-0 min-w-[85px] rounded-md py-2 data-[state=active]:bg-white data-[state=active]:dark:bg-black/95 data-[state=active]:text-indigo-700 data-[state=active]:dark:text-indigo-30 data-[state=active]:shadow-sm relative overflow-hidden group transition-all duration-150"
                            >
                              <div className="absolute inset-0 opacity-0 group-data-[state=active]:opacity-100 transition-opacity duration-300">
                                <div className="absolute inset-x-0 -bottom-1 h-0.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
                                <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 to-purple-50/30 dark:from-indigo-900/30 dark:to-purple-900/20 opacity-0 group-data-[state=active]:opacity-100 transition-opacity"></div>
                              </div>
                              <div className="flex items-center justify-center gap-1.5">
                                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-white text-xs font-medium
                                  ${result.isCorrect 
                                    ? 'bg-gradient-to-br from-green-500 to-emerald-600' 
                                    : 'bg-gradient-to-br from-red-500 to-rose-600'}`}>
                                  {result.isCorrect ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                                </div>
                                <span className="font-medium text-sm group-data-[state=active]:text-indigo-600 dark:group-data-[state=active]:text-indigo-400">Test {idx + 1}</span>
                              </div>
                              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent opacity-0 group-hover:opacity-100 group-data-[state=active]:opacity-0 transition-opacity"></div>
                            </TabsTrigger>
                          ))}
                        </TabsList>
                        
                        {sampleTestResults.map((result, idx) => (
                          <TabsContent key={`sample-content-${result.id || idx}`} value={`sample-testcase-${idx}`} className="focus-visible:outline-none focus-visible:ring-0">
                            <div className="bg-white dark:bg-black rounded-lg shadow-sm overflow-hidden border border-slate-200 dark:border-slate-700/50">
                              <div className={`px-4 py-2 border-b border-slate-200 dark:border-slate-700/50 flex items-center justify-between
                                ${result.isCorrect 
                                  ? 'bg-gradient-to-r from-green-50 to-green-100/50 dark:from-green-900/20 dark:to-green-900/10' 
                                  : 'bg-gradient-to-r from-red-50 to-red-100/50 dark:from-red-900/20 dark:to-red-900/10'}`}>
                                <div className="flex items-center gap-2">
                                  <div className={`w-5 h-5 rounded-full flex items-center justify-center text-white text-xs font-medium
                                    ${result.isCorrect 
                                      ? 'bg-green-500' 
                                      : 'bg-red-500'}`}>
                                    {idx + 1}
                                  </div>
                                  <span className="font-medium text-slate-700 dark:text-slate-300">
                                    {result.isCorrect ? 'Passed' : 'Failed'}
                                  </span>
                                </div>
                                
                                <div className="flex items-center">
                                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium
                                    ${result.isCorrect 
                                      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
                                      : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'}`}>
                                    {result.isCorrect ? (
                                      <><Check className="h-3 w-3 mr-1" />Correct</>
                                    ) : (
                                      <><X className="h-3 w-3 mr-1" />Incorrect</>
                                    )}
                                  </span>
                                </div>
                              </div>
                              
                              <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700/50">
                                  <div className="bg-slate-50 dark:bg-slate-800/60 px-3 py-1.5 border-b border-slate-200 dark:border-slate-700/50 text-xs font-medium text-slate-700 dark:text-slate-300">
                                    Input
                                  </div>
                                  <div className="p-3 font-mono text-sm bg-white dark:bg-slate-800/30 text-slate-700 dark:text-slate-300">
                                    {formatTestCase(result.input)}
                                  </div>
                                </div>
                                
                                <div className="rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700/50">
                                  <div className="bg-slate-50 dark:bg-slate-800/60 px-3 py-1.5 border-b border-slate-200 dark:border-slate-700/50 text-xs font-medium text-slate-700 dark:text-slate-300">
                                    Expected Output
                                  </div>
                                  <div className="p-3 font-mono text-sm bg-white dark:bg-slate-800/30 text-slate-700 dark:text-slate-300">
                                    {formatTestCase(result.expectedOutput)}
                                  </div>
                                </div>
                                
                                {/* Only show the Your Output section if there are no errors/warnings */}
                                {!(result.stderr || result.compileOutput) && (
                                  <div className={`rounded-lg overflow-hidden md:col-span-2 
                                    ${result.isCorrect 
                                      ? 'border border-green-200 dark:border-green-900/30' 
                                      : 'border border-red-200 dark:border-red-900/30'}`}>
                                    <div className={`px-3 py-1.5 border-b flex items-center
                                      ${result.isCorrect 
                                        ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-900/30 text-green-800 dark:text-green-400' 
                                        : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-900/30 text-red-800 dark:text-red-400'}`}>
                                      {result.isCorrect ? (
                                    <Check className="h-3 w-3 mr-1.5" />
                                      ) : (
                                        <X className="h-3 w-3 mr-1.5" />
                                      )}
                                    Your Output
                                  </div>
                                  <div className="p-3 font-mono text-sm bg-white dark:bg-slate-800/30 text-slate-700 dark:text-slate-30">
                                      {formatTestCase(result.actualOutput)}
                                  </div>
                                </div>
                                )}
                                
                                {/* Show error messages if there are any */}
                                {(result.stderr || result.compileOutput) && (
                                  <div className="rounded-lg overflow-hidden border border-amber-200 dark:border-amber-900/30 md:col-span-2">
                                    <div className="bg-amber-50 dark:bg-amber-900/20 px-3 py-1.5 border-b border-amber-200 dark:border-amber-900/30 text-xs font-medium text-amber-800 dark:text-amber-400 flex items-center">
                                      <AlertTriangle className="h-3 w-3 mr-1.5" />
                                      Errors/Warnings
                              </div>
                                    <div className="p-3 font-mono text-sm bg-white dark:bg-slate-800/30 text-slate-700 dark:text-slate-30">
                                      {result.compileOutput && (
                                        <div className="mb-2">
                                          <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Compile Output:</div>
                                          <div className="text-red-600 dark:text-red-400 whitespace-pre-wrap">{result.compileOutput}</div>
                            </div>
                                      )}
                                      {result.stderr && (
                                        <div>
                                          <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Standard Error:</div>
                                          <div className="text-red-600 dark:text-red-400 whitespace-pre-wrap">{result.stderr}</div>
                    </div>
                                      )}
              </div>
            </div>
                  )}
                              </div>
                              
                              <div className="bg-slate-50 dark:bg-slate-800/50 px-4 py-2 border-t border-slate-200 dark:border-slate-700/50 flex justify-between items-center">
                                <div className="flex items-center">
                                  <Clock className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500 mr-1.5" />
                                  <span className="text-xs text-slate-500 dark:text-slate-400">Execution Time: {result.executionTime || 'N/A'}</span>
                        </div>
                                <div className="flex items-center">
                                  <Cpu className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500 mr-1.5" />
                                  <span className="text-xs text-slate-500 dark:text-slate-400">Memory Used: {result.memoryUsed || 'N/A'}</span>
                                </div>
                              </div>
                            </div>
                          </TabsContent>
                        ))}
                      </Tabs>
                    </div>
                  ) : (
                    // Display sample test cases when no code has been run
                    <div className="space-y-4">
                      {/* Summary banner for sample test cases */}
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-sm text-slate-700 dark:text-slate-300">
                          <span className="font-medium">{examples.length}</span> sample test cases available
                        </div>
                        <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-200/70 dark:border-indigo-800/50 text-indigo-700 dark:text-indigo-300 shadow-sm">
                          <Play className="h-3 w-3 mr-1.5" />
                          Run Code to Test
                        </div>
                      </div>
                      
                      {/* Tabs for each sample testcase */}
                      <Tabs defaultValue={`example-0`} className="w-full">
                        <TabsList className="bg-gradient-to-r from-slate-100/90 to-indigo-50/80 dark:from-slate-800/70 dark:to-indigo-900/30 p-1 rounded-lg overflow-hidden backdrop-blur-sm border border-slate-200/80 dark:border-slate-700/30 shadow-sm mb-3 w-full flex flex-wrap">
                          {examples.map((example: {id: string, input: string, output: string, explanation?: string}, idx: number) => (
                            <TabsTrigger
                              key={`example-trigger-${example.id || idx}`}
                              value={`example-${idx}`}
                              className="flex-1 min-w-[100px] rounded-md py-2 data-[state=active]:bg-white data-[state=active]:dark:bg-black/95 data-[state=active]:text-indigo-700 data-[state=active]:dark:text-indigo-30 data-[state=active]:shadow-sm relative overflow-hidden group transition-all duration-150"
                            >
                              <div className="absolute inset-0 opacity-0 group-data-[state=active]:opacity-100 transition-opacity duration-300">
                                <div className="absolute inset-x-0 -bottom-1 h-0.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
                                <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 to-purple-50/30 dark:from-indigo-900/30 dark:to-purple-900/20 opacity-0 group-data-[state=active]:opacity-100 transition-opacity"></div>
                              </div>
                              <div className="flex items-center justify-center gap-1.5">
                                <div className="w-5 h-5 rounded-full flex items-center justify-center text-white text-xs font-medium bg-gradient-to-br from-indigo-500 to-purple-600">
                                  {idx + 1}
                                </div>
                                <span className="hidden sm:inline font-medium text-sm group-data-[state=active]:text-indigo-600 dark:group-data-[state=active]:text-indigo-400">Test {idx + 1}</span>
                              </div>
                              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent opacity-0 group-hover:opacity-100 group-data-[state=active]:opacity-0 transition-opacity"></div>
                            </TabsTrigger>
                          ))}
                        </TabsList>
                        
                        {examples.map((example: {id: string, input: string, output: string, explanation?: string}, idx: number) => (
                          <TabsContent key={`example-content-${example.id || idx}`} value={`example-${idx}`} className="focus-visible:outline-none focus-visible:ring-0">
                            <div className="bg-white dark:bg-black rounded-lg shadow-sm overflow-hidden border border-slate-200 dark:border-slate-700/50">
                              <div className="px-4 py-2 border-b border-slate-200 dark:border-slate-700/50 flex items-center justify-between bg-gradient-to-r from-indigo-50 to-indigo-100/50 dark:from-indigo-900/20 dark:to-indigo-900/10">
                                <div className="flex items-center gap-2">
                                  <div className="w-5 h-5 rounded-full flex items-center justify-center text-white text-xs font-medium bg-indigo-500">
                                    {idx + 1}
                                  </div>
                                  <span className="font-medium text-slate-700 dark:text-slate-300">
                                    Sample Test Case
                                  </span>
                                </div>
                              </div>
                              
                              <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700/50">
                                  <div className="bg-slate-50 dark:bg-slate-800/60 px-3 py-1.5 border-b border-slate-200 dark:border-slate-700/50 text-xs font-medium text-slate-700 dark:text-slate-300">
                                    Input
                                  </div>
                                  <div className="p-3 font-mono text-sm bg-white dark:bg-slate-800/30 text-slate-700 dark:text-slate-300">
                                    {formatTestCase(example.input)}
                                  </div>
                                </div>
                                
                                <div className="rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700/50">
                                  <div className="bg-slate-50 dark:bg-slate-800/60 px-3 py-1.5 border-b border-slate-200 dark:border-slate-700/50 text-xs font-medium text-slate-700 dark:text-slate-300">
                                    Expected Output
                                  </div>
                                  <div className="p-3 font-mono text-sm bg-white dark:bg-slate-800/30 text-slate-700 dark:text-slate-300">
                                    {formatTestCase(example.output)}
                                  </div>
                                </div>
                                
                                {/* Explanation if available */}
                                {example.explanation && (
                                  <div className="rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700/50 md:col-span-2">
                                    <div className="bg-slate-50 dark:bg-slate-800/60 px-3 py-1.5 border-b border-slate-200 dark:border-slate-700/50 text-xs font-medium text-slate-700 dark:text-slate-300 flex items-center">
                                      <Info className="h-3 w-3 mr-1.5 text-indigo-500 dark:text-indigo-400" />
                                      Explanation
                                    </div>
                                    <div className="p-3 font-mono text-sm bg-white dark:bg-slate-800/30 text-slate-700 dark:text-slate-300">
                                      {formatTestCase(example.explanation)}
                                    </div>
                                  </div>
                                )}
                              </div>
                              
                              <div className="bg-slate-50 dark:bg-slate-800/50 px-4 py-2 border-t border-slate-200 dark:border-slate-700/50 flex justify-between items-center">
                                <div className="text-xs text-slate-500 dark:text-slate-400">
                                  Run code to test your solution against this example
                                </div>
                              </div>
                            </div>
                          </TabsContent>
                        ))}
                      </Tabs>
                    </div>
                  )}
                </TabsContent>
                
                {/* Hidden Testcases Tab */}
                <TabsContent value="hidden" className="focus-visible:outline-none focus-visible:ring-0">
                  <HiddenTestcasesTab
                    executingHiddenTestcases={executingHiddenTestcases}
                    hiddenTestResults={hiddenTestResults}
                    totalHiddenTestcases={totalHiddenTestcases}
                    completedHiddenTestcases={completedHiddenTestcases}
                    passedHiddenTestcases={passedHiddenTestcases}
                    skippedHiddenTestcases={skippedHiddenTestcases}
                    hiddenExecutionStatus={hiddenExecutionStatus}
                    isRunning={isRunning}
                    isSubmitting={isSubmitting}
                    submitCode={submitCode}
                  />
                </TabsContent>

                {/* Confetti celebration overlay */}
                {showCelebration && (
                  <div className="fixed inset-0 pointer-events-none z-50">
                    {/* This div is just a container for the confetti effect */}
                  </div>
                )}
              </Tabs>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Mobile Navigation Tabs */}
      {hasMounted && isMobile && (
        <div className="md:hidden fixed bottom-8 left-0 right-0 flex justify-center z-50 px-4">
          <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-full p-1.5 flex items-center w-full max-w-xs shadow-xl border border-indigo-100/50 dark:border-indigo-800/30">
            <button 
              onClick={() => setActivePanel("problem")} 
              className={`flex-1 py-2.5 px-3 rounded-full flex items-center justify-center gap-1.5 text-xs font-medium transition-all duration-300
              ${activePanel === "problem" 
                ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md" 
                : "text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50/50 dark:hover:bg-indigo-900/20"}`}
            >
              <FileText className="h-4 w-4" />
              <span>Problem</span>
            </button>
            <button 
              onClick={() => setActivePanel("code")} 
              className={`flex-1 py-2.5 px-3 rounded-full flex items-center justify-center gap-1.5 text-xs font-medium transition-all duration-300
              ${activePanel === "code" 
                ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md" 
                : "text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50/50 dark:hover:bg-indigo-900/20"}`}
            >
              <Code className="h-4 w-4" />
              <span>Code</span>
            </button>
            <button 
              onClick={() => setActivePanel("results")} 
              className={`flex-1 py-2.5 px-3 rounded-full flex items-center justify-center gap-1.5 text-xs font-medium transition-all duration-300
              ${activePanel === "results" 
                ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md" 
                : "text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50/50 dark:hover:bg-indigo-900/20"}`}
            >
              <Terminal className="h-4 w-4" />
              <span>Results</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
} 