"use client"

import { useEffect, useRef } from "react"
import { Sparkles } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface TerminalOutputProps {
  output: string
  isRunning: boolean
  showCelebration: boolean
}

export default function TerminalOutput({ output, isRunning, showCelebration }: TerminalOutputProps) {
  const terminalRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when output changes
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight
    }
  }, [output])

  return (
    <div ref={terminalRef} className="h-48 font-mono text-sm bg-slate-900 text-green-400 overflow-auto p-4 relative">
      {output ? (
        <pre className="whitespace-pre-wrap">{output}</pre>
      ) : (
        <div className="text-slate-500">Run your code to see the output in this terminal</div>
      )}

      {isRunning && (
        <div className="absolute bottom-4 left-4 flex items-center gap-2 animate-pulse">
          <div className="w-2 h-2 bg-green-400 rounded-full"></div>
          <div className="w-2 h-2 bg-green-400 rounded-full animation-delay-200"></div>
          <div className="w-2 h-2 bg-green-400 rounded-full animation-delay-400"></div>
        </div>
      )}

      <AnimatePresence>
        {showCelebration && (
          <motion.div
            className="absolute bottom-4 right-4"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
          >
            <div className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full flex items-center gap-1 text-xs">
              <Sparkles className="h-3 w-3" />
              Code executed successfully!
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
