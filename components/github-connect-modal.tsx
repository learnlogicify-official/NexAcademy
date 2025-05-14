"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
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

  const connectGitHub = async () => {
    try {
      setIsConnecting(true)
      setError(null)
      
      // Use signIn with redirect: false to get the result
      const result = await signIn("github", {
        redirect: false,
        callbackUrl: window.location.href
      })
      
      if (result?.error) {
        setError(result.error)
        return
      }
      
      // If successful, check connection status
      if (result?.ok) {
        // Check GitHub connection status via API
        await checkGitHubConnection()
      }
      
      // Close the modal regardless
      onClose()
    } catch (err) {
      setError("An unexpected error occurred. Please try again.")
    } finally {
      setIsConnecting(false)
    }
  }

  const checkGitHubConnection = async () => {
    try {
      // Small delay to ensure the GitHub connection has been processed
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Call the refresh endpoint to check connection status
      const response = await fetch('/api/github/refresh')
      const data = await response.json()
      
      if (data.githubConnected) {
        // Connection was successful
        onSuccess?.()
      }
    } catch (error) {
      console.error("Error checking GitHub connection:", error)
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