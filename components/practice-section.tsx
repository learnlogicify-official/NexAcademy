"use client"

import { useEffect, useState } from "react"
import { 
  ClipboardCheck, 
  ChevronRight, 
  Plus, 
  Trash2, 
  Search, 
  Filter, 
  Clock, 
  FileText, 
  Award,
  CheckCircle,
  Upload,
  CalendarClock,
  Tag,
  BarChart2,
  LayoutGrid,
  ArrowUpDown,
  CheckSquare
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"
import DOMPurify from 'dompurify'
import { useSession } from "next-auth/react"
import { format } from "date-fns"

interface Assessment {
  id: string
  name: string
  title?: string
  description?: string
  status: string
  createdAt: string
  totalMarks: number
  passingMarks: number
  duration?: number
  tags?: { tag: { name: string, id: string } }[]
  sections?: Section[]
  createdBy?: { name: string }
}

interface Section {
  id: string
  title: string
  questions: any[]
}

interface PracticeSectionProps {
  module: {
    id: string
    title: string
  }
  onNavigateToAssessment?: (assessmentId: string) => void
  isAdmin?: boolean
}

export function PracticeSection({ module, onNavigateToAssessment, isAdmin }: PracticeSectionProps) {
  const [assessments, setAssessments] = useState<Assessment[]>([])
  const [allAssessments, setAllAssessments] = useState<Assessment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [adding, setAdding] = useState<string | null>(null)
  const [removing, setRemoving] = useState<string | null>(null)
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [modalLoading, setModalLoading] = useState(false)
  const [modalError, setModalError] = useState<string | null>(null)
  const [folders, setFolders] = useState<any[]>([])
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<string>("")
  const [search, setSearch] = useState("")
  const [modalPage, setModalPage] = useState(1)
  const [modalPageSize] = useState(12)
  const [modalAssessments, setModalAssessments] = useState<any[]>([])
  const [modalPagination, setModalPagination] = useState<any>({ total: 0, page: 1, pageSize: 12, totalPages: 1 })
  const [addingInModal, setAddingInModal] = useState<string | null>(null)
  const { data: session } = useSession();
  const userId = session?.user?.id;
  const [attempts, setAttempts] = useState<Record<string, any>>({});
  
  // New state variables for enhanced features
  const [activeTab, setActiveTab] = useState("all")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [sortBy, setSortBy] = useState<string>("createdAt")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
  
  useEffect(() => {
    async function fetchAssessments() {
      setLoading(true)
      setError(null)
      try {
        const [res, allRes] = await Promise.all([
          fetch(`/api/modules/${module.id}/assessments`),
          fetch(`/api/assessments`)
        ])
        if (!res.ok || !allRes.ok) throw new Error("Failed to fetch assessments")
        const data = await res.json()
        const all = await allRes.json()
        setAssessments(data)
        setAllAssessments(all)
      } catch (e) {
        setError("Could not load assessments")
      } finally {
        setLoading(false)
      }
    }
    if (module.id) fetchAssessments()
  }, [module.id])

  useEffect(() => {
    async function fetchAttempts() {
      if (!userId || assessments.length === 0) return;
      try {
        const res = await fetch('/api/attempts/bulk', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId,
            assessmentIds: assessments.map(a => a.id),
          }),
        });
        if (!res.ok) throw new Error('Failed to fetch attempts');
        const data = await res.json();
        setAttempts(data || {});
      } catch (e) {
        // ignore
      }
    }
    fetchAttempts();
  }, [userId, assessments]);

  // Fetch folders for modal
  useEffect(() => {
    if (!addModalOpen) return
    fetch("/api/folders")
      .then(res => res.json())
      .then(setFolders)
      .catch(() => setFolders([]))
  }, [addModalOpen])

  // Fetch assessments for modal
  useEffect(() => {
    if (!addModalOpen) return
    setModalLoading(true)
    setModalError(null)
    const params = new URLSearchParams()
    if (selectedFolder) params.append("folderId", selectedFolder)
    if (statusFilter && statusFilter !== "ALL") params.append("status", statusFilter)
    if (search) params.append("search", search)
    params.append("page", String(modalPage))
    params.append("pageSize", String(modalPageSize))
    fetch(`/api/assessments?${params.toString()}`)
      .then(res => res.json())
      .then(data => {
        setModalAssessments(data.assessments)
        setModalPagination(data.pagination)
      })
      .catch(() => setModalError("Could not load assessments"))
      .finally(() => setModalLoading(false))
  }, [addModalOpen, selectedFolder, statusFilter, search, modalPage, modalPageSize])

  async function handleAddAssessment(assessmentId: string) {
    setAdding(assessmentId)
    try {
      const res = await fetch(`/api/modules/${module.id}/assessments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assessmentId })
      })
      if (!res.ok) throw new Error("Failed to add assessment")
      const updated = await res.json()
      setAssessments(updated.assessments || updated)
    } catch (e) {
      setError("Could not add assessment")
    } finally {
      setAdding(null)
    }
  }

  async function handleRemoveAssessment(assessmentId: string) {
    setRemoving(assessmentId)
    try {
      const res = await fetch(`/api/modules/${module.id}/assessments`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assessmentId })
      })
      if (!res.ok) throw new Error("Failed to remove assessment")
      const updated = await res.json()
      setAssessments(updated.assessments || updated)
    } catch (e) {
      setError("Could not remove assessment")
    } finally {
      setRemoving(null)
    }
  }

  function FolderTree({ folders, selectedFolder, setSelectedFolder, level = 0 }: { folders: any[]; selectedFolder: string | null; setSelectedFolder: (id: string | null) => void; level?: number }) {
    return (
      <div>
        {folders.map(folder => (
          <div key={folder.id}>
            <button
              className={`block w-full text-left px-2 py-1 rounded ${selectedFolder === folder.id ? "bg-primary/10 text-primary" : "hover:bg-muted/50"}`}
              style={{ paddingLeft: 8 + level * 16 }}
              onClick={() => setSelectedFolder(folder.id)}
            >
              {folder.name}
            </button>
            {folder.subfolders && folder.subfolders.length > 0 && (
              <FolderTree folders={folder.subfolders} selectedFolder={selectedFolder} setSelectedFolder={setSelectedFolder} level={level + 1} />
            )}
          </div>
        ))}
      </div>
    )
  }
  
  // Get assessment statistics
  const getAssessmentStats = () => {
    if (!assessments.length) return { total: 0, published: 0, draft: 0, ready: 0, archived: 0 };
    
    return {
      total: assessments.length,
      published: assessments.filter(a => a.status === "PUBLISHED").length,
      draft: assessments.filter(a => a.status === "DRAFT").length,
      ready: assessments.filter(a => a.status === "READY").length,
      archived: assessments.filter(a => a.status === "ARCHIVED").length
    };
  }
  
  // Filter assessments based on active tab
  const filteredAssessments = assessments.filter(assessment => {
    if (activeTab === "all") return true;
    return assessment.status.toLowerCase() === activeTab.toLowerCase();
  });
  
  // Sort filtered assessments
  const sortedAssessments = [...filteredAssessments].sort((a, b) => {
    let valueA: any, valueB: any;
    
    // Extract the sorting values based on sortBy
    switch (sortBy) {
      case "name":
        valueA = a.name || a.title || "";
        valueB = b.name || b.title || "";
        break;
      case "createdAt":
        valueA = new Date(a.createdAt).getTime();
        valueB = new Date(b.createdAt).getTime();
        break;
      case "totalMarks":
        valueA = a.totalMarks || 0;
        valueB = b.totalMarks || 0;
        break;
      case "duration":
        valueA = a.duration || 0;
        valueB = b.duration || 0;
        break;
      default:
        valueA = new Date(a.createdAt).getTime();
        valueB = new Date(b.createdAt).getTime();
    }
    
    // Apply sort order
    if (sortOrder === "asc") {
      return typeof valueA === 'string' ? valueA.localeCompare(String(valueB)) : valueA - valueB;
    } else {
      return typeof valueA === 'string' ? String(valueB).localeCompare(valueA) : valueB - valueA;
    }
  });
  
  // Get assessment difficulty level based on passing percentage
  const getAssessmentDifficulty = (assessment: Assessment) => {
    if (!assessment.totalMarks || !assessment.passingMarks) return "medium";
    
    const passingPercentage = (assessment.passingMarks / assessment.totalMarks) * 100;
    if (passingPercentage < 60) return "hard";
    if (passingPercentage > 80) return "easy";
    return "medium";
  }
  
  // Format duration from minutes to hours and minutes
  const formatDuration = (minutes?: number) => {
    if (!minutes) return "No time limit";
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins > 0 ? `${mins}m` : ''}`;
  }
  
  // Get status badge color based on status
  const getStatusColor = (status: string) => {
    switch(status.toUpperCase()) {
      case "PUBLISHED": return "bg-green-500/10 text-green-400";
      case "DRAFT": return "bg-yellow-500/10 text-yellow-400";
      case "READY": return "bg-blue-500/10 text-blue-400";
      case "ARCHIVED": return "bg-gray-500/10 text-gray-400";
      default: return "bg-gray-500/10 text-gray-400";
    }
  }
  
  const stats = getAssessmentStats();
  
  // Input component with prefix
  const InputWithPrefix = ({ prefix, ...props }: { prefix: React.ReactNode } & React.InputHTMLAttributes<HTMLInputElement>) => (
    <div className="relative">
      <div className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400">
        {prefix}
      </div>
      <Input {...props} className={cn("pl-8", props.className)} />
    </div>
  );

  return (
    <div className="w-full h-full flex flex-col gap-6 p-4">
      {/* Stats cards section */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-zinc-900 to-zinc-800 shadow-md border-white/10">
          <CardContent className="p-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-zinc-400">Total Assessments</p>
                <p className="text-3xl font-bold mt-1">{stats.total}</p>
              </div>
              <div className="p-3 bg-indigo-500/10 rounded-lg">
                <ClipboardCheck className="h-6 w-6 text-indigo-500" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-zinc-900 to-zinc-800 shadow-md border-white/10">
          <CardContent className="p-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-zinc-400">Published</p>
                <p className="text-3xl font-bold mt-1">{stats.published}</p>
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
                <p className="text-sm text-zinc-400">Ready</p>
                <p className="text-3xl font-bold mt-1">{stats.ready}</p>
              </div>
              <div className="p-3 bg-blue-500/10 rounded-lg">
                <CheckSquare className="h-6 w-6 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-zinc-900 to-zinc-800 shadow-md border-white/10">
          <CardContent className="p-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-zinc-400">Draft</p>
                <p className="text-3xl font-bold mt-1">{stats.draft}</p>
              </div>
              <div className="p-3 bg-yellow-500/10 rounded-lg">
                <Upload className="h-6 w-6 text-yellow-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Main content area */}
      <Card className="flex-1 border-white/10 shadow-md bg-gradient-to-br from-zinc-900 to-zinc-800 overflow-hidden">
        <CardHeader className="px-6 py-4 border-b border-white/10 flex flex-row justify-between items-center space-y-0">
          <div>
            <CardTitle className="text-xl font-bold">Practice Assessments</CardTitle>
            <CardDescription className="text-zinc-400">
              Test your understanding of {module.title.toLowerCase()} with these assessments.
            </CardDescription>
          </div>
          
          {isAdmin && (
            <Button onClick={() => setAddModalOpen(true)} className="bg-indigo-600 hover:bg-indigo-700">
              <Plus className="h-4 w-4 mr-1" /> Add Assessment
            </Button>
          )}
        </CardHeader>
        
        <CardContent className="p-6">
          {/* Filters and view options */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full sm:w-auto">
              <TabsList className="bg-zinc-800/50">
                <TabsTrigger value="all" className="text-xs">All ({stats.total})</TabsTrigger>
                <TabsTrigger value="published" className="text-xs">Published ({stats.published})</TabsTrigger>
                <TabsTrigger value="ready" className="text-xs">Ready ({stats.ready})</TabsTrigger>
                <TabsTrigger value="draft" className="text-xs">Draft ({stats.draft})</TabsTrigger>
              </TabsList>
            </Tabs>
            
            <div className="flex gap-2 w-full sm:w-auto">
              <div className="relative h-9 w-full sm:w-auto max-w-xs">
                <Input
                  placeholder="Search assessments..."
                  className="h-9 w-full pl-8"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-500 pointer-events-none">
                  <Search className="h-4 w-4" />
                </div>
              </div>
              
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="h-9 w-[130px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="createdAt">Created</SelectItem>
                  <SelectItem value="totalMarks">Total Marks</SelectItem>
                  <SelectItem value="duration">Duration</SelectItem>
                </SelectContent>
              </Select>
              
              <Button 
                variant="outline" 
                size="sm" 
                className="h-9 px-2"
                onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
              >
                <ArrowUpDown className="h-4 w-4" />
              </Button>
              
              <Button 
                variant="outline" 
                size="sm" 
                className={cn("h-9 px-2", viewMode === "grid" ? "bg-zinc-800" : "")}
                onClick={() => setViewMode("grid")}
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
              
              <Button 
                variant="outline" 
                size="sm" 
                className={cn("h-9 px-2", viewMode === "list" ? "bg-zinc-800" : "")}
                onClick={() => setViewMode("list")}
              >
                <FileText className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {/* Display assessments */}
          {loading ? (
            <div className="flex items-center justify-center h-40">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
              <span className="ml-3 text-zinc-400">Loading assessments...</span>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-40 text-red-500">
              <span>{error}</span>
            </div>
          ) : sortedAssessments.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-60 text-zinc-400">
              <ClipboardCheck className="h-12 w-12 mb-4 opacity-20" />
              <p className="text-lg font-medium mb-2">No assessments available</p>
              <p className="text-sm text-center max-w-md mb-4">
                {activeTab !== "all" 
                  ? `There are no ${activeTab} assessments in this module.` 
                  : "There are no assessments available for this module yet."}
              </p>
              {isAdmin && (
                <Button onClick={() => setAddModalOpen(true)}>
                  <Plus className="h-4 w-4 mr-1" /> Add Assessment
                </Button>
              )}
            </div>
          ) : (
            <div className={viewMode === "grid" 
              ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" 
              : "flex flex-col gap-3"
            }>
              {sortedAssessments.map((assessment) => {
                const attempt = attempts[assessment.id];
                const isInProgress = attempt && attempt.status === "in-progress";
                const difficulty = getAssessmentDifficulty(assessment);
                
                if (viewMode === "grid") {
                  return (
                    <Card key={assessment.id} className="overflow-hidden border border-white/10 bg-zinc-800/50 hover:bg-zinc-800/80 transition-colors">
                      <CardContent className="p-0">
                        <div className="border-b border-white/10 py-3 px-4 flex justify-between items-center">
                          <div className="flex items-center">
                            <div className="bg-indigo-900/30 rounded-md p-2 mr-3">
                              <ClipboardCheck className="h-5 w-5 text-indigo-400" />
                            </div>
                            <div>
                              <h3 className="font-medium text-sm line-clamp-1">
                                {assessment.title || assessment.name}
                              </h3>
                              <div className="flex items-center mt-1 gap-1.5">
                                <Badge className={getStatusColor(assessment.status)}>
                                  {assessment.status}
                                </Badge>
                                <Badge variant="outline" className="border-zinc-700 text-zinc-400 text-[10px]">
                                  {assessment.totalMarks} marks
                                </Badge>
                                {assessment.duration && (
                                  <Badge variant="outline" className="border-zinc-700 text-zinc-400 text-[10px]">
                                    <Clock className="h-2.5 w-2.5 mr-1" />
                                    {formatDuration(assessment.duration)}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className={cn(
                                  "h-2 w-2 rounded-full", 
                                  difficulty === "easy" ? "bg-green-500" : 
                                  difficulty === "medium" ? "bg-yellow-500" : 
                                  "bg-red-500"
                                )} />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{difficulty.charAt(0).toUpperCase() + difficulty.slice(1)} difficulty</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                        
                        <div className="p-4">
                          {assessment.description && (
                            <div 
                              className="text-zinc-400 text-xs mb-4 line-clamp-2"
                              dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(assessment.description) }}
                            />
                          )}
                          
                          {assessment.tags && assessment.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-4">
                              {assessment.tags.map(tagRel => (
                                <Badge key={tagRel.tag.id} variant="outline" className="text-[10px] border-zinc-700 text-zinc-400">
                                  {tagRel.tag.name}
                                </Badge>
                              ))}
                            </div>
                          )}
                          
                          <div className="flex justify-between mt-4">
                            <Button
                              className="text-xs bg-indigo-600 hover:bg-indigo-700 py-1 h-8 flex-1"
                              onClick={() => {
                                let url = isInProgress
                                  ? `/assessment/${assessment.id}/test?attemptId=${attempt.id}`
                                  : `/assessment/${assessment.id}/intro`;
                                const win = window.open(url, '_blank', 'toolbar=0,location=0,menubar=0,width=' + screen.width + ',height=' + screen.height);
                                if (win) {
                                  win.moveTo(0, 0);
                                  win.resizeTo(screen.width, screen.height);
                                  win.focus();
                                } else {
                                  window.location.assign(url);
                                }
                              }}
                            >
                              {isInProgress ? "Resume Practice" : "Start Practice"} <ChevronRight className="h-3 w-3 ml-1" />
                            </Button>
                            
                            {isAdmin && (
                              <Button
                                variant="destructive"
                                size="icon"
                                className="h-8 w-8 ml-2"
                                disabled={removing === assessment.id}
                                onClick={() => handleRemoveAssessment(assessment.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                } else {
                  // List view
                  return (
                    <Card key={assessment.id} className="overflow-hidden border border-white/10 bg-zinc-800/50 hover:bg-zinc-800/80 transition-colors">
                      <CardContent className="p-4 flex">
                        <div className="bg-indigo-900/30 rounded-md p-3 h-fit mr-4">
                          <ClipboardCheck className="h-6 w-6 text-indigo-400" />
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex justify-between">
                            <div>
                              <h3 className="font-medium text-sm flex items-center">
                                {assessment.title || assessment.name}
                                <Badge className={cn("ml-2", getStatusColor(assessment.status))}>
                                  {assessment.status}
                                </Badge>
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <div className={cn(
                                        "h-2 w-2 rounded-full ml-2", 
                                        difficulty === "easy" ? "bg-green-500" : 
                                        difficulty === "medium" ? "bg-yellow-500" : 
                                        "bg-red-500"
                                      )} />
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>{difficulty.charAt(0).toUpperCase() + difficulty.slice(1)} difficulty</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              </h3>
                              
                              <div className="flex items-center mt-1 gap-1.5">
                                <Badge variant="outline" className="border-zinc-700 text-zinc-400 text-[10px]">
                                  {assessment.totalMarks} marks
                                </Badge>
                                {assessment.duration && (
                                  <Badge variant="outline" className="border-zinc-700 text-zinc-400 text-[10px]">
                                    <Clock className="h-2.5 w-2.5 mr-1" />
                                    {formatDuration(assessment.duration)}
                                  </Badge>
                                )}
                                {assessment.createdBy?.name && (
                                  <span className="text-[10px] text-zinc-500">
                                    by {assessment.createdBy.name}
                                  </span>
                                )}
                              </div>
                            </div>
                            
                            <div className="flex items-start gap-2">
                              <Button
                                className="text-xs bg-indigo-600 hover:bg-indigo-700 py-1 h-8"
                                onClick={() => {
                                  let url = isInProgress
                                    ? `/assessment/${assessment.id}/test?attemptId=${attempt.id}`
                                    : `/assessment/${assessment.id}/intro`;
                                  const win = window.open(url, '_blank', 'toolbar=0,location=0,menubar=0,width=' + screen.width + ',height=' + screen.height);
                                  if (win) {
                                    win.moveTo(0, 0);
                                    win.resizeTo(screen.width, screen.height);
                                    win.focus();
                                  } else {
                                    window.location.assign(url);
                                  }
                                }}
                              >
                                {isInProgress ? "Resume" : "Start"} <ChevronRight className="h-3 w-3 ml-1" />
                              </Button>
                              
                              {isAdmin && (
                                <Button
                                  variant="destructive"
                                  size="icon"
                                  className="h-8 w-8"
                                  disabled={removing === assessment.id}
                                  onClick={() => handleRemoveAssessment(assessment.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </div>
                          
                          {assessment.description && (
                            <div 
                              className="text-zinc-400 text-xs mt-2"
                              dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(assessment.description) }}
                            />
                          )}
                          
                          {assessment.tags && assessment.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {assessment.tags.map(tagRel => (
                                <Badge key={tagRel.tag.id} variant="outline" className="text-[10px] border-zinc-700 text-zinc-400">
                                  {tagRel.tag.name}
                                </Badge>
                              ))}
                            </div>
                          )}
                          
                          {assessment.sections && (
                            <div className="mt-2 text-xs text-zinc-500">
                              {assessment.sections.length} sections
                              {assessment.sections.some(s => s.questions) && 
                                `, ${assessment.sections.reduce((acc: number, section) => {
                                  return acc + (section.questions ? section.questions.length : 0);
                                }, 0)} questions`
                              }
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                }
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Assessment Modal */}
      <Dialog open={addModalOpen} onOpenChange={setAddModalOpen}>
        <DialogContent className="max-w-4xl w-full bg-zinc-900 border border-white/10">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Add Assessment to Module</DialogTitle>
          </DialogHeader>
          <div className="flex gap-6">
            {/* Sidebar: Folder tree */}
            <div className="w-56 border-r border-white/10 pr-4 overflow-y-auto max-h-[70vh]">
              <div className="font-semibold mb-2">Folders</div>
              <div className="space-y-1">
                <button
                  className={`block w-full text-left px-2 py-1 rounded ${!selectedFolder ? "bg-indigo-600/20 text-indigo-400" : "hover:bg-zinc-800"}`}
                  onClick={() => setSelectedFolder(null)}
                >
                  All Folders
                </button>
                <FolderTree folders={folders} selectedFolder={selectedFolder} setSelectedFolder={setSelectedFolder} />
              </div>
            </div>
            {/* Main: Filters and list */}
            <div className="flex-1 flex flex-col gap-4">
              <div className="flex gap-2 items-center mb-2">
                <Input
                  placeholder="Search assessments..."
                  value={search}
                  onChange={e => { setSearch(e.target.value); setModalPage(1); }}
                  className="w-64"
                />
                <Select value={statusFilter} onValueChange={v => { setStatusFilter(v); setModalPage(1); }}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Statuses</SelectItem>
                    <SelectItem value="DRAFT">Draft</SelectItem>
                    <SelectItem value="READY">Ready</SelectItem>
                    <SelectItem value="PUBLISHED">Published</SelectItem>
                    <SelectItem value="ARCHIVED">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {modalLoading ? (
                <div className="flex items-center justify-center h-40">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
                  <span className="ml-3 text-zinc-400">Loading assessments...</span>
                </div>
              ) : modalError ? (
                <div className="flex items-center justify-center h-40 text-red-500">
                  <span>{modalError}</span>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-2">
                    {modalAssessments.map(a => (
                      <Card key={a.id} className="bg-zinc-800 border border-white/10">
                        <CardContent className="p-3 flex flex-col gap-2">
                          <div className="flex items-center gap-2">
                            <ClipboardCheck className="h-4 w-4 text-indigo-400" />
                            <span className="font-medium text-white truncate">{a.title || a.name}</span>
                            <Badge className={getStatusColor(a.status)}>
                              {a.status}
                            </Badge>
                          </div>
                          {a.description && (
                            <div
                              className="text-zinc-400 text-xs line-clamp-2"
                              dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(a.description) }}
                            />
                          )}
                          <div className="flex justify-between items-center mt-1">
                            <div className="flex gap-1">
                              <Badge variant="outline" className="text-[10px] border-zinc-700 text-zinc-400">
                                {a.totalMarks} marks
                              </Badge>
                              {a.duration && (
                                <Badge variant="outline" className="text-[10px] border-zinc-700 text-zinc-400">
                                  <Clock className="h-2.5 w-2.5 mr-1" />
                                  {formatDuration(a.duration)}
                                </Badge>
                              )}
                            </div>
                            <Button
                              size="sm"
                              className="text-xs bg-indigo-600 hover:bg-indigo-700"
                              disabled={addingInModal === a.id || assessments.some(m => m.id === a.id)}
                              onClick={async () => {
                                setAddingInModal(a.id);
                                await handleAddAssessment(a.id);
                                setAddingInModal(null);
                              }}
                            >
                              {addingInModal === a.id ? (
                                <>
                                  <div className="animate-spin rounded-full h-3 w-3 border-t-2 border-b-2 border-white mr-1"></div>
                                  Adding...
                                </>
                              ) : assessments.some(m => m.id === a.id) ? (
                                <>Already Added</>
                              ) : (
                                <>
                                  <Plus className="h-3 w-3 mr-1" /> Add
                                </>
                              )}
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                  {/* Pagination */}
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-xs text-zinc-500">
                      Page {modalPagination.page} of {modalPagination.totalPages} ({modalPagination.total} total)
                    </span>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={modalPagination.page <= 1}
                        onClick={() => setModalPage(p => Math.max(1, p - 1))}
                      >
                        Previous
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={modalPagination.page >= modalPagination.totalPages}
                        onClick={() => setModalPage(p => Math.min(modalPagination.totalPages, p + 1))}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddModalOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
