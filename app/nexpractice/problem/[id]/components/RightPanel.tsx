import React, { useState, useCallback, useEffect } from "react";
import ResultsSection from "./ResultsSection";
import { LuMaximize } from "react-icons/lu";
import { LuMinimize } from "react-icons/lu";
import { FaCode } from "react-icons/fa";
import { GoChevronDown } from "react-icons/go";
import { GoChevronUp } from "react-icons/go";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Check,
  Indent,
  Moon,
  Search,
  Settings,
  Sun,
  Type,
  X,
} from "lucide-react";
import { Popover, PopoverContent } from "@/components/ui/popover";
import { VscOutput } from "react-icons/vsc";
import { ChevronDown, Play, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { PopoverTrigger } from "@/components/ui/popover";
import { BsArrowRepeat } from "react-icons/bs";
import { CgFormatLeft } from "react-icons/cg";
import { NexEditor as CodeEditor } from "@/components/NexEditor";
import CustomTestcaseTab from "./CustomTestcaseTab";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { FileText, BarChart2, Sparkles } from "lucide-react";
import SampleTestcaseTab from "./SampleTestcaseTab";
import { HiddenTestcasesTab } from "./HiddenTestcasesTab";

interface RightPanelProps {
  hasMounted: boolean;
  isMobile: boolean;
  activePanel: string;
  leftPanelWidth: number;
  editorHeight: number;
  language: string;
  editorTheme: "vs-dark" | "light";
  fontSize: number;
  tabSize: number;
  code: string;
  isRunning: boolean;
  isSubmitting: boolean;
  isFormatting: boolean;
  formatSuccess: boolean;
  editorLoading: boolean;
  initialLoading: boolean;
  searchLanguage: string;
  languageDropdownOpen: boolean;
  JUDGE0_LANGUAGES: Record<string, string>;
  setCode: (code: string) => void;
  setFontSize: (size: number) => void;
  setTabSize: (size: number) => void;
  setEditorTheme: (theme: "vs-dark" | "light") => void;
  setSearchLanguage: (lang: string) => void;
  setLanguageDropdownOpen: (open: boolean) => void;
  setFormatSuccess: (success: boolean) => void;
  runCode: () => void;
  submitCode: () => void;
  formatCode: () => void;
  toggleFocusMode: () => void;
  handleLanguageChange: (lang: string) => void;
  parseLanguageName: (name: string) => { name: string; version: string };
  focusMode: boolean;
  preloadCode: string;
  editorRef: React.RefObject<any>;
  monacoRef: React.RefObject<any>;
  handleEditorDidMount: (editor: any, monaco: any) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  showEvaluatingSkeletons: boolean;
  skeletonTab: "sample" | "hidden" | null;
  sampleTestResults: any[];
  sampleExecutionStatus: "success" | "error" | "warning" | "info" | null;
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
  showCelebration: boolean;
  customTestResult?: {
    input: string;
    output: string;
    isCorrect: boolean;
    executionTime?: string;
    memoryUsed?: string;
    status?: string;
  } | null;
  runCustomTestcase?: (input: string) => void;
}

export default function RightPanel({
  hasMounted,
  isMobile,
  activePanel,
  leftPanelWidth,
  editorHeight,
  language,
  editorTheme,
  fontSize,
  tabSize,
  code,
  isRunning,
  isSubmitting,
  isFormatting,
  formatSuccess,
  editorLoading,
  initialLoading,
  searchLanguage,
  languageDropdownOpen,
  JUDGE0_LANGUAGES,
  setCode,
  setFontSize,
  setTabSize,
  setEditorTheme,
  setSearchLanguage,
  setLanguageDropdownOpen,
  setFormatSuccess,
  runCode,
  submitCode,
  formatCode,
  toggleFocusMode,
  handleLanguageChange,
  parseLanguageName,
  focusMode,
  preloadCode,
  editorRef,
  monacoRef,
  handleEditorDidMount,
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
  showCelebration,
  customTestResult,
  runCustomTestcase,
}: RightPanelProps) {
  const [isResizing, setIsResizing] = useState(false);
  const [editorHeightState, setEditorHeightState] = useState(editorHeight);
  const [isEditorFolded, setIsEditorFolded] = useState(false);
  const [isResultsFolded, setIsResultsFolded] = useState(false);
  const [prevEditorHeight, setPrevEditorHeight] = useState(editorHeight);
  const [prevResultsHeight, setPrevResultsHeight] = useState(
    100 - editorHeight
  );

  // Store the current editor height when it's not folded
  useEffect(() => {
    if (!isEditorFolded && editorHeightState > 7) {
      setPrevEditorHeight(editorHeightState);
    }
  }, [isEditorFolded, editorHeightState]);

  // Wrapper functions for runCode and submitCode
  const handleRunCode = useCallback(() => {
    // Save current editor height if not already folded
    if (!isEditorFolded && editorHeightState > 7) {
      setPrevEditorHeight(editorHeightState);
    }

    // Fold editor
    setIsEditorFolded(true);

    // Unfold results if they're folded
    if (isResultsFolded) {
      setIsResultsFolded(false);
    }

    // Set active tab to "sample" for run operations
    setActiveTab("sample");

    // Run the code
    runCode();
  }, [
    isEditorFolded,
    isResultsFolded,
    editorHeightState,
    runCode,
    setActiveTab,
  ]);

  const handleSubmitCode = useCallback(() => {
    // Save current editor height if not already folded
    if (!isEditorFolded && editorHeightState > 7) {
      setPrevEditorHeight(editorHeightState);
    }

    // Fold editor
    setIsEditorFolded(true);

    // Unfold results if they're folded
    if (isResultsFolded) {
      setIsResultsFolded(false);
    }

    // Set active tab to "hidden" for submit operations
    setActiveTab("hidden");

    // Submit the code
    submitCode();
  }, [
    isEditorFolded,
    isResultsFolded,
    editorHeightState,
    submitCode,
    setActiveTab,
  ]);

  // Wrapper for runCustomTestcase
  const handleRunCustomTestcase = useCallback(
    (input: string) => {
      // Save current editor height if not already folded
      if (!isEditorFolded && editorHeightState > 7) {
        setPrevEditorHeight(editorHeightState);
      }

      // Fold editor
      setIsEditorFolded(true);

      // Unfold results if they're folded
      if (isResultsFolded) {
        setIsResultsFolded(false);
      }

      // Set active tab to "custom" for custom testcase operations
      setActiveTab("custom");

      // Run the custom testcase
      if (runCustomTestcase) {
        runCustomTestcase(input);
      }
    },
    [
      isEditorFolded,
      isResultsFolded,
      editorHeightState,
      runCustomTestcase,
      setActiveTab,
    ]
  );

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (isEditorFolded) {
        setIsEditorFolded(false);
        setEditorHeightState(prevEditorHeight);
      }
      if (isResultsFolded) {
        setIsResultsFolded(false);
      }

      setIsResizing(true);
      e.preventDefault();
    },
    [isEditorFolded, isResultsFolded, prevEditorHeight]
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isResizing) return;

      const container = document.querySelector(".right-panel-container");
      if (!container) return;

      const containerRect = container.getBoundingClientRect();
      const newHeight =
        ((e.clientY - containerRect.top) / containerRect.height) * 100;

      // Allow resizing to minimum height (header only) or maximum height
      // Header height is approximately 44px which is roughly 5% of a typical container
      const headerHeightPercent = 5;
      const clampedHeight = Math.min(
        Math.max(newHeight, headerHeightPercent),
        100 - headerHeightPercent
      );

      // If we're not already in folded state and the height is changing significantly,
      // store the current height as previous height for unfolding later
      if (!isEditorFolded && Math.abs(editorHeightState - clampedHeight) > 5) {
        // Only update prevEditorHeight if we're not resizing to minimum height
        if (clampedHeight > headerHeightPercent + 2) {
          setPrevEditorHeight(editorHeightState);
        }
      }

      // Calculate the results height based on the new editor height
      const newResultsHeight = 100 - clampedHeight - 1; // 1% for resizer

      // If results section would be too small, save its current height and prepare to fold it
      if (newResultsHeight < headerHeightPercent + 2 && !isResultsFolded) {
        setPrevResultsHeight(100 - editorHeightState - 1);
      }

      setEditorHeightState(clampedHeight);
    },
    [isResizing, isEditorFolded, isResultsFolded, editorHeightState]
  );

  const handleMouseUp = useCallback(() => {
    setIsResizing(false);

    // Check if editor has been resized to near minimum height (header only)
    const headerHeightPercent = 7; // Slightly higher threshold than the 5% used in handleMouseMove
    if (editorHeightState <= headerHeightPercent && !isEditorFolded) {
      setIsEditorFolded(true);
    } else if (editorHeightState > headerHeightPercent && isEditorFolded) {
      setIsEditorFolded(false);
    }

    // Check if results section has been resized to near minimum height
    const resultsHeight = 100 - editorHeightState - (isEditorFolded ? 0 : 1);
    if (resultsHeight <= headerHeightPercent && !isResultsFolded) {
      setIsResultsFolded(true);
    } else if (resultsHeight > headerHeightPercent && isResultsFolded) {
      setIsResultsFolded(false);
    }
  }, [editorHeightState, isEditorFolded, isResultsFolded]);

  const toggleEditorFold = useCallback(() => {
    if (!isEditorFolded) {
      // Save current height before folding
      if (editorHeightState > 7) {
        // Only save if not already at minimum height
        setPrevEditorHeight(editorHeightState);
      }
      setIsEditorFolded(true);
    } else {
      // Restore previous height when unfolding
      setEditorHeightState(prevEditorHeight > 7 ? prevEditorHeight : 50);
      setIsEditorFolded(false);
    }
  }, [isEditorFolded, editorHeightState, prevEditorHeight]);

  const toggleResultsFold = useCallback(() => {
    const currentResultsHeight =
      100 - editorHeightState - (isEditorFolded ? 0 : 1);

    if (!isResultsFolded) {
      // Save current height before folding
      setPrevResultsHeight(currentResultsHeight);
      setIsResultsFolded(true);
    } else {
      // Restore previous height when unfolding
      // If editor is not folded, adjust editor height to make room for results
      if (!isEditorFolded) {
        const newEditorHeight = 100 - prevResultsHeight - 1; // 1% for resizer
        setEditorHeightState(Math.max(7, Math.min(newEditorHeight, 93))); // Ensure editor height stays within reasonable bounds
      }
      setIsResultsFolded(false);
    }
  }, [isResultsFolded, editorHeightState, isEditorFolded, prevResultsHeight]);

  React.useEffect(() => {
    if (isResizing) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isResizing, handleMouseMove, handleMouseUp]);

  return (
    <div
      className={`flex flex-col h-full m-4 mb-0 ml-1 right-panel-container ${
        hasMounted && isMobile && activePanel === "problem" ? "hidden" : ""
      }`}
      style={{
        width: hasMounted && isMobile ? "100%" : `${100 - leftPanelWidth}%`,
      }}
    >
      <div className="flex flex-col gap-1 h-[calc(100vh-8rem)]">
        {/* Editor Section */}
        <div
          className={`flex flex-col w-full  min-h-[44px] rounded-lg overflow-hidden border border-[#e4e6eb] dark:border-none`}
          style={{
            height: isEditorFolded
              ? "44px" // Just the header when folded
              : isResultsFolded
              ? "calc(100% - 42px)" // When results are folded, editor takes all space minus results header and resizer
              : `${editorHeightState}%`,
          }}
        >
          <div className="flex items-center justify-between border border-[#e4e6eb] dark:border-none p-2 pl-3 bg-white dark:bg-[#292929]">
            <div className="flex items-center gap-2">
              <FaCode className="h-5 w-5 text-[#087bff]" />
              <div className="flex text-[14px] items-center mr-3 md:mr-4">
                NexEditor
              </div>
            </div>
            <div className="flex items-center gap-2">
              {hasMounted && isMobile && (
                <div className="flex items-center gap-1.5">
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 px-2 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800/50"
                    onClick={handleRunCode}
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
                    onClick={handleSubmitCode}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Send className="h-3.5 w-3.5" />
                    )}
                    {!isSubmitting && (
                      <span className="text-xs ml-1">Submit</span>
                    )}
                  </Button>
                </div>
              )}

              <TooltipProvider delayDuration={0}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={toggleFocusMode}
                      className="bg-transparent hover:bg-[#f2f3f5] dark:hover:bg-[#484848] rounded-[8px] p-1.5 transition-colors duration-300"
                    >
                      {focusMode ? (
                        <LuMinimize className="h-3.5 w-3.5" />
                      ) : (
                        <LuMaximize className="h-3.5 w-3.5" />
                      )}
                    </button>
                  </TooltipTrigger>
                  <TooltipContent
                    side="top"
                    align="center"
                    className="w-fit p-2 px-3 rounded-sm bg-white dark:bg-[#1f1f1f] text-xs border dark:border-[#444444]"
                  >
                    {focusMode ? "Exit Focus Mode" : "Focus Mode"}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <TooltipProvider delayDuration={0}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={toggleEditorFold}
                      className="bg-transparent hover:bg-[#f2f3f5] dark:hover:bg-[#484848] rounded-[6px] p-1 transition-colors duration-300"
                    >
                      {isEditorFolded ? (
                        <GoChevronUp className="h-4 w-4" />
                      ) : (
                        <GoChevronDown className="h-4 w-4" />
                      )}
                    </button>
                  </TooltipTrigger>
                  <TooltipContent
                    side="top"
                    align="center"
                    className="w-fit p-2 px-3 rounded-sm bg-white dark:bg-[#1f1f1f] text-xs border dark:border-[#444444]"
                  >
                    {isEditorFolded ? "Unfold" : "Fold"}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <Popover
                open={languageDropdownOpen}
                onOpenChange={setLanguageDropdownOpen}
              >
                <PopoverTrigger asChild>
                  <button className="flex items-center gap-1 dark:bg-[#393939] dark:hover:bg-[#494949] bg-gray-100 hover:bg-gray-200 dark:text-white text-gray-800 min-w-[120px]  h-7  overflow-hidden group relative rounded-md pl-3 pr-2">
                    <div className="flex items-center justify-between w-full overflow-hidden">
                      <div className="flex items-center justify-center gap-3 overflow-hidden">
                        <span className="font-medium text-xs md:text-sm truncate">
                          {
                            parseLanguageName(
                              JUDGE0_LANGUAGES[
                                language as keyof typeof JUDGE0_LANGUAGES
                              ]
                            ).name
                          }
                        </span>
                        <span className="text-[10px] md:text-xs dark:text-[#8c8c8c] text-gray-500 truncate group-hover:dark:text-[#acacac] group-hover:text-gray-700">
                          {
                            parseLanguageName(
                              JUDGE0_LANGUAGES[
                                language as keyof typeof JUDGE0_LANGUAGES
                              ]
                            ).version
                          }
                        </span>
                      </div>
                      <ChevronDown className="h-3 w-3 ml-2 flex-shrink-0 opacity-60 transition-colors" />
                    </div>
                  </button>
                </PopoverTrigger>
                <PopoverContent
                  align="start"
                  className="w-[600px] mt-3 mr-6 p-0 max-h-[400px] overflow-hidden flex flex-col dark:border-gray-800 border-gray-200 shadow-lg rounded-xl"
                >
                  <div className="sticky top-0 z-30 dark:bg-[#292929] bg-gray-50 dark:border-b-gray-800 border-b-gray-200 border-b p-3">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 dark:text-gray-400 text-gray-500" />
                      <Input
                        placeholder="Search languages..."
                        className="pl-10 py-1.5 dark:bg-[#1a1a1a] bg-white dark:border-gray-700 border-gray-300 rounded-lg text-sm dark:text-white text-gray-800"
                        value={searchLanguage}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          setSearchLanguage(e.target.value)
                        }
                      />
                    </div>
                  </div>

                  <div className="overflow-y-auto flex-1 p-0 custom-scrollbar dark:bg-[#292929] bg-white">
                    <div className="grid grid-cols-3 dark:divide-x-[#393939] divide-x-gray-200 divide-x">
                      {[0, 1, 2].map((colIndex) => (
                        <div key={colIndex} className="py-2 space-y-1">
                          {Object.entries(
                            JUDGE0_LANGUAGES as Record<string, string>
                          )
                            .filter(
                              ([id, name]) =>
                                !searchLanguage ||
                                name
                                  .toLowerCase()
                                  .includes(searchLanguage.toLowerCase())
                            )
                            .slice(
                              Math.ceil(
                                (Object.keys(JUDGE0_LANGUAGES).length / 3) *
                                  colIndex
                              ),
                              Math.ceil(
                                (Object.keys(JUDGE0_LANGUAGES).length / 3) *
                                  (colIndex + 1)
                              )
                            )
                            .map(([langId, langName]: [string, string]) => {
                              const { name, version } =
                                parseLanguageName(langName);
                              const isSelected = language === langId;
                              return (
                                <div
                                  key={`lang-${langId}`}
                                  className={`group px-4 py-2.5 transition-all duration-150 cursor-pointer rounded-md mx-1 ${
                                    isSelected
                                      ? "dark:bg-[#333333] bg-blue-50"
                                      : "dark:hover:bg-[#2a2a2a] hover:bg-gray-100"
                                  }`}
                                  onClick={() => {
                                    handleLanguageChange(langId);
                                    setLanguageDropdownOpen(false);
                                  }}
                                >
                                  <div className="flex items-center justify-between">
                                    <div className="flex flex-col">
                                      <span
                                        className={`font-medium text-sm ${
                                          isSelected
                                            ? "text-[#0779FF]"
                                            : "dark:text-gray-300 text-gray-800"
                                        }`}
                                      >
                                        {name}
                                      </span>
                                      {version && (
                                        <span className="text-xs dark:text-gray-500 text-gray-500">
                                          {version}
                                        </span>
                                      )}
                                    </div>
                                    {isSelected && (
                                      <div className="text-[#0779FF]">
                                        <Check className="h-3.5 w-3.5" />
                                      </div>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                        </div>
                      ))}
                    </div>

                    {searchLanguage &&
                      Object.entries(
                        JUDGE0_LANGUAGES as Record<string, string>
                      ).filter(([id, name]) =>
                        name
                          .toLowerCase()
                          .includes(searchLanguage.toLowerCase())
                      ).length === 0 && (
                        <div className="text-center py-8 px-4">
                          <Search className="h-5 w-5 dark:text-gray-500 text-gray-400 mx-auto mb-2" />
                          <p className="text-sm dark:text-gray-500 text-gray-500">
                            No languages matching "{searchLanguage}"
                          </p>
                        </div>
                      )}
                  </div>

                  {searchLanguage && (
                    <div className="border-t dark:border-gray-800 border-gray-200 px-3 py-2 dark:bg-[#1a1a1a] bg-gray-50">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSearchLanguage("")}
                        className="h-7 text-xs w-full dark:border-gray-700 border-gray-300 dark:bg-[#2a2a2a] bg-white dark:hover:bg-[#333333] hover:bg-gray-100 dark:text-gray-300 text-gray-700"
                      >
                        <X className="h-3 w-3 mr-1.5" />
                        Clear Search
                      </Button>
                    </div>
                  )}
                </PopoverContent>
              </Popover>
            </div>
          </div>
          {!isEditorFolded && (
            <>
              <div className="flex items-center justify-end p-1 border-none dark:border-b dark:border-[#292929] bg-white dark:bg-[#1f1f1f]">
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-slate-700 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 hover:text-indigo-700 dark:hover:text-indigo-30"
                    asChild
                  >
                    <Popover>
                      <TooltipProvider delayDuration={0}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <PopoverTrigger asChild>
                              <div className="bg-transparent hover:bg-[#f2f3f5] dark:hover:bg-[#484848] rounded-[4px] p-1 transition-colors duration-300">
                                <span>
                                  <Settings className="h-3 w-3 cursor-pointer" />
                                </span>
                              </div>
                            </PopoverTrigger>
                          </TooltipTrigger>
                          <TooltipContent
                            side="top"
                            align="center"
                            className="w-fit p-2 px-3 rounded-sm bg-white dark:bg-[#1f1f1f] text-xs border dark:border-[#444444]"
                          >
                            Editor Settings
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      <PopoverContent
                        align="end"
                        className="w-80 p-0 border border-gray-200 dark:border-[#4c4c4c] shadow-xl rounded-xl overflow-hidden mt-4"
                      >
                        <div className="p-5 bg-white dark:bg-[#2e2e2e] border-t border-gray-100 dark:border-gray-800">
                          <div className="mb-5">
                            <div className="flex gap-2 mt-1.5">
                              <button
                                onClick={() => setEditorTheme("vs-dark")}
                                className={`px-3 py-2 rounded-md text-xs font-medium transition-all duration-200 flex-1 ${
                                  editorTheme === "vs-dark"
                                    ? "bg-[#0779FF] text-white shadow-md"
                                    : "bg-gray-100 dark:bg-[#2a2a2a] text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-[#333]"
                                }`}
                              >
                                <span className="flex items-center justify-center">
                                  <Moon className={`h-3.5 w-3.5 mr-1.5`} />
                                  Dark
                                </span>
                              </button>
                              <button
                                onClick={() => setEditorTheme("light")}
                                className={`px-3 py-2 rounded-md text-xs font-medium transition-all duration-200 flex-1 ${
                                  editorTheme === "light"
                                    ? "bg-[#0779FF] text-white shadow-md"
                                    : "bg-gray-100 dark:bg-[#2a2a2a] text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-[#333]"
                                }`}
                              >
                                <span className="flex items-center justify-center">
                                  <Sun className={`h-3.5 w-3.5 mr-1.5`} />
                                  Light
                                </span>
                              </button>
                            </div>
                          </div>

                          <div className="mb-5">
                            <label className="text-xs font-medium mb-2.5 text-gray-700 dark:text-gray-300 flex items-center justify-between">
                              <span className="flex items-center">
                                <Type className="h-3.5 w-3.5 mr-1.5 text-gray-500 dark:text-gray-400" />
                                Font Size
                              </span>
                              <div className="flex items-center">
                                <button
                                  onClick={() =>
                                    setFontSize(Math.max(12, fontSize - 1))
                                  }
                                  className="h-5 w-5 flex items-center justify-center bg-gray-100 dark:bg-[#1a1a1a] rounded-l-md border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white"
                                >
                                  <span className="text-xs">-</span>
                                </button>
                                <span className="text-xs font-medium text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-[#2a2a2a] px-2 py-0.5 border-t border-b border-gray-200 dark:border-gray-700/50 min-w-[40px] text-center">
                                  {fontSize}px
                                </span>
                                <button
                                  onClick={() =>
                                    setFontSize(Math.min(24, fontSize + 1))
                                  }
                                  className="h-5 w-5 flex items-center justify-center bg-gray-100 dark:bg-[#1a1a1a] rounded-r-md border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white"
                                >
                                  <span className="text-xs">+</span>
                                </button>
                              </div>
                            </label>
                            <div className="relative mt-3 px-1">
                              <div className="h-1 bg-gray-200 dark:bg-[#333] rounded-full w-full overflow-hidden">
                                <div
                                  className="h-full bg-[#0779FF]"
                                  style={{
                                    width: `${((fontSize - 12) / 12) * 100}%`,
                                  }}
                                ></div>
                              </div>
                              <div
                                className="absolute top-1/2 -translate-y-1/2 h-3 w-3 rounded-full bg-[#0779FF] shadow-md border border-[#0779FF]"
                                style={{
                                  left: `calc(${
                                    ((fontSize - 12) / 12) * 100
                                  }% - 6px)`,
                                }}
                              ></div>
                              <input
                                type="range"
                                min="12"
                                max="24"
                                value={fontSize}
                                onChange={(e) =>
                                  setFontSize(Number(e.target.value))
                                }
                                className="absolute inset-0 w-full h-6 opacity-0 cursor-pointer"
                                style={{ marginTop: "-10px" }}
                              />
                            </div>
                            <div className="flex justify-between mt-2 px-1">
                              <span className="text-[10px] text-gray-400 dark:text-gray-500">
                                12px
                              </span>
                              <span className="text-[10px] text-gray-400 dark:text-gray-500">
                                24px
                              </span>
                            </div>
                          </div>

                          <div className="mb-5">
                            <label className="text-xs font-medium mb-2.5 text-gray-700 dark:text-gray-300 flex items-center justify-between">
                              <span className="flex items-center">
                                <Indent className="h-3.5 w-3.5 mr-1.5 text-gray-500 dark:text-gray-400" />
                                Tab Size
                              </span>
                              <div className="flex items-center">
                                <button
                                  onClick={() =>
                                    setTabSize(Math.max(2, tabSize - 2))
                                  }
                                  className="h-5 w-5 flex items-center justify-center bg-gray-100 dark:bg-[#1a1a1a] rounded-l-md border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white"
                                >
                                  <span className="text-xs">-</span>
                                </button>
                                <span className="text-xs font-medium text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-[#2a2a2a] px-2 py-0.5 border-t border-b border-gray-200 dark:border-gray-700/50 min-w-[70px] text-center">
                                  {tabSize} spaces
                                </span>
                                <button
                                  onClick={() =>
                                    setTabSize(Math.min(8, tabSize + 2))
                                  }
                                  className="h-5 w-5 flex items-center justify-center bg-gray-100 dark:bg-[#1a1a1a] rounded-r-md border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white"
                                >
                                  <span className="text-xs">+</span>
                                </button>
                              </div>
                            </label>
                            <div className="relative mt-3 px-1">
                              <div className="h-1 bg-gray-200 dark:bg-[#333] rounded-full w-full overflow-hidden">
                                <div
                                  className="h-full bg-[#0779FF]"
                                  style={{
                                    width: `${((tabSize - 2) / 6) * 100}%`,
                                  }}
                                ></div>
                              </div>
                              <div
                                className="absolute top-1/2 -translate-y-1/2 h-3 w-3 rounded-full bg-[#0779FF] shadow-md border border-[#0779FF]"
                                style={{
                                  left: `calc(${
                                    ((tabSize - 2) / 6) * 100
                                  }% - 6px)`,
                                }}
                              ></div>
                              <input
                                type="range"
                                min="2"
                                max="8"
                                step="2"
                                value={tabSize}
                                onChange={(e) =>
                                  setTabSize(Number(e.target.value))
                                }
                                className="absolute inset-0 w-full h-6 opacity-0 cursor-pointer"
                                style={{ marginTop: "-10px" }}
                              />
                            </div>
                            <div className="flex justify-between mt-2 px-1">
                              <span className="text-[10px] text-gray-400 dark:text-gray-500">
                                2
                              </span>
                              <span className="text-[10px] text-gray-400 dark:text-gray-500">
                                4
                              </span>
                              <span className="text-[10px] text-gray-400 dark:text-gray-500">
                                6
                              </span>
                              <span className="text-[10px] text-gray-400 dark:text-gray-500">
                                8
                              </span>
                            </div>
                          </div>
                        </div>
                      </PopoverContent>
                    </Popover>
                  </Button>

                  <TooltipProvider delayDuration={0}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          className="bg-transparent hover:bg-[#f2f3f5] dark:hover:bg-[#484848] rounded-[4px] p-1 transition-colors duration-300"
                          onClick={async () => {
                            await formatCode();
                            setFormatSuccess(true);
                            setTimeout(() => setFormatSuccess(false), 1500);
                          }}
                          disabled={isFormatting}
                        >
                          {isFormatting ? (
                            <CgFormatLeft className="animate-pulse h-3 w-3" />
                          ) : formatSuccess ? (
                            <Check className="h-3.5 w-3.5 text-green-500 dark:text-green-400" />
                          ) : (
                            <CgFormatLeft className="h-3 w-3" />
                          )}
                        </button>
                      </TooltipTrigger>
                      <TooltipContent
                        side="top"
                        align="center"
                        className="w-fit p-2 px-3 rounded-sm bg-white dark:bg-[#1f1f1f] text-xs border dark:border-[#444444]"
                      >
                        Format
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <TooltipProvider delayDuration={0}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          className="bg-transparent hover:bg-[#f2f3f5] dark:hover:bg-[#484848] rounded-[4px] p-1 transition-colors duration-300"
                          onClick={() => setCode(preloadCode)}
                        >
                          {isFormatting ? (
                            <CgFormatLeft className="animate-pulse h-3 w-3" />
                          ) : formatSuccess ? (
                            <Check className="h-3.5 w-3.5 text-green-500 dark:text-green-400" />
                          ) : (
                            <BsArrowRepeat className="h-3 w-3" />
                          )}
                        </button>
                      </TooltipTrigger>
                      <TooltipContent
                        side="top"
                        align="center"
                        className="w-fit p-2 px-3 rounded-sm bg-white dark:bg-[#1f1f1f] text-xs border dark:border-[#444444]"
                      >
                        Reset Code
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
              <div className="flex-1 overflow-hidden bg-[#1f1f1f]">
                <CodeEditor
                  code={code}
                  onChange={setCode}
                  language={language}
                  theme={editorTheme === "vs-dark" ? "vs-dark" : "light"}
                  fontSize={fontSize}
                  tabSize={tabSize}
                  onEditorMount={(editor, monaco) => {
                    editorRef.current = editor;
                    monacoRef.current = monaco;
                    handleEditorDidMount(editor, monaco);
                  }}
                />
              </div>
            </>
          )}
        </div>
        {/* Vertical Resizer */}
        <div
          className={`h-2 cursor-row-resize rounded-full mx-[20px] active:bg-indigo-500/30 transition-colors flex justify-center items-center group ${
            isEditorFolded ? "mt-[-2px]" : ""
          }`}
          onMouseDown={handleMouseDown}
        >
          <div className="h-2 bg-[#a8abb0] dark:bg-[#1f1f1f] group-hover:bg-[#0779FF] dark:group-hover:bg-white w-[60px] rounded-full transition-colors group-active:bg-[#0779FF]"></div>
        </div>
        {/* Results Section */}
        <div
          className="flex flex-col w-full min-h-[40px] bg-[#1f1f1f] rounded-lg overflow-hidden border border-[#e4e6eb] dark:border-none"
          style={{
            height: isResultsFolded
              ? "40px" // When folded, just show the header
              : isEditorFolded
              ? "calc(100% - 40px)" // When editor is folded, results take all space minus editor header
              : `${100 - editorHeightState - (isEditorFolded ? 0 : 1)}%`, // Normal case with resizer (1% for resizer)
          }}
        >
          <div className="flex items-center justify-between p-1 pl-3 bg-white dark:bg-[#292929]  border-none">
            <div className="flex items-center gap-2 flex-1 ">
              <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                className="w-full relative z-10 "
              >
                <TabsList className="flex justify-start gap-2 border-none p-0 rounded-none shrink-0 bg-transparent">
                  <TabsTrigger
                    value="sample"
                    className="px-3 py-1.5 text-[black] dark:text-[white] text-sm  bg-transparent data-[state=active]:font-semibold data-[state=active]:opacity-100 opacity-50 hover:opacity-90 hover:bg-[#f2f3f5] dark:hover:bg-[#3f3f3f] transition-colors duration-300"
                  >
                    <FileText className="h-4 w-4 mr-1.5 text-indigo-500/70 dark:text-indigo-400/70 group-data-[state=active]:text-indigo-600 dark:group-data-[state=active]:text-indigo-400" />
                    Sample Testcases
                  </TabsTrigger>
                  <TabsTrigger
                    value="hidden"
                    className="px-3 py-1.5 text-[black] dark:text-[white] text-sm font-medium  bg-transparent data-[state=active]:font-semibold data-[state=active]:opacity-100 opacity-50 hover:opacity-90 hover:bg-[#f2f3f5] dark:hover:bg-[#3f3f3f] transition-colors duration-300"
                  >
                    <BarChart2 className="h-4 w-4 mr-1.5 text-indigo-500/70 dark:text-indigo-400/70 group-data-[state=active]:text-indigo-600 dark:group-data-[state=active]:text-indigo-400" />
                    Hidden Testcases
                  </TabsTrigger>
                  <TabsTrigger
                    value="custom"
                    className="px-3 py-1.5 text-[black] dark:text-[white] text-sm  bg-transparent data-[state=active]:font-semibold data-[state=active]:opacity-100 opacity-50 hover:opacity-90 hover:bg-[#f2f3f5] dark:hover:bg-[#3f3f3f] transition-colors duration-300"
                  >
                    <Sparkles className="h-4 w-4 mr-1.5 text-indigo-500/70 dark:text-indigo-400/70 group-data-[state=active]:text-indigo-600 dark:group-data-[state=active]:text-indigo-400" />
                    Custom Testcase
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            <div className="flex items-center gap-2">
              <TooltipProvider delayDuration={0}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={toggleResultsFold}
                      className="bg-transparent hover:bg-[#f2f3f5] dark:hover:bg-[#484848] rounded-[6px] p-1 transition-colors duration-300"
                    >
                      {isResultsFolded ? (
                        <GoChevronUp className="h-4 w-4" />
                      ) : (
                        <GoChevronDown className="h-4 w-4" />
                      )}
                    </button>
                  </TooltipTrigger>
                  <TooltipContent
                    side="top"
                    align="center"
                    className="w-fit p-2 px-3 rounded-sm bg-white dark:bg-[#1f1f1f] text-xs border dark:border-[#444444]"
                  >
                    {isResultsFolded ? "Unfold" : "Fold"}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
          {!isResultsFolded && (
            <div className="flex-1 bg-white dark:bg-[#1f1f1f] pb-20 overflow-auto">
              <Tabs value={activeTab} className="w-full">
                <TabsContent
                  value="sample"
                  className="focus-visible:outline-none focus-visible:ring-0"
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
                    submitCode={handleSubmitCode}
                  />
                </TabsContent>

                <TabsContent
                  value="custom"
                  className="focus-visible:outline-none focus-visible:ring-0"
                >
                  <CustomTestcaseTab
                    isRunning={isRunning}
                    runCustomTestcase={handleRunCustomTestcase}
                    customTestResult={customTestResult}
                  />
                </TabsContent>
              </Tabs>

              {showCelebration && (
                <div className="fixed inset-0 pointer-events-none z-50">
                  {/* This div is just a container for the confetti effect */}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
