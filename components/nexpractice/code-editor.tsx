"use client"

import { useEffect, useState } from "react"
import { javascript } from "@codemirror/lang-javascript"
import { cpp } from "@codemirror/lang-cpp"
import { java } from "@codemirror/lang-java"
import { python } from "@codemirror/lang-python"
import { EditorView, basicSetup } from "codemirror"
import { EditorState } from "@codemirror/state"
import { useTheme } from "next-themes"

interface CodeEditorProps {
  code: string
  setCode: (code: string) => void
  language: string
}

export function CodeEditor({ code, setCode, language }: CodeEditorProps) {
  const [element, setElement] = useState<HTMLElement | null>(null)
  const [editor, setEditor] = useState<EditorView | null>(null)
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === "dark"
  const [mounted, setMounted] = useState(false)

  // After mounting, we can safely use the theme
  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!element || !mounted) return

    // Clean up previous editor instance
    if (editor) {
      editor.destroy()
    }
    
    // Theme is now safe to use
    const isDarkMode = resolvedTheme === 'dark'

    const updateListener = EditorView.updateListener.of((update) => {
      if (update.docChanged) {
        setCode(update.state.doc.toString())
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

    const state = EditorState.create({
      doc: code,
      extensions: [
        basicSetup,
        getLangExtension(),
        updateListener,
        EditorView.lineWrapping,
        EditorState.tabSize.of(2),
        EditorView.theme({
          "&": {
            height: "100%",
            fontSize: "15px",
            margin: 0,
            padding: 0,
            backgroundColor: isDarkMode ? "#1e1e1e" : "white",
            color: isDarkMode ? "#d4d4d4" : "#333",
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
              background: isDarkMode ? "rgba(150, 150, 150, 0.4)" : "rgba(100, 100, 100, 0.4)",
              borderRadius: "4px",
              "&:hover": {
                background: isDarkMode ? "rgba(150, 150, 150, 0.7)" : "rgba(100, 100, 100, 0.7)",
              }
            },
            /* For Firefox */
            scrollbarWidth: "thin",
            scrollbarColor: isDarkMode 
              ? "rgba(150, 150, 150, 0.4) transparent" 
              : "rgba(100, 100, 100, 0.4) transparent",
          },
          ".cm-gutters": {
            backgroundColor: isDarkMode ? "#252526" : "#f8f9fa",
            color: isDarkMode ? "#858585" : "#6c7086",
            border: "none",
            borderRight: isDarkMode ? "1px solid #333" : "1px solid #e5e7eb",
          },
          ".cm-activeLineGutter": {
            backgroundColor: isDarkMode ? "#2c2c2c" : "#f1f5f9",
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
        }),
      ],
    })

    const view = new EditorView({
      state,
      parent: element,
    })

    setEditor(view)

    return () => {
      view.destroy()
    }
  }, [element, language, resolvedTheme, mounted, code, setCode])

  // Update editor content when code prop changes (if different from current)
  useEffect(() => {
    if (editor && editor.state.doc.toString() !== code) {
      editor.dispatch({
        changes: {
          from: 0,
          to: editor.state.doc.length,
          insert: code,
        },
      })
    }
  }, [code, editor])

  // Use consistent styling for server and client render
  return (
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
  )
}
