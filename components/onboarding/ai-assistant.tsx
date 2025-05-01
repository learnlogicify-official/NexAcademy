"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { AIAvatar } from "@/components/onboarding/ai-avatar"

interface AIAssistantProps {
  message: string
  step: number
  username?: string
}

export default function AIAssistant({ message, step, username }: AIAssistantProps) {
  const [displayedMessage, setDisplayedMessage] = useState("")
  const [isTyping, setIsTyping] = useState(true)
  const [charIndex, setCharIndex] = useState(0)

  useEffect(() => {
    setCharIndex(0)
    setDisplayedMessage("")
    setIsTyping(true)
  }, [message])

  useEffect(() => {
    if (charIndex < message.length) {
      const timer = setTimeout(() => {
        setDisplayedMessage((prev) => prev + message[charIndex])
        setCharIndex((prev) => prev + 1)
      }, 20) // Speed of typing

      return () => clearTimeout(timer)
    } else {
      setIsTyping(false)
    }
  }, [charIndex, message])

  // Determine expression based on step and typing state
  const getExpression = () => {
    if (isTyping) return "thinking"
    switch (step) {
      case 1:
        return "neutral"
      case 2:
        return "happy"
      case 3:
        return "neutral"
      case 4:
        return "thinking"
      case 5:
        return "excited"
      default:
        return "neutral"
    }
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 p-6 bg-gradient-to-br from-violet-600 to-indigo-600 text-white rounded-xl shadow-lg relative overflow-hidden">
        <div className="flex flex-col h-full">
          <div className="flex-1 flex flex-col items-center justify-center">
            <AIAvatar expression={getExpression()} isTyping={isTyping} username={username} />
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="mt-4"
            >
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-sm leading-relaxed">
                {displayedMessage}
                {isTyping && <span className="animate-pulse">|</span>}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Decorative elements */}
        <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-white/10 rounded-full"></div>
        <div className="absolute top-10 -left-4 w-8 h-8 bg-white/10 rounded-full"></div>
      </div>
    </div>
  )
}
