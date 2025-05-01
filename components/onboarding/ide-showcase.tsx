"use client"

import { useEffect, useState, useRef } from "react"
import CodeMirror from "@uiw/react-codemirror"
import { javascript } from "@codemirror/lang-javascript"
import { python } from "@codemirror/lang-python"
import { java } from "@codemirror/lang-java"
import { cpp } from "@codemirror/lang-cpp"
import { oneDark } from "@codemirror/theme-one-dark"
import { Button } from "@/components/ui/button"
import Select from "react-select"
import { Settings } from "lucide-react"
import { useRouter } from "next/navigation"
import OnboardingComplete from "./onboarding-complete"

const THEMES = [
  { name: "One Dark", value: "one-dark", extension: oneDark },
  // Add more themes here if installed
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
    "C (GCC 8.3.0)": "#include <stdio.h>\nint main() {\n    printf(\"Hello, World!\\n\");\n    return 0;\n}",
    "C++ (GCC 8.3.0)": "#include <iostream>\nint main() {\n    std::cout << \"Hello, World!\" << std::endl;\n    return 0;\n}",
    "C (GCC 9.2.0)": "#include <stdio.h>\nint main() {\n    printf(\"Hello, World!\\n\");\n    return 0;\n}",
    "C++ (GCC 9.2.0)": "#include <iostream>\nint main() {\n    std::cout << \"Hello, World!\" << std::endl;\n    return 0;\n}",
    "Clojure (1.10.1)": "(println \"Hello, World!\")",
    "C# (Mono 6.6.0.161)": "using System;\nclass Program {\n    static void Main() {\n        Console.WriteLine(\"Hello, World!\");\n    }\n}",
    "COBOL (GnuCOBOL 2.2)": "IDENTIFICATION DIVISION.\nPROGRAM-ID. HELLO.\nPROCEDURE DIVISION.\n    DISPLAY 'Hello, World!'.\n    STOP RUN.",
    "Common Lisp (SBCL 2.0.0)": "(format t \"Hello, World!~%\")",
    "Dart (2.19.2)": "void main() {\n  print('Hello, World!');\n}",
    "D (DMD 2.089.1)": "import std.stdio;\nvoid main() {\n    writeln(\"Hello, World!\");\n}",
    "Elixir (1.9.4)": "IO.puts \"Hello, World!\"",
    "Erlang (OTP 22.2)": "-module(hello).\n-export([start/0]).\nstart() -> io:fwrite(\"Hello, World!~n\").",
    "F# (.NET Core SDK 3.1.202)": "printfn \"Hello, World!\"",
    "Fortran (GFortran 9.2.0)": "program hello\n  print *, 'Hello, World!'\nend program hello",
    "Go (1.13.5)": "package main\nimport \"fmt\"\nfunc main() {\n    fmt.Println(\"Hello, World!\")\n}",
    "Go (1.18.5)": "package main\nimport \"fmt\"\nfunc main() {\n    fmt.Println(\"Hello, World!\")\n}",
    "Go (1.22.0)": "package main\nimport \"fmt\"\nfunc main() {\n    fmt.Println(\"Hello, World!\")\n}",
    "Go (1.23.5)": "package main\nimport \"fmt\"\nfunc main() {\n    fmt.Println(\"Hello, World!\")\n}",
    "Groovy (3.0.3)": "println 'Hello, World!'",
    "Haskell (GHC 8.8.1)": "main = putStrLn \"Hello, World!\"",
    "JavaFX (JDK 17.0.6, OpenJFX 22.0.2)": "public class Main extends javafx.application.Application {\n    public void start(javafx.stage.Stage stage) {\n        System.out.println(\"Hello, World!\");\n        javafx.application.Platform.exit();\n    }\n    public static void main(String[] args) {\n        launch(args);\n    }\n}",
    "Java (JDK 17.0.6)": "public class Main {\n    public static void main(String[] args) {\n        System.out.println(\"Hello, World!\");\n    }\n}",
    "Java (OpenJDK 13.0.1)": "public class Main {\n    public static void main(String[] args) {\n        System.out.println(\"Hello, World!\");\n    }\n}",
    "JavaScript (Node.js 12.14.0)": "console.log(\"Hello, World!\")",
    "JavaScript (Node.js 18.15.0)": "console.log(\"Hello, World!\")",
    "JavaScript (Node.js 20.17.0)": "console.log(\"Hello, World!\")",
    "JavaScript (Node.js 22.08.0)": "console.log(\"Hello, World!\")",
    "Kotlin (1.3.70)": "fun main() {\n    println(\"Hello, World!\")\n}",
    "Kotlin (2.1.10)": "fun main() {\n    println(\"Hello, World!\")\n}",
    "Lua (5.3.5)": "print(\"Hello, World!\")",
    "Objective-C (Clang 7.0.1)": "#import <stdio.h>\nint main() {\n    printf(\"Hello, World!\\n\");\n    return 0;\n}",
    "OCaml (4.09.0)": "print_endline \"Hello, World!\";;",
    "Octave (5.1.0)": "disp('Hello, World!')",
    "Pascal (FPC 3.0.4)": "program HelloWorld;\nbegin\n  writeln('Hello, World!');\nend.",
    "Perl (5.28.1)": "print \"Hello, World!\\n\";",
    "PHP (7.4.1)": "<?php\necho \"Hello, World!\";\n?>",
    "PHP (8.3.11)": "<?php\necho \"Hello, World!\";\n?>",
    "Prolog (GNU Prolog 1.4.5)": ":- initialization(main).\nmain :- write('Hello, World!'), nl.",
    "Python (2.7.17)": "print \"Hello, World!\"",
    "Python (3.11.2)": "print(\"Hello, World!\")",
    "Python (3.12.5)": "print(\"Hello, World!\")",
    "Python (3.13.2)": "print(\"Hello, World!\")",
    "Python (3.8.1)": "print(\"Hello, World!\")",
    "R (4.0.0)": "cat('Hello, World!\\n')",
    "R (4.4.1)": "cat('Hello, World!\\n')",
    "Ruby (2.7.0)": "puts \"Hello, World!\"",
    "Rust (1.40.0)": "fn main() {\n    println!(\"Hello, World!\");\n}",
    "Rust (1.85.0)": "fn main() {\n    println!(\"Hello, World!\");\n}",
    "Scala (2.13.2)": "object Main extends App {\n  println(\"Hello, World!\")\n}",
    "SQL (SQLite 3.27.2)": "SELECT 'Hello, World!';",
    "Swift (5.2.3)": "print(\"Hello, World!\")",
    "TypeScript (3.7.4)": "console.log(\"Hello, World!\")",
    "TypeScript (5.0.3)": "console.log(\"Hello, World!\")",
    "TypeScript (5.6.2)": "console.log(\"Hello, World!\")",
    "Visual Basic.Net (vbnc 0.0.0.5943)": "Module Module1\n    Sub Main()\n        Console.WriteLine(\"Hello, World!\")\n    End Sub\nEnd Module"
  }
