"use client"

import { useState, useEffect } from "react"
import { Editor } from "@monaco-editor/react"

interface CodeEditorProps {
  code: string
  setCode: (code: string) => void
  language: string
  setLanguage?: (lang: string) => void
}

export function CodeEditor({ code, setCode, language, setLanguage }: CodeEditorProps) {
  const [theme, setTheme] = useState("vs-dark")
  const [isEditorReady, setIsEditorReady] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  // Map language prop to Monaco language ID
  const getMonacoLanguage = (lang: string): string => {
    switch (lang) {
      case "JavaScript":
        return "javascript"
      case "Python":
        return "python"
      case "Java":
        return "java"
      case "C++":
        return "cpp"
      default:
        return "javascript"
    }
  }

  // Handle editor mount
  const handleEditorDidMount = (editor: any, monaco: any) => {
    setIsEditorReady(true)
    setIsLoading(false)

    // Set editor options
    editor.updateOptions({
      minimap: { enabled: true },
      scrollBeyondLastLine: false,
      fontSize: 14,
      fontFamily: "Menlo, Monaco, 'Courier New', monospace",
      lineNumbers: "on",
      folding: true,
      glyphMargin: true,
      lineDecorationsWidth: 10,
      lineNumbersMinChars: 3,
      renderLineHighlight: "all",
      scrollbar: {
        verticalScrollbarSize: 10,
        horizontalScrollbarSize: 10,
      },
      automaticLayout: true,
    })

    // Add change event listener
    editor.onDidChangeModelContent(() => {
      setCode(editor.getValue())
    })

    // Force layout update when mounted
    setTimeout(() => {
      editor.layout()
    }, 100)
  }

  // Handle loading error
  const handleEditorWillMount = (monaco: any) => {
    // Configure Monaco before it mounts
    monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
      noSemanticValidation: false,
      noSyntaxValidation: false,
    })
  }

  // Toggle theme function
  const toggleTheme = () => {
    setTheme(theme === "vs-dark" ? "vs-light" : "vs-dark")
  }

  // Handle loading error
  const handleEditorLoadError = (error: any) => {
    console.error("Failed to load Monaco Editor:", error)
    setLoadError("Failed to load code editor. Please refresh the page.")
    setIsLoading(false)
  }

  // Add error handling with useEffect
  useEffect(() => {
    // Set a timeout to detect if the editor fails to load
    const timeoutId = setTimeout(() => {
      if (!isEditorReady && isLoading) {
        handleEditorLoadError(new Error("Editor load timeout"))
      }
    }, 10000) // 10 seconds timeout

    return () => clearTimeout(timeoutId)
  }, [isEditorReady, isLoading])

  return (
    <div className="h-full w-full flex flex-col relative" style={{ overflow: 'hidden' }}>
      <div className="absolute top-2 right-2 z-10 flex gap-2">
        <button
          onClick={toggleTheme}
          className="bg-gray-700 text-white px-2 py-1 rounded text-xs hover:bg-gray-600 transition-colors"
          title="Toggle theme"
        >
          {theme === "vs-dark" ? "Light Mode" : "Dark Mode"}
        </button>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center h-full bg-gray-100">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-300 border-t-blue-600 mb-2"></div>
            <p className="text-gray-600">Loading editor...</p>
          </div>
        </div>
      )}

      {loadError && (
        <div className="flex items-center justify-center h-full bg-red-50 p-4">
          <div className="text-center">
            <div className="text-red-500 text-xl mb-2">⚠️</div>
            <p className="text-red-600 mb-2">{loadError}</p>
            <textarea
              className="w-full h-64 p-4 border rounded font-mono text-sm"
              value={code}
              onChange={(e) => setCode(e.target.value)}
            ></textarea>
          </div>
        </div>
      )}

      <div 
        className="flex-1 h-full w-full" 
        style={{ 
          display: isLoading || loadError ? "none" : "block",
          height: "100%",
          position: "absolute",
          top: 0,
          right: 0,
          bottom: 0,
          left: 0
        }}
      >
        <Editor
          height="100%"
          defaultLanguage="javascript"
          language={getMonacoLanguage(language)}
          defaultValue={code}
          value={code}
          theme={theme}
          onMount={handleEditorDidMount}
          beforeMount={handleEditorWillMount}
          loading={<div className="p-4">Loading editor...</div>}
          options={{
            readOnly: false,
            wordWrap: "on",
            tabSize: 2,
            automaticLayout: true,
          }}
          className="h-full w-full"
        />
      </div>
    </div>
  )
}
