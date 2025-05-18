"use client"
import { useState } from "react"
import type React from "react"

import { HoverBorderGradient } from "@/components/ui/hover-border-gradient"
import { ArrowUpRight, Sparkles } from "lucide-react"
import { motion } from "framer-motion"
import { PlaceholdersAndVanishInput } from "@/components/ui/placeholders-and-vanish-input"

interface UserBioInputProps {
  username: string
  onContinue: (bio: string, interests: string[]) => void
}

export default function UserBioInput({ username, onContinue }: UserBioInputProps) {
  const [bio, setBio] = useState("")
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const maxChars = 200

  // Bio placeholders that will change every few seconds
  const placeholders = [
    "Coding wizard seeking digital adventures...",
    "Tech enthusiast with a passion for innovation...",
    "Building the future one line of code at a time...",
    "Always learning, always coding, always creating...",
    "On a mission to master the art of programming...",
  ]

  const handleBioChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const newBio = e.target.value
    if (newBio.length <= maxChars) {
      setBio(newBio)
    }
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (bio.trim().length > 0) {
      onContinue(bio, selectedTags)
    }
  }

  // Updated interest tags focused on tech, coding, and student interests
  const interestTags = [
    { id: "frontend", label: "🎨 Frontend" },
    { id: "backend", label: "⚙️ Backend" },
    { id: "fullstack", label: "🔄 Full Stack" },
    { id: "mobile", label: "📱 Mobile Dev" },
    { id: "ai", label: "🤖 AI/ML" },
    { id: "data", label: "📊 Data Science" },
    { id: "cloud", label: "☁️ Cloud" },
    { id: "devops", label: "🔧 DevOps" },
    { id: "cybersec", label: "🔒 Cybersecurity" },
    { id: "blockchain", label: "⛓️ Blockchain" },
    { id: "gamedev", label: "🎮 Game Dev" },
    { id: "ui-ux", label: "🖌️ UI/UX" },
  ]

  const toggleTag = (tagId: string) => {
    if (selectedTags.includes(tagId)) {
      setSelectedTags(selectedTags.filter((id) => id !== tagId))
    } else {
      setSelectedTags([...selectedTags, tagId])
    }
  }

  // Function to convert tag IDs to readable labels
  const getSelectedTagLabels = () => {
    return selectedTags.map(tagId => {
      const tag = interestTags.find(t => t.id === tagId);
      // Remove emoji from label
      return tag ? tag.label.replace(/^[^\s]+ /, '') : tagId;
    });
  }

  return (
    <div className="w-full flex flex-col items-center space-y-6">
      <h2 className="text-white text-2xl md:text-3xl font-bricolage mb-2 text-center">
        <span className="white-blue-gradient">Drop your vibe</span> ✨
      </h2>
      <p className="text-white/70 text-center mb-4">
        What's your story, <span className="text-blue-400">{username}</span>? Let the world know your energy
      </p>

      <motion.div
        className="w-full max-w-2xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="w-full">
          <PlaceholdersAndVanishInput
            placeholders={placeholders}
            onChange={handleBioChange}
            onSubmit={handleSubmit}
            multiline={true}
            maxLength={maxChars}
          />
        </div>

        {/* Interest tags */}
        <div className="mt-6">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-blue-400" />
            <h3 className="text-white text-sm font-medium">Tap your interests</h3>
          </div>

          <div className="flex flex-wrap gap-2">
            {interestTags.map((tag) => (
              <motion.button
                key={tag.id}
                onClick={() => toggleTag(tag.id)}
                className={`px-3 py-1.5 rounded-full text-sm transition-all duration-300 ${
                  selectedTags.includes(tag.id)
                    ? "bg-gradient-to-r from-blue-500 to-blue-900 text-white"
                    : "bg-white/10 text-white/70 hover:bg-white/20 hover:text-white"
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * Math.random() }}
              >
                {tag.label}
              </motion.button>
            ))}
          </div>
        </div>
      </motion.div>

      <div className="mt-8">
        <HoverBorderGradient
          containerClassName={`rounded-full ${bio.trim().length === 0 ? "opacity-50 cursor-not-allowed" : ""}`}
          as="button"
          className={`dark:bg-black bg-white text-black dark:text-white flex items-center space-x-2 ${
            bio.trim().length === 0 ? "pointer-events-none" : ""
          }`}
          disabled={bio.trim().length === 0}
          onClick={() => bio.trim().length > 0 && onContinue(bio, getSelectedTagLabels())}
        >
          <span>Continue</span>
          <ArrowUpRight className="w-4 h-4 ml-1" />
        </HoverBorderGradient>
      </div>
    </div>
  )
}