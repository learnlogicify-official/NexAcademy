import React from "react";
import { Button } from "@/components/ui/button";
import { BookOpenCheck, Code, Crown } from "lucide-react";

const SolutionTab = () => (
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
    className="group hover:translate-y-[-2px] dark:!bg-gradient-to-br dark:!from-gray-900/95 dark:!to-slate-900/90 dark:!border-slate-700/40 dark:!shadow-[0_10px_25px_-5px_rgba(0,0,0,0.2),0_8px_10px_-6px_rgba(0,0,0,0.2)]"
  >
    {/* Premium top accent bar */}
    <div
      style={{
        height: "3px",
        width: "100%",
        background: "linear-gradient(to right, #6366f1, #8b5cf6, #d946ef)",
        opacity: 0.8,
      }}
    ></div>
    <div className="flex flex-col items-center justify-center py-12">
      <div className="relative w-16 h-16 mb-4">
        <div className="absolute inset-0 rounded-full bg-indigo-100 dark:bg-indigo-900/30 animate-pulse"></div>
        <div className="absolute inset-4 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 opacity-20 blur-lg animate-pulse delay-75"></div>
        <div className="absolute inset-0 rounded-full flex items-center justify-center">
          <BookOpenCheck className="h-10 w-10 relative z-10 text-indigo-500 dark:text-indigo-400 animate-float" />
        </div>
      </div>
      <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-2">
        Solution Locked
      </h3>
      <p className="text-slate-600 dark:text-slate-400 text-center max-w-sm">
        Solutions will be available after you successfully solve the problem or
        unlock with premium access.
      </p>
      <div className="mt-6 flex items-center gap-4">
        <Button
          variant="outline"
          size="sm"
          className="gap-1 bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 dark:hover:from-indigo-900/40 dark:hover:to-purple-900/40 text-indigo-700 dark:text-indigo-30 border-indigo-200 dark:border-indigo-800/50"
        >
          <Code className="h-3.5 w-3.5 mr-1" />
          Solve First
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="gap-1 bg-gradient-to-r from-amber-50 to-orange-50 hover:from-amber-100/80 hover:to-orange-100/80 dark:from-amber-900/20 dark:to-orange-900/20 dark:hover:from-amber-900/40 dark:hover:to-orange-900/40 text-amber-700 dark:text-amber-30 border-amber-200 dark:border-amber-800/50"
        >
          <Crown className="h-3.5 w-3.5 mr-1" />
          Premium Access
        </Button>
      </div>
    </div>
  </div>
);

export default SolutionTab;
