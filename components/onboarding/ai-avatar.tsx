"use client"

import { motion, AnimatePresence } from "framer-motion"

interface AIAvatarProps {
  expression: "neutral" | "happy" | "thinking" | "excited"
  isTyping: boolean
  username?: string
}

export function AIAvatar({ expression, isTyping, username }: AIAvatarProps) {
  return (
    <div className="relative w-32 h-32">
      <div className="absolute inset-0 bg-white rounded-full shadow-inner overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={expression}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="w-full h-full"
          >
            {/* Robot face */}
            <div className="w-full h-full flex items-center justify-center">
              <div className="relative w-24 h-24 bg-gradient-to-br from-indigo-400 to-violet-500 rounded-full flex items-center justify-center">
                {/* Robot eyes */}
                <div className="absolute flex space-x-6 top-7">
                  {expression === "thinking" ? (
                    <>
                      <motion.div
                        className="w-3 h-3 bg-white rounded-full"
                        animate={{
                          scaleY: [1, 0.3, 1],
                          transition: { repeat: Number.POSITIVE_INFINITY, duration: 1.5 },
                        }}
                      />
                      <motion.div
                        className="w-3 h-3 bg-white rounded-full"
                        animate={{
                          scaleY: [1, 0.5, 1],
                          transition: { repeat: Number.POSITIVE_INFINITY, duration: 1.5, delay: 0.2 },
                        }}
                      />
                    </>
                  ) : expression === "excited" ? (
                    <>
                      <motion.div
                        className="w-3 h-3 bg-white rounded-full"
                        animate={{
                          scale: [1, 1.3, 1],
                          transition: { repeat: Number.POSITIVE_INFINITY, duration: 0.5 },
                        }}
                      />
                      <motion.div
                        className="w-3 h-3 bg-white rounded-full"
                        animate={{
                          scale: [1, 1.3, 1],
                          transition: { repeat: Number.POSITIVE_INFINITY, duration: 0.5 },
                        }}
                      />
                    </>
                  ) : (
                    <>
                      <div className="w-3 h-3 bg-white rounded-full" />
                      <div className="w-3 h-3 bg-white rounded-full" />
                    </>
                  )}
                </div>

                {/* Robot mouth */}
                <div className="absolute bottom-7">
                  {expression === "happy" || expression === "excited" ? (
                    <motion.div
                      className="w-10 h-3 bg-white rounded-full"
                      initial={{ scaleX: 0.7 }}
                      animate={{ scaleX: 1 }}
                    />
                  ) : expression === "thinking" ? (
                    <motion.div
                      className="w-6 h-2 bg-white rounded-full"
                      animate={{
                        scaleX: [1, 0.7, 1],
                        transition: { repeat: Number.POSITIVE_INFINITY, duration: 1.5 },
                      }}
                    />
                  ) : (
                    <div className="w-8 h-2 bg-white rounded-full" />
                  )}
                </div>

                {/* Antenna */}
                <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 w-1 h-6 bg-indigo-300 flex justify-center">
                  <motion.div
                    className="w-3 h-3 rounded-full bg-indigo-200"
                    animate={
                      isTyping
                        ? {
                            y: [0, -5, 0],
                            transition: { repeat: Number.POSITIVE_INFINITY, duration: 1 },
                          }
                        : {}
                    }
                  />
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Animated circles around the avatar when typing */}
      {isTyping && (
        <>
          <motion.div
            className="absolute w-full h-full rounded-full border-2 border-violet-300/30"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.1, 0.3],
              transition: { repeat: Number.POSITIVE_INFINITY, duration: 2, ease: "easeInOut" },
            }}
          />
          <motion.div
            className="absolute w-full h-full rounded-full border-2 border-indigo-300/20"
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.2, 0.1, 0.2],
              transition: { repeat: Number.POSITIVE_INFINITY, duration: 2.5, ease: "easeInOut", delay: 0.3 },
            }}
          />
        </>
      )}
    </div>
  )
}
