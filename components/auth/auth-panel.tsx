"use client";

import { Icons } from "@/components/icons";
import { motion } from "framer-motion";

export function AuthPanel() {
  return (
    <div className="hidden lg:block relative h-full w-full overflow-hidden font-['Inter']">
      {/* Enhanced background with animated gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/40 via-primary/20 to-background" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent" />
      
      {/* Animated code background */}
      <div className="absolute inset-0 opacity-[0.15]">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      {/* Floating Icons */}
      <div className="absolute inset-0 z-10">
        {/* Top left - Terminal */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ 
            opacity: 1,
            y: [0, -20, 0],
            x: [0, 15, 0]
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-[15%] left-[15%]"
        >
          <Icons.terminal className="h-8 w-8 text-primary/40" />
        </motion.div>

        {/* Top center - Laptop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ 
            opacity: 1,
            y: [0, -25, 0]
          }}
          transition={{
            duration: 7,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-[20%] left-[50%] -translate-x-1/2"
        >
          <Icons.laptop className="h-8 w-8 text-primary/40" />
        </motion.div>

        {/* Top right - Rocket */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ 
            opacity: 1,
            y: [0, -20, 0],
            x: [0, -15, 0]
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-[15%] right-[15%]"
        >
          <Icons.rocket className="h-8 w-8 text-primary/40" />
        </motion.div>

        {/* Bottom left - Book */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ 
            opacity: 1,
            y: [0, 20, 0],
            x: [0, 15, 0]
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute bottom-[15%] left-[15%]"
        >
          <Icons.bookOpen className="h-8 w-8 text-primary/40" />
        </motion.div>

        {/* Bottom center - Graduation Cap */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ 
            opacity: 1,
            y: [0, 25, 0]
          }}
          transition={{
            duration: 7,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute bottom-[20%] left-[50%] -translate-x-1/2"
        >
          <Icons.graduationCap className="h-8 w-8 text-primary/40" />
        </motion.div>

        {/* Bottom right - Lightbulb */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ 
            opacity: 1,
            y: [0, 20, 0],
            x: [0, -15, 0]
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute bottom-[15%] right-[15%]"
        >
          <Icons.lightbulb className="h-8 w-8 text-primary/40" />
        </motion.div>
      </div>
      
      {/* Main content */}
      <div className="relative z-20 flex h-full flex-col items-center justify-center p-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center space-y-12"
        >
          {/* Brand section */}
          <div className="flex flex-col items-center space-y-8">
            <motion.div 
              className="relative"
              whileHover={{ scale: 1.05 }}
              animate={{
                scale: [1, 1.05, 1],
                boxShadow: [
                  "0 0 0 0 rgba(var(--primary), 0.2)",
                  "0 0 0 10px rgba(var(--primary), 0)",
                  "0 0 0 0 rgba(var(--primary), 0)"
                ]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <div className="absolute -inset-4 bg-primary/20 rounded-full blur-xl animate-pulse" />
              <div className="relative rounded-full bg-gradient-to-br from-primary/30 to-primary/10 p-8 shadow-lg backdrop-blur-sm border border-white/10">
                <motion.div
                  animate={{
                    rotate: [0, 5, -5, 0]
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  <Icons.code className="h-14 w-14 text-primary" />
                </motion.div>
              </div>
            </motion.div>
            <div className="text-center space-y-4">
              <motion.h1 
                className="text-5xl font-extrabold tracking-tight bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                NexAcademy
              </motion.h1>
              <motion.p 
                className="text-xl font-medium text-foreground tracking-wide"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                Your Journey to Tech Excellence
              </motion.p>
            </div>
          </div>
          
          {/* Quote section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="max-w-2xl text-center"
          >
            <div className="relative bg-gradient-to-br from-primary/20 to-primary/5 p-10 rounded-xl backdrop-blur-sm border border-white/10 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <span className="absolute top-4 left-6 text-4xl leading-none text-primary/30 font-serif">"</span>
              <blockquote className="text-lg font-normal text-foreground/90 leading-relaxed tracking-wide">
                The best way to predict the future is to create it. At NexAcademy, we're not just teaching code - we're shaping the next generation of tech innovators.
              </blockquote>
              <span className="absolute bottom-4 right-6 text-4xl leading-none text-primary/30 font-serif">"</span>
            </div>
            <motion.div 
              className="mt-8 space-y-1"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <p className="text-lg font-semibold text-foreground tracking-wide">Alex Chen</p>
              <p className="text-sm font-normal text-foreground/80 tracking-wide">CTO & Co-founder, NexAcademy</p>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
} 