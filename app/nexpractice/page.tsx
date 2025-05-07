"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import {
  Code,
  Filter,
  Search,
  Tag,
  Zap,
  Trophy,
  BarChart3,
  Clock,
  Shuffle,
  BookOpen,
  CheckCircle2,
  Calendar,
  ArrowUpDown,
  ChevronDown,
  ChevronUp,
  StarHalf,
  Info,
  Eye,
  CheckCircle,
  XCircle,
  BookOpenCheck,
  Star,
  BarChart2,
  RotateCw,
  BrainCircuit,
  Sparkles,
} from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sidebar } from "@/components/sidebar"
import { TopBar } from "@/components/top-bar"
import { useTheme } from "next-themes"
import Link from "next/link"
import { apolloClient } from "@/lib/apollo-client"
import { gql } from "@apollo/client"
import { motion, AnimatePresence } from "framer-motion"

// Create our own useMobile hook since the imported one has an issue
function useMobile() {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    // Check on mount
    checkMobile()

    // Add event listener for resize
    window.addEventListener("resize", checkMobile)

    // Clean up
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  return isMobile
}

// Mock data for coding problems
const codingProblems = [
    {
      id: 1,
      title: "Two Sum",
      difficulty: "Easy",
    tags: ["Arrays", "Hash Table"],
    completion: 78,
    description:
      "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.",
    status: "Completed",
    lastAttempt: "2 days ago",
    attempts: 2,
    timeSpent: "15 min",
    },
    {
      id: 2,
    title: "Valid Parentheses",
    difficulty: "Easy",
    tags: ["Stack", "String"],
    completion: 65,
    description:
      "Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.",
    status: "Completed",
    lastAttempt: "1 week ago",
    attempts: 1,
    timeSpent: "12 min",
    },
    {
      id: 3,
    title: "Merge Two Sorted Lists",
    difficulty: "Easy",
    tags: ["Linked List", "Recursion"],
    completion: 59,
    description: "Merge two sorted linked lists and return it as a sorted list.",
    status: "In Progress",
    lastAttempt: "Yesterday",
    attempts: 3,
    timeSpent: "25 min",
    },
    {
      id: 4,
    title: "Maximum Subarray",
    difficulty: "Medium",
    tags: ["Array", "Divide and Conquer", "Dynamic Programming"],
    completion: 45,
    description: "Find the contiguous subarray which has the largest sum.",
    status: "Not Started",
    lastAttempt: "-",
    attempts: 0,
    timeSpent: "-",
  },
  {
    id: 5,
    title: "LRU Cache",
    difficulty: "Medium",
    tags: ["Hash Table", "Linked List", "Design"],
    completion: 38,
    description: "Design a data structure that follows the constraints of a Least Recently Used (LRU) cache.",
    status: "Failed",
    lastAttempt: "3 days ago",
    attempts: 2,
    timeSpent: "45 min",
  },
  {
    id: 6,
    title: "Trapping Rain Water",
    difficulty: "Hard",
    tags: ["Array", "Two Pointers", "Dynamic Programming", "Stack"],
    completion: 22,
    description:
      "Given n non-negative integers representing an elevation map where the width of each bar is 1, compute how much water it can trap after raining.",
    status: "Not Started",
    lastAttempt: "-",
    attempts: 0,
    timeSpent: "-",
  },
]

// Mock data for student performance
const performanceStats = {
  totalSolved: 127,
  easyCompleted: 68,
  mediumCompleted: 42,
  hardCompleted: 17,
  averageTime: "28 min",
  streak: 12,
  ranking: 342,
  totalStudents: 5280,
  recentSubmissions: [
    { problem: "Valid Parentheses", result: "Accepted", time: "2 hours ago", runtime: "98ms", memory: "40.2MB" },
    { problem: "Two Sum", result: "Accepted", time: "Yesterday", runtime: "76ms", memory: "38.9MB" },
    { problem: "LRU Cache", result: "Wrong Answer", time: "2 days ago", runtime: "N/A", memory: "N/A" },
    { problem: "LRU Cache", result: "Accepted", time: "2 days ago", runtime: "132ms", memory: "72.4MB" },
  ],
}

// Daily challenge data
const dailyChallenge = {
  id: 7,
  title: "Longest Palindromic Substring",
  difficulty: "Medium",
  tags: ["String", "Dynamic Programming"],
  description: "Given a string s, return the longest palindromic substring in s.",
  expiresIn: "14:32:18",
}

// Modern spinner loader component
function TagLoader() {
  return (
    <div className="flex items-center gap-2 py-2 px-4 bg-muted/40 rounded-lg animate-pulse">
      <svg className="animate-spin h-5 w-5 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
      </svg>
      <span className="text-indigo-700 dark:text-indigo-200 font-medium text-sm">Loading tags...</span>
        </div>
  )
}

// Modern spinner loader for problems
function ProblemLoader() {
  return (
    <div className="flex items-center gap-2 py-2 px-4 bg-muted/40 rounded-lg animate-pulse">
      <svg className="animate-spin h-5 w-5 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
      </svg>
      <span className="text-indigo-700 dark:text-indigo-200 font-medium text-sm">Loading problems...</span>
                </div>
  )
}

