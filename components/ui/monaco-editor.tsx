"use client";

import { useEffect, useRef, useState } from "react";
import { Editor, OnMount, OnChange, useMonaco } from "@monaco-editor/react";
import { useTheme } from "next-themes";
import type { editor } from "monaco-editor";

// Generate a unique ID for each editor instance
const generateUniqueId = () => {
  return `monaco-${Math.random().toString(36).substring(2, 11)}`;
};

// Language ID mapping from Judge0 to Monaco
const LANGUAGE_MAPPING: Record<string, string> = {
  // JavaScript/TypeScript related
  "4": "javascript", // Node.js
  "63": "javascript", // JavaScript
  "74": "typescript", // TypeScript
  
  // Python related
  "10": "python", // Python 2
  "11": "python", // Python 3
  "26": "python", // Python 3.6
  "70": "python", // Python 2.7
  "71": "python", // Python 3.8
  "116": "python", // Python 3.10
  
  // Java
  "29": "java", // Java
  "55": "java", // Java
  
  // C/C++
  "54": "cpp", // C++
  "50": "c", // C
  "53": "cpp", // C++ GCC
  
  // Others
  "51": "csharp", // C#
  "56": "php", // PHP
  "60": "go", // Go
  "73": "rust", // Rust
  "72": "ruby", // Ruby
};

// Maps language name strings to Monaco language IDs
const languageNameMapping: Record<string, string> = {
  "javascript": "javascript",
  "typescript": "typescript",
  "js": "javascript",
  "ts": "typescript",
  "python": "python",
  "py": "python",
  "java": "java",
  "c": "c",
  "cpp": "cpp",
  "c++": "cpp",
  "csharp": "csharp",
  "c#": "csharp",
  "php": "php",
  "go": "go",
  "rust": "rust",
  "ruby": "ruby",
};

export interface MonacoEditorProps {
  value: string;
  onChange: (value: string) => void;
  language: string;
  height?: string;
  className?: string;
  placeholder?: string;
  readOnly?: boolean;
  errorLine?: number | null;
  options?: editor.IStandaloneEditorConstructionOptions;
  onMount?: (editor: editor.IStandaloneCodeEditor) => void;
}

