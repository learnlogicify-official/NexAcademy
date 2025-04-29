"use client"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { BookOpen, ClipboardCheck, Code, Video } from "lucide-react"
import { motion } from "framer-motion"

interface ModuleCardProps {
  module: {
    id: string
    title: string
    description: string
    order: number
    status: string
    level: string
  }
  onClick: (moduleId: string) => void
}

export function ModuleCard({ module, onClick }: ModuleCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completed":
        return "bg-green-500"
      case "In Progress":
        return "bg-blue-500"
      case "Locked":
        return "bg-gray-500"
      default:
        return "bg-gray-500"
    }
  }

  const getProgressValue = (status: string) => {
    switch (status) {
      case "Completed":
        return 100
      case "In Progress":
        return 50
      case "Locked":
        return 0
    }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <Card
        className={`flex flex-col h-full justify-between overflow-hidden border-0 shadow-md bg-[#121212] hover:bg-[#1a1a1a] transition-all ${
          module.status === "Locked" ? "opacity-60" : "cursor-pointer"
        }`}
        onClick={() => module.status !== "Locked" && onClick(module.id)}
      >
        <CardContent className="p-0 flex flex-col h-full justify-between">
          <div className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <Badge className="mb-2 bg-blue-500/20 text-blue-400 border-blue-500/30">Module {module.order}</Badge>
                <h3 className="text-xl font-semibold">{module.title}</h3>
              </div>
              <div className={`w-3 h-3 rounded-full ${getStatusColor(module.status)}`}></div>
            </div>

            <p className="text-gray-400 text-sm mb-4">{module.description}</p>

            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-gray-400">Progress</span>
              <span className="text-gray-300">{getProgressValue(module.status)}%</span>
            </div>
            <Progress value={getProgressValue(module.status)} className="h-1.5" />

            <div className="mt-4 flex flex-wrap gap-2">
              <div className="flex items-center gap-1 text-xs bg-gray-800 px-2 py-1 rounded">
                <Video className="h-3 w-3 text-blue-400" />
                <span>1 Video</span>
              </div>
              <div className="flex items-center gap-1 text-xs bg-gray-800 px-2 py-1 rounded">
                <BookOpen className="h-3 w-3 text-green-400" />
                <span>1 Lesson</span>
              </div>
              <div className="flex items-center gap-1 text-xs bg-gray-800 px-2 py-1 rounded">
                <Code className="h-3 w-3 text-amber-400" />
                <span>30 Problems</span>
              </div>
              <div className="flex items-center gap-1 text-xs bg-gray-800 px-2 py-1 rounded">
                <ClipboardCheck className="h-3 w-3 text-purple-400" />
                <span>1 Quiz</span>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-700/20 p-4 bg-[#0a0a0a] flex justify-between items-center">
            <span className="text-sm text-gray-400">
              {module.status === "Locked"
                ? "Complete previous module to unlock"
                : module.status === "Completed"
                  ? "Module completed"
                  : "Continue learning"}
            </span>
            <Badge
              className={`${
                module.status === "Completed"
                  ? "bg-green-500/20 text-green-400 border-green-500/30"
                  : module.status === "In Progress"
                    ? "bg-blue-500/20 text-blue-400 border-blue-500/30"
                    : "bg-gray-500/20 text-gray-400 border-gray-500/30"
              }`}
            >
              {module.status}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
