"use client"

import { useEffect, useState, useRef } from "react"
import { useTheme } from "next-themes"
import React from "react"
import { Settings, Undo, Check, Minus, Plus, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"
import { createPortal } from "react-dom"
import { MonacoEditor } from "@/components/ui/monaco-editor"
import type { editor } from "monaco-editor"

interface CodeEditorProps {
  code: string
  setCode: (code: string) => void
  language: string
  preloadCode?: string // Original code for reset functionality
  initialShowSettings?: boolean // Initially show settings panel
  editorSettingsRef?: React.RefObject<{ showSettings: () => void } | null> // Ref to expose settings controls
}

// Available themes
const editorThemes = {
  "system": "System Default",
  "light": "Light",
  "dark": "Dark",
  "dracula": "Dracula"
}

export function CodeEditor({ code, setCode, language, preloadCode, initialShowSettings = false, editorSettingsRef }: CodeEditorProps) {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === "dark"
  const [mounted, setMounted] = useState(false)
  const isUserTyping = React.useRef(false)
  const [cursorPosition, setCursorPosition] = useState({ line: 1, column: 1 })
  
  // Editor settings
  const [tabSize, setTabSize] = useState(4)
  const [fontSize, setFontSize] = useState(15)
  const [editorTheme, setEditorTheme] = useState<string>("system")
  const [showSettings, setShowSettings] = useState(initialShowSettings)
  const monacoRef = useRef<editor.IStandaloneCodeEditor | null>(null)

  // After mounting, we can safely use the theme
  useEffect(() => {
    setMounted(true)
  }, [])

  // Reset code to original
  const handleResetCode = () => {
    if (preloadCode) {
      setCode(preloadCode)
    }
  }
  
  // Get Monaco theme based on settings
  const getMonacoTheme = (): string => {
    if (editorTheme === "system") {
      return isDark ? "vs-dark" : "vs"
    }
    if (editorTheme === "light") return "vs"
    if (editorTheme === "dark") return "vs-dark"
    if (editorTheme === "dracula") return "vs-dark" // We'll customize this with extra styles
    return "vs-dark"
  }

  // Expose showSettings function through ref
  React.useEffect(() => {
    if (editorSettingsRef) {
      editorSettingsRef.current = {
        showSettings: () => setShowSettings(true)
      }
    }
  }, [editorSettingsRef])

  // Initialize settings state from props
  React.useEffect(() => {
    if (initialShowSettings) {
      setShowSettings(true)
    }
  }, [initialShowSettings])

  // Handle cursor position changes
  const handleEditorDidMount = (editor: editor.IStandaloneCodeEditor) => {
    monacoRef.current = editor
    
    editor.onDidChangeCursorPosition(() => {
      const position = editor.getPosition()
      if (position) {
        setCursorPosition({
          line: position.lineNumber,
          column: position.column
        })
      }
    })
  }

  // Monaco editor options
  const editorOptions: editor.IStandaloneEditorConstructionOptions = {
    minimap: { enabled: false },
    scrollBeyondLastLine: false,
    fontSize: fontSize,
    fontFamily: "'JetBrains Mono', Menlo, Monaco, 'Courier New', monospace",
    tabSize: tabSize,
    automaticLayout: true,
    wordWrap: "on",
    scrollbar: {
      verticalScrollbarSize: 10,
      horizontalScrollbarSize: 10,
      verticalSliderSize: 10,
      horizontalSliderSize: 10,
      alwaysConsumeMouseWheel: false
    },
    glyphMargin: true,
    lineNumbersMinChars: 3,
    renderLineHighlight: "all",
    cursorBlinking: "blink" as const,
    cursorStyle: "line",
    renderWhitespace: "selection",
    smoothScrolling: true,
    formatOnPaste: true,
    guides: {
      indentation: true
    }
  }

  // Settings panel component
  const EditorSettings = () => {
    // Use portal for external trigger to ensure proper positioning
    if (editorSettingsRef && typeof window !== 'undefined') {
      return createPortal(
        <div 
          className={`fixed inset-0 z-[9999] flex items-start justify-center ${showSettings ? '' : 'pointer-events-none opacity-0'}`}
          onClick={(e) => {
            // Close when clicking the backdrop
            if (e.target === e.currentTarget) {
              setShowSettings(false);
              // Always reset state so it can be opened again
              setTimeout(() => setShowSettings(false), 10);
            }
          }}
        >
          {showSettings && (
            <div 
              className="absolute top-[60px] right-[80px] w-80 bg-background border border-border rounded-md shadow-lg"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-3 font-medium border-b">Editor Settings</div>
              <div className="p-4 space-y-4">
                {/* Tab Size Setting */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Tab Size</label>
                    <div className="flex items-center space-x-1">
                      {[2, 4, 8].map((size) => (
                        <Button
                          key={size}
                          variant={tabSize === size ? "default" : "outline"} 
                          size="sm"
                          className="h-8 w-8"
                          onClick={() => setTabSize(size)}
                        >
                          {size}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
                
                {/* Font Size Setting */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Font Size</label>
                    <div className="flex items-center space-x-1">
                      <Button
                        variant="outline" 
                        size="sm"
                        className="h-8 w-8"
                        onClick={() => setFontSize(Math.max(12, fontSize - 1))}
                        disabled={fontSize <= 12}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-8 text-center">{fontSize}</span>
                      <Button
                        variant="outline" 
                        size="sm"
                        className="h-8 w-8"
                        onClick={() => setFontSize(Math.min(24, fontSize + 1))}
                        disabled={fontSize >= 24}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
                
                {/* Theme Setting */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Editor Theme</label>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(editorThemes).map(([key, label]) => (
                      <Button
                        key={key}
                        variant={editorTheme === key ? "default" : "outline"}
                        size="sm"
                        className="justify-start h-9"
                        onClick={() => setEditorTheme(key)}
                      >
                        {label}
                        {editorTheme === key && <Check className="ml-auto h-4 w-4" />}
                      </Button>
                    ))}
                  </div>
                </div>
                
                <Separator />
                
                {/* Reset Code */}
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={handleResetCode}
                  disabled={!preloadCode}
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Reset Code
                </Button>
              </div>
            </div>
          )}
        </div>,
        document.body
      );
    }

    // For internal trigger (button inside editor)
    return (
      <Popover 
        open={showSettings} 
        onOpenChange={(open) => {
          if (!open) setShowSettings(false);
        }}
      >
        <PopoverTrigger asChild>
          <Button 
            variant="ghost" 
            size="icon" 
            className="absolute top-2 right-2 z-10 h-8 w-8 rounded-md bg-background/80 backdrop-blur"
          >
            <Settings className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent 
          className="w-80 p-0" 
          align="end" 
          sideOffset={5}
          side="bottom"
          avoidCollisions={true}
        >
          <div className="p-3 font-medium border-b">Editor Settings</div>
          <div className="p-4 space-y-4">
            {/* Tab Size Setting */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Tab Size</label>
                <div className="flex items-center space-x-1">
                  {[2, 4, 8].map((size) => (
                    <Button
                      key={size}
                      variant={tabSize === size ? "default" : "outline"} 
                      size="sm"
                      className="h-8 w-8"
                      onClick={() => setTabSize(size)}
                    >
                      {size}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Font Size Setting */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Font Size</label>
                <div className="flex items-center space-x-1">
                  <Button
                    variant="outline" 
                    size="sm"
                    className="h-8 w-8"
                    onClick={() => setFontSize(Math.max(12, fontSize - 1))}
                    disabled={fontSize <= 12}
                  >
                    <Minus className="h-3 w-3" />
                  </Button>
                  <span className="w-8 text-center">{fontSize}</span>
                  <Button
                    variant="outline" 
                    size="sm"
                    className="h-8 w-8"
                    onClick={() => setFontSize(Math.min(24, fontSize + 1))}
                    disabled={fontSize >= 24}
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>
            
            {/* Theme Setting */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Editor Theme</label>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(editorThemes).map(([key, label]) => (
                  <Button
                    key={key}
                    variant={editorTheme === key ? "default" : "outline"}
                    size="sm"
                    className="justify-start h-9"
                    onClick={() => setEditorTheme(key)}
                  >
                    {label}
                    {editorTheme === key && <Check className="ml-auto h-4 w-4" />}
                  </Button>
                ))}
              </div>
            </div>
            
            <Separator />
            
            {/* Reset Code */}
            <Button 
              variant="outline" 
              className="w-full"
              onClick={handleResetCode}
              disabled={!preloadCode}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Reset Code
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    );
  };

  // Use consistent styling for server and client render
  return (
    <div className="relative w-full h-full">
      <EditorSettings />
      <div className="w-full h-[calc(100%-22px)]">
        <MonacoEditor
          value={code}
          onChange={setCode}
          language={language}
          height="100%"
          options={editorOptions}
          onMount={handleEditorDidMount}
        />
      </div>
      
      {/* VS Code style status bar */}
      <div className="vscode-status-bar">
        <div className="status-section status-position">
          <span>Ln {cursorPosition.line}, Col {cursorPosition.column}</span>
        </div>
        <div className="status-section status-language">
          <span>{language ? (language.includes('(') ? language.split('(')[0].trim() : language) : 'JavaScript'}</span>
        </div>
        <div className="status-section status-encoding">
          <span>UTF-8</span>
        </div>
        <div className="status-section status-eol">
          <span>LF</span>
        </div>
        <div className="status-section status-indent">
          <span>Spaces: {tabSize}</span>
        </div>
      </div>
      
      <style jsx global>{`
        /* VS Code style status bar */
        .vscode-status-bar {
          height: 22px;
          background-color: ${isDark ? "#007acc" : "#007acc"};
          color: #ffffff;
          font-size: 12px;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          display: flex;
          flex-direction: row;
          align-items: center;
          padding: 0 10px;
          border-radius: 0 0 4px 4px;
        }
        
        .status-section {
          display: flex;
          align-items: center;
          padding: 0 8px;
          height: 100%;
          border-right: 1px solid rgba(255, 255, 255, 0.2);
        }
        
        .status-section:last-child {
          border-right: none;
        }
        
        .status-position {
          min-width: 100px;
        }
        
        .status-language {
          min-width: 80px;
        }
      `}</style>
    </div>
  )
}
