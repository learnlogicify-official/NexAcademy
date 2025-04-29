"use client"

import { useState, useEffect } from "react"
import { Video as VideoIcon, Play, CheckCircle2, Pencil, Trash2, Plus } from "lucide-react"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog"
import { useToast } from "@/components/ui/use-toast"
import { Skeleton } from "@/components/ui/skeleton"

interface Video {
  id: string
  title: string
  vimeoUrl: string
  order: number
}

interface VideoSectionProps {
  module: {
    id: string
    title: string
  }
}

export function VideoSection({ module }: VideoSectionProps) {
  const [videos, setVideos] = useState<Video[]>([])
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null)
  const [loading, setLoading] = useState(true)
  const [showDialog, setShowDialog] = useState(false)
  const [editVideo, setEditVideo] = useState<Video | null>(null)
  const [form, setForm] = useState({ title: "", vimeoUrl: "", order: 0 })
  const { toast } = useToast()

  // Fetch videos
  useEffect(() => {
    setLoading(true)
    fetch(`/api/modules/${module.id}/videos`)
      .then(res => res.json())
      .then(data => {
        setVideos(data)
        setSelectedVideo(data[0] || null)
      })
      .finally(() => setLoading(false))
  }, [module.id])

  // Handle form changes
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  // Open add/edit dialog
  const openDialog = (video?: Video) => {
    if (video) {
      setEditVideo(video)
      setForm({ title: video.title, vimeoUrl: video.vimeoUrl, order: video.order })
    } else {
      setEditVideo(null)
      setForm({ title: "", vimeoUrl: "", order: videos.length })
    }
    setShowDialog(true)
  }

  // Add or update video
  const handleSave = async () => {
    if (!form.title.trim() || !form.vimeoUrl.trim()) {
      toast({ title: "Error", description: "Title and Vimeo URL are required", variant: "destructive" })
      return
    }
    try {
      let res
      if (editVideo) {
        res = await fetch(`/api/modules/${module.id}/videos`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: editVideo.id, ...form })
        })
      } else {
        res = await fetch(`/api/modules/${module.id}/videos`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form)
        })
      }
      if (!res.ok) throw new Error("Failed to save video")
      const saved = await res.json()
      let newVideos
      if (editVideo) {
        newVideos = videos.map(v => v.id === saved.id ? saved : v)
      } else {
        newVideos = [...videos, saved]
      }
      setVideos(newVideos)
      setSelectedVideo(saved)
      setShowDialog(false)
      toast({ title: "Success", description: `Video ${editVideo ? "updated" : "added"}` })
    } catch (e) {
      toast({ title: "Error", description: (e as Error).message, variant: "destructive" })
    }
  }

  // Delete video
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this video?")) return
    try {
      const res = await fetch(`/api/modules/${module.id}/videos`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id })
      })
      if (!res.ok) throw new Error("Failed to delete video")
      setVideos(videos.filter(v => v.id !== id))
      if (selectedVideo?.id === id) setSelectedVideo(videos[0] || null)
      toast({ title: "Deleted", description: "Video deleted" })
    } catch (e) {
      toast({ title: "Error", description: (e as Error).message, variant: "destructive" })
    }
  }

  // Render Vimeo player
  const renderVimeoPlayer = (vimeoUrl: string) => {
    // Extract Vimeo video ID from various URL formats
    let videoId = null;
    // Match standard Vimeo URL
    let match = vimeoUrl.match(/vimeo\.com\/(\d+)/);
    if (!match) {
      // Match player.vimeo.com/video/ID
      match = vimeoUrl.match(/vimeo\.com\/video\/(\d+)/);
    }
    if (!match) {
      // Match /channels/.../ID or /album/.../video/ID
      match = vimeoUrl.match(/vimeo\.com\/(?:channels\/[\w]+\/|album\/\d+\/video\/)?(\d+)/);
    }
    if (match) {
      videoId = match[1];
    }
    if (!videoId) {
      console.warn('Could not extract Vimeo video ID from URL:', vimeoUrl);
      return <div className="flex items-center justify-center h-full text-destructive">Invalid Vimeo URL: <span className="ml-2 font-mono">{vimeoUrl}</span></div>;
    }
    
    return (
      <iframe
        src={`https://player.vimeo.com/video/${videoId}`}
        className="w-full h-full rounded-md"
        allow="autoplay; fullscreen; picture-in-picture"
        allowFullScreen
        title="Vimeo Video"
      />
    );
  }

  return (
    <div className="w-full h-full flex flex-col md:flex-row gap-4 p-4">
      {/* Left sidebar: Video list */}
      <div className="w-full md:w-72 flex-shrink-0">
        <div className="bg-card border rounded-md h-full flex flex-col">
          <div className="p-3 border-b flex items-center justify-between">
            <h3 className="font-medium text-sm">Module Videos</h3>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => openDialog()} 
              className="h-8 text-xs bg-primary/5 hover:bg-primary/10"
            >
              <Plus className="h-3.5 w-3.5 mr-1" /> Add Video
            </Button>
            </div>
          
            <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="p-3 space-y-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="flex items-center gap-2">
                    <Skeleton className="h-8 w-8 rounded-md" />
                    <div className="flex-1">
                      <Skeleton className="h-3 w-24 mb-1" />
                      <Skeleton className="h-2 w-16" />
                    </div>
                  </div>
                ))}
              </div>
            ) : videos.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 text-muted-foreground text-sm">
                <VideoIcon className="h-8 w-8 mb-2 opacity-20" />
                No videos yet
                <Button 
                  variant="link" 
                  onClick={() => openDialog()} 
                  className="mt-2 h-auto p-0"
                >
                  Add your first video
                </Button>
              </div>
            ) : (
              <ul className="p-1.5">
                {videos.map((video, index) => (
                  <li 
                    key={video.id}
                    className={cn(
                      "flex items-center text-sm p-2 rounded-md mb-1 cursor-pointer transition-colors",
                      selectedVideo?.id === video.id 
                        ? "bg-primary/10 text-primary" 
                        : "hover:bg-muted",
                      "group relative"
                    )}
                    onClick={() => setSelectedVideo(video)}
                  >
                    <div className="flex w-full">
                      <div className={cn(
                        "w-8 h-8 rounded flex items-center justify-center mr-2 shrink-0",
                        selectedVideo?.id === video.id ? "bg-primary/20" : "bg-muted"
                      )}>
                        <Play className="h-3.5 w-3.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="font-medium text-xs truncate">
                        {video.title}
                      </p>
                        <div className="flex items-center mt-0.5">
                          <Badge 
                            variant="outline" 
                            className="text-[10px] h-4 px-1 bg-background/50 border-muted"
                          >
                            #{video.order}
                          </Badge>
                        </div>
                      </div>
                      <div className="absolute right-1 flex opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          className="h-6 w-6" 
                          onClick={(e) => { e.stopPropagation(); openDialog(video); }}
                        >
                          <Pencil className="h-3 w-3" />
                        </Button>
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          className="h-6 w-6 text-destructive" 
                          onClick={(e) => { e.stopPropagation(); handleDelete(video.id); }}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      {/* Main content: Video player */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <Card className="flex-1 flex flex-col border overflow-hidden h-full">
          <CardHeader className="p-3 border-b">
            <CardTitle className="text-sm">
              {selectedVideo ? selectedVideo.title : 'Video Player'}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 flex-1">
            <div className="w-full aspect-video bg-gray-900 rounded-md flex items-center justify-center relative">
              {selectedVideo ? (
                renderVimeoPlayer(selectedVideo.vimeoUrl)
              ) : (
                <div className="flex flex-col items-center justify-center w-full h-full text-muted-foreground">
                  <VideoIcon className="h-10 w-10 mb-2 opacity-10" />
                  <p className="text-sm">Select a video to play</p>
                  {videos.length === 0 && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => openDialog()}
                      className="mt-4"
                    >
                      <Plus className="h-4 w-4 mr-1" /> Add your first video
                    </Button>
                  )}
              </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add/Edit Video Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editVideo ? "Edit Video" : "Add Video"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <Input
              name="title"
              value={form.title}
              onChange={handleFormChange}
              placeholder="Video Title"
              className="w-full"
            />
            <Input
              name="vimeoUrl"
              value={form.vimeoUrl}
              onChange={handleFormChange}
              placeholder="Vimeo URL (e.g. https://vimeo.com/123456789)"
              className="w-full"
            />
            <Input
              name="order"
              type="number"
              value={form.order}
              onChange={handleFormChange}
              placeholder="Order"
              className="w-full"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>{editVideo ? "Save Changes" : "Add Video"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
