"use client";
import {
  Check,
  X,
  AlertTriangle,
  XCircle,
  Loader2,
  Lock,
  Clock,
  Cpu,
  SkipForward,
  CheckCircle2,
  TrendingUp,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

// Helper function to format text with proper newlines and spacing
const formatText = (text: string): string => {
  if (!text) return "";

  let formatted = text.replace(/\\n/g, "\n");
  formatted = formatted.replace(/\\t/g, "    ");
  formatted = formatted
    .replace(/\\r/g, "")
    .replace(/\\"/g, '"')
    .replace(/\\'/g, "'");

  return formatted;
};

// Helper component for rendering a single test case result
const TestCaseResultCard = ({
  result,
  idx,
  isFirstFailure,
}: {
  result: any;
  idx: number;
  isFirstFailure: boolean;
}) => {
  const isTimeLimitExceeded =
    result.verdict === "Time Limit Exceeded" ||
    (result.status && result.status.id === 5) ||
    result.verdict?.toLowerCase()?.includes("time limit");

  const isCompileError =
    result.verdict === "Compilation Error" ||
    result.verdict?.toLowerCase()?.includes("compile") ||
    (result.compileOutput && result.compileOutput.length > 0);

  const isYellowVerdict = isTimeLimitExceeded || isCompileError;

  return (
    <div
      className={`bg-white dark:bg-[#1a1a1a] rounded-lg border transition-all duration-200 hover:shadow-md ${
        result.isSkipped
          ? "border-gray-200 dark:border-gray-700"
          : result.isCorrect
          ? "border-green-200 dark:border-green-800 bg-green-50/30 dark:bg-green-900/10"
          : isYellowVerdict
          ? "border-amber-200 dark:border-amber-800 bg-amber-50/30 dark:bg-amber-900/10"
          : "border-red-200 dark:border-red-800 bg-red-50/30 dark:bg-red-900/10"
      }`}
    >
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-semibold ${
                result.isSkipped
                  ? "bg-gray-400 dark:bg-gray-600"
                  : result.isCorrect
                  ? "bg-green-500"
                  : isYellowVerdict
                  ? "bg-amber-500"
                  : "bg-red-500"
              }`}
            >
              {result.isSkipped ? (
                <SkipForward className="w-4 h-4" />
              ) : result.isCorrect ? (
                <Check className="w-4 h-4" />
              ) : (
                <X className="w-4 h-4" />
              )}
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                Test Case {idx + 1}
              </h4>
              {(result.executionTime || result.memoryUsed) &&
                !result.isSkipped && (
                  <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {result.executionTime && (
                      <span
                        className={`flex items-center gap-1 ${
                          isTimeLimitExceeded
                            ? "text-amber-600 dark:text-amber-400 font-medium"
                            : ""
                        }`}
                      >
                        <Clock className="w-3 h-3" />
                        {result.executionTime}s
                      </span>
                    )}
                    {result.memoryUsed && (
                      <span className="flex items-center gap-1">
                        <Cpu className="w-3 h-3" />
                        {Number.parseInt(result.memoryUsed).toLocaleString()} KB
                      </span>
                    )}
                  </div>
                )}
            </div>
          </div>
          <Badge
            variant={
              result.isSkipped
                ? "secondary"
                : result.isCorrect
                ? "default"
                : isYellowVerdict
                ? "destructive"
                : "destructive"
            }
            className={
              result.isSkipped
                ? "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                : result.isCorrect
                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                : isYellowVerdict
                ? "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300"
                : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
            }
          >
            {result.isSkipped
              ? "Skipped"
              : result.isCorrect
              ? "Passed"
              : result.verdict}
          </Badge>
        </div>

        {/* Show details ONLY for the first failed test case */}
        {!result.isCorrect && !result.isSkipped && isFirstFailure && (
          <div className="space-y-4 pt-4 border-t border-gray-100 dark:border-gray-700">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Input:
                </label>
                <div className="p-3 bg-gray-50 dark:bg-[black] rounded-md border border-gray-200 dark:border-[#4c4c4c] text-sm font-mono overflow-auto max-h-32">
                  <pre className="whitespace-pre-wrap text-gray-800 dark:text-gray-200">
                    {formatText(result.input)}
                  </pre>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Your Output:
                </label>
                <div className="p-3 bg-gray-50 dark:bg-[black] rounded-md border border-gray-200 dark:border-[#4c4c4c] text-sm font-mono overflow-auto max-h-32">
                  <pre className="whitespace-pre-wrap text-gray-800 dark:text-gray-200">
                    {result.actualOutput ===
                    "Hidden (Multiple failures detected)" ? (
                      <span className="text-gray-500 italic">
                        Details hidden (see first failing test for errors)
                      </span>
                    ) : (
                      formatText(result.actualOutput)
                    )}
                  </pre>
                </div>
              </div>
            </div>

            {/* Special messages */}
            {isTimeLimitExceeded && (
              <div className="flex items-start gap-3 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-md border border-amber-200 dark:border-amber-800">
                <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-amber-800 dark:text-amber-300">
                    Time Limit Exceeded
                  </p>
                  <p className="text-sm text-amber-700 dark:text-amber-400 mt-1">
                    Your code took too long to execute. Consider optimizing your
                    algorithm for better time complexity.
                  </p>
                </div>
              </div>
            )}

            {isCompileError && !isTimeLimitExceeded && (
              <div className="flex items-start gap-3 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-md border border-amber-200 dark:border-amber-800">
                <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="font-medium text-amber-800 dark:text-amber-300">
                    Compilation Error
                  </p>
                  <p className="text-sm text-amber-700 dark:text-amber-400 mt-1">
                    Your code couldn't be compiled. Check for syntax errors.
                  </p>
                  {result.compileOutput && (
                    <div className="mt-2 p-2 bg-amber-100/50 dark:bg-amber-900/30 rounded text-xs font-mono">
                      <pre className="whitespace-pre-wrap">
                        {formatText(result.compileOutput)}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            )}

            {result.stderr && !isTimeLimitExceeded && !isCompileError && (
              <div className="flex items-start gap-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-md border border-red-200 dark:border-red-800">
                <XCircle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="font-medium text-red-800 dark:text-red-300">
                    Runtime Error
                  </p>
                  <div className="mt-2 p-2 bg-red-100/50 dark:bg-red-900/30 rounded text-xs font-mono">
                    <pre className="whitespace-pre-wrap">
                      {formatText(result.stderr)}
                    </pre>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
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
  submitCode,
}: HiddenTestcasesTabProps) {
  const progressPercentage =
    totalHiddenTestcases > 0
      ? (completedHiddenTestcases / totalHiddenTestcases) * 100
      : 0;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {executingHiddenTestcases ? (
        <div className="space-y-6">
          {/* Execution Progress */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-blue-600 dark:text-blue-400 animate-spin" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                Running Test Cases
              </h3>

              {totalHiddenTestcases > 0 ? (
                <div className="space-y-4">
                  <p className="text-gray-600 dark:text-gray-400">
                    <span className="font-semibold text-blue-600 dark:text-blue-400">
                      {completedHiddenTestcases}
                    </span>{" "}
                    of{" "}
                    <span className="font-semibold">
                      {totalHiddenTestcases}
                    </span>{" "}
                    test cases completed
                  </p>

                  <div className="max-w-md mx-auto">
                    <Progress value={progressPercentage} className="h-2" />
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                      {Math.round(progressPercentage)}% complete
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-gray-600 dark:text-gray-400">
                  Preparing your code for execution...
                </p>
              )}
            </div>
          </div>

          {/* Live Results */}
          {hiddenTestResults.length > 0 && (
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Test Results
              </h4>
              <div className="space-y-3">
                {hiddenTestResults.map((result, idx) => {
                  const firstFailureIndex = hiddenTestResults.findIndex(
                    (r) => !r.isCorrect && !r.isSkipped
                  );
                  const isFirstFailure =
                    !result.isCorrect &&
                    !result.isSkipped &&
                    idx === firstFailureIndex;

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
        <div className="space-y-6">
          {/* Results Header */}
          <div
            className={`rounded-xl p-6 text-center ${
              hiddenExecutionStatus === "success"
                ? "bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800"
                : hiddenExecutionStatus === "warning" ||
                  hiddenTestResults.some(
                    (r) =>
                      r.verdict === "Time Limit Exceeded" ||
                      r.verdict?.toLowerCase()?.includes("time limit") ||
                      r.verdict === "Compilation Error" ||
                      r.verdict?.toLowerCase()?.includes("compile")
                  )
                ? "bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200 dark:border-amber-800"
                : "bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 border border-red-200 dark:border-red-800"
            }`}
          >
            {hiddenExecutionStatus === "success" ? (
              <>
                <div className="w-16 h-16 mx-auto mb-4 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-400" />
                </div>
                <h2 className="text-2xl font-bold text-green-800 dark:text-green-300 mb-2">
                  🎉 Excellent Work!
                </h2>
                <p className="text-green-700 dark:text-green-400">
                  All test cases passed successfully. Your solution is correct
                  and efficient!
                </p>
              </>
            ) : (
              <>
                <div
                  className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${
                    hiddenTestResults.some(
                      (r) =>
                        r.verdict === "Time Limit Exceeded" ||
                        r.verdict?.toLowerCase()?.includes("time limit") ||
                        r.verdict === "Compilation Error" ||
                        r.verdict?.toLowerCase()?.includes("compile")
                    )
                      ? "bg-amber-100 dark:bg-amber-900/30"
                      : "bg-red-100 dark:bg-red-900/30"
                  }`}
                >
                  {hiddenTestResults.some(
                    (r) =>
                      r.verdict === "Time Limit Exceeded" ||
                      r.verdict?.toLowerCase()?.includes("time limit") ||
                      r.verdict === "Compilation Error" ||
                      r.verdict?.toLowerCase()?.includes("compile")
                  ) ? (
                    <AlertTriangle className="w-8 h-8 text-amber-600 dark:text-amber-400" />
                  ) : (
                    <XCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
                  )}
                </div>
                <h2
                  className={`text-2xl font-bold mb-2 ${
                    hiddenTestResults.some(
                      (r) =>
                        r.verdict === "Time Limit Exceeded" ||
                        r.verdict?.toLowerCase()?.includes("time limit") ||
                        r.verdict === "Compilation Error" ||
                        r.verdict?.toLowerCase()?.includes("compile")
                    )
                      ? "text-amber-800 dark:text-amber-300"
                      : "text-red-800 dark:text-red-300"
                  }`}
                >
                  Keep Going!
                </h2>
                <p
                  className={
                    hiddenTestResults.some(
                      (r) =>
                        r.verdict === "Time Limit Exceeded" ||
                        r.verdict?.toLowerCase()?.includes("time limit") ||
                        r.verdict === "Compilation Error" ||
                        r.verdict?.toLowerCase()?.includes("compile")
                    )
                      ? "text-amber-700 dark:text-amber-400"
                      : "text-red-700 dark:text-red-400"
                  }
                >
                  {hiddenTestResults.some(
                    (r) =>
                      r.verdict === "Time Limit Exceeded" ||
                      r.verdict?.toLowerCase()?.includes("time limit")
                  )
                    ? "Your solution exceeded the time limit. Try optimizing your algorithm."
                    : hiddenTestResults.some(
                        (r) =>
                          r.verdict === "Compilation Error" ||
                          r.verdict?.toLowerCase()?.includes("compile")
                      )
                    ? "Your code has compilation errors. Please fix them and try again."
                    : "Some test cases are failing. Review the details below and refine your solution."}
                </p>
              </>
            )}
          </div>

          {/* Statistics Dashboard */}
          <div className="bg-white dark:bg-[#2a2a2a] rounded-xl border border-gray-200 dark:border-[#4c4c4c] overflow-hidden shadow-sm">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-[#4c4c4c]">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Test Results Overview
                </h3>
                <Badge variant="outline" className="text-sm">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  {(() => {
                    const executedTestsCount =
                      hiddenTestResults.length -
                      hiddenTestResults.filter((r) => r.isSkipped).length;
                    if (executedTestsCount === 0) return "N/A";
                    return `${Math.round(
                      (passedHiddenTestcases / executedTestsCount) * 100
                    )}% Success Rate`;
                  })()}
                </Badge>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-gray-200 dark:divide-[#4c4c4c]">
              <div className="p-6 text-center">
                <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">
                  {passedHiddenTestcases}
                </div>
                <div className="flex items-center justify-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span>Passed</span>
                </div>
              </div>

              <div className="p-6 text-center">
                <div className="text-3xl font-bold text-red-600 dark:text-red-400 mb-2">
                  {
                    hiddenTestResults.filter(
                      (r) =>
                        !r.isCorrect &&
                        !r.isSkipped &&
                        !(
                          r.verdict === "Time Limit Exceeded" ||
                          r.verdict?.toLowerCase()?.includes("time limit") ||
                          r.verdict === "Compilation Error" ||
                          r.verdict?.toLowerCase()?.includes("compile")
                        )
                    ).length
                  }
                </div>
                <div className="flex items-center justify-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <span>Failed</span>
                </div>
              </div>

              <div className="p-6 text-center">
                <div className="text-3xl font-bold text-amber-600 dark:text-amber-400 mb-2">
                  {
                    hiddenTestResults.filter(
                      (r) =>
                        !r.isCorrect &&
                        !r.isSkipped &&
                        (r.verdict === "Time Limit Exceeded" ||
                          r.verdict?.toLowerCase()?.includes("time limit") ||
                          r.verdict === "Compilation Error" ||
                          r.verdict?.toLowerCase()?.includes("compile"))
                    ).length
                  }
                </div>
                <div className="flex items-center justify-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                  <span>TLE/CE</span>
                </div>
              </div>

              <div className="p-6 text-center">
                <div className="text-3xl font-bold text-gray-600 dark:text-gray-400 mb-2">
                  {skippedHiddenTestcases ??
                    hiddenTestResults.filter((r) => r.isSkipped).length}
                </div>
                <div className="flex items-center justify-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <div className="w-3 h-3 rounded-full bg-gray-400"></div>
                  <span>Skipped</span>
                </div>
              </div>
            </div>
          </div>

          {/* First Failure Details */}
          {(() => {
            const firstFailure = hiddenTestResults.find(
              (r) => !r.isCorrect && !r.isSkipped
            );
            if (!firstFailure) return null;

            const idx = hiddenTestResults.indexOf(firstFailure);

            return (
              <div className="bg-white dark:bg-[#1a1a1a] rounded-xl border border-gray-200 dark:border-[#4c4c4c] overflow-hidden shadow-sm">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-[#4c4c4c]">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    First Failure Analysis
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Detailed breakdown of the first test case that failed
                  </p>
                </div>
                <div className="p-6">
                  <TestCaseResultCard
                    result={firstFailure}
                    idx={idx}
                    isFirstFailure={true}
                  />
                </div>
              </div>
            );
          })()}

          {/* All Test Cases Grid */}
          <div className="bg-white dark:bg-[#2a2a2a] rounded-xl border border-gray-200 dark:border-[#4c4c4c] overflow-hidden shadow-sm">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-[#4c4c4c]">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                All Test Cases
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Overview of all {hiddenTestResults.length} test cases
              </p>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-10 sm:grid-cols-15 lg:grid-cols-20 gap-2 mb-6">
                {hiddenTestResults.map((result, idx) => {
                  const isTimeLimitExceeded =
                    result.verdict === "Time Limit Exceeded" ||
                    result.verdict?.toLowerCase()?.includes("time limit");
                  const isCompileError =
                    result.verdict === "Compilation Error" ||
                    result.verdict?.toLowerCase()?.includes("compile");
                  const isYellowVerdict = isTimeLimitExceeded || isCompileError;

                  return (
                    <div
                      key={`tc-${idx}`}
                      className={`relative aspect-square rounded-lg border-2 flex items-center justify-center text-xs font-semibold transition-all duration-200 hover:scale-110 cursor-pointer ${
                        result.isSkipped
                          ? "bg-gray-100 border-gray-300 text-gray-600 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-400"
                          : result.isCorrect
                          ? "bg-green-100 border-green-300 text-green-800 dark:bg-green-900/30 dark:border-green-600 dark:text-green-300"
                          : isYellowVerdict
                          ? "bg-amber-100 border-amber-300 text-amber-800 dark:bg-amber-900/30 dark:border-amber-600 dark:text-amber-300"
                          : "bg-red-100 border-red-300 text-red-800 dark:bg-red-900/30 dark:border-red-600 dark:text-red-300"
                      }`}
                      title={`Test Case ${idx + 1}: ${
                        result.verdict || "No verdict"
                      }`}
                    >
                      {idx + 1}
                      <div
                        className={`absolute -top-1 -right-1 w-3 h-3 rounded-full ${
                          result.isSkipped
                            ? "bg-gray-400"
                            : result.isCorrect
                            ? "bg-green-500"
                            : isYellowVerdict
                            ? "bg-amber-500"
                            : "bg-red-500"
                        }`}
                      ></div>
                    </div>
                  );
                })}
              </div>

              {/* Legend */}
              <div className="flex flex-wrap gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-green-500"></div>
                  <span className="text-gray-700 dark:text-gray-300">
                    Passed
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-red-500"></div>
                  <span className="text-gray-700 dark:text-gray-300">
                    Wrong Answer
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-amber-500"></div>
                  <span className="text-gray-700 dark:text-gray-300">
                    Time Limit / Compile Error
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-gray-400"></div>
                  <span className="text-gray-700 dark:text-gray-300">
                    Skipped
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-full flex items-center justify-center">
            <Lock className="w-10 h-10 text-blue-600 dark:text-blue-400" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-3">
            Hidden Test Cases
          </h3>
          <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto mb-8 leading-relaxed">
            Submit your solution to evaluate it against comprehensive test cases
            that check for edge cases, performance constraints, and correctness.
          </p>
          <Button
            onClick={submitCode}
            disabled={isRunning || isSubmitting}
            size="lg"
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold px-8 py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                Submitting Solution...
              </>
            ) : (
              <>
                <Zap className="w-5 h-5 mr-2" />
                Submit Solution
              </>
            )}
          </Button>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-4 max-w-sm mx-auto">
            Get instant feedback on your solution's performance, time
            complexity, and correctness across all test scenarios.
          </p>
        </div>
      )}
    </div>
  );
}
