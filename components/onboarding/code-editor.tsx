"use client"

import type React from "react"

import { useEffect, useState, useRef } from "react"
import { Copy, Check, Download } from "lucide-react"
import { Button } from "@/components/ui/button"

interface CodeEditorProps {
  language: string
  code: string
  updateCode: (code: string) => void
}

export default function CodeEditor({ language, code, updateCode }: CodeEditorProps) {
  const [lineNumbers, setLineNumbers] = useState<number[]>([])
  const [copied, setCopied] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    // Update line numbers when code changes
    const lines = code.split("\n").length
    setLineNumbers(Array.from({ length: lines }, (_, i) => i + 1))
  }, [code])

  const getFileExtension = () => {
    switch (language) {
      case "javascript":
        return "js"
      case "python":
        return "py"
      case "java":
        return "java"
      case "csharp":
        return "cs"
      case "ruby":
        return "rb"
      default:
        return "js"
    }
  }

  const handleCopyCode = () => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownloadCode = () => {
    const element = document.createElement("a")
    const file = new Blob([code], { type: "text/plain" })
    element.href = URL.createObjectURL(file)
    element.download = `hello-world.${getFileExtension()}`
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  // Handle tab key in textarea
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Tab") {
      e.preventDefault()
      const start = textareaRef.current!.selectionStart
      const end = textareaRef.current!.selectionEnd

      // Insert 2 spaces for tab
      const newText = code.substring(0, start) + "  " + code.substring(end)
      updateCode(newText)

      // Move cursor after the inserted tab
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = start + 2
          textareaRef.current.selectionEnd = start + 2
        }
      }, 0)
    }
  }

  return (
    <div className="border border-slate-200 dark:border-slate-700 rounded-md overflow-hidden">
      <div className="bg-slate-800 p-2 border-b border-slate-700 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="flex space-x-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
          </div>
          <span className="text-sm font-medium text-slate-300 ml-2">
            {language}.{getFileExtension()}
          </span>
        </div>

        <div className="flex gap-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={handleCopyCode}
            className="h-8 text-slate-300 hover:text-white hover:bg-slate-700"
          >
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleDownloadCode}
            className="h-8 text-slate-300 hover:text-white hover:bg-slate-700"
          >
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="relative h-64 flex">
        {/* Line numbers */}
        <div className="py-4 px-2 bg-slate-900 text-slate-500 text-right select-none">
          {lineNumbers.map((num) => (
            <div key={num} className="h-6 text-xs">
              {num}
            </div>
          ))}
        </div>

        {/* Code editor */}
        <textarea
          ref={textareaRef}
          value={code}
          onChange={(e) => updateCode(e.target.value)}
          onKeyDown={handleKeyDown}
          className="w-full h-full p-4 font-mono text-sm bg-slate-900 text-slate-100 resize-none outline-none"
          spellCheck="false"
        />
      </div>
    </div>
  )
}
