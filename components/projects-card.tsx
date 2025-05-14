"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { FolderGit2, ExternalLink, Github, Star, GitFork } from "lucide-react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { format } from "date-fns"

interface Project {
  name: string
  description: string
  tags: string[]
  repoUrl?: string
  liveUrl?: string
  imageUrl?: string
  updatedAt?: string
  stars?: number
  forks?: number
}

interface ProjectsCardProps {
  projects: Project[]
  className?: string
  isOwnProfile?: boolean
}

export function ProjectsCard({ projects: initialProjects, className, isOwnProfile = false }: ProjectsCardProps) {
  const { data: session } = useSession()
  const [projects, setProjects] = useState<Project[]>(initialProjects)
  const [githubConnected, setGithubConnected] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    // Only fetch GitHub repos if it's the user's own profile and they're authenticated
    if (isOwnProfile && session?.user) {
      fetchGitHubRepositories()
    }
  }, [isOwnProfile, session])

  const fetchGitHubRepositories = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/github/repositories')
      const data = await response.json()
      
      if (data.connected) {
        setGithubConnected(true)
        // Combine GitHub repos with existing projects
        setProjects([...data.repositories, ...initialProjects])
      } else {
        setGithubConnected(false)
      }
    } catch (error) {
      console.error('Error fetching GitHub repositories:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const connectGitHub = () => {
    // Redirect to GitHub OAuth
    window.location.href = '/api/auth/signin?callbackUrl=/profile&prompt=consent&type=github'
  }

  return (
    <Card className={`bg-white dark:bg-[#18181b] border-0 shadow-md h-full ${className ?? ''}`}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <FolderGit2 className="h-5 w-5 text-amber-500" />
            Projects
          </CardTitle>
          {isOwnProfile && !githubConnected && (
            <Button 
              variant="outline" 
              size="sm" 
              className="flex items-center gap-1 text-xs"
              onClick={connectGitHub}
              disabled={isLoading}
            >
              <Github className="h-3.5 w-3.5" />
              Connect GitHub
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="overflow-auto max-h-[290px] custom-scrollbar">
        {isLoading ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-amber-500"></div>
          </div>
        ) : (
          <div className="space-y-4">
            {projects.length > 0 ? (
              projects.map((project, index) => (
                <motion.div
                  key={`${project.name}-${index}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="bg-gray-100 dark:bg-[#1a1a1a] rounded-lg p-4 space-y-3"
                >
                  <div className="flex justify-between items-start">
                    <h3 className="font-medium text-gray-900 dark:text-gray-200">{project.name}</h3>
                    <div className="flex gap-2">
                      {project.repoUrl && (
                        <a
                          href={project.repoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
                        >
                          <Github className="h-4 w-4" />
                        </a>
                      )}
                      {project.liveUrl && (
                        <a
                          href={project.liveUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-400">{project.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {project.tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="bg-gray-200 dark:bg-[#252525] text-xs border-gray-300 dark:border-gray-700 text-gray-800 dark:text-gray-300">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  {project.updatedAt && (
                    <div className="flex justify-between items-center text-xs text-gray-600 dark:text-gray-500 mt-2 pt-2 border-t border-gray-200 dark:border-gray-800">
                      <span>Updated {format(new Date(project.updatedAt), 'MMM d, yyyy')}</span>
                      <div className="flex items-center gap-3">
                        {project.stars !== undefined && (
                          <div className="flex items-center gap-1">
                            <Star className="h-3.5 w-3.5" />
                            {project.stars}
                          </div>
                        )}
                        {project.forks !== undefined && (
                          <div className="flex items-center gap-1">
                            <GitFork className="h-3.5 w-3.5" />
                            {project.forks}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </motion.div>
              ))
            ) : (
              <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                {isOwnProfile && !githubConnected ? (
                  <div className="space-y-2">
                    <p>Connect your GitHub account to showcase your repositories here</p>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={connectGitHub}
                    >
                      <Github className="h-3.5 w-3.5 mr-2" />
                      Connect GitHub
                    </Button>
                  </div>
                ) : (
                  <p>No projects to display</p>
                )}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
