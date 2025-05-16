"use client"

import React from "react"
import { motion } from "framer-motion"
import { ChevronRight } from "lucide-react"
import { App, SelectedAppLoaderProps } from "../types"

export const SelectedAppLoader: React.FC<SelectedAppLoaderProps> = ({ 
  app, 
  isLoading, 
  isExiting = false 
}) => {
  const Icon = app.icon

  return (
    <div className="flex flex-col items-center">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ 
          scale: isExiting ? 0.7 : 1.5, 
          opacity: 1 
        }}
        transition={{ 
          type: "spring", 
          stiffness: 300, 
          damping: 25 
        }}
        className="relative"
      >
        <div className={`relative w-[110px] h-[110px] rounded-full bg-gradient-to-br ${app.color}`}>
          {/* Animated rings */}
          <motion.div
            className="absolute -inset-8 rounded-full"
            animate={{ scale: [1, 1.1, 1], opacity: [0.2, 0.5, 0.2] }}
            transition={{ repeat: Number.POSITIVE_INFINITY, duration: 2, ease: "easeInOut" }}
          >
            <div className={`w-full h-full rounded-full ${app.bgColor} opacity-20`}></div>
          </motion.div>

          {/* The icon itself */}
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              animate={{
                rotate: isLoading ? 360 : 0,
              }}
              transition={{
                rotate: { repeat: Number.POSITIVE_INFINITY, duration: 4, ease: "linear" },
              }}
            >
              <Icon className="h-12 w-12 text-white" />
            </motion.div>
          </div>

          {/* Loading spinner - Updated to use blue spinner */}
          {isLoading && (
            <div className="absolute -inset-4 flex items-center justify-center">
              <div className="relative h-[140px] w-[140px]">
                <div className="absolute inset-0 rounded-full border-4 border-blue-200 dark:border-blue-800 opacity-75"></div>
                <div className="absolute inset-0 rounded-full border-t-4 border-blue-600 dark:border-blue-400 animate-spin"></div>
              </div>
            </div>
          )}

          {/* PRO badge */}
          {app.isPro && (
            <div className="absolute -top-2 -right-2 px-2 py-0.5 bg-gradient-to-r from-blue-600 to-blue-500 rounded-full text-xs font-bold text-white shadow-lg">
              PRO
            </div>
          )}
        </div>
      </motion.div>

      {/* App name and loading text */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ 
          opacity: isExiting ? 0 : 1, // Hide when exiting
          y: 0
        }}
        transition={{ delay: 0.3 }}
        className="mt-8 text-center"
      >
        <h3 className="text-xl font-medium text-white mb-2">{app.name}</h3>
        {isLoading && (
          <div className="flex items-center text-blue-400 text-sm">
            <motion.div
              animate={{ x: [0, 4, 0] }}
              transition={{ repeat: Number.POSITIVE_INFINITY, duration: 1.5, ease: "easeInOut" }}
            >
              <ChevronRight className="h-4 w-4" />
            </motion.div>
            <span className="ml-1">Loading experience</span>
          </div>
        )}
      </motion.div>
    </div>
  )
}
