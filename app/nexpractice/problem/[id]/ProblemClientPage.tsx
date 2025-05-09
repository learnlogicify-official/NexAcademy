"use client"

import React, { Fragment, useState, useRef, useEffect, useCallback } from "react"
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
  CheckCircle2,
  AlignLeft,
  ZoomIn,
  ZoomOut,
  Maximize,
  Minimize,
  Copy,
  ClipboardCopy,
  Sparkle,
  ArrowLeft
} from "lucide-react"
import { Avatar } from "@/components/ui/avatar"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { NexEditor as CodeEditor } from "@/components/NexEditor"
import { useMobile as useIsMobile } from "@/hooks/use-mobile"
import { useTheme } from "next-themes"
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"
import { CodingQuestionsSidebar } from "@/components/CodingQuestionsSidebar"
import { Input } from "@/components/ui/input"
import type { editor } from "monaco-editor"
import type { Monaco } from "@monaco-editor/react"
import { useSession } from "next-auth/react"
import { useProfilePic } from "@/components/ProfilePicContext"
import { useMutation, useQuery } from '@apollo/client';
import { RUN_CODE, SUBMIT_CODE } from './graphql/codeExecution';
import { getLanguageId } from './utils/getLanguageId';
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner"
import confetti from 'canvas-confetti'
import { HiddenTestcasesTab } from "./components/HiddenTestcasesTab";

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
const parseLanguageName = (fullName: string) => {
  // Match patterns like "Python (3.8.1)" or "JavaScript (Node.js 12.14.0)"
  const match = fullName.match(/^(.+?)\s+\((.+?)\)$/);
  if (match) {
    return { 
      name: match[1], 
      version: match[2] 
    };
  }
  return { name: fullName, version: "" };
};

