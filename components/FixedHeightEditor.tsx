"use client"

import { useEffect, useRef } from "react"
import Editor from "@monaco-editor/react"

interface FixedHeightEditorProps {
  code: string
  onChange: (value: string) => void
  language: string
  theme?: "vs-dark" | "light"
  height?: number
}

export function FixedHeightEditor({ code, onChange, language, theme = "vs-dark", height }: FixedHeightEditorProps) {
  // Map language prop to Monaco language ID
  const getLanguageId = (lang: string): string => {
    switch (lang) {
      case "JavaScript": return "javascript"
      case "Python": return "python"
      case "Java": return "java"
      case "C++": return "cpp"
      default: return "javascript"
    }
  }
  
  // Reference to the Monaco editor instance
  const editorRef = useRef<any>(null);
  
  // Handle editor mount to configure additional options
  const handleEditorDidMount = (editor: any, monaco: any) => {
    editorRef.current = editor;
    
    // Configure hover to show below cursor
    monaco.editor.EditorOptions.hover.defaultValue = {
      enabled: true,
      delay: 300,
      sticky: true,
      above: false // Show hover below the cursor instead of above
    };
    
    // Configure suggestions to show below cursor
    monaco.editor.EditorOptions.suggest.defaultValue = {
      showInlineDetails: true,
      showStatusBar: true,
      preview: true,
      filterGraceful: true,
      snippetsPreventQuickSuggestions: false,
      localityBonus: true,
      shareSuggestSelections: false,
      showIcons: true,
      maxVisibleSuggestions: 12,
      showMethods: true,
      showFunctions: true,
      showConstructors: true,
      showFields: true,
      showVariables: true,
      showClasses: true,
      showStructs: true,
      showInterfaces: true,
      showModules: true,
      showProperties: true,
      showEvents: true,
      showOperators: true,
      showUnits: true,
      showValues: true,
      showConstants: true,
      showEnums: true,
      showEnumMembers: true,
      showKeywords: true,
      showWords: true,
      showColors: true,
      showFiles: true,
      showReferences: true,
      showFolders: true,
      showTypeParameters: true,
      showSnippets: true,
      showUsers: true,
      showIssues: true
    };
    
    // Apply specific editor configurations
    editor.updateOptions({
      hover: {
        enabled: true,
        above: false, // Show below cursor
        delay: 100,
        sticky: true
      },
      suggest: {
        showInlineDetails: true
      },
      quickSuggestions: {
        other: true,
        comments: true,
        strings: true
      },
      parameterHints: {
        enabled: true,
        cycle: true
      }
    });
  };
  
  const editorHeight = height || 500;
  
  return (
    <div className="monaco-editor-wrapper" style={{
      width: "100%",
      height: `${editorHeight}px`,
      overflow: "visible",
      display: "block",
      position: "relative",
      backgroundColor: theme === "vs-dark" ? "#1e1e1e" : "#ffffff",
      zIndex: 0
    }}>
      <Editor
        height={editorHeight}
        width="100%"
        language={getLanguageId(language)}
        value={code}
        onChange={(value) => onChange(value || "")}
        theme={theme}
        onMount={handleEditorDidMount}
        options={{
          minimap: { enabled: true },
          scrollBeyondLastLine: false,
          fontSize: 14,
          automaticLayout: true,
          wordWrap: "on",
          hover: {
            enabled: true,
            above: false,
            delay: 100,
            sticky: true
          },
          suggest: {
            showInlineDetails: true
          }
        }}
        loading={
          <div style={{
            display: "flex",
            height: "100%",
            width: "100%",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#1e1e1e",
            color: "white"
          }}>
            <div>Loading editor...</div>
          </div>
        }
      />
    </div>
  )
} 