export function MonacoEditor({
  value,
  onChange,
  language = "javascript",
  height = "300px",
  className = "",
  placeholder = "",
  readOnly = false,
  errorLine = null,
  options = {},
  onMount,
}: MonacoEditorProps) {
  const { theme: applicationTheme } = useTheme();
  const monaco = useMonaco();
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const monacoRef = useRef(monaco);
  const [mounted, setMounted] = useState(false);
  const [decorations, setDecorations] = useState<string[]>([]);
  const currentModelPathRef = useRef<string | null>(null);
  const instanceIdRef = useRef(generateUniqueId());

  // Update monaco ref when it changes
  useEffect(() => {
    monacoRef.current = monaco;
  }, [monaco]);

  // Handle editor mounting
  const handleEditorDidMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;
    setMounted(true);
    
    // Apply placeholder if needed
    if (placeholder && !value) {
      const placeholderText = placeholder;
      const placeholderDecorations = editor.createDecorationsCollection([
        {
          range: new monaco.Range(1, 1, 1, 1),
          options: {
            after: {
              content: placeholderText,
              inlineClassName: "monaco-placeholder"
            }
          }
        }
      ]);
      
      // Remove placeholder when user starts typing
      const disposable = editor.onDidChangeModelContent(() => {
        const content = editor.getValue();
        if (content.trim().length > 0) {
          placeholderDecorations.clear();
          disposable.dispose();
        } else if (content.trim().length === 0) {
          placeholderDecorations.set([
            {
              range: new monaco.Range(1, 1, 1, 1),
              options: {
                after: {
                  content: placeholderText,
                  inlineClassName: "monaco-placeholder"
                }
              }
            }
          ]);
        }
      });
    }
    
    // Track the current model path
    const model = editor.getModel();
    if (model) {
      currentModelPathRef.current = model.uri.toString();
    }
    
    // Call the onMount callback if provided
    if (onMount) {
      onMount(editor);
    }
  };

  // Handle content change
  const handleEditorChange: OnChange = (value) => {
    onChange(value || "");
  };

  // Normalize language ID for Monaco
  const getNormalizedLanguage = (languageId: string): string => {
    if (!languageId) return "javascript";
    
    // First check if direct language ID mapping exists (for Judge0 IDs)
    if (LANGUAGE_MAPPING[languageId]) {
      return LANGUAGE_MAPPING[languageId];
    }
    
    // Then check if it's a language name
    const languageLower = languageId.toLowerCase();
    if (languageNameMapping[languageLower]) {
      return languageNameMapping[languageLower];
    }
    
    // Handle case where language contains name
    for (const [key, value] of Object.entries(languageNameMapping)) {
      if (languageLower.includes(key)) {
        return value;
      }
    }
    
    // Default fallback
    return "javascript";
  };
  
  // Handle error line highlighting
  useEffect(() => {
    if (!editorRef.current || !monaco || !mounted) return;
    
    // Clear previous decorations
    if (decorations.length) {
      editorRef.current.deltaDecorations(decorations, []);
      setDecorations([]);
    }
    
    // Add new error decoration if needed
    if (errorLine !== null && errorLine > 0) {
      const newDecorations = editorRef.current.deltaDecorations([], [
        {
          range: new monaco.Range(errorLine, 1, errorLine, 1),
          options: {
            isWholeLine: true,
            className: "monaco-error-line",
            glyphMarginClassName: "monaco-error-glyph"
          }
        }
      ]);
      setDecorations(newDecorations);
    }
  }, [errorLine, monaco, mounted]);
  
  // Set theme based on application theme
  useEffect(() => {
    if (!monaco) return;
    
    const isDark = applicationTheme === "dark";
    monaco.editor.setTheme(isDark ? "vs-dark" : "vs");
  }, [applicationTheme, monaco]);

  // Create or update model when language changes
  useEffect(() => {
    if (!monaco || !editorRef.current) return;
    
    try {
      // Get the current model
      const model = editorRef.current.getModel();
      
      // If we're already using this language, don't recreate the model
      if (model && model.getLanguageId() === getNormalizedLanguage(language)) {
        return;
      }
      
      // Save current value and cursor position
      const currentValue = model ? model.getValue() : value;
      const currentPosition = editorRef.current.getPosition();
      
      // Generate a unique URI for the model
      const modelUri = monaco.Uri.parse(`file:///${instanceIdRef.current}.${getNormalizedLanguage(language)}`);
      
      // Create a new model with the current value and correct language
      const newModel = monaco.editor.createModel(
        currentValue,
        getNormalizedLanguage(language),
        modelUri
      );
      
      // Dispose of the old model
      if (model) {
        model.dispose();
      }
      
      // Set the new model on the editor
      editorRef.current.setModel(newModel);
      
      // Restore cursor position if possible
      if (currentPosition) {
        editorRef.current.setPosition(currentPosition);
      }
      
      // Save the new model path
      currentModelPathRef.current = modelUri.toString();
    } catch (error) {
      console.warn('Error updating editor model:', error);
    }
  }, [language, monaco]);

  // Cleanup on unmount or language change
  useEffect(() => {
    return () => {
      // When component unmounts, dispose of the model to prevent memory leaks and errors
      if (monacoRef.current && currentModelPathRef.current) {
        const model = monacoRef.current.editor.getModel(
          monacoRef.current.Uri.parse(currentModelPathRef.current)
        );
        if (model) {
          model.dispose();
        }
      }
      
      // Cleanup editor instance
      if (editorRef.current) {
        editorRef.current.dispose();
      }
    };
  }, [language]); // Re-run when language changes

  // Default options for editor
  const defaultOptions: editor.IStandaloneEditorConstructionOptions = {
    scrollBeyondLastLine: false,
    minimap: { enabled: false },
    lineNumbers: "on",
    roundedSelection: true,
    cursorStyle: "line",
    automaticLayout: true,
    fixedOverflowWidgets: true,
    readOnly,
    tabSize: 2,
    wordWrap: "on",
    ...options
  };
  
  return (
    <div className={className}>
      <Editor
        height={height}
        language={getNormalizedLanguage(language)}
        value={value}
        options={defaultOptions}
        onChange={handleEditorChange}
        onMount={handleEditorDidMount}
        loading={<div className="text-center py-4">Loading editor...</div>}
      />
      <style jsx global>{`
        .monaco-placeholder {
          color: gray;
          font-style: italic;
          opacity: 0.6;
        }
        .monaco-error-line {
          background-color: rgba(255, 0, 0, 0.15);
          border-left: 3px solid red;
        }
        .monaco-error-glyph {
          background-color: red;
          margin-left: 4px;
          width: 8px !important;
          border-radius: 50%;
        }
      `}</style>
    </div>
  );
} 