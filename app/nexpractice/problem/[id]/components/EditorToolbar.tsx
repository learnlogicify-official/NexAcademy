import React, { useState } from "react";
import {
  Settings,
  Maximize2,
  Minimize2,
  RotateCw,
  Check,
  Code,
  Moon,
  Sun,
  Type,
  Indent,
  RefreshCw,
  Database,
  Server,
  MonitorSmartphone,
  Code2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import LanguageSelector from "./LanguageSelector";

interface EditorToolbarProps {
  language: string;
  onLanguageChange: (lang: string) => void;
  editorLoading: boolean;
  toggleFocusMode: () => void;
  focusMode: boolean;
  formatCode: () => void;
  isFormatting: boolean;
  formatSuccess: boolean;
  noChangesNeeded: boolean;
  fontSize: number;
  setFontSize: (size: number) => void;
  tabSize: number;
  setTabSize: (size: number) => void;
  editorTheme: "vs-dark" | "light";
  setEditorTheme: (theme: "vs-dark" | "light") => void;
  resetCode: () => void;
  isMobile: boolean;
}

const EditorToolbar: React.FC<EditorToolbarProps> = ({
  language,
  onLanguageChange,
  editorLoading,
  toggleFocusMode,
  focusMode,
  formatCode,
  isFormatting,
  formatSuccess,
  noChangesNeeded,
  fontSize,
  setFontSize,
  tabSize,
  setTabSize,
  editorTheme,
  setEditorTheme,
  resetCode,
  isMobile,
}) => {
  const [isFormatPopoverOpen, setIsFormatPopoverOpen] = useState(false);

  return (
    <div className="flex items-center justify-between p-2 md:p-3 bg-white dark:bg-black border-b border-indigo-100 dark:border-indigo-900/50 flex-shrink-0">
      <div className="flex items-center">
        <div className="flex items-center mr-3 md:mr-4">
          {/* Logo - "N" on mobile, "NexEditor" on desktop */}
          <div className="flex items-center justify-center w-7 h-7 md:w-auto md:h-auto">
            <span className="hidden md:block text-base font-semibold text-indigo-700 dark:text-indigo-300 bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 dark:from-indigo-300 dark:via-purple-300 dark:to-indigo-300">
              NexEditor
            </span>
            <div className="md:hidden flex items-center justify-center w-7 h-7 rounded-md bg-gradient-to-br from-indigo-600 to-purple-600 text-white font-bold text-lg shadow-sm">
              N
            </div>
          </div>
        </div>

        {/* Language Selector Component */}
        <LanguageSelector
          language={language}
          onLanguageChange={onLanguageChange}
          editorLoading={editorLoading}
        />
      </div>

      <div className="flex items-center gap-2">
        {/* Focus Mode Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={toggleFocusMode}
          className="gap-1.5 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800/50 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 hidden md:flex"
        >
          {focusMode ? (
            <>
              <Minimize2 className="h-3.5 w-3.5 text-indigo-500 dark:text-indigo-400" />
              <span className="hidden sm:inline">Exit Focus</span>
            </>
          ) : (
            <>
              <Maximize2 className="h-3.5 w-3.5 text-indigo-500 dark:text-indigo-400" />
              <span className="hidden sm:inline">Focus Mode</span>
            </>
          )}
        </Button>

        {/* Format Code Button with spinner and tooltip */}
        <Popover
          open={isFormatPopoverOpen}
          onOpenChange={setIsFormatPopoverOpen}
        >
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="hidden md:flex text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800/50 hover:bg-indigo-50 dark:hover:bg-indigo-900/30"
              onClick={formatCode}
              disabled={isFormatting}
            >
              {isFormatting ? (
                <>
                  <span className="relative h-3.5 w-3.5 mr-1.5">
                    <RotateCw className="h-3.5 w-3.5 text-indigo-500 dark:text-indigo-400 animate-spin" />
                    <span className="absolute inset-0 h-3.5 w-3.5 bg-indigo-100 dark:bg-indigo-900/30 rounded-full animate-ping opacity-75"></span>
                  </span>
                  <span>Formatting...</span>
                </>
              ) : formatSuccess ? (
                <>
                  <span className="relative h-3.5 w-3.5 mr-1.5">
                    <Check className="h-3.5 w-3.5 text-green-500 dark:text-green-400" />
                    <span className="absolute inset-0 h-3.5 w-3.5 bg-green-100 dark:bg-green-900/30 rounded-full animate-ping opacity-75"></span>
                  </span>
                  <span className="text-green-600 dark:text-green-400">
                    Formatted!
                  </span>
                </>
              ) : noChangesNeeded ? (
                <>
                  <span className="relative h-3.5 w-3.5 mr-1.5">
                    <Check className="h-3.5 w-3.5 text-blue-500 dark:text-blue-400" />
                  </span>
                  <span className="text-blue-600 dark:text-blue-400">
                    Already formatted
                  </span>
                </>
              ) : (
                <>
                  <Code className="h-3.5 w-3.5 mr-1.5 text-indigo-500 dark:text-indigo-400" />
                  <span>Format</span>
                </>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-72 p-3 text-xs" align="end">
            <div className="text-slate-700 dark:text-slate-300 space-y-2.5">
              <div>
                <p className="font-medium text-sm">Format your code</p>
                <p className="text-slate-500 dark:text-slate-400 mt-1">
                  Formats the code according to language-specific rules.
                </p>
              </div>

              <div className="border-t border-slate-200 dark:border-slate-700 pt-2.5">
                <p className="font-medium">Supported Languages:</p>
                <ul className="mt-1 space-y-1 text-slate-500 dark:text-slate-400">
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                    Java, JavaScript, TypeScript, Python, C, C++
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></span>
                    Other languages use basic indentation
                  </li>
                </ul>
              </div>

              <div className="border-t border-slate-200 dark:border-slate-700 pt-2.5">
                <p className="font-medium">Keyboard shortcuts:</p>
                <div className="flex items-center mt-1">
                  <kbd className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 font-mono text-[10px] mr-1.5">
                    {editorTheme === "dark" ? "Shift+Alt+F" : "Alt+Shift+F"}
                  </kbd>
                  <span className="text-slate-500 dark:text-slate-400">or</span>
                  <kbd className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 font-mono text-[10px] mx-1.5">
                    Ctrl+K
                  </kbd>
                  <kbd className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 font-mono text-[10px]">
                    Ctrl+F
                  </kbd>
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>

        {/* Settings Menu */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="text-slate-700 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 hover:text-indigo-700 dark:hover:text-indigo-30"
            >
              <Settings className="h-4 w-4 cursor-pointer" />
            </Button>
          </PopoverTrigger>
          <PopoverContent
            align="end"
            className="w-72 p-0 border border-indigo-200/80 dark:border-indigo-800/50 shadow-xl rounded-xl overflow-hidden"
          >
            {/* Gradient purple header */}
            <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-600 dark:from-indigo-600 dark:via-purple-600 dark:to-indigo-700 p-4 relative flex items-center justify-between">
              <div className="absolute top-0 left-0 right-0 h-px bg-white/20"></div>
              <div className="absolute inset-0 bg-grid-white/[0.05] bg-[length:16px_16px]"></div>
              <h3 className="text-sm font-medium text-purple-900 dark:text-purple-100 flex items-center justify-between">
                <Settings className="h-4 w-4 mr-2 text-white/80" />
                <span className="text-white font-semibold">
                  Editor Settings
                </span>
              </h3>
              <div className="h-5 w-5 rounded-full bg-white/10 flex items-center justify-center">
                <Code className="h-3 w-3 text-white/70" />
              </div>
            </div>

            <div className="p-4 bg-gradient-to-b from-white to-indigo-50/50 dark:from-slate-900 dark:to-purple-900/20 border-t border-indigo-100 dark:border-indigo-900/30">
              <div className="mb-4">
                <label className="block text-xs font-medium mb-2 text-indigo-900 dark:text-indigo-100 flex items-center justify-between">
                  <span className="flex items-center">
                    <MonitorSmartphone className="h-3.5 w-3.5 mr-1.5 text-indigo-500 dark:text-indigo-300" />
                    Theme
                  </span>
                  <span className="text-xs font-medium text-indigo-700 dark:text-indigo-300">
                    {editorTheme === "vs-dark" ? "Dark" : "Light"}
                  </span>
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setEditorTheme("vs-dark")}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 flex-1 ${
                      editorTheme === "vs-dark"
                        ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-sm"
                        : "bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-800/40"
                    }`}
                  >
                    <span className="flex items-center justify-center">
                      <Moon className="h-3 w-3 mr-1.5" />
                      Dark
                    </span>
                  </button>
                  <button
                    onClick={() => setEditorTheme("light")}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 flex-1 ${
                      editorTheme === "light"
                        ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-sm"
                        : "bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-800/40"
                    }`}
                  >
                    <span className="flex items-center justify-center">
                      <Sun className="h-3 w-3 mr-1.5" />
                      Light
                    </span>
                  </button>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-xs font-medium mb-2 text-indigo-900 dark:text-indigo-100 flex items-center justify-between">
                  <span className="flex items-center">
                    <Type className="h-3.5 w-3.5 mr-1.5 text-indigo-500 dark:text-indigo-300" />
                    Font Size
                  </span>
                  <span className="text-xs font-medium text-indigo-700 dark:text-indigo-300">
                    {fontSize}px
                  </span>
                </label>
                <div className="relative mt-2">
                  <div className="h-1.5 bg-indigo-100 dark:bg-indigo-900/30 rounded-full w-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 dark:from-indigo-400 dark:to-purple-400"
                      style={{ width: `${((fontSize - 12) / 12) * 100}%` }}
                    ></div>
                  </div>
                  <input
                    type="range"
                    min="12"
                    max="24"
                    value={fontSize}
                    onChange={(e) => setFontSize(Number(e.target.value))}
                    className="absolute inset-0 w-full h-1.5 opacity-0 cursor-pointer"
                  />
                </div>
                <div className="flex justify-between mt-1.5">
                  <span className="text-[10px] text-indigo-500/70 dark:text-indigo-400/70">
                    12px
                  </span>
                  <span className="text-[10px] text-indigo-500/70 dark:text-indigo-400/70">
                    24px
                  </span>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-xs font-medium mb-2 text-indigo-900 dark:text-indigo-100 flex items-center justify-between">
                  <span className="flex items-center">
                    <Indent className="h-3.5 w-3.5 mr-1.5 text-indigo-500 dark:text-indigo-300" />
                    Tab Size
                  </span>
                  <span className="text-xs font-medium text-indigo-700 dark:text-indigo-300">
                    {tabSize} spaces
                  </span>
                </label>
                <div className="relative mt-2">
                  <div className="h-1.5 bg-indigo-100 dark:bg-indigo-900/30 rounded-full w-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-purple-500 to-pink-500 dark:from-purple-400 dark:to-pink-400"
                      style={{ width: `${((tabSize - 2) / 6) * 100}%` }}
                    ></div>
                  </div>
                  <input
                    type="range"
                    min="2"
                    max="8"
                    value={tabSize}
                    onChange={(e) => setTabSize(Number(e.target.value))}
                    className="absolute inset-0 w-full h-1.5 opacity-0 cursor-pointer"
                  />
                </div>
                <div className="flex justify-between mt-1.5">
                  <span className="text-[10px] text-indigo-500/70 dark:text-indigo-400/70">
                    2 spaces
                  </span>
                  <span className="text-[10px] text-indigo-500/70 dark:text-indigo-400/70">
                    8 spaces
                  </span>
                </div>
              </div>

              {/* Footer with reset button */}
              <div className="pt-3 mt-3 border-t border-indigo-200 dark:border-indigo-800/50">
                <button
                  onClick={resetCode}
                  className="w-full py-2.5 rounded-lg bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-600 text-white font-medium text-xs hover:from-indigo-600 hover:via-purple-600 hover:to-indigo-700 transition-all duration-200 shadow-sm hover:shadow-md shadow-indigo-500/10 hover:shadow-indigo-500/20 relative overflow-hidden group"
                >
                  <span className="absolute inset-0 w-full h-full bg-[linear-gradient(90deg,rgba(255,255,255,0.1)_0%,rgba(255,255,255,0.2)_20%,rgba(255,255,255,0)_60%)] translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></span>
                  <span className="relative flex items-center justify-center">
                    <RefreshCw className="h-3 w-3 mr-1.5" />
                    Reset Code
                  </span>
                </button>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
};

export default EditorToolbar;
