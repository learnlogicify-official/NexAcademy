"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Loader2, Plus, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface Question {
  id: string;
  name: string;
  description: string;
  type: string;
  status: string;
  difficulty: string;
  marks: number;
}

interface Section {
  id: string;
  name: string;
  description?: string;
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
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch assessment details
        const assessmentRes = await fetch(`/api/assessments/${params.id}`);
        if (!assessmentRes.ok) throw new Error("Failed to fetch assessment");
        const assessmentData = await assessmentRes.json();
        setAssessment(assessmentData);
        
        // Initialize sections from assessment data
        if (assessmentData.sections) {
          setSections(assessmentData.sections);
        } else {
          // Create a default section if none exists
          setSections([{
            id: "default",
            name: "Default Section",
            questions: []
          }]);
        }
        
        // Fetch all available questions
        const questionsRes = await fetch("/api/questions");
        if (!questionsRes.ok) throw new Error("Failed to fetch questions");
        const questionsData = await questionsRes.json();
        
        // Ensure questionsData is an array
        const questions = Array.isArray(questionsData) ? questionsData : [];
        setAvailableQuestions(questions);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load questions data");
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [params.id]);
  
  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch(`/api/assessments/${params.id}/questions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ sections }),
      });
      
      if (!response.ok) {
        throw new Error("Failed to save questions");
      }
      
      toast.success("Questions updated successfully");
      router.push(`/admin/assessments/${params.id}`);
    } catch (error) {
      console.error("Error saving questions:", error);
      toast.error("Failed to save questions");
    } finally {
      setSaving(false);
    }
  };

  const addSection = () => {
    if (!newSectionName.trim()) {
      toast.error("Section name is required");
      return;
    }

    const newSection: Section = {
      id: `section-${Date.now()}`,
      name: newSectionName.trim(),
      questions: []
    };

    setSections([...sections, newSection]);
    setNewSectionName("");
  };

  const removeSection = (sectionId: string) => {
    setSections(sections.filter(section => section.id !== sectionId));
  };

  const toggleQuestion = (sectionId: string, questionId: string) => {
    setSections(sections.map(section => {
      if (section.id === sectionId) {
        const questions = section.questions.includes(questionId)
          ? section.questions.filter(id => id !== questionId)
          : [...section.questions, questionId];
        return { ...section, questions };
      }
      return section;
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
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Save Changes
          </Button>
        </div>
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
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeSection(section.id)}
                className="ml-2"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            <AccordionContent>
              <Card>
                <CardContent className="pt-6">
                  {availableQuestions.length === 0 ? (
                    <p className="text-center py-4 text-muted-foreground">
                      No questions available. Please create questions first.
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {availableQuestions.map((question) => (
                        <div
                          key={question.id}
                          className="flex items-start space-x-3 p-3 border rounded-md"
                        >
                          <Checkbox
                            id={`question-${section.id}-${question.id}`}
                            checked={section.questions.includes(question.id)}
                            onCheckedChange={() => toggleQuestion(section.id, question.id)}
                          />
                          <div className="grid gap-1">
                            <label
                              htmlFor={`question-${section.id}-${question.id}`}
                              className="font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                              {question.name}
                            </label>
                            <p className="text-sm text-muted-foreground">
                              {question.description?.substring(0, 100)}
                              {question.description?.length > 100 ? '...' : ''}
                            </p>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                {question.difficulty}
                              </span>
                              <span className="bg-green-100 text-green-800 px-2 py-1 rounded">
                                {question.marks} marks
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
} 