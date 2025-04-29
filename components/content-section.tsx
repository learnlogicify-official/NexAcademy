"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Pencil, Trash2, Plus } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { Skeleton } from "@/components/ui/skeleton"
import ReactMarkdown from "react-markdown"
import { Editor } from '@tinymce/tinymce-react';
import { createPortal } from "react-dom";
import FullScreenEditor from "@/components/full-screen-editor";

interface Article {
  id: string
  title: string
  content: string
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

export function ContentSection({ module }: ContentSectionProps) {
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [showDialog, setShowDialog] = useState(false)
  const [editArticle, setEditArticle] = useState<Article | null>(null)
  const [form, setForm] = useState({ title: "", content: "", order: 0 })
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null)
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

  // Open add/edit dialog
  const openDialog = (article?: Article) => {
    if (article) {
      setEditArticle(article)
      setForm({ title: article.title, content: article.content, order: article.order })
      setEditorContent(article.content)
    } else {
      setEditArticle(null)
      setForm({ title: "", content: "", order: articles.length })
      setEditorContent("")
    }
    setShowDialog(true)
  }

  // Add or update article
  const handleSave = async () => {
    if (!form.title.trim() || !editorContent.trim()) {
      toast({ title: "Error", description: "Title and content are required", variant: "destructive" })
      return
    }
    try {
      let res
      if (editArticle) {
        res = await fetch(`/api/modules/${module.id}/articles`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: editArticle.id, ...form, content: editorContent })
        })
      } else {
        res = await fetch(`/api/modules/${module.id}/articles`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...form, content: editorContent })
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

  return (
    <>
      <style jsx global>{`
        ${articleStyles}
      `}</style>
      <div className="w-full h-full flex flex-col md:flex-row gap-4 p-4">
        {/* Left sidebar: Article list */}
        <div className="w-full md:w-72 flex-shrink-0">
          <div className="bg-card border rounded-md h-full flex flex-col">
            <div className="p-3 border-b flex items-center justify-between">
              <h3 className="font-medium text-sm">Articles</h3>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => openDialog()} 
                className="h-8 text-xs bg-primary/5 hover:bg-primary/10"
              >
                <Plus className="h-3.5 w-3.5 mr-1" /> Add Article
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
              ) : articles.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-40 text-muted-foreground text-sm">
                  <Plus className="h-8 w-8 mb-2 opacity-20" />
                  No articles yet
                  <Button 
                    variant="link" 
                    onClick={() => openDialog()} 
                    className="mt-2 h-auto p-0"
                  >
                    Add your first article
                  </Button>
                </div>
              ) : (
                <ul className="p-1.5">
                  {articles.map((article, index) => (
                    <li 
                      key={article.id}
                      className={`flex items-center text-sm p-2 rounded-md mb-1 cursor-pointer transition-colors ${selectedArticle?.id === article.id ? "bg-primary/10 text-primary" : "hover:bg-muted"} group relative`}
                      onClick={() => setSelectedArticle(article)}
                    >
                      <div className="flex w-full">
                        <div className={`w-8 h-8 rounded flex items-center justify-center mr-2 shrink-0 ${selectedArticle?.id === article.id ? "bg-primary/20" : "bg-muted"}`}>
                          <span className="font-bold text-xs">{index + 1}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-xs truncate">
                            {article.title}
                          </p>
                          <div className="flex items-center mt-0.5">
                            <span className="text-[10px] h-4 px-1 bg-background/50 border-muted">Order: {article.order}</span>
                          </div>
                        </div>
                        <div className="absolute right-1 flex opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button 
                            size="icon" 
                            variant="ghost" 
                            className="h-6 w-6" 
                            onClick={(e) => { e.stopPropagation(); openDialog(article); }}
                          >
                            <Pencil className="h-3 w-3" />
                          </Button>
                          <Button 
                            size="icon" 
                            variant="ghost" 
                            className="h-6 w-6 text-destructive" 
                            onClick={(e) => { e.stopPropagation(); handleDelete(article.id); }}
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

        {/* Main content: Article viewer/editor */}
        <div className="flex-1 flex flex-col h-full overflow-hidden">
          <Card className="flex-1 flex flex-col border overflow-hidden h-full">
            <CardContent className="p-6 flex-1 overflow-y-auto max-h-[80vh]">
              {selectedArticle ? (
                <>
                  <h2 className="text-xl font-bold mb-4">{selectedArticle.title}</h2>
                  <div className="prose prose-invert max-w-none text-sm article-content">
                    <div 
                      dangerouslySetInnerHTML={{ __html: selectedArticle.content }} 
                      className="article-content"
                    />
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                  <Plus className="h-10 w-10 mb-2 opacity-10" />
                  <p className="text-sm">Select an article to view</p>
                  {articles.length === 0 && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => openDialog()}
                      className="mt-4"
                    >
                      <Plus className="h-4 w-4 mr-1" /> Add your first article
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Add/Edit Article Dialog */}
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogContent className="max-w-3xl w-full">
            <DialogHeader>
              <DialogTitle>{editArticle ? "Edit Article" : "Add Article"}</DialogTitle>
              <DialogDescription>
                {editArticle ? "Edit the article content using the rich text editor below." : "Add a new article with a title and rich content."}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <Input
                name="title"
                value={form.title}
                onChange={handleFormChange}
                placeholder="Article Title"
                className="w-full"
              />
              <Editor
                apiKey={process.env.NEXT_PUBLIC_TINYMCE_API_KEY}
                value={editorContent}
                init={{
                  height: 400,
                  menubar: false,
                  plugins: [
                    'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview', 'anchor',
                    'searchreplace', 'visualblocks', 'code', 'fullscreen',
                    'insertdatetime', 'media', 'table', 'code', 'help', 'wordcount', 'fullscreen'
                  ],
                  toolbar:
                    'undo redo | formatselect | bold italic backcolor | fullscreen | \
                    alignleft aligncenter alignright alignjustify | \
                    bullist numlist outdent indent | removeformat | help',
                  content_style: `
                    body { 
                      font-family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif; 
                      font-size: 16px;
                      line-height: 1.6;
                      color: #f8fafc; 
                    }
                    p { margin: 0 0 1em 0; }
                    h1, h2, h3, h4, h5, h6 { 
                      margin-top: 1.5em; 
                      margin-bottom: 0.5em; 
                      line-height: 1.3;
                      font-weight: 600;
                    }
                    h1 { font-size: 1.8em; }
                    h2 { font-size: 1.5em; }
                    h3 { font-size: 1.3em; }
                    h4 { font-size: 1.2em; }
                    ul, ol { 
                      margin-bottom: 1em;
                      padding-left: 1.5em;
                    }
                    li { margin-bottom: 0.5em; }
                    img {
                      max-width: 100%;
                      height: auto;
                    }
                    blockquote {
                      margin-left: 0;
                      padding-left: 1em;
                      border-left: 3px solid #64748b;
                      font-style: italic;
                    }
                    pre {
                      background-color: #1e293b;
                      border-radius: 0.25rem;
                      padding: 1em;
                      white-space: pre-wrap;
                    }
                    table {
                      border-collapse: collapse;
                      width: 100%;
                    }
                    table td, table th {
                      border: 1px solid #3f3f46;
                      padding: 0.5em;
                    }
                  `,
                  resize: false,
                  branding: false,
                  promote: false
                }}
                onEditorChange={(content) => setEditorContent(content)}
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
              <Button variant="secondary" onClick={() => setFullscreen(true)}>
                Fullscreen
              </Button>
              <Button onClick={handleSave}>{editArticle ? "Save Changes" : "Add Article"}</Button>
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
          onContentChange={(content) => setEditorContent(content)}
          isEditing={!!editArticle}
        />
      </div>
    </>
  )
}
