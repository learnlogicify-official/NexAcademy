"use client"

import { useEffect, useState } from "react"
import { Moon, Sun } from "lucide-react"
import { motion } from "framer-motion"
import { useTheme } from "next-themes"

export default function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])
  
  // Only render the toggle after mounting to avoid hydration mismatch
  if (!mounted) return null

  const isDark = resolvedTheme === "dark"

  const toggleTheme = () => {
    setTheme(isDark ? "light" : "dark")
  }

  return (
    <button
      onClick={toggleTheme}
      className="fixed top-4 right-4 p-2 rounded-full bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm shadow-md z-50"
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      <motion.div
        initial={{ scale: 0.8, rotate: 0 }}
        animate={{ scale: 1, rotate: isDark ? 180 : 0 }}
        transition={{ duration: 0.5, type: "spring" }}
      >
        {isDark ? <Moon className="h-5 w-5 text-indigo-200" /> : <Sun className="h-5 w-5 text-amber-500" />}
      </motion.div>
    </button>
  )
}
