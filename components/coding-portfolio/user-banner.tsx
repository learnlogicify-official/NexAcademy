"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { RefreshCw, Loader2, ExternalLink, Share2, User, CheckCircle } from "lucide-react"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { useSession } from "next-auth/react"
import { Skeleton } from "@/components/ui/skeleton"
import { Session } from "next-auth"
import { RefreshNotification } from "@/components/notifications/refresh-notification"

export default function UserBanner({ session: serverSession }: { session?: Session }) {
  const { toast } = useToast()
  const [refreshing, setRefreshing] = useState(false)
  const { data: clientSession, status } = useSession();
  const session = serverSession ?? clientSession;
  
  // State for refresh notification
  const [showRefreshNotification, setShowRefreshNotification] = useState(false);
  const [refreshResult, setRefreshResult] = useState({
    message: "",
    successful: 0,
    failed: 0
  });

  if (!session) {
    // Show skeleton only if session is not available
    return (
      <Card className="overflow-hidden border-0 shadow-lg">
        <div className="relative bg-gradient-to-r from-blue-600 to-blue-800 p-8 md:p-10">
          <div className="flex gap-6 items-center">
            <Skeleton className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-blue-200/30" />
            <div className="flex-1 space-y-3">
              <Skeleton className="h-8 w-40 bg-blue-200/30" />
              <Skeleton className="h-4 w-32 bg-blue-200/20" />
              <Skeleton className="h-4 w-24 bg-blue-200/10" />
            </div>
          </div>
        </div>
      </Card>
    );
  }

  const refreshData = async () => {
    setRefreshing(true)
    try {
      // Make a real API call to refresh data from all connected platforms
      const response = await fetch("/api/coding-portfolio/refresh", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to refresh data");
      }

      const result = await response.json();
      
      // Set notification data and show it
      setRefreshResult({
        message: result.message || "Platform data updated successfully",
        successful: result.successful || 0,
        failed: result.failed || 0
      });
      setShowRefreshNotification(true);
      
      // Still keep toast for accessibility, but make it simpler
      toast({
        title: "Success",
        description: "Data refresh complete",
      });
    } catch (error) {
      console.error("Error refreshing data:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to refresh your coding data",
        variant: "destructive",
      })
    } finally {
      setRefreshing(false)
    }
  }

  return (
    <>
      <Card className="overflow-hidden border-0 shadow-lg">
        {/* Blue gradient banner */}
        <div className="relative bg-gradient-to-r from-blue-600 to-blue-800 p-8 md:p-10">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-64 h-32 bg-blue-400/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4" />

          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-6">
            {/* User avatar */}
            <div className="flex-shrink-0">
              <div className="relative">
                <Avatar className="w-20 h-20 md:w-24 md:h-24 border-4 border-white/20 shadow-xl">
                  <AvatarImage src={session.user?.profilePic || session.user?.image || "/default-avatar.png"} alt={session.user?.name || "User"} />
                  <AvatarFallback className="bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900 dark:to-blue-800 text-blue-600 dark:text-blue-400">
                    <User className="w-10 h-10" />
                  </AvatarFallback>
                </Avatar>
                
              </div>
            </div>

            {/* User info and actions */}
            <div className="flex-1">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-white">{session.user?.name || "User"}</h1>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 mt-1">
                    <p className="text-blue-100 text-sm md:text-base">@{session.user?.username || session.user?.email?.split("@")[0] || "user"}</p>
                    
                    <p className="text-blue-200 text-xs md:text-sm">{(session.user as any)?.title || ""}</p>
                  </div>
                  {session.user?.bio ? (
                    <p className="text-blue-100 mt-2 text-sm max-w-md">{session.user.bio}</p>
                  ) : (
                    <p className="text-blue-100/60 mt-2 text-sm max-w-md">No bio available</p>
                  )}
                </div>

                {/* Action buttons */}
                <div className="flex flex-wrap gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={refreshData}
                    disabled={refreshing}
                    className="bg-white/10 hover:bg-white/20 text-white border-white/20 hover:border-white/30"
                  >
                    {refreshing ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <RefreshCw className="h-4 w-4 mr-2" />
                    )}
                    Refresh Data
                  </Button>
                  <Link href="/coding-portfolio/connect">
                    <Button variant="secondary" size="sm" className="bg-white hover:bg-blue-50 text-blue-700">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Manage Connections
                    </Button>
                  </Link>
                  <Button variant="ghost" size="sm" className="text-white hover:bg-white/10 border border-white/10">
                    <Share2 className="h-4 w-4 mr-2" />
                    Share
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Connected platforms strip */}
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 py-4 px-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          
          <div className="flex items-center gap-4 justify-end w-full">
            <div className="text-sm text-blue-600 dark:text-blue-400">
              <span className="text-xs text-blue-500 dark:text-blue-400">Member since:</span>{" "}
              <span className="font-medium">{(session.user as any)?.joinDate || ""}</span>
            </div>
            <div className="text-sm text-blue-600 dark:text-blue-400">
              <span className="text-xs text-blue-500 dark:text-blue-400">Last updated:</span>{" "}
              <span className="font-medium">Today, 10:45 AM</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Refresh Notification */}
      <RefreshNotification
        message={refreshResult.message}
        successful={refreshResult.successful}
        failed={refreshResult.failed}
        isVisible={showRefreshNotification}
        onClose={() => setShowRefreshNotification(false)}
      />
    </>
  )
}
