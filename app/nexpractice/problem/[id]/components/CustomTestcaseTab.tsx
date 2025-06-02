import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Play, Loader2 } from "lucide-react";

interface CustomTestcaseTabProps {
  isRunning: boolean;
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

export default function CustomTestcaseTab({
  isRunning,
  runCustomTestcase,
  customTestResult,
}: CustomTestcaseTabProps) {
  const [customInput, setCustomInput] = useState("");

  const handleRunCustomTest = () => {
    if (runCustomTestcase && customInput.trim()) {
      runCustomTestcase(customInput);
    }
  };

  return (
    <div className="p-4 space-y-4">
      <div className="bg-white dark:bg-[#1a1a1a] rounded-lg shadow-sm overflow-hidden border border-slate-200 dark:border-[#333333]">
        <div className="px-4 py-3 border-b border-slate-200 dark:border-[#333333] bg-slate-50 dark:bg-[#292929]">
          <h3 className="text-sm font-medium">Custom Input</h3>
        </div>
        <div className="p-4">
          <Textarea
            placeholder="Enter your custom input here..."
            className="min-h-[120px] font-mono text-sm bg-white dark:bg-[#1f1f1f] border-slate-200 dark:border-[#333333]"
            value={customInput}
            onChange={(e) => setCustomInput(e.target.value)}
            disabled={isRunning}
          />
          <div className="mt-3 flex justify-end">
            <Button
              onClick={handleRunCustomTest}
              disabled={isRunning || !customInput.trim()}
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              {isRunning ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Running...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Run
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {customTestResult && (
        <div className="bg-white dark:bg-[#1a1a1a] rounded-lg shadow-sm overflow-hidden border border-slate-200 dark:border-[#333333]">
          <div className="px-4 py-3 border-b border-slate-200 dark:border-[#333333] bg-slate-50 dark:bg-[#292929]">
            <h3 className="text-sm font-medium">Output</h3>
          </div>
          <div className="p-4">
            <pre className="whitespace-pre-wrap font-mono text-sm bg-slate-50 dark:bg-[#1f1f1f] p-3 rounded-md border border-slate-200 dark:border-[#333333] overflow-auto max-h-[200px]">
              {customTestResult.output || "No output"}
            </pre>

            {customTestResult.executionTime && (
              <div className="mt-3 text-xs text-slate-500 dark:text-slate-400">
                <span className="mr-3">
                  Execution Time: {customTestResult.executionTime}
                </span>
                {customTestResult.memoryUsed && (
                  <span>Memory Used: {customTestResult.memoryUsed}</span>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
