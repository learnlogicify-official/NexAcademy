import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle2, XCircle } from "lucide-react"

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
  error?: string
}

export function ResultPanel({ results }: { results: Results | null }) {
  if (!results) {
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
