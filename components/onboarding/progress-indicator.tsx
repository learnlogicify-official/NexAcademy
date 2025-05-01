"use client"

import { motion } from "framer-motion"

interface ProgressIndicatorProps {
  currentStep: number
  totalSteps: number
  labels: string[]
}

export default function ProgressIndicator({ currentStep, totalSteps, labels }: ProgressIndicatorProps) {
  return (
    <div className="w-full max-w-3xl mx-auto mb-8">
      <div className="relative">
        {/* Background line */}
        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-200 dark:bg-slate-700 -translate-y-1/2" />

        {/* Progress line */}
        <motion.div
          className="absolute top-1/2 left-0 h-0.5 bg-gradient-to-r from-violet-500 to-indigo-500 -translate-y-1/2"
          initial={{ width: "0%" }}
          animate={{ width: `${(Math.min(currentStep, totalSteps) / totalSteps) * 100}%` }}
          transition={{ duration: 0.5 }}
        />

        {/* Step indicators */}
        <div className="relative flex justify-between">
          {labels.map((label, index) => {
            const isCompleted = index < currentStep - 1
            const isActive = index === currentStep - 1

            return (
              <div key={index} className="flex flex-col items-center">
                <motion.div
                  className={`w-8 h-8 rounded-full flex items-center justify-center z-10 ${
                    isCompleted
                      ? "bg-gradient-to-r from-violet-500 to-indigo-500 text-white"
                      : isActive
                        ? "bg-white dark:bg-slate-800 border-2 border-violet-500 text-violet-500 dark:text-violet-400"
                        : "bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 text-slate-400"
                  }`}
                  initial={{ scale: 0.8 }}
                  animate={{
                    scale: isActive ? 1.1 : 1,
                  }}
                  transition={{ duration: 0.3 }}
                >
                  {index + 1}
                </motion.div>
                <span
                  className={`mt-2 text-xs ${
                    isActive
                      ? "font-medium text-violet-600 dark:text-violet-400"
                      : isCompleted
                        ? "text-slate-700 dark:text-slate-300"
                        : "text-slate-500 dark:text-slate-500"
                  }`}
                >
                  {label}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
