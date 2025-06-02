import React from "react";
import { Play, Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface RunSubmitButtonsProps {
  runCode: () => void;
  submitCode: () => void;
  isRunning: boolean;
  isSubmitting: boolean;
  loadingPhrase: string;
  isMobile?: boolean;
}

const RunSubmitButtons: React.FC<RunSubmitButtonsProps> = ({
  runCode,
  submitCode,
  isRunning,
  isSubmitting,
  loadingPhrase,
  isMobile = false,
}) => {
  if (isMobile) {
    return (
      <div className="flex items-center gap-1.5">
        <Button
          size="sm"
          variant="outline"
          className="h-8 px-2 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800/50"
          onClick={runCode}
          disabled={isRunning}
        >
          {isRunning ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Play className="h-3.5 w-3.5" />
          )}
          {!isRunning && <span className="text-xs ml-1">Run</span>}
        </Button>
        <Button
          size="sm"
          className="h-8 px-2 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white"
          onClick={submitCode}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Send className="h-3.5 w-3.5" />
          )}
          {!isSubmitting && <span className="text-xs ml-1">Submit</span>}
        </Button>
      </div>
    );
  }

  return (
    <div className="hidden md:flex flex-1 items-center justify-center gap-3 mx-4 px-4 border-x border-indigo-100 dark:border-indigo-900/40 min-w-0">
      <Button
        size="sm"
        className="bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white shadow-sm gap-1 min-w-28 relative overflow-hidden group transition-all duration-200 hover:shadow-md"
        onClick={runCode}
        disabled={isRunning}
      >
        {isRunning ? (
          <>
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-purple-500 to-indigo-600 animate-gradient-x"></div>
            <div className="relative z-10 flex items-center space-x-1">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-pink-500"></span>
              </span>
              <span className="text-sm font-medium text-white animate-pulse">
                {loadingPhrase || "Processing..."}
              </span>
            </div>
          </>
        ) : (
          <>
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-indigo-700 transition-all duration-300 group-hover:scale-105"></div>
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/20"></div>
            <span className="relative z-10 flex items-center">
              <Play className="h-4 w-4 mr-1.5" />
              Run Code
            </span>
          </>
        )}
      </Button>

      <Button
        variant="outline"
        size="sm"
        className="text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-700/50 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 hover:text-indigo-800 dark:hover:text-indigo-200 transition-all duration-200 gap-1 min-w-28 relative overflow-hidden group"
        onClick={submitCode}
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <>
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-100 via-purple-100 to-indigo-100 dark:from-indigo-900/30 dark:via-purple-900/30 dark:to-indigo-900/30 animate-gradient-x"></div>
            <div className="relative z-10 flex items-center space-x-1">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
              </span>
              <span className="text-xs font-medium text-indigo-700 dark:text-indigo-300 animate-pulse truncate max-w-24">
                Submitting...
              </span>
            </div>
          </>
        ) : (
          <>
            <div className="absolute inset-0 bg-gradient-to-r from-white to-slate-100 dark:from-slate-900 dark:to-slate-800/80 opacity-50 group-hover:opacity-80 transition-all duration-300"></div>
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-200/80 dark:bg-indigo-700/40 group-hover:bg-indigo-300 dark:group-hover:bg-indigo-600/40 transition-colors"></div>
            <span className="relative z-10 flex items-center">
              <Send className="h-4 w-4 mr-1.5" />
              Submit
            </span>
          </>
        )}
      </Button>
    </div>
  );
};

export default RunSubmitButtons;
