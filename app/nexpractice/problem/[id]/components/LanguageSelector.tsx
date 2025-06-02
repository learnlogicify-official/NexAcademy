import React, { useState, useRef } from "react";
import { Code, ChevronDown, Check, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";

// Judge0 API language mapping
const JUDGE0_LANGUAGES = {
  "45": "Assembly (NASM 2.14.02)",
  "46": "Bash (5.0.0)",
  "47": "Basic (FBC 1.07.1)",
  "75": "C (Clang 7.0.1)",
  "76": "C++ (Clang 7.0.1)",
  "48": "C (GCC 7.4.0)",
  "52": "C++ (GCC 7.4.0)",
  "49": "C (GCC 8.3.0)",
  "53": "C++ (GCC 8.3.0)",
  "50": "C (GCC 9.2.0)",
  "54": "C++ (GCC 9.2.0)",
  "86": "Clojure (1.10.1)",
  "51": "C# (Mono 6.6.0.161)",
  "77": "COBOL (GnuCOBOL 2.2)",
  "55": "Common Lisp (SBCL 2.0.0)",
  "56": "D (DMD 2.089.1)",
  "57": "Elixir (1.9.4)",
  "58": "Erlang (OTP 22.2)",
  "44": "Executable",
  "87": "F# (.NET Core SDK 3.1.202)",
  "59": "Fortran (GFortran 9.2.0)",
  "60": "Go (1.13.5)",
  "88": "Groovy (3.0.3)",
  "61": "Haskell (GHC 8.8.1)",
  "62": "Java (OpenJDK 13.0.1)",
  "63": "JavaScript (Node.js 12.14.0)",
  "78": "Kotlin (1.3.70)",
  "64": "Lua (5.3.5)",
  "89": "Multi-file program",
  "79": "Objective-C (Clang 7.0.1)",
  "65": "OCaml (4.09.0)",
  "66": "Octave (5.1.0)",
  "67": "Pascal (FPC 3.0.4)",
  "85": "Perl (5.28.1)",
  "68": "PHP (7.4.1)",
  "43": "Plain Text",
  "69": "Prolog (GNU Prolog 1.4.5)",
  "70": "Python (2.7.17)",
  "71": "Python (3.8.1)",
  "80": "R (4.0.0)",
  "72": "Ruby (2.7.0)",
  "73": "Rust (1.40.0)",
  "81": "Scala (2.13.2)",
  "82": "SQL (SQLite 3.27.2)",
  "83": "Swift (5.2.3)",
  "74": "TypeScript (3.7.4)",
  "84": "Visual Basic.Net (vbnc 0.0.0.5943)",
};

// Language icons mapping (for common languages)
const LANGUAGE_ICONS: Record<string, React.ReactNode> = {
  // JavaScript
  "63": (
    <div className="flex items-center justify-center w-full h-full">
      <span className="text-[11px] font-semibold text-yellow-500 dark:text-yellow-400 inline-flex">
        JS
      </span>
    </div>
  ),
  // TypeScript
  "74": (
    <div className="flex items-center justify-center w-full h-full">
      <span className="text-[11px] font-semibold text-blue-500 dark:text-blue-400 inline-flex">
        TS
      </span>
    </div>
  ),
  // Python
  "70": (
    <div className="flex items-center justify-center w-full h-full">
      <span className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 inline-flex">
        Py
      </span>
    </div>
  ),
  "71": (
    <div className="flex items-center justify-center w-full h-full">
      <span className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 inline-flex">
        Py
      </span>
    </div>
  ),
  // Java
  "62": (
    <div className="flex items-center justify-center w-full h-full">
      <span className="text-[11px] font-semibold text-orange-500 dark:text-orange-400 inline-flex">
        Ja
      </span>
    </div>
  ),
  // C
  "48": (
    <div className="flex items-center justify-center w-full h-full">
      <span className="text-[11px] font-semibold text-blue-500 dark:text-blue-400 inline-flex">
        C
      </span>
    </div>
  ),
  "49": (
    <div className="flex items-center justify-center w-full h-full">
      <span className="text-[11px] font-semibold text-blue-500 dark:text-blue-400 inline-flex">
        C
      </span>
    </div>
  ),
  "50": (
    <div className="flex items-center justify-center w-full h-full">
      <span className="text-[11px] font-semibold text-blue-500 dark:text-blue-400 inline-flex">
        C
      </span>
    </div>
  ),
  // C++
  "52": (
    <div className="flex items-center justify-center w-full h-full">
      <span className="text-[11px] font-semibold text-pink-500 dark:text-pink-400 inline-flex">
        C++
      </span>
    </div>
  ),
  "53": (
    <div className="flex items-center justify-center w-full h-full">
      <span className="text-[11px] font-semibold text-pink-500 dark:text-pink-400 inline-flex">
        C++
      </span>
    </div>
  ),
  "54": (
    <div className="flex items-center justify-center w-full h-full">
      <span className="text-[11px] font-semibold text-pink-500 dark:text-pink-400 inline-flex">
        C++
      </span>
    </div>
  ),
  // Go
  "60": (
    <div className="flex items-center justify-center w-full h-full">
      <span className="text-[11px] font-semibold text-teal-500 dark:text-teal-400 inline-flex">
        Go
      </span>
    </div>
  ),
  // Rust
  "73": (
    <div className="flex items-center justify-center w-full h-full">
      <span className="text-[11px] font-semibold text-orange-600 dark:text-orange-400 inline-flex">
        Rs
      </span>
    </div>
  ),
  // Ruby
  "72": (
    <div className="flex items-center justify-center w-full h-full">
      <span className="text-[11px] font-semibold text-red-500 dark:text-red-400 inline-flex">
        Rb
      </span>
    </div>
  ),
  // PHP
  "68": (
    <div className="flex items-center justify-center w-full h-full">
      <span className="text-[11px] font-semibold text-indigo-500 dark:text-indigo-400 inline-flex">
        PHP
      </span>
    </div>
  ),
};

// Helper to extract language name and version
const parseLanguageName = (fullName: string | undefined | null) => {
  if (!fullName || typeof fullName !== "string") {
    return { name: "", version: "" };
  }
  const match = fullName.match(/^(.+?)\s+\((.+?)\)$/);
  if (match) {
    return {
      name: match[1],
      version: match[2],
    };
  }
  return { name: fullName, version: "" };
};

interface LanguageSelectorProps {
  language: string;
  onLanguageChange: (newLanguage: string) => void;
  editorLoading: boolean;
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  language,
  onLanguageChange,
  editorLoading,
}) => {
  const [languageDropdownOpen, setLanguageDropdownOpen] = useState(false);
  const [searchLanguage, setSearchLanguage] = useState("");

  return (
    <Popover open={languageDropdownOpen} onOpenChange={setLanguageDropdownOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="mr-2 flex items-center gap-1 md:gap-2 border-indigo-200 dark:border-indigo-800/50 bg-gradient-to-r from-white to-slate-50 dark:from-slate-800 dark:to-slate-800/90 text-slate-700 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 min-w-[120px] md:min-w-[180px] h-8 md:h-9 pl-1 md:pl-2 pr-2 md:pr-3 overflow-hidden group relative"
          disabled={editorLoading}
        >
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-indigo-500 to-indigo-600 dark:from-indigo-400 dark:to-indigo-500"></div>
          <div className="flex items-center gap-1 md:gap-2 overflow-hidden">
            <div className="flex items-center justify-center w-5 h-5 md:w-6 md:h-6 bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900 dark:to-indigo-800/30 rounded-md border border-indigo-200 dark:border-indigo-700/30 shadow-sm flex-shrink-0">
              {LANGUAGE_ICONS[language as keyof typeof LANGUAGE_ICONS] || (
                <Code className="h-3 w-3 md:h-3.5 md:w-3.5 text-indigo-500 dark:text-indigo-400" />
              )}
            </div>
            <div className="flex flex-col leading-none overflow-hidden">
              <span className="font-medium text-xs md:text-sm truncate">
                {
                  parseLanguageName(
                    JUDGE0_LANGUAGES[language as keyof typeof JUDGE0_LANGUAGES]
                  ).name
                }
              </span>
              <span className="text-[10px] md:text-xs text-slate-500 dark:text-slate-400 truncate">
                {
                  parseLanguageName(
                    JUDGE0_LANGUAGES[language as keyof typeof JUDGE0_LANGUAGES]
                  ).version
                }
              </span>
            </div>
          </div>
          <ChevronDown className="h-3 w-3 ml-auto opacity-60 group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition-colors" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-[680px] p-0 max-h-[600px] overflow-hidden flex flex-col border-indigo-100 dark:border-indigo-900/50 shadow-lg rounded-xl"
      >
        <div className="language-dropdown-header sticky top-0 z-30 bg-white dark:bg-black border-b border-indigo-100 dark:border-indigo-900/50 p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="h-5 w-1 bg-gradient-to-b from-indigo-500 to-purple-500 rounded-full"></div>
              <h3 className="font-semibold text-slate-800 dark:text-slate-200 text-base">
                Select Programming Language
              </h3>
            </div>
            <div className="text-xs bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-30 px-2 py-0.5 rounded-full font-medium">
              {Object.keys(JUDGE0_LANGUAGES).length} languages available
            </div>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search languages..."
              className="pl-10 py-2 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg"
              value={searchLanguage}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setSearchLanguage(e.target.value)
              }
            />
          </div>
        </div>

        <div className="overflow-y-auto flex-1 p-4 custom-scrollbar bg-gradient-to-br from-slate-50/50 to-white dark:from-slate-900 dark:to-slate-800/90">
          <div className="language-grid grid grid-cols-3 gap-x-3 gap-y-2.5">
            {Object.entries(JUDGE0_LANGUAGES)
              .filter(
                ([id, name]) =>
                  !searchLanguage ||
                  name.toLowerCase().includes(searchLanguage.toLowerCase())
              )
              .map(
                (
                  [langId, langName]: [string, string],
                  index: number,
                  array: [string, string][]
                ) => {
                  const { name, version } = parseLanguageName(langName);
                  const isSelected: boolean = language === langId;
                  const showDivider: boolean =
                    index > 0 && index % 6 === 0 && index !== array.length - 1;
                  return (
                    <React.Fragment key={`lang-${langId}`}>
                      {showDivider && (
                        <div className="col-span-3 h-px bg-gradient-to-r from-transparent via-slate-200 dark:via-slate-700 to-transparent my-2.5"></div>
                      )}
                      <div
                        className={`language-item group h-14 rounded-lg px-3 transition-all duration-200 hover:shadow-md border ${
                          isSelected
                            ? "border-indigo-200 dark:border-indigo-800/50 bg-indigo-50/70 dark:bg-indigo-900/20"
                            : "border-transparent hover:border-slate-200 dark:hover:border-slate-700 hover:bg-white dark:hover:bg-slate-800/60"
                        } ${isSelected ? "active" : ""}`}
                        onClick={() => {
                          onLanguageChange(langId);
                          setLanguageDropdownOpen(false);
                        }}
                      >
                        <div className="flex items-center gap-3 w-full h-full overflow-hidden">
                          <div className="language-icon-container flex-shrink-0 w-7 h-7 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-center shadow-sm group-hover:from-indigo-50 group-hover:to-indigo-100 dark:group-hover:from-indigo-900/20 dark:group-hover:to-indigo-900/30 transition-all duration-200">
                            {LANGUAGE_ICONS[langId] || (
                              <div className="flex items-center justify-center w-full h-full">
                                <Code className="h-3.5 w-3.5 text-slate-400 group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition-colors" />
                              </div>
                            )}
                          </div>
                          <div className="flex flex-col leading-tight overflow-hidden flex-1">
                            <span className="font-medium truncate text-slate-700 dark:text-slate-300 group-hover:text-indigo-700 dark:group-hover:text-indigo-300 transition-colors">
                              {name}
                            </span>
                            {version && (
                              <span className="version truncate text-xs text-slate-500 dark:text-slate-400 group-hover:text-indigo-500/70 dark:group-hover:text-indigo-400/70 transition-colors">
                                {version}
                              </span>
                            )}
                          </div>
                          {isSelected && (
                            <div className="flex-shrink-0 h-5 w-5 bg-indigo-500 dark:bg-indigo-400 rounded-full flex items-center justify-center">
                              <Check className="h-3 w-3 text-white" />
                            </div>
                          )}
                        </div>
                      </div>
                    </React.Fragment>
                  );
                }
              )}
          </div>

          {searchLanguage &&
            Object.entries(JUDGE0_LANGUAGES).filter(([id, name]) =>
              name.toLowerCase().includes(searchLanguage.toLowerCase())
            ).length === 0 && (
              <div className="text-center py-12 px-4">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 mb-3">
                  <Search className="h-6 w-6 text-slate-400" />
                </div>
                <h4 className="text-base font-medium text-slate-700 dark:text-slate-300 mb-1">
                  No Results Found
                </h4>
                <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                  We couldn't find any programming language matching "
                  {searchLanguage}"
                </p>
              </div>
            )}
        </div>

        <div className="border-t border-slate-200 dark:border-slate-700 px-4 py-3 flex justify-between items-center bg-gradient-to-r from-slate-50 to-white dark:from-slate-900 dark:to-slate-800">
          <div className="flex items-center">
            <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
            <div className="text-sm text-slate-600 dark:text-slate-300">
              Currently using:{" "}
              <span className="font-semibold text-indigo-600 dark:text-indigo-400 ml-1">
                {
                  parseLanguageName(
                    JUDGE0_LANGUAGES[language as keyof typeof JUDGE0_LANGUAGES]
                  ).name
                }
              </span>
            </div>
          </div>
          {searchLanguage && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSearchLanguage("")}
              className="h-8 text-xs border-indigo-200 dark:border-indigo-800/50 bg-white dark:bg-slate-800"
            >
              <X className="h-3.5 w-3.5 mr-1.5" />
              Clear Search
            </Button>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default LanguageSelector;
export { JUDGE0_LANGUAGES, parseLanguageName };
