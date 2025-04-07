"use client";

import { useState } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { Button } from "@/components/ui/button";
import { Plus, GripVertical, Pencil, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";

interface Module {
  id: string;
  title: string;
  order: number;
  submodules: Submodule[];
}

interface Submodule {
  id: string;
  title: string;
  order: number;
  moduleId: string;
}

interface ModuleListProps {
  modules: Module[];
  onModuleUpdate: () => void;
  onSubmoduleUpdate: () => void;
}

export function ModuleList({ modules, onModuleUpdate, onSubmoduleUpdate }: ModuleListProps) {
  const [editingModule, setEditingModule] = useState<string | null>(null);
  const [editingSubmodule, setEditingSubmodule] = useState<string | null>(null);
  const [moduleTitle, setModuleTitle] = useState("");
  const [submoduleTitle, setSubmoduleTitle] = useState("");
  const { toast } = useToast();

  const handleDragEnd = async (result: any) => {
    if (!result.destination) return;

    const items = Array.from(modules);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Update order in the database
    try {
      const response = await fetch("/api/modules/reorder", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          modules: items.map((module, index) => ({
            id: module.id,
            order: index,
          })),
        }),
      });

      if (!response.ok) throw new Error("Failed to update module order");
      onModuleUpdate();
    } catch (error) {
      console.error("Error updating module order:", error);
      toast({
        title: "Error",
        description: "Failed to update module order",
        variant: "destructive",
      });
    }
  };

  const handleModuleTitleChange = async (moduleId: string, newTitle: string) => {
    try {
      const response = await fetch(`/api/modules/${moduleId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title: newTitle }),
      });

      if (!response.ok) throw new Error("Failed to update module title");
      onModuleUpdate();
      setEditingModule(null);
    } catch (error) {
      console.error("Error updating module title:", error);
      toast({
        title: "Error",
        description: "Failed to update module title",
        variant: "destructive",
      });
    }
  };

  const handleSubmoduleTitleChange = async (submoduleId: string, newTitle: string) => {
    try {
      const response = await fetch(`/api/submodules/${submoduleId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title: newTitle }),
      });

      if (!response.ok) throw new Error("Failed to update submodule title");
      onSubmoduleUpdate();
      setEditingSubmodule(null);
    } catch (error) {
      console.error("Error updating submodule title:", error);
      toast({
        title: "Error",
        description: "Failed to update submodule title",
        variant: "destructive",
      });
    }
  };

  const handleAddSubmodule = async (moduleId: string) => {
    try {
      const response = await fetch("/api/submodules", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: "New Submodule",
          moduleId,
          order: modules.find((m) => m.id === moduleId)?.submodules.length || 0,
        }),
      });

      if (!response.ok) throw new Error("Failed to create submodule");
      onSubmoduleUpdate();
    } catch (error) {
      console.error("Error creating submodule:", error);
      toast({
        title: "Error",
        description: "Failed to create submodule",
        variant: "destructive",
      });
    }
  };

  const handleDeleteModule = async (moduleId: string) => {
    try {
      const response = await fetch(`/api/modules/${moduleId}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete module");
      onModuleUpdate();
    } catch (error) {
      console.error("Error deleting module:", error);
      toast({
        title: "Error",
        description: "Failed to delete module",
        variant: "destructive",
      });
    }
  };

  const handleDeleteSubmodule = async (submoduleId: string) => {
    try {
      const response = await fetch(`/api/submodules/${submoduleId}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete submodule");
      onSubmoduleUpdate();
    } catch (error) {
      console.error("Error deleting submodule:", error);
      toast({
        title: "Error",
        description: "Failed to delete submodule",
        variant: "destructive",
      });
    }
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Droppable droppableId="modules">
        {(provided) => (
          <div
            {...provided.droppableProps}
            ref={provided.innerRef}
            className="space-y-4"
          >
            {modules.map((module, index) => (
              <Draggable key={module.id} draggableId={module.id} index={index}>
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    className="border rounded-lg p-4 bg-white"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div {...provided.dragHandleProps}>
                          <GripVertical className="h-5 w-5 text-gray-400" />
                        </div>
                        {editingModule === module.id ? (
                          <Input
                            value={moduleTitle}
                            onChange={(e) => setModuleTitle(e.target.value)}
                            onBlur={() => handleModuleTitleChange(module.id, moduleTitle)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                handleModuleTitleChange(module.id, moduleTitle);
                              }
                            }}
                            autoFocus
                          />
                        ) : (
                          <h3
                            className="text-lg font-medium cursor-pointer"
                            onClick={() => {
                              setModuleTitle(module.title);
                              setEditingModule(module.id);
                            }}
                          >
                            {module.title}
                          </h3>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleAddSubmodule(module.id)}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add Submodule
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteModule(module.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="pl-8 space-y-2">
                      {module.submodules.map((submodule) => (
                        <div
                          key={submodule.id}
                          className="flex items-center justify-between p-2 border rounded bg-gray-50"
                        >
                          {editingSubmodule === submodule.id ? (
                            <Input
                              value={submoduleTitle}
                              onChange={(e) => setSubmoduleTitle(e.target.value)}
                              onBlur={() =>
                                handleSubmoduleTitleChange(submodule.id, submoduleTitle)
                              }
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  handleSubmoduleTitleChange(submodule.id, submoduleTitle);
                                }
                              }}
                              autoFocus
                            />
                          ) : (
                            <span
                              className="cursor-pointer"
                              onClick={() => {
                                setSubmoduleTitle(submodule.title);
                                setEditingSubmodule(submodule.id);
                              }}
                            >
                              {submodule.title}
                            </span>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteSubmodule(submodule.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
} 