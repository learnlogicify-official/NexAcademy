import React from "react"
import { Star, ThumbsUp, Crown, Lock, BookOpen, Code, Award, Timer, BarChart2, Users, Tag, ExternalLink } from "lucide-react"
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
    <div className="space-y-6 overflow-auto h-full pb-8">
      {/* Header section with problem title, difficulty, and solved status */}
      <div className="border-b pb-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 h-8 w-8 rounded-full flex items-center justify-center font-semibold">
              1
            </div>
            <h1 className="text-xl font-bold">Two Sum</h1>
          </div>
          <Badge variant="outline" className="text-green-600 border-green-200 flex items-center gap-1 px-2 py-1">
            <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M20 6L9 17L4 12"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Solved
          </Badge>
        </div>
        
        {/* Problem metadata cards */}
        <div className="grid grid-cols-3 gap-2 mb-3">
          <div className="flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-800/50 rounded-lg p-2">
            <span className="text-xs text-gray-500 dark:text-gray-400">Difficulty</span>
            <span className="font-medium text-green-600 dark:text-green-400 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-green-500"></span>Easy
            </span>
          </div>
          <div className="flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-800/50 rounded-lg p-2">
            <span className="text-xs text-gray-500 dark:text-gray-400">Success Rate</span>
            <span className="font-medium text-blue-600 dark:text-blue-400">49.2%</span>
          </div>
          <div className="flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-800/50 rounded-lg p-2">
            <span className="text-xs text-gray-500 dark:text-gray-400">XP Reward</span>
            <span className="font-medium text-purple-600 dark:text-purple-400 flex items-center gap-1">
              <Award className="h-3 w-3" /> 200
            </span>
          </div>
        </div>

        {/* Topics and action buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary" className="bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 cursor-pointer">
            <Tag className="h-3 w-3 mr-1" />
            Array
          </Badge>
          <Badge variant="secondary" className="bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 cursor-pointer">
            <Tag className="h-3 w-3 mr-1" />
            Hash Table
          </Badge>
          
          <div className="ml-auto flex items-center gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button className="p-1.5 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300">
                    <BookOpen className="h-4 w-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>View Editorial</TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button className="p-1.5 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300">
                    <Code className="h-4 w-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>View Solutions</TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button className="p-1.5 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300">
                    <Star className="h-4 w-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>Add to Favorites</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button className="p-1.5 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300">
                    {!isPremium && <Lock className="h-4 w-4 text-orange-500" />}
                    {isPremium && <Users className="h-4 w-4" />}
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  {!isPremium ? "Premium feature: View companies" : "View companies that ask this question"}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </div>

      {/* Problem description */}
      <div className="prose prose-sm max-w-none dark:prose-invert">
        <p>
          Given an array of integers <code className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-gray-800 dark:text-gray-200">nums</code> and an
          integer <code className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-gray-800 dark:text-gray-200">target</code>, return{" "}
          <em>
            indices of the two numbers such that they add up to{" "}
            <code className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-gray-800 dark:text-gray-200">target</code>
          </em>
          .
        </p>
        <p>
          You may assume that each input would have <strong>exactly one solution</strong>, and you may not use the same
          element twice.
        </p>
        <p>You can return the answer in any order.</p>

        {/* Examples section with enhanced styling */}
        <div className="mt-6 space-y-4">
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden shadow-sm">
            <div className="bg-gray-50 dark:bg-gray-800/80 px-4 py-2 border-b border-gray-200 dark:border-gray-700">
              <h3 className="font-medium flex items-center gap-2">
                <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 h-5 w-5 rounded-full flex items-center justify-center text-xs font-bold">
                  1
                </span>
                Example 1
              </h3>
            </div>
            <div className="p-4 space-y-2">
              <div className="flex items-start">
                <span className="text-gray-500 dark:text-gray-400 font-medium w-20">Input:</span>
                <code className="bg-gray-50 dark:bg-gray-800/50 p-2 rounded block w-full font-mono text-sm">
                  nums = [2,7,11,15], target = 9
                </code>
              </div>
              <div className="flex items-start">
                <span className="text-gray-500 dark:text-gray-400 font-medium w-20">Output:</span>
                <code className="bg-gray-50 dark:bg-gray-800/50 p-2 rounded block w-full font-mono text-sm">
                  [0,1]
                </code>
              </div>
              <div className="flex items-start">
                <span className="text-gray-500 dark:text-gray-400 font-medium w-20">Explanation:</span>
                <span className="text-sm">Because nums[0] + nums[1] == 9, we return [0, 1].</span>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden shadow-sm">
            <div className="bg-gray-50 dark:bg-gray-800/80 px-4 py-2 border-b border-gray-200 dark:border-gray-700">
              <h3 className="font-medium flex items-center gap-2">
                <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 h-5 w-5 rounded-full flex items-center justify-center text-xs font-bold">
                  2
                </span>
                Example 2
              </h3>
            </div>
            <div className="p-4 space-y-2">
              <div className="flex items-start">
                <span className="text-gray-500 dark:text-gray-400 font-medium w-20">Input:</span>
                <code className="bg-gray-50 dark:bg-gray-800/50 p-2 rounded block w-full font-mono text-sm">
                  nums = [3,2,4], target = 6
                </code>
              </div>
              <div className="flex items-start">
                <span className="text-gray-500 dark:text-gray-400 font-medium w-20">Output:</span>
                <code className="bg-gray-50 dark:bg-gray-800/50 p-2 rounded block w-full font-mono text-sm">
                  [1,2]
                </code>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden shadow-sm">
            <div className="bg-gray-50 dark:bg-gray-800/80 px-4 py-2 border-b border-gray-200 dark:border-gray-700">
              <h3 className="font-medium flex items-center gap-2">
                <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 h-5 w-5 rounded-full flex items-center justify-center text-xs font-bold">
                  3
                </span>
                Example 3
              </h3>
            </div>
            <div className="p-4 space-y-2">
              <div className="flex items-start">
                <span className="text-gray-500 dark:text-gray-400 font-medium w-20">Input:</span>
                <code className="bg-gray-50 dark:bg-gray-800/50 p-2 rounded block w-full font-mono text-sm">
                  nums = [3,3], target = 6
                </code>
              </div>
              <div className="flex items-start">
                <span className="text-gray-500 dark:text-gray-400 font-medium w-20">Output:</span>
                <code className="bg-gray-50 dark:bg-gray-800/50 p-2 rounded block w-full font-mono text-sm">
                  [0,1]
                </code>
              </div>
            </div>
          </div>
        </div>

        {/* Constraints section */}
        <div className="mt-6">
          <h3 className="text-base font-medium flex items-center gap-2 mb-3">
            <BarChart2 className="h-4 w-4 text-gray-600 dark:text-gray-400" />
            Constraints
          </h3>
          <ul className="list-disc pl-5 space-y-1 marker:text-blue-500">
            <li>
              <code className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-gray-800 dark:text-gray-200">
                2 &lt;= nums.length &lt;= 10<sup>4</sup>
              </code>
            </li>
            <li>
              <code className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-gray-800 dark:text-gray-200">
                -10<sup>9</sup> &lt;= nums[i] &lt;= 10<sup>9</sup>
              </code>
            </li>
            <li>
              <code className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-gray-800 dark:text-gray-200">
                -10<sup>9</sup> &lt;= target &lt;= 10<sup>9</sup>
              </code>
            </li>
            <li>
              <strong>Only one valid answer exists.</strong>
            </li>
          </ul>
        </div>

        {/* Premium insights section */}
        {isPremium && (
          <div className="mt-6 bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-950/30 dark:to-amber-950/30 border border-orange-200 dark:border-orange-900/40 rounded-lg p-4">
            <h3 className="font-medium text-orange-800 dark:text-orange-400 mb-3 flex items-center gap-2">
              <Crown className="h-4 w-4" />
              Premium Insights
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm flex items-center gap-1.5">
                  <Timer className="h-3.5 w-3.5 text-gray-500 dark:text-gray-400" />
                  Acceptance Rate:
                </span>
                <span className="font-medium">49.2%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm flex items-center gap-1.5">
                  <Users className="h-3.5 w-3.5 text-gray-500 dark:text-gray-400" />
                  Submissions:
                </span>
                <span className="font-medium">14.2M</span>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm flex items-center gap-1.5">
                    <BarChart2 className="h-3.5 w-3.5 text-gray-500 dark:text-gray-400" />
                    Success Rate:
                  </span>
                  <span className="text-xs">49.2%</span>
                </div>
                <Progress value={49.2} className="h-2 bg-gray-200" indicatorClassName="bg-green-500" />
              </div>
              <div>
                <span className="text-sm flex items-center gap-1.5 mb-2">
                  <BarChart2 className="h-3.5 w-3.5 text-gray-500 dark:text-gray-400" />
                  Difficulty Distribution:
                </span>
                <div className="flex items-center gap-2">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-green-800 dark:text-green-400">Easy</span>
                      <span className="text-xs">35%</span>
                    </div>
                    <Progress value={35} className="h-1.5 bg-gray-200" indicatorClassName="bg-green-500" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-yellow-800 dark:text-yellow-400">Medium</span>
                      <span className="text-xs">45%</span>
                    </div>
                    <Progress value={45} className="h-1.5 bg-gray-200" indicatorClassName="bg-yellow-500" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-red-800 dark:text-red-400">Hard</span>
                      <span className="text-xs">20%</span>
                    </div>
                    <Progress value={20} className="h-1.5 bg-gray-200" indicatorClassName="bg-red-500" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Community engagement section */}
        <div className="mt-6 border-t pt-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center">
              <button className="p-1.5 rounded-l-md bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 border-r border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300">
                <ThumbsUp className="h-4 w-4" />
              </button>
              <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 text-sm">
                61.4K
              </span>
              <button className="p-1.5 rounded-r-md bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300">
                <ThumbsDown className="h-4 w-4" />
              </button>
            </div>
            
            <button className="flex items-center gap-1 px-2 py-1 rounded-md bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 text-sm">
              <Star className="h-3.5 w-3.5" />
              <span>Favorite</span>
            </button>
            
            <button className="flex items-center gap-1 px-2 py-1 rounded-md bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 text-sm">
              <ExternalLink className="h-3.5 w-3.5" />
              <span>Share</span>
            </button>
          </div>
          
          <div className="text-sm text-green-600 dark:text-green-400 flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-green-600 dark:bg-green-500"></div>
            <span>1165 Online</span>
          </div>
        </div>
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
