"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Plus, Trash2, Clock, Save, AlertTriangle } from "lucide-react";
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
import { Skeleton } from "@/components/ui/skeleton";

interface Question {
  id: string;
  name: string;
  type: string;
  difficulty: string;
  marks: number;
}

interface Assessment {
  id: string;
  title: string;
  description: string;
  timeLimit: number;
  passingPercentage: number;
  type: string;
  status: string;
  courseId: string;
  questionIds: string[];
  isPublished: boolean;
}

interface PageProps {
  params: {
    id: string;
  };
}

export default function EditAssessmentPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([]);
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  
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
  
  // Fetch assessment data
  useEffect(() => {
    const fetchAssessment = async () => {
      try {
        setIsLoading(true);
        // In a real app, you would fetch the assessment data from your API
        // const response = await fetch(`/api/assessments/${id}`);
        // const data = await response.json();
        
        // Simulate API call with mock data
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const mockAssessment: Assessment = {
          id: id,
          title: "JavaScript Fundamentals Quiz",
          description: "Test your knowledge of JavaScript basics including variables, functions, and control flow.",
          timeLimit: 60,
          passingPercentage: 70,
          type: "quiz",
          status: "Active",
          courseId: "2",
          questionIds: ["1", "2", "3"],
          isPublished: true
        };
        
        setAssessment(mockAssessment);
        setSelectedQuestions(mockAssessment.questionIds);
      } catch (error) {
        toast("Failed to load assessment", {
          description: "Please try again later."
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchAssessment();
  }, [id]);
  
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
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedQuestions.length === 0) {
      toast("Please select at least one question", {
        description: "An assessment must contain at least one question."
      });
      return;
    }
    
    setIsSaving(true);
    
    try {
      // In a real app, you would send this data to your API
      // const response = await fetch(`/api/assessments/${id}`, {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(formData)
      // });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast("Assessment updated successfully");
      router.push("/admin/assessments");
    } catch (error) {
      toast("Failed to update assessment", {
        description: "Please try again later."
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleCancel = () => {
    if (isSaving) return;
    setShowConfirmDialog(true);
  };
  
  if (isLoading) {
    return (
      <div className="p-6 space-y-6 container max-w-5xl">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-96" />
          </div>
          <Skeleton className="h-9 w-40" />
        </div>
        
        <div className="space-y-8">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-72" />
            </CardHeader>
            <CardContent className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-64" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-[300px] w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }
  
  if (!assessment) {
    return (
      <div className="p-6 space-y-6 container max-w-5xl">
        <div className="flex items-center justify-center py-12">
          <div className="text-center space-y-4">
            <AlertTriangle className="mx-auto h-12 w-12 text-amber-500" />
            <h2 className="text-2xl font-bold">Assessment Not Found</h2>
            <p className="text-muted-foreground">
              The assessment you're looking for doesn't exist or has been removed.
            </p>
            <Button 
              onClick={() => router.push("/admin/assessments")}
              type="button"
            >
              Back to Assessments
            </Button>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="p-6 space-y-6 container max-w-5xl">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">Edit Assessment</h1>
          <p className="text-muted-foreground">
            Update the details and questions for this assessment
          </p>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => router.push("/admin/assessments")}
          type="button"
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
                  defaultValue={assessment.title}
                  placeholder="e.g., JavaScript Fundamentals Quiz" 
                  required 
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="course">Course</Label>
                <Select defaultValue={assessment.courseId} required>
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
                defaultValue={assessment.description}
                placeholder="Describe the purpose and content of this assessment"
                rows={3}
              />
            </div>
            
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="time-limit">Time Limit (minutes)</Label>
                <div className="relative">
                  <Clock className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="time-limit"
                    type="number"
                    defaultValue={assessment.timeLimit}
                    min="1"
                    placeholder="60"
                    className="pl-9"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="passing-percentage">Passing Percentage</Label>
                <div className="relative">
                  <Input
                    id="passing-percentage"
                    type="number"
                    defaultValue={assessment.passingPercentage}
                    min="1"
                    max="100"
                    placeholder="70"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="assessment-type">Assessment Type</Label>
                <Select defaultValue={assessment.type} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="quiz">Quiz</SelectItem>
                    <SelectItem value="coding">Coding</SelectItem>
                    <SelectItem value="mixed">Mixed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 pt-2">
              <Checkbox 
                id="publish" 
                defaultChecked={assessment.isPublished} 
              />
              <Label htmlFor="publish">Published</Label>
            </div>
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
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={isSaving}
          >
            {isSaving ? "Saving..." : "Save Changes"}
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