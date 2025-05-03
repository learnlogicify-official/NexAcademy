"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Pencil, Trash2, Plus, Tag as TagIcon, Search, Filter, AlertCircle, Loader2, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, CalendarIcon, Clock } from "lucide-react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from "@/components/ui/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Tag {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export default function AdminTagsPage() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [editTag, setEditTag] = useState<Tag | null>(null);
  const [form, setForm] = useState({ name: "", description: "" });
  const [deletingTag, setDeletingTag] = useState<Tag | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<"name" | "createdAt" | "updatedAt">("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [pageSize, setPageSize] = useState(12);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalTags, setTotalTags] = useState(0);
  
  // Stats
  const [stats, setStats] = useState({
    total: 0,
    withDescription: 0,
    recentlyAdded: 0,
  });

  const { toast } = useToast();
  
  // Fetch tags from the paginated API
  const fetchTags = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        pageSize: pageSize.toString(),
        search: searchQuery,
        sortField,
        sortDirection,
      });
      const res = await fetch(`/api/tags?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch tags");
      const data = await res.json();
      setTags(data.tags);
      setTotalTags(data.total);
      setTotalPages(Math.max(1, Math.ceil(data.total / pageSize)));
      // Calculate stats (from all tags, so only if on first page and no search)
      if (currentPage === 1 && !searchQuery) {
        setStats({
          total: data.total,
          withDescription: data.tags.filter((t: Tag) => t.description && t.description.trim() !== "").length,
          recentlyAdded: data.tags.filter((t: Tag) => {
            const date = new Date(t.createdAt);
            const now = new Date();
            const daysDiff = Math.floor((now.getTime() - date.getTime()) / (1000 * 3600 * 24));
            return daysDiff <= 7;
          }).length,
        });
      }
    } catch (e: any) {
      setError(e.message || "Unknown error");
      toast({
        title: "Error",
        description: e.message || "Failed to fetch tags",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch tags whenever page, pageSize, search, sortField, or sortDirection changes
  useEffect(() => {
    fetchTags();
    // eslint-disable-next-line
  }, [currentPage, pageSize, searchQuery, sortField, sortDirection]);

  // Reset to first page when search or page size changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, pageSize]);

  // Toggle sort
  const toggleSort = (field: "name" | "createdAt" | "updatedAt") => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // Pagination controls
  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const goToFirstPage = () => goToPage(1);
  const goToPreviousPage = () => goToPage(currentPage - 1);
  const goToNextPage = () => goToPage(currentPage + 1);
  const goToLastPage = () => goToPage(totalPages);

  // Open dialog for add/edit
  const openDialog = (tag?: Tag) => {
    if (tag) {
      setEditTag(tag);
      setForm({ name: tag.name, description: tag.description || "" });
    } else {
      setEditTag(null);
      setForm({ name: "", description: "" });
    }
    setShowDialog(true);
  };

  // Handle form changes
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Add or update tag
  const handleSave = async () => {
    if (!form.name.trim()) {
      setError("Tag name is required");
      return;
    }
    
    setError(null);
    setProcessing(true);
    try {
      let res;
      if (editTag) {
        res = await fetch(`/api/tags/${editTag.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
      } else {
        res = await fetch("/api/tags", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
      }
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to save tag");
      }
      
      setShowDialog(false);
      toast({
        title: editTag ? "Tag Updated" : "Tag Created",
        description: editTag 
          ? `Tag "${form.name}" has been updated successfully.`
          : `Tag "${form.name}" has been created successfully.`,
        variant: "default"
      });
      fetchTags();
    } catch (e: any) {
      setError(e.message || "Unknown error");
    } finally {
      setProcessing(false);
    }
  };

  // Delete tag
  const handleDelete = async () => {
    if (!deletingTag) return;
    setError(null);
    setProcessing(true);
    try {
      const res = await fetch(`/api/tags/${deletingTag.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete tag");
      
      toast({
        title: "Tag Deleted",
        description: `Tag "${deletingTag.name}" has been deleted successfully.`,
        variant: "default"
      });
      
      setDeletingTag(null);
      fetchTags();
    } catch (e: any) {
      setError(e.message || "Unknown error");
      toast({
        title: "Error",
        description: e.message || "Failed to delete tag",
        variant: "destructive"
      });
    } finally {
      setProcessing(false);
    }
  };

  // Helper function to get tag card color based on name
  const getTagColor = (name: string) => {
    // Simple hash function to generate consistent colors
    const hash = name.split('').reduce((acc, char) => {
      return char.charCodeAt(0) + ((acc << 5) - acc);
    }, 0);
    
    // List of pleasing colors (darker shades for card backgrounds)
    const colors = [
      'from-blue-800/20 to-blue-900/20 border-blue-600/30',
      'from-purple-800/20 to-purple-900/20 border-purple-600/30',
      'from-green-800/20 to-green-900/20 border-green-600/30',
      'from-amber-800/20 to-amber-900/20 border-amber-600/30',
      'from-pink-800/20 to-pink-900/20 border-pink-600/30',
      'from-cyan-800/20 to-cyan-900/20 border-cyan-600/30',
      'from-indigo-800/20 to-indigo-900/20 border-indigo-600/30',
      'from-rose-800/20 to-rose-900/20 border-rose-600/30',
      'from-emerald-800/20 to-emerald-900/20 border-emerald-600/30',
      'from-violet-800/20 to-violet-900/20 border-violet-600/30',
    ];
    
    // Get a color based on the hash
    const colorIndex = Math.abs(hash) % colors.length;
    return colors[colorIndex];
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <TagIcon className="h-6 w-6 text-primary" /> Manage Tags
          </h1>
          <p className="text-muted-foreground text-sm mt-1">Create, edit, and delete tags for questions, articles, and assessments.</p>
        </div>
        <Button onClick={() => openDialog()} variant="default" className="gap-2">
          <Plus className="h-4 w-4" /> Add Tag
        </Button>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium text-muted-foreground">Total Tags</div>
              <Badge variant="secondary" className="text-sm">{stats.total}</Badge>
            </div>
            <div className="text-2xl font-bold mt-2">{stats.total}</div>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium text-muted-foreground">With Description</div>
              <Badge variant="secondary" className="text-sm">{stats.withDescription}</Badge>
            </div>
            <div className="text-2xl font-bold mt-2">{stats.withDescription}</div>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium text-muted-foreground">Added This Week</div>
              <Badge variant="secondary" className="text-sm">{stats.recentlyAdded}</Badge>
            </div>
            <div className="text-2xl font-bold mt-2">{stats.recentlyAdded}</div>
          </CardContent>
        </Card>
      </div>
      
      <Card className="shadow-md border-white/10">
        <CardHeader>
          <CardTitle>All Tags</CardTitle>
          <CardDescription>Tags are used to organize and filter content across the platform.</CardDescription>
          
          {/* Search and filters */}
          <div className="flex flex-col md:flex-row gap-4 mt-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search tags..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Select 
                value={sortField}
                onValueChange={(value) => setSortField(value as "name" | "createdAt" | "updatedAt")}
              >
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="createdAt">Created</SelectItem>
                  <SelectItem value="updatedAt">Updated</SelectItem>
                </SelectContent>
              </Select>
              
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => setSortDirection(sortDirection === "asc" ? "desc" : "asc")}
                className="h-9 w-9"
              >
                {sortDirection === "asc" ? "↑" : "↓"}
              </Button>
              
              <Button 
                variant="outline" 
                size="sm" 
                className="gap-2"
                onClick={() => {
                  setSearchQuery("");
                  setSortField("name");
                  setSortDirection("asc");
                }}
              >
                <Filter className="h-4 w-4" /> Reset
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="bg-destructive/10 text-destructive rounded p-3 mb-4 flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              <span>{error}</span>
            </div>
          )}
          
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <Card key={i} className="overflow-hidden">
                  <div className="p-4 space-y-3">
                    <Skeleton className="h-6 w-24" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <div className="flex justify-between items-center mt-4">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-8 w-16" />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : tags.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {searchQuery ? (
                <>
                  <div className="font-medium mb-2">No tags found matching "{searchQuery}"</div>
                  <Button variant="link" onClick={() => setSearchQuery("")}>Clear search</Button>
                </>
              ) : (
                <>
                  <div className="font-medium mb-2">No tags found</div>
                  <p>Create your first tag to get started</p>
                </>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {tags.map((tag) => (
                <Card 
                  key={tag.id} 
                  className={`overflow-hidden border hover:shadow-md transition-all duration-200 bg-gradient-to-br ${getTagColor(tag.name)}`}
                >
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="font-semibold text-lg">{tag.name}</h3>
                    </div>
                    <div className="min-h-[60px] mb-4">
                      {tag.description ? (
                        <p className="text-sm text-muted-foreground line-clamp-3">
                          {tag.description}
                        </p>
                      ) : (
                        <p className="text-sm text-muted-foreground/50 italic">
                          No description
                        </p>
                      )}
                    </div>
                    <div className="flex justify-end items-center pt-2 border-t border-white/10">
                      <div className="flex gap-1">
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="h-8 w-8 p-0 rounded-full"
                          onClick={() => openDialog(tag)}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="h-8 w-8 p-0 rounded-full text-destructive hover:text-destructive"
                          onClick={() => setDeletingTag(tag)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
        <CardFooter className="border-t pt-6 flex flex-col sm:flex-row gap-4 items-center">
          <div className="text-sm text-muted-foreground">
            {tags.length === 0 
              ? 'No tags found' 
              : `Showing ${(currentPage - 1) * pageSize + 1}-${Math.min(currentPage * pageSize, totalTags)} of ${totalTags} tags`}
          </div>
          
          {/* Page size selector */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Show</span>
            <Select 
              value={pageSize.toString()} 
              onValueChange={(value) => setPageSize(parseInt(value))}
            >
              <SelectTrigger className="w-16 h-8">
                <SelectValue placeholder="12" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="8">8</SelectItem>
                <SelectItem value="12">12</SelectItem>
                <SelectItem value="24">24</SelectItem>
                <SelectItem value="48">48</SelectItem>
              </SelectContent>
            </Select>
            <span className="text-sm text-muted-foreground">per page</span>
          </div>
          
          {/* Pagination buttons */}
          {tags.length > 0 && (
            <div className="flex gap-1 ml-auto">
              <Button
                variant="outline"
                size="icon"
                onClick={goToFirstPage}
                disabled={currentPage === 1}
                className="h-8 w-8"
              >
                <ChevronsLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={goToPreviousPage}
                disabled={currentPage === 1}
                className="h-8 w-8"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              
              <div className="flex items-center text-sm mx-2">
                <span>Page {currentPage} of {totalPages}</span>
              </div>
              
              <Button
                variant="outline"
                size="icon"
                onClick={goToNextPage}
                disabled={currentPage === totalPages}
                className="h-8 w-8"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={goToLastPage}
                disabled={currentPage === totalPages}
                className="h-8 w-8"
              >
                <ChevronsRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </CardFooter>
      </Card>

      {/* Add/Edit Tag Dialog */}
      <Dialog open={showDialog} onOpenChange={(open) => !processing && setShowDialog(open)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editTag ? "Edit Tag" : "Add Tag"}</DialogTitle>
            <DialogDescription>
              {editTag ? "Update the tag details." : "Create a new tag to help organize content."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Name <span className="text-red-500">*</span></label>
              <Input 
                name="name" 
                value={form.name} 
                onChange={handleFormChange} 
                placeholder="Tag name"
                disabled={processing}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <Textarea 
                name="description" 
                value={form.description} 
                onChange={handleFormChange} 
                placeholder="Tag description (optional)"
                disabled={processing}
                className="resize-none min-h-[100px]"
              />
              <div className="text-xs text-muted-foreground mt-1">
                Add a description to help users understand what this tag is for
              </div>
            </div>
          </div>
          {error && (
            <div className="bg-destructive/10 text-destructive rounded p-3 flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              <span>{error}</span>
            </div>
          )}
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowDialog(false)} 
              type="button"
              disabled={processing}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSave} 
              type="button"
              disabled={processing}
              className="gap-2"
            >
              {processing && <Loader2 className="h-4 w-4 animate-spin" />}
              {editTag ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deletingTag} onOpenChange={(open) => !processing && (open ? null : setDeletingTag(null))}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Tag</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the tag <span className="font-semibold">{deletingTag?.name}</span>? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {error && (
            <div className="bg-destructive/10 text-destructive rounded p-3 flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              <span>{error}</span>
            </div>
          )}
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setDeletingTag(null)} 
              type="button"
              disabled={processing}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDelete} 
              type="button"
              disabled={processing}
              className="gap-2"
            >
              {processing && <Loader2 className="h-4 w-4 animate-spin" />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 