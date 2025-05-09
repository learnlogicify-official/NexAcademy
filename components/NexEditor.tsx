"use client"

import { useEffect, useRef, useState } from "react"
import Editor, { Monaco } from "@monaco-editor/react"
import type { editor } from 'monaco-editor'

interface NexEditorProps {
  code: string
  onChange: (value: string) => void
  language: string
  theme?: "vs-dark" | "light"
  fontSize?: number
  tabSize?: number
  onEditorMount?: (editor: editor.IStandaloneCodeEditor, monaco: Monaco) => void
}

export function NexEditor({ 
  code, 
  onChange, 
  language, 
  theme = "vs-dark",
  fontSize = 14,
  tabSize = 2,
  onEditorMount
}: NexEditorProps) {
  const [cursorPosition, setCursorPosition] = useState({ lineNumber: 1, column: 1 })
  const [editorInstance, setEditorInstance] = useState<editor.IStandaloneCodeEditor | null>(null)
  const [monacoInstance, setMonacoInstance] = useState<Monaco | null>(null)
  
  // Use direct approach with minimal complexity
  const getLanguageId = (lang: string): string => {
    // Try to convert Judge0 language ID to Monaco language ID
    const judge0ToMonaco: Record<string, string> = {
      "71": "python", // Python 3.8.1
      "70": "python", // Python 2.7.17
      "54": "cpp",    // C++ (GCC 9.2.0)
      "53": "cpp",    // C++ (GCC 8.3.0)
      "52": "cpp",    // C++ (GCC 7.4.0)
      "63": "javascript", // Node.js 12.14.0
      "62": "java",   // Java (OpenJDK 13.0.1)
      "74": "typescript", // TypeScript 3.7.4
      "73": "rust",   // Rust 1.40.0
      "72": "ruby",   // Ruby 2.7.0
      "68": "php",    // PHP 7.4.1
      "60": "go",     // Go 1.13.5
      "51": "csharp", // C# (Mono 6.6.0.161)
      "43": "plaintext", // Plain Text
      "50": "c",      // C (GCC 9.2.0)
      "49": "c",      // C (GCC 8.3.0)
      "48": "c",      // C (GCC 7.4.0)
    };
    
    // If it's a Judge0 ID, convert it
    if (judge0ToMonaco[lang]) {
      return judge0ToMonaco[lang];
    }
    
    // Try to map language name to Monaco language ID
    switch (lang.toLowerCase()) {
      case "javascript": return "javascript"
      case "python": return "python"
      case "java": return "java"
      case "c++": return "cpp"
      case "typescript": return "typescript"
      case "csharp": 
      case "c#": return "csharp"
      case "c": return "c"
      case "php": return "php"
      case "ruby": return "ruby"
      case "go": return "go"
      case "rust": return "rust"
      case "shell":
      case "bash": return "shell"
      case "sql": return "sql"
      case "html": return "html"
      case "css": return "css"
      case "xml": return "xml"
      case "json": return "json"
      case "markdown": return "markdown"
      default: return "plaintext"
    }
  }
  
  // Get a friendly display name for the language
  const getLanguageDisplayName = (langId: string): string => {
    const languageDisplayNames: Record<string, string> = {
      "71": "Python 3.8.1",
      "70": "Python 2.7.17",
      "54": "C++ (GCC 9.2.0)",
      "53": "C++ (GCC 8.3.0)",
      "52": "C++ (GCC 7.4.0)",
      "63": "JavaScript (Node.js)",
      "62": "Java",
      "74": "TypeScript",
      "73": "Rust",
      "72": "Ruby",
      "68": "PHP",
      "60": "Go",
      "51": "C# (Mono)",
      "50": "C (GCC 9.2.0)",
      "49": "C (GCC 8.3.0)",
      "48": "C (GCC 7.4.0)",
      "43": "Plain Text",
      "javascript": "JavaScript",
      "python": "Python",
      "java": "Java",
      "cpp": "C++",
      "c": "C",
      "csharp": "C#",
      "typescript": "TypeScript",
      "php": "PHP",
      "ruby": "Ruby",
      "go": "Go",
      "rust": "Rust",
      "shell": "Shell",
      "sql": "SQL",
      "html": "HTML",
      "css": "CSS",
      "xml": "XML",
      "json": "JSON",
      "markdown": "Markdown",
      "plaintext": "Plain Text"
    };
    
    return languageDisplayNames[langId] || langId;
  }

  // Editor container ref
  const editorContainerRef = useRef<HTMLDivElement>(null);

  // Effect to ensure the editor fills its container and relayouts on resize
  useEffect(() => {
    if (!editorContainerRef.current) return;
    const resizeObserver = new ResizeObserver(() => {
      if (editorInstance) {
        editorInstance.layout();
      }
    });
    resizeObserver.observe(editorContainerRef.current);
    return () => resizeObserver.disconnect();
  }, [editorInstance]);
  
  // Update cursor position when it changes
  useEffect(() => {
    if (editorInstance) {
      const disposable = editorInstance.onDidChangeCursorPosition((e: any) => {
        setCursorPosition({
          lineNumber: e.position.lineNumber,
          column: e.position.column
        });
      });

    return () => {
        disposable.dispose();
      };
    }
  }, [editorInstance]);

  // Setup Monaco editor languages and features whenever the language changes
  useEffect(() => {
    if (monacoInstance && editorInstance) {
      const languageId = getLanguageId(language);
      
      // Set the model language to activate syntax highlighting and intellisense
      const currentModel = editorInstance.getModel();
      if (currentModel) {
        monacoInstance.editor.setModelLanguage(currentModel, languageId);
      }
    }
  }, [language, editorInstance, monacoInstance]);

  const languageId = getLanguageId(language);

  return (
    <div 
      ref={editorContainerRef}
      className="monaco-editor-container"
      style={{
        width: "100%",
        height: "100%",
        position: "relative",
        overflow: "hidden",
        backgroundColor: theme === "vs-dark" ? "#1e1e1e" : "#ffffff",
        display: "flex",
        flexDirection: "column"
      }}
    >
      <div style={{ flex: 1, position: "relative", height: "100%", display: "flex", flexDirection: "column" }}>
        <div style={{ flex: 1, minHeight: 0, position: "relative" }}>
      <Editor
            language={languageId}
            value={code}
        onChange={(value) => onChange(value || "")}
        theme={theme}
        width="100%"
        height="100%"
        options={{
              minimap: { 
                enabled: true,
                scale: 1,
                showSlider: "mouseover",
                renderCharacters: false
              },
          scrollBeyondLastLine: false,
              fontSize: fontSize,
              tabSize: tabSize,
          automaticLayout: true,
          wordWrap: "on",
          hover: {
            enabled: true,
                delay: 300,
              },
              suggestOnTriggerCharacters: true,
              acceptSuggestionOnEnter: "on",
              formatOnPaste: true,
              formatOnType: true,
              parameterHints: {
                enabled: true,
                cycle: true
              },
              quickSuggestions: {
                other: true,
                comments: true,
                strings: true
              },
              renderLineHighlight: "all",
              matchBrackets: "always",
              autoClosingBrackets: "always",
              autoClosingQuotes: "always",
              folding: true,
              showFoldingControls: "mouseover",
              links: true,
              cursorBlinking: "smooth",
              cursorSmoothCaretAnimation: "on",
              scrollbar: {
                vertical: "auto",
                horizontal: "auto",
                verticalScrollbarSize: 10,
                horizontalScrollbarSize: 10
              },
              codeLens: true,
              accessibilitySupport: "off",
              occurrencesHighlight: "multiFile",
              colorDecorators: true,
              renderWhitespace: "selection",
              bracketPairColorization: {
                enabled: true,
                independentColorPoolPerBracketType: true
              },
              guides: {
                bracketPairs: "active",
                indentation: true
              },
              contextmenu: true,
              inlayHints: {
                enabled: "on"
              },
              stickyScroll: {
                enabled: true
              }
        }}
        onMount={(editor, monaco) => {
              setEditorInstance(editor);
              setMonacoInstance(monaco);
              let pythonHoverProvider: any = null;
              let pythonCompletionProvider: any = null;
              
              // Configure JavaScript/TypeScript services
              monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
                noSemanticValidation: false,
                noSyntaxValidation: false,
                diagnosticCodesToIgnore: []
              });
              
              monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
                noSemanticValidation: false,
                noSyntaxValidation: false,
                diagnosticCodesToIgnore: []
              });
              
              monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
                target: monaco.languages.typescript.ScriptTarget.Latest,
                allowNonTsExtensions: true,
                moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
                module: monaco.languages.typescript.ModuleKind.ESNext,
                lib: ['es2020', 'dom'],
                jsx: monaco.languages.typescript.JsxEmit.React,
                allowJs: true
              });
              
              monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
                target: monaco.languages.typescript.ScriptTarget.Latest,
                allowNonTsExtensions: true,
                moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
                module: monaco.languages.typescript.ModuleKind.ESNext,
                lib: ['es2020', 'dom'],
                jsx: monaco.languages.typescript.JsxEmit.React
              });
              
              // Add extra library support for JavaScript/TypeScript
              monaco.languages.typescript.javascriptDefaults.addExtraLib(`
                // DOM definitions
                declare var document: Document;
                declare var window: Window;
                
                // Common browser APIs
                declare var console: Console;
                declare var localStorage: Storage;
                declare var sessionStorage: Storage;
                declare var fetch: (url: string, options?: any) => Promise<any>;
                
                // Common libraries
                declare var React: any;
                declare var ReactDOM: any;
                declare var _: any; // Lodash
                declare var axios: any;
                declare var moment: any;
                declare var $: any; // jQuery
              `, 'global.d.ts');
              
              // Enhanced completion items for JavaScript/TypeScript
              const jsCompletionProvider = monaco.languages.registerCompletionItemProvider('javascript', {
                provideCompletionItems: (model, position) => {
                  const word = model.getWordUntilPosition(position);
                  const range = {
                    startLineNumber: position.lineNumber,
                    endLineNumber: position.lineNumber,
                    startColumn: word.startColumn,
                    endColumn: word.endColumn
                  };
                  
                  const suggestions = [
                    {
                      label: 'console.log',
                      kind: monaco.languages.CompletionItemKind.Method,
                      documentation: 'Log a message to the console',
                      insertText: 'console.log($0);',
                      insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                      range: range
                    },
                    {
                      label: 'function',
                      kind: monaco.languages.CompletionItemKind.Snippet,
                      documentation: 'Create a new function',
                      insertText: 'function ${1:name}(${2:params}) {\n\t$0\n}',
                      insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                      range: range
                    },
                    {
                      label: 'if',
                      kind: monaco.languages.CompletionItemKind.Snippet,
                      documentation: 'If statement',
                      insertText: 'if (${1:condition}) {\n\t$0\n}',
                      insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                      range: range
                    },
                    {
                      label: 'for',
                      kind: monaco.languages.CompletionItemKind.Snippet,
                      documentation: 'For loop',
                      insertText: 'for (let ${1:i} = 0; ${1:i} < ${2:array}.length; ${1:i}++) {\n\t$0\n}',
                      insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                      range: range
                    }
                  ];
                  
                  return { suggestions };
                }
              });
              
              // Python-specific enhancements 
              if (languageId === 'python') {
                // Register Python hover provider
                pythonHoverProvider = monaco.languages.registerHoverProvider('python', {
                  provideHover: function(model, position) {
                    const word = model.getWordAtPosition(position);
                    if (!word) return null;
                    
                    // Common Python keywords and built-ins with descriptions
                    const pythonDocs: Record<string, string> = {
                      'print': 'print(value, ..., sep=" ", end="\\n")\nPrint the values to the standard output.',
                      'def': 'def function_name(parameters):\n    """docstring"""\n    statements\n\nDefines a function.',
                      'import': 'import module_name\nImports a module.',
                      'class': 'class ClassName:\n    """docstring"""\n    statements\n\nDefines a class.',
                      'for': 'for item in iterable:\n    statements\n\nIterates over an iterable.',
                      'while': 'while condition:\n    statements\n\nExecutes statements as long as condition is true.',
                      'if': 'if condition:\n    statements\n\nExecutes statements if condition is true.',
                      'else': 'if condition:\n    statements\nelse:\n    statements\n\nExecutes statements if condition is false.',
                      'elif': 'if condition1:\n    statements\nelif condition2:\n    statements\n\nChecks another condition if previous conditions are false.',
                      'try': 'try:\n    statements\nexcept ExceptionType:\n    statements\n\nHandles exceptions.',
                      'except': 'try:\n    statements\nexcept ExceptionType:\n    statements\n\nHandles exceptions of specific type.',
                      'finally': 'try:\n    statements\nfinally:\n    statements\n\nExecutes statements regardless of whether an exception occurred.',
                      'with': 'with expression as variable:\n    statements\n\nEnsures proper acquisition and release of resources.',
                      'return': 'return [expression]\nExits a function and optionally returns a value.',
                      'list': 'list([iterable])\nCreates a list object.',
                      'dict': 'dict(**kwarg)\nCreates a dictionary object.',
                      'set': 'set([iterable])\nCreates a set object.',
                      'tuple': 'tuple([iterable])\nCreates a tuple object.',
                      'range': 'range(stop) or range(start, stop[, step])\nGenerates a sequence of numbers.',
                      'len': 'len(object)\nReturns the length of an object.',
                      'str': 'str(object="") or class str\nReturns a string representation of an object.',
                      'int': 'int(x=0) or class int\nConverts a number or string to an integer.',
                      'float': 'float(x=0.0) or class float\nConverts a number or string to a floating point number.',
                      'bool': 'bool([x]) or class bool\nConverts a value to a Boolean.',
                      'input': 'input([prompt])\nReads a line from input, converts it to a string, and returns it.',
                      '__init__': 'def __init__(self, ...):\n    """Constructor method."""\n    statements\n\nSpecial method that is automatically called when a new object is created.',
                      'lambda': 'lambda parameters: expression\nCreates an anonymous function.',
                      'yield': 'yield expression\nPauses the function and returns a value, then resumes where it left off.',
                      'async': 'async def function_name(parameters):\n    statements\n\nDefines an asynchronous function.',
                      'await': 'await expression\nPauses an async function until the awaited expression completes.',
                      'map': 'map(function, iterable)\nApplies function to each item in iterable and returns an iterator.',
                      'filter': 'filter(function, iterable)\nConstructs an iterator from items that function(item) returns True.',
                      'reduce': 'reduce(function, iterable[, initializer])\nApplies function to items in iterable to reduce to a single value.',
                      'sorted': 'sorted(iterable, *, key=None, reverse=False)\nReturns a new sorted list from iterable.',
                      'any': 'any(iterable)\nReturns True if any element of iterable is true.',
                      'all': 'all(iterable)\nReturns True if all elements of iterable are true.',
                      'zip': 'zip(*iterables)\nReturns an iterator of tuples from multiple iterables.',
                      'enumerate': 'enumerate(iterable, start=0)\nReturns an iterator of (index, element) pairs.',
                      'isinstance': 'isinstance(object, classinfo)\nReturns True if object is an instance of classinfo.',
                      'hasattr': 'hasattr(object, name)\nReturns True if object has an attribute with the given name.',
                      'getattr': 'getattr(object, name[, default])\nReturns the value of the named attribute of object.',
                      'open': 'open(file, mode="r")\nOpens a file and returns a file object.',
                    };
                    
                    if (pythonDocs[word.word]) {
                      return {
                        range: new monaco.Range(
                          position.lineNumber,
                          word.startColumn,
                          position.lineNumber,
                          word.endColumn
                        ),
                        contents: [
                          { value: '```python\n' + pythonDocs[word.word] + '\n```' }
                        ]
                      };
                    }
                    
                    return null;
                  }
                });

                // Python completion provider
                pythonCompletionProvider = monaco.languages.registerCompletionItemProvider('python', {
                  provideCompletionItems: (model, position) => {
                    const word = model.getWordUntilPosition(position);
                    const range = {
                      startLineNumber: position.lineNumber,
                      endLineNumber: position.lineNumber,
                      startColumn: word.startColumn,
                      endColumn: word.endColumn
                    };
                    
                    // Common Python snippets
                    const suggestions = [
                      {
                        label: 'function',
                        kind: monaco.languages.CompletionItemKind.Snippet,
                        documentation: 'Define a new function',
                        insertText: 'def ${1:function_name}(${2:parameters}):\n\t"""${3:Docstring}"""\n\t${0:pass}',
                        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                        range: range
                      },
                      {
                        label: 'class',
                        kind: monaco.languages.CompletionItemKind.Snippet,
                        documentation: 'Define a new class',
                        insertText: 'class ${1:ClassName}:\n\t"""${2:Docstring}"""\n\t\n\tdef __init__(self${3:, parameters}):\n\t\t${0:pass}',
                        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                        range: range
                      },
                      {
                        label: 'if',
                        kind: monaco.languages.CompletionItemKind.Snippet,
                        documentation: 'If statement',
                        insertText: 'if ${1:condition}:\n\t${0:pass}',
                        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                        range: range
                      },
                      {
                        label: 'for',
                        kind: monaco.languages.CompletionItemKind.Snippet,
                        documentation: 'For loop',
                        insertText: 'for ${1:item} in ${2:iterable}:\n\t${0:pass}',
                        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                        range: range
                      },
                      {
                        label: 'while',
                        kind: monaco.languages.CompletionItemKind.Snippet,
                        documentation: 'While loop',
                        insertText: 'while ${1:condition}:\n\t${0:pass}',
                        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                        range: range
                      },
                      {
                        label: 'try/except',
                        kind: monaco.languages.CompletionItemKind.Snippet,
                        documentation: 'Try/except block',
                        insertText: 'try:\n\t${1:pass}\nexcept ${2:Exception} as ${3:e}:\n\t${0:pass}',
                        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                        range: range
                      },
                      {
                        label: 'import',
                        kind: monaco.languages.CompletionItemKind.Snippet,
                        documentation: 'Import statement',
                        insertText: 'import ${0:module}',
                        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                        range: range
                      },
                      {
                        label: 'from import',
                        kind: monaco.languages.CompletionItemKind.Snippet,
                        documentation: 'From import statement',
                        insertText: 'from ${1:module} import ${0:name}',
                        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                        range: range
                      }
                    ];
                    
                    return { suggestions };
                  }
                });
              }
              
              // Keep track of disposables for cleanup
              editor.onDidDispose(() => {
                if (jsCompletionProvider) jsCompletionProvider.dispose();
                if (pythonHoverProvider) pythonHoverProvider.dispose();
                if (pythonCompletionProvider) pythonCompletionProvider.dispose();
              });
              
              // Call the onEditorMount callback if provided
              if (onEditorMount) {
                onEditorMount(editor, monaco);
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
        {/* Status bar */}
        <div 
          className="editor-status-bar"
          style={{
            height: "22px",
            backgroundColor: theme === "vs-dark" ? "#007acc" : "#0078d4",
            color: "white",
            fontSize: "12px",
            display: "flex",
            alignItems: "center",
            padding: "0 8px",
            fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
            justifyContent: "space-between",
            borderTop: theme === "vs-dark" ? "1px solid #1e1e1e" : "1px solid #e5e5e5"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            {/* Line and column indicators */}
            <div>
              Ln {cursorPosition.lineNumber}, Col {cursorPosition.column}
            </div>
            {/* Language */}
            <div>
              {getLanguageDisplayName(language)}
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            {/* Tab size */}
            <div>
              Spaces: {tabSize}
            </div>
            {/* Font size */}
            <div>
              Font: {fontSize}px
            </div>
            {/* Theme */}
            <div>
              {theme === "vs-dark" ? "Dark Theme" : "Light Theme"}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 