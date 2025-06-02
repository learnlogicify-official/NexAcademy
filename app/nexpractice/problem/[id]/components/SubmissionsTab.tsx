import React from "react";
import { Button } from "@/components/ui/button";
import {
  BarChart2,
  Filter,
  RefreshCw,
  AlertTriangle,
  Loader2,
  Code,
  CheckCircle,
  XCircle,
  AlertCircle,
  Database,
  Server,
  Code2,
  Calendar,
  Hash,
  FileCode,
  Copy,
  ChevronLeft,
  ChevronRight,
  Info,
  Clock,
  Zap,
} from "lucide-react";
import { Editor } from "@monaco-editor/react";

// Type definitions for props
interface SubmissionsTabProps {
  submissions: any[];
  submissionsLoading: boolean;
  submissionsError: any;
  currentPage: number;
  totalPages: number;
  selectedSubmission: any;
  fetchSubmissions: () => void;
  viewSubmissionDetails: (submission: any, e?: React.MouseEvent) => void;
  closeSubmissionDetails: () => void;
  loadSubmissionCode: (submission: any, e?: React.MouseEvent) => void;
  renderSubmissionStatus: (submission: any) => React.ReactElement;
  formatSubmissionDate: (
    date: string | Date | number | null | undefined
  ) => string;
  getLanguageColor: (language: string) => string;
  parseLanguageName: (fullName: string | undefined | null) => {
    name: string;
    version: string;
  };
  JUDGE0_LANGUAGES: any;
  getMonacoLanguage: (languageName: string) => string;
  fontSize: number;
  tabSize: number;
  appTheme: string;
  setActivePanel: (panel: "code" | "results" | "problem") => void;
  toast: any;
}

