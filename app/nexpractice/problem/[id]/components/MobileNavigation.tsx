import React from "react";
import { FileText, Code, Terminal } from "lucide-react";

interface MobileNavigationProps {
  activePanel: "problem" | "code" | "results";
  setActivePanel: (panel: "problem" | "code" | "results") => void;
}

const MobileNavigation: React.FC<MobileNavigationProps> = ({
  activePanel,
  setActivePanel,
}) => {
  return (
    <div className="md:hidden fixed bottom-8 left-0 right-0 flex justify-center z-50 px-4">
      <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-full p-1.5 flex items-center w-full max-w-xs shadow-xl border border-indigo-100/50 dark:border-indigo-800/30">
        <button
          onClick={() => setActivePanel("problem")}
          className={`flex-1 py-2.5 px-3 rounded-full flex items-center justify-center gap-1.5 text-xs font-medium transition-all duration-300
          ${
            activePanel === "problem"
              ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md"
              : "text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50/50 dark:hover:bg-indigo-900/20"
          }`}
        >
          <FileText className="h-4 w-4" />
          <span>Problem</span>
        </button>
        <button
          onClick={() => setActivePanel("code")}
          className={`flex-1 py-2.5 px-3 rounded-full flex items-center justify-center gap-1.5 text-xs font-medium transition-all duration-300
          ${
            activePanel === "code"
              ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md"
              : "text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50/50 dark:hover:bg-indigo-900/20"
          }`}
        >
          <Code className="h-4 w-4" />
          <span>Code</span>
        </button>
        <button
          onClick={() => setActivePanel("results")}
          className={`flex-1 py-2.5 px-3 rounded-full flex items-center justify-center gap-1.5 text-xs font-medium transition-all duration-300
          ${
            activePanel === "results"
              ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md"
              : "text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50/50 dark:hover:bg-indigo-900/20"
          }`}
        >
          <Terminal className="h-4 w-4" />
          <span>Results</span>
        </button>
      </div>
    </div>
  );
};

export default MobileNavigation;
