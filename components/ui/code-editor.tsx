"use client";

import { useEffect, useState } from "react";
import { useTheme } from 'next-themes';
import { MonacoEditor } from "./monaco-editor";
import type { editor } from "monaco-editor";

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  language: string;
  placeholder?: string;
  className?: string;
  height?: string;
  errorLine?: number | null;
}

// Map Judge0 language IDs to Monaco language modes
// This is a partial list - add more as needed
const judge0LanguageMapping: Record<string, string> = {
  "4": "javascript", // Node.js
  "11": "python",    // Python 3
  "10": "python",    // Python 2
  "26": "python",    // Python 3.6
  "70": "python",    // Python 2.7.17
  "71": "python",    // Python 3.8.1
  "29": "java",      // Java
  "54": "cpp",       // C++
  "55": "java",      // Java
  "56": "php",       // PHP
};

export function CodeEditor({
  value,
  onChange,
  language,
  placeholder,
  className,
  height = "250px",
  errorLine = null,
}: CodeEditorProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Additional Monaco editor options
  const editorOptions: editor.IStandaloneEditorConstructionOptions = {
    automaticLayout: true,
    scrollBeyondLastLine: false,
    minimap: { enabled: false },
    fontFamily: 'Monaco, Menlo, "Ubuntu Mono", Consolas, source-code-pro, monospace',
    fontSize: 14,
    tabSize: 2,
    suggestFontSize: 14,
    lineNumbersMinChars: 3,
    scrollbar: {
      verticalScrollbarSize: 8,
      horizontalScrollbarSize: 8
    },
    glyphMargin: true,
    renderLineHighlight: 'all'
  };

  return (
    <div className={className}>
      <MonacoEditor
        value={value}
        height={height}
        language={language}
        onChange={onChange}
        placeholder={placeholder}
        errorLine={errorLine}
        options={editorOptions}
      />
    </div>
  );
} 