"use client"

import { useState } from "react"
import { Video, Play, CheckCircle2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface VideoSectionProps {
  module: {
    title: string
  }
}

// Mock video data for demonstration (limited to 5 for space)
const mockVideos = [
  { id: 1, title: "Introduction to the Module", duration: "5:23", watched: true, current: true },
  { id: 2, title: "Core Concepts Overview", duration: "8:45", watched: false, current: false },
  { id: 3, title: "Working with Basic Examples", duration: "12:10", watched: false, current: false },
  { id: 4, title: "Advanced Techniques", duration: "15:32", watched: false, current: false },
  { id: 5, title: "Common Pitfalls and Solutions", duration: "7:18", watched: false, current: false },
]

export function VideoSection({ module }: VideoSectionProps) {
  const [selectedVideo, setSelectedVideo] = useState(mockVideos[0])

  return (
    <div className="h-[calc(100vh-12rem)] grid grid-cols-1 md:grid-cols-3 gap-5">
      {/* Video List - Left Side */}
      <div className="md:col-span-1 h-full">
        <Card className="h-full overflow-hidden">
          <CardContent className="p-0 h-full flex flex-col">
            <div className="p-3 border-b">
              <h3 className="font-medium">Module Videos</h3>
              <p className="text-xs text-muted-foreground">
                {mockVideos.length} videos • {calculateTotalDuration(mockVideos)}
              </p>
            </div>
            <div className="flex-1 overflow-y-auto">
              <div className="p-2 space-y-1">
                {mockVideos.map((video) => (
                  <div
                    key={video.id}
                    className={cn(
                      "flex items-start gap-2 p-2 rounded-md cursor-pointer hover:bg-muted transition-colors",
                      video.id === selectedVideo.id && "bg-muted",
                    )}
                    onClick={() => setSelectedVideo(video)}
                  >
                    <div className="relative mt-1">
                      {video.watched ? (
                        <CheckCircle2 className="h-4 w-4 text-primary" />
                      ) : (
                        <Play className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={cn("text-xs font-medium truncate", video.watched && "text-muted-foreground")}>
                        {video.title}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-muted-foreground">{video.duration}</span>
                        {video.current && (
                          <Badge variant="outline" className="text-[10px] py-0 h-4">
                            Current
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Video Player - Right Side */}
      <div className="md:col-span-2 h-full flex flex-col">
        <div className="flex-1 flex flex-col">
          <div className="aspect-video bg-gray-900 rounded-xl overflow-hidden relative">
            <div className="absolute inset-0 flex items-center justify-center">
              <Video className="h-16 w-16 text-gray-700" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-4">
              <h2 className="text-xl font-bold">{selectedVideo.title}</h2>
              <p className="text-gray-300 text-sm mt-1">Part of {module.title}</p>
            </div>
          </div>

          <div className="mt-4 space-y-3 flex-1">
            <h3 className="text-lg font-medium">Video Description</h3>
            <p className="text-muted-foreground text-sm">
              This video covers key concepts related to {module.title.toLowerCase()}, including fundamental principles
              and practical examples.
            </p>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">Beginner</Badge>
              <Badge variant="secondary">{selectedVideo.duration}</Badge>
              <Badge variant="secondary">With Captions</Badge>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Helper function to calculate total duration
function calculateTotalDuration(videos: any[]): string {
  // This is a simplified calculation assuming durations are in "MM:SS" format
  let totalMinutes = 0
  let totalSeconds = 0

  videos.forEach((video) => {
    const [minutes, seconds] = video.duration.split(":").map(Number)
    totalMinutes += minutes
    totalSeconds += seconds
  })

  totalMinutes += Math.floor(totalSeconds / 60)
  totalSeconds = totalSeconds % 60

  return `${totalMinutes} min ${totalSeconds} sec`
}
