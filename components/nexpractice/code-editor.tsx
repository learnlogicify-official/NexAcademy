"use client"

import { useEffect, useState, useRef } from "react"
import { javascript } from "@codemirror/lang-javascript"
import { cpp } from "@codemirror/lang-cpp"
import { java } from "@codemirror/lang-java"
import { python } from "@codemirror/lang-python"
import { EditorView, basicSetup } from "codemirror"
import { EditorState } from "@codemirror/state"
import { useTheme } from "next-themes"
import React from "react"
import { Settings, Undo, Check, Minus, Plus, ChevronDown, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip" 
import { createPortal } from "react-dom"
import { keymap } from "@codemirror/view"
import { indentUnit } from "@codemirror/language"
import { StateField, StateEffect, Range, RangeSet, RangeSetBuilder } from "@codemirror/state"
import { Decoration, DecorationSet } from "@codemirror/view"

interface CodeEditorProps {
  code: string
  setCode: (code: string) => void
  language: string
  preloadCode?: string // Original code for reset functionality
  initialShowSettings?: boolean // Initially show settings panel
  editorSettingsRef?: React.RefObject<{ showSettings: () => void } | null> // Ref to expose settings controls
  errorLine?: number | null // Add errorLine prop to highlight error lines
  errorMessage?: string | null // Add error message for tooltip
  readOnly?: boolean // Add readOnly prop
}

// Available themes
const editorThemes = {
  "system": "System Default",
  "light": "Light",
  "dark": "Dark",
  "dracula": "Dracula"
}

// Add/remove error line decorations
const addErrorLine = StateEffect.define<number>()
const clearErrorLines = StateEffect.define<null>()

// Create error line state field
const errorLineField = StateField.define<DecorationSet>({
  create() {
    return Decoration.none
  },
  update(value, tr) {
    value = value.map(tr.changes)
    
    for (let effect of tr.effects) {
      if (effect.is(addErrorLine)) {
        const line = effect.value
        const lines = tr.state.doc.lines
        
        if (line > 0 && line <= lines) {
          try {
            const lineObj = tr.state.doc.line(line)
            const decorations = []
            
            // Create error line decoration that preserves formatting
            decorations.push(
              Decoration.line({
                attributes: { 
                  class: "cm-error-line",
                  "data-error-line": line.toString() 
                }
              }).range(lineObj.from)
            )
            
            // Return a new decoration set
            return RangeSet.of(decorations);
          } catch (e) {
            return value;
          }
        }
      } else if (effect.is(clearErrorLines)) {
        return Decoration.none
      }
    }
    
    return value
  },
  provide(field) {
    return EditorView.decorations.from(field)
  }
})

// Map normalized base language names to CodeMirror extensions
const languageExtensions: Record<string, any> = {
  javascript: javascript(),
  typescript: javascript({ typescript: true }),
  jsx: javascript({ jsx: true }),
  tsx: javascript({ jsx: true, typescript: true }),
  python: python(),
  java: java(),
  cpp: cpp(),
  c: cpp(),
  csharp: () => cpp(), // Fallback to C++ syntax for C#
  go: () => python(), // Fallback to Python syntax for Go
  rust: () => cpp(), // Fallback to C++ syntax for Rust
  php: () => javascript(), // Fallback to JavaScript syntax for PHP
  ruby: () => python(), // Fallback to Python syntax for Ruby
  swift: () => cpp(), // Fallback to C++ syntax for Swift
  kotlin: () => java(), // Fallback to Java syntax for Kotlin
  dart: () => javascript(), // Fallback to JavaScript syntax for Dart
  // Add more as needed with appropriate fallbacks
};

// Robust normalization: map all Judge0 language names/versions to base editor mode
function normalizeLanguageName(languageName: string): string {
  if (!languageName) return 'javascript'; // Default to JavaScript if no language specified
  
  const langStr = String(languageName).toLowerCase();
  
  // First check if this might be a Judge0 language ID
  if (!isNaN(Number(langStr))) {
    // Some common Judge0 language IDs
    const langIdMap: Record<string, string> = {
      '4': 'javascript', // Node.js
      '11': 'python',    // Python 3
      '10': 'python',    // Python 2
      '26': 'python',    // Python 3.6
      '71': 'python',    // Python 3.8
      '29': 'java',      // Java
      '54': 'cpp',       // C++
      '53': 'cpp',       // C++ GCC 8.3.0
      '55': 'java',      // Java
      '56': 'php',       // PHP
      '51': 'csharp',    // C#
      '60': 'go',        // Go
      '73': 'rust',      // Rust
      '72': 'ruby',      // Ruby
    };
    
    if (langIdMap[langStr]) {
      return langIdMap[langStr];
    }
  }
  
  // Special case for "Language X" format (common in some integrations)
  if (langStr.startsWith('language ')) {
    const langId = langStr.split(' ')[1];
    if (!isNaN(Number(langId))) {
      // Try to map the ID part
      const specials: Record<string, string> = {
        '53': 'cpp', // C++ GCC
        '54': 'cpp', // C++ Clang
        '4': 'javascript',
        '11': 'python'
      };
      
      if (specials[langId]) {
        return specials[langId];
      }
    }
  }
  
  // Process language name
  let base = langStr.split(/[\s(]/)[0].trim();
  
  // Map common variations
  if (/^(js|javascript|node)$/.test(base)) return 'javascript';
  if (/^(ts|typescript)$/.test(base)) return 'typescript';
  if (/^(py|python|python3|python2)$/.test(base)) return 'python';
  if (/^(java)$/.test(base)) return 'java';
  if (/^(c\+\+|cpp|cxx|gcc)$/.test(base)) return 'cpp';
  if (/^(c)$/.test(base)) return 'c';
  if (/^(c#|csharp|cs)$/.test(base)) return 'csharp';
  if (/^(go|golang)$/.test(base)) return 'go';
  if (/^(rust|rs)$/.test(base)) return 'rust';
  if (/^(php)$/.test(base)) return 'php';
  if (/^(rb|ruby)$/.test(base)) return 'ruby';
  if (/^(swift)$/.test(base)) return 'swift';
  if (/^(kt|kotlin)$/.test(base)) return 'kotlin';
  if (/^(dart)$/.test(base)) return 'dart';
  
  // Look for C++ in the name (e.g., "C++ GCC 8.3.0")
  if (langStr.includes('c++') || langStr.includes('cpp') || langStr.includes('gcc')) {
    return 'cpp';
  }
  
  return 'javascript'; // Default fallback
}

export function CodeEditor({ code, setCode, language, preloadCode, initialShowSettings = false, editorSettingsRef, errorLine = null, errorMessage = null, readOnly = false }: CodeEditorProps) {
  const [element, setElement] = useState<HTMLElement | null>(null)
  const [editor, setEditor] = useState<EditorView | null>(null)
  const { resolvedTheme, setTheme } = useTheme()
  const isDark = resolvedTheme === "dark"
  const [mounted, setMounted] = useState(false)
  const isUserTyping = React.useRef(false)
  const lastDocContent = React.useRef(code)
  const [cursorPosition, setCursorPosition] = useState({ line: 1, column: 1 })
  
  // Editor settings
  const [tabSize, setTabSize] = useState(4)
  const [fontSize, setFontSize] = useState(15)
  const [editorTheme, setEditorTheme] = useState<string>("system")
  const [showSettings, setShowSettings] = useState(initialShowSettings)
  const [themeDropdownOpen, setThemeDropdownOpen] = useState(false)

  // After mounting, we can safely use the theme
  useEffect(() => {
    setMounted(true)
  }, [])

  // Reset code to original
  const handleResetCode = () => {
    if (preloadCode) {
      setCode(preloadCode)
    }
  }

  // Update editor when settings change
  useEffect(() => {
    if (!element || !mounted || !editor) return
    
    // We need to recreate the editor when settings change
    recreateEditor()
  }, [tabSize, fontSize, editorTheme, resolvedTheme])

  // Create or recreate the editor
  const recreateEditor = () => {
    if (!element || !mounted) return

    // Clean up previous editor instance
    if (editor) {
      editor.destroy()
    }
    
    // Theme is now safe to use
    const isDarkMode = resolvedTheme === 'dark'
    const actualTheme = editorTheme === "system" ? resolvedTheme : editorTheme
    const isDarkTheme = actualTheme === "dark" || actualTheme === "dracula"

    // Create VS Code-like indentation guides
    const indentationMarkers = EditorView.decorations.compute(["doc"], state => {
      const builder = new RangeSetBuilder<Decoration>();
      const decorationType = Decoration.line({ attributes: { class: "cm-indent-line" } });

      for (let i = 1; i <= state.doc.lines; i++) {
        const line = state.doc.line(i);
        let spaces = 0;
        
        // Count leading spaces to determine indentation level
        for (let j = 0; j < line.length; j++) {
          if (line.text[j] === ' ') spaces++;
          else break;
        }
        
        const indentLevel = Math.floor(spaces / tabSize);
        if (indentLevel > 0) {
          // Add an attribute for the indent level
          const decor = Decoration.line({
            attributes: { 
              class: "cm-indent-line",
              style: `--indent-level: ${indentLevel}; --indent-size: ${tabSize}ch;`
            }
          });
          builder.add(line.from, line.from, decor);
        }
      }
      
      return builder.finish();
    });

    const updateListener = EditorView.updateListener.of((update) => {
      if (update.docChanged) {
        isUserTyping.current = true
        lastDocContent.current = update.state.doc.toString()
        setCode(update.state.doc.toString())
        
        // Remove error highlighting when user types
        document.querySelectorAll('.error-highlighted').forEach(el => {
          el.classList.remove('error-highlighted');
        });
        
        // Remove any error markers
        document.querySelectorAll('.error-marker-container').forEach(el => {
          el.remove();
        });
        
        setTimeout(() => {
          isUserTyping.current = false
        }, 100)
      }
      
      // Track cursor position for status bar
      if (update.selectionSet) {
        const selection = update.state.selection.main;
        const line = update.state.doc.lineAt(selection.head);
        const column = selection.head - line.from + 1;
        setCursorPosition({ line: line.number, column });
      }
    })

    // Select language extension based on the normalized language prop
    const getLangExtension = () => {
      const base = normalizeLanguageName(language);
      const extension = languageExtensions[base];
      
      // Handle both direct extensions and function-based fallbacks
      if (typeof extension === 'function') {
        return extension();
      }
      
      return extension || null;
    };

    // Get VS Code-like theme styles as a separate object
    const getVSCodeTheme = (isDark: boolean) => {
      return {
        // Gutter styles
        ".cm-gutters": {
          backgroundColor: isDark ? "#252526" : "#f5f5f5",
          color: isDark ? "#858585" : "#6c7086",
          border: "none",
          borderRight: isDark ? "1px solid #333" : "1px solid #e5e7eb",
          paddingRight: "3px",
        },
        ".cm-activeLineGutter": {
          backgroundColor: isDark ? "#2c2c2c" : "#e6f2ff",
          color: isDark ? "#c6c6c6" : "#333333",
          fontWeight: "normal",
        },
        ".cm-activeLine": {
          backgroundColor: isDark ? "rgba(33, 33, 33, 0.5)" : "rgba(230, 242, 255, 0.5)",
        },
        ".cm-selectionMatch": {
          backgroundColor: isDark ? "rgba(77, 77, 77, 0.5)" : "rgba(200, 200, 200, 0.5)",
        },
        ".cm-cursor": {
          borderLeftColor: isDark ? "#d4d4d4" : "#333333",
          borderLeftWidth: "2px",
        },
        ".cm-selectionBackground, ::selection": {
          backgroundColor: isDark ? "#264f78" : "#add6ff",
        },
        ".cm-focused .cm-selectionBackground": {
          backgroundColor: isDark ? "#264f78" : "#add6ff",
        },
        // Indentation guides
        ".cm-indent-markers:before": {
          content: '""',
          position: "absolute",
          left: "calc(var(--indent-size) * var(--indent-level))",
          top: 0,
          bottom: 0,
          width: "1px",
          background: isDark ? "rgba(100, 100, 100, 0.15)" : "rgba(100, 100, 100, 0.1)",
        },
        // Improved line numbers
        ".cm-lineNumbers .cm-gutterElement": {
          padding: "0 15px 0 10px",
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: "90%",
        },
        // Error highlighting styles
        ".cm-line.error-highlighted": {
          backgroundColor: "rgba(255, 0, 0, 0.15) !important",
        },
      };
    };

    const ext = getLangExtension();
    if (!ext) {
      // Show a warning if unsupported
      console.warn(`No CodeMirror extension found for language: ${language} (normalized: ${normalizeLanguageName(language)}). Falling back to plaintext.`);
    }

    const state = EditorState.create({
      doc: lastDocContent.current,
      extensions: [
        basicSetup,
        ext ? ext : [],
        updateListener,
        EditorView.lineWrapping,
        EditorState.tabSize.of(tabSize),
        indentUnit.of(" ".repeat(tabSize)),
        errorLineField, // Add error line field
        indentationMarkers, // Add VS Code style indentation guides
        keymap.of([
          {
            key: "Tab",
            preventDefault: true,
            run: (view) => {
              const tab = " ".repeat(tabSize)
              view.dispatch(view.state.replaceSelection(tab))
              return true
            },
            shift: (view) => {
              // Outdent logic (optional, can be improved)
              return false
            }
          }
        ]),
        EditorView.theme({
          "&": {
            height: "100%",
            fontSize: `${fontSize}px`,
            margin: 0,
            padding: 0,
            fontFamily: "'JetBrains Mono', monospace",
            ...(actualTheme === "dracula" 
              ? { backgroundColor: "#282a36", color: "#f8f8f2" } 
              : { backgroundColor: isDarkTheme ? "#1e1e1e" : "white", color: isDarkTheme ? "#d4d4d4" : "#333" })
          },
          ".cm-scroller": {
            height: "100%",
            overflow: "auto",
            fontFamily: "'JetBrains Mono', monospace",
            padding: "0",
            /* VS Code scrollbar styling */
            "&::-webkit-scrollbar": {
              width: "10px",
              height: "10px",
            },
            "&::-webkit-scrollbar-track": {
              background: isDarkTheme ? "#1e1e1e" : "#f3f3f3",
            },
            "&::-webkit-scrollbar-thumb": {
              background: isDarkTheme ? "rgba(100, 100, 100, 0.4)" : "rgba(100, 100, 100, 0.4)",
              borderRadius: "3px",
              "&:hover": {
                background: isDarkTheme ? "rgba(100, 100, 100, 0.7)" : "rgba(100, 100, 100, 0.7)",
              }
            },
            /* For Firefox */
            scrollbarWidth: "thin",
            scrollbarColor: isDarkTheme 
              ? "rgba(100, 100, 100, 0.4) #1e1e1e" 
              : "rgba(100, 100, 100, 0.4) #f3f3f3",
          },
          ".cm-content": {
            padding: "0",
            caretColor: isDarkTheme ? "#fff" : "#000",
          },
          ".cm-line": {
            padding: "0 10px",
            lineHeight: "1.6",
            fontFamily: "'JetBrains Mono', monospace",
          },
          ...(actualTheme === "dracula" 
            ? getVSCodeTheme(true) // Use dark theme settings for Dracula
            : getVSCodeTheme(isDarkTheme))
        }),
        EditorView.editable.of(!readOnly),
      ],
    })

    const view = new EditorView({
      state,
      parent: element,
    })

    setEditor(view)
  }

  useEffect(() => {
    recreateEditor()

    return () => {
      if (editor) {
        editor.destroy()
      }
    }
  }, [element, language, mounted, setCode])

  // Add logging for language detection
  useEffect(() => {
    if (language) {
      const normalized = normalizeLanguageName(language);
      const extension = languageExtensions[normalized];
    }
  }, [language]);

  // Update editor content when code prop changes (if different from current)
  useEffect(() => {
    // Only update the editor if the code prop changes from outside
    // and the user is not currently typing
    if (editor && 
        !isUserTyping.current && 
        lastDocContent.current !== code) {
      lastDocContent.current = code
      editor.dispatch({
        changes: {
          from: 0,
          to: editor.state.doc.length,
          insert: code,
        },
      })
    }
  }, [code, editor])
  
  // Handle error line highlighting
  useEffect(() => {
    if (!editor) return;
    
    // Debugging helper to log DOM structure
    const logEditorStructure = () => {
      try {
        const editorDOM = editor.dom;
        if (!editorDOM) {
          return;
        }
        
        // Log the structure of lines and gutters
        const lines = editorDOM.querySelectorAll('.cm-line');
        const gutters = editorDOM.querySelectorAll('.cm-gutter');
        
        
      } catch (e) {
        console.error("Error logging editor structure:", e);
      }
    };
    
    // Function to clear all error highlights
    const clearAllErrorHighlights = () => {
      // Remove all existing error highlights
      document.querySelectorAll('.error-highlighted').forEach(el => {
        el.classList.remove('error-highlighted');
      });
      
      // Remove any error markers
      document.querySelectorAll('.error-marker-container').forEach(el => {
        el.remove();
      });
    };
    
    // Clear existing highlights first
    clearAllErrorHighlights();
    
    // Also clear any decorations via the state field
    editor.dispatch({
      effects: clearErrorLines.of(null)
    });
    
    // If no error line, we're done
    if (errorLine === null || errorLine <= 0) {
      return;
    }
    

    
    // Create a function to apply the highlighting
    const applyHighlighting = () => {
      try {
        // Log editor structure to help debug
        logEditorStructure();
        
        // Get all line elements
        const lineElements = document.querySelectorAll('.cm-line');
        const totalLines = lineElements.length;
        
        // Determine which line to highlight - if error line exceeds available lines, use the last line
        let targetLineIndex = errorLine - 1; // 0-based index
        if (targetLineIndex >= totalLines || targetLineIndex < 0) {
          console.warn(`Error line ${errorLine} exceeds available lines (${totalLines}), using last line instead`);
          targetLineIndex = Math.max(0, totalLines - 1); // Use last line or first if empty
        }
        
        // Get the target line
        const targetLine = lineElements[targetLineIndex];
        
        // Apply error highlighting to the line
        if (targetLine) {
          targetLine.classList.add('error-highlighted');
          
          // Find the editor container
          const editorContainer = editor.dom;
          if (!editorContainer) {
            console.warn("Editor container not found");
            return;
          }
          
          // Measure the vertical position of the target line
          const lineRect = targetLine.getBoundingClientRect();
          const editorRect = editorContainer.getBoundingClientRect();
          
          // Calculate relative position within the editor
          const relativeTop = lineRect.top - editorRect.top;
          const lineHeight = lineRect.height;
          
          // Find the gutter container
          const gutters = editorContainer.querySelector('.cm-gutters');
          if (!gutters || !(gutters instanceof HTMLElement)) {
            console.warn("Gutter container not found");
            return;
          }
          
          // Find the fold gutter specifically
          const foldGutter = editorContainer.querySelector('.cm-gutter.cm-foldGutter');
          if (!foldGutter || !(foldGutter instanceof HTMLElement)) {
            console.warn("Fold gutter not found");
            return;
          }
          
          // Create an absolute positioned container for our error marker
          const markerContainer = document.createElement('div');
          markerContainer.className = 'error-marker-container';
          
          // Get fold gutter position relative to editor
          const foldGutterRect = foldGutter.getBoundingClientRect();
          const foldGutterLeft = foldGutterRect.left - editorRect.left;
          
          // Style the container to position it in the fold gutter
          markerContainer.style.position = 'absolute';
          markerContainer.style.top = `${relativeTop}px`;
          markerContainer.style.height = `${lineHeight}px`;
          markerContainer.style.left = `${foldGutterLeft}px`;
          markerContainer.style.marginLeft = '-4px';
          markerContainer.style.display = 'flex';
          markerContainer.style.justifyContent = 'center';
          markerContainer.style.alignItems = 'center';
          markerContainer.style.width = `${foldGutterRect.width}px`;
          markerContainer.style.zIndex = '100';
          markerContainer.style.pointerEvents = 'none';
          
          // Create the actual error marker
          const marker = document.createElement('div');
          marker.className = 'error-marker';
          marker.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
          `;
          marker.title = 'Click to see error details';

          // Format the error message for better readability
          let formattedErrorMessage = errorMessage || 'Error in this line';

          // If we have a compile or runtime error from Judge0, format it nicely
          if (formattedErrorMessage) {
            // Remove common prefixes in error messages
            formattedErrorMessage = formattedErrorMessage
              .replace(/^Error: /g, '')
              .replace(/^Traceback \(most recent call last\):\n/, '')
              .trim();
          }

          // Create tooltip elements (hidden initially)
          const tooltip = document.createElement('div');
          tooltip.className = 'error-tooltip';
          tooltip.style.display = 'none';

          // Create header with error type and close button
          const errorHeader = document.createElement('div');
          errorHeader.className = 'error-message-header';

          // Determine error type (Compile Error or Runtime Error)
          let errorType = "Error";
          if (formattedErrorMessage.toLowerCase().includes("syntax error") || 
              formattedErrorMessage.toLowerCase().includes("compile")) {
            errorType = "Compile Error";
          } else if (formattedErrorMessage.toLowerCase().includes("runtime") ||
                formattedErrorMessage.toLowerCase().includes("reference error") ||
                formattedErrorMessage.toLowerCase().includes("type error")) {
            errorType = "Runtime Error";
          }

          errorHeader.textContent = errorType;

          // Create close button
          const closeButton = document.createElement('button');
          closeButton.className = 'error-tooltip-close';
          closeButton.textContent = '×';
          closeButton.title = "Close error message";

          // Add close button to header
          errorHeader.appendChild(closeButton);

          // Add header to tooltip
          tooltip.appendChild(errorHeader);

          // Apply syntax highlighting to the error message
          // Safely escape HTML content first to prevent XSS
          const escapeHTML = (str: string) => {
            return str
              .replace(/&/g, '&amp;')
              .replace(/</g, '&lt;')
              .replace(/>/g, '&gt;')
              .replace(/"/g, '&quot;')
              .replace(/'/g, '&#039;');
          };

          let safeMessage = escapeHTML(formattedErrorMessage);

          // 1. Highlight line numbers
          safeMessage = safeMessage.replace(
            /(?:line|at line|:)\s*(\d+)(?:\s|:|,|$)/g, 
            (match, line) => {
              const highlightClass = line === String(errorLine) ? 'error-line-highlight' : 'error-code';
              return match.replace(
                line, 
                `<span class="${highlightClass}">${line}</span>`
              );
            }
          );

          // 2. Highlight code snippets (anything that looks like code)
          safeMessage = safeMessage.replace(
            /`([^`]+)`|'([^']+)'|"([^"]+)"|(\b[a-zA-Z0-9_]+\(.*?\))/g,
            (match, p1, p2, p3, p4) => {
              const code = p1 || p2 || p3 || p4 || '';
              return `<span class="error-code">${code}</span>`;
            }
          );

          // Add error message to tooltip
          const errorMessageEl = document.createElement('div');
          errorMessageEl.className = 'error-message';
          errorMessageEl.innerHTML = safeMessage;
          tooltip.appendChild(errorMessageEl);

          // Add click events to show/hide tooltip
          marker.addEventListener('click', (e) => {
            e.stopPropagation();
            
            // Toggle visibility
            if (tooltip.style.display === 'none') {
              // Calculate best position for tooltip
              positionTooltip();
              
              // Show tooltip with animation
              tooltip.style.display = 'block';
              // Trigger reflow to enable animation
              void tooltip.offsetWidth;
              tooltip.classList.add('visible');
            } else {
              hideTooltip();
            }
          });

          closeButton.addEventListener('click', (e) => {
            e.stopPropagation();
            hideTooltip();
          });

          // Function to position tooltip optimally
          const positionTooltip = () => {
            // Reset any existing position classes
            tooltip.classList.remove('position-right', 'position-left', 'position-top', 'position-bottom');
            
            // Get marker and editor dimensions
            const markerRect = marker.getBoundingClientRect();
            const editorRect = editorContainer.getBoundingClientRect();
            
            // Default position (right)
            let horizontalPosition = 'right';
            let verticalPosition = 'top';
            
            // Check if there's enough space on the right
            const spaceOnRight = window.innerWidth - (markerRect.right + 280); // min-width of tooltip
            if (spaceOnRight < 0) {
              horizontalPosition = 'left';
            }
            
            // Check if there's enough space above
            const spaceAbove = markerRect.top - 150; // approximate min-height for tooltip
            if (spaceAbove < 0) {
              verticalPosition = 'bottom';
            }
            
            // Apply position classes
            tooltip.classList.add(`position-${horizontalPosition}`, `position-${verticalPosition}`);
            
            // Calculate arrow offset based on marker position
            const verticalOffset = markerRect.height / 2;
            let arrowOffset = verticalOffset;
            
            // For horizontal tooltips, position the arrow at marker center
            if (horizontalPosition === 'right' || horizontalPosition === 'left') {
              arrowOffset = Math.min(Math.max(20, verticalOffset), 100);
              tooltip.style.setProperty('--arrow-offset', `${arrowOffset}px`);
            } 
            // For vertical tooltips, position arrow to align with marker
            else {
              const markerCenter = markerRect.left + markerRect.width / 2 - editorRect.left;
              arrowOffset = Math.min(Math.max(20, markerCenter), tooltip.offsetWidth - 20);
              tooltip.style.setProperty('--arrow-offset', `${arrowOffset}px`);
            }
          };

          // Function to hide tooltip with animation
          const hideTooltip = () => {
            tooltip.classList.remove('visible');
            // Wait for animation to complete before hiding
            setTimeout(() => {
              tooltip.style.display = 'none';
            }, 200);
          };

          // Add tooltip to the container
          markerContainer.appendChild(tooltip);

          // Add the marker to our container
          markerContainer.appendChild(marker);

          // Ensure the container gets mouse events
          markerContainer.style.pointerEvents = 'auto';
          
          // Add the container to the editor
          foldGutter.appendChild(markerContainer);
          
        } else {
          console.warn(`Couldn't find element for line ${targetLineIndex + 1}`);
        }
      } catch (e) {
        console.error('Error applying highlighting:', e);
      }
    };
    
    // First scroll to the error line
    const doc = editor.state.doc;
    const totalDocLines = doc.lines;

    // Determine which line to scroll to
    let targetLineNumber = errorLine;
    if (targetLineNumber > totalDocLines || targetLineNumber < 1) {
      targetLineNumber = Math.max(1, totalDocLines);
    }

    // Get the position to scroll to
    const linePos = doc.line(targetLineNumber).from;

    // Scroll to the line
    editor.dispatch({
      effects: EditorView.scrollIntoView(linePos, { y: 'center' })
    });

    // Wait a bit for the editor to render, then apply the highlighting
    setTimeout(() => {
      // Force editor to redraw first
      editor.requestMeasure();
      
      // Then wait a bit more for the DOM to fully update
      setTimeout(() => {
        applyHighlighting();
      }, 50);
    }, 150);
  }, [errorLine, editor]);

  // Clear error highlights and markers when language changes
  useEffect(() => {
    // Remove all existing error highlights
    document.querySelectorAll('.error-highlighted').forEach(el => {
      el.classList.remove('error-highlighted');
    });
    // Remove any error markers
    document.querySelectorAll('.error-marker-container').forEach(el => {
      el.remove();
    });
    // Also clear any decorations via the state field
    if (editor) {
      editor.dispatch({
        effects: clearErrorLines.of(null)
      });
    }
  }, [language]);

  // Expose showSettings function through ref
  React.useEffect(() => {
    if (editorSettingsRef) {
      editorSettingsRef.current = {
        showSettings: () => setShowSettings(true)
      }
    }
  }, [editorSettingsRef])

  // Initialize settings state from props
  React.useEffect(() => {
    if (initialShowSettings) {
      setShowSettings(true)
    }
  }, [initialShowSettings])

  // Settings panel component
  const EditorSettings = () => {
    // Use portal for external trigger to ensure proper positioning
    if (editorSettingsRef && typeof window !== 'undefined') {
      return createPortal(
        <div 
          className={`fixed inset-0 z-[9999] flex items-start justify-center ${showSettings ? '' : 'pointer-events-none opacity-0'}`}
          onClick={(e) => {
            // Close when clicking the backdrop
            if (e.target === e.currentTarget) {
              setShowSettings(false);
              // Always reset state so it can be opened again
              setTimeout(() => setShowSettings(false), 10);
            }
          }}
        >
          {showSettings && (
            <div 
              className="absolute top-[60px] right-[80px] w-80 bg-background border border-border rounded-md shadow-lg"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-3 font-medium border-b">Editor Settings</div>
              <div className="p-4 space-y-4">
                {/* Tab Size Setting */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Tab Size</label>
                    <div className="flex items-center space-x-1">
                      {[2, 4, 8].map((size) => (
                        <Button
                          key={size}
                          variant={tabSize === size ? "default" : "outline"} 
                          size="sm"
                          className="h-8 w-8"
                          onClick={() => setTabSize(size)}
                        >
                          {size}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
                
                {/* Font Size Setting */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Font Size</label>
                    <div className="flex items-center space-x-1">
                      <Button
                        variant="outline" 
                        size="sm"
                        className="h-8 w-8"
                        onClick={() => setFontSize(Math.max(12, fontSize - 1))}
                        disabled={fontSize <= 12}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-8 text-center">{fontSize}</span>
                      <Button
                        variant="outline" 
                        size="sm"
                        className="h-8 w-8"
                        onClick={() => setFontSize(Math.min(24, fontSize + 1))}
                        disabled={fontSize >= 24}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
                
                {/* Theme Setting */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Editor Theme</label>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(editorThemes).map(([key, label]) => (
                      <Button
                        key={key}
                        variant={editorTheme === key ? "default" : "outline"}
                        size="sm"
                        className="justify-start h-9"
                        onClick={() => setEditorTheme(key)}
                      >
                        {label}
                        {editorTheme === key && <Check className="ml-auto h-4 w-4" />}
                      </Button>
                    ))}
                  </div>
                </div>
                
                <Separator />
                
                {/* Reset Code */}
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={handleResetCode}
                  disabled={!preloadCode}
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Reset Code
                </Button>
              </div>
            </div>
          )}
        </div>,
        document.body
      );
    }

    // For internal trigger (button inside editor)
    return (
      <Popover 
        open={showSettings} 
        onOpenChange={(open) => {
          if (!open) setShowSettings(false);
        }}
      >
        <PopoverTrigger asChild>
          <Button 
            variant="ghost" 
            size="icon" 
            className="absolute top-2 right-2 z-10 h-8 w-8 rounded-md bg-background/80 backdrop-blur"
          >
            <Settings className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent 
          className="w-80 p-0" 
          align="end" 
          sideOffset={5}
          side="bottom"
          avoidCollisions={true}
        >
          <div className="p-3 font-medium border-b">Editor Settings</div>
          <div className="p-4 space-y-4">
            {/* Tab Size Setting */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Tab Size</label>
                <div className="flex items-center space-x-1">
                  {[2, 4, 8].map((size) => (
                    <Button
                      key={size}
                      variant={tabSize === size ? "default" : "outline"} 
                      size="sm"
                      className="h-8 w-8"
                      onClick={() => setTabSize(size)}
                    >
                      {size}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Font Size Setting */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Font Size</label>
                <div className="flex items-center space-x-1">
                  <Button
                    variant="outline" 
                    size="sm"
                    className="h-8 w-8"
                    onClick={() => setFontSize(Math.max(12, fontSize - 1))}
                    disabled={fontSize <= 12}
                  >
                    <Minus className="h-3 w-3" />
                  </Button>
                  <span className="w-8 text-center">{fontSize}</span>
                  <Button
                    variant="outline" 
                    size="sm"
                    className="h-8 w-8"
                    onClick={() => setFontSize(Math.min(24, fontSize + 1))}
                    disabled={fontSize >= 24}
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>
            
            {/* Theme Setting */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Editor Theme</label>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(editorThemes).map(([key, label]) => (
                  <Button
                    key={key}
                    variant={editorTheme === key ? "default" : "outline"}
                    size="sm"
                    className="justify-start h-9"
                    onClick={() => setEditorTheme(key)}
                  >
                    {label}
                    {editorTheme === key && <Check className="ml-auto h-4 w-4" />}
                  </Button>
                ))}
              </div>
            </div>
            
            <Separator />
            
            {/* Reset Code */}
            <Button 
              variant="outline" 
              className="w-full"
              onClick={handleResetCode}
              disabled={!preloadCode}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Reset Code
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    );
  };

  // Use consistent styling for server and client render
  return (
    <div className="relative w-full h-full">
      <EditorSettings />
      <div 
        ref={setElement} 
        className="w-full editor-container"
        style={{ 
          height: "calc(100% - 22px)", // Leave room for status bar
          overflow: "hidden",
          display: "flex", 
          flexDirection: "column",
          borderRadius: "6px 6px 0 0",
          padding: 0,
          margin: 0,
        }}
      />
      
      {/* VS Code style status bar */}
      <div className="vscode-status-bar">
        <div className="status-section status-position">
          <span>Ln {cursorPosition.line}, Col {cursorPosition.column}</span>
        </div>
        <div className="status-section status-language">
          <span>{
            // Show a user-friendly language name 
            language ? (
              language.includes('(') 
                ? language.split('(')[0].trim() 
                : (language === normalizeLanguageName(language) ? language.charAt(0).toUpperCase() + language.slice(1) : language)
            ) : 'JavaScript'
          }</span>
        </div>
        <div className="status-section status-encoding">
          <span>UTF-8</span>
        </div>
        <div className="status-section status-eol">
          <span>LF</span>
        </div>
        <div className="status-section status-indent">
          <span>Spaces: {tabSize}</span>
        </div>
      </div>
      
      <style jsx global>{`
        /* VS Code style status bar */
        .vscode-status-bar {
          height: 22px;
          background-color: ${isDark ? "#007acc" : "#007acc"};
          color: #ffffff;
          font-size: 12px;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          display: flex;
          flex-direction: row;
          align-items: center;
          padding: 0 10px;
          border-radius: 0 0 6px 6px;
        }
        
        .status-section {
          display: flex;
          align-items: center;
          padding: 0 8px;
          height: 100%;
          border-right: 1px solid rgba(255, 255, 255, 0.2);
        }
        
        .status-section:last-child {
          border-right: none;
        }
        
        .status-position {
          min-width: 100px;
        }
        
        .status-language {
          min-width: 80px;
        }
        
        /* Error line styling */
        .cm-line.error-highlighted {
          background-color: rgba(255, 0, 0, 0.15) !important;
        }
        
        /* Container for the error marker */
        .error-marker-container {
          position: absolute;
          display: flex;
          align-items: center;
          justify-content: center;
          padding-left: 0;
          margin-left: -8px;
          pointer-events: none !important;
        }
        
        /* Style the error marker itself */
        .error-marker {
          display: flex;
          justify-content: center;
          align-items: center;
          width: 32px;
          height: 18px;
          background-color: #e5484d;
          color: #fff;
          border-radius: 50%;
          font-size: 15px;
          font-weight: bold;
          border: 2px solid #fff;
          box-shadow: 0 2px 8px rgba(229, 72, 77, 0.15), 0 1.5px 4px rgba(0,0,0,0.10);
          pointer-events: auto;
          cursor: pointer;
          z-index: 100;
          transition: box-shadow 0.15s, background 0.15s, transform 0.1s;
          line-height: 1;
          letter-spacing: 0.5px;
        }
        .error-marker svg {
          width: 16px;
          height: 16px;
          stroke: #fff;
          stroke-width: 3;
          vertical-align: middle;
        }
        .error-marker:hover {
          background-color: #ff4d4f;
          box-shadow: 0 4px 16px rgba(229, 72, 77, 0.25), 0 2px 8px rgba(0,0,0,0.15);
          transform: scale(1.08);
        }
        
        /* Error tooltip styling */
        .error-tooltip {
          position: absolute;
          left: 28px;
          top: -10px;
          min-width: 280px;
          max-width: 550px;
          background-color: #2d2d2d;
          border: 1px solid #444;
          border-radius: 6px;
          padding: 12px;
          font-size: 13px;
          color: #f1f1f1;
          z-index: 9999;
          box-shadow: 0 6px 20px rgba(0,0,0,0.25), 0 2px 8px rgba(0,0,0,0.15);
          pointer-events: auto;
          max-height: 350px;
          overflow: auto;
          font-family: 'JetBrains Mono', monospace;
          opacity: 0;
          transform: translateY(-5px);
          transition: opacity 0.2s ease, transform 0.2s ease;
          --arrow-offset: 20px;
        }
        
        .error-tooltip::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        
        .error-tooltip::-webkit-scrollbar-track {
          background: #333;
          border-radius: 4px;
        }
        
        .error-tooltip::-webkit-scrollbar-thumb {
          background: #555;
          border-radius: 4px;
        }
        
        .error-tooltip::-webkit-scrollbar-thumb:hover {
          background: #666;
        }
        
        .error-tooltip.visible {
          opacity: 1;
          transform: translateY(0);
        }
        
        /* Position variations */
        .error-tooltip.position-right {
          left: 28px;
          right: auto;
        }
        
        .error-tooltip.position-left {
          left: auto;
          right: 28px;
        }
        
        .error-tooltip.position-bottom {
          top: 24px;
        }
        
        .error-tooltip.position-top {
          top: -10px;
        }
        
        /* Arrow for the tooltip - adjust based on position */
        .error-tooltip.position-right::before {
          content: '';
          position: absolute;
          left: -6px;
          top: var(--arrow-offset);
          border-top: 6px solid transparent;
          border-bottom: 6px solid transparent;
          border-right: 6px solid #444;
        }
        
        .error-tooltip.position-right::after {
          content: '';
          position: absolute;
          left: -5px;
          top: var(--arrow-offset);
          border-top: 6px solid transparent;
          border-bottom: 6px solid transparent;
          border-right: 6px solid #2d2d2d;
        }
        
        .error-tooltip.position-left::before {
          content: '';
          position: absolute;
          right: -6px;
          top: var(--arrow-offset);
          border-top: 6px solid transparent;
          border-bottom: 6px solid transparent;
          border-left: 6px solid #444;
        }
        
        .error-tooltip.position-left::after {
          content: '';
          position: absolute;
          right: -5px;
          top: var(--arrow-offset);
          border-top: 6px solid transparent;
          border-bottom: 6px solid transparent;
          border-left: 6px solid #2d2d2d;
        }
        
        .error-tooltip.position-bottom::before {
          content: '';
          position: absolute;
          top: -6px;
          left: var(--arrow-offset);
          border-left: 6px solid transparent;
          border-right: 6px solid transparent;
          border-bottom: 6px solid #444;
        }
        
        .error-tooltip.position-bottom::after {
          content: '';
          position: absolute;
          top: -5px;
          left: var(--arrow-offset);
          border-left: 6px solid transparent;
          border-right: 6px solid transparent;
          border-bottom: 6px solid #2d2d2d;
        }
        
        .error-tooltip.position-top::before {
          content: '';
          position: absolute;
          bottom: -6px;
          left: var(--arrow-offset);
          border-left: 6px solid transparent;
          border-right: 6px solid transparent;
          border-top: 6px solid #444;
        }
        
        .error-tooltip.position-top::after {
          content: '';
          position: absolute;
          bottom: -5px;
          left: var(--arrow-offset);
          border-left: 6px solid transparent;
          border-right: 6px solid transparent;
          border-top: 6px solid #2d2d2d;
        }
        
        /* Error message header */
        .error-message-header {
          color: #ff6b6b;
          font-weight: bold;
          margin-bottom: 8px;
          padding-bottom: 8px;
          border-bottom: 1px solid #444;
          font-size: 14px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        /* Error message styling */
        .error-message {
          white-space: pre-wrap;
          word-break: break-word;
          line-height: 1.6;
          overflow-x: auto;
        }
        
        /* Code span styling */
        .error-code {
          font-family: 'JetBrains Mono', monospace;
          background-color: #3a3a3a;
          border-radius: 3px;
          padding: 0 4px;
          color: #f8f8f8;
        }
        
        /* Line number highlight */
        .error-line-highlight {
          background-color: rgba(255, 0, 0, 0.2);
          padding: 2px 4px;
          border-radius: 3px;
          color: #ff9999;
          font-weight: bold;
        }
        
        /* Close button hover effect */
        .error-tooltip-close {
          color: #999;
          background: none;
          border: none;
          font-size: 16px;
          cursor: pointer;
          padding: 0 4px;
          border-radius: 3px;
        }
        
        .error-tooltip-close:hover {
          color: #fff;
          background-color: rgba(255, 255, 255, 0.1);
        }

        /* VS Code style indentation guides */
        .cm-indent-line {
          position: relative;
        }

        .cm-indent-line::before {
          content: "";
          position: absolute;
          top: 0;
          bottom: 0;
        }

        /* Generate indentation guidelines at each indent level */
        .cm-indent-line::before {
          border-left: 1px solid ${isDark ? "rgba(100, 100, 100, 0.25)" : "rgba(100, 100, 100, 0.15)"};
          left: calc(var(--indent-size) * var(--indent-level) - ${tabSize}ch);
        }

        /* Make scrollbars match VS Code's style */
        .cm-scroller::-webkit-scrollbar {
          width: 10px;
          height: 10px;
        }

        .cm-scroller::-webkit-scrollbar-track {
          background: ${isDark ? "#1e1e1e" : "#f3f3f3"};
        }

        .cm-scroller::-webkit-scrollbar-thumb {
          background: ${isDark ? "rgba(100, 100, 100, 0.5)" : "rgba(100, 100, 100, 0.4)"};
          border-radius: 3px;
        }

        .cm-scroller::-webkit-scrollbar-thumb:hover {
          background: ${isDark ? "rgba(100, 100, 100, 0.8)" : "rgba(100, 100, 100, 0.7)"};
        }

        .cm-scroller::-webkit-scrollbar-corner {
          background: ${isDark ? "#1e1e1e" : "#f3f3f3"};
        }
      `}</style>
    </div>
  )
}
