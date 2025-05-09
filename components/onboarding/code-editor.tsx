"use client"

import type React from "react"

import { useEffect, useState, useRef } from "react"
import { Copy, Check, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { MonacoEditor } from "@/components/ui/monaco-editor"
import type { editor } from "monaco-editor"

interface CodeEditorProps {
  language: string
  code: string
  updateCode: (code: string) => void
}

export default function CodeEditor({ language, code, updateCode }: CodeEditorProps) {
  const [copied, setCopied] = useState(false)

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

  // Monaco editor options
  const editorOptions: editor.IStandaloneEditorConstructionOptions = {
    minimap: { enabled: false },
    scrollBeyondLastLine: false,
    fontSize: 14,
    tabSize: 2,
    automaticLayout: true,
    wordWrap: "on",
    renderLineHighlight: "all",
    fontFamily: "Menlo, Monaco, 'Courier New', monospace",
    cursorBlinking: "blink" as const,
    useTabStops: true,
    roundedSelection: true
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

      <div className="h-64">
        <MonacoEditor
          value={code}
          onChange={updateCode}
          language={language}
          height="100%"
          options={editorOptions}
        />
      </div>
    </div>
  )
}
