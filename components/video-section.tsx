"use client"

import { useState, useEffect } from "react"
import { Video as VideoIcon, Play, CheckCircle2, Pencil, Trash2, Plus, Clock, ExternalLink, Upload, CheckCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog"
import { useToast } from "@/components/ui/use-toast"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Video {
  id: string
  title: string
  description?: string
  vimeoUrl: string
  order: number
  duration?: number
  thumbnailUrl?: string
  status: "DRAFT" | "PUBLISHED"
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
  const [form, setForm] = useState({ 
    title: "", 
    description: "", 
    vimeoUrl: "", 
    order: 0, 
    duration: undefined as number | undefined,
    thumbnailUrl: "",
    status: "DRAFT" as "DRAFT" | "PUBLISHED"
  })
  const [activeTab, setActiveTab] = useState("all")
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
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  // Handle select changes
  const handleSelectChange = (name: string, value: string) => {
    setForm({ ...form, [name]: value })
  }

  // Format duration from seconds to MM:SS
  const formatDuration = (seconds?: number) => {
    if (!seconds) return "--:--"
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  // Open add/edit dialog
  const openDialog = (video?: Video) => {
    if (video) {
      setEditVideo(video)
      setForm({ 
        title: video.title, 
        description: video.description || "", 
        vimeoUrl: video.vimeoUrl, 
        order: video.order,
        duration: video.duration,
        thumbnailUrl: video.thumbnailUrl || "",
        status: video.status
      })
    } else {
      setEditVideo(null)
      setForm({ 
        title: "", 
        description: "", 
        vimeoUrl: "", 
        order: videos.length,
        duration: undefined,
        thumbnailUrl: "",
        status: "DRAFT"
      })
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

  // Update video status
  const handleStatusChange = async (video: Video, newStatus: "DRAFT" | "PUBLISHED") => {
    try {
      const res = await fetch(`/api/modules/${module.id}/videos`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          id: video.id, 
          status: newStatus 
        })
      })
      if (!res.ok) throw new Error("Failed to update status")
      const updated = await res.json()
      setVideos(videos.map(v => v.id === updated.id ? updated : v))
      if (selectedVideo?.id === updated.id) setSelectedVideo(updated)
      toast({ 
        title: newStatus === "PUBLISHED" ? "Published" : "Drafted", 
        description: `Video "${video.title}" is now ${newStatus.toLowerCase()}`
      })
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

  // Filter videos based on active tab
  const filteredVideos = videos.filter(video => {
    if (activeTab === "all") return true
    if (activeTab === "draft") return video.status === "DRAFT"
    if (activeTab === "published") return video.status === "PUBLISHED"
    return true
  })

  return (
    <div className="w-full h-full flex flex-col gap-6 p-4">
      {/* Status stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-zinc-900 to-zinc-800 shadow-md border-white/10">
          <CardContent className="p-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-zinc-400">Total Videos</p>
                <p className="text-3xl font-bold mt-1">{videos.length}</p>
              </div>
              <div className="p-3 bg-indigo-500/10 rounded-lg">
                <VideoIcon className="h-6 w-6 text-indigo-500" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-zinc-900 to-zinc-800 shadow-md border-white/10">
          <CardContent className="p-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-zinc-400">Published</p>
                <p className="text-3xl font-bold mt-1">{videos.filter(v => v.status === "PUBLISHED").length}</p>
              </div>
              <div className="p-3 bg-green-500/10 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-zinc-900 to-zinc-800 shadow-md border-white/10">
          <CardContent className="p-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-zinc-400">Drafts</p>
                <p className="text-3xl font-bold mt-1">{videos.filter(v => v.status === "DRAFT").length}</p>
              </div>
              <div className="p-3 bg-yellow-500/10 rounded-lg">
                <Upload className="h-6 w-6 text-yellow-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Left sidebar: Video list */}
        <div className="w-full lg:w-96 flex-shrink-0">
          <Card className="h-full flex flex-col border-white/10 shadow-md bg-gradient-to-br from-zinc-900 to-zinc-800">
            <CardHeader className="px-4 py-3 border-b border-white/10 flex flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle className="text-sm font-medium">Module Videos</CardTitle>
                <CardDescription className="text-xs text-zinc-400">Manage and organize videos</CardDescription>
              </div>
              <Button 
                size="sm" 
                onClick={() => openDialog()} 
                className="h-8 text-xs bg-indigo-600 hover:bg-indigo-700"
              >
                <Plus className="h-3.5 w-3.5 mr-1" /> Add Video
              </Button>
            </CardHeader>
            
            <div className="px-2 pt-2">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="w-full grid grid-cols-3 bg-zinc-800/50">
                  <TabsTrigger value="all" className="text-xs">All ({videos.length})</TabsTrigger>
                  <TabsTrigger value="published" className="text-xs">Published ({videos.filter(v => v.status === "PUBLISHED").length})</TabsTrigger>
                  <TabsTrigger value="draft" className="text-xs">Drafts ({videos.filter(v => v.status === "DRAFT").length})</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            
            <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="p-3 space-y-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="flex items-center gap-2">
                    <Skeleton className="h-12 w-12 rounded-md" />
                    <div className="flex-1">
                      <Skeleton className="h-3 w-28 mb-1" />
                      <Skeleton className="h-2 w-16" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredVideos.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 text-muted-foreground text-sm">
                <VideoIcon className="h-8 w-8 mb-2 opacity-20" />
                No videos {activeTab !== "all" ? `with status: ${activeTab}` : ""} 
                <Button 
                  variant="link" 
                  onClick={() => openDialog()} 
                  className="mt-2 h-auto p-0"
                >
                  Add your first video
                </Button>
              </div>
            ) : (
              <ul className="p-2 space-y-2">
                {filteredVideos.map((video) => (
                  <li 
                    key={video.id}
                    className={cn(
                      "flex items-center rounded-lg mb-1 cursor-pointer transition-all duration-200 overflow-hidden",
                      selectedVideo?.id === video.id 
                        ? "bg-indigo-600/20 border border-indigo-500/30" 
                        : "bg-zinc-800/30 border border-white/5 hover:border-white/10",
                      "group relative"
                    )}
                    onClick={() => setSelectedVideo(video)}
                  >
                    <div className="flex w-full p-2">
                      <div className="w-14 h-14 rounded-md bg-zinc-800 flex-shrink-0 overflow-hidden relative">
                        {video.thumbnailUrl ? (
                          <img 
                            src={video.thumbnailUrl} 
                            alt={video.title} 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full">
                            <Play className="h-5 w-5 text-zinc-500" />
                          </div>
                        )}
                        <div className="absolute bottom-0 right-0 bg-black/70 text-[10px] px-1 rounded-tl-sm">
                          {formatDuration(video.duration)}
                        </div>
                      </div>
                      
                      <div className="flex-1 min-w-0 ml-2">
                        <div className="flex items-center">
                          <p className="font-medium text-xs truncate flex-1">
                            {video.title}
                          </p>
                          {video.status === "PUBLISHED" ? (
                            <Badge variant="outline" className="bg-green-500/10 text-green-400 text-[9px] ml-1">
                              LIVE
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-yellow-500/10 text-yellow-400 text-[9px] ml-1">
                              DRAFT
                            </Badge>
                          )}
                        </div>
                        <div className="text-[10px] text-zinc-400 mt-0.5 line-clamp-2">
                          {video.description || "No description"}
                        </div>
                        <div className="flex items-center mt-0.5 space-x-1">
                          <Badge 
                            variant="outline" 
                            className="text-[9px] h-4 px-1 bg-zinc-800/50 border-zinc-700 text-zinc-400"
                          >
                            #{video.order}
                          </Badge>
                          <Badge 
                            variant="outline" 
                            className="text-[9px] h-4 px-1 bg-zinc-800/50 border-zinc-700 text-zinc-400"
                          >
                            <Clock className="h-2 w-2 mr-0.5" /> {formatDuration(video.duration)}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="flex flex-col justify-between py-0.5">
                        <div className="flex gap-1">
                          <Button 
                            size="icon" 
                            variant="ghost" 
                            className="h-5 w-5" 
                            onClick={(e) => { e.stopPropagation(); openDialog(video); }}
                            title="Edit video"
                          >
                            <Pencil className="h-2.5 w-2.5" />
                          </Button>
                          <Button 
                            size="icon" 
                            variant="ghost" 
                            className="h-5 w-5 text-destructive" 
                            onClick={(e) => { e.stopPropagation(); handleDelete(video.id); }}
                            title="Delete video"
                          >
                            <Trash2 className="h-2.5 w-2.5" />
                          </Button>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          className={cn(
                            "h-5 text-[9px] px-1.5", 
                            video.status === "DRAFT" ? "text-green-400 hover:text-green-300" : "text-yellow-400 hover:text-yellow-300"
                          )}
                          onClick={(e) => { 
                            e.stopPropagation(); 
                            handleStatusChange(video, video.status === "DRAFT" ? "PUBLISHED" : "DRAFT");
                          }}
                        >
                          {video.status === "DRAFT" ? "Publish" : "Unpublish"}
                        </Button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </Card>
      </div>

      {/* Main content: Video player and details */}
      <div className="flex-1 grid gap-4 grid-cols-1">
        {selectedVideo ? (
          <>
            <Card className="border-white/10 shadow-md bg-gradient-to-br from-zinc-900 to-zinc-800">
              <CardHeader className="px-4 py-3 border-b border-white/10">
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-sm font-medium flex items-center">
                      {selectedVideo.title}
                      {selectedVideo.status === "PUBLISHED" ? (
                        <Badge variant="outline" className="bg-green-500/10 text-green-400 text-[9px] ml-2">
                          PUBLISHED
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-yellow-500/10 text-yellow-400 text-[9px] ml-2">
                          DRAFT
                        </Badge>
                      )}
                    </CardTitle>
                    <CardDescription className="text-xs text-zinc-400 mt-0.5 flex items-center">
                      <Clock className="h-3 w-3 mr-1 text-zinc-500" /> 
                      {formatDuration(selectedVideo.duration)}
                      {selectedVideo.vimeoUrl && (
                        <a 
                          href={selectedVideo.vimeoUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="ml-3 flex items-center text-zinc-400 hover:text-zinc-300"
                        >
                          <ExternalLink className="h-3 w-3 mr-1" /> View on Vimeo
                        </a>
                      )}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="h-8 text-xs border-white/10"
                      onClick={() => openDialog(selectedVideo)}
                    >
                      <Pencil className="h-3 w-3 mr-1" /> Edit
                    </Button>
                    <Button 
                      size="sm"
                      variant={selectedVideo.status === "DRAFT" ? "default" : "outline"}
                      className={cn(
                        "h-8 text-xs", 
                        selectedVideo.status === "DRAFT" 
                          ? "bg-green-600 hover:bg-green-700" 
                          : "border-white/10"
                      )}
                      onClick={() => handleStatusChange(
                        selectedVideo, 
                        selectedVideo.status === "DRAFT" ? "PUBLISHED" : "DRAFT"
                      )}
                    >
                      {selectedVideo.status === "DRAFT" ? (
                        <>
                          <CheckCircle className="h-3 w-3 mr-1" /> Publish
                        </>
                      ) : (
                        <>
                          <Upload className="h-3 w-3 mr-1" /> Unpublish
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="aspect-video bg-black w-full">
                  {renderVimeoPlayer(selectedVideo.vimeoUrl)}
                </div>
              </CardContent>
            </Card>
            
            {/* Video description card */}
            <Card className="border-white/10 shadow-md bg-gradient-to-br from-zinc-900 to-zinc-800">
              <CardHeader className="px-4 py-3 border-b border-white/10">
                <CardTitle className="text-sm font-medium">Description</CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                {selectedVideo.description ? (
                  <p className="text-sm text-zinc-300 whitespace-pre-line">{selectedVideo.description}</p>
                ) : (
                  <p className="text-sm text-zinc-500 italic">No description available</p>
                )}
              </CardContent>
            </Card>
          </>
        ) : (
          <Card className="flex flex-col items-center justify-center p-8 border-white/10 shadow-md bg-gradient-to-br from-zinc-900 to-zinc-800 h-52">
            <VideoIcon className="h-10 w-10 mb-4 text-zinc-600" />
            <h3 className="text-lg font-medium mb-2">No video selected</h3>
            <p className="text-sm text-zinc-400 text-center mb-4">
              {videos.length > 0 
                ? "Select a video from the list to view it here" 
                : "You haven't added any videos to this module yet"}
            </p>
            {videos.length === 0 && (
              <Button onClick={() => openDialog()}>
                <Plus className="h-4 w-4 mr-1" /> Add your first video
              </Button>
            )}
          </Card>
        )}
      </div>
    </div>

      {/* Add/Edit Video Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editVideo ? "Edit Video" : "Add Video"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <label htmlFor="title" className="text-sm font-medium">Title</label>
              <Input
                id="title"
                name="title"
                value={form.title}
                onChange={handleFormChange}
                placeholder="Enter video title"
                className="w-full"
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="vimeoUrl" className="text-sm font-medium">Vimeo URL</label>
              <Input
                id="vimeoUrl"
                name="vimeoUrl"
                value={form.vimeoUrl}
                onChange={handleFormChange}
                placeholder="e.g. https://vimeo.com/123456789"
                className="w-full"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="order" className="text-sm font-medium">Order</label>
                <Input
                  id="order"
                  name="order"
                  type="number"
                  value={form.order}
                  onChange={handleFormChange}
                  className="w-full"
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="duration" className="text-sm font-medium">Duration (seconds)</label>
                <Input
                  id="duration"
                  name="duration"
                  type="number"
                  value={form.duration || ""}
                  onChange={handleFormChange}
                  placeholder="e.g. 300 for 5 minutes"
                  className="w-full"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="status" className="text-sm font-medium">Status</label>
              <Select 
                value={form.status} 
                onValueChange={(value) => handleSelectChange("status", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DRAFT">Draft</SelectItem>
                  <SelectItem value="PUBLISHED">Published</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="thumbnailUrl" className="text-sm font-medium">Thumbnail URL (optional)</label>
              <Input
                id="thumbnailUrl"
                name="thumbnailUrl"
                value={form.thumbnailUrl}
                onChange={handleFormChange}
                placeholder="Image URL for video thumbnail"
                className="w-full"
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="description" className="text-sm font-medium">Description (optional)</label>
              <Textarea
                id="description"
                name="description"
                value={form.description}
                onChange={handleFormChange}
                placeholder="Enter video description"
                className="w-full h-24"
              />
            </div>
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
