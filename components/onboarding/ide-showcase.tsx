"use client"

import { useEffect, useState, useRef } from "react"
import { MonacoEditor } from "@/components/ui/monaco-editor"
import { Button } from "@/components/ui/button"
import Select from "react-select"
import { Settings } from "lucide-react"
import { useRouter } from "next/navigation"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { useTheme } from "next-themes"
import type { editor } from "monaco-editor"

const THEMES = [
  { name: "VS Dark", value: "vs-dark" },
  { name: "VS Light", value: "vs" }
]

const FONT_SIZES = [12, 14, 16, 18, 20]
const TAB_SIZES = [2, 4, 8]

const HELLO_WORLD: Record<string, string> = {
    "Assembly (NASM 2.14.02)": "section .data\n    msg db 'Hello, World!',0xA\nsection .text\n    global _start\n_start:\n    mov edx,13\n    mov ecx,msg\n    mov ebx,1\n    mov eax,4\n    int 0x80\n    mov eax,1\n    int 0x80",
    "Bash (5.0.0)": "echo \"Hello, World!\"",
    "Basic (FBC 1.07.1)": "PRINT \"Hello, World!\"",
    "C (Clang 18.1.8)": "#include <stdio.h>\nint main() {\n    printf(\"Hello, World!\\n\");\n    return 0;\n}",
    "C (Clang 19.1.7)": "#include <stdio.h>\nint main() {\n    printf(\"Hello, World!\\n\");\n    return 0;\n}",
    "C (Clang 7.0.1)": "#include <stdio.h>\nint main() {\n    printf(\"Hello, World!\\n\");\n    return 0;\n}",
    "C++ (Clang 7.0.1)": "#include <iostream>\nint main() {\n    std::cout << \"Hello, World!\" << std::endl;\n    return 0;\n}",
    "C (GCC 14.1.0)": "#include <stdio.h>\nint main() {\n    printf(\"Hello, World!\\n\");\n    return 0;\n}",
    "C++ (GCC 14.1.0)": "#include <iostream>\nint main() {\n    std::cout << \"Hello, World!\" << std::endl;\n    return 0;\n}",
    "C (GCC 7.4.0)": "#include <stdio.h>\nint main() {\n    printf(\"Hello, World!\\n\");\n    return 0;\n}",
    "C++ (GCC 7.4.0)": "#include <iostream>\nint main() {\n    std::cout << \"Hello, World!\" << std::endl;\n    return 0;\n}",
    "C++ (GCC 8.3.0)": "#include <iostream>\nint main() {\n    std::cout << \"Hello, World!\" << std::endl;\n    return 0;\n}",
    "C++ (GCC 9.2.0)": "#include <iostream>\nint main() {\n    std::cout << \"Hello, World!\" << std::endl;\n    return 0;\n}",
    "C# (Mono 6.10.0.104)": "using System;\n\nclass MainClass {\n    static void Main() {\n        Console.WriteLine(\"Hello, World!\");\n    }\n}",
    "Common Lisp (SBCL 2.0.0)": "(format t \"Hello, World!~%\")",
    "D (DMD 2.089.1)": "import std.stdio;\n\nvoid main() {\n    writeln(\"Hello, World!\");\n}",
    "Elixir (1.9.4)": "IO.puts \"Hello, World!\"",
    "Erlang (OTP 22.2)": "main(_) ->\n    io:fwrite(\"Hello, World!~n\").",
    "F# (.NET Core SDK 3.1.202)": "printfn \"Hello, World!\"",
    "Fortran (GFortran 9.2.0)": "program Hello\n    print *, \"Hello, World!\"\nend program Hello",
    "Go (1.13.5)": "package main\n\nimport \"fmt\"\n\nfunc main() {\n    fmt.Println(\"Hello, World!\")\n}",
    "Groovy (3.0.3)": "println \"Hello, World!\"",
    "Haskell (GHC 8.8.1)": "main = putStrLn \"Hello, World!\"",
    "Java (JDK 13.0.1)": "public class Main {\n    public static void main(String[] args) {\n        System.out.println(\"Hello, World!\");\n    }\n}",
    "Java (OpenJDK 14.0.1)": "public class Main {\n    public static void main(String[] args) {\n        System.out.println(\"Hello, World!\");\n    }\n}",
    "JavaScript (Node.js 12.14.0)": "console.log(\"Hello, World!\");",
    "JavaScript (Node.js 14.5.0)": "console.log(\"Hello, World!\");",
    "Kotlin (1.3.70)": "fun main() {\n    println(\"Hello, World!\")\n}",
    "Lua (5.3.5)": "print(\"Hello, World!\")",
    "Objective-C (Clang 7.0.1)": "#import <Foundation/Foundation.h>\n\nint main() {\n    @autoreleasepool {\n        NSLog(@\"Hello, World!\");\n    }\n    return 0;\n}",
    "Pascal (FPC 3.0.4)": "program Hello;\nbegin\n    writeln ('Hello, World!');\nend.",
    "Perl (5.30.0)": "print \"Hello, World!\\n\";",
    "PHP (7.4.1)": "<?php\necho \"Hello, World!\\n\";\n?>",
    "Plain Text": "Hello, World!",
    "Python (2.7.17)": "print \"Hello, World!\"",
    "Python (3.8.1)": "print(\"Hello, World!\")",
    "Python (3.8.3)": "print(\"Hello, World!\")",
    "Python (3.9.0)": "print(\"Hello, World!\")",
    "R (4.0.0)": "cat(\"Hello, World!\\n\")",
    "Ruby (2.7.0)": "puts \"Hello, World!\"",
    "Rust (1.40.0)": "fn main() {\n    println!(\"Hello, World!\");\n}",
    "Scala (2.13.2)": "object Main extends App {\n    println(\"Hello, World!\")\n}",
    "Swift (5.2.3)": "print(\"Hello, World!\")",
    "TypeScript (3.7.4)": "console.log(\"Hello, World!\");",
    "TypeScript (3.8.3)": "console.log(\"Hello, World!\");",
    "Visual Basic.Net (vbnc 0.0.0.5943)": "Imports System\n\nModule Program\n    Sub Main()\n        Console.WriteLine(\"Hello, World!\")\n    End Sub\nEnd Module"
}

