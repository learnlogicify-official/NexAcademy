"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Pencil, Trash2, Plus, BookOpen, Clock, Tag, ExternalLink, Upload, CheckCircle, FileText } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"
import ReactMarkdown from "react-markdown"
import { createPortal } from "react-dom";
import FullScreenEditor from "@/components/full-screen-editor";

interface Article {
  id: string
  title: string
  content: string
  summary?: string
  readingTime?: number
  tags: string[]
  status: "DRAFT" | "PUBLISHED"
  order: number
}

interface ContentSectionProps {
  module: {
    id: string
    title: string
  }
}

// Add global styles for article content
const articleStyles = `
  .article-content {
    line-height: 1.6;
  }
  .article-content p {
    margin-bottom: 1em;
  }
  .article-content h1, 
  .article-content h2, 
  .article-content h3, 
  .article-content h4, 
  .article-content h5, 
  .article-content h6 {
    margin-top: 1.5em;
    margin-bottom: 0.5em;
    line-height: 1.3;
    font-weight: 600;
  }
  .article-content h1 { font-size: 1.5rem; }
  .article-content h2 { font-size: 1.25rem; }
  .article-content h3 { font-size: 1.125rem; }
  .article-content ul, 
  .article-content ol {
    margin-bottom: 1em;
    padding-left: 1.5em;
  }
  .article-content li {
    margin-bottom: 0.5em;
  }
  .article-content blockquote {
    border-left: 3px solid #64748b;
    padding-left: 1em;
    margin-left: 0;
    margin-bottom: 1em;
    font-style: italic;
  }
  .article-content pre {
    background-color: #1e293b;
    border-radius: 0.25rem;
    padding: 1em;
    overflow-x: auto;
    margin-bottom: 1em;
  }
  .article-content img {
    max-width: 100%;
    height: auto;
    margin: 1em 0;
  }
  .article-content table {
    border-collapse: collapse;
    width: 100%;
    margin-bottom: 1em;
  }
  .article-content table td,
  .article-content table th {
    border: 1px solid #3f3f46;
    padding: 0.5em;
  }
`;

// Calculate reading time based on content
const calculateReadingTime = (content: string): number => {
  // Strip HTML tags
  const text = content.replace(/<[^>]*>?/gm, '');
  
  // Average reading speed: 225 words per minute
  const wordsPerMinute = 225;
  const words = text.trim().split(/\s+/).length;
  const readingTime = Math.ceil(words / wordsPerMinute);
  
  // Return at least 1 minute
  return Math.max(1, readingTime);
};

