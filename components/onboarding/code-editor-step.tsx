"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Terminal } from "lucide-react"
import CodeEditor from "@/components/onboarding/code-editor"
import TerminalOutput from "@/components/onboarding/terminal-output"

interface CodeEditorStepProps {
  language: string
  code: string
  updateCode: (code: string) => void
  onComplete: () => void
  onBack: () => void
}

export default function CodeEditorStep({ language, code, updateCode, onComplete, onBack }: CodeEditorStepProps) {
  const [output, setOutput] = useState("")
  const [isRunning, setIsRunning] = useState(false)
  const [showCelebration, setShowCelebration] = useState(false)
  const terminalRef = useRef<HTMLDivElement>(null)

  const getDefaultCode = (lang: string) => {
    switch (lang) {
      case "javascript":
        return 'console.log("Hello, NexAcademy! Ready to learn coding with AI.");'
      case "python":
        return 'print("Hello, NexAcademy! Ready to learn coding with AI.")'
      case "java":
        return 'public class Main {\n  public static void main(String[] args) {\n    System.out.println("Hello, NexAcademy! Ready to learn coding with AI.");\n  }\n}'
      case "csharp":
        return 'using System;\n\nclass Program {\n  static void Main() {\n    Console.WriteLine("Hello, NexAcademy! Ready to learn coding with AI.");\n  }\n}'
      case "ruby":
        return 'puts "Hello, NexAcademy! Ready to learn coding with AI."'
      default:
        return 'console.log("Hello, NexAcademy! Ready to learn coding with AI.");'
    }
  }

  const runCode = () => {
    setIsRunning(true)
    setOutput("")

    // Scroll terminal into view
    if (terminalRef.current) {
      terminalRef.current.scrollIntoView({ behavior: "smooth" })
    }

    // Simulate code execution with a realistic terminal experience
    setTimeout(() => {
      setOutput((prev) => prev + `$ Running ${language} code...\n`)
    }, 300)

    setTimeout(() => {
      setOutput((prev) => prev + `$ Compiling...\n`)
    }, 800)

    setTimeout(() => {
      setOutput((prev) => prev + `$ Executing...\n\n`)
    }, 1200)

    // Final output
    setTimeout(() => {
      setOutput(
        (prev) => prev + `Hello, NexAcademy! Ready to learn coding with AI.\n\n$ Process completed successfully.`,
      )
      setIsRunning(false)
      setShowCelebration(true)

      // Hide celebration after 3 seconds
      setTimeout(() => {
        setShowCelebration(false)
      }, 3000)
    }, 2000)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onComplete()
  }

  return (
    <div className="p-8 space-y-8">
      <div className="space-y-3">
        <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Time to code!</h2>
        <p className="text-slate-500 dark:text-slate-400 text-lg">
          Run your first program and see the magic happen. The output will appear in the terminal below.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Code Editor */}
        <CodeEditor language={language} code={code} updateCode={updateCode} />

        {/* Terminal Output */}
        <div ref={terminalRef} className="border border-slate-200 dark:border-slate-700 rounded-md overflow-hidden">
          <div className="bg-slate-800 p-2 border-b border-slate-700 flex items-center gap-2">
            <Terminal className="h-4 w-4 text-slate-400" />
            <span className="text-sm font-medium text-slate-300">Terminal</span>
          </div>
          <TerminalOutput output={output} isRunning={isRunning} showCelebration={showCelebration} />
        </div>

        <div className="flex gap-3 pt-2">
          <Button type="button" variant="outline" onClick={onBack} className="py-6 text-base">
            Back
          </Button>
          <Button
            type="button"
            onClick={runCode}
            disabled={isRunning}
            className="flex-1 py-6 text-base bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700"
          >
            {isRunning ? "Running..." : "Run Code"}
          </Button>
          <Button
            type="submit"
            className="py-6 text-base bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
          >
            Complete
          </Button>
        </div>
      </form>
    </div>
  )
}
