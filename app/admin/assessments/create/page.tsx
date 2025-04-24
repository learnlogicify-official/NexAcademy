"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Plus, Clock, Info, Calendar } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Switch } from "@/components/ui/switch";

interface Question {
  id: string;
  name: string;
  type: string;
  difficulty: string;
  marks: number;
}

interface Section {
  id?: string;
  title: string;
  description?: string;
  order: number;
}

// Define enum values to match the database
const AssessmentType = {
  SEQUENCE: "SEQUENCE",
  FREE: "FREE"
} as const;

const AssessmentMode = {
  WEB_PROCTORED: "WEB_PROCTORED",
  NOT_WEB_PROCTORED: "NOT_WEB_PROCTORED"
} as const;

const AssessmentAttemptType = {
  LIMITED: "LIMITED",
  UNLIMITED: "UNLIMITED"
} as const;

const AssessmentStatus = {
  DRAFT: "DRAFT",
  PUBLISHED: "PUBLISHED",
  ARCHIVED: "ARCHIVED"
} as const;

export default function CreateAssessmentPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([]);
  const [sections, setSections] = useState<Section[]>([
    { title: "Section 1", description: "", order: 1 }
  ]);
  
  // Assessment settings states
  const [assessmentType, setAssessmentType] = useState<string>(AssessmentType.SEQUENCE);
  const [assessmentMode, setAssessmentMode] = useState<string>(AssessmentMode.NOT_WEB_PROCTORED);
  const [attemptType, setAttemptType] = useState<string>(AssessmentAttemptType.LIMITED);
  const [attemptCount, setAttemptCount] = useState(1);
  const [enableSEB, setEnableSEB] = useState(false);
  const [disableCopyPaste, setDisableCopyPaste] = useState(false);
  const [disableRightClick, setDisableRightClick] = useState(false);
  
  // Mock data - in a real app, you would fetch this from an API
  const courses = [
    { id: "1", name: "Introduction to Web Development" },
    { id: "2", name: "JavaScript Fundamentals" },
    { id: "3", name: "React Essentials" },
    { id: "4", name: "Node.js Backend Development" },
  ];
  
  const questions: Question[] = [
    { id: "1", name: "JavaScript Variables", type: "MCQ", difficulty: "Easy", marks: 5 },
    { id: "2", name: "CSS Flexbox", type: "MCQ", difficulty: "Medium", marks: 10 },
    { id: "3", name: "React Hooks", type: "MCQ", difficulty: "Hard", marks: 15 },
    { id: "4", name: "Array Manipulation", type: "Coding", difficulty: "Medium", marks: 20 },
    { id: "5", name: "DOM Manipulation", type: "Coding", difficulty: "Hard", marks: 25 },
  ];
  
  const handleSelectAllQuestions = () => {
    if (selectedQuestions.length === questions.length) {
      setSelectedQuestions([]);
    } else {
      setSelectedQuestions(questions.map(q => q.id));
    }
  };
  
  const handleSelectQuestion = (id: string) => {
    if (selectedQuestions.includes(id)) {
      setSelectedQuestions(selectedQuestions.filter(qId => qId !== id));
    } else {
      setSelectedQuestions([...selectedQuestions, id]);
    }
  };
  
  const calculateTotalMarks = () => {
    return questions
      .filter(q => selectedQuestions.includes(q.id))
      .reduce((sum, q) => sum + q.marks, 0);
  };
  
  const handleAddSection = () => {
    setSections([
      ...sections,
      {
        title: `Section ${sections.length + 1}`,
        description: "",
        order: sections.length + 1
      }
    ]);
  };
  
  const handleUpdateSection = (index: number, field: keyof Section, value: string | number) => {
    const updatedSections = [...sections];
    updatedSections[index] = { ...updatedSections[index], [field]: value };
    setSections(updatedSections);
  };
  
  const handleRemoveSection = (index: number) => {
    if (sections.length === 1) {
      toast("Cannot remove the only section", {
        description: "An assessment must have at least one section."
      });
      return;
    }
    
    const updatedSections = sections.filter((_, i) => i !== index);
    // Update order for remaining sections
    updatedSections.forEach((section, i) => {
      section.order = i + 1;
    });
    setSections(updatedSections);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedQuestions.length === 0) {
      toast("Please select at least one question", {
        description: "An assessment must contain at least one question."
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Prepare form data
      const formElement = e.target as HTMLFormElement;
      const formData = {
        name: formElement.elements.namedItem("title") instanceof HTMLInputElement 
          ? (formElement.elements.namedItem("title") as HTMLInputElement).value 
          : "",
        description: formElement.elements.namedItem("description") instanceof HTMLTextAreaElement 
          ? (formElement.elements.namedItem("description") as HTMLTextAreaElement).value 
          : "",
        startDate: formElement.elements.namedItem("start-date") instanceof HTMLInputElement 
          ? (formElement.elements.namedItem("start-date") as HTMLInputElement).value 
          : "",
        endDate: formElement.elements.namedItem("end-date") instanceof HTMLInputElement 
          ? (formElement.elements.namedItem("end-date") as HTMLInputElement).value 
          : "",
        duration: formElement.elements.namedItem("time-limit") instanceof HTMLInputElement 
          ? parseInt((formElement.elements.namedItem("time-limit") as HTMLInputElement).value) 
          : 60,
        totalMarks: calculateTotalMarks(),
        passingMarks: formElement.elements.namedItem("passing-percentage") instanceof HTMLInputElement 
          ? parseInt((formElement.elements.namedItem("passing-percentage") as HTMLInputElement).value) 
          : 70,
        status: AssessmentStatus.DRAFT, // Default to draft
        folderId: "some-folder-id", // This would be selected in a real implementation
        
        // Settings
        type: assessmentType,
        mode: assessmentMode,
        attemptType: attemptType,
        attemptCount: attemptType === AssessmentAttemptType.LIMITED ? attemptCount : null,
        enableSEB,
        disableCopyPaste,
        disableRightClick,
        
        // Questions and Sections
        questions: questions
          .filter(q => selectedQuestions.includes(q.id))
          .map((q, index) => ({
            questionId: q.id,
            marks: q.marks,
            order: index + 1,
            // Add section ID based on selection in UI
          })),
        sections: sections
      };
      
      // In a real app, you would send this data to your API
      const response = await fetch('/api/assessments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to create assessment");
      }
      
      toast("Assessment created successfully");
      router.push("/admin/assessments");
    } catch (error) {
      toast("Failed to create assessment", {
        description: error instanceof Error ? error.message : "Please try again later."
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleCancel = () => {
    if (isSubmitting) return;
    setShowConfirmDialog(true);
  };
  
  return (
    <div className="p-6 space-y-6 container max-w-5xl">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">Create Assessment</h1>
          <p className="text-muted-foreground">
            Create a new assessment for your students
          </p>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          type="button"
          onClick={() => router.push("/admin/assessments")}
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back to Assessments
        </Button>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Assessment Details</CardTitle>
            <CardDescription>
              Basic information about the assessment
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input 
                  id="title" 
                  placeholder="e.g., JavaScript Fundamentals Quiz" 
                  required 
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="course">Course</Label>
                <Select required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a course" />
                  </SelectTrigger>
                  <SelectContent>
                    {courses.map(course => (
                      <SelectItem key={course.id} value={course.id}>
                        {course.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea 
                id="description" 
                placeholder="Describe the purpose and content of this assessment"
                rows={3}
              />
            </div>
            
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="start-date">Start Date and Time</Label>
                <div className="relative">
                  <Calendar className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="start-date"
                    type="datetime-local"
                    className="pl-9"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="end-date">End Date and Time</Label>
                <div className="relative">
                  <Calendar className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="end-date"
                    type="datetime-local"
                    className="pl-9"
                    required
                  />
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="time-limit">Time Limit (minutes)</Label>
                <div className="relative">
                  <Clock className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="time-limit"
                    type="number"
                    min="1"
                    placeholder="60"
                    className="pl-9"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="passing-percentage">Passing Percentage</Label>
                <div className="relative">
                  <Input
                    id="passing-percentage"
                    type="number"
                    min="1"
                    max="100"
                    placeholder="70"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="assessment-type">Assessment Type</Label>
                <Select 
                  required 
                  onValueChange={(value) => setAssessmentType(value)}
                  defaultValue={assessmentType}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={AssessmentType.SEQUENCE}>Sequence</SelectItem>
                    <SelectItem value={AssessmentType.FREE}>Free Navigation</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Advanced Settings</CardTitle>
            <CardDescription>
              Configure additional options for this assessment
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="assessment-mode">Assessment Mode</Label>
                <Select 
                  required 
                  onValueChange={(value) => setAssessmentMode(value)}
                  defaultValue={assessmentMode}
                >
                  <SelectTrigger id="assessment-mode">
                    <SelectValue placeholder="Select mode" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={AssessmentMode.WEB_PROCTORED}>Web Proctored</SelectItem>
                    <SelectItem value={AssessmentMode.NOT_WEB_PROCTORED}>Non-Web Proctored</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="attempt-type">Attempt Type</Label>
                <Select 
                  required 
                  onValueChange={(value) => setAttemptType(value)}
                  defaultValue={attemptType}
                >
                  <SelectTrigger id="attempt-type">
                    <SelectValue placeholder="Select attempt type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={AssessmentAttemptType.LIMITED}>Limited</SelectItem>
                    <SelectItem value={AssessmentAttemptType.UNLIMITED}>Unlimited</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {attemptType === AssessmentAttemptType.LIMITED && (
              <div className="space-y-2">
                <Label htmlFor="attempt-count">Number of Attempts</Label>
                <Select 
                  required 
                  onValueChange={(value) => setAttemptCount(parseInt(value))}
                  defaultValue={attemptCount.toString()}
                >
                  <SelectTrigger id="attempt-count">
                    <SelectValue placeholder="Select number of attempts" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1</SelectItem>
                    <SelectItem value="2">2</SelectItem>
                    <SelectItem value="3">3</SelectItem>
                    <SelectItem value="5">5</SelectItem>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="15">15</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
            
            <Separator />
            
            <div className="space-y-4">
              <h3 className="text-sm font-medium">Security Options</h3>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="copy-paste">Disable Copy-Paste</Label>
                  <p className="text-sm text-muted-foreground">
                    Prevent students from copying and pasting content
                  </p>
                </div>
                <Switch 
                  id="copy-paste" 
                  checked={disableCopyPaste} 
                  onCheckedChange={setDisableCopyPaste}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="right-click">Disable Right-Click</Label>
                  <p className="text-sm text-muted-foreground">
                    Prevent students from using right-click context menu
                  </p>
                </div>
                <Switch 
                  id="right-click" 
                  checked={disableRightClick} 
                  onCheckedChange={setDisableRightClick}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="seb">Enable Safe Exam Browser</Label>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="w-80">
                            Safe Exam Browser (SEB) is a locked-down browser
                            that prevents students from accessing unauthorized
                            resources during an exam.
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Require students to use Safe Exam Browser
                  </p>
                </div>
                <Switch 
                  id="seb" 
                  checked={enableSEB} 
                  onCheckedChange={setEnableSEB}
                />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Sections</CardTitle>
                <CardDescription>
                  Organize your assessment into sections
                </CardDescription>
              </div>
              <Button 
                type="button" 
                variant="outline" 
                size="sm"
                onClick={handleAddSection}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Section
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Accordion type="multiple" defaultValue={["section-0"]}>
              {sections.map((section, index) => (
                <AccordionItem key={index} value={`section-${index}`}>
                  <AccordionTrigger>
                    <div className="flex items-center">
                      <span>{section.title}</span>
                      {sections.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="ml-2 h-7 w-7"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveSection(index);
                          }}
                        >
                          <Plus className="h-4 w-4 rotate-45" />
                        </Button>
                      )}
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-4 pt-2">
                      <div className="space-y-2">
                        <Label htmlFor={`section-title-${index}`}>Section Title</Label>
                        <Input
                          id={`section-title-${index}`}
                          value={section.title}
                          onChange={(e) => handleUpdateSection(index, "title", e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`section-description-${index}`}>Section Description</Label>
                        <Textarea
                          id={`section-description-${index}`}
                          value={section.description || ""}
                          onChange={(e) => handleUpdateSection(index, "description", e.target.value)}
                          rows={3}
                        />
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Questions</CardTitle>
            <CardDescription>
              Select questions to include in this assessment
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="all">
              <div className="flex justify-between items-center mb-4">
                <TabsList>
                  <TabsTrigger value="all">All Questions</TabsTrigger>
                  <TabsTrigger value="mcq">Multiple Choice</TabsTrigger>
                  <TabsTrigger value="coding">Coding</TabsTrigger>
                </TabsList>
                
                <div className="flex items-center gap-2">
                  <div className="text-sm text-muted-foreground">
                    {selectedQuestions.length} selected | Total marks: {calculateTotalMarks()}
                  </div>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm"
                    onClick={() => router.push("/admin/questions")}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Create Question
                  </Button>
                </div>
              </div>
              
              <TabsContent value="all" className="m-0">
                <div className="border rounded-md">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">
                          <Checkbox 
                            checked={selectedQuestions.length === questions.length && questions.length > 0}
                            onCheckedChange={handleSelectAllQuestions}
                          />
                        </TableHead>
                        <TableHead>Question</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Difficulty</TableHead>
                        <TableHead>Marks</TableHead>
                        <TableHead>Section</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {questions.map(question => (
                        <TableRow key={question.id}>
                          <TableCell>
                            <Checkbox 
                              checked={selectedQuestions.includes(question.id)}
                              onCheckedChange={() => handleSelectQuestion(question.id)}
                            />
                          </TableCell>
                          <TableCell>{question.name}</TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {question.type}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={
                              question.difficulty === "Easy" ? "outline" : 
                              question.difficulty === "Medium" ? "secondary" : 
                              "default"
                            }>
                              {question.difficulty}
                            </Badge>
                          </TableCell>
                          <TableCell>{question.marks}</TableCell>
                          <TableCell>
                            <Select defaultValue="0">
                              <SelectTrigger className="w-32">
                                <SelectValue placeholder="Select section" />
                              </SelectTrigger>
                              <SelectContent>
                                {sections.map((section, index) => (
                                  <SelectItem key={index} value={index.toString()}>
                                    {section.title}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>
              
              <TabsContent value="mcq" className="m-0">
                <div className="border rounded-md">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">
                          <Checkbox />
                        </TableHead>
                        <TableHead>Question</TableHead>
                        <TableHead>Difficulty</TableHead>
                        <TableHead>Marks</TableHead>
                        <TableHead>Section</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {questions
                        .filter(q => q.type === "MCQ")
                        .map(question => (
                          <TableRow key={question.id}>
                            <TableCell>
                              <Checkbox 
                                checked={selectedQuestions.includes(question.id)}
                                onCheckedChange={() => handleSelectQuestion(question.id)}
                              />
                            </TableCell>
                            <TableCell>{question.name}</TableCell>
                            <TableCell>
                              <Badge variant={
                                question.difficulty === "Easy" ? "outline" : 
                                question.difficulty === "Medium" ? "secondary" : 
                                "default"
                              }>
                                {question.difficulty}
                              </Badge>
                            </TableCell>
                            <TableCell>{question.marks}</TableCell>
                            <TableCell>
                              <Select defaultValue="0">
                                <SelectTrigger className="w-32">
                                  <SelectValue placeholder="Select section" />
                                </SelectTrigger>
                                <SelectContent>
                                  {sections.map((section, index) => (
                                    <SelectItem key={index} value={index.toString()}>
                                      {section.title}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>
              
              <TabsContent value="coding" className="m-0">
                <div className="border rounded-md">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">
                          <Checkbox />
                        </TableHead>
                        <TableHead>Question</TableHead>
                        <TableHead>Difficulty</TableHead>
                        <TableHead>Marks</TableHead>
                        <TableHead>Section</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {questions
                        .filter(q => q.type === "Coding")
                        .map(question => (
                          <TableRow key={question.id}>
                            <TableCell>
                              <Checkbox 
                                checked={selectedQuestions.includes(question.id)}
                                onCheckedChange={() => handleSelectQuestion(question.id)}
                              />
                            </TableCell>
                            <TableCell>{question.name}</TableCell>
                            <TableCell>
                              <Badge variant={
                                question.difficulty === "Easy" ? "outline" : 
                                question.difficulty === "Medium" ? "secondary" : 
                                "default"
                              }>
                                {question.difficulty}
                              </Badge>
                            </TableCell>
                            <TableCell>{question.marks}</TableCell>
                            <TableCell>
                              <Select defaultValue="0">
                                <SelectTrigger className="w-32">
                                  <SelectValue placeholder="Select section" />
                                </SelectTrigger>
                                <SelectContent>
                                  {sections.map((section, index) => (
                                    <SelectItem key={index} value={index.toString()}>
                                      {section.title}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
        
        <div className="flex justify-end gap-4">
          <Button 
            type="button" 
            variant="outline" 
            onClick={handleCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={isSubmitting}
          >
            {isSubmitting ? "Creating..." : "Create Assessment"}
          </Button>
        </div>
      </form>
      
      {/* Confirmation Dialog */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Discard changes?</AlertDialogTitle>
            <AlertDialogDescription>
              Any unsaved changes will be lost. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Continue Editing</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => router.push("/admin/assessments")}
              className="bg-destructive text-destructive-foreground"
              type="button"
            >
              Discard Changes
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
} 