export default function ProblemClientPage({ codingQuestion, defaultLanguage, preloadCode }: ProblemClientPageProps) {
  // Initialize language correctly based on defaultLanguage
  const processDefaultLanguage = (lang: string): string => {
    if (lang === "Java") return "62"; // Java ID
    return lang || "71"; // Default to Python 3.8.1 if not specified
  };
  
  const [language, setLanguage] = useState(processDefaultLanguage(defaultLanguage))
  // Add debug log after initialization
  useEffect(() => {
    console.log("Initial language state:", language);
    console.log("Default language prop:", defaultLanguage);
  }, [language, defaultLanguage]);
  const isMobile = useIsMobile()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { theme: appTheme, setTheme: setAppTheme } = useTheme()
  const [focusMode, setFocusMode] = useState(false)
  const [fontSize, setFontSize] = useState(14)
  const [tabSize, setTabSize] = useState(4)
  const [editorTheme, setEditorTheme] = useState<"vs-dark" | "light">("vs-dark")

  // Mobile view state
  const [activePanel, setActivePanel] = useState<"problem" | "code" | "results">(isMobile ? "problem" : "code")

  // Panel sizes (in percentages)
  const [leftPanelWidth, setLeftPanelWidth] = useState(isMobile ? 100 : 50)
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

  // Define styles for the question text based on the current theme
  const questionTextStyles = `
    .prose pre {
      position: relative;
      background-color: ${appTheme === 'dark' ? '#161b2a' : '#f8fafc'};
      border: 1px solid ${appTheme === 'dark' ? '#2a3655' : '#e5e7eb'};
      border-radius: 0.5rem;
      padding: 0.75rem 0.95rem;
      margin: 1rem 0;
      overflow-x: auto;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
      font-size: 0.85rem;
      line-height: 1.4;
      box-shadow: 0 1px 3px ${appTheme === 'dark' ? 'rgba(0, 0, 0, 0.1)' : 'rgba(0, 0, 0, 0.02)'};
    }
    
    .prose pre::before {
      content: "";
      position: absolute;
      top: 0.4rem;
      left: 0.4rem;
      width: 0.4rem;
      height: 0.4rem;
      border-radius: 50%;
      background-color: #ff5f56;
      box-shadow: 0.85rem 0 0 0 #ffbd2e, 1.7rem 0 0 0 #27c93f;
      opacity: 0.7;
    }
    
    .prose code {
      position: relative;
      background-color: ${appTheme === 'dark' ? 'rgba(99, 102, 241, 0.1)' : 'rgba(99, 102, 241, 0.05)'};
      border-radius: 0.25rem;
      padding: 0.1rem 0.3rem;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
      font-size: 0.85rem;
      color: ${appTheme === 'dark' ? '#a5b4fc' : '#4f46e5'};
      font-weight: 500;
      border: none;
      white-space: nowrap;
    }
    
    .prose pre code {
      background-color: transparent;
      padding: 0;
      border-radius: 0;
      color: inherit;
      box-shadow: none;
      border: none;
      font-weight: normal;
      white-space: pre;
      padding-top: 1rem; /* Add space for the circles */
    }
    
    .prose ul {
      list-style-type: none;
      padding-left: 1.5rem;
      margin: 1rem 0;
    }
    
    .prose ul li {
      position: relative;
      margin-top: 0.3rem;
      margin-bottom: 0.3rem;
      padding-left: 1rem;
      font-size: 0.95rem;
    }
    
    .prose ul li::before {
      content: "";
      position: absolute;
      left: -0.75rem;
      top: 0.4rem;
      height: 0.375rem;
      width: 0.375rem;
      border-radius: 50%;
      background-color: ${appTheme === 'dark' ? '#818cf8' : '#4f46e5'};
      transform: scale(0.8);
      opacity: 0.8;
    }
    
    .prose ol {
      list-style-type: none;
      counter-reset: item;
      padding-left: 1.5rem;
      margin: 1rem 0;
    }
    
    .prose ol li {
      position: relative;
      margin-top: 0.3rem;
      margin-bottom: 0.3rem;
      padding-left: 1rem;
      counter-increment: item;
      font-size: 0.95rem;
    }
    
    .prose ol li::before {
      content: counter(item);
      position: absolute;
      left: -1.4rem;
      top: 0;
      font-size: 0.7rem;
      font-weight: 600;
      width: 1.2rem;
      height: 1.2rem;
      border-radius: 50%;
      background-color: ${appTheme === 'dark' ? 'rgba(99, 102, 241, 0.2)' : 'rgba(99, 102, 241, 0.1)'};
      color: ${appTheme === 'dark' ? '#a5b4fc' : '#4f46e5'};
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .prose p {
      margin-top: 0.75rem;
      margin-bottom: 0.75rem;
      line-height: 1.5;
      letter-spacing: -0.01em;
      font-size: 0.95rem;
    }
    
    .prose p strong {
      font-weight: 600;
      color: ${appTheme === 'dark' ? '#a5b4fc' : '#4f46e5'};
    }
    
    .prose p em {
      font-style: italic;
      color: ${appTheme === 'dark' ? '#c4b5fd' : '#6d28d9'};
    }
    
    .prose h1, .prose h2, .prose h3, .prose h4 {
      font-weight: 700;
      line-height: 1.15;
      margin-top: 1.2rem;
      margin-bottom: 0.6rem;
      color: ${appTheme === 'dark' ? '#e2e8f0' : '#1e293b'};
      letter-spacing: -0.025em;
      position: relative;
      padding-bottom: 0.3rem;
    }
    
    .prose h1::after, .prose h2::after, .prose h3::after {
      content: "";
      position: absolute;
      bottom: 0;
      left: 0;
      width: 2rem;
      height: 0.1rem;
      background: linear-gradient(to right, #4f46e5, #8b5cf6, #d946ef);
      border-radius: 2px;
    }
    
    .prose h1 {
      font-size: 1.4rem;
    }
    
    .prose h2 {
      font-size: 1.25rem;
    }
    
    .prose h3 {
      font-size: 1.15rem;
    }
    
    .prose h4 {
      font-size: 1.05rem;
    }
    
    .prose blockquote {
      border-left: 4px solid ${appTheme === 'dark' ? '#4f46e5' : '#6366f1'};
      padding: 0.8rem 1.2rem;
      font-style: italic;
      margin: 1.25rem 0;
      color: ${appTheme === 'dark' ? '#94a3b8' : '#64748b'};
      background-color: ${appTheme === 'dark' ? 'rgba(99, 102, 241, 0.1)' : 'rgba(99, 102, 241, 0.05)'};
      border-radius: 0 0.5rem 0.5rem 0;
      box-shadow: 0 2px 5px ${appTheme === 'dark' ? 'rgba(0, 0, 0, 0.2)' : 'rgba(0, 0, 0, 0.03)'};
    }
    
    .prose blockquote p {
      margin: 0.35rem 0;
    }
    
    .prose a {
      color: ${appTheme === 'dark' ? '#93c5fd' : '#4f46e5'};
      text-decoration: none;
      border-bottom: 1px dotted ${appTheme === 'dark' ? '#93c5fd' : '#4f46e5'};
      transition: all 0.2s ease;
    }
    
    .prose a:hover {
      color: ${appTheme === 'dark' ? '#bfdbfe' : '#4338ca'};
      border-bottom: 1px solid ${appTheme === 'dark' ? '#bfdbfe' : '#4338ca'};
    }
    
    .prose table {
      width: 100%;
      border-collapse: separate;
      border-spacing: 0;
      margin: 1.5rem 0;
      border-radius: 0.5rem;
      overflow: hidden;
      box-shadow: 0 2px 10px ${appTheme === 'dark' ? 'rgba(0, 0, 0, 0.2)' : 'rgba(0, 0, 0, 0.03)'};
    }
    
    .prose table th {
      background-color: ${appTheme === 'dark' ? 'rgba(99, 102, 241, 0.3)' : 'rgba(99, 102, 241, 0.1)'};
      border: 1px solid ${appTheme === 'dark' ? '#334155' : '#e2e8f0'};
      padding: 0.75rem 1rem;
      text-align: left;
      font-weight: 600;
      color: ${appTheme === 'dark' ? '#a5b4fc' : '#4f46e5'};
      font-size: 0.875rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    
    .prose table td {
      border: 1px solid ${appTheme === 'dark' ? '#334155' : '#e2e8f0'};
      padding: 0.75rem 1rem;
      background-color: ${appTheme === 'dark' ? 'rgba(15, 23, 42, 0.7)' : 'rgba(255, 255, 255, 0.7)'};
    }
    
    .prose table tr:nth-child(even) td {
      background-color: ${appTheme === 'dark' ? 'rgba(15, 23, 42, 0.85)' : 'rgba(241, 245, 249, 0.5)'};
    }
    
    .prose img {
      max-width: 100%;
      height: auto;
      border-radius: 0.5rem;
      margin: 1.5rem 0;
      box-shadow: 0 4px 12px ${appTheme === 'dark' ? 'rgba(0, 0, 0, 0.3)' : 'rgba(0, 0, 0, 0.1)'};
    }

    /* Additional styles for better content density */
    .TabsContent {
      margin-top: 0.75rem !important;
    }

    .test-case-card {
      margin-bottom: 0.75rem;
    }
    
    .test-case-card .px-4 {
      padding-left: 0.85rem !important;
      padding-right: 0.85rem !important;
    }
    
    .test-case-card .py-3 {
      padding-top: 0.65rem !important;
      padding-bottom: 0.65rem !important;
    }
    
    .test-case-card .p-4 {
      padding: 0.85rem !important;
    }
    
    .test-case-card .p-3 {
      padding: 0.75rem !important;
    }
    
    .test-case-card .gap-4 {
      gap: 0.75rem !important;
    }
    
    /* Optimize code fence blocks to take less vertical space */
    pre code {
      line-height: 1.4 !important;
    }

    /* Reduce spacing in bullet points */
    .prose ul {
      margin-top: 0.5rem !important;
      margin-bottom: 0.5rem !important;
    }

    /* Make any images more compact */
    .problem-description img {
      margin: 0.75rem 0 !important;
    }
  `;

  // Custom CSS for grid pattern
  const gridPatternCSS = `
    .bg-grid-pattern {
      background-size: 30px 30px;
      background-image: 
        linear-gradient(to right, ${appTheme === 'dark' ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.03)'} 1px, transparent 1px),
        linear-gradient(to bottom, ${appTheme === 'dark' ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.03)'} 1px, transparent 1px);
    }
    
    .content-card {
      position: relative;
      overflow: hidden;
      border-radius: 0.75rem;
      border: 1px solid ${appTheme === 'dark' ? 'rgba(99, 102, 241, 0.2)' : 'rgba(99, 102, 241, 0.1)'};
      background: ${appTheme === 'dark' ? '#0f172a' : 'white'};
      transition: all 0.2s ease;
    }
    
    .content-card:hover {
      box-shadow: 0 0 0 1px rgba(107, 70, 193, 0.2), 
                 0 4px 20px -2px rgba(107, 70, 193, 0.12);
    }
    
    .content-card-gradient {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 4px;
      background: linear-gradient(to right, #4f46e5, #8b5cf6, #d946ef);
      z-index: 1;
    }
    
    .content-card-inner {
      position: relative;
      z-index: 1;
      padding: 1.25rem;
    }
    
    /* Problem description styling */
    .problem-description {
      position: relative;
      font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.5;
      color: ${appTheme === 'dark' ? '#e2e8f0' : '#1e293b'};
      word-break: break-word;
      overflow-wrap: break-word;
    }

    .problem-description h1 {
      font-size: 1.4rem;
    }

    .problem-description h2 {
      font-size: 1.25rem;
    }

    .problem-description h3 {
      font-size: 1.15rem;
    }

    .problem-description h4 {
      font-size: 1.05rem;
    }

    .problem-description h1,
    .problem-description h2,
    .problem-description h3,
    .problem-description h4,
    .problem-description h5,
    .problem-description h6 {
      margin-top: 1.25rem;
      margin-bottom: 0.75rem;
      font-weight: 700;
      line-height: 1.2;
      color: ${appTheme === 'dark' ? '#f8fafc' : '#0f172a'};
      position: relative;
    }

    .problem-description h1::after,
    .problem-description h2::after,
    .problem-description h3::after {
      content: "";
      position: absolute;
      bottom: -0.35rem;
      left: 0;
      width: 2.5rem;
      height: 0.15rem;
      background: linear-gradient(to right, #4f46e5, #8b5cf6, #d946ef);
      border-radius: 2px;
    }

    .problem-description p {
      margin-bottom: 0.75rem;
      line-height: 1.5;
      font-size: 0.95rem;
    }

    .problem-description pre {
      position: relative;
      margin: 0.85rem 0;
      padding: 0.9rem 0.85rem;
      background-color: ${appTheme === 'dark' ? 'rgba(30, 41, 59, 0.7)' : 'rgba(250, 250, 252, 0.8)'};
      border-radius: 0.4rem;
      overflow-x: auto;
      box-shadow: 0 1px 3px ${appTheme === 'dark' ? 'rgba(0, 0, 0, 0.15)' : 'rgba(0, 0, 0, 0.02)'};
      border: 1px solid ${appTheme === 'dark' ? 'rgba(51, 65, 85, 0.4)' : 'rgba(226, 232, 240, 0.8)'};
    }
    
    .problem-description pre::before {
      content: "";
      position: absolute;
      top: 0.5rem;
      left: 0.5rem;
      width: 0.4rem;
      height: 0.4rem;
      border-radius: 50%;
      background-color: #ff5f56;
      box-shadow: 0.85rem 0 0 0 #ffbd2e, 1.7rem 0 0 0 #27c93f;
      opacity: 0.7;
    }

    .problem-description pre code {
      background-color: transparent;
      padding: 0;
      border: none;
      box-shadow: none;
      font-weight: 400;
      color: ${appTheme === 'dark' ? '#e2e8f0' : '#1e293b'};
      display: block;
      padding-top: 0.7rem;
      line-height: 1.4;
    }

    .problem-description ul, 
    .problem-description ol {
      margin-top: 0.6rem;
      margin-bottom: 0.6rem;
      padding-left: 1.25rem;
    }

    .problem-description ul {
      list-style-type: none;
    }

    .problem-description ul li {
      position: relative;
      padding-left: 1.5rem;
      margin-bottom: 0.25rem;
      font-size: 0.95rem;
    }

    .problem-description ul li::before {
      content: "";
      position: absolute;
      left: 0;
      top: 0.6rem;
      height: 0.375rem;
      width: 0.375rem;
      background-color: ${appTheme === 'dark' ? '#818cf8' : '#4f46e5'};
      border-radius: 50%;
    }

    .problem-description ol {
      list-style-type: none;
      counter-reset: item;
    }

    .problem-description ol li {
      position: relative;
      padding-left: 1.5rem;
      margin-bottom: 0.25rem;
      counter-increment: item;
      font-size: 0.95rem;
    }

    .problem-description ol li::before {
      content: counter(item);
      position: absolute;
      left: 0;
      top: 0.15rem;
      height: 1.25rem;
      width: 1.25rem;
      font-size: 0.75rem;
      font-weight: 600;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: ${appTheme === 'dark' ? 'rgba(99, 102, 241, 0.2)' : 'rgba(99, 102, 241, 0.1)'};
      color: ${appTheme === 'dark' ? '#a5b4fc' : '#4f46e5'};
      border-radius: 50%;
    }

    /* Update tag pill style to be more compact without icons */
    .tag-pill {
      display: inline-flex;
      align-items: center;
      padding: 0.2rem 0.4rem;
      border-radius: 9999px;
      font-size: 0.7rem;
      font-weight: 500;
      background: ${appTheme === 'dark' ? 'rgba(99, 102, 241, 0.1)' : 'rgba(99, 102, 241, 0.1)'};
      color: ${appTheme === 'dark' ? '#818cf8' : '#4f46e5'};
      margin: 0.15rem;
      border: 1px solid ${appTheme === 'dark' ? 'rgba(99, 102, 241, 0.2)' : 'rgba(99, 102, 241, 0.2)'};
      transition: all 0.15s ease;
    }
  `;

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

  // Update layout when screen size changes
  useEffect(() => {
    if (isMobile) {
      setLeftPanelWidth(100)
      if (!activePanel) {
        setActivePanel("problem")
      }
    } else {
      setLeftPanelWidth(50)
    }
  }, [isMobile, activePanel])

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

  const [code, setCode] = useState<string>(preloadCode)

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

  const [sidebarOpen, setSidebarOpen] = useState(false);

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

  // Add the runCode and submitCode functions
  const runCode = async () => {
    try {
      // Make results panel fullscreen when running code
      if (!isResultsPanelFullscreen) {
        toggleResultsPanelFullscreen();
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
    try {
      // Make results panel fullscreen when submitting code
      if (!isResultsPanelFullscreen) {
        toggleResultsPanelFullscreen();
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
  
  const triggerConfettiCelebration = () => {
    // Ultra-premium color scheme with metallic/luxury colors
    const luxuryColors = ['#FFD700', '#E0BF00', '#B8860B', '#DAA520', '#9370DB', '#FFFFFF'];
    const accentColors = ['#4B0082', '#9932CC', '#8A2BE2', '#FF1493', '#00BFFF'];
    
    // Custom shapes setup (more premium)
    const shapes = ['square', 'circle'];
    
    // Phase 1: Initial golden shower from top (sparse but elegant)
    const createGoldenShower = () => {
      confetti({
        particleCount: 35,
        angle: 90,
        spread: 100,
        origin: { x: 0.5, y: 0 },
        colors: luxuryColors,
        shapes: ['square'],
        gravity: 0.65,
        scalar: 1.5,
        drift: 0.5,
        ticks: 200,
        flat: true,
        zIndex: 200,
        disableForReducedMotion: true
      });
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
        shapes,
        gravity: 0.4,
        scalar: 1.3,
        ticks: 400
      });
      
      // Right side
      confetti({
        particleCount: 10,
        angle: 120,
        spread: 25,
        origin: { x: 1, y: 0.5 },
        colors: accentColors,
        shapes,
        gravity: 0.4,
        scalar: 1.3,
        ticks: 400
      });
    };
    
    // Phase 3: Continuous gentle rain with fewer but higher quality particles
    const createGentleRain = () => {
      const duration = 2500;
      const animationEnd = Date.now() + duration;
      
      const rainInterval = setInterval(() => {
        const timeLeft = animationEnd - Date.now();
        
        if (timeLeft <= 0) {
          clearInterval(rainInterval);
          return;
        }
        
        // Calculate decreasing particle count as animation progresses
        const particleCount = 3;
        
        confetti({
          particleCount,
          angle: 90,
          spread: 70,
          origin: { x: Math.random(), y: 0 },
          colors: [...luxuryColors, ...accentColors],
          shapes,
          gravity: 0.6,
          scalar: 1.4,
          drift: 0.2,
          ticks: 500
        });
      }, 300); // Release particles every 300ms for a more exclusive feel
    };
    
    // Execute all phases with elegant timing
    createGoldenShower();
    
    setTimeout(() => {
      createSideBursts();
    }, 200);
    
    setTimeout(() => {
      createGentleRain();
    }, 500);
  };

  // Add helper function to parse language ID
  const parseLanguageId = (languageName: string): number => {
    // Find the language ID from JUDGE0_LANGUAGES
    const entry = Object.entries(JUDGE0_LANGUAGES).find(([_, name]) => 
      name === languageName || name.includes(languageName)
    );
    
    return entry ? parseInt(entry[0], 10) : 71; // Default to Python 3 (ID 71) if not found
  };

  return (
    <div className="flex flex-col h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 overflow-hidden">
      {/* Expandable Coding Questions Sidebar */}
      <CodingQuestionsSidebar
        currentQuestionId={codingQuestion.questionId || codingQuestion.id}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      {/* Add the style tag with our custom styles */}
      <style dangerouslySetInnerHTML={{ __html: questionTextStyles + gridPatternCSS + `
        @keyframes gradient-x {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }
        .animate-gradient-x {
          background-size: 200% 100%;
          animation: gradient-x 3s linear infinite;
        }
        
        @keyframes gradient-slow {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }
        .animate-gradient-slow {
          background-size: 200% auto;
          animation: gradient-slow 4s ease-in-out infinite;
        }
        
        @keyframes pulse-opacity {
          0%, 100% {
            opacity: 0.8;
          }
          50% {
            opacity: 0.4;
          }
        }
        .animate-pulse-opacity {
          animation: pulse-opacity 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        
        /* Glass card effects */
        .glass-card {
          background: rgba(255, 255, 255, 0.7);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          box-shadow: 0 8px 32px rgba(31, 38, 135, 0.1);
        }
        .dark .glass-card {
          background: rgba(15, 23, 42, 0.7);
          border: 1px solid rgba(30, 41, 59, 0.2);
        }
        
        /* Problem description card styles */
        .content-card {
          position: relative;
          border-radius: 12px;
          overflow: hidden;
          transition: all 0.3s ease;
        }
        .content-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 30px -5px rgba(79, 70, 229, 0.1);
        }
        .content-card-gradient {
          position: absolute;
          inset: 0;
          background: linear-gradient(to bottom right, rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.8));
          border: 1px solid rgba(224, 231, 255, 0.7);
          border-radius: 12px;
        }
        .dark .content-card-gradient {
          background: linear-gradient(to bottom right, rgba(15, 23, 42, 0.8), rgba(15, 23, 42, 0.7));
          border: 1px solid rgba(51, 65, 85, 0.5);
        }
        .content-card-inner {
          position: relative;
          z-index: 10;
          padding: 1.25rem;
        }
        
        /* Tag pill style */
        .tag-pill {
          display: inline-flex;
          padding: 0.15rem 0.5rem;
          font-size: 0.65rem;
          font-weight: 500;
          border-radius: 0.375rem;
          background: linear-gradient(to bottom right, rgba(224, 231, 255, 0.6), rgba(224, 231, 255, 0.3));
          color: rgb(67, 56, 202);
          border: 1px solid rgba(224, 231, 255, 0.7);
        }
        .dark .tag-pill {
          background: linear-gradient(to bottom right, rgba(49, 46, 129, 0.3), rgba(49, 46, 129, 0.1));
          color: rgb(165, 180, 252);
          border: 1px solid rgba(67, 56, 202, 0.3);
        }
        
        /* Test case card styles */
        .test-case-card {
          border-radius: 0.75rem;
          overflow: hidden;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
          background-color: white;
        }
        .dark .test-case-card {
          background-color: rgb(15, 23, 42);
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.2), 0 2px 4px -1px rgba(0, 0, 0, 0.1);
        }
      `}} />
      {/* Header with NexPractice theming */}
      <header className="flex items-center justify-between px-4 py-2 border-b border-indigo-100 dark:border-indigo-900/50 bg-white dark:bg-slate-900 shadow-sm md:px-6 md:py-3">
        {/* Left section: Logo and sidebar toggle */}
        <div className="flex items-center gap-4">
          {/* Sidebar toggle button */}
          <button
            className="mr-2 flex items-center justify-center rounded-md h-9 w-9 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 border border-indigo-100 dark:border-indigo-900/50 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 shadow-sm"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open questions sidebar"
          >
            <List className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2">
            {/* Unique logo with code brackets and 3D effect */}
            <div className="relative flex items-center justify-center w-8 h-8">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 to-purple-600 dark:from-indigo-500 dark:to-purple-500 rounded-xl transform rotate-3 opacity-80"></div>
              <div className="absolute inset-0 bg-gradient-to-tl from-blue-500 to-indigo-600 dark:from-blue-400 dark:to-indigo-500 rounded-xl transform -rotate-3 opacity-80"></div>
              <div className="relative z-10 flex items-center justify-center w-7 h-7 bg-white dark:bg-slate-800 rounded-lg shadow-inner">
                <Code className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              </div>
            </div>
            
            {/* Distinctive typography with gradient line */}
            <div>
              <h1 className="text-lg font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-indigo-700 via-purple-700 to-pink-600 dark:from-indigo-300 dark:via-purple-300 dark:to-pink-300">
                NexPractice
              </h1>
              <div className="h-1 w-10 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full"></div>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>

        {/* Middle section with run and submit buttons */}
        <div className="hidden md:flex flex-1 items-center justify-center gap-3 mx-4">
          <div className="absolute left-1/2 transform -translate-x-1/2 flex items-center gap-3">
          <Button
            size="sm"
            className="bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white shadow-sm gap-1 min-w-28 relative overflow-hidden"
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
            <Play className="h-4 w-4" />
            Run Code
              </>
            )}
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-700/50 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 hover:text-indigo-800 dark:hover:text-indigo-200 transition-colors gap-1 min-w-28 relative overflow-hidden"
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
                <Send className="h-4 w-4 mr-1" />
            Submit
              </>
            )}
          </Button>
          </div>
        </div>

        {/* Right section */}
        <div className="flex items-center">
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-3 mr-4">
            <Button variant="ghost" size="sm" className="text-slate-700 dark:text-slate-300 hover:bg-indigo-50 hover:text-indigo-700 dark:hover:bg-indigo-950/30 dark:hover:text-indigo-300 transition-colors gap-1">
              <Zap className="h-4 w-4 mr-1.5 text-indigo-500/70 dark:text-indigo-400/70" />
              Random Challenge
            </Button>
            <Button variant="ghost" size="sm" className="text-slate-700 dark:text-slate-300 hover:bg-indigo-50 hover:text-indigo-700 dark:hover:bg-indigo-950/30 dark:hover:text-indigo-300 transition-colors gap-1">
              <Sparkles className="h-4 w-4 mr-1.5 text-indigo-500/70 dark:text-indigo-400/70" />
              Daily Challenge
            </Button>
            <Button variant="ghost" size="icon" className="ml-2 rounded-full hover:bg-indigo-50 dark:hover:bg-indigo-900/30" onClick={handleFullscreenToggle} aria-label={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}>
              {isFullscreen ? (
                <Minimize2 className="h-5 w-5 text-slate-400 dark:text-slate-500" />
              ) : (
                <Maximize2 className="h-5 w-5 text-slate-400 dark:text-slate-500" />
              )}
            </Button>
          </div>

          {/* Mobile panel switcher */}
          {isMobile && (
            <div className="flex border border-indigo-200 dark:border-indigo-800/50 rounded-md overflow-hidden bg-white dark:bg-slate-800 shadow-sm ml-2">
              <Button
                variant="ghost"
                size="sm"
                className={`px-3 py-1.5 rounded-none ${
                  activePanel === "problem" ? "bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300" : "text-slate-500 dark:text-slate-400"
                }`}
                onClick={() => setActivePanel("problem")}
              >
                Problem
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className={`px-3 py-1.5 rounded-none ${
                  activePanel === "code" ? "bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300" : "text-slate-500 dark:text-slate-400"
                }`}
                onClick={() => setActivePanel("code")}
              >
                Code
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className={`px-3 py-1.5 rounded-none ${
                  activePanel === "results" ? "bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300" : "text-slate-500 dark:text-slate-400"
                }`}
                onClick={() => setActivePanel("results")}
              >
                Results
              </Button>
            </div>
          )}

          {!isMobile && (
            <>
              {/* Theme Switcher */}
              <Button
                variant="ghost" 
                size="icon" 
                onClick={() => setAppTheme(appTheme === "light" ? "dark" : "light")}
                className="rounded-full h-8 w-8 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 ml-2"
                aria-label="Toggle theme"
              >
                {appTheme === "dark" ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-amber-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-slate-700"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                  </svg>
                )}
              </Button>
              
              {/* Enhanced Profile Avatar with Dropdown */}
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
            </>
          )}
        </div>
      </header>

      {/* Remove these buttons from the mobile action buttons section too, as now they're in the header */}
      {/* Mobile action buttons */}
      {isMobile && (
        <div className="flex justify-between items-center p-2 bg-white dark:bg-slate-900 border-b border-indigo-100 dark:border-indigo-900/50">
          <div className="flex items-center gap-1">
            <Star className="h-5 w-5 text-amber-400" />
            <span className="text-sm text-slate-700 dark:text-slate-300">Problem {problemNumber}</span>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white border-none shadow-sm relative overflow-hidden min-w-20"
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
                    <span className="text-xs font-medium text-white animate-pulse truncate max-w-24">
                      {loadingPhrase || "Processing..."}
                    </span>
                  </div>
                </>
              ) : (
                <>
              <Play className="h-4 w-4 mr-1" />
              Run
                </>
              )}
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-700/50 hover:bg-indigo-50 dark:hover:bg-indigo-900/30"
              onClick={submitCode}
              disabled={isSubmitting}
            >
              <Send className="h-4 w-4 mr-1" />
              {isSubmitting ? "Submitting..." : "Submit"}
            </Button>
          </div>
        </div>
      )}
      
      {/* Main content with resizable panels */}
      <div ref={containerRef} className="flex flex-1 overflow-hidden">
        {/* Left panel - Problem description */}
        <div
          className={`h-full overflow-auto bg-white dark:bg-slate-900 ${
            isMobile ? (activePanel === "problem" ? "block w-full" : "hidden") : "border-r border-indigo-100 dark:border-indigo-900/50"
          }`}
          style={{ width: isMobile ? "100%" : `${leftPanelWidth}%` }}
        >
          <div className="p-4 md:p-5">
            {/* Problem header with gradient card - make it more compact */}
            <Card className="mb-4 border-none overflow-hidden shadow-lg relative group glass-card">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-xl opacity-20 blur-sm group-hover:opacity-40 transition duration-300"></div>
              <div className="relative bg-white/80 dark:bg-slate-900/80 rounded-xl p-0.5 overflow-hidden backdrop-blur-sm">
                <div className="absolute inset-0 bg-grid-pattern opacity-[0.03]"></div>
              <div className="relative">
                {/* Background pattern and gradients */}
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-purple-50/30 to-pink-50/20 dark:from-indigo-950/40 dark:via-purple-950/30 dark:to-pink-950/20">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-indigo-200/20 to-purple-300/20 dark:from-indigo-500/10 dark:to-purple-600/10 rounded-full blur-2xl opacity-70 transform translate-x-8 -translate-y-8"></div>
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tl from-blue-200/20 to-indigo-300/20 dark:from-blue-500/10 dark:to-indigo-600/10 rounded-full blur-2xl opacity-70 transform -translate-x-8 translate-y-8"></div>
                </div>
                
                  <CardContent className="relative z-10 p-3">
                    {/* Fullscreen icon integrated in header */}
                    {!isMobile && (
                      <div className="absolute top-2 right-2 z-20">
                        <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm hover:bg-indigo-50 dark:hover:bg-indigo-900/30" onClick={toggleLeftPanelExpansion} aria-label={isLeftPanelExpanded ? 'Collapse Panel' : 'Expand Panel'}>
                          {isLeftPanelExpanded ? (
                            <Minimize2 className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                          ) : (
                            <Maximize2 className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                          )}
                        </Button>
                      </div>
                    )}
                    <div className="flex items-start gap-2">
                      {/* 3D problem number badge - make more compact */}
                      <div className="relative flex flex-shrink-0 mt-1">
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-violet-600 to-indigo-600 rounded-lg blur opacity-30"></div>
                        <div className="relative h-8 w-8 flex items-center justify-center rounded-lg bg-gradient-to-br from-indigo-600 to-purple-600 text-white text-xs font-bold shadow-xl border border-indigo-700/20">
                          <div className="absolute inset-0.5 rounded-md bg-gradient-to-br from-indigo-500 to-purple-600 opacity-80"></div>
                          <span className="relative z-10 drop-shadow-sm">{problemNumber}</span>
                          <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-black/20 rounded-b-md"></div>
                        </div>
                    </div>
                    
                      <div className="flex-1 space-y-1">
                        {/* Problem title with gradient text - smaller font size */}
                        <div className="relative">
                          <h2 className="text-lg font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 dark:from-indigo-300 dark:via-purple-300 dark:to-indigo-300 pb-0.5 bg-[length:200%_auto] animate-gradient-slow">
                        {problemTitle}
                      </h2>
                          <div className="h-0.5 w-12 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full"></div>
                    </div>
                    
                        {/* Problem stats bar - more compact */}
                        <div className="flex flex-wrap items-center gap-2 mt-1.5">
                          <div className="flex items-center">
                      {getDifficultyBadge(difficulty)}
                          </div>
                      
                          <div className="h-3 w-0.5 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                          
                          <div className="flex items-center text-amber-500 border border-amber-200 dark:border-amber-800/30 bg-amber-50 dark:bg-amber-900/20 rounded-full px-1.5 py-0.5">
                            <Star className="h-3 w-3 fill-current text-amber-500 mr-1" />
                        <span className="text-xs font-medium text-amber-600 dark:text-amber-400">4.8</span>
                          </div>
                          
                          <div className="h-3 w-0.5 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                          
                          {/* Tags - updated style with tag-pill class */}
                          <div className="flex flex-wrap gap-1">
                            <div className="tag-pill">Array</div>
                            <div className="tag-pill">Hash Table</div>
                            <div className="tag-pill">Two Pointers</div>
                          </div>
                      </div>
                    </div>
                  </div>
                  
                    {/* Stats grid - make more compact */}
                    <div className="mt-3 grid grid-cols-3 gap-1.5 text-[10px]">
                      <div className="flex items-center justify-center p-1 rounded-lg bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900/30 dark:to-indigo-800/30 border border-indigo-100 dark:border-indigo-800/30">
                    <div className="flex items-center">
                          <Clock className="h-3 w-3 text-indigo-500 dark:text-indigo-400 mr-1" />
                          <span className="font-medium text-indigo-700 dark:text-indigo-300">~30 mins</span>
                    </div>
                      </div>
                      <div className="flex items-center justify-center p-1 rounded-lg bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/30 dark:to-emerald-800/30 border border-emerald-100 dark:border-emerald-800/30">
                    <div className="flex items-center">
                          <Check className="h-3 w-3 text-emerald-500 dark:text-emerald-400 mr-1" />
                          <span className="font-medium text-emerald-700 dark:text-emerald-300">Acceptance: 68%</span>
                    </div>
                      </div>
                      <div className="flex items-center justify-center p-1 rounded-lg bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/30 border border-purple-100 dark:border-purple-800/30">
                    <div className="flex items-center">
                          <Eye className="h-3 w-3 text-purple-500 dark:text-purple-400 mr-1" />
                          <span className="font-medium text-purple-700 dark:text-purple-300">Submissions: 4.2K</span>
                        </div>
                    </div>
                  </div>
                </CardContent>
                </div>
              </div>
            </Card>

            {/* Problem content tabs with new gradient background */}
            <Tabs defaultValue="description" className="mb-6">
              <TabsList className="grid grid-cols-3 bg-gradient-to-r from-indigo-50/80 via-purple-50/80 to-indigo-50/80 dark:from-indigo-900/20 dark:via-purple-900/20 dark:to-indigo-900/20 p-1 rounded-lg overflow-hidden backdrop-blur-sm border border-indigo-100/80 dark:border-indigo-900/30 shadow-sm">
                <TabsTrigger
                  value="description"
                  className="rounded-md py-1.5 data-[state=active]:bg-white data-[state=active]:dark:bg-slate-900/90 data-[state=active]:text-indigo-700 data-[state=active]:dark:text-indigo-300 data-[state=active]:shadow-sm relative overflow-hidden group"
                >
                  <div className="absolute inset-0 opacity-0 group-data-[state=active]:opacity-100 transition-opacity">
                    <div className="absolute inset-x-0 -bottom-1 h-0.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
                  </div>
                  <FileText className="h-3.5 w-3.5 mr-1.5 text-indigo-500/70 dark:text-indigo-400/70 group-data-[state=active]:text-indigo-600 dark:group-data-[state=active]:text-indigo-400" />
                  Description
                </TabsTrigger>
                <TabsTrigger
                  value="solution"
                  className="rounded-md py-1.5 data-[state=active]:bg-white data-[state=active]:dark:bg-slate-900/90 data-[state=active]:text-indigo-700 data-[state=active]:dark:text-indigo-300 data-[state=active]:shadow-sm relative overflow-hidden group"
                >
                  <div className="absolute inset-0 opacity-0 group-data-[state=active]:opacity-100 transition-opacity">
                    <div className="absolute inset-x-0 -bottom-1 h-0.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
                  </div>
                  <BookOpenCheck className="h-3.5 w-3.5 mr-1.5 text-indigo-500/70 dark:text-indigo-400/70 group-data-[state=active]:text-indigo-600 dark:group-data-[state=active]:text-indigo-400" />
                  Solution
                </TabsTrigger>
                <TabsTrigger
                  value="discussion"
                  className="rounded-md py-1.5 data-[state=active]:bg-white data-[state=active]:dark:bg-slate-900/90 data-[state=active]:text-indigo-700 data-[state=active]:dark:text-indigo-300 data-[state=active]:shadow-sm relative overflow-hidden group"
                >
                  <div className="absolute inset-0 opacity-0 group-data-[state=active]:opacity-100 transition-opacity">
                    <div className="absolute inset-x-0 -bottom-1 h-0.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
                  </div>
                  <MessageSquare className="h-3.5 w-3.5 mr-1.5 text-indigo-500/70 dark:text-indigo-400/70 group-data-[state=active]:text-indigo-600 dark:group-data-[state=active]:text-indigo-400" />
                  Discussion
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="description" className="mt-4 space-y-6 focus-visible:outline-none focus-visible:ring-0">
                {/* Problem description with content-card styling */}
                <div className="content-card">
                  <div className="content-card-gradient"></div>
                  <div className="content-card-inner relative">
                    {/* Abstract background decorations */}
                    <div className="absolute -top-5 -right-5 w-40 h-40 bg-gradient-to-br from-indigo-100/30 to-purple-100/20 dark:from-indigo-700/10 dark:to-purple-700/5 rounded-full blur-3xl opacity-70"></div>
                    <div className="absolute -bottom-5 -left-5 w-40 h-40 bg-gradient-to-tr from-blue-100/20 to-indigo-100/20 dark:from-blue-700/5 dark:to-indigo-700/10 rounded-full blur-3xl opacity-60"></div>
                    
                    {/* Problem description content with improved typography */}
                    <div className="relative z-10 problem-description">
                      <div 
                        className="description-content prose prose-indigo dark:prose-invert max-w-none text-slate-700 dark:text-slate-300" 
                        dangerouslySetInnerHTML={{ __html: description }} 
                      />
                    </div>
                  </div>
                </div>
                
                {/* Example test cases with test-case-card styling */}
                {examples.map((tc: {id: string, input: string, output: string, explanation?: string}, idx: number) => (
                  <div key={tc.id} className="test-case-card relative group transition-all duration-300 hover:shadow-md">
                    {/* Top color stripe */}
                    <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500"></div>
                    
                    {/* Example header */}
                    <div className="px-4 py-3 flex items-center gap-2 bg-gradient-to-r from-indigo-50/80 to-purple-50/50 dark:from-indigo-900/20 dark:to-purple-900/20 border-b border-indigo-100 dark:border-indigo-800/30">
                      <div className="flex items-center justify-center w-6 h-6 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-xs font-bold shadow-sm">
                          {idx + 1}
                        </div>
                      <h3 className="text-base font-semibold text-slate-800 dark:text-slate-200 tracking-tight">Example {idx + 1}</h3>
                      </div>
                    
                    <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* INPUT section with enhanced styling */}
                      <div className="rounded-lg overflow-hidden shadow-sm border border-slate-200/70 dark:border-slate-700/50 transition-all duration-300 group-hover:shadow">
                        <div className="relative px-3 py-2 bg-gradient-to-r from-slate-100 to-indigo-50/50 dark:from-slate-800 dark:to-indigo-900/20 border-b border-slate-200 dark:border-slate-700/70">
                          <div className="absolute left-0 inset-y-0 w-1 bg-indigo-500"></div>
                          <div className="flex items-center">
                            <div className="w-2 h-2 rounded-full bg-indigo-500 mr-2"></div>
                            <span className="text-sm font-medium text-indigo-700 dark:text-indigo-300">Input</span>
                            <span className="ml-auto text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider">Data</span>
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
                <div className="content-card group hover:translate-y-[-2px] transition-all duration-300">
                  <div className="content-card-gradient opacity-30"></div>
                  <div className="content-card-inner flex flex-col items-center justify-center py-12">
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
                        className="gap-1 bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 dark:hover:from-indigo-900/40 dark:hover:to-purple-900/40 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800/50"
                      >
                        <Code className="h-3.5 w-3.5 mr-1" />
                        Solve First
                      </Button>
                      <Button 
                        variant="outline"
                        size="sm"
                        className="gap-1 bg-gradient-to-r from-amber-50 to-orange-50 hover:from-amber-100/80 hover:to-orange-100/80 dark:from-amber-900/20 dark:to-orange-900/20 dark:hover:from-amber-900/40 dark:hover:to-orange-900/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800/50"
                      >
                        <Crown className="h-3.5 w-3.5 mr-1" />
                        Premium Access
                      </Button>
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="discussion" className="mt-4 focus-visible:outline-none focus-visible:ring-0">
                <div className="content-card group hover:translate-y-[-2px] transition-all duration-300">
                  <div className="content-card-gradient opacity-30"></div>
                  <div className="content-card-inner flex flex-col items-center justify-center py-12">
                    <div className="relative w-16 h-16 mb-4">
                      <div className="absolute inset-0 rounded-full bg-purple-100 dark:bg-purple-900/30 animate-pulse"></div>
                      <div className="absolute inset-4 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 opacity-20 blur-lg animate-pulse delay-100"></div>
                      <div className="absolute inset-0 rounded-full flex items-center justify-center">
                        <MessageSquare className="h-10 w-10 relative z-10 text-purple-500 dark:text-purple-400 animate-float" />
                      </div>
                    </div>
                    <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-2">Join the Discussion</h3>
                    <p className="text-slate-600 dark:text-slate-400 text-center max-w-sm">
                      Connect with other developers, share your approach, and learn alternative solutions.
                    </p>
                    <div className="mt-6">
                      <Button 
                        className="gap-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-md shadow-purple-500/20"
                      >
                        <MessageSquare className="h-3.5 w-3.5 mr-1" />
                        View Discussion
                      </Button>
                    </div>
                    <div className="mt-4 flex items-center text-xs text-slate-500 dark:text-slate-400 gap-1">
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
          className={`flex flex-col h-full ${isMobile && activePanel === "problem" ? "hidden" : ""}`}
          style={{ width: isMobile ? "100%" : `${100 - leftPanelWidth}%` }}
        >
          {/* Code editor */}
          <div
            className={`flex flex-col overflow-hidden ${
              isMobile ? (activePanel === "code" ? "block" : "hidden") : ""
            }`}
            style={{
              flexBasis: isMobile ? "100%" : `${editorHeight}%`,
              flexGrow: 0,
              flexShrink: 1,
              minHeight: 0,
              maxHeight: isMobile ? "100%" : `${editorHeight}%`,
              height: isMobile ? "100%" : undefined,
              transition: "all 0.3s ease-in-out" // Add smooth transition
            }}
          >
            <div className="flex items-center justify-between p-2 md:p-3 bg-white dark:bg-slate-900 border-b border-indigo-100 dark:border-indigo-900/50 flex-shrink-0">
              <div className="flex items-center">
                <div className="flex items-center mr-4">
                  <span className="text-base font-semibold text-indigo-700 dark:text-indigo-300 bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 dark:from-indigo-300 dark:via-purple-300 dark:to-indigo-300">
                    NexEditor
                  </span>
                </div>
                {/* Custom Language Dropdown */}
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mr-2 flex items-center gap-2 border-indigo-200 dark:border-indigo-800/50 bg-gradient-to-r from-white to-slate-50 dark:from-slate-800 dark:to-slate-800/90 text-slate-700 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 min-w-[180px] h-9 pl-2 pr-3 overflow-hidden group relative"
                    >
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-indigo-500 to-indigo-600 dark:from-indigo-400 dark:to-indigo-500"></div>
                      <div className="flex items-center gap-2 overflow-hidden">
                        <div className="flex items-center justify-center w-6 h-6 bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900/30 dark:to-indigo-800/30 rounded-md border border-indigo-200 dark:border-indigo-700/30 shadow-sm flex-shrink-0">
                          {LANGUAGE_ICONS[language as keyof typeof LANGUAGE_ICONS] || (
                            <Code className="h-3.5 w-3.5 text-indigo-500 dark:text-indigo-400" />
                          )}
                        </div>
                        <div className="flex flex-col leading-none overflow-hidden">
                          <span className="font-medium text-sm truncate">
                            {parseLanguageName(JUDGE0_LANGUAGES[language as keyof typeof JUDGE0_LANGUAGES]).name}
                          </span>
                          <span className="text-xs text-slate-500 dark:text-slate-400 truncate">
                            {parseLanguageName(JUDGE0_LANGUAGES[language as keyof typeof JUDGE0_LANGUAGES]).version}
                          </span>
                        </div>
                      </div>
                      <ChevronDown className="h-3 w-3 ml-auto opacity-60 group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition-colors" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent align="start" className="w-[680px] p-0 max-h-[600px] overflow-hidden flex flex-col border-indigo-100 dark:border-indigo-900/50 shadow-lg rounded-xl">
                    <div className="language-dropdown-header sticky top-0 z-30 bg-white dark:bg-slate-900 border-b border-indigo-100 dark:border-indigo-900/50 p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className="h-5 w-1 bg-gradient-to-b from-indigo-500 to-purple-500 rounded-full"></div>
                          <h3 className="font-semibold text-slate-800 dark:text-slate-200 text-base">Select Programming Language</h3>
                        </div>
                        <div className="text-xs bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300 px-2 py-0.5 rounded-full font-medium">
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
                          .map(([langId, langName], index, array) => {
                            const { name, version } = parseLanguageName(langName);
                            const isSelected = language === langId;
                            
                            // Add dividers after every 6 items for visual organization
                            const showDivider = index > 0 && index % 6 === 0 && index !== array.length - 1;
                            
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
                                  onClick={() => setLanguage(langId)}
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
                <Button
                  variant="outline"
                  size="sm"
                  onClick={toggleFocusMode}
                  className="gap-1.5 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800/50 hover:bg-indigo-50 dark:hover:bg-indigo-900/30"
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
                  className="text-slate-700 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 hover:text-indigo-700 dark:hover:text-indigo-300"
                  asChild
                >
                  <Popover>
                    <PopoverTrigger asChild>
                      <span><Settings className="h-4 w-4 cursor-pointer" /></span>
                    </PopoverTrigger>
                    <PopoverContent align="end" className="w-64 p-3">
                      <div className="mb-2 font-semibold text-sm text-slate-700 dark:text-slate-200">Editor Settings</div>
                      <div className="mb-3">
                        <label className="block text-xs font-medium mb-1">Theme</label>
                        <div className="flex gap-2">
                          <button onClick={() => setEditorTheme("vs-dark")}
                            className={`px-2 py-1 rounded text-xs font-semibold border ${editorTheme === "vs-dark" ? "bg-indigo-600 text-white border-indigo-600" : "bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"}`}>Dark</button>
                          <button onClick={() => setEditorTheme("light")}
                            className={`px-2 py-1 rounded text-xs font-semibold border ${editorTheme === "light" ? "bg-indigo-600 text-white border-indigo-600" : "bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"}`}>Light</button>
                        </div>
                      </div>
                      <div className="mb-3">
                        <label className="block text-xs font-medium mb-1">Font Size</label>
                        <input type="range" min="12" max="24" value={fontSize} onChange={e => setFontSize(Number(e.target.value))} className="w-full" />
                        <div className="text-xs text-right text-slate-500 mt-1">{fontSize}px</div>
                      </div>
                      <div className="mb-3">
                        <label className="block text-xs font-medium mb-1">Tab Size</label>
                        <input type="range" min="2" max="8" value={tabSize} onChange={e => setTabSize(Number(e.target.value))} className="w-full" />
                        <div className="text-xs text-right text-slate-500 mt-1">{tabSize} spaces</div>
                      </div>
                      <button
                        onClick={() => setCode(preloadCode)}
                        className="w-full mt-2 py-1.5 rounded bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-semibold text-xs hover:from-indigo-600 hover:to-purple-600 transition"
                      >
                        Reset Code
                      </button>
                    </PopoverContent>
                  </Popover>
                </Button>
              </div>
            </div>
            
            <div className="flex-1 overflow-auto" style={{ minHeight: 0 }}>
              {/* Editor wrapper with subtle background gradient */}
              <div className="h-full w-full relative bg-gradient-to-br from-slate-800 to-slate-900">
                {/* Editor component */}
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
              isMobile ? (activePanel === "results" ? "block" : "hidden") : ""
            }`}
            style={{
              flexBasis: isMobile ? "100%" : `${100 - editorHeight}%`,
              flexGrow: 1,
              flexShrink: 1,
              minHeight: 0,
              maxHeight: isMobile ? "100%" : `${100 - editorHeight}%`,
              height: isMobile ? "100%" : undefined,
              transition: "all 0.3s ease-in-out" // Add smooth transition
            }}
          >
            <div className="flex items-center justify-between p-2 md:p-3 bg-white dark:bg-slate-900 border-b border-indigo-100 dark:border-indigo-900/50">
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
            
            <div className="flex-1 relative bg-gradient-to-br from-slate-50 to-white dark:from-slate-900 dark:to-slate-800/80 overflow-auto">
              {/* Background decorative elements */}
              <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-indigo-50/50 dark:bg-indigo-900/20 rounded-full blur-3xl -z-0"></div>
              <div className="absolute bottom-1/4 right-1/4 w-40 h-40 bg-purple-50/30 dark:bg-purple-900/10 rounded-full blur-3xl -z-0"></div>
              
              {/* Tabs for Results Panel */}
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full p-4 relative z-10">
                <TabsList className="bg-slate-100 dark:bg-slate-800/70 p-1 rounded-lg overflow-hidden backdrop-blur-sm border border-slate-200/80 dark:border-slate-700/30 shadow-sm mb-3 w-full flex">
                  <TabsTrigger
                    value="sample"
                    className="flex-1 rounded-md py-1.5 data-[state=active]:bg-white data-[state=active]:dark:bg-slate-900/90 data-[state=active]:text-indigo-700 data-[state=active]:dark:text-indigo-300 data-[state=active]:shadow-sm relative overflow-hidden group"
                  >
                    <div className="absolute inset-0 opacity-0 group-data-[state=active]:opacity-100 transition-opacity">
                      <div className="absolute inset-x-0 -bottom-1 h-0.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
                    </div>
                    <FileText className="h-3.5 w-3.5 mr-1.5 text-indigo-500/70 dark:text-indigo-400/70 group-data-[state=active]:text-indigo-600 dark:group-data-[state=active]:text-indigo-400" />
                    Sample Testcases
                  </TabsTrigger>
                  <TabsTrigger
                    value="hidden"
                    className="flex-1 rounded-md py-1.5 data-[state=active]:bg-white data-[state=active]:dark:bg-slate-900/90 data-[state=active]:text-indigo-700 data-[state=active]:dark:text-indigo-300 data-[state=active]:shadow-sm relative overflow-hidden group"
                  >
                    <div className="absolute inset-0 opacity-0 group-data-[state=active]:opacity-100 transition-opacity">
                      <div className="absolute inset-x-0 -bottom-1 h-0.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
                    </div>
                    <BarChart2 className="h-3.5 w-3.5 mr-1.5 text-indigo-500/70 dark:text-indigo-400/70 group-data-[state=active]:text-indigo-600 dark:group-data-[state=active]:text-indigo-400" />
                    Hidden Testcases
                  </TabsTrigger>
                  <TabsTrigger
                    value="custom"
                    className="flex-1 rounded-md py-1.5 data-[state=active]:bg-white data-[state=active]:dark:bg-slate-900/90 data-[state=active]:text-indigo-700 data-[state=active]:dark:text-indigo-300 data-[state=active]:shadow-sm relative overflow-hidden group"
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
                        <Skeleton className="h-5 w-40" />
                        <Skeleton className="h-6 w-28 rounded-full" />
                      </div>
                      
                      {/* Test cases skeletons */}
                      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm overflow-hidden border border-slate-200 dark:border-slate-700/50">
                        {/* Header skeleton */}
                        <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700/50 bg-gradient-to-r from-slate-50 to-slate-100/50 dark:from-slate-800/70 dark:to-slate-800/50 flex justify-between">
                          <div className="flex items-center gap-2">
                            <Skeleton className="h-6 w-6 rounded-full" />
                            <Skeleton className="h-5 w-24" />
                          </div>
                          <Skeleton className="h-6 w-20 rounded-full" />
                        </div>
                        
                        {/* Content skeleton */}
                        <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Input skeleton */}
                          <div className="rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700/50">
                            <div className="bg-slate-50 dark:bg-slate-800/60 px-3 py-1.5 border-b border-slate-200 dark:border-slate-700/50">
                              <Skeleton className="h-4 w-16" />
                            </div>
                            <div className="p-3 space-y-2">
                              <Skeleton className="h-4 w-full" />
                              <Skeleton className="h-4 w-3/4" />
                              <Skeleton className="h-4 w-1/2" />
                            </div>
                          </div>
                          
                          {/* Expected Output skeleton */}
                          <div className="rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700/50">
                            <div className="bg-slate-50 dark:bg-slate-800/60 px-3 py-1.5 border-b border-slate-200 dark:border-slate-700/50">
                              <Skeleton className="h-4 w-36" />
                            </div>
                            <div className="p-3 space-y-2">
                              <Skeleton className="h-4 w-full" />
                              <Skeleton className="h-4 w-2/3" />
                              <Skeleton className="h-4 w-1/4" />
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
                          <Skeleton className="h-4 w-32" />
                          <Skeleton className="h-4 w-32" />
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
                        <TabsList className="bg-gradient-to-r from-slate-100/90 to-indigo-50/80 dark:from-slate-800/70 dark:to-indigo-900/30 p-1 rounded-lg overflow-hidden backdrop-blur-sm border border-slate-200/80 dark:border-slate-700/30 shadow-sm mb-3 w-full flex flex-wrap">
                          {sampleTestResults.map((result, idx) => (
                            <TabsTrigger
                              key={`sample-trigger-${result.id || idx}`}
                              value={`sample-testcase-${idx}`}
                              className="flex-1 min-w-[100px] rounded-md py-2 data-[state=active]:bg-white data-[state=active]:dark:bg-slate-900/90 data-[state=active]:text-indigo-700 data-[state=active]:dark:text-indigo-300 data-[state=active]:shadow-sm relative overflow-hidden group transition-all duration-150"
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
                                <span className="hidden sm:inline font-medium text-sm group-data-[state=active]:text-indigo-600 dark:group-data-[state=active]:text-indigo-400">Test {idx + 1}</span>
                              </div>
                              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent opacity-0 group-hover:opacity-100 group-data-[state=active]:opacity-0 transition-opacity"></div>
                            </TabsTrigger>
                          ))}
                        </TabsList>
                        
                        {sampleTestResults.map((result, idx) => (
                          <TabsContent key={`sample-content-${result.id || idx}`} value={`sample-testcase-${idx}`} className="focus-visible:outline-none focus-visible:ring-0">
                            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm overflow-hidden border border-slate-200 dark:border-slate-700/50">
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
                                  <div className="p-3 font-mono text-sm bg-white dark:bg-slate-800/30 text-slate-700 dark:text-slate-300">
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
                                    <div className="p-3 font-mono text-sm bg-white dark:bg-slate-800/30 text-slate-700 dark:text-slate-300">
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
                      
                      {/* Performance summary */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 w-full">
                      <div className="bg-white dark:bg-slate-800/60 p-3 rounded-lg border border-slate-200 dark:border-slate-700/50 flex flex-col items-center text-center">
                        <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mb-2">
                            <Clock className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                        </div>
                          <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Execution Time</div>
                          <div className="font-medium text-slate-700 dark:text-slate-300">
                            {sampleTestResults[0]?.executionTime || 'N/A'}
                          </div>
                      </div>
                      <div className="bg-white dark:bg-slate-800/60 p-3 rounded-lg border border-slate-200 dark:border-slate-700/50 flex flex-col items-center text-center">
                        <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-2">
                          <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
                        </div>
                          <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Test Cases</div>
                          <div className="font-medium text-slate-700 dark:text-slate-300">
                            {sampleTestResults.filter(r => r.isCorrect).length}/{sampleTestResults.length} Passed
                          </div>
                      </div>
                      <div className="bg-white dark:bg-slate-800/60 p-3 rounded-lg border border-slate-200 dark:border-slate-700/50 flex flex-col items-center text-center">
                        <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mb-2">
                            <Cpu className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                        </div>
                          <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Memory Usage</div>
                          <div className="font-medium text-slate-700 dark:text-slate-300">
                            {sampleTestResults[0]?.memoryUsed || 'N/A'}
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : examples.length > 0 ? (
                    <div className="space-y-4">
                      {/* Summary badge */}
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-sm text-slate-700 dark:text-slate-300">
                          <span className="font-medium">{examples.length}</span> sample test cases available
                        </div>
                        <div className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-800/50 text-indigo-700 dark:text-indigo-300 font-medium">
                          <Eye className="h-3 w-3 mr-1.5 opacity-70" />
                          Run to evaluate
                      </div>
                    </div>
                    
                      {/* Nested tabs for multiple test cases */}
                      <Tabs defaultValue={`testcase-0`} className="w-full">
                        <TabsList className="bg-gradient-to-r from-slate-100/90 to-indigo-50/80 dark:from-slate-800/70 dark:to-indigo-900/30 p-1 rounded-lg overflow-hidden backdrop-blur-sm border border-slate-200/80 dark:border-slate-700/30 shadow-sm mb-3 w-full flex">
                          {examples.map((tc: {id: string, input: string, output: string}, idx: number) => (
                            <TabsTrigger
                              key={`trigger-${tc.id}`}
                              value={`testcase-${idx}`}
                              className="flex-1 rounded-md py-2 data-[state=active]:bg-white data-[state=active]:dark:bg-slate-900/90 data-[state=active]:text-indigo-700 data-[state=active]:dark:text-indigo-300 data-[state=active]:shadow-sm relative overflow-hidden group transition-all duration-150"
                            >
                              <div className="absolute inset-0 opacity-0 group-data-[state=active]:opacity-100 transition-opacity duration-300">
                                <div className="absolute inset-x-0 -bottom-1 h-0.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
                                <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 to-purple-50/30 dark:from-indigo-900/30 dark:to-purple-900/20 opacity-0 group-data-[state=active]:opacity-100 transition-opacity"></div>
                  </div>
                              <div className="flex items-center justify-center gap-1.5">
                                <div className="w-5 h-5 rounded-full flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-xs font-medium">
                                  {idx + 1}
                                </div>
                                <span className="hidden sm:inline font-medium text-sm group-data-[state=active]:text-indigo-600 dark:group-data-[state=active]:text-indigo-400">Test Case {idx + 1}</span>
                              </div>
                              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent opacity-0 group-hover:opacity-100 group-data-[state=active]:opacity-0 transition-opacity"></div>
                            </TabsTrigger>
                          ))}
                        </TabsList>
                        
                        {examples.map((tc: {id: string, input: string, output: string}, idx: number) => (
                          <TabsContent key={`content-${tc.id}`} value={`testcase-${idx}`} className="focus-visible:outline-none focus-visible:ring-0">
                  <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm overflow-hidden border border-slate-200 dark:border-slate-700/50">
                              <div className="bg-gradient-to-r from-indigo-50 to-indigo-100/50 dark:from-indigo-900/20 dark:to-indigo-900/10 px-4 py-2 border-b border-slate-200 dark:border-slate-700/50 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <div className="w-5 h-5 rounded-full flex items-center justify-center bg-indigo-500 text-white text-xs font-medium">
                                    {idx + 1}
                                  </div>
                                  <span className="font-medium text-slate-700 dark:text-slate-300">Sample Test Case {idx + 1}</span>
                    </div>
                    
                                <div className="flex items-center">
                                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400 font-medium">
                                    <Info className="h-3 w-3 mr-1" />
                                    Not evaluated
                                  </span>
                          </div>
                        </div>
                              
                              <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700/50">
                                  <div className="bg-slate-50 dark:bg-slate-800/60 px-3 py-1.5 border-b border-slate-200 dark:border-slate-700/50 text-xs font-medium text-slate-700 dark:text-slate-300">
                                    Input
                                  </div>
                                  <div className="p-3 font-mono text-sm bg-white dark:bg-slate-800/30 text-slate-700 dark:text-slate-300">
                                    {formatTestCase(tc.input)}
                                  </div>
                      </div>
                      
                                <div className="rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700/50">
                                  <div className="bg-slate-50 dark:bg-slate-800/60 px-3 py-1.5 border-b border-slate-200 dark:border-slate-700/50 text-xs font-medium text-slate-700 dark:text-slate-300">
                                    Expected Output
                                  </div>
                                  <div className="p-3 font-mono text-sm bg-white dark:bg-slate-800/30 text-slate-700 dark:text-slate-300">
                                    {formatTestCase(tc.output)}
                                  </div>
                                </div>
                      </div>
                      
                              {/* Remove the Run This Test button by eliminating this whole div */}
                              {/* <div className="flex justify-center p-4 border-t border-slate-200 dark:border-slate-700/50">
                                <Button 
                                  size="sm"
                                  className="bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white shadow-sm gap-1 relative overflow-hidden min-w-32"
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
                                        <span className="text-xs font-medium text-white animate-pulse">
                                          {loadingPhrase || "Processing..."}
                                        </span>
                          </div>
                                    </>
                                  ) : (
                                    <>
                                      <Play className="h-3.5 w-3.5 mr-1" />
                                      Run This Test
                                    </>
                                  )}
                                </Button>
                              </div> */}
                        </div>
                          </TabsContent>
                        ))}
                      </Tabs>
                          </div>
                  ) : (
                    <div className="flex items-center justify-center py-16">
                      <div className="text-center">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center">
                          <Play className="h-8 w-8 text-indigo-500 dark:text-indigo-400" />
                        </div>
                        <h3 className="text-lg font-medium text-slate-700 dark:text-slate-300 mb-2">No Results Yet</h3>
                        <p className="text-slate-500 dark:text-slate-400 max-w-sm mb-4">
                          Run your code to see results for sample test cases
                        </p>
                        <Button 
                          className="bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white relative overflow-hidden min-w-40"
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
                          <Play className="h-4 w-4 mr-2" />
                          Run Sample Tests
                            </>
                          )}
                    </Button>
                    </div>
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
    </div>
  )
} 