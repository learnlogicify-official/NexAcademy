"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Github, Loader2 } from "lucide-react"

interface GitHubConnectModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

export function GitHubConnectModal({ isOpen, onClose, onSuccess }: GitHubConnectModalProps) {
  const [isConnecting, setIsConnecting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const connectGitHub = async () => {
    try {
      setIsConnecting(true)
      setError(null)
      
      // Instead of using signIn, which changes the session, we'll use a custom API endpoint
      // that just initiates the OAuth flow for connection purposes only
      
      // Create a popup window for GitHub OAuth
      const width = 600
      const height = 700
      const left = window.screenX + (window.innerWidth - width) / 2
      const top = window.screenY + (window.innerHeight - height) / 2
      
      // Store a callback function in window for the popup to call when done
      window.githubOAuthCallback = (success: boolean, error?: string) => {
        if (success) {
          // OAuth was successful
          onSuccess?.()
          onClose()
        } else if (error) {
          // OAuth failed with an error
          setError(error)
        }
        setIsConnecting(false)
      }
      
      // Open the GitHub OAuth popup
      const popup = window.open(
        `/api/github/connect`, 
        'github-oauth', 
        `width=${width},height=${height},left=${left},top=${top}`
      )
      
      // Check if popup was blocked
      if (!popup || popup.closed || typeof popup.closed === 'undefined') {
        setError("Popup blocked by browser. Please allow popups for this site.")
        setIsConnecting(false)
      } else {
        // Set up a check to ensure the popup wasn't closed prematurely
        const checkClosed = setInterval(() => {
          if (popup.closed) {
            clearInterval(checkClosed)
            if (isConnecting) {
              setError("Connection was canceled or interrupted.")
              setIsConnecting(false)
            }
          }
        }, 1000)
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.")
      setIsConnecting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Github className="h-5 w-5" />
            Connect GitHub Account
          </DialogTitle>
          <DialogDescription>
            Link your GitHub account to display your repositories on your profile and enable additional features.
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col items-center py-6 space-y-4">
          <Github className="h-16 w-16 text-black dark:text-white mb-2" />
          <p className="text-center text-sm text-muted-foreground">
            Connecting your GitHub account will allow us to:
          </p>
          <ul className="text-sm text-left space-y-2 w-full">
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>Display your public repositories on your profile</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>Show your GitHub username in your contact info</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>Access your basic GitHub info (name, email, avatar)</span>
            </li>
          </ul>
          
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md text-red-600 dark:text-red-400 text-sm w-full">
              {error}
            </div>
          )}
        </div>
        
        <DialogFooter className="flex flex-col sm:flex-row sm:justify-between gap-3">
          <Button variant="outline" onClick={onClose} disabled={isConnecting}>
            Cancel
          </Button>
          <Button 
            onClick={connectGitHub} 
            disabled={isConnecting}
            className="flex items-center gap-2"
          >
            {isConnecting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Github className="h-4 w-4" />
            )}
            {isConnecting ? "Connecting..." : "Connect GitHub Account"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 