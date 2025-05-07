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
      {/* Main content area */}
      <div className="flex flex-1 flex-col overflow-hidden transition-all duration-300">
        <TopBar onMenuClick={() => {}} />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="space-y-8">
            {/* Hero section */}
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/40 dark:to-purple-950/40 rounded-lg border border-indigo-100 dark:border-indigo-800/30 shadow-sm">
              <div className="relative overflow-hidden">
                {/* Background pattern */}
                <div className="absolute inset-0 opacity-5">
                  <svg className="w-full h-full" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                    <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                      <path d="M 10 0 L 0 0 0 10" fill="none" stroke="currentColor" strokeWidth="0.5" />
                    </pattern>
                    <rect width="100%" height="100%" fill="url(#grid)" />
                  </svg>
                </div>

                <div className="relative p-6">
                  <div className="flex flex-col md:flex-row justify-between items-center">
                    <div className="space-y-3 mb-4 md:mb-0">
                      <div className="flex items-center gap-3">
                        <div className="bg-indigo-600 dark:bg-indigo-500 p-2 rounded-lg shadow-md">
                          <Code className="w-6 h-6 text-white" />
                </div>
                        <h1 className="text-3xl font-bold text-indigo-900 dark:text-indigo-100">NexPractice</h1>
                </div>
                      <p className="text-indigo-700 dark:text-indigo-300">
                        Master coding through practice. Solve problems, track progress, improve skills.
                      </p>
                      <div className="flex gap-3 mt-4">
                        <Button className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2 shadow-sm">
                          <Zap className="w-4 h-4" /> Daily Challenge
                        </Button>
                        <Button
                          variant="outline"
                          className="border-indigo-300 dark:border-indigo-700 gap-2 shadow-sm"
                          onClick={getRandomProblem}
                        >
                          <Shuffle className="w-4 h-4" /> Random Problem
                        </Button>
              </div>
              </div>

                    <div className="flex items-center gap-6 bg-white/80 dark:bg-indigo-950/30 p-4 rounded-lg shadow-sm border border-indigo-100 dark:border-indigo-800/30">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-indigo-700 dark:text-indigo-300">
                          {performanceStats.totalSolved}
                </div>
                        <div className="text-xs text-indigo-600 dark:text-indigo-400">Problems Solved</div>
                </div>
                      <Separator orientation="vertical" className="h-12 bg-indigo-200 dark:bg-indigo-700/50" />
                      <div className="text-center">
                        <div className="text-3xl font-bold text-indigo-700 dark:text-indigo-300">
                          {performanceStats.streak}
              </div>
                        <div className="text-xs text-indigo-600 dark:text-indigo-400">Day Streak</div>
                </div>
                      <Separator orientation="vertical" className="h-12 bg-indigo-200 dark:bg-indigo-700/50" />
                      <div className="text-center">
                        <div className="text-3xl font-bold text-indigo-700 dark:text-indigo-300">
                          {performanceStats.ranking}
              </div>
                        <div className="text-xs text-indigo-600 dark:text-indigo-400">Ranking</div>
                </div>
                </div>
              </div>
              </div>
              </div>
        </div>

            {/* Main content layout */}
            <div className="flex flex-col md:flex-row gap-6">
              {/* Left column - problem list and filters */}
              <div className="flex-1 space-y-6 md:max-w-[calc(100%-350px-1.5rem)]">
                {/* Search and filter section */}
                <Card className="border-none shadow-md">
                  <CardHeader className="pb-3 bg-muted/30 rounded-t-lg">
                    <CardTitle className="text-xl flex items-center gap-2">
                      <Filter className="w-5 h-5" /> Problem Filters
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 p-6">
                    <div className="flex flex-col sm:flex-row gap-4">
                      <div className="relative flex-1">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          type="search"
                          placeholder="Search problems..."
                          className="pl-8 border-muted-foreground/20"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                        />
                  </div>
                      <div className="flex gap-2">
                  <Button 
                          variant={difficulty === "All" ? "default" : "outline"}
                          onClick={() => setDifficulty("All")}
                          className="flex-1 sm:flex-none"
                        >
                          All
                  </Button>
                      <Button 
                          variant={difficulty === "Easy" ? "default" : "outline"}
                          onClick={() => setDifficulty("Easy")}
                          className={`flex-1 sm:flex-none ${
                            difficulty === "Easy" ? "bg-green-600 hover:bg-green-700" : "text-green-600"
                          }`}
                        >
                          Easy
                      </Button>
                      <Button
                          variant={difficulty === "Medium" ? "default" : "outline"}
                          onClick={() => setDifficulty("Medium")}
                          className={`flex-1 sm:flex-none ${
                            difficulty === "Medium" ? "bg-yellow-600 hover:bg-yellow-700" : "text-yellow-600"
                          }`}
                        >
                          Medium
                      </Button>
                        <Button 
                          variant={difficulty === "Hard" ? "default" : "outline"}
                          onClick={() => setDifficulty("Hard")}
                          className={`flex-1 sm:flex-none ${
                            difficulty === "Hard" ? "bg-red-600 hover:bg-red-700" : "text-red-600"
                          }`}
                        >
                          Hard
                        </Button>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium mb-2 flex items-center gap-1">
                        <Tag className="w-4 h-4" /> Tags
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {tagsLoading ? (
                          <TagLoader />
                        ) : tagsError ? (
                          <div className="text-red-500">{tagsError}</div>
                        ) : (
                          <>
                            {(showAllTags ? allTags : allTags.slice(0, 30)).map((tag) => (
                            <Badge
                              key={tag.id}
                                variant={selectedTags.includes(tag.name) ? "default" : "outline"}
                                className={`cursor-pointer hover:bg-muted transition-colors flex items-center gap-1 ${
                                  selectedTags.includes(tag.name) ? "bg-primary hover:bg-primary/90" : ""
                                }`}
                                onClick={() => toggleTag(tag.name)}
                              >
                                {tag.name}
                                <span className="ml-1 px-1.5 py-0.5 rounded-full bg-indigo-200 dark:bg-indigo-800 text-xs font-semibold text-indigo-700 dark:text-indigo-200">
                                  {tag._count?.codingQuestions ?? 0}
                              </span>
                            </Badge>
                            ))}
                            {allTags.length > 30 && (
                              <button
                                className="ml-2 px-3 py-1.5 flex items-center gap-1 text-xs rounded-full bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900/40 dark:to-purple-900/40 border border-indigo-200 dark:border-indigo-700 shadow hover:scale-105 transition-all font-medium text-indigo-700 dark:text-indigo-200"
                                onClick={() => setShowAllTags((prev) => !prev)}
                              >
                                {showAllTags ? (
                                  <>
                                    Show less <ChevronUp className="w-4 h-4" />
                                  </>
                                ) : (
                                  <>
                                    Show more <span className="font-semibold">({allTags.length - 30})</span> <ChevronDown className="w-4 h-4" />
                                  </>
                                )}
                              </button>
                    )}
                  </>
                )}
                      </div>
                    </div>
              </CardContent>
            </Card>

                {/* Problem list */}
                <Card className="border-none shadow-md">
                  <CardHeader className="pb-0 pt-6 px-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <CardTitle className="text-xl font-semibold flex items-center gap-2">
                        <BookOpen className="w-5 h-5" /> Coding Problems
                      </CardTitle>
                      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full sm:w-auto">
                        <TabsList className="grid grid-cols-4 w-full sm:w-auto">
                          <TabsTrigger value="all" className="text-xs sm:text-sm">
                            All
                          </TabsTrigger>
                          <TabsTrigger value="completed" className="text-xs sm:text-sm">
                            Completed
                          </TabsTrigger>
                          <TabsTrigger value="inProgress" className="text-xs sm:text-sm">
                            In Progress
                          </TabsTrigger>
                          <TabsTrigger value="notStarted" className="text-xs sm:text-sm">
                            Not Started
                          </TabsTrigger>
                        </TabsList>
                      </Tabs>
                </div>
                  </CardHeader>
                  
                  <CardContent className="p-6">
                    <div className="rounded-md border border-muted-foreground/10 overflow-hidden bg-card" ref={tableRef}>
                      <Table>
                        <TableHeader className="bg-muted/50">
                          <TableRow className="hover:bg-muted/50 border-b border-muted-foreground/20">
                            <TableHead className="w-[40%]">
                              <div className="flex items-center gap-1 cursor-pointer hover:text-primary transition-colors">
                                Problem <ArrowUpDown className="w-3 h-3" />
                              </div>
                            </TableHead>
                            <TableHead>
                              <div className="flex items-center gap-1 cursor-pointer hover:text-primary transition-colors">
                                Difficulty <ArrowUpDown className="w-3 h-3" />
                              </div>
                            </TableHead>
                            <TableHead className="hidden md:table-cell">Tags</TableHead>
                            <TableHead className="hidden sm:table-cell text-center">Solved By</TableHead>
                            <TableHead className="w-[100px] text-center">Accuracy %</TableHead>
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
                                    className={`hover:bg-muted/30 transition-colors ${
                                      index % 2 === 0 ? "bg-muted/10" : ""
                                    } border-b border-muted-foreground/10`}
                                  >
                                    <TableCell className="font-medium">
                                      <div>
                                        <div className="flex items-center gap-2">
                                          <span className="text-primary font-semibold">{problemNumber}.</span>
                                          {problem.questionId ? (
                                            <Link
                                              href={`/nexpractice/problem/${problem.questionId}`}
                                              className="font-medium text-indigo-700 dark:text-indigo-300 hover:underline"
                                            >
                                              {problem.question?.name || problem.name}
                                            </Link>
                                          ) : (
                                            <span className="text-red-500 flex items-center gap-1" title="Missing questionId">
                                              ⚠️ {problem.question?.name || problem.name}
                                            </span>
                                          )}
                                        </div>
                                        <div className="text-xs text-muted-foreground md:hidden mt-1">
                                          {(problem.questionText || problem.description || '').substring(0, 60)}...
                                        </div>
                                      </div>
                                    </TableCell>
                                    <TableCell>
                                      <Badge
                                        className={
                                          problem.difficulty === "Easy" || problem.difficulty === "EASY"
                                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                                            : problem.difficulty === "Medium" || problem.difficulty === "MEDIUM"
                                              ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
                                              : problem.difficulty === "Hard" || problem.difficulty === "HARD"
                                                ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                                                : ""
                                        }
                                      >
                                        {formatDifficulty(problem.difficulty)}
                                      </Badge>
                                    </TableCell>
                                    <TableCell className="hidden md:table-cell">
                                      <div className="flex flex-wrap gap-1">
                                        {problem.tags?.slice(0, 2).map((tag: any, idx: number) => (
                                          <Badge 
                                            key={tag.id || idx}
                                            variant="outline"
                                            className="flex items-center gap-1 bg-muted/30 hover:bg-muted transition-colors"
                                          >
                                            <Tag className="w-3 h-3" />
                                            {tag.name}
                                          </Badge>
                                        ))}
                                        {problem.tags && problem.tags.length > 2 && (
                                          <Badge 
                                            variant="outline"
                                            className="flex items-center gap-1 bg-muted/30 hover:bg-muted transition-colors"
                                          >
                                            +{problem.tags.length - 2}
                                          </Badge>
                                        )}
                                      </div>
                                    </TableCell>
                                    <TableCell className="hidden sm:table-cell text-center">
                                      {problem.solvedByCount ?? 0}
                                    </TableCell>
                                    <TableCell className="text-center">
                                      {problem.accuracy != null ? `${problem.accuracy}%` : "—"}
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
                                    <div className="py-2 text-sm text-muted-foreground">
                                      Scroll for more problems
                                    </div>
                                  ) : (
                                    <div className="py-2 text-sm text-muted-foreground">
                                      No more problems to load
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
                  </CardContent>
                </Card>
                  </div>
                  
              {/* Right column - stats and daily challenge */}
              <div className="w-full md:w-[350px] flex-shrink-0 space-y-6">
                {/* Daily Challenge Card */}
                <Card className="border-2 border-yellow-500/50 dark:border-yellow-500/20 shadow-md">
                  <CardHeader className="bg-yellow-50 dark:bg-yellow-950/20 rounded-t-lg pb-3">
                    <CardTitle className="text-lg font-semibold flex items-center gap-2">
                      <Zap className="w-5 h-5 text-yellow-500" /> Daily Challenge
                    </CardTitle>
                    <CardDescription>
                      Expires in{" "}
                      <span className="font-medium text-yellow-600 dark:text-yellow-400">{dailyChallenge.expiresIn}</span>
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <h3 className="font-semibold text-lg mb-2">{dailyChallenge.title}</h3>
                    <p className="text-sm text-muted-foreground mb-3">{dailyChallenge.description}</p>

                    <div className="flex gap-2 mb-4">
                      {(() => {
                        const badgeClass =
                          dailyChallenge.difficulty === "Easy"
                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                            : dailyChallenge.difficulty === "Medium"
                              ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
                              : dailyChallenge.difficulty === "Hard"
                                ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                                : "";
                        return (
                          <Badge className={badgeClass}>
                            {formatDifficulty(dailyChallenge.difficulty)}
                          </Badge>
                        );
                      })()}
                      {dailyChallenge.tags.map((tag, index) => (
                        <Badge key={index} variant="outline">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  
                    <Button className="w-full">Solve Today's Challenge</Button>
                  </CardContent>
                </Card>

                {/* Performance Stats Card */}
                <Card className="border-none shadow-md">
                  <CardHeader className="pb-3 bg-muted/30 rounded-t-lg">
                    <CardTitle className="text-lg font-semibold flex items-center gap-2">
                      <BarChart3 className="w-5 h-5" /> Your Performance
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 p-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-green-50 dark:bg-green-950/20 p-3 rounded-lg text-center border border-green-200 dark:border-green-900">
                        <div className="text-2xl font-bold text-green-700 dark:text-green-400">
                          {performanceStats.easyCompleted}
                    </div>
                        <div className="text-xs text-green-600 dark:text-green-500">Easy</div>
                    </div>
                      <div className="bg-yellow-50 dark:bg-yellow-950/20 p-3 rounded-lg text-center border border-yellow-200 dark:border-yellow-900">
                        <div className="text-2xl font-bold text-yellow-700 dark:text-yellow-400">
                          {performanceStats.mediumCompleted}
                    </div>
                        <div className="text-xs text-yellow-600 dark:text-yellow-500">Medium</div>
                      </div>
                      <div className="bg-red-50 dark:bg-red-950/20 p-3 rounded-lg text-center border border-red-200 dark:border-red-900">
                        <div className="text-2xl font-bold text-red-700 dark:text-red-400">
                          {performanceStats.hardCompleted}
                    </div>
                        <div className="text-xs text-red-600 dark:text-red-500">Hard</div>
                  </div>
                      <div className="bg-blue-50 dark:bg-blue-950/20 p-3 rounded-lg text-center border border-blue-200 dark:border-blue-900">
                        <div className="text-2xl font-bold text-blue-700 dark:text-blue-400">
                          {performanceStats.averageTime}
                  </div>
                        <div className="text-xs text-blue-600 dark:text-blue-500">Avg. Time</div>
                      </div>
            </div>

                    <div className="pt-2">
                      <h3 className="text-sm font-medium mb-3 flex items-center gap-1">
                        <Trophy className="w-4 h-4 text-amber-500" /> Ranking
                      </h3>
                      <div className="bg-gradient-to-r from-amber-50 to-amber-100 dark:from-amber-950/20 dark:to-amber-900/20 p-3 rounded-lg flex justify-between items-center border border-amber-200 dark:border-amber-900/30">
                        <div>
                          <div className="text-sm font-medium">#{performanceStats.ranking}</div>
                          <div className="text-xs text-muted-foreground">of {performanceStats.totalStudents} students</div>
                </div>
                        <div className="h-10 w-10 rounded-full bg-amber-200 dark:bg-amber-900/50 flex items-center justify-center">
                          <Trophy className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                        </div>
                      </div>
                    </div>

                    <div className="pt-2">
                      <h3 className="text-sm font-medium mb-3 flex items-center gap-1">
                        <Clock className="w-4 h-4 text-blue-500" /> Recent Submissions
                      </h3>
                      <div className="space-y-2">
                        {performanceStats.recentSubmissions.map((submission, index) => (
                          <div
                            key={index}
                            className={`flex items-center justify-between text-sm p-2 rounded-lg ${
                              submission.result === "Accepted"
                                ? "bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900"
                                : "bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900"
                            }`}
                          >
                            <div>
                              <div className="font-medium">{submission.problem}</div>
                              <div className="text-xs text-muted-foreground">{submission.time}</div>
                  </div>
                            <Badge
                              className={
                                submission.result === "Accepted"
                                  ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                                  : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                              }
                            >
                              {submission.result}
                            </Badge>
                </div>
                        ))}
              </div>
          </div>
                  </CardContent>
                </Card>

                {/* Weekly Goals Card */}
                <Card className="border-none shadow-md">
                  <CardHeader className="pb-3 bg-muted/30 rounded-t-lg">
                    <CardTitle className="text-lg font-semibold flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5" /> Weekly Goals
                </CardTitle>
              </CardHeader>
                  <CardContent className="p-6">
                <div className="space-y-3">
                      <div className="flex justify-between items-center p-2 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-green-500" />
                          <span>Solve 5 easy problems</span>
                      </div>
                        <Badge variant="outline" className="bg-green-100 dark:bg-green-900/50">
                          5/5
                      </Badge>
                    </div>
                      <div className="flex justify-between items-center p-2 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-green-500" />
                          <span>Solve 3 medium problems</span>
                </div>
                        <Badge variant="outline" className="bg-green-100 dark:bg-green-900/50">
                          3/3
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center p-2 rounded-lg bg-muted/20 border border-muted">
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 rounded-full border-2 border-muted-foreground" />
                          <span>Solve 1 hard problem</span>
                        </div>
                        <Badge variant="outline">0/1</Badge>
                      </div>
                      <div className="flex justify-between items-center p-2 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900">
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 rounded-full border-2 border-blue-500" />
                          <span>Complete 7 day streak</span>
                        </div>
                        <Badge variant="outline" className="bg-blue-100 dark:bg-blue-900/50">
                          5/7
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Upcoming Contests */}
                <Card className="border-none shadow-md">
                  <CardHeader className="pb-3 bg-muted/30 rounded-t-lg">
                    <CardTitle className="text-lg font-semibold flex items-center gap-2">
                      <Calendar className="w-5 h-5" /> Upcoming Contests
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-3">
                      <div className="p-3 rounded-lg border bg-purple-50 dark:bg-purple-950/20 border-purple-200 dark:border-purple-900">
                        <div className="font-medium text-purple-800 dark:text-purple-300">Weekly Contest #342</div>
                        <div className="text-sm text-purple-600 dark:text-purple-400 mb-2">Saturday, 8:00 PM</div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full border-purple-300 dark:border-purple-800 hover:bg-purple-100 dark:hover:bg-purple-900/50"
                        >
                          Register
                </Button>
                      </div>
                      <div className="p-3 rounded-lg border bg-indigo-50 dark:bg-indigo-950/20 border-indigo-200 dark:border-indigo-900">
                        <div className="font-medium text-indigo-800 dark:text-indigo-300">Biweekly Contest #123</div>
                        <div className="text-sm text-indigo-600 dark:text-indigo-400 mb-2">Sunday, 10:30 AM</div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full border-indigo-300 dark:border-indigo-800 hover:bg-indigo-100 dark:hover:bg-indigo-900/50"
                        >
                          Register
                        </Button>
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
