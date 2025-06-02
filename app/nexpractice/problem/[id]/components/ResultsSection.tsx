import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, BarChart2, Sparkles } from "lucide-react";
import SampleTestcaseTab from "./SampleTestcaseTab";
import { HiddenTestcasesTab } from "./HiddenTestcasesTab";
import CustomTestcaseTab from "./CustomTestcaseTab";

interface ResultsSectionProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  showEvaluatingSkeletons: boolean;
  skeletonTab: "sample" | "hidden" | null;
  sampleTestResults: any[];
  sampleExecutionStatus: string | null;
  formatTestCase: (content: string) => React.ReactNode;
  examples: any[];
  copiedInput: boolean;
  copiedOutput: boolean;
  setCopiedInput: (copied: boolean) => void;
  setCopiedOutput: (copied: boolean) => void;
  executingHiddenTestcases: boolean;
  hiddenTestResults: any[];
  totalHiddenTestcases: number;
  completedHiddenTestcases: number;
  passedHiddenTestcases: number;
  skippedHiddenTestcases: number;
  hiddenExecutionStatus: "success" | "error" | "warning" | "info" | null;
  isRunning: boolean;
  isSubmitting: boolean;
  submitCode: () => void;
  showCelebration: boolean;
  hasMounted: boolean;
  isMobile: boolean;
  editorHeight: number;
  style?: React.CSSProperties;
  runCustomTestcase?: (input: string) => void;
  customTestResult?: {
    input: string;
    output: string;
    isCorrect: boolean;
    executionTime?: string;
    memoryUsed?: string;
    status?: string;
  } | null;
}

export default function ResultsSection({
  activeTab,
  setActiveTab,
  showEvaluatingSkeletons,
  skeletonTab,
  sampleTestResults,
  sampleExecutionStatus,
  formatTestCase,
  examples,
  copiedInput,
  copiedOutput,
  setCopiedInput,
  setCopiedOutput,
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
  showCelebration,
  hasMounted,
  isMobile,
  editorHeight,
  style,
  runCustomTestcase,
  customTestResult,
}: ResultsSectionProps) {
  return (
    <div
      className={`flex flex-col overflow-hidden rounded-lg ${
        hasMounted && isMobile
          ? activeTab === "results"
            ? "block"
            : "hidden"
          : ""
      } ${hasMounted && isMobile ? "pb-24" : ""}`}
      style={{
        flexBasis: hasMounted && isMobile ? "100%" : `${100 - editorHeight}%`,
        flexGrow: 0,
        flexShrink: 0,
        minHeight: 0,
        maxHeight: hasMounted && isMobile ? "100%" : `${100 - editorHeight}%`,
        height: hasMounted && isMobile ? "100%" : undefined,
        transition: "all 0.3s ease-in-out",
        ...style,
      }}
    >
      <div className="flex-1 bg-white dark:bg-[#1f1f1f] pb-20">
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full relative z-10"
        >
          <TabsList className="flex justify-start gap-2 px-3 border-none p-2 rounded-none shrink-0 bg-white dark:bg-[#292929]">
            <TabsTrigger
              value="sample"
              className="px-3 py-2 text-sm border-r bg-transparent data-[state=active]:font-semibold data-[state=active]:opacity-100 opacity-50 hover:opacity-90 hover:bg-[#3f3f3f] transition-colors duration-300"
            >
              <FileText className="h-4 w-4 mr-1.5 text-indigo-500/70 dark:text-indigo-400/70 group-data-[state=active]:text-indigo-600 dark:group-data-[state=active]:text-indigo-400" />
              Sample Testcases
            </TabsTrigger>
            <TabsTrigger
              value="hidden"
              className="px-3 py-2 text-sm font-medium border-r bg-transparent data-[state=active]:font-semibold data-[state=active]:opacity-100 opacity-50 hover:opacity-90 hover:bg-[#3f3f3f] transition-colors duration-300"
            >
              <BarChart2 className="h-4 w-4 mr-1.5 text-indigo-500/70 dark:text-indigo-400/70 group-data-[state=active]:text-indigo-600 dark:group-data-[state=active]:text-indigo-400" />
              Hidden Testcases
            </TabsTrigger>
            <TabsTrigger
              value="custom"
              className="px-3 py-2 text-sm border-r bg-transparent data-[state=active]:font-semibold data-[state=active]:opacity-100 opacity-50 hover:opacity-90 hover:bg-[#3f3f3f] transition-colors duration-300"
            >
              <Sparkles className="h-4 w-4 mr-1.5 text-indigo-500/70 dark:text-indigo-400/70 group-data-[state=active]:text-indigo-600 dark:group-data-[state=active]:text-indigo-400" />
              Custom Testcase
            </TabsTrigger>
          </TabsList>

          <TabsContent
            value="sample"
            className="focus-visible:outline-none focus-visible:ring-0 p-4"
          >
            <SampleTestcaseTab
              showEvaluatingSkeletons={showEvaluatingSkeletons}
              skeletonTab={skeletonTab}
              sampleTestResults={sampleTestResults}
              activeTab={activeTab}
              sampleExecutionStatus={sampleExecutionStatus}
              formatTestCase={formatTestCase}
              examples={examples}
              copiedInput={copiedInput}
              copiedOutput={copiedOutput}
              setCopiedInput={setCopiedInput}
              setCopiedOutput={setCopiedOutput}
            />
          </TabsContent>

          <TabsContent
            value="hidden"
            className="focus-visible:outline-none focus-visible:ring-0"
          >
            <HiddenTestcasesTab
              executingHiddenTestcases={executingHiddenTestcases}
              hiddenTestResults={hiddenTestResults}
              totalHiddenTestcases={totalHiddenTestcases}
              completedHiddenTestcases={completedHiddenTestcases}
              passedHiddenTestcases={passedHiddenTestcases}
              skippedHiddenTestcases={skippedHiddenTestcases}
              hiddenExecutionStatus={hiddenExecutionStatus}
              isRunning={isRunning}
              isSubmitting={isSubmitting}
              submitCode={submitCode}
            />
          </TabsContent>

          <TabsContent
            value="custom"
            className="focus-visible:outline-none focus-visible:ring-0"
          >
            <CustomTestcaseTab
              isRunning={isRunning}
              runCustomTestcase={runCustomTestcase}
              customTestResult={customTestResult}
            />
          </TabsContent>

          {showCelebration && (
            <div className="fixed inset-0 pointer-events-none z-50">
              {/* This div is just a container for the confetti effect */}
            </div>
          )}
        </Tabs>
      </div>
    </div>
  );
}
