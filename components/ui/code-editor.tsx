"use client";

import { useEffect, useState } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { python } from "@codemirror/lang-python";
import { java } from "@codemirror/lang-java";
import { cpp } from "@codemirror/lang-cpp";
import { php } from "@codemirror/lang-php";
import { vscodeDark } from "@uiw/codemirror-theme-vscode";
import { githubDark, githubLight } from '@uiw/codemirror-theme-github';
import { xcodeLight, xcodeDark } from '@uiw/codemirror-theme-xcode';
import { useTheme } from 'next-themes';

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  language: string;
  placeholder?: string;
  className?: string;
  height?: string;
}

// Map of language extensions for CodeMirror
const languageExtensions: Record<string, any> = {
  javascript: javascript(),
  python: python(),
  java: java(),
  cpp: cpp(),
  php: php(),
};

// Map Judge0 language IDs to CodeMirror language modes
// This is a partial list - add more as needed
const judge0LanguageMapping: Record<string, string> = {
  "4": "javascript", // Node.js
  "11": "python",    // Python 3
  "10": "python",    // Python 2
  "26": "python",    // Python 3.6
  "71": "python",    // Python 3.8
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
}: CodeEditorProps) {
  const [extension, setExtension] = useState<any>(null);
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Get appropriate theme based on the system/user preference
  const getTheme = () => {
    if (isDark) {
      return githubDark;
    }
    return githubLight;
  };

  useEffect(() => {
    // Determine the appropriate language extension to use
    let langMode = language?.toLowerCase() || 'javascript';
    
    // First check if this is a numeric Judge0 language ID
    if (!isNaN(Number(language)) && judge0LanguageMapping[language]) {
      langMode = judge0LanguageMapping[language];
      console.log(`Mapped Judge0 language ID ${language} to mode: ${langMode}`);
    } 
    // If not a numeric ID, try to normalize common language names
    else {
      // Map common language names to our supported modes
      if (langMode.includes('python')) langMode = 'python';
      else if (langMode.includes('javascript') || langMode === 'js') langMode = 'javascript';
      else if (langMode.includes('java')) langMode = 'java';
      else if (langMode.includes('c++') || langMode.includes('cpp')) langMode = 'cpp';
      else if (langMode.includes('php')) langMode = 'php';
      
      console.log(`Using language mode: ${langMode} for input: ${language}`);
    }
    
    // Set the appropriate extension
    const ext = languageExtensions[langMode];
    if (ext) {
      setExtension(ext);
    } else {
      console.warn(`No language extension found for: ${langMode} (original: ${language}). Falling back to JavaScript syntax highlighting.`);
      setExtension(languageExtensions.javascript);
    }
  }, [language]);

  return (
    <div className={className}>
      <CodeMirror
        value={value}
        height={height}
        theme={getTheme()}
        extensions={extension ? [extension] : []}
        onChange={onChange}
        placeholder={placeholder}
        basicSetup={{
          lineNumbers: true,
          highlightActiveLineGutter: true,
          highlightActiveLine: true,
          foldGutter: true,
          dropCursor: true,
          allowMultipleSelections: true,
          indentOnInput: true,
          syntaxHighlighting: true,
          bracketMatching: true,
          autocompletion: true,
          rectangularSelection: true,
          closeBrackets: true,
          highlightSelectionMatches: true,
        }}
        className="text-sm"
      />
    </div>
  );
} 