"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PhoneCall, Mail, Copy, CheckCircle, Github, Linkedin, Twitter, Globe, RefreshCw } from "lucide-react"
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
  const [isCheckingConnection, setIsCheckingConnection] = useState(false)

  const checkGitHubConnection = useCallback(async () => {
    if (!isOwnProfile || !session?.user) return;
    
    try {
      setIsCheckingConnection(true);
      const response = await fetch('/api/github/refresh', {
        cache: 'no-cache' // Ensure we get fresh data
      });
      const data = await response.json();
      
      if (data.githubConnected && data.githubUsername) {
        setGithubUsername(data.githubUsername);
        setHasGitHubConnected(true);
      } else {
        setHasGitHubConnected(false);
        setGithubUsername(null);
      }
    } catch (error) {
      console.error('Error checking GitHub connection:', error);
      setHasGitHubConnected(false);
    } finally {
      setIsCheckingConnection(false);
    }
  }, [isOwnProfile, session]);

  // Effect to update links when GitHub username changes
  useEffect(() => {
    if (githubUsername) {
      // Create a copy of initialLinks
      const updatedLinks = [...initialLinks];
      
      // Remove any existing GitHub link
      const filteredLinks = updatedLinks.filter(link => link.type !== 'github');
      
      // Create the GitHub link
      const githubLink = {
        type: "github",
        username: githubUsername,
        url: `https://github.com/${githubUsername}`,
        icon: <Github className="h-4 w-4 text-purple-500" />
      };
      
      // Add GitHub as the first link
      filteredLinks.unshift(githubLink);
      setLinks(filteredLinks);
    } else {
      // If no GitHub username, filter out any GitHub links
      setLinks(initialLinks.filter(link => link.type !== 'github'));
    }
  }, [githubUsername, initialLinks]);

  // Initial check when component mounts
  useEffect(() => {
    checkGitHubConnection();
  }, [checkGitHubConnection]);

  // Effect to refresh when the page becomes visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        checkGitHubConnection();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Clean up event listener
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [checkGitHubConnection]);

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(type);
      setTimeout(() => setCopied(null), 2000);
    });
  };

  const handleGitHubConnectSuccess = async () => {
    await checkGitHubConnection();
  };

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
                disabled={isCheckingConnection}
              >
                <Github className="h-3.5 w-3.5" />
                Connect GitHub
              </button>
            )}
            {isOwnProfile && hasGitHubConnected && (
              <div className="text-xs text-green-500 flex items-center gap-1">
                <span className="inline-block h-2 w-2 rounded-full bg-green-500"></span>
                GitHub Connected
              </div>
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
