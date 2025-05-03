"use client"

import { useEffect, useState, useRef } from "react"
import { javascript } from "@codemirror/lang-javascript"
import { cpp } from "@codemirror/lang-cpp"
import { java } from "@codemirror/lang-java"
import { python } from "@codemirror/lang-python"
import { EditorView, basicSetup } from "codemirror"
import { EditorState } from "@codemirror/state"
import { useTheme } from "next-themes"
import React from "react"
import { Settings, Undo, Check, Minus, Plus, ChevronDown, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip" 
import { createPortal } from "react-dom"
import { keymap } from "@codemirror/view"
import { indentUnit } from "@codemirror/language"

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
  const [element, setElement] = useState<HTMLElement | null>(null)
  const [editor, setEditor] = useState<EditorView | null>(null)
  const { resolvedTheme, setTheme } = useTheme()
  const isDark = resolvedTheme === "dark"
  const [mounted, setMounted] = useState(false)
  const isUserTyping = React.useRef(false)
  const lastDocContent = React.useRef(code)
  
  // Editor settings
  const [tabSize, setTabSize] = useState(4)
  const [fontSize, setFontSize] = useState(15)
  const [editorTheme, setEditorTheme] = useState<string>("system")
  const [showSettings, setShowSettings] = useState(initialShowSettings)
  const [themeDropdownOpen, setThemeDropdownOpen] = useState(false)

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

  // Update editor when settings change
  useEffect(() => {
    if (!element || !mounted || !editor) return
    
    // We need to recreate the editor when settings change
    recreateEditor()
  }, [tabSize, fontSize, editorTheme, resolvedTheme])

  // Create or recreate the editor
  const recreateEditor = () => {
    if (!element || !mounted) return

    // Clean up previous editor instance
    if (editor) {
      editor.destroy()
    }
    
    // Theme is now safe to use
    const isDarkMode = resolvedTheme === 'dark'
    const actualTheme = editorTheme === "system" ? resolvedTheme : editorTheme
    const isDarkTheme = actualTheme === "dark" || actualTheme === "dracula"

    const updateListener = EditorView.updateListener.of((update) => {
      if (update.docChanged) {
        isUserTyping.current = true
        lastDocContent.current = update.state.doc.toString()
        setCode(update.state.doc.toString())
        setTimeout(() => {
          isUserTyping.current = false
        }, 100)
      }
    })

    // Select language extension based on the language prop
    const getLangExtension = () => {
      switch (language) {
        case "JavaScript":
          return javascript()
        case "Python":
          return python()
        case "Java":
          return java()
        case "C++":
          return cpp()
        default:
          return javascript()
      }
    }

    // Get dracula theme styles
    const getDraculaTheme = () => {
      return {
        "&": {
          backgroundColor: "#282a36",
          color: "#f8f8f2",
        },
        ".cm-gutters": {
          backgroundColor: "#282a36",
          color: "#6272a4",
          border: "none",
        },
        ".cm-activeLineGutter": {
          backgroundColor: "#44475a",
        },
        ".cm-activeLine": {
          backgroundColor: "#44475a30",
        },
        ".cm-selectionMatch": {
          backgroundColor: "#6272a450",
        },
        ".cm-cursor": {
          borderLeftColor: "#f8f8f2",
        },
        ".cm-line": {
          color: "#f8f8f2",
        },
        ".cm-matchingBracket, .cm-nonmatchingBracket": {
          backgroundColor: "#44475a",
          color: "#f8f8f2",
        },
        // Syntax highlighting
        ".tok-keyword": { color: "#ff79c6" },
        ".tok-string, .tok-string2": { color: "#f1fa8c" },
        ".tok-comment": { color: "#6272a4", fontStyle: "italic" },
        ".tok-number": { color: "#bd93f9" },
        ".tok-property": { color: "#8be9fd" },
        ".tok-operator": { color: "#ff79c6" },
        ".tok-punctuation": { color: "#f8f8f2" },
        ".tok-variableName, .tok-propertyName": { color: "#50fa7b" },
        ".tok-typeName, .tok-namespace": { color: "#8be9fd" },
        ".tok-className": { color: "#8be9fd" },
        ".tok-functionName, .tok-macroName": { color: "#50fa7b" },
      }
    }

    const state = EditorState.create({
      doc: lastDocContent.current,
      extensions: [
        basicSetup,
        getLangExtension(),
        updateListener,
        EditorView.lineWrapping,
        EditorState.tabSize.of(tabSize),
        indentUnit.of(" ".repeat(tabSize)),
        keymap.of([
          {
            key: "Tab",
            preventDefault: true,
            run: (view) => {
              const tab = " ".repeat(tabSize)
              view.dispatch(view.state.replaceSelection(tab))
              return true
            },
            shift: (view) => {
              // Outdent logic (optional, can be improved)
              return false
            }
          }
        ]),
        EditorView.theme({
          "&": {
            height: "100%",
            fontSize: `${fontSize}px`,
            margin: 0,
            padding: 0,
            backgroundColor: actualTheme === "dracula" ? "#282a36" : 
                             isDarkTheme ? "#1e1e1e" : "white",
            color: actualTheme === "dracula" ? "#f8f8f2" : 
                   isDarkTheme ? "#d4d4d4" : "#333",
          },
          ".cm-scroller": {
            height: "100%",
            overflow: "auto",
            fontFamily: "'JetBrains Mono', monospace",
            padding: "0",
            /* VS Code scrollbar styling */
            "&::-webkit-scrollbar": {
              width: "8px",
              height: "8px",
            },
            "&::-webkit-scrollbar-track": {
              background: "transparent",
            },
            "&::-webkit-scrollbar-thumb": {
              background: isDarkTheme ? "rgba(150, 150, 150, 0.4)" : "rgba(100, 100, 100, 0.4)",
              borderRadius: "4px",
              "&:hover": {
                background: isDarkTheme ? "rgba(150, 150, 150, 0.7)" : "rgba(100, 100, 100, 0.7)",
              }
            },
            /* For Firefox */
            scrollbarWidth: "thin",
            scrollbarColor: isDarkTheme 
              ? "rgba(150, 150, 150, 0.4) transparent" 
              : "rgba(100, 100, 100, 0.4) transparent",
          },
          ".cm-gutters": {
            backgroundColor: actualTheme === "dracula" ? "#282a36" : 
                             isDarkTheme ? "#252526" : "#f8f9fa",
            color: actualTheme === "dracula" ? "#6272a4" :
                   isDarkTheme ? "#858585" : "#6c7086",
            border: "none",
            borderRight: actualTheme === "dracula" ? "1px solid #44475a" :
                          isDarkTheme ? "1px solid #333" : "1px solid #e5e7eb",
          },
          ".cm-activeLineGutter": {
            backgroundColor: actualTheme === "dracula" ? "#44475a" :
                              isDarkTheme ? "#2c2c2c" : "#f1f5f9",
          },
          ".cm-content": {
            padding: "0",
          },
          ".cm-line": {
            padding: "0 10px",
            lineHeight: "1.6",
          },
          ".cm-gutterElement": {
            padding: "0 10px 0 5px",
          },
          // Add Dracula theme specific styles if selected
          ...(actualTheme === "dracula" ? getDraculaTheme() : {})
        }),
      ],
    })

    const view = new EditorView({
      state,
      parent: element,
    })

    setEditor(view)
  }

  useEffect(() => {
    recreateEditor()

    return () => {
      if (editor) {
        editor.destroy()
      }
    }
  }, [element, language, mounted, setCode])

  // Update editor content when code prop changes (if different from current)
  useEffect(() => {
    // Only update the editor if the code prop changes from outside
    // and the user is not currently typing
    if (editor && 
        !isUserTyping.current && 
        lastDocContent.current !== code) {
      lastDocContent.current = code
      editor.dispatch({
        changes: {
          from: 0,
          to: editor.state.doc.length,
          insert: code,
        },
      })
    }
  }, [code, editor])

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
      <div 
        ref={setElement} 
        className="w-full editor-container"
        style={{ 
          height: "100%", 
          overflow: "hidden",
          display: "flex", 
          flexDirection: "column",
          borderRadius: "6px",
          padding: 0,
          margin: 0,
        }}
      />
    </div>
  )
}
