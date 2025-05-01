"use client"

import { useEffect } from "react"

interface KeyboardShortcutsProps {
  onNext: () => void
  onBack?: () => void
  onRun?: () => void
  disabled?: boolean
}

export default function KeyboardShortcuts({ onNext, onBack, onRun, disabled = false }: KeyboardShortcutsProps) {
  useEffect(() => {
    if (disabled) return

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore key events when focus is in input elements
      if (document.activeElement instanceof HTMLInputElement || document.activeElement instanceof HTMLTextAreaElement) {
        return
      }

      if (e.key === "Enter" && e.ctrlKey) {
        e.preventDefault()
        onNext()
      } else if (e.key === "Backspace" && e.ctrlKey && onBack) {
        e.preventDefault()
        onBack()
      } else if (e.key === "r" && e.ctrlKey && onRun) {
        e.preventDefault()
        onRun()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [onNext, onBack, onRun, disabled])

  return null
}
