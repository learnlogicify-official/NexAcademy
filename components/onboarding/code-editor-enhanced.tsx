"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Play, Download, Copy, Check } from "lucide-react"
import { motion } from "framer-motion"
import { MonacoEditor } from "@/components/ui/monaco-editor"
import type { editor } from "monaco-editor"

interface CodeEditorEnhancedProps {
  language: string
  code: string
  updateCode: (code: string) => void
  onRun: () => void
  isRunning: boolean
  output: string
}

export default function CodeEditorEnhanced({
  language,
  code,
  updateCode,
  onRun,
  isRunning,
  output,
}: CodeEditorEnhancedProps) {
  const [activeTab, setActiveTab] = useState("editor")
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
    roundedSelection: true,
    readOnly: activeTab !== "editor"
  }

  return (
    <Card className="bg-slate-900 border-slate-700 overflow-hidden">
      <div className="flex justify-between items-center p-2 bg-slate-800 border-b border-slate-700">
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
            className="h-7 text-slate-300 hover:text-white hover:bg-slate-700"
            title="Copy code"
          >
            {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleDownloadCode}
            className="h-7 text-slate-300 hover:text-white hover:bg-slate-700"
            title="Download code"
          >
            <Download className="h-3 w-3" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={onRun}
            disabled={isRunning}
            className="h-7 text-slate-300 hover:text-white hover:bg-slate-700"
            title="Run code"
          >
            <Play className="h-3 w-3" />
            {isRunning && (
              <motion.div
                className="w-3 h-3 rounded-full bg-violet-600 absolute"
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.5, 1, 0.5]
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity
                }}
              ></motion.div>
            )}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="editor" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="flex justify-between items-center p-1 px-2 bg-slate-800 border-b border-slate-700">
          <TabsList className="bg-slate-700/50 h-7">
            <TabsTrigger value="editor" className="text-xs h-6 data-[state=active]:bg-slate-600">Editor</TabsTrigger>
            <TabsTrigger value="output" className="text-xs h-6 data-[state=active]:bg-slate-600">Output</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="editor" className="m-0">
          <div className="h-64">
            <MonacoEditor
              value={code}
              onChange={updateCode}
              language={language}
              height="100%"
              options={editorOptions}
            />
          </div>
        </TabsContent>

        <TabsContent value="output" className="m-0">
          <div className="h-64 p-4 font-mono text-sm bg-slate-900 text-slate-100 overflow-auto">
            {output ? (
              <pre className="text-green-400">{output}</pre>
            ) : (
              <div className="text-slate-500 italic">No output yet. Run your code to see results here.</div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </Card>
  )
}