// Progress Path Animation Component
function ProgressPathAnimation() {
  const [progress, setProgress] = useState(0);
  
  useEffect(() => {
    // Animate progress from 0 to current percentage over time
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev < 65) return prev + 1;
        return prev;
      });
    }, 30);
    
    return () => clearInterval(interval);
  }, []);
  
  return (
    <div className="relative w-full h-20 mb-6">
      {/* Progress path background */}
      <div className="absolute inset-0 h-3 top-1/2 -translate-y-1/2 bg-slate-200 dark:bg-slate-800 rounded-full"></div>
      
      {/* Animated progress fill */}
      <motion.div 
        className="absolute h-3 top-1/2 -translate-y-1/2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full"
        initial={{ width: "0%" }}
        animate={{ width: `${progress}%` }}
        transition={{ duration: 0.5 }}
      />
      
      {/* Milestone points */}
      {[10, 25, 40, 55, 70, 85].map((milestone, index) => (
        <motion.div 
          key={index}
          className={`absolute top-1/2 -translate-y-1/2 -ml-3 h-6 w-6 rounded-full flex items-center justify-center ${
            progress >= milestone 
              ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md"
              : "bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-500"
          }`}
          style={{ left: `${milestone}%` }}
          initial={{ scale: 0.8, opacity: 0.5 }}
          animate={{ 
            scale: progress >= milestone ? 1 : 0.8, 
            opacity: progress >= milestone ? 1 : 0.5 
          }}
          transition={{ duration: 0.3 }}
        >
          <span className="text-xs font-medium">{index + 1}</span>
          
          {/* Tooltip */}
          <div className={`absolute bottom-full mb-2 px-2 py-1 text-xs font-medium rounded bg-slate-800 text-white whitespace-nowrap transform -translate-x-1/2 ${
            progress >= milestone ? "opacity-100" : "opacity-0"
          } transition-opacity duration-300`}>
            {index === 0 ? "First Steps" :
             index === 1 ? "Building Basics" :
             index === 2 ? "Getting Comfortable" :
             index === 3 ? "Growing Skills" :
             index === 4 ? "Advanced Techniques" :
             "Mastery Path"}
          </div>
        </motion.div>
      ))}
      
      {/* Moving element along path */}
      <motion.div 
        className="absolute top-1/2 -translate-y-1/2 -ml-5 h-10 w-10"
        style={{ left: `${progress}%` }}
      >
        <div className="w-full h-full relative">
          <div className="absolute inset-0 bg-indigo-400 dark:bg-indigo-600 rounded-full opacity-20 animate-ping"></div>
          <div className="absolute inset-0 bg-white dark:bg-slate-900 rounded-full flex items-center justify-center border-2 border-indigo-500 dark:border-indigo-400">
            <Code className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// Smart Problem Recommendation Component
function SmartRecommendations() {
  const [loading, setLoading] = useState(true);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  
  // Mock data - in a real app, this would come from an API based on user's performance
  useEffect(() => {
    // Simulate API call
    const timer = setTimeout(() => {
      setRecommendations([
        {
          id: "rec1",
          title: "Longest Common Subsequence",
          difficulty: "Medium",
          tags: ["Dynamic Programming", "String"],
          reason: "Based on your recent difficulty with string manipulation problems",
          confidence: 87
        },
        {
          id: "rec2",
          title: "Binary Tree Level Order Traversal",
          difficulty: "Medium",
          tags: ["Tree", "BFS"],
          reason: "To strengthen your breadth-first search skills",
          confidence: 92
        },
        {
          id: "rec3",
          title: "Meeting Rooms II",
          difficulty: "Medium",
          tags: ["Sorting", "Greedy"],
          reason: "This will help improve your problem-solving with intervals",
          confidence: 78
        }
      ]);
      setLoading(false);
    }, 1200);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Different card layouts for recommendations
  const cardVariants = [
    "from-blue-50 to-indigo-100 dark:from-blue-950/30 dark:to-indigo-900/30 border-blue-200 dark:border-blue-800/50",
    "from-purple-50 to-pink-100 dark:from-purple-950/30 dark:to-pink-900/30 border-purple-200 dark:border-purple-800/50",
    "from-emerald-50 to-teal-100 dark:from-emerald-950/30 dark:to-teal-900/30 border-emerald-200 dark:border-emerald-800/50"
  ];
  
  return (
    <div>
      {loading ? (
        <div className="flex items-center justify-center space-x-2 py-8">
          <RotateCw className="h-5 w-5 animate-spin text-indigo-500" />
          <span className="text-sm text-slate-600 dark:text-slate-400">Analyzing your coding patterns...</span>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BrainCircuit className="h-5 w-5 text-indigo-500" />
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                AI-Powered Recommendations
              </span>
            </div>
            <Button variant="ghost" size="sm" className="text-xs">
              <RotateCw className="mr-1 h-3 w-3" />
              Refresh
            </Button>
          </div>
          
          <div className="grid gap-3">
            {recommendations.map((recommendation, index) => (
              <motion.div
                key={recommendation.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className={`rounded-lg p-4 border bg-gradient-to-br ${cardVariants[index % cardVariants.length]} relative overflow-hidden`}
              >
                {/* Decorative elements */}
                <div className="absolute top-0 right-0 h-20 w-20 bg-white/10 rounded-full -mt-10 -mr-10"></div>
                <div className="absolute bottom-0 left-0 h-12 w-12 bg-black/5 rounded-full -mb-6 -ml-6"></div>
                
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-medium text-slate-800 dark:text-slate-200">
                    {recommendation.title}
                  </h4>
                  <Badge
                    className={
                      recommendation.difficulty === "Easy"
                        ? "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300"
                        : recommendation.difficulty === "Medium"
                        ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300"
                        : "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300"
                    }
                  >
                    {recommendation.difficulty}
                  </Badge>
                </div>
                
                <div className="text-xs text-slate-600 dark:text-slate-400 mb-3">
                  {recommendation.tags.map((tag: string, i: number) => (
                    <span key={i} className="mr-2">
                      #{tag.toLowerCase().replace(/\s+/g, '')}
                    </span>
                  ))}
                </div>
                
                <div className="flex justify-between items-end">
                  <div className="text-xs italic text-slate-500 dark:text-slate-400 max-w-[70%]">
                    {recommendation.reason}
                  </div>
                  
                  <div className="flex items-center gap-1 text-xs bg-white/50 dark:bg-slate-800/50 py-1 px-2 rounded-full">
                    <Sparkles className="h-3 w-3 text-amber-500" />
                    <span className="font-medium text-amber-700 dark:text-amber-400">{recommendation.confidence}% match</span>
                  </div>
                </div>
                
                <Button 
                  className="w-full mt-3 bg-white/80 hover:bg-white dark:bg-slate-800/80 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700"
                  size="sm"
                >
                  Try this problem
                </Button>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Define GraphQL query to fetch both tags and coding questions
const GET_NEXPRACTICE_DATA = gql`
  query GetNexpracticeData($page: Int = 1, $limit: Int = 20, $search: String, $difficulty: QuestionDifficulty, $tagIds: [ID!]) {
    tags {
      id
      name
      _count {
        codingQuestions
      }
    }
    questions(
      type: CODING
      page: $page
      limit: $limit
      search: $search
      tagIds: $tagIds
      difficulty: $difficulty
      includeSubcategories: true
    ) {
      questions {
        id
        name
        type
        status
        folder {
          id
          name
        }
        codingQuestion {
          id
          questionText
          defaultMark
          difficulty
          tags {
            id
            name
          }
        }
        solvedByCount
        accuracy
      }
      totalCount
    }
  }
`;

// StatCard component for the unique stats display
interface StatCardProps {
  label: string;
  value: string | number;
  bgColor: string;
  textColor: string;
  borderColor: string;
  icon: React.ReactNode;
}

const StatCard = ({ label, value, bgColor, textColor, borderColor, icon }: StatCardProps) => (
  <div className={`p-3 rounded-lg bg-gradient-to-br ${bgColor} border ${borderColor} shadow-sm transform transition-transform duration-200 hover:scale-105 hover:shadow-md`}>
    <div className="flex items-center justify-between mb-1">
      <span className="text-xs font-medium text-slate-600 dark:text-slate-400">{label}</span>
      {icon}
    </div>
    <div className={`text-xl font-bold ${textColor}`}>
      {value}
    </div>
  </div>
);

// Main NexPractice component
export default function NexPractice() {
  const [mounted, setMounted] = useState(false)
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [difficulty, setDifficulty] = useState("All")
  const [activeTab, setActiveTab] = useState("all")
  const isMobile = useMobile()
  const { resolvedTheme } = useTheme()
  const [allTags, setAllTags] = useState<{ id: string; name: string; _count?: { codingQuestions: number } }[]>([])
  const [tagsLoading, setTagsLoading] = useState(true)
  const [tagsError, setTagsError] = useState<string | null>(null)
  const [showAllTags, setShowAllTags] = useState(false)
  const [codingProblems, setCodingProblems] = useState<any[]>([])
  const [loadingProblems, setLoadingProblems] = useState(true)
  const [problemsError, setProblemsError] = useState<string | null>(null)
  const QUESTIONS_PER_PAGE = 20;
  const [currentPage, setCurrentPage] = useState(1);
  const [totalProblems, setTotalProblems] = useState(0);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const tableRef = useRef<HTMLDivElement>(null);

  // Prevent hydration errors
  useEffect(() => {
    setMounted(true)
  }, [])

  // Function to format difficulty for display
  const formatDifficulty = (difficulty: string) => {
    if (!difficulty) return "Medium";
    
    // Convert ENUM values to title case
    if (difficulty === "EASY") return "Easy";
    if (difficulty === "MEDIUM") return "Medium";
    if (difficulty === "HARD") return "Hard";
    if (difficulty === "VERY_HARD") return "Very Hard";
    if (difficulty === "EXTREME") return "Extreme";
    
    // If it's already formatted, return as is
    return difficulty;
  }

  // New function to fetch data using GraphQL
  const fetchData = async () => {
    setIsDataLoading(true);
    
    try {
      // Prepare variables for GraphQL query
      const variables: any = {
        page: currentPage,
        limit: QUESTIONS_PER_PAGE
      };
      
      // Add search filter if exists
      if (searchQuery.trim()) {
        variables.search = searchQuery;
      }
      
      // Add difficulty filter if not "All"
      if (difficulty !== "All") {
        // Map UI difficulty values to enum values safely
        let difficultyValue: string;
        switch(difficulty) {
          case "Easy":
            difficultyValue = "EASY";
            break;
          case "Medium":
            difficultyValue = "MEDIUM";
            break;
          case "Hard":
            difficultyValue = "HARD";
            break;
          default:
            // Skip invalid difficulty values
            difficultyValue = "";
        }
        
        if (difficultyValue) {
          variables.difficulty = difficultyValue;
        }
      }
      
      // Add tag filter if selected
      if (selectedTags.length > 0) {
        // We need to find tag IDs from names
        const tagIds = allTags
          .filter(tag => selectedTags.includes(tag.name))
          .map(tag => tag.id);
        
        if (tagIds.length > 0) {
          variables.tagIds = tagIds;
        }
      }
      
      console.log("%c GraphQL Query Variables:", "background: #4B0082; color: white; padding: 4px;", JSON.stringify(variables, null, 2));
      console.log("%c GraphQL Query:", "background: #4B0082; color: white; padding: 4px;", GET_NEXPRACTICE_DATA.loc?.source?.body);
      
      const { data } = await apolloClient.query({
        query: GET_NEXPRACTICE_DATA,
        variables,
        fetchPolicy: 'network-only' // Don't use cache for this
      });
      
      // Validate data received
      if (!data) {
        console.error("GraphQL query returned no data");
        setTagsError("Failed to load data from server");
        setProblemsError("Failed to load data from server");
        return;
      }
      
      // Process tags data (only on first load)
      if (data.tags && currentPage === 1) {
        setAllTags(data.tags);
        setTagsLoading(false);
      }
      
      // Process questions data
      if (data.questions && data.questions.questions) {
        // Format the coding problems for the UI
        const formattedProblems = data.questions.questions.map((question: any) => ({
          id: question.id,
          name: question.name,
          questionId: question.id,
          difficulty: question.codingQuestion?.difficulty || "MEDIUM",
          status: question.status,
          tags: question.codingQuestion?.tags || [],
          questionText: question.codingQuestion?.questionText || '',
          solvedByCount: question.solvedByCount || 0,
          accuracy: question.accuracy || 0,
          folder: question.folder
        }));
        
        // Append new problems to existing problems instead of replacing them
        if (currentPage === 1) {
          setCodingProblems(formattedProblems);
        } else {
          setCodingProblems(prev => [...prev, ...formattedProblems]);
        }
        
        setTotalProblems(data.questions.totalCount || 0);
        setLoadingProblems(false);
        
        // Check if we've reached the end of the data
        if (formattedProblems.length < QUESTIONS_PER_PAGE || 
            codingProblems.length + formattedProblems.length >= data.questions.totalCount) {
          setHasMore(false);
        } else {
          setHasMore(true);
        }
      } else {
        console.warn("No questions data returned from GraphQL");
        setProblemsError("No questions data available");
        setHasMore(false);
      }
      
    } catch (error: any) {
      console.error("%c GraphQL Error Details:", "background: #FF0000; color: white; padding: 4px;", error);
      
      // Extract detailed error info if available
      if (error.graphQLErrors && error.graphQLErrors.length > 0) {
        console.error("GraphQL Errors:", error.graphQLErrors);
      }
      
      if (error.networkError) {
        console.error("Network Error:", error.networkError);
        if (error.networkError.result && error.networkError.result.errors) {
          console.error("Network Error Details:", error.networkError.result.errors);
        }
      }
      
      setTagsError("Failed to load tags");
      setProblemsError(`Error loading data: ${error.message}`);
      setHasMore(false);
    } finally {
      setIsDataLoading(false);
      setTagsLoading(false);
        setLoadingProblems(false);
    }
  };

  // Function to load more data
  const loadMoreData = useCallback(async () => {
    if (isDataLoading || !hasMore) return;
    
    // Load the next page
    setCurrentPage(prev => prev + 1);
  }, [isDataLoading, hasMore]);

  // Setup intersection observer for infinite scrolling
  useEffect(() => {
    if (!mounted) return;
    
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && !isDataLoading && hasMore) {
          loadMoreData();
        }
      },
      { threshold: 0.5 }
    );
    
    // Observe the loading trigger element
    const loaderElement = document.getElementById('loading-trigger');
    if (loaderElement) observer.observe(loaderElement);
    
    return () => {
      if (loaderElement) observer.unobserve(loaderElement);
    };
  }, [mounted, isDataLoading, hasMore, loadMoreData]);

  // Initial data load
  useEffect(() => {
    if (mounted) {
      fetchData();
    }
  }, [mounted]);

  // Reset to first page when filters/search change
  useEffect(() => {
    if (mounted && (searchQuery || difficulty !== "All" || selectedTags.length > 0)) {
      // Reset problem list and start over
      setCodingProblems([]);
      setCurrentPage(1);
      setHasMore(true);
      fetchData();
    }
  }, [mounted, searchQuery, difficulty, selectedTags]);
  
  // Second effect that only responds to currentPage changes for infinite scroll
  useEffect(() => {
    if (mounted && currentPage > 1) {
      fetchData();
    }
  }, [mounted, currentPage]);

  if (!mounted) return null

  // Filter problems based on selected criteria - no longer needed since GraphQL handles filtering
  const filteredProblems = codingProblems;
  
  // Calculate total pages based on total problems
  const totalPages = Math.ceil(totalProblems / QUESTIONS_PER_PAGE);
  const paginatedProblems = filteredProblems;

  // Toggle tag selection
  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag))
    } else {
      setSelectedTags([...selectedTags, tag])
    }
  }

  // Get a random problem
  const getRandomProblem = () => {
    const randomIndex = Math.floor(Math.random() * codingProblems.length)
    alert(`Random Problem Selected: ${codingProblems[randomIndex].title}`)
  }

  // Get status badge styling
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Completed":
        return (
          <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 flex items-center gap-1">
            <CheckCircle className="w-3 h-3" />
            {status}
          </Badge>
        )
      case "In Progress":
        return (
          <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 flex items-center gap-1">
            <StarHalf className="w-3 h-3" />
            {status}
          </Badge>
        )
      case "Failed":
        return (
          <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300 flex items-center gap-1">
            <XCircle className="w-3 h-3" />
            {status}
          </Badge>
        )
      default:
        return (
          <Badge variant="outline" className="text-muted-foreground flex items-center gap-1">
            <Info className="w-3 h-3" />
            {status}
          </Badge>
        )
    }
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar */}
      <Sidebar theme={resolvedTheme as "light" | "dark"} />
      
      {/* Main content area - only this should scroll */}
      <div className="flex flex-1 flex-col overflow-hidden transition-all duration-300">
        <TopBar onMenuClick={() => {}} />
        
        {/* Main content with refined scrolling */}
        <main className="flex-1 overflow-y-auto p-0">
          <div className="max-w-[1600px] mx-auto px-4 sm:px-6 space-y-6 py-6">
            {/* Unique, standout hero section with distinctive visual identity */}
            <div className="relative overflow-hidden rounded-xl">
              {/* Abstract background pattern for uniqueness */}
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/90 via-purple-50/80 to-pink-50/70 dark:from-indigo-950/90 dark:via-purple-950/80 dark:to-pink-950/70">
                <div className="absolute inset-0 opacity-10">
                  <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                      <pattern id="smallGrid" width="20" height="20" patternUnits="userSpaceOnUse">
                        <path d="M 20 0 L 0 0 0 20" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.3" />
                      </pattern>
                      <pattern id="grid" width="80" height="80" patternUnits="userSpaceOnUse">
                        <rect width="80" height="80" fill="url(#smallGrid)" />
                        <path d="M 80 0 L 0 0 0 80" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.5" />
                      </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#grid)" />
                  </svg>
                </div>
                
                {/* Decorative elements */}
                <div className="absolute top-[10%] left-[5%] w-24 h-24 rounded-full bg-gradient-to-br from-blue-200/20 to-purple-300/20 dark:from-blue-500/10 dark:to-purple-600/10 blur-2xl"></div>
                <div className="absolute bottom-[15%] right-[10%] w-32 h-32 rounded-full bg-gradient-to-br from-pink-200/20 to-purple-300/20 dark:from-pink-500/10 dark:to-purple-600/10 blur-2xl"></div>
                <div className="absolute top-[40%] right-[20%] w-16 h-16 rounded-full bg-gradient-to-br from-indigo-200/20 to-blue-300/20 dark:from-indigo-500/10 dark:to-blue-600/10 blur-xl"></div>
              </div>

              <div className="relative px-6 py-10 md:py-12">
                <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
                  <div className="space-y-5 max-w-xl">
                    <div className="flex items-center gap-4">
                      {/* Unique logo with code brackets and 3D effect */}
                      <div className="relative flex items-center justify-center w-14 h-14">
                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 to-purple-600 dark:from-indigo-500 dark:to-purple-500 rounded-xl transform rotate-3 opacity-80"></div>
                        <div className="absolute inset-0 bg-gradient-to-tl from-blue-500 to-indigo-600 dark:from-blue-400 dark:to-indigo-500 rounded-xl transform -rotate-3 opacity-80"></div>
                        <div className="relative z-10 flex items-center justify-center w-12 h-12 bg-white dark:bg-slate-800 rounded-lg shadow-inner">
                          <Code className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                        </div>
                      </div>
                      
                      {/* Distinctive typography with gradient line */}
                      <div>
                        <h1 className="text-3xl md:text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-indigo-700 via-purple-700 to-pink-600 dark:from-indigo-300 dark:via-purple-300 dark:to-pink-300">
                          NexPractice
                        </h1>
                        <div className="h-1 w-24 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full mt-1"></div>
                      </div>
                    </div>
                    
                    <p className="text-lg text-slate-700 dark:text-slate-300 leading-relaxed">
                      Master coding through structured practice in our <span className="font-semibold text-indigo-700 dark:text-indigo-300">uniquely personalized</span> learning environment. Solve, track, and excel with NexAcademy's exclusive approach.
                    </p>
                    
                    {/* Distinctive call-to-action buttons */}
                    <div className="flex flex-wrap gap-4 mt-6">
                      <Button className="relative group overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-600 hover:from-indigo-700 hover:via-purple-700 hover:to-indigo-700 text-white gap-2 shadow-md border-0 px-6 py-6">
                        <div className="absolute inset-0 w-full h-full bg-[radial-gradient(circle_at_50%_120%,rgba(120,119,198,0.3),transparent_55%)]"></div>
                        <div className="relative flex items-center">
                          <Zap className="w-5 h-5 mr-2 transition-transform duration-300 group-hover:rotate-12" />
                          <span className="font-medium">Daily Challenge</span>
                        </div>
                      </Button>
                      
                      <Button
                        variant="outline"
                        className="relative overflow-hidden border-indigo-300 dark:border-indigo-700 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 gap-2 shadow-sm px-6 py-6 group"
                        onClick={getRandomProblem}
                      >
                        <div className="absolute inset-0 w-full h-full bg-[radial-gradient(circle_at_50%_120%,rgba(120,119,198,0.1),transparent_65%)] dark:bg-[radial-gradient(circle_at_50%_120%,rgba(120,119,198,0.2),transparent_65%)]"></div>
                        <div className="relative flex items-center">
                          <Shuffle className="w-5 h-5 mr-2 transition-transform duration-300 group-hover:rotate-180" />
                          <span className="font-medium">Random Problem</span>
                        </div>
                      </Button>
                    </div>
                  </div>

                  {/* Unique stats visualization with 3D-like cards */}
                  <div className="relative grid grid-cols-2 gap-3 p-3 bg-white/70 dark:bg-slate-900/60 rounded-xl backdrop-blur-md border border-white/50 dark:border-slate-700/50 shadow-xl">
                    {/* Decorative elements */}
                    <div className="absolute -top-3 -left-3 w-6 h-6 bg-indigo-100 dark:bg-indigo-900/50 rounded-full border-2 border-indigo-200 dark:border-indigo-700"></div>
                    <div className="absolute -bottom-3 -right-3 w-6 h-6 bg-purple-100 dark:bg-purple-900/50 rounded-full border-2 border-purple-200 dark:border-purple-700"></div>
                    
                    <div className="col-span-2 flex justify-between items-center mb-1">
                      <h3 className="text-sm font-medium text-slate-600 dark:text-slate-400">Your Progress</h3>
                      <span className="text-xs px-2 py-1 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 rounded-full font-medium">
                        Top 5%
                      </span>
                    </div>
                    
                    <StatCard 
                      label="Solved" 
                      value={performanceStats.totalSolved} 
                      bgColor="from-indigo-50/90 to-indigo-100/80 dark:from-indigo-900/30 dark:to-indigo-800/30" 
                      textColor="text-indigo-700 dark:text-indigo-300"
                      borderColor="border-indigo-200 dark:border-indigo-700/50"
                      icon={<CheckCircle className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />}
                    />
                    
                    <StatCard 
                      label="Streak" 
                      value={performanceStats.streak} 
                      bgColor="from-purple-50/90 to-purple-100/80 dark:from-purple-900/30 dark:to-purple-800/30" 
                      textColor="text-purple-700 dark:text-purple-300"
                      borderColor="border-purple-200 dark:border-purple-700/50"
                      icon={<Zap className="w-4 h-4 text-purple-500 dark:text-purple-400" />}
                    />
                    
                    <StatCard 
                      label="Avg. Time" 
                      value={performanceStats.averageTime} 
                      bgColor="from-blue-50/90 to-blue-100/80 dark:from-blue-900/30 dark:to-blue-800/30" 
                      textColor="text-blue-700 dark:text-blue-300"
                      borderColor="border-blue-200 dark:border-blue-700/50"
                      icon={<Clock className="w-4 h-4 text-blue-500 dark:text-blue-400" />}
                    />
                    
                    <StatCard 
                      label="Rank" 
                      value={`#${performanceStats.ranking}`} 
                      bgColor="from-amber-50/90 to-amber-100/80 dark:from-amber-900/30 dark:to-amber-800/30" 
                      textColor="text-amber-700 dark:text-amber-300"
                      borderColor="border-amber-200 dark:border-amber-700/50"
                      icon={<Trophy className="w-4 h-4 text-amber-500 dark:text-amber-400" />}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* New: Learning Progress Path Animation */}
            <Card className="border-none rounded-xl shadow-md overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-slate-50/80 to-slate-100/80 dark:from-slate-900/40 dark:to-slate-800/40 backdrop-blur-sm pb-3">
                <CardTitle className="text-xl flex items-center gap-2 text-slate-800 dark:text-slate-200">
                  <BookOpenCheck className="w-5 h-5" /> Your Learning Path
                </CardTitle>
                <CardDescription className="text-slate-600 dark:text-slate-400">
                  Track your progress through coding challenges
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <ProgressPathAnimation />
                
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                  <div className="rounded-lg bg-indigo-50 dark:bg-indigo-900/20 p-4 border border-indigo-100 dark:border-indigo-800/50">
                    <div className="text-xs text-indigo-600 dark:text-indigo-400 mb-1">Current Level</div>
                    <div className="text-xl font-semibold text-indigo-800 dark:text-indigo-300 flex items-center gap-2">
                      <Star className="w-4 h-4 text-indigo-500" /> Intermediate
                    </div>
                  </div>
                  
                  <div className="rounded-lg bg-purple-50 dark:bg-purple-900/20 p-4 border border-purple-100 dark:border-purple-800/50">
                    <div className="text-xs text-purple-600 dark:text-purple-400 mb-1">Next Milestone</div>
                    <div className="text-xl font-semibold text-purple-800 dark:text-purple-300 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-purple-500" /> 75 Problems
                    </div>
                  </div>
                  
                  <div className="rounded-lg bg-pink-50 dark:bg-pink-900/20 p-4 border border-pink-100 dark:border-pink-800/50 col-span-2 md:col-span-1">
                    <div className="text-xs text-pink-600 dark:text-pink-400 mb-1">Recommended Focus</div>
                    <div className="text-xl font-semibold text-pink-800 dark:text-pink-300 flex items-center gap-2">
                      <BarChart2 className="w-4 h-4 text-pink-500" /> Dynamic Programming
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Main content layout - improved spacing and proportions */}
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Left column - problem list and filters - wider to give more space */}
              <div className="flex-1 space-y-6 lg:max-w-[calc(100%-320px)]">
                {/* Search and filter section - more refined appearance */}
                <Card className="border-none rounded-xl shadow-md overflow-hidden">
                  <CardHeader className="pb-3 bg-gradient-to-r from-slate-50/80 to-slate-100/80 dark:from-slate-900/40 dark:to-slate-800/40 backdrop-blur-sm">
                    <CardTitle className="text-xl flex items-center gap-2 text-slate-800 dark:text-slate-200">
                      <Filter className="w-5 h-5" /> Problem Filters
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-5 p-6">
                    <div className="flex flex-col sm:flex-row gap-4">
                      <div className="relative flex-1">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          type="search"
                          placeholder="Search problems..."
                          className="pl-9 border-muted-foreground/20 bg-background/50"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          variant={difficulty === "All" ? "default" : "outline"}
                          onClick={() => setDifficulty("All")}
                          className="flex-1 sm:flex-none bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700"
                        >
                          All
                        </Button>
                        <Button 
                          variant={difficulty === "Easy" ? "default" : "outline"}
                          onClick={() => setDifficulty("Easy")}
                          className={`flex-1 sm:flex-none ${
                            difficulty === "Easy" ? "bg-gradient-to-r from-green-100 to-green-50 dark:from-green-900/50 dark:to-green-800/30 text-green-800 dark:text-green-300 border-green-200 dark:border-green-800" : "text-green-600 border-green-200 dark:border-green-900/50"
                          }`}
                        >
                          Easy
                        </Button>
                        <Button
                          variant={difficulty === "Medium" ? "default" : "outline"}
                          onClick={() => setDifficulty("Medium")}
                          className={`flex-1 sm:flex-none ${
                            difficulty === "Medium" ? "bg-gradient-to-r from-yellow-100 to-yellow-50 dark:from-yellow-900/50 dark:to-yellow-800/30 text-yellow-800 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800" : "text-yellow-600 border-yellow-200 dark:border-yellow-900/50"
                          }`}
                        >
                          Medium
                        </Button>
                        <Button 
                          variant={difficulty === "Hard" ? "default" : "outline"}
                          onClick={() => setDifficulty("Hard")}
                          className={`flex-1 sm:flex-none ${
                            difficulty === "Hard" ? "bg-gradient-to-r from-red-100 to-red-50 dark:from-red-900/50 dark:to-red-800/30 text-red-800 dark:text-red-300 border-red-200 dark:border-red-800" : "text-red-600 border-red-200 dark:border-red-900/50"
                          }`}
                        >
                          Hard
                        </Button>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium mb-3 flex items-center gap-1 text-slate-700 dark:text-slate-300">
                        <Tag className="w-4 h-4" /> Tags
                      </h3>
                      <div className="flex flex-wrap gap-2 max-h-[180px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-700 scrollbar-track-transparent">
                        {tagsLoading ? (
                          <TagLoader />
                        ) : tagsError ? (
                          <div className="text-red-500">{tagsError}</div>
                        ) : (
                          <>
                            {allTags.map((tag) => (
                              <Badge
                                key={tag.id}
                                variant={selectedTags.includes(tag.name) ? "default" : "outline"}
                                className={`cursor-pointer hover:bg-muted transition-colors flex items-center gap-1 whitespace-nowrap ${
                                  selectedTags.includes(tag.name) 
                                    ? "bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900/40 dark:to-purple-900/40 text-indigo-800 dark:text-indigo-200" 
                                    : "hover:border-indigo-300 dark:hover:border-indigo-700"
                                }`}
                                onClick={() => toggleTag(tag.name)}
                              >
                                {tag.name}
                                <span className="ml-1 px-1.5 py-0.5 rounded-full bg-indigo-200/70 dark:bg-indigo-800/50 text-xs font-semibold text-indigo-700 dark:text-indigo-200">
                                  {tag._count?.codingQuestions ?? 0}
                                </span>
                              </Badge>
                            ))}
                          </>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Problem list with improved aesthetics */}
                <Card className="border-none rounded-xl shadow-md overflow-hidden">
                  <CardHeader className="pb-0 pt-6 px-6 bg-gradient-to-r from-slate-50/80 to-slate-100/80 dark:from-slate-900/40 dark:to-slate-800/40 backdrop-blur-sm">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <CardTitle className="text-xl font-semibold flex items-center gap-2 text-slate-800 dark:text-slate-200">
                        <BookOpen className="w-5 h-5" /> Coding Problems
                      </CardTitle>
                      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full sm:w-auto">
                        <TabsList className="grid grid-cols-4 w-full sm:w-auto bg-slate-200/50 dark:bg-slate-800/50">
                          <TabsTrigger value="all" className="text-xs sm:text-sm data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900">
                            All
                          </TabsTrigger>
                          <TabsTrigger value="completed" className="text-xs sm:text-sm data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900">
                            Completed
                          </TabsTrigger>
                          <TabsTrigger value="inProgress" className="text-xs sm:text-sm data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900">
                            In Progress
                          </TabsTrigger>
                          <TabsTrigger value="notStarted" className="text-xs sm:text-sm data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900">
                            Not Started
                          </TabsTrigger>
                        </TabsList>
                      </Tabs>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="p-0">
                    <div className="rounded-b-xl overflow-hidden bg-card" ref={tableRef}>
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader className="bg-slate-50/80 dark:bg-slate-900/40 backdrop-blur-sm">
                            <TableRow className="hover:bg-muted/20 border-b border-slate-200/50 dark:border-slate-800/50">
                              <TableHead className="w-[60%] py-4">
                                <div className="flex items-center gap-1 font-medium text-slate-700 dark:text-slate-300">
                                  Problem <ArrowUpDown className="w-3 h-3 ml-1 opacity-70" />
                                </div>
                              </TableHead>
                              <TableHead className="w-[15%]">
                                <div className="flex items-center gap-1 font-medium text-slate-700 dark:text-slate-300">
                                  Difficulty
                                </div>
                              </TableHead>
                              <TableHead className="w-[15%] text-center hidden md:table-cell">
                                <div className="flex items-center justify-center gap-1 font-medium text-slate-700 dark:text-slate-300">
                                  Solved By
                                </div>
                              </TableHead>
                              <TableHead className="w-[10%] text-center">
                                <div className="flex items-center justify-center gap-1 font-medium text-slate-700 dark:text-slate-300">
                                  Accuracy
                                </div>
                              </TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {loadingProblems && codingProblems.length === 0 ? (
                              <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center">
                                  <ProblemLoader />
                                </TableCell>
                              </TableRow>
                            ) : problemsError ? (
                              <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center text-red-500">{problemsError}</TableCell>
                              </TableRow>
                            ) : codingProblems.length > 0 ? (
                              <>
                                {codingProblems.map((problem, index) => {
                                  // Calculate the actual problem number based on pagination
                                  const problemNumber = index + 1;
                                  
                                  return (
                                    <TableRow 
                                      key={problem.id}
                                      className={`hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition-colors border-b border-slate-200/40 dark:border-slate-800/40`}
                                    >
                                      <TableCell className="py-4">
                                        <div>
                                          <div className="flex items-center gap-3">
                                            <span className="flex items-center justify-center min-w-[28px] h-7 bg-indigo-50 dark:bg-indigo-900/30 rounded-full text-indigo-700 dark:text-indigo-300 text-sm font-medium">
                                              {problemNumber}
                                            </span>
                                            <div className="flex-1 min-w-0">
                                              {problem.questionId ? (
                                                <Link
                                                  href={`/nexpractice/problem/${problem.questionId}`}
                                                  className="font-medium text-indigo-700 dark:text-indigo-300 hover:underline line-clamp-1"
                                                >
                                                  {problem.question?.name || problem.name}
                                                </Link>
                                              ) : (
                                                <span className="text-red-500 flex items-center gap-1" title="Missing questionId">
                                                  ⚠️ {problem.question?.name || problem.name}
                                                </span>
                                              )}
                                              
                                              <div className="text-xs text-muted-foreground mt-1 line-clamp-1">
                                                {problem.tags?.slice(0, 3).map((tag: any, idx: number) => (
                                                  <Badge 
                                                    key={tag.id || idx}
                                                    variant="outline"
                                                    className="mr-1.5 px-1.5 py-0 text-[10px] border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400"
                                                  >
                                                    {tag.name}
                                                  </Badge>
                                                ))}
                                                {problem.tags && problem.tags.length > 3 && (
                                                  <Badge 
                                                    variant="outline"
                                                    className="px-1.5 py-0 text-[10px] border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400"
                                                  >
                                                    +{problem.tags.length - 3}
                                                  </Badge>
                                                )}
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                      </TableCell>
                                      <TableCell>
                                        <Badge
                                          className={
                                            problem.difficulty === "Easy" || problem.difficulty === "EASY"
                                              ? "bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/40 text-green-800 dark:text-green-300 border border-green-200 dark:border-green-800/50"
                                              : problem.difficulty === "Medium" || problem.difficulty === "MEDIUM"
                                                ? "bg-gradient-to-r from-yellow-50 to-yellow-100 dark:from-yellow-900/30 dark:to-yellow-800/40 text-yellow-800 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-800/50"
                                                : problem.difficulty === "Hard" || problem.difficulty === "HARD"
                                                  ? "bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/30 dark:to-red-800/40 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-800/50"
                                                  : ""
                                          }
                                        >
                                          {formatDifficulty(problem.difficulty)}
                                        </Badge>
                                      </TableCell>
                                      <TableCell className="hidden md:table-cell text-center">
                                        <span className="inline-flex items-center justify-center font-medium text-slate-700 dark:text-slate-300">
                                          {problem.solvedByCount ?? 0}
                                        </span>
                                      </TableCell>
                                      <TableCell className="text-center">
                                        <div className="inline-flex items-center justify-center px-2 py-1 rounded-full bg-slate-100 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 text-sm font-medium">
                                          {problem.accuracy != null ? `${problem.accuracy}%` : "—"}
                                        </div>
                                      </TableCell>
                                    </TableRow>
                                  );
                                })}
                                {/* Loading indicator */}
                                <TableRow id="loading-trigger">
                                  <TableCell colSpan={5} className="p-4 text-center">
                                    {isDataLoading ? (
                                      <div className="flex justify-center items-center py-4">
                                        <div className="flex items-center gap-2">
                                          <div className="animate-spin h-5 w-5 text-indigo-500">
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                                            </svg>
                                          </div>
                                          <span className="text-indigo-700 dark:text-indigo-300 text-sm">Loading more problems...</span>
                                        </div>
                                      </div>
                                    ) : hasMore ? (
                                      <div className="py-2 text-sm text-slate-500 dark:text-slate-400">
                                        Scroll for more problems
                                      </div>
                                    ) : (
                                      <div className="py-2 text-sm text-slate-500 dark:text-slate-400">
                                        You've reached the end
                                      </div>
                                    )}
                                  </TableCell>
                                </TableRow>
                              </>
                            ) : (
                              <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center">
                                  <div className="flex flex-col items-center justify-center text-muted-foreground">
                                    <Search className="w-8 h-8 mb-2 opacity-30" />
                                    <p>No problems match your filters.</p>
                                    <p className="text-sm">Try adjusting your search criteria.</p>
                                  </div>
                                </TableCell>
                              </TableRow>
                            )}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                  </div>
                  
              {/* Right column - stats and daily challenge */}
              <div className="w-full lg:w-[320px] flex-shrink-0 space-y-6">
                {/* Daily Challenge Card */}
                <Card className="border-none rounded-xl overflow-hidden shadow-md">
                  <CardHeader className="bg-gradient-to-r from-amber-50/80 to-amber-100/80 dark:from-amber-950/30 dark:to-amber-900/40 backdrop-blur-sm pb-3">
                    <CardTitle className="text-lg font-semibold flex items-center gap-2 text-amber-800 dark:text-amber-300">
                      <Zap className="w-5 h-5 text-amber-500" /> Daily Challenge
                    </CardTitle>
                    <CardDescription className="text-amber-700/80 dark:text-amber-400/80">
                      Expires in{" "}
                      <span className="font-medium text-amber-600 dark:text-amber-400">{dailyChallenge.expiresIn}</span>
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <h3 className="font-semibold text-lg mb-2 text-slate-800 dark:text-slate-200">{dailyChallenge.title}</h3>
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{dailyChallenge.description}</p>

                    <div className="flex gap-2 mb-4">
                      {(() => {
                        const badgeClass =
                          dailyChallenge.difficulty === "Easy"
                            ? "bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/40 text-green-800 dark:text-green-300 border border-green-200 dark:border-green-800/50"
                            : dailyChallenge.difficulty === "Medium"
                              ? "bg-gradient-to-r from-yellow-50 to-yellow-100 dark:from-yellow-900/30 dark:to-yellow-800/40 text-yellow-800 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-800/50"
                              : dailyChallenge.difficulty === "Hard"
                                ? "bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/30 dark:to-red-800/40 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-800/50"
                                : "";
                        return (
                          <Badge className={badgeClass}>
                            {formatDifficulty(dailyChallenge.difficulty)}
                          </Badge>
                        );
                      })()}
                      {dailyChallenge.tags.map((tag, index) => (
                        <Badge key={index} variant="outline" className="border-slate-200 dark:border-slate-800">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  
                    <Button className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white gap-2 shadow-sm border-0">
                      <Zap className="w-4 h-4" /> Solve Today's Challenge
                    </Button>
                  </CardContent>
                </Card>

                {/* New: Smart Recommendations Card */}
                <Card className="border-none rounded-xl overflow-hidden shadow-md">
                  <CardHeader className="bg-gradient-to-r from-indigo-50/80 to-purple-50/80 dark:from-indigo-950/30 dark:to-purple-950/40 backdrop-blur-sm pb-3">
                    <CardTitle className="text-lg font-semibold flex items-center gap-2 text-slate-800 dark:text-slate-200">
                      <Sparkles className="w-5 h-5 text-indigo-500" /> Recommended For You
                    </CardTitle>
                    <CardDescription className="text-slate-600 dark:text-slate-400">
                      Personalized problem suggestions
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-4">
                    <SmartRecommendations />
                  </CardContent>
                </Card>

                {/* Performance Stats Card */}
                <Card className="border-none rounded-xl overflow-hidden shadow-md">
                  <CardHeader className="pb-3 bg-gradient-to-r from-slate-50/80 to-slate-100/80 dark:from-slate-900/40 dark:to-slate-800/40 backdrop-blur-sm">
                    <CardTitle className="text-lg font-semibold flex items-center gap-2 text-slate-800 dark:text-slate-200">
                      <BarChart3 className="w-5 h-5" /> Your Performance
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-5 p-5">
                    {/* Difficulty stats with refined look */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-gradient-to-br from-green-50 to-green-100/80 dark:from-green-950/20 dark:to-green-900/30 p-3 rounded-lg text-center border border-green-200/70 dark:border-green-900/30 shadow-sm">
                        <div className="text-2xl font-bold text-green-700 dark:text-green-400">
                          {performanceStats.easyCompleted}
                        </div>
                        <div className="text-xs text-green-600 dark:text-green-500">Easy</div>
                      </div>
                      <div className="bg-gradient-to-br from-yellow-50 to-yellow-100/80 dark:from-yellow-950/20 dark:to-yellow-900/30 p-3 rounded-lg text-center border border-yellow-200/70 dark:border-yellow-900/30 shadow-sm">
                        <div className="text-2xl font-bold text-yellow-700 dark:text-yellow-400">
                          {performanceStats.mediumCompleted}
                        </div>
                        <div className="text-xs text-yellow-600 dark:text-yellow-500">Medium</div>
                      </div>
                      <div className="bg-gradient-to-br from-red-50 to-red-100/80 dark:from-red-950/20 dark:to-red-900/30 p-3 rounded-lg text-center border border-red-200/70 dark:border-red-900/30 shadow-sm">
                        <div className="text-2xl font-bold text-red-700 dark:text-red-400">
                          {performanceStats.hardCompleted}
                        </div>
                        <div className="text-xs text-red-600 dark:text-red-500">Hard</div>
                      </div>
                      <div className="bg-gradient-to-br from-blue-50 to-blue-100/80 dark:from-blue-950/20 dark:to-blue-900/30 p-3 rounded-lg text-center border border-blue-200/70 dark:border-blue-900/30 shadow-sm">
                        <div className="text-2xl font-bold text-blue-700 dark:text-blue-400">
                          {performanceStats.averageTime}
                        </div>
                        <div className="text-xs text-blue-600 dark:text-blue-500">Avg. Time</div>
                      </div>
                    </div>

                    <div className="pt-1">
                      <h3 className="text-sm font-medium mb-3 flex items-center gap-1 text-slate-700 dark:text-slate-300">
                        <Trophy className="w-4 h-4 text-amber-500" /> Ranking
                      </h3>
                      <div className="bg-gradient-to-r from-amber-50 to-amber-100/70 dark:from-amber-950/20 dark:to-amber-900/30 p-4 rounded-lg flex justify-between items-center border border-amber-200/70 dark:border-amber-900/30 shadow-sm">
                        <div>
                          <div className="text-lg font-medium text-amber-800 dark:text-amber-300">#{performanceStats.ranking}</div>
                          <div className="text-xs text-amber-700/80 dark:text-amber-400/80">of {performanceStats.totalStudents} students</div>
                        </div>
                        <div className="h-12 w-12 rounded-full bg-gradient-to-br from-amber-200 to-amber-300 dark:from-amber-800/30 dark:to-amber-700/40 flex items-center justify-center shadow-sm">
                          <Trophy className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                        </div>
                      </div>
                    </div>

                    {/* Weekly Goal Card */}
                    <div className="pt-1">
                      <h3 className="text-sm font-medium mb-3 flex items-center gap-1 text-slate-700 dark:text-slate-300">
                        <CheckCircle2 className="w-4 h-4 text-indigo-500" /> Weekly Goals
                      </h3>
                      <div className="space-y-2.5">
                        <div className="flex justify-between items-center p-2.5 rounded-lg bg-gradient-to-r from-green-50 to-green-100/70 dark:from-green-950/20 dark:to-green-900/30 border border-green-200/70 dark:border-green-900/30 shadow-sm">
                          <div className="flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-green-500" />
                            <span className="text-sm text-green-800 dark:text-green-300">Solve 5 easy problems</span>
                          </div>
                          <Badge variant="outline" className="bg-green-200/50 dark:bg-green-900/50 border-green-300/50 dark:border-green-700/50 text-green-800 dark:text-green-300">
                            5/5
                          </Badge>
                        </div>
                        <div className="flex justify-between items-center p-2.5 rounded-lg bg-gradient-to-r from-green-50 to-green-100/70 dark:from-green-950/20 dark:to-green-900/30 border border-green-200/70 dark:border-green-900/30 shadow-sm">
                          <div className="flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-green-500" />
                            <span className="text-sm text-green-800 dark:text-green-300">Solve 3 medium problems</span>
                          </div>
                          <Badge variant="outline" className="bg-green-200/50 dark:bg-green-900/50 border-green-300/50 dark:border-green-700/50 text-green-800 dark:text-green-300">
                            3/3
                          </Badge>
                        </div>
                        <div className="flex justify-between items-center p-2.5 rounded-lg bg-slate-50/90 dark:bg-slate-900/50 border border-slate-200/70 dark:border-slate-800/50 shadow-sm">
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded-full border-2 border-slate-400 dark:border-slate-600" />
                            <span className="text-sm text-slate-700 dark:text-slate-300">Solve 1 hard problem</span>
                          </div>
                          <Badge variant="outline" className="border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300">
                            0/1
                          </Badge>
                        </div>
                        <div className="flex justify-between items-center p-2.5 rounded-lg bg-gradient-to-r from-blue-50 to-blue-100/70 dark:from-blue-950/20 dark:to-blue-900/30 border border-blue-200/70 dark:border-blue-900/30 shadow-sm">
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded-full border-2 border-blue-500 dark:border-blue-600" />
                            <span className="text-sm text-blue-800 dark:text-blue-300">Complete 7 day streak</span>
                          </div>
                          <Badge variant="outline" className="bg-blue-100/50 dark:bg-blue-900/50 border-blue-300/50 dark:border-blue-700/50 text-blue-800 dark:text-blue-300">
                            5/7
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
