"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Loader2, Plus, Trash2, ChevronDown, ChevronUp, PlusCircle, Search, Filter, ChevronLeft, ChevronRight, RefreshCw, SlidersHorizontal, X, Layers, MoveUp, MoveDown, AlertTriangle, CheckCircle, Pencil } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { FolderIcon } from "lucide-react";
import React from "react";
import { Badge } from "@/components/ui/badge";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';

interface Question {
  id: string;
  name: string;
  description: string;
  type: string;
  status: string;
  difficulty: string;
  marks: number;
  sectionMark?: number;
  folderId: string;
  folder: any;
  order?: number; // Add optional order property for sorting purposes
}

interface Section {
  id: string;
  name: string;
  description?: string | null;
  order?: number;
  questions: (string | { id: string; sectionMark: number; order?: number })[];
}

// Create a SectionCard component to properly handle the section scope
interface SectionCardProps {
  section: Section;
  sectionIndex: number;
  totalSections: number;
  availableQuestions: Question[];
  toggleQuestion: (sectionId: string, questionId: string) => Promise<void>;
  updateSectionMark: (questionId: string, sectionId: string, newMark: number) => Promise<void>;
  removeSection: (sectionId: string) => Promise<void>;
  moveSection: (sectionId: string, direction: 'up' | 'down') => Promise<void>;
  setSelectedSectionForQuestion: React.Dispatch<React.SetStateAction<string | null>>;
  setIsAddQuestionModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  allSections: Section[];
  setSections: React.Dispatch<React.SetStateAction<Section[]>>;
  fetchData: () => Promise<void>;
  saveChanges: () => Promise<any>;
  setSaving: React.Dispatch<React.SetStateAction<boolean>>;
  removeQuestionsFromSection: (sectionId: string, questionIds: string[]) => Promise<any>;
  sectionLoadingStates: {
    [key: string]: {
      removing?: boolean;
      movingUp?: boolean;
      movingDown?: boolean;
      addingQuestions?: boolean;
    }
  };
  setSectionLoadingState: (sectionId: string, action: string, state: boolean) => void;
  assessmentId: string; // Add the assessmentId prop
  setAvailableQuestions: React.Dispatch<React.SetStateAction<Question[]>>;
}

// Add this interface for the sortable question item
interface SortableQuestionItemProps {
  question: Question;
  sectionId: string;
  isSelected: boolean;
  onToggleSelect: (questionId: string) => void;
  onEditMark: (questionId: string, currentMark: number) => void;
  onDelete: (questionId: string) => void;
  editingMarkId: string | null;
  markValue: string;
  onMarkKeyPress: (e: React.KeyboardEvent, questionId: string) => void;
  onSaveMark: (questionId: string) => void;
  onMarkValueChange: (value: string) => void;
  onCancelEdit: () => void;
}

// Add the SortableQuestionItem component
const SortableQuestionItem = ({ 
  question, 
  sectionId, 
  isSelected, 
  onToggleSelect, 
  onEditMark, 
  onDelete,
  editingMarkId,
  markValue,
  onMarkKeyPress,
  onSaveMark,
  onMarkValueChange,
  onCancelEdit,
  questionNumber
}: SortableQuestionItemProps & { questionNumber: number }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: question.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : 0
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-start space-x-3 p-3 rounded-md border border-border bg-card hover:bg-accent/10 transition-colors relative"
    >
      <div className="flex items-center gap-2">
        <div 
          className="flex items-center gap-1 cursor-move hover:bg-primary/10 p-1 rounded-md transition-colors group"
          {...attributes}
          {...listeners}
          title="Drag to reorder"
        >
          <div className="w-6 h-6 flex items-center justify-center rounded-full bg-muted text-xs font-medium">
            {questionNumber}
          </div>
          <GripVertical className="h-4 w-4 text-muted-foreground opacity-50 group-hover:opacity-100" />
        </div>
        <Checkbox
          id={`question-select-${sectionId}-${question.id}`}
          checked={isSelected}
          onCheckedChange={() => onToggleSelect(question.id)}
          className="mt-1"
        />
      </div>
      <div className="grid gap-2 flex-1">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div className="flex items-center">
            <label
              htmlFor={`question-select-${sectionId}-${question.id}`}
              className="font-medium text-sm sm:text-base peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              {question.name}
            </label>
            <div className="flex items-center ml-3">
              <span className="text-xs text-muted-foreground flex items-center mr-2">
                <FolderIcon className="h-3 w-3 mr-1 text-muted-foreground/70" />
                {question.folder?.name || "Uncategorized"}
              </span>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex gap-1 items-center">
              <span className={`px-1.5 py-0.5 rounded text-xs ${
                question.type === 'MCQ' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
              }`}>
                {question.type || "Unknown"}
              </span>
              <span className={`px-1.5 py-0.5 rounded text-xs ${
                question.status === 'READY' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
              }`}>
                {question.status || "DRAFT"}
              </span>
              <span className="bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded text-xs">
                {question.difficulty || "MEDIUM"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center">
                <span className="text-xs font-medium mr-1">Default:</span>
                <span className="bg-green-100 text-green-800 px-1.5 py-0.5 rounded text-xs">
                  {question.marks || 1}m
                </span>
              </div>
              <div className="flex items-center">
                <span className="text-xs font-medium mr-1">Section:</span>
                {editingMarkId === question.id ? (
                  <div className="flex items-center gap-1">
                    <Input 
                      type="number" 
                      step="0.5"
                      min="0"
                      className="h-6 w-16 text-xs"
                      value={markValue}
                      onChange={(e) => onMarkValueChange(e.target.value)}
                      onKeyDown={(e) => onMarkKeyPress(e, question.id)}
                      autoFocus
                    />
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-6 w-6 text-primary hover:bg-primary/10"
                      onClick={() => onSaveMark(question.id)}
                    >
                      <CheckCircle className="h-3.5 w-3.5" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-6 w-6 text-muted-foreground hover:bg-accent/20"
                      onClick={onCancelEdit}
                    >
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-1">
                    <span className="bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded text-xs">
                      {question.sectionMark !== undefined ? question.sectionMark : question.marks}m
                    </span>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-6 w-6 text-muted-foreground hover:bg-accent/20"
                      onClick={() => onEditMark(question.id, question.sectionMark !== undefined ? question.sectionMark : question.marks)}
                      title="Edit mark"
                    >
                      <Pencil className="h-3 w-3" />
                    </Button>
                  </div>
                )}
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-7 w-7 text-destructive hover:bg-destructive/10"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(question.id);
                }}
                title="Remove question from section"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </div>
        {question.description ? (
          <p className="text-xs text-muted-foreground line-clamp-2 pr-4">
            {question.description}
          </p>
        ) : (
          <p className="text-xs text-muted-foreground italic">
            No description available
          </p>
        )}
      </div>
    </div>
  );
};

