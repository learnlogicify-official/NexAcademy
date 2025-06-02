import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Check,
  ChevronDown,
  Code,
  Indent,
  Loader2,
  Moon,
  Play,
  Search,
  Send,
  Settings,
  Sun,
  Type,
  X,
} from "lucide-react";
import { FaCode } from "react-icons/fa";
import { BsArrowRepeat } from "react-icons/bs";
import { CgFormatLeft } from "react-icons/cg";
import { LuMaximize, LuMinimize } from "react-icons/lu";
import { NexEditor as CodeEditor } from "@/components/NexEditor";
import { GoChevronUp } from "react-icons/go";
import { GoChevronDown } from "react-icons/go";

interface CodeEditorSectionProps {
  hasMounted: boolean;
  isMobile: boolean;
  activePanel: string;
  editorHeight: number;
  language: string;
  editorTheme: string;
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
  JUDGE0_LANGUAGES: any;
  setCode: (code: string) => void;
  setFontSize: (size: number) => void;
  setTabSize: (size: number) => void;
  setEditorTheme: (theme: "light" | "vs-dark") => void;
  setSearchLanguage: (lang: string) => void;
  setLanguageDropdownOpen: (open: boolean) => void;
  setFormatSuccess: (success: boolean) => void;
  runCode: () => void;
  submitCode: () => void;
  formatCode: () => Promise<void>;
  toggleFocusMode: () => void;
  handleLanguageChange: (langId: string) => void;
  parseLanguageName: (fullName: string | undefined | null) => {
    name: string;
    version: string;
  };
  focusMode: boolean;
  preloadCode: string;
  editorRef: React.RefObject<any>;
  monacoRef: React.RefObject<any>;
  handleEditorDidMount: (editor: any, monaco: any) => void;
  style?: React.CSSProperties;
}

