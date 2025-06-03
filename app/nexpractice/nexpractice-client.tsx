"use client"

import type React from "react"

import { useState, useEffect, useRef, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { useQuery, useLazyQuery, gql } from "@apollo/client"
import {
  Filter,
  Search,
  Tag,
  Zap,
  Trophy,
  Clock,
  Shuffle,
  BookOpen,
  CheckCircle2,
  ArrowUpDown,
  ChevronDown,
  ChevronUp,
  StarHalf,
  Info,
  CheckCircle,
  XCircle,
  BookOpenCheck,
  RotateCw,
  BrainCircuit,
  Sparkles,
  Flame,
  Award,
  TrendingUp,
  Lightbulb,
  Layers,
  Compass,
  Calendar,
  Users,
  Gem,
  Crown,
  Target,
  Hexagon,
  Cpu,
  Gauge,
  Rocket,
  Infinity,
  Briefcase,
  PieChart,
  BarChart,
  ClipboardList,
} from "lucide-react"

import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { useMobile } from "@/hooks/use-mobile"

// Import the types for the problem stats to be received from the server component
type ProblemStatsProps = {
  totalSolved: number;
  streak: number;
  averageTimeMinutes: number;
};

// Define GraphQL queries - Split into smaller, focused queries
const GET_ALL_TAGS = gql`
  query GetAllTags {
    tags {
      id
      name
      _count {
        codingQuestions
      }
    }
  }
`;

// Separate query for problem counts
const GET_PROBLEM_COUNTS = gql`
  query GetProblemCounts {
    questionStats(
      type: CODING
      status: READY
    ) {
      total
      codingCount
    }
    userProblemCounts {
      total
      completed
      inProgress
      notStarted
    }
  }
`;

// Main query for coding problems - optimized to only fetch what's needed
const GET_CODING_PROBLEMS = gql`
  query GetCodingProblems($page: Int, $limit: Int, $search: String, $tagIds: [ID!], $difficulty: QuestionDifficulty, $userStatus: UserProblemStatus) {
    codingQuestions(
      page: $page
      limit: $limit
      search: $search
      tagIds: $tagIds
      difficulty: $difficulty
      userStatus: $userStatus
    ) {
      codingQuestions {
        id
        questionId
        questionText
        difficulty
        createdAt
        tags {
          id
          name
        }
        question {
          id
          name
          status
        }
        userSubmissionStatus {
          hasAccepted
          attemptCount
          lastSubmittedAt
        }
        solvedByCount
        totalSubmissions
        acceptedSubmissions
        accuracy
        averageTimeSpentMs
      }
      totalCount
    }
  }
`;

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
      solvedByCount: 12453,
      accuracy: 92,
      premium: false,
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
      solvedByCount: 10982,
      accuracy: 88,
      premium: false,
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
      solvedByCount: 9876,
      accuracy: 75,
      premium: false,
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
      solvedByCount: 8765,
      accuracy: 68,
      premium: true,
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
      solvedByCount: 7654,
      accuracy: 52,
      premium: false,
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
      solvedByCount: 6543,
      accuracy: 45,
      premium: true,
    },
    {
      id: 7,
      title: "Binary Tree Level Order Traversal",
      difficulty: "Medium",
      tags: ["Tree", "BFS", "Binary Tree"],
      completion: 62,
      description: "Given the root of a binary tree, return the level order traversal of its nodes' values.",
      status: "Completed",
      lastAttempt: "4 days ago",
      attempts: 1,
      timeSpent: "18 min",
      solvedByCount: 9123,
      accuracy: 82,
      premium: false,
    },
    {
      id: 8,
      title: "Merge Intervals",
      difficulty: "Medium",
      tags: ["Array", "Sorting"],
      completion: 51,
      description: "Given an array of intervals where intervals[i] = [starti, endi], merge all overlapping intervals.",
      status: "In Progress",
      lastAttempt: "2 days ago",
      attempts: 2,
      timeSpent: "30 min",
      solvedByCount: 8432,
      accuracy: 71,
      premium: true,
    },
    {
      id: 9,
      title: "Word Break",
      difficulty: "Medium",
      tags: ["Hash Table", "String", "Dynamic Programming", "Trie"],
      completion: 42,
      description:
        "Given a string s and a dictionary of strings wordDict, determine if s can be segmented into a space-separated sequence of one or more dictionary words.",
      status: "Not Started",
      lastAttempt: "-",
      attempts: 0,
      timeSpent: "-",
      solvedByCount: 7321,
      accuracy: 63,
      premium: false,
    },
    {
      id: 10,
      title: "Median of Two Sorted Arrays",
      difficulty: "Hard",
      tags: ["Array", "Binary Search", "Divide and Conquer"],
      completion: 18,
      description:
        "Given two sorted arrays nums1 and nums2 of size m and n respectively, return the median of the two sorted arrays.",
      status: "Failed",
      lastAttempt: "1 week ago",
      attempts: 3,
      timeSpent: "55 min",
      solvedByCount: 5432,
      accuracy: 38,
      premium: true,
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
    skillLevel: 78,
    contestRank: 1254,
    contestPercentile: 92,
    badges: [
      { name: "Problem Solver", level: 3, icon: "Trophy" },
      { name: "Streak Master", level: 2, icon: "Flame" },
      { name: "Algorithm Ace", level: 4, icon: "Cpu" },
    ],
    strengths: ["Dynamic Programming", "Tree Traversal", "Hash Tables"],
    weaknesses: ["Graph Algorithms", "Bit Manipulation"],
  }
  
  // Daily challenge data
  const dailyChallenge = {
    id: 7,
    title: "Longest Palindromic Substring",
    difficulty: "Medium",
    tags: ["String", "Dynamic Programming"],
    description: "Given a string s, return the longest palindromic substring in s.",
    expiresIn: "14:32:18",
    reward: 50,
    participants: 1243,
    premium: false,
  }
  
  // Smart recommendations data
  const recommendations = [
    {
      id: "rec1",
      title: "Longest Common Subsequence",
      difficulty: "Medium",
      tags: ["Dynamic Programming", "String"],
      reason: "Based on your recent difficulty with string manipulation problems",
      confidence: 87,
      premium: false,
      company: "Amazon",
    },
    {
      id: "rec2",
      title: "Binary Tree Level Order Traversal",
      difficulty: "Medium",
      tags: ["Tree", "BFS"],
      reason: "To strengthen your breadth-first search skills",
      confidence: 92,
      premium: true,
      company: "Google",
    },
    {
      id: "rec3",
      title: "Meeting Rooms II",
      difficulty: "Medium",
      tags: ["Sorting", "Greedy"],
      reason: "This will help improve your problem-solving with intervals",
      confidence: 78,
      premium: false,
      company: "Microsoft",
    },
  ]
  
  // Learning paths data
  const learningPaths = [
    {
      id: "path1",
      title: "Dynamic Programming Mastery",
      progress: 65,
      totalProblems: 24,
      completedProblems: 16,
      level: "Intermediate",
      estimatedCompletion: "2 weeks",
    },
    {
      id: "path2",
      title: "Graph Algorithms",
      progress: 32,
      totalProblems: 18,
      completedProblems: 6,
      level: "Advanced",
      estimatedCompletion: "4 weeks",
    },
    {
      id: "path3",
      title: "System Design Fundamentals",
      progress: 78,
      totalProblems: 12,
      completedProblems: 9,
      level: "Intermediate",
      estimatedCompletion: "1 week",
    },
  ]
  
  // Upcoming contests
  const upcomingContests = [
    {
      id: "contest1",
      title: "Weekly Contest 342",
      date: "May 18, 2025",
      time: "9:30 AM",
      duration: "1.5 hours",
      difficulty: "Medium",
      participants: 3500,
    },
    {
      id: "contest2",
      title: "Biweekly Contest 128",
      date: "May 25, 2025",
      time: "8:00 PM",
      duration: "2 hours",
      difficulty: "Medium-Hard",
      participants: 2800,
    },
  ]
  
  // Modern spinner loader component
  function TagLoader() {
    return (
      <div className="w-full">
        <div className="flex flex-wrap gap-1.5">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div
              key={i}
              className="h-6 rounded-full bg-slate-200/70 dark:bg-slate-800/50 animate-pulse"
              style={{ width: `${Math.floor(Math.random() * 60) + 60}px` }}
            />
          ))}
        </div>
      </div>
    )
  }
  
  // Modern spinner loader for problems
  function ProblemLoader() {
    return (
      <div className="w-full space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-center w-full animate-pulse">
            <div className="h-8 w-8 rounded-full bg-slate-200/70 dark:bg-slate-800/50 mr-3" />
            <div className="flex-1">
              <div
                className="h-5 bg-slate-200/70 dark:bg-slate-800/50 rounded-md mb-2"
                style={{ width: `${Math.floor(Math.random() * 40) + 50}%` }}
              />
              <div className="flex gap-2">
                <div
                  className="h-4 bg-slate-200/70 dark:bg-slate-800/50 rounded-full"
                  style={{ width: `${Math.floor(Math.random() * 40) + 30}px` }}
                />
                <div
                  className="h-4 bg-slate-200/70 dark:bg-slate-800/50 rounded-full"
                  style={{ width: `${Math.floor(Math.random() * 40) + 30}px` }}
                />
              </div>
            </div>
            <div className="flex gap-2 items-center">
              <div className="h-5 w-16 bg-slate-200/70 dark:bg-slate-800/50 rounded-md" />
              <div className="h-5 w-12 bg-slate-200/70 dark:bg-slate-800/50 rounded-md" />
            </div>
          </div>
        ))}
      </div>
    )
  }
  
  // Progress Path Animation Component
  function ProgressPathAnimation() {
    const [progress, setProgress] = useState(0)
    const pathRef = useRef<SVGPathElement>(null)
    const [pathLength, setPathLength] = useState(0)
  
    useEffect(() => {
      if (pathRef.current) {
        const length = pathRef.current.getTotalLength()
        setPathLength(length)
      }
  
      // Animate progress from 0 to current percentage over time
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev < 65) return prev + 1
          return prev
        })
      }, 30)
  
      return () => clearInterval(interval)
    }, [])
  
    return (
      <div className="relative w-full h-20 mb-3">
        <svg className="w-full h-full" viewBox="0 0 1000 100" preserveAspectRatio="none">
          {/* Decorative elements */}
          <defs>
            <linearGradient id="pathGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#3b82f6" />
              <stop offset="50%" stopColor="#2563eb" />
              <stop offset="100%" stopColor="#1d4ed8" />
            </linearGradient>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>
  
          {/* Background path */}
          <path
            d="M0,50 Q250,80 500,50 T1000,50"
            fill="none"
            stroke="#e2e8f0"
            strokeWidth="6"
            strokeLinecap="round"
            className="dark:stroke-slate-700"
          />
  
          {/* Animated progress path */}
          <path
            ref={pathRef}
            d="M0,50 Q250,80 500,50 T1000,50"
            fill="none"
            stroke="url(#pathGradient)"
            strokeWidth="6"
            strokeLinecap="round"
            filter="url(#glow)"
            strokeDasharray={pathLength}
            strokeDashoffset={pathLength - (pathLength * progress) / 100}
            className="transition-all duration-300 ease-out"
          />
  
          {/* Milestone points */}
          {[10, 25, 40, 55, 70, 85].map((milestone, index) => {
            // Calculate position along the curve
            const x = milestone * 10
            // Simple approximation for y position on the curve
            const y = 50 + (index % 2 === 0 ? -5 : 5)
  
            return (
              <g key={index} className="transition-all duration-300 ease-out">
                <circle
                  cx={x}
                  cy={y}
                  r={progress >= milestone ? 8 : 6}
                  className={`${progress >= milestone
                    ? "fill-blue-600 stroke-blue-400 stroke-2 dark:fill-blue-500 dark:stroke-blue-300"
                    : "fill-slate-300 stroke-slate-200 dark:fill-slate-700 dark:stroke-slate-600"
                    } transition-all duration-300`}
                />
                <text
                  x={x}
                  y={y}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className={`text-[10px] font-medium ${progress >= milestone ? "fill-white" : "fill-slate-500 dark:fill-slate-400"
                    } transition-all duration-300`}
                >
                  {index + 1}
                </text>
              </g>
            )
          })}
  
          {/* Moving element along path */}
          <g transform={`translate(${progress * 10}, ${50 + Math.sin(progress / 10) * 5})`}>
            <circle r="12" className="fill-blue-100 dark:fill-blue-900 opacity-50 animate-pulse" />
            <circle r="8" className="fill-blue-500 dark:fill-blue-400" />
            <circle r="4" className="fill-white dark:fill-blue-200" />
          </g>
        </svg>
  
        {/* Level indicators */}
        <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 px-2 mt-1">
          <span>Beginner</span>
          <span>Intermediate</span>
          <span>Advanced</span>
          <span>Expert</span>
        </div>
      </div>
    )
  }
  
  // Skill Radar Chart Component
  function SkillRadarChart() {
    const skills = [
      { name: "Arrays", value: 85 },
      { name: "Strings", value: 70 },
      { name: "DP", value: 60 },
      { name: "Trees", value: 75 },
      { name: "Graphs", value: 45 },
      { name: "Math", value: 65 },
    ]
  
    // Calculate positions on a hexagon
    const calculatePoint = (index: number, total: number, radius: number) => {
      const angle = (Math.PI * 2 * index) / total - Math.PI / 2
      return {
        x: radius * Math.cos(angle) + 100,
        y: radius * Math.sin(angle) + 100,
      }
    }
  
    // Generate points for the radar chart
    const generatePoints = (values: number[], radius: number) => {
      return values
        .map((value, i) => {
          const point = calculatePoint(i, values.length, (radius * value) / 100)
          return `${point.x},${point.y}`
        })
        .join(" ")
    }
  
    return (
      <div className="relative w-full h-[200px] flex items-center justify-center">
        <svg viewBox="0 0 200 200" className="w-full h-full">
          <defs>
            <linearGradient id="skillGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#1d4ed8" stopOpacity="0.8" />
            </linearGradient>
            <filter id="skillGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>
  
          {/* Background grid */}
          {[20, 40, 60, 80, 100].map((level) => (
            <polygon
              key={level}
              points={generatePoints(Array(skills.length).fill(level), 80)}
              fill="none"
              stroke={level === 100 ? "#cbd5e1" : "#e2e8f0"}
              strokeWidth={level === 100 ? "1" : "0.5"}
              className="dark:stroke-slate-700"
            />
          ))}
  
          {/* Skill area */}
          <polygon
            points={generatePoints(
              skills.map((skill) => skill.value),
              80,
            )}
            fill="url(#skillGradient)"
            stroke="#3b82f6"
            strokeWidth="2"
            filter="url(#skillGlow)"
            className="dark:stroke-blue-400"
          />
  
          {/* Skill points */}
          {skills.map((skill, i) => {
            const point = calculatePoint(i, skills.length, (80 * skill.value) / 100)
            return (
              <circle
                key={i}
                cx={point.x}
                cy={point.y}
                r="3"
                className="fill-white stroke-blue-500 stroke-2 dark:fill-blue-900"
              />
            )
          })}
  
          {/* Skill labels */}
          {skills.map((skill, i) => {
            const point = calculatePoint(i, skills.length, 95)
            return (
              <text
                key={i}
                x={point.x}
                y={point.y}
                textAnchor="middle"
                dominantBaseline="middle"
                className="text-[8px] font-medium fill-slate-700 dark:fill-slate-300"
              >
                {skill.name}
              </text>
            )
          })}
        </svg>
      </div>
    )
  }
  
  // StatCard component for the unique stats display
  interface StatCardProps {
    label: string
    value: string | number
    bgColor: string
    textColor: string
    borderColor: string
    icon: React.ReactNode
    trend?: number
  }
  
  const StatCard = ({ label, value, bgColor, textColor, borderColor, icon, trend }: StatCardProps) => (
    <div
      className={`p-3 rounded-lg bg-gradient-to-br ${bgColor} border ${borderColor} shadow-sm transform transition-all duration-300 hover:scale-105 hover:shadow-md relative overflow-hidden group`}
    >
      {/* Decorative background pattern */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <pattern id="smallGrid" width="8" height="8" patternUnits="userSpaceOnUse">
            <path d="M 8 0 L 0 0 0 8" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.5" />
          </pattern>
          <rect width="100%" height="100%" fill="url(#smallGrid)" />
        </svg>
      </div>
  
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-medium text-slate-600 dark:text-slate-400">{label}</span>
        <div className="flex items-center gap-1">
          {icon}
          {trend !== undefined && (
            <span
              className={`text-[10px] font-medium flex items-center ${trend > 0
                ? "text-emerald-600 dark:text-emerald-400"
                : trend < 0
                  ? "text-red-600 dark:text-red-400"
                  : "text-slate-600 dark:text-slate-400"
                }`}
            >
              
            </span>
          )}
        </div>
      </div>
      <div className={`text-xl font-bold ${textColor} group-hover:scale-110 transition-transform duration-300`}>
        {value}
      </div>
  
      {/* Animated highlight on hover */}
      <div className="absolute -inset-0.5 bg-white opacity-0 group-hover:opacity-10 rounded-lg blur transition-all duration-300 dark:bg-blue-400"></div>
    </div>
  )
  
  function SmartRecommendations({ horizontal = false }: { horizontal?: boolean }) {
    const [loading, setLoading] = useState(true)
  
    useEffect(() => {
      // Simulate API call
      const timer = setTimeout(() => {
        setLoading(false)
      }, 1200)
  
      return () => clearTimeout(timer)
    }, [])
  
    // Different card layouts for recommendations
    const cardVariants = [
      "from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-blue-900/30 border-blue-200 dark:border-blue-800/50",
      "from-cyan-50 to-blue-100 dark:from-cyan-950/30 dark:to-blue-900/30 border-cyan-200 dark:border-cyan-800/50",
      "from-sky-50 to-blue-100 dark:from-sky-950/30 dark:to-blue-900/30 border-sky-200 dark:border-sky-800/50",
    ]
  
    return (
      <div>
        {loading ? (
          <div className="flex items-center justify-center space-x-2 py-8">
            <div className="relative h-10 w-10">
              <div className="absolute inset-0 rounded-full border-2 border-blue-200 dark:border-blue-800 opacity-75"></div>
              <div className="absolute inset-0 rounded-full border-t-2 border-blue-600 dark:border-blue-400 animate-spin"></div>
              <div className="absolute inset-[6px] rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                <BrainCircuit className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <span className="text-sm text-slate-600 dark:text-slate-400">Analyzing your coding patterns...</span>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="relative">
                  <div className="absolute -inset-1 rounded-full bg-blue-300/20 dark:bg-blue-700/20 animate-pulse"></div>
                  <BrainCircuit className="h-5 w-5 text-blue-600 dark:text-blue-400 relative" />
                </div>
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">AI-Powered Recommendations</span>
              </div>
              <Button variant="ghost" size="sm" className="text-xs">
                <RotateCw className="mr-1 h-3 w-3" />
                Refresh
              </Button>
            </div>
  
            <div className={`${horizontal ? "grid grid-cols-1 md:grid-cols-3 gap-4" : "grid gap-3"}`}>
              {recommendations.map((recommendation: {
                id: string;
                title: string;
                difficulty: string;
                tags: string[];
                reason: string;
                confidence: number;
                premium: boolean;
                company?: string;
              }, index: number) => (
                <motion.div
                  key={recommendation.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className={`rounded-lg p-4 border bg-gradient-to-br ${cardVariants[index % cardVariants.length]} relative overflow-hidden group h-full flex flex-col`}
                >
                  {/* Decorative elements */}
                  <div className="absolute top-0 right-0 h-20 w-20 bg-white/10 rounded-full -mt-10 -mr-10 transition-transform duration-300 group-hover:scale-110"></div>
                  <div className="absolute bottom-0 left-0 h-12 w-12 bg-black/5 rounded-full -mb-6 -ml-6 transition-transform duration-300 group-hover:scale-110"></div>
  
                  {/* Premium badge if applicable */}
                  {recommendation.premium && (
                    <div className="absolute top-2 right-2 flex items-center gap-1 bg-gradient-to-r from-amber-200 to-yellow-300 dark:from-amber-700 dark:to-yellow-600 px-2 py-0.5 rounded-full text-[10px] font-semibold text-amber-900 dark:text-amber-100 shadow-sm">
                      <Crown className="h-3 w-3" />
                      PREMIUM
                    </div>
                  )}
  
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium text-slate-800 dark:text-slate-200 group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors duration-300">
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
  
                  <div className="text-xs text-slate-600 dark:text-slate-400 mb-2">
                    {recommendation.tags.map((tag, i) => (
                      <span key={i} className="mr-2">
                        #{tag.toLowerCase().replace(/\s+/g, "")}
                      </span>
                    ))}
                  </div>
  
                  {/* Company tag */}
                  {recommendation.company && (
                    <div className="mb-3 inline-flex items-center gap-1 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-[10px] font-medium text-slate-700 dark:text-slate-300">
                      <Briefcase className="h-3 w-3" />
                      {recommendation.company}
                    </div>
                  )}
  
                  <div className="flex justify-between items-end mb-3 flex-grow">
                    <div className="text-xs italic text-slate-500 dark:text-slate-400 max-w-[70%]">
                      {recommendation.reason}
                    </div>
  
                    <div className="flex items-center gap-1 text-xs bg-white/50 dark:bg-slate-800/50 py-1 px-2 rounded-full">
                      <Sparkles className="h-3 w-3 text-amber-500" />
                      <span className="font-medium text-amber-700 dark:text-amber-400">
                        {recommendation.confidence}% match
                      </span>
                    </div>
                  </div>
  
                  <Button className="w-full mt-auto bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white gap-2 shadow-sm border-0 group-hover:shadow-md transition-all duration-300">
                    Try this problem
                  </Button>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }
  
  // Learning Path Card Component
  function LearningPathCard({ path }: { path: (typeof learningPaths)[0] }) {
    return (
      <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 group">
        <div className="p-4">
          <div className="flex justify-between items-start mb-3">
            <h3 className="font-medium text-slate-800 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
              {path.title}
            </h3>
            <Badge
              className={
                path.level === "Beginner"
                  ? "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300"
                  : path.level === "Intermediate"
                    ? "bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300"
                    : "bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300"
              }
            >
              {path.level}
            </Badge>
          </div>
  
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400">
              <span>Progress</span>
              <span className="font-medium">{path.progress}%</span>
            </div>
            <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 rounded-full transition-all duration-500 ease-out group-hover:from-blue-600 group-hover:to-blue-700"
                style={{ width: `${path.progress}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-600 dark:text-slate-400">
                {path.completedProblems} / {path.totalProblems} problems
              </span>
              <span className="text-blue-600 dark:text-blue-400 font-medium">{path.estimatedCompletion} left</span>
            </div>
          </div>
  
          <Button
            variant="ghost"
            size="sm"
            className="w-full mt-3 border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/50 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 transition-colors duration-300"
          >
            Continue Path
          </Button>
        </div>
      </div>
    )
  }
  
  // Contest Card Component
  function ContestCard({ contest }: { contest: (typeof upcomingContests)[0] }) {
    return (
      <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 group">
        <div className="p-4">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-medium text-slate-800 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
              {contest.title}
            </h3>
            <Badge
              className={
                contest.difficulty === "Easy"
                  ? "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300"
                  : contest.difficulty === "Medium"
                    ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300"
                    : contest.difficulty === "Medium-Hard"
                      ? "bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-300"
                      : "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300"
              }
            >
              {contest.difficulty}
            </Badge>
          </div>
  
          <div className="space-y-2 mb-3">
            <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
              <Calendar className="h-3 w-3" />
              <span>{contest.date}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
              <Clock className="h-3 w-3" />
              <span>
                {contest.time} • {contest.duration}
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
              <Users className="h-3 w-3" />
              <span>{contest.participants.toLocaleString()} participants</span>
            </div>
          </div>
  
          <Button className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white gap-2 shadow-sm border-0 group-hover:shadow-md transition-all duration-300">
            Register Now
          </Button>
        </div>
      </div>
    )
  }
  
  // Badge Component
  function AchievementBadge({ badge }: { badge: (typeof performanceStats.badges)[0] }) {
    const getBadgeColor = (level: number) => {
      switch (level) {
        case 1:
          return "from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-600 text-slate-700 dark:text-slate-300"
        case 2:
          return "from-blue-200 to-blue-300 dark:from-blue-700 dark:to-blue-600 text-blue-700 dark:text-blue-300"
        case 3:
          return "from-purple-200 to-purple-300 dark:from-purple-700 dark:to-purple-600 text-purple-700 dark:text-purple-300"
        case 4:
          return "from-amber-200 to-amber-300 dark:from-amber-700 dark:to-amber-600 text-amber-700 dark:text-amber-300"
        default:
          return "from-emerald-200 to-emerald-300 dark:from-emerald-700 dark:to-emerald-600 text-emerald-700 dark:text-emerald-300"
      }
    }
  
    const getIcon = (iconName: string) => {
      switch (iconName) {
        case "Trophy":
          return <Trophy className="h-5 w-5" />
        case "Flame":
          return <Flame className="h-5 w-5" />
        case "Cpu":
          return <Cpu className="h-5 w-5" />
        default:
          return <Award className="h-5 w-5" />
      }
    }
  
    return (
      <div className="flex flex-col items-center">
        <div
          className={`h-14 w-14 rounded-full bg-gradient-to-br ${getBadgeColor(
            badge.level,
          )} flex items-center justify-center shadow-sm relative group`}
        >
          {/* Level indicator */}
          <div className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 flex items-center justify-center text-[10px] font-bold text-slate-700 dark:text-slate-300">
            {badge.level}
          </div>
  
          {/* Badge icon */}
          {getIcon(badge.icon)}
  
          {/* Glow effect on hover */}
          <div className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-50 bg-white dark:bg-blue-400 blur-md transition-opacity duration-300"></div>
        </div>
        <span className="mt-2 text-xs font-medium text-slate-700 dark:text-slate-300">{badge.name}</span>
      </div>
    )
  }
// Main component
export default function NexPracticeClient({ totalSolved, streak, averageTimeMinutes }: ProblemStatsProps) {
    const [mounted, setMounted] = useState(false)
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [difficulty, setDifficulty] = useState("All")
  const [activeTab, setActiveTab] = useState("all")
  const [activeDashboardTab, setActiveDashboardTab] = useState("overview")
  const isMobile = useMobile()
  const [tagsLoading, setTagsLoading] = useState(true)
  const [showAllTags, setShowAllTags] = useState(false)
  const [loadingProblems, setLoadingProblems] = useState(true)
  const [expandedTags, setExpandedTags] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  // Add problem counts state here, with other state declarations
  const [problemCounts, setProblemCounts] = useState({
    total: 0,
    completed: 0,
    inProgress: 0,
    notStarted: 0
  })
  // Add pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const itemsPerPage = 10
  const router = useRouter()
  
  // Replace useQuery with useLazyQuery to control when the queries are executed
  const [fetchTags, { loading: tagsQueryLoading, error: tagsError, data: tagsData }] = 
    useLazyQuery(GET_ALL_TAGS, {
      fetchPolicy: "cache-first" // Use cache if available
    });
  
  // Add query for problem counts - only fetch once
  const [fetchProblemCounts, { loading: countsLoading, data: problemCountsData }] = 
    useLazyQuery(GET_PROBLEM_COUNTS, {
      fetchPolicy: "cache-first" // Use cache to avoid refetching
    });
  
  const [fetchProblems, { loading: problemsLoading, error: problemsError, data: problemsData }] = 
    useLazyQuery(GET_CODING_PROBLEMS, {
      fetchPolicy: "cache-and-network" // Always fetch from network but update cache
    });
    
  // Only fetch tags and counts when first switching to the Problems tab
  useEffect(() => {
    if (activeDashboardTab === "problems") {
      fetchTags();
      fetchProblemCounts();
    }
    // eslint-disable-next-line
  }, [activeDashboardTab]);
  
  // Only fetch problems when tab is selected or when filters/pagination change
  useEffect(() => {
    if (activeDashboardTab === "problems") {
      let userStatus: "COMPLETED" | "IN_PROGRESS" | "NOT_STARTED" | undefined = undefined;
      if (activeTab === "completed") userStatus = "COMPLETED";
      else if (activeTab === "inProgress") userStatus = "IN_PROGRESS";
      else if (activeTab === "notStarted") userStatus = "NOT_STARTED";
      
      // Debounce problem fetching slightly for better UX on filter changes
      const timeoutId = setTimeout(() => {
        fetchProblems({
          variables: {
            page: currentPage,
            limit: itemsPerPage,
            search: searchQuery || undefined,
            tagIds: selectedTags.length > 0 ? selectedTags : undefined,
            difficulty: difficulty !== "All" ? difficulty.toUpperCase() : undefined,
            userStatus
          }
        });
      }, 100);
      
      return () => clearTimeout(timeoutId);
    }
  }, [activeDashboardTab, fetchProblems, searchQuery, selectedTags, difficulty, currentPage, itemsPerPage, activeTab]);
  
  // Reset to page 1 when filters change
  useEffect(() => {
    if (currentPage !== 1) {
      setCurrentPage(1);
    }
  }, [searchQuery, selectedTags, difficulty, activeTab]);
  
  // Update the useEffect to set problem counts and total pages when data is received
  useEffect(() => {
    if (problemsData) {
      // Calculate total pages
      const totalItems = problemsData.codingQuestions.totalCount || 0;
      const calculatedPages = Math.ceil(totalItems / itemsPerPage);
      setTotalPages(calculatedPages > 0 ? calculatedPages : 1);
    }
    
    // Set the problem counts when the count data is received
    if (problemCountsData) {
      // Get total count from questionStats
      const totalProblems = problemCountsData.questionStats?.total || 0;
      
      // Use the actual user problem counts from the GraphQL response
      const userCounts = problemCountsData.userProblemCounts || {
        total: totalProblems,
        completed: 0,
        inProgress: 0,
        notStarted: totalProblems
      };
      
      setProblemCounts({
        total: userCounts.total || totalProblems,
        completed: userCounts.completed || 0,
        inProgress: userCounts.inProgress || 0,
        notStarted: userCounts.notStarted || totalProblems
      });
    }
  }, [problemsData, problemCountsData, itemsPerPage]);
  
  // Remove the problemCounts declaration from here (we moved it up)

  // Memoized tags data to prevent unnecessary re-renders
  const allTags = useMemo(() => {
    if (!tagsData?.tags) return [];
    return tagsData.tags.map((tag: { id: string; name: string; _count: { codingQuestions: number } }) => ({
      id: tag.id,
      name: tag.name,
      count: tag._count.codingQuestions
    }));
  }, [tagsData?.tags]);
  
  // Process all questions with the batch-fetched data
  const formattedProblems = useMemo(() => {
    if (!problemsData?.codingQuestions?.codingQuestions) return [];
    
    return problemsData.codingQuestions.codingQuestions.map((problem: any, index: number) => {
      // Map difficulty from enum to display format
      const difficultyMap: Record<string, string> = {
        EASY: "Easy",
        MEDIUM: "Medium",
        HARD: "Hard",
        VERY_HARD: "Very Hard",
        EXTREME: "Extreme"
      };
      
      // Calculate the actual index based on pagination
      const problemNumber = (currentPage - 1) * itemsPerPage + index + 1;
      
      // Determine problem status based on user submission data
      const userStatus = problem.userSubmissionStatus || { hasAccepted: false, attemptCount: 0 };
      let status = "Not Started";
      if (userStatus.hasAccepted) {
        status = "Completed";
      } else if (userStatus.attemptCount > 0) {
        status = "In Progress";
      }

      // Format average time spent
      const avgTimeSpent = problem.averageTimeSpentMs 
        ? `${Math.round(problem.averageTimeSpentMs / 60000)} min` // Convert ms to minutes
        : "-";

      return {
        id: problem.questionId,
        title: problem.question.name,
        difficulty: difficultyMap[problem.difficulty as keyof typeof difficultyMap] || String(problem.difficulty),
        tags: problem.tags.map((tag: { name: string }) => tag.name),
        completion: Math.floor(Math.random() * 100), // Random completion percent for demo
        description: problem.questionText,
        status: status,
        lastAttempt: userStatus.lastSubmittedAt ? new Date(userStatus.lastSubmittedAt).toLocaleDateString() : "-",
        attempts: userStatus.attemptCount || 0,
        timeSpent: avgTimeSpent,
        solvedByCount: problem.solvedByCount || 0,
        accuracy: problem.accuracy || 0,
        acceptedSubmissions: problem.acceptedSubmissions || 0,
        totalSubmissions: problem.totalSubmissions || 0,
        premium: false, // Removed premium flag as requested
        problemNumber // Add the problem number for display
      };
    });
  }, [problemsData?.codingQuestions?.codingQuestions, currentPage, itemsPerPage]);

  // Filter problems based on selected criteria - memoized for performance
  const filteredProblems = useMemo(() => {
    if (problemsLoading) return [];
    return formattedProblems;
  }, [formattedProblems, problemsLoading]);

  useEffect(() => {
    setMounted(true)
    
    // Track loading states separately with better UX
    setTagsLoading(tagsQueryLoading);
    
    // Only show loading for problems when actually loading (not for tag or counts loading)
    setLoadingProblems(problemsLoading);
    
    // Add logging to measure performance
    if (problemsLoading) {
      console.time('problems-loading');
    } else if (!problemsLoading && problemsData) {
      console.timeEnd('problems-loading');
    }
  }, [tagsQueryLoading, problemsLoading, problemsData])

  if (!mounted) return null

  // Toggle tag selection
  const toggleTag = (tag: string) => {
    console.log("Toggling tag ID:", tag);
    console.log("Current selectedTags:", selectedTags);
    
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag))
    } else {
      setSelectedTags([...selectedTags, tag])
    }
  }

  // Clear all selected tags
  const clearAllTags = () => {
    setSelectedTags([])
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

  // Helper for smart pagination range
  function getPaginationRange(currentPage: number, totalPages: number, siblingCount = 1) {
    const totalPageNumbers = siblingCount * 2 + 5;
    if (totalPages <= totalPageNumbers) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    const leftSiblingIndex = Math.max(currentPage - siblingCount, 1);
    const rightSiblingIndex = Math.min(currentPage + siblingCount, totalPages);
    const showLeftEllipsis = leftSiblingIndex > 2;
    const showRightEllipsis = rightSiblingIndex < totalPages - 1;
    const range: (number | string)[] = [];
    range.push(1);
    if (showLeftEllipsis) range.push('...');
    for (let i = leftSiblingIndex; i <= rightSiblingIndex; i++) {
      if (i !== 1 && i !== totalPages) range.push(i);
    }
    if (showRightEllipsis) range.push('...');
    if (totalPages > 1) range.push(totalPages);
    return range;
  }

  // Pagination controls component
  function PaginationControls() {
    const range = getPaginationRange(currentPage, totalPages);
    return (
      <div className="flex justify-center my-4">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="h-9 px-4"
            onClick={() => currentPage > 1 && setCurrentPage(currentPage - 1)}
            disabled={currentPage === 1 || problemsLoading}
          >
            Previous
          </Button>
          {range.map((page, idx) =>
            typeof page === 'number' ? (
              <Button
                key={page}
                variant="outline"
                size="sm"
                className={`h-9 w-9 ${page === currentPage ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800" : ""}`}
                onClick={() => setCurrentPage(page)}
                disabled={problemsLoading}
              >
                {page}
              </Button>
            ) : (
              <span key={"ellipsis-" + idx} className="text-slate-400 dark:text-slate-600">...</span>
            )
          )}
          <Button
            variant="outline"
            size="sm"
            className="h-9 px-4"
            onClick={() => currentPage < totalPages && setCurrentPage(currentPage + 1)}
            disabled={currentPage === totalPages || problemsLoading}
          >
            Next
          </Button>
          {problemsLoading && (
            <span className="flex items-center justify-center ml-2">
              <svg className="animate-spin h-4 w-4 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </span>
          )}
        </div>
      </div>
    );
  }

  // Helper to format solvedByCount as 1, 2, ..., 999, 1k, 1.1k, ...
  function formatSolvedByCount(count: number) {
    if (count < 1000) return count.toString();
    if (count < 10000) return (count / 1000).toFixed(1).replace(/\.0$/, "") + "k";
    return Math.floor(count / 1000) + "k";
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50 dark:from-slate-950 dark:to-slate-900">
      {/* Add shimmer animation keyframes */}
      <style jsx global>{`
        @keyframes shimmer {
          100% {
            transform: translateX(100%);
          }
        }
      `}</style>
      
      {/* Main content */}
      <main className="w-full px-4 py-6">
        {/* Hero section */}
        <section className="relative overflow-hidden rounded-2xl mb-8">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-slate-50 to-cyan-50 dark:from-blue-950/90 dark:via-slate-950/80 dark:to-cyan-950/70">
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
            <div className="absolute top-[10%] left-[5%] w-24 h-24 rounded-full bg-gradient-to-br from-blue-200/20 to-cyan-300/20 dark:from-blue-500/10 dark:to-cyan-600/10 blur-2xl"></div>
            <div className="absolute bottom-[15%] right-[10%] w-32 h-32 rounded-full bg-gradient-to-br from-cyan-200/20 to-blue-300/20 dark:from-cyan-500/10 dark:to-blue-600/10 blur-2xl"></div>
            <div className="absolute top-[40%] right-[20%] w-16 h-16 rounded-full bg-gradient-to-br from-blue-200/20 to-cyan-300/20 dark:from-blue-500/10 dark:to-cyan-600/10 blur-xl"></div>
          </div>

          <div className="relative px-6 py-8 md:py-10">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
              <div className="space-y-4 max-w-xl">
                <div className="flex items-center gap-3">
                  <div className="h-1 w-16 bg-gradient-to-r from-blue-500 via-blue-600 to-cyan-500 rounded-full"></div>
                  <span className="text-sm font-medium text-blue-700 dark:text-blue-300">Your Coding Journey</span>
                </div>

                <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">
                  Master{" "}
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-cyan-600 dark:from-blue-400 dark:to-cyan-400">
                    Algorithms
                  </span>{" "}
                  & Ace Your{" "}
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-cyan-600 dark:from-blue-400 dark:to-cyan-400">
                    Interviews
                  </span>
                </h2>

                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                  Elevate your coding skills through our{" "}
                  <span className="font-semibold text-blue-700 dark:text-blue-300">personalized learning platform</span>
                  . Track progress, solve challenges, and join a community of developers.
                </p>

                <div className="flex flex-wrap gap-3 pt-2">
                  <Button className="relative group overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 hover:from-blue-700 hover:via-blue-800 hover:to-blue-900 text-white gap-2 shadow-md border-0 px-4 py-4 h-10">
                    <div className="absolute inset-0 w-full h-full bg-[radial-gradient(circle_at_50%_120%,rgba(56,182,255,0.3),transparent_55%)]"></div>
                    <div className="relative flex items-center">
                      <Zap className="w-4 h-4 mr-1 transition-transform duration-300 group-hover:rotate-12" />
                      <span className="font-medium">Daily Challenge</span>
                    </div>
                  </Button>

                  <Button
                    variant="outline"
                    className="random-problem-btn relative overflow-hidden border-blue-300 dark:border-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/30 gap-2 shadow-sm px-4 py-4 h-10 group"
                    onClick={() => {
                      // Add loading state to button
                      const button = document.querySelector('.random-problem-btn');
                      if (button) {
                        button.classList.add('loading');
                      }

                      // Navigate to random problem API endpoint
                      fetch('/api/problem/random')
                        .then(response => {
                          if (response.redirected) {
                            window.location.href = response.url;
                          }
                        })
                        .catch(error => {
                          console.error('Error fetching random problem:', error);
                          // Remove loading state on error
                          if (button) {
                            button.classList.remove('loading');
                          }
                        });
                    }}
                  >
                    <div className="absolute inset-0 w-full h-full bg-[radial-gradient(circle_at_50%_120%,rgba(56,182,255,0.1),transparent_65%)] dark:bg-[radial-gradient(circle_at_50%_120%,rgba(56,182,255,0.2),transparent_65%)]"></div>
                    <div className="relative flex items-center">
                      <Shuffle className="w-4 h-4 mr-1 transition-transform duration-300 group-hover:rotate-180" />
                      <span className="font-medium">Random Problem</span>
                    </div>
                  </Button>
                </div>
              </div>

              {/* Stats cards */}
              <div className="relative grid grid-cols-2 gap-3 p-4 bg-white/70 dark:bg-slate-900/60 rounded-xl backdrop-blur-md border border-white/50 dark:border-slate-700/50 shadow-xl">
                {/* Decorative elements */}
                <div className="absolute -top-2 -left-2 w-4 h-4 bg-blue-100 dark:bg-blue-900/50 rounded-full border-2 border-blue-200 dark:border-blue-700"></div>
                <div className="absolute -bottom-2 -right-2 w-4 h-4 bg-cyan-100 dark:bg-cyan-900/50 rounded-full border-2 border-cyan-200 dark:border-cyan-700"></div>

                <div className="col-span-2 flex justify-between items-center mb-1">
                  <h3 className="text-xs font-medium text-slate-600 dark:text-slate-400">Your Progress</h3>
                  <span className="text-xs px-2 py-0.5 bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded-full font-medium">
                    Top 5%
                  </span>
                </div>

                <StatCard
                  label="Solved"
                  value={totalSolved}
                  bgColor="from-blue-50/90 to-blue-100/80 dark:from-blue-900/30 dark:to-blue-800/30"
                  textColor="text-blue-700 dark:text-blue-300"
                  borderColor="border-blue-200 dark:border-blue-700/50"
                  icon={<CheckCircle className="w-3 h-3 text-blue-500 dark:text-blue-400" />}
                  trend={5}
                />

                <StatCard
                  label="Streak"
                  value={streak}
                  bgColor="from-cyan-50/90 to-cyan-100/80 dark:from-cyan-900/30 dark:to-cyan-800/30"
                  textColor="text-cyan-700 dark:text-cyan-300"
                  borderColor="border-cyan-200 dark:border-cyan-800/50"
                  icon={<Zap className="w-3 h-3 text-cyan-500 dark:text-cyan-400" />}
                  trend={12}
                />

                <StatCard
                  label="Avg. Time"
                  value={averageTimeMinutes > 0 ? `${averageTimeMinutes} min` : "-"}
                  bgColor="from-sky-50/90 to-sky-100/80 dark:from-sky-900/30 dark:to-sky-800/30"
                  textColor="text-sky-700 dark:text-sky-300"
                  borderColor="border-sky-200 dark:border-sky-700/50"
                  icon={<Clock className="w-3 h-3 text-sky-500 dark:text-sky-400" />}
                  trend={-3}
                />

                <StatCard
                  label="Rank"
                  value={`#${performanceStats.ranking}`}
                  bgColor="from-amber-50/90 to-amber-100/80 dark:from-amber-900/30 dark:to-amber-800/30"
                  textColor="text-amber-700 dark:text-amber-300"
                  borderColor="border-amber-200 dark:border-amber-700/50"
                  icon={<Trophy className="w-3 h-3 text-amber-500 dark:text-amber-400" />}
                  trend={8}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Dashboard Tabs */}
        <Tabs
          defaultValue="overview"
          value={activeDashboardTab}
          onValueChange={setActiveDashboardTab}
          className="mb-8"
        >
          <div className="border-b border-slate-200 dark:border-slate-800">
            <TabsList className="bg-transparent h-auto p-0 w-full justify-start">
              <TabsTrigger
                value="overview"
                className="data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 dark:data-[state=active]:border-blue-400 dark:data-[state=active]:text-blue-400 rounded-none bg-transparent px-4 py-3 text-sm font-medium"
              >
                Overview
              </TabsTrigger>
              <TabsTrigger
                value="problems"
                className="data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 dark:data-[state=active]:border-blue-400 dark:data-[state=active]:text-blue-400 rounded-none bg-transparent px-4 py-3 text-sm font-medium"
              >
                Problems
              </TabsTrigger>
              <TabsTrigger
                value="learning"
                className="data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 dark:data-[state=active]:border-blue-400 dark:data-[state=active]:text-blue-400 rounded-none bg-transparent px-4 py-3 text-sm font-medium"
              >
                Learning Paths
              </TabsTrigger>
              <TabsTrigger
                value="contests"
                className="data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 dark:data-[state=active]:border-blue-400 dark:data-[state=active]:text-blue-400 rounded-none bg-transparent px-4 py-3 text-sm font-medium"
              >
                Contests
              </TabsTrigger>
              <TabsTrigger
                value="analytics"
                className="data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 dark:data-[state=active]:border-blue-400 dark:data-[state=active]:text-blue-400 rounded-none bg-transparent px-4 py-3 text-sm font-medium"
              >
                Analytics
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Overview Tab Content */}
          <TabsContent value="overview" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Learning Progress - Now partial width */}
              <Card className="md:col-span-2 border-none rounded-xl shadow-md overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-slate-50/80 to-slate-100/80 dark:from-slate-900/40 dark:to-slate-800/40 backdrop-blur-sm py-4 px-6 w-full">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2 text-slate-800 dark:text-slate-200">
                      <BookOpenCheck className="w-5 h-5 text-blue-600" /> Your Learning Path
                    </CardTitle>
                    <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300">
                      Intermediate
                    </Badge>
                  </div>
                  <CardDescription className="text-slate-600 dark:text-slate-400">
                    Track your progress through coding challenges
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <ProgressPathAnimation />

                  <div className="grid grid-cols-3 gap-4 mt-4">
                    <div className="rounded-lg bg-blue-50 dark:bg-blue-900/20 p-3 border border-blue-100 dark:border-blue-800/50 flex flex-col items-center">
                      <div className="text-xs text-blue-600 dark:text-blue-400 mb-1">Completed</div>
                      <div className="text-xl font-bold text-blue-800 dark:text-blue-300 flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4 text-blue-500" /> 127
                      </div>
                    </div>

                    <div className="rounded-lg bg-cyan-50 dark:bg-cyan-900/20 p-3 border border-cyan-100 dark:border-cyan-800/50 flex flex-col items-center">
                      <div className="text-xs text-cyan-600 dark:text-cyan-400 mb-1">Next Goal</div>
                      <div className="text-xl font-bold text-cyan-800 dark:text-cyan-300 flex items-center gap-1">
                        <Target className="w-4 h-4 text-cyan-500" /> 150
                      </div>
                    </div>

                    <div className="rounded-lg bg-sky-50 dark:bg-sky-900/20 p-3 border border-sky-100 dark:border-sky-800/50 flex flex-col items-center">
                      <div className="text-xs text-sky-600 dark:text-sky-400 mb-1">Focus Area</div>
                      <div className="text-xl font-bold text-sky-800 dark:text-sky-300 flex items-center gap-1">
                        <Cpu className="w-4 h-4 text-sky-500" /> DP
                      </div>
                    </div>
                  </div>

                  <div className="mt-6">
                    <h3 className="text-sm font-medium mb-3 flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                      <Compass className="w-4 h-4 text-blue-600" /> Recommended Next Steps
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="flex items-center gap-3 p-3 rounded-lg border border-blue-100 dark:border-blue-900/30 bg-blue-50/50 dark:bg-blue-900/10 group hover:bg-blue-100/50 dark:hover:bg-blue-900/20 transition-colors duration-300 cursor-pointer">
                        <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform duration-300">
                          <Lightbulb className="h-5 w-5" />
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-slate-800 dark:text-slate-200">
                            Complete Dynamic Programming Path
                          </h4>
                          <p className="text-xs text-slate-600 dark:text-slate-400">8 problems remaining</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 rounded-lg border border-cyan-100 dark:border-cyan-900/30 bg-cyan-50/50 dark:bg-cyan-900/10 group hover:bg-cyan-100/50 dark:hover:bg-cyan-900/20 transition-colors duration-300 cursor-pointer">
                        <div className="h-10 w-10 rounded-full bg-cyan-100 dark:bg-cyan-900/50 flex items-center justify-center text-cyan-600 dark:text-cyan-400 group-hover:scale-110 transition-transform duration-300">
                          <Layers className="h-5 w-5" />
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-slate-800 dark:text-slate-200">
                            Start Graph Algorithms
                          </h4>
                          <p className="text-xs text-slate-600 dark:text-slate-400">Improve your weak area</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Daily Challenge - Moved to first row */}
              <Card className="border-none rounded-xl overflow-hidden shadow-md">
                <CardHeader className="bg-gradient-to-r from-amber-50/80 to-amber-100/80 dark:from-amber-950/30 dark:to-amber-900/40 backdrop-blur-sm pb-3 w-full">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-semibold flex items-center gap-2 text-amber-800 dark:text-amber-300">
                      <Zap className="w-5 h-5 text-amber-500" /> Daily Challenge
                    </CardTitle>
                    <div className="h-8 w-8 rounded-full bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center">
                      <Flame className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                    </div>
                  </div>
                  <CardDescription className="text-amber-700/80 dark:text-amber-400/80">
                    Expires in{" "}
                    <span className="font-medium text-amber-600 dark:text-amber-400">{dailyChallenge.expiresIn}</span>
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-4 p-6 relative">
                  {/* Decorative elements */}
                  <div className="absolute top-0 right-0 h-24 w-24 bg-amber-100/30 dark:bg-amber-900/20 rounded-full -mt-12 -mr-12"></div>
                  <div className="absolute bottom-0 left-0 h-16 w-16 bg-amber-100/30 dark:bg-amber-900/20 rounded-full -mb-8 -ml-8"></div>

                  <h3 className="font-semibold text-lg mb-2 text-slate-800 dark:text-slate-200">
                    {dailyChallenge.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{dailyChallenge.description}</p>

                  <div className="flex gap-2 mb-4">
                    <Badge
                      className={
                        dailyChallenge.difficulty === "Easy"
                          ? "bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/40 text-green-800 dark:text-green-300 border border-green-200 dark:border-green-800/50"
                          : dailyChallenge.difficulty === "Medium"
                            ? "bg-gradient-to-r from-yellow-50 to-yellow-100 dark:from-yellow-900/30 dark:to-yellow-800/40 text-yellow-800 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-800/50"
                            : "bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/30 dark:to-red-800/40 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-800/50"
                      }
                    >
                      {dailyChallenge.difficulty}
                    </Badge>
                    {dailyChallenge.tags.map((tag, index) => (
                      <Badge key={index} variant="outline" className="border-slate-200 dark:border-slate-800">
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  <div className="flex justify-between items-center mb-4 p-2 rounded-lg bg-amber-50/50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-900/30">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                      <span className="text-xs text-amber-700 dark:text-amber-300">
                        {dailyChallenge.participants.toLocaleString()} participants
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Gem className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                      <span className="text-xs font-medium text-amber-700 dark:text-amber-300">
                        +{dailyChallenge.reward} points
                      </span>
                    </div>
                  </div>

                  <Button className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white gap-2 shadow-sm border-0 group">
                    <Zap className="w-4 h-4 transition-transform duration-300 group-hover:rotate-12" /> Solve Today's
                    Challenge
                  </Button>
                </CardContent>
              </Card>

              {/* Skill Radar Chart */}
              <Card className="border-none rounded-xl overflow-hidden shadow-md">
                <CardHeader className="bg-gradient-to-r from-blue-50/80 to-cyan-50/80 dark:from-blue-950/30 dark:to-cyan-950/40 backdrop-blur-sm pb-3 w-full">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-semibold flex items-center gap-2 text-slate-800 dark:text-slate-200">
                      <Gauge className="w-5 h-5 text-blue-600 dark:text-blue-400" /> Skill Analysis
                    </CardTitle>
                    <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center">
                      <Hexagon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    </div>
                  </div>
                  <CardDescription className="text-slate-600 dark:text-slate-400">
                    Your strengths and areas for improvement
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-4 p-6">
                  <SkillRadarChart />

                  <div className="mt-4 space-y-3">
                    <div>
                      <h4 className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                        <TrendingUp className="w-3 h-3 text-emerald-500" /> Strengths
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {performanceStats.strengths.map((strength, index) => (
                          <Badge
                            key={index}
                            className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300"
                          >
                            {strength}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                        <TrendingUp className="w-3 h-3 text-red-500 transform rotate-180" /> Areas to Improve
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {performanceStats.weaknesses.map((weakness, index) => (
                          <Badge
                            key={index}
                            className="bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300"
                          >
                            {weakness}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Achievements */}
              <Card className="border-none rounded-xl overflow-hidden shadow-md">
                <CardHeader className="bg-gradient-to-r from-purple-50/80 to-blue-50/80 dark:from-purple-950/30 dark:to-blue-950/40 backdrop-blur-sm pb-3 w-full">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-semibold flex items-center gap-2 text-slate-800 dark:text-slate-200">
                      <Award className="w-5 h-5 text-purple-600 dark:text-purple-400" /> Achievements
                    </CardTitle>
                    <Button variant="ghost" size="sm" className="text-xs">
                      View All
                    </Button>
                  </div>
                  <CardDescription className="text-slate-600 dark:text-slate-400">
                    Badges and accomplishments
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-4 p-6">
                  <div className="flex justify-around">
                    {performanceStats.badges.map((badge, index) => (
                      <AchievementBadge key={index} badge={badge} />
                    ))}
                  </div>

                  <div className="mt-6 space-y-3">
                    <div className="flex justify-between items-center p-3 rounded-lg bg-gradient-to-r from-blue-50 to-blue-100/70 dark:from-blue-950/20 dark:to-blue-900/30 border border-blue-200/70 dark:border-blue-900/30 shadow-sm">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-400">
                          <Infinity className="h-4 w-4" />
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-blue-800 dark:text-blue-300">12-Day Streak</h4>
                          <p className="text-xs text-blue-600 dark:text-blue-400">Keep it going!</p>
                        </div>
                      </div>
                      <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">🔥</div>
                    </div>

                    <div className="flex justify-between items-center p-3 rounded-lg bg-gradient-to-r from-purple-50 to-purple-100/70 dark:from-purple-950/20 dark:to-purple-900/30 border border-purple-200/70 dark:border-purple-900/30 shadow-sm">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center text-purple-600 dark:text-purple-400">
                          <Rocket className="h-4 w-4" />
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-purple-800 dark:text-purple-300">Top 5% Performer</h4>
                          <p className="text-xs text-purple-600 dark:text-purple-400">Among all users</p>
                        </div>
                      </div>
                      <div className="text-2xl font-bold text-purple-700 dark:text-purple-300">🚀</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Smart Recommendations */}
              <Card className="md:col-span-3 border-none rounded-xl overflow-hidden shadow-md">
                <CardHeader className="bg-gradient-to-r from-blue-50/80 to-cyan-50/80 dark:from-blue-950/30 dark:to-cyan-950/40 backdrop-sm pb-3 w-full">
                  <CardTitle className="text-lg font-semibold flex items-center gap-2 text-slate-800 dark:text-slate-200">
                    <Sparkles className="w-5 h-5 text-blue-500" /> Recommended For You
                  </CardTitle>
                  <CardDescription className="text-slate-600 dark:text-slate-400">
                    Personalized problem suggestions based on your performance
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <SmartRecommendations horizontal={true} />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Problems Tab Content */}
          <TabsContent value="problems" className="mt-6">
            <div className="flex flex-col gap-6">
              {/* Innovative Search and Filter Experience */}
              <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/40 dark:to-cyan-950/40 p-6 shadow-lg border border-blue-100/50 dark:border-blue-800/30">
                {/* Decorative elements */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-200/20 to-cyan-300/10 dark:from-blue-500/5 dark:to-cyan-600/5 rounded-full blur-3xl -mt-32 -mr-32 pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-blue-200/20 to-cyan-300/10 dark:from-blue-500/5 dark:to-cyan-600/5 rounded-full blur-3xl -mb-32 -ml-32 pointer-events-none"></div>

                <div className="relative">
                  <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-6 flex items-center gap-2">
                    <BookOpen className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-cyan-600 dark:from-blue-400 dark:to-cyan-400">
                      Coding Problems
                    </span>
                  </h2>

                  {/* Search and quick filters */}
                  <div className="flex flex-col md:flex-row gap-4 mb-8">
                    <div className="relative flex-1">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <Search className="h-5 w-5 text-blue-500 dark:text-blue-400" />
                      </div>
                      <input
                        type="search"
                        placeholder="Search problems by name, tag, or company..."
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-blue-200 dark:border-blue-800/50 bg-white/80 dark:bg-slate-900/50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm text-slate-800 dark:text-slate-200"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                        <kbd className="hidden sm:inline-flex items-center rounded border border-slate-200 dark:border-slate-700 px-2 font-sans text-xs text-slate-400 dark:text-slate-500">
                          ⌘K
                        </kbd>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        onClick={() => setDifficulty("All")}
                        className={`relative overflow-hidden px-4 py-2 h-12 rounded-xl transition-all duration-300 ${difficulty === "All"
                          ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md"
                          : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                          }`}
                      >
                        {difficulty === "All" && (
                          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(56,182,255,0.3),transparent_55%)]"></div>
                        )}
                        <span className="relative">All</span>
                      </Button>
                      <Button
                        onClick={() => setDifficulty("Easy")}
                        className={`relative overflow-hidden px-4 py-2 h-12 rounded-xl transition-all duration-300 ${difficulty === "Easy"
                          ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-md"
                          : "bg-white dark:bg-slate-900 text-green-600 dark:text-green-400 border border-green-200 dark:border-green-800/50 hover:bg-green-50/50 dark:hover:bg-green-900/20"
                          }`}
                      >
                        {difficulty === "Easy" && (
                          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(56,255,139,0.3),transparent_55%)]"></div>
                        )}
                        <span className="relative">Easy</span>
                      </Button>
                      <Button
                        onClick={() => setDifficulty("Medium")}
                        className={`relative overflow-hidden px-4 py-2 h-12 rounded-xl transition-all duration-300 ${difficulty === "Medium"
                          ? "bg-gradient-to-r from-yellow-500 to-amber-600 text-white shadow-md"
                          : "bg-white dark:bg-slate-900 text-yellow-600 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-800/50 hover:bg-yellow-50/50 dark:hover:bg-yellow-900/20"
                          }`}
                      >
                        {difficulty === "Medium" && (
                          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(255,207,56,0.3),transparent_55%)]"></div>
                        )}
                        <span className="relative">Medium</span>
                      </Button>
                      <Button
                        onClick={() => setDifficulty("Hard")}
                        className={`relative overflow-hidden px-4 py-2 h-12 rounded-xl transition-all duration-300 ${difficulty === "Hard"
                          ? "bg-gradient-to-r from-red-500 to-rose-600 text-white shadow-md"
                          : "bg-white dark:bg-slate-900 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800/50 hover:bg-red-50/50 dark:hover:bg-red-900/20"
                          }`}
                      >
                        {difficulty === "Hard" && (
                          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(255,56,56,0.3),transparent_55%)]"></div>
                        )}
                        <span className="relative">Hard</span>
                      </Button>
                    </div>
                  </div>


                  {/* Innovative Tag Selection */}
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-medium flex items-center gap-1.5 text-blue-700 dark:text-blue-400">
                        <Tag className="w-4 h-4" /> Popular Tags
                      </h3>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 px-3 text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 hover:bg-blue-50 dark:hover:bg-blue-950/30"
                          onClick={() => setExpandedTags(!expandedTags)}
                        >
                          {expandedTags ? (
                            <>
                              <ChevronUp className="h-3 w-3 mr-1" />
                              Collapse
                            </>
                          ) : (
                            <>
                              <ChevronDown className="h-3 w-3 mr-1" />
                              Show All Tags
                            </>
                          )}
                        </Button>
                        {selectedTags.length > 0 && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 px-3 text-xs text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/50"
                            onClick={clearAllTags}
                          >
                            Clear All ({selectedTags.length})
                          </Button>
                        )}
                      </div>
                    </div>

                    <div className="relative">
                      {/* Top tags section (always visible) */}
                      <div className="flex flex-wrap gap-1.5 mb-2">
                        {tagsLoading ? (
                          <TagLoader />
                        ) : (
                          <>
                            {allTags
                              .sort((a: { count: number }, b: { count: number }) => b.count - a.count)
                              .slice(0, 12) // Show only top 12 tags by default
                              .map((tag: { id: string; name: string; count: number }) => {
                                const isSelected = selectedTags.includes(tag.id);
                                return (
                                  <motion.div
                                    key={tag.id}
                                    whileHover={{ scale: 1.03 }}
                                    whileTap={{ scale: 0.97 }}
                                    onClick={() => toggleTag(tag.id)}
                                    className={`relative cursor-pointer rounded-full overflow-hidden transition-all duration-300 ${isSelected
                                      ? "shadow-md"
                                      : "shadow-sm hover:shadow"
                                      }`}
                                  >
                                    <div className={`absolute inset-0 ${isSelected
                                      ? "bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700"
                                      : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
                                      }`}></div>

                                    <div className="relative py-1 px-2.5 flex items-center">
                                      <span className={`text-xs font-medium ${isSelected ? "text-white" : "text-slate-700 dark:text-slate-300"
                                        }`}>
                                        {tag.name}
                                      </span>
                                      <span className={`ml-1.5 text-[10px] px-1 py-0.5 rounded-full ${isSelected
                                        ? "bg-white/20 text-white"
                                        : "bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300"
                                        }`}>
                                        {tag.count}
                                      </span>
                                    </div>
                                  </motion.div>
                                );
                              })}
                          </>
                        )}
                      </div>

                      {/* "Show more" teaser when collapsed */}
                      {!expandedTags && !tagsLoading && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.3 }}
                          className="relative cursor-pointer rounded-lg overflow-hidden bg-gradient-to-r from-blue-50 to-blue-100/70 dark:from-blue-950/30 dark:to-blue-900/40 border border-blue-200/50 dark:border-blue-800/30 p-2 flex items-center justify-center"
                          onClick={() => setExpandedTags(true)}
                        >
                          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_center,rgba(59,130,246,0.1),transparent_70%)] dark:bg-[radial-gradient(ellipse_at_center,rgba(59,130,246,0.15),transparent_70%)]"></div>
                          <div className="flex flex-col items-center gap-1 relative">
                            <div className="flex flex-wrap justify-center gap-1 max-w-md">
                              {allTags
                                .sort((a: { count: number }, b: { count: number }) => b.count - a.count)
                                .slice(12, 18)
                                .map((tag: { id: string; name: string; count: number }) => (
                                  <div
                                    key={tag.id}
                                    className="px-1.5 py-0.5 rounded-full bg-white/80 dark:bg-slate-800/80 border border-blue-200 dark:border-blue-800 text-[10px] font-medium text-blue-600 dark:text-blue-400 shadow-sm"
                                  >
                                    {tag.name}
                                  </div>
                                ))}
                              <div className="px-1.5 py-0.5 rounded-full bg-blue-500 dark:bg-blue-600 text-[10px] font-medium text-white shadow-sm">
                                +{allTags.length - 18}
                              </div>
                            </div>
                            <span className="text-xs font-medium text-blue-700 dark:text-blue-400 flex items-center gap-1">
                              <ChevronDown className="h-3 w-3" />
                              Show {allTags.length - 12} more tags
                            </span>
                          </div>
                        </motion.div>
                      )}

                      {/* Expanded tags section */}
                      {expandedTags && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3 }}
                          className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800"
                        >
                          <div className="flex flex-wrap gap-1.5">
                            {allTags
                              .sort((a: { count: number }, b: { count: number }) => b.count - a.count)
                              .slice(12) // Skip the first 12 tags that are already shown
                              .map((tag: { id: string; name: string; count: number }) => {
                                const isSelected = selectedTags.includes(tag.id);
                                return (
                                  <motion.div
                                    key={tag.id}
                                    initial={{ opacity: 0, y: 5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.2 }}
                                    whileHover={{ scale: 1.03 }}
                                    whileTap={{ scale: 0.97 }}
                                    onClick={() => toggleTag(tag.id)}
                                    className={`relative cursor-pointer rounded-full overflow-hidden transition-all duration-300 ${isSelected
                                      ? "shadow-md"
                                      : "shadow-sm hover:shadow"
                                      }`}
                                  >
                                    <div className={`absolute inset-0 ${isSelected
                                      ? "bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700"
                                      : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
                                      }`}></div>

                                    <div className="relative py-1 px-2.5 flex items-center">
                                      <span className={`text-xs font-medium ${isSelected ? "text-white" : "text-slate-700 dark:text-slate-300"
                                        }`}>
                                        {tag.name}
                                      </span>
                                      <span className={`ml-1.5 text-[10px] px-1 py-0.5 rounded-full ${isSelected
                                        ? "bg-white/20 text-white"
                                        : "bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300"
                                        }`}>
                                        {tag.count}
                                      </span>
                                    </div>
                                  </motion.div>
                                );
                              })}
                          </div>
                        </motion.div>
                      )}
                    </div>
                  </div>

                  {/* Status filter tabs */}
                  <div className="flex flex-wrap gap-2 mb-2">
                    <Button
                      variant="ghost"
                      onClick={() => setActiveTab("all")}
                      className={`relative px-4 py-2 rounded-lg transition-all ${activeTab === "all"
                        ? "bg-blue-100/70 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-medium"
                        : "text-slate-600 dark:text-slate-400 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                        }`}
                    >
                      All Problems
                      {!loadingProblems && (
                        <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-blue-50 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300">
                          {problemCounts.total}
                        </span>
                      )}
                      {activeTab === "all" && (
                        <motion.div
                          className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500 dark:bg-blue-400"
                          layoutId="activeTabIndicator"
                        />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() => setActiveTab("completed")}
                      className={`relative px-4 py-2 rounded-lg transition-all ${activeTab === "completed"
                        ? "bg-green-100/70 dark:bg-green-900/30 text-green-700 dark:text-green-300 font-medium"
                        : "text-slate-600 dark:text-slate-400 hover:bg-green-50 dark:hover:bg-green-900/20"
                        }`}
                    >
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Completed
                      {!loadingProblems && (
                        <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-green-50 dark:bg-green-900/50 text-green-700 dark:text-green-300">
                          {problemCounts.completed}
                        </span>
                      )}
                      {activeTab === "completed" && (
                        <motion.div
                          className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-500 dark:bg-green-400"
                          layoutId="activeTabIndicator"
                        />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() => setActiveTab("inProgress")}
                      className={`relative px-4 py-2 rounded-lg transition-all ${activeTab === "inProgress"
                        ? "bg-yellow-100/70 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 font-medium"
                        : "text-slate-600 dark:text-slate-400 hover:bg-yellow-50 dark:hover:bg-yellow-900/20"
                        }`}
                    >
                      <StarHalf className="w-4 h-4 mr-1" />
                      In Progress
                      {!loadingProblems && (
                        <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-yellow-50 dark:bg-yellow-900/50 text-yellow-700 dark:text-yellow-300">
                          {problemCounts.inProgress}
                        </span>
                      )}
                      {activeTab === "inProgress" && (
                        <motion.div
                          className="absolute bottom-0 left-0 right-0 h-0.5 bg-yellow-500 dark:bg-yellow-400"
                          layoutId="activeTabIndicator"
                        />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() => setActiveTab("notStarted")}
                      className={`relative px-4 py-2 rounded-lg transition-all ${activeTab === "notStarted"
                        ? "bg-slate-100/70 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 font-medium"
                        : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/30"
                        }`}
                    >
                      <Info className="w-4 h-4 mr-1" />
                      Not Started
                      {!loadingProblems && (
                        <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          {problemCounts.notStarted}
                        </span>
                      )}
                      {activeTab === "notStarted" && (
                        <motion.div
                          className="absolute bottom-0 left-0 right-0 h-0.5 bg-slate-500 dark:bg-slate-400"
                          layoutId="activeTabIndicator"
                        />
                      )}
                    </Button>
                  </div>
                </div>
              </div>

              {/* Innovative Problem Cards Grid */}
              <div className="space-y-4" id="problems-section">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">
                    {!loadingProblems ? `${filteredProblems.length} Problems Found` : (
                      <span className="flex items-center">
                        <svg className="animate-spin mr-2 h-4 w-4 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Loading Problems...
                      </span>
                    )}
                  </h3>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" className="h-9 gap-1">
                      <ArrowUpDown className="h-3.5 w-3.5" />
                      Sort by
                    </Button>
                    <Button variant="outline" size="sm" className="h-9 gap-1">
                      <Filter className="h-3.5 w-3.5" />
                      More Filters
                    </Button>
                  </div>
                </div>

                {/* Show skeleton loader while loading */}
                {loadingProblems ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                      <div key={i} className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm animate-pulse relative overflow-hidden">
                        {/* Add shimmer effect */}
                        <div className="absolute top-0 -inset-x-full h-full transform translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent animate-[shimmer_1.5s_infinite]"></div>
                        
                        <div className="flex justify-between items-start mb-4">
                          <div className="w-3/4 h-6 bg-slate-200 dark:bg-slate-800 rounded-md"></div>
                          <div className="w-16 h-6 bg-slate-200 dark:bg-slate-800 rounded-md"></div>
                        </div>
                        <div className="space-y-2 mb-4">
                          <div className="w-full h-4 bg-slate-200 dark:bg-slate-800 rounded-md"></div>
                          <div className="w-2/3 h-4 bg-slate-200 dark:bg-slate-800 rounded-md"></div>
                        </div>
                        <div className="flex gap-2 mb-4">
                          <div className="w-16 h-6 bg-slate-200 dark:bg-slate-800 rounded-full"></div>
                          <div className="w-16 h-6 bg-slate-200 dark:bg-slate-800 rounded-full"></div>
                        </div>
                        <div className="flex justify-between items-center">
                          <div className="w-20 h-8 bg-slate-200 dark:bg-slate-800 rounded-md"></div>
                          <div className="w-20 h-8 bg-slate-200 dark:bg-slate-800 rounded-md"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : filteredProblems.length > 0 ? (
                  <motion.div
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 2xl:grid-cols-3 gap-3"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    {filteredProblems.map((problem: {
                      id: number | string;
                      title: string;
                      difficulty: string;
                      tags: string[];
                      completion: number;
                      description: string;
                      status: string;
                      lastAttempt: string;
                      attempts: number;
                      timeSpent: string;
                      solvedByCount: number;
                      accuracy: number;
                      premium: boolean;
                      problemNumber: number;
                      acceptedSubmissions: number;
                      totalSubmissions: number;
                    }, index: number) => {
                      // Get difficulty styling
                      const difficultyStyles = {
                        Easy: "bg-gradient-to-r from-green-500 to-emerald-600 text-white",
                        Medium: "bg-gradient-to-r from-yellow-500 to-amber-600 text-white",
                        Hard: "bg-gradient-to-r from-red-500 to-rose-600 text-white",
                        "Very Hard": "bg-gradient-to-r from-purple-500 to-purple-700 text-white",
                        Extreme: "bg-gradient-to-r from-slate-700 to-slate-900 text-white"
                      };

                      // Status styles
                      const statusStyles = {
                        "Completed": "text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 ring-1 ring-green-600/20 dark:ring-green-400/20",
                        "In Progress": "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 ring-1 ring-amber-600/20 dark:ring-amber-400/20",
                        "Not Started": "text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/40 ring-1 ring-slate-600/10 dark:ring-slate-400/10"
                      };

                      return (
                        <motion.div
                          key={problem.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.05 }}
                          whileHover={{ y: -2, boxShadow: "0 8px 20px -4px rgba(0, 0, 0, 0.1), 0 6px 8px -4px rgba(0, 0, 0, 0.05)" }}
                          className="relative bg-white dark:bg-slate-900/80 backdrop-blur-sm rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800/80 shadow-sm transition-all duration-300 group"
                        >
                          <div className="flex items-center">
                            {/* Left: Problem number and difficulty */}
                            <div className="flex-shrink-0 pl-3 pr-4 py-3 flex flex-col items-center justify-center border-r border-slate-100 dark:border-slate-800/50">
                              <span className="text-xl font-bold text-slate-800 dark:text-slate-200">{problem.problemNumber}</span>
                              <div className={`mt-1.5 text-xs font-medium px-2 py-1 rounded-full ${difficultyStyles[problem.difficulty as keyof typeof difficultyStyles] || difficultyStyles.Medium}`}>
                                {problem.difficulty}
                              </div>
                            </div>

                            {/* Middle: Problem info */}
                            <div className="flex-grow px-3 py-3">
                              <div className="flex items-start justify-between">
                                <h3 className="text-base font-semibold text-slate-800 dark:text-slate-200 mr-2">
                                  {problem.title}
                                </h3>
                                <div className={`flex-shrink-0 px-2 py-1 text-xs font-medium rounded-full ${statusStyles[problem.status as keyof typeof statusStyles] || statusStyles["Not Started"]}`}>
                                  {problem.status}
                                </div>
                              </div>

                              {/* Tags row */}
                              <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                                {problem.tags.slice(0, 3).map((tag: string, idx: number) => (
                                  <div key={idx} className="px-1.5 py-0.5 rounded text-[10px] bg-slate-100 dark:bg-slate-800/70 text-slate-600 dark:text-slate-400">
                                    {tag}
                                  </div>
                                ))}
                                {problem.tags.length > 3 && (
                                  <div className="px-1.5 py-0.5 rounded text-[10px] bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                                    +{problem.tags.length - 3}
                                  </div>
                                )}
                              </div>

                              {/* Stats row */}
                              <div className="flex items-center mt-2 text-[10px] text-slate-500 dark:text-slate-500 space-x-3">
                                <div className="flex items-center gap-1">
                                  <Users className="h-3 w-3 text-slate-400" />
                                  <span className="text-slate-600 dark:text-slate-400">{formatSolvedByCount(problem.solvedByCount)}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <CheckCircle className="h-3 w-3 text-green-500 dark:text-green-500" />
                                  <span className="text-slate-600 dark:text-slate-400">{problem.accuracy}%</span>
                                </div>
                                {problem.attempts > 0 && (
                                  <div className="flex items-center gap-1">
                                    <Clock className="h-3 w-3 text-slate-400" />
                                    <span>{problem.timeSpent}</span>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Right: Action button */}
                            <div className="flex-shrink-0 pr-3 pl-2">
                              <Button 
                                size="sm"
                                variant="ghost"
                                className={`h-8 w-8 rounded-full p-0 ${problem.status === "Completed"
                                  ? "text-green-600 hover:text-green-700 hover:bg-green-50 dark:text-green-400 dark:hover:text-green-300 dark:hover:bg-green-900/20"
                                  : problem.status === "In Progress"
                                    ? "text-amber-600 hover:text-amber-700 hover:bg-amber-50 dark:text-amber-400 dark:hover:text-amber-300 dark:hover:bg-amber-900/20"
                                    : "text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:text-blue-400 dark:hover:text-blue-300 dark:hover:bg-blue-900/20"
                                }`}
                              >
                                {problem.status === "Completed" ? (
                                  <CheckCircle className="h-5 w-5" />
                                ) : problem.status === "In Progress" ? (
                                  <StarHalf className="h-5 w-5" />
                                ) : (
                                  <ArrowUpDown className="h-5 w-5" />
                                )}
                              </Button>
                            </div>
                          </div>
                          
                          {/* Bottom action row (reveals on hover) */}
                          <div className="h-0 group-hover:h-10 overflow-hidden transition-all duration-300 border-t border-slate-100 dark:border-slate-800/50 opacity-0 group-hover:opacity-100">
                            <div className="flex items-center justify-between px-3 py-2">
                              <div className="flex gap-2">
                                <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
                                  <Info className="h-3 w-3 mr-1" />
                                  Details
                                </Button>
                                <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
                                  <BookOpen className="h-3 w-3 mr-1" />
                                  Notes
                                </Button>
                              </div>
                              <Button 
                                size="sm" 
                                className={`h-6 px-3 text-xs text-white ${problem.status === "Completed"
                                  ? "bg-green-500 hover:bg-green-600"
                                  : problem.status === "In Progress"
                                    ? "bg-amber-500 hover:bg-amber-600"
                                    : "bg-blue-500 hover:bg-blue-600"
                                }`}
                                onClick={() => router.push(`/nexpractice/problem/${problem.id}`)}
                              >
                                {problem.status === "Completed" ? "Solve Again" : problem.status === "In Progress" ? "Continue" : "Solve"}
                              </Button>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </motion.div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                    <div className="w-20 h-20 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
                      <Search className="w-10 h-10 text-slate-400 dark:text-slate-600" />
                    </div>
                    <h3 className="text-lg font-medium text-slate-800 dark:text-slate-200 mb-2">No problems found</h3>
                    <p className="text-slate-600 dark:text-slate-400 mb-6 text-center max-w-md">
                      We couldn't find any problems matching your current filters. Try adjusting your search criteria or clearing some filters.
                    </p>
                    <Button onClick={clearAllTags} className="bg-blue-500 hover:bg-blue-600 text-white">
                      Clear All Filters
                    </Button>
                  </div>
                )}

                {filteredProblems.length > 0 && (
                  <PaginationControls />
                )}
              </div>
            </div>
          </TabsContent>

          {/* Learning Paths Tab Content */}
          <TabsContent value="learning" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Learning Paths */}
              <div className="md:col-span-2 space-y-6">
                <Card className="border-none rounded-xl shadow-md overflow-hidden">
                  <CardHeader className="bg-gradient-to-r from-green-50/80 to-emerald-50/80 dark:from-green-950/30 dark:to-emerald-950/40 backdrop-blur-sm pb-3 w-full">
                    <CardTitle className="text-lg font-semibold flex items-center gap-2 text-slate-800 dark:text-slate-200">
                      <BookOpen className="w-5 h-5 text-emerald-600 dark:text-emerald-400" /> Your Learning Paths
                    </CardTitle>
                    <CardDescription className="text-slate-600 dark:text-slate-400">
                      Structured learning journeys to master different topics
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {learningPaths.map((path) => (
                        <LearningPathCard key={path.id} path={path} />
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-none rounded-xl shadow-md overflow-hidden w-full">
                  <CardHeader className="bg-gradient-to-r from-blue-50/80 to-cyan-50/80 dark:from-blue-950/30 dark:to-cyan-950/40 backdrop-blur-sm pb-3 w-full">
                    <CardTitle className="text-lg font-semibold flex items-center gap-2 text-slate-800 dark:text-slate-200">
                      <Compass className="w-5 h-5 text-blue-600 dark:text-blue-400" /> Recommended Paths
                    </CardTitle>
                    <CardDescription className="text-slate-600 dark:text-slate-400">
                      Paths that match your skill level and interests
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 group">
                        <div className="p-4">
                          <div className="flex justify-between items-start mb-3">
                            <h3 className="font-medium text-slate-800 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
                              Advanced Algorithms
                            </h3>
                            <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300">
                              Advanced
                            </Badge>
                          </div>
                          <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                            Master complex algorithms and data structures used in competitive programming.
                          </p>
                          <div className="flex flex-wrap gap-2 mb-3">
                            <Badge variant="outline" className="bg-slate-50 dark:bg-slate-900">Network Flow</Badge>
                            <Badge variant="outline" className="bg-slate-50 dark:bg-slate-900">Segment Trees</Badge>
                            <Badge variant="outline" className="bg-slate-50 dark:bg-slate-900">Advanced DP</Badge>
                          </div>
                          <div className="flex justify-between items-center text-xs text-slate-500 dark:text-slate-400 mb-4">
                            <span>32 problems</span>
                            <span>Est. completion: 6 weeks</span>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/50"
                          >
                            View Path
                          </Button>
                        </div>
                      </div>

                      <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 group">
                        <div className="p-4">
                          <div className="flex justify-between items-start mb-3">
                            <h3 className="font-medium text-slate-800 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
                              Interview Preparation
                            </h3>
                            <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300">
                              Intermediate
                            </Badge>
                          </div>
                          <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                            Comprehensive preparation for technical interviews at top tech companies.
                          </p>
                          <div className="flex flex-wrap gap-2 mb-3">
                            <Badge variant="outline" className="bg-slate-50 dark:bg-slate-900">Arrays</Badge>
                            <Badge variant="outline" className="bg-slate-50 dark:bg-slate-900">Strings</Badge>
                            <Badge variant="outline" className="bg-slate-50 dark:bg-slate-900">System Design</Badge>
                          </div>
                          <div className="flex justify-between items-center text-xs text-slate-500 dark:text-slate-400 mb-4">
                            <span>45 problems</span>
                            <span>Est. completion: 4 weeks</span>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/50"
                          >
                            View Path
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Learning Path Details */}
              <div>
                <Card className="border-none rounded-xl shadow-md overflow-hidden sticky top-24">
                  <CardHeader className="bg-gradient-to-r from-purple-50/80 to-blue-50/80 dark:from-purple-950/30 dark:to-blue-950/40 backdrop-blur-sm pb-3 w-full">
                    <CardTitle className="text-lg font-semibold flex items-center gap-2 text-slate-800 dark:text-slate-200">
                      <BookOpenCheck className="w-5 h-5 text-purple-600 dark:text-purple-400" /> Path Details
                    </CardTitle>
                    <CardDescription className="text-slate-600 dark:text-slate-400">
                      Dynamic Programming Mastery
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center text-white">
                            <BookOpen className="h-5 w-5" />
                          </div>
                          <div>
                            <h3 className="font-medium text-slate-800 dark:text-slate-200">Dynamic Programming</h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400">Intermediate Level</p>
                          </div>
                        </div>
                        <Badge className="bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300">
                          In Progress
                        </Badge>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400">
                          <span>Progress</span>
                          <span className="font-medium">65%</span>
                        </div>
                        <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-purple-500 to-blue-600 dark:from-purple-600 dark:to-blue-700 rounded-full"
                            style={{ width: "65%" }}
                          ></div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="rounded-lg bg-slate-50 dark:bg-slate-900/50 p-3 border border-slate-200 dark:border-slate-800/50">
                          <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Completed</div>
                          <div className="text-lg font-bold text-slate-800 dark:text-slate-200">16 / 24</div>
                        </div>
                        <div className="rounded-lg bg-slate-50 dark:bg-slate-900/50 p-3 border border-slate-200 dark:border-slate-800/50">
                          <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Time Left</div>
                          <div className="text-lg font-bold text-slate-800 dark:text-slate-200">2 weeks</div>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300">Next Problems</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between items-center p-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50">
                            <div className="flex items-center gap-2">
                              <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-600 dark:text-blue-400">
                                17
                              </div>
                              <span className="text-sm text-slate-700 dark:text-slate-300">Longest Common Subsequence</span>
                            </div>
                            <Badge variant="outline">Medium</Badge>
                          </div>
                          <div className="flex justify-between items-center p-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50">
                            <div className="flex items-center gap-2">
                              <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-600 dark:text-blue-400">
                                18
                              </div>
                              <span className="text-sm text-slate-700 dark:text-slate-300">Edit Distance</span>
                            </div>
                            <Badge variant="outline">Medium</Badge>
                          </div>
                        </div>
                      </div>

                      <Button className="w-full bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 text-white gap-2 shadow-sm border-0">
                        Continue Learning
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Contests Tab Content */}
          <TabsContent value="contests" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Upcoming Contests */}
              <div className="md:col-span-2 space-y-6 flex flex-col">
                <Card className="border-none rounded-xl shadow-md overflow-hidden flex-grow">
                  <CardHeader className="bg-gradient-to-r from-amber-50/80 to-orange-50/80 dark:from-amber-950/30 dark:to-orange-950/40 backdrop-blur-sm pb-3 w-full">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg font-semibold flex items-center gap-2 text-slate-800 dark:text-slate-200">
                        <Trophy className="w-5 h-5 text-amber-600 dark:text-amber-400" /> Upcoming Contests
                      </CardTitle>
                      <Button variant="ghost" size="sm" className="text-xs">
                        View All
                      </Button>
                    </div>
                    <CardDescription className="text-slate-600 dark:text-slate-400">
                      Participate in coding competitions to test your skills
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-6 flex-grow">
                    <div className="space-y-4">
                      {upcomingContests.map((contest) => (
                        <div
                          key={contest.id}
                          className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 group"
                        >
                          <div className="p-4">
                            <div className="flex justify-between items-start mb-3">
                              <div>
                                <h3 className="font-medium text-slate-800 dark:text-slate-200 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors duration-300">
                                  {contest.title}
                                </h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                  {contest.date} • {contest.time}
                                </p>
                              </div>
                              <Badge
                                className={
                                  contest.difficulty === "Easy"
                                    ? "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300"
                                    : contest.difficulty === "Medium"
                                      ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300"
                                      : contest.difficulty === "Medium-Hard"
                                        ? "bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-300"
                                        : "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300"
                                }
                              >
                                {contest.difficulty}
                              </Badge>
                            </div>

                            <div className="grid grid-cols-3 gap-2 mb-4">
                              <div className="flex flex-col items-center p-2 rounded-lg bg-amber-50/50 dark:bg-amber-900/20 border border-amber-100/50 dark:border-amber-900/30">
                                <span className="text-xs text-amber-600 dark:text-amber-400">Duration</span>
                                <span className="font-medium text-amber-700 dark:text-amber-300">{contest.duration}</span>
                              </div>
                              <div className="flex flex-col items-center p-2 rounded-lg bg-amber-50/50 dark:bg-amber-900/20 border border-amber-100/50 dark:border-amber-900/30">
                                <span className="text-xs text-amber-600 dark:text-amber-400">Participants</span>
                                <span className="font-medium text-amber-700 dark:text-amber-300">{contest.participants.toLocaleString()}</span>
                              </div>
                              <div className="flex flex-col items-center p-2 rounded-lg bg-amber-50/50 dark:bg-amber-900/20 border border-amber-100/50 dark:border-amber-900/30">
                                <span className="text-xs text-amber-600 dark:text-amber-400">Points</span>
                                <span className="font-medium text-amber-700 dark:text-amber-300">1500</span>
                              </div>
                            </div>

                            <div className="flex gap-2">
                              <Button className="flex-1 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white gap-2 shadow-sm border-0">
                                Register
                              </Button>
                              <Button variant="outline" size="icon" className="h-9 w-9">
                                <Calendar className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-none rounded-xl shadow-md overflow-hidden flex-grow">
                  <CardHeader className="bg-gradient-to-r from-slate-50/80 to-slate-100/80 dark:from-slate-900/40 dark:to-slate-800/40 backdrop-blur-sm pb-3 w-full">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg font-semibold flex items-center gap-2 text-slate-800 dark:text-slate-200">
                        <Clock className="w-5 h-5 text-slate-600 dark:text-slate-400" /> Past Contests
                      </CardTitle>
                      <Button variant="ghost" size="sm" className="text-xs">
                        View All
                      </Button>
                    </div>
                    <CardDescription className="text-slate-600 dark:text-slate-400">
                      Review your performance in previous contests
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-6 flex-grow">
                    <div className="space-y-4">
                      <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-sm">
                        <div className="p-4">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h3 className="font-medium text-slate-800 dark:text-slate-200">
                                Weekly Contest 341
                              </h3>
                              <p className="text-xs text-slate-500 dark:text-slate-400">
                                May 11, 2025 • Completed
                              </p>
                            </div>
                            <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-medium">
                              <Trophy className="h-3 w-3" />
                              Rank: 342
                            </div>
                          </div>

                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-1">
                              <CheckCircle className="h-4 w-4 text-green-500" />
                              <span className="text-sm text-slate-700 dark:text-slate-300">3/4 problems solved</span>
                            </div>
                            <span className="text-xs text-slate-500 dark:text-slate-400">Score: 1250 points</span>
                          </div>

                          <div className="grid grid-cols-4 gap-2 mb-4">
                            <div className="flex flex-col items-center p-2 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-900/30">
                              <span className="text-[10px] text-green-600 dark:text-green-400">A</span>
                              <CheckCircle className="h-3 w-3 text-green-500" />
                            </div>
                            <div className="flex flex-col items-center p-2 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-900/30">
                              <span className="text-[10px] text-green-600 dark:text-green-400">B</span>
                              <CheckCircle className="h-3 w-3 text-green-500" />
                            </div>
                            <div className="flex flex-col items-center p-2 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30">
                              <span className="text-[10px] text-red-600 dark:text-red-400">C</span>
                              <XCircle className="h-3 w-3 text-red-500" />
                            </div>
                            <div className="flex flex-col items-center p-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                              <span className="text-[10px] text-slate-500 dark:text-slate-400">D</span>
                              <span className="text-[10px] text-slate-500 dark:text-slate-400">—</span>
                            </div>
                          </div>

                          <Button variant="outline" size="sm" className="w-full">
                            View Details
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Contest Stats */}
              <div className="flex flex-col h-full">
                <Card className="border-none rounded-xl shadow-md overflow-hidden sticky top-24 h-full flex-grow flex flex-col">
                  <CardHeader className="bg-gradient-to-r from-amber-50/80 to-orange-50/80 dark:from-amber-950/30 dark:to-orange-950/40 backdrop-blur-sm pb-3 w-full">
                    <CardTitle className="text-lg font-semibold flex items-center gap-2 text-slate-800 dark:text-slate-200">
                      <Award className="w-5 h-5 text-amber-600 dark:text-amber-400" /> Your Contest Stats
                    </CardTitle>
                    <CardDescription className="text-slate-600 dark:text-slate-400">
                      Performance in competitive programming
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-6 flex-grow flex flex-col">
                    <div className="space-y-6 flex flex-col h-full justify-between">
                      <div className="space-y-6">
                        <div className="flex justify-center">
                          <div className="relative w-32 h-32">
                            <div className="absolute inset-0 rounded-full border-8 border-slate-100 dark:border-slate-800"></div>
                            <div
                              className="absolute inset-0 rounded-full border-8 border-transparent border-t-amber-500 dark:border-t-amber-400"
                              style={{ transform: 'rotate(45deg)' }}
                            ></div>
                            <div className="absolute inset-0 flex items-center justify-center flex-col">
                              <span className="text-3xl font-bold text-amber-600 dark:text-amber-400">1254</span>
                              <span className="text-xs text-slate-500 dark:text-slate-400">Rating</span>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="rounded-lg bg-slate-50 dark:bg-slate-900/50 p-3 border border-slate-200 dark:border-slate-800/50">
                            <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Contests</div>
                            <div className="text-lg font-bold text-slate-800 dark:text-slate-200">24</div>
                          </div>
                          <div className="rounded-lg bg-slate-50 dark:bg-slate-900/50 p-3 border border-slate-200 dark:border-slate-800/50">
                            <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Global Rank</div>
                            <div className="text-lg font-bold text-slate-800 dark:text-slate-200">#1,254</div>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300">Rating History</h4>
                          <div className="h-24 w-full">
                            <svg width="100%" height="100%" viewBox="0 0 300 100" preserveAspectRatio="none">
                              <defs>
                                <linearGradient id="contestGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                  <stop offset="0%" stopColor="#f59e0b" />
                                  <stop offset="100%" stopColor="#d97706" />
                                </linearGradient>
                                <linearGradient id="contestFill" x1="0%" y1="0%" x2="0%" y2="100%">
                                  <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.3" />
                                  <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.05" />
                                </linearGradient>
                              </defs>
                              <path
                                d="M0,80 C20,70 40,85 60,75 C80,65 100,90 120,80 C140,70 160,60 180,50 C200,40 220,60 240,50 C260,40 280,30 300,20"
                                fill="none"
                                stroke="url(#contestGradient)"
                                strokeWidth="2"
                              />
                              <path
                                d="M0,80 C20,70 40,85 60,75 C80,65 100,90 120,80 C140,70 160,60 180,50 C200,40 220,60 240,50 C260,40 280,30 300,20 L300,100 L0,100 Z"
                                fill="url(#contestFill)"
                              />
                            </svg>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300">Achievements</h4>
                          <div className="flex justify-between">
                            <div className="flex flex-col items-center">
                              <div className="h-10 w-10 rounded-full bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center text-amber-600 dark:text-amber-400 mb-1">
                                <Trophy className="h-5 w-5" />
                              </div>
                              <span className="text-xs text-slate-600 dark:text-slate-400">Top 10%</span>
                            </div>
                            <div className="flex flex-col items-center">
                              <div className="h-10 w-10 rounded-full bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center text-amber-600 dark:text-amber-400 mb-1">
                                <Flame className="h-5 w-5" />
                              </div>
                              <span className="text-xs text-slate-600 dark:text-slate-400">5 Streak</span>
                            </div>
                            <div className="flex flex-col items-center">
                              <div className="h-10 w-10 rounded-full bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center text-amber-600 dark:text-amber-400 mb-1">
                                <Award className="h-5 w-5" />
                              </div>
                              <span className="text-xs text-slate-600 dark:text-slate-400">Gold</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <Button className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white gap-2 shadow-sm border-0">
                        Find Upcoming Contests
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>


          <TabsContent value="analytics" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Performance Overview */}
              <div className="md:col-span-2 space-y-6">
                <Card className="border-none rounded-xl shadow-md overflow-hidden">
                  <CardHeader className="bg-gradient-to-r from-blue-50/80 to-cyan-50/80 dark:from-blue-950/30 dark:to-cyan-950/40 backdrop-sm pb-3 w-full">
                    <CardTitle className="text-lg font-semibold flex items-center gap-2 text-slate-800 dark:text-slate-200">
                      <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" /> Performance Overview
                    </CardTitle>
                    <CardDescription className="text-slate-600 dark:text-slate-400">
                      Your coding progress and statistics
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-6">
                    {/* Performance Summary Cards */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                      <div className="rounded-xl bg-gradient-to-br from-blue-50 to-blue-100/80 dark:from-blue-900/30 dark:to-blue-800/30 p-4 border border-blue-200 dark:border-blue-800/50 flex flex-col items-center shadow-sm hover:shadow-md transition-all duration-300 transform hover:scale-105">
                        <div className="text-xs text-blue-600 dark:text-blue-400 mb-1 font-medium">Total Solved</div>
                        <div className="text-2xl font-bold text-blue-800 dark:text-blue-300 flex items-center gap-1">
                          <CheckCircle2 className="w-5 h-5 text-blue-500" /> 127
                        </div>
                        <div className="text-xs text-blue-600/70 dark:text-blue-400/70 mt-1 flex items-center">
                          <TrendingUp className="w-3 h-3 mr-1" /> +12% this month
                        </div>
                      </div>
                      <div className="rounded-xl bg-gradient-to-br from-green-50 to-green-100/80 dark:from-green-900/30 dark:to-green-800/30 p-4 border border-green-200 dark:border-green-800/50 flex flex-col items-center shadow-sm hover:shadow-md transition-all duration-300 transform hover:scale-105">
                        <div className="text-xs text-green-600 dark:text-green-400 mb-1 font-medium">Easy</div>
                        <div className="text-2xl font-bold text-green-800 dark:text-green-300">
                          68
                        </div>
                        <div className="text-xs text-green-600/70 dark:text-green-400/70 mt-1 flex items-center">
                          <CheckCircle className="w-3 h-3 mr-1" /> 53.5% of total
                        </div>
                      </div>
                      <div className="rounded-xl bg-gradient-to-br from-yellow-50 to-yellow-100/80 dark:from-yellow-900/30 dark:to-yellow-800/30 p-4 border border-yellow-200 dark:border-yellow-800/50 flex flex-col items-center shadow-sm hover:shadow-md transition-all duration-300 transform hover:scale-105">
                        <div className="text-xs text-yellow-600 dark:text-yellow-400 mb-1 font-medium">Medium</div>
                        <div className="text-2xl font-bold text-yellow-800 dark:text-yellow-300">
                          42
                        </div>
                        <div className="text-xs text-yellow-600/70 dark:text-yellow-400/70 mt-1 flex items-center">
                          <CheckCircle className="w-3 h-3 mr-1" /> 33.1% of total
                        </div>
                      </div>
                      <div className="rounded-xl bg-gradient-to-br from-red-50 to-red-100/80 dark:from-red-900/30 dark:to-red-800/30 p-4 border border-red-200 dark:border-red-800/50 flex flex-col items-center shadow-sm hover:shadow-md transition-all duration-300 transform hover:scale-105">
                        <div className="text-xs text-red-600 dark:text-red-400 mb-1 font-medium">Hard</div>
                        <div className="text-2xl font-bold text-red-800 dark:text-red-300">
                          17
                        </div>
                        <div className="text-xs text-red-600/70 dark:text-red-400/70 mt-1 flex items-center">
                          <CheckCircle className="w-3 h-3 mr-1" /> 13.4% of total
                        </div>
                      </div>
                    </div>

                    {/* Enhanced Problem Difficulty Distribution */}
                    <div className="mb-8">
                      <h3 className="text-sm font-medium mb-3 text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                        <PieChart className="w-4 h-4 text-blue-600 dark:text-blue-400" /> Problem Difficulty Distribution
                      </h3>
                      <div className="relative h-64 w-full bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 flex items-center justify-center">
                        {/* Donut Chart */}
                        <div className="relative w-40 h-40">
                          {/* Easy segment */}
                          <div className="absolute inset-0">
                            <svg viewBox="0 0 100 100" width="100%" height="100%">
                              <circle cx="50" cy="50" r="40" fill="transparent" stroke="#4ade80" strokeWidth="20" strokeDasharray="251.2" strokeDashoffset="0" />
                            </svg>
                          </div>
                          {/* Medium segment */}
                          <div className="absolute inset-0">
                            <svg viewBox="0 0 100 100" width="100%" height="100%">
                              <circle cx="50" cy="50" r="40" fill="transparent" stroke="#facc15" strokeWidth="20" strokeDasharray="251.2" strokeDashoffset="134.4" />
                            </svg>
                          </div>
                          {/* Hard segment */}
                          <div className="absolute inset-0">
                            <svg viewBox="0 0 100 100" width="100%" height="100%">
                              <circle cx="50" cy="50" r="40" fill="transparent" stroke="#f87171" strokeWidth="20" strokeDasharray="251.2" strokeDashoffset="217.3" />
                            </svg>
                          </div>
                          {/* Center hole */}
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-20 h-20 rounded-full bg-white dark:bg-slate-900 flex flex-col items-center justify-center">
                              <span className="text-2xl font-bold text-slate-800 dark:text-slate-200">127</span>
                              <span className="text-xs text-slate-500 dark:text-slate-400">Problems</span>
                            </div>
                          </div>
                        </div>

                        {/* Legend */}
                        <div className="absolute right-6 top-1/2 transform -translate-y-1/2 space-y-3">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-green-400"></div>
                            <span className="text-sm text-slate-700 dark:text-slate-300">Easy (53.5%)</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                            <span className="text-sm text-slate-700 dark:text-slate-300">Medium (33.1%)</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-red-400"></div>
                            <span className="text-sm text-slate-700 dark:text-slate-300">Hard (13.4%)</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Enhanced Weekly Activity */}
                    <div className="mb-8">
                      <h3 className="text-sm font-medium mb-3 text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                        <BarChart className="w-4 h-4 text-blue-600 dark:text-blue-400" /> Weekly Activity
                      </h3>
                      <div className="h-64 w-full bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6">
                        <div className="flex justify-between h-44">
                          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day, i) => {
                            const heights = [30, 45, 20, 60, 75, 90, 50];
                            const isToday = i === 4;

                            return (
                              <div key={day} className="flex flex-col items-center justify-end h-full group">
                                <div className="relative w-12">
                                  <div
                                    className={`w-12 rounded-t-lg ${isToday ? 'bg-gradient-to-t from-blue-500 to-blue-400' : 'bg-gradient-to-t from-blue-400 to-blue-300'} dark:from-blue-600 dark:to-blue-500 group-hover:from-blue-600 group-hover:to-blue-500 dark:group-hover:from-blue-500 dark:group-hover:to-blue-400 transition-all duration-300 shadow-md`}
                                    style={{
                                      height: `${heights[i]}%`,
                                    }}
                                  >
                                    {/* Tooltip on hover */}
                                    <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-slate-800 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
                                      {heights[i] / 10} problems solved
                                    </div>
                                  </div>

                                  {/* Problem types mini-bars */}
                                  <div className="absolute bottom-0 left-0 w-full flex justify-center space-x-0.5">
                                    <div className="w-1/3 bg-green-400 dark:bg-green-500" style={{ height: `${heights[i] * 0.6}%` }}></div>
                                    <div className="w-1/3 bg-yellow-400 dark:bg-yellow-500" style={{ height: `${heights[i] * 0.3}%` }}></div>
                                    <div className="w-1/3 bg-red-400 dark:bg-red-500" style={{ height: `${heights[i] * 0.1}%` }}></div>
                                  </div>
                                </div>
                                <span className={`text-xs mt-2 ${isToday ? 'font-bold text-blue-600 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400'}`}>{day}</span>
                              </div>
                            );
                          })}
                        </div>
                        <div className="flex justify-between mt-4 text-xs text-slate-500 dark:text-slate-400">
                          <span>Week of May 9 - May 15, 2025</span>
                          <span className="font-medium text-blue-600 dark:text-blue-400">37 problems solved this week</span>
                        </div>
                      </div>
                    </div>

                    {/* Recent Submissions with enhanced styling */}
                    <div>
                      <h3 className="text-sm font-medium mb-3 text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                        <ClipboardList className="w-4 h-4 text-blue-600 dark:text-blue-400" /> Recent Submissions
                      </h3>
                      <div className="space-y-3">
                        {performanceStats.recentSubmissions.map((submission, index) => (
                          <div
                            key={index}
                            className="flex justify-between items-center p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 hover:shadow-md transition-all duration-300 group"
                          >
                            <div className="flex items-center gap-3">
                              <div className={`h-10 w-10 rounded-full flex items-center justify-center ${submission.result === "Accepted"
                                ? "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400"
                                : "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400"
                                }`}>
                                {submission.result === "Accepted" ? (
                                  <CheckCircle className="h-5 w-5" />
                                ) : (
                                  <XCircle className="h-5 w-5" />
                                )}
                              </div>
                              <div>
                                <h4 className="text-sm font-medium text-slate-800 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                  {submission.problem}
                                </h4>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                  {submission.time}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              {submission.runtime !== "N/A" && (
                                <div className="flex flex-col items-end">
                                  <span className="text-xs font-medium text-slate-700 dark:text-slate-300">Runtime</span>
                                  <span className="text-xs text-slate-500 dark:text-slate-400">{submission.runtime}</span>
                                </div>
                              )}
                              {submission.memory !== "N/A" && (
                                <div className="flex flex-col items-end">
                                  <span className="text-xs font-medium text-slate-700 dark:text-slate-300">Memory</span>
                                  <span className="text-xs text-slate-500 dark:text-slate-400">{submission.memory}</span>
                                </div>
                              )}
                              <Button variant="outline" size="sm" className="h-8 text-xs">
                                View Code
                              </Button>
                            </div>
                          </div>
                        ))}
                        <Button variant="outline" className="w-full mt-2">
                          View All Submissions
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Right Column - Skill Analysis and Achievements */}
              <div className="space-y-6">
                {/* Enhanced Skill Analysis */}
                <Card className="border-none rounded-xl shadow-md overflow-hidden">
                  <CardHeader className="bg-gradient-to-r from-purple-50/80 to-blue-50/80 dark:from-purple-950/30 dark:to-blue-950/40 backdrop-sm pb-3 w-full">
                    <CardTitle className="text-lg font-semibold flex items-center gap-2 text-slate-800 dark:text-slate-200">
                      <Gauge className="w-5 h-5 text-purple-600 dark:text-purple-400" /> Skill Analysis
                    </CardTitle>
                    <CardDescription className="text-slate-600 dark:text-slate-400">
                      Your strengths and areas for improvement
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-6">
                      {/* Skill Radar Chart */}
                      <div className="relative h-64 w-full bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 flex items-center justify-center">
                        <SkillRadarChart />
                      </div>

                      {/* Topic Proficiency with enhanced styling */}
                      <div>
                        <h3 className="text-sm font-medium mb-3 text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                          <Target className="w-4 h-4 text-purple-600 dark:text-purple-400" /> Topic Proficiency
                        </h3>
                        <div className="space-y-3">
                          <div>
                            <div className="flex justify-between text-xs mb-1">
                              <span className="text-slate-700 dark:text-slate-300 font-medium">Arrays & Strings</span>
                              <span className="text-purple-600 dark:text-purple-400 font-medium">85%</span>
                            </div>
                            <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-purple-500 to-blue-600 dark:from-purple-600 dark:to-blue-700 rounded-full"
                                style={{ width: "85%" }}
                              ></div>
                            </div>
                          </div>
                          <div>
                            <div className="flex justify-between text-xs mb-1">
                              <span className="text-slate-700 dark:text-slate-300 font-medium">Dynamic Programming</span>
                              <span className="text-purple-600 dark:text-purple-400 font-medium">65%</span>
                            </div>
                            <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-purple-500 to-blue-600 dark:from-purple-600 dark:to-blue-700 rounded-full"
                                style={{ width: "65%" }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}


