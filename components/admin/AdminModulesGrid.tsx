import { useState } from "react"
import { ModuleCard } from "@/components/module-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Pencil, Trash2, Plus } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"

interface Module {
  id: string
  title: string
  description: string
  order: number
  status: string
  level: string
}

interface AdminModulesGridProps {
  courseId: string
  modules: Module[]
  onModuleUpdate: () => void
}

export function AdminModulesGrid({ courseId, modules, onModuleUpdate }: AdminModulesGridProps) {
  const { toast } = useToast()
  const router = useRouter()
  const [editingModuleId, setEditingModuleId] = useState<string | null>(null)
  const [editingTitle, setEditingTitle] = useState("")
  const [editingDescription, setEditingDescription] = useState("")
  const [isAdding, setIsAdding] = useState(false)
  const [newTitle, setNewTitle] = useState("")
  const [newDescription, setNewDescription] = useState("")
  const [deletingModuleId, setDeletingModuleId] = useState<string | null>(null)

  const handleEdit = (module: Module) => {
    setEditingModuleId(module.id)
    setEditingTitle(module.title)
    setEditingDescription(module.description)
  }

  const handleEditSave = async (moduleId: string) => {
    try {
      const response = await fetch(`/api/modules/${moduleId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: editingTitle, description: editingDescription }),
      })
      if (!response.ok) throw new Error("Failed to update module")
      toast({ title: "Success", description: "Module updated" })
      setEditingModuleId(null)
      onModuleUpdate()
    } catch (e) {
      toast({ title: "Error", description: "Could not update module", variant: "destructive" })
    }
  }

  const handleDelete = async (moduleId: string) => {
    try {
      const response = await fetch(`/api/modules/${moduleId}`, { method: "DELETE" })
      if (!response.ok) throw new Error("Failed to delete module")
      toast({ title: "Success", description: "Module deleted" })
      setDeletingModuleId(null)
      onModuleUpdate()
    } catch (e) {
      toast({ title: "Error", description: "Could not delete module", variant: "destructive" })
    }
  }

  const handleAdd = async () => {
    try {
      const response = await fetch("/api/modules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTitle,
          description: newDescription,
          courseId,
          order: modules.length,
        }),
      })
      if (!response.ok) throw new Error("Failed to add module")
      toast({ title: "Success", description: "Module added" })
      setIsAdding(false)
      setNewTitle("")
      setNewDescription("")
      onModuleUpdate()
    } catch (e) {
      toast({ title: "Error", description: "Could not add module", variant: "destructive" })
    }
  }

  return (
    <div className="mt-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Course Modules</h2>
        <Button onClick={() => setIsAdding(true)} size="sm" variant="outline">
          <Plus className="w-4 h-4 mr-1" /> Add Module
        </Button>
      </div>
      {isAdding && (
        <div className="mb-6 flex gap-2 items-end">
          <Input
            placeholder="Module title"
            value={newTitle ?? ""}
            onChange={e => setNewTitle(e.target.value)}
            className="w-1/4"
          />
          <Input
            placeholder="Module description"
            value={newDescription ?? ""}
            onChange={e => setNewDescription(e.target.value)}
            className="w-1/2"
          />
          <Button onClick={handleAdd} size="sm">Save</Button>
          <Button onClick={() => setIsAdding(false)} size="sm" variant="ghost">Cancel</Button>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {modules.map(module => (
          <div key={module.id} className="relative group">
            {editingModuleId === module.id ? (
              <div className="bg-card p-4 rounded shadow flex flex-col gap-2">
                <Input value={editingTitle ?? ""} onChange={e => setEditingTitle(e.target.value)} className="mb-2" />
                <Input value={editingDescription ?? ""} onChange={e => setEditingDescription(e.target.value)} className="mb-2" />
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => handleEditSave(module.id)}>Save</Button>
                  <Button size="sm" variant="ghost" onClick={() => setEditingModuleId(null)}>Cancel</Button>
                </div>
              </div>
            ) : (
              <>
                <ModuleCard module={{ ...module, status: "Completed" }} onClick={() => router.push(`/admin/courses/${courseId}/${module.id}`)} />
                <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button size="icon" variant="ghost" onClick={() => handleEdit(module)}><Pencil className="w-4 h-4" /></Button>
                  <Button size="icon" variant="ghost" onClick={() => setDeletingModuleId(module.id)}><Trash2 className="w-4 h-4" /></Button>
                </div>
                {deletingModuleId === module.id && (
                  <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center z-10 rounded">
                    <div className="bg-card p-4 rounded shadow">
                      <p>Delete this module?</p>
                      <div className="flex gap-2 mt-2">
                        <Button size="sm" variant="destructive" onClick={() => handleDelete(module.id)}>Delete</Button>
                        <Button size="sm" variant="ghost" onClick={() => setDeletingModuleId(null)}>Cancel</Button>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  )
} 