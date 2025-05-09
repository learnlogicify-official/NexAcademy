import { Star, ThumbsUp, Crown, Lock } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export function ProblemDescription({ isPremium = false }) {
  return (
    <div className="space-y-4">
      <div>
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">1. Two Sum</h1>
          <Badge variant="outline" className="text-green-600 border-green-200 flex items-center gap-1">
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
        <div className="flex items-center gap-2 mt-1">
          <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded">Easy</span>
          <div className="flex items-center gap-1">
            <button className="text-xs text-gray-600 flex items-center gap-1 border rounded px-2 py-0.5 hover:bg-gray-50">
              <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M4 6H20M4 12H20M4 18H20"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Topics
            </button>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button className="text-xs text-gray-600 flex items-center gap-1 border rounded px-2 py-0.5 hover:bg-gray-50">
                    <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path
                        d="M12 12C14.2091 12 16 10.2091 16 8C16 5.79086 14.2091 4 12 4C9.79086 4 8 5.79086 8 8C8 10.2091 9.79086 12 12 12Z"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M18 20C18 16.6863 15.3137 14 12 14C8.68629 14 6 16.6863 6 20"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    Companies
                    {!isPremium && <Lock className="h-3 w-3 ml-1 text-orange-500" />}
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  {!isPremium ? "Premium feature" : "View companies that ask this question"}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <button className="text-xs text-gray-600 flex items-center gap-1 border rounded px-2 py-0.5 hover:bg-gray-50">
              <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M12 16V12M12 8H12.01M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Hint
            </button>
          </div>
        </div>
      </div>

      <div className="prose prose-sm max-w-none">
        <p>
          Given an array of integers <code className="bg-gray-100 px-1 py-0.5 rounded text-gray-800">nums</code> and an
          integer <code className="bg-gray-100 px-1 py-0.5 rounded text-gray-800">target</code>, return{" "}
          <em>
            indices of the two numbers such that they add up to{" "}
            <code className="bg-gray-100 px-1 py-0.5 rounded text-gray-800">target</code>
          </em>
          .
        </p>
        <p>
          You may assume that each input would have <strong>exactly one solution</strong>, and you may not use the same
          element twice.
        </p>
        <p>You can return the answer in any order.</p>

        <h3 className="text-base font-medium mt-6 mb-2">Example 1:</h3>
        <div className="bg-gray-50 p-3 rounded-md font-mono text-sm">
          <div>
            <span className="text-gray-600">Input:</span> nums = [2,7,11,15], target = 9
          </div>
          <div>
            <span className="text-gray-600">Output:</span> [0,1]
          </div>
          <div>
            <span className="text-gray-600">Explanation:</span> Because nums[0] + nums[1] == 9, we return [0, 1].
          </div>
        </div>

        <h3 className="text-base font-medium mt-6 mb-2">Example 2:</h3>
        <div className="bg-gray-50 p-3 rounded-md font-mono text-sm">
          <div>
            <span className="text-gray-600">Input:</span> nums = [3,2,4], target = 6
          </div>
          <div>
            <span className="text-gray-600">Output:</span> [1,2]
          </div>
        </div>

        <h3 className="text-base font-medium mt-6 mb-2">Example 3:</h3>
        <div className="bg-gray-50 p-3 rounded-md font-mono text-sm">
          <div>
            <span className="text-gray-600">Input:</span> nums = [3,3], target = 6
          </div>
          <div>
            <span className="text-gray-600">Output:</span> [0,1]
          </div>
        </div>

        <h3 className="text-base font-medium mt-6 mb-2">Constraints:</h3>
        <ul className="list-disc pl-5 space-y-1">
          <li>
            <code className="bg-gray-100 px-1 py-0.5 rounded text-gray-800">
              2 &lt;= nums.length &lt;= 10<sup>4</sup>
            </code>
          </li>
          <li>
            <code className="bg-gray-100 px-1 py-0.5 rounded text-gray-800">
              -10<sup>9</sup> &lt;= nums[i] &lt;= 10<sup>9</sup>
            </code>
          </li>
          <li>
            <code className="bg-gray-100 px-1 py-0.5 rounded text-gray-800">
              -10<sup>9</sup> &lt;= target &lt;= 10<sup>9</sup>
            </code>
          </li>
          <li>
            <strong>Only one valid answer exists.</strong>
          </li>
        </ul>

        {isPremium && (
          <div className="mt-6 p-4 bg-orange-50 border border-orange-200 rounded-lg">
            <h3 className="font-medium text-orange-800 mb-2 flex items-center gap-2">
              <Crown className="h-4 w-4" />
              Premium Insights
            </h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Acceptance Rate:</span>
                <span className="font-medium">49.2%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Submissions:</span>
                <span className="font-medium">14.2M</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Success Rate:</span>
                <div className="flex items-center gap-1">
                  <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div className="bg-green-500 h-full" style={{ width: "49.2%" }}></div>
                  </div>
                  <span className="text-xs">49.2%</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Difficulty Distribution:</span>
                <div className="flex items-center gap-1">
                  <span className="px-2 py-0.5 bg-green-100 text-green-800 text-xs rounded">Easy</span>
                  <span className="text-xs">35%</span>
                  <span className="px-2 py-0.5 bg-yellow-100 text-yellow-800 text-xs rounded">Medium</span>
                  <span className="text-xs">45%</span>
                  <span className="px-2 py-0.5 bg-red-100 text-red-800 text-xs rounded">Hard</span>
                  <span className="text-xs">20%</span>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="mt-8 flex items-center gap-2">
          <div className="flex items-center gap-1">
            <ThumbsUp className="h-4 w-4 text-gray-500" />
            <span className="text-gray-600 text-sm">61.4K</span>
          </div>
          <div className="flex items-center gap-1">
            <ThumbsDown className="h-4 w-4 text-gray-500" />
            <span className="text-gray-600 text-sm">1.3K</span>
          </div>
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 text-gray-500" />
            <span className="text-gray-600 text-sm">Add to List</span>
          </div>
          <div className="flex items-center gap-1">
            <Share className="h-4 w-4 text-gray-500" />
            <span className="text-gray-600 text-sm">Share</span>
          </div>
          <div className="flex items-center gap-1">
            <HelpCircle className="h-4 w-4 text-gray-500" />
          </div>
        </div>

        <div className="mt-2 text-sm text-green-600 flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-green-600"></div>
          <span>1165 Online</span>
        </div>
      </div>
    </div>
  )
}

// Missing components
function ThumbsDown(props) {
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

function Share(props) {
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

function HelpCircle(props) {
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
