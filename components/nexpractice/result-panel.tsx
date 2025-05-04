import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle2, XCircle, AlertTriangle, Clock, Database, Loader2 } from "lucide-react"
import { Judge0Result } from "@/utils/judge0"

// Helper to format output for better display
function formatOutput(output: string | null): string {
  if (output === null) return "(No output)";
  
  // Try to parse as JSON if it looks like an array or object
  if ((output.trim().startsWith('[') && output.trim().endsWith(']')) || 
      (output.trim().startsWith('{') && output.trim().endsWith('}'))) {
    try {
      const parsed = JSON.parse(output);
      return JSON.stringify(parsed, null, 2);
    } catch (e) {
      // If parsing fails, return as is
    }
  }
  
  // Handle common output formats - trim whitespace and newlines
  return output.trim();
}

interface TestResult {
  testCase: number
  input: string
  expected: string
  output: string
  passed: boolean
  error?: string
}

interface Results {
  success: boolean
  allPassed?: boolean
  testResults?: TestResult[]
  judgeResults?: Judge0Result[]
  loading?: boolean
  error?: string
  mode?: "run" | "submit"
  showOnlyFailures?: boolean
  summary?: {
    passed: number
    total: number
    allPassed: boolean
    message?: string
  }
  totalTestCases?: number
  progress?: {
    current: number
    total: number
    message: string
  }
}

