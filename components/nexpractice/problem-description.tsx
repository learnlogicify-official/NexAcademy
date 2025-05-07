import { Star, ThumbsUp, Crown, Lock } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

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

export function ProblemDescription({ 
  isPremium = false, 
  problem = null 
}: { 
  isPremium?: boolean
  problem: Problem | null
}) {
  // Use default values if problem is not provided
  const title = problem?.title || "1. Two Sum";
  const difficulty = problem?.difficulty || "MEDIUM";
  const description = problem?.description || "";
  const constraints = problem?.constraints || [];
  const tags = problem?.tags || [];
  const sampleTestCases = problem?.sampleTestCases || [];

  // Map difficulty to display class
  const getDifficultyClass = (diff: string | undefined): string => {
    switch (diff?.toUpperCase()) {
      case "EASY":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
      case "MEDIUM":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
      case "HARD":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
      default:
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
    }
  };

  const difficultyClass = getDifficultyClass(difficulty);

  return (
    <div className="space-y-4 overflow-auto h-full pb-8">
      <div>
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">{title}</h1>
          <Badge variant="outline" className="text-green-600 border-green-200 flex items-center gap-1 dark:text-green-400 dark:border-green-800">
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
          <span className={`text-xs font-medium px-2.5 py-0.5 rounded ${difficultyClass}`}>
            {difficulty?.charAt(0)?.toUpperCase() + difficulty?.slice(1)?.toLowerCase() || "Easy"}
          </span>
          <div className="flex items-center gap-1">
            {tags && tags.length > 0 && (
              <button className="text-xs text-gray-600 dark:text-gray-300 flex items-center gap-1 border rounded px-2 py-0.5 hover:bg-gray-50 dark:hover:bg-gray-800 dark:border-gray-700">
                <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M4 6H20M4 12H20M4 18H20"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span className="max-w-[80px] truncate">{tags.length} Topics</span>
              </button>
            )}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button className="text-xs text-gray-600 dark:text-gray-300 flex items-center gap-1 border rounded px-2 py-0.5 hover:bg-gray-50 dark:hover:bg-gray-800 dark:border-gray-700">
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
                <TooltipContent className="tooltip-content">
                  {!isPremium ? "Premium feature" : "View companies that ask this question"}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <button className="text-xs text-gray-600 dark:text-gray-300 flex items-center gap-1 border rounded px-2 py-0.5 hover:bg-gray-50 dark:hover:bg-gray-800 dark:border-gray-700">
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

      <div className="prose prose-sm max-w-none dark:prose-invert prose-headings:font-semibold prose-h1:text-lg prose-h2:text-base prose-h3:text-sm prose-h4:text-sm prose-code:text-violet-600 dark:prose-code:text-violet-400 prose-code:bg-violet-100 dark:prose-code:bg-violet-900/30 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:font-normal prose-pre:bg-gray-100 dark:prose-pre:bg-gray-800 prose-pre:text-sm prose-pre:overflow-auto prose-pre:p-4 prose-pre:rounded-md hover:prose-a:text-gray-900">
        {/* Display actual problem description */}
        {description ? (
          <div 
            dangerouslySetInnerHTML={{ __html: description }} 
            className="problem-description-content"
            style={{
              // Style for proper rendering of HTML content
              lineHeight: '1.6',
            }}
          />
        ) : (
          <>
            <p>
              Given an array of integers <code>nums</code> and an
              integer <code>target</code>, return indices of the two numbers such that they add up to <code>target</code>.
            </p>
            <p>
              You may assume that each input would have <strong>exactly one solution</strong>, and you may not use the same
              element twice.
            </p>
            <p>You can return the answer in any order.</p>
          </>
        )}

        {/* Display test cases if available */}
        {sampleTestCases.length > 0 && (
          <>
            {sampleTestCases.map((testCase: TestCase, idx: number) => (
              <div key={testCase.id || idx}>
                <h3 className="text-base font-medium mt-6 mb-2">Example {idx + 1}:</h3>
                <div className="bg-gray-50 dark:bg-gray-800 rounded-md font-mono text-sm overflow-hidden">
                  <div className="test-case-grid divide-x divide-gray-200 dark:divide-gray-700">
                    {/* Input section - left side */}
                    <div className="flex-col test-case-section">
                      <div className="border-b border-gray-200 dark:border-gray-700 px-4 py-2 bg-gray-100 dark:bg-gray-800/60 flex items-center">
                        <span className="text-gray-600 dark:text-gray-400 font-medium">Input:</span>
                      </div>
                      <div className="p-3 overflow-auto test-case-content">
                        <pre className="whitespace-pre-wrap font-mono text-sm">{testCase.input}</pre>
                      </div>
                    </div>
                    
                    {/* Output section - right side */}
                    <div className="flex-col test-case-section">
                      <div className="border-b border-gray-200 dark:border-gray-700 px-4 py-2 bg-gray-100 dark:bg-gray-800/60 flex items-center">
                        <span className="text-gray-600 dark:text-gray-400 font-medium">Output:</span>
                      </div>
                      <div className="p-3 overflow-auto test-case-content">
                        <pre className="whitespace-pre-wrap font-mono text-sm">{testCase.output}</pre>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </>
        )}

        {/* If no sample test cases are provided, show the existing examples */}
        {(!sampleTestCases || sampleTestCases.length === 0) && (
          <>
            <h3 className="text-base font-medium mt-6 mb-2">Example 1:</h3>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-md font-mono text-sm overflow-hidden">
              <div className="test-case-grid divide-x divide-gray-200 dark:divide-gray-700">
                {/* Input section - left side */}
                <div className="flex-col test-case-section">
                  <div className="border-b border-gray-200 dark:border-gray-700 px-4 py-2 bg-gray-100 dark:bg-gray-800/60 flex items-center">
                    <span className="text-gray-600 dark:text-gray-400 font-medium">Input:</span>
                  </div>
                  <div className="p-3 overflow-auto test-case-content">
                    <pre className="whitespace-pre-wrap font-mono text-sm">nums = [2,7,11,15], target = 9</pre>
                  </div>
                </div>
                
                {/* Output section - right side */}
                <div className="flex-col test-case-section">
                  <div className="border-b border-gray-200 dark:border-gray-700 px-4 py-2 bg-gray-100 dark:bg-gray-800/60 flex items-center">
                    <span className="text-gray-600 dark:text-gray-400 font-medium">Output:</span>
                  </div>
                  <div className="p-3 overflow-auto test-case-content">
                    <pre className="whitespace-pre-wrap font-mono text-sm">[0,1]</pre>
                  </div>
                </div>
              </div>
              
              {/* Explanation section - full width */}
              <div className="border-t border-gray-200 dark:border-gray-700">
                <div className="px-4 py-2 bg-gray-100 dark:bg-gray-800/60 flex items-center border-b border-gray-200 dark:border-gray-700">
                  <span className="text-gray-600 dark:text-gray-400 font-medium">Explanation:</span>
                </div>
                <div className="p-3">
                  <pre className="whitespace-pre-wrap font-mono text-sm">Because nums[0] + nums[1] == 9, we return [0, 1].</pre>
                </div>
              </div>
            </div>

            <h3 className="text-base font-medium mt-6 mb-2">Example 2:</h3>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-md font-mono text-sm overflow-hidden">
              <div className="test-case-grid divide-x divide-gray-200 dark:divide-gray-700">
                {/* Input section - left side */}
                <div className="flex-col test-case-section">
                  <div className="border-b border-gray-200 dark:border-gray-700 px-4 py-2 bg-gray-100 dark:bg-gray-800/60 flex items-center">
                    <span className="text-gray-600 dark:text-gray-400 font-medium">Input:</span>
                  </div>
                  <div className="p-3 overflow-auto test-case-content">
                    <pre className="whitespace-pre-wrap font-mono text-sm">nums = [3,2,4], target = 6</pre>
                  </div>
                </div>
                
                {/* Output section - right side */}
                <div className="flex-col test-case-section">
                  <div className="border-b border-gray-200 dark:border-gray-700 px-4 py-2 bg-gray-100 dark:bg-gray-800/60 flex items-center">
                    <span className="text-gray-600 dark:text-gray-400 font-medium">Output:</span>
                  </div>
                  <div className="p-3 overflow-auto test-case-content">
                    <pre className="whitespace-pre-wrap font-mono text-sm">[1,2]</pre>
                  </div>
                </div>
              </div>
            </div>

            <h3 className="text-base font-medium mt-6 mb-2">Example 3:</h3>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-md font-mono text-sm overflow-hidden">
              <div className="test-case-grid divide-x divide-gray-200 dark:divide-gray-700">
                {/* Input section - left side */}
                <div className="flex-col test-case-section">
                  <div className="border-b border-gray-200 dark:border-gray-700 px-4 py-2 bg-gray-100 dark:bg-gray-800/60 flex items-center">
                    <span className="text-gray-600 dark:text-gray-400 font-medium">Input:</span>
                  </div>
                  <div className="p-3 overflow-auto test-case-content">
                    <pre className="whitespace-pre-wrap font-mono text-sm">nums = [3,3], target = 6</pre>
                  </div>
                </div>
                
                {/* Output section - right side */}
                <div className="flex-col test-case-section">
                  <div className="border-b border-gray-200 dark:border-gray-700 px-4 py-2 bg-gray-100 dark:bg-gray-800/60 flex items-center">
                    <span className="text-gray-600 dark:text-gray-400 font-medium">Output:</span>
                  </div>
                  <div className="p-3 overflow-auto test-case-content">
                    <pre className="whitespace-pre-wrap font-mono text-sm">[0,1]</pre>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {isPremium && (
          <div className="mt-6 p-4 bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-900/40 rounded-lg">
            <h3 className="font-medium text-orange-800 dark:text-orange-400 mb-2 flex items-center gap-2">
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
                  <div className="w-24 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div className="bg-green-500 h-full" style={{ width: "49.2%" }}></div>
                  </div>
                  <span className="text-xs">49.2%</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Difficulty Distribution:</span>
                <div className="flex items-center gap-1">
                  <span className="px-2 py-0.5 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 text-xs rounded">Easy</span>
                  <span className="text-xs">35%</span>
                  <span className="px-2 py-0.5 bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 text-xs rounded">Medium</span>
                  <span className="text-xs">45%</span>
                  <span className="px-2 py-0.5 bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 text-xs rounded">Hard</span>
                  <span className="text-xs">20%</span>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="mt-8 flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1">
            <ThumbsUp className="h-4 w-4 text-gray-500" />
            <span className="text-gray-600 dark:text-gray-400 text-sm">61.4K</span>
          </div>
          <div className="flex items-center gap-1">
            <ThumbsDown className="h-4 w-4 text-gray-500" />
            <span className="text-gray-600 dark:text-gray-400 text-sm">1.3K</span>
          </div>
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 text-gray-500" />
            <span className="text-gray-600 dark:text-gray-400 text-sm">Add to List</span>
          </div>
          <div className="flex items-center gap-1">
            <Share className="h-4 w-4 text-gray-500" />
            <span className="text-gray-600 dark:text-gray-400 text-sm">Share</span>
          </div>
          <div className="flex items-center gap-1">
            <HelpCircle className="h-4 w-4 text-gray-500" />
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
