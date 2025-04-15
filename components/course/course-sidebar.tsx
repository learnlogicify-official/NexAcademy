import React, { useState } from "react";
import { ChevronRight, Plus, Pencil, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";

export function CourseSidebar({ course, currentModuleId, currentSubmoduleId }: CourseSidebarProps) {
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());
  const [expandedSubmodules, setExpandedSubmodules] = useState<Set<string>>(new Set());
  const [expandedQuestions, setExpandedQuestions] = useState<Set<string>>(new Set());
  const [isAddingQuestion, setIsAddingQuestion] = useState(false);
  const [newQuestion, setNewQuestion] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const toggleModule = (moduleId: string) => {
    const newExpanded = new Set(expandedModules);
    if (newExpanded.has(moduleId)) {
      newExpanded.delete(moduleId);
    } else {
      newExpanded.add(moduleId);
    }
    setExpandedModules(newExpanded);
  };

  const toggleSubmodule = (submoduleId: string) => {
    const newExpanded = new Set(expandedSubmodules);
    if (newExpanded.has(submoduleId)) {
      newExpanded.delete(submoduleId);
    } else {
      newExpanded.add(submoduleId);
    }
    setExpandedSubmodules(newExpanded);
  };

  const toggleQuestions = (submoduleId: string) => {
    const newExpanded = new Set(expandedQuestions);
    if (newExpanded.has(submoduleId)) {
      newExpanded.delete(submoduleId);
    } else {
      newExpanded.add(submoduleId);
    }
    setExpandedQuestions(newExpanded);
  };

  const handleAddQuestion = async (submoduleId: string) => {
    if (!newQuestion.trim()) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/submodules/${submoduleId}/questions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question: newQuestion.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to add question");
      }

      toast({
        title: "Success",
        description: "Question added successfully",
      });

      setNewQuestion("");
      setIsAddingQuestion(false);
      // Refresh the course data to show the new question
      window.location.reload();
    } catch (error) {
      console.error("Error adding question:", error);
      toast({
        title: "Error",
        description: "Failed to add question",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-80 border-r h-full flex flex-col">
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold">{course.title}</h2>
        <p className="text-sm text-muted-foreground">{course.subtitle}</p>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-4">
          <div>
            <h3 className="text-sm font-medium mb-2">Content</h3>
            <div className="space-y-1">
              {course.modules.map((module) => (
                <div key={module.id} className="space-y-1">
                  <button
                    onClick={() => toggleModule(module.id)}
                    className={cn(
                      "w-full flex items-center gap-2 p-2 rounded-lg text-sm",
                      currentModuleId === module.id
                        ? "bg-primary/10 text-primary"
                        : "hover:bg-muted"
                    )}
                  >
                    <ChevronRight
                      className={cn(
                        "h-4 w-4 transition-transform",
                        expandedModules.has(module.id) && "rotate-90"
                      )}
                    />
                    <span className="flex-1 text-left">{module.title}</span>
                  </button>

                  {expandedModules.has(module.id) && (
                    <div className="pl-4 space-y-1">
                      {module.submodules.map((submodule) => (
                        <div key={submodule.id} className="space-y-1">
                          <button
                            onClick={() => toggleSubmodule(submodule.id)}
                            className={cn(
                              "w-full flex items-center gap-2 p-2 rounded-lg text-sm",
                              currentSubmoduleId === submodule.id
                                ? "bg-primary/10 text-primary"
                                : "hover:bg-muted"
                            )}
                          >
                            <ChevronRight
                              className={cn(
                                "h-4 w-4 transition-transform",
                                expandedSubmodules.has(submodule.id) && "rotate-90"
                              )}
                            />
                            <span className="flex-1 text-left">{submodule.title}</span>
                          </button>

                          {expandedSubmodules.has(submodule.id) && (
                            <div className="pl-4 space-y-1">
                              <button
                                onClick={() => toggleQuestions(submodule.id)}
                                className={cn(
                                  "w-full flex items-center gap-2 p-2 rounded-lg text-sm",
                                  expandedQuestions.has(submodule.id)
                                    ? "bg-primary/10 text-primary"
                                    : "hover:bg-muted"
                                )}
                              >
                                <ChevronRight
                                  className={cn(
                                    "h-4 w-4 transition-transform",
                                    expandedQuestions.has(submodule.id) && "rotate-90"
                                  )}
                                />
                                <span className="flex-1 text-left">Questions</span>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="p-1 h-auto"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setIsAddingQuestion(true);
                                  }}
                                >
                                  <Plus className="h-4 w-4" />
                                </Button>
                              </button>

                              {expandedQuestions.has(submodule.id) && (
                                <div className="pl-4 space-y-2">
                                  {isAddingQuestion && (
                                    <div className="p-2 space-y-2">
                                      <Input
                                        value={newQuestion}
                                        onChange={(e) => setNewQuestion(e.target.value)}
                                        placeholder="Enter your question..."
                                        className="h-8"
                                      />
                                      <div className="flex gap-2">
                                        <Button
                                          size="sm"
                                          onClick={() => handleAddQuestion(submodule.id)}
                                          disabled={isSubmitting}
                                        >
                                          {isSubmitting ? (
                                            <>
                                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                              Adding...
                                            </>
                                          ) : (
                                            "Add Question"
                                          )}
                                        </Button>
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          onClick={() => {
                                            setIsAddingQuestion(false);
                                            setNewQuestion("");
                                          }}
                                        >
                                          Cancel
                                        </Button>
                                      </div>
                                    </div>
                                  )}
                                  {submodule.questions?.map((question) => (
                                    <div
                                      key={question.id}
                                      className="p-2 rounded-lg bg-muted/50 hover:bg-muted/70"
                                    >
                                      <p className="text-sm">{question.question}</p>
                                      <div className="mt-2 flex items-center gap-2">
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          className="p-1 h-auto"
                                        >
                                          <Pencil className="h-4 w-4" />
                                        </Button>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          className="p-1 h-auto text-destructive"
                                        >
                                          <Trash2 className="h-4 w-4" />
                                        </Button>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 