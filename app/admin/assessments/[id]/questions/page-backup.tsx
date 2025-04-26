"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Loader2, Plus, Trash2, ChevronDown, ChevronUp, PlusCircle, Search, Filter, ChevronLeft, ChevronRight, RefreshCw, SlidersHorizontal, X } from "lucide-react";
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
}

interface Section {
  id: string;
  name: string;
  description?: string | null;
  order?: number;
  questions: string[]; // Array of question IDs
}

export default function QuestionsPage() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
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
  
  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch assessment details
      const assessmentRes = await fetch(`/api/assessments/${params.id}`);
      if (!assessmentRes.ok) throw new Error("Failed to fetch assessment");
      const assessmentData = await assessmentRes.json();
      
      console.log("Assessment API response:", assessmentData);
      setAssessment(assessmentData);

      // Initialize sections from assessment data
      if (assessmentData.sections && assessmentData.sections.length > 0) {
        // Transform the sections data to match our interface
        const transformedSections = assessmentData.sections.map((section: any) => {
          // Get existing questions if available
          const sectionQuestions = section.questions || [];
          
          console.log(`Section ${section.title} has ${sectionQuestions.length} questions:`, sectionQuestions);
          
          return {
            id: section.id,
            name: section.title, // Map title field from DB to name in our interface
            description: section.description,
            order: section.order,
            questions: sectionQuestions // Use section questions if available
          };
        });
        console.log("Transformed sections from API:", transformedSections);
        setSections(transformedSections);
      } else {
        console.log("No sections found, creating default section");
        // Create a default section if none exists
        setSections([{
          id: "default-" + Date.now(),
          name: "Default Section",
          description: null,
          order: 0,
          questions: []
        }]);
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
      
      // Fetch all available questions
      const questionsRes = await fetch("/api/questions?limit=1000&page=1");
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
          folder: question.folder
        };
      });
      
      console.log("Transformed questions:", transformedQuestions);
      setAvailableQuestions(transformedQuestions);
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
  
  const handleSave = async () => {
    setSaving(true);
    try {
      console.log("Saving sections:", sections);
      
      // Make sure all sections have a questions array, even if it's empty
      const sectionsWithQuestions = sections.map(section => ({
        ...section,
        questions: section.questions || []
      }));
      
      // Prepare the data to be sent
      const dataToSend = {
        sections: sectionsWithQuestions.map(section => ({
          id: section.id,
          name: section.name,
          description: section.description || null,
          order: section.order || 0,
          questions: section.questions
        }))
      };
      
      console.log("Formatted data to send:", JSON.stringify(dataToSend));
      
      const response = await fetch(`/api/assessments/${params.id}/questions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dataToSend),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error response:", errorData);
        throw new Error(errorData.error || "Failed to save questions");
      }
      
      const responseData = await response.json();
      console.log("Success response:", responseData);
      
      // Show success message without redirecting
      toast.success("Questions saved successfully!", {
        duration: 3000,
        position: "top-center",
      });
      
      // Fetch updated data to refresh the UI
      const assessmentRes = await fetch(`/api/assessments/${params.id}`);
      if (assessmentRes.ok) {
        const assessmentData = await assessmentRes.json();
        setAssessment(assessmentData);
        
        // Update sections if available in the response
        if (assessmentData.sections && assessmentData.sections.length > 0) {
          const transformedSections = assessmentData.sections.map((section: any) => ({
            id: section.id,
            name: section.title,
            description: section.description,
            order: section.order,
            questions: section.questions || []
          }));
          setSections(transformedSections);
        }
      }
    } catch (error) {
      console.error("Error saving questions:", error);
      toast.error(error instanceof Error ? error.message : "Failed to save questions");
    } finally {
      setSaving(false);
    }
  };

  const addSection = async () => {
    if (!newSectionName.trim()) {
      toast.error("Section name is required");
      return;
    }

    const newSection: Section = {
      id: `section-${Date.now()}`,
      name: newSectionName.trim(),
      description: null,
      order: sections.length, // Set order based on current sections count
      questions: []
    };

    console.log("Adding new section:", newSection);
    
    // Add the section locally first
    setSections([...sections, newSection]);
    setNewSectionName("");
    
    // We don't need to save each section immediately
    // The sections will be saved when the user clicks "Save Changes"
    toast.success("Section added. Don't forget to click Save Changes to persist your changes!", {
      duration: 5000 // Show for 5 seconds
    });
  };

  const removeSection = async (sectionId: string) => {
    try {
      // Get the updated sections list
      const updatedSections = sections.filter(section => section.id !== sectionId);
      
      // Remove the section locally first for immediate UI feedback
      setSections(updatedSections);

      console.log("Sending data:", updatedSections); // Debug
      
      // Save the updated sections to the database
      const response = await fetch(`/api/assessments/${params.id}/questions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          sections: updatedSections.map(section => ({
            id: section.id,
            name: section.name,
            description: section.description || null,
            order: section.order || 0,
            questions: section.questions || []
          }))
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error response:", errorData);
        throw new Error(errorData.error || "Failed to delete section");
      }
      
      toast.success("Section deleted successfully");
    } catch (error) {
      console.error("Error deleting section:", error);
      toast.error(error instanceof Error ? error.message : "Failed to delete section");
      // Revert the local state if the API call fails
      setSections(sections);
    }
  };

  const toggleQuestion = (sectionId: string, questionId: string) => {
    try {
      setSections(sections.map(section => {
        if (section.id === sectionId) {
          const existingQuestions = section.questions || [];
          const questions = existingQuestions.includes(questionId)
            ? existingQuestions.filter(id => id !== questionId)
            : [...existingQuestions, questionId];
          
          console.log(`${existingQuestions.includes(questionId) ? 'Removing' : 'Adding'} question ${questionId} ${existingQuestions.includes(questionId) ? 'from' : 'to'} section ${sectionId}`);
          console.log("Updated questions for section:", questions);
          
          return { ...section, questions };
        }
        return section;
      }));
    } catch (error) {
      console.error("Error toggling question:", error);
      toast.error("Failed to update question selection");
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

  // Apply filters function
  const applyFilters = () => {
    setIsApplyingFilters(true);
    
    setSearchQuery(pendingFilters.search);
    setTypeFilter(pendingFilters.type);
    setDifficultyFilter(pendingFilters.difficulty);
    setStatusFilter(pendingFilters.status);
    setFolderFilter(pendingFilters.folder);
    setIncludeSubfolders(pendingFilters.includeSubfolders);
    setCurrentPage(1); // Reset to first page
    
    setIsApplyingFilters(false);
  };
  
  // Clear filters function
  const clearFilters = () => {
    setPendingFilters({
      search: "",
      type: "all",
      difficulty: "all",
      status: "all",
      folder: "all",
      includeSubfolders: true
    });
    
    // Also apply the cleared filters immediately
    setSearchQuery("");
    setTypeFilter("all");
    setDifficultyFilter("all");
    setStatusFilter("all");
    setFolderFilter("all");
    setIncludeSubfolders(true);
    setCurrentPage(1);
  };

  // Modify the filter logic to properly handle includeSubfolders
  const filteredQuestions = availableQuestions.filter(question => {
    // Null-safety for all comparisons
    const questionName = (question.name || "").toLowerCase();
    const questionDesc = (question.description || "").toLowerCase();
    const searchTerm = (searchQuery || "").toLowerCase();
    
    // Search in both name and description
    const matchesSearch = searchTerm === "" || 
                         questionName.includes(searchTerm) || 
                         questionDesc.includes(searchTerm);
    
    // Type filter - ensure null safety
    const questionType = question.type || "";
    const matchesType = typeFilter === "all" || questionType === typeFilter;
    
    // Difficulty filter - ensure null safety
    const questionDifficulty = question.difficulty || "";
    const matchesDifficulty = difficultyFilter === "all" || questionDifficulty === difficultyFilter;
    
    // Status filter - ensure null safety
    const questionStatus = question.status || "";
    const matchesStatus = statusFilter === "all" || questionStatus === statusFilter;
    
    // Folder filtering logic with null safety
    let matchesFolder = true;
    if (folderFilter !== "all") {
      const questionFolderId = question.folderId || "";
      
      // First determine if the selected folder is a parent or a child
      const isParentFolder = folders.some(f => 
        f.id === folderFilter && f.subfolders && f.subfolders.length > 0
      );
      
      const isSubfolder = folders.some(f => 
        f.subfolders && f.subfolders.some((sub: { id: string }) => sub.id === folderFilter)
      );
      
      console.log(
        `Filtering by folder: ${folderFilter}, ` +
        `isParentFolder: ${isParentFolder}, ` + 
        `isSubfolder: ${isSubfolder}, ` +
        `includeSubfolders: ${includeSubfolders}`
      );
      
      if (isParentFolder && includeSubfolders) {
        // It's a parent folder and we want to include subfolders
        const folder = folders.find(f => f.id === folderFilter);
        if (folder && folder.subfolders) {
          const subfoldersIds = folder.subfolders.map((sub: { id: string }) => sub.id);
          // Match if the question is in the parent folder OR any of its subfolders
          matchesFolder = questionFolderId === folderFilter || subfoldersIds.includes(questionFolderId);
          console.log(`Checking if question ${question.id} matches parent folder ${folderFilter} or any subfolders: ${matchesFolder}`);
        } else {
          matchesFolder = questionFolderId === folderFilter;
        }
      } else {
        // It's either a subfolder, or we don't want to include subfolders,
        // so just match the exact folder ID
        matchesFolder = questionFolderId === folderFilter;
        console.log(`Exact folder match for question ${question.id} with folder ${folderFilter}: ${matchesFolder}`);
      }
    }
    
    return matchesSearch && matchesType && matchesDifficulty && matchesStatus && matchesFolder;
  });
  
  // Debug filtered questions
  console.log("Available questions count:", availableQuestions.length);
  console.log("Filtered questions count:", filteredQuestions.length);
  console.log("Filter criteria:", { 
    searchQuery, 
    typeFilter, 
    difficultyFilter, 
    statusFilter, 
    folderFilter,
    includeSubfolders
  });
  
  // Pagination logic
  const indexOfLastQuestion = currentPage * questionsPerPage;
  const indexOfFirstQuestion = indexOfLastQuestion - questionsPerPage;
  const currentQuestions = filteredQuestions.slice(indexOfFirstQuestion, indexOfLastQuestion);
  const totalPages = Math.ceil(filteredQuestions.length / questionsPerPage);

  // Function to change page
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  // Update the toggleAllQuestions function to only work with current page questions
  const toggleAllQuestions = () => {
    const currentPageQuestionIds = currentQuestions.map(q => q.id);
    console.log("Current page question IDs:", currentPageQuestionIds);
    
    if (areAllQuestionsSelected()) {
      // If all questions on the current page are selected, deselect them
      const updatedSections = [...sections];
      const sectionIndex = updatedSections.findIndex(s => s.id === selectedSectionForQuestion);
      
      if (sectionIndex !== -1) {
        const updatedSectionQuestions = updatedSections[sectionIndex].questions.filter(
          id => !currentPageQuestionIds.includes(id)
        );
        updatedSections[sectionIndex] = {
          ...updatedSections[sectionIndex],
          questions: updatedSectionQuestions
        };
        
        setSections(updatedSections);
        toast.success(`Deselected ${currentPageQuestionIds.length} questions on this page`);
      }
    } else {
      // If not all questions on the current page are selected, select them all
      const updatedSections = [...sections];
      const sectionIndex = updatedSections.findIndex(s => s.id === selectedSectionForQuestion);
      
      if (sectionIndex !== -1) {
        const currentSectionQuestions = updatedSections[sectionIndex].questions;
        const questionsToAdd = currentPageQuestionIds.filter(
          id => !currentSectionQuestions.includes(id)
        );
        
        updatedSections[sectionIndex] = {
          ...updatedSections[sectionIndex],
          questions: [...currentSectionQuestions, ...questionsToAdd]
        };
        
        setSections(updatedSections);
        toast.success(`Selected ${questionsToAdd.length} questions on this page`);
      }
    }
  };

  // Update the areAllQuestionsSelected function to check only current page questions
  const areAllQuestionsSelected = () => {
    if (!selectedSectionForQuestion) return false;
    
    const sectionIndex = sections.findIndex(s => s.id === selectedSectionForQuestion);
    if (sectionIndex === -1) return false;
    
    const sectionQuestions = sections[sectionIndex].questions;
    const currentPageQuestionIds = currentQuestions.map(q => q.id);
    
    return currentPageQuestionIds.every(id => sectionQuestions.includes(id));
  };

  // Add a function to update section mark
  const updateSectionMark = async (questionId: string, sectionId: string, newMark: number) => {
    try {
      const response = await fetch(`/api/assessments/${params.id}/questions/${questionId}/mark`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sectionId,
          mark: newMark
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update section mark');
      }

      toast.success('Section mark updated successfully');
      // Refresh the questions list
      fetchData();
    } catch (error) {
      console.error('Error updating section mark:', error);
      toast.error('Failed to update section mark');
    }
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
            Cancel
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={saving}
            className="bg-green-600 hover:bg-green-700"
            size="lg"
          >
            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Save Changes to Database
          </Button>
        </div>
      </div>
      
      <div className="p-4 mb-4 bg-yellow-50 border border-yellow-200 rounded-md">
        <p className="text-yellow-700 font-medium flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          Important: Remember to click "Save Changes" after adding or modifying sections to persist your changes to the database.
        </p>
      </div>

      {/* Add New Section */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Add New Section</CardTitle>
          <CardDescription>
            Create a new section to organize questions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Input
              placeholder="Enter section name"
              value={newSectionName}
              onChange={(e) => setNewSectionName(e.target.value)}
            />
            <Button onClick={addSection}>
              <Plus className="mr-2 h-4 w-4" />
              Add Section
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {/* Sections and Questions */}
      <Accordion type="single" collapsible className="space-y-4">
        {sections.map((section) => (
          <AccordionItem key={section.id} value={section.id}>
            <div className="flex items-center justify-between p-4 border rounded-t-lg">
              <AccordionTrigger className="flex-1">
                <div className="flex items-center">
                  <span className="font-semibold">{section.name}</span>
                  <span className="ml-2 text-sm text-muted-foreground">
                    ({section.questions.length} questions)
                  </span>
                </div>
              </AccordionTrigger>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedSectionForQuestion(section.id);
                    setIsAddQuestionModalOpen(true);
                  }}
                >
                  <PlusCircle className="h-4 w-4 mr-1" />
                  Add Questions
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeSection(section.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <AccordionContent>
              <Card>
                <CardContent className="pt-6">
                  {availableQuestions.length === 0 ? (
                    <p className="text-center py-4 text-muted-foreground">
                      No questions available. Please create questions first.
                    </p>
                  ) : section.questions.length === 0 ? (
                    <p className="text-center py-4 text-muted-foreground">
                      No questions added to this section yet. Click "Add Questions" to select questions.
                    </p>
                  ) : (
                    <div className="w-full">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="bg-muted/50">
                            <th className="text-left p-2 text-sm font-medium">Question</th>
                            <th className="text-left p-2 text-sm font-medium w-24">Type</th>
                            <th className="text-left p-2 text-sm font-medium w-24">Default Mark</th>
                            <th className="text-left p-2 text-sm font-medium w-32">Section Mark</th>
                            <th className="text-center p-2 text-sm font-medium w-16">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y">
                          {availableQuestions
                            .filter(question => section.questions.includes(question.id))
                            .map((question) => (
                            <tr key={question.id} className="hover:bg-accent/50 transition-colors">
                              <td className="p-2">
                                <div>
                                  <div className="font-medium">{question.name}</div>
                                  <div className="text-xs text-muted-foreground line-clamp-1">
                                    {question.description || "No description available"}
                                  </div>
                                </div>
                              </td>
                              <td className="p-2">
                                <span className={`px-1.5 py-0.5 rounded text-xs ${
                                  question.type === 'MCQ' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                                }`}>
                                  {question.type || "Unknown"}
                                </span>
                              </td>
                              <td className="p-2">
                                <span className="bg-green-100 text-green-800 px-1.5 py-0.5 rounded text-xs">
                                  {question.marks || 1}m
                                </span>
                              </td>
                              <td className="p-2">
                                <Input 
                                  type="number" 
                                  step="0.5"
                                  min="0"
                                  className="h-8 w-20 text-xs"
                                  defaultValue={question.sectionMark !== undefined ? question.sectionMark : question.marks}
                                  onChange={(e) => {
                                    const newMark = parseFloat(e.target.value);
                                    if (!isNaN(newMark)) {
                                      updateSectionMark(question.id, section.id, newMark);
                                    }
                                  }}
                                />
                              </td>
                              <td className="p-2 text-center">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7"
                                  onClick={() => toggleQuestion(section.id, question.id)}
                                  title="Remove question from section"
                                >
                                  <Trash2 className="h-4 w-4 text-red-500" />
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      {/* Add Question Modal */}
      <Dialog open={isAddQuestionModalOpen} onOpenChange={setIsAddQuestionModalOpen}>
        <DialogContent className="max-w-5xl h-[1100px] max-h-[98vh] overflow-hidden flex flex-col">
          <DialogHeader className="pb-1">
            <DialogTitle>Add Questions to Section</DialogTitle>
            <DialogDescription>
              Select questions to add to this section
            </DialogDescription>
          </DialogHeader>
          
          {/* Filters Panel */}
          <div className="border rounded-lg p-1.5 mb-1">
            <div className="flex items-center justify-between mb-0">
              <h3 className="text-sm font-medium flex items-center">
                <SlidersHorizontal className="mr-2 h-4 w-4" />
                Filters
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
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-1">
              <div className="col-span-1 md:col-span-4 relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search questions by name or description..."
                  value={pendingFilters.search}
                  onChange={(e) => setPendingFilters(prev => ({ ...prev, search: e.target.value }))}
                  className="pl-8 h-8"
                />
              </div>
              
              <div className="space-y-1">
                <Label htmlFor="folder-filter" className="text-xs">Folder</Label>
                <Select 
                  value={pendingFilters.folder} 
                  onValueChange={(value) => setPendingFilters(prev => ({ ...prev, folder: value }))}
                >
                  <SelectTrigger id="folder-filter">
                    <SelectValue placeholder="Select Folder" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px]">
                    <SelectItem value="all">All Folders</SelectItem>
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
              </div>
              
              <div className="space-y-1">
                <Label htmlFor="type-filter" className="text-xs">Question Type</Label>
                <Select 
                  value={pendingFilters.type} 
                  onValueChange={(value) => setPendingFilters(prev => ({ ...prev, type: value }))}
                >
                  <SelectTrigger id="type-filter">
                    <SelectValue placeholder="Question Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="MCQ">Multiple Choice</SelectItem>
                    <SelectItem value="CODING">Coding</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-1">
                <Label htmlFor="status-filter" className="text-xs">Status</Label>
                <Select 
                  value={pendingFilters.status} 
                  onValueChange={(value) => setPendingFilters(prev => ({ ...prev, status: value }))}
                >
                  <SelectTrigger id="status-filter">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="DRAFT">Draft</SelectItem>
                    <SelectItem value="READY">Ready</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-1">
                <Label htmlFor="difficulty-filter" className="text-xs">Difficulty</Label>
                <Select 
                  value={pendingFilters.difficulty} 
                  onValueChange={(value) => setPendingFilters(prev => ({ ...prev, difficulty: value }))}
                >
                  <SelectTrigger id="difficulty-filter">
                    <SelectValue placeholder="Difficulty" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Difficulties</SelectItem>
                    <SelectItem value="EASY">Easy</SelectItem>
                    <SelectItem value="MEDIUM">Medium</SelectItem>
                    <SelectItem value="HARD">Hard</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center h-9 space-x-2 pt-6">
                <Switch 
                  id="include-subfolders" 
                  checked={pendingFilters.includeSubfolders}
                  onCheckedChange={(checked) => setPendingFilters(prev => ({ ...prev, includeSubfolders: checked }))}
                  disabled={
                    pendingFilters.folder === "all" || 
                    !folders.some(f => 
                      f.id === pendingFilters.folder && 
                      f.subfolders && 
                      f.subfolders.length > 0
                    )
                  }
                />
                <Label htmlFor="include-subfolders" className="text-sm">
                  Include Subfolders
                </Label>
              </div>
              
              <div className="col-span-1 md:col-span-4 flex justify-end mt-1">
                <Button 
                  onClick={applyFilters}
                  className="w-full md:w-auto bg-primary"
                  disabled={isApplyingFilters}
                >
                  {isApplyingFilters && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {!isApplyingFilters && <RefreshCw className="mr-2 h-4 w-4" />}
                  Apply Filters
                </Button>
              </div>
            </div>
          </div>

          {/* Questions Per Page Selector */}
          <div className="flex justify-between items-center mb-1 px-1 py-1">
            <div className="text-sm text-muted-foreground">
              {filteredQuestions.length === 0 ? (
                "No questions found"
              ) : (
                `${filteredQuestions.length} questions found`
              )}
            </div>
            <div className="flex items-center space-x-2">
              <Label htmlFor="per-page" className="text-sm">Show</Label>
              <Select 
                value={questionsPerPage.toString()} 
                onValueChange={(value) => {
                  setQuestionsPerPage(parseInt(value, 10));
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger id="per-page" className="h-8 w-[70px]">
                  <SelectValue placeholder="20" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5</SelectItem>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="15">15</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
              <span className="text-sm">per page</span>
            </div>
          </div>

          {/* Questions List Header with Select All */}
          <div className="flex-1 overflow-hidden border rounded-md" style={{ height: '800px' }}>
            <div className="h-full overflow-y-auto">
              {/* Questions List Header with Select All */}
              <div className="sticky top-0 z-10 flex items-center justify-between px-4 py-1.5 border-b bg-muted/50">
                <div className="flex items-center px-4">
                  <Checkbox
                    id="select-all-questions"
                    checked={areAllQuestionsSelected()}
                    onCheckedChange={() => toggleAllQuestions()}
                    aria-label="Select all questions on this page"
                  />
                  <label
                    htmlFor="select-all-questions"
                    className="ml-2 text-sm font-medium"
                  >
                    Select All on This Page ({currentQuestions.length})
                  </label>
                </div>
                <div className="text-xs text-muted-foreground">
                  {filteredQuestions.length} questions found
                </div>
              </div>
              <div className="h-[calc(100%-2rem)] overflow-y-auto">
                {availableQuestions.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full min-h-[400px]">
                    <Loader2 className="h-12 w-12 mx-auto mb-4 animate-spin text-primary" />
                    <p className="text-muted-foreground text-lg">Loading questions...</p>
                  </div>
                ) : filteredQuestions.length === 0 ? (
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
                  <div className="divide-y">
                    {currentQuestions.map((question) => (
                      <div
                        key={question.id}
                        className="flex items-start space-x-3 py-1.5 px-4 hover:bg-accent/50 transition-colors"
                      >
                        <Checkbox
                          id={`modal-question-${question.id}`}
                          checked={selectedSectionForQuestion ? sections.find(s => s.id === selectedSectionForQuestion)?.questions.includes(question.id) : false}
                          onCheckedChange={() => {
                            if (selectedSectionForQuestion) {
                              toggleQuestion(selectedSectionForQuestion, question.id);
                            }
                          }}
                          className="mt-1"
                        />
                        <div className="grid gap-1 flex-1">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <label
                                htmlFor={`modal-question-${question.id}`}
                                className="font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                              >
                                {question.name || "Untitled Question"}
                              </label>
                              <div className="flex items-center ml-3">
                                <span className="text-xs text-muted-foreground flex items-center mr-2">
                                  <FolderIcon className="h-3 w-3 mr-1 text-muted-foreground/70" />
                                  {question.folder?.name || "Uncategorized"}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-1">
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
                              <div className="flex items-center gap-2 ml-2">
                                <div className="flex items-center">
                                  <span className="text-xs mr-1">Default:</span>
                                  <span className="bg-green-100 text-green-800 px-1.5 py-0.5 rounded text-xs">
                                    {question.marks || 1}m
                                  </span>
                                </div>
                                <div className="flex items-center">
                                  <span className="text-xs mr-1">Section:</span>
                                  <Input 
                                    type="number" 
                                    step="0.5"
                                    min="0"
                                    className="h-6 w-16 text-xs"
                                    defaultValue={question.sectionMark !== undefined ? question.sectionMark : question.marks}
                                    onChange={(e) => {
                                      const newMark = parseFloat(e.target.value);
                                      if (!isNaN(newMark)) {
                                        updateSectionMark(question.id, section.id, newMark);
                                      }
                                    }}
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                          {question.description ? (
                            <p className="text-xs text-muted-foreground line-clamp-1">
                              {question.description}
                            </p>
                          ) : (
                            <p className="text-xs text-muted-foreground italic">
                              No description available
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}