export default function CodeEditorSection({
  hasMounted,
  isMobile,
  activePanel,
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
  style,
}: CodeEditorSectionProps) {
  return (
    <div
      className="flex flex-col overflow-hidden rounded-lg"
      style={{
        flexBasis: hasMounted && isMobile ? "100%" : `${editorHeight}%`,
        flexGrow: 0,
        flexShrink: 1,
        minHeight: 0,
        maxHeight: hasMounted && isMobile ? "100%" : `${editorHeight}%`,
        height: hasMounted && isMobile ? "100%" : undefined,
        transition: "all 0.3s ease-in-out",
        ...style,
      }}
    >
      <div className="flex items-center justify-between p-2 pl-3 bg-white dark:bg-[#292929]">
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
          )}

          <TooltipProvider delayDuration={0}>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={toggleFocusMode}
                  className="bg-transparent hover:bg-[#484848] rounded-[8px] p-1.5 transition-colors duration-300"
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
                className="w-fit p-2 px-3 rounded-sm bg-[#1f1f1f] text-xs border border-[#444444]"
              >
                {focusMode ? "Exit Focus Mode" : "Focus Mode"}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider delayDuration={0}>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={toggleFocusMode}
                  className="bg-transparent hover:bg-[#484848] rounded-[6px] p-1 transition-colors duration-300"
                >
                  {focusMode ? (
                    <GoChevronDown className="h-4 w-4" />
                  ) : (
                    <GoChevronUp className="h-4 w-4" />
                  )}
                </button>
              </TooltipTrigger>
              <TooltipContent
                side="top"
                align="center"
                className="w-fit p-2 px-3 rounded-sm bg-[#1f1f1f] text-xs border border-[#444444]"
              >
                {focusMode ? "Unfold" : "Fold"}
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
                          const { name, version } = parseLanguageName(langName);
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
                    name.toLowerCase().includes(searchLanguage.toLowerCase())
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
      <div className="flex items-center justify-end p-1 border-b border-[#292929] bg-white dark:bg-[#1f1f1f]">
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
                      <div className="bg-transparent hover:bg-[#484848] rounded-[4px] p-1 transition-colors duration-300">
                        <span>
                          <Settings className="h-3 w-3 cursor-pointer" />
                        </span>
                      </div>
                    </PopoverTrigger>
                  </TooltipTrigger>
                  <TooltipContent
                    side="top"
                    align="center"
                    className="w-fit p-2 px-3 rounded-sm bg-[#1f1f1f] text-xs border border-[#444444]"
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
                          left: `calc(${((fontSize - 12) / 12) * 100}% - 6px)`,
                        }}
                      ></div>
                      <input
                        type="range"
                        min="12"
                        max="24"
                        value={fontSize}
                        onChange={(e) => setFontSize(Number(e.target.value))}
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
                          onClick={() => setTabSize(Math.max(2, tabSize - 2))}
                          className="h-5 w-5 flex items-center justify-center bg-gray-100 dark:bg-[#1a1a1a] rounded-l-md border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white"
                        >
                          <span className="text-xs">-</span>
                        </button>
                        <span className="text-xs font-medium text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-[#2a2a2a] px-2 py-0.5 border-t border-b border-gray-200 dark:border-gray-700/50 min-w-[70px] text-center">
                          {tabSize} spaces
                        </span>
                        <button
                          onClick={() => setTabSize(Math.min(8, tabSize + 2))}
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
                          left: `calc(${((tabSize - 2) / 6) * 100}% - 6px)`,
                        }}
                      ></div>
                      <input
                        type="range"
                        min="2"
                        max="8"
                        step="2"
                        value={tabSize}
                        onChange={(e) => setTabSize(Number(e.target.value))}
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
                  className="bg-transparent hover:bg-[#484848] rounded-[4px] p-1 transition-colors duration-300"
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
                className="w-fit p-2 px-3 rounded-sm bg-[#1f1f1f] text-xs border border-[#444444]"
              >
                Format
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider delayDuration={0}>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  className="bg-transparent hover:bg-[#484848] rounded-[4px] p-1 transition-colors duration-300"
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
                className="w-fit p-2 px-3 rounded-sm bg-[#1f1f1f] text-xs border border-[#444444]"
              >
                Reset Code
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
      <div className="flex-1 overflow-auto" style={{ minHeight: 0 }}>
        <div className="h-full w-full relative bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900">
          {editorLoading || initialLoading ? (
            <div className="flex items-center justify-center h-full w-full overflow-hidden">
              <div className="w-full h-full flex flex-col">
                <div className="h-full w-full relative overflow-hidden rounded-md">
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/40 to-purple-50/40 dark:from-indigo-900/10 dark:to-purple-900/10"></div>
                  <div className="absolute inset-0 bg-[linear-gradient(110deg,transparent_33%,rgba(79,70,229,0.05)_50%,transparent_66%)] dark:bg-[linear-gradient(110deg,transparent_33%,rgba(79,70,229,0.1)_50%,transparent_66%)] bg-size-200 animate-shimmer"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="space-y-8 w-1/2 max-w-md">
                      <div className="flex items-center space-x-3">
                        <div className="h-10 w-10 rounded-full bg-indigo-100/60 dark:bg-indigo-900/20 flex items-center justify-center">
                          <Code className="h-5 w-5 text-indigo-400/60 dark:text-indigo-400/40" />
                        </div>
                        <div className="h-3 bg-indigo-200/60 dark:bg-indigo-700/30 rounded-md w-36"></div>
                      </div>
                      <div className="space-y-3">
                        <div className="h-3 bg-slate-200/60 dark:bg-slate-700/30 rounded-md w-full"></div>
                        <div className="h-3 bg-slate-200/60 dark:bg-slate-700/30 rounded-md w-5/6"></div>
                        <div className="h-3 bg-slate-200/60 dark:bg-slate-700/30 rounded-md w-4/6"></div>
                      </div>
                      <div className="space-y-3">
                        <div className="h-3 bg-indigo-200/40 dark:bg-indigo-800/20 rounded-md w-full"></div>
                        <div className="h-3 bg-indigo-200/40 dark:bg-indigo-800/20 rounded-md w-3/4"></div>
                        <div className="h-3 bg-indigo-200/40 dark:bg-indigo-800/20 rounded-md w-5/6"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
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
          )}
        </div>
      </div>
    </div>
  );
}