const getLanguageExtension = (lang: string) => {
  if (lang.startsWith("JavaScript")) return javascript()
  if (lang.startsWith("Python")) return python()
  if (lang.startsWith("Java")) return java()
  if (lang.startsWith("C++")) return cpp()
  return javascript()
}

interface IDEShowcaseProps {
  preferredLanguage?: string
  username: string
  bio: string
  onFinishOnboarding?: () => void
}

const THEME_SWATCHES: Record<string, string> = {
  "one-dark": "#282c34",
  // Add more theme swatches here
}

export default function IDEShowcase({ preferredLanguage, username, bio, onFinishOnboarding }: IDEShowcaseProps) {
  const router = useRouter()
  const [languages, setLanguages] = useState<{ id: number; name: string }[]>([])
  const [language, setLanguage] = useState<string>("")
  const [theme, setTheme] = useState(THEMES[0].value)
  const [fontSize, setFontSize] = useState(14)
  const [tabSize, setTabSize] = useState(4)
  const [code, setCode] = useState<string>("")
  const [output, setOutput] = useState("")
  const [loadingLangs, setLoadingLangs] = useState(true)
  const [error, setError] = useState("")
  const [isRunning, setIsRunning] = useState(false)
  const [isDefaultCode, setIsDefaultCode] = useState(true)
  const [showSettings, setShowSettings] = useState(false)
  const [showFinish, setShowFinish] = useState(false)
  const [onboarded, setOnboarded] = useState(false)
  const settingsRef = useRef<HTMLDivElement>(null)

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

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (settingsRef.current && !settingsRef.current.contains(event.target as Node)) {
        setShowSettings(false)
      }
    }
    if (showSettings) {
      document.addEventListener("mousedown", handleClickOutside)
    } else {
      document.removeEventListener("mousedown", handleClickOutside)
    }
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [showSettings])

  const handleRun = async () => {
    setIsRunning(true)
    setOutput("")
    setError("")
    setShowFinish(false)
    const langObj = languages.find(l => l.name === language)
    console.log("[handleRun] Selected language:", langObj)
    if (!langObj) {
      setError("Language not found in Judge0 list.")
      setIsRunning(false)
      return
    }
    try {
      const postBody = {
        language_id: langObj.id,
        source_code: code,
        stdin: ""
      }
      console.log("[handleRun] POST body:", postBody)
      // Submit code to Judge0
      const submitRes = await fetch("https://judge0-ce.p.rapidapi.com/submissions?base64_encoded=false&wait=false", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-RapidAPI-Key": process.env.NEXT_PUBLIC_RAPIDAPI_KEY || "8502ba92a8msh1b9b84a2e6f6c92p1211c6jsn12009e885a64",
          "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com"
        },
        body: JSON.stringify(postBody)
      })
      const submitData = await submitRes.json()
      console.log("[handleRun] Judge0 submit response:", submitData)
      if (!submitData.token) {
        setError("Failed to submit code to Judge0 API.")
        setIsRunning(false)
        return
      }
      // Poll for result
      let result = null
      for (let i = 0; i < 10; i++) {
        await new Promise(res => setTimeout(res, 1200))
        const res = await fetch(`https://judge0-ce.p.rapidapi.com/submissions/${submitData.token}?base64_encoded=false`, {
          headers: {
            "X-RapidAPI-Key": process.env.NEXT_PUBLIC_RAPIDAPI_KEY || "8502ba92a8msh1b9b84a2e6f6c92p1211c6jsn12009e885a64",
            "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com"
          }
        })
        const data = await res.json()
        console.log(`[handleRun] Poll attempt ${i+1}:`, data)
        if (data.status && data.status.id >= 3) {
          result = data
          break
        }
      }
      if (!result) {
        setError("Timed out waiting for Judge0 result.")
        setIsRunning(false)
        return
      }
      if (result.stdout) {
        setOutput(result.stdout)
        setShowFinish(true)
      } else if (result.stderr) {
        setOutput(result.stderr)
        setShowFinish(true)
      } else if (result.compile_output) {
        setOutput(result.compile_output)
        setShowFinish(true)
      } else {
        setOutput("No output.")
        setShowFinish(true)
      }
    } catch (err: any) {
      console.error("[handleRun] Error:", err)
      setError("Error running code: " + (err?.message || err))
      setShowFinish(false)
    }
    setIsRunning(false)
  }

  const handleCodeChange = (val: string) => {
    setCode(val)
    if (val !== HELLO_WORLD[language]) setIsDefaultCode(false)
  }

  // Prepare language options for react-select
  const languageOptions = languages.map(lang => ({ value: lang.name, label: lang.name }))

  // Prepare theme options with swatches
  const themeOptions = THEMES.map(t => ({
    value: t.value,
    label: (
      <span className="flex items-center gap-2">
        <span className="inline-block w-4 h-4 rounded" style={{ background: THEME_SWATCHES[t.value] }}></span>
        {t.name}
      </span>
    ),
  }))

  if (onboarded) {
    return (
      <OnboardingComplete
        data={{
          username,
          bio,
          language,
          code
        }}
      />
    )
  }

  return (
    <div className="w-full bg-slate-900/90 border border-slate-700 rounded-2xl shadow-xl p-2 max-h-[80vh] overflow-auto md:max-h-none md:overflow-visible">
      {/* Language selector as header */}
      <div className="flex items-center gap-2 mb-2 px-2 pt-2 justify-between">
        <div className="flex items-center gap-2">
          <label className="text-slate-300 text-xs font-mono" title="Choose your language">Language</label>
          <Select
            classNamePrefix="react-select"
            options={languageOptions}
            value={languageOptions.find(opt => opt.value === language) || null}
            onChange={opt => setLanguage(opt?.value || "")}
            isLoading={loadingLangs}
            isDisabled={loadingLangs}
            placeholder="Select language..."
            styles={{
              control: (base) => ({ ...base, background: '#1e293b', borderColor: '#334155', minHeight: 32, fontSize: 12, width: 220 }),
              menu: (base) => ({ ...base, background: '#1e293b', color: '#f1f5f9', fontSize: 12 }),
              singleValue: (base) => ({ ...base, color: '#f1f5f9' }),
              option: (base, state) => ({ ...base, background: state.isFocused ? '#334155' : '#1e293b', color: '#f1f5f9' }),
            }}
          />
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
        <CodeMirror
          value={code}
          height="240px"
          theme={THEMES.find(t => t.value === theme)?.extension}
          extensions={[getLanguageExtension(language)]}
          onChange={handleCodeChange}
          basicSetup={{ tabSize, lineNumbers: true }}
          style={{ fontSize: `${fontSize}px`, borderRadius: "10px" }}
        />
      </div>
      <div className="flex gap-2 mb-2">
        <Button onClick={handleRun} disabled={isRunning} className="bg-violet-600 hover:bg-violet-700 text-white font-mono px-4 py-1 rounded text-xs">
          {isRunning ? "Running..." : "Run"}
        </Button>
      </div>
      <div className="bg-black rounded-lg p-2 min-h-[60px] max-h-32 overflow-auto font-mono text-green-400 text-xs">
        {output || "$ Output will appear here"}
      </div>
      {showFinish && !onboarded && (
        <div className="mt-4 flex justify-end">
          <Button
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-mono px-4 py-1 rounded text-xs"
            onClick={() => {
              setOnboarded(true)
            }}
          >
            Finish Onboarding
          </Button>
        </div>
      )}
      {error && <div className="text-red-400 text-xs mt-2 font-mono">{error}</div>}
    </div>
  )
} 