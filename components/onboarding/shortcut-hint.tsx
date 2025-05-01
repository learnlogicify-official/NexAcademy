"use client"

import { useState, useEffect } from "react"
import { Keyboard } from "lucide-react"

export default function ShortcutHint() {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false)
    }, 5000)

    return () => clearTimeout(timer)
  }, [])

  if (!visible) return null

  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-white dark:bg-slate-800 shadow-lg rounded-lg px-4 py-2 text-sm flex items-center gap-2 text-slate-600 dark:text-slate-300 z-50 animate-fade-in-up">
      <Keyboard className="h-4 w-4" />
      <span>
        Pro tip: Use <kbd className="px-1 py-0.5 bg-slate-100 dark:bg-slate-700 rounded">Ctrl+Enter</kbd> to continue
      </span>
    </div>
  )
}

const fadeInUp = `@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px); /* Corrected: Removed translate(-50%, ...) and used translateY */
  }
  to {
    opacity: 1;
    transform: translateY(0); /* Corrected: Removed translate(-50%, ...) and used translateY */
  }
}`

const fadeIn = `@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}`

.animate-fade-in-up
{
  animation: fadeInUp
  0.5s ease-out forwards
}
