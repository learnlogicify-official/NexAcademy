"use client"
import { ArrowRight } from "lucide-react"
import { HoverBorderGradient } from "@/components/ui/hover-border-gradient"
import { motion } from "framer-motion"

interface HoverBorderGradientDemoProps {
  isEnabled?: boolean
  onSubmit?: () => void
}

export default function HoverBorderGradientDemo({ isEnabled = false, onSubmit }: HoverBorderGradientDemoProps) {
  const handleClick = () => {
    if (isEnabled && onSubmit) {
      onSubmit()
    }
  }

  return (
    <motion.div 
      className="flex justify-center text-center mt-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6, duration: 0.5 }}
    >
      <HoverBorderGradient
        containerClassName={`rounded-full ${!isEnabled ? "opacity-50 cursor-not-allowed filter grayscale" : "hover:shadow-xl hover:shadow-indigo-900/20"}`}
        as="button"
        className={`dark:bg-[#0F0F11] bg-[#0F0F11] text-white flex items-center space-x-2 font-medium tracking-wide text-sm ${!isEnabled ? "pointer-events-none" : ""}`}
        disabled={!isEnabled}
        onClick={handleClick}
      >
        <span className="relative z-10">Continue</span>
        <span className="relative z-10 bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full p-1">
          <ArrowRight className="w-3 h-3 text-white" />
        </span>
      </HoverBorderGradient>
    </motion.div>
  )
}