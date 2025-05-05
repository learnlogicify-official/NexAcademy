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
import { autocompletion } from '@codemirror/autocomplete';
import { EditorView, ViewPlugin, Decoration, DecorationSet } from '@codemirror/view';
import { StateField, RangeSet, StateEffect } from '@codemirror/state';

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  language: string;
  placeholder?: string;
  className?: string;
  height?: string;
  errorLine?: number | null;
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
  "70": "python",    // Python 2.7.17
  "71": "python",    // Python 3.8.1
  "29": "java",      // Java
  "54": "cpp",       // C++
  "55": "java",      // Java
  "56": "php",       // PHP
};

// Effects for adding/removing error line decorations
const addErrorLine = StateEffect.define<number>();
const clearErrorLines = StateEffect.define<null>();

// Create error line state field
const errorLineField = StateField.define<RangeSet<Decoration>>({
  create() {
    return RangeSet.empty;
  },
  update(value, tr) {
    value = value.map(tr.changes);
    
    for (let effect of tr.effects) {
      if (effect.is(addErrorLine)) {
        const line = effect.value;
        const lines = tr.state.doc.lines;
        
        if (line > 0 && line <= lines) {
          const lineStart = tr.state.doc.line(line).from;
          const lineEnd = tr.state.doc.line(line).to;
          const errorDecoration = Decoration.line({
            attributes: { class: "cm-error-line" }
          });
          const errorGutterDecoration = Decoration.line({
            attributes: { class: "cm-error-gutter" }
          });
          // Add the decoration to the line
          value = RangeSet.of([errorDecoration.range(lineStart, lineStart)]);
        }
      } else if (effect.is(clearErrorLines)) {
        value = RangeSet.empty;
      }
    }
    
    return value;
  },
  provide(field) {
    return EditorView.decorations.from(field);
  }
});

export function CodeEditor({
  value,
  onChange,
  language,
  placeholder,
  className,
  height = "250px",
  errorLine = null,
}: CodeEditorProps) {
  const [extension, setExtension] = useState<any>(null);
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [editorView, setEditorView] = useState<EditorView | null>(null);

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
    } 
    // If not a numeric ID, try to normalize common language names
    else {
      // Map common language names to our supported modes
      if (langMode.includes('python')) langMode = 'python';
      else if (langMode.includes('javascript') || langMode === 'js') langMode = 'javascript';
      else if (langMode.includes('java')) langMode = 'java';
      else if (langMode.includes('c++') || langMode.includes('cpp')) langMode = 'cpp';
      else if (langMode.includes('php')) langMode = 'php';
      
   
    }
    
    // Set the appropriate extension
    const ext = languageExtensions[langMode];
    if (ext) {
      setExtension([ext, autocompletion({ activateOnTyping: true }), errorLineField]);
    } else {
      console.warn(`No language extension found for: ${langMode} (original: ${language}). Falling back to JavaScript syntax highlighting.`);
      setExtension([languageExtensions.javascript, autocompletion({ activateOnTyping: true }), errorLineField]);
    }
  }, [language]);

  // Handle error line highlighting
  useEffect(() => {
    if (!editorView) return;
    
    // Clear any existing error line decorations
    editorView.dispatch({
      effects: clearErrorLines.of(null)
    });
    
    // Add new error line decoration if errorLine is provided
    if (errorLine !== null && errorLine > 0) {
      editorView.dispatch({
        effects: addErrorLine.of(errorLine)
      });
    }
  }, [errorLine, editorView]);

  return (
    <div className={className}>
      <CodeMirror
        value={value}
        height={height}
        theme={getTheme()}
        extensions={extension ? extension : [autocompletion({ activateOnTyping: true }), errorLineField]}
        onChange={onChange}
        placeholder={placeholder}
        onCreateEditor={(view) => setEditorView(view)}
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
      <style jsx global>{`
        .cm-error-line {
          background-color: rgba(255, 0, 0, 0.15);
        }
        .cm-error-gutter {
          position: relative;
        }
        .cm-error-gutter::before {
          content: "";
          position: absolute;
          left: -3px;
          top: 50%;
          transform: translateY(-50%);
          width: 16px;
          height: 16px;
          background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='red' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><circle cx='12' cy='12' r='10'></circle><line x1='12' y1='8' x2='12' y2='12'></line><line x1='12' y1='16' x2='12.01' y2='16'></line></svg>");
          background-size: contain;
        }
      `}</style>
    </div>
  );
} 