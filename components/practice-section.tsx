"use client"

import { useEffect, useState } from "react"
import { ClipboardCheck, ChevronRight, Plus, Trash2 } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import DOMPurify from 'dompurify'
import { useSession } from "next-auth/react"

interface Assessment {
  id: string
  name: string
  title?: string
  description?: string
  createdAt: string
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

  return (
    <div className="h-[calc(100vh-12rem)]">
      <Card className="overflow-hidden border-0 shadow-md bg-[#121212] h-full">
        <CardContent className="p-6 h-full overflow-y-auto">
          <h2 className="text-xl font-bold mb-3">Assessments</h2>
          <p className="text-gray-400 text-sm mb-4">
            Test your understanding of {module.title.toLowerCase()} with these assessments.
          </p>

          {isAdmin && (
            <div className="mb-6 flex justify-end">
              <Button onClick={() => setAddModalOpen(true)}>
                <Plus className="h-4 w-4 mr-1" /> Add Assessment
              </Button>
            </div>
          )}

          {/* Add Assessment Modal */}
          <Dialog open={addModalOpen} onOpenChange={setAddModalOpen}>
            <DialogContent className="max-w-4xl w-full">
              <DialogHeader>
                <DialogTitle>Add Assessment to Module</DialogTitle>
              </DialogHeader>
              <div className="flex gap-6">
                {/* Sidebar: Folder tree */}
                <div className="w-56 border-r pr-4 overflow-y-auto max-h-[70vh]">
                  <div className="font-semibold mb-2">Folders</div>
                  <div className="space-y-1">
                    <button
                      className={`block w-full text-left px-2 py-1 rounded ${!selectedFolder ? "bg-primary/10 text-primary" : "hover:bg-muted/50"}`}
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
                    <div className="text-gray-400">Loading assessments...</div>
                  ) : modalError ? (
                    <div className="text-red-500">{modalError}</div>
                  ) : (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-2">
                        {modalAssessments.map(a => (
                          <Card key={a.id} className="bg-[#18181b] border-0 shadow-md">
                            <CardContent className="p-3 flex flex-col gap-2">
                              <div className="flex items-center gap-2">
                                <ClipboardCheck className="h-4 w-4 text-purple-400" />
                                <span className="font-medium text-white truncate">{a.title || a.name}</span>
                              </div>
                              {a.description && (
                                <div
                                  className="text-gray-400 text-xs line-clamp-2"
                                  dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(a.description) }}
                                />
                              )}
                              <Button
                                size="sm"
                                className="mt-2"
                                disabled={addingInModal === a.id || assessments.some(m => m.id === a.id)}
                                onClick={async () => {
                                  setAddingInModal(a.id)
                                  await handleAddAssessment(a.id)
                                  setAddingInModal(null)
                                }}
                              >
                                <Plus className="h-4 w-4 mr-1" /> Add
                              </Button>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                      {/* Pagination */}
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-xs text-muted-foreground">
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
              <DialogClose asChild>
                <Button variant="outline" className="absolute top-4 right-4">Close</Button>
              </DialogClose>
            </DialogContent>
          </Dialog>

          {loading ? (
            <div className="text-gray-400">Loading assessments...</div>
          ) : error ? (
            <div className="text-red-500">{error}</div>
          ) : (
            <>
              {assessments.length === 0 ? (
                <div className="text-gray-400">No assessments available for this module.</div>
              ) : (
                assessments.map((assessment) => {
                  const attempt = attempts[assessment.id];
                  const isInProgress = attempt && attempt.status === "in-progress";
                  return (
                    <Card key={assessment.id} className="overflow-hidden border-0 shadow-md bg-[#18181b]">
                      <CardContent className="p-4 flex flex-col h-full">
                        <div className="flex items-center gap-3 mb-2">
                          <ClipboardCheck className="h-5 w-5 text-purple-400" />
                          <span className="font-semibold text-base text-white truncate">{assessment.title || assessment.name}</span>
                        </div>
                        {assessment.description && (
                          <div
                            className="text-gray-400 text-xs mb-3 line-clamp-3"
                            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(assessment.description) }}
                          />
                        )}
                        <div className="flex gap-2 mt-auto">
                          <Button
                            className="w-full text-xs py-1 h-8 flex items-center justify-center gap-2"
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
                            {isInProgress ? "Resume Practice" : "Start Practice"} <ChevronRight className="h-3 w-3 text-gray-400" />
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
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
