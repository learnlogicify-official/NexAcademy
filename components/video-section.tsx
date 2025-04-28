"use client"

import { useState, useEffect } from "react"
import { Video as VideoIcon, Play, CheckCircle2, Pencil, Trash2, Plus } from "lucide-react"
import { cn } from "@/lib/utils"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog"
import { useToast } from "@/components/ui/use-toast"

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
        className="w-full h-full rounded-xl"
        allow="autoplay; fullscreen; picture-in-picture"
        allowFullScreen
        title="Vimeo Video"
      />
    );
  }

  return (
    <div className="h-[calc(100vh-12rem)] grid grid-cols-1 md:grid-cols-3 gap-5">
      {/* Video List - Left Side */}
      <div className="md:col-span-1 h-full">
        <Card className="h-full overflow-hidden">
          <CardContent className="p-0 h-full flex flex-col">
            <div className="p-3 border-b flex items-center justify-between">
              <div>
                <h3 className="font-medium">Module Videos</h3>
                <p className="text-xs text-muted-foreground">
                  {videos.length} videos
                </p>
              </div>
              <Button size="sm" variant="outline" onClick={() => openDialog()}>
                <Plus className="h-4 w-4 mr-1" /> Add
              </Button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <div className="p-2 space-y-1">
                {videos.map((video) => (
                  <div
                    key={video.id}
                    className={cn(
                      "flex items-start gap-2 p-2 rounded-md cursor-pointer hover:bg-muted transition-colors group",
                      selectedVideo?.id === video.id && "bg-muted",
                    )}
                    onClick={() => setSelectedVideo(video)}
                  >
                    <div className="relative mt-1">
                      <Play className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate">
                        {video.title}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-muted-foreground">Order: {video.order}</span>
                      </div>
                    </div>
                    <Button size="icon" variant="ghost" className="opacity-0 group-hover:opacity-100" onClick={e => { e.stopPropagation(); openDialog(video) }} title="Edit">
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="ghost" className="opacity-0 group-hover:opacity-100 text-destructive" onClick={e => { e.stopPropagation(); handleDelete(video.id) }} title="Delete">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                {videos.length === 0 && (
                  <div className="text-center text-muted-foreground py-8">No videos yet.</div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Video Player - Right Side */}
      <div className="md:col-span-2 h-full flex flex-col">
        <div className="flex-1 flex flex-col">
          <div className="aspect-video bg-gray-900 rounded-xl overflow-hidden relative">
            {selectedVideo ? (
              renderVimeoPlayer(selectedVideo.vimeoUrl)
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">Select a video</div>
            )}
            {selectedVideo && (
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/40 to-transparent">
                <h2 className="text-xl font-bold text-white">{selectedVideo.title}</h2>
                <p className="text-gray-300 text-sm mt-1">Part of {module.title}</p>
              </div>
            )}
          </div>
        </div>
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