const SubmissionsTab: React.FC<SubmissionsTabProps> = ({
  submissions,
  submissionsLoading,
  submissionsError,
  currentPage,
  totalPages,
  selectedSubmission,
  fetchSubmissions,
  viewSubmissionDetails,
  closeSubmissionDetails,
  loadSubmissionCode,
  renderSubmissionStatus,
  formatSubmissionDate,
  getLanguageColor,
  parseLanguageName,
  JUDGE0_LANGUAGES,
  getMonacoLanguage,
  fontSize,
  tabSize,
  appTheme,
  setActivePanel,
  toast,
}) => (
  <div
    style={{
      borderRadius: "18px",
      overflow: "hidden",
      padding: "0",
      background:
        "linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(248, 250, 252, 0.85))",
      backdropFilter: "blur(10px)",
      border: "1px solid rgba(226, 232, 240, 0.8)",
      boxShadow:
        "0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01)",
      position: "relative",
      transition: "all 0.3s cubic-bezier(0.22, 1, 0.36, 1)",
    }}
    className="dark:!bg-gradient-to-br dark:!from-gray-900/95 dark:!to-slate-900/90 dark:!border-slate-700/40 dark:!shadow-[0_10px_25px_-5px_rgba(0,0,0,0.2),0_8px_10px_-6px_rgba(0,0,0,0.2)]"
  >
    <div className="p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 flex items-center">
          <BarChart2 className="h-5 w-5 mr-2 text-indigo-500 dark:text-indigo-400" />
          Your Submissions
        </h3>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-xs"
            disabled={submissionsLoading}
          >
            <Filter className="h-3 w-3 mr-1" />
            Filter
          </Button>
          <Button
            size="sm"
            className="h-8 text-xs bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800"
            onClick={() => fetchSubmissions()}
            disabled={submissionsLoading}
            aria-label="Refresh submissions"
          >
            <RefreshCw
              className={`h-3 w-3 mr-1 ${
                submissionsLoading ? "animate-spin" : ""
              }`}
            />
            {submissionsLoading ? "Loading..." : "Refresh"}
          </Button>
        </div>
      </div>

      {submissionsError && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/30 rounded-lg p-3 mb-4 text-red-600 dark:text-red-400 text-sm flex items-start">
          <AlertTriangle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
          <p>{submissionsError}</p>
        </div>
      )}

      {submissions.length === 0 && !submissionsLoading && !submissionsError ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
            <BarChart2 className="h-8 w-8 text-slate-400 dark:text-slate-600" />
          </div>
          <h4 className="text-lg font-medium text-slate-700 dark:text-slate-300 mb-2">
            No submissions found
          </h4>
          <p className="text-slate-500 dark:text-slate-400 max-w-sm mb-6">
            You haven't submitted any solutions to this problem yet. Write some
            code and submit it to see your results here.
          </p>
          <Button
            onClick={() => setActivePanel("code")}
            className="gap-1 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800"
          >
            <Code className="h-4 w-4 mr-1" />
            Start Coding
          </Button>
        </div>
      ) : (
        <>
          {selectedSubmission ? (
            // Detail view for a selected submission
            <div className="bg-white dark:bg-black rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
              {/* Header with back button */}
              <div className="flex items-center justify-between px-5 py-3.5 bg-gradient-to-r from-indigo-50 via-slate-50 to-indigo-50 dark:from-slate-800 dark:via-slate-800/90 dark:to-slate-800 border-b border-slate-200 dark:border-slate-700 backdrop-blur-sm">
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex items-center text-slate-700 dark:text-slate-300 hover:bg-white/50 dark:hover:bg-slate-700/50 transition-all duration-200 gap-1"
                  onClick={closeSubmissionDetails}
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span className="font-medium">Back to Submissions</span>
                </Button>
                <div className="flex items-center space-x-2">
                  <div className="px-2.5 py-1 bg-indigo-50 dark:bg-indigo-900/30 rounded-full text-xs font-medium text-indigo-700 dark:text-indigo-300 flex items-center gap-1.5 shadow-sm border border-indigo-100 dark:border-indigo-800/50">
                    <Clock className="h-3.5 w-3.5 text-indigo-500 dark:text-indigo-400" />
                    {formatSubmissionDate(selectedSubmission.submittedAt)}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs h-8 bg-white dark:bg-slate-800 border-indigo-200 dark:border-indigo-800/50 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-all duration-200"
                    onClick={(e) => loadSubmissionCode(selectedSubmission, e)}
                  >
                    <Copy className="h-3.5 w-3.5 mr-1.5" />
                    Load Code
                  </Button>
                </div>
              </div>
              {/* Top status banner based on submission status */}
              <div
                className={`w-full px-5 py-2.5 ${
                  selectedSubmission.status === "ACCEPTED"
                    ? "bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-900/30 border-b border-green-200 dark:border-green-900/30 text-green-800 dark:text-green-300"
                    : selectedSubmission.status === "FAILED" ||
                      selectedSubmission.status === "WRONG_ANSWER"
                    ? "bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-900/30 border-b border-red-200 dark:border-red-900/30 text-red-800 dark:text-red-300"
                    : "bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-900/30 border-b border-orange-200 dark:border-orange-900/30 text-orange-800 dark:text-orange-300"
                } text-sm font-medium flex items-center justify-between`}
              >
                <div className="flex items-center">
                  {selectedSubmission.status === "ACCEPTED" ? (
                    <CheckCircle className="h-4 w-4 mr-2 text-green-600 dark:text-green-400" />
                  ) : selectedSubmission.status === "FAILED" ||
                    selectedSubmission.status === "WRONG_ANSWER" ? (
                    <XCircle className="h-4 w-4 mr-2 text-red-600 dark:text-red-400" />
                  ) : (
                    <AlertCircle className="h-4 w-4 mr-2 text-orange-600 dark:text-orange-400" />
                  )}
                  <span>
                    {selectedSubmission.status === "ACCEPTED"
                      ? "Solution Accepted"
                      : selectedSubmission.status === "FAILED" ||
                        selectedSubmission.status === "WRONG_ANSWER"
                      ? "Solution Failed"
                      : selectedSubmission.status || "Submission Status"}
                  </span>
                </div>
                <div className="flex items-center text-xs">
                  {selectedSubmission.testcasesPassed !== undefined &&
                    selectedSubmission.totalTestcases !== undefined && (
                      <div className="flex items-center">
                        <span className="mr-2">Test Cases:</span>
                        <div className="flex items-center gap-1 bg-white/60 dark:bg-slate-800/60 rounded-full px-2 py-0.5 backdrop-blur-sm shadow-sm">
                          <span
                            className={
                              selectedSubmission.status === "ACCEPTED"
                                ? "text-green-600 dark:text-green-400"
                                : "text-red-600 dark:text-red-400"
                            }
                          >
                            {selectedSubmission.testcasesPassed}
                          </span>
                          <span>/</span>
                          <span>{selectedSubmission.totalTestcases}</span>
                        </div>
                      </div>
                    )}
                </div>
              </div>
              {/* Submission content */}
              <div className="p-5">
                {/* Performance metrics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
                  {/* Runtime */}
                  <div className="bg-gradient-to-br from-slate-50 to-white dark:from-slate-800 dark:to-slate-800/80 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-grid-pattern opacity-[0.015] pointer-events-none"></div>
                    <div className="absolute -top-12 -right-12 w-24 h-24 bg-indigo-500/5 dark:bg-indigo-500/10 rounded-full blur-xl"></div>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center">
                        <Clock className="h-4 w-4 mr-1.5 text-indigo-500 dark:text-indigo-400" />
                        Runtime
                      </h3>
                      <div className="text-xs px-1.5 py-0.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-md flex items-center">
                        <Zap className="h-3 w-3 mr-0.5 text-amber-500 dark:text-amber-400" />
                        Performance
                      </div>
                    </div>
                    <div className="text-3xl font-bold text-indigo-700 dark:text-indigo-300 mb-1 flex items-baseline">
                      {selectedSubmission.runtime || "N/A"}
                      <span className="ml-1 text-xs text-slate-500 dark:text-slate-400">
                        seconds
                      </span>
                    </div>
                    {selectedSubmission.executionTimePercentile && (
                      <div className="flex items-center mt-1.5 text-xs text-slate-500 dark:text-slate-400">
                        <div className="flex-1 h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400 dark:from-emerald-400 dark:to-emerald-500"
                            style={{
                              width: `${selectedSubmission.executionTimePercentile}%`,
                            }}
                          ></div>
                        </div>
                        <span className="ml-2">
                          Faster than{" "}
                          {selectedSubmission.executionTimePercentile}%
                        </span>
                      </div>
                    )}
                  </div>
                  {/* Memory */}
                  <div className="bg-gradient-to-br from-slate-50 to-white dark:from-slate-800 dark:to-slate-800/80 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-grid-pattern opacity-[0.015] pointer-events-none"></div>
                    <div className="absolute -top-12 -right-12 w-24 h-24 bg-purple-500/5 dark:bg-purple-500/10 rounded-full blur-xl"></div>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center">
                        <Database className="h-4 w-4 mr-1.5 text-purple-500 dark:text-purple-400" />
                        Memory
                      </h3>
                      <div className="text-xs px-1.5 py-0.5 bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-md flex items-center">
                        <Server className="h-3 w-3 mr-0.5 text-purple-500 dark:text-purple-400" />
                        Usage
                      </div>
                    </div>
                    <div className="text-3xl font-bold text-purple-700 dark:text-purple-300 mb-1 flex items-baseline">
                      {selectedSubmission.memory
                        ? Number(selectedSubmission.memory) > 1024
                          ? `${(
                              Number(selectedSubmission.memory) / 1024
                            ).toFixed(1)}`
                          : selectedSubmission.memory
                        : "N/A"}
                      <span className="ml-1 text-xs text-slate-500 dark:text-slate-400">
                        {selectedSubmission.memory
                          ? Number(selectedSubmission.memory) > 1024
                            ? "MB"
                            : "KB"
                          : ""}
                      </span>
                    </div>
                    {selectedSubmission.memoryPercentile && (
                      <div className="flex items-center mt-1.5 text-xs text-slate-500 dark:text-slate-400">
                        <div className="flex-1 h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-purple-500 to-purple-400 dark:from-purple-400 dark:to-purple-500"
                            style={{
                              width: `${selectedSubmission.memoryPercentile}%`,
                            }}
                          ></div>
                        </div>
                        <span className="ml-2">
                          Less than {selectedSubmission.memoryPercentile}%
                        </span>
                      </div>
                    )}
                  </div>
                  {/* Language */}
                  <div className="bg-gradient-to-br from-slate-50 to-white dark:from-slate-800 dark:to-slate-800/80 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-grid-pattern opacity-[0.015] pointer-events-none"></div>
                    <div className="absolute -top-12 -right-12 w-24 h-24 bg-blue-500/5 dark:bg-blue-500/10 rounded-full blur-xl"></div>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center">
                        <Code2 className="h-4 w-4 mr-1.5 text-blue-500 dark:text-blue-400" />
                        Language
                      </h3>
                    </div>
                    <div className="flex flex-col">
                      <div className="text-xl font-bold text-blue-700 dark:text-blue-300 flex items-center">
                        <div
                          className={`w-2.5 h-2.5 rounded-full ${getLanguageColor(
                            parseLanguageName(
                              JUDGE0_LANGUAGES[
                                selectedSubmission.language as keyof typeof JUDGE0_LANGUAGES
                              ] || "Unknown"
                            ).name
                          )} mr-2`}
                        ></div>
                        {
                          parseLanguageName(
                            JUDGE0_LANGUAGES[
                              selectedSubmission.language as keyof typeof JUDGE0_LANGUAGES
                            ] || "Unknown"
                          ).name
                        }
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 ml-4.5">
                        {
                          parseLanguageName(
                            JUDGE0_LANGUAGES[
                              selectedSubmission.language as keyof typeof JUDGE0_LANGUAGES
                            ] || "Unknown"
                          ).version
                        }
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-3 text-xs">
                      <div className="text-slate-500 dark:text-slate-400 flex items-center">
                        <Calendar className="h-3 w-3 mr-1 text-slate-400 dark:text-slate-500" />
                        {formatSubmissionDate(selectedSubmission.submittedAt)}
                      </div>
                      <div className="text-slate-500 dark:text-slate-400 flex items-center">
                        <Hash className="h-3 w-3 mr-1 text-slate-400 dark:text-slate-500" />
                        {selectedSubmission.id.substring(0, 8)}
                      </div>
                    </div>
                  </div>
                </div>
                {/* Code editor */}
                <div className="bg-gradient-to-br from-slate-50 to-white dark:from-slate-800 dark:to-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg">
                  <div className="p-1.5 bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                    <div className="flex items-center">
                      <div className="flex items-center space-x-1.5 pl-2">
                        <div className="w-3 h-3 rounded-full bg-red-500"></div>
                        <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      </div>
                      <div className="flex-1 flex justify-center">
                        <div className="px-3 py-1 text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-200/50 dark:bg-slate-700/50 rounded-full flex items-center border border-slate-300/30 dark:border-slate-600/30">
                          <FileCode className="h-3.5 w-3.5 mr-1.5 text-indigo-500 dark:text-indigo-400" />
                          Submitted Code
                        </div>
                      </div>
                      <div className="pr-2 flex items-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700"
                          onClick={(e) => {
                            if (selectedSubmission?.code) {
                              navigator.clipboard.writeText(
                                selectedSubmission.code
                              );
                              toast({
                                title: "Code copied",
                                description:
                                  "The code has been copied to your clipboard",
                              });
                            }
                          }}
                        >
                          <Copy className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500" />
                        </Button>
                      </div>
                    </div>
                  </div>
                  <div className="relative">
                    <div className="h-[500px] w-full border-0 overflow-hidden">
                      <Editor
                        height="500px"
                        defaultLanguage={getMonacoLanguage(
                          parseLanguageName(
                            JUDGE0_LANGUAGES[
                              selectedSubmission.language as keyof typeof JUDGE0_LANGUAGES
                            ] || "Unknown"
                          ).name
                        )}
                        defaultValue={
                          selectedSubmission.code || "// No code available"
                        }
                        theme={appTheme === "dark" ? "vs-dark" : "light"}
                        options={{
                          readOnly: true,
                          minimap: { enabled: true },
                          scrollBeyondLastLine: false,
                          fontSize: fontSize,
                          tabSize: tabSize,
                          wordWrap: "on",
                          lineNumbers: "on",
                          fontFamily: "JetBrains Mono, Consolas, monospace",
                          automaticLayout: true,
                        }}
                      />
                    </div>
                    <div className="absolute top-2 right-2 z-10 flex gap-1.5">
                      <div className="px-2.5 py-1 bg-slate-100/80 dark:bg-slate-700/80 backdrop-blur-sm rounded-md text-xs font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1.5 shadow-sm border border-slate-200/50 dark:border-slate-600/50">
                        <div
                          className={`w-2 h-2 rounded-full ${getLanguageColor(
                            parseLanguageName(
                              JUDGE0_LANGUAGES[
                                selectedSubmission.language as keyof typeof JUDGE0_LANGUAGES
                              ] || "Unknown"
                            ).name
                          )}`}
                        ></div>
                        {
                          parseLanguageName(
                            JUDGE0_LANGUAGES[
                              selectedSubmission.language as keyof typeof JUDGE0_LANGUAGES
                            ] || "Unknown"
                          ).name
                        }
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            // List view of all submissions
            <>
              <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700 mb-4">
                <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                  <thead className="bg-slate-50 dark:bg-slate-800">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        Runtime
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        Memory
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        Language
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        Submitted
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody
                    className={`bg-white dark:bg-black divide-y divide-slate-200 dark:divide-slate-700 ${
                      submissionsLoading ? "opacity-60" : ""
                    }`}
                  >
                    {submissionsLoading && submissions.length === 0 ? (
                      <tr>
                        <td
                          colSpan={6}
                          className="px-4 py-8 text-center text-sm text-slate-500 dark:text-slate-400"
                        >
                          <div className="flex flex-col items-center">
                            <Loader2 className="h-8 w-8 animate-spin text-indigo-500 dark:text-indigo-400 mb-3" />
                            <p>Loading submissions...</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      submissions.map((submission) => (
                        <tr
                          key={submission.id}
                          className="hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors"
                          onClick={() => viewSubmissionDetails(submission)}
                        >
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="flex items-center">
                              {renderSubmissionStatus(submission)}
                            </div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-700 dark:text-slate-300">
                            <div className="flex items-center">
                              <Clock className="h-3.5 w-3.5 mr-1 text-indigo-500 dark:text-indigo-400" />
                              <span className="mr-1 font-medium">
                                {submission.runtime
                                  ? `${submission.runtime}s`
                                  : "N/A"}
                              </span>
                              {submission.executionTimePercentile && (
                                <span className="text-xs text-slate-500 dark:text-slate-400">
                                  (faster than{" "}
                                  {submission.executionTimePercentile}%)
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-700 dark:text-slate-300">
                            <div className="flex items-center">
                              <Database className="h-3.5 w-3.5 mr-1 text-indigo-500 dark:text-indigo-400" />
                              <span className="mr-1 font-medium">
                                {submission.memory
                                  ? Number(submission.memory) > 1024
                                    ? `${(
                                        Number(submission.memory) / 1024
                                      ).toFixed(1)}MB`
                                    : `${Number(submission.memory)}KB`
                                  : "N/A"}
                              </span>
                              {submission.memoryPercentile && (
                                <span className="text-xs text-slate-500 dark:text-slate-400">
                                  (less than {submission.memoryPercentile}%)
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="text-sm text-slate-700 dark:text-slate-300 flex items-center">
                              <div
                                className={`w-2 h-2 rounded-full ${getLanguageColor(
                                  parseLanguageName(
                                    JUDGE0_LANGUAGES[
                                      submission.language as keyof typeof JUDGE0_LANGUAGES
                                    ] || "Unknown"
                                  ).name
                                )} mr-1.5`}
                              ></div>
                              {JUDGE0_LANGUAGES[
                                submission.language as keyof typeof JUDGE0_LANGUAGES
                              ] ? (
                                <div className="flex flex-col">
                                  <span className="font-medium">
                                    {
                                      parseLanguageName(
                                        JUDGE0_LANGUAGES[
                                          submission.language as keyof typeof JUDGE0_LANGUAGES
                                        ]
                                      ).name
                                    }
                                  </span>
                                  <span className="text-xs text-slate-500 dark:text-slate-400">
                                    {
                                      parseLanguageName(
                                        JUDGE0_LANGUAGES[
                                          submission.language as keyof typeof JUDGE0_LANGUAGES
                                        ]
                                      ).version
                                    }
                                  </span>
                                </div>
                              ) : (
                                "Unknown"
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                            {formatSubmissionDate(submission.submittedAt)}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                            <div className="flex space-x-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 rounded-full"
                                onClick={(e) =>
                                  loadSubmissionCode(submission, e)
                                }
                              >
                                <Copy className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              {/* Pagination - only show when in list view */}
              {!selectedSubmission && totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => fetchSubmissions()}
                    disabled={currentPage === 1 || submissionsLoading}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    <ChevronLeft className="h-4 w-4 -ml-2" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => fetchSubmissions()}
                    disabled={currentPage === 1 || submissionsLoading}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <div className="text-sm text-slate-700 dark:text-slate-300 font-medium">
                    Page {currentPage} of {totalPages}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => fetchSubmissions()}
                    disabled={currentPage === totalPages || submissionsLoading}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => fetchSubmissions()}
                    disabled={currentPage === totalPages || submissionsLoading}
                  >
                    <ChevronRight className="h-4 w-4" />
                    <ChevronRight className="h-4 w-4 -ml-2" />
                  </Button>
                </div>
              )}
              {/* Stats Summary - only show in list view */}
              {!selectedSubmission && submissions.length > 0 && (
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4 text-sm text-slate-700 dark:text-slate-300 flex flex-col md:flex-row md:items-center justify-between gap-4 mt-4">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                      <span>
                        Accepted:{" "}
                        {
                          submissions.filter((s) => s.status === "ACCEPTED")
                            .length
                        }
                      </span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
                      <span>
                        Failed:{" "}
                        {
                          submissions.filter((s) => s.status !== "ACCEPTED")
                            .length
                        }
                      </span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
                      <span>Total: {submissions.length}</span>
                    </div>
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center">
                    <Info className="h-3.5 w-3.5 mr-1.5 text-indigo-500 dark:text-indigo-400" />
                    Submissions are scored based on runtime and memory usage
                  </div>
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  </div>
);

export default SubmissionsTab;
