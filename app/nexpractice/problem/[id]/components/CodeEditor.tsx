import React from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { python } from '@codemirror/lang-python';
import { cpp } from '@codemirror/lang-cpp';
import { java } from '@codemirror/lang-java';
import { githubLight } from '@uiw/codemirror-theme-github';

interface CodeEditorProps {
  code: string;
  language: string;
  onChange: (value: string) => void;
}

export default function CodeEditor({ code, language, onChange }: CodeEditorProps) {
  // Get the appropriate language extension
  const getLanguageExtension = () => {
    switch (language.toLowerCase()) {
      case 'javascript':
      case 'js':
        return javascript();
      case 'python':
      case 'py':
        return python();
      case 'c++':
      case 'cpp':
        return cpp();
      case 'java':
        return java();
      default:
        return javascript(); // Default to JavaScript
    }
  };

  return (
    <CodeMirror
      value={code}
      height="100%"
      theme={githubLight}
      extensions={[getLanguageExtension()]}
      onChange={onChange}
      basicSetup={{
        lineNumbers: true,
        highlightActiveLineGutter: true,
        highlightSpecialChars: true,
        foldGutter: true,
        drawSelection: true,
        dropCursor: true,
        allowMultipleSelections: true,
        indentOnInput: true,
        syntaxHighlighting: true,
        bracketMatching: true,
        closeBrackets: true,
        autocompletion: true,
        rectangularSelection: true,
        crosshairCursor: true,
        highlightActiveLine: true,
        highlightSelectionMatches: true,
        closeBracketsKeymap: true,
        defaultKeymap: true,
        searchKeymap: true,
        historyKeymap: true,
        foldKeymap: true,
        completionKeymap: true,
        lintKeymap: true,
      }}
    />
  );
} 