export function ResultPanel({ results }: { results: Results | null }) {
  // For "run" mode, always show the placeholder - this prevents results from
  // showing in the results tab when Run button is clicked
  if (!results || (results.mode === "run")) {
    return (
      <div className="p-4 text-sm text-gray-500 flex items-center justify-center h-full">
        <div className="text-center space-y-2">
          <div className="bg-gray-100 text-gray-500 p-3 rounded-full inline-block">
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M10 8L16 12L10 16V8Z"
                fill="currentColor"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <p>Run your code to see results here</p>
        </div>
      </div>
    )
  }

  if (!results.success) {
    // Handle specific error cases
    if (results.error && results.error.includes("Code cannot be empty")) {
      return (
        <div className="p-4">
          <Alert className="border-amber-200 bg-amber-50">
            <AlertTitle className="flex items-center gap-2 text-amber-700">
              <AlertTriangle className="h-4 w-4" />
              Empty Code
            </AlertTitle>
            <AlertDescription className="mt-2 text-amber-700">
              Please write some code before running. Your code editor is empty.
            </AlertDescription>
          </Alert>
        </div>
      )
    }
    
    // Handle comment-only code
    if (results.error && results.error.includes("only contains comments")) {
      return (
        <div className="p-4">
          <Alert className="border-amber-200 bg-amber-50">
            <AlertTitle className="flex items-center gap-2 text-amber-700">
              <AlertTriangle className="h-4 w-4" />
              Comments Only
            </AlertTitle>
            <AlertDescription className="mt-2 text-amber-700">
              Your code only contains comments. Please add actual code that can be executed.
            </AlertDescription>
          </Alert>
        </div>
      )
    }
    
    // Default error display
    return (
      <div className="p-4">
        <Alert variant="destructive" className="border-red-200 bg-red-50">
          <AlertTitle className="flex items-center gap-2">
            <XCircle className="h-4 w-4" />
            Error
          </AlertTitle>
          <AlertDescription className="font-mono text-xs mt-2 bg-red-100 p-2 rounded">{results.error}</AlertDescription>
        </Alert>
      </div>
    )
  }

  // Add summary alert for compile/runtime errors
  if (results && results.judgeResults && results.judgeResults.length > 0) {
    const hasCompileError = results.judgeResults.some(r => r.compile_output);
    const hasRuntimeError = results.judgeResults.some(r => r.stderr);
    if (hasCompileError || hasRuntimeError) {
      return (
        <div className="p-4 space-y-4">
          <Alert className={hasCompileError ? "border-amber-200 bg-amber-50" : "border-orange-200 bg-orange-50"}>
            <AlertTitle className="flex items-center gap-2 text-amber-700">
              <AlertTriangle className="h-4 w-4" />
              {hasCompileError ? "Compile Error" : "Runtime Error"}
            </AlertTitle>
            <AlertDescription className="mt-2 text-amber-700">
              {hasCompileError
                ? "Your code did not compile. Please check the error details below."
                : "Your code encountered a runtime error. Please check the error details below."}
            </AlertDescription>
          </Alert>
          {/* Render the rest of the panel as usual */}
          {/* ... existing code for displaying test case results ... */}
        </div>
      );
    }
  }

  // Handle Judge0 results if available
  if ((results.judgeResults && results.judgeResults.length > 0) || results.mode === "submit") {
    // For loading state, show running indicator
    if (results.loading) {
      // Show different loading UI for "submit" mode vs "run" mode
      if (results.mode === "submit") {
        return (
          <div className="p-4 space-y-4">
            <div className="flex items-center gap-2 text-blue-600 bg-blue-50 p-3 rounded-md border border-blue-100 w-full">
              <Loader2 className="w-5 h-5 animate-spin" />
              <div className="flex-1">
                <span className="font-medium">Submitting solution...</span>
                <div className="text-xs text-blue-700 mt-1">
                  {results.progress 
                    ? results.progress.message
                    : `Evaluating your code against ${results.totalTestCases || 'all'} test cases.`}
                </div>
              </div>
            </div>
            
            <div className="h-40 border rounded-md bg-blue-50/20 border-blue-100 flex items-center justify-center">
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                {results.progress ? (
                  <div className="text-center">
                    <p className="text-sm text-blue-700">{results.progress.message}</p>
                    <p className="text-xs text-blue-600 mt-1">
                      {results.progress.current} of {results.progress.total} test cases processed
                    </p>
                    <div className="w-48 h-2 bg-blue-100 rounded-full mt-2 overflow-hidden">
                      <div 
                        className="h-full bg-blue-500 rounded-full" 
                        style={{ width: `${(results.progress.current / results.progress.total) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-blue-700">Running all test cases...</p>
                )}
              </div>
            </div>
          </div>
        )
      }
      
      // Regular "run" mode loading UI
      return (
        <div className="p-4 space-y-4">
          <div className="flex items-center gap-2 text-blue-600 bg-blue-50 p-3 rounded-md border border-blue-100 w-full">
            <Loader2 className="w-5 h-5 animate-spin" />
            <div className="flex-1">
              <span className="font-medium">Running test cases...</span>
              <div className="text-xs text-blue-700 mt-1">Executing your code against the test inputs.</div>
            </div>
          </div>

          <div className="space-y-4">
            {results.judgeResults && results.judgeResults.map((result, index) => (
              <div key={index} className="border border-blue-100 rounded-md overflow-hidden shadow-sm bg-white">
                <div className="px-3 py-2 text-sm font-medium flex items-center justify-between bg-blue-50 text-blue-800 border-b border-blue-200">
                  <span className="flex items-center">
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Test Case {index + 1}: Running
                  </span>
                </div>
                <div className="p-3 space-y-3 text-xs font-mono">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <div className="text-xs font-medium text-gray-500 mb-1">Input:</div>
                      <div className="bg-gray-50 p-2 rounded border border-gray-100 whitespace-pre-wrap">{result.input}</div>
                    </div>
                    <div>
                      <div className="text-xs font-medium text-gray-500 mb-1">Expected Output:</div>
                      <div className="bg-gray-50 p-2 rounded border border-gray-100 whitespace-pre-wrap">{result.expected}</div>
                    </div>
                  </div>
                  <div>
                    <div className="text-xs font-medium text-gray-500 mb-1">Your Output:</div>
                    <div className="p-4 rounded flex flex-col items-center justify-center gap-2 border border-blue-100 bg-blue-50 text-blue-700 min-h-[60px]">
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span>Processing...</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )
    }
    
    // If it's submit mode and we have a summary with all tests passed, display detailed stats
    if (results.mode === "submit" && results.summary && results.summary.allPassed) {
      return (
        <div className="p-4 space-y-4">
          {/* Success banner with congratulation message */}
          <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
            <div className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center mb-4">
              <CheckCircle2 className="w-10 h-10 text-green-500" />
            </div>
            <h2 className="text-xl font-bold text-green-600 mb-1">Congratulations!</h2>
            <p className="text-gray-700 dark:text-gray-300">
              All {results.summary.passed} of {results.summary.total} test cases passed.
            </p>
          </div>
        </div>
      )
    }
    
    // If it's submit mode but tests failed, show the failure UI
    if (results.mode === "submit" && results.summary && !results.summary.allPassed) {
      return (
        <div className="p-4 space-y-4">
          <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-md border border-red-100 w-full">
            <XCircle className="w-5 h-5" />
            <div className="flex-1">
              <span className="font-medium">Some tests failed</span>
              <div className="text-xs text-red-700 mt-1">
                {results.summary.message || `${results.summary.passed} of ${results.summary.total} test cases passed. Here's the first failure:`}
              </div>
            </div>
          </div>

          {/* Show the first failed test case */}
          {results.judgeResults && results.judgeResults.length > 0 && (
            <div className="space-y-4">
              {results.judgeResults.map((result, index) => {
                // Define color scheme based on verdict
                let colorScheme = {
                  header: "bg-red-50 text-red-800 border-red-200",
                  output: "bg-red-50 text-red-800"
                }
                let icon = <XCircle className="w-4 h-4" />
                
                return (
                  <div key={index} className="border rounded-md overflow-hidden shadow-sm">
                    <div className={`px-3 py-2 text-sm font-medium flex items-center justify-between ${colorScheme.header}`}>
                      <span className="flex items-center gap-1.5">
                        {icon}
                        Failed Test Case: {result.verdict}
                      </span>
                    </div>
                    <div className="p-3 space-y-3 text-xs font-mono bg-white">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <div className="text-xs font-medium text-gray-500 mb-1">Input:</div>
                          <div className="bg-gray-50 p-2 rounded border border-gray-100 whitespace-pre-wrap">{result.input}</div>
                        </div>
                        <div>
                          <div className="text-xs font-medium text-gray-500 mb-1">Your Output:</div>
                          <div className={`p-2 rounded border whitespace-pre-wrap ${colorScheme.output} min-h-[40px]`}>
                            {formatOutput(result.output)}
                          </div>
                        </div>
                      </div>
                      
                      {/* Show error messages if available */}
                      {result.stderr && (
                        <div>
                          <span className="text-orange-600">Runtime Error: </span>
                          <div className="bg-orange-50 p-1.5 rounded mt-1 border border-orange-100 whitespace-pre-wrap">
                            {result.stderr}
                          </div>
                        </div>
                      )}
                      {result.compile_output && (
                        <div>
                          <span className="text-amber-600">Compile Error: </span>
                          <div className="bg-amber-50 p-1.5 rounded mt-1 border border-amber-100 whitespace-pre-wrap">
                            {result.compile_output}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      );
    }
    
    // Regular run mode with all test cases
    // Check if all verdicts are "Accepted"
    const allAccepted = results.judgeResults && results.judgeResults.length > 0 ? 
      results.judgeResults.every(result => result.verdict === "Accepted") : false
    
    return (
      <div className="p-4 space-y-4">
        <div className="flex items-center gap-2">
          {allAccepted ? (
            <div className="flex items-center gap-2 text-green-600 bg-green-50 p-3 rounded-md border border-green-100 w-full">
              <CheckCircle2 className="w-5 h-5" />
              <div className="flex-1">
                <span className="font-medium">All test cases passed!</span>
                <div className="text-xs text-green-700 mt-1">Great job! Your solution works for all test cases.</div>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-md border border-red-100 w-full">
              <XCircle className="w-5 h-5" />
              <div className="flex-1">
                <span className="font-medium">Some test cases failed</span>
                <div className="text-xs text-red-700 mt-1">Check the failed test cases and try again.</div>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-4">
          {results.judgeResults && results.judgeResults.map((result, index) => {
            // Define color scheme based on verdict
            let colorScheme = {
              header: "bg-red-50 text-red-800 border-red-200",
              output: "bg-red-50 text-red-800"
            }
            let icon = <XCircle className="w-4 h-4" />
            
            switch (result.verdict) {
              case "Accepted":
                colorScheme = { 
                  header: "bg-green-50 text-green-800 border-green-200",
                  output: "bg-green-50 text-green-800" 
                }
                icon = <CheckCircle2 className="w-4 h-4" />
                break
              case "Wrong Answer":
                // Default is red
                break
              case "Compile Error":
                colorScheme = { 
                  header: "bg-amber-50 text-amber-800 border-amber-200",
                  output: "bg-amber-50 text-amber-800" 
                }
                icon = <AlertTriangle className="w-4 h-4" />
                break
              case "Runtime Error":
                colorScheme = { 
                  header: "bg-orange-50 text-orange-800 border-orange-200",
                  output: "bg-orange-50 text-orange-800" 
                }
                icon = <AlertTriangle className="w-4 h-4" />
                break
              case "Time Limit Exceeded":
                colorScheme = { 
                  header: "bg-blue-50 text-blue-800 border-blue-200",
                  output: "bg-blue-50 text-blue-800" 
                }
                icon = <Clock className="w-4 h-4" />
                break
              case "Memory Limit Exceeded":
                colorScheme = { 
                  header: "bg-purple-50 text-purple-800 border-purple-200",
                  output: "bg-purple-50 text-purple-800" 
                }
                icon = <Database className="w-4 h-4" />
                break
              case "API Subscription Required":
                colorScheme = { 
                  header: "bg-blue-50 text-blue-800 border-blue-200",
                  output: "bg-blue-50 text-blue-800" 
                }
                icon = <AlertTriangle className="w-4 h-4" />
                break
              case "Language Deprecated":
                colorScheme = { 
                  header: "bg-amber-50 text-amber-800 border-amber-200",
                  output: "bg-amber-50 text-amber-800" 
                }
                icon = <AlertTriangle className="w-4 h-4" />
                break
              case "Running":
                colorScheme = { 
                  header: "bg-blue-50 text-blue-800 border-blue-200",
                  output: "bg-blue-50 text-blue-800" 
                }
                icon = <Loader2 className="w-4 h-4 animate-spin" />
                break
              case "Empty Code":
                colorScheme = { 
                  header: "bg-amber-50 text-amber-800 border-amber-200",
                  output: "bg-amber-50 text-amber-800" 
                }
                icon = <AlertTriangle className="w-4 h-4" />
                break
              case "Comments Only":
                colorScheme = { 
                  header: "bg-amber-50 text-amber-800 border-amber-200",
                  output: "bg-amber-50 text-amber-800" 
                }
                icon = <AlertTriangle className="w-4 h-4" />
                break
            }
            
            return (
              <div key={index} className="border rounded-md overflow-hidden shadow-sm">
                <div className={`px-3 py-2 text-sm font-medium flex items-center justify-between ${colorScheme.header}`}>
                  <span className="flex items-center gap-1.5">
                    {icon}
                    Test Case {index + 1}: {result.verdict}
                  </span>
                </div>
                <div className="p-3 space-y-3 text-xs font-mono bg-white">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <div className="text-xs font-medium text-gray-500 mb-1">Input:</div>
                      <div className="bg-gray-50 p-2 rounded border border-gray-100 whitespace-pre-wrap">{result.input}</div>
                    </div>
                    <div>
                      <div className="text-xs font-medium text-gray-500 mb-1">Expected Output:</div>
                      <div className="bg-gray-50 p-2 rounded border border-gray-100 whitespace-pre-wrap">{result.expected}</div>
                    </div>
                  </div>
                  <div>
                    <div className="text-xs font-medium text-gray-500 mb-1">Your Output:</div>
                    <div className={`p-2 rounded border whitespace-pre-wrap ${colorScheme.output} min-h-[40px]`}>
                      {formatOutput(result.output)}
                    </div>
                  </div>
                  
                  {/* Show API subscription notice if needed */}
                  {result.verdict === "API Subscription Required" && (
                    <div className="bg-blue-50 p-3 rounded-md border border-blue-200 mt-3 text-blue-800">
                      <div className="font-medium mb-1">RapidAPI Subscription Required</div>
                      <p className="text-xs">
                        Using local fallback execution. For full functionality, please subscribe to Judge0 on RapidAPI: 
                        <a 
                          href="https://rapidapi.com/judge0-official/api/judge0-ce/" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="underline ml-1"
                        >
                          Subscribe here
                        </a>
                      </p>
                      <p className="text-xs mt-1">
                        After subscribing, set your API key in NEXT_PUBLIC_JUDGE0_API_KEY environment variable.
                      </p>
                    </div>
                  )}
                  
                  {/* Show language deprecated notice */}
                  {result.verdict === "Language Deprecated" && (
                    <div className="bg-amber-50 p-3 rounded-md border border-amber-200 mt-3 text-amber-800">
                      <div className="font-medium mb-1">Language Version No Longer Supported</div>
                      <p className="text-xs">
                        The compiler version for this language is no longer available in Judge0. Please update your language mapping
                        with the most recent language versions available in the Judge0 API.
                      </p>
                      <p className="text-xs mt-2">
                        <a 
                          href="https://rapidapi.com/judge0-official/api/judge0-ce/details" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="underline"
                        >
                          See current language IDs
                        </a>
                      </p>
                      {result.compile_output && (
                        <pre className="text-xs mt-2 bg-amber-100 p-2 rounded overflow-auto max-h-20">
                          {result.compile_output}
                        </pre>
                      )}
                    </div>
                  )}
                  
                  {/* Show error messages based on the verdict */}
                  {result.verdict === "Compile Error" && result.compile_output && (
                    <div>
                      <span className="text-amber-600">Compile Error: </span>
                      <div className="bg-amber-50 p-1.5 rounded mt-1 border border-amber-100 whitespace-pre-wrap">
                        {result.compile_output}
                      </div>
                    </div>
                  )}
                  {result.verdict === "Runtime Error" && result.stderr && (
                    <div>
                      <span className="text-orange-600">Runtime Error: </span>
                      <div className="bg-orange-50 p-1.5 rounded mt-1 border border-orange-100 whitespace-pre-wrap">
                        {result.stderr}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  // Handle legacy test results format
  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center gap-2">
        {results.allPassed ? (
          <div className="flex items-center gap-2 text-green-600 bg-green-50 p-3 rounded-md border border-green-100 w-full">
            <CheckCircle2 className="w-5 h-5" />
            <div className="flex-1">
              <span className="font-medium">All test cases passed!</span>
              <div className="text-xs text-green-700 mt-1">Great job! Your solution works for all test cases.</div>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-md border border-red-100 w-full">
            <XCircle className="w-5 h-5" />
            <div className="flex-1">
              <span className="font-medium">Some test cases failed</span>
              <div className="text-xs text-red-700 mt-1">Check the failed test cases and try again.</div>
            </div>
          </div>
        )}
      </div>

      <div className="space-y-3">
        {results.testResults?.map((result) => (
          <div key={result.testCase} className="border rounded-md overflow-hidden shadow-sm">
            <div
              className={`px-3 py-2 text-sm font-medium flex items-center justify-between ${
                result.passed
                  ? "bg-green-50 text-green-800 border-b border-green-200"
                  : "bg-red-50 text-red-800 border-b border-red-200"
              }`}
            >
              <span>Test Case {result.testCase}</span>
              {result.passed ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
            </div>
            <div className="p-3 space-y-2 text-xs font-mono bg-white">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-gray-500">Input: </span>
                  <div className="bg-gray-50 p-1.5 rounded mt-1">{result.input}</div>
                </div>
                <div>
                  <span className="text-gray-500">Expected: </span>
                  <div className="bg-gray-50 p-1.5 rounded mt-1">{result.expected}</div>
                </div>
              </div>
              <div>
                <span className="text-gray-500">Your Output: </span>
                <div
                  className={`p-1.5 rounded mt-1 ${result.passed ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"}`}
                >
                  {result.output}
                </div>
              </div>
              {result.error && (
                <div className="text-red-600 bg-red-50 p-2 rounded border border-red-100 mt-2">{result.error}</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
