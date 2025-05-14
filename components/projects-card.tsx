"use client"

import { useState, useEffect, useCallback } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { FolderGit2, ExternalLink, Github, Star, GitFork, Code, ArrowRight } from "lucide-react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { format } from "date-fns"
import { GitHubConnectModal } from "@/components/github-connect-modal"

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
  const { data: session, status } = useSession()
  const [githubProjects, setGithubProjects] = useState<Project[]>([])
  const [githubConnected, setGithubConnected] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Memoize these functions to prevent unnecessary re-renders
  const checkGitHubConnection = useCallback(async () => {
    if (!session?.user) return;
    
    try {
      setIsLoading(true);
      // Check GitHub connection status via API
      const response = await fetch('/api/github/refresh', {
        // Use no-cache to ensure we get fresh data
        cache: 'no-cache'
      });
      const data = await response.json();
      
      if (data.githubConnected) {
        setGithubConnected(true);
        // If we're connected, fetch repositories
        fetchGitHubRepositories();
      } else {
        setGithubConnected(false);
        setGithubProjects([]);
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Error checking GitHub connection:", error);
      setGithubConnected(false);
      setGithubProjects([]);
      setIsLoading(false);
    }
  }, [session]);

  const fetchGitHubRepositories = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/github/repositories', {
        // Use no-cache to ensure we get fresh data
        cache: 'no-cache'
      });
      const data = await response.json();
      
      if (data.connected && data.repositories) {
        setGithubConnected(true);
        setGithubProjects(data.repositories);
      } else {
        setGithubConnected(false);
        setGithubProjects([]);
      }
    } catch (error) {
      console.error('Error fetching GitHub repositories:', error);
      setGithubProjects([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial check when component mounts or session changes
  useEffect(() => {
    if (isOwnProfile && session?.user) {
      checkGitHubConnection();
    }
  }, [isOwnProfile, session, checkGitHubConnection]);

  // Set up a visibility change listener to refresh data when tab becomes visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && isOwnProfile && session?.user) {
        checkGitHubConnection();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Also refresh when the window gets focus
    window.addEventListener('focus', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleVisibilityChange);
    };
  }, [isOwnProfile, session, checkGitHubConnection]);

  const handleConnectSuccess = async () => {
    // Re-check connection and fetch repositories
    await checkGitHubConnection();
  };

  // GitHub connection message template
  const renderGitHubMessage = () => {
    if (!isOwnProfile) {
      return (
        <div className="text-center text-gray-500 dark:text-gray-400 py-8">
          <p>No projects to display</p>
        </div>
      );
    }

    return (
      <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
        <div className="bg-gray-100 dark:bg-gray-800/50 rounded-full p-4 mb-4">
          <Github className="h-10 w-10 text-gray-500 dark:text-gray-400" />
        </div>
        <h3 className="text-lg font-medium mb-2">Connect Your GitHub</h3>
        <p className="text-gray-500 dark:text-gray-400 text-sm mb-6 max-w-md">
          Link your GitHub account to showcase your public repositories and keep track of your coding projects in one place.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-md mb-6">
          <div className="bg-gray-100 dark:bg-gray-800/50 p-3 rounded-lg flex items-start">
            <Code className="h-5 w-5 text-amber-500 mt-0.5 mr-2 flex-shrink-0" />
            <div className="text-left">
              <h4 className="text-sm font-medium">Showcase Projects</h4>
              <p className="text-xs text-gray-500 dark:text-gray-400">Display your repositories on your profile</p>
            </div>
          </div>
          <div className="bg-gray-100 dark:bg-gray-800/50 p-3 rounded-lg flex items-start">
            <Star className="h-5 w-5 text-amber-500 mt-0.5 mr-2 flex-shrink-0" />
            <div className="text-left">
              <h4 className="text-sm font-medium">Track Stats</h4>
              <p className="text-xs text-gray-500 dark:text-gray-400">View stars, forks, and updates</p>
            </div>
          </div>
        </div>
        <Button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2"
        >
          <Github className="h-4 w-4" />
          Connect GitHub
          <ArrowRight className="h-3.5 w-3.5" />
        </Button>
      </div>
    );
  };

  return (
    <>
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
                onClick={() => setIsModalOpen(true)}
                disabled={isLoading}
              >
                <Github className="h-3.5 w-3.5" />
                Connect GitHub
              </Button>
            )}
            {isOwnProfile && githubConnected && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="flex items-center gap-1 text-xs"
                onClick={fetchGitHubRepositories}
                disabled={isLoading}
              >
                <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M16 12C16 14.2091 14.2091 16 12 16C9.79086 16 8 14.2091 8 12C8 9.79086 9.79086 8 12 8C14.2091 8 16 9.79086 16 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M12 16V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M12 3V8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M16 12H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M3 12H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Refresh
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
              {/* Display GitHub repositories if available, otherwise show GitHub connection message */}
              {githubConnected && githubProjects.length > 0 ? (
                githubProjects.map((project, index) => (
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
                      {project.tags.map((tag, i) => (
                        <Badge key={`${tag}-${i}`} variant="outline" className="bg-gray-200 dark:bg-[#252525] text-xs border-gray-300 dark:border-gray-700 text-gray-800 dark:text-gray-300">
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
              ) : githubConnected && githubProjects.length === 0 ? (
                <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                  <p>No GitHub repositories found</p>
                  <p className="text-sm mt-2">Try creating some public repositories or refreshing</p>
                </div>
              ) : (
                renderGitHubMessage()
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* GitHub Connect Modal */}
      <GitHubConnectModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleConnectSuccess}
      />
    </>
  )
}
