"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { FolderGit2, ExternalLink, Github } from "lucide-react"

interface Project {
  name: string
  description: string
  tags: string[]
  repoUrl?: string
  liveUrl?: string
  imageUrl?: string
}

interface ProjectsCardProps {
  projects: Project[]
  className?: string
}

export function ProjectsCard({ projects, className }: ProjectsCardProps) {
  return (
    <Card className={`bg-[#121212] border-0 shadow-md h-[360px] overflow-hidden ${className}`}>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg text-gray-100 flex items-center gap-2">
          <FolderGit2 className="h-5 w-5 text-amber-500" />
          Projects
        </CardTitle>
      </CardHeader>
      <CardContent className="overflow-auto max-h-[290px] custom-scrollbar">
        <div className="space-y-4">
          {projects.map((project, index) => (
            <motion.div
              key={project.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="bg-[#1a1a1a] rounded-lg p-4 space-y-3"
            >
              <div className="flex justify-between items-start">
                <h3 className="font-medium text-gray-200">{project.name}</h3>
                <div className="flex gap-2">
                  {project.repoUrl && (
                    <a
                      href={project.repoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-400 hover:text-gray-200 transition-colors"
                    >
                      <Github className="h-4 w-4" />
                    </a>
                  )}
                  {project.liveUrl && (
                    <a
                      href={project.liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-400 hover:text-gray-200 transition-colors"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  )}
                </div>
              </div>
              <p className="text-sm text-gray-400">{project.description}</p>
              <div className="flex flex-wrap gap-2">
                {project.tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="bg-[#252525] text-xs border-gray-700 text-gray-300">
                    {tag}
                  </Badge>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
