"use client"

import { CheckCircle, ExternalLink, Plus } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { PlatformData } from "@/lib/platform-service"

interface ConnectedPlatformsProps {
  platforms?: PlatformData[]
}

export function ConnectedPlatforms({ platforms = [] }: ConnectedPlatformsProps) {
  // Count connected platforms
  const connectedCount = platforms.filter((p) => p.connected).length
  const totalPlatforms = platforms.length

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500/10 to-blue-600/20 dark:from-blue-500/20 dark:to-blue-600/30 border border-blue-100 dark:border-blue-800/50 shadow-sm">
            <img 
              src="/images/connected-platforms.svg" 
              alt="Connected Platforms" 
              className="h-4.5 w-4.5"
            />
          </div>
          <h2 className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-blue-500 dark:from-blue-400 dark:to-blue-300">
            Connected Platforms
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-sm text-slate-600 dark:text-slate-400">
            <span className="font-medium text-blue-600 dark:text-blue-400">{connectedCount}</span> of {totalPlatforms}{" "}
            connected
          </div>
          <Link href="/nexPortfolio/connect">
            <Button
              variant="outline"
              size="sm"
              className="border-blue-200 dark:border-blue-800 hover:border-blue-300 dark:hover:border-blue-700"
            >
              Manage Connections
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 gap-2">
        {platforms.map((platform) => (
          <div
            key={platform.id}
            className={`group relative overflow-hidden rounded-lg border transition-all duration-300 ${
              platform.connected
                ? "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-700 shadow-sm hover:shadow-md"
                : "bg-slate-100/80 dark:bg-slate-800/30 border-slate-200/80 dark:border-slate-700/50"
            }`}
          >
            {/* Platform color accent */}
            {platform.connected && (
              <div
                className="absolute top-0 left-0 right-0 h-1 opacity-80"
                style={{ backgroundColor: platform.color }}
              />
            )}

            <div className="p-3">
              <div className="flex items-center gap-2">
                {/* Platform icon */}
                <div className="relative flex-shrink-0">
                  <div
                    className={`w-7 h-7 rounded-md flex items-center justify-center ${
                      platform.connected
                        ? "bg-white dark:bg-slate-700 shadow-sm"
                        : "bg-slate-200/50 dark:bg-slate-700/50"
                    }`}
                  >
                    <img
                      src={platform.icon || "/placeholder.svg"}
                      alt={platform.name}
                      className={`w-4.5 h-4.5 object-contain transition-all duration-300 group-hover:scale-110 ${
                        platform.connected ? "" : "opacity-50"
                      }`}
                    />
                  </div>

                  {/* Connection indicator */}
                  {platform.connected ? (
                    <div className="absolute -bottom-0.5 -right-0.5 bg-emerald-500 text-white text-[8px] p-0.5 rounded-full shadow-sm">
                      <CheckCircle className="h-2 w-2" />
                    </div>
                  ) : (
                    <div className="absolute -bottom-0.5 -right-0.5 bg-slate-300 dark:bg-slate-600 text-white text-[8px] p-0.5 rounded-full">
                      <Plus className="h-2 w-2" />
                    </div>
                  )}
                </div>

                {/* Platform info */}
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-xs text-slate-900 dark:text-slate-200 truncate">{platform.name}</div>
                  {platform.connected ? (
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">@{platform.username}</div>
                  ) : (
                    <div className="text-[10px] text-slate-400 dark:text-slate-500 italic">Not connected</div>
                  )}
                </div>
              </div>

              {/* Stats for connected platforms */}
              {platform.connected && (
                <div className="mt-1.5 pt-1.5 border-t border-slate-100 dark:border-slate-700/50 grid grid-cols-2 gap-1">
                  <div className="text-center">
                    <div className="text-[10px] text-slate-500 dark:text-slate-400">Problems</div>
                    <div className="text-xs font-semibold" style={{ color: platform.color }}>
                      {platform.problems || 0}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-[10px] text-slate-500 dark:text-slate-400">Rank</div>
                    <div className="text-xs font-semibold truncate" style={{ color: platform.color }}>
                      {platform.id === "codingninjas"
                        ? (platform.rawData?.contests?.rating ?? platform.rank ?? "N/A")
                        : (platform.rank || "N/A")}
                    </div>
                  </div>
                </div>
              )}

              {/* Quick action for connected platforms */}
              {platform.connected && (
                <a
                  href={`https://${platform.id}.com/user/${platform.username}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1.5 flex items-center justify-center w-full text-[10px] text-slate-500 dark:text-slate-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
                >
                  <ExternalLink className="h-2.5 w-2.5 mr-1" />
                  View Profile
                </a>
              )}

              {/* Connect button for unconnected platforms */}
              {!platform.connected && (
                <Link
                  href={`/coding-portfolio/connect?platform=${platform.id}`}
                  className="mt-1.5 flex items-center justify-center w-full text-[10px] text-blue-500 dark:text-blue-400 hover:text-blue-600 dark:hover:text-blue-300 transition-colors"
                >
                  <Plus className="h-2.5 w-2.5 mr-1" />
                  Connect
                </Link>
              )}
            </div>

            {/* Hover effect overlay */}
            {platform.connected && (
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-300"
                style={{ backgroundColor: platform.color }}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
