"use client"
import { useState } from "react"
import { Check } from "lucide-react"
import { HoverBorderGradient } from "@/components/ui/hover-border-gradient"

interface LearningPathSelectionProps {
  username: string
  onSelectPath: (path: string) => void
}

interface PathOption {
  id: string
  title: string
  iconSettings: {
    bottomPx: number
    rightPx: number
    width: number
    height: number
  }
}

export default function LearningPathSelection({ username, onSelectPath }: LearningPathSelectionProps) {
  const [selectedPathId, setSelectedPathId] = useState<string | null>(null)

  const pathOptions: PathOption[] = [
    {
      id: "web-app",
      title: "Web & App Development",
      iconSettings: {
        bottomPx: -60,
        rightPx: -60,
        width: 180,
        height: 180,
      },
    },
    {
      id: "ai-ml",
      title: "AI & Machine Learning",
      iconSettings: {
        bottomPx: -60,
        rightPx: -50,
        width: 160,
        height: 160,
      },
    },
    {
      id: "design",
      title: "UI/UX",
      iconSettings: {
        bottomPx: -10,
        rightPx: -10,
        width: 140,
        height: 140,
      },
    },
    {
      id: "dsa",
      title: "Data Structures & Algorithms",
      iconSettings: {
        bottomPx: -30,
        rightPx: -40,
        width: 150,
        height: 150,
      },
    },
    {
      id: "cs",
      title: "Core Computer Science",
      iconSettings: {
        bottomPx: -50,
        rightPx: -50,
        width: 150,
        height: 150,
      },
    },
    {
      id: "devops",
      title: "DevOps & Cloud Engineering",
      iconSettings: {
        bottomPx: -30,
        rightPx: -20,
        width: 140,
        height: 140,
      },
    },
  ]

  const handlePathSelect = (pathId: string) => {
    setSelectedPathId(pathId)
  }

  const handleContinue = () => {
    if (selectedPathId) {
      const selectedPath = pathOptions.find((path) => path.id === selectedPathId)
      if (selectedPath) {
        onSelectPath(selectedPath.title)
      }
    }
  }

  // Function to get the appropriate icon based on path ID
  const getIconForPath = (pathId: string) => {
    switch (pathId) {
      case "ai-ml":
        return "/images/sparkle-icon.svg"
      case "design":
        return "/images/pen-tool-icon.svg"
      case "dsa":
        return "/images/data-structures-new-icon.svg"
      case "devops":
        return "/images/devops-cloud-icon.svg"
      case "cs":
        return "/images/core-cs-globe-icon.svg"
      default:
        return "/images/react-native-logo.svg"
    }
  }

  return (
    <div className="w-full flex flex-col items-center space-y-6 py-8">
      <h2 className="text-white text-2xl md:text-3xl font-bricolage mb-2 text-center">
        Choose your learning path, <span className="text-blue-400">{username}</span>
      </h2>
      <p className="text-white/70 text-center mb-4">Select the area you want to focus on in your learning journey</p>

      <div className="grid overflow-visible grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 justify-center px-4 py-2">
        {pathOptions.map((path) => (
          <div
            key={path.id}
            className={`relative overflow-hidden rounded-xl cursor-pointer h-[140px] w-[280px] border border-[#0B0042]/40 
              ${
                selectedPathId === path.id
                  ? "ring-2 ring-blue-500 ring-offset-2 ring-offset-black shadow-[0_4px_24px_rgba(59,130,246,0.6)]"
                  : "shadow-[0_4px_16px_rgba(30,64,175,0.2)] hover:shadow-[0_6px_20px_rgba(30,64,175,0.3)]"
              }
              group transition-all duration-300 hover:scale-105`}
            onClick={() => handlePathSelect(path.id)}
          >
            <div className="absolute inset-0 bg-gradient-to-b from-black via-black to-[#051d3b]/70 rounded-xl z-0"></div>

            {/* Selection indicator in top-left */}
            <div className="absolute top-3 left-3 z-10">
              {selectedPathId === path.id ? (
                <div className="bg-blue-600 rounded-full p-1 border-2 border-black">
                  <Check className="w-4 h-4 text-white" />
                </div>
              ) : (
                <div className="w-6 h-6 rounded-full border-2 border-[#0B0042]/60 bg-transparent"></div>
              )}
            </div>

            <div className="relative z-10 p-4 h-full flex flex-col justify-end">
              <h3 className="text-white text-lg font-medium text-left w-[150px] break-words">{path.title}</h3>
            </div>

            {/* Icon based on path ID with custom positioning and sizing */}
            <div
              className="absolute z-10 transition-transform duration-300 group-hover:scale-90"
              style={{
                bottom: `${path.iconSettings.bottomPx}px`,
                right: `${path.iconSettings.rightPx}px`,
                width: `${path.iconSettings.width}px`,
                height: `${path.iconSettings.height}px`,
              }}
            >
              <img src={getIconForPath(path.id) || "/placeholder.svg"} alt={path.title} className="w-full h-full" />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 pb-4">
        <HoverBorderGradient
          containerClassName={`rounded-full ${!selectedPathId ? "opacity-50 cursor-not-allowed" : ""}`}
          as="button"
          className={`dark:bg-black bg-white text-black dark:text-white flex items-center space-x-2 ${
            !selectedPathId ? "pointer-events-none" : ""
          }`}
          disabled={!selectedPathId}
          onClick={handleContinue}
        >
          <span>Continue</span>
        </HoverBorderGradient>
      </div>
    </div>
  )
}