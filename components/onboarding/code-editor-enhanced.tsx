"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Play, Download, Copy, Check, Sparkles } from "lucide-react"
import { motion } from "framer-motion"
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism"

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
  const [lineNumbers, setLineNumbers] = useState<number[]>([])

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

  return (
    <Card className="border border-slate-200 dark:border-slate-700 rounded-md overflow-hidden">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="bg-slate-800 p-2 border-b border-slate-700 flex justify-between items-center">
          <TabsList className="bg-slate-700">
            <TabsTrigger value="editor" className="data-[state=active]:bg-slate-600">
              {language}.{getFileExtension()}
            </TabsTrigger>
            <TabsTrigger value="output" className="data-[state=active]:bg-slate-600">
              Output
            </TabsTrigger>
          </TabsList>

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
            <Button
              type="button"
              size="sm"
              onClick={onRun}
              disabled={isRunning}
              className="h-8 gap-1 bg-violet-600 hover:bg-violet-700"
            >
              <Play className="h-4 w-4" />
              Run
            </Button>
          </div>
        </div>

        <TabsContent value="editor" className="m-0">
          <div className="relative h-64 flex">
            {/* Line numbers */}
            <div className="py-4 px-2 bg-slate-900 text-slate-500 text-right select-none">
              {lineNumbers.map((num) => (
                <div key={num} className="h-6 text-xs">
                  {num}
                </div>
              ))}
            </div>

            {/* Code editor with syntax highlighting */}
            <SyntaxHighlighter
              language={language}
              style={vscDarkPlus}
              customStyle={{
                margin: 0,
                padding: "1rem",
                height: "100%",
                width: "100%",
                backgroundColor: "#0f172a",
                fontSize: "0.875rem",
                lineHeight: "1.5rem",
              }}
            >
              {code}
            </SyntaxHighlighter>

            {/* Actual editable textarea (positioned over the syntax highlighter) */}
            <textarea
              value={code}
              onChange={(e) => updateCode(e.target.value)}
              className="absolute inset-0 w-full h-full p-4 pl-12 font-mono text-sm bg-transparent text-transparent caret-white resize-none outline-none"
              spellCheck="false"
            />
          </div>
        </TabsContent>

        <TabsContent value="output" className="m-0">
          <div className="p-4 h-64 font-mono text-sm bg-slate-900 text-green-400 overflow-auto relative">
            {isRunning ? (
              <div className="animate-pulse flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-ping"></div>
                Running your code...
              </div>
            ) : output ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
                {output}
                <motion.div
                  className="absolute bottom-4 right-4"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.5, type: "spring" }}
                >
                  <div className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full flex items-center gap-1 text-xs">
                    <Sparkles className="h-3 w-3" />
                    Code executed successfully!
                  </div>
                </motion.div>
              </motion.div>
            ) : (
              <div className="text-slate-500">Run your code to see the output here</div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </Card>
  )
}
