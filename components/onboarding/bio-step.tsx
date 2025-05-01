"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Sparkles, Dice3 } from "lucide-react"

interface BioStepProps {
  bio: string
  updateBio: (bio: string) => void
  onNext: () => void
  onBack: () => void
}

const PROMPTS = [
  "What's your coding superpower?",
  "Drop your favorite meme or emoji!",
  "What's your dream hackathon project?",
  "Describe your vibe in 5 words.",
  "What's your go-to coding snack?",
  "If you could code anywhere, where would it be?",
  "What's a tech trend you love?",
  "What's your favorite programming language and why?",
  "What's your proudest project?",
  "What's your favorite bug story?",
]

function getPromptEmoji(bio: string) {
  if (/ai|ml|machine learning|data/i.test(bio)) return "🤖"
  if (/web|frontend|react|next/i.test(bio)) return "🌐"
  if (/game|unity|unreal|pixel/i.test(bio)) return "🎮"
  if (/mobile|android|ios|flutter/i.test(bio)) return "📱"
  if (/python|snake/i.test(bio)) return "🐍"
  if (/java/i.test(bio)) return "☕"
  if (/c\+\+|c#/i.test(bio)) return "💻"
  if (/hackathon|project/i.test(bio)) return "🚀"
  if (/snack|pizza|coffee|tea|chai/i.test(bio)) return "🍕"
  if (/music|song|lofi|beat/i.test(bio)) return "🎵"
  if (/meme|funny|lol/i.test(bio)) return "😂"
  if (/retro|pixel|vapor/i.test(bio)) return "🕹️"
  return "✨"
}

export default function BioStep({ bio, updateBio, onNext, onBack }: BioStepProps) {
  const [error, setError] = useState("")
  const [promptIdx, setPromptIdx] = useState(() => Math.floor(Math.random() * PROMPTS.length))
  const maxLength = 200

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (bio.length > maxLength) {
      setError(`Bio must be ${maxLength} characters or less`)
      return
    }
    setError("")
    onNext()
  }

  const handleShuffle = () => {
    let nextIdx = Math.floor(Math.random() * PROMPTS.length)
    while (nextIdx === promptIdx) nextIdx = Math.floor(Math.random() * PROMPTS.length)
    setPromptIdx(nextIdx)
  }

  const badgeEmoji = getPromptEmoji(bio)

  return (
    <div className="panel p-8 space-y-8 bg-slate-900/80 border border-slate-700/60 rounded-2xl font-mono relative overflow-hidden">
      <div className="space-y-3 z-10 relative">
        <div className="flex items-center justify-center gap-2">
          <span className="text-2xl">{badgeEmoji}</span>
          <h2 className="text-2xl font-bold text-slate-100 font-mono text-center tracking-widest uppercase">
            {PROMPTS[promptIdx]}
          </h2>
          <button type="button" aria-label="Shuffle prompt" onClick={handleShuffle} className="ml-2 p-1 rounded hover:bg-slate-700/40 transition">
            <Dice3 className="w-5 h-5 text-slate-400" />
          </button>
        </div>
        <p className="text-slate-400 text-lg text-center font-mono">
          Share your coding energy, fav emojis, or what makes you unique!
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 max-w-md mx-auto z-10 relative">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label htmlFor="bio" className="text-base font-mono text-slate-300">
              Your Vibe
            </Label>
            <span
              className={`text-sm font-mono px-2 py-0.5 rounded-full ${
                bio.length > maxLength
                  ? "bg-red-900/40 text-red-400"
                  : bio.length > maxLength - 20
                  ? "bg-yellow-900/40 text-yellow-300"
                  : "bg-slate-800/60 text-slate-400"
              }`}
            >
              {bio.length}/{maxLength}
            </span>
          </div>
          <Textarea
            id="bio"
            placeholder="Web dev 🚀 | AI enthusiast 🤖 | Always learning 📚 | Drop your vibe here..."
            value={bio}
            onChange={(e) => {
              updateBio(e.target.value)
              if (error) setError("")
            }}
            className={`min-h-[150px] text-base font-mono bg-slate-900 text-slate-100 border border-slate-700 focus:ring-2 focus:ring-cyan-500/40 ${error ? "border-red-500" : ""}`}
            maxLength={maxLength + 10}
            autoComplete="off"
          />
          {error && <p className="text-sm text-red-500 mt-1 font-mono">{error}</p>}
        </div>

        <div className="flex gap-3">
          <Button type="button" variant="outline" onClick={onBack} className="py-3 text-base font-mono border border-slate-700 text-slate-300 bg-slate-800 hover:bg-slate-700">
            ← Back
          </Button>
          <Button
            type="submit"
            className="flex-1 py-3 text-base bg-slate-800 border border-slate-700 text-slate-200 font-mono rounded hover:bg-slate-700 transition-all duration-150"
            disabled={bio.length > maxLength}
          >
            Next Step <span className="ml-1">👉</span>
          </Button>
        </div>
      </form>
    </div>
  )
}

// Add this to your global CSS or Tailwind config for pixel border effect:
// .pixel-border-effect {
//   box-shadow: 0 0 0 4px #f472b6, 0 0 0 8px #fff0, 0 0 0 12px #f472b6;
//   border-radius: 18px;
// }
