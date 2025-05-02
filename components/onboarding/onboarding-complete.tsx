"use client"

import { Button } from "@/components/ui/button"
import { Sparkles, Rocket } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"
import { useState } from "react"
import dynamic from "next/dynamic"
import { signIn } from "next-auth/react"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"

interface OnboardingData {
  username: string
  profilePic: string
  bio: string
  language: string
  code: string
}

interface OnboardingCompleteProps {
  data: OnboardingData
}

// Dynamically import react-confetti to avoid SSR issues
const Confetti = dynamic(() => import("react-confetti"), { ssr: false })

export default function OnboardingComplete({ data }: OnboardingCompleteProps) {
  const [loading, setLoading] = useState(false)
  const [showWelcome, setShowWelcome] = useState(false)

  const handleStart = async () => {
    setLoading(true)
    try {
      await fetch("/api/onboarding/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      })
      // Refresh session so hasOnboarded is up to date
      await signIn(undefined, { redirect: false })
      window.location.href = "/dashboard"
    } catch (e) {
      // Optionally handle error
    }
    setLoading(false)
  }

  if (showWelcome) {
    return (
      <motion.div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-br from-violet-100 to-indigo-200 dark:from-slate-900 dark:to-slate-800 overflow-hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.7 }}>
        {/* Confetti background */}
        <Confetti
          width={typeof window !== 'undefined' ? window.innerWidth : 1920}
          height={typeof window !== 'undefined' ? window.innerHeight : 1080}
          numberOfPieces={350}
          recycle={false}
          gravity={0.25}
        />
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", stiffness: 120, delay: 0.2 }} className="flex flex-col items-center gap-6">
          <motion.div
            initial={{ y: -60, rotate: -20, opacity: 0 }}
            animate={{ y: 0, rotate: 0, opacity: 1 }}
            transition={{ type: "spring", stiffness: 180, damping: 10, delay: 0.3 }}
          >
            <Rocket className="h-20 w-20 text-violet-600 animate-bounce drop-shadow-2xl" />
          </motion.div>
          <motion.h1
            className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-2 drop-shadow-xl"
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 120, delay: 0.5 }}
          >
            Welcome to NexAcademy!
          </motion.h1>
          <motion.p
            className="text-lg md:text-2xl text-slate-700 dark:text-slate-200 mb-6"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.6 }}
          >
            Your AI-powered coding journey starts now 🚀
          </motion.p>
          {/* Animated code block as terminal */}
          <motion.pre
            className="bg-black/80 text-green-400 font-mono rounded-lg p-4 mt-6 shadow-lg text-base md:text-lg"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.7 }}
          >
            {`console.log("Welcome to NexAcademy, @${data.username}! 🚀");`}
          </motion.pre>
          <Link href="/dashboard" passHref>
            <Button className="px-8 py-4 text-lg bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 shadow-xl">
              Go to Dashboard
            </Button>
          </Link>
        </motion.div>
      </motion.div>
    )
  }

  return (
    <div className="p-3 space-y-4 text-center">
      <motion.div
        className="flex justify-center"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
      >
        <div className="rounded-full bg-gradient-to-r from-violet-100 to-indigo-100 p-2">
          <Rocket className="h-8 w-8 text-violet-600" />
        </div>
      </motion.div>

      <motion.div
        className="space-y-1"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">You're all set, <span className="text-violet-700 dark:text-violet-400">@{data.username}</span>!</h2>
        <p className="text-slate-500 dark:text-slate-400 text-xs">
          Your coding journey with AI begins now.<br/>Let's build amazing things together!
        </p>
      </motion.div>

      <motion.div
        className="rounded-lg p-2 text-left max-w-xs mx-auto bg-white/50 dark:bg-slate-800/30 border border-slate-200 dark:border-slate-700"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <h3 className="font-medium mb-2 flex items-center gap-1 text-slate-800 dark:text-slate-200 text-sm">
          <Sparkles className="h-3 w-3 text-violet-500" />
          <span>Your Profile</span>
        </h3>
        <div className="space-y-2 text-xs">
          <div className="flex justify-center mb-3">
            <Avatar className="h-16 w-16 border-2 border-violet-200 dark:border-violet-900/30">
              {data.profilePic ? (
                <AvatarImage src={data.profilePic} alt={data.username} />
              ) : (
                <AvatarFallback className="text-lg">
                  {data.username.charAt(0).toUpperCase()}
                </AvatarFallback>
              )}
            </Avatar>
          </div>
          <div className="flex items-center gap-1 p-2 bg-white/80 dark:bg-slate-800/50 backdrop-blur-sm rounded-md">
            <span className="font-medium text-slate-700 dark:text-slate-300">Username:</span>
            <span className="text-violet-700 dark:text-violet-400">@{data.username}</span>
          </div>
          <div className="flex flex-col gap-1 p-2 bg-white/80 dark:bg-slate-800/50 backdrop-blur-sm rounded-md">
            <span className="font-medium text-slate-700 dark:text-slate-300">Bio:</span>
            <span className="text-slate-600 dark:text-slate-400">{data.bio || "(Not provided)"}</span>
          </div>
          <div className="flex items-center gap-1 p-2 bg-white/80 dark:bg-slate-800/50 backdrop-blur-sm rounded-md">
            <span className="font-medium text-slate-700 dark:text-slate-300">Primary Language:</span>
            <span className="text-violet-700 dark:text-violet-400">
              {data.language.charAt(0).toUpperCase() + data.language.slice(1)}
            </span>
          </div>
        </div>
      </motion.div>

      <motion.div
        className="pt-2 max-w-xs mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <Button
          className="w-full py-3 text-xs bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 flex items-center justify-center gap-2"
          onClick={handleStart}
          disabled={loading}
        >
          {loading && <span className="loader border-2 border-white border-t-transparent rounded-full w-4 h-4 animate-spin"></span>}
          Start Learning with Nex
        </Button>
      </motion.div>
    </div>
  )
}