interface IDEShowcaseProps {
  preferredLanguage?: string
  onFinishOnboarding: () => void
}

export default function IDEShowcase({ preferredLanguage, onFinishOnboarding }: IDEShowcaseProps) {
  const router = useRouter()
  const { theme: appTheme } = useTheme()
  const isDark = appTheme === "dark"
  
  const [code, setCode] = useState<string>("")
  const [language, setLanguage] = useState<string>("")
  const [theme, setTheme] = useState<string>(isDark ? "vs-dark" : "vs")
  const [showSettings, setShowSettings] = useState(false)
  const [isRunning, setIsRunning] = useState(false)
  const [output, setOutput] = useState<string>("")
  const [fontSize, setFontSize] = useState<number>(14)
  const [tabSize, setTabSize] = useState<number>(2)
  const [languages, setLanguages] = useState<any[]>([])
  const [loadingLangs, setLoadingLangs] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [isDefaultCode, setIsDefaultCode] = useState<boolean>(false)
  const settingsRef = useRef<HTMLDivElement>(null)

  // Options for the theme dropdown
  const themeOptions = THEMES.map(theme => ({
    value: theme.value,
    label: theme.name
  }))

  // Fetch Judge0 languages and set initial language/code
  useEffect(() => {
    setLoadingLangs(true)
    fetch("https://judge0-ce.p.rapidapi.com/languages", {
      headers: {
        "X-RapidAPI-Key": process.env.NEXT_PUBLIC_RAPIDAPI_KEY || "",
        "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com"
      }
    })
      .then((res) => res.json())
      .then((data) => {
        const langs = data.map((lang: any) => ({ id: lang.id, name: lang.name }))
        setLanguages(langs)
        let initialLang = ""
        if (preferredLanguage && langs.some((l: { id: number; name: string }) => l.name === preferredLanguage)) {
          initialLang = preferredLanguage
        } else if (langs.length > 0) {
          initialLang = langs[0].name
        }
        setLanguage(initialLang)
        setCode(
          HELLO_WORLD[initialLang] ||
          `// Hello, World! snippet not available for ${initialLang}.\n// Write your code here\n`
        )
        setIsDefaultCode(true)
        setLoadingLangs(false)
      })
      .catch(() => {
        setError("Could not fetch languages from Judge0")
        setLoadingLangs(false)
      })
    // eslint-disable-next-line
  }, [preferredLanguage])

  // When language changes, update code if default
  useEffect(() => {
    if (!language) return
    if (isDefaultCode) {
      setCode(
        HELLO_WORLD[language] ||
        `// Hello, World! snippet not available for ${language}.\n// Write your code here\n`
      )
    }
    setIsDefaultCode(true)
    // eslint-disable-next-line
  }, [language])

  // Handle clicking outside settings menu
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (settingsRef.current && !settingsRef.current.contains(event.target as Node)) {
        setShowSettings(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [settingsRef])

  // Handle code change from editor
  const handleCodeChange = (newCode: string) => {
    setCode(newCode)
    setIsDefaultCode(false)
  }

  // Run code
  const handleRun = () => {
    if (!language) return
    
    // Find language ID
    const langId = languages.find((lang: { name: string }) => lang.name === language)?.id

    if (!langId) {
      setError("Invalid language selected")
      return
    }

    setIsRunning(true)
    setOutput("")

    fetch("https://judge0-ce.p.rapidapi.com/submissions", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "X-RapidAPI-Key": process.env.NEXT_PUBLIC_RAPIDAPI_KEY || "",
        "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com"
      },
      body: JSON.stringify({
        language_id: langId,
        source_code: code,
        stdin: ""
      })
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.token) {
          checkSubmission(data.token)
        } else {
          setIsRunning(false)
          setError("Failed to submit code")
        }
      })
      .catch((error) => {
        console.error("Error:", error)
        setIsRunning(false)
        setError("Network error")
      })
  }

  // Check submission status
  const checkSubmission = (token: string) => {
    setTimeout(() => {
      fetch(`https://judge0-ce.p.rapidapi.com/submissions/${token}?base64_encoded=false`, {
        headers: {
          "X-RapidAPI-Key": process.env.NEXT_PUBLIC_RAPIDAPI_KEY || "",
          "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com"
        }
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.status?.id <= 2) {
            // Still processing
            checkSubmission(token)
          } else {
            setIsRunning(false)
            if (data.status?.id === 3) {
              // Success
              setOutput(data.stdout || "No output")
            } else {
              // Error
              setOutput(data.stderr || data.compile_output || "Unknown error")
            }
          }
        })
        .catch((error) => {
          console.error("Error:", error)
          setIsRunning(false)
          setError("Network error while checking submission")
        })
    }, 1000)
  }

  // Handle continue button
  const handleContinue = () => {
    onFinishOnboarding()
  }

  // Monaco editor options
  const editorOptions: editor.IStandaloneEditorConstructionOptions = {
    minimap: { enabled: false },
    scrollBeyondLastLine: false,
    fontSize: fontSize,
    tabSize: tabSize,
    automaticLayout: true,
    wordWrap: "on",
    renderLineHighlight: "all",
    fontFamily: "Menlo, Monaco, 'Courier New', monospace",
    cursorBlinking: "blink" as const,
    useTabStops: true,
    roundedSelection: true
  }

  return (
    <div className="p-4 bg-slate-900 rounded-lg text-white">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8 rounded-md bg-violet-700 text-white">
            <AvatarFallback>NP</AvatarFallback>
          </Avatar>
          <div>
            <div className="text-sm font-medium flex items-center">
              <span>Try coding in your preferred language</span>
            </div>
            <div className="text-xs text-slate-400">
              {loadingLangs ? "Loading languages..." : (
                <Select
                  classNamePrefix="react-select"
                  options={languages.map((lang: { id: string, name: string }) => ({
                    value: lang.name,
                    label: lang.name
                  }))}
                  value={{ value: language, label: language }}
                  onChange={(opt) => setLanguage(opt?.value || "")}
                  isSearchable
                  styles={{
                    container: (base) => ({ ...base, minWidth: 200 }),
                    control: (base) => ({ ...base, background: '#1e293b', borderColor: '#334155', minHeight: 26, height: 26 }),
                    menu: (base) => ({ ...base, background: '#1e293b', color: '#f1f5f9' }),
                    singleValue: (base) => ({ ...base, color: '#f1f5f9' }),
                    option: (base, state) => ({ ...base, background: state.isFocused ? '#334155' : '#1e293b', color: '#f1f5f9' }),
                    input: (base) => ({ ...base, color: '#f1f5f9' }),
                    indicatorsContainer: (base) => ({ ...base, height: 26 }),
                    dropdownIndicator: (base) => ({ ...base, padding: 4 }),
                    clearIndicator: (base) => ({ ...base, padding: 4 }),
                    valueContainer: (base) => ({ ...base, padding: '0 6px' }),
                  }}
                />
              )}
            </div>
          </div>
        </div>

        <div className="relative" ref={settingsRef}>
          <button
            type="button"
            className="p-2 rounded-full hover:bg-slate-800 transition"
            title="IDE Settings"
            onClick={() => setShowSettings((v) => !v)}
          >
            <Settings className="w-5 h-5 text-slate-400" />
          </button>
          {showSettings && (
            <div className="absolute right-0 mt-2 w-56 bg-slate-800 border border-slate-700 rounded-lg shadow-lg z-50 p-4 flex flex-col gap-4">
              <div className="flex flex-col items-start min-w-[120px]">
                <label className="text-slate-300 text-xs font-mono mb-1" title="Choose your theme">Theme</label>
                <Select
                  classNamePrefix="react-select"
                  options={themeOptions}
                  value={themeOptions.find(opt => opt.value === theme) || null}
                  onChange={opt => setTheme(opt?.value || THEMES[0].value)}
                  isSearchable={false}
                  styles={{
                    control: (base) => ({ ...base, background: '#1e293b', borderColor: '#334155', minHeight: 32, fontSize: 12 }),
                    menu: (base) => ({ ...base, background: '#1e293b', color: '#f1f5f9', fontSize: 12 }),
                    singleValue: (base) => ({ ...base, color: '#f1f5f9' }),
                    option: (base, state) => ({ ...base, background: state.isFocused ? '#334155' : '#1e293b', color: '#f1f5f9' }),
                  }}
                />
              </div>
              <div className="flex flex-col items-start min-w-[100px]">
                <label className="text-slate-300 text-xs font-mono mb-1" title="Font size">Font Size</label>
                <input
                  type="range"
                  min={12}
                  max={20}
                  value={fontSize}
                  onChange={e => setFontSize(Number(e.target.value))}
                  className="w-24 accent-violet-600"
                />
                <span className="text-xs text-slate-400 font-mono ml-1">{fontSize}px</span>
              </div>
              <div className="flex flex-col items-start min-w-[100px]">
                <label className="text-slate-300 text-xs font-mono mb-1" title="Tab size">Tab Size</label>
                <input
                  type="range"
                  min={2}
                  max={8}
                  step={2}
                  value={tabSize}
                  onChange={e => setTabSize(Number(e.target.value))}
                  className="w-20 accent-violet-600"
                />
                <span className="text-xs text-slate-400 font-mono ml-1">{tabSize}</span>
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="mb-2">
        <MonacoEditor
          value={code}
          height="240px"
          language={language}
          onChange={handleCodeChange}
          options={editorOptions}
          className="rounded-md overflow-hidden"
        />
      </div>
      <div className="flex gap-2 mb-2">
        <Button onClick={handleRun} disabled={isRunning} className="bg-violet-600 hover:bg-violet-700 text-white font-mono px-4 py-1 rounded text-xs">
          {isRunning ? "Running..." : "Run"}
        </Button>
        <Button onClick={handleContinue} className="ml-auto bg-emerald-600 hover:bg-emerald-700 text-white font-mono px-4 py-1 rounded text-xs">
          Continue →
        </Button>
      </div>
      {error && (
        <div className="mt-2 p-2 bg-red-800/30 border border-red-800 rounded text-red-200 text-xs">
          {error}
        </div>
      )}
      {output && (
        <div className="mt-2">
          <div className="p-2 bg-slate-800 rounded-t-md border-b border-slate-700 text-xs font-mono text-slate-400">
            Output
          </div>
          <pre className="p-3 bg-slate-800 rounded-b-md text-sm font-mono text-emerald-400 overflow-auto max-h-32">
            {output}
          </pre>
        </div>
      )}
    </div>
  )
} 