"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PhoneCall, Mail, Copy, CheckCircle, Github, Linkedin, Twitter, Globe } from "lucide-react"
import { useSession } from "next-auth/react"
import { GitHubConnectModal } from "@/components/github-connect-modal"

interface ContactLink {
  type: string
  username: string
  url: string
  icon: React.ReactNode
}

interface ContactLinksCardProps {
  links: ContactLink[]
  email?: string
  className?: string
  isOwnProfile?: boolean
}

export function ContactLinksCard({ links: initialLinks, email, className, isOwnProfile = false }: ContactLinksCardProps) {
  const { data: session, status } = useSession()
  const [copied, setCopied] = useState<string | null>(null)
  const [isGitHubModalOpen, setIsGitHubModalOpen] = useState(false)
  const [links, setLinks] = useState<ContactLink[]>(initialLinks)
  const [githubUsername, setGithubUsername] = useState<string | null | undefined>(session?.user?.githubUsername)
  const [hasGitHubConnected, setHasGitHubConnected] = useState<boolean>(!!session?.user?.githubUsername)

  // Effect to update links when GitHub username changes
  useEffect(() => {
    if (githubUsername && !links.some(link => link.type === 'github')) {
      const updatedLinks = [...initialLinks]
      const githubLink = {
        type: "github",
        username: githubUsername,
        url: `https://github.com/${githubUsername}`,
        icon: <Github className="h-4 w-4 text-purple-500" />
      }
      
      // Add GitHub as the first link
      updatedLinks.unshift(githubLink)
      setLinks(updatedLinks)
    }
  }, [githubUsername, initialLinks])

  // Effect to update from session
  useEffect(() => {
    if (session?.user?.githubUsername) {
      setGithubUsername(session.user.githubUsername)
      setHasGitHubConnected(true)
    }
  }, [session])

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(type)
      setTimeout(() => setCopied(null), 2000)
    })
  }

  const handleGitHubConnectSuccess = async () => {
    try {
      // Fetch updated GitHub connection status
      const response = await fetch('/api/github/refresh')
      const data = await response.json()
      
      if (data.githubConnected && data.githubUsername) {
        setGithubUsername(data.githubUsername)
        setHasGitHubConnected(true)
      }
    } catch (error) {
      console.error('Error refreshing GitHub connection:', error)
    }
  }

  return (
    <>
      <Card className={`bg-white dark:bg-[#18181b] border-0 shadow-md h-full ${className ?? ''}`}>
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <PhoneCall className="h-5 w-5 text-purple-500" />
              Contact
            </CardTitle>
            {isOwnProfile && !hasGitHubConnected && (
              <button 
                onClick={() => setIsGitHubModalOpen(true)}
                className="text-xs text-purple-500 hover:text-purple-600 dark:hover:text-purple-400 flex items-center gap-1"
              >
                <Github className="h-3.5 w-3.5" />
                Connect GitHub
              </button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {links.map((link, index) => (
              <div
                key={index}
                className="flex items-center justify-between bg-gray-100 dark:bg-[#1a1a1a] rounded-lg p-3"
              >
                <div className="flex items-center gap-2">
                  {link.icon}
                  <div>
                    <div className="text-sm font-medium">{link.type}</div>
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-gray-500 dark:text-gray-400 hover:text-purple-500 dark:hover:text-purple-400 transition-colors"
                    >
                      {link.username}
                    </a>
                  </div>
                </div>
                <button
                  onClick={() => copyToClipboard(link.username, link.type)}
                  className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
                >
                  {copied === link.type ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </button>
              </div>
            ))}

            {email && (
              <div className="flex items-center justify-between bg-gray-100 dark:bg-[#1a1a1a] rounded-lg p-3">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-purple-500" />
                  <div>
                    <div className="text-sm font-medium">Email</div>
                    <a
                      href={`mailto:${email}`}
                      className="text-xs text-gray-500 dark:text-gray-400 hover:text-purple-500 dark:hover:text-purple-400 transition-colors"
                    >
                      {email}
                    </a>
                  </div>
                </div>
                <button
                  onClick={() => copyToClipboard(email, "email")}
                  className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
                >
                  {copied === "email" ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* GitHub Connect Modal */}
      <GitHubConnectModal
        isOpen={isGitHubModalOpen}
        onClose={() => setIsGitHubModalOpen(false)}
        onSuccess={handleGitHubConnectSuccess}
      />
    </>
  )
}
