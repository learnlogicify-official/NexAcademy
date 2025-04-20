"use client";

import { useEffect, useState } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { python } from "@codemirror/lang-python";
import { java } from "@codemirror/lang-java";
import { cpp } from "@codemirror/lang-cpp";
import { php } from "@codemirror/lang-php";
import { vscodeDark } from "@uiw/codemirror-theme-vscode";

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  language: string;
  placeholder?: string;
  className?: string;
}

const languageExtensions: Record<string, any> = {
  javascript: javascript(),
  python: python(),
  java: java(),
  cpp: cpp(),
  php: php(),
};

export function CodeEditor({
  value,
  onChange,
  language,
  placeholder,
  className,
}: CodeEditorProps) {
  const [extension, setExtension] = useState<any>(null);

  useEffect(() => {
    setExtension(languageExtensions[language] || null);
  }, [language]);

  return (
    <div className={className}>
      <CodeMirror
        value={value}
        height="200px"
        theme={vscodeDark}
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
        }}
      />
    </div>
  );
} 