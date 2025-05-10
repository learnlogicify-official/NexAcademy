import React from "react"
import { Star, ThumbsUp, Crown, Lock, BookOpen, Code, Award, Timer, BarChart2, Users, Tag, ExternalLink, Bookmark, ChevronRight, Activity } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Progress } from "@/components/ui/progress"

// Define Problem interface
interface TestCase {
  id?: string
  input: string
  expectedOutput: string
  status?: string
}

interface Problem {
  id?: string
  number?: number
  title: string
  difficulty: string
  tags?: string[]
  level?: number
  description: string
  inputFormat?: string
  outputFormat?: string
  constraints: string[]
  sampleTestCases: TestCase[]
  hiddenTestCases?: TestCase[]
  starterCode?: string
  solution?: string
  explanation?: string
  xpReward?: number
}

export function ProblemDescription({ isPremium = false }) {
  return (
    <div className="space-y-4 overflow-auto h-full pb-6">
      {/* Modern compact header with glassmorphism effect */}
      <div className="relative mb-3 rounded-lg bg-gradient-to-br from-white/80 to-white/50 dark:from-gray-800/60 dark:to-gray-800/30 backdrop-blur-sm border border-gray-100/80 dark:border-gray-700/30 shadow-sm overflow-hidden group">
        {/* Problem number badge */}
        <div className="absolute top-0 left-0 bg-blue-600/10 dark:bg-blue-400/20 text-blue-600 dark:text-blue-400 text-xs font-medium px-2 py-1 rounded-br-md">
          Problem #1
        </div>
        
        {/* Title and difficulty - main heading */}
        <div className="pt-7 pb-3 px-4">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0 pr-2">
              <h1 className="text-lg font-bold text-gray-900 dark:text-gray-100 truncate transition-all group-hover:text-blue-600 dark:group-hover:text-blue-400">
                Two Sum
              </h1>
            </div>
            
            <div className="flex items-center gap-2">
              {/* Difficulty pill */}
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400 border border-green-100 dark:border-green-800/50">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 dark:bg-green-400 mr-1.5"></span>
                Easy
            </span>
              
              {/* Status badge */}
              <Badge variant="outline" className="text-green-600 border-green-200 flex items-center gap-1 px-1.5 py-0.5 bg-green-50/50 dark:bg-green-900/20">
                <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span className="text-xs">Solved</span>
              </Badge>
          </div>
          </div>
          
          {/* Tags and metadata in compact row */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-2">
            {/* XP reward */}
            <div className="flex items-center text-xs text-purple-600 dark:text-purple-400 font-medium">
              <Award className="h-3 w-3 mr-1" />
              <span>200 XP</span>
          </div>
            
            {/* Success rate */}
            <div className="flex items-center text-xs text-blue-600 dark:text-blue-400 font-medium">
              <Activity className="h-3 w-3 mr-1" />
              <span>49.2% success</span>
        </div>

            <div className="flex-1 flex flex-wrap items-center gap-1.5 mt-0.5">
              <Badge variant="secondary" className="bg-blue-50/80 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 cursor-pointer px-1.5 py-0.5 text-xs border-blue-100/80 dark:border-blue-800/30">
            Array
          </Badge>
              <Badge variant="secondary" className="bg-blue-50/80 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 cursor-pointer px-1.5 py-0.5 text-xs border-blue-100/80 dark:border-blue-800/30">
            Hash Table
          </Badge>
            </div>
          
            {/* Action buttons in a neat row */}
            <div className="flex items-center gap-1">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                    <button className="p-1.5 rounded-full bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 shadow-sm transition-all hover:scale-105">
                      <BookOpen className="h-3 w-3" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>View Editorial</TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                    <button className="p-1.5 rounded-full bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 shadow-sm transition-all hover:scale-105">
                      <Code className="h-3 w-3" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>View Solutions</TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                    <button className="p-1.5 rounded-full bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 shadow-sm transition-all hover:scale-105">
                      <Bookmark className="h-3 w-3" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>Add to Favorites</TooltipContent>
              </Tooltip>
            </TooltipProvider>
            </div>
          </div>
        </div>
      </div>

      {/* Problem description - Enhanced styling for educational content */}
      <div className="prose prose-sm max-w-none dark:prose-invert prose-headings:mb-2 prose-p:leading-relaxed">
        <p className="text-base leading-relaxed text-gray-800 dark:text-gray-200">
          Given an array of integers <code className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-gray-800 dark:text-gray-200">nums</code> and an
          integer <code className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-gray-800 dark:text-gray-200">target</code>, return{" "}
          <em className="text-blue-600 dark:text-blue-400 not-italic font-medium">
            indices of the two numbers such that they add up to{" "}
            <code className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-gray-800 dark:text-gray-200">target</code>
          </em>
          .
        </p>
        <p className="text-base leading-relaxed text-gray-800 dark:text-gray-200">
          You may assume that each input would have <strong className="font-semibold text-gray-900 dark:text-gray-100">exactly one solution</strong>, and you may not use the same
          element twice.
        </p>
        <p className="text-base leading-relaxed text-gray-800 dark:text-gray-200">You can return the answer in any order.</p>

        {/* Improved Examples section with better visual distinction */}
        <div className="mt-5 space-y-4">
          <div className="bg-gradient-to-br from-gray-50/80 to-gray-50 dark:from-gray-800/40 dark:to-gray-800/80 border border-gray-200/70 dark:border-gray-700/50 rounded-lg overflow-hidden shadow-sm">
            <div className="bg-gray-50/80 dark:bg-gray-800/60 px-3 py-1.5 border-b border-gray-200/70 dark:border-gray-700/50">
              <h3 className="font-medium flex items-center gap-2 text-gray-700 dark:text-gray-300">
                <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 h-5 w-5 rounded-full flex items-center justify-center text-xs font-bold">
                  1
                </span>
                Example 1
              </h3>
            </div>
            <div className="p-3 space-y-2">
              <div className="flex items-start">
                <span className="text-gray-500 dark:text-gray-400 font-medium w-16 text-sm">Input:</span>
                <code className="bg-gray-50 dark:bg-gray-800/50 p-1.5 rounded block w-full font-mono text-sm">
                  nums = [2,7,11,15], target = 9
                </code>
              </div>
              <div className="flex items-start">
                <span className="text-gray-500 dark:text-gray-400 font-medium w-16 text-sm">Output:</span>
                <code className="bg-gray-50 dark:bg-gray-800/50 p-1.5 rounded block w-full font-mono text-sm">
                  [0,1]
                </code>
              </div>
              <div className="flex items-start">
                <span className="text-gray-500 dark:text-gray-400 font-medium w-16 text-sm">Explain:</span>
                <span className="text-sm text-gray-700 dark:text-gray-300">Because nums[0] + nums[1] == 9, we return [0, 1].</span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-gray-50/80 to-gray-50 dark:from-gray-800/40 dark:to-gray-800/80 border border-gray-200/70 dark:border-gray-700/50 rounded-lg overflow-hidden shadow-sm">
            <div className="bg-gray-50/80 dark:bg-gray-800/60 px-3 py-1.5 border-b border-gray-200/70 dark:border-gray-700/50">
              <h3 className="font-medium flex items-center gap-2 text-gray-700 dark:text-gray-300">
                <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 h-5 w-5 rounded-full flex items-center justify-center text-xs font-bold">
                  2
                </span>
                Example 2
              </h3>
            </div>
            <div className="p-3 space-y-2">
              <div className="flex items-start">
                <span className="text-gray-500 dark:text-gray-400 font-medium w-16 text-sm">Input:</span>
                <code className="bg-gray-50 dark:bg-gray-800/50 p-1.5 rounded block w-full font-mono text-sm">
                  nums = [3,2,4], target = 6
                </code>
              </div>
              <div className="flex items-start">
                <span className="text-gray-500 dark:text-gray-400 font-medium w-16 text-sm">Output:</span>
                <code className="bg-gray-50 dark:bg-gray-800/50 p-1.5 rounded block w-full font-mono text-sm">
                  [1,2]
                </code>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-gray-50/80 to-gray-50 dark:from-gray-800/40 dark:to-gray-800/80 border border-gray-200/70 dark:border-gray-700/50 rounded-lg overflow-hidden shadow-sm">
            <div className="bg-gray-50/80 dark:bg-gray-800/60 px-3 py-1.5 border-b border-gray-200/70 dark:border-gray-700/50">
              <h3 className="font-medium flex items-center gap-2 text-gray-700 dark:text-gray-300">
                <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 h-5 w-5 rounded-full flex items-center justify-center text-xs font-bold">
                  3
                </span>
                Example 3
              </h3>
            </div>
            <div className="p-3 space-y-2">
              <div className="flex items-start">
                <span className="text-gray-500 dark:text-gray-400 font-medium w-16 text-sm">Input:</span>
                <code className="bg-gray-50 dark:bg-gray-800/50 p-1.5 rounded block w-full font-mono text-sm">
                  nums = [3,3], target = 6
                </code>
              </div>
              <div className="flex items-start">
                <span className="text-gray-500 dark:text-gray-400 font-medium w-16 text-sm">Output:</span>
                <code className="bg-gray-50 dark:bg-gray-800/50 p-1.5 rounded block w-full font-mono text-sm">
                  [0,1]
                </code>
              </div>
            </div>
          </div>
        </div>

        {/* Constraints section with improved educational styling */}
        <div className="mt-5 bg-gray-50/50 dark:bg-gray-800/30 p-3 rounded-lg border border-gray-200/70 dark:border-gray-700/70">
          <h3 className="text-base font-medium flex items-center gap-2 mb-2 text-gray-800 dark:text-gray-200">
            <BarChart2 className="h-4 w-4 text-gray-600 dark:text-gray-400" />
            Constraints
          </h3>
          <ul className="list-none space-y-1 pl-0">
            <li className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
              <div className="h-1.5 w-1.5 rounded-full bg-blue-500 dark:bg-blue-400 mt-0.5"></div>
              <code className="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-gray-800 dark:text-gray-200 text-sm">
                2 &lt;= nums.length &lt;= 10<sup>4</sup>
              </code>
            </li>
            <li className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
              <div className="h-1.5 w-1.5 rounded-full bg-blue-500 dark:bg-blue-400 mt-0.5"></div>
              <code className="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-gray-800 dark:text-gray-200 text-sm">
                -10<sup>9</sup> &lt;= nums[i] &lt;= 10<sup>9</sup>
              </code>
            </li>
            <li className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
              <div className="h-1.5 w-1.5 rounded-full bg-blue-500 dark:bg-blue-400 mt-0.5"></div>
              <code className="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-gray-800 dark:text-gray-200 text-sm">
                -10<sup>9</sup> &lt;= target &lt;= 10<sup>9</sup>
              </code>
            </li>
            <li className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
              <div className="h-1.5 w-1.5 rounded-full bg-blue-500 dark:bg-blue-400 mt-0.5"></div>
              <span className="font-medium">Only one valid answer exists.</span>
            </li>
          </ul>
        </div>

        {/* Premium insights section with improved styling */}
        {isPremium && (
          <div className="mt-5 bg-gradient-to-r from-amber-50/90 to-orange-50/90 dark:from-amber-950/30 dark:to-orange-950/30 border border-orange-200/80 dark:border-orange-900/40 rounded-lg p-3">
            <h3 className="font-medium text-orange-800 dark:text-orange-400 mb-2 flex items-center gap-2 text-base">
              <Crown className="h-4 w-4" />
              Learning Resources
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                  <Timer className="h-3.5 w-3.5 text-gray-500 dark:text-gray-400" />
                  Acceptance Rate:
                </span>
                <span className="font-medium text-gray-800 dark:text-gray-200">49.2%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                  <Users className="h-3.5 w-3.5 text-gray-500 dark:text-gray-400" />
                  Companies:
                </span>
                <span className="font-medium text-gray-800 dark:text-gray-200">Google, Amazon, Microsoft</span>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                    <BrainCircuit className="h-3.5 w-3.5 text-gray-500 dark:text-gray-400" />
                    Related Topics:
                  </span>
                </div>
                <div className="flex flex-wrap gap-1">
                  <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                    Hash Table
                  </span>
                  <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">
                    Array
                  </span>
                  <span className="inline-flex items-center rounded-full bg-purple-50 px-2 py-0.5 text-xs font-medium text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
                    Two Pointers
                </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// Missing components
function ThumbsDown(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M17 14V2M9 18.12 10 14H4.17a2 2 0 0 1-1.92-2.56l2.33-8A2 2 0 0 1 6.5 2H20a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-2.76a2 2 0 0 0-1.79 1.11L12 22h0a3.13 3.13 0 0 1-3-3.88Z" />
    </svg>
  )
}

function Share(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
      <polyline points="16 6 12 2 8 6" />
      <line x1="12" y1="2" x2="12" y2="15" />
    </svg>
  )
}

function HelpCircle(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  )
}

function BrainCircuit(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M12 4.5a2.5 2.5 0 0 0-4.96-.46 2.5 2.5 0 0 0-1.98 3 2.5 2.5 0 0 0-1.32 4.24 3 3 0 0 0 .34 5.58 2.5 2.5 0 0 0 2.96 3.08 2.5 2.5 0 0 0 4.91.05L12 20V4.5Z" />
      <path d="M16 8V5c0-1.1.9-2 2-2" />
      <path d="M12 13h4" />
      <path d="M12 18h6a2 2 0 0 1 2 2v1" />
      <path d="M12 8h8" />
      <path d="M20.5 8a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0Z" />
      <path d="M16.5 13a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0Z" />
      <path d="M20.5 21a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0Z" />
      <path d="M18.5 3a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0Z" />
    </svg>
  )
}