export function ContentSection({ module }: ContentSectionProps) {
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [showDialog, setShowDialog] = useState(false)
  const [editArticle, setEditArticle] = useState<Article | null>(null)
  const [form, setForm] = useState({ 
    title: "", 
    content: "", 
    summary: "",
    readingTime: undefined as number | undefined,
    tags: [] as string[],
    status: "DRAFT" as "DRAFT" | "PUBLISHED",
    order: 0 
  })
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null)
  const [activeTab, setActiveTab] = useState("all")
  const [tagInput, setTagInput] = useState("")
  const { toast } = useToast()
  const [editorContent, setEditorContent] = useState<string>("");
  const [fullscreen, setFullscreen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  // Fetch articles
  useEffect(() => {
    setLoading(true)
    fetch(`/api/modules/${module.id}/articles`)
      .then(res => res.json())
      .then(data => {
        setArticles(data)
        setSelectedArticle(data[0] || null)
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

  // Handle tag input
  const handleAddTag = () => {
    if (tagInput.trim() && !form.tags.includes(tagInput.trim())) {
      setForm({
        ...form,
        tags: [...form.tags, tagInput.trim()]
      });
      setTagInput("");
    }
  }

  // Remove tag from list
  const handleRemoveTag = (tagToRemove: string) => {
    setForm({
      ...form,
      tags: form.tags.filter(tag => tag !== tagToRemove)
    });
  }

  // Open add/edit dialog
  const openDialog = (article?: Article) => {
    if (article) {
      setEditArticle(article)
      setForm({ 
        title: article.title, 
        content: article.content, 
        summary: article.summary || "",
        readingTime: article.readingTime,
        tags: article.tags || [],
        status: article.status,
        order: article.order 
      })
      setEditorContent(article.content)
    } else {
      setEditArticle(null)
      setForm({ 
        title: "", 
        content: "", 
        summary: "",
        readingTime: undefined,
        tags: [],
        status: "DRAFT",
        order: articles.length 
      })
      setEditorContent("")
    }
    setShowDialog(true)
  }

  // Calculate reading time from editor content
  const handleEditorChange = (content: string) => {
    setEditorContent(content);
    // Auto-calculate reading time when content changes
    const time = calculateReadingTime(content);
    setForm(prev => ({ ...prev, readingTime: time }));
  }

  // Update article status
  const handleStatusChange = async (article: Article, newStatus: "DRAFT" | "PUBLISHED") => {
    try {
      const res = await fetch(`/api/modules/${module.id}/articles`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          id: article.id, 
          status: newStatus 
        })
      })
      if (!res.ok) throw new Error("Failed to update status")
      const updated = await res.json()
      setArticles(articles.map(a => a.id === updated.id ? updated : a))
      if (selectedArticle?.id === updated.id) setSelectedArticle(updated)
      toast({ 
        title: newStatus === "PUBLISHED" ? "Published" : "Drafted", 
        description: `Article "${article.title}" is now ${newStatus.toLowerCase()}`
      })
    } catch (e) {
      toast({ title: "Error", description: (e as Error).message, variant: "destructive" })
    }
  }

  // Add or update article
  const handleSave = async () => {
    if (!form.title.trim() || !editorContent.trim()) {
      toast({ title: "Error", description: "Title and content are required", variant: "destructive" })
      return
    }
    
    // Make sure reading time is calculated if not set
    const readingTime = form.readingTime || calculateReadingTime(editorContent);
    
    try {
      let res
      if (editArticle) {
        res = await fetch(`/api/modules/${module.id}/articles`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            id: editArticle.id, 
            ...form, 
            content: editorContent,
            readingTime 
          })
        })
      } else {
        res = await fetch(`/api/modules/${module.id}/articles`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            ...form, 
            content: editorContent,
            readingTime 
          })
        })
      }
      if (!res.ok) throw new Error("Failed to save article")
      const saved = await res.json()
      let newArticles
      if (editArticle) {
        newArticles = articles.map(a => a.id === saved.id ? saved : a)
      } else {
        newArticles = [...articles, saved]
      }
      setArticles(newArticles)
      setSelectedArticle(saved)
      setShowDialog(false)
      toast({ title: "Success", description: `Article ${editArticle ? "updated" : "added"}` })
    } catch (e) {
      toast({ title: "Error", description: (e as Error).message, variant: "destructive" })
    }
  }

  // Delete article
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this article?")) return
    try {
      const res = await fetch(`/api/modules/${module.id}/articles`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id })
      })
      if (!res.ok) throw new Error("Failed to delete article")
      setArticles(articles.filter(a => a.id !== id))
      if (selectedArticle?.id === id) setSelectedArticle(articles[0] || null)
      toast({ title: "Deleted", description: "Article deleted" })
    } catch (e) {
      toast({ title: "Error", description: (e as Error).message, variant: "destructive" })
    }
  }

  // Filter articles based on active tab
  const filteredArticles = articles.filter(article => {
    if (activeTab === "all") return true
    if (activeTab === "draft") return article.status === "DRAFT"
    if (activeTab === "published") return article.status === "PUBLISHED"
    return true
  })

  return (
    <>
      <style jsx global>{`
        ${articleStyles}
      `}</style>
      <div className="w-full h-full flex flex-col gap-6 p-4">
        {/* Status stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="bg-gradient-to-br from-zinc-900 to-zinc-800 shadow-md border-white/10">
            <CardContent className="p-6">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-zinc-400">Total Lessons</p>
                  <p className="text-3xl font-bold mt-1">{articles.length}</p>
                </div>
                <div className="p-3 bg-indigo-500/10 rounded-lg">
                  <BookOpen className="h-6 w-6 text-indigo-500" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-zinc-900 to-zinc-800 shadow-md border-white/10">
            <CardContent className="p-6">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-zinc-400">Published</p>
                  <p className="text-3xl font-bold mt-1">{articles.filter(a => a.status === "PUBLISHED").length}</p>
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
                  <p className="text-3xl font-bold mt-1">{articles.filter(a => a.status === "DRAFT").length}</p>
                </div>
                <div className="p-3 bg-yellow-500/10 rounded-lg">
                  <Upload className="h-6 w-6 text-yellow-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Left sidebar: Article list */}
          <div className="w-full lg:w-96 flex-shrink-0">
            <Card className="h-full flex flex-col border-white/10 shadow-md bg-gradient-to-br from-zinc-900 to-zinc-800">
              <CardHeader className="px-4 py-3 border-b border-white/10 flex flex-row items-center justify-between space-y-0">
                <div>
                  <CardTitle className="text-sm font-medium">Module Lessons</CardTitle>
                  <CardDescription className="text-xs text-zinc-400">Manage and organize lesson content</CardDescription>
                </div>
                <Button 
                  size="sm" 
                  onClick={() => openDialog()} 
                  className="h-8 text-xs bg-indigo-600 hover:bg-indigo-700"
                >
                  <Plus className="h-3.5 w-3.5 mr-1" /> Add Lesson
                </Button>
              </CardHeader>
              
              <div className="px-2 pt-2">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="w-full grid grid-cols-3 bg-zinc-800/50">
                    <TabsTrigger value="all" className="text-xs">All ({articles.length})</TabsTrigger>
                    <TabsTrigger value="published" className="text-xs">Published ({articles.filter(a => a.status === "PUBLISHED").length})</TabsTrigger>
                    <TabsTrigger value="draft" className="text-xs">Drafts ({articles.filter(a => a.status === "DRAFT").length})</TabsTrigger>
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
                ) : filteredArticles.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-40 text-muted-foreground text-sm">
                    <BookOpen className="h-8 w-8 mb-2 opacity-20" />
                    No lessons {activeTab !== "all" ? `with status: ${activeTab}` : ""}
                    <Button 
                      variant="link" 
                      onClick={() => openDialog()} 
                      className="mt-2 h-auto p-0"
                    >
                      Add your first lesson
                    </Button>
                  </div>
                ) : (
                  <ul className="p-2 space-y-2">
                    {filteredArticles.map((article) => (
                      <li 
                        key={article.id}
                        className={cn(
                          "flex items-center rounded-lg mb-1 cursor-pointer transition-all duration-200 overflow-hidden",
                          selectedArticle?.id === article.id 
                            ? "bg-indigo-600/20 border border-indigo-500/30" 
                            : "bg-zinc-800/30 border border-white/5 hover:border-white/10",
                          "group relative"
                        )}
                        onClick={() => setSelectedArticle(article)}
                      >
                        <div className="flex w-full p-2">
                          <div className="w-14 h-14 rounded-md bg-zinc-800 flex-shrink-0 overflow-hidden relative flex items-center justify-center">
                            <FileText className="h-6 w-6 text-zinc-500" />
                            <div className="absolute bottom-0 right-0 bg-black/70 text-[10px] px-1 rounded-tl-sm">
                              {article.readingTime || 1}m
                            </div>
                          </div>
                          
                          <div className="flex-1 min-w-0 ml-2">
                            <div className="flex items-center">
                              <p className="font-medium text-xs truncate flex-1">
                                {article.title}
                              </p>
                              {article.status === "PUBLISHED" ? (
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
                              {article.summary || "No summary"}
                            </div>
                            <div className="flex items-center mt-0.5 space-x-1">
                              <Badge 
                                variant="outline" 
                                className="text-[9px] h-4 px-1 bg-zinc-800/50 border-zinc-700 text-zinc-400"
                              >
                                #{article.order}
                              </Badge>
                              <Badge 
                                variant="outline" 
                                className="text-[9px] h-4 px-1 bg-zinc-800/50 border-zinc-700 text-zinc-400"
                              >
                                <Clock className="h-2 w-2 mr-0.5" /> {article.readingTime || 1}m read
                              </Badge>
                              {article.tags && article.tags.length > 0 && (
                                <Badge 
                                  variant="outline" 
                                  className="text-[9px] h-4 px-1 bg-zinc-800/50 border-zinc-700 text-zinc-400"
                                >
                                  <Tag className="h-2 w-2 mr-0.5" /> {article.tags.length}
                                </Badge>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex flex-col justify-between py-0.5">
                            <div className="flex gap-1">
                              <Button 
                                size="icon" 
                                variant="ghost" 
                                className="h-5 w-5" 
                                onClick={(e) => { e.stopPropagation(); openDialog(article); }}
                                title="Edit lesson"
                              >
                                <Pencil className="h-2.5 w-2.5" />
                              </Button>
                              <Button 
                                size="icon" 
                                variant="ghost" 
                                className="h-5 w-5 text-destructive" 
                                onClick={(e) => { e.stopPropagation(); handleDelete(article.id); }}
                                title="Delete lesson"
                              >
                                <Trash2 className="h-2.5 w-2.5" />
                              </Button>
                            </div>
                            <Button
                              size="sm"
                              variant="ghost"
                              className={cn(
                                "h-5 text-[9px] px-1.5", 
                                article.status === "DRAFT" ? "text-green-400 hover:text-green-300" : "text-yellow-400 hover:text-yellow-300"
                              )}
                              onClick={(e) => { 
                                e.stopPropagation(); 
                                handleStatusChange(article, article.status === "DRAFT" ? "PUBLISHED" : "DRAFT");
                              }}
                            >
                              {article.status === "DRAFT" ? "Publish" : "Unpublish"}
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

          {/* Main content: Article viewer/editor */}
          <div className="flex-1 grid gap-4 grid-cols-1">
            {selectedArticle ? (
              <>
                <Card className="border-white/10 shadow-md bg-gradient-to-br from-zinc-900 to-zinc-800">
                  <CardHeader className="px-4 py-3 border-b border-white/10">
                    <div className="flex justify-between items-center">
                      <div>
                        <CardTitle className="text-sm font-medium flex items-center">
                          {selectedArticle.title}
                          {selectedArticle.status === "PUBLISHED" ? (
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
                          {selectedArticle.readingTime || 1} min read
                          {selectedArticle.tags && selectedArticle.tags.length > 0 && (
                            <span className="ml-3 flex items-center">
                              <Tag className="h-3 w-3 mr-1 text-zinc-500" /> 
                              {selectedArticle.tags.join(", ")}
                            </span>
                          )}
                        </CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="h-8 text-xs border-white/10"
                          onClick={() => openDialog(selectedArticle)}
                        >
                          <Pencil className="h-3 w-3 mr-1" /> Edit
                        </Button>
                        <Button 
                          size="sm"
                          variant={selectedArticle.status === "DRAFT" ? "default" : "outline"}
                          className={cn(
                            "h-8 text-xs", 
                            selectedArticle.status === "DRAFT" 
                              ? "bg-green-600 hover:bg-green-700" 
                              : "border-white/10"
                          )}
                          onClick={() => handleStatusChange(
                            selectedArticle, 
                            selectedArticle.status === "DRAFT" ? "PUBLISHED" : "DRAFT"
                          )}
                        >
                          {selectedArticle.status === "DRAFT" ? (
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
                  <CardContent className="p-6 max-h-[800px] overflow-y-auto">
                    {selectedArticle.summary && (
                      <div className="mb-6 bg-indigo-950/20 border border-indigo-800/20 rounded-lg p-3">
                        <h3 className="text-xs font-medium text-indigo-300 mb-1">Summary</h3>
                        <p className="text-sm text-zinc-300">{selectedArticle.summary}</p>
                      </div>
                    )}
                    <div 
                      dangerouslySetInnerHTML={{ __html: selectedArticle.content }} 
                      className="prose prose-invert max-w-none text-sm article-content"
                    />
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card className="flex flex-col items-center justify-center p-8 border-white/10 shadow-md bg-gradient-to-br from-zinc-900 to-zinc-800 h-52">
                <BookOpen className="h-10 w-10 mb-4 text-zinc-600" />
                <h3 className="text-lg font-medium mb-2">No lesson selected</h3>
                <p className="text-sm text-zinc-400 text-center mb-4">
                  {articles.length > 0 
                    ? "Select a lesson from the list to view it here" 
                    : "You haven't added any lessons to this module yet"}
                </p>
                {articles.length === 0 && (
                  <Button onClick={() => openDialog()}>
                    <Plus className="h-4 w-4 mr-1" /> Add your first lesson
                  </Button>
                )}
              </Card>
            )}
          </div>
        </div>

        {/* Add/Edit Article Dialog */}
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editArticle ? "Edit Lesson" : "Add Lesson"}</DialogTitle>
              <DialogDescription>
                {editArticle ? "Edit the lesson content" : "Create a new lesson for this module"}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <label htmlFor="title" className="text-sm font-medium">Title</label>
                <Input
                  id="title"
                  name="title"
                  value={form.title}
                  onChange={handleFormChange}
                  placeholder="Enter lesson title"
                  className="w-full"
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="summary" className="text-sm font-medium">Summary (optional)</label>
                <Textarea
                  id="summary"
                  name="summary"
                  value={form.summary}
                  onChange={handleFormChange}
                  placeholder="Add a brief summary of this lesson"
                  className="w-full h-16 resize-none"
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
                  <label htmlFor="readingTime" className="text-sm font-medium">Reading Time (minutes)</label>
                  <Input
                    id="readingTime"
                    name="readingTime"
                    type="number"
                    value={form.readingTime || ""}
                    onChange={handleFormChange}
                    placeholder="Auto-calculated from content"
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
                <label className="text-sm font-medium">Tags</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {form.tags.map(tag => (
                    <Badge key={tag} className="bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30">
                      {tag}
                      <button
                        onClick={() => handleRemoveTag(tag)}
                        className="ml-1 hover:text-white"
                      >
                        &times;
                      </button>
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    placeholder="Add a tag"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddTag();
                      }
                    }}
                    className="w-full"
                  />
                  <Button 
                    variant="outline" 
                    onClick={handleAddTag}
                    type="button"
                  >
                    Add
                  </Button>
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Content</label>
                {/* Placeholder for a new rich text editor */}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDialog(false)}>
                Cancel
              </Button>
              <Button variant="secondary" onClick={() => setFullscreen(true)}>
                Fullscreen
              </Button>
              <Button onClick={handleSave}>{editArticle ? "Save Changes" : "Add Lesson"}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Standalone FullScreen Editor Component */}
        <FullScreenEditor
          isOpen={fullscreen}
          onClose={() => setFullscreen(false)}
          onSave={handleSave}
          title={form.title}
          onTitleChange={(e) => setForm({ ...form, title: e.target.value })}
          content={editorContent}
          onContentChange={handleEditorChange}
          isEditing={!!editArticle}
        />
      </div>
    </>
  )
}