const SectionCard: React.FC<SectionCardProps> = ({ 
  section, 
  sectionIndex,
  totalSections,
  availableQuestions, 
  toggleQuestion, 
  updateSectionMark,
  removeSection,
  moveSection,
  setSelectedSectionForQuestion,
  setIsAddQuestionModalOpen,
  allSections,
  setSections,
  fetchData,
  saveChanges,
  setSaving,
  removeQuestionsFromSection,
  sectionLoadingStates,
  setSectionLoadingState,
  assessmentId, // Add the assessmentId parameter
  setAvailableQuestions // Add setAvailableQuestions to the SectionCardProps interface
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([]);
  const [isDeletingQuestions, setIsDeletingQuestions] = useState(false);
  const [editingMarkId, setEditingMarkId] = useState<string | null>(null);
  const [markValue, setMarkValue] = useState<string>("0");
  const [isEditingName, setIsEditingName] = useState(false);
  const [sectionName, setSectionName] = useState(section.name);
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );
  
  // Calculate the actual questions to display, filtering missing questions
  const sectionQuestions = React.useMemo(() => {
    console.log(`Computing questions for section ${section.name} (${section.id})`);
    
    // First, get the ordered question data from section.questions
    // This preserves the order from the SectionQuestion table
    const orderedQuestionData = [...section.questions]
      .map(sq => {
        // If it's a string, convert to object with default order
        if (typeof sq === 'string') {
          return { id: sq, order: 999999, sectionMark: undefined }; // Add sectionMark property to match type
        }
        // Make sure order is always defined
        return { ...sq, order: sq.order || 0 };
      })
      // Sort by order first to establish initial ordering
      .sort((a, b) => (a.order as number) - (b.order as number));
    
    console.log("Ordered question data:", orderedQuestionData.map(q => ({ id: q.id, order: q.order })));
    
    // Now map these to the actual question objects
    return orderedQuestionData
      .map(oq => {
        // Find the actual question data from availableQuestions
        const question = availableQuestions.find(q => q.id === oq.id);
        if (!question) return null; // Skip if question not found
        
        // Merge the question data with the order information
        return {
          ...question,
          order: oq.order,
          sectionMark: typeof oq === 'object' && oq.sectionMark !== undefined ? 
            oq.sectionMark : question.sectionMark
        };
      })
      // Filter out null values (questions not found)
      .filter(q => q !== null) as Question[];
  }, [section.questions, availableQuestions, section.name, section.id]);
  
  const missingQuestionsCount = section.questions.filter(id => 
    !availableQuestions.some(q => typeof id === 'string' ? id === q.id : id.id === q.id)
  ).length;
  
  // Handle editing of section mark
  const handleEditMark = (questionId: string, currentMark: number) => {
    setEditingMarkId(questionId);
    setMarkValue(currentMark.toString());
  };
  
  // Handle saving of the edited mark
  const handleSaveMark = async (questionId: string) => {
    const newMark = parseFloat(markValue);
    if (!isNaN(newMark)) {
      await updateSectionMark(questionId, section.id, newMark);
    }
    setEditingMarkId(null);
  };
  
  // Handle key press events for the mark input
  const handleMarkKeyPress = (e: React.KeyboardEvent, questionId: string) => {
    if (e.key === 'Enter') {
      handleSaveMark(questionId);
    } else if (e.key === 'Escape') {
      setEditingMarkId(null);
    }
  };
  
  // Handle bulk selection
  const toggleSelectAll = () => {
    if (selectedQuestions.length === sectionQuestions.length) {
      // If all are selected, deselect all
      setSelectedQuestions([]);
    } else {
      // Otherwise, select all
      setSelectedQuestions(sectionQuestions.map(q => q.id));
    }
  };
  
  // Handle individual question selection
  const toggleQuestionSelection = (questionId: string) => {
    if (selectedQuestions.includes(questionId)) {
      setSelectedQuestions(selectedQuestions.filter(id => id !== questionId));
    } else {
      setSelectedQuestions([...selectedQuestions, questionId]);
    }
  };
  
  // Delete selected questions
  const deleteSelectedQuestions = async () => {
    if (selectedQuestions.length === 0) return;
    
    if (confirm(`Are you sure you want to remove ${selectedQuestions.length} questions from this section?`)) {
      try {
        setIsDeletingQuestions(true);
        
        // Use the provided removeQuestionsFromSection function
        const result = await removeQuestionsFromSection(section.id, selectedQuestions);
        
        // Clear selection after successful deletion
        setSelectedQuestions([]);
        toast.success(result.message || `${selectedQuestions.length} questions removed from section`);
      } catch (error) {
        toast.error(`Failed to remove questions: ${error instanceof Error ? error.message : String(error)}`);
      } finally {
        setIsDeletingQuestions(false);
      }
    }
  };
  
  // Handle section name editing
  const handleSectionNameKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSaveSectionName();
    } else if (e.key === 'Escape') {
      setIsEditingName(false);
      setSectionName(section.name);
    }
  };
  
  // Handle saving of the edited section name
  const handleSaveSectionName = async () => {
    if (!sectionName.trim()) {
      toast.error("Section name cannot be empty");
      return;
    }

    try {
      setSaving(true);
      const updatedSections = allSections.map(s => {
        if (s.id === section.id) {
          return { ...s, name: sectionName.trim() };
        }
        return s;
      });
      setSections(updatedSections);
      await saveChanges();
      setIsEditingName(false);
      toast.success("Section name updated successfully");
    } catch (error) {
      toast.error("Failed to update section name");
      console.error("Error updating section name:", error);
    } finally {
      setSaving(false);
    }
  };
  
  // Update the handleDragEnd function to use assessmentId instead of params.id
  const handleDragEnd = async (event: any) => {
    const { active, over } = event;
    
    if (!active || !over || active.id === over.id) {
      return;
    }
    
    // Find the indices of the dragged and target items
    const oldIndex = sectionQuestions.findIndex(q => q.id === active.id);
    const newIndex = sectionQuestions.findIndex(q => q.id === over.id);
    
    if (oldIndex === -1 || newIndex === -1) {
      return;
    }
    
    try {
      // Don't show global saving state for question reordering to avoid confusion
      // Start with immediate UI update for better UX
      
      console.log(`Moving question from position ${oldIndex} to ${newIndex}`);
      
      // Create a new ordered array of questions
      const reorderedQuestions = arrayMove([...sectionQuestions], oldIndex, newIndex);
      
      // Create properly formatted question objects with explicit order
      const updatedQuestions = reorderedQuestions.map((q, index) => ({
        id: q.id,
        sectionMark: q.sectionMark !== undefined ? q.sectionMark : q.marks,
        order: index // Explicitly set the order based on new position
      }));
      
      console.log("Updated questions with order:", 
        updatedQuestions.map((q, i) => `${i+1}: ${q.id} (order: ${q.order})`)
      );
      
      // Update the local state with the new order
      const updatedSections = allSections.map(s => {
        if (s.id === section.id) {
          return {
            ...s,
            questions: updatedQuestions
          };
        }
        return s;
      });
      
      // Update local state immediately for responsive UI
      setSections(updatedSections);
      
      // Update availableQuestions with new order info for consistent UI
      setAvailableQuestions(prevQuestions => {
        const updated = [...prevQuestions];
        updatedQuestions.forEach(uq => {
          const index = updated.findIndex(q => q.id === uq.id);
          if (index !== -1) {
            updated[index] = {
              ...updated[index],
              order: uq.order
            };
          }
        });
        return updated;
      });
      
      // Prepare payload for the API call
      const orderUpdatePayload = {
        sectionId: section.id,
        questions: updatedQuestions.map(q => ({
          id: q.id,
          order: q.order,
          sectionMark: q.sectionMark
        }))
      };
      
      console.log("Sending order update:", orderUpdatePayload);
      
      // Call the API endpoint for updating question order
      const response = await fetch(`/api/assessments/${assessmentId}/sections/${section.id}/order`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderUpdatePayload)
      });
      
      if (!response.ok) {
        throw new Error(`Failed to update question order: ${response.statusText}`);
      }
      
      const result = await response.json();
      console.log("Order update response:", result);
      
      toast.success("Question order updated", { duration: 2000 });
    } catch (error) {
      console.error("Error updating question order:", error);
      toast.error("Failed to update question order");
      
      // Only refresh the data in case of an error
      await fetchData();
    }
  };
  
  // Inside the SectionCard component, add these state variables
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [questionToDelete, setQuestionToDelete] = useState<string | null>(null);
  const [isBulkDeleteDialogOpen, setIsBulkDeleteDialogOpen] = useState(false);
  
  return (
    <Card className="overflow-hidden">
      <div 
        className="flex items-center justify-between p-4 bg-muted/30 border-b cursor-pointer hover:bg-muted/50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
        data-section-toggle="true"
        data-expanded={isExpanded ? "true" : "false"}
      >
        <div className="flex items-center">
          <div className="mr-2">
            {isExpanded ? 
              <ChevronDown className="h-5 w-5 text-muted-foreground" /> : 
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            }
          </div>
          <div className="flex items-center">
            <span className="w-6 h-6 flex items-center justify-center rounded-full bg-muted text-xs font-medium mr-2">
              {sectionIndex + 1}
            </span>
            {isEditingName ? (
              <div className="flex items-center gap-2">
                <Input
                  value={sectionName}
                  onChange={(e) => setSectionName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleSaveSectionName();
                    } else if (e.key === 'Escape') {
                      setIsEditingName(false);
                      setSectionName(section.name);
                    }
                  }}
                  className="h-8 w-[200px]"
                  autoFocus
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSaveSectionName();
                  }}
                >
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsEditingName(false);
                    setSectionName(section.name);
                  }}
                >
                  <X className="h-4 w-4 text-red-600" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2 group">
                <h3 className="text-lg font-semibold">{section.name}</h3>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsEditingName(true);
                  }}
                >
                  <Pencil className="h-4 w-4 text-muted-foreground" />
                </Button>
              </div>
            )}
          </div>
          <Badge variant="outline" className="ml-3">
            {section.questions.length} {section.questions.length === 1 ? 'question' : 'questions'}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex">
            <Button
              variant="ghost"
              size="icon"
              disabled={sectionIndex === 0 || sectionLoadingStates[section.id]?.movingUp}
              onClick={(e) => {
                e.stopPropagation(); // Prevent accordion toggle
                setSectionLoadingState(section.id, 'movingUp', true);
                moveSection(section.id, 'up');
              }}
              className="h-8 w-8"
            >
              {sectionLoadingStates[section.id]?.movingUp ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <MoveUp className="h-4 w-4" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              disabled={sectionIndex === totalSections - 1 || sectionLoadingStates[section.id]?.movingDown}
              onClick={(e) => {
                e.stopPropagation(); // Prevent accordion toggle
                setSectionLoadingState(section.id, 'movingDown', true);
                moveSection(section.id, 'down');
              }}
              className="h-8 w-8"
            >
              {sectionLoadingStates[section.id]?.movingDown ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <MoveDown className="h-4 w-4" />
              )}
            </Button>
          </div>
          <Button
            variant="outline"
            size="sm"
            disabled={sectionLoadingStates[section.id]?.addingQuestions}
            onClick={(e) => {
              e.stopPropagation(); // Prevent accordion toggle
              setSelectedSectionForQuestion(section.id);
              setIsAddQuestionModalOpen(true);
              // Reset when modal is opened
              setTimeout(() => {
                setSectionLoadingState(section.id, 'addingQuestions', false);
              }, 500);
            }}
          >
            {sectionLoadingStates[section.id]?.addingQuestions ? (
              <>
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                Opening...
              </>
            ) : (
              <>
                <PlusCircle className="h-4 w-4 mr-1" />
                Add Questions
              </>
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            disabled={sectionLoadingStates[section.id]?.removing}
            onClick={(e) => {
              e.stopPropagation(); // Prevent accordion toggle
              if (confirm(`Are you sure you want to delete section "${section.name}"?`)) {
                setSectionLoadingState(section.id, 'removing', true);
                removeSection(section.id);
              }
            }}
          >
            {sectionLoadingStates[section.id]?.removing ? (
              <Loader2 className="h-4 w-4 animate-spin text-destructive" />
            ) : (
              <Trash2 className="h-4 w-4 text-destructive" />
            )}
          </Button>
        </div>
      </div>
      
      {isExpanded && (
        <CardContent className="p-4 overflow-hidden transition-all">
          {availableQuestions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8">
              <div className="rounded-full bg-muted p-4">
                <Search className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="mt-4 text-lg font-semibold">No questions available</h3>
              <p className="text-sm text-muted-foreground text-center mt-1 max-w-md">
                Please create questions first in the question bank before adding them to sections.
              </p>
            </div>
          ) : section.questions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8">
              <div className="rounded-full bg-muted p-4">
                <PlusCircle className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="mt-4 text-lg font-semibold">No questions in this section</h3>
              <p className="text-sm text-muted-foreground text-center mt-1 max-w-md">
                Click "Add Questions" to select questions from your question bank.
              </p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => {
                  setSelectedSectionForQuestion(section.id);
                  setIsAddQuestionModalOpen(true);
                }}
              >
                <PlusCircle className="h-4 w-4 mr-2" />
                Add Questions
              </Button>
            </div>
          ) : sectionQuestions.length === 0 && missingQuestionsCount > 0 ? (
            <div className="flex flex-col items-center justify-center py-8">
              <div className="rounded-full bg-amber-50 p-4">
                <AlertTriangle className="h-6 w-6 text-amber-500" />
              </div>
              <h3 className="mt-4 text-lg font-semibold">Missing Questions</h3>
              <p className="text-sm text-muted-foreground text-center mt-1 max-w-md">
                All {missingQuestionsCount} question(s) in this section may have been deleted from the question bank.
              </p>
              <div className="flex space-x-3 mt-4">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSelectedSectionForQuestion(section.id);
                    setIsAddQuestionModalOpen(true);
                  }}
                >
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Add Questions
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Bulk Actions Row */}
              <div className="flex items-center justify-between mb-2 pb-2 border-b">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id={`select-all-${section.id}`}
                    checked={selectedQuestions.length > 0 && selectedQuestions.length === sectionQuestions.length}
                    onCheckedChange={toggleSelectAll}
                    disabled={isDeletingQuestions}
                  />
                  <label 
                    htmlFor={`select-all-${section.id}`}
                    className="text-sm font-medium cursor-pointer"
                  >
                    Select All
                  </label>
                  <span className="text-xs text-muted-foreground">
                    ({selectedQuestions.length}/{sectionQuestions.length} selected)
                  </span>
                </div>
                
                {selectedQuestions.length > 0 && (
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={deleteSelectedQuestions}
                    disabled={isDeletingQuestions}
                  >
                    {isDeletingQuestions ? (
                      <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4 mr-1" />
                    )}
                    Delete Selected
                  </Button>
                )}
              </div>
              
              {/* Questions List with Drag and Drop */}
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={sectionQuestions.map(q => q.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-3">
                    {sectionQuestions.map((question, index) => (
                      <SortableQuestionItem
                        key={question.id}
                        question={question}
                        sectionId={section.id}
                        isSelected={selectedQuestions.includes(question.id)}
                        onToggleSelect={toggleQuestionSelection}
                        onEditMark={handleEditMark}
                        onDelete={(questionId) => {
                          setQuestionToDelete(questionId);
                          setIsDeleteDialogOpen(true);
                        }}
                        editingMarkId={editingMarkId}
                        markValue={markValue}
                        onMarkKeyPress={handleMarkKeyPress}
                        onSaveMark={handleSaveMark}
                        onMarkValueChange={setMarkValue}
                        onCancelEdit={() => setEditingMarkId(null)}
                        questionNumber={index + 1}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            </div>
          )}
        </CardContent>
      )}
      {/* Add Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Question</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove this question from the section? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={async () => {
                if (!questionToDelete) return;
                try {
                  await removeQuestionsFromSection(section.id, [questionToDelete]);
                  toast.success("Question removed from section");
                } catch (error) {
                  toast.error(`Failed to remove question: ${error instanceof Error ? error.message : String(error)}`);
                } finally {
                  setIsDeleteDialogOpen(false);
                  setQuestionToDelete(null);
                }
              }}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Remove Question
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default function QuestionsPage() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [addingSectionLoading, setAddingSectionLoading] = useState(false);
  const [assessment, setAssessment] = useState<any>(null);
  const [availableQuestions, setAvailableQuestions] = useState<Question[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [newSectionName, setNewSectionName] = useState("");
  const [selectedSectionForQuestion, setSelectedSectionForQuestion] = useState<string | null>(null);
  const [isAddQuestionModalOpen, setIsAddQuestionModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [difficultyFilter, setDifficultyFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [folderFilter, setFolderFilter] = useState("all");
  const [includeSubfolders, setIncludeSubfolders] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [questionsPerPage, setQuestionsPerPage] = useState(20);
  const [folders, setFolders] = useState<any[]>([]);
  const [pendingFilters, setPendingFilters] = useState({
    search: "",
    type: "all",
    difficulty: "all",
    status: "all",
    folder: "all",
    includeSubfolders: true
  });
  const [isApplyingFilters, setIsApplyingFilters] = useState(false);
  const [paginatedQuestions, setPaginatedQuestions] = useState<Question[]>([]);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(false);
  const [totalQuestionCount, setTotalQuestionCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([]);
  const [questionMarks, setQuestionMarks] = useState<{ [key: string]: number }>({});
  
  // Loading states for each section
  const [sectionLoadingStates, setSectionLoadingStates] = useState<{
    [key: string]: {
      removing?: boolean;
      movingUp?: boolean;
      movingDown?: boolean;
      addingQuestions?: boolean;
    }
  }>({});
  
  // Helper function to set loading state for specific section action
  const setSectionLoadingState = (sectionId: string, action: string, state: boolean) => {
    setSectionLoadingStates(prev => ({
      ...prev,
      [sectionId]: {
        ...prev[sectionId],
        [action]: state
      }
    }));
  };
  
  // Helper function to reset all loading states for a section
  const resetSectionLoadingStates = (sectionId: string) => {
    setSectionLoadingStates(prev => ({
      ...prev,
      [sectionId]: {
        movingUp: false,
        movingDown: false,
        removing: false,
        addingQuestions: false
      }
    }));
  };
  
  // Helper function to reset all loading states for all sections
  const resetAllSectionLoadingStates = () => {
    const resetStates: Record<string, any> = {};
    sections.forEach(section => {
      resetStates[section.id] = {
        movingUp: false,
        movingDown: false,
        removing: false,
        addingQuestions: false
      };
    });
    setSectionLoadingStates(resetStates);
  };
  
  // Use useMemo to calculate total marks when sections or available questions change
  const totalMarks = useMemo(() => {
    console.log("Recalculating total marks...");
    let total = 0;
    
    sections.forEach(section => {
      section.questions.forEach(q => {
        const questionId = typeof q === 'string' ? q : q.id;
        const question = availableQuestions.find(aq => aq.id === questionId);
        
        if (question) {
          if (typeof q === 'object' && q.sectionMark !== undefined) {
            total += q.sectionMark;
          } else if (question.sectionMark !== undefined) {
            total += question.sectionMark;
          } else {
            total += question.marks || 1;
          }
        } else {
          total += 1;
        }
      });
    });
    
    return total;
  }, [sections, availableQuestions]);  // Re-calculate when sections or availableQuestions change
  
    const fetchData = async () => {
    setLoading(true);
      try {
      // Fetch assessment details with explicit includeSectionMarks parameter
      const assessmentRes = await fetch(`/api/assessments/${params.id}?includeSectionMarks=true&includeOrder=true`);
        if (!assessmentRes.ok) throw new Error("Failed to fetch assessment");
        const assessmentData = await assessmentRes.json();
        
        console.log("Assessment API response:", assessmentData);
        
        // Add detailed logging of the sections and questions
        if (assessmentData.sections) {
          assessmentData.sections.forEach((section: any) => {
            console.log(`Section ${section.title || section.name} (${section.id}) questions:`, 
              section.questions && section.questions.length > 0 
                ? section.questions.map((q: any) => ({ 
                    id: q.id || q.questionId, 
                    order: q.order, 
                    sectionMark: q.sectionMark 
                  }))
                : 'No questions'
            );
          });
        }
        
        setAssessment(assessmentData);

      let sectionsData: Section[] = [];

        // Initialize sections from assessment data
        if (assessmentData.sections && assessmentData.sections.length > 0) {
          // Transform the sections data to match our interface
        sectionsData = assessmentData.sections.map((section: any) => {
            // Get existing questions if available
            // Make sure questions is an array - get question IDs from the SectionQuestion records
          let sectionQuestions: (string | { id: string; sectionMark: number; order?: number })[] = [];
            
            if (Array.isArray(section.questions)) {
            // If questions is an array of objects with questionId and sectionMark properties
              if (section.questions.length > 0 && typeof section.questions[0] === 'object') {
                // Log order of questions for debugging
                console.log(`Section ${section.title} questions before sorting:`, 
                  section.questions.map((q: any) => ({ id: q.questionId || q.id, order: q.order }))
                );
                
                sectionQuestions = section.questions
                  .sort((a: any, b: any) => (a.order || 0) - (b.order || 0)) // Sort by order
                  .map((q: any) => ({
                    id: q.questionId || q.id,
                    sectionMark: q.sectionMark !== undefined ? q.sectionMark : (q.marks || 1),
                    order: q.order || 0
                  }));
                  
                // Log order after sorting
                console.log(`Section ${section.title} questions after sorting:`, 
                  sectionQuestions.map((q: any) => ({ id: q.id, order: q.order }))
                );
              } 
            // If questions is an array of SectionQuestion objects
            else if (section.SectionQuestions && section.SectionQuestions.length > 0) {
              sectionQuestions = section.SectionQuestions
                .sort((a: any, b: any) => (a.order || 0) - (b.order || 0)) // Sort by order
                .map((sq: any) => ({
                  id: sq.questionId,
                  sectionMark: sq.sectionMark || 1,
                  order: sq.order || 0
                }));
            }
            // If questions is just an array of strings (question IDs)
              else {
              // We'll need to fetch section marks separately
              sectionQuestions = section.questions.map((id: string, index: number) => ({
                id,
                sectionMark: 1, // Default to 1, will be updated later
                order: index // Default order based on array position
              }));
              }
            }
            
            console.log(`Section ${section.title} has ${sectionQuestions.length} questions:`, sectionQuestions);
            
            return {
              id: section.id,
              name: section.title, // Map title field from DB to name in our interface
              description: section.description,
              order: section.order,
            questions: sectionQuestions // Use processed question IDs with section marks
            };
          });
        console.log("Transformed sections from API:", sectionsData);
        setSections(sectionsData);
        } else {
          console.log("No sections found, creating default section");
          // Create a default section if none exists
        sectionsData = [{
            id: "default-" + Date.now(),
            name: "Default Section",
            description: null,
            order: 0,
            questions: []
        }];
        setSections(sectionsData);
        }
        
        // Fetch folders first to ensure we have them available
        const foldersRes = await fetch("/api/folders");
        if (!foldersRes.ok) throw new Error("Failed to fetch folders");
        const foldersData = await foldersRes.json();
        console.log("Folders API response:", foldersData);
        
        // Build the folder hierarchy
        const parentFolders: any[] = foldersData.filter((folder: any) => !folder.parentId);
        const childFolders: any[] = foldersData.filter((folder: any) => folder.parentId);
        
        // Add subfolders property to parent folders
        const foldersWithSubfolders = parentFolders.map((parent) => {
          const subfolders = childFolders.filter((child: any) => child.parentId === parent.id);
          return {
            ...parent,
            subfolders: subfolders
          };
        });
        
        console.log("Folders with subfolders:", foldersWithSubfolders);
        setFolders(foldersWithSubfolders);
        
      // Fetch all available questions with their section marks
      const questionsRes = await fetch(`/api/questions?limit=1000&page=1&includeSectionMarks=true&assessmentId=${params.id}`);
        if (!questionsRes.ok) throw new Error("Failed to fetch questions");
        const questionsData = await questionsRes.json();
        
        console.log("Questions API response:", questionsData);
        
        // Check if the response has a 'questions' property (nested structure)
        const questions = questionsData.questions 
          ? questionsData.questions 
          : (Array.isArray(questionsData) ? questionsData : []);
        
        console.log("Raw questions array:", questions);
        
        if (questions.length === 0) {
          console.warn("No questions found in API response");
        }
        
        // Transform the questions to match our interface
        const transformedQuestions = questions.map((question: any) => {
          // Extract question text from the appropriate field based on question type
          const questionText = question.mCQQuestion?.questionText || 
                              question.codingQuestion?.questionText || 
                              question.questionText || 
                              "";
          
          // Extract difficulty from the appropriate field
          const difficulty = question.mCQQuestion?.difficulty || 
                            question.codingQuestion?.difficulty || 
                            question.difficulty || 
                            "MEDIUM";
          
          // Extract marks/points
          const marks = question.mCQQuestion?.defaultMark || 
                       question.codingQuestion?.defaultMark || 
                       question.marks || 
                       1;
                     
        // Get section mark from the SectionQuestion record
        const sectionQuestion = question.sections?.find((s: any) => 
          assessmentData.sections?.some((section: any) => section.id === s.sectionId)
        );
        const sectionMark = sectionQuestion?.sectionMark !== undefined ? sectionQuestion.sectionMark : marks;
                       
          return {
            id: question.id,
            name: question.name || "Untitled Question",
            description: questionText,
            type: question.type,
            status: question.status || "DRAFT",
            difficulty: difficulty,
            marks: marks,
          sectionMark: sectionMark,
            folderId: question.folderId,
            folder: question.folder
          };
        });
        
        console.log("Transformed questions:", transformedQuestions);
        setAvailableQuestions(transformedQuestions);
      
      // Now update the sections with the correct section marks from transformedQuestions
      if (sectionsData && sectionsData.length > 0) {
        const updatedSections = sectionsData.map((section: Section) => {
          const updatedQuestions = section.questions.map((q: string | { id: string; sectionMark: number }) => {
            const questionId = typeof q === 'string' ? q : q.id;
            const questionWithMark = transformedQuestions.find((tq: Question) => tq.id === questionId);
            
            if (questionWithMark && questionWithMark.sectionMark !== undefined) {
              return {
                id: questionId,
                sectionMark: questionWithMark.sectionMark
              };
            }
            return q;
          });
          
          return {
            ...section,
            questions: updatedQuestions
          };
        });
        
        console.log("Updated sections with correct marks:", updatedSections);
        setSections(updatedSections);
      }
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load questions data");
      } finally {
        setLoading(false);
      }
    };
    
  useEffect(() => {
    fetchData();
  }, [params.id]);
  
  // Fix for AbortError handling in saveChanges
  const saveChanges = async (sectionsToSave = sections) => {
    setSaving(true);
    try {
      // Debug: log the sections state before transformation
      console.log("Current sections state before save:", JSON.stringify(sectionsToSave.map(s => ({
        id: s.id,
        name: s.name,
        questionsCount: s.questions?.length || 0,
        hasQuestionsArray: Array.isArray(s.questions)
      }))));
      
      // Deep copy sections to avoid reference issues
      const sectionsWithQuestions = sectionsToSave.map(section => {
        // Ensure questions is always an array
        const questions = Array.isArray(section.questions) ? [...section.questions] : [];
        return {
          ...section,
          questions: questions
        };
      });
      
      // Log the questions array for each section after copy
      sectionsWithQuestions.forEach(section => {
        console.log(`Section ${section.name} has ${section.questions.length} questions:`, 
          section.questions.map(q => typeof q === 'string' ? q : `${q.id} (mark: ${q.sectionMark})`)
        );
      });
      
      // Prepare the data to be sent
      const dataToSend = {
        sections: sectionsWithQuestions.map(section => ({
          id: section.id,
          name: section.name,
          description: section.description || null,
          order: section.order || 0,
          questions: section.questions // This can include objects with sectionMark
        }))
      };
      
      console.log("Formatted data to send:", JSON.stringify(dataToSend));
      console.log("Data to send - question counts per section:", 
        dataToSend.sections.map(s => `${s.name}: ${s.questions.length} questions`)
      );
      
      // Set a timeout for the fetch to prevent indefinite waiting
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
      
      try {
      const response = await fetch(`/api/assessments/${params.id}/questions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dataToSend),
          signal: controller.signal
      });
        
        clearTimeout(timeoutId);
      
      if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: `HTTP error ${response.status}` }));
        console.error("Error response:", errorData);
        throw new Error(errorData.error || "Failed to save questions");
      }
      
        const responseData = await response.json().catch(() => ({ sections: [] }));
      console.log("Success response:", responseData);
        
        // After successful save, update the local state with the response data if needed
        if (responseData.sections) {
          // Transform sections from the response to our format
          const updatedSections = responseData.sections.map((section: any) => ({
            id: section.id,
            name: section.title || section.name,
            description: section.description,
            order: section.order,
            questions: section.questions || [] 
          }));
          
          // Update the sections with the data from the server
          setSections(updatedSections);
          console.log("Updated sections from response:", updatedSections);
        }
      
      return responseData;
      } catch (error: any) {
        clearTimeout(timeoutId);
        if (error.name === 'AbortError') {
          console.error("Request timed out after 30 seconds");
          throw new Error("Request timed out. The operation may be taking longer than expected.");
        }
        throw error;
      }
    } catch (error) {
      console.error("Error saving questions:", error);
      throw error;
    } finally {
      setSaving(false);
      // Reset all section loading states after saving completes
      resetAllSectionLoadingStates();
    }
  };

  const addSection = async () => {
    if (!newSectionName.trim()) {
      toast.error("Section name is required");
      return;
    }

    // Show loading state on the button
    setAddingSectionLoading(true);

    const newSection: Section = {
      id: `section-${Date.now()}`,
      name: newSectionName.trim(),
      description: null,
      order: sections.length, // Set order based on current sections count
      questions: []
    };

    console.log("Adding new section:", newSection);
    
    // Add the section locally first
    const updatedSections = [...sections, newSection];
    setSections(updatedSections);
    setNewSectionName("");
    
    // Save changes immediately with the updated sections
    try {
      setSaving(true);
      await saveChanges(updatedSections);
      toast.success("Section added successfully");
    } catch (error) {
      toast.error("Failed to save section: " + (error instanceof Error ? error.message : String(error)));
    } finally {
      setSaving(false);
      setAddingSectionLoading(false);
    }
  };

  const removeSection = async (sectionId: string) => {
    try {
      // Get the updated sections list
      const updatedSections = sections.filter(section => section.id !== sectionId);
      
      // Remove the section locally first for immediate UI feedback
      setSections(updatedSections);
      
      // Save the updated sections to the database
      setSaving(true);
      await saveChanges(updatedSections);
      toast.success("Section deleted successfully");
    } catch (error) {
      console.error("Error deleting section:", error);
      toast.error("Failed to delete section: " + (error instanceof Error ? error.message : String(error)));
      // Revert the local state if the API call fails
      fetchData();
    } finally {
      setSaving(false);
    }
  };

  // Function to toggle a question's inclusion in a section
  const toggleQuestion = async (sectionId: string, questionId: string): Promise<void> => {
    try {
      setSaving(true);
      console.log(`Toggling question ${questionId} in section ${sectionId}`);
      
      // Create a deep copy of sections
      const updatedSections = sections.map(section => {
        if (section.id === sectionId) {
          // Check if this question is already in the section
          const questionExists = section.questions.some(q => 
            typeof q === 'string' ? q === questionId : q.id === questionId
          );
          
          if (questionExists) {
            // Remove question
            return {
              ...section,
              questions: section.questions.filter(q => 
                typeof q === 'string' ? q !== questionId : q.id !== questionId
              )
            };
          } else {
            // Add question
            return {
              ...section,
              questions: [...section.questions, questionId]
            };
          }
        }
        return section;
      });
      
      // Update state with deep copy
      setSections(updatedSections);
      
      // Save to backend
        await saveChanges();
      
      // Show success message
      toast.success(
        `Question ${questionId.substring(0, 8)} ${
          updatedSections.find(s => s.id === sectionId)?.questions.some(q => 
            typeof q === 'string' ? q === questionId : q.id === questionId
          )
          ? "added to"
          : "removed from"
        } section`
      );
    } catch (error) {
      console.error("Error toggling question:", error);
      toast.error("Failed to update question");
      } finally {
        setSaving(false);
    }
  };

  const addQuestionToSection = (sectionId: string, questionId: string) => {
    setSections(sections.map(section => {
      if (section.id === sectionId) {
        return {
          ...section,
          questions: [...section.questions, questionId]
        };
      }
      return section;
    }));
    toast.success("Question added to section");
  };

  // Function to fetch paginated questions - matching the approach in admin/questions/page.tsx
  const fetchPaginatedQuestions = async (page = 1, filterParams = {}) => {
    setIsLoadingQuestions(true);
    try {
      // Construct query string from filters
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: questionsPerPage.toString(),
        ...filterParams
      });
      
      console.log(`Fetching questions page ${page} with params:`, queryParams.toString());
      
      // Use the same API endpoint as the question bank page
      const response = await fetch(`/api/questions?${queryParams.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch questions');
      }
      
      const data = await response.json();
      
      // Extract questions and pagination data just like in question bank
      const questions = data.questions || [];
      const pagination = data.pagination || { total: questions.length, totalPages: Math.ceil(questions.length / questionsPerPage) };
      const total = pagination.total || questions.length;
      
      console.log(`Fetched ${questions.length} questions for page ${page} (total: ${total})`);
      
      // Transform the questions to match our interface consistently with question bank
      const transformedQuestions = questions.map((question: any) => {
        // Extract question text from the appropriate field based on question type
        const questionText = question.mCQQuestion?.questionText || 
                            question.codingQuestion?.questionText || 
                            question.questionText || 
                            "";
        
        // Extract difficulty from the appropriate field
        const difficulty = question.mCQQuestion?.difficulty || 
                          question.codingQuestion?.difficulty || 
                          question.difficulty || 
                          "MEDIUM";
        
        // Extract marks/points
        const marks = question.mCQQuestion?.defaultMark || 
                     question.codingQuestion?.defaultMark || 
                     question.marks || 
                     1;
                     
        // Get section mark if the question is in a section
        const sectionMark = question.sections?.[0]?.sectionMark || marks;
        
        return {
          id: question.id,
          name: question.name || "Untitled Question",
          description: questionText,
          type: question.type,
          status: question.status || "DRAFT",
          difficulty: difficulty,
          marks: marks,
          sectionMark: sectionMark,
          folderId: question.folderId,
          folder: question.folder,
          createdAt: question.createdAt,
          updatedAt: question.updatedAt
        };
      });
      
      setPaginatedQuestions(transformedQuestions);
      setTotalQuestionCount(total);
      setTotalPages(pagination.totalPages || Math.ceil(total / questionsPerPage));
    } catch (error) {
      console.error('Error fetching paginated questions:', error);
      toast.error('Failed to load questions');
      setPaginatedQuestions([]);
      setTotalQuestionCount(0);
      setTotalPages(1);
    } finally {
      setIsLoadingQuestions(false);
    }
  };

  // Update the modal open handler to fetch first page
  useEffect(() => {
    if (isAddQuestionModalOpen) {
      // Reset filters to default state when modal opens
      const defaultFilters = {
        search: "",
        type: "all",
        difficulty: "all",
        status: "all",
        folder: "all",
        includeSubfolders: true
      };
      
      setPendingFilters(defaultFilters);
      setSearchQuery("");
      setTypeFilter("all");
      setDifficultyFilter("all");
      setStatusFilter("all");
      setFolderFilter("all");
      setIncludeSubfolders(true);
      
      // Reset pagination
      setCurrentPage(1);
      
      // Fetch first page of questions with default filters
      fetchPaginatedQuestions(1, {});
    }
  }, [isAddQuestionModalOpen]);

  // Update the paginate function to match admin/questions/page.tsx
  const paginate = (pageNumber: number) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
      
      // Build filter params in the same way as admin/questions/page.tsx
      const filterParams: any = {};
      
      if (searchQuery) filterParams.search = searchQuery;
      if (typeFilter !== 'all') filterParams.type = typeFilter;
      if (difficultyFilter !== 'all') filterParams.difficulty = difficultyFilter;
      if (statusFilter !== 'all') filterParams.status = statusFilter;
      if (folderFilter !== 'all') filterParams.folderId = folderFilter;
      if (includeSubfolders && folderFilter !== 'all') filterParams.includeSubfolders = 'true';
      
      // Add pagination parameters
      filterParams.page = pageNumber.toString();
      filterParams.limit = questionsPerPage.toString();
      
      // Fetch questions for the new page
      fetchPaginatedQuestions(pageNumber, filterParams);
      
      // Scroll to top of the questions list when page changes
      const questionsListElement = document.querySelector('.questions-list');
      if (questionsListElement) {
        questionsListElement.scrollTop = 0;
      }
    }
  };

  // Update the apply filters function to match admin/questions/page.tsx
  const applyFilters = () => {
    setIsApplyingFilters(true);
    
    // Apply filter values
    setSearchQuery(pendingFilters.search);
    setTypeFilter(pendingFilters.type);
    setDifficultyFilter(pendingFilters.difficulty);
    setStatusFilter(pendingFilters.status);
    setFolderFilter(pendingFilters.folder);
    setIncludeSubfolders(pendingFilters.includeSubfolders);
    
    // Build filter params the same way as admin/questions/page.tsx
    const filterParams: any = {};
    
    if (pendingFilters.search) filterParams.search = pendingFilters.search;
    if (pendingFilters.type !== 'all') filterParams.type = pendingFilters.type;
    if (pendingFilters.difficulty !== 'all') filterParams.difficulty = pendingFilters.difficulty;
    if (pendingFilters.status !== 'all') filterParams.status = pendingFilters.status;
    if (pendingFilters.folder !== 'all') filterParams.folderId = pendingFilters.folder;
    if (pendingFilters.includeSubfolders && pendingFilters.folder !== 'all') 
      filterParams.includeSubfolders = 'true';
    
    // Reset to first page and fetch with new filters
    setCurrentPage(1);
    fetchPaginatedQuestions(1, filterParams);
    
    setIsApplyingFilters(false);
  };
  
  // Update clear filters function to match admin/questions/page.tsx
  const clearFilters = () => {
    const clearedFilters = {
      search: "",
      type: "all",
      difficulty: "all",
      status: "all",
      folder: "all",
      includeSubfolders: true
    };
    
    setPendingFilters(clearedFilters);
    
    // Also apply the cleared filters immediately
    setSearchQuery("");
    setTypeFilter("all");
    setDifficultyFilter("all");
    setStatusFilter("all");
    setFolderFilter("all");
    setIncludeSubfolders(true);
    
    // Reset to first page and fetch with cleared filters
    setCurrentPage(1);
    fetchPaginatedQuestions(1, {});
  };

  // Function to update section mark
  const updateSectionMark = async (questionId: string, sectionId: string, newMark: number): Promise<void> => {
    try {
      setSaving(true);
      console.log(`Updating mark for question ${questionId} in section ${sectionId} to ${newMark}`);
      
      // Call the API to update the section mark
      const response = await fetch(`/api/assessments/${params.id}/questions/${questionId}/mark`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          sectionId, 
          mark: newMark 
        }),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error updating section mark:", errorText);
        throw new Error(`Failed to update section mark: ${errorText}`);
      }
      
      // First update availableQuestions to ensure total marks recalculation has updated data
          const updatedAvailableQuestions = availableQuestions.map(q => {
            if (q.id === questionId) {
              return { ...q, sectionMark: newMark };
            }
            return q;
          });
          setAvailableQuestions(updatedAvailableQuestions);
          
      // Then update the sections to include the new mark
      const updatedSections = sections.map(section => {
        if (section.id === sectionId) {
          // Update the question in the section to have the new mark
          const updatedQuestions = section.questions.map(q => {
            const qId = typeof q === 'string' ? q : q.id;
            if (qId === questionId) {
              // Always convert to object format with sectionMark
              return { id: qId, sectionMark: newMark };
            }
            return q;
          });
          
          return {
            ...section,
            questions: updatedQuestions
          };
        }
        return section;
      });
      
      setSections(updatedSections);
      toast.success("Question mark updated");
    } catch (error) {
      console.error("Error updating section mark:", error);
      toast.error(`Failed to update section mark: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setSaving(false);
    }
  };
  
  // Function to move a section up or down in order
  const moveSection = async (sectionId: string, direction: 'up' | 'down'): Promise<void> => {
    try {
      setSaving(true);
      
      // Find current section and index
      const sectionIndex = sections.findIndex(s => s.id === sectionId);
      if (sectionIndex === -1) return;
      
      // Calculate target index based on direction
      const targetIndex = direction === 'up' ? sectionIndex - 1 : sectionIndex + 1;
      
      // Ensure target index is within bounds
      if (targetIndex < 0 || targetIndex >= sections.length) return;
      
      // Create a copy of sections array
      const updatedSections = [...sections];
      
      // Swap sections
      [updatedSections[sectionIndex], updatedSections[targetIndex]] = 
        [updatedSections[targetIndex], updatedSections[sectionIndex]];
      
      // Update order values
      updatedSections.forEach((section, index) => {
        section.order = index;
      });
      
      // Update local state
      setSections(updatedSections);
      
      // Save to database with the updated sections
      await saveChanges(updatedSections);
      toast.success(`Section moved ${direction}`);
    } catch (error) {
      console.error(`Error moving section ${direction}:`, error);
      toast.error(`Failed to move section ${direction}`);
      // Revert on error
      await fetchData();
    } finally {
      setSaving(false);
      // Make sure to turn off the loading state for this specific section
      setSectionLoadingState(sectionId, direction === 'up' ? 'movingUp' : 'movingDown', false);
    }
  };
  
  // Function to remove questions from a section
  const removeQuestionsFromSection = async (sectionId: string, questionIds: string[]): Promise<any> => {
    setSaving(true);
    try {
      if (!questionIds.length) {
        return { message: "No questions selected for removal" };
      }
      
      console.log(`Removing ${questionIds.length} question(s) from section ${sectionId}`);
      
      // Optimistic update of local state first for better UX
      const updatedSections = sections.map(section => {
        if (section.id === sectionId) {
          return {
            ...section,
            questions: section.questions.filter(q => {
              const qId = typeof q === 'string' ? q : q.id;
              return !questionIds.includes(qId);
            })
          };
        }
        return section;
      });
      
      // Update the UI immediately
      setSections(updatedSections);
      
      // Set a timeout for the fetch to prevent indefinite waiting
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
      
      try {
        // Try the direct API approach first (more efficient)
        const removeResponse = await fetch(`/api/assessments/${params.id}/sections/${sectionId}/questions/remove`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ questionIds }),
          signal: controller.signal
        }).catch(error => {
          clearTimeout(timeoutId);
          throw error;
        });
        
        clearTimeout(timeoutId);
        
        if (!removeResponse || !removeResponse.ok) {
          // If direct API fails, try the fallback route
          console.log("Direct removal API not available, falling back to general remove endpoint");
          throw new Error("Direct removal endpoint not available");
        }
        
        // Get response data from the direct API
        const directResponseData = await removeResponse.json().catch(() => ({ message: `Removed ${questionIds.length} questions` }));
        console.log("Direct removal API response:", directResponseData);
        return directResponseData;
      } catch (directApiError) {
        console.log("Falling back to general remove endpoint", directApiError);
        
        // Fallback to the general remove endpoint
        const fallbackController = new AbortController();
        const fallbackTimeoutId = setTimeout(() => fallbackController.abort(), 15000); // 15 second timeout
        
        try {
          const fallbackResponse = await fetch(`/api/assessments/${params.id}/questions/remove`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ 
              sectionId, 
              questionIds 
            }),
            signal: fallbackController.signal
          });
          
          clearTimeout(fallbackTimeoutId);
          
          if (!fallbackResponse.ok) {
            // If both APIs fail, fall back to saving the entire state
            console.log("Fallback API also failed, falling back to full state save");
            throw new Error("Fallback removal endpoint failed");
          }
          
          // Get response data from the fallback API
          const fallbackResponseData = await fallbackResponse.json().catch(() => ({ message: `Removed ${questionIds.length} questions` }));
          console.log("Fallback removal API response:", fallbackResponseData);
          return fallbackResponseData;
        } catch (fallbackError) {
          clearTimeout(fallbackTimeoutId);
          
          console.log("All removal APIs failed, falling back to full state save", fallbackError);
          
          // Last resort: save the entire state with the local updates we already made
          await saveChanges(updatedSections);
          return { message: `Removed ${questionIds.length} questions from section` };
        }
      }
    } catch (error) {
      console.error("Error removing questions:", error);
      toast.error(`Failed to remove questions: ${error instanceof Error ? error.message : String(error)}`);
      
      // If all attempts fail, revert the local state by re-fetching
      fetchData().catch(fetchError => {
        console.error("Failed to refresh data after error:", fetchError);
      });
      
      throw error;
    } finally {
      setSaving(false);
    }
  };
  
  // Function to check if all questions on the current page are selected
  const areAllQuestionsSelected = (): boolean => {
    if (paginatedQuestions.length === 0) return false;
    
    // Check if all questions on the current page are selected
    return paginatedQuestions.every(question => 
      selectedQuestions.includes(question.id));
  };
  
  // Function to toggle selection of all questions on the current page
  const toggleAllQuestions = (): void => {
    if (areAllQuestionsSelected()) {
      // If all are selected, remove all questions on this page from selection
      setSelectedQuestions(prevSelected => 
        prevSelected.filter(id => !paginatedQuestions.some(q => q.id === id))
      );
    } else {
      // Otherwise, add all questions on this page to selection
      const newSelections = paginatedQuestions.map(q => q.id);
      setSelectedQuestions(prevSelected => {
        // Create a Set to avoid duplicates
        const uniqueSelections = new Set([...prevSelected, ...newSelections]);
        return Array.from(uniqueSelections);
      });
    }
  };

  // Function to toggle selection of a single question
  const toggleQuestionSelection = (questionId: string): void => {
    setSelectedQuestions(prev => 
      prev.includes(questionId)
        ? prev.filter(id => id !== questionId)
        : [...prev, questionId]
    );
  };

  // Reset selected questions when modal closes
  useEffect(() => {
    if (!isAddQuestionModalOpen) {
      setSelectedQuestions([]);
    }
  }, [isAddQuestionModalOpen]);

  // Function to save the selected questions to the section when user clicks "Add Selected & Close"
  const addSelectedQuestionsToSection = async () => {
    if (!selectedSectionForQuestion || selectedQuestions.length === 0) {
      setIsAddQuestionModalOpen(false);
      return;
    }

    try {
      setSaving(true);
      
      // Find the current section
      const currentSection = sections.find(s => s.id === selectedSectionForQuestion);
      if (!currentSection) {
        toast.error("Selected section not found");
        return;
      }
      
      // Get the questions that aren't already in the section
      const newQuestions = selectedQuestions.filter(questionId => 
        !currentSection.questions.some(q => 
          typeof q === 'string' ? q === questionId : q.id === questionId
        )
      );
      
      if (newQuestions.length === 0) {
        // All selected questions are already in the section
        toast.info("All selected questions are already in this section");
        setIsAddQuestionModalOpen(false);
        setSelectedSectionForQuestion(null);
        setSelectedQuestions([]);
        setQuestionMarks({});
        return;
      }
      
      console.log(`Adding ${newQuestions.length} questions to section ${currentSection.id}`);
      
      // Create a direct API call for adding questions to avoid re-saving the entire assessment
      try {
        // Prepare payload for adding just the new questions
        const addQuestionsPayload = {
          sectionId: selectedSectionForQuestion,
          questions: newQuestions.map(qId => {
            // Find the question to get its default marks
            const question = paginatedQuestions.find(q => q.id === qId);
            const defaultMarks = question?.marks || 1;
            
            // If we have a custom mark set, use it; otherwise use the default marks
            const sectionMark = questionMarks[qId] !== undefined ? questionMarks[qId] : defaultMarks;
            
            return {
              id: qId,
              sectionMark: sectionMark
            };
          })
        };
        
        // Use a smaller, focused API endpoint for just adding questions
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
        
        const addResponse = await fetch(`/api/assessments/${params.id}/sections/${selectedSectionForQuestion}/questions`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(addQuestionsPayload),
          signal: controller.signal
        }).catch(error => {
          clearTimeout(timeoutId);
          throw error;
        });
        
        clearTimeout(timeoutId);
        
        if (!addResponse || !addResponse.ok) {
          // If the focused API fails or doesn't exist, fall back to the full save
          console.log("Focused API not available, falling back to full save");
          throw new Error("Direct add endpoint not available");
        }
        
        const addResponseData = await addResponse.json().catch(() => ({}));
        console.log("Questions added successfully via focused API:", addResponseData);
        
        // Update local state to match the server
      const updatedSections = sections.map(section => {
        if (section.id === selectedSectionForQuestion) {
          // Add the new questions to this section
            const updatedQuestions = [
              ...section.questions,
              ...newQuestions.map(qId => {
                const question = paginatedQuestions.find(q => q.id === qId);
                const defaultMarks = question?.marks || 1;
                const sectionMark = questionMarks[qId] !== undefined ? questionMarks[qId] : defaultMarks;
                
                return {
                  id: qId,
                  sectionMark: sectionMark
                };
              })
            ];
          
          return {
            ...section,
            questions: updatedQuestions
          };
        }
          return section;
        });
        
        setSections(updatedSections);
      } catch (directApiError) {
        console.log("Error with direct API, falling back to full save", directApiError);
        
        // Fall back to updating the full sections object
        const updatedSections = sections.map(section => {
          if (section.id === selectedSectionForQuestion) {
            // Add the new questions to this section
            const updatedQuestions = [
              ...section.questions,
              ...newQuestions.map(qId => {
                const question = paginatedQuestions.find(q => q.id === qId);
                const defaultMarks = question?.marks || 1;
                const sectionMark = questionMarks[qId] !== undefined ? questionMarks[qId] : defaultMarks;
                
                return {
                  id: qId,
                  sectionMark: sectionMark
                };
              })
            ];
            
            return {
              ...section,
              questions: updatedQuestions
            };
          }
          return {...section}; // Return copy of unchanged sections
        });
      
      // Update state with our deep copy
      setSections(updatedSections);
      
        // Save changes to database with the updated sections
        await saveChanges(updatedSections);
      }
      
      // Fetch updated questions to make sure we have the latest SectionQuestion data
      const refreshedQuestions = await fetchQuestionsWithSectionMarks().catch(() => null);
      if (refreshedQuestions) {
        setAvailableQuestions(refreshedQuestions);
      }
      
      // Close modal and reset selections
      setIsAddQuestionModalOpen(false);
      setSelectedSectionForQuestion(null);
      setSelectedQuestions([]);
      setQuestionMarks({});
      
      toast.success(`${newQuestions.length} questions added to section`);
    } catch (error) {
      console.error("Error adding questions to section:", error);
      toast.error("Failed to add questions to section: " + (error instanceof Error ? error.message : String(error)));
    } finally {
      setSaving(false);
    }
  };
  
  // Helper function to fetch questions with section marks
  const fetchQuestionsWithSectionMarks = async () => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
      
      const questionsRes = await fetch(
        `/api/questions?limit=1000&page=1&includeSectionMarks=true&assessmentId=${params.id}`,
        { signal: controller.signal }
      ).catch(error => {
        clearTimeout(timeoutId);
        throw error;
      });
      
      clearTimeout(timeoutId);
      
      if (!questionsRes.ok) throw new Error("Failed to fetch questions");
      
      const questionsData = await questionsRes.json();
      
      // Check if the response has a 'questions' property (nested structure)
      const questions = questionsData.questions 
        ? questionsData.questions 
        : (Array.isArray(questionsData) ? questionsData : []);
      
      // Transform the questions to match our interface
      const transformedQuestions = questions.map((question: any) => {
        // Extract question text from the appropriate field based on question type
        const questionText = question.mCQQuestion?.questionText || 
                            question.codingQuestion?.questionText || 
                            question.questionText || 
                            "";
        
        // Extract difficulty from the appropriate field
        const difficulty = question.mCQQuestion?.difficulty || 
                          question.codingQuestion?.difficulty || 
                          question.difficulty || 
                          "MEDIUM";
        
        // Extract marks/points
        const marks = question.mCQQuestion?.defaultMark || 
                      question.codingQuestion?.defaultMark || 
                      question.marks || 
                      1;
                      
        // Get section mark if the question is in a section
        const sectionQuestions = question.sections || [];
        const sectionQuestion = sectionQuestions.find((sq: any) => 
          sq.sectionId === selectedSectionForQuestion
        );
        const sectionMark = sectionQuestion?.sectionMark || marks;
                      
        return {
          id: question.id,
          name: question.name || "Untitled Question",
          description: questionText,
          type: question.type,
          status: question.status || "DRAFT",
          difficulty: difficulty,
          marks: marks,
          sectionMark: sectionMark,
          folderId: question.folderId,
          folder: question.folder
        };
      });
      
      return transformedQuestions;
    } catch (error) {
      console.error("Error fetching questions with section marks:", error);
      if (error instanceof Error && error.name === 'AbortError') {
        toast.error("Request timed out when fetching questions");
      }
      return null;
    }
  };

  // Function to update section mark in the modal
  const setQuestionMark = (questionId: string, mark: number) => {
    setQuestionMarks(prev => ({
      ...prev,
      [questionId]: mark
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }
  
  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Manage Questions</h1>
          <p className="text-muted-foreground">
            {assessment?.name || "Assessment"} - Organize questions into sections
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => router.back()}>
            Back to Assessment
          </Button>
          {saving && (
            <Button disabled className="bg-green-600">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
          </Button>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-1 gap-8">
        {/* Quick Stats and Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Sections</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{sections.length}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Organize your questions into logical groups
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Questions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {sections.reduce((sum, section) => sum + section.questions.length, 0)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Questions added across all sections
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Marks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalMarks}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Total marks across all sections
              </p>
            </CardContent>
          </Card>
        </div>
        
        {/* Important Notice */}
        <Card className="bg-green-50 border-green-200 mb-8">
          <CardContent className="p-4">
            <p className="text-green-700 font-medium flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
              Changes are saved automatically. Any modifications you make will be immediately saved to the database.
        </p>
          </CardContent>
        </Card>

      {/* Add New Section */}
        <Card>
        <CardHeader>
          <CardTitle>Add New Section</CardTitle>
          <CardDescription>
            Create a new section to organize questions
          </CardDescription>
        </CardHeader>
          <CardContent className="pb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
            <Input
              placeholder="Enter section name"
              value={newSectionName}
              onChange={(e) => setNewSectionName(e.target.value)}
                  className="h-10"
                />
              </div>
              <Button 
                onClick={addSection}
                disabled={!newSectionName.trim() || addingSectionLoading}
                className="min-w-24"
              >
                {addingSectionLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Adding...
                  </>
                ) : (
                  <>
              <Plus className="mr-2 h-4 w-4" />
              Add Section
                  </>
                )}
            </Button>
          </div>
        </CardContent>
      </Card>
      
        {/* Section Management */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Sections</h2>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                  // Expand all sections
                  const sectionElements = document.querySelectorAll('[data-section-toggle]');
                  sectionElements.forEach((el) => {
                    if (el instanceof HTMLElement && el.dataset.expanded === 'false') {
                      el.click();
                    }
                  });
                }}
              >
                <ChevronDown className="h-4 w-4 mr-1" />
                Expand All
                </Button>
                <Button
                variant="outline" 
                size="sm"
                onClick={() => {
                  // Collapse all sections
                  const sectionElements = document.querySelectorAll('[data-section-toggle]');
                  sectionElements.forEach((el) => {
                    if (el instanceof HTMLElement && el.dataset.expanded === 'true') {
                      el.click();
                    }
                  });
                }}
              >
                <ChevronRight className="h-4 w-4 mr-1" />
                Collapse All
                </Button>
              </div>
            </div>
          <div className="space-y-4 mb-10">
            {sections.length === 0 ? (
              <Card>
                <CardContent className="p-12 flex flex-col items-center justify-center">
                  <div className="rounded-full bg-muted p-4 mb-4">
                    <Layers className="h-8 w-8 text-muted-foreground" />
                                </div>
                  <h3 className="text-xl font-semibold mb-2">No Sections Created</h3>
                  <p className="text-muted-foreground text-center max-w-md mb-4">
                    Create your first section to start organizing questions for this assessment.
                  </p>
                  <Button 
                    onClick={() => {
                      // Focus the new section input
                      const input = document.querySelector('input[placeholder="Enter section name"]');
                      if (input instanceof HTMLElement) {
                        input.focus();
                      }
                    }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create First Section
                  </Button>
                </CardContent>
              </Card>
            ) : (
              // Maps sections to SectionCard components 
              sections.map((sectionItem, index) => (
                <SectionCard
                  key={sectionItem.id}
                  section={sectionItem}
                  sectionIndex={index}
                  totalSections={sections.length}
                  availableQuestions={availableQuestions}
                  toggleQuestion={toggleQuestion}
                  updateSectionMark={updateSectionMark}
                  removeSection={removeSection}
                  moveSection={moveSection}
                  setSelectedSectionForQuestion={setSelectedSectionForQuestion}
                  setIsAddQuestionModalOpen={setIsAddQuestionModalOpen}
                  allSections={sections}
                  setSections={setSections}
                  fetchData={fetchData}
                  saveChanges={saveChanges}
                  setSaving={setSaving}
                  removeQuestionsFromSection={removeQuestionsFromSection}
                  sectionLoadingStates={sectionLoadingStates}
                  setSectionLoadingState={setSectionLoadingState}
                  assessmentId={params.id as string} // Pass the assessmentId
                  setAvailableQuestions={setAvailableQuestions}
                />
              ))
                            )}
                          </div>
                        </div>
                    </div>

      {/* Add Question Modal */}
      <Dialog open={isAddQuestionModalOpen} onOpenChange={(open) => {
        if (!open) {
          // When closing the modal, reset selections
          setSelectedQuestions([]);
          setSelectedSectionForQuestion(null);
          setQuestionMarks({});
          clearFilters();
        }
        setIsAddQuestionModalOpen(open);
      }}>
        <DialogContent className="max-w-5xl max-h-[95vh] overflow-y-auto">
          <DialogHeader className="pb-1 mb-2">
            <DialogTitle>Add Questions to Section</DialogTitle>
            <DialogDescription>
              Select questions to add to {selectedSectionForQuestion ? 
                sections.find(s => s.id === selectedSectionForQuestion)?.name || "this section" : 
                "this section"}. You can optionally override the default mark for each question.
            </DialogDescription>
          </DialogHeader>
          
          {/* Filters Panel */}
          <Card className="mb-4">
            <CardHeader className="pb-3 pt-4">
              <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium flex items-center">
                  <Filter className="mr-2 h-4 w-4" />
                  Filter Questions
              </h3>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={clearFilters}
                className="h-8 px-2 text-muted-foreground"
              >
                <X className="mr-1 h-4 w-4" />
                Clear All
              </Button>
            </div>
            </CardHeader>
            <CardContent className="pb-4">
              <div className="space-y-4">
                {/* Search Input */}
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                        placeholder="Search questions..."
                  value={pendingFilters.search}
                  onChange={(e) => setPendingFilters(prev => ({ ...prev, search: e.target.value }))}
                        className="pl-8"
                />
                    </div>
                  </div>
              </div>
              
                {/* Filter Controls */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Select 
                  value={pendingFilters.folder} 
                  onValueChange={(value) => setPendingFilters(prev => ({ ...prev, folder: value }))}
                >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select Category/Folder">
                        {pendingFilters.folder === 'all' 
                          ? 'All Categories' 
                          : folders.find(f => f.id === pendingFilters.folder)?.name || 'Select Category/Folder'}
                      </SelectValue>
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px]">
                      <SelectItem value="all">All Categories</SelectItem>
                    {folders.filter(folder => !folder.parentId).map((folder) => (
                      <React.Fragment key={folder.id}>
                        <SelectItem value={folder.id}>
                          📁 {folder.name}
                        </SelectItem>
                        {folder.subfolders && folder.subfolders.length > 0 && 
                          folder.subfolders.map((subfolder: { id: string; name: string }) => (
                            <SelectItem key={subfolder.id} value={subfolder.id} className="pl-6">
                              └─ 📁 {subfolder.name}
                            </SelectItem>
                          ))
                        }
                      </React.Fragment>
                    ))}
                  </SelectContent>
                </Select>
              
                <Select 
                  value={pendingFilters.type} 
                  onValueChange={(value) => setPendingFilters(prev => ({ ...prev, type: value }))}
                >
                    <SelectTrigger>
                      <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="MCQ">MCQ</SelectItem>
                    <SelectItem value="CODING">Coding</SelectItem>
                  </SelectContent>
                </Select>
              
                <Select 
                  value={pendingFilters.status} 
                  onValueChange={(value) => setPendingFilters(prev => ({ ...prev, status: value }))}
                >
                    <SelectTrigger>
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="DRAFT">Draft</SelectItem>
                    <SelectItem value="READY">Ready</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
                {/* Additional Options */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                <Switch 
                      id="includeSubfolders"
                  checked={pendingFilters.includeSubfolders}
                  onCheckedChange={(checked) => setPendingFilters(prev => ({ ...prev, includeSubfolders: checked }))}
                      disabled={pendingFilters.folder === "all"}
                    />
                    <Label 
                      htmlFor="includeSubfolders" 
                      className={pendingFilters.folder === 'all' ? "text-muted-foreground" : ""}
                    >
                      Include subcategories
                </Label>
              </div>
              
                <Button 
                  onClick={applyFilters}
                    className="bg-primary"
                  disabled={isApplyingFilters}
                >
                  {isApplyingFilters && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {!isApplyingFilters && <RefreshCw className="mr-2 h-4 w-4" />}
                  Apply Filters
                </Button>
              </div>
            </div>
            </CardContent>
          </Card>

          {/* Questions Per Page Selector and Stats */}
          <div className="flex items-center justify-between mb-3 px-1 py-1">
            <div className="text-sm text-muted-foreground">
              {totalQuestionCount === 0 ? (
                "No questions found"
              ) : (
                `${totalQuestionCount} questions found`
              )}
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  Rows per page
                </span>
              <Select 
                value={questionsPerPage.toString()} 
                onValueChange={(value) => {
                    const newPerPage = parseInt(value, 10);
                    setQuestionsPerPage(newPerPage);
                    // Refetch with new page size
                    fetchPaginatedQuestions(currentPage, {
                      search: searchQuery,
                      type: typeFilter !== 'all' ? typeFilter : '',
                      difficulty: difficultyFilter !== 'all' ? difficultyFilter : '',
                      status: statusFilter !== 'all' ? statusFilter : '',
                      folder: folderFilter !== 'all' ? folderFilter : '',
                      limit: newPerPage
                    });
                  }}
                >
                  <SelectTrigger className="w-[70px] h-8">
                  <SelectValue placeholder="20" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5</SelectItem>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
              </div>
            </div>
          </div>

          {/* Questions List with Table Header */}
          <div className="border rounded-md mb-4 relative">
            <div>
              {/* Table Header - Make it sticky relative to the container */}
              <div className="sticky top-0 z-20 border-b bg-muted/95">
                <div className="flex items-center px-4 py-2">
                  <div className="flex items-center">
                  <Checkbox
                    id="select-all-questions"
                    checked={areAllQuestionsSelected()}
                      onCheckedChange={toggleAllQuestions}
                    aria-label="Select all questions on this page"
                  />
                  <label
                    htmlFor="select-all-questions"
                    className="ml-2 text-sm font-medium"
                  >
                      Select All
                  </label>
                </div>
                </div>
                <div className="grid grid-cols-12 gap-2 px-4 py-2 text-xs font-medium text-muted-foreground border-t">
                  <div className="col-span-5">Name</div>
                  <div className="col-span-1 text-center">Type</div>
                  <div className="col-span-1 text-center">Status</div>
                  <div className="col-span-1 text-center">Difficulty</div>
                  <div className="col-span-2">Folder</div>
                  <div className="col-span-2 text-center">Marks & Override</div>
              </div>
              </div>
              
              <div className="questions-list overflow-y-auto" style={{ height: "60vh" }}>
                {isLoadingQuestions ? (
                  <div className="flex flex-col items-center justify-center h-full min-h-[400px]">
                    <Loader2 className="h-12 w-12 mx-auto mb-4 animate-spin text-primary" />
                    <p className="text-muted-foreground text-lg">Loading questions...</p>
                  </div>
                ) : paginatedQuestions.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full min-h-[400px]">
                    <Filter className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                    <p className="text-xl font-medium mb-2">No questions match your filters</p>
                    <p className="text-muted-foreground mb-6 text-center max-w-md">
                      Try adjusting your filters or clearing them to see more questions
                    </p>
                    <Button 
                      variant="outline" 
                      onClick={clearFilters}
                    >
                      <X className="mr-2 h-4 w-4" />
                      Clear All Filters
                    </Button>
                  </div>
                ) : (
                  <div className="divide-y divide-border">
                    {paginatedQuestions.map((question) => (
                      <div
                        key={question.id}
                        className="hover:bg-muted/50 transition-colors"
                      >
                        <div className="grid grid-cols-12 gap-2 items-center px-4 py-3">
                          <div className="col-span-5 flex items-center space-x-3">
                        <Checkbox
                          id={`modal-question-${question.id}`}
                              checked={selectedQuestions.includes(question.id)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setSelectedQuestions([...selectedQuestions, question.id]);
                                } else {
                                  setSelectedQuestions(selectedQuestions.filter(id => id !== question.id));
                                }
                              }}
                          className="mt-1"
                        />
                            <div>
                              <label
                                htmlFor={`modal-question-${question.id}`}
                                className="font-medium text-sm cursor-pointer"
                              >
                                {question.name || "Untitled Question"}
                              </label>
                              {question.description && (
                                <p className="text-xs text-muted-foreground line-clamp-1 mt-1">
                                  {question.description}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="col-span-1 text-center">
                            <Badge variant="outline" className={question.type === 'MCQ' ? 'bg-blue-50 text-blue-700 hover:bg-blue-50' : 'bg-purple-50 text-purple-700 hover:bg-purple-50'}>
                              {question.type}
                            </Badge>
                          </div>
                          <div className="col-span-1 text-center">
                            <Badge variant={question.status === 'READY' ? 'default' : 'secondary'}>
                              {question.status}
                            </Badge>
                          </div>
                          <div className="col-span-1 text-center">
                            <Badge variant="outline" className={
                              question.difficulty === 'EASY' 
                                ? 'bg-green-50 text-green-700 hover:bg-green-50' 
                                : question.difficulty === 'MEDIUM'
                                ? 'bg-yellow-50 text-yellow-700 hover:bg-yellow-50'
                                : 'bg-red-50 text-red-700 hover:bg-red-50'
                            }>
                              {question.difficulty}
                            </Badge>
                          </div>
                          <div className="col-span-2 flex items-center">
                            <span className="flex items-center text-xs">
                                  <FolderIcon className="h-3 w-3 mr-1 text-muted-foreground/70" />
                                  {question.folder?.name || "Uncategorized"}
                                </span>
                              </div>
                          <div className="col-span-2 text-center">
                            <div className="flex items-center justify-center gap-2">
                            <Badge variant="outline" className="bg-green-50 text-green-700">
                              {question.marks || 1} marks
                            </Badge>
                              <div className="relative">
                                <Input 
                                  type="number" 
                                  step="0.5"
                                  min="0"
                                  className={`h-6 w-16 text-xs ${questionMarks[question.id] !== undefined ? 'bg-blue-50 border-blue-300 text-blue-700' : ''}`}
                                  placeholder={`Override`}
                                  value={questionMarks[question.id] !== undefined ? questionMarks[question.id] : ''}
                                  onChange={(e) => {
                                    const newMark = parseFloat(e.target.value);
                                    if (!isNaN(newMark) || e.target.value === '') {
                                      if (e.target.value === '') {
                                        // Create a new object without this question ID
                                        const newMarks = {...questionMarks};
                                        delete newMarks[question.id];
                                        setQuestionMarks(newMarks);
                                      } else {
                                        setQuestionMark(question.id, newMark);
                                      }
                                    }
                                  }}
                                />
                                {questionMarks[question.id] !== undefined && (
                                  <div className="absolute -top-2 -right-2 h-4 w-4 bg-primary rounded-full flex items-center justify-center">
                                    <span className="text-[10px] text-white font-bold">✓</span>
                                  </div>
                                )}
                              </div>
                            </div>
                            </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Pagination */}
          <div className="border-t py-1 px-4 mb-3">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                {totalQuestionCount === 0 ? (
                  "No questions found"
                ) : (
                  `Showing ${(currentPage - 1) * questionsPerPage + 1}-${Math.min(currentPage * questionsPerPage, totalQuestionCount)} of ${totalQuestionCount} questions`
                )}
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => paginate(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1 || totalQuestionCount === 0 || isLoadingQuestions}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Previous
                </Button>
                <div className="flex items-center space-x-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    // Page numbering logic - exactly matching admin/questions/page.tsx
                    let pageToShow;
                    if (totalPages <= 5) {
                      pageToShow = i + 1;
                    } else if (currentPage <= 3) {
                      pageToShow = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageToShow = totalPages - 4 + i;
                    } else {
                      pageToShow = currentPage - 2 + i;
                    }
                    
                    return (
                      <Button
                        key={pageToShow}
                        variant={currentPage === pageToShow ? "default" : "outline"}
                        size="sm"
                        onClick={() => paginate(pageToShow)}
                        className="w-8 h-8 p-0"
                        disabled={isLoadingQuestions}
                      >
                        {pageToShow}
                      </Button>
                    );
                  })}
                  
                  {totalPages > 5 && currentPage < totalPages - 2 && (
                    <>
                      <span className="mx-1">...</span>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-8 h-8 p-0"
                        onClick={() => paginate(totalPages)}
                        disabled={isLoadingQuestions}
                      >
                        {totalPages}
                      </Button>
                    </>
                  )}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages || totalQuestionCount === 0 || isLoadingQuestions}
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          </div>

          <DialogFooter className="border-t py-3 px-4">
            <div className="flex items-center justify-between w-full">
              <div className="text-sm">
                <span className="font-medium">{selectedQuestions.length}</span> questions selected 
                {paginatedQuestions.length > 0 && (
                  <span className="text-muted-foreground ml-1">
                    (out of {paginatedQuestions.length} filtered, {totalQuestionCount} total)
                  </span>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsAddQuestionModalOpen(false);
                    setSelectedQuestions([]);
                    setSelectedSectionForQuestion(null);
                    setQuestionMarks({});
                    clearFilters();
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={addSelectedQuestionsToSection}
                  disabled={saving || selectedQuestions.length === 0}
                >
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Adding Questions...
                    </>
                  ) : (
                    'Add Selected & Close'
                  )}
                </Button>
              </div>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}

