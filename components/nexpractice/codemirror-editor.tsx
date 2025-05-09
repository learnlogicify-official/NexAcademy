"use client"

import { MonacoPracticeEditor } from "./monaco-editor"

interface CodeEditorProps {
  code: string
  setCode: (code: string) => void
  language: string
  preloadCode?: string // Original code for reset functionality
  initialShowSettings?: boolean // Initially show settings panel
  editorSettingsRef?: React.RefObject<{ showSettings: () => void } | null> // Ref to expose settings controls
  readOnly?: boolean // Add readOnly prop
}

export function CodeEditor(props: CodeEditorProps) {
  return <MonacoPracticeEditor {...props} />
}