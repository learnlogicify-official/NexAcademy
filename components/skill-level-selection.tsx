"use client"
import { useState } from "react"
import { Check } from "lucide-react"
import { HoverBorderGradient } from "@/components/ui/hover-border-gradient"
import { motion } from "framer-motion"

interface SkillLevelSelectionProps {
  username: string
  selectedPath: string
  onSelectLevel: (level: string) => void
}

interface SkillLevel {
  id: string
  title: string
  color: string
  borderColor: string
  shadowColor: string
  imageSrc: string
  imageWidth: number
  imageHeight: number
  imageBottom: number
  imageRight: number
}

export default function SkillLevelSelection({ username, selectedPath, onSelectLevel }: SkillLevelSelectionProps) {
  const [selectedLevelId, setSelectedLevelId] = useState<string | null>(null)

  const skillLevels: SkillLevel[] = [
    {
      id: "beginner",
      title: "Beginner",
      color: "#4ade80", // Green
      borderColor: "rgba(74, 222, 128, 0.8)",
      shadowColor: "rgba(74, 222, 128, 0.6)",
      imageSrc: "/images/beginner-character.png",
      imageWidth: 420,
      imageHeight: 420,
      imageBottom: -80,
      imageRight: -90,
    },
    {
      id: "intermediate",
      title: "Intermediate",
      color: "#60a5fa", // Blue
      borderColor: "rgba(96, 165, 250, 0.8)",
      shadowColor: "rgba(96, 165, 250, 0.6)",
      imageSrc: "/images/intermediate-character.png",
      imageWidth: 430,
      imageHeight: 430,
      imageBottom: -80,
      imageRight: -120,
    },
    {
      id: "legend",
      title: "Legend",
      color: "#f87171", // Red
      borderColor: "rgba(248, 113, 113, 0.8)",
      shadowColor: "rgba(248, 113, 113, 0.6)",
      imageSrc: "/images/legend-character.png",
      imageWidth: 400,
      imageHeight: 400,
      imageBottom: -50,
      imageRight: -100,
    },
  ]

  const handleLevelSelect = (levelId: string) => {
    setSelectedLevelId(levelId)
  }

  const handleContinue = () => {
    if (selectedLevelId) {
      const selectedLevel = skillLevels.find((level) => level.id === selectedLevelId)
      if (selectedLevel) {
        onSelectLevel(selectedLevel.title)
      }
    }
  }

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  }

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
  }

  const imageVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.7,
        ease: "easeOut",
        delay: 0.3,
      },
    },
  }

  const textVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut",
        delay: 0.5,
      },
    },
  }

  return (
    <div className="w-full flex flex-col items-center space-y-6">
      <h2 className="text-white text-2xl md:text-3xl font-bricolage mb-2 text-center">
        Where do you stand in your journey?
      </h2>
      <p className="text-white/70 text-center mb-4">
        Select your experience level in <span className="text-blue-400">{selectedPath}</span>
      </p>

      <motion.div
        className="flex flex-wrap justify-center gap-6 w-full max-w-5xl"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {skillLevels.map((level, index) => (
          <motion.div
            key={level.id}
            onClick={() => handleLevelSelect(level.id)}
            className={`relative cursor-pointer transition-all duration-300 hover:scale-105 group`}
            style={{
              transition: "transform 0.3s ease, filter 0.3s ease",
            }}
            variants={cardVariants}
            custom={index}
          >
            {/* Colored shadow that appears on hover - positioned behind the card */}
            <div
              className="absolute rounded-2xl opacity-0 group-hover:opacity-70 transition-opacity duration-300 blur-xl"
              style={{
                background: `${level.color}30`,
                inset: "-15px",
                zIndex: -1,
                filter: "blur(25px)",
              }}
            />

            {/* Card container with glowing border */}
            <div
              className="relative rounded-2xl overflow-hidden"
              style={{
                width: "280px",
                height: "380px",
                boxShadow: selectedLevelId === level.id ? `0 0 20px 2px ${level.shadowColor}` : "none",
                transition: "box-shadow 0.3s ease",
              }}
            >
              {/* Glowing border */}
              <div
                className="absolute inset-0 rounded-2xl z-10"
                style={{
                  border: `2px solid ${level.borderColor}`,
                  boxShadow: `inset 0 0 10px ${level.shadowColor}`,
                  opacity: selectedLevelId === level.id ? 1 : 0.7,
                  transition: "opacity 0.3s ease",
                }}
              ></div>

              {/* Background gradient similar to learning path cards */}
              <div className="absolute inset-0 z-0">
                {level.id === "beginner" && (
                  <div className="absolute inset-0 bg-gradient-to-b from-black via-black to-[#052d1b]/70"></div>
                )}
                {level.id === "intermediate" && (
                  <div className="absolute inset-0 bg-gradient-to-b from-black via-black to-[#051d3b]/70"></div>
                )}
                {level.id === "legend" && (
                  <div className="absolute inset-0 bg-gradient-to-b from-black via-black to-[#3d0f0f]/70"></div>
                )}
              </div>

              {/* Character image */}
              <motion.div
                className="absolute z-5"
                style={{
                  bottom: `${level.imageBottom}px`,
                  right: `${level.imageRight}px`,
                  width: `${level.imageWidth}px`,
                  height: `${level.imageHeight}px`,
                }}
                variants={imageVariants}
              >
                <img
                  src={level.imageSrc || "/placeholder.svg"}
                  alt={level.title}
                  className="w-full h-full object-contain"
                />
              </motion.div>

              {/* Selection indicator */}
              <div className="absolute top-3 left-3 z-30">
                {selectedLevelId === level.id ? (
                  <div className="rounded-full p-1 border-2 border-black" style={{ backgroundColor: level.color }}>
                    <Check className="w-4 h-4 text-black" />
                  </div>
                ) : (
                  <div
                    className="w-6 h-6 rounded-full border-2 border-black/60 bg-transparent"
                    style={{ borderColor: `${level.color}50` }}
                  ></div>
                )}
              </div>

              {/* Title - positioned at bottom left with gradient */}
              <motion.div className="absolute bottom-6 left-6 z-30 text-left" variants={textVariants}>
                <h3
                  className="text-2xl font-bricolage"
                  style={{
                    background: `linear-gradient(to right, #ffffff, ${level.color})`,
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                    color: "transparent",
                  }}
                >
                  {level.title}
                </h3>
              </motion.div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      <div className="mt-8">
        <HoverBorderGradient
          containerClassName={`rounded-full ${!selectedLevelId ? "opacity-50 cursor-not-allowed" : ""}`}
          as="button"
          className={`dark:bg-black bg-white text-black dark:text-white flex items-center space-x-2 ${
            !selectedLevelId ? "pointer-events-none" : ""
          }`}
          disabled={!selectedLevelId}
          onClick={handleContinue}
        >
          <span>Continue</span>
        </HoverBorderGradient>
      </div>
    </div>
  )
}