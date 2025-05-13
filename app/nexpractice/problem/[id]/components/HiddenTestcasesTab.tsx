import React from 'react';
import { 
  Check,
  X,
  AlertTriangle,
  XCircle,
  Send,
  Loader2,
  Lock,
  Percent,
  Clock,
  Cpu,
  SkipForward,
  CheckCircle2
} from 'lucide-react';
import { Button } from '@/components/ui/button';

// Helper function to format text with proper newlines and spacing
const formatText = (text: string): string => {
  if (!text) return '';
  
  // Replace literal "\n" strings with actual newlines
  let formatted = text.replace(/\\n/g, '\n');
  
  // Replace literal "\t" strings with spaces
  formatted = formatted.replace(/\\t/g, '    ');
  
  // Handle other common escape sequences
  formatted = formatted
    .replace(/\\r/g, '')
    .replace(/\\"/g, '"')
    .replace(/\\'/g, "'");
    
  return formatted;
};

// Helper component for rendering a single test case result
const TestCaseResultCard = ({ result, idx, isFirstFailure }: { result: any, idx: number, isFirstFailure: boolean }) => {
  // Determine if this is a Time Limit Exceeded verdict
  const isTimeLimitExceeded = result.verdict === "Time Limit Exceeded" || 
                             (result.status && result.status.id === 5) ||
                             result.verdict?.toLowerCase()?.includes("time limit");
                             
  // Determine if this is a Compile Error
  const isCompileError = result.verdict === "Compilation Error" || 
                         result.verdict?.toLowerCase()?.includes("compile") ||
                         (result.compileOutput && result.compileOutput.length > 0);

  // Group verdicts by color scheme
  const isYellowVerdict = isTimeLimitExceeded || isCompileError;
  
  return (
    <div className={`bg-white dark:bg-slate-800 rounded-lg p-3 border ${
      result.isSkipped 
        ? 'border-slate-200 dark:border-slate-700/30' 
        : result.isCorrect 
          ? 'border-green-200 dark:border-green-900/30' 
          : isYellowVerdict
            ? 'border-yellow-300 dark:border-yellow-900/30'
          : 'border-red-200 dark:border-red-900/30'
    }`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className={`w-5 h-5 rounded-full flex items-center justify-center text-white text-xs font-medium mr-2 ${
            result.isSkipped
              ? 'bg-slate-400 dark:bg-slate-600'
              : result.isCorrect 
                ? 'bg-green-500' 
                : isYellowVerdict
                  ? 'bg-yellow-500'
                : 'bg-red-500'
          }`}>
            {idx + 1}
          </div>
          <span className="font-medium text-slate-700 dark:text-slate-300">
            Test Case {idx + 1}
          </span>
        </div>
        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
          result.isSkipped
            ? 'bg-slate-100 text-slate-600 dark:bg-slate-700/30 dark:text-slate-400'
            : result.isCorrect 
              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
              : isYellowVerdict
                ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
              : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
        }`}>
          {result.isSkipped 
            ? 'Skipped' 
            : result.isCorrect 
              ? 'Passed' 
              : result.verdict}
        </span>
      </div>
      
      {/* Show minimal message for skipped test cases - no details */}
      {result.isSkipped && (
        <div className="mt-2 text-sm text-slate-500 dark:text-slate-400 flex items-center">
          <SkipForward className="h-4 w-4 mr-1.5" />
          <span>Skipped</span>
        </div>
      )}
      
      {/* Show details ONLY for the first failed test case */}
      {!result.isCorrect && !result.isSkipped && isFirstFailure && (
        <div className="mt-2 text-sm border-t border-slate-100 dark:border-slate-700 pt-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <div className="space-y-1">
              <div className="font-medium text-slate-600 dark:text-slate-400">Input:</div>
              <div className="p-1.5 bg-slate-50 dark:bg-slate-900/50 rounded border border-slate-200 dark:border-slate-700/50 text-xs font-mono overflow-auto max-h-20 whitespace-pre-wrap">
                {formatText(result.input)}
              </div>
            </div>
            <div className="space-y-1">
              <div className="font-medium text-slate-600 dark:text-slate-400">Your Output:</div>
              <div className="p-1.5 bg-slate-50 dark:bg-slate-900/50 rounded border border-slate-200 dark:border-slate-700/50 text-xs font-mono overflow-auto max-h-20 whitespace-pre-wrap">
                {result.actualOutput === "Hidden (Multiple failures detected)" ? (
                  <span className="text-slate-500 italic">Details hidden (see first failing test for errors)</span>
                ) : (
                  formatText(result.actualOutput)
                )}
              </div>
            </div>
          </div>
          
          {/* Special message for Time Limit Exceeded */}
          {isTimeLimitExceeded && (
            <div className="mt-2 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded border border-yellow-100 dark:border-yellow-800/30 text-yellow-700 dark:text-yellow-400 font-medium">
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-1.5" />
                <span>Time Limit Exceeded: Your code took too long to execute. Try optimizing your algorithm.</span>
              </div>
            </div>
          )}
          
          {/* Special message for Compile Error */}
          {isCompileError && !isTimeLimitExceeded && (
            <div className="mt-2 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded border border-yellow-100 dark:border-yellow-800/30 text-yellow-700 dark:text-yellow-400 font-medium">
              <div className="flex items-center">
                <AlertTriangle className="h-4 w-4 mr-1.5" />
                <span>Compilation Error: Your code couldn't be compiled. Check for syntax errors.</span>
              </div>
              {result.compileOutput && (
                <div className="mt-2 text-xs font-mono bg-yellow-100/50 p-2 rounded whitespace-pre-wrap">
                  {formatText(result.compileOutput)}
                </div>
              )}
            </div>
          )}
          
          {/* Display error messages if any */}
          {result.stderr && !isTimeLimitExceeded && !isCompileError && (
            <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/20 rounded border border-red-100 dark:border-red-800/30 text-xs text-red-700 dark:text-red-400">
              <div className="font-medium mb-1">Error:</div>
              <pre className="whitespace-pre-wrap">{formatText(result.stderr)}</pre>
            </div>
          )}
        </div>
      )}
      
      {/* For other failed test cases, just show a minimal message */}
      {!result.isCorrect && !result.isSkipped && !isFirstFailure && (
        <div className="mt-2 text-sm flex items-center">
          {isTimeLimitExceeded ? (
            <div className="text-yellow-600 dark:text-yellow-400 flex items-center">
              <Clock className="h-4 w-4 mr-1.5" />
              <span>Time Limit Exceeded</span>
            </div>
          ) : isCompileError ? (
            <div className="text-yellow-600 dark:text-yellow-400 flex items-center">
              <AlertTriangle className="h-4 w-4 mr-1.5" />
              <span>Compilation Error</span>
            </div>
          ) : (
            <div className="text-red-500 dark:text-red-400 flex items-center">
              <X className="h-4 w-4 mr-1.5" />
              <span>Failed</span>
            </div>
          )}
        </div>
      )}
      
      {/* Show time and memory stats if available and not skipped */}
      {(result.executionTime || result.memoryUsed) && !result.isSkipped && (
        <div className="mt-2 text-xs text-slate-500 dark:text-slate-400 flex items-center">
          {result.executionTime && (
            <span className={`mr-3 flex items-center ${
              isTimeLimitExceeded ? 'text-yellow-600 dark:text-yellow-400 font-medium' : ''
            }`}>
              <Clock className="h-3 w-3 mr-1 inline" /> 
              {result.executionTime}s
            </span>
          )}
          
          {result.memoryUsed && (
            <span className="flex items-center">
              <Cpu className="h-3 w-3 mr-1 inline" /> 
              {parseInt(result.memoryUsed).toLocaleString()} KB
            </span>
          )}
        </div>
      )}
    </div>
  );
};

interface HiddenTestcasesTabProps {
  executingHiddenTestcases: boolean;
  hiddenTestResults: any[];
  totalHiddenTestcases: number;
  completedHiddenTestcases: number;
  passedHiddenTestcases: number;
  skippedHiddenTestcases?: number;
  hiddenExecutionStatus: "success" | "error" | "warning" | "info" | null;
  isRunning: boolean;
  isSubmitting: boolean;
  submitCode: () => void;
}

export function HiddenTestcasesTab({
  executingHiddenTestcases,
  hiddenTestResults,
  totalHiddenTestcases,
  completedHiddenTestcases,
  passedHiddenTestcases,
  skippedHiddenTestcases,
  hiddenExecutionStatus,
  isRunning,
  isSubmitting,
  submitCode
}: HiddenTestcasesTabProps) {
  return (
    <div className="p-4">
      {executingHiddenTestcases ? (
        <div className="space-y-4 animate-in fade-in-50 slide-in-from-bottom-3 duration-500">
          {/* Progress indicator */}
          <div className="bg-white dark:bg-slate-800/60 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700/50 shadow-sm">
            <div className="p-4 flex flex-col items-center text-center">
              <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center mb-2">
                <div className="h-5 w-5 rounded-full border-2 border-indigo-500 dark:border-indigo-400 border-t-transparent animate-spin"></div>
              </div>
              <h3 className="text-lg font-medium text-slate-800 dark:text-slate-200 mb-1">
                Executing Test Cases
              </h3>
              
              {totalHiddenTestcases > 0 ? (
                <div className="flex flex-col items-center">
                  <div className="flex items-center gap-1 text-sm text-slate-600 dark:text-slate-400">
                    <span className="font-medium">{completedHiddenTestcases}</span> 
                    <span>out of</span> 
                    <span className="font-medium">{totalHiddenTestcases}</span> 
                    <span>test cases completed</span>
                  </div>
                  
                  {/* Progress bar */}
                  <div className="w-full max-w-xs bg-slate-200 dark:bg-slate-700 rounded-full h-2 mt-2 overflow-hidden">
                    <div 
                      className={`h-full bg-indigo-500 rounded-full transition-all duration-300 ease-out ${completedHiddenTestcases === 0 ? 'animate-pulse' : ''}`} 
                      style={{ 
                        width: `${totalHiddenTestcases > 0 ? Math.round((completedHiddenTestcases / totalHiddenTestcases) * 100) : 0}%`,
                        minWidth: completedHiddenTestcases === 0 ? '5%' : '0%' // Ensure there's a small visible section when at 0%
                      }}
                    ></div>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 animate-pulse">
                  Preparing your code for execution...
                </p>
              )}
            </div>
          </div>
          
          {/* List of testcases being processed */}
          {hiddenTestResults.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300">Test Case Results:</h3>
              <div className="space-y-2">
                {hiddenTestResults.map((result, idx) => {
                  // Find the index of the first failing test case (not correct and not skipped)
                  const firstFailureIndex = hiddenTestResults.findIndex(r => !r.isCorrect && !r.isSkipped);
                  const isFirstFailure = !result.isCorrect && !result.isSkipped && idx === firstFailureIndex;
                  
                  return (
                    <TestCaseResultCard 
                      key={`result-${idx}`} 
                      result={result} 
                      idx={idx} 
                      isFirstFailure={isFirstFailure}
                    />
                  );
                })}
              </div>
            </div>
          )}
        </div>
      ) : hiddenTestResults.length > 0 ? (
        <div className="space-y-4 animate-in fade-in-50 slide-in-from-bottom-3 duration-500">
          {/* Results header with celebration for success */}
          <div className={`rounded-lg p-4 ${
            hiddenExecutionStatus === 'success' 
              ? 'bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800/30' 
              : hiddenExecutionStatus === 'warning'
                ? 'bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200 dark:border-amber-800/30'
                : hiddenTestResults.some(r => 
                    r.verdict === "Time Limit Exceeded" || 
                    (r.status && r.status.id === 5) || 
                    r.verdict?.toLowerCase()?.includes("time limit") ||
                    r.verdict === "Compilation Error" || 
                    r.verdict?.toLowerCase()?.includes("compile") || 
                    (r.compileOutput && r.compileOutput.length > 0)
                  )
                  ? 'bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200 dark:border-amber-800/30'
                  : 'bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 border border-red-200 dark:border-red-800/30'
          }`}>
            <div className="flex flex-col items-center text-center">
              {hiddenExecutionStatus === 'success' ? (
                <>
                  <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-3">
                    <Check className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                  <h2 className="text-xl font-bold text-green-800 dark:text-green-400 mb-2">
                    Congratulations!
                  </h2>
                  <p className="text-sm text-green-700 dark:text-green-300">
                    All test cases have passed successfully. Your solution is correct!
                  </p>
                </>
              ) : hiddenExecutionStatus === 'warning' ? (
                <>
                  <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mb-3">
                    <AlertTriangle className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                  </div>
                  <h2 className="text-xl font-bold text-amber-800 dark:text-amber-400 mb-2">
                    Almost There!
                  </h2>
                  <p className="text-sm text-amber-700 dark:text-amber-300">
                    Some test cases are still failing. Keep trying!
                  </p>
                </>
              ) : hiddenTestResults.some(r => 
                  r.verdict === "Time Limit Exceeded" || 
                  (r.status && r.status.id === 5) || 
                  r.verdict?.toLowerCase()?.includes("time limit") ||
                  r.verdict === "Compilation Error" || 
                  r.verdict?.toLowerCase()?.includes("compile") || 
                  (r.compileOutput && r.compileOutput.length > 0)
                ) ? (
                <>
                  <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mb-3">
                    <AlertTriangle className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                  </div>
                  <h2 className="text-xl font-bold text-amber-800 dark:text-amber-400 mb-2">
                    Needs Improvement
                  </h2>
                  <p className="text-sm text-amber-700 dark:text-amber-300">
                    {hiddenTestResults.some(r => 
                      r.verdict === "Time Limit Exceeded" || 
                      (r.status && r.status.id === 5) || 
                      r.verdict?.toLowerCase()?.includes("time limit")
                    ) 
                      ? <span>Your solution exceeded the time limit. Try optimizing your algorithm.</span>
                      : <span>Your code has compilation errors. Please fix them and try again.</span>
                    }
                  </p>
                </>
              ) : (
                <>
                  <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-3">
                    <XCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
                  </div>
                  <h2 className="text-xl font-bold text-red-800 dark:text-red-400 mb-2">
                    Needs Improvement
                  </h2>
                  <p className="text-sm text-red-700 dark:text-red-300">
                    Review the failing test cases and try again.
                  </p>
                </>
              )}
            </div>
          </div>
          
          {/* List of all testcases with results */}
          <div className="space-y-3">
            {/* Modern compact results summary */}
            <div className="bg-white dark:bg-slate-800 border rounded-lg shadow-sm overflow-hidden">
              {/* Header */}
              <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700/50 flex items-center justify-between">
                <h3 className="font-medium text-slate-700 dark:text-slate-300">Test Results Summary</h3>
                <div className="px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                  Success Rate: {(() => {
                    const executedTestsCount = hiddenTestResults.length - hiddenTestResults.filter(r => r.isSkipped).length;
                    if (executedTestsCount === 0) return "N/A";
                    return `${Math.round((passedHiddenTestcases / executedTestsCount) * 100)}%`;
                  })()}
                </div>
              </div>
              
              {/* Results stats with clean design */}
              <div className="grid grid-cols-4 divide-x divide-slate-200 dark:divide-slate-700/50">
                <div className="p-3 text-center">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400 mb-1">{passedHiddenTestcases}</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center justify-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    <span>Passed</span>
                  </div>
                </div>
                
                <div className="p-3 text-center">
                  <div className="text-2xl font-bold text-red-600 dark:text-red-400 mb-1">
                    {hiddenTestResults.filter(r => !r.isCorrect && !r.isSkipped).length}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center justify-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-red-500"></div>
                    <span>Failed</span>
                  </div>
                </div>
                
                <div className="p-3 text-center">
                  <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400 mb-1">
                    {hiddenTestResults.filter(r => !r.isCorrect && !r.isSkipped && 
                      (r.verdict === "Time Limit Exceeded" || (r.status && r.status.id === 5) || r.verdict?.toLowerCase()?.includes("time limit") || 
                      r.verdict === "Compilation Error" || r.verdict?.toLowerCase()?.includes("compile") || (r.compileOutput && r.compileOutput.length > 0))
                    ).length}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center justify-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                    <span>TLE/CE</span>
                  </div>
                </div>
                
                <div className="p-3 text-center">
                  <div className="text-2xl font-bold text-slate-600 dark:text-slate-400 mb-1">
                    {skippedHiddenTestcases ?? hiddenTestResults.filter(r => r.isSkipped).length}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center justify-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-slate-400"></div>
                    <span>Skipped</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* First failure details if any - show in a card */}
            {(() => {
              const firstFailure = hiddenTestResults.find(r => !r.isCorrect && !r.isSkipped);
              if (!firstFailure) return null;
              
              const idx = hiddenTestResults.indexOf(firstFailure);
              
              return (
                <div className="bg-white dark:bg-slate-800 border rounded-lg shadow-sm overflow-hidden">
                  <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700/50">
                    <h3 className="font-medium text-slate-700 dark:text-slate-300">First Failure Details</h3>
                  </div>
                  <div className="p-3">
                    <TestCaseResultCard 
                      result={firstFailure} 
                      idx={idx} 
                      isFirstFailure={true}
                    />
                  </div>
                </div>
              );
            })()}
            
            {/* Compact test results grid */}
            <div className="bg-white dark:bg-slate-800 border rounded-lg shadow-sm overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700/50">
                <h3 className="font-medium text-slate-700 dark:text-slate-300">All Test Cases</h3>
              </div>
              <div className="p-3">
                <div className="grid grid-cols-10 gap-1.5">
                  {hiddenTestResults.map((result, idx) => {
                    const isTimeLimitExceeded = result.verdict === "Time Limit Exceeded" || 
                                            (result.status && result.status.id === 5) ||
                                            result.verdict?.toLowerCase()?.includes("time limit");
                    
                    const isCompileError = result.verdict === "Compilation Error" || 
                                        result.verdict?.toLowerCase()?.includes("compile") ||
                                        (result.compileOutput && result.compileOutput.length > 0);
                    
                    const isYellowVerdict = isTimeLimitExceeded || isCompileError;
                    
                    // Determine color
                    let bgColor = "bg-slate-100 border-slate-200 text-slate-600";
                    let indicator = "bg-slate-400";
                    
                    if (result.isSkipped) {
                      bgColor = "bg-slate-50 border-slate-200 text-slate-400";
                      indicator = "bg-slate-400";
                    } else if (result.isCorrect) {
                      bgColor = "bg-green-50 border-green-100 text-green-700";
                      indicator = "bg-green-500";
                    } else if (isYellowVerdict) {
                      bgColor = "bg-yellow-50 border-yellow-100 text-yellow-700";
                      indicator = "bg-yellow-500";
                    } else {
                      bgColor = "bg-red-50 border-red-100 text-red-700";
                      indicator = "bg-red-500";
                    }
                    
                    return (
                      <div 
                        key={`tc-${idx}`} 
                        className={`relative p-2 border rounded text-center text-xs font-mono leading-none ${bgColor}`}
                        title={result.verdict || "No verdict"}
                      >
                        <div className={`absolute top-0.5 right-0.5 w-1.5 h-1.5 rounded-full ${indicator}`}></div>
                        {idx + 1}
                      </div>
                    );
                  })}
                </div>
                
                {/* Legend */}
                <div className="mt-4 flex flex-wrap gap-3 text-xs text-slate-500">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    <span>Passed</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-red-500"></div>
                    <span>Failed</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                    <span>TLE/CE</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-slate-400"></div>
                    <span>Skipped</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center p-8 text-center">
          <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
            <Lock className="h-8 w-8 text-slate-400 dark:text-slate-500" />
          </div>
          <h3 className="text-lg font-medium text-slate-700 dark:text-slate-300 mb-2">
            Hidden Testcases
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mb-4">
            Hidden testcases help evaluate your solution for edge cases and performance constraints.
          </p>
          <Button
            onClick={submitCode}
            disabled={isRunning || isSubmitting}
            className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white font-medium px-4 py-2 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 flex items-center space-x-1"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-1" />
                <span>Submitting...</span>
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-1" />
                <span>Submit Solution</span>
              </>
            )}
          </Button>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-3">
            Submit your solution to evaluate against hidden testcases and receive detailed analysis on performance and correctness.
          </p>
        </div>
      )}
    </div>
  